// Plugin
export { ThreeLensPlugin, createThreeLens } from './plugin';

// Composables
export {
  useThreeLens,
  useThreeLensOptional,
  useProbe,
  useProbeOptional,
  useSelectedObject,
  useMetric,
  useFPS,
  useFrameTime,
  useDrawCalls,
  useTriangles,
  useGPUMemory,
  useTextureCount,
  useGeometryCount,
  useDevtoolEntity,
  useDevtoolEntityGroup,
} from './composables';

// TresJS integration
export { useTresProbe, createTresConnector } from './tresjs';

// Types
export {
  ThreeLensKey,
  type ThreeLensPluginConfig,
  type ThreeLensContext,
  type EntityOptions,
  type UseMetricOptions,
  type MetricValue,
} from './types';

// Re-export commonly used types from core
export type {
  DevtoolProbe,
  FrameStats,
  SceneSnapshot,
  SceneNode,
  ProbeConfig,
} from '@3lens/core';

