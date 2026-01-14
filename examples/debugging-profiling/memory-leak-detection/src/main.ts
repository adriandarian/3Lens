/**
 * 3Lens Memory Leak Detection Example
 * 
 * This example demonstrates common memory leak patterns in Three.js
 * and how to use 3Lens to detect and diagnose them.
 * 
 * How 3Lens is used:
 * 1. probe.observeScene(scene) - Automatically tracks all resource lifecycle events
 * 2. probe.observeRenderer(renderer) - Monitors GPU resources
 * 3. probe.runLeakDetection() - Runs leak detection checks
 * 4. probe.getLeakAlerts() - Gets alerts for detected leaks
 * 5. probe.getOrphanedResources() - Gets resources not attached to any mesh
 * 6. probe.onLeakAlert() - Subscribes to real-time leak alerts
 * 
 * The example creates REAL leaks by:
 * - Creating resources and adding them to the scene (3Lens tracks this)
 * - Removing meshes from scene without disposing resources (creates orphaned resources)
 * - 3Lens automatically detects these as leaks after the threshold time (default 60s)
 * 
 * Common leak patterns demonstrated:
 * 1. Geometry leaks - creating geometries without disposal
 * 2. Material leaks - materials not disposed when meshes are removed
 * 3. Texture leaks - textures accumulating without cleanup
 * 4. Event listener leaks - adding listeners without removing them
 * 5. Reference leaks - holding references to removed objects
 */

import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ============================================================================
// Scene Setup
// ============================================================================

const container = document.getElementById('canvas-container')!;
const scene = new THREE.Scene();
scene.name = 'LeakDetectionScene';
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 15, 25);
camera.lookAt(0, 0, 0);
camera.name = 'Main Camera';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// ============================================================================
// Basic Scene Objects
// ============================================================================

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x1a1a1a,
  roughness: 0.9,
  metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.name = 'Ground';
scene.add(ground);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.name = 'DirectionalLight';
scene.add(directionalLight);

// Grid helper
const gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x222222);
gridHelper.name = 'GridHelper';
scene.add(gridHelper);

// ============================================================================
// Leak Tracking
// ============================================================================

interface LeakTracker {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
  eventListeners: { element: EventTarget; type: string; handler: EventListener }[];
  meshes: THREE.Mesh[];
}

const leakTracker: LeakTracker = {
  geometries: [],
  materials: [],
  textures: [],
  eventListeners: [],
  meshes: []
};

let chaosInterval: number | null = null;

// ============================================================================
// Leak Creation Functions
// ============================================================================

/**
 * Creates a geometry leak - geometry is created but never disposed
 */
function createGeometryLeak(): void {
  try {
  const geometryTypes = [
    () => new THREE.BoxGeometry(1 + Math.random(), 1 + Math.random(), 1 + Math.random()),
    () => new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 32, 32),
    () => new THREE.TorusGeometry(0.5, 0.2, 16, 48),
    () => new THREE.CylinderGeometry(0.3, 0.5, 1, 32),
    () => new THREE.ConeGeometry(0.5, 1, 32),
    () => new THREE.TorusKnotGeometry(0.4, 0.15, 64, 16),
    () => new THREE.IcosahedronGeometry(0.5, 0),
    () => new THREE.OctahedronGeometry(0.5, 0),
  ];

  const geometry = geometryTypes[Math.floor(Math.random() * geometryTypes.length)]();
  
  // Create a simple material (not tracked as leak in this function)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
    metalness: 0.3,
    roughness: 0.7
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * 20,
    0.5 + Math.random() * 3,
    (Math.random() - 0.5) * 20
  );
  mesh.castShadow = true;
  mesh.name = `LeakyGeometry_${leakTracker.geometries.length}`;
  
  scene.add(mesh);
  
  // Track the geometry as a leak (it won't be disposed when mesh is removed)
  leakTracker.geometries.push(geometry);
  leakTracker.meshes.push(mesh);
  
  // Create a REAL leak: Remove mesh from scene after a short delay
  // This makes the geometry orphaned (not attached to any mesh)
  // 3Lens will detect this as a leak after the threshold time
  setTimeout(() => {
    if (mesh.parent === scene) {
      scene.remove(mesh);
      // Geometry is now orphaned - 3Lens will detect this!
      console.log(`⚠️ Mesh removed, geometry ${geometry.uuid} is now orphaned (3Lens will detect this)`);
    }
  }, 100);

  console.warn(`🔴 Geometry leak created: ${geometry.type}`);
  updateStats();
  } catch (error) {
    console.error('Error creating geometry leak:', error);
  }
}

