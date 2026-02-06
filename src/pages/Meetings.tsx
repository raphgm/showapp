import React, { useState, useRef, useEffect } from 'react';
import {
  Video, Mic, MicOff, Monitor, PhoneOff, Users, MessageSquare,
  Settings, Share2, MoreVertical, Layout, Maximize2,
  Smile, Hand, Radio, ShieldCheck, Lock, UserPlus,
  Copy, CheckCircle2, ChevronRight, Calendar, Plus,
  User, Clock, Video as VideoIcon, ArrowUpRight
} from 'lucide-react';
import { UserProfile, CodeSnippet } from '../types';
import HeroBanner from '../components/HeroBanner';

interface MeetingsProps {
  user: UserProfile;
  snippets: CodeSnippet[];
  coverImage?: string;
  activeMeeting: any | null;
  setActiveMeeting: (meeting: any | null) => void;
  isInstantLoading: boolean;
  onInstantRoom: () => void;
}

const Meetings: React.FC<MeetingsProps> = ({
  user,
  snippets,
  coverImage,
  activeMeeting,
  setActiveMeeting,
  isInstantLoading,
  onInstantRoom
}) => {
  const [isCamOff, setIsCamOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const userVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Camera initialization logic
    if (!isCamOff && userVideoRef.current) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (userVideoRef.current) userVideoRef.current.srcObject = stream;
            })
            .catch(err => console.error("Camera access error:", err));
    }
  }, [isCamOff, activeMeeting]);

  // Dashboard View (No Active Meeting)
  if (!activeMeeting) {
      return (
        <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 bg-white min-h-screen">
            <HeroBanner
                title={<>Sync & Async <br />Collaboration.</>}
                description="Your team's dedicated space for live discussion. Join scheduled syncs or open an instant room for quick alignment."
                imageUrl={coverImage || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000"}
                gradientFrom="from-violet-600"
                gradientTo="to-indigo-600"
                buttons={
                    <button
                        onClick={onInstantRoom}
                        className="flex items-center gap-3 bg-white text-violet-600 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-violet-50 transition-all active:scale-95"
                    >
                        <VideoIcon className="size-4" />
                        Start Instant Room
                    </button>
                }
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mock Scheduled Meeting */}
                <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-14 bg-white rounded-2xl flex items-center justify-center text-violet-600 shadow-sm border border-slate-100">
                                <Calendar className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Weekly Sync</h3>
                                <p className="text-slate-400 font-medium text-sm">Every Monday • 10:00 AM</p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:border-violet-200 hover:text-violet-600 transition-all">
                            Details
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex -space-x-3 pl-3">
                           {[1,2,3,4].map(i => (
                               <div key={i} className="size-10 rounded-full bg-slate-200 border-4 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-500">
                                   U{i}
                               </div>
                           ))}
                           <div className="size-10 rounded-full bg-slate-100 border-4 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">+2</div>
                        </div>
                        <button 
                            onClick={() => setActiveMeeting({
                                id: 'weekly-sync',
                                title: 'Weekly Sync',
                                time: '10:00 AM',
                                attendees: 6
                            })}
                            className="flex items-center gap-2 text-violet-600 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all"
                        >
                            Join Now <ArrowUpRight className="size-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // Active Meeting Room View
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#050505]">
        <header className="h-16 flex items-center justify-between px-6 bg-[#0a0a0a] border-b border-white/5 shrink-0">
            <div className="flex items-center gap-4">
                <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
                    {activeMeeting.title.charAt(0)}
                </div>
                <div>
                    <h2 className="text-white font-bold text-sm tracking-tight">{activeMeeting.title}</h2>
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{activeMeeting.time} • LIVE</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
               <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                  <Users className="size-4" />
               </button>
               <div className="h-6 w-px bg-white/10 mx-2" />
               <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/10">
                  Invite
               </button>
            </div>
        </header>

        <main className="flex-1 flex p-6 gap-6 min-h-0 relative overflow-hidden bg-[#050505]">
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-6">
            {/* Participant Tiles */}
            <div className="relative group rounded-[32px] overflow-hidden bg-[#121214] border border-white/5 shadow-2xl flex items-center justify-center">
              <img alt="Sarah Chen" className="w-full h-full object-contain bg-[#1a1a1c] grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono">SARAH_CHEN</span>
                </div>
              </div>
            </div>

            <div className="relative group rounded-[32px] overflow-hidden bg-[#121214] border border-white/5 shadow-2xl flex items-center justify-center">
              <img alt="Marcus Lee" className="w-full h-full object-contain bg-[#1a1a1c] grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <MicOff className="text-rose-500 size-3" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono">MARCUS_LEE</span>
                </div>
              </div>
            </div>

            <div className="relative group rounded-[32px] overflow-hidden bg-[#121214] border border-white/5 shadow-2xl flex items-center justify-center">
              {isCamOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-600 bg-[#0a0a0a]">
                  <div className="size-24 bg-white/5 rounded-[32px] flex items-center justify-center border border-white/5 shadow-inner">
                    <User className="size-12 opacity-20" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] font-mono">OPTICAL_LINK_NULL</span>
                </div>
              ) : (
                <video ref={userVideoRef} autoPlay playsInline muted className="w-full h-full object-contain bg-[#1a1a1c] scale-x-[-1]" />
              )}
              <div className={`absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${isBroadcasting ? 'bg-rose-600/90 border-rose-400' : 'bg-indigo-600/90 border-indigo-400'} backdrop-blur-xl shadow-2xl`}>
                <div className="flex items-center gap-2 text-white">
                   {isMuted ? <MicOff className="size-3" /> : <Mic className="text-emerald-300 size-3" />}
                   <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono">{user.name.split(' ')[0].toUpperCase()} [YOU]</span>
                </div>
              </div>
            </div>

            <div className="relative group rounded-[32px] overflow-hidden bg-[#0a0a0a] border border-dashed border-white/10 h-full flex flex-col items-center justify-center text-center p-8 hover:bg-white/[0.02] transition-colors">
               <div className="space-y-6">
                  <Monitor className="size-14 text-slate-800 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Present Module</h3>
                    <p className="text-[9px] text-slate-700 uppercase font-black tracking-widest">Share application window</p>
                  </div>
                  <button onClick={() => setIsSharingScreen(true)} className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Establish Source</button>
               </div>
            </div>
          </div>

          <aside className="w-[420px] flex flex-col gap-6">
             <div className="flex-1 bg-[#121214] rounded-[32px] border border-white/5 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                   <h3 className="text-white font-bold text-sm">Meeting Chat</h3>
                   <MessageSquare className="text-white/40 size-4" />
                </div>
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                   <div className="flex gap-3">
                      <div className="size-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">S</div>
                      <div>
                         <div className="text-[10px] text-white/40 font-bold mb-1">SARAH CHEN</div>
                         <div className="text-white/80 text-sm bg-white/5 p-3 rounded-xl rounded-tl-none">Can we review the Q4 metrics?</div>
                      </div>
                   </div>
                </div>
                <div className="p-4 bg-white/5">
                   <input className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all" placeholder="Type a message..." />
                </div>
             </div>
          </aside>
        </main>

        <footer className="h-24 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-center gap-4 shrink-0">
            <button onClick={() => setIsMuted(!isMuted)} className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {isMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
            </button>
            <button onClick={() => setIsCamOff(!isCamOff)} className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isCamOff ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {isCamOff ? <VideoIcon className="size-6" /> : <VideoIcon className="size-6" />}
            </button>
            <button onClick={() => setIsSharingScreen(!isSharingScreen)} className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isSharingScreen ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                <Monitor className="size-6" />
            </button>
            
            <div className="w-px h-8 bg-white/10 mx-2" />
            
            <button onClick={() => setActiveMeeting(null)} className="px-8 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-900/20 transition-all flex items-center gap-3">
                <PhoneOff className="size-5" /> End Session
            </button>
        </footer>
    </div>
  );
};

export default Meetings;