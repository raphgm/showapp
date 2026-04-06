import { useRef, useEffect, useCallback, useState, type RefObject } from 'react';

/**
 * Virtual Background Engine
 * Uses MediaPipe SelfieSegmentation (CDN) for real-time person segmentation,
 * compositing the person on top of a chosen background (image, gradient, or blur).
 */

// CDN URLs for MediaPipe
const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747';

interface VirtualBgOptions {
  /** The active background config, or null if no virtual background */
  background: {
    url?: string;
    gradient?: string;
    blurAmount?: number;
  } | null;
  /** Whether the camera is off */
  isCamOff: boolean;
  /** CSS filter string for face enhancements */
  faceFilter?: string;
  /** Mirror the output horizontally */
  mirror?: boolean;
}

interface VirtualBgReturn {
  /** Ref to attach to the hidden <video> element for webcam input */
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Ref to attach to the visible <canvas> element for composited output */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** Whether the segmentation model has loaded */
  isModelLoaded: boolean;
  /** Whether segmentation is actively running */
  isProcessing: boolean;
}

// Cache the loaded segmentation module at module scope
let selfieSegmentationInstance: any = null;
let modelLoadPromise: Promise<void> | null = null;

function loadMediaPipeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).SelfieSegmentation) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `${MEDIAPIPE_CDN}/selfie_segmentation.js`;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load MediaPipe SelfieSegmentation'));
    document.head.appendChild(script);
  });
}

async function initSegmentation(onResults: (results: any) => void): Promise<any> {
  await loadMediaPipeScript();

  const SelfieSegmentation = (window as any).SelfieSegmentation;
  if (!SelfieSegmentation) {
    throw new Error('SelfieSegmentation not available on window');
  }

  const seg = new SelfieSegmentation({
    locateFile: (file: string) => `${MEDIAPIPE_CDN}/${file}`,
  });

  seg.setOptions({
    modelSelection: 1, // 1 = landscape (more accurate), 0 = general
    selfieMode: true,
  });

  seg.onResults(onResults);
  await seg.initialize();

  return seg;
}

