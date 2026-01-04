# FrameStats Interface

The `FrameStats` interface is the core type for per-frame performance data collected by the probe. It contains comprehensive metrics about rendering performance, memory usage, and scene complexity.

## Overview

```typescript
import type { FrameStats } from '@3lens/core';

// Access frame stats from the probe
probe.on('frame', (stats: FrameStats) => {
  console.log(`Frame ${stats.frame}: ${stats.drawCalls} draw calls, ${stats.triangles} triangles`);
  console.log(`FPS: ${stats.performance.fps.toFixed(1)}`);
});
```

## Interface Definition

```typescript
interface FrameStats {
  // Frame identification
  frame: number;
  timestamp: number;
  deltaTimeMs: number;
  
  // Timing
  cpuTimeMs: number;
  gpuTimeMs?: number;
  
  // Geometry metrics
  triangles: number;
  drawCalls: number;
  points: number;
  lines: number;
  vertices: number;
  
  // Object metrics
  objectsVisible: number;
  objectsTotal: number;
  objectsCulled: number;
  materialsUsed: number;
  
  // Nested stats
  memory: MemoryStats;
  performance: PerformanceMetrics;
  rendering: RenderingStats;
  
  // Backend info
  backend: RendererKind;
  webglExtras?: WebGLFrameExtras;
  webgpuExtras?: WebGPUFrameExtras;
  
  // Analysis
  violations?: RuleViolation[];
  benchmarkScore?: BenchmarkScore;
}
```

## Properties

### Frame Identification

| Property | Type | Description |
|----------|------|-------------|
| `frame` | `number` | Monotonically increasing frame number |
| `timestamp` | `number` | `performance.now()` timestamp |
| `deltaTimeMs` | `number` | Time since last frame in milliseconds |

### Timing Metrics

| Property | Type | Description |
|----------|------|-------------|
| `cpuTimeMs` | `number` | CPU time spent in render call (ms) |
| `gpuTimeMs` | `number?` | GPU frame time from timer queries (if available) |

### Geometry Metrics

| Property | Type | Description |
|----------|------|-------------|
| `triangles` | `number` | Total triangles rendered this frame |
| `drawCalls` | `number` | Total draw calls this frame |
| `points` | `number` | Total points rendered |
| `lines` | `number` | Total lines rendered |
| `vertices` | `number` | Total vertices processed |

### Object Metrics

| Property | Type | Description |
|----------|------|-------------|
| `objectsVisible` | `number` | Objects rendered (passed frustum culling) |
| `objectsTotal` | `number` | Total objects in scene |
| `objectsCulled` | `number` | Objects culled by frustum culling |
| `materialsUsed` | `number` | Unique materials used this frame |

### Nested Statistics

| Property | Type | Description |
|----------|------|-------------|
| `memory` | `MemoryStats` | Memory usage statistics |
| `performance` | `PerformanceMetrics` | Derived performance metrics |
| `rendering` | `RenderingStats` | Detailed rendering statistics |

### Backend Information

| Property | Type | Description |
|----------|------|-------------|
| `backend` | `RendererKind` | `'webgl'` or `'webgpu'` |
| `webglExtras` | `WebGLFrameExtras?` | WebGL-specific stats |
| `webgpuExtras` | `WebGPUFrameExtras?` | WebGPU-specific stats |

### Analysis Data

| Property | Type | Description |
|----------|------|-------------|
| `violations` | `RuleViolation[]?` | Active rule violations |
| `benchmarkScore` | `BenchmarkScore?` | Performance benchmark score |

## MemoryStats

```typescript
interface MemoryStats {
  geometries: number;        // Geometries in memory
  textures: number;          // Textures in memory
  geometryMemory: number;    // Geometry memory (bytes)
  textureMemory: number;     // Texture memory (bytes)
  totalGpuMemory: number;    // Total GPU memory (bytes)
  renderTargets: number;     // Render target count
  renderTargetMemory: number; // RT memory (bytes)
  programs: number;          // Active shader programs
  jsHeapSize?: number;       // JS heap size (if available)
  jsHeapLimit?: number;      // JS heap limit (if available)
}
```

## PerformanceMetrics

```typescript
interface PerformanceMetrics {
  fps: number;               // Instantaneous FPS
  fpsSmoothed: number;       // Rolling average FPS
  fpsMin: number;            // Minimum FPS in history
  fpsMax: number;            // Maximum FPS in history
  fps1PercentLow: number;    // 1% low FPS (worst frames)
  frameBudgetUsed: number;   // Budget usage (0-100%)
  targetFrameTimeMs: number; // Target frame time (default: 16.67ms)
  frameTimeVariance: number; // Frame time jitter (ms)
  trianglesPerDrawCall: number; // Batching efficiency
  trianglesPerObject: number;   // Avg triangles per object
  drawCallEfficiency: number;   // Efficiency score (0-100)
  isSmooth: boolean;         // Above target FPS
  droppedFrames: number;     // Consecutive dropped frames
}
```

