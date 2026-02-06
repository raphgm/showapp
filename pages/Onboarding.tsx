
import React, { useState } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Sparkles, Layout, 
  Settings, Monitor, Users, Briefcase, GraduationCap, 
  Zap, Shield, Globe, Terminal, Play, Presentation,
  Calendar, Cpu, Bot, Mic, Video, Target, User,
  // Added missing Fingerprint icon import
  Fingerprint
} from 'lucide-react';
import Logo from './Logo';

interface OnboardingProps {
  onComplete: (data: { name: string; workspace: string; focus: string; title: string }) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 'identity', title: 'Member Identity', description: 'Introduce yourself to your new workspace.' },
  { id: 'workspace', title: 'Team Hub', description: 'Establish your collaborative foundation.' },
  { id: 'intent', title: 'Workstream Objective', description: 'What is your primary focus for this workspace?' },
  { id: 'meetings', title: 'Workspace Intelligence', description: 'Deploy the Assistant to automate your session recaps.' },
];

const FOCUS_OPTIONS = [
  { id: 'strategy', label: 'Team Strategy', icon: Briefcase, desc: 'For alignment sessions and leadership updates.' },
  { id: 'education', label: 'Instructional Design', icon: GraduationCap, desc: 'For teaching, courses, and knowledge sharing.' },
  { id: 'creative', label: 'Collaborative Projects', icon: Sparkles, desc: 'For high-impact visual storytelling and group assets.' },
  { id: 'tech', label: 'Technical Ops', icon: Terminal, desc: 'For code reviews, demos, and engineering syncs.' },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [focus, setFocus] = useState('strategy');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({ name, workspace, focus, title });
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
    <div className="fixed inset-0 z-[2000] bg-slate-50 flex overflow-hidden font-sans select-none">
      {/* Left: Input Panel */}
      <div className="w-full lg:w-[500px] xl:w-[600px] bg-white h-full flex flex-col p-12 relative z-10 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.05)] border-r border-slate-100 overflow-hidden">
        {/* Artistic Panel Doodles */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
           <svg className="absolute -top-10 -right-10 w-96 h-96 text-indigo-900" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 4" />
             <path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
           </svg>
        </div>

        <div className="flex items-center justify-between mb-16 relative z-10">
          <Logo showText={true} className="scale-90 origin-left" />
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-indigo-600' : 'w-4 bg-slate-100'}`} />
            ))}
          </div>
        </div>

        <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-8 transition-colors group relative z-10">
          <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
          {step === 0 ? 'Exit Setup' : 'Previous Phase'}
        </button>

        <div className="flex-1 max-w-sm mx-auto w-full space-y-12 relative z-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
              {STEPS[step].title}
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              {STEPS[step].description}
            </p>
          </div>

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {step === 0 && (
              <>
                <div className="space-y-3 relative group">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Display Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Raphael Gabriel"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-5 font-black text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all text-xl"
                  />
                  <div className="absolute -right-4 -top-4 p-2 bg-indigo-50 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all translate-y-2 group-focus-within:translate-y-0">
                    <Target className="size-4 text-indigo-600" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Professional Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lead Instructor"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-5 font-black text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all text-xl"
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Workspace Identifier</label>
                <div className="relative">
                  <Globe className="absolute left-8 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input 
                    autoFocus
                    type="text" 
                    value={workspace} 
                    onChange={(e) => setWorkspace(e.target.value)}
                    placeholder="e.g. Engineering classroom"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl pl-16 pr-8 py-5 font-black text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all text-xl"
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 px-4 leading-relaxed uppercase tracking-tighter">Shared URL endpoint for your entire team.</p>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-4">
                {FOCUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFocus(opt.id)}
                    className={`flex items-center gap-6 p-6 rounded-3xl border-2 text-left transition-all group ${focus === opt.id ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100/50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                  >
                    <div className={`p-4 rounded-2xl transition-all ${focus === opt.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-100 group-hover:text-indigo-600'}`}>
                      <opt.icon className="size-6" />
                    </div>
                    <div className="flex-1">
                      <div className={`text-lg font-black transition-colors ${focus === opt.id ? 'text-indigo-950' : 'text-slate-600'}`}>{opt.label}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
               <div className="space-y-4">
                 <button 
                   onClick={() => simulateConnection('Google')}
                   disabled={!!isConnecting}
                   className="w-full flex items-center gap-5 p-6 bg-white border-2 border-slate-100 rounded-[32px] hover:border-indigo-200 hover:shadow-2xl transition-all group"
                 >
                   <div className="size-14 bg-slate-50 rounded-[20px] flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                      <svg className="size-7" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                   </div>
                   <div className="flex-1 text-left">
                      <div className="text-lg font-black text-slate-900">Sync Google API</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect Professional Calendar</div>
                   </div>
                   {isConnecting === 'Google' ? <div className="size-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="size-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />}
                 </button>
                 <div className="pt-6 text-center">
                    <button onClick={handleNext} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-indigo-600 transition-colors">
                       Skip for manual profile setup
                    </button>
                 </div>
               </div>
            )}
          </div>

          {step !== 3 && (
            <div className="pt-10 relative z-10">
              <button 
                onClick={handleNext}
                disabled={(step === 0 && !name) || (step === 1 && !workspace)}
                className="w-full bg-slate-950 text-white py-6 rounded-[28px] font-black text-2xl shadow-[0_20px_60px_-10px_rgba(15,23,42,0.4)] hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 group"
              >
                {step === STEPS.length - 1 ? 'Establish Profile' : 'Continue Phase'}
                <ArrowRight className="size-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-auto text-center relative z-10">
           <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">SHOW WORKSPACE v2.4.0_STABLE</span>
        </div>
      </div>

      {/* Right: Dynamic Preview Space - Redesigned to Light Atmospheric Indigo */}
      <div className="hidden lg:flex flex-1 bg-[#f0f4ff] relative items-center justify-center overflow-hidden">
        {/* New Light-Mode Technical Grid */}
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none">
           <svg className="w-full h-full text-indigo-200" viewBox="0 0 800 800">
             <circle cx="400" cy="400" r="300" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 20" />
             <path d="M0,400 L800,400 M400,0 L400,800" stroke="currentColor" strokeWidth="0.5" />
             {[100, 200, 300, 500, 600, 700].map(x => (
               <line key={x} x1={x} y1="0" x2={x} y2="800" stroke="currentColor" strokeWidth="0.1" />
             ))}
           </svg>
        </div>
        
        {/* Center Glow Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative w-[750px] aspect-[16/10] bg-white rounded-[64px] border border-white shadow-[0_40px_100px_-20px_rgba(79,70,229,0.15)] p-16 animate-in zoom-in-95 duration-1000 group overflow-hidden">
           
           {step < 3 ? (
             <div className="h-full flex flex-col gap-10 animate-in fade-in duration-500">
               {/* Mock Sidebar - Re-styled for light mode */}
               <div className="absolute left-10 top-10 bottom-10 w-20 bg-slate-50/50 rounded-[32px] border border-slate-100 flex flex-col items-center py-8 gap-8 shadow-sm">
                  <div className="size-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 text-xl">
                     {workspace ? workspace.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="w-10 h-px bg-slate-200" />
                  {[Monitor, Layout, Users, Settings].map((Icon, i) => (
                    <Icon key={i} className={`size-6 ${i === step ? 'text-indigo-600' : 'text-slate-300'}`} />
                  ))}
               </div>

               <div className="ml-28 h-full flex flex-col gap-10 pt-6">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <div className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em]">Workspace Visualizer</div>
                        <div className="text-4xl font-black text-indigo-950 tracking-tighter">
                          {workspace || 'Untitled Hub'}
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 flex-1">
                     <div className="bg-slate-50 rounded-[48px] border border-slate-100 p-10 flex flex-col justify-between group-hover:bg-slate-100 transition-all hover:-translate-y-1 shadow-sm">
                        <div className="size-16 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-inner"><Play className="size-8" /></div>
                        <div className="space-y-3">
                           <div className="h-2 w-32 bg-slate-200 rounded-full" />
                           <div className="h-2 w-20 bg-slate-100 rounded-full" />
                        </div>
                     </div>
                     {step === 0 && (name || title) ? (
                        <div className="bg-indigo-50 rounded-[48px] border border-indigo-200 p-10 flex flex-col justify-between group-hover:bg-indigo-100 transition-all hover:-translate-y-1 shadow-md animate-in zoom-in-95">
                          <div className="size-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                            <User className="size-8" />
                          </div>
                          <div className="space-y-2">
                             <div className="text-xl font-black text-indigo-950 truncate">{name || 'Identity Sync...'}</div>
                             <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest truncate">{title || 'Member Role'}</div>
                          </div>
                        </div>
                     ) : (
                        <div className="bg-slate-50 rounded-[48px] border border-slate-100 p-10 flex flex-col justify-between hover:bg-slate-100 transition-all hover:-translate-y-1 shadow-sm">
                          <div className="size-16 bg-white rounded-3xl flex items-center justify-center text-white/40 shadow-inner"><Presentation className="size-8" /></div>
                          <div className="space-y-3">
                             <div className="h-2 w-24 bg-slate-200 rounded-full" />
                             <div className="h-2 w-40 bg-slate-100 rounded-full" />
                          </div>
                        </div>
                     )}
                  </div>
               </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-110 duration-1000">
                <div className="text-center space-y-4 mb-16">
                   <div className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.4em]">Intelligence Activation</div>
                   <div className="text-5xl font-black text-indigo-950 tracking-tighter">Session Mastering Active</div>
                </div>
                <div className="relative w-full h-80 flex items-center justify-center">
                   <div className="relative z-10 p-10 bg-white border border-indigo-50 rounded-[48px] shadow-[0_32px_80px_-16px_rgba(79,70,229,0.2)] flex items-center gap-8 animate-bounce-slow">
                      <div className="size-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                         <Bot className="size-12" />
                      </div>
                      <div className="text-left space-y-1">
                         <div className="text-2xl font-black text-indigo-950">Genius Core</div>
                         <div className="flex items-center gap-3">
                            <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Mastery Logic Engaged</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 750 460">
              <path d="M40,40 L710,40 L710,420 L40,420 Z" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="15 10" />
              <text x="60" y="405" fontSize="10" fill="#6366f1" className="font-mono font-bold uppercase tracking-widest opacity-60">HUB_IDENTITY_PREVIEW :: PHASE_{step + 1}</text>
           </svg>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
