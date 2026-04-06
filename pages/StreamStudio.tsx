
import React, { useState, useEffect, useRef } from 'react';
import {
  subscribeToJoinRequests,
  setGuestApprovalStatus,
  removeJoinRequest,
  subscribeToRoom,
  setRoomState,
  type JoinRequest,
  type RoomState
} from '../services/firebase';
import StudioSettingsPanel, { StudioSettingsActions } from '../components/StudioSettingsPanel';
import {
  Radio, Mic, MicOff, Video, VideoOff, Users, MessageSquare,
  ArrowRight, Sparkles, Zap, Settings, Monitor, Camera,
  ChevronRight, Shield, Cpu, Target, CheckCircle2, Plus,
  Calendar, Bell, ExternalLink, Loader2, Layers, Wand2, Globe,
  Share2, BarChart3, Pen, Trash2, Play, Link, LogIn
} from 'lucide-react';
import PageDoodles from '../components/PageDoodles';
import HeroBanner from '../components/HeroBanner';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../services/AuthContext';
import { save, load, NS } from '../services/persistence';
import { sendScheduledEventEmail, isEmailConfigured } from '../services/emailService';
import {
  initGoogleAuth,
  connectGoogleCalendar,
  isGoogleCalendarConnected,
  createCalendarEvent,
  getAccessToken
} from '../services/googleCalendarService';

const streamChecklist = [
  { task: 'Test microphone and camera', completed: false, priority: 'high' },
];

interface StreamStudioProps {
  onEnterStudio: (code?: string) => void;
}

// Defensive: ensure ROOM_ID is always a string
const ROOM_ID: string = 'stream-room';

