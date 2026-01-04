# SceneNode Interface

The `SceneNode` interface represents a node in the scene graph snapshot. It contains all the information needed to display and inspect a Three.js object in the devtools UI.

## Overview

```typescript
import type { SceneNode } from '@3lens/core';

// Get a scene snapshot
const rootNode: SceneNode = probe.getSceneSnapshot().scenes[0];

// Traverse the tree
function traverse(node: SceneNode, depth = 0) {
  console.log('  '.repeat(depth) + node.ref.name || `<${node.ref.type}>`);
  node.children.forEach((child) => traverse(child, depth + 1));
}

traverse(rootNode);
```

## Interface Definition

```typescript
interface SceneNode {
  /** Object reference with IDs and type */
  ref: TrackedObjectRef;
  
  /** Transform data (position, rotation, scale, world matrix) */
  transform: TransformData;
  
  /** Is object visible */
  visible: boolean;
  
  /** Is frustum culling enabled */
  frustumCulled: boolean;
  
  /** Object layers bitmask */
  layers: number;
  
  /** Render order */
  renderOrder: number;
  
  /** Bounding box (if computed) */
  boundingBox?: Box3Data;
  
  /** Bounding sphere (if computed) */
  boundingSphere?: SphereData;
  
  /** Child nodes */
  children: SceneNode[];
  
  /** Mesh-specific data (if this is a Mesh) */
  meshData?: MeshNodeData;
  
  /** Light-specific data (if this is a Light) */
  lightData?: LightNodeData;
  
  /** Camera-specific data (if this is a Camera) */
  cameraData?: CameraNodeData;
}
```

## Properties

### ref

Object reference containing identification info:

```typescript
interface TrackedObjectRef {
  debugId: string;      // Stable devtool ID (e.g., "obj_abc123")
  threeUuid: string;    // Three.js UUID
  type: string;         // Object type (e.g., "Mesh", "Group")
  name?: string;        // Object name property
  path?: string;        // Scene path (e.g., "/Scene/World/Player")
}
```

### transform

Complete transform data:

```typescript
interface TransformData {
  position: Vector3Data;    // Local position
  rotation: EulerData;      // Local rotation
  scale: Vector3Data;       // Local scale
  worldMatrix: Matrix4Data; // World transformation matrix
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
  order: string; // e.g., "XYZ"
}

interface Matrix4Data {
  elements: number[]; // 16-element array (column-major)
}
```

### meshData

Present only for Mesh objects:

```typescript
interface MeshNodeData {
  /** Geometry reference */
  geometryUuid: string;
  
  /** Material reference(s) */
  materialUuids: string[];
  
  /** Vertex count */
  vertexCount: number;
  
  /** Face/triangle count */
  faceCount: number;
  
  /** Is the mesh skinned (for animation) */
  isSkinned: boolean;
  
  /** Is the mesh instanced */
  isInstanced: boolean;
  
  /** Instance count (if instanced) */
  instanceCount?: number;
  
  /** Material summary */
  materialSummary: {
    type: string;
    textureCount: number;
    hasNormalMap: boolean;
    hasEnvMap: boolean;
    hasDisplacementMap: boolean;
    hasAoMap: boolean;
    transparent: boolean;
    alphaTest: boolean;
    doubleSided: boolean;
    complexityScore: number; // 1-10
  };
}
```

### lightData

Present only for Light objects:

```typescript
interface LightNodeData {
  /** Light type */
  lightType: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere' | 'rect';
  
  /** Light color as hex integer */
  color: number;
  
  /** Light intensity */
  intensity: number;
  
  /** Does this light cast shadows */
  castShadow: boolean;
  
  /** Distance (for point/spot lights) */
  distance?: number;
  
  /** Decay factor (for point/spot lights) */
  decay?: number;
  
  /** Angle in radians (for spot lights) */
  angle?: number;
  
  /** Penumbra factor (for spot lights) */
  penumbra?: number;
}
```

### cameraData

Present only for Camera objects:

```typescript
interface CameraNodeData {
  /** Camera type */
  cameraType: 'perspective' | 'orthographic';
  
  /** Near clipping plane */
  near: number;
  
  /** Far clipping plane */
  far: number;
  
  // Perspective camera properties
  fov?: number;
  aspect?: number;
  
  // Orthographic camera properties
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}
```

## Scene Graph Structure

```
┌─────────────────────────────────────────────────────────────┐
│ SceneNode Tree Structure                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ SceneNode (Scene)                                           │
│   ├── ref: { debugId, type: "Scene", path: "/" }            │
│   ├── transform: { ... }                                    │
│   ├── visible: true                                         │
│   └── children:                                             │
│       │                                                     │
│       ├── SceneNode (PerspectiveCamera)                     │
│       │   ├── ref: { type: "PerspectiveCamera" }            │
│       │   ├── cameraData: { fov: 75, near: 0.1, far: 1000 } │
│       │   └── children: []                                  │
│       │                                                     │
│       ├── SceneNode (DirectionalLight)                      │
│       │   ├── ref: { type: "DirectionalLight" }             │
│       │   ├── lightData: { intensity: 1, castShadow: true } │
│       │   └── children: []                                  │
│       │                                                     │
│       └── SceneNode (Group "World")                         │
│           ├── ref: { type: "Group", name: "World" }         │
│           └── children:                                     │
│               │                                             │
│               ├── SceneNode (Mesh "Player")                 │
│               │   ├── ref: { type: "Mesh", name: "Player" } │
│               │   ├── meshData: { vertexCount: 1000, ... }  │
│               │   └── children: []                          │
│               │                                             │
│               └── SceneNode (Mesh "Ground")                 │
│                   ├── ref: { type: "Mesh", name: "Ground" } │
│                   ├── meshData: { vertexCount: 4, ... }     │
│                   └── children: []                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Traversing the Scene Tree

```typescript
function countObjects(node: SceneNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countObjects(child), 0);
}

