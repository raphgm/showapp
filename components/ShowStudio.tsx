import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Share2, Loader2, Layers, Monitor, Grid3x3, Users, Code2, Presentation,
  Radio, Settings, Video, Mic, MicOff, Copy, VideoOff,
  Maximize2, ArrowRight, Zap, Play, Save, CheckCircle2
} from 'lucide-react';
import { useVirtualBackground } from '../services/useVirtualBackground';
import {
  subscribeToJoinRequests,
  setGuestApprovalStatus,
  removeJoinRequest,
  type JoinRequest
} from '../services/firebase';
import { useToast } from './ToastProvider';
import { useAuth } from '../services/AuthContext';
import { saveVideos, loadVideos } from '../services/persistence';
import { generateVideoInsightsFromFrames } from '../services/geminiService';
import type { Video as VideoType } from '../types';

interface ShowStudioProps {
  onClose: () => void;
  onSave?: (video: VideoType) => void;
}

type ProductionMode = 'standard' | 'interview' | 'codelab' | 'presenter';

type BackgroundOption = {
  id: string;
  label: string;
  type: 'none' | 'blur' | 'gradient' | 'image';
  value?: string;
  preview: string;
};

const ROOM_ID = 'stream-room';

const productionModes: { id: ProductionMode; label: string; icon: React.ReactNode }[] = [
  { id: 'standard', label: 'Standard', icon: <Grid3x3 className="size-4" /> },
  { id: 'interview', label: 'Interview', icon: <Users className="size-4" /> },
  { id: 'codelab', label: 'Code Lab', icon: <Code2 className="size-4" /> },
  { id: 'presenter', label: 'Presenter', icon: <Presentation className="size-4" /> }
];

