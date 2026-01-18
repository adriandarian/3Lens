/**
 * 3Lens Large Scene Optimization Example
 * 
 * This example demonstrates various optimization techniques for large Three.js scenes.
 * Use the 3Lens overlay to monitor performance and compare different approaches.
 * 
 * Optimization techniques shown:
 * 1. GPU Instancing - Render thousands of identical objects with a single draw call
 * 2. Frustum Culling - Skip rendering objects outside the camera view
 * 3. Level of Detail (LOD) - Use simpler geometry for distant objects
 * 4. Merged Geometry - Combine static geometries to reduce draw calls
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// =============================================================================
// Scene Setup
// =============================================================================

const scene = new THREE.Scene();
scene.name = 'LargeOptimizedScene';
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 30, 50);
camera.lookAt(0, 0, 0);
camera.name = 'MainCamera';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('app')!.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// =============================================================================
// Lighting
// =============================================================================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 100, 50);
directionalLight.name = 'DirectionalLight';
scene.add(directionalLight);

// Ground plane
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
ground.name = 'Ground';
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(400, 100, 0x222222, 0x1a1a1a);
gridHelper.name = 'GridHelper';
scene.add(gridHelper);

// =============================================================================
// Create Demo Scene with Multiple Optimization Techniques
// =============================================================================

const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7];

// Section 1: Individual Meshes (least optimized - red/orange)
const individualGroup = new THREE.Group();
individualGroup.name = 'Individual_Meshes';
individualGroup.position.x = -80;

for (let i = 0; i < 200; i++) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.7 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * 60,
    Math.random() * 15 + 0.5,
    (Math.random() - 0.5) * 60
  );
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  mesh.scale.setScalar(0.5 + Math.random());
  mesh.name = `Individual_${i}`;
  individualGroup.add(mesh);
}
scene.add(individualGroup);

// Section 2: Instanced Mesh (highly optimized - green)
const instancedGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const instancedMaterial = new THREE.MeshStandardMaterial({ color: 0x4ecdc4, roughness: 0.5 });
const instancedMesh = new THREE.InstancedMesh(instancedGeometry, instancedMaterial, 1000);
instancedMesh.name = 'Instanced_Spheres';
instancedMesh.position.x = 0;

const dummy = new THREE.Object3D();
for (let i = 0; i < 1000; i++) {
  dummy.position.set(
    (Math.random() - 0.5) * 60,
    Math.random() * 15 + 0.5,
    (Math.random() - 0.5) * 60
  );
  dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  dummy.scale.setScalar(0.3 + Math.random() * 0.7);
  dummy.updateMatrix();
  instancedMesh.setMatrixAt(i, dummy.matrix);
}
instancedMesh.instanceMatrix.needsUpdate = true;
scene.add(instancedMesh);

// Section 3: LOD Objects (blue)
const lodGroup = new THREE.Group();
lodGroup.name = 'LOD_Objects';
lodGroup.position.x = 80;

for (let i = 0; i < 100; i++) {
  const lod = new THREE.LOD();
  
  // High detail
  const highGeo = new THREE.TorusKnotGeometry(0.4, 0.15, 64, 16);
  const highMat = new THREE.MeshStandardMaterial({ color: 0x45b7d1, roughness: 0.5 });
  lod.addLevel(new THREE.Mesh(highGeo, highMat), 0);
  
  // Medium detail
  const medGeo = new THREE.TorusKnotGeometry(0.4, 0.15, 32, 8);
  const medMat = new THREE.MeshStandardMaterial({ color: 0x45b7d1, roughness: 0.5 });
  lod.addLevel(new THREE.Mesh(medGeo, medMat), 20);
  
  // Low detail
  const lowGeo = new THREE.SphereGeometry(0.5, 8, 8);
  const lowMat = new THREE.MeshStandardMaterial({ color: 0x45b7d1, roughness: 0.5 });
  lod.addLevel(new THREE.Mesh(lowGeo, lowMat), 50);
  
  lod.position.set(
    (Math.random() - 0.5) * 60,
    Math.random() * 15 + 0.5,
    (Math.random() - 0.5) * 60
  );
  lod.name = `LOD_${i}`;
  lodGroup.add(lod);
}
scene.add(lodGroup);

// =============================================================================
// 3Lens Integration
// =============================================================================

const probe = createProbe({
  name: 'LargeSceneOptimizationProbe',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setAppName('Large Scene Optimization');

// Register optimization comparison as logical entity
probe.registerLogicalEntity('optimization-demo', 'Optimization Demo', {
  category: 'Performance',
  sections: {
    individual: { count: 200, technique: 'Individual Meshes', color: 'Red' },
    instanced: { count: 1000, technique: 'GPU Instancing', color: 'Cyan' },
    lod: { count: 100, technique: 'Level of Detail', color: 'Blue' },
  },
  description: 'Compare draw calls and frame time across different optimization techniques',
});

createOverlay({ probe, theme: 'dark' });

// =============================================================================
// Animation Loop
// =============================================================================

function animate() {
  requestAnimationFrame(animate);
  
  controls.update();
  
  // Update LOD objects based on camera distance
  lodGroup.traverse((child) => {
    if (child instanceof THREE.LOD) {
      child.update(camera);
    }
  });
  
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

console.log(`
⚡ Large Scene Optimization Example
===================================
This example shows three optimization techniques side by side:

LEFT (Red): 200 individual meshes - Many draw calls
CENTER (Cyan): 1000 instanced spheres - Single draw call  
RIGHT (Blue): 100 LOD objects - Adaptive detail

Open the 3Lens overlay to:
- Monitor draw calls in Performance panel
- See how instancing dramatically reduces GPU overhead
- Observe LOD switching as you zoom in/out
- Compare scene graph structure differences
`);
