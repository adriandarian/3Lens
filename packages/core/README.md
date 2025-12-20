# @3lens/core

Core probe SDK for 3Lens — the definitive developer toolkit for three.js.

## Installation

```bash
npm install @3lens/core
```

> **Note:** Currently in alpha, not yet published to npm.

## Usage

```typescript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();

// Create probe with performance rules
const probe = createProbe({
  appName: 'My App',
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 250_000,
    maxFrameTimeMs: 16.67,
  },
});

// Start observing
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Enable selection highlighting (optional)
probe.setThreeReference(THREE);
```

## API

### `createProbe(config: ProbeConfig): DevtoolProbe`

Creates a new probe instance.

### `DevtoolProbe`

| Method | Description |
|--------|-------------|
| `observeRenderer(renderer)` | Observe a WebGL/WebGPU renderer |
| `observeScene(scene)` | Start observing a scene |
| `unobserveScene(scene)` | Stop observing a scene |
| `getObservedScenes()` | Get all observed scenes |
| `selectObject(obj)` | Select an object (or null to deselect) |
| `getSelectedObject()` | Get the currently selected object |
| `onSelectionChanged(callback)` | Subscribe to selection changes |
| `getLatestFrameStats()` | Get the latest frame statistics |
| `getFrameStatsHistory(count?)` | Get frame stats history |
| `onFrameStats(callback)` | Subscribe to frame stats updates |
| `takeSnapshot()` | Take a manual scene snapshot |
| `setThreeReference(THREE)` | Provide THREE for selection helpers |
| `dispose()` | Clean up and disconnect |

### `FrameStats`

```typescript
interface FrameStats {
  frame: number;
  timestamp: number;
  cpuTimeMs: number;
  triangles: number;
  drawCalls: number;
  objectsVisible: number;
  objectsTotal: number;
  violations?: RuleViolation[];
}
```

## Configuration

```typescript
interface ProbeConfig {
  appName: string;
  env?: 'development' | 'staging' | 'production';
  debug?: boolean;
  rules?: {
    maxDrawCalls?: number;
    maxTriangles?: number;
    maxFrameTimeMs?: number;
    maxTextures?: number;
  };
}
```

## License

MIT

