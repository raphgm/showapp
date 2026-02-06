
import React from 'react';
import { 
  Chrome, Download, Zap, MousePointer2, 
  Command, Sparkles, CheckCircle2, ArrowRight,
  ShieldCheck, Globe, Laptop, Monitor, Layout,
  Layers, Pin, Plus
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';

const ExtensionHub: React.FC = () => {
  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <HeroBanner 
        title={<>Command the Web <br />from your Toolbar.</>}
        description="The Show Extension is your high-performance bridge between any website and your production studio. Record, snap, and share without switching tabs."
        imageUrl="https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800"
        gradientFrom="from-indigo-900"
        gradientTo="to-indigo-700"
        buttons={
          <button className="flex items-center gap-2 bg-white text-indigo-950 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-indigo-50 transition-all shadow-2xl active:scale-95">
            <Chrome className="w-5 h-5 text-indigo-600" />
            Add to Chrome
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connection Status Card */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm flex flex-col justify-between group hover:border-indigo-100 transition-all">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <Globe className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Studio Engine Status</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="size-1.5 bg-amber-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Deployment</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                v2.4.0 STABLE
              </div>
            </div>

            <div className="h-32 w-full bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden flex items-center justify-center group-hover:bg-slate-50/50 transition-colors">
               {/* Heartbeat Visualization */}
               <svg className="absolute inset-0 w-full h-full text-indigo-100 opacity-50" viewBox="0 0 400 100">
                  <path d="M0,50 L50,50 L60,20 L75,80 L85,50 L120,50 L130,10 L145,90 L155,50 L200,50" fill="none" stroke="currentColor" strokeWidth="2" className="animate-dash" />
                  <path d="M200,50 L250,50 L260,20 L275,80 L285,50 L320,50 L330,10 L345,90 L355,50 L400,50" fill="none" stroke="currentColor" strokeWidth="2" className="animate-dash-slow" />
               </svg>
               <span className="relative z-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Telemetry Active</span>
            </div>

            <p className="text-slate-500 font-medium leading-relaxed">
              Once installed, the Show extension enables background processing for 4K screen recording and instant asset uploads from any browser-based application.
            </p>
          </div>
          
          <div className="mt-8 flex gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
               <ShieldCheck className="size-4 text-emerald-600" />
               <span className="text-[10px] font-black text-emerald-700 uppercase">Verified Secure</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100">
               <Zap className="size-4 text-indigo-600" />
               <span className="text-[10px] font-black text-indigo-700 uppercase">Zero Latency</span>
             </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-4">
          {[
            { icon: Command, title: 'Global Shortcuts', desc: 'Alt+S to Snap, Alt+R to Record instantly.' },
            { icon: Pin, title: 'Tab Persistence', desc: 'Keep your camera active across all open tabs.' },
            { icon: Layers, title: 'Asset Stitching', desc: 'Scroll capture full landing pages in one click.' }
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 p-6 rounded-[32px] group hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all cursor-default">
              <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="size-5 text-indigo-600" />
              </div>
              <h4 className="font-black text-slate-900 text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deployment Guide */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
           <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Deployment Strategy</h2>
             <p className="text-slate-500 font-medium mt-1">Follow these steps to fully integrate Show with your browser.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
           {/* Connecting Line */}
           <div className="absolute top-20 left-0 right-0 h-0.5 bg-slate-100 hidden md:block" />

           {[
             { step: '01', title: 'Deploy Logic', desc: 'Add the extension from the Chrome Web Store to your active profile.', icon: Download },
             { step: '02', title: 'Authorize Base', desc: 'Log in through the extension popup to sync your studio credentials.', icon: Laptop },
             { step: '03', title: 'Lock Command', desc: 'Pin the Show icon to your toolbar for immediate production access.', icon: Pin }
           /* Fixed map callback duplication and syntax error */
           ].map((s, i) => (
             <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-6 group">
                <div className="size-16 bg-white border-2 border-slate-100 rounded-[24px] flex items-center justify-center text-slate-300 shadow-sm group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all group-hover:-translate-y-2">
                   <s.icon className="size-8" />
                </div>
                <div className="space-y-2">
                   <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{s.step} Phase</div>
                   <h3 className="text-lg font-black text-slate-900">{s.title}</h3>
                   <p className="text-sm text-slate-400 font-medium max-w-[200px] mx-auto">{s.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Extension Mockup Display */}
      <div className="bg-slate-950 rounded-[48px] p-12 lg:p-24 relative overflow-hidden group">
         {/* Doodles & Gradients */}
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
         <div className="absolute -bottom-24 -right-24 size-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
         
         <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="flex-1 space-y-8">
               <div className="size-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-indigo-900/50">
                  <Sparkles className="size-8" />
               </div>
               <h3 className="text-4xl font-black text-white tracking-tight leading-none">
                  Native Browser <br />Intelligence.
               </h3>
               <p className="text-indigo-200/60 text-lg font-medium leading-relaxed max-w-sm">
                  Experience the fastest recording engine ever built for Chromium. Auto-uploaded, auto-summarized, ready for sharing in sub-second speeds.
               </p>
               <button className="flex items-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-colors group">
                  Learn about our engine <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform" />
               </button>
            </div>

            <div className="flex-1 w-full max-w-md">
               <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 animate-pulse-subtle">
                  {/* Extension Header Mock */}
                  <div className="p-5 bg-indigo-600 text-white flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="size-8 bg-white/20 rounded-lg flex items-center justify-center"><Layout className="size-4" /></div>
                        <span className="font-black text-sm tracking-tight">Show Engine</span>
                     </div>
                     <SettingsIcon className="size-4 opacity-60" />
                  </div>
                  {/* Extension Content Mock */}
                  <div className="p-8 space-y-6">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                           <div className="flex items-center gap-3">
                              <Monitor className="size-5 text-indigo-600" />
                              <span className="text-sm font-black text-indigo-950">Record Tab</span>
                           </div>
                           <div className="size-4 bg-indigo-600 rounded-full animate-pulse shadow-lg shadow-indigo-200" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="flex items-center gap-3 text-slate-400">
                              <Layers className="size-5" />
                              <span className="text-sm font-black">Scroll Capture</span>
                           </div>
                           <Plus className="size-4" />
                        </div>
                     </div>
                     <div className="w-full h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xs uppercase tracking-widest shadow-xl">
                        Start Production
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 1 2 0l.43-.25a2 2 0 0 1 1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default ExtensionHub;
