# WebGPU Adapter

The WebGPU adapter provides performance metrics and resource tracking for Three.js `WebGPURenderer`. It supports WebGPU-specific features including timestamp queries for accurate GPU timing and pipeline tracking.

## Overview

```typescript
import { createWebGPUAdapter, isWebGPURenderer } from '@3lens/core';
import { WebGPURenderer } from 'three/webgpu';

const renderer = new WebGPURenderer();
await renderer.init();

if (isWebGPURenderer(renderer)) {
  const adapter = createWebGPUAdapter(renderer);
  probe.setRendererAdapter(adapter);
}
```

::: tip Automatic Detection
When using `probe.observeRenderer()`, the WebGPU adapter is automatically created if the renderer has `isWebGPURenderer: true`. Manual creation is only needed for advanced customization.
:::

## API Reference

### createWebGPUAdapter

Creates a WebGPU renderer adapter for performance monitoring.

```typescript
function createWebGPUAdapter(renderer: WebGPURenderer): RendererAdapter
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `renderer` | `WebGPURenderer` | The WebGPU renderer instance to monitor |

**Returns:** `RendererAdapter` - Adapter interface for the probe

### createExtendedWebGPUAdapter

Creates an extended adapter with additional WebGPU-specific features.

```typescript
function createExtendedWebGPUAdapter(
  renderer: WebGPURenderer,
  options?: WebGPUAdapterOptions
): ExtendedWebGPUAdapter
```

### isWebGPURenderer

Type guard to check if a renderer is a WebGPU renderer.

```typescript
function isWebGPURenderer(renderer: unknown): renderer is WebGPURenderer
```

**Example:**

```typescript
import { isWebGPURenderer } from '@3lens/core';

function setupAdapter(renderer: THREE.Renderer) {
  if (isWebGPURenderer(renderer)) {
    // TypeScript knows this is WebGPURenderer
    return createWebGPUAdapter(renderer);
  } else {
    return createWebGLAdapter(renderer as THREE.WebGLRenderer);
  }
}
```

### getWebGPUCapabilities

Query WebGPU device capabilities.

```typescript
function getWebGPUCapabilities(renderer: WebGPURenderer): WebGPUCapabilities
```

**Returns:**

```typescript
interface WebGPUCapabilities {
  maxTextureDimension2D: number;
  maxTextureArrayLayers: number;
  maxBindGroups: number;
  maxBufferSize: number;
  maxComputeWorkgroupsPerDimension: number;
  hasTimestampQuery: boolean;
  hasShaderF16: boolean;
  hasDepth32FloatStencil8: boolean;
  // ... additional capabilities
}
```

## WebGPURenderer Interface

The adapter expects a Three.js WebGPURenderer with these properties:

```typescript
interface WebGPURenderer extends THREE.Renderer {
  readonly isWebGPURenderer: true;
  readonly info: WebGPURendererInfo;
  readonly backend?: WebGPUBackend;
  
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  renderAsync?(scene: THREE.Scene, camera: THREE.Camera): Promise<void>;
  compute?(computeNodes: unknown): Promise<void>;
  computeAsync?(computeNodes: unknown): Promise<void>;
  
  setSize(width: number, height: number, updateStyle?: boolean): void;
  dispose(): void;
}
```

## Collected Metrics

The WebGPU adapter collects all standard metrics plus WebGPU-specific data:

### Standard Metrics

| Metric | Description |
|--------|-------------|
| `drawCalls` | Draw calls per frame |
| `triangles` | Triangles rendered |
| `cpuTimeMs` | JavaScript execution time |
| `gpuTimeMs` | GPU execution time (if timestamp queries available) |
| `memory.*` | Memory statistics |
| `rendering.*` | Rendering statistics |

### WebGPU-Specific Metrics

```typescript
interface FrameStats {
  // ... standard metrics ...
  
