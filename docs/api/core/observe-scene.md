# observeScene()

The `observeScene()` method connects 3Lens to a three.js scene, enabling scene graph tracking, resource monitoring, object selection, and snapshot generation.

## Signature

```typescript
observeScene(scene: THREE.Scene): void
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `scene` | `THREE.Scene` | The three.js scene to observe |

## Basic Usage

```typescript
import { createProbe } from '@3lens/core';
import * as THREE from 'three';

const probe = createProbe({ appName: 'My App' });
const scene = new THREE.Scene();

// Connect probe to scene
probe.observeScene(scene);
```

## What Gets Tracked

When you observe a scene, 3Lens monitors:

### Scene Graph Structure

- Object hierarchy (parent-child relationships)
- Object types (Mesh, Light, Camera, Group, etc.)
- Object names and UUIDs
- Visibility state
- Transform data (position, rotation, scale)

### Resources

- **Materials** - Type, properties, shader programs
- **Geometries** - Vertex counts, attributes, bounding boxes
- **Textures** - Dimensions, format, memory usage
- **Render Targets** - Resolution, attachments, usage

### Changes

- Object additions and removals
- Property modifications
- Resource creation and disposal

## Multiple Scenes

Observe multiple scenes simultaneously:

```typescript
const mainScene = new THREE.Scene();
mainScene.name = 'Main';

const uiScene = new THREE.Scene();
uiScene.name = 'UI';

const debugScene = new THREE.Scene();
debugScene.name = 'Debug';

// Observe all three
probe.observeScene(mainScene);
probe.observeScene(uiScene);
probe.observeScene(debugScene);

// Get list of observed scenes
const scenes = probe.getObservedScenes();
console.log(`Observing ${scenes.length} scenes`);
// Output: "Observing 3 scenes"
```

## Scene Naming

Named scenes are easier to identify in the devtools:

```typescript
const scene = new THREE.Scene();
scene.name = 'Game World'; // Appears in Scene Explorer

probe.observeScene(scene);
```

## Automatic Change Detection

Scene changes trigger automatic snapshots (when configured):

```typescript
const probe = createProbe({
  appName: 'My App',
  sampling: {
    snapshots: 'on-change', // Default
  },
});

probe.observeScene(scene);

// Adding objects triggers a snapshot
scene.add(new THREE.Mesh(geometry, material));

// Subscribe to snapshot updates
probe.onSnapshot((snapshot) => {
  console.log(`Snapshot taken: ${snapshot.scenes.length} scenes`);
  console.log(`Total objects: ${countObjects(snapshot.scenes[0])}`);
});
```

### Snapshot Modes

| Mode | Description |
|------|-------------|
| `'on-change'` | Snapshot when scene graph changes (default) |
| `'manual'` | Only via `takeSnapshot()` |
| `'every-frame'` | Every frame (high overhead) |

## Manual Snapshots

Take snapshots on demand:

```typescript
// Take a snapshot now
const snapshot = probe.takeSnapshot();

console.log('Scene tree:', snapshot.scenes);
console.log('Materials:', snapshot.materials.length);
console.log('Geometries:', snapshot.geometries.length);
console.log('Textures:', snapshot.textures.length);
```

### Snapshot Structure

```typescript
interface SceneSnapshot {
  snapshotId: string;
  timestamp: number;
  
  // Scene graph
  scenes: SceneNode[];
  
  // Resources
  materials: MaterialData[];
  materialsSummary: MaterialsSummary;
  
  geometries: GeometryData[];
  geometriesSummary: GeometrySummary;
  
  textures: TextureData[];
  texturesSummary: TexturesSummary;
  
  renderTargets: RenderTargetData[];
  renderTargetsSummary: RenderTargetsSummary;
}
```

### SceneNode Structure

```typescript
interface SceneNode {
  debugId: string;
  uuid: string;
  name: string;
  type: string;
  visible: boolean;
  
  // Transform
  position: Vector3Data;
  rotation: EulerData;
  scale: Vector3Data;
  
  // Hierarchy
  children: SceneNode[];
  