function findMeshes(node: SceneNode): SceneNode[] {
  const meshes: SceneNode[] = [];
  
  if (node.meshData) {
    meshes.push(node);
  }
  
  for (const child of node.children) {
    meshes.push(...findMeshes(child));
  }
  
  return meshes;
}

const snapshot = probe.getSceneSnapshot();
const root = snapshot.scenes[0];

console.log(`Total objects: ${countObjects(root)}`);
console.log(`Meshes: ${findMeshes(root).length}`);
```

### Finding Expensive Objects

```typescript
function findExpensiveMeshes(node: SceneNode, threshold = 10000): SceneNode[] {
  const expensive: SceneNode[] = [];
  
  if (node.meshData && node.meshData.vertexCount > threshold) {
    expensive.push(node);
  }
  
  for (const child of node.children) {
    expensive.push(...findExpensiveMeshes(child, threshold));
  }
  
  return expensive;
}

const expensiveMeshes = findExpensiveMeshes(root);
expensiveMeshes.forEach((mesh) => {
  console.log(`${mesh.ref.name}: ${mesh.meshData!.vertexCount} vertices`);
});
```

### Building UI Tree

```typescript
interface TreeItem {
  id: string;
  label: string;
  icon: string;
  children: TreeItem[];
  data: SceneNode;
}

function nodeToTreeItem(node: SceneNode): TreeItem {
  const icon = getIconForType(node);
  
  return {
    id: node.ref.debugId,
    label: node.ref.name || `<${node.ref.type}>`,
    icon,
    children: node.children.map(nodeToTreeItem),
    data: node,
  };
}

function getIconForType(node: SceneNode): string {
  if (node.meshData) return '🔷';
  if (node.lightData) return '💡';
  if (node.cameraData) return '📷';
  if (node.ref.type === 'Group') return '📁';
  if (node.ref.type === 'Scene') return '🎬';
  return '📦';
}
```

### Filtering by Visibility

```typescript
function getVisibleObjects(node: SceneNode): SceneNode[] {
  const visible: SceneNode[] = [];
  
  // Check if this node is visible
  if (node.visible) {
    visible.push(node);
    
    // Only traverse children if parent is visible
    for (const child of node.children) {
      visible.push(...getVisibleObjects(child));
    }
  }
  
  return visible;
}
```

### Analyzing Shadow Casters

```typescript
function getShadowCasters(node: SceneNode): SceneNode[] {
  const casters: SceneNode[] = [];
  
  if (node.lightData?.castShadow) {
    casters.push(node);
  }
  
  for (const child of node.children) {
    casters.push(...getShadowCasters(child));
  }
  
  return casters;
}

const shadowLights = getShadowCasters(root);
console.log(`Shadow-casting lights: ${shadowLights.length}`);
```

## Flattening for Virtual Lists

For large scenes, flatten the tree for virtual scrolling:

```typescript
interface FlatNode {
  node: SceneNode;
  depth: number;
  parentId: string | null;
  isExpanded: boolean;
}

function flattenTree(
  node: SceneNode, 
  expandedIds: Set<string>,
  depth = 0, 
  parentId: string | null = null
): FlatNode[] {
  const isExpanded = expandedIds.has(node.ref.debugId);
  const flat: FlatNode[] = [{
    node,
    depth,
    parentId,
    isExpanded,
  }];
  
  if (isExpanded) {
    for (const child of node.children) {
      flat.push(...flattenTree(child, expandedIds, depth + 1, node.ref.debugId));
    }
  }
  
  return flat;
}

// Usage with virtual list
const expandedIds = new Set(['obj_root', 'obj_world']);
const flatNodes = flattenTree(root, expandedIds);

// Render only visible items
const visibleNodes = flatNodes.slice(scrollOffset, scrollOffset + viewportSize);
```

## Type Guards

```typescript
function isMeshNode(node: SceneNode): node is SceneNode & { meshData: MeshNodeData } {
  return node.meshData !== undefined;
}

function isLightNode(node: SceneNode): node is SceneNode & { lightData: LightNodeData } {
  return node.lightData !== undefined;
}

function isCameraNode(node: SceneNode): node is SceneNode & { cameraData: CameraNodeData } {
  return node.cameraData !== undefined;
}

// Usage
if (isMeshNode(node)) {
  console.log(`Vertices: ${node.meshData.vertexCount}`);
}
```

## Related

- [SceneObserver](./scene-observer) - Creates SceneNode trees
- [TrackedObjectRef](./tracked-object-ref) - Object reference type
- [Scene Path Computation](./scene-path) - How paths are calculated
- [SceneSnapshot](./scene-snapshot) - Complete scene state
