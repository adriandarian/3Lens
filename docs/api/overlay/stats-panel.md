# Stats Panel (Performance)

The Stats panel provides comprehensive real-time performance monitoring, including FPS tracking, draw call analysis, frame time visualization, and bottleneck detection.

## Overview

```typescript
// Open the Stats/Performance panel
overlay.showPanel('stats');
```

The Stats panel is your primary tool for performance analysis, offering multiple tabs for different metrics:

- **Overview** - Key metrics and benchmark score
- **Memory** - GPU/CPU memory breakdown
- **Rendering** - Draw calls, triangles, shader analysis
- **Timeline** - Frame-by-frame recording
- **Resources** - Lifecycle tracking and leak detection

## Panel Layout

```
┌─────────────────────────────────────────────────────┐
│  ⚡ Performance                           ─ □ ✕    │
├─────────────────────────────────────────────────────┤
│  [Overview] [Memory] [Rendering] [Timeline] [Resources]│
├─────────────────────────────────────────────────────┤
│                                                     │
│    ┌──────────┐    FPS         Draw Calls          │
│    │    A     │    60          245                 │
│    │  Score   │    ▲ Smooth    ▲ Good              │
│    └──────────┘                                    │
│                                                     │
│  ═══════════════════════════════════════════       │
│  Frame Time Chart                                  │
│  ▁▂▁▁▃▂▁▁▂▁▃▂▁▂▁▁▂▃▂▁▁▂▁▂▁▃▂▁▁▂▁▂▃▂▁▂▁▁         │
│         16.67ms budget ─────────────────           │
│  ═══════════════════════════════════════════       │
│                                                     │
│  Metrics:                                          │
│  Triangles: 125,432   Objects: 1,234               │
│  Materials: 45        Textures: 28                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Overview Tab

### Benchmark Score

A comprehensive performance grade (A-F) calculated from multiple factors:

```typescript
interface BenchmarkScore {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;        // 0-100
  fps: number;          // Current FPS
  frameTime: number;    // Average frame time (ms)
  drawCalls: number;    // Draw calls per frame
  triangles: number;    // Triangles rendered
  topIssues: string[];  // Most impactful problems
  suggestions: string[]; // Optimization recommendations
}
```

| Grade | Score | Typical Performance |
|-------|-------|---------------------|
| A | 90-100 | 60+ FPS, < 200 draw calls |
| B | 75-89 | 45-60 FPS, < 400 draw calls |
| C | 50-74 | 30-45 FPS, < 600 draw calls |
| D | 25-49 | 15-30 FPS, performance issues |
| F | 0-24 | < 15 FPS, severe problems |

### Key Metrics Display

```
┌─────────────┬─────────────┬─────────────┐
│     FPS     │ Frame Time  │ Draw Calls  │
│     60      │   16.2ms    │    245      │
│   ▲ Good    │  ▲ Budget   │  ▲ Normal   │
└─────────────┴─────────────┴─────────────┘
```

### Frame Time Chart

Interactive chart showing frame times over the last 60-300 frames:

```
Frame Time (ms)
    50ms ┤
    33ms ┤ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  30 FPS target
    16ms ┤═══════════════════════  60 FPS target
     0ms ┼─────────────────────────
         └─────────────────────────►
              Time (frames)
```

**Chart Interactions:**
- **Hover** - Show exact values for each frame
- **Scroll** - Zoom in/out
- **Drag** - Pan through history
- **Click** - Pause auto-scroll

### Session Statistics

```typescript
interface SessionStats {
  sessionDuration: number;      // Total time
  totalFramesRendered: number;  // Frame count
  averageFps: number;           // Session average
  peakFps: number;              // Highest FPS
  lowestFps: number;            // Lowest FPS
  droppedFrames: number;        // Frames > 33ms
  smoothFrames: number;         // Frames < 16.67ms
}
```

### Rule Violations

When performance thresholds are exceeded:

```
┌─────────────────────────────────────────────┐
│ ⚠️ Draw calls exceeded threshold (500)      │
│ 💡 Consider using instancing or LOD         │
├─────────────────────────────────────────────┤
│ 🔴 Frame time spike: 45ms                   │
│ 💡 Check for expensive operations           │
└─────────────────────────────────────────────┘
```

## Memory Tab

See [Memory Panel](./memory-panel.md) for detailed documentation.

Quick overview:

```
Total GPU Memory: 256 MB
├─ Textures:      180 MB (70%)
├─ Geometry:       56 MB (22%)
└─ Render Targets: 20 MB (8%)

Memory Trend: → Stable
```

## Rendering Tab

### Draw Call Analysis

```
Draw Calls: 245
├─ Opaque:      180 (73%)
├─ Transparent:  45 (18%)
└─ Shadow:       20 (8%)

