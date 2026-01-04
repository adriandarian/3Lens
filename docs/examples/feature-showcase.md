# Feature Showcase Examples

This guide provides comprehensive walkthroughs for 3Lens features through dedicated showcase examples. Each example focuses on a specific feature set with interactive demonstrations.

[[toc]]

## Overview

These examples demonstrate advanced 3Lens features with focused, interactive scenarios:

| Example | Feature Focus | Key Concepts |
|---------|--------------|--------------|
| [Transform Gizmo](#transform-gizmo) | Object manipulation | Translate, rotate, scale, undo/redo |
| [Custom Plugin](#custom-plugin) | Plugin development | Custom panels, settings, messaging |
| [WebGPU Features](#webgpu-features) | WebGPU debugging | GPU timing, pipelines, capabilities |
| [Configuration Rules](#configuration-rules) | Rules engine | Thresholds, custom rules, violations |

---

## Transform Gizmo

This example demonstrates the transform gizmo system for interactive object manipulation with full undo/redo history.

### Features Demonstrated

- **Transform Modes**: Translate, rotate, and scale operations
- **Coordinate Spaces**: World vs local coordinate systems
- **Snap to Grid**: Configurable snapping for precise positioning
- **Undo/Redo History**: Full transform history with keyboard shortcuts
- **Transform Controls Integration**: Three.js TransformControls with 3Lens
- **Real-time Updates**: Live object inspector updates during transforms

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/feature-showcase/transform-gizmo
pnpm dev
```

Open http://localhost:3000 in your browser.

### Project Structure

```
transform-gizmo/
├── src/
│   └── main.ts          # Transform gizmo demonstration
├── index.html           # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Set Up Transform Controls

```typescript
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

// Create transform controls
const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.name = 'TransformControls';
scene.add(transformControls);

// Disable orbit controls while transforming
transformControls.addEventListener('dragging-changed', (event) => {
  orbitControls.enabled = !event.value;
});
```

#### Step 2: Implement History System

```typescript
interface TransformState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

interface HistoryEntry {
  objectName: string;
  objectUuid: string;
  action: 'translate' | 'rotate' | 'scale';
  before: TransformState;
  after: TransformState;
  timestamp: number;
}

const history: HistoryEntry[] = [];
let historyIndex = -1;

function captureTransformState(obj: THREE.Object3D): TransformState {
  return {
    position: obj.position.clone(),
    rotation: obj.rotation.clone(),
    scale: obj.scale.clone(),
  };
}

function applyTransformState(obj: THREE.Object3D, state: TransformState) {
  obj.position.copy(state.position);
  obj.rotation.copy(state.rotation);
  obj.scale.copy(state.scale);
}
```

#### Step 3: Handle Undo/Redo

```typescript
function undo() {
  if (historyIndex < 0) return;
  
  const entry = history[historyIndex];
  const obj = scene.getObjectByProperty('uuid', entry.objectUuid);
  
  if (obj) {
    applyTransformState(obj, entry.before);
  }
  
  historyIndex--;
}

function redo() {
  if (historyIndex >= history.length - 1) return;
  
  historyIndex++;
  const entry = history[historyIndex];
  const obj = scene.getObjectByProperty('uuid', entry.objectUuid);
  
  if (obj) {
    applyTransformState(obj, entry.after);
  }
}

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    if (e.shiftKey) redo();
    else undo();
  }
});
```

#### Step 4: Transform Mode Switching

```typescript
// Toggle transform mode with keyboard
window.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case 'g': // Translate (Grab)
      transformControls.setMode('translate');
      break;
    case 'r': // Rotate
      transformControls.setMode('rotate');
      break;
    case 's': // Scale
      transformControls.setMode('scale');
      break;
    case 'x': // Toggle local/world space
      transformControls.setSpace(
        transformControls.space === 'world' ? 'local' : 'world'
      );
      break;
  }
});
```

#### Step 5: Snap Configuration

```typescript
// Enable snapping
const snapSettings = {
  translate: 0.5,  // 0.5 unit grid
  rotate: 15,      // 15 degree increments
  scale: 0.1,      // 10% scale increments
};

function updateSnap(enabled: boolean) {
  if (enabled) {
    transformControls.setTranslationSnap(snapSettings.translate);
    transformControls.setRotationSnap(THREE.MathUtils.degToRad(snapSettings.rotate));
    transformControls.setScaleSnap(snapSettings.scale);
  } else {
    transformControls.setTranslationSnap(null);
    transformControls.setRotationSnap(null);
    transformControls.setScaleSnap(null);
  }
}
```

### Key Features

#### Transform History Panel

The example includes a custom history panel showing:
- Recent transform operations
- Object names and action types
- Undo/redo position indicator
- Clear history option

#### Coordinate Space Toggle

- **World Space**: Axes aligned to world coordinates
- **Local Space**: Axes aligned to object's rotation

#### Multi-Object Selection

Select multiple objects and transform them together:
- Box selection with click-drag
- Add to selection with Shift+click
- Group transforms affect all selected objects

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G` | Translate mode |
| `R` | Rotate mode |
| `S` | Scale mode |
| `X` | Toggle world/local space |
| `Shift+X/Y/Z` | Constrain to axis |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Delete` | Delete selected object |
| `Escape` | Deselect |

### Debugging with 3Lens

Use 3Lens panels to monitor transforms:

1. **Object Inspector**: Watch position, rotation, scale in real-time
2. **Scene Explorer**: See object hierarchy and selection state
3. **Stats Panel**: Monitor performance during transform operations

---

## Custom Plugin

This example demonstrates how to create comprehensive 3Lens plugins with custom panels, settings, and inter-plugin communication.

### Features Demonstrated

- **Custom Panels**: Rich UI panels with live data visualization
- **Plugin Settings**: Schema-based configuration with type-safe options
- **Toolbar Actions**: Quick-access buttons in the overlay toolbar
- **Context Menu Items**: Right-click integration in the scene tree
- **Inter-Plugin Messaging**: Communication between plugins
- **State Persistence**: Save and restore plugin state
- **Toast Notifications**: User feedback system

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/feature-showcase/custom-plugin
pnpm dev
```

Open http://localhost:3000 in your browser.

### Project Structure

```
custom-plugin/
├── src/
│   └── main.ts          # Plugin implementation demo
├── index.html           # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Define Plugin Metadata

```typescript
import { 
  type DevtoolPlugin, 
  type DevtoolContext,
  type PanelRenderContext 
} from '@3lens/core';

const StatsMonitorPlugin: DevtoolPlugin = {
  metadata: {
    id: 'custom.stats-monitor',
    name: 'Stats Monitor',
    version: '1.0.0',
    description: 'Real-time scene statistics with customizable tracking',
    author: 'Your Name',
    icon: '📊',
    tags: ['stats', 'performance', 'monitoring'],
  },
  // ... plugin implementation
};
```

#### Step 2: Define Settings Schema

```typescript
const StatsMonitorPlugin: DevtoolPlugin = {
  // ... metadata
  
  settings: {
    fields: [
      {
        key: 'refreshRate',
        label: 'Refresh Rate (ms)',
        type: 'number',
        defaultValue: 100,
        description: 'How often to update stats display',
        min: 16,
        max: 1000,
        step: 10,
      },
      {
        key: 'showTriangles',
        label: 'Show Triangle Count',
        type: 'boolean',
        defaultValue: true,
      },
      {
        key: 'highlightColor',
        label: 'Highlight Color',
        type: 'color',
        defaultValue: '#61dafb',
      },
      {
        key: 'warningThreshold',
        label: 'Warning Threshold',
        type: 'select',
        defaultValue: 'medium',
        options: [
          { value: 'low', label: 'Low (100K tris)' },
          { value: 'medium', label: 'Medium (500K tris)' },
          { value: 'high', label: 'High (1M tris)' },
        ],
      },
    ],
  },
};
```

#### Step 3: Implement Lifecycle Hooks

```typescript
const StatsMonitorPlugin: DevtoolPlugin = {
  // ... metadata, settings
  
  activate(context: DevtoolContext) {
    context.log('Stats Monitor plugin activated!');
    
    // Initialize state
    context.setState('activatedAt', Date.now());
    context.setState('updateCount', 0);
    
    // Show notification
    context.showToast('Stats Monitor activated!', 'success');
    
    // Subscribe to messages
    const unsubscribe = context.onMessage((message) => {
      if (message.type === 'REQUEST_STATS') {
        const stats = context.getFrameStats();
        context.sendMessage(message.source, 'STATS_RESPONSE', {
          triangles: stats?.triangleCount ?? 0,
          fps: stats?.fps ?? 0,
        });
      }
    });
    
    context.setState('messageUnsubscribe', unsubscribe);
  },

  deactivate(context: DevtoolContext) {
    // Cleanup subscriptions
    const unsubscribe = context.getState<() => void>('messageUnsubscribe');
    if (unsubscribe) unsubscribe();
    
    context.showToast('Stats Monitor deactivated', 'info');
  },

  onSettingsChange(settings: Record<string, unknown>, context: DevtoolContext) {
    context.log('Settings changed', settings);
    context.requestRender();
  },
};
```

#### Step 4: Create Custom Panels

```typescript
const StatsMonitorPlugin: DevtoolPlugin = {
  // ... previous code
  
  panels: [
    {
      id: 'stats-overview',
      title: 'Stats Overview',
      icon: '📈',
      
      render(ctx: PanelRenderContext) {
        const { container, settings, context } = ctx;
        const stats = context.getFrameStats();
        
        container.innerHTML = `
          <div class="stats-panel">
            <div class="stat-row">
              <span class="label">FPS</span>
              <span class="value">${stats?.fps?.toFixed(1) ?? '-'}</span>
            </div>
            <div class="stat-row">
              <span class="label">Draw Calls</span>
              <span class="value">${stats?.drawCallCount ?? '-'}</span>
            </div>
            ${settings.showTriangles ? `
              <div class="stat-row">
                <span class="label">Triangles</span>
                <span class="value">${formatNumber(stats?.triangleCount ?? 0)}</span>
              </div>
            ` : ''}
          </div>
        `;
      },
    },
  ],
};
```

#### Step 5: Add Toolbar Actions

```typescript
const StatsMonitorPlugin: DevtoolPlugin = {
  // ... previous code
  
  toolbarActions: [
    {
      id: 'toggle-pause',
      label: 'Pause Stats',
      icon: '⏸️',
      onClick(context: DevtoolContext) {
        const isPaused = context.getState<boolean>('isPaused');
        context.setState('isPaused', !isPaused);
        context.showToast(isPaused ? 'Resumed' : 'Paused', 'info');
      },
    },
    {
      id: 'reset-stats',
      label: 'Reset Stats',
      icon: '🔄',
      onClick(context: DevtoolContext) {
        context.setState('updateCount', 0);
        context.requestRender();
      },
    },
  ],
};
```

#### Step 6: Add Context Menu Items

```typescript
const StatsMonitorPlugin: DevtoolPlugin = {
  // ... previous code
  
  contextMenuItems: [
    {
      id: 'analyze-object',
      label: 'Analyze Performance',
      icon: '🔍',
      appliesTo: 'mesh',
      onClick(object: THREE.Object3D, context: DevtoolContext) {
        const mesh = object as THREE.Mesh;
        const geometry = mesh.geometry;
        const triangles = geometry.index 
          ? geometry.index.count / 3 
          : geometry.attributes.position.count / 3;
        
        context.showToast(
          `${object.name}: ${triangles.toLocaleString()} triangles`,
          'info'
        );
      },
    },
  ],
};
```

#### Step 7: Register the Plugin

```typescript
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

const probe = createProbe();

// Register the plugin
probe.registerPlugin(StatsMonitorPlugin);

// Connect scene and renderer
probe.observeScene(scene);
probe.observeRenderer(renderer);

// Create overlay
bootstrapOverlay(probe);
```

### Plugin API Reference

| Context Method | Description |
|---------------|-------------|
| `context.log(...)` | Log to plugin console |
| `context.getFrameStats()` | Get current frame statistics |
| `context.getState(key)` | Retrieve persisted state |
| `context.setState(key, value)` | Store state |
| `context.showToast(msg, type)` | Show notification |
| `context.sendMessage(target, type, data)` | Send to other plugins |
| `context.onMessage(handler)` | Subscribe to messages |
| `context.requestRender()` | Request panel re-render |
| `context.getSelectedObject()` | Get currently selected object |
| `context.selectObject(obj)` | Select an object |

---

## WebGPU Features

This example demonstrates 3Lens integration with WebGPU for next-generation graphics debugging.

### Features Demonstrated

- **WebGPU Detection**: Automatic renderer detection and capability checking
- **GPU Timing**: Precise GPU timing with timestamp queries
- **Pipeline Tracking**: Monitor render and compute pipelines
- **Device Capabilities**: Inspect GPU limits and features
- **WebGPU-Specific Stats**: Extended frame statistics for WebGPU

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/feature-showcase/webgpu-features
pnpm dev
```

Open http://localhost:3000 in a WebGPU-compatible browser (Chrome 113+, Edge 113+).

### Project Structure

```
webgpu-features/
├── src/
│   └── main.ts          # WebGPU demonstration
├── index.html           # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Check WebGPU Support

```typescript
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
```

#### Step 2: Initialize WebGPU Renderer

```typescript
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

async function initWebGPU() {
  const isSupported = await checkWebGPUSupport();
  
  if (!isSupported) {
    console.warn('WebGPU not supported, falling back to WebGL');
    return new THREE.WebGLRenderer({ antialias: true });
  }
  
  const renderer = new WebGPURenderer({ antialias: true });
  await renderer.init();
  
  return renderer;
}
```

#### Step 3: Connect 3Lens

```typescript
import { 
  createProbe,
  isWebGPURenderer,
  getWebGPUCapabilities 
} from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe();
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Get WebGPU-specific capabilities
if (isWebGPURenderer(renderer)) {
  const capabilities = getWebGPUCapabilities(renderer);
  console.log('Device:', capabilities.deviceLabel);
  console.log('Max Texture Size:', capabilities.maxTexture2DSize);
  console.log('Timestamp Query:', capabilities.timestampQuery);
}

const overlay = createOverlay(probe);
```

#### Step 4: Enable GPU Timing

```typescript
// GPU timing is automatically enabled for WebGPU renderers
// Access timing data through frame stats
probe.onFrameStats((stats) => {
  if (stats.gpuTime !== undefined) {
    console.log(`GPU Time: ${stats.gpuTime.toFixed(2)}ms`);
  }
  
  if (stats.passBreakdown) {
    for (const [pass, time] of Object.entries(stats.passBreakdown)) {
      console.log(`  ${pass}: ${time.toFixed(2)}ms`);
    }
  }
});
```

### WebGPU Capabilities Display

The example displays comprehensive GPU information:

| Capability | Description |
|------------|-------------|
| Device Label | GPU model name |
| Max Texture 2D | Maximum 2D texture dimension |
| Max Bind Groups | Maximum bind group count |
| Timestamp Query | GPU timing support |
| Max Compute Workgroups | Compute shader limits |

### GPU Timing Breakdown

With WebGPU, 3Lens provides detailed pass timing:

- **Render Pass**: Time spent in render passes
- **Compute Pass**: Time spent in compute shaders
- **Copy Operations**: Buffer/texture copy timing
- **Total GPU Time**: Sum of all GPU work

### Pipeline Monitoring

Track active render and compute pipelines:

```typescript
// Pipelines are tracked automatically
// Access through the Performance panel or programmatically:
const stats = probe.getLatestFrameStats();

if (stats?.pipelinesUsed) {
  console.log(`Active Pipelines: ${stats.pipelinesUsed}`);
}
```

### Browser Compatibility

| Browser | WebGPU Status |
|---------|---------------|
| Chrome 113+ | ✅ Full support |
| Edge 113+ | ✅ Full support |
| Firefox | 🔶 Behind flag |
| Safari 17+ | ✅ Full support |

---

## Configuration Rules

This example demonstrates the 3Lens rules engine for automated performance monitoring and threshold enforcement.

### Features Demonstrated

- **Built-in Thresholds**: Pre-configured performance rules
- **Custom Rules**: User-defined validation logic
- **Violation Tracking**: Real-time violation monitoring
- **Callbacks**: React to threshold violations
- **Runtime Updates**: Dynamic threshold adjustment
- **Config Export**: Generate configuration files

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/feature-showcase/configuration-rules
pnpm dev
```

Open http://localhost:3000 in your browser.

### Project Structure

```
configuration-rules/
├── src/
│   └── main.ts          # Rules engine demonstration
├── index.html           # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Configure Built-in Thresholds

```typescript
import { createProbe, type RulesConfig } from '@3lens/core';

const rulesConfig: RulesConfig = {
  thresholds: {
    // Performance thresholds
    maxDrawCalls: 200,
    maxTriangles: 500_000,
    minFPS: 30,
    maxFrameTime: 33,
    
    // Memory thresholds
    maxTextures: 50,
    maxGeometries: 100,
    maxGPUMemoryMB: 256,
    
    // Scene thresholds
    maxSceneObjects: 1000,
    maxLights: 8,
    maxShadowLights: 4,
  },
  
  // Enable automatic violation logging
  logViolations: true,
  
  // Callback for violations
  onViolation: (violation) => {
    console.warn(`Rule violated: ${violation.rule}`, violation);
  },
};

const probe = createProbe({ rules: rulesConfig });
```

#### Step 2: Create Custom Rules

```typescript
import { type CustomRule } from '@3lens/core';

const customRules: CustomRule[] = [
  {
    id: 'no-unnamed-objects',
    name: 'No Unnamed Objects',
    check: (stats) => {
      // Custom validation logic
      const hasUnnamed = stats.sceneObjects?.some(obj => !obj.name);
      return {
        passed: !hasUnnamed,
        message: hasUnnamed ? 'Found unnamed objects' : 'All objects named',
        severity: 'warning',
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
      
      return {
        passed: ratio <= 0.5,
        message: `Shadow ratio: ${(ratio * 100).toFixed(0)}%`,
        severity: ratio > 0.5 ? 'warning' : 'info',
      };
    },
  },
  
  {
    id: 'memory-efficiency',
    name: 'Memory Efficiency',
    check: (stats) => {
      const gpuMemoryMB = (stats.memory?.gpuMemory ?? 0) / (1024 * 1024);
      return {
        passed: gpuMemoryMB < 100,
        message: `GPU Memory: ${gpuMemoryMB.toFixed(1)}MB`,
        severity: gpuMemoryMB >= 100 ? 'error' : 'info',
      };
    },
  },
];

// Register custom rules
customRules.forEach(rule => probe.registerRule(rule));
```

#### Step 3: Handle Violations

```typescript
// Subscribe to all violations
probe.onRuleViolation((violation) => {
  const { rule, severity, message, stats } = violation;
  
  switch (severity) {
    case 'error':
      showError(`🚨 ${rule}: ${message}`);
      break;
    case 'warning':
      showWarning(`⚠️ ${rule}: ${message}`);
      break;
    case 'info':
      showInfo(`ℹ️ ${rule}: ${message}`);
      break;
  }
});

// Query current violations
const activeViolations = probe.getActiveViolations();
console.log(`${activeViolations.length} active violations`);
```

#### Step 4: Update Thresholds at Runtime

```typescript
// Adjust thresholds based on device capabilities
function adjustThresholdsForDevice() {
  const isMobile = /Android|iPhone/i.test(navigator.userAgent);
  
  probe.updateThresholds({
    maxTriangles: isMobile ? 100_000 : 500_000,
    maxDrawCalls: isMobile ? 50 : 200,
    minFPS: isMobile ? 30 : 60,
    maxGPUMemoryMB: isMobile ? 64 : 256,
  });
}

// Temporarily disable rules for specific operations
probe.disableRule('max-triangles');
await loadHighPolyModel();
probe.enableRule('max-triangles');
```

#### Step 5: Export Configuration

```typescript
// Generate a configuration file
const configExport = probe.exportRulesConfig();

// Download as JSON
const blob = new Blob([JSON.stringify(configExport, null, 2)], {
  type: 'application/json',
});
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = '3lens-rules.json';
a.click();
```

### Built-in Rules Reference

| Rule | Default | Description |
|------|---------|-------------|
| `maxDrawCalls` | 500 | Maximum draw calls per frame |
| `maxTriangles` | 1,000,000 | Maximum triangle count |
| `minFPS` | 30 | Minimum acceptable FPS |
| `maxFrameTime` | 33ms | Maximum frame time |
| `maxTextures` | 100 | Maximum texture count |
| `maxGeometries` | 200 | Maximum geometry count |
| `maxGPUMemoryMB` | 512 | Maximum GPU memory usage |
| `maxSceneObjects` | 5000 | Maximum scene objects |
| `maxLights` | 16 | Maximum light count |
| `maxShadowLights` | 8 | Maximum shadow-casting lights |

### Custom Rule API

```typescript
interface CustomRule {
  /** Unique rule identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Validation function */
  check: (stats: FrameStats) => {
    passed: boolean;
    message: string;
    severity: 'error' | 'warning' | 'info';
    data?: Record<string, unknown>;
  };
  
  /** Optional: only run every N frames */
  checkInterval?: number;
  
  /** Optional: enabled by default */
  enabled?: boolean;
}
```

### Debugging with Rules Panel

The 3Lens overlay includes a Rules panel showing:

1. **Active Rules**: All registered rules with status
2. **Violations**: Current violation list with details
3. **Threshold Editor**: Adjust values in real-time
4. **Rule Toggle**: Enable/disable individual rules
5. **History**: Recent violation timeline

---

## See Also

- [Framework Integration Examples](./framework-integration.md) - Framework-specific setups
- [Debugging Examples](./debugging-examples.md) - Performance and memory debugging
- [Real-World Scenarios](./real-world-scenarios.md) - Production application patterns
- [Game Development Examples](./game-development.md) - Game-specific debugging
- [Plugin Development Guide](/guides/PLUGIN-DEVELOPMENT.md) - Full plugin development guide
- [Custom Rules Guide](/guides/CUSTOM-RULES-GUIDE.md) - Advanced rule configuration
