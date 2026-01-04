# DevtoolProbe Class

The `DevtoolProbe` class is the **central API** for 3Lens. It manages renderer observation, scene tracking, object selection, performance monitoring, and communication with the overlay/extension.

## Import

```typescript
import { DevtoolProbe, createProbe } from '@3lens/core';
```

::: tip Recommended
Use [`createProbe()`](./create-probe.md) to create instances instead of `new DevtoolProbe()` directly. The factory handles auto-connection to the browser extension.
:::

## Class Overview

```typescript
class DevtoolProbe {
  // Configuration
  readonly config: ProbeConfig;
  
  // Properties
  get threeVersion(): string | null;
  get entityCount(): number;
  get moduleCount(): number;
  get pluginCount(): number;
  get activePluginCount(): number;
  
  // Renderer Management
  observeRenderer(renderer: THREE.WebGLRenderer | THREE.Renderer): void;
  isWebGL(): boolean;
  isWebGPU(): boolean;
  getRendererKind(): 'webgl' | 'webgpu' | null;
  getRendererAdapter(): RendererAdapter | null;
  
  // Scene Management
  observeScene(scene: THREE.Scene): void;
  unobserveScene(scene: THREE.Scene): void;
  getObservedScenes(): THREE.Scene[];
  
  // Selection
  selectObject(obj: THREE.Object3D | null): void;
  selectByDebugId(debugId: string | null): boolean;
  getSelectedObject(): THREE.Object3D | null;
  onSelectionChanged(callback): Unsubscribe;
  
  // Inspect Mode
  initializeInspectMode(canvas, camera, three): void;
  setInspectModeEnabled(enabled: boolean): void;
  isInspectModeEnabled(): boolean;
  
  // Frame Stats
  getLatestFrameStats(): FrameStats | null;
  getFrameStatsHistory(count?: number): FrameStats[];
  onFrameStats(callback): Unsubscribe;
  
  // Snapshots
  takeSnapshot(): SceneSnapshot;
  onSnapshot(callback): Unsubscribe;
  
  // Lifecycle
  connect(transport: Transport): void;
  disconnect(): void;
  isConnected(): boolean;
  dispose(): void;
  
  // ...and many more methods
}
```

## Constructor

```typescript
constructor(config: ProbeConfig)
```

Creates a new probe instance. **Prefer using `createProbe()` instead.**

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `ProbeConfig` | Probe configuration |

## Properties

### `config`

```typescript
readonly config: ProbeConfig
```

The probe's configuration object (read-only after construction).

### `threeVersion`

```typescript
get threeVersion(): string | null
```

The detected three.js version from the observed renderer. Returns `null` if no renderer is observed.

```typescript
const probe = createProbe({ appName: 'My App' });
probe.observeRenderer(renderer);
console.log(probe.threeVersion); // "0.160.0"
```

### `entityCount`

```typescript
get entityCount(): number
```

The number of registered logical entities.

### `moduleCount`

```typescript
get moduleCount(): number
```

The number of registered modules.

### `pluginCount`

```typescript
get pluginCount(): number
```

The number of registered plugins.

### `activePluginCount`

```typescript
get activePluginCount(): number
```

The number of currently active plugins.

## Renderer Management

### `observeRenderer()`

```typescript
observeRenderer(renderer: THREE.WebGLRenderer | THREE.Renderer): void
```

Start observing a three.js renderer. **Auto-detects WebGL vs WebGPU.**

```typescript
// WebGL Renderer
const renderer = new THREE.WebGLRenderer();
probe.observeRenderer(renderer);

// WebGPU Renderer
const gpuRenderer = new THREE.WebGPURenderer();
probe.observeRenderer(gpuRenderer);
```

::: info WebGPU Detection
The probe detects WebGPU renderers via the `isWebGPURenderer` property on the renderer object.
:::

### `isWebGL()`

```typescript
isWebGL(): boolean
```

Returns `true` if the current renderer is WebGL.

### `isWebGPU()`

```typescript
isWebGPU(): boolean
```

Returns `true` if the current renderer is WebGPU.

### `getRendererKind()`

```typescript
getRendererKind(): 'webgl' | 'webgpu' | null
```

Returns the renderer backend type, or `null` if no renderer is observed.

### `getRendererAdapter()`

```typescript
getRendererAdapter(): RendererAdapter | null
```

Returns the internal renderer adapter for advanced use cases.

### `attachRendererAdapter()`

```typescript
attachRendererAdapter(adapter: RendererAdapter): void
```

Attach a custom renderer adapter. For advanced use when auto-detection isn't suitable.

## Resource Queries

### `getTextures()`

```typescript
getTextures(): TextureInfo[]
```

Get all textures tracked by the renderer.

### `getGeometries()`

```typescript
getGeometries(): GeometryInfo[]
```

Get all geometries tracked by the renderer.

### `getMaterials()`

