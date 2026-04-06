
import React, { useState, useRef, useEffect } from 'react';
import {
  Video, VideoOff, Mic, MicOff, User, Loader2, Radio,
  ArrowRight, Camera, Shield, Globe, CheckCircle2, Mail, Film,
  Settings, Image, Droplets, Check, X
} from 'lucide-react';
import { useVirtualBackground } from '../services/useVirtualBackground';
import { sendJoinRequest, subscribeToApprovalStatus } from '../services/firebase';

type BackgroundOption = {
  id: string;
  label: string;
  type: 'none' | 'blur' | 'gradient' | 'image';
  value?: string;
  preview: string;
};

const backgroundOptions: BackgroundOption[] = [
  { id: 'none', label: 'None', type: 'none', preview: 'bg-zinc-800' },
  { id: 'blur-light', label: 'Light Blur', type: 'blur', value: '10', preview: 'bg-zinc-600/50' },
  { id: 'blur-heavy', label: 'Heavy Blur', type: 'blur', value: '25', preview: 'bg-zinc-600/80' },
  { id: 'gradient-purple', label: 'Purple', type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', preview: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
  { id: 'gradient-ocean', label: 'Ocean', type: 'gradient', value: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)', preview: 'bg-gradient-to-br from-cyan-500 to-blue-400' },
  { id: 'gradient-sunset', label: 'Sunset', type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', preview: 'bg-gradient-to-br from-pink-400 to-rose-500' },
  { id: 'gradient-forest', label: 'Forest', type: 'gradient', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', preview: 'bg-gradient-to-br from-emerald-600 to-green-400' },
  { id: 'gradient-dark', label: 'Dark', type: 'gradient', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)', preview: 'bg-gradient-to-br from-zinc-800 to-zinc-600' },
];

interface GuestJoinProps {
  roomCode: string;
  onJoin: (guestName: string, guestEmail?: string, wantsRecording?: boolean) => void;
}

const GuestJoin: React.FC<GuestJoinProps> = ({ roomCode, onJoin }) => {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [wantsRecording, setWantsRecording] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(backgroundOptions[0]);
  const [approvalStatus, setApprovalStatus] = useState<'none' | 'pending' | 'denied' | 'approved'>('none');
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);

  // Build virtual background config based on selection
  const getBackgroundConfig = () => {
    if (selectedBackground.type === 'none') return null;
    if (selectedBackground.type === 'blur') return { blurAmount: parseInt(selectedBackground.value || '15') };
    if (selectedBackground.type === 'gradient') return { gradient: selectedBackground.value };
    if (selectedBackground.type === 'image') return { url: selectedBackground.value };
    return null;
  };

  const { videoRef: vbVideoRef, canvasRef: vbCanvasRef, isModelLoaded, isProcessing } = useVirtualBackground({
    background: getBackgroundConfig(),
    isCamOff: isCamOff || !stream,
    mirror: true,
  });

  // Close background picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bgPickerRef.current && !bgPickerRef.current.contains(e.target as Node)) {
        setShowBgPicker(false);
      }
    };
    if (showBgPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showBgPicker]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      .then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
        if (vbVideoRef.current) vbVideoRef.current.srcObject = s;
      })
      .catch(() => setCameraError(true));

    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (stream) {
      if (videoRef.current) videoRef.current.srcObject = stream;
      if (vbVideoRef.current) vbVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach(t => (t.enabled = !isCamOff));
    }
  }, [isCamOff, stream]);

  useEffect(() => {
    if (stream) {
      stream.getAudioTracks().forEach(t => (t.enabled = !isMuted));
    }
  }, [isMuted, stream]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    if (wantsRecording && !guestEmail.trim()) return;

    setIsJoining(true);
    // Notify host via Firebase (so they see who joined)
    const requestId = Date.now().toString();
    sendJoinRequest(roomCode, {
      id: requestId,
      name: guestName.trim(),
      email: guestEmail.trim() || '',
      timestamp: Date.now(),
      wantsRecording
    }).catch(console.error);

    // Immediately join locally, skip approval screen
    stream?.getTracks().forEach(t => t.stop());
    onJoin(guestName.trim(), guestEmail.trim() || '', wantsRecording);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0B14] flex items-center justify-center p-6 font-sans">
      {/* Background ambiance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-center">
        {/* Left — Camera Preview */}
        <div className="flex-1 w-full max-w-lg space-y-5">
          {/* Branding */}
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 bg-gradient-to-br from-[#3b27b2] via-[#8227b2] to-[#b61cc9] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Radio className="size-5" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl tracking-tight">Show</h1>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Live Session</p>
            </div>
          </div>

          {/* Camera preview card */}
          <div className="relative aspect-video bg-[#1C1E2A] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
            {/* Hidden video for virtual background processing */}
            <video
              ref={vbVideoRef}
              autoPlay
              muted
              playsInline
              className="hidden"
            />
            {!cameraError && (
              selectedBackground.type !== 'none' ? (
                <canvas
                  ref={vbCanvasRef}
                  className={`w-full h-full object-cover transition-opacity ${isCamOff ? 'opacity-0' : 'opacity-100'}`}
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover transition-opacity ${isCamOff ? 'opacity-0' : 'opacity-100'}`}
                  style={{ transform: 'scaleX(-1)' }}
                />
              )
            )}
            {(isCamOff || cameraError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#18181b] text-zinc-500 gap-4">
                <div className="size-24 bg-zinc-800 rounded-full flex items-center justify-center">
                  {guestName ? (
                    <span className="text-3xl font-black text-zinc-400">{guestName.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User className="size-10 text-zinc-600" />
                  )}
                </div>
                <span className="text-sm font-bold">{cameraError ? 'Camera unavailable' : 'Camera is off'}</span>
              </div>
            )}

            {/* Room code badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-md text-xs font-bold text-zinc-300 border border-white/10">
                Room: {roomCode}
              </span>
            </div>

            {/* Name tag */}
            {guestName && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-sm font-bold text-white border border-white/10">
                  {guestName}
                </span>
                {isMuted && <span className="px-2 py-1.5 bg-rose-600/80 backdrop-blur-md rounded-lg"><MicOff className="size-3.5 text-white" /></span>}
              </div>
            )}

            {/* Virtual background indicator */}
            {selectedBackground.type !== 'none' && !isCamOff && isProcessing && (
              <div className="absolute bottom-4 right-4">
                <div className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white font-medium">VB</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 relative">
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
              disabled={cameraError}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${isCamOff || cameraError ? 'bg-rose-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                } ${cameraError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isCamOff || cameraError ? <VideoOff className="size-4" /> : <Video className="size-4" />}
              {isCamOff ? 'Start Video' : cameraError ? 'No Camera' : 'Stop Video'}
            </button>
            <button
              onClick={() => setShowBgPicker(!showBgPicker)}
              disabled={cameraError}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${showBgPicker || selectedBackground.type !== 'none'
                ? 'bg-[#5E5CE6] text-white'
                : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                } ${cameraError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Image className="size-4" />
              Background
            </button>

            {/* Background Picker Panel */}
            {showBgPicker && (
              <div
                ref={bgPickerRef}
                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-80 bg-[#1C1E2A] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Image className="size-4 text-[#5E5CE6]" />
                    Virtual Background
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Choose a background for your camera</p>
                  {selectedBackground.type !== 'none' && !isModelLoaded && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                      <Loader2 className="size-3 animate-spin" />
                      Loading background model...
                    </div>
                  )}
                </div>
                <div className="p-4 grid grid-cols-4 gap-2">
                  {backgroundOptions.map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => {
                        setSelectedBackground(bg);
                      }}
                      className={`relative aspect-square rounded-xl transition-all ${bg.preview} ${selectedBackground.id === bg.id
                        ? 'ring-2 ring-[#5E5CE6] ring-offset-2 ring-offset-[#1C1E2A]'
                        : 'hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-[#1C1E2A]'
                        }`}
                      title={bg.label}
                    >
                      {selectedBackground.id === bg.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="size-5 bg-[#5E5CE6] rounded-full flex items-center justify-center">
                            <Check className="size-3 text-white" strokeWidth={3} />
                          </div>
                        </div>
                      )}
                      {bg.type === 'none' && selectedBackground.id !== bg.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="size-4 text-zinc-500" />
                        </div>
                      )}
                      {bg.type === 'blur' && selectedBackground.id !== bg.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Droplets className="size-4 text-white/80" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <p className="text-[10px] text-zinc-500 text-center">
                    {selectedBackground.label} {selectedBackground.type !== 'none' && `• ${selectedBackground.type}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Join form */}
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Join this Show</h2>
            <p className="text-zinc-500 text-sm font-medium mt-1">You've been invited to a live session. Enter your name to join as a guest.</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Your Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                required
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#5E5CE6] transition-colors font-medium"
              />
            </div>

            {/* Recording opt-in toggle */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <button
                type="button"
                onClick={() => setWantsRecording(!wantsRecording)}
                className="w-full flex items-center gap-3 p-3.5 hover:bg-white/5 transition-colors"
              >
                <div className={`size-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${wantsRecording ? 'bg-[#5E5CE6]/20' : 'bg-white/5'
                  }`}>
                  <Film className={`size-4 ${wantsRecording ? 'text-[#5E5CE6]' : 'text-zinc-500'}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-zinc-200">Get the recording</p>
                  <p className="text-[11px] text-zinc-500 font-medium">Receive the meeting recording in your email after the session</p>
                </div>
                <div className={`w-10 h-[22px] rounded-full p-0.5 transition-colors flex-shrink-0 ${wantsRecording ? 'bg-[#5E5CE6]' : 'bg-white/10'
                  }`}>
                  <div className={`size-[18px] bg-white rounded-full shadow-sm transition-transform ${wantsRecording ? 'translate-x-[18px]' : 'translate-x-0'
                    }`} />
                </div>
              </button>

              {/* Email field — slides open */}
              {wantsRecording && (
                <div className="px-3.5 pb-3.5 pt-0 animate-in slide-in-from-top-1 duration-200">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your@email.com"
                      required={wantsRecording}
                      className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#5E5CE6] transition-colors font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-2 flex items-center gap-1.5">
                    <Shield className="size-3" /> We'll only use this to send you the recording. No spam, ever.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!guestName.trim() || isJoining || (wantsRecording && !guestEmail.trim())}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-[0.98] ${isJoining
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : guestName.trim() && (!wantsRecording || guestEmail.trim())
                  ? 'bg-[#5E5CE6] text-white hover:bg-indigo-500 shadow-indigo-500/20'
                  : 'bg-white/5 text-zinc-500 cursor-not-allowed shadow-none'
                }`}
            >
              {isJoining ? (
                <><Loader2 className="size-4 animate-spin" /> Joining…</>
              ) : (
                <><ArrowRight className="size-4" /> Join Show</>
              )}
            </button>

            {/* Approval/denied messages removed: guests join instantly */}
          </form>

          {/* Trust signals */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 text-zinc-500">
              <Shield className="size-4 flex-shrink-0" />
              <span className="text-xs font-medium">No account required to join</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-500">
              <Film className="size-4 flex-shrink-0" />
              <span className="text-xs font-medium">Add your email to get the recording sent to you</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-500">
              <Globe className="size-4 flex-shrink-0" />
              <span className="text-xs font-medium">Powered by Show · getshowapp.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestJoin;
