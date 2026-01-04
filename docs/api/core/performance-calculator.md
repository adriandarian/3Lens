# Performance Calculator

The Performance Calculator module provides tools for tracking frame performance, calculating benchmark scores, and estimating resource memory usage.

## Overview

```typescript
import { 
  PerformanceTracker, 
  calculateBenchmarkScore,
  estimateTextureMemory,
  estimateGeometryMemory 
} from '@3lens/core';

// Track frame performance
const tracker = new PerformanceTracker({ historySize: 300 });
tracker.recordFrame(stats);

const metrics = tracker.getMetrics();
console.log(`FPS: ${metrics.fps}, P99: ${metrics.fps1PercentLow}`);

// Calculate benchmark score
const score = calculateBenchmarkScore(stats, config);
console.log(`Score: ${score.overall} (${score.grade})`);
```

## PerformanceTracker Class

Tracks frame statistics over time and calculates performance metrics.

```typescript
new PerformanceTracker(options?: PerformanceTrackerOptions)
```

### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `historySize` | `number` | 300 | Number of frames to keep |
| `smoothingFactor` | `number` | 0.1 | EMA smoothing factor (0-1) |
| `targetFps` | `number` | 60 | Target frame rate |

### Methods

#### recordFrame()

Record a new frame's statistics.

```typescript
recordFrame(stats: FrameStats): void
```

**Example:**

```typescript
const tracker = new PerformanceTracker({ historySize: 600 });

function onRender(renderer: THREE.WebGLRenderer) {
  const info = renderer.info;
  
  tracker.recordFrame({
    timestamp: performance.now(),
    frameTimeMs: deltaTime * 1000,
    drawCalls: info.render.calls,
    triangles: info.render.triangles,
    points: info.render.points,
    lines: info.render.lines,
    memory: {
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      geometryMemory: 0,
      textureMemory: 0,
      totalGpuMemory: 0,
    },
  });
}
```

#### getMetrics()

Get calculated performance metrics.

```typescript
getMetrics(): PerformanceMetrics
```

**Returns `PerformanceMetrics`:**

```typescript
interface PerformanceMetrics {
  /** Current FPS */
  fps: number;
  /** Smoothed FPS (EMA) */
  fpsSmoothed: number;
  /** Minimum FPS in history */
  fpsMin: number;
  /** Maximum FPS in history */
  fpsMax: number;
  /** 1% low FPS (worst percentile) */
  fps1PercentLow: number;
  /** Frame budget used (0-100+%) */
  frameBudgetUsed: number;
  /** Target frame time in ms */
  targetFrameTimeMs: number;
  /** Frame time variance */
  frameTimeVariance: number;
  /** Triangles per draw call */
  trianglesPerDrawCall: number;
  /** Triangles per object */
  trianglesPerObject: number;
  /** Draw call efficiency */
  drawCallEfficiency: number;
  /** Whether rendering is smooth */
  isSmooth: boolean;
  /** Number of dropped frames */
  droppedFrames: number;
}
```

#### getPercentile()

Get a specific percentile value from frame times.

```typescript
getPercentile(percentile: number): number
```

**Example:**

```typescript
const p50 = tracker.getPercentile(50);  // Median
const p95 = tracker.getPercentile(95);  // 95th percentile
const p99 = tracker.getPercentile(99);  // 99th percentile

console.log(`Frame times: ${p50.toFixed(2)}ms (median), ${p99.toFixed(2)}ms (p99)`);
```

#### getAverageFps()

Get average FPS over history.

```typescript
getAverageFps(): number
```

#### getVariance()

Get frame time variance (stability indicator).

```typescript
getVariance(): number
```

#### getHistory()

Get the frame history array.

```typescript
getHistory(): FrameStats[]
```

#### clear()

Clear all history.

```typescript
clear(): void
```

## calculateBenchmarkScore()

Calculate a comprehensive performance benchmark score.

```typescript
function calculateBenchmarkScore(
  stats: FrameStats,
  config?: Partial<BenchmarkConfig>
): BenchmarkScore
```

### BenchmarkConfig

```typescript
interface BenchmarkConfig {
  /** Target FPS for timing score */
  targetFps: number;              // default: 60
  /** Maximum acceptable draw calls */
  maxDrawCalls: number;           // default: 1000
  /** Maximum acceptable triangles */
  maxTriangles: number;           // default: 2_000_000
  /** Maximum GPU memory in bytes */
  maxGpuMemory: number;           // default: 512MB
  /** Score category weights */
  weights: {
    timing: number;       // default: 0.35
    drawCalls: number;    // default: 0.25
    geometry: number;     // default: 0.20
    memory: number;       // default: 0.12
    stateChanges: number; // default: 0.08
  };
}
```

