import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Save, Undo2, Redo2, Type, MousePointer2, 
  Pen, Eraser, Square, Circle, ArrowRight, ArrowUpRight,
  Download, Palette, Highlighter, Star, Move, Trash2, 
  Crop, Check, SlidersHorizontal, Sparkles, Wand2, BrainCircuit,
  Loader2, Send, Droplet, Grid3X3, Stamp, MessageSquare,
  Copy, Share2, ChevronDown, Minus, Plus, Tag, Clock,
  Triangle, Hexagon, Pentagon, RectangleHorizontal, 
  ZoomIn, ZoomOut, RotateCcw, FlipHorizontal, FlipVertical,
  Eye, EyeOff, Layers, Lock, Unlock, Scissors, ImageIcon
} from 'lucide-react';
import { editImageWithAi } from '../services/geminiService';

interface SnapEditorProps {
  imageUrl: string;
  onSave: (newImageUrl: string) => void;
  onClose: () => void;
  initialTitle?: string;
}

type Tool = 'select' | 'pen' | 'highlighter' | 'eraser' | 'text' | 'rect' | 'circle' | 'arrow' | 'crop' | 'callout' | 'stamp' | 'fill' | 'move' | 'blur' | 'line';
type TabSection = 'editor' | 'library' | 'assets' | 'capture' | 'create';

// Quick style presets for arrows
const ARROW_STYLES = [
  { color: '#ef4444', outline: true, name: 'Red Outline' },
  { color: '#22c55e', outline: false, name: 'Green Solid' },
  { color: '#22c55e', outline: true, name: 'Green Outline' },
  { color: '#3b82f6', outline: false, name: 'Blue Solid' },
  { color: '#eab308', outline: false, name: 'Yellow Solid' },
  { color: '#ef4444', outline: false, name: 'Red Solid' },
  { color: '#22c55e', dashed: true, name: 'Green Dashed' },
  { color: '#3b82f6', dashed: true, name: 'Blue Dashed' },
  { color: '#ef4444', dashed: true, name: 'Red Dashed' },
  { color: '#eab308', dashed: true, name: 'Yellow Dashed' },
  { color: '#3b82f6', outline: true, name: 'Blue Outline' },
  { color: '#eab308', outline: true, name: 'Yellow Outline' },
];

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#000000', '#ffffff', '#64748b'];
const STROKE_WIDTHS = [1, 2, 4, 6, 8, 10, 12];
const THEMES = ['Starter', 'Professional', 'Vibrant', 'Minimal', 'Dark'];

