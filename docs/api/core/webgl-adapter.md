# WebGL Adapter

The WebGL adapter provides comprehensive performance metrics and resource tracking for Three.js `WebGLRenderer`. It wraps the renderer to intercept render calls and collect detailed frame statistics with minimal overhead.

## Overview

```typescript
import { createWebGLAdapter, type WebGLAdapterOptions } from '@3lens/core';
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();

const adapter = createWebGLAdapter(renderer, {
  gpuTiming: true,
  resourceScanInterval: 2000,
});

// Use with probe
probe.setRendererAdapter(adapter);
```

::: tip Automatic Detection
When using `probe.observeRenderer()`, the WebGL adapter is automatically created. You only need to create adapters manually for advanced customization.
:::

## API Reference

### createWebGLAdapter

Creates a WebGL renderer adapter for performance monitoring.

```typescript
function createWebGLAdapter(
  renderer: THREE.WebGLRenderer,
  options?: WebGLAdapterOptions
): RendererAdapter
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `renderer` | `THREE.WebGLRenderer` | The WebGL renderer instance to monitor |
| `options` | `WebGLAdapterOptions` | Optional configuration |

**Returns:** `RendererAdapter` - Adapter interface for the probe

### WebGLAdapterOptions

```typescript
interface WebGLAdapterOptions {
  /**
   * Enable GPU timing via EXT_disjoint_timer_query
   * @default true
   */
  gpuTiming?: boolean;
  
  /**
   * Interval for resource scanning (ms)
   * @default 2000
   */
  resourceScanInterval?: number;
}
```

## Configuration Options

### gpuTiming

Enables GPU timing measurement using the `EXT_disjoint_timer_query_webgl2` extension.

```typescript
const adapter = createWebGLAdapter(renderer, {
  gpuTiming: true, // Default
});
```

::: warning Extension Support
GPU timing requires the `EXT_disjoint_timer_query_webgl2` extension. When unavailable, `gpuTimeMs` in frame stats will be `0` or `undefined`.
:::

### resourceScanInterval

Controls how often the adapter scans the scene for textures, geometries, and materials.

```typescript
const adapter = createWebGLAdapter(renderer, {
  resourceScanInterval: 2000, // Every 2 seconds (default)
});
```

Lower values provide more up-to-date resource information but increase overhead:

| Interval | Overhead | Use Case |
|----------|----------|----------|
| 500ms | Higher | Active debugging, resource tracking |
| 2000ms | Low | Normal monitoring (default) |
| 5000ms | Minimal | Production, static scenes |

## Collected Metrics

The WebGL adapter collects comprehensive frame statistics:

### Rendering Metrics

| Metric | Source | Description |
|--------|--------|-------------|
| `drawCalls` | `renderer.info.render.calls` | Draw calls this frame |
| `triangles` | `renderer.info.render.triangles` | Triangles rendered |
| `points` | `renderer.info.render.points` | Points rendered |
| `lines` | `renderer.info.render.lines` | Lines rendered |
| `vertices` | Scene analysis | Total vertices in scene |

### Timing Metrics

| Metric | Source | Description |
|--------|--------|-------------|
| `cpuTimeMs` | `performance.now()` | JavaScript render time |
| `gpuTimeMs` | Timer query extension | GPU execution time |
| `deltaTimeMs` | Frame timing | Time since last frame |
| `fps` | Running average | Frames per second |

### Memory Metrics

| Metric | Source | Description |
|--------|--------|-------------|
| `memory.geometries` | `renderer.info.memory` | Geometry count |
| `memory.textures` | `renderer.info.memory` | Texture count |
| `memory.geometryMemory` | Estimated | Geometry VRAM (bytes) |
| `memory.textureMemory` | Estimated | Texture VRAM (bytes) |
| `memory.programs` | `renderer.info.programs` | Shader program count |

### Scene Metrics

| Metric | Source | Description |
|--------|--------|-------------|
| `objectsVisible` | Scene traversal | Visible objects |
| `objectsTotal` | Scene traversal | Total objects |
| `rendering.lights` | Scene traversal | Active lights |
| `rendering.shadowLights` | Scene traversal | Shadow-casting lights |
| `rendering.skinnedMeshes` | Scene traversal | Skinned mesh count |
| `rendering.totalBones` | Scene traversal | Total skeleton bones |
| `rendering.instancedMeshes` | Scene traversal | Instanced mesh count |
| `rendering.transparentObjects` | Scene traversal | Transparent objects |

## GPU Timing

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ Frame Timeline with GPU Timing                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ CPU:  ├──JS Setup──┼──gl.draw*()──┼──JS Cleanup──┤         │
│                    │              │                         │
│ GPU:               ├──────────────┼──GPU Work──────────────┤│
│                    ↑              ↑                    ↑    │
│              Query Start     Query End           Result     │
│                                                   Ready     │
│                                                             │
│ EXT_disjoint_timer_query measures GPU execution time        │
└─────────────────────────────────────────────────────────────┘
```

### Extension Detection

```typescript
// The adapter automatically detects and uses the extension
const gl = renderer.getContext();
const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2') ||
            gl.getExtension('EXT_disjoint_timer_query');

if (ext) {
  // GPU timing available
}
```

### Browser Support

| Browser | WebGL 2 | Extension | GPU Timing |
|---------|---------|-----------|------------|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Safari | ✅ | ❌ | ❌ |
| Edge | ✅ | ✅ | ✅ |
| Mobile Chrome | ✅ | ⚠️ | Device-dependent |
| Mobile Safari | ✅ | ❌ | ❌ |

::: info Asynchronous Readback
GPU timing results are available on the next frame due to asynchronous query readback. This avoids GPU pipeline stalls.
:::

## Resource Tracking