### BenchmarkScore

```typescript
interface BenchmarkScore {
  /** Overall score (0-100) */
  overall: number;
  /** Score breakdown by category */
  breakdown: {
    timing: number;
    drawCalls: number;
    geometry: number;
    memory: number;
    stateChanges: number;
  };
  /** Letter grade */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  /** Top performance issues */
  topIssues: string[];
  /** Optimization suggestions */
  suggestions: string[];
}
```

### Grading Scale

| Score | Grade | Description |
|-------|-------|-------------|
| 90-100 | A | Excellent performance |
| 75-89 | B | Good performance |
| 60-74 | C | Acceptable performance |
| 40-59 | D | Poor performance |
| 0-39 | F | Critical performance issues |

### Example

```typescript
const score = calculateBenchmarkScore(frameStats, {
  targetFps: 60,
  maxDrawCalls: 500,
  maxTriangles: 1_000_000,
  weights: {
    timing: 0.40,      // Prioritize frame time
    drawCalls: 0.20,
    geometry: 0.20,
    memory: 0.15,
    stateChanges: 0.05,
  },
});

console.log(`
Performance Score: ${score.overall}/100 (${score.grade})

Breakdown:
  Timing:       ${score.breakdown.timing}
  Draw Calls:   ${score.breakdown.drawCalls}
  Geometry:     ${score.breakdown.geometry}
  Memory:       ${score.breakdown.memory}
  State Changes: ${score.breakdown.stateChanges}

Issues: ${score.topIssues.join(', ')}
Suggestions: ${score.suggestions.join(', ')}
`);
```

## Memory Estimation

### estimateTextureMemory()

Estimate GPU memory usage for a texture.

```typescript
function estimateTextureMemory(
  width: number,
  height: number,
  format?: string,
  mipmaps?: boolean
): number // bytes
```

**Supported Formats:**

| Format | Bytes/Pixel |
|--------|-------------|
| RGBA (default) | 4 |
| RGB | 3 |
| LUMINANCE/ALPHA | 1 |
| HALF_FLOAT/FLOAT16 | 8 |
| FLOAT | 16 |
| DXT1/BC1 | 0.5 |
| DXT5/BC3/BC7 | 1 |

**Example:**

```typescript
// 1024x1024 RGBA texture with mipmaps
const memory = estimateTextureMemory(1024, 1024, 'RGBA', true);
console.log(`Texture memory: ${(memory / 1024 / 1024).toFixed(2)} MB`);
// Output: ~5.33 MB (4MB base + 1.33MB mipmaps)

// 2048x2048 compressed texture
const compressedMemory = estimateTextureMemory(2048, 2048, 'BC7', true);
console.log(`Compressed: ${(compressedMemory / 1024 / 1024).toFixed(2)} MB`);
```

### estimateGeometryMemory()

Estimate GPU memory usage for geometry.

```typescript
function estimateGeometryMemory(
  vertexCount: number,
  indexCount: number,
  hasNormals?: boolean,    // default: true
  hasUVs?: boolean,        // default: true
  hasTangents?: boolean,   // default: false
  hasColors?: boolean      // default: false
): number // bytes
```

**Memory Per Vertex:**

| Attribute | Bytes |
|-----------|-------|
| Position | 12 (3 floats) |
| Normal | 12 (3 floats) |
| UV | 8 (2 floats) |
| Tangent | 16 (4 floats) |
| Color | 16 (4 floats) |

**Example:**

```typescript
// Standard mesh: 10K vertices, 30K indices
const meshMemory = estimateGeometryMemory(
  10000,  // vertices
  30000,  // indices
  true,   // normals
  true,   // UVs
  false,  // no tangents
  false   // no colors
);
console.log(`Mesh memory: ${(meshMemory / 1024).toFixed(1)} KB`);
// Output: ~380 KB

// High-detail mesh with all attributes
const detailedMemory = estimateGeometryMemory(
  50000,  // vertices
  150000, // indices
  true, true, true, true
);
console.log(`Detailed mesh: ${(detailedMemory / 1024 / 1024).toFixed(2)} MB`);
```

## Empty Stats Factories

Create default empty stat objects:

### createEmptyMemoryStats()

```typescript
function createEmptyMemoryStats(): MemoryStats

interface MemoryStats {
  geometries: number;
  textures: number;
  geometryMemory: number;
  textureMemory: number;
  totalGpuMemory: number;
  renderTargets: number;
  renderTargetMemory: number;
  programs: number;
  jsHeapSize?: number;
  jsHeapLimit?: number;
}
```

