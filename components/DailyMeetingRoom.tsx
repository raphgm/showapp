import React, { useEffect, useRef, useCallback, useState } from 'react';
import DailyIframe, { DailyCall, DailyParticipant } from '@daily-co/daily-js';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, ScreenShareOff,
  Users, MessageSquare, Maximize2, Minimize2, Loader2
} from 'lucide-react';
import { useToast } from './ToastProvider';

// ─── Daily.co room creation ───────────────────────────────────────────────
// Rooms are created on-the-fly using Daily's REST API.
// The API key is only used server-side in production; here we use the
// anonymous public-room approach via the Daily dashboard free tier.
// Replace DAILY_DOMAIN with your actual Daily domain (e.g. "yourapp.daily.co").
const DAILY_DOMAIN = import.meta.env.VITE_DAILY_DOMAIN || 'showapp';

async function getOrCreateRoom(roomName: string): Promise<string> {
  // Return a Daily room URL. In production you'd call your own backend to
  // create/look up a room and return a token. For now we construct the URL
  // directly — Daily allows this for public rooms on the free tier.
  return `https://${DAILY_DOMAIN}.daily.co/${roomName}`;
}

interface Tile {
  sessionId: string;
  userName: string;
  isLocal: boolean;
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  isMuted: boolean;
  isCamOff: boolean;
  isScreenShare?: boolean;
}

interface DailyMeetingRoomProps {
  roomName: string;             // e.g. "stream-room"
  userName: string;
  isHost: boolean;
  onLeave: () => void;
}

const VideoTile: React.FC<{ tile: Tile; isLarge?: boolean }> = ({ tile, isLarge }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (tile.videoTrack && !tile.isCamOff) {
      const stream = new MediaStream([tile.videoTrack]);
      ref.current.srcObject = stream;
    } else {
      ref.current.srcObject = null;
    }
  }, [tile.videoTrack, tile.isCamOff]);

  return (
    <div className={`relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center ${isLarge ? 'w-full h-full' : 'aspect-video'}`}>
      {tile.videoTrack && !tile.isCamOff ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={tile.isLocal}
          className="w-full h-full object-cover"
          style={tile.isLocal && !tile.isScreenShare ? { transform: 'scaleX(-1)' } : undefined}
        />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="size-16 bg-indigo-500/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-black text-indigo-300">
              {tile.userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-zinc-400 font-medium">{tile.userName}</span>
        </div>
      )}
      {/* Name tag */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-white">
          {tile.userName}{tile.isLocal ? ' (You)' : ''}
        </span>
        {tile.isMuted && <div className="p-1 bg-rose-600/80 rounded-lg"><MicOff className="size-2.5 text-white" /></div>}
      </div>
    </div>
  );
};

