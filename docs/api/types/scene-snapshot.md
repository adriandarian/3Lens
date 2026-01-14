# SceneSnapshot Interface

The `SceneSnapshot` interface represents a complete point-in-time capture of the scene graph, including all objects, materials, geometries, textures, and render targets.

## Overview

```typescript
import type { SceneSnapshot } from '@3lens/core';

// Get a snapshot of the current scene state
const snapshot = probe.getSceneSnapshot();

console.log(`Snapshot ID: ${snapshot.snapshotId}`);
console.log(`Scenes: ${snapshot.scenes.length}`);
console.log(`Materials: ${snapshot.materials?.length ?? 0}`);
console.log(`Geometries: ${snapshot.geometries?.length ?? 0}`);
```

## Interface Definition

```typescript
interface SceneSnapshot {
  snapshotId: string;
  timestamp: number;
  scenes: SceneNode[];
  materials?: MaterialData[];
  materialsSummary?: MaterialsSummary;
  geometries?: GeometryData[];
  geometriesSummary?: GeometrySummary;
  textures?: TextureData[];
  texturesSummary?: TexturesSummary;
  renderTargets?: RenderTargetData[];
  renderTargetsSummary?: RenderTargetsSummary;
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `snapshotId` | `string` | Unique identifier for this snapshot |
| `timestamp` | `number` | When the snapshot was taken |
| `scenes` | `SceneNode[]` | Root nodes of all observed scenes |
| `materials` | `MaterialData[]?` | All materials in the scenes |
| `materialsSummary` | `MaterialsSummary?` | Material statistics summary |
| `geometries` | `GeometryData[]?` | All geometries in the scenes |
| `geometriesSummary` | `GeometrySummary?` | Geometry statistics summary |
| `textures` | `TextureData[]?` | All textures in the scenes |
| `texturesSummary` | `TexturesSummary?` | Texture statistics summary |
| `renderTargets` | `RenderTargetData[]?` | All render targets |
| `renderTargetsSummary` | `RenderTargetsSummary?` | Render target statistics |

## SceneNode

Represents a node in the scene graph hierarchy:

```typescript
interface SceneNode {
  ref: TrackedObjectRef;
  transform: TransformData;
  visible: boolean;
  frustumCulled: boolean;
  layers: number;
  renderOrder: number;
  boundingBox?: Box3Data;
  boundingSphere?: SphereData;
  children: SceneNode[];
  meshData?: MeshNodeData;
  lightData?: LightNodeData;
  cameraData?: CameraNodeData;
}
```

### TrackedObjectRef

```typescript
interface TrackedObjectRef {
  uuid: string;      // Object UUID
  name: string;      // Object name
  type: string;      // Object type (e.g., 'Mesh', 'Group')
  debugId: string;   // Unique debug identifier
  path: string;      // Scene path (e.g., '/Scene/Player/Body')
}
```

### TransformData

```typescript
interface TransformData {
  position: Vector3Data;
  rotation: EulerData;
  scale: Vector3Data;
  worldMatrix: Matrix4Data;
}

interface Vector3Data {
  x: number;
  y: number;
  z: number;
}

interface EulerData {
  x: number;
  y: number;
  z: number;
  order: string;  // e.g., 'XYZ'
}

interface Matrix4Data {
  elements: number[];  // 16 elements, column-major
}
```

### MeshNodeData

Additional data for mesh objects:

```typescript
interface MeshNodeData {
  geometryRef: string;      // Geometry UUID
  materialRefs: string[];   // Material UUID(s)
  vertexCount: number;
  faceCount: number;
  castShadow: boolean;
  receiveShadow: boolean;
  costData?: ObjectCostData;
}

interface ObjectCostData {
  triangleCost: number;
  materialComplexity: number;  // 1-10 scale
  textureCost: number;
  shadowCost: number;
  totalCost: number;
  costLevel: 'low' | 'medium' | 'high' | 'critical';
  materials: MaterialComplexityInfo[];
}
```

### LightNodeData

Additional data for light objects:

```typescript
interface LightNodeData {
  lightType: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere' | 'rect';
  color: number;       // Hex color
  intensity: number;
  castShadow: boolean;
  distance?: number;   // For point/spot lights
  decay?: number;      // For point/spot lights
  angle?: number;      // For spot lights
  penumbra?: number;   // For spot lights
}
```

### CameraNodeData

Additional data for camera objects:

```typescript
interface CameraNodeData {
  cameraType: 'perspective' | 'orthographic';
  fov?: number;        // For perspective
  near: number;
  far: number;
  aspect?: number;     // For perspective
  zoom?: number;       // For orthographic
  left?: number;       // For orthographic
  right?: number;
  top?: number;
  bottom?: number;
}
```

## Bounding Data

```typescript
interface Box3Data {
  min: Vector3Data;
  max: Vector3Data;
}

