# 3Lens API Specification

This document defines the TypeScript interfaces and API contracts for 3Lens packages.

## Table of Contents

1. [Core Package (`@3lens/core`)](#core-package-3lenscore)
2. [Overlay Package (`@3lens/overlay`)](#overlay-package-3lensoverlay)
3. [Framework Bridges](#framework-bridges)
4. [Plugin API](#plugin-api)

---

## Core Package (`@3lens/core`)

### Configuration

```typescript
interface ProbeConfig {
  /**
   * Application name for identification
   */
  appName: string;
  
  /**
   * Environment identifier
   * @default 'development'
   */
  env?: 'development' | 'staging' | 'production' | string;
  
  /**
   * Sampling configuration
   */
  sampling?: SamplingConfig;
  
  /**
   * Performance rules and thresholds
   */
  rules?: RulesConfig;
  
  /**
   * Custom tags for organization
   */
  tags?: Record<string, string>;
  
  /**
   * Enable verbose logging
   * @default false
   */
  debug?: boolean;
}

interface SamplingConfig {
  /**
   * How often to collect frame stats
   * @default 'every-frame'
   */
  frameStats?: 'every-frame' | 'on-demand' | number; // number = every N frames
  
  /**
   * When to take scene snapshots
   * @default 'on-change'
   */
  snapshots?: 'manual' | 'on-change' | 'every-frame';
  
  /**
   * Enable GPU timing collection
   * @default true
   */
  gpuTiming?: boolean;
  
  /**
   * Enable resource lifecycle tracking
   * @default true
   */
  resourceTracking?: boolean;
}

interface RulesConfig {
  /**
   * Maximum draw calls before warning
   */
  maxDrawCalls?: number;
  
  /**
   * Maximum triangles before warning
   */
  maxTriangles?: number;
  
  /**
   * Maximum frame time (ms) before warning
   */
  maxFrameTimeMs?: number;
  
  /**
   * Maximum textures before warning
   */
  maxTextures?: number;
  
  /**
   * Maximum total texture memory (bytes)
   */
  maxTextureMemory?: number;
  
  /**
   * Custom rules
   */
  custom?: CustomRule[];
}

interface CustomRule {
  id: string;
  name: string;
  check: (stats: FrameStats) => RuleResult;
}

interface RuleResult {
  passed: boolean;
  message?: string;
  severity?: 'info' | 'warning' | 'error';
}
```

### Main Probe Class

```typescript
/**
 * Factory function to create a DevtoolProbe instance
 */
declare function createProbe(config: ProbeConfig): DevtoolProbe;

interface DevtoolProbe {
  /**
   * Probe configuration (read-only after creation)
   */
  readonly config: ProbeConfig;
  
  /**
   * Current three.js version detected
   */
  readonly threeVersion: string | null;
  
  // ─────────────────────────────────────────────────────────────────
  // RENDERER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Observe a three.js renderer (auto-detects WebGL/WebGPU)
   */
  observeRenderer(renderer: THREE.WebGLRenderer | THREE.WebGPURenderer): void;
  
  /**
   * Attach a custom renderer adapter
   */
  attachRendererAdapter(adapter: RendererAdapter): void;
  
  /**
   * Get the current renderer adapter
   */
  getRendererAdapter(): RendererAdapter | null;
  
  // ─────────────────────────────────────────────────────────────────
  // SCENE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Start observing a scene
   */
  observeScene(scene: THREE.Scene): void;
  
  /**
   * Stop observing a scene
   */
  unobserveScene(scene: THREE.Scene): void;
  
  /**
   * Get all observed scenes
   */
  getObservedScenes(): THREE.Scene[];
  
  /**
   * Take a manual snapshot of all observed scenes
   */
  takeSnapshot(): SceneSnapshot;
  
  // ─────────────────────────────────────────────────────────────────
  // OBJECT SELECTION
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Select an object (or null to deselect)
   */
  selectObject(obj: THREE.Object3D | null): void;
  
  /**
   * Get the currently selected object
   */
  getSelectedObject(): THREE.Object3D | null;
  
  /**
   * Subscribe to selection changes
   */
  onSelectionChanged(
    callback: (obj: THREE.Object3D | null, meta?: ObjectMeta) => void
  ): Unsubscribe;
  
  // ─────────────────────────────────────────────────────────────────
  // LOGICAL ENTITIES
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Register a logical entity (component ↔ three.js mapping)
   */
  registerLogicalEntity(entity: LogicalEntity): void;
  
  /**
   * Update an existing logical entity
   */
  updateLogicalEntity(id: string, updates: Partial<LogicalEntity>): void;
  
  /**
   * Unregister a logical entity
   */
  unregisterLogicalEntity(id: string): void;
  
  /**
   * Get all registered logical entities
   */
  getLogicalEntities(): LogicalEntity[];
  
  /**
   * Find entity by three.js object
   */
  findEntityByObject(obj: THREE.Object3D): LogicalEntity | null;
  
  // ─────────────────────────────────────────────────────────────────
  // CUSTOM METRICS
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Record a custom metric value
   */
  metric(name: string, value: number, tags?: Record<string, string>): void;
  
  /**
   * Record a custom event
   */
  event(name: string, data?: Record<string, unknown>): void;
  
  // ─────────────────────────────────────────────────────────────────
  // FRAME STATS
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Get the latest frame stats
   */
  getLatestFrameStats(): FrameStats | null;
  
  /**
   * Get frame stats history
   */
  getFrameStatsHistory(count?: number): FrameStats[];
  
  /**
   * Subscribe to frame stats updates
   */
  onFrameStats(callback: (stats: FrameStats) => void): Unsubscribe;
  
  // ─────────────────────────────────────────────────────────────────
  // COMMANDS (from DevTool UI)
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Handle commands from the devtool UI
   */
  onCommand(handler: (command: DevtoolCommand) => void): Unsubscribe;
  
  /**
   * Execute a built-in command
   */
  executeCommand(command: DevtoolCommand): void;
  
  // ─────────────────────────────────────────────────────────────────
  // TRANSPORT
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Connect to a transport (auto-connected for browser extension)
   */
  connect(transport: Transport): void;
  
  /**
   * Disconnect from transport
   */
  disconnect(): void;
  
  /**
   * Check if connected to a devtool UI
   */
  isConnected(): boolean;
  
  // ─────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Dispose of the probe and clean up
   */
  dispose(): void;
}

type Unsubscribe = () => void;
```

### Data Types

```typescript
// ─────────────────────────────────────────────────────────────────
// OBJECT REFERENCES
// ─────────────────────────────────────────────────────────────────

interface TrackedObjectRef {
  debugId: string;
  threeUuid: string;
  type: string;
  name?: string;
  path?: string;
}

interface ObjectMeta extends TrackedObjectRef {
  moduleId?: string;
  componentId?: string;
  entityId?: string;
}

// ─────────────────────────────────────────────────────────────────
// LOGICAL ENTITIES
// ─────────────────────────────────────────────────────────────────

interface LogicalEntity {
  /**
   * Unique identifier for this entity
   */
  id: string;
  
  /**
   * Human-readable label
   */
  label: string;
  
  /**
   * Module/library identifier (for Nx/ngLib)
   */
  moduleId?: string;
  
  /**
   * Framework component identifier
   */
  componentId?: string;
  
  /**
   * Associated three.js objects
   */
  objects: THREE.Object3D[];
  
  /**
   * Custom metadata
   */
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────
// FRAME STATISTICS
// ─────────────────────────────────────────────────────────────────

interface FrameStats {
  frame: number;
  timestamp: number;
  
  // Timing
  cpuTimeMs: number;
  gpuTimeMs?: number;
  
  // Counts
  triangles: number;
  drawCalls: number;
  points: number;
  lines: number;
  
  // Objects
  objectsVisible: number;
  objectsTotal: number;
  materialsUsed: number;
  
  // Backend
  backend: RendererKind;
  
  // Backend-specific extras
  webglExtras?: WebGLFrameExtras;
  webgpuExtras?: WebGPUFrameExtras;
  
  // Rule violations (if any)
  violations?: RuleViolation[];
}

interface WebGLFrameExtras {
  programSwitches: number;
  textureBindings: number;
  geometryCount: number;
  textureCount: number;
  programs: number;
}

interface WebGPUFrameExtras {
  pipelinesUsed: number;
  bindGroupsUsed: number;
  buffersUsed: number;
  timestampBreakdown?: Record<string, number>;
}

interface RuleViolation {
  ruleId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  value?: number;
  threshold?: number;
}

// ─────────────────────────────────────────────────────────────────
// SCENE SNAPSHOTS
// ─────────────────────────────────────────────────────────────────

interface SceneSnapshot {
  snapshotId: string;
  timestamp: number;
  scenes: SceneNode[];
}

interface SceneNode {
  ref: TrackedObjectRef;
  transform: TransformData;
  visible: boolean;
  frustumCulled: boolean;
  layers: number;
  renderOrder: number;
  
  // Bounds
  boundingBox?: Box3Data;
  boundingSphere?: SphereData;
  
  // Children
  children: SceneNode[];
  
  // Type-specific data
  meshData?: MeshNodeData;
  lightData?: LightNodeData;
  cameraData?: CameraNodeData;
  groupData?: GroupNodeData;
}

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
  order: string;
}

interface Matrix4Data {
  elements: number[]; // 16 elements
}

interface Box3Data {
  min: Vector3Data;
  max: Vector3Data;
}

interface SphereData {
  center: Vector3Data;
  radius: number;
}

interface MeshNodeData {
  geometryRef: string;
  materialRefs: string[];
  vertexCount: number;
  faceCount: number;
  castShadow: boolean;
  receiveShadow: boolean;
}

interface LightNodeData {
  lightType: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere' | 'rect';
  color: number;
  intensity: number;
  castShadow: boolean;
  // Type-specific properties
  distance?: number;
  decay?: number;
  angle?: number;
  penumbra?: number;
}

interface CameraNodeData {
  cameraType: 'perspective' | 'orthographic';
  near: number;
  far: number;
  // Perspective
  fov?: number;
  aspect?: number;
  // Orthographic
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

interface GroupNodeData {
  // Currently empty, but extensible
}

// ─────────────────────────────────────────────────────────────────
// MATERIALS
// ─────────────────────────────────────────────────────────────────

interface MaterialInfo {
  ref: string;
  type: string;
  name?: string;
  
  // Common properties
  color?: number;
  opacity: number;
  transparent: boolean;
  visible: boolean;
  side: number;
  depthWrite: boolean;
  depthTest: boolean;
  
  // Standard/Physical
  metalness?: number;
  roughness?: number;
  emissive?: number;
  emissiveIntensity?: number;
  
  // Maps
  mapRefs?: TextureRefMap;
  
  // Shader
  isShaderMaterial: boolean;
  vertexShader?: string;
  fragmentShader?: string;
  uniforms?: Record<string, UniformValue>;
  defines?: Record<string, string | number | boolean>;
}

interface TextureRefMap {
  map?: string;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  emissiveMap?: string;
  aoMap?: string;
  displacementMap?: string;
  alphaMap?: string;
  envMap?: string;
  lightMap?: string;
  bumpMap?: string;
}

interface UniformValue {
  type: string;
  value: unknown;
}

// ─────────────────────────────────────────────────────────────────
// GEOMETRY
// ─────────────────────────────────────────────────────────────────

interface GeometryInfo {
  ref: string;
  type: string;
  name?: string;
  
  // Stats
  vertexCount: number;
  indexCount?: number;
  faceCount: number;
  
  // Attributes
  attributes: AttributeInfo[];
  
  // Memory
  estimatedMemoryBytes: number;
  
  // Bounds
  boundingBox?: Box3Data;
  boundingSphere?: SphereData;
}

interface AttributeInfo {
  name: string;
  itemSize: number;
  count: number;
  normalized: boolean;
  usage: string;
}

// ─────────────────────────────────────────────────────────────────
// TEXTURES
// ─────────────────────────────────────────────────────────────────

interface TextureInfo {
  ref: string;
  type: string;
  name?: string;
  
  // Dimensions
  width: number;
  height: number;
  depth?: number;
  
  // Format
  format: number;
  internalFormat?: string;
  type_: number;
  
  // Settings
  wrapS: number;
  wrapT: number;
  magFilter: number;
  minFilter: number;
  anisotropy: number;
  generateMipmaps: boolean;
  
  // Memory
  estimatedMemoryBytes: number;
  
  // Source
  sourceType: 'image' | 'canvas' | 'video' | 'data' | 'compressed' | 'render-target';
  
  // Usage tracking
  usedByMaterials: string[];
  lastUsedFrame?: number;
}

// ─────────────────────────────────────────────────────────────────
// RENDER TARGETS
// ─────────────────────────────────────────────────────────────────

interface RenderTargetInfo {
  ref: string;
  name?: string;
  
  width: number;
  height: number;
  samples: number;
  
  // Textures
  colorTextures: TextureInfo[];
  depthTexture?: TextureInfo;
  
  // Usage
  purpose?: string;
  lastUsedFrame?: number;
  
  // Memory
  estimatedMemoryBytes: number;
}

// ─────────────────────────────────────────────────────────────────
// RESOURCE EVENTS
// ─────────────────────────────────────────────────────────────────

interface ResourceEvent {
  eventType: 'created' | 'updated' | 'disposed';
  resourceType: 'geometry' | 'material' | 'texture' | 'renderTarget' | 'program' | 'pipeline';
  resourceRef: string;
  timestamp: number;
  stackTrace?: string;
}
```

### Renderer Adapter

```typescript
type RendererKind = 'webgl' | 'webgpu';

interface RendererAdapter {
  /**
   * Renderer backend type
   */
  readonly kind: RendererKind;
  
  /**
   * Subscribe to frame rendering
   */
  observeFrame(callback: (stats: FrameStats) => void): Unsubscribe;
  
  /**
   * Get all render targets
   */
  getRenderTargets(): RenderTargetInfo[];
  
  /**
   * Get all textures
   */
  getTextures(): TextureInfo[];
  
  /**
   * Get all geometries
   */
  getGeometries(): GeometryInfo[];
  
  /**
   * Get all materials
   */
  getMaterials(): MaterialInfo[];
  
  /**
   * WebGL: Get shader programs
   */
  getPrograms?(): ProgramInfo[];
  
  /**
   * WebGPU: Get render/compute pipelines
   */
  getPipelines?(): PipelineInfo[];
  
  /**
   * Get GPU timing information
   */
  getGpuTimings?(): Promise<GpuTimingInfo>;
  
  /**
   * Clean up resources
   */
  dispose(): void;
}

interface ProgramInfo {
  id: string;
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, UniformValue>;
  attributes: string[];
  usedByMaterials: string[];
}

interface PipelineInfo {
  id: string;
  type: 'render' | 'compute';
  vertexStage?: string;
  fragmentStage?: string;
  computeStage?: string;
  bindGroupLayouts: BindGroupLayoutInfo[];
  usedByMaterials: string[];
}

interface BindGroupLayoutInfo {
  index: number;
  entries: BindGroupEntryInfo[];
}

interface BindGroupEntryInfo {
  binding: number;
  visibility: string;
  type: 'buffer' | 'sampler' | 'texture' | 'storageTexture';
  name?: string;
}

interface GpuTimingInfo {
  totalMs: number;
  breakdown?: Record<string, number>;
}
```

### Commands

```typescript
type DevtoolCommand =
  | { type: 'highlight-object'; debugId: string }
  | { type: 'isolate-object'; debugId: string }
  | { type: 'hide-object'; debugId: string }
  | { type: 'show-all-objects' }
  | { type: 'focus-camera'; debugId: string }
  | { type: 'toggle-wireframe'; debugId: string; enabled?: boolean }
  | { type: 'toggle-bounding-box'; debugId: string; enabled?: boolean }
  | { type: 'set-material-property'; materialRef: string; property: string; value: unknown }
  | { type: 'set-transform'; debugId: string; transform: Partial<TransformData> }
  | { type: 'take-snapshot' }
  | { type: 'start-recording' }
  | { type: 'stop-recording' }
  | { type: 'export-metrics'; format: 'json' | 'csv' }
  | { type: 'custom'; name: string; data?: unknown };
```

### Transport

```typescript
interface Transport {
  /**
   * Send a message to the devtool UI
   */
  send(message: DebugMessage): void;
  
  /**
   * Receive messages from the devtool UI
   */
  onReceive(handler: (message: DebugMessage) => void): Unsubscribe;
  
  /**
   * Connection status
   */
  isConnected(): boolean;
  
  /**
   * Subscribe to connection changes
   */
  onConnectionChange(handler: (connected: boolean) => void): Unsubscribe;
  
  /**
   * Close the transport
   */
  close(): void;
}

/**
 * Create a postMessage transport (for browser extension)
 */
declare function createPostMessageTransport(): Transport;

/**
 * Create a WebSocket transport (for standalone app)
 */
declare function createWebSocketTransport(url: string): Transport;
```

---

## Overlay Package (`@3lens/overlay`)

```typescript
interface OverlayConfig {
  /**
   * The probe instance to connect to
   */
  probe: DevtoolProbe;
  
  /**
   * Container element (defaults to document.body)
   */
  container?: HTMLElement;
  
  /**
   * Initial position
   * @default 'right'
   */
  position?: 'left' | 'right' | 'bottom' | 'floating';
  
  /**
   * Initial size (pixels or percentage)
   * @default '350px'
   */
  size?: string;
  
  /**
   * Start collapsed
   * @default false
   */
  collapsed?: boolean;
  
  /**
   * Keyboard shortcut to toggle
   * @default 'ctrl+shift+d'
   */
  toggleShortcut?: string;
  
  /**
   * Theme
   * @default 'auto'
   */
  theme?: 'light' | 'dark' | 'auto';
  
  /**
   * Custom panels to add
   */
  plugins?: DevtoolPlugin[];
}

/**
 * Mount the overlay UI
 */
declare function mountOverlay(config: OverlayConfig): OverlayHandle;

interface OverlayHandle {
  /**
   * Show the overlay
   */
  show(): void;
  
  /**
   * Hide the overlay
   */
  hide(): void;
  
  /**
   * Toggle visibility
   */
  toggle(): void;
  
  /**
   * Check if visible
   */
  isVisible(): boolean;
  
  /**
   * Unmount the overlay
   */
  unmount(): void;
  
  /**
   * Register a plugin
   */
  registerPlugin(plugin: DevtoolPlugin): void;
}
```

---

## Framework Bridges

### React Bridge (`@3lens/react-bridge`)

```typescript
/**
 * Context provider for the probe
 */
declare const ThreeLensProvider: React.FC<{
  probe: DevtoolProbe;
  children: React.ReactNode;
}>;

/**
 * Get the probe from context
 */
declare function useThreeLensProbe(): DevtoolProbe | null;

/**
 * Register a logical entity with automatic cleanup
 */
declare function useDevtoolEntity(config: {
  logicalId: string;
  label: string;
  objects: THREE.Object3D[];
  moduleId?: string;
  metadata?: Record<string, unknown>;
}): void;

/**
 * Get the currently selected object
 */
declare function useSelectedObject(): THREE.Object3D | null;

/**
 * Record a custom metric
 */
declare function useMetric(name: string, value: number, tags?: Record<string, string>): void;
```

### Angular Bridge (`@3lens/angular-bridge`)

```typescript
/**
 * Injection token for the probe
 */
declare const THREELENS_PROBE: InjectionToken<DevtoolProbe>;

/**
 * Directive to register a logical entity
 */
@Directive({ selector: '[threelensEntity]' })
declare class ThreeLensEntityDirective implements OnInit, OnDestroy {
  @Input() threelensEntity: string;
  @Input() threelensLabel?: string;
  @Input() threelensObjects: THREE.Object3D[];
  @Input() threelensModuleId?: string;
}

/**
 * Service for probe access
 */
@Injectable()
declare class ThreeLensService {
  get probe(): DevtoolProbe | null;
  registerEntity(entity: LogicalEntity): void;
  unregisterEntity(id: string): void;
  metric(name: string, value: number, tags?: Record<string, string>): void;
  selectObject(obj: THREE.Object3D | null): void;
}
```

---

## Plugin API

```typescript
interface DevtoolPlugin {
  /**
   * Unique plugin identifier
   */
  id: string;
  
  /**
   * Display title
   */
  title: string;
  
  /**
   * Plugin version
   */
  version?: string;
  
  /**
   * Called when plugin is activated
   */
  activate(context: DevtoolContext): void;
  
  /**
   * Called when plugin is deactivated
   */
  deactivate?(): void;
}

interface DevtoolContext {
  // ─────────────────────────────────────────────────────────────────
  // MESSAGE HANDLING
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Subscribe to specific message types
   */
  onMessage<T extends DebugMessage['type']>(
    type: T,
    handler: (message: Extract<DebugMessage, { type: T }>) => void
  ): Unsubscribe;
  
  /**
   * Send a command to the probe
   */
  sendCommand(command: DevtoolCommand): void;
  
  // ─────────────────────────────────────────────────────────────────
  // UI REGISTRATION
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Register a new panel
   */
  registerPanel(config: PanelConfig): PanelHandle;
  
  /**
   * Register a toolbar action
   */
  registerToolbarAction(config: ToolbarActionConfig): Unsubscribe;
  
  /**
   * Register a context menu item
   */
  registerContextMenuItem(config: ContextMenuItemConfig): Unsubscribe;
  
  // ─────────────────────────────────────────────────────────────────
  // STATE ACCESS
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Get the currently selected object
   */
  getSelectedObject(): ObjectMeta | null;
  
  /**
   * Get the latest frame stats
   */
  getLatestFrameStats(): FrameStats | null;
  
  /**
   * Get frame stats history
   */
  getFrameStatsHistory(count?: number): FrameStats[];
  
  /**
   * Get the current scene snapshot
   */
  getSceneSnapshot(): SceneSnapshot | null;
  
  /**
   * Get all logical entities
   */
  getLogicalEntities(): LogicalEntity[];
  
  // ─────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Log a message to the devtool console
   */
  log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void;
  
  /**
   * Store plugin state
   */
  setState<T>(key: string, value: T): void;
  
  /**
   * Retrieve plugin state
   */
  getState<T>(key: string): T | undefined;
}

interface PanelConfig {
  /**
   * Unique panel identifier
   */
  id: string;
  
  /**
   * Panel title
   */
  title: string;
  
  /**
   * Icon (URL or icon name)
   */
  icon?: string;
  
  /**
   * Panel order (lower = first)
   */
  order?: number;
  
  /**
   * Render function (for custom UI)
   */
  render: () => HTMLElement | React.ReactNode;
}

interface PanelHandle {
  /**
   * Update panel content
   */
  update(): void;
  
  /**
   * Remove the panel
   */
  remove(): void;
}

interface ToolbarActionConfig {
  id: string;
  title: string;
  icon: string;
  onClick: () => void;
  isActive?: () => boolean;
}

interface ContextMenuItemConfig {
  id: string;
  label: string;
  icon?: string;
  appliesTo: (object: ObjectMeta) => boolean;
  onClick: (object: ObjectMeta) => void;
}
```

---

## Usage Examples

### Basic Setup

```typescript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { mountOverlay } from '@3lens/overlay';

// Create scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Create probe
const probe = createProbe({
  appName: 'My Three.js App',
  rules: {
    maxDrawCalls: 1000,
    maxTriangles: 500000,
  },
});

// Observe scene and renderer
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Mount overlay (dev only)
if (import.meta.env.DEV) {
  mountOverlay({ probe });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

### With React

```typescript
import { Canvas } from '@react-three/fiber';
import { ThreeLensProvider, useDevtoolEntity } from '@3lens/react-bridge';
import { createProbe } from '@3lens/core';

const probe = createProbe({ appName: 'R3F App' });

function Enemy({ id, position }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useDevtoolEntity({
    logicalId: `enemy-${id}`,
    label: `Enemy #${id}`,
    objects: ref.current ? [ref.current] : [],
  });
  
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

function App() {
  return (
    <ThreeLensProvider probe={probe}>
      <Canvas>
        <Enemy id={1} position={[0, 0, 0]} />
        <Enemy id={2} position={[2, 0, 0]} />
      </Canvas>
    </ThreeLensProvider>
  );
}
```

### Custom Plugin

```typescript
import type { DevtoolPlugin, DevtoolContext } from '@3lens/core';

const lodCheckerPlugin: DevtoolPlugin = {
  id: 'lod-checker',
  title: 'LOD Checker',
  version: '1.0.0',
  
  activate(ctx: DevtoolContext) {
    // Register panel
    const panel = ctx.registerPanel({
      id: 'lod-panel',
      title: 'LOD Issues',
      render: () => {
        const container = document.createElement('div');
        container.innerHTML = '<h3>LOD Analysis</h3>';
        return container;
      },
    });
    
    // Listen for frame stats
    ctx.onMessage('frame-stats', (msg) => {
      const stats = msg.stats;
      if (stats.triangles > 1000000) {
        ctx.log('warn', 'High triangle count detected', { triangles: stats.triangles });
      }
    });
    
    // Add toolbar action
    ctx.registerToolbarAction({
      id: 'analyze-lod',
      title: 'Analyze LOD',
      icon: '🔍',
      onClick: () => {
        // Perform LOD analysis
      },
    });
  },
};
```

