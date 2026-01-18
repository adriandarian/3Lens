import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

/**
 * Texture Optimization Example
 *
 * This example demonstrates different texture optimization strategies.
 * Use the 3Lens overlay to:
 * - Monitor texture memory in the Memory panel
 * - Inspect texture properties in the Textures panel
 * - Compare memory usage across different scenarios
 */

// =============================================================================
// Scene Setup
// =============================================================================

const scene = new THREE.Scene();
scene.name = 'TextureOptimizationScene';
scene.background = new THREE.Color(0x0d1117);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(8, 6, 12);
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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.name = 'DirectionalLight';
scene.add(directionalLight);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
ground.name = 'Ground';
scene.add(ground);

// =============================================================================
// Texture Generation Utilities
// =============================================================================

function createProceduralTexture(size: number, pattern: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  switch (pattern) {
    case 'checkerboard': {
      const checkSize = size / 8;
      for (let x = 0; x < size; x += checkSize) {
        for (let y = 0; y < size; y += checkSize) {
          ctx.fillStyle = ((x / checkSize + y / checkSize) % 2 === 0) ? '#ffffff' : '#888888';
          ctx.fillRect(x, y, checkSize, checkSize);
        }
      }
      break;
    }
    case 'gradient': {
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#ff6b6b');
      gradient.addColorStop(0.5, '#4ecdc4');
      gradient.addColorStop(1, '#45b7d1');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      break;
    }
    case 'noise': {
      const imageData = ctx.createImageData(size, size);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 255;
        imageData.data[i] = v;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      break;
    }
    case 'circles': {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 50 + 10, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
        ctx.fill();
      }
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// =============================================================================
// Create Demo Scenes Showing Different Texture Sizes
// =============================================================================

const texturesGroup = new THREE.Group();
texturesGroup.name = 'TextureComparison';
scene.add(texturesGroup);

// Section 1: Oversized Textures (4096x4096) - RED warning
const oversizedGroup = new THREE.Group();
oversizedGroup.name = 'Oversized_4096';
oversizedGroup.position.x = -6;

for (let i = 0; i < 3; i++) {
  const texture = createProceduralTexture(4096, ['checkerboard', 'gradient', 'noise'][i]);
  texture.name = `Oversized_${4096}x${4096}_${i}`;
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), material);
  mesh.position.set(0, i * 2, 0);
  mesh.name = `OversizedCube_${i}`;
  oversizedGroup.add(mesh);
}
texturesGroup.add(oversizedGroup);

// Section 2: Appropriate Size (512x512) - GREEN optimal
const appropriateGroup = new THREE.Group();
appropriateGroup.name = 'Appropriate_512';
appropriateGroup.position.x = -2;

for (let i = 0; i < 3; i++) {
  const texture = createProceduralTexture(512, ['checkerboard', 'gradient', 'noise'][i]);
  texture.name = `Appropriate_${512}x${512}_${i}`;
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), material);
  mesh.position.set(0, i * 2, 0);
  mesh.name = `AppropriateCube_${i}`;
  appropriateGroup.add(mesh);
}
texturesGroup.add(appropriateGroup);

// Section 3: Small Textures (128x128) - BLUE minimal
const smallGroup = new THREE.Group();
smallGroup.name = 'Small_128';
smallGroup.position.x = 2;

for (let i = 0; i < 3; i++) {
  const texture = createProceduralTexture(128, ['checkerboard', 'gradient', 'noise'][i]);
  texture.name = `Small_${128}x${128}_${i}`;
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), material);
  mesh.position.set(0, i * 2, 0);
  mesh.name = `SmallCube_${i}`;
  smallGroup.add(mesh);
}
texturesGroup.add(smallGroup);

// Section 4: No Textures (solid color) - Reference
const solidGroup = new THREE.Group();
solidGroup.name = 'SolidColor_NoTexture';
solidGroup.position.x = 6;

const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1];
for (let i = 0; i < 3; i++) {
  const material = new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.5 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), material);
  mesh.position.set(0, i * 2, 0);
  mesh.name = `SolidCube_${i}`;
  solidGroup.add(mesh);
}
texturesGroup.add(solidGroup);

// =============================================================================
// 3Lens Integration
// =============================================================================

const probe = createProbe({
  name: 'TextureOptimizationProbe',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setAppName('Texture Optimization');

// Register texture comparison as logical entity
probe.registerLogicalEntity('texture-comparison', 'Texture Comparison', {
  category: 'Memory',
  sections: {
    oversized: { size: '4096x4096', count: 3, estimatedMemory: '192 MB' },
    appropriate: { size: '512x512', count: 3, estimatedMemory: '3 MB' },
    small: { size: '128x128', count: 3, estimatedMemory: '0.2 MB' },
    solid: { size: 'No texture', count: 3, estimatedMemory: '0 MB' },
  },
  description: 'Compare GPU memory usage across texture sizes',
});

createOverlay({ probe, theme: 'dark' });

// =============================================================================
// Animation Loop
// =============================================================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const elapsed = clock.getElapsedTime();
  
  // Rotate all cubes
  texturesGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.rotation.y = elapsed * 0.3;
    }
  });
  
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

console.log(`
🖼️ Texture Optimization Example
================================
This example shows 4 texture size strategies:

LEFT: Oversized (4096²) - ~192 MB GPU memory
CENTER-LEFT: Appropriate (512²) - ~3 MB GPU memory
CENTER-RIGHT: Small (128²) - ~0.2 MB GPU memory
RIGHT: No textures - 0 MB texture memory

Open the 3Lens overlay to:
- View texture memory in Memory panel
- Inspect individual textures in Textures panel
- Compare memory usage across groups
`);
