import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

/**
 * Performance Debugging Example
 * 
 * This example demonstrates common Three.js performance issues
 * that can be identified and diagnosed using 3Lens.
 */

// Scene setup
const scene = new THREE.Scene();
scene.name = 'PerformanceTestScene';
scene.background = new THREE.Color(0x0a0a0f);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 10, 15);
camera.name = 'MainCamera';

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app')!.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Clock
const clock = new THREE.Clock();

// Base scene (always present)
function createBaseScene() {
  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.8 })
  );
  ground.name = 'Ground';
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Basic lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  ambient.name = 'AmbientLight';
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.name = 'DirectionalLight';
  directional.position.set(10, 20, 10);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 1024;
  directional.shadow.mapSize.height = 1024;
  scene.add(directional);

  // Simple reference objects
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x4ecdc4, roughness: 0.3 })
  );
  sphere.name = 'ReferenceSphere';
  sphere.position.set(0, 1, 0);
  sphere.castShadow = true;
  scene.add(sphere);
}

createBaseScene();

// =============================================================================
// PERFORMANCE ISSUES - These can be toggled on/off
// =============================================================================

interface IssueState {
  active: boolean;
  objects: THREE.Object3D[];
  cleanup: () => void;
}

const issues: Record<string, IssueState> = {
  'too-many-objects': { active: false, objects: [], cleanup: () => {} },
  'high-poly': { active: false, objects: [], cleanup: () => {} },
  'large-textures': { active: false, objects: [], cleanup: () => {} },
  'shadow-quality': { active: false, objects: [], cleanup: () => {} },
  'no-frustum-culling': { active: false, objects: [], cleanup: () => {} },
  'memory-leak': { active: false, objects: [], cleanup: () => {} },
};

let memoryLeakInterval: number | null = null;

/**
 * Issue 1: Too Many Draw Calls
 * Creates hundreds of individual mesh objects instead of using instancing.
 */
function enableTooManyObjects() {
  const material = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
  const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  
  const group = new THREE.Group();
  group.name = 'TooManyObjects_Group';
  
  // Create 500 individual cubes (bad practice - should use InstancedMesh)
  for (let i = 0; i < 500; i++) {
    const cube = new THREE.Mesh(geometry, material);
    cube.name = `Cube_${i}`;
    cube.position.set(
      (Math.random() - 0.5) * 30,
      Math.random() * 10 + 0.15,
      (Math.random() - 0.5) * 30
    );
    cube.castShadow = true;
    group.add(cube);
  }
  
  scene.add(group);
  issues['too-many-objects'].objects = [group];
}

function disableTooManyObjects() {
  issues['too-many-objects'].objects.forEach(obj => {
    scene.remove(obj);
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  });
  issues['too-many-objects'].objects = [];
}

/**
 * Issue 2: High Poly Meshes
 * Creates spheres with unnecessarily high polygon count.
 */
function enableHighPoly() {
  const group = new THREE.Group();
  group.name = 'HighPoly_Group';
  
  // Create 10 spheres with 512 segments each (way too high!)
  for (let i = 0; i < 10; i++) {
    const geometry = new THREE.SphereGeometry(1, 512, 512); // ~500k triangles each!
    const material = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color().setHSL(i / 10, 0.8, 0.5),
      roughness: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = `HighPolySphere_${i}`;
    sphere.position.set(
      Math.cos((i / 10) * Math.PI * 2) * 8,
      1,
      Math.sin((i / 10) * Math.PI * 2) * 8
    );
    sphere.castShadow = true;
    group.add(sphere);
  }
  
  scene.add(group);
  issues['high-poly'].objects = [group];
}

function disableHighPoly() {
  issues['high-poly'].objects.forEach(obj => {
    scene.remove(obj);
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  });
  issues['high-poly'].objects = [];
}

/**
 * Issue 3: Large Textures
 * Creates textures that are larger than necessary.
 */
