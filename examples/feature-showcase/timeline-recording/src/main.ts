/**
 * Timeline Recording Demo
 * 
 * Demonstrates 3Lens performance timeline features:
 * - Real-time frame time visualization
 * - CPU/GPU time breakdown
 * - Spike detection and highlighting
 * - Frame recording for later analysis
 * - Zoom/pan through history
 * - Frame selection with detailed stats
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DevtoolProbe, FrameStats } from '@3lens/core';
import { ThreeLensOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

type Scenario = 'smooth' | 'heavy' | 'spikes' | 'gc';

interface SceneConfig {
  objectCount: number;
  animationComplexity: 1 | 2 | 3;
  shadowQuality: 0 | 1 | 2 | 3;
}

// ─────────────────────────────────────────────────────────────────
// Scene Setup
// ─────────────────────────────────────────────────────────────────

const app = document.getElementById('app')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.name = 'Timeline Recording Demo';

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(20, 15, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ─────────────────────────────────────────────────────────────────
// Lighting
// ─────────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(15, 25, 15);
directionalLight.castShadow = false;
directionalLight.shadow.mapSize.width = 512;
directionalLight.shadow.mapSize.height = 512;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
scene.add(directionalLight);

// ─────────────────────────────────────────────────────────────────
// Scene Configuration
// ─────────────────────────────────────────────────────────────────

let config: SceneConfig = {
  objectCount: 100,
  animationComplexity: 1,
  shadowQuality: 0
};

let currentScenario: Scenario | null = null;
let spikeInterval: number | null = null;
let gcInterval: number | null = null;

// ─────────────────────────────────────────────────────────────────
// Dynamic Objects
// ─────────────────────────────────────────────────────────────────

const dynamicObjects: THREE.Mesh[] = [];
const objectGroup = new THREE.Group();
objectGroup.name = 'Dynamic Objects';
scene.add(objectGroup);

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  roughness: 0.9,
  metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
ground.name = 'Ground';
scene.add(ground);

// Geometries for different complexity levels
const geometries = {
  low: new THREE.BoxGeometry(0.5, 0.5, 0.5),
  medium: new THREE.SphereGeometry(0.3, 16, 16),
  high: new THREE.TorusKnotGeometry(0.2, 0.08, 64, 16)
};

// Materials
const materials: THREE.MeshStandardMaterial[] = [];
for (let i = 0; i < 10; i++) {
  materials.push(new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(i * 0.1, 0.8, 0.5),
    roughness: 0.3 + Math.random() * 0.5,
    metalness: 0.2 + Math.random() * 0.6
  }));
}

function createObjects(count: number) {
  // Clear existing
  while (objectGroup.children.length > 0) {
    const child = objectGroup.children[0];
    objectGroup.remove(child);
    if (child instanceof THREE.Mesh) {
      dynamicObjects.splice(dynamicObjects.indexOf(child), 1);
    }
  }
  dynamicObjects.length = 0;

  // Determine geometry based on animation complexity
  let geometry: THREE.BufferGeometry;
  switch (config.animationComplexity) {
    case 3:
      geometry = geometries.high;
      break;
    case 2:
      geometry = geometries.medium;
      break;
    default:
      geometry = geometries.low;
  }

  // Create new objects in a grid/sphere pattern
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = 25 / gridSize;

  for (let i = 0; i < count; i++) {
    const material = materials[i % materials.length];
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position in grid with some random offset
    const x = (i % gridSize) * spacing - (gridSize * spacing) / 2 + spacing / 2;
    const z = Math.floor(i / gridSize) * spacing - (gridSize * spacing) / 2 + spacing / 2;
    const y = 0.5 + Math.random() * 2;
    
    mesh.position.set(x, y, z);
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    mesh.castShadow = config.shadowQuality > 0;
    mesh.receiveShadow = config.shadowQuality > 1;
    mesh.name = `Object_${i}`;
    
    // Store animation data
    mesh.userData.rotationSpeed = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 2
    };
    mesh.userData.floatSpeed = Math.random() * 2 + 1;
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    mesh.userData.baseY = y;

    dynamicObjects.push(mesh);
    objectGroup.add(mesh);
  }
}

function updateShadowQuality(quality: number) {
  renderer.shadowMap.enabled = quality > 0;
  directionalLight.castShadow = quality > 0;
  
  switch (quality) {
    case 0:
      break;
    case 1:
      directionalLight.shadow.mapSize.width = 512;
      directionalLight.shadow.mapSize.height = 512;
      break;
    case 2:
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      break;
    case 3:
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      break;
  }

  // Update all objects
  dynamicObjects.forEach(obj => {
    obj.castShadow = quality > 0;
    obj.receiveShadow = quality > 1;
  });
  ground.receiveShadow = quality > 0;
}

// ─────────────────────────────────────────────────────────────────
// 3Lens DevTools Setup
// ─────────────────────────────────────────────────────────────────

const probe = new DevtoolProbe();
probe.init({
  scenes: [scene],
  enableKeyboardShortcuts: true
});
probe.observeRenderer(renderer);

const overlay = new ThreeLensOverlay(probe);
overlay.init();

// ─────────────────────────────────────────────────────────────────
// Performance Tracking
// ─────────────────────────────────────────────────────────────────

const frameHistory: number[] = [];
const maxHistoryLength = 60;
let spikeCount = 0;
let lastFrameTime = performance.now();

function recordFrameTime(deltaMs: number) {
  frameHistory.push(deltaMs);
  if (frameHistory.length > maxHistoryLength) {
    frameHistory.shift();
  }
  
  // Count spikes (>33ms)
  if (deltaMs > 33.33) {
    spikeCount++;
    updateSpikeIndicator();
  }
}

// ─────────────────────────────────────────────────────────────────
// UI Updates
// ─────────────────────────────────────────────────────────────────

const fpsEl = document.getElementById('fps')!;
const cpuTimeEl = document.getElementById('cpu-time')!;
const drawCallsEl = document.getElementById('draw-calls')!;
const avgFpsEl = document.getElementById('avg-fps')!;
const spikeIndicator = document.getElementById('spike-indicator')!;
const spikeCountEl = document.getElementById('spike-count')!;
const miniTimeline = document.getElementById('mini-timeline') as HTMLCanvasElement;
const miniTimelineCtx = miniTimeline.getContext('2d')!;

// Set up mini timeline canvas
function resizeMiniTimeline() {
  const rect = miniTimeline.getBoundingClientRect();
  miniTimeline.width = rect.width * window.devicePixelRatio;
  miniTimeline.height = rect.height * window.devicePixelRatio;
  miniTimelineCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
}
resizeMiniTimeline();
window.addEventListener('resize', resizeMiniTimeline);

function updateSpikeIndicator() {
  if (spikeCount > 0) {
    spikeIndicator.classList.remove('hidden');
    spikeCountEl.textContent = spikeCount.toString();
  } else {
    spikeIndicator.classList.add('hidden');
  }
}

function updateStats(stats: FrameStats) {
  // Update stat cards
  const fps = stats.cpuTimeMs > 0 ? 1000 / stats.cpuTimeMs : 0;
  fpsEl.textContent = Math.round(fps).toString();
  fpsEl.className = 'stat-value' + (fps < 30 ? ' error' : fps < 55 ? ' warning' : '');
  
  cpuTimeEl.textContent = stats.cpuTimeMs.toFixed(1);
  cpuTimeEl.className = 'stat-value' + (stats.cpuTimeMs > 33 ? ' error' : stats.cpuTimeMs > 16.67 ? ' warning' : '');
  
  drawCallsEl.textContent = stats.drawCalls.toString();
  
  // Calculate average FPS
  if (frameHistory.length > 0) {
    const avgFrameTime = frameHistory.reduce((a, b) => a + b, 0) / frameHistory.length;
    const avgFps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
    avgFpsEl.textContent = `${Math.round(avgFps)} fps avg`;
    avgFpsEl.style.color = avgFps < 30 ? '#ef4444' : avgFps < 55 ? '#eab308' : '#22c55e';
  }
}

function renderMiniTimeline() {
  const rect = miniTimeline.getBoundingClientRect();
  const { width, height } = rect;
  
  miniTimelineCtx.clearRect(0, 0, width, height);
  
  if (frameHistory.length === 0) return;
  
  const maxValue = Math.max(...frameHistory, 33.33);
  const barWidth = width / maxHistoryLength;
  const padding = 2;
  
  // Draw 16.67ms line (60fps target)
  const targetY = height - (16.67 / maxValue) * (height - padding * 2) - padding;
  miniTimelineCtx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
  miniTimelineCtx.setLineDash([4, 4]);
  miniTimelineCtx.lineWidth = 1;
  miniTimelineCtx.beginPath();
  miniTimelineCtx.moveTo(0, targetY);
  miniTimelineCtx.lineTo(width, targetY);
  miniTimelineCtx.stroke();
  miniTimelineCtx.setLineDash([]);
  
  // Draw bars
  frameHistory.forEach((value, i) => {
    const x = i * barWidth;
    const barHeight = (value / maxValue) * (height - padding * 2);
    const y = height - barHeight - padding;
    
    const isSpike = value > 33.33;
    miniTimelineCtx.fillStyle = isSpike ? 'rgba(239, 68, 68, 0.8)' : 'rgba(96, 165, 250, 0.6)';
    miniTimelineCtx.fillRect(x, y, barWidth - 1, barHeight);
  });
}

// Subscribe to frame stats
probe.onFrameStats((stats) => {
  recordFrameTime(stats.cpuTimeMs);
  updateStats(stats);
  renderMiniTimeline();
});

// ─────────────────────────────────────────────────────────────────
// Scenario Controls
// ─────────────────────────────────────────────────────────────────

function clearScenarioEffects() {
  if (spikeInterval) {
    clearInterval(spikeInterval);
    spikeInterval = null;
  }
  if (gcInterval) {
    clearInterval(gcInterval);
    gcInterval = null;
  }
  currentScenario = null;
  
  // Update UI
  document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.classList.remove('active');
  });
}

function applyScenario(scenario: Scenario) {
  clearScenarioEffects();
  currentScenario = scenario;
  
  // Highlight active button
  document.getElementById(`scenario-${scenario}`)?.classList.add('active');
  
  switch (scenario) {
    case 'smooth':
      // Low object count, no shadows
      setObjectCount(50);
      setAnimationComplexity(1);
      setShadowQuality(0);
      break;
      
    case 'heavy':
      // High object count with complex geometry and shadows
      setObjectCount(1000);
      setAnimationComplexity(3);
      setShadowQuality(2);
      break;
      
    case 'spikes':
      // Medium load with random spikes
      setObjectCount(200);
      setAnimationComplexity(2);
      setShadowQuality(1);
      
      // Random spikes every 0.5-2 seconds
      spikeInterval = setInterval(() => {
        triggerSpike();
      }, 500 + Math.random() * 1500) as unknown as number;
      break;
      
    case 'gc':
      // Simulate GC pressure by creating/destroying objects
      setObjectCount(300);
      setAnimationComplexity(1);
      setShadowQuality(0);
      
      gcInterval = setInterval(() => {
        simulateGCPressure();
      }, 200) as unknown as number;
      break;
  }
}

function triggerSpike() {
  // Simulate a frame spike by doing expensive work
  const startTime = performance.now();
  const targetDuration = 50 + Math.random() * 100; // 50-150ms spike
  
  // Busy loop
  while (performance.now() - startTime < targetDuration) {
    Math.random() * Math.random();
  }
}

const gcPressureArrays: Float32Array[] = [];
function simulateGCPressure() {
  // Create large arrays to pressure GC
  for (let i = 0; i < 10; i++) {
    gcPressureArrays.push(new Float32Array(10000));
  }
  
  // Clean up some old ones
  while (gcPressureArrays.length > 50) {
    gcPressureArrays.shift();
  }
}

// ─────────────────────────────────────────────────────────────────
// UI Event Handlers
// ─────────────────────────────────────────────────────────────────

const objectCountSlider = document.getElementById('object-count') as HTMLInputElement;
const objectCountValue = document.getElementById('object-count-value')!;

const animComplexitySlider = document.getElementById('anim-complexity') as HTMLInputElement;
const animComplexityValue = document.getElementById('anim-complexity-value')!;

const shadowQualitySlider = document.getElementById('shadow-quality') as HTMLInputElement;
const shadowQualityValue = document.getElementById('shadow-quality-value')!;

function setObjectCount(count: number) {
  config.objectCount = count;
  objectCountSlider.value = count.toString();
  objectCountValue.textContent = count.toString();
  createObjects(count);
}

function setAnimationComplexity(complexity: 1 | 2 | 3) {
  config.animationComplexity = complexity;
  animComplexitySlider.value = complexity.toString();
  animComplexityValue.textContent = ['Low', 'Medium', 'High'][complexity - 1];
  createObjects(config.objectCount);
}

function setShadowQuality(quality: 0 | 1 | 2 | 3) {
  config.shadowQuality = quality;
  shadowQualitySlider.value = quality.toString();
  shadowQualityValue.textContent = ['Off', 'Low', 'Medium', 'High'][quality];
  updateShadowQuality(quality);
}

objectCountSlider.addEventListener('input', () => {
  const count = parseInt(objectCountSlider.value, 10);
  clearScenarioEffects();
  setObjectCount(count);
});

animComplexitySlider.addEventListener('input', () => {
  const complexity = parseInt(animComplexitySlider.value, 10) as 1 | 2 | 3;
  clearScenarioEffects();
  setAnimationComplexity(complexity);
});

shadowQualitySlider.addEventListener('input', () => {
  const quality = parseInt(shadowQualitySlider.value, 10) as 0 | 1 | 2 | 3;
  clearScenarioEffects();
  setShadowQuality(quality);
});

// Scenario buttons
document.querySelectorAll('.scenario-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const scenario = btn.getAttribute('data-scenario') as Scenario;
    if (scenario) {
      applyScenario(scenario);
    }
  });
});

// Action buttons
document.getElementById('trigger-spike')!.addEventListener('click', () => {
  triggerSpike();
});

document.getElementById('trigger-gc')!.addEventListener('click', () => {
  // Force GC by creating/destroying lots of objects
  for (let i = 0; i < 100; i++) {
    simulateGCPressure();
  }
  gcPressureArrays.length = 0;
});

document.getElementById('reset-scene')!.addEventListener('click', () => {
  clearScenarioEffects();
  setObjectCount(100);
  setAnimationComplexity(1);
  setShadowQuality(0);
  spikeCount = 0;
  updateSpikeIndicator();
});

// ─────────────────────────────────────────────────────────────────
// Animation Loop
// ─────────────────────────────────────────────────────────────────

let time = 0;

function animate() {
  requestAnimationFrame(animate);
  
  const now = performance.now();
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  
  time += delta * 0.001;
  
  // Animate objects based on complexity
  dynamicObjects.forEach((obj) => {
    const { rotationSpeed, floatSpeed, floatOffset, baseY } = obj.userData;
    
    // Rotation (always)
    obj.rotation.x += rotationSpeed.x * delta * 0.001;
    obj.rotation.y += rotationSpeed.y * delta * 0.001;
    obj.rotation.z += rotationSpeed.z * delta * 0.001;
    
    // Floating animation (medium+ complexity)
    if (config.animationComplexity >= 2) {
      obj.position.y = baseY + Math.sin(time * floatSpeed + floatOffset) * 0.5;
    }
    
    // Position oscillation (high complexity)
    if (config.animationComplexity >= 3) {
      const originalX = obj.position.x;
      const originalZ = obj.position.z;
      obj.position.x = originalX + Math.sin(time * 2 + floatOffset) * 0.1;
      obj.position.z = originalZ + Math.cos(time * 2 + floatOffset) * 0.1;
    }
  });
  
  controls.update();
  probe.capture();
  renderer.render(scene, camera);
}

// ─────────────────────────────────────────────────────────────────
// Resize Handler
// ─────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─────────────────────────────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────────────────────────────

createObjects(config.objectCount);
animate();

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   Timeline Recording Demo                      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  This demo showcases 3Lens performance timeline features:     ║
║                                                               ║
║  📊 Real-time frame time visualization                        ║
║  📈 CPU/GPU time breakdown (dual-layer chart)                 ║
║  ⚠️  Spike detection (frames >33ms highlighted in red)        ║
║  ⏺  Frame recording (up to 30 seconds)                        ║
║  🔍 Zoom/pan through frame history                            ║
║  📋 Click frames for detailed stats                           ║
║                                                               ║
║  Try these scenarios to see different performance patterns:   ║
║                                                               ║
║  🟢 Smooth 60fps - Low load, consistent frame times           ║
║  🟠 Heavy Load - High object count with complex geometry      ║
║  🔴 Random Spikes - Simulated frame drops                     ║
║  🗑️ GC Pressure - Memory allocation spikes                    ║
║                                                               ║
║  Press F9 to open 3Lens DevTools                              ║
║  Go to Performance → Timeline tab to start recording!         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