### createEmptyRenderingStats()

```typescript
function createEmptyRenderingStats(): RenderingStats

interface RenderingStats {
  shadowMapUpdates: number;
  shadowCastingLights: number;
  totalLights: number;
  activeLights: number;
  skinnedMeshes: number;
  totalBones: number;
  instancedDrawCalls: number;
  totalInstances: number;
  transparentObjects: number;
  transparentDrawCalls: number;
  renderTargetSwitches: number;
  programSwitches: number;
  textureBinds: number;
  bufferUploads: number;
  bytesUploaded: number;
  postProcessingPasses: number;
  xrActive: boolean;
  viewports: number;
}
```

### createEmptyPerformanceMetrics()

```typescript
function createEmptyPerformanceMetrics(): PerformanceMetrics
```

## Usage Examples

### Performance Dashboard

```typescript
const tracker = new PerformanceTracker({
  historySize: 600,      // 10 seconds at 60fps
  smoothingFactor: 0.1,
  targetFps: 60,
});

function updateDashboard() {
  const metrics = tracker.getMetrics();
  
  document.getElementById('fps').textContent = 
    `${metrics.fps.toFixed(0)} FPS`;
  document.getElementById('fps-smoothed').textContent = 
    `${metrics.fpsSmoothed.toFixed(1)} (smoothed)`;
  document.getElementById('fps-low').textContent = 
    `${metrics.fps1PercentLow.toFixed(0)} (1% low)`;
  document.getElementById('budget').textContent = 
    `${metrics.frameBudgetUsed.toFixed(0)}% budget`;
  document.getElementById('smooth').textContent = 
    metrics.isSmooth ? '✓ Smooth' : '⚠ Stuttering';
}
```

### Automatic Performance Tuning

```typescript
function autoTuneQuality(tracker: PerformanceTracker) {
  const metrics = tracker.getMetrics();
  
  // Degrade quality if struggling
  if (metrics.fps1PercentLow < 30) {
    setQualityLevel('low');
  } else if (metrics.fps1PercentLow < 45) {
    setQualityLevel('medium');
  } else if (metrics.fpsSmoothed > 58) {
    setQualityLevel('high');
  }
  
  // Reduce shadows if too many dropped frames
  if (metrics.droppedFrames > 5) {
    disableShadows();
  }
}
```

### Memory Budget Tracking

```typescript
function checkMemoryBudget(scene: THREE.Scene) {
  let totalTextureMemory = 0;
  let totalGeometryMemory = 0;
  
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const geo = obj.geometry;
      const posCount = geo.attributes.position?.count ?? 0;
      const indexCount = geo.index?.count ?? 0;
      
      totalGeometryMemory += estimateGeometryMemory(
        posCount,
        indexCount,
        !!geo.attributes.normal,
        !!geo.attributes.uv,
        !!geo.attributes.tangent,
        !!geo.attributes.color
      );
      
      if (obj.material instanceof THREE.MeshStandardMaterial) {
        const mat = obj.material;
        if (mat.map) {
          totalTextureMemory += estimateTextureMemory(
            mat.map.image?.width ?? 1024,
            mat.map.image?.height ?? 1024
          );
        }
      }
    }
  });
  
  const totalMB = (totalTextureMemory + totalGeometryMemory) / 1024 / 1024;
  console.log(`Estimated GPU memory: ${totalMB.toFixed(1)} MB`);
  
  if (totalMB > 500) {
    console.warn('Approaching GPU memory budget');
  }
}
```

### Benchmark Comparison

```typescript
async function compareScenes(scenes: THREE.Scene[]) {
  const results = [];
  
  for (const scene of scenes) {
    const tracker = new PerformanceTracker({ historySize: 300 });
    
    // Render for 5 seconds
    await benchmarkScene(scene, tracker, 5000);
    
    const metrics = tracker.getMetrics();
    const score = calculateBenchmarkScore(tracker.getHistory().pop()!);
    
    results.push({
      scene: scene.name,
      avgFps: metrics.fpsSmoothed,
      p99FrameTime: tracker.getPercentile(99),
      score: score.overall,
      grade: score.grade,
    });
  }
  
  // Sort by score
  results.sort((a, b) => b.score - a.score);
  
  console.table(results);
}
```

## See Also

- [WorkerProcessor](./worker-processor.md) - Offload calculations to workers
- [Memoization](./memoization.md) - Cache expensive computations
- [ObjectPool](./object-pool.md) - Reduce GC pressure
