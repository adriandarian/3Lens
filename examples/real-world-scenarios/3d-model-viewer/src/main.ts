import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ───────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────

interface ModelStats {
  meshes: number;
  triangles: number;
  materials: number;
  textures: number;
  animations: number;
  memory: number;
}

interface Environment {
  name: string;
  background: THREE.Color;
  ambientIntensity: number;
  directionalIntensity: number;
  groundColor: number;
}

// ───────────────────────────────────────────────────────────────
// Constants
// ───────────────────────────────────────────────────────────────

const ENVIRONMENTS: Record<string, Environment> = {
  studio: {
    name: 'Studio',
    background: new THREE.Color(0x1a1a2e),
    ambientIntensity: 0.6,
    directionalIntensity: 0.8,
    groundColor: 0x16213e,
  },
  outdoor: {
    name: 'Outdoor',
    background: new THREE.Color(0x87ceeb),
    ambientIntensity: 0.5,
    directionalIntensity: 1.2,
    groundColor: 0x3d5a3d,
  },
  dark: {
    name: 'Dark',
    background: new THREE.Color(0x0a0e14),
    ambientIntensity: 0.2,
    directionalIntensity: 0.4,
    groundColor: 0x1f2937,
  },
};

// ───────────────────────────────────────────────────────────────
// Scene Setup
// ───────────────────────────────────────────────────────────────

const container = document.getElementById('canvas-container')!;
const loadingOverlay = document.getElementById('loading-overlay')!;
const loadingProgress = document.getElementById('loading-progress')!;
const dropZone = document.getElementById('drop-zone')!;

// Scene
const scene = new THREE.Scene();
scene.name = 'ModelViewerScene';

// Camera
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.name = 'ViewerCamera';
camera.position.set(3, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.1;
controls.maxDistance = 100;
controls.target.set(0, 0, 0);

// ───────────────────────────────────────────────────────────────
// Lighting
// ───────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.name = 'MainLight';
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.bias = -0.0001;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0x8ec8ff, 0.4);
fillLight.name = 'FillLight';
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffd700, 0.3);
rimLight.name = 'RimLight';
rimLight.position.set(0, 5, -10);
scene.add(rimLight);

// ───────────────────────────────────────────────────────────────
// Ground Plane
// ───────────────────────────────────────────────────────────────

const groundGeometry = new THREE.PlaneGeometry(50, 50);
groundGeometry.name = 'GroundGeometry';
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x3d5a3d,
  roughness: 0.8,
  metalness: 0.2,
  name: 'GroundMaterial',
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.name = 'Ground';
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(20, 40, 0x444444, 0x222222);
gridHelper.name = 'GridHelper';
gridHelper.position.y = 0.001;
scene.add(gridHelper);

// ───────────────────────────────────────────────────────────────
// Model Loading
// ───────────────────────────────────────────────────────────────

// Setup loaders
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
gltfLoader.setDRACOLoader(dracoLoader);

// Current model group
let currentModel: THREE.Group | null = null;
let mixer: THREE.AnimationMixer | null = null;
let animations: THREE.AnimationClip[] = [];
let currentStats: ModelStats = {
  meshes: 0,
  triangles: 0,
  materials: 0,
  textures: 0,
  animations: 0,
  memory: 0,
};

// Animation state
let animationSpeed = 1.0;
let modelScale = 1.0;

function showLoading(show: boolean) {
  loadingOverlay.classList.toggle('hidden', !show);
}

function updateProgress(progress: number) {
  loadingProgress.textContent = `${Math.round(progress)}%`;
}

function clearCurrentModel() {
  if (currentModel) {
    scene.remove(currentModel);
    
    // Dispose resources
    currentModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
    
    currentModel = null;
  }
  
  if (mixer) {
    mixer.stopAllAction();
    mixer = null;
  }
  
  animations = [];
}

function calculateModelStats(model: THREE.Group): ModelStats {
  const stats: ModelStats = {
    meshes: 0,
    triangles: 0,
    materials: 0,
    textures: 0,
    animations: animations.length,
    memory: 0,
  };
  
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      stats.meshes++;
      
      const geometry = child.geometry;
      if (geometry.index) {
        stats.triangles += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        stats.triangles += geometry.attributes.position.count / 3;
      }
      
      // Estimate geometry memory
      for (const attr of Object.values(geometry.attributes)) {
        if (attr instanceof THREE.BufferAttribute) {
          stats.memory += attr.array.byteLength;
        }
      }
      if (geometry.index) {
        stats.memory += geometry.index.array.byteLength;
      }
      
      // Collect materials
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (mat) materials.add(mat);
        
        // Collect textures
        if (mat instanceof THREE.MeshStandardMaterial) {
          const texProps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'] as const;
          texProps.forEach((prop) => {
            const tex = mat[prop];
            if (tex) textures.add(tex);
          });
        }
      });
    }
  });
  
  stats.materials = materials.size;
  stats.textures = textures.size;
  
  // Estimate texture memory
  textures.forEach((tex) => {
    if (tex.image) {
      const width = tex.image.width || 256;
      const height = tex.image.height || 256;
      stats.memory += width * height * 4; // RGBA
    }
  });
  
  return stats;
}

