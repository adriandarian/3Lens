---
title: Memory Leak Detection
description: Track down and fix memory leaks in Three.js
---

# Memory Leak Detection

Track down and fix memory leaks in Three.js applications with 3Lens.

<ExampleViewer
  src="/examples/debugging-profiling/memory-leak-detection/"
  title="Memory Leak Detection Demo"
  description="Learn to identify memory leaks, track resource allocation, and properly dispose of Three.js objects."
  difficulty="intermediate"
  github-url="https://github.com/adriandarian/3Lens/tree/main/examples/debugging-profiling/memory-leak-detection"
/>

## Features Demonstrated

- **Resource Tracking**: Monitor geometry, texture, material allocation
- **Leak Detection**: Automatic identification of undisposed resources
- **Disposal Helpers**: Tools for proper cleanup
- **Memory Timeline**: Track memory usage over time

## Common Leak Sources

1. **Geometries** - Always call `geometry.dispose()`
2. **Materials** - Dispose materials and their textures
3. **Textures** - Explicitly dispose when no longer needed
4. **Render Targets** - Dispose framebuffers
5. **Event Listeners** - Remove listeners on cleanup

## Related Examples

- [Performance Debugging](./performance-debugging) - General performance
- [Texture Optimization](./texture-optimization) - Texture management
