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
 * - Config file generation
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

interface TrackedCustomRule extends CustomRule {
  description: string;
  lastResult: boolean;
}

const customRules: TrackedCustomRule[] = [
  {
    id: 'no-unnamed-objects',
    name: 'No Unnamed Objects',
    description: 'All meshes should have a name for debugging',
    lastResult: true,
    check: (stats) => {
      // Check if there are objects without proper names
      const unnamed = stats.memory?.geometries ?? 0;
      // This is a simplified check - in real usage you'd traverse the scene
      const passed = true; // All our objects have names
      return {
        passed,
        message: passed ? 'All objects are named' : 'Found unnamed objects',
        severity: 'warning',
      };
    },
  },
  {
    id: 'shadow-light-ratio',
    name: 'Shadow Light Ratio',
    description: 'Shadow lights should be ≤50% of total lights',
    lastResult: true,
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
    description: 'GPU memory should be under 100MB',
    lastResult: true,
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
  console.warn(`Rule violation: ${violation.ruleName}`, violation);
  updateViolationsList();
  updateSummary();
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

bootstrapOverlay({
  probe,
  position: 'right',
  defaultWidth: 380,
  defaultOpen: false,
});

// =============================================================================
// UI HELPERS
// =============================================================================

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function updateSummary() {
  const summary = probe.getViolationSummary();
  const thresholds = probe.getThresholds();
  
  // Calculate passing rules (total built-in rules minus violations)
  const totalBuiltInRules = 10; // Approximate built-in rule count
  const passing = totalBuiltInRules - summary.errors - summary.warnings;
  
  document.getElementById('error-count')!.textContent = String(summary.errors);
  document.getElementById('warning-count')!.textContent = String(summary.warnings);
  document.getElementById('passing-count')!.textContent = String(Math.max(0, passing));
}

function updateViolationsList() {
  const violations = probe.getRecentViolations();
  const container = document.getElementById('violations-list')!;
  
  if (violations.length === 0) {
    container.innerHTML = `
      <div style="color: #666; text-align: center; padding: 20px;">
        No violations yet
      </div>
    `;
    return;
  }
  
  // Show recent violations (last 10)
  const recent = violations.slice(-10).reverse();
  container.innerHTML = recent.map(v => `
    <div class="violation-item">
      <span class="violation-icon">
        ${v.severity === 'error' ? '❌' : v.severity === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <div class="violation-content">
        <div class="violation-name">${v.ruleName}</div>
        <div class="violation-message">${v.message}</div>
      </div>
      <span class="violation-severity severity-${v.severity}">${v.severity}</span>
    </div>
  `).join('');
}

function updateCustomRulesList() {
  const container = document.getElementById('custom-rules-list')!;
  
  container.innerHTML = customRules.map(rule => `
    <div class="custom-rule-item">
      <div class="custom-rule-header">
        <div>
          <div class="custom-rule-name">${rule.name}</div>
          <div class="custom-rule-id">${rule.id}</div>
        </div>
        <span class="custom-rule-status ${rule.lastResult ? 'status-passing' : 'status-failing'}">
          ${rule.lastResult ? '✓ Passing' : '✗ Failing'}
        </span>
      </div>
      <div style="font-size: 11px; color: #888;">${rule.description}</div>
    </div>
  `).join('');
}

function updateConfigPreview() {
  const thresholds = probe.getThresholds();
  const preview = document.getElementById('config-preview')!;
  
  preview.innerHTML = `<span class="comment">// 3lens.config.js</span>
<span class="key">export default</span> {
  <span class="key">appName</span>: <span class="value">'ConfigRulesDemo'</span>,
  <span class="key">rules</span>: {
    <span class="key">maxDrawCalls</span>: <span class="number">${thresholds.maxDrawCalls}</span>,
    <span class="key">maxTriangles</span>: <span class="number">${thresholds.maxTriangles}</span>,
    <span class="key">maxLights</span>: <span class="number">${thresholds.maxLights}</span>,
    <span class="key">minFps</span>: <span class="number">${thresholds.minFps}</span>,
    <span class="key">maxTextureMemory</span>: <span class="number">${thresholds.maxTextureMemory}</span>,
    <span class="key">custom</span>: [<span class="comment">/* ${customRules.length} rules */</span>]
  }
};`;
}

// =============================================================================
// SCENE MANIPULATION (TRIGGER VIOLATIONS)
// =============================================================================

function addObjects() {
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
  updateSummary();
}

function addHeavyTextures() {
  // Create some large textures to increase memory
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;
  
  // Draw random pattern
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
  updateSummary();
}

function addLights() {
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
  updateSummary();
}

function resetScene() {
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
  updateSummary();
  updateViolationsList();
}

// =============================================================================
// UI SETUP
// =============================================================================

// Scene controls
document.getElementById('add-objects')!.addEventListener('click', addObjects);
document.getElementById('add-textures')!.addEventListener('click', addHeavyTextures);
document.getElementById('add-lights')!.addEventListener('click', addLights);
document.getElementById('reset-scene')!.addEventListener('click', resetScene);

// Threshold controls
document.getElementById('apply-thresholds')!.addEventListener('click', () => {
  const thresholds: Partial<RulesConfig> = {
    maxDrawCalls: parseInt((document.getElementById('threshold-drawcalls') as HTMLInputElement).value),
    maxTriangles: parseInt((document.getElementById('threshold-triangles') as HTMLInputElement).value),
    maxLights: parseInt((document.getElementById('threshold-lights') as HTMLInputElement).value),
    minFps: parseInt((document.getElementById('threshold-fps') as HTMLInputElement).value),
  };
  
  probe.updateThresholds(thresholds);
  console.log('Thresholds updated:', thresholds);
  updateConfigPreview();
  updateSummary();
});

document.getElementById('reset-thresholds')!.addEventListener('click', () => {
  // Reset to defaults
  probe.updateThresholds({
    maxDrawCalls: 1000,
    maxTriangles: 500000,
    maxLights: 10,
    minFps: 30,
  });
  
  // Update inputs
  (document.getElementById('threshold-drawcalls') as HTMLInputElement).value = '1000';
  (document.getElementById('threshold-triangles') as HTMLInputElement).value = '500000';
  (document.getElementById('threshold-lights') as HTMLInputElement).value = '10';
  (document.getElementById('threshold-fps') as HTMLInputElement).value = '30';
  
  console.log('Thresholds reset to defaults');
  updateConfigPreview();
  updateSummary();
});

// Custom rule controls
let customRuleCounter = 0;

document.getElementById('add-custom-rule')!.addEventListener('click', () => {
  const id = `custom-rule-${++customRuleCounter}`;
  const rule: TrackedCustomRule = {
    id,
    name: `Custom Rule ${customRuleCounter}`,
    description: 'User-defined rule (checks triangle count)',
    lastResult: true,
    check: (stats) => {
      const triangles = stats.triangleCount;
      const passed = triangles < 100000;
      return {
        passed,
        message: `Triangles: ${triangles.toLocaleString()}`,
        severity: passed ? 'info' : 'warning',
      };
    },
  };
  
  customRules.push(rule);
  probe.addCustomRule(rule);
  
  console.log(`Added custom rule: ${rule.name}`);
  updateCustomRulesList();
  updateConfigPreview();
});

// Violation controls
document.getElementById('clear-violations')!.addEventListener('click', () => {
  probe.clearViolations();
  updateViolationsList();
  updateSummary();
  console.log('Violations cleared');
});

document.getElementById('export-config')!.addEventListener('click', () => {
  const configContent = probe.generateConfigFile();
  const blob = new Blob([configContent], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '3lens.config.js';
  a.click();
  URL.revokeObjectURL(url);
  console.log('Config exported');
});

// Initial UI update
updateCustomRulesList();
updateConfigPreview();
updateSummary();

// Periodic updates
setInterval(() => {
  // Update custom rule results
  const stats = probe.getFrameStats();
  if (stats) {
    customRules.forEach(rule => {
      try {
        const result = rule.check(stats);
        rule.lastResult = result.passed;
      } catch {
        rule.lastResult = false;
      }
    });
    updateCustomRulesList();
  }
  updateSummary();
}, 1000);

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
==============================
This example demonstrates the 3Lens configuration and rules system.

Features:
- Performance thresholds (draw calls, triangles, FPS, lights)
- Custom rule definitions with check functions
- Violation tracking and callbacks
- Runtime threshold updates
- Config file export

Try:
1. Click "Add 50 Objects" to trigger draw call/triangle violations
2. Click "Add 5 Lights" to trigger light violations
3. Adjust thresholds and click "Apply" to see changes
4. Export config to save your settings

Press Ctrl+Shift+D to open the 3Lens overlay.
`);
