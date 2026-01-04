# WebGPU Timing Manager

The `WebGpuTimingManager` class provides accurate per-pass GPU timing measurement using WebGPU timestamp queries. It implements triple-buffered async readback to avoid GPU stalls.

## Overview

```typescript
import { WebGpuTimingManager } from '@3lens/core';

const timingManager = new WebGpuTimingManager({
  maxHistorySize: 120,
  maxPassesPerFrame: 16,
});

// Initialize with WebGPU device
const device = renderer.backend.device;
const success = await timingManager.initialize(device);

if (success) {
  console.log('GPU timing ready');
}
```

## API Reference

### Constructor

```typescript
new WebGpuTimingManager(config?: Partial<GpuTimingConfig>)
```

**GpuTimingConfig:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxHistorySize` | `number` | `120` | Frames to keep in history |
| `autoReadback` | `boolean` | `true` | Auto-read results each frame |
| `maxPassesPerFrame` | `number` | `16` | Maximum passes to time per frame |

### Methods

#### initialize

Initialize the timing manager with a WebGPU device.

```typescript
async initialize(device: GPUDevice): Promise<boolean>
```

Returns `false` if `timestamp-query` feature is not supported.

#### isEnabled

Check if GPU timing is available and active.

```typescript
isEnabled(): boolean
```

#### beginFrame

Start timing a new frame.

```typescript
beginFrame(frameNumber: number): void
```

#### getPassStartQueryIndex

Get query index for pass start timestamp.

```typescript
getPassStartQueryIndex(
  passName: string, 
  passType?: GpuPassType
): number
```

**GpuPassType:**

```typescript
type GpuPassType = 
  | 'render'      // Main render pass
  | 'compute'     // Compute shader pass
  | 'shadow'      // Shadow map generation
  | 'post-process' // Post-processing effects
  | 'copy'        // Buffer/texture copies
  | 'unknown';    // Default
```

#### getPassEndQueryIndex

Get query index for pass end timestamp.

```typescript
getPassEndQueryIndex(): number
```

#### writeTimestamp

Write a timestamp to the query set.

```typescript
writeTimestamp(encoder: GPUCommandEncoder, queryIndex: number): void
```

#### endFrame

End frame timing and resolve queries.

```typescript
endFrame(encoder: GPUCommandEncoder): void
```

#### copyForReadback

Copy resolved queries to mappable buffer.

```typescript
copyForReadback(encoder: GPUCommandEncoder, bufferIndex?: number): void
```

#### readResults

Asynchronously read timing results.

```typescript
async readResults(): Promise<GpuFrameTiming | null>
```

#### getLatestTiming

Get most recent timing (non-blocking).

```typescript
getLatestTiming(): GpuFrameTiming | null
```

#### getHistory

Get timing history array.

```typescript
getHistory(): GpuFrameTiming[]
```

#### getAverageTiming

Get averaged timing over recent frames.

```typescript
getAverageTiming(frameCount?: number): GpuFrameTiming | null
```

#### dispose

Clean up GPU resources.

```typescript
dispose(): void
```

## Interfaces

### GpuFrameTiming

Complete timing result for a frame.

```typescript
interface GpuFrameTiming {
  /** Total GPU time in milliseconds */
  totalMs: number;
  
  /** Individual pass timings */
  passes: GpuPassTiming[];
  
  /** Timing breakdown by pass type and name */
  breakdown: Record<string, number>;
  
  /** Frame number when timing was captured */
  frameNumber: number;
  
  /** CPU timestamp when result was read */
  timestamp: number;
}
```

### GpuPassTiming

Timing for an individual render/compute pass.

```typescript
interface GpuPassTiming {
  /** Pass name (e.g., "shadow", "main-render", "bloom") */
  name: string;
  
  /** Start timestamp in nanoseconds (BigInt) */
  startNs: bigint;
  
  /** End timestamp in nanoseconds (BigInt) */
  endNs: bigint;
  
