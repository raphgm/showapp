
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Save, Undo2, Redo2, Type, MousePointer2, 
  Pen, Eraser, Square, Circle, ArrowRight, 
  Download, Palette, Type as TypeIcon, Highlighter,
  Move, Minus, Plus, Trash2, RefreshCcw, Crop, Check,
  SlidersHorizontal, Sparkles, Wand2, BrainCircuit,
  Loader2, Send
} from 'lucide-react';
import { editImageWithAi } from '../services/geminiService';

interface ImageAnnotatorProps {
  imageUrl: string;
  onSave: (newImageUrl: string) => void;
  onClose: () => void;
  initialTitle?: string;
}

type Tool = 'select' | 'pen' | 'highlighter' | 'eraser' | 'text' | 'rect' | 'circle' | 'arrow' | 'crop';
type Panel = 'adjust' | 'filters' | 'ai';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#000000', '#ffffff'];
const STROKE_WIDTHS = [2, 4, 8, 12, 24];

const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({ imageUrl, onSave, onClose, initialTitle }) => {
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [activeStrokeWidth, setActiveStrokeWidth] = useState(4);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<ImageData | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [textValue, setTextValue] = useState('');
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  
  const [activePanel, setActivePanel] = useState<Panel>('adjust');
  const [adjustments, setAdjustments] = useState({ brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, invert: 0 });
  
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      initCanvases(img);
    };
  }, [imageUrl]);

  useEffect(() => {
    const canvas = imageCanvasRef.current;
    if (canvas) {
      canvas.style.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturate}%) blur(${adjustments.blur}px) grayscale(${adjustments.grayscale}%) sepia(${adjustments.sepia}%) invert(${adjustments.invert}%)`;
    }
  }, [adjustments]);

  const initCanvases = (img: HTMLImageElement) => {
    [imageCanvasRef, drawingCanvasRef].forEach(ref => {
      const canvas = ref.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
      }
    });

    const imageCtx = imageCanvasRef.current?.getContext('2d');
    if (imageCtx) {
      imageCtx.drawImage(img, 0, 0);
    }
    
    saveDrawingState(); // Initial empty state for drawing
  };

  const saveDrawingState = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };
  
  const undo = () => { if (historyStep > 0) applyHistoryStep(historyStep - 1); };
  const redo = () => { if (historyStep < history.length - 1) applyHistoryStep(historyStep + 1); };

  const applyHistoryStep = (step: number) => {
    setHistoryStep(step);
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (ctx) ctx.putImageData(history[step], 0, 0);
  };

  const getCoords = (e: React.MouseEvent) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const drawArrowhead = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, headSize: number = 15) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headSize * Math.cos(angle - Math.PI / 6), toY - headSize * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headSize * Math.cos(angle + Math.PI / 6), toY - headSize * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (activeTool === 'select') return;
    const { x, y } = getCoords(e);

    // Text tool — click to place input
    if (activeTool === 'text') {
      setTextInput({ x, y, visible: true });
      setTextValue('');
      return;
    }

    setIsDrawing(true);
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Shape tools: save starting point and snapshot canvas state for live preview
    if (['rect', 'circle', 'arrow', 'crop'].includes(activeTool)) {
      setShapeStart({ x, y });
      const canvas = drawingCanvasRef.current!;
      setPreviewCanvas(ctx.getImageData(0, 0, canvas.width, canvas.height));
      return;
    }

    // Freehand tools: pen, highlighter, eraser
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = activeTool === 'highlighter' ? activeColor + '66' : activeColor;
    ctx.lineWidth = activeTool === 'highlighter' ? activeStrokeWidth * 3 : activeStrokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.globalAlpha = activeTool === 'highlighter' ? 0.35 : 1;
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Shape preview — restore snapshot, then draw preview shape
    if (['rect', 'circle', 'arrow', 'crop'].includes(activeTool) && shapeStart && previewCanvas) {
      ctx.putImageData(previewCanvas, 0, 0);
      ctx.strokeStyle = activeTool === 'crop' ? '#a855f7' : activeColor;
      ctx.lineWidth = activeTool === 'crop' ? 2 : activeStrokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      const w = x - shapeStart.x;
      const h = y - shapeStart.y;

      if (activeTool === 'rect') {
        ctx.beginPath();
        ctx.rect(shapeStart.x, shapeStart.y, w, h);
        ctx.stroke();
      } else if (activeTool === 'circle') {
        const rx = Math.abs(w) / 2;
        const ry = Math.abs(h) / 2;
        const cx = shapeStart.x + w / 2;
        const cy = shapeStart.y + h / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(shapeStart.x, shapeStart.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        drawArrowhead(ctx, shapeStart.x, shapeStart.y, x, y, activeStrokeWidth * 3);
      } else if (activeTool === 'crop') {
        // Crop preview — dashed border with dim overlay
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.rect(shapeStart.x, shapeStart.y, w, h);
        ctx.stroke();
        ctx.setLineDash([]);
        setCropRect({ x: Math.min(shapeStart.x, x), y: Math.min(shapeStart.y, y), w: Math.abs(w), h: Math.abs(h) });
      }
      return;
    }

    // Freehand drawing
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // Crop finalization
    if (activeTool === 'crop' && cropRect && cropRect.w > 10 && cropRect.h > 10) {
      applyCrop(cropRect);
      setCropRect(null);
    }

    setShapeStart(null);
    setPreviewCanvas(null);
    saveDrawingState();
  };

  const commitText = () => {
    if (!textValue.trim() || !textInput.visible) return;
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    const fontSize = activeStrokeWidth * 5 + 12;
    ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = activeColor;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillText(textValue, textInput.x, textInput.y + fontSize);
    setTextInput({ x: 0, y: 0, visible: false });
    setTextValue('');
    saveDrawingState();
  };

  const applyCrop = (rect: { x: number; y: number; w: number; h: number }) => {
    const imageCanvas = imageCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    if (!imageCanvas || !drawingCanvas || !imageRef.current) return;

    // Create cropped image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rect.w;
    tempCanvas.height = rect.h;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw cropped portion of original image
    tempCtx.filter = imageCanvas.style.filter;
    tempCtx.drawImage(imageRef.current, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    tempCtx.filter = 'none';
    // Draw cropped portion of annotations
    tempCtx.drawImage(drawingCanvas, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

    // Load as new image
    const croppedUrl = tempCanvas.toDataURL('image/png');
    const newImg = new Image();
    newImg.crossOrigin = 'anonymous';
    newImg.src = croppedUrl;
    newImg.onload = () => {
      imageRef.current = newImg;
      [imageCanvasRef, drawingCanvasRef].forEach(ref => {
        const c = ref.current;
        if (c) { c.width = rect.w; c.height = rect.h; }
      });
      const imageCtx = imageCanvas.getContext('2d');
      if (imageCtx) { imageCtx.drawImage(newImg, 0, 0); }
      setAdjustments({ brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, invert: 0 });
      saveDrawingState();
    };
  };

  const getCompositeImage = (): string => {
    const tempCanvas = document.createElement('canvas');
    const imageCanvas = imageCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    if (!imageCanvas || !drawingCanvas || !imageRef.current) return '';

    tempCanvas.width = imageCanvas.width;
    tempCanvas.height = imageCanvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.filter = imageCanvas.style.filter;
    ctx.drawImage(imageRef.current, 0, 0);
    ctx.filter = 'none';
    ctx.drawImage(drawingCanvas, 0, 0);
    
    return tempCanvas.toDataURL('image/png');
  };

  const handleSave = () => onSave(getCompositeImage());
  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `show-capture-${Date.now()}.png`;
    link.href = getCompositeImage();
    link.click();
  };

  const applyFilter = (filterName: string) => {
    const base = { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, invert: 0 };
    switch(filterName) {
      case 'grayscale': setAdjustments({ ...base, grayscale: 100 }); break;
      case 'sepia': setAdjustments({ ...base, sepia: 100 }); break;
      case 'invert': setAdjustments({ ...base, invert: 100 }); break;
      case 'vintage': setAdjustments({ ...base, sepia: 60, contrast: 110, brightness: 90, saturate: 90 }); break;
      default: setAdjustments(base);
    }
  };
  
  const handleAiEdit = async (prompt: string) => {
    setIsAiProcessing(true);
    const compositeImage = getCompositeImage();
    const newImageUrl = await editImageWithAi(compositeImage, prompt);
    if (newImageUrl) {
      const newImg = new Image();
      newImg.crossOrigin = "anonymous";
      newImg.src = newImageUrl;
      newImg.onload = () => {
        imageRef.current = newImg;
        initCanvases(newImg);
        setAdjustments({ brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, invert: 0 }); // Reset adjustments
      };
    } else {
      alert("AI enhancement failed. Please try a different prompt.");
    }
    setAiPrompt('');
    setIsAiProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-[#0f172a] flex flex-col font-sans text-white">
      {/* Header */}
      <div className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-black tracking-tight">Studio Editor</h2>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={historyStep <= 0} className="p-2.5 hover:bg-white/10 rounded-xl disabled:opacity-20 transition-all" title="Undo"><Undo2 className="w-5 h-5" /></button>
            <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2.5 hover:bg-white/10 rounded-xl disabled:opacity-20 transition-all" title="Redo"><Redo2 className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleDownload} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all" title="Download"><Download className="w-5 h-5" /></button>
          <button onClick={onClose} className="px-5 py-2 text-sm font-black text-slate-400 hover:text-white transition-colors">Discard</button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-xl font-black text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"><Save className="w-4 h-4" /> Save</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <div className="w-20 bg-slate-900/30 border-r border-white/10 flex flex-col items-center py-4 gap-1 shrink-0 z-10 overflow-y-auto no-scrollbar">
          {/* Drawing Tools */}
          {[
            { id: 'select', icon: MousePointer2, label: 'Select' },
            { id: 'pen', icon: Pen, label: 'Draw' },
            { id: 'highlighter', icon: Highlighter, label: 'Highlight' },
            { id: 'eraser', icon: Eraser, label: 'Eraser' },
          ].map(tool => (
            <button key={tool.id} onClick={() => setActiveTool(tool.id as Tool)} className={`p-3 rounded-xl transition-all flex flex-col items-center gap-0.5 w-full ${activeTool === tool.id ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`} title={tool.label}>
              <tool.icon className="w-5 h-5" />
              <span className="text-[8px] font-bold">{tool.label}</span>
            </button>
          ))}

          <div className="w-10 h-px bg-white/10 my-1" />

          {/* Shape & Annotation Tools */}
          {[
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
            { id: 'rect', icon: Square, label: 'Rect' },
            { id: 'circle', icon: Circle, label: 'Circle' },
            { id: 'crop', icon: Crop, label: 'Crop' },
          ].map(tool => (
            <button key={tool.id} onClick={() => setActiveTool(tool.id as Tool)} className={`p-3 rounded-xl transition-all flex flex-col items-center gap-0.5 w-full ${activeTool === tool.id ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`} title={tool.label}>
              <tool.icon className="w-5 h-5" />
              <span className="text-[8px] font-bold">{tool.label}</span>
            </button>
          ))}

          <div className="w-10 h-px bg-white/10 my-1" />

          {/* Color Picker */}
          <div className="flex flex-col items-center gap-1.5 py-2">
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Color</span>
            <div className="grid grid-cols-2 gap-1">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setActiveColor(color)}
                  className={`size-6 rounded-lg border-2 transition-all hover:scale-110 ${activeColor === color ? 'border-white shadow-lg scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="w-10 h-px bg-white/10 my-1" />

          {/* Stroke Width */}
          <div className="flex flex-col items-center gap-1.5 py-2">
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Size</span>
            <div className="flex flex-col items-center gap-1">
              {STROKE_WIDTHS.map(sw => (
                <button
                  key={sw}
                  onClick={() => setActiveStrokeWidth(sw)}
                  className={`w-12 flex items-center justify-center py-1 rounded-md transition-all ${activeStrokeWidth === sw ? 'bg-indigo-600/30 border border-indigo-500/50' : 'hover:bg-white/5'}`}
                >
                  <div className="rounded-full bg-white" style={{ width: Math.min(sw * 2, 24), height: Math.max(sw / 2, 2) }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#020617] flex items-center justify-center p-8 overflow-auto">
          <div className="relative shadow-2xl" style={{ width: imageCanvasRef.current?.width, height: imageCanvasRef.current?.height }}>
            <canvas ref={imageCanvasRef} className="absolute inset-0 w-full h-full" />
            <canvas
              ref={drawingCanvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              className={`absolute inset-0 w-full h-full ${
                activeTool === 'select' ? 'cursor-default' :
                activeTool === 'pen' || activeTool === 'highlighter' ? 'cursor-crosshair' :
                activeTool === 'eraser' ? 'cursor-cell' :
                activeTool === 'text' ? 'cursor-text' :
                activeTool === 'crop' ? 'cursor-crosshair' :
                'cursor-crosshair'
              }`}
            />
            {/* Floating text input */}
            {textInput.visible && (
              <div
                className="absolute z-50"
                style={{ left: textInput.x / (drawingCanvasRef.current?.width || 1) * 100 + '%', top: textInput.y / (drawingCanvasRef.current?.height || 1) * 100 + '%' }}
              >
                <input
                  autoFocus
                  value={textValue}
                  onChange={e => setTextValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') setTextInput({ x: 0, y: 0, visible: false }); }}
                  onBlur={commitText}
                  className="bg-black/70 border border-indigo-500 rounded-lg px-3 py-2 text-white text-sm outline-none min-w-[120px] backdrop-blur-sm"
                  style={{ color: activeColor, fontSize: activeStrokeWidth * 2 + 12 }}
                  placeholder="Type here..."
                />
              </div>
            )}
            {/* Crop confirmation overlay */}
            {activeTool === 'crop' && cropRect && cropRect.w > 10 && !isDrawing && (
              <div className="absolute z-50 flex gap-2" style={{ left: cropRect.x + cropRect.w / 2 - 40, top: cropRect.y + cropRect.h + 8 }}>
                <button onClick={() => { applyCrop(cropRect); setCropRect(null); }} className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-500 transition-all"><Check className="size-3" /> Crop</button>
                <button onClick={() => { setCropRect(null); const ctx = drawingCanvasRef.current?.getContext('2d'); if (ctx && previewCanvas) ctx.putImageData(previewCanvas, 0, 0); }} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 transition-all"><X className="size-3" /></button>
              </div>
            )}
          </div>
        </div>

        {/* Inspector Panel */}
        <div className="w-80 bg-slate-900/30 border-l border-white/10 flex flex-col">
          <div className="flex p-2 border-b border-white/10">
            {[{ id: 'adjust', icon: SlidersHorizontal }, { id: 'filters', icon: Palette }, { id: 'ai', icon: BrainCircuit }].map(panel => (
              <button key={panel.id} onClick={() => setActivePanel(panel.id as Panel)} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex flex-col items-center gap-1.5 transition-all ${activePanel === panel.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}><panel.icon className="w-4 h-4" />{panel.id}</button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
            {isAiProcessing && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="size-8 animate-spin text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Genius is thinking...</span>
              </div>
            )}
            
            {activePanel === 'adjust' && (
              <div className="space-y-4">
                {[{ label: 'Brightness', key: 'brightness', min: 50, max: 150 }, { label: 'Contrast', key: 'contrast', min: 50, max: 150 }, { label: 'Saturation', key: 'saturate', min: 0, max: 200 }, { label: 'Blur', key: 'blur', min: 0, max: 10 }].map(adj => (
                  <div key={adj.key} className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">{adj.label}</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min={adj.min} max={adj.max} value={adjustments[adj.key as keyof typeof adjustments]} onChange={e => setAdjustments(s => ({ ...s, [adj.key]: Number(e.target.value) }))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                      <span className="text-xs font-mono text-slate-500 w-8 text-right">{adjustments[adj.key as keyof typeof adjustments]}</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => setAdjustments({ brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, invert: 0 })} className="w-full mt-4 py-2 bg-white/5 text-slate-300 rounded-lg text-xs font-bold hover:bg-white/10">Reset Adjustments</button>
              </div>
            )}

            {activePanel === 'filters' && (
              <div className="grid grid-cols-2 gap-4">
                {[{ name: 'None', filter: 'none' }, { name: 'Grayscale', filter: 'grayscale' }, { name: 'Sepia', filter: 'sepia' }, { name: 'Vintage', filter: 'vintage' }, { name: 'Invert', filter: 'invert' }].map(f => (
                  <button key={f.name} onClick={() => applyFilter(f.filter)} className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all">
                    <img src={imageUrl} className="w-full h-full object-cover" style={{ filter: f.filter === 'vintage' ? 'sepia(0.6) contrast(1.1) brightness(0.9) saturate(0.9)' : (f.filter !== 'none' ? `${f.filter}(1)` : 'none') }} />
                    <div className="absolute inset-x-0 bottom-0 p-1 bg-black/50 text-center"><span className="text-xs font-bold">{f.name}</span></div>
                  </button>
                ))}
              </div>
            )}

            {activePanel === 'ai' && (
              <div className="space-y-6">
                <button onClick={() => handleAiEdit('auto enhance this image for clarity, color balance, and lighting')} className="w-full flex items-center gap-3 p-4 bg-indigo-600/20 text-indigo-300 rounded-xl border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all">
                  <Wand2 className="w-5 h-5" />
                  <span className="text-sm font-bold">Auto Enhance</span>
                </button>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400">Describe your edit:</label>
                  <div className="relative">
                    <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiEdit(aiPrompt)} placeholder="e.g., remove the background..." className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pr-10 text-sm outline-none focus:border-indigo-500" />
                    <button onClick={() => handleAiEdit(aiPrompt)} className="absolute right-1 top-1 bottom-1 p-2 text-slate-400 hover:text-white transition-colors"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnnotator;