/**
 * Svelte Action for 3Lens
 *
 * Provides a Svelte action for mounting the 3Lens UI.
 * Compatible with both Svelte 4 and Svelte 5.
 *
 * @packageDocumentation
 */

import type { ActionReturn } from 'svelte/action';
import type { LensConfig } from '@3lens/runtime';
import type { UIOverlayConfig, UIDockConfig } from '@3lens/ui-core';
import { createThreeLensStore, type ThreeLensStore } from './store';

/**
 * Options for the threeLens action
 */
export interface ThreeLensActionOptions {
  /** Lens configuration */
  config?: Partial<LensConfig>;
  /** UI mode */
  ui?: 'overlay' | 'dock';
  /** Overlay configuration */
  overlayConfig?: UIOverlayConfig;
  /** Dock configuration */
  dockConfig?: Omit<UIDockConfig, 'target'>;
  /** Auto-initialize */
  autoInit?: boolean;
  /** Callback when store is created */
  onStore?: (store: ThreeLensStore) => void;
}

/**
 * Svelte action for mounting 3Lens UI
 *
 * @example Svelte 4:
 * ```svelte
 * <script>
 *   import { threeLens } from '@3lens/mount-svelte';
 *
 *   let store;
 *
 *   function handleStore(s) {
 *     store = s;
 *   }
 * </script>
 *
 * <div use:threeLens={{ ui: 'overlay', onStore: handleStore }}>
 *   <!-- 3Lens UI mounts here -->
 * </div>
 *
 * <button on:click={() => store?.toggle()}>Toggle Panel</button>
 * ```
 *
 * @example Svelte 5:
 * ```svelte
 * <script>
 *   import { threeLens } from '@3lens/mount-svelte';
 *
 *   let store = $state(null);
 * </script>
 *
 * <div use:threeLens={{ ui: 'overlay', onStore: (s) => store = s }}>
 *   <!-- 3Lens UI mounts here -->
 * </div>
 *
 * <button onclick={() => store?.toggle()}>Toggle Panel</button>
 * ```
 */
export function threeLens(
  node: HTMLElement,
  options: ThreeLensActionOptions = {}
): ActionReturn<ThreeLensActionOptions> {
  let store: ThreeLensStore | null = null;

  function init(opts: ThreeLensActionOptions) {
    // Create store
    store = createThreeLensStore({
      config: opts.config,
      ui: opts.ui,
      overlayConfig: opts.overlayConfig,
      dockConfig: opts.dockConfig,
      autoInit: opts.autoInit,
    });

    // Mount UI
    store.mount(node);

    // Callback
    opts.onStore?.(store);
  }

  // Initialize
  init(options);

  return {
    // Update handler for reactive options (Svelte 4 style)
    update(newOptions: ThreeLensActionOptions) {
      // Destroy old store
      store?.destroy();

      // Reinitialize with new options
      init(newOptions);
    },

    // Cleanup
    destroy() {
      store?.destroy();
      store = null;
    },
  };
}

// Type augmentation for Svelte 5 compatibility
declare module 'svelte/elements' {
  interface HTMLAttributes<T> {
    'use:threeLens'?: ThreeLensActionOptions;
  }
}
