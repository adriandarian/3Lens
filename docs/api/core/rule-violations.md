# Rule Violations API

3Lens provides a comprehensive API for handling rule violations in real-time. When performance thresholds are exceeded or custom rules fail, the system generates violations that can be captured, logged, and acted upon.

## Overview

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({
  appName: 'MyApp',
  rules: { maxDrawCalls: 500 },
});

// Subscribe to violations
probe.onRuleViolation((violation) => {
  console.warn(`[${violation.severity}] ${violation.ruleName}: ${violation.message}`);
});
```

## Type Definitions

### RuleViolation

```typescript
interface RuleViolation {
  /**
   * Unique identifier for the rule that triggered the violation
   */
  ruleId: string;

  /**
   * Human-readable name of the rule
   */
  ruleName: string;

  /**
   * Severity level of the violation
   */
  severity: ViolationSeverity;

  /**
   * Descriptive message explaining the violation
   */
  message: string;

  /**
   * Current value that triggered the violation
   */
  currentValue: number | string;

  /**
   * Threshold value that was exceeded
   */
  threshold: number | string;

  /**
   * Timestamp when the violation occurred (performance.now())
   */
  timestamp: number;
}
```

### ViolationSeverity

```typescript
type ViolationSeverity = 'info' | 'warning' | 'error';
```

| Severity | Description | Typical Use |
|----------|-------------|-------------|
| `info` | Informational notice | Non-critical suggestions |
| `warning` | Performance concern | Threshold exceeded |
| `error` | Critical issue | Severe performance problem |

### RuleViolationCallback

```typescript
type RuleViolationCallback = (violation: RuleViolation) => void;
```

## Subscribing to Violations

### Basic Subscription

```typescript
const probe = createProbe({ appName: 'MyApp' });

const unsubscribe = probe.onRuleViolation((violation) => {
  console.log('Violation:', violation);
});

// Later: unsubscribe when no longer needed
unsubscribe();
```

### Multiple Subscribers

```typescript
// Console logging
probe.onRuleViolation((v) => {
  console.warn(`[3Lens] ${v.ruleName}: ${v.message}`);
});

// Analytics tracking
probe.onRuleViolation((v) => {
  analytics.track('performance_violation', {
    rule: v.ruleId,
    severity: v.severity,
    value: v.currentValue,
    threshold: v.threshold,
  });
});

// UI notification
probe.onRuleViolation((v) => {
  if (v.severity === 'error') {
    showNotification(`Performance Error: ${v.message}`);
  }
});
```

### Filtering by Severity

```typescript
probe.onRuleViolation((violation) => {
  switch (violation.severity) {
    case 'error':
      console.error(`❌ ${violation.ruleName}: ${violation.message}`);
      sendAlert(violation);
      break;
    case 'warning':
      console.warn(`⚠️ ${violation.ruleName}: ${violation.message}`);
      break;
    case 'info':
      console.info(`ℹ️ ${violation.ruleName}: ${violation.message}`);
      break;
  }
});
```

### Filtering by Rule

```typescript
probe.onRuleViolation((violation) => {
  // Only handle specific rules
  if (violation.ruleId.startsWith('max')) {
    handleThresholdViolation(violation);
  }
  
  if (violation.ruleId.startsWith('custom.')) {
    handleCustomRuleViolation(violation);
  }
});
```

## Querying Violations

### Get Recent Violations

```typescript
// Get all recent violations
const violations = probe.getRecentViolations();
console.log(`Total violations: ${violations.length}`);

violations.forEach((v) => {
  console.log(`${v.ruleId}: ${v.message} at ${v.timestamp}`);
});
```

### Get Violations by Severity

```typescript
const errors = probe.getViolationsBySeverity('error');
const warnings = probe.getViolationsBySeverity('warning');
const infos = probe.getViolationsBySeverity('info');

console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Info: ${infos.length}`);
```

### Get Violation Summary

```typescript
const summary = probe.getViolationSummary();
console.log(summary);
// {
//   errors: 2,
//   warnings: 15,
//   info: 5,
//   total: 22
// }
```

### Clear Violation History

```typescript
// Clear all recorded violations
probe.clearViolations();
```

## Violation Cooldown

To prevent log spam, each rule has a 1-second cooldown between violations. This means:

```
Time    Event
0ms     Rule fails → Violation fired
16ms    Rule fails → Skipped (cooldown)
32ms    Rule fails → Skipped (cooldown)
...
1000ms  Rule fails → Violation fired (cooldown expired)
```

