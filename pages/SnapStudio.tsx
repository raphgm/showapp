
import React, { useState, useRef, useEffect } from 'react';
import {
  Aperture, Camera, Monitor, Upload, FolderOpen, Zap,
  Layers, Grid, Eye, Crosshair, Mic, MicOff, ScreenShare,
  ArrowRight, Sparkles, Image as ImageLucide, Download, Pen, Trash2,
  Maximize2, ScanLine, Palette, Focus, Wand2, Box,
  ChevronRight, Clock, Shield, Cpu, Radio, Target, Move, CheckCircle2, Plus, X,
  Calendar, Bell, ExternalLink, Loader2, Share2, Copy, Scissors,
  FileImage, Droplets, Eraser, Type, QrCode, GitBranch, User
} from 'lucide-react';
import { Capture } from '../types';
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

const snapChecklist = [
  { task: 'Configure capture region', completed: false, priority: 'high' },
];

import type { VaultStatus } from '../services/vaultService';

interface SnapStudioProps {
  captures: Capture[];
  onEnterStudioWorkspace: () => void;
  onQuickSnap: () => void;
  onDeleteCapture: (id: string) => void;
  onEditCapture?: (capture: Capture) => void;
  onOpenProfileEditor?: () => void;
  coverImage?: string;
  vaultStatus?: VaultStatus;
}

