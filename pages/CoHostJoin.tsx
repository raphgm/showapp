
import React, { useState, useRef, useEffect } from 'react';
import {
  Video, VideoOff, Mic, MicOff, User, Loader2, Radio,
  ArrowRight, Shield, Globe, Crown, Sparkles
} from 'lucide-react';

interface CoHostJoinProps {
  roomCode: string;
  onJoin: (name: string) => void;
}

const CoHostJoin: React.FC<CoHostJoinProps> = ({ roomCode, onJoin }) => {
  const [name, setName] = useState('');
  const [isCamOff, setIsCamOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      .then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setCameraError(true));

    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (stream) stream.getVideoTracks().forEach(t => (t.enabled = !isCamOff));
  }, [isCamOff, stream]);

  useEffect(() => {
    if (stream) stream.getAudioTracks().forEach(t => (t.enabled = !isMuted));
  }, [isMuted, stream]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsJoining(true);
    stream?.getTracks().forEach(t => t.stop());
    setTimeout(() => onJoin(name.trim()), 1200);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0B14] flex items-center justify-center p-6 font-sans">
      {/* Background ambiance — blue/indigo co-host theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
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
              <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Co-host Invite</p>
            </div>
          </div>

          {/* Camera preview card */}
          <div className="relative aspect-video bg-[#1C1E2A] rounded-2xl overflow-hidden border border-blue-500/20 shadow-2xl shadow-blue-900/20">
            {!cameraError && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover transition-opacity ${isCamOff ? 'opacity-0' : 'opacity-100'}`}
                style={{ transform: 'scaleX(-1)' }}
              />
            )}
            {(isCamOff || cameraError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#18181b] text-zinc-500 gap-4">
                <div className="size-24 bg-zinc-800 rounded-full flex items-center justify-center">
                  {name ? (
                    <span className="text-3xl font-black text-zinc-400">{name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User className="size-10 text-zinc-600" />
                  )}
                </div>
                <span className="text-sm font-bold">{cameraError ? 'Camera unavailable' : 'Camera is off'}</span>
              </div>
            )}

            {/* Co-host badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-600/30 backdrop-blur-md rounded-md text-xs font-bold text-blue-300 border border-blue-500/20 flex items-center gap-1.5">
                <Shield className="size-3" /> Co-host · {roomCode}
              </span>
            </div>

            {/* Name tag */}
            {name && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-sm font-bold text-white border border-white/10 flex items-center gap-1.5">
                  <Shield className="size-3 text-blue-400" /> {name}
                </span>
                {isMuted && <span className="px-2 py-1.5 bg-rose-600/80 backdrop-blur-md rounded-lg"><MicOff className="size-3.5 text-white" /></span>}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/15'
              }`}
            >
              {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button
              onClick={() => setIsCamOff(!isCamOff)}
              disabled={cameraError}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                isCamOff || cameraError ? 'bg-rose-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/15'
              } ${cameraError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isCamOff || cameraError ? <VideoOff className="size-4" /> : <Video className="size-4" />}
              {isCamOff ? 'Start Video' : cameraError ? 'No Camera' : 'Stop Video'}
            </button>
          </div>
        </div>

        {/* Right — Join form */}
        <div className="w-full max-w-sm space-y-6">
          {/* Co-host role highlight */}
          <div className="flex items-center gap-3 p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-xl">
            <div className="size-10 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="size-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-300">You're invited as Co-host</p>
              <p className="text-[11px] text-zinc-500 font-medium">You'll have full controls to manage this Show</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Join as Co-host</h2>
            <p className="text-zinc-500 text-sm font-medium mt-1">You've been invited to co-host this live session. You'll be able to manage scenes, invite guests, stream, and more.</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                required
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isJoining}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-[0.98] ${
                isJoining
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : name.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                  : 'bg-white/5 text-zinc-500 cursor-not-allowed shadow-none'
              }`}
            >
              {isJoining ? (
                <><Loader2 className="size-4 animate-spin" /> Joining as Co-host…</>
              ) : (
                <><Shield className="size-4" /> Join as Co-host</>
              )}
            </button>
          </form>

          {/* What you can do as co-host */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Co-host Permissions</p>
            <div className="flex items-center gap-3 text-zinc-400">
              <Sparkles className="size-4 flex-shrink-0 text-blue-400" />
              <span className="text-xs font-medium">Manage scenes, recordings & stream destinations</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <Crown className="size-4 flex-shrink-0 text-blue-400" />
              <span className="text-xs font-medium">Invite guests, share links & use all studio tools</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <Shield className="size-4 flex-shrink-0 text-blue-400" />
              <span className="text-xs font-medium">No account needed · Powered by Show</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoHostJoin;
