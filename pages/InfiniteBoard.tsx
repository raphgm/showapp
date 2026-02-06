
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutGrid, Maximize, Minus, Plus, MousePointer2, Move, Share2, 
  Video as VideoIcon, StickyNote, ArrowRight, Trash2, Layers, 
  Square, Circle, Type, Pointer, GripVertical, Settings2, Download,
  Sparkles, Undo2, Redo2, Search, Map, Command, X, ZoomIn, ZoomOut,
  Hand, Link2, Palette, Pen, Lock, Unlock, ArrowUp, ArrowDown, 
  Image as ImageIcon, Zap, Target, Crosshair, Library as LibraryIcon, ChevronRight, Eye, Monitor,
  Presentation, Upload, FileImage, FileText, Component, Search as SearchIcon,
  Activity, Zap as ZapIcon, BrainCircuit, RefreshCw, FileUp
} from 'lucide-react';
import { Video, BoardElement, BoardConnection, BoardElementType } from '../types';
import HeroBanner from '../components/HeroBanner';

interface InfiniteBoardProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
  coverImage?: string;
}

type Tool = 'select' | 'hand' | 'note' | 'text' | 'shape' | 'connector' | 'pen' | 'magic' | 'laser' | 'image';

const STICKY_COLORS = [
  { name: 'Soft Yellow', value: '#fef9c3' },
  { name: 'Mint', value: '#dcfce7' },
  { name: 'Sky', value: '#e0f2fe' },
  { name: 'Lavender', value: '#f3e8ff' },
  { name: 'White', value: '#ffffff' }
];

const SHAPE_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Slate', value: '#334155' }
];

const STARTER_TEMPLATES = [
  { id: 't1', label: 'Strategic Memo', type: 'note', color: '#fef9c3', content: '# SESSION_INIT\n1. Concept Mapping\n2. Logic Flow\n3. Review Stage', w: 300, h: 300 },
  { id: 't4', label: 'Decision Matrix', type: 'shape', color: '#4f46e5', content: 'CORE_OBJECTIVE', w: 400, h: 400 },
  { id: 't5', label: 'Section Header', type: 'text', color: '#4f46e5', content: 'PROJECT_SHOWCASE_01', w: 500, h: 80 },
];

const BoardDoodles = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-[0.28]">
    {/* Blueprint Circle Top Right */}
    <svg className="absolute -top-40 -right-40 w-[1000px] h-[1000px] text-indigo-600" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 3" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.15" />
      <path d="M50,0 L50,100 M0,50 L100,50" stroke="currentColor" strokeWidth="0.08" strokeDasharray="1 2" />
    </svg>
    
    {/* Corner Measurement Markings */}
    <div className="absolute top-20 left-20 w-32 h-32 border-t-2 border-l-2 border-slate-400 rounded-tl-3xl opacity-50"></div>
    <div className="absolute bottom-20 right-20 w-32 h-32 border-b-2 border-r-2 border-slate-400 rounded-br-3xl opacity-50"></div>

    {/* Technical Text Doodles */}
    <div className="absolute top-[25%] left-[4%] text-[11px] font-mono font-black text-indigo-500/60 rotate-90 origin-left uppercase tracking-[0.6em]">
      SPATIAL_ENGINE_CORE :: [ALPHA]
    </div>
    <div className="absolute bottom-[25%] right-[4%] text-[11px] font-mono font-black text-indigo-500/60 -rotate-90 origin-right uppercase tracking-[0.6em]">
      RENDER_V2.4_INIT :: [READY]
    </div>

    {/* Hand-drawn Sketchy Workflow Doodle */}
    <svg className="absolute top-[12%] left-[18%] w-80 h-80 text-indigo-400/60" viewBox="0 0 200 200">
      <path d="M20,20 Q50,10 80,30 T140,20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="20" y="40" width="60" height="40" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M85,60 L120,60 Q135,60 135,80 L135,120" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="135" cy="135" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>

    {/* Wireframe Cube Doodle */}
    <svg className="absolute bottom-[12%] left-[38%] w-56 h-56 text-slate-300" viewBox="0 0 100 100">
      <path d="M30,30 L70,30 L70,70 L30,70 Z M45,15 L85,15 L85,55 L45,55 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M30,30 L45,15 M70,30 L85,15 M70,70 L85,55 M30,70 L45,55" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>

    <div className="absolute top-[18%] right-[28%] animate-pulse">
       <Sparkles className="size-20 text-indigo-500/40" />
    </div>

    <BrainCircuit className="absolute top-[10%] left-[30%] size-[700px] text-indigo-600 blur-[0.5px] opacity-[0.18]" strokeWidth={0.2} />
  </div>
);

