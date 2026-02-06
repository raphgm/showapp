import React, { useState, useEffect } from 'react';
import { 
  X, Monitor, Scissors, Maximize, Layers, Timer, MousePointer, Loader2 
} from 'lucide-react';

interface ScreenshotOverlayProps {
  initialMode?: 'fullscreen' | 'window' | 'region' | 'scrolling';
  onCapture: (mode: string) => void;
  onClose: () => void;
}

const ScreenshotOverlay: React.FC<ScreenshotOverlayProps> = ({ 
  initialMode = 'region', 
  onCapture, 
  onClose 
}) => {
  const [mode, setMode] = useState(initialMode);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [snapRect, setSnapRect] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isStitching, setIsStitching] = useState(false);
  const [stitchProgress, setStitchProgress] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (isStitching) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      if (mode === 'window' && !selectionStart) {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const target = elements.find(el => 
          el.tagName === 'SECTION' || 
          el.tagName === 'MAIN' || 
          el.classList.contains('bg-white') ||
          el.id === 'root'
        );
        
        if (target) {
          const rect = target.getBoundingClientRect();
          setSnapRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        } else {
          setSnapRect(null);
        }
      } else {
        setSnapRect(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mode, isStitching, selectionStart]);

  const runStitching = async () => {
    setIsStitching(true);
    for (let i = 1; i <= 5; i++) {
      setStitchProgress(i * 20);
      setFlash(true);
      setTimeout(() => setFlash(false), 50);
      await new Promise(r => setTimeout(r, 600));
    }
    setStitchProgress(100);
    setTimeout(() => onCapture('scrolling'), 300);
  };

  const handleCapture = () => {
    if (mode === 'scrolling') {
      runStitching();
    } else {
      setFlash(true);
      setTimeout(() => {
        setFlash(false);
        onCapture(mode);
      }, 150);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (isStitching || countdown !== null) return;

    if (mode === 'region') {
      if (!selectionStart) {
        setSelectionStart({ x: e.clientX, y: e.clientY });
      } else {
        // Finalize region capture on second click
        handleCapture();
      }
    } else if (mode === 'scrolling') {
      if (!isStitching) {
        runStitching();
      }
    } else {
      // Window or Fullscreen: Single click capture
      handleCapture();
    }
  };

  const handleDelayedCapture = (seconds: number) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev && prev <= 1) {
          clearInterval(interval);
          handleCapture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  return (
    <div 
      className={`fixed inset-0 z-[1000] overflow-hidden transition-all duration-300 ${flash ? 'brightness-200 opacity-0 scale-105' : ''}`}
      onClick={handleBackdropClick}
    >
      {/* Dark Backdrop */}
      <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[1px]"></div>

      {/* Crosshair */}
      {mode === 'region' && !isStitching && (
        <>
          <div className="absolute h-full w-px bg-white/30 pointer-events-none" style={{ left: mousePos.x }}></div>
          <div className="absolute w-full h-px bg-white/30 pointer-events-none" style={{ top: mousePos.y }}></div>
        </>
      )}

      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-32 h-32 bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center border-4 border-white/50 animate-ping">
             <span className="text-6xl font-black text-white">{countdown}</span>
          </div>
        </div>
      )}

      {isStitching && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[1100] space-y-8 pointer-events-none">
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden border border-white/10 shadow-xl">
             <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${stitchProgress}%` }}></div>
          </div>
          <div className="bg-indigo-950/90 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-4 text-white">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="font-black text-sm uppercase tracking-widest">Stitching segments...</span>
          </div>
        </div>
      )}

      {/* Loupe */}
      {!isStitching && countdown === null && (
        <div 
          className="absolute w-40 h-40 rounded-2xl border-4 border-white shadow-2xl overflow-hidden pointer-events-none z-50 bg-white/10 backdrop-blur-sm"
          style={{ left: mousePos.x + 20, top: mousePos.y + 20 }}
        >
          <div className="w-full h-full relative border border-white/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-px h-full bg-indigo-500/50 absolute"></div>
              <div className="h-px w-full bg-indigo-500/50 absolute"></div>
              <div className="w-4 h-4 border-2 border-indigo-600 rounded-full z-10 bg-white"></div>
            </div>
            <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-black text-indigo-100 bg-indigo-600/80 uppercase">
              {Math.round(mousePos.x)}, {Math.round(mousePos.y)}
            </div>
          </div>
        </div>
      )}

      {/* Region Selection */}
      {selectionStart && mode === 'region' && !isStitching && (
        <div 
          className="absolute border-2 border-indigo-500 bg-indigo-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none transition-all duration-75"
          style={{ 
            top: Math.min(selectionStart.y, mousePos.y), 
            left: Math.min(selectionStart.x, mousePos.x), 
            width: Math.max(1, Math.abs(mousePos.x - selectionStart.x)), 
            height: Math.max(1, Math.abs(mousePos.y - selectionStart.y)) 
          }}
        >
          <div className="absolute -bottom-6 right-0 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded font-black">
            {Math.abs(mousePos.x - selectionStart.x)}x{Math.abs(mousePos.y - selectionStart.y)}
          </div>
        </div>
      )}

      {/* Window Highlight */}
      {snapRect && !selectionStart && mode === 'window' && !isStitching && (
        <div 
          className="absolute border-4 border-indigo-500 bg-indigo-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none transition-all duration-150 rounded-lg"
          style={{ top: snapRect.top - 4, left: snapRect.left - 4, width: snapRect.width + 8, height: snapRect.height + 8 }}
        />
      )}

      {/* Toolbar */}
      {!isStitching && (
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-indigo-950/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-2 flex items-center gap-1 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {[
            { id: 'region', icon: Scissors, label: 'Region' },
            { id: 'window', icon: Maximize, label: 'Window' },
            { id: 'fullscreen', icon: Monitor, label: 'Full' },
            { id: 'scrolling', icon: Layers, label: 'Stitch' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id as any); setSelectionStart(null); }}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl transition-all ${mode === m.id ? 'bg-white text-indigo-950 shadow-lg' : 'text-indigo-200 hover:bg-white/10'}`}
            >
              <m.icon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
            </button>
          ))}
          <div className="w-px h-10 bg-white/10 mx-2"></div>
          <button onClick={() => handleDelayedCapture(3)} className="p-4 text-white hover:bg-white/10 rounded-2xl transition-colors" title="3s Timer">
            <Timer className="w-5 h-5" />
          </button>
          <button 
            onClick={handleCapture}
            className={`bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2 ${mode === 'region' && selectionStart ? 'animate-pulse' : ''}`}
          >
            {mode === 'region' && selectionStart ? 'Release Snap' : 'Snap Content'} 
            <MousePointer className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-4 text-rose-400 hover:bg-rose-400/10 rounded-2xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ScreenshotOverlay;