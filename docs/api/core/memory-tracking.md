# Memory Tracking

3Lens provides comprehensive GPU memory tracking through estimation algorithms and real-time monitoring. This documentation covers how memory is estimated for various Three.js resources and how to monitor memory usage in your application.

## Overview

GPU memory tracking in 3Lens is based on estimation algorithms since browsers don't expose direct GPU memory APIs. The system tracks:

- **Geometry memory**: Vertex and index buffer sizes
- **Texture memory**: Based on dimensions, format, and mipmaps
- **Render target memory**: Framebuffer storage
- **Total GPU memory**: Aggregated across all resources

## MemoryStats Interface

```typescript
interface MemoryStats {
  geometries: number;           // Count of geometries
  textures: number;             // Count of textures
  geometryMemory: number;       // Estimated geometry memory (bytes)
  textureMemory: number;        // Estimated texture memory (bytes)
  totalGpuMemory: number;       // Total estimated GPU memory (bytes)
  renderTargets: number;        // Count of render targets
  renderTargetMemory: number;   // Estimated RT memory (bytes)
  programs: number;             // Active shader programs
  jsHeapSize?: number;          // JS heap size (if available)
  jsHeapLimit?: number;         // JS heap limit (if available)
}
```

## Accessing Memory Stats

Memory statistics are included in every frame's stats:

```typescript
const probe = createProbe({ /* config */ });

probe.on('frame', (stats) => {
  const memory = stats.memory;
  
  console.log(`Geometries: ${memory.geometries} (${formatBytes(memory.geometryMemory)})`);
  console.log(`Textures: ${memory.textures} (${formatBytes(memory.textureMemory)})`);
  console.log(`Total GPU: ${formatBytes(memory.totalGpuMemory)}`);
});
```

## Memory Estimation Functions

### estimateTextureMemory()

Estimates memory usage for a texture based on its properties.

```typescript
import { estimateTextureMemory } from '@3lens/core';

estimateTextureMemory(
  width: number,
  height: number,
  format?: string,
  mipmaps?: boolean
): number
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | `number` | - | Texture width in pixels |
| `height` | `number` | - | Texture height in pixels |
| `format` | `string` | `'RGBA'` | Texture format identifier |
| `mipmaps` | `boolean` | `true` | Whether mipmaps are generated |

**Format-to-Bytes Mapping:**

| Format | Bytes per Pixel |
|--------|-----------------|
| `RGBA` (default) | 4 |
| `RGB` | 3 |
| `LUMINANCE`, `ALPHA` | 1 |
| `HALF_FLOAT`, `FLOAT16` | 8 |
| `FLOAT` | 16 |
| `DXT1`, `BC1` | 0.5 |
| `DXT5`, `BC3`, `BC7` | 1 |

**Example:**

```typescript
// Standard 2K texture with mipmaps
const mem2K = estimateTextureMemory(2048, 2048, 'RGBA', true);
// Result: ~22.4 MB (2048 × 2048 × 4 × 1.33 for mipmaps)

// Compressed 4K texture without mipmaps
const mem4K = estimateTextureMemory(4096, 4096, 'DXT5', false);
// Result: ~16.8 MB (4096 × 4096 × 1)

// HDR environment map
const memHDR = estimateTextureMemory(1024, 512, 'FLOAT', true);
// Result: ~11.2 MB (1024 × 512 × 16 × 1.33)
```

### estimateGeometryMemory()

Estimates memory usage for geometry based on vertex count and attributes.

```typescript
import { estimateGeometryMemory } from '@3lens/core';

estimateGeometryMemory(
  vertexCount: number,
  indexCount: number,
  hasNormals?: boolean,
  hasUVs?: boolean,
  hasTangents?: boolean,
  hasColors?: boolean
): number
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `vertexCount` | `number` | - | Number of vertices |
| `indexCount` | `number` | - | Number of indices |
| `hasNormals` | `boolean` | `true` | Includes normal vectors |
| `hasUVs` | `boolean` | `true` | Includes UV coordinates |
| `hasTangents` | `boolean` | `false` | Includes tangent vectors |
| `hasColors` | `boolean` | `false` | Includes vertex colors |

**Attribute Memory Breakdown:**

| Attribute | Size per Vertex |
|-----------|-----------------|
| Position (required) | 12 bytes (3 floats) |
| Normal | 12 bytes (3 floats) |
| UV | 8 bytes (2 floats) |
| Tangent | 16 bytes (4 floats) |
| Color | 16 bytes (4 floats/bytes) |

**Index Buffer:**
- 2 bytes per index if `indexCount ≤ 65535`
- 4 bytes per index if `indexCount > 65535`

**Example:**

```typescript
// Standard mesh with normals and UVs
const meshMem = estimateGeometryMemory(10000, 30000, true, true, false, false);
// Vertex: 10000 × (12 + 12 + 8) = 320,000 bytes
// Index: 30000 × 2 = 60,000 bytes
// Total: 380,000 bytes (~371 KB)

// High-detail mesh with all attributes
const detailedMem = estimateGeometryMemory(100000, 300000, true, true, true, true);
// Vertex: 100000 × (12 + 12 + 8 + 16 + 16) = 6,400,000 bytes
// Index: 300000 × 4 = 1,200,000 bytes (>65535, so 4 bytes)
// Total: 7,600,000 bytes (~7.25 MB)
```

