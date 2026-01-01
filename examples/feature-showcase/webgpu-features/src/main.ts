/**
 * WebGPU Features Example
 * 
 * Demonstrates 3Lens WebGPU-specific features:
 * - WebGPU renderer detection and adapter creation
 * - GPU timing with timestamp queries
 * - Pipeline tracking (render and compute)
 * - Device capabilities inspection
 * - WebGPU-specific frame stats
 */

import * as THREE from 'three';
import { 
  DevtoolProbe,
  isWebGPURenderer,
  getWebGPUCapabilities,
  type WebGPUCapabilities,
  type FrameStats
} from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// Type declarations for WebGPU renderer
interface WebGPURenderer extends THREE.Renderer {
  readonly isWebGPURenderer: true;
  init(): Promise<void>;
  renderAsync(scene: THREE.Scene, camera: THREE.Camera): Promise<void>;
  backend?: {
    device?: GPUDevice;
    adapter?: GPUAdapter;
  };
  info: {
    render: {
      frame: number;
      calls: number;
      triangles: number;
      points: number;
      lines: number;
    };
    memory: {
      textures: number;
      geometries: number;
    };
  };
}

// State
let probe: DevtoolProbe | null = null;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: WebGPURenderer;
let animationPaused = false;
let objects: THREE.Mesh[] = [];
let frameStats: FrameStats | null = null;
let capabilities: WebGPUCapabilities | null = null;

// DOM elements
const statusBadge = document.getElementById('status-badge')!;
const fpsEl = document.getElementById('fps')!;
const drawCallsEl = document.getElementById('draw-calls')!;
const trianglesEl = document.getElementById('triangles')!;
const pipelinesUsedEl = document.getElementById('pipelines-used')!;
const memoryEl = document.getElementById('memory')!;
const gpuTimeEl = document.getElementById('gpu-time')!;
const gpuBarEl = document.getElementById('gpu-bar')!;
const passBreakdownEl = document.getElementById('pass-breakdown')!;
const pipelineListEl = document.getElementById('pipeline-list')!;
const deviceLabelEl = document.getElementById('device-label')!;
const maxTexture2dEl = document.getElementById('max-texture-2d')!;
const maxBindGroupsEl = document.getElementById('max-bind-groups')!;
const timestampQueryEl = document.getElementById('timestamp-query')!;
const maxComputeWgEl = document.getElementById('max-compute-wg')!;
const featuresListEl = document.getElementById('features-list')!;
const limitsTableEl = document.getElementById('limits-table')!;
const fallbackMessage = document.getElementById('fallback-message')!;

// Check WebGPU support
async function checkWebGPUSupport(): Promise<boolean> {
  if (!navigator.gpu) {
    return false;
  }
  
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

// Initialize WebGPU renderer
async function initWebGPU(): Promise<boolean> {
  const isSupported = await checkWebGPUSupport();
  
  if (!isSupported) {
    statusBadge.textContent = 'WebGPU Not Supported';
    statusBadge.classList.add('error');
    fallbackMessage.classList.add('visible');
    return false;
  }
  
  try {
    // Dynamically import WebGPURenderer from Three.js
    // Note: In Three.js r160+, WebGPURenderer is available as an add-on
    const { WebGPURenderer } = await import('three/webgpu');
    
    renderer = new WebGPURenderer({ antialias: true }) as WebGPURenderer;
    await renderer.init();
    
    const container = document.getElementById('canvas-container')!;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    statusBadge.textContent = 'WebGPU Active';
    statusBadge.classList.add('supported');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize WebGPU:', error);
    statusBadge.textContent = 'WebGPU Init Failed';
    statusBadge.classList.add('error');
    fallbackMessage.classList.add('visible');
    fallbackMessage.querySelector('p')!.textContent = 
      'Failed to initialize WebGPU renderer. Error: ' + (error as Error).message;
    return false;
  }
}

// Create scene
function createScene(): void {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  
  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    document.getElementById('canvas-container')!.clientWidth / 
    document.getElementById('canvas-container')!.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 25);
  camera.lookAt(0, 0, 0);
  
  // Lights
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
  
  const pointLight1 = new THREE.PointLight(0x00d4ff, 1, 50);
  pointLight1.position.set(-10, 5, 10);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0xe94560, 1, 50);
  pointLight2.position.set(10, 5, -10);
  scene.add(pointLight2);
  
  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x16213e,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'Ground';
  scene.add(ground);
  
  // Create initial objects
  createObjects(20);
}

