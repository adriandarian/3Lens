import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  EffectComposer,
  EffectPass,
  RenderPass,
  BloomEffect,
  VignetteEffect,
  ChromaticAberrationEffect,
  NoiseEffect,
  BlendFunction,
  ToneMappingEffect,
  ToneMappingMode,
  SMAAEffect,
  SMAAPreset,
  DepthOfFieldEffect,
  BrightnessContrastEffect,
  HueSaturationEffect,
} from 'postprocessing';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ───────────────────────────────────────────────────────────────
// Scene Setup
// ───────────────────────────────────────────────────────────────

const container = document.getElementById('canvas-container')!;

// Scene
const scene = new THREE.Scene();
scene.name = 'PostProcessingScene';
scene.background = new THREE.Color(0x0a0e14);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.name = 'MainCamera';
camera.position.set(8, 6, 12);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ 
  antialias: false, // We'll use SMAA/FXAA
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);

// ───────────────────────────────────────────────────────────────
// Lighting
// ───────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffeedd, 1.5);
directionalLight.name = 'SunLight';
directionalLight.position.set(10, 15, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
directionalLight.shadow.bias = -0.001;
scene.add(directionalLight);

// Rim light
const rimLight = new THREE.DirectionalLight(0x66aaff, 0.5);
rimLight.name = 'RimLight';
rimLight.position.set(-5, 5, -10);
scene.add(rimLight);

// Point lights for bloom demonstration
const pointLight1 = new THREE.PointLight(0xff6600, 3, 10);
pointLight1.name = 'OrangeLight';
pointLight1.position.set(-3, 2, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00ff88, 3, 10);
pointLight2.name = 'GreenLight';
pointLight2.position.set(3, 2, -2);
scene.add(pointLight2);

// Light helpers
const lightSphere1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xff6600 })
);
lightSphere1.name = 'OrangeLightSphere';
lightSphere1.position.copy(pointLight1.position);
scene.add(lightSphere1);

const lightSphere2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0x00ff88 })
);
lightSphere2.name = 'GreenLightSphere';
lightSphere2.position.copy(pointLight2.position);
scene.add(lightSphere2);

// ───────────────────────────────────────────────────────────────
// Scene Objects
// ───────────────────────────────────────────────────────────────

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(30, 30);
groundGeometry.name = 'GroundGeometry';
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1a2e,
  roughness: 0.8,
  metalness: 0.2,
  name: 'GroundMaterial',
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.name = 'Ground';
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid
const gridHelper = new THREE.GridHelper(30, 30, 0x333355, 0x222244);
gridHelper.name = 'GridHelper';
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Central pedestal
const pedestalGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 32);
pedestalGeometry.name = 'PedestalGeometry';
const pedestalMaterial = new THREE.MeshStandardMaterial({
  color: 0x333344,
  roughness: 0.3,
  metalness: 0.8,
  name: 'PedestalMaterial',
});
const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
pedestal.name = 'Pedestal';
pedestal.position.y = 0.25;
pedestal.castShadow = true;
pedestal.receiveShadow = true;
scene.add(pedestal);

// Hero object - reflective sphere
const heroSphereGeometry = new THREE.SphereGeometry(1.2, 64, 64);
heroSphereGeometry.name = 'HeroSphereGeometry';
const heroSphereMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.1,
  metalness: 0.9,
  envMapIntensity: 1,
  name: 'HeroSphereMaterial',
});
const heroSphere = new THREE.Mesh(heroSphereGeometry, heroSphereMaterial);
heroSphere.name = 'HeroSphere';
heroSphere.position.y = 1.7;
heroSphere.castShadow = true;
scene.add(heroSphere);

// Orbiting objects
const orbitGroup = new THREE.Group();
orbitGroup.name = 'OrbitGroup';
scene.add(orbitGroup);

const orbitColors = [0xef4444, 0x22c55e, 0x3b82f6, 0xf59e0b, 0x8b5cf6];
for (let i = 0; i < 5; i++) {
  const angle = (i / 5) * Math.PI * 2;
  const radius = 4;
  
  const orbitCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.MeshStandardMaterial({
      color: orbitColors[i],
      roughness: 0.3,
      metalness: 0.7,
      emissive: orbitColors[i],
      emissiveIntensity: 0.2,
    })
  );
  orbitCube.name = `OrbitCube_${i}`;
  orbitCube.position.set(
    Math.cos(angle) * radius,
    1.5 + Math.sin(i * 1.5) * 0.5,
    Math.sin(angle) * radius
  );
  orbitCube.castShadow = true;
  orbitGroup.add(orbitCube);
}

