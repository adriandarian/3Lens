# Custom Rules Guide

This guide covers creating custom performance and quality rules in 3Lens to automatically detect issues and enforce standards in your Three.js applications.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Built-in Rules](#built-in-rules)
- [Creating Custom Rules](#creating-custom-rules)
- [Rule Conditions](#rule-conditions)
- [Rule Actions](#rule-actions)
- [Rule Severity Levels](#rule-severity-levels)
- [Combining Rules](#combining-rules)
- [Rule Configuration File](#rule-configuration-file)
- [Framework Integration](#framework-integration)
- [Best Practices](#best-practices)

---

## Overview

3Lens rules allow you to:

- Automatically detect performance problems
- Enforce coding standards and best practices
- Highlight violations in the UI
- Block CI builds on rule failures
- Create custom domain-specific checks

Rules are evaluated every frame and can inspect:
- Frame statistics (FPS, draw calls, triangles)
- Scene structure (objects, materials, geometries)
- Memory usage (GPU memory, texture sizes)
- Custom metrics you define

---

## Quick Start

Add performance rules in under 2 minutes:

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({
  appName: 'My Game',
  rules: {
    // Simple threshold rules
    maxDrawCalls: 500,
    maxTriangles: 250000,
    minFPS: 55,
    maxFrameTimeMs: 18,
    maxTextureMemoryMB: 256,
  },
});

// Listen for violations
probe.onRuleViolation((violation) => {
  console.warn(`Rule violation: ${violation.rule} - ${violation.message}`);
});
```

That's it! Violations appear in the 3Lens overlay and trigger callbacks.

---

## Built-in Rules

### Performance Rules

| Rule | Default | Description |
|------|---------|-------------|
| `maxDrawCalls` | - | Maximum draw calls per frame |
| `maxTriangles` | - | Maximum triangles per frame |
| `minFPS` | - | Minimum acceptable FPS |
| `maxFrameTimeMs` | - | Maximum frame time in milliseconds |
| `maxGpuMemoryMB` | - | Maximum GPU memory usage |

### Resource Rules

| Rule | Default | Description |
|------|---------|-------------|
| `maxTextures` | - | Maximum number of textures |
| `maxTextureMemoryMB` | - | Maximum texture memory |
| `maxGeometries` | - | Maximum number of geometries |
| `maxMaterials` | - | Maximum number of materials |
| `maxLights` | - | Maximum number of lights |

### Quality Rules

| Rule | Default | Description |
|------|---------|-------------|
| `maxTextureSize` | - | Maximum texture dimension (width/height) |
| `requireMipmaps` | false | Require mipmaps on textures |
| `requirePowerOfTwo` | false | Require power-of-two textures |
| `maxObjectDepth` | - | Maximum scene graph depth |

### Enabling Built-in Rules

```typescript
const probe = createProbe({
  appName: 'My App',
  rules: {
    // Performance
    maxDrawCalls: 500,
    maxTriangles: 250000,
    minFPS: 55,
    maxFrameTimeMs: 18,
    
    // Resources
    maxTextures: 100,
    maxTextureMemoryMB: 256,
    maxGeometries: 200,
    maxMaterials: 50,
    maxLights: 8,
    
    // Quality
    maxTextureSize: 2048,
    requireMipmaps: true,
    maxObjectDepth: 15,
  },
});
```

---

## Creating Custom Rules

### Rule Definition Interface

```typescript
interface CustomRule {
  /**
   * Unique rule identifier
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Rule description
   */
  description?: string;

  /**
   * Rule category for grouping
   */
  category?: string;

  /**
   * Severity level
   */
  severity: 'error' | 'warning' | 'info';

  /**
   * Evaluation function - return true if rule passes, false if violated
   */
  evaluate: (context: RuleContext) => boolean | RuleResult;

  /**
   * Custom violation message (optional)
   */
  message?: string | ((context: RuleContext) => string);

  /**
   * Rule is enabled
   */
  enabled?: boolean;
}
```

### Basic Custom Rule

```typescript
import { createProbe, type CustomRule } from '@3lens/core';

const noTransparentMaterials: CustomRule = {
  id: 'no-transparent-materials',
  name: 'No Transparent Materials',
  description: 'Disallow transparent materials for performance',
  category: 'Performance',
  severity: 'warning',

  evaluate(context) {
    const snapshot = context.getSnapshot();
    const transparentCount = snapshot.materials.filter(m => m.transparent).length;
    return transparentCount === 0;
  },

  message: (ctx) => {
    const count = ctx.getSnapshot().materials.filter(m => m.transparent).length;
    return `Found ${count} transparent material(s). Consider using alpha testing instead.`;
  },
};

const probe = createProbe({
  appName: 'My App',
  customRules: [noTransparentMaterials],
});
```

### Rule with Details

```typescript
const oversizedTextures: CustomRule = {
  id: 'oversized-textures',
  name: 'Oversized Textures',
  description: 'Detect textures larger than recommended',
  category: 'Memory',
  severity: 'warning',

  evaluate(context) {
    const snapshot = context.getSnapshot();
    const maxSize = context.getConfig('maxTextureSize') ?? 2048;
    
    const oversized = snapshot.textures.filter(
      t => t.width > maxSize || t.height > maxSize
    );

    if (oversized.length === 0) {
      return true; // Pass
    }

    // Return detailed result
    return {
      passed: false,
      message: `${oversized.length} texture(s) exceed ${maxSize}px`,
      details: oversized.map(t => ({
        name: t.name,
        size: `${t.width}x${t.height}`,
        recommended: `${maxSize}x${maxSize}`,
      })),
      affectedObjects: oversized.map(t => t.uuid),
    };
  },
};
```

### Stateful Rules

Track values over time:

```typescript
const fpsStability: CustomRule = {
  id: 'fps-stability',
  name: 'FPS Stability',
  description: 'Detect unstable frame rates',
  category: 'Performance',
  severity: 'warning',

  evaluate(context) {
    const stats = context.getFrameStats();
    if (!stats) return true;

    // Get history from rule state
    const history = context.getRuleState<number[]>('fpsHistory') ?? [];
    history.push(stats.fps);
    
    // Keep last 60 frames
    if (history.length > 60) history.shift();
    context.setRuleState('fpsHistory', history);

    // Need enough samples
    if (history.length < 30) return true;

    // Calculate standard deviation
    const avg = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((sum, fps) => sum + Math.pow(fps - avg, 2), 0) / history.length;
    const stdDev = Math.sqrt(variance);

    // Fail if too much variance (>10% of average)
    if (stdDev > avg * 0.1) {
      return {
        passed: false,
        message: `Unstable FPS: avg ${avg.toFixed(1)}, stdDev ${stdDev.toFixed(1)}`,
      };
    }

    return true;
  },
};
```

---

## Rule Conditions

### Frame Stats Conditions

```typescript
evaluate(context) {
  const stats = context.getFrameStats();
  
  // Check FPS
  if (stats.fps < 30) return false;
  
  // Check frame time
  if (stats.frameTimeMs > 33.33) return false;
  
  // Check draw calls
  if (stats.drawCalls > 1000) return false;
  
  // Check triangles
  if (stats.triangles > 500000) return false;
  
  return true;
}
```

### Scene Structure Conditions

```typescript
evaluate(context) {
  const snapshot = context.getSnapshot();
  
  // Check object count
  if (snapshot.nodes.length > 1000) return false;
  
  // Check for specific object types
  const meshes = snapshot.nodes.filter(n => n.type === 'Mesh');
  const lights = snapshot.nodes.filter(n => n.type.includes('Light'));
  
  // Check scene depth
  const maxDepth = Math.max(...snapshot.nodes.map(n => n.depth));
  
  return maxDepth <= 10;
}
```

### Material Conditions

```typescript
evaluate(context) {
  const snapshot = context.getSnapshot();
  
  // Check for expensive materials
  const physicalMaterials = snapshot.materials.filter(
    m => m.type === 'MeshPhysicalMaterial'
  );
  
  if (physicalMaterials.length > 10) {
    return {
      passed: false,
      message: `Too many physical materials: ${physicalMaterials.length}`,
    };
  }
  
  return true;
}
```

### Memory Conditions

```typescript
evaluate(context) {
  const stats = context.getFrameStats();
  const snapshot = context.getSnapshot();
  
  // GPU memory
  const gpuMemoryMB = (stats.memory?.gpuMemoryEstimate ?? 0) / (1024 * 1024);
  if (gpuMemoryMB > 512) return false;
  
  // Texture memory
  const textureMemory = snapshot.textures.reduce(
    (sum, t) => sum + (t.memorySize ?? 0), 0
  );
  const textureMemoryMB = textureMemory / (1024 * 1024);
  if (textureMemoryMB > 256) return false;
  
  return true;
}
```

---

## Rule Actions

### Highlighting Violations

```typescript
const highlightRule: CustomRule = {
  id: 'highlight-expensive',
  name: 'Highlight Expensive Objects',
  severity: 'info',

  evaluate(context) {
    const snapshot = context.getSnapshot();
    
    const expensive = snapshot.nodes.filter(n => 
      n.type === 'Mesh' && 
      (n.geometry?.faceCount ?? 0) > 50000
    );

    if (expensive.length > 0) {
      return {
        passed: false,
        affectedObjects: expensive.map(n => n.uuid),
        highlightColor: '#ff6b6b', // Red highlight
      };
    }

    return true;
  },
};
```

### Automatic Fixes (Suggestions)

```typescript
const textureFormatRule: CustomRule = {
  id: 'texture-format',
  name: 'Recommend Compressed Textures',
  severity: 'info',

  evaluate(context) {
    const snapshot = context.getSnapshot();
    
    const uncompressed = snapshot.textures.filter(t => 
      !t.format?.includes('Compressed') && t.memorySize > 1024 * 1024
    );

    if (uncompressed.length > 0) {
      return {
        passed: false,
        message: `${uncompressed.length} large uncompressed textures found`,
        suggestions: uncompressed.map(t => ({
          type: 'compress-texture',
          target: t.uuid,
          description: `Compress ${t.name} to save ${(t.memorySize / 1024 / 1024).toFixed(1)}MB`,
        })),
      };
    }

    return true;
  },
};
```

---

## Rule Severity Levels

### Error (Critical)

Blocks CI, shown prominently:

```typescript
{
  severity: 'error',
  // Used for: Critical performance issues, crashes, memory leaks
}
```

### Warning

Highlighted in UI, may block CI:

```typescript
{
  severity: 'warning',
  // Used for: Performance concerns, best practice violations
}
```

### Info

Informational, shown subtly:

```typescript
{
  severity: 'info',
  // Used for: Suggestions, recommendations, tips
}
```

---

## Combining Rules

### Rule Groups

```typescript
import { createRuleGroup } from '@3lens/core';

const mobilePerformanceRules = createRuleGroup({
  id: 'mobile-performance',
  name: 'Mobile Performance',
  description: 'Rules for mobile device optimization',
  rules: [
    { id: 'mobile-draw-calls', ...drawCallsRule, threshold: 100 },
    { id: 'mobile-triangles', ...trianglesRule, threshold: 100000 },
    { id: 'mobile-texture-size', ...textureSizeRule, maxSize: 1024 },
  ],
});

const probe = createProbe({
  appName: 'My App',
  customRules: mobilePerformanceRules.rules,
});
```

### Conditional Rules

```typescript
const conditionalRule: CustomRule = {
  id: 'vr-performance',
  name: 'VR Performance',
  severity: 'error',

  evaluate(context) {
    // Only evaluate in VR mode
    const isVR = context.getConfig('vrMode') ?? false;
    if (!isVR) return true;

    const stats = context.getFrameStats();
    
    // VR requires 72+ FPS
    if (stats.fps < 72) {
      return {
        passed: false,
        message: `VR requires 72+ FPS, currently at ${stats.fps.toFixed(1)}`,
      };
    }

    return true;
  },
};
```

---

## Rule Configuration File

### 3lens.config.js

```javascript
// 3lens.config.js
module.exports = {
  appName: 'My Game',
  
  rules: {
    // Built-in rules with thresholds
    maxDrawCalls: 500,
    maxTriangles: 250000,
    minFPS: 55,
    maxFrameTimeMs: 18,
    maxTextures: 100,
    maxTextureMemoryMB: 256,
  },

  // Custom rules defined inline
  customRules: [
    {
      id: 'no-emissive-materials',
      name: 'No Emissive Materials',
      severity: 'warning',
      evaluate: (ctx) => {
        const materials = ctx.getSnapshot().materials;
        return !materials.some(m => m.emissive && m.emissiveIntensity > 0);
      },
    },
  ],

  // Environment-specific overrides
  environments: {
    production: {
      rules: {
        maxDrawCalls: 300, // Stricter for production
        minFPS: 60,
      },
    },
    development: {
      rules: {
        minFPS: 30, // More lenient for development
      },
    },
  },
};
```

### Loading Configuration

```typescript
import { createProbe, loadConfig } from '@3lens/core';

// Auto-loads from 3lens.config.js
const config = await loadConfig();

const probe = createProbe(config);
```

---

## Framework Integration

### React

```tsx
import { useRuleViolations, useThreeLensProbe } from '@3lens/react-bridge';

function RuleViolationsPanel() {
  const violations = useRuleViolations();
  
  return (
    <div className="violations-panel">
      <h3>Rule Violations ({violations.length})</h3>
      {violations.map(v => (
        <div key={v.id} className={`violation ${v.severity}`}>
          <strong>{v.rule}</strong>
          <p>{v.message}</p>
        </div>
      ))}
    </div>
  );
}

// Custom rule registration
function MyScene() {
  const probe = useThreeLensProbe();
  
  useEffect(() => {
    probe.addCustomRule({
      id: 'react-specific-rule',
      name: 'React Specific',
      severity: 'warning',
      evaluate: (ctx) => {
        // Custom logic
        return true;
      },
    });
  }, [probe]);
  
  return <Canvas>...</Canvas>;
}
```

### Vue

```vue
<script setup>
import { useThreeLens, useRuleViolations } from '@3lens/vue-bridge';
import { onMounted } from 'vue';

const { probe } = useThreeLens();
const { violations } = useRuleViolations();

onMounted(() => {
  probe.value?.addCustomRule({
    id: 'vue-specific-rule',
    name: 'Vue Specific',
    severity: 'warning',
    evaluate: (ctx) => true,
  });
});
</script>

<template>
  <div class="violations-panel">
    <h3>Rule Violations ({{ violations.length }})</h3>
    <div 
      v-for="v in violations" 
      :key="v.id" 
      :class="['violation', v.severity]"
    >
      <strong>{{ v.rule }}</strong>
      <p>{{ v.message }}</p>
    </div>
  </div>
</template>
```

---

## Best Practices

### 1. Keep Rules Fast

```typescript
// ❌ Bad - Heavy computation every frame
evaluate(context) {
  const distances = [];
  for (const node of snapshot.nodes) {
    for (const other of snapshot.nodes) {
      distances.push(computeDistance(node, other)); // O(n²)
    }
  }
}

// ✅ Good - Sample or cache results
evaluate(context) {
  const lastCheck = context.getRuleState('lastCheck') ?? 0;
  if (Date.now() - lastCheck < 1000) return true; // Check once per second
  context.setRuleState('lastCheck', Date.now());
  
  // Now do expensive work
}
```

### 2. Provide Actionable Messages

```typescript
// ❌ Bad - Vague message
message: 'Performance issue detected'

// ✅ Good - Specific and actionable
message: (ctx) => {
  const count = ctx.getSnapshot().textures.filter(t => t.width > 2048).length;
  return `${count} textures exceed 2048px. Resize to 2048x2048 or use texture atlases.`;
}
```

### 3. Use Appropriate Severity

```typescript
// error: Blocks CI, critical issues
// warning: Shows prominently, may block CI
// info: Suggestions only

severity: stats.fps < 15 ? 'error' : stats.fps < 30 ? 'warning' : 'info'
```

### 4. Test Rules in Isolation

```typescript
import { testRule } from '@3lens/core/testing';

describe('no-transparent-materials', () => {
  it('passes when no transparent materials', () => {
    const result = testRule(noTransparentMaterials, {
      materials: [{ transparent: false }],
    });
    expect(result.passed).toBe(true);
  });

  it('fails when transparent materials exist', () => {
    const result = testRule(noTransparentMaterials, {
      materials: [{ transparent: true }],
    });
    expect(result.passed).toBe(false);
  });
});
```

---

## Related Guides

- [Plugin Development Guide](./PLUGIN-DEVELOPMENT.md)
- [CI Integration Guide](./CI-INTEGRATION.md)
- [Performance Debugging Guide](./PERFORMANCE-DEBUGGING-GUIDE.md)

## API Reference

- [CustomRule Interface](/api/core/custom-rules)
- [Rule Violations API](/api/core/rule-violations)
- [Config File Loading](/api/core/config-file-loading)
