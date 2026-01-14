# Configuration Deep Dive

3Lens is highly configurable, allowing you to tailor the devtools to your project's needs. This guide covers all configuration options and best practices.

## Configuration Overview

Configuration is passed when creating a probe:

```typescript
import { createProbe, ProbeConfig } from '@3lens/core';

const config: ProbeConfig = {
  appName: 'My Game',
  debug: false,
  sampling: { /* ... */ },
  thresholds: { /* ... */ },
  rules: { /* ... */ },
  plugins: [],
};

const probe = createProbe(config);
```

---

## Basic Options

### `appName`

**Type:** `string`  
**Default:** `'3Lens'`

Display name shown in the overlay header. Useful when debugging multiple applications.

```typescript
const probe = createProbe({
  appName: 'Product Configurator v2.1'
});
```

### `debug`

**Type:** `boolean`  
**Default:** `false`

Enables verbose console logging for troubleshooting 3Lens itself.

```typescript
const probe = createProbe({
  debug: true // See detailed logs in console
});
```

::: tip
Enable debug mode temporarily when 3Lens isn't behaving as expected. The logs show exactly what's being observed and sampled.
:::

### `autoConnect`

**Type:** `boolean`  
**Default:** `false`

When true, automatically attempts to connect to the first WebGLRenderer it finds in the window.

```typescript
const probe = createProbe({
  autoConnect: true // Finds and connects to renderer automatically
});
```

::: warning
`autoConnect` is convenient for quick debugging but not recommended for production builds. Explicit connection gives you more control.
:::

---

## Sampling Configuration

Control how frequently 3Lens collects data. Fine-tune this to balance between data granularity and performance overhead.

```typescript
const probe = createProbe({
  sampling: {
    frameInterval: 1,
    historyLength: 120,
    snapshotInterval: 60,
    maxObjectsInSnapshot: 10000,
  }
});
```

### `sampling.frameInterval`

**Type:** `number`  
**Default:** `1`

How many frames to skip between samples. Higher values reduce overhead.

| Value | Behavior | Use Case |
|-------|----------|----------|
| `1` | Every frame | Detailed profiling, smooth graphs |
| `2` | Every other frame | Balanced performance |
| `5` | Every 5th frame | Low overhead monitoring |
| `10+` | Sparse sampling | Background monitoring in production |

```typescript
sampling: {
  frameInterval: 2 // Good balance for most cases
}
```

### `sampling.historyLength`

**Type:** `number`  
**Default:** `120`

Number of samples to keep in the rolling history buffer. Affects memory usage and graph time range.

```typescript
sampling: {
  historyLength: 300 // 5 seconds at 60 FPS
}
```

::: info Memory Impact
Each sample is approximately 2-4 KB. At 120 samples, expect ~400 KB memory usage for history.
:::

### `sampling.snapshotInterval`

**Type:** `number`  
**Default:** `60`

Frames between full scene graph snapshots. Full snapshots are expensive but necessary for detecting hierarchy changes.

```typescript
sampling: {
  snapshotInterval: 120 // Full snapshot every 2 seconds at 60 FPS
}
```

### `sampling.maxObjectsInSnapshot`

**Type:** `number`  
**Default:** `10000`

Maximum objects to include in a scene snapshot. Prevents performance issues with massive scenes.

```typescript
sampling: {
  maxObjectsInSnapshot: 50000 // For very large scenes
}
```

---

## Performance Thresholds

Configure warning thresholds for performance metrics. When values exceed these thresholds, they're highlighted in the UI.

```typescript
const probe = createProbe({
  thresholds: {
    fps: { warning: 30, critical: 15 },
    drawCalls: { warning: 100, critical: 300 },
    triangles: { warning: 1_000_000, critical: 5_000_000 },
    geometryMemory: { warning: 100_000_000, critical: 500_000_000 },
    textureMemory: { warning: 200_000_000, critical: 1_000_000_000 },
  }
});
```

### Threshold Structure

Each threshold has `warning` and `critical` levels:

```typescript
interface Threshold {
  warning: number;   // Yellow indicator
  critical: number;  // Red indicator
}
```

### Available Thresholds

| Threshold | Default Warning | Default Critical | Unit |
|-----------|----------------|------------------|------|
| `fps` | 30 | 15 | frames/second |
| `frameTime` | 33.3 | 66.7 | milliseconds |
| `drawCalls` | 100 | 300 | count |
| `triangles` | 1M | 5M | count |
| `geometryMemory` | 100 MB | 500 MB | bytes |
| `textureMemory` | 200 MB | 1 GB | bytes |
| `programs` | 50 | 100 | count (shader programs) |
| `textures` | 100 | 300 | count |
| `geometries` | 500 | 1000 | count |

