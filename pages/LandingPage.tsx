import React, { useState, useEffect, useRef } from 'react';
// FIX: Imported `PlayCircle` to resolve missing component error.
import {
  ArrowRight, Video, Activity, ListTodo, Monitor, Home,
  Layers, Sparkles, BrainCircuit, Globe, ChevronRight,
  Search, Bell, Camera, Users, Target, Zap, MousePointer2,
  ShieldCheck, Lock, Terminal, Cpu, HardDrive, Play,
  PlayCircle,
  LayoutGrid, Share2, Fingerprint, Network, Command,
  Inbox, MessageSquare, Radio, Phone, Zap as ZapIcon,
  Activity as Heartbeat, ArrowUpRight, Gauge,
  Mic, Circle, Shield, Cpu as Processor, Aperture, Database,
  Workflow, FolderOpen, BookOpen, Compass, Settings,
  MoreVertical, CheckCircle2, MessageCircle,
  Scissors, Bot, User, FileCode, StickyNote, Move, Link2,
  Maximize2, PanelBottom, GripHorizontal, Square, Pen, Server,
  Code, Eye,
  Puzzle,
  Loader2, RefreshCw, Chrome, X, Palette, Check
} from 'lucide-react';
import Logo from '../components/Logo';
import StreamStudioHeroBanner from '../components/StreamStudioHeroBanner';
import { AppRoute } from '../types';
import LandingHeader from '../components/LandingHeader';
import PageDoodles from '../components/PageDoodles';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onNavigateInfo: (route: AppRoute) => void;
  onDevLogin: () => void;
  onContactSales?: () => void;
}

// ...existing code...

// Place the Stream Studio Hero Banner prominently after the header

// ...existing code...

const hubModules = [
  {
    id: AppRoute.HOME,
    icon: Monitor,
    title: 'Studio',
    description: 'Creative command center for all your productions.',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: AppRoute.COURSES,
    icon: BookOpen,
    title: 'Knowledge Hub',
    description: 'Curate series, courses, and official documentation.',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: AppRoute.FOR_YOU,
    icon: Compass,
    title: 'Explore',
    description: 'Discover trending shows and content in the hub.',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: AppRoute.LIBRARY,
    icon: FolderOpen,
    title: 'Asset Vault',
    description: 'Manage all your secure recordings and media assets.',
    bgColor: 'bg-slate-100',
    iconColor: 'text-slate-600',
  },
  {
    id: AppRoute.BOARDS,
    icon: LayoutGrid,
    title: 'Boards',
    description: 'Infinite canvas for spatial ideation and planning.',
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    id: AppRoute.ROADMAP,
    icon: ListTodo,
    title: 'Roadmap',
    description: 'Organize and prioritize your production pipeline.',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    id: AppRoute.MEETINGS,
    icon: Video,
    title: 'Meetings',
    description: 'Run your sync and async collaboration spaces.',
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    id: AppRoute.SUMMARIES,
    icon: BrainCircuit,
    title: 'Genius AI',
    description: 'Automated summaries, transcripts, and insights.',
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    id: AppRoute.CAPTURES,
    icon: Camera,
    title: 'Captures',
    description: 'High-fidelity visual indexing and snapshots.',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  {
    id: AppRoute.COMMAND_PALETTE,
    icon: Command,
    title: 'Command Palette',
    description: 'Navigate your entire workspace with just a few keystrokes.',
    bgColor: 'bg-slate-100',
    iconColor: 'text-slate-600',
  },
  {
    id: AppRoute.SHOW_PILL,
    icon: Aperture,
    title: 'Show Pill',
    description: 'An ambient, always-on recorder to capture inspiration instantly.',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: AppRoute.SECURITY,
    icon: ShieldCheck,
    title: 'Security',
    description: 'Enterprise-grade encryption, compliance, and governance.',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
];


interface DoodleProps {
  doodle1Style: React.CSSProperties;
  doodle2Style: React.CSSProperties;
  doodle3Style: React.CSSProperties;
  doodle4Style: React.CSSProperties;
  textStyle: React.CSSProperties;
  brainStyle: React.CSSProperties;
  blueprintStyle: React.CSSProperties;
}

const LandingPageDoodles: React.FC<DoodleProps> = ({ doodle1Style, doodle2Style, doodle3Style, doodle4Style, textStyle, brainStyle, blueprintStyle }) => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
    {/* Large faint blueprint circles */}
    <svg style={doodle1Style} className="absolute -top-1/4 -right-1/4 w-[1000px] h-[1000px] text-slate-900 opacity-[0.06] transition-transform duration-500 ease-out" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 4" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.05" />
    </svg>
    <svg style={doodle2Style} className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] text-slate-900 opacity-[0.06] transition-transform duration-500 ease-out" viewBox="0 0 100 100">
      <path d="M0,0 L100,100 M100,0 L0,100" stroke="currentColor" strokeWidth="0.05" />
      <rect x="20" y="20" width="60" height="60" rx="30" fill="none" stroke="currentColor" strokeWidth="0.1" />
    </svg>

    {/* New Doodle 3 - Concentric Arcs */}
    <svg style={doodle3Style} className="absolute bottom-[10%] right-[5%] w-[200px] h-[200px] text-slate-900 opacity-[0.05] transition-transform duration-500 ease-out" viewBox="0 0 100 100">
      <path d="M 90 50 A 40 40 0 0 1 50 90" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <path d="M 80 50 A 30 30 0 0 1 50 80" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <path d="M 70 50 A 20 20 0 0 1 50 70" fill="none" stroke="currentColor" strokeWidth="0.2" />
    </svg>

    {/* New Doodle 4 - Small Schematic */}
    <svg style={doodle4Style} className="absolute top-[15%] left-[10%] w-[150px] h-[150px] text-slate-900 opacity-[0.06] transition-transform duration-500 ease-out" viewBox="0 0 100 100">
      <rect x="20" y="20" width="60" height="60" rx="5" fill="none" stroke="currentColor" strokeWidth="0.4" />
      <path d="M20,50 H0 M80,50 H100 M50,20 V0 M50,80 V100" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 2" />
      <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.2" />
    </svg>

    {/* NEW Blueprint Doodle */}
    <svg style={blueprintStyle} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vh] h-[150vh] text-indigo-900 opacity-[0.07] transition-transform duration-500 ease-out" viewBox="0 0 400 400">
      <defs>
        <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="currentColor" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#dot-grid)" />
      <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <path d="M200,20 L200,380 M20,200 L380,200" stroke="currentColor" strokeWidth="0.2" strokeDasharray="5 5" />

      {/* Left side schematic */}
      <circle cx="100" cy="150" r="5" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <path d="M100,150 H 50 V 120" fill="none" stroke="currentColor" strokeWidth="0.2" />
      <circle cx="100" cy="250" r="5" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <path d="M100,250 H 50 V 280" fill="none" stroke="currentColor" strokeWidth="0.2" />
      <path d="M50,180 H 80" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />

      {/* Top-ish star doodle */}
      <path d="M240,100 l5,15 l15,-10 l-10,15 l15,5 l-15,-5 l10,15 l-15,-10 l-5,15 l5,-15 l-15,10 l10,-15 l-15,-5 l15,5 l-10,-15 l15,10 Z" fill="none" stroke="currentColor" strokeWidth="0.4" />
      <circle cx="235" cy="130" r="3" fill="currentColor" opacity="0.5" />
    </svg>

    {/* Rotated text */}
    <div style={textStyle} className="absolute top-[20%] left-[-2rem] text-[9px] font-black text-slate-300 origin-left uppercase tracking-[0.5em] font-mono transition-transform duration-500 ease-out">
      OS_CORE :: [STABLE_NODE]
    </div>

    {/* Faint watermark icon */}
    <svg style={brainStyle} viewBox="0 0 100 100" className="absolute top-[5%] right-[5%] size-[400px] text-indigo-500 opacity-[0.08] transition-transform duration-500 ease-out">
      <circle cx="25" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.8" />

      {/* Top wavy connector */}
      <path d="M50,30 C65,25 75,35 90,30" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="95" cy="30" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="95" cy="30" r="1" fill="none" stroke="currentColor" strokeWidth="0.5" />

      {/* Middle-top straight connector */}
      <path d="M50,40 L90,40" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="95" cy="40" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="95" cy="40" r="1" fill="none" stroke="currentColor" strokeWidth="0.5" />

      {/* Middle-bottom straight connector */}
      <path d="M50,60 L90,60" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="95" cy="60" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="95" cy="60" r="1" fill="none" stroke="currentColor" strokeWidth="0.5" />

      {/* Bottom wavy connector */}
      <path d="M50,70 C65,75 75,65 90,70" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="95" cy="70" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="95" cy="70" r="1" fill="none" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  </div>
);