  // Rendering info
  castShadow?: boolean;
  receiveShadow?: boolean;
  frustumCulled?: boolean;
  renderOrder?: number;
  
  // Type-specific data
  geometryUuid?: string;
  materialUuid?: string | string[];
  lightType?: string;
  intensity?: number;
  // ... more
}
```

## Object Path Computation

3Lens computes a path for each object in the scene graph:

```typescript
// Object hierarchy
scene.add(world);
world.add(player);
player.add(playerModel);

// Paths
// /Scene
// /Scene/World
// /Scene/World/Player
// /Scene/World/Player/Model

// Find object by path
probe.onSelectionChanged((obj, meta) => {
  console.log(`Selected: ${meta?.path}`);
  // Output: "Selected: /Scene/World/Player"
});
```

## Resource Collection

### Materials

```typescript
const snapshot = probe.takeSnapshot();

for (const mat of snapshot.materials) {
  console.log(`${mat.name} (${mat.type})`);
  console.log(`  Color: ${mat.color}`);
  console.log(`  Transparent: ${mat.transparent}`);
  console.log(`  Used by: ${mat.usedByObjects} objects`);
}

// Summary
const { materialsSummary } = snapshot;
console.log(`Total materials: ${materialsSummary.totalCount}`);
console.log(`By type:`, materialsSummary.byType);
// { MeshStandardMaterial: 5, MeshBasicMaterial: 2, ShaderMaterial: 1 }
```

### Geometries

```typescript
const snapshot = probe.takeSnapshot();

for (const geo of snapshot.geometries) {
  console.log(`${geo.name} (${geo.type})`);
  console.log(`  Vertices: ${geo.vertexCount}`);
  console.log(`  Triangles: ${geo.triangleCount}`);
  console.log(`  Memory: ${(geo.memoryBytes / 1024).toFixed(1)} KB`);
}

// Summary
const { geometriesSummary } = snapshot;
console.log(`Total vertices: ${geometriesSummary.totalVertices}`);
console.log(`Total triangles: ${geometriesSummary.totalTriangles}`);
console.log(`Memory: ${(geometriesSummary.totalMemoryBytes / 1024 / 1024).toFixed(2)} MB`);
```

### Textures

```typescript
const snapshot = probe.takeSnapshot();

for (const tex of snapshot.textures) {
  console.log(`${tex.name}`);
  console.log(`  Size: ${tex.width}x${tex.height}`);
  console.log(`  Format: ${tex.format}`);
  console.log(`  Memory: ${(tex.memoryBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Used by materials:`, tex.materialUsage);
}

