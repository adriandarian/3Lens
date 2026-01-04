# PerformanceTracker

The `PerformanceTracker` class collects and analyzes frame timing data to provide comprehensive performance metrics. It maintains a rolling history of frame times and FPS values, enabling percentile calculations, variance detection, and dropped frame tracking.

## Overview

```typescript
import { PerformanceTracker } from '@3lens/core';

// Create tracker with defaults (300 samples, 60 FPS target)
const tracker = new PerformanceTracker();

// Or with custom settings
const customTracker = new PerformanceTracker(600, 144); // 600 samples, 144 FPS target
```

## Constructor

```typescript
constructor(maxSamples?: number, targetFps?: number)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxSamples` | `number` | `300` | Maximum number of frame samples to keep in history |
| `targetFps` | `number` | `60` | Target frame rate for budget calculations |

## Methods

### recordFrame()

Records a frame's timing data and updates all internal histories.

```typescript
recordFrame(cpuTimeMs: number, timestamp: number): void
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `cpuTimeMs` | `number` | CPU time spent on this frame in milliseconds |
| `timestamp` | `number` | Frame timestamp from `performance.now()` |

**Example:**

```typescript
function animate(timestamp: number) {
  const startTime = performance.now();
  
  // Your render logic here
  renderer.render(scene, camera);
  
  const cpuTime = performance.now() - startTime;
  tracker.recordFrame(cpuTime, timestamp);
  
  requestAnimationFrame(animate);
}
```

### getDeltaTime()

Returns the time elapsed since the last recorded frame.

```typescript
getDeltaTime(timestamp: number): number
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `timestamp` | `number` | Current frame timestamp |

**Returns:** Delta time in milliseconds (defaults to 16.67ms for the first frame).

### getMetrics()

Returns comprehensive performance metrics based on current and historical data.

```typescript
getMetrics(cpuTimeMs: number): PerformanceMetrics
```

**Returns:** A `PerformanceMetrics` object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `fps` | `number` | Current instantaneous FPS |
| `fpsSmoothed` | `number` | Rolling average FPS |
| `fpsMin` | `number` | Minimum FPS in history |
| `fpsMax` | `number` | Maximum FPS in history |
| `fps1PercentLow` | `number` | 1% low FPS (99th percentile frame time) |
| `frameBudgetUsed` | `number` | Percentage of frame budget used (0-100) |
| `targetFrameTimeMs` | `number` | Target frame time based on target FPS |
| `frameTimeVariance` | `number` | Standard deviation of frame times |
| `isSmooth` | `boolean` | Whether frame is within 110% of target |
| `droppedFrames` | `number` | Consecutive dropped frames count |

**Example:**

```typescript
const metrics = tracker.getMetrics(cpuTimeMs);

if (!metrics.isSmooth) {
  console.warn(`Frame budget exceeded: ${metrics.frameBudgetUsed.toFixed(1)}%`);
}

console.log(`FPS: ${metrics.fps} (1% low: ${metrics.fps1PercentLow})`);
```

### getPercentile()

Calculates a percentile value from the frame time history.

