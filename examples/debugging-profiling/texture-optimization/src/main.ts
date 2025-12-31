import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

/**
 * Texture Optimization Example
 *
 * This example demonstrates different texture optimization strategies:
 * 1. Oversized Textures - 4096x4096 for small objects (wasteful)
 * 2. Appropriate Sizing - Textures sized for actual screen usage
 * 3. Compressed Formats - Simulated GPU-compressed textures
 * 4. Texture Atlas - Multiple textures combined into one
 */

type Scenario = 'oversized' | 'appropriate' | 'compressed' | 'atlas';

interface ScenarioConfig {
  name: string;
  textureSize: number;
  textureCount: number;
  memoryMB: number;
  format: string;
  mipmaps: boolean;
  filtering: string;
  description: string;
}

const SCENARIOS: Record<Scenario, ScenarioConfig> = {
  oversized: {
    name: 'Oversized Textures',
    textureSize: 4096,
    textureCount: 8,
    memoryMB: 128,
    format: 'RGBA8',
    mipmaps: true,
    filtering: 'Linear',
    description: '4096² textures for tiny objects - massive waste!',
  },
  appropriate: {
    name: 'Appropriate Sizing',
    textureSize: 512,
    textureCount: 8,
    memoryMB: 8,
    format: 'RGBA8',
    mipmaps: true,
    filtering: 'Linear',
    description: 'Textures sized for actual screen coverage',
  },
  compressed: {
    name: 'Compressed (BC/DXT)',
    textureSize: 512,
    textureCount: 8,
    memoryMB: 2,
    format: 'BC1/DXT1',
    mipmaps: true,
    filtering: 'Linear',
    description: 'GPU-compressed format, 4:1 compression ratio',
  },
  atlas: {
    name: 'Texture Atlas',
    textureSize: 1024,
    textureCount: 1,
    memoryMB: 1,
    format: 'RGBA8',
    mipmaps: true,
    filtering: 'Linear',
    description: 'All textures in one atlas, minimal state changes',
  },
};

// Scene setup
const scene = new THREE.Scene();
scene.name = 'TextureOptimizationScene';
scene.background = new THREE.Color(0x0d1117);

// Camera
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(8, 6, 12);
camera.name = 'MainCamera';

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('app')!.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// Clock
const clock = new THREE.Clock();

// State
let currentScenario: Scenario = 'oversized';
let sceneObjects: THREE.Object3D[] = [];
let loadStartTime = 0;
let loadEndTime = 0;

// Base scene
function createBaseScene() {
  // Ground
  const groundGeo = new THREE.PlaneGeometry(30, 30);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x161b22,
    roughness: 0.9,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.name = 'Ground';
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  ambient.name = 'AmbientLight';
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.name = 'DirectionalLight';
  directional.position.set(10, 15, 10);
  scene.add(directional);

  // Point lights for visual interest
  const colors = [0x58a6ff, 0x3fb950, 0xf85149];
  colors.forEach((color, i) => {
    const light = new THREE.PointLight(color, 0.5, 15);
    light.position.set(
      Math.cos((i / 3) * Math.PI * 2) * 8,
      3,
      Math.sin((i / 3) * Math.PI * 2) * 8
    );
    scene.add(light);
  });
}

createBaseScene();

