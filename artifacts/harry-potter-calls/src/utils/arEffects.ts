import * as THREE from 'three';

type EffectFn = (time: number) => boolean;

export function createLumos(scene: THREE.Scene, position: THREE.Vector3): EffectFn {
  const geometry = new THREE.SphereGeometry(0.5, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.8 });
  const sphere = new THREE.Mesh(geometry, material);
  const light = new THREE.PointLight(0xFFD700, 2, 10);
  const group = new THREE.Group();
  group.position.copy(position);
  group.add(sphere);
  group.add(light);
  scene.add(group);

  const haloGeo = new THREE.BufferGeometry();
  const haloPositions = new Float32Array(60 * 3);
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2;
    haloPositions[i * 3] = Math.cos(angle) * 0.8;
    haloPositions[i * 3 + 1] = Math.sin(angle) * 0.8;
    haloPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPositions, 3));
  const haloMat = new THREE.PointsMaterial({ color: 0xFFFACD, size: 0.08, transparent: true, opacity: 1 });
  const halo = new THREE.Points(haloGeo, haloMat);
  group.add(halo);

  const startTime = Date.now();
  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / 1800;
    material.opacity = Math.max(0, 0.8 - progress * 0.8);
    light.intensity = Math.max(0, 2 - progress * 2);
    haloMat.opacity = Math.max(0, 1 - progress);
    halo.rotation.z += 0.05;
    group.scale.setScalar(1 + progress * 0.5);
    if (elapsed > 1800) {
      scene.remove(group);
      geometry.dispose();
      material.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      return true;
    }
    return false;
  };
}

export function createIncendio(scene: THREE.Scene, position: THREE.Vector3): EffectFn {
  const particleCount = 120;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities: THREE.Vector3[] = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    velocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6 + 3,
      (Math.random() - 0.5) * 6
    ));
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xFF4500, size: 0.2, transparent: true, opacity: 1, vertexColors: false });

  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(40 * 3);
  const sparkVel: THREE.Vector3[] = [];
  for (let i = 0; i < 40; i++) {
    sparkPos[i * 3] = position.x;
    sparkPos[i * 3 + 1] = position.y;
    sparkPos[i * 3 + 2] = position.z;
    sparkVel.push(new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      Math.random() * 5 + 2,
      (Math.random() - 0.5) * 8
    ));
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({ color: 0xFFD700, size: 0.12, transparent: true, opacity: 1 });
  const sparks = new THREE.Points(sparkGeo, sparkMat);

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  scene.add(sparks);

  const startTime = Date.now();
  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const dt = 0.016;
    const posAttr = geometry.getAttribute('position');
    for (let i = 0; i < particleCount; i++) {
      const v = velocities[i];
      v.y -= 8 * dt;
      posAttr.setXYZ(i, posAttr.getX(i) + v.x * dt, posAttr.getY(i) + v.y * dt, posAttr.getZ(i) + v.z * dt);
    }
    posAttr.needsUpdate = true;

    const sparkAttr = sparkGeo.getAttribute('position');
    for (let i = 0; i < 40; i++) {
      const v = sparkVel[i];
      v.y -= 10 * dt;
      sparkAttr.setXYZ(i, sparkAttr.getX(i) + v.x * dt, sparkAttr.getY(i) + v.y * dt, sparkAttr.getZ(i) + v.z * dt);
    }
    sparkAttr.needsUpdate = true;

    const prog = elapsed / 1500;
    material.opacity = Math.max(0, 1 - prog);
    sparkMat.opacity = Math.max(0, 1 - prog);

    if (elapsed > 1500) {
      scene.remove(particles);
      scene.remove(sparks);
      geometry.dispose();
      material.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      return true;
    }
    return false;
  };
}