```typescript
getPercentile(percentile: number): number
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `percentile` | `number` | Percentile to calculate (0-100) |

**Returns:** Frame time at the specified percentile in milliseconds.

**Example:**

```typescript
const p50 = tracker.getPercentile(50);  // Median frame time
const p95 = tracker.getPercentile(95);  // 95th percentile
const p99 = tracker.getPercentile(99);  // Worst 1% of frames
```

### getAverageFrameTime()

Returns the average frame time across all samples in history.

```typescript
getAverageFrameTime(): number
```

**Returns:** Average frame time in milliseconds.

### getAverageFps()

Returns the average FPS across all samples in history.

```typescript
getAverageFps(): number
```

**Returns:** Average FPS value.

### getMinFps()

Returns the minimum FPS value in the history.

```typescript
getMinFps(): number
```

**Returns:** Minimum FPS recorded.

### getMaxFps()

Returns the maximum FPS value in the history.

```typescript
getMaxFps(): number
```

**Returns:** Maximum FPS recorded.

### get1PercentLowFps()

Returns the 1% low FPS, calculated from the 99th percentile frame time.

```typescript
get1PercentLowFps(): number
```

**Returns:** FPS value representing the worst 1% of frames.

::: tip Understanding 1% Low
The 1% low FPS is a better indicator of stuttering than average FPS. It represents how the worst frames perform, which directly impacts perceived smoothness.
:::

### getVariance()

Returns the standard deviation of frame times, indicating frame time consistency.

```typescript
getVariance(): number
```

**Returns:** Frame time variance (standard deviation) in milliseconds.

::: info Interpreting Variance
- **< 2ms**: Excellent consistency
- **2-5ms**: Good, minor jitter
- **5-10ms**: Noticeable stuttering
- **> 10ms**: Significant frame time instability
:::

### reset()

Clears all frame history and resets counters.

```typescript
reset(): void
```

**Example:**

```typescript
// Reset when switching scenes
function loadNewScene() {
  tracker.reset();
  // Load scene...
}
```

## Frame Budget Calculation

The tracker calculates frame budget usage based on the target FPS:

```
Frame Budget % = (cpuTimeMs / targetFrameTimeMs) × 100
```

For a 60 FPS target:
- Target frame time: 16.67ms
- 10ms frame → 60% budget used
- 20ms frame → 120% budget used (over budget)

## Dropped Frame Detection

A frame is considered "dropped" when it takes more than 150% of the target frame time:

```typescript
// For 60 FPS target (16.67ms):
// Frame > 25ms is marked as dropped

if (cpuTimeMs > targetFrameTimeMs * 1.5) {
  droppedFrames++;
} else {
  droppedFrames = 0; // Reset on smooth frame
}
```

## Integration with 3Lens

The `PerformanceTracker` is used internally by `DevtoolProbe` to populate frame statistics:

```typescript
// PerformanceTracker is automatically created and managed
const probe = createProbe({ /* config */ });

// Access metrics through frame stats
probe.on('frame', (stats) => {
  console.log(stats.performance.fps);
  console.log(stats.performance.fps1PercentLow);
  console.log(stats.performance.frameBudgetUsed);
});
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PerformanceTracker                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Frame Times  │  │  FPS History │  │  Dropped Frame   │   │
│  │   Array      │  │    Array     │  │    Counter       │   │
│  │ (maxSamples) │  │ (maxSamples) │  │                  │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                   │              │
│         ▼                 ▼                   ▼              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              getMetrics()                            │   │
│  │  • FPS (instant, smoothed, min, max, 1% low)         │   │
│  │  • Frame budget usage                                │   │
│  │  • Variance calculation                              │   │
│  │  • Smoothness detection                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Best Practices

### Choose Appropriate Sample Count

```typescript
// Mobile/low-power: fewer samples for memory efficiency
const mobileTracker = new PerformanceTracker(100, 30);

// Desktop: more samples for better percentile accuracy
const desktopTracker = new PerformanceTracker(600, 60);

// VR: high refresh rate target
const vrTracker = new PerformanceTracker(300, 90);
```

### Monitor 1% Low for Stuttering

```typescript
const metrics = tracker.getMetrics(cpuTimeMs);

// Alert when 1% low is significantly below average
if (metrics.fps1PercentLow < metrics.fpsSmoothed * 0.7) {
  console.warn('Significant frame time spikes detected');
}
```

### Use Variance for Consistency Checks

```typescript
const variance = tracker.getVariance();

if (variance > 5) {
  console.warn(`High frame time variance: ${variance.toFixed(2)}ms`);
  // Investigate causes: GC, complex calculations, etc.
}
```

## See Also

- [FrameStats Interface](./frame-stats) - Complete frame statistics structure
- [Performance Thresholds](./performance-thresholds) - Configuring warning thresholds
- [Sampling Configuration](./sampling-config) - Frame sampling options
- [DevtoolProbe](./devtool-probe) - Main probe class that uses PerformanceTracker
