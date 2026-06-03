import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  createLumos, createIncendio, createExpelliarmus, createWingardium,
  createPatronus, createAccio, createStupefy, createProtego,
  createNox, createAlohomora, createRiddikulus, createExpectoPatronum,
} from '@/utils/arEffects';
import { SPELLS } from '@/utils/spells';

interface SpellOverlayProps {
  landmarks: any[] | null;
  currentSpell: string | null;
}

const SPELL_COLORS: Record<string, string> = {
  Lumos: '#FFD700', Incendio: '#FF5500', Expelliarmus: '#DC143C',
  'Wingardium Leviosa': '#32CD32', Patronus: '#A8D8F0', Accio: '#9B59B6',
  Stupefy: '#FF1493', Protego: '#00BFFF', Nox: '#4A1D96',
  Alohomora: '#F39C12', Riddikulus: '#E91E63', 'Expecto Patronum': '#C8E8FF',
};

const SPELL_DESCRIPTIONS: Record<string, string> = {
  Lumos: 'Let there be light', Incendio: 'Conjure fire', Expelliarmus: 'Disarming charm',
  'Wingardium Leviosa': 'Levitation charm', Patronus: 'Guardian spirit', Accio: 'Summoning charm',
  Stupefy: 'Stunning spell', Protego: 'Shield charm', Nox: 'Extinguish light',
  Alohomora: 'Unlocking charm', Riddikulus: 'Boggart banisher', 'Expecto Patronum': 'Patronus charm',
};

function ScreenFlash({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-30" style={{
      background: `radial-gradient(ellipse at center, ${color}35 0%, ${color}18 40%, transparent 70%)`,
      animation: 'spellScreenFlash 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
    }} />
  );
}

function RunicRing({ color }: { color: string }) {
  const runes = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];
  const count = 16;
  const r = 48;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-25" viewBox="0 0 100 100"
      style={{ animation: 'runicRingExpand 1.2s cubic-bezier(0.16,1,0.3,1) forwards' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="0.4" opacity="0.6"
        style={{ animation: 'runeRotate 8s linear infinite' }} />
      <circle cx="50" cy="50" r={r - 6} fill="none" stroke={color} strokeWidth="0.2" opacity="0.35"
        style={{ animation: 'runeRotate 5s linear infinite reverse' }} />
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        return (
          <text key={i} x={50 + r * Math.cos(angle)} y={50 + r * Math.sin(angle)}
            textAnchor="middle" dominantBaseline="middle" fontSize="4" fill={color} opacity="0.7">
            {runes[i % runes.length]}
          </text>
        );
      })}
    </svg>
  );
}

