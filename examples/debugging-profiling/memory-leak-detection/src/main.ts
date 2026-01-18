/**
 * 3Lens Memory Leak Detection Example
 * 
 * This example demonstrates common memory leak patterns in Three.js
 * and how to use 3Lens to detect and diagnose them.
 * 
 * Use the 3Lens overlay to:
 * - Monitor resource counts in the Memory panel
 * - Track geometry, material, and texture allocations
 * - Identify orphaned resources
 * - See leak alerts in real-time
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
scene.name = 'LeakDetectionScene';
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 15, 25);
camera.lookAt(0, 0, 0);
camera.name = 'MainCamera';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.getElementById('app')!.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// =============================================================================
// Basic Scene Objects
// =============================================================================

// Ground plane
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.name = 'Ground';
scene.add(ground);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.name = 'DirectionalLight';
scene.add(directionalLight);

// Grid helper
const gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x222222);
gridHelper.name = 'GridHelper';
scene.add(gridHelper);

// =============================================================================
// Leak Simulation - Creates objects that demonstrate leak patterns
// =============================================================================

interface LeakTracker {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
  meshes: THREE.Mesh[];
}

const leakTracker: LeakTracker = {
  geometries: [],
  materials: [],
  textures: [],
  meshes: [],
};

// Create leaky objects periodically to demonstrate leak detection
let leakInterval: number | null = null;

function createLeakyObject() {
  const geometryTypes = [
    () => new THREE.BoxGeometry(1 + Math.random(), 1 + Math.random(), 1 + Math.random()),
    () => new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 32, 32),
    () => new THREE.TorusGeometry(0.5, 0.2, 16, 48),
    () => new THREE.ConeGeometry(0.5, 1, 32),
  ];

  const geometry = geometryTypes[Math.floor(Math.random() * geometryTypes.length)]();
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
    metalness: 0.3,
    roughness: 0.7,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * 20,
    0.5 + Math.random() * 3,
    (Math.random() - 0.5) * 20
  );
  mesh.castShadow = true;
  mesh.name = `LeakyMesh_${leakTracker.meshes.length}`;

  scene.add(mesh);
  
  leakTracker.geometries.push(geometry);
  leakTracker.materials.push(material);
  leakTracker.meshes.push(mesh);

  // Simulate a leak: Remove mesh from scene but don't dispose resources
  setTimeout(() => {
    if (mesh.parent === scene) {
      scene.remove(mesh);
      // NOT calling geometry.dispose() or material.dispose() - this is the leak!
    }
  }, 2000 + Math.random() * 3000);
}

function startLeakSimulation() {
  if (leakInterval) return;
  leakInterval = window.setInterval(createLeakyObject, 500);
  console.log('🔴 Leak simulation started - watch the Memory panel in 3Lens');
}

function stopLeakSimulation() {
  if (leakInterval) {
    clearInterval(leakInterval);
    leakInterval = null;
    console.log('⏹️ Leak simulation stopped');
  }
}

function cleanupLeaks() {
  // Properly dispose all tracked resources
  for (const geometry of leakTracker.geometries) {
    geometry.dispose();
  }
  for (const material of leakTracker.materials) {
    material.dispose();
  }
  for (const texture of leakTracker.textures) {
    texture.dispose();
  }
  for (const mesh of leakTracker.meshes) {
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
  }
  
  leakTracker.geometries = [];
  leakTracker.materials = [];
  leakTracker.textures = [];
  leakTracker.meshes = [];
  
  console.log('✅ All leaks cleaned up');
}

// Start leak simulation automatically for demo purposes
setTimeout(() => {
  startLeakSimulation();
}, 1000);

// =============================================================================
// 3Lens Integration
// =============================================================================

const probe = createProbe({
  name: 'MemoryLeakDetectionProbe',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setAppName('Memory Leak Detection');

// Register leak tracker as logical entity
probe.registerLogicalEntity('leak-tracker', 'Leak Tracker', {
  category: 'Memory',
  getLeakedGeometries: () => leakTracker.geometries.length,
  getLeakedMaterials: () => leakTracker.materials.length,
  getLeakedTextures: () => leakTracker.textures.length,
  getLeakedMeshes: () => leakTracker.meshes.length,
  isSimulationRunning: () => leakInterval !== null,
});

// Subscribe to leak alerts
probe.onLeakAlert?.((alert: { resourceType: string; severity: string; message: string }) => {
  console.log(`🚨 3Lens detected leak: ${alert.resourceType} - ${alert.message}`);
});

createOverlay({ probe, theme: 'dark' });

// =============================================================================
// Animation Loop
// =============================================================================

function animate() {
  requestAnimationFrame(animate);
  
  controls.update();
  
  // Rotate leaked meshes for visual interest
  for (const mesh of leakTracker.meshes) {
    if (mesh.parent === scene) {
      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.01;
    }
  }
  
  // Update logical entity with current stats
  probe.updateLogicalEntity('leak-tracker', {
    geometryCount: leakTracker.geometries.length,
    materialCount: leakTracker.materials.length,
    meshCount: leakTracker.meshes.filter(m => m.parent === scene).length,
    orphanedCount: leakTracker.meshes.filter(m => m.parent !== scene).length,
  });
  
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Keyboard controls for demo
window.addEventListener('keydown', (e) => {
  if (e.key === 's') {
    if (leakInterval) {
      stopLeakSimulation();
    } else {
      startLeakSimulation();
    }
  } else if (e.key === 'c') {
    cleanupLeaks();
  }
});

animate();

console.log(`
🔴 Memory Leak Detection Example
================================
This example simulates memory leaks for demonstration.

Open the 3Lens overlay to:
- Monitor resource counts in Memory panel
- Watch geometry/material counts grow
- See leak alerts when orphaned resources are detected
- Track resource lifecycle

Keyboard Controls:
- S: Start/Stop leak simulation
- C: Cleanup all leaked resources
`);
