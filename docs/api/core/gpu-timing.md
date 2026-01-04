# GPU Timing System

GPU timing provides accurate measurements of time spent on the GPU, separate from CPU/JavaScript execution time. 3Lens supports GPU timing through different mechanisms for WebGL and WebGPU renderers.

## Overview

CPU timing only measures JavaScript execution, not the actual time the GPU spends processing commands. GPU timing captures the real rendering cost:

```
┌──────────────────────────────────────────────────────────────────┐
│ Frame Timeline                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ CPU: ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  (2ms JS execution)  │
│      │                                                           │
│      └─ submits commands to GPU                                  │
│                                                                  │
│ GPU: ░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░  (8ms GPU work)      │
│                                                                  │
│ Without GPU timing, you only see the 2ms, missing the 8ms!       │
└──────────────────────────────────────────────────────────────────┘
```

## WebGL: EXT_disjoint_timer_query

### Extension Overview

The `EXT_disjoint_timer_query_webgl2` (WebGL 2) and `EXT_disjoint_timer_query` (WebGL 1) extensions enable GPU time measurement:

```typescript
// Check extension availability
const gl = renderer.getContext();
const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2')
         || gl.getExtension('EXT_disjoint_timer_query');

if (ext) {
  console.log('GPU timing available');
}
```

### How It Works

```typescript
// 1. Create a query object
const query = gl.createQuery();

// 2. Begin timing before render
gl.beginQuery(ext.TIME_ELAPSED_EXT, query);

// 3. Render your scene
renderer.render(scene, camera);

// 4. End timing after render
gl.endQuery(ext.TIME_ELAPSED_EXT);

// 5. Check results on NEXT frame (async!)
const available = gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE);
const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);

if (available && !disjoint) {
  const nanoseconds = gl.getQueryParameter(query, gl.QUERY_RESULT);
  const milliseconds = nanoseconds / 1_000_000;
  console.log(`GPU time: ${milliseconds.toFixed(2)}ms`);
}

// 6. Clean up
gl.deleteQuery(query);
```

### Key Concepts

#### Asynchronous Results

GPU timing results are not immediately available. They must be queried on a subsequent frame:

```
Frame N:     beginQuery → render → endQuery
Frame N+1:   getQueryParameter → result available
```

3Lens handles this automatically by maintaining a pending query and reading results from the previous frame.

#### Disjoint Flag

The `GPU_DISJOINT_EXT` flag indicates if timing was interrupted (e.g., by power management, thermal throttling):

```typescript
const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);
if (disjoint) {
  // Timing result is unreliable, discard it
  console.warn('GPU timing disjoint, result discarded');
}
```

### 3Lens Implementation

The WebGL adapter automatically handles GPU timing:

```typescript
import { createWebGLAdapter } from '@3lens/core';

// GPU timing enabled by default
const adapter = createWebGLAdapter(renderer, {
  gpuTiming: true  // default
});

// Access in frame stats
probe.onFrameStats((stats) => {
  if (stats.gpuTimeMs !== undefined) {
    console.log(`GPU: ${stats.gpuTimeMs.toFixed(2)}ms`);
  }
});
```

### Disabling GPU Timing

GPU timing adds a small overhead. Disable it if not needed:

```typescript
const adapter = createWebGLAdapter(renderer, {
  gpuTiming: false
});
```

## WebGPU: Timestamp Queries

### Feature Overview

WebGPU uses the `timestamp-query` feature for GPU timing:

```typescript
// Check feature availability
const device = renderer.backend?.device;
const hasTimestamp = device?.features.has('timestamp-query') ?? false;
```

### How It Works

WebGPU timestamp queries write GPU timestamps at specific points:

```typescript
// Create query set for timestamps
const querySet = device.createQuerySet({
  type: 'timestamp',
  count: 2  // Start and end
});

// Create buffer to resolve results
const resolveBuffer = device.createBuffer({
  size: 16,  // 2 x 8 bytes (BigInt64)
  usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
});

// In command encoder:
encoder.writeTimestamp(querySet, 0);  // Start time
// ... render pass ...
encoder.writeTimestamp(querySet, 1);  // End time

// Resolve and read
encoder.resolveQuerySet(querySet, 0, 2, resolveBuffer, 0);
```

### Per-Pass Timing

WebGPU enables granular timing for individual passes:

```typescript
// Example: Multiple passes with individual timing
encoder.writeTimestamp(querySet, 0);  // Start shadow
// ... shadow pass ...
encoder.writeTimestamp(querySet, 1);  // End shadow / Start main
// ... main render pass ...
encoder.writeTimestamp(querySet, 2);  // End main / Start post
// ... post-processing ...
encoder.writeTimestamp(querySet, 3);  // End post

// Results give timing for each pass:
// Shadow:  timestamps[1] - timestamps[0]
// Main:    timestamps[2] - timestamps[1]
// Post:    timestamps[3] - timestamps[2]
```

See [WebGPU Timing Manager](./webgpu-timing) for detailed implementation.

## Browser Support

### WebGL GPU Timing

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ | Full support |
| Firefox | ✅ | Full support |
| Safari | ⚠️ | May be disabled |
| Edge | ✅ | Full support |
| Mobile Chrome | ⚠️ | Limited |
| Mobile Safari | ❌ | Not supported |

