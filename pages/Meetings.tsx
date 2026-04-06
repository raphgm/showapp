import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useVirtualBackground } from '../services/useVirtualBackground';
import { setRoomState, subscribeToRoom, deleteRoom, sendChatMessage, subscribeToChatMessages, sendJoinRequest, subscribeToJoinRequests, removeJoinRequest, setGuestApprovalStatus, subscribeToApprovalStatus, syncParticipant, subscribeToParticipants, removeParticipant, type RoomState, type ChatMessageData, type JoinRequest, type ParticipantData } from '../services/firebase';
import { generateGuestIntroduction } from '../services/geminiService';
import { useToast } from '../components/ToastProvider';
import {
  Video, Mic, MicOff, Monitor, PhoneOff, Users, MessageSquare,
  Settings, Share2, MoreVertical, Layout, Maximize2,
  Smile, Hand, Radio, ShieldCheck, Lock, UserPlus,
  Copy, CheckCircle2, ChevronRight, Calendar, Plus,
  User, Clock, Video as VideoIcon, ArrowUpRight, ArrowLeft,
  Play, Sparkles, BrainCircuit, SendHorizontal, Command,
  Search, Star, Eye, X, Image as ImageIcon, Volume2,
  Code, Terminal, Cpu, Loader2, Hash, Pen, Palette, Type as TypeIcon,
  QrCode, Music, FileText, Rss, Rocket, Captions, Youtube,
  ChevronLeft as ChevronLeftIcon, VideoOff, Link2, Globe, Crown,
  Shield, LogIn, ExternalLink, Tv, Gamepad2, MessageCircle, Clapperboard, Podcast, Key, Unplug, Trash2, Edit3, Check,
  Circle, StopCircle, ScreenShare, ScreenShareOff, PictureInPicture2,
  Timer, BarChart3, Layers, Sticker, Zap, Download, Scissors, RotateCcw, Pause,
  Minimize2, Heart, ThumbsUp, PartyPopper, Flame,
  SunMedium, Contrast, Droplets, Focus, Wand2, Camera, ChevronDown, ChevronUp, Grid3x3, EyeOff
} from 'lucide-react';
import { UserProfile, CodeSnippet } from '../types';
import HeroBanner from '../components/HeroBanner';
import Whiteboard from '../components/Whiteboard';

const DEFAULT_ROOM_ID = 'stream-room';

interface MeetingsProps {
  user: UserProfile;
  snippets: CodeSnippet[];
  coverImage?: string;
  activeMeeting: any | null;
  setActiveMeeting: (meeting: any | null) => void;
  isInstantLoading: boolean;
  onInstantRoom: () => void;
}

interface Participant {
  id: string;
  name: string;
  role: 'Host' | 'Co-host' | 'Attendee' | 'Viewer';
  avatar: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isCamOff?: boolean;
  canScreenShare?: boolean; // Host-granted permission for guests
}

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  time: string;
  isLocal?: boolean;
  isFromHost?: boolean;
  recipientId?: string; // For private messages to host
}

interface PollOption {
  id: string;
  text: string;
  votes: string[]; // Array of participant IDs who voted
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  allowMultiple: boolean;
}

type SceneType = 'break' | 'greeting' | 'introduction' | 'qa' | 'outro' | 'tech' | 'demo' | 'guest' | 'whiteboard' | 'custom';

interface Scene {
  id: string;
  name: string;
  icon: React.FC<any>;
  type: SceneType;
  photoUrl?: string;
  guestName?: string;
  guestTopic?: string;
  guestIntroduction?: string;
  talkingPoints?: string[];
  suggestedGreeting?: string;
}

const SCENE_THEMES: Record<SceneType, { bg: string; accent: string; glow: string }> = {
  break: { bg: 'radial-gradient(ellipse at center, #2a2216 0%, #1a1510 40%, #0d0b08 100%)', accent: 'text-amber-500', glow: 'bg-amber-600' },
  greeting: { bg: 'radial-gradient(ellipse at center, #1a1d2e 0%, #111428 40%, #0a0c18 100%)', accent: 'text-sky-400', glow: 'bg-sky-500' },
  introduction: { bg: 'radial-gradient(ellipse at center, #1e1a2e 0%, #16122a 40%, #0b0918 100%)', accent: 'text-violet-400', glow: 'bg-violet-500' },
  qa: { bg: 'radial-gradient(ellipse at center, #1a2a1e 0%, #112818 40%, #0a180c 100%)', accent: 'text-emerald-400', glow: 'bg-emerald-500' },
  outro: { bg: 'radial-gradient(ellipse at center, #2a1a1e 0%, #281118 40%, #180a0c 100%)', accent: 'text-rose-400', glow: 'bg-rose-500' },
  tech: { bg: 'radial-gradient(ellipse at center, #1a2228 0%, #0f1820 40%, #080e14 100%)', accent: 'text-cyan-400', glow: 'bg-cyan-500' },
  demo: { bg: 'radial-gradient(ellipse at center, #221a2a 0%, #181028 40%, #0e0818 100%)', accent: 'text-fuchsia-400', glow: 'bg-fuchsia-500' },
  guest: { bg: 'radial-gradient(ellipse at center, #1a2e1e 0%, #122818 40%, #0a180c 100%)', accent: 'text-pink-400', glow: 'bg-pink-500' },
  whiteboard: { bg: '#ffffff', accent: 'text-indigo-400', glow: 'bg-indigo-500' },
  custom: { bg: 'radial-gradient(ellipse at center, #1a1a1a 0%, #111111 40%, #0a0a0a 100%)', accent: 'text-zinc-400', glow: 'bg-zinc-500' },
};