// Pillars
const pillarMaterial = new THREE.MeshStandardMaterial({
  color: 0x444466,
  roughness: 0.4,
  metalness: 0.6,
});

for (let i = 0; i < 6; i++) {
  const angle = (i / 6) * Math.PI * 2;
  const radius = 8;
  
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.4, 4, 16),
    pillarMaterial
  );
  pillar.name = `Pillar_${i}`;
  pillar.position.set(
    Math.cos(angle) * radius,
    2,
    Math.sin(angle) * radius
  );
  pillar.castShadow = true;
  pillar.receiveShadow = true;
  scene.add(pillar);
  
  // Top sphere
  const topSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x222244,
      emissiveIntensity: 0.3,
    })
  );
  topSphere.name = `PillarTop_${i}`;
  topSphere.position.set(
    Math.cos(angle) * radius,
    4.2,
    Math.sin(angle) * radius
  );
  topSphere.castShadow = true;
  scene.add(topSphere);
}

// Torus knot for visual interest
const torusKnotGeometry = new THREE.TorusKnotGeometry(0.8, 0.25, 128, 32);
torusKnotGeometry.name = 'TorusKnotGeometry';
const torusKnotMaterial = new THREE.MeshStandardMaterial({
  color: 0x8866ff,
  roughness: 0.2,
  metalness: 0.8,
  emissive: 0x4422aa,
  emissiveIntensity: 0.3,
  name: 'TorusKnotMaterial',
});
const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
torusKnot.name = 'TorusKnot';
torusKnot.position.set(-5, 2, -4);
torusKnot.castShadow = true;
scene.add(torusKnot);

// ───────────────────────────────────────────────────────────────
// Post-Processing Setup
// ───────────────────────────────────────────────────────────────

const composer = new EffectComposer(renderer);

// Render pass
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Effects
const bloomEffect = new BloomEffect({
  intensity: 1.0,
  luminanceThreshold: 0.8,
  luminanceSmoothing: 0.075,
  mipmapBlur: true,
});

const vignetteEffect = new VignetteEffect({
  darkness: 0.5,
  offset: 0.3,
});

const chromaticAberrationEffect = new ChromaticAberrationEffect({
  offset: new THREE.Vector2(0.002, 0.002),
  radialModulation: false,
  modulationOffset: 0.15,
});

const noiseEffect = new NoiseEffect({
  blendFunction: BlendFunction.OVERLAY,
});
noiseEffect.blendMode.opacity.value = 0.15;

const toneMappingEffect = new ToneMappingEffect({
  mode: ToneMappingMode.ACES_FILMIC,
});

const smaaEffect = new SMAAEffect({
  preset: SMAAPreset.HIGH,
});

const dofEffect = new DepthOfFieldEffect(camera, {
  focusDistance: 0.05,
  focalLength: 0.1,
  bokehScale: 3,
});

const brightnessContrastEffect = new BrightnessContrastEffect({
  brightness: 0,
  contrast: 0,
});

const hueSaturationEffect = new HueSaturationEffect({
  saturation: 0,
});

// Create effect passes
const bloomPass = new EffectPass(camera, bloomEffect);
const vignettePass = new EffectPass(camera, vignetteEffect);
const chromaticPass = new EffectPass(camera, chromaticAberrationEffect);
const noisePass = new EffectPass(camera, noiseEffect);
const toneMappingPass = new EffectPass(camera, toneMappingEffect);
const smaaPass = new EffectPass(camera, smaaEffect);
const dofPass = new EffectPass(camera, dofEffect);
const colorGradePass = new EffectPass(camera, brightnessContrastEffect, hueSaturationEffect);

// Track effects state
interface EffectState {
  enabled: boolean;
  pass: EffectPass;
  name: string;
  estimatedTime: number;
}