/**
 * Creates a material leak - material is created but never disposed
 */
function createMaterialLeak(): void {
  try {
  const materialTypes = [
    () => new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
      metalness: Math.random(),
      roughness: Math.random(),
      emissive: new THREE.Color().setHSL(Math.random(), 0.5, 0.1),
      emissiveIntensity: Math.random() * 0.5
    }),
    () => new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
      shininess: Math.random() * 100,
      specular: new THREE.Color().setHSL(Math.random(), 0.5, 0.5)
    }),
    () => new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.9, 0.5),
      wireframe: Math.random() > 0.5
    }),
    () => new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5)
    }),
  ];

  const material = materialTypes[Math.floor(Math.random() * materialTypes.length)]();
  
  // Reuse a simple geometry
  const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * 20,
    0.5 + Math.random() * 3,
    (Math.random() - 0.5) * 20
  );
  mesh.castShadow = true;
  mesh.name = `LeakyMaterial_${leakTracker.materials.length}`;
  
  scene.add(mesh);
  
  // Track the material as a leak
  leakTracker.materials.push(material);
  leakTracker.meshes.push(mesh);
  
  // Create a REAL leak: Remove mesh from scene after a short delay
  // Material is now orphaned - 3Lens will detect this!
  setTimeout(() => {
    if (mesh.parent === scene) {
      scene.remove(mesh);
      console.log(`⚠️ Mesh removed, material ${material.uuid} is now orphaned (3Lens will detect this)`);
    }
  }, 100);

  console.warn(`🔴 Material leak created: ${material.type}`);
  updateStats();
  } catch (error) {
    console.error('Error creating material leak:', error);
  }
}

/**
 * Creates a texture leak - texture is created but never disposed
 */
function createTextureLeak(): void {
  try {
  // Create a procedural texture using canvas
  const canvas = document.createElement('canvas');
  const size = 256 + Math.floor(Math.random() * 512);
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d')!;
  
  // Create a random pattern
  const patternType = Math.floor(Math.random() * 4);
  
  switch (patternType) {
    case 0: // Gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, `hsl(${Math.random() * 360}, 70%, 50%)`);
      gradient.addColorStop(1, `hsl(${Math.random() * 360}, 70%, 50%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      break;
      
    case 1: // Checkerboard
      const checkSize = 16;
      for (let x = 0; x < size; x += checkSize) {
        for (let y = 0; y < size; y += checkSize) {
          ctx.fillStyle = (x / checkSize + y / checkSize) % 2 === 0 
            ? `hsl(${Math.random() * 360}, 70%, 50%)`
            : `hsl(${Math.random() * 360}, 70%, 30%)`;
          ctx.fillRect(x, y, checkSize, checkSize);
        }
      }
      break;
      
    case 2: // Noise
      const imageData = ctx.createImageData(size, size);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 255;
        imageData.data[i] = v;
        imageData.data[i + 1] = v * 0.5 + Math.random() * 127;
        imageData.data[i + 2] = v * 0.3 + Math.random() * 178;
        imageData.data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      break;
      
    case 3: // Circles
      ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 20%)`;
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * size,
          Math.random() * size,
          Math.random() * 50 + 10,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `hsla(${Math.random() * 360}, 70%, 50%, 0.5)`;
        ctx.fill();
      }
      break;
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    metalness: 0.2,
    roughness: 0.8
  });
  
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * 20,
    0.5 + Math.random() * 3,
    (Math.random() - 0.5) * 20
  );
  mesh.castShadow = true;
  mesh.name = `LeakyTexture_${leakTracker.textures.length}`;
  
  scene.add(mesh);
  
  // Track the texture as a leak
  leakTracker.textures.push(texture);
  leakTracker.materials.push(material);
  leakTracker.meshes.push(mesh);
  
  // Create a REAL leak: Remove mesh from scene after a short delay
  // Texture is now orphaned - 3Lens will detect this!
  setTimeout(() => {
    if (mesh.parent === scene) {
      scene.remove(mesh);
      console.log(`⚠️ Mesh removed, texture ${texture.uuid} is now orphaned (3Lens will detect this)`);
    }
  }, 100);

  console.warn(`🔴 Texture leak created: ${size}x${size}px`);
  updateStats();
  } catch (error) {
    console.error('Error creating texture leak:', error);
  }
}

