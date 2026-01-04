/**
 * @packageDocumentation
 * @module @3lens/react-bridge
 *
 * # @3lens/react-bridge
 *
 * React integration for 3Lens devtools.
 *
 * This package provides React hooks and components for integrating 3Lens
 * with React applications, including first-class support for React Three Fiber.
 *
 * ## Features
 *
 * - **ThreeLensProvider**: Context provider for probe access throughout your app
 * - **Hooks**: `useThreeLensProbe`, `useFPS`, `useDrawCalls`, `useSelectedObject`, etc.
 * - **Entity Registration**: `useDevtoolEntity` for naming objects in the devtools
 * - **R3F Integration**: `ThreeLensCanvas` wrapper for seamless R3F support
 *
 * ## Quick Start
 *
 * ```tsx
 * import { ThreeLensProvider, useFPS } from '@3lens/react-bridge';
 * import { Canvas } from '@react-three/fiber';
 *
 * function App() {
 *   return (
 *     <ThreeLensProvider config={{ appName: 'My R3F App' }}>
 *       <Canvas>
 *         <Scene />
 *       </Canvas>
 *       <FPSCounter />
 *     </ThreeLensProvider>
 *   );
 * }
 *
 * function FPSCounter() {
 *   const fps = useFPS(true);
 *   return <div>FPS: {fps.current.toFixed(0)}</div>;
 * }
 * ```
 *
 * @see {@link ThreeLensProvider} - Context provider component
 * @see {@link useThreeLensProbe} - Access the probe instance
 * @see {@link useDevtoolEntity} - Register objects with names
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT & PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * React context for 3Lens probe access.
 * @category React
 */
export { ThreeLensContext } from './context';

/**
 * Provider component that initializes and provides the 3Lens probe context.
 * @category React
 */
export { ThreeLensProvider, type ThreeLensProviderProps } from './ThreeLensProvider';

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * React hooks for accessing probe data and metrics.
 * @category React
 */
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

// ═══════════════════════════════════════════════════════════════════════════
// REACT THREE FIBER INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * React Three Fiber integration components and hooks.
 * @category React
 */
export { ThreeLensCanvas, useR3FConnection, R3FProbe, createR3FConnector } from './r3f';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Type definitions for React bridge.
 * @category React
 */
export type {
  ThreeLensProviderConfig,
  ThreeLensContextValue,
  UseMetricOptions,
  MetricValue,
  EntityOptions,
  RegisteredEntity,
} from './types';

/**
 * Re-exported types from core for convenience.
 * @category Types
 */
export type { DevtoolProbe, FrameStats, SceneSnapshot, SceneNode, ProbeConfig } from '@3lens/core';

