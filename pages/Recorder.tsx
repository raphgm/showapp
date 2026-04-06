
import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Mic, MicOff, Monitor, Square, X, Video, VideoOff, Loader2, MousePointer2,
  Settings2, Settings, Play, Check, RefreshCw, BrainCircuit, RotateCcw,
  Trash2, Minimize2, Maximize2, Palette, Layout, User, Code,
  Layers, AppWindow, UserCircle, Terminal, FileCode, PlayCircle,
  Hash, ChevronRight, Activity, Cpu, Play as PlayIcon, Share2,
  Globe, Send, PenTool, Eraser, Move, FileText, Pause, Ghost, HelpCircle
} from 'lucide-react';
import { generateVideoInsightsFromFrames, analyzeCode } from '../services/geminiService';
import { Video as VideoType, CodeSnippet } from '../types';
import ShareModal from '../components/ShareModal';

declare const Prism: any;

interface RecorderProps {
  isMinimized?: boolean;
  onClose: () => void;
  onSave: (video: VideoType) => void;
  onRecordingStatusChange?: (isRecording: boolean) => void;
}

type Scene = 'standard' | 'interview' | 'code' | 'presenter';

const scenes = [
  { id: 'standard', label: 'Standard', icon: Layout },
  { id: 'interview', label: 'Interview', icon: User },
  { id: 'code', label: 'Code Lab', icon: Code },
  { id: 'presenter', label: 'Presenter', icon: AppWindow },
];

const MOCK_CODE = `/** 
 * SHOW_SYSTEM_CORE v2.4.0
 * Initialize Neural Video Pipeline
 */

async function startProduction(hubId: string) {
  console.log(\`Establishing Hub :: \${hubId}\`);
  
  const studio = await Studio.init({
    resolution: "4K_ULTRA",
    mastering: "ACTIVE"
  });

  // Start the Show Genius AI indexer
  const genius = studio.deployGenius();
  
  return studio.onAir();
}

// Deploy to Production Hub
startProduction("LAB_BETA_01");`;

async function extractFrames(videoUrl: string, frameCount: number): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const duration = video.duration;
      if (duration === 0) {
        resolve([]);
        return;
      }
      let framesExtracted = 0;

      const seekAndCapture = (time: number) => {
        video.currentTime = time;
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          frames.push(canvas.toDataURL('image/jpeg'));
          framesExtracted++;

          if (framesExtracted >= frameCount) {
            video.src = ''; // Release resource
            resolve(frames);
          } else {
            const nextTime = (duration / (frameCount + 1)) * (framesExtracted + 1);
            if (nextTime <= video.duration) {
              seekAndCapture(nextTime);
            } else {
              video.src = '';
              resolve(frames); // Failsafe
            }
          }
        }
      };

      video.onerror = (e) => reject("Error loading video for frame extraction");

      // Start the process
      seekAndCapture(duration / (frameCount + 1));
    };

    video.onerror = (e) => reject("Error loading video metadata");
  });
}

