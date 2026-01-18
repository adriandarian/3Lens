/**
 * Environment Mapping Debug Example
 * 
 * Demonstrates environment mapping techniques with 3Lens integration.
 * Use 3Lens to inspect:
 * - Environment map textures and resolution
 * - PMREM (Prefiltered Mipmap Radiance Environment Map) settings
 * - IBL (Image-Based Lighting) impact on materials
 * - Material roughness/metalness and envMapIntensity
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// TYPES
// ============================================================================

type EnvType = 'hdr' | 'cubemap' | 'procedural';

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
  // Main reflective sphere (chrome)
  const sphereGeom = new THREE.SphereGeometry(1.2, 128, 128);
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.0,
    metalness: 1.0,
    envMapIntensity: 1.0,
  });
  const mainSphere = new THREE.Mesh(sphereGeom, sphereMaterial);
  mainSphere.name = 'MainSphere_Chrome';
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
    case 'procedural':
      loadProceduralSky();
      break;
  }

  // Update 3Lens metadata
  if (probe) {
    probe.updateLogicalEntity('env-mapping-system', {
      metadata: {
        envType: currentEnvType,
        resolution: envMap?.image?.width || 0,
        format: 'RGBA16F',
        pmremEnabled: true,
      }
    });
  }
}

async function loadProceduralHDR(): Promise<void> {
  // Create a procedural gradient environment with sun
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
        const t = v / 0.5;
        color = skyBlue.map((c, j) => c * (1 - t) + horizon[j] * t);
      } else {
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
  // Create procedural cubemap with distinct face colors
  const size = 512;
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
  const size = 512;
  const data = new Float32Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const v = y / size;

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

  // Apply to scene background and environment
  scene.background = envMap;
  scene.backgroundBlurriness = 0;
  scene.backgroundIntensity = 1.0;
  scene.environment = envMap;

  // Apply environment map to all materials
  sceneObjects.forEach(obj => {
    if (obj.material instanceof THREE.MeshPhysicalMaterial) {
      obj.material.envMap = envMap;
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
      pmremEnabled: true,
    }
  });

  // Register reflective objects with material info
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
        color: `#${mat.color.getHexString()}`,
      }
    });
  });
}

// ============================================================================
// UI SETUP
// ============================================================================

function setupUI(): void {
  // Environment type buttons
  document.querySelectorAll('.env-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.getAttribute('data-type') as EnvType;
      document.querySelectorAll('.env-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.getElementById('loading')!.classList.remove('hidden');
      await loadEnvironment(type);
      document.getElementById('loading')!.classList.add('hidden');
    });
  });

  // Window resize
  window.addEventListener('resize', onWindowResize);
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
