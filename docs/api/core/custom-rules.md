# Custom Rules System

3Lens allows you to define custom performance rules that run alongside built-in threshold checks. Custom rules can implement complex validation logic, domain-specific constraints, or project-specific requirements.

## Overview

```typescript
import { createProbe, type CustomRule } from '@3lens/core';

const noLargeTextures: CustomRule = {
  id: 'no-large-textures',
  name: 'Large Texture Check',
  check: (stats) => ({
    passed: (stats.memory?.textureMemory ?? 0) < 100 * 1024 * 1024,
    message: 'Total texture memory exceeds 100MB',
    severity: 'warning',
  }),
};

const probe = createProbe({
  appName: 'MyApp',
  rules: {
    custom: [noLargeTextures],
  },
});
```

## Type Definitions

### CustomRule

```typescript
interface CustomRule {
  /**
   * Unique identifier for the rule
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Check function that evaluates frame stats
   */
  check: (stats: FrameStats) => RuleResult;
}
```

### RuleResult

```typescript
interface RuleResult {
  /**
   * Whether the rule passed
   */
  passed: boolean;

  /**
   * Optional message describing the result
   */
  message?: string;

  /**
   * Severity level for violations
   * @default 'warning'
   */
  severity?: 'info' | 'warning' | 'error';
}
```

## Creating Custom Rules

### Basic Rule

```typescript
const maxObjectsRule: CustomRule = {
  id: 'max-scene-objects',
  name: 'Scene Object Limit',
  check: (stats) => {
    const objectCount = stats.rendering?.objects ?? 0;
    return {
      passed: objectCount <= 1000,
      message: `Scene has ${objectCount} objects (max: 1000)`,
      severity: objectCount > 1500 ? 'error' : 'warning',
    };
  },
};
```

### Rule with Context

```typescript
// Rule that tracks state across frames
function createFrameTimeStabilityRule(windowSize: number = 60): CustomRule {
  const frameTimes: number[] = [];

  return {
    id: 'frame-time-stability',
    name: 'Frame Time Stability',
    check: (stats) => {
      frameTimes.push(stats.cpuTimeMs);
      if (frameTimes.length > windowSize) {
        frameTimes.shift();
      }

      if (frameTimes.length < windowSize) {
        return { passed: true, message: 'Collecting data...' };
      }

      const avg = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
      const variance = frameTimes.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / frameTimes.length;
      const stdDev = Math.sqrt(variance);

      return {
        passed: stdDev < 5,
        message: `Frame time std dev: ${stdDev.toFixed(2)}ms`,
        severity: stdDev > 10 ? 'error' : 'warning',
      };
    },
  };
}
```

### Domain-Specific Rules

```typescript
// E-commerce product viewer rule
const productViewerRules: CustomRule[] = [
  {
    id: 'product-load-time',
    name: 'Product Load Performance',
    check: (stats) => ({
      passed: stats.cpuTimeMs < 8.33, // 120 FPS for smooth rotation
      message: `Frame time ${stats.cpuTimeMs.toFixed(2)}ms exceeds 8.33ms target`,
      severity: 'warning',
    }),
  },
  {
    id: 'texture-resolution',
    name: 'Texture Resolution Check',
    check: (stats) => {
      const textureMB = (stats.memory?.textureMemory ?? 0) / (1024 * 1024);
      return {
        passed: textureMB < 50,
        message: `Texture memory: ${textureMB.toFixed(1)}MB (max: 50MB for mobile)`,
        severity: textureMB > 100 ? 'error' : 'warning',
      };
    },
  },
];
```

```typescript
// Game development rules
const gameRules: CustomRule[] = [
  {
    id: 'physics-budget',
    name: 'Physics Budget',
    check: (stats) => {
      // Assuming physics time is tracked in custom metrics
      const physicsTime = stats.custom?.physicsTimeMs ?? 0;
      return {
        passed: physicsTime < 4, // 4ms budget for physics
        message: `Physics: ${physicsTime.toFixed(2)}ms / 4ms budget`,
        severity: physicsTime > 8 ? 'error' : 'warning',
      };
    },
  },
  {
    id: 'draw-call-budget',
    name: 'Draw Call Budget',
    check: (stats) => ({
      passed: stats.drawCalls < 200,
      message: `Draw calls: ${stats.drawCalls} / 200 budget`,
      severity: stats.drawCalls > 300 ? 'error' : 'warning',
    }),
  },
];
```

## Rule Patterns

### Threshold with Hysteresis

Prevent rapid toggling between pass/fail states:

