# Geometries Panel

The Geometries panel provides detailed inspection of all geometry buffers in your scene, including vertex counts, attributes, memory usage, and visualization helpers.

## Overview

```typescript
// Open the Geometries panel
overlay.showPanel('geometry');
```

The Geometries panel helps you understand and optimize your mesh data:

- **Geometry list** with search and sorting
- **Vertex and triangle counts**
- **Buffer attribute details**
- **Memory usage per geometry**
- **Bounding box visualization**
- **Wireframe preview**

## Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  📐 Geometry                            [Search...    ] ─ □ ✕   │
├─────────────────────────────────────────────────────────────────┤
│  Summary: 89 Geometries | 2.4M Vertices | 1.2M Triangles        │
├─────────────────────────────────────────────────────────────────┤
│                                │                                │
│  📐 PlayerBody                 │  BufferGeometry                │
│    12,450 verts • 8,200 tris   │  ─────────────────────         │
│    2.4 MB                      │                                │
│                                │  Vertices: 12,450              │
│  📐 Ground               ◀    │  Triangles: 8,200              │
│    4 verts • 2 tris            │  Indices: 24,600               │
│    0.2 KB                      │                                │
│                                │  Attributes:                   │
│  📐 TreeTrunk                  │  ├─ position (vec3) 149 KB    │
│    2,400 verts • 1,600 tris    │  ├─ normal (vec3) 149 KB      │
│    576 KB                      │  ├─ uv (vec2) 99 KB           │
│                                │  └─ index (uint16) 49 KB      │
│  📐 TreeLeaves                 │                                │
│    45,000 verts • 30,000 tris  │  Bounding Box:                 │
│    5.4 MB • ⚠️ Large           │  min: (-5, 0, -5)             │
│                                │  max: (5, 10, 5)               │
│                                │                                │
│                                │  Used by: Ground (1 mesh)      │
│                                │                                │
│                                │  [Wireframe] [Bounds] [Log]    │
│                                │                                │
└─────────────────────────────────────────────────────────────────┘
```

## Geometry List

### Summary Bar

Aggregate statistics:

```
89 Geometries | 2.4M Vertices | 1.2M Triangles
      ↑              ↑               ↑
    Total      Sum of all    Sum of all faces
```

### List Items

Each geometry displays:

```
┌─────────────────────────────────────────────┐
│ 📐 GeometryName                     2.4 MB  │
│   12,450 verts • 8,200 tris                 │
│   [⚠️ Large]                                │
└─────────────────────────────────────────────┘
```

**Indicators:**
- Memory size badge
- `⚠️ Large` for geometries > 50K vertices
- `🔴 Very Large` for geometries > 100K vertices
- `📦 Instanced` for InstancedBufferGeometry

### Search & Filter

Filter by geometry name or type:

```typescript
// Search examples
"Player"      // Find geometries named "Player*"
"Buffer"      // Find BufferGeometry types
"Box"         // Find BoxGeometry, BoxBufferGeometry
```

### Sorting Options

Sort the list by:

- **Name** (alphabetical)
- **Vertices** (high to low)
- **Triangles** (high to low)
- **Memory** (high to low)
- **Type** (grouped by geometry type)

## Geometry Inspector

### Basic Information

```typescript
interface GeometryInfo {
  uuid: string;
  name: string;
  type: string;           // BufferGeometry, BoxGeometry, etc.
  vertexCount: number;
  faceCount: number;      // Triangle count
  indexCount: number;     // Index buffer size (if indexed)
  isIndexed: boolean;
  estimatedMemoryBytes: number;
}
```

### Buffer Attributes

Detailed attribute breakdown:

```
Attributes:
┌──────────────┬───────┬──────────┬─────────┐
│ Name         │ Type  │ Items    │ Memory  │
├──────────────┼───────┼──────────┼─────────┤
│ position     │ vec3  │ 12,450   │ 149 KB  │
│ normal       │ vec3  │ 12,450   │ 149 KB  │
│ uv           │ vec2  │ 12,450   │ 99 KB   │
│ tangent      │ vec4  │ 12,450   │ 199 KB  │
│ color        │ vec3  │ 12,450   │ 149 KB  │
└──────────────┴───────┴──────────┴─────────┘

Index Buffer:
├─ Type: Uint16Array
├─ Count: 24,600
└─ Memory: 49 KB
```

### Attribute Details

Click an attribute to see details:

```
Attribute: position
├─ Item Size: 3 (vec3)
├─ Count: 12,450
├─ Normalized: false
├─ Dynamic: false
├─ Usage: StaticDrawUsage
├─ Update Range: [0, -1] (full)
└─ Memory: 149,400 bytes

Value Preview (first 5):
[0]: (0.00, 1.50, 0.00)
[1]: (0.10, 1.48, 0.05)
[2]: (0.15, 1.45, 0.10)
[3]: (0.20, 1.40, 0.15)
[4]: (0.25, 1.35, 0.20)
```

### Bounding Information

```
Bounding Box:
├─ Min: (-5.00, 0.00, -5.00)
├─ Max: (5.00, 10.00, 5.00)
└─ Size: (10.00, 10.00, 10.00)

