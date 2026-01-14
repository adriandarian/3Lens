import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

/**
 * Draw Call Batching Example
 *
 * This example demonstrates different techniques to reduce draw calls:
 * 1. Individual Meshes - Each object is a separate draw call (worst)
 * 2. InstancedMesh - GPU instancing for repeated geometry (best for same geometry)
 * 3. Merged Geometry - Combine geometries into one mesh (good for static scenes)
 * 4. BatchedMesh - Three.js r159+ feature for dynamic batching
 */

// Types
type RenderMode = 'individual' | 'instanced' | 'merged' | 'batched';

interface SceneState {
  mode: RenderMode;
  objectCount: number;
  objects: THREE.Object3D[];
  baselineDrawCalls: number;
}

// Scene setup
const scene = new THREE.Scene();
scene.name = 'DrawCallBatchingScene';
scene.background = new THREE.Color(0x0c0c14);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 30, 50);
camera.name = 'MainCamera';

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('app')!.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// Clock
const clock = new THREE.Clock();

// State
const state: SceneState = {
  mode: 'individual',
  objectCount: 1000,
  objects: [],
  baselineDrawCalls: 0,
};

// Colors for each mode
const modeColors: Record<RenderMode, number> = {
  individual: 0xf87171,
  instanced: 0x4ade80,
  merged: 0xa78bfa,
  batched: 0x64b4ff,
};

// Create base scene elements
function createBaseScene() {
  // Ground grid
  const gridHelper = new THREE.GridHelper(100, 50, 0x1a1a2a, 0x1a1a2a);
  gridHelper.name = 'GridHelper';
  scene.add(gridHelper);

  // Ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  ambient.name = 'AmbientLight';
  scene.add(ambient);

  // Directional light
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.name = 'DirectionalLight';
  directional.position.set(20, 40, 20);
  scene.add(directional);

  // Hemisphere light for nice gradient
  const hemisphere = new THREE.HemisphereLight(0x64b4ff, 0x1a1a2a, 0.3);
  hemisphere.name = 'HemisphereLight';
  scene.add(hemisphere);
}

createBaseScene();

// Generate random positions in a spherical distribution
function generatePositions(count: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  const radius = 40;

  for (let i = 0; i < count; i++) {
    // Distribute in a disc pattern with some height variation
    const angle = (i / count) * Math.PI * 20; // Spiral pattern
    const r = Math.sqrt(i / count) * radius;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = Math.sin(i * 0.1) * 3 + 2;
    positions.push(new THREE.Vector3(x, y, z));
  }

  return positions;
}

// Clear current objects
function clearObjects() {
  state.objects.forEach((obj) => {
    scene.remove(obj);
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  });
  state.objects = [];
}

// MODE 1: Individual Meshes (worst performance)
function createIndividualMeshes(count: number) {
  const group = new THREE.Group();
  group.name = 'IndividualMeshes_Group';

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const positions = generatePositions(count);

  for (let i = 0; i < count; i++) {
    // Create individual material and geometry for each (worst case)
    const material = new THREE.MeshStandardMaterial({
      color: modeColors.individual,
      roughness: 0.5,
      metalness: 0.3,
    });
    const mesh = new THREE.Mesh(geometry.clone(), material);
    mesh.name = `IndividualCube_${i}`;
    mesh.position.copy(positions[i]);
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    mesh.scale.setScalar(0.5 + Math.random() * 0.5);
    group.add(mesh);
  }

  scene.add(group);
  state.objects = [group];
}

// MODE 2: InstancedMesh (best for same geometry)
function createInstancedMesh(count: number) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: modeColors.instanced,
    roughness: 0.5,
    metalness: 0.3,
  });

  const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
  instancedMesh.name = 'InstancedMesh_Cubes';

  const positions = generatePositions(count);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const rotation = new THREE.Euler();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    position.copy(positions[i]);
    rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    quaternion.setFromEuler(rotation);
    scale.setScalar(0.5 + Math.random() * 0.5);

    matrix.compose(position, quaternion, scale);
    instancedMesh.setMatrixAt(i, matrix);
  }

  instancedMesh.instanceMatrix.needsUpdate = true;

  scene.add(instancedMesh);
  state.objects = [instancedMesh];
}