function SpellAnnouncement({ spell }: { spell: string | null }) {
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState<string | null>(null);
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    if (spell) { setDisplayed(spell); setPhase('enter'); setVisible(true); }
    else {
      setPhase('exit');
      const t = setTimeout(() => setVisible(false), 700);
      return () => clearTimeout(t);
    }
  }, [spell]);

  if (!visible || !displayed) return null;
  const color = SPELL_COLORS[displayed] ?? '#FFD700';
  const desc = SPELL_DESCRIPTIONS[displayed] ?? SPELLS.find(s => s.name === displayed)?.description ?? '';
  const chars = `${displayed}!`.split('');

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
      {phase === 'enter' && <ScreenFlash color={color} />}
      {phase === 'enter' && <RunicRing color={color} />}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse at center, ${color}22 0%, transparent 60%)`,
        animation: phase === 'enter' ? 'spellBurst 0.5s ease forwards' : 'fadeOut 0.5s ease forwards',
      }} />
      {phase === 'enter' && (
        <div className="absolute left-0 right-0" style={{
          top: '50%', height: '1px',
          background: `linear-gradient(90deg, transparent, ${color}90, ${color}, ${color}90, transparent)`,
          animation: 'spellStreakH 0.5s ease forwards',
          boxShadow: `0 0 8px 2px ${color}60`,
        }} />
      )}
      <div className="flex items-center justify-center relative flex-wrap" style={{
        fontFamily: "'Cinzel Decorative', cursive",
        fontSize: 'clamp(1.8rem, 5.5vw, 3.5rem)', fontWeight: 900, color,
        textShadow: `0 0 20px ${color}, 0 0 50px ${color}80, 0 0 100px ${color}40`,
        letterSpacing: '0.06em', filter: `drop-shadow(0 0 16px ${color})`,
      }}>
        {chars.map((ch, i) => (
          <span key={i} style={{
            display: 'inline-block',
            '--lx': `${(Math.random()-0.5)*100}px`, '--ly': `${-(Math.random()*80+30)}px`,
            '--lr': `${(Math.random()-0.5)*50}deg`,
            animation: phase === 'enter'
              ? `letterArrive 0.5s cubic-bezier(0.16,1,0.3,1) ${i*0.04}s both`
              : `letterExit 0.4s ease-in ${Math.max(0,(chars.length-i-1)*0.025)}s both`,
          } as React.CSSProperties}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </div>
      <div className="mt-3 font-fell italic tracking-[0.3em] uppercase text-sm" style={{
        color: `${color}cc`, textShadow: `0 0 12px ${color}80`,
        animation: phase === 'enter' ? 'revealUp 0.5s 0.35s both' : 'fadeOut 0.4s ease-in both',
      }}>{desc}</div>
      {phase === 'enter' && Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        return (
          <div key={i} className="absolute top-1/2 left-1/2 pointer-events-none" style={{
            width: 4, height: 4, borderRadius: '50%', background: color,
            boxShadow: `0 0 6px ${color}`,
            '--tx': `${Math.cos(angle*Math.PI/180)*(60+Math.random()*80)}px`,
            '--ty': `${Math.sin(angle*Math.PI/180)*(40+Math.random()*60)}px`,
            animation: `sparkBurst 0.7s cubic-bezier(0.16,1,0.3,1) ${i*0.03}s both`,
          } as React.CSSProperties} />
        );
      })}
    </div>
  );
}

export function SpellOverlay({ landmarks, currentSpell }: SpellOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const activeEffects = useRef<((time: number) => boolean)[]>([]);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const prevSpellRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;
    try {
      const w = containerRef.current.clientWidth || 640;
      const h = containerRef.current.clientHeight || 480;
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      const camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 100);
      camera.position.z = 5;
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      containerRef.current.appendChild(renderer.domElement);
      const animate = (time: number) => {
        animationFrameId = requestAnimationFrame(animate);
        activeEffects.current = activeEffects.current.filter(fx => !fx(time));
        renderer!.render(scene, camera);
      };
      animate(performance.now());
      const handleResize = () => {
        if (!containerRef.current || !renderer) return;
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };
      window.addEventListener('resize', handleResize);
      setTimeout(handleResize, 100);
      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (renderer && containerRef.current && renderer.domElement.parentNode === containerRef.current)
          containerRef.current.removeChild(renderer.domElement);
        renderer?.dispose();
      };
    } catch {
      setWebglAvailable(false);
      return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };
    }
  }, []);

  useEffect(() => {
    if (!currentSpell || currentSpell === prevSpellRef.current) return;
    prevSpellRef.current = currentSpell;
    if (!sceneRef.current || !webglAvailable) return;
    const palm = landmarks?.[9];
    const pos = new THREE.Vector3(palm ? (palm.x-0.5)*6 : 0, palm ? -(palm.y-0.5)*4 : 0, 0);
    let fn: ((t:number)=>boolean)|undefined;
    switch(currentSpell) {
      case 'Lumos': fn=createLumos(sceneRef.current,pos); break;
      case 'Incendio': fn=createIncendio(sceneRef.current,pos); break;
      case 'Expelliarmus': fn=createExpelliarmus(sceneRef.current,pos); break;
      case 'Wingardium Leviosa': fn=createWingardium(sceneRef.current,pos); break;
      case 'Patronus': fn=createPatronus(sceneRef.current,pos); break;
      case 'Accio': fn=createAccio(sceneRef.current,pos); break;
      case 'Stupefy': fn=createStupefy(sceneRef.current,pos); break;
      case 'Protego': fn=createProtego(sceneRef.current,pos); break;
      case 'Nox': fn=createNox(sceneRef.current,pos); break;
      case 'Alohomora': fn=createAlohomora(sceneRef.current,pos); break;
      case 'Riddikulus': fn=createRiddikulus(sceneRef.current,pos); break;
      case 'Expecto Patronum': fn=createExpectoPatronum(sceneRef.current,pos); break;
    }
    if (fn) activeEffects.current.push(fn);
  }, [currentSpell, landmarks, webglAvailable]);

  useEffect(() => { if (!currentSpell) prevSpellRef.current = null; }, [currentSpell]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {webglAvailable && <div ref={containerRef} className="absolute inset-0" />}
      <SpellAnnouncement spell={currentSpell} />
    </div>
  );
}
