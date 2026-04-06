
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    Pencil,
    Eraser,
    Square,
    Circle,
    Minus,
    Type,
    Trash2,
    Download,
    Undo2,
    Redo2,
    Grid3X3,
    MousePointer2,
    Trash,
    Palette,
    PenTool
} from 'lucide-react';

interface WhiteboardProps {
    className?: string;
}

type Tool = 'pen' | 'eraser' | 'rect' | 'circle' | 'line' | 'text' | 'select';

interface Point {
    x: number;
    y: number;
}

interface DrawAction {
    tool: Tool;
    points: Point[];
    color: string;
    width: number;
    text?: string;
}

const COLORS = [
    '#000000', // Black
    '#5E5CE6', // Indigo
    '#FF3B30', // Red
    '#34C759', // Green
    '#FF9500', // Orange
    '#AF52DE', // Purple
    '#5AC8FA', // Cyan
    '#FFCC00', // Yellow
];

const DoodleBackground = () => (
    <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
        <svg className="absolute top-10 left-10 w-32 h-32 text-slate-900" viewBox="0 0 100 100">
            <path d="M10,50 Q25,25 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="5" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-20 right-20 w-48 h-48 text-slate-900" viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" transform="rotate(15 50 50)" />
        </svg>
        <svg className="absolute top-1/2 left-1/4 w-24 h-24 text-slate-900" viewBox="0 0 100 100">
            <path d="M20,20 L80,80 M80,20 L20,80" stroke="currentColor" strokeWidth="2" />
        </svg>
        <svg className="absolute top-20 right-1/3 w-40 h-40 text-slate-900" viewBox="0 0 200 100">
            <path d="M10,50 C40,10 60,10 90,50 S140,90 190,50" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <svg className="absolute bottom-10 left-1/3 w-32 h-32 text-slate-900" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
    </div>
);

