# WebGPU Features Example

Demonstrates 3Lens DevTools WebGPU-specific features including renderer detection, GPU timing, pipeline tracking, and device capabilities inspection.

## Features Demonstrated

### WebGPU Renderer Detection
- Automatic detection via `isWebGPURenderer()` helper
- Seamless adapter creation with `createWebGPUAdapter()`
- Auto-detection in `probe.observeRenderer()`

### GPU Timing with Timestamp Queries
- Per-frame GPU time measurement
- Pass-level timing breakdown
- Visual timing bar and breakdown chart

### Pipeline Tracking
- Render pipeline enumeration
- Compute pipeline tracking (when used)
- Pipeline usage statistics

### Device Capabilities
- Device limits and features via `getWebGPUCapabilities()`
- Supported features list
- Key limits display (textures, bind groups, compute workgroups)

### WebGPU-Specific Frame Stats
- `webgpuExtras` in FrameStats
- Pipeline count per frame
- Render pass information

## Requirements

**WebGPU is required to run this example.**

Supported browsers:
- Chrome 113+
- Edge 113+
- Firefox Nightly (with `dom.webgpu.enabled` flag)
- Safari Technology Preview (with WebGPU enabled)

## Running the Example

```bash
# From the repository root
cd examples/feature-showcase/webgpu-features
pnpm install
pnpm dev
```

## Key Code Concepts

### WebGPU Detection and Setup

```typescript
import { 
  DevtoolProbe,
  isWebGPURenderer,
  getWebGPUCapabilities,
  createWebGPUAdapter
} from '@3lens/core';

// Initialize WebGPU renderer
const { WebGPURenderer } = await import('three/webgpu');
const renderer = new WebGPURenderer({ antialias: true });
await renderer.init();

// Create probe - auto-detects WebGPU
const probe = new DevtoolProbe();
probe.observeRenderer(renderer);

// Or manually create WebGPU adapter
if (isWebGPURenderer(renderer)) {
  const adapter = createWebGPUAdapter(renderer);
  // Use adapter directly...
}
```

### Getting WebGPU Capabilities

```typescript
import { getWebGPUCapabilities } from '@3lens/core';

const capabilities = getWebGPUCapabilities(renderer);

if (capabilities) {
  console.log('Device:', capabilities.deviceLabel);
  console.log('Max Texture 2D:', capabilities.maxTextureDimension2D);
  console.log('Timestamp Query:', capabilities.hasTimestampQuery);
  console.log('Features:', capabilities.features);
}
```

### Accessing WebGPU-Specific Stats

```typescript
// Frame stats include WebGPU extras when using WebGPU
adapter.observeFrame((stats) => {
  if (stats.webgpuExtras) {
    console.log('Pipelines used:', stats.webgpuExtras.pipelinesUsed);
    console.log('Render passes:', stats.webgpuExtras.renderPasses);
    
    if (stats.webgpuExtras.gpuTiming) {
      console.log('GPU Time:', stats.webgpuExtras.gpuTiming.totalMs, 'ms');
      
      // Per-pass breakdown
      stats.webgpuExtras.gpuTiming.passes.forEach(pass => {
        console.log(`  ${pass.name}: ${pass.durationMs.toFixed(2)}ms`);
      });
    }
  }
});
```

### Extended WebGPU Adapter

```typescript
import { createExtendedWebGPUAdapter } from '@3lens/core';

// Extended adapter provides more detailed info
const extendedAdapter = createExtendedWebGPUAdapter(renderer);

// Get detailed pipeline info
const pipelines = extendedAdapter.getDetailedPipelines();
pipelines.forEach(pipeline => {
  console.log(`Pipeline: ${pipeline.label}`);
  console.log(`  Type: ${pipeline.type}`);
  console.log(`  Usage count: ${pipeline.usageCount}`);
  console.log(`  Bind groups: ${pipeline.bindGroupLayouts.length}`);
});

// Get bind group info
const bindGroups = extendedAdapter.getBindGroups();

// Get shader source (if available)
const shaderSource = extendedAdapter.getShaderSource(pipelines[0].id);

// Get WebGPU device directly
const device = extendedAdapter.getDevice();
```