export function createExpelliarmus(scene: THREE.Scene, position: THREE.Vector3): EffectFn {
  const group = new THREE.Group();
  for (let bolt = 0; bolt < 3; bolt++) {
    const points: THREE.Vector3[] = [];
    let curr = position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0));
    points.push(curr.clone());
    for (let i = 0; i < 8; i++) {
      curr.add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, -1.2));
      points.push(curr.clone());
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: bolt === 0 ? 0xDC143C : 0xFF69B4, transparent: true, opacity: 1 - bolt * 0.3 });
    group.add(new THREE.Line(geo, mat));
  }

  const flashGeo = new THREE.SphereGeometry(0.3, 8, 8);
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xFF0055, transparent: true, opacity: 0.9 });
  const flash = new THREE.Mesh(flashGeo, flashMat);
  flash.position.copy(position);
  group.add(flash);

  scene.add(group);
  const startTime = Date.now();
  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const prog = elapsed / 600;
    group.children.forEach(child => {
      if ((child as any).material) (child as any).material.opacity = Math.max(0, 1 - prog);
    });
    flash.scale.setScalar(1 + prog * 2);
    if (elapsed > 600) {
      scene.remove(group);
      return true;
    }
    return false;
  };
}

export function createWingardium(scene: THREE.Scene, position: THREE.Vector3): EffectFn {
  const group = new THREE.Group();
  group.position.copy(position);

  for (let i = 0; i < 5; i++) {
    const geo = new THREE.PlaneGeometry(0.12, 0.4);
    const mat = new THREE.MeshBasicMaterial({ color: 0x98FB98, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const feather = new THREE.Mesh(geo, mat);
    feather.position.set((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 0.5);
    feather.rotation.set(Math.random(), Math.random(), Math.random());
    feather.userData = { offsetAngle: (i / 5) * Math.PI * 2, radius: 0.6 + Math.random() * 0.4 };
    group.add(feather);
  }

  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(30 * 3);
  for (let i = 0; i < 30; i++) {
    sparkPos[i * 3] = (Math.random() - 0.5) * 2;
    sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 2;
    sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 1;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({ color: 0x32CD32, size: 0.08, transparent: true, opacity: 1 });
  group.add(new THREE.Points(sparkGeo, sparkMat));

  scene.add(group);
  const startTime = Date.now();

  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const t = elapsed * 0.002;
    const prog = elapsed / 2200;

    group.children.forEach((child, idx) => {
      if (idx < 5) {
        const angle = child.userData.offsetAngle + t;
        const r = child.userData.radius;
        child.position.x = Math.cos(angle) * r;
        child.position.y = Math.sin(t * 0.7 + idx) * 0.5 + 0.3;
        child.rotation.z = t + idx;
        if ((child as any).material) (child as any).material.opacity = Math.max(0, 0.85 - prog);
      }
    });

    const lastChild = group.children[group.children.length - 1];
    if ((lastChild as any).material) (lastChild as any).material.opacity = Math.max(0, 1 - prog);

    group.position.y += 0.003;

    if (elapsed > 2200) {
      scene.remove(group);
      return true;
    }
    return false;
  };
}

export function createPatronus(scene: THREE.Scene, position: THREE.Vector3): EffectFn {
  const group = new THREE.Group();
  group.position.copy(position);

  const ringCount = 3;
  const rings: { points: THREE.Points; mat: THREE.PointsMaterial; radius: number }[] = [];

  for (let r = 0; r < ringCount; r++) {
    const count = 80 + r * 20;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const baseRadius = 0.3 + r * 0.3;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * baseRadius;
      pos[i * 3 + 1] = Math.sin(angle) * baseRadius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: r === 0 ? 0xFFFFFF : r === 1 ? 0xA8D8F0 : 0x87CEEB,
      size: 0.07 - r * 0.01,
      transparent: true,
      opacity: 1,
    });
    const pts = new THREE.Points(geo, mat);
    group.add(pts);
    rings.push({ points: pts, mat, radius: baseRadius });
  }

  const glowGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xE0F0FF, transparent: true, opacity: 0.9 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  group.add(glow);

  const light = new THREE.PointLight(0xA8D8F0, 3, 8);
  group.add(light);

  scene.add(group);
  const startTime = Date.now();

  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const prog = elapsed / 2500;

    rings.forEach(({ points, mat, radius: _r }, idx) => {
      const scale = 1 + prog * (2 + idx * 0.5);
      points.scale.setScalar(scale);
      mat.opacity = Math.max(0, 1 - prog);
      points.rotation.z += 0.01 * (idx % 2 === 0 ? 1 : -1);
    });

    glow.scale.setScalar(1 + prog * 1.5);
    glowMat.opacity = Math.max(0, 0.9 - prog);
    light.intensity = Math.max(0, 3 - prog * 3);

    if (elapsed > 2500) {
      scene.remove(group);
      return true;
    }
    return false;
  };
}

