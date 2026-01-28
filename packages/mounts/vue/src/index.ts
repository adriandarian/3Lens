/**
 * @3lens/mount-vue
 *
 * Vue mount kit for 3Lens.
 * Provides Vue-specific wrappers around the UI core.
 *
 * @packageDocumentation
 */

export { threeLensPlugin, type ThreeLensPluginOptions } from './plugin';
export { useThreeLens } from './composables/useThreeLens';
export { useSelection } from './composables/useSelection';
export { usePanel } from './composables/usePanel';
export { THREELENS_INJECTION_KEY, type ThreeLensContext } from './types';