const SnapEditor: React.FC<SnapEditorProps> = ({ imageUrl, onSave, onClose, initialTitle }) => {
  // Tool state
  const [activeTool, setActiveTool] = useState<Tool>('arrow');
  const [activeColor, setActiveColor] = useState('#ef4444');
  const [activeStrokeWidth, setActiveStrokeWidth] = useState(10);
  const [activeTheme, setActiveTheme] = useState('Starter');
  const [activeTab, setActiveTab] = useState<TabSection>('editor');
  
  // Tool properties
  const [opacity, setOpacity] = useState(100);
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [arrowStartSize, setArrowStartSize] = useState(3);
  const [arrowEndSize, setArrowEndSize] = useState(3);
  const [fillEnabled, setFillEnabled] = useState(false);
  const [fillColor, setFillColor] = useState('#ffffff');
  
  // Canvas state
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<ImageData | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [textValue, setTextValue] = useState('');
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  
  // Zoom & view
  const [zoom, setZoom] = useState(100);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  
  // AI
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [stampCount, setStampCount] = useState(1);
  const [blurRect, setBlurRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);

  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (textInput.visible) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const shortcuts: Record<string, Tool> = {
        v: 'select', a: 'arrow', l: 'line', d: 'pen', h: 'highlighter',
        e: 'eraser', t: 'text', c: 'callout', r: 'rect', o: 'circle',
        x: 'crop', b: 'blur', p: 'stamp', f: 'fill', m: 'move',
      };
      const tool = shortcuts[e.key.toLowerCase()];
      if (tool) { e.preventDefault(); setActiveTool(tool); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [textInput.visible, historyStep, history.length]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      setCanvasDimensions({ width: img.width, height: img.height });
      initCanvases(img);
    };
  }, [imageUrl]);

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
    
    saveDrawingState();
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

  const drawArrowhead = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, size: number = 15) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(angle - Math.PI / 6), toY - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - size * Math.cos(angle + Math.PI / 6), toY - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const setLineDash = (ctx: CanvasRenderingContext2D) => {
    if (lineStyle === 'dashed') {
      ctx.setLineDash([10, 5]);
    } else if (lineStyle === 'dotted') {
      ctx.setLineDash([2, 4]);
    } else {
      ctx.setLineDash([]);
    }
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (activeTool === 'select' || activeTool === 'move') return;
    const { x, y } = getCoords(e);

    if (activeTool === 'text' || activeTool === 'callout') {
      setTextInput({ x, y, visible: true });
      setTextValue('');
      return;
    }

    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Stamp: place a numbered marker on click
    if (activeTool === 'stamp') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = opacity / 100;
      const r = activeStrokeWidth * 2.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = activeColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${r * 1.1}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(stampCount), x, y + 1);
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
      setStampCount(prev => prev + 1);
      saveDrawingState();
      return;
    }

    // Fill: flood the canvas with color
    if (activeTool === 'fill') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = opacity / 100;
      ctx.fillStyle = fillEnabled ? fillColor : activeColor;
      ctx.fillRect(0, 0, drawingCanvasRef.current!.width, drawingCanvasRef.current!.height);
      saveDrawingState();
      return;
    }

    setIsDrawing(true);

    if (['rect', 'circle', 'arrow', 'crop', 'line', 'blur'].includes(activeTool)) {
      setShapeStart({ x, y });
      const canvas = drawingCanvasRef.current!;
      setPreviewCanvas(ctx.getImageData(0, 0, canvas.width, canvas.height));
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = activeTool === 'highlighter' ? activeColor + '66' : activeColor;
    ctx.lineWidth = activeTool === 'highlighter' ? activeStrokeWidth * 3 : activeStrokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.globalAlpha = activeTool === 'highlighter' ? 0.35 : opacity / 100;
    setLineDash(ctx);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (['rect', 'circle', 'arrow', 'crop', 'line', 'blur'].includes(activeTool) && shapeStart && previewCanvas) {
      ctx.putImageData(previewCanvas, 0, 0);
      ctx.strokeStyle = activeTool === 'crop' ? '#a855f7' : activeColor;
      ctx.fillStyle = activeColor;
      ctx.lineWidth = activeTool === 'crop' ? 2 : activeStrokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = opacity / 100;
      setLineDash(ctx);

      const w = x - shapeStart.x;
      const h = y - shapeStart.y;

      if (activeTool === 'rect') {
        ctx.beginPath();
        ctx.rect(shapeStart.x, shapeStart.y, w, h);
        if (fillEnabled) {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
      } else if (activeTool === 'circle') {
        const rx = Math.abs(w) / 2;
        const ry = Math.abs(h) / 2;
        const cx = shapeStart.x + w / 2;
        const cy = shapeStart.y + h / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (fillEnabled) {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
      } else if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(shapeStart.x, shapeStart.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(shapeStart.x, shapeStart.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);
        drawArrowhead(ctx, shapeStart.x, shapeStart.y, x, y, arrowEndSize * activeStrokeWidth);
      } else if (activeTool === 'crop') {
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.rect(shapeStart.x, shapeStart.y, w, h);
        ctx.stroke();
        ctx.setLineDash([]);
        setCropRect({ x: Math.min(shapeStart.x, x), y: Math.min(shapeStart.y, y), w: Math.abs(w), h: Math.abs(h) });
      } else if (activeTool === 'blur') {
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(shapeStart.x, shapeStart.y, w, h);
        ctx.stroke();
        ctx.setLineDash([]);
        setBlurRect({ x: Math.min(shapeStart.x, x), y: Math.min(shapeStart.y, y), w: Math.abs(w), h: Math.abs(h) });
      }
      return;
    }

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
      ctx.setLineDash([]);
    }

    if (activeTool === 'crop' && cropRect && cropRect.w > 10 && cropRect.h > 10) {
      applyCrop(cropRect);
      setCropRect(null);
    }

    if (activeTool === 'blur' && blurRect && blurRect.w > 5 && blurRect.h > 5) {
      applyBlur(blurRect);
      setBlurRect(null);
    }

    setShapeStart(null);
    setPreviewCanvas(null);
    saveDrawingState();
  };

  const commitText = () => {
    if (!textValue.trim() || !textInput.visible) return;
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    const fontSize = activeStrokeWidth * 4 + 14;
    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = activeColor;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = opacity / 100;
    
    if (activeTool === 'callout') {
      // Draw callout background
      const textMetrics = ctx.measureText(textValue);
      const padding = 12;
      const bgWidth = textMetrics.width + padding * 2;
      const bgHeight = fontSize + padding * 2;
      
      ctx.fillStyle = fillEnabled ? fillColor : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(textInput.x - padding, textInput.y - padding, bgWidth, bgHeight, 8);
      ctx.fill();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = activeColor;
    }
    
    ctx.fillText(textValue, textInput.x, textInput.y + fontSize);
    setTextInput({ x: 0, y: 0, visible: false });
    setTextValue('');
    saveDrawingState();
  };

  const applyCrop = (rect: { x: number; y: number; w: number; h: number }) => {
    const imageCanvas = imageCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    if (!imageCanvas || !drawingCanvas || !imageRef.current) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rect.w;
    tempCanvas.height = rect.h;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(imageRef.current, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    tempCtx.drawImage(drawingCanvas, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

    const croppedUrl = tempCanvas.toDataURL('image/png');
    const newImg = new Image();
    newImg.crossOrigin = 'anonymous';
    newImg.src = croppedUrl;
    newImg.onload = () => {
      imageRef.current = newImg;
      setCanvasDimensions({ width: rect.w, height: rect.h });
      [imageCanvasRef, drawingCanvasRef].forEach(ref => {
        const c = ref.current;
        if (c) { c.width = rect.w; c.height = rect.h; }
      });
      const imageCtx = imageCanvas.getContext('2d');
      if (imageCtx) { imageCtx.drawImage(newImg, 0, 0); }
      saveDrawingState();
    };
  };

  const applyBlur = (rect: { x: number; y: number; w: number; h: number }) => {
    const canvas = drawingCanvasRef.current;
    const imageCanvas = imageCanvasRef.current;
    if (!canvas || !imageCanvas || !imageRef.current) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageCanvas.width;
    tempCanvas.height = imageCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.drawImage(imageRef.current, 0, 0);
    tempCtx.drawImage(canvas, 0, 0);
    const pixelSize = Math.max(6, Math.floor(activeStrokeWidth * 1.5));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = tempCtx.getImageData(rect.x, rect.y, rect.w, rect.h);
    for (let py = 0; py < rect.h; py += pixelSize) {
      for (let px = 0; px < rect.w; px += pixelSize) {
        const i = (py * rect.w + px) * 4;
        if (i < imgData.data.length - 3) {
          ctx.fillStyle = `rgb(${imgData.data[i]},${imgData.data[i + 1]},${imgData.data[i + 2]})`;
          ctx.fillRect(rect.x + px, rect.y + py, pixelSize, pixelSize);
        }
      }
    }
  };

  const clearAll = () => {
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx || !drawingCanvasRef.current) return;
    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    setStampCount(1);
    saveDrawingState();
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
    
    ctx.drawImage(imageRef.current, 0, 0);
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

  const handleCopyToClipboard = async () => {
    const dataUrl = getCompositeImage();
    const blob = await (await fetch(dataUrl)).blob();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  };

  const applyQuickStyle = (style: typeof ARROW_STYLES[0]) => {
    setActiveColor(style.color);
    if (style.dashed) {
      setLineStyle('dashed');
    } else {
      setLineStyle('solid');
    }
    setActiveTool('arrow');
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
      };
    }
    setAiPrompt('');
    setIsAiProcessing(false);
    setShowAiPanel(false);
  };

  const mainTools = [
    { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
    { id: 'arrow', icon: ArrowUpRight, label: 'Arrow', shortcut: 'A' },
    { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
    { id: 'pen', icon: Pen, label: 'Draw', shortcut: 'D' },
    { id: 'highlighter', icon: Highlighter, label: 'Highlight', shortcut: 'H' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
    { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
    { id: 'rect', icon: Square, label: 'Rect', shortcut: 'R' },
    { id: 'circle', icon: Circle, label: 'Ellipse', shortcut: 'O' },
    { id: 'crop', icon: Crop, label: 'Crop', shortcut: 'X' },
  ];

  const moreTools = [
    { id: 'callout', icon: MessageSquare, label: 'Callout', shortcut: 'C' },
    { id: 'stamp', icon: Stamp, label: 'Stamp', shortcut: 'P' },
    { id: 'fill', icon: Droplet, label: 'Fill', shortcut: 'F' },
    { id: 'blur', icon: EyeOff, label: 'Blur', shortcut: 'B' },
    { id: 'move', icon: Move, label: 'Move', shortcut: 'M' },
  ];

  return (
    <div className="fixed inset-0 z-[2000] bg-[#f0f4f8] flex flex-col font-sans">
      {/* Top Navigation Tabs */}
      <div className="h-12 bg-[#e8eef4] border-b border-[#c8d4e0] flex items-center px-2 shrink-0">
        <div className="flex items-center">
          {/* Show Logo */}
          <div className="flex items-center gap-2 px-4 py-2 mr-4">
            <div className="size-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">S</span>
            </div>
            <span className="text-sm font-bold text-slate-700">{initialTitle || 'ShowTutorialImage'}</span>
          </div>
          
          {/* Navigation Tabs */}
          {[
            { id: 'editor', icon: Pen, label: 'Editor' },
            { id: 'library', icon: Grid3X3, label: 'Library' },
            { id: 'assets', icon: ImageIcon, label: 'Assets' },
            { id: 'capture', icon: Scissors, label: 'Capture' },
            { id: 'create', icon: Plus, label: 'Create' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabSection)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-t-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-white border-t border-x border-[#c8d4e0] -mb-px' 
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <tab.icon className="size-4" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onClose} className="text-xs text-blue-600 hover:underline">Back to Captures ↩</button>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="h-16 bg-white border-b border-[#d1d9e0] flex items-center px-4 gap-1 shrink-0">
        {/* Tools */}
        {mainTools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as Tool)}
            className={`flex flex-col items-center gap-0.5 p-2 min-w-[44px] rounded-lg transition-all ${
              activeTool === tool.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <tool.icon className="size-5" />
            <span className="text-[9px] font-medium">{tool.label}</span>
          </button>
        ))}
        
        <div className="w-px h-10 bg-slate-200 mx-1" />
        
        {/* More Tools */}
        <div className="relative">
          <button 
            onClick={() => setShowMoreTools(!showMoreTools)}
            className={`flex flex-col items-center gap-0.5 p-2 min-w-[44px] rounded-lg transition-all ${showMoreTools ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <SlidersHorizontal className="size-5" />
            <span className="text-[9px] font-medium">More</span>
          </button>
          {showMoreTools && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 flex gap-1 z-50">
              {moreTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => { setActiveTool(tool.id as Tool); setShowMoreTools(false); }}
                  className={`flex flex-col items-center gap-0.5 p-2 min-w-[48px] rounded-lg transition-all ${
                    activeTool === tool.id ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title={`${tool.label} (${tool.shortcut})`}
                >
                  <tool.icon className="size-5" />
                  <span className="text-[9px] font-medium">{tool.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="w-px h-10 bg-slate-200 mx-1" />

        {/* Undo / Redo / Clear */}
        <button onClick={undo} disabled={historyStep <= 0} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (⌘Z)">
          <Undo2 className="size-5" />
        </button>
        <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (⌘⇧Z)">
          <Redo2 className="size-5" />
        </button>
        <button onClick={clearAll} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100" title="Clear All Annotations">
          <Trash2 className="size-5" />
        </button>
        
        <div className="w-px h-10 bg-slate-200 mx-1" />
        <button onClick={handleDownload} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100" title="Download">
          <Download className="size-5" />
        </button>

        <div className="flex-1" />
        
        {/* Right Side Actions */}
        <button 
          onClick={handleCopyToClipboard}
          className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
        >
          <Copy className="size-4" />
          <span className="text-sm font-medium">Copy All</span>
        </button>
        
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00b386] hover:bg-[#00a077] text-white rounded-lg transition-all font-semibold text-sm"
        >
          <Share2 className="size-4" />
          Share Link
          <ChevronDown className="size-3" />
        </button>
      </div>

      {/* Info Banner (optional) */}
      {showBanner && (
        <div className="h-8 bg-[#0066cc] text-white flex items-center justify-center gap-4 text-sm shrink-0">
          <span>Get more out of Show! Join us for one of our free, live Show training webinars.</span>
          <button onClick={() => window.open('https://getshowapp.com', '_blank')} className="px-3 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold transition-all">
            RSVP
          </button>
          <button onClick={() => setShowBanner(false)} className="ml-4 text-white/80 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 bg-[#c8d4e0] flex items-center justify-center p-8 overflow-auto"
        >
          <div 
            className="relative bg-white shadow-xl"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center'
            }}
          >
            {/* Resize handles */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border border-slate-400 bg-white cursor-nw-resize" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 border border-slate-400 bg-white cursor-n-resize" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border border-slate-400 bg-slate-400 cursor-ne-resize" />
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 border border-slate-400 bg-white cursor-w-resize" />
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 border border-slate-400 bg-white cursor-e-resize" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border border-slate-400 bg-white cursor-sw-resize" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 border border-slate-400 bg-white cursor-s-resize" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border border-slate-400 bg-white cursor-se-resize" />
            
            <canvas ref={imageCanvasRef} className="block" />
            <canvas
              ref={drawingCanvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              className={`absolute inset-0 ${
                activeTool === 'select' || activeTool === 'move' ? 'cursor-default' :
                activeTool === 'pen' || activeTool === 'highlighter' ? 'cursor-crosshair' :
                activeTool === 'eraser' ? 'cursor-cell' :
                activeTool === 'text' || activeTool === 'callout' ? 'cursor-text' :
                'cursor-crosshair'
              }`}
            />
            
            {/* Text input overlay */}
            {textInput.visible && (
              <div
                className="absolute z-50"
                style={{ 
                  left: textInput.x / (drawingCanvasRef.current?.width || 1) * 100 + '%', 
                  top: textInput.y / (drawingCanvasRef.current?.height || 1) * 100 + '%' 
                }}
              >
                <input
                  autoFocus
                  value={textValue}
                  onChange={e => setTextValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') setTextInput({ x: 0, y: 0, visible: false }); }}
                  onBlur={commitText}
                  className="bg-white border-2 border-blue-500 rounded px-2 py-1 text-sm outline-none min-w-[150px] shadow-lg"
                  style={{ color: activeColor }}
                  placeholder="Type here..."
                />
              </div>
            )}
            
            {/* Crop confirmation */}
            {activeTool === 'crop' && cropRect && cropRect.w > 10 && !isDrawing && (
              <div 
                className="absolute z-50 flex gap-2" 
                style={{ left: cropRect.x + cropRect.w / 2 - 40, top: cropRect.y + cropRect.h + 8 }}
              >
                <button 
                  onClick={() => { applyCrop(cropRect); setCropRect(null); }} 
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold flex items-center gap-1 hover:bg-blue-700"
                >
                  <Check className="size-3" /> Crop
                </button>
                <button 
                  onClick={() => { setCropRect(null); const ctx = drawingCanvasRef.current?.getContext('2d'); if (ctx && previewCanvas) ctx.putImageData(previewCanvas, 0, 0); }} 
                  className="px-3 py-1.5 bg-slate-200 rounded text-xs font-semibold hover:bg-slate-300"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Quick Styles & Tool Properties */}
        <div className="w-72 bg-white border-l border-[#d1d9e0] flex flex-col shrink-0">
          {/* Quick Styles Section */}
          <div className="border-b border-[#e5e9ed]">
            <div className="flex items-center justify-between px-4 py-3 bg-[#f7f9fb]">
              <span className="text-sm font-semibold text-slate-700">Quick Styles</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Theme:</span>
                <select 
                  value={activeTheme}
                  onChange={e => setActiveTheme(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded px-2 py-1"
                >
                  {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => setActiveTheme(activeTheme === 'Starter' ? 'Professional' : activeTheme === 'Professional' ? 'Vibrant' : activeTheme === 'Vibrant' ? 'Minimal' : activeTheme === 'Minimal' ? 'Dark' : 'Starter')} className="p-1 hover:bg-slate-200 rounded" title="Cycle theme">
                  <SlidersHorizontal className="size-3" />
                </button>
              </div>
            </div>
            
            {/* Arrow Style Grid */}
            <div className="p-3 grid grid-cols-4 gap-2">
              {ARROW_STYLES.map((style, i) => (
                <button
                  key={i}
                  onClick={() => applyQuickStyle(style)}
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all hover:scale-105 ${
                    activeColor === style.color && activeTool === 'arrow'
                      ? 'border-blue-500 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  style={{ backgroundColor: '#f8fafc' }}
                  title={style.name}
                >
                  <ArrowUpRight 
                    className="size-6"
                    style={{ 
                      color: style.color,
                      strokeWidth: style.outline ? 2 : 3,
                      strokeDasharray: style.dashed ? '4 2' : undefined
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tool Properties Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 bg-[#f7f9fb] border-b border-[#e5e9ed]">
              <span className="text-sm font-semibold text-slate-700">Tool Properties</span>
              <button onClick={() => setShowHelp(!showHelp)} className="text-blue-600 hover:text-blue-700 relative">
                <span className="text-xs">?</span>
                {showHelp && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 text-left">
                    <p className="text-xs text-slate-600 leading-relaxed">Adjust tool properties like opacity, width, color and style. Changes apply to your next drawing stroke.</p>
                    <button onClick={(e) => { e.stopPropagation(); setShowHelp(false); }} className="mt-2 text-[10px] text-blue-600 font-bold">Got it</button>
                  </div>
                )}
              </button>
            </div>
            
            <div className="p-4 space-y-5">
              {/* Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600">Opacity:</label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={opacity}
                      onChange={e => setOpacity(Number(e.target.value))}
                      className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs text-slate-500 w-12 text-right">{opacity}%</span>
                  </div>
                </div>
              </div>

              {/* Width */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600">Width:</label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="range" 
                      min="1" 
                      max="24" 
                      value={activeStrokeWidth}
                      onChange={e => setActiveStrokeWidth(Number(e.target.value))}
                      className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs text-slate-500 w-12 text-right">{activeStrokeWidth} pt</span>
                  </div>
                </div>
              </div>

              {/* Style */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600">Style:</label>
                  <div className="flex items-center gap-2">
                    <select 
                      value={lineStyle}
                      onChange={e => setLineStyle(e.target.value as any)}
                      className="text-xs bg-white border border-slate-300 rounded px-2 py-1"
                    >
                      <option value="solid">━━━━━</option>
                      <option value="dashed">┅┅┅┅┅</option>
                      <option value="dotted">┈┈┈┈┈</option>
                    </select>
                    <select 
                      value={arrowEndSize <= 3 ? '→' : arrowEndSize <= 6 ? '⟶' : '➔'}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === '→') setArrowEndSize(3);
                        else if (val === '⟶') setArrowEndSize(6);
                        else setArrowEndSize(10);
                      }}
                      className="text-xs bg-white border border-slate-300 rounded px-2 py-1"
                    >
                      <option>→</option>
                      <option>⟶</option>
                      <option>➔</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Arrow Start/End Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600">Start size:</label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      value={arrowStartSize}
                      onChange={e => setArrowStartSize(Number(e.target.value))}
                      className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs text-slate-500 w-8 text-right">{arrowStartSize}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600">End size:</label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      value={arrowEndSize}
                      onChange={e => setArrowEndSize(Number(e.target.value))}
                      className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs text-slate-500 w-8 text-right">{arrowEndSize}</span>
                  </div>
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Color:</label>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setActiveColor(color)}
                      className={`size-7 rounded border-2 transition-all hover:scale-110 ${
                        activeColor === color ? 'border-blue-500 shadow-md' : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Fill Toggle */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-600">Fill:</label>
                <button
                  onClick={() => setFillEnabled(!fillEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    fillEnabled ? 'bg-blue-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    fillEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
                {fillEnabled && (
                  <input 
                    type="color" 
                    value={fillColor}
                    onChange={e => setFillColor(e.target.value)}
                    className="size-6 rounded cursor-pointer"
                  />
                )}
              </div>

              {/* Clear All Button */}
              <button onClick={clearAll} className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium text-slate-700 transition-all">
                Clear All Annotations
              </button>
            </div>
          </div>

          {/* AI Panel Toggle */}
          <div className="border-t border-[#e5e9ed] p-3">
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className="w-full flex items-center gap-2 justify-center py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition-all"
            >
              <Wand2 className="size-4" />
              AI Enhance
            </button>
            
            {showAiPanel && (
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAiEdit(aiPrompt)}
                  placeholder="Describe your edit..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
                <button
                  onClick={() => handleAiEdit(aiPrompt || 'auto enhance')}
                  disabled={isAiProcessing}
                  className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium"
                >
                  {isAiProcessing ? <Loader2 className="size-4 animate-spin mx-auto" /> : 'Apply'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-8 bg-white border-t border-[#d1d9e0] flex items-center px-4 justify-between text-xs text-slate-600 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => { /* Recent captures - scroll to recent section */ }} className="flex items-center gap-1 hover:text-slate-900" title="View recent edits">
            <Clock className="size-3" />
            Recent
          </button>
          <button onClick={() => { /* Tagging - future feature */ }} className="flex items-center gap-1 hover:text-slate-900" title="Add tag to capture">
            <Tag className="size-3" />
            Tag
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="p-1 hover:bg-slate-100 rounded">
              <ZoomOut className="size-3" />
            </button>
            <span className="w-12 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(400, z + 25))} className="p-1 hover:bg-slate-100 rounded">
              <ZoomIn className="size-3" />
            </button>
            <span className="text-slate-400 mx-1">•</span>
          </div>
          
          {/* Dimensions */}
          <span>{canvasDimensions.width} x {canvasDimensions.height} @2x</span>
          <span className="text-slate-400">•</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setShowAiPanel(!showAiPanel)} className="flex items-center gap-1 hover:text-slate-900">
            <Sparkles className="size-3" />
            Effects
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1 hover:text-slate-900">
            <Download className="size-3" />
            Download
          </button>
        </div>
      </div>

      {/* Close Button (Top Right) */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all z-50"
      >
        <X className="size-5" />
      </button>
    </div>
  );
};

export default SnapEditor;