```typescript
function createHysteresisRule(
  id: string,
  name: string,
  getValue: (stats: FrameStats) => number,
  lowThreshold: number,
  highThreshold: number
): CustomRule {
  let isViolating = false;

  return {
    id,
    name,
    check: (stats) => {
      const value = getValue(stats);
      
      // Only change state when crossing the opposite threshold
      if (isViolating && value < lowThreshold) {
        isViolating = false;
      } else if (!isViolating && value > highThreshold) {
        isViolating = true;
      }

      return {
        passed: !isViolating,
        message: `Value: ${value} (recover at ${lowThreshold}, violate at ${highThreshold})`,
        severity: 'warning',
      };
    },
  };
}

// Usage: Only trigger when FPS drops below 25, recover when above 35
const fpsRule = createHysteresisRule(
  'fps-hysteresis',
  'FPS Stability',
  (stats) => 1000 / stats.cpuTimeMs,
  35, // Low threshold (recover)
  25  // High threshold (violate when FPS below this)
);
```

### Rolling Average

Smooth out frame-to-frame variations:

```typescript
function createRollingAverageRule(
  id: string,
  name: string,
  getValue: (stats: FrameStats) => number,
  threshold: number,
  windowSize: number = 30
): CustomRule {
  const values: number[] = [];

  return {
    id,
    name,
    check: (stats) => {
      values.push(getValue(stats));
      if (values.length > windowSize) values.shift();

      const average = values.reduce((a, b) => a + b, 0) / values.length;
      
      return {
        passed: average <= threshold,
        message: `Average: ${average.toFixed(2)} (threshold: ${threshold})`,
        severity: average > threshold * 1.5 ? 'error' : 'warning',
      };
    },
  };
}
```

### Spike Detection

Detect sudden performance spikes:

```typescript
function createSpikeDetectionRule(
  id: string,
  name: string,
  getValue: (stats: FrameStats) => number,
  spikeMultiplier: number = 3
): CustomRule {
  const values: number[] = [];
  const windowSize = 60;

  return {
    id,
    name,
    check: (stats) => {
      const current = getValue(stats);
      values.push(current);
      if (values.length > windowSize) values.shift();

      if (values.length < 10) {
        return { passed: true, message: 'Collecting baseline...' };
      }

      const baseline = values.slice(0, -1);
      const average = baseline.reduce((a, b) => a + b, 0) / baseline.length;
      const isSpike = current > average * spikeMultiplier;

      return {
        passed: !isSpike,
        message: isSpike 
          ? `Spike detected: ${current.toFixed(2)} vs avg ${average.toFixed(2)}`
          : `Normal: ${current.toFixed(2)} (avg: ${average.toFixed(2)})`,
        severity: 'warning',
      };
    },
  };
}
```

### Composite Rules

Combine multiple conditions:

```typescript
const compositeRule: CustomRule = {
  id: 'mobile-performance',
  name: 'Mobile Performance Budget',
  check: (stats) => {
    const issues: string[] = [];
    
    if (stats.drawCalls > 100) {
      issues.push(`Draw calls: ${stats.drawCalls}/100`);
    }
    if (stats.triangles > 100000) {
      issues.push(`Triangles: ${stats.triangles}/100000`);
    }
    if ((stats.memory?.textureMemory ?? 0) > 64 * 1024 * 1024) {
      issues.push(`Texture memory exceeds 64MB`);
    }
    if (stats.cpuTimeMs > 33.33) {
      issues.push(`Frame time: ${stats.cpuTimeMs.toFixed(2)}ms > 33.33ms`);
    }

    return {
      passed: issues.length === 0,
      message: issues.length > 0 ? issues.join('; ') : 'All checks passed',
      severity: issues.length > 2 ? 'error' : 'warning',
    };
  },
};
```

## Runtime Management

### Adding Rules

```typescript
const probe = createProbe({ appName: 'MyApp' });

// Add a rule after creation
probe.addCustomRule({
  id: 'dynamic-rule',
  name: 'Dynamic Check',
  check: (stats) => ({
    passed: stats.drawCalls < 500,
  }),
});
```

### Removing Rules

```typescript
// Remove by ID
const removed = probe.removeCustomRule('dynamic-rule');
console.log(removed); // true if found and removed
```

### Listing Rules

```typescript
// Get all custom rules
const rules = probe.getCustomRules();
rules.forEach(rule => {
  console.log(`Rule: ${rule.id} - ${rule.name}`);
});
```

## Rule Violations

When a custom rule fails, it generates a violation:

```typescript
probe.onRuleViolation((violation) => {
  if (violation.ruleId === 'my-custom-rule') {
    console.warn(`Custom rule violated: ${violation.message}`);
    sendToMonitoring(violation);
  }
});
```

### Violation Cooldown

By default, each rule has a 1-second cooldown between violations to prevent log spam:

```
Frame 1: Rule fails → Violation fired
Frame 2: Rule fails → Skipped (cooldown)
Frame 3: Rule fails → Skipped (cooldown)
...
Frame 60: Rule fails → Violation fired (cooldown expired)
```

## Best Practices