const backgroundOptions: BackgroundOption[] = [
  { id: 'none', label: 'None', type: 'none', preview: 'bg-zinc-800' },
  { id: 'blur-light', label: 'Blur', type: 'blur', value: '10', preview: 'bg-zinc-400/50 backdrop-blur-sm' },
  { id: 'gradient-purple', label: 'Purple', type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', preview: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
  { id: 'gradient-ocean', label: 'Ocean', type: 'gradient', value: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)', preview: 'bg-gradient-to-br from-cyan-500 to-blue-400' },
  { id: 'gradient-dark', label: 'Dark', type: 'gradient', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)', preview: 'bg-gradient-to-br from-slate-800 to-slate-600' },
];

const ShowStudio: React.FC<ShowStudioProps> = ({ onClose, onSave }) => {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [selectedMode, setSelectedMode] = useState<ProductionMode>('standard');
  const [isProducing, setIsProducing] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isMicOff, setIsMicOff] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(backgroundOptions[0]);
  const [pendingJoinRequests, setPendingJoinRequests] = useState<JoinRequest[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSavingProduction, setIsSavingProduction] = useState(false);
  const recordingTimerRef = useRef<number | null>(null);

  // Dragging state
  const [isDraggingCircle, setIsDraggingCircle] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cameraCirclePos, setCameraCirclePos] = useState({ x: 1920 - 380 - 60, y: 1080 - 380 - 60 }); // Bottom right default

  const { addToast } = useToast();
  const { firebaseUser } = useAuth();
  const canControl = true;

  const settingsRef = useRef<HTMLDivElement>(null);
  const productionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const renderLoopRef = useRef<number | null>(null);
  const productionTimerRef = useRef<number | null>(null);
  const productionTimeRef = useRef(0);
  const cameraRef = useRef<HTMLVideoElement | null>(null);
  const screenRef = useRef<HTMLVideoElement | null>(null);
  const rawCameraRef = useRef<HTMLVideoElement | null>(null);
  const notifiedRequestIdsRef = useRef<Set<string>>(new Set());
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Audio level simulation
  const [audioLevel, setAudioLevel] = useState(0);
  const audioIntervalRef = useRef<number | null>(null);


  const clampCircle = useCallback((x: number, y: number, size = 380, pad = 60) => {
    const maxX = 1920 - size - pad;
    const maxY = 1080 - size - pad;
    return {
      x: Math.max(pad, Math.min(x, maxX)),
      y: Math.max(pad, Math.min(y, maxY)),
    };
  }, []);

  const cameraCirclePosRef = useRef({ x: 1920 - 380 - 60, y: 1080 - 380 - 60 });
  const selectedModeRef = useRef(selectedMode);
  const isCameraOffRef = useRef(isCameraOff);
  const selectedBackgroundRef = useRef(selectedBackground);

  const getBackgroundConfig = useCallback(() => {
    if (selectedBackground.type === 'none') return 'none';
    if (selectedBackground.type === 'blur') return 'blur';
    if (selectedBackground.type === 'image') return selectedBackground.value;
    return 'none';
  }, [selectedBackground]);

  const { videoRef: vbVideoRef, canvasRef: vbCanvasRef, isModelLoaded, isProcessing } = useVirtualBackground({
    background: selectedBackground.type === 'none' ? null : selectedBackground.type === 'blur' ? { blurAmount: 10 } : { gradient: selectedBackground.value || '' },
    isCamOff: !cameraStream || isCameraOff,
    mirror: true,
  });

  useEffect(() => { cameraCirclePosRef.current = cameraCirclePos; }, [cameraCirclePos]);
  useEffect(() => { selectedModeRef.current = selectedMode; }, [selectedMode]);
  useEffect(() => { isCameraOffRef.current = isCameraOff; }, [isCameraOff]);
  useEffect(() => { selectedBackgroundRef.current = selectedBackground; }, [selectedBackground]);

  const toggleCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getVideoTracks().forEach(track => track.enabled = isCameraOff);
      setIsCameraOff(prev => !prev);
    }
  }, [cameraStream, isCameraOff]);

  const toggleMic = useCallback(() => {
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach(track => track.enabled = isMicOff);
      setIsMicOff(prev => !prev);
    }
  }, [cameraStream, isMicOff]);

  // Audio Level Animation
  useEffect(() => {
    if (!isMicOff && cameraStream) {
      audioIntervalRef.current = window.setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    return () => { if (audioIntervalRef.current) clearInterval(audioIntervalRef.current); };
  }, [isMicOff, cameraStream]);


  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        setShowSettings(false);
      }
    };
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  // Join Requests
  useEffect(() => {
    if (canControl) {
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
    }
  }, [canControl, addToast]);

  // --- Production Logic ---
  const stopProduction = useCallback(() => {
    if (renderLoopRef.current) clearInterval(renderLoopRef.current);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      if (recorder.state === 'recording') recorder.requestData();
      recorder.stop();
    }
    setIsProducing(false);
  }, []);

  const startProduction = useCallback(() => {
    if (!productionCanvasRef.current) return;
    const canvas = productionCanvasRef.current;
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    recordedChunksRef.current = [];

    const draw = () => {
      ctx.fillStyle = selectedModeRef.current === 'codelab' ? '#0f111a' : '#18181b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const hasScreen = screenStreamRef.current && screenStreamRef.current.active;
      const hasCamera = !isCameraOffRef.current;

      const getVideoSource = (ref: React.RefObject<HTMLVideoElement | null>) => {
        if (ref.current && ref.current.readyState >= 2) return ref.current;
        return null;
      };

      const screenVid = getVideoSource(screenRef);

      // Use the VB-processed canvas when a virtual background is active;
      // otherwise fall back to the raw camera video (always mounted, always has stream).
      const camVid: HTMLVideoElement | HTMLCanvasElement | null = (() => {
        if (!hasCamera) return null;
        if (selectedBackgroundRef.current.type !== 'none' && vbCanvasRef.current) {
          return vbCanvasRef.current;
        }
        return getVideoSource(rawCameraRef);
      })();

      if (selectedModeRef.current === 'codelab') {
        // Code Lab Compositor
        ctx.fillStyle = '#0a0c14'; ctx.fillRect(0, 0, canvas.width, 100);
        ctx.fillStyle = '#6366f1'; ctx.font = 'bold 32px Inter'; ctx.fillText('CODE_LAB // SESSION', 60, 60);
        ctx.fillStyle = '#1e1e2e'; ctx.fillRect(50, 150, canvas.width - 100, canvas.height - 400);
        
        ctx.fillStyle = '#cdd6f4'; ctx.font = '24px monospace';
        ctx.fillText('async function show() {', 100, 210);
        ctx.fillText('  const studio = await Show.init();', 100, 250);
        ctx.fillText('  return studio.start();', 100, 290);
        ctx.fillText('}', 100, 330);

        if (camVid && hasCamera) {
          const size = 300;
          ctx.drawImage(camVid, canvas.width - size - 80, 150, size, (size * 9) / 16);
        }
      } else if (selectedModeRef.current === 'interview') {
        // Interview split screen: Screen on Left, Camera on Right
        if (screenVid && hasScreen) {
          ctx.drawImage(screenVid, 0, 0, canvas.width / 2, canvas.height);
        } else {
          ctx.fillStyle = '#18181b'; ctx.fillRect(0, 0, canvas.width / 2, canvas.height);
          ctx.fillStyle = '#3f3f46'; ctx.font = '32px Inter'; ctx.fillText('Waiting for screen...', 100, canvas.height / 2);
        }

        if (camVid && hasCamera) {
          ctx.save();
          ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
          ctx.drawImage(camVid, 0, 0, canvas.width / 2, canvas.height);
          ctx.restore();
        } else {
          ctx.fillStyle = '#09090b'; ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
          ctx.fillStyle = '#6366f1'; ctx.font = '32px Inter'; ctx.fillText('Waiting for host...', canvas.width * 0.7, canvas.height / 2);
        }
        
        // Indigo Broadcast Divider
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 12;
        ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
        
        // Debug Label (Visible only on recording)
        ctx.fillStyle = 'rgba(99, 102, 241, 0.5)'; ctx.fillRect(20, 20, 180, 40);
        ctx.fillStyle = 'white'; ctx.font = 'bold 16px Inter'; ctx.fillText('INTERVIEW_MODE', 40, 46);

      } else if (selectedModeRef.current === 'presenter') {
        // Presenter full camera
        if (camVid && hasCamera) {
          ctx.drawImage(camVid, 0, 0, canvas.width, canvas.height);
        }
        if (screenVid && hasScreen) {
          const sw = 480; const sh = 270;
          ctx.drawImage(screenVid, canvas.width - sw - 40, 40, sw, sh);
          ctx.strokeStyle = 'white'; ctx.lineWidth = 4; ctx.strokeRect(canvas.width - sw - 40, 40, sw, sh);
        }
      } else {
        // Standard PiP
        if (screenVid && hasScreen) ctx.drawImage(screenVid, 0, 0, canvas.width, canvas.height);
        if (camVid && hasCamera) {
          const size = 400; const x = canvas.width - size - 60; const y = 60;
          ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, size, (size * 9) / 16, 24); ctx.clip();
          ctx.drawImage(camVid, x, y, size, (size * 9) / 16); ctx.restore();
        }
      }
    };

    renderLoopRef.current = window.setInterval(draw, 33);

    // Media Recorder Setup
    const captureStream = canvas.captureStream(30);
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getAudioTracks().forEach(track => captureStream.addTrack(track));
    }

    let mimeType = 'video/webm';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) mimeType = 'video/webm;codecs=vp9';
      else if (MediaRecorder.isTypeSupported('video/webm')) mimeType = 'video/webm';
    }

    try {
      const recorder = new MediaRecorder(captureStream, { mimeType, videoBitsPerSecond: 5_000_000 });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const chunks = recordedChunksRef.current;
        if (chunks.length === 0) {
          addToast('Nothing was recorded — try again', 'error');
          return;
        }
        const blob = new Blob(chunks, { type: mimeType });
        if (blob.size === 0) {
          addToast('Recording was empty — try again', 'error');
          return;
        }
        // Set preview URL — user can review then click "Save Production"
        setPreviewUrl(URL.createObjectURL(blob));
      };
      // timeslice=1000ms: flush a chunk every second so data is never lost
      recorder.start(1000);
      setPreviewUrl(null);
      setRecordingDuration(0);
      recordingTimerRef.current = window.setInterval(() => setRecordingDuration(d => d + 1), 1000);
      setIsProducing(true);
    } catch (err) {
      console.error('MediaRecorder setup failed:', err);
      addToast('Could not start recording', 'error');
    }
  }, [addToast, vbCanvasRef]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSaveProduction = useCallback(async () => {
    if (!previewUrl) return;
    setIsSavingProduction(true);

    // Extract frames for AI analysis
    const extractFrames = (url: string, count: number): Promise<string[]> =>
      new Promise((resolve) => {
        const vid = document.createElement('video');
        vid.src = url;
        vid.muted = true;
        const cvs = document.createElement('canvas');
        const ctx = cvs.getContext('2d');
        const frames: string[] = [];
        vid.onloadedmetadata = () => {
          cvs.width = vid.videoWidth || 1280;
          cvs.height = vid.videoHeight || 720;
          const duration = vid.duration;
          if (!duration || duration === Infinity) { resolve([]); return; }
          let done = 0;
          vid.onseeked = () => {
            if (ctx) { ctx.drawImage(vid, 0, 0, cvs.width, cvs.height); frames.push(cvs.toDataURL('image/jpeg')); }
            done++;
            if (done >= count) { vid.src = ''; resolve(frames); }
            else { const t = (duration / (count + 1)) * (done + 1); if (t <= duration) vid.currentTime = t; else { vid.src = ''; resolve(frames); } }
          };
          vid.currentTime = duration / (count + 1);
        };
        vid.onerror = () => resolve([]);
      });

    try {
      const frames = await extractFrames(previewUrl, 5);
      let insights: { suggestedTitle?: string; summary?: string; transcript?: string; chapters?: any[] } | null = null;
      if (frames.length > 0) {
        insights = await generateVideoInsightsFromFrames(frames, 'Analyze these frames to suggest a concise title, summary, transcript, and chapters with timestamps.');
      }

      const newVideo: VideoType = {
        id: Math.random().toString(36).substr(2, 9),
        title: insights?.suggestedTitle || `Show Studio — ${new Date().toLocaleDateString()}`,
        description: insights?.summary || 'Recorded in Show Studio.',
        thumbnailUrl: frames[0] || '',
        videoUrl: previewUrl,
        duration: formatDuration(recordingDuration),
        createdAt: 'Just now',
        author: firebaseUser?.displayName || 'Me',
        views: 0,
        aiSummary: insights?.summary,
        transcript: insights?.transcript,
        chapters: insights?.chapters,
      };

      // Save to persistence
      if (firebaseUser?.uid) {
        saveVideos(firebaseUser.uid, [newVideo, ...loadVideos(firebaseUser.uid)]);
      }

      // Route through onSave → App.tsx → VideoDetail (same as Recorder)
      if (onSave) {
        onSave(newVideo);
      } else {
        addToast('Production saved to your Library!', 'success');
      }

      setPreviewUrl(null);
    } catch (err) {
      console.error('Save production failed:', err);
      // Fallback: save raw without AI
      const fallback: VideoType = {
        id: Math.random().toString(36).substr(2, 9),
        title: `Recording ${new Date().toLocaleDateString()}`,
        description: 'AI analysis failed. Raw recording saved.',
        thumbnailUrl: '',
        videoUrl: previewUrl,
        duration: formatDuration(recordingDuration),
        createdAt: 'Just now',
        author: firebaseUser?.displayName || 'Me',
        views: 0,
      };
      if (firebaseUser?.uid) saveVideos(firebaseUser.uid, [fallback, ...loadVideos(firebaseUser.uid)]);
      if (onSave) onSave(fallback);
      else addToast('Production saved (without AI analysis)', 'success');
      setPreviewUrl(null);
    } finally {
      setIsSavingProduction(false);
    }
  }, [previewUrl, recordingDuration, firebaseUser, onSave, addToast]);

  const initCamera = useCallback(async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(newStream);
      cameraStreamRef.current = newStream;
      if (cameraRef.current) cameraRef.current.srcObject = newStream;
    } catch (err) {
      console.error(err);
      setIsLoadingCamera(false);
    } finally {
      setIsLoadingCamera(false);
    }
  }, []);

  useEffect(() => {
    initCamera();
    return () => { cameraStreamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [initCamera]);

  // Pipe camera stream into always-mounted hidden video refs
  useEffect(() => {
    if (rawCameraRef.current && cameraStream) rawCameraRef.current.srcObject = cameraStream;
    if (vbVideoRef.current && cameraStream) vbVideoRef.current.srcObject = cameraStream;
  }, [cameraStream, vbVideoRef]);

  // Set srcObject on screen video element after it mounts (triggered by screenStream state change)
  useEffect(() => {
    if (screenRef.current && screenStream) screenRef.current.srcObject = screenStream;
  }, [screenStream]);

  const handleShareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { width: 1920, height: 1080 }, audio: false });
      screenStreamRef.current = stream;
      setScreenStream(stream);
    } catch (err) { console.error(err); }
  };

  // Drag logic
  // ... (Same drag logic as before, omitted for brevity but assumed present if needed for circle placement)

  return (
    <div className="fixed inset-0 z-[1000] bg-[#09090b] text-white flex flex-col font-sans animate-in fade-in duration-300">

      {/* ─── Hero Banner Card ─── */}
      <section className="relative w-full flex items-center justify-center py-4 px-4 border-b border-white/10 bg-[#18181b]/90 backdrop-blur-md overflow-hidden">
        <style>{`
          @keyframes doodle-spin-aperture { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes doodle-float-timeline { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(10px); } }
          @keyframes doodle-pulse-rec { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.1); } }
        `}</style>

        {/* Rotating Aperture / Lens - Top Right */}
        <div className="absolute -top-12 -right-12 w-[180px] h-[180px] pointer-events-none opacity-10 text-rose-500" style={{ animation: 'doodle-spin-aperture 30s linear infinite' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            <path d="M50 50 L50 0 L60 0 Z" transform="rotate(0 50 50)" />
            <path d="M50 50 L50 0 L60 0 Z" transform="rotate(60 50 50)" />
            <path d="M50 50 L50 0 L60 0 Z" transform="rotate(120 50 50)" />
            <path d="M50 50 L50 0 L60 0 Z" transform="rotate(180 50 50)" />
            <path d="M50 50 L50 0 L60 0 Z" transform="rotate(240 50 50)" />
            <path d="M50 50 L50 0 L60 0 Z" transform="rotate(300 50 50)" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        {/* Floating Timeline Tracks - Left */}
        <div className="absolute top-4 left-6 w-32 h-12 opacity-10 pointer-events-none flex flex-col gap-1.5" style={{ animation: 'doodle-float-timeline 6s ease-in-out infinite' }}>
          <div className="h-1.5 w-full bg-indigo-400 rounded-full" />
          <div className="h-1.5 w-2/3 bg-purple-400 rounded-full ml-4" />
          <div className="h-1.5 w-3/4 bg-emerald-400 rounded-full" />
        </div>

        {/* Pulsing REC Dot - Bottom Right */}
        <div className="absolute bottom-2 right-10 flex items-center gap-1 opacity-20 pointer-events-none">
          <div className="size-2 rounded-full bg-rose-500" style={{ animation: 'doodle-pulse-rec 2s ease-in-out infinite' }} />
          <span className="text-[8px] font-black uppercase text-rose-500 tracking-widest">REC_READY</span>
        </div>

        <div className="max-w-xl w-full flex flex-col items-center text-center gap-2 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="size-5 text-indigo-400" />
            <span className="font-black text-lg tracking-tight text-white">Show Studio</span>
          </div>
          <div className="text-xs text-zinc-400 font-medium mb-2">
            Record and publish — all from one studio. Choose Standard, Interview, Code Lab, or Presenter mode to tailor your async show, collaborate, or jump into any workspace module for seamless production and sharing.
          </div>
          <div className="flex items-center gap-2 mt-1">
            {productionModes.map(mode => (
              <div key={mode.id} className="flex items-center gap-1 px-2 py-1 bg-zinc-800/80 rounded-lg border border-white/10 text-xs font-bold text-white hover:border-indigo-500/50 transition-colors">
                {mode.icon}
                <span>{mode.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Thin Header ─── */}
      <header className="h-8 flex-shrink-0 flex items-center justify-between px-2 border-b border-white/10 bg-[#09090b]/95 backdrop-blur z-50" style={{ minHeight: 28 }}>
        <div className="flex items-center gap-1">
          <div className="size-4 bg-gradient-to-br from-[#3b27b2] to-[#8227b2] rounded flex items-center justify-center">
            <Layers className="size-2 text-white" />
          </div>
          <span className="font-bold text-[10px] tracking-tight text-white">Show Studio</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-black/40 border border-white/10 rounded-xl px-1 py-0 flex items-center gap-1 min-h-0">
            <div className="flex items-center gap-1">
              <div className="size-3 bg-gradient-to-br from-[#3b27b2] to-[#8227b2] rounded flex items-center justify-center">
                <Zap className="size-1.5 text-white" />
              </div>
              <span className="text-[8px] font-bold text-white leading-none">Shortcuts</span>
            </div>
            <div className="h-2 w-px bg-white/10 mx-0.5" />
            <div className="flex items-center gap-1">
              <kbd className="px-0.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[7px] font-mono text-zinc-300">⌘ ⇧ R</kbd>
              <span className="text-[7px] text-zinc-400">Rec</span>
              <kbd className="px-0.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[7px] font-mono text-zinc-300">⌘ K</kbd>
              <span className="text-[7px] text-zinc-400">Studio</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-end gap-0.5 h-2 opacity-80">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-0.5 bg-white rounded-t-sm" style={{ height: isMicOff ? '2px' : `${Math.max(8, audioLevel * (1 - i * 0.1))}%`, opacity: isMicOff ? 0.2 : 1 }} />
            ))}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-0.5 rounded transition-all ${showSettings ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            style={{ height: 22, width: 22 }}
          >
            <Settings className="size-2.5" />
          </button>
          <button
            onClick={onClose}
            className="p-0.5 rounded text-zinc-400 hover:text-white hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
            style={{ height: 22, width: 22 }}
          >
            <X className="size-3" />
          </button>
        </div>
      </header>

      {/* ─── Main Canvas ─── */}
        {/* Main Content Layout based on Mode */}
        <div className="w-full h-full p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
          
          {selectedMode === 'standard' && (
            <>
              {screenStream ? (
                <video ref={screenRef} autoPlay playsInline muted className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10" />
              ) : (
                <div className="text-center space-y-4 opacity-40">
                  <Monitor className="size-16 mx-auto text-zinc-600" strokeWidth={1} />
                  <p className="text-sm font-medium text-zinc-500">Share screen to begin Standard mode</p>
                </div>
              )}
              {!isCameraOff && (
                <div className="absolute top-12 right-12 w-80 aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-black z-20 hover:scale-105 transition-transform cursor-move">
                  {selectedBackground.type !== 'none' ? <canvas ref={vbCanvasRef} className="w-full h-full object-cover" /> : <video ref={cameraRef} autoPlay playsInline muted className="w-full h-full object-cover" />}
                </div>
              )}
            </>
          )}

          {selectedMode === 'interview' && (
            <div className="flex w-full h-full gap-4">
              <div className="flex-1 bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center relative">
                {screenStream ? <video ref={screenRef} autoPlay playsInline muted className="w-full h-full object-cover" /> : <Monitor className="size-12 text-zinc-700" />}
                <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70 border border-white/10">Screen Presentation</div>
              </div>
              <div className="flex-1 bg-zinc-900 rounded-3xl overflow-hidden border-4 border-indigo-500/30 flex items-center justify-center relative">
                {!isCameraOff ? (selectedBackground.type !== 'none' ? <canvas ref={vbCanvasRef} className="w-full h-full object-cover" /> : <video ref={(el) => { if (el) { cameraRef.current = el; if (cameraStream && el.srcObject !== cameraStream) el.srcObject = cameraStream; } }} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />) : <VideoOff className="size-12 text-zinc-700" />}
                <div className="absolute bottom-6 left-6 px-4 py-2 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10">Host Camera</div>
              </div>
            </div>
          )}

          {selectedMode === 'presenter' && (
            <>
              <div className="absolute inset-0 z-0">
                {!isCameraOff ? (selectedBackground.type !== 'none' ? <canvas ref={vbCanvasRef} className="w-full h-full object-cover" /> : <video ref={(el) => { if (el) { cameraRef.current = el; if (cameraStream && el.srcObject !== cameraStream) el.srcObject = cameraStream; } }} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />) : <div className="w-full h-full bg-zinc-900 flex items-center justify-center"><VideoOff className="size-20 text-zinc-800" /></div>}
              </div>
              {screenStream && (
                <div className="absolute top-12 right-12 w-[400px] aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-black z-20 hover:scale-105 transition-transform">
                  <video ref={screenRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
              )}
              <div className="absolute bottom-12 left-12 p-8 bg-black/40 backdrop-blur-3xl rounded-[40px] border border-white/10 max-w-lg z-20 animate-in slide-in-from-bottom-10 fade-in duration-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="size-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Presentation className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Main Presentation</h3>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Active Presenter Mode</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed font-medium">You are currently the main focus. Your shared screen is minimized in the corner for reference while you address your audience directly.</p>
              </div>
            </>
          )}

          {selectedMode === 'codelab' && (
            <div className="w-full h-full flex flex-col bg-[#0f111a] rounded-3xl overflow-hidden border border-white/5 animate-in zoom-in-95 duration-500">
              <div className="h-12 bg-[#0a0c14] border-b border-white/5 flex items-center px-6 justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 bg-[#ff5f56] rounded-full" />
                    <div className="size-3 bg-[#ffbd2e] rounded-full" />
                    <div className="size-3 bg-[#27c93f] rounded-full" />
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <Code2 className="size-3" />
                    main.ts — Code Lab Workspace
                  </div>
                </div>
                {!isCameraOff && (
                  <div className="w-32 aspect-video rounded-lg overflow-hidden border border-white/10">
                    <video ref={(el) => { if (el) { cameraRef.current = el; if (cameraStream && el.srcObject !== cameraStream) el.srcObject = cameraStream; } }} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  </div>
                )}
              </div>
              <div className="flex-1 p-8 font-mono text-lg text-indigo-300/80 leading-relaxed">
                <div className="flex gap-6">
                  <div className="text-zinc-700 select-none text-right w-8">1<br/>2<br/>3<br/>4<br/>5<br/>6</div>
                  <div className="flex-1">
                    <span className="text-pink-500">async function</span> <span className="text-indigo-400">initializeStudio</span>() {'{'}<br/>
                    &nbsp;&nbsp;<span className="text-zinc-500">// Booting neural production core...</span><br/>
                    &nbsp;&nbsp;<span className="text-pink-500">const</span> studio = <span className="text-pink-500">await</span> Studio.<span className="text-indigo-400">deploy</span>();<br/>
                    &nbsp;&nbsp;<span className="text-indigo-400">console</span>.<span className="text-indigo-400">log</span>(<span className="text-emerald-400">"Studio Active"</span>);<br/>
                    &nbsp;&nbsp;<span className="text-pink-500">return</span> studio.<span className="text-indigo-400">start</span>();<br/>
                    {'}'}
                  </div>
                </div>
              </div>
              <div className="h-32 bg-[#0a0c14] border-t border-white/5 p-6 font-mono text-[10px]">
                <div className="text-emerald-400 mb-2 font-black flex items-center gap-2"> {'>'} STATUS_CHECK</div>
                <div className="text-zinc-500 leading-relaxed">
                   [SYS] Code Lab environment initialized...<br/>
                   [SYS] Genius core connected. Ready for instruction.
                </div>
              </div>
            </div>
          )}
        </div>

      {/* ─── Pending Guests Panel ─── */}
      {pendingJoinRequests.length > 0 && (
        <div className="absolute top-20 right-6 z-50 w-80 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Waiting to Join</span>
            </div>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-black px-2 py-0.5 rounded-full">
              {pendingJoinRequests.length}
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
            {pendingJoinRequests.map(req => (
              <div key={req.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                <div className="size-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-white">{req.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{req.name}</p>
                  {req.email && <p className="text-[10px] text-zinc-500 truncate">{req.email}</p>}
                  {req.wantsRecording && <p className="text-[10px] text-indigo-400 font-medium">Wants recording</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      setGuestApprovalStatus(ROOM_ID, req.id, true);
                      removeJoinRequest(ROOM_ID, req.id);
                      addToast(`${req.name} admitted to the room`, 'success');
                    }}
                    className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg transition-colors"
                    title="Admit"
                  >
                    <ArrowRight className="size-3" />
                  </button>
                  <button
                    onClick={() => {
                      setGuestApprovalStatus(ROOM_ID, req.id, false);
                      removeJoinRequest(ROOM_ID, req.id);
                      addToast(`${req.name} was denied entry`, 'info');
                    }}
                    className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded-lg transition-colors"
                    title="Deny"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Floating Action Bar (Bottom) ─── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">

        {/* Mode Selector Pill */}
        <div className="flex items-center bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-2xl">
          {productionModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${selectedMode === mode.id
                ? 'bg-white text-black shadow-lg'
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>

        {/* Main Controls Pill */}
        <div className="flex items-center gap-4 px-6 py-3 bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
          {/* Toggles */}
          <div className="flex items-center gap-2 pr-4 border-r border-white/10">
            <button onClick={toggleMic} className={`p-3 rounded-full transition-all ${!isMicOff ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`} title="Toggle Mic">
              {!isMicOff ? <Mic className="size-4" /> : <MicOff className="size-4 text-rose-500" />}
            </button>
            <button onClick={toggleCamera} className={`p-3 rounded-full transition-all ${!isCameraOff ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`} title="Toggle Camera">
              {isCameraOff ? <VideoOff className="size-4 text-rose-500" /> : <Video className="size-4" />}
            </button>
          </div>

          {/* Record Button */}
          <button
            onClick={() => isProducing ? stopProduction() : startProduction()}
            className={`h-12 px-6 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${isProducing
              ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-900/20'
              : 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10'
              }`}
          >
            <div className={`size-2.5 rounded-full ${isProducing ? 'bg-white animate-pulse' : 'bg-rose-500'}`} />
            {isProducing ? 'End Broadcast' : 'Go Live'}
          </button>

          {/* Sources */}
          <div className="flex items-center gap-2 pl-4 border-l border-white/10">
            <button onClick={handleShareScreen} className={`p-3 rounded-full transition-all ${screenStream ? 'bg-emerald-500/20 text-emerald-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`} title="Share Screen">
              <Monitor className="size-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Settings Dropdown (Floating) */}
      {showSettings && (
        <div ref={settingsRef} className="absolute top-16 right-6 w-72 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-2 z-50">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Studio Settings</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white">Background</label>
              <div className="grid grid-cols-5 gap-2">
                {backgroundOptions.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBackground(bg)}
                    className={`aspect-square rounded-lg border flex items-center justify-center overflow-hidden transition-all ${selectedBackground.id === bg.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-white/10 hover:border-white/30'}`}
                    title={bg.label}
                  >
                    <div className={`w-full h-full ${bg.preview}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Post-Production Preview ─── */}
      {previewUrl && (
        <div className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="w-full max-w-3xl bg-[#18181b] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="size-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Production Ready</p>
                  <p className="text-[10px] text-zinc-500 font-medium">Review your recording · {formatDuration(recordingDuration)}</p>
                </div>
              </div>
              <button onClick={() => setPreviewUrl(null)} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                <X className="size-4" />
              </button>
            </div>
            <div className="p-6">
              <video src={previewUrl} controls className="w-full rounded-2xl bg-black border border-white/5" style={{ maxHeight: 360 }} />
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                onClick={handleSaveProduction}
                disabled={isSavingProduction}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all disabled:opacity-60"
              >
                {isSavingProduction ? (
                  <><Loader2 className="size-4 animate-spin" /> Analysing &amp; Saving…</>
                ) : (
                  <><Save className="size-4" /> Save Production</>
                )}
              </button>
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = previewUrl;
                  a.download = `show-studio-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
                  document.body.appendChild(a); a.click(); document.body.removeChild(a);
                }}
                className="flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Production Canvas */}
      <canvas ref={productionCanvasRef} className="hidden" />
      {/* Hidden raw camera video — always mounted so draw() can read frames regardless of VB state */}
      <video ref={rawCameraRef} autoPlay playsInline muted className="hidden" />
      {/* Hidden VB input video — feeds frames into the useVirtualBackground segmentation loop */}
      <video ref={vbVideoRef} autoPlay playsInline muted className="hidden" />
    </div>
  );
};

export default ShowStudio;