export function createAccio(scene: THREE.Scene, position: THREE.Vector3): EffectFn {
  const particleCount = 80;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(particleCount * 3);
  const velocities: THREE.Vector3[] = [];

  for (let i = 0; i < particleCount; i++) {
    const startX = position.x + (Math.random() - 0.5) * 8;
    const startY = position.y + (Math.random() - 0.5) * 8;
    const startZ = position.z - 3 - Math.random() * 5;
    pos[i * 3] = startX;
    pos[i * 3 + 1] = startY;
    pos[i * 3 + 2] = startZ;
    const dir = new THREE.Vector3(position.x - startX, position.y - startY, position.z - startZ);
    dir.normalize().multiplyScalar(5 + Math.random() * 4);
    velocities.push(dir);
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x9B59B6, size: 0.15, transparent: true, opacity: 1 });

  const trailGeo = new THREE.BufferGeometry();
  const trailPos = new Float32Array(particleCount * 3);
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  const trailMat = new THREE.PointsMaterial({ color: 0xDA90FF, size: 0.06, transparent: true, opacity: 0.6 });

  const particles = new THREE.Points(geo, mat);
  const trails = new THREE.Points(trailGeo, trailMat);
  scene.add(particles);
  scene.add(trails);

  const startTime = Date.now();
  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const dt = 0.016;
    const posAttr = geo.getAttribute('position');
    const trailAttr = trailGeo.getAttribute('position');

    for (let i = 0; i < particleCount; i++) {
      trailAttr.setXYZ(i, posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      posAttr.setXYZ(
        i,
        posAttr.getX(i) + velocities[i].x * dt,
        posAttr.getY(i) + velocities[i].y * dt,
        posAttr.getZ(i) + velocities[i].z * dt
      );
    }
    posAttr.needsUpdate = true;
    trailAttr.needsUpdate = true;

    const prog = elapsed / 1200;
    mat.opacity = Math.max(0, 1 - prog * 0.8);
    trailMat.opacity = Math.max(0, 0.6 - prog);

    if (elapsed > 1200) {
      scene.remove(particles);
      scene.remove(trails);
      geo.dispose();
      mat.dispose();
      trailGeo.dispose();
      trailMat.dispose();
      return true;
    }
    return false;
  };
}

