# GeometryData Interface

The `GeometryData` interface represents serialized geometry information for display in the devtools UI. It contains vertex data, attribute details, memory usage, and bounding information for Three.js geometries.

## Overview

```typescript
import type { GeometryData, GeometrySummary } from '@3lens/core';

// Access geometries from a snapshot
const snapshot = probe.getSceneSnapshot();

snapshot.geometries?.forEach((geometry: GeometryData) => {
  console.log(`${geometry.name}: ${geometry.type}`);
  console.log(`  Vertices: ${geometry.vertexCount}`);
  console.log(`  Triangles: ${geometry.faceCount}`);
  console.log(`  Memory: ${(geometry.memoryBytes / 1024).toFixed(1)} KB`);
});
```

## Interface Definition

```typescript
interface GeometryData {
  // Identity
  uuid: string;
  name: string;
  type: string;
  
  // Counts
  vertexCount: number;
  indexCount: number;
  faceCount: number;
  isIndexed: boolean;
  
  // Attributes
  attributes: GeometryAttributeData[];
  
  // Memory
  memoryBytes: number;
  
  // Bounds
  boundingBox?: BoundingBox;
  boundingSphere?: BoundingSphere;
  
  // Draw configuration
  drawRange: { start: number; count: number };
  
  // Advanced features
  morphAttributes?: MorphAttributeInfo[];
  groups: GeometryGroupData[];
  
  // Usage
  usageCount: number;
  usedByMeshes: string[];
}
```

## Properties

### Identity

| Property | Type | Description |
|----------|------|-------------|
| `uuid` | `string` | Geometry UUID from Three.js |
| `name` | `string` | Geometry name |
| `type` | `string` | Geometry type (e.g., `'BufferGeometry'`, `'BoxGeometry'`) |

### Counts

| Property | Type | Description |
|----------|------|-------------|
| `vertexCount` | `number` | Total number of vertices |
| `indexCount` | `number` | Number of indices (0 if non-indexed) |
| `faceCount` | `number` | Number of triangles/faces |
| `isIndexed` | `boolean` | Whether geometry uses index buffer |

### Memory

| Property | Type | Description |
|----------|------|-------------|
| `memoryBytes` | `number` | Estimated GPU memory usage in bytes |

### Bounds

```typescript
interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

interface BoundingSphere {
  center: { x: number; y: number; z: number };
  radius: number;
}
```

### Draw Range

```typescript
drawRange: {
  start: number;   // Start index
  count: number;   // Number of indices/vertices to draw
}
```

## GeometryAttributeData

Detailed information about each buffer attribute:

```typescript
interface GeometryAttributeData {
  name: string;              // e.g., 'position', 'normal', 'uv'
  count: number;             // Number of items
  itemSize: number;          // Components per item (3 for vec3)
  normalized: boolean;       // Whether data is normalized
  arrayType: string;         // e.g., 'Float32Array', 'Uint16Array'
  memoryBytes: number;       // Memory usage for this attribute
  usage?: string;            // e.g., 'StaticDrawUsage'
  isInstancedAttribute: boolean;
  meshPerAttribute?: number; // Instance divisor
}
```

Common attribute names:
- `position` - Vertex positions (itemSize: 3)
- `normal` - Vertex normals (itemSize: 3)
- `uv` - Texture coordinates (itemSize: 2)
- `uv2` - Secondary UV set (itemSize: 2)
- `color` - Vertex colors (itemSize: 3 or 4)
- `tangent` - Tangent vectors (itemSize: 4)
- `skinIndex` - Bone indices (itemSize: 4)
- `skinWeight` - Bone weights (itemSize: 4)

## GeometryGroupData

For multi-material geometries:

```typescript
interface GeometryGroupData {
  start: number;         // Start index
  count: number;         // Number of indices in group
  materialIndex: number; // Material index for this group
}
```

## MorphAttributeInfo

For morph target animations:

```typescript
interface MorphAttributeInfo {
  name: string;   // Morph target name
  count: number;  // Number of morph targets
}
```

## GeometrySummary

Summary statistics for all geometries:

```typescript
interface GeometrySummary {
  totalCount: number;              // Total unique geometries
  totalVertices: number;           // Total vertex count
  totalTriangles: number;          // Total triangle count
  totalMemoryBytes: number;        // Total memory usage
  byType: Record<string, number>;  // Count by geometry type
}
```

## Usage Examples

### List All Geometries

```typescript
function listGeometries(snapshot: SceneSnapshot) {
  const summary = snapshot.geometriesSummary;
  
  console.log(`=== Geometries (${summary?.totalCount ?? 0}) ===`);
  console.log(`Total Vertices: ${summary?.totalVertices.toLocaleString()}`);
  console.log(`Total Triangles: ${summary?.totalTriangles.toLocaleString()}`);
  console.log(`Total Memory: ${((summary?.totalMemoryBytes ?? 0) / 1024 / 1024).toFixed(2)} MB`);
  
  snapshot.geometries?.forEach(geo => {
    console.log(`\n${geo.name || '(unnamed)'} [${geo.type}]`);
    console.log(`  Vertices: ${geo.vertexCount.toLocaleString()}`);
    console.log(`  Triangles: ${geo.faceCount.toLocaleString()}`);
    console.log(`  Memory: ${(geo.memoryBytes / 1024).toFixed(1)} KB`);
    console.log(`  Indexed: ${geo.isIndexed}`);
    console.log(`  Used by: ${geo.usageCount} mesh(es)`);
  });
}
```

