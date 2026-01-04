# DevtoolProbe API Reference

The `DevtoolProbe` is the main class for integrating 3Lens with your three.js application. It provides comprehensive APIs for observing renderers and scenes, tracking performance, managing selections, and extending functionality through plugins.

## Table of Contents

- [Creating a Probe](#creating-a-probe)
- [Renderer Management](#renderer-management)
- [Scene Management](#scene-management)
- [Object Selection](#object-selection)
- [Transform Gizmo](#transform-gizmo)
- [Camera Controls](#camera-controls)
- [Inspect Mode](#inspect-mode)
- [Logical Entities](#logical-entities)
- [Resource Tracking](#resource-tracking)
- [Plugin System](#plugin-system)
- [Event Subscriptions](#event-subscriptions)
- [Visualization Helpers](#visualization-helpers)

---

## Creating a Probe

### `createProbe(config)`

Factory function to create a new DevtoolProbe instance.

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({
  appName: 'My Three.js App',
  debug: false,
  rules: {
    maxDrawCalls: 1000,
    maxTriangles: 500000,
  },
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config` | `ProbeConfig` | Yes | Configuration options |

**Returns:** `DevtoolProbe`

---

## Renderer Management

### `observeRenderer(renderer)`

Start observing a three.js renderer. Automatically detects WebGL or WebGPU.

```typescript
probe.observeRenderer(renderer);
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `renderer` | `WebGLRenderer \| WebGPURenderer` | The three.js renderer |

### `isWebGL()` / `isWebGPU()`

Check the renderer backend type.

```typescript
if (probe.isWebGL()) {
  console.log('Using WebGL');
} else if (probe.isWebGPU()) {
  console.log('Using WebGPU');
}
```

### `getRendererKind()`

Get the renderer backend type as a string.

**Returns:** `'webgl' | 'webgpu' | null`

### `getRendererAdapter()`

Get the underlying renderer adapter for advanced operations.

**Returns:** `RendererAdapter | null`

---

## Scene Management

### `observeScene(scene)`

Start observing a scene for changes.

```typescript
probe.observeScene(scene);
```

### `unobserveScene(scene)`

Stop observing a scene.

```typescript
probe.unobserveScene(scene);
```

### `getObservedScenes()`

Get all currently observed scenes.

**Returns:** `THREE.Scene[]`

### `takeSnapshot()`

Take a manual snapshot of all observed scenes.

```typescript
const snapshot = probe.takeSnapshot();
console.log('Snapshot ID:', snapshot.snapshotId);
console.log('Scene count:', snapshot.scenes.length);
```

**Returns:** `SceneSnapshot`

---

## Object Selection

### `selectObject(obj)`

Select an object (or `null` to deselect).

```typescript
probe.selectObject(mesh);
// or deselect
probe.selectObject(null);
```

### `selectByDebugId(debugId)`

Select an object by its debug ID (used by UI components).

```typescript
const success = probe.selectByDebugId('mesh_123');
```

**Returns:** `boolean` - Whether the object was found and selected

### `selectObjectByUuid(uuid)`

Select an object by its three.js UUID.

```typescript
probe.selectObjectByUuid(mesh.uuid);
```

### `getSelectedObject()`

Get the currently selected object.

**Returns:** `THREE.Object3D | null`

### `clearSelection()`

Clear the current selection.

```typescript
probe.clearSelection();
```

---

## Transform Gizmo

### `initializeTransformGizmo(scene, camera, domElement, three)`

Initialize the transform gizmo for manipulating objects.

```typescript
import * as THREE from 'three';

probe.initializeTransformGizmo(scene, camera, renderer.domElement, THREE);
```

### `enableTransformGizmo()` / `disableTransformGizmo()`

Enable or disable the transform gizmo.

```typescript
await probe.enableTransformGizmo();
// ... later
probe.disableTransformGizmo();
```

### `setTransformMode(mode)`

Set the transform mode.

```typescript
probe.setTransformMode('translate'); // 'translate' | 'rotate' | 'scale'
```

### `setTransformSpace(space)`

Set the coordinate space for transformations.

```typescript
probe.setTransformSpace('world'); // 'world' | 'local'
```

### `toggleTransformSpace()`

Toggle between world and local space.

**Returns:** `TransformSpace` - The new space

### `setTransformSnapEnabled(enabled)`

Enable or disable snapping.

```typescript
probe.setTransformSnapEnabled(true);
```

### `setTransformSnapValues(translation?, rotation?, scale?)`

Set snap increment values.

```typescript
probe.setTransformSnapValues(1, 15, 0.1); // 1 unit, 15 degrees, 0.1 scale
```

### `undoTransform()` / `redoTransform()`

Undo or redo transform operations.

```typescript
if (probe.canUndoTransform()) {
  probe.undoTransform();
}
```

---

## Camera Controls

### `initializeCameraController(camera, three, orbitTarget?)`

Initialize camera controls for focus and fly-to animations.

```typescript
import * as THREE from 'three';

probe.initializeCameraController(camera, THREE, { x: 0, y: 0, z: 0 });
```

### `focusOnObject(object, padding?)`

Instantly focus the camera on an object.

```typescript
probe.focusOnObject(mesh, 1.5);
```

### `focusOnSelected(padding?)`

Focus on the currently selected object.

```typescript
probe.focusOnSelected(1.5);
```

### `flyToObject(object, options?)`

Animate the camera to focus on an object.

```typescript
probe.flyToObject(mesh, {
  duration: 1000,
  easing: 'easeInOutCubic',
  padding: 1.5,
});
```

### `flyToSelected(options?)`

Fly to the currently selected object.

```typescript
probe.flyToSelected({ duration: 500 });
```

### `goHome()` / `flyHome()`

Return to the home camera position.

```typescript
probe.goHome(); // Instant
probe.flyHome({ duration: 1000 }); // Animated
```

### `saveCurrentCameraAsHome()`

Save the current camera position as home.

```typescript
probe.saveCurrentCameraAsHome();
```

---

## Inspect Mode

### `initializeInspectMode(canvas, camera, three)`

Initialize interactive object picking.

```typescript
import * as THREE from 'three';

probe.initializeInspectMode(renderer.domElement, camera, THREE);
```

### `setInspectModeEnabled(enabled)`

Enable or disable inspect mode.

```typescript
probe.setInspectModeEnabled(true);
```

### `isInspectModeEnabled()`

Check if inspect mode is enabled.

**Returns:** `boolean`

### `setInspectModeCamera(camera)`

Update the camera used for raycasting.

```typescript
probe.setInspectModeCamera(newCamera);
```

### `setInspectModePickableObjects(objects)`

Restrict which objects can be picked.

```typescript
probe.setInspectModePickableObjects([mesh1, mesh2, mesh3]);
```

---

## Logical Entities

### `registerLogicalEntity(options)`

Register a logical entity mapping component to three.js objects.

```typescript
const playerId = probe.registerLogicalEntity({
  name: 'Player',
  module: '@game/feature-player',
  componentType: 'PlayerComponent',
  tags: ['controllable', 'saveable'],
  metadata: { health: 100 },
});
```

**Returns:** `EntityId`

### `addObjectToEntity(entityId, object)`

Add a three.js object to an entity.

```typescript
probe.addObjectToEntity(playerId, playerMesh);
```

### `removeObjectFromEntity(entityId, object)`

Remove a three.js object from an entity.

```typescript
probe.removeObjectFromEntity(playerId, playerMesh);
```

### `getLogicalEntities()`

Get all registered entities.

**Returns:** `NewLogicalEntity[]`

### `filterEntities(filter)`

Filter entities by criteria.

```typescript
// Get all entities in the game module
const gameEntities = probe.filterEntities({ modulePrefix: '@game/' });

// Get all controllable entities
const controllables = probe.filterEntities({ tags: ['controllable'] });
```

---

## Resource Tracking

### `getTextures()`

Get all textures from the renderer.

**Returns:** `TextureInfo[]`

### `getGeometries()`

Get all geometries from the renderer.

**Returns:** `GeometryInfo[]`

### `getMaterials()`

Get all materials from the renderer.

**Returns:** `MaterialInfo[]`

### `getGpuTimings()`

Get GPU timing information (if available).

**Returns:** `Promise<GpuTimingInfo | null>`

### `observeRenderTarget(renderTarget, usage?)`

Register a render target for observation.

```typescript
probe.observeRenderTarget(shadowMap, 'shadow-map');
probe.observeRenderTarget(postProcessTarget, 'post-process');
```

### `getResourceLifecycleSummary()`

Get resource lifecycle tracking summary.

**Returns:** `ResourceLifecycleSummary`

### `detectLeaks(options?)`

Run leak detection analysis.

**Returns:** `Promise<LeakReport>`

---

## Plugin System

### `registerPlugin(plugin)`

Register a devtool plugin.

```typescript
probe.registerPlugin({
  metadata: {
    id: 'com.example.my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
  },
  activate(context) {
    context.log('Plugin activated!');
  },
  panels: [{
    id: 'my-panel',
    name: 'My Panel',
    icon: '📊',
    render: (ctx) => '<div>Hello!</div>',
  }],
});
```

### `unregisterPlugin(pluginId)`

Unregister a plugin.

```typescript
await probe.unregisterPlugin('com.example.my-plugin');
```

### `activatePlugin(pluginId)` / `deactivatePlugin(pluginId)`

Activate or deactivate a plugin.

```typescript
await probe.activatePlugin('com.example.my-plugin');
```

### `getPluginManager()`

Get the plugin manager for advanced operations.

**Returns:** `PluginManager`

---

## Event Subscriptions

### `onFrameStats(callback)`

Subscribe to frame statistics updates.

```typescript
const unsubscribe = probe.onFrameStats((stats) => {
  console.log('FPS:', stats.fps);
  console.log('Draw Calls:', stats.drawCalls);
});

// Later: cleanup
unsubscribe();
```

### `onSnapshot(callback)`

Subscribe to scene snapshot updates.

```typescript
const unsubscribe = probe.onSnapshot((snapshot) => {
  console.log('Snapshot taken:', snapshot.snapshotId);
});
```

### `onSelectionChanged(callback)`

Subscribe to selection changes.

```typescript
const unsubscribe = probe.onSelectionChanged((obj, meta) => {
  if (obj) {
    console.log('Selected:', meta?.name);
  } else {
    console.log('Selection cleared');
  }
});
```

### `onRuleViolation(callback)`

Subscribe to rule violation alerts.

```typescript
const unsubscribe = probe.onRuleViolation((violation) => {
  console.warn(`Rule violated: ${violation.rule} - ${violation.message}`);
});
```

### `onResourceEvent(callback)`

Subscribe to resource lifecycle events.

```typescript
const unsubscribe = probe.onResourceEvent((event) => {
  console.log(`${event.type}: ${event.resourceType}`);
});
```

---

## Visualization Helpers

### `toggleWireframe(obj, enabled)`

Toggle wireframe visualization for an object.

```typescript
probe.toggleWireframe(mesh, true);
```

### `toggleBoundingBox(obj, enabled)`

Toggle bounding box visualization.

```typescript
probe.toggleBoundingBox(mesh, true);
```

### `toggleGlobalWireframe(enabled)`

Toggle wireframe for all meshes in all scenes.

```typescript
probe.toggleGlobalWireframe(true);
```

### `setThreeReference(three)`

Set the THREE.js library reference for visual helpers.

```typescript
import * as THREE from 'three';
probe.setThreeReference(THREE);
```

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `config` | `ProbeConfig` | The probe configuration |
| `threeVersion` | `string \| null` | Detected three.js version |
| `entityCount` | `number` | Number of registered entities |
| `moduleCount` | `number` | Number of registered modules |

---

## See Also

- [Configuration API](./config-api.md) - All configuration options
- [Events API](./events-api.md) - Detailed event documentation
- [Plugin API](./plugin-api.md) - Plugin development guide
- [Types Glossary](./types-glossary.md) - Type definitions
