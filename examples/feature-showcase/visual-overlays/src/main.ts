/**
 * Visual Overlays Demo
 * 
 * Demonstrates 3Lens visual overlay features:
 * - Selection highlighting (cyan BoxHelper on click)
 * - Hover highlighting (blue BoxHelper on mouseover)
 * - Per-object wireframe toggle
 * - Per-object bounding box toggle
 * - Global wireframe mode
 * - Inspect mode for click-to-select
 * 
 * Open the 3Lens overlay (Ctrl+Shift+D) to use these features!
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
scene.name = 'VisualOverlaysDemo';

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(8, 6, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ─────────────────────────────────────────────────────────────────
// Create Scene Objects
// ─────────────────────────────────────────────────────────────────

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  roughness: 0.9,
  metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.name = 'Ground';
scene.add(ground);

// Create various objects with different materials
const objects: { geometry: THREE.BufferGeometry; material: THREE.Material; position: THREE.Vector3; name: string }[] = [
  {
    geometry: new THREE.BoxGeometry(1.5, 1.5, 1.5),
    material: new THREE.MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.3, metalness: 0.7 }),
    position: new THREE.Vector3(-3, 0.75, -2),
    name: 'Cyan Cube',
  },
  {
    geometry: new THREE.SphereGeometry(0.8, 32, 32),
    material: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.8 }),
    position: new THREE.Vector3(0, 0.8, -2),
    name: 'Red Sphere',
  },
  {
    geometry: new THREE.ConeGeometry(0.7, 1.4, 32),
    material: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5, metalness: 0.3 }),
    position: new THREE.Vector3(3, 0.7, -2),
    name: 'Green Cone',
  },
  {
    geometry: new THREE.TorusGeometry(0.6, 0.25, 16, 32),
    material: new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4, metalness: 0.6 }),
    position: new THREE.Vector3(-3, 0.85, 2),
    name: 'Gold Torus',
  },
  {
    geometry: new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32),
    material: new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3, metalness: 0.5 }),
    position: new THREE.Vector3(0, 0.75, 2),
    name: 'Purple Cylinder',
  },
  {
    geometry: new THREE.OctahedronGeometry(0.7),
    material: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.2, metalness: 0.9 }),
    position: new THREE.Vector3(3, 0.7, 2),
    name: 'Orange Octahedron',
  },
  {
    geometry: new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16),
    material: new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3, metalness: 0.7 }),
    position: new THREE.Vector3(0, 1, 0),
    name: 'Pink Torus Knot',
  }
];

objects.forEach(({ geometry, material, position, name }) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x22d3ee, 0.5, 20);
pointLight.position.set(-3, 3, 0);
scene.add(pointLight);

// Grid helper for visual reference
const gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x222222);
scene.add(gridHelper);

// ─────────────────────────────────────────────────────────────────
// Initialize 3Lens DevTools
// ─────────────────────────────────────────────────────────────────

const probe = createProbe({
  name: 'VisualOverlaysDemo',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

bootstrapOverlay({
  probe,
  position: 'right',
  defaultWidth: 350,
  defaultOpen: true,
});

// ─────────────────────────────────────────────────────────────────
// Animation Loop
// ─────────────────────────────────────────────────────────────────

function animate(): void {
  requestAnimationFrame(animate);
  
  // Gentle rotation for the center torus knot
  const torusKnot = scene.getObjectByName('Pink Torus Knot');
  if (torusKnot) {
    torusKnot.rotation.y += 0.005;
    torusKnot.rotation.x += 0.002;
  }
  
  controls.update();
  renderer.render(scene, camera);
}

// ─────────────────────────────────────────────────────────────────
// Window Resize
// ─────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─────────────────────────────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────────────────────────────

animate();

console.log(`
🎨 Visual Overlays Demo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This demo showcases 3Lens visual overlay features.

Open 3Lens DevTools (Ctrl+Shift+D) to use:

Scene Panel:
  • Click objects in the scene tree to select them
  • Selected objects show cyan highlight
  • Hover shows blue highlight

Toolbar Actions:
  • 🔲 Toggle wireframe on selected object
  • 📦 Toggle bounding box on selected object
  • 🌐 Toggle global wireframe mode
  • 🎯 Enable inspect mode (click-to-select in viewport)

Keyboard Shortcuts (when 3Lens is focused):
  • W - Toggle wireframe on selection
  • B - Toggle bounding box on selection
  • G - Toggle global wireframe
  • I - Toggle inspect mode
  • Esc - Clear selection

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
