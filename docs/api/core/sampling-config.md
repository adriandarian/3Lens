# Sampling Options (SamplingConfig)

The `SamplingConfig` interface controls how and when 3Lens collects performance data. Proper sampling configuration balances data granularity with performance overhead.

## Overview

```typescript
import { DEFAULT_SAMPLING, createProbe } from '@3lens/core';

const probe = createProbe({
  appName: 'MyApp',
  sampling: {
    frameStats: 'every-frame',
    snapshots: 'on-change',
    gpuTiming: true,
    resourceTracking: true,
  },
});
```

## DEFAULT_SAMPLING

The complete default sampling configuration:

```typescript
import { DEFAULT_SAMPLING } from '@3lens/core';

const DEFAULT_SAMPLING = {
  frameStats: 'every-frame',   // Collect every frame
  snapshots: 'on-change',       // Snapshot when scene changes
  gpuTiming: true,              // Enable GPU timing
  resourceTracking: true,       // Track resource lifecycle
};
```

## Type Definition

```typescript
interface SamplingConfig {
  /**
   * How often to collect frame stats
   * @default 'every-frame'
   */
  frameStats?: 'every-frame' | 'on-demand' | number;

  /**
   * When to take scene snapshots
   * @default 'on-change'
   */
  snapshots?: 'manual' | 'on-change' | 'every-frame';

  /**
   * Enable GPU timing collection
   * @default true
   */
  gpuTiming?: boolean;

  /**
   * Enable resource lifecycle tracking
   * @default true
   */
  resourceTracking?: boolean;
}
```

## Options Reference

### frameStats

Controls how often frame statistics are collected.

| Value | Description | Use Case |
|-------|-------------|----------|
| `'every-frame'` | Collect on every rendered frame | Development, detailed profiling |
| `'on-demand'` | Only when explicitly requested | Production, minimal overhead |
| `number` | Collect every N frames | Balanced monitoring |

#### Every Frame

```typescript
const probe = createProbe({
  appName: 'MyApp',
  sampling: {
    frameStats: 'every-frame',
  },
});

// Frame stats available in every callback
probe.onFrameStats((stats) => {
  console.log(`Frame ${stats.frameNumber}: ${stats.cpuTimeMs}ms`);
});
```

#### On Demand

```typescript
const probe = createProbe({
  appName: 'MyApp',
  sampling: {
    frameStats: 'on-demand',
  },
});

// Request stats when needed
function checkPerformance() {
  const stats = probe.getFrameStats();
  console.log(`Current: ${stats.drawCalls} draw calls`);
}
```

#### Fixed Interval

```typescript
const probe = createProbe({
  appName: 'MyApp',
  sampling: {
    frameStats: 10, // Every 10th frame
  },
});

// Callbacks fire every 10 frames
probe.onFrameStats((stats) => {
  // Called ~6 times per second at 60 FPS
  reportToAnalytics(stats);
});
```

```
┌─────────────────────────────────────────────────────────────┐
│ Frame Stats Collection Patterns                             │
├─────────────────────────────────────────────────────────────┤
│ every-frame:  ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓  (100% frames sampled)  │
│ on-demand:    · · · ▓ · · · · ▓ ·  (explicit calls only)   │
│ interval (5): ▓ · · · · ▓ · · · ·  (20% frames sampled)    │
└─────────────────────────────────────────────────────────────┘
```

### snapshots

Controls when scene graph snapshots are captured.

| Value | Description | Use Case |
|-------|-------------|----------|
| `'manual'` | Only when explicitly requested | Production, large scenes |
| `'on-change'` | When scene graph changes | Development, debugging |
| `'every-frame'` | Capture every frame | Testing, CI validation |

#### Manual Snapshots

```typescript
const probe = createProbe({
  appName: 'MyApp',
  sampling: {
    snapshots: 'manual',
  },
});

// Explicitly request snapshot
function captureSceneState() {
  const snapshot = probe.getSceneSnapshot();
  return snapshot.objects.length;
}
```

#### On Change

```typescript
const probe = createProbe({
  appName: 'MyApp',
  sampling: {
    snapshots: 'on-change',
  },
});

// Callback fires when scene changes
probe.onSceneSnapshot((snapshot) => {
  console.log(`Scene updated: ${snapshot.objects.length} objects`);
  updateSceneTree(snapshot);
});
```