// MODE 3: Merged Geometry (good for static scenes)
function createMergedGeometry(count: number) {
  const geometries: THREE.BufferGeometry[] = [];
  const positions = generatePositions(count);

  for (let i = 0; i < count; i++) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // Apply transformations to geometry
    const matrix = new THREE.Matrix4();
    const position = positions[i];
    const rotation = new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    const quaternion = new THREE.Quaternion().setFromEuler(rotation);
    const scale = new THREE.Vector3().setScalar(0.5 + Math.random() * 0.5);

    matrix.compose(position, quaternion, scale);
    geometry.applyMatrix4(matrix);
    geometries.push(geometry);
  }

  // Merge all geometries into one
  const mergedGeometry = mergeGeometries(geometries, false);
  geometries.forEach((g) => g.dispose());

  const material = new THREE.MeshStandardMaterial({
    color: modeColors.merged,
    roughness: 0.5,
    metalness: 0.3,
  });

  const mesh = new THREE.Mesh(mergedGeometry, material);
  mesh.name = 'MergedGeometry_Cubes';

  scene.add(mesh);
  state.objects = [mesh];
}

// MODE 4: BatchedMesh (Three.js r159+)
function createBatchedMesh(count: number) {
  // Check if BatchedMesh is available
  if (!('BatchedMesh' in THREE)) {
    console.warn('BatchedMesh not available in this Three.js version');
    // Fallback to instanced mesh
    createInstancedMesh(count);
    return;
  }

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: modeColors.batched,
    roughness: 0.5,
    metalness: 0.3,
  });

  // BatchedMesh parameters: maxGeometryCount, maxVertexCount, maxIndexCount
  const maxVertexCount = count * geometry.attributes.position.count;
  const maxIndexCount = count * (geometry.index?.count || 0);

  const batchedMesh = new (THREE as unknown as { BatchedMesh: new (...args: unknown[]) => THREE.Object3D & {
    addGeometry: (geometry: THREE.BufferGeometry) => number;
    addInstance: (geometryId: number) => number;
    setMatrixAt: (instanceId: number, matrix: THREE.Matrix4) => void;
  } }).BatchedMesh(count, maxVertexCount, maxIndexCount, material);
  (batchedMesh as THREE.Object3D).name = 'BatchedMesh_Cubes';

  // Add the geometry template
  const geometryId = batchedMesh.addGeometry(geometry);

  const positions = generatePositions(count);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const rotation = new THREE.Euler();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const instanceId = batchedMesh.addInstance(geometryId);

    position.copy(positions[i]);
    rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    quaternion.setFromEuler(rotation);
    scale.setScalar(0.5 + Math.random() * 0.5);

    matrix.compose(position, quaternion, scale);
    batchedMesh.setMatrixAt(instanceId, matrix);
  }

  scene.add(batchedMesh);
  state.objects = [batchedMesh];
}

// Switch rendering mode
function setMode(mode: RenderMode) {
  state.mode = mode;
  clearObjects();

  switch (mode) {
    case 'individual':
      createIndividualMeshes(state.objectCount);
      break;
    case 'instanced':
      createInstancedMesh(state.objectCount);
      break;
    case 'merged':
      createMergedGeometry(state.objectCount);
      break;
    case 'batched':
      createBatchedMesh(state.objectCount);
      break;
  }

  // Update UI
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
  });

  // Record baseline on first render
  renderer.render(scene, camera);
  if (mode === 'individual') {
    state.baselineDrawCalls = renderer.info.render.calls;
  }
}