### 1. Use Unique IDs

```typescript
// Good: Namespaced IDs
const rule: CustomRule = {
  id: 'myapp.rendering.shadow-budget',
  name: 'Shadow Rendering Budget',
  // ...
};

// Bad: Generic IDs that might conflict
const rule: CustomRule = {
  id: 'check',
  name: 'Check',
  // ...
};
```

### 2. Provide Meaningful Messages

```typescript
// Good: Actionable message with context
check: (stats) => ({
  passed: stats.drawCalls < 500,
  message: `Draw calls: ${stats.drawCalls}/500. Consider using instancing or geometry merging.`,
})

// Bad: Vague message
check: (stats) => ({
  passed: stats.drawCalls < 500,
  message: 'Too many draw calls',
})
```

### 3. Handle Missing Data

```typescript
check: (stats) => {
  // Always handle potentially undefined values
  const textureMemory = stats.memory?.textureMemory ?? 0;
  const textureCount = stats.memory?.textures ?? 0;

  if (textureCount === 0) {
    return { passed: true, message: 'No textures loaded' };
  }

  const avgSize = textureMemory / textureCount;
  return {
    passed: avgSize < 10 * 1024 * 1024,
    message: `Average texture size: ${(avgSize / 1024 / 1024).toFixed(1)}MB`,
  };
}
```

### 4. Appropriate Severity

```typescript
check: (stats) => {
  const fps = 1000 / stats.cpuTimeMs;
  
  if (fps >= 60) {
    return { passed: true };
  } else if (fps >= 30) {
    return { passed: false, severity: 'info', message: 'Below 60 FPS' };
  } else if (fps >= 15) {
    return { passed: false, severity: 'warning', message: 'Below 30 FPS' };
  } else {
    return { passed: false, severity: 'error', message: 'Critical: Below 15 FPS' };
  }
}
```

### 5. Performance Considerations

```typescript
// Bad: Expensive operations every frame
check: (stats) => {
  const report = generateDetailedReport(stats); // Expensive!
  return { passed: report.score > 80 };
}

// Good: Cache expensive calculations
const cache = { lastUpdate: 0, result: null };

check: (stats) => {
  const now = performance.now();
  if (now - cache.lastUpdate > 1000) { // Update every second
    cache.result = generateDetailedReport(stats);
    cache.lastUpdate = now;
  }
  return { passed: cache.result.score > 80 };
}
```

## Example: Complete Rule Set

```typescript
import { createProbe, type CustomRule, type FrameStats } from '@3lens/core';

const customRules: CustomRule[] = [
  // Memory efficiency
  {
    id: 'memory.texture-efficiency',
    name: 'Texture Memory Efficiency',
    check: (stats) => {
      const mem = stats.memory;
      if (!mem || mem.textures === 0) return { passed: true };
      
      const avgSize = mem.textureMemory / mem.textures;
      const isEfficient = avgSize < 5 * 1024 * 1024; // 5MB average
      
      return {
        passed: isEfficient,
        message: `Avg texture: ${(avgSize / 1024 / 1024).toFixed(1)}MB`,
        severity: avgSize > 10 * 1024 * 1024 ? 'error' : 'warning',
      };
    },
  },
  
  // Rendering efficiency
  {
    id: 'rendering.triangles-per-draw',
    name: 'Triangles per Draw Call',
    check: (stats) => {
      if (stats.drawCalls === 0) return { passed: true };
      
      const trianglesPerDraw = stats.triangles / stats.drawCalls;
      const isEfficient = trianglesPerDraw > 100;
      
      return {
        passed: isEfficient,
        message: `${Math.round(trianglesPerDraw)} tris/draw (target: >100)`,
        severity: 'info',
      };
    },
  },
  
  // Scene complexity
  {
    id: 'scene.light-shadow-ratio',
    name: 'Shadow Light Ratio',
    check: (stats) => {
      const lights = stats.rendering?.lights ?? 0;
      const shadowLights = stats.rendering?.shadowLights ?? 0;
      
      if (lights === 0) return { passed: true };
      
      const ratio = shadowLights / lights;
      return {
        passed: ratio <= 0.5,
        message: `${shadowLights}/${lights} lights cast shadows (${(ratio * 100).toFixed(0)}%)`,
        severity: ratio > 0.75 ? 'error' : 'warning',
      };
    },
  },
];

const probe = createProbe({
  appName: 'MyApp',
  rules: { custom: customRules },
});
```

## Type Imports

```typescript
import type { CustomRule, RuleResult, FrameStats } from '@3lens/core';
```

## Related

- [ProbeConfig](./probe-config) - Main configuration interface
- [Performance Thresholds](./performance-thresholds) - Built-in thresholds
- [Rule Violations](./rule-violations) - Handling violations
- [FrameStats](./frame-stats) - Stats interface for rule checks
