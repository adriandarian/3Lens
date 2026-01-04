/**
 * @packageDocumentation
 * @module @3lens/vue-bridge
 *
 * # @3lens/vue-bridge
 *
 * Vue 3 integration for 3Lens devtools.
 *
 * This package provides Vue composables and a plugin for integrating 3Lens
 * with Vue 3 applications, including first-class support for TresJS.
 *
 * ## Features
 *
 * - **ThreeLensPlugin**: Vue plugin for global probe access
 * - **Composables**: `useThreeLens`, `useFPS`, `useDrawCalls`, `useSelectedObject`, etc.
 * - **Entity Registration**: `useDevtoolEntity` for naming objects in the devtools
 * - **TresJS Integration**: `useTresProbe` and `createTresConnector` for TresJS
 *
 * ## Quick Start
 *
 * ```typescript
 * // main.ts
 * import { createApp } from 'vue';
 * import { ThreeLensPlugin } from '@3lens/vue-bridge';
 *
 * const app = createApp(App);
 * app.use(ThreeLensPlugin, { appName: 'My Vue App' });
 * app.mount('#app');
 * ```
 *
 * ```vue
 * <!-- Scene.vue -->
 * <script setup>
 * import { useThreeLens, useFPS } from '@3lens/vue-bridge';
 *
 * const { probe, drawCalls } = useThreeLens();
 * const fps = useFPS(true);
 * </script>
 *
 * <template>
 *   <div>FPS: {{ fps.current.toFixed(0) }}</div>
 *   <div>Draw Calls: {{ drawCalls }}</div>
 * </template>
 * ```
 *
 * @see {@link ThreeLensPlugin} - Vue plugin for global installation
 * @see {@link useThreeLens} - Main composable for context access
 * @see {@link useDevtoolEntity} - Register objects with names
 */

// ═══════════════════════════════════════════════════════════════════════════
// PLUGIN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vue plugin and factory function for 3Lens integration.
 * @category Vue
 */
export { ThreeLensPlugin, createThreeLens } from './plugin';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSABLES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vue composables for accessing probe data and metrics.
 * @category Vue
 */
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

// ═══════════════════════════════════════════════════════════════════════════
// TRESJS INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TresJS-specific integration utilities.
 * @category Vue
 */
export { useTresProbe, createTresConnector } from './tresjs';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Type definitions for Vue bridge.
 * @category Vue
 */
export {
  ThreeLensKey,
  type ThreeLensPluginConfig,
  type ThreeLensContext,
  type EntityOptions,
  type UseMetricOptions,
  type MetricValue,
} from './types';

/**
 * Re-exported types from core for convenience.
 * @category Types
 */
export type {
  DevtoolProbe,
  FrameStats,
  SceneSnapshot,
  SceneNode,
  ProbeConfig,
} from '@3lens/core';

