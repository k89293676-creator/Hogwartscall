import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createLumos, createIncendio, createExpelliarmus, createWingardium } from '@/utils/arEffects';

interface SpellOverlayProps {
  landmarks: any[] | null;
  currentSpell: string | null;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

function CSSSpellEffect({ spell }: { spell: string | null }) {
  if (!spell) return null;
  const colorMap: Record<string, string> = {
    'Lumos': '#FFD700',
    'Incendio': '#FF4500',
    'Expelliarmus': '#4169E1',
    'Wingardium Leviosa': '#32CD32',
  };
  const color = spell ? colorMap[spell] ?? '#FFD700' : '#FFD700';
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      <div
        className="font-harry text-2xl font-bold px-6 py-3 rounded-lg animate-pulse"
        style={{
          color,
          textShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
          background: `${color}15`,
          border: `1px solid ${color}40`,
        }}
      >
        {spell}!
      </div>
    </div>
  );
}

export function SpellOverlay({ landmarks, currentSpell }: SpellOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const activeEffects = useRef<((time: number) => boolean)[]>([]);
  const [webglAvailable, setWebglAvailable] = useState(true);

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
      renderer.setClearColor(0x000000, 0);
      containerRef.current.appendChild(renderer.domElement);

      const animate = (time: number) => {
        animationFrameId = requestAnimationFrame(animate);
        activeEffects.current = activeEffects.current.filter(effect => !effect(time));
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
      return () => { cancelAnimationFrame(animationFrameId); };
    }
  }, []);

  useEffect(() => {
    if (!currentSpell || !sceneRef.current || !landmarks || !webglAvailable) return;
    const palm = landmarks[9];
    if (!palm) return;
    const x = (palm.x - 0.5) * 6;
    const y = -(palm.y - 0.5) * 4;
    const pos = new THREE.Vector3(x, y, 0);
    let effectFn;
    switch (currentSpell) {
      case 'Lumos': effectFn = createLumos(sceneRef.current, pos); break;
      case 'Incendio': effectFn = createIncendio(sceneRef.current, pos); break;
      case 'Expelliarmus': effectFn = createExpelliarmus(sceneRef.current, pos); break;
      case 'Wingardium Leviosa': effectFn = createWingardium(sceneRef.current, pos); break;
    }
    if (effectFn) activeEffects.current.push(effectFn);
  }, [currentSpell, webglAvailable]);

  if (!webglAvailable) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        <CSSSpellEffect spell={currentSpell} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10">
      {!webglAvailable && <CSSSpellEffect spell={currentSpell} />}
    </div>
  );
}