  webgpuExtras?: {
    pipelinesUsed: number;       // Render/compute pipelines
    bindGroupsUsed: number;      // Bind group count
    buffersUsed: number;         // GPU buffers
    computePasses: number;       // Compute pass count
    renderPasses: number;        // Render pass count
    gpuTiming?: {                // Detailed GPU timing
      totalMs: number;
      passes: Array<{
        name: string;
        durationMs: number;
      }>;
      breakdown: Record<string, number>;
    };
  };
}
```

## GPU Timing with Timestamp Queries

### Feature Detection

```typescript
// Check if timestamp queries are available
const device = renderer.backend?.device;
const hasTimestampQuery = device?.features.has('timestamp-query') ?? false;

if (hasTimestampQuery) {
  console.log('GPU timing available with timestamp queries');
}
```

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ WebGPU Timestamp Query Timeline                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Command Encoder:                                            │
│   ├── writeTimestamp(querySet, 0)  ← Start                  │
│   ├── beginRenderPass()                                     │
│   │   └── draw commands...                                  │
│   ├── endRenderPass()                                       │
│   ├── writeTimestamp(querySet, 1)  ← End                    │
│   ├── resolveQuerySet()                                     │
│   └── copyBufferToBuffer(resolve → read)                    │
│                                                             │
│ GPU executes, then CPU reads timestamps asynchronously      │
└─────────────────────────────────────────────────────────────┘
```

### Per-Pass Timing

```typescript
// Access detailed timing breakdown
probe.onFrameStats((stats) => {
  if (stats.webgpuExtras?.gpuTiming) {
    const timing = stats.webgpuExtras.gpuTiming;
    
    console.log(`Total GPU: ${timing.totalMs.toFixed(2)}ms`);
    
    for (const pass of timing.passes) {
      console.log(`  ${pass.name}: ${pass.durationMs.toFixed(2)}ms`);
    }
    
    // Breakdown by pass type
    console.log('Breakdown:', timing.breakdown);
    // { render: 8.5, shadow: 2.1, postprocess: 1.2 }
  }
});
```

## Async Rendering Support

WebGPU supports asynchronous rendering via `renderAsync()`:

```typescript
// Sync render (still works)
renderer.render(scene, camera);

// Async render (WebGPU-specific)
await renderer.renderAsync(scene, camera);
```

The adapter automatically wraps both methods:

```typescript
// Both are instrumented
renderer.render = function (scene, camera) {
  // ... collect stats synchronously
};

renderer.renderAsync = async function (scene, camera) {
  // ... collect stats asynchronously
};
```

## Pipeline Tracking

### PipelineInfo Interface

```typescript
interface PipelineInfo {
  id: string;
  type: 'render' | 'compute';
  label?: string;
  vertexShader?: string;
  fragmentShader?: string;
  computeShader?: string;
  layout?: string;
  primitive?: {
    topology: GPUPrimitiveTopology;
    stripIndexFormat?: GPUIndexFormat;
  };
  depthStencil?: {
    format: GPUTextureFormat;
    depthWriteEnabled: boolean;
    depthCompare: GPUCompareFunction;
  };
}
```

### Querying Pipelines

```typescript
const adapter = createWebGPUAdapter(renderer);

// Get all pipelines used in rendering
const pipelines = adapter.getPipelines();

console.log(`Total pipelines: ${pipelines.length}`);
pipelines.forEach((p) => {
  console.log(`${p.type} pipeline: ${p.label || p.id}`);
});
```

## Compute Shader Support

The adapter can track compute shader usage:

```typescript
// Compute passes are tracked in webgpuExtras
probe.onFrameStats((stats) => {
  if (stats.webgpuExtras) {
    console.log(`Compute passes: ${stats.webgpuExtras.computePasses}`);
  }
});
```

## Browser Support

| Browser | WebGPU | Timestamp Queries |
|---------|--------|-------------------|
| Chrome 113+ | ✅ | ✅ |
| Edge 113+ | ✅ | ✅ |
| Firefox Nightly | ⚠️ | ⚠️ |
| Safari 17+ | ✅ | ⚠️ (partial) |
| Mobile Chrome | ❌ | ❌ |
| Mobile Safari | ❌ | ❌ |