const InfiniteBoard: React.FC<InfiniteBoardProps> = ({ videos, onVideoClick, coverImage }) => {
  const [isPresenting, setIsPresenting] = useState(false);
  
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [isDraggingSpace, setIsDraggingSpace] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [connections, setConnections] = useState<BoardConnection[]>([]);
  const [uploadedAssets, setUploadedAssets] = useState<{id: string, url: string, name: string}[]>([]);
  
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [activeDragElement, setActiveDragElement] = useState<string | null>(null);
  const [activeResizeElement, setActiveResizeElement] = useState<string | null>(null);
  const [connectorStart, setConnectorStart] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTab, setLibraryTab] = useState<'videos' | 'assets' | 'templates'>('videos');
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{x: number, y: number}[]>([]);
  const [laserTrail, setLaserTrail] = useState<{x: number, y: number, id: number}[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const screenToWorld = useCallback((sx: number, sy: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: (sx - rect.left - view.x) / view.k, y: (sy - rect.top - view.y) / view.k };
  }, [view]);

  const addElementAtPos = (type: BoardElementType, props: Partial<BoardElement>, screenX?: number, screenY?: number) => {
    let worldPos;
    if (screenX !== undefined && screenY !== undefined) {
      worldPos = screenToWorld(screenX, screenY);
    } else {
      worldPos = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
    }

    const id = Math.random().toString(36).substr(2, 9);
    const newEl: BoardElement = {
      id,
      type,
      x: worldPos.x - (props.w || 200) / 2,
      y: worldPos.y - (props.h || 200) / 2,
      w: props.w || 200,
      h: props.h || 200,
      layer: elements.length,
      ...props
    };
    setElements(prev => [...prev, newEl]);
    return id;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setUploadedAssets(prev => [{ id: Math.random().toString(36).substr(2, 9), url, name: file.name }, ...prev]);
        setLibraryTab('assets');
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragStart = (e: React.DragEvent, asset: any, type: string) => {
    e.dataTransfer.setData('assetData', JSON.stringify(asset));
    e.dataTransfer.setData('assetType', type);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('assetType');
    const dataStr = e.dataTransfer.getData('assetData');
    if (!dataStr) return;
    const data = JSON.parse(dataStr);

    if (type === 'video') {
      addElementAtPos('video', { videoId: data.title, w: 400, h: 225 }, e.clientX, e.clientY);
    } else if (type === 'asset') {
      addElementAtPos('image', { url: data.url, w: 400, h: 300 }, e.clientX, e.clientY);
    } else if (type === 'template') {
      addElementAtPos(data.type as BoardElementType, { content: data.content, color: data.color, w: data.w, h: data.h }, e.clientX, e.clientY);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.0015;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.05, view.k + delta), 8);
      const rect = containerRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
      const scaleRatio = newScale / view.k;
      const newX = mouseX - (mouseX - view.x) * scaleRatio, newY = mouseY - (mouseY - view.y) * scaleRatio;
      setView({ x: newX, y: newY, k: newScale });
    } else {
      setView(v => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPresenting) return;
    const { x: wx, y: wy } = screenToWorld(e.clientX, e.clientY);
    
    if (activeTool === 'laser') { setIsDrawing(true); return; }
    if (activeTool === 'pen') { setIsDrawing(true); setCurrentStroke([{x: wx, y: wy}]); e.preventDefault(); return; }
    if (e.button === 1 || activeTool === 'hand' || e.buttons === 4) { setIsDraggingSpace(true); setDragStart({ x: e.clientX, y: e.clientY }); return; }
    
    const selectedId = Array.from(selection)[0];
    if (selectedId) {
      const el = elements.find(e => e.id === selectedId);
      if (el && !el.locked) {
        const handleSize = 20 / view.k;
        const isOverHandle = wx >= el.x + el.w - handleSize && wx <= el.x + el.w + handleSize && 
                             wy >= el.y + el.h - handleSize && wy <= el.y + el.h + handleSize;
        if (isOverHandle) {
          setActiveResizeElement(el.id);
          setDragStart({ x: wx, y: wy });
          return;
        }
      }
    }

    const sortedElements = [...elements].sort((a, b) => (b.layer || 0) - (a.layer || 0));
    const clickedEl = sortedElements.find(el => wx >= el.x && wx <= el.x + el.w && wy >= el.y && wy <= el.y + el.h);
    
    if (clickedEl) {
      if (activeTool === 'connector') { setConnectorStart(clickedEl.id); }
      else if (activeTool === 'select') { 
        if (!clickedEl.locked) { 
          setActiveDragElement(clickedEl.id); 
          setDragStart({ x: wx, y: wy }); 
        } 
        setSelection(new Set([clickedEl.id])); 
      }
    } else {
      setSelection(new Set());
      if (activeTool === 'note') createNote(wx, wy);
      if (activeTool === 'text') createText(wx, wy);
      if (activeTool === 'shape') createShape(wx, wy);
      if (activeTool === 'image') createImage(wx, wy);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const { x: wx, y: wy } = screenToWorld(e.clientX, e.clientY);
    
    if (activeTool === 'laser' && isDrawing) {
      const id = Date.now() + Math.random();
      setLaserTrail(prev => [...prev.slice(-15), { x: wx, y: wy, id }]);
      setTimeout(() => { setLaserTrail(prev => prev.filter(p => p.id !== id)); }, 800);
      return;
    }

    if (isDrawing && activeTool === 'pen') { setCurrentStroke(prev => [...prev, {x: wx, y: wy}]); return; }
    
    if (isDraggingSpace) {
      const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
      setView(v => ({ ...v, x: v.x + dx, y: v.y + dy })); setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (activeResizeElement) {
      const el = elements.find(e => e.id === activeResizeElement);
      if (el) {
        const newW = Math.max(50, wx - el.x);
        const newH = Math.max(50, wy - el.y);
        setElements(els => els.map(item => item.id === activeResizeElement ? { ...item, w: newW, h: newH } : item));
      }
      return;
    }

    if (activeDragElement) {
      const el = elements.find(e => e.id === activeDragElement);
      if (el && el.locked) return;
      const dx = wx - dragStart.x, dy = wy - dragStart.y;
      setElements(els => els.map(el => el.id === activeDragElement ? { ...el, x: el.x + dx, y: el.y + dy } : el));
      setDragStart({ x: wx, y: wy });
    }
  };

  const handlePointerUp = () => {
    if (isDrawing && activeTool === 'pen') {
      setIsDrawing(false);
      if (currentStroke.length > 1) {
        const xs = currentStroke.map(p => p.x), ys = currentStroke.map(p => p.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
        const pad = 10;
        const normalizedPoints = currentStroke.map(p => ({ x: p.x - (minX - pad), y: p.y - (minY - pad) }));
        const newDrawing: BoardElement = { id: Math.random().toString(36).substr(2, 9), type: 'drawing', x: minX - pad, y: minY - pad, w: (maxX - minX) + (pad * 2), h: (maxY - minY) + (pad * 2), points: normalizedPoints, color: '#4f46e5', layer: elements.length };
        setElements(prev => [...prev, newDrawing]);
      }
      setCurrentStroke([]);
    }
    setIsDrawing(false); 
    setIsDraggingSpace(false); 
    setActiveDragElement(null);
    setActiveResizeElement(null);
    
    if (connectorStart) {
      const { x: wx, y: wy } = screenToWorld(dragStart.x, dragStart.y);
      const target = elements.find(el => wx >= el.x && wx <= el.x + el.w && wy >= el.y && wy <= el.y + el.h);
      if (target && target.id !== connectorStart) { setConnections(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), from: connectorStart, to: target.id, type: 'curved' }]); }
    }
    setConnectorStart(null);
  };

  const createNote = (x: number, y: number) => {
    addElementAtPos('note', { content: "Workspace Log :: START", color: STICKY_COLORS[0].value }, x, y);
    setActiveTool('select');
  };
  const createText = (x: number, y: number) => {
    addElementAtPos('text', { content: "ARCHITECTURE_FRAME_01", color: 'transparent' }, x, y);
    setActiveTool('select');
  };
  const createShape = (x: number, y: number) => {
    addElementAtPos('shape', { color: SHAPE_COLORS[0].value }, x, y);
    setActiveTool('select');
  };
  const createImage = (x: number, y: number) => {
    const url = prompt("Enter Asset URL:", "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=800");
    if (!url) return;
    addElementAtPos('image', { url, w: 400, h: 300 }, x, y);
    setActiveTool('select');
  };

  const updateSelectedElement = (updates: Partial<BoardElement>) => {
    const selectedId = Array.from(selection)[0];
    if (selectedId) setElements(els => els.map(el => el.id === selectedId ? { ...el, ...updates } : el));
  };

  const moveLayer = (direction: 'up' | 'down') => {
    const selectedId = Array.from(selection)[0]; if (!selectedId) return;
    setElements(els => {
      const maxLayer = Math.max(...els.map(e => e.layer || 0), 0);
      return els.map(el => el.id === selectedId ? { ...el, layer: direction === 'up' ? maxLayer + 1 : Math.max(0, (el.layer || 0) - 1) } : el);
    });
  };

  const deleteSelection = () => {
    setElements(els => els.filter(el => !selection.has(el.id) || el.locked)); 
    setConnections(conns => conns.filter(c => !selection.has(c.from) && !selection.has(c.to))); 
    setSelection(new Set());
  };

  const filteredVideos = useMemo(() => {
    if (!assetSearchQuery.trim()) return videos;
    const query = assetSearchQuery.toLowerCase();
    return videos.filter(v => 
      v.title.toLowerCase().includes(query) || 
      v.description.toLowerCase().includes(query)
    );
  }, [videos, assetSearchQuery]);

  const sortedElementsDisplay = useMemo(() => [...elements].sort((a, b) => (a.layer || 0) - (b.layer || 0)), [elements]);
  const selectedElement = useMemo(() => elements.find(el => selection.has(el.id)), [elements, selection]);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden font-sans select-none touch-none">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
      
      <div 
        ref={containerRef}
        className={`w-full h-full ${activeTool === 'hand' || isDraggingSpace ? 'cursor-grab active:cursor-grabbing' : activeTool === 'pen' ? 'cursor-crosshair' : activeTool === 'laser' ? 'cursor-none' : 'cursor-default'}`}
        onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.5]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: `${32 * view.k}px ${32 * view.k}px`, backgroundPosition: `${view.x}px ${view.y}px` }} />
        
        <BoardDoodles />

        <div className="absolute w-full h-full origin-top-left will-change-transform" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}>
          <svg className="absolute top-[-5000px] left-[-5000px] w-[10000px] h-[10000px] pointer-events-none overflow-visible">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#4f46e5" /></marker>
            </defs>

            {connections.map(c => {
               const f = elements.find(e => e.id === c.from), t = elements.find(e => e.id === c.to);
               if (!f || !t) return null;
               const start = { x: f.x + f.w/2, y: f.y + f.h/2 }, end = { x: t.x + t.w/2, y: t.y + t.h/2 };
               return <path key={c.id} d={`M ${start.x} ${start.y} C ${(start.x+end.x)/2} ${start.y}, ${(start.x+end.x)/2} ${end.y}, ${end.x} ${end.y}`} stroke="#4f46e5" strokeWidth="2" fill="none" markerEnd="url(#arrow)" opacity="0.5" />;
            })}
            {isDrawing && activeTool === 'pen' && currentStroke.length > 0 && (
              <path d={currentStroke.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')} stroke="#4f46e5" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {laserTrail.length > 1 && (
              <path d={laserTrail.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')} stroke="#f43f5e" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            )}
          </svg>
          
          {sortedElementsDisplay.map(el => (
              <div 
                key={el.id} 
                className={`absolute transition-shadow duration-200 flex flex-col ${selection.has(el.id) && !isPresenting ? 'ring-2 ring-indigo-600 z-[1000] shadow-2xl' : 'z-10 hover:ring-2 hover:ring-indigo-200'}`}
                style={{ 
                  left: el.x, 
                  top: el.y, 
                  width: el.w, 
                  height: el.h, 
                  backgroundColor: el.type === 'drawing' ? 'transparent' : (el.color || '#ffffff'), 
                  borderRadius: el.type === 'shape' ? '50%' : '24px', 
                  boxShadow: el.type === 'note' ? '0 10px 15px -3px rgba(0,0,0,0.05)' : 'none', 
                  opacity: el.locked ? 0.9 : 1,
                  cursor: el.locked && selection.has(el.id) ? 'not-allowed' : activeTool === 'select' ? 'move' : 'default',
                  border: el.type === 'note' ? '1px solid rgba(0,0,0,0.02)' : 'none'
                }}
              >
                {el.type === 'note' && (
                  <div className="flex-1 flex flex-col p-8 bg-white/40 backdrop-blur-sm rounded-[24px]">
                     <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 opacity-60">:: LOG_001</div>
                     <textarea readOnly={isPresenting || el.locked} className="w-full flex-1 bg-transparent resize-none outline-none font-bold text-2xl leading-snug select-text scrollbar-hide text-slate-800 placeholder:text-slate-200" value={el.content} onChange={(e) => updateSelectedElement({ content: e.target.value })} onPointerDown={e => e.stopPropagation()} placeholder="INITIALIZING..." />
                  </div>
                )}
                {el.type === 'text' && <input readOnly={isPresenting || el.locked} className={`w-full h-full bg-transparent text-5xl font-black outline-none select-text text-center tracking-tighter ${el.color === 'transparent' ? 'text-indigo-600/80' : 'text-slate-900/80'}`} value={el.content} onChange={(e) => updateSelectedElement({ content: e.target.value })} onPointerDown={e => e.stopPropagation()} />}
                {el.type === 'image' && <img src={el.url} className="w-full h-full object-cover rounded-[24px] pointer-events-none border border-slate-50 shadow-sm opacity-95" alt="Asset" />}
                {el.type === 'video' && (
                  <div className="w-full h-full bg-slate-900/80 flex flex-col rounded-[24px] overflow-hidden group/v border border-white/20 shadow-xl">
                    <div className="flex-1 flex items-center justify-center text-white/10"><VideoIcon className="w-20 h-20 group-hover/v:text-indigo-400 transition-all group-hover/v:scale-105" /></div>
                    <div className="p-4 bg-white/90 backdrop-blur-md flex justify-between items-center border-t border-white/20">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest truncate">{el.videoId}</span>
                      <Monitor className="w-3 h-3 text-slate-300" />
                    </div>
                  </div>
                )}
                {el.type === 'drawing' && el.points && (
                   <svg width={el.w} height={el.h} className="w-full h-full overflow-visible pointer-events-none">
                     <path d={el.points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')} stroke={el.color || '#4f46e5'} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                )}
                
                {el.locked && !isPresenting && (
                  <div className="absolute top-4 right-4 p-2 bg-indigo-600 rounded-xl shadow-lg text-white animate-in zoom-in duration-300">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
          ))}
        </div>
      </div>

      <div className="absolute top-6 left-6 z-[500] flex items-center gap-3">
         <button 
           onClick={() => { setIsPresenting(!isPresenting); setSelection(new Set()); }}
           className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg backdrop-blur-3xl border ${isPresenting ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/90 border-slate-100 text-indigo-600 hover:bg-white'}`}
         >
           {isPresenting ? <Eye className="w-4 h-4" /> : <Presentation className="w-4 h-4" />}
           {isPresenting ? 'Mode: Static' : 'Mode: Active'}
         </button>
      </div>

      {!isPresenting && (
        <>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-white/95 backdrop-blur-3xl border border-indigo-50 rounded-[28px] shadow-2xl z-[200]">
            {[
              { id: 'select', icon: MousePointer2, label: 'Select' },
              { id: 'hand', icon: Hand, label: 'Pan' },
              { id: 'laser', icon: Target, label: 'Laser', special: true },
              { divider: true },
              { id: 'pen', icon: Pen, label: 'Draw' },
              { id: 'note', icon: StickyNote, label: 'Log' },
              { id: 'text', icon: Type, label: 'Text' },
              { id: 'shape', icon: Circle, label: 'Oval' },
              { id: 'image', icon: ImageIcon, label: 'Asset' },
              { divider: true },
              { id: 'library', icon: LibraryIcon, label: 'Vault', action: () => setIsLibraryOpen(true) },
            ].map((t, i) => (
              t.divider ? <div key={i} className="w-px h-6 bg-slate-100 mx-1" /> :
              <button key={i} onClick={() => t.action ? t.action() : setActiveTool(t.id as Tool)}
                className={`p-3.5 rounded-2xl transition-all relative group ${activeTool === t.id ? 'bg-indigo-600 text-white shadow-lg' : t.special ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}`} title={t.label}>
                <t.icon className={`w-5 h-5`} />
              </button>
            ))}
          </div>

          <div className={`absolute top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-xl border-l border-slate-100 shadow-2xl z-[500] transition-transform duration-500 flex flex-col ${isLibraryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-10 border-b border-slate-100 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-indigo-950 uppercase text-[11px] tracking-[0.4em] opacity-60">Vault Core</h3>
                <button onClick={() => setIsLibraryOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-300 hover:text-rose-500"><X className="w-6 h-6" /></button>
              </div>

              <div className="flex bg-slate-50 p-1.5 rounded-2xl">
                 {['videos', 'assets', 'templates'].map(tab => (
                   <button 
                    key={tab}
                    onClick={() => setLibraryTab(tab as any)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${libraryTab === tab ? 'bg-white text-indigo-600 shadow-xl border border-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>

              {libraryTab === 'assets' && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 group"
                >
                  <FileUp className="size-5 group-hover:-translate-y-1 transition-transform" />
                  Upload Local Asset
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
              {libraryTab === 'videos' && (
                <div className="grid grid-cols-1 gap-6">
                  {videos.map(v => (
                    <div 
                      key={v.id} 
                      onClick={() => addElementAtPos('video', { videoId: v.title, w: 400, h: 225 })}
                      className="p-4 bg-slate-50/50 rounded-[32px] border border-transparent hover:border-indigo-600 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-xl"
                    >
                      <div className="aspect-video relative rounded-2xl overflow-hidden mb-4 bg-slate-900 shadow-inner">
                        <img src={v.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="size-10 bg-white rounded-full flex items-center justify-center text-indigo-600"><Plus className="size-5" /></div>
                        </div>
                      </div>
                      <div className="text-[10px] font-black text-indigo-950 truncate uppercase tracking-widest px-1">{v.title}</div>
                    </div>
                  ))}
                  {videos.length === 0 && (
                    <div className="py-20 text-center space-y-4 opacity-30">
                       <VideoIcon className="size-10 mx-auto" />
                       <span className="text-[10px] font-black uppercase tracking-widest">No productions found</span>
                    </div>
                  )}
                </div>
              )}

              {libraryTab === 'assets' && (
                <div className="grid grid-cols-2 gap-4">
                  {uploadedAssets.map(asset => (
                    <div 
                      key={asset.id} 
                      onClick={() => addElementAtPos('image', { url: asset.url, w: 400, h: 300 })}
                      className="aspect-square bg-slate-50 rounded-[28px] overflow-hidden border border-transparent hover:border-indigo-600 cursor-pointer group shadow-sm transition-all"
                    >
                      <img src={asset.url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt={asset.name} />
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[28px] flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-indigo-400 hover:text-indigo-400 transition-all group"
                  >
                    <Plus className="size-8 group-hover:rotate-90 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Add New</span>
                  </button>
                </div>
              )}

              {libraryTab === 'templates' && (
                <div className="grid grid-cols-1 gap-4">
                   {STARTER_TEMPLATES.map(t => (
                     <button 
                       key={t.id}
                       onClick={() => addElementAtPos(t.type as BoardElementType, { content: t.content, color: t.color, w: t.w, h: t.h })}
                       className="p-6 bg-white border border-slate-100 rounded-[32px] text-left hover:border-indigo-600 transition-all shadow-sm group hover:shadow-xl"
                     >
                        <div className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">{t.label}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Auto-Scale Component</div>
                     </button>
                   ))}
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-8 right-8 flex items-center gap-3 p-1.5 bg-white/90 backdrop-blur-3xl border border-indigo-50 rounded-2xl shadow-xl z-[400]">
             <div className="px-4 text-slate-400 text-[9px] font-black border-r border-slate-100">SPACE_COORD :: {Math.round(view.x)}, {Math.round(view.y)}</div>
             <button onClick={() => setView(v => ({ ...v, k: Math.max(0.1, v.k - 0.2) }))} className="p-2 hover:bg-slate-50 text-slate-400 rounded-lg transition-colors"><ZoomOut className="size-4" /></button>
             <div className="text-[10px] font-black text-indigo-600 w-10 text-center">{Math.round(view.k * 100)}%</div>
             <button onClick={() => setView(v => ({ ...v, k: Math.min(8, v.k + 0.2) }))} className="p-2 hover:bg-slate-50 text-slate-400 rounded-lg transition-colors"><ZoomIn className="size-4" /></button>
             <button onClick={() => setView({ x: 0, y: 0, k: 1 })} className="p-2 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-all ml-1"><RefreshCw className="size-4" /></button>
          </div>
        </>
      )}
    </div>
  );
};

export default InfiniteBoard;
