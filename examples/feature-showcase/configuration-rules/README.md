# Configuration Rules Example

Demonstrates the 3Lens configuration and rules system for performance monitoring.

## Overview

This example showcases:

- **Performance Thresholds**: Built-in limits for draw calls, triangles, FPS, etc.
- **Custom Rules**: User-defined validation functions
- **Violation Tracking**: Real-time monitoring with callbacks
- **Runtime Updates**: Change thresholds without restarting
- **Config Export**: Generate configuration files

## Running the Demo

```bash
# From repository root
pnpm install
pnpm --filter configuration-rules dev
```

## Features

### Built-in Thresholds

3Lens provides default thresholds for common performance metrics:

```typescript
const DEFAULT_THRESHOLDS = {
  maxDrawCalls: 1000,
  maxTriangles: 500000,
  maxFrameTimeMs: 16.67,  // 60 FPS
  maxTextures: 100,
  maxTextureMemory: 256 * 1024 * 1024,  // 256 MB
  maxGeometryMemory: 128 * 1024 * 1024, // 128 MB
  maxGpuMemory: 512 * 1024 * 1024,      // 512 MB
  maxLights: 10,
  maxShadowLights: 4,
  minFps: 30,
};
```

### Custom Rules

Define your own validation rules:

```typescript
import { createProbe, type CustomRule } from '@3lens/core';

const myRule: CustomRule = {
  id: 'max-transparent-objects',
  name: 'Max Transparent Objects',
  check: (stats) => {
    const transparent = stats.rendering?.transparentObjects ?? 0;
    const passed = transparent <= 20;
    return {
      passed,
      message: `Transparent objects: ${transparent}`,
      severity: passed ? 'info' : 'warning',
    };
  },
};

const probe = createProbe({ name: 'MyApp' });
probe.addCustomRule(myRule);
```

### Violation Callbacks

Subscribe to rule violations for CI integration:

```typescript
probe.onViolation((violation) => {
  console.error(`[${violation.severity}] ${violation.ruleName}: ${violation.message}`);
  
  // Send to monitoring service
  if (violation.severity === 'error') {
    analytics.track('performance_violation', violation);
  }
});
```

### Runtime Threshold Updates

Adjust thresholds without restarting:

```typescript
// Set stricter limits for mobile
if (isMobile) {
  probe.updateThresholds({
    maxDrawCalls: 200,
    maxTriangles: 100000,
    maxTextures: 50,
  });
}
```

### Configuration File

Create a `3lens.config.js` for project-wide settings:

```javascript
// 3lens.config.js
export default {
  appName: 'My3DApp',
  env: 'development',
  
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 250000,
    maxFrameTimeMs: 16.67,
    maxTextures: 75,
    maxLights: 8,
    minFps: 45,
    
    custom: [
      {
        id: 'no-huge-textures',
        name: 'No Huge Textures',
        check: (stats) => ({
          passed: stats.memory?.textureMemory < 128 * 1024 * 1024,
          severity: 'warning',
        }),
      },
    ],
  },
  
  sampling: {
    frameStats: 'every-frame',
    snapshots: 'on-change',
    gpuTiming: true,
    resourceTracking: true,
  },
};
```

## Demo Controls

### Scene Complexity

| Button | Action |
|--------|--------|
| Add 50 Objects | Increases draw calls and triangles |
| Add Heavy Textures | Increases GPU memory usage |
| Add 5 Lights | Triggers light count violations |
| Reset Scene | Removes all added content |

### Threshold Controls

Adjust and apply custom thresholds in real-time:
- Max Draw Calls
- Max Triangles  
- Max Lights
- Min FPS

### Custom Rules

This example includes 3 custom rules:
1. **No Unnamed Objects** - All meshes should have names
2. **Shadow Light Ratio** - Shadow lights ≤50% of total
3. **Memory Efficiency** - GPU memory under 100MB

## Violation Severity Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| `info` | Informational | Metrics within expected range |
| `warning` | Potential issue | Approaching limits |
| `error` | Critical | Significantly over limits |

## API Reference

### Probe Methods

```typescript
// Threshold management
probe.updateThresholds(thresholds: Partial<RulesConfig>): void
probe.getThresholds(): Required<RulesConfig>

// Custom rules
probe.addCustomRule(rule: CustomRule): void
probe.removeCustomRule(ruleId: string): boolean

// Violations
probe.onViolation(callback: ViolationCallback): () => void
probe.getRecentViolations(): RuleViolation[]
probe.getViolationsBySeverity(severity): RuleViolation[]
probe.getViolationSummary(): { errors, warnings, info, total }
probe.clearViolations(): void

// Configuration
probe.generateConfigFile(): string
probe.exportConfig(): ProbeConfig
```

### RulesConfig Interface

```typescript
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

### CustomRule Interface

```typescript
interface CustomRule {
  id: string;
  name: string;
  check: (stats: FrameStats) => RuleResult;
}

interface RuleResult {
  passed: boolean;
  message?: string;
  severity?: 'info' | 'warning' | 'error';
}
```

## Files Structure

```
configuration-rules/
├── src/
│   └── main.ts          # Main application with:
│                        # - Scene setup
│                        # - Custom rules
│                        # - Probe configuration
│                        # - UI controls
├── index.html           # Control panel UI
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## CI Integration Example

```typescript
// In your test setup
import { createProbe } from '@3lens/core';

const probe = createProbe({
  name: 'PerformanceTest',
  rules: {
    maxTriangles: 100000,
    maxDrawCalls: 200,
    minFps: 30,
  },
});

// Collect violations during test
const violations: RuleViolation[] = [];
probe.onViolation(v => violations.push(v));

// After test
afterAll(() => {
  const errors = violations.filter(v => v.severity === 'error');
  if (errors.length > 0) {
    console.error('Performance violations:', errors);
    process.exit(1);
  }
});
```

## Related Examples

- [Performance Debugging](../../debugging-profiling/performance-debugging/)
- [Large Scene Optimization](../../debugging-profiling/large-scene-optimization/)
- [Memory Leak Detection](../../debugging-profiling/memory-leak-detection/)
