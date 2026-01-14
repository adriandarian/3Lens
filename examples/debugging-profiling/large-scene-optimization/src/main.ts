/**
 * 3Lens Large Scene Optimization Example
 * 
 * This example demonstrates various optimization techniques for large Three.js scenes:
 * 
 * 1. GPU Instancing - Render thousands of identical objects with a single draw call
 * 2. Frustum Culling - Skip rendering objects outside the camera view
 * 3. Level of Detail (LOD) - Use simpler geometry for distant objects
 * 4. Static Batching - Merge static geometries to reduce draw calls
 * 5. Geometry Complexity - Balance detail vs performance
 */

import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// Configuration
// ============================================================================

interface SceneConfig {
  objectCount: number;
  useInstancing: boolean;
  useFrustumCulling: boolean;
  useLOD: boolean;
  useBatching: boolean;
  enableShadows: boolean;
  enableAA: boolean;
  enableAnimation: boolean;
  geometryDetail: number; // 1-4
}

const config: SceneConfig = {
  objectCount: 1000,
  useInstancing: false,
  useFrustumCulling: true,
  useLOD: false,
  useBatching: false,
  enableShadows: false,
  enableAA: true,
  enableAnimation: true,
  geometryDetail: 2
};

// ============================================================================
// Scene Setup
// ============================================================================

const container = document.getElementById('canvas-container')!;

const scene = new THREE.Scene();
scene.name = 'LargeOptimizedScene';
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);

const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  500
);
camera.position.set(0, 30, 50);
camera.lookAt(0, 0, 0);
camera.name = 'Main Camera';

let renderer = new THREE.WebGLRenderer({ antialias: config.enableAA });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = config.enableShadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// ============================================================================
// Lighting
// ============================================================================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = config.enableShadows;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 10;
directionalLight.shadow.camera.far = 300;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.name = 'DirectionalLight';
scene.add(directionalLight);

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(400, 400);
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x1a1a1a,
  roughness: 0.9,
  metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.name = 'Ground';
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(400, 100, 0x222222, 0x1a1a1a);
gridHelper.name = 'GridHelper';
scene.add(gridHelper);

// ============================================================================
// Geometry Factories
// ============================================================================

function getGeometryDetail(detail: number): { segments: number; name: string } {
  switch (detail) {
    case 1: return { segments: 4, name: 'Low' };
    case 2: return { segments: 16, name: 'Medium' };
    case 3: return { segments: 32, name: 'High' };
    case 4: return { segments: 64, name: 'Ultra' };
    default: return { segments: 16, name: 'Medium' };
  }
}

function createBaseGeometries(detail: number): THREE.BufferGeometry[] {
  const { segments } = getGeometryDetail(detail);
  return [
    new THREE.BoxGeometry(1, 1, 1, Math.min(segments, 8), Math.min(segments, 8), Math.min(segments, 8)),
    new THREE.SphereGeometry(0.5, segments, segments),
    new THREE.ConeGeometry(0.5, 1, segments),
    new THREE.CylinderGeometry(0.3, 0.5, 1, segments),
    new THREE.TorusGeometry(0.4, 0.15, segments, segments * 2),
    new THREE.IcosahedronGeometry(0.5, Math.min(Math.floor(detail), 3)),
  ];
}

function createLODGeometries(): { high: THREE.BufferGeometry; medium: THREE.BufferGeometry; low: THREE.BufferGeometry }[] {
  return [
    {
      high: new THREE.SphereGeometry(0.5, 32, 32),
      medium: new THREE.SphereGeometry(0.5, 16, 16),
      low: new THREE.SphereGeometry(0.5, 8, 8),
    },
    {
      high: new THREE.BoxGeometry(1, 1, 1, 4, 4, 4),
      medium: new THREE.BoxGeometry(1, 1, 1, 2, 2, 2),
      low: new THREE.BoxGeometry(1, 1, 1, 1, 1, 1),
    },
    {
      high: new THREE.TorusGeometry(0.4, 0.15, 24, 48),
      medium: new THREE.TorusGeometry(0.4, 0.15, 12, 24),
      low: new THREE.TorusGeometry(0.4, 0.15, 6, 12),
    },
  ];
}