export function useVirtualBackground(options: VirtualBgOptions): VirtualBgReturn {
  const { background, isCamOff, faceFilter, mirror = true } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animFrameRef = useRef<number>(0);
  const segRef = useRef<any>(null);
  const latestMaskRef = useRef<ImageBitmap | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const bgUrlRef = useRef<string>('');

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Preload background image when URL changes
  useEffect(() => {
    if (background?.url && background.url !== bgUrlRef.current) {
      bgUrlRef.current = background.url;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = background.url;
      img.onload = () => {
        bgImageRef.current = img;
      };
    } else if (!background?.url) {
      bgImageRef.current = null;
      bgUrlRef.current = '';
    }
  }, [background?.url]);

  // Handle segmentation results (called by MediaPipe)
  const onSegResults = useCallback((results: any) => {
    if (results.segmentationMask) {
      // Store the mask for use in the render loop
      createImageBitmap(results.segmentationMask).then(bmp => {
        latestMaskRef.current?.close();
        latestMaskRef.current = bmp;
      }).catch(() => {});
    }
  }, []);

  // Initialize or tear down segmentation model based on whether a background is active
  useEffect(() => {
    if (!background || isCamOff) {
      // No background selected or cam is off — no need for segmentation
      return;
    }

    let cancelled = false;

    const setup = async () => {
      try {
        if (!selfieSegmentationInstance) {
          if (!modelLoadPromise) {
            modelLoadPromise = (async () => {
              selfieSegmentationInstance = await initSegmentation(onSegResults);
            })();
          }
          await modelLoadPromise;
        } else {
          // Re-bind results callback
          selfieSegmentationInstance.onResults(onSegResults);
        }

        if (!cancelled) {
          segRef.current = selfieSegmentationInstance;
          setIsModelLoaded(true);
        }
      } catch (err) {
        console.warn('Virtual background: MediaPipe initialization failed, falling back to CSS approach', err);
        setIsModelLoaded(false);
      }
    };

    setup();

    return () => {
      cancelled = true;
    };
  }, [!!background, isCamOff, onSegResults]);

  // Render loop
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;
    ctxRef.current = ctx;

    let lastSendTime = 0;
    const SEGMENTATION_INTERVAL = 100; // Send frame every 100ms (10fps for segmentation)
    let running = true;

    const renderFrame = async (timestamp: number) => {
      if (!running) return;

      if (video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      // Match canvas size to video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
      }

      const w = canvas.width;
      const h = canvas.height;

      ctx.save();

      // Mirror if needed
      if (mirror) {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }

      if (background && !isCamOff) {
        // Send frame to segmentation model periodically
        if (segRef.current && timestamp - lastSendTime > SEGMENTATION_INTERVAL) {
          lastSendTime = timestamp;
          try {
            await segRef.current.send({ image: video });
          } catch { /* frame dropped, continue */ }
        }

        const mask = latestMaskRef.current;

        if (mask) {
          // ── STEP 1: Draw background ──
          if (background.blurAmount) {
            // Blur type: draw the video frame with blur filter as the background
            ctx.filter = `blur(${background.blurAmount}px)`;
            ctx.drawImage(video, 0, 0, w, h);
            ctx.filter = 'none';
          } else if (background.url && bgImageRef.current) {
            // Image background
            ctx.drawImage(bgImageRef.current, 0, 0, w, h);
          } else if (background.gradient) {
            // Gradient background — parse and draw
            ctx.save();
            if (mirror) {
              // Undo mirror for gradient rendering
              ctx.scale(-1, 1);
              ctx.translate(-w, 0);
            }
            const grad = ctx.createLinearGradient(0, 0, w, h);
            // Extract colors from the gradient string
            const colors = background.gradient.match(/#[0-9a-fA-F]{6}/g) || ['#1e1b4b', '#312e81', '#4c1d95'];
            const stops = [0, 0.5, 1];
            colors.forEach((c, i) => {
              grad.addColorStop(stops[Math.min(i, stops.length - 1)], c);
            });
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
          } else {
            // Fallback: dark background
            ctx.fillStyle = '#18181b';
            ctx.fillRect(0, 0, w, h);
          }

          // ── STEP 2: Use mask to composite person on top ──
          // Draw the mask into a temp canvas to create a clipping mask
          ctx.save();
          ctx.globalCompositeOperation = 'destination-in';
          // The mask from MediaPipe: white = person, black = background
          // We want to KEEP the background we just drew where the mask is BLACK (no person)
          // So we actually need the inverse: keep where mask is black
          // Let's re-approach: draw person with mask

          ctx.restore();

          // Better approach: 
          // 1. We already drew the background
          // 2. Now draw the person using the mask as alpha
          ctx.save();
          
          // Create an offscreen canvas for the person cutout
          const offscreen = document.createElement('canvas');
          offscreen.width = w;
          offscreen.height = h;
          const offCtx = offscreen.getContext('2d');
          if (offCtx) {
            // Draw the person (video frame)
            if (mirror) {
              offCtx.translate(w, 0);
              offCtx.scale(-1, 1);
            }
            // Apply face filter to person layer
            if (faceFilter && faceFilter !== 'none') {
              offCtx.filter = faceFilter;
            }
            offCtx.drawImage(video, 0, 0, w, h);
            offCtx.filter = 'none';
            
            // Reset transform for mask
            offCtx.setTransform(1, 0, 0, 1, 0, 0);

            // Apply mask: keep only person pixels
            offCtx.globalCompositeOperation = 'destination-in';
            offCtx.drawImage(mask, 0, 0, w, h);
          }

          // Reset main canvas transform for compositing
          ctx.restore();
          ctx.save();
          // Draw the person cutout on top of the background
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.drawImage(offscreen, 0, 0, w, h);
          ctx.restore();
        } else {
          // No mask yet (model still loading) — draw video with face filter
          if (faceFilter && faceFilter !== 'none') {
            ctx.filter = faceFilter;
          }
          ctx.drawImage(video, 0, 0, w, h);
          ctx.filter = 'none';
        }
      } else if (!isCamOff) {
        // No virtual background — just draw the video with face filter
        if (faceFilter && faceFilter !== 'none') {
          ctx.filter = faceFilter;
        }
        ctx.drawImage(video, 0, 0, w, h);
        ctx.filter = 'none';
      } else {
        // Camera off — clear to dark
        if (mirror) {
          ctx.scale(-1, 1);
          ctx.translate(-w, 0);
        }
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();

      if (!isProcessing && background) {
        setIsProcessing(true);
      }

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      running = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [background, isCamOff, mirror, faceFilter, isModelLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      latestMaskRef.current?.close();
      latestMaskRef.current = null;
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isModelLoaded,
    isProcessing,
  };
}