const effects: Record<string, EffectState> = {
  bloom: { enabled: true, pass: bloomPass, name: 'Bloom', estimatedTime: 0.8 },
  ssao: { enabled: false, pass: null!, name: 'SSAO', estimatedTime: 2.1 }, // SSAO would need N8AO
  dof: { enabled: false, pass: dofPass, name: 'DoF', estimatedTime: 1.2 },
  vignette: { enabled: true, pass: vignettePass, name: 'Vignette', estimatedTime: 0.1 },
  chromatic: { enabled: false, pass: chromaticPass, name: 'Chromatic', estimatedTime: 0.2 },
  noise: { enabled: false, pass: noisePass, name: 'Noise', estimatedTime: 0.1 },
  colorgrade: { enabled: true, pass: colorGradePass, name: 'Color Grade', estimatedTime: 0.2 },
  fxaa: { enabled: true, pass: smaaPass, name: 'SMAA', estimatedTime: 0.3 },
};

// Initial composer setup
function rebuildComposer() {
  // Remove all passes
  while (composer.passes.length > 0) {
    composer.removePass(composer.passes[0]);
  }
  
  // Add render pass first
  composer.addPass(renderPass);
  
  // Add enabled effects in order
  if (effects.bloom.enabled) composer.addPass(bloomPass);
  if (effects.dof.enabled) composer.addPass(dofPass);
  if (effects.vignette.enabled) composer.addPass(vignettePass);
  if (effects.chromatic.enabled) composer.addPass(chromaticPass);
  if (effects.noise.enabled) composer.addPass(noisePass);
  if (effects.colorgrade.enabled) composer.addPass(colorGradePass);
  composer.addPass(toneMappingPass);
  if (effects.fxaa.enabled) composer.addPass(smaaPass);
}

rebuildComposer();

// ───────────────────────────────────────────────────────────────
// 3Lens Integration
// ───────────────────────────────────────────────────────────────

