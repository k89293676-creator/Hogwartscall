import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LuX, LuTrash2 } from 'react-icons/lu';

interface DrawingBoardProps {
  dataChannel: RTCDataChannel | null;
  isVisible: boolean;
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
}

export function DrawingBoard({ dataChannel, isVisible, onClose }: DrawingBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#D4AF37');
  const [size, setSize] = useState(5);
  const currentPath = useRef<Point[]>([]);

  useEffect(() => {
    if (!dataChannel) return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'stroke') {
          drawStroke(data.points, data.color, data.size);
        } else if (data.type === 'clear') {
          clearCanvas();
        }
      } catch (e) {
        console.error('Failed to parse datachannel message', e);
      }
    };
    
    dataChannel.addEventListener('message', handleMessage);
    return () => dataChannel.removeEventListener('message', handleMessage);
  }, [dataChannel]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      // Store current drawing
      const ctx = canvasRef.current.getContext('2d');
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      tempCanvas.getContext('2d')?.drawImage(canvasRef.current, 0, 0);
      
      // Resize
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      
      // Restore
      ctx?.drawImage(tempCanvas, 0, 0);
    };
    
    window.addEventListener('resize', handleResize);
    // Initial sizing
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawStroke = (points: Point[], strokeColor: string, strokeSize: number) => {
    if (!canvasRef.current || points.length < 2) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Add magical glow to strokes
    ctx.shadowBlur = 10;
    ctx.shadowColor = strokeColor;
    
    ctx.stroke();
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleClear = () => {
    clearCanvas();
    if (dataChannel?.readyState === 'open') {
      dataChannel.send(JSON.stringify({ type: 'clear' }));
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    currentPath.current = [pos];
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const pos = getPos(e);
    currentPath.current.push(pos);
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const len = currentPath.current.length;
    if (len >= 2) {
      const p1 = currentPath.current[len - 2];
      const p2 = currentPath.current[len - 1];
      
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (dataChannel?.readyState === 'open' && currentPath.current.length > 0) {
      dataChannel.send(JSON.stringify({
        type: 'stroke',
        points: currentPath.current,
        color,
        size
      }));
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
        className="w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseOut={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 parchment px-6 py-3 rounded-full flex items-center gap-6 magic-border">
        <div className="flex items-center gap-2">
          <label className="text-xs font-cinzel text-primary">Ink</label>
          <input 
            type="color" 
            value={color} 
            onChange={e => setColor(e.target.value)}
            className="w-8 h-8 rounded-full border-none cursor-pointer bg-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs font-cinzel text-primary">Size</label>
          <input 
            type="range" 
            min="2" max="20" 
            value={size} 
            onChange={e => setSize(parseInt(e.target.value))}
            className="w-24 accent-primary"
          />
        </div>
        
        <div className="w-px h-6 bg-primary/30" />
        
        <Button variant="ghost" size="icon" onClick={handleClear} className="text-destructive hover:bg-destructive/20 hover:text-destructive">
          <LuTrash2 className="w-5 h-5" />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-white">
          <LuX className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
