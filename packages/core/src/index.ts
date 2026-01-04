/**
 * @packageDocumentation
 * @module @3lens/core
 *
 * # @3lens/core
 *
 * Core probe SDK for 3Lens - the definitive developer toolkit for three.js.
 *
 * This package provides the foundational APIs for monitoring, debugging, and
 * profiling three.js applications. It includes:
 *
 * - **DevtoolProbe**: The main probe class for observing renderers and scenes
 * - **Configuration**: Flexible configuration for sampling, rules, and thresholds
 * - **Resource Tracking**: Lifecycle tracking, memory profiling, and leak detection
 * - **Plugin System**: Extensible plugin architecture for custom debugging tools
 * - **Transport**: Communication layer for browser extensions and remote debugging
 *
 * ## Quick Start
 *
 * ```typescript
 * import { createProbe } from '@3lens/core';
 *
 * const probe = createProbe({
 *   appName: 'My Three.js App',
 *   rules: {
 *     maxDrawCalls: 1000,
 *     maxTriangles: 500000,
 *   },
 * });
 *
 * probe.observeRenderer(renderer);
 * probe.observeScene(scene);
 *
 * // Subscribe to frame stats
 * probe.onFrameStats((stats) => {
 *   console.log('FPS:', stats.fps, 'Draw Calls:', stats.drawCalls);
 * });
 * ```
 *
 * @see {@link createProbe} - Factory function to create a probe instance
 * @see {@link DevtoolProbe} - Main probe class
 * @see {@link ProbeConfig} - Configuration options
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES - Configuration & Core Interfaces
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configuration types for the DevtoolProbe.
 * @category Configuration
 */
export type {
  ProbeConfig,
  SamplingConfig,
  RulesConfig,
  CustomRule,
  RuleResult,
} from './types/config';

/**
 * Object reference and metadata types for tracked three.js objects.
 * @category Types
 */
export type {
  TrackedObjectRef,
  ObjectMeta,
  LogicalEntity,
} from './types/objects';

/**
 * Frame statistics and performance metrics types.
 * @category Types
 */
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

/**
 * Default benchmark configuration for performance scoring.
 * @category Configuration
 */
export { DEFAULT_BENCHMARK_CONFIG } from './types/stats';

/**
 * Scene snapshot types for capturing scene state.
 * @category Types
 */
export type {
  SceneSnapshot,
  SceneNode,
  TransformData,
  Vector3Data,
  EulerData,
} from './types/snapshot';

/**
 * Geometry data types for analyzing mesh geometry.
 * @category Types
 */
export type {
  GeometryData,
  GeometryAttributeData,
  GeometryGroupData,
  GeometrySummary,
} from './types/geometry';

/**
 * Render target types for framebuffer debugging.
 * @category Types
 */
export type {
  RenderTargetData,
  RenderTargetsSummary,
  RenderTargetUsage,
} from './types/renderTargets';

/**
 * Material data types for shader and material inspection.
 * @category Types
 */
export type {
  MaterialData,
  MaterialTextureRef,
  UniformData,
  MaterialsSummary,
} from './types/materials';

/**
 * Texture data types for texture analysis and memory tracking.
 * @category Types
 */
export type {
  TextureData,
  TextureSourceInfo,
  TextureMaterialUsage,
  TexturesSummary,
} from './types/textures';

/**
 * Renderer adapter types for WebGL/WebGPU abstraction.
 * @category Adapters
 */
export type {
  RendererAdapter,
  RendererKind,
  RenderTargetInfo,
  TextureInfo,
  GeometryInfo,
  MaterialInfo,
  ProgramInfo,
  PipelineInfo,
  VertexBufferLayoutInfo,
  VertexAttributeInfo,
  BindGroupLayoutInfo,
  BindGroupLayoutEntryInfo,
  BindGroupInfo,
  BindGroupEntryInfo,
  GpuTimingInfo,
} from './types/adapter';

/**
 * Transport types for communication with browser extensions.
 * @category Transport
 */
export type {
  Transport,
  DebugMessage,
} from './types/transport';

