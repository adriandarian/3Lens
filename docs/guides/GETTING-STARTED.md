# Getting Started with 3Lens

Welcome to 3Lens, the definitive developer toolkit for three.js! This guide will walk you through installation, basic setup, and your first debugging session.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Basic Configuration](#basic-configuration)
- [Understanding the UI](#understanding-the-ui)
- [Next Steps](#next-steps)

---

## Prerequisites

Before getting started, ensure you have:

- **Node.js** 18.0.0 or higher
- **A three.js project** (version 0.150.0 or higher recommended)
- **A package manager**: npm, yarn, pnpm, or bun

## Installation

Install the core package and optional overlay UI:

```bash
# Using npm
npm install @3lens/core @3lens/overlay

# Using yarn
yarn add @3lens/core @3lens/overlay

# Using pnpm
pnpm add @3lens/core @3lens/overlay

# Using bun
bun add @3lens/core @3lens/overlay
```

### Framework-Specific Packages

If you're using a framework, install the appropriate bridge package:

```bash
# React / React Three Fiber
npm install @3lens/react-bridge

# Angular
npm install @3lens/angular-bridge

# Vue / TresJS
npm install @3lens/vue-bridge
```

---

## Quick Start

### Vanilla Three.js Setup

Here's the minimal setup to get 3Lens running with a vanilla three.js application:

```typescript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

// 1. Create your three.js scene as usual
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add some objects to your scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Add lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

camera.position.z = 5;

// 2. Create the 3Lens probe
const probe = createProbe({
  appName: 'My Three.js App',
  debug: false, // Set to true for verbose logging
});

// 3. Connect the probe to your renderer and scene
probe.observeRenderer(renderer);
probe.observeScene(scene);

// 4. Provide THREE reference for selection features
probe.setThreeReference(THREE);

// 5. Bootstrap the overlay UI
bootstrapOverlay(probe, {
  position: 'bottom-right',
  theme: 'dark',
});

// 6. Your render loop (3Lens automatically tracks frame stats)
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();
```

### What You Get

After setup, press **Ctrl+Shift+D** (or **Cmd+Shift+D** on Mac) to toggle the 3Lens overlay. You'll see:

- **Real-time FPS** and frame time monitoring
- **Draw calls and triangle counts**
- **Full scene hierarchy** with expandable nodes
- **Material, texture, and geometry inspectors**
- **GPU memory tracking**
- **Performance warnings** when thresholds are exceeded

---

## Basic Configuration

### Probe Configuration

The `createProbe` function accepts a configuration object:

```typescript
const probe = createProbe({
  // Required: Application name for identification
  appName: 'My Game',

  // Optional: Environment identifier
  env: 'development', // 'development' | 'staging' | 'production'

  // Optional: Enable verbose console logging
  debug: false,

  // Optional: Performance thresholds (triggers warnings when exceeded)
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 250_000,
    maxFrameTimeMs: 16.67, // ~60 FPS target
    maxTextures: 100,
    maxTextureMemory: 512 * 1024 * 1024, // 512MB
  },

  // Optional: Sampling configuration
  sampling: {
    frameStatsInterval: 1,      // Collect stats every N frames
    snapshotInterval: 60,       // Take scene snapshot every N frames
    enableGpuTiming: true,      // Enable GPU timing (WebGL2)
    enableResourceTracking: true,
  },

  // Optional: Custom tags for filtering
  tags: {
    team: 'graphics',
    feature: 'player-character',
  },
});
```

### Overlay Configuration

The `bootstrapOverlay` function configures the UI:

```typescript
import { bootstrapOverlay } from '@3lens/overlay';

const overlay = bootstrapOverlay(probe, {
  // Position on screen
  position: 'bottom-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  // Theme
  theme: 'dark', // 'dark' | 'light' | 'auto'

  // Initial visibility
  visible: true,

  // Keyboard shortcut to toggle
  toggleShortcut: 'ctrl+shift+d',

  // Initial panel sizes
  defaultWidth: 400,
  defaultHeight: 600,
});
```

---

## Understanding the UI

### Panel Overview

The 3Lens overlay consists of several panels:

#### 📊 Overview Panel
Shows real-time metrics at a glance:
- FPS and frame time
- Draw calls and triangles
- GPU memory usage
- Active warnings and rule violations

#### 🌳 Scene Tree Panel
Displays your scene hierarchy:
- Expandable tree view of all objects
- Click to select objects
- Right-click for context menu
- Search and filter objects

#### 🔍 Inspector Panel
Shows details for selected objects:
- Transform properties (position, rotation, scale)
- Material properties with live editing
- Geometry information
- Visual overlay toggles (wireframe, bounding box, normals)

#### 🎨 Materials Panel
Lists all materials in the scene:
- Property values and textures
- Shader source viewer with syntax highlighting
- Live editing for colors, values, and toggles

#### 🖼️ Textures Panel
Shows all loaded textures:
- Thumbnails with size and format info
- Memory usage per texture
- Material usage tracking

#### ⚡ Performance Panel
Detailed performance analysis:
- Frame time chart with CPU/GPU breakdown
- Spike detection and highlighting
- Object cost analysis
- Resource lifecycle timeline

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle overlay visibility |
| `W` | Switch to Translate gizmo |
| `E` | Switch to Rotate gizmo |
| `R` | Switch to Scale gizmo |
| `Ctrl+Z` | Undo transform change |
| `Ctrl+Shift+Z` | Redo transform change |
| `Ctrl+K` | Open command palette |
| `Escape` | Clear selection |

### Inspect Mode

Enable Inspect Mode to click on objects directly in the 3D scene:

1. Click the crosshair icon in the toolbar (or press `I`)
2. Hover over objects to see highlighting
3. Click to select and inspect

---

## Next Steps

Now that you have 3Lens running, explore these guides:

- **[React Three Fiber Guide](./REACT-R3F-GUIDE.md)** - Integration with React and R3F
- **[Angular Guide](./ANGULAR-GUIDE.md)** - Angular service and directive usage
- **[Vue/TresJS Guide](./VUE-TRESJS-GUIDE.md)** - Vue composables and TresJS support
- **[Plugin Development Guide](./PLUGIN-DEVELOPMENT.md)** - Create custom plugins
- **[CI Integration Guide](./CI-INTEGRATION.md)** - Automated performance testing

### Common Tasks

#### Registering Logical Entities

Group related objects under logical names:

```typescript
import { registerLogicalEntity, addObjectToEntity } from '@3lens/core';

// Register a logical entity (e.g., a game character)
const entityId = registerLogicalEntity(probe, {
  name: 'Player Character',
  module: '@game/characters',
  tags: ['player', 'animated'],
  metadata: {
    health: 100,
    level: 5,
  },
});

// Associate Three.js objects with the entity
addObjectToEntity(probe, entityId, playerMesh);
addObjectToEntity(probe, entityId, playerSkeleton);
```

#### Custom Performance Rules

Define custom rules for your specific needs:

```typescript
const probe = createProbe({
  appName: 'My Game',
  rules: {
    maxDrawCalls: 200,
    custom: [
      {
        id: 'max-skinned-meshes',
        name: 'Skinned Mesh Limit',
        description: 'Warn when too many skinned meshes are active',
        evaluate: (stats, snapshot) => {
          const skinnedCount = snapshot?.nodes.filter(
            (n) => n.type === 'SkinnedMesh'
          ).length ?? 0;
          return {
            passed: skinnedCount <= 10,
            severity: skinnedCount > 15 ? 'error' : 'warning',
            message: `${skinnedCount} skinned meshes (max: 10)`,
            value: skinnedCount,
          };
        },
      },
    ],
  },
});
```

#### Programmatic Access

Access metrics and snapshots programmatically:

```typescript
// Subscribe to frame stats
const unsubscribe = probe.onFrameStats((stats) => {
  console.log(`FPS: ${stats.fps}, Draw Calls: ${stats.drawCalls}`);
  
  if (stats.frameTimeMs > 33.33) {
    console.warn('Frame time exceeded 30 FPS target');
  }
});

// Get current snapshot
const snapshot = probe.getSnapshot();
console.log(`Scene has ${snapshot.nodes.length} objects`);

// Select an object programmatically
probe.selectObjectByUuid(someObject.uuid);

// Later, clean up
unsubscribe();
```

---

## Troubleshooting

### Overlay Not Showing

1. Check that `bootstrapOverlay` is called after the DOM is ready
2. Verify the probe is connected to a renderer: `probe.observeRenderer(renderer)`
3. Try pressing `Ctrl+Shift+D` to toggle visibility

### No Frame Stats

1. Ensure `probe.observeRenderer(renderer)` is called before the render loop starts
2. Check that your render loop is actually running
3. Enable debug mode: `createProbe({ debug: true })`

### Selection Not Working

1. Provide the THREE reference: `probe.setThreeReference(THREE)`
2. Ensure `probe.observeScene(scene)` is called for all scenes
3. Check that Inspect Mode is enabled (crosshair icon)

### Performance Impact

3Lens is designed for development use. For production:

```typescript
// Disable in production
const probe = process.env.NODE_ENV !== 'production' 
  ? createProbe({ appName: 'My App' })
  : null;

if (probe) {
  probe.observeRenderer(renderer);
  probe.observeScene(scene);
}
```

---

## Getting Help

- **GitHub Issues**: [github.com/adriandarian/3Lens/issues](https://github.com/adriandarian/3Lens/issues)
- **Discussions**: [github.com/adriandarian/3Lens/discussions](https://github.com/adriandarian/3Lens/discussions)
- **API Reference**: [docs/API.md](../API.md)
