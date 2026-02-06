
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Mic, Monitor, Square, X, Video, Loader2, MousePointer2, 
  Settings2, Play, Check, RefreshCw, BrainCircuit, 
  Trash2, Minimize2, Maximize2, Palette, Layout, User, Code, 
  Layers, AppWindow, UserCircle, Terminal, FileCode, PlayCircle,
  Hash, ChevronRight, Activity, Cpu, Play as PlayIcon, Share2,
  Globe, Send
} from 'lucide-react';
import { generateVideoInsights, analyzeCode } from '../services/geminiService';
import { Video as VideoType, CodeSnippet } from '../types';

declare const Prism: any;

interface RecorderProps {
  isMinimized?: boolean;
  onClose: () => void;
  onSave: (video: VideoType) => void;
  onSaveSnippet?: (snippet: CodeSnippet) => void;
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

const Recorder: React.FC<RecorderProps> = ({ isMinimized, onClose, onSave, onSaveSnippet, onRecordingStatusChange }) => {
  const [step, setStep] = useState<'setup' | 'recording' | 'preview' | 'processing'>('setup');
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeScene, setActiveScene] = useState<Scene>('standard');
  
  // Real Code Lab State
  const [codeValue, setCodeValue] = useState(MOCK_CODE);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['[SYS] READY. Awaiting code execution...']);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isPublishingSnippet, setIsPublishingSnippet] = useState(false);
  
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const camVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    const initCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: true 
        });
        currentStream = stream;
        setCamStream(stream);
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };
    initCam();
    return () => {
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

  useEffect(() => {
    if (camStream && camVideoRef.current) {
      camVideoRef.current.srcObject = camStream;
    }
  }, [camStream, step, activeScene]);

  useEffect(() => {
    if (screenStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

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

  const handleShareLab = async () => {
    if (!onSaveSnippet) return;
    setIsPublishingSnippet(true);
    setTerminalOutput(prev => [...prev, '>> SYNCHRONIZING_LAB_FOR_WORKSPACE...']);
    
    // Use Gemini to generate a title/desc for the snippet
    const analysis = await analyzeCode(codeValue);
    
    const newSnippet: CodeSnippet = {
      id: Math.random().toString(36).substr(2, 9),
      title: "Interactive Code Lab",
      description: analysis.slice(0, 150) + "...",
      code: codeValue,
      language: 'typescript',
      author: 'Me',
      createdAt: 'Just now'
    };
    
    setTimeout(() => {
      onSaveSnippet(newSnippet);
      setIsPublishingSnippet(false);
      alert("Code Lab published to library and share link copied!");
    }, 1200);
  };

  const startRecording = () => {
    if (!screenStream && !camStream && activeScene !== 'code') return;
    
    // Reset timer for fresh recording session
    setTimer(0);
    
    const combinedStream = new MediaStream([
      ...(screenStream?.getVideoTracks() || []),
      ...(camStream?.getAudioTracks() || []),
    ]);
    const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setPreviewUrl(URL.createObjectURL(blob));
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setStep('recording');
    onRecordingStatusChange?.(true);
    timerRef.current = window.setInterval(() => setTimer(t => t + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setStep('preview');
    onRecordingStatusChange?.(false);
  };

  const handleSave = async () => {
    setStep('processing');
    const canvas = document.createElement('canvas');
    if (screenVideoRef.current) {
      canvas.width = 1280; canvas.height = 720;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(screenVideoRef.current, 0, 0);
    }
    const frame = canvas.toDataURL('image/jpeg');
    const insights = await generateVideoInsights(frame, "Analyze this session and provide educational chapters.");
    const newVideo: VideoType = {
      id: Math.random().toString(36).substr(2, 9),
      title: insights?.suggestedTitle || `Show ${new Date().toLocaleDateString()}`,
      description: insights?.summary || "Recorded in Production Studio.",
      thumbnailUrl: frame,
      videoUrl: previewUrl || "",
      duration: formatTime(timer),
      createdAt: "Just now",
      author: "Me",
      views: 0,
      aiSummary: insights?.summary,
      chapters: insights?.chapters
    };
    onSave(newVideo);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isGhostMode = isMinimized && step === 'recording';

  const getCamStyles = () => {
    switch(activeScene) {
      case 'interview': return 'absolute right-0 top-0 bottom-0 w-1/2 rounded-none border-l-4 border-indigo-600 shadow-none';
      case 'code': return 'hidden';
      case 'presenter': return 'absolute inset-0 w-full h-full rounded-none border-none shadow-none z-10';
      default: return 'absolute bottom-10 right-10 w-56 h-56 rounded-full border-4 border-white shadow-2xl z-30';
    }
  };

  const getScreenStyles = () => {
    switch(activeScene) {
      case 'interview': return 'w-1/2 h-full absolute left-0 top-0';
      case 'presenter': return 'absolute top-10 right-10 w-80 h-44 border-4 border-white shadow-2xl z-40 rounded-3xl overflow-hidden';
      case 'code': return 'hidden';
      default: return 'w-full h-full';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${isGhostMode ? 'bg-transparent pointer-events-none' : 'bg-white/40 backdrop-blur-2xl p-6'}`}>
      <div className={`bg-white rounded-[64px] w-full max-w-7xl overflow-hidden shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)] flex flex-col relative border border-slate-100 transition-all ${isGhostMode ? 'h-0 opacity-0' : 'h-[90vh] opacity-100'}`}>
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-2xl tracking-tight">Production Studio</h2>
              <div className="flex items-center gap-2 mt-0.5">
                 <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {activeScene === 'code' ? 'Code Lab Engine Active' : 'Mastering Active'}
                 </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activeScene === 'code' && (
              <button 
                onClick={handleShareLab}
                disabled={isPublishingSnippet}
                className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all"
              >
                {isPublishingSnippet ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
                Share Lab
              </button>
            )}
            {step === 'recording' && (
              <div className="px-6 py-3 bg-rose-50 rounded-2xl flex items-center gap-4 border border-rose-100 animate-pulse">
                 <div className="w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(225,29,72,0.6)]"></div>
                 <span className="text-lg font-black text-rose-600 font-mono tracking-tighter">{formatTime(timer)}</span>
              </div>
            )}
            <button onClick={onClose} className="p-4 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 rounded-[24px] transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Recording Surface */}
        <div className="flex-1 bg-slate-100 relative group overflow-hidden flex items-center justify-center">
          
          {/* Normal Screen Capture View */}
          <div className={`transition-all duration-700 bg-slate-200 flex items-center justify-center overflow-hidden ${getScreenStyles()}`}>
            {step === 'setup' && !screenStream && activeScene !== 'code' && (
              <div className="text-center space-y-10 animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-[40px] flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100 shadow-inner">
                  <Monitor className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-indigo-950 text-3xl font-black tracking-tight">Share Your Screen</h3>
                  <p className="text-slate-400 text-base font-medium">This content will be shown alongside your camera in {activeScene} mode.</p>
                </div>
                <button 
                  onClick={handleStartScreenShare}
                  className="bg-indigo-600 text-white px-12 py-5 rounded-[28px] font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
                >
                  Share Window
                </button>
              </div>
            )}
            {activeScene === 'presenter' && !screenStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50">
                    <button onClick={handleStartScreenShare} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform">
                        <Share2 className="size-4" /> Add Screen Share to PiP
                    </button>
                </div>
            )}
            <video ref={screenVideoRef} autoPlay muted playsInline className={`w-full h-full object-contain ${(step === 'setup' && !screenStream && activeScene !== 'presenter') || activeScene === 'code' ? 'hidden' : 'block'}`} />
          </div>

          {/* REAL CODE ENGINE (Interactive Editor) */}
          {activeScene === 'code' && (
            <div className="absolute inset-0 bg-[#0f111a] flex flex-col animate-in fade-in zoom-in-95 duration-500">
              <div className="h-10 bg-[#0a0c14] border-b border-white/5 flex items-center px-6 gap-6">
                <div className="flex items-center gap-2">
                  <div className="size-3 bg-rose-500 rounded-full" />
                  <div className="size-3 bg-amber-500 rounded-full" />
                  <div className="size-3 bg-emerald-500 rounded-full" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                   <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                      <FileCode className="size-3 text-indigo-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">src / core / main.ts</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={runCodeLabAnalysis}
                        disabled={isRunningCode}
                        className="flex items-center gap-2 px-4 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all disabled:opacity-50"
                    >
                        {isRunningCode ? <Loader2 className="size-3 animate-spin" /> : <PlayIcon className="size-3 fill-current" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">Run & Explain</span>
                    </button>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                 <div className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-[#0a0c14]">
                    <Activity className="size-5 text-indigo-500/50" />
                    <Terminal className="size-5 text-slate-700" />
                    <Hash className="size-5 text-slate-700" />
                 </div>
                 
                 <div className="flex-1 relative code-editor-container overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0a0c14] flex flex-col items-center py-10 gap-0 text-slate-800 text-sm select-none z-10 border-r border-white/5">
                       {codeValue.split('\n').map((_, i) => <div key={i} className="h-[28px]">{i+1}</div>)}
                    </div>
                    
                    {/* Layered Editor: Textarea (hidden input) + Pre (visual highlighting) */}
                    <div className="relative h-full ml-12 overflow-y-auto no-scrollbar">
                        <textarea 
                            value={codeValue}
                            onChange={(e) => setCodeValue(e.target.value)}
                            className="absolute inset-0 w-full h-full p-10 bg-transparent border-none outline-none text-transparent caret-indigo-400 resize-none z-20 font-mono text-xl leading-[28px] overflow-hidden whitespace-pre no-scrollbar code-textarea"
                            spellCheck={false}
                        />
                        <pre className="absolute inset-0 w-full h-full p-10 pointer-events-none z-10 language-typescript leading-[28px] whitespace-pre text-xl">
                            <code className="language-typescript">{codeValue}</code>
                        </pre>
                    </div>
                    
                    <div className="absolute bottom-10 right-10 p-6 bg-indigo-600/10 backdrop-blur-xl border border-indigo-500/20 rounded-[32px] flex items-center gap-4 animate-pulse-subtle shadow-2xl z-30">
                       <BrainCircuit className="size-6 text-indigo-400" />
                       <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Genius Engine Active</span>
                    </div>
                 </div>
              </div>
              
              {/* Intelligent Terminal Output */}
              <div className="h-40 bg-[#0a0c14] border-t border-white/5 p-6 font-mono text-xs overflow-y-auto no-scrollbar">
                 <div className="text-emerald-400 mb-2 font-black flex items-center gap-2"><ChevronRight className="size-3" /> GENIUS_SYSTEM_LOG</div>
                 <div className="text-slate-400 leading-relaxed space-y-1">
                    {terminalOutput.map((log, i) => (
                        <div key={i} className={log.startsWith('[GENIUS]') ? 'text-indigo-400 font-bold bg-indigo-950/30 p-2 rounded-lg my-2' : ''}>
                            {log}
                        </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {(camStream || step === 'recording') && activeScene !== 'code' && (
            <div className={`overflow-hidden transition-all duration-700 bg-white border-4 border-white shadow-2xl flex items-center justify-center ${getCamStyles()}`}>
              {!camStream && <div className="animate-pulse flex flex-col items-center gap-2 text-slate-300">
                <UserCircle className="size-16" />
                <span className="text-[10px] font-black uppercase tracking-widest">Initializing...</span>
              </div>}
              {activeScene === 'presenter' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent mix-blend-screen pointer-events-none z-20" />
              )}
              <video 
                ref={camVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover scale-x-[-1] ${!camStream ? 'hidden' : 'block'}`} 
              />
            </div>
          )}

          {step === 'processing' && (
            <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center text-indigo-950 p-12 text-center space-y-10">
              <div className="relative">
                <div className="w-40 h-40 border-8 border-indigo-100 rounded-[48px] flex items-center justify-center">
                  <div className="w-32 h-32 border-t-8 border-indigo-600 rounded-[40px] animate-spin"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center"><BrainCircuit className="w-16 h-16 text-indigo-600" /></div>
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tighter">Analyzing Production</h2>
                <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-xs">Generating Chapters & Summary</p>
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
                  <div className="flex items-center gap-3 bg-rose-50/80 backdrop-blur-md border border-rose-100 px-6 py-4 rounded-[24px] shadow-sm animate-pulse">
                     <div className="size-2.5 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.6)]"></div>
                     <span className="text-xl font-black text-rose-600 font-mono tracking-tighter">{formatTime(timer)}</span>
                  </div>
                  <button 
                    id="finish-recording-btn"
                    onClick={stopRecording}
                    className="group flex items-center gap-5 bg-rose-600 text-white px-16 py-6 rounded-[32px] font-black text-xl transition-all shadow-2xl shadow-rose-200 hover:bg-rose-700 hover:-translate-y-1 active:scale-95"
                  >
                    <Square className="w-5 h-5 fill-white" />
                    Finish Show
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 4s ease-in-out infinite;
        }
        /* Fix for language highlighting colors in dark theme */
        .token.comment { color: #6a9955; }
        .token.function { color: #dcdcaa; }
        .token.keyword { color: #569cd6; }
        .token.string { color: #ce9178; }
        .token.operator { color: #d4d4d4; }
      `}</style>
    </div>
  );
};

export default Recorder;
