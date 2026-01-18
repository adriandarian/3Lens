import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe, type CustomRule, type RulesConfig } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

/**
 * Configuration Rules Example
 * 
 * Demonstrates the 3Lens configuration and rules system:
 * - Performance thresholds (draw calls, triangles, FPS, etc.)
 * - Custom rule definitions
 * - Violation tracking and callbacks
 * - Runtime threshold updates
 * 
 * Open the 3Lens overlay (Ctrl+Shift+D) to see violations in the Performance panel!
 */

// =============================================================================
// SCENE SETUP
// =============================================================================

const scene = new THREE.Scene();
scene.name = 'ConfigRulesScene';
scene.background = new THREE.Color(0x0a0a0f);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(8, 6, 10);
camera.name = 'MainCamera';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.getElementById('app')!.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

// =============================================================================
// INITIAL SCENE CONTENT
// =============================================================================

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.8 })
);
ground.name = 'Ground';
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid
const grid = new THREE.GridHelper(20, 20, 0x333355, 0x222244);
grid.name = 'Grid';
scene.add(grid);

// Initial lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
ambient.name = 'AmbientLight';
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.name = 'DirectionalLight';
directional.position.set(5, 10, 5);
directional.castShadow = true;
scene.add(directional);

// Some initial objects
function createInitialObjects() {
  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.CylinderGeometry(0.3, 0.5, 1, 12),
  ];
  const colors = [0xe74c3c, 0x2ecc71, 0x3498db, 0xf39c12, 0x9b59b6];

  for (let i = 0; i < 10; i++) {
    const geo = geometries[i % geometries.length];
    const mat = new THREE.MeshStandardMaterial({
      color: colors[i % colors.length],
      roughness: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = `InitialObject_${i}`;
    mesh.position.set(
      (Math.random() - 0.5) * 10,
      0.5 + Math.random() * 2,
      (Math.random() - 0.5) * 10
    );
    mesh.castShadow = true;
    scene.add(mesh);
  }
}

createInitialObjects();

// =============================================================================
// CUSTOM RULES
// =============================================================================

const customRules: CustomRule[] = [
  {
    id: 'no-unnamed-objects',
    name: 'No Unnamed Objects',
    check: (_stats) => {
      // All our objects have names, so this passes
      return {
        passed: true,
        message: 'All objects are named',
        severity: 'info',
      };
    },
  },
  {
    id: 'shadow-light-ratio',
    name: 'Shadow Light Ratio',
    check: (stats) => {
      const totalLights = stats.rendering?.lights ?? 1;
      const shadowLights = stats.rendering?.shadowLights ?? 0;
      const ratio = shadowLights / totalLights;
      const passed = ratio <= 0.5;
      return {
        passed,
        message: `Shadow ratio: ${(ratio * 100).toFixed(0)}% (${shadowLights}/${totalLights})`,
        severity: passed ? 'info' : 'warning',
      };
    },
  },
  {
    id: 'memory-efficiency',
    name: 'Memory Efficiency',
    check: (stats) => {
      const gpuMemory = stats.memory?.totalGpuMemory ?? 0;
      const threshold = 100 * 1024 * 1024; // 100 MB
      const passed = gpuMemory < threshold;
      return {
        passed,
        message: `GPU: ${formatBytes(gpuMemory)} / ${formatBytes(threshold)}`,
        severity: passed ? 'info' : (gpuMemory > threshold * 1.5 ? 'error' : 'warning'),
      };
    },
  },
];

// Track added objects for cleanup
const addedObjects: THREE.Object3D[] = [];
const addedLights: THREE.Light[] = [];
const addedTextures: THREE.Texture[] = [];

// =============================================================================
// 3LENS SETUP WITH CONFIGURATION
// =============================================================================

const probe = createProbe({
  name: 'ConfigRulesProbe',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
  },
  rules: {
    maxDrawCalls: 100,
    maxTriangles: 50000,
    maxLights: 5,
    minFps: 30,
  },
});

// Register custom rules
customRules.forEach(rule => probe.addCustomRule(rule));

