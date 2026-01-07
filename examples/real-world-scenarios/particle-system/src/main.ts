import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ───────────────────────────────────────────────────────────────
// Types & Interfaces
// ───────────────────────────────────────────────────────────────

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
  lifetime: number;
  size: number;
  startSize: number;
  endSize: number;
  color: THREE.Color;
  startColor: THREE.Color;
  endColor: THREE.Color;
  active: boolean;
  index: number;
}

interface EmitterConfig {
  emissionRate: number;
  maxParticles: number;
  lifetime: number;
  lifetimeVariance: number;
  initialSpeed: number;
  speedVariance: number;
  spreadAngle: number;
  gravity: THREE.Vector3;
  startSize: number;
  endSize: number;
  startColor: THREE.Color;
  endColor: THREE.Color;
  opacity: number;
  blending: THREE.Blending;
}

interface EmitterPreset extends Partial<EmitterConfig> {
  name: string;
}

// ───────────────────────────────────────────────────────────────
// Emitter Presets
// ───────────────────────────────────────────────────────────────

const PRESETS: Record<string, EmitterPreset> = {
  fountain: {
    name: 'Fountain',
    emissionRate: 500,
    lifetime: 2,
    initialSpeed: 8,
    spreadAngle: 15,
    gravity: new THREE.Vector3(0, -9.8, 0),
    startSize: 0.08,
    endSize: 0.02,
    startColor: new THREE.Color(0x60a5fa),
    endColor: new THREE.Color(0x22d3ee),
    blending: THREE.AdditiveBlending,
  },
  fire: {
    name: 'Fire',
    emissionRate: 800,
    lifetime: 1.5,
    initialSpeed: 3,
    spreadAngle: 20,
    gravity: new THREE.Vector3(0, 2, 0),
    startSize: 0.15,
    endSize: 0.01,
    startColor: new THREE.Color(0xfbbf24),
    endColor: new THREE.Color(0xef4444),
    blending: THREE.AdditiveBlending,
  },
  snow: {
    name: 'Snow',
    emissionRate: 200,
    lifetime: 8,
    initialSpeed: 0.5,
    spreadAngle: 180,
    gravity: new THREE.Vector3(0, -1, 0),
    startSize: 0.05,
    endSize: 0.05,
    startColor: new THREE.Color(0xffffff),
    endColor: new THREE.Color(0xe0e7ff),
    blending: THREE.NormalBlending,
  },
  sparks: {
    name: 'Sparks',
    emissionRate: 300,
    lifetime: 0.8,
    initialSpeed: 12,
    spreadAngle: 60,
    gravity: new THREE.Vector3(0, -15, 0),
    startSize: 0.04,
    endSize: 0.01,
    startColor: new THREE.Color(0xfef3c7),
    endColor: new THREE.Color(0xf97316),
    blending: THREE.AdditiveBlending,
  },
  smoke: {
    name: 'Smoke',
    emissionRate: 100,
    lifetime: 4,
    initialSpeed: 1.5,
    spreadAngle: 25,
    gravity: new THREE.Vector3(0, 1, 0),
    startSize: 0.1,
    endSize: 0.5,
    startColor: new THREE.Color(0x6b7280),
    endColor: new THREE.Color(0x1f2937),
    opacity: 0.5,
    blending: THREE.NormalBlending,
  },
  confetti: {
    name: 'Confetti',
    emissionRate: 400,
    lifetime: 3,
    initialSpeed: 10,
    spreadAngle: 45,
    gravity: new THREE.Vector3(0, -5, 0),
    startSize: 0.12,
    endSize: 0.08,
    startColor: new THREE.Color(0xf472b6),
    endColor: new THREE.Color(0x8b5cf6),
    blending: THREE.NormalBlending,
  },
  rain: {
    name: 'Rain',
    emissionRate: 1000,
    lifetime: 2,
    initialSpeed: 15,
    spreadAngle: 5,
    gravity: new THREE.Vector3(0, -20, 0),
    startSize: 0.02,
    endSize: 0.02,
    startColor: new THREE.Color(0x93c5fd),
    endColor: new THREE.Color(0x60a5fa),
    blending: THREE.AdditiveBlending,
  },
  magic: {
    name: 'Magic',
    emissionRate: 300,
    lifetime: 2.5,
    initialSpeed: 2,
    spreadAngle: 360,
    gravity: new THREE.Vector3(0, 0.5, 0),
    startSize: 0.08,
    endSize: 0.15,
    startColor: new THREE.Color(0xa855f7),
    endColor: new THREE.Color(0x22d3ee),
    blending: THREE.AdditiveBlending,
  },
};