function updateStatsDisplay(stats: ModelStats) {
  document.getElementById('stat-meshes')!.textContent = stats.meshes.toString();
  document.getElementById('stat-triangles')!.textContent = formatNumber(stats.triangles);
  document.getElementById('stat-materials')!.textContent = stats.materials.toString();
  document.getElementById('stat-textures')!.textContent = stats.textures.toString();
  document.getElementById('stat-animations')!.textContent = stats.animations.toString();
  document.getElementById('stat-memory')!.textContent = formatBytes(stats.memory);
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatBytes(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function centerModel(model: THREE.Group) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  
  // Center the model
  model.position.sub(center);
  model.position.y += size.y / 2;
  
  // Auto-scale to fit
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 5) {
    const scale = 5 / maxDim;
    model.scale.setScalar(scale);
  }
  
  // Position camera
  const distance = Math.max(size.x, size.y, size.z) * 2;
  camera.position.set(distance, distance * 0.6, distance);
  controls.target.set(0, size.y / 4, 0);
  controls.update();
}

async function loadModel(url: string | File) {
  showLoading(true);
  updateProgress(0);
  clearCurrentModel();
  
  try {
    let gltf;
    
    if (url instanceof File) {
      // Load from file
      const arrayBuffer = await url.arrayBuffer();
      gltf = await new Promise<any>((resolve, reject) => {
        gltfLoader.parse(arrayBuffer, '', resolve, reject);
      });
    } else {
      // Load from URL
      gltf = await new Promise<any>((resolve, reject) => {
        gltfLoader.load(
          url,
          resolve,
          (progress) => {
            if (progress.total > 0) {
              updateProgress((progress.loaded / progress.total) * 100);
            }
          },
          reject
        );
      });
    }
    
    currentModel = gltf.scene;
    if (!currentModel) {
      throw new Error('Failed to load model: scene is empty');
    }
    currentModel.name = 'LoadedModel';
    
    // Enable shadows
    currentModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Setup animations
    animations = gltf.animations || [];
    if (animations.length > 0) {
      mixer = new THREE.AnimationMixer(currentModel);
      animations.forEach((clip) => {
        const action = mixer!.clipAction(clip);
        action.play();
      });
    }
    
    centerModel(currentModel);
    scene.add(currentModel);
    
    // Calculate and display stats
    currentStats = calculateModelStats(currentModel);
    updateStatsDisplay(currentStats);
    
  } catch (error) {
    console.error('Error loading model:', error);
    alert('Failed to load model. Please check the console for details.');
  } finally {
    showLoading(false);
  }
}

// ───────────────────────────────────────────────────────────────
// Sample Model Generators
// ───────────────────────────────────────────────────────────────

function createSampleBox(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SampleBox';
  
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  geometry.name = 'BoxGeometry';
  
  const material = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.3,
    metalness: 0.7,
    name: 'BoxMaterial',
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'Box';
  mesh.position.y = 0.5;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  group.add(mesh);
  return group;
}

function createSampleSphere(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SampleSphere';
  
  const geometry = new THREE.SphereGeometry(0.8, 64, 64);
  geometry.name = 'SphereGeometry';
  
  const material = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.1,
    metalness: 0.9,
    name: 'SphereMaterial',
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'Sphere';
  mesh.position.y = 0.8;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  group.add(mesh);
  return group;
}

function createSampleTorusKnot(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SampleTorusKnot';
  
  const geometry = new THREE.TorusKnotGeometry(0.6, 0.2, 128, 32);
  geometry.name = 'TorusKnotGeometry';
  
  const material = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    roughness: 0.2,
    metalness: 0.6,
    name: 'TorusKnotMaterial',
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'TorusKnot';
  mesh.position.y = 1;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  group.add(mesh);
  return group;
}