function enableLargeTextures() {
  const group = new THREE.Group();
  group.name = 'LargeTextures_Group';
  
  // Create 5 cubes with procedurally generated large textures
  for (let i = 0; i < 5; i++) {
    // Create a large canvas texture (4096x4096 - overkill for a small cube!)
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 4096;
    const ctx = canvas.getContext('2d')!;
    
    // Draw a simple pattern
    ctx.fillStyle = `hsl(${i * 60}, 70%, 50%)`;
    ctx.fillRect(0, 0, 4096, 4096);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let x = 0; x < 4096; x += 256) {
      for (let y = 0; y < 4096; y += 256) {
        ctx.fillRect(x, y, 128, 128);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.name = `LargeTexture_${i}`;
    
    const material = new THREE.MeshStandardMaterial({ 
      map: texture,
      roughness: 0.5
    });
    
    const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), material);
    cube.name = `LargeTextureCube_${i}`;
    cube.position.set(-15 + i * 4, 1, -10);
    cube.castShadow = true;
    group.add(cube);
  }
  
  scene.add(group);
  issues['large-textures'].objects = [group];
}

function disableLargeTextures() {
  issues['large-textures'].objects.forEach(obj => {
    scene.remove(obj);
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.map?.dispose();
          child.material.dispose();
        }
      }
    });
  });
  issues['large-textures'].objects = [];
}

/**
 * Issue 4: Excessive Shadows
 * Adds many shadow-casting lights with high resolution shadow maps.
 */
function enableShadowQuality() {
  const group = new THREE.Group();
  group.name = 'ExcessiveShadows_Group';
  
  // Create 8 point lights all casting high-res shadows
  for (let i = 0; i < 8; i++) {
    const light = new THREE.PointLight(
      new THREE.Color().setHSL(i / 8, 1, 0.5),
      2,
      20
    );
    light.name = `ShadowPointLight_${i}`;
    light.position.set(
      Math.cos((i / 8) * Math.PI * 2) * 12,
      5,
      Math.sin((i / 8) * Math.PI * 2) * 12
    );
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;  // Very high resolution!
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    group.add(light);
    
    // Add helper sphere for visualization
    const helper = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: light.color })
    );
    helper.position.copy(light.position);
    group.add(helper);
  }
  
  scene.add(group);
  issues['shadow-quality'].objects = [group];
}

function disableShadowQuality() {
  issues['shadow-quality'].objects.forEach(obj => {
    scene.remove(obj);
    obj.traverse(child => {
      if (child instanceof THREE.PointLight) {
        child.shadow.map?.dispose();
      }
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  });
  issues['shadow-quality'].objects = [];
}

/**
 * Issue 5: Disabled Frustum Culling
 * Creates objects with frustum culling disabled.
 */
function enableNoFrustumCulling() {
  const group = new THREE.Group();
  group.name = 'NoFrustumCulling_Group';
  
  // Create objects far outside the view that won't be culled
  for (let i = 0; i < 100; i++) {
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x9b59b6,
      roughness: 0.5
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = `NoCullSphere_${i}`;
    sphere.frustumCulled = false; // This is the issue!
    sphere.position.set(
      (Math.random() - 0.5) * 200,
      Math.random() * 50,
      (Math.random() - 0.5) * 200
    );
    group.add(sphere);
  }
  
  scene.add(group);
  issues['no-frustum-culling'].objects = [group];
}

function disableNoFrustumCulling() {
  issues['no-frustum-culling'].objects.forEach(obj => {
    scene.remove(obj);
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  });
  issues['no-frustum-culling'].objects = [];
}

/**
 * Issue 6: Memory Leak
 * Continuously creates geometries without disposing them.
 */
function enableMemoryLeak() {
  const leakGroup = new THREE.Group();
  leakGroup.name = 'MemoryLeak_Group';
  scene.add(leakGroup);
  issues['memory-leak'].objects = [leakGroup];
  
  // Create new geometries every 100ms without disposing
  memoryLeakInterval = window.setInterval(() => {
    // Create geometry but never dispose it
    const geometry = new THREE.SphereGeometry(
      Math.random() * 0.5 + 0.1,
      32,
      32
    );
    const material = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `LeakedMesh_${Date.now()}`;
    mesh.position.set(
      (Math.random() - 0.5) * 10,
      Math.random() * 5 + 1,
      (Math.random() - 0.5) * 10
    );
    
    // Add to scene (simulating a leak where we forget to clean up)
    leakGroup.add(mesh);
    
    // Remove from scene after a delay, but DON'T dispose geometry/material
    // This simulates a common memory leak pattern
    setTimeout(() => {
      leakGroup.remove(mesh);
      // Missing: geometry.dispose() and material.dispose()
    }, 2000);
  }, 100);
}

function disableMemoryLeak() {
  if (memoryLeakInterval) {
    clearInterval(memoryLeakInterval);
    memoryLeakInterval = null;
  }
  
  issues['memory-leak'].objects.forEach(obj => {
    scene.remove(obj);
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  });
  issues['memory-leak'].objects = [];
}

// =============================================================================
// UI SETUP
// =============================================================================

const issueHandlers: Record<string, { enable: () => void; disable: () => void }> = {
  'too-many-objects': { enable: enableTooManyObjects, disable: disableTooManyObjects },
  'high-poly': { enable: enableHighPoly, disable: disableHighPoly },
  'large-textures': { enable: enableLargeTextures, disable: disableLargeTextures },
  'shadow-quality': { enable: enableShadowQuality, disable: disableShadowQuality },
  'no-frustum-culling': { enable: enableNoFrustumCulling, disable: disableNoFrustumCulling },
  'memory-leak': { enable: enableMemoryLeak, disable: disableMemoryLeak },
};

// Setup checkbox listeners
Object.keys(issueHandlers).forEach(issueKey => {
  const checkbox = document.getElementById(`issue-${issueKey}`) as HTMLInputElement;
  if (checkbox) {
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        issueHandlers[issueKey].enable();
        issues[issueKey].active = true;
      } else {
        issueHandlers[issueKey].disable();
        issues[issueKey].active = false;
      }
    });
  }
});