### Platform-Specific Thresholds

Adjust thresholds based on target platform:

```typescript
const isMobile = /Android|iPhone|iPad/.test(navigator.userAgent);

const probe = createProbe({
  thresholds: isMobile ? {
    fps: { warning: 25, critical: 15 },
    drawCalls: { warning: 50, critical: 100 },
    triangles: { warning: 300_000, critical: 1_000_000 },
  } : {
    // Desktop defaults
    fps: { warning: 45, critical: 30 },
    drawCalls: { warning: 200, critical: 500 },
    triangles: { warning: 2_000_000, critical: 10_000_000 },
  }
});
```

---

## Rules Configuration

Rules run automatic checks on your scene and flag potential issues. 3Lens includes built-in rules, and you can add custom ones.

```typescript
const probe = createProbe({
  rules: {
    enabled: true,
    builtIn: {
      missingMaterials: true,
      duplicateGeometries: true,
      largeTextures: true,
      deepHierarchy: true,
      orphanedObjects: true,
    },
    custom: [
      // Your custom rules
    ]
  }
});
```

### Built-in Rules

#### `missingMaterials`
**Default:** `true`  
Flags meshes with null or undefined materials.

#### `duplicateGeometries`
**Default:** `true`  
Detects multiple meshes using identical geometry that could use instancing.

#### `largeTextures`
**Default:** `true`  
Warns about textures larger than 2048×2048.

#### `deepHierarchy`
**Default:** `true`  
Flags object hierarchies deeper than 10 levels.

#### `orphanedObjects`
**Default:** `true`  
Detects objects not connected to any scene.

#### `unindexedGeometry`
**Default:** `true`  
Flags geometry without index buffer (less efficient rendering).

#### `unnecessaryUpdates`
**Default:** `false`  
Tracks matrices being updated every frame unnecessarily.

### Custom Rules

Create project-specific validation rules:

```typescript
import { createRule, RuleSeverity } from '@3lens/core';

const noEmissiveWithoutMap = createRule({
  id: 'no-emissive-without-map',
  name: 'Emissive Without Map',
  description: 'Warns when emissive color is set without an emissive map',
  severity: RuleSeverity.WARNING,
  
  check(object, context) {
    if (object.type !== 'Mesh') return null;
    
    const material = object.material;
    if (!material || material.type !== 'MeshStandardMaterial') return null;
    
    if (material.emissive?.getHex() !== 0x000000 && !material.emissiveMap) {
      return {
        message: `Mesh "${object.name}" has emissive color but no emissive map`,
        object,
        suggestion: 'Consider adding an emissive map for better visual quality',
      };
    }
    
    return null;
  }
});

const probe = createProbe({
  rules: {
    custom: [noEmissiveWithoutMap]
  }
});
```

### Rule Severity Levels

```typescript
enum RuleSeverity {
  INFO = 'info',       // Gray - Informational
  WARNING = 'warning', // Yellow - Should investigate
  ERROR = 'error',     // Red - Likely a problem
  CRITICAL = 'critical' // Red + badge - Must fix
}
```

---

## Plugins

Extend 3Lens with plugins for additional functionality.

```typescript
import { createProbe } from '@3lens/core';
import { physicsPlugin } from '@3lens/plugin-physics';
import { postProcessingPlugin } from '@3lens/plugin-postprocessing';

const probe = createProbe({
  plugins: [
    physicsPlugin({ /* physics config */ }),
    postProcessingPlugin({ /* pp config */ }),
  ]
});
```

### Plugin Interface

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  
  // Lifecycle
  onInit?(probe: Probe): void | Promise<void>;
  onDestroy?(probe: Probe): void;
  
  // Data collection
  onBeforeFrame?(context: FrameContext): void;
  onAfterFrame?(context: FrameContext): void;
  
  // UI extension
  panels?: PanelDefinition[];
  inspectorSections?: InspectorSection[];
}
```

### Creating a Plugin

```typescript
import { definePlugin } from '@3lens/core';