// ───────────────────────────────────────────────────────────────
// Particle System Class
// ───────────────────────────────────────────────────────────────

class ParticleSystem {
  private particles: Particle[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  private config: EmitterConfig;
  
  // Buffers
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  
  // Stats
  private activeCount = 0;
  private emitAccumulator = 0;
  private emittedThisSecond = 0;
  private recycledThisSecond = 0;
  private lastStatsReset = 0;
  
  // State
  public isEmitting = true;
  
  constructor(maxParticles: number = 10000) {
    // Initialize config with defaults
    this.config = {
      emissionRate: 500,
      maxParticles: maxParticles,
      lifetime: 2,
      lifetimeVariance: 0.2,
      initialSpeed: 5,
      speedVariance: 0.3,
      spreadAngle: 30,
      gravity: new THREE.Vector3(0, -9.8, 0),
      startSize: 0.1,
      endSize: 0.02,
      startColor: new THREE.Color(0xf472b6),
      endColor: new THREE.Color(0x22d3ee),
      opacity: 1,
      blending: THREE.AdditiveBlending,
    };
    
    // Create buffers
    this.positions = new Float32Array(maxParticles * 3);
    this.colors = new Float32Array(maxParticles * 3);
    this.sizes = new Float32Array(maxParticles);
    
    // Initialize particle pool
    for (let i = 0; i < maxParticles; i++) {
      this.particles.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        age: 0,
        lifetime: 0,
        size: 0,
        startSize: 0,
        endSize: 0,
        color: new THREE.Color(),
        startColor: new THREE.Color(),
        endColor: new THREE.Color(),
        active: false,
        index: i,
      });
      
      // Initialize buffers to hidden
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = -1000; // Off-screen
      this.positions[i * 3 + 2] = 0;
      this.sizes[i] = 0;
    }
    
    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.name = 'ParticleGeometry';
    