const Whiteboard: React.FC<WhiteboardProps> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<Tool>('pen');
    const [color, setColor] = useState(COLORS[0]);
    const [width, setWidth] = useState(3);
    const [history, setHistory] = useState<DrawAction[]>([]);
    const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
    const [showGrid, setShowGrid] = useState(true);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas dimensions based on container
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth * 2; // High DPI
                canvas.height = parent.clientHeight * 2;
                canvas.style.width = `${parent.clientWidth}px`;
                canvas.style.height = `${parent.clientHeight}px`;

                const context = canvas.getContext('2d');
                if (context) {
                    context.scale(2, 2);
                    context.lineCap = 'round';
                    context.lineJoin = 'round';
                    contextRef.current = context;
                    redraw();
                }
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const redraw = useCallback(() => {
        const ctx = contextRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid if enabled
        if (showGrid) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'; // Darker grid for white bg
            ctx.lineWidth = 0.5;
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
            }
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }
            ctx.stroke();
        }

        // Draw history
        history.forEach(action => {
            drawAction(ctx, action);
        });
    }, [history, showGrid]);

    useEffect(() => {
        redraw();
    }, [redraw]);

    const drawAction = (ctx: CanvasRenderingContext2D, action: DrawAction) => {
        ctx.beginPath();
        ctx.strokeStyle = action.tool === 'eraser' ? '#ffffff' : action.color; // Eraser is white
        ctx.lineWidth = action.width;

        if (action.tool === 'eraser') {
            ctx.globalCompositeOperation = 'source-over'; // Paint with white
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }

        const points = action.points;
        if (points.length === 0) return;

        if (action.tool === 'pen' || action.tool === 'eraser') {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
        } else if (action.tool === 'rect') {
            const start = points[0];
            const end = points[points.length - 1];
            ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (action.tool === 'circle') {
            const start = points[0];
            const end = points[points.length - 1];
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (action.tool === 'line') {
            const start = points[0];
            const end = points[points.length - 1];
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        } else if (action.tool === 'text' && action.text) {
            ctx.font = `${action.width * 5}px sans-serif`;
            ctx.fillStyle = action.color;
            ctx.fillText(action.text, points[0].x, points[0].y);
        }

        ctx.globalCompositeOperation = 'source-over'; // Reset
    };

    const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
        const { x, y } = getCoordinates(nativeEvent);

        if (tool === 'text') {
            const text = prompt('Enter text:');
            if (text) {
                const newAction: DrawAction = {
                    tool: 'text',
                    points: [{ x, y }],
                    color,
                    width,
                    text
                };
                setHistory(prev => [...prev, newAction]);
                setRedoStack([]);
            }
            return;
        }

        setIsDrawing(true);
        setCurrentPath([{ x, y }]);

        const ctx = contextRef.current;
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            ctx.lineWidth = width;
            // if (tool === 'eraser') ctx.globalCompositeOperation = 'destination-out'; // Use white paint instead
        }
    };

    const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(nativeEvent);
        const ctx = contextRef.current;
        if (!ctx) return;

        if (tool === 'pen' || tool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
            setCurrentPath(prev => [...prev, { x, y }]);
        } else {
            // For shapes, we need to clear and redraw preview
            redraw();
            const tempAction: DrawAction = {
                tool,
                points: [currentPath[0], { x, y }],
                color,
                width
            };
            drawAction(ctx, tempAction);
        }
    };

    const stopDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(nativeEvent);

        const newAction: DrawAction = {
            tool,
            points: tool === 'pen' || tool === 'eraser'
                ? [...currentPath, { x, y }]
                : [currentPath[0], { x, y }],
            color,
            width
        };

        setHistory(prev => [...prev, newAction]);
        setRedoStack([]);
        setIsDrawing(false);
        setCurrentPath([]);
    };

    const getCoordinates = (event: any): Point => {
        if (event.touches && event.touches[0]) {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();
            return {
                x: event.touches[0].clientX - rect.left,
                y: event.touches[0].clientY - rect.top
            };
        }
        return {
            x: event.offsetX,
            y: event.offsetY
        };
    };

    const undo = () => {
        if (history.length === 0) return;
        const lastAction = history[history.length - 1];
        setRedoStack(prev => [...prev, lastAction]);
        setHistory(prev => prev.slice(0, -1));
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        const nextAction = redoStack[redoStack.length - 1];
        setHistory(prev => [...prev, nextAction]);
        setRedoStack(prev => prev.slice(0, -1));
    };

    const clear = () => {
        if (confirm('Clear entire whiteboard?')) {
            setHistory([]);
            setRedoStack([]);
        }
    };

    const download = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create a temporary canvas with background for export
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const exportCtx = exportCanvas.getContext('2d');
        if (exportCtx) {
            exportCtx.fillStyle = '#ffffff';
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
            exportCtx.drawImage(canvas, 0, 0);

            const link = document.createElement('a');
            link.download = `whiteboard-${Date.now()}.png`;
            link.href = exportCanvas.toDataURL();
            link.click();
        }
    };

    return (
        <div className={`relative w-full h-full bg-white overflow-hidden ${className}`}>
            <DoodleBackground />

            {/* Canvas Layer */}
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="block cursor-crosshair touch-none relative z-10"
            />

            {/* Toolbar - Floating Glassmorphism - Light Mode */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-50 text-slate-700">
                <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                    <ToolButton active={tool === 'pen'} onClick={() => setTool('pen')} icon={Pencil} label="Pen" />
                    <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={Eraser} label="Eraser" />
                    <ToolButton active={tool === 'rect'} onClick={() => setTool('rect')} icon={Square} label="Rectangle" />
                    <ToolButton active={tool === 'circle'} onClick={() => setTool('circle')} icon={Circle} label="Circle" />
                    <ToolButton active={tool === 'line'} onClick={() => setTool('line')} icon={Minus} label="Line" />
                    <ToolButton active={tool === 'text'} onClick={() => setTool('text')} icon={Type} label="Text" />
                </div>

                <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2 px-1">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }}
                            className={`size-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c && tool !== 'eraser' ? 'border-slate-800 scale-110 shadow-lg' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2 px-2 border-r border-slate-200">
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value))}
                        className="w-24 h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-[10px] font-mono text-slate-400 w-4">{width}</span>
                </div>

                <div className="flex items-center gap-1 pl-1">
                    <ActionButton onClick={undo} icon={Undo2} label="Undo" disabled={history.length === 0} />
                    <ActionButton onClick={redo} icon={Redo2} label="Redo" disabled={redoStack.length === 0} />
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <ActionButton onClick={() => setShowGrid(!showGrid)} icon={Grid3X3} label="Grid" active={showGrid} />
                    <ActionButton onClick={download} icon={Download} label="Export" />
                    <ActionButton onClick={clear} icon={Trash2} label="Clear" className="text-rose-500 hover:bg-rose-50" />
                </div>
            </div>

            {/* Info Label - Light Mode */}
            <div className="absolute top-6 left-6 flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 pointer-events-none shadow-sm z-20">
                <div className="size-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Collaborative Whiteboard</span>
            </div>
        </div>
    );
};

const ToolButton: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-xl transition-all group relative ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
        title={label}
    >
        <Icon className="size-5" />
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            {label}
        </span>
    </button>
);

const ActionButton: React.FC<{ onClick: () => void; icon: any; label: string; disabled?: boolean; active?: boolean; className?: string }> = ({ onClick, icon: Icon, label, disabled, active, className }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded-xl transition-all group relative ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'} ${disabled ? 'opacity-20 cursor-not-allowed' : ''} ${className}`}
        title={label}
    >
        <Icon className="size-5" />
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg state-layer">
            {label}
        </span>
    </button>
);

export default Whiteboard;