/**
 * Creates an event listener leak - listener is added but never removed
 */
function createEventListenerLeak(): void {
  try {
  const eventTypes = ['mousemove', 'mousedown', 'mouseup', 'wheel', 'keydown', 'keyup'];
  const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  
  // Create a closure that holds references
  const largeData = new Array(10000).fill(Math.random());
  
  const handler = (_e: Event) => {
    // This closure keeps largeData in memory
    void largeData.length;
  };
  
  window.addEventListener(type, handler);
  
  leakTracker.eventListeners.push({
    element: window,
    type,
    handler
  });

  console.warn(`🔴 Event listener leak created: ${type}`);
  updateStats();
  } catch (error) {
    console.error('Error creating event listener leak:', error);
  }
}

// ============================================================================
// Cleanup Functions
// ============================================================================

function disposeGeometries(): void {
  try {
    let disposed = 0;
    
    // Remove meshes from scene
    for (const mesh of leakTracker.meshes) {
      if (mesh.geometry && leakTracker.geometries.includes(mesh.geometry)) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
        disposed++;
      }
    }
    
    leakTracker.geometries = [];
    leakTracker.meshes = leakTracker.meshes.filter(m => m.parent === scene);
    
    console.log(`✅ Disposed ${disposed} geometry leaks`);
    updateStats();
  } catch (error) {
    console.error('Error disposing geometries:', error);
  }
}

function disposeMaterials(): void {
  try {
    let disposed = 0;
    
    for (const material of leakTracker.materials) {
      material.dispose();
      disposed++;
    }
    
    // Remove associated meshes
    for (const mesh of [...leakTracker.meshes]) {
      if (mesh.material && leakTracker.materials.includes(mesh.material as THREE.Material)) {
        scene.remove(mesh);
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
      }
    }
    
    leakTracker.materials = [];
    leakTracker.meshes = leakTracker.meshes.filter(m => m.parent === scene);
    
    console.log(`✅ Disposed ${disposed} material leaks`);
    updateStats();
  } catch (error) {
    console.error('Error disposing materials:', error);
  }
}

function disposeTextures(): void {
  try {
    let disposed = 0;
    
    for (const texture of leakTracker.textures) {
      texture.dispose();
      disposed++;
    }
    
    leakTracker.textures = [];
    
    console.log(`✅ Disposed ${disposed} texture leaks`);
    updateStats();
  } catch (error) {
    console.error('Error disposing textures:', error);
  }
}

function removeEventListeners(): void {
  try {
    let removed = 0;
    
    for (const { element, type, handler } of leakTracker.eventListeners) {
      element.removeEventListener(type, handler);
      removed++;
    }
    
    leakTracker.eventListeners = [];
    
    console.log(`✅ Removed ${removed} event listener leaks`);
    updateStats();
  } catch (error) {
    console.error('Error removing event listeners:', error);
  }
}

