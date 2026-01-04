# SceneObserver Class

The `SceneObserver` class tracks changes to a Three.js scene graph and provides snapshot functionality for scene inspection. It's the core mechanism behind 3Lens scene tracking.

## Overview

```typescript
import { SceneObserver } from '@3lens/core';

const observer = new SceneObserver(scene, {
  onSceneChange: () => console.log('Scene changed'),
  onResourceEvent: (event) => console.log('Resource event:', event),
});

// Get a snapshot of the scene tree
const rootNode = observer.createSceneNode(scene);
```

::: tip Internal API
`SceneObserver` is used internally by `DevtoolProbe`. In most cases, you should use `probe.observeScene()` instead of creating observers directly.
:::

## API Reference

### Constructor

```typescript
new SceneObserver(scene: THREE.Scene, options?: SceneObserverOptions)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `scene` | `THREE.Scene` | The Three.js scene to observe |
| `options` | `SceneObserverOptions` | Optional configuration |

**SceneObserverOptions:**

```typescript
interface SceneObserverOptions {
  /** Called when the scene graph changes (objects added/removed) */
  onSceneChange?: () => void;
  
  /** Called when resource lifecycle events occur */
  onResourceEvent?: (event: ResourceLifecycleEvent) => void;
}
```

### Methods

#### createSceneNode

Creates a snapshot of the scene graph starting from a given object.

```typescript
createSceneNode(obj: THREE.Object3D): SceneNode
```

**Returns:** `SceneNode` - Complete tree structure with transform, visibility, and type-specific data.

#### getObjectRef

Gets the tracked reference for a Three.js object.

```typescript
getObjectRef(obj: THREE.Object3D): TrackedObjectRef | null
```

#### findObjectByDebugId

Finds a Three.js object by its stable debug ID.

```typescript
findObjectByDebugId(debugId: string): THREE.Object3D | null
```

#### collectMaterials

Collects all materials from the scene with usage information.

```typescript
collectMaterials(): { 
  materials: MaterialData[]; 
  summary: MaterialsSummary 
}
```

#### collectGeometries

Collects all geometries from the scene with memory estimates.

```typescript
collectGeometries(): { 
  geometries: GeometryData[]; 
  summary: GeometrySummary 
}
```

#### collectTextures

Collects all textures with material usage tracking.

```typescript
collectTextures(): { 
  textures: TextureData[]; 
  summary: TexturesSummary 
}
```

#### collectRenderTargets

Collects render targets (shadow maps, post-processing buffers).

```typescript
collectRenderTargets(): { 
  renderTargets: RenderTargetData[]; 
  summary: RenderTargetsSummary 
}
```

#### findMaterialByUuid

Finds a material by its Three.js UUID.

```typescript
findMaterialByUuid(uuid: string): THREE.Material | null
```

#### findGeometryByUuid

Finds a geometry by its Three.js UUID.

```typescript
findGeometryByUuid(uuid: string): THREE.BufferGeometry | null
```

#### findTextureByUuid

Finds a texture by its Three.js UUID.

```typescript
findTextureByUuid(uuid: string): THREE.Texture | null
```

#### getLifecycleTracker

Gets the resource lifecycle tracker for this observer.

```typescript
getLifecycleTracker(): ResourceLifecycleTracker
```

#### dispose

Cleans up the observer and removes scene patches.

```typescript
dispose(): void
```

## How It Works

### Scene Patching

The observer patches the scene's `add()` and `remove()` methods to track changes:

```
┌─────────────────────────────────────────────────────────────┐
│ Scene Method Patching                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   scene.add(object)                                         │
│        │                                                    │
│        ▼                                                    │
│   ┌─────────────────┐                                       │
│   │ SceneObserver   │                                       │
│   │ intercepts call │                                       │
│   └────────┬────────┘                                       │
│            │                                                │
│            ├──────> Track new object (create TrackedRef)    │
│            ├──────> Traverse children (recursive tracking)  │
│            ├──────> Fire onSceneChange callback             │
│            │                                                │
│            ▼                                                │
│   ┌─────────────────┐                                       │
│   │ Original add()  │                                       │
│   │ called          │                                       │
│   └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Object ID System

