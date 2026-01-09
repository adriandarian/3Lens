import { inject } from 'vue';
import { ThreeLensKey, type ThreeLensContext } from '../types';

/**
 * Composable to access the 3Lens context
 *
 * @returns The 3Lens context
 * @throws Error if used outside of ThreeLensPlugin or provider
 *
 * @example
 * ```vue
 * <script setup>
 * import { useThreeLens } from '@3lens/vue-bridge';
 *
 * const { fps, drawCalls, selectObject } = useThreeLens();
 * </script>
 *
 * <template>
 *   <div>FPS: {{ fps }}</div>
 *   <div>Draw Calls: {{ drawCalls }}</div>
 * </template>
 * ```
 */
export function useThreeLens(): ThreeLensContext {
  const context = inject(ThreeLensKey);
  if (!context) {
    throw new Error(
      'useThreeLens must be used within a component that has ThreeLensPlugin installed ' +
        'or is a descendant of a component that provided ThreeLensKey.'
    );
  }
  return context;
}

/**
 * Composable to optionally access the 3Lens context (returns undefined if not available)
 *
 * @returns The 3Lens context or undefined
 *
 * @example
 * ```vue
 * <script setup>
 * import { useThreeLensOptional } from '@3lens/vue-bridge';
 *
 * const threeLens = useThreeLensOptional();
 *
 * // Safe to use even without provider
 * if (threeLens) {
 *   console.log('FPS:', threeLens.fps.value);
 * }
 * </script>
 * ```
 */
export function useThreeLensOptional(): ThreeLensContext | undefined {
  return inject(ThreeLensKey);
}