::: warning WebGPU Availability
WebGPU is not yet available on all platforms. Always provide a WebGL fallback:

```typescript
let renderer;
if (navigator.gpu) {
  renderer = new WebGPURenderer();
  await renderer.init();
} else {
  renderer = new THREE.WebGLRenderer();
}
```
:::

## Usage Examples

### Basic Setup

```typescript
import { WebGPURenderer } from 'three/webgpu';
import { createProbe, createWebGPUAdapter, isWebGPURenderer } from '@3lens/core';

async function init() {
  const renderer = new WebGPURenderer();
  await renderer.init();

  const probe = createProbe({ appName: 'WebGPU Demo' });

  if (isWebGPURenderer(renderer)) {
    const adapter = createWebGPUAdapter(renderer);
    probe.setRendererAdapter(adapter);
  }

  probe.observeScene(scene);

  // Frame loop
  function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
```

### With Automatic Detection

```typescript
// Simpler - probe auto-detects WebGPU
const probe = createProbe({ appName: 'WebGPU Demo' });
probe.observeRenderer(renderer); // Automatically creates WebGPU adapter
probe.observeScene(scene);
```

### Monitoring GPU Performance

```typescript
probe.onFrameStats((stats) => {
  // Standard metrics
  console.log(`Draw calls: ${stats.drawCalls}`);
  console.log(`CPU time: ${stats.cpuTimeMs.toFixed(2)}ms`);

  // GPU timing (WebGPU with timestamp queries)
  if (stats.gpuTimeMs !== undefined) {
    console.log(`GPU time: ${stats.gpuTimeMs.toFixed(2)}ms`);
  }

  // WebGPU-specific
  if (stats.webgpuExtras) {
    const extras = stats.webgpuExtras;
    console.log(`Pipelines: ${extras.pipelinesUsed}`);
    console.log(`Render passes: ${extras.renderPasses}`);
    console.log(`Compute passes: ${extras.computePasses}`);
  }
});
```

### Checking Capabilities

```typescript
import { getWebGPUCapabilities, isWebGPURenderer } from '@3lens/core';

if (isWebGPURenderer(renderer)) {
  const caps = getWebGPUCapabilities(renderer);

  console.log('WebGPU Capabilities:');
  console.log(`  Max texture size: ${caps.maxTextureDimension2D}`);
  console.log(`  Timestamp queries: ${caps.hasTimestampQuery}`);
  console.log(`  Shader F16: ${caps.hasShaderF16}`);
}
```

## Comparison: WebGL vs WebGPU Adapter

| Feature | WebGL Adapter | WebGPU Adapter |
|---------|---------------|----------------|
| Draw calls | ✅ | ✅ |
| Triangle count | ✅ | ✅ |
| CPU timing | ✅ | ✅ |
| GPU timing | ⚠️ Extension | ✅ Timestamp queries |
| Resource tracking | ✅ | ✅ |
| Pipeline tracking | Programs only | ✅ Full pipelines |
| Compute support | ❌ | ✅ |
| Async render | ❌ | ✅ |
| Per-pass breakdown | ❌ | ✅ |

## Type Imports

```typescript
import {
  createWebGPUAdapter,
  createExtendedWebGPUAdapter,
  isWebGPURenderer,
  getWebGPUCapabilities,
  type WebGPUAdapterOptions,
  type WebGPUCapabilities,
  type PipelineInfo,
  type RendererAdapter,
  type FrameStats,
} from '@3lens/core';
```

## Related

- [WebGL Adapter](./webgl-adapter) - WebGL renderer adapter
- [WebGPU Timing Manager](./webgpu-timing) - Detailed timing implementation
- [Renderer Auto-Detection](./renderer-detection) - How detection works
- [observeRenderer()](./observe-renderer) - High-level renderer observation