    // Create material
    this.material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: this.config.opacity,
      blending: this.config.blending,
      sizeAttenuation: true,
      depthWrite: false,
    });
    this.material.name = 'ParticleMaterial';
    
    // Create points mesh
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.name = 'ParticleSystem';
    this.points.frustumCulled = false;
  }
  
  get mesh(): THREE.Points {
    return this.points;
  }
  
  get stats() {
    return {
      active: this.activeCount,
      pool: this.config.maxParticles,
      emittedPerSecond: this.emittedThisSecond,
      recycledPerSecond: this.recycledThisSecond,
    };
  }
  
  setConfig(config: Partial<EmitterConfig>) {
    Object.assign(this.config, config);
    
    if (config.opacity !== undefined) {
      this.material.opacity = config.opacity;
    }
    if (config.blending !== undefined) {
      this.material.blending = config.blending;
    }
  }
  
  applyPreset(presetName: string) {
    const preset = PRESETS[presetName];
    if (!preset) return;
    
    const config: Partial<EmitterConfig> = { ...preset };
    delete (config as any).name;
    this.setConfig(config);
  }
  
  private getInactiveParticle(): Particle | null {
    for (const p of this.particles) {
      if (!p.active) return p;
    }
    return null;
  }
  
  private emitParticle() {
    const particle = this.getInactiveParticle();
    if (!particle) return;
    
    // Position at emitter origin
    particle.position.set(0, 0, 0);
    
    // Calculate velocity with spread
    const spreadRad = THREE.MathUtils.degToRad(this.config.spreadAngle);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * spreadRad;
    
    const speed = this.config.initialSpeed * (1 + (Math.random() - 0.5) * this.config.speedVariance * 2);
    
    particle.velocity.set(
      Math.sin(phi) * Math.cos(theta) * speed,
      Math.cos(phi) * speed,
      Math.sin(phi) * Math.sin(theta) * speed
    );
    
    // Lifetime
    particle.lifetime = this.config.lifetime * (1 + (Math.random() - 0.5) * this.config.lifetimeVariance * 2);
    particle.age = 0;
    
    // Size
    particle.startSize = this.config.startSize;
    particle.endSize = this.config.endSize;
    particle.size = particle.startSize;
    
    // Color
    particle.startColor.copy(this.config.startColor);
    particle.endColor.copy(this.config.endColor);
    particle.color.copy(particle.startColor);
    
    // For confetti, randomize colors
    if (this.config === PRESETS.confetti || this.material.blending === THREE.NormalBlending) {
      const hue = Math.random();
      particle.startColor.setHSL(hue, 0.8, 0.6);
      particle.endColor.setHSL((hue + 0.1) % 1, 0.8, 0.4);
      particle.color.copy(particle.startColor);
    }
    
    particle.active = true;
    this.activeCount++;
    this.emittedThisSecond++;
  }
  
  burst(count: number = 100) {
    for (let i = 0; i < count; i++) {
      this.emitParticle();
    }
  }
  
  clear() {
    for (const particle of this.particles) {
      particle.active = false;
      const i = particle.index;
      this.positions[i * 3 + 1] = -1000;
      this.sizes[i] = 0;
    }
    this.activeCount = 0;
  }
  
  update(deltaTime: number) {
    // Stats reset every second
    const now = performance.now();
    if (now - this.lastStatsReset > 1000) {
      this.emittedThisSecond = 0;
      this.recycledThisSecond = 0;
      this.lastStatsReset = now;
    }
    
    // Emit new particles
    if (this.isEmitting) {
      this.emitAccumulator += this.config.emissionRate * deltaTime;
      while (this.emitAccumulator >= 1) {
        this.emitParticle();
        this.emitAccumulator--;
      }
    }
    
    // Update existing particles
    for (const particle of this.particles) {
      if (!particle.active) continue;
      
      // Age
      particle.age += deltaTime;
      
      // Check if dead
      if (particle.age >= particle.lifetime) {
        particle.active = false;
        this.activeCount--;
        this.recycledThisSecond++;
        
        // Hide particle
        const i = particle.index;
        this.positions[i * 3 + 1] = -1000;
        this.sizes[i] = 0;
        continue;
      }
      
      // Progress (0 to 1)
      const t = particle.age / particle.lifetime;
      
      // Apply gravity
      particle.velocity.add(
        this.config.gravity.clone().multiplyScalar(deltaTime)
      );
      
      // Update position
      particle.position.add(
        particle.velocity.clone().multiplyScalar(deltaTime)
      );
      
      // Interpolate size
      particle.size = THREE.MathUtils.lerp(particle.startSize, particle.endSize, t);
      
      // Interpolate color
      particle.color.lerpColors(particle.startColor, particle.endColor, t);
      
      // Update buffers
      const i = particle.index;
      this.positions[i * 3] = particle.position.x;
      this.positions[i * 3 + 1] = particle.position.y;
      this.positions[i * 3 + 2] = particle.position.z;
      
      this.colors[i * 3] = particle.color.r;
      this.colors[i * 3 + 1] = particle.color.g;
      this.colors[i * 3 + 2] = particle.color.b;
      
      this.sizes[i] = particle.size;
    }
    
    // Mark buffers as needing update
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }
  
  getMemoryUsage(): number {
    // Estimate buffer memory
    const positionBytes = this.positions.byteLength;
    const colorBytes = this.colors.byteLength;
    const sizeBytes = this.sizes.byteLength;
    return positionBytes + colorBytes + sizeBytes;
  }
}

