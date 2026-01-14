# Vanilla Three.js Integration Guide

This guide covers integrating 3Lens with vanilla Three.js applications—no frameworks, just pure JavaScript/TypeScript and Three.js.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Complete Example](#complete-example)
- [Advanced Features](#advanced-features)
- [Transform Gizmos](#transform-gizmos)
- [Camera Controls](#camera-controls)
- [Multiple Scenes](#multiple-scenes)
- [Production Builds](#production-builds)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

Get up and running in under 2 minutes:

```typescript
// 1. Install dependencies
// npm install @3lens/core @3lens/overlay three

// 2. Import and set up
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

// 3. Create your scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. Set up 3Lens
const probe = createProbe({ appName: 'My App' });
probe.observeRenderer(renderer);
probe.observeScene(scene);
bootstrapOverlay(probe);

// 5. Press Ctrl+Shift+D to toggle the devtools overlay!
```

That's it! The overlay will appear showing FPS, draw calls, scene hierarchy, and more.

---

## Installation

Install the core package and overlay UI:

::: code-group

```bash [npm]
npm install @3lens/core @3lens/overlay three
```

```bash [pnpm]
pnpm add @3lens/core @3lens/overlay three
```

```bash [yarn]
yarn add @3lens/core @3lens/overlay three
```

```bash [bun]
bun add @3lens/core @3lens/overlay three
```

:::

---

## Basic Setup

### Step 1: Import 3Lens Packages

::: code-group

```typescript [TypeScript]
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
```

```javascript [JavaScript]
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
```

:::

### Step 2: Create Your Three.js Scene

```typescript
// Standard Three.js setup
const scene = new THREE.Scene();
scene.name = 'MainScene'; // Naming helps in the devtool

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.name = 'MainCamera';
camera.position.set(5, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
```

### Step 3: Create and Configure the Probe

```typescript
const probe = createProbe({
  appName: 'My Three.js App',
  // Optional configuration
  enabled: true,
  sampling: {
    frameInterval: 1,        // Sample every frame
    historyLength: 120,      // Keep 2 seconds of history at 60fps
  },
  thresholds: {
    maxDrawCalls: 200,       // Warn if draw calls exceed this
    maxTriangles: 1_000_000, // Warn if triangle count exceeds this
    minFPS: 30,              // Warn if FPS drops below this
  }
});

// Connect renderer and scene
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Set THREE reference for advanced features (optional but recommended)
probe.setThreeReference(THREE);
```

### Step 4: Bootstrap the Overlay

```typescript
// Create the visual devtools panel
bootstrapOverlay(probe);
```

### Step 5: Toggle the Panel

Press **`Ctrl+Shift+D`** (or **`Cmd+Shift+D`** on macOS) to toggle the devtools panel.

---

## Complete Example

Here's a complete vanilla Three.js setup with 3Lens:

```typescript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

// Create your three.js scene
const scene = new THREE.Scene();
scene.name = 'MainScene';

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.name = 'MainCamera';
camera.position.set(5, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Add objects
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
  name: 'CubeMaterial',
  color: 0x60a5fa,
  roughness: 0.3,
  metalness: 0.7,
});

const cube = new THREE.Mesh(geometry, material);
cube.name = 'AnimatedCube';
cube.castShadow = true;
cube.position.set(0, 0, 0);
scene.add(cube);

// 🔧 Set up 3Lens
const probe = createProbe({
  appName: 'Vanilla Three.js Example',
});
probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setThreeReference(THREE);
bootstrapOverlay(probe);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Your animation logic
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  
  // Render the scene
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

---

## Advanced Features

### Transform Gizmos

Enable interactive transform controls to manipulate objects directly in the scene:

```typescript
// Initialize transform gizmo (must be async)
await probe.initializeTransformGizmo(camera, renderer.domElement);

// Now you can select objects in the scene tree and use the gizmo
// to translate, rotate, and scale them interactively
```

### Camera Controls

Enable camera controller for viewport navigation:

```typescript
// Initialize camera controller
await probe.initializeCameraController(camera, renderer.domElement);

// This enables camera controls similar to OrbitControls
// You can navigate the scene directly from the devtools
```

### WebGPU Support

3Lens automatically detects WebGPU renderers:

```typescript
import { WebGPURenderer } from 'three/addons/renderers/WebGPURenderer.js';

const renderer = new WebGPURenderer();
// ... rest of setup

// 3Lens will automatically use the WebGPU adapter
probe.observeRenderer(renderer);
```

---

## Multiple Scenes

You can observe multiple scenes with a single probe:

```typescript
const mainScene = new THREE.Scene();
const uiScene = new THREE.Scene();
const backgroundScene = new THREE.Scene();

const probe = createProbe();
probe.observeRenderer(renderer);

// Observe all scenes
probe.observeScene(mainScene);
probe.observeScene(uiScene);
probe.observeScene(backgroundScene);

bootstrapOverlay(probe);
```

All scenes will appear in the scene hierarchy tree, organized by their names.

---

## Production Builds

For production, you should exclude 3Lens to reduce bundle size:

### Development-Only Setup

::: code-group

```typescript [TypeScript]
import * as THREE from 'three';

let probe: DevtoolProbe | null = null;

if (import.meta.env.DEV) {
  const { createProbe } = await import('@3lens/core');
  const { bootstrapOverlay } = await import('@3lens/overlay');
  
  probe = createProbe({ appName: 'My App' });
  probe.observeRenderer(renderer);
  probe.observeScene(scene);
  bootstrapOverlay(probe);
}
```

```javascript [JavaScript]
import * as THREE from 'three';

let probe = null;

if (import.meta.env.DEV) {
  const { createProbe } = await import('@3lens/core');
  const { bootstrapOverlay } = await import('@3lens/overlay');
  
  probe = createProbe({ appName: 'My App' });
  probe.observeRenderer(renderer);
  probe.observeScene(scene);
  bootstrapOverlay(probe);
}
```

:::

### Vite Configuration

If using Vite, you can use environment variables:

```typescript
if (import.meta.env.DEV) {
  // 3Lens setup
}
```

### Webpack Configuration

For Webpack, use `process.env.NODE_ENV`:

```typescript
if (process.env.NODE_ENV === 'development') {
  // 3Lens setup
}
```

---

## Best Practices

### 1. Name Your Objects

Setting `object.name` makes the scene tree much more readable:

```typescript
const cube = new THREE.Mesh(geometry, material);
cube.name = 'AnimatedCube'; // ✅ Good
scene.add(cube);

// vs

scene.add(new THREE.Mesh(geometry, material)); // ❌ Hard to identify
```

### 2. Name Materials and Geometries

Helps identify resources in the devtool panels:

```typescript
const material = new THREE.MeshStandardMaterial({
  name: 'CubeMaterial', // ✅ Good
  color: 0x60a5fa,
});

const geometry = new THREE.BoxGeometry(1, 1, 1);
geometry.name = 'CubeGeometry'; // ✅ Good
```

### 3. Share Geometries

Multiple meshes can share the same geometry instance to save memory:

```typescript
const sharedGeometry = new THREE.BoxGeometry(1, 1, 1);

const cube1 = new THREE.Mesh(sharedGeometry, material1);
const cube2 = new THREE.Mesh(sharedGeometry, material2);
const cube3 = new THREE.Mesh(sharedGeometry, material3);

// All three cubes share the same geometry instance
```

### 4. Set THREE Reference

Always call `probe.setThreeReference(THREE)` for advanced features:

```typescript
probe.setThreeReference(THREE);
```

This enables:
- Better type detection
- Advanced introspection features
- Material and shader inspection

### 5. Handle Window Resize

Make sure to update camera and renderer on resize:

```typescript
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

---

## Troubleshooting

### Panel doesn't appear

1. Make sure you called `bootstrapOverlay(probe)` after creating the probe
2. Check the browser console for errors
3. Try pressing `Ctrl+Shift+D` to toggle visibility
4. Ensure your renderer is initialized before calling `observeRenderer()`

### Performance impact

3Lens is designed to have minimal performance impact, but you can reduce it further:

```typescript
const probe = createProbe({
  sampling: {
    frameInterval: 2,    // Sample every other frame
    historyLength: 60,   // Reduce history buffer
  }
});
```

### Transform gizmo not working

Make sure you've initialized the gizmo:

```typescript
await probe.initializeTransformGizmo(camera, renderer.domElement);
```

The gizmo requires the camera and renderer DOM element to function properly.

### Objects not appearing in scene tree

- Ensure you've called `probe.observeScene(scene)` after adding objects
- Check that objects are actually added to the scene (`scene.add(object)`)
- Verify the scene is being rendered (`renderer.render(scene, camera)`)

### WebGPU not detected

If you're using WebGPU, make sure:

1. Your browser supports WebGPU
2. You're using `WebGPURenderer` from Three.js
3. The renderer is initialized before calling `observeRenderer()`

---

## Next Steps

Now that you have 3Lens set up with vanilla Three.js, explore these topics:

- [Scene Inspection](/guide/features/scene-inspection) - Navigate and understand your scene
- [Performance Debugging](/guide/features/performance) - Find and fix bottlenecks
- [Memory Profiling](/guide/features/memory) - Track and prevent memory leaks
- [Transform Gizmos](/guide/features/gizmos) - Interactive object manipulation
- [Material Editing](/guide/features/materials) - Live-edit materials and uniforms

## See Also

- [Live Example: Vanilla Three.js](/examples/live/framework-integration/vanilla-threejs) - Complete working example
- [Getting Started Guide](/guide/getting-started) - General setup instructions
- [Configuration Guide](/guide/advanced/configuration) - All configuration options