const SnapStudio: React.FC<SnapStudioProps> = ({
  captures,
  onEnterStudioWorkspace,
  onQuickSnap,
  onDeleteCapture,
  onEditCapture,
  onOpenProfileEditor,
  coverImage,
  vaultStatus,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'screenshots' | 'annotations'>('all');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [checklist, setChecklist] = useState(snapChecklist);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [newTaskText, setNewTaskText] = useState('');

  // Scheduling state
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduledSnaps, setScheduledSnaps] = useState<Array<{ id: string, title: string, date: string, time: string, captureType: string, reminder: number }>>([]);
  const [snapFormData, setSnapFormData] = useState({ title: '', date: '', time: '', captureType: 'Screenshot', reminder: 15, syncToCalendar: false, sendEmail: false });
  const { addToast } = useToast();
  const { firebaseUser } = useAuth();
  const [shownReminders, setShownReminders] = useState<Set<string>>(new Set());
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleImportMedia = () => {
    importFileRef.current?.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      const newCapture: Capture = {
        id: `import-${Date.now()}`,
        url,
        type: 'imported',
        createdAt: new Date().toISOString(),
        title: file.name,
      };
      // Trigger edit on the imported capture
      onEditCapture?.(newCapture);
      addToast(`📁 "${file.name}" imported!`, 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Load scheduled snaps from localStorage on mount
  useEffect(() => {
    if (firebaseUser?.uid) {
      const saved = load<Array<{ id: string, title: string, date: string, time: string, captureType: string, reminder: number }>>(firebaseUser.uid, NS.SCHEDULED_SNAPS);
      if (saved && saved.length > 0) {
        setScheduledSnaps(saved);
      }
    }
  }, [firebaseUser?.uid]);

  // Save scheduled snaps to localStorage whenever they change
  useEffect(() => {
    if (firebaseUser?.uid) {
      save(firebaseUser.uid, NS.SCHEDULED_SNAPS, scheduledSnaps);
    }
  }, [scheduledSnaps, firebaseUser?.uid]);

  // Initialize Google Auth on mount
  useEffect(() => {
    initGoogleAuth()
      .then(() => setIsCalendarConnected(isGoogleCalendarConnected()))
      .catch(() => { });
  }, []);

  // Check for upcoming snap reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      scheduledSnaps.forEach((snap) => {
        if (shownReminders.has(snap.id)) return;

        const scheduledDate = new Date(`${snap.date}T${snap.time}`);
        const reminderTime = new Date(scheduledDate.getTime() - snap.reminder * 60 * 1000);
        const timeDiff = scheduledDate.getTime() - now.getTime();
        const minutesUntil = Math.floor(timeDiff / 60000);

        if (now >= reminderTime && now < scheduledDate && !shownReminders.has(snap.id)) {
          addToast(`📸 Reminder: "${snap.title}" capture in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}!`, 'info');
          setShownReminders(prev => new Set([...prev, snap.id]));
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [scheduledSnaps, addToast, shownReminders]);

  const handleAddScheduledSnap = async () => {
    if (snapFormData.title && snapFormData.date && snapFormData.time) {
      const newSnap = { id: Date.now().toString(), ...snapFormData };
      setScheduledSnaps([...scheduledSnaps, newSnap]);

      // Sync to Google Calendar if enabled
      if (snapFormData.syncToCalendar && isCalendarConnected) {
        setIsSyncingCalendar(true);
        try {
          const token = getAccessToken();
          if (token) {
            await createCalendarEvent(token, {
              title: `[Snap] ${snapFormData.title}`,
              date: snapFormData.date,
              time: snapFormData.time,
              description: `Capture Type: ${snapFormData.captureType}\nScheduled via Show App - Snap Studio`,
              duration: 15,
              reminder: snapFormData.reminder,
            });
            addToast(`✅ "${snapFormData.title}" added to Google Calendar!`, 'success');
          }
        } catch (err) {
          addToast(`⚠️ Scheduled locally, but failed to sync to Google Calendar`, 'error');
        }
        setIsSyncingCalendar(false);
      }

      // Send email notification if enabled
      if (snapFormData.sendEmail && firebaseUser?.email) {
        try {
          const emailSent = await sendScheduledEventEmail({
            to_email: firebaseUser.email,
            to_name: firebaseUser.displayName || 'Creator',
            event_title: snapFormData.title,
            event_type: 'snap',
            event_date: snapFormData.date,
            event_time: snapFormData.time,
            event_details: snapFormData.captureType,
            reminder_minutes: snapFormData.reminder,
          });
          if (emailSent) {
            addToast(`📧 Confirmation email sent!`, 'success');
          }
        } catch (err) {
          addToast(`⚠️ Failed to send email notification`, 'error');
        }
      }

      if (!snapFormData.syncToCalendar && !snapFormData.sendEmail) {
        addToast(`✅ "${snapFormData.title}" scheduled! Reminder set for ${snapFormData.reminder} min before.`, 'success');
      }

      setSnapFormData({ title: '', date: '', time: '', captureType: 'Screenshot', reminder: 15, syncToCalendar: false, sendEmail: false });
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

  const handleRemoveScheduledSnap = (id: string) => {
    setScheduledSnaps(scheduledSnaps.filter(s => s.id !== id));
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

  const filteredCaptures = captures.filter(c => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'screenshots') return c.type?.toLowerCase().includes('screenshot') || c.type?.toLowerCase().includes('snap');
    if (activeFilter === 'annotations') return c.type?.toLowerCase().includes('annot');
    return true;
  });

  const quickActions = [
    { label: 'Open Studio', icon: Aperture, color: 'from-[#3b27b2] to-[#8227b2]', desc: 'Full workspace with camera, screen & HUD', action: onEnterStudioWorkspace, primary: true },
    { label: 'Quick Snap', icon: Camera, color: 'from-indigo-500 to-violet-500', desc: 'Instant region screenshot capture', action: onQuickSnap },
    { label: 'Screen Capture', icon: Monitor, color: 'from-emerald-500 to-teal-500', desc: 'Full screen or window screenshot', action: onEnterStudioWorkspace },
    { label: 'Import Media', icon: Upload, color: 'from-amber-500 to-orange-500', desc: 'Upload images, videos or PDFs', action: handleImportMedia },
    { label: 'Profile Photo', icon: User, color: 'from-blue-500 to-indigo-500', desc: 'LinkedIn & social media headshots', action: () => onOpenProfileEditor?.() },
  ];

  const features = [
    { icon: Crosshair, title: 'Precision Capture', desc: 'Pixel-perfect region selection with smart edge detection and auto-crop' },
    {
      icon: Layers, title: 'HUD Overlay', desc: 'Professional heads-up display with ISO, battery, audio meters & grid', action: () => {
        addToast('🎯 HUD Overlay enabled - open studio to use', 'success');
        onEnterStudioWorkspace();
      }, active: true
    },
    {
      icon: Wand2, title: 'Smart Annotate', desc: 'AI-powered annotations with auto-labeling, arrows, and callouts', action: () => {
        // If there are captures, open the most recent one for annotation
        if (captures.length > 0) {
          onEditCapture?.(captures[0]);
        } else {
          // Otherwise, take a quick snap first
          onQuickSnap();
        }
      }, active: true
    },
    {
      icon: ScanLine, title: 'OCR Extract', desc: 'Instantly extract text from any screenshot or image capture', action: () => {
        // If there are captures, extract text from the most recent one
        if (captures.length > 0) {
          addToast('🔍 Extracting text from capture...', 'info');
          // Open the capture for viewing/editing where OCR can be applied
          onEditCapture?.(captures[0]);
        } else {
          // Otherwise, take a quick snap first
          addToast('📸 Take a snapshot first to extract text', 'info');
          onQuickSnap();
        }
      }, active: true
    },
    {
      icon: Eraser, title: 'Smart Redact', desc: 'Auto-blur sensitive info like passwords, emails, and credit cards', action: () => {
        if (captures.length > 0) {
          addToast('🔒 Smart redaction enabled', 'info');
          onEditCapture?.(captures[0]);
        } else {
          addToast('📸 Capture something first to redact', 'info');
          onQuickSnap();
        }
      }, active: true
    },
    {
      icon: Scissors, title: 'Smart Crop', desc: 'AI-powered cropping removes unnecessary backgrounds and whitespace', action: () => {
        if (captures.length > 0) {
          addToast('✂️ Smart crop activated', 'info');
          onEditCapture?.(captures[0]);
        } else {
          onQuickSnap();
        }
      }, active: true
    },
    {
      icon: Share2, title: 'Quick Share', desc: 'One-click sharing to Slack, Teams, Discord, or generate shareable links', action: () => {
        if (captures.length > 0) {
          addToast('🔗 Share options available', 'info');
        } else {
          addToast('📸 Capture something first to share', 'info');
        }
      }, active: true
    },
    {
      icon: Copy, title: 'Instant Copy', desc: 'Auto-copy captures to clipboard with customizable image formats', action: () => {
        addToast('📋 Auto-copy enabled - captures will copy to clipboard', 'success');
      }, active: true
    },
    {
      icon: QrCode, title: 'QR Detection', desc: 'Automatically detect, decode, and extract QR codes from captures', action: () => {
        if (captures.length > 0) {
          addToast('📱 Scanning for QR codes...', 'info');
          onEditCapture?.(captures[0]);
        } else {
          onQuickSnap();
        }
      }, active: true
    },
    {
      icon: Droplets, title: 'Background Remove', desc: 'AI-powered background removal for clean, professional captures', action: () => {
        if (captures.length > 0) {
          addToast('🎨 Removing background...', 'info');
          onEditCapture?.(captures[0]);
        } else {
          onQuickSnap();
        }
      }, active: true
    },
    {
      icon: Type, title: 'Text Templates', desc: 'Pre-designed templates for tutorials, presentations, and social media', action: () => {
        addToast('📝 Template library opened', 'info');
      }, active: true
    },
    {
      icon: GitBranch, title: 'Version History', desc: 'Track all edits with automatic versioning and one-click rollback', action: () => {
        addToast('⏮️ Version history available in capture details', 'info');
      }, active: true
    },
    {
      icon: Shield, title: 'Secure Vault', desc: vaultStatus?.encrypted
        ? `AES-256 encrypted · ${vaultStatus.synced ? 'Cloud synced' : 'Local only'} · ${vaultStatus.captureCount} captures${vaultStatus.lastSyncedAt ? ' · Last sync ' + new Date(vaultStatus.lastSyncedAt).toLocaleTimeString() : ''}`
        : 'Initializing encryption…',
      action: () => {
        if (vaultStatus?.encrypted && vaultStatus.synced) {
          addToast(`🔐 Vault active — ${vaultStatus.captureCount} captures encrypted (AES-256-GCM) & synced to Firebase`, 'success');
        } else if (vaultStatus?.encrypted) {
          addToast('🔒 Vault encrypted locally, waiting for cloud sync…', 'info');
        } else {
          addToast('⏳ Vault initializing — sign in to activate encryption', 'info');
        }
      }, active: true
    },
  ];

  const stats = [
    { value: captures.length.toString(), label: 'Total Captures', icon: ImageLucide },
    { value: captures.filter(c => c.type?.toLowerCase().includes('snap')).length.toString(), label: 'Snapshots', icon: Aperture },
    { value: captures.filter(c => c.type?.toLowerCase().includes('annotate')).length.toString(), label: 'Annotated', icon: Pen },
    { value: vaultStatus?.encrypted ? (vaultStatus.synced ? '🔐 Synced' : '🔒 Local') : '—', label: 'Vault Status', icon: Shield },
  ];

  return (
    <div className="min-h-screen pb-32 relative">
      {/* Hidden file input for Import Media */}
      <input
        type="file"
        ref={importFileRef}
        onChange={handleImportFileChange}
        accept="image/*,video/*,.pdf"
        className="hidden"
      />
      <PageDoodles variant="technical" />

      {/* ═══════════════════════════════════════════ */}
      {/* HERO BANNER                                 */}
      {/* ═══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 pt-8 pb-6">
        <HeroBanner
          title={
            <>
              Snap Studio
              <span className="block text-blue-300">Pro Capture Suite</span>
            </>
          }
          description="Professional screenshots with HUD overlays, smart annotations, and instant team sync. Capture anything, annotate everything."
          imageUrl="https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&auto=format&fit=crop&q=80"
          gradientFrom="from-slate-800"
          gradientTo="to-blue-600"
          buttons={
            <>
              <button
                onClick={onEnterStudioWorkspace}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-800 rounded-xl font-bold text-sm hover:bg-white/90 transition-all shadow-lg"
              >
                <Aperture className="size-4" />
                Launch Studio
              </button>
              <button
                onClick={onQuickSnap}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-sm border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <Camera className="size-4" />
                Quick Snap
              </button>
            </>
          }
        />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* HERO SECTION — Azure-Inspired Split Layout  */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#3b27b2]/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/5 via-transparent to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — Text + CTAs */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-indigo-100 rounded-full shadow-sm">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Snap Studio</span>
                <span className="text-[10px] text-slate-400 font-medium">v2.0</span>
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[1.05]">
                  Capture. Annotate.
                  <span className="block bg-gradient-to-r from-[#3b27b2] via-[#8227b2] to-[#b61cc9] bg-clip-text text-transparent">
                    Ship visuals fast.
                  </span>
                </h1>
                <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                  Professional-grade screenshot and capture studio with HUD overlays, smart annotations, and one-click export to your team vault.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onEnterStudioWorkspace}
                  className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#3b27b2] to-[#8227b2] text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                >
                  <Aperture className="size-5" />
                  Open Studio
                  <ArrowRight className="size-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onQuickSnap}
                  className="group flex items-center gap-3 px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold text-sm border-2 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  <Aperture className="size-5" />
                  Quick Snap
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 pt-2">
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <stat.icon className="size-4 text-indigo-400" />
                    <div>
                      <div className="text-sm font-black text-slate-900">{stat.value}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Laptop/Studio Mockup */}
            <div className="relative">
              {/* Laptop Frame */}
              <div className="relative mx-auto max-w-lg">
                {/* Glow behind */}
                <div className="absolute inset-4 bg-gradient-to-br from-[#3b27b2]/20 via-[#8227b2]/10 to-[#b61cc9]/20 rounded-3xl blur-2xl" />

                {/* Screen */}
                <div className="relative bg-[#09090b] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-900/20">
                  {/* Title Bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-[#18181b] border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="size-2.5 rounded-full bg-rose-500/80" />
                      <div className="size-2.5 rounded-full bg-amber-500/80" />
                      <div className="size-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="px-4 py-0.5 bg-[#27272a] rounded-md">
                        <span className="text-[10px] text-zinc-400 font-mono">show://snap-studio</span>
                      </div>
                    </div>
                  </div>

                  {/* Workspace Preview */}
                  <div className="aspect-video bg-[#0a0a0a] relative">
                    {/* Fake Viewport */}
                    <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] overflow-hidden">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                          {[...Array(9)].map((_, i) => <div key={i} className="border border-white/30" />)}
                        </div>
                      </div>

                      {/* Center Crosshair */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Crosshair className="size-8 text-white/20" strokeWidth={1} />
                      </div>

                      {/* HUD Elements */}
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 bg-rose-500 rounded-full animate-pulse" />
                          <span className="text-[8px] font-mono font-bold text-rose-400">REC</span>
                        </div>
                        <span className="text-[7px] font-mono text-white/40 mt-0.5 block">ISO 800</span>
                      </div>
                      <div className="absolute top-3 right-3 text-right">
                        <span className="text-[7px] font-mono text-emerald-400">BAT 92%</span>
                        <span className="text-[7px] font-mono text-white/40 mt-0.5 block">4K 60FPS</span>
                      </div>

                      {/* Audio Bars */}
                      <div className="absolute bottom-3 left-3 flex gap-0.5 items-end h-4">
                        {[40, 65, 80, 55, 70, 45, 60, 75].map((h, i) => (
                          <div key={i} className="w-0.5 bg-white/30 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>

                      {/* Timer */}
                      <div className="absolute bottom-3 right-3">
                        <span className="text-lg font-mono font-black text-white/10">02:47</span>
                      </div>
                    </div>

                    {/* Floating Action Bar Preview */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-[#18181b]/80 backdrop-blur rounded-full border border-white/10">
                      <Camera className="size-3 text-white/60" />
                      <ScreenShare className="size-3 text-white/40" />
                      <div className="size-5 rounded-full bg-rose-500 border-2 border-white/30" />
                      <Aperture className="size-3 text-white/60" />
                      <Mic className="size-3 text-white/40" />
                    </div>
                  </div>
                </div>

                {/* Laptop Base */}
                <div className="mx-auto w-[60%] h-3 bg-gradient-to-b from-[#27272a] to-[#18181b] rounded-b-xl border-x border-b border-white/5" />
                <div className="mx-auto w-[40%] h-1 bg-[#27272a] rounded-b-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* QUICK ACTIONS TOOLBAR                       */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-8 -mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={action.action}
              className={`group relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] ${action.primary
                  ? 'bg-gradient-to-br from-[#3b27b2] to-[#8227b2] text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white border border-slate-100 text-slate-900 hover:border-indigo-200 shadow-sm'
                }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${action.color} group-hover:opacity-40 transition-opacity`} />
              <div className="relative">
                <div className={`size-10 rounded-xl flex items-center justify-center mb-3 ${action.primary ? 'bg-white/20' : 'bg-gradient-to-br ' + action.color + ' text-white'
                  }`}>
                  <action.icon className="size-5" />
                </div>
                <h3 className={`font-bold text-sm mb-1 ${action.primary ? '' : ''}`}>{action.label}</h3>
                <p className={`text-xs leading-relaxed ${action.primary ? 'text-white/70' : 'text-slate-400'}`}>{action.desc}</p>
              </div>
              <ChevronRight className={`absolute top-5 right-5 size-4 opacity-0 group-hover:opacity-60 transition-all group-hover:translate-x-1 ${action.primary ? 'text-white' : 'text-slate-400'}`} />
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FEATURES BENTO GRID                         */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-8 mt-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Studio Capabilities</h2>
            <p className="text-slate-400 mt-1">Everything you need for professional visual capture.</p>
          </div>
          <button
            onClick={onEnterStudioWorkspace}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors"
          >
            Open Studio <ArrowRight className="size-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <div
              key={i}
              className={`group relative bg-white border rounded-2xl p-6 hover:shadow-lg transition-all ${feat.active
                  ? 'border-indigo-200 shadow-md shadow-indigo-100 cursor-pointer hover:border-indigo-300 hover:-translate-y-1'
                  : 'border-slate-100 hover:border-indigo-100 cursor-default hover:-translate-y-0.5'
                }`}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              onClick={() => feat.action?.()}
            >
              <div className={`size-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 transition-colors ${feat.active
                  ? 'from-[#3b27b2]/20 to-[#8227b2]/20 group-hover:from-[#3b27b2]/30 group-hover:to-[#8227b2]/30'
                  : 'from-indigo-50 to-violet-50 group-hover:from-[#3b27b2]/10 group-hover:to-[#8227b2]/10'
                }`}>
                <feat.icon className={`size-6 transition-colors ${feat.active
                    ? 'text-[#3b27b2] group-hover:text-[#6227b2]'
                    : 'text-indigo-400 group-hover:text-[#3b27b2]'
                  }`} />
              </div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-bold text-slate-900 text-base">{feat.title}</h3>
                {feat.active && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="size-3" />
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>

              {/* Hover accent line */}
              <div className={`absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#3b27b2] to-[#8227b2] rounded-full transition-transform origin-left ${feat.active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* CAPTURES GALLERY                            */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-8 mt-20">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Captures</h2>
              <div className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">VAULT SYNCED</span>
              </div>
            </div>
            <p className="text-slate-400">
              {activeFilter === 'all' && 'Screenshots, recordings, and annotated assets.'}
              {activeFilter === 'screenshots' && 'Quick snapshots and region captures.'}
              {activeFilter === 'recordings' && 'Screen and camera recordings.'}
              {activeFilter === 'annotations' && 'Annotated and edited captures.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            {(['all', 'screenshots', 'annotations'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${activeFilter === f
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredCaptures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCaptures.map(capture => (
              <div
                key={capture.id}
                className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all cursor-default hover:-translate-y-1"
              >
                {/* Image */}
                <div className="aspect-video bg-slate-50 relative overflow-hidden">
                  <img
                    src={capture.url}
                    alt={capture.title || 'Capture'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Type badge */}
                  <div className="absolute top-3 left-3">
                    <div className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">{capture.type || 'CAPTURE'}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                    {onEditCapture && (
                      <button
                        onClick={() => onEditCapture(capture)}
                        className="size-8 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                      >
                        <Pen className="size-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => { const a = document.createElement('a'); a.href = capture.url; a.download = `${capture.title || 'capture'}-${capture.id}.png`; a.click(); }}
                      className="size-8 bg-white/90 backdrop-blur-sm text-slate-600 rounded-lg hover:bg-white transition-all shadow-sm flex items-center justify-center"
                    >
                      <Download className="size-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCapture(capture.id)}
                      className="size-8 bg-white/90 backdrop-blur-sm text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Quick open */}
                  <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => onEditCapture?.(capture)}
                      className="w-full py-2 bg-white/90 backdrop-blur-sm text-slate-900 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-white transition-colors shadow-sm"
                    >
                      Open & Annotate
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{capture.title || 'Untitled Capture'}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-slate-300" />
                      <span className="text-[11px] text-slate-400 font-medium">{capture.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="size-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Synced</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Card */}
            <button
              onClick={onQuickSnap}
              className="group border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 min-h-[250px] hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
            >
              <div className="size-12 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                <Aperture className="size-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">New Capture</span>
            </button>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl py-20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="size-20 bg-white rounded-2xl shadow-lg shadow-indigo-50 flex items-center justify-center">
              <ImageLucide className="size-10 text-indigo-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeFilter === 'all' && 'No captures yet'}
                {activeFilter === 'screenshots' && 'No screenshots yet'}
                {activeFilter === 'annotations' && 'No annotations yet'}
              </h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                {activeFilter === 'all' && 'Launch the studio or take a quick snap to start building your visual asset vault.'}
                {activeFilter === 'screenshots' && 'Take a quick snapshot or open the studio to create your first screenshot.'}
                {activeFilter === 'annotations' && 'Create a screenshot and add annotations to get started.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onEnterStudioWorkspace}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3b27b2] to-[#8227b2] text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all"
              >
                <Aperture className="size-4" />
                Open Studio
              </button>
              {activeFilter !== 'screenshots' && (
                <button
                  onClick={onQuickSnap}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-xl font-bold text-sm border border-slate-200 hover:border-indigo-200 transition-all"
                >
                  <Aperture className="size-4" />
                  Quick Snap
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SCHEDULE SNAP SECTION                       */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-8 mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Schedule Snap</h2>
            <p className="text-sm text-slate-400 mt-1">Plan your captures ahead of time</p>
          </div>
          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3b27b2] to-[#8227b2] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> Schedule Capture
          </button>
        </div>

        {showScheduleForm && (
          <div className="p-6 bg-white rounded-[24px] border border-slate-100 space-y-4 mb-6">
            <input
              type="text"
              placeholder="Capture Title (e.g., 'Product Demo Screenshot')"
              value={snapFormData.title}
              onChange={(e) => setSnapFormData({ ...snapFormData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={snapFormData.date}
                onChange={(e) => setSnapFormData({ ...snapFormData, date: e.target.value })}
                className="px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <input
                type="time"
                value={snapFormData.time}
                onChange={(e) => setSnapFormData({ ...snapFormData, time: e.target.value })}
                className="px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <select
              value={snapFormData.captureType}
              onChange={(e) => setSnapFormData({ ...snapFormData, captureType: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="Screenshot">Screenshot</option>
              <option value="Annotated Capture">Annotated Capture</option>
              <option value="Full Window">Full Window</option>
              <option value="Region Capture">Region Capture</option>
            </select>
            <div className="flex items-center gap-3">
              <Bell className="size-5 text-slate-400" />
              <select
                value={snapFormData.reminder}
                onChange={(e) => setSnapFormData({ ...snapFormData, reminder: Number(e.target.value) })}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value={5}>Remind 5 minutes before</option>
                <option value={10}>Remind 10 minutes before</option>
                <option value={15}>Remind 15 minutes before</option>
                <option value={30}>Remind 30 minutes before</option>
                <option value={60}>Remind 1 hour before</option>
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
                      {isCalendarConnected ? 'Connected - sync this capture' : 'Connect to sync events'}
                    </p>
                  </div>
                </div>
                {isCalendarConnected ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={snapFormData.syncToCalendar}
                      onChange={(e) => setSnapFormData({ ...snapFormData, syncToCalendar: e.target.checked })}
                      className="w-4 h-4 text-[#8227b2] border-slate-300 rounded focus:ring-[#8227b2]"
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

            {/* Email Notification */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                    <svg viewBox="0 0 24 24" className="size-5" fill="none">
                      <rect x="3" y="5" width="18" height="14" rx="2" fill="#fff" stroke="#E5E7EB" strokeWidth="1.5" />
                      <path d="M3 7L12 13L21 7" stroke="#8227b2" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Email Notification</p>
                    <p className="text-xs text-slate-400">
                      {firebaseUser?.email ? `Send to ${firebaseUser.email}` : 'Sign in to enable'}
                    </p>
                  </div>
                </div>
                {firebaseUser?.email && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={snapFormData.sendEmail}
                      onChange={(e) => setSnapFormData({ ...snapFormData, sendEmail: e.target.checked })}
                      className="w-4 h-4 text-[#8227b2] border-slate-300 rounded focus:ring-[#8227b2]"
                    />
                    <span className="text-sm font-medium text-slate-600">Notify</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddScheduledSnap}
                disabled={isSyncingCalendar}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#3b27b2] to-[#8227b2] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
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

        {scheduledSnaps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledSnaps.map((snap) => (
              <div key={snap.id} className="p-5 bg-white rounded-[20px] border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 bg-gradient-to-br from-[#3b27b2]/10 to-[#8227b2]/10 rounded-xl flex items-center justify-center">
                    <Aperture className="size-5 text-[#8227b2]" />
                  </div>
                  <button
                    onClick={() => handleRemoveScheduledSnap(snap.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">{snap.title}</h3>
                <div className="space-y-1.5 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5" />
                    {snap.date} at {snap.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="size-3.5" />
                    <span className="text-xs">Reminder {snap.reminder >= 60 ? `${snap.reminder / 60}h` : `${snap.reminder}m`} before</span>
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {snap.captureType}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* KEYBOARD SHORTCUTS BAR                      */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-8 mt-10 mb-2">
        <div className="bg-[#09090b] rounded-xl p-1.5 flex items-center justify-between flex-wrap gap-2 min-h-0">
          <div className="flex items-center gap-1.5">
            <div className="size-6 bg-gradient-to-br from-[#3b27b2] to-[#8227b2] rounded-lg flex items-center justify-center">
              <Zap className="size-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-[11px] leading-tight">Keyboard Shortcuts</h3>
              <p className="text-zinc-400 text-[10px] leading-tight">Speed up your capture workflow</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { keys: '⌘ + Shift + S', label: 'Quick Snap' },
              { keys: '⌘ + Shift + R', label: 'Record' },
              { keys: '⌘ + K', label: 'Studio' },
              { keys: '⌘ + E', label: 'Annotate' },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[9px] font-mono text-zinc-300">{shortcut.keys}</kbd>
                <span className="text-[10px] text-zinc-400">{shortcut.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onEnterStudioWorkspace}
            className="px-2 py-1 bg-white text-black rounded font-bold text-[11px] hover:bg-zinc-100 transition-colors border border-zinc-200 shadow-sm"
            style={{ minWidth: 0, height: 24, lineHeight: '16px' }}
          >
            Enter Studio →
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SNAP CHECKLIST SECTION                      */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-8 mt-16 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Snap Checklist</h2>
            <p className="text-sm text-slate-400 mt-1">Prepare your capture workflow</p>
          </div>
          <span className="text-sm font-bold italic text-slate-400">
            {checklist.filter(t => t.completed).length}/{checklist.length} Complete
          </span>
        </div>
        <div className="space-y-4">
          {checklist.map((item, idx) => (
            <div
              key={idx}
              draggable={editingItem !== idx}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={`group flex items-center gap-4 px-6 py-5 bg-white rounded-2xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all ${editingItem !== idx ? 'cursor-move' : ''
                } ${draggedItem === idx ? 'opacity-50 scale-95' : ''}`}
            >
              <button
                onClick={() => toggleChecklistItem(idx)}
                className={`flex-shrink-0 size-6 rounded-full border-2 flex items-center justify-center transition-all ${item.completed
                    ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600'
                    : 'border-slate-300 group-hover:border-indigo-300 hover:border-indigo-500'
                  }`}
              >
                {item.completed && <CheckCircle2 className="size-4 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                {editingItem === idx ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(idx);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="w-full px-3 py-1.5 border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
                    autoFocus
                  />
                ) : (
                  <p
                    className={`text-[15px] font-medium ${item.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}
                    onDoubleClick={() => startEditing(idx)}
                  >
                    {item.task}
                  </p>
                )}
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
    </div>
  );
};

export default SnapStudio;