/**
 * Common utility types.
 * @category Types
 */
export type { Unsubscribe } from './types/common';

// ═══════════════════════════════════════════════════════════════════════════
// CORE - Main Probe API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main DevtoolProbe class and factory function.
 * @category Core
 */
export { DevtoolProbe, PROBE_VERSION } from './probe/DevtoolProbe';

/**
 * Factory function to create a configured DevtoolProbe instance.
 * Automatically sets up postMessage transport for browser extension integration.
 * @category Core
 */
export { createProbe } from './probe/createProbe';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS - Scene Interaction Tools
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Helper for object selection via raycasting.
 * @category Helpers
 */
export { SelectionHelper } from './helpers/SelectionHelper';

/**
 * Inspect mode for interactive object picking.
 * @category Helpers
 */
export { InspectMode } from './helpers/InspectMode';

/**
 * Transform gizmo for translate/rotate/scale manipulation.
 * @category Helpers
 */
export { TransformGizmo } from './helpers/TransformGizmo';

/**
 * Transform gizmo configuration types.
 * @category Helpers
 */
export type {
  TransformMode,
  TransformSpace,
  TransformSnapshot,
  TransformHistoryEntry,
} from './helpers/TransformGizmo';

/**
 * Camera controller for focus, fly-to, and orbit controls.
 * @category Helpers
 */
export { CameraController } from './helpers/CameraController';

/**
 * Camera controller types.
 * @category Helpers
 */
export type {
  CameraInfo,
  FlyToOptions,
} from './helpers/CameraController';

// ═══════════════════════════════════════════════════════════════════════════
// TRACKING - Resource Lifecycle & Memory
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resource lifecycle tracker for detecting memory leaks.
 * @category Tracking
 */
export { ResourceLifecycleTracker } from './tracking/ResourceLifecycleTracker';

/**
 * Resource tracking types.
 * @category Tracking
 */
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

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION - Rule Checking & Validation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configuration loader and rule checker.
 * @category Configuration
 */
export { ConfigLoader, DEFAULT_THRESHOLDS, DEFAULT_SAMPLING } from './config/ConfigLoader';

/**
 * Configuration and rule checking types.
 * @category Configuration
 */
export type {
  ViolationSeverity,
  RuleViolation,
  ConfigValidationResult,
  RuleCheckResult,
  RuleViolationCallback,
} from './config/ConfigLoader';

// ═══════════════════════════════════════════════════════════════════════════
// ENTITIES - Logical Entity Management
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Logical entity manager for grouping objects by module/component.
 * @category Entities
 */
export { LogicalEntityManager } from './entities';

/**
 * Entity management types.
 * @category Entities
 */
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

// ═══════════════════════════════════════════════════════════════════════════
// PLUGINS - Plugin System
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Plugin management system for extending devtool functionality.
 * @category Plugins
 */
export { PluginManager, PluginLoader, PluginRegistry } from './plugins';

/**
 * Plugin system types and interfaces.
 * @category Plugins
 */
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

/**
 * Built-in plugins for common debugging tasks.
 * @category Plugins
 */
export { LODCheckerPlugin, ShadowDebuggerPlugin, BUILTIN_PLUGINS, getBuiltinPlugins } from './plugins';

/**
 * Built-in plugin types.
 * @category Plugins
 */
export type {
  LODAnalysis,
  LODCheckerSettings,
  ShadowLightAnalysis,
  ShadowIssue,
  ShadowStats,
  ShadowDebuggerSettings,
} from './plugins';

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTERS - WebGL/WebGPU Abstraction
// ═══════════════════════════════════════════════════════════════════════════

/**
 * WebGL renderer adapter factory.
 * @category Adapters
 */
export { createWebGLAdapter } from './adapters/webgl-adapter';

/**
 * WebGL adapter options.
 * @category Adapters
 */
export type { WebGLAdapterOptions } from './adapters/webgl-adapter';

/**
 * WebGPU renderer adapter factory and utilities.
 * @category Adapters
 */
export { createWebGPUAdapter, createExtendedWebGPUAdapter, isWebGPURenderer, getWebGPUCapabilities } from './adapters/webgpu-adapter';

