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

    document.body.style.cursor = 'none';

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      trailDotsRef.current.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (trailDotsRef.current.length > 8) trailDotsRef.current.shift();
    };

    const shapes = [
      '50%',
      'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      'none',
    ];

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
          const shape = shapes[i % 3];
          if (shape === '50%') {
            el.style.borderRadius = '50%';
            el.style.clipPath = '';
          } else if (shape.startsWith('polygon')) {
            el.style.borderRadius = '0';
            el.style.clipPath = shape;
          } else {
            el.style.borderRadius = '2px';
            el.style.clipPath = '';
          }
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
      <div
        ref={wandRef}
        className="fixed pointer-events-none z-[9999]"
        style={{ top: 0, left: 0, willChange: 'transform' }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36">
          {/* Wand handle grain lines */}
          <line x1="5" y1="31" x2="29" y2="7" stroke="#5C3A0A" strokeWidth="4" strokeLinecap="round"/>
          <line x1="5" y1="31" x2="29" y2="7" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Gold tip band */}
          <line x1="26" y1="10" x2="29" y2="7" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round"/>
          {/* Glow tip */}
          <circle cx="29" cy="7" r="5" fill={glowColor}
            style={{ filter: `drop-shadow(0 0 ${spellColor ? '10' : '5'}px ${glowColor})` }} opacity="0.85"/>
          <circle cx="29" cy="7" r="2.5" fill="white" opacity="0.9"/>
          <circle cx="29" cy="7" r="1" fill={glowColor} opacity="1"/>
        </svg>
      </div>

      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          ref={el => { if (el) trailRef.current[i] = el; }}
          className="fixed pointer-events-none z-[9998]"
          style={{
            top: 0, left: 0,
            width: '6px', height: '6px',
            background: '#D4AF37',
            opacity: 0,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </>
  );
}
