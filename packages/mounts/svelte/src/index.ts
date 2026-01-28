/**
 * @3lens/mount-svelte
 *
 * Svelte mount kit for 3Lens.
 * Provides Svelte-specific wrappers around the UI core.
 * Supports both Svelte 4 and Svelte 5.
 *
 * @packageDocumentation
 */

export { threeLens, type ThreeLensActionOptions } from './action';
export {
  createThreeLensStore,
  threeLensStore,
  type ThreeLensStore,
  type ThreeLensStoreOptions,
} from './store';
export { getThreeLensContext, setThreeLensContext, type ThreeLensContext } from './context';