// ───────────────────────────────────────────────────────────────
// Scene Setup
// ───────────────────────────────────────────────────────────────

const container = document.getElementById('canvas-container')!;

// Scene
const scene = new THREE.Scene();
scene.name = 'ParticleScene';
scene.background = new THREE.Color(0x0a0e14);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.name = 'MainCamera';
camera.position.set(0, 3, 8);
camera.lookAt(0, 2, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 2, 0);

// ───────────────────────────────────────────────────────────────
// Lighting & Environment
// ───────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

// Ground grid
const gridHelper = new THREE.GridHelper(20, 40, 0x374151, 0x1f2937);
gridHelper.name = 'GridHelper';
scene.add(gridHelper);

// Emitter indicator
const emitterGeometry = new THREE.SphereGeometry(0.1, 16, 16);
emitterGeometry.name = 'EmitterIndicatorGeometry';
const emitterMaterial = new THREE.MeshBasicMaterial({
  color: 0xf472b6,
  transparent: true,
  opacity: 0.8,
});
emitterMaterial.name = 'EmitterIndicatorMaterial';
const emitterIndicator = new THREE.Mesh(emitterGeometry, emitterMaterial);
emitterIndicator.name = 'EmitterIndicator';
scene.add(emitterIndicator);

// ───────────────────────────────────────────────────────────────
// Particle System
// ───────────────────────────────────────────────────────────────

let particleSystem = new ParticleSystem(10000);
scene.add(particleSystem.mesh);

// Apply default preset
particleSystem.applyPreset('fountain');

// ───────────────────────────────────────────────────────────────
// 3Lens Integration
// ───────────────────────────────────────────────────────────────

const probe = createProbe({
  appName: 'Particle System Debugger',
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setThreeReference(THREE);

probe.initializeTransformGizmo(scene, camera, renderer.domElement, THREE);
probe.initializeCameraController(camera, THREE);

createOverlay(probe);

// ───────────────────────────────────────────────────────────────
// UI Controls
// ───────────────────────────────────────────────────────────────

// Helper to update slider display
function updateSliderValue(id: string, value: string | number) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

// Preset buttons
const presetButtons = document.querySelectorAll('.preset-btn');
presetButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    presetButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    
    const presetName = btn.id.replace('preset-', '');
    particleSystem.applyPreset(presetName);
    
    // Update UI to reflect preset values
    const preset = PRESETS[presetName];
    if (preset) {
      if (preset.emissionRate !== undefined) {
        (document.getElementById('emission-rate') as HTMLInputElement).value = String(preset.emissionRate);
        updateSliderValue('rate-value', preset.emissionRate);
      }
      if (preset.lifetime !== undefined) {
        (document.getElementById('particle-lifetime') as HTMLInputElement).value = String(preset.lifetime);
        updateSliderValue('lifetime-value', preset.lifetime.toFixed(1));
      }
      if (preset.initialSpeed !== undefined) {
        (document.getElementById('initial-speed') as HTMLInputElement).value = String(preset.initialSpeed);
        updateSliderValue('speed-value', preset.initialSpeed.toFixed(1));
      }
      if (preset.spreadAngle !== undefined) {
        (document.getElementById('spread-angle') as HTMLInputElement).value = String(preset.spreadAngle);
        updateSliderValue('spread-value', preset.spreadAngle);
      }
      if (preset.gravity !== undefined) {
        (document.getElementById('gravity') as HTMLInputElement).value = String(preset.gravity.y);
        updateSliderValue('gravity-value', preset.gravity.y.toFixed(1));
      }
      if (preset.startSize !== undefined) {
        (document.getElementById('start-size') as HTMLInputElement).value = String(preset.startSize);
        updateSliderValue('start-size-value', preset.startSize.toFixed(2));
      }
      if (preset.endSize !== undefined) {
        (document.getElementById('end-size') as HTMLInputElement).value = String(preset.endSize);
        updateSliderValue('end-size-value', preset.endSize.toFixed(2));
      }
      if (preset.startColor !== undefined) {
        const hex = '#' + preset.startColor.getHexString();
        (document.getElementById('start-color') as HTMLInputElement).value = hex;
        document.getElementById('start-color-hex')!.textContent = hex;
      }
      if (preset.endColor !== undefined) {
        const hex = '#' + preset.endColor.getHexString();
        (document.getElementById('end-color') as HTMLInputElement).value = hex;
        document.getElementById('end-color-hex')!.textContent = hex;
      }
      if (preset.opacity !== undefined) {
        (document.getElementById('opacity') as HTMLInputElement).value = String(preset.opacity);
        updateSliderValue('opacity-value', preset.opacity.toFixed(1));
      }
      
      // Update blending buttons
      const addBtn = document.getElementById('btn-additive')!;
      const transBtn = document.getElementById('btn-transparent')!;
      if (preset.blending === THREE.AdditiveBlending) {
        addBtn.classList.add('active');
        transBtn.classList.remove('active');
      } else {
        addBtn.classList.remove('active');
        transBtn.classList.add('active');
      }
    }
  });
});

