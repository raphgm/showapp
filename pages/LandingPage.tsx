
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
  Workflow, FolderOpen, BookOpen, Compass
} from 'lucide-react';
import Logo from '../components/Logo';
import { AppRoute } from '../types';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onNavigateInfo: (route: AppRoute) => void;
  onDevLogin: () => void;
  onContactSales?: () => void;
}

const PARTNER_LOGOS = [
  { name: 'Google', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' },
  { name: 'Microsoft', url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
  { name: 'NVIDIA', url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg' },
  { name: 'Figma', url: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg' },
  { name: 'Stripe', url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
  { name: 'Slack', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg' },
  { name: 'Adobe', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Adobe_Corporate_Logo.svg' },
  { name: 'OpenAI', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg' }
];

const UnifiedHero = ({ onSignUp, onContactSales }: { onSignUp: () => void, onContactSales: () => void }) => {
  return (
    <div className="relative w-full max-w-7xl mx-auto px-6">
       {/* Background Glows for the whole section */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl bg-indigo-50/50 blur-[120px] rounded-full pointer-events-none" />
       
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
                Async First. 
                {/* 3. Gradient text for the punchline - Using Logo Colors */}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b27b2] via-[#8227b2] to-[#b61cc9] pb-2 pl-2">
                  Show Don't Just 
                </span>
                <span className="relative inline-block text-slate-950 pl-2">
                  Meet.
                  {/* Subtle underline matching Cognitive Scale */}
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                     <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
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
             
             {/* 1. THE STUDIO CONSOLE (Dark Premium Capsule) - UPDATED REDESIGN */}
             <div className="relative z-20 w-full max-w-5xl bg-[#0B0F19] rounded-[24px] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.6)] border border-slate-800/60 overflow-hidden animate-in zoom-in-95 duration-1000 delay-300 group/console">
                {/* Top Bar */}
                <div className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-[#0B0F19]">
                   <div className="flex gap-2">
                      <div className="size-3 rounded-full bg-[#FF5F56]" />
                      <div className="size-3 rounded-full bg-[#FFBD2E]" />
                      <div className="size-3 rounded-full bg-[#27C93F]" />
                   </div>
                   <div className="flex items-center gap-8 text-[10px] font-mono font-medium text-slate-500 uppercase tracking-widest">
                      <div className="flex items-center gap-2 text-rose-500 font-bold">
                         <div className="size-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                         REC
                      </div>
                      <span>00:12:43:18</span>
                      <span>4K_HDR</span>
                   </div>
                   <div className="w-10"></div> {/* Spacer for center alignment balance */}
                </div>

                {/* Main Viewport */}
                <div className="relative aspect-[21/9] flex items-center justify-center p-12 bg-[#0B0F19] overflow-hidden">
                   
                   {/* Background Glow */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                   {/* Neural Net Badge (Top Left) */}
                   <div className="absolute top-8 left-8 bg-[#131620] border border-white/5 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-sm group-hover/console:translate-x-2 transition-transform duration-700">
                      <div className="flex items-center gap-2 mb-1.5">
                         <div className="size-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center border border-[#4ADE80]/20">
                            <BrainCircuit className="size-2.5 text-[#4ADE80]" />
                         </div>
                         <span className="text-[9px] font-black text-[#4ADE80] uppercase tracking-[0.2em]">Neural Net</span>
                      </div>
                      <div className="text-xl font-medium text-white tracking-tight font-mono">Active_Scan</div>
                   </div>

                   {/* Bitrate Badge (Bottom Right) */}
                   <div className="absolute bottom-8 right-8 bg-[#131620] border border-white/5 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-sm text-right group-hover/console:-translate-x-2 transition-transform duration-700">
                      <div className="flex items-center justify-end gap-2 mb-1.5">
                         <span className="text-[9px] font-black text-[#818CF8] uppercase tracking-[0.2em]">Bitrate</span>
                         <Activity className="size-3 text-[#818CF8]" />
                      </div>
                      <div className="text-xl font-medium text-white tracking-tight font-mono">48 Mbps</div>
                   </div>

                   {/* Central Waveform */}
                   <div className="flex items-end gap-1.5 h-32 relative z-10 w-full max-w-2xl justify-center opacity-90">
                      {Array.from({ length: 42 }).map((_, i) => {
                        // Create a symmetric-ish waveform shape
                        const center = 21;
                        const dist = Math.abs(i - center);
                        const baseHeight = Math.max(10, 80 - (dist * 3)); // Bell curve shape
                        const randomVar = Math.random() * 30;
                        const height = Math.min(100, baseHeight + randomVar);
                        
                        return (
                           <div 
                              key={i} 
                              className="w-2.5 rounded-full bg-gradient-to-t from-[#4f46e5] to-[#818cf8] shadow-[0_0_15px_rgba(99,102,241,0.25)] animate-waveform"
                              style={{ 
                                 height: `${height}%`, 
                                 animationDelay: `${i * 0.05}s`,
                                 opacity: 0.6 + (Math.random() * 0.4)
                              }} 
                           />
                        );
                      })}
                   </div>
                </div>
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
                        
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative z-10 mt-6">
                           <div 
                             className={`h-full ${item.color.replace('text', 'bg')} animate-progress-bar`} 
                             style={{ width: '0%', animationDelay: `${i * 1.5}s` }}
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
                             className={`h-full ${item.color.replace('text', 'bg')} animate-progress-bar`} 
                             style={{ width: '0%', animationDelay: `${i * 1.5}s` }}
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

const LandingPage: React.FC<LandingPageProps> = ({ 
  onSignIn, 
  onSignUp, 
  onDevLogin, 
  onNavigateInfo,
  onContactSales 
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const footerLinks = [
    {
      title: 'PLATFORM',
      links: [
        { label: 'Studio Engine', route: AppRoute.HOME },
        { label: 'Infinite Boards', route: AppRoute.BOARDS },
        { label: 'Asset Vault', route: AppRoute.LIBRARY },
        { label: 'Intelligence Feed', route: AppRoute.SUMMARIES },
      ]
    },
    {
      title: 'KNOWLEDGE',
      links: [
        { label: 'Help Center', route: AppRoute.HELP },
        { label: 'System Blog', route: AppRoute.BLOG },
        { label: 'Community Hub', route: AppRoute.COMMUNITY },
        { label: 'Developer API', route: AppRoute.EXTENSION },
      ]
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'Our Mission', route: AppRoute.ABOUT },
        { label: 'Careers', route: AppRoute.CAREERS },
        { label: 'Technical Sales', route: AppRoute.CONTACT },
        { label: 'Press Kit', route: AppRoute.PRESS_KIT },
      ]
    },
    {
      title: 'GOVERNANCE',
      links: [
        { label: 'Security Protocols', route: AppRoute.SECURITY },
        { label: 'Data Sovereignty', route: AppRoute.PRIVACY },
        { label: 'Terms of Sync', route: AppRoute.TERMS },
        { label: 'Compliance Hub', route: AppRoute.ENTERPRISE },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1e293b] selection:bg-indigo-100 selection:text-indigo-900 font-sans overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <div className="absolute -top-1/4 -right-1/4 w-[80%] h-[80%] bg-indigo-500/5 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 -left-1/4 w-[60%] h-[60%] bg-rose-500/5 blur-[160px] rounded-full" />
        <svg className="absolute -top-40 -right-40 w-[1200px] h-[1200px] text-indigo-900 opacity-[0.06]" viewBox="0 0 100 100">
           <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.15" strokeDasharray="1 4" />
           <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.08" />
           <path d="M50,0 V100 M0,50 H100" stroke="currentColor" strokeWidth="0.05" strokeDasharray="1 2" />
        </svg>
        <div className="absolute top-[30%] left-[4%] text-[11px] font-black tracking-[0.8em] text-indigo-950 rotate-90 origin-left uppercase opacity-40">
           SHOW_ASYNC_ENGINE :: [DEPLOYED]
        </div>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 0.8px, transparent 0.8px)', backgroundSize: '50px 50px' }}></div>
        <BrainCircuit className="absolute top-[15%] right-[20%] size-[500px] text-indigo-600 opacity-[0.04] stroke-[0.5px]" />
        <Sparkles className="absolute bottom-[20%] left-[10%] size-[200px] text-rose-500 opacity-[0.04]" />
      </div>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'h-20 bg-white/90 backdrop-blur-2xl border-b border-slate-100 shadow-sm' : 'h-24 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo showText={true} />
          </div>
          <div className="hidden lg:flex items-center gap-10">
            {['Product', 'Solutions', 'Enterprise', 'Pricing'].map(l => (
              <button key={l} onClick={() => onNavigateInfo(l.toLowerCase() as any)} className="text-sm font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onDevLogin} className="px-4 h-6 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:border-indigo-200 hover:text-indigo-600 transition-all leading-none">Dev Access</button>
            <button onClick={onSignIn} className="text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Sign in</button>
            <button onClick={onSignUp} className="bg-slate-950 text-white px-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-900/10 hover:bg-black transition-all active:scale-95 leading-none">
              Join Show
            </button>
          </div>
        </div>
      </nav>

      {/* Unified Hero Section */}
      <section className="relative pt-32 pb-0 flex flex-col items-center z-10">
        <UnifiedHero onSignUp={onSignUp} onContactSales={onContactSales || (() => {})} />
      </section>

      <section className="pt-12 pb-24 border-y border-slate-50 relative z-10 overflow-hidden bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-10 mb-12">
           <div className="text-[11px] font-black text-slate-300 uppercase tracking-[0.6em] text-center">Powering Global Instructional Hubs</div>
        </div>
        <div className="flex animate-marquee whitespace-nowrap gap-24 py-4">
           {PARTNER_LOGOS.map((partner, i) => (
             <div key={i} className="flex items-center gap-6 opacity-70 hover:opacity-100 transition-all duration-300 cursor-default group">
               <div className="size-12 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <img src={partner.url} alt={partner.name} className="w-full h-full object-contain" />
               </div>
               <span className="text-xl font-black text-slate-400 group-hover:text-indigo-600 tracking-tighter uppercase transition-colors">{partner.name}</span>
             </div>
           ))}
           {PARTNER_LOGOS.map((partner, i) => (
             <div key={`dup-${i}`} className="flex items-center gap-6 opacity-70 hover:opacity-100 transition-all duration-300 cursor-default group">
               <div className="size-12 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <img src={partner.url} alt={partner.name} className="w-full h-full object-contain" />
               </div>
               <span className="text-xl font-black text-slate-400 group-hover:text-indigo-600 tracking-tighter uppercase transition-colors">{partner.name}</span>
             </div>
           ))}
        </div>
      </section>

      {/* OUTSTANDING MISSION CONTROL - FULL WIDTH COMMAND BAR */}
      <section className="relative z-10 bg-white">
        <div className="w-full bg-[#050507] border-y border-white/10 relative overflow-hidden group/command">
           {/* Internal Architectural Doodles */}
           <div className="absolute inset-0 opacity-[0.06] pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-transparent to-rose-500/5 opacity-50 pointer-events-none" />
           <div className="absolute -left-40 top-0 size-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
           
           <div className="w-full px-10 lg:px-20 py-12 flex flex-col xl:flex-row items-center justify-between gap-16 relative z-10">
              {/* Strategic Command Block */}
              <div className="flex-1 space-y-6 text-center xl:text-left">
                <div className="space-y-4">
                   <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-indigo-600/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.5em] border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.15)]">
                     <Target className="size-3.5" /> Ready for Global Async
                   </div>
                   <h2 className="text-5xl md:text-6xl font-black text-white tracking-[-0.04em] leading-none">Establish your <span className="text-indigo-500">async hub.</span></h2>
                   <p className="text-base lg:text-lg text-slate-500 font-medium max-w-xl xl:mx-0 mx-auto leading-relaxed">
                     Join 45,000+ technical architects building the future of shared expertise.
                   </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-5 pt-2 justify-center xl:justify-start">
                   <button onClick={onSignUp} className="h-14 px-10 bg-white text-slate-950 rounded-[20px] font-black text-[11px] uppercase tracking-[0.25em] shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:bg-indigo-50 hover:-translate-y-1 transition-all active:scale-95 leading-none">Start Studio Free</button>
                   <button onClick={onContactSales} className="h-14 px-10 bg-white/5 text-white border border-white/10 rounded-[20px] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-white/10 transition-all leading-none group/sales">
                      Talk to Sales <ArrowUpRight className="size-3.5 inline ml-2 opacity-40 group-hover/sales:opacity-100 transition-all" />
                   </button>
                </div>
              </div>

              {/* High-Performance HUD Telemetry */}
              <div className="w-full xl:w-auto grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-14 shrink-0 border-t xl:border-t-0 xl:border-l border-white/10 pt-10 xl:pt-0 xl:pl-16 relative">
                {[
                  { label: 'Latency', val: '< 60ms', icon: ZapIcon, detail: 'Proprietary Bridge', color: 'text-rose-500' },
                  { label: 'Encoding', val: '4K Native', icon: ShieldCheck, detail: 'Hardware Accel', color: 'text-indigo-400' },
                  { label: 'Edge Nodes', val: '420+', icon: Globe, detail: 'Global Overlay', color: 'text-amber-500' },
                  { label: 'Security', val: 'AES-512', icon: Lock, detail: 'Quantum Ready', color: 'text-emerald-400' }
                ].map((stat, i) => (
                  <div key={i} className="space-y-4 group/stat relative">
                    <div className={`size-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center ${stat.color} group-hover/stat:scale-110 group-hover/stat:bg-white/10 transition-all shadow-inner`}>
                       <stat.icon className="size-6" />
                       <div className={`absolute top-0 right-0 size-2 rounded-full ${stat.color.replace('text', 'bg')} animate-pulse blur-[2px] opacity-60`} />
                    </div>
                    <div className="space-y-1.5">
                       <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none font-mono flex items-center gap-2">
                          {stat.label}
                       </div>
                       <div className="text-3xl font-black text-white tracking-tighter font-mono leading-none group-hover/stat:text-indigo-400 transition-colors">
                          {stat.val}
                       </div>
                       <div className={`text-[9px] font-black ${stat.color} uppercase tracking-[0.2em] font-mono opacity-50 group-hover/stat:opacity-100 transition-opacity`}>
                          {stat.detail}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
           
           {/* Scanline and HUD Detail */}
           <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />
           <div className="absolute top-4 right-10 text-[8px] font-black text-white/10 tracking-[0.5em] pointer-events-none uppercase">SHOW_OS_V2.4_LIVE_ENGINE</div>
        </div>
      </section>

      <footer className="bg-white pb-20 relative z-10 border-t border-slate-100 pt-20">
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 pb-32">
            <div className="lg:col-span-4 space-y-8">
              <Logo showText={true} className="scale-110 origin-left" />
              <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xs">
                The operating system for high-performance team alignment. <span className="text-indigo-600 font-bold">Show Don't Just Meet.</span>
              </p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-12">
               {footerLinks.map((group) => (
                 <div key={group.title} className="space-y-8">
                   <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-2">
                     <div className="size-1 bg-indigo-600 rounded-full" /> {group.title}
                   </h4>
                   <ul className="space-y-4">
                     {group.links.map((link) => (
                       <li key={link.label}>
                         <button 
                           onClick={() => onNavigateInfo(link.route)}
                           className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors text-left"
                         >
                           {link.label}
                         </button>
                       </li>
                     ))}
                   </ul>
                 </div>
               ))}
            </div>
          </div>
          <div className="pt-16 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12">
             <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
               <span>© 2025 SS LABS GLOBAL PRODUCTION</span>
               <span className="size-1 rounded-full bg-slate-200 hidden sm:block"></span>
               <span className="flex items-center gap-2">SF / LDN / LOS</span>
             </div>
             <div className="flex items-center gap-12">
               {['TWITTER', 'LINKEDIN', 'GITHUB', 'DISCORD'].map(social => (
                 <button key={social} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.35em] transition-colors font-mono">
                   {social}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4); }
        }
        .animate-waveform {
          animation: waveform 1.2s ease