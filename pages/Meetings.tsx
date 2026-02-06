import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Video, Mic, MicOff, Monitor, PhoneOff, Users, MessageSquare,
  Settings, Share2, MoreVertical, Layout, Maximize2,
  Smile, Hand, Radio, ShieldCheck, Lock, UserPlus,
  Copy, CheckCircle2, ChevronRight, Calendar, Plus,
  User, Clock, Video as VideoIcon, ArrowUpRight, ArrowLeft,
  Play, Sparkles, BrainCircuit, SendHorizontal, Command,
  Search, Star, Eye, X, Image as ImageIcon, Volume2, Speaker,
  Code, Terminal, Cpu, Loader2, Hash
} from 'lucide-react';
import { UserProfile, CodeSnippet } from '../types';
import HeroBanner from '../components/HeroBanner';
import { analyzeCode } from '../services/geminiService';

declare const Prism: any;

interface MeetingsProps {
  user: UserProfile;
  snippets: CodeSnippet[];
  coverImage?: string;
  activeMeeting: any | null;
  setActiveMeeting: (meeting: any | null) => void;
  isInstantLoading: boolean;
  onInstantRoom: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isAi?: boolean;
}

interface GeniusNote {
  id: string;
  type: 'insight' | 'action' | 'summary';
  text: string;
  time: string;
}

interface Participant {
  id: string;
  name: string;
  role: 'Host' | 'Co-host' | 'Attendee' | 'Viewer';
  avatar: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isCamOff?: boolean;
}

