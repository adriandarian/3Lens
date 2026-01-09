import { computed, type ComputedRef } from 'vue';
import type { DevtoolProbe } from '@3lens/core';
import { useThreeLens, useThreeLensOptional } from './useThreeLens';

/**
 * Composable to access the 3Lens probe instance
 *
 * @returns Computed ref of the probe instance
 * @throws Error if probe is not available
 *
 * @example
 * ```vue
 * <script setup>
 * import { useProbe } from '@3lens/vue-bridge';
 *
 * const probe = useProbe();
 *
 * function takeSnapshot() {
 *   const snapshot = probe.value.takeSnapshot();
 *   console.log('Scene has', snapshot.root.children.length, 'objects');
 * }
 * </script>
 * ```
 */
export function useProbe(): ComputedRef<DevtoolProbe> {
  const { probe } = useThreeLens();

  return computed(() => {
    if (!probe.value) {
      throw new Error('Probe not initialized. Wait for isReady to be true.');
    }
    return probe.value;
  });
}

/**
 * Composable to optionally access the probe (returns null if not available)
 *
 * @returns Computed ref of the probe instance or null
 *
 * @example
 * ```vue
 * <script setup>
 * import { useProbeOptional } from '@3lens/vue-bridge';
 *
 * const probe = useProbeOptional();
 *
 * function maybeTakeSnapshot() {
 *   if (probe.value) {
 *     probe.value.takeSnapshot();
 *   }
 * }
 * </script>
 * ```
 */
export function useProbeOptional(): ComputedRef<DevtoolProbe | null> {
  const context = useThreeLensOptional();

  return computed(() => context?.probe.value ?? null);
}
