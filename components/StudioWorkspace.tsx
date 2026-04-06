
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Aperture, Mic, MicOff, VideoOff, ScreenShare, Camera as CameraIcon,
  Grid, Loader2, Image as ImageLucide, Pen, Download, Trash2,
  Crosshair, Timer,
  ZoomIn, ZoomOut, FlipHorizontal, Copy,
  Zap, Focus, Clock
} from 'lucide-react';
import { Capture } from '../types';

const FILTER_PRESETS = [
  { id: 'none', name: 'None', brightness: 100, contrast: 100, saturate: 100, sepia: 0, hue: 0 },
  { id: 'vivid', name: 'Vivid', brightness: 105, contrast: 115, saturate: 140, sepia: 0, hue: 0 },
  { id: 'warm', name: 'Warm', brightness: 105, contrast: 100, saturate: 110, sepia: 15, hue: 0 },
  { id: 'cool', name: 'Cool', brightness: 100, contrast: 105, saturate: 90, sepia: 0, hue: 180 },
  { id: 'noir', name: 'Noir', brightness: 110, contrast: 130, saturate: 0, sepia: 0, hue: 0 },
  { id: 'retro', name: 'Retro', brightness: 95, contrast: 90, saturate: 80, sepia: 30, hue: 0 },
  { id: 'drama', name: 'Drama', brightness: 90, contrast: 150, saturate: 120, sepia: 0, hue: 0 },
];