// ============================================================================
// Materials
// ============================================================================

const colors = [
  0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7,
  0xdfe6e9, 0xfd79a8, 0xa29bfe, 0x00b894, 0xe17055
];

function createMaterials(): THREE.MeshStandardMaterial[] {
  return colors.map(color => new THREE.MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.7,
  }));
}

// ============================================================================
// Object Tracking
// ============================================================================

interface SceneObjects {
  meshes: THREE.Mesh[];
  instancedMeshes: THREE.InstancedMesh[];
  lodObjects: THREE.LOD[];
  batchedMesh: THREE.Mesh | null;
}

let sceneObjects: SceneObjects = {
  meshes: [],
  instancedMeshes: [],
  lodObjects: [],
  batchedMesh: null
};

// ============================================================================
// Scene Building Functions
// ============================================================================

function clearScene(): void {
  // Remove all dynamic objects
  for (const mesh of sceneObjects.meshes) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    if (mesh.material instanceof THREE.Material) {
      mesh.material.dispose();
    }
  }
  
  for (const instancedMesh of sceneObjects.instancedMeshes) {
    scene.remove(instancedMesh);
    instancedMesh.geometry.dispose();
    if (instancedMesh.material instanceof THREE.Material) {
      instancedMesh.material.dispose();
    }
  }
  
  for (const lod of sceneObjects.lodObjects) {
    scene.remove(lod);
    lod.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  }
  
  if (sceneObjects.batchedMesh) {
    scene.remove(sceneObjects.batchedMesh);
    sceneObjects.batchedMesh.geometry.dispose();
    if (sceneObjects.batchedMesh.material instanceof THREE.Material) {
      sceneObjects.batchedMesh.material.dispose();
    }
  }
  
  sceneObjects = {
    meshes: [],
    instancedMeshes: [],
    lodObjects: [],
    batchedMesh: null
  };
}

function generatePositions(count: number, spread: number = 150): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    positions.push(new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      Math.random() * 20 + 0.5,
      (Math.random() - 0.5) * spread
    ));
  }
  return positions;
}

function buildSceneWithIndividualMeshes(): void {
  const geometries = createBaseGeometries(config.geometryDetail);
  const materials = createMaterials();
  const positions = generatePositions(config.objectCount);
  
  for (let i = 0; i < config.objectCount; i++) {
    const geometry = geometries[i % geometries.length];
    const material = materials[i % materials.length];
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.copy(positions[i]);
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    mesh.scale.setScalar(0.5 + Math.random() * 1.5);
    
    mesh.castShadow = config.enableShadows;
    mesh.receiveShadow = config.enableShadows;
    mesh.frustumCulled = config.useFrustumCulling;
    mesh.name = `Object_${i}`;
    
    scene.add(mesh);
    sceneObjects.meshes.push(mesh);
  }
}

function buildSceneWithInstancing(): void {
  const geometries = createBaseGeometries(config.geometryDetail);
  const materials = createMaterials();
  const objectsPerType = Math.ceil(config.objectCount / geometries.length);
  
  for (let typeIndex = 0; typeIndex < geometries.length; typeIndex++) {
    const geometry = geometries[typeIndex];
    const material = materials[typeIndex % materials.length];
    const count = Math.min(objectsPerType, config.objectCount - typeIndex * objectsPerType);
    
    if (count <= 0) break;
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    instancedMesh.castShadow = config.enableShadows;
    instancedMesh.receiveShadow = config.enableShadows;
    instancedMesh.frustumCulled = config.useFrustumCulling;
    instancedMesh.name = `InstancedMesh_Type${typeIndex}`;
    
    const dummy = new THREE.Object3D();
    const positions = generatePositions(count);
    
    for (let i = 0; i < count; i++) {
      dummy.position.copy(positions[i]);
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      dummy.scale.setScalar(0.5 + Math.random() * 1.5);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);
    sceneObjects.instancedMeshes.push(instancedMesh);
  }
}

