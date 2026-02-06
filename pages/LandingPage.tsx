
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Video, Activity, ListTodo, Monitor, 
  Layers, Sparkles, BrainCircuit, Globe, ChevronRight,
  Search, Bell, Camera, Users, Target, Zap, MousePointer2,
  ShieldCheck, Lock, Terminal, Cpu, HardDrive, Play,
  LayoutGrid, Share2, Fingerprint, Network, Command,
  Inbox, MessageSquare, Radio, Phone, Zap as ZapIcon,
  Activity as Heartbeat, ArrowUpRight, Gauge,
  Mic, Circle, Shield, Cpu as Processor, Aperture, Database,
  Workflow, FolderOpen, BookOpen, Compass, Settings,
  MoreVertical, CheckCircle2, MessageCircle,
  Scissors, Bot, User, FileCode, StickyNote, Move, Link2,
  Maximize2, PanelBottom, GripHorizontal, Square, Pen, Server,
  Code, Eye
} from 'lucide-react';
import Logo from '../components/Logo';
import { AppRoute } from '../types';
import LandingHeader from '../components/LandingHeader';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onNavigateInfo: (route: AppRoute) => void;
  onDevLogin: () => void;
  onContactSales?: () => void;
}

interface DoodleProps {
  doodle1Style: React.CSSProperties;
  doodle2Style: React.CSSProperties;
  textStyle: React.CSSProperties;
  brainStyle: React.CSSProperties;
}

