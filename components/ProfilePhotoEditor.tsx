
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Upload, Download, RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
  Sun, Contrast, Droplets, Sparkles, Crop, ZoomIn, ZoomOut,
  Linkedin, Twitter, Instagram, Facebook, Youtube, Globe,
  User, Camera, Check, ChevronDown, Move, Maximize2, Undo2, Redo2, Image as ImageIcon
} from 'lucide-react';

// ═══════════════════════════════════════════════════
// SOCIAL MEDIA PRESETS
// ═══════════════════════════════════════════════════

const SOCIAL_PRESETS = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, width: 400, height: 400, label: '400×400', color: '#0A66C2', desc: 'Profile Photo' },
  { id: 'linkedin-banner', name: 'LinkedIn Banner', icon: Linkedin, width: 1584, height: 396, label: '1584×396', color: '#0A66C2', desc: 'Cover Image' },
  { id: 'twitter', name: 'X / Twitter', icon: Twitter, width: 400, height: 400, label: '400×400', color: '#1DA1F2', desc: 'Profile Photo' },
  { id: 'twitter-header', name: 'X Header', icon: Twitter, width: 1500, height: 500, label: '1500×500', color: '#1DA1F2', desc: 'Header Image' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, width: 320, height: 320, label: '320×320', color: '#E4405F', desc: 'Profile Photo' },
  { id: 'instagram-post', name: 'IG Post', icon: Instagram, width: 1080, height: 1080, label: '1080×1080', color: '#E4405F', desc: 'Square Post' },
  { id: 'instagram-story', name: 'IG Story', icon: Instagram, width: 1080, height: 1920, label: '1080×1920', color: '#E4405F', desc: 'Story / Reel' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, width: 170, height: 170, label: '170×170', color: '#1877F2', desc: 'Profile Photo' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, width: 800, height: 800, label: '800×800', color: '#FF0000', desc: 'Channel Icon' },
  { id: 'youtube-banner', name: 'YT Banner', icon: Youtube, width: 2560, height: 1440, label: '2560×1440', color: '#FF0000', desc: 'Channel Banner' },
  { id: 'custom', name: 'Custom', icon: Globe, width: 500, height: 500, label: 'Custom', color: '#8B5CF6', desc: 'Any Size' },
];

const ENHANCEMENT_PRESETS = [
  { id: 'none', name: 'Original', brightness: 100, contrast: 100, saturate: 100, blur: 0, sepia: 0, grayscale: 0 },
  { id: 'professional', name: 'Professional', brightness: 105, contrast: 110, saturate: 95, blur: 0, sepia: 0, grayscale: 0 },
  { id: 'warm-pro', name: 'Warm Pro', brightness: 108, contrast: 105, saturate: 110, blur: 0, sepia: 12, grayscale: 0 },
  { id: 'clean', name: 'Clean', brightness: 110, contrast: 108, saturate: 90, blur: 0, sepia: 0, grayscale: 0 },
  { id: 'corporate', name: 'Corporate', brightness: 103, contrast: 115, saturate: 85, blur: 0, sepia: 0, grayscale: 0 },
  { id: 'creative', name: 'Creative', brightness: 100, contrast: 120, saturate: 130, blur: 0, sepia: 0, grayscale: 0 },
  { id: 'bw-classic', name: 'B&W Classic', brightness: 110, contrast: 125, saturate: 0, blur: 0, sepia: 0, grayscale: 100 },
  { id: 'cinematic', name: 'Cinematic', brightness: 95, contrast: 130, saturate: 110, blur: 0, sepia: 8, grayscale: 0 },
];

