/**
 * Shadow Technique Comparison Example
 * 
 * Demonstrates different shadow mapping techniques with 3Lens integration:
 * - Basic Shadow Maps (hard shadows)
 * - PCF (Percentage-Closer Filtering)
 * - PCSS (Percentage-Closer Soft Shadows)
 * - VSM (Variance Shadow Mapping)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ============================================================================
// TYPES
// ============================================================================

type ShadowType = 'basic' | 'pcf' | 'pcss' | 'vsm';

interface ShadowConfig {
  name: string;
  description: string;
  samplesPerPixel: string;
  filterType: string;
  softEdges: boolean;
  gpuCost: string;
  qualityPercent: number;
  perfPercent: number;
  memPercent: number;
  artifacts: Array<{
    name: string;
    desc: string;
    severity: 'low' | 'medium' | 'high';
    icon: string;
  }>;
  recommendations: string;
}

// ============================================================================
// SHADOW CONFIGURATIONS
// ============================================================================

const SHADOW_CONFIGS: Record<ShadowType, ShadowConfig> = {
  basic: {
    name: 'Basic Shadow Map',
    description: 'Standard shadow mapping using a single depth sample per pixel. Produces hard-edged shadows with potential aliasing artifacts. Best for performance-critical applications.',
    samplesPerPixel: '1',
    filterType: 'None',
    softEdges: false,
    gpuCost: 'Low',
    qualityPercent: 40,
    perfPercent: 95,
    memPercent: 20,
    artifacts: [
      { name: 'Shadow Acne', desc: 'Self-shadowing artifacts from depth precision', severity: 'high', icon: '⚡' },
      { name: 'Aliasing', desc: 'Jagged shadow edges from undersampling', severity: 'medium', icon: '🔳' },
      { name: 'Peter Panning', desc: 'Shadows detached from objects', severity: 'low', icon: '📐' },
    ],
    recommendations: '• Increase shadow map resolution for better edge quality<br>• Adjust bias to reduce shadow acne<br>• Consider PCF for smoother shadows with minimal cost<br>• Use cascaded shadow maps for large outdoor scenes',
  },
  pcf: {
    name: 'PCF Soft Shadows',
    description: 'Percentage-Closer Filtering samples multiple points in the shadow map and averages the results. Produces softer shadow edges with configurable blur radius.',
    samplesPerPixel: '5-25',
    filterType: 'PCF Kernel',
    softEdges: true,
    gpuCost: 'Medium',
    qualityPercent: 70,
    perfPercent: 70,
    memPercent: 25,
    artifacts: [
      { name: 'Banding', desc: 'Visible steps in soft shadow gradients', severity: 'medium', icon: '📊' },
      { name: 'Shadow Acne', desc: 'Reduced but still possible', severity: 'low', icon: '⚡' },
    ],
    recommendations: '• Increase sample count for smoother gradients<br>• Use Poisson disk sampling for better distribution<br>• Balance blur radius with performance needs<br>• Consider PCF size based on distance from camera',
  },
  pcss: {
    name: 'PCSS Shadows',
    description: 'Percentage-Closer Soft Shadows provide contact-hardening shadows that become softer further from the occluder. Most realistic shadow technique.',
    samplesPerPixel: '32-64',
    filterType: 'Adaptive PCSS',
    softEdges: true,
    gpuCost: 'High',
    qualityPercent: 95,
    perfPercent: 40,
    memPercent: 30,
    artifacts: [
      { name: 'Performance', desc: 'High sample count impacts framerate', severity: 'high', icon: '🐌' },
      { name: 'Noise', desc: 'Can appear noisy with few samples', severity: 'medium', icon: '📶' },
    ],
    recommendations: '• Use for hero objects or cutscenes<br>• Reduce blocker search samples for better perf<br>• Consider temporal filtering to reduce noise<br>• Limit to key lights only',
  },
  vsm: {
    name: 'VSM Shadows',
    description: 'Variance Shadow Mapping stores depth and depth² in a texture, enabling hardware filtering for smooth shadows. Supports pre-filtering for very soft shadows.',
    samplesPerPixel: '1 (filtered)',
    filterType: 'Gaussian Blur',
    softEdges: true,
    gpuCost: 'Medium-High',
    qualityPercent: 80,
    perfPercent: 55,
    memPercent: 50,
    artifacts: [
      { name: 'Light Bleeding', desc: 'Light leaks through thin occluders', severity: 'high', icon: '💡' },
      { name: 'Memory', desc: 'Requires 2-component texture', severity: 'medium', icon: '💾' },
    ],
    recommendations: '• Apply light bleeding reduction techniques<br>• Use SAT (Summed Area Tables) for variable penumbra<br>• Pre-blur shadow maps for soft look<br>• Good for area lights simulation',
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

// Lights
let directionalLight: THREE.DirectionalLight;
let spotLight1: THREE.SpotLight;
let spotLight2: THREE.SpotLight;
let pointLight: THREE.PointLight;
let shadowLights: THREE.Light[] = [];

// Helpers
let directionalHelper: THREE.CameraHelper | null = null;
let spotHelper1: THREE.CameraHelper | null = null;

// Scene objects
let sceneObjects: THREE.Mesh[] = [];

// Settings
let currentShadowType: ShadowType = 'basic';
let shadowMapResolution = 1024;
let shadowBias = 0.0005;
let normalBias = 0.02;
let blurRadius = 1;
let autoRotate = true;
let showFrustum = false;

// Stats
let frameCount = 0;
let lastFpsTime = performance.now();
let currentFps = 60;
let shadowPassTime = 0;

// ============================================================================
// INITIALIZATION
// ============================================================================

function init(): void {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a24);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(10, 8, 10);

  // Renderer with shadow support
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  document.getElementById('app')!.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 30;

  // Create scene
  createLights();
  createSceneObjects();

  // Initialize 3Lens
  initProbe();

  // Setup UI
  setupUI();

  // Event listeners
  window.addEventListener('resize', onWindowResize);

  // Start animation
  animate();
}

function createLights(): void {
  // Ambient light
  const ambient = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambient);

  // Directional light (main shadow caster)
  directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = shadowMapResolution;
  directionalLight.shadow.mapSize.height = shadowMapResolution;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -15;
  directionalLight.shadow.camera.right = 15;
  directionalLight.shadow.camera.top = 15;
  directionalLight.shadow.camera.bottom = -15;
  directionalLight.shadow.bias = shadowBias;
  directionalLight.shadow.normalBias = normalBias;
  scene.add(directionalLight);
  shadowLights.push(directionalLight);

  // Spot light 1
  spotLight1 = new THREE.SpotLight(0xff6b6b, 1.0);
  spotLight1.position.set(-8, 6, 0);
  spotLight1.angle = Math.PI / 6;
  spotLight1.penumbra = 0.3;
  spotLight1.castShadow = true;
  spotLight1.shadow.mapSize.width = 512;
  spotLight1.shadow.mapSize.height = 512;
  spotLight1.shadow.bias = shadowBias;
  scene.add(spotLight1);
  scene.add(spotLight1.target);
  spotLight1.target.position.set(0, 0, 0);
  shadowLights.push(spotLight1);

  // Spot light 2
  spotLight2 = new THREE.SpotLight(0x6b9dff, 1.0);
  spotLight2.position.set(8, 6, 0);
  spotLight2.angle = Math.PI / 6;
  spotLight2.penumbra = 0.3;
  spotLight2.castShadow = true;
  spotLight2.shadow.mapSize.width = 512;
  spotLight2.shadow.mapSize.height = 512;
  spotLight2.shadow.bias = shadowBias;
  scene.add(spotLight2);
  scene.add(spotLight2.target);
  spotLight2.target.position.set(0, 0, 0);
  shadowLights.push(spotLight2);

  // Point light (cube shadow map)
  pointLight = new THREE.PointLight(0xfbbf24, 0.8);
  pointLight.position.set(0, 4, -5);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 256;
  pointLight.shadow.mapSize.height = 256;
  pointLight.shadow.bias = shadowBias;
  scene.add(pointLight);
  shadowLights.push(pointLight);

  // Light visual indicators
  const sphereGeom = new THREE.SphereGeometry(0.2, 16, 16);
  
  const dirIndicator = new THREE.Mesh(sphereGeom, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  dirIndicator.position.copy(directionalLight.position);
  scene.add(dirIndicator);

  const spot1Indicator = new THREE.Mesh(sphereGeom, new THREE.MeshBasicMaterial({ color: 0xff6b6b }));
  spot1Indicator.position.copy(spotLight1.position);
  scene.add(spot1Indicator);

  const spot2Indicator = new THREE.Mesh(sphereGeom, new THREE.MeshBasicMaterial({ color: 0x6b9dff }));
  spot2Indicator.position.copy(spotLight2.position);
  scene.add(spot2Indicator);

  const pointIndicator = new THREE.Mesh(sphereGeom, new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
  pointIndicator.position.copy(pointLight.position);
  scene.add(pointIndicator);
}

function createSceneObjects(): void {
  // Ground plane
  const groundGeom = new THREE.PlaneGeometry(30, 30);
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x333344,
    roughness: 0.8,
    metalness: 0.2,
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);
  sceneObjects.push(ground);

  // Central pedestal
  const pedestalGeom = new THREE.CylinderGeometry(2, 2.5, 0.5, 32);
  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.5 });
  const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
  pedestal.position.y = -0.25;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);
  sceneObjects.push(pedestal);

  // Main sphere
  const sphereGeom = new THREE.SphereGeometry(1.2, 64, 64);
  const sphereMat = new THREE.MeshStandardMaterial({ 
    color: 0x8b5cf6,
    roughness: 0.2,
    metalness: 0.8,
  });
  const sphere = new THREE.Mesh(sphereGeom, sphereMat);
  sphere.position.set(0, 1.2, 0);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere);
  sceneObjects.push(sphere);

  // Surrounding objects for shadow casting
  const objectConfigs = [
    { pos: [3, 0.5, 0], type: 'box', color: 0x22c55e },
    { pos: [-3, 0.5, 0], type: 'box', color: 0xef4444 },
    { pos: [0, 0.5, 3], type: 'cylinder', color: 0x3b82f6 },
    { pos: [0, 0.5, -3], type: 'torus', color: 0xfbbf24 },
    { pos: [2.5, 0.75, 2.5], type: 'cone', color: 0xec4899 },
    { pos: [-2.5, 0.5, -2.5], type: 'box', color: 0x06b6d4 },
    { pos: [2.5, 0.5, -2.5], type: 'sphere', color: 0xf97316 },
    { pos: [-2.5, 0.6, 2.5], type: 'dodeca', color: 0xa855f7 },
  ];

  objectConfigs.forEach(config => {
    let geometry: THREE.BufferGeometry;
    
    switch (config.type) {
      case 'box':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.4, 0.4, 1, 32);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1.5, 32);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        break;
      case 'dodeca':
        geometry = new THREE.DodecahedronGeometry(0.6);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.4,
      metalness: 0.3,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(config.pos[0], config.pos[1], config.pos[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    sceneObjects.push(mesh);
  });

  // Thin objects for shadow testing
  const thinBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  thinBox.position.set(-5, 0.5, 2);
  thinBox.castShadow = true;
  thinBox.receiveShadow = true;
  scene.add(thinBox);
  sceneObjects.push(thinBox);

  // Floating sphere for contact shadow testing
  const floatSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9 })
  );
  floatSphere.position.set(4, 1.5, 3);
  floatSphere.castShadow = true;
  scene.add(floatSphere);
  sceneObjects.push(floatSphere);
}

function initProbe(): void {
  probe = createProbe({ appName: 'Shadow-Comparison' });
  createOverlay({ probe, theme: 'dark' });

  probe.registerLogicalEntity({
    id: 'shadow-system',
    name: 'Shadow Mapping System',
    type: 'lighting',
    object3D: scene,
    metadata: {
      shadowType: currentShadowType,
      mapResolution: shadowMapResolution,
      shadowLights: shadowLights.length,
    }
  });

  shadowLights.forEach((light, i) => {
    const type = light instanceof THREE.DirectionalLight ? 'Directional' :
                 light instanceof THREE.SpotLight ? 'Spot' :
                 light instanceof THREE.PointLight ? 'Point' : 'Unknown';
    
    probe.registerLogicalEntity({
      id: `shadow-light-${i}`,
      name: `${type} Light ${i}`,
      type: 'shadow-caster',
      object3D: light,
      metadata: {
        lightType: type,
        mapSize: light.shadow?.mapSize.x || 0,
        castShadow: light.castShadow,
      }
    });
  });
}

// ============================================================================
// SHADOW TYPE SWITCHING
// ============================================================================

function setShadowType(type: ShadowType): void {
  currentShadowType = type;

  switch (type) {
    case 'basic':
      renderer.shadowMap.type = THREE.BasicShadowMap;
      break;
    case 'pcf':
      renderer.shadowMap.type = THREE.PCFShadowMap;
      break;
    case 'pcss':
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      break;
    case 'vsm':
      renderer.shadowMap.type = THREE.VSMShadowMap;
      // VSM needs blur radius
      shadowLights.forEach(light => {
        if (light.shadow) {
          light.shadow.radius = blurRadius;
        }
      });
      break;
  }

  // Force shadow map regeneration
  renderer.shadowMap.needsUpdate = true;
  shadowLights.forEach(light => {
    if (light.shadow && light.shadow.map) {
      light.shadow.map.dispose();
      light.shadow.map = null as any;
    }
  });

  updateUIForShadowType(type);
  updateTechniqueDetails(type);
}

function updateUIForShadowType(type: ShadowType): void {
  document.querySelectorAll('.shadow-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-type') === type);
  });
  
  document.getElementById('current-type')!.textContent = 
    type.charAt(0).toUpperCase() + type.slice(1);
  document.getElementById('technique-name')!.textContent = SHADOW_CONFIGS[type].name;
}

function updateTechniqueDetails(type: ShadowType): void {
  const config = SHADOW_CONFIGS[type];

  document.getElementById('technique-desc')!.textContent = config.description;
  document.getElementById('samples-pixel')!.textContent = config.samplesPerPixel;
  document.getElementById('filter-type')!.textContent = config.filterType;
  document.getElementById('soft-edges')!.textContent = config.softEdges ? 'Yes' : 'No';
  document.getElementById('gpu-cost')!.textContent = config.gpuCost;

  document.getElementById('quality-percent')!.textContent = `${config.qualityPercent}%`;
  document.getElementById('quality-bar')!.style.width = `${config.qualityPercent}%`;
  document.getElementById('perf-percent')!.textContent = `${config.perfPercent}%`;
  document.getElementById('perf-bar')!.style.width = `${config.perfPercent}%`;
  document.getElementById('mem-percent')!.textContent = `${config.memPercent}%`;
  document.getElementById('mem-bar')!.style.width = `${config.memPercent}%`;

  // Update artifacts list
  const artifactsList = document.getElementById('artifacts-list')!;
  artifactsList.innerHTML = config.artifacts.map(artifact => `
    <div class="artifact-item">
      <div class="artifact-icon" style="background: rgba(${artifact.severity === 'high' ? '239, 68, 68' : artifact.severity === 'medium' ? '251, 191, 36' : '34, 197, 94'}, 0.2);">${artifact.icon}</div>
      <div class="artifact-info">
        <div class="artifact-name">${artifact.name}</div>
        <div class="artifact-desc">${artifact.desc}</div>
      </div>
      <span class="artifact-severity severity-${artifact.severity}">${artifact.severity.charAt(0).toUpperCase() + artifact.severity.slice(1)}</span>
    </div>
  `).join('');

  document.getElementById('recommendations')!.innerHTML = config.recommendations;
}

// ============================================================================
// UI SETUP
// ============================================================================

function setupUI(): void {
  // Shadow type buttons
  document.querySelectorAll('.shadow-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type') as ShadowType;
      setShadowType(type);
    });
  });

  // Resolution slider
  const resSlider = document.getElementById('resolution-slider') as HTMLInputElement;
  resSlider.addEventListener('input', () => {
    shadowMapResolution = Math.pow(2, parseInt(resSlider.value));
    document.getElementById('resolution-value')!.textContent = shadowMapResolution.toString();
    document.getElementById('map-resolution')!.textContent = shadowMapResolution.toString();
    
    shadowLights.forEach(light => {
      if (light.shadow) {
        light.shadow.mapSize.width = shadowMapResolution;
        light.shadow.mapSize.height = shadowMapResolution;
        if (light.shadow.map) {
          light.shadow.map.dispose();
          light.shadow.map = null as any;
        }
      }
    });
  });

  // Bias slider
  const biasSlider = document.getElementById('bias-slider') as HTMLInputElement;
  biasSlider.addEventListener('input', () => {
    shadowBias = parseInt(biasSlider.value) / 100000;
    document.getElementById('bias-value')!.textContent = shadowBias.toFixed(4);
    
    shadowLights.forEach(light => {
      if (light.shadow) {
        light.shadow.bias = shadowBias;
      }
    });
  });

  // Normal bias slider
  const normalBiasSlider = document.getElementById('normal-bias-slider') as HTMLInputElement;
  normalBiasSlider.addEventListener('input', () => {
    normalBias = parseInt(normalBiasSlider.value) / 100;
    document.getElementById('normal-bias-value')!.textContent = normalBias.toFixed(2);
    
    shadowLights.forEach(light => {
      if (light.shadow) {
        light.shadow.normalBias = normalBias;
      }
    });
  });

  // Blur radius slider
  const blurSlider = document.getElementById('blur-slider') as HTMLInputElement;
  blurSlider.addEventListener('input', () => {
    blurRadius = parseInt(blurSlider.value);
    document.getElementById('blur-value')!.textContent = blurRadius.toString();
    
    if (currentShadowType === 'vsm') {
      shadowLights.forEach(light => {
        if (light.shadow) {
          light.shadow.radius = blurRadius;
        }
      });
    }
  });

  // Toggles
  document.getElementById('rotate-toggle')!.addEventListener('click', (e) => {
    const toggle = e.currentTarget as HTMLElement;
    autoRotate = !autoRotate;
    toggle.classList.toggle('active', autoRotate);
  });

  document.getElementById('frustum-toggle')!.addEventListener('click', (e) => {
    const toggle = e.currentTarget as HTMLElement;
    showFrustum = !showFrustum;
    toggle.classList.toggle('active', showFrustum);
    updateFrustumHelpers();
  });

  // Shadow map preview clicks
  document.querySelectorAll('.shadow-map-preview').forEach(preview => {
    preview.addEventListener('click', () => {
      document.querySelectorAll('.shadow-map-preview').forEach(p => p.classList.remove('selected'));
      preview.classList.add('selected');
    });
  });

  // Window resize
  window.addEventListener('resize', onWindowResize);

  // Initialize UI
  updateTechniqueDetails(currentShadowType);
}

function updateFrustumHelpers(): void {
  // Remove existing helpers
  if (directionalHelper) {
    scene.remove(directionalHelper);
    directionalHelper = null;
  }
  if (spotHelper1) {
    scene.remove(spotHelper1);
    spotHelper1 = null;
  }

  if (showFrustum) {
    directionalHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    scene.add(directionalHelper);
    
    spotHelper1 = new THREE.CameraHelper(spotLight1.shadow.camera);
    scene.add(spotHelper1);
  }
}

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================================
// SHADOW MAP PREVIEW
// ============================================================================

function updateShadowMapPreviews(): void {
  const canvases = [
    document.getElementById('shadow-preview-0') as HTMLCanvasElement,
    document.getElementById('shadow-preview-1') as HTMLCanvasElement,
    document.getElementById('shadow-preview-2') as HTMLCanvasElement,
    document.getElementById('shadow-preview-3') as HTMLCanvasElement,
  ];

  shadowLights.forEach((light, i) => {
    if (i >= canvases.length) return;
    
    const canvas = canvases[i];
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 100;
    canvas.width = size;
    canvas.height = size;

    // Draw gradient representing shadow map
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, '#444');
    gradient.addColorStop(1, '#111');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Draw some noise to represent depth
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let j = 0; j < 50; j++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 5 + 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// ============================================================================
// STATS
// ============================================================================

function updateStats(): void {
  // FPS
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    currentFps = frameCount;
    frameCount = 0;
    lastFpsTime = now;
  }

  document.getElementById('fps')!.textContent = currentFps.toString();
  document.getElementById('draw-calls')!.textContent = renderer.info.render.calls.toString();
  document.getElementById('shadow-time')!.textContent = shadowPassTime.toFixed(1);
  document.getElementById('light-count')!.textContent = shadowLights.filter(l => l.castShadow).length.toString();
  document.getElementById('active-lights')!.textContent = shadowLights.filter(l => l.castShadow).length.toString();

  // Memory estimate
  const memMB = (shadowMapResolution * shadowMapResolution * 4 * shadowLights.length) / (1024 * 1024);
  document.getElementById('memory-usage')!.textContent = memMB.toFixed(1);
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(): void {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;

  // Auto-rotate directional light
  if (autoRotate) {
    directionalLight.position.x = Math.sin(time * 0.5) * 8;
    directionalLight.position.z = Math.cos(time * 0.5) * 8;
  }

  // Animate some objects
  sceneObjects.forEach((obj, i) => {
    if (i > 2 && i % 2 === 0) {
      obj.rotation.y = time * 0.5;
    }
  });

  controls.update();

  // Update helpers
  if (directionalHelper) directionalHelper.update();
  if (spotHelper1) spotHelper1.update();

  // Measure shadow pass time
  const shadowStart = performance.now();
  renderer.render(scene, camera);
  shadowPassTime = performance.now() - shadowStart;

  // Update UI
  updateStats();
  
  // Update shadow previews occasionally
  if (frameCount % 30 === 0) {
    updateShadowMapPreviews();
  }
}

// ============================================================================
// START
// ============================================================================

init();