export function createStupefy(scene: THREE.Scene, position: THREE.Vector3): EffectFn {
  const group = new THREE.Group();

  const flashGeo = new THREE.SphereGeometry(0.1, 16, 16);
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xFF1493, transparent: true, opacity: 1 });
  const flash = new THREE.Mesh(flashGeo, flashMat);
  flash.position.copy(position);
  group.add(flash);

  const ringPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    ringPoints.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
  }
  const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
  const ringMat = new THREE.LineBasicMaterial({ color: 0xFF69B4, transparent: true, opacity: 1 });
  const ring = new THREE.Line(ringGeo, ringMat);
  ring.position.copy(position);
  group.add(ring);

  const pCount = 60;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pVel: THREE.Vector3[] = [];
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = position.x;
    pPos[i * 3 + 1] = position.y;
    pPos[i * 3 + 2] = position.z;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    pVel.push(new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * 4,
      Math.sin(phi) * Math.sin(theta) * 4,
      Math.cos(phi) * 2
    ));
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xFF1493, size: 0.1, transparent: true, opacity: 1 });
  group.add(new THREE.Points(pGeo, pMat));

  const light = new THREE.PointLight(0xFF1493, 4, 6);
  light.position.copy(position);
  group.add(light);

  scene.add(group);
  const startTime = Date.now();

  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const prog = elapsed / 800;
    const dt = 0.016;

    flash.scale.setScalar(1 + prog * 5);
    flashMat.opacity = Math.max(0, 1 - prog);
    ring.scale.setScalar(1 + prog * 4);
    ringMat.opacity = Math.max(0, 1 - prog);
    light.intensity = Math.max(0, 4 - prog * 4);

    const pAttr = pGeo.getAttribute('position');
    for (let i = 0; i < pCount; i++) {
      const v = pVel[i];
      pAttr.setXYZ(i, pAttr.getX(i) + v.x * dt, pAttr.getY(i) + v.y * dt, pAttr.getZ(i) + v.z * dt);
    }
    pAttr.needsUpdate = true;
    pMat.opacity = Math.max(0, 1 - prog);

    if (elapsed > 800) {
      scene.remove(group);
      return true;
    }
    return false;
  };
}

export function createProtego(scene: THREE.Scene, position: THREE.Vector3): EffectFn {
  const group = new THREE.Group();
  group.position.copy(position);

  const shieldGeo = new THREE.SphereGeometry(1.2, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const shieldMat = new THREE.MeshBasicMaterial({
    color: 0x00BFFF,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    wireframe: false,
  });
  const shield = new THREE.Mesh(shieldGeo, shieldMat);
  group.add(shield);

  const wireMat = new THREE.MeshBasicMaterial({ color: 0x87CEFA, transparent: true, opacity: 0.5, wireframe: true });
  const wire = new THREE.Mesh(shieldGeo, wireMat);
  group.add(wire);

  const runeCount = 30;
  const runeGeo = new THREE.BufferGeometry();
  const runePos = new Float32Array(runeCount * 3);
  for (let i = 0; i < runeCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5;
    runePos[i * 3] = Math.sin(phi) * Math.cos(theta) * 1.2;
    runePos[i * 3 + 1] = Math.cos(phi) * 1.2;
    runePos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * 1.2;
  }
  runeGeo.setAttribute('position', new THREE.BufferAttribute(runePos, 3));
  const runeMat = new THREE.PointsMaterial({ color: 0x00FFFF, size: 0.1, transparent: true, opacity: 0.9 });
  group.add(new THREE.Points(runeGeo, runeMat));

  const light = new THREE.PointLight(0x00BFFF, 2, 5);
  group.add(light);

  scene.add(group);
  const startTime = Date.now();

  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const prog = elapsed / 2000;

    const pulse = 1 + Math.sin(elapsed * 0.008) * 0.05;
    group.scale.setScalar(pulse);

    shieldMat.opacity = Math.max(0, 0.25 - prog * 0.2);
    wireMat.opacity = Math.max(0, 0.5 - prog * 0.4);

    const lastChild = group.children[group.children.length - 2];
    if ((lastChild as any).material) (lastChild as any).material.opacity = Math.max(0, 0.9 - prog);
    light.intensity = Math.max(0, 2 - prog * 2);

    if (elapsed > 2000) {
      scene.remove(group);
      return true;
    }
    return false;
  };
}