// Summary
const { texturesSummary } = snapshot;
console.log(`Total textures: ${texturesSummary.totalCount}`);
console.log(`Total memory: ${(texturesSummary.totalMemoryBytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`Cube textures: ${texturesSummary.cubeTextureCount}`);
console.log(`Compressed: ${texturesSummary.compressedCount}`);
```

## Stop Observing

Remove scene observation when no longer needed:

```typescript
// Start observing
probe.observeScene(temporaryScene);

// ... do work ...

// Stop observing
probe.unobserveScene(temporaryScene);
```

::: tip
The scene and its objects are not disposed—only the observation is removed.
:::

## Combining with Renderer

Observe both renderer and scene for full functionality:

```typescript
const probe = createProbe({ appName: 'My App' });

// Observe renderer for frame stats
probe.observeRenderer(renderer);

// Observe scene for graph tracking
probe.observeScene(scene);

// Both work together
probe.onFrameStats((stats) => {
  console.log(`FPS: ${stats.performance?.fps}`);
  console.log(`Draw calls: ${stats.drawCalls}`);
});

const snapshot = probe.takeSnapshot();
console.log(`Objects: ${countObjects(snapshot.scenes[0])}`);
```

## Finding Objects

Find objects within observed scenes:

### By Debug ID

```typescript
// Each object gets a debugId for stable identification
probe.selectByDebugId('3lens_abc123');
```

### By UUID

```typescript
// Find using three.js UUID
for (const scene of probe.getObservedScenes()) {
  scene.traverse((obj) => {
    if (obj.uuid === targetUuid) {
      probe.selectObject(obj);
    }
  });
}
```

## Resource Lifecycle Events

Track resource creation and disposal:

```typescript
// This requires a scene observer
probe.observeScene(scene);

// Internal: handled by SceneObserver
// - Resource created events
// - Resource disposed events
// - Potential leak detection
```

## Complete Example

```typescript
import { createProbe } from '@3lens/core';
import * as THREE from 'three';

// Setup
const scene = new THREE.Scene();
scene.name = 'Game World';

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const renderer = new THREE.WebGLRenderer();

// Create probe
const probe = createProbe({
  appName: 'Scene Demo',
  sampling: {
    snapshots: 'on-change',
  },
});

// Observe
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Create hierarchy
const world = new THREE.Group();
world.name = 'World';
scene.add(world);

const player = new THREE.Group();
player.name = 'Player';
world.add(player);

const playerMesh = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.5, 1, 4, 8),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
playerMesh.name = 'PlayerModel';
player.add(playerMesh);

// Add many enemies
for (let i = 0; i < 10; i++) {
  const enemy = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  enemy.name = `Enemy_${i}`;
  enemy.position.set(Math.random() * 20 - 10, 0, Math.random() * 20 - 10);
  world.add(enemy);
}

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.name = 'Sun';
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Subscribe to snapshots
probe.onSnapshot((snapshot) => {
  console.log('Scene snapshot:');
  console.log(`  Scenes: ${snapshot.scenes.length}`);
  console.log(`  Materials: ${snapshot.materialsSummary.totalCount}`);
  console.log(`  Geometries: ${snapshot.geometriesSummary.totalCount}`);
  console.log(`  Textures: ${snapshot.texturesSummary.totalCount}`);
  
  // Print scene tree
  function printTree(node: SceneNode, indent = 0) {
    console.log('  '.repeat(indent) + `${node.name || node.type} (${node.type})`);
    for (const child of node.children) {
      printTree(child, indent + 1);
    }
  }
  
  for (const sceneNode of snapshot.scenes) {
    printTree(sceneNode);
  }
});

// Take initial snapshot
probe.takeSnapshot();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate player
  player.rotation.y += 0.01;
  
  renderer.render(scene, camera);
}
animate();

// Dynamic scene changes
setTimeout(() => {
  // Add new enemy - triggers snapshot
  const newEnemy = new THREE.Mesh(
    new THREE.SphereGeometry(0.5),
    new THREE.MeshStandardMaterial({ color: 0xff00ff })
  );
  newEnemy.name = 'BossEnemy';
  world.add(newEnemy);
  
  console.log('Added boss enemy');
}, 3000);

// Cleanup
window.addEventListener('beforeunload', () => {
  probe.dispose();
});
```

## Troubleshooting

### Scene Not Appearing in Devtools

1. Ensure `observeScene()` was called
2. Check scene has a name: `scene.name = 'My Scene'`
3. Verify scene has content (non-empty)

### Missing Resources in Snapshot

1. Resources must be in observed scenes
2. Orphaned resources (not attached to scene) won't appear
3. Call `takeSnapshot()` after adding content

### Performance Impact

1. Large scenes may have noticeable overhead
2. Use `snapshots: 'manual'` for very dynamic scenes
3. Consider unobserving temporary scenes when done

## Related API

| Method | Description |
|--------|-------------|
| [`unobserveScene()`](#stop-observing) | Stop observing a scene |
| [`getObservedScenes()`](./devtool-probe.md#getobservedscenes) | List observed scenes |
| [`takeSnapshot()`](./devtool-probe.md#takesnapshot) | Manual snapshot |
| [`onSnapshot()`](./devtool-probe.md#onsnapshot) | Subscribe to snapshots |
| [`selectObject()`](./selection-api.md#selectobject) | Select scene object |

## Related

- [observeRenderer()](./observe-renderer.md) - Renderer observation
- [Selection API](./selection-api.md) - Object selection
- [SceneSnapshot Reference](./scene-snapshot.md) - Snapshot structure
- [Probe Lifecycle](./probe-lifecycle.md) - Setup and teardown