function createAnimatedCubes(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'AnimatedCubes';
  
  const colors = [0xef4444, 0x22c55e, 0x3b82f6, 0xf59e0b];
  const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  geometry.name = 'CubeGeometry';
  
  colors.forEach((color, i) => {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.5,
      name: `CubeMaterial_${i}`,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `AnimatedCube_${i}`;
    mesh.position.set(
      Math.cos((i / colors.length) * Math.PI * 2) * 1.5,
      0.5,
      Math.sin((i / colors.length) * Math.PI * 2) * 1.5
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.rotationSpeed = 0.5 + Math.random() * 0.5;
    mesh.userData.orbitSpeed = 0.3 + Math.random() * 0.3;
    mesh.userData.orbitOffset = (i / colors.length) * Math.PI * 2;
    
    group.add(mesh);
  });
  
  // Create animation clips
  animations = [];
  const duration = 4;
  
  group.children.forEach((child, i) => {
    const times = [0, duration];
    const rotationValues = [0, 0, 0, Math.PI * 2, Math.PI * 2, Math.PI * 2];
    
    const rotationTrack = new THREE.VectorKeyframeTrack(
      `.children[${i}].rotation`,
      times,
      rotationValues
    );
    
    const clip = new THREE.AnimationClip(`CubeRotation_${i}`, duration, [rotationTrack]);
    animations.push(clip);
  });
  
  return group;
}

function createVehicle(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Vehicle';
  
  // Body
  const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
  bodyGeometry.name = 'VehicleBodyGeometry';
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.3,
    metalness: 0.7,
    name: 'VehicleBodyMaterial',
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.name = 'VehicleBody';
  body.position.y = 0.5;
  body.castShadow = true;
  group.add(body);
  
  // Cabin
  const cabinGeometry = new THREE.BoxGeometry(1, 0.4, 0.8);
  cabinGeometry.name = 'VehicleCabinGeometry';
  const cabinMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e3a5f,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.7,
    name: 'VehicleCabinMaterial',
  });
  const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
  cabin.name = 'VehicleCabin';
  cabin.position.set(-0.2, 0.95, 0);
  cabin.castShadow = true;
  group.add(cabin);
  
  // Wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 24);
  wheelGeometry.name = 'WheelGeometry';
  wheelGeometry.rotateX(Math.PI / 2);
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.8,
    metalness: 0.2,
    name: 'WheelMaterial',
  });
  
  const wheelPositions = [
    { x: 0.7, y: 0.25, z: 0.5 },
    { x: 0.7, y: 0.25, z: -0.5 },
    { x: -0.7, y: 0.25, z: 0.5 },
    { x: -0.7, y: 0.25, z: -0.5 },
  ];
  
  wheelPositions.forEach((pos, i) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.name = `Wheel_${i}`;
    wheel.position.set(pos.x, pos.y, pos.z);
    wheel.castShadow = true;
    group.add(wheel);
  });
  
  // Headlights
  const headlightGeometry = new THREE.CircleGeometry(0.08, 16);
  headlightGeometry.name = 'HeadlightGeometry';
  const headlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xfef3c7,
    emissiveIntensity: 0.5,
    name: 'HeadlightMaterial',
  });
  
  [-0.3, 0.3].forEach((z, i) => {
    const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight.name = `Headlight_${i}`;
    headlight.position.set(1.01, 0.5, z);
    headlight.rotation.y = Math.PI / 2;
    group.add(headlight);
  });
  
  return group;
}

function loadSampleModel(type: string) {
  clearCurrentModel();
  animations = [];
  
  let model: THREE.Group;
  
  switch (type) {
    case 'box':
      model = createSampleBox();
      break;
    case 'sphere':
      model = createSampleSphere();
      break;
    case 'torus':
      model = createSampleTorusKnot();
      break;
    case 'animated':
      model = createAnimatedCubes();
      // Setup animation mixer
      mixer = new THREE.AnimationMixer(model);
      animations.forEach((clip) => {
        const action = mixer!.clipAction(clip);
        action.play();
      });
      break;
    case 'vehicle':
      model = createVehicle();
      break;
    default:
      return;
  }
  
  currentModel = model;
  centerModel(currentModel);
  scene.add(currentModel);
  
  currentStats = calculateModelStats(currentModel);
  updateStatsDisplay(currentStats);
}

// ───────────────────────────────────────────────────────────────
// Environment
// ───────────────────────────────────────────────────────────────

function setEnvironment(envName: string) {
  const env = ENVIRONMENTS[envName];
  if (!env) return;
  
  scene.background = env.background;
  ambientLight.intensity = env.ambientIntensity;
  directionalLight.intensity = env.directionalIntensity;
  (ground.material as THREE.MeshStandardMaterial).color.setHex(env.groundColor);
  
  // Update button states
  document.querySelectorAll('[id^="env-"]').forEach((btn) => {
    btn.classList.remove('active');
  });
  document.getElementById(`env-${envName}`)?.classList.add('active');
}

// ───────────────────────────────────────────────────────────────
// Display Modes
// ───────────────────────────────────────────────────────────────

let currentDisplayMode = 'shaded';
const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

