# Configuration API Reference

This document describes all configuration options available when creating a DevtoolProbe instance.

## Table of Contents

- [ProbeConfig](#probeconfig)
- [SamplingConfig](#samplingconfig)
- [RulesConfig](#rulesconfig)
- [Custom Rules](#custom-rules)
- [Environment-Based Configuration](#environment-based-configuration)
- [Examples](#examples)

---

## ProbeConfig

The main configuration object passed to `createProbe()`.

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({
  appName: 'My Three.js App',
  env: 'development',
  debug: false,
  sampling: { /* ... */ },
  rules: { /* ... */ },
  tags: ['rendering', 'game'],
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appName` | `string` | `undefined` | Application name for identification in UI |
| `env` | `'development' \| 'production' \| 'test'` | `'development'` | Environment setting |
| `debug` | `boolean` | `false` | Enable debug logging |
| `sampling` | `SamplingConfig` | See below | Configure data collection rates |
| `rules` | `RulesConfig` | See below | Performance thresholds and custom rules |
| `tags` | `string[]` | `[]` | Custom tags for categorization |

---

## SamplingConfig

Controls how frequently the probe collects data.

```typescript
const probe = createProbe({
  appName: 'My App',
  sampling: {
    frameStats: 16,      // Collect stats every 16ms (~60fps)
    snapshots: 1000,     // Scene snapshots every 1000ms
    gpuTiming: true,     // Enable GPU timing
    resourceTracking: true, // Enable resource lifecycle tracking
  },
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `frameStats` | `number` | `16` | Frame stats collection interval (ms) |
| `snapshots` | `number` | `1000` | Scene snapshot interval (ms) |
| `gpuTiming` | `boolean` | `false` | Enable GPU timing queries (WebGL 2 / WebGPU) |
| `resourceTracking` | `boolean` | `false` | Enable resource lifecycle tracking |

### Performance Considerations

- Lower `frameStats` values increase precision but also increase overhead
- Set `snapshots` higher for complex scenes to reduce performance impact
- `gpuTiming` may not be available on all devices/browsers
- `resourceTracking` adds memory overhead but helps detect leaks

---

## RulesConfig

Performance threshold rules that trigger warnings when exceeded.

```typescript
const probe = createProbe({
  appName: 'My App',
  rules: {
    maxDrawCalls: 1000,
    maxTriangles: 500000,
    maxFrameTimeMs: 16,
    maxActiveTextures: 50,
    // ... more options
  },
});
```

### All Available Rules

| Rule | Type | Default | Description |
|------|------|---------|-------------|
| `maxDrawCalls` | `number` | `1000` | Maximum draw calls per frame |
| `maxTriangles` | `number` | `500000` | Maximum triangles per frame |
| `maxFrameTimeMs` | `number` | `16.67` | Maximum frame time (ms) |
| `maxActiveTextures` | `number` | `32` | Maximum active textures |
| `maxUniformBuffers` | `number` | `16` | Maximum uniform buffer objects |
| `maxVertexAttributes` | `number` | `16` | Maximum vertex attributes |
| `maxTextureSize` | `number` | `4096` | Maximum texture dimension (px) |
| `maxVerticesPerGeometry` | `number` | `100000` | Maximum vertices per geometry |
| `maxSceneObjects` | `number` | `10000` | Maximum objects in scene |
| `maxMaterials` | `number` | `100` | Maximum unique materials |
| `maxGeometries` | `number` | `100` | Maximum unique geometries |
| `maxTextures` | `number` | `100` | Maximum textures in memory |
| `maxBufferAttributes` | `number` | `1000` | Maximum buffer attributes |
| `maxLights` | `number` | `8` | Maximum active lights |
| `maxShadowMaps` | `number` | `4` | Maximum shadow maps |
| `maxRenderTargets` | `number` | `8` | Maximum render targets |
| `maxMemoryMB` | `number` | `512` | Maximum GPU memory (MB) |
| `maxProgramCount` | `number` | `50` | Maximum shader programs |
| `warnOnLargeGeometry` | `boolean` | `true` | Warn on oversized geometries |
| `warnOnUnindexedGeometry` | `boolean` | `true` | Warn on unindexed geometries |
| `customRules` | `CustomRule[]` | `[]` | Custom rule definitions |

### Rule Severity

Rules have implicit severity based on how much they exceed the threshold:

- **Warning**: Exceeded by less than 50%
- **Error**: Exceeded by 50% or more
- **Critical**: Exceeded by 100% or more

---

## Custom Rules

You can define custom rules that evaluate your specific performance criteria.

### CustomRule Interface

```typescript
interface CustomRule {
  id: string;
  name: string;
  description?: string;
  evaluate: (context: RuleContext) => RuleResult;
}

interface RuleContext {
  frameStats: FrameStats;
  sceneStats: SceneStats;
  resourceStats: ResourceStats;
}

interface RuleResult {
  passed: boolean;
  value: number;
  threshold: number;
  message?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}
```

### Custom Rule Examples

```typescript
const probe = createProbe({
  appName: 'My App',
  rules: {
    customRules: [
      // Rule: Warn if FPS drops below 30
      {
        id: 'min-fps',
        name: 'Minimum FPS',
        description: 'Ensure FPS stays above 30',
        evaluate: (ctx) => ({
          passed: ctx.frameStats.fps >= 30,
          value: ctx.frameStats.fps,
          threshold: 30,
          message: ctx.frameStats.fps < 30 
            ? `FPS dropped to ${ctx.frameStats.fps.toFixed(1)}` 
            : undefined,
          severity: ctx.frameStats.fps < 20 ? 'critical' : 'warning',
        }),
      },
      
      // Rule: No more than 50% of triangles from a single object
      {
        id: 'triangle-concentration',
        name: 'Triangle Concentration',
        description: 'No single object should have more than 50% of triangles',
        evaluate: (ctx) => {
          const maxPercent = ctx.sceneStats.maxTrianglePercent;
          return {
            passed: maxPercent <= 50,
            value: maxPercent,
            threshold: 50,
            message: maxPercent > 50 
              ? `Single object has ${maxPercent.toFixed(0)}% of triangles` 
              : undefined,
          };
        },
      },
      
      // Rule: Check texture memory budget
      {
        id: 'texture-memory',
        name: 'Texture Memory Budget',
        evaluate: (ctx) => {
          const textureMB = ctx.resourceStats.textureMemoryMB;
          const budget = 256;
          return {
            passed: textureMB <= budget,
            value: textureMB,
            threshold: budget,
            message: textureMB > budget 
              ? `Texture memory: ${textureMB.toFixed(1)}MB / ${budget}MB` 
              : undefined,
          };
        },
      },
    ],
  },
});
```

---

## Environment-Based Configuration

Different configurations for different environments:

```typescript
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

const probe = createProbe({
  appName: 'My App',
  env: isDevelopment ? 'development' : 'production',
  debug: isDevelopment,
  
  sampling: {
    frameStats: isDevelopment ? 16 : 100,
    snapshots: isDevelopment ? 500 : 5000,
    gpuTiming: isDevelopment,
    resourceTracking: isDevelopment,
  },
  
  rules: isDevelopment ? {
    maxDrawCalls: 500,      // Stricter in dev
    maxTriangles: 200000,
    maxFrameTimeMs: 16,
  } : {
    maxDrawCalls: 1500,     // More lenient in prod
    maxTriangles: 1000000,
    maxFrameTimeMs: 33,
  },
});
```

### Test Environment

For testing, you may want to disable certain features:

```typescript
const probe = createProbe({
  appName: 'My App',
  env: 'test',
  debug: false,
  sampling: {
    frameStats: 0,        // Disable frame stats
    snapshots: 0,         // Disable snapshots
    gpuTiming: false,
    resourceTracking: false,
  },
});
```

---

## Examples

### Minimal Configuration

```typescript
const probe = createProbe({
  appName: 'Simple App',
});
```

### Game Development

```typescript
const probe = createProbe({
  appName: 'My Game',
  env: 'development',
  debug: true,
  sampling: {
    frameStats: 8,         // Higher precision
    snapshots: 500,        // Frequent snapshots
    gpuTiming: true,
    resourceTracking: true,
  },
  rules: {
    maxDrawCalls: 200,     // Mobile-friendly
    maxTriangles: 100000,
    maxFrameTimeMs: 16,    // Target 60fps
    maxLights: 4,
    maxShadowMaps: 2,
    warnOnUnindexedGeometry: true,
  },
  tags: ['game', 'mobile'],
});
```

### Data Visualization

```typescript
const probe = createProbe({
  appName: 'Data Viz App',
  env: 'development',
  sampling: {
    frameStats: 16,
    snapshots: 2000,       // Less frequent
    gpuTiming: false,
    resourceTracking: true,
  },
  rules: {
    maxDrawCalls: 5000,    // Many data points
    maxTriangles: 2000000,
    maxSceneObjects: 50000,
    maxFrameTimeMs: 33,    // 30fps is acceptable
  },
  tags: ['dataviz', 'enterprise'],
});
```

### WebGPU Application

```typescript
const probe = createProbe({
  appName: 'WebGPU App',
  env: 'development',
  debug: true,
  sampling: {
    frameStats: 16,
    snapshots: 1000,
    gpuTiming: true,       // WebGPU has better timing support
    resourceTracking: true,
  },
  rules: {
    maxDrawCalls: 2000,
    maxTriangles: 1000000,
    maxUniformBuffers: 32,
    maxRenderTargets: 16,
  },
});
```

---

## See Also

- [Probe API](./probe-api.md) - Main probe reference
- [Events API](./events-api.md) - Event subscriptions
- [Custom Rules Guide](../guides/CUSTOM-RULES-GUIDE.md) - In-depth custom rules guide
- [Performance Debugging Guide](../guides/PERFORMANCE-DEBUGGING-GUIDE.md) - Performance optimization
