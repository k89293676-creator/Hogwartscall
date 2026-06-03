import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WandCursorProps {
  spellColor?: string;
  enabled?: boolean;
}

interface TrailDot {
  x: number;
  y: number;
  age: number;
}

export function WandCursor({ spellColor, enabled = true }: WandCursorProps) {
  const isMobile = useIsMobile();
  const wandRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement[]>([]);
  const posRef = useRef({ x: -100, y: -100 });
  const trailDotsRef = useRef<TrailDot[]>([]);
  const rafRef = useRef<number>(0);
  const colorRef = useRef(spellColor || '#D4AF37');

  useEffect(() => {
    colorRef.current = spellColor || '#D4AF37';
  }, [spellColor]);

  useEffect(() => {
    if (isMobile || !enabled) return;

    // Hide default cursor
    document.body.style.cursor = 'none';

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      trailDotsRef.current.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (trailDotsRef.current.length > 8) {
        trailDotsRef.current.shift();
      }
    };

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      const { x, y } = posRef.current;
      if (wandRef.current) {
        wandRef.current.style.transform = `translate(${x - 4}px, ${y - 28}px)`;
      }

      trailDotsRef.current.forEach((dot, i) => {
        dot.age++;
        const el = trailRef.current[i];
        if (el) {
          el.style.transform = `translate(${dot.x - 3}px, ${dot.y - 3}px)`;
          const opacity = Math.max(0, 0.8 - (dot.age * 0.1));
          el.style.opacity = String(opacity);
          const scale = Math.max(0.1, 1 - dot.age * 0.08);
          el.style.width = `${6 * scale}px`;
          el.style.height = `${6 * scale}px`;
          el.style.background = colorRef.current;
          el.style.boxShadow = `0 0 ${4 * scale}px ${colorRef.current}`;
        }
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
      document.body.style.cursor = '';
    };
  }, [isMobile, enabled]);

  if (isMobile || !enabled) return null;

  const glowColor = spellColor || '#D4AF37';

  return (
    <>
      {/* Wand cursor */}
      <div
        ref={wandRef}
        className="fixed pointer-events-none z-[9999]"
        style={{ top: 0, left: 0, willChange: 'transform' }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          <line x1="4" y1="28" x2="26" y2="6" stroke="#8B6914" strokeWidth="3" strokeLinecap="round"/>
          <line x1="4" y1="28" x2="26" y2="6" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
          <circle
            cx="26" cy="6" r="4"
            fill={glowColor}
            style={{
              filter: `drop-shadow(0 0 ${spellColor ? '8' : '4'}px ${glowColor})`,
            }}
          />
          <circle cx="26" cy="6" r="2" fill="white" opacity="0.8"/>
        </svg>
      </div>

      {/* Trail dots */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          ref={el => { if (el) trailRef.current[i] = el; }}
          className="fixed pointer-events-none z-[9998] rounded-full"
          style={{
            top: 0,
            left: 0,
            width: '6px',
            height: '6px',
            background: '#D4AF37',
            opacity: 0,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </>
  );
}
