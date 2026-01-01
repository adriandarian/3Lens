/**
 * Environment Mapping Debug Example
 * 
 * Demonstrates environment mapping techniques with 3Lens integration:
 * - HDR environment maps
 * - Cubemap generation and visualization
 * - PMREM (Prefiltered Mipmap Radiance Environment Map)
 * - IBL (Image-Based Lighting) debugging
 * - Fresnel and reflection analysis
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ============================================================================
// TYPES
// ============================================================================

type EnvType = 'hdr' | 'cubemap' | 'equirect' | 'procedural';
type DebugMode = 'normal' | 'diffuse' | 'specular' | 'fresnel' | 'mip' | 'uv';
type MaterialPreset = 'chrome' | 'gold' | 'plastic' | 'glass';

interface MaterialConfig {
  color: number;
  roughness: number;
  metalness: number;
  ior: number;
  transmission: number;
  envMapIntensity: number;
}

// ============================================================================
// MATERIAL PRESETS
// ============================================================================

const MATERIAL_PRESETS: Record<MaterialPreset, MaterialConfig> = {
  chrome: {
    color: 0xffffff,
    roughness: 0.0,
    metalness: 1.0,
    ior: 2.5,
    transmission: 0,
    envMapIntensity: 1.0,
  },
  gold: {
    color: 0xffd700,
    roughness: 0.2,
    metalness: 1.0,
    ior: 0.47,
    transmission: 0,
    envMapIntensity: 1.0,
  },
  plastic: {
    color: 0xff6b6b,
    roughness: 0.4,
    metalness: 0.0,
    ior: 1.5,
    transmission: 0,
    envMapIntensity: 0.5,
  },
  glass: {
    color: 0xffffff,
    roughness: 0.0,
    metalness: 0.0,
    ior: 1.5,
    transmission: 1.0,
    envMapIntensity: 1.0,
  },
};

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;
let pmremGenerator: THREE.PMREMGenerator;

// Environment
let envMap: THREE.Texture | null = null;
let currentEnvType: EnvType = 'hdr';
let envIntensity = 1.0;
let envRotation = 0;
let envBlur = 0;
let showBackground = true;
let autoRotate = true;

// Debug
let debugMode: DebugMode = 'normal';
let debugMipLevel = 0;

// Materials
let currentPreset: MaterialPreset = 'chrome';
let mainSphere: THREE.Mesh;
let sphereMaterial: THREE.MeshPhysicalMaterial;

// Scene objects
const sceneObjects: THREE.Mesh[] = [];

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init(): Promise<void> {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.getElementById('app')!.appendChild(renderer.domElement);

  // PMREM Generator for IBL
  pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2;
  controls.maxDistance = 15;

  // Create scene
  createSceneObjects();

  // Load initial environment
  await loadEnvironment('hdr');

  // Initialize 3Lens
  initProbe();

  // Setup UI
  setupUI();

  // Hide loading
  document.getElementById('loading')!.classList.add('hidden');

  // Event listeners
  window.addEventListener('resize', onWindowResize);

  // Start animation
  animate();
}

function createSceneObjects(): void {
  // Main reflective sphere
  const sphereGeom = new THREE.SphereGeometry(1.2, 128, 128);
  sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: MATERIAL_PRESETS.chrome.color,
    roughness: MATERIAL_PRESETS.chrome.roughness,
    metalness: MATERIAL_PRESETS.chrome.metalness,
    envMapIntensity: MATERIAL_PRESETS.chrome.envMapIntensity,
  });
  mainSphere = new THREE.Mesh(sphereGeom, sphereMaterial);
  mainSphere.name = 'MainSphere';
  scene.add(mainSphere);
  sceneObjects.push(mainSphere);

  // Surrounding smaller spheres with varying roughness
  const smallSphereGeom = new THREE.SphereGeometry(0.3, 64, 64);
  const roughnessValues = [0, 0.25, 0.5, 0.75, 1.0];
  const radius = 2.5;

  roughnessValues.forEach((roughness, i) => {
    const angle = (i / roughnessValues.length) * Math.PI * 2;
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness,
      metalness: 1.0,
      envMapIntensity: 1.0,
    });
    const mesh = new THREE.Mesh(smallSphereGeom, mat);
    mesh.position.x = Math.cos(angle) * radius;
    mesh.position.z = Math.sin(angle) * radius;
    mesh.name = `RoughnessSphere_${roughness.toFixed(2)}`;
    scene.add(mesh);
    sceneObjects.push(mesh);
  });

  // Ground plane for reflections
  const groundGeom = new THREE.PlaneGeometry(20, 20);
  const groundMat = new THREE.MeshPhysicalMaterial({
    color: 0x333333,
    roughness: 0.8,
    metalness: 0.2,
    envMapIntensity: 0.5,
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;
  ground.name = 'Ground';
  scene.add(ground);
  sceneObjects.push(ground);

  // Torus knot for complex reflections
  const knotGeom = new THREE.TorusKnotGeometry(0.4, 0.15, 128, 32);
  const knotMat = new THREE.MeshPhysicalMaterial({
    color: 0x8b5cf6,
    roughness: 0.1,
    metalness: 0.9,
    envMapIntensity: 1.0,
  });
  const knot = new THREE.Mesh(knotGeom, knotMat);
  knot.position.set(-2, 0.5, -1);
  knot.name = 'TorusKnot';
  scene.add(knot);
  sceneObjects.push(knot);

  // Box for edge reflections
  const boxGeom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const boxMat = new THREE.MeshPhysicalMaterial({
    color: 0x22c55e,
    roughness: 0.3,
    metalness: 0.7,
    envMapIntensity: 1.0,
  });
  const box = new THREE.Mesh(boxGeom, boxMat);
  box.position.set(2, 0.3, -1);
  box.rotation.y = Math.PI / 4;
  box.name = 'ReflectiveBox';
  scene.add(box);
  sceneObjects.push(box);
}

async function loadEnvironment(type: EnvType): Promise<void> {
  currentEnvType = type;

  switch (type) {
    case 'hdr':
      await loadProceduralHDR();
      break;
    case 'cubemap':
      loadProceduralCubemap();
      break;
    case 'equirect':
      await loadProceduralHDR(); // Same as HDR for demo
      break;
    case 'procedural':
      loadProceduralSky();
      break;
  }

  updateCubemapPreviews();
  updateStats();
}

async function loadProceduralHDR(): Promise<void> {
  // Create a procedural gradient environment
  const size = 1024;
  const data = new Float32Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // Spherical coordinates
      const u = x / size;
      const v = y / size;
      const phi = u * Math.PI * 2;
      const theta = v * Math.PI;

      // Sky gradient
      const skyBlue = [0.4, 0.6, 1.0];
      const horizon = [0.8, 0.7, 0.6];
      const ground = [0.2, 0.15, 0.1];

      let color: number[];
      if (v < 0.5) {
        // Sky to horizon
        const t = v / 0.5;
        color = skyBlue.map((c, j) => c * (1 - t) + horizon[j] * t);
      } else {
        // Horizon to ground
        const t = (v - 0.5) / 0.5;
        color = horizon.map((c, j) => c * (1 - t) + ground[j] * t);
      }

      // Add sun
      const sunDir = new THREE.Vector3(0.5, 0.3, 0.5).normalize();
      const dir = new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi),
        Math.cos(theta),
        Math.sin(theta) * Math.sin(phi)
      );
      const sunDot = Math.max(0, dir.dot(sunDir));
      const sunIntensity = Math.pow(sunDot, 500) * 50 + Math.pow(sunDot, 50) * 2;

      data[i] = color[0] + sunIntensity;
      data[i + 1] = color[1] + sunIntensity * 0.9;
      data[i + 2] = color[2] + sunIntensity * 0.7;
      data[i + 3] = 1;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;

  envMap = pmremGenerator.fromEquirectangular(texture).texture;
  texture.dispose();

  applyEnvironment();
}

function loadProceduralCubemap(): void {
  // Create procedural cubemap
  const size = 512;
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(size);
  
  // Generate simple gradient cubemap
  const colors = [
    [1.0, 0.5, 0.5], // +X red
    [0.5, 1.0, 0.5], // -X green  
    [0.5, 0.5, 1.0], // +Y blue (sky)
    [0.3, 0.2, 0.1], // -Y brown (ground)
    [1.0, 1.0, 0.5], // +Z yellow
    [0.5, 1.0, 1.0], // -Z cyan
  ];

  const faces = [];
  for (let face = 0; face < 6; face++) {
    const data = new Uint8Array(size * size * 4);
    const color = colors[face];
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        // Add some gradient variation
        const u = x / size;
        const v = y / size;
        const variation = 0.3 * (Math.sin(u * 10) * Math.cos(v * 10) + 1) / 2;
        
        data[i] = Math.min(255, (color[0] + variation) * 200);
        data[i + 1] = Math.min(255, (color[1] + variation) * 200);
        data[i + 2] = Math.min(255, (color[2] + variation) * 200);
        data[i + 3] = 255;
      }
    }
    
    const texture = new THREE.DataTexture(data, size, size);
    texture.needsUpdate = true;
    faces.push(texture);
  }

  const cubeTexture = new THREE.CubeTexture(faces.map(f => f.image));
  cubeTexture.needsUpdate = true;
  
  envMap = pmremGenerator.fromCubemap(cubeTexture as any).texture;
  applyEnvironment();
}

function loadProceduralSky(): void {
  // Simple procedural sky
  const size = 512;
  const data = new Float32Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const v = y / size;

      // Simple sky gradient
      const topColor = [0.1, 0.3, 0.8];
      const bottomColor = [0.7, 0.8, 1.0];
      
      data[i] = topColor[0] * (1 - v) + bottomColor[0] * v;
      data[i + 1] = topColor[1] * (1 - v) + bottomColor[1] * v;
      data[i + 2] = topColor[2] * (1 - v) + bottomColor[2] * v;
      data[i + 3] = 1;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;

  envMap = pmremGenerator.fromEquirectangular(texture).texture;
  texture.dispose();

  applyEnvironment();
}

function applyEnvironment(): void {
  if (!envMap) return;

  // Apply to scene background
  if (showBackground) {
    scene.background = envMap;
    scene.backgroundBlurriness = envBlur;
    scene.backgroundIntensity = envIntensity;
  } else {
    scene.background = new THREE.Color(0x111111);
  }

  // Apply environment map to all materials
  scene.environment = envMap;

  sceneObjects.forEach(obj => {
    if (obj.material instanceof THREE.MeshPhysicalMaterial) {
      obj.material.envMap = envMap;
      obj.material.envMapIntensity = envIntensity;
      obj.material.needsUpdate = true;
    }
  });
}

function initProbe(): void {
  probe = createProbe({ appName: 'Environment-Mapping' });
  createOverlay({ probe, theme: 'dark' });

  // Register environment system
  probe.registerLogicalEntity({
    id: 'env-mapping-system',
    name: 'Environment Mapping System',
    type: 'environment',
    object3D: scene,
    metadata: {
      envType: currentEnvType,
      resolution: envMap?.image?.width || 0,
      format: 'RGBA16F',
    }
  });

  // Register reflective objects
  sceneObjects.forEach((obj, i) => {
    const mat = obj.material as THREE.MeshPhysicalMaterial;
    probe.registerLogicalEntity({
      id: `reflective-obj-${i}`,
      name: obj.name || `ReflectiveObject_${i}`,
      type: 'reflective-surface',
      object3D: obj,
      metadata: {
        roughness: mat.roughness,
        metalness: mat.metalness,
        envMapIntensity: mat.envMapIntensity,
      }
    });
  });
}

// ============================================================================
// UI SETUP
// ============================================================================

function setupUI(): void {
  // Environment type buttons
  document.querySelectorAll('.env-type-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.getAttribute('data-type') as EnvType;
      document.querySelectorAll('.env-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.getElementById('loading')!.classList.remove('hidden');
      await loadEnvironment(type);
      document.getElementById('loading')!.classList.add('hidden');
    });
  });

  // Intensity slider
  const intensitySlider = document.getElementById('intensity-slider') as HTMLInputElement;
  intensitySlider.addEventListener('input', () => {
    envIntensity = parseInt(intensitySlider.value) / 100;
    document.getElementById('intensity-value')!.textContent = envIntensity.toFixed(1);
    applyEnvironment();
  });

  // Rotation slider
  const rotationSlider = document.getElementById('rotation-slider') as HTMLInputElement;
  rotationSlider.addEventListener('input', () => {
    envRotation = parseInt(rotationSlider.value);
    document.getElementById('rotation-value')!.textContent = `${envRotation}°`;
    scene.rotation.y = THREE.MathUtils.degToRad(envRotation);
  });

  // Blur slider
  const blurSlider = document.getElementById('blur-slider') as HTMLInputElement;
  blurSlider.addEventListener('input', () => {
    envBlur = parseInt(blurSlider.value) / 100;
    document.getElementById('blur-value')!.textContent = `${Math.round(envBlur * 100)}%`;
    scene.backgroundBlurriness = envBlur;
  });

  // Background toggle
  document.getElementById('bg-toggle')!.addEventListener('click', (e) => {
    const toggle = e.currentTarget as HTMLElement;
    showBackground = !showBackground;
    toggle.classList.toggle('active', showBackground);
    applyEnvironment();
  });

  // Auto-rotate toggle
  document.getElementById('rotate-toggle')!.addEventListener('click', (e) => {
    const toggle = e.currentTarget as HTMLElement;
    autoRotate = !autoRotate;
    toggle.classList.toggle('active', autoRotate);
  });

  // Debug mode buttons
  document.querySelectorAll('.debug-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode') as DebugMode;
      document.querySelectorAll('.debug-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setDebugMode(mode);
    });
  });

  // Mip level slider
  const mipSlider = document.getElementById('mip-slider') as HTMLInputElement;
  mipSlider.addEventListener('input', () => {
    debugMipLevel = parseInt(mipSlider.value);
    updateDebugMaterial();
  });

  // Material preset buttons
  document.querySelectorAll('.material-sphere').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-material') as MaterialPreset;
      document.querySelectorAll('.material-sphere').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyMaterialPreset(preset);
    });
  });

  // Window resize
  window.addEventListener('resize', onWindowResize);
}

function setDebugMode(mode: DebugMode): void {
  debugMode = mode;
  
  // Show/hide mip slider
  const mipContainer = document.getElementById('mip-container')!;
  mipContainer.style.display = mode === 'mip' ? 'block' : 'none';
  
  updateDebugMaterial();
}

function updateDebugMaterial(): void {
  if (!sphereMaterial) return;

  switch (debugMode) {
    case 'normal':
      // Reset to normal rendering
      sphereMaterial.wireframe = false;
      sphereMaterial.color.setHex(MATERIAL_PRESETS[currentPreset].color);
      break;
    case 'diffuse':
      // Show only diffuse IBL
      sphereMaterial.metalness = 0;
      sphereMaterial.roughness = 1;
      break;
    case 'specular':
      // Show only specular reflection
      sphereMaterial.metalness = 1;
      sphereMaterial.roughness = 0;
      break;
    case 'fresnel':
      // Exaggerate fresnel
      sphereMaterial.metalness = 0;
      sphereMaterial.roughness = 0;
      sphereMaterial.ior = 2.5;
      break;
    case 'mip':
      // Control roughness to show mip levels
      sphereMaterial.roughness = debugMipLevel / 10;
      sphereMaterial.metalness = 1;
      break;
    case 'uv':
      // Show UV debug pattern
      sphereMaterial.wireframe = true;
      break;
  }
  
  sphereMaterial.needsUpdate = true;
  updateReflectionInfo();
}

function applyMaterialPreset(preset: MaterialPreset): void {
  currentPreset = preset;
  const config = MATERIAL_PRESETS[preset];

  sphereMaterial.color.setHex(config.color);
  sphereMaterial.roughness = config.roughness;
  sphereMaterial.metalness = config.metalness;
  sphereMaterial.ior = config.ior;
  sphereMaterial.transmission = config.transmission;
  sphereMaterial.envMapIntensity = config.envMapIntensity;
  sphereMaterial.needsUpdate = true;

  updateReflectionInfo();
}

function updateReflectionInfo(): void {
  document.getElementById('roughness-val')!.textContent = sphereMaterial.roughness.toFixed(2);
  document.getElementById('metalness-val')!.textContent = sphereMaterial.metalness.toFixed(2);
  document.getElementById('ior-val')!.textContent = sphereMaterial.ior.toFixed(2);
  document.getElementById('env-intensity-val')!.textContent = sphereMaterial.envMapIntensity.toFixed(2);
}

function updateCubemapPreviews(): void {
  const faces = ['px', 'py', 'pz', 'nx', 'ny', 'nz'];
  const colors = [
    [255, 128, 128], // +X
    [128, 128, 255], // +Y  
    [255, 255, 128], // +Z
    [128, 255, 128], // -X
    [64, 64, 64],    // -Y
    [128, 255, 255], // -Z
  ];

  faces.forEach((face, i) => {
    const canvas = document.getElementById(`face-${face}`) as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 64;
    canvas.height = 64;

    // Draw gradient representing face
    const gradient = ctx.createLinearGradient(0, 0, 64, 64);
    const c = colors[i];
    gradient.addColorStop(0, `rgb(${c[0]}, ${c[1]}, ${c[2]})`);
    gradient.addColorStop(1, `rgb(${Math.floor(c[0]*0.5)}, ${Math.floor(c[1]*0.5)}, ${Math.floor(c[2]*0.5)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  });
}

function updateStats(): void {
  const resolution = envMap?.image?.width || 1024;
  const mipLevels = Math.log2(resolution) + 1;
  
  // Memory calculation (rough estimate)
  // Cubemap: 6 faces * resolution^2 * 8 bytes (RGBA16F)
  // Plus mip chain (approximately 1.33x)
  const cubemapMem = 6 * resolution * resolution * 8 * 1.33 / (1024 * 1024);
  const irradianceMem = 6 * 32 * 32 * 8 / (1024 * 1024); // Small irradiance map
  const prefilterMem = cubemapMem * 0.33; // Approximate
  const totalMem = cubemapMem + irradianceMem + prefilterMem;

  document.getElementById('resolution')!.textContent = resolution.toString();
  document.getElementById('mip-levels')!.textContent = Math.floor(mipLevels).toString();
  document.getElementById('memory')!.textContent = totalMem.toFixed(1);
  document.getElementById('format')!.textContent = 'RGBA16F';

  document.getElementById('mem-cubemap')!.textContent = `${cubemapMem.toFixed(1)} MB`;
  document.getElementById('mem-irradiance')!.textContent = `${irradianceMem.toFixed(2)} MB`;
  document.getElementById('mem-prefilter')!.textContent = `${prefilterMem.toFixed(1)} MB`;
  document.getElementById('mem-total')!.textContent = `${totalMem.toFixed(1)} MB`;

  // Update memory bar widths
  const total = cubemapMem + irradianceMem + prefilterMem;
  const segments = document.querySelectorAll('.memory-segment');
  if (segments.length >= 3) {
    (segments[0] as HTMLElement).style.width = `${(cubemapMem / total) * 100}%`;
    (segments[1] as HTMLElement).style.width = `${(irradianceMem / total) * 100}%`;
    (segments[2] as HTMLElement).style.width = `${(prefilterMem / total) * 100}%`;
  }
}

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(): void {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;

  // Auto-rotate main sphere
  if (autoRotate) {
    mainSphere.rotation.y = time * 0.3;
  }

  // Animate torus knot
  const knot = scene.getObjectByName('TorusKnot');
  if (knot) {
    knot.rotation.x = time * 0.5;
    knot.rotation.y = time * 0.3;
  }

  // Animate box
  const box = scene.getObjectByName('ReflectiveBox');
  if (box) {
    box.rotation.y = time * 0.2 + Math.PI / 4;
  }

  controls.update();
  renderer.render(scene, camera);
}

// ============================================================================
// START
// ============================================================================

init();
