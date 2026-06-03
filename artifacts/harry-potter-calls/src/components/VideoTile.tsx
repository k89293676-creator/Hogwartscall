import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Wand2 } from 'lucide-react';

interface VideoTileProps {
  stream: MediaStream | null;
  muted?: boolean;
  label: string;
  className?: string;
}

export function VideoTile({ stream, muted = false, label, className }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={cn("relative rounded-xl overflow-hidden magic-border parchment isolate shadow-2xl flex items-center justify-center", className)}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground animate-pulse">
          <Wand2 className="w-12 h-12 mb-4 text-primary opacity-50" />
          <p className="font-cinzel text-sm">Waiting for wizard...</p>
        </div>
      )}
      
      <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-primary/30">
        <span className="font-cinzel text-xs text-primary-foreground font-semibold text-primary">{label}</span>
      </div>
      
      {/* Corner magical accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-xl pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50 rounded-bl-xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50 rounded-br-xl pointer-events-none"></div>
    </div>
  );
}