## RenderingStats

```typescript
interface RenderingStats {
  // Shadow rendering
  shadowMapUpdates: number;
  shadowCastingLights: number;
  
  // Lights
  totalLights: number;
  activeLights: number;
  
  // Skinned meshes
  skinnedMeshes: number;
  totalBones: number;
  
  // Instancing
  instancedDrawCalls: number;
  totalInstances: number;
  
  // Transparency
  transparentObjects: number;
  transparentDrawCalls: number;
  
  // State changes
  renderTargetSwitches: number;
  programSwitches: number;
  textureBinds: number;
  
  // Uploads
  bufferUploads: number;
  bytesUploaded: number;
  
  // Post-processing
  postProcessingPasses: number;
  
  // XR
  xrActive: boolean;
  viewports: number;
}
```

## WebGLFrameExtras

Additional statistics for WebGL renderer:

```typescript
interface WebGLFrameExtras {
  programSwitches: number;
  textureBindings: number;
  geometryCount: number;
  textureCount: number;
  programs: number;
  contextAttributes?: {
    antialias: boolean;
    alpha: boolean;
    depth: boolean;
    stencil: boolean;
    preserveDrawingBuffer: boolean;
    powerPreference: string;
  };
  activeExtensions?: string[];
  maxTextureSize?: number;
  maxVertexUniforms?: number;
  maxFragmentUniforms?: number;
  maxVaryings?: number;
  maxTextureUnits?: number;
}
```

## WebGPUFrameExtras

Additional statistics for WebGPU renderer:

```typescript
interface WebGPUFrameExtras {
  pipelinesUsed: number;
  bindGroupsUsed: number;
  buffersUsed: number;
  computePasses?: number;
  renderPasses?: number;
  gpuTiming?: WebGPUDetailedTiming;
  adapterInfo?: {
    vendor: string;
    architecture: string;
    device: string;
    description: string;
  };
}

interface WebGPUDetailedTiming {
  totalMs: number;
  passes: WebGPUPassTiming[];
  breakdown: Record<string, number>;
}
```

## Usage Examples

### Real-time Performance Monitoring

```typescript
probe.on('frame', (stats: FrameStats) => {
  // Update dashboard
  updateFPS(stats.performance.fps);
  updateDrawCalls(stats.drawCalls);
  updateTriangles(stats.triangles);
  updateMemory(stats.memory.totalGpuMemory);
  
  // Check for issues
  if (!stats.performance.isSmooth) {
    console.warn(`Frame ${stats.frame}: Performance degradation detected`);
  }
  
  if (stats.violations && stats.violations.length > 0) {
    stats.violations.forEach(v => {
      console.warn(`[${v.severity}] ${v.message}`);
    });
  }
});
```

### Performance Analysis

```typescript
const frameHistory: FrameStats[] = [];

probe.on('frame', (stats) => {
  frameHistory.push(stats);
  
  // Keep last 5 seconds at 60fps
  if (frameHistory.length > 300) {
    frameHistory.shift();
  }
});

function analyzePerformance() {
  const avgFps = frameHistory.reduce((sum, s) => sum + s.performance.fps, 0) / frameHistory.length;
  const avgDrawCalls = frameHistory.reduce((sum, s) => sum + s.drawCalls, 0) / frameHistory.length;
  const maxTriangles = Math.max(...frameHistory.map(s => s.triangles));
  
  console.log(`Average FPS: ${avgFps.toFixed(1)}`);
  console.log(`Average Draw Calls: ${avgDrawCalls.toFixed(0)}`);
  console.log(`Peak Triangles: ${maxTriangles.toLocaleString()}`);
}
```

### Conditional Recording

```typescript
const problemFrames: FrameStats[] = [];

probe.on('frame', (stats) => {
  // Record frames with issues
  if (stats.performance.fps < 30 || 
      stats.drawCalls > 500 || 
      stats.violations?.length) {
    problemFrames.push(structuredClone(stats));
  }
});
```

### Memory Leak Detection

```typescript
let lastMemory = 0;
let growthCount = 0;

probe.on('frame', (stats) => {
  const currentMemory = stats.memory.totalGpuMemory;
  
  if (currentMemory > lastMemory) {
    growthCount++;
    if (growthCount > 60) { // Sustained growth for 60 frames
      console.warn('Potential memory leak detected');
      console.log(`Geometries: ${stats.memory.geometries}`);
      console.log(`Textures: ${stats.memory.textures}`);
      console.log(`Total GPU: ${(currentMemory / 1024 / 1024).toFixed(1)} MB`);
    }
  } else {
    growthCount = 0;
  }
  
  lastMemory = currentMemory;
});
```

## See Also

- [PerformanceTracker](./performance-tracker.md) - Track frame history
- [BenchmarkScore](./benchmark-score.md) - Performance scoring
- [RuleViolation](./rule-violations.md) - Rule violation handling
- [MemoryStats](./memory-tracking.md) - Memory tracking details