interface StudioWorkspaceProps {
  captures: Capture[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit?: (capture: Capture) => void;
}

const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({ captures, onClose, onDelete, onEdit }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Studio State
  const [activeSource, setActiveSource] = useState<'screen' | 'camera'>('camera');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const [sessionCaptures, setSessionCaptures] = useState<{id: string, url: string, time: string}[]>([]);
  const [flash, setFlash] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [activeTab, setActiveTab] = useState<'assets' | 'capture' | 'effects' | 'settings'>('assets');

  // ─── Countdown ───
  const [countdown, setCountdown] = useState<number | null>(null);
  const [captureDelay, setCaptureDelay] = useState<0 | 3 | 5 | 10>(0);
  const countdownRef = useRef<number | null>(null);

  // ─── PiP Webcam ───
  const [showPip, setShowPip] = useState(true);
  const [pipPosition, setPipPosition] = useState<'br' | 'bl' | 'tr' | 'tl'>('br');
  const [pipSize, setPipSize] = useState<'sm' | 'md' | 'lg'>('md');
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const pipStreamRef = useRef<MediaStream | null>(null);

  // ─── Session Timer ───
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const sessionTimerRef = useRef<number | null>(null);

  // ─── Viewport ───
  const [viewportZoom, setViewportZoom] = useState(100);
  const [isMirrored, setIsMirrored] = useState(true);

  // ─── Burst Capture ───
  const [burstMode, setBurstMode] = useState(false);
  const [burstCount, setBurstCount] = useState(3);

  // ─── Video Filters ───
  const [videoFilters, setVideoFilters] = useState({ brightness: 100, contrast: 100, saturate: 100, sepia: 0, hue: 0 });
  const [activePreset, setActivePreset] = useState('none');

  // ─── Aspect Ratio Guide ───
  const [aspectGuide, setAspectGuide] = useState<'none' | '16:9' | '4:3' | '1:1' | '9:16'>('none');

  // ─── Capture Format ───
  const [captureFormat, setCaptureFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/jpeg');
  const [captureQuality, setCaptureQuality] = useState(95);

  // ─── Focus Point ───
  const [focusPoint, setFocusPoint] = useState<{x: number, y: number, visible: boolean}>({ x: 50, y: 50, visible: false });

  // Timers and Refs
  const audioIntervalRef = useRef<number | null>(null);

  // Initialize Camera on Mount
  useEffect(() => {
    initCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Simulate Audio Levels
  useEffect(() => {
    if (isMicOn && stream) {
      audioIntervalRef.current = window.setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isMicOn, stream]);



  const initCamera = async () => {
    try {
      stopStream();
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 }, audio: true });
      streamRef.current = s;
      setStream(s);
      setActiveSource('camera');
      setIsCamOn(true);
    } catch (err) {
      console.error("Camera access failed", err);
    }
  };

  const initScreen = async () => {
    try {
      stopStream();
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      streamRef.current = s;
      setStream(s);
      setActiveSource('screen');
      setIsCamOn(true);
    } catch (err) {
      console.error("Screen share failed", err);
      // Fallback to camera if screen share cancelled
      initCamera(); 
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStream(null);
  };



  const takeSnapshot = () => {
    if (!videoRef.current) return;
    
    // Temporarily hide HUD and grid overlays for clean capture
    const wasHudVisible = showHud;
    const wasGridVisible = showGrid;
    if (wasHudVisible) setShowHud(false);
    if (wasGridVisible) setShowGrid(false);
    
    // Small delay to ensure UI updates before capture
    setTimeout(() => {
      if (!videoRef.current) return;
      
      // Flash Effect
      setFlash(true);
      setTimeout(() => setFlash(false), 150);

      // Capture Frame at actual video resolution (no distortion)
      const videoEl = videoRef.current;
      const canvas = document.createElement('canvas');
      const videoWidth = videoEl.videoWidth;
      const videoHeight = videoEl.videoHeight;
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (activeSource === 'camera' && isMirrored) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.filter = getVideoFilterStyle();
        ctx.drawImage(videoEl, 0, 0, videoWidth, videoHeight, 0, 0, videoWidth, videoHeight);
        const url = canvas.toDataURL(captureFormat, captureQuality / 100);
        const newCaptureId = Date.now().toString();
        const newCaptureTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      // Add to session captures for the sidebar
      setSessionCaptures(prev => [{
        id: newCaptureId,
        url,
        time: newCaptureTime
      }, ...prev]);

      // Immediately trigger the annotator with the new capture
      if (onEdit) {
        const fullCapture: Capture = {
            id: newCaptureId,
            url: url,
            type: 'Studio Snapshot',
            createdAt: newCaptureTime,
            title: `Studio Snap ${newCaptureTime}`
        };
        onEdit(fullCapture);
      }
      
      // Restore HUD and grid if they were visible
      if (wasHudVisible) setShowHud(true);
      if (wasGridVisible) setShowGrid(true);
    }
    }, 50); // Small delay for UI update
  };

  const handleEditSessionCapture = (cap: {id: string, url: string, time: string}) => {
      if (onEdit) {
          const fullCapture: Capture = {
              id: cap.id,
              url: cap.url,
              type: 'Studio Snapshot',
              createdAt: cap.time,
              title: `Studio Snap ${cap.time}`
          };
          onEdit(fullCapture);
      }
  };

  // Toggle Tracks
  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(t => t.enabled = !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  // ═══════════════════════════════════════════════════
  // NEW FEATURES
  // ═══════════════════════════════════════════════════

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getVideoFilterStyle = () =>
    `brightness(${videoFilters.brightness}%) contrast(${videoFilters.contrast}%) saturate(${videoFilters.saturate}%) sepia(${videoFilters.sepia}%) hue-rotate(${videoFilters.hue}deg)`;

  // Session Timer
  useEffect(() => {
    sessionTimerRef.current = window.setInterval(() => setSessionElapsed(p => p + 1), 1000);
    return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current); };
  }, []);

  // PiP webcam when screen sharing
  const startPipWebcam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
      pipStreamRef.current = s;
      setTimeout(() => { if (pipVideoRef.current) pipVideoRef.current.srcObject = s; }, 100);
    } catch (err) { console.error('PiP cam failed:', err); }
  };

  const stopPipWebcam = () => {
    if (pipStreamRef.current) { pipStreamRef.current.getTracks().forEach(t => t.stop()); pipStreamRef.current = null; }
  };

  useEffect(() => {
    if (activeSource === 'screen' && showPip) startPipWebcam();
    else stopPipWebcam();
    return () => stopPipWebcam();
  }, [activeSource, showPip]);

  // Countdown → Capture
  const handleCaptureWithCountdown = () => {
    if (countdown !== null) return;
    if (captureDelay === 0) { burstMode ? burstCapture() : takeSnapshot(); return; }
    let remaining = captureDelay;
    setCountdown(remaining);
    countdownRef.current = window.setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setCountdown(null);
        burstMode ? burstCapture() : takeSnapshot();
      } else setCountdown(remaining);
    }, 1000);
  };

  // Burst capture
  const burstCapture = () => {
    let i = 0;
    const fire = () => { takeSnapshot(); i++; if (i < burstCount) setTimeout(fire, 400); };
    fire();
  };

  // Filter presets
  const applyFilterPreset = (id: string) => {
    const p = FILTER_PRESETS.find(f => f.id === id);
    if (p) { setVideoFilters({ brightness: p.brightness, contrast: p.contrast, saturate: p.saturate, sepia: p.sepia, hue: p.hue }); setActivePreset(id); }
  };

  // Focus point
  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFocusPoint({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100, visible: true });
    setTimeout(() => setFocusPoint(fp => ({ ...fp, visible: false })), 1200);
  };

  const cyclePipPosition = () => {
    const pos: ('br' | 'bl' | 'tl' | 'tr')[] = ['br', 'bl', 'tl', 'tr'];
    setPipPosition(pos[(pos.indexOf(pipPosition) + 1) % 4]);
  };

  const copyLastCapture = async () => {
    if (sessionCaptures.length === 0) return;
    try {
      const r = await fetch(sessionCaptures[0].url);
      const blob = await r.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch {}
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); handleCaptureWithCountdown(); break;
        case 'g': e.preventDefault(); setShowGrid(v => !v); break;
        case 'h': e.preventDefault(); setShowHud(v => !v); break;
        case 'm': e.preventDefault(); toggleMic(); break;
        case 'f': e.preventDefault(); setIsMirrored(v => !v); break;
        case '=': case '+': e.preventDefault(); setViewportZoom(z => Math.min(200, z + 10)); break;
        case '-': e.preventDefault(); setViewportZoom(z => Math.max(25, z - 10)); break;
        case 'escape': e.preventDefault(); stopStream(); stopPipWebcam(); onClose(); break;
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [stream, isMicOn, countdown, captureDelay, burstMode]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopPipWebcam();
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#09090b] text-white flex flex-col overflow-hidden animate-in fade-in duration-300 font-sans">
      
      {/* 1. Header Bar */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-white/10 bg-[#09090b]/95 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="size-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Aperture className="size-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Studio Workspace</h1>
            <div className="flex items-center gap-2">
              <div className={`size-1.5 rounded-full ${stream ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_currentColor]`} />
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{stream ? 'SIGNAL_LOCKED' : 'NO_SIGNAL'}</span>
            </div>
          </div>
        </div>

        {/* Center — Session Info */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <Clock className="size-3 text-zinc-500" />
            <span className="text-xs font-mono font-bold text-zinc-300 tabular-nums">{formatTime(sessionElapsed)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <ImageLucide className="size-3.5" />
            <span className="text-xs font-bold tabular-nums">{sessionCaptures.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={copyLastCapture} className="size-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-zinc-500 hover:text-white" title="Copy last capture">
            <Copy className="size-4" />
          </button>
          <button 
            onClick={() => { stopStream(); stopPipWebcam(); onClose(); }}
            className="size-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-zinc-400 hover:text-white"
            title="Close (ESC)"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Viewport Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center p-6">
          
          {/* Main Video Container */}
          <div 
            className="relative w-full h-full max-w-6xl max-h-[80vh] aspect-video bg-[#18181b] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group transition-transform"
            style={{ transform: `scale(${viewportZoom / 100})` }}
            onClick={handleViewportClick}
          >
            
            {/* Flash Effect Overlay */}
            <div className={`absolute inset-0 bg-white pointer-events-none z-[100] transition-opacity duration-150 ${flash ? 'opacity-100' : 'opacity-0'}`} />

            {/* Video Feed */}
            {stream ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transition-all duration-500 ${isCamOn ? 'opacity-100' : 'opacity-0'}`}
                style={{ filter: getVideoFilterStyle(), transform: activeSource === 'camera' && isMirrored ? 'scaleX(-1)' : 'none' }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-4">
                <Loader2 className="size-8 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Initializing Hardware...</span>
              </div>
            )}

            {/* Fallback for Cam Off */}
            {!isCamOn && stream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#18181b] text-zinc-500 gap-4">
                <VideoOff className="size-12" />
                <span className="text-xs font-bold uppercase tracking-widest">Video Muted</span>
              </div>
            )}

            {/* Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none opacity-30 z-10">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>
              </div>
            )}

            {/* HUD Overlay (Heads Up Display) */}
            {showHud && (
              <div className="absolute inset-0 p-6 pointer-events-none flex flex-col justify-between z-20">
                {/* Top HUD */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 w-fit">REC709</span>
                    <span className="text-xs font-mono font-bold text-white/80">ISO 800</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-500">BAT 92%</span>
                      <div className="w-4 h-2 border border-emerald-500 rounded-sm relative"><div className="absolute left-0 top-0 bottom-0 bg-emerald-500 w-[90%]" /></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-white/80">4K 60FPS</span>
                  </div>
                </div>

                {/* Bottom HUD */}
                <div className="flex justify-between items-end">
                  <div className="flex gap-1 items-end h-8">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-1 bg-white/30 rounded-t-sm" style={{ height: `${Math.min(100, Math.max(10, audioLevel + (Math.random() * 20 - 10)))}%`, transition: 'height 0.1s ease' }} />
                    ))}
                    <Mic className={`size-3 ml-2 ${isMicOn ? 'text-white' : 'text-rose-500'}`} />
                  </div>
                  
                  {/* Center Crosshair */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                    <Crosshair className="size-8 text-white" strokeWidth={1} />
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white/40 uppercase tracking-widest">
                      Snap Studio
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="relative">
                  <div className="text-[140px] font-black text-white leading-none drop-shadow-2xl">{countdown}</div>
                  <div className="absolute inset-0 text-[140px] font-black text-white leading-none animate-ping opacity-20">{countdown}</div>
                </div>
              </div>
            )}

            {/* Focus Point Indicator */}
            {focusPoint.visible && (
              <div className="absolute z-30 pointer-events-none" style={{ left: `${focusPoint.x}%`, top: `${focusPoint.y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="size-16 border-2 border-yellow-400 rounded-full animate-ping opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-16 border border-yellow-400/60 rounded-full flex items-center justify-center">
                    <div className="size-1.5 bg-yellow-400 rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* Aspect Ratio Guide */}
            {aspectGuide !== 'none' && (
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                <div className={`border-2 border-dashed border-yellow-400/40 rounded-sm ${
                  aspectGuide === '16:9' ? 'w-full h-full' :
                  aspectGuide === '4:3' ? 'w-[75%] h-full' :
                  aspectGuide === '1:1' ? 'aspect-square h-full max-w-full' :
                  'w-[56.25%] h-full'
                }`} />
              </div>
            )}

            {/* PiP Webcam */}
            {activeSource === 'screen' && showPip && (
              <div 
                className={`absolute z-30 cursor-pointer transition-all hover:ring-2 hover:ring-indigo-500 rounded-xl ${
                  pipPosition === 'br' ? 'bottom-4 right-4' : pipPosition === 'bl' ? 'bottom-4 left-4' : pipPosition === 'tr' ? 'top-4 right-4' : 'top-4 left-4'
                } ${pipSize === 'sm' ? 'w-28' : pipSize === 'md' ? 'w-44' : 'w-60'}`}
                onClick={(e) => { e.stopPropagation(); cyclePipPosition(); }}
                title="Click to reposition"
              >
                <video ref={pipVideoRef} autoPlay playsInline muted className="w-full aspect-video object-cover rounded-xl border-2 border-white/20 shadow-2xl scale-x-[-1]" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[8px] font-bold text-white/70 uppercase tracking-widest">Webcam</div>
              </div>
            )}
          </div>

          {/* Floating Action Bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-[#18181b]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50">
            {/* Source Toggle */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-white/10">
              <button onClick={() => activeSource !== 'camera' && initCamera()} className={`p-2.5 rounded-full transition-all ${activeSource === 'camera' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`} title="Camera">
                <CameraIcon className="size-4" />
              </button>
              <button onClick={() => activeSource !== 'screen' && initScreen()} className={`p-2.5 rounded-full transition-all ${activeSource === 'screen' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`} title="Screen">
                <ScreenShare className="size-4" />
              </button>
            </div>

            {/* Delay Selector */}
            <div className="relative group">
              <button className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1" title="Capture delay">
                <Timer className="size-4" />
                {captureDelay > 0 && <span className="text-[10px] font-bold text-indigo-400">{captureDelay}s</span>}
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-[#18181b] border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[100px]">
                {([0, 3, 5, 10] as const).map(d => (
                  <button key={d} onClick={() => setCaptureDelay(d)} className={`px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap ${captureDelay === d ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`}>
                    {d === 0 ? 'No delay' : `${d}s delay`}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Capture Button */}
            <button 
              onClick={handleCaptureWithCountdown}
              disabled={countdown !== null}
              className="size-14 rounded-full bg-white border-4 border-white flex items-center justify-center transition-all shadow-xl hover:bg-zinc-100 active:scale-90 group disabled:opacity-50"
              title="Capture (Space)"
            >
              <div className={`size-10 rounded-full border-2 border-white transition-colors ${burstMode ? 'bg-amber-500 group-hover:bg-amber-400' : 'bg-indigo-600 group-hover:bg-indigo-500'}`} />
            </button>

            {/* Controls */}
            <div className="flex items-center gap-1 pl-3 border-l border-white/10">
              <button onClick={toggleMic} className={`p-2 rounded-full transition-all ${!isMicOn ? 'bg-rose-500/20 text-rose-500' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`} title="Mic (M)">
                {isMicOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
              </button>
              <button onClick={() => setShowGrid(g => !g)} className={`p-2 rounded-full transition-all ${showGrid ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`} title="Grid (G)">
                <Grid className="size-4" />
              </button>
              <button onClick={() => setIsMirrored(m => !m)} className={`p-2 rounded-full transition-all ${isMirrored ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`} title="Mirror (F)">
                <FlipHorizontal className="size-4" />
              </button>
              <button onClick={() => setBurstMode(b => !b)} className={`p-2 rounded-full transition-all ${burstMode ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`} title={`Burst ${burstCount}x`}>
                <Zap className="size-4" />
              </button>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-1 pl-3 border-l border-white/10">
              <button onClick={() => setViewportZoom(z => Math.max(25, z - 25))} className="p-1.5 rounded text-zinc-500 hover:text-white transition-colors">
                <ZoomOut className="size-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold text-zinc-500 w-10 text-center tabular-nums">{viewportZoom}%</span>
              <button onClick={() => setViewportZoom(z => Math.min(200, z + 25))} className="p-1.5 rounded text-zinc-500 hover:text-white transition-colors">
                <ZoomIn className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Right Sidebar (Assets & Settings) */}
        <aside className="w-80 bg-[#09090b] border-l border-white/10 flex flex-col">
          <div className="flex items-center border-b border-white/10">
            {([
              { id: 'assets' as const, label: 'Assets' },
              { id: 'capture' as const, label: 'Capture' },
              { id: 'effects' as const, label: 'Effects' },
              { id: 'settings' as const, label: 'Config' },
            ]).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === t.id ? 'text-white bg-white/5 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {activeTab === 'assets' && (
              <>
                {sessionCaptures.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                      <ImageLucide className="size-8 text-zinc-500" />
                    </div>
                    <p className="text-xs font-medium text-zinc-500 max-w-[150px]">
                      Snapshots taken during this session will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    {sessionCaptures.map((cap) => (
                      <div key={cap.id} className="group relative rounded-xl overflow-hidden bg-[#18181b] border border-white/10 hover:border-indigo-500/50 transition-all">
                        <img src={cap.url} className="w-full aspect-video object-cover" alt="Capture" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                           <button className="p-2 bg-indigo-600 text-white rounded-lg hover:scale-110 transition-transform shadow-lg" onClick={() => handleEditSessionCapture(cap)} title="Crop & Annotate"><Pen className="size-4" /></button>
                           <button className="p-2 bg-white text-black rounded-lg hover:scale-110 transition-transform shadow-lg" title="Download" onClick={() => { const link = document.createElement('a'); link.download = `capture-${cap.id}.png`; link.href = cap.url; link.click(); }}><Download className="size-4" /></button>
                           <button className="p-2 bg-rose-500 text-white rounded-lg hover:scale-110 transition-transform shadow-lg" onClick={() => setSessionCaptures(curr => curr.filter(c => c.id !== cap.id))}><Trash2 className="size-4" /></button>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                           <span className="text-[10px] font-mono text-white/80">{cap.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Input Source</label>
                    <div className="flex flex-col gap-2">
                       <button onClick={initCamera} className={`w-full p-3 rounded-xl border flex items-center gap-3 text-sm font-medium transition-all ${activeSource === 'camera' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#18181b] border-white/10 text-zinc-400 hover:text-white'}`}>
                          <CameraIcon className="size-4" /> Webcam (Default)
                       </button>
                       <button onClick={initScreen} className={`w-full p-3 rounded-xl border flex items-center gap-3 text-sm font-medium transition-all ${activeSource === 'screen' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#18181b] border-white/10 text-zinc-400 hover:text-white'}`}>
                          <ScreenShare className="size-4" /> Screen Capture
                       </button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Display Options</label>
                    <div className="space-y-2">
                       <div className="flex items-center justify-between p-3 bg-[#18181b] rounded-xl border border-white/10">
                          <span className="text-sm text-zinc-300">HUD Overlay</span>
                          <div 
                            className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${showHud ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                            onClick={() => setShowHud(!showHud)}
                          >
                             <div className={`size-4 bg-white rounded-full shadow-sm transition-transform ${showHud ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                       </div>
                       <div className="flex items-center justify-between p-3 bg-[#18181b] rounded-xl border border-white/10">
                          <span className="text-sm text-zinc-300">Grid Lines</span>
                          <div 
                            className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${showGrid ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                            onClick={() => setShowGrid(!showGrid)}
                          >
                             <div className={`size-4 bg-white rounded-full shadow-sm transition-transform ${showGrid ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* ═══ Capture Tab ═══ */}
            {activeTab === 'capture' && (
              <div className="space-y-6">
                {/* Capture Stats */}
                <div className="p-5 rounded-xl border bg-white/5 border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Aperture className="size-4 text-indigo-400" />
                    <span className="text-sm font-bold text-white">Capture Settings</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                      <div className="text-2xl font-mono font-black text-white tabular-nums">{sessionCaptures.length}</div>
                      <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Captures</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                      <div className="text-2xl font-mono font-black text-white tabular-nums">{formatTime(sessionElapsed)}</div>
                      <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Session</div>
                    </div>
                  </div>
                </div>

                {/* Format & Quality */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Screenshot Format</label>
                  <div className="flex gap-1.5">
                    {(['image/png', 'image/jpeg', 'image/webp'] as const).map(f => (
                      <button key={f} onClick={() => setCaptureFormat(f)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${captureFormat === f ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                        {f.split('/')[1]}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-zinc-500">Quality</label>
                    <span className="text-[10px] font-mono text-zinc-500">{captureQuality}%</span>
                  </div>
                  <input type="range" min="10" max="100" step="5" value={captureQuality} onChange={e => setCaptureQuality(Number(e.target.value))} className="w-full accent-indigo-500 h-1" />
                </div>

                {/* Burst Mode */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Burst Mode</label>
                    <div className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${burstMode ? 'bg-amber-500' : 'bg-zinc-700'}`} onClick={() => setBurstMode(!burstMode)}>
                      <div className={`size-4 bg-white rounded-full shadow transition-transform ${burstMode ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                  {burstMode && (
                    <div className="flex items-center gap-2">
                      {[3, 5, 10].map(n => (
                        <button key={n} onClick={() => setBurstCount(n)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${burstCount === n ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50' : 'bg-white/5 text-zinc-500'}`}>{n}x</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ Effects Tab ═══ */}
            {activeTab === 'effects' && (
              <div className="space-y-6">
                {/* Filter Presets */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Filter Presets</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {FILTER_PRESETS.map(p => (
                      <button key={p.id} onClick={() => applyFilterPreset(p.id)} className={`py-2 rounded-lg text-[10px] font-bold transition-all ${activePreset === p.id ? 'bg-indigo-600 text-white ring-1 ring-indigo-400/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Sliders */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Adjustments</label>
                  {[
                    { label: 'Brightness', key: 'brightness', min: 50, max: 150 },
                    { label: 'Contrast', key: 'contrast', min: 50, max: 200 },
                    { label: 'Saturation', key: 'saturate', min: 0, max: 200 },
                    { label: 'Warmth', key: 'sepia', min: 0, max: 50 },
                  ].map(s => (
                    <div key={s.key} className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs text-zinc-500">{s.label}</label>
                        <span className="text-[10px] font-mono text-zinc-600">{videoFilters[s.key as keyof typeof videoFilters]}</span>
                      </div>
                      <input type="range" min={s.min} max={s.max} value={videoFilters[s.key as keyof typeof videoFilters]} onChange={e => { setVideoFilters({...videoFilters, [s.key]: Number(e.target.value)}); setActivePreset('custom'); }} className="w-full accent-indigo-500 h-1" />
                    </div>
                  ))}
                  <button onClick={() => applyFilterPreset('none')} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-zinc-500 transition-colors">
                    Reset Filters
                  </button>
                </div>

                {/* Aspect Ratio Guide */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Aspect Guide</label>
                  <div className="flex gap-1.5">
                    {(['none', '16:9', '4:3', '1:1', '9:16'] as const).map(r => (
                      <button key={r} onClick={() => setAspectGuide(r)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${aspectGuide === r ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                        {r === 'none' ? 'Off' : r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PiP Controls */}
                {activeSource === 'screen' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Webcam PiP</label>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-xs text-zinc-300">Show Webcam</span>
                      <div className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${showPip ? 'bg-indigo-600' : 'bg-zinc-700'}`} onClick={() => setShowPip(!showPip)}>
                        <div className={`size-4 bg-white rounded-full shadow transition-transform ${showPip ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                    {showPip && (
                      <div className="flex gap-1.5">
                        {(['sm', 'md', 'lg'] as const).map(s => (
                          <button key={s} onClick={() => setPipSize(s)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase ${pipSize === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-400'}`}>{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Keyboard Shortcuts */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Shortcuts</label>
                  <div className="space-y-1">
                    {[
                      { key: 'Space', action: 'Capture' },
                      { key: 'G', action: 'Grid' },
                      { key: 'H', action: 'HUD' },
                      { key: 'M', action: 'Mic' },
                      { key: 'F', action: 'Mirror' },
                      { key: '+ / -', action: 'Zoom' },
                      { key: 'ESC', action: 'Close' },
                    ].map(s => (
                      <div key={s.key} className="flex justify-between py-1.5 px-2 rounded hover:bg-white/5">
                        <span className="text-xs text-zinc-500">{s.action}</span>
                        <kbd className="text-[10px] font-mono text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{s.key}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
export default StudioWorkspace;
