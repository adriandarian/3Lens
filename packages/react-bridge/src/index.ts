// Context and Provider
export { ThreeLensContext } from './context';
export { ThreeLensProvider, type ThreeLensProviderProps } from './ThreeLensProvider';

// Hooks
export {
  useThreeLensProbe,
  useThreeLensProbeOptional,
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
} from './hooks';

// React Three Fiber integration
export { ThreeLensCanvas, useR3FConnection, R3FProbe, createR3FConnector } from './r3f';

// Types
export type {
  ThreeLensProviderConfig,
  ThreeLensContextValue,
  UseMetricOptions,
  MetricValue,
  EntityOptions,
  RegisteredEntity,
} from './types';

// Re-export commonly used types from core
export type { DevtoolProbe, FrameStats, SceneSnapshot, SceneNode, ProbeConfig } from '@3lens/core';