  /** Duration in milliseconds */
  durationMs: number;
}
```

## Architecture

### Triple-Buffered Async Readback

The timing manager uses triple buffering to avoid GPU stalls:

```
┌────────────────────────────────────────────────────────────────┐
│ Triple Buffer Architecture                                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Frame N:     [Buffer 0] ← Currently writing timestamps         │
│ Frame N-1:   [Buffer 2] ← GPU resolving queries                │
│ Frame N-2:   [Buffer 1] ← CPU reading results (async map)      │
│                                                                │
│ Each buffer contains:                                          │
│   - Query Set region (maxPasses × 2 timestamps)                │
│   - Frame metadata (pass names, types, count)                  │
│   - Readback state tracking                                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Query Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Query Set Memory Layout                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Buffer 0: [Start₀|End₀|Start₁|End₁|...|StartN|EndN]        │
│ Buffer 1: [Start₀|End₀|Start₁|End₁|...|StartN|EndN]        │
│ Buffer 2: [Start₀|End₀|Start₁|End₁|...|StartN|EndN]        │
│                                                             │
│ Each timestamp: 8 bytes (BigInt64)                          │
│ Total queries: maxPassesPerFrame × 2 × 3 buffers            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Basic Integration

```typescript
const timingManager = new WebGpuTimingManager();

async function initGpuTiming() {
  const device = renderer.backend.device;
  return await timingManager.initialize(device);
}

function renderFrame(frameNumber: number) {
  if (!timingManager.isEnabled()) return;
  
  const encoder = device.createCommandEncoder();
  
  // Begin timing for this frame
  timingManager.beginFrame(frameNumber);
  
  // Shadow pass
  const shadowStartIdx = timingManager.getPassStartQueryIndex('shadow', 'shadow');
  timingManager.writeTimestamp(encoder, shadowStartIdx);
  renderShadowPass(encoder);
  const shadowEndIdx = timingManager.getPassEndQueryIndex();
  timingManager.writeTimestamp(encoder, shadowEndIdx);
  
  // Main render pass
  const mainStartIdx = timingManager.getPassStartQueryIndex('main', 'render');
  timingManager.writeTimestamp(encoder, mainStartIdx);
  renderMainPass(encoder);
  const mainEndIdx = timingManager.getPassEndQueryIndex();
  timingManager.writeTimestamp(encoder, mainEndIdx);
  
  // End frame and resolve
  timingManager.endFrame(encoder);
  timingManager.copyForReadback(encoder);
  
  device.queue.submit([encoder.finish()]);
}

async function getTimingResults() {
  const timing = await timingManager.readResults();
  
  if (timing) {
    console.log(`Total GPU: ${timing.totalMs.toFixed(2)}ms`);
    
    for (const pass of timing.passes) {
      console.log(`  ${pass.name}: ${pass.durationMs.toFixed(2)}ms`);
    }
  }
}
```

### Render Pass Descriptor Integration

Using `timestampWrites` in render pass descriptors:

```typescript
// Create render pass with timing
function createTimedRenderPass(
  encoder: GPUCommandEncoder,
  passName: string
) {
  const startIdx = timingManager.getPassStartQueryIndex(passName, 'render');
  const endIdx = timingManager.getPassEndQueryIndex();
  
  const passDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [/* ... */],
    depthStencilAttachment: {/* ... */},
    timestampWrites: {
      querySet: timingManager.querySet,
      beginningOfPassWriteIndex: startIdx,
      endOfPassWriteIndex: endIdx,
    },
  };
  
  return encoder.beginRenderPass(passDescriptor);
}
```

### Performance Analysis