const probe = createProbe({
  appName: 'Post-Processing Analyzer',
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setThreeReference(THREE);

probe.initializeTransformGizmo(scene, camera, renderer.domElement, THREE);
probe.initializeCameraController(camera, THREE);

createOverlay(probe);

// ───────────────────────────────────────────────────────────────
// Presets
// ───────────────────────────────────────────────────────────────

interface Preset {
  bloom: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  dof: boolean;
  dofFocus: number;
  dofAperture: number;
  vignette: boolean;
  vignetteDarkness: number;
  chromatic: boolean;
  chromaticOffset: number;
  noise: boolean;
  noiseIntensity: number;
  colorgrade: boolean;
  saturation: number;
  contrast: number;
  brightness: number;
  fxaa: boolean;
}

const presets: Record<string, Preset> = {
  cinematic: {
    bloom: true, bloomIntensity: 1.0, bloomThreshold: 0.8,
    dof: false, dofFocus: 5, dofAperture: 2.8,
    vignette: true, vignetteDarkness: 0.5,
    chromatic: false, chromaticOffset: 0.002,
    noise: false, noiseIntensity: 0.15,
    colorgrade: true, saturation: 0.1, contrast: 0.1, brightness: 0,
    fxaa: true,
  },
  retro: {
    bloom: true, bloomIntensity: 0.5, bloomThreshold: 0.6,
    dof: false, dofFocus: 5, dofAperture: 2.8,
    vignette: true, vignetteDarkness: 0.7,
    chromatic: true, chromaticOffset: 0.005,
    noise: true, noiseIntensity: 0.25,
    colorgrade: true, saturation: -0.3, contrast: 0.2, brightness: -0.05,
    fxaa: true,
  },
  dream: {
    bloom: true, bloomIntensity: 2.0, bloomThreshold: 0.4,
    dof: true, dofFocus: 5, dofAperture: 1.4,
    vignette: true, vignetteDarkness: 0.3,
    chromatic: true, chromaticOffset: 0.003,
    noise: false, noiseIntensity: 0.1,
    colorgrade: true, saturation: 0.2, contrast: -0.1, brightness: 0.1,
    fxaa: true,
  },
  noir: {
    bloom: true, bloomIntensity: 0.8, bloomThreshold: 0.9,
    dof: false, dofFocus: 5, dofAperture: 2.8,
    vignette: true, vignetteDarkness: 0.8,
    chromatic: false, chromaticOffset: 0.002,
    noise: true, noiseIntensity: 0.2,
    colorgrade: true, saturation: -1.0, contrast: 0.3, brightness: -0.1,
    fxaa: true,
  },
  vibrant: {
    bloom: true, bloomIntensity: 1.5, bloomThreshold: 0.7,
    dof: false, dofFocus: 5, dofAperture: 2.8,
    vignette: false, vignetteDarkness: 0.3,
    chromatic: false, chromaticOffset: 0.002,
    noise: false, noiseIntensity: 0.1,
    colorgrade: true, saturation: 0.4, contrast: 0.15, brightness: 0.05,
    fxaa: true,
  },
  minimal: {
    bloom: false, bloomIntensity: 1.0, bloomThreshold: 0.8,
    dof: false, dofFocus: 5, dofAperture: 2.8,
    vignette: false, vignetteDarkness: 0.5,
    chromatic: false, chromaticOffset: 0.002,
    noise: false, noiseIntensity: 0.15,
    colorgrade: false, saturation: 0, contrast: 0, brightness: 0,
    fxaa: true,
  },
};

function applyPreset(name: string) {
  const preset = presets[name];
  if (!preset) return;
  
  // Update effect states
  effects.bloom.enabled = preset.bloom;
  effects.dof.enabled = preset.dof;
  effects.vignette.enabled = preset.vignette;
  effects.chromatic.enabled = preset.chromatic;
  effects.noise.enabled = preset.noise;
  effects.colorgrade.enabled = preset.colorgrade;
  effects.fxaa.enabled = preset.fxaa;
  
  // Update effect parameters
  bloomEffect.intensity = preset.bloomIntensity;
  bloomEffect.luminanceMaterial.threshold = preset.bloomThreshold;
  
  vignetteEffect.darkness = preset.vignetteDarkness;
  
  chromaticAberrationEffect.offset.set(preset.chromaticOffset, preset.chromaticOffset);
  
  noiseEffect.blendMode.opacity.value = preset.noiseIntensity;
  
  hueSaturationEffect.saturation = preset.saturation;
  brightnessContrastEffect.contrast = preset.contrast;
  brightnessContrastEffect.brightness = preset.brightness;
  
  // Update UI
  updateUIFromState();
  rebuildComposer();
}

// ───────────────────────────────────────────────────────────────
// UI Updates
// ───────────────────────────────────────────────────────────────

function updateUIFromState() {
  // Update toggles
  Object.entries(effects).forEach(([key, state]) => {
    const toggle = document.getElementById(`toggle-${key}`);
    if (toggle) {
      toggle.classList.toggle('active', state.enabled);
      toggle.closest('.effect-item')?.classList.toggle('disabled', !state.enabled);
    }
  });
  
  // Update sliders
  updateSlider('bloom-intensity', bloomEffect.intensity);
  updateSlider('bloom-threshold', bloomEffect.luminanceMaterial.threshold);
  updateSlider('vignette-darkness', vignetteEffect.darkness);
  updateSlider('chromatic-offset', chromaticAberrationEffect.offset.x);
  updateSlider('noise-intensity', noiseEffect.blendMode.opacity.value);
  updateSlider('saturation', hueSaturationEffect.saturation);
  updateSlider('contrast', brightnessContrastEffect.contrast);
  updateSlider('brightness', brightnessContrastEffect.brightness);
}

function updateSlider(id: string, value: number) {
  const slider = document.getElementById(id) as HTMLInputElement;
  const valueEl = document.getElementById(`${id}-value`);
  if (slider) slider.value = String(value);
  if (valueEl) valueEl.textContent = value.toFixed(value < 0.1 ? 3 : value < 1 ? 2 : 1);
}

// ───────────────────────────────────────────────────────────────
// UI Event Handlers
// ───────────────────────────────────────────────────────────────

// Effect toggles
Object.keys(effects).forEach(key => {
  const toggle = document.getElementById(`toggle-${key}`);
  if (toggle) {
    toggle.addEventListener('click', () => {
      if (key === 'ssao') return; // SSAO not implemented
      
      effects[key].enabled = !effects[key].enabled;
      toggle.classList.toggle('active', effects[key].enabled);
      toggle.closest('.effect-item')?.classList.toggle('disabled', !effects[key].enabled);
      rebuildComposer();
    });
  }
});

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = (btn as HTMLElement).dataset.preset;
    if (preset) {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyPreset(preset);
    }
  });
});