function cleanupAll(): void {
  const cleanupButton = document.getElementById('cleanup-all');
  const originalText = cleanupButton?.textContent || '';
  
  if (cleanupButton) {
    cleanupButton.textContent = '⏳ Cleaning...';
    cleanupButton.disabled = true;
  }
  
  try {
    stopChaosMode();
    disposeGeometries();
    disposeMaterials();
    disposeTextures();
    removeEventListeners();
    
    // Reset meshes array
    leakTracker.meshes = [];
    
    console.log('✨ All leaks cleaned up!');
    
    if (cleanupButton) {
      cleanupButton.textContent = '✅ Cleaned!';
      setTimeout(() => {
        cleanupButton.textContent = originalText;
        cleanupButton.disabled = false;
      }, 1500);
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    if (cleanupButton) {
      cleanupButton.textContent = originalText;
      cleanupButton.disabled = false;
    }
  }
}

function startChaosMode(): void {
  if (chaosInterval) return;
  
  console.warn('🌪️ CHAOS MODE ACTIVATED!');
  
  const chaosButton = document.getElementById('chaos-mode');
  if (chaosButton) {
    chaosButton.textContent = '⏸️ Stop Chaos';
    chaosButton.classList.add('active');
  }
  
  chaosInterval = window.setInterval(() => {
    const leakType = Math.floor(Math.random() * 4);
    switch (leakType) {
      case 0: createGeometryLeak(); break;
      case 1: createMaterialLeak(); break;
      case 2: createTextureLeak(); break;
      case 3: createEventListenerLeak(); break;
    }
  }, 500);
}

function stopChaosMode(): void {
  if (chaosInterval) {
    clearInterval(chaosInterval);
    chaosInterval = null;
    console.log('🌪️ Chaos mode stopped');
    
    const chaosButton = document.getElementById('chaos-mode');
    if (chaosButton) {
      chaosButton.textContent = '🌪️ Chaos Mode';
      chaosButton.classList.remove('active');
    }
  }
}

function toggleChaosMode(): void {
  if (chaosInterval) {
    stopChaosMode();
  } else {
    startChaosMode();
  }
}

function forceGCHint(): void {
  // This doesn't actually force GC, but it's a hint
  // The browser may or may not honor this
  const gcButton = document.getElementById('gc-hint');
  const originalText = gcButton?.textContent || '';
  
  if (gcButton) {
    gcButton.textContent = '⏳ Running...';
    gcButton.disabled = true;
  }
  
  try {
    if ((window as unknown as { gc?: () => void }).gc) {
      (window as unknown as { gc: () => void }).gc();
      console.log('🧹 Forced garbage collection (debug mode)');
      if (gcButton) {
        gcButton.textContent = '✅ GC Done';
        setTimeout(() => {
          gcButton.textContent = originalText;
          gcButton.disabled = false;
        }, 1000);
      }
    } else {
      console.log('🧹 GC hint sent (run Chrome with --js-flags="--expose-gc" to force GC)');
      // Trigger a minor memory operation to hint at GC
      const temp = new Array(1000000).fill(0);
      void temp;
      
      if (gcButton) {
        gcButton.textContent = '💡 Hint Sent';
        setTimeout(() => {
          gcButton.textContent = originalText;
          gcButton.disabled = false;
        }, 1000);
      }
    }
  } catch (error) {
    console.error('Error during GC hint:', error);
    if (gcButton) {
      gcButton.textContent = originalText;
      gcButton.disabled = false;
    }
  }
}

// ============================================================================
// UI Stats Update
// ============================================================================

function updateStats(): void {
  try {
    const statGeometries = document.getElementById('stat-geometries');
    const statMaterials = document.getElementById('stat-materials');
    const statTextures = document.getElementById('stat-textures');
    const statEvents = document.getElementById('stat-events');
    const statOrphaned = document.getElementById('stat-orphaned');
    const statAlerts = document.getElementById('stat-alerts');
    const statHeap = document.getElementById('stat-heap');
    
    if (!statGeometries || !statMaterials || !statTextures || !statEvents || !statOrphaned || !statAlerts || !statHeap) {
      console.warn('Stats display elements not found');
      return;
    }
    
    // Update counts from leakTracker
    const geoCount = leakTracker.geometries.length;
    const matCount = leakTracker.materials.length;
    const texCount = leakTracker.textures.length;
    const evtCount = leakTracker.eventListeners.length;
    
    statGeometries.textContent = geoCount.toString();
    statGeometries.className = 'stat-value ' + (geoCount > 10 ? 'danger' : geoCount > 5 ? 'warning' : 'good');
    
    statMaterials.textContent = matCount.toString();
    statMaterials.className = 'stat-value ' + (matCount > 10 ? 'danger' : matCount > 5 ? 'warning' : 'good');
    
    statTextures.textContent = texCount.toString();
    statTextures.className = 'stat-value ' + (texCount > 5 ? 'danger' : texCount > 2 ? 'warning' : 'good');
    
    statEvents.textContent = evtCount.toString();
    statEvents.className = 'stat-value ' + (evtCount > 10 ? 'danger' : evtCount > 5 ? 'warning' : 'good');
    
    // Get leak alerts from 3Lens if available
    let orphanedCount = 0;
    let alertsCount = 0;
    
    if (probe) {
      try {
        // Run leak detection to ensure alerts are up to date
        probe.runLeakDetection();
        
        const alerts = probe.getLeakAlerts();
        const orphaned = probe.getOrphanedResources();
        
        orphanedCount = orphaned?.length || 0;
        alertsCount = alerts?.length || 0;
      } catch (error) {
        console.warn('Error getting leak stats from probe:', error);
      }
    }
    
    statOrphaned.textContent = orphanedCount.toString();
    statOrphaned.className = 'stat-value ' + (orphanedCount > 5 ? 'danger' : orphanedCount > 0 ? 'warning' : 'good');
    
    statAlerts.textContent = alertsCount.toString();
    statAlerts.className = 'stat-value ' + (alertsCount > 5 ? 'danger' : alertsCount > 0 ? 'warning' : 'good');
    
    // JS Heap (if available)
    const perfMemory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
    if (perfMemory) {
      const heapMB = (perfMemory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
      statHeap.textContent = `${heapMB} MB`;
      statHeap.className = 'stat-value ' + (parseFloat(heapMB) > 100 ? 'danger' : parseFloat(heapMB) > 50 ? 'warning' : 'good');
    } else {
      statHeap.textContent = 'N/A';
      statHeap.className = 'stat-value';
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// ============================================================================
// 3Lens Integration
// ============================================================================

const probe = createProbe({
  appName: 'MemoryLeakDetection'
});

// Observe renderer and scene to enable resource lifecycle tracking
// This automatically enables leak detection with default thresholds
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Optional: Configure stack trace capture (has performance impact)
// probe.setResourceStackTraceCapture(true);

// Create the overlay
createOverlay(probe, {
  theme: 'dark',
  defaultPanel: 'resources',
  keyboardShortcuts: true
});

// Subscribe to 3Lens leak alerts to show when leaks are detected
probe.onLeakAlert((alert) => {
  console.log(`🚨 3Lens detected leak:`, {
    type: alert.resourceType,
    severity: alert.severity,
    message: alert.message,
    details: alert.details
  });
});

// Initial stats update
setTimeout(() => {
  updateStats();
}, 100);

// ============================================================================
// Event Listeners for Controls
// ============================================================================

function safeAddEventListener(id: string, handler: () => void): void {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('click', () => {
      try {
        handler();
      } catch (error) {
        console.error(`Error handling click on ${id}:`, error);
      }
    });
  } else {
    console.warn(`Button with id "${id}" not found`);
  }
}

safeAddEventListener('leak-geometry', createGeometryLeak);
safeAddEventListener('fix-geometry', disposeGeometries);

safeAddEventListener('leak-material', createMaterialLeak);
safeAddEventListener('fix-material', disposeMaterials);

safeAddEventListener('leak-texture', createTextureLeak);
safeAddEventListener('fix-texture', disposeTextures);

safeAddEventListener('leak-events', createEventListenerLeak);
safeAddEventListener('fix-events', removeEventListeners);

safeAddEventListener('chaos-mode', toggleChaosMode);
safeAddEventListener('gc-hint', forceGCHint);
safeAddEventListener('cleanup-all', cleanupAll);

// ============================================================================
// Render Loop
// ============================================================================

let frameCount = 0;

function animate(): void {
  requestAnimationFrame(animate);
  
  frameCount++;
  
  // Rotate leaked meshes for visual interest
  for (const mesh of leakTracker.meshes) {
    if (mesh.parent === scene) {
      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.01;
    }
  }
  
  renderer.render(scene, camera);
  
  // Frame stats are automatically collected by the renderer adapter
  // No need to call probe.onFrame() - it's handled automatically
  
  // Update UI stats every 10 frames (roughly 6 times per second at 60fps)
  if (frameCount % 10 === 0) {
    updateStats();
  }
}

// Handle window resize
window.addEventListener('resize', () => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// Initial stats update
updateStats();

// Start animation
animate();

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           3Lens Memory Leak Detection Example                 ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  This example demonstrates common memory leak patterns        ║
║  in Three.js applications and how 3Lens detects them.         ║
║                                                               ║
║  Press ~ to open the 3Lens panel                              ║
║  Navigate to the Resources tab to see leak alerts             ║
║                                                               ║
║  Use the control panel on the left to:                        ║
║  - Create different types of memory leaks                     ║
║  - Observe how 3Lens detects and reports them                 ║
║  - Clean up leaks and see the alerts clear                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