// Generate procedural texture pattern
function createProceduralTexture(
  size: number,
  patternIndex: number,
  isCompressed = false
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base color based on pattern index
  const hue = (patternIndex * 45) % 360;
  ctx.fillStyle = `hsl(${hue}, 60%, 30%)`;
  ctx.fillRect(0, 0, size, size);

  // Pattern variations
  const patterns = [
    // Checkerboard
    () => {
      const checkSize = size / 8;
      ctx.fillStyle = `hsl(${hue}, 50%, 40%)`;
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          if ((x + y) % 2 === 0) {
            ctx.fillRect(x * checkSize, y * checkSize, checkSize, checkSize);
          }
        }
      }
    },
    // Circles
    () => {
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      for (let i = 0; i < 16; i++) {
        const x = (i % 4) * (size / 4) + size / 8;
        const y = Math.floor(i / 4) * (size / 4) + size / 8;
        ctx.beginPath();
        ctx.arc(x, y, size / 12, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    // Stripes
    () => {
      ctx.fillStyle = `hsl(${hue}, 65%, 45%)`;
      const stripeWidth = size / 16;
      for (let i = 0; i < 16; i += 2) {
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, size);
      }
    },
    // Grid
    () => {
      ctx.strokeStyle = `hsl(${hue}, 55%, 50%)`;
      ctx.lineWidth = size / 64;
      const gridSize = size / 8;
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(size, i * gridSize);
        ctx.stroke();
      }
    },
    // Dots
    () => {
      ctx.fillStyle = `hsl(${hue}, 75%, 55%)`;
      const spacing = size / 10;
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          ctx.beginPath();
          ctx.arc(
            x * spacing + spacing / 2,
            y * spacing + spacing / 2,
            spacing / 4,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    },
    // Triangles
    () => {
      ctx.fillStyle = `hsl(${hue}, 60%, 48%)`;
      const triSize = size / 6;
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
          if ((row + col) % 2 === 0) {
            const x = col * triSize;
            const y = row * triSize;
            ctx.beginPath();
            ctx.moveTo(x + triSize / 2, y);
            ctx.lineTo(x + triSize, y + triSize);
            ctx.lineTo(x, y + triSize);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    },
    // Gradient
    () => {
      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, `hsl(${hue}, 80%, 60%)`);
      gradient.addColorStop(1, `hsl(${hue}, 60%, 25%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    },
    // Noise-like
    () => {
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 30 - 15;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);
    },
  ];

  patterns[patternIndex % patterns.length]();

  // Add a subtle "compressed" artifact effect for compressed textures
  if (isCompressed) {
    const blockSize = 4;
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    for (let by = 0; by < size; by += blockSize) {
      for (let bx = 0; bx < size; bx += blockSize) {
        // Average the block colors (simulates compression)
        let r = 0,
          g = 0,
          b = 0;
        let count = 0;

        for (let y = by; y < by + blockSize && y < size; y++) {
          for (let x = bx; x < bx + blockSize && x < size; x++) {
            const idx = (y * size + x) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        // Quantize to fewer colors (simulates BC1 compression)
        r = Math.round(r / 8) * 8;
        g = Math.round(g / 8) * 8;
        b = Math.round(b / 8) * 8;

        for (let y = by; y < by + blockSize && y < size; y++) {
          for (let x = bx; x < bx + blockSize && x < size; x++) {
            const idx = (y * size + x) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = `Texture_${patternIndex}_${size}`;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

// Create texture atlas
function createTextureAtlas(size: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cellSize = size / 4;

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const index = row * 4 + col;
      const hue = index * 22;

      ctx.fillStyle = `hsl(${hue}, 60%, 35%)`;
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

      // Add pattern
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      const cx = col * cellSize + cellSize / 2;
      const cy = row * cellSize + cellSize / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize / 3, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = `hsl(${hue}, 50%, 25%)`;
      ctx.lineWidth = 2;
      ctx.strokeRect(col * cellSize + 1, row * cellSize + 1, cellSize - 2, cellSize - 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'TextureAtlas';
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

// Clear scene objects
function clearSceneObjects() {
  sceneObjects.forEach((obj) => {
    scene.remove(obj);
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    });
  });
  sceneObjects = [];
}

// Create cubes with individual textures
function createIndividualTexturedCubes(
  textureSize: number,
  count: number,
  isCompressed = false
) {
  const group = new THREE.Group();
  group.name = `TexturedCubes_${textureSize}`;

  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

  for (let i = 0; i < count; i++) {
    const texture = createProceduralTexture(textureSize, i, isCompressed);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.6,
      metalness: 0.2,
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.name = `Cube_${i}`;

    // Arrange in a circle
    const angle = (i / count) * Math.PI * 2;
    const radius = 4;
    cube.position.set(
      Math.cos(angle) * radius,
      0.75,
      Math.sin(angle) * radius
    );
    cube.rotation.y = -angle;

    group.add(cube);
  }

  scene.add(group);
  sceneObjects.push(group);
}

// Create cubes with texture atlas
function createAtlasTexturedCubes(count: number) {
  const group = new THREE.Group();
  group.name = 'AtlasTexturedCubes';

  const atlasTexture = createTextureAtlas(1024);
  const cellsPerRow = 4;
  const uvSize = 1 / cellsPerRow;

  for (let i = 0; i < count; i++) {
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

    // Modify UVs to sample from atlas cell
    const uvAttr = geometry.getAttribute('uv');
    const row = Math.floor(i / cellsPerRow) % cellsPerRow;
    const col = i % cellsPerRow;
    const uOffset = col * uvSize;
    const vOffset = 1 - (row + 1) * uvSize;

    for (let j = 0; j < uvAttr.count; j++) {
      const u = uvAttr.getX(j) * uvSize + uOffset;
      const v = uvAttr.getY(j) * uvSize + vOffset;
      uvAttr.setXY(j, u, v);
    }

    const material = new THREE.MeshStandardMaterial({
      map: atlasTexture,
      roughness: 0.6,
      metalness: 0.2,
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.name = `AtlasCube_${i}`;

    const angle = (i / count) * Math.PI * 2;
    const radius = 4;
    cube.position.set(
      Math.cos(angle) * radius,
      0.75,
      Math.sin(angle) * radius
    );
    cube.rotation.y = -angle;

    group.add(cube);
  }

  scene.add(group);
  sceneObjects.push(group);
}

// Set scenario
function setScenario(scenario: Scenario) {
  loadStartTime = performance.now();
  currentScenario = scenario;

  clearSceneObjects();

  const config = SCENARIOS[scenario];

  switch (scenario) {
    case 'oversized':
      createIndividualTexturedCubes(4096, 8, false);
      break;
    case 'appropriate':
      createIndividualTexturedCubes(512, 8, false);
      break;
    case 'compressed':
      createIndividualTexturedCubes(512, 8, true);
      break;
    case 'atlas':
      createAtlasTexturedCubes(8);
      break;
  }

  loadEndTime = performance.now();

  // Update UI
  document.querySelectorAll('.scenario-btn').forEach((btn) => {
    btn.classList.toggle(
      'active',
      btn.getAttribute('data-scenario') === scenario
    );
  });

  updateStats(config);
  updateTexturePreviews();
}

// Update statistics display
function updateStats(config: ScenarioConfig) {
  // Memory value
  const memoryEl = document.getElementById('memory-value');
  if (memoryEl) {
    memoryEl.textContent = `${config.memoryMB} MB`;
    memoryEl.className = 'memory-value';
    if (config.memoryMB <= 2) {
      memoryEl.classList.add('good');
    } else if (config.memoryMB <= 16) {
      memoryEl.classList.add('warn');
    } else {
      memoryEl.classList.add('bad');
    }
  }

  // Memory bar
  const memoryBar = document.getElementById('memory-bar-fill');
  if (memoryBar) {
    const percent = Math.min(100, (config.memoryMB / 128) * 100);
    memoryBar.style.width = `${percent}%`;
    memoryBar.className = 'memory-bar-fill';
    if (config.memoryMB <= 2) {
      // keep default (green)
    } else if (config.memoryMB <= 16) {
      memoryBar.classList.add('warn');
    } else {
      memoryBar.classList.add('bad');
    }
  }

  // Breakdown stats
  const texturesEl = document.getElementById('stat-textures');
  if (texturesEl) texturesEl.textContent = config.textureCount.toString();

  const maxSizeEl = document.getElementById('stat-max-size');
  if (maxSizeEl) maxSizeEl.textContent = `${config.textureSize}²`;

  const formatEl = document.getElementById('stat-format');
  if (formatEl) formatEl.textContent = config.format;

  // Detail stats
  const loadTimeEl = document.getElementById('stat-loadtime');
  if (loadTimeEl) {
    loadTimeEl.textContent = `${(loadEndTime - loadStartTime).toFixed(1)}ms`;
  }

  const drawCallsEl = document.getElementById('stat-drawcalls');
  if (drawCallsEl) {
    drawCallsEl.textContent = currentScenario === 'atlas' ? '1' : '8';
  }

  const mipmapsEl = document.getElementById('stat-mipmaps');
  if (mipmapsEl) {
    mipmapsEl.textContent = config.mipmaps ? 'Enabled' : 'Disabled';
  }

  const filteringEl = document.getElementById('stat-filtering');
  if (filteringEl) {
    filteringEl.textContent = config.filtering;
  }
}

// Update texture preview grid
function updateTexturePreviews() {
  const container = document.getElementById('texture-previews');
  if (!container) return;

  container.innerHTML = '';

  // Find textures in scene
  const textures: { texture: THREE.Texture; size: number }[] = [];

  sceneObjects.forEach((obj) => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        if (child.material.map) {
          const map = child.material.map;
          // Check if already added (for atlas case)
          if (!textures.find((t) => t.texture === map)) {
            textures.push({
              texture: map,
              size: map.image?.width || 0,
            });
          }
        }
      }
    });
  });

  // Limit to 8 previews
  textures.slice(0, 8).forEach(({ texture, size }) => {
    const thumb = document.createElement('div');
    thumb.className = 'texture-thumb';

    if (texture.image instanceof HTMLCanvasElement) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(texture.image, 0, 0, 64, 64);
      thumb.appendChild(canvas);
    }

    const badge = document.createElement('span');
    badge.className = 'size-badge';
    badge.textContent = `${size}`;
    thumb.appendChild(badge);

    container.appendChild(thumb);
  });
}

// =============================================================================
// UI SETUP
// =============================================================================

document.querySelectorAll('.scenario-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const scenario = btn.getAttribute('data-scenario') as Scenario;
    if (scenario) {
      setScenario(scenario);
    }
  });
});

// =============================================================================
// 3LENS PROBE SETUP
// =============================================================================

const probe = createProbe({
  renderer,
  scene,
  camera,
});

probe.setAppName('Texture Optimization Example');
bootstrapOverlay(probe);

// =============================================================================
// ANIMATION LOOP
// =============================================================================

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // Gentle rotation
  sceneObjects.forEach((obj) => {
    obj.rotation.y = elapsed * 0.15;
  });

  controls.update();
  renderer.render(scene, camera);
  probe.onFrame();
}

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize
setScenario('oversized');
animate();

