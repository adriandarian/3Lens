# createProbe()

The `createProbe()` factory function is the **primary entry point** for integrating 3Lens into your three.js application. It creates and configures a `DevtoolProbe` instance with sensible defaults.

## Import

```typescript
import { createProbe } from '@3lens/core';
```

## Signature

```typescript
function createProbe(config: ProbeConfig): DevtoolProbe
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | [`ProbeConfig`](#probeconfig) | Configuration options for the probe |

## Returns

Returns a configured [`DevtoolProbe`](./devtool-probe.md) instance.

## Basic Usage

```typescript
import { createProbe } from '@3lens/core';
import * as THREE from 'three';

// Create a probe with minimal configuration
const probe = createProbe({
  appName: 'My Three.js App',
});

// Observe your renderer and scene
probe.observeRenderer(renderer);
probe.observeScene(scene);
```

## Configuration Options

### ProbeConfig

The configuration object accepts the following properties:

```typescript
interface ProbeConfig {
  // Required
  appName: string;

  // Optional
  env?: 'development' | 'staging' | 'production' | string;
  sampling?: SamplingConfig;
  rules?: RulesConfig;
  tags?: Record<string, string>;
  debug?: boolean;
}
```

### Required Options

#### `appName`

- **Type:** `string`
- **Required:** Yes

A human-readable name for your application. This name appears in the 3Lens overlay and browser extension, making it easy to identify which application you're debugging.

```typescript
const probe = createProbe({
  appName: 'Space Shooter Game',
});
```

### Optional Options

#### `env`

- **Type:** `'development' | 'staging' | 'production' | string`
- **Default:** `'development'`

The environment identifier. Useful for conditionally adjusting behavior or filtering in multi-environment setups.

```typescript
const probe = createProbe({
  appName: 'My App',
  env: process.env.NODE_ENV || 'development',
});
```

#### `sampling`

- **Type:** [`SamplingConfig`](#samplingconfig)
- **Default:** See below

Controls how frequently data is collected. See [Sampling Configuration](#sampling-configuration) for details.

#### `rules`

- **Type:** [`RulesConfig`](#rulesconfig)
- **Default:** `undefined`

Performance thresholds that trigger warnings. See [Rules Configuration](#rules-configuration) for details.

#### `tags`

- **Type:** `Record<string, string>`
- **Default:** `undefined`

Custom key-value tags for organization and filtering.

```typescript
const probe = createProbe({
  appName: 'My App',
  tags: {
    team: 'graphics',
    feature: 'character-customization',
  },
});
```

#### `debug`

- **Type:** `boolean`
- **Default:** `false`

Enable verbose console logging for troubleshooting probe issues.

```typescript
const probe = createProbe({
  appName: 'My App',
  debug: true, // Logs internal probe operations
});
```

## Sampling Configuration

The `sampling` option controls data collection frequency:

```typescript
interface SamplingConfig {
  frameStats?: 'every-frame' | 'on-demand' | number;
  snapshots?: 'manual' | 'on-change' | 'every-frame';
  gpuTiming?: boolean;
  resourceTracking?: boolean;
}
```

### `frameStats`

- **Type:** `'every-frame' | 'on-demand' | number`
- **Default:** `'every-frame'`

| Value | Description |
|-------|-------------|
| `'every-frame'` | Collect stats every frame (with adaptive optimization) |
| `'on-demand'` | Only collect when explicitly requested |
| `number` | Collect every N frames (e.g., `5` = every 5th frame) |

```typescript
const probe = createProbe({
  appName: 'My App',
  sampling: {
    frameStats: 2, // Collect every 2nd frame for lower overhead
  },
});
```

### `snapshots`

- **Type:** `'manual' | 'on-change' | 'every-frame'`
- **Default:** `'on-change'`

| Value | Description |
|-------|-------------|
| `'manual'` | Only take snapshots when `takeSnapshot()` is called |
| `'on-change'` | Automatically snapshot when scene graph changes |
| `'every-frame'` | Snapshot every frame (high overhead) |

### `gpuTiming`

- **Type:** `boolean`
- **Default:** `true`

Enable GPU timing queries (WebGL `EXT_disjoint_timer_query` / WebGPU timestamps).

::: warning Browser Support
GPU timing may not be available in all browsers or may be disabled for privacy reasons.
:::

### `resourceTracking`

- **Type:** `boolean`
- **Default:** `true`

Track resource creation and disposal (textures, geometries, materials).

## Rules Configuration

Define performance thresholds to get warnings when exceeded:

```typescript
interface RulesConfig {
  // Draw calls & triangles
  maxDrawCalls?: number;
  maxTriangles?: number;
  maxVertices?: number;

