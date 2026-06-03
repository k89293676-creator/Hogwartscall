import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function CSSFallbackBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" style={{ background: 'hsl(240 20% 5%)' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 5 === 0 ? '#D4AF37' : 'rgba(255,255,255,0.7)',
            animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite alternate`,
            opacity: 0.4 + Math.random() * 0.6,
          }}
        />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`snitch-${i}`}
          className="absolute"
          style={{
            width: '12px',
            height: '12px',
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`,
            animation: `float ${4 + i}s ease-in-out ${i * 0.5}s infinite alternate`,
          }}
        >
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFD700', boxShadow: '0 0 8px #FFD700' }} />
        </div>
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`candle-${i}`}
          className="absolute"
          style={{
            width: '4px',
            height: '20px',
            left: `${5 + i * 12}%`,
            bottom: `${10 + (i % 3) * 15}%`,
            background: 'linear-gradient(to bottom, #FF6B00, #FFF8DC)',
            borderRadius: '2px',
            animation: `float ${2 + Math.random()}s ease-in-out ${i * 0.3}s infinite alternate`,
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '-2px',
            width: '8px',
            height: '10px',
            background: 'radial-gradient(ellipse, #FF6B00, #FFD700 40%, transparent 70%)',
            borderRadius: '50%',
            animation: `spell-flash 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
          }} />
        </div>
      ))}
    </div>
  );
}

export function MagicalBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050510);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(renderer.domElement);

      // Particle Starfield
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 2000;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i++) {
        starPositions[i] = (Math.random() - 0.5) * 20;
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({ color: 0xD4AF37, size: 0.05, transparent: true, opacity: 0.8 });
      const starSystem = new THREE.Points(starGeometry, starMaterial);
      scene.add(starSystem);

      // Floating Candles
      const candles: THREE.PointLight[] = [];
      for (let i = 0; i < 10; i++) {
        const candle = new THREE.PointLight(0xFFA500, 1, 5);
        candle.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4);
        candle.userData = { phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.5 };
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3), new THREE.MeshBasicMaterial({ color: 0xFFF8DC }));
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1), new THREE.MeshBasicMaterial({ color: 0xFF4500 }));
        flame.position.y = 0.2;
        candle.add(mesh);
        candle.add(flame);
        scene.add(candle);
        candles.push(candle);
      }

      // Golden Snitches
      const snitches: THREE.Group[] = [];
      for (let i = 0; i < 6; i++) {
        const snitch = new THREE.Group();
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshBasicMaterial({ color: 0xFFD700 }));
        snitch.add(body);
        const wingMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const wingGeo = new THREE.PlaneGeometry(0.4, 0.1);
        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-0.25, 0, 0);
        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(0.25, 0, 0);
        snitch.add(leftWing);
        snitch.add(rightWing);
        snitch.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5 - 2);
        snitch.userData = { t: Math.random() * 100, leftWing, rightWing, speed: 1 + Math.random() };
        scene.add(snitch);
        snitches.push(snitch);
      }

      const clock = new THREE.Clock();
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        starSystem.rotation.y += 0.0005;
        starSystem.rotation.x += 0.0002;
        candles.forEach(candle => {
          candle.position.y += Math.sin(elapsedTime * candle.userData.speed + candle.userData.phase) * 0.005;
        });
        snitches.forEach(snitch => {
          snitch.userData.t += 0.02 * snitch.userData.speed;
          const t = snitch.userData.t;
          snitch.position.x += Math.sin(t) * 0.05;
          snitch.position.y += Math.cos(t * 1.5) * 0.05;
          snitch.position.z += Math.sin(t * 0.5) * 0.02;
          if (snitch.position.x > 8) snitch.position.x = -8;
          if (snitch.position.x < -8) snitch.position.x = 8;
          if (snitch.position.y > 5) snitch.position.y = -5;
          if (snitch.position.y < -5) snitch.position.y = 5;
          snitch.userData.leftWing.rotation.y = Math.sin(t * 20) * 0.5;
          snitch.userData.rightWing.rotation.y = -Math.sin(t * 20) * 0.5;
        });
        renderer!.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer!.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (renderer && containerRef.current && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
        renderer?.dispose();
        starGeometry.dispose();
        starMaterial.dispose();
      };
    } catch {
      setWebglFailed(true);
      return () => { cancelAnimationFrame(animationFrameId); };
    }
  }, []);

  if (webglFailed) {
    return <CSSFallbackBackground />;
  }

  return <div ref={containerRef} className="fixed inset-0 -z-10 pointer-events-none" />;
}
