# Performance Thresholds

3Lens includes a comprehensive performance monitoring system with default thresholds optimized for typical Three.js applications. These thresholds trigger warnings and errors when your application exceeds recommended limits.

## Overview

```typescript
import { DEFAULT_THRESHOLDS, createProbe } from '@3lens/core';

// Use defaults
const probe = createProbe({ appName: 'MyApp' });

// Override specific thresholds
const customProbe = createProbe({
  appName: 'MyApp',
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 250000,
  },
});
```

## DEFAULT_THRESHOLDS

The complete default thresholds object:

```typescript
import { DEFAULT_THRESHOLDS } from '@3lens/core';

const DEFAULT_THRESHOLDS = {
  // Rendering limits
  maxDrawCalls: 1000,
  maxTriangles: 500000,
  maxVertices: 1000000,
  maxProgramSwitches: 100,
  
  // Frame timing
  maxFrameTimeMs: 16.67,      // 60 FPS target
  maxFrameTimeVariance: 10,   // Max jitter in ms
  minFps: 30,                 // Minimum acceptable FPS
  min1PercentLowFps: 20,      // 1% low threshold
  
  // Memory limits
  maxTextures: 100,
  maxTextureMemory: 268435456,   // 256 MB
  maxGeometryMemory: 134217728,  // 128 MB
  maxGpuMemory: 536870912,       // 512 MB
  
  // Scene complexity
  maxSkinnedMeshes: 20,
  maxBones: 500,
  maxLights: 10,
  maxShadowLights: 4,
  maxTransparentObjects: 50,
};
```

## Threshold Categories

### Rendering Limits

These thresholds monitor draw call batching and polygon counts.

| Threshold | Default | Description |
|-----------|---------|-------------|
| `maxDrawCalls` | 1000 | Maximum draw calls per frame |
| `maxTriangles` | 500,000 | Maximum rendered triangles per frame |
| `maxVertices` | 1,000,000 | Maximum vertices processed per frame |
| `maxProgramSwitches` | 100 | Maximum shader program switches per frame |

#### Why These Matter

```
┌─────────────────────────────────────────────────────────────┐
│ CPU Timeline (high draw calls)                              │
├─────────────────────────────────────────────────────────────┤
│ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓           │
│ └───────────────────────────────────────────────┘           │
│   Many small draw calls = high CPU overhead                  │
├─────────────────────────────────────────────────────────────┤
│ CPU Timeline (batched)                                      │
├─────────────────────────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         Idle time                         │
│ └─────────────────┘                                         │
│   Fewer batched calls = lower CPU overhead                  │
└─────────────────────────────────────────────────────────────┘
```

**Draw calls** are expensive CPU operations. Each draw call requires:
- State validation
- Shader uniform uploads
- Buffer binding
- GPU command submission

::: tip Optimization
Use instancing, geometry merging, or batching to reduce draw calls while maintaining visual quality.
:::

### Frame Timing

Monitor frame rate stability and identify performance bottlenecks.

| Threshold | Default | Description |
|-----------|---------|-------------|
| `maxFrameTimeMs` | 16.67 | Maximum frame time (60 FPS target) |
| `maxFrameTimeVariance` | 10 | Maximum frame time variance (jitter) |
| `minFps` | 30 | Minimum acceptable FPS |
| `min1PercentLowFps` | 20 | 1% low frame rate threshold |

#### Frame Time vs FPS

```
┌─────────────────────────────────────────────────────────────┐
│ Frame Time Targets                                          │
├───────────────┬─────────────────────────────────────────────┤
│ Target FPS    │ Max Frame Time                              │
├───────────────┼─────────────────────────────────────────────┤
│ 144 FPS       │ 6.94 ms                                     │
│ 120 FPS       │ 8.33 ms                                     │
│ 90 FPS (VR)   │ 11.11 ms                                    │
│ 60 FPS        │ 16.67 ms ← Default                          │
│ 30 FPS        │ 33.33 ms                                    │
└───────────────┴─────────────────────────────────────────────┘
```

::: warning VR Applications
For VR/XR applications, use `maxFrameTimeMs: 11.11` (90 FPS) or `maxFrameTimeMs: 8.33` (120 FPS) to prevent motion sickness.
:::