  // Memory
  maxTextures?: number;
  maxTextureMemory?: number;
  maxGeometryMemory?: number;
  maxGpuMemory?: number;

  // Performance
  maxFrameTimeMs?: number;
  minFps?: number;
  min1PercentLowFps?: number;
  maxFrameTimeVariance?: number;

  // Scene complexity
  maxSkinnedMeshes?: number;
  maxBones?: number;
  maxLights?: number;
  maxShadowLights?: number;
  maxTransparentObjects?: number;
  maxProgramSwitches?: number;

  // Custom rules
  custom?: CustomRule[];
}
```

### Example: Mobile Performance Budget

```typescript
const probe = createProbe({
  appName: 'Mobile Game',
  rules: {
    maxDrawCalls: 100,
    maxTriangles: 100000,
    maxTextures: 20,
    maxTextureMemory: 64 * 1024 * 1024, // 64 MB
    minFps: 30,
  },
});
```

### Custom Rules

Define custom validation logic:

```typescript
const probe = createProbe({
  appName: 'My App',
  rules: {
    custom: [
      {
        id: 'no-real-time-shadows-on-mobile',
        name: 'Mobile Shadow Check',
        check: (stats) => {
          const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
          if (isMobile && stats.shadowMapCount > 0) {
            return {
              passed: false,
              message: 'Real-time shadows detected on mobile device',
              severity: 'warning',
            };
          }
          return { passed: true };
        },
      },
    ],
  },
});
```

## Auto-Connection

When running in a browser environment, `createProbe()` automatically establishes a connection to the 3Lens browser extension via `postMessage` transport. This enables:

- Automatic detection by the browser extension
- Zero-configuration extension integration
- Two-way communication for commands and data

```typescript
// The probe auto-connects - no manual setup needed!
const probe = createProbe({ appName: 'My App' });

// The browser extension will automatically discover this probe
```

## Complete Example

```typescript
import { createProbe } from '@3lens/core';
import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Create probe with full configuration
const probe = createProbe({
  appName: 'Production 3D Viewer',
  env: 'production',
  debug: false,
  tags: {
    version: '2.1.0',
    team: 'visualization',
  },
  sampling: {
    frameStats: 'every-frame',
    snapshots: 'on-change',
    gpuTiming: true,
    resourceTracking: true,
  },
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 1000000,
    maxTextureMemory: 256 * 1024 * 1024,
    minFps: 30,
    maxFrameTimeMs: 33,
    custom: [
      {
        id: 'skinned-mesh-limit',
        name: 'Skinned Mesh Limit',
        check: (stats) => ({
          passed: (stats.skinnedMeshCount ?? 0) <= 10,
          message: 'Too many skinned meshes for target hardware',
          severity: 'warning',
        }),
      },
    ],
  },
});

// Connect probe to renderer and scene
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Optional: Enable THREE.js reference for visual features
probe.setThreeReference(THREE);

// Subscribe to performance warnings
probe.onFrameStats((stats) => {
  if (stats.violations?.length) {
    console.warn('Performance violations:', stats.violations);
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Clean up on unmount
window.addEventListener('beforeunload', () => {
  probe.dispose();
});
```

## Best Practices

### 1. Create Once, Early

Create the probe early in your application lifecycle, before loading heavy assets:

```typescript
// ✅ Good - create before asset loading
const probe = createProbe({ appName: 'My App' });
loadAssets().then(() => {
  probe.observeScene(scene);
});

// ❌ Avoid - creating after scene is populated misses initial events
loadAssets().then(() => {
  const probe = createProbe({ appName: 'My App' });
});
```

### 2. Use Environment-Specific Configuration

```typescript
const probe = createProbe({
  appName: 'My App',
  debug: process.env.NODE_ENV === 'development',
  sampling: {
    frameStats: process.env.NODE_ENV === 'production' ? 5 : 'every-frame',
  },
});
```

### 3. Always Dispose

```typescript
// React
useEffect(() => {
  const probe = createProbe({ appName: 'My App' });
  return () => probe.dispose();
}, []);

// Vanilla
window.addEventListener('beforeunload', () => probe.dispose());
```

## Related

- [DevtoolProbe Class](./devtool-probe.md) - Full probe API reference
- [Probe Lifecycle](./probe-lifecycle.md) - Understanding init, connect, dispose
- [ProbeConfig Reference](./probe-config.md) - Complete configuration options
- [Getting Started Guide](/guide/getting-started) - Step-by-step tutorial
