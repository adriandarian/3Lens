# Memory Panel

The Memory panel provides detailed analysis of GPU and CPU memory usage, with breakdown by resource type, trend visualization, and optimization recommendations.

## Overview

```typescript
// Access via the Performance panel's Memory tab
overlay.showPanel('stats');
// Then click the "Memory" tab
```

The Memory panel helps you understand and optimize memory usage:

- **Total GPU memory** tracking
- **Per-category breakdown** (textures, geometry, render targets)
- **Memory trend** visualization over time
- **JS heap** monitoring (when available)
- **Efficiency scoring** and recommendations
- **Resource distribution** analysis

## Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Memory                                                  ─ □ ✕  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    256 MB                                 │ │
│  │              Total GPU Memory                             │ │
│  │                  → Stable                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Memory Breakdown                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │████████████████████░░░░░░░░░░│ Textures    180 MB  70%   │   │
│  │██████░░░░░░░░░░░░░░░░░░░░░░░░│ Geometry     56 MB  22%   │   │
│  │██░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ Render Tgt   20 MB   8%   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Memory History (60s)                                           │
│  300MB ┤                                                        │
│  200MB ┤════════════════════════════════════════                │
│  100MB ┤                                                        │
│    0MB ┼────────────────────────────────────────►               │
│                                                                 │
│  Resource Counts                                                │
│  ┌────────┬────────┬────────┬────────┬────────┬────────┐       │
│  │ Geos   │ Texts  │ Shaders│  RT    │ Objects│ Mats   │       │
│  │  89    │  28    │  12    │  8     │ 1,234  │  45    │       │
│  └────────┴────────┴────────┴────────┴────────┴────────┘       │
│                                                                 │
│  Memory Efficiency: B (72/100)                                  │
│  ══════════════════════════════════════════════════════════════ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Total GPU Memory

### Memory Display

```
┌─────────────────────────────────────────────┐
│           256 MB                            │
│      Total GPU Memory                       │
│         → Stable                            │
│                                             │
│  ⚠️ Warning threshold: 512 MB               │
└─────────────────────────────────────────────┘
```

### Memory Trend

| Trend | Indicator | Description |
|-------|-----------|-------------|
| Rising | ↗ | Memory increasing over time |
| Stable | → | Memory relatively constant |
| Falling | ↘ | Memory decreasing |

A continuously rising trend may indicate memory leaks.

### Warning Thresholds

```typescript
// Default thresholds (configurable)
const thresholds = {
  warning: 512 * 1024 * 1024,  // 512 MB - Yellow warning
  critical: 1024 * 1024 * 1024, // 1 GB - Red critical
};
```

## Memory Breakdown

### Category Bar

Visual breakdown of memory by type:

```
┌────────────────────────────────────────────────────────────────┐
│ Textures                                                       │
│ ████████████████████████████████████░░░░░░░░░  180 MB  (70%)  │
├────────────────────────────────────────────────────────────────┤
│ Geometry                                                       │
│ ███████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   56 MB  (22%)  │
├────────────────────────────────────────────────────────────────┤
│ Render Targets                                                 │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   20 MB   (8%)  │
└────────────────────────────────────────────────────────────────┘
```

### Category Details

Click a category for details:

**Textures:**
```
Texture Memory: 180 MB
├─ Diffuse maps:    80 MB (12 textures)
├─ Normal maps:     45 MB (8 textures)
├─ Environment:     30 MB (1 cubemap)
├─ Shadow maps:     20 MB (4 lights)
└─ Other:            5 MB (3 textures)

Largest: environment_hdr.ktx2 (24 MB)
Average size: 6.4 MB per texture
```

**Geometry:**
```
Geometry Memory: 56 MB
├─ Position data:   28 MB
├─ Normal data:     14 MB
├─ UV data:          8 MB
├─ Index buffers:    4 MB
└─ Other attributes: 2 MB

Largest: terrain_mesh (12 MB, 450K vertices)
Average: 0.6 MB per geometry
```

**Render Targets:**
```
Render Target Memory: 20 MB
├─ Shadow maps:     12 MB (4 × 2048²)
├─ Post-process:     6 MB (3 buffers)
└─ G-Buffer:         2 MB (deferred)

MSAA overhead: +8 MB (4 samples)
```

## Memory History Chart

### Time Series Visualization

```
Memory over time (60 seconds):

300MB ┤
      │                    ┌──────
250MB ┤               ┌────┘      Warning threshold
      │          ┌────┘
200MB ┤     ┌────┘
      │ ────┘
150MB ┤
      │
100MB ┤
      │
 50MB ┤
      │
  0MB ┼──────────────────────────────────────────►
      0s        20s        40s        60s
      
Legend: ■ Total ■ Textures ■ Geometry ■ RT
```

### Multi-Series View

Toggle visibility of different memory categories:

```
[✓] Total GPU    [✓] Textures    [✓] Geometry
[✓] Render Targets    [ ] JS Heap
```

## Resource Counts

### Quick Stats Grid

```
┌──────────┬──────────┬──────────┬──────────┐
│ Geometries│ Textures │ Shaders  │  RT     │
│    89    │    28    │    12    │    8    │
└──────────┴──────────┴──────────┴──────────┘
┌──────────┬──────────┬──────────┬──────────┐
│ Objects  │ Materials│  Lights  │ Cameras  │
│  1,234   │    45    │     8    │     2    │
└──────────┴──────────┴──────────┴──────────┘
```

Click any count to jump to the relevant panel.

## Memory Efficiency

### Efficiency Score