// =============================================================================
// 3LENS PROBE SETUP
// =============================================================================

const probe = createProbe({
  renderer,
  scene,
  camera,
});

probe.setAppName('Performance Debugging Example');
bootstrapOverlay(probe);

// =============================================================================
// ANIMATION LOOP & STATS
// =============================================================================

let frameCount = 0;
let lastTime = performance.now();
let currentFps = 0;

function updateStats() {
  const info = renderer.info;
  
  // FPS
  const fpsEl = document.getElementById('stat-fps');
  if (fpsEl) {
    fpsEl.textContent = currentFps.toString();
    fpsEl.className = 'stat-value' + (currentFps < 30 ? ' bad' : currentFps < 55 ? ' warn' : '');
  }
  
  // Draw calls
  const drawCallsEl = document.getElementById('stat-drawcalls');
  if (drawCallsEl) {
    drawCallsEl.textContent = info.render.calls.toString();
    drawCallsEl.className = 'stat-value' + (info.render.calls > 100 ? ' bad' : info.render.calls > 50 ? ' warn' : '');
  }
  
  // Triangles
  const trianglesEl = document.getElementById('stat-triangles');
  if (trianglesEl) {
    const triCount = info.render.triangles;
    trianglesEl.textContent = triCount > 1000000 
      ? (triCount / 1000000).toFixed(1) + 'M'
      : triCount > 1000 
        ? (triCount / 1000).toFixed(1) + 'K'
        : triCount.toString();
    trianglesEl.className = 'stat-value' + (triCount > 1000000 ? ' bad' : triCount > 100000 ? ' warn' : '');
  }
  
  // Textures
  const texturesEl = document.getElementById('stat-textures');
  if (texturesEl) {
    texturesEl.textContent = info.memory.textures.toString();
    texturesEl.className = 'stat-value' + (info.memory.textures > 20 ? ' bad' : info.memory.textures > 10 ? ' warn' : '');
  }
  
  // Geometries
  const geometriesEl = document.getElementById('stat-geometries');
  if (geometriesEl) {
    geometriesEl.textContent = info.memory.geometries.toString();
    geometriesEl.className = 'stat-value' + (info.memory.geometries > 100 ? ' bad' : info.memory.geometries > 50 ? ' warn' : '');
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  // FPS calculation
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    currentFps = Math.round((frameCount * 1000) / (now - lastTime));
    frameCount = 0;
    lastTime = now;
    updateStats();
  }
  
  // Animate base scene
  const elapsed = clock.getElapsedTime();
  const sphere = scene.getObjectByName('ReferenceSphere');
  if (sphere) {
    sphere.position.y = 1 + Math.sin(elapsed * 2) * 0.3;
    sphere.rotation.y = elapsed * 0.5;
  }
  
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

animate();