function buildSceneWithLOD(): void {
  const lodGeometries = createLODGeometries();
  const materials = createMaterials();
  const positions = generatePositions(config.objectCount);
  
  for (let i = 0; i < config.objectCount; i++) {
    const lod = new THREE.LOD();
    const geoSet = lodGeometries[i % lodGeometries.length];
    const material = materials[i % materials.length];
    
    // High detail - close range
    const meshHigh = new THREE.Mesh(geoSet.high, material);
    lod.addLevel(meshHigh, 0);
    
    // Medium detail - mid range
    const meshMedium = new THREE.Mesh(geoSet.medium, material);
    lod.addLevel(meshMedium, 30);
    
    // Low detail - far range
    const meshLow = new THREE.Mesh(geoSet.low, material);
    lod.addLevel(meshLow, 60);
    
    lod.position.copy(positions[i]);
    lod.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    lod.scale.setScalar(0.5 + Math.random() * 1.5);
    lod.name = `LOD_${i}`;
    
    // Set shadow properties on all levels
    lod.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = config.enableShadows;
        child.receiveShadow = config.enableShadows;
        child.frustumCulled = config.useFrustumCulling;
      }
    });
    
    scene.add(lod);
    sceneObjects.lodObjects.push(lod);
  }
}

function buildSceneWithBatching(): void {
  const geometries = createBaseGeometries(config.geometryDetail);
  const material = createMaterials()[0]; // Use single material for batching
  const positions = generatePositions(config.objectCount);
  
  // Merge all geometries into one
  const mergedGeometry = new THREE.BufferGeometry();
  const positionArrays: number[] = [];
  const normalArrays: number[] = [];
  const uvArrays: number[] = [];
  
  const tempMatrix = new THREE.Matrix4();
  const tempPosition = new THREE.Vector3();
  const tempNormal = new THREE.Vector3();
  
  for (let i = 0; i < config.objectCount; i++) {
    const geometry = geometries[i % geometries.length].clone();
    
    // Apply transform to geometry
    tempMatrix.makeRotationFromEuler(new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    ));
    const scale = 0.5 + Math.random() * 1.5;
    tempMatrix.scale(new THREE.Vector3(scale, scale, scale));
    tempMatrix.setPosition(positions[i]);
    
    geometry.applyMatrix4(tempMatrix);
    
    // Extract attributes
    const posAttr = geometry.getAttribute('position');
    const normAttr = geometry.getAttribute('normal');
    const uvAttr = geometry.getAttribute('uv');
    
    for (let j = 0; j < posAttr.count; j++) {
      tempPosition.fromBufferAttribute(posAttr, j);
      positionArrays.push(tempPosition.x, tempPosition.y, tempPosition.z);
      
      if (normAttr) {
        tempNormal.fromBufferAttribute(normAttr, j);
        normalArrays.push(tempNormal.x, tempNormal.y, tempNormal.z);
      }
      
      if (uvAttr) {
        uvArrays.push(uvAttr.getX(j), uvAttr.getY(j));
      }
    }
    
    geometry.dispose();
  }
  
  mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArrays, 3));
  if (normalArrays.length > 0) {
    mergedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normalArrays, 3));
  }
  if (uvArrays.length > 0) {
    mergedGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvArrays, 2));
  }
  
  const batchedMesh = new THREE.Mesh(mergedGeometry, material);
  batchedMesh.castShadow = config.enableShadows;
  batchedMesh.receiveShadow = config.enableShadows;
  batchedMesh.frustumCulled = config.useFrustumCulling;
  batchedMesh.name = 'BatchedMesh';
  
  scene.add(batchedMesh);
  sceneObjects.batchedMesh = batchedMesh;
}