// Parameter sliders
document.getElementById('bloom-intensity')?.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  bloomEffect.intensity = value;
  document.getElementById('bloom-intensity-value')!.textContent = value.toFixed(1);
});

document.getElementById('bloom-threshold')?.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  bloomEffect.luminanceMaterial.threshold = value;
  document.getElementById('bloom-threshold-value')!.textContent = value.toFixed(2);
});

document.getElementById('dof-focus')?.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  dofEffect.cocMaterial.uniforms.focusDistance.value = value / 100;
  document.getElementById('dof-focus-value')!.textContent = value.toFixed(1);
});

document.getElementById('dof-aperture')?.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  dofEffect.cocMaterial.uniforms.focalLength.value = 1 / value;
  document.getElementById('dof-aperture-value')!.textContent = `f/${value.toFixed(1)}`;
});

document.getElementById('vignette-darkness')?.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  vignetteEffect.darkness = value;
  document.getElementById('vignette-darkness-value')!.textContent = value.toFixed(2);
});

document.getElementById('chromatic-offset')?.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  chromaticAberrationEffect.offset.set(value, value);
  document.getElementById('chromatic-offset-value')!.textContent = value.toFixed(4);
});

document.getElementById('noise-intensity')?.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  noiseEffect.blendMode.opacity.value = value;
  document.getElementById('noise-intensity-value')!.textContent = value.toFixed(2);
});

document.getElementById('saturation')?.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  hueSaturationEffect.saturation = value - 1;
  document.getElementById('saturation-value')!.textContent = value.toFixed(2);
});

document.getElementById('contrast')?.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  brightnessContrastEffect.contrast = value - 1;
  document.getElementById('contrast-value')!.textContent = value.toFixed(2);
});

document.getElementById('brightness')?.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  brightnessContrastEffect.brightness = value;
  document.getElementById('brightness-value')!.textContent = value.toFixed(2);
});

// View mode buttons
let currentView = 'final';
let bypassEffects = false;

document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = (btn as HTMLElement).dataset.view;
    if (!view) return;
    
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = view;
    
    const comparisonContainer = document.getElementById('comparison-container')!;
    
    if (view === 'compare') {
      comparisonContainer.classList.add('visible');
    } else {
      comparisonContainer.classList.remove('visible');
    }
    
    bypassEffects = view === 'scene';
  });
});

// ───────────────────────────────────────────────────────────────
// Keyboard Shortcuts
// ───────────────────────────────────────────────────────────────

const effectKeys = ['bloom', 'ssao', 'dof', 'vignette', 'chromatic', 'noise', 'colorgrade', 'fxaa'];

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  
  // Number keys 1-8 toggle effects
  const num = parseInt(e.key);
  if (num >= 1 && num <= 8) {
    const key = effectKeys[num - 1];
    const toggle = document.getElementById(`toggle-${key}`);
    if (toggle && key !== 'ssao') toggle.click();
    return;
  }
  
  switch (e.code) {
    case 'Space':
      e.preventDefault();
      // Toggle all effects
      const anyEnabled = Object.values(effects).some(e => e.enabled);
      Object.keys(effects).forEach(key => {
        if (key !== 'ssao') {
          effects[key].enabled = !anyEnabled;
        }
      });
      updateUIFromState();
      rebuildComposer();
      break;
    case 'KeyC':
      document.querySelector('[data-view="compare"]')?.dispatchEvent(new Event('click'));
      break;
  }
});

// ───────────────────────────────────────────────────────────────
// Stats Update
// ───────────────────────────────────────────────────────────────

let frameCount = 0;
let lastTime = performance.now();
let fps = 60;
let postProcessTime = 0;