Bounding Sphere:
├─ Center: (0.00, 5.00, 0.00)
└─ Radius: 8.66
```

### Groups (Multi-material)

For geometries with multiple material groups:

```
Groups (3):
┌───────┬───────────┬───────┬──────────┐
│ Index │ Start     │ Count │ Material │
├───────┼───────────┼───────┼──────────┤
│ 0     │ 0         │ 3000  │ Body     │
│ 1     │ 3000      │ 1500  │ Eyes     │
│ 2     │ 4500      │ 500   │ Mouth    │
└───────┴───────────┴───────┴──────────┘
```

## Visualization Helpers

### Wireframe View

Toggle wireframe overlay for the selected geometry:

```typescript
// Temporarily shows geometry wireframe in scene
[Wireframe: ON] ← Click to toggle
```

This helps visualize:
- Edge distribution
- Triangle density
- Topology issues

### Bounding Box View

Show the geometry's bounding box in the scene:

```typescript
// Displays wireframe box around geometry
[Bounds: ON] ← Click to toggle
```

Useful for:
- Checking culling bounds
- Verifying model alignment
- Debugging collision volumes

### Normals Visualization

Display vertex normals:

```typescript
// Shows normal vectors as lines
[Normals: ON] ← Click to toggle
```

Helps identify:
- Flipped normals
- Smoothing issues
- Lighting problems

## Usage Information

### Mesh References

See which meshes use this geometry:

```
Used by (3 meshes):
├─ Player → Body
├─ Enemy01 → Body
└─ Enemy02 → Body
```

Click a mesh to select it in Scene Explorer.

::: tip Geometry Sharing
Geometries shared across multiple meshes indicate efficient memory usage. Single-use geometries may be candidates for merging.
:::

## Memory Analysis

### Memory Breakdown

```
Memory Usage: 2.4 MB
┌─────────────────────────────────────┐
│████████████████░░░░░░░░│ Positions (62%)
│██████████░░░░░░░░░░░░░░│ Normals (25%)
│████░░░░░░░░░░░░░░░░░░░░│ UVs (10%)
│██░░░░░░░░░░░░░░░░░░░░░░│ Index (3%)
└─────────────────────────────────────┘
```

### Optimization Suggestions

```
┌─────────────────────────────────────────────┐
│ 💡 Optimization Suggestions                 │
├─────────────────────────────────────────────┤
│ • Consider using indexed geometry           │
│   Potential savings: ~30%                   │
│                                             │
│ • Tangents can be computed at runtime       │
│   Saves: 199 KB                             │
│                                             │
│ • Consider using Uint16 index buffer        │
│   Current: Uint32 (vertices < 65536)        │
└─────────────────────────────────────────────┘
```

## Geometry Types Reference

| Type | Icon | Description |
|------|------|-------------|
| BufferGeometry | 📐 | Generic buffer geometry |
| BoxGeometry | 📦 | Box/cube primitive |
| SphereGeometry | ⚪ | Sphere primitive |
| PlaneGeometry | ▭ | Flat plane |
| CylinderGeometry | 🛢️ | Cylinder/cone |
| TorusGeometry | 🍩 | Torus ring |
| ExtrudeGeometry | 🔲 | Extruded shape |
| LatheGeometry | 🏺 | Revolved profile |
| InstancedBufferGeometry | 🔗 | Instanced geometry |

## API Integration

```typescript
// Get all geometries
const geometries = probe.getGeometries();

// Find specific geometry
const playerGeo = geometries.find(g => g.name === 'PlayerBody');

// Get geometry stats
console.log('Vertices:', playerGeo.vertexCount);
console.log('Memory:', playerGeo.estimatedMemoryBytes);

// Subscribe to geometry changes
probe.on('geometryUpdate', (geometry) => {
  console.log('Geometry updated:', geometry.name);
});
```

## Actions

### Log

Output geometry to console:

```typescript
console.log('3Lens Geometry:', geometry);
// Full THREE.BufferGeometry with all attributes
```

### Copy

Copy geometry creation code:

```typescript
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', 
  new THREE.Float32BufferAttribute([...], 3));
geometry.setAttribute('normal',
  new THREE.Float32BufferAttribute([...], 3));
geometry.setIndex([...]);
```

### Export

Export geometry as:
- **OBJ** - Wavefront format
- **GLTF** - GL Transmission Format
- **JSON** - Three.js JSON format

## Best Practices

1. **Name your geometries** - Easier identification
   ```typescript
   geometry.name = 'PlayerBody';
   ```

2. **Use indexed geometry** - Reduces memory for shared vertices
   ```typescript
   geometry.setIndex(indices);
   ```

3. **Share geometries** - Reuse across meshes
   ```typescript
   const sharedGeo = new THREE.BoxGeometry(1, 1, 1);
   mesh1.geometry = sharedGeo;
   mesh2.geometry = sharedGeo;
   ```

4. **Check attribute usage** - Remove unused attributes
   ```typescript
   geometry.deleteAttribute('uv2'); // If not needed
   ```

5. **Monitor large geometries** - Consider LOD for high-poly meshes

6. **Compute bounds** - Ensure bounding boxes are computed
   ```typescript
   geometry.computeBoundingBox();
   geometry.computeBoundingSphere();
   ```

## Related

- [Materials Panel](./materials-panel.md)
- [Memory Panel](./memory-panel.md)
- [Geometry Info Type](../core/geometry-info.md)
