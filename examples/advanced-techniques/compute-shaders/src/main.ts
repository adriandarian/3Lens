/**
 * Compute Shader Debugging Example
 * 
 * Demonstrates WebGPU compute shaders with 3Lens integration:
 * - GPU particle simulation
 * - Buffer inspection
 * - Dispatch timing
 * - WGSL shader debugging
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ============================================================================
// TYPES
// ============================================================================

interface SimulationParams {
  deltaTime: number;
  gravity: number;
  damping: number;
  particleCount: number;
  forceStrength: number;
  attractorPos: Float32Array;
}

interface ComputePass {
  name: string;
  pipeline: GPUComputePipeline | null;
  bindGroup: GPUBindGroup | null;
  time: number;
}

type ShaderType = 'particles' | 'boids' | 'cloth' | 'nbody';

// ============================================================================
// SHADER CODE (WGSL)
// ============================================================================

const PARTICLE_SHADER = `
struct Particle {
  position: vec4<f32>,
  velocity: vec4<f32>,
}

struct SimParams {
  deltaTime: f32,
  gravity: f32,
  damping: f32,
  particleCount: u32,
  forceStrength: f32,
  attractorX: f32,
  attractorY: f32,
  attractorZ: f32,
}

@group(0) @binding(0) var<storage, read_write> positions: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read_write> velocities: array<vec4<f32>>;
@group(0) @binding(2) var<uniform> params: SimParams;

@compute @workgroup_size(256)
fn computeForces(@builtin(global_invocation_id) id: vec3<u32>) {
  let index = id.x;
  if (index >= params.particleCount) {
    return;
  }
  
  var pos = positions[index].xyz;
  var vel = velocities[index].xyz;
  
  // Gravity
  vel.y -= params.gravity * params.deltaTime;
  
  // Attractor force
  let attractorPos = vec3<f32>(params.attractorX, params.attractorY, params.attractorZ);
  let toAttractor = attractorPos - pos;
  let dist = length(toAttractor);
  if (dist > 0.1) {
    let force = normalize(toAttractor) * params.forceStrength / (dist * dist + 1.0);
    vel += force * params.deltaTime;
  }
  
  velocities[index] = vec4<f32>(vel, 0.0);
}

@compute @workgroup_size(256)
fn integrate(@builtin(global_invocation_id) id: vec3<u32>) {
  let index = id.x;
  if (index >= params.particleCount) {
    return;
  }
  
  var pos = positions[index].xyz;
  var vel = velocities[index].xyz;
  
  // Apply damping
  vel *= (1.0 - params.damping * params.deltaTime);
  
  // Integrate position
  pos += vel * params.deltaTime;
  
  positions[index] = vec4<f32>(pos, 1.0);
  velocities[index] = vec4<f32>(vel, 0.0);
}

@compute @workgroup_size(256)
fn collisions(@builtin(global_invocation_id) id: vec3<u32>) {
  let index = id.x;
  if (index >= params.particleCount) {
    return;
  }
  
  var pos = positions[index].xyz;
  var vel = velocities[index].xyz;
  
  // Box boundaries
  let bounds = 10.0;
  let bounce = 0.7;
  
  if (pos.x < -bounds) { pos.x = -bounds; vel.x *= -bounce; }
  if (pos.x > bounds) { pos.x = bounds; vel.x *= -bounce; }
  if (pos.y < -bounds) { pos.y = -bounds; vel.y *= -bounce; }
  if (pos.y > bounds) { pos.y = bounds; vel.y *= -bounce; }
  if (pos.z < -bounds) { pos.z = -bounds; vel.z *= -bounce; }
  if (pos.z > bounds) { pos.z = bounds; vel.z *= -bounce; }
  
  positions[index] = vec4<f32>(pos, 1.0);
  velocities[index] = vec4<f32>(vel, 0.0);
}
`;

const BOIDS_SHADER = `
struct SimParams {
  deltaTime: f32,
  separationWeight: f32,
  alignmentWeight: f32,
  cohesionWeight: f32,
  particleCount: u32,
  visualRange: f32,
  minSpeed: f32,
  maxSpeed: f32,
}

@group(0) @binding(0) var<storage, read_write> positions: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read_write> velocities: array<vec4<f32>>;
@group(0) @binding(2) var<uniform> params: SimParams;

@compute @workgroup_size(256)
fn computeForces(@builtin(global_invocation_id) id: vec3<u32>) {
  let index = id.x;
  if (index >= params.particleCount) {
    return;
  }
  
  var pos = positions[index].xyz;
  var vel = velocities[index].xyz;
  
  var separation = vec3<f32>(0.0);
  var alignment = vec3<f32>(0.0);
  var cohesion = vec3<f32>(0.0);
  var neighborCount = 0u;
  
  for (var i = 0u; i < params.particleCount; i++) {
    if (i == index) { continue; }
    
    let otherPos = positions[i].xyz;
    let diff = pos - otherPos;
    let dist = length(diff);
    
    if (dist < params.visualRange && dist > 0.01) {
      // Separation
      separation += normalize(diff) / dist;
      
      // Alignment
      alignment += velocities[i].xyz;
      
      // Cohesion
      cohesion += otherPos;
      
      neighborCount++;
    }
  }
  
  if (neighborCount > 0u) {
    let n = f32(neighborCount);
    alignment = alignment / n;
    cohesion = cohesion / n - pos;
    
    vel += separation * params.separationWeight;
    vel += normalize(alignment - vel) * params.alignmentWeight;
    vel += normalize(cohesion) * params.cohesionWeight;
  }
  
  // Speed limits
  let speed = length(vel);
  if (speed > params.maxSpeed) {
    vel = normalize(vel) * params.maxSpeed;
  } else if (speed < params.minSpeed && speed > 0.0) {
    vel = normalize(vel) * params.minSpeed;
  }
  
  velocities[index] = vec4<f32>(vel, 0.0);
}

@compute @workgroup_size(256)
fn integrate(@builtin(global_invocation_id) id: vec3<u32>) {
  let index = id.x;
  if (index >= params.particleCount) {
    return;
  }
  
  var pos = positions[index].xyz;
  let vel = velocities[index].xyz;
  
  pos += vel * params.deltaTime;
  
  // Wrap around boundaries
  let bounds = 15.0;
  if (pos.x < -bounds) { pos.x += bounds * 2.0; }
  if (pos.x > bounds) { pos.x -= bounds * 2.0; }
  if (pos.y < -bounds) { pos.y += bounds * 2.0; }
  if (pos.y > bounds) { pos.y -= bounds * 2.0; }
  if (pos.z < -bounds) { pos.z += bounds * 2.0; }
  if (pos.z > bounds) { pos.z -= bounds * 2.0; }
  
  positions[index] = vec4<f32>(pos, 1.0);
}

@compute @workgroup_size(256)
fn collisions(@builtin(global_invocation_id) id: vec3<u32>) {
  // No-op for boids - they wrap around
}
`;

// ============================================================================
// GLOBAL STATE
// ============================================================================

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;

// WebGPU state
let device: GPUDevice | null = null;
let adapter: GPUAdapter | null = null;
let positionBuffer: GPUBuffer | null = null;
let velocityBuffer: GPUBuffer | null = null;
let uniformBuffer: GPUBuffer | null = null;
let readbackBuffer: GPUBuffer | null = null;

// Compute pipelines
let computePasses: ComputePass[] = [];
let currentShader: ShaderType = 'particles';

// Simulation state
let particleCount = 16384;
let isRunning = true;
let params: SimulationParams = {
  deltaTime: 0.016,
  gravity: 9.8,
  damping: 0.1,
  particleCount: particleCount,
  forceStrength: 50,
  attractorPos: new Float32Array([0, 0, 0]),
};

// Three.js particle system
let particleGeometry: THREE.BufferGeometry;
let particleMaterial: THREE.PointsMaterial;
let particleSystem: THREE.Points;

// CPU fallback data
let cpuPositions: Float32Array;
let cpuVelocities: Float32Array;

// Stats
let frameCount = 0;
let lastFpsTime = performance.now();
let currentFps = 60;
let computeTimeMs = 0;
let gpuMemoryKB = 0;

// ============================================================================
// WEBGPU INITIALIZATION
// ============================================================================

async function initWebGPU(): Promise<boolean> {
  if (!navigator.gpu) {
    showWebGPUNotSupported();
    return false;
  }

  try {
    adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      showWebGPUNotSupported();
      return false;
    }

    device = await adapter.requestDevice({
      requiredFeatures: [],
      requiredLimits: {
        maxStorageBufferBindingSize: 128 * 1024 * 1024,
        maxComputeWorkgroupsPerDimension: 65535,
      },
    });

    // Update debug info
    const adapterInfo = await adapter.requestAdapterInfo();
    document.getElementById('gpu-device')!.textContent = adapterInfo.description || 'WebGPU Device';
    document.getElementById('max-workgroup')!.textContent = device.limits.maxComputeWorkgroupSizeX.toString();
    document.getElementById('max-storage')!.textContent = device.limits.maxStorageBuffersPerShaderStage.toString();

    return true;
  } catch (e) {
    console.error('WebGPU initialization failed:', e);
    showWebGPUNotSupported();
    return false;
  }
}

function showWebGPUNotSupported(): void {
  const div = document.createElement('div');
  div.className = 'not-supported';
  div.innerHTML = `
    <h2>WebGPU Not Supported</h2>
    <p>This example requires WebGPU which is not available in your browser.</p>
    <p>Try using Chrome 113+ or Edge 113+ with WebGPU enabled.</p>
    <p>The simulation will run in CPU fallback mode with reduced performance.</p>
  `;
  document.body.appendChild(div);
  
  document.getElementById('webgpu-status')!.textContent = 'CPU Fallback';
  document.querySelector('.bottom-bar .bar-icon')!.classList.remove('active');
  document.querySelector('.bottom-bar .bar-icon')!.classList.add('warning');
}

// ============================================================================
// BUFFER CREATION
// ============================================================================

function createBuffers(): void {
  const positionData = new Float32Array(particleCount * 4);
  const velocityData = new Float32Array(particleCount * 4);

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(2 * Math.random() - 1);
    const r = Math.random() * 8;

    positionData[i * 4 + 0] = r * Math.sin(theta) * Math.cos(phi);
    positionData[i * 4 + 1] = r * Math.sin(theta) * Math.sin(phi);
    positionData[i * 4 + 2] = r * Math.cos(theta);
    positionData[i * 4 + 3] = 1.0;

    velocityData[i * 4 + 0] = (Math.random() - 0.5) * 2;
    velocityData[i * 4 + 1] = (Math.random() - 0.5) * 2;
    velocityData[i * 4 + 2] = (Math.random() - 0.5) * 2;
    velocityData[i * 4 + 3] = 0.0;
  }

  // Store CPU fallback data
  cpuPositions = new Float32Array(positionData);
  cpuVelocities = new Float32Array(velocityData);

  if (device) {
    // Create GPU buffers
    positionBuffer = device.createBuffer({
      size: positionData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(positionBuffer.getMappedRange()).set(positionData);
    positionBuffer.unmap();

    velocityBuffer = device.createBuffer({
      size: velocityData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(velocityBuffer.getMappedRange()).set(velocityData);
    velocityBuffer.unmap();

    // Uniform buffer
    const uniformData = new ArrayBuffer(32);
    const uniformView = new DataView(uniformData);
    uniformView.setFloat32(0, params.deltaTime, true);
    uniformView.setFloat32(4, params.gravity, true);
    uniformView.setFloat32(8, params.damping, true);
    uniformView.setUint32(12, params.particleCount, true);
    uniformView.setFloat32(16, params.forceStrength, true);
    uniformView.setFloat32(20, 0, true); // attractor X
    uniformView.setFloat32(24, 0, true); // attractor Y
    uniformView.setFloat32(28, 0, true); // attractor Z

    uniformBuffer = device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Uint8Array(uniformBuffer.getMappedRange()).set(new Uint8Array(uniformData));
    uniformBuffer.unmap();

    // Readback buffer for inspection
    readbackBuffer = device.createBuffer({
      size: Math.min(positionData.byteLength, 32 * 16), // First 32 elements
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    gpuMemoryKB = (positionData.byteLength + velocityData.byteLength + 32) / 1024;
  }
}

// ============================================================================
// COMPUTE PIPELINES
// ============================================================================

function createComputePipelines(): void {
  if (!device) return;

  const shaderCode = currentShader === 'boids' ? BOIDS_SHADER : PARTICLE_SHADER;
  const shaderModule = device.createShaderModule({ code: shaderCode });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: positionBuffer! } },
      { binding: 1, resource: { buffer: velocityBuffer! } },
      { binding: 2, resource: { buffer: uniformBuffer! } },
    ],
  });

  computePasses = [
    {
      name: 'Force Compute',
      pipeline: device.createComputePipeline({
        layout: pipelineLayout,
        compute: { module: shaderModule, entryPoint: 'computeForces' },
      }),
      bindGroup,
      time: 0,
    },
    {
      name: 'Integration',
      pipeline: device.createComputePipeline({
        layout: pipelineLayout,
        compute: { module: shaderModule, entryPoint: 'integrate' },
      }),
      bindGroup,
      time: 0,
    },
    {
      name: 'Collision',
      pipeline: device.createComputePipeline({
        layout: pipelineLayout,
        compute: { module: shaderModule, entryPoint: 'collisions' },
      }),
      bindGroup,
      time: 0,
    },
  ];
}

// ============================================================================
// COMPUTE DISPATCH
// ============================================================================

function runComputePass(): void {
  if (!device || !isRunning) return;

  const startTime = performance.now();
  const workgroupCount = Math.ceil(particleCount / 256);

  const commandEncoder = device.createCommandEncoder();

  for (const pass of computePasses) {
    if (!pass.pipeline || !pass.bindGroup) continue;

    const passStart = performance.now();
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(pass.pipeline);
    computePass.setBindGroup(0, pass.bindGroup);
    computePass.dispatchWorkgroups(workgroupCount);
    computePass.end();
    pass.time = performance.now() - passStart;
  }

  device.queue.submit([commandEncoder.finish()]);

  computeTimeMs = performance.now() - startTime;
}

function runCPUFallback(): void {
  if (!isRunning) return;

  const dt = params.deltaTime;
  const gravity = params.gravity;
  const damping = params.damping;
  const force = params.forceStrength;

  for (let i = 0; i < particleCount; i++) {
    const ix = i * 4;
    
    // Apply gravity
    cpuVelocities[ix + 1] -= gravity * dt;

    // Attractor
    const dx = params.attractorPos[0] - cpuPositions[ix];
    const dy = params.attractorPos[1] - cpuPositions[ix + 1];
    const dz = params.attractorPos[2] - cpuPositions[ix + 2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (dist > 0.1) {
      const f = force / (dist * dist + 1);
      cpuVelocities[ix] += (dx / dist) * f * dt;
      cpuVelocities[ix + 1] += (dy / dist) * f * dt;
      cpuVelocities[ix + 2] += (dz / dist) * f * dt;
    }

    // Damping
    cpuVelocities[ix] *= (1 - damping * dt);
    cpuVelocities[ix + 1] *= (1 - damping * dt);
    cpuVelocities[ix + 2] *= (1 - damping * dt);

    // Integrate
    cpuPositions[ix] += cpuVelocities[ix] * dt;
    cpuPositions[ix + 1] += cpuVelocities[ix + 1] * dt;
    cpuPositions[ix + 2] += cpuVelocities[ix + 2] * dt;

    // Boundaries
    const bounds = 10;
    const bounce = 0.7;
    for (let j = 0; j < 3; j++) {
      if (cpuPositions[ix + j] < -bounds) {
        cpuPositions[ix + j] = -bounds;
        cpuVelocities[ix + j] *= -bounce;
      }
      if (cpuPositions[ix + j] > bounds) {
        cpuPositions[ix + j] = bounds;
        cpuVelocities[ix + j] *= -bounce;
      }
    }
  }
}

// ============================================================================
// THREE.JS SCENE
// ============================================================================

function initThreeJS(): void {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0f);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(15, 10, 15);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.getElementById('app')!.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Create particle system
  particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const hue = (i / particleCount) * 0.3 + 0.5;
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  particleMaterial = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // Add boundary box
  const boxGeom = new THREE.BoxGeometry(20, 20, 20);
  const boxMat = new THREE.MeshBasicMaterial({ 
    color: 0x00d9ff, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.1 
  });
  const boundaryBox = new THREE.Mesh(boxGeom, boxMat);
  scene.add(boundaryBox);

  // Add grid
  const grid = new THREE.GridHelper(20, 20, 0x333344, 0x222233);
  grid.position.y = -10;
  scene.add(grid);

  // Add attractor indicator
  const attractorGeom = new THREE.SphereGeometry(0.3, 16, 16);
  const attractorMat = new THREE.MeshBasicMaterial({ color: 0xff6b9d });
  const attractor = new THREE.Mesh(attractorGeom, attractorMat);
  attractor.name = 'attractor';
  scene.add(attractor);
}

// ============================================================================
// 3LENS INTEGRATION
// ============================================================================

function initProbe(): void {
  probe = createProbe({ appName: 'Compute-Shaders' });
  createOverlay({ probe, theme: 'dark' });

  probe.registerLogicalEntity({
    id: 'compute-simulation',
    name: 'GPU Compute Simulation',
    type: 'compute-system',
    object3D: particleSystem,
    metadata: {
      particleCount,
      shaderType: currentShader,
      workgroupSize: 256,
      bufferCount: 3,
    }
  });

  computePasses.forEach((pass, i) => {
    probe.registerLogicalEntity({
      id: `compute-pass-${i}`,
      name: pass.name,
      type: 'compute-pass',
      metadata: {
        index: i,
        entryPoint: pass.name.toLowerCase().replace(' ', ''),
      }
    });
  });
}

// ============================================================================
// UPDATE LOOP
// ============================================================================

async function updateParticlePositions(): Promise<void> {
  if (device && positionBuffer && readbackBuffer) {
    // Copy positions from GPU
    const commandEncoder = device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(positionBuffer, 0, readbackBuffer, 0, readbackBuffer.size);
    device.queue.submit([commandEncoder.finish()]);

    // Map and read
    await readbackBuffer.mapAsync(GPUMapMode.READ);
    const data = new Float32Array(readbackBuffer.getMappedRange());
    
    // Update Three.js geometry
    const positions = particleGeometry.attributes.position.array as Float32Array;
    for (let i = 0; i < Math.min(particleCount, data.length / 4); i++) {
      positions[i * 3] = data[i * 4];
      positions[i * 3 + 1] = data[i * 4 + 1];
      positions[i * 3 + 2] = data[i * 4 + 2];
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // Update buffer data display
    updateBufferDataDisplay(data);

    readbackBuffer.unmap();
  } else {
    // CPU fallback
    const positions = particleGeometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = cpuPositions[i * 4];
      positions[i * 3 + 1] = cpuPositions[i * 4 + 1];
      positions[i * 3 + 2] = cpuPositions[i * 4 + 2];
    }
    particleGeometry.attributes.position.needsUpdate = true;
    updateBufferDataDisplay(cpuPositions);
  }
}

function updateBufferDataDisplay(data: Float32Array): void {
  const grid = document.getElementById('buffer-data')!;
  const cells = grid.querySelectorAll('.data-cell:not(.header)');
  
  // Remove existing non-header cells
  cells.forEach(cell => cell.remove());

  // Add data cells (first 8 rows = 32 values)
  for (let i = 0; i < 8 && i < data.length / 4; i++) {
    for (let j = 0; j < 4; j++) {
      const cell = document.createElement('div');
      cell.className = 'data-cell' + (i === 0 ? ' highlight' : '');
      cell.textContent = data[i * 4 + j].toFixed(2);
      grid.appendChild(cell);
    }
  }
}

// ============================================================================
// UI
// ============================================================================

function setupUI(): void {
  // Shader selection
  document.querySelectorAll('.shader-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shader-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentShader = btn.getAttribute('data-shader') as ShaderType;
      if (device) {
        createComputePipelines();
      }
      updateShaderCode();
    });
  });

  // Buffer selection
  document.querySelectorAll('.buffer-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.buffer-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      const bufferName = item.getAttribute('data-buffer');
      document.getElementById('selected-buffer-name')!.textContent = 
        bufferName!.charAt(0).toUpperCase() + bufferName!.slice(1);
    });
  });

  // Data tabs
  document.querySelectorAll('.data-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.data-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.getAttribute('data-tab');
      document.getElementById('data-view')!.style.display = tabName === 'data' ? 'block' : 'none';
      document.getElementById('shader-view')!.style.display = tabName === 'shader' ? 'block' : 'none';
      document.getElementById('debug-view')!.style.display = tabName === 'debug' ? 'block' : 'none';
    });
  });

  // Sliders
  const particleSlider = document.getElementById('particle-slider') as HTMLInputElement;
  particleSlider.addEventListener('input', () => {
    const power = parseInt(particleSlider.value);
    particleCount = Math.pow(2, power);
    params.particleCount = particleCount;
    document.getElementById('particle-value')!.textContent = particleCount.toLocaleString();
    document.getElementById('total-threads')!.textContent = particleCount.toLocaleString();
    document.getElementById('invocations')!.textContent = particleCount.toLocaleString();
    
    const workgroups = Math.ceil(particleCount / 256);
    document.getElementById('workgroup-count')!.textContent = workgroups.toString();
    document.getElementById('dispatch-size')!.textContent = `${workgroups} × 1 × 1`;
  });

  const timestepSlider = document.getElementById('timestep-slider') as HTMLInputElement;
  timestepSlider.addEventListener('input', () => {
    params.deltaTime = parseInt(timestepSlider.value) / 1000;
    document.getElementById('timestep-value')!.textContent = params.deltaTime.toFixed(3);
  });

  const forceSlider = document.getElementById('force-slider') as HTMLInputElement;
  forceSlider.addEventListener('input', () => {
    params.forceStrength = parseInt(forceSlider.value);
    document.getElementById('force-value')!.textContent = `${params.forceStrength}%`;
  });

  // Action buttons
  document.getElementById('run-btn')!.addEventListener('click', () => {
    isRunning = !isRunning;
    const btn = document.getElementById('run-btn')!;
    btn.textContent = isRunning ? '⏸ Pause' : '▶ Run';
  });

  document.getElementById('step-btn')!.addEventListener('click', () => {
    if (!isRunning) {
      if (device) {
        runComputePass();
      } else {
        runCPUFallback();
      }
    }
  });

  document.getElementById('reset-btn')!.addEventListener('click', () => {
    createBuffers();
    if (device) {
      createComputePipelines();
    }
  });

  // Window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Mouse attractor
  renderer.domElement.addEventListener('mousemove', (e) => {
    if (e.buttons === 2) { // Right mouse button
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      const vector = new THREE.Vector3(x, y, 0.5);
      vector.unproject(camera);
      vector.sub(camera.position).normalize();
      const distance = -camera.position.z / vector.z;
      const pos = camera.position.clone().add(vector.multiplyScalar(distance));
      
      params.attractorPos[0] = pos.x;
      params.attractorPos[1] = pos.y;
      params.attractorPos[2] = pos.z;

      // Update uniform buffer
      if (device && uniformBuffer) {
        const data = new Float32Array([
          params.deltaTime,
          params.gravity,
          params.damping,
          params.particleCount,
          params.forceStrength,
          params.attractorPos[0],
          params.attractorPos[1],
          params.attractorPos[2],
        ]);
        device.queue.writeBuffer(uniformBuffer, 0, data);
      }

      // Update attractor indicator
      const attractor = scene.getObjectByName('attractor');
      if (attractor) {
        attractor.position.set(pos.x, pos.y, pos.z);
      }
    }
  });

  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
}

function updateShaderCode(): void {
  // Update the WGSL code display based on selected shader
  // This is already set in HTML, but could be dynamic
}

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
  document.getElementById('frame-count')!.textContent = Math.floor(now / 16.67).toString();
  document.getElementById('compute-time')!.textContent = computeTimeMs.toFixed(2);
  document.getElementById('gpu-memory')!.textContent = `${Math.round(gpuMemoryKB)} KB`;

  // Throughput
  const throughput = (particleCount / computeTimeMs) * 1000;
  let throughputStr: string;
  if (throughput > 1e9) {
    throughputStr = `${(throughput / 1e9).toFixed(1)}B`;
  } else if (throughput > 1e6) {
    throughputStr = `${(throughput / 1e6).toFixed(1)}M`;
  } else {
    throughputStr = `${(throughput / 1e3).toFixed(1)}K`;
  }
  document.getElementById('throughput')!.textContent = throughputStr;

  // Pass timing
  if (computePasses.length >= 3) {
    document.getElementById('force-time')!.textContent = `${computePasses[0].time.toFixed(2)} ms`;
    document.getElementById('integration-time')!.textContent = `${computePasses[1].time.toFixed(2)} ms`;
    document.getElementById('collision-time')!.textContent = `${computePasses[2].time.toFixed(2)} ms`;

    const maxTime = Math.max(...computePasses.map(p => p.time), 0.01);
    document.getElementById('force-bar')!.style.width = `${(computePasses[0].time / maxTime) * 100}%`;
    document.getElementById('integration-bar')!.style.width = `${(computePasses[1].time / maxTime) * 100}%`;
    document.getElementById('collision-bar')!.style.width = `${(computePasses[2].time / maxTime) * 100}%`;
  }
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

async function animate(): Promise<void> {
  requestAnimationFrame(animate);

  // Run compute
  if (device) {
    runComputePass();
  } else {
    const start = performance.now();
    runCPUFallback();
    computeTimeMs = performance.now() - start;
  }

  // Update Three.js
  await updateParticlePositions();

  controls.update();
  renderer.render(scene, camera);

  updateStats();
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  // Initialize Three.js first (always works)
  initThreeJS();

  // Try to initialize WebGPU
  const hasWebGPU = await initWebGPU();

  // Create buffers (GPU or CPU)
  createBuffers();

  // Create compute pipelines if WebGPU available
  if (hasWebGPU) {
    createComputePipelines();
  }

  // Initialize 3Lens
  initProbe();

  // Setup UI
  setupUI();

  // Start animation
  animate();
}

main();