```typescript
// Analyze GPU performance over time
function analyzePerformance() {
  const history = timingManager.getHistory();
  
  if (history.length === 0) return;
  
  // Find slowest passes
  const passStats = new Map<string, { total: number; count: number; max: number }>();
  
  for (const frame of history) {
    for (const pass of frame.passes) {
      const stats = passStats.get(pass.name) ?? { total: 0, count: 0, max: 0 };
      stats.total += pass.durationMs;
      stats.count++;
      stats.max = Math.max(stats.max, pass.durationMs);
      passStats.set(pass.name, stats);
    }
  }
  
  console.log('GPU Pass Analysis:');
  for (const [name, stats] of passStats) {
    const avg = stats.total / stats.count;
    console.log(`  ${name}: avg=${avg.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms`);
  }
}
```

### Averaging for Stability

```typescript
// Use averaged timing for stable UI display
function updateUI() {
  const avgTiming = timingManager.getAverageTiming(30); // Average over 30 frames
  
  if (avgTiming) {
    gpuMeter.setValue(avgTiming.totalMs);
    
    // Update breakdown chart
    for (const pass of avgTiming.passes) {
      chart.updateBar(pass.name, pass.durationMs);
    }
  }
}
```

### Conditional Timing

```typescript
// Only time when explicitly requested
class OptionalTiming {
  private shouldTime = false;
  
  enableTiming() {
    this.shouldTime = true;
  }
  
  disableTiming() {
    this.shouldTime = false;
  }
  
  render(encoder: GPUCommandEncoder) {
    if (this.shouldTime && timingManager.isEnabled()) {
      // Full timing
      timingManager.beginFrame(this.frameNumber);
      this.renderWithTiming(encoder);
      timingManager.endFrame(encoder);
    } else {
      // Skip timing overhead
      this.renderWithoutTiming(encoder);
    }
  }
}
```

## Browser Requirements

### Feature Detection

```typescript
async function checkTimestampSupport() {
  if (!navigator.gpu) {
    return { supported: false, reason: 'WebGPU not available' };
  }
  
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return { supported: false, reason: 'No GPU adapter' };
  }
  
  // Request device with timestamp-query feature
  const device = await adapter.requestDevice({
    requiredFeatures: ['timestamp-query']
  }).catch(() => null);
  
  if (!device) {
    return { supported: false, reason: 'timestamp-query not supported' };
  }
  
  return { supported: true, device };
}
```

### Browser Support Matrix

| Browser | WebGPU | timestamp-query |
|---------|--------|-----------------|
| Chrome 113+ | ✅ | ✅ |
| Edge 113+ | ✅ | ✅ |
| Firefox Nightly | ⚠️ | ⚠️ |
| Safari 17+ | ✅ | ⚠️ |

## Performance Considerations

### Overhead

| Operation | Typical Cost |
|-----------|-------------|
| `writeTimestamp` | ~0.002ms |
| `resolveQuerySet` | ~0.01ms |
| `copyBufferToBuffer` | ~0.005ms |
| `mapAsync` | 0.1-0.5ms (async) |
| Memory per buffer | 256 bytes (16 passes × 2 × 8 bytes) |

### Best Practices

1. **Limit passes**: Set `maxPassesPerFrame` to actual needs
2. **Batch reads**: Read results once per frame, not per pass
3. **Handle async**: Don't block on `readResults()`
4. **Check enabled**: Skip timing calls when disabled

```typescript
// Good: Check once at frame start
if (timingManager.isEnabled()) {
  timingManager.beginFrame(frameNum);
  // ... timing calls
}

// Bad: Check every call
timingManager.writeTimestamp(encoder, idx); // Already checks internally
```

## Error Handling

```typescript
const timingManager = new WebGpuTimingManager();

async function safeInitialize(device: GPUDevice) {
  try {
    const success = await timingManager.initialize(device);
    
    if (!success) {
      console.warn('GPU timing not available, using CPU-only metrics');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('GPU timing initialization failed:', e);
    return false;
  }
}

async function safeReadResults() {
  try {
    return await timingManager.readResults();
  } catch (e) {
    // Buffer mapping can fail if device is lost
    console.warn('Timing readback failed:', e);
    return timingManager.getLatestTiming(); // Return cached result
  }
}
```

## Related

- [GPU Timing System](./gpu-timing) - Overview of GPU timing mechanisms
- [WebGPU Adapter](./webgpu-adapter) - WebGPU renderer adapter
- [Frame Stats](./frame-stats) - Complete frame statistics reference
