/**
 * Camera Controls Showcase Example
 * 
 * Demonstrates 3Lens camera control features:
 * - Focus on object (instant)
 * - Fly-to animation with easing options
 * - Camera switching between multiple cameras
 * - Camera info display
 * - Home position management
 * 
 * Open the 3Lens overlay (Ctrl+Shift+D) to use the camera controls!
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ─────────────────────────────────────────────────────────────────
// Scene Setup
// ─────────────────────────────────────────────────────────────────

const container = document.getElementById('app')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.name = 'CameraControlsDemo';

// Main camera
const mainCamera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
mainCamera.position.set(15, 12, 15);
mainCamera.name = 'Main Camera';

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(mainCamera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);

// ─────────────────────────────────────────────────────────────────
// Lighting
// ─────────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(20, 30, 20);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// ─────────────────────────────────────────────────────────────────
// Scene Objects
// ─────────────────────────────────────────────────────────────────

// Ground
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x16213e,
  roughness: 0.9,
  metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.name = 'Ground';
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(50, 50, 0x0f3460, 0x0f3460);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Demo objects
const objectConfigs = [
  { name: 'Red Cube', geo: new THREE.BoxGeometry(2, 2, 2), color: 0xe94560, pos: [-8, 1, -8] },
  { name: 'Blue Sphere', geo: new THREE.SphereGeometry(1.2, 32, 32), color: 0x3b82f6, pos: [8, 1.2, -8] },
  { name: 'Green Torus', geo: new THREE.TorusGeometry(1, 0.4, 16, 48), color: 0x10b981, pos: [-8, 1, 8] },
  { name: 'Yellow Cone', geo: new THREE.ConeGeometry(1, 2.5, 32), color: 0xf59e0b, pos: [8, 1.25, 8] },
  { name: 'Purple Knot', geo: new THREE.TorusKnotGeometry(0.8, 0.25, 100, 16), color: 0x8b5cf6, pos: [0, 1.5, 0] },
  { name: 'Cyan Cylinder', geo: new THREE.CylinderGeometry(0.8, 0.8, 3, 32), color: 0x00d4ff, pos: [0, 1.5, -10] },
];

const sceneObjects: THREE.Mesh[] = [];

objectConfigs.forEach((config) => {
  const material = new THREE.MeshStandardMaterial({
    color: config.color,
    roughness: 0.3,
    metalness: 0.7
  });
  
  const mesh = new THREE.Mesh(config.geo, material);
  mesh.name = config.name;
  mesh.position.set(config.pos[0], config.pos[1], config.pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  scene.add(mesh);
  sceneObjects.push(mesh);
});

// ─────────────────────────────────────────────────────────────────
// Additional Cameras
// ─────────────────────────────────────────────────────────────────

// Top-down camera
const topCamera = new THREE.PerspectiveCamera(60, 16/9, 0.1, 1000);
topCamera.position.set(0, 30, 0);
topCamera.lookAt(0, 0, 0);
topCamera.name = 'Top View Camera';
scene.add(topCamera);

// Side camera
const sideCamera = new THREE.PerspectiveCamera(50, 16/9, 0.1, 1000);
sideCamera.position.set(25, 5, 0);
sideCamera.lookAt(0, 0, 0);
sideCamera.name = 'Side View Camera';
scene.add(sideCamera);

// Close-up camera
const closeCamera = new THREE.PerspectiveCamera(35, 16/9, 0.1, 500);
closeCamera.position.set(5, 3, 5);
closeCamera.lookAt(0, 1, 0);
closeCamera.name = 'Close-up Camera';
scene.add(closeCamera);

// Orthographic camera
const aspect = 16/9;
const frustumSize = 20;
const orthoCamera = new THREE.OrthographicCamera(
  -frustumSize * aspect / 2,
  frustumSize * aspect / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  1000
);
orthoCamera.position.set(20, 20, 20);
orthoCamera.lookAt(0, 0, 0);
orthoCamera.name = 'Orthographic Camera';
scene.add(orthoCamera);

// ─────────────────────────────────────────────────────────────────
// 3Lens DevTools Setup
// ─────────────────────────────────────────────────────────────────

const probe = createProbe({
  name: 'CameraControlsDemo',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

// Register cameras as logical entities
probe.registerLogicalEntity('cameras', {
  name: 'Scene Cameras',
  type: 'camera-system',
  metadata: {
    mainCamera: mainCamera.name,
    additionalCameras: [topCamera.name, sideCamera.name, closeCamera.name, orthoCamera.name],
  },
});

bootstrapOverlay({
  probe,
  position: 'right',
  defaultWidth: 380,
  defaultOpen: true,
});

// ─────────────────────────────────────────────────────────────────
// Console Controls
// ─────────────────────────────────────────────────────────────────

// Expose camera control functions for console testing
(window as any).cameraDemo = {
  // Focus on an object by name
  focusOn: (objectName: string) => {
    const obj = scene.getObjectByName(objectName);
    if (obj) {
      // Calculate bounding box
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 2;
      
      // Move camera
      mainCamera.position.set(
        center.x + distance,
        center.y + distance * 0.5,
        center.z + distance
      );
      controls.target.copy(center);
      
      console.log(`Focused on ${objectName}`);
    } else {
      console.log(`Object "${objectName}" not found`);
    }
  },
  
  // Fly to an object with animation
  flyTo: (objectName: string, duration = 1000) => {
    const obj = scene.getObjectByName(objectName);
    if (!obj) {
      console.log(`Object "${objectName}" not found`);
      return;
    }
    
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;
    
    const targetPos = new THREE.Vector3(
      center.x + distance,
      center.y + distance * 0.5,
      center.z + distance
    );
    
    const startPos = mainCamera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();
    
    function animate() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // Ease out cubic
      
      mainCamera.position.lerpVectors(startPos, targetPos, eased);
      controls.target.lerpVectors(startTarget, center, eased);
      
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        console.log(`Flew to ${objectName}`);
      }
    }
    
    animate();
  },
  
  // Go to home position
  goHome: () => {
    mainCamera.position.set(15, 12, 15);
    controls.target.set(0, 0, 0);
    console.log('Returned to home position');
  },
  
  // List available objects
  listObjects: () => {
    console.log('Available objects:');
    sceneObjects.forEach(obj => console.log(`  - ${obj.name}`));
  },
  
  // List available cameras
  listCameras: () => {
    console.log('Available cameras:');
    console.log(`  - ${mainCamera.name} (active)`);
    console.log(`  - ${topCamera.name}`);
    console.log(`  - ${sideCamera.name}`);
    console.log(`  - ${closeCamera.name}`);
    console.log(`  - ${orthoCamera.name}`);
  },
};

// ─────────────────────────────────────────────────────────────────
// Animation Loop
// ─────────────────────────────────────────────────────────────────

function animate(): void {
  requestAnimationFrame(animate);
  
  // Update orbit controls
  controls.update();
  
  // Animate objects
  const time = performance.now() * 0.001;
  sceneObjects.forEach((obj, i) => {
    obj.rotation.y = time * 0.5 * (1 + i * 0.1);
  });
  
  renderer.render(scene, mainCamera);
}

// ─────────────────────────────────────────────────────────────────
// Window Resize
// ─────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  mainCamera.aspect = container.clientWidth / container.clientHeight;
  mainCamera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// ─────────────────────────────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────────────────────────────

animate();

console.log(`
📷 Camera Controls Showcase
═══════════════════════════════════════

Open 3Lens DevTools (Ctrl+Shift+D) to use camera features:

Scene Panel:
  • Select objects to focus on them
  • Use the camera toolbar for fly-to animations

Camera Panel (if available):
  • Switch between different cameras
  • Adjust camera properties
  • Set home position

Console commands:
  cameraDemo.focusOn('Red Cube')     - Focus on object
  cameraDemo.flyTo('Blue Sphere')    - Fly to object
  cameraDemo.goHome()                - Return to home
  cameraDemo.listObjects()           - List all objects
  cameraDemo.listCameras()           - List all cameras

═══════════════════════════════════════
`);