### Memory Limits

Monitor GPU memory consumption to prevent out-of-memory errors.

| Threshold | Default | Description |
|-----------|---------|-------------|
| `maxTextures` | 100 | Maximum texture objects |
| `maxTextureMemory` | 256 MB | Maximum texture memory |
| `maxGeometryMemory` | 128 MB | Maximum geometry memory |
| `maxGpuMemory` | 512 MB | Maximum total GPU memory |

#### Memory Calculation

```typescript
// Texture memory formula
const textureMemory = width * height * bytesPerPixel * (mipmaps ? 1.33 : 1);

// Examples:
// 4K RGBA texture: 4096 * 4096 * 4 * 1.33 = ~89 MB with mipmaps
// 2K RGBA texture: 2048 * 2048 * 4 * 1.33 = ~22 MB with mipmaps
// 1K RGBA texture: 1024 * 1024 * 4 * 1.33 = ~5.5 MB with mipmaps
```

::: danger Mobile Devices
Mobile GPUs have significantly less memory. Consider using:
```typescript
rules: {
  maxTextureMemory: 64 * 1024 * 1024,  // 64 MB
  maxGpuMemory: 128 * 1024 * 1024,     // 128 MB
}
```
:::

### Scene Complexity

Monitor scene graph complexity to maintain performance.

| Threshold | Default | Description |
|-----------|---------|-------------|
| `maxSkinnedMeshes` | 20 | Maximum skinned mesh objects |
| `maxBones` | 500 | Maximum skeleton bones |
| `maxLights` | 10 | Maximum active lights |
| `maxShadowLights` | 4 | Maximum shadow-casting lights |
| `maxTransparentObjects` | 50 | Maximum transparent objects |

#### Why Limits Matter

```
┌─────────────────────────────────────────────────────────────┐
│ Shadow Map Rendering Cost                                   │
├─────────────────────────────────────────────────────────────┤
│ Shadow Lights    Render Passes    Performance Impact        │
├─────────────────────────────────────────────────────────────┤
│ 1                2x               Minimal                   │
│ 2                3x               Noticeable                │
│ 4                5x               Significant ← Default max │
│ 8                9x               Severe                    │
└─────────────────────────────────────────────────────────────┘

Each shadow light adds a complete scene render pass!
```

## Severity Levels

When a threshold is exceeded, 3Lens assigns a severity based on how much the limit was exceeded:

| Severity | Condition | Description |
|----------|-----------|-------------|
| `warning` | value > threshold | Threshold exceeded |
| `error` | value > threshold × 1.5 | Threshold exceeded by 50%+ |

```typescript
// Example: maxDrawCalls = 1000
// 1100 draw calls → warning
// 1600 draw calls → error
```

## Customizing Thresholds

### At Creation Time

```typescript
const probe = createProbe({
  appName: 'MyApp',
  rules: {
    // Override specific thresholds
    maxDrawCalls: 500,
    maxTriangles: 250000,
    maxFrameTimeMs: 8.33, // 120 FPS target
    
    // Mobile-friendly limits
    maxTextureMemory: 64 * 1024 * 1024,
    maxGpuMemory: 128 * 1024 * 1024,
  },
});
```

### At Runtime

```typescript
// Update thresholds dynamically
probe.updateThresholds({
  maxDrawCalls: 2000, // Temporarily allow more
  maxTriangles: 1000000,
});

// Get current thresholds
const current = probe.getThresholds();
console.log(current.maxDrawCalls); // 2000
```

### Environment-Based

```typescript
const thresholds = {
  development: {
    maxDrawCalls: 2000,
    maxTriangles: 1000000,
    maxFrameTimeMs: 33.33, // 30 FPS minimum
  },
  staging: {
    maxDrawCalls: 1000,
    maxTriangles: 500000,
    maxFrameTimeMs: 16.67,
  },
  production: {
    maxDrawCalls: 500,
    maxTriangles: 250000,
    maxFrameTimeMs: 16.67,
  },
};

const probe = createProbe({
  appName: 'MyApp',
  env: process.env.NODE_ENV,
  rules: thresholds[process.env.NODE_ENV] || thresholds.development,
});
```

## Platform-Specific Recommendations

### Desktop (High-End)

