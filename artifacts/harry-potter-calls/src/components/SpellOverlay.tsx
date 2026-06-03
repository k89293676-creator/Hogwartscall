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
  Lumos: '#FFD700',
  Incendio: '#FF4500',
  Expelliarmus: '#DC143C',
  'Wingardium Leviosa': '#32CD32',
  Patronus: '#A8D8F0',
  Accio: '#9B59B6',
  Stupefy: '#FF1493',
  Protego: '#00BFFF',
  Nox: '#2C3E50',
  Alohomora: '#F39C12',
  Riddikulus: '#E91E63',
  'Expecto Patronum': '#E8F4FD',
};

function SpellAnnouncement({ spell }: { spell: string | null }) {
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState<string | null>(null);

  useEffect(() => {
    if (spell) {
      setDisplayed(spell);
      setVisible(true);
      return;
    } else {
      const t = setTimeout(() => setVisible(false), 700);
      return () => clearTimeout(t);
    }
  }, [spell]);

  if (!visible || !displayed) return null;

  const color = SPELL_COLORS[displayed] ?? '#FFD700';
  const chars = `${displayed}!`.split('');

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse at center, ${color}1a 0%, transparent 65%)`,
      }} />
      {/* Character-by-character stagger */}
      <div className="flex items-center justify-center relative flex-wrap" style={{
        fontFamily: "'Cinzel Decorative', cursive",
        fontSize: 'clamp(1.6rem, 5vw, 3rem)',
        fontWeight: 700,
        color,
        textShadow: `0 0 16px ${color}, 0 0 40px ${color}90`,
        letterSpacing: '0.08em',
        filter: `drop-shadow(0 0 12px ${color})`,
      }}>
        {chars.map((ch, i) => (
          <span key={i} style={{
            display: 'inline-block',
            '--lx': `${(Math.random()-0.5)*80}px`,
            '--ly': `${-(Math.random()*60+20)}px`,
            '--lr': `${(Math.random()-0.5)*40}deg`,
            animation: spell
              ? `letterArrive 0.45s cubic-bezier(0.16,1,0.3,1) ${i * 0.045}s both`
              : `fadeOut 0.6s ease-in ${Math.max(0,(chars.length-i-1)*0.03)}s both`,
          } as React.CSSProperties}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </div>
      {/* Subtitle */}
      <div className="mt-3 font-fell italic text-xs tracking-[0.35em] uppercase"
        style={{ color: `${color}aa`, animation: spell ? `revealUp 0.5s 0.3s both` : undefined }}>
        {SPELLS.find(s => s.name === displayed)?.description}
      </div>
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

      const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
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
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener('resize', handleResize);
      setTimeout(handleResize, 100);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (renderer && containerRef.current && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
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
    const x = palm ? (palm.x - 0.5) * 6 : 0;
    const y = palm ? -(palm.y - 0.5) * 4 : 0;
    const pos = new THREE.Vector3(x, y, 0);

    let effectFn: ((time: number) => boolean) | undefined;
    switch (currentSpell) {
      case 'Lumos':              effectFn = createLumos(sceneRef.current, pos); break;
      case 'Incendio':           effectFn = createIncendio(sceneRef.current, pos); break;
      case 'Expelliarmus':       effectFn = createExpelliarmus(sceneRef.current, pos); break;
      case 'Wingardium Leviosa': effectFn = createWingardium(sceneRef.current, pos); break;
      case 'Patronus':           effectFn = createPatronus(sceneRef.current, pos); break;
      case 'Accio':              effectFn = createAccio(sceneRef.current, pos); break;
      case 'Stupefy':            effectFn = createStupefy(sceneRef.current, pos); break;
      case 'Protego':            effectFn = createProtego(sceneRef.current, pos); break;
      case 'Nox':                effectFn = createNox(sceneRef.current, pos); break;
      case 'Alohomora':          effectFn = createAlohomora(sceneRef.current, pos); break;
      case 'Riddikulus':         effectFn = createRiddikulus(sceneRef.current, pos); break;
      case 'Expecto Patronum':   effectFn = createExpectoPatronum(sceneRef.current, pos); break;
    }
    if (effectFn) activeEffects.current.push(effectFn);
  }, [currentSpell, landmarks, webglAvailable]);

  useEffect(() => {
    if (!currentSpell) prevSpellRef.current = null;
  }, [currentSpell]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {webglAvailable && <div ref={containerRef} className="absolute inset-0" />}
      <SpellAnnouncement spell={currentSpell} />
    </div>
  );
}