export function createNox(scene: THREE.Scene, position: THREE.Vector3): EffectFn {
  const group = new THREE.Group();
  group.position.copy(position);

  const particleCount = 80;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(particleCount * 3);
  const velocities: THREE.Vector3[] = [];

  for (let i = 0; i < particleCount; i++) {
    pos[i * 3] = 0;
    pos[i * 3 + 1] = 0;
    pos[i * 3 + 2] = 0;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    velocities.push(new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * (2 + Math.random() * 2),
      Math.sin(phi) * Math.sin(theta) * (2 + Math.random() * 2),
      Math.cos(phi) * (1 + Math.random())
    ));
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x2C3E50, size: 0.25, transparent: true, opacity: 0.9 });
  group.add(new THREE.Points(geo, mat));

  const darkGeo = new THREE.SphereGeometry(0.3, 12, 12);
  const darkMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.8 });
  const darkSphere = new THREE.Mesh(darkGeo, darkMat);
  group.add(darkSphere);

  scene.add(group);
  const startTime = Date.now();

  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const dt = 0.016;
    const prog = elapsed / 1600;

    const posAttr = geo.getAttribute('position');
    for (let i = 0; i < particleCount; i++) {
      const v = velocities[i];
      posAttr.setXYZ(i,
        posAttr.getX(i) + v.x * dt,
        posAttr.getY(i) + v.y * dt,
        posAttr.getZ(i) + v.z * dt
      );
    }
    posAttr.needsUpdate = true;
    mat.opacity = Math.max(0, 0.9 - prog);
    darkSphere.scale.setScalar(1 + prog * 3);
    darkMat.opacity = Math.max(0, 0.8 - prog);

    if (elapsed > 1600) {
      scene.remove(group);
      geo.dispose();
      mat.dispose();
      darkGeo.dispose();
      darkMat.dispose();
      return true;
    }
    return false;
  };
}

export function createAlohomora(scene: THREE.Scene, position: THREE.Vector3): EffectFn {
  const group = new THREE.Group();
  group.position.copy(position);

  const ringCount = 40;
  const ringGeo = new THREE.BufferGeometry();
  const ringPos = new Float32Array(ringCount * 3);
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    ringPos[i * 3] = Math.cos(angle) * 0.6;
    ringPos[i * 3 + 1] = Math.sin(angle) * 0.6;
    ringPos[i * 3 + 2] = 0;
  }
  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
  const ringMat = new THREE.PointsMaterial({ color: 0xF39C12, size: 0.15, transparent: true, opacity: 1 });
  const ring = new THREE.Points(ringGeo, ringMat);
  group.add(ring);

  const sparkCount = 60;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos2 = new Float32Array(sparkCount * 3);
  const sparkVel: THREE.Vector3[] = [];
  for (let i = 0; i < sparkCount; i++) {
    sparkPos2[i * 3] = 0; sparkPos2[i * 3 + 1] = 0; sparkPos2[i * 3 + 2] = 0;
    const a = (i / sparkCount) * Math.PI * 2;
    sparkVel.push(new THREE.Vector3(
      Math.cos(a) * (1.5 + Math.random() * 2),
      Math.sin(a) * (1.5 + Math.random() * 2),
      (Math.random() - 0.5) * 1
    ));
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos2, 3));
  const sparkMat2 = new THREE.PointsMaterial({ color: 0xFFD700, size: 0.1, transparent: true, opacity: 1 });
  const sparks = new THREE.Points(sparkGeo, sparkMat2);
  group.add(sparks);

  const light = new THREE.PointLight(0xF39C12, 3, 6);
  group.add(light);

  scene.add(group);
  const startTime = Date.now();

  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const prog = elapsed / 1800;
    const t = elapsed * 0.003;

    ring.rotation.z = t * 2;
    ring.scale.setScalar(1 + prog * 2);
    ringMat.opacity = Math.max(0, 1 - prog);

    const sparkAttr = sparkGeo.getAttribute('position');
    const dt = 0.016;
    for (let i = 0; i < sparkCount; i++) {
      const v = sparkVel[i];
      sparkAttr.setXYZ(i, sparkAttr.getX(i) + v.x * dt, sparkAttr.getY(i) + v.y * dt, sparkAttr.getZ(i) + v.z * dt);
    }
    sparkAttr.needsUpdate = true;
    sparkMat2.opacity = Math.max(0, 1 - prog);
    light.intensity = Math.max(0, 3 - prog * 3);

    if (elapsed > 1800) {
      scene.remove(group);
      ringGeo.dispose(); ringMat.dispose();
      sparkGeo.dispose(); sparkMat2.dispose();
      return true;
    }
    return false;
  };
}

