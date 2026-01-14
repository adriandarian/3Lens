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
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DevtoolProbe } from '@3lens/core';
import { ThreeLensOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ─────────────────────────────────────────────────────────────────
// Scene Setup
// ─────────────────────────────────────────────────────────────────

const app = document.getElementById('app')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

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

interface SceneObject {
  mesh: THREE.Mesh;
  name: string;
  type: string;
}

const sceneObjects: SceneObject[] = [];

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
sceneObjects.push({ mesh: ground, name: 'Ground', type: 'Plane' });

// Create various objects with different materials
const objects: { geometry: THREE.BufferGeometry; material: THREE.Material; position: THREE.Vector3; name: string; type: string }[] = [
  {
    geometry: new THREE.BoxGeometry(1.5, 1.5, 1.5),
    material: new THREE.MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.3, metalness: 0.7 }),
    position: new THREE.Vector3(-3, 0.75, -2),
    name: 'Cyan Cube',
    type: 'Box'
  },
  {
    geometry: new THREE.SphereGeometry(0.8, 32, 32),
    material: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.8 }),
    position: new THREE.Vector3(0, 0.8, -2),
    name: 'Red Sphere',
    type: 'Sphere'
  },
  {
    geometry: new THREE.ConeGeometry(0.7, 1.4, 32),
    material: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5, metalness: 0.3 }),
    position: new THREE.Vector3(3, 0.7, -2),
    name: 'Green Cone',
    type: 'Cone'
  },
  {
    geometry: new THREE.TorusGeometry(0.6, 0.25, 16, 32),
    material: new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4, metalness: 0.6 }),
    position: new THREE.Vector3(-3, 0.85, 2),
    name: 'Gold Torus',
    type: 'Torus'
  },
  {
    geometry: new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32),
    material: new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3, metalness: 0.5 }),
    position: new THREE.Vector3(0, 0.75, 2),
    name: 'Purple Cylinder',
    type: 'Cylinder'
  },
  {
    geometry: new THREE.OctahedronGeometry(0.7),
    material: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.2, metalness: 0.9 }),
    position: new THREE.Vector3(3, 0.7, 2),
    name: 'Orange Octahedron',
    type: 'Octahedron'
  },
  {
    geometry: new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16),
    material: new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3, metalness: 0.7 }),
    position: new THREE.Vector3(0, 1, 0),
    name: 'Pink Torus Knot',
    type: 'TorusKnot'
  }
];