export const myPlugin = definePlugin({
  id: 'my-plugin',
  name: 'My Custom Plugin',
  version: '1.0.0',
  
  onInit(probe) {
    console.log('Plugin initialized!');
    
    // Subscribe to probe events
    probe.on('frame', (stats) => {
      // Custom analysis
    });
  },
  
  panels: [
    {
      id: 'my-panel',
      title: 'My Panel',
      render: (container, data) => {
        container.innerHTML = `<div>Custom content</div>`;
      }
    }
  ]
});
```

---

## Environment-Specific Configuration

### Development vs Production

Use environment variables to configure differently:

```typescript
const isDev = process.env.NODE_ENV === 'development';

const probe = createProbe({
  debug: isDev,
  sampling: {
    frameInterval: isDev ? 1 : 5,
    historyLength: isDev ? 300 : 60,
  },
  rules: {
    enabled: isDev, // Only run rules in development
  }
});
```

### Conditional Loading

Only load 3Lens in development:

```typescript
async function initDevtools() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const { createProbe } = await import('@3lens/core');
  const { bootstrapOverlay } = await import('@3lens/overlay');
  
  const probe = createProbe();
  probe.observeRenderer(renderer);
  probe.observeScene(scene);
  bootstrapOverlay(probe);
  
  return probe;
}
```

### Tree-Shaking for Production

Ensure 3Lens is completely removed from production builds:

```typescript
// devtools.ts
export function setupDevtools(renderer, scene) {
  if (import.meta.env.DEV) {
    import('@3lens/core').then(({ createProbe }) => {
      import('@3lens/overlay').then(({ bootstrapOverlay }) => {
        const probe = createProbe();
        probe.observeRenderer(renderer);
        probe.observeScene(scene);
        bootstrapOverlay(probe);
      });
    });
  }
}
```

---

## Configuration Recipes

### Minimal Overhead (Production Monitoring)

```typescript
const probe = createProbe({
  sampling: {
    frameInterval: 30, // Sample twice per second at 60 FPS
    historyLength: 20,
    snapshotInterval: 300, // Snapshot every 5 seconds
  },
  rules: {
    enabled: false,
  }
});
```

### Maximum Detail (Deep Profiling)

```typescript
const probe = createProbe({
  debug: true,
  sampling: {
    frameInterval: 1,
    historyLength: 600, // 10 seconds
    snapshotInterval: 30,
    maxObjectsInSnapshot: 50000,
  },
  rules: {
    enabled: true,
    builtIn: {
      // Enable all built-in rules
      missingMaterials: true,
      duplicateGeometries: true,
      largeTextures: true,
      deepHierarchy: true,
      orphanedObjects: true,
      unindexedGeometry: true,
      unnecessaryUpdates: true,
    }
  }
});
```

### Mobile-Optimized

```typescript
const probe = createProbe({
  sampling: {
    frameInterval: 3,
    historyLength: 60,
    snapshotInterval: 120,
    maxObjectsInSnapshot: 2000,
  },
  thresholds: {
    fps: { warning: 25, critical: 15 },
    drawCalls: { warning: 50, critical: 100 },
    triangles: { warning: 200_000, critical: 500_000 },
    textureMemory: { warning: 50_000_000, critical: 150_000_000 },
  }
});
```

### VR/XR Applications

```typescript
const probe = createProbe({
  appName: 'VR Experience',
  sampling: {
    frameInterval: 1, // Need precise timing for VR
    historyLength: 180, // 2 seconds at 90 FPS
  },
  thresholds: {
    fps: { warning: 72, critical: 60 }, // VR needs high framerates
    frameTime: { warning: 11, critical: 14 }, // Under 11ms for 90 FPS
    drawCalls: { warning: 100, critical: 200 }, // Stereo doubles calls
  }
});
```

---

## Runtime Configuration

Some settings can be changed after initialization:

```typescript
const probe = createProbe(initialConfig);

// Update thresholds at runtime
probe.setThresholds({
  fps: { warning: 45, critical: 25 }
});

// Toggle rules
probe.setRulesEnabled(false);

// Change sampling
probe.setSampling({
  frameInterval: 5
});
```

---

## TypeScript Support

Full TypeScript definitions are included. Import types for custom configurations:

```typescript
import type { 
  ProbeConfig, 
  SamplingConfig, 
  ThresholdConfig,
  RuleConfig,
  Plugin,
  CustomRule 
} from '@3lens/core';

const config: ProbeConfig = {
  // Full IntelliSense support
};
```

---

## Related

- [Getting Started](/guide/getting-started) - Basic setup guide
- [Plugin Development](/guides/PLUGIN-DEVELOPMENT) - Create custom plugins
- [API Reference](/api/) - Complete API documentation