```typescript
getMaterials(): MaterialInfo[]
```

Get all materials tracked by the renderer.

### `getGpuTimings()`

```typescript
async getGpuTimings(): Promise<GpuTimingInfo | null>
```

Get GPU timing information (if available).

## Scene Management

### `observeScene()`

```typescript
observeScene(scene: THREE.Scene): void
```

Start observing a scene for changes. Multiple scenes can be observed simultaneously.

```typescript
const mainScene = new THREE.Scene();
const uiScene = new THREE.Scene();

probe.observeScene(mainScene);
probe.observeScene(uiScene);
```

### `unobserveScene()`

```typescript
unobserveScene(scene: THREE.Scene): void
```

Stop observing a scene.

### `getObservedScenes()`

```typescript
getObservedScenes(): THREE.Scene[]
```

Get all currently observed scenes.

## Render Target Management

### `observeRenderTarget()`

```typescript
observeRenderTarget(
  renderTarget: THREE.WebGLRenderTarget,
  usage?: RenderTargetUsage
): void
```

Register a render target for observation.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `renderTarget` | `WebGLRenderTarget` | - | The render target to observe |
| `usage` | `RenderTargetUsage` | `'custom'` | Usage hint for categorization |

**RenderTargetUsage values:**
- `'shadow-map'` - Shadow mapping
- `'post-process'` - Post-processing effects
- `'reflection'` - Environment reflections
- `'refraction'` - Refraction effects
- `'custom'` - Other uses

```typescript
const depthTarget = new THREE.WebGLRenderTarget(1024, 1024);
probe.observeRenderTarget(depthTarget, 'post-process');
```

### `unobserveRenderTarget()`

```typescript
unobserveRenderTarget(renderTarget: THREE.WebGLRenderTarget): void
```

Stop observing a render target.

### `getRegisteredRenderTargets()`

```typescript
getRegisteredRenderTargets(): Map<string, { 
  rt: THREE.WebGLRenderTarget; 
  usage: RenderTargetUsage 
}>
```

Get all registered render targets.

## THREE.js Reference

### `setThreeReference()`

```typescript
setThreeReference(three: typeof import('three')): void
```

Provide a reference to the THREE.js library. Required for:
- Selection highlighting (bounding boxes)
- Visualization helpers (wireframe, normals)
- Transform gizmos

```typescript
import * as THREE from 'three';

const probe = createProbe({ appName: 'My App' });
probe.setThreeReference(THREE);
```

### `updateSelectionHighlight()`

```typescript
updateSelectionHighlight(): void
```

Manually update selection highlight. Call this in your animation loop if selected objects move.

## Object Selection

See [Selection API](./selection-api.md) for detailed documentation.

### `selectObject()`

```typescript
selectObject(obj: THREE.Object3D | null): void
```

Select an object or clear selection (pass `null`).

### `selectByDebugId()`

```typescript
selectByDebugId(debugId: string | null): boolean
```

Select an object by its debug ID. Returns `true` if found.

### `getSelectedObject()`

```typescript
getSelectedObject(): THREE.Object3D | null
```

Get the currently selected object.

### `onSelectionChanged()`

```typescript
onSelectionChanged(
  callback: (obj: THREE.Object3D | null, meta?: ObjectMeta) => void
): Unsubscribe
```

Subscribe to selection changes.

```typescript
const unsubscribe = probe.onSelectionChanged((obj, meta) => {
  if (obj) {
    console.log('Selected:', meta?.name, obj.type);
  } else {
    console.log('Selection cleared');
  }
});

// Later: unsubscribe()
```

## Inspect Mode

See [Inspect Mode API](./inspect-mode-api.md) for detailed documentation.

### `initializeInspectMode()`

```typescript
initializeInspectMode(
  canvas: HTMLCanvasElement,
  camera: THREE.Camera,
  three: typeof import('three')
): void
```

Initialize inspect mode for interactive object picking.

### `setInspectModeEnabled()`

```typescript
setInspectModeEnabled(enabled: boolean): void
```

Enable or disable inspect mode.

### `isInspectModeEnabled()`

```typescript
isInspectModeEnabled(): boolean
```

Check if inspect mode is currently enabled.

### `setInspectModeCamera()`

```typescript
setInspectModeCamera(camera: THREE.Camera): void
```

Update the camera used for raycasting.

### `setInspectModePickableObjects()`

```typescript
setInspectModePickableObjects(objects: THREE.Object3D[]): void
```

Limit which objects can be picked.

## Visual Overlays

### `toggleWireframe()`

```typescript
toggleWireframe(obj: THREE.Object3D, enabled: boolean): void
```

Toggle wireframe visualization for an object.

### `toggleBoundingBox()`

```typescript
toggleBoundingBox(obj: THREE.Object3D, enabled: boolean): void
```

Toggle bounding box visualization for an object.

### `toggleGlobalWireframe()`

