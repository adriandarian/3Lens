---
title: Migration from three-inspect to 3Lens
description: Guide for migrating from three-inspect to 3Lens for Three.js debugging and development
---

# Migration from three-inspect to 3Lens

This guide helps you migrate from [three-inspect](https://github.com/nicolo-ribaudo/three-inspect) to 3Lens for Three.js debugging and development.

## Table of Contents

- [Overview](#overview)
- [Why Migrate?](#why-migrate)
- [Quick Migration](#quick-migration)
- [Feature Mapping](#feature-mapping)
- [API Comparison](#api-comparison)
- [Framework Migration](#framework-migration)
- [Plugin Migration](#plugin-migration)
- [Troubleshooting](#troubleshooting)

---

## Overview

three-inspect is a Chrome DevTools extension and library for inspecting Three.js scenes. 3Lens offers similar functionality with additional features, better framework integration, and an in-page overlay that works in any browser.

### Key Differences

| Feature | three-inspect | 3Lens |
|---------|---------------|-------|
| **Deployment** | Chrome extension + library | In-page overlay (any browser) |
| **Browser Support** | Chrome only (extension) | All modern browsers |
| **Scene Tree** | ✅ Available | ✅ Enhanced with search/filter |
| **Object Inspector** | ✅ Basic properties | ✅ Full property editing |
| **Performance** | ⚠️ Limited metrics | ✅ Comprehensive stats |
| **Memory Tracking** | ❌ Not included | ✅ Leak detection |
| **Transform Gizmos** | ⚠️ Basic | ✅ Full translate/rotate/scale |
| **Framework Support** | ⚠️ Limited | ✅ React, Vue, Angular bridges |
| **CI Integration** | ❌ Not included | ✅ Headless testing support |
| **Plugin System** | ❌ Not included | ✅ Extensible architecture |
| **TypeScript** | ⚠️ Partial | ✅ Full type definitions |

---

## Why Migrate?

### Limitations of three-inspect

1. **Chrome-only Extension**
   - Requires Chrome DevTools extension installation
   - Not available in Firefox, Safari, or Edge
   - Cannot work in CI/CD pipelines

2. **Limited Integration**
   - No native React/Vue/Angular hooks
   - Manual scene registration
   - No logical entity grouping

3. **Basic Feature Set**
   - Limited performance metrics
   - No memory leak detection
   - Basic transform controls

### Benefits of 3Lens

1. **Universal Browser Support**
   - Works in any modern browser
   - In-page overlay requires no extension
   - Consistent experience across platforms

2. **Rich Framework Integration**
   - Native hooks for React (`useDevtoolEntity`)
   - Vue composables (`useDevtoolEntity`)
   - Angular directives and services
   - Automatic component-to-object mapping

3. **Advanced Debugging**
   - Comprehensive performance profiling
   - Memory leak detection and alerts
   - GPU timing (WebGL2/WebGPU)
   - Custom rules and validations

4. **CI/CD Ready**
   - Headless mode for automated testing
   - Performance regression detection
   - Screenshot and snapshot capture

---

## Quick Migration

### Step 1: Install 3Lens

```bash
# Remove three-inspect
npm uninstall three-inspect

# Install 3Lens
npm install @3lens/core @3lens/overlay
```

### Step 2: Replace Initialization

**Before (three-inspect):**
```javascript
import { Inspector } from 'three-inspect';
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// three-inspect setup
const inspector = new Inspector({
  scene,
  camera,
  renderer
});

// Must call update in render loop
function animate() {
  inspector.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

**After (3Lens):**
```javascript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// 3Lens setup
const probe = createProbe({ renderer, scene, camera });
createOverlay(probe);

// No need to call update manually - 3Lens hooks into the render loop
function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

### Step 3: Remove Chrome Extension

If you installed the three-inspect Chrome extension:
1. Open `chrome://extensions/`
2. Find "three-inspect"
3. Click "Remove"

---

## Feature Mapping

### Scene Tree Navigation

**three-inspect:**
```javascript
// Scene tree available in Chrome DevTools panel
// Limited search capability
inspector.selectObject(mesh);
```

**3Lens:**
```javascript
// Scene tree in overlay with full search/filter
probe.selectObject(mesh);

// Search by name, type, or property
// Press Ctrl+F in Scene Explorer

// Filter by object type
probe.setFilter({ types: ['Mesh', 'Light'] });

// Filter by custom criteria
probe.setFilter({ 
  predicate: (obj) => obj.material?.wireframe === true 
});
```

### Object Selection

**three-inspect:**
```javascript
// Click in scene tree to select
inspector.on('select', (object) => {
  console.log('Selected:', object);
});
```

**3Lens:**
```javascript
// Multiple selection methods:
// 1. Click in Scene Explorer
// 2. Click in viewport (with gizmo enabled)
// 3. Programmatic selection

probe.on('objectSelected', (object) => {
  console.log('Selected:', object);
});

// Multi-select support
probe.on('selectionChanged', (objects) => {
  console.log('Selection:', objects);
});

// Select by path
probe.selectByPath('/Scene/Group/Mesh');
```

### Property Inspection

**three-inspect:**
```javascript
// View properties in DevTools panel
// Limited editing capabilities
```

**3Lens:**
```javascript
// Full property editing in Object Inspector panel
// Supports all Three.js types

// Vector3 editing with sliders
// Color picker with presets
// Texture preview and replacement
// Material property editing

// Programmatic property access
const position = probe.getProperty(mesh, 'position');
probe.setProperty(mesh, 'position.x', 5);

// Watch for changes
probe.watchProperty(mesh, 'position', (newValue, oldValue) => {
  console.log('Position changed:', newValue);
});
```

### Performance Monitoring

**three-inspect:**
```javascript
// Basic render info display
// Limited metrics
```

**3Lens:**
```javascript
// Comprehensive performance metrics
const stats = probe.getFrameStats();
console.log({
  fps: stats.fps,
  frameTime: stats.frameTime,
  drawCalls: stats.drawCalls,
  triangles: stats.triangles,
  points: stats.points,
  lines: stats.lines,
  textures: stats.textures,
  geometries: stats.geometries,
  programs: stats.programs
});

// Historical data
const history = probe.getFrameHistory(60); // Last 60 frames

// GPU timing (WebGL2/WebGPU)
const gpuStats = probe.getGPUStats();
console.log({
  gpuTime: gpuStats.frameTime,
  vertexShaderTime: gpuStats.vertexTime,
  fragmentShaderTime: gpuStats.fragmentTime
});

// Performance budgets
probe.setPerformanceBudget({
  maxFrameTime: 16.67, // 60fps
  maxDrawCalls: 100,
  maxTriangles: 1000000
});

probe.on('budgetExceeded', ({ metric, value, budget }) => {
  console.warn(`${metric} exceeded: ${value} > ${budget}`);
});
```

### Transform Controls

**three-inspect:**
```javascript
// Basic transform display in inspector
// No visual gizmos
```

**3Lens:**
```javascript
// Full transform gizmo support
// Press W (translate), E (rotate), R (scale)

// Programmatic gizmo control
probe.setGizmoMode('translate'); // 'translate' | 'rotate' | 'scale'
probe.setGizmoSpace('local'); // 'local' | 'world'

// Snap settings
probe.setTransformSnap({
  translate: 1,    // Snap to 1 unit
  rotate: 15,      // Snap to 15 degrees
  scale: 0.1       // Snap to 0.1 increments
});

// Transform events
probe.on('transformStart', ({ object, mode }) => {});
probe.on('transformChange', ({ object, mode, delta }) => {});
probe.on('transformEnd', ({ object, mode }) => {});
```

---

## API Comparison

### Initialization Options

**three-inspect:**
```javascript
const inspector = new Inspector({
  scene,
  camera,
  renderer,
  autoUpdate: true,
  visible: true
});
```

**3Lens:**
```javascript
const probe = createProbe({
  renderer,
  scene,
  camera,
  
  // Additional options
  autoStart: true,
  sampleRate: 60,
  maxHistorySize: 300,
  
  // Memory tracking
  trackMemory: true,
  leakDetection: true,
  
  // Performance
  enableGPUTiming: true,
  performanceBudget: {
    maxFrameTime: 16.67,
    maxDrawCalls: 100
  },
  
  // Plugins
  plugins: [
    lodCheckerPlugin(),
    shadowDebuggerPlugin()
  ]
});

const overlay = createOverlay(probe, {
  position: 'right',
  width: 350,
  theme: 'dark',
  minimized: false,
  keyboard: true
});
```

### Event System

**three-inspect:**
```javascript
inspector.on('select', callback);
inspector.off('select', callback);
```

**3Lens:**
```javascript
// Rich event system
probe.on('objectSelected', (object) => {});
probe.on('selectionChanged', (objects) => {});
probe.on('propertyChanged', ({ object, property, value }) => {});
probe.on('frameStats', (stats) => {});
probe.on('memoryWarning', ({ type, object, size }) => {});
probe.on('leakDetected', ({ objects, totalSize }) => {});
probe.on('budgetExceeded', ({ metric, value, budget }) => {});
probe.on('ruleViolation', ({ rule, objects, severity }) => {});

// One-time events
probe.once('ready', () => {});

// Remove listener
const unsubscribe = probe.on('objectSelected', callback);
unsubscribe(); // Remove
```

### Methods

**three-inspect:**
```javascript
inspector.selectObject(object);
inspector.update();
inspector.dispose();
```

**3Lens:**
```javascript
// Selection
probe.selectObject(object);
probe.selectObjects([obj1, obj2]);
probe.clearSelection();
probe.selectByPath('/Scene/Mesh');
probe.selectByUuid('abc-123');

// Scene inspection
probe.getSceneTree();
probe.findObjects({ type: 'Mesh', name: /player/i });

// Properties
probe.getProperty(object, 'position.x');
probe.setProperty(object, 'position.x', 5);
probe.watchProperty(object, 'position', callback);

// Performance
probe.getFrameStats();
probe.getFrameHistory(count);
probe.getGPUStats();
probe.startProfiling();
probe.stopProfiling();

// Memory
probe.getMemoryStats();
probe.getResourceList();
probe.checkForLeaks();

// Snapshots
probe.createSnapshot();
probe.applySnapshot(snapshot);
probe.savePreset('name');
probe.loadPreset('name');

// Lifecycle
probe.pause();
probe.resume();
probe.refresh();
probe.dispose();
```

---

## Framework Migration

### React Integration

**three-inspect (no native support):**
```javascript
// Manual integration required
function Scene() {
  const inspectorRef = useRef();
  
  useEffect(() => {
    inspectorRef.current = new Inspector({ scene, camera, renderer });
    return () => inspectorRef.current.dispose();
  }, []);
  
  // ...
}
```

**3Lens (native React support):**
```jsx
import { ThreeLensProvider, useDevtoolEntity } from '@3lens/react-bridge';
import { Canvas } from '@react-three/fiber';

// Wrap your app
function App() {
  return (
    <ThreeLensProvider>
      <Canvas>
        <Scene />
      </Canvas>
    </ThreeLensProvider>
  );
}

// Use hooks in components
function Player({ position }) {
  const meshRef = useDevtoolEntity('Player', {
    metadata: { type: 'character', health: 100 }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}

// Access probe anywhere
function DebugPanel() {
  const probe = useThreeLensProbe();
  const fps = useFPS();
  const drawCalls = useDrawCalls();
  
  return (
    <div>
      FPS: {fps} | Draw Calls: {drawCalls}
    </div>
  );
}
```

### Vue/TresJS Integration

**three-inspect (no native support):**
```vue
<!-- Manual integration -->
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { Inspector } from 'three-inspect';

const inspector = ref(null);

onMounted(() => {
  inspector.value = new Inspector({ scene, camera, renderer });
});

onUnmounted(() => {
  inspector.value?.dispose();
});
</script>
```

**3Lens (native Vue support):**
```vue
<script setup>
import { TresCanvas } from '@tresjs/core';
import { ThreeLensPlugin, useDevtoolEntity } from '@3lens/vue-bridge';

// Register plugin
app.use(ThreeLensPlugin);
</script>

<template>
  <TresCanvas>
    <TresPerspectiveCamera :position="[0, 5, 10]" />
    <Player />
  </TresCanvas>
</template>

<!-- Player.vue -->
<script setup>
import { useDevtoolEntity } from '@3lens/vue-bridge';

const { ref: meshRef } = useDevtoolEntity('Player', {
  metadata: { type: 'character' }
});
</script>

<template>
  <TresMesh ref="meshRef">
    <TresBoxGeometry />
    <TresMeshStandardMaterial />
  </TresMesh>
</template>
```

### Angular Integration

**three-inspect (no native support):**
```typescript
// Manual integration
@Component({...})
export class SceneComponent implements OnInit, OnDestroy {
  private inspector: Inspector;
  
  ngOnInit() {
    this.inspector = new Inspector({ scene, camera, renderer });
  }
  
  ngOnDestroy() {
    this.inspector.dispose();
  }
}
```

**3Lens (native Angular support):**
```typescript
// app.module.ts
import { ThreeLensModule } from '@3lens/angular-bridge';

@NgModule({
  imports: [ThreeLensModule.forRoot()]
})
export class AppModule {}

// scene.component.ts
import { ThreeLensService } from '@3lens/angular-bridge';

@Component({
  template: `<canvas #canvas></canvas>`
})
export class SceneComponent {
  constructor(private threeLens: ThreeLensService) {}
  
  ngAfterViewInit() {
    this.threeLens.initialize({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera
    });
  }
}

// player.component.ts
@Component({...})
export class PlayerComponent {
  @ViewChild('mesh') meshRef: ElementRef;
  
  // Use directive for automatic tracking
  // <mesh threeLensEntity="Player" [entityMetadata]="{ type: 'character' }">
}
```

---

## Plugin Migration

If you extended three-inspect with custom functionality, convert it to 3Lens plugins:

### Custom Panel Example

**three-inspect (custom extension):**
```javascript
// No official plugin system
// Required patching or forking
```

**3Lens (plugin system):**
```typescript
import type { DevtoolPlugin, DevtoolContext } from '@3lens/core';

const customAnalysisPlugin: DevtoolPlugin = {
  name: 'custom-analysis',
  version: '1.0.0',
  
  // Initialize when probe starts
  initialize(context: DevtoolContext) {
    // Access probe APIs
    const { probe, scene, renderer } = context;
    
    // Register custom metrics
    context.registerMetric('customMetric', {
      calculate: () => calculateCustomValue()
    });
    
    // Listen to events
    context.on('frameEnd', () => {
      // Custom per-frame logic
    });
  },
  
  // Add custom panel
  panels: [{
    id: 'custom-analysis',
    title: 'Custom Analysis',
    icon: 'chart',
    
    render(container, context) {
      // Render custom UI
      container.innerHTML = `
        <div class="custom-panel">
          <h3>Analysis Results</h3>
          <div id="results"></div>
        </div>
      `;
      
      // Update on frame
      context.on('frameEnd', () => {
        const results = container.querySelector('#results');
        results.textContent = JSON.stringify(context.getMetric('customMetric'));
      });
    }
  }],
  
  // Cleanup
  dispose() {
    // Cleanup resources
  }
};

// Use plugin
const probe = createProbe({
  renderer, scene, camera,
  plugins: [customAnalysisPlugin]
});
```

### Custom Inspector Section

```typescript
const customInspectorPlugin: DevtoolPlugin = {
  name: 'custom-inspector',
  
  initialize(context) {
    // Add section to object inspector
    context.registerInspectorSection({
      id: 'physics',
      title: 'Physics Properties',
      
      // Show for objects with physics
      matches: (object) => object.userData.physicsBody != null,
      
      // Render section content
      render(container, object, context) {
        const body = object.userData.physicsBody;
        
        container.innerHTML = `
          <div class="property-row">
            <label>Mass</label>
            <input type="number" value="${body.mass}" />
          </div>
          <div class="property-row">
            <label>Velocity</label>
            <span>${body.velocity.toArray().join(', ')}</span>
          </div>
        `;
        
        // Handle changes
        container.querySelector('input').addEventListener('change', (e) => {
          body.mass = parseFloat(e.target.value);
          context.emit('propertyChanged', { object, property: 'mass' });
        });
      }
    });
  }
};
```

---

## Troubleshooting

### "I relied on Chrome DevTools integration"

3Lens provides equivalent functionality in the in-page overlay:

| DevTools Feature | 3Lens Equivalent |
|------------------|------------------|
| Elements panel | Scene Explorer panel |
| Properties sidebar | Object Inspector panel |
| Network tab | Resources panel |
| Performance tab | Stats panel + GPU timing |
| Memory tab | Memory panel |
| Console | Events panel + `probe.on()` |

### "My CI pipeline used three-inspect"

3Lens has built-in headless support:

```javascript
import { createProbe } from '@3lens/core';
import { createHeadlessOverlay } from '@3lens/overlay/headless';

const probe = createProbe({ renderer, scene, camera });

// Headless mode for CI
const overlay = createHeadlessOverlay(probe, {
  outputDir: './test-results',
  captureScreenshots: true,
  performanceThresholds: {
    maxFrameTime: 20,
    maxDrawCalls: 150
  }
});

// Run assertions
const stats = await probe.getFrameStats();
expect(stats.fps).toBeGreaterThan(55);
expect(stats.drawCalls).toBeLessThan(100);

// Capture snapshot
await overlay.captureSnapshot('scene-state');
```

### "three-inspect worked without any setup"

3Lens requires minimal setup but offers much more:

```javascript
// Minimal setup (equivalent to three-inspect)
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

createOverlay(createProbe({ renderer, scene, camera }));
// That's it! Same simplicity, more features
```

### "I need to debug in production"

3Lens supports conditional loading:

```javascript
// Only load in development
if (import.meta.env.DEV) {
  const { createProbe } = await import('@3lens/core');
  const { createOverlay } = await import('@3lens/overlay');
  
  createOverlay(createProbe({ renderer, scene, camera }));
}

// In production: 0 bytes added to bundle
```

### "three-inspect had better performance"

3Lens is optimized for minimal overhead:

```javascript
const probe = createProbe({
  renderer, scene, camera,
  
  // Reduce overhead
  sampleRate: 30,           // Sample at 30Hz instead of 60Hz
  enableGPUTiming: false,   // Disable GPU queries
  trackMemory: false,       // Disable memory tracking
  maxHistorySize: 60        // Smaller history buffer
});
```

---

## Migration Checklist

- [ ] Remove three-inspect package
- [ ] Remove Chrome extension (if installed)
- [ ] Install @3lens/core and @3lens/overlay
- [ ] Update initialization code
- [ ] Remove manual `update()` calls from render loop
- [ ] Update event listeners to new API
- [ ] Install framework bridge if using React/Vue/Angular
- [ ] Convert custom extensions to plugins
- [ ] Update CI scripts for headless mode
- [ ] Update documentation

---

## Next Steps

- [Getting Started Guide](/guide/getting-started) - 3Lens fundamentals
- [React/R3F Guide](/guides/REACT-R3F-GUIDE) - React Three Fiber integration
- [Vue/TresJS Guide](/guides/VUE-TRESJS-GUIDE) - Vue and TresJS integration
- [Angular Guide](/guides/ANGULAR-GUIDE) - Angular integration
- [CI Integration Guide](/guides/CI-INTEGRATION) - Automated testing setup

---

## Feature Comparison Table

| Feature | three-inspect | 3Lens |
|---------|---------------|-------|
| Scene tree | ✅ | ✅ Enhanced |
| Object selection | ✅ | ✅ Multi-select |
| Property editing | ⚠️ Limited | ✅ Full |
| Transform gizmos | ❌ | ✅ |
| Performance stats | ⚠️ Basic | ✅ Comprehensive |
| GPU timing | ❌ | ✅ |
| Memory tracking | ❌ | ✅ |
| Leak detection | ❌ | ✅ |
| Custom rules | ❌ | ✅ |
| Plugin system | ❌ | ✅ |
| React hooks | ❌ | ✅ |
| Vue composables | ❌ | ✅ |
| Angular service | ❌ | ✅ |
| Headless/CI mode | ❌ | ✅ |
| Any browser | ❌ Chrome only | ✅ |
| TypeScript | ⚠️ Partial | ✅ Full |
| Keyboard shortcuts | ⚠️ Limited | ✅ Comprehensive |
| Theming | ❌ | ✅ |
| Mobile support | ❌ | ✅ |