export function createRiddikulus(scene: THREE.Scene, position: THREE.Vector3): EffectFn {
  const group = new THREE.Group();
  group.position.copy(position);

  const confettiColors = [0xE91E63, 0xFF5722, 0xFFEB3B, 0x4CAF50, 0x2196F3, 0x9C27B0];
  const confettiCount = 60;
  const meshes: THREE.Mesh[] = [];
  const velocities: THREE.Vector3[] = [];
  const rotSpeeds: THREE.Vector3[] = [];

  for (let i = 0; i < confettiCount; i++) {
    const geo = new THREE.PlaneGeometry(0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({
      color: confettiColors[i % confettiColors.length],
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0, 0);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    velocities.push(new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * (3 + Math.random() * 3),
      Math.sin(phi) * Math.sin(theta) * (3 + Math.random() * 3),
      Math.cos(phi) * (1 + Math.random() * 2)
    ));
    rotSpeeds.push(new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    ));
    group.add(mesh);
    meshes.push(mesh);
  }

  const light = new THREE.PointLight(0xE91E63, 4, 8);
  group.add(light);

  scene.add(group);
  const startTime = Date.now();

  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const dt = 0.016;
    const prog = elapsed / 2000;

    meshes.forEach((mesh, i) => {
      const v = velocities[i];
      v.y -= 3 * dt;
      mesh.position.x += v.x * dt;
      mesh.position.y += v.y * dt;
      mesh.position.z += v.z * dt;
      mesh.rotation.x += rotSpeeds[i].x * dt;
      mesh.rotation.y += rotSpeeds[i].y * dt;
      mesh.rotation.z += rotSpeeds[i].z * dt;
      (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - prog);
    });
    light.intensity = Math.max(0, 4 - prog * 4);

    if (elapsed > 2000) {
      scene.remove(group);
      return true;
    }
    return false;
  };
}

