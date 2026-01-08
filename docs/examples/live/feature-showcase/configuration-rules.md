---
title: Configuration Rules
description: Set up performance budgets and custom rules
---

# Configuration Rules

Set up performance budgets and custom rules with 3Lens.

<ExampleViewer
  src="/examples/feature-showcase/configuration-rules/"
  title="Configuration Rules Demo"
  description="Define performance thresholds, create custom validation rules, and get automatic warnings when budgets are exceeded."
  difficulty="intermediate"
  github-url="https://github.com/adriandarian/3Lens/tree/main/examples/feature-showcase/configuration-rules"
/>

## Features Demonstrated

- **Performance Budgets**: Set FPS, memory, draw call limits
- **Custom Rules**: Create application-specific rules
- **Violation Alerts**: Get warnings when rules are broken
- **Rule Composition**: Combine multiple conditions

## Example Rules

```typescript
const probe = createProbe({
  rules: [
    {
      name: 'max-triangles',
      check: (stats) => stats.triangles < 1000000,
      message: 'Triangle count exceeds 1M budget'
    },
    {
      name: 'min-fps',
      check: (stats) => stats.fps > 30,
      severity: 'error',
      message: 'FPS dropped below 30'
    }
  ]
});
```

## Related Examples

- [Performance Debugging](../debugging-profiling/performance-debugging) - Monitoring
- [Cost Analysis](./cost-analysis) - Rendering cost breakdown
