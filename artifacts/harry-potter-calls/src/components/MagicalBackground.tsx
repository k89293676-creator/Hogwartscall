import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

interface MagicalBackgroundProps {
  quality?: 'cinematic' | 'balanced' | 'performance';
}

function CSSFallbackBackground() {
  const stars = useMemo(() =>
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 72}%`,
      size: `${Math.random() * 3 + 0.8}px`,
      color: i % 5 === 0 ? '#D4AF37' : i % 7 === 0 ? '#6699FF' : 'rgba(255,255,255,0.75)',
      dur: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 4}s`,
      opacity: 0.35 + Math.random() * 0.65,
    })),
  []);

  const candles = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: `${3 + i * 6.8}%`,
      bottom: `${28 + (i % 4) * 7}%`,
      dur: `${2.2 + (i % 3) * 0.6}s`,
      delay: `${i * 0.22}s`,
    })),
  []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #03020f 0%, #080518 40%, #0a0820 70%, #070514 100%)' }}>

      {/* Deep sky aurora */}
      {[
        { color: 'rgba(20,80,200,0.18)', top: '8%',  blur: 28, dur: '9s',  delay: '0s' },
        { color: 'rgba(90,20,180,0.14)', top: '16%', blur: 22, dur: '13s', delay: '3s' },
        { color: 'rgba(10,150,80,0.11)', top: '5%',  blur: 35, dur: '11s', delay: '6s' },
      ].map((a, i) => (
        <div key={i} className="absolute left-0 right-0" style={{
          top: a.top, height: '14%',
          background: `linear-gradient(90deg, transparent 0%, ${a.color} 30%, ${a.color} 70%, transparent 100%)`,
          filter: `blur(${a.blur}px)`,
          animation: `shimmer ${a.dur} ease-in-out ${a.delay} infinite alternate`,
        }} />
      ))}

      {/* Stars */}
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full" style={{
          width: s.size, height: s.size, left: s.left, top: s.top,
          background: s.color, opacity: s.opacity,
          animation: `float ${s.dur} ease-in-out ${s.delay} infinite alternate`,
          boxShadow: s.color === '#D4AF37' ? `0 0 4px ${s.color}` : 'none',
        }} />
      ))}

      {/* Floating candles */}
      {candles.map(c => (
        <div key={c.id} className="absolute" style={{
          left: c.left, bottom: c.bottom,
          animation: `candleDrift ${c.dur} ease-in-out ${c.delay} infinite`,
        }}>
          <div style={{ width: 10, height: 14, background: 'radial-gradient(ellipse at 50% 80%, #FF9A3C, #FFD700 50%, transparent 75%)',
            borderRadius: '50% 50% 30% 30%', margin: '0 auto 1px',
            animation: `spell-flash ${c.dur} ease-in-out ${c.delay} infinite alternate` }} />
          <div style={{ width: 5, height: 22, background: 'linear-gradient(to bottom, #FFF8DC, #E8D5A0)',
            borderRadius: '2px 2px 1px 1px', margin: '0 auto',
            boxShadow: '0 0 10px 3px rgba(255,154,60,0.5)' }} />
        </div>
      ))}

      {/* Castle silhouette */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: '32%',
        background: 'linear-gradient(to top, #04030e, #070518)',
        clipPath: `polygon(
          0% 100%, 0% 62%, 2% 62%, 2% 48%, 4% 48%, 4% 62%, 6% 62%, 6% 52%, 8% 52%, 8% 62%,
          11% 62%, 11% 44%, 12% 41%, 13% 44%, 15% 44%, 15% 38%, 16.5% 34%, 18% 38%,
          20% 38%, 20% 44%, 22% 44%, 22% 58%, 25% 58%, 25% 44%, 27% 44%, 27% 38%, 28.5% 34%, 30% 38%,
          32% 38%, 32% 52%, 35% 52%, 35% 62%, 38% 62%, 38% 46%,
          43% 46%, 43% 32%, 45% 28%, 47% 32%, 49% 32%, 49% 22%, 51% 17%,
          53% 14%, 55% 17%, 57% 22%, 57% 32%, 59% 28%, 61% 32%,
          63% 32%, 63% 46%, 68% 46%, 68% 62%, 71% 62%, 71% 52%, 73% 52%,
          73% 38%, 74.5% 34%, 76% 38%, 78% 38%, 78% 44%, 80% 44%,
          80% 58%, 83% 58%, 83% 44%, 85% 44%, 85% 38%, 86.5% 34%, 88% 38%,
          90% 38%, 90% 44%, 92% 44%, 92% 62%, 95% 62%, 95% 52%, 97% 52%, 97% 62%,
          100% 62%, 100% 100%
        )`,
      }} />

      {/* Castle window glow */}
      {[20, 35, 50, 65, 80].map((left, i) => (
        <div key={i} className="absolute" style={{
          left: `${left}%`, bottom: `${26 + (i % 2) * 4}%`,
          width: 6, height: 10,
          background: 'rgba(255,200,80,0.6)',
          borderRadius: '3px 3px 0 0',
          boxShadow: '0 0 12px 4px rgba(255,180,60,0.4)',
          animation: `spell-flash ${3 + i * 0.5}s ease-in-out ${i * 0.7}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}

export function MagicalBackground({ quality = 'cinematic' }: MagicalBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    if (quality === 'performance') { setWebglFailed(true); return; }
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

      // ─── STARFIELD with colour variety ───────────────────────────
      const starCount = isBalanced ? 1000 : 2000;
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i++) {
        starPositions[i] = (Math.random() - 0.5) * 20;
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

      // Colour each star: 60% warm gold, 25% cool blue-white, 15% faint red
      const starColors = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const r = Math.random();
        if (r < 0.60) { starColors[i*3]=0.83; starColors[i*3+1]=0.69; starColors[i*3+2]=0.22; }
        else if (r < 0.85) { starColors[i*3]=0.75; starColors[i*3+1]=0.85; starColors[i*3+2]=1.0; }
        else { starColors[i*3]=1.0; starColors[i*3+1]=0.45; starColors[i*3+2]=0.35; }
      }
      starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      const starMaterial = new THREE.PointsMaterial({
        vertexColors: true, size: 0.06,
        transparent: true, opacity: 0.9, sizeAttenuation: true,
      });
      const starSystem = new THREE.Points(starGeometry, starMaterial);
      scene.add(starSystem);

      // Foreground bright stars (depth parallax)
      const fgCount = 80;
      const fgGeo = new THREE.BufferGeometry();
      const fgPos = new Float32Array(fgCount * 3);
      const fgColors = new Float32Array(fgCount * 3);
      for (let i = 0; i < fgCount; i++) {
        fgPos[i*3] = (Math.random() - 0.5) * 14;
        fgPos[i*3+1] = (Math.random() - 0.5) * 10;
        fgPos[i*3+2] = (Math.random() - 0.5) * 5;
        fgColors[i*3]=0.9; fgColors[i*3+1]=0.85; fgColors[i*3+2]=0.6;
      }
      fgGeo.setAttribute('position', new THREE.BufferAttribute(fgPos, 3));
      fgGeo.setAttribute('color', new THREE.BufferAttribute(fgColors, 3));
      const fgMat = new THREE.PointsMaterial({ vertexColors: true, size: 0.12, transparent: true, opacity: 0.95, sizeAttenuation: true });
      const starSystemFG = new THREE.Points(fgGeo, fgMat);
      scene.add(starSystemFG);

      // ─── FLOATING CANDLES ─────────────────────────────────────────
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

      // ─── GOLDEN SNITCHES ─────────────────────────────────────────
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
        snitch.add(leftWing); snitch.add(rightWing);
        snitch.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5 - 2);
        snitch.userData = { t: Math.random() * 100, leftWing, rightWing, speed: 1 + Math.random() };
        scene.add(snitch);
        snitches.push(snitch);
      }

      // ─── CASTLE SILHOUETTE ───────────────────────────────────────
      if (!isBalanced) {
        const castleShape = new THREE.Shape();
        castleShape.moveTo(-8, -3);
        castleShape.lineTo(-8, 0); castleShape.lineTo(-7.5, 0); castleShape.lineTo(-7.5, 0.4);
        castleShape.lineTo(-7.2, 0.4); castleShape.lineTo(-7.2, 0); castleShape.lineTo(-6.8, 0);
        castleShape.lineTo(-6.8, 0.4); castleShape.lineTo(-6.5, 0.4); castleShape.lineTo(-6.5, 0);
        castleShape.lineTo(-6, 0); castleShape.lineTo(-6, 2); castleShape.lineTo(-5.8, 2.3);
        castleShape.lineTo(-5.6, 2); castleShape.lineTo(-5.6, 2.5); castleShape.lineTo(-5.4, 2.5);
        castleShape.lineTo(-5.4, 2); castleShape.lineTo(-5.2, 2); castleShape.lineTo(-5.2, 0.5);
        castleShape.lineTo(-4, 0.5); castleShape.lineTo(-4, 0); castleShape.lineTo(-3.5, 0);
        castleShape.lineTo(-3.5, 0.4); castleShape.lineTo(-3.2, 0.4); castleShape.lineTo(-3.2, 0);
        castleShape.lineTo(-2, 0); castleShape.lineTo(-2, 3); castleShape.lineTo(-1.8, 3.5);
        castleShape.lineTo(-1.5, 3); castleShape.lineTo(-1.5, 4); castleShape.lineTo(-1.2, 4.2);
        castleShape.lineTo(-0.9, 4); castleShape.lineTo(-0.9, 3); castleShape.lineTo(-0.6, 3.5);
        castleShape.lineTo(-0.3, 3); castleShape.lineTo(-0.3, 0.5);
        castleShape.lineTo(1, 0.5); castleShape.lineTo(1, 2); castleShape.lineTo(1.2, 2.3);
        castleShape.lineTo(1.4, 2); castleShape.lineTo(1.4, 2.5); castleShape.lineTo(1.7, 2.5);
        castleShape.lineTo(1.7, 2); castleShape.lineTo(2, 2); castleShape.lineTo(2, 0);
        castleShape.lineTo(3.5, 0); castleShape.lineTo(3.5, 0.4); castleShape.lineTo(3.8, 0.4);
        castleShape.lineTo(3.8, 0); castleShape.lineTo(4.2, 0); castleShape.lineTo(4.2, 0.4);
        castleShape.lineTo(4.5, 0.4); castleShape.lineTo(4.5, 0);
        castleShape.lineTo(8, 0); castleShape.lineTo(8, -3);
        castleShape.closePath();

        const castleGeo = new THREE.ShapeGeometry(castleShape);
        const castle = new THREE.Mesh(castleGeo, new THREE.MeshBasicMaterial({ color: 0x0a0a14, side: THREE.DoubleSide }));
        castle.position.set(0, -3.5, -15);
        castle.scale.set(1.5, 1.5, 1);
        scene.add(castle);
      }

      // ─── AURORA PLANES ────────────────────────────────────────────
      const auroraPlanes: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; offset: number }[] = [];
      if (!isBalanced) {
        const auroraColors = [[0.0, 0.8, 0.4],[0.2, 0.3, 0.9],[0.5, 0.1, 0.8]];
        auroraColors.forEach((color, i) => {
          const mat = new THREE.ShaderMaterial({
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `
              uniform float u_time; uniform vec3 u_color; varying vec2 vUv;
              void main() {
                float wave = sin(vUv.x * 4.0 + u_time * 0.5 + ${i.toFixed(1)}) * 0.5 + 0.5;
                float wave2 = sin(vUv.x * 2.0 - u_time * 0.3 + ${(i * 1.2).toFixed(1)}) * 0.5 + 0.5;
                float alpha = wave * wave2 * (1.0 - abs(vUv.y - 0.5) * 2.0);
                gl_FragColor = vec4(u_color, alpha * 0.18);
              }`,
            uniforms: { u_time: { value: 0 }, u_color: { value: new THREE.Vector3(...color) } },
            transparent: true, side: THREE.DoubleSide, depthWrite: false,
          });
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), mat);
          mesh.position.set(0, 8 + i * 2, -10);
          scene.add(mesh);
          auroraPlanes.push({ mesh, mat, offset: i * 1.5 });
        });
      }

      // ─── VOLUMETRIC FOG SHAFTS (cinematic only) ─────────────────
      const shaftCount = isBalanced ? 0 : 5;
      const shafts: THREE.Mesh[] = [];
      for (let i = 0; i < shaftCount; i++) {
        const shaftMat = new THREE.ShaderMaterial({
          vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
          fragmentShader: `
            uniform float u_time; varying vec2 vUv;
            void main() {
              float alpha = (1.0 - vUv.y) * 0.5 * (0.4 + 0.3 * sin(u_time * 0.4 + vUv.x * 3.0));
              alpha *= smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
              gl_FragColor = vec4(0.85, 0.78, 0.4, alpha * 0.12);
            }`,
          uniforms: { u_time: { value: 0 } },
          transparent: true, depthWrite: false, side: THREE.DoubleSide,
        });
        const shaft = new THREE.Mesh(new THREE.PlaneGeometry(1.5 + Math.random(), 14), shaftMat);
        shaft.position.set(-6 + i * 3 + Math.random(), 2, -6 - i * 1.5);
        shaft.rotation.z = (Math.random() - 0.5) * 0.3;
        scene.add(shaft);
        shafts.push(shaft);
      }

      // ─── MIST LAYER (cinematic only) ─────────────────────────────
      let mist: THREE.Mesh | null = null;
      if (!isBalanced) {
        const mistMat = new THREE.ShaderMaterial({
          vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
          fragmentShader: `
            uniform float u_time; varying vec2 vUv;
            float noise(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
            float smoothNoise(vec2 p){
              vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
              float a=noise(i); float b=noise(i+vec2(1,0));
              float c=noise(i+vec2(0,1)); float d=noise(i+vec2(1,1));
              return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
            }
            void main(){
              float n = smoothNoise(vUv * 4.0 + vec2(u_time * 0.04, 0.0));
              n += smoothNoise(vUv * 8.0 - vec2(u_time * 0.02, u_time * 0.01)) * 0.5;
              float alpha = n * (1.0 - abs(vUv.y - 0.5) * 2.5) * 0.22;
              gl_FragColor = vec4(0.12, 0.10, 0.22, clamp(alpha, 0.0, 0.18));
            }`,
          uniforms: { u_time: { value: 0 } },
          transparent: true, depthWrite: false,
        });
        mist = new THREE.Mesh(new THREE.PlaneGeometry(30, 5), mistMat);
        mist.position.set(0, -2.5, -8);
        scene.add(mist);
      }

      // ─── OWLS ─────────────────────────────────────────────────────
      const owls: { group: THREE.Group; t: number; speed: number; wingSpeed: number; leftWing: THREE.Mesh; rightWing: THREE.Mesh }[] = [];
      if (!isBalanced) {
        for (let i = 0; i < 3; i++) {
          const owlGroup = new THREE.Group();
          const bodyMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e });
          const bodyGeo = new THREE.SphereGeometry(0.18, 8, 8);
          bodyGeo.scale(1, 1.4, 0.8);
          owlGroup.add(new THREE.Mesh(bodyGeo, bodyMat));
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), bodyMat);
          head.position.y = 0.26;
          owlGroup.add(head);
          const wingMat = new THREE.MeshBasicMaterial({ color: 0x2a2a3e, side: THREE.DoubleSide });
          const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), wingMat);
          leftWing.position.set(-0.35, 0, 0);
          const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), wingMat);
          rightWing.position.set(0.35, 0, 0);
          owlGroup.add(leftWing); owlGroup.add(rightWing);
          owlGroup.position.set((Math.random() - 0.5) * 14, 3 + Math.random() * 4, -4 - Math.random() * 4);
          scene.add(owlGroup);
          owls.push({ group: owlGroup, t: Math.random() * 100, speed: 0.3 + Math.random() * 0.3, wingSpeed: 3 + Math.random() * 2, leftWing, rightWing });
        }
      }

      // ─── SHOOTING STARS ───────────────────────────────────────────
      const shootingStars: { line: THREE.Line; startTime: number; duration: number }[] = [];
      let lastShootingStarTime = Date.now() + 2000;

      const spawnShootingStar = () => {
        const startX = (Math.random() - 0.5) * 16;
        const startY = 3 + Math.random() * 4;
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(startX, startY, -5),
          new THREE.Vector3(startX + 2, startY - 1.5, -5),
        ]);
        const mat = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 1 });
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        shootingStars.push({ line, startTime: Date.now(), duration: 800 });
      };

      const clock = new THREE.Clock();
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        starSystem.rotation.y += 0.0005;
        starSystem.rotation.x += 0.0002;
        starSystemFG.rotation.y += 0.0002;
        starSystemFG.rotation.x += 0.0001;

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

        auroraPlanes.forEach(({ mat, offset }) => { mat.uniforms.u_time.value = elapsedTime + offset; });

        shafts.forEach((s, i) => {
          (s.material as THREE.ShaderMaterial).uniforms.u_time.value = elapsedTime + i;
        });

        if (mist) (mist.material as THREE.ShaderMaterial).uniforms.u_time.value = elapsedTime;

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
            (s.line.material as THREE.LineBasicMaterial).opacity = age < 0.5 ? age * 2 : (1 - age) * 2;
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
        starGeometry.dispose(); starMaterial.dispose(); fgGeo.dispose(); fgMat.dispose();
        shootingStars.forEach(s => { s.line.geometry.dispose(); (s.line.material as THREE.LineBasicMaterial).dispose(); });
        auroraPlanes.forEach(({ mesh, mat }) => { mesh.geometry.dispose(); mat.dispose(); });
      };
    } catch {
      setWebglFailed(true);
      return () => { cancelAnimationFrame(animationFrameId); };
    }
  }, [quality]);

  if (webglFailed || quality === 'performance') return <CSSFallbackBackground />;
  return <div ref={containerRef} className="fixed inset-0 -z-10 pointer-events-none" />;
}