interface SphereData {
  center: Vector3Data;
  radius: number;
}
```

## Usage Examples

### Scene Tree Traversal

```typescript
function traverseSnapshot(node: SceneNode, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${node.ref.type}: ${node.ref.name || '(unnamed)'}`);
  
  if (node.meshData) {
    console.log(`${indent}  Vertices: ${node.meshData.vertexCount}`);
    console.log(`${indent}  Faces: ${node.meshData.faceCount}`);
  }
  
  if (node.lightData) {
    console.log(`${indent}  Light: ${node.lightData.lightType}`);
    console.log(`${indent}  Intensity: ${node.lightData.intensity}`);
  }
  
  node.children.forEach(child => traverseSnapshot(child, depth + 1));
}

const snapshot = probe.getSceneSnapshot();
snapshot.scenes.forEach(scene => traverseSnapshot(scene));
```

### Finding Objects by Type

```typescript
function findByType(node: SceneNode, type: string): SceneNode[] {
  const results: SceneNode[] = [];
  
  if (node.ref.type === type) {
    results.push(node);
  }
  
  node.children.forEach(child => {
    results.push(...findByType(child, type));
  });
  
  return results;
}

const snapshot = probe.getSceneSnapshot();
const allMeshes = snapshot.scenes.flatMap(scene => findByType(scene, 'Mesh'));

console.log(`Found ${allMeshes.length} meshes`);
```

### Cost Analysis

```typescript
function analyzeSceneCost(snapshot: SceneSnapshot) {
  const highCostObjects: SceneNode[] = [];
  
  function checkNode(node: SceneNode) {
    if (node.meshData?.costData?.costLevel === 'critical' ||
        node.meshData?.costData?.costLevel === 'high') {
      highCostObjects.push(node);
    }
    node.children.forEach(checkNode);
  }
  
  snapshot.scenes.forEach(checkNode);
  
  console.log(`High-cost objects: ${highCostObjects.length}`);
  highCostObjects.forEach(obj => {
    console.log(`  ${obj.ref.path}: ${obj.meshData?.costData?.totalCost}`);
  });
}
```

### Resource Summary

```typescript
function printResourceSummary(snapshot: SceneSnapshot) {
  console.log('=== Scene Snapshot Summary ===');
  console.log(`ID: ${snapshot.snapshotId}`);
  console.log(`Timestamp: ${new Date(snapshot.timestamp).toISOString()}`);
  
  if (snapshot.materialsSummary) {
    const ms = snapshot.materialsSummary;
    console.log(`\nMaterials: ${ms.totalCount}`);
    console.log(`  Shader materials: ${ms.shaderMaterialCount}`);
    console.log(`  Transparent: ${ms.transparentCount}`);
  }
  
  if (snapshot.geometriesSummary) {
    const gs = snapshot.geometriesSummary;
    console.log(`\nGeometries: ${gs.totalCount}`);
    console.log(`  Total vertices: ${gs.totalVertices.toLocaleString()}`);
    console.log(`  Total triangles: ${gs.totalTriangles.toLocaleString()}`);
    console.log(`  Memory: ${(gs.totalMemoryBytes / 1024 / 1024).toFixed(2)} MB`);
  }
  
  if (snapshot.texturesSummary) {
    const ts = snapshot.texturesSummary;
    console.log(`\nTextures: ${ts.totalCount}`);
    console.log(`  Memory: ${(ts.totalMemoryBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Compressed: ${ts.compressedCount}`);
    console.log(`  Cube textures: ${ts.cubeTextureCount}`);
  }
  
  if (snapshot.renderTargetsSummary) {
    const rs = snapshot.renderTargetsSummary;
    console.log(`\nRender Targets: ${rs.totalCount}`);
    console.log(`  Memory: ${(rs.totalMemoryBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Shadow maps: ${rs.shadowMapCount}`);
    console.log(`  Post-process: ${rs.postProcessCount}`);
  }
}
```

### Comparing Snapshots

```typescript
function compareSnapshots(before: SceneSnapshot, after: SceneSnapshot) {
  const beforeMats = before.materials?.length ?? 0;
  const afterMats = after.materials?.length ?? 0;
  
  const beforeGeos = before.geometries?.length ?? 0;
  const afterGeos = after.geometries?.length ?? 0;
  
  const beforeTex = before.textures?.length ?? 0;
  const afterTex = after.textures?.length ?? 0;
  
  console.log('Resource Changes:');
  console.log(`  Materials: ${beforeMats} -> ${afterMats} (${afterMats - beforeMats >= 0 ? '+' : ''}${afterMats - beforeMats})`);
  console.log(`  Geometries: ${beforeGeos} -> ${afterGeos} (${afterGeos - beforeGeos >= 0 ? '+' : ''}${afterGeos - beforeGeos})`);
  console.log(`  Textures: ${beforeTex} -> ${afterTex} (${afterTex - beforeTex >= 0 ? '+' : ''}${afterTex - beforeTex})`);
}
```

## See Also

- [MaterialData](./material-info.md) - Material data structure
- [GeometryData](./geometry-info.md) - Geometry data structure
- [TextureData](./texture-info.md) - Texture data structure
- [RenderTargetData](./render-target-info.md) - Render target data structure
- [TrackedObjectRef](./tracked-object-ref.md) - Object reference structure