## API Reference

### `isWebGPURenderer(renderer)`

Type guard to check if a renderer is a WebGPU renderer.

```typescript
function isWebGPURenderer(renderer: unknown): renderer is WebGPURenderer
```

### `createWebGPUAdapter(renderer)`

Creates a renderer adapter for WebGPU renderers.

```typescript
function createWebGPUAdapter(renderer: WebGPURenderer): RendererAdapter
```

### `createExtendedWebGPUAdapter(renderer)`

Creates an extended adapter with additional WebGPU-specific methods.

```typescript
function createExtendedWebGPUAdapter(renderer: WebGPURenderer): WebGPURendererAdapter
```

### `getWebGPUCapabilities(renderer)`

Gets device limits and feature support.

```typescript
function getWebGPUCapabilities(renderer: WebGPURenderer): WebGPUCapabilities | null

interface WebGPUCapabilities {
  deviceLabel: string;
  features: string[];
  maxTextureDimension2D: number;
  maxTextureArrayLayers: number;
  maxBindGroups: number;
  maxBindingsPerBindGroup: number;
  maxUniformBuffersPerShaderStage: number;
  maxStorageBuffersPerShaderStage: number;
  maxSampledTexturesPerShaderStage: number;
  maxSamplersPerShaderStage: number;
  maxVertexBuffers: number;
  maxVertexAttributes: number;
  maxComputeWorkgroupSizeX: number;
  maxComputeWorkgroupSizeY: number;
  maxComputeWorkgroupSizeZ: number;
  maxComputeInvocationsPerWorkgroup: number;
  maxComputeWorkgroupsPerDimension: number;
  hasTimestampQuery: boolean;
  // ... additional limits
}
```

### WebGPU Frame Stats Extension

```typescript
interface FrameStats {
  // ... standard stats ...
  
  webgpuExtras?: {
    pipelinesUsed: number;
    bindGroupsUsed: number;
    buffersUsed: number;
    computePasses: number;
    renderPasses: number;
    gpuTiming?: {
      totalMs: number;
      passes: Array<{
        name: string;
        durationMs: number;
        type?: GpuPassType;
      }>;
    };
  };
}
```

## UI Features

- **Real-time Metrics**: FPS, draw calls, triangles, pipelines, GPU memory
- **GPU Timing Chart**: Visual bar showing GPU time relative to 16.67ms budget
- **Pass Breakdown**: Color-coded timing for render, shadow, post-process passes
- **Pipeline List**: Active render/compute pipelines
- **Device Capabilities**: Key limits and supported features
- **Limits Table**: Full device limits reference

## Interactive Controls

- **Add More Objects**: Adds 10 new meshes to the scene
- **Pause/Resume Animation**: Toggle object rotation and camera orbit
- **Run Stress Test**: Temporarily adds 250 objects to test performance

## Fallback Behavior

If WebGPU is not available:
- Displays informative error message
- Shows browser requirements
- UI remains visible but non-functional

For production apps, consider implementing WebGL fallback:

```typescript
async function createRenderer() {
  if (await checkWebGPUSupport()) {
    const { WebGPURenderer } = await import('three/webgpu');
    return new WebGPURenderer();
  } else {
    return new THREE.WebGLRenderer();
  }
}
```

## Related Documentation

- [WebGPU Adapter Implementation](../../../docs/IMPLEMENTATION-NOTES.md#webgpu-adapter-implementation)
- [WebGPU Support Progress](../../../docs/PROGRESS.md#36-webgpu-support)
- [Three.js WebGPU Renderer](https://threejs.org/docs/?q=renderer#WebGPURenderer)