### Find High-Poly Geometries

```typescript
function findHighPolyGeometries(snapshot: SceneSnapshot, threshold = 50000) {
  const highPoly = snapshot.geometries?.filter(geo => 
    geo.faceCount > threshold
  ) ?? [];
  
  if (highPoly.length > 0) {
    console.log(`Found ${highPoly.length} high-poly geometries (>${threshold} triangles):`);
    highPoly
      .sort((a, b) => b.faceCount - a.faceCount)
      .forEach(geo => {
        console.log(`  ${geo.name}: ${geo.faceCount.toLocaleString()} triangles`);
      });
  }
}
```

### Analyze Attributes

```typescript
function analyzeAttributes(snapshot: SceneSnapshot) {
  const attrStats: Record<string, { count: number; totalBytes: number }> = {};
  
  snapshot.geometries?.forEach(geo => {
    geo.attributes.forEach(attr => {
      if (!attrStats[attr.name]) {
        attrStats[attr.name] = { count: 0, totalBytes: 0 };
      }
      attrStats[attr.name].count++;
      attrStats[attr.name].totalBytes += attr.memoryBytes;
    });
  });
  
  console.log('Attribute Usage Analysis:');
  Object.entries(attrStats)
    .sort((a, b) => b[1].totalBytes - a[1].totalBytes)
    .forEach(([name, stats]) => {
      console.log(`  ${name}:`);
      console.log(`    Used in: ${stats.count} geometries`);
      console.log(`    Memory: ${(stats.totalBytes / 1024 / 1024).toFixed(2)} MB`);
    });
}
```

### Memory Optimization Suggestions

```typescript
function suggestOptimizations(snapshot: SceneSnapshot) {
  const suggestions: string[] = [];
  
  snapshot.geometries?.forEach(geo => {
    // Check for non-indexed geometry
    if (!geo.isIndexed && geo.vertexCount > 1000) {
      suggestions.push(
        `${geo.name}: Consider indexing (${geo.vertexCount} vertices, non-indexed)`
      );
    }
    
    // Check for unused attributes
    const hasUV2 = geo.attributes.some(a => a.name === 'uv2');
    if (hasUV2) {
      suggestions.push(
        `${geo.name}: Has uv2 attribute - verify it's needed for lightmaps`
      );
    }
    
    // Check for high vertex count with simple bounds
    if (geo.boundingSphere && geo.vertexCount > 10000) {
      const radius = geo.boundingSphere.radius;
      const density = geo.vertexCount / (4/3 * Math.PI * radius * radius * radius);
      if (density < 0.1) {
        suggestions.push(
          `${geo.name}: Low vertex density - consider LOD or decimation`
        );
      }
    }
    
    // Check for Float32 where lower precision might work
    geo.attributes.forEach(attr => {
      if (attr.name === 'uv' && attr.arrayType === 'Float32Array') {
        const uvBytes = attr.memoryBytes;
        if (uvBytes > 50000) {
          suggestions.push(
            `${geo.name}: UV could use Float16 (save ${(uvBytes / 2 / 1024).toFixed(1)} KB)`
          );
        }
      }
    });
  });
  
  if (suggestions.length > 0) {
    console.log('Optimization Suggestions:');
    suggestions.forEach(s => console.log(`  • ${s}`));
  } else {
    console.log('No obvious optimization opportunities found.');
  }
}
```

### Find Duplicate Geometries

```typescript
function findDuplicateGeometries(snapshot: SceneSnapshot) {
  const geometryHashes = new Map<string, GeometryData[]>();
  
  snapshot.geometries?.forEach(geo => {
    // Simple hash based on counts
    const hash = `${geo.vertexCount}-${geo.indexCount}-${geo.attributes.map(a => a.name).join(',')}`;
    
    if (!geometryHashes.has(hash)) {
      geometryHashes.set(hash, []);
    }
    geometryHashes.get(hash)!.push(geo);
  });
  
  // Find duplicates
  let duplicateBytes = 0;
  geometryHashes.forEach((geos, hash) => {
    if (geos.length > 1) {
      const duplicates = geos.length - 1;
      const wastedBytes = geos[0].memoryBytes * duplicates;
      duplicateBytes += wastedBytes;
      
      console.log(`Potential duplicates (${geos.length} instances):`);
      geos.forEach(g => console.log(`  - ${g.name || g.uuid}`));
      console.log(`  Wasted memory: ${(wastedBytes / 1024).toFixed(1)} KB`);
    }
  });
  
  if (duplicateBytes > 0) {
    console.log(`\nTotal potentially wasted: ${(duplicateBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log('Consider sharing geometry instances between meshes.');
  }
}
```

### Geometry Type Distribution

```typescript
function printTypeDistribution(summary: GeometrySummary) {
  console.log('Geometry Type Distribution:');
  
  const total = summary.totalCount;
  Object.entries(summary.byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const bar = '█'.repeat(Math.round((count / total) * 20));
      const percentage = ((count / total) * 100).toFixed(1);
      console.log(`  ${type.padEnd(20)} ${bar} ${count} (${percentage}%)`);
    });
}
```

## See Also

- [MaterialData](./material-info.md) - Material information
- [SceneSnapshot](./scene-snapshot.md) - Full scene snapshot
- [estimateGeometryMemory](./performance-calculator.md#estimategeometrymemory) - Memory estimation