// Emission controls
document.getElementById('emission-rate')!.addEventListener('input', (e) => {
  const value = parseInt((e.target as HTMLInputElement).value);
  updateSliderValue('rate-value', value);
  particleSystem.setConfig({ emissionRate: value });
});

document.getElementById('max-particles')!.addEventListener('input', (e) => {
  const value = parseInt((e.target as HTMLInputElement).value);
  updateSliderValue('max-value', value);
  // Note: Changing max particles requires recreating the system
  scene.remove(particleSystem.mesh);
  particleSystem = new ParticleSystem(value);
  scene.add(particleSystem.mesh);
  // Reapply current config
  const currentPreset = document.querySelector('.preset-btn.active')?.id.replace('preset-', '');
  if (currentPreset) {
    particleSystem.applyPreset(currentPreset);
  }
});

document.getElementById('particle-lifetime')!.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  updateSliderValue('lifetime-value', value.toFixed(1));
  particleSystem.setConfig({ lifetime: value });
});

// Velocity controls
document.getElementById('initial-speed')!.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  updateSliderValue('speed-value', value.toFixed(1));
  particleSystem.setConfig({ initialSpeed: value });
});

document.getElementById('spread-angle')!.addEventListener('input', (e) => {
  const value = parseInt((e.target as HTMLInputElement).value);
  updateSliderValue('spread-value', value);
  particleSystem.setConfig({ spreadAngle: value });
});

document.getElementById('gravity')!.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  updateSliderValue('gravity-value', value.toFixed(1));
  particleSystem.setConfig({ gravity: new THREE.Vector3(0, value, 0) });
});

// Size controls
document.getElementById('start-size')!.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  updateSliderValue('start-size-value', value.toFixed(2));
  particleSystem.setConfig({ startSize: value });
});

document.getElementById('end-size')!.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  updateSliderValue('end-size-value', value.toFixed(2));
  particleSystem.setConfig({ endSize: value });
});

// Color controls
document.getElementById('start-color')!.addEventListener('input', (e) => {
  const value = (e.target as HTMLInputElement).value;
  document.getElementById('start-color-hex')!.textContent = value;
  particleSystem.setConfig({ startColor: new THREE.Color(value) });
});

document.getElementById('end-color')!.addEventListener('input', (e) => {
  const value = (e.target as HTMLInputElement).value;
  document.getElementById('end-color-hex')!.textContent = value;
  particleSystem.setConfig({ endColor: new THREE.Color(value) });
});

document.getElementById('opacity')!.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  updateSliderValue('opacity-value', value.toFixed(1));
  particleSystem.setConfig({ opacity: value });
});