function rebuildScene(): void {
  clearScene();
  
  if (config.useBatching) {
    buildSceneWithBatching();
  } else if (config.useInstancing) {
    buildSceneWithInstancing();
  } else if (config.useLOD) {
    buildSceneWithLOD();
  } else {
    buildSceneWithIndividualMeshes();
  }
  
  // Update shadow settings
  renderer.shadowMap.enabled = config.enableShadows;
  directionalLight.castShadow = config.enableShadows;
  
  console.log(`Scene rebuilt with ${config.objectCount} objects`);
  console.log(`Instancing: ${config.useInstancing}, LOD: ${config.useLOD}, Batching: ${config.useBatching}`);
}

// ============================================================================
// Camera Controls
// ============================================================================

let cameraAngle = 0;
let cameraRadius = 50;
let cameraHeight = 30;
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;

container.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMouseX = e.clientX;
  previousMouseY = e.clientY;
});

container.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  
  const deltaX = e.clientX - previousMouseX;
  const deltaY = e.clientY - previousMouseY;
  
  cameraAngle += deltaX * 0.01;
  cameraHeight = Math.max(5, Math.min(100, cameraHeight - deltaY * 0.3));
  
  previousMouseX = e.clientX;
  previousMouseY = e.clientY;
});

container.addEventListener('mouseup', () => {
  isDragging = false;
});

container.addEventListener('wheel', (e) => {
  cameraRadius = Math.max(20, Math.min(150, cameraRadius + e.deltaY * 0.1));
});

function updateCamera(): void {
  camera.position.x = Math.sin(cameraAngle) * cameraRadius;
  camera.position.z = Math.cos(cameraAngle) * cameraRadius;
  camera.position.y = cameraHeight;
  camera.lookAt(0, 0, 0);
}

function resetCamera(): void {
  cameraAngle = 0;
  cameraRadius = 50;
  cameraHeight = 30;
}

// ============================================================================
// Stats Update
// ============================================================================

let frameCount = 0;
let lastFpsUpdate = performance.now();
let currentFps = 60;
let frameTimeMs = 16.6;

function updateStats(): void {
  const now = performance.now();
  frameCount++;
  
  if (now - lastFpsUpdate >= 500) {
    currentFps = Math.round(frameCount * 1000 / (now - lastFpsUpdate));
    frameTimeMs = (now - lastFpsUpdate) / frameCount;
    frameCount = 0;
    lastFpsUpdate = now;
  }
  
  // FPS
  const fpsEl = document.getElementById('stat-fps')!;
  fpsEl.textContent = currentFps.toString();
  fpsEl.className = 'stat-value ' + (currentFps >= 55 ? 'good' : currentFps >= 30 ? 'warning' : 'danger');
  
  // Frame time
  const frametimeEl = document.getElementById('stat-frametime')!;
  frametimeEl.textContent = `${frameTimeMs.toFixed(1)}ms`;
  frametimeEl.className = 'stat-value ' + (frameTimeMs <= 17 ? 'good' : frameTimeMs <= 33 ? 'warning' : 'danger');
  
  // Draw calls
  const drawCallsEl = document.getElementById('stat-drawcalls')!;
  const drawCalls = renderer.info.render.calls;
  drawCallsEl.textContent = drawCalls.toString();
  drawCallsEl.className = 'stat-value ' + (drawCalls <= 50 ? 'good' : drawCalls <= 200 ? 'warning' : 'danger');
  
  // Triangles
  const trianglesEl = document.getElementById('stat-triangles')!;
  const triangles = renderer.info.render.triangles;
  trianglesEl.textContent = triangles > 1000000 ? `${(triangles / 1000000).toFixed(1)}M` : 
                            triangles > 1000 ? `${(triangles / 1000).toFixed(1)}K` : 
                            triangles.toString();
  
  // Points
  const pointsEl = document.getElementById('stat-points')!;
  pointsEl.textContent = renderer.info.render.points.toString();
  
  // Object counts
  document.getElementById('stat-objects')!.textContent = config.objectCount.toString();
  
  // Visible/Culled (approximate based on draw calls)
  const visibleCount = config.useInstancing ? 
    sceneObjects.instancedMeshes.reduce((sum, im) => sum + im.count, 0) :
    sceneObjects.meshes.length + sceneObjects.lodObjects.length + (sceneObjects.batchedMesh ? 1 : 0);
  document.getElementById('stat-visible')!.textContent = visibleCount.toString();
  
  const culledEl = document.getElementById('stat-culled')!;
  const culledCount = config.useFrustumCulling ? Math.max(0, config.objectCount - drawCalls) : 0;
  culledEl.textContent = culledCount.toString();
  
  // Memory
  document.getElementById('stat-geometries')!.textContent = renderer.info.memory.geometries.toString();
  document.getElementById('stat-textures')!.textContent = renderer.info.memory.textures.toString();
}

