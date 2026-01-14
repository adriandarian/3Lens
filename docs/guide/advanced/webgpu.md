# WebGPU Debugging Guide

This guide covers WebGPU-specific debugging features in 3Lens, including compute shader inspection, buffer analysis, and WebGPU-specific performance profiling.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [WebGPU Detection](#webgpu-detection)
- [Compute Shader Debugging](#compute-shader-debugging)
- [Buffer Inspection](#buffer-inspection)
- [Pipeline Analysis](#pipeline-analysis)
- [GPU Timing](#gpu-timing)
- [Bind Group Debugging](#bind-group-debugging)
- [Command Encoder Tracking](#command-encoder-tracking)
- [Migration from WebGL](#migration-from-webgl)
- [Common Issues](#common-issues)

---

## Overview

3Lens provides WebGPU-specific debugging capabilities:

- **Compute shader inspection** - View and debug compute shaders
- **Buffer visualization** - Inspect GPU buffer contents
- **Pipeline analysis** - Examine render and compute pipelines
- **GPU timing** - Precise performance measurements
- **Bind group debugging** - Track resource bindings
- **Command encoder tracking** - Monitor GPU command submission

### Prerequisites

- Browser with WebGPU support (Chrome 113+, Firefox Nightly, Safari 17+)
- Three.js with WebGPURenderer
- 3Lens v1.0.0+

---

## Quick Start

Enable WebGPU debugging with Three.js WebGPURenderer:

```typescript
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { createProbe } from '@3lens/core';

// Create WebGPU renderer
const renderer = new WebGPURenderer({ antialias: true });
await renderer.init();

// Create probe with WebGPU adapter
const probe = createProbe({
  appName: 'My WebGPU App',
  renderer,
  adapter: 'webgpu', // Auto-detected, but can be explicit
  webgpu: {
    trackComputeShaders: true,
    trackBuffers: true,
    enableGpuTiming: true,
  },
});

// Now all WebGPU features are available
```

---

## WebGPU Detection

### Automatic Detection

3Lens automatically detects WebGPU renderers:

```typescript
const probe = createProbe({
  appName: 'My App',
  renderer, // WebGPURenderer or WebGLRenderer
});

// Check which adapter is active
console.log(probe.getAdapterType()); // 'webgpu' or 'webgl'
```

### Feature Detection

```typescript
// Check WebGPU availability
if (probe.isWebGPU()) {
  // WebGPU-specific features available
  const timing = probe.getGPUTiming();
  const computeStats = probe.getComputeStats();
}

// Check specific capabilities
const caps = probe.getCapabilities();
console.log(caps.maxBufferSize);
console.log(caps.maxComputeWorkgroupSize);
console.log(caps.maxBindGroups);
```

---

## Compute Shader Debugging

### Viewing Compute Shaders

```
┌────────────────────────────────────────────────┐
│ 🔧 Compute Shader: particleUpdate              │
├────────────────────────────────────────────────┤
│  1│ @group(0) @binding(0)                      │
│  2│ var<storage, read_write> particles:        │
│  3│   array<Particle>;                         │
│  4│                                            │
│  5│ @group(0) @binding(1)                      │
│  6│ var<uniform> params: SimParams;            │
│  7│                                            │
│  8│ @compute @workgroup_size(64)               │
│  9│ fn main(@builtin(global_invocation_id)     │
│ 10│         gid: vec3u) {                      │
│ 11│   let idx = gid.x;                         │
│ 12│   if (idx >= arrayLength(&particles)) {    │
│ 13│     return;                                │
│ 14│   }                                        │
│ 15│   // Update particle...                    │
├────────────────────────────────────────────────┤
│ Workgroups: 1024 × 1 × 1                       │
│ Total Invocations: 65,536                      │
│ Execution Time: 0.42ms                         │
└────────────────────────────────────────────────┘
```

### Compute Shader Statistics

```typescript
const computeStats = probe.getComputeStats();

console.log(computeStats.shaderCount);        // Number of compute shaders
console.log(computeStats.totalDispatches);    // Dispatches this frame
console.log(computeStats.totalInvocations);   // Total thread invocations
console.log(computeStats.averageTime);        // Average compute time
```

### Debugging Compute Issues

```typescript
// Enable compute shader validation
probe.setWebGPUOptions({
  validateComputeShaders: true,
  logDispatchCalls: true,
});

// Listen for compute errors
probe.onComputeError((error) => {
  console.error('Compute error:', error.shader, error.message);
  console.error('Workgroup:', error.workgroup);
});
```

---

## Buffer Inspection

### Viewing GPU Buffers

```
┌─────────────────────────────────────────┐
│ 📦 GPU Buffers                          │
├─────────────────────────────────────────┤
│ ▼ particleBuffer                        │
│   Size: 4.0 MB                          │
│   Usage: STORAGE | COPY_DST             │
│   Mapped: No                            │
│                                         │
│   [View Data] [Download] [Compare]      │
├─────────────────────────────────────────┤
│ ▼ uniformBuffer                         │
│   Size: 256 bytes                       │
│   Usage: UNIFORM | COPY_DST             │
│   Mapped: No                            │
│                                         │
│   Contents:                             │
│   time: 3.14159                         │
│   deltaTime: 0.0167                     │
│   particleCount: 65536                  │
└─────────────────────────────────────────┘
```

### Buffer Data Visualization

```typescript
// Get buffer info
const buffers = probe.getBufferInfo();

buffers.forEach(buffer => {
  console.log(buffer.label);
  console.log(buffer.size);
  console.log(buffer.usage);
  console.log(buffer.mappedAtCreation);
});

// Read buffer contents (async)
const data = await probe.readBuffer('particleBuffer');
console.log(new Float32Array(data));
```

### Buffer Memory Analysis

```typescript
const memoryInfo = probe.getWebGPUMemory();

console.log(memoryInfo.totalBufferMemory);
console.log(memoryInfo.totalTextureMemory);
console.log(memoryInfo.bufferCount);
console.log(memoryInfo.largestBuffer);

// Find memory-heavy buffers
const sorted = memoryInfo.buffers.sort((a, b) => b.size - a.size);
console.log('Largest buffers:', sorted.slice(0, 5));
```

---

## Pipeline Analysis

### Render Pipeline Inspection

```
┌─────────────────────────────────────────────┐
│ 🔗 Render Pipeline: standardMaterial        │
├─────────────────────────────────────────────┤
│ Vertex Stage:                               │
│   Module: standardVertex                    │
│   Entry: vs_main                            │
│   Buffers: 3                                │
│     [0] position: float32x3, stride: 12    │
│     [1] normal: float32x3, stride: 12      │
│     [2] uv: float32x2, stride: 8           │
├─────────────────────────────────────────────┤
│ Fragment Stage:                             │
│   Module: standardFragment                  │
│   Entry: fs_main                            │
│   Targets: 1                                │
│     [0] format: bgra8unorm, blend: alpha   │
├─────────────────────────────────────────────┤
│ Primitive:                                  │
│   Topology: triangle-list                   │
│   Cull Mode: back                           │
│   Front Face: ccw                           │
├─────────────────────────────────────────────┤
│ Depth/Stencil:                              │
│   Format: depth24plus                       │
│   Depth Compare: less                       │
│   Depth Write: true                         │
└─────────────────────────────────────────────┘
```

### Pipeline Statistics

```typescript
const pipelineStats = probe.getPipelineStats();

console.log(pipelineStats.renderPipelineCount);
console.log(pipelineStats.computePipelineCount);
console.log(pipelineStats.pipelineCacheHits);
console.log(pipelineStats.pipelineCacheMisses);
```

### Pipeline Caching Analysis

```typescript
// Monitor pipeline creation
probe.onPipelineCreated((pipeline) => {
  console.log(`New pipeline: ${pipeline.label}`);
  console.log(`Cache status: ${pipeline.cacheHit ? 'HIT' : 'MISS'}`);
  console.log(`Creation time: ${pipeline.creationTime}ms`);
});

// Get cache statistics
const cacheStats = probe.getPipelineCacheStats();
console.log(`Cache hit rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);
```

---

## GPU Timing

### Enabling GPU Timing

```typescript
const probe = createProbe({
  appName: 'My App',
  renderer,
  webgpu: {
    enableGpuTiming: true,
    timestampQueries: true,
  },
});
```

### Reading Timing Data

```typescript
const timing = probe.getGPUTiming();

console.log(timing.renderPassTime);    // Render pass duration
console.log(timing.computePassTime);   // Compute pass duration
console.log(timing.totalGpuTime);      // Total GPU time

// Per-pass breakdown
timing.passes.forEach(pass => {
  console.log(`${pass.label}: ${pass.duration.toFixed(2)}ms`);
});
```

### Timing Visualization

```
┌────────────────────────────────────────────────┐
│ ⏱️ GPU Timing                                  │
├────────────────────────────────────────────────┤
│ Frame GPU Time: 8.45ms                         │
│                                                │
│ Pass Breakdown:                                │
│ ├─ Shadow Pass      ████░░░░░░ 1.2ms (14%)    │
│ ├─ G-Buffer Pass    ██████░░░░ 2.8ms (33%)    │
│ ├─ Lighting Pass    █████░░░░░ 2.1ms (25%)    │
│ ├─ Post Process     ████░░░░░░ 1.8ms (21%)    │
│ └─ UI Pass          ██░░░░░░░░ 0.55ms (7%)    │
│                                                │
│ Compute Work:                                  │
│ ├─ Particle Update  ███░░░░░░░ 0.42ms         │
│ └─ Culling          █░░░░░░░░░ 0.18ms         │
└────────────────────────────────────────────────┘
```

### Custom Timing Markers

```typescript
// Add custom timing regions
probe.beginTimingRegion('myExpensiveOperation');
// ... expensive work
probe.endTimingRegion('myExpensiveOperation');

// Read custom timing
const customTiming = probe.getTimingRegion('myExpensiveOperation');
console.log(`Custom region: ${customTiming.duration}ms`);
```

---

## Bind Group Debugging

### Viewing Bind Groups

```
┌─────────────────────────────────────────────┐
│ 🔗 Bind Groups                              │
├─────────────────────────────────────────────┤
│ ▼ Group 0: Scene Uniforms                   │
│   [0] uniformBuffer - 256 bytes             │
│       viewMatrix, projectionMatrix          │
│   [1] lightBuffer - 1024 bytes              │
│       8 lights                              │
├─────────────────────────────────────────────┤
│ ▼ Group 1: Material                         │
│   [0] materialUniforms - 64 bytes           │
│       color, metalness, roughness           │
│   [1] diffuseTexture - 2048x2048 rgba8      │
│   [2] normalTexture - 2048x2048 rgba8       │
│   [3] sampler - linear, repeat              │
└─────────────────────────────────────────────┘
```

### Bind Group Analysis

```typescript
const bindGroups = probe.getBindGroupInfo();

bindGroups.forEach(group => {
  console.log(`Group ${group.index}: ${group.label}`);
  
  group.entries.forEach(entry => {
    console.log(`  [${entry.binding}] ${entry.resourceType}`);
    if (entry.buffer) {
      console.log(`    Size: ${entry.buffer.size}`);
    }
    if (entry.texture) {
      console.log(`    Format: ${entry.texture.format}`);
    }
  });
});
```

---

## Command Encoder Tracking

### Viewing Commands

```typescript
// Enable command tracking
probe.setWebGPUOptions({
  trackCommands: true,
  commandHistorySize: 100,
});

// Get command history
const commands = probe.getCommandHistory();

commands.forEach(cmd => {
  console.log(`${cmd.type}: ${cmd.label}`);
  console.log(`  Time: ${cmd.timestamp}`);
  console.log(`  Details:`, cmd.details);
});
```

### Command Timeline

```
┌────────────────────────────────────────────────┐
│ 📋 Command Timeline                            │
├────────────────────────────────────────────────┤
│ 0.00ms │ beginRenderPass (Shadow)              │
│ 0.12ms │   draw (12 calls, 45K triangles)      │
│ 1.20ms │ endRenderPass                         │
│ 1.21ms │ beginRenderPass (Main)                │
│ 1.24ms │   setBindGroup (0)                    │
│ 1.25ms │   draw (156 calls, 1.2M triangles)    │
│ 4.05ms │ endRenderPass                         │
│ 4.06ms │ beginComputePass (Particles)          │
│ 4.07ms │   dispatch (1024, 1, 1)               │
│ 4.48ms │ endComputePass                        │
│ 4.49ms │ copyBufferToTexture                   │
│ 4.52ms │ submit                                │
└────────────────────────────────────────────────┘
```

---

## Migration from WebGL

### Comparing WebGL vs WebGPU Stats

```
┌────────────────────────────────────────────────┐
│ 📊 WebGL vs WebGPU Comparison                  │
├────────────────────────────────────────────────┤
│                   │ WebGL    │ WebGPU          │
│───────────────────┼──────────┼─────────────────│
│ Draw Calls        │ 156      │ 42 (batched)    │
│ State Changes     │ 1,240    │ 186             │
│ Frame Time        │ 12.4ms   │ 8.2ms           │
│ GPU Memory        │ 245MB    │ 198MB           │
│ Shader Compile    │ 340ms    │ 89ms (cached)   │
└────────────────────────────────────────────────┘
```

### Migration Checklist

```typescript
// Check migration readiness
const migration = probe.getWebGPUMigrationReport();

console.log('Migration Report:');
console.log(`  Compatible: ${migration.compatible}`);
console.log(`  Issues: ${migration.issues.length}`);

migration.issues.forEach(issue => {
  console.log(`  - ${issue.severity}: ${issue.message}`);
  console.log(`    Fix: ${issue.suggestion}`);
});

// Common issues:
// - WebGL extensions not available in WebGPU
// - Different texture format support
// - Shader language differences (GLSL → WGSL)
```

### WebGPU Readiness Check

```typescript
async function checkWebGPUReadiness() {
  if (!navigator.gpu) {
    console.log('WebGPU not supported in this browser');
    return false;
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.log('No WebGPU adapter available');
    return false;
  }

  const device = await adapter.requestDevice();
  
  // Log capabilities
  console.log('Max texture size:', device.limits.maxTextureDimension2D);
  console.log('Max buffer size:', device.limits.maxBufferSize);
  console.log('Max compute workgroup size:', device.limits.maxComputeWorkgroupSizeX);

  return true;
}
```

---

## Common Issues

### 1. Buffer Size Limits

```typescript
// ❌ Bad - Exceeds WebGPU limits
const buffer = device.createBuffer({
  size: 2 * 1024 * 1024 * 1024, // 2GB - too large!
  usage: GPUBufferUsage.STORAGE,
});

// ✅ Good - Check limits first
const maxSize = device.limits.maxBufferSize;
if (requestedSize > maxSize) {
  console.warn(`Buffer too large. Max: ${maxSize}, requested: ${requestedSize}`);
}
```

### 2. Workgroup Size Issues

```typescript
// ❌ Bad - Assumes workgroup size
@compute @workgroup_size(256) // May exceed device limits

// ✅ Good - Check device limits
const maxWorkgroupSize = device.limits.maxComputeWorkgroupSizeX;
console.log(`Max workgroup size: ${maxWorkgroupSize}`);
```

### 3. Texture Format Compatibility

```typescript
// Check supported formats
const features = adapter.features;

if (!features.has('texture-compression-bc')) {
  console.warn('BC compression not supported');
}

// Use fallback format
const format = features.has('texture-compression-bc') 
  ? 'bc3-rgba-unorm' 
  : 'rgba8unorm';
```

### 4. Timestamp Query Availability

```typescript
// Timestamp queries may not be available
const features = device.features;

if (!features.has('timestamp-query')) {
  console.warn('GPU timing not available');
  probe.setWebGPUOptions({ enableGpuTiming: false });
}
```

### 5. Shader Compilation Errors

```typescript
// Enable shader validation
probe.onShaderError((error) => {
  console.error('WGSL Error:', error.message);
  console.error('Line:', error.line);
  console.error('Source:', error.source);
});

// Common WGSL issues:
// - Missing @group/@binding decorators
// - Type mismatches (f32 vs i32)
// - Missing storage class qualifiers
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G` | Toggle GPU timing overlay |
| `B` | Show buffer inspector |
| `P` | Show pipeline inspector |
| `C` | Show compute shader panel |
| `Shift+G` | Compare WebGL vs WebGPU |

---

## Related Guides

- [Shader Debugging Guide](./SHADER-DEBUGGING-GUIDE.md)
- [Performance Debugging Guide](./PERFORMANCE-DEBUGGING-GUIDE.md)
- [Memory Profiling Guide](./MEMORY-PROFILING-GUIDE.md)

## API Reference

- [WebGPU Adapter](/api/core/webgpu-adapter)
- [WebGPU Timing Manager](/api/core/webgpu-timing)
- [GPU Timing](/api/core/gpu-timing)
