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
  RendererAdapter,
  RendererKind,
} from './types/adapter';

export type {
  Transport,
  DebugMessage,
} from './types/transport';

export type { Unsubscribe } from './types/common';

// Core
export { DevtoolProbe } from './probe/DevtoolProbe';
export { createProbe } from './probe/createProbe';

// Helpers
export { SelectionHelper } from './helpers/SelectionHelper';

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