```
┌─────────────────────────────────────────────────────────────┐
│ Violation Cooldown Behavior                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Frame:  1  2  3  4  5 ... 60  61  62 ... 120                │
│ Fails:  X  X  X  X  X      X   X   X       X                │
│ Fires:  ▓  ·  ·  ·  ·      ·   ▓   ·       ▓                │
│         ↑                      ↑           ↑                │
│         1st                 1 sec       2 sec               │
│                             later       later               │
└─────────────────────────────────────────────────────────────┘
```

## Built-in Rule IDs

| Rule ID | Rule Name | Checks |
|---------|-----------|--------|
| `maxDrawCalls` | Max Draw Calls | Draw calls per frame |
| `maxTriangles` | Max Triangles | Rendered triangles |
| `maxFrameTimeMs` | Max Frame Time | CPU frame time |
| `minFps` | Min FPS | Frames per second |
| `maxTextures` | Max Textures | Texture count |
| `maxTextureMemory` | Max Texture Memory | Texture VRAM |
| `maxGeometryMemory` | Max Geometry Memory | Geometry VRAM |
| `maxGpuMemory` | Max GPU Memory | Total GPU memory |
| `maxLights` | Max Lights | Active light count |
| `maxShadowLights` | Max Shadow Lights | Shadow-casting lights |

## Integration Examples

### Console Logging

```typescript
const severityColors = {
  error: '\x1b[31m',   // Red
  warning: '\x1b[33m', // Yellow
  info: '\x1b[36m',    // Cyan
};
const reset = '\x1b[0m';

probe.onRuleViolation((v) => {
  const color = severityColors[v.severity];
  console.log(
    `${color}[${v.severity.toUpperCase()}]${reset} ${v.ruleName}`,
    `\n  Current: ${v.currentValue}`,
    `\n  Threshold: ${v.threshold}`,
    `\n  ${v.message}`
  );
});
```

### Browser DevTools

```typescript
probe.onRuleViolation((v) => {
  const logFn = {
    error: console.error,
    warning: console.warn,
    info: console.info,
  }[v.severity];

  logFn(
    `%c3Lens%c ${v.ruleName}`,
    'background: #6366f1; color: white; padding: 2px 6px; border-radius: 3px;',
    'color: inherit;',
    { violation: v }
  );
});
```

### Toast Notifications

```typescript
import { toast } from 'your-toast-library';

probe.onRuleViolation((v) => {
  if (v.severity === 'error') {
    toast.error(`Performance Error: ${v.message}`);
  } else if (v.severity === 'warning') {
    toast.warning(`Performance Warning: ${v.message}`);
  }
});
```

### Sentry/Error Tracking

```typescript
import * as Sentry from '@sentry/browser';

probe.onRuleViolation((v) => {
  if (v.severity === 'error') {
    Sentry.captureMessage(`3Lens: ${v.ruleName}`, {
      level: 'warning',
      tags: {
        rule_id: v.ruleId,
        severity: v.severity,
      },
      extra: {
        currentValue: v.currentValue,
        threshold: v.threshold,
        message: v.message,
      },
    });
  }
});
```

### Analytics Tracking

```typescript
probe.onRuleViolation((v) => {
  // Google Analytics
  gtag('event', 'performance_violation', {
    event_category: '3lens',
    event_label: v.ruleId,
    value: typeof v.currentValue === 'number' ? v.currentValue : undefined,
    custom_map: {
      dimension1: v.severity,
      dimension2: v.ruleName,
    },
  });

  // Mixpanel
  mixpanel.track('Performance Violation', {
    rule_id: v.ruleId,
    rule_name: v.ruleName,
    severity: v.severity,
    current_value: v.currentValue,
    threshold: v.threshold,
  });
});
```

### Performance Dashboard

```typescript
class ViolationDashboard {
  private violations: RuleViolation[] = [];
  private stats = new Map<string, { count: number; lastSeen: number }>();

  constructor(probe: DevtoolProbe) {
    probe.onRuleViolation((v) => this.record(v));
  }

  private record(violation: RuleViolation) {
    this.violations.push(violation);
    
    const stat = this.stats.get(violation.ruleId) || { count: 0, lastSeen: 0 };
    stat.count++;
    stat.lastSeen = violation.timestamp;
    this.stats.set(violation.ruleId, stat);
  }

  getReport() {
    return {
      totalViolations: this.violations.length,
      byRule: Object.fromEntries(this.stats),
      byS severity: {
        error: this.violations.filter(v => v.severity === 'error').length,
        warning: this.violations.filter(v => v.severity === 'warning').length,
        info: this.violations.filter(v => v.severity === 'info').length,
      },
      recentViolations: this.violations.slice(-10),
    };
  }
}

const dashboard = new ViolationDashboard(probe);
```

