
import React, { useState } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Sparkles, Layout, 
  Settings, Monitor, Users, Briefcase, GraduationCap, 
  Zap, Shield, Globe, Terminal, Play, Presentation,
  Calendar, Cpu, Bot, Mic, Video, Target, User,
  Fingerprint, Lock, Eye, EyeOff, MonitorPlay,
  Video as VideoIcon, CheckCircle2, ChevronRight,
  Loader2
} from 'lucide-react';
import Logo from './Logo';

interface OnboardingProps {
  onComplete: (data: { name: string; email: string; workspace: string; focus: string; title: string }) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 'identity', title: 'Member Authorization', description: 'Initialize your unique digital signature for the production workspace.' },
  { id: 'workspace', title: 'Team Hub', description: 'Establish the digital home for your team recordings.' },
  { id: 'intent', title: 'Workstream Objective', description: 'What is your primary focus for this workspace?' },
  { id: 'meetings', title: 'Intelligence Integration', description: 'Connect a calendar to record, take notes, and send a meeting recap with Show AI.' },
];

const FOCUS_OPTIONS = [
  { 
    id: 'strategy', 
    label: 'Team Strategy', 
    icon: Briefcase, 
    desc: 'FOR ALIGNMENT SESSIONS AND LEADERSHIP UPDATES.' 
  },
  { 
    id: 'education', 
    label: 'Instructional Design', 
    icon: GraduationCap, 
    desc: 'FOR TEACHING, COURSES, AND KNOWLEDGE SHARING.' 
  },
  { 
    id: 'creative', 
    label: 'Collaborative Projects', 
    icon: Sparkles, 
    desc: 'FOR HIGH-IMPACT VISUAL STORYTELLING AND GROUP ASSETS.' 
  },
  { 
    id: 'tech', 
    label: 'Technical Ops', 
    icon: Terminal, 
    desc: 'FOR CODE REVIEWS, DEMOS, AND ENGINEERING SYNCS.' 
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [title, setTitle] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [focus, setFocus] = useState('creative');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({ name, email, workspace, focus, title });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else onCancel();
  };

  const simulateConnection = (provider: string) => {
    setIsConnecting(provider);
    setTimeout(() => {
      setIsConnecting(null);
      handleNext();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-white flex overflow-hidden font-sans select-none">
      {/* Left: Input Panel */}
      <div className="w-full lg:w-[500px] xl:w-[600px] bg-white h-full flex flex-col p-12 relative z-10 shrink-0 overflow-y-auto no-scrollbar border-r border-slate-100">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            <button onClick={handleBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft className="size-5" />
            </button>
            <Logo showText={true} className="scale-90 origin-left" />
          </div>
          
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= step ? 'w-12 bg-slate-900' : 'w-12 bg-slate-100'
                }`} 
              />
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-md mx-auto w-full flex flex-col justify-center py-12">
          <div className="space-y-4 mb-12">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">System Initialization</div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
              {STEPS[step].title}
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              {STEPS[step].description}
            </p>
          </div>

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tamira Sterling"
                    className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all text-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workstream Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tamira@sslabs.io"
                    className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all text-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Passkey</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all text-xl"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Lead Producer"
                    className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all text-xl"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workspace Hub Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={workspace} 
                  onChange={(e) => setWorkspace(e.target.value)}
                  placeholder="e.g. Creative Production Hub"
                  className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-3xl px-8 py-6 font-black text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all text-2xl"
                />
                <p className="text-xs text-slate-400 font-bold mt-4 ml-1 uppercase tracking-tighter">This identifier will define your team's collective asset vault.</p>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-4">
                {FOCUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFocus(opt.id)}
                    className={`flex items-center gap-6 p-6 rounded-[32px] border-2 transition-all duration-300 ${
                      focus === opt.id 
                        ? 'border-slate-900 bg-slate-50/20 shadow-xl shadow-slate-100/50' 
                        : 'border-slate-50 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`size-16 flex-shrink-0 rounded-[20px] flex items-center justify-center transition-all duration-300 ${
                      focus === opt.id 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'bg-white text-slate-300 border border-slate-100'
                    }`}>
                      <opt.icon className="size-7" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className={`text-xl font-black tracking-tight mb-1 transition-colors ${
                        focus === opt.id ? 'text-slate-950' : 'text-slate-800'
                      }`}>
                        {opt.label}
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-[0.1em] leading-tight ${
                        focus === opt.id ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 mb-6">
                   <div className="flex items-center gap-3 mb-4">
                      <Calendar className="size-5 text-slate-900" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastering Pipeline</span>
                   </div>
                   <p className="text-slate-600 font-medium text-sm leading-relaxed">Connect your primary briefing calendar to allow Show Genius to automatically join and master your strategic sessions.</p>
                </div>
                
                <button 
                  onClick={() => simulateConnection('Google')}
                  className="w-full flex items-center justify-between gap-4 p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-slate-900 hover:shadow-2xl transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="size-12 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
                      <svg className="size-7" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div className="text-left">
                       <div className="font-black text-slate-900 text-lg">Sync Google API</div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect Calendar Hub</div>
                    </div>
                  </div>
                  {isConnecting === 'Google' ? <Loader2 className="size-5 animate-spin text-slate-900" /> : <ChevronRight className="size-5 text-slate-300 group-hover:text-slate-900" />}
                </button>

                <div className="pt-6 text-center">
                  <button onClick={handleNext} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-colors">
                    Establish manually
                  </button>
                </div>
              </div>
            )}
          </div>

          {step !== 3 && (
            <div className="mt-12">
              <button 
                onClick={handleNext}
                disabled={(step === 0 && (!name || !email || !password)) || (step === 1 && !workspace)}
                className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black text-2xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-3 group shadow-2xl shadow-slate-900/20"
              >
                {step === STEPS.length - 2 ? 'Establish Hub' : 'Continue Phase'}
                <ArrowRight className="size-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-auto text-center pt-8">
           <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">SHOW_SYSTEM_OS</span>
        </div>
      </div>

      {/* Right: Premium Preview Space - EXACTLY matching user request image */}
      <div className="hidden lg:flex flex-1 bg-[#f0f4ff]/40 relative items-center justify-center overflow-hidden">
        {/* Dotted/Grid Background Matching Image */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#c7d2fe 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Glow behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-slate-900/5 blur-[140px] rounded-full pointer-events-none"></div>

        {/* The Premium Large Radius Card */}
        <div className="relative w-[850px] aspect-[16/10] bg-white rounded-[64px] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.1)] p-16 animate-in zoom-in-95 duration-1000 overflow-hidden flex flex-col group border border-white">
          
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-700">
             <div className="text-center space-y-6">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">{STEPS[step].title.toUpperCase()}</div>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
                   {step === 0 && (name ? 'Identity Active' : 'Identity Initialized')}
                   {step === 1 && (workspace ? 'Hub Confirmed' : 'Hub Establishing')}
                   {step === 2 && 'Logic Grid Configured'}
                   {step === 3 && 'Mastery Pipeline Live'}
                </h3>
             </div>

             {/* Central "Identity Pass" Style Pill - Removed 'Blue A' letter avatar */}
             <div className="w-[600px] h-[240px] bg-white/40 backdrop-blur-2xl rounded-[48px] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] ring-1 ring-black/5 p-12 flex items-center justify-between relative overflow-hidden group/pass transition-all hover:scale-[1.01] hover:shadow-2xl">
                {/* Fingerprint Watermark */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none group-hover/pass:opacity-[0.08] transition-opacity">
                   <Fingerprint className="size-48 text-slate-900" />
                </div>
                
                <div className="flex items-center gap-10 relative z-10">
                   {/* Official Brand Color Solid #5E5CE6 */}
                   <div className="size-32 bg-[#5E5CE6] rounded-[36px] flex items-center justify-center text-white text-4xl font-black shadow-[0_20px_40px_-10px_rgba(94,92,230,0.4)]">
                      {step === 0 && <User className="size-12" strokeWidth={2.5} />}
                      {step === 1 && (workspace ? workspace.charAt(0).toUpperCase() : <Layout className="size-12" strokeWidth={2.5} />)}
                      {step === 2 && (FOCUS_OPTIONS.find(o => o.id === focus)?.icon ? React.createElement(FOCUS_OPTIONS.find(o => o.id === focus)!.icon, { size: 48, strokeWidth: 2.5 }) : <Target className="size-12" />)}
                      {step === 3 && <Bot className="size-12" strokeWidth={2.5} />}
                   </div>

                   <div className="space-y-2">
                      <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                         {step === 0 && (name || 'Auth Required')}
                         {step === 1 && (workspace || 'Structural Sync')}
                         {step === 2 && (FOCUS_OPTIONS.find(o => o.id === focus)?.label || 'Intent Map')}
                         {step === 3 && 'Genius Core'}
                      </h4>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{step === 0 ? (title || 'MEMBER STATUS') : 'SYSTEM_NODE_ACTIVE'}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter truncate max-w-[240px]">
                           {step === 0 && (email || 'Waiting for credentials...')}
                           {step === 1 && (workspace ? `HUB_ID :: ${workspace.toUpperCase().replace(/\s/g, '_')}` : 'AWAITING_IDENTIFIER')}
                           {step > 1 && 'READY_FOR_DEPLOYMENT'}
                        </span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Technical Branding Footer */}
          <div className="mt-auto pt-10 flex items-center justify-center gap-24 opacity-30 text-[9px] font-black text-slate-900 uppercase tracking-[0.5em]">
             <span className="flex items-center gap-2 italic"><Sparkles className="size-3" /> HUB_IDENTITY</span>
             <span>READY_FOR_DEPLOYMENT</span>
          </div>
          
          {/* Subtle Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/0 via-slate-500/5 to-white/0 h-2 w-full animate-scanline opacity-20"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes scanline {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
