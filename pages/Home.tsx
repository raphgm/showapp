
import React from 'react';
import { 
  BarChart3, Video, Zap, Monitor, 
  Plus, ArrowUpRight, ArrowRight, Target, Sparkles, Activity, Cpu, 
  Layers, BrainCircuit, Globe, MessageSquare, ListTodo,
  Clock, CheckCircle2, Inbox, Share2
} from 'lucide-react';
import { UserProfile, AppRoute } from '../types';
import HeroBanner from '../components/HeroBanner';

interface HomeProps {
  user: UserProfile;
  onRecordClick: () => void;
  onNavigate: (route: string) => void;
  coverImage?: string;
}

const Home: React.FC<HomeProps> = ({ user, onRecordClick, onNavigate, coverImage }) => {
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 relative animate-in fade-in duration-700 bg-white min-h-full">
      {/* OS Branding Doodle */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.05] pointer-events-none overflow-hidden select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-900">
           <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 3" />
           <path d="M50,10 L50,90 M10,50 L90,50" stroke="currentColor" strokeWidth="0.1" />
        </svg>
      </div>

      <HeroBanner 
        title={<>Async Mission Control.</>}
        description="Capture your expertise, deploy to the vault, and let your team consume on their own time. High-fidelity production for asynchronous depth."
        imageUrl={coverImage || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200"}
        gradientFrom="from-[#0F172A]"
        gradientTo="to-[#1E293B]"
        className="shadow-2xl border border-white/5"
        buttons={
          <div className="flex gap-4">
            <button 
              onClick={onRecordClick}
              className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-1 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl active:scale-95 group leading-none"
            >
              <Monitor className="size-5 group-hover:scale-110 transition-transform" />
              Launch Studio
            </button>
            <button 
              onClick={() => onNavigate(AppRoute.LIBRARY)}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-10 py-1 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] hover:bg-white/20 transition-all border border-white/10 leading-none"
            >
              <Inbox className="size-5" />
              Your Vault
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
        {/* Async Content Pipeline */}
        <div className="lg:col-span-2 bg-slate-50/50 border border-slate-100 rounded-[48px] p-12 space-y-12 group hover:bg-white hover:border-indigo-100 hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
           
           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-5">
                 <div className="size-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                   <Activity className="size-7" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Async Pipeline</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">SYSTEM_OPTIMIZED</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow Velocity</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-3 gap-10 relative z-10">
              {[
                { label: 'CAPTURING', val: '03', detail: 'In Studio', icon: Monitor, color: 'text-indigo-600' },
                { label: 'MASTERING', val: '08', detail: 'Genius Processing', icon: BrainCircuit, color: 'text-emerald-600' },
                { label: 'DISTRIBUTED', val: '24', detail: 'Ready to Watch', icon: Share2, color: 'text-rose-600' }
              ].map(stat => (
                <div key={stat.label} className="space-y-4">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{stat.label}</div>
                   <div className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{stat.val}</div>
                   <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.detail}</span>
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[32px] p-8 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Knowledge Hub Reach</span>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">84% Efficiency Gain</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                 <div className="h-full bg-indigo-500 w-[60%]" title="Captured" />
                 <div className="h-full bg-emerald-500 w-[25%]" title="Mastered" />
                 <div className="h-full bg-rose-500 w-[15%]" title="Watching" />
              </div>
              <div className="flex gap-8">
                 {['Recorded', 'AI Summarized', 'Consumed'].map((l, i) => (
                   <div key={l} className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{l}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Async Review Queue */}
        <div className="bg-indigo-600 rounded-[48px] p-12 text-white flex flex-col justify-between shadow-2xl shadow-indigo-200 relative overflow-hidden group">
           <div className="absolute -top-12 -right-12 size-48 bg-white/10 blur-3xl rounded-full" />
           
           <div className="space-y-10 relative z-10">
              <div className="flex items-center justify-between">
                 <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                    <Inbox className="size-6 text-indigo-100" />
                 </div>
                 <span className="text-[10px] font-black text-indigo-100/60 uppercase tracking-[0.4em]">Review Queue</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black tracking-tighter leading-[0.95]">Pending <br />Decisions.</h3>
                <p className="text-indigo-200/60 text-sm font-medium">Your team needs async feedback.</p>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Sarah: UX Proposal', time: '12m show', color: 'bg-emerald-400' },
                   { label: 'Marcus: Bug Report', time: '3m clip', color: 'bg-rose-400' },
                   { label: 'Alex: Q1 Script', time: '8m draft', color: 'bg-indigo-400' }
                 ].map((task, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 hover:bg-white/15 transition-all cursor-pointer group/task">
                      <div className="flex items-center gap-3 truncate">
                         <div className={`size-2 rounded-full ${task.color}`} />
                         <span className="text-sm font-bold truncate pr-4">{task.label}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60 shrink-0">{task.time}</span>
                   </div>
                 ))}
              </div>
           </div>
           <button 
            onClick={() => onNavigate(AppRoute.LIBRARY)}
            className="w-full mt-10 py-1.5 bg-white text-indigo-950 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-50 transition-all active:scale-95 leading-none"
           >
              Open Inbox
              <ArrowRight className="size-3.5 inline ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
           </button>
        </div>
      </div>

      {/* Logic Hub Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4 pb-20">
         <div onClick={() => onNavigate(AppRoute.SUMMARIES)} className="p-10 bg-white border border-slate-100 rounded-[48px] flex items-center gap-8 hover:border-indigo-200 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <BrainCircuit className="size-32 text-indigo-900" />
            </div>
            <div className="size-24 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform relative z-10 shadow-sm">
               <BrainCircuit className="size-10" />
            </div>
            <div className="relative z-10">
               <h4 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Feed</h4>
               <p className="text-slate-400 font-medium leading-relaxed">Consume AI-generated summaries of missed sessions.</p>
            </div>
            <ArrowUpRight className="size-7 text-slate-200 ml-auto group-hover:text-indigo-500 transition-colors relative z-10" />
         </div>
         <div onClick={() => onNavigate(AppRoute.BOARDS)} className="p-10 bg-white border border-slate-100 rounded-[48px] flex items-center gap-8 hover:border-indigo-200 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <Layers className="size-32 text-indigo-900" />
            </div>
            <div className="size-24 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform relative z-10 shadow-sm">
               <Layers className="size-10" />
            </div>
            <div className="relative z-10">
               <h4 className="text-2xl font-black text-slate-900 tracking-tight">Infinite Boards</h4>
               <p className="text-slate-400 font-medium leading-relaxed">Map out long-form instructional architecture.</p>
            </div>
            <ArrowUpRight className="size-7 text-slate-200 ml-auto group-hover:text-emerald-500 transition-colors relative z-10" />
         </div>
      </div>
    </div>
  );
};

export default Home;