const Recorder: React.FC<RecorderProps> = ({ isMinimized, onClose, onSave, onRecordingStatusChange }) => {
  const [step, setStep] = useState<'setup' | 'recording' | 'preview' | 'processing'>('setup');
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeScene, setActiveScene] = useState<Scene>('standard');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isGhostMode = isMinimized && step === 'recording';

  // Drawing / Telestrator State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawColor, setDrawColor] = useState('#F43F5E'); // Default Rose/Red
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number, y: number } | null>(null);

  // Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resizing
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 6;
        ctx.shadowBlur = 10;
        ctx.shadowColor = drawColor;
      }
    };

    // Initial resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [step, activeScene]);

  // Update stroke style when color changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = drawColor;
      ctx.shadowColor = drawColor;
    }
  }, [drawColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    lastPos.current = { x, y };

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Teleprompter State
  const [showPrompter, setShowPrompter] = useState(false);
  const [prompterText, setPrompterText] = useState("Welcome to the Show!\n\nThis is your teleprompter.\n\nType your script here and it will scroll automatically while you record.\n\nGreat for:\n- Tutorials\n- Announcements\n- Pitching ideas");
  const [prompterSpeed, setPrompterSpeed] = useState(1);
  const [isPrompterPlaying, setIsPrompterPlaying] = useState(false);
  const prompterRef = useRef<HTMLTextAreaElement>(null);

  // Teleprompter Scroll Logic
  useEffect(() => {
    let interval: any;
    if (isPrompterPlaying && prompterRef.current) {
      interval = setInterval(() => {
        if (prompterRef.current) {
          // Stop at bottom
          if (prompterRef.current.scrollTop + prompterRef.current.clientHeight >= prompterRef.current.scrollHeight) {
            setIsPrompterPlaying(false);
            return;
          }
          prompterRef.current.scrollTop += 1;
        }
      }, 100 / prompterSpeed); // Speed controls interval duration
    }
    return () => clearInterval(interval);
  }, [isPrompterPlaying, prompterSpeed]);

  // Click Animation State
  const [ripples, setRipples] = useState<{ x: number, y: number, id: number }[]>([]);
  const addRipple = (e: React.MouseEvent) => {
    if (isDrawingMode) return;
    const newRipple = { x: e.clientX, y: e.clientY, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 800);
  };

  // Real Code Lab State
  const [codeValue, setCodeValue] = useState(MOCK_CODE);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['[SYS] READY. Awaiting code execution...']);
  const [isRunningCode, setIsRunningCode] = useState(false);

  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const camVideoRef = useRef<HTMLVideoElement>(null);
  const previewScreenRef = useRef<HTMLVideoElement>(null);
  const previewCamRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const compositorRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    let active = true;
    let currentStream: MediaStream | null = null;

    const initCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        currentStream = stream;
        setCamStream(stream);
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };

    initCam();

    return () => {
      active = false;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update Prism highlighting when code changes
  useEffect(() => {
    if (activeScene === 'code') {
      Prism.highlightAll();
    }
  }, [codeValue, activeScene]);

  // Sync Camera Stream (UI Video - dynamic)
  useEffect(() => {
    if (camStream && camVideoRef.current) {
      camVideoRef.current.srcObject = camStream;
    }
  }, [camStream, step, activeScene]);

  // Sync Screen Stream (MASTER & PREVIEW)
  useEffect(() => {
    if (screenStream && screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
        screenVideoRef.current.play().catch(() => { });
    }
    if (screenStream && previewScreenRef.current) {
        previewScreenRef.current.srcObject = screenStream;
        previewScreenRef.current.play().catch(() => { });
    }
  }, [screenStream, activeScene, step]);

  // Sync Camera Stream (MASTER & PREVIEW)
  useEffect(() => {
    if (camStream && camVideoRef.current) {
      camVideoRef.current.srcObject = camStream;
      camVideoRef.current.play().catch(() => { });
    }
    if (camStream && previewCamRef.current) {
        previewCamRef.current.srcObject = camStream;
        previewCamRef.current.play().catch(() => { });
    }
  }, [camStream, activeScene, step]);

  const handleStartScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' },
        audio: true
      });
      setScreenStream(stream);
    } catch (err) { console.error(err); }
  };

  const runCodeLabAnalysis = async () => {
    setIsRunningCode(true);
    setTerminalOutput(prev => [...prev, '>> DEPLOYING_CODE_TO_GENIUS_NODE...']);
    const result = await analyzeCode(codeValue);
    setTerminalOutput(prev => [...prev, '[GENIUS] ANALYSIS COMPLETE:', result || 'Execution failed. Check syntax.']);
    setIsRunningCode(false);
  };

  // ─── Draggable Camera Bubble ─────────────────────────
  const [camBubblePos, setCamBubblePos] = useState({ x: 0, y: 0 }); // Offset from default bottom-right
  const [isDraggingBubble, setIsDraggingBubble] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const camBubblePosRef = useRef({ x: 0, y: 0 });
  useEffect(() => { camBubblePosRef.current = camBubblePos; }, [camBubblePos]);

  const handleBubbleDragStart = (e: React.MouseEvent) => {
    setIsDraggingBubble(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingBubble) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setCamBubblePos(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      dragStart.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => setIsDraggingBubble(false);
    
    if (isDraggingBubble) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingBubble]);

  // ─── Recording Engine State (Refs for loop consistency) ───
  const activeSceneRef = useRef(activeScene);
  const codeValueRef = useRef(codeValue);
  const terminalOutputRef = useRef(terminalOutput);
  const isCamOffRef = useRef(isCamOff);

  useEffect(() => { activeSceneRef.current = activeScene; }, [activeScene]);
  useEffect(() => { codeValueRef.current = codeValue; }, [codeValue]);
  useEffect(() => { terminalOutputRef.current = terminalOutput; }, [terminalOutput]);
  useEffect(() => { isCamOffRef.current = isCamOff; }, [isCamOff]);

  const startRecording = async () => {
    // 1. Prepare Compositor Canvas
    const canvas = compositorRef.current;
    if (!canvas) {
      console.error('❌ Canvas ref not found!');
      return;
    }

    const settings = screenStream?.getVideoTracks()[0]?.getSettings();
    canvas.width = settings?.width || 1920;
    canvas.height = settings?.height || 1080;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.error('❌ Canvas context not available!');
      return;
    }

    // 2. Clear canvas with initial background
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Robust Animation Loop (Heartbeat 30fps)
    const drawCompositor = () => {
      if (!ctx || !canvas) return;

      const getReadyVideo = (ref: React.RefObject<HTMLVideoElement>) => {
        // If it's in the DOM and has dimensions, it's ready for drawing
        if (ref.current && ref.current.videoWidth > 0) return ref.current;
        return null; // Don't draw if not ready
      };

      const screenVid = getReadyVideo(screenVideoRef);
      const camVid = getReadyVideo(camVideoRef);
      const mode = (activeSceneRef.current || 'standard').toString().trim().toLowerCase();

      // --- 1. Background Fill ---
      ctx.fillStyle = mode === 'code' ? '#0f111a' : '#222222';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- 2. Mode Drawing Logic ---
      switch (mode) {
        case 'interview':
          // INTERVIEW: 50/50 Split (Screen | Camera)
          if (screenVid) {
            ctx.drawImage(screenVid, 0, 0, canvas.width / 2, canvas.height);
          }
          if (!isCamOffRef.current && camVid) {
            ctx.save();
            ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
            ctx.drawImage(camVid, 0, 0, canvas.width / 2, canvas.height);
            ctx.restore();
            // Indigo Divider Line
            ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 12;
            ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
          }
          break;

        case 'code':
        case 'codelab':
          // CODE LAB: Black Background + Code + Camera Bubble
          ctx.fillStyle = '#0a0c14'; ctx.fillRect(0, 0, canvas.width, 100);
          ctx.fillStyle = '#4f46e5'; ctx.font = 'bold 30px Inter, sans-serif'; ctx.fillText('SHOW_STUDIO // CODE_LAB', 60, 65);
          ctx.fillStyle = '#1e1e2e'; ctx.fillRect(50, 150, canvas.width - 100, canvas.height - 400);
          ctx.fillStyle = '#94a3b8'; ctx.font = '24px JetBrains Mono, monospace';
          const codeLinesArr = (codeValueRef.current || '').split('\n');
          codeLinesArr.forEach((line, i) => { if (i < 20) { ctx.fillStyle = '#334155'; ctx.fillText((i + 1).toString(), 80, 210 + (i * 32)); ctx.fillStyle = '#e2e8f0'; ctx.fillText(line.substring(0, 80), 150, 210 + (i * 32)); } });
          if (!isCamOffRef.current && camVid) {
            const size = 300; const x = canvas.width - size - 80; const y = canvas.height - size - 120;
            ctx.save(); ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); ctx.clip();
            ctx.translate(x + size, y); ctx.scale(-1, 1); ctx.drawImage(camVid, 0, 0, size, size); ctx.restore();
            ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 10; ctx.stroke();
          }
          break;

        case 'presenter':
          // PRESENTER: Background Camera + PiP Screen
          if (!isCamOffRef.current && camVid) {
              const scale = Math.max(canvas.width / camVid.videoWidth, canvas.height / camVid.videoHeight);
              const w = camVid.videoWidth * scale; const h = camVid.videoHeight * scale;
              ctx.save(); ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
              ctx.drawImage(camVid, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h); ctx.restore();
          }
          if (screenVid) {
            const sw = 640; const sh = 360; const x = 60; const y = 60;
            ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, sw, sh, 40); ctx.clip();
            ctx.drawImage(screenVid, x, y, sw, sh); ctx.restore();
            ctx.strokeStyle = 'white'; ctx.lineWidth = 12; ctx.stroke();
          }
          break;

        default:
          // STANDARD: Screen + Camera Circle
          if (screenVid) {
            const scale = Math.max(canvas.width / screenVid.videoWidth, canvas.height / screenVid.videoHeight);
            ctx.drawImage(screenVid, (canvas.width - screenVid.videoWidth * scale) / 2, (canvas.height - screenVid.videoHeight * scale) / 2, screenVid.videoWidth * scale, screenVid.videoHeight * scale);
          }
          if (!isCamOffRef.current && camVid) {
            const size = 380;
            const x = 80 + (camBubblePosRef.current.x * 1.5);
            const y = canvas.height - size - 100 + (camBubblePosRef.current.y * 1.5);
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.translate(x + size, y);
            ctx.scale(-1, 1);
            ctx.drawImage(camVid, 0, 0, size, size);
            ctx.restore();
            ctx.strokeStyle = 'white'; ctx.lineWidth = 14; ctx.stroke();
          }
          break;
      }

      // Live Mode Label (Visible on recording)
      ctx.fillStyle = "rgba(99, 102, 241, 0.4)"; ctx.fillRect(20, 20, 200, 40);
      ctx.fillStyle = "white"; ctx.font = "bold 16px Inter"; ctx.fillText(`MODE: ${mode}`, 40, 46);
    };


    // 4. Start Heartbeat (30 FPS)
    const intervalId = window.setInterval(drawCompositor, 1000 / 30);
    timerRef.current = intervalId;

    // 5. Build Final Stream
    const canvasStream = canvas.captureStream(30);
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...(camStream?.getAudioTracks() || []),
      ...(screenStream?.getAudioTracks() || [])
    ]);

    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';

    const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 5000000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      setPreviewUrl(URL.createObjectURL(blob));
      window.clearInterval(intervalId);
    };

    mediaRecorderRef.current = recorder;
    
    // Give the engine a second to "warm up" before capturing tracks
    setTimeout(() => {
      recorder.start(1000);
      setIsRecording(true);
      setTimer(0);
      setStep('recording');
      onRecordingStatusChange?.(true);
      
      // Separate UI timer for the counter display
      const uiTimerId = window.setInterval(() => setTimer(t => t + 1), 1000);
      (window as any)._uiTimerId = uiTimerId;
    }, 500);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    
    // Clear compositor heartbeat
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Clear UI display timer
    const uiTimerId = (window as any)._uiTimerId;
    if (uiTimerId) clearInterval(uiTimerId);
    
    setIsRecording(false);
    setStep('preview');
    onRecordingStatusChange?.(false);
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    const uiTimerId = (window as any)._uiTimerId;
    
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (uiTimerId) clearInterval(uiTimerId);
    } else if (mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      const newUiTimerId = window.setInterval(() => setTimer(t => t + 1), 1000);
      (window as any)._uiTimerId = newUiTimerId;
    }
  };


  const handleSave = async () => {
    setStep('processing');
    if (!previewUrl) {
      console.error("No preview URL to save.");
      setStep('preview');
      return;
    }

    try {
      const frames = await extractFrames(previewUrl, 5); 
      if (frames.length === 0) throw new Error("Frame extraction failed.");

      const insights = await generateVideoInsightsFromFrames(
        frames,
        "Analyze these frames to suggest a concise title, summary, transcript, and chapters with timestamps."
      );

      const newVideo: VideoType = {
        id: Math.random().toString(36).substr(2, 9),
        title: insights?.suggestedTitle || `Show ${new Date().toLocaleDateString()}`,
        description: insights?.summary || "Recorded in Show Studio.",
        thumbnailUrl: frames[0],
        videoUrl: previewUrl || "",
        duration: formatTime(timer),
        createdAt: "Just now",
        author: "Me",
        views: 0,
        aiSummary: insights?.summary,
        transcript: insights?.transcript,
        chapters: insights?.chapters
      };
      onSave(newVideo);

    } catch (error) {
      console.error("Failed to process and save video:", error);
      const fallbackVideo: VideoType = {
        id: Math.random().toString(36).substr(2, 9),
        title: `Recording ${new Date().toLocaleDateString()}`,
        description: "AI analysis failed. Raw recording saved.",
        thumbnailUrl: '',
        videoUrl: previewUrl || "",
        duration: formatTime(timer),
        createdAt: "Just now",
        author: "Me",
        views: 0,
      };
      onSave(fallbackVideo);
    } finally {
      setStep('setup');
      setTimer(0);
    }
  };

  const getCamStyles = () => {
    if (isCamOff) return 'hidden';
    const mode = (activeScene || '').toString().trim().toLowerCase();
    
    if (mode === 'interview') {
      return 'absolute right-0 top-0 bottom-0 w-1/2 rounded-none border-none shadow-none z-30 ring-0';
    }
    
    if (mode === 'presenter') {
      return 'absolute inset-0 w-full h-full rounded-none border-none shadow-none z-10';
    }
    
    if (mode === 'code') {
      return 'absolute bottom-10 left-10 w-56 h-56 rounded-full border-4 border-indigo-500 shadow-2xl z-30 cursor-grab active:cursor-grabbing';
    }

    // Default to Standard (Circle)
    return 'absolute bottom-10 left-10 w-72 h-72 rounded-[48px] border-4 border-white shadow-2xl z-40 cursor-grab active:cursor-grabbing transform transition-all hover:scale-105';
  };

  const getScreenStyles = () => {
    switch (activeScene) {
      case 'interview': return 'absolute left-0 top-0 bottom-0 w-1/2 rounded-none border-none shadow-none z-30';
      case 'presenter': return 'absolute top-10 left-10 w-96 h-56 border-4 border-white shadow-2xl z-[100] rounded-3xl overflow-hidden';
      case 'code': return 'w-full h-full';
      default: return 'w-full h-full';
    }
  };

  return (
    <>
      <div onClick={addRipple} className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${isGhostMode ? 'bg-transparent pointer-events-none' : 'bg-white/40 backdrop-blur-2xl p-6'}`}>
      <div className={`bg-white rounded-[64px] w-full max-w-7xl overflow-hidden shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)] flex flex-col relative border border-slate-100 transition-all ${isGhostMode ? 'h-0 opacity-0' : 'h-[90vh] opacity-100'}`}>

        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-2xl tracking-tight">Show Studio</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {activeScene === 'code' ? 'Code Lab Engine' : 
                   activeScene === 'interview' ? 'Interview Broadcast' : 
                   activeScene === 'presenter' ? 'Presentation Layout' : 
                   'Mastering Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {step === 'recording' && (
              <div className="px-6 py-3 bg-rose-50 rounded-2xl flex items-center gap-4 border border-rose-100 animate-pulse">
                <div className="w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(225,29,72,0.6)]"></div>
                <span className="text-lg font-black text-rose-600 font-mono tracking-tighter">{formatTime(timer)}</span>
              </div>
            )}
            <button onClick={() => setIsShareModalOpen(true)} className="p-3 bg-white/50 text-slate-600 hover:text-indigo-600 rounded-2xl transition-all shadow-sm border border-slate-100">
              <Share2 className="size-5" />
            </button>

            {/* Telestrator / Draw Toggle */}
            <button
              onClick={() => setIsDrawingMode(!isDrawingMode)}
              className={`p-3 rounded-2xl transition-all shadow-sm border ${isDrawingMode
                ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-md ring-2 ring-rose-100'
                : 'bg-white/50 text-slate-600 hover:text-indigo-600 border-slate-100'
                }`}
              title="Draw on screen"
            >
              <PenTool className="size-5" />
            </button>

            {/* Teleprompter Toggle */}
            <button
              onClick={() => setShowPrompter(!showPrompter)}
              className={`p-3 rounded-2xl transition-all shadow-sm border ${showPrompter
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                : 'bg-white/50 text-slate-600 hover:text-indigo-600 border-slate-100'
                }`}
              title="Teleprompter script"
            >
              <FileText className="size-5" />
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-2xl transition-all shadow-sm border ${showSettings
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-md'
                : 'bg-white/50 text-slate-600 hover:text-indigo-600 border-slate-100'
                }`}
            >
              <Settings className="size-5" />
            </button>

            <button onClick={onClose} className="p-4 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 rounded-[24px] transition-all">
              <X className="w-6 h-6" />
            </button>

            {/* Settings Dropdown Panel */}
            {showSettings && (
              <div
                ref={settingsRef}
                className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-[100]"
              >
                {/* Panel Header */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/80">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <div className="size-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Settings className="size-3.5 text-indigo-600" />
                    </div>
                    Studio Settings
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 ml-8">Camera & microphone controls</p>
                </div>

                {/* Camera Toggle */}
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isCamOff ? (
                        <div className="size-8 bg-rose-100 rounded-xl flex items-center justify-center">
                          <VideoOff className="size-4 text-rose-600" />
                        </div>
                      ) : (
                        <div className="size-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <Video className="size-4 text-emerald-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Camera</p>
                        <p className="text-[11px] text-slate-500">
                          {isCamOff ? 'Camera is off' : 'Camera is on'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (camStream) {
                          camStream.getVideoTracks().forEach(t => { t.enabled = isCamOff; });
                        }
                        setIsCamOff(prev => !prev);
                      }}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isCamOff ? 'bg-slate-300' : 'bg-emerald-500'
                        }`}
                    >
                      <div className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow-md transition-transform duration-200 ${isCamOff ? 'translate-x-0' : 'translate-x-5'
                        }`} />
                    </button>
                  </div>

                  {/* Mic Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isMicMuted ? (
                        <div className="size-8 bg-rose-100 rounded-xl flex items-center justify-center">
                          <MicOff className="size-4 text-rose-600" />
                        </div>
                      ) : (
                        <div className="size-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <Mic className="size-4 text-emerald-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Microphone</p>
                        <p className="text-[11px] text-slate-500">
                          {isMicMuted ? 'Mic is muted' : 'Mic is on'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (camStream) {
                          camStream.getAudioTracks().forEach(t => { t.enabled = isMicMuted; });
                        }
                        setIsMicMuted(prev => !prev);
                      }}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isMicMuted ? 'bg-slate-300' : 'bg-emerald-500'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow-md transition-transform duration-200 ${isMicMuted ? 'translate-x-0' : 'translate-x-5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Production Surface */}
        <div className="flex-1 bg-slate-100 relative group overflow-hidden flex items-center justify-center">

          {/* UI Bubble/Presenter Preview (Background in Presenter Mode) */}
          {(camStream || step === 'recording') && activeScene !== 'code' && (
            <div onMouseDown={activeScene === 'standard' ? handleBubbleDragStart : undefined} className={`overflow-hidden transition-all duration-700 bg-white flex items-center justify-center ${getCamStyles()}`} style={{ transform: activeScene === 'standard' ? `translate(${camBubblePos.x}px, ${camBubblePos.y}px)` : 'none' }}>
              {!camStream && <div className="animate-pulse flex flex-col items-center gap-2 text-slate-300"><UserCircle className="size-16" /><span className="text-[10px] font-black uppercase tracking-widest">Initializing...</span></div>}
              {isDraggingBubble && <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none"><Move className="size-8 text-white drop-shadow-lg animate-pulse" /></div>}
              <video autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" ref={previewCamRef} />
            </div>
          )}

          {/* Screen Content Capture Preview (PIP Overlay in Presenter Mode) */}
          <div className={`transition-all duration-700 bg-slate-200 flex items-center justify-center overflow-hidden ${getScreenStyles()}`}>
            {step === 'setup' && !screenStream && activeScene !== 'code' && activeScene !== 'presenter' && (
              <div className="text-center space-y-10 animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-[40px] flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100 shadow-inner">
                  <Monitor className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-indigo-950 text-3xl font-black tracking-tight">Share Your Screen</h3>
                  <button onClick={handleStartScreenShare} className="bg-indigo-600 text-white px-12 py-5 rounded-[28px] font-black text-lg shadow-2xl mt-4">Share Window</button>
                </div>
              </div>
            )}
            {activeScene === 'presenter' && !screenStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50">
                <button onClick={handleStartScreenShare} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
                  <Share2 className="size-4" /> Add Screen Share to PiP
                </button>
              </div>
            )}
            <video 
              autoPlay muted playsInline 
              className={`w-full h-full ${activeScene === 'presenter' ? 'object-contain' : 'object-cover'} ${(step === 'setup' && !screenStream && activeScene !== 'presenter' && activeScene !== 'code') ? 'hidden' : 'block'}`}
              ref={previewScreenRef}
            />
          </div>

          {/* Code Lab Surface */}
          {activeScene === 'code' && (
            <div className="absolute inset-0 bg-[#0f111a] flex flex-col animate-in fade-in zoom-in-95 duration-500">
              <div className="h-10 bg-[#0a0c14] border-b border-white/5 flex items-center px-6 gap-6">
                <div className="flex items-center gap-2"><div className="size-3 bg-rose-500 rounded-full" /><div className="size-3 bg-amber-500 rounded-full" /><div className="size-3 bg-emerald-500 rounded-full" /></div>
                <div className="flex-1 flex items-center justify-center"><div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5"><FileCode className="size-3 text-indigo-400" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">src / core / main.ts</span></div></div>
                <button onClick={runCodeLabAnalysis} disabled={isRunningCode} className="px-4 py-1 bg-indigo-600 rounded-lg text-white font-black text-[10px] uppercase tracking-widest">{isRunningCode ? <Loader2 className="size-3 animate-spin" /> : "Run & Explain"}</button>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-[#0a0c14]"><Activity className="size-5 text-indigo-500/50" /><Terminal className="size-5 text-slate-700" /><Hash className="size-5 text-slate-700" /></div>
                <div className="flex-1 relative code-editor-container overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0a0c14] flex flex-col items-center py-10 gap-0 text-slate-800 text-sm select-none z-10 border-r border-white/5">{codeValue.split('\n').map((_, i) => <div key={i} className="h-[28px]">{i + 1}</div>)}</div>
                  <div className="relative h-full ml-12 overflow-y-auto no-scrollbar">
                    <textarea value={codeValue} onChange={(e) => setCodeValue(e.target.value)} className="absolute inset-0 w-full h-full p-10 bg-transparent border-none outline-none text-transparent caret-indigo-400 resize-none z-20 font-mono text-xl leading-[28px] overflow-hidden whitespace-pre no-scrollbar" spellCheck={false} />
                    <pre className="absolute inset-0 w-full h-full p-10 pointer-events-none z-10 language-typescript leading-[28px] whitespace-pre text-xl"><code className="language-typescript">{codeValue}</code></pre>
                  </div>
                </div>
              </div>
              <div className="h-40 bg-[#0a0c14] border-t border-white/5 p-6 font-mono text-xs overflow-y-auto no-scrollbar">
                <div className="text-emerald-400 mb-2 font-black flex items-center gap-2"><ChevronRight className="size-3" /> GENIUS_SYSTEM_LOG</div>
                <div className="text-slate-400 leading-relaxed space-y-1">{terminalOutput.map((log, i) => (<div key={i} className={log.startsWith('[GENIUS]') ? 'text-indigo-400 font-bold bg-indigo-950/30 p-2 rounded-lg my-2' : ''}>{log}</div>))}</div>
              </div>
            </div>
          )}
          {step === 'processing' && (
            <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center text-indigo-950 p-12 text-center space-y-10">
            <div className="absolute inset-0 z-[60] pointer-events-none">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-slate-200 p-2 flex items-center gap-2 pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="flex items-center gap-1 px-2 border-r border-slate-200">
                  <Move className="size-4 text-slate-400" />
                </div>
                {['#F43F5E', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B'].map(color => (
                  <button
                    key={color}
                    onClick={() => setDrawColor(color)}
                    className={`size-8 rounded-full border-2 transition-all ${drawColor === color ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button onClick={clearCanvas} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors" title="Clear All">
                  <Eraser className="size-5" />
                </button>
                <button onClick={() => setIsDrawingMode(false)} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full text-slate-500 transition-colors" title="Exit Draw Mode">
                  <X className="size-5" />
                </button>
              </div>
            </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className={`absolute inset-0 z-[50] w-full h-full ${isDrawingMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
          />

          {/* Teleprompter Overlay */}
          {showPrompter && (
            <div className="absolute top-24 left-10 z-[70] w-80 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-left-10 fade-in duration-500">
              {/* Prompter Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-move drag-handle">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-indigo-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">Script</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPrompterText('')} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="size-3" /></button>
                  <button onClick={() => setShowPrompter(false)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><X className="size-3" /></button>
                </div>
              </div>

              {/* Prompter Body */}
              <div className="relative h-64 bg-white">
                <textarea
                  ref={prompterRef}
                  value={prompterText}
                  onChange={(e) => setPrompterText(e.target.value)}
                  className="w-full h-full p-6 text-lg font-medium text-slate-800 bg-transparent resize-none outline-none leading-relaxed overflow-y-auto no-scrollbar"
                  placeholder="Type your script here..."
                />
                {/* Reading Line Guide */}
                <div className="absolute top-1/2 left-0 right-0 h-8 bg-indigo-500/10 border-y border-indigo-500/20 pointer-events-none" />
              </div>

              {/* Prompter Controls */}
              <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <button
                  onClick={() => setIsPrompterPlaying(!isPrompterPlaying)}
                  className={`size-10 rounded-xl flex items-center justify-center transition-all ${isPrompterPlaying ? 'bg-rose-100 text-rose-600' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'}`}
                >
                  {isPrompterPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Speed</span>
                    <span className="text-[10px] font-bold text-slate-900">{prompterSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={prompterSpeed}
                    onChange={(e) => setPrompterSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Workspace Controls */}
        <div className="p-10 bg-white border-t border-slate-100 flex flex-col gap-10 z-[60]">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              {scenes.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveScene(s.id as Scene)}
                  className={`px-4 py-3 rounded-2xl flex items-center gap-3 transition-all ${activeScene === s.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  <s.icon className="size-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-8">
              {step === 'setup' && (
                <button
                  onClick={startRecording}
                  disabled={!screenStream && activeScene !== 'code' && activeScene !== 'presenter'}
                  className="group flex items-center gap-5 bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 text-white px-16 py-6 rounded-[32px] font-black text-xl transition-all shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95"
                >
                  Start Production
                </button>
              )}

              {step === 'recording' && (
                <div className="flex items-center gap-4 animate-in slide-in-from-right-4 duration-300">
                  <div className={`flex items-center gap-3 bg-white/80 backdrop-blur-md border px-6 py-4 rounded-[24px] shadow-sm ${isPaused ? 'border-indigo-100' : 'border-rose-100 animate-pulse'}`}>
                    <div className={`size-2.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.6)] transition-colors ${isPaused ? 'bg-indigo-400' : 'bg-rose-500'}`}></div>
                    <span className={`text-xl font-black font-mono tracking-tighter ${isPaused ? 'text-indigo-600' : 'text-rose-600'}`}>{formatTime(timer)}</span>
                  </div>

                  <button
                    onClick={togglePause}
                    className="p-6 bg-white border border-slate-100 rounded-[32px] text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-xl active:scale-95 group"
                    title={isPaused ? "Resume Recording" : "Pause Recording"}
                  >
                    {isPaused ? <PlayIcon className="size-5 fill-current group-hover:scale-110 transition-transform" /> : <Pause className="size-5 fill-current group-hover:scale-110 transition-transform" />}
                  </button>

                  <button
                    id="finish-recording-btn"
                    onClick={stopRecording}
                    className="group flex items-center gap-5 bg-rose-600 text-white px-10 py-6 rounded-[32px] font-black text-xl transition-all shadow-2xl shadow-rose-200 hover:bg-rose-700 hover:-translate-y-1 active:scale-95"
                  >
                    <Square className="w-5 h-5 fill-white" />
                    Finish Show
                  </button>
                </div>
              )}

              {step === 'preview' && (
                <div className="flex items-center gap-4 animate-in slide-in-from-right-4 duration-300">
                  <button
                    onClick={() => { setPreviewUrl(null); setTimer(0); setStep('setup'); }}
                    className="group flex items-center gap-4 bg-slate-100 text-slate-600 px-10 py-6 rounded-[32px] font-black text-xl transition-all hover:bg-slate-200 hover:-translate-y-1 active:scale-95"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Record Again
                  </button>
                  <button
                    onClick={handleSave}
                    className="group flex items-center gap-4 bg-indigo-600 text-white px-14 py-6 rounded-[32px] font-black text-xl transition-all shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95"
                  >
                    Save Production
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isShareModalOpen && (
          <ShareModal
            onClose={() => setIsShareModalOpen(false)}
            productionUrl={previewUrl || `https://getshowapp.com/v/prod_${Date.now()}`}
          />
        )}
      </div>
    </div>

    {ripples.map(r => (
      <div
        key={r.id}
        className="fixed pointer-events-none rounded-full border-2 border-indigo-400 animate-ripple z-[100]"
        style={{
          left: r.x,
          top: r.y,
          width: 0,
          height: 0,
          transform: 'translate(-50%, -50%)'
        }}
      />
    ))}

    {/* Minimized Camera Bubble - Visible ONLY during Standard/Code recording when studio is hidden */}
    {isMinimized && step === 'recording' && (activeScene === 'standard' || activeScene === 'code') && camStream && !isCamOff && (
      <div className="fixed top-6 right-6 z-[200] w-48 h-48 rounded-full border-4 border-white shadow-2xl overflow-hidden animate-in zoom-in duration-300 pointer-events-auto hover:scale-110 transition-transform">
        <video
          ref={(el) => { if (el && camStream && el.srcObject !== camStream) el.srcObject = camStream; }}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />
      </div>
    )}

    {/* MASTER RECORDER ENGINE: Off-screen renderer that MUST stay in DOM to avoid throttling */}
    <div className="fixed top-[-10000px] left-[-10000px] w-[1920px] h-[1080px] pointer-events-none z-[-1] overflow-hidden bg-black">
      <canvas ref={compositorRef} width={1920} height={1080} className="w-full h-full" />
      {/* Master Capture Seeds: Always active, never unmounted, NEVER display:none */}
      <video 
        autoPlay 
        muted 
        playsInline 
        width="1280" 
        height="720"
        className="fixed left-[-9999px]"
        ref={(el) => {
          if (el) {
            (camVideoRef as any).current = el;
            if (camStream && el.srcObject !== camStream) el.srcObject = camStream;
          }
        }}
      />
      <video 
        autoPlay 
        muted 
        playsInline 
        width="1920" 
        height="1080"
        className="fixed left-[-9999px]"
        ref={(el) => {
          if (el) {
            (screenVideoRef as any).current = el;
            if (screenStream && el.srcObject !== screenStream) el.srcObject = screenStream;
          }
        }}
      />
    </div>

    <style>{`
      @keyframes ripple {
        0% { width: 0px; height: 0px; opacity: 0.8; border-width: 4px; }
        100% { width: 100px; height: 100px; opacity: 0; border-width: 0px; }
      }
      .animate-ripple {
        animation: ripple 0.6s ease-out forwards;
      }
      @keyframes pulse-subtle {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
      .animate-pulse-subtle {
        animation: pulse-subtle 4s ease-in-out infinite;
      }
      .token.comment { color: #6a9955; }
      .token.function { color: #dcdcaa; }
      .token.keyword { color: #569cd6; }
      .token.string { color: #ce9178; }
      .token.operator { color: #d4d4d4; }
    `}</style>
    </>
  );
};

export default Recorder;