const StreamStudio: React.FC<StreamStudioProps> = ({ onEnterStudio }) => {
  // Room state for real-time sync (guests see host actions)
  const [roomState, setRoomStateLocal] = useState<RoomState | null>(null);
  // Subscribe to room state for guests (real-time host sync)
  useEffect(() => {
    const unsubscribe = subscribeToRoom(ROOM_ID, (state) => {
      setRoomStateLocal(state);
    });
    return () => unsubscribe();
  }, []);
  const { addToast } = useToast();
  const { firebaseUser } = useAuth();
  // Join Requests (Host/Co-host approval)
  const [pendingJoinRequests, setPendingJoinRequests] = useState<JoinRequest[]>([]);
  const notifiedRequestIdsRef = useRef<Set<string>>(new Set());



  // Subscribe to join requests
  useEffect(() => {
    // Defensive: ensure ROOM_ID is a non-empty string and not an object
    if (typeof ROOM_ID !== 'string' || !ROOM_ID ||
      ROOM_ID.includes('.') || ROOM_ID.includes('#') || ROOM_ID.includes('$') || ROOM_ID.includes('[') || ROOM_ID.includes(']') ||
      Object.prototype.toString.call(ROOM_ID) !== '[object String]') {
      setPendingJoinRequests([]);
      addToast('Invalid room ID for join requests. Please contact support.', 'error');
      console.error('Invalid ROOM_ID for join requests:', ROOM_ID);
      return;
    }
    const unsubscribe = subscribeToJoinRequests(ROOM_ID, (requests) => {
      requests.forEach(req => {
        if (!notifiedRequestIdsRef.current.has(req.id)) {
          notifiedRequestIdsRef.current.add(req.id);
          addToast(`🙋 ${req.name} is waiting to join`, 'info');
        }
      });
      setPendingJoinRequests(requests);
    });
    return () => unsubscribe();
  }, [addToast]);

  const handleApproveJoin = async (req: JoinRequest) => {
    await setGuestApprovalStatus(ROOM_ID, req.id, true);
    await removeJoinRequest(ROOM_ID, req.id);
    addToast(`${req.name} approved to join`, 'success');
  };

  const handleDenyJoin = async (req: JoinRequest) => {
    await setGuestApprovalStatus(ROOM_ID, req.id, false);
    await removeJoinRequest(ROOM_ID, req.id);
    addToast(`${req.name} denied`, 'error');
  };



  const [checklist, setChecklist] = useState(streamChecklist);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [newTaskText, setNewTaskText] = useState('');

  // Scheduling state
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduledStreams, setScheduledStreams] = useState<Array<{ id: string, title: string, date: string, time: string, platform: string, reminder: number }>>([]);
  const [streamFormData, setStreamFormData] = useState({ title: '', date: '', time: '', platform: 'YouTube', reminder: 30, syncToCalendar: false, sendEmail: false });
  const [shownReminders, setShownReminders] = useState<Set<string>>(new Set());
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);

  // Studio settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);


  // Join Stream state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Link Creation state
  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
  const [createdLink, setCreatedLink] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [showMeetingLink, setShowMeetingLink] = useState(false);

  const handleCreateLink = () => {
    // Generate a random room ID or use a standard format
    const newRoomId = Math.random().toString(36).substring(2, 8);
    // In a real app, you might save this to your backend if it needs to persist
    const link = `${window.location.origin}/join/${newRoomId}`;
    setCreatedLink(link);
    setShowCreateLinkModal(true);
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(createdLink);
    addToast('Link copied to clipboard!', 'success');
  };
  useEffect(() => {
    if (firebaseUser?.uid) {
      const saved = load<Array<{ id: string, title: string, date: string, time: string, platform: string, reminder: number }>>(firebaseUser.uid, NS.SCHEDULED_STREAMS);
      if (saved && saved.length > 0) {
        setScheduledStreams(saved);
      }
    }
  }, [firebaseUser?.uid]);

  // Save scheduled streams to localStorage whenever they change
  useEffect(() => {
    if (firebaseUser?.uid) {
      save(firebaseUser.uid, NS.SCHEDULED_STREAMS, scheduledStreams);
    }
  }, [scheduledStreams, firebaseUser?.uid]);

  // Initialize Google Auth on mount
  useEffect(() => {
    initGoogleAuth()
      .then(() => setIsCalendarConnected(isGoogleCalendarConnected()))
      .catch(() => { });
  }, []);

  // Check for upcoming stream reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      scheduledStreams.forEach((stream) => {
        if (shownReminders.has(stream.id)) return;

        const scheduledDate = new Date(`${stream.date}T${stream.time}`);
        const reminderTime = new Date(scheduledDate.getTime() - stream.reminder * 60 * 1000);
        const timeDiff = scheduledDate.getTime() - now.getTime();
        const minutesUntil = Math.floor(timeDiff / 60000);

        if (now >= reminderTime && now < scheduledDate && !shownReminders.has(stream.id)) {
          addToast(`📺 Reminder: "${stream.title}" stream in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}!`, 'info');
          setShownReminders(prev => new Set([...prev, stream.id]));
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [scheduledStreams, addToast, shownReminders]);

  const handleAddScheduledStream = async () => {
    if (streamFormData.title && streamFormData.date && streamFormData.time) {
      const newStream = { id: Date.now().toString(), ...streamFormData };
      setScheduledStreams([...scheduledStreams, newStream]);

      // Sync to Google Calendar if enabled
      if (streamFormData.syncToCalendar && isCalendarConnected) {
        setIsSyncingCalendar(true);
        try {
          const token = getAccessToken();
          if (token) {
            await createCalendarEvent(token, {
              title: `[Stream] ${streamFormData.title}`,
              date: streamFormData.date,
              time: streamFormData.time,
              description: `Platform: ${streamFormData.platform}\nScheduled via Show App - Stream Studio`,
              duration: 60,
              reminder: streamFormData.reminder,
            });
            addToast(`✅ "${streamFormData.title}" added to Google Calendar!`, 'success');
          }
        } catch (err) {
          addToast(`⚠️ Scheduled locally, but failed to sync to Google Calendar`, 'error');
        }
        setIsSyncingCalendar(false);
      }

      // Send email notification if enabled
      if (streamFormData.sendEmail && firebaseUser?.email) {
        try {
          const emailSent = await sendScheduledEventEmail({
            to_email: firebaseUser.email,
            to_name: firebaseUser.displayName || 'Creator',
            event_title: streamFormData.title,
            event_type: 'stream',
            event_date: streamFormData.date,
            event_time: streamFormData.time,
            event_details: streamFormData.platform,
            reminder_minutes: streamFormData.reminder,
          });
          if (emailSent) {
            addToast(`📧 Confirmation email sent!`, 'success');
          }
        } catch (err) {
          addToast(`⚠️ Failed to send email notification`, 'error');
        }
      }

      if (!streamFormData.syncToCalendar && !streamFormData.sendEmail) {
        addToast(`✅ "${streamFormData.title}" scheduled! Reminder set for ${streamFormData.reminder} min before.`, 'success');
      }

      setStreamFormData({ title: '', date: '', time: '', platform: 'YouTube', reminder: 30, syncToCalendar: false, sendEmail: false });
      setShowScheduleForm(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    setIsConnectingCalendar(true);
    try {
      await connectGoogleCalendar();
      setIsCalendarConnected(true);
      addToast('📅 Google Calendar connected!', 'success');
    } catch (err: any) {
      addToast(`Failed to connect: ${err.message}`, 'error');
    }
    setIsConnectingCalendar(false);
  };

  const handleRemoveScheduledStream = (id: string) => {
    setScheduledStreams(scheduledStreams.filter(s => s.id !== id));
  };

  const toggleChecklistItem = (idx: number) => {
    const updated = [...checklist];
    updated[idx] = { ...updated[idx], completed: !updated[idx].completed };
    setChecklist(updated);
  };

  const handleDragStart = (idx: number) => {
    setDraggedItem(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedItem === null || draggedItem === targetIdx) return;
    const updated = [...checklist];
    const draggedTask = updated[draggedItem];
    updated.splice(draggedItem, 1);
    updated.splice(targetIdx, 0, draggedTask);
    setChecklist(updated);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const startEditing = (idx: number) => {
    setEditingItem(idx);
    setEditText(checklist[idx].task);
  };

  const saveEdit = (idx: number) => {
    if (editText.trim()) {
      const updated = [...checklist];
      updated[idx] = { ...updated[idx], task: editText.trim() };
      setChecklist(updated);
    }
    setEditingItem(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditText('');
  };

  const deleteChecklistItem = (idx: number) => {
    setChecklist(checklist.filter((_, i) => i !== idx));
  };

  const addNewTask = () => {
    if (newTaskText.trim()) {
      setChecklist([...checklist, { task: newTaskText.trim(), completed: false, priority: 'medium' }]);
      setNewTaskText('');
    }
  };

  const quickActions = [
    { label: 'Instant Show', icon: Play, color: 'from-indigo-500 to-violet-500', desc: 'Start broadcasting with one click', action: () => onEnterStudio(ROOM_ID) },
    { label: 'Schedule', icon: Calendar, color: 'from-purple-500 to-pink-500', desc: 'Plan a show for later', action: () => setShowScheduleForm(true) },
    { label: 'Join Show', icon: LogIn, color: 'from-emerald-500 to-teal-500', desc: 'Enter with a link or code', action: () => setShowJoinModal(true) },
    { label: 'Create Link', icon: Link, color: 'from-blue-500 to-cyan-500', desc: 'Generate a meeting link for later', action: handleCreateLink },
  ];

  const features = [
    { icon: Radio, title: 'Multi-Platform', desc: 'Stream to YouTube, Twitch, and custom RTMP simultaneously' },
    { icon: Layers, title: 'Scene Builder', desc: 'Create professional layouts with overlays, alerts, and widgets' },
    { icon: Users, title: 'Guest Mode', desc: 'Invite co-hosts and guests with one click via unique links' },
    { icon: MessageSquare, title: 'Live Chat', desc: 'Integrated chat from all platforms in one unified view' },
    { icon: BarChart3, title: 'Analytics', desc: 'Real-time viewer count, engagement, and stream health' },
    { icon: Shield, title: 'Auto-Record', desc: 'Automatically save streams to cloud with instant replay' },
  ];

  const stats = [
    { value: '0', label: 'Total Streams', icon: Radio },
    { value: '0', label: 'Watch Hours', icon: BarChart3 },
    { value: '0', label: 'Peak Viewers', icon: Users },
    { value: '100%', label: 'Uptime', icon: Shield },
  ];

  const [toolsSidebarOpen, setToolsSidebarOpen] = useState(true);
  const [inMeeting, setInMeeting] = useState(false);

  // Helper: enter meeting and show sidebar
  const handleEnterMeeting = (code?: string) => {
    setInMeeting(true);
    setToolsSidebarOpen(true);
    onEnterStudio(code);
  };

  // Use roomState for scenes, overlays, etc. Guests will see host's current state in real time
  return (
    <div className={`min-h-screen pb-32 relative lg:ml-24 transition-all duration-300`}>
      {/* Example: show current scene for guests */}
      {roomState && (
        <div className="fixed top-2 left-2 z-50 bg-white/90 rounded-xl px-4 py-2 shadow-lg border border-slate-200">
          <div className="text-xs text-slate-500 font-bold mb-1">Current Scene</div>
          <div className="font-black text-lg text-slate-900">{roomState.liveSceneId || 'N/A'}</div>
        </div>
      )}
      {/* Expandable tools sidebar, only in meeting */}
      {inMeeting && (
        <div className="fixed top-0 right-0 h-full z-40 flex items-start" style={{ pointerEvents: 'none' }}>
          <div
            className={`relative h-full flex items-start transition-all duration-300 ${toolsSidebarOpen ? 'w-80' : 'w-14'}`}
            style={{ pointerEvents: 'auto' }}
          >
            {/* Expandable cover overlay */}
            {!toolsSidebarOpen && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <button
                  className="bg-rose-600 text-white rounded-l-full px-3 py-4 shadow-xl hover:bg-rose-700 transition-colors focus:outline-none flex flex-col items-center"
                  style={{ pointerEvents: 'auto' }}
                  onClick={() => setToolsSidebarOpen(true)}
                  aria-label="Expand tools sidebar"
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M8 6l8 6-8 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span className="mt-2 text-xs font-bold">Tools</span>
                </button>
              </div>
            )}
            <div className={`bg-white/95 border-l border-slate-200 h-full shadow-2xl transition-all duration-300 rounded-l-2xl flex flex-col ${toolsSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}
              style={{ minWidth: toolsSidebarOpen ? 320 : 0 }}
            >
              {/* Example tools content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-slate-900">Tools</h3>
                  <button
                    className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-full p-1.5 ml-2 focus:outline-none"
                    onClick={() => setToolsSidebarOpen(false)}
                    aria-label="Collapse tools sidebar"
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
                <ul className="space-y-2">
                  <li className="text-slate-700">- Whiteboard</li>
                  <li className="text-slate-700">- Chat</li>
                  <li className="text-slate-700">- Polls</li>
                  <li className="text-slate-700">- Q&amp;A</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Meeting tools sidebar should only render when user joins a meeting, not in hero/banner section. */}
      {pendingJoinRequests.length > 0 && (
        <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-right-4">
          <div className="bg-amber-500/10 backdrop-blur-lg border border-amber-500/30 rounded-2xl p-4 w-80 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-amber-300">{pendingJoinRequests.length} waiting to join</span>
            </div>
            {pendingJoinRequests.map(req => (
              <div key={req.id} className="flex items-center gap-3 mb-2 last:mb-0">
                <div className="size-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-300 font-bold text-xs">{req.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-zinc-200 font-bold truncate block">{req.name}</span>
                  {req.wantsRecording && <span className="text-[8px] font-bold text-rose-400">📹 Wants recording</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleApproveJoin(req)} className="px-2 py-1 bg-emerald-600 rounded-lg text-[10px] font-bold text-white">Accept</button>
                  <button onClick={() => handleDenyJoin(req)} className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-bold text-zinc-400">Deny</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <StudioSettingsActions onSettings={() => setSettingsOpen(true)} />
      <StudioSettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        cameraEnabled={cameraEnabled}
        microphoneEnabled={microphoneEnabled}
        onToggleCamera={setCameraEnabled}
        onToggleMicrophone={setMicrophoneEnabled}
      />
      <PageDoodles variant="technical" />

      {/* Stream Studio Banner Section (all hero content inside) */}
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-6 flex flex-col md:flex-row items-center justify-between gap-8 rounded-3xl mb-8 relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, #0a1433 60%, #1a223a 100%)' }}>
        <style>{`
          @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
          @keyframes float-medium { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
          @keyframes spin-super-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse-glow-blue { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } }
          @keyframes dash-scroll { to { stroke-dashoffset: -20; } }
        `}</style>

        {/* ─── Augmented Reality Doodles ────────────────────── */}

        {/* Rotating Radar/Scan Circle - Top Right */}
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] pointer-events-none opacity-20" style={{ animation: 'spin-super-slow 60s linear infinite' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-400">
            <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 2" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.1" />
            <path d="M50,0 L50,10 M50,90 L50,100 M0,50 L10,50 M90,50 L100,50" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="0.5 4" />
          </svg>
        </div>

        {/* Floating Geometric Shapes - Bottom Left */}
        <svg className="absolute bottom-10 left-10 w-32 h-32 text-emerald-400/20 pointer-events-none" style={{ animation: 'float-slow 8s ease-in-out infinite' }} viewBox="0 0 100 100">
          <path d="M50,20 L80,70 L20,70 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="45" r="5" fill="currentColor" opacity="0.5" />
        </svg>

        {/* Pulsing Signal Waves - Center Right */}
        <div className="absolute top-1/2 right-[20%] w-64 h-64 -translate-y-1/2 pointer-events-none">
          <svg className="w-full h-full text-purple-500" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-0" style={{ animation: 'pulse-glow-blue 4s ease-in-out infinite' }} />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.2" className="opacity-0" style={{ animation: 'pulse-glow-blue 4s ease-in-out infinite 1s' }} />
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.1" className="opacity-0" style={{ animation: 'pulse-glow-blue 4s ease-in-out infinite 2s' }} />
          </svg>
        </div>

        {/* Technical Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Floating Code Bits - Random placment */}
        <div className="absolute top-20 left-[40%] text-[8px] font-mono text-cyan-300/30 px-2 py-0.5 border border-cyan-500/20 rounded bg-cyan-900/10 pointer-events-none" style={{ animation: 'float-medium 6s ease-in-out infinite alternate' }}>
          STREAM_STATUS: ACTIVE
        </div>
        <div className="absolute bottom-20 right-[30%] text-[8px] font-mono text-purple-300/30 px-2 py-0.5 border border-purple-500/20 rounded bg-purple-900/10 pointer-events-none" style={{ animation: 'float-medium 7s ease-in-out infinite alternate-reverse' }}>
          BITRATE: 6000kbps
        </div>

        {/* ──────────────────────────────────────────────────── */}
        {/* Left: Text and Buttons */}
        <div className="flex-1 min-w-[320px] z-10">
          <div className="mb-4">
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-green-300 tracking-widest mb-2">PRODUCTION GRADE</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Welcome to<br />Stream Studio<span className="text-emerald-200">.</span>
          </h1>
          <p className="text-lg text-slate-200 mb-8 max-w-xl">
            Launch a live broadcast, record a high-fidelity show, or manage your streaming channels. Your central hub for content creation.
          </p>
          <div className="flex flex-wrap gap-4 mb-2">
            <button
              onClick={() => handleEnterMeeting(ROOM_ID)}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-white text-rose-600 rounded-xl text-base font-bold shadow-lg hover:bg-rose-50 transition-colors border border-rose-100"
            >
              <Radio className="size-5" />
              Instant Meeting
            </button>
            <button
              onClick={() => setShowScheduleForm(true)}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-white text-amber-600 rounded-xl text-base font-bold shadow-lg hover:bg-amber-50 transition-colors border border-amber-100"
            >
              <Calendar className="size-5" />
              Schedule a Stream
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-white text-indigo-600 rounded-xl text-base font-bold shadow-lg hover:bg-indigo-50 transition-colors border border-indigo-100"
            >
              <Camera className="size-5" />
              Join a Stream
            </button>
            <button
              onClick={handleCreateLink}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-white text-emerald-600 rounded-xl text-base font-bold shadow-lg hover:bg-emerald-50 transition-colors border border-emerald-100"
            >
              <Monitor className="size-5" />
              Create a link
            </button>
          </div>
        </div>
        {/* Right: Banner Image with overlay */}
        <div className="flex-1 flex items-center justify-center min-w-[320px] z-10">
          <div className="relative w-full max-w-xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <img
              src="/stream-studio-preview.png"
              alt="Stream Studio Preview"
              className="w-full h-full object-cover object-center"
              style={{ background: '#101828' }}
            />
            <span className="absolute left-6 bottom-6 px-4 py-2 rounded-full bg-neutral-900/90 text-white font-bold text-xs shadow-lg flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-green-400 animate-pulse mr-2"></span>
              LIVE PREVIEW
            </span>
          </div>
        </div>
        {/* Subtle grid overlay for effect */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'url(https://www.transparenttextures.com/patterns/squared-metal.png) repeat', opacity: 0.25 }} />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* QUICK ACTIONS TOOLBAR                       */}
      {/* ═══════════════════════════════════════════ */}
      {/* QUICK ACTIONS TOOLBAR */}
      <section className="max-w-7xl mx-auto px-8 mt-8">
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className="group relative p-5 rounded-2xl border transition-all text-left overflow-hidden bg-white border-slate-200 hover:border-rose-200 hover:shadow-lg"
            >
              <div className={`size-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${action.color} text-white`}>
                <action.icon className="size-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">{action.label}</h3>
              <p className="text-xs mt-1 text-slate-500">{action.desc}</p>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 size-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-slate-400" />
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FEATURES BENTO GRID                         */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-8 mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Streaming Features</h2>
            <p className="text-sm text-slate-400 mt-1">Everything you need for professional broadcasts</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-rose-200 hover:shadow-lg transition-all"
            >
              <div className="size-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="size-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900">{feature.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* STATS ROW                                   */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-8 mt-16">
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
              <stat.icon className="size-6 text-rose-500 mx-auto mb-2" />
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* UPCOMING STREAM SECTION                     */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-8 mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Upcoming Stream</h2>
            <p className="text-sm text-slate-400 mt-1">These are streams that have already been scheduled</p>
          </div>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
          >
            <Calendar className="size-4" />
            Schedule
          </button>
        </div>
        {(scheduledStreams.length > 0
          ? <div className="space-y-3">
            {scheduledStreams.map((stream) => (
              <div key={stream.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Radio className="size-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{stream.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {stream.date} at {stream.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="size-3.5" />
                        {stream.platform}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Bell className="size-3.5" />
                    <span>Reminder {stream.reminder >= 60 ? `${stream.reminder / 60}h` : `${stream.reminder}m`} before</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          : <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Radio className="size-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Sample scheduled show</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      2026-02-20 at 18:00
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="size-3.5" />
                      YouTube
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Bell className="size-3.5" />
                  <span>Reminder 30m before</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* JOIN STREAM MODAL                           */}
      {/* ═══════════════════════════════════════════ */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowJoinModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900">Join a Stream</h3>
                <p className="text-xs text-slate-500 font-medium">Enter the code to join.</p>
              </div>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <div className="size-5 flex items-center justify-center">×</div>
              </button>
            </div>
            <div className="p-6">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Stream Code or Link</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="e.g. live-stream-123"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="px-5 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (joinCode.trim()) {
                      // Extract code if a full URL is pasted
                      const code = joinCode.includes('/join/') ? joinCode.split('/join/')[1] : joinCode;
                      onEnterStudio(code);
                      setShowJoinModal(false);
                    }
                  }}
                  disabled={!joinCode.trim()}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join Stream
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* CREATE LINK MODAL                           */}
      {/* ═══════════════════════════════════════════ */}
      {showCreateLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateLinkModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <CheckCircle2 className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Link Created!</h3>
                  <p className="text-xs text-slate-500 font-medium">Share this with your guests.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateLinkModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <div className="size-5 flex items-center justify-center">×</div>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Collapsible Meeting Link */}
              <div className="flex flex-col gap-1 w-full">
                <button
                  onClick={() => setShowMeetingLink((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors w-fit mb-1"
                  aria-expanded={showMeetingLink}
                  type="button"
                >
                  <span>{showMeetingLink ? 'Hide' : 'Show'} Meeting Link</span>
                  <svg
                    className={`transition-transform duration-200 ${showMeetingLink ? 'rotate-90' : ''}`}
                    width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showMeetingLink && (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      readOnly
                      value={createdLink}
                      className="bg-transparent flex-1 px-2 text-slate-700 text-sm outline-none font-medium truncate"
                    />
                    <button
                      onClick={copyLinkToClipboard}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 text-center">
                Anyone with this link can join your stream as a guest.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowCreateLinkModal(false)}
                className="px-5 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-300 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* SCHEDULE STREAM MODAL                       */}
      {/* ═══════════════════════════════════════════ */}
      {
        showScheduleForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowScheduleForm(false)} />
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Schedule Stream</h3>
                  <p className="text-xs text-slate-500 font-medium">Plan your broadcast</p>
                </div>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <div className="size-5 flex items-center justify-center">×</div>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Connect Calendar Callout */}
                {!isCalendarConnected && (
                  <div className="mb-6 flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="size-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                        <Calendar className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-indigo-900">Google Calendar</h4>
                        <p className="text-[10px] text-indigo-600 font-medium">Sync your streams automatically</p>
                      </div>
                    </div>
                    <button
                      onClick={handleConnectGoogleCalendar}
                      disabled={isConnectingCalendar}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      Connect
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-5 mb-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Stream Title</label>
                    <input
                      type="text"
                      value={streamFormData.title}
                      onChange={(e) => setStreamFormData({ ...streamFormData, title: e.target.value })}
                      placeholder="e.g., Weekly Dev Stream"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Platform</label>
                    <select
                      value={streamFormData.platform}
                      onChange={(e) => setStreamFormData({ ...streamFormData, platform: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors appearance-none"
                    >
                      <option>YouTube</option>
                      <option>Twitch</option>
                      <option>LinkedIn</option>
                      <option>Custom RTMP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={streamFormData.date}
                      onChange={(e) => setStreamFormData({ ...streamFormData, date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Time</label>
                    <input
                      type="time"
                      value={streamFormData.time}
                      onChange={(e) => setStreamFormData({ ...streamFormData, time: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Reminder</label>
                    <div className="relative">
                      <Bell className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <select
                        value={streamFormData.reminder}
                        onChange={(e) => setStreamFormData({ ...streamFormData, reminder: Number(e.target.value) })}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors appearance-none"
                      >
                        <option value={15}>15 min before</option>
                        <option value={30}>30 min before</option>
                        <option value={60}>1 hour before</option>
                        <option value={120}>2 hours before</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {isCalendarConnected && (
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-rose-200 hover:bg-rose-50/50 transition-all group">
                      <div className={`size-5 rounded flex items-center justify-center border transition-colors ${streamFormData.syncToCalendar ? 'bg-rose-500 border-rose-500' : 'bg-white border-slate-300 group-hover:border-rose-300'}`}>
                        {streamFormData.syncToCalendar && <CheckCircle2 className="size-3.5 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={streamFormData.syncToCalendar}
                        onChange={(e) => setStreamFormData({ ...streamFormData, syncToCalendar: e.target.checked })}
                        className="hidden"
                      />
                      <div className="flex-1">
                        <span className="block text-sm font-bold text-slate-700">Sync to Google Calendar</span>
                      </div>
                    </label>
                  )}

                  {firebaseUser?.email && (
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-rose-200 hover:bg-rose-50/50 transition-all group">
                      <div className={`size-5 rounded flex items-center justify-center border transition-colors ${streamFormData.sendEmail ? 'bg-rose-500 border-rose-500' : 'bg-white border-slate-300 group-hover:border-rose-300'}`}>
                        {streamFormData.sendEmail && <CheckCircle2 className="size-3.5 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={streamFormData.sendEmail}
                        onChange={(e) => setStreamFormData({ ...streamFormData, sendEmail: e.target.checked })}
                        className="hidden"
                      />
                      <div className="flex-1">
                        <span className="block text-sm font-bold text-slate-700">Email Notification</span>
                        <span className="block text-xs text-slate-400">Send me a confirmation email</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="px-5 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddScheduledStream}
                  disabled={isSyncingCalendar || !streamFormData.title || !streamFormData.date || !streamFormData.time}
                  className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncingCalendar ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Calendar className="size-4" />
                      Schedule Stream
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ═══════════════════════════════════════════ */}
      {/* KEYBOARD SHORTCUTS BAR                      */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-8 mt-10">
        <div className="bg-[#09090b] rounded-xl p-1.5 flex items-center justify-between flex-wrap gap-2 min-h-0">
          <div className="flex items-center gap-1.5">
            <div className="size-6 bg-gradient-to-br from-[#3b27b2] to-[#8227b2] rounded-lg flex items-center justify-center">
              <Zap className="size-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-[11px] leading-tight">Keyboard Shortcuts</h3>
              <p className="text-zinc-400 text-[10px] leading-tight">Speed up your show workflow</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[
              { keys: '⌘ + Shift + R', label: 'New Show' },
              { keys: '⌘ + K', label: 'Show Studio' },
              { keys: 'Enter', label: 'Show Studio' },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[9px] font-mono text-zinc-300">{shortcut.keys}</kbd>
                <span className="text-[10px] text-zinc-400">{shortcut.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onEnterStudio}
            className="px-2 py-1 bg-white text-black rounded font-bold text-[11px] hover:bg-zinc-100 transition-colors border border-zinc-200 shadow-sm"
            style={{ minWidth: 0, height: 24, lineHeight: '16px' }}
          >
            Enter Stream Studio
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* STREAM CHECKLIST SECTION                    */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-8 mt-16 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Stream Checklist</h2>
            <p className="text-sm text-slate-400 mt-1">Prepare your broadcast workflow</p>
          </div>
          <span className="text-sm font-bold italic text-slate-400">
            {checklist.filter(t => t.completed).length}/{checklist.length} Complete
          </span>
        </div>
        <div className="space-y-4">
          {checklist.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 px-6 py-5 bg-white rounded-2xl border border-slate-100"
            >
              <div className="flex-1 min-w-0">
                <p className={`text-[15px] font-medium text-slate-900`}>{item.task}</p>
              </div>
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
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addNewTask();
              }}
              placeholder="Add a new task..."
              className="flex-1 bg-transparent border-none focus:outline-none text-slate-600 placeholder:text-slate-400 text-[15px]"
            />
            {newTaskText && (
              <button
                onClick={addNewTask}
                className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            )}
          </div>
        </div>
      </section>
    </div >
  );
};

export default StreamStudio;
