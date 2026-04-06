
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { 
  X, Monitor, Scissors, Maximize, Layers, MousePointer, Loader2, Camera
} from 'lucide-react';

interface ScreenshotOverlayProps {
  initialMode?: 'fullscreen' | 'window' | 'region' | 'scrolling';
  onCapture: (mode: string, dataUrl: string) => void;
  onClose: () => void;
}

const ScreenshotOverlay: React.FC<ScreenshotOverlayProps> = ({ 
  initialMode = 'region', 
  onCapture, 
  onClose 
}) => {
  const [mode, setMode] = useState(initialMode);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMethod, setCaptureMethod] = useState<'page' | 'screen'>('screen');
  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  // Direct page capture using html2canvas - no permissions needed
  const capturePageDirect = async () => {
    setIsCapturing(true);
    
    // Hide the overlay temporarily
    const overlay = document.querySelector('[data-screenshot-overlay]') as HTMLElement;
    if (overlay) overlay.style.display = 'none';
    
    await new Promise(r => setTimeout(r, 100));
    
    try {
      // Capture options for html2canvas
      const options: Parameters<typeof html2canvas>[1] = {
        backgroundColor: null,
        scale: window.devicePixelRatio || 1,
        useCORS: true,
        allowTaint: true,
        logging: false,
        // Ignore the overlay element
        ignoreElements: (el) => el.hasAttribute('data-screenshot-overlay'),
      };

      // For region mode, capture full page then crop
      if (mode === 'region' && selectionBox && selectionBox.w > 10 && selectionBox.h > 10) {
        options.x = selectionBox.x;
        options.y = selectionBox.y;
        options.width = selectionBox.w;
        options.height = selectionBox.h;
      }

      const canvas = await html2canvas(document.body, options);
      const dataUrl = canvas.toDataURL('image/png');
      
      if (overlay) overlay.style.display = '';
      onCapture(mode, dataUrl);
      
    } catch (err) {
      console.error("Direct page capture failed:", err);
      if (overlay) overlay.style.display = '';
      // Fall back to screen capture
      captureWithScreenShare();
    }
  };

  // Original screen share method
  const captureWithScreenShare = async () => {
    setIsCapturing(true);
    await new Promise(r => setTimeout(r, 150));

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      });

      const videoEl = document.createElement('video');
      videoEl.srcObject = stream;
      
      videoEl.onloadedmetadata = () => {
        videoEl.play();
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            stream.getTracks().forEach(track => track.stop());
            onCapture(mode, dataUrl);
          } else {
            stream.getTracks().forEach(track => track.stop());
            onClose();
          }
        }, 100);
      };
    } catch (err) {
      console.error("Screen capture cancelled or failed:", err);
      onClose();
    }
  };

  const triggerCapture = () => {
    if (captureMethod === 'page') {
      capturePageDirect();
    } else {
      captureWithScreenShare();
    }
  };

  // Region selection handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'region') return;
    setIsSelecting(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    setSelectionBox({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    const x = Math.min(startPos.current.x, e.clientX);
    const y = Math.min(startPos.current.y, e.clientY);
    const w = Math.abs(e.clientX - startPos.current.x);
    const h = Math.abs(e.clientY - startPos.current.y);
    setSelectionBox({ x, y, w, h });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  if (isCapturing) {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-indigo-950/40 backdrop-blur-sm space-y-4">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <p className="text-white font-bold text-lg">Capturing page...</p>
      </div>
    );
  }

  return (
    <div 
      data-screenshot-overlay
      className="fixed inset-0 z-[1000] bg-black/20"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Region Selection Box */}
      {mode === 'region' && selectionBox && selectionBox.w > 0 && (
        <div 
          className="absolute border-2 border-indigo-500 bg-indigo-500/10 pointer-events-none"
          style={{
            left: selectionBox.x,
            top: selectionBox.y,
            width: selectionBox.w,
            height: selectionBox.h,
          }}
        >
          <div className="absolute -top-8 left-0 px-2 py-1 bg-indigo-600 rounded text-white text-xs font-bold">
            {selectionBox.w} x {selectionBox.h}
          </div>
        </div>
      )}

      {/* Crosshair cursor hint for region mode */}
      {mode === 'region' && !selectionBox && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="p-4 bg-black/60 rounded-xl text-white text-sm font-medium">
            Click and drag to select a region
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-indigo-950/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-2 flex items-center gap-1 shadow-2xl"
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Capture Method Toggle */}
        <div className="flex items-center bg-white/10 rounded-xl p-1 mr-2">
          <button
            onClick={() => setCaptureMethod('screen')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${captureMethod === 'screen' ? 'bg-indigo-500 text-white' : 'text-indigo-200 hover:bg-white/10'}`}
            title="Capture your screen, window, or tab"
          >
            <Monitor className="w-3.5 h-3.5" />
            Screen
          </button>
          <button
            onClick={() => setCaptureMethod('page')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${captureMethod === 'page' ? 'bg-emerald-500 text-white' : 'text-indigo-200 hover:bg-white/10'}`}
            title="Capture this app's page directly"
          >
            <Camera className="w-3.5 h-3.5" />
            App
          </button>
        </div>

        <div className="w-px h-10 bg-white/10"></div>

        {[
          { id: 'region', icon: Scissors, label: 'Region' },
          { id: 'window', icon: Maximize, label: 'Window' },
          { id: 'fullscreen', icon: Monitor, label: 'Full' },
          { id: 'scrolling', icon: Layers, label: 'Stitch' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl transition-all ${mode === m.id ? 'bg-white text-indigo-950 shadow-lg' : 'text-indigo-200 hover:bg-white/10'}`}
          >
            <m.icon className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
          </button>
        ))}
        <div className="w-px h-10 bg-white/10 mx-2"></div>
        <button 
          onClick={triggerCapture}
          disabled={mode === 'region' && (!selectionBox || selectionBox.w < 10)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Snap Content <MousePointer className="w-4 h-4" />
        </button>
        <button onClick={onClose} className="p-4 text-rose-400 hover:bg-rose-400/10 rounded-2xl transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ScreenshotOverlay;