const VIRTUAL_BACKGROUNDS = [
  // Office
  { id: 'off1', cat: 'office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', label: 'Modern Office' },
  { id: 'off2', cat: 'office', url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80', label: 'Loft Studio' },
  { id: 'off3', cat: 'office', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', label: 'Clean Desk' },
  { id: 'off4', cat: 'office', url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80', label: 'Conference Room' },
  // Nature
  { id: 'nat1', cat: 'nature', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', label: 'Mountain Lake' },
  { id: 'nat2', cat: 'nature', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80', label: 'Forest Aerial' },
  { id: 'nat3', cat: 'nature', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', label: 'Tropical Beach' },
  { id: 'nat4', cat: 'nature', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', label: 'Misty Valley' },
  // Abstract
  { id: 'abs1', cat: 'abstract', url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=800&q=80', label: 'Marble Pink' },
  { id: 'abs2', cat: 'abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', label: 'Fluid Gradient' },
  { id: 'abs3', cat: 'abstract', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80', label: 'Prism Light' },
  { id: 'abs4', cat: 'abstract', url: 'https://images.unsplash.com/photo-1604076913837-52ab5f7c1ac4?auto=format&fit=crop&w=800&q=80', label: 'Ink Swirl' },
  // Gradient
  { id: 'grd1', cat: 'gradient', url: '', label: 'Indigo Night', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' },
  { id: 'grd2', cat: 'gradient', url: '', label: 'Sunset Warm', gradient: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)' },
  { id: 'grd3', cat: 'gradient', url: '', label: 'Ocean Deep', gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)' },
  { id: 'grd4', cat: 'gradient', url: '', label: 'Emerald', gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)' },
  { id: 'grd5', cat: 'gradient', url: '', label: 'Rose Gold', gradient: 'linear-gradient(135deg, #4c1d95 0%, #be185d 50%, #f472b6 100%)' },
  { id: 'grd6', cat: 'gradient', url: '', label: 'Charcoal', gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)' },
  // Blur (no image, just a label — applies CSS blur to the real cam feed)
  { id: 'blur1', cat: 'blur', url: '', label: 'Light Blur', blurAmount: 8 },
  { id: 'blur2', cat: 'blur', url: '', label: 'Medium Blur', blurAmount: 16 },
  { id: 'blur3', cat: 'blur', url: '', label: 'Heavy Blur', blurAmount: 30 },
];

const SCENE_CONTENT: Record<SceneType, { heading: string; sub: string }> = {
  break: { heading: 'Starting Momentarily', sub: 'We\'ll be right back' },
  greeting: { heading: 'Welcome to the Show', sub: 'Glad you\'re here' },
  introduction: { heading: 'Meet Your Host', sub: 'Let\'s get to know each other' },
  qa: { heading: 'Q & A', sub: 'Your questions, answered live' },
  outro: { heading: 'Thanks for Watching', sub: 'See you next time' },
  tech: { heading: 'Deep Dive', sub: 'Let\'s look under the hood' },
  demo: { heading: 'Product Demo', sub: 'See it in action' },
  guest: { heading: 'Meet Our Guest', sub: 'Join us for an exclusive conversation' },
  whiteboard: { heading: 'Collaborative Workspace', sub: 'Let\'s sketch some ideas' },
  custom: { heading: 'Scene', sub: '' },
};

const INITIAL_SCENES: Scene[] = [
  { id: 'break', name: 'Break', icon: Podcast, type: 'break' },
  { id: 'greeting', name: 'Greeting', icon: User, type: 'greeting' },
  { id: 'introduction', name: 'Introduction', icon: Users, type: 'introduction' },
  { id: 'qa', name: 'Q&A', icon: MessageSquare, type: 'qa' },
  { id: 'outro', name: 'Outro', icon: Hand, type: 'outro' },
  { id: 'technical_deep_dive', name: 'Tech Deep Dive', icon: Terminal, type: 'tech' },
  { id: 'whiteboard_scene', name: 'Whiteboard', icon: Pen, type: 'whiteboard' },
  { id: 'product_demo', name: 'Product Demo', icon: Monitor, type: 'demo' },
];

const RIGHT_TOOLS = [
  { id: 'participants', icon: Users, label: 'People' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'polls', icon: BarChart3, label: 'Polls' },
  { id: 'captions', icon: TypeIcon, label: 'Captions' },
  { id: 'enhance', icon: Wand2, label: 'Enhance' },
  { id: 'destinations', icon: Radio, label: 'Stream' },
  { id: 'design', icon: Palette, label: 'Design' },
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'reactions', icon: Smile, label: 'Reactions' },
  { id: 'brand', icon: Zap, label: 'Brand' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'notes', icon: FileText, label: 'Notes' },
  { id: 'analytics', icon: BarChart3, label: 'Stats' },
];

// ─── Share Modal ─────────────────────────────────────
const SimpleShareModal = ({ onClose, activeMeeting }: { onClose: () => void; activeMeeting: any }) => {
  const [copied, setCopied] = useState(false);
  // Use the stored join link if available, otherwise derive it from the room/meeting ID
  const roomId = activeMeeting?.id || DEFAULT_ROOM_ID;
  const liveLink = activeMeeting?.link || `${window.location.origin}/join/${roomId}`;
  const handleCopy = () => { navigator.clipboard.writeText(liveLink); setCopied(true); setTimeout(() => setCopied(false), 2500); };
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1C1E2A] text-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-xl mb-4">Share Production</h2>
        <p className="text-zinc-400 mb-6">Share a link to this live session with your team.</p>
        <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
          <input type="text" readOnly value={liveLink} className="bg-transparent flex-1 px-2 text-zinc-300 text-sm outline-none" />
          <button onClick={handleCopy} className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${copied ? 'bg-emerald-500 text-white' : 'bg-[#5E5CE6] text-white hover:bg-indigo-500'}`}>
            {copied ? <><CheckCircle2 className="size-3" /> Copied</> : <><Copy className="size-3" /> Copy Link</>}
          </button>
        </div>
        <button onClick={onClose} className="w-full mt-6 py-3 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20">Close</button>
      </div>
    </div>
  );
};

// ─── Invite Modal ────────────────────────────────────
const InviteParticipantModal = ({ onClose, activeMeeting, hostName, onAddParticipant, meetingLink }: { onClose: () => void; activeMeeting: any; hostName: string; onAddParticipant: (name: string, email: string) => void; meetingLink: string }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmails, setSentEmails] = useState<{ email: string; role: 'guest' | 'cohost' }[]>([]);
  const [inviteRole, setInviteRole] = useState<'guest' | 'cohost'>('guest');

  // Derive co-host link from the guest meetingLink by swapping /join/ → /cohost/
  const guestLink = meetingLink;
  const cohostLink = meetingLink.replace('/join/', '/cohost/');
  const activeLink = inviteRole === 'cohost' ? cohostLink : guestLink;

  const handleCopyLink = () => { navigator.clipboard.writeText(activeLink); setCopied(true); setTimeout(() => setCopied(false), 2500); };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const roleLabel = inviteRole === 'cohost' ? 'co-host' : 'join';
    const subject = encodeURIComponent(`${hostName} invited you to ${roleLabel} a Show`);
    const roleDescription = inviteRole === 'cohost'
      ? `You've been invited as a Co-host — you'll have full controls to manage scenes, invite guests, record, and stream.`
      : `You've been invited to join a live Show session.`;
    const body = encodeURIComponent(`Hey!\n\n${hostName} has invited you to ${roleLabel} a live Show session.\n\n${roleDescription}\n\nJoin here: ${activeLink}\n\nSee you there!`);
    window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`, '_blank');
    const name = inviteEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    onAddParticipant(name, inviteEmail);
    setSentEmails(prev => [...prev, { email: inviteEmail, role: inviteRole }]);
    setSent(true);
    setInviteEmail('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1C1E2A] text-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center ${inviteRole === 'cohost' ? 'bg-blue-600' : 'bg-[#5E5CE6]'}`}>
              {inviteRole === 'cohost' ? <Shield className="size-5" /> : <UserPlus className="size-5" />}
            </div>
            <div>
              <h2 className="font-bold text-lg">Invite to Show</h2>
              <p className="text-zinc-500 text-xs font-medium">Bring your team into this live session.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><X className="size-4" /></button>
        </div>

        {/* Role Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl mb-6">
          <button
            onClick={() => { setInviteRole('guest'); setCopied(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${inviteRole === 'guest' ? 'bg-[#5E5CE6] text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'
              }`}
          >
            <UserPlus className="size-3.5" /> Guest
          </button>
          <button
            onClick={() => { setInviteRole('cohost'); setCopied(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${inviteRole === 'cohost' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'
              }`}
          >
            <Shield className="size-3.5" /> Co-host
          </button>
        </div>

        {/* Co-host info banner */}
        {inviteRole === 'cohost' && (
          <div className="flex items-start gap-3 p-3 bg-blue-600/10 border border-blue-500/15 rounded-xl mb-5">
            <Shield className="size-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-blue-300/80 leading-relaxed font-medium">
              Co-hosts can manage scenes, invite guests, record, share, stream, and access all studio tools — same as the host.
            </p>
          </div>
        )}

        <form onSubmit={handleSendInvite} className="space-y-3 mb-6">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Send via Email</label>
          <div className="flex items-center gap-2">
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" required className={`flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors ${inviteRole === 'cohost' ? 'focus:border-blue-500' : 'focus:border-[#5E5CE6]'}`} />
            <button type="submit" className={`px-5 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${sent ? 'bg-emerald-500 text-white' : inviteRole === 'cohost' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-[#5E5CE6] text-white hover:bg-indigo-500'}`}>
              {sent ? <><CheckCircle2 className="size-3.5" /> Sent!</> : <><SendHorizontal className="size-3.5" /> Send</>}
            </button>
          </div>
        </form>

        {sentEmails.length > 0 && (
          <div className="mb-6 space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Invited</label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {sentEmails.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg">
                  <div className={`size-7 rounded-full flex items-center justify-center ${item.role === 'cohost' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {item.role === 'cohost' ? <Shield className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                  </div>
                  <span className="text-sm text-zinc-300 font-medium flex-1">{item.email}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${item.role === 'cohost' ? 'text-blue-400' : 'text-zinc-500'}`}>
                    {item.role === 'cohost' ? 'Co-host' : 'Guest'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-x-0 h-px bg-white/10"></div>
          <span className="relative px-3 bg-[#1C1E2A] text-[10px] font-bold text-zinc-500 uppercase tracking-widest">or share link</span>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {inviteRole === 'cohost' ? 'Co-host Link' : 'Join Link'}
          </label>
          <div className={`flex items-center gap-2 p-2 bg-black/20 rounded-lg border ${inviteRole === 'cohost' ? 'border-blue-500/15' : 'border-white/5'}`}>
            <input type="text" readOnly value={activeLink} className="bg-transparent flex-1 px-2 text-zinc-300 text-sm outline-none" />
            <button onClick={handleCopyLink} className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${copied ? 'bg-emerald-500 text-white' : inviteRole === 'cohost' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-[#5E5CE6] text-white hover:bg-indigo-500'}`}>
              {copied ? <><CheckCircle2 className="size-3" /> Copied</> : <><Copy className="size-3" /> Copy</>}
            </button>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-6 py-3 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors">Done</button>
      </div>
    </div>
  );
};

// ─── Schedule Modal ──────────────────────────────────
const ScheduleModal = ({ onClose, onSchedule }: { onClose: () => void; onSchedule: (title: string, date: string, time: string) => void }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time) return;
    onSchedule(title, date, time);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white text-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 border border-slate-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200"><Calendar className="size-5 text-white" /></div>
            <div><h2 className="font-black text-lg text-slate-900">Schedule a Show</h2><p className="text-slate-400 text-xs font-medium">Pick a date and time for your session.</p></div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly Team Sync" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-xs font-bold hover:from-violet-500 hover:to-fuchsia-500 flex items-center gap-2 shadow-lg shadow-violet-200 transition-all"><Calendar className="size-3" /> Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Join Meeting Modal ──────────────────────────────
const JoinMeetingModal = ({ onClose, onJoin }: { onClose: () => void; onJoin: (meetingId: string) => void }) => {
  const [meetingCode, setMeetingCode] = useState('');
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingCode.trim()) return;
    // Extract ID from full URL or use raw code
    const id = meetingCode.includes('/') ? meetingCode.split('/').pop() || meetingCode : meetingCode;
    onJoin(id);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white text-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 border border-slate-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200"><LogIn className="size-5 text-white" /></div>
            <div><h2 className="font-black text-lg text-slate-900">Join a Show</h2><p className="text-slate-400 text-xs font-medium">Enter a meeting link or code to join.</p></div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Meeting Link or Code</label>
            <input type="text" value={meetingCode} onChange={e => setMeetingCode(e.target.value)} placeholder="https://getshowapp.com/my-meeting or abc123" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs font-bold hover:from-emerald-400 hover:to-teal-400 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all"><LogIn className="size-3" /> Join Show</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Create Meeting Link Modal ───────────────────────
const CreateLinkModal = ({ onClose, onStartMeeting }: { onClose: () => void; onStartMeeting?: (meeting: { id: string; title: string; date: string; time: string; type: string; attendees: number; link: string }) => void }) => {
  const [linkTitle, setLinkTitle] = useState('');
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [meetingId, setMeetingId] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const title = linkTitle.trim() || 'meeting';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = Math.random().toString(36).substring(2, 8);
    setMeetingId(id);
    setGeneratedLink(`https://getshowapp.com/${slug}-${id}`);
    setCreated(true);
  };

  const handleStartMeeting = () => {
    if (onStartMeeting) {
      const now = new Date();
      onStartMeeting({
        id: meetingId,
        title: linkTitle.trim() || 'Instant Show',
        date: 'Today',
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'Live Session',
        attendees: 1,
        link: generatedLink,
      });
    }
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Join my Show: ${linkTitle || 'Meeting'}`);
    const body = encodeURIComponent(`Hey!\n\nI've created a Show session for us.\n\nJoin here: ${generatedLink}\n\nSee you there!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white text-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 border border-slate-100" onClick={e => e.stopPropagation()}>
        {!created ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200"><Link2 className="size-5 text-white" /></div>
                <div><h2 className="font-black text-lg text-slate-900">Create a Meeting Link</h2><p className="text-slate-400 text-xs font-medium">Generate a link to share for later.</p></div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Meeting Name (optional)</label>
                <input type="text" value={linkTitle} onChange={e => setLinkTitle(e.target.value)} placeholder="e.g. Design Review, Team Standup" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" autoFocus />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl text-xs font-bold hover:from-indigo-500 hover:to-cyan-500 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"><Link2 className="size-3" /> Create Link</button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200"><CheckCircle2 className="size-5 text-white" /></div>
                <div><h2 className="font-black text-lg text-slate-900">Link Created!</h2><p className="text-slate-400 text-xs font-medium">Share this link with your participants.</p></div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><X className="size-4" /></button>
            </div>

            {linkTitle && <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">{linkTitle}</p>}

            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
              <input type="text" readOnly value={generatedLink} className="bg-transparent flex-1 px-3 text-slate-600 text-sm outline-none font-medium" />
              <button onClick={handleCopy} className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
                {copied ? <><CheckCircle2 className="size-3" /> Copied</> : <><Copy className="size-3" /> Copy</>}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleShareEmail} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                <SendHorizontal className="size-3.5" /> Share via Email
              </button>
              <button onClick={handleCopy} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                <Copy className="size-3.5" /> Copy Link
              </button>
            </div>

            <button onClick={handleStartMeeting} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
              <Play className="size-3.5 fill-white" /> Start Meeting Now
            </button>

            <button onClick={onClose} className="w-full py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Studio Settings Modal ───────────────────────────
const StudioSettingsModal = ({
  onClose,
  settings,
  onUpdate,
  activeBackgroundId,
  onSelectBackground
}: {
  onClose: () => void;
  settings: any;
  onUpdate: (s: any) => void;
  activeBackgroundId?: string | null;
  onSelectBackground?: (id: string | null) => void;
}) => {
  const [resolution, setResolution] = useState(settings.resolution || '1080p');
  const [framerate, setFramerate] = useState(settings.framerate || '30fps');
  const [audioInput, setAudioInput] = useState(settings.audioInput || 'Default Microphone');
  const handleSave = () => { onUpdate({ resolution, framerate, audioInput }); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1C1E2A] text-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 max-h-[85vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all z-10"><X className="size-5" /></button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-zinc-700 rounded-xl flex items-center justify-center"><Settings className="size-5" /></div>
            <div>
              <h2 className="font-bold text-lg">Studio Settings</h2>
              <p className="text-zinc-500 text-xs font-medium">Configure stream quality & environment.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Virtual Environment Section */}
          {onSelectBackground && (
            <div className="pb-6 border-b border-white/10">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                <ImageIcon className="size-3" /> Virtual Environment
              </label>

              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1 costume-scrollbar">
                <button
                  onClick={() => onSelectBackground(null)}
                  className={`aspect-video rounded-lg border-2 flex flex-col items-center justify-center transition-all ${!activeBackgroundId ? 'border-[#5E5CE6] bg-[#5E5CE6]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                >
                  <span className="text-[8px] font-bold text-zinc-400">None</span>
                </button>
                {VIRTUAL_BACKGROUNDS.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => onSelectBackground(bg.id)}
                    className={`aspect-video rounded-lg border-2 overflow-hidden transition-all relative ${activeBackgroundId === bg.id ? 'border-[#5E5CE6] ring-1 ring-[#5E5CE6]/30' : 'border-white/10 hover:border-white/20'}`}
                    title={bg.label}
                  >
                    {bg.url ? (
                      <img src={bg.url} className="w-full h-full object-cover" alt={bg.label} loading="lazy" />
                    ) : (bg as any).gradient ? (
                      <div className="w-full h-full" style={{ background: (bg as any).gradient }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                        <Focus className="size-3 text-zinc-500" />
                      </div>
                    )}
                    {activeBackgroundId === bg.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                        <CheckCircle2 className="size-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Resolution</label>
              <div className="flex flex-col gap-2">
                {['720p', '1080p', '4K'].map(r => (
                  <button key={r} onClick={() => setResolution(r)} className={`py-2 px-3 rounded-lg text-xs font-bold text-left transition-all ${resolution === r ? 'bg-[#5E5CE6] text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Frame Rate</label>
              <div className="flex flex-col gap-2">
                {['24fps', '30fps', '60fps'].map(f => (
                  <button key={f} onClick={() => setFramerate(f)} className={`py-2 px-3 rounded-lg text-xs font-bold text-left transition-all ${framerate === f ? 'bg-[#5E5CE6] text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Audio Input</label>
            <select value={audioInput} onChange={e => setAudioInput(e.target.value)} className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-200 outline-none focus:border-[#5E5CE6] [color-scheme:dark]">
              <option value="Default Microphone">Default Microphone</option>
              <option value="External Mic">External Microphone</option>
              <option value="System Audio">System Audio</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2.5 bg-[#5E5CE6] rounded-lg text-xs font-bold hover:bg-indigo-500">Save Settings</button>
        </div>
      </div>
    </div>
  );
};

// ─── Add Source Modal ─────────────────────────────────
const AddSourceModal = ({ onClose, onSelectSource }: { onClose: () => void; onSelectSource: (source: string) => void }) => {
  const sources = [
    { id: 'camera', icon: VideoIcon, label: 'Camera', desc: 'Webcam feed' },
    { id: 'screen', icon: Monitor, label: 'Screen Share', desc: 'Entire screen or window' },
    { id: 'image', icon: ImageIcon, label: 'Image', desc: 'Logo or overlay' },
    { id: 'text', icon: TypeIcon, label: 'Text', desc: 'Titles & lower thirds' },
    { id: 'browser', icon: Globe, label: 'Browser', desc: 'Web page source' },
  ];
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1C1E2A] text-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-cyan-600 rounded-xl flex items-center justify-center"><Plus className="size-5" /></div>
            <div><h2 className="font-bold text-lg">Add Source</h2><p className="text-zinc-500 text-xs font-medium">Add a new input to your scene.</p></div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg"><X className="size-4" /></button>
        </div>
        <div className="space-y-2">
          {sources.map(s => (
            <button key={s.id} onClick={() => { onSelectSource(s.id); onClose(); }} className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-left">
              <div className="size-10 bg-white/10 rounded-lg flex items-center justify-center text-cyan-400"><s.icon className="size-5" /></div>
              <div><div className="text-sm font-bold text-zinc-200">{s.label}</div><div className="text-xs text-zinc-500">{s.desc}</div></div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-6 py-3 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20">Cancel</button>
      </div>
    </div>
  );
};

// ─── Add Channel Modal ───────────────────────────────
const AddChannelModal = ({ onClose, onAdd, existingPlatforms }: { onClose: () => void; onAdd: (name: string, platform: string, rtmpUrl: string, streamKey: string) => void; existingPlatforms: string[] }) => {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedPlatform, setSelectedPlatform] = useState<{ id: string; name: string; icon: React.ReactNode; color: string; rtmpDefault: string } | null>(null);
  const [channelName, setChannelName] = useState('');
  const [rtmpUrl, setRtmpUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');

  const AVAILABLE_PLATFORMS = [
    { id: 'youtube', name: 'YouTube', icon: <Youtube className="size-5 text-white" />, color: 'bg-red-600', rtmpDefault: 'rtmp://a.rtmp.youtube.com/live2' },
    { id: 'twitch', name: 'Twitch', icon: <Gamepad2 className="size-5 text-white" />, color: 'bg-purple-600', rtmpDefault: 'rtmp://live.twitch.tv/app' },
    { id: 'twitter', name: 'X (Twitter)', icon: <X className="size-5 text-white" />, color: 'bg-black', rtmpDefault: 'rtmp://va.pscp.tv:80/x' },
    { id: 'facebook', name: 'Facebook', icon: <Globe className="size-5 text-white" />, color: 'bg-blue-600', rtmpDefault: 'rtmps://live-api-s.facebook.com:443/rtmp/' },
    { id: 'instagram', name: 'Instagram', icon: <Clapperboard className="size-5 text-white" />, color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400', rtmpDefault: 'rtmps://live-upload.instagram.com:443/rtmp/' },
    { id: 'tiktok', name: 'TikTok', icon: <Music className="size-5 text-white" />, color: 'bg-black', rtmpDefault: 'rtmp://push.tiktok.com/live/' },
    { id: 'linkedin', name: 'LinkedIn', icon: <Rss className="size-5 text-white" />, color: 'bg-sky-700', rtmpDefault: 'rtmp://rtmp-api.linkedin.com/rtmp' },
    { id: 'kick', name: 'Kick', icon: <Tv className="size-5 text-white" />, color: 'bg-emerald-500', rtmpDefault: 'rtmp://fa723fc1b171.global-contribute.live-video.net/app/' },
    { id: 'discord', name: 'Discord', icon: <MessageCircle className="size-5 text-white" />, color: 'bg-indigo-500', rtmpDefault: '' },
    { id: 'restream', name: 'Restream', icon: <Radio className="size-5 text-white" />, color: 'bg-blue-500', rtmpDefault: 'rtmp://live.restream.io/live' },
    { id: 'podcast', name: 'Podcast', icon: <Podcast className="size-5 text-white" />, color: 'bg-orange-600', rtmpDefault: '' },
    { id: 'custom', name: 'Custom RTMP', icon: <Unplug className="size-5 text-white" />, color: 'bg-zinc-600', rtmpDefault: '' },
  ];

  const handleSelectPlatform = (p: typeof AVAILABLE_PLATFORMS[0]) => {
    setSelectedPlatform(p);
    setRtmpUrl(p.rtmpDefault);
    setChannelName('');
    setStreamKey('');
    setStep('configure');
  };

  const handleAdd = () => {
    if (!selectedPlatform || !channelName.trim()) return;
    onAdd(channelName, selectedPlatform.name, rtmpUrl, streamKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1C1E2A] text-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {step === 'configure' && (
              <button onClick={() => setStep('select')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="size-4" /></button>
            )}
            <div>
              <h2 className="font-bold text-lg">{step === 'select' ? 'Add Destination' : `Connect ${selectedPlatform?.name}`}</h2>
              <p className="text-zinc-500 text-xs font-medium">{step === 'select' ? 'Choose a platform to stream to' : 'Enter your stream credentials'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg"><X className="size-4" /></button>
        </div>

        {step === 'select' ? (
          <div className="p-6 grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto no-scrollbar">
            {AVAILABLE_PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectPlatform(p)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/5 hover:border-[#5E5CE6]/30 hover:bg-[#5E5CE6]/5 transition-all group"
              >
                <div className={`size-10 rounded-xl flex items-center justify-center ${p.color} group-hover:scale-110 transition-transform`}>
                  {p.icon}
                </div>
                <span className="text-[11px] font-bold text-zinc-300">{p.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Platform Badge */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <div className={`size-10 rounded-xl flex items-center justify-center ${selectedPlatform?.color}`}>{selectedPlatform?.icon}</div>
              <div>
                <div className="text-sm font-bold text-white">{selectedPlatform?.name}</div>
                <div className="text-[10px] text-zinc-500">Streaming destination</div>
              </div>
            </div>

            {/* Channel Name */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Channel / Account Name</label>
              <input
                type="text"
                value={channelName}
                onChange={e => setChannelName(e.target.value)}
                placeholder={`e.g. My ${selectedPlatform?.name} Channel`}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-200 outline-none focus:border-[#5E5CE6] placeholder-zinc-600"
                autoFocus
              />
            </div>

            {/* RTMP URL */}
            {selectedPlatform?.rtmpDefault !== undefined && (
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">RTMP Server URL</label>
                <input
                  type="text"
                  value={rtmpUrl}
                  onChange={e => setRtmpUrl(e.target.value)}
                  placeholder="rtmp://..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-200 font-mono outline-none focus:border-[#5E5CE6] placeholder-zinc-600"
                />
              </div>
            )}

            {/* Stream Key */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Stream Key</label>
              <input
                type="password"
                value={streamKey}
                onChange={e => setStreamKey(e.target.value)}
                placeholder="Paste your stream key here"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-200 font-mono outline-none focus:border-[#5E5CE6] placeholder-zinc-600"
              />
              <p className="text-[10px] text-zinc-600 mt-1.5 flex items-center gap-1"><Lock className="size-3" /> Your stream key is stored locally and never sent to our servers.</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-5 py-2.5 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors">Cancel</button>
              <button
                onClick={handleAdd}
                disabled={!channelName.trim()}
                className="px-5 py-2.5 bg-[#5E5CE6] rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Destination
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Update Titles Modal ─────────────────────────────
const UpdateTitlesModal = ({ onUpdate, onClose, newGlobalTitle, setNewGlobalTitle }: { onUpdate: () => void; onClose: () => void; newGlobalTitle: string; setNewGlobalTitle: (t: string) => void }) => (
  <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-[#1C1E2A] rounded-2xl p-8 w-full max-w-md shadow-2xl text-white animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
      <h2 className="font-bold text-xl mb-4">Update Stream Titles</h2>
      <p className="text-zinc-400 mb-6">Apply a new title to all currently active channels.</p>
      <input type="text" value={newGlobalTitle} onChange={(e) => setNewGlobalTitle(e.target.value)} placeholder="Enter new global title..." className="w-full bg-white/10 rounded-lg p-3 mb-6 text-zinc-200" />
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-5 py-2.5 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20">Cancel</button>
        <button onClick={onUpdate} className="px-5 py-2.5 bg-[#5E5CE6] rounded-lg text-xs font-bold hover:bg-indigo-500">Update All</button>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════
// Main Meetings Component
// ═══════════════════════════════════════════════════════
const Meetings: React.FC<MeetingsProps> = ({
  user, snippets, coverImage, activeMeeting, setActiveMeeting, isInstantLoading, onInstantRoom
}) => {
  const isGuest = user.role === 'Guest';
  const isCoHostByUserRole = user.role === 'Co-host';
  const { addToast } = useToast();

  // Media
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [isCamOff, setIsCamOff] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastTime, setBroadcastTime] = useState(0);

  // Green Room / Lobby
  const [isInLobby, setIsInLobby] = useState(true);
  const lobbyVideoRef = useRef<HTMLVideoElement>(null);
  const [lobbyStream, setLobbyStream] = useState<MediaStream | null>(null);
  const [faceEnhance, setFaceEnhance] = useState({ smoothSkin: 0, brightness: 0, warmth: 0, eyeBrighten: 0, softFocus: 0 });
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [bgCategory, setBgCategory] = useState<'all' | 'office' | 'nature' | 'abstract' | 'gradient' | 'blur'>('all');

  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const recordTimerRef = useRef<number | null>(null);

  // Screen share
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // Hand raise / Reactions
  const [handRaised, setHandRaised] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionOverlays, setReactionOverlays] = useState<{ id: number; emoji: string; x: number }[]>([]);

  // Layout & View
  const [layoutMode, setLayoutMode] = useState<'default' | 'pip' | 'sidebyside' | 'focus'>('default');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPiP, setShowPiP] = useState(true);

  // Timer
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  // More controls visibility
  const [showMoreControls, setShowMoreControls] = useState(false);

  // Studio State
  const [studioTitle, setStudioTitle] = useState(user.name ? `${user.name.split(' ')[0]}'s Show` : 'My Show');
  const [scenes, setScenes] = useState(INITIAL_SCENES);
  const [activeSceneId, setActiveSceneId] = useState('greeting');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [toolsSidebarOpen, setToolsSidebarOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);

  // Move participants state up because canControl depends on it
  const [participants, setParticipants] = useState<Participant[]>([]);
  // Derived constants & Permission flags
  const roomId = activeMeeting?.id;
  const localParticipant = participants.find(p => p.isLocal);

  // Determine the effective role for the local user
  // Authenticated owners/admins should always default to 'Host' unless specifically joined as a co-host or guest.
  const isAccountOwner = user.role === 'Owner' || user.role === 'Admin' || user.role === 'Member' || (!isGuest && !isCoHostByUserRole);
  const localRoleFallback: 'Host' | 'Co-host' | 'Attendee' | 'Viewer' =
    (user.role as any) === 'Co-host' ? 'Co-host' : isGuest ? 'Attendee' : 'Host';

  const currentRole = localParticipant?.role || (isAccountOwner ? 'Host' : localRoleFallback);
  const isHost = currentRole === 'Host';
  const isCoHost = currentRole === 'Co-host';
  const canControl = isHost || isCoHost; // Can manage scenes, invite, record, stream, etc.
  const canScreenShare = canControl || !!localParticipant?.canScreenShare; // Can share screen if host/co-host OR granted permission

  // Automatically handle panel states when entering a meeting
  useEffect(() => {
    if (activeMeeting) {
      if (canControl) {
        // Hosts/Co-hosts should see their scenes and tools by default
        setLeftPanelOpen(true);
        setToolsSidebarOpen(true);
      } else {
        // Invited guests/Attendees should have a clean, collapsed view
        setLeftPanelOpen(false);
        setToolsSidebarOpen(false);
        setActiveTool(null);
      }
    }
  }, [activeMeeting, canControl]);

  const [lobbyEnhanceOpen, setLobbyEnhanceOpen] = useState(false);
  const [showQuickVB, setShowQuickVB] = useState(false);
  const [studioSettings, setStudioSettings] = useState({ resolution: '1080p', framerate: '30fps', audioInput: 'Default Microphone' });

  // Participants management
  const [pendingJoinRequests, setPendingJoinRequests] = useState<JoinRequest[]>([]);
  const notifiedRequestIdsRef = useRef<Set<string>>(new Set());
  const [recordingRecipients, setRecordingRecipients] = useState<{ name: string; email: string }[]>([]);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Polls
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);

  // Modal States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isUpdateTitlesModalOpen, setIsUpdateTitlesModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);

  // Focus mode – hides all UI except chat popup & join-request notifications
  const [focusMode, setFocusMode] = useState(false);
  const [focusBtnPos, setFocusBtnPos] = useState<{ x: number; y: number }>({ x: 20, y: 120 });
  const [focusBtnDragging, setFocusBtnDragging] = useState(false);
  const focusBtnDragRef = useRef({ startX: 0, startY: 0, initX: 0, initY: 0, moved: false });

  useEffect(() => {
    if (!focusBtnDragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - focusBtnDragRef.current.startX;
      const dy = e.clientY - focusBtnDragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) focusBtnDragRef.current.moved = true;
      setFocusBtnPos({
        x: Math.max(4, Math.min(window.innerWidth - 52, focusBtnDragRef.current.initX + dx)),
        y: Math.max(4, Math.min(window.innerHeight - 52, focusBtnDragRef.current.initY + dy)),
      });
    };
    const onUp = () => setFocusBtnDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [focusBtnDragging]);
  const [isAddGuestSceneModalOpen, setIsAddGuestSceneModalOpen] = useState(false);
  const [guestSceneForm, setGuestSceneForm] = useState({ name: '', photoUrl: '', topic: '' });
  const [isGeneratingGuestIntro, setIsGeneratingGuestIntro] = useState(false);
  const [isUploadingGuestPhoto, setIsUploadingGuestPhoto] = useState(false);
  const [wasRejected, setWasRejected] = useState(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const guestPhotoInputRef = useRef<HTMLInputElement>(null);
  const [newGlobalTitle, setNewGlobalTitle] = useState('');

  // Stream Checklist state
  const [streamChecklist, setStreamChecklist] = useState([
    { task: 'Test microphone levels and audio quality', completed: false, priority: 'high' },
    { task: 'Check camera framing and lighting', completed: false, priority: 'high' },
    { task: 'Configure stream destination (YouTube, Twitch, etc.)', completed: false, priority: 'high' },
    { task: 'Prepare scene layouts and overlays', completed: false, priority: 'medium' },
    { task: 'Set up chat integration and alerts', completed: false, priority: 'medium' },
    { task: 'Test internet connection and bitrate', completed: false, priority: 'medium' },
    { task: 'Prepare backup audio/video sources', completed: false, priority: 'low' },
  ]);
  const [clDraggedItem, setClDraggedItem] = useState<number | null>(null);
  const [clEditingItem, setClEditingItem] = useState<number | null>(null);
  const [clEditText, setClEditText] = useState('');
  const [clNewTaskText, setClNewTaskText] = useState('');

  const toggleClItem = (idx: number) => setStreamChecklist(prev => prev.map((item, i) => i === idx ? { ...item, completed: !item.completed } : item));
  const clStartEditing = (idx: number) => { setClEditingItem(idx); setClEditText(streamChecklist[idx].task); };
  const clSaveEdit = (idx: number) => { if (clEditText.trim()) { setStreamChecklist(prev => prev.map((item, i) => i === idx ? { ...item, task: clEditText.trim() } : item)); } setClEditingItem(null); };
  const clCancelEdit = () => setClEditingItem(null);
  const clDeleteItem = (idx: number) => setStreamChecklist(prev => prev.filter((_, i) => i !== idx));
  const clAddNewTask = () => { if (clNewTaskText.trim()) { setStreamChecklist(prev => [...prev, { task: clNewTaskText.trim(), completed: false, priority: 'medium' }]); setClNewTaskText(''); } };
  const clHandleDragStart = (idx: number) => setClDraggedItem(idx);
  const clHandleDragOver = (e: React.DragEvent) => e.preventDefault();
  const clHandleDrop = (idx: number) => { if (clDraggedItem === null || clDraggedItem === idx) return; const items = [...streamChecklist]; const [moved] = items.splice(clDraggedItem, 1); items.splice(idx, 0, moved); setStreamChecklist(items); setClDraggedItem(null); };
  const clHandleDragEnd = () => setClDraggedItem(null);

  // Scheduled meetings — user-created only
  const [scheduledMeetings, setScheduledMeetings] = useState<
    { id: string; title: string; date: string; time: string; attendees: number; type: string }[]
  >([]);

  // Active scheduled countdown
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!scheduledTime) { setCountdown(''); return; }
    const tick = () => {
      const diff = scheduledTime.getTime() - Date.now();
      if (diff <= 0) { setCountdown('Starting now!'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [scheduledTime]);

  // ─── Channel Configuration ───────────────────────
  const [channels, setChannels] = useState<{
    id: string; name: string; platform: string; platformIcon: React.ReactNode; color: string;
    connected: boolean; title: string; rtmpUrl?: string; streamKey?: string; paired?: boolean;
  }[]>([]);
  const [isChannelConfigOpen, setIsChannelConfigOpen] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false);

  // Scene management
  const [renamingSceneId, setRenamingSceneId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [liveSceneId, setLiveSceneId] = useState('greeting');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sceneOverlayDismissed, setSceneOverlayDismissed] = useState<string | null>(null);

  // Break scene
  const [breakMessage, setBreakMessage] = useState('Starting Momentarily');
  const [breakSubtitle, setBreakSubtitle] = useState('');

  // Notes
  const [notesContent, setNotesContent] = useState('');

  // Auto-generated meeting invite link
  const meetingLink = activeMeeting?.link || `https://getshowapp.com/join/${activeMeeting?.id || Math.random().toString(36).substring(2, 8)}`;
  const [linkCopied, setLinkCopied] = useState(false);
  const handleCopyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Captions
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [captionsFontSize, setCaptionsFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [captionsPosition, setCaptionsPosition] = useState<'bottom' | 'top'>('bottom');

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const broadcastTimerRef = useRef<number | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // ─── Helpers ────────────────────────────────────────
  const addSystemChat = useCallback((text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'System',
      senderId: 'system',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLocal: false,
      isFromHost: true,
    };
    setChatMessages(prev => [...prev, msg]);
    // Sync system messages to Firebase
    if (roomId && canControl) {
      sendChatMessage(roomId, {
        id: msg.id,
        senderId: 'system',
        senderName: 'System',
        text: msg.text,
        time: msg.time,
        isFromHost: true,
      }).catch(console.error);
    }
  }, [roomId, canControl]);

  const formatBroadcastTime = (s: number) => {
    const hours = Math.floor(s / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const seconds = (s % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const simulateJoinRequest = (name: string, email: string) => {
    setPendingJoinRequests(prev => {
      // Avoid duplicates
      if (prev.some(r => r.email === email)) return prev;
      return [...prev, { id: Date.now().toString(), name, email }];
    });
    // Notify host about pending join request
    if (canControl) {
      addToast(`${name} is waiting to join`, 'info');
    }
  };

  const handleAcceptJoin = useCallback((request: JoinRequest) => {
    // System message and notifications
    addSystemChat(`${request.name} joined the Show`);

    if (request.wantsRecording && request.email) {
      setRecordingRecipients(prev => [...prev, { name: request.name, email: request.email }]);
      addToast(`${request.name} joined — recording will be sent to ${request.email}`, 'success');
    } else {
      addToast(`${request.name} has joined the Show`, 'info');
    }
    // Set approval status and remove from Firebase
    const targetRoomId = activeMeeting?.id || DEFAULT_ROOM_ID;
    setGuestApprovalStatus(targetRoomId, request.id, true).catch(err => {
      console.error('Failed to set approval status:', err);
    });
    removeJoinRequest(targetRoomId, request.id).catch(err => {
      console.error('Failed to remove join request:', err);
    });
  }, [activeMeeting?.id, addToast, addSystemChat]);

  const handleDenyJoin = (id: string) => {
    const request = pendingJoinRequests.find(r => r.id === id);
    const targetRoomId = activeMeeting?.id || DEFAULT_ROOM_ID;
    setGuestApprovalStatus(targetRoomId, id, false).catch(err => {
      console.error('Failed to set approval status:', err);
    });
    removeJoinRequest(targetRoomId, id).catch(err => {
      console.error('Failed to remove join request:', err);
    });
    if (request) {
      addSystemChat(`${request.name}'s request to join was denied`);
      addToast(`🚫 Denied ${request.name}'s request`, 'info');
    }
  };

  const handleAddParticipantFromInvite = (name: string, email: string) => {
    // Add as pending join request — they'll appear when they click the link
    simulateJoinRequest(name, email);
    addSystemChat(`Invite sent to ${name} (${email})`);
  };

  const handleRemoveParticipant = (id: string) => {
    const p = participants.find(x => x.id === id);
    setParticipants(prev => prev.filter(x => x.id !== id));
    if (p) addSystemChat(`${p.name} was removed from the Show`);
  };

  const handlePromoteParticipant = (id: string) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, role: 'Co-host' } : p));
  };

  const handleToggleScreenSharePermission = (id: string) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === id) {
        const newPermission = !p.canScreenShare;
        const participant = participants.find(x => x.id === id);
        if (participant) {
          addSystemChat(`${participant.name} ${newPermission ? 'can now' : 'can no longer'} share screen`);
        }
        return { ...p, canScreenShare: newPermission };
      }
      return p;
    }));
  };

  // ─── Effects ────────────────────────────────────────

  // Guest auto-request: if user is a guest and meeting is active, request to join
  // Guest approval/join request logic removed: guests join instantly

  // Host: Subscribe to join requests from Firebase
  // Dashboard Host: Subscribe to DEFAULT_ROOM_ID requests even when not in an active meeting
  useEffect(() => {
    if (!activeMeeting && !isGuest) {
      const unsubscribe = subscribeToJoinRequests(DEFAULT_ROOM_ID, (requests) => {
        setPendingJoinRequests(requests);
      });
      return () => unsubscribe();
    }
  }, [activeMeeting, isGuest]);

  // Active Meeting Host: Subscribe to join requests for the current meeting
  useEffect(() => {
    if (activeMeeting && !isGuest) {
      const unsubscribe = subscribeToJoinRequests(activeMeeting.id, (requests) => {
        setPendingJoinRequests(requests);
      });
      return () => unsubscribe();
    }
  }, [activeMeeting, isGuest]);

  // Auto-accept join requests to ensure guests join instantly and host sees them
  useEffect(() => {
    if (!isGuest && pendingJoinRequests.length > 0) {
      pendingJoinRequests.forEach(req => {
        if (!notifiedRequestIdsRef.current.has(req.id)) {
          notifiedRequestIdsRef.current.add(req.id);
          handleAcceptJoin(req);
        }
      });
    }
  }, [pendingJoinRequests, isGuest, handleAcceptJoin]);

  // Guest: Subscribe to own approval status
  // Approval status subscription removed

  // Lobby: acquire camera preview as soon as meeting starts
  useEffect(() => {
    if (activeMeeting && isInLobby) {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
        .then(stream => {
          setLobbyStream(stream);
          setCamError(null);
          if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error('Lobby camera access failed:', err);
          setCamError(err?.message || 'Camera access failed');
        });
    }
    return () => {
      if (isInLobby) {
        lobbyStream?.getTracks().forEach(t => t.stop());
      }
    };
  }, [activeMeeting, isInLobby]);

  // Lobby video ref sync
  useEffect(() => {
    if (lobbyStream) {
      if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = lobbyStream;
      if (lobbyVBg.videoRef.current) lobbyVBg.videoRef.current.srcObject = lobbyStream;
    }
  }, [lobbyStream]);

  // Lobby mic/cam toggles
  useEffect(() => {
    if (lobbyStream) {
      lobbyStream.getVideoTracks().forEach(t => t.enabled = !isCamOff);
      lobbyStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
    }
  }, [lobbyStream, isCamOff, isMuted]);

  useEffect(() => {
    if (activeMeeting && !isInLobby) {
      // Syncing local user data is now handled by the Firebase sync effect below

      // Set studio title from meeting
      if (activeMeeting.title) {
        setStudioTitle(activeMeeting.title);
      }

      // Transfer lobby stream to studio or acquire new one
      if (lobbyStream) {
        setCamStream(lobbyStream);
        if (userVideoRef.current) userVideoRef.current.srcObject = lobbyStream;
        setLobbyStream(null);
      } else {
        navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 }, audio: true })
          .then(stream => {
            setCamStream(stream);
            setCamError(null);
            if (userVideoRef.current) userVideoRef.current.srcObject = stream;
          })
          .catch(err => {
            console.error('Camera access failed:', err);
            setCamError(err?.message || 'Camera access failed');
          });
      }

      return () => {
        camStream?.getTracks().forEach(track => track.stop());
      };
    }
  }, [activeMeeting, isInLobby]);

  useEffect(() => {
    if (camStream) camStream.getVideoTracks().forEach(track => track.enabled = !isCamOff);
  }, [camStream, isCamOff]);

  useEffect(() => {
    if (camStream) camStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
  }, [camStream, isMuted]);

  useEffect(() => {
    if (isBroadcasting) {
      broadcastTimerRef.current = window.setInterval(() => setBroadcastTime(prev => prev + 1), 1000);
    } else {
      if (broadcastTimerRef.current) clearInterval(broadcastTimerRef.current);
      setBroadcastTime(0);
    }
    return () => { if (broadcastTimerRef.current) clearInterval(broadcastTimerRef.current); };
  }, [isBroadcasting]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordTimerRef.current = window.setInterval(() => setRecordTime(prev => prev + 1), 1000);
    } else {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      setRecordTime(0);
    }
    return () => { if (recordTimerRef.current) clearInterval(recordTimerRef.current); };
  }, [isRecording]);

  // Countdown timer
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = window.setInterval(() => setTimerSeconds(prev => {
        if (prev <= 1) { setTimerRunning(false); return 0; }
        return prev - 1;
      }), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ─── Room State Sync (Host → Participants) ──────────────────────────

  // Host: Push state changes to Firebase
  useEffect(() => {
    if (!roomId || !canControl || isInLobby) return;
    const state: Partial<RoomState> = {
      liveSceneId,
      sceneOverlayDismissed,
      isBroadcasting,
      isRecording,
      breakMessage,
      breakSubtitle,
      studioTitle,
      scenes: scenes.map(s => ({ id: s.id, name: s.name, type: s.type })),
      hostId: user.uid || 'host',
    };
    setRoomState(roomId, state).catch(console.error);
  }, [roomId, canControl, isInLobby, liveSceneId, sceneOverlayDismissed, isBroadcasting, isRecording, breakMessage, breakSubtitle, studioTitle, scenes, user.uid]);

  // Participant: Subscribe to room state changes
  useEffect(() => {
    if (!roomId || canControl) return;
    const unsubscribe = subscribeToRoom(roomId, (state) => {
      if (!state) return;
      // Apply host state to participant view
      if (state.liveSceneId) setLiveSceneId(state.liveSceneId);
      if (state.sceneOverlayDismissed !== undefined) setSceneOverlayDismissed(state.sceneOverlayDismissed);
      if (state.isBroadcasting !== undefined) setIsBroadcasting(state.isBroadcasting);
      if (state.isRecording !== undefined) setIsRecording(state.isRecording);
      if (state.breakMessage) setBreakMessage(state.breakMessage);
      if (state.breakSubtitle !== undefined) setBreakSubtitle(state.breakSubtitle);
      if (state.studioTitle) setStudioTitle(state.studioTitle);
      // Sync scene names (preserve icons from INITIAL_SCENES)
      if (state.scenes) {
        setScenes(prev => state.scenes.map(ss => {
          const existing = prev.find(p => p.id === ss.id);
          return existing ? { ...existing, name: ss.name } : { id: ss.id, name: ss.name, type: ss.type, icon: Sparkles };
        }));
      }
    });
    return unsubscribe;
  }, [roomId, canControl, isInLobby]);

  useEffect(() => {
    console.log('[Meetings] Room Setup:', { roomId, userId: user.uid, role: currentRole, isInLobby });
  }, [roomId, user.uid, currentRole, isInLobby]);

  // Subscribe to participants from Firebase
  useEffect(() => {
    if (!roomId) return;
    const myId = user.uid || 'local-user';

    const unsubscribe = subscribeToParticipants(roomId, (remoteParticipants) => {
      console.log('[Meetings] Participants update:', remoteParticipants.length, remoteParticipants);
      setParticipants(remoteParticipants.map(rp => ({
        id: rp.id,
        name: rp.name,
        role: rp.role as any,
        avatar: rp.avatar,
        isLocal: rp.id === myId,
        isMuted: rp.isMuted,
        isCamOff: rp.isCamOff,
        canScreenShare: rp.canScreenShare,
      })));
    });

    return unsubscribe;
  }, [roomId, isInLobby, user.uid]);

  // Sync Local Participant Metadata to Firebase
  useEffect(() => {
    if (!roomId) return;
    const myId = user.uid || 'local-user';
    const pData: ParticipantData = {
      id: myId,
      name: user.name || 'Anonymous',
      role: localRoleFallback,
      avatar: user.avatar || '',
      isMuted: !!isMuted,
      isCamOff: !!isCamOff,
      canScreenShare: !!canScreenShare,
      updatedAt: Date.now(),
    };

    console.log('[Meetings] Syncing participant:', roomId, pData);
    syncParticipant(roomId, pData).catch(err => console.error('[Meetings] Sync failed:', err));

    // Cleanup when leaving
    return () => {
      if (activeMeeting && roomId) {
        removeParticipant(roomId, myId);
      }
    };
  }, [roomId, isInLobby, user.name, user.role, user.avatar, isGuest, isMuted, isCamOff, canScreenShare, user.uid, activeMeeting]);

  // Subscribe to chat messages from Firebase
  useEffect(() => {
    if (!roomId) return;
    const myId = user.uid || 'local-user';

    console.log('[Meetings] Subscribing to chat:', roomId);
    const unsubscribe = subscribeToChatMessages(roomId, (messages) => {
      console.log('[Meetings] Chat messages received:', messages.length);
      // Global chat: everyone sees all messages in the room
      setChatMessages(messages.map(m => ({
        id: m.id,
        sender: m.senderName,
        senderId: m.senderId,
        text: m.text,
        time: m.time,
        isLocal: m.senderId === myId,
        isFromHost: m.isFromHost,
        recipientId: m.recipientId,
      })));
    });

    return unsubscribe;
  }, [roomId, isInLobby, user.uid]);

  // ─── Chat Handlers ──────────────────────────────────
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const myId = user.uid || 'local-user';
    const msgId = Date.now().toString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msg: ChatMessage = {
      id: msgId,
      sender: user.name || 'You',
      senderId: myId,
      text: chatInput,
      time: timeStr,
      isLocal: true,
      isFromHost: canControl,
      // recipientId is undefined for global chat
    };

    setChatMessages(prev => [...prev, msg]);

    // Sync to Firebase
    if (roomId) {
      console.log('[Meetings] Sending chat message:', msgId, 'to room:', roomId);
      sendChatMessage(roomId, {
        id: msgId,
        senderId: myId,
        senderName: user.name || 'Anonymous',
        text: chatInput,
        time: timeStr,
        isFromHost: canControl,
        // Global chat: no recipientId set
      }).catch(console.error);
    }

    setChatInput('');
  };

  const handleAddWhiteboardScene = () => {
    const newScene: Scene = {
      id: `whiteboard_${Date.now()}`,
      name: 'New Whiteboard',
      icon: Pen,
      type: 'whiteboard'
    };
    setScenes(prev => [...prev, newScene]);
    setActiveSceneId(newScene.id);
    addToast('Whiteboard scene added!', 'success');
  };

  const handleAddScene = () => {
    setIsAddGuestSceneModalOpen(true);
  };

  const handleCreateGuestScene = async () => {
    if (!guestSceneForm.name.trim()) {
      addToast('Guest name is required', 'error');
      return;
    }

    if (!guestSceneForm.photoUrl.trim()) {
      addToast('Photo URL is required', 'error');
      return;
    }

    setIsGeneratingGuestIntro(true);
    addToast('✨ Generating AI introduction for your guest...', 'info');

    try {
      const aiContent = await generateGuestIntroduction(guestSceneForm.photoUrl, guestSceneForm.name, guestSceneForm.topic);

      const newScene: Scene = {
        id: `scene_${Date.now()}`,
        name: guestSceneForm.name,
        icon: Users,
        type: 'guest',
        photoUrl: guestSceneForm.photoUrl,
        guestName: guestSceneForm.name,
        guestTopic: guestSceneForm.topic,
        guestIntroduction: aiContent.introduction,
        talkingPoints: aiContent.talkingPoints,
        suggestedGreeting: aiContent.suggestedGreeting,
      };

      setScenes(prev => [...prev, newScene]);
      setActiveSceneId(newScene.id);
      setGuestSceneForm({ name: '', photoUrl: '', topic: '' });
      setIsAddGuestSceneModalOpen(false);
      setIsGeneratingGuestIntro(false);
      addToast(`✨ Guest scene "${guestSceneForm.name}" created with AI introduction!`, 'success');
    } catch (error) {
      console.error('Failed to generate guest introduction:', error);
      setIsGeneratingGuestIntro(false);
      addToast('Failed to generate AI introduction. Creating with defaults.', 'error');

      // Create scene with default values as fallback
      const newScene: Scene = {
        id: `scene_${Date.now()}`,
        name: guestSceneForm.name,
        icon: Users,
        type: 'guest',
        photoUrl: guestSceneForm.photoUrl,
        guestName: guestSceneForm.name,
        guestTopic: guestSceneForm.topic,
        guestIntroduction: guestSceneForm.topic
          ? `Welcome our special guest, ${guestSceneForm.name}, here to discuss ${guestSceneForm.topic}!`
          : `Welcome our special guest, ${guestSceneForm.name}!`,
        talkingPoints: guestSceneForm.topic
          ? [`Discuss ${guestSceneForm.topic}`, 'Share your expertise', 'Engage with the audience']
          : ['Share your expertise', 'Engage with the audience'],
        suggestedGreeting: `Hello, I'm ${guestSceneForm.name}`,
      };

      setScenes(prev => [...prev, newScene]);
      setActiveSceneId(newScene.id);
      setGuestSceneForm({ name: '', photoUrl: '', topic: '' });
      setIsAddGuestSceneModalOpen(false);
    }
  };

  // Poll Handlers
  const handleCreatePoll = () => {
    if (!newPollQuestion.trim() || newPollOptions.filter(o => o.trim()).length < 2) {
      addToast('Poll needs a question and at least 2 options', 'error');
      return;
    }
    const poll: Poll = {
      id: Date.now().toString(),
      question: newPollQuestion,
      options: newPollOptions.filter(o => o.trim()).map((text, idx) => ({
        id: `opt_${idx}`,
        text,
        votes: [],
      })),
      createdBy: user.name,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isActive: true,
      allowMultiple: false,
    };
    setPolls(prev => [...prev, poll]);
    setNewPollQuestion('');
    setNewPollOptions(['', '']);
    setIsCreatingPoll(false);
    addSystemChat(`${user.name} created a poll: "${poll.question}"`);
    addToast('Poll created successfully', 'success');
  };

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id !== pollId) return poll;
      // Remove previous vote if exists (single choice)
      const updatedOptions = poll.options.map(opt => ({
        ...opt,
        votes: opt.id === optionId
          ? [...opt.votes.filter(v => v !== user.email), user.email]
          : opt.votes.filter(v => v !== user.email),
      }));
      return { ...poll, options: updatedOptions };
    }));
  };

  const handleClosePoll = (pollId: string) => {
    setPolls(prev => prev.map(poll =>
      poll.id === pollId ? { ...poll, isActive: false } : poll
    ));
    const poll = polls.find(p => p.id === pollId);
    if (poll) {
      addSystemChat(`Poll closed: "${poll.question}"`);
    }
  };

  const handleAddPollOption = () => {
    if (newPollOptions.length < 6) {
      setNewPollOptions(prev => [...prev, '']);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (newPollOptions.length > 2) {
      setNewPollOptions(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleDeleteScene = (id: string) => {
    if (scenes.length <= 1) return;
    setScenes(prev => prev.filter(s => s.id !== id));
    if (activeSceneId === id) setActiveSceneId(scenes.find(s => s.id !== id)!.id);
    if (liveSceneId === id) setLiveSceneId(scenes.find(s => s.id !== id)!.id);
  };

  const handleDuplicateScene = (scene: Scene) => {
    const dup: Scene = { ...scene, id: `scene_${Date.now()}`, name: `${scene.name} (Copy)` };
    setScenes(prev => [...prev, dup]);
  };

  const handleRenameScene = (id: string, name: string) => {
    if (!name.trim()) return;
    setScenes(prev => prev.map(s => s.id === id ? { ...s, name: name.trim() } : s));
    setRenamingSceneId(null);
  };

  const handleGoLive = (id: string) => {
    if (liveSceneId === id) return;
    setIsTransitioning(true);
    setSceneOverlayDismissed(null); // Reset dismissed state for new scene
    setTimeout(() => {
      setLiveSceneId(id);
      setIsTransitioning(false);
    }, 400);
  };

  const handleMoveScene = (id: string, direction: 'up' | 'down') => {
    setScenes(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };

  const handleUpdateAllTitles = () => {
    setChannels(prev => prev.map(c => c.connected ? { ...c, title: newGlobalTitle } : c));
    setIsUpdateTitlesModalOpen(false);
    setNewGlobalTitle('');
  };

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  };

  const updateChannelConfig = (id: string, updates: Partial<typeof channels[0]>) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeChannel = (id: string) => {
    setChannels(prev => prev.filter(c => c.id !== id));
  };

  const addCustomChannel = (name: string, platform: string, rtmpUrl: string, streamKey: string) => {
    const newChannel = {
      id: `custom_${Date.now()}`,
      name,
      platform,
      platformIcon: <Unplug className="size-2 text-white" />,
      color: 'bg-zinc-600',
      connected: false,
      title: studioTitle,
      rtmpUrl,
      streamKey,
    };
    setChannels(prev => [...prev, newChannel]);
  };

  const handleSchedule = (title: string, date: string, time: string) => {
    const newMeeting = {
      id: Date.now().toString(),
      title,
      date,
      time,
      attendees: 1,
      type: 'One-time'
    };
    setScheduledMeetings(prev => [...prev, newMeeting]);
    // Set countdown to the nearest upcoming scheduled meeting
    const dt = new Date(`${date}T${time}`);
    if (!isNaN(dt.getTime()) && dt.getTime() > Date.now()) {
      setScheduledTime(prev => !prev || dt.getTime() < prev.getTime() ? dt : prev);
    }
  };

  const handleJoinMeeting = (meetingId: string) => {
    // Determine the room code: if it's the default ID, preserve it fully.
    // Otherwise, accept the full ID without truncation to support longer custom codes.
    const roomCode = meetingId;
    setActiveMeeting({
      id: roomCode,
      title: 'Joined Show',
      date: 'Today',
      time: 'Just now',
      type: 'Joined',
      attendees: 1,
      link: `https://getshowapp.com/join/${roomCode}`
    });
  };

  const handleSelectSource = (sourceId: string) => {
    if (sourceId === 'screen') {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then(stream => { setCamStream(stream); if (userVideoRef.current) userVideoRef.current.srcObject = stream; })
        .catch(() => { });
    }
    addSystemChat(`Added source: ${sourceId}`);
  };

  const handleLeaveCall = () => {
    // Sync: Remove from participants list in Firebase
    const myId = user.uid || 'local-user';
    const targetRoomId = activeMeeting?.id || roomId;
    if (targetRoomId) {
      removeParticipant(targetRoomId, myId).catch(console.error);
    }

    // Guest leaves - only cleans up local state, doesn't delete room
    camStream?.getTracks().forEach(track => track.stop());
    screenStream?.getTracks().forEach(track => track.stop());
    setCamStream(null);
    setScreenStream(null);
    setIsBroadcasting(false);
    setIsRecording(false);
    setIsScreenSharing(false);
    setParticipants([]);
    setChatMessages([]);
    setPendingJoinRequests([]);
    setIsInLobby(true);
    setFaceEnhance({ smoothSkin: 0, brightness: 0, warmth: 0, eyeBrighten: 0, softFocus: 0 });
    setSelectedBackground(null);
    setActiveMeeting(null);
  };

  const handleEndCall = () => {
    // Notify host about recording recipients before ending
    if (recordingRecipients.length > 0) {
      const names = recordingRecipients.map(r => r.name).join(', ');
      addToast(`📹 Send recording to: ${names}`, 'info');
      // Log emails for reference
      recordingRecipients.forEach(r => {
        console.log(`[Recording Recipient] ${r.name}: ${r.email}`);
      });
    }
    // Host ends call - deletes room from Firebase for everyone
    if (isHost && activeMeeting?.id) {
      deleteRoom(activeMeeting.id).catch(console.error);
    }
    handleLeaveCall();
    setRecordingRecipients([]);
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      screenStream?.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      // Restore cam
      if (camStream && userVideoRef.current) userVideoRef.current.srcObject = camStream;
      addSystemChat('Screen share stopped');
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setScreenStream(stream);
        setIsScreenSharing(true);
        if (userVideoRef.current) userVideoRef.current.srcObject = stream;
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
          if (camStream && userVideoRef.current) userVideoRef.current.srcObject = camStream;
        };
        addSystemChat('Screen share started');
      } catch { /* user cancelled */ }
    }
  };

  const handleToggleRecord = () => {
    setIsRecording(prev => !prev);
    addSystemChat(isRecording ? 'Recording stopped' : 'Recording started');
  };

  const handleReaction = (emoji: string) => {
    setActiveReaction(emoji);
    setShowReactionPicker(false);
    const id = Date.now();
    const x = 20 + Math.random() * 60;
    setReactionOverlays(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setActiveReaction(null);
      setReactionOverlays(prev => prev.filter(r => r.id !== id));
    }, 3000);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTimerDisplay = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ─── Right Panel Content ────────────────────────────
  const renderToolPanel = () => {
    if (activeTool === 'participants') {
      return (
        <div className="flex-1 flex flex-col">
          {/* Join Requests - Host/Co-host only */}
          {canControl && pendingJoinRequests.length > 0 && (
            <div className="p-4 space-y-2 border-b border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Waiting to join ({pendingJoinRequests.length})</span>
              </div>
              {pendingJoinRequests.map(req => (
                <div key={req.id} className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-in slide-in-from-right-2">
                  <div className="size-9 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-300 font-bold text-xs">{req.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-zinc-200 truncate">{req.name}</span>
                      {req.wantsRecording && <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[8px] font-bold rounded-md uppercase">Wants Recording</span>}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">{req.email || 'No email'}</div>
                  </div>
                  <button onClick={() => handleAcceptJoin(req)} className="px-3 py-1.5 bg-emerald-600 rounded-lg text-[10px] font-bold text-white hover:bg-emerald-500 transition-colors">Accept</button>
                  <button onClick={() => handleDenyJoin(req.id)} className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors">Deny</button>
                </div>
              ))}
            </div>
          )}
          {/* Participants List */}
          <div className="p-4 space-y-2 flex-1 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">In this Show ({participants.length})</span>
              {canControl && <button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-1 text-[10px] font-bold text-[#5E5CE6] hover:text-indigo-400">
                <UserPlus className="size-3" /> Invite
              </button>}
            </div>
            {participants.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/8 transition-colors group">
                <div className={`size-9 rounded-full flex items-center justify-center font-bold text-xs ${p.isLocal ? 'bg-[#5E5CE6] text-white' : 'bg-zinc-700 text-zinc-300'}`}>
                  {p.avatar ? <img src={p.avatar} className="size-9 rounded-full object-cover" /> : p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-200 truncate">{p.name}{p.isLocal ? ' (You)' : ''}</span>
                    {p.role === 'Host' && <Crown className="size-3 text-amber-400" />}
                    {p.role === 'Co-host' && <Shield className="size-3 text-blue-400" />}
                    {p.canScreenShare && <ScreenShare className="size-3 text-emerald-400" title="Can share screen" />}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium">{p.role}</span>
                </div>
                <div className="flex items-center gap-1">
                  {p.isMuted && <MicOff className="size-3 text-rose-400" />}
                  {p.isCamOff && <VideoOff className="size-3 text-rose-400" />}
                </div>
                {!p.isLocal && isHost && (
                  <div className="hidden group-hover:flex items-center gap-1">
                    {p.role !== 'Co-host' && p.role !== 'Host' && (
                      <button
                        onClick={() => handleToggleScreenSharePermission(p.id)}
                        className={`p-1.5 rounded-lg transition-colors ${p.canScreenShare
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-white/10 text-zinc-400 hover:text-emerald-400'
                          }`}
                        title={p.canScreenShare ? 'Revoke screen share' : 'Allow screen share'}
                      >
                        <ScreenShare className="size-3" />
                      </button>
                    )}
                    {p.role !== 'Co-host' && <button onClick={() => handlePromoteParticipant(p.id)} className="p-1.5 rounded-lg bg-white/10 text-zinc-400 hover:text-blue-400 transition-colors" title="Promote to Co-host"><Crown className="size-3" /></button>}
                    <button onClick={() => handleRemoveParticipant(p.id)} className="p-1.5 rounded-lg bg-white/10 text-zinc-400 hover:text-rose-400 transition-colors" title="Remove"><X className="size-3" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTool === 'chat') {
      return (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {chatMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-zinc-500 text-sm font-medium text-center">No messages yet.<br />Start the conversation!</p>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.isLocal ? 'items-end' : 'items-start'}`}>
                  {msg.sender === 'System' ? (
                    <div className="w-full text-center py-1"><span className="text-[10px] text-zinc-500 font-medium bg-white/5 px-3 py-1 rounded-full">{msg.text}</span></div>
                  ) : (
                    <>
                      <span className="text-[10px] text-zinc-500 font-bold mb-1 px-1">
                        {msg.sender} · {msg.time}
                        {/* Show "Question" badge for participant→host private messages (only host sees this) */}
                        {canControl && !msg.isFromHost && msg.recipientId && (
                          <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">Question</span>
                        )}
                      </span>
                      <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm font-medium ${msg.isLocal ? 'bg-[#5E5CE6] text-white rounded-br-md' : 'bg-white/10 text-zinc-200 rounded-bl-md'}`}>
                        {msg.text}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendChat} className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={canControl ? "Type a message…" : "Ask the host a question…"} className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#5E5CE6]" />
              <button type="submit" className="p-2.5 bg-[#5E5CE6] rounded-xl text-white hover:bg-indigo-500"><SendHorizontal className="size-4" /></button>
            </div>
          </form>
        </div>
      );
    }

    if (activeTool === 'polls') {
      const userHasVoted = (poll: Poll) => poll.options.some(opt => opt.votes.includes(user.email));
      const getTotalVotes = (poll: Poll) => poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
      const getVotePercentage = (poll: Poll, option: PollOption) => {
        const total = getTotalVotes(poll);
        return total > 0 ? Math.round((option.votes.length / total) * 100) : 0;
      };

      return (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><BarChart3 className="size-5" /> Polls</h3>
              {canControl && (
                <button
                  onClick={() => setIsCreatingPoll(!isCreatingPoll)}
                  className="px-3 py-1.5 bg-[#5E5CE6] rounded-lg text-xs font-bold text-white hover:bg-indigo-500 transition-all flex items-center gap-1.5"
                >
                  <Plus className="size-3" /> New Poll
                </button>
              )}
            </div>

            {/* Create Poll Form */}
            {isCreatingPoll && canControl && (
              <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-xl animate-in slide-in-from-top-2">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-2">Question</label>
                  <input
                    type="text"
                    value={newPollQuestion}
                    onChange={e => setNewPollQuestion(e.target.value)}
                    placeholder="What's your question?"
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#5E5CE6]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-2">Options</label>
                  <div className="space-y-2">
                    {newPollOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={e => setNewPollOptions(prev => prev.map((o, i) => i === idx ? e.target.value : o))}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#5E5CE6]"
                        />
                        {newPollOptions.length > 2 && (
                          <button
                            onClick={() => handleRemovePollOption(idx)}
                            className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                          >
                            <X className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {newPollOptions.length < 6 && (
                    <button
                      onClick={handleAddPollOption}
                      className="mt-2 w-full py-2 text-xs font-bold text-zinc-400 hover:text-[#5E5CE6] border border-dashed border-white/10 rounded-lg hover:border-[#5E5CE6]/30 transition-all"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleCreatePoll}
                    className="flex-1 px-4 py-2 bg-[#5E5CE6] rounded-lg text-sm font-bold text-white hover:bg-indigo-500 transition-all"
                  >
                    Create Poll
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingPoll(false);
                      setNewPollQuestion('');
                      setNewPollOptions(['', '']);
                    }}
                    className="px-4 py-2 bg-white/10 rounded-lg text-sm font-bold text-zinc-400 hover:bg-white/15 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Polls List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
            {polls.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="size-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">No polls yet</p>
                {canControl && (
                  <p className="text-xs text-zinc-600 mt-1">Create a poll to engage participants</p>
                )}
              </div>
            ) : (
              polls.slice().reverse().map(poll => {
                const totalVotes = getTotalVotes(poll);
                const hasVoted = userHasVoted(poll);

                return (
                  <div key={poll.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-zinc-200">{poll.question}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-500">by {poll.createdBy}</span>
                            <span className="text-[10px] text-zinc-600">·</span>
                            <span className="text-[10px] text-zinc-500">{poll.createdAt}</span>
                            {!poll.isActive && (
                              <><span className="text-[10px] text-zinc-600">·</span>
                                <span className="text-[10px] text-amber-400 font-bold">Closed</span></>
                            )}
                          </div>
                        </div>
                        {canControl && poll.isActive && (
                          <button
                            onClick={() => handleClosePoll(poll.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                            title="Close poll"
                          >
                            <X className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {poll.options.map(option => {
                        const percentage = getVotePercentage(poll, option);
                        const userVoted = option.votes.includes(user.email);

                        return (
                          <button
                            key={option.id}
                            onClick={() => poll.isActive && handleVote(poll.id, option.id)}
                            disabled={!poll.isActive}
                            className={`w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden ${userVoted
                              ? 'bg-[#5E5CE6]/20 border-[#5E5CE6] text-white'
                              : hasVoted || !poll.isActive
                                ? 'bg-white/5 border-white/10 text-zinc-300'
                                : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-[#5E5CE6]/30'
                              } ${!poll.isActive ? 'cursor-default' : ''
                              }`}
                          >
                            <div
                              className="absolute inset-0 bg-[#5E5CE6]/10 transition-all"
                              style={{ width: `${hasVoted || !poll.isActive ? percentage : 0}%` }}
                            />
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {userVoted && <CheckCircle2 className="size-4 text-[#5E5CE6]" />}
                                <span className="text-sm font-medium">{option.text}</span>
                              </div>
                              {(hasVoted || !poll.isActive) && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-zinc-400">{option.votes.length}</span>
                                  <span className="text-sm font-bold">{percentage}%</span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
                      {poll.isActive && !hasVoted && (
                        <span className="text-[#5E5CE6]">Tap to vote</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    }

    if (activeTool === 'captions') {
      return (
        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <h3 className="font-bold text-lg flex items-center gap-2"><TypeIcon className="size-5" /> Captions</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><div className="text-sm font-bold text-zinc-200">Live Captions</div><div className="text-xs text-zinc-500">Auto-generated from your mic</div></div>
              <div onClick={() => setCaptionsEnabled(!captionsEnabled)} className={`w-10 h-[22px] rounded-full p-0.5 cursor-pointer transition-colors ${captionsEnabled ? 'bg-[#5E5CE6]' : 'bg-zinc-700'}`}><div className={`size-[18px] bg-white rounded-full shadow-sm transition-transform ${captionsEnabled ? 'translate-x-[18px]' : 'translate-x-0'}`} /></div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Font Size</label>
              <div className="grid grid-cols-3 gap-2">
                {(['sm', 'md', 'lg'] as const).map(s => (
                  <button key={s} onClick={() => setCaptionsFontSize(s)} className={`py-2 rounded-lg text-xs font-bold transition-all ${captionsFontSize === s ? 'bg-[#5E5CE6] text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>{s === 'sm' ? 'Small' : s === 'md' ? 'Medium' : 'Large'}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Position</label>
              <div className="grid grid-cols-2 gap-2">
                {(['bottom', 'top'] as const).map(p => (
                  <button key={p} onClick={() => setCaptionsPosition(p)} className={`py-2 rounded-lg text-xs font-bold transition-all capitalize ${captionsPosition === p ? 'bg-[#5E5CE6] text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>{p}</button>
                ))}
              </div>
            </div>
            {captionsEnabled && <div className="p-4 bg-white/5 border border-white/10 rounded-xl"><p className="text-sm text-zinc-300 italic">Listening for speech…</p></div>}
          </div>
        </div>
      );
    }

    if (activeTool === 'design') {
      return (
        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <h3 className="font-bold text-lg flex items-center gap-2"><Palette className="size-5" /> Design</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Layout</label>
              <div className="grid grid-cols-3 gap-2">
                {['Solo', 'Side-by-Side', 'Grid'].map(l => (
                  <button key={l} className="py-3 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-zinc-300 hover:bg-white/10 hover:border-[#5E5CE6]/30 transition-all">{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Overlay</label>
              <div className="grid grid-cols-2 gap-2">
                {['Lower Third', 'Full Banner', 'Ticker', 'None'].map(o => (
                  <button key={o} className="py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-zinc-300 hover:bg-white/10 hover:border-[#5E5CE6]/30 transition-all">{o}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Background</label>
              <div className="flex gap-2">
                {['#0F111A', '#1a1a2e', '#16213e', '#0f3460', '#533483', '#2b2d42'].map(c => (
                  <button key={c} className="size-8 rounded-lg border-2 border-white/10 hover:border-[#5E5CE6] transition-colors" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTool === 'music') {
      const tracks = [
        { name: 'Lo-Fi Chill', duration: '3:24', genre: 'Ambient' },
        { name: 'Upbeat Energy', duration: '2:58', genre: 'Pop' },
        { name: 'Corporate Soft', duration: '4:12', genre: 'Corporate' },
        { name: 'Tech Vibes', duration: '3:45', genre: 'Electronic' },
      ];
      return (
        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <h3 className="font-bold text-lg flex items-center gap-2"><Music className="size-5" /> Music</h3>
          </div>
          <div className="space-y-2">
            {tracks.map(t => (
              <button key={t.name} className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#5E5CE6]/30 hover:bg-white/8 transition-all group text-left">
                <div className="size-9 bg-white/10 rounded-lg flex items-center justify-center text-[#5E5CE6] group-hover:bg-[#5E5CE6] group-hover:text-white transition-colors"><Play className="size-4 ml-0.5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-zinc-200 truncate">{t.name}</div>
                  <div className="text-[10px] text-zinc-500">{t.genre} · {t.duration}</div>
                </div>
                <Volume2 className="size-4 text-zinc-600 group-hover:text-zinc-400" />
              </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-600 mt-4 text-center">Royalty-free background music</p>
        </div>
      );
    }

    if (activeTool === 'notes') {
      return (
        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <h3 className="font-bold text-lg flex items-center gap-2"><FileText className="size-5" /> Notes</h3>
          </div>
          <textarea
            value={notesContent}
            onChange={e => setNotesContent(e.target.value)}
            placeholder="Jot down talking points, links, or reminders for this session…"
            className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none resize-none focus:border-[#5E5CE6] transition-colors"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-zinc-600">{notesContent.length} characters</span>
            <button onClick={() => { navigator.clipboard.writeText(notesContent); }} className="text-[10px] font-bold text-[#5E5CE6] hover:text-indigo-400">Copy All</button>
          </div>
        </div>
      );
    }

    if (activeTool === 'reactions') {
      const REACTIONS = [
        { emoji: '👏', label: 'Clap' }, { emoji: '🔥', label: 'Fire' }, { emoji: '❤️', label: 'Love' },
        { emoji: '😂', label: 'Laugh' }, { emoji: '🎉', label: 'Party' }, { emoji: '👍', label: 'Like' },
        { emoji: '🚀', label: 'Rocket' }, { emoji: '💯', label: '100' }, { emoji: '⚡', label: 'Zap' },
        { emoji: '👀', label: 'Eyes' }, { emoji: '🤯', label: 'Mind Blown' }, { emoji: '💪', label: 'Strong' },
      ];
      return (
        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <h3 className="font-bold text-lg flex items-center gap-2"><Smile className="size-5" /> Reactions</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Send reactions visible to all viewers.</p>
          <div className="grid grid-cols-4 gap-2">
            {REACTIONS.map(r => (
              <button key={r.emoji} onClick={() => handleReaction(r.emoji)} className="flex flex-col items-center gap-1 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#5E5CE6]/30 hover:scale-105 transition-all">
                <span className="text-2xl">{r.emoji}</span>
                <span className="text-[9px] font-bold text-zinc-500">{r.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-300">Raise Hand</span>
              <div onClick={() => setHandRaised(!handRaised)} className={`w-10 h-[22px] rounded-full p-0.5 cursor-pointer transition-colors ${handRaised ? 'bg-amber-500' : 'bg-zinc-700'}`}><div className={`size-[18px] bg-white rounded-full shadow-sm transition-transform ${handRaised ? 'translate-x-[18px]' : 'translate-x-0'}`} /></div>
            </div>
            <p className="text-[10px] text-zinc-600">Let others know you want to speak.</p>
          </div>
        </div>
      );
    }

    if (activeTool === 'brand') {
      return (
        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <h3 className="font-bold text-lg flex items-center gap-2"><Zap className="size-5" /> Brand</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Logo Overlay</label>
              <button className="w-full py-8 bg-white/5 border-2 border-dashed border-white/10 rounded-xl text-center hover:border-[#5E5CE6]/30 hover:bg-[#5E5CE6]/5 transition-all">
                <ImageIcon className="size-6 text-zinc-500 mx-auto mb-2" />
                <span className="text-xs font-bold text-zinc-400">Upload Logo</span>
                <span className="text-[10px] text-zinc-600 block mt-1">PNG or SVG, max 2MB</span>
              </button>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Lower Third</label>
              <input type="text" placeholder="Your name or title" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-[#5E5CE6]" />
              <input type="text" placeholder="Subtitle (optional)" className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-[#5E5CE6]" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Brand Colors</label>
              <div className="flex gap-2">
                {['#5E5CE6', '#3b27b2', '#8227b2', '#b61cc9', '#ffffff', '#000000'].map(c => (
                  <button key={c} className="size-8 rounded-lg border-2 border-white/10 hover:border-[#5E5CE6] transition-colors" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Watermark Position</label>
              <div className="grid grid-cols-4 gap-2">
                {['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right'].map(p => (
                  <button key={p} className="py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:bg-white/10 transition-all">{p.split(' ').map(w => w[0]).join('')}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTool === 'layers') {
      const layerItems = [
        { name: 'Camera Feed', icon: VideoIcon, active: !isCamOff },
        { name: 'Screen Share', icon: Monitor, active: isScreenSharing },
        { name: 'Scene Overlay', icon: Layers, active: true },
        { name: 'Lower Third', icon: TypeIcon, active: false },
        { name: 'Logo Watermark', icon: ImageIcon, active: false },
        { name: 'Captions', icon: Captions, active: captionsEnabled },
        { name: 'Chat Overlay', icon: MessageSquare, active: false },
        { name: 'Timer', icon: Timer, active: showTimer },
      ];
      return (
        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <h3 className="font-bold text-lg flex items-center gap-2"><Layers className="size-5" /> Layers</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Manage what's visible in your output.</p>
          <div className="space-y-1.5">
            {layerItems.map((l, i) => (
              <div key={l.name} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 group hover:bg-white/8 transition-all">
                <span className="text-[10px] font-bold text-zinc-600 w-4">{i + 1}</span>
                <l.icon className="size-4 text-zinc-400" />
                <span className="flex-1 text-sm font-bold text-zinc-200">{l.name}</span>
                <div className={`size-2.5 rounded-full ${l.active ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTool === 'destinations') {
      const connectedCount = channels.filter(c => c.connected).length;
      return (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg flex items-center gap-2"><Radio className="size-5" /> Destinations</h3>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setIsUpdateTitlesModalOpen(true)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Update All Titles"><Pen className="size-3.5" /></button>
                <button onClick={() => setIsChannelConfigOpen(!isChannelConfigOpen)} className={`p-1.5 rounded-md transition-colors ${isChannelConfigOpen ? 'text-[#5E5CE6] bg-[#5E5CE6]/10' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`} title="Configure Channels"><Settings className="size-3.5" /></button>
              </div>
            </div>
            <p className="text-xs text-zinc-500">Stream your meeting to social media platforms via RTMP.</p>

            {/* Status Bar */}
            <div className="flex items-center gap-3 mt-3">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${isBroadcasting ? 'bg-rose-500/20 text-rose-400' : connectedCount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'}`}>
                <div className={`size-1.5 rounded-full ${isBroadcasting ? 'bg-rose-500 animate-pulse' : connectedCount > 0 ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                {isBroadcasting ? 'LIVE' : connectedCount > 0 ? 'READY' : 'OFFLINE'}
              </div>
              <span className="text-[10px] text-zinc-500 font-bold">{connectedCount} of {channels.length} active</span>
              {isBroadcasting && <span className="text-[10px] text-zinc-500 font-bold ml-auto">{formatBroadcastTime(broadcastTime)}</span>}
            </div>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
            {channels.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                <div className="size-16 bg-[#5E5CE6]/10 rounded-2xl flex items-center justify-center mb-4"><Tv className="size-7 text-[#5E5CE6]" /></div>
                <h4 className="font-bold text-sm text-zinc-200 mb-2">No Streaming Destinations</h4>
                <p className="text-xs text-zinc-500 mb-6 leading-relaxed max-w-[240px]">Add social media platforms like YouTube, Twitch, or X to stream your meeting live to your audience.</p>
                <button onClick={() => setIsAddChannelModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#5E5CE6] hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-colors shadow-lg shadow-indigo-500/20">
                  <Plus className="size-3.5" /> Add Destination
                </button>
              </div>
            ) : (
              <>
                {/* Quick-connect popular platforms if < 3 channels */}
                {channels.length < 3 && (
                  <div className="p-3 bg-[#5E5CE6]/5 border border-[#5E5CE6]/10 rounded-xl mb-2">
                    <div className="text-[10px] font-bold text-[#5E5CE6] uppercase tracking-widest mb-2">Quick Add</div>
                    <div className="flex items-center gap-2">
                      {[
                        { name: 'YouTube', icon: <Youtube className="size-3.5" />, color: 'bg-red-600', exists: channels.some(c => c.platform === 'YouTube') },
                        { name: 'Twitch', icon: <Gamepad2 className="size-3.5" />, color: 'bg-purple-600', exists: channels.some(c => c.platform === 'Twitch') },
                        { name: 'X / Twitter', icon: <Globe className="size-3.5" />, color: 'bg-zinc-800', exists: channels.some(c => c.platform === 'X / Twitter') },
                        { name: 'Facebook', icon: <Globe className="size-3.5" />, color: 'bg-blue-600', exists: channels.some(c => c.platform === 'Facebook') },
                      ].filter(p => !p.exists).slice(0, 3).map(p => (
                        <button key={p.name} onClick={() => setIsAddChannelModalOpen(true)} className={`flex items-center gap-1.5 px-2.5 py-1.5 ${p.color} rounded-lg text-[10px] font-bold text-white hover:opacity-80 transition-opacity`}>
                          {p.icon} {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {channels.map(ch => (
                  <div key={ch.id} className="group">
                    <div className={`p-3 rounded-xl flex items-center gap-3 transition-all ${ch.connected ? 'bg-white/5 border border-white/10' : 'bg-white/[0.02] border border-transparent hover:border-white/5'}`}>
                      <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${ch.color} ${!ch.connected && 'opacity-40'}`}>{ch.platformIcon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold truncate ${ch.connected ? 'text-zinc-200' : 'text-zinc-500'}`}>{ch.platform}</span>
                          {ch.connected && isBroadcasting && <span className="px-1.5 py-0.5 bg-rose-600 rounded text-[8px] font-black text-white">LIVE</span>}
                          {ch.connected && !isBroadcasting && <div className="size-1.5 bg-emerald-500 rounded-full" />}
                        </div>
                        <div className="text-[10px] text-zinc-600 truncate">{ch.title || ch.name}</div>
                        {!ch.streamKey && ch.rtmpUrl !== undefined && (
                          <div className="flex items-center gap-1 mt-0.5"><div className="size-1.5 bg-amber-500 rounded-full" /><span className="text-[9px] text-amber-500 font-bold">Missing stream key</span></div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setIsChannelConfigOpen(true); setEditingChannelId(editingChannelId === ch.id ? null : ch.id); }} className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"><Key className="size-3" /></button>
                        <div onClick={() => toggleChannel(ch.id)} className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${ch.connected ? 'bg-[#5E5CE6]' : 'bg-zinc-700'}`}>
                          <div className={`size-4 bg-white rounded-full shadow-sm transition-transform ${ch.connected ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    </div>

                    {/* Expanded RTMP Config */}
                    {editingChannelId === ch.id && isChannelConfigOpen && (
                      <div className="mt-1.5 p-3.5 bg-[#0D0F1A] rounded-xl border border-white/5 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        {ch.rtmpUrl !== undefined && (
                          <>
                            <div>
                              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">RTMP Server URL</label>
                              <input type="text" value={ch.rtmpUrl} onChange={e => updateChannelConfig(ch.id, { rtmpUrl: e.target.value })} placeholder="rtmp://..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-zinc-300 font-mono outline-none focus:border-[#5E5CE6] placeholder-zinc-600" />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Stream Key</label>
                              <div className="flex gap-1.5">
                                <input type="password" value={ch.streamKey || ''} onChange={e => updateChannelConfig(ch.id, { streamKey: e.target.value })} placeholder="Paste your stream key…" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-zinc-300 font-mono outline-none focus:border-[#5E5CE6] placeholder-zinc-600" />
                                <button className="px-2 bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"><Eye className="size-3" /></button>
                              </div>
                            </div>
                          </>
                        )}
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Stream Title</label>
                          <input type="text" value={ch.title} onChange={e => updateChannelConfig(ch.id, { title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-zinc-300 outline-none focus:border-[#5E5CE6]" />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <button onClick={() => removeChannel(ch.id)} className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors"><Trash2 className="size-3" /> Remove</button>
                          <button onClick={() => setEditingChannelId(null)} className="flex items-center gap-1 px-3 py-1.5 bg-[#5E5CE6] rounded-lg text-[10px] font-bold text-white hover:bg-indigo-500 transition-colors"><Check className="size-3" /> Done</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            {channels.length > 0 && (
              <button onClick={() => setIsAddChannelModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/10 rounded-xl text-xs font-bold text-zinc-500 hover:text-[#5E5CE6] hover:border-[#5E5CE6]/30 transition-all"><Plus className="size-3.5" /> Add Destination</button>
            )}
            <button
              onClick={() => {
                if (channels.length === 0) { setIsAddChannelModalOpen(true); return; }
                if (channels.filter(c => c.connected).length === 0) {
                  channels.length > 0 && toggleChannel(channels[0].id);
                }
                setIsBroadcasting(!isBroadcasting);
              }}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isBroadcasting ? 'bg-rose-600 text-white hover:bg-rose-500' :
                connectedCount > 0 ? 'bg-[#5E5CE6] text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' :
                  'bg-white/10 text-zinc-400 hover:bg-white/15'
                }`}
            >
              {isBroadcasting ? <><Radio className="size-4 animate-pulse" /> End Stream</> : <><Radio className="size-4" /> Go Live {connectedCount > 0 ? `to ${connectedCount} Platform${connectedCount > 1 ? 's' : ''}` : ''}</>}
            </button>
          </div>
        </div>
      );
    }

    if (activeTool === 'enhance') {
      return (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
          {/* Facial Enhancer */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 font-bold text-sm text-zinc-200"><Wand2 className="size-4 text-[#5E5CE6]" /> Facial Enhancer</h3>
              {Object.values(faceEnhance).some(v => v !== 0) && (
                <button onClick={() => setFaceEnhance({ smoothSkin: 0, brightness: 0, warmth: 0, eyeBrighten: 0, softFocus: 0 })} className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors">Reset All</button>
              )}
            </div>
            <div className="space-y-4">
              {[
                { key: 'smoothSkin' as const, label: 'Smooth Skin', icon: <Droplets className="size-3.5" />, desc: 'Soften skin texture' },
                { key: 'brightness' as const, label: 'Brightness', icon: <SunMedium className="size-3.5" />, desc: 'Adjust face lighting' },
                { key: 'warmth' as const, label: 'Warmth', icon: <Flame className="size-3.5" />, desc: 'Add warm color tone' },
                { key: 'eyeBrighten' as const, label: 'Eye Brighten', icon: <Eye className="size-3.5" />, desc: 'Enhance eye clarity' },
                { key: 'softFocus' as const, label: 'Soft Focus', icon: <Focus className="size-3.5" />, desc: 'Dreamy softness' },
              ].map(({ key, label, icon, desc }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2"><span className="text-zinc-500">{icon}</span><span className="text-xs font-bold text-zinc-300">{label}</span></div>
                    <span className="text-[10px] font-mono font-bold text-zinc-600 w-8 text-right">{faceEnhance[key]}</span>
                  </div>
                  <input type="range" min={key === 'brightness' ? -50 : 0} max={key === 'brightness' ? 50 : 100} value={faceEnhance[key]} onChange={e => setFaceEnhance(prev => ({ ...prev, [key]: parseInt(e.target.value) }))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#5E5CE6] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-[#5E5CE6] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-indigo-500/30" />
                  <p className="text-[10px] text-zinc-600 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Virtual Background */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 font-bold text-sm text-zinc-200"><ImageIcon className="size-4 text-[#5E5CE6]" /> Virtual Background</h3>
              {selectedBackground && <button onClick={() => setSelectedBackground(null)} className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors">Remove</button>}
            </div>
            <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar">
              {[
                { id: 'all' as const, label: 'All' },
                { id: 'office' as const, label: 'Office' },
                { id: 'nature' as const, label: 'Nature' },
                { id: 'abstract' as const, label: 'Abstract' },
                { id: 'gradient' as const, label: 'Gradient' },
                { id: 'blur' as const, label: 'Blur' },
              ].map(cat => (
                <button key={cat.id} onClick={() => setBgCategory(cat.id)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${bgCategory === cat.id ? 'bg-[#5E5CE6] text-white' : 'bg-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10'}`}>{cat.label}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setSelectedBackground(null)} className={`aspect-video rounded-xl border-2 flex items-center justify-center transition-all ${!selectedBackground ? 'border-[#5E5CE6] bg-[#5E5CE6]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                <div className="flex flex-col items-center gap-1"><X className="size-4 text-zinc-400" /><span className="text-[9px] font-bold text-zinc-500">None</span></div>
              </button>
              {filteredBgs.map(bg => (
                <button key={bg.id} onClick={() => setSelectedBackground(bg.id)} className={`aspect-video rounded-xl border-2 overflow-hidden transition-all relative group ${selectedBackground === bg.id ? 'border-[#5E5CE6] ring-2 ring-[#5E5CE6]/30' : 'border-white/10 hover:border-white/20'}`}>
                  {bg.url ? <img src={bg.url} className="w-full h-full object-cover" alt={bg.label} loading="lazy" /> : (bg as any).gradient ? <div className="w-full h-full" style={{ background: (bg as any).gradient }} /> : (bg as any).blurAmount ? <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center"><Focus className="size-4 text-zinc-500" /></div> : null}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-[8px] font-bold text-white">{bg.label}</span></div>
                  {selectedBackground === bg.id && <div className="absolute top-1.5 right-1.5 size-5 bg-[#5E5CE6] rounded-full flex items-center justify-center"><CheckCircle2 className="size-3 text-white" /></div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTool === 'analytics') {
      const viewerCount = participants.length;
      const channelsLive = channels.filter(c => c.connected).length;
      return (
        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <h3 className="font-bold text-lg flex items-center gap-2"><BarChart3 className="size-5" /> Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl font-black text-white">{viewerCount}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Viewers</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl font-black text-white">{channelsLive}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Channels</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl font-black text-white">{chatMessages.filter(m => m.sender !== 'System').length}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Messages</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl font-black text-white">{broadcastTime > 0 ? formatBroadcastTime(broadcastTime) : '00:00:00'}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Duration</div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Stream Health</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs text-zinc-300">Connection</span><span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><div className="size-1.5 bg-emerald-500 rounded-full" />Excellent</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-zinc-300">Bitrate</span><span className="text-xs font-bold text-zinc-400">4500 kbps</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-zinc-300">FPS</span><span className="text-xs font-bold text-zinc-400">{studioSettings.framerate}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-zinc-300">Resolution</span><span className="text-xs font-bold text-zinc-400">{studioSettings.resolution}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-zinc-300">Dropped Frames</span><span className="text-xs font-bold text-emerald-400">0</span></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback
    const tool = RIGHT_TOOLS.find(t => t.id === activeTool);
    return (
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">{tool && <tool.icon className="size-5" />} {tool?.label}</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-zinc-500 text-sm font-medium">Coming soon.</p>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // Green Room / Lobby
  // ═══════════════════════════════════════════════════


  const filteredBgs = bgCategory === 'all' ? VIRTUAL_BACKGROUNDS : VIRTUAL_BACKGROUNDS.filter(b => b.cat === bgCategory);
  const activeBg = VIRTUAL_BACKGROUNDS.find(b => b.id === selectedBackground);

  const getCameraFilterString = useCallback((): string => {
    const filters: string[] = [];
    if (faceEnhance.brightness !== 0) filters.push(`brightness(${1 + faceEnhance.brightness / 100})`);
    if (faceEnhance.warmth > 0) filters.push(`sepia(${faceEnhance.warmth / 100 * 0.3})`);
    if (faceEnhance.smoothSkin > 0) filters.push(`blur(${faceEnhance.smoothSkin / 100 * 0.8}px)`);
    if (faceEnhance.softFocus > 0) filters.push(`blur(${faceEnhance.softFocus / 100 * 1.2}px)`);
    if (faceEnhance.eyeBrighten > 0) filters.push(`contrast(${1 + faceEnhance.eyeBrighten / 100 * 0.15})`);
    return filters.length > 0 ? filters.join(' ') : 'none';
  }, [faceEnhance]);

  const getCameraFilterStyle = (): React.CSSProperties => {
    return { filter: getCameraFilterString() };
  };

  // Virtual background config for the segmentation engine
  const activeBgConfig = useMemo(() => {
    if (!selectedBackground || !activeBg) return null;
    return {
      url: activeBg.url || undefined,
      gradient: (activeBg as any).gradient || undefined,
      blurAmount: (activeBg as any).blurAmount || undefined,
    };
  }, [selectedBackground, activeBg]);

  // Lobby virtual background engine
  const lobbyVBg = useVirtualBackground({
    background: activeBgConfig,
    isCamOff,
    faceFilter: getCameraFilterString(),
    mirror: true,
  });

  // Studio virtual background engine
  const studioVBg = useVirtualBackground({
    background: activeBgConfig,
    isCamOff,
    faceFilter: getCameraFilterString(),
    mirror: true,
  });

  const handleJoinFromLobby = () => {
    setIsInLobby(false);
  };

  const handleLeaveLobby = () => {
    lobbyStream?.getTracks().forEach(t => t.stop());
    setLobbyStream(null);
    setIsInLobby(true);
    setIsCamOff(false);
    setIsMuted(false);
    setFaceEnhance({ smoothSkin: 0, brightness: 0, warmth: 0, eyeBrighten: 0, softFocus: 0 });
    setSelectedBackground(null);
    setActiveMeeting(null);
  };

  // Guest Waiting Screen
  // Guest waiting screen removed: guests join instantly

  // Guest Rejected Screen
  if (isGuest && !isCoHostByUserRole && wasRejected) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1015] via-[#1a1b2e] to-[#16161a]">
        <div className="max-w-md w-full mx-4 text-center space-y-6">
          <div className="size-20 mx-auto bg-rose-500/20 rounded-full flex items-center justify-center">
            <X className="size-10 text-rose-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-white">Request Denied</h1>
            <p className="text-zinc-400 text-sm">
              The host denied your request to join this Show. Please contact the host for more information.
            </p>
          </div>
          <button
            onClick={() => {
              setWasRejected(false);
              setActiveMeeting(null);
            }}
            className="px-6 py-3 bg-white/10 text-zinc-300 rounded-xl text-sm font-bold hover:bg-white/15 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (activeMeeting && isInLobby) {
    return (
      <div className="fixed top-0 bottom-0 right-0 left-[84px] bg-[#0A0B14] z-[50] flex flex-col animate-in fade-in duration-500">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={handleLeaveLobby} className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"><ArrowLeft className="size-5" /></button>
            <div>
              <h1 className="text-white font-black text-lg">{activeMeeting.title || 'Untitled Show'}</h1>
              <p className="text-zinc-500 text-xs font-medium">Get ready before going live</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-zinc-400">Green Room</span>
            </div>
          </div>
        </header>

        {/* Invite Link Banner - Visible to hosts/co-hosts even in lobby */}
        {canControl && <div className="flex-shrink-0 px-8 py-3 bg-[#5E5CE6]/10 border-b border-[#5E5CE6]/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 bg-[#5E5CE6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Link2 className="size-4 text-[#5E5CE6]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[#5E5CE6] uppercase tracking-widest">Invite Link</p>
              <p className="text-xs text-zinc-400 truncate">{meetingLink}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopyMeetingLink}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${linkCopied ? 'bg-emerald-500 text-white' : 'bg-[#5E5CE6] text-white hover:bg-indigo-500'
                }`}
            >
              {linkCopied ? <><CheckCircle2 className="size-3" /> Copied!</> : <><Copy className="size-3" /> Copy Link</>}
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-white/10 text-zinc-300 hover:bg-white/20 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="size-3" /> Invite
            </button>
          </div>
        </div>}

        {/* Pending Join Requests — visible in lobby for host */}
        {canControl && pendingJoinRequests.length > 0 && (
          <div className="flex-shrink-0 px-8 py-3 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="size-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Waiting to join ({pendingJoinRequests.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pendingJoinRequests.map(req => (
                <div key={req.id} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                  <div className="size-7 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-300 font-bold text-xs">{req.name.charAt(0)}</div>
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-200 font-bold">{req.name}</span>
                    {req.wantsRecording && <span className="text-[8px] font-bold text-rose-400">📹 Wants recording · {req.email}</span>}
                  </div>
                  <button onClick={() => handleAcceptJoin(req)} className="px-3 py-1.5 bg-emerald-600 rounded-lg text-[10px] font-bold text-white hover:bg-emerald-500 transition-colors">Accept</button>
                  <button onClick={() => handleDenyJoin(req.id)} className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors">Deny</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left – Camera Preview */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-2xl space-y-6">
              {/* Meeting Topic Banner */}
              <div className="flex items-center gap-4 p-4 bg-[#1C1E2A] rounded-2xl border border-white/10">
                <div className="size-12 bg-[#5E5CE6]/20 rounded-xl flex items-center justify-center"><Tv className="size-5 text-[#5E5CE6]" /></div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-base truncate">{activeMeeting.title}</h2>
                  <p className="text-zinc-500 text-xs font-medium">{activeMeeting.type} · {activeMeeting.date} · {activeMeeting.time}</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg">
                  <Users className="size-3.5 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-400">{activeMeeting.attendees || 1}</span>
                </div>
              </div>

              {/* Camera Preview */}
              <div className="relative aspect-video bg-[#1C1E2A] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                {/* Hidden video element for webcam input to canvas engine */}
                <video
                  ref={(el) => {
                    (lobbyVideoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                    (lobbyVBg.videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                  }}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                />
                {/* Canvas: composited output (person + virtual background) */}
                {selectedBackground && activeBg ? (
                  <canvas
                    ref={lobbyVBg.canvasRef}
                    className={`w-full h-full object-cover ${isCamOff ? 'opacity-0' : 'opacity-100'} transition-opacity relative z-10`}
                  />
                ) : (
                  /* No virtual background — show raw video feed with CSS filters */
                  <video
                    ref={(el) => {
                      if (el && lobbyStream) el.srcObject = lobbyStream;
                    }}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${isCamOff ? 'opacity-0' : 'opacity-100'} transition-opacity relative z-10`}
                    style={{
                      ...getCameraFilterStyle(),
                      transform: 'scaleX(-1)',
                    }}
                  />
                )}
                {/* Loading indicator for segmentation model */}
                {selectedBackground && !lobbyVBg.isModelLoaded && !isCamOff && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="size-8 text-[#5E5CE6] animate-spin" />
                      <span className="text-xs font-bold text-zinc-300">Loading virtual background…</span>
                    </div>
                  </div>
                )}
                {(isCamOff || camError) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#18181b] text-zinc-500 gap-4 z-10">
                    <div className="size-24 bg-zinc-800 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-black text-zinc-400">{(user.name?.charAt(0) || 'Y').toUpperCase()}</span>
                    </div>
                    {camError ? (
                      <>
                        <span className="text-sm font-bold text-rose-400 flex items-center gap-2"><VideoOff className="size-4" /> Camera unavailable</span>
                        <span className="text-xs text-rose-300 max-w-xs text-center">{camError}</span>
                        <button
                          onClick={() => {
                            setCamError(null);
                            navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
                              .then(stream => {
                                setLobbyStream(stream);
                                setCamError(null);
                                if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = stream;
                              })
                              .catch(err => setCamError(err?.message || 'Camera access failed'));
                          }}
                          className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Try Again
                        </button>
                        <p className="text-[10px] text-zinc-500 max-w-xs text-center mt-1">
                          Click the camera icon in your browser's address bar to allow access
                        </p>
                      </>
                    ) : (
                      <span className="text-sm font-bold">Camera is off</span>
                    )}
                  </div>
                )}
                {/* Name tag */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-sm font-bold text-white border border-white/10">{user.name || 'You'}</span>
                  {isMuted && <span className="px-2 py-1.5 bg-rose-600/80 backdrop-blur-md rounded-lg"><MicOff className="size-3.5 text-white" /></span>}
                </div>

              </div>

              {/* Controls Bar */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                    }`}
                >
                  {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  onClick={() => setIsCamOff(!isCamOff)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${isCamOff ? 'bg-rose-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                    }`}
                >
                  {isCamOff ? <VideoOff className="size-4" /> : <VideoIcon className="size-4" />}
                  {isCamOff ? 'Start Video' : 'Stop Video'}
                </button>
                <button
                  onClick={() => setLobbyEnhanceOpen(!lobbyEnhanceOpen)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${lobbyEnhanceOpen ? 'bg-[#5E5CE6]/20 text-[#5E5CE6] border border-[#5E5CE6]/30' : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                    }`}
                >
                  <Wand2 className="size-4" /> Enhance
                </button>
                <button
                  onClick={handleJoinFromLobby}
                  className="flex items-center gap-2 px-8 py-3 bg-[#5E5CE6] text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <Play className="size-4" /> Join Now
                </button>
              </div>
            </div>
          </div>

          {/* Right – Enhancement Panel */}
          <aside className={`${lobbyEnhanceOpen ? 'w-[320px]' : 'w-0'} bg-[#121420] border-l border-white/10 flex flex-col overflow-hidden transition-all duration-300 flex-shrink-0`}>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {/* Facial Enhancer */}
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 font-bold text-sm text-zinc-200"><Wand2 className="size-4 text-[#5E5CE6]" /> Facial Enhancer</h3>
                  {Object.values(faceEnhance).some(v => v !== 0) && (
                    <button
                      onClick={() => setFaceEnhance({ smoothSkin: 0, brightness: 0, warmth: 0, eyeBrighten: 0, softFocus: 0 })}
                      className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors"
                    >Reset All</button>
                  )}
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'smoothSkin' as const, label: 'Smooth Skin', icon: <Droplets className="size-3.5" />, desc: 'Soften skin texture' },
                    { key: 'brightness' as const, label: 'Brightness', icon: <SunMedium className="size-3.5" />, desc: 'Adjust face lighting' },
                    { key: 'warmth' as const, label: 'Warmth', icon: <Flame className="size-3.5" />, desc: 'Add warm color tone' },
                    { key: 'eyeBrighten' as const, label: 'Eye Brighten', icon: <Eye className="size-3.5" />, desc: 'Enhance eye clarity' },
                    { key: 'softFocus' as const, label: 'Soft Focus', icon: <Focus className="size-3.5" />, desc: 'Dreamy softness' },
                  ].map(({ key, label, icon, desc }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">{icon}</span>
                          <span className="text-xs font-bold text-zinc-300">{label}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-zinc-600 w-8 text-right">{faceEnhance[key]}</span>
                      </div>
                      <input
                        type="range"
                        min={key === 'brightness' ? -50 : 0}
                        max={key === 'brightness' ? 50 : 100}
                        value={faceEnhance[key]}
                        onChange={e => setFaceEnhance(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#5E5CE6] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-[#5E5CE6] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-indigo-500/30"
                      />
                      <p className="text-[10px] text-zinc-600 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Presets */}
                <div className="mt-5 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Presets</span>
                  <div className="flex gap-2 mt-2">
                    {[
                      { label: 'Natural', values: { smoothSkin: 20, brightness: 10, warmth: 15, eyeBrighten: 10, softFocus: 0 } },
                      { label: 'Studio', values: { smoothSkin: 35, brightness: 20, warmth: 5, eyeBrighten: 25, softFocus: 5 } },
                      { label: 'Warm Glow', values: { smoothSkin: 15, brightness: 15, warmth: 40, eyeBrighten: 15, softFocus: 10 } },
                      { label: 'Cinematic', values: { smoothSkin: 10, brightness: -10, warmth: 20, eyeBrighten: 5, softFocus: 15 } },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => setFaceEnhance(preset.values)}
                        className="flex-1 py-2 px-1 bg-white/5 hover:bg-[#5E5CE6]/10 border border-white/10 hover:border-[#5E5CE6]/30 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-[#5E5CE6] transition-all text-center"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Virtual Background */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 font-bold text-sm text-zinc-200"><ImageIcon className="size-4 text-[#5E5CE6]" /> Virtual Background</h3>
                  {selectedBackground && (
                    <button
                      onClick={() => setSelectedBackground(null)}
                      className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors"
                    >Remove</button>
                  )}
                </div>

                {/* Category Tabs */}
                <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all' as const, label: 'All' },
                    { id: 'office' as const, label: 'Office' },
                    { id: 'nature' as const, label: 'Nature' },
                    { id: 'abstract' as const, label: 'Abstract' },
                    { id: 'gradient' as const, label: 'Gradient' },
                    { id: 'blur' as const, label: 'Blur' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setBgCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${bgCategory === cat.id ? 'bg-[#5E5CE6] text-white' : 'bg-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* None option */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedBackground(null)}
                    className={`aspect-video rounded-xl border-2 flex items-center justify-center transition-all ${!selectedBackground ? 'border-[#5E5CE6] bg-[#5E5CE6]/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <X className="size-4 text-zinc-400" />
                      <span className="text-[9px] font-bold text-zinc-500">None</span>
                    </div>
                  </button>

                  {/* Background thumbnails */}
                  {filteredBgs.map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBackground(bg.id)}
                      className={`aspect-video rounded-xl border-2 overflow-hidden transition-all relative group ${selectedBackground === bg.id ? 'border-[#5E5CE6] ring-2 ring-[#5E5CE6]/30' : 'border-white/10 hover:border-white/20'
                        }`}
                    >
                      {bg.url ? (
                        <img src={bg.url} className="w-full h-full object-cover" alt={bg.label} loading="lazy" />
                      ) : (bg as any).gradient ? (
                        <div className="w-full h-full" style={{ background: (bg as any).gradient }} />
                      ) : (bg as any).blurAmount ? (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                          <Focus className="size-4 text-zinc-500" />
                        </div>
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-bold text-white">{bg.label}</span>
                      </div>
                      {selectedBackground === bg.id && (
                        <div className="absolute inset-0 bg-[#5E5CE6]/20 flex items-center justify-center">
                          <Check className="size-5 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // Dashboard View (No Active Meeting)
  // ═══════════════════════════════════════════════════
  if (!activeMeeting) {
    const studioFeatures = [
      { icon: Radio, label: 'Multi-Stream', desc: 'Broadcast to 12+ platforms simultaneously via RTMP', color: 'from-rose-500 to-orange-500', bg: 'bg-rose-50', text: 'text-rose-600' },
      { icon: Layers, label: 'Scene System', desc: 'Pre-built scenes with instant transitions & overlays', color: 'from-violet-500 to-indigo-500', bg: 'bg-violet-50', text: 'text-violet-600' },
      { icon: Clapperboard, label: 'Show Recording', desc: 'High-fidelity local recording up to 4K 60fps', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
      { icon: Wand2, label: 'AI Production', desc: 'Auto-captions, smart framing & scene suggestions', color: 'from-sky-500 to-cyan-500', bg: 'bg-sky-50', text: 'text-sky-600' },
      { icon: Users, label: 'Green Room', desc: 'Lobby with face enhancer & virtual backgrounds', color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50', text: 'text-amber-600' },
      { icon: BarChart3, label: 'Live Analytics', desc: 'Real-time viewer counts, engagement & health', color: 'from-fuchsia-500 to-pink-500', bg: 'bg-fuchsia-50', text: 'text-fuchsia-600' },
    ];

    const studioStats = [
      { label: 'Channels Ready', value: channels.filter(c => c.connected).length.toString(), icon: Radio, color: 'text-rose-500', bg: 'bg-rose-50' },
      { label: 'Total Scenes', value: scenes.length.toString(), icon: Layers, color: 'text-violet-500', bg: 'bg-violet-50' },
      { label: 'Scheduled', value: scheduledMeetings.length.toString(), icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
      { label: 'Resolution', value: studioSettings.resolution, icon: Monitor, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    ];

    return (
      <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 bg-white min-h-screen">
        {isScheduleModalOpen && <ScheduleModal onClose={() => setIsScheduleModalOpen(false)} onSchedule={handleSchedule} />}
        {isJoinModalOpen && <JoinMeetingModal onClose={() => setIsJoinModalOpen(false)} onJoin={handleJoinMeeting} />}
        {isCreateLinkModalOpen && <CreateLinkModal onClose={() => setIsCreateLinkModalOpen(false)} onStartMeeting={(meeting) => setActiveMeeting(meeting)} />}

        {/* ── Hero Banner ── */}
        <HeroBanner
          title={<>Welcome to<br />Live Hub.</>}
          description="Launch a live broadcast, record a high-fidelity show, or manage your streaming channels. Your central hub for content creation."
          imageUrl={coverImage || "https://images.unsplash.com/photo-1590602848950-4f36b2b9181a?auto=format&fit=crop&q=80&w=2070"}
          gradientFrom="from-slate-900"
          gradientTo="to-indigo-900"
          buttons={
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => onInstantRoom(DEFAULT_ROOM_ID)} className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95">
                {isInstantLoading ? <Loader2 className="size-4 animate-spin" /> : <VideoIcon className="size-4" />}
                {isInstantLoading ? 'Launching…' : 'Instant Meeting'}
              </button>
              <button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center gap-3 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm">
                <Calendar className="size-4" /> Schedule a Show
              </button>
              <button onClick={() => setIsJoinModalOpen(true)} className="flex items-center gap-3 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm">
                <LogIn className="size-4" /> Join a Show
              </button>
              <button onClick={() => setIsCreateLinkModalOpen(true)} className="flex items-center gap-3 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm">
                <Link2 className="size-4" /> Create a Link
              </button>
            </div>
          }
        />

        {/* ── Stats Strip ── */}
        <div className="flex items-center gap-3 flex-wrap">
          {studioStats.map(stat => (
            <div key={stat.label} className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className={`size-9 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
              <div>
                <div className="text-base font-black text-slate-900">{stat.value}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => onInstantRoom(DEFAULT_ROOM_ID)} className="p-7 bg-white rounded-[28px] border border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all group text-left">
            <div className="size-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
              <Play className="size-6 text-white ml-0.5" />
            </div>
            <h3 className="text-xl font-black text-indigo-600 mb-1">Instant Show</h3>
            <p className="text-indigo-400/80 text-sm font-medium">Start broadcasting with one click</p>
          </button>
          <button onClick={() => setIsScheduleModalOpen(true)} className="p-7 bg-white rounded-[28px] border border-violet-100 hover:shadow-xl hover:-translate-y-1 transition-all group text-left">
            <div className="size-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform">
              <Calendar className="size-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-violet-600 mb-1">Schedule</h3>
            <p className="text-violet-400/80 text-sm font-medium">Plan a show for later</p>
          </button>
          <button onClick={() => setIsJoinModalOpen(true)} className="p-7 bg-white rounded-[28px] border border-emerald-100 hover:shadow-xl hover:-translate-y-1 transition-all group text-left">
            <div className="size-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
              <LogIn className="size-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-emerald-600 mb-1">Join Show</h3>
            <p className="text-emerald-500/80 text-sm font-medium">Enter with a link or code</p>
          </button>
          <button onClick={() => setIsCreateLinkModalOpen(true)} className="p-7 bg-white rounded-[28px] border border-sky-100 hover:shadow-xl hover:-translate-y-1 transition-all group text-left">
            <div className="size-14 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-sky-200 group-hover:scale-110 transition-transform">
              <Link2 className="size-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-sky-600 mb-1">Create Link</h3>
            <p className="text-sky-500/80 text-sm font-medium">Generate a meeting link for later</p>
          </button>
        </div>

        {/* ── Studio Capabilities ── */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900">Studio Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studioFeatures.map(feat => (
              <div key={feat.label} className="group p-6 bg-white rounded-[24px] border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className={`size-12 bg-gradient-to-br ${feat.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feat.icon className="size-5 text-white" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">{feat.label}</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Streaming Channels Overview ── */}
        {channels.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900">Streaming Channels</h2>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500">{channels.filter(c => c.connected).length} / {channels.length} connected</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {channels.map(ch => (
                <div key={ch.id} className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all ${ch.connected ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                  <div className={`size-10 rounded-xl flex items-center justify-center ${ch.color}`}>{ch.platformIcon}</div>
                  <span className="text-xs font-bold text-slate-700 text-center truncate w-full">{ch.platform}</span>
                  <div className={`size-2 rounded-full ${ch.connected ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Upcoming Shows ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">Upcoming Shows</h2>
            <button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-widest hover:gap-3 transition-all">
              <Plus className="size-3" /> New
            </button>
          </div>

          {scheduledMeetings.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50/50">
              <div className="size-20 bg-white rounded-3xl flex items-center justify-center mb-5 border border-slate-100 shadow-sm">
                <Calendar className="size-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-400 mb-1.5">No upcoming shows</h3>
              <p className="text-sm text-slate-300 mb-8 max-w-sm">Schedule your first show to see it here. You can also start an instant show anytime.</p>
              <button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-200">
                <Plus className="size-3.5" /> Schedule a Show
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {scheduledMeetings.map(meeting => (
                <div key={meeting.id} className="group p-8 bg-slate-50 rounded-[32px] border border-slate-100 hover:shadow-lg hover:border-indigo-100 transition-all space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-14 bg-white rounded-2xl flex items-center justify-center text-violet-600 shadow-sm border border-slate-100">
                        <Calendar className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{meeting.title}</h3>
                        <p className="text-slate-400 font-medium text-sm">{meeting.date} · {meeting.time}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">{meeting.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-indigo-100 border-4 border-slate-50 flex items-center justify-center text-[10px] font-black text-indigo-600">
                        {user.avatar ? <img src={user.avatar} className="size-10 rounded-full object-cover" /> : (user.name?.charAt(0) || 'Y')}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{meeting.attendees} attendee{meeting.attendees !== 1 ? 's' : ''}</span>
                    </div>
                    <button onClick={() => setActiveMeeting({ id: meeting.id, title: meeting.title })} className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                      Join Now <ArrowUpRight className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Keyboard Shortcuts Bar ── */}
        <div className="bg-[#09090b] rounded-xl p-1.5 flex items-center justify-between flex-wrap gap-2 min-h-0">
          <div className="flex items-center gap-1.5">
            <div className="size-6 bg-gradient-to-br from-[#3b27b2] to-[#8227b2] rounded-lg flex items-center justify-center">
              <Zap className="size-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-[11px] leading-tight">Keyboard Shortcuts</h3>
              <p className="text-zinc-400 text-[10px] leading-tight">Speed up your streaming workflow</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[
              { keys: '⌘ + Shift + L', label: 'Go Live' },
              { keys: '⌘ + M', label: 'Mute Mic' },
              { keys: '⌘ + Shift + C', label: 'Camera' },
              { keys: '⌘ + Shift + S', label: 'Scene' },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[9px] font-mono text-zinc-300">{shortcut.keys}</kbd>
                <span className="text-[10px] text-zinc-400">{shortcut.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onInstantRoom()}
            className="px-2 py-1 bg-white text-black rounded font-bold text-[11px] hover:bg-zinc-100 transition-colors border border-zinc-200 shadow-sm"
            style={{ minWidth: 0, height: 24, lineHeight: '16px' }}
          >
            Enter Live Hub →
          </button>
        </div>

        {/* ── Stream Checklist ── */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Stream Checklist</h2>
              <p className="text-sm text-slate-400 mt-1">Prepare your broadcast workflow</p>
            </div>
            <span className="text-sm font-bold italic text-slate-400">
              {streamChecklist.filter(t => t.completed).length}/{streamChecklist.length} Complete
            </span>
          </div>
          <div className="space-y-4">
            {streamChecklist.map((item, idx) => (
              <div
                key={idx}
                draggable={clEditingItem !== idx}
                onDragStart={() => clHandleDragStart(idx)}
                onDragOver={clHandleDragOver}
                onDrop={() => clHandleDrop(idx)}
                onDragEnd={clHandleDragEnd}
                className={`group flex items-center gap-4 px-6 py-5 bg-white rounded-2xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all ${clEditingItem !== idx ? 'cursor-move' : ''
                  } ${clDraggedItem === idx ? 'opacity-50 scale-95' : ''}`}
              >
                <button
                  onClick={() => toggleClItem(idx)}
                  className={`flex-shrink-0 size-6 rounded-full border-2 flex items-center justify-center transition-all ${item.completed
                    ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600'
                    : 'border-slate-300 group-hover:border-indigo-300 hover:border-indigo-500'
                    }`}
                >
                  {item.completed && <CheckCircle2 className="size-4 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  {clEditingItem === idx ? (
                    <input
                      type="text"
                      value={clEditText}
                      onChange={(e) => setClEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') clSaveEdit(idx);
                        if (e.key === 'Escape') clCancelEdit();
                      }}
                      className="w-full px-3 py-1.5 border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
                      autoFocus
                    />
                  ) : (
                    <p
                      className={`text-[15px] font-medium ${item.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}
                      onDoubleClick={() => clStartEditing(idx)}
                    >
                      {item.task}
                    </p>
                  )}
                </div>
                {clEditingItem === idx ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => clSaveEdit(idx)}
                      className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      <CheckCircle2 className="size-4" />
                    </button>
                    <button
                      onClick={clCancelEdit}
                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => clStartEditing(idx)}
                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                    >
                      <Pen className="size-4" />
                    </button>
                    <button
                      onClick={() => clDeleteItem(idx)}
                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-rose-100 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.priority === 'high'
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : item.priority === 'medium'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}>
                  {item.priority}
                </div>
              </div>
            ))}
            {/* Add New Task */}
            <div className="flex items-center gap-4 px-6 py-5 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 hover:border-slate-300 transition-colors">
              <Plus className="size-5 text-slate-400" />
              <input
                type="text"
                value={clNewTaskText}
                onChange={(e) => setClNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') clAddNewTask();
                }}
                placeholder="Add a new task..."
                className="flex-1 bg-transparent border-none focus:outline-none text-slate-600 placeholder:text-slate-400 text-[15px]"
              />
              {clNewTaskText && (
                <button
                  onClick={clAddNewTask}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // Active Studio View
  // ═══════════════════════════════════════════════════
  return (
    <div className="fixed top-0 bottom-0 right-0 left-[84px] z-[50] flex flex-col bg-[#0F111A] text-white animate-in fade-in duration-500 font-sans">
      {/* Modals */}
      {isShareModalOpen && <SimpleShareModal onClose={() => setIsShareModalOpen(false)} activeMeeting={activeMeeting} />}
      {isInviteModalOpen && <InviteParticipantModal onClose={() => setIsInviteModalOpen(false)} activeMeeting={activeMeeting} hostName={user.name} onAddParticipant={handleAddParticipantFromInvite} meetingLink={meetingLink} />}
      {isUpdateTitlesModalOpen && <UpdateTitlesModal onClose={() => setIsUpdateTitlesModalOpen(false)} onUpdate={handleUpdateAllTitles} newGlobalTitle={newGlobalTitle} setNewGlobalTitle={setNewGlobalTitle} />}
      {isScheduleModalOpen && <ScheduleModal onClose={() => setIsScheduleModalOpen(false)} onSchedule={handleSchedule} />}
      {isSettingsModalOpen && <StudioSettingsModal onClose={() => setIsSettingsModalOpen(false)} settings={studioSettings} onUpdate={setStudioSettings} activeBackgroundId={selectedBackground} onSelectBackground={setSelectedBackground} />}
      {isAddSourceModalOpen && <AddSourceModal onClose={() => setIsAddSourceModalOpen(false)} onSelectSource={handleSelectSource} />}
      {isAddChannelModalOpen && <AddChannelModal onClose={() => setIsAddChannelModalOpen(false)} onAdd={addCustomChannel} existingPlatforms={channels.map(c => c.platform)} />}

      {/* Add Guest Scene Modal */}
      {isAddGuestSceneModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => setIsAddGuestSceneModalOpen(false)}>
          <div className="bg-[#1C1E2A] text-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsAddGuestSceneModalOpen(false)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all z-10"><X className="size-5" /></button>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-pink-600 rounded-xl flex items-center justify-center"><Users className="size-5" /></div>
                <div><h2 className="font-bold text-lg">Add Guest Scene</h2><p className="text-zinc-500 text-xs font-medium">Create a scene to introduce an invited guest</p></div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2 block">Guest Name</label>
                <input
                  type="text"
                  value={guestSceneForm.name}
                  onChange={(e) => setGuestSceneForm({ ...guestSceneForm, name: e.target.value })}
                  placeholder="e.g. John Smith"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2 block">Guest Topic (Optional)</label>
                <input
                  type="text"
                  value={guestSceneForm.topic}
                  onChange={(e) => setGuestSceneForm({ ...guestSceneForm, topic: e.target.value })}
                  placeholder="e.g. AI in Healthcare, Product Design Tips"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 outline-none transition-all"
                />
                <p className="text-[10px] text-zinc-500 mt-1.5">What will your guest be discussing? This helps generate better AI introductions.</p>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2 block">Guest Photo</label>
                {/* Photo upload/URL toggle */}
                <div className="space-y-3">
                  {/* File Upload Option */}
                  <div
                    onClick={() => guestPhotoInputRef.current?.click()}
                    className="relative border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-pink-500/50 hover:bg-white/[0.02] transition-all cursor-pointer group"
                  >
                    <input
                      ref={guestPhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Validate file size (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          addToast('Image must be under 5MB', 'error');
                          return;
                        }

                        setIsUploadingGuestPhoto(true);

                        // Convert to base64 for preview (in production, upload to cloud storage)
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          setGuestSceneForm({ ...guestSceneForm, photoUrl: base64 });
                          setIsUploadingGuestPhoto(false);
                          addToast('Photo uploaded successfully!', 'success');
                        };
                        reader.onerror = () => {
                          setIsUploadingGuestPhoto(false);
                          addToast('Failed to upload photo', 'error');
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <div className="flex flex-col items-center gap-2 text-center">
                      {isUploadingGuestPhoto ? (
                        <>
                          <div className="size-10 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                          <span className="text-xs font-medium text-zinc-400">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <div className="size-10 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                            <Camera className="size-5 text-pink-400" />
                          </div>
                          <span className="text-xs font-medium text-zinc-400">Click to upload photo</span>
                          <span className="text-[10px] text-zinc-600">PNG, JPG up to 5MB</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Or divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">or paste URL</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* URL Input */}
                  <input
                    type="url"
                    value={guestSceneForm.photoUrl.startsWith('data:') ? '' : guestSceneForm.photoUrl}
                    onChange={(e) => setGuestSceneForm({ ...guestSceneForm, photoUrl: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 outline-none transition-all"
                  />
                </div>
              </div>
              {guestSceneForm.photoUrl && (
                <div className="relative border border-white/10 rounded-xl overflow-hidden aspect-video">
                  <img src={guestSceneForm.photoUrl} alt="Guest preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setGuestSceneForm({ ...guestSceneForm, photoUrl: '' })}
                    className="absolute top-2 right-2 size-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500/80 transition-all"
                  >
                    <X className="size-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-emerald-400">✓ Photo ready</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsAddGuestSceneModalOpen(false)}
                  disabled={isGeneratingGuestIntro}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-zinc-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGuestScene}
                  disabled={isGeneratingGuestIntro}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-lg text-sm font-bold text-white hover:from-pink-500 hover:to-fuchsia-500 shadow-lg shadow-pink-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGeneratingGuestIntro ? (
                    <>
                      <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Create Scene'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Request Notification Banner – host only */}
      {canControl && pendingJoinRequests.length > 0 && activeTool !== 'participants' && (
        <div className="absolute top-20 right-6 z-50 animate-in slide-in-from-right-4">
          <div className="bg-amber-500/10 backdrop-blur-lg border border-amber-500/30 rounded-2xl p-4 w-80 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-amber-300">{pendingJoinRequests.length} waiting to join</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-300 font-bold text-xs">{pendingJoinRequests[0].name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-zinc-200 font-bold truncate block">{pendingJoinRequests[0].name}</span>
                {pendingJoinRequests[0].wantsRecording && <span className="text-[8px] font-bold text-rose-400">📹 Wants recording</span>}
              </div>
              <button onClick={() => handleAcceptJoin(pendingJoinRequests[0])} className="px-3 py-1.5 bg-emerald-600 rounded-lg text-[10px] font-bold text-white">Accept</button>
              <button onClick={() => handleDenyJoin(pendingJoinRequests[0].id)} className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold text-zinc-400">Deny</button>
            </div>
            {pendingJoinRequests.length > 1 && (
              <button onClick={() => setActiveTool('participants')} className="w-full mt-2 text-center text-[10px] font-bold text-amber-400 hover:text-amber-300">View all requests</button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`h-14 flex-shrink-0 bg-[#1C1E2A]/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-3 z-20 transition-all duration-300 ${focusMode ? 'opacity-0 pointer-events-none -translate-y-full absolute w-full' : ''}`}>
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <button onClick={isHost ? handleEndCall : handleLeaveCall} className="p-1.5 text-zinc-400 hover:text-white flex-shrink-0"><ChevronLeftIcon className="size-4" /></button>
          <div className="flex items-center gap-1.5 group min-w-0">
            {canControl ? (
              <>
                <input ref={titleInputRef} type="text" value={studioTitle} onChange={(e) => setStudioTitle(e.target.value)} className="bg-transparent text-white font-bold text-sm outline-none w-[120px] min-w-0" />
                <button onClick={() => titleInputRef.current?.focus()} className="flex-shrink-0"><Pen className="size-3 text-zinc-500 group-hover:text-white transition-colors" /></button>
              </>
            ) : (
              <span className="text-white font-bold text-sm truncate max-w-[120px] min-w-0">{studioTitle}</span>
            )}
          </div>
          {/* Participant avatars */}
          <div className="hidden lg:flex items-center -space-x-1.5 ml-2">
            {participants.slice(0, 3).map(p => (
              <div key={p.id} className={`size-6 rounded-full border-2 border-[#1C1E2A] flex items-center justify-center text-[8px] font-bold ${p.isLocal ? 'bg-[#5E5CE6] text-white' : 'bg-zinc-700 text-zinc-300'}`}>
                {p.avatar ? <img src={p.avatar} className="size-6 rounded-full object-cover" /> : p.name.charAt(0)}
              </div>
            ))}
            {participants.length > 3 && <div className="size-6 rounded-full border-2 border-[#1C1E2A] bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400">+{participants.length - 3}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canControl && (
            scheduledTime && countdown ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <Calendar className="size-3 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-300">{countdown}</span>
                </div>
                <button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-1 px-2 py-1.5 bg-[#5E5CE6] rounded-lg text-white font-bold text-[10px] hover:bg-indigo-500 transition-colors"><UserPlus className="size-3" /> Invite</button>
              </div>
            ) : (
              <button onClick={() => setIsScheduleModalOpen(true)} className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 bg-white/5 rounded-lg text-zinc-300 font-bold text-[10px] hover:bg-white/10 transition-colors"><Calendar className="size-3" /> Schedule</button>
            )
          )}
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-600/20 border border-rose-500/30 rounded-lg">
              <Circle className="size-2 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="text-[10px] font-bold text-rose-400">REC {formatBroadcastTime(recordTime)}</span>
            </div>
          )}
          {showTimer && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg">
              <Timer className={`size-2.5 ${timerRunning ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span className={`text-[10px] font-bold font-mono ${timerSeconds <= 30 && timerRunning ? 'text-rose-400' : 'text-zinc-300'}`}>{formatTimerDisplay(timerSeconds)}</span>
              <button onClick={() => setTimerRunning(!timerRunning)} className="p-0.5 text-zinc-400 hover:text-white">{timerRunning ? <Pause className="size-2.5" /> : <Play className="size-2.5" />}</button>
              <button onClick={() => { setTimerRunning(false); setTimerSeconds(300); }} className="p-0.5 text-zinc-400 hover:text-white"><RotateCcw className="size-2.5" /></button>
            </div>
          )}
          {isHost && <button onClick={() => {
            if (channels.length === 0) { setActiveTool('destinations'); return; }
            if (!isBroadcasting && channels.filter(c => c.connected).length === 0) { setActiveTool('destinations'); return; }
            setIsBroadcasting(!isBroadcasting);
          }} className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-lg flex items-center gap-1.5 whitespace-nowrap ${isBroadcasting ? 'bg-rose-600 text-white shadow-rose-500/20' : 'bg-[#5E5CE6] text-white shadow-indigo-500/20'}`}>
            {isBroadcasting ? <><Radio className="size-3.5 animate-pulse" /> End</> : <><Radio className="size-3.5" /> Go Live {channels.filter(c => c.connected).length > 0 ? `(${channels.filter(c => c.connected).length})` : ''}</>}
          </button>}
        </div>
      </header>

      {/* Invite Link Bar - Only visible to hosts and co-hosts */}
      {canControl && !focusMode && <div className="flex-shrink-0 px-4 py-2 bg-[#5E5CE6]/10 border-b border-[#5E5CE6]/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link2 className="size-3.5 text-[#5E5CE6] flex-shrink-0" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex-shrink-0">Meeting Link:</span>
          <span className="text-xs text-zinc-300 font-medium truncate">{meetingLink}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleCopyMeetingLink}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 ${linkCopied ? 'bg-emerald-500 text-white' : 'bg-[#5E5CE6] text-white hover:bg-indigo-500'
              }`}
          >
            {linkCopied ? <><CheckCircle2 className="size-3" /> Copied!</> : <><Copy className="size-3" /> Copy</>}
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 text-zinc-300 hover:bg-white/20 transition-all flex items-center gap-1.5"
          >
            <UserPlus className="size-3" /> Invite Guest
          </button>
        </div>
      </div>}

      {/* Main Layout */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Retractable Tools Sidebar (Now on Left) */}
        <div className={`relative flex items-center transition-all duration-300 ${focusMode ? 'w-0 overflow-hidden opacity-0 pointer-events-none' : ''}`}>
          {/* Collapse/Expand Tab (Host Only) */}
          {canControl && !toolsSidebarOpen && (
            <button
              onClick={() => setToolsSidebarOpen(true)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#5E5CE6] text-white rounded-r-lg px-2 py-4 shadow-xl hover:bg-indigo-500 transition-colors z-10 flex flex-col items-center gap-1"
              aria-label="Show tools"
            >
              <ChevronRight className="size-4" />
              <span className="text-[8px] font-bold [writing-mode:vertical-lr]">Tools</span>
            </button>
          )}

          {/* Tools Strip */}
          <div className={`bg-[#121420] border-r border-white/5 py-2 flex-shrink-0 transition-all duration-300 overflow-hidden ${toolsSidebarOpen ? 'w-12' : 'w-0'}`}>
            <div className="flex flex-col items-center gap-1 px-1 overflow-y-auto no-scrollbar h-full">
              {/* Collapse button */}
              {toolsSidebarOpen && (
                <button
                  onClick={() => setToolsSidebarOpen(false)}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg w-full transition-all text-zinc-500 hover:bg-white/10 hover:text-zinc-300 mb-1"
                  aria-label="Hide tools"
                >
                  <ChevronLeftIcon className="size-4" />
                  <span className="text-[7px] font-bold">Hide</span>
                </button>
              )}

              {/* Guests can only access: chat, polls, and reactions */}
              {(canControl ? RIGHT_TOOLS : RIGHT_TOOLS.filter(t => ['participants', 'chat', 'polls', 'reactions'].includes(t.id))).map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                  className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg w-full transition-all relative ${activeTool === tool.id ? 'bg-[#5E5CE6] text-white' : 'text-zinc-400 hover:bg-white/10'}`}
                >
                  <tool.icon className="size-4" />
                  <span className="text-[7px] font-bold leading-tight">{tool.label}</span>
                  {tool.id === 'participants' && pendingJoinRequests.length > 0 && (
                    <div className="absolute -top-1 -right-1 size-4 bg-amber-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white animate-pulse">{pendingJoinRequests.length}</div>
                  )}
                  {tool.id === 'chat' && chatMessages.length > 0 && activeTool !== 'chat' && (
                    <div className="absolute -top-1 -right-1 size-2 bg-[#5E5CE6] rounded-full" />
                  )}
                  {tool.id === 'polls' && polls.filter(p => p.isActive).length > 0 && activeTool !== 'polls' && (
                    <div className="absolute -top-1 -right-1 size-4 bg-emerald-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white">{polls.filter(p => p.isActive).length}</div>
                  )}
                  {tool.id === 'destinations' && isBroadcasting && activeTool !== 'destinations' && (
                    <div className="absolute -top-1 -right-1 size-4 bg-rose-500 rounded-full text-[7px] font-black flex items-center justify-center text-white animate-pulse">⬤</div>
                  )}
                  {tool.id === 'destinations' && !isBroadcasting && channels.filter(c => c.connected).length > 0 && activeTool !== 'destinations' && (
                    <div className="absolute -top-1 -right-1 size-4 bg-emerald-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white">{channels.filter(c => c.connected).length}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Tool Panels (Now on Left) */}
        <aside className={`${activeTool && !focusMode && (canControl || toolsSidebarOpen) ? 'w-[280px]' : 'w-0'} bg-[#121420] border-r border-white/10 flex transition-all duration-300 flex-shrink-0`}>
          <div className={`flex-1 flex flex-col overflow-hidden ${activeTool && (canControl || toolsSidebarOpen) ? 'w-[280px]' : 'w-0'}`}>
            {activeTool ? renderToolPanel() : (
              <div className="p-4 space-y-3 overflow-y-auto no-scrollbar">
                {/* Streaming Quick Status Card – host only */}
                {canControl && <div className="bg-[#1C1E2A] rounded-xl border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className={`size-4 ${isBroadcasting ? 'text-rose-400 animate-pulse' : 'text-zinc-500'}`} />
                      <span className="text-xs font-bold text-zinc-200">Streaming</span>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-black ${isBroadcasting ? 'bg-rose-500/20 text-rose-400' : channels.filter(c => c.connected).length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                      {isBroadcasting ? 'LIVE' : channels.filter(c => c.connected).length > 0 ? `${channels.filter(c => c.connected).length} READY` : 'OFFLINE'}
                    </div>
                  </div>

                  {channels.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {channels.map(ch => (
                        <div key={ch.id} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ${ch.connected ? 'bg-white/5 border border-white/10 text-zinc-300' : 'bg-white/[0.02] text-zinc-600'}`}>
                          <span className="opacity-70">{ch.platformIcon}</span> {ch.platform}
                          {ch.connected && isBroadcasting && <div className="size-1.5 bg-rose-500 rounded-full animate-pulse" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-500">No streaming destinations configured yet.</p>
                  )}

                  <button
                    onClick={() => setActiveTool('destinations')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#5E5CE6]/10 hover:bg-[#5E5CE6]/20 border border-[#5E5CE6]/20 rounded-xl text-xs font-bold text-[#5E5CE6] transition-all"
                  >
                    <Radio className="size-3.5" /> {channels.length > 0 ? 'Manage Destinations' : 'Add Streaming Destinations'}
                  </button>
                </div>}

                {/* Quick Actions */}
                <div className="bg-[#1C1E2A] rounded-xl border border-white/10 p-4 space-y-2.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Quick Actions</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setActiveTool('participants')} className="flex items-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-zinc-300 transition-colors"><Users className="size-3.5 text-zinc-500" /> Participants</button>
                    <button onClick={() => setActiveTool('chat')} className="flex items-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-zinc-300 transition-colors"><MessageSquare className="size-3.5 text-zinc-500" /> Chat</button>
                    {canControl && <button onClick={() => setActiveTool('design')} className="flex items-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-zinc-300 transition-colors"><Palette className="size-3.5 text-zinc-500" /> Design</button>}
                    {canControl && <button onClick={() => setActiveTool('analytics')} className="flex items-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-zinc-300 transition-colors"><BarChart3 className="size-3.5 text-zinc-500" /> Stats</button>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Left-Middle – Scenes (Host Only) */}
        {canControl && !focusMode && (
          <aside className={`${leftPanelOpen ? 'w-48' : 'w-0'} bg-[#121420] border-r border-white/10 flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0 relative`}>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Scenes ({scenes.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleAddScene} title="Add Guest Scene" className="py-2.5 bg-white/5 border border-dashed border-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-[#5E5CE6] hover:border-[#5E5CE6]/30 hover:bg-[#5E5CE6]/5 transition-all flex items-center justify-center gap-1.5"><UserPlus className="size-3.5" /> Guest</button>
                <button onClick={handleAddWhiteboardScene} title="Add Whiteboard Scene" className="py-2.5 bg-white/5 border border-dashed border-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-1.5"><Plus className="size-3.5" /> Board</button>
              </div>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar p-4">
              {scenes.map((scene, idx) => (
                <div key={scene.id} className={`rounded-xl border-2 cursor-pointer transition-all group relative ${activeSceneId === scene.id ? 'border-[#5E5CE6] bg-[#5E5CE6]/10' : 'border-transparent hover:border-white/10 hover:bg-white/[0.02]'
                  }`}>
                  {/* Scene Header */}
                  <div className="flex items-center gap-2 p-2.5 pb-1" onClick={() => { setActiveSceneId(scene.id); handleGoLive(scene.id); }}>
                    <scene.icon className={`size-3.5 ${activeSceneId === scene.id ? 'text-[#5E5CE6]' : 'text-zinc-500'}`} />
                    {renamingSceneId === scene.id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameScene(scene.id, renameValue)}
                        onKeyDown={e => { if (e.key === 'Enter') handleRenameScene(scene.id, renameValue); if (e.key === 'Escape') setRenamingSceneId(null); }}
                        className="flex-1 bg-transparent text-sm font-bold text-zinc-200 outline-none border-b border-[#5E5CE6]"
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span className="flex-1 text-sm font-bold text-zinc-200 truncate">{scene.name}</span>
                    )}
                    {liveSceneId === scene.id && isBroadcasting && (
                      <span className="px-1.5 py-0.5 bg-rose-600 rounded text-[8px] font-black text-white flex items-center gap-1"><Radio className="size-2 animate-pulse" />LIVE</span>
                    )}
                    {liveSceneId === scene.id && !isBroadcasting && (
                      <span className="px-1.5 py-0.5 bg-emerald-600/20 rounded text-[8px] font-black text-emerald-400">PROGRAM</span>
                    )}
                  </div>

                  {/* Scene Thumbnail — mini preview matching the full overlay */}
                  <div
                    className="mx-2.5 mb-2 aspect-video rounded-lg flex flex-col items-center justify-center relative overflow-hidden"
                    onClick={() => { setActiveSceneId(scene.id); handleGoLive(scene.id); }}
                    style={{ background: SCENE_THEMES[scene.type].bg }}
                  >
                    <div className={`size-5 rounded-full ${SCENE_THEMES[scene.type].glow}/20 flex items-center justify-center mb-0.5`}>
                      <scene.icon className={`size-2.5 ${SCENE_THEMES[scene.type].accent}`} />
                    </div>
                    <span className="text-[6px] font-bold text-zinc-400 tracking-wide text-center px-2 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{SCENE_CONTENT[scene.type].heading}</span>
                  </div>

                  {/* Scene Actions – visible on hover or when active */}
                  <div className={`absolute top-2 right-2 flex items-center gap-1 z-10 ${activeSceneId === scene.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    {scenes.length > 1 && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteScene(scene.id); }}
                        className="p-1.5 bg-black/40 backdrop-blur-md text-white/70 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
                        title="Delete Scene"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Other Actions (Move, Duplicate, Rename) */}
                  <div className={`flex items-center justify-between px-2.5 pb-2 ${activeSceneId === scene.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <div className="flex items-center gap-0.5">
                      <button onClick={e => { e.stopPropagation(); handleMoveScene(scene.id, 'up'); }} disabled={idx === 0} className="p-1 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed" title="Move Up"><ChevronLeftIcon className="size-3 rotate-90" /></button>
                      <button onClick={e => { e.stopPropagation(); handleMoveScene(scene.id, 'down'); }} disabled={idx === scenes.length - 1} className="p-1 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed" title="Move Down"><ChevronLeftIcon className="size-3 -rotate-90" /></button>
                      <button onClick={e => { e.stopPropagation(); setRenamingSceneId(scene.id); setRenameValue(scene.name); }} className="p-1 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-colors" title="Rename"><Pen className="size-3" /></button>
                      <button onClick={e => { e.stopPropagation(); handleDuplicateScene(scene); }} className="p-1 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-colors" title="Duplicate"><Copy className="size-3" /></button>
                    </div>
                    {liveSceneId !== scene.id && (
                      <button onClick={e => { e.stopPropagation(); handleGoLive(scene.id); }} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-[9px] font-bold text-white transition-colors">Go Live</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Left panel toggle */}
        {!focusMode && (
          <button
            onClick={() => canControl ? setLeftPanelOpen(!leftPanelOpen) : setToolsSidebarOpen(!toolsSidebarOpen)}
            className="flex-shrink-0 w-5 flex items-center justify-center bg-[#121420]/50 hover:bg-white/5 border-r border-white/5 text-zinc-500 hover:text-white transition-all cursor-pointer"
            title={canControl ? (leftPanelOpen ? 'Collapse scenes' : 'Expand scenes') : (toolsSidebarOpen ? 'Collapse tools' : 'Expand tools')}
          >
            <ChevronLeftIcon className={`size-3 transition-transform ${(canControl ? leftPanelOpen : toolsSidebarOpen) ? '' : 'rotate-180'}`} />
          </button>
        )}

        {/* Center – Viewport */}
        <main className="flex-1 flex flex-col p-4 items-center justify-center relative min-w-0">
          <div className="w-full h-full max-w-full aspect-video bg-black rounded-lg relative overflow-hidden border border-white/10 shadow-2xl">
            {/* Hidden video input for studio virtual background engine */}
            <video
              ref={(el) => {
                (userVideoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                (studioVBg.videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
              }}
              autoPlay
              muted
              playsInline
              className={selectedBackground && activeBg ? 'absolute w-0 h-0 opacity-0 pointer-events-none' : `w-full h-full object-cover transition-opacity ${!isCamOff ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* Canvas output when virtual background is active */}
            {selectedBackground && activeBg && (
              <canvas
                ref={studioVBg.canvasRef}
                className={`w-full h-full object-cover transition-opacity ${!isCamOff ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
            {isCamOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#18181b] text-zinc-500 gap-3">
                <VideoOff className="size-12" /><span className="text-xs font-bold uppercase tracking-widest">Camera Off</span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-md text-xs font-bold border border-white/10">{studioSettings.resolution}</span>
              <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-md text-xs font-bold border border-white/10">{studioSettings.framerate}</span>
              {isBroadcasting && <div className="flex items-center gap-2 px-3 py-1 bg-rose-600 rounded-md text-xs font-bold border border-rose-400/50"><Radio className="size-3 animate-pulse" /> LIVE {formatBroadcastTime(broadcastTime)}</div>}
              {isBroadcasting && channels.filter(c => c.connected).length > 0 && (
                <div className="flex items-center gap-1">
                  {channels.filter(c => c.connected).map(ch => (
                    <div key={ch.id} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border border-white/10 ${ch.color} bg-opacity-80 backdrop-blur-md text-white`}>
                      <span className="opacity-80">{ch.platformIcon}</span>
                      <span className="hidden md:inline">{ch.platform}</span>
                    </div>
                  ))}
                </div>
              )}
              {isRecording && <div className="flex items-center gap-2 px-3 py-1 bg-rose-900/60 rounded-md text-xs font-bold border border-rose-500/30"><Circle className="size-2 text-rose-500 fill-rose-500 animate-pulse" /> REC</div>}
              {isScreenSharing && <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/60 rounded-md text-xs font-bold border border-emerald-500/30"><ScreenShare className="size-3 text-emerald-400" /> Sharing</div>}
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-md text-xs font-bold border border-white/10 flex items-center gap-1.5"><Users className="size-3" /> {participants.length}</span>
              {handRaised && <span className="px-3 py-1 bg-amber-500/20 backdrop-blur-md rounded-md text-xs font-bold border border-amber-500/30">✋ Hand Raised</span>}
            </div>

            {/* Reaction overlays floating up */}
            {reactionOverlays.map(r => (
              <div key={r.id} className="absolute bottom-20 z-30 text-4xl animate-bounce pointer-events-none" style={{ left: `${r.x}%`, animation: 'floatUp 3s ease-out forwards' }}>{r.emoji}</div>
            ))}

            {/* Timer overlay on viewport */}
            {showTimer && timerRunning && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                <div className={`px-4 py-2 backdrop-blur-md rounded-lg font-mono text-lg font-black border ${timerSeconds <= 30 ? 'bg-rose-900/60 border-rose-500/30 text-rose-300' : 'bg-black/50 border-white/10 text-white'}`}>{formatTimerDisplay(timerSeconds)}</div>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
              <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-md text-sm font-bold border border-white/10">{user.name}</span>
              <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold border border-white/10 text-zinc-400">{scenes.find(s => s.id === liveSceneId)?.name || 'No scene'}</span>
            </div>

            {/* ── Scene Overlay System ── */}
            {(() => {
              const liveScene = scenes.find(s => s.id === liveSceneId);
              if (!liveScene || isTransitioning || sceneOverlayDismissed === liveSceneId) return null;
              const theme = SCENE_THEMES[liveScene.type];
              const content = SCENE_CONTENT[liveScene.type];
              const heading = liveScene.type === 'break' ? breakMessage : content.heading;
              const sub = liveScene.type === 'break' ? (breakSubtitle || content.sub) : content.sub;

              return (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center" style={{ background: theme.bg }}>
                  {liveScene.type === 'whiteboard' && (
                    <div className="absolute inset-0 z-20">
                      <Whiteboard />
                    </div>
                  )}
                  {/* Dismiss button – top right */}
                  <button
                    onClick={() => setSceneOverlayDismissed(liveSceneId)}
                    className="absolute top-6 right-6 p-2.5 bg-black/40 backdrop-blur-sm rounded-xl border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all z-[60]"
                    title="Dismiss overlay"
                  >
                    <X className="size-5" />
                  </button>

                  {/* Show branding – top left */}
                  <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/5">
                    <div className={`size-9 ${theme.glow} rounded-lg flex items-center justify-center text-white font-black text-sm`}>{(user.name?.charAt(0) || 'S').toUpperCase()}</div>
                    <div>
                      <div className={`${theme.accent} font-black text-xs uppercase tracking-widest`}>{user.name || 'Show'}</div>
                      <div className="text-zinc-400 text-[10px] font-bold">{studioTitle}</div>
                    </div>
                  </div>

                  {/* Scene icon or guest photo */}
                  {liveScene.type === 'guest' ? (
                    liveScene.photoUrl ? (
                      <div className="size-40 rounded-full overflow-hidden shadow-2xl border-4 border-white/20 mb-8 flex-shrink-0">
                        <img src={liveScene.photoUrl} alt={liveScene.guestName} className="size-full object-cover" />
                      </div>
                    ) : (
                      <div className="size-24 rounded-full bg-zinc-800/60 flex items-center justify-center mb-8 shadow-2xl">
                        <liveScene.icon className={`size-10 ${theme.accent}`} />
                      </div>
                    )
                  ) : liveScene.type !== 'whiteboard' ? (
                    <div className="size-24 rounded-full bg-zinc-800/60 flex items-center justify-center mb-8 shadow-2xl">
                      <liveScene.icon className={`size-10 ${theme.accent}`} />
                    </div>
                  ) : null}

                  {/* Heading */}
                  {liveScene.type === 'guest' ? (
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight text-center px-8" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{liveScene.guestName}</h1>
                  ) : liveScene.type !== 'whiteboard' ? (
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight text-center px-8" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{heading}</h1>
                  ) : null}

                  {/* Subtitle */}
                  {sub && liveScene.type !== 'whiteboard' && <p className="text-xs md:text-sm text-zinc-500 font-bold uppercase tracking-[0.35em] text-center">{sub}</p>}

                  {/* Host info for Introduction scene */}
                  {liveScene.type === 'introduction' && (
                    <div className="mt-8 flex items-center gap-4 bg-black/30 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/5">
                      <div className={`size-14 ${theme.glow} rounded-full flex items-center justify-center text-white font-black text-xl`}>
                        {user.avatar ? <img src={user.avatar} className="size-14 rounded-full object-cover" /> : (user.name?.charAt(0) || 'H')}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{user.name || 'Host'}</div>
                        <div className="text-xs text-zinc-500 font-medium">Host · {studioTitle}</div>
                      </div>
                    </div>
                  )}

                  {/* Q&A prompt */}
                  {liveScene.type === 'qa' && (
                    <div className="mt-8 flex items-center gap-3 bg-black/30 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/5">
                      <MessageSquare className={`size-5 ${theme.accent}`} />
                      <span className="text-sm text-zinc-400 font-medium">Drop your questions in the chat</span>
                    </div>
                  )}

                  {/* Tech scene code motif */}
                  {liveScene.type === 'tech' && (
                    <div className="mt-8 bg-black/40 backdrop-blur-sm rounded-xl border border-white/5 px-6 py-4 font-mono text-xs">
                      <span className="text-cyan-500">const</span> <span className="text-zinc-300">deepDive</span> <span className="text-zinc-500">=</span> <span className="text-emerald-400">true</span><span className="text-zinc-500">;</span>
                    </div>
                  )}

                  {/* Demo scene badge */}
                  {liveScene.type === 'demo' && (
                    <div className="mt-8 flex items-center gap-3 bg-black/30 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/5">
                      <Monitor className={`size-5 ${theme.accent}`} />
                      <span className="text-sm text-zinc-400 font-medium">Live product walkthrough</span>
                    </div>
                  )}

                  {/* Outro social / farewell */}
                  {liveScene.type === 'outro' && (
                    <div className="mt-8 flex items-center gap-3 bg-black/30 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/5">
                      <Hand className={`size-5 ${theme.accent}`} />
                      <span className="text-sm text-zinc-400 font-medium">Like, subscribe & share</span>
                    </div>
                  )}

                  {/* Live indicator */}
                  {isBroadcasting && (
                    <div className="absolute bottom-8 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/5">
                      <div className="size-2 bg-rose-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-zinc-400">LIVE · {formatBroadcastTime(broadcastTime)}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Scene transition overlay */}
            {isTransitioning && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-zinc-400"><Loader2 className="size-5 animate-spin" /><span className="text-sm font-bold">Transitioning…</span></div>
              </div>
            )}

            {/* Captions overlay */}
            {captionsEnabled && (
              <div className={`absolute inset-x-0 ${captionsPosition === 'bottom' ? 'bottom-16' : 'top-16'} flex justify-center z-10 pointer-events-none`}>
                <div className={`px-5 py-2 bg-black/70 backdrop-blur-sm rounded-lg max-w-[80%] ${captionsFontSize === 'sm' ? 'text-xs' : captionsFontSize === 'md' ? 'text-sm' : 'text-base'}`}>
                  <span className="text-white font-medium italic">Captions will appear here…</span>
                </div>
              </div>
            )}

            {/* Participant picture-in-picture thumbnails */}
            {showPiP && participants.filter(p => !p.isLocal).length > 0 && (
              <div className="absolute bottom-16 right-4 flex flex-col gap-2">
                {participants.filter(p => !p.isLocal).slice(0, 3).map(p => (
                  <div key={p.id} className="w-28 h-20 bg-zinc-800 rounded-lg border border-white/10 overflow-hidden flex items-center justify-center relative shadow-lg">
                    {p.isCamOff ? (
                      <div className="flex flex-col items-center gap-1"><div className="size-8 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold text-zinc-400">{p.name.charAt(0)}</div></div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center"><div className="size-8 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold text-zinc-400">{p.name.charAt(0)}</div></div>
                    )}
                    <div className="absolute bottom-1 left-1.5 flex items-center gap-1">
                      <span className="text-[9px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">{p.name.split(' ')[0]}</span>
                      {p.isMuted && <MicOff className="size-2.5 text-rose-400" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating Control Bar */}
          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1.5 bg-[#1C1E2A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-500 ease-out ${focusMode ? 'opacity-0 pointer-events-none translate-y-full' : ''} ${isControlsCollapsed ? 'w-12 h-12 overflow-hidden' : 'max-w-[calc(100%-2rem)]'}`}>
            {isControlsCollapsed ? (
              <button
                onClick={() => setIsControlsCollapsed(false)}
                className="size-9 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Expand Controls"
              >
                <ChevronUp className="size-5" />
              </button>
            ) : (
              <>
                {/* Core Audio/Video */}
                <button onClick={() => setIsMuted(!isMuted)} className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${isMuted ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`} title={isMuted ? 'Unmute' : 'Mute'}>{isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}</button>
                {/* Camera toggle + VB dropdown */}
                <div className="relative flex items-center flex-shrink-0">
                  <button onClick={() => setIsCamOff(!isCamOff)} className={`p-2.5 rounded-l-xl transition-all ${isCamOff ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`} title={isCamOff ? 'Turn On Camera' : 'Turn Off Camera'}>{isCamOff ? <VideoOff className="size-4" /> : <VideoIcon className="size-4" />}</button>
                  <button onClick={() => setShowQuickVB(prev => !prev)} className={`p-2.5 rounded-r-xl border-l border-white/10 transition-all flex-shrink-0 ${showQuickVB ? 'bg-[#5E5CE6] text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`} title="Virtual Background">
                    <ChevronDown className="size-3" />
                  </button>
                  {/* Quick VB Popover */}
                  {showQuickVB && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-72 bg-[#1C1E2A] border border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-2 z-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-2"><ImageIcon className="size-3.5 text-[#5E5CE6]" /> Virtual Background</h4>
                        <button onClick={() => setShowQuickVB(false)} className="text-zinc-500 hover:text-white"><X className="size-3.5" /></button>
                      </div>
                      {/* Camera Status */}
                      <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-xl">
                        <div className={`size-2 rounded-full ${isCamOff ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-bold text-zinc-400">{isCamOff ? 'Camera Off' : 'Camera On'}</span>
                        <button onClick={() => setIsCamOff(!isCamOff)} className={`ml-auto px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${isCamOff ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'}`}>
                          {isCamOff ? 'Turn On' : 'Turn Off'}
                        </button>
                      </div>
                      {/* Quick BG Grid */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <button onClick={() => { setSelectedBackground(null); setShowQuickVB(false); }} className={`aspect-video rounded-lg border-2 flex items-center justify-center transition-all ${!selectedBackground ? 'border-[#5E5CE6] bg-[#5E5CE6]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                          <span className="text-[8px] font-bold text-zinc-400">None</span>
                        </button>
                        {filteredBgs.slice(0, 7).map(bg => (
                          <button key={bg.id} onClick={() => { setSelectedBackground(bg.id); setShowQuickVB(false); }} className={`aspect-video rounded-lg border-2 overflow-hidden transition-all ${selectedBackground === bg.id ? 'border-[#5E5CE6] ring-1 ring-[#5E5CE6]/30' : 'border-white/10 hover:border-white/20'}`}>
                            {bg.url ? <img src={bg.url} className="w-full h-full object-cover" alt={bg.label} loading="lazy" /> : (bg as any).gradient ? <div className="w-full h-full" style={{ background: (bg as any).gradient }} /> : <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center"><Focus className="size-3 text-zinc-500" /></div>}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => { setShowQuickVB(false); setActiveTool('enhance'); }} className="w-full mt-3 text-center text-[10px] font-bold text-[#5E5CE6] hover:text-white transition-colors">
                        All Backgrounds & Face Enhance →
                      </button>
                    </div>
                  )}
                </div>
                {/* Screen Share – host/co-host or guests with permission */}
                {canScreenShare && <button onClick={handleScreenShare} className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${isScreenSharing ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`} title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>{isScreenSharing ? <ScreenShareOff className="size-4" /> : <ScreenShare className="size-4" />}</button>}

                <div className="w-px h-5 bg-white/10 mx-0.5 flex-shrink-0" />

                {/* Record – host only */}
                {canControl && <button onClick={handleToggleRecord} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[11px] transition-all flex-shrink-0 ${isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/10'}`} title={isRecording ? 'Stop Recording' : 'Record'}>{isRecording ? <><StopCircle className="size-3.5" /> Stop</> : <><Circle className="size-3.5 text-rose-400" /> Record</>}</button>}

                {/* Reactions */}
                <div className="relative flex-shrink-0">
                  <button onClick={() => setShowReactionPicker(!showReactionPicker)} className={`p-2.5 rounded-xl transition-all ${activeReaction ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`} title="Reactions">
                    {activeReaction ? <span className="text-sm">{activeReaction}</span> : <Smile className="size-4" />}
                  </button>
                  {showReactionPicker && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#1C1E2A] border border-white/10 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-bottom-2 z-50">
                      <div className="grid grid-cols-6 gap-1">
                        {['👏', '🔥', '❤️', '😂', '🎉', '👍', '🚀', '💯', '⚡', '👀', '🤯', '💪'].map(e => (
                          <button key={e} onClick={() => handleReaction(e)} className="p-2 text-xl hover:bg-white/10 rounded-lg transition-colors hover:scale-125">{e}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hand Raise */}
                <button onClick={() => setHandRaised(!handRaised)} className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${handRaised ? 'bg-amber-500 text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`} title={handRaised ? 'Lower Hand' : 'Raise Hand'}><Hand className="size-4" /></button>

                <div className="w-px h-5 bg-white/10 mx-0.5 flex-shrink-0" />

                {/* Share & Invite – host only */}
                {canControl && <>
                  <button onClick={() => setIsShareModalOpen(true)} className="p-2.5 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0" title="Share"><Share2 className="size-4" /></button>
                  <button onClick={() => setIsInviteModalOpen(true)} className="p-2.5 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-all relative flex-shrink-0" title="Invite">
                    <UserPlus className="size-4" />
                    {pendingJoinRequests.length > 0 && <div className="absolute -top-0.5 -right-0.5 size-4 bg-amber-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white">{pendingJoinRequests.length}</div>}
                  </button>
                </>}

                <div className="w-px h-5 bg-white/10 mx-0.5 flex-shrink-0" />

                {/* Add Source – host only */}
                {canControl && <button onClick={() => setIsAddSourceModalOpen(true)} className="p-2.5 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0" title="Add Source"><Plus className="size-4" /></button>}

                {/* Stream to Social – host only */}
                {canControl && <button
                  onClick={() => { setActiveTool(activeTool === 'destinations' ? null : 'destinations'); }}
                  className={`p-2.5 rounded-xl transition-all relative flex-shrink-0 ${isBroadcasting ? 'bg-rose-500/20 text-rose-400' :
                    channels.filter(c => c.connected).length > 0 ? 'bg-[#5E5CE6]/20 text-[#5E5CE6]' :
                      'text-zinc-400 hover:bg-white/10 hover:text-white'
                    }`}
                  title="Stream to Social Media"
                >
                  <Radio className="size-4" />
                  {channels.filter(c => c.connected).length > 0 && (
                    <div className={`absolute -top-0.5 -right-0.5 size-4 ${isBroadcasting ? 'bg-rose-500' : 'bg-[#5E5CE6]'} rounded-full text-[8px] font-bold flex items-center justify-center text-white`}>{channels.filter(c => c.connected).length}</div>
                  )}
                </button>}

                {/* Timer – host only */}
                {canControl && <button onClick={() => setShowTimer(!showTimer)} className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${showTimer ? 'bg-[#5E5CE6]/20 text-[#5E5CE6]' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`} title="Timer"><Timer className="size-4" /></button>}

                {/* PiP Toggle */}
                <button onClick={() => setShowPiP(!showPiP)} className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${showPiP ? 'text-zinc-400 hover:bg-white/10 hover:text-white' : 'bg-white/10 text-white'}`} title="Toggle PiP"><PictureInPicture2 className="size-4" /></button>

                {/* Fullscreen */}
                <button onClick={handleFullscreen} className="p-2.5 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0" title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>{isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</button>

                {/* Settings – host only */}
                {isHost && <button onClick={() => setIsSettingsModalOpen(true)} className="p-2.5 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0" title="Settings"><Settings className="size-4" /></button>}

                <div className="w-px h-5 bg-white/10 mx-0.5 flex-shrink-0" />

                {/* End Call / Leave */}
                <button
                  onClick={isHost ? handleEndCall : handleLeaveCall}
                  className="p-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all flex-shrink-0"
                  title={isHost ? "End Call" : "Leave"}
                >
                  <PhoneOff className="size-4" />
                </button>

                <div className="w-px h-5 bg-white/10 mx-0.5 flex-shrink-0" />

                {/* Collapse Control */}
                <button
                  onClick={() => setIsControlsCollapsed(true)}
                  className="p-2.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all flex-shrink-0"
                  title="Collapse Controls"
                >
                  <ChevronDown className="size-4" />
                </button>
              </>
            )}
          </div>
        </main>

      </div>
      {/* Focus Mode Toggle – draggable floating button */}
      <div
        className={`fixed z-[200] select-none group`}
        style={{ left: focusBtnPos.x, top: focusBtnPos.y }}
        onMouseDown={(e) => {
          focusBtnDragRef.current = { startX: e.clientX, startY: e.clientY, initX: focusBtnPos.x, initY: focusBtnPos.y, moved: false };
          setFocusBtnDragging(true);
        }}
        onClick={() => {
          if (!focusBtnDragRef.current.moved) {
            setFocusMode(f => !f);
            if (!focusMode) setActiveTool(null);
          }
        }}
      >
        <div className={`size-10 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 shadow-lg ${focusMode
          ? 'bg-[#5E5CE6] text-white shadow-indigo-500/40 hover:shadow-indigo-500/60'
          : 'bg-[#1C1E2A]/80 backdrop-blur-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
          }`} title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode – hide all tools'}>
          {focusMode ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </div>
        {/* Tooltip */}
        <div className="absolute left-12 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-black/90 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          {focusMode ? 'Show Tools' : 'Focus Mode'}
        </div>
      </div>

      {/* Chat popup in focus mode – quick access */}
      {
        focusMode && (
          <div className="fixed bottom-6 right-6 z-[190] flex items-center gap-2">
            <button
              onClick={() => { setFocusMode(false); setActiveTool('chat'); }}
              className="size-12 rounded-full bg-[#1C1E2A]/90 backdrop-blur-lg border border-white/10 text-zinc-300 hover:text-white hover:border-[#5E5CE6]/50 transition-all shadow-lg flex items-center justify-center relative"
              title="Open Chat"
            >
              <MessageSquare className="size-5" />
              {chatMessages.length > 0 && <div className="absolute -top-1 -right-1 size-3 bg-[#5E5CE6] rounded-full" />}
            </button>
          </div>
        )
      }
    </div>
  );
};

export default Meetings;