/**
 * WebGPU adapter types.
 * @category Adapters
 */
export type {
  WebGPUCapabilities,
  WebGPURendererAdapter,
  DetailedPipelineInfo,
  ShaderStageInfo,
  BindGroupLayoutEntryDetail,
  WebGPUBindGroupInfo,
  WebGPUBindGroupEntryInfo,
} from './adapters/webgpu-adapter';

/**
 * WebGPU GPU timing utilities.
 * @category Adapters
 */
export { WebGpuTimingManager, createTimestampWrites, categorizePass } from './adapters/webgpu-timing';

/**
 * WebGPU timing types.
 * @category Adapters
 */
export type {
  GpuPassTiming,
  GpuFrameTiming,
  GpuPassType,
  GpuTimingConfig,
} from './adapters/webgpu-timing';

// ═══════════════════════════════════════════════════════════════════════════
// TRANSPORT - Communication Layer
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PostMessage transport for browser extension communication.
 * @category Transport
 */
export { createPostMessageTransport } from './transport/postmessage-transport';

/**
 * Direct transport for in-process communication.
 * @category Transport
 */
export { createDirectTransport } from './transport/direct-transport';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES - Performance & Memory Tools
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Performance tracking and calculation utilities.
 * @category Utilities
 */
export {
  PerformanceTracker,
  calculateBenchmarkScore,
  estimateTextureMemory,
  estimateGeometryMemory,
  createEmptyMemoryStats,
  createEmptyRenderingStats,
  createEmptyPerformanceMetrics,
} from './utils/performance-calculator';

/**
 * Probe overhead benchmarking utility.
 * @category Utilities
 */
export { measureProbeOverhead } from './utils/overhead-benchmark';

/**
 * Overhead benchmark types.
 * @category Utilities
 */
export type {
  OverheadBenchmarkOptions,
  OverheadBenchmarkResult,
} from './utils/overhead-benchmark';

/**
 * Object pooling for reduced GC pressure.
 * @category Utilities
 */
export {
  ObjectPool,
  ArrayPool,
  PoolManager,
  getPoolManager,
  acquireFrameStats,
  releaseFrameStats,
  acquireVector3,
  releaseVector3,
  acquireArray,
  releaseArray,
} from './utils/ObjectPool';

/**
 * Object pool types.
 * @category Utilities
 */
export type {
  PoolFactory,
  PoolReset,
  ObjectPoolOptions,
  PoolStats,
  PooledFrameStats,
  PooledVector3,
  PooledTransformData,
} from './utils/ObjectPool';

/**
 * Memoization utilities for performance optimization.
 * @category Utilities
 */
export {
  LRUCache,
  memoize,
  memoizeOne,
  FrameMemoizer,
  getFrameMemoizer,
  resetFrameMemoizer,
  formatPropertyPath,
  formatNumber,
  formatBytes,
  getTypeName,
  getObjectId,
  weakMemoize,
  MemoizationManager,
  getMemoizationManager,
  resetMemoizationManager,
  MemoizeMethod,
} from './utils/Memoization';

/**
 * Memoization types.
 * @category Utilities
 */
export type {
  MemoizeOptions,
  MemoStats,
  MemoizedFunction,
} from './utils/Memoization';

/**
 * Web Worker processing for heavy computations.
 * @category Utilities
 */
export {
  WorkerProcessor,
  getWorkerProcessor,
  resetWorkerProcessor,
} from './utils/WorkerProcessor';

/**
 * Worker processor types.
 * @category Utilities
 */
export type {
  WorkerTaskType,
  WorkerRequest,
  WorkerResponse,
  BenchmarkPayload,
  LeakAnalysisPayload,
  SerializedLifecycleEvent,
  SerializedActiveResource,
  StatsAggregationPayload,
  StatsAggregationResult,
  PercentilePayload,
  PercentileResult,
  TrendAnalysisPayload,
  TrendAnalysisResult,
  CustomTaskPayload,
  WorkerProcessorOptions,
  WorkerStats,
} from './utils/WorkerProcessor';