```
Memory Efficiency: B (72/100)
┌────────────────────────────────────────────────────────────────┐
│████████████████████████████████████████████████░░░░░░░░░░░░░░░│
└────────────────────────────────────────────────────────────────┘

Scoring factors:
├─ Texture compression:     -15 (no compressed textures)
├─ Geometry optimization:   -8  (high vertex count)
├─ Texture sizes:           -5  (some oversized)
└─ Base score:             100
```

### Grade Meanings

| Grade | Score | Description |
|-------|-------|-------------|
| A | 90-100 | Excellent memory management |
| B | 75-89 | Good, minor optimizations possible |
| C | 50-74 | Moderate, review recommended |
| D | 25-49 | Poor, optimization needed |
| F | 0-24 | Critical, major issues |

### Efficiency Metrics

```
Per-Resource Averages:
├─ Avg memory per object:  208 KB
├─ Avg texture size:       6.4 MB
├─ Avg geometry size:      629 KB
└─ Avg RT size:            2.5 MB
```

## Memory Distribution

### Texture Size Distribution

```
Texture Sizes (28 textures):
┌─────────────────────────────────────────────────────┐
│ ●●●●●●●●●●●●●●●●●░░░░░ Small (<512KB)    17 (61%)  │
│ ●●●●●●●●░░░░░░░░░░░░░░ Medium (<2MB)      8 (29%)  │
│ ●●●░░░░░░░░░░░░░░░░░░░ Large (>2MB)       3 (10%)  │
└─────────────────────────────────────────────────────┘

Largest texture: environment_hdr (24 MB, 2048×2048 HDR)
```

### Geometry Complexity Distribution

```
Geometry Complexity (89 geometries):
┌─────────────────────────────────────────────────────┐
│ ●●●●●●●●●●●●●●●●●●●●●● Simple (<1K verts)  65 (73%) │
│ ●●●●●●●●░░░░░░░░░░░░░░ Medium (<10K)       18 (20%) │
│ ●●●░░░░░░░░░░░░░░░░░░░ Complex (>10K)       6 (7%)  │
└─────────────────────────────────────────────────────┘

Largest geometry: terrain_mesh (450,000 vertices)
```

## JS Heap (Browser Memory)

When available, shows JavaScript heap usage:

```
JavaScript Heap:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Used: 128 MB / 512 MB limit                                   │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 25%       │
│                                                                 │
│  GC Events (last minute): 3                                    │
│  Last GC: 12 seconds ago                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

::: info
JS heap monitoring requires `performance.memory` API (Chrome only)
:::

## Memory Tips & Warnings

### Optimization Tips

```
💡 Optimization Suggestions:

1. Compress Textures
   16 textures could use KTX2/Basis compression
   Potential savings: ~120 MB (67%)

2. Reduce Texture Sizes
   3 textures are 4096×4096 on small objects
   Consider 1024×1024 for distant objects

3. Share Geometries
   12 identical BoxGeometry instances found
   Use shared geometry reference

4. Dispose Unused Resources
   2 textures have no material references
   Review for potential cleanup
```

### Memory Warnings

```
⚠️ Memory Warnings:

🟡 High texture memory (180 MB)
   Textures account for 70% of GPU memory
   Consider compression or lower resolutions

🟡 Potential memory growth
   Memory increased 15% in last 5 minutes
   Check for resource leaks

🔴 Approaching memory limit
   Current: 450 MB / 512 MB warning threshold
   Free up resources or optimize assets
```

## API Integration

### Get Memory Stats

```typescript
const stats = probe.getStats();
const memory = stats.memory;

console.log('Total GPU:', memory.totalGpuMemory);
console.log('Textures:', memory.textureMemory);
console.log('Geometry:', memory.geometryMemory);
console.log('Render Targets:', memory.renderTargetMemory);
```

### Memory History

```typescript
// Subscribe to memory updates
probe.on('stats', (stats) => {
  if (stats.memory) {
    trackMemoryHistory(stats.memory);
  }
});
```

### Custom Thresholds

```typescript
const probe = createProbe({
  thresholds: {
    maxGpuMemory: 256 * 1024 * 1024,    // 256 MB warning
    maxTextureMemory: 128 * 1024 * 1024, // 128 MB textures
    maxGeometryMemory: 64 * 1024 * 1024, // 64 MB geometry
  },
});
```

## Best Practices

1. **Monitor trends** - Watch for continuously rising memory
   ```
   Rising trend over minutes = potential leak
   ```

2. **Use compression** - GPU-compressed textures save ~75%
   ```typescript
   // Use KTX2 loader with Basis transcoder
   const ktx2Loader = new KTX2Loader();
   ktx2Loader.setTranscoderPath('/basis/');
   ```

3. **Right-size textures** - Match resolution to display size
   ```typescript
   // A 100-pixel UI element doesn't need 4096×4096
   ```

4. **Share resources** - Don't duplicate identical data
   ```typescript
   // Bad: new geometry per instance
   // Good: shared geometry, instanced mesh
   ```

5. **Dispose properly** - Free resources when done
   ```typescript
   texture.dispose();
   geometry.dispose();
   material.dispose();
   ```

6. **Profile on target devices** - Mobile has less memory
   ```
   Desktop: 1-4 GB GPU memory
   Mobile: 256-512 MB typical
   ```

7. **Use LOD** - Lower detail at distance
   ```typescript
   const lod = new THREE.LOD();
   lod.addLevel(highDetail, 0);
   lod.addLevel(mediumDetail, 50);
   lod.addLevel(lowDetail, 100);
   ```

## Related

- [Resources Panel](./resources-panel.md)
- [Textures Panel](./textures-panel.md)
- [Geometries Panel](./geometries-panel.md)
- [Memory Tracking](../core/memory-tracking.md)