```typescript
toggleGlobalWireframe(enabled: boolean): void
```

Toggle wireframe mode for all meshes in all scenes.

### `isWireframeEnabled()`

```typescript
isWireframeEnabled(obj: THREE.Object3D): boolean
```

Check if wireframe is enabled for an object.

### `isBoundingBoxEnabled()`

```typescript
isBoundingBoxEnabled(obj: THREE.Object3D): boolean
```

Check if bounding box is enabled for an object.

## Frame Stats

### `getLatestFrameStats()`

```typescript
getLatestFrameStats(): FrameStats | null
```

Get the most recent frame statistics.

```typescript
const stats = probe.getLatestFrameStats();
if (stats) {
  console.log(`FPS: ${stats.performance?.fps}`);
  console.log(`Draw calls: ${stats.drawCalls}`);
  console.log(`Triangles: ${stats.triangles}`);
}
```

### `getFrameStatsHistory()`

```typescript
getFrameStatsHistory(count?: number): FrameStats[]
```

Get historical frame stats. Defaults to all history (up to 300 frames).

```typescript
// Get last 60 frames
const history = probe.getFrameStatsHistory(60);
const avgFps = history.reduce((sum, s) => sum + (s.performance?.fps ?? 0), 0) / history.length;
```

### `onFrameStats()`

```typescript
onFrameStats(callback: (stats: FrameStats) => void): Unsubscribe
```

Subscribe to frame stats updates.

```typescript
const unsubscribe = probe.onFrameStats((stats) => {
  updateDebugDisplay(stats);
});
```

## Snapshots

### `takeSnapshot()`

```typescript
takeSnapshot(): SceneSnapshot
```

Manually capture a snapshot of all observed scenes.

### `onSnapshot()`

```typescript
onSnapshot(callback: (snapshot: SceneSnapshot) => void): Unsubscribe
```

Subscribe to snapshot events.

## Custom Metrics

### `metric()`

```typescript
metric(name: string, value: number, tags?: Record<string, string>): void
```

Record a custom metric value.

```typescript
probe.metric('enemy-count', enemies.length, { level: 'boss' });
probe.metric('particle-count', particleSystem.count);
```

### `event()`

```typescript
event(name: string, data?: Record<string, unknown>): void
```

Record a custom event.

```typescript
probe.event('level-complete', { level: 5, time: 120, score: 15000 });
```

## Material Live Editing

### `updateMaterialProperty()`

```typescript
updateMaterialProperty(
  materialUuid: string, 
  property: string, 
  value: unknown
): void
```

Update a material property by UUID. Used for live editing from the overlay.

```typescript
// Change material color
probe.updateMaterialProperty(material.uuid, 'color', 0xff0000);

// Change roughness
probe.updateMaterialProperty(material.uuid, 'roughness', 0.5);
```

## Transport & Connection

### `connect()`

```typescript
connect(transport: Transport): void
```

Connect to a transport for communication with devtools.

### `disconnect()`

```typescript
disconnect(): void
```

Disconnect from the current transport.

### `isConnected()`

```typescript
isConnected(): boolean
```

Check if connected to a devtool UI.

### `onCommand()`

```typescript
onCommand(handler: (command: DebugMessage) => void): Unsubscribe
```

Handle commands from the devtool UI.

## Lifecycle

See [Probe Lifecycle](./probe-lifecycle.md) for detailed documentation.

### `dispose()`

```typescript
dispose(): void
```

Clean up all resources. **Always call this when done.**

```typescript
// React cleanup
useEffect(() => {
  const probe = createProbe({ appName: 'My App' });
  return () => probe.dispose();
}, []);
```

## Additional Systems

The `DevtoolProbe` also provides access to:

- **Transform Gizmo** - 3D manipulation controls
- **Camera Controller** - Focus, fly-to animations
- **Logical Entities** - Component ↔ Object mapping
- **Plugin System** - Extensibility
- **Configuration** - Rule checking

See their respective documentation pages for details.

## Type Definitions

### FrameStats

```typescript
interface FrameStats {
  timestamp: number;
  frameNumber: number;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  geometryCount: number;
  textureCount: number;
  programCount: number;
  memory?: MemoryStats;
  performance?: PerformanceMetrics;
  violations?: RuleViolation[];
}
```

### ObjectMeta

```typescript
interface ObjectMeta {
  debugId: string;
  uuid: string;
  name: string;
  type: string;
  visible: boolean;
  path: string;
}
```

### Unsubscribe

```typescript
type Unsubscribe = () => void;
```

## Related

- [createProbe()](./create-probe.md) - Factory function
- [Probe Lifecycle](./probe-lifecycle.md) - init, dispose, connect
- [Selection API](./selection-api.md) - Object selection details
- [Inspect Mode API](./inspect-mode-api.md) - Interactive picking
- [FrameStats Reference](./frame-stats.md) - Stats structure