// Update object count
function setObjectCount(count: number) {
  state.objectCount = count;
  document.getElementById('object-count-value')!.textContent = count.toString();
  setMode(state.mode);
}

// =============================================================================
// UI SETUP
// =============================================================================

// Mode buttons
document.querySelectorAll('.mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.getAttribute('data-mode') as RenderMode;
    if (mode) {
      setMode(mode);
    }
  });
});

// Object count slider
const objectCountSlider = document.getElementById('object-count') as HTMLInputElement;
objectCountSlider.addEventListener('input', () => {
  setObjectCount(parseInt(objectCountSlider.value, 10));
});

// =============================================================================
// 3LENS PROBE SETUP
// =============================================================================

const probe = createProbe({
  renderer,
  scene,
  camera,
});

probe.setAppName('Draw Call Batching Example');
bootstrapOverlay(probe);

// =============================================================================
// ANIMATION LOOP & STATS
// =============================================================================

let frameCount = 0;
let lastTime = performance.now();
let currentFps = 0;
let frameTimeMs = 0;

function updateStats() {
  const info = renderer.info;

  // FPS
  const fpsEl = document.getElementById('stat-fps');
  if (fpsEl) {
    fpsEl.textContent = currentFps.toString();
    fpsEl.className =
      'stat-value' +
      (currentFps < 30 ? ' bad' : currentFps < 55 ? ' warn' : ' good');
  }

  // Draw calls
  const drawCallsEl = document.getElementById('stat-drawcalls');
  if (drawCallsEl) {
    const calls = info.render.calls;
    drawCallsEl.textContent = calls.toString();
    drawCallsEl.className =
      'stat-value' +
      (calls > 100 ? ' bad' : calls > 10 ? ' warn' : ' good');
  }

  // Triangles
  const trianglesEl = document.getElementById('stat-triangles');
  if (trianglesEl) {
    const triCount = info.render.triangles;
    trianglesEl.textContent =
      triCount > 1000000
        ? (triCount / 1000000).toFixed(1) + 'M'
        : triCount > 1000
          ? (triCount / 1000).toFixed(1) + 'K'
          : triCount.toString();
  }

  // Frame time
  const frameTimeEl = document.getElementById('stat-frametime');
  if (frameTimeEl) {
    frameTimeEl.textContent = frameTimeMs.toFixed(1) + 'ms';
    frameTimeEl.className =
      'stat-value' +
      (frameTimeMs > 33 ? ' bad' : frameTimeMs > 16 ? ' warn' : ' good');
  }

  // Efficiency bar
  const efficiencyBar = document.getElementById('efficiency-bar');
  if (efficiencyBar && state.baselineDrawCalls > 0) {
    const currentCalls = info.render.calls;
    const efficiency = (1 - currentCalls / state.baselineDrawCalls) * 100;
    const reduction = Math.max(0, Math.min(100, efficiency));

    efficiencyBar.style.width = `${100 - reduction}%`;
    efficiencyBar.className =
      'bar-fill' +
      (reduction > 90 ? '' : reduction > 50 ? ' medium' : ' high');

    const percentageEl = efficiencyBar.querySelector('.bar-percentage');
    if (percentageEl) {
      if (state.mode === 'individual') {
        percentageEl.textContent = 'Baseline';
      } else {
        percentageEl.textContent = `-${reduction.toFixed(0)}%`;
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  const frameStart = performance.now();

  // FPS calculation
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    currentFps = Math.round((frameCount * 1000) / (now - lastTime));
    frameCount = 0;
    lastTime = now;
    updateStats();
  }

  // Animate objects
  const elapsed = clock.getElapsedTime();

  // Subtle rotation animation for the entire scene content
  state.objects.forEach((obj) => {
    obj.rotation.y = elapsed * 0.1;
  });

  controls.update();
  renderer.render(scene, camera);
  probe.onFrame();

  frameTimeMs = performance.now() - frameStart;
}

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize with individual mode
setMode('individual');
animate();

