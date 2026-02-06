
import React, { useState, useRef, useEffect } from 'react';
import { 
  Maximize2, 
  Video, 
  Scissors, 
  GripHorizontal, 
  Monitor,
  Sparkles,
  Square,
  PanelBottom,
  MoveUp
} from 'lucide-react';

interface FloatingDockProps {
  isRecording?: boolean;
  onMaximize: () => void;
  onRecord: () => void;
  onStop: () => void;
  onSnap: (mode: 'region' | 'fullscreen') => void;
  onNavigate: (route: string) => void;
}

const FloatingDock: React.FC<FloatingDockProps> = ({ 
  isRecording, 
  onMaximize, 
  onRecord, 
  onStop,
  onSnap, 
  onNavigate 
}) => {
  const [isDocked, setIsDocked] = useState(false);
  // Default position shifted to the LEFT side (40px from left)
  const [position, setPosition] = useState({ x: 40, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [timer, setTimer] = useState(0);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  useEffect(() => {
    const handleResize = () => {
       setPosition(prev => ({
         x: Math.min(prev.x, window.innerWidth - 420),
         y: Math.min(prev.y, window.innerHeight - 100)
       }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let interval: number | null = null;
    if (isRecording) {
      setTimer(0);
      interval = window.setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRecording]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDocked) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(20, Math.min(window.innerWidth - 300, dragRef.current.initialX + dx)),
        y: Math.max(20, Math.min(window.innerHeight - 80, dragRef.current.initialY + dy))
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const dockStyle: React.CSSProperties = isDocked 
    ? { left: '50%', bottom: '2rem', transform: 'translateX(-50%)', top: 'auto' } 
    : { left: position.x, top: position.y, transform: 'none' };

  return (
    <div 
      className={`fixed z-[9999] select-none transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275)`}
      style={dockStyle}
    >
      <div className={`
        flex items-center gap-1 p-2 bg-white/90 backdrop-blur-3xl border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] ring-1 ring-black/5
        ${isDocked ? 'rounded-[28px] px-4 py-2.5 scale-110' : 'rounded-[32px]'}
        ${isDragging ? 'scale-105 cursor-grabbing' : ''} transition-all
      `}>
        {/* Drag Handle */}
        <div 
          onMouseDown={handleMouseDown}
          className={`p-3 transition-colors ${isDocked ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'} text-slate-300 hover:text-indigo-600`}
        >
          <GripHorizontal className="size-4" />
        </div>

        {!isDocked && (
          <button 
            onClick={() => setIsDocked(true)}
            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
            title="Dock to bottom"
          >
            <PanelBottom className="size-4" />
          </button>
        )}

        <div className="w-px h-8 bg-slate-100 mx-2" />

        {/* Action Group */}
        {!isRecording ? (
          <button 
            onClick={onRecord}
            className="group flex items-center gap-2 px-6 py-2.5 bg-[#101323] text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
          >
            <div className="size-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            Record
          </button>
        ) : (
          <button 
            onClick={onStop}
            className="group flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-rose-700 transition-all active:scale-95"
          >
            <Square className="size-3 fill-white" />
            {formatTime(timer)}
          </button>
        )}

        <button 
          onClick={() => onSnap('region')}
          className="p-3.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-[20px] transition-all"
        >
          <Scissors className="size-4" />
        </button>

        <button 
          onClick={() => onSnap('fullscreen')}
          className="p-3.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-[20px] transition-all"
        >
          <Monitor className="size-4" />
        </button>

        <div className="w-px h-8 bg-slate-100 mx-2" />

        <button 
          onClick={onMaximize}
          className="p-3.5 bg-indigo-600 text-white rounded-[20px] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Maximize2 className="size-4" />
        </button>
      </div>
      
      {/* Dynamic Status Label - Updated to White theme */}
      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full flex items-center gap-2 border border-slate-100 shadow-xl transition-all ${isRecording ? 'bg-rose-600 text-white' : 'bg-white text-indigo-950'}`}>
         <Sparkles className={`size-3 ${isRecording ? 'text-white' : 'text-indigo-500'}`} />
         <span className="text-[8px] font-black uppercase tracking-[0.3em]">{isRecording ? 'ON AIR' : 'SHOW PILL'}</span>
      </div>
    </div>
  );
};

export default FloatingDock;
