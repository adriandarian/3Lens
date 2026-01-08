---
title: Performance Debugging
description: Find and fix performance bottlenecks in your Three.js application
---

# Performance Debugging

Learn to identify and resolve performance issues in Three.js applications.

<ExampleViewer
  src="/examples/debugging-profiling/performance-debugging/"
  title="Performance Debugging Demo"
  description="This scene intentionally includes performance issues. Use 3Lens to identify bottlenecks, analyze draw calls, and optimize the scene."
  difficulty="intermediate"
  github-url="https://github.com/adriandarian/3Lens/tree/main/examples/debugging-profiling/performance-debugging"
  aspect-ratio="16/9"
/>

## Features Demonstrated

- **Frame Stats**: Real-time FPS, frame time, and memory monitoring
- **Draw Call Analysis**: Track render calls and triangle count
- **GPU Timing**: Measure GPU render time (where supported)
- **Performance Rules**: Automatic warnings for budget violations
- **Timeline Recording**: Record and analyze frame sequences

## Key Metrics to Monitor

| Metric | Target | Warning |
|--------|--------|---------|
| FPS | 60 | < 45 |
| Frame Time | < 16.67ms | > 22ms |
| Draw Calls | < 100 | > 200 |
| Triangles | < 100K | > 500K |
| Textures | < 50 | > 100 |

## Using Performance Rules

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({
  performance: {
    targetFPS: 60,
    warningThreshold: 45,
    criticalThreshold: 30
  },
  rules: [
    {
      name: 'max-draw-calls',
      check: (stats) => stats.drawCalls < 200,
      message: 'Draw calls exceed budget (200)'
    },
    {
      name: 'max-triangles',
      check: (stats) => stats.triangles < 500000,
      message: 'Triangle count exceeds budget (500K)'
    }
  ]
});

probe.on('ruleViolation', (violation) => {
  console.warn(`Performance rule violated: ${violation.rule.name}`);
});
```

## Common Performance Issues

1. **Too Many Draw Calls** - Use instancing or merge geometries
2. **Large Textures** - Compress and resize textures appropriately  
3. **Complex Shaders** - Simplify shader logic, use LOD
4. **Unoptimized Geometry** - Use LOD, simplify distant objects
5. **Memory Leaks** - Properly dispose of resources

## Related Examples

- [Memory Leak Detection](./memory-leaks) - Track down resource leaks
- [Large Scene Optimization](./large-scene-optimization) - Scaling techniques
- [Shader Debugging](./shader-debugging) - Inspect GLSL/WGSL