objects.forEach(({ geometry, material, position, name, type }) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  sceneObjects.push({ mesh, name, type });
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

const probe = new DevtoolProbe({
  appName: 'Visual Overlays Demo',
  enabled: true,
  logLevel: 'info'
});

// Provide THREE namespace for helpers
probe.setThreeReference(THREE);

// Observe renderer and scene
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Create overlay (hidden by default in this demo)
const overlay = new ThreeLensOverlay(probe);

// Track state
let inspectMode = false;
let selectedObject: THREE.Object3D | null = null;
let hoveredObject: THREE.Object3D | null = null;

// ─────────────────────────────────────────────────────────────────
// UI Elements
// ─────────────────────────────────────────────────────────────────

const objectListEl = document.getElementById('objectList')!;
const wireframeToggle = document.getElementById('wireframeToggle') as HTMLButtonElement;
const boundingBoxToggle = document.getElementById('boundingBoxToggle') as HTMLButtonElement;
const globalWireframeBtn = document.getElementById('globalWireframeBtn') as HTMLButtonElement;
const inspectModeBtn = document.getElementById('inspectModeBtn') as HTMLButtonElement;
const clearSelectionBtn = document.getElementById('clearSelectionBtn') as HTMLButtonElement;
const selectedObjectNameEl = document.getElementById('selectedObjectName')!;
const hoveredObjectNameEl = document.getElementById('hoveredObjectName')!;
const inspectModeStatusEl = document.getElementById('inspectModeStatus')!;
const globalWireframeStatusEl = document.getElementById('globalWireframeStatus')!;

// ─────────────────────────────────────────────────────────────────
// Populate Object List
// ─────────────────────────────────────────────────────────────────

function populateObjectList(): void {
  objectListEl.innerHTML = '';
  
  sceneObjects.forEach(({ mesh, name, type }) => {
    const item = document.createElement('div');
    item.className = 'object-item';
    item.dataset.uuid = mesh.uuid;
    item.innerHTML = `
      <span class="object-name">${name}</span>
      <span class="object-type">${type}</span>
    `;
    
    item.addEventListener('click', () => {
      selectObject(mesh);
    });
    
    objectListEl.appendChild(item);
  });
}

// ─────────────────────────────────────────────────────────────────
// Selection Management
// ─────────────────────────────────────────────────────────────────

function selectObject(obj: THREE.Object3D | null): void {
  selectedObject = obj;
  
  // Update probe selection
  probe.selectObject(obj);
  
  // Update UI
  updateObjectListSelection();
  updateToggleStates();
  updateStatus();
}

function updateObjectListSelection(): void {
  const items = objectListEl.querySelectorAll('.object-item');
  items.forEach(item => {
    const uuid = (item as HTMLElement).dataset.uuid;
    if (uuid === selectedObject?.uuid) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

function updateToggleStates(): void {
  if (selectedObject && 'isMesh' in selectedObject) {
    wireframeToggle.disabled = false;
    boundingBoxToggle.disabled = false;
    
    // Check current states
    const wireframeEnabled = probe.isWireframeEnabled(selectedObject);
    const boundingBoxEnabled = probe.isBoundingBoxEnabled(selectedObject);
    
    wireframeToggle.classList.toggle('active', wireframeEnabled);
    boundingBoxToggle.classList.toggle('active', boundingBoxEnabled);
  } else {
    wireframeToggle.disabled = true;
    boundingBoxToggle.disabled = true;
    wireframeToggle.classList.remove('active');
    boundingBoxToggle.classList.remove('active');
  }
}

function updateStatus(): void {
  selectedObjectNameEl.textContent = selectedObject?.name || 'None';
  selectedObjectNameEl.classList.toggle('active', !!selectedObject);
  
  hoveredObjectNameEl.textContent = hoveredObject?.name || 'None';
  hoveredObjectNameEl.classList.toggle('highlight', !!hoveredObject);
  
  inspectModeStatusEl.textContent = inspectMode ? 'On' : 'Off';
  inspectModeStatusEl.classList.toggle('active', inspectMode);
  
  const globalWireframe = probe.isGlobalWireframeEnabled();
  globalWireframeStatusEl.textContent = globalWireframe ? 'On' : 'Off';
  globalWireframeStatusEl.classList.toggle('active', globalWireframe);
}

// ─────────────────────────────────────────────────────────────────
// Inspect Mode (Click to Select)
// ─────────────────────────────────────────────────────────────────

function toggleInspectMode(): void {
  inspectMode = !inspectMode;
  probe.setInspectModeEnabled(inspectMode);
  
  // Update cursor
  renderer.domElement.style.cursor = inspectMode ? 'crosshair' : 'default';
  
  // Update UI
  inspectModeBtn.classList.toggle('active', inspectMode);
  updateStatus();
}

// Listen for selection changes from probe (when using inspect mode)
probe.onSelectionChanged((obj) => {
  selectedObject = obj;
  updateObjectListSelection();
  updateToggleStates();
  updateStatus();
});

// Track hover state via raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event: MouseEvent): void {
  if (!inspectMode) {
    if (hoveredObject) {
      hoveredObject = null;
      updateStatus();
    }
    return;
  }
  
  // Calculate mouse position in normalized device coordinates
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  // Raycast to find hovered object
  raycaster.setFromCamera(mouse, camera);
  const meshes = sceneObjects.map(o => o.mesh);
  const intersects = raycaster.intersectObjects(meshes, false);
  
  const newHovered = intersects.length > 0 ? intersects[0].object : null;
  
  if (newHovered !== hoveredObject) {
    hoveredObject = newHovered as THREE.Mesh | null;
    
    // Update hover highlight through the probe's internal selection helper
    // The probe handles this internally when inspect mode is enabled
    updateStatus();
  }
}

renderer.domElement.addEventListener('mousemove', onMouseMove);

// ─────────────────────────────────────────────────────────────────
// Toggle Handlers
// ─────────────────────────────────────────────────────────────────

wireframeToggle.addEventListener('click', () => {
  if (!selectedObject) return;
  
  const enabled = !probe.isWireframeEnabled(selectedObject);
  probe.toggleWireframe(selectedObject, enabled);
  updateToggleStates();
});

boundingBoxToggle.addEventListener('click', () => {
  if (!selectedObject) return;
  
  const enabled = !probe.isBoundingBoxEnabled(selectedObject);
  probe.toggleBoundingBox(selectedObject, enabled);
  updateToggleStates();
});

globalWireframeBtn.addEventListener('click', () => {
  const enabled = !probe.isGlobalWireframeEnabled();
  probe.toggleGlobalWireframe(enabled);
  globalWireframeBtn.classList.toggle('active', enabled);
  updateStatus();
});

inspectModeBtn.addEventListener('click', toggleInspectMode);

clearSelectionBtn.addEventListener('click', () => {
  selectObject(null);
});

// ─────────────────────────────────────────────────────────────────
// Keyboard Shortcuts
// ─────────────────────────────────────────────────────────────────

window.addEventListener('keydown', (e) => {
  // Ignore if typing in input
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
  
  switch (e.key.toLowerCase()) {
    case 'i':
      toggleInspectMode();
      break;
      
    case 'w':
      if (selectedObject) {
        const enabled = !probe.isWireframeEnabled(selectedObject);
        probe.toggleWireframe(selectedObject, enabled);
        updateToggleStates();
      }
      break;
      
    case 'b':
      if (selectedObject) {
        const enabled = !probe.isBoundingBoxEnabled(selectedObject);
        probe.toggleBoundingBox(selectedObject, enabled);
        updateToggleStates();
      }
      break;
      
    case 'g':
      const enabled = !probe.isGlobalWireframeEnabled();
      probe.toggleGlobalWireframe(enabled);
      globalWireframeBtn.classList.toggle('active', enabled);
      updateStatus();
      break;
      
    case 'escape':
      selectObject(null);
      break;
  }
});

// ─────────────────────────────────────────────────────────────────
// Animation Loop
// ─────────────────────────────────────────────────────────────────

function animate(): void {
  requestAnimationFrame(animate);
  
  // Gentle rotation for the center torus knot
  const torusKnot = sceneObjects.find(o => o.name === 'Pink Torus Knot')?.mesh;
  if (torusKnot) {
    torusKnot.rotation.y += 0.005;
    torusKnot.rotation.x += 0.002;
  }
  
  controls.update();
  
  // Begin frame for stats collection
  probe.beginFrame();
  
  renderer.render(scene, camera);
  
  // End frame
  probe.endFrame();
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

populateObjectList();
updateStatus();
animate();

console.log('🎨 Visual Overlays Demo');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Features:');
console.log('  • Selection highlighting (cyan box)');
console.log('  • Hover highlighting (blue box)');
console.log('  • Per-object wireframe toggle');
console.log('  • Per-object bounding box');
console.log('  • Global wireframe mode');
console.log('');
console.log('Shortcuts:');
console.log('  I - Toggle Inspect Mode');
console.log('  W - Toggle Wireframe');
console.log('  B - Toggle Bounding Box');
console.log('  G - Global Wireframe');
console.log('  Esc - Clear Selection');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
