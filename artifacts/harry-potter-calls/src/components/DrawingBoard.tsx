import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LuX, LuTrash2, LuEraser, LuUndo, LuStamp } from 'react-icons/lu';

interface DrawingBoardProps {
  dataChannel: RTCDataChannel | null;
  isVisible: boolean;
  onClose: () => void;
}

interface Point { x: number; y: number; }

interface Stroke {
  type: 'stroke';
  points: Point[];
  color: string;
  size: number;
  erase: boolean;
}

interface StampEvent {
  type: 'stamp';
  x: number;
  y: number;
  shape: 'bolt' | 'star' | 'moon';
  color: string;
}

type DrawEvent = Stroke | StampEvent | { type: 'clear' } | { type: 'redraw'; strokes: Stroke[] };

const PRESET_COLORS = [
  { color: '#D4AF37', name: 'Gold',    bg: 'linear-gradient(to top, #D4AF37 60%, #8B7000 100%)' },
  { color: '#8B0000', name: 'Blood',   bg: 'linear-gradient(to top, #8B0000 60%, #4a0000 100%)' },
  { color: '#1A1A2E', name: 'Ink',     bg: 'linear-gradient(to top, #2a2a4e 60%, #1A1A2E 100%)' },
  { color: '#2ECC71', name: 'Emerald', bg: 'linear-gradient(to top, #2ECC71 60%, #1a7a45 100%)' },
];