const BACKGROUNDS = [
  { id: 'none', label: 'None', url: '' },
  { id: 'blur', label: 'Blur', url: 'blur' },
  { id: 'office1', label: 'Office A', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400' },
  { id: 'office2', label: 'Office B', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400' },
  { id: 'lounge', label: 'Lounge', url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=400' },
  { id: 'abstract', label: 'Abstract', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400' },
];

const INITIAL_CODE = `// Technical Interview: Two Sum
// Given an array of integers nums and an integer target,
// return indices of the two numbers such that they add up to target.

function twoSum(nums: number[], target: number): number[] {
  // Your code here
  
  return [];
}`;

const MeetingSettingsModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  activeTab: string; 
  setActiveTab: (t: string) => void;
  bgId: string;
  setBgId: (id: string) => void;
}> = ({ isOpen, onClose, activeTab, setActiveTab, bgId, setBgId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#18181b] w-full max-w-2xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-black text-white tracking-tight">Studio Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X className="size-5" />
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-white/5 p-4 space-y-2 bg-[#121214]">
            {[
              { id: 'background', label: 'Backgrounds', icon: ImageIcon },
              { id: 'video', label: 'Video', icon: VideoIcon },
              { id: 'audio', label: 'Audio', icon: Mic },
              { id: 'general', label: 'General', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
            {activeTab === 'background' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-bold mb-4">Virtual Background</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {BACKGROUNDS.map(bg => (
                      <button
                        key={bg.id}
                        onClick={() => setBgId(bg.id)}
                        className={`aspect-video rounded-xl border-2 transition-all overflow-hidden relative group ${
                          bgId === bg.id 
                            ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        {bg.id === 'none' ? (
                          <div className="w-full h-full bg-[#27272a] flex items-center justify-center text-zinc-500">
                            <VideoIcon className="size-6" />
                          </div>
                        ) : bg.id === 'blur' ? (
                          <div className="w-full h-full bg-[#27272a] flex items-center justify-center text-zinc-500 relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl"></div>
                             <div className="relative z-10"><Sparkles className="size-6" /></div>
                          </div>
                        ) : (
                          <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" />
                        )}
                        <div className={`absolute inset-x-0 bottom-0 p-2 bg-black/60 text-[10px] font-bold text-white text-center backdrop-blur-sm transition-transform ${bgId === bg.id ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}>
                          {bg.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Camera</label>
                  <div className="bg-[#27272a] border border-white/10 rounded-xl p-4 flex items-center justify-between text-white text-sm">
                    <span>FaceTime HD Camera</span>
                    <ChevronRight className="size-4 text-zinc-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Quality</label>
                  <div className="flex gap-2 p-1 bg-[#27272a] rounded-xl border border-white/10">
                    {['720p', '1080p', '4K'].map(q => (
                      <button key={q} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${q === '1080p' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-sm font-bold text-white">Mirror Video</span>
                   <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 size-4 bg-white rounded-full shadow-sm" /></div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Microphone</label>
                  <div className="bg-[#27272a] border border-white/10 rounded-xl p-4 flex items-center justify-between text-white text-sm">
                    <span>MacBook Pro Microphone</span>
                    <Mic className="size-4 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Speakers</label>
                  <div className="bg-[#27272a] border border-white/10 rounded-xl p-4 flex items-center justify-between text-white text-sm">
                    <span>System Default</span>
                    <Volume2 className="size-4 text-indigo-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div>
                     <div className="text-sm font-bold text-white">Noise Cancellation</div>
                     <div className="text-xs text-zinc-500">AI-powered background suppression</div>
                   </div>
                   <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 size-4 bg-white rounded-full shadow-sm" /></div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-6 text-center py-10">
                 <Settings className="size-12 text-zinc-600 mx-auto" />
                 <p className="text-zinc-500 font-medium">Advanced studio configurations available in main settings.</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-white/5 bg-[#121214] flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const Meetings: React.FC<MeetingsProps> = ({
  user,
  snippets,
  coverImage,
  activeMeeting,
  setActiveMeeting,
  isInstantLoading,
  onInstantRoom
}) => {
  // Media States
  const [isCamOff, setIsCamOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isSessionLive, setIsSessionLive] = useState(false);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('background');
  const [backgroundId, setBackgroundId] = useState('none');
  
  // Workspace States
  const [activeTab, setActiveTab] = useState<'people' | 'chat' | 'genius' | 'code'>('people');
  const [chatInput, setChatInput] = useState('');
  const [showInviteToast, setShowInviteToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Code Lab State
  const [codeContent, setCodeContent] = useState(INITIAL_CODE);
  const [codeOutput, setCodeOutput] = useState<string[]>(['> Ready to compile...']);
  const [isCodeRunning, setIsCodeRunning] = useState(false);

  // Participant Data
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);

  // Chat & Notes Data
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Sarah Chen', text: 'Can we review the Q4 metrics?', time: '10:02' }
  ]);
  const [geniusNotes, setGeniusNotes] = useState<GeniusNote[]>([]);

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Participants (100 Mock Users)
  useEffect(() => {
    if (activeMeeting && participants.length === 0) {
        const mockParticipants: Participant[] = [
            { id: 'local', name: user.name, role: 'Host', avatar: user.avatar, isLocal: true },
            { id: 'p1', name: 'Sarah Chen', role: 'Co-host', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
            { id: 'p2', name: 'Marcus Lee', role: 'Attendee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
            { id: 'p3', name: 'Alex Rivera', role: 'Viewer', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200' },
        ];
        
        const roles = ['Attendee', 'Viewer', 'Viewer', 'Viewer'];
        for (let i = 4; i < 100; i++) {
            mockParticipants.push({
                id: `p${i}`,
                name: `Participant ${i}`,
                role: roles[Math.floor(Math.random() * roles.length)] as any,
                avatar: `https://ui-avatars.com/api/?name=P+${i}&background=random&color=fff`
            });
        }
        setParticipants(mockParticipants);
        // Default feature: Host + 3 others (4 total)
        setFeaturedIds(['local', 'p1', 'p2', 'p3']);
    } else if (!activeMeeting) {
        setParticipants([]);
        setFeaturedIds([]);
        setIsSessionLive(false);
        setMessages([{ id: '1', sender: 'Sarah Chen', text: 'Can we review the Q4 metrics?', time: '10:02' }]);
        setGeniusNotes([]);
        setBackgroundId('none');
    }
  }, [activeMeeting, user]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Prism Highlight Update
  useEffect(() => {
    if (activeTab === 'code' && typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }, [codeContent, activeTab]);

  // Camera initialization logic
  useEffect(() => {
    // Only attach stream if local user is featured OR we are in lobby
    const shouldAttach = !isCamOff && (featuredIds.includes('local') || !isSessionLive);
    
    if (shouldAttach && userVideoRef.current) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (userVideoRef.current) userVideoRef.current.srcObject = stream;
            })
            .catch(err => console.error("Camera access error:", err));
    }
  }, [isCamOff, activeMeeting, isSessionLive, featuredIds]);

  // Simulated AI Genius Behavior
  useEffect(() => {
    if (isSessionLive) {
      const notes = [
        { type: 'insight', text: 'Discussion centered on Q4 growth targets.' },
        { type: 'action', text: 'Action: Sarah to prepare cohort analysis by Friday.' },
        { type: 'summary', text: 'Key decision: Doubling down on enterprise sales motion.' },
        { type: 'insight', text: 'Sentiment analysis indicates high team confidence.' },
        { type: 'action', text: 'Action: Schedule follow-up sync for API integration.' }
      ];

      let i = 0;
      const interval = setInterval(() => {
        if (i < notes.length) {
          const note = notes[i];
          const newNote: GeniusNote = {
            id: Date.now().toString(),
            type: note.type as any,
            text: note.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setGeniusNotes(prev => [...prev, newNote]);
          
          if (note.type === 'summary') {
             setMessages(prev => [...prev, {
               id: `ai-${Date.now()}`,
               sender: 'Show Genius',
               text: `Show Genius Auto-Summary: ${note.text}`,
               time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
               isAi: true
             }]);
          }
          i++;
        }
      }, 8000); 

      return () => clearInterval(interval);
    }
  }, [isSessionLive]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'You',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
  };

  const handleInvite = () => {
    navigator.clipboard.writeText("https://show.app/meet/sync-q4-2025");
    setShowInviteToast(true);
    setTimeout(() => setShowInviteToast(false), 2000);
  };

  const toggleFeatureParticipant = (id: string) => {
      if (featuredIds.includes(id)) {
          setFeaturedIds(prev => prev.filter(pid => pid !== id));
      } else {
          setFeaturedIds(prev => {
              if (prev.length >= 4) {
                  // FIFO: Remove first, add new
                  return [...prev.slice(1), id];
              }
              return [...prev, id];
          });
      }
  };

  const handleRunCode = async () => {
    setIsCodeRunning(true);
    setCodeOutput(['> Compiling...', '> Running checks...']);
    const result = await analyzeCode(codeContent);
    setCodeOutput(prev => [...prev, '', ...result.split('\n')]);
    setIsCodeRunning(false);
  };

  const filteredParticipants = useMemo(() => {
      if (!searchQuery) return participants;
      return participants.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [participants, searchQuery]);

  const getBackgroundStyle = () => {
    if (backgroundId === 'none') return {};
    if (backgroundId === 'blur') return { backdropFilter: 'blur(12px)' }; // This won't work perfectly on video tag parent but for UI sim
    const bg = BACKGROUNDS.find(b => b.id === backgroundId);
    return bg ? { backgroundImage: `url(${bg.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
  };

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
                           <div className="size-10 rounded-full bg-slate-100 border-4 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">+92</div>
                        </div>
                        <button 
                            onClick={() => setActiveMeeting({
                                id: 'weekly-sync',
                                title: 'Weekly Sync',
                                time: '10:00 AM',
                                attendees: 96
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

  // Lobby / Green Room View
  if (!isSessionLive) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] bg-[#050505] relative">
        <MeetingSettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          activeTab={settingsTab}
          setActiveTab={setSettingsTab}
          bgId={backgroundId}
          setBgId={setBackgroundId}
        />

        <header className="h-16 flex items-center justify-between px-6 bg-[#0a0a0a] border-b border-white/5 shrink-0">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveMeeting(null)}
                  className="p-2 -ml-2 mr-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  title="Back"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
                    {activeMeeting.title.charAt(0)}
                </div>
                <div>
                    <h2 className="text-white font-bold text-sm tracking-tight">{activeMeeting.title}</h2>
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 bg-amber-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Lobby • PREVIEW</span>
                    </div>
                </div>
            </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="w-full max-w-4xl relative aspect-video bg-[#121214] rounded-[48px] border border-white/10 shadow-2xl overflow-hidden flex flex-col group">
              <div className="flex-1 relative bg-zinc-900 overflow-hidden" style={getBackgroundStyle()}>
                 {backgroundId === 'blur' && (
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-xl z-0" />
                 )}
                 {isCamOff ? (
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-4 text-slate-600 bg-[#0a0a0a]">
                      <div className="size-24 bg-white/5 rounded-[32px] flex items-center justify-center border border-white/5 shadow-inner">
                        <User className="size-12 opacity-20" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] font-mono">OPTICAL_LINK_NULL</span>
                    </div>
                 ) : (
                    <video ref={userVideoRef} autoPlay playsInline muted className="relative z-10 w-full h-full object-contain scale-x-[-1]" />
                 )}
                 
                 <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3 z-20">
                    <div className={`size-2 rounded-full ${isCamOff ? 'bg-rose-500' : 'bg-emerald-500'} shadow-[0_0_10px_currentColor]`} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Camera {isCamOff ? 'Off' : 'Ready'}</span>
                 </div>

                 <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 z-20">
                    <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase font-mono">{user.name.toUpperCase()} [HOST]</span>
                 </div>
              </div>

              {/* Lobby Controls */}
              <div className="h-28 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between px-10">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setIsMuted(!isMuted)} className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}>
                        {isMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                    </button>
                    <button onClick={() => setIsCamOff(!isCamOff)} className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isCamOff ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}>
                        {isCamOff ? <VideoIcon className="size-6" /> : <VideoIcon className="size-6" />}
                    </button>
                    <button 
                      onClick={() => setIsSettingsOpen(true)}
                      className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isSettingsOpen ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}
                    >
                        <Settings className="size-6" />
                    </button>
                 </div>

                 <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                       <div className="text-white font-bold text-sm">Ready to join?</div>
                       <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">99 Participants Waiting</div>
                    </div>
                    <button 
                      onClick={() => setIsSessionLive(true)}
                      className="h-14 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-3"
                    >
                       Start Session <Play className="size-4 fill-current" />
                    </button>
                 </div>
              </div>
           </div>
        </main>
      </div>
    );
  }

  // Active Meeting Room View
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#050505] animate-in fade-in duration-500 relative">
        <MeetingSettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          activeTab={settingsTab}
          setActiveTab={setSettingsTab}
          bgId={backgroundId}
          setBgId={setBackgroundId}
        />

        <header className="h-16 flex items-center justify-between px-6 bg-[#0a0a0a] border-b border-white/5 shrink-0">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveMeeting(null)}
                  className="p-2 -ml-2 mr-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  title="Leave Meeting"
                >
                  <ArrowLeft className="size-5" />
                </button>
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
               <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 mr-4">
                  <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">REC 00:12</span>
               </div>
               <button onClick={() => setActiveTab('people')} className={`p-3 rounded-xl transition-all ${activeTab === 'people' ? 'bg-white text-indigo-600' : 'bg-white/5 text-white/60 hover:text-white'}`}>
                  <Users className="size-4" />
               </button>
               <div className="h-6 w-px bg-white/10 mx-2" />
               <button 
                 onClick={handleInvite}
                 className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/10 flex items-center gap-2"
               >
                  {showInviteToast ? <CheckCircle2 className="size-3" /> : <UserPlus className="size-3" />}
                  {showInviteToast ? 'Copied' : 'Invite'}
               </button>
            </div>
        </header>

        <main className="flex-1 flex p-6 gap-6 min-h-0 relative overflow-hidden bg-[#050505]">
          <div className={`flex-1 grid gap-6 ${featuredIds.length === 1 ? 'grid-cols-1' : featuredIds.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
            
            {/* Dynamic Stage Rendering */}
            {featuredIds.map((pid, idx) => {
                const p = participants.find(part => part.id === pid);
                if (!p) return null;
                
                // For 3 items: Item 3 spans full width at bottom if we use grid-rows-2
                const isThirdItem = featuredIds.length === 3 && idx === 2;
                const gridClass = isThirdItem ? 'col-span-2' : '';

                return (
                    <div key={p.id} className={`relative group rounded-[32px] overflow-hidden bg-[#121214] border border-white/5 shadow-2xl flex items-center justify-center ${gridClass} animate-in zoom-in-95 duration-500`}>
                        <div className="absolute inset-0 z-0" style={p.isLocal ? getBackgroundStyle() : {}}></div>
                        {p.isLocal && backgroundId === 'blur' && <div className="absolute inset-0 bg-black/20 backdrop-blur-md z-0" />}
                        
                        {/* Video/Image Container - Set to Object Contain with Black BG to prevent cropping */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center bg-black">
                          {p.isLocal ? (
                              isCamOff ? (
                                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-600 bg-[#0a0a0a]">
                                      <div className="size-24 bg-white/5 rounded-[32px] flex items-center justify-center border border-white/5 shadow-inner">
                                          <User className="size-12 opacity-20" />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-[0.4em] font-mono">OPTICAL_LINK_NULL</span>
                                  </div>
                              ) : (
                                  <video ref={userVideoRef} autoPlay playsInline muted className="w-full h-full object-contain scale-x-[-1]" />
                              )
                          ) : (
                              <img alt={p.name} className="w-full h-full object-contain bg-[#1a1a1c] opacity-90 group-hover:opacity-100 transition-all duration-700" src={p.avatar} />
                          )}
                        </div>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                        
                        <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 z-20">
                            <div className="flex items-center gap-2">
                                {p.isLocal && isMuted ? <MicOff className="text-rose-500 size-3" /> : <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />}
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono text-white">
                                    {p.name.toUpperCase()} {p.role === 'Host' ? '[HOST]' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {isSharingScreen && (
                <div className="relative group rounded-[32px] overflow-hidden bg-[#0a0a0a] border border-dashed border-white/10 h-full flex flex-col items-center justify-center text-center p-8 hover:bg-white/[0.02] transition-colors col-span-2">
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-in zoom-in">
                        <div className="size-20 bg-indigo-500/20 rounded-[24px] flex items-center justify-center border border-indigo-500/40">
                            <Monitor className="size-10 text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Screen Share Active</span>
                        <button onClick={() => setIsSharingScreen(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-bold text-white uppercase tracking-widest transition-all">Stop Sharing</button>
                    </div>
                </div>
            )}
          </div>

          <aside className="w-[420px] flex flex-col gap-6">
             <div className="flex-1 bg-[#121214] rounded-[32px] border border-white/5 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-white/5 flex items-center gap-1 bg-[#0a0a0a]">
                   <button 
                     onClick={() => setActiveTab('people')}
                     className={`flex-1 py-3 rounded-[24px] flex items-center justify-center gap-2 transition-all ${activeTab === 'people' ? 'bg-[#1a1a1c] text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                      <Users className="size-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">People ({participants.length})</span>
                   </button>
                   <button 
                     onClick={() => setActiveTab('chat')}
                     className={`flex-1 py-3 rounded-[24px] flex items-center justify-center gap-2 transition-all ${activeTab === 'chat' ? 'bg-[#1a1a1c] text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                      <MessageSquare className="size-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Chat</span>
                   </button>
                   <button 
                     onClick={() => setActiveTab('genius')}
                     className={`flex-1 py-3 rounded-[24px] flex items-center justify-center gap-2 transition-all ${activeTab === 'genius' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                      <Sparkles className="size-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Genius</span>
                   </button>
                   <button 
                     onClick={() => setActiveTab('code')}
                     className={`flex-1 py-3 rounded-[24px] flex items-center justify-center gap-2 transition-all ${activeTab === 'code' ? 'bg-[#1a1a1c] text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                      <Code className="size-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Code</span>
                   </button>
                </div>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar relative">
                   {activeTab === 'people' && (
                       <div className="space-y-4 h-full flex flex-col">
                           <div className="relative">
                               <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                               <input 
                                   value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)}
                                   className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600" 
                                   placeholder="Filter participants..."
                               />
                           </div>
                           <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                               {filteredParticipants.map(p => {
                                   const isFeatured = featuredIds.includes(p.id);
                                   return (
                                       <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                                           <div className="flex items-center gap-3">
                                               <div className="relative">
                                                   {p.isLocal ? (
                                                       <div className="size-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black">YOU</div>
                                                   ) : (
                                                       <img src={p.avatar} className="size-10 rounded-full object-cover bg-zinc-800" alt={p.name} />
                                                   )}
                                                   {isFeatured && <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-2 border-[#121214] rounded-full" />}
                                               </div>
                                               <div>
                                                   <div className="text-sm font-bold text-white leading-tight">{p.name}</div>
                                                   <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{p.role}</div>
                                               </div>
                                           </div>
                                           <button 
                                               onClick={() => toggleFeatureParticipant(p.id)}
                                               className={`p-2 rounded-lg transition-all ${isFeatured ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-600 hover:text-white hover:bg-white/10'}`}
                                               title={isFeatured ? "Remove from Stage" : "Add to Stage"}
                                           >
                                               {isFeatured ? <Eye className="size-4" /> : <Star className="size-4" />}
                                           </button>
                                       </div>
                                   );
                               })}
                           </div>
                           <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                               <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Stage Capacity: {featuredIds.length}/4</p>
                           </div>
                       </div>
                   )}

                   {activeTab === 'chat' && (
                     <>
                       {messages.map((msg) => (
                         <div key={msg.id} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 ${msg.isAi ? 'bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20' : ''}`}>
                            {msg.isAi ? (
                              <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                                <BrainCircuit className="size-4" />
                              </div>
                            ) : (
                              <div className="size-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                                {msg.sender.charAt(0)}
                              </div>
                            )}
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                 <span className={`text-[10px] font-bold ${msg.isAi ? 'text-indigo-400' : 'text-white/40'}`}>{msg.sender}</span>
                                 <span className="text-[9px] text-white/20">{msg.time}</span>
                               </div>
                               <div className="text-white/80 text-sm leading-relaxed">{msg.text}</div>
                            </div>
                         </div>
                       ))}
                       <div ref={chatEndRef} />
                     </>
                   )}

                   {activeTab === 'genius' && (
                     <div className="space-y-4">
                       {geniusNotes.length === 0 && (
                         <div className="text-center py-10 opacity-50 space-y-4">
                            <BrainCircuit className="size-12 text-indigo-500 mx-auto animate-pulse" />
                            <p className="text-xs font-medium text-indigo-300">Genius is listening...</p>
                         </div>
                       )}
                       {geniusNotes.map((note) => (
                         <div key={note.id} className="bg-[#1a1a1c] p-4 rounded-2xl border border-white/5 animate-in slide-in-from-right-4">
                            <div className="flex items-center gap-2 mb-2">
                               <div className={`size-1.5 rounded-full ${note.type === 'action' ? 'bg-rose-500' : note.type === 'insight' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                               <span className={`text-[9px] font-black uppercase tracking-widest ${note.type === 'action' ? 'text-rose-400' : note.type === 'insight' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                 {note.type}
                               </span>
                               <span className="text-[9px] text-white/20 ml-auto">{note.time}</span>
                            </div>
                            <p className="text-white/70 text-xs font-medium leading-relaxed">{note.text}</p>
                         </div>
                       ))}
                       <div ref={chatEndRef} />
                     </div>
                   )}

                   {activeTab === 'code' && (
                     <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                              <Code className="size-3 text-indigo-400" />
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shared Editor</span>
                           </div>
                           <button 
                             onClick={handleRunCode}
                             disabled={isCodeRunning}
                             className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all disabled:opacity-50 text-[10px] font-black uppercase tracking-widest shadow-lg"
                           >
                             {isCodeRunning ? <Loader2 className="size-3 animate-spin" /> : <Play className="size-3 fill-current" />}
                             Run Code
                           </button>
                        </div>
                        
                        <div className="flex-1 relative rounded-xl overflow-hidden bg-[#0f111a] border border-white/10 code-editor-container">
                           {/* Line Numbers */}
                           <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#0a0c14] border-r border-white/5 flex flex-col items-center py-4 text-[10px] text-slate-700 select-none font-mono">
                              {codeContent.split('\n').map((_, i) => <div key={i} className="h-[20px] leading-[20px]">{i+1}</div>)}
                           </div>
                           
                           {/* Editor Area */}
                           <div className="absolute inset-0 ml-8 overflow-auto custom-scrollbar">
                              <textarea 
                                value={codeContent}
                                onChange={(e) => setCodeContent(e.target.value)}
                                className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none outline-none font-mono text-xs leading-[20px] z-10 whitespace-pre"
                                spellCheck={false}
                              />
                              <pre className="absolute inset-0 w-full h-full p-4 pointer-events-none font-mono text-xs leading-[20px] whitespace-pre">
                                <code className="language-typescript">{codeContent}</code>
                              </pre>
                           </div>
                        </div>

                        {/* Mini Terminal */}
                        <div className="h-32 mt-4 bg-[#0a0c14] rounded-xl border border-white/5 p-4 overflow-y-auto custom-scrollbar">
                           <div className="flex items-center gap-2 mb-2 text-emerald-500">
                              <Terminal className="size-3" />
                              <span className="text-[9px] font-black uppercase tracking-widest">Console Output</span>
                           </div>
                           <div className="font-mono text-[10px] text-slate-400 space-y-1">
                              {codeOutput.map((line, i) => (
                                <div key={i}>{line}</div>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}
                </div>

                {activeTab !== 'people' && activeTab !== 'code' && (
                    <div className="p-4 bg-white/5">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-white/20" 
                        placeholder={activeTab === 'chat' ? "Type a message..." : "Ask Genius..."} 
                        />
                        <button type="submit" className="p-3 bg-white/10 hover:bg-indigo-600 text-white rounded-xl transition-all">
                            {activeTab === 'chat' ? <SendHorizontal className="size-4" /> : <Command className="size-4" />}
                        </button>
                    </form>
                    </div>
                )}
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
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`size-14 rounded-2xl flex items-center justify-center transition-all ${isSettingsOpen ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
               <Settings className="size-6" />
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