// ============================================================================
// UI Event Handlers
// ============================================================================

// Object count slider
const objectCountSlider = document.getElementById('object-count') as HTMLInputElement;
const objectCountValue = document.getElementById('object-count-value')!;
objectCountSlider.addEventListener('input', () => {
  config.objectCount = parseInt(objectCountSlider.value);
  objectCountValue.textContent = config.objectCount.toString();
});

// Geometry detail slider
const geometryDetailSlider = document.getElementById('geometry-detail') as HTMLInputElement;
const geometryDetailValue = document.getElementById('geometry-detail-value')!;
geometryDetailSlider.addEventListener('input', () => {
  config.geometryDetail = parseInt(geometryDetailSlider.value);
  geometryDetailValue.textContent = getGeometryDetail(config.geometryDetail).name;
});

// Toggle handlers
function setupToggle(id: string, configKey: keyof SceneConfig, autoRebuild: boolean = false): void {
  const toggle = document.getElementById(id)!;
  toggle.addEventListener('click', () => {
    (config as Record<string, unknown>)[configKey] = !config[configKey];
    toggle.classList.toggle('active', config[configKey] as boolean);
    
    if (autoRebuild) {
      rebuildScene();
    }
  });
}

setupToggle('toggle-instancing', 'useInstancing', true);
setupToggle('toggle-frustum', 'useFrustumCulling', true);
setupToggle('toggle-lod', 'useLOD', true);
setupToggle('toggle-batching', 'useBatching', true);
setupToggle('toggle-shadows', 'enableShadows', true);
setupToggle('toggle-aa', 'enableAA');
setupToggle('toggle-animation', 'enableAnimation');

// AA toggle needs special handling (recreate renderer)
document.getElementById('toggle-aa')!.addEventListener('click', () => {
  // Recreate renderer with new AA setting
  const parent = renderer.domElement.parentNode;
  parent?.removeChild(renderer.domElement);
  renderer.dispose();
  
  renderer = new THREE.WebGLRenderer({ antialias: config.enableAA });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = config.enableShadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  
  // Recreate probe with new renderer
  probe.dispose();
  initProbe();
});

// Buttons
document.getElementById('btn-rebuild')!.addEventListener('click', rebuildScene);
document.getElementById('btn-reset-camera')!.addEventListener('click', resetCamera);

// Presets
document.getElementById('preset-worst')!.addEventListener('click', () => {
  config.objectCount = 2000;
  config.useInstancing = false;
  config.useFrustumCulling = false;
  config.useLOD = false;
  config.useBatching = false;
  config.enableShadows = true;
  config.geometryDetail = 4;
  updateUIFromConfig();
  rebuildScene();
});

document.getElementById('preset-best')!.addEventListener('click', () => {
  config.objectCount = 2000;
  config.useInstancing = true;
  config.useFrustumCulling = true;
  config.useLOD = false;
  config.useBatching = false;
  config.enableShadows = false;
  config.geometryDetail = 2;
  updateUIFromConfig();
  rebuildScene();
});

