import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WandCursorProps {
  spellColor?: string;
  enabled?: boolean;
}

const TRAIL_LEN = 20;

export function WandCursor({ spellColor, enabled = true }: WandCursorProps) {
  const isMobile = useIsMobile();
  const wandRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef({ x: -200, y: -200 });
  const histRef = useRef<{ x: number; y: number }[]>([]);
  const rafRef = useRef<number>(0);
  const colorRef = useRef(spellColor || '#D4AF37');
  const sparklesRef = useRef<HTMLDivElement[]>([]);
  const sparkPoolRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { colorRef.current = spellColor || '#D4AF37'; }, [spellColor]);

  useEffect(() => {
    if (isMobile || !enabled) return;
    document.body.style.cursor = 'none';

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      histRef.current.push({ x: e.clientX, y: e.clientY });
      if (histRef.current.length > TRAIL_LEN) histRef.current.shift();

      const prev = histRef.current[histRef.current.length - 2];
      if (prev) {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        if (speed > 8 && Math.random() < 0.4 && sparkPoolRef.current) {
          const sp = document.createElement('div');
          sp.style.cssText = 'position:fixed;pointer-events:none;z-index:9997;top:0;left:0;will-change:transform,opacity;';
          sp.style.transform = `translate(${e.clientX - 4}px,${e.clientY - 4}px)`;
          const c = colorRef.current;
          sp.innerHTML = `<svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 0 L4.5 3.5 L8 4 L4.5 4.5 L4 8 L3.5 4.5 L0 4 L3.5 3.5 Z" fill="${c}" opacity="0.9"/></svg>`;
          sp.style.filter = `drop-shadow(0 0 4px ${c})`;
          sparkPoolRef.current.appendChild(sp);
          sparklesRef.current.push(sp);
          let age = 0;
          const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.5;
          const dist = 20 + Math.random() * 30;
          const tick = () => {
            age++;
            const t = age / 18;
            sp.style.transform = `translate(${e.clientX - 4 + Math.cos(angle) * dist * t}px,${e.clientY - 4 + Math.sin(angle) * dist * t + t * t * 20}px) scale(${1 - t * 0.7}) rotate(${t * 360}deg)`;
            sp.style.opacity = String(Math.max(0, 1 - t));
            if (age < 18) requestAnimationFrame(tick);
            else { sp.remove(); sparklesRef.current = sparklesRef.current.filter(x => x !== sp); }
          };
          requestAnimationFrame(tick);
        }
      }
    };

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const { x, y } = posRef.current;
      if (wandRef.current) wandRef.current.style.transform = `translate(${x - 4}px, ${y - 30}px)`;
      const hist = histRef.current;
      trailRef.current.forEach((el, i) => {
        if (!el) return;
        const idx = Math.floor((i / TRAIL_LEN) * hist.length);
        const pt = hist[idx];
        if (!pt) { el.style.opacity = '0'; return; }
        const progress = i / TRAIL_LEN;
        const size = Math.max(1, 7 * (1 - progress));
        el.style.transform = `translate(${pt.x - size / 2}px, ${pt.y - size / 2}px) rotate(${i * 18}deg)`;
        el.style.opacity = String((1 - progress) * 0.85);
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        const c = colorRef.current;
        el.style.background = c;
        el.style.boxShadow = `0 0 ${size * 1.5}px ${c}, 0 0 ${size * 3}px ${c}60`;
        if (i % 4 === 0) { el.style.borderRadius = '50%'; el.style.clipPath = ''; }
        else if (i % 4 === 1) { el.style.borderRadius = '0'; el.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'; }
        else if (i % 4 === 2) { el.style.borderRadius = '2px'; el.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'; }
        else { el.style.borderRadius = '1px'; el.style.clipPath = ''; }
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
  const isSpellActive = !!spellColor;

  return (
    <>
      <div ref={wandRef} className="fixed pointer-events-none z-[9999]" style={{ top: 0, left: 0, willChange: 'transform' }}>
        <svg width="44" height="44" viewBox="0 0 44 44">
          <line x1="7" y1="39" x2="37" y2="9" stroke="rgba(0,0,0,0.4)" strokeWidth="5" strokeLinecap="round"/>
          <line x1="7" y1="39" x2="37" y2="9" stroke="#3B1E07" strokeWidth="4.5" strokeLinecap="round"/>
          <line x1="7" y1="39" x2="37" y2="9" stroke="#6B4A0F" strokeWidth="3" strokeLinecap="round"/>
          <line x1="10" y1="36" x2="14" y2="32" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
          <line x1="13" y1="33" x2="17" y2="29" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
          <line x1="33" y1="13" x2="37" y2="9" stroke="#D4AF37" strokeWidth="3.5" strokeLinecap="round"/>
          {isSpellActive && <circle cx="37" cy="9" r="9" fill={glowColor} opacity="0.15" style={{ filter: 'blur(4px)' }}/>}
          <circle cx="37" cy="9" r={isSpellActive ? 7 : 5} fill={glowColor}
            style={{ filter: `drop-shadow(0 0 ${isSpellActive ? 12 : 6}px ${glowColor})` }} opacity="0.85"/>
          <circle cx="37" cy="9" r="3" fill="white" opacity="0.95"/>
          <circle cx="37" cy="9" r="1.5" fill={glowColor} opacity="1"/>
          {isSpellActive && <>
            <line x1="37" y1="4" x2="37" y2="14" stroke={glowColor} strokeWidth="0.8" opacity="0.7"/>
            <line x1="32" y1="9" x2="42" y2="9" stroke={glowColor} strokeWidth="0.8" opacity="0.7"/>
            <line x1="33.5" y1="5.5" x2="40.5" y2="12.5" stroke={glowColor} strokeWidth="0.5" opacity="0.5"/>
            <line x1="40.5" y1="5.5" x2="33.5" y2="12.5" stroke={glowColor} strokeWidth="0.5" opacity="0.5"/>
          </>}
        </svg>
      </div>
      <div ref={sparkPoolRef} className="fixed inset-0 pointer-events-none z-[9997]" />
      {Array.from({ length: TRAIL_LEN }).map((_, i) => (
        <div key={i} ref={el => { trailRef.current[i] = el; }}
          className="fixed pointer-events-none z-[9998]"
          style={{ top: 0, left: 0, width: '7px', height: '7px', opacity: 0, willChange: 'transform,opacity' }} />
      ))}
    </>
  );
}