// Create demo objects
function createObjects(count: number): void {
  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.TorusGeometry(0.4, 0.15, 16, 48),
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.OctahedronGeometry(0.5),
    new THREE.TorusKnotGeometry(0.3, 0.1, 64, 8)
  ];
  
  const colors = [0x00d4ff, 0xe94560, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xef4444];
  
  for (let i = 0; i < count; i++) {
    const geometry = geometries[i % geometries.length];
    const material = new THREE.MeshStandardMaterial({
      color: colors[i % colors.length],
      roughness: 0.3 + Math.random() * 0.4,
      metalness: 0.5 + Math.random() * 0.5
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `Object_${objects.length + 1}`;
    
    // Random position in a sphere
    const radius = 5 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
    mesh.position.y = 1 + Math.random() * 5;
    mesh.position.z = radius * Math.sin(phi) * Math.sin(theta);
    
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    scene.add(mesh);
    objects.push(mesh);
  }
}

// Initialize 3Lens DevtoolProbe
function initDevtools(): void {
  probe = new DevtoolProbe({ debug: true });
  
  // Observe the WebGPU renderer
  probe.observeRenderer(renderer as unknown as THREE.WebGLRenderer);
  probe.observeScene(scene);
  
  // Get WebGPU capabilities
  if (isWebGPURenderer(renderer)) {
    capabilities = getWebGPUCapabilities(renderer as any);
    updateCapabilitiesUI();
  }
  
  // Create overlay
  const overlay = createOverlay(probe, {
    defaultWidth: 400
  });
  overlay.showPanel('stats');
  
  // Subscribe to frame stats
  const adapter = (probe as any).rendererAdapter;
  if (adapter) {
    adapter.observeFrame((stats: FrameStats) => {
      frameStats = stats;
      updateMetricsUI(stats);
    });
  }
}

// Update capabilities UI
function updateCapabilitiesUI(): void {
  if (!capabilities) return;
  
  // Device label
  deviceLabelEl.textContent = capabilities.deviceLabel || 'Unknown Device';
  
  // Key limits
  maxTexture2dEl.textContent = capabilities.maxTextureDimension2D.toLocaleString();
  maxBindGroupsEl.textContent = capabilities.maxBindGroups.toString();
  timestampQueryEl.textContent = capabilities.hasTimestampQuery ? '✓ Yes' : '✗ No';
  maxComputeWgEl.textContent = capabilities.maxComputeWorkgroupsPerDimension.toLocaleString();
  
  // Features list
  featuresListEl.innerHTML = capabilities.features
    .slice(0, 15)
    .map(f => `<span class="capability-tag">${f}</span>`)
    .join('');
  
  if (capabilities.features.length > 15) {
    featuresListEl.innerHTML += `<span class="capability-tag">+${capabilities.features.length - 15} more</span>`;
  }
  
  // Limits table
  const limitsData = [
    ['Max Texture 2D', capabilities.maxTextureDimension2D],
    ['Max Texture Array Layers', capabilities.maxTextureArrayLayers],
    ['Max Bind Groups', capabilities.maxBindGroups],
    ['Max Bindings/Group', capabilities.maxBindingsPerBindGroup],
    ['Max Uniform Buffers', capabilities.maxUniformBuffersPerShaderStage],
    ['Max Storage Buffers', capabilities.maxStorageBuffersPerShaderStage],
    ['Max Samplers', capabilities.maxSamplersPerShaderStage],
    ['Max Sampled Textures', capabilities.maxSampledTexturesPerShaderStage],
    ['Max Vertex Buffers', capabilities.maxVertexBuffers],
    ['Max Vertex Attributes', capabilities.maxVertexAttributes],
    ['Max Compute WG Size X', capabilities.maxComputeWorkgroupSizeX],
    ['Max Compute WG Size Y', capabilities.maxComputeWorkgroupSizeY],
    ['Max Compute WG Size Z', capabilities.maxComputeWorkgroupSizeZ],
    ['Max Compute Invocations', capabilities.maxComputeInvocationsPerWorkgroup],
  ];
  
  const tbody = limitsTableEl.querySelector('tbody')!;
  tbody.innerHTML = limitsData
    .map(([name, value]) => `
      <tr>
        <td>${name}</td>
        <td>${typeof value === 'number' ? value.toLocaleString() : value}</td>
      </tr>
    `)
    .join('');
}

// Update metrics UI
function updateMetricsUI(stats: FrameStats): void {
  // Basic metrics
  fpsEl.textContent = Math.round(stats.summary.fps).toString();
  drawCallsEl.textContent = stats.summary.drawCalls.toString();
  trianglesEl.textContent = formatNumber(stats.summary.triangles);
  memoryEl.textContent = formatBytes(stats.memory.totalGpuMemory);
  
  // WebGPU-specific metrics
  if (stats.webgpuExtras) {
    pipelinesUsedEl.textContent = stats.webgpuExtras.pipelinesUsed.toString();
    
    // GPU timing
    if (stats.webgpuExtras.gpuTiming) {
      const gpuTime = stats.webgpuExtras.gpuTiming.totalMs;
      gpuTimeEl.textContent = `${gpuTime.toFixed(2)} ms`;
      
      // Update bar (16.67ms = 60fps target)
      const percentage = Math.min(100, (gpuTime / 16.67) * 100);
      gpuBarEl.style.width = `${percentage}%`;
      
      // Update pass breakdown
      if (stats.webgpuExtras.gpuTiming.passes && stats.webgpuExtras.gpuTiming.passes.length > 0) {
        updatePassBreakdown(stats.webgpuExtras.gpuTiming.passes, gpuTime);
      }
    }
  } else {
    pipelinesUsedEl.textContent = '--';
    gpuTimeEl.textContent = 'N/A';
  }
  
  // Update pipeline list
  updatePipelineList();
}

// Update pass breakdown UI
interface PassInfo {
  name: string;
  durationMs: number;
  type?: string;
}

function updatePassBreakdown(passes: PassInfo[], totalTime: number): void {
  if (!passes || passes.length === 0) {
    passBreakdownEl.innerHTML = '<p style="color: #888; font-size: 0.75rem;">No pass data available</p>';
    return;
  }
  
  passBreakdownEl.innerHTML = passes.map(pass => {
    const percentage = (pass.durationMs / totalTime) * 100;
    const passType = pass.type || categorizePass(pass.name);
    
    return `
      <div class="pass-item">
        <span class="pass-name">${pass.name}</span>
        <div class="pass-bar">
          <div class="pass-fill ${passType}" style="width: ${percentage}%"></div>
        </div>
        <span class="pass-time">${pass.durationMs.toFixed(2)}</span>
      </div>
    `;
  }).join('');
}

// Categorize pass by name
function categorizePass(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('shadow')) return 'shadow';
  if (lowerName.includes('post') || lowerName.includes('bloom') || lowerName.includes('blur')) return 'post';
  if (lowerName.includes('compute')) return 'compute';
  return 'render';
}

