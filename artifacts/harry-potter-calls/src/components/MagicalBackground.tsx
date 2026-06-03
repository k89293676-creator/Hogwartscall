import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface MagicalBackgroundProps {
  quality?: 'cinematic' | 'balanced' | 'performance';
}

function CSSFallbackBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: 'hsl(240 20% 5%)' }}
    >
      {/* Castle silhouette via clip-path */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '28%',
          background: 'linear-gradient(to top, #06060f, #0a0a16)',
          clipPath: `polygon(
            0% 100%, 0% 60%,
            3% 60%, 3% 45%, 5% 45%, 5% 60%,
            8% 60%, 8% 50%, 10% 50%, 10% 60%,
            14% 60%, 14% 40%, 15% 38%, 16% 40%,
            18% 40%, 18% 35%, 19% 32%, 20% 35%,
            22% 35%, 22% 40%, 23% 38%, 24% 40%,
            26% 40%, 26% 55%,
            30% 55%, 30% 42%, 31% 40%, 32% 42%,
            35% 42%, 35% 55%,
            40% 55%, 40% 45%,
            45% 45%, 45% 30%, 47% 28%, 49% 30%,
            51% 30%, 51% 20%, 53% 17%, 55% 20%,
            57% 20%, 57% 28%, 59% 26%, 61% 28%,
            63% 28%, 63% 45%,
            68% 45%, 68% 55%,
            72% 55%, 72% 42%, 73% 40%, 74% 42%,
            77% 42%, 77% 55%,
            81% 55%, 81% 40%, 83% 38%, 85% 40%,
            87% 40%, 87% 35%, 88% 32%, 89% 35%,
            91% 35%, 91% 40%,
            93% 40%, 93% 60%,
            96% 60%, 96% 50%, 97% 50%, 97% 60%,
            100% 60%, 100% 100%
          )`,
        }}
      />

      {/* Aurora bands */}
      {[
        { color: 'rgba(0,80,180,0.15)', top: '10%', delay: '0s', dur: '8s' },
        { color: 'rgba(80,0,180,0.12)', top: '18%', delay: '2s', dur: '10s' },
        { color: 'rgba(0,140,80,0.10)', top: '8%', delay: '4s', dur: '12s' },
      ].map((a, i) => (
        <div
          key={i}
          className="absolute left-0 right-0"
          style={{
            top: a.top,
            height: '12%',
            background: `conic-gradient(from ${i * 120}deg, ${a.color}, transparent, ${a.color})`,
            animation: `shimmer ${a.dur} ease-in-out ${a.delay} infinite alternate`,
            filter: 'blur(20px)',
          }}
        />
      ))}

      {/* Stars */}
      {Array.from({ length: 80 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
            background: i % 5 === 0 ? '#D4AF37' : 'rgba(255,255,255,0.7)',
            animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite alternate`,
            opacity: 0.4 + Math.random() * 0.6,
          }}
        />
      ))}

      {/* Golden Snitches */}
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

      {/* 12 Floating candles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`candle-${i}`}
          className="absolute"
          style={{
            width: '4px',
            height: '20px',
            left: `${4 + i * 8}%`,
            bottom: `${30 + (i % 4) * 8}%`,
            background: 'linear-gradient(to bottom, #FF6B00, #FFF8DC)',
            borderRadius: '2px',
            animation: `float ${2 + (i % 3) * 0.5}s ease-in-out ${i * 0.25}s infinite alternate`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-8px',
              left: '-2px',
              width: '8px',
              height: '10px',
              background: 'radial-gradient(ellipse, #FF6B00, #FFD700 40%, transparent 70%)',
              borderRadius: '50%',
              animation: `spell-flash 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function MagicalBackground({ quality = 'cinematic' }: MagicalBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    if (quality === 'performance') {
      setWebglFailed(true);
      return;
    }
    if (!containerRef.current) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    const isBalanced = quality === 'balanced';

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050510);
      scene.fog = new THREE.FogExp2(0x050510, 0.015);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isBalanced });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(isBalanced ? 1 : Math.min(window.devicePixelRatio, 2));
      containerRef.current.appendChild(renderer.domElement);

      // ─── STARFIELD ───────────────────────────────────────────
      const starCount = isBalanced ? 1000 : 2000;
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i++) {
        starPositions[i] = (Math.random() - 0.5) * 20;
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({ color: 0xD4AF37, size: 0.05, transparent: true, opacity: 0.8 });
      const starSystem = new THREE.Points(starGeometry, starMaterial);
      scene.add(starSystem);

      // ─── FLOATING CANDLES ─────────────────────────────────────
      const candles: THREE.PointLight[] = [];
      const candleCount = isBalanced ? 12 : 30;
      for (let i = 0; i < candleCount; i++) {
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

      // ─── GOLDEN SNITCHES ─────────────────────────────────────
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

      // ─── HOGWARTS CASTLE SILHOUETTE ───────────────────────────
      if (!isBalanced) {
        const castleShape = new THREE.Shape();
        castleShape.moveTo(-8, -3);
        // Left battlements
        castleShape.lineTo(-8, 0); castleShape.lineTo(-7.5, 0); castleShape.lineTo(-7.5, 0.4);
        castleShape.lineTo(-7.2, 0.4); castleShape.lineTo(-7.2, 0); castleShape.lineTo(-6.8, 0);
        castleShape.lineTo(-6.8, 0.4); castleShape.lineTo(-6.5, 0.4); castleShape.lineTo(-6.5, 0);
        // Left tower
        castleShape.lineTo(-6, 0); castleShape.lineTo(-6, 2); castleShape.lineTo(-5.8, 2.3);
        castleShape.lineTo(-5.6, 2); castleShape.lineTo(-5.6, 2.5); castleShape.lineTo(-5.4, 2.5);
        castleShape.lineTo(-5.4, 2); castleShape.lineTo(-5.2, 2); castleShape.lineTo(-5.2, 0.5);
        // Middle section
        castleShape.lineTo(-4, 0.5); castleShape.lineTo(-4, 0); castleShape.lineTo(-3.5, 0);
        castleShape.lineTo(-3.5, 0.4); castleShape.lineTo(-3.2, 0.4); castleShape.lineTo(-3.2, 0);
        // Great Hall tower
        castleShape.lineTo(-2, 0); castleShape.lineTo(-2, 3); castleShape.lineTo(-1.8, 3.5);
        castleShape.lineTo(-1.5, 3); castleShape.lineTo(-1.5, 4); castleShape.lineTo(-1.2, 4.2);
        castleShape.lineTo(-0.9, 4); castleShape.lineTo(-0.9, 3); castleShape.lineTo(-0.6, 3.5);
        castleShape.lineTo(-0.3, 3); castleShape.lineTo(-0.3, 0.5);
        // Right section
        castleShape.lineTo(1, 0.5); castleShape.lineTo(1, 2); castleShape.lineTo(1.2, 2.3);
        castleShape.lineTo(1.4, 2); castleShape.lineTo(1.4, 2.5); castleShape.lineTo(1.7, 2.5);
        castleShape.lineTo(1.7, 2); castleShape.lineTo(2, 2); castleShape.lineTo(2, 0);
        // Right battlements
        castleShape.lineTo(3.5, 0); castleShape.lineTo(3.5, 0.4); castleShape.lineTo(3.8, 0.4);
        castleShape.lineTo(3.8, 0); castleShape.lineTo(4.2, 0); castleShape.lineTo(4.2, 0.4);
        castleShape.lineTo(4.5, 0.4); castleShape.lineTo(4.5, 0);
        castleShape.lineTo(8, 0); castleShape.lineTo(8, -3);
        castleShape.closePath();

        const castleGeo = new THREE.ShapeGeometry(castleShape);
        const castleMat = new THREE.MeshBasicMaterial({ color: 0x0a0a14, side: THREE.DoubleSide });
        const castle = new THREE.Mesh(castleGeo, castleMat);
        castle.position.set(0, -3.5, -15);
        castle.scale.set(1.5, 1.5, 1);
        scene.add(castle);
      }

      // ─── NORTHERN LIGHTS / AURORA ─────────────────────────────
      const auroraPlanes: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; offset: number }[] = [];
      if (!isBalanced) {
        const auroraColors = [
          [0.0, 0.8, 0.4],
          [0.2, 0.3, 0.9],
          [0.5, 0.1, 0.8],
        ];
        auroraColors.forEach((color, i) => {
          const vertexShader = `
            varying vec2 vUv;
            void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
          `;
          const fragmentShader = `
            uniform float u_time;
            uniform vec3 u_color;
            varying vec2 vUv;
            void main() {
              float wave = sin(vUv.x * 4.0 + u_time * 0.5 + ${i.toFixed(1)}) * 0.5 + 0.5;
              float wave2 = sin(vUv.x * 2.0 - u_time * 0.3 + ${(i * 1.2).toFixed(1)}) * 0.5 + 0.5;
              float alpha = wave * wave2 * (1.0 - abs(vUv.y - 0.5) * 2.0);
              gl_FragColor = vec4(u_color, alpha * 0.18);
            }
          `;
          const mat = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              u_time: { value: 0 },
              u_color: { value: new THREE.Vector3(...color) },
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const geo = new THREE.PlaneGeometry(30, 8);
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(0, 8 + i * 2, -10);
          scene.add(mesh);
          auroraPlanes.push({ mesh, mat, offset: i * 1.5 });
        });
      }

      // ─── OWLS ─────────────────────────────────────────────────
      const owls: { group: THREE.Group; t: number; speed: number; wingSpeed: number; leftWing: THREE.Mesh; rightWing: THREE.Mesh }[] = [];
      if (!isBalanced) {
        for (let i = 0; i < 3; i++) {
          const owlGroup = new THREE.Group();
          const bodyGeo = new THREE.SphereGeometry(0.18, 8, 8);
          bodyGeo.scale(1, 1.4, 0.8);
          const bodyMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e });
          owlGroup.add(new THREE.Mesh(bodyGeo, bodyMat));

          const headGeo = new THREE.SphereGeometry(0.12, 8, 8);
          const head = new THREE.Mesh(headGeo, bodyMat);
          head.position.y = 0.26;
          owlGroup.add(head);

          const wingGeo = new THREE.PlaneGeometry(0.5, 0.2);
          const wingMat = new THREE.MeshBasicMaterial({ color: 0x2a2a3e, side: THREE.DoubleSide });
          const leftWing = new THREE.Mesh(wingGeo, wingMat);
          leftWing.position.set(-0.35, 0, 0);
          const rightWing = new THREE.Mesh(wingGeo, wingMat);
          rightWing.position.set(0.35, 0, 0);
          owlGroup.add(leftWing);
          owlGroup.add(rightWing);

          owlGroup.position.set(
            (Math.random() - 0.5) * 14,
            3 + Math.random() * 4,
            -4 - Math.random() * 4
          );
          scene.add(owlGroup);
          owls.push({
            group: owlGroup,
            t: Math.random() * 100,
            speed: 0.3 + Math.random() * 0.3,
            wingSpeed: 3 + Math.random() * 2,
            leftWing,
            rightWing,
          });
        }
      }

      // ─── SHOOTING STARS ───────────────────────────────────────
      const shootingStars: { line: THREE.Line; startTime: number; duration: number; startX: number; startY: number }[] = [];
      let lastShootingStarTime = Date.now() + 2000;

      const spawnShootingStar = () => {
        const startX = (Math.random() - 0.5) * 16;
        const startY = 3 + Math.random() * 4;
        const points = [
          new THREE.Vector3(startX, startY, -5),
          new THREE.Vector3(startX + 2, startY - 1.5, -5),
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 1 });
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        shootingStars.push({ line, startTime: Date.now(), duration: 800, startX, startY });
      };

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

        auroraPlanes.forEach(({ mat, offset }) => {
          mat.uniforms.u_time.value = elapsedTime + offset;
        });

        owls.forEach(owl => {
          owl.t += 0.005 * owl.speed;
          owl.group.position.x = Math.sin(owl.t) * 7 * Math.cos(owl.t * 0.5);
          owl.group.position.y = 4 + Math.sin(owl.t * 1.3) * 2;
          owl.leftWing.rotation.x = Math.sin(elapsedTime * owl.wingSpeed) * 0.6;
          owl.rightWing.rotation.x = -Math.sin(elapsedTime * owl.wingSpeed) * 0.6;
        });

        const now = Date.now();
        if (now - lastShootingStarTime > 4000 + Math.random() * 4000) {
          spawnShootingStar();
          lastShootingStarTime = now;
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          const age = (now - s.startTime) / s.duration;
          if (age > 1) {
            scene.remove(s.line);
            (s.line.material as THREE.LineBasicMaterial).dispose();
            s.line.geometry.dispose();
            shootingStars.splice(i, 1);
          } else {
            const mat = s.line.material as THREE.LineBasicMaterial;
            mat.opacity = age < 0.5 ? age * 2 : (1 - age) * 2;
            s.line.position.x = age * 3;
            s.line.position.y = -age * 2;
          }
        }

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
        shootingStars.forEach(s => { s.line.geometry.dispose(); (s.line.material as THREE.LineBasicMaterial).dispose(); });
        auroraPlanes.forEach(({ mesh, mat }) => { mesh.geometry.dispose(); mat.dispose(); });
      };
    } catch {
      setWebglFailed(true);
      return () => { cancelAnimationFrame(animationFrameId); };
    }
  }, [quality]);

  if (webglFailed || quality === 'performance') {
    return <CSSFallbackBackground />;
  }

  return <div ref={containerRef} className="fixed inset-0 -z-10 pointer-events-none" />;
}