const HeroSection = ({ onSignUp, onContactSales }: { onSignUp: () => void, onContactSales: () => void }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mockupHovered, setMockupHovered] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-24 sm:pt-32 lg:pt-40 pb-16">
      {/* Animated background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl bg-indigo-50/50 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet-100/40 blur-[100px] rounded-full pointer-events-none animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute top-40 right-10 w-64 h-64 bg-pink-100/30 blur-[80px] rounded-full pointer-events-none animate-[pulse_5s_ease-in-out_infinite_0.5s]" />

      {/* Hero Text Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 shadow-sm transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <Sparkles className="size-3 text-indigo-500 fill-indigo-500 animate-[spin_3s_linear_infinite]" />
          Async Operating System
        </div>
        <h1
          className={`text-5xl md:text-7xl font-black text-slate-950 tracking-tighter leading-[1.05] transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="text-black">Show</span> It. Don't Just <span className="relative inline-block">Meet.<span className="absolute left-0 -bottom-2 w-full h-2 bg-gradient-to-r from-[#3b27b2] via-[#8227b2] to-[#b61cc9] rounded-full animate-[scaleX_0.8s_ease-out_0.5s_both] origin-left" /></span>
        </h1>
        <p
          className={`text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          The OS that transforms interactions into structured, searchable, and reusable knowledge. Record, analyze, and share — all in one place.
        </p>
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <button onClick={onSignUp} className="group h-14 px-10 bg-slate-950 text-white rounded-[20px] font-black text-sm uppercase tracking-[0.2em] shadow-lg hover:bg-black hover:-translate-y-1 hover:shadow-xl transition-all flex items-center gap-3">
            Start Recording Free <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={onContactSales} className="group h-14 px-8 bg-white text-slate-700 rounded-[20px] font-bold text-sm border border-slate-200 hover:border-indigo-200 hover:text-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2 shadow-sm hover:shadow">
            Book a Demo <Play className="size-4 fill-current group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <p
          className={`text-xs text-slate-400 font-bold uppercase tracking-widest transition-all duration-700 delay-[400ms] ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          No credit card required · Free forever for individuals
        </p>
      </div>

      {/* Product Mockup / Screenshot */}
      <div
        className={`relative z-10 mt-16 max-w-5xl mx-auto group/mockup transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        onMouseEnter={() => setMockupHovered(true)}
        onMouseLeave={() => setMockupHovered(false)}
      >
        {/* Floating animation wrapper */}
        <div className={`transition-transform duration-1000 ease-out ${mockupHovered ? 'scale-[1.02]' : ''}`} style={{ animation: 'float 6s ease-in-out infinite' }}>
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 shadow-[0_20px_80px_-20px_rgba(79,70,229,0.15)] bg-white transition-all duration-700 group-hover/mockup:shadow-[0_30px_100px_-20px_rgba(79,70,229,0.3)] group-hover/mockup:border-indigo-200/60">
            {/* Browser chrome bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[#f6f6f6] border-b border-[#e5e5e5]">
              <div className="flex gap-2">
                <div className="size-3 rounded-full bg-[#ff5f57] border border-[#e0443e]"></div>
                <div className="size-3 rounded-full bg-[#febc2e] border border-[#dea123]"></div>
                <div className="size-3 rounded-full bg-[#28c840] border border-[#1aab29]"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-1 bg-white rounded-md border border-[#ddd] text-[11px] text-slate-500 font-medium w-72 justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
                  <Lock className="size-2.5 text-emerald-500" />
                  <span className="text-slate-400">https://</span>getshowapp.com<span className="text-slate-400">/studio</span>
                </div>
              </div>
              <div className="flex gap-3 text-slate-400">
                {/* Removed browser chrome bar buttons as requested */}
              </div>
            </div>

            {/* App UI mockup */}
            <div className="relative bg-[#fafbfe] flex" style={{ height: '460px' }}>
              {/* Sidebar */}
              <div className="w-[210px] bg-white border-r border-slate-100/80 flex flex-col shrink-0">
                {/* Logo area */}
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-50">
                  <div className="size-8 rounded-full bg-gradient-to-br from-[#3b27b2] via-[#8227b2] to-[#b61cc9] flex items-center justify-center shadow-md shadow-purple-500/30">
                    <svg viewBox="0 0 24 24" className="size-3.5 text-white fill-white ml-0.5" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}>
                      <path d="M5.5 4.866a1.5 1.5 0 0 1 2.227-1.313l13.5 7.42a1.5 1.5 0 0 1 0 2.626l-13.5 7.42A1.5 1.5 0 0 1 5.5 19.706V4.866Z" />
                    </svg>
                  </div>
                  <span className="text-[15px] font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#3b27b2] via-[#8227b2] to-[#b61cc9]">Show</span>
                </div>

                {/* Search */}
                <div className="px-3 pt-3 pb-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-400">
                    <Search className="size-3" /> <span>Search</span>
                    <span className="ml-auto text-[9px] bg-white border border-slate-200 rounded px-1 py-0.5 font-mono text-slate-400">⌘K</span>
                  </div>
                </div>

                <div className="px-3 pt-2 flex flex-col gap-0.5 flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2.5 mb-1 mt-1">Workspace</p>
                  {[
                    { icon: Home, label: 'Show Studio', active: true, badge: null },
                    { icon: Aperture, label: 'Snap Studio', active: false, badge: 'New' },
                    { icon: Radio, label: 'Stream Studio', active: false, badge: null },
                    { icon: MessageCircle, label: 'Chat', active: false, badge: '3' },
                    { icon: Users, label: 'Teams', active: false, badge: null },
                    { icon: BookOpen, label: 'Knowledge Hub', active: false, badge: null },
                    { icon: Compass, label: 'Explore', active: false, badge: null },
                    { icon: FolderOpen, label: 'Asset Vault', active: false, badge: null },
                    { icon: LayoutGrid, label: 'Boards', active: false, badge: 'New' },
                  ].map((item, i) => {
                    const NavIcon = item.icon;
                    return (
                      <div key={i} className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[12px] transition-colors ${item.active ? 'bg-indigo-50/80 text-indigo-700 font-bold shadow-sm shadow-indigo-500/5' : 'text-slate-500 font-medium hover:bg-slate-50'}`}>
                        <NavIcon className={`size-[15px] ${item.active ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>{item.badge}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom section */}
                <div className="px-3 pb-3 pt-2 border-t border-slate-50 space-y-0.5">
                  <div className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[12px] font-medium text-slate-500">
                    <BrainCircuit className="size-[15px] text-slate-400" /> <span>AI Intelligence</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[12px] font-medium text-slate-500">
                    <Settings className="size-[15px] text-slate-400" /> <span>Settings</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-[6px]">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="" className="size-6 rounded-full object-cover ring-2 ring-white shadow-sm" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-700 block truncate leading-none">Creator</span>
                      <span className="text-[9px] text-slate-400 font-medium">Host</span>
                    </div>
                    <MoreVertical className="size-3 text-slate-300 ml-auto" />
                  </div>
                </div>
              </div>

              {/* Main content area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80 bg-white/60 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[15px] font-black text-slate-900 tracking-tight">Show Studio</h3>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">3 active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-[6px] rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-400 font-medium w-44">
                      <Search className="size-3" /> Filter productions...
                    </div>
                    <div className="h-7 w-px bg-slate-100"></div>
                    {/* Removed 'New Show' button as requested */}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 space-y-4 overflow-hidden">
                  {/* Production cards grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        title: 'Q4 Product Launch',
                        subtitle: 'Product team · 4 scenes',
                        status: 'LIVE',
                        statusColor: 'bg-red-500',
                        statusGlow: 'shadow-red-500/50',
                        img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400',
                        viewers: '12',
                        time: '04:32',
                        progress: 35,
                      },
                      {
                        title: 'Design System v3.0',
                        subtitle: 'Design ops · 2 scenes',
                        status: 'RECORDING',
                        statusColor: 'bg-rose-500',
                        statusGlow: '',
                        img: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&q=80&w=400',
                        viewers: '8',
                        time: '12:15',
                        progress: 78,
                      },
                      {
                        title: 'Weekly Standup',
                        subtitle: 'Engineering · 1 scene',
                        status: 'COMPLETE',
                        statusColor: 'bg-emerald-500',
                        statusGlow: '',
                        img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=400',
                        viewers: '24',
                        time: '45:02',
                        progress: 100,
                      },
                    ].map((card, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm group/card cursor-pointer hover:shadow-lg hover:border-slate-200 transition-all duration-300">
                        {/* Thumbnail with real image */}
                        <div className="h-[100px] relative overflow-hidden">
                          <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <div className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                              <Play className="size-4 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                          <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full ${card.status === 'LIVE' ? 'bg-red-500 shadow-md ' + card.statusGlow : 'bg-black/40 backdrop-blur-sm'}`}>
                            <div className={`size-1.5 rounded-full ${card.status === 'LIVE' ? 'bg-white animate-pulse' : card.statusColor}`}></div>
                            <span className="text-[8px] font-black text-white uppercase tracking-wider">{card.status}</span>
                          </div>
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm">
                            <Circle className="size-1.5 text-red-400 fill-red-400" />
                            <span className="text-[9px] font-mono text-white/90 tabular-nums">{card.time}</span>
                          </div>
                          <div className="absolute bottom-2 left-2 flex -space-x-1.5">
                            {['from-indigo-400 to-blue-500', 'from-rose-400 to-pink-500', 'from-amber-400 to-orange-500'].map((g, j) => (
                              <div key={j} className={`size-5 rounded-full border-2 border-white bg-gradient-to-br ${g} shadow-sm`}></div>
                            ))}
                            {Number(card.viewers) > 3 && (
                              <div className="size-5 rounded-full border-2 border-white bg-slate-700 flex items-center justify-center shadow-sm">
                                <span className="text-[7px] font-bold text-white">+{Number(card.viewers) - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-3 space-y-2">
                          <div>
                            <p className="text-[12px] font-bold text-slate-800 truncate leading-none">{card.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{card.subtitle}</p>
                          </div>
                          {/* Progress bar */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${card.progress === 100 ? 'bg-emerald-500' : card.progress > 50 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                style={{ width: `${card.progress}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold tabular-nums">{card.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Insights strip */}
                  <div className="rounded-xl bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/50 border border-indigo-100/60 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shadow-sm shrink-0">
                        <BrainCircuit className="size-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Genius AI</p>
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">3 action items extracted from "Q4 Product Launch" — <span className="text-indigo-600 font-bold">Assign owner to finalize rollout timeline</span></p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Removed Dismiss and View All buttons as requested */}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="flex gap-3">
                    {[
                      { icon: CheckCircle2, text: 'Sarah reviewed "Design System v3.0"', time: '2m ago', color: 'text-emerald-500' },
                      { icon: MessageCircle, text: '4 new comments on "Weekly Standup"', time: '8m ago', color: 'text-blue-500' },
                      { icon: Zap, text: 'AI transcript ready for "Q4 Launch"', time: '12m ago', color: 'text-amber-500' },
                    ].map((item, i) => {
                      const ActivityIcon = item.icon;
                      return (
                        <div key={i} className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                          <ActivityIcon className={`size-3.5 ${item.color} shrink-0`} />
                          <span className="text-[10px] text-slate-600 font-medium truncate">{item.text}</span>
                          <span className="text-[9px] text-slate-300 font-medium shrink-0 ml-auto">{item.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Animated glow behind mockup */}
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200/30 via-purple-200/20 to-pink-200/30 blur-3xl rounded-3xl -z-10 animate-pulse"></div>
        {/* Floating particles */}
        <div className="absolute -top-8 left-1/4 size-3 rounded-full bg-indigo-400/20 animate-[float_4s_ease-in-out_infinite]" />
        <div className="absolute -bottom-4 right-1/3 size-2 rounded-full bg-violet-400/30 animate-[float_5s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/2 -right-6 size-4 rounded-full bg-pink-400/20 animate-[float_6s_ease-in-out_infinite_0.5s]" />
      </div>

      {/* Social Proof Stats */}
      <div className={`relative z-10 mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {[
          { value: '20,000+', label: 'Teams worldwide' },
          { value: '4.2M', label: 'Shows recorded' },
          { value: '15hrs/wk', label: 'Avg. time saved' },
          { value: '99.9%', label: 'Uptime SLA' },
        ].map((stat, i) => (
          <div key={i} className="text-center group hover:scale-110 transition-transform cursor-default">
            <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{stat.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const FeaturesSection: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const [pathLengths, setPathLengths] = useState({ path1: 0, path2: 0 });

  useEffect(() => {
    const path1 = path1Ref.current;
    const path2 = path2Ref.current;
    if (path1) {
      const length = path1.getTotalLength();
      setPathLengths(prev => ({ ...prev, path1: length }));
      path1.style.strokeDasharray = `${length}`;
      path1.style.strokeDashoffset = `${length}`;
    }
    if (path2) {
      const length = path2.getTotalLength();
      setPathLengths(prev => ({ ...prev, path2: length }));
      path2.style.strokeDasharray = `${length}`;
      path2.style.strokeDashoffset = `${length}`;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Split modules into featured (first 3 larger) and rest
  const featuredModules = hubModules.slice(0, 3);
  const restModules = hubModules.slice(3);

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 relative overflow-hidden bg-white border-y border-slate-100">
      {/* Background Schematic Lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full text-slate-900/5" width="100%" height="100%">
          <defs>
            <pattern id="features-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#features-grid)" />
        </svg>

        <svg className="absolute top-0 left-0 w-full h-full text-slate-900/5">
          <path
            ref={path1Ref}
            d="M-100,250 C 200,100 500,100 800,250 S 1400,400 1700,250"
            stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="4 8"
            style={{ transition: 'stroke-dashoffset 2s ease-out 0.5s', strokeDashoffset: isVisible ? 0 : pathLengths.path1 }}
          />
          <path
            ref={path2Ref}
            d="M-100,550 C 200,700 500,700 800,550 S 1400,400 1700,550"
            stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="4 8"
            style={{ transition: 'stroke-dashoffset 2s ease-out 0.8s', strokeDashoffset: isVisible ? 0 : pathLengths.path2 }}
          />
        </svg>
        <div>
          <div className="absolute top-[15%] left-[25%] text-[9px] font-mono font-black text-slate-400 uppercase tracking-[0.3em] transition-all duration-1000 ease-out"
            style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? 0 : '20px'})`, transitionDelay: '1.2s' }}>
            [NODE_01_SYNC]
          </div>
          <div className="absolute top-[75%] right-[25%] text-[9px] font-mono font-black text-slate-400 uppercase tracking-[0.3em] transition-all duration-1000 ease-out"
            style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? 0 : '20px'})`, transitionDelay: '1.4s' }}>
            [CORE_API_RESPONSE]
          </div>
          <Cpu className="absolute top-[50%] left-[10%] size-24 text-slate-900/5 transition-all duration-1000 ease-out" strokeWidth={0.5}
            style={{ opacity: isVisible ? 1 : 0, transform: `scale(${isVisible ? 1 : 0.8})`, transitionDelay: '1.6s' }} />
          <Layers className="absolute top-[20%] right-[10%] size-16 text-slate-900/5 transition-all duration-1000 ease-out" strokeWidth={0.5}
            style={{ opacity: isVisible ? 1 : 0, transform: `scale(${isVisible ? 1 : 0.8})`, transitionDelay: '1.8s' }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            A Modular OS for <span className="relative inline-block">Async Communication<span className="absolute left-0 -bottom-1.5 w-full h-1.5 bg-gradient-to-r from-[#3b27b2] via-[#8227b2] to-[#b61cc9] rounded-full" /></span>
          </h2>
          <p className="text-lg text-slate-500 mt-4 font-medium leading-relaxed">
            Show is an integrated suite of powerful, asynchronous tools. Each module is designed to work in concert, creating a seamless production workflow from capture to distribution.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="space-y-4">
          {/* Top row — 3 featured cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredModules.map((module, i) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className={`group relative p-8 rounded-3xl border border-slate-100 bg-white hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden`}
                  style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ease-out ${i * 0.1}s, transform 0.6s ease-out ${i * 0.1}s` }}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${module.bgColor} rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity`}></div>
                  <div className={`size-12 rounded-2xl ${module.bgColor} flex items-center justify-center mb-5 shadow-sm`}>
                    <Icon className={`size-6 ${module.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{module.title}</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{module.description}</p>
                  <ArrowUpRight className="absolute top-6 right-6 size-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              );
            })}
          </div>

          {/* Bottom rows — remaining modules in 3-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restModules.map((module, i) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className={`group relative p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-500 cursor-pointer flex items-start gap-4`}
                  style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ease-out ${0.3 + i * 0.06}s, transform 0.6s ease-out ${0.3 + i * 0.06}s` }}
                >
                  <div className={`size-10 rounded-xl ${module.bgColor} flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className={`size-5 ${module.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight mb-1">{module.title}</h3>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{module.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const MOCK_INSIGHTS = [
  [
    { type: 'Key Decision', icon: CheckCircle2, color: 'indigo', content: 'Adopt new GraphQL API standard for all v3 services.', timestamp: '0:42' },
    { type: 'Action Item', icon: User, color: 'amber', content: 'Draft migration plan for the deprecated REST endpoints.', assignee: { name: 'Sarah', avatar: '...' }, timestamp: '1:15' },
    { type: 'Core Concept', icon: BrainCircuit, color: 'emerald', content: 'Centralize the authentication flow using a JWT provider.', explanation: 'This simplifies cross-service auth and improves security.', timestamp: '2:30' },
  ],
  [
    { type: 'Key Decision', icon: CheckCircle2, color: 'indigo', content: 'Approve Q4 budget for the new "Cognitive Scale" initiative.', timestamp: '3:18' },
    { type: 'Core Concept', icon: BrainCircuit, color: 'emerald', content: 'Implement a multi-tenant architecture for workspace isolation.', explanation: 'Enhances security and allows for custom data sovereignty rules.', timestamp: '5:50' },
    { type: 'Action Item', icon: User, color: 'amber', content: 'Schedule a design review for the updated Studio UI mockups.', assignee: { name: 'Marcus', avatar: '...' }, timestamp: '8:05' },
  ],
  [
    { type: 'Action Item', icon: User, color: 'amber', content: 'Investigate performance bottlenecks in the video mastering pipeline.', assignee: { name: 'Team', avatar: '...' }, timestamp: '1:02' },
    { type: 'Core Concept', icon: BrainCircuit, color: 'emerald', content: 'Utilize WebAssembly for client-side video processing.', explanation: 'This reduces server load and enables real-time effects without latency.', timestamp: '4:22' },
    { type: 'Key Decision', icon: CheckCircle2, color: 'indigo', content: 'Greenlight the development of the native macOS Show Pill app.', timestamp: '9:40' },
  ]
];

const CoreShowcaseSection: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  const [insights, setInsights] = useState(MOCK_INSIGHTS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const nextIndex = (currentIndex + 1) % MOCK_INSIGHTS.length;
      setCurrentIndex(nextIndex);
      setInsights(MOCK_INSIGHTS[nextIndex]);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 shadow-sm">
            <BrainCircuit className="size-3 text-indigo-500" />
            Neural Engine
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-6">
            Turn Conversations into <span className="relative inline-block">Actionable Intelligence<span className="absolute left-0 -bottom-1.5 w-full h-1.5 bg-gradient-to-r from-[#3b27b2] via-[#8227b2] to-[#b61cc9] rounded-full" /></span>
          </h2>
          <p className="text-lg text-slate-500 mt-4 font-medium leading-relaxed">
            Every show is automatically transcribed, summarized, and indexed. Instantly find key decisions, action items, and conceptual highlights with multimodal search.
          </p>
        </div>

        <div style={style} className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] shadow-2xl shadow-indigo-500/10 p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Testimonial */}
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full p-12 flex flex-col justify-center text-center relative shadow-2xl shadow-black/10 aspect-square">
            <div className="size-20 rounded-full mx-auto mb-6 overflow-hidden border-4 border-white shadow-xl">
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200" alt="Talia Cohen" className="w-full h-full object-cover" />
            </div>
            <blockquote className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
              "Show has fundamentally changed how we manage our engineering pipeline. We've reclaimed <span className="text-indigo-600">15 hours per week</span> of synchronous meeting time."
            </blockquote>
            <div className="mt-6">
              <p className="font-black text-slate-900 text-lg">Talia Cohen</p>
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">CTO at TechFlow Global</p>
            </div>
          </div>
          {/* Right: AI Insights */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.3em]">[OUTPUT_STREAM :: AI_SUMMARY]</div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs font-bold text-indigo-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
              </button>
            </div>

            {isAnalyzing ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl shadow-black/5 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 bg-slate-100 rounded-xl"></div>
                      <div className="h-3 w-24 bg-slate-100 rounded"></div>
                    </div>
                    <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="h-5 w-full bg-slate-100 rounded mt-2"></div>
                  <div className="h-5 w-3/4 bg-slate-100 rounded mt-1"></div>
                </div>
              ))
            ) : (
              insights.map((item, i) => {
                const ItemIcon = item.icon;
                return (
                  <div key={i} className={`bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-${item.color}-500/10 transition-all group animate-in fade-in slide-in-from-right-4 duration-500`} style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 bg-${item.color}-100 rounded-xl flex items-center justify-center text-${item.color}-600 shadow-inner`}>
                          <ItemIcon className="size-4" />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-widest text-${item.color}-600`}>{item.type}</span>
                      </div>
                      <button className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                        <PlayCircle className="size-3.5" />
                        {item.timestamp}
                      </button>
                    </div>

                    <p className="font-bold text-lg text-slate-900 leading-snug">{item.content}</p>

                    {item.assignee && (
                      <div className="flex items-center gap-2 mt-4">
                        <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-black">{item.assignee.name.charAt(0)}</div>
                        <span className="text-xs font-bold text-slate-500">Assigned to @{item.assignee.name}</span>
                      </div>
                    )}

                    {item.explanation && (
                      <p className="mt-3 text-sm text-slate-500 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="font-bold text-indigo-600">AI Suggestion:</span> {item.explanation}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
};

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onSignUp, onNavigateInfo, onDevLogin, onContactSales }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [doodleStyles, setDoodleStyles] = useState({
    doodle1: {},
    doodle2: {},
    doodle3: {},
    doodle4: {},
    text: { transform: 'rotate(90deg)' },
    brain: {},
    blueprint: {},
    featuresCircle: {},
    showcase: {},
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      setDoodleStyles({
        doodle1: { transform: `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.02}deg)` },
        doodle2: { transform: `translateY(${-scrollY * 0.15}px) rotate(${-scrollY * 0.01}deg)` },
        doodle3: { transform: `translateY(${scrollY * 0.25}px) rotate(${scrollY * 0.08}deg)` },
        doodle4: { transform: `translateY(${-scrollY * 0.08}px) rotate(${-scrollY * 0.04}deg)` },
        text: { transform: `translateX(${-scrollY * 0.05}px) rotate(90deg)` },
        brain: { transform: `translateY(${scrollY * 0.05}px) rotate(${scrollY * 0.03}deg)` },
        blueprint: { transform: `translateY(${scrollY * -0.2}px) rotate(${-scrollY * 0.05}deg)` },
        featuresCircle: { transform: `translateY(${scrollY * -0.1}px) rotate(${scrollY * 0.02}deg)` },
        showcase: {},
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen w-full relative font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-[#f8faff]"
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#e0e7ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <LandingPageDoodles
        doodle1Style={doodleStyles.doodle1}
        doodle2Style={doodleStyles.doodle2}
        doodle3Style={doodleStyles.doodle3}
        doodle4Style={doodleStyles.doodle4}
        textStyle={doodleStyles.text}
        brainStyle={doodleStyles.brain}
        blueprintStyle={doodleStyles.blueprint}
      />
      <LandingHeader isScrolled={isScrolled} onSignIn={onSignIn} onSignUp={onSignUp} onNavigateInfo={onNavigateInfo} />
      <main className="flex-1 w-full">
        <HeroSection onSignUp={onSignUp} onContactSales={onContactSales!} />

        {/* Trusted By Logo Bar */}
        <section className="py-12 border-y border-slate-100 bg-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Trusted by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-40 grayscale">
              {['Stripe', 'Notion', 'Linear', 'Vercel', 'Figma', 'Slack'].map((brand) => (
                <span key={brand} className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{brand}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Capture Showcase Section ─────────────────────────────── */}
        <section className="py-24 sm:py-32 relative overflow-hidden">
          {/* Faint grid background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-100/40 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            {/* Section header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-rose-100 text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 shadow-sm mb-6">
                <Camera className="size-3 text-rose-500" />
                Smart Captures
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                A screenshot is worth a{' '}
                <span className="relative inline-block">
                  thousand meetings
                  <span className="absolute left-0 -bottom-1.5 w-full h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500 rounded-full" />
                </span>
              </h2>
              <p className="mt-6 text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                Capture your screen in stunning detail — region, window, fullscreen, or scrolling — then annotate, enhance, and share in seconds. No installs, no friction.
              </p>
            </div>

            {/* Hero capture mockup */}
            <div className="relative max-w-4xl mx-auto mb-20 group/capture">
              {/* Floating toolbar mockup */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 shadow-[0_20px_80px_-20px_rgba(244,63,94,0.12)] bg-white">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-2 bg-[#f6f6f6] border-b border-[#e5e5e5]">
                  <div className="flex gap-2">
                    <div className="size-3 rounded-full bg-[#ff5f57] border border-[#e0443e]"></div>
                    <div className="size-3 rounded-full bg-[#febc2e] border border-[#dea123]"></div>
                    <div className="size-3 rounded-full bg-[#28c840] border border-[#1aab29]"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-1 bg-white rounded-md border border-[#ddd] text-[11px] text-slate-500 font-medium w-64 justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
                      <Lock className="size-2.5 text-emerald-500" />
                      <span className="text-slate-400">https://</span>getshowapp.com<span className="text-slate-400">/captures</span>
                    </div>
                  </div>
                  <div className="w-20" />
                </div>

                {/* Capture workspace mockup */}
                <div className="relative bg-[#0f0f14] flex" style={{ height: '380px' }}>
                  {/* Image being annotated */}
                  <div className="flex-1 flex items-center justify-center p-8 relative">
                    <img
                      src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=700"
                      alt="Screenshot being annotated"
                      className="rounded-lg shadow-2xl shadow-black/40 max-h-full object-cover border border-white/10"
                    />
                    {/* Annotation overlays */}
                    <div className="absolute top-16 left-20 w-48 h-12 border-2 border-rose-500 rounded-lg bg-rose-500/10 flex items-center justify-center">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Region Selected</span>
                    </div>
                    <svg className="absolute top-28 left-44 pointer-events-none" width="120" height="60">
                      <path d="M0,0 Q60,50 120,20" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" />
                      <polygon points="116,16 124,20 116,24" fill="#f43f5e" />
                    </svg>
                    <div className="absolute top-[145px] left-[340px] bg-[#1e1b4b] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg border border-indigo-500/30">
                      <span className="text-indigo-300">💡</span> Fix spacing here
                    </div>

                    {/* Floating action ring */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 bg-[#1a1a2e]/90 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
                      {[
                        { icon: MousePointer2, label: 'Select', active: false },
                        { icon: Square, label: 'Region', active: true },
                        { icon: Monitor, label: 'Window', active: false },
                        { icon: Maximize2, label: 'Full', active: false },
                        { icon: Pen, label: 'Annotate', active: false },
                        { icon: Scissors, label: 'Crop', active: false },
                      ].map((tool, i) => {
                        const ToolIcon = tool.icon;
                        return (
                          <button key={i} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${tool.active ? 'bg-rose-500/20 text-rose-400' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}>
                            <ToolIcon className="size-3.5" />
                            <span className="text-[7px] font-bold uppercase tracking-wider">{tool.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right panel — capture history */}
                  <div className="w-[180px] bg-[#12121a] border-l border-white/5 flex flex-col">
                    <div className="px-3 py-3 border-b border-white/5">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Capture Vault</p>
                    </div>
                    <div className="flex-1 p-2 space-y-2 overflow-hidden">
                      {[
                        { title: 'Dashboard Bug', time: '2m ago', color: 'from-rose-500/20 to-pink-500/20' },
                        { title: 'API Response', time: '8m ago', color: 'from-indigo-500/20 to-blue-500/20' },
                        { title: 'New UI Flow', time: '1h ago', color: 'from-emerald-500/20 to-teal-500/20' },
                        { title: 'Error Stack', time: '3h ago', color: 'from-amber-500/20 to-orange-500/20' },
                      ].map((item, i) => (
                        <div key={i} className={`rounded-lg bg-gradient-to-br ${item.color} border border-white/5 p-2 cursor-pointer hover:border-white/10 transition-colors ${i === 0 ? 'ring-1 ring-rose-500/40' : ''}`}>
                          <div className="h-10 rounded-md bg-white/5 mb-1.5 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
                          </div>
                          <p className="text-[9px] font-bold text-white/70 truncate">{item.title}</p>
                          <p className="text-[8px] text-white/30 font-medium">{item.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow behind mockup */}
              <div className="absolute -inset-4 bg-gradient-to-r from-rose-200/20 via-pink-200/20 to-purple-200/20 blur-3xl rounded-3xl -z-10" />
            </div>

            {/* Three feature pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Camera,
                  iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
                  title: 'Capture Anything',
                  headline: 'Region, window, fullscreen, or scrolling capture',
                  description: 'Select exactly what you need with pixel-perfect precision. Capture a region, an entire window, your full screen, or even scrolling pages — all with a single shortcut.',
                  features: ['Region & area selection', 'Full-page scrolling capture', 'Window & display modes', 'Instant clipboard copy'],
                  accentColor: 'rose',
                },
                {
                  icon: Pen,
                  iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
                  title: 'Annotate & Enhance',
                  headline: 'Built-in studio-grade image editor',
                  description: 'Highlight what matters with arrows, boxes, text callouts, blur regions, and numbered steps. Turn raw captures into clear, actionable visual documentation.',
                  features: ['Arrows, shapes & callouts', 'Smart blur & redact', 'Numbered step markers', 'Text & emoji overlays'],
                  accentColor: 'indigo',
                },
                {
                  icon: Share2,
                  iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
                  title: 'Share Instantly',
                  headline: 'Distribute to anyone, anywhere',
                  description: 'Copy to clipboard, share a secure link, drag into emails, or export as PNG/PDF. Captures automatically sync to your Show vault for permanent access.',
                  features: ['One-click link sharing', 'Export to PNG, PDF, SVG', 'Cloud sync to vault', 'Embed in docs & wikis'],
                  accentColor: 'emerald',
                },
              ].map((pillar, i) => {
                const PillarIcon = pillar.icon;
                return (
                  <div key={i} className="group relative bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm hover:shadow-xl hover:border-slate-300/80 hover:-translate-y-1 transition-all duration-500">
                    {/* Hover glow */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-${pillar.accentColor}-50/0 to-${pillar.accentColor}-50/0 group-hover:from-${pillar.accentColor}-50/40 group-hover:to-${pillar.accentColor}-50/0 transition-all duration-500 pointer-events-none`} />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`size-14 rounded-2xl ${pillar.iconBg} flex items-center justify-center shadow-lg mb-6`}>
                        <PillarIcon className="size-6 text-white" />
                      </div>

                      {/* Label */}
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-${pillar.accentColor}-500 mb-2`}>{pillar.title}</p>

                      {/* Headline */}
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug mb-3">{pillar.headline}</h3>

                      {/* Description */}
                      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{pillar.description}</p>

                      {/* Feature list */}
                      <ul className="space-y-2.5">
                        {pillar.features.map((feature, j) => (
                          <li key={j} className="flex items-center gap-2.5 text-[13px] text-slate-600 font-medium">
                            <div className={`size-5 rounded-full bg-${pillar.accentColor}-50 flex items-center justify-center shrink-0`}>
                              <CheckCircle2 className={`size-3 text-${pillar.accentColor}-500`} />
                            </div>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* CTA arrow */}
                      <div className={`mt-8 flex items-center gap-2 text-${pillar.accentColor}-600 text-sm font-bold group-hover:gap-3 transition-all`}>
                        Discover more <ArrowRight className="size-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Stream Studio Showcase Section ──────────────────────── */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-white border-y border-slate-100">
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-indigo-100/30 blur-[180px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 shadow-sm mb-6">
                <Radio className="size-3 text-indigo-500" />
                Stream Studio
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                One stream,{' '}
                <span className="relative inline-block">
                  multiple destinations
                  <span className="absolute left-0 -bottom-1.5 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-full" />
                </span>
              </h2>
              <p className="mt-6 text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                Your production-grade broadcast studio — go live to YouTube, Twitch, LinkedIn, X, and 8 more platforms simultaneously. Professional scenes, real-time overlays, and AI-powered production tools built in.
              </p>
            </div>

            {/* Studio mockup — premium broadcast feel */}
            <div className="relative max-w-6xl mx-auto mb-20">
              <div className="absolute -inset-8 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 rounded-[48px] blur-3xl" />
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/5 via-transparent to-fuchsia-500/5 rounded-[40px] blur-xl" />
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_120px_-20px_rgba(99,102,241,0.25)] bg-[#0f0f1a]">

                {/* Top bar — live session header */}
                <div className="h-11 flex items-center justify-between px-4 bg-[#0c0c18] border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <ChevronRight className="size-3 text-zinc-500 rotate-180" />
                    <span className="text-[11px] font-bold text-white tracking-wide">Q4 Review</span>
                    <Pen className="size-2.5 text-zinc-600" />
                    <div className="h-5 w-px bg-white/[0.08] mx-1" />
                    {/* LIVE indicator */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 rounded border border-red-500/30">
                      <div className="size-1.5 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50" />
                      <span className="text-[8px] font-black text-red-400 uppercase">Live</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500">01:24:03</span>
                    <div className="h-5 w-px bg-white/[0.08] mx-1" />
                    <div className="flex items-center gap-1">
                      <Eye className="size-3 text-zinc-500" />
                      <span className="text-[10px] font-bold text-zinc-300">12.7K</span>
                      <span className="text-[8px] text-zinc-500">viewers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.06] text-[9px] font-semibold text-zinc-300">
                      <ListTodo className="size-3 text-zinc-400" />
                      Schedule
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-600 text-[9px] font-bold text-white shadow-sm shadow-red-600/40">
                      <Radio className="size-3 animate-pulse" />
                      End Stream
                    </div>
                  </div>
                </div>

                {/* Meeting link bar */}
                <div className="h-7 flex items-center justify-between px-4 bg-[#0c0c18]/60 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 bg-emerald-400 rounded-full" />
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-wider">Meeting Link:</span>
                    <span className="text-[9px] text-zinc-500 font-mono">https://getshowapp.com/join/f08ynf</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.06] text-[8px] font-semibold text-zinc-400">
                      <Link2 className="size-2.5" />
                      Copy
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.06] text-[8px] font-semibold text-zinc-400">
                      <Users className="size-2.5" />
                      Invite Guest
                    </div>
                  </div>
                </div>

                {/* Main content area */}
                <div className="flex" style={{ height: '420px' }}>

                  {/* Main stage / video area */}
                  <div className="flex-1 relative bg-[#0a0a14] overflow-hidden">
                    {/* Background scene — presenter with professional setup */}
                    <div className="absolute inset-0">
                      <img
                        src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80"
                        alt="Professional broadcast studio preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/20 to-transparent" />
                    </div>

                    {/* LIVE badge — top right of stage - REMOVED per user request */}

                    {/* Presenter name card — top left - REMOVED per user request */}


                    {/* Lower third banner — professional broadcast overlay */}
                    <div className="absolute bottom-14 left-0 right-0 z-10">
                      <div className="mx-6 flex items-stretch">
                        <div className="bg-blue-600 px-4 py-2 flex items-center">
                          <span className="text-[9px] font-black text-white uppercase tracking-wider">Q4 Review</span>
                        </div>
                        <div className="bg-[#0c0c18]/90 backdrop-blur-sm px-4 py-2 flex-1 border-l-2 border-blue-400">
                          <div className="text-[10px] font-bold text-white">FY2025 Performance & Growth Strategy</div>
                          <div className="text-[8px] text-zinc-400 mt-0.5">Revenue up 34% YoY · Expanding to 12 new markets</div>
                        </div>
                      </div>
                    </div>

                    {/* Stream timer — bottom right */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-sm z-10">
                      <div className="size-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-mono font-bold text-white/80">01:24:03</span>
                    </div>

                    {/* Audio level meter — bottom left */}
                    <div className="absolute bottom-3 left-3 flex items-end gap-0.5 h-4 z-10">
                      {[0.3, 0.5, 0.7, 0.9, 1, 0.85, 0.6, 0.4, 0.7, 0.5, 0.3, 0.2].map((h, i) => (
                        <div key={i} className={`w-0.5 rounded-full ${i < 8 ? 'bg-emerald-400' : i < 10 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ height: `${h * 100}%`, opacity: 0.7 + h * 0.3 }} />
                      ))}
                    </div>
                  </div>

                  {/* Destinations panel — the star of the show */}
                  <div className="w-80 bg-[#0c0c18] border-l border-white/[0.06] flex flex-col">
                    {/* Panel header */}
                    <div className="px-4 py-3.5 border-b border-white/[0.06]">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Radio className="size-4 text-blue-400" />
                          <span className="text-[13px] font-bold text-white">Destinations</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Pen className="size-3 text-zinc-600 hover:text-zinc-400" />
                          <Settings className="size-3 text-zinc-600 hover:text-zinc-400" />
                        </div>
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-relaxed">Stream to social media platforms via RTMP.</p>
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 rounded border border-emerald-500/20">
                            <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-400 uppercase">Live</span>
                          </div>
                          <span className="text-[9px] text-zinc-500 font-medium">4 of 6 active</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600">12.7K total</span>
                      </div>
                    </div>

                    {/* Destination list — rich cards */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {[
                        { name: 'YouTube', handle: '@showapp', icon: 'YT', color: 'bg-red-500', live: true, viewers: '8.2K', health: 98, bitrate: '6000 kbps', uptime: '01:24:03' },
                        { name: 'Twitch', handle: 'showapp_live', icon: 'TW', color: 'bg-violet-500', live: true, viewers: '2.1K', health: 100, bitrate: '4500 kbps', uptime: '01:24:03' },
                        { name: 'LinkedIn Live', handle: 'Show App', icon: 'LI', color: 'bg-blue-600', live: true, viewers: '1.9K', health: 95, bitrate: '4500 kbps', uptime: '01:23:58' },
                        { name: 'X (Twitter)', handle: '@showapp', icon: 'X', color: 'bg-zinc-600', live: true, viewers: '564', health: 87, bitrate: '3500 kbps', uptime: '01:23:45' },
                        { name: 'Facebook', handle: 'Show App', icon: 'FB', color: 'bg-blue-500', live: false, viewers: '', health: 0, bitrate: '', uptime: '' },
                        { name: 'Kick', handle: 'showapp', icon: 'KI', color: 'bg-emerald-500', live: false, viewers: '', health: 0, bitrate: '', uptime: '' },
                      ].map(dest => (
                        <div key={dest.name} className={`rounded-xl border p-3 transition-all ${dest.live ? 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.12]' : 'bg-white/[0.01] border-white/[0.04] opacity-35'}`}>
                          <div className="flex items-center gap-2.5">
                            <div className={`size-8 rounded-lg ${dest.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                              <span className="text-[8px] font-black text-white">{dest.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-white leading-none">{dest.name}</span>
                                {dest.live && <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/50" />}
                              </div>
                              <div className="text-[8px] text-zinc-500 mt-0.5 truncate">{dest.handle}</div>
                            </div>
                            {dest.live && (
                              <div className="text-right flex-shrink-0">
                                <div className="text-[11px] font-bold text-white">{dest.viewers}</div>
                                <div className="text-[7px] text-zinc-500">viewers</div>
                              </div>
                            )}
                          </div>
                          {dest.live && (
                            <div className="mt-2.5 flex items-center gap-2">
                              {/* Health bar */}
                              <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${dest.health > 95 ? 'bg-emerald-400' : dest.health > 80 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${dest.health}%` }} />
                              </div>
                              <span className="text-[7px] font-mono text-zinc-600">{dest.bitrate}</span>
                              <span className={`text-[7px] font-bold ${dest.health > 95 ? 'text-emerald-400' : dest.health > 80 ? 'text-amber-400' : 'text-red-400'}`}>{dest.health}%</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Aggregate stats footer */}
                    <div className="px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.02]">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="text-[11px] font-bold text-white">12.7K</div>
                          <div className="text-[7px] text-zinc-600 uppercase font-bold">Viewers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[11px] font-bold text-emerald-400">95%</div>
                          <div className="text-[7px] text-zinc-600 uppercase font-bold">Health</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[11px] font-bold text-white">4/6</div>
                          <div className="text-[7px] text-zinc-600 uppercase font-bold">Active</div>
                        </div>
                      </div>
                    </div>

                    {/* Add destination button */}
                    <div className="p-3 border-t border-white/[0.06]">
                      <div className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-colors">
                        <span className="text-[14px] font-light">+</span> Add Destination
                      </div>
                    </div>
                  </div>

                  {/* Right icon toolbar */}
                  <div className="w-12 bg-[#0c0c18] border-l border-white/[0.06] flex flex-col items-center py-2 gap-0.5">
                    {[
                      { icon: Users, label: 'People', active: false },
                      { icon: MessageCircle, label: 'Chat', active: false },
                      { icon: Activity, label: 'Polls', active: false },
                      { icon: Mic, label: 'Captions', active: false },
                      { icon: Sparkles, label: 'Enhance', active: false },
                      { icon: Radio, label: 'Stream', active: true },
                      { icon: Layers, label: 'Design', active: false },
                      { icon: Square, label: 'Layers', active: false },
                      { icon: Globe, label: 'Reactions', active: false },
                      { icon: Zap, label: 'Brand', active: false },
                      { icon: Play, label: 'Music', active: false },
                      { icon: StickyNote, label: 'Notes', active: false },
                      { icon: Gauge, label: 'Stats', active: false },
                    ].map(item => (
                      <div key={item.label} className={`flex flex-col items-center justify-center w-full py-1.5 rounded-md cursor-default ${item.active ? 'bg-blue-600/20' : ''}`}>
                        <item.icon className={`size-3.5 ${item.active ? 'text-blue-400' : 'text-zinc-600'}`} />
                        <span className={`text-[6px] font-bold mt-0.5 ${item.active ? 'text-blue-400' : 'text-zinc-700'}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom toolbar */}
                <div className="h-11 flex items-center justify-center gap-1 px-3 bg-[#0c0c18] border-t border-white/[0.06]">
                  {/* Left controls */}
                  <div className="flex items-center gap-1">
                    {[Mic, Video, Monitor].map((Icon, i) => (
                      <div key={i} className="size-7 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center">
                        <Icon className="size-3.5 text-zinc-400" />
                      </div>
                    ))}
                  </div>
                  {/* Record button */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] border border-white/[0.06] mx-1">
                    <Circle className="size-3 text-red-400 fill-red-400" />
                    <span className="text-[9px] font-bold text-zinc-300">Record</span>
                  </div>
                  {/* More controls */}
                  <div className="flex items-center gap-1">
                    {[Share2, Sparkles, Monitor, Lock, Maximize2, Settings].map((Icon, i) => (
                      <div key={i} className="size-7 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center">
                        <Icon className="size-3 text-zinc-500" />
                      </div>
                    ))}
                  </div>
                  {/* End / Go Live pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/80 ml-2 shadow-sm shadow-rose-500/20">
                    <Scissors className="size-3 text-white" />
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/20 border border-blue-500/20">
                    <Radio className="size-3 text-blue-400" />
                    <span className="text-[9px] font-bold text-blue-400">Go Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Radio, title: 'Multi-Destination RTMP', desc: 'Broadcast to 12+ platforms simultaneously with a single stream key', color: 'from-rose-500 to-orange-500', bg: 'bg-rose-50', iconColor: 'text-rose-600' },
                { icon: Layers, title: 'Scene System', desc: 'Pre-built scenes with drag & drop sources and instant transitions', color: 'from-violet-500 to-indigo-500', bg: 'bg-violet-50', iconColor: 'text-violet-600' },
                { icon: Users, title: 'Green Room Lobby', desc: 'Guest holding room with face enhancer, virtual backgrounds & mic check', color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
                { icon: Sparkles, title: 'AI Production', desc: 'Auto-captions, smart framing, speaker tracking & scene suggestions', color: 'from-sky-500 to-cyan-500', bg: 'bg-sky-50', iconColor: 'text-sky-600' },
              ].map(feat => (
                <div key={feat.title} className="group p-7 bg-white rounded-[28px] border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-500">
                  <div className={`size-12 ${feat.bg} rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform`}>
                    <feat.icon className={`size-6 ${feat.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FeaturesSection
          style={doodleStyles.featuresCircle}
        />

        {/* How It Works Section */}
        <section className="py-24 sm:py-32 relative bg-[#f8faff]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 shadow-sm mb-6">
                <Workflow className="size-3 text-indigo-500" />
                How It Works
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Three Steps to <span className="relative inline-block">Async Clarity<span className="absolute left-0 -bottom-1.5 w-full h-1.5 bg-gradient-to-r from-[#3b27b2] via-[#8227b2] to-[#b61cc9] rounded-full" /></span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 z-0"></div>

              {[
                {
                  step: '01',
                  icon: Camera,
                  title: 'Record',
                  description: 'Capture your screen, camera, or full production in studio-quality. One click to start — no scheduling, no friction.',
                  color: 'indigo',
                },
                {
                  step: '02',
                  icon: BrainCircuit,
                  title: 'AI Processes',
                  description: 'Show\'s neural engine auto-transcribes, summarizes, and extracts key decisions, action items, and insights in real time.',
                  color: 'purple',
                },
                {
                  step: '03',
                  icon: Share2,
                  title: 'Share & Distribute',
                  description: 'Distribute to your team, embed in docs, or publish to channels. Everyone gets the knowledge — no meeting required.',
                  color: 'pink',
                },
              ].map((item, i) => {
                const StepIcon = item.icon;
                return (
                  <div key={i} className="relative z-10 flex flex-col items-center text-center">
                    <div className={`size-32 rounded-full bg-white border-2 border-${item.color}-100 shadow-xl shadow-${item.color}-500/10 flex items-center justify-center mb-8`}>
                      <StepIcon className={`size-12 text-${item.color}-600`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] text-${item.color}-400 mb-2`}>Step {item.step}</span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">{item.title}</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xs">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <CoreShowcaseSection style={doodleStyles.showcase} />

        {/* ─── Chrome Extension Section ──────────────────────────── */}
        <section className="relative py-0 overflow-hidden bg-[#07070e]">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 blur-[180px] rounded-full pointer-events-none" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/8 blur-[120px] rounded-full pointer-events-none" />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #818cf8 0.5px, transparent 0.5px)', backgroundSize: '28px 28px' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Left — Copy */}
              <div className="space-y-4 py-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">
                  <Puzzle className="size-3" />
                  Browser Extension
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-[1.15]">
                  Command the Web{' '}
                  <span className="relative inline-block">
                    from your Toolbar.
                    <span className="absolute left-0 -bottom-1 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" />
                  </span>
                </h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md">
                  The Show Extension bridges any website and your studio. Record, snap, and share — without switching tabs.
                </p>

                {/* Feature bullets */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Camera, text: 'Instant screen capture' },
                    { icon: Video, text: 'Record any tab or window' },
                    { icon: Share2, text: 'One-click share links' },
                    { icon: BrainCircuit, text: 'AI summaries on demand' },
                  ].map((feat, i) => {
                    const FeatIcon = feat.icon;
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                        <div className="size-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <FeatIcon className="size-3 text-indigo-400" />
                        </div>
                        {feat.text}
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => window.open('https://chromewebstore.google.com/', '_blank')}
                    className="group flex items-center gap-2 h-10 px-6 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    <Chrome className="size-4 text-indigo-600" />
                    Add to Chrome
                    <ArrowUpRight className="size-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest hidden sm:block">Free · 30 sec install</span>
                </div>
              </div>

              {/* Right — Browser extension mockup */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Browser toolbar mockup */}
                  <div className="w-[320px] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_80px_-20px_rgba(99,102,241,0.25)] bg-[#1c1c28]">
                    {/* Tab bar */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#13131d] border-b border-white/5">
                      <div className="flex gap-1.5">
                        <div className="size-2.5 rounded-full bg-[#ff5f57]"></div>
                        <div className="size-2.5 rounded-full bg-[#febc2e]"></div>
                        <div className="size-2.5 rounded-full bg-[#28c840]"></div>
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md text-[10px] text-slate-400 font-medium w-40 justify-center border border-white/5">
                          <Lock className="size-2 text-emerald-400" />
                          figma.com/project
                        </div>
                      </div>
                      {/* Extension icon in toolbar */}
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-lg bg-gradient-to-br from-[#3b27b2] via-[#8227b2] to-[#b61cc9] flex items-center justify-center shadow-md shadow-purple-500/30 ring-2 ring-indigo-400/30 animate-pulse">
                          <svg viewBox="0 0 24 24" className="size-2.5 text-white fill-white ml-0.5">
                            <path d="M5.5 4.866a1.5 1.5 0 0 1 2.227-1.313l13.5 7.42a1.5 1.5 0 0 1 0 2.626l-13.5 7.42A1.5 1.5 0 0 1 5.5 19.706V4.866Z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Extension popup - Show Pill design */}
                    <div className="mx-2 mt-2 mb-3">
                      {/* Floating label badge */}
                      <div className="flex items-center gap-1.5 mb-2 ml-1">
                        <svg viewBox="0 0 24 24" className="size-2.5 text-purple-400 fill-purple-400">
                          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                        </svg>
                        <span className="text-[8px] font-black text-purple-400 uppercase tracking-[0.15em]">Show Pill</span>
                      </div>

                      {/* Main pill container */}
                      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
                        {/* Header row */}
                        <div className="flex items-center justify-between px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-gradient-to-br from-[#3b27b2] via-[#8227b2] to-[#b61cc9] flex items-center justify-center">
                              <svg viewBox="0 0 24 24" className="size-2.5 text-white fill-white ml-0.5">
                                <path d="M5.5 4.866a1.5 1.5 0 0 1 2.227-1.313l13.5 7.42a1.5 1.5 0 0 1 0 2.626l-13.5 7.42A1.5 1.5 0 0 1 5.5 19.706V4.866Z" />
                              </svg>
                            </div>
                            <span className="text-[11px] font-bold text-slate-800">Show</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full bg-emerald-400"></div>
                            <span className="text-[9px] font-medium text-slate-400">Ready</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-100 mx-3" />

                        {/* Action row */}
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          {/* Record button */}
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm shadow-red-500/30">
                            <div className="size-1.5 rounded-full bg-white animate-pulse"></div>
                            <span className="text-[9px] font-black text-white uppercase tracking-wider">Record</span>
                          </button>

                          {/* Snap button */}
                          <button className="size-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                            <svg viewBox="0 0 24 24" className="size-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="6" cy="6" r="3" /><path d="M8.12 8.12 12 12" /><path d="M20 4 8.12 15.88" />
                              <circle cx="6" cy="18" r="3" /><path d="M14.8 14.8 18 18" />
                            </svg>
                          </button>

                          {/* Share button */}
                          <button className="size-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                            <Share2 className="size-4 text-slate-500" />
                          </button>

                          {/* Divider */}
                          <div className="w-px h-5 bg-slate-200" />

                          {/* Open App button */}
                          <button className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
                            <svg viewBox="0 0 24 24" className="size-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Recent section */}
                      <div className="mt-3 rounded-xl bg-white/5 border border-white/10 p-2.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.15em]">Recent</span>
                          <span className="text-[8px] font-bold text-indigo-400">2</span>
                        </div>
                        <div className="space-y-1.5">
                          {[
                            { title: 'Figma board screenshot', time: 'Just now' },
                            { title: 'Client call recording', time: '2h ago' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                              <div className="size-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                                <Camera className="size-3 text-slate-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold text-slate-300 truncate">{item.title}</p>
                                <p className="text-[7px] text-slate-500 font-medium">{item.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer with shortcut */}
                      <div className="flex items-center justify-between mt-2.5 px-1">
                        <div className="flex items-center gap-1">
                          <kbd className="text-[8px] font-bold text-slate-400 bg-white/10 border border-white/10 px-1 py-0.5 rounded">⌘</kbd>
                          <kbd className="text-[8px] font-bold text-slate-400 bg-white/10 border border-white/10 px-1 py-0.5 rounded">⇧</kbd>
                          <kbd className="text-[8px] font-bold text-slate-400 bg-white/10 border border-white/10 px-1 py-0.5 rounded">S</kbd>
                          <span className="text-[8px] text-slate-500 font-medium ml-1">Quick capture</span>
                        </div>
                        <button className="size-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                          <Settings className="size-2.5 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Glow behind mockup */}
                  <div className="absolute -inset-6 bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-pink-600/15 blur-3xl rounded-3xl -z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-24 border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <Logo showText={true} />
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                The operating system for asynchronous knowledge work. Built for teams who value clarity over meetings.
              </p>
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
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">© 2025 - 2026 SS Labs Global.</p>
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
