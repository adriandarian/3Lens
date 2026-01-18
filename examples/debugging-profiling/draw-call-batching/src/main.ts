import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

/**
 * Draw Call Batching Example
 *
 * This example demonstrates different techniques to reduce draw calls:
 * 1. Individual Meshes - Each object is a separate draw call (worst)
 * 2. InstancedMesh - GPU instancing for repeated geometry (best for same geometry)
 * 3. Merged Geometry - Combine geometries into one mesh (good for static scenes)
 * 4. BatchedMesh - Three.js r159+ feature for dynamic batching
 *
 * Use the 3Lens overlay to:
 * - Monitor draw calls in the Performance panel
 * - Compare frame times between rendering modes
 * - Inspect the scene graph structure differences
 */

// Types
type RenderMode = 'individual' | 'instanced' | 'merged' | 'batched';

interface SceneState {
  mode: RenderMode;
  objectCount: number;
  objects: THREE.Object3D[];
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
    console.warn('BatchedMesh not available in this Three.js version, using instanced mesh');
    createInstancedMesh(count);
    return;
  }

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: modeColors.batched,
    roughness: 0.5,
    metalness: 0.3,
  });

  const maxVertexCount = count * geometry.attributes.position.count;
  const maxIndexCount = count * (geometry.index?.count || 0);

  const batchedMesh = new (THREE as unknown as { BatchedMesh: new (...args: unknown[]) => THREE.Object3D & {
    addGeometry: (geometry: THREE.BufferGeometry) => number;
    addInstance: (geometryId: number) => number;
    setMatrixAt: (instanceId: number, matrix: THREE.Matrix4) => void;
  } }).BatchedMesh(count, maxVertexCount, maxIndexCount, material);
  (batchedMesh as THREE.Object3D).name = 'BatchedMesh_Cubes';

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

// =============================================================================
// CREATE ALL RENDERING MODES FOR COMPARISON
// =============================================================================

function createAllModes() {
  const count = 500; // Use smaller count for side-by-side comparison
  const spacing = 100;
  
  // Individual meshes (red)
  const individualGroup = new THREE.Group();
  individualGroup.name = 'Individual_Mode';
  individualGroup.position.x = -spacing * 1.5;
  
  const indGeometry = new THREE.BoxGeometry(1, 1, 1);
  const indPositions = generatePositions(count);
  for (let i = 0; i < count; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: modeColors.individual,
      roughness: 0.5,
      metalness: 0.3,
    });
    const mesh = new THREE.Mesh(indGeometry.clone(), material);
    mesh.position.copy(indPositions[i]);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mesh.scale.setScalar(0.5 + Math.random() * 0.5);
    individualGroup.add(mesh);
  }
  scene.add(individualGroup);
  
  // Instanced mesh (green)
  const instGeometry = new THREE.BoxGeometry(1, 1, 1);
  const instMaterial = new THREE.MeshStandardMaterial({
    color: modeColors.instanced,
    roughness: 0.5,
    metalness: 0.3,
  });
  const instancedMesh = new THREE.InstancedMesh(instGeometry, instMaterial, count);
  instancedMesh.name = 'Instanced_Mode';
  instancedMesh.position.x = -spacing * 0.5;
  
  const instPositions = generatePositions(count);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    const pos = instPositions[i];
    const quat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    );
    const scl = new THREE.Vector3().setScalar(0.5 + Math.random() * 0.5);
    matrix.compose(pos, quat, scl);
    instancedMesh.setMatrixAt(i, matrix);
  }
  instancedMesh.instanceMatrix.needsUpdate = true;
  scene.add(instancedMesh);
  
  // Merged geometry (purple)
  const mergeGeometries_arr: THREE.BufferGeometry[] = [];
  const mergePositions = generatePositions(count);
  for (let i = 0; i < count; i++) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.Matrix4();
    mat.compose(
      mergePositions[i],
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      ),
      new THREE.Vector3().setScalar(0.5 + Math.random() * 0.5)
    );
    geo.applyMatrix4(mat);
    mergeGeometries_arr.push(geo);
  }
  const mergedGeo = mergeGeometries(mergeGeometries_arr, false);
  mergeGeometries_arr.forEach(g => g.dispose());
  
  const mergedMesh = new THREE.Mesh(
    mergedGeo,
    new THREE.MeshStandardMaterial({ color: modeColors.merged, roughness: 0.5, metalness: 0.3 })
  );
  mergedMesh.name = 'Merged_Mode';
  mergedMesh.position.x = spacing * 0.5;
  scene.add(mergedMesh);
  
  state.objects = [individualGroup, instancedMesh, mergedMesh];
}

// Create the demo scene with all modes visible
createAllModes();

// =============================================================================
// 3LENS PROBE SETUP
// =============================================================================

const probe = createProbe({
  name: 'DrawCallBatchingProbe',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setAppName('Draw Call Batching');

// Register batching system as logical entity
probe.registerLogicalEntity('batching-comparison', 'Batching Comparison', {
  category: 'Rendering',
  objectsPerMode: 500,
  modes: ['Individual', 'Instanced', 'Merged'],
  description: 'Compare draw calls: Individual (red), Instanced (green), Merged (purple)',
});

createOverlay({ probe, theme: 'dark' });

// =============================================================================
// ANIMATION LOOP
// =============================================================================

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // Subtle rotation animation
  state.objects.forEach((obj) => {
    obj.rotation.y = elapsed * 0.1;
  });

  controls.update();
  renderer.render(scene, camera);
}

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

console.log(`
⚡ Draw Call Batching Example
==============================
This example shows three rendering approaches side by side:

RED (left): Individual meshes - 500 draw calls
GREEN (center): Instanced mesh - 1 draw call  
PURPLE (right): Merged geometry - 1 draw call

Open the 3Lens overlay to:
- View draw call count in Performance panel
- Compare frame times
- Inspect scene graph structure differences
- See how instancing reduces GPU overhead
`);
