/**
 * useThreeLens Composable
 *
 * @packageDocumentation
 */

import { inject } from 'vue';
import { THREELENS_INJECTION_KEY, type ThreeLensContext } from '../types';

/**
 * Composable to access the 3Lens context
 *
 * @example
 * ```vue
 * <script setup>
 * import { useThreeLens } from '@3lens/mount-vue';
 *
 * const { client, selection, select, show, hide } = useThreeLens();
 *
 * function handleClick(entityId) {
 *   select(entityId);
 * }
 * </script>
 * ```
 */
export function useThreeLens(): ThreeLensContext {
  const context = inject(THREELENS_INJECTION_KEY);

  if (!context) {
    throw new Error(
      'useThreeLens must be used within a component where the threeLensPlugin is installed. ' +
      'Make sure to call app.use(threeLensPlugin) before using this composable.'
    );
  }

  return context;
}