## Memory History Tracking

The `ResourceLifecycleTracker` maintains a memory history for trend analysis:

```typescript
const tracker = new ResourceLifecycleTracker();

// Get memory history (last 60 samples, ~1 per second)
const history = tracker.getMemoryHistory();
// Returns: Array<{ timestamp: number; estimatedBytes: number }>

// Get current estimated memory
const currentMemory = tracker.getEstimatedMemory();
```

## Memory Visualization

### Typical Memory Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│                     GPU Memory Breakdown                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Textures        ████████████████████████████████  68%         │
│  Geometries      ██████████████                    22%         │
│  Render Targets  ████                               8%         │
│  Other           █                                  2%         │
│                                                                 │
│  Total Estimated: 256 MB                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Memory Budget Recommendations

| Target Device | Texture Memory | Geometry Memory | Total Budget |
|---------------|----------------|-----------------|--------------|
| Mobile Low | 64 MB | 32 MB | 128 MB |
| Mobile High | 256 MB | 64 MB | 384 MB |
| Desktop | 512 MB | 128 MB | 768 MB |
| High-End | 1024 MB | 256 MB | 1.5 GB |

## Configuring Memory Thresholds

Set up alerts when memory exceeds thresholds:

```typescript
const probe = createProbe({
  thresholds: {
    maxTextureMemory: 256 * 1024 * 1024,   // 256 MB
    maxGeometryMemory: 64 * 1024 * 1024,   // 64 MB
  },
  onViolation: (violation) => {
    if (violation.rule === 'maxTextureMemory') {
      console.warn('Texture memory exceeded:', violation.message);
    }
  },
});
```

## Memory Optimization Tips

### Texture Optimization

```typescript
// Use compressed textures when possible
const compressedMem = estimateTextureMemory(2048, 2048, 'DXT5', true);
const uncompressedMem = estimateTextureMemory(2048, 2048, 'RGBA', true);
// Compressed: ~5.6 MB vs Uncompressed: ~22.4 MB (75% savings)

// Disable mipmaps for UI/2D elements
const noMipmapMem = estimateTextureMemory(1024, 1024, 'RGBA', false);
const withMipmapMem = estimateTextureMemory(1024, 1024, 'RGBA', true);
// No mipmaps: ~4 MB vs With mipmaps: ~5.3 MB (25% savings)
```

### Geometry Optimization

```typescript
// Share geometries between meshes
const sharedGeometry = new THREE.BoxGeometry(1, 1, 1);
const mesh1 = new THREE.Mesh(sharedGeometry, material1);
const mesh2 = new THREE.Mesh(sharedGeometry, material2);
// Only ONE geometry in GPU memory

// Use indexed geometry
// Non-indexed cube: 36 vertices (6 faces × 2 triangles × 3 vertices)
// Indexed cube: 8 vertices + 36 indices
// Memory: 36 × 32 = 1,152 bytes vs 8 × 32 + 36 × 2 = 328 bytes
```

## JS Heap Monitoring

When available, 3Lens also reports JavaScript heap memory:

```typescript
probe.on('frame', (stats) => {
  if (stats.memory.jsHeapSize !== undefined) {
    const heapUsage = stats.memory.jsHeapSize / stats.memory.jsHeapLimit! * 100;
    console.log(`JS Heap: ${heapUsage.toFixed(1)}%`);
  }
});
```

::: tip JS Heap Availability
`jsHeapSize` and `jsHeapLimit` are only available in Chromium-based browsers with `performance.memory` API enabled.
:::

## Memory Tracking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Memory Tracking Pipeline                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   Texture    │─────────│  Estimate    │                     │
│  │   Created    │         │  Memory      │                     │
│  └──────────────┘         └──────┬───────┘                     │
│                                  │                              │
│  ┌──────────────┐         ┌──────▼───────┐                     │
│  │   Geometry   │─────────│   Update     │                     │
│  │   Created    │         │   Totals     │                     │
│  └──────────────┘         └──────┬───────┘                     │
│                                  │                              │
│  ┌──────────────┐         ┌──────▼───────┐    ┌─────────────┐  │
│  │   Resource   │─────────│   Memory     │────│   Frame     │  │
│  │   Disposed   │         │   History    │    │   Stats     │  │
│  └──────────────┘         └──────────────┘    └─────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Utility Function: formatBytes()

Format byte values for display:

```typescript
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}
```

## See Also

- [ResourceLifecycleTracker](./resource-lifecycle-tracker) - Resource lifecycle monitoring
- [Leak Detection](./leak-detection) - Detecting memory leaks
- [Performance Thresholds](./performance-thresholds) - Configuring warning levels
- [FrameStats Interface](./frame-stats) - Complete frame statistics