#### Every Frame

```typescript
const probe = createProbe({
  appName: 'MyApp',
  sampling: {
    snapshots: 'every-frame',
  },
});

// Warning: High overhead for large scenes!
// Useful for frame-by-frame analysis in tests
probe.onSceneSnapshot((snapshot) => {
  validateSceneState(snapshot);
});
```

::: warning Performance Impact
`'every-frame'` snapshots have significant overhead for large scene graphs. Use only for testing or small scenes.
:::

### gpuTiming

Enables GPU timing measurements using `EXT_disjoint_timer_query` (WebGL) or timestamp queries (WebGPU).

```typescript
const probe = createProbe({
  appName: 'MyApp',
  sampling: {
    gpuTiming: true, // Enable GPU timing
  },
});

probe.onFrameStats((stats) => {
  console.log(`GPU time: ${stats.gpuTimeMs}ms`);
  console.log(`CPU time: ${stats.cpuTimeMs}ms`);
});
```

#### GPU Timing Availability

```
┌─────────────────────────────────────────────────────────────┐
│ GPU Timing Support Matrix                                   │
├─────────────────────────────────────────────────────────────┤
│ Platform        │ WebGL                │ WebGPU             │
├─────────────────────────────────────────────────────────────┤
│ Chrome          │ ✅ (ext required)     │ ✅                  │
│ Firefox         │ ✅ (ext required)     │ ✅                  │
│ Safari          │ ❌ (not supported)    │ ⚠️ (partial)        │
│ Mobile Chrome   │ ⚠️ (device-dependent) │ ❌                  │
│ Mobile Safari   │ ❌                    │ ❌                  │
│ Headless        │ ❌                    │ ❌                  │
└─────────────────────────────────────────────────────────────┘
```

::: tip Fallback Behavior
When GPU timing is unavailable, `gpuTimeMs` will be `0` or estimated from CPU measurements. Always check `stats.gpuTimingAvailable` before relying on GPU metrics.
:::

```typescript
probe.onFrameStats((stats) => {
  if (stats.gpuTimingAvailable) {
    console.log(`Actual GPU time: ${stats.gpuTimeMs}ms`);
  } else {
    console.log(`GPU timing unavailable, CPU time: ${stats.cpuTimeMs}ms`);
  }
});
```

### resourceTracking

Enables tracking of resource creation and disposal events (textures, geometries, materials, render targets).

```typescript
const probe = createProbe({
  appName: 'MyApp',
  sampling: {
    resourceTracking: true,
  },
});

// Track resource lifecycle
probe.onResourceCreated((resource) => {
  console.log(`Created: ${resource.type} (${resource.debugId})`);
});

probe.onResourceDisposed((resource) => {
  console.log(`Disposed: ${resource.type} (${resource.debugId})`);
});
```

#### Tracked Resources

| Resource Type | Events | Memory Tracked |
|---------------|--------|----------------|
| `Texture` | create, dispose, update | ✅ |
| `BufferGeometry` | create, dispose | ✅ |
| `Material` | create, dispose, update | ❌ |
| `RenderTarget` | create, dispose | ✅ |
| `WebGLProgram` | create, dispose | ❌ |

::: info Memory Leak Detection
Resource tracking enables the leak detection system. When disabled, you won't receive warnings about orphaned resources.
:::

## Configuration Presets

### Development (Maximum Detail)

```typescript
const devSampling: SamplingConfig = {
  frameStats: 'every-frame',
  snapshots: 'on-change',
  gpuTiming: true,
  resourceTracking: true,
};
```

### Production (Minimal Overhead)

```typescript
const prodSampling: SamplingConfig = {
  frameStats: 'on-demand',
  snapshots: 'manual',
  gpuTiming: false,
  resourceTracking: false,
};
```

### Monitoring (Balanced)

```typescript
const monitorSampling: SamplingConfig = {
  frameStats: 60, // Once per second at 60 FPS
  snapshots: 'manual',
  gpuTiming: false,
  resourceTracking: true, // Keep leak detection
};
```

