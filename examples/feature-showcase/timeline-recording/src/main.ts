/**
 * Timeline Recording Demo
 * 
 * Demonstrates 3Lens performance timeline features:
 * - Real-time frame time visualization
 * - CPU/GPU time breakdown
 * - Spike detection and highlighting
 * - Frame recording for later analysis
 * - Zoom/pan through history
 * - Frame selection with detailed stats
 * 
 * Open the 3Lens overlay (F9) and go to Performance → Timeline to see the features!
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ─────────────────────────────────────────────────────────────────
// Scene Setup
// ─────────────────────────────────────────────────────────────────

const app = document.getElementById('app')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.name = 'TimelineRecordingDemo';

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(20, 15, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ─────────────────────────────────────────────────────────────────
// Lighting
// ─────────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(15, 25, 15);
directionalLight.castShadow = false;
directionalLight.shadow.mapSize.width = 512;
directionalLight.shadow.mapSize.height = 512;
scene.add(directionalLight);

// ─────────────────────────────────────────────────────────────────
// Dynamic Objects
// ─────────────────────────────────────────────────────────────────

const dynamicObjects: THREE.Mesh[] = [];
const objectGroup = new THREE.Group();
objectGroup.name = 'DynamicObjects';
scene.add(objectGroup);

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  roughness: 0.9,
  metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
ground.name = 'Ground';
scene.add(ground);

// Geometries for different complexity levels
const geometries = {
  low: new THREE.BoxGeometry(0.5, 0.5, 0.5),
  medium: new THREE.SphereGeometry(0.3, 16, 16),
  high: new THREE.TorusKnotGeometry(0.2, 0.08, 64, 16)
};

// Materials
const materials: THREE.MeshStandardMaterial[] = [];
for (let i = 0; i < 10; i++) {
  materials.push(new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(i * 0.1, 0.8, 0.5),
    roughness: 0.3 + Math.random() * 0.5,
    metalness: 0.2 + Math.random() * 0.6
  }));
}

// Configuration
let objectCount = 100;
let animationComplexity: 1 | 2 | 3 = 1;
let shadowQuality: 0 | 1 | 2 | 3 = 0;

function createObjects(count: number) {
  // Clear existing
  while (objectGroup.children.length > 0) {
    const child = objectGroup.children[0];
    objectGroup.remove(child);
    if (child instanceof THREE.Mesh) {
      dynamicObjects.splice(dynamicObjects.indexOf(child), 1);
    }
  }
  dynamicObjects.length = 0;

  // Determine geometry based on animation complexity
  let geometry: THREE.BufferGeometry;
  switch (animationComplexity) {
    case 3:
      geometry = geometries.high;
      break;
    case 2:
      geometry = geometries.medium;
      break;
    default:
      geometry = geometries.low;
  }

  // Create new objects in a grid pattern
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = 25 / gridSize;

  for (let i = 0; i < count; i++) {
    const material = materials[i % materials.length];
    const mesh = new THREE.Mesh(geometry, material);
    
    const x = (i % gridSize) * spacing - (gridSize * spacing) / 2 + spacing / 2;
    const z = Math.floor(i / gridSize) * spacing - (gridSize * spacing) / 2 + spacing / 2;
    const y = 0.5 + Math.random() * 2;
    
    mesh.position.set(x, y, z);
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    mesh.castShadow = shadowQuality > 0;
    mesh.receiveShadow = shadowQuality > 1;
    mesh.name = `Object_${i}`;
    
    // Store animation data
    mesh.userData.rotationSpeed = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 2
    };
    mesh.userData.floatSpeed = Math.random() * 2 + 1;
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    mesh.userData.baseY = y;

    dynamicObjects.push(mesh);
    objectGroup.add(mesh);
  }
}

function updateShadowQuality(quality: number) {
  renderer.shadowMap.enabled = quality > 0;
  directionalLight.castShadow = quality > 0;
  
  switch (quality) {
    case 1:
      directionalLight.shadow.mapSize.width = 512;
      directionalLight.shadow.mapSize.height = 512;
      break;
    case 2:
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      break;
    case 3:
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      break;
  }

  // Update all objects
  dynamicObjects.forEach(obj => {
    obj.castShadow = quality > 0;
    obj.receiveShadow = quality > 1;
  });
  ground.receiveShadow = quality > 0;
}

// ─────────────────────────────────────────────────────────────────
// 3Lens DevTools Setup
// ─────────────────────────────────────────────────────────────────

const probe = createProbe({
  name: 'TimelineRecordingDemo',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
    enableGPUTiming: true,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

// Register logical entity for the simulation configuration
probe.registerLogicalEntity('simulation-config', {
  name: 'Simulation Configuration',
  type: 'config',
  metadata: {
    objectCount,
    animationComplexity,
    shadowQuality,
  },
});

bootstrapOverlay({
  probe,
  position: 'right',
  defaultWidth: 400,
  defaultOpen: true,
});

// ─────────────────────────────────────────────────────────────────
// Simulation Control Functions (exposed for testing)
// ─────────────────────────────────────────────────────────────────

// These functions can be called from the browser console to test different scenarios
(window as any).timelineDemo = {
  // Set object count (10-2000)
  setObjectCount: (count: number) => {
    objectCount = Math.max(10, Math.min(2000, count));
    createObjects(objectCount);
    probe.updateLogicalEntity('simulation-config', {
      metadata: { objectCount, animationComplexity, shadowQuality }
    });
    console.log(`Object count set to ${objectCount}`);
  },
  
  // Set animation complexity (1=low, 2=medium, 3=high)
  setComplexity: (level: 1 | 2 | 3) => {
    animationComplexity = level;
    createObjects(objectCount);
    probe.updateLogicalEntity('simulation-config', {
      metadata: { objectCount, animationComplexity, shadowQuality }
    });
    console.log(`Animation complexity set to ${['Low', 'Medium', 'High'][level - 1]}`);
  },
  
  // Set shadow quality (0=off, 1=low, 2=medium, 3=high)
  setShadows: (quality: 0 | 1 | 2 | 3) => {
    shadowQuality = quality;
    updateShadowQuality(quality);
    probe.updateLogicalEntity('simulation-config', {
      metadata: { objectCount, animationComplexity, shadowQuality }
    });
    console.log(`Shadow quality set to ${['Off', 'Low', 'Medium', 'High'][quality]}`);
  },
  
  // Trigger a frame spike (50-150ms)
  triggerSpike: () => {
    const startTime = performance.now();
    const targetDuration = 50 + Math.random() * 100;
    while (performance.now() - startTime < targetDuration) {
      Math.random() * Math.random();
    }
    console.log(`Triggered ${targetDuration.toFixed(0)}ms spike`);
  },
  
  // Apply preset scenarios
  applyScenario: (name: 'smooth' | 'heavy' | 'spikes' | 'gc') => {
    switch (name) {
      case 'smooth':
        (window as any).timelineDemo.setObjectCount(50);
        (window as any).timelineDemo.setComplexity(1);
        (window as any).timelineDemo.setShadows(0);
        break;
      case 'heavy':
        (window as any).timelineDemo.setObjectCount(1000);
        (window as any).timelineDemo.setComplexity(3);
        (window as any).timelineDemo.setShadows(2);
        break;
      case 'spikes':
        (window as any).timelineDemo.setObjectCount(200);
        (window as any).timelineDemo.setComplexity(2);
        (window as any).timelineDemo.setShadows(1);
        // Start random spikes
        setInterval(() => (window as any).timelineDemo.triggerSpike(), 500 + Math.random() * 1500);
        break;
      case 'gc':
        (window as any).timelineDemo.setObjectCount(300);
        (window as any).timelineDemo.setComplexity(1);
        (window as any).timelineDemo.setShadows(0);
        // Start GC pressure
        const arrays: Float32Array[] = [];
        setInterval(() => {
          for (let i = 0; i < 10; i++) arrays.push(new Float32Array(10000));
          while (arrays.length > 50) arrays.shift();
        }, 200);
        break;
    }
    console.log(`Applied '${name}' scenario`);
  },
  
  // Reset to defaults
  reset: () => {
    (window as any).timelineDemo.setObjectCount(100);
    (window as any).timelineDemo.setComplexity(1);
    (window as any).timelineDemo.setShadows(0);
    console.log('Reset to defaults');
  }
};

// ─────────────────────────────────────────────────────────────────
// Animation Loop
// ─────────────────────────────────────────────────────────────────

let time = 0;
let lastFrameTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  
  const now = performance.now();
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  
  time += delta * 0.001;
  
  // Animate objects based on complexity
  dynamicObjects.forEach((obj) => {
    const { rotationSpeed, floatSpeed, floatOffset, baseY } = obj.userData;
    
    // Rotation (always)
    obj.rotation.x += rotationSpeed.x * delta * 0.001;
    obj.rotation.y += rotationSpeed.y * delta * 0.001;
    obj.rotation.z += rotationSpeed.z * delta * 0.001;
    
    // Floating animation (medium+ complexity)
    if (animationComplexity >= 2) {
      obj.position.y = baseY + Math.sin(time * floatSpeed + floatOffset) * 0.5;
    }
    
    // Position oscillation (high complexity)
    if (animationComplexity >= 3) {
      const originalX = obj.position.x;
      const originalZ = obj.position.z;
      obj.position.x = originalX + Math.sin(time * 2 + floatOffset) * 0.1;
      obj.position.z = originalZ + Math.cos(time * 2 + floatOffset) * 0.1;
    }
  });
  
  controls.update();
  renderer.render(scene, camera);
}

// ─────────────────────────────────────────────────────────────────
// Resize Handler
// ─────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─────────────────────────────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────────────────────────────

createObjects(objectCount);
animate();

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   Timeline Recording Demo                      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  This demo showcases 3Lens performance timeline features.     ║
║                                                               ║
║  Open 3Lens DevTools:                                         ║
║  • Press Ctrl+Shift+D or F9                                   ║
║  • Go to Performance → Timeline tab                           ║
║  • Click "Start Recording" to capture frame history           ║
║                                                               ║
║  Console commands to test different scenarios:                ║
║                                                               ║
║  timelineDemo.setObjectCount(500)  - Change object count      ║
║  timelineDemo.setComplexity(3)     - 1=low, 2=med, 3=high     ║
║  timelineDemo.setShadows(2)        - 0=off to 3=high          ║
║  timelineDemo.triggerSpike()       - Create a frame spike     ║
║  timelineDemo.applyScenario('heavy') - Apply preset           ║
║  timelineDemo.reset()              - Reset to defaults        ║
║                                                               ║
║  Available scenarios: 'smooth', 'heavy', 'spikes', 'gc'       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