Triangles: 1,250,432
├─ Visible: 980,000
└─ Culled:  270,432
```

### Shader Programs

```
Active Programs: 12
├─ Standard PBR:    8
├─ Custom Shaders:  3
└─ Post-process:    1

Shader Switches: 8/frame
```

### Rendering Stats

```typescript
interface RenderingStats {
  // Lights
  totalLights: number;
  shadowCastingLights: number;
  shadowMapUpdates: number;
  
  // Animation
  skinnedMeshes: number;
  totalBones: number;
  morphTargetInfluences: number;
  
  // Transparency
  transparentObjects: number;
  sortingTime: number;
  
  // GPU
  gpuFrameTime?: number;
  gpuMemoryUsed?: number;
}
```

### Bottleneck Analysis

Automatic detection of performance issues:

```
┌─────────────────────────────────────────────────────┐
│ Bottleneck Analysis                                 │
├─────────────────────────────────────────────────────┤
│ 🔴 HIGH: Draw Calls (1,245)                        │
│    Consider using instancing or merging geometry    │
│                                                     │
│ 🟡 MEDIUM: Shadow Casters (6 lights)               │
│    Reduce shadow-casting lights or use baked shadows│
│                                                     │
│ 🟢 OK: Triangle count within budget                │
└─────────────────────────────────────────────────────┘
```

## Timeline Tab

### Recording Mode

```typescript
// Start recording
overlay.startRecording();

// Stop recording (auto-stops at 1800 frames / 30 seconds)
overlay.stopRecording();
```

### Frame Inspector

```
┌─────────────────────────────────────────────────────┐
│ ● Recording: 450/1800 frames                   [⏹] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frame Timeline                                     │
│  ▁▂▁▁█▂▁▁▂▁▃▂▁▂▁▁▂▃▂▁▁▂▁▂▁▃▂▁▁▂▁▂▃▂▁▂▁▁         │
│            ↑ Spike                                  │
│                                                     │
│  Selected Frame: #127                               │
│  ├─ CPU Time:  12.4ms                              │
│  ├─ GPU Time:  8.2ms                               │
│  ├─ Draw Calls: 312                                │
│  └─ Triangles: 1.2M                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Frame Time Percentiles

```
Frame Time Percentiles
┌────────┬────────┬────────┬────────┐
│  P50   │  P90   │  P95   │  P99   │
│ 15.2ms │ 18.4ms │ 22.1ms │ 35.6ms │
│   ✓    │   ✓    │   ⚠    │   ⚠    │
└────────┴────────┴────────┴────────┘

Avg FPS: 62    1% Low: 28    Budget: 92%
```

### FPS Distribution Histogram

```
FPS Distribution (1,234 frames)
      ▓▓▓▓▓▓▓▓ 
      ▓▓▓▓▓▓▓▓▓▓
      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
────────────────────────
 0   15   30   45   60   FPS

● Slow (12%)  ● Okay (28%)  ● Smooth (60%)
```

## Resources Tab

See [Resources Panel](./resources-panel.md) for detailed documentation.

Quick view:

```
Resource Lifecycle
├─ Created: 45 (this session)
├─ Disposed: 12
├─ Active: 1,234
└─ Leaked: 0 ✓
```

## GPU Capabilities

When available, displays WebGL/WebGPU capabilities:

```
GPU Information
├─ Renderer: NVIDIA GeForce RTX 3080
├─ Vendor: NVIDIA Corporation
├─ Max Texture Size: 16384
├─ Max Vertex Uniforms: 4096
├─ Antialias: Enabled
└─ Extensions: 45 loaded
```

## API Integration

```typescript
// Subscribe to stats updates
probe.on('stats', (stats: FrameStats) => {
  console.log('FPS:', stats.fps);
  console.log('Draw calls:', stats.drawCalls);
});

// Get current benchmark
const benchmark = probe.getBenchmarkScore();
console.log('Grade:', benchmark.grade);

// Configure update frequency
const probe = createProbe({
  sampling: {
    statsInterval: 500, // Update every 500ms
  },
});
```

## Configuration

```typescript
const probe = createProbe({
  thresholds: {
    maxDrawCalls: 500,
    maxTriangles: 1000000,
    targetFps: 60,
    maxFrameTime: 16.67,
  },
});
```

## Best Practices

1. **Monitor during development** - Catch performance regressions early
2. **Use Timeline recording** - Capture and analyze specific scenarios
3. **Check bottleneck analysis** - Follow optimization suggestions
4. **Watch percentiles** - P99 shows worst-case performance
5. **Profile on target hardware** - Test on expected devices

## Related

- [Memory Panel](./memory-panel.md)
- [Resources Panel](./resources-panel.md)
- [Performance Tracker](../core/performance-tracker.md)
- [Performance Thresholds](../core/performance-thresholds.md)
