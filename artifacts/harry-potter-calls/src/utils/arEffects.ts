import * as THREE from 'three';

export function createLumos(scene: THREE.Scene, position: THREE.Vector3) {
  const geometry = new THREE.SphereGeometry(0.5, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.8 });
  const sphere = new THREE.Mesh(geometry, material);
  
  const light = new THREE.PointLight(0xFFD700, 2, 10);
  
  const group = new THREE.Group();
  group.position.copy(position);
  group.add(sphere);
  group.add(light);
  
  scene.add(group);
  
  const startTime = Date.now();
  
  return (time: number) => {
    const elapsed = time - startTime;
    material.opacity = Math.max(0, 0.8 - elapsed / 1500);
    light.intensity = Math.max(0, 2 - (elapsed / 1500) * 2);
    
    if (elapsed > 1500) {
      scene.remove(group);
      geometry.dispose();
      material.dispose();
      return true; // remove
    }
    return false; // keep
  };
}

export function createIncendio(scene: THREE.Scene, position: THREE.Vector3) {
  const particleCount = 100;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    
    velocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5 + 2,
      (Math.random() - 0.5) * 5
    ));
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: 0xFF4500,
    size: 0.2,
    transparent: true,
    opacity: 1
  });
  
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  
  const startTime = Date.now();
  
  return (time: number) => {
    const elapsed = time - startTime;
    const dt = 0.016;
    
    const posAttribute = geometry.getAttribute('position');
    for (let i = 0; i < particleCount; i++) {
      const v = velocities[i];
      v.y -= 5 * dt; // gravity
      
      posAttribute.setXYZ(
        i,
        posAttribute.getX(i) + v.x * dt,
        posAttribute.getY(i) + v.y * dt,
        posAttribute.getZ(i) + v.z * dt
      );
    }
    posAttribute.needsUpdate = true;
    
    material.opacity = Math.max(0, 1 - elapsed / 1500);
    
    if (elapsed > 1500) {
      scene.remove(particles);
      geometry.dispose();
      material.dispose();
      return true;
    }
    return false;
  };
}

export function createExpelliarmus(scene: THREE.Scene, position: THREE.Vector3) {
  const points = [];
  let curr = position.clone();
  points.push(curr.clone());
  
  for (let i = 0; i < 5; i++) {
    curr.add(new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), -2));
    points.push(curr.clone());
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x4169E1, linewidth: 2, transparent: true, opacity: 1 });
  const line = new THREE.Line(geometry, material);
  
  scene.add(line);
  
  const startTime = Date.now();
  
  return (time: number) => {
    const elapsed = time - startTime;
    material.opacity = Math.max(0, 1 - elapsed / 500);
    
    if (elapsed > 500) {
      scene.remove(line);
      geometry.dispose();
      material.dispose();
      return true;
    }
    return false;
  };
}

export function createWingardium(scene: THREE.Scene, position: THREE.Vector3) {
  const geometry = new THREE.PlaneGeometry(0.2, 0.5);
  const material = new THREE.MeshBasicMaterial({ color: 0x32CD32, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
  const feather = new THREE.Mesh(geometry, material);
  
  feather.position.copy(position);
  scene.add(feather);
  
  const startTime = Date.now();
  
  return (time: number) => {
    const elapsed = time - startTime;
    
    feather.position.y += Math.sin(elapsed * 0.01) * 0.02;
    feather.rotation.y += 0.1;
    feather.rotation.z = Math.sin(elapsed * 0.005) * 0.5;
    
    material.opacity = Math.max(0, 0.8 - elapsed / 2000);
    
    if (elapsed > 2000) {
      scene.remove(feather);
      geometry.dispose();
      material.dispose();
      return true;
    }
    return false;
  };
}