const DailyMeetingRoom: React.FC<DailyMeetingRoomProps> = ({ roomName, userName, isHost, onLeave }) => {
  const callRef = useRef<DailyCall | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const { addToast } = useToast();

  const buildTiles = useCallback((call: DailyCall) => {
    const participants = call.participants();
    const newTiles: Tile[] = Object.values(participants).map((p: DailyParticipant) => ({
      sessionId: p.session_id,
      userName: p.user_name || (p.local ? userName : 'Guest'),
      isLocal: p.local,
      videoTrack: p.tracks?.video?.persistentTrack || null,
      audioTrack: p.tracks?.audio?.persistentTrack || null,
      isMuted: !p.tracks?.audio?.state || p.tracks.audio.state === 'off' || p.tracks.audio.state === 'blocked',
      isCamOff: !p.tracks?.video?.state || p.tracks.video.state === 'off' || p.tracks.video.state === 'blocked',
    }));
    setTiles(newTiles);
  }, [userName]);

  useEffect(() => {
    let call: DailyCall;

    const init = async () => {
      try {
        const roomUrl = await getOrCreateRoom(roomName);
        call = DailyIframe.createCallObject({ url: roomUrl });
        callRef.current = call;

        const events = ['participant-joined', 'participant-updated', 'participant-left', 'track-started', 'track-stopped'];
        events.forEach(e => call.on(e as any, () => buildTiles(call)));

        call.on('left-meeting', () => onLeave());
        call.on('error', (ev: any) => {
          console.error('[Daily] Error:', ev);
          setError(ev?.errorMsg || 'Connection error');
          setIsLoading(false);
        });

        await call.join({ userName });
        buildTiles(call);
        setIsLoading(false);
        addToast('Connected to meeting room', 'success');
      } catch (err: any) {
        console.error('[Daily] Init failed:', err);
        setError(err?.message || 'Failed to connect');
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (call) {
        call.destroy();
        callRef.current = null;
      }
    };
  }, [roomName, userName, buildTiles, onLeave, addToast]);

  const toggleMic = () => {
    callRef.current?.setLocalAudio(isMuted);
    setIsMuted(m => !m);
  };

  const toggleCam = () => {
    callRef.current?.setLocalVideo(isCamOff);
    setIsCamOff(c => !c);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      await callRef.current?.startScreenShare();
      setIsScreenSharing(true);
    } else {
      await callRef.current?.stopScreenShare();
      setIsScreenSharing(false);
    }
  };

  const leave = () => {
    callRef.current?.leave();
    onLeave();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-[#0A0B14] flex items-center justify-center z-50">
        <div className="text-center space-y-4 max-w-sm">
          <div className="size-16 mx-auto bg-rose-500/20 rounded-full flex items-center justify-center">
            <PhoneOff className="size-8 text-rose-400" />
          </div>
          <h2 className="text-white font-black text-xl">Connection Failed</h2>
          <p className="text-zinc-400 text-sm">{error}</p>
          <p className="text-zinc-500 text-xs">
            Make sure VITE_DAILY_DOMAIN is set in your .env file.<br />
            Get a free domain at <strong>daily.co</strong>
          </p>
          <button onClick={onLeave} className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
            Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0A0B14] flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <Loader2 className="size-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm font-medium">Connecting to meeting…</p>
        </div>
      </div>
    );
  }

  const localTile = tiles.find(t => t.isLocal);
  const remoteTiles = tiles.filter(t => !t.isLocal);

  return (
    <div className="fixed inset-0 bg-[#0A0B14] z-50 flex flex-col">
      {/* ─── Video grid ─── */}
      <div className="flex-1 overflow-hidden p-4">
        {remoteTiles.length === 0 ? (
          // Only local participant — show large local tile
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-2xl aspect-video">
              {localTile && <VideoTile tile={localTile} isLarge />}
            </div>
            <div className="absolute inset-0 flex items-end justify-center pb-40 pointer-events-none">
              <p className="text-zinc-500 text-sm font-medium">Waiting for others to join…</p>
            </div>
          </div>
        ) : remoteTiles.length === 1 ? (
          // 1 remote + local PiP
          <div className="h-full relative">
            <div className="h-full">
              <VideoTile tile={remoteTiles[0]} isLarge />
            </div>
            {localTile && (
              <div className="absolute bottom-4 right-4 w-52 aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-10">
                <VideoTile tile={localTile} />
              </div>
            )}
          </div>
        ) : (
          // Grid layout
          <div className={`h-full grid gap-3 ${remoteTiles.length <= 3 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {localTile && <VideoTile tile={localTile} />}
            {remoteTiles.map(tile => <VideoTile key={tile.sessionId} tile={tile} />)}
          </div>
        )}
      </div>

      {/* ─── Participants sidebar ─── */}
      {showParticipants && (
        <div className="absolute top-0 right-0 bottom-0 w-72 bg-[#18181b] border-l border-white/10 p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-white text-sm">Participants ({tiles.length})</span>
            <button onClick={() => setShowParticipants(false)} className="text-zinc-400 hover:text-white">×</button>
          </div>
          <div className="space-y-2">
            {tiles.map(t => (
              <div key={t.sessionId} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                <div className="size-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-xs font-black text-indigo-300">
                  {t.userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-zinc-200 font-medium flex-1">{t.userName}{t.isLocal ? ' (You)' : ''}</span>
                {t.isMuted && <MicOff className="size-3 text-rose-400" />}
                {t.isCamOff && <VideoOff className="size-3 text-rose-400" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Control bar ─── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-3 px-6 py-4 bg-[#18181b]/80 backdrop-blur border-t border-white/10">
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-full font-bold text-sm transition-all ${isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </button>
        <button
          onClick={toggleCam}
          className={`p-3.5 rounded-full font-bold text-sm transition-all ${isCamOff ? 'bg-rose-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}
          title={isCamOff ? 'Start video' : 'Stop video'}
        >
          {isCamOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`p-3.5 rounded-full transition-all ${isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          {isScreenSharing ? <ScreenShareOff className="size-5" /> : <ScreenShare className="size-5" />}
        </button>
        <button
          onClick={() => setShowParticipants(p => !p)}
          className={`p-3.5 rounded-full transition-all ${showParticipants ? 'bg-white/20 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}
          title="Participants"
        >
          <Users className="size-5" />
        </button>
        <div className="w-px h-8 bg-white/10 mx-1" />
        <button
          onClick={leave}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold text-sm transition-all flex items-center gap-2"
        >
          <PhoneOff className="size-4" /> Leave
        </button>
      </div>
    </div>
  );
};

export default DailyMeetingRoom;