const BACKGROUND_COLORS = [
  { id: 'none', name: 'None', value: 'transparent' },
  { id: 'white', name: 'White', value: '#FFFFFF' },
  { id: 'light-gray', name: 'Light Gray', value: '#F3F4F6' },
  { id: 'blue', name: 'LinkedIn Blue', value: '#0A66C2' },
  { id: 'dark', name: 'Dark', value: '#1F2937' },
  { id: 'black', name: 'Black', value: '#000000' },
  { id: 'gradient-blue', name: 'Blue Gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-pro', name: 'Pro Gradient', value: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)' },
  { id: 'gradient-warm', name: 'Warm Glow', value: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' },
  { id: 'gradient-mint', name: 'Mint', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
];

interface ProfilePhotoEditorProps {
  onClose: () => void;
  initialImage?: string;
}

const ProfilePhotoEditor: React.FC<ProfilePhotoEditorProps> = ({ onClose, initialImage }) => {
  // Image state
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  const [activePreset, setActivePreset] = useState('linkedin');
  const [activeTab, setActiveTab] = useState<'presets' | 'enhance' | 'adjust' | 'background'>('presets');

  // Transform state
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Enhancement state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [activeEnhancement, setActiveEnhancement] = useState('none');

  // Background
  const [bgColor, setBgColor] = useState('transparent');
  const [activeBgId, setActiveBgId] = useState('none');

  // Shape
  const [cropShape, setCropShape] = useState<'square' | 'circle' | 'rounded'>('square');

  // Custom size
  const [customWidth, setCustomWidth] = useState(500);
  const [customHeight, setCustomHeight] = useState(500);

  // History
  const [history, setHistory] = useState<Array<{rotation: number, flipH: boolean, flipV: boolean, zoom: number, panX: number, panY: number, brightness: number, contrast: number, saturate: number, blur: number, sepia: number, grayscale: number}>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const selectedPreset = SOCIAL_PRESETS.find(p => p.id === activePreset) || SOCIAL_PRESETS[0];
  const outputWidth = activePreset === 'custom' ? customWidth : selectedPreset.width;
  const outputHeight = activePreset === 'custom' ? customHeight : selectedPreset.height;
  const aspectRatio = outputWidth / outputHeight;

  // Save state to history
  const saveToHistory = useCallback(() => {
    const state = { rotation, flipH, flipV, zoom, panX, panY, brightness, contrast, saturate, blur, sepia, grayscale };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), state]);
    setHistoryIndex(prev => prev + 1);
  }, [rotation, flipH, flipV, zoom, panX, panY, brightness, contrast, saturate, blur, sepia, grayscale, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      applyState(prev);
      setHistoryIndex(i => i - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      applyState(next);
      setHistoryIndex(i => i + 1);
    }
  };

  const applyState = (s: typeof history[0]) => {
    setRotation(s.rotation);
    setFlipH(s.flipH);
    setFlipV(s.flipV);
    setZoom(s.zoom);
    setPanX(s.panX);
    setPanY(s.panY);
    setBrightness(s.brightness);
    setContrast(s.contrast);
    setSaturate(s.saturate);
    setBlur(s.blur);
    setSepia(s.sepia);
    setGrayscale(s.grayscale);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageSrc(ev.target?.result as string);
      resetEdits();
    };
    reader.readAsDataURL(file);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageSrc(ev.target?.result as string);
        resetEdits();
      };
      reader.readAsDataURL(file);
    }
  };

  const resetEdits = () => {
    setRotation(0); setFlipH(false); setFlipV(false); setZoom(100); setPanX(0); setPanY(0);
    setBrightness(100); setContrast(100); setSaturate(100); setBlur(0); setSepia(0); setGrayscale(0); setSharpness(0);
    setActiveEnhancement('none');
    setHistory([]); setHistoryIndex(-1);
  };

  // Load image into ref
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imageRef.current = img; };
    img.src = imageSrc;
  }, [imageSrc]);

  // Get CSS filter string
  const getFilterStyle = () =>
    `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%)`;

  // Get transform string
  const getTransformStyle = () =>
    `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) scale(${zoom / 100}) translate(${panX}px, ${panY}px)`;

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    if (isDragging) { setIsDragging(false); saveToHistory(); }
  };

  // Apply enhancement preset
  const applyEnhancement = (id: string) => {
    const p = ENHANCEMENT_PRESETS.find(e => e.id === id);
    if (p) {
      setBrightness(p.brightness); setContrast(p.contrast); setSaturate(p.saturate);
      setBlur(p.blur); setSepia(p.sepia); setGrayscale(p.grayscale);
      setActiveEnhancement(id);
      saveToHistory();
    }
  };

  // Export
  const handleExport = () => {
    if (!imageRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    if (bgColor !== 'transparent') {
      if (bgColor.startsWith('linear-gradient')) {
        // Parse gradient
        const colors = bgColor.match(/#[a-fA-F0-9]{6}/g) || ['#000000', '#333333'];
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, colors[0]);
        grad.addColorStop(1, colors[1] || colors[0]);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bgColor;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Circle clip
    if (cropShape === 'circle') {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
      ctx.clip();
    } else if (cropShape === 'rounded') {
      const r = Math.min(canvas.width, canvas.height) * 0.1;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(canvas.width - r, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
      ctx.lineTo(canvas.width, canvas.height - r);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
      ctx.lineTo(r, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.clip();
    }

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%)`;

    // Apply transforms
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.scale(zoom / 100, zoom / 100);
    ctx.translate(panX * (outputWidth / 400), panY * (outputHeight / 400));

    const img = imageRef.current;
    const imgAspect = img.width / img.height;
    let drawW, drawH;
    if (imgAspect > aspectRatio) {
      drawH = canvas.height;
      drawW = drawH * imgAspect;
    } else {
      drawW = canvas.width;
      drawH = drawW / imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Download
    const link = document.createElement('a');
    const presetName = selectedPreset.name.replace(/\s+/g, '-').toLowerCase();
    link.download = `profile-photo-${presetName}-${outputWidth}x${outputHeight}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Render preview dimensions (fit to viewport)
  const previewMaxW = 440;
  const previewMaxH = 440;
  let previewW: number, previewH: number;
  if (aspectRatio >= 1) {
    previewW = Math.min(previewMaxW, outputWidth);
    previewH = previewW / aspectRatio;
    if (previewH > previewMaxH) { previewH = previewMaxH; previewW = previewH * aspectRatio; }
  } else {
    previewH = Math.min(previewMaxH, outputHeight);
    previewW = previewH * aspectRatio;
    if (previewW > previewMaxW) { previewW = previewMaxW; previewH = previewW / aspectRatio; }
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-[#09090b] text-white flex flex-col overflow-hidden animate-in fade-in duration-300 font-sans">

      {/* Header */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-white/10 bg-[#09090b]/95 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <User className="size-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Profile Photo Editor</h1>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">LinkedIn &amp; Social Media</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <button onClick={undo} disabled={historyIndex <= 0} className="size-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-30 transition-colors" title="Undo">
            <Undo2 className="size-4" />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="size-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-30 transition-colors" title="Redo">
            <Redo2 className="size-4" />
          </button>

          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Export */}
          <button onClick={handleExport} disabled={!imageSrc} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-bold transition-colors disabled:opacity-30">
            <Download className="size-4" /> Export
          </button>
          <button onClick={onClose} className="size-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Close">
            <X className="size-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* ═══ Left: Canvas Area ═══ */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-[#0c0c0e]">

          {!imageSrc ? (
            /* Upload Area */
            <div
              className="w-96 h-96 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-5 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="size-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/10 transition-colors">
                <Upload className="size-10 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-zinc-300 mb-1">Drop your photo here</p>
                <p className="text-xs text-zinc-500">or click to browse</p>
                <p className="text-[10px] text-zinc-600 mt-2">Supports JPG, PNG, WebP up to 10MB</p>
              </div>
              <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                <Camera className="size-4" /> Choose Photo
              </button>
            </div>
          ) : (
            /* Preview Canvas */
            <>
              {/* Output size label */}
              <div className="mb-4 flex items-center gap-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{selectedPreset.name}</span>
                <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded border border-white/10">{outputWidth} × {outputHeight}px</span>
                <div className="flex gap-1">
                  {(['square', 'circle', 'rounded'] as const).map(s => (
                    <button key={s} onClick={() => setCropShape(s)} className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${cropShape === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Preview */}
              <div
                className="relative cursor-move"
                style={{ width: previewW, height: previewH }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Background */}
                {bgColor !== 'transparent' && (
                  <div
                    className={`absolute inset-0 ${cropShape === 'circle' ? 'rounded-full' : cropShape === 'rounded' ? 'rounded-[10%]' : 'rounded-lg'}`}
                    style={{ background: bgColor }}
                  />
                )}

                {/* Transparent checkerboard */}
                {bgColor === 'transparent' && (
                  <div
                    className={`absolute inset-0 ${cropShape === 'circle' ? 'rounded-full' : cropShape === 'rounded' ? 'rounded-[10%]' : 'rounded-lg'} overflow-hidden`}
                    style={{ backgroundImage: 'repeating-conic-gradient(#1a1a1a 0% 25%, #222 0% 50%)', backgroundSize: '16px 16px' }}
                  />
                )}

                {/* Image */}
                <div className={`absolute inset-0 overflow-hidden ${cropShape === 'circle' ? 'rounded-full' : cropShape === 'rounded' ? 'rounded-[10%]' : 'rounded-lg'}`}>
                  <img
                    src={imageSrc}
                    alt="Profile preview"
                    className="w-full h-full object-cover select-none"
                    style={{ filter: getFilterStyle(), transform: getTransformStyle() }}
                    draggable={false}
                  />
                </div>

                {/* Border */}
                <div className={`absolute inset-0 ring-1 ring-white/20 pointer-events-none ${cropShape === 'circle' ? 'rounded-full' : cropShape === 'rounded' ? 'rounded-[10%]' : 'rounded-lg'}`} />

                {/* Center guides */}
                <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
                </div>
              </div>

              {/* Transform Controls */}
              <div className="flex items-center gap-2 mt-5">
                <button onClick={() => { setRotation(r => r - 90); saveToHistory(); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Rotate Left">
                  <RotateCcw className="size-4" />
                </button>
                <button onClick={() => { setRotation(r => r + 90); saveToHistory(); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Rotate Right">
                  <RotateCw className="size-4" />
                </button>
                <button onClick={() => { setFlipH(f => !f); saveToHistory(); }} className={`p-2 rounded-lg transition-colors ${flipH ? 'bg-indigo-600/30 text-indigo-400' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`} title="Flip Horizontal">
                  <FlipHorizontal className="size-4" />
                </button>
                <button onClick={() => { setFlipV(f => !f); saveToHistory(); }} className={`p-2 rounded-lg transition-colors ${flipV ? 'bg-indigo-600/30 text-indigo-400' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`} title="Flip Vertical">
                  <FlipVertical className="size-4" />
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Zoom Out">
                  <ZoomOut className="size-4" />
                </button>
                <span className="text-[10px] font-mono text-zinc-500 w-10 text-center tabular-nums">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Zoom In">
                  <ZoomIn className="size-4" />
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button onClick={resetEdits} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Reset All">
                  <RotateCcw className="size-3.5" />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Change Photo">
                  <Upload className="size-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* ═══ Right: Sidebar Controls ═══ */}
        <aside className="w-80 bg-[#09090b] border-l border-white/10 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex items-center border-b border-white/10">
            {([
              { id: 'presets' as const, label: 'Size' },
              { id: 'enhance' as const, label: 'Enhance' },
              { id: 'adjust' as const, label: 'Adjust' },
              { id: 'background' as const, label: 'BG' },
            ]).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === t.id ? 'text-white bg-white/5 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">

            {/* ═══ Size Presets Tab ═══ */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Social Media Formats</p>
                <div className="space-y-1.5">
                  {SOCIAL_PRESETS.map(p => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setActivePreset(p.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${activePreset === p.id ? 'bg-white/10 border-indigo-500/50 ring-1 ring-indigo-500/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                      >
                        <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.color}20` }}>
                          <Icon className="size-4" style={{ color: p.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-zinc-500">{p.desc} · {p.label}</div>
                        </div>
                        {activePreset === p.id && <Check className="size-4 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom size inputs */}
                {activePreset === 'custom' && (
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-zinc-600 mb-1 block">Width</label>
                      <input type="number" value={customWidth} onChange={e => setCustomWidth(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-zinc-600 mb-1 block">Height</label>
                      <input type="number" value={customHeight} onChange={e => setCustomHeight(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ Enhancement Presets Tab ═══ */}
            {activeTab === 'enhance' && (
              <div className="space-y-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Professional Presets</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ENHANCEMENT_PRESETS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => applyEnhancement(p.id)}
                      className={`p-3 rounded-xl border transition-all text-center ${activeEnhancement === p.id ? 'bg-indigo-600/20 border-indigo-500/50 text-white' : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <span className="text-[11px] font-bold">{p.name}</span>
                    </button>
                  ))}
                </div>

                {/* Quick tips */}
                <div className="mt-4 p-4 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Pro Tips</p>
                  <ul className="space-y-1.5 text-[11px] text-zinc-400">
                    <li>• Use <strong className="text-zinc-300">Professional</strong> for LinkedIn headshots</li>
                    <li>• <strong className="text-zinc-300">Warm Pro</strong> adds approachable warmth</li>
                    <li>• <strong className="text-zinc-300">Corporate</strong> for formal business photos</li>
                    <li>• <strong className="text-zinc-300">B&W Classic</strong> for artistic portfolios</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ═══ Manual Adjustments Tab ═══ */}
            {activeTab === 'adjust' && (
              <div className="space-y-5">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Manual Adjustments</p>
                {[
                  { label: 'Brightness', icon: Sun, value: brightness, set: setBrightness, min: 50, max: 150, default: 100 },
                  { label: 'Contrast', icon: Contrast, value: contrast, set: setContrast, min: 50, max: 200, default: 100 },
                  { label: 'Saturation', icon: Droplets, value: saturate, set: setSaturate, min: 0, max: 200, default: 100 },
                  { label: 'Blur', icon: Sparkles, value: blur, set: setBlur, min: 0, max: 10, default: 0 },
                  { label: 'Warmth', icon: Sun, value: sepia, set: setSepia, min: 0, max: 50, default: 0 },
                  { label: 'Desaturate', icon: ImageIcon, value: grayscale, set: setGrayscale, min: 0, max: 100, default: 0 },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="size-3.5 text-zinc-500" />
                          <label className="text-xs text-zinc-400">{s.label}</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-600 w-8 text-right tabular-nums">{s.value}</span>
                          {s.value !== s.default && (
                            <button onClick={() => { s.set(s.default); saveToHistory(); }} className="text-[9px] text-zinc-600 hover:text-zinc-400 transition-colors">Reset</button>
                          )}
                        </div>
                      </div>
                      <input
                        type="range" min={s.min} max={s.max}
                        value={s.value}
                        onChange={e => { s.set(Number(e.target.value)); setActiveEnhancement('custom'); }}
                        onMouseUp={() => saveToHistory()}
                        className="w-full accent-indigo-500 h-1"
                      />
                    </div>
                  );
                })}
                <button onClick={() => { resetEdits(); }} className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-zinc-500 transition-colors mt-2">
                  Reset All Adjustments
                </button>
              </div>
            )}

            {/* ═══ Background Tab ═══ */}
            {activeTab === 'background' && (
              <div className="space-y-5">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Background Color</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {BACKGROUND_COLORS.map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => { setBgColor(bg.value); setActiveBgId(bg.id); }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${activeBgId === bg.id ? 'bg-white/10 border-indigo-500/50' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'}`}
                    >
                      <div
                        className="size-6 rounded-md border border-white/20 shrink-0"
                        style={{
                          background: bg.value === 'transparent'
                            ? 'repeating-conic-gradient(#333 0% 25%, #555 0% 50%) 0 0 / 8px 8px'
                            : bg.value,
                        }}
                      />
                      <span className="text-[11px] font-medium text-zinc-400 truncate">{bg.name}</span>
                    </button>
                  ))}
                </div>

                {/* Export Breakdown */}
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Export Summary</p>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between"><span className="text-zinc-500">Platform</span><span className="text-white font-bold">{selectedPreset.name}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Dimensions</span><span className="text-white font-mono">{outputWidth} × {outputHeight}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Shape</span><span className="text-white capitalize">{cropShape}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Enhancement</span><span className="text-white">{ENHANCEMENT_PRESETS.find(e => e.id === activeEnhancement)?.name || 'Custom'}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Format</span><span className="text-white font-mono">PNG</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
    </div>
  );
};

export default ProfilePhotoEditor;
