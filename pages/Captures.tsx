
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Scissors, Share2, Trash2, Pen, Sparkles, Target, 
  ArrowRight, Image as ImageLucide, Monitor, Camera, X,
  MoreVertical, ShieldCheck, Zap, Signal, MessageCircle, Send,
  PhoneOff, Mic, MicOff, VideoOff, ScreenShare, Users, Activity,
  Cpu, BrainCircuit, LayoutGrid, Camera as CameraIcon,
  Maximize2, Download, Layers, Box, Crosshair, Globe, Settings,
  Video as VideoIcon, Grid, Play, CheckCircle2, Loader2, ListTodo,
  Bot, Eye, Code, FileText, AlertCircle, History, Terminal,
  Workflow, Database, Fingerprint, StopCircle, Circle, Aperture,
  Presentation, Lock, Film, Sliders
} from 'lucide-react';
import { Capture } from '../types';
import HeroBanner from '../components/HeroBanner';

interface CapturesProps {
  captures: Capture[];
  onAddCapture: () => void;
  onDeleteCapture: (id: string) => void;
  onEditCapture?: (capture: Capture) => void;
  coverImage?: string;
}

const AutomatedSnapshotWorkspace: React.FC<{ 
  captures: Capture[], 
  onClose: () => void, 
  onDelete: (id: string) => void,
  onEdit?: (capture: Capture) => void 
}> = ({ captures, onClose, onDelete, onEdit }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Studio State
  const [activeSource, setActiveSource] = useState<'screen' | 'camera'>('camera');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const [sessionCaptures, setSessionCaptures] = useState<{id: string, url: string, time: string}[]>([]);
  const [flash, setFlash] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [activeTab, setActiveTab] = useState<'assets' | 'settings'>('assets');

  // Timers and Refs
  const timerRef = useRef<number | null>(null);
  const audioIntervalRef = useRef<number | null>(null);

  // Initialize Camera on Mount
  useEffect(() => {
    initCamera();
    return () => stopStream();
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

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const initCamera = async () => {
    try {
      stopStream();
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 }, audio: true });
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
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Mock save logic could go here
    } else {
      setRecordingTime(0);
      setIsRecording(true);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    
    // Flash Effect
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    // Capture Frame
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (activeSource === 'camera') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(videoRef.current, 0, 0);
      const url = canvas.toDataURL('image/jpeg');
      setSessionCaptures(prev => [{
        id: Date.now().toString(),
        url,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})
      }, ...prev]);
    }
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle Tracks
  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(t => t.enabled = !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = () => {
    if (stream) {
      stream.getVideoTracks().forEach(t => t.enabled = !isCamOn);
      setIsCamOn(!isCamOn);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#09090b] text-white flex flex-col overflow-hidden animate-in fade-in duration-300 font-sans">
      
      {/* 1. Header Bar - Minimal & Functional */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#09090b]">
        <div className="flex items-center gap-4">
          <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Aperture className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Studio Workspace</h1>
            <div className="flex items-center gap-2">
              <div className={`size-1.5 rounded-full ${stream ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_currentColor]`} />
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{stream ? 'SIGNAL_LOCKED' : 'NO_SIGNAL'}</span>
            </div>
          </div>
        </div>

        {/* Center Status Pill */}
        {isRecording && (
          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full animate-pulse">
            <div className="size-2 bg-rose-500 rounded-full" />
            <span className="text-xs font-mono font-bold text-rose-500 tracking-widest">{formatTime(recordingTime)}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button 
            onClick={() => { stopStream(); onClose(); }}
            className="size-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-zinc-400 hover:text-white"
            title="Close Session"
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
          <div className="relative w-full h-full max-w-6xl max-h-[80vh] aspect-video bg-[#18181b] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
            
            {/* Flash Effect Overlay */}
            <div className={`absolute inset-0 bg-white pointer-events-none z-[100] transition-opacity duration-150 ${flash ? 'opacity-100' : 'opacity-0'}`} />

            {/* Video Feed */}
            {stream ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transition-opacity duration-500 ${isCamOn ? 'opacity-100' : 'opacity-0'} ${activeSource === 'camera' ? 'scale-x-[-1]' : ''}`} 
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
                    <span className="text-4xl font-mono font-black text-white/20 tracking-tighter">
                      {isRecording ? formatTime(recordingTime) : '00:00'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Floating Action Bar */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-[#18181b]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50 transition-all hover:scale-105">
            {/* Source Toggle */}
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
               <button 
                 onClick={() => activeSource !== 'camera' && initCamera()}
                 className={`p-3 rounded-full transition-all ${activeSource === 'camera' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                 title="Switch to Camera"
               >
                 <CameraIcon className="size-5" />
               </button>
               <button 
                 onClick={() => activeSource !== 'screen' && initScreen()}
                 className={`p-3 rounded-full transition-all ${activeSource === 'screen' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                 title="Switch to Screen"
               >
                 <ScreenShare className="size-5" />
               </button>
            </div>

            {/* Main Triggers */}
            <button 
              onClick={toggleRecording}
              className={`size-16 rounded-full flex items-center justify-center border-4 transition-all shadow-xl ${isRecording ? 'border-rose-500 bg-rose-500/20' : 'border-white bg-white hover:bg-zinc-100'}`}
            >
              {isRecording ? (
                <div className="size-6 bg-rose-500 rounded-sm animate-pulse" />
              ) : (
                <div className="size-12 bg-rose-500 rounded-full border-2 border-white" />
              )}
            </button>

            <button 
              onClick={takeSnapshot}
              className="size-14 rounded-full bg-[#27272a] border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all shadow-lg active:scale-95 group"
              title="Snap Photo"
            >
              <Aperture className="size-6 group-hover:rotate-45 transition-transform duration-500" />
            </button>

            {/* Toggles */}
            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
               <button onClick={toggleMic} className={`p-3 rounded-full transition-all ${!isMicOn ? 'bg-rose-500/20 text-rose-500' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                 {isMicOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
               </button>
               <button onClick={() => setShowGrid(!showGrid)} className={`p-3 rounded-full transition-all ${showGrid ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                 <Grid className="size-5" />
               </button>
            </div>
          </div>
        </div>

        {/* 3. Right Sidebar (Assets & Settings) */}
        <aside className="w-80 bg-[#09090b] border-l border-white/10 flex flex-col">
          <div className="flex items-center border-b border-white/10">
            <button 
              onClick={() => setActiveTab('assets')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'assets' ? 'text-white bg-white/5 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Session Assets
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'text-white bg-white/5 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Settings
            </button>
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
                           <button className="p-2 bg-white text-black rounded-lg hover:scale-110 transition-transform shadow-lg" title="Download"><Download className="size-4" /></button>
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
          </div>
        </aside>
      </div>
    </div>
  );
};

const FloatingArchitecturalDoodles = ({ scrollY }: { scrollY: number }) => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-[0.04]">
    <div 
      className="absolute top-40 right-[-10%] w-[1000px] h-[1000px] text-indigo-900 transition-transform duration-700" 
      style={{ transform: `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.02}deg)` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
         <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 3" />
         <path d="M50,0 L50,100 M0,50 L100,50" stroke="currentColor" strokeWidth="0.05" />
         <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.05" />
      </svg>
    </div>
    <div 
      className="absolute bottom-20 left-10 w-96 h-96 text-indigo-950 transition-transform duration-700"
      style={{ transform: `translateY(${-scrollY * 0.15}px) rotate(${-scrollY * 0.01}deg)` }}
    >
       <BrainCircuit className="w-full h-full stroke-[0.3px]" />
    </div>
  </div>
);

const Captures: React.FC<CapturesProps> = ({ captures, onAddCapture, onDeleteCapture, onEditCapture, coverImage }) => {
  const [isWorkspaceMode, setIsWorkspaceMode] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isWorkspaceMode) {
    return <AutomatedSnapshotWorkspace captures={captures} onClose={() => setIsWorkspaceMode(false)} onDelete={onDeleteCapture} onEdit={onEditCapture} />;
  }

  return (
    <div className="relative min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <FloatingArchitecturalDoodles scrollY={scrollY} />

      <div className="p-10 max-w-7xl mx-auto space-y-20 relative z-10 animate-in fade-in duration-700 pb-32">
        <HeroBanner 
          title={<>System Capture <br />& Asset Mastering.</>}
          description="High-fidelity visual indexing for your professional portfolio. Stitched captures, neural masking, and sub-second asset deployment."
          imageUrl={coverImage || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200"}
          gradientFrom="from-[#0F172A]"
          gradientTo="to-[#1E293B]"
          className="shadow-[0_64px_128px_-32px_rgba(0,0,0,0.4)] border border-white/5 ring-1 ring-white/10"
          buttons={
            <div className="flex gap-5">
              <button 
                onClick={() => setIsWorkspaceMode(true)}
                className="flex items-center gap-3 bg-[#5E5CE6] text-white px-10 py-4 rounded-[28px] text-xs font-black uppercase tracking-[0.25em] hover:bg-indigo-500 hover:-translate-y-1 transition-all shadow-2xl active:scale-95 group"
              >
                <BrainCircuit className="size-5 group-hover:scale-110 transition-transform" />
                Enter Workspace
              </button>
              <button 
                onClick={onAddCapture}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-xl text-white px-10 py-4 rounded-[28px] text-xs font-black uppercase tracking-[0.25em] hover:bg-white/20 transition-all border border-white/10"
              >
                <Scissors className="size-5" />
                Manual Snap
              </button>
            </div>
          }
        />

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-14 bg-[#5E5CE6] rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-indigo-100 animate-pulse-subtle">
                <LayoutGrid className="size-7" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Verified Assets</h1>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">VAULT_SYNCED</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Distribution</span>
                </div>
              </div>
            </div>
            <p className="text-slate-500 font-medium text-lg max-w-xl">
              Access your master captures, technical annotations, and stitched production frames.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[24px] border border-slate-100">
             <div className="px-6 py-2 border-r border-slate-200">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Storage Status</div>
                <div className="text-xs font-black text-slate-900 tracking-wider">82% <span className="text-indigo-500 ml-1">STABLE</span></div>
             </div>
             <button className="p-3 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-[#5E5CE6] transition-all">
                <Activity className="size-5" />
             </button>
          </div>
        </div>

        <div className="relative min-h-[500px]">
          {captures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {captures.map(capture => (
                <div 
                  key={capture.id} 
                  className="group relative bg-white border border-slate-100 rounded-[56px] overflow-hidden hover:shadow-[0_64px_128px_-32px_rgba(94,92,230,0.2)] transition-all duration-700 cursor-default flex flex-col hover:-translate-y-2"
                >
                  <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                    <img 
                      src={capture.url} 
                      alt="Capture" 
                      className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-1000 opacity-90 group-hover:opacity-100" 
                    />
                    
                    <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                       <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/50 shadow-xl">
                          <span className="text-[9px] font-black text-[#5E5CE6] uppercase tracking-widest">MASTERED_V1</span>
                       </div>
                    </div>

                    <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
                      {onEditCapture && (
                        <button onClick={() => onEditCapture(capture)} className="size-11 bg-white/90 backdrop-blur-xl text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-2xl flex items-center justify-center">
                          <Pen className="size-5" />
                        </button>
                      )}
                      <button onClick={() => onDeleteCapture(capture.id)} className="size-11 bg-white/90 backdrop-blur-xl text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-2xl flex items-center justify-center">
                        <Trash2 className="size-5" />
                      </button>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                       <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl hover:bg-black transition-all">
                          Export Asset
                       </button>
                    </div>
                  </div>
                  <div className="p-10 space-y-6">
                    <div className="space-y-1">
                       <h3 className="font-black text-slate-900 text-xl tracking-tight truncate leading-none">{capture.title || 'ARCH_SNAPSHOT'}</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{capture.createdAt} • SYNCED_HUB_01</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2">
                         <div className="size-1.5 bg-emerald-500 rounded-full" />
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Stable Node</span>
                      </div>
                      <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">{capture.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full py-48 flex flex-col items-center justify-center bg-slate-50/50 rounded-[80px] border-2 border-dashed border-slate-100 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none grayscale group-hover:scale-110 transition-transform duration-1000">
                 <ImageLucide className="size-96 absolute -bottom-20 -right-20 rotate-12" />
              </div>

              <div className="relative z-10 text-center space-y-10 animate-in slide-in-from-bottom-8 duration-1000">
                <div className="size-32 bg-white rounded-[40px] shadow-2xl shadow-indigo-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-700">
                  <ImageLucide className="size-14 text-indigo-300 stroke-[1px]" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">The Vault is Silent.</h3>
                  <p className="text-slate-400 max-w-sm mx-auto font-medium text-lg leading-relaxed px-6">
                    Launch the Studio to begin capturing visual mastery for your team hub.
                  </p>
                </div>

                <button 
                  onClick={() => setIsWorkspaceMode(true)} 
                  className="bg-[#5E5CE6] text-white px-16 py-6 rounded-[32px] font-black text-base uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-2 transition-all active:scale-95 group"
                >
                  Enter Workspace <ArrowRight className="size-5 inline ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .animate-pulse-subtle {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Captures;