function updateStats() {
  frameCount++;
  const now = performance.now();
  const elapsed = now - lastTime;
  
  if (elapsed >= 500) {
    fps = Math.round((frameCount / elapsed) * 1000);
    frameCount = 0;
    lastTime = now;
  }
  
  // Count active effects and passes
  const activeEffects = Object.values(effects).filter(e => e.enabled).length;
  const totalPasses = composer.passes.length;
  const estimatedTime = Object.values(effects)
    .filter(e => e.enabled)
    .reduce((sum, e) => sum + e.estimatedTime, 0);
  
  // Update stats display
  const fpsEl = document.getElementById('stat-fps')!;
  fpsEl.textContent = fps.toString();
  fpsEl.className = `stat-value ${fps >= 55 ? 'good' : fps >= 30 ? 'warn' : 'bad'}`;
  
  document.getElementById('stat-frametime')!.textContent = `${(1000 / fps).toFixed(2)}ms`;
  
  const postEl = document.getElementById('stat-postprocess')!;
  postEl.textContent = `~${estimatedTime.toFixed(1)}ms`;
  postEl.className = `stat-value ${estimatedTime < 3 ? 'good' : estimatedTime < 6 ? 'warn' : 'bad'}`;
  
  document.getElementById('stat-effects')!.textContent = activeEffects.toString();
  document.getElementById('stat-rendertargets')!.textContent = (activeEffects * 2).toString();
  document.getElementById('stat-passes')!.textContent = totalPasses.toString();
  
  // Update pass list
  const passList = document.getElementById('pass-list')!;
  passList.innerHTML = Object.entries(effects)
    .filter(([_, state]) => state.enabled)
    .map(([_, state]) => `
      <div class="pass-item">
        <span class="pass-name">${state.name}</span>
        <span class="pass-time">~${state.estimatedTime.toFixed(1)}ms</span>
      </div>
    `).join('');
}

// ───────────────────────────────────────────────────────────────
// Depth/Normal Debug Materials
// ───────────────────────────────────────────────────────────────

const depthMaterial = new THREE.MeshDepthMaterial({
  depthPacking: THREE.BasicDepthPacking,
});

const normalMaterial = new THREE.MeshNormalMaterial();

// ───────────────────────────────────────────────────────────────
// Window Resize
// ───────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ───────────────────────────────────────────────────────────────
// Animation Loop
// ───────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const elapsed = clock.getElapsedTime();
  
  // Animate objects
  heroSphere.rotation.y = elapsed * 0.3;
  orbitGroup.rotation.y = elapsed * 0.2;
  torusKnot.rotation.x = elapsed * 0.5;
  torusKnot.rotation.y = elapsed * 0.3;
  
  // Animate lights
  pointLight1.position.x = Math.sin(elapsed * 0.8) * 4;
  pointLight1.position.z = Math.cos(elapsed * 0.8) * 4;
  lightSphere1.position.copy(pointLight1.position);
  
  pointLight2.position.x = Math.sin(elapsed * 0.6 + Math.PI) * 4;
  pointLight2.position.z = Math.cos(elapsed * 0.6 + Math.PI) * 4;
  lightSphere2.position.copy(pointLight2.position);
  
  // Orbit cubes bounce
  orbitGroup.children.forEach((cube, i) => {
    cube.position.y = 1.5 + Math.sin(elapsed * 2 + i) * 0.3;
    cube.rotation.x = elapsed * (1 + i * 0.2);
    cube.rotation.y = elapsed * (1.2 + i * 0.1);
  });
  
  controls.update();
  
  // Render based on view mode
  if (currentView === 'depth') {
    scene.overrideMaterial = depthMaterial;
    renderer.render(scene, camera);
    scene.overrideMaterial = null;
  } else if (currentView === 'normals') {
    scene.overrideMaterial = normalMaterial;
    renderer.render(scene, camera);
    scene.overrideMaterial = null;
  } else if (bypassEffects || currentView === 'scene') {
    renderer.render(scene, camera);
  } else {
    composer.render();
  }
  
  updateStats();
}

// ───────────────────────────────────────────────────────────────
// Initialize
// ───────────────────────────────────────────────────────────────

applyPreset('cinematic');
animate();

console.log('🎨 Post-Processing Analyzer with 3Lens DevTools');
console.log('⌨️ Press 1-8 to toggle effects, Space to toggle all');
console.log('⌨️ Press Ctrl+Shift+D to toggle devtools');