const LandingPageDoodles: React.FC<DoodleProps> = ({ doodle1Style, doodle2Style, textStyle, brainStyle }) => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Large faint blueprint circles */}
        <svg style={doodle1Style} className="absolute -top-1/4 -right-1/4 w-[1000px] h-[1000px] text-slate-900 opacity-[0.03] transition-transform duration-500 ease-out" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 4" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.05" />
        </svg>
        <svg style={doodle2Style} className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] text-slate-900 opacity-[0.03] transition-transform duration-500 ease-out" viewBox="0 0 100 100">
            <path d="M0,0 L100,100 M100,0 L0,100" stroke="currentColor" strokeWidth="0.05" />
            <rect x="20" y="20" width="60" height="60" rx="30" fill="none" stroke="currentColor" strokeWidth="0.1" />
        </svg>

        {/* Rotated text */}
        <div style={textStyle} className="absolute top-[20%] left-[-2rem] text-[9px] font-black text-slate-300 origin-left uppercase tracking-[0.5em] font-mono transition-transform duration-500 ease-out">
            OS_CORE :: [STABLE_NODE]
        </div>

        {/* Faint watermark icon */}
        <BrainCircuit style={brainStyle} className="absolute top-[5%] right-[5%] size-[400px] text-indigo-500 opacity-[0.04] transition-transform duration-500 ease-out" strokeWidth={0.3} />
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onSignUp, onNavigateInfo, onDevLogin, onContactSales }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [doodleStyles, setDoodleStyles] = useState({
    doodle1: {},
    doodle2: {},
    text: { transform: 'rotate(90deg)' },
    brain: {},
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      setDoodleStyles({
        doodle1: { transform: `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.02}deg)` },
        doodle2: { transform: `translateY(${-scrollY * 0.15}px) rotate(${-scrollY * 0.01}deg)` },
        text: { transform: `translateX(${-scrollY * 0.05}px) rotate(90deg)` },
        brain: { transform: `translateY(${scrollY * 0.05}px) rotate(${scrollY * 0.03}deg)` },
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const DemoPill = () => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [elapsed, setElapsed] = useState(262); // Start at 04:22 for visual interest
    const [isPaused, setIsPaused] = useState(false);
    const [activeTool, setActiveTool] = useState<string | null>(null);

    useEffect(() => {
      if (isPaused) return;
      const i = setInterval(() => setElapsed(e => e + 1), 1000);
      return () => clearInterval(i);
    }, [isPaused]);

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    useEffect(() => {
      const onMove = (e: MouseEvent) => {
        if (!isDragging) return;
        setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      };
      const onUp = () => setIsDragging(false);
      if (isDragging) {
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      }
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }, [isDragging, dragStart]);

    const format = (s: number) => {
      const m = Math.floor(s / 60).toString().padStart(2, '0');
      const sec = (s % 60).toString().padStart(2, '0');
      return `${m}:${sec}`;
    };

    const handleStop = () => {
      setElapsed(0);
      setIsPaused(true);
      // Simple visual feedback for "cannot save"
      alert("Demo Mode: Recording simulation ended. Sign up to save productions.");
    };

    return (
      <div 
        className="absolute bottom-8 left-1/2 z-40 select-none"
        style={{ transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)` }}
      >
          <div className="relative group/pill">
              <div className={`flex items-center gap-1 p-2 bg-[#0F1115]/90 backdrop-blur-3xl border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] rounded-[32px] ring-1 ring-white/10 transition-transform duration-300 ${isDragging ? 'scale-105 cursor-grabbing' : 'hover:scale-105'}`}>
                  <div 
                    className="p-3 text-zinc-500 cursor-grab active:cursor-grabbing hover:text-white transition-colors"
                    onMouseDown={handleMouseDown}
                  >
                    <GripHorizontal className="size-4" />
                  </div>
                  
                  <div 
                    className="flex items-center gap-3 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20 ml-1 mr-2 cursor-pointer hover:bg-rose-500/20 transition-colors"
                    onClick={() => setIsPaused(!isPaused)}
                    title={isPaused ? "Resume" : "Pause"}
                  >
                      <div className={`size-2 rounded-full bg-rose-500 ${!isPaused ? 'animate-pulse' : ''} shadow-[0_0_10px_rgba(244,63,94,0.5)]`}></div>
                      <span className="text-[10px] font-mono font-bold text-rose-500 w-8 text-center">{format(elapsed)}</span>
                  </div>

                  <div className="w-px h-6 bg-white/10 mx-1"></div>

                  <div className="flex items-center gap-1">
                      {[
                        { id: 'monitor', Icon: Monitor },
                        { id: 'scissors', Icon: Scissors },
                        { id: 'pen', Icon: Pen }
                      ].map(({ id, Icon }) => (
                        <div 
                          key={id}
                          onClick={() => setActiveTool(activeTool === id ? null : id)}
                          className={`p-3 rounded-full transition-all cursor-pointer ${activeTool === id ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`}
                        >
                          <Icon className="size-4" />
                        </div>
                      ))}
                  </div>

                  <div className="w-px h-6 bg-white/10 mx-1"></div>

                  <div 
                    onClick={handleStop}
                    className="p-3 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/20 hover:bg-indigo-50 transition-all cursor-pointer active:scale-95"
                    title="Finish Recording"
                  >
                      <Square className="size-3 fill-current" />
                  </div>
              </div>
          </div>
      </div>
    );
  };

  const UnifiedHero = ({ onSignUp, onContactSales }: { onSignUp: () => void, onContactSales: () => void }) => {
    return (
      <div className="relative w-full max-w-7xl mx-auto px-6">
         {/* Background Glows for the whole section */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl bg-indigo-50/50 blur-[120px] rounded-full pointer-events-none" />
         
         <style>{`
           @keyframes scan-line {
             0% { transform: translateX(-100%); }
             100% { transform: translateX(100%); }
           }
           .animate-scan-line {
             animation: scan-line 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
           }
         `}</style>

         <div className="relative z-10 flex flex-col items-center text-center space-y-16 py-24 pb-8">
            {/* Combined Headline */}
            <div className="space-y-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
               
               {/* 1. Badge: Tech-forward, precise */}
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-default">
                  <Sparkles className="size-3 text-indigo-500 fill-indigo-500" />
                  <span>Async Operating System</span>
               </div>

               {/* 2. Main Title: Massive scale, tight tracking for impact */}
               <h1 className="text-6xl md:text-8xl font-black text-slate-950 tracking-tighter leading-[0.9]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b27b2] via-[#8227b2] to-[#b61cc9]">Show</span> Don't Just <span className="relative">Meet.
                      <svg className="absolute w-full h-4 -bottom-2 left-0" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b27b2" />
                            <stop offset="50%" stopColor="#8227b2" />
                            <stop offset="100%" stopColor="#b61cc9" />
                          </linearGradient>
                        </defs>
                        <path d="M0 5 Q 50 10 100 5" stroke="url(#underlineGradient)" strokeWidth="7" fill="none" />
                      </svg>
                    </span>
                </h1>

               {/* 4. Sub-headline: Strong bridge text */}
               <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto">
                  <p className="text-2xl md:text-4xl text-slate-900 font-bold tracking-tight">
                     Instructional Design at <span className="text-indigo-600">
                       Cognitive Scale.
                     </span>
                  </p>
                  
                  {/* 5. Body Copy: Readable, centered, professional */}
                  <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto">
                     The operating system that goes beyond meetings and recordings—transforming every conversation, video, and interaction into structured, searchable, and reusable knowledge for your entire organization.
                  </p>
               </div>
               
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                  <button onClick={onSignUp} className="h-16 px-12 bg-slate-950 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.25em] shadow-2xl hover:bg-black hover:shadow-indigo-900/20 hover:-translate-y-1 transition-all flex items-center gap-3">
                     Start Production <ArrowRight className="size-4" />
                  </button>
                  <button onClick={onContactSales} className="h-16 px-12 bg-white text-slate-900 border border-slate-200 rounded-[24px] font-black text-sm uppercase tracking-[0.25em] hover:border-indigo-200 hover:text-indigo-600 transition-all">
                     View Architecture
                  </button>
               </div>
            </div>

            {/* Deconstructed Visual Container */}
            <div className="w-full relative flex flex-col items-center pt-12">
               
               {/* 1. CINEMATIC STUDIO WORKSPACE (Live Session View) */}
               <div className="relative z-20 w-full max-w-6xl aspect-[16/9] bg-[#000000] rounded-[32px] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.6)] border border-slate-800/60 overflow-hidden animate-in zoom-in-95 duration-1000 delay-300 group/desktop relative">
                  
                  {/* Clean Professional Background - Reverted */}
                  <div className="absolute inset-0 bg-[#0F1115]">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1b26] to-[#0F1115]" />
                      <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                  </div>

                  {/* Main Application Window */}
                  <div className="absolute top-8 left-8 right-8 bottom-24 bg-[#0F1115]/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                      {/* Window Header */}
                      <div className="h-12 bg-[#18181b] border-b border-white/5 flex items-center px-4 justify-between shrink-0">
                          <div className="flex items-center gap-4">
                              <div className="flex gap-2">
                                  <div className="size-3 rounded-full bg-[#FF5F56]" />
                                  <div className="size-3 rounded-full bg-[#FFBD2E]" />
                                  <div className="size-3 rounded-full bg-[#27C93F]" />
                              </div>
                              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/5">
                                  <Lock className="size-3 text-emerald-500" />
                                  <span className="text-[10px] font-medium text-slate-400">show.app/studio/arch-review-v9</span>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-md border border-rose-500/20">
                                <div className="size-2 rounded-full bg-rose-500 animate-pulse"></div>
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Live • 04:22</span>
                             </div>
                             <div className="flex -space-x-2">
                                {[1,2,3,4].map(i => <div key={i} className="size-6 rounded-full bg-slate-700 border-2 border-[#18181b] shadow-sm"></div>)}
                             </div>
                          </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 flex overflow-hidden">
                          {/* Sidebar: Files */}
                          <div className="w-16 border-r border-white/5 bg-[#0A0C10] flex flex-col items-center py-4 gap-6">
                              <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Layers className="size-4 text-white" /></div>
                              <div className="size-8 text-slate-600 hover:text-white transition-colors"><Search className="size-4" /></div>
                              <div className="size-8 text-slate-600 hover:text-white transition-colors"><LayoutGrid className="size-4" /></div>
                              <div className="mt-auto size-8 text-slate-600 hover:text-white transition-colors"><Settings className="size-4" /></div>
                          </div>

                          {/* Editor Panes */}
                          <div className="flex-1 flex">
                              {/* Code/Text Editor */}
                              <div className="flex-1 bg-[#0F1115] p-6 font-mono text-sm relative border-r border-white/5">
                                  <div className="text-slate-500 mb-2">// System Architecture Definition</div>
                                  <div className="space-y-1">
                                      <div className="text-purple-400">interface <span className="text-yellow-300">HubConfig</span> {'{'}</div>
                                      <div className="pl-4 text-indigo-300">latency: <span className="text-rose-400">'low'</span>;</div>
                                      <div className="pl-4 text-indigo-300">syncMode: <span className="text-rose-400">'realtime'</span>;</div>
                                      <div className="pl-4 text-indigo-300">encryption: <span className="text-rose-400">'AES-256'</span>;</div>
                                      <div className="text-purple-400">{'}'}</div>
                                      <br />
                                      <div className="text-blue-400">const <span className="text-yellow-300">deployNode</span> = async () ={'>'} {'{'}</div>
                                      <div className="pl-4 text-slate-400">// Initializing neural bridge...</div>
                                      <div className="pl-4 text-indigo-400">await <span className="text-emerald-300">System.init()</span>;</div>
                                  </div>
                                  
                                  {/* Floating Cursor */}
                                  <div className="absolute top-32 left-32 flex items-center gap-2 animate-bounce-slow z-20">
                                      <MousePointer2 className="size-4 text-indigo-500 fill-indigo-500" />
                                      <span className="px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-bold rounded">You</span>
                                  </div>
                              </div>

                              {/* Visual Preview */}
                              <div className="w-[40%] bg-[#0A0C10] relative overflow-hidden flex items-center justify-center border-l border-white/5">
                                  <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                  {/* 3D Object Representation */}
                                  <div className="relative size-40 animate-spin-slow">
                                      <div className="absolute inset-0 border-2 border-indigo-500 rounded-full skew-x-12 opacity-60"></div>
                                      <div className="absolute inset-0 border-2 border-rose-500 rounded-full -skew-y-12 opacity-60"></div>
                                      <div className="absolute inset-0 border-2 border-emerald-500 rounded-full scale-110 opacity-40"></div>
                                  </div>
                                  <div className="absolute bottom-4 right-4 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-black/50 px-2 py-1 rounded">Render Preview</div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Floating Elements */}
                  
                  {/* 1. Presenter Bubble */}
                  <div className="absolute bottom-32 right-12 size-48 rounded-[32px] overflow-hidden border-4 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 bg-zinc-900">
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-90" />
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg">
                            <Mic className="size-3 text-emerald-400" />
                            <div className="h-2 w-8 flex items-end gap-0.5">
                               {[1,2,3,4].map(i => <div key={i} className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`}}></div>)}
                            </div>
                         </div>
                      </div>
                  </div>

                  {/* 2. Genius AI Sidebar */}
                  <div className="absolute top-24 right-12 w-72 bg-[#0F1115]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl z-20 animate-in fade-in slide-in-from-right-4 duration-1000 delay-700 flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div className="flex items-center gap-2">
                             <Sparkles className="size-4 text-indigo-400" />
                             <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Genius Intelligence</span>
                          </div>
                          <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-3">
                          <div className="flex gap-3">
                              <div className="w-0.5 h-full bg-indigo-500 rounded-full shrink-0 min-h-[30px]"></div>
                              <div className="space-y-1">
                                 <p className="text-[10px] text-zinc-300 leading-relaxed font-medium">"I'm detecting a discussion about <span className="text-white font-bold">Latency</span>. Should I pull up the edge network logs?"</p>
                                 <div className="flex gap-2">
                                    <button className="px-3 py-1 bg-indigo-600/20 border border-indigo-600/30 rounded text-[9px] font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all">Yes, show logs</button>
                                 </div>
                              </div>
                          </div>
                          <div className="flex gap-3 opacity-50">
                              <div className="w-0.5 h-full bg-zinc-700 rounded-full shrink-0 min-h-[20px]"></div>
                              <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Analyzing architectural diagram...</p>
                          </div>
                      </div>
                  </div>

                  {/* THE SHOW PILL (Controller) - Interactive */}
                  <DemoPill />

               </div>

               {/* 2. THE NEURAL BRIDGE (Connector) */}
               <div className="relative z-10 w-full h-40 flex justify-center items-center -mt-8 pb-8">
                  {/* Data flowing down visualization */}
                  <div className="absolute inset-0 flex justify-center gap-24 pointer-events-none">
                     {[1, 2, 3].map((i, idx) => (
                        <div 
                          key={i} 
                          className="w-[3px] h-full bg-gradient-to-b from-indigo-200 via-indigo-500 to-indigo-200 relative overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.6)] rounded-full opacity-0 animate-connect"
                          style={{ animationDelay: `${0.6 + (idx * 0.2)}s` }}
                        >
                           <div className="absolute top-0 w-full h-24 bg-white blur-[4px] animate-scanline" style={{ animationDelay: `${1.2 + (idx * 0.2)}s` }} />
                        </div>
                     ))}
                  </div>

                  <div className="relative bg-white pl-2 pr-6 py-3 rounded-full border-2 border-indigo-50 text-[10px] font-black text-indigo-950 uppercase tracking-[0.3em] z-20 shadow-[0_20px_50px_rgba(99,102,241,0.15)] flex items-center gap-4 group/proc animate-in zoom-in duration-700 delay-500">
                     <div className="size-8 rounded-full bg-indigo-600 flex items-center justify-center border border-indigo-400 group-hover/proc:scale-110 transition-transform text-white shadow-lg">
                        <Workflow className="size-4 animate-spin-slow" />
                     </div>
                     Synthesizing Instructional Blocks
                  </div>
               </div>

               {/* 3. THE COGNITIVE GRID (Light Mode Cards) */}
               <div className="relative z-10 w-full -mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {[
                       { 
                         title: 'Signal Processing', 
                         desc: 'Real-time 4K ingestion with hardware-accelerated encoding pipelines.', 
                         icon: Activity, 
                         color: 'text-rose-600', 
                         bg: 'bg-rose-50', 
                         border: 'hover:border-rose-200' 
                       },
                       { 
                         title: 'Global Mesh', 
                         desc: 'Distributed edge caching ensuring sub-50ms playback latency worldwide.', 
                         icon: Globe, 
                         color: 'text-indigo-600', 
                         bg: 'bg-indigo-50', 
                         border: 'hover:border-indigo-200' 
                       },
                       { 
                         title: 'Sentinel Security', 
                         desc: 'SOC2 Type II compliant governance with granular audit telemetry.', 
                         icon: ShieldCheck, 
                         color: 'text-emerald-600', 
                         bg: 'bg-emerald-50', 
                         border: 'hover:border-emerald-200' 
                       },
                       { 
                         title: 'Deep Indexing', 
                         desc: 'Vector-based semantic search across audio, visual, and code context.', 
                         icon: BrainCircuit, 
                         color: 'text-amber-600', 
                         bg: 'bg-amber-50', 
                         border: 'hover:border-amber-200' 
                       }
                     ].map((item, i) => (
                       <div 
                          key={i} 
                          className={`bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-2xl transition-all group/card ${item.border} flex flex-col justify-between h-full relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700`}
                          style={{ animationDelay: `${0.8 + (i * 0.1)}s` }}
                       >
                          {/* Ambient Pulse Background */}
                          <div className={`absolute inset-0 ${item.bg} opacity-0 animate-pulse-slow`} style={{ animationDelay: `${i * 2}s` }}></div>
                          
                          <div className="relative z-10">
                             <div className={`size-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6 ${item.color} shadow-sm border border-black/5`}>
                                <item.icon className="size-7" />
                             </div>
                             <h4 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{item.title}</h4>
                             <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                          </div>
                          
                          {/* Animated Line */}
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative z-10 mt-6">
                             <div 
                               className={`h-full w-full ${item.color.replace('text', 'bg')} animate-scan-line origin-left`} 
                               style={{ animationDelay: `${i * 0.5}s` }}
                             />
                          </div>
                       </div>
                     ))}
                  </div>
                  
                  <div className="mt-20 mb-16 text-center">
                     <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">System Architecture v2.4</p>
                  </div>

                  {/* FULL FEATURE GRID (10 Items) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                     {[
                       { title: 'Studio', desc: 'Creative command center.', icon: Monitor, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-200' },
                       { title: 'Knowledge Hub', desc: 'Series & documentation.', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' },
                       { title: 'Explore', desc: 'Trending content.', icon: Compass, color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-200' },
                       { title: 'Asset Vault', desc: 'Secure recordings.', icon: FolderOpen, color: 'text-slate-600', bg: 'bg-slate-50', border: 'hover:border-slate-200' },
                       { title: 'Boards', desc: 'Infinite ideation.', icon: LayoutGrid, color: 'text-pink-600', bg: 'bg-pink-50', border: 'hover:border-pink-200' },
                       { title: 'Roadmap', desc: 'Production pipeline.', icon: ListTodo, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'hover:border-cyan-200' },
                       { title: 'Meetings', desc: 'Sync & async spaces.', icon: Video, color: 'text-violet-600', bg: 'bg-violet-50', border: 'hover:border-violet-200' },
                       { title: 'Chat', desc: 'Team comms & AI.', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
                       { title: 'Captures', desc: 'Visual indexing.', icon: Camera, color: 'text-rose-600', bg: 'bg-rose-50', border: 'hover:border-rose-200' },
                       { title: 'Teams', desc: 'People & permissions.', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50', border: 'hover:border-orange-200' },
                     ].map((item, i) => (
                       <div 
                          key={i} 
                          className={`bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-2xl transition-all group/card ${item.border} flex flex-col justify-between h-full relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700`}
                          style={{ animationDelay: `${0.9 + (i * 0.05)}s` }}
                       >
                          <div className={`absolute inset-0 ${item.bg} opacity-0 animate-pulse-slow`} style={{ animationDelay: `${i * 2}s` }}></div>
                          
                          <div className="relative z-10">
                             <div className={`size-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4 ${item.color} shadow-sm border border-black/5`}>
                                <item.icon className="size-6" />
                             </div>
                             <h4 className="text-lg font-bold text-slate-900 mb-1.5 tracking-tight leading-none">{item.title}</h4>
                             <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                          </div>
                          
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative z-10 mt-6">
                             <div 
                               className={`h-full w-full ${item.color.replace('text', 'bg')} animate-scan-line origin-left`} 
                               style={{ animationDelay: `${i * 0.2}s` }}
                             />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen w-full bg-white relative font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LandingPageDoodles 
        doodle1Style={doodleStyles.doodle1}
        doodle2Style={doodleStyles.doodle2}
        textStyle={doodleStyles.text}
        brainStyle={doodleStyles.brain}
      />
      <LandingHeader isScrolled={isScrolled} onSignIn={onSignIn} onSignUp={onSignUp} onNavigateInfo={onNavigateInfo} />
      <main>
        <UnifiedHero onSignUp={onSignUp} onContactSales={onContactSales!} />

        {/* Final Black CTA Strip */}
        <div className="w-full bg-[#050505] py-8 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
                        <Sparkles className="size-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg tracking-tight">Ready to build your knowledge hub?</span>
                        <span className="text-slate-500 text-xs font-medium">Join 20,000+ teams recording with Show.</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest hidden md:block">NO CREDIT CARD REQUIRED</span>
                    <button 
                        onClick={onSignUp}
                        className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-50 hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        Join Show <ArrowRight className="size-3" />
                    </button>
                </div>
            </div>
        </div>
        
        {/* Footer */}
        <footer className="py-24 border-t border-slate-100 bg-white">
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-1 space-y-6">
                 <Logo showText={true} />
                 <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    The operating system for asynchronous knowledge work. Built for teams who value clarity over meetings.
                 </p>
                 <div className="flex gap-4">
                    <button onClick={onDevLogin} className="text-slate-400 hover:text-indigo-600 text-xs font-mono uppercase tracking-widest transition-colors">[DEV_LOGIN]</button>
                 </div>
              </div>
              
              <div className="space-y-6">
                 <h4 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Product</h4>
                 <ul className="space-y-3 text-slate-500 text-sm font-medium">
                    <li><button onClick={() => onNavigateInfo(AppRoute.PRODUCT)} className="hover:text-indigo-600 transition-colors">Features</button></li>
                    <li><button onClick={() => onNavigateInfo(AppRoute.SOLUTIONS)} className="hover:text-indigo-600 transition-colors">Solutions</button></li>
                    <li><button onClick={() => onNavigateInfo(AppRoute.ENTERPRISE)} className="hover:text-indigo-600 transition-colors">Enterprise</button></li>
                    <li><button onClick={() => onNavigateInfo(AppRoute.PRICING)} className="hover:text-indigo-600 transition-colors">Pricing</button></li>
                    <li><button onClick={() => onNavigateInfo(AppRoute.ROADMAP)} className="hover:text-indigo-600 transition-colors">Changelog</button></li>
                 </ul>
              </div>

              <div className="space-y-6">
                 <h4 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Company</h4>
                 <ul className="space-y-3 text-slate-500 text-sm font-medium">
                    <li><button onClick={() => onNavigateInfo(AppRoute.ABOUT)} className="hover:text-indigo-600 transition-colors">About</button></li>
                    <li><button onClick={() => onNavigateInfo(AppRoute.CAREERS)} className="hover:text-indigo-600 transition-colors">Careers</button></li>
                    <li><button onClick={() => onNavigateInfo(AppRoute.BLOG)} className="hover:text-indigo-600 transition-colors">Blog</button></li>
                    <li><button onClick={() => onNavigateInfo(AppRoute.CONTACT)} className="hover:text-indigo-600 transition-colors">Contact</button></li>
                 </ul>
              </div>

              <div className="space-y-6">
                 <h4 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Legal</h4>
                 <ul className="space-y-3 text-slate-500 text-sm font-medium">
                    <li><button onClick={() => onNavigateInfo(AppRoute.PRIVACY)} className="hover:text-indigo-600 transition-colors">Privacy</button></li>
                    <li><button onClick={() => onNavigateInfo(AppRoute.TERMS)} className="hover:text-indigo-600 transition-colors">Terms</button></li>
                    <li><button onClick={() => onNavigateInfo(AppRoute.SECURITY)} className="hover:text-indigo-600 transition-colors">Security</button></li>
                 </ul>
              </div>
           </div>
           <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2025 SS Labs Global.</p>
              <div className="flex gap-6">
                 {['Twitter', 'LinkedIn', 'GitHub'].map(social => (
                    <button key={social} className="text-slate-400 hover:text-indigo-600 text-xs font-bold uppercase tracking-widest transition-colors">{social}</button>
                 ))}
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