// Subscribe to violations
probe.onViolation((violation) => {
  console.warn(`🚨 Rule violation: ${violation.ruleName}`, violation);
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

bootstrapOverlay({
  probe,
  position: 'right',
  defaultWidth: 380,
  defaultOpen: true,
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

// =============================================================================
// SCENE MANIPULATION FUNCTIONS (exposed for console testing)
// =============================================================================

(window as any).rulesDemo = {
  // Add 50 objects to trigger draw call/triangle violations
  addObjects: () => {
    const geometries = [
      new THREE.BoxGeometry(0.5, 0.5, 0.5, 8, 8, 8),
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.TorusGeometry(0.3, 0.1, 16, 32),
      new THREE.IcosahedronGeometry(0.3, 2),
    ];
    
    for (let i = 0; i < 50; i++) {
      const geo = geometries[Math.floor(Math.random() * geometries.length)];
      const mat = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        roughness: 0.3,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = `AddedObject_${addedObjects.length}`;
      mesh.position.set(
        (Math.random() - 0.5) * 15,
        0.3 + Math.random() * 3,
        (Math.random() - 0.5) * 15
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.castShadow = true;
      scene.add(mesh);
      addedObjects.push(mesh);
    }
    
    console.log(`Added 50 objects (total added: ${addedObjects.length})`);
  },
  
  // Add heavy textures to increase memory
  addTextures: () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    
    for (let i = 0; i < 5; i++) {
      const gradient = ctx.createRadialGradient(
        Math.random() * 2048, Math.random() * 2048, 0,
        Math.random() * 2048, Math.random() * 2048, 500
      );
      gradient.addColorStop(0, `hsl(${Math.random() * 360}, 70%, 50%)`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2048, 2048);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.name = `HeavyTexture_${addedTextures.length}`;
    addedTextures.push(texture);
    
    // Apply to random objects
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && Math.random() > 0.7) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material = child.material.clone();
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      }
    });
    
    console.log(`Added heavy texture (total: ${addedTextures.length})`);
  },
  
  // Add 5 lights to trigger light violations
  addLights: () => {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    
    for (let i = 0; i < 5; i++) {
      const light = new THREE.PointLight(colors[i], 1, 10);
      light.name = `AddedLight_${addedLights.length}`;
      light.position.set(
        (Math.random() - 0.5) * 12,
        2 + Math.random() * 3,
        (Math.random() - 0.5) * 12
      );
      light.castShadow = Math.random() > 0.5;
      scene.add(light);
      addedLights.push(light);
      
      // Add helper sphere
      const helper = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial({ color: colors[i] })
      );
      helper.name = `LightHelper_${addedLights.length}`;
      helper.position.copy(light.position);
      scene.add(helper);
      addedObjects.push(helper);
    }
    
    console.log(`Added 5 lights (total: ${addedLights.length})`);
  },
  
  // Reset scene to initial state
  reset: () => {
    // Remove added objects
    addedObjects.forEach(obj => {
      scene.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
    });
    addedObjects.length = 0;
    
    // Remove added lights
    addedLights.forEach(light => {
      scene.remove(light);
    });
    addedLights.length = 0;
    
    // Dispose textures
    addedTextures.forEach(tex => tex.dispose());
    addedTextures.length = 0;
    
    // Clear violations
    probe.clearViolations();
    
    console.log('Scene reset');
  },
  
  // Update thresholds
  setThresholds: (thresholds: Partial<RulesConfig>) => {
    probe.updateThresholds(thresholds);
    console.log('Thresholds updated:', thresholds);
  },
  
  // Get current thresholds
  getThresholds: () => {
    return probe.getThresholds();
  },
  
  // Get violation summary
  getViolations: () => {
    return probe.getViolationSummary();
  },
};

// =============================================================================
// ANIMATION LOOP
// =============================================================================

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  // Animate objects
  const time = Date.now() * 0.001;
  addedObjects.forEach((obj, i) => {
    if (obj instanceof THREE.Mesh && !obj.name.startsWith('LightHelper')) {
      obj.rotation.y = time + i * 0.1;
    }
  });
  
  renderer.render(scene, camera);
}

animate();

// =============================================================================
// RESIZE HANDLING
// =============================================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log(`
⚙️ Configuration Rules Example
═══════════════════════════════════════

Open 3Lens DevTools (Ctrl+Shift+D) to see:
• Performance panel - View rule violations
• Configuration - Adjust thresholds

Console commands to trigger violations:
  rulesDemo.addObjects()    - Add 50 objects (triggers draw calls)
  rulesDemo.addLights()     - Add 5 lights (triggers light limit)
  rulesDemo.addTextures()   - Add heavy textures (triggers memory)
  rulesDemo.reset()         - Reset scene to initial state

Threshold management:
  rulesDemo.setThresholds({ maxDrawCalls: 50 })
  rulesDemo.getThresholds()
  rulesDemo.getViolations()

Current thresholds:
  maxDrawCalls: 100
  maxTriangles: 50000
  maxLights: 5
  minFps: 30

═══════════════════════════════════════
`);