document.getElementById('preset-medium')!.addEventListener('click', () => {
  config.objectCount = 1000;
  config.useInstancing = false;
  config.useFrustumCulling = true;
  config.useLOD = true;
  config.useBatching = false;
  config.enableShadows = false;
  config.geometryDetail = 2;
  updateUIFromConfig();
  rebuildScene();
});

document.getElementById('preset-stress')!.addEventListener('click', () => {
  config.objectCount = 10000;
  config.useInstancing = true;
  config.useFrustumCulling = true;
  config.useLOD = false;
  config.useBatching = false;
  config.enableShadows = false;
  config.geometryDetail = 1;
  updateUIFromConfig();
  rebuildScene();
});

function updateUIFromConfig(): void {
  objectCountSlider.value = config.objectCount.toString();
  objectCountValue.textContent = config.objectCount.toString();
  
  geometryDetailSlider.value = config.geometryDetail.toString();
  geometryDetailValue.textContent = getGeometryDetail(config.geometryDetail).name;
  
  document.getElementById('toggle-instancing')!.classList.toggle('active', config.useInstancing);
  document.getElementById('toggle-frustum')!.classList.toggle('active', config.useFrustumCulling);
  document.getElementById('toggle-lod')!.classList.toggle('active', config.useLOD);
  document.getElementById('toggle-batching')!.classList.toggle('active', config.useBatching);
  document.getElementById('toggle-shadows')!.classList.toggle('active', config.enableShadows);
  document.getElementById('toggle-aa')!.classList.toggle('active', config.enableAA);
  document.getElementById('toggle-animation')!.classList.toggle('active', config.enableAnimation);
}

// ============================================================================
// 3Lens Integration
// ============================================================================

let probe = createProbe({
  renderer,
  scene,
  camera,
  name: 'LargeSceneOptimization'
});

function initProbe(): void {
  probe = createProbe({
    renderer,
    scene,
    camera,
    name: 'LargeSceneOptimization'
  });
  
  bootstrapOverlay(probe, {
    theme: 'dark',
    defaultPanel: 'stats',
    keyboardShortcuts: true
  });
}

// Initial overlay setup
bootstrapOverlay(probe, {
  theme: 'dark',
  defaultPanel: 'stats',
  keyboardShortcuts: true
});

// ============================================================================
// Animation Loop
// ============================================================================

function animate(): void {
  requestAnimationFrame(animate);
  
  updateCamera();
  
  // Animate objects if enabled
  if (config.enableAnimation) {
    const time = performance.now() * 0.001;
    
    // Animate individual meshes
    for (const mesh of sceneObjects.meshes) {
      mesh.rotation.y = time * 0.5 + mesh.position.x * 0.01;
    }
    
    // Animate LOD objects
    for (const lod of sceneObjects.lodObjects) {
      lod.rotation.y = time * 0.5 + lod.position.x * 0.01;
      lod.update(camera);
    }
    
    // Note: Instanced meshes and batched mesh don't animate easily
    // This is one trade-off of these optimizations
  } else {
    // Still need to update LOD even without animation
    for (const lod of sceneObjects.lodObjects) {
      lod.update(camera);
    }
  }
  
  renderer.render(scene, camera);
  probe.onFrame();
  updateStats();
}

// ============================================================================
// Window Resize
// ============================================================================

window.addEventListener('resize', () => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// ============================================================================
// Initialize
// ============================================================================

rebuildScene();
animate();

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         3Lens Large Scene Optimization Example                ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  This example demonstrates optimization techniques for        ║
║  rendering large Three.js scenes with many objects.           ║
║                                                               ║
║  Press ~ to open the 3Lens panel                              ║
║                                                               ║
║  Try the presets to see the performance difference:           ║
║  - Worst Case: All optimizations off, maximum complexity      ║
║  - Best Case: Instancing + culling, lower complexity          ║
║  - Balanced: LOD + culling for typical use cases              ║
║  - Stress Test: 10K objects with instancing                   ║
║                                                               ║
║  Mouse Controls:                                              ║
║  - Drag: Rotate camera                                        ║
║  - Scroll: Zoom in/out                                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

