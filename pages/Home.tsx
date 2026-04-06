
import React from 'react';
import {
  Video, Monitor, Layers, Clapperboard, Wand2, BarChart3,
  Radio, Users, Camera, ArrowUpRight, Zap, CheckCircle2, Calendar, Lightbulb,
  Clock, AlertCircle, Code2, Mic, Presentation, Users2, Plus, X, Pen, Trash2, Bell,
  ExternalLink, Loader2
} from 'lucide-react';
import { UserProfile, AppRoute } from '../types';
import PageDoodles from '../components/PageDoodles';
import { useToast } from '../components/ToastProvider';
import {
  initGoogleAuth,
  connectGoogleCalendar,
  isGoogleCalendarConnected,
  createCalendarEvent,
  getAccessToken
} from '../services/googleCalendarService';

interface HomeProps {
  user: UserProfile;
  onRecordClick: () => void;
  onStopClick?: () => void;
  onNavigate: (route: string) => void;
  coverImage?: string;
}

const studioCapabilities = [
  { icon: Radio, label: 'Standard', desc: 'Classic single-camera production setup', color: 'from-rose-500 to-orange-500', bg: 'bg-rose-50', text: 'text-rose-600', route: null, action: 'record' as const },
  { icon: Users2, label: 'Interview', desc: 'Multi-camera setup for guest interviews', color: 'from-violet-500 to-indigo-500', bg: 'bg-violet-50', text: 'text-violet-600', route: null, action: 'record' as const },
  { icon: Code2, label: 'Code Lab', desc: 'Specialized for coding tutorials and demos', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600', route: null, action: 'record' as const },
  { icon: Presentation, label: 'Presenter', desc: 'Presentation mode with slides and camera', color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', text: 'text-cyan-600', route: null, action: 'record' as const },
];

const upcomingProductions = [
  { title: 'Example Labelled Event', date: 'Upcoming', category: 'Live Streaming', status: 'scheduled', icon: Radio, color: 'from-indigo-500 to-violet-500' },
];

const productionChecklist = [
  { task: 'Example Check List', completed: false, priority: 'medium' },
];

const Home: React.FC<HomeProps> = ({ user, onRecordClick, onStopClick, onNavigate, coverImage }) => {
  const [checklist, setChecklist] = React.useState(productionChecklist);
  const [draggedItem, setDraggedItem] = React.useState<number | null>(null);
  const [editingItem, setEditingItem] = React.useState<number | null>(null);
  const [editText, setEditText] = React.useState('');
  const [newTaskText, setNewTaskText] = React.useState('');
  const [isProducing, setIsProducing] = React.useState(false);
  const [showScheduleForm, setShowScheduleForm] = React.useState(false);
  const [scheduledProductions, setScheduledProductions] = React.useState<Array<{ id: string, title: string, date: string, time: string, category: string, reminder: number, reminderShown?: boolean }>>([]);
  const [formData, setFormData] = React.useState({ title: '', date: '', time: '', category: 'Live Streaming', reminder: 15, syncToCalendar: false });
  const { addToast } = useToast();
  const [shownReminders, setShownReminders] = React.useState<Set<string>>(new Set());
  const [isCalendarConnected, setIsCalendarConnected] = React.useState(false);
  const [isConnectingCalendar, setIsConnectingCalendar] = React.useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = React.useState(false);

  // Initialize Google Auth on mount
  React.useEffect(() => {
    initGoogleAuth()
      .then(() => setIsCalendarConnected(isGoogleCalendarConnected()))
      .catch(() => { });
  }, []);

  // Check for upcoming reminders
  React.useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      scheduledProductions.forEach((prod) => {
        if (shownReminders.has(prod.id)) return;

        const scheduledDate = new Date(`${prod.date}T${prod.time}`);
        const reminderTime = new Date(scheduledDate.getTime() - prod.reminder * 60 * 1000);
        const timeDiff = scheduledDate.getTime() - now.getTime();
        const minutesUntil = Math.floor(timeDiff / 60000);

        // Show reminder if we're within the reminder window
        if (now >= reminderTime && now < scheduledDate && !shownReminders.has(prod.id)) {
          addToast(`🔔 Reminder: "${prod.title}" starts in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}!`, 'info');
          setShownReminders(prev => new Set([...prev, prod.id]));
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [scheduledProductions, addToast, shownReminders]);

  const handleAddScheduledProduction = async () => {
    if (formData.title && formData.date && formData.time) {
      const newProd = { id: Date.now().toString(), ...formData };
      setScheduledProductions([...scheduledProductions, newProd]);

      // Sync to Google Calendar if enabled
      if (formData.syncToCalendar && isCalendarConnected) {
        setIsSyncingCalendar(true);
        try {
          const token = getAccessToken();
          if (token) {
            await createCalendarEvent(token, {
              title: `[Show] ${formData.title}`,
              date: formData.date,
              time: formData.time,
              description: `Category: ${formData.category}\nScheduled via Show App`,
              duration: 60,
              reminder: formData.reminder,
            });
            addToast(`✅ "${formData.title}" added to Google Calendar!`, 'success');
          }
        } catch (err) {
          addToast(`⚠️ Scheduled locally, but failed to sync to Google Calendar`, 'error');
        }
        setIsSyncingCalendar(false);
      } else {
        addToast(`✅ "${formData.title}" scheduled! Reminder set for ${formData.reminder} min before.`, 'success');
      }

      setFormData({ title: '', date: '', time: '', category: 'Live Streaming', reminder: 15, syncToCalendar: false });
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

  const handleRemoveScheduledProduction = (id: string) => {
    setScheduledProductions(scheduledProductions.filter(p => p.id !== id));
  };

  const handleProductionToggle = () => {
    if (!isProducing) {
      // Start production
      setIsProducing(true);
      onRecordClick();
    } else {
      // Stop production
      setIsProducing(false);
      onStopClick?.();
    }
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

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 bg-white min-h-screen relative">
      <PageDoodles variant="technical" />

      {/* ── Show Studio Hero ── */}
      <div className="relative rounded-[48px] overflow-hidden bg-gradient-to-br from-[#3b27b2] via-[#8227b2] to-[#b61cc9] p-12 shadow-lg border border-white/10">
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Content */}
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.05]">
              Your Production<br />Command Center.
            </h1>
            <p className="text-lg text-white/90 leading-relaxed max-w-md">
              Record, stream, capture, and publish — all from one studio. Launch a live broadcast, record an async show, or jump into any workspace module.
            </p>
            <button
              onClick={onRecordClick}
              className="flex items-center gap-3 bg-white text-[#3b27b2] px-8 py-4 rounded-2xl text-sm font-bold shadow-lg hover:bg-violet-50 hover:text-[#3b27b2] transition-all active:scale-95"
            >
              <Monitor className="size-4" /> Launch Show Studio
            </button>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src={coverImage || "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=2000"}
              alt="Show Studio"
              className="w-full rounded-2xl shadow-lg border border-white/10"
            />
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: 'Capabilities', value: '3', icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Share Options', value: '4+', icon: Radio, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Resolution', value: '4K', icon: Monitor, color: 'text-cyan-500', bg: 'bg-cyan-50' },
        ].map(stat => (
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

      {/* ── Studio Capabilities Section ── */}
      <div className="space-y-6 pb-10">
        <h2 className="text-2xl font-black text-slate-900">Production Modes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {studioCapabilities.map(feat => (
            <div
              key={feat.label}
              onClick={() => feat.action === 'record' ? onRecordClick() : feat.route && onNavigate(feat.route)}
              className="group p-6 bg-white rounded-[24px] border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <div className={`size-12 bg-gradient-to-br ${feat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4`}>
                <feat.icon className="size-5 text-white" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{feat.label}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Upcoming Production Section ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Upcoming Production</h2>
          <button onClick={() => onNavigate(AppRoute.MEETINGS)} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View Schedule <ArrowUpRight className="size-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingProductions.map((prod, idx) => (
            <div key={idx} className="group p-6 bg-white rounded-[24px] border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`size-12 bg-gradient-to-br ${prod.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <prod.icon className="size-5 text-white" />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${prod.status === 'scheduled'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
                  }`}>
                  {prod.status}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">{prod.title}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="size-3.5" />
                {prod.date}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{prod.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Schedule Production Section ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Schedule Production</h2>
          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="size-4" /> Add Schedule
          </button>
        </div>

        {showScheduleForm && (
          <div className="p-6 bg-white rounded-[24px] border border-slate-100 space-y-4">
            <input
              type="text"
              placeholder="Production Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="Live Streaming">Live Streaming</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Documentary">Documentary</option>
              <option value="Interview">Interview</option>
              <option value="Webinar">Webinar</option>
            </select>
            <div className="flex items-center gap-3">
              <Bell className="size-5 text-slate-400" />
              <select
                value={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: Number(e.target.value) })}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value={5}>Remind 5 minutes before</option>
                <option value={10}>Remind 10 minutes before</option>
                <option value={15}>Remind 15 minutes before</option>
                <option value={30}>Remind 30 minutes before</option>
                <option value={60}>Remind 1 hour before</option>
                <option value={1440}>Remind 1 day before</option>
              </select>
            </div>

            {/* Google Calendar Sync */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                    <svg viewBox="0 0 24 24" className="size-5" fill="none">
                      <path d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z" fill="#fff" stroke="#E5E7EB" strokeWidth="1.5" />
                      <path d="M12 8V16M8 12H16" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
                      <rect x="4" y="4" width="16" height="4" fill="#4285F4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Google Calendar</p>
                    <p className="text-xs text-slate-400">
                      {isCalendarConnected ? 'Connected - sync this event' : 'Connect to sync events'}
                    </p>
                  </div>
                </div>
                {isCalendarConnected ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.syncToCalendar}
                      onChange={(e) => setFormData({ ...formData, syncToCalendar: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-600">Sync</span>
                  </label>
                ) : (
                  <button
                    onClick={handleConnectGoogleCalendar}
                    disabled={isConnectingCalendar}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {isConnectingCalendar ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ExternalLink className="size-4" />
                    )}
                    Connect
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddScheduledProduction}
                disabled={isSyncingCalendar}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSyncingCalendar && <Loader2 className="size-4 animate-spin" />}
                Schedule
              </button>
              <button
                onClick={() => setShowScheduleForm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {scheduledProductions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledProductions.map((prod) => (
              <div key={prod.id} className="p-5 bg-white rounded-[20px] border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Calendar className="size-5 text-indigo-600" />
                  </div>
                  <button
                    onClick={() => handleRemoveScheduledProduction(prod.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">{prod.title}</h3>
                <div className="space-y-1.5 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5" />
                    {prod.date} at {prod.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="size-3.5" />
                    <span className="text-xs">Reminder {prod.reminder >= 60 ? `${prod.reminder / 60}h` : `${prod.reminder}m`} before</span>
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {prod.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Keyboard Shortcuts Banner ── */}
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
          ].map((shortcut, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[9px] font-mono text-zinc-300">{shortcut.keys}</kbd>
              <span className="text-[10px] text-zinc-400">{shortcut.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleProductionToggle}
          className={`px-2 py-1 rounded font-bold text-[11px] transition-colors border shadow-sm ${isProducing
            ? 'bg-rose-600 text-white hover:bg-rose-700 border-rose-700'
            : 'bg-white text-black hover:bg-zinc-100 border-zinc-200'
            }`}
          style={{ minWidth: 0, height: 24, lineHeight: '16px' }}
        >
          {isProducing ? 'Stop Production →' : 'Enter Show Studio →'}
        </button>
      </div>

      {/* ── Production Checklist Section ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Production Checklist</h2>
          <span className="text-sm font-bold text-slate-400">
            {checklist.filter(t => t.completed).length}/{checklist.length} Complete
          </span>
        </div>
        <div className="space-y-3">
          {checklist.map((item, idx) => (
            <div
              key={idx}
              draggable={editingItem !== idx}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={`group flex items-center gap-4 p-4 bg-white rounded-[16px] border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all ${editingItem !== idx ? 'cursor-move' : ''
                } ${draggedItem === idx ? 'opacity-50 scale-95' : ''}`}
            >
              <button
                onClick={() => toggleChecklistItem(idx)}
                className={`flex-shrink-0 size-5 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed
                  ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600'
                  : 'border-slate-300 group-hover:border-indigo-300 hover:border-indigo-500'
                  }`}
              >
                {item.completed && <CheckCircle2 className="size-3.5 text-white" />}
              </button>
              <div className="flex-1">
                {editingItem === idx ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(idx);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="w-full px-2 py-1 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    autoFocus
                  />
                ) : (
                  <p
                    className={`font-medium ${item.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}
                    onDoubleClick={() => startEditing(idx)}
                  >
                    {item.task}
                  </p>
                )}
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${item.priority === 'high'
                ? 'bg-rose-100 text-rose-700'
                : item.priority === 'medium'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
                }`}>
                {item.priority}
              </div>
              {editingItem === idx ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(idx)}
                    className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                  >
                    <CheckCircle2 className="size-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditing(idx)}
                    className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                  >
                    <Pen className="size-4" />
                  </button>
                  <button
                    onClick={() => deleteChecklistItem(idx)}
                    className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-rose-100 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {/* Add New Task */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[16px] border border-dashed border-slate-200">
            <Plus className="size-5 text-slate-400" />
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addNewTask();
              }}
              placeholder="Add a new task..."
              className="flex-1 bg-transparent border-none focus:outline-none text-slate-600 placeholder:text-slate-400"
            />
            {newTaskText && (
              <button
                onClick={addNewTask}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;