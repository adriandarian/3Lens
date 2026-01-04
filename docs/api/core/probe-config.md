# ProbeConfig Interface

The `ProbeConfig` interface is the main configuration object for creating a DevtoolProbe. It controls all aspects of the probe's behavior, from performance thresholds to sampling rates.

## Overview

```typescript
import { createProbe, type ProbeConfig } from '@3lens/core';

const config: ProbeConfig = {
  appName: 'My 3D Application',
  env: 'development',
  debug: true,
  sampling: {
    frameStats: 'every-frame',
    snapshots: 'on-change',
    gpuTiming: true,
    resourceTracking: true,
  },
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 250000,
    maxFrameTimeMs: 16.67,
  },
  tags: {
    team: 'graphics',
    feature: 'editor',
  },
};

const probe = createProbe(config);
```

## Type Definition

```typescript
interface ProbeConfig {
  /**
   * Application name for identification
   */
  appName: string;

  /**
   * Environment identifier
   * @default 'development'
   */
  env?: 'development' | 'staging' | 'production' | string;

  /**
   * Sampling configuration
   */
  sampling?: SamplingConfig;

  /**
   * Performance rules and thresholds
   */
  rules?: RulesConfig;

  /**
   * Custom tags for organization
   */
  tags?: Record<string, string>;

  /**
   * Enable verbose logging
   * @default false
   */
  debug?: boolean;
}
```

## Properties Reference

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `appName` | `string` | Unique identifier for your application. Used in logging, session tracking, and UI display. |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `env` | `string` | `'development'` | Environment identifier. Affects default behaviors and logging verbosity. |
| `sampling` | `SamplingConfig` | See [Sampling Options](./sampling-config) | Controls data collection rates and methods. |
| `rules` | `RulesConfig` | See [Performance Thresholds](./performance-thresholds) | Performance thresholds and custom rules. |
| `tags` | `Record<string, string>` | `{}` | Custom metadata tags for filtering and organization. |
| `debug` | `boolean` | `false` | Enable verbose console logging for troubleshooting. |

## Properties in Detail

### appName

The `appName` property uniquely identifies your application. It appears in:

- Console log prefixes
- Session recordings
- Multi-app debugging scenarios
- Export filenames

```typescript
const config: ProbeConfig = {
  appName: 'Product Configurator v2.1',
  // ...
};
```

::: tip Naming Convention
Use descriptive names with version identifiers for production applications to make debugging easier across deployments.
:::

### env

The `env` property indicates the deployment environment. While you can use any string, the predefined values enable special behaviors:

| Environment | Behavior |
|-------------|----------|
| `'development'` | Maximum verbosity, all features enabled, relaxed thresholds |
| `'staging'` | Production-like thresholds, full logging |
| `'production'` | Minimal overhead, error-only logging, strict thresholds |

```typescript
const config: ProbeConfig = {
  appName: 'MyApp',
  env: process.env.NODE_ENV || 'development',
};
```

### sampling

Controls how and when data is collected. See [SamplingConfig](./sampling-config) for full documentation.

```typescript
const config: ProbeConfig = {
  appName: 'MyApp',
  sampling: {
    frameStats: 'every-frame',   // Collect every frame
    snapshots: 'on-change',       // Snapshot when scene changes
    gpuTiming: true,              // Measure GPU time
    resourceTracking: true,       // Track resource lifecycle
  },
};
```

### rules

Defines performance thresholds and custom validation rules. See [RulesConfig](./performance-thresholds) for full documentation.

```typescript
const config: ProbeConfig = {
  appName: 'MyApp',
  rules: {
    maxDrawCalls: 1000,
    maxTriangles: 500000,
    maxFrameTimeMs: 16.67, // 60 FPS
    custom: [
      {
        id: 'no-unoptimized-textures',
        name: 'Unoptimized Textures',
        check: (stats) => ({
          passed: stats.memory?.textures <= 50,
          message: 'Too many textures loaded',
          severity: 'warning',
        }),
      },
    ],
  },
};
```

### tags

Custom key-value pairs for organizing and filtering metrics. Tags are included in exports and can be used for filtering in the UI.

```typescript
const config: ProbeConfig = {
  appName: 'MyApp',
  tags: {
    team: 'rendering',
    feature: 'product-viewer',
    customer: 'acme-corp',
    buildId: process.env.BUILD_ID || 'local',
  },
};
```

### debug

When enabled, the probe outputs detailed information to the console:

```typescript
const config: ProbeConfig = {
  appName: 'MyApp',
  debug: true, // Enable verbose logging
};
```

Debug output includes:
- Configuration validation results
- Renderer attachment events
- Scene observation start/stop
- Rule violation details
- Memory tracking events
- Plugin lifecycle events

::: warning Performance Impact
Debug mode adds console logging overhead. Disable in production for optimal performance.
:::

## Configuration Examples

### Minimal Configuration

```typescript
const probe = createProbe({
  appName: 'My Three.js App',
});
```

### Development Configuration

```typescript
const probe = createProbe({
  appName: 'My Editor',
  env: 'development',
  debug: true,
  sampling: {
    frameStats: 'every-frame',
    snapshots: 'on-change',
    gpuTiming: true,
    resourceTracking: true,
  },
  rules: {
    // Relaxed thresholds for development
    maxDrawCalls: 2000,
    maxTriangles: 1000000,
    maxFrameTimeMs: 33.33, // 30 FPS minimum
  },
});
```

### Production Configuration

```typescript
const probe = createProbe({
  appName: 'ProductViewer',
  env: 'production',
  debug: false,
  sampling: {
    frameStats: 10,          // Every 10th frame
    snapshots: 'manual',     // Manual only
    gpuTiming: false,        // Disable GPU timing
    resourceTracking: false, // Disable lifecycle tracking
  },
  rules: {
    // Strict production thresholds
    maxDrawCalls: 500,
    maxTriangles: 250000,
    maxFrameTimeMs: 16.67, // 60 FPS target
    minFps: 30,            // Alert below 30 FPS
  },
});
```

### CI/Testing Configuration

```typescript
const probe = createProbe({
  appName: 'CI-Test-Runner',
  env: 'staging',
  sampling: {
    frameStats: 'every-frame',
    snapshots: 'every-frame', // Capture every frame for validation
    gpuTiming: false,         // May not work in headless
    resourceTracking: true,
  },
  rules: {
    // Zero-tolerance for CI
    maxDrawCalls: 100,
    maxTriangles: 50000,
    maxFrameTimeMs: 10, // Very strict
  },
  tags: {
    ci: 'true',
    commit: process.env.GIT_SHA || 'unknown',
  },
});
```

## Validation

3Lens validates configuration at creation time. Invalid configurations produce warnings or errors:

```typescript
import { ConfigLoader } from '@3lens/core';

const config = {
  appName: 'MyApp',
  rules: {
    maxDrawCalls: -100, // Invalid: negative value
  },
};

const validation = ConfigLoader.validateConfig(config);
console.log(validation);
// {
//   valid: true,
//   errors: [],
//   warnings: ['rules.maxDrawCalls should be positive']
// }
```

### Validation Rules

| Field | Validation |
|-------|------------|
| `appName` | Required, must be a non-empty string |
| `env` | Optional, should be a string |
| `debug` | Optional, should be a boolean |
| `sampling.frameStats` | Must be `'every-frame'`, `'on-demand'`, or a positive number |
| `sampling.snapshots` | Must be `'manual'`, `'on-change'`, or `'every-frame'` |
| `rules.*` | Numeric rules must be positive numbers |
| `rules.custom[].id` | Required, must be a string |
| `rules.custom[].name` | Required, must be a string |
| `rules.custom[].check` | Required, must be a function |

## Runtime Updates

Some configuration can be updated at runtime:

```typescript
const probe = createProbe({ appName: 'MyApp' });

// Update thresholds dynamically
probe.updateThresholds({
  maxDrawCalls: 2000,
  maxTriangles: 750000,
});

// Add a custom rule at runtime
probe.addCustomRule({
  id: 'dynamic-rule',
  name: 'Dynamic Memory Check',
  check: (stats) => ({
    passed: (stats.memory?.totalGpuMemory ?? 0) < 256 * 1024 * 1024,
    severity: 'warning',
  }),
});
```

## Type Imports

```typescript
import type {
  ProbeConfig,
  SamplingConfig,
  RulesConfig,
  CustomRule,
  RuleResult,
} from '@3lens/core';
```

## Related

- [SamplingConfig](./sampling-config) - Detailed sampling options
- [Performance Thresholds](./performance-thresholds) - Default thresholds and rules
- [Custom Rules](./custom-rules) - Creating custom validation rules
- [Config File Loading](./config-file-loading) - External configuration files
- [createProbe()](./create-probe) - Factory function reference