function drawLightningBolt(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 12;
  ctx.shadowColor = color;
  ctx.beginPath();
  ctx.moveTo(x + 5, y - 12);
  ctx.lineTo(x - 2, y);
  ctx.lineTo(x + 3, y);
  ctx.lineTo(x - 5, y + 12);
  ctx.lineTo(x + 2, y);
  ctx.lineTo(x - 3, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const innerAngle = outerAngle + (2 * Math.PI) / 10;
    const ox = x + Math.cos(outerAngle) * 12;
    const oy = y + Math.sin(outerAngle) * 12;
    const ix = x + Math.cos(innerAngle) * 5;
    const iy = y + Math.sin(innerAngle) * 5;
    i === 0 ? ctx.moveTo(ox, oy) : ctx.lineTo(ox, oy);
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMoon(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.beginPath();
  ctx.arc(x + 5, y - 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function DrawingBoard({ dataChannel, isVisible, onClose }: DrawingBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#D4AF37');
  const [size, setSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [stampShape, setStampShape] = useState<'bolt' | 'star' | 'moon'>('bolt');
  const [stampMode, setStampMode] = useState(false);
  const currentPath = useRef<Point[]>([]);
  const strokesRef = useRef<Stroke[]>([]);

  const redrawAll = useCallback((strokes: Stroke[]) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    strokes.forEach(s => drawStroke(s.points, s.color, s.size, s.erase));
  }, []);

  const drawStroke = (points: Point[], strokeColor: string, strokeSize: number, erase = false) => {
    if (!canvasRef.current || points.length < 2) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.save();
    if (erase) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 10;
      ctx.shadowColor = strokeColor;
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.strokeStyle = erase ? 'rgba(0,0,0,1)' : strokeColor;
    ctx.lineWidth = erase ? strokeSize * 3 : strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const applyStamp = useCallback((x: number, y: number, shape: 'bolt' | 'star' | 'moon', c: string) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    if (shape === 'bolt') drawLightningBolt(ctx, x, y, c);
    else if (shape === 'star') drawStar(ctx, x, y, c);
    else drawMoon(ctx, x, y, c);
  }, []);

  useEffect(() => {
    if (!dataChannel) return;
    const handleMessage = (event: MessageEvent) => {
      try {
        const data: DrawEvent = JSON.parse(event.data);
        if (data.type === 'stroke') {
          drawStroke(data.points, data.color, data.size, data.erase);
          strokesRef.current.push(data);
          if (strokesRef.current.length > 20) strokesRef.current.shift();
        } else if (data.type === 'stamp') {
          applyStamp(data.x, data.y, data.shape, data.color);
        } else if (data.type === 'clear') {
          clearCanvas();
          strokesRef.current = [];
        } else if (data.type === 'redraw') {
          strokesRef.current = data.strokes;
          redrawAll(data.strokes);
        }
      } catch (e) {
        console.error('Failed to parse datachannel message', e);
      }
    };
    dataChannel.addEventListener('message', handleMessage);
    return () => dataChannel.removeEventListener('message', handleMessage);
  }, [dataChannel, applyStamp, redrawAll]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      tempCanvas.getContext('2d')?.drawImage(canvasRef.current, 0, 0);
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      ctx?.drawImage(tempCanvas, 0, 0);
    };
    window.addEventListener('resize', handleResize);
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ctrl+Z undo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && isVisible) {
        e.preventDefault();
        strokesRef.current = strokesRef.current.slice(0, -1);
        redrawAll(strokesRef.current);
        if (dataChannel?.readyState === 'open') {
          dataChannel.send(JSON.stringify({ type: 'redraw', strokes: strokesRef.current }));
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dataChannel, isVisible, redrawAll]);

  const handleUndo = () => {
    strokesRef.current = strokesRef.current.slice(0, -1);
    redrawAll(strokesRef.current);
    if (dataChannel?.readyState === 'open') {
      dataChannel.send(JSON.stringify({ type: 'redraw', strokes: strokesRef.current }));
    }
  };

  const handleClear = () => {
    clearCanvas();
    strokesRef.current = [];
    if (dataChannel?.readyState === 'open') {
      dataChannel.send(JSON.stringify({ type: 'clear' }));
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (stampMode) {
      const pos = getPos(e);
      applyStamp(pos.x, pos.y, stampShape, color);
      if (dataChannel?.readyState === 'open') {
        dataChannel.send(JSON.stringify({ type: 'stamp', x: pos.x, y: pos.y, shape: stampShape, color }));
      }
      return;
    }
    setIsDrawing(true);
    const pos = getPos(e);
    currentPath.current = [pos];
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current || stampMode) return;
    const pos = getPos(e);
    currentPath.current.push(pos);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const len = currentPath.current.length;
    if (len >= 2) {
      const p1 = currentPath.current[len - 2];
      const p2 = currentPath.current[len - 1];
      ctx.save();
      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = size * 3;
      } else {
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
      }
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }
  };

  const endDrawing = () => {
    if (!isDrawing || stampMode) return;
    setIsDrawing(false);
    if (currentPath.current.length > 0) {
      const stroke: Stroke = { type: 'stroke', points: currentPath.current, color, size, erase: isEraser };
      strokesRef.current.push(stroke);
      if (strokesRef.current.length > 20) strokesRef.current.shift();
      if (dataChannel?.readyState === 'open') {
        dataChannel.send(JSON.stringify(stroke));
      }
    }
    currentPath.current = [];
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  };

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: stampMode ? 'crosshair' : isEraser ? 'cell' : 'crosshair' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseOut={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />

      {/* Vertical floating toolbar on RIGHT */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 parchment px-3 py-4 rounded-2xl flex flex-col items-center gap-3 magic-border shadow-2xl">

        {/* Preset ink colors as potion bottles */}
        {PRESET_COLORS.map(preset => (
          <button
            key={preset.color}
            onClick={() => { setColor(preset.color); setIsEraser(false); setStampMode(false); }}
            title={preset.name}
            className="relative w-8 transition-transform hover:scale-110"
            style={{
              outline: color === preset.color && !isEraser && !stampMode ? `2px solid #D4AF37` : 'none',
              outlineOffset: '2px',
              borderRadius: '12px',
            }}
          >
            {/* Potion bottle shape */}
            <svg viewBox="0 0 20 32" width="32" height="32">
              <rect x="7" y="2" width="6" height="6" rx="2" fill="#888" opacity="0.7"/>
              <path d="M6 8 L3 14 L3 28 Q3 31 10 31 Q17 31 17 28 L17 14 L14 8 Z" style={{ fill: preset.color }} opacity="0.9"/>
              <path d="M4 18 L16 18" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <ellipse cx="10" cy="22" rx="4" ry="2" fill="rgba(255,255,255,0.1)"/>
            </svg>
          </button>
        ))}

        <div className="w-6 h-px bg-primary/30" />

        {/* Color picker */}
        <div className="relative">
          <input
            type="color"
            value={color}
            onChange={e => { setColor(e.target.value); setIsEraser(false); setStampMode(false); }}
            className="w-8 h-8 rounded-full border-none cursor-pointer bg-transparent"
            title="Custom color"
          />
        </div>

        {/* Size slider — vertical */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-cinzel text-primary/60">Size</span>
          <input
            type="range" min="2" max="20"
            value={size}
            onChange={e => setSize(parseInt(e.target.value))}
            className="accent-primary"
            style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '60px', width: '18px' }}
          />
        </div>

        <div className="w-6 h-px bg-primary/30" />

        {/* Eraser toggle */}
        <Button
          variant={isEraser ? 'default' : 'ghost'}
          size="icon"
          onClick={() => { setIsEraser(!isEraser); setStampMode(false); }}
          title="Eraser"
          className={isEraser ? 'bg-primary text-black' : 'text-primary hover:text-primary hover:bg-primary/20'}
        >
          <LuEraser className="w-4 h-4" />
        </Button>

        {/* Stamp tool */}
        <Button
          variant={stampMode ? 'default' : 'ghost'}
          size="icon"
          onClick={() => { setStampMode(!stampMode); setIsEraser(false); }}
          title="Stamp (bolt/star/moon)"
          className={stampMode ? 'bg-primary text-black' : 'text-primary hover:text-primary hover:bg-primary/20'}
        >
          <LuStamp className="w-4 h-4" />
        </Button>

        {/* Stamp shape selector */}
        {stampMode && (
          <div className="flex flex-col gap-1">
            {(['bolt', 'star', 'moon'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStampShape(s)}
                className="text-sm font-cinzel px-2 py-0.5 rounded transition-all"
                style={{
                  background: stampShape === s ? 'rgba(212,175,55,0.3)' : 'transparent',
                  color: stampShape === s ? '#D4AF37' : 'rgba(212,175,55,0.5)',
                  border: stampShape === s ? '1px solid #D4AF37' : '1px solid transparent',
                }}
              >
                {s === 'bolt' ? '⚡' : s === 'star' ? '★' : '🌙'}
              </button>
            ))}
          </div>
        )}

        <div className="w-6 h-px bg-primary/30" />

        {/* Undo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleUndo}
          title="Undo (Ctrl+Z)"
          className="text-primary hover:text-primary hover:bg-primary/20"
        >
          <LuUndo className="w-4 h-4" />
        </Button>

        {/* Clear */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="text-destructive hover:bg-destructive/20 hover:text-destructive"
          title="Clear canvas"
        >
          <LuTrash2 className="w-4 h-4" />
        </Button>

        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-white"
          title="Close drawing board"
        >
          <LuX className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
