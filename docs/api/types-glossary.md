# Types Glossary

A comprehensive reference of all TypeScript types and interfaces used throughout 3Lens.

## Table of Contents

- [Core Types](#core-types)
- [Configuration Types](#configuration-types)
- [Frame Stats Types](#frame-stats-types)
- [Scene & Object Types](#scene--object-types)
- [Resource Types](#resource-types)
- [Entity Types](#entity-types)
- [Plugin Types](#plugin-types)
- [Transform Types](#transform-types)
- [Event Types](#event-types)
- [Utility Types](#utility-types)

---

## Core Types

### `DevtoolProbe`

The main probe class for observing three.js applications.

```typescript
class DevtoolProbe {
  readonly config: ProbeConfig;
  readonly threeVersion: string | null;
  readonly entityCount: number;
  readonly moduleCount: number;
  readonly pluginCount: number;
  readonly activePluginCount: number;
  
  // ... methods documented in probe-api.md
}
```

### `ProbeVersion`

Current probe version string.

```typescript
const PROBE_VERSION: string; // e.g., "1.0.0"
```

### `Unsubscribe`

Function type returned by event subscriptions.

```typescript
type Unsubscribe = () => void;
```

**Usage:**

```typescript
const unsubscribe: Unsubscribe = probe.onFrameStats(callback);
// Later
unsubscribe();
```

---

## Configuration Types

### `ProbeConfig`

Main configuration object for creating a probe.

```typescript
interface ProbeConfig {
  appName?: string;
  env?: 'development' | 'production' | 'test';
  debug?: boolean;
  sampling?: SamplingConfig;
  rules?: RulesConfig;
  tags?: string[];
}
```

### `SamplingConfig`

Controls data collection frequency.

```typescript
interface SamplingConfig {
  frameStats?: number | 'every-frame' | 'on-demand';
  snapshots?: number | 'on-change' | 'on-demand';
  gpuTiming?: boolean;
  resourceTracking?: boolean;
}
```

### `RulesConfig`

Performance threshold configuration.

```typescript
interface RulesConfig {
  maxDrawCalls?: number;
  maxTriangles?: number;
  maxFrameTimeMs?: number;
  maxActiveTextures?: number;
  maxUniformBuffers?: number;
  maxVertexAttributes?: number;
  maxTextureSize?: number;
  maxVerticesPerGeometry?: number;
  maxSceneObjects?: number;
  maxMaterials?: number;
  maxGeometries?: number;
  maxTextures?: number;
  maxBufferAttributes?: number;
  maxLights?: number;
  maxShadowMaps?: number;
  maxRenderTargets?: number;
  maxMemoryMB?: number;
  maxProgramCount?: number;
  warnOnLargeGeometry?: boolean;
  warnOnUnindexedGeometry?: boolean;
  customRules?: CustomRule[];
}
```

### `CustomRule`

User-defined performance rule.

```typescript
interface CustomRule {
  id: string;
  name: string;
  description?: string;
  evaluate: (context: RuleContext) => RuleResult;
}

interface RuleContext {
  frameStats: FrameStats;
  sceneStats: SceneStats;
  resourceStats: ResourceStats;
}

interface RuleResult {
  passed: boolean;
  value: number;
  threshold: number;
  message?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}
```

---

## Frame Stats Types

### `FrameStats`

Per-frame performance statistics.

```typescript
interface FrameStats {
  timestamp: number;
  frameNumber: number;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  textures: number;
  shaders: number;
  geometries: number;
  performance?: PerformanceMetrics;
  memory?: MemoryMetrics;
  violations?: RuleViolation[];
}
```

### `PerformanceMetrics`

Timing and frame rate data.

```typescript
interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  cpuTimeMs: number;
  gpuTimeMs: number | null;
  jank: boolean;
}
```

### `MemoryMetrics`

Memory usage statistics.

```typescript
interface MemoryMetrics {
  totalGpuMemory: number;      // bytes
  textureMemory: number;       // bytes
  geometryMemory: number;      // bytes
  jsHeapUsed: number;          // bytes
  jsHeapTotal?: number;        // bytes
}
```

### `RuleViolation`

Performance rule violation.

```typescript
interface RuleViolation {
  ruleId: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  value: number;
  threshold: number;
  timestamp: number;
}
```

### `GpuTimingInfo`

GPU timing query results.

```typescript
interface GpuTimingInfo {
  available: boolean;
  gpuTimeMs: number | null;
  passes?: GpuPassTiming[];
}

interface GpuPassTiming {
  name: string;
  timeMs: number;
}
```

---

## Scene & Object Types

### `SceneSnapshot`

Point-in-time scene capture.

```typescript
interface SceneSnapshot {
  snapshotId: string;
  timestamp: number;
  frameNumber: number;
  scenes: SceneData[];
}
```

### `SceneData`

Scene hierarchy data.

```typescript
interface SceneData {
  uuid: string;
  name: string;
  children: ObjectData[];
  objectCount: number;
  meshCount: number;
  lightCount: number;
  cameraCount: number;
  groupCount: number;
}
```

### `ObjectData`

Scene graph node data.

```typescript
interface ObjectData {
  debugId: string;
  uuid: string;
  name: string;
  type: string;
  visible: boolean;
  children: ObjectData[];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  frustumCulled?: boolean;
  renderOrder?: number;
  geometryUuid?: string;
  materialUuid?: string | string[];
  userData?: Record<string, unknown>;
}
```

### `ObjectMeta`

Metadata for a selected/referenced object.

```typescript
interface ObjectMeta {
  debugId: string;
  uuid: string;
  name: string;
  type: string;
  moduleId?: string;
  componentId?: string;
  entityId?: string;
}
```

### `ObjectRef`

Internal object reference with debug ID.

```typescript
interface ObjectRef {
  debugId: string;
  uuid: string;
  name: string;
  type: string;
  object: WeakRef<THREE.Object3D>;
}
```

---

## Resource Types

### `ResourceType`

Type of GPU resource.

```typescript
type ResourceType = 'geometry' | 'material' | 'texture';
```

### `TextureInfo`

Texture metadata.

```typescript
interface TextureInfo {
  uuid: string;
  name: string;
  type: string;             // e.g., 'Texture', 'DataTexture', 'CubeTexture'
  format: number;           // THREE.PixelFormat
  encoding: number;         // THREE.TextureEncoding
  wrapS: number;
  wrapT: number;
  magFilter: number;
  minFilter: number;
  anisotropy: number;
  width?: number;
  height?: number;
  mipmaps: boolean;
  memoryBytes?: number;
  source?: string;          // Image source URL if available
}
```

### `GeometryInfo`

Geometry metadata.

```typescript
interface GeometryInfo {
  uuid: string;
  name: string;
  type: string;             // e.g., 'BufferGeometry', 'BoxGeometry'
  vertexCount: number;
  indexCount?: number;
  indexed: boolean;
  attributes: AttributeInfo[];
  boundingBox?: BoundingBoxInfo;
  boundingSphere?: BoundingSphereInfo;
  memoryBytes: number;
}

interface AttributeInfo {
  name: string;
  itemSize: number;
  count: number;
  normalized: boolean;
  dynamic: boolean;
}

interface BoundingBoxInfo {
  min: [number, number, number];
  max: [number, number, number];
}

interface BoundingSphereInfo {
  center: [number, number, number];
  radius: number;
}
```

### `MaterialInfo`

Material metadata.

```typescript
interface MaterialInfo {
  uuid: string;
  name: string;
  type: string;             // e.g., 'MeshStandardMaterial'
  visible: boolean;
  transparent: boolean;
  opacity: number;
  side: number;             // THREE.Side
  depthTest: boolean;
  depthWrite: boolean;
  blending: number;         // THREE.Blending
  color?: number;           // Hex color
  emissive?: number;        // Hex color
  roughness?: number;
  metalness?: number;
  map?: string;             // Texture UUID
  normalMap?: string;       // Texture UUID
  // ... other maps
}
```

### `ResourceLifecycleEvent`

Resource creation/disposal event.

```typescript
interface ResourceLifecycleEvent {
  eventType: LifecycleEventType;
  resourceType: ResourceType;
  uuid: string;
  name?: string;
  subtype?: string;
  timestamp: number;
  ageMs: number;
  metadata?: Record<string, unknown>;
}

type LifecycleEventType = 'created' | 'disposed' | 'updated' | 'orphaned';
```

### `ResourceLifecycleSummary`

Aggregated resource statistics.

```typescript
interface ResourceLifecycleSummary {
  geometries: ResourceTypeSummary;
  materials: ResourceTypeSummary;
  textures: ResourceTypeSummary;
  totalEvents: number;
  oldestActiveResource?: {
    type: ResourceType;
    uuid: string;
    ageMs: number;
  };
}

interface ResourceTypeSummary {
  created: number;
  disposed: number;
  active: number;
  leaked: number;
}
```

---

## Entity Types

### `EntityId`

Unique identifier for logical entities.

```typescript
type EntityId = string;
```

### `LogicalEntity` / `NewLogicalEntity`

Logical entity registration.

```typescript
interface NewLogicalEntity {
  id: EntityId;
  name: string;
  moduleId?: string;
  componentType?: string;
  componentId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  objects: THREE.Object3D[];
}

interface LogicalEntityOptions {
  name: string;
  module?: string;
  componentType?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}
```

### `EntityFilter`

Filter criteria for entity queries.

```typescript
interface EntityFilter {
  modulePrefix?: string;
  tags?: string[];
  componentType?: string;
  hasObjects?: boolean;
}
```

### `EntityEvent`

Entity lifecycle event.

```typescript
interface EntityEvent {
  type: EntityEventType;
  entityId: EntityId;
  entity?: NewLogicalEntity;
  objectUuid?: string;
  timestamp: number;
}

type EntityEventType = 
  | 'entity-registered'
  | 'entity-updated'
  | 'entity-destroyed'
  | 'object-added'
  | 'object-removed';
```

---

## Plugin Types

### `PluginId`

Unique plugin identifier.

```typescript
type PluginId = string;
```

### `PluginState`

Plugin lifecycle state.

```typescript
type PluginState = 
  | 'inactive'
  | 'activating'
  | 'active'
  | 'deactivating'
  | 'error';
```

### `PluginMetadata`

Plugin identification and compatibility info.

```typescript
interface PluginMetadata {
  id: PluginId;
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  license?: string;
  repository?: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  minProbeVersion?: string;
  maxProbeVersion?: string;
}
```

### `DevtoolPlugin`

Complete plugin definition.

```typescript
interface DevtoolPlugin {
  metadata: PluginMetadata;
  activate(context: DevtoolContext): void | Promise<void>;
  deactivate?(context: DevtoolContext): void | Promise<void>;
  panels?: PanelDefinition[];
  toolbarActions?: ToolbarActionDefinition[];
  contextMenuItems?: ContextMenuItemDefinition[];
  settings?: PluginSettingsSchema;
  onSettingsChange?: (settings: Record<string, unknown>, context: DevtoolContext) => void;
}
```

### `PanelDefinition`

Plugin panel definition.

```typescript
interface PanelDefinition {
  id: string;
  name: string;
  icon?: string;
  priority?: number;
  render: (context: PanelRenderContext) => string | HTMLElement;
  onMount?(container: HTMLElement, context: PanelRenderContext): void;
  onUnmount?(container: HTMLElement, context: PanelRenderContext): void;
  onUpdate?(context: PanelRenderContext): void;
}
```

### `ToolbarActionDefinition`

Toolbar button definition.

```typescript
interface ToolbarActionDefinition {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  onClick: (context: DevtoolContext) => void | Promise<void>;
  isEnabled?: (context: DevtoolContext) => boolean;
  isActive?: (context: DevtoolContext) => boolean;
}
```

### `ContextMenuItemDefinition`

Context menu item definition.

```typescript
interface ContextMenuItemDefinition {
  id: string;
  label: string;
  icon?: string;
  shouldShow?: (target: ContextMenuTarget) => boolean;
  onClick: (target: ContextMenuTarget, context: DevtoolContext) => void;
  children?: ContextMenuItemDefinition[];
}

interface ContextMenuTarget {
  object: THREE.Object3D;
  meta: ObjectMeta;
}
```

### `PluginSettingsSchema`

Plugin settings definition.

```typescript
interface PluginSettingsSchema {
  fields: PluginSettingField[];
}

interface PluginSettingField {
  key: string;
  label: string;
  type: PluginSettingType;
  defaultValue: unknown;
  description?: string;
  options?: Array<{ value: unknown; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}

type PluginSettingType = 'string' | 'number' | 'boolean' | 'select' | 'color';
```

### `PluginLoadResult`

Result of loading a plugin.

```typescript
interface PluginLoadResult {
  success: boolean;
  plugin?: DevtoolPlugin;
  error?: Error;
  source: PluginSource;
}

interface PluginSource {
  type: 'npm' | 'url' | 'local';
  packageName?: string;
  version?: string;
  url?: string;
  autoActivate?: boolean;
}
```

---

## Transform Types

### `TransformMode`

Transform gizmo mode.

```typescript
type TransformMode = 'translate' | 'rotate' | 'scale';
```

### `TransformSpace`

Coordinate space for transformations.

```typescript
type TransformSpace = 'world' | 'local';
```

### `TransformState`

Object transform state.

```typescript
interface TransformState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}
```

### `TransformChangeEvent`

Transform operation event.

```typescript
interface TransformChangeEvent {
  objectUuid: string;
  mode: TransformMode;
  before: TransformState;
  after: TransformState;
  timestamp: number;
}
```

### `FlyToOptions`

Camera animation options.

```typescript
interface FlyToOptions {
  duration?: number;       // Animation duration in ms
  easing?: EasingFunction; // Easing function name
  padding?: number;        // Padding multiplier for framing
  onComplete?: () => void; // Completion callback
}

type EasingFunction = 
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic';
```

---

## Event Types

### `SelectionCallback`

Selection change callback.

```typescript
type SelectionCallback = (
  object: THREE.Object3D | null,
  meta: ObjectMeta | null
) => void;
```

### `DebugMessage`

Generic message for probe communication.

```typescript
interface DebugMessage {
  type: string;
  timestamp: number;
  id?: string;
  [key: string]: unknown;
}
```

### `MessageHandler`

Message handler function.

```typescript
type MessageHandler = (message: DebugMessage) => void;
```

---

## Utility Types

### `RendererKind`

Renderer backend type.

```typescript
type RendererKind = 'webgl' | 'webgpu';
```

### `DeepPartial<T>`

Recursively partial type.

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### `Vector3Tuple`

Position/rotation/scale array.

```typescript
type Vector3Tuple = [number, number, number];
```

### `ColorValue`

Color representation.

```typescript
type ColorValue = number | string | [number, number, number];
```

---

## Type Guards

3Lens exports type guards for runtime type checking:

```typescript
import { 
  isFrameStats, 
  isSceneSnapshot, 
  isRuleViolation,
  isMeshObject,
  isLightObject,
  isCameraObject,
} from '@3lens/core';

// Usage
if (isFrameStats(data)) {
  console.log('FPS:', data.performance?.fps);
}

if (isMeshObject(object)) {
  console.log('Geometry:', object.geometry.uuid);
}
```

---

## See Also

- [Probe API](./probe-api.md) - Main probe methods
- [Configuration API](./config-api.md) - Configuration details
- [Events API](./events-api.md) - Event subscriptions
- [Plugin API](./plugin-api.md) - Plugin development
