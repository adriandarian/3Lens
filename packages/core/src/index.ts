/**
 * @3lens/core
 *
 * Core probe SDK for 3Lens - the definitive developer toolkit for three.js
 */

// Types
export type {
  ProbeConfig,
  SamplingConfig,
  RulesConfig,
  CustomRule,
  RuleResult,
} from './types/config';

export type {
  TrackedObjectRef,
  ObjectMeta,
  LogicalEntity,
} from './types/objects';

export type {
  FrameStats,
  MemoryStats,
  PerformanceMetrics,
  RenderingStats,
  WebGLFrameExtras,
  WebGPUFrameExtras,
  RuleViolation,
  BenchmarkScore,
  BenchmarkConfig,
  PerformanceHistory,
} from './types/stats';

export { DEFAULT_BENCHMARK_CONFIG } from './types/stats';

export type {
  SceneSnapshot,
  SceneNode,
  TransformData,
  Vector3Data,
  EulerData,
} from './types/snapshot';

export type {
  GeometryData,
  GeometryAttributeData,
  GeometryGroupData,
  GeometrySummary,
} from './types/geometry';

export type {
  RenderTargetData,
  RenderTargetsSummary,
  RenderTargetUsage,
} from './types/renderTargets';

export type {
  MaterialData,
  MaterialTextureRef,
  UniformData,
  MaterialsSummary,
} from './types/materials';

export type {
  TextureData,
  TextureSourceInfo,
  TextureMaterialUsage,
  TexturesSummary,
} from './types/textures';

export type {
  RendererAdapter,
  RendererKind,
} from './types/adapter';

export type {
  Transport,
  DebugMessage,
} from './types/transport';

export type { Unsubscribe } from './types/common';

// Core
export { DevtoolProbe, PROBE_VERSION } from './probe/DevtoolProbe';
export { createProbe } from './probe/createProbe';

// Helpers
export { SelectionHelper } from './helpers/SelectionHelper';
export { InspectMode } from './helpers/InspectMode';
export { TransformGizmo } from './helpers/TransformGizmo';
export type {
  TransformMode,
  TransformSpace,
  TransformSnapshot,
  TransformHistoryEntry,
} from './helpers/TransformGizmo';

export { CameraController } from './helpers/CameraController';
export type {
  CameraInfo,
  FlyToOptions,
} from './helpers/CameraController';

// Resource Tracking
export { ResourceLifecycleTracker } from './tracking/ResourceLifecycleTracker';
export type {
  ResourceType,
  LifecycleEventType,
  ResourceLifecycleEvent,
  ResourceLifecycleSummary,
  ResourceTrackerOptions,
  LifecycleEventCallback,
  LeakAlertSeverity,
  LeakAlertType,
  LeakAlert,
  LeakReport,
  LeakAlertCallback,
} from './tracking/ResourceLifecycleTracker';

// Configuration
export { ConfigLoader, DEFAULT_THRESHOLDS, DEFAULT_SAMPLING } from './config/ConfigLoader';
export type {
  ViolationSeverity,
  RuleViolation,
  ConfigValidationResult,
  RuleCheckResult,
  RuleViolationCallback,
} from './config/ConfigLoader';

// Logical Entities
export { LogicalEntityManager } from './entities';
export type {
  EntityId,
  ModuleId,
  LogicalEntityOptions,
  LogicalEntity as NewLogicalEntity,
  ModuleInfo,
  ModuleMetrics,
  EntityFilter,
  NavigationResult,
  EntityEvent,
  EntityEventType,
  EntityEventCallback,
} from './entities';

// Plugin System
export { PluginManager, PluginLoader, PluginRegistry } from './plugins';
export type {
  PluginId,
  PluginState,
  PluginMetadata,
  PanelDefinition,
  PanelRenderContext,
  ToolbarActionDefinition,
  ContextMenuItemDefinition,
  ContextMenuContext,
  PluginMessage,
  PluginMessageHandler,
  DevtoolContext,
  DevtoolPlugin,
  PluginSettingType,
  PluginSettingField,
  PluginSettingsSchema,
  RegisteredPlugin,
  PluginPackage,
  PluginSourceType,
  PluginSource,
  PluginRegistryEntry,
  PluginLoadResult,
  PluginLoaderOptions,
} from './plugins';

// Adapters
export { createWebGLAdapter } from './adapters/webgl-adapter';

// Transport
export { createPostMessageTransport } from './transport/postmessage-transport';
export { createDirectTransport } from './transport/direct-transport';

// Utilities
export {
  PerformanceTracker,
  calculateBenchmarkScore,
  estimateTextureMemory,
  estimateGeometryMemory,
  createEmptyMemoryStats,
  createEmptyRenderingStats,
  createEmptyPerformanceMetrics,
} from './utils/performance-calculator';
export { measureProbeOverhead } from './utils/overhead-benchmark';
export type {
  OverheadBenchmarkOptions,
  OverheadBenchmarkResult,
} from './utils/overhead-benchmark';