### Texture Information

```typescript
interface TextureInfo {
  uuid: string;
  name: string;
  type: string;
  format: number;
  width: number;
  height: number;
  mipmaps: number;
  estimatedMemory: number;
  encoding?: number;
  wrapS?: number;
  wrapT?: number;
  magFilter?: number;
  minFilter?: number;
}
```

### Geometry Information

```typescript
interface GeometryInfo {
  uuid: string;
  name: string;
  type: string;
  vertices: number;
  faces: number;
  attributes: string[];
  estimatedMemory: number;
  boundingSphere?: { radius: number };
  index?: { count: number };
}
```

### Material Information

```typescript
interface MaterialInfo {
  uuid: string;
  name: string;
  type: string;
  transparent: boolean;
  side: number;
  depthTest: boolean;
  depthWrite: boolean;
  blending: number;
  uniforms?: Record<string, unknown>;
}
```

## Memory Estimation

The adapter estimates GPU memory usage for geometries and textures:

### Geometry Memory

```typescript
// Estimation formula
const geometryMemory = 
  positionAttribute.count * positionAttribute.itemSize * bytesPerElement +
  normalAttribute?.count * normalAttribute?.itemSize * bytesPerElement +
  uvAttribute?.count * uvAttribute?.itemSize * bytesPerElement +
  indexAttribute?.count * bytesPerElement;
```

### Texture Memory

```typescript
// Estimation formula (with mipmaps)
const textureMemory = width * height * bytesPerPixel * 
  (hasMipmaps ? 1.33 : 1.0);
```

## Performance Considerations

### Minimal Overhead Mode

When no frame callbacks are registered, the adapter performs no instrumentation:

```typescript
renderer.render = function (scene, camera) {
  if (frameCallbacks.length === 0) {
    // Direct passthrough - zero overhead
    originalRender(scene, camera);
    return;
  }
  // ... instrumentation code
};
```

### Lazy Scene Analysis

Scene analysis only runs once and is cached:

```typescript
// First frame: full analysis
if (!cachedSceneAnalysis) {
  cachedSceneAnalysis = analyzeSceneLight(scene);
}

// Subsequent frames: use cache
// Resource scan happens periodically, not every frame
```

### Performance Impact

| Feature | Overhead | Notes |
|---------|----------|-------|
| Frame wrapping | ~0.01ms | Minimal timing overhead |
| Renderer info read | ~0ms | Just property access |
| Scene analysis (initial) | ~0.5-5ms | Once, then cached |
| Resource scan | ~1-5ms | Every `resourceScanInterval` |
| GPU timing query | ~0.02ms | May cause minor sync |

## RendererAdapter Interface

The adapter implements the `RendererAdapter` interface:

```typescript
interface RendererAdapter {
  kind: 'webgl' | 'webgpu';
  
  observeFrame(callback: (stats: FrameStats) => void): Unsubscribe;
  
  getRenderTargets(): RenderTargetInfo[];
  getTextures(): TextureInfo[];
  getGeometries(): GeometryInfo[];
  getMaterials(): MaterialInfo[];
  getPrograms(): ProgramInfo[];
  
  getGpuTimings(): Promise<GpuTimingInfo>;
  
  dispose(): void;
}
```

## Usage Examples

### Basic Usage

```typescript
import { createWebGLAdapter } from '@3lens/core';
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: true });
const adapter = createWebGLAdapter(renderer);

// Subscribe to frame stats
const unsubscribe = adapter.observeFrame((stats) => {
  console.log(`Draw calls: ${stats.drawCalls}`);
  console.log(`Triangles: ${stats.triangles}`);
  console.log(`CPU time: ${stats.cpuTimeMs.toFixed(2)}ms`);
  if (stats.gpuTimeMs) {
    console.log(`GPU time: ${stats.gpuTimeMs.toFixed(2)}ms`);
  }
});

// Later: cleanup
unsubscribe();
adapter.dispose();
```

### Resource Inspection

```typescript
const adapter = createWebGLAdapter(renderer);

// After a few frames (to populate cache)
const textures = adapter.getTextures();
const geometries = adapter.getGeometries();
const materials = adapter.getMaterials();

console.log(`Textures: ${textures.length}`);
console.log(`Total texture memory: ${textures.reduce((sum, t) => sum + t.estimatedMemory, 0)} bytes`);

console.log(`Geometries: ${geometries.length}`);
console.log(`Total geometry memory: ${geometries.reduce((sum, g) => sum + g.estimatedMemory, 0)} bytes`);
```

### Disable GPU Timing

```typescript
// For browsers without extension support or to reduce overhead
const adapter = createWebGLAdapter(renderer, {
  gpuTiming: false,
});
```

### Custom Resource Scan Interval

```typescript
// Fast scanning for active debugging
const devAdapter = createWebGLAdapter(renderer, {
  resourceScanInterval: 500,
});

// Slow scanning for production
const prodAdapter = createWebGLAdapter(renderer, {
  resourceScanInterval: 10000,
});
```

## Cleanup

Always dispose the adapter when done:

```typescript
// Proper cleanup
adapter.dispose();

// This restores the original render method
// and clears all callbacks and caches
```

## Type Imports

```typescript
import {
  createWebGLAdapter,
  type WebGLAdapterOptions,
  type RendererAdapter,
  type FrameStats,
  type TextureInfo,
  type GeometryInfo,
  type MaterialInfo,
  type ProgramInfo,
} from '@3lens/core';
```

## Related

- [WebGPU Adapter](./webgpu-adapter) - WebGPU renderer adapter
- [GPU Timing](./gpu-timing) - GPU timing details
- [observeRenderer()](./observe-renderer) - High-level renderer observation
- [FrameStats](./frame-stats) - Frame statistics interface
