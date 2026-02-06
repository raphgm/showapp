
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Save, Undo2, Redo2, Type, MousePointer2, 
  Pen, Eraser, Square, Circle, ArrowRight, 
  Download, Palette, Type as TypeIcon, Highlighter,
  Move, Minus, Plus, Trash2, RefreshCcw, Crop, Check
} from 'lucide-react';

interface ImageAnnotatorProps {
  imageUrl: string;
  onSave: (newImageUrl: string) => void;
  onClose: () => void;
  initialTitle?: string;
}

type Tool = 'select' | 'pen' | 'highlighter' | 'eraser' | 'text' | 'rect' | 'circle' | 'arrow' | 'crop';

const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#000000', // Black
  '#ffffff', // White
];

const STROKE_WIDTHS = [2, 4, 8, 12, 24];

const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({ imageUrl, onSave, onClose, initialTitle }) => {
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [activeStrokeWidth, setActiveStrokeWidth] = useState(4);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState<{ x: number, y: number, text: string } | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Initialize Canvas with Image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      initCanvas(img);
    };
  }, [imageUrl]);

  const initCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fit image to screen with some padding
    const maxWidth = window.innerWidth - 300;
    const maxHeight = window.innerHeight - 200;
    const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    setZoom(scale < 1 ? scale : 1);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      saveState();
    }
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        // Resize canvas if history state has different dimensions (e.g. after crop undo)
        if (history[newStep].width !== canvas.width || history[newStep].height !== canvas.height) {
            canvas.width = history[newStep].width;
            canvas.height = history[newStep].height;
        }
        ctx.putImageData(history[newStep], 0, 0);
      }
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        if (history[newStep].width !== canvas.width || history[newStep].height !== canvas.height) {
            canvas.width = history[newStep].width;
            canvas.height = history[newStep].height;
        }
        ctx.putImageData(history[newStep], 0, 0);
      }
    }
  };

  const resetCanvas = () => {
    if (window.confirm('Wipe all annotations and start fresh?')) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && imageRef.current) {
        // Restore original size
        canvas.width = imageRef.current.width;
        canvas.height = imageRef.current.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageRef.current, 0, 0);
        saveState();
        setCropRect(null);
      }
    }
  };

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Account for CSS scale (zoom) correctly
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'select') return;
    
    const { x, y } = getCoords(e);

    if (activeTool === 'text') {
      setTextInput({ x, y, text: '' });
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });

    if (activeTool === 'crop') {
        setCropRect({ x, y, w: 0, h: 0 });
        return;
    }

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = activeStrokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (activeTool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = activeColor + '80'; // 50% opacity
        ctx.lineWidth = activeStrokeWidth * 3; // Highlighters are thicker
      } else if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    
    if (activeTool === 'crop') {
        const w = x - startPos.x;
        const h = y - startPos.y;
        setCropRect({ x: startPos.x, y: startPos.y, w, h });
        return;
    }

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // Shape preview - restore to last clean state and draw preview
      if (history[historyStep]) {
        // Only put image data if dimensions match (safety check)
        if (history[historyStep].width === canvasRef.current!.width && history[historyStep].height === canvasRef.current!.height) {
            ctx.putImageData(history[historyStep], 0, 0);
        }
      }
      
      ctx.beginPath();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = activeStrokeWidth;
      ctx.globalCompositeOperation = 'source-over';

      if (activeTool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (activeTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        const headLen = 20;
        const dx = x - startPos.x;
        const dy = y - startPos.y;
        const angle = Math.atan2(dy, dx);
        
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.lineTo(x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x, y);
        ctx.lineTo(x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    }
  };

  const endDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      
      if (activeTool === 'crop') {
          if (cropRect) {
             const normalized = {
                x: cropRect.w < 0 ? cropRect.x + cropRect.w : cropRect.x,
                y: cropRect.h < 0 ? cropRect.y + cropRect.h : cropRect.y,
                w: Math.abs(cropRect.w),
                h: Math.abs(cropRect.h)
             };
             setCropRect(normalized);
          }
          return;
      }

      saveState();
    }
  };

  const applyCrop = () => {
    if (!cropRect || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
  
    const { x, y, w, h } = cropRect;
    // Basic validation
    if (w < 10 || h < 10) { 
        setCropRect(null); 
        alert("Crop area too small");
        return; 
    }
  
    // Get crop data
    const imageData = ctx.getImageData(x, y, w, h);
    
    // Resize canvas
    canvasRef.current.width = w;
    canvasRef.current.height = h;
    
    // Put crop data onto new canvas size
    ctx.putImageData(imageData, 0, 0);
    
    saveState();
    setCropRect(null);
    setActiveTool('select');
  };

  const handleTextSubmit = () => {
    if (textInput && textInput.text.trim()) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = `bold ${activeStrokeWidth * 6}px Inter, sans-serif`;
        ctx.fillStyle = activeColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textInput.text, textInput.x, textInput.y);
        saveState();
      }
    }
    setTextInput(null);
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `show-capture-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-[#0f172a] flex flex-col font-sans">
      {/* Header */}
      <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-indigo-950 tracking-tight">Annotate Capture</h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{initialTitle || 'Workspace Briefing'}</span>
          </div>
          <div className="h-8 w-px bg-slate-100"></div>
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={historyStep <= 0} className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl disabled:opacity-20 transition-all" title="Undo (Ctrl+Z)">
              <Undo2 className="w-5 h-5" />
            </button>
            <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl disabled:opacity-20 transition-all" title="Redo (Ctrl+Y)">
              <Redo2 className="w-5 h-5" />
            </button>
          </div>
          <div className="h-8 w-px bg-slate-100"></div>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl">
             <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-1 hover:text-indigo-600 transition-colors"><Minus className="w-4 h-4" /></button>
             <span className="text-xs font-black text-slate-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
             <button onClick={() => setZoom(z => Math.min(4, z + 0.1))} className="p-1 hover:text-indigo-600 transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="px-5 py-2 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
            Discard
          </button>
          <button onClick={handleDownload} className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all shadow-sm" title="Download to local disk">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
            <Save className="w-4 h-4" />
            Save to Studio
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar Sidebar */}
        <div className="w-24 bg-white border-r border-slate-100 flex flex-col items-center py-8 gap-8 overflow-y-auto shrink-0 z-10 shadow-xl">
          
          {/* Main Tools */}
          <div className="flex flex-col gap-2 w-full px-3">
            {[
              { id: 'select', icon: MousePointer2, label: 'Select' },
              { id: 'crop', icon: Crop, label: 'Crop' },
              { id: 'pen', icon: Pen, label: 'Pen' },
              { id: 'highlighter', icon: Highlighter, label: 'Mark' },
              { id: 'eraser', icon: Eraser, label: 'Erase' },
              { id: 'text', icon: TypeIcon, label: 'Text' },
              { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
              { id: 'rect', icon: Square, label: 'Box' },
              { id: 'circle', icon: Circle, label: 'Oval' },
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => { setActiveTool(tool.id as Tool); setTextInput(null); setCropRect(null); }}
                className={`p-3.5 rounded-[18px] flex flex-col items-center gap-1.5 transition-all group ${
                  activeTool === tool.id 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                }`}
                title={tool.label}
              >
                <tool.icon className={`w-5 h-5 ${activeTool === tool.id ? 'scale-110' : 'group-hover:scale-105'} transition-transform`} />
                <span className="text-[8px] font-black uppercase tracking-widest">{tool.label}</span>
              </button>
            ))}
          </div>

          <div className="w-12 h-px bg-slate-100"></div>

          {/* Style Tools */}
          <div className="flex flex-col gap-6 items-center">
             {/* Colors */}
             <div className="grid grid-cols-2 gap-2">
               {COLORS.map(color => (
                 <button
                   key={color}
                   onClick={() => setActiveColor(color)}
                   className={`size-6 rounded-full border-2 transition-all ${activeColor === color ? 'border-indigo-600 scale-125 shadow-lg' : 'border-white hover:scale-110'}`}
                   style={{ backgroundColor: color }}
                 />
               ))}
             </div>

             <div className="w-12 h-px bg-slate-100"></div>

             {/* Stroke Width */}
             <div className="flex flex-col gap-3">
               {STROKE_WIDTHS.map(width => (
                 <button
                   key={width}
                   onClick={() => setActiveStrokeWidth(width)}
                   className={`size-8 rounded-xl flex items-center justify-center transition-all ${activeStrokeWidth === width ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50'}`}
                   title={`${width}px stroke`}
                 >
                   <div className="bg-slate-800 rounded-full" style={{ width: Math.min(width, 16), height: Math.min(width, 16) }}></div>
                 </button>
               ))}
             </div>
          </div>

          <div className="mt-auto pb-4">
             <button 
               onClick={resetCanvas}
               className="p-4 text-slate-300 hover:text-rose-500 transition-colors"
               title="Clear All Annotations"
             >
                <RefreshCcw className="size-5" />
             </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#1e293b] overflow-auto flex items-center justify-center p-20 relative scrollbar-hide">
          <div className="relative shadow-[0_64px_128px_-32px_rgba(0,0,0,0.5)] bg-white rounded-lg overflow-hidden" style={{ width: canvasRef.current?.width ? canvasRef.current.width * zoom : 'auto', height: canvasRef.current?.height ? canvasRef.current.height * zoom : 'auto' }}>
            <canvas 
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
              className={`block ${activeTool === 'eraser' ? 'cursor-none' : activeTool === 'crop' ? 'cursor-crosshair' : 'cursor-crosshair'}`}
              style={{ 
                transform: `scale(${zoom})`, 
                transformOrigin: 'top left',
                width: canvasRef.current?.width || 'auto',
                height: canvasRef.current?.height || 'auto'
              }}
            />
            
            {/* Custom Eraser Cursor */}
            {activeTool === 'eraser' && (
              <div 
                 className="fixed pointer-events-none size-8 border-2 border-white rounded-full bg-white/20 backdrop-blur-sm z-[1000] -translate-x-1/2 -translate-y-1/2"
                 style={{ left: startPos.x, top: startPos.y }}
              />
            )}

            {/* Crop Overlay */}
            {cropRect && (
                <>
                    <div 
                        className="absolute border-2 border-indigo-500 bg-indigo-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none"
                        style={{ 
                            left: cropRect.x * zoom, 
                            top: cropRect.y * zoom, 
                            width: cropRect.w * zoom, 
                            height: cropRect.h * zoom 
                        }}
                    />
                    <div 
                        className="absolute flex gap-2 z-[100]"
                        style={{
                            left: (cropRect.x + cropRect.w/2) * zoom,
                            top: (cropRect.y + cropRect.h) * zoom + 20,
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <button onClick={applyCrop} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-all font-bold text-xs uppercase tracking-widest">
                            <Check className="size-4" /> Apply
                        </button>
                        <button onClick={() => setCropRect(null)} className="flex items-center gap-2 px-4 py-2 bg-white text-rose-500 rounded-full shadow-xl hover:bg-rose-50 transition-all font-bold text-xs uppercase tracking-widest">
                            <X className="size-4" /> Cancel
                        </button>
                    </div>
                </>
            )}

            {/* Text Input Overlay */}
            {textInput && (
              <div 
                className="absolute z-[100]"
                style={{ 
                   left: textInput.x * zoom, 
                   top: textInput.y * zoom,
                   transform: 'translate(-50%, -50%)'
                }}
              >
                <input
                  autoFocus
                  value={textInput.text}
                  onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
                  onBlur={handleTextSubmit}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit(); }}
                  placeholder="Type here..."
                  style={{
                    fontSize: `${activeStrokeWidth * 6 * zoom}px`,
                    color: activeColor,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '900',
                    textShadow: '0px 0px 12px rgba(255,255,255,1)'
                  }}
                  className="bg-transparent border-none outline-none placeholder:text-slate-300 min-w-[300px] text-center"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnnotator;