// Update pipeline list
function updatePipelineList(): void {
  const adapter = (probe as any)?.rendererAdapter;
  if (!adapter || typeof adapter.getPipelines !== 'function') {
    pipelineListEl.innerHTML = '<div class="pipeline-item"><span class="pipeline-name">No pipeline data</span></div>';
    return;
  }
  
  const pipelines = adapter.getPipelines() || [];
  
  if (pipelines.length === 0) {
    pipelineListEl.innerHTML = '<div class="pipeline-item"><span class="pipeline-name">No pipelines tracked</span></div>';
    return;
  }
  
  pipelineListEl.innerHTML = pipelines.slice(0, 10).map((p: any) => `
    <div class="pipeline-item">
      <span class="pipeline-name">${p.label || p.id}</span>
      <span class="pipeline-type ${p.type}">${p.type}</span>
    </div>
  `).join('');
  
  if (pipelines.length > 10) {
    pipelineListEl.innerHTML += `
      <div class="pipeline-item">
        <span class="pipeline-name" style="color: #888">+${pipelines.length - 10} more pipelines</span>
      </div>
    `;
  }
}

// Format helpers
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

// Animation loop
function animate(): void {
  requestAnimationFrame(animate);
  
  if (!animationPaused) {
    const time = performance.now() * 0.001;
    
    objects.forEach((obj, i) => {
      // Gentle rotation
      obj.rotation.x += 0.005 * (1 + (i % 3) * 0.2);
      obj.rotation.y += 0.007 * (1 + (i % 2) * 0.3);
      
      // Floating motion
      obj.position.y += Math.sin(time * 2 + i) * 0.003;
    });
    
    // Orbit camera slightly
    camera.position.x = Math.sin(time * 0.1) * 25;
    camera.position.z = Math.cos(time * 0.1) * 25;
    camera.lookAt(0, 0, 0);
  }
  
  // Use async rendering for WebGPU
  if (renderer.renderAsync) {
    renderer.renderAsync(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
}

// Stress test
async function runStressTest(): Promise<void> {
  const btn = document.getElementById('btn-stress-test') as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = 'Running...';
  
  const initialCount = objects.length;
  
  // Add many objects
  for (let i = 0; i < 5; i++) {
    createObjects(50);
    await new Promise(r => setTimeout(r, 100));
  }
  
  // Wait for metrics to stabilize
  await new Promise(r => setTimeout(r, 2000));
  
  // Remove extra objects
  while (objects.length > initialCount) {
    const obj = objects.pop()!;
    scene.remove(obj);
    obj.geometry.dispose();
    (obj.material as THREE.Material).dispose();
  }
  
  btn.disabled = false;
  btn.textContent = 'Run Stress Test';
}

// Setup event handlers
function setupEventHandlers(): void {
  // Add objects button
  document.getElementById('btn-add-objects')!.addEventListener('click', () => {
    createObjects(10);
  });
  
  // Toggle animation button
  const toggleBtn = document.getElementById('btn-toggle-animation')!;
  toggleBtn.addEventListener('click', () => {
    animationPaused = !animationPaused;
    toggleBtn.textContent = animationPaused ? 'Resume Animation' : 'Pause Animation';
  });
  
  // Stress test button
  document.getElementById('btn-stress-test')!.addEventListener('click', runStressTest);
  
  // Handle resize
  window.addEventListener('resize', () => {
    const container = document.getElementById('canvas-container')!;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

// Initialize
async function init(): Promise<void> {
  const success = await initWebGPU();
  
  if (!success) {
    return;
  }
  
  createScene();
  initDevtools();
  setupEventHandlers();
  animate();
  
  console.log('🔮 WebGPU Features Example initialized');
  console.log('   Press F12 to open 3Lens DevTools overlay');
  
  if (capabilities) {
    console.log('📊 WebGPU Capabilities:', capabilities);
  }
}

init();