### CI/CD Integration

```typescript
// test/performance.test.ts
import { createProbe } from '@3lens/core';

describe('Performance Tests', () => {
  let violations: RuleViolation[] = [];
  
  beforeAll(() => {
    const probe = createProbe({
      appName: 'CI-Test',
      rules: {
        maxDrawCalls: 100,
        maxTriangles: 50000,
      },
    });

    probe.onRuleViolation((v) => violations.push(v));
    
    // Run your scene...
  });

  afterAll(() => {
    // Assert no violations occurred
    const errors = violations.filter(v => v.severity === 'error');
    expect(errors).toHaveLength(0);

    // Or assert specific thresholds
    const drawCallViolations = violations.filter(v => v.ruleId === 'maxDrawCalls');
    expect(drawCallViolations.length).toBeLessThan(5);
  });
});
```

## Creating Custom Violation Handlers

### Aggregating Handler

```typescript
function createAggregatingHandler(windowMs: number = 5000) {
  const violations = new Map<string, RuleViolation[]>();
  
  return {
    handler: (v: RuleViolation) => {
      const list = violations.get(v.ruleId) || [];
      list.push(v);
      violations.set(v.ruleId, list);
    },
    
    getAggregated: () => {
      const now = performance.now();
      const result: Record<string, { count: number; avgValue: number }> = {};
      
      violations.forEach((list, ruleId) => {
        const recent = list.filter(v => now - v.timestamp < windowMs);
        if (recent.length > 0) {
          const numericValues = recent
            .map(v => typeof v.currentValue === 'number' ? v.currentValue : 0)
            .filter(v => v > 0);
          
          result[ruleId] = {
            count: recent.length,
            avgValue: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          };
        }
      });
      
      return result;
    },
  };
}

const aggregator = createAggregatingHandler();
probe.onRuleViolation(aggregator.handler);

// Check aggregated stats periodically
setInterval(() => {
  console.log('Aggregated violations:', aggregator.getAggregated());
}, 5000);
```

### Threshold Escalation Handler

```typescript
function createEscalationHandler(escalationThreshold: number = 10) {
  const counts = new Map<string, number>();
  const escalated = new Set<string>();
  
  return (v: RuleViolation) => {
    const count = (counts.get(v.ruleId) || 0) + 1;
    counts.set(v.ruleId, count);
    
    if (count >= escalationThreshold && !escalated.has(v.ruleId)) {
      escalated.add(v.ruleId);
      console.error(`🚨 ESCALATED: ${v.ruleName} violated ${count} times`);
      sendPagerDutyAlert(v);
    }
  };
}

probe.onRuleViolation(createEscalationHandler(10));
```

## Best Practices

### 1. Always Unsubscribe in Cleanup

```typescript
// React example
useEffect(() => {
  const unsubscribe = probe.onRuleViolation(handleViolation);
  return () => unsubscribe();
}, []);
```

### 2. Handle Errors in Callbacks

```typescript
probe.onRuleViolation((v) => {
  try {
    processViolation(v);
  } catch (error) {
    console.error('Error handling violation:', error);
  }
});
```

### 3. Rate Limit External Services

```typescript
import { throttle } from 'lodash';

const sendToAnalytics = throttle((v: RuleViolation) => {
  analytics.track('violation', v);
}, 1000); // Max once per second

probe.onRuleViolation(sendToAnalytics);
```

### 4. Don't Block the Main Thread

```typescript
probe.onRuleViolation((v) => {
  // Queue for processing instead of processing synchronously
  queueMicrotask(() => processViolation(v));
});
```

## Type Imports

```typescript
import type {
  RuleViolation,
  RuleViolationCallback,
  ViolationSeverity,
} from '@3lens/core';
```

## Related

- [ProbeConfig](./probe-config) - Configuration interface
- [Performance Thresholds](./performance-thresholds) - Built-in thresholds
- [Custom Rules](./custom-rules) - Creating custom rules
- [CI Integration Guide](/guides/ci-integration) - CI/CD setup