export function createExpectoPatronum(scene: THREE.Scene, _position: THREE.Vector3): EffectFn {
  const group = new THREE.Group();

  // Silver stag outline from LineSegments
  const deerPoints: [THREE.Vector3, THREE.Vector3][] = [
    // Body
    [new THREE.Vector3(-1.2, 0, 0), new THREE.Vector3(1.2, 0, 0)],
    [new THREE.Vector3(-1.2, 0, 0), new THREE.Vector3(-1.2, 0.8, 0)],
    [new THREE.Vector3(1.2, 0, 0), new THREE.Vector3(1.2, 0.8, 0)],
    [new THREE.Vector3(-1.2, 0.8, 0), new THREE.Vector3(1.2, 0.8, 0)],
    // Neck & head
    [new THREE.Vector3(1.2, 0.8, 0), new THREE.Vector3(1.5, 1.4, 0)],
    [new THREE.Vector3(1.5, 1.4, 0), new THREE.Vector3(1.7, 1.8, 0)],
    [new THREE.Vector3(1.7, 1.8, 0), new THREE.Vector3(1.9, 1.6, 0)],
    [new THREE.Vector3(1.9, 1.6, 0), new THREE.Vector3(1.5, 1.4, 0)],
    // Antlers
    [new THREE.Vector3(1.7, 1.8, 0), new THREE.Vector3(1.5, 2.5, 0)],
    [new THREE.Vector3(1.5, 2.5, 0), new THREE.Vector3(1.2, 2.8, 0)],
    [new THREE.Vector3(1.5, 2.5, 0), new THREE.Vector3(1.8, 2.8, 0)],
    [new THREE.Vector3(1.2, 2.8, 0), new THREE.Vector3(1.0, 3.1, 0)],
    [new THREE.Vector3(1.8, 2.8, 0), new THREE.Vector3(2.0, 3.1, 0)],
    // Legs
    [new THREE.Vector3(-0.8, 0, 0), new THREE.Vector3(-0.9, -0.8, 0)],
    [new THREE.Vector3(-0.9, -0.8, 0), new THREE.Vector3(-0.9, -1.6, 0)],
    [new THREE.Vector3(-0.4, 0, 0), new THREE.Vector3(-0.4, -0.8, 0)],
    [new THREE.Vector3(-0.4, -0.8, 0), new THREE.Vector3(-0.35, -1.6, 0)],
    [new THREE.Vector3(0.4, 0, 0), new THREE.Vector3(0.4, -0.8, 0)],
    [new THREE.Vector3(0.4, -0.8, 0), new THREE.Vector3(0.35, -1.6, 0)],
    [new THREE.Vector3(0.9, 0, 0), new THREE.Vector3(1.0, -0.8, 0)],
    [new THREE.Vector3(1.0, -0.8, 0), new THREE.Vector3(1.0, -1.6, 0)],
    // Tail
    [new THREE.Vector3(-1.2, 0.4, 0), new THREE.Vector3(-1.6, 0.6, 0)],
  ];

  const allPoints: THREE.Vector3[] = [];
  deerPoints.forEach(([a, b]) => { allPoints.push(a, b); });

  const deerGeo = new THREE.BufferGeometry().setFromPoints(allPoints);
  const deerMat = new THREE.LineBasicMaterial({ color: 0xE8F4FD, transparent: true, opacity: 0 });
  const deer = new THREE.LineSegments(deerGeo, deerMat);
  deer.position.set(-8, 0, 0);
  deer.scale.setScalar(0.5);
  group.add(deer);

  // Silver glow particles trailing behind
  const trailGeo = new THREE.BufferGeometry();
  const trailPos = new Float32Array(50 * 3);
  for (let i = 0; i < 50; i++) {
    trailPos[i * 3] = -8 - Math.random() * 2;
    trailPos[i * 3 + 1] = (Math.random() - 0.5) * 2;
    trailPos[i * 3 + 2] = 0;
  }
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  const trailMat = new THREE.PointsMaterial({ color: 0xC0E8FF, size: 0.08, transparent: true, opacity: 0 });
  const trail = new THREE.Points(trailGeo, trailMat);
  group.add(trail);

  const light = new THREE.PointLight(0xE8F4FD, 3, 10);
  group.add(light);

  scene.add(group);
  const startTime = Date.now();
  const duration = 2500;

  return (_time: number) => {
    const elapsed = Date.now() - startTime;
    const prog = elapsed / duration;

    // Gallop across screen
    const xPos = -8 + prog * 18;
    deer.position.x = xPos;
    light.position.x = xPos;
    light.position.y = 0;
    light.position.z = 0;

    // Fade in, hold, fade out
    const opacity = prog < 0.1 ? prog * 10 : prog > 0.8 ? (1 - prog) * 5 : 1;
    deerMat.opacity = Math.max(0, Math.min(1, opacity));
    trailMat.opacity = Math.max(0, Math.min(0.6, opacity * 0.6));
    light.intensity = Math.max(0, 3 * opacity);

    // Subtle gallop bob
    deer.position.y = Math.sin(elapsed * 0.015) * 0.3;

    // Trail follows
    const trailAttr = trailGeo.getAttribute('position');
    for (let i = 0; i < 50; i++) {
      trailAttr.setX(i, xPos - Math.random() * 3);
      trailAttr.setY(i, deer.position.y + (Math.random() - 0.5) * 1.5);
    }
    trailAttr.needsUpdate = true;

    if (elapsed > duration) {
      scene.remove(group);
      deerGeo.dispose(); deerMat.dispose();
      trailGeo.dispose(); trailMat.dispose();
      return true;
    }
    return false;
  };
}