::: warning Safari Limitations
Safari may disable `EXT_disjoint_timer_query` for privacy/fingerprinting reasons. Always handle the case where GPU timing is unavailable.
:::

### WebGPU Timestamp Queries

| Browser | WebGPU | Timestamps |
|---------|--------|------------|
| Chrome 113+ | ✅ | ✅ |
| Edge 113+ | ✅ | ✅ |
| Firefox Nightly | ⚠️ | ⚠️ |
| Safari 17+ | ✅ | ⚠️ |

## GpuTimingInfo Interface

```typescript
interface GpuTimingInfo {
  /** Whether GPU timing is supported */
  supported: boolean;
  
  /** GPU time in milliseconds (undefined if not supported) */
  gpuTimeMs?: number;
  
  /** Per-pass timing breakdown (WebGPU only) */
  passes?: Array<{
    name: string;
    durationMs: number;
  }>;
  
  /** Whether last measurement was disjoint/invalid */
  disjoint?: boolean;
}
```

## Usage Examples

### Basic GPU Timing

```typescript
const probe = createProbe({ appName: 'My App' });
probe.observeRenderer(renderer);
probe.observeScene(scene);

probe.onFrameStats((stats) => {
  const cpu = stats.cpuTimeMs.toFixed(2);
  const gpu = stats.gpuTimeMs?.toFixed(2) ?? 'N/A';
  
  console.log(`CPU: ${cpu}ms, GPU: ${gpu}ms`);
});
```

### Detecting GPU Bottlenecks

```typescript
probe.onFrameStats((stats) => {
  if (stats.gpuTimeMs !== undefined) {
    const cpuBound = stats.cpuTimeMs > stats.gpuTimeMs;
    const gpuBound = stats.gpuTimeMs > stats.cpuTimeMs;
    
    if (gpuBound && stats.gpuTimeMs > 16) {
      console.warn('GPU bottleneck detected!');
      // Consider: reduce geometry, lower texture resolution,
      // simplify shaders, reduce overdraw
    }
    
    if (cpuBound && stats.cpuTimeMs > 16) {
      console.warn('CPU bottleneck detected!');
      // Consider: optimize JS code, reduce draw calls,
      // use instancing, frustum culling
    }
  }
});
```

### Graceful Degradation

```typescript
probe.onFrameStats((stats) => {
  // Always show CPU time
  ui.setCpuTime(stats.cpuTimeMs);
  
  // Conditionally show GPU time
  if (stats.gpuTimeMs !== undefined) {
    ui.setGpuTime(stats.gpuTimeMs);
    ui.showGpuPanel(true);
  } else {
    ui.showGpuPanel(false);
    ui.setTooltip('GPU timing not available in this browser');
  }
});
```

### Performance Thresholds with GPU Time

```typescript
const probe = createProbe({
  appName: 'My App',
  thresholds: {
    // Total frame budget (CPU + GPU should fit)
    maxFrameTimeMs: 16.67,  // 60 FPS target
    
    // If GPU time exceeds this, flag as warning
    maxGpuTimeMs: 12,  // Leave headroom for CPU
  }
});

probe.onViolation((violation) => {
  if (violation.metric === 'gpuTimeMs') {
    console.warn(`GPU time ${violation.value}ms exceeds threshold`);
  }
});
```

## Performance Overhead

### WebGL Timer Queries

| Operation | Overhead |
|-----------|----------|
| Extension check | ~0.01ms (once) |
| Query creation | ~0.005ms |
| beginQuery/endQuery | ~0.01ms |
| Reading results | ~0.02ms |
| **Total per frame** | **~0.05ms** |

### WebGPU Timestamp Queries

| Operation | Overhead |
|-----------|----------|
| writeTimestamp | ~0.002ms |
| resolveQuerySet | ~0.01ms |
| Buffer mapping | ~0.1-0.5ms (async) |
| **Total per frame** | **~0.1-0.5ms** |

The overhead is minimal but consider disabling GPU timing in production builds if not needed.

## Troubleshooting

### GPU Time Always Undefined

1. **Extension not supported**: Check if `EXT_disjoint_timer_query` is available
2. **Browser disabled it**: Some browsers disable for privacy
3. **Explicitly disabled**: Check your adapter options
4. **Using software renderer**: GPU timing requires hardware acceleration

### Inconsistent GPU Times

1. **Disjoint events**: Power management can invalidate timing
2. **First frame**: Initial timing may be unreliable
3. **Frame rate variance**: GPU scheduling varies

### GPU Time Much Higher Than Expected

1. **Measure multiple frames**: Single samples are noisy
2. **Check for sync points**: `readPixels`, `finish()` force GPU sync
3. **Thermal throttling**: Mobile devices throttle under load

## Related

- [WebGL Adapter](./webgl-adapter) - WebGL adapter documentation
- [WebGPU Adapter](./webgpu-adapter) - WebGPU adapter documentation
- [WebGPU Timing Manager](./webgpu-timing) - Detailed WebGPU timing implementation
- [Frame Stats](./frame-stats) - Complete frame statistics reference