// Action buttons
const emitBtn = document.getElementById('btn-emit')!;
emitBtn.addEventListener('click', () => {
  particleSystem.isEmitting = !particleSystem.isEmitting;
  emitBtn.textContent = particleSystem.isEmitting ? '⏸️ Pause' : '▶️ Emit';
  emitBtn.classList.toggle('active', particleSystem.isEmitting);
});

document.getElementById('btn-burst')!.addEventListener('click', () => {
  particleSystem.burst(200);
});

document.getElementById('btn-clear')!.addEventListener('click', () => {
  particleSystem.clear();
});

// Blending buttons
document.getElementById('btn-additive')!.addEventListener('click', () => {
  document.getElementById('btn-additive')!.classList.add('active');
  document.getElementById('btn-transparent')!.classList.remove('active');
  particleSystem.setConfig({ blending: THREE.AdditiveBlending });
});

document.getElementById('btn-transparent')!.addEventListener('click', () => {
  document.getElementById('btn-transparent')!.classList.add('active');
  document.getElementById('btn-additive')!.classList.remove('active');
  particleSystem.setConfig({ blending: THREE.NormalBlending });
});

// ───────────────────────────────────────────────────────────────
// Keyboard Shortcuts
// ───────────────────────────────────────────────────────────────

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  
  switch (e.code) {
    case 'Space':
      e.preventDefault();
      emitBtn.click();
      break;
    case 'KeyB':
      particleSystem.burst(200);
      break;
    case 'KeyC':
      particleSystem.clear();
      break;
  }
});

// ───────────────────────────────────────────────────────────────
// Stats Update
// ───────────────────────────────────────────────────────────────

function updateStats() {
  const stats = particleSystem.stats;
  
  const activeEl = document.getElementById('stat-active')!;
  activeEl.textContent = stats.active.toLocaleString();
  activeEl.className = 'stat-value';
  if (stats.active > stats.pool * 0.9) {
    activeEl.classList.add('danger');
  } else if (stats.active > stats.pool * 0.7) {
    activeEl.classList.add('warning');
  }
  
  document.getElementById('stat-pool')!.textContent = stats.pool.toLocaleString();
  document.getElementById('stat-emitted')!.textContent = stats.emittedPerSecond.toLocaleString();
  document.getElementById('stat-recycled')!.textContent = stats.recycledPerSecond.toLocaleString();
  document.getElementById('stat-drawcalls')!.textContent = '1';
  
  const memoryKB = (particleSystem.getMemoryUsage() / 1024).toFixed(1);
  document.getElementById('stat-memory')!.textContent = `${memoryKB} KB`;
}

// ───────────────────────────────────────────────────────────────
// Window Resize
// ───────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ───────────────────────────────────────────────────────────────
// Animation Loop
// ───────────────────────────────────────────────────────────────

const clock = new THREE.Clock();
let statsUpdateTimer = 0;

function animate() {
  requestAnimationFrame(animate);
  
  const deltaTime = Math.min(clock.getDelta(), 0.1); // Cap delta to prevent huge jumps
  
  // Update particle system
  particleSystem.update(deltaTime);
  
  // Animate emitter indicator
  const time = clock.getElapsedTime();
  emitterIndicator.scale.setScalar(1 + Math.sin(time * 4) * 0.1);
  
  // Update controls
  controls.update();
  
  // Update stats periodically
  statsUpdateTimer += deltaTime;
  if (statsUpdateTimer > 0.1) {
    updateStats();
    statsUpdateTimer = 0;
  }
  
  // Render
  renderer.render(scene, camera);
}

// ───────────────────────────────────────────────────────────────
// Initialize
// ───────────────────────────────────────────────────────────────

animate();

console.log('✨ Particle System Debugger with 3Lens DevTools');
console.log('🎮 Use the controls to adjust particle parameters');
console.log('⌨️ Press Ctrl+Shift+D to toggle devtools');