### CI Testing (Comprehensive)

```typescript
const ciSampling: SamplingConfig = {
  frameStats: 'every-frame',
  snapshots: 'every-frame', // Validate every frame
  gpuTiming: false, // Unavailable in headless
  resourceTracking: true,
};
```

## Performance Impact

Approximate overhead of each sampling option:

| Option | Overhead | Notes |
|--------|----------|-------|
| `frameStats: 'every-frame'` | ~0.1ms | Minimal, mostly bookkeeping |
| `frameStats: 'on-demand'` | ~0ms | No continuous overhead |
| `frameStats: N` | ~0.1ms / N | Amortized overhead |
| `snapshots: 'on-change'` | ~0.5-5ms | Depends on scene size |
| `snapshots: 'every-frame'` | ~1-10ms | High for large scenes |
| `snapshots: 'manual'` | ~0ms | Only when requested |
| `gpuTiming: true` | ~0.05ms | May cause GPU sync |
| `resourceTracking: true` | ~0.01ms | Per-resource overhead |

```
┌─────────────────────────────────────────────────────────────┐
│ Overhead Comparison (60 FPS budget = 16.67ms)               │
├─────────────────────────────────────────────────────────────┤
│ Configuration          │ Overhead  │ % of Budget           │
├─────────────────────────────────────────────────────────────┤
│ All disabled           │ ~0.01ms   │ 0.06%                 │
│ Frame stats only       │ ~0.1ms    │ 0.6%                  │
│ + GPU timing           │ ~0.15ms   │ 0.9%                  │
│ + Resource tracking    │ ~0.2ms    │ 1.2%                  │
│ + Snapshots on-change  │ ~0.5-5ms  │ 3-30% ⚠️              │
│ Full (dev mode)        │ ~0.5-5ms  │ 3-30% ⚠️              │
└─────────────────────────────────────────────────────────────┘
```

## Dynamic Configuration

Sampling can be adjusted at runtime for debugging sessions:

```typescript
const probe = createProbe({
  appName: 'MyApp',
  sampling: {
    frameStats: 60, // Start with low frequency
    snapshots: 'manual',
  },
});

// Enable detailed collection during debugging
function enableDetailedSampling() {
  probe.setSamplingConfig({
    frameStats: 'every-frame',
    snapshots: 'on-change',
  });
}

// Return to production settings
function disableDetailedSampling() {
  probe.setSamplingConfig({
    frameStats: 60,
    snapshots: 'manual',
  });
}
```

## Best Practices

### 1. Start Conservative

Begin with minimal sampling and enable more as needed:

```typescript
// Start here
sampling: { frameStats: 60, snapshots: 'manual' }

// Enable more when debugging specific issues
sampling: { frameStats: 'every-frame', snapshots: 'on-change' }
```

### 2. Environment-Based Configuration

```typescript
const sampling: SamplingConfig = process.env.NODE_ENV === 'production'
  ? { frameStats: 'on-demand', snapshots: 'manual', gpuTiming: false }
  : { frameStats: 'every-frame', snapshots: 'on-change', gpuTiming: true };
```

### 3. Consider Scene Size

For large scenes (10,000+ objects), avoid `snapshots: 'every-frame'`:

```typescript
const largeSceneSampling: SamplingConfig = {
  frameStats: 'every-frame', // Fine
  snapshots: 'manual',       // Request explicitly
  resourceTracking: true,    // Fine
};
```

### 4. Mobile Optimization

Reduce sampling frequency on mobile:

```typescript
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

const sampling: SamplingConfig = {
  frameStats: isMobile ? 30 : 'every-frame',
  snapshots: isMobile ? 'manual' : 'on-change',
  gpuTiming: !isMobile, // Rarely available on mobile
  resourceTracking: true,
};
```

## Type Imports

```typescript
import type { SamplingConfig } from '@3lens/core';
import { DEFAULT_SAMPLING } from '@3lens/core';
```

## Related

- [ProbeConfig](./probe-config) - Main configuration interface
- [Performance Thresholds](./performance-thresholds) - Performance limits
- [observeRenderer()](./observe-renderer) - Renderer observation
- [observeScene()](./observe-scene) - Scene observation
