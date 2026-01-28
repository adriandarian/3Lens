---
title: 3Lens API Documentation
description: Public API reference for integrating 3Lens into your three.js application
---

# 3Lens API Documentation

This guide covers the public API for integrating 3Lens into your three.js application.

## Table of Contents

- [Installation](#installation)
- [Core Package](#core-package-3lenscore)
  - [createProbe()](#createprobe)
  - [DevtoolProbe](#devtoolprobe)
  - [Frame Stats](#frame-stats)
  - [Scene Snapshots](#scene-snapshots)
- [Overlay Package](#overlay-package-3lensoverlay)
  - [createOverlay()](#createoverlay)
  - [bootstrapOverlay()](#bootstrapoverlay)
  - [ThreeLensOverlay](#threelensoverlay)
- [Types Reference](#types-reference)

---

## Installation

```bash
npm install @3lens/core @3lens/overlay
```

> **Note:** Packages are currently in alpha and not yet published to npm.

---

## Core Package (`@3lens/core`)

The core package provides the probe SDK that collects performance metrics and scene data from your three.js application.

### `createProbe()`

Factory function to create a DevtoolProbe instance.

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({
  appName: 'My Game',
  debug: false,
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 250_000,
    maxFrameTimeMs: 16.67,
  },
});
```

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `ProbeConfig` | Yes | Configuration object |

#### ProbeConfig

```typescript
interface ProbeConfig {
  /**
   * Application name for identification in DevTools
   */
  appName: string;

  /**
   * Environment identifier
   * @default 'development'
   */
  env?: 'development' | 'staging' | 'production' | string;

  /**
   * Enable verbose console logging
   * @default false
   */
  debug?: boolean;

  /**
   * Performance rules and thresholds
   */
  rules?: RulesConfig;

  /**
   * Sampling configuration
   */
  sampling?: SamplingConfig;

  /**
   * Custom tags for organization
   */
  tags?: Record<string, string>;
}
```

#### RulesConfig

```typescript
interface RulesConfig {
  /**
   * Maximum draw calls before warning
   */
  maxDrawCalls?: number;

  /**
   * Maximum triangles before warning
   */
  maxTriangles?: number;

  /**
   * Maximum frame time (ms) before warning
   * @example 16.67 for 60 FPS target
   */
  maxFrameTimeMs?: number;

  /**
   * Maximum textures before warning
   */
  maxTextures?: number;

  /**
   * Maximum total texture memory (bytes)
   */
  maxTextureMemory?: number;
}
```

---

### DevtoolProbe

The main probe class returned by `createProbe()`.

#### Observing Renderers

```typescript
// Observe a WebGL renderer (auto-wraps render calls)
probe.observeRenderer(renderer);

// For selection highlighting, provide the THREE reference
probe.setThreeReference(THREE);
```

#### Observing Scenes

```typescript
// Start observing a scene
probe.observeScene(scene);

// Stop observing
probe.unobserveScene(scene);

// Get all observed scenes
const scenes = probe.getObservedScenes();
```

#### Selection

```typescript
// Select an object programmatically
probe.selectObject(mesh);

// Clear selection
probe.selectObject(null);

// Get currently selected object
const selected = probe.getSelectedObject();

// Listen for selection changes
const unsubscribe = probe.onSelectionChanged((object, meta) => {
  if (object) {
    console.log(`Selected: ${object.name || object.type}`);
  }
});
```

#### Frame Stats

```typescript
// Get the latest frame statistics
const stats = probe.getLatestFrameStats();
console.log(`${stats.drawCalls} draw calls, ${stats.triangles} triangles`);

// Get history (last N frames)
const history = probe.getFrameStatsHistory(60); // Last 60 frames

// Subscribe to frame updates
const unsubscribe = probe.onFrameStats((stats) => {
  if (stats.violations?.length > 0) {
    console.warn('Performance violations:', stats.violations);
  }
});
```

#### Snapshots

```typescript
// Take a manual snapshot of all observed scenes
const snapshot = probe.takeSnapshot();

console.log(`Snapshot contains ${snapshot.scenes.length} scenes`);
```

#### Cleanup

```typescript
// Dispose of the probe and clean up all hooks
probe.dispose();
```

---

### Frame Stats

The `FrameStats` object contains per-frame performance metrics.

```typescript
interface FrameStats {
  frame: number;           // Frame number
  timestamp: number;       // Unix timestamp (ms)
  
  // Timing
  cpuTimeMs: number;       // CPU time for this frame
  gpuTimeMs?: number;      // GPU time (when available)
  
  // Rendering counts
  triangles: number;       // Total triangles rendered
  drawCalls: number;       // Number of draw calls
  points: number;          // Points rendered
  lines: number;           // Lines rendered
  
  // Object counts
  objectsVisible: number;  // Visible objects
  objectsTotal: number;    // Total objects in scene
  materialsUsed: number;   // Unique materials used
  
  // Backend info
  backend: 'webgl' | 'webgpu';
  
  // Rule violations (if any)
  violations?: RuleViolation[];
}
```

#### Rule Violations

```typescript
interface RuleViolation {
  ruleId: string;          // e.g., 'maxDrawCalls'
  message: string;         // Human-readable message
  severity: 'info' | 'warning' | 'error';
  value?: number;          // Current value
  threshold?: number;      // Configured threshold
}
```

---

### Scene Snapshots

Snapshots capture the current state of observed scenes.

```typescript
interface SceneSnapshot {
  snapshotId: string;      // Unique identifier
  timestamp: number;       // When snapshot was taken
  scenes: SceneNode[];     // Root scene nodes
}

interface SceneNode {
  ref: TrackedObjectRef;   // Object reference
  transform: TransformData;
  visible: boolean;
  children: SceneNode[];   // Nested children
  
  // Type-specific data
  meshData?: MeshNodeData;
  lightData?: LightNodeData;
  cameraData?: CameraNodeData;
}
```

---

## Overlay Package (`@3lens/overlay`)

The overlay package provides an in-app floating panel UI.

### `createOverlay()`

Creates and mounts the overlay UI.

```typescript
import { createOverlay } from '@3lens/overlay';

const overlay = createOverlay(probe, {
  position: 'right',
  collapsed: false,
});
```

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `probe` | `DevtoolProbe` | Yes | The probe instance |
| `options` | `OverlayOptions` | No | Configuration options |

#### OverlayOptions

```typescript
interface OverlayOptions {
  /**
   * Panel position
   * @default 'right'
   */
  position?: 'left' | 'right';

  /**
   * Start with panel collapsed
   * @default false
   */
  collapsed?: boolean;
}
```

---

### `bootstrapOverlay()`

One-call setup that creates both probe and overlay.

```typescript
import { bootstrapOverlay } from '@3lens/overlay';

const { probe, overlay } = bootstrapOverlay({
  renderer,
  scene,
  appName: 'My App',
  probeConfig: {
    rules: {
      maxDrawCalls: 500,
    },
  },
  overlay: {
    position: 'left',
  },
  three: THREE, // Optional: enables selection highlighting
});
```

#### BootstrapOptions

```typescript
interface OverlayBootstrapOptions {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  appName?: string;
  probeConfig?: Partial<ProbeConfig>;
  overlay?: Partial<OverlayOptions>;
  three?: typeof THREE;  // For selection highlighting
}
```

---

### ThreeLensOverlay

The overlay instance provides these methods:

```typescript
// Show the panel
overlay.show();

// Hide the panel
overlay.hide();

// Toggle visibility
overlay.toggle();

// Check if visible
const isVisible = overlay.isVisible;

// Completely remove from DOM
overlay.destroy();
```

---

## Types Reference

### TrackedObjectRef

Reference to a three.js object.

```typescript
interface TrackedObjectRef {
  debugId: string;         // Stable internal ID
  threeUuid: string;       // Object's three.js UUID
  type: string;            // Object type (e.g., 'Mesh', 'Group')
  name?: string;           // Object name (if set)
  path?: string;           // Scene path (e.g., '/Scene/Player/Mesh')
}
```

### TransformData

Object transform information.

```typescript
interface TransformData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; order: string };
  scale: { x: number; y: number; z: number };
}
```

### MeshNodeData

Mesh-specific data.

```typescript
interface MeshNodeData {
  geometryRef: string;     // Geometry reference ID
  materialRefs: string[];  // Material reference IDs
  vertexCount: number;
  faceCount: number;
  castShadow: boolean;
  receiveShadow: boolean;
}
```

### LightNodeData

Light-specific data.

```typescript
interface LightNodeData {
  lightType: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere' | 'rect';
  color: number;
  intensity: number;
  castShadow: boolean;
  distance?: number;       // For point/spot lights
  angle?: number;          // For spot lights
}
```

---

## Examples

### Basic Integration

```typescript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// Setup three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

// Add some objects
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.name = 'MyCube';
scene.add(cube);

// Setup 3Lens
const probe = createProbe({
  appName: 'Cube Demo',
  rules: {
    maxDrawCalls: 100,
    maxFrameTimeMs: 16.67,
  },
});

probe.setThreeReference(THREE);
probe.observeRenderer(renderer);
probe.observeScene(scene);

const overlay = createOverlay(probe);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

### Performance Monitoring

```typescript
// Log stats every second
setInterval(() => {
  const stats = probe.getLatestFrameStats();
  if (stats) {
    console.log(`FPS: ${Math.round(1000 / stats.cpuTimeMs)}`);
    console.log(`Draw calls: ${stats.drawCalls}`);
    console.log(`Triangles: ${stats.triangles.toLocaleString()}`);
  }
}, 1000);
```

### Conditional Loading (Production)

```typescript
// Only load in development
if (import.meta.env.DEV) {
  const { createProbe } = await import('@3lens/core');
  const { createOverlay } = await import('@3lens/overlay');
  
  const probe = createProbe({ appName: 'My App' });
  probe.observeRenderer(renderer);
  probe.observeScene(scene);
  createOverlay(probe);
}
```

---

## Troubleshooting

### Overlay Not Showing

1. Ensure the probe is connected to both renderer and scene
2. Check if `overlay.isVisible` is true
3. Look for CSS conflicts (z-index issues)

### No Stats Appearing

1. Verify `probe.observeRenderer()` was called
2. Check that rendering is happening (animation loop running)
3. Enable debug mode: `{ debug: true }`

### Performance Impact

3Lens is designed for minimal overhead (~1-3%). For production:

```typescript
// Skip 3Lens entirely in production
if (import.meta.env.PROD) {
  // Don't import or initialize 3Lens
}
```

---

## Next Steps

- [API Specification](./API-SPECIFICATION.md) — Full TypeScript interfaces
- [Architecture](./ARCHITECTURE.md) — System design details
- [Contributing](./CONTRIBUTING.md) — How to contribute