```typescript
const desktopHighEnd = {
  maxDrawCalls: 2000,
  maxTriangles: 2000000,
  maxVertices: 4000000,
  maxTextureMemory: 512 * 1024 * 1024,  // 512 MB
  maxGpuMemory: 1024 * 1024 * 1024,     // 1 GB
  maxFrameTimeMs: 16.67,                 // 60 FPS
};
```

### Desktop (Standard)

```typescript
const desktopStandard = {
  maxDrawCalls: 1000,
  maxTriangles: 500000,
  maxVertices: 1000000,
  maxTextureMemory: 256 * 1024 * 1024,  // 256 MB
  maxGpuMemory: 512 * 1024 * 1024,      // 512 MB
  maxFrameTimeMs: 16.67,                 // 60 FPS
};
```

### Mobile / Low-End

```typescript
const mobile = {
  maxDrawCalls: 200,
  maxTriangles: 100000,
  maxVertices: 200000,
  maxTextureMemory: 64 * 1024 * 1024,   // 64 MB
  maxGpuMemory: 128 * 1024 * 1024,      // 128 MB
  maxFrameTimeMs: 33.33,                 // 30 FPS
  maxLights: 4,
  maxShadowLights: 1,
};
```

### VR/XR

```typescript
const vr = {
  maxDrawCalls: 500,               // Per eye
  maxTriangles: 250000,            // Per eye
  maxFrameTimeMs: 11.11,           // 90 FPS minimum
  maxFrameTimeVariance: 2,         // Strict jitter limit
  minFps: 72,                      // Quest minimum
  maxShadowLights: 2,              // Limited shadows
};
```

## Threshold Reference Table

Complete reference of all available thresholds:

| Threshold | Type | Default | Min | Recommended Range |
|-----------|------|---------|-----|-------------------|
| `maxDrawCalls` | number | 1000 | 1 | 100 - 2000 |
| `maxTriangles` | number | 500,000 | 1 | 50,000 - 2,000,000 |
| `maxVertices` | number | 1,000,000 | 1 | 100,000 - 4,000,000 |
| `maxProgramSwitches` | number | 100 | 1 | 20 - 200 |
| `maxFrameTimeMs` | number | 16.67 | 1 | 6.94 - 33.33 |
| `maxFrameTimeVariance` | number | 10 | 0 | 2 - 20 |
| `minFps` | number | 30 | 1 | 30 - 144 |
| `min1PercentLowFps` | number | 20 | 1 | 15 - 60 |
| `maxTextures` | number | 100 | 1 | 20 - 500 |
| `maxTextureMemory` | bytes | 256 MB | 1 | 64 MB - 1 GB |
| `maxGeometryMemory` | bytes | 128 MB | 1 | 32 MB - 512 MB |
| `maxGpuMemory` | bytes | 512 MB | 1 | 128 MB - 2 GB |
| `maxSkinnedMeshes` | number | 20 | 1 | 5 - 50 |
| `maxBones` | number | 500 | 1 | 100 - 2000 |
| `maxLights` | number | 10 | 1 | 4 - 20 |
| `maxShadowLights` | number | 4 | 0 | 1 - 8 |
| `maxTransparentObjects` | number | 50 | 1 | 10 - 200 |

## Type Definitions

```typescript
import type { RulesConfig } from '@3lens/core';

interface RulesConfig {
  maxDrawCalls?: number;
  maxTriangles?: number;
  maxFrameTimeMs?: number;
  maxTextures?: number;
  maxTextureMemory?: number;
  maxGeometryMemory?: number;
  maxGpuMemory?: number;
  maxVertices?: number;
  maxSkinnedMeshes?: number;
  maxBones?: number;
  maxLights?: number;
  maxShadowLights?: number;
  maxTransparentObjects?: number;
  maxProgramSwitches?: number;
  minFps?: number;
  min1PercentLowFps?: number;
  maxFrameTimeVariance?: number;
  custom?: CustomRule[];
}
```

## Related

- [ProbeConfig](./probe-config) - Main configuration interface
- [SamplingConfig](./sampling-config) - Data collection configuration
- [Custom Rules](./custom-rules) - Create custom performance rules
- [Rule Violations](./rule-violations) - Handle threshold violations