Each object gets two identifiers:

| ID Type | Source | Purpose |
|---------|--------|---------|
| `threeUuid` | `object.uuid` | Three.js internal ID |
| `debugId` | Generated | Stable ID for devtools |

The `debugId` is stable across scene updates while `threeUuid` can change if objects are recreated.

## Usage Examples

### Basic Scene Observation

```typescript
const observer = new SceneObserver(scene, {
  onSceneChange: () => {
    // Rebuild UI tree when scene changes
    const rootNode = observer.createSceneNode(scene);
    updateSceneTreeUI(rootNode);
  },
});
```

### Resource Collection

```typescript
// Get all materials with usage stats
const { materials, summary } = observer.collectMaterials();

console.log(`Total materials: ${summary.totalCount}`);
console.log(`Shader materials: ${summary.shaderMaterialCount}`);
console.log(`Transparent: ${summary.transparentCount}`);

// Find meshes using each material
materials.forEach((mat) => {
  console.log(`${mat.name}: used by ${mat.usedByMeshIds.length} meshes`);
});
```

### Finding Objects

```typescript
// Find by debug ID (from UI selection)
const debugId = 'obj_abc123xyz';
const object = observer.findObjectByDebugId(debugId);

if (object) {
  // Manipulate the object
  object.visible = !object.visible;
}
```

### Lifecycle Event Tracking

```typescript
const observer = new SceneObserver(scene, {
  onResourceEvent: (event) => {
    switch (event.type) {
      case 'created':
        console.log(`${event.resourceType} created:`, event.uuid);
        break;
      case 'disposed':
        console.log(`${event.resourceType} disposed:`, event.uuid);
        break;
      case 'orphaned':
        console.warn(`Potential leak - ${event.resourceType}:`, event.uuid);
        break;
    }
  },
});
```

## Performance Considerations

### Traversal Cost

Scene traversal is O(n) where n is the number of objects. For large scenes:

| Objects | Traversal Time |
|---------|----------------|
| 100 | ~0.1ms |
| 1,000 | ~1ms |
| 10,000 | ~10ms |
| 100,000 | ~100ms |

### Caching Strategy

The observer caches object references to avoid recreation:

```typescript
// First call - creates new TrackedObjectRef
const ref1 = observer.getObjectRef(mesh); // ~0.01ms

// Subsequent calls - returns cached ref
const ref2 = observer.getObjectRef(mesh); // ~0.001ms

ref1 === ref2; // true (same reference)
```

### Memory Usage

| Tracking | Memory per Object |
|----------|-------------------|
| TrackedObjectRef | ~200 bytes |
| Full SceneNode | ~1-2 KB |
| With thumbnails | ~10-50 KB |

## Integration with DevtoolProbe

The probe manages observer lifecycle:

```typescript
// Internal probe implementation
class DevtoolProbe {
  private _sceneObservers: Map<THREE.Scene, SceneObserver> = new Map();
  
  observeScene(scene: THREE.Scene) {
    if (this._sceneObservers.has(scene)) return;
    
    const observer = new SceneObserver(scene, {
      onSceneChange: () => this._notifySceneChange(scene),
      onResourceEvent: (e) => this._handleResourceEvent(e),
    });
    
    this._sceneObservers.set(scene, observer);
  }
  
  unobserveScene(scene: THREE.Scene) {
    const observer = this._sceneObservers.get(scene);
    if (observer) {
      observer.dispose();
      this._sceneObservers.delete(scene);
    }
  }
}
```

## Related

- [SceneNode Interface](./scene-node) - Scene tree structure
- [TrackedObjectRef](./tracked-object-ref) - Object reference interface
- [Scene Path Computation](./scene-path) - How paths are calculated
- [observeScene()](./observe-scene) - High-level scene observation