function setDisplayMode(mode: string) {
  if (!currentModel) return;
  
  currentDisplayMode = mode;
  
  // Update button states
  document.querySelectorAll('[id^="mode-"]').forEach((btn) => {
    btn.classList.remove('active');
  });
  document.getElementById(`mode-${mode}`)?.classList.add('active');
  
  currentModel.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Store original material if not already stored
      if (!originalMaterials.has(child)) {
        originalMaterials.set(child, child.material);
      }
      
      switch (mode) {
        case 'shaded':
          child.material = originalMaterials.get(child)!;
          break;
        case 'wireframe':
          const wireMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            wireframe: true,
          });
          child.material = wireMat;
          break;
        case 'normals':
          const normalMat = new THREE.MeshNormalMaterial();
          child.material = normalMat;
          break;
      }
    }
  });
}

// ───────────────────────────────────────────────────────────────
// 3Lens Integration
// ───────────────────────────────────────────────────────────────

const probe = createProbe({
  appName: '3D Model Viewer',
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setThreeReference(THREE);

probe.initializeTransformGizmo(scene, camera, renderer.domElement, THREE);
probe.initializeCameraController(camera, THREE);

createOverlay(probe);

// ───────────────────────────────────────────────────────────────
// Event Handlers
// ───────────────────────────────────────────────────────────────

// File input
document.getElementById('model-input')!.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    loadModel(file);
  }
});

// Sample models
document.getElementById('sample-models')!.addEventListener('change', (e) => {
  const value = (e.target as HTMLSelectElement).value;
  if (value) {
    loadSampleModel(value);
  }
});

// Environment buttons
document.getElementById('env-studio')!.addEventListener('click', () => setEnvironment('studio'));
document.getElementById('env-outdoor')!.addEventListener('click', () => setEnvironment('outdoor'));
document.getElementById('env-dark')!.addEventListener('click', () => setEnvironment('dark'));

// Display mode buttons
document.getElementById('mode-shaded')!.addEventListener('click', () => setDisplayMode('shaded'));
document.getElementById('mode-wireframe')!.addEventListener('click', () => setDisplayMode('wireframe'));
document.getElementById('mode-normals')!.addEventListener('click', () => setDisplayMode('normals'));

// Animation speed
document.getElementById('anim-speed')!.addEventListener('input', (e) => {
  animationSpeed = parseFloat((e.target as HTMLInputElement).value);
  document.getElementById('anim-speed-value')!.textContent = `${animationSpeed.toFixed(1)}x`;
});

// Model scale
document.getElementById('model-scale')!.addEventListener('input', (e) => {
  const value = parseInt((e.target as HTMLInputElement).value);
  modelScale = value / 100;
  document.getElementById('scale-value')!.textContent = `${value}%`;
  
  if (currentModel) {
    currentModel.scale.setScalar(modelScale);
  }
});

// Center model
document.getElementById('btn-center')!.addEventListener('click', () => {
  if (currentModel) {
    centerModel(currentModel);
  }
});

// Reset view
document.getElementById('btn-reset')!.addEventListener('click', () => {
  camera.position.set(3, 2, 5);
  controls.target.set(0, 0, 0);
  controls.update();
});

// Drag and drop
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('active');
});

document.addEventListener('dragleave', (e) => {
  e.preventDefault();
  if (!e.relatedTarget) {
    dropZone.classList.remove('active');
  }
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('active');
  
  const file = e.dataTransfer?.files[0];
  if (file && (file.name.endsWith('.gltf') || file.name.endsWith('.glb'))) {
    loadModel(file);
  }
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Focus shortcut
window.addEventListener('keydown', (e) => {
  if (e.key === 'f' || e.key === 'F') {
    if (currentModel && !e.ctrlKey && !e.metaKey) {
      centerModel(currentModel);
    }
  }
});

// ───────────────────────────────────────────────────────────────
// Animation Loop
// ───────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  // Update animation mixer
  if (mixer) {
    mixer.update(delta * animationSpeed);
  }
  
  // Animate sample cubes if using animated sample
  if (currentModel?.name === 'AnimatedCubes') {
    const time = clock.getElapsedTime();
    currentModel.children.forEach((child) => {
      if (child.userData.orbitSpeed) {
        const angle = time * child.userData.orbitSpeed + child.userData.orbitOffset;
        child.position.x = Math.cos(angle) * 1.5;
        child.position.z = Math.sin(angle) * 1.5;
        child.rotation.y += delta * child.userData.rotationSpeed * animationSpeed;
      }
    });
  }
  
  controls.update();
  renderer.render(scene, camera);
}

// ───────────────────────────────────────────────────────────────
// Initialize
// ───────────────────────────────────────────────────────────────

// Set initial environment
setEnvironment('outdoor');

// Hide loading overlay
showLoading(false);

// Load default sample
loadSampleModel('box');

// Start animation loop
animate();

console.log('🔍 3D Model Viewer with 3Lens DevTools');
console.log('📦 Drag & drop GLTF/GLB files or select a sample model');
console.log('⌨️ Press Ctrl+Shift+D to toggle devtools');
