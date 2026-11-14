/**
 * Svelte store for 3Lens.
 *
 * Owns (or receives) a `Lens`, mounts the HUD above the application, and exposes
 * selection and visibility as readable stores.
 *
 * @packageDocumentation
 */

import { get, readable, writable, type Readable, type Writable } from 'svelte/store';
import { createLens, type Lens, type LensConfig } from '@3lens/runtime';
import { createLensController, type HudOptions } from '@3lens/ui-core';
import { setThreeLensContext, getThreeLensContext, type ThreeLensContext } from './context';

export interface ThreeLensStoreOptions {
  /** Inspect this lens. If omitted, the store creates (and disposes) one from `config`. */
  lens?: Lens;
  /** Used only when `lens` is omitted. */
  config?: Partial<LensConfig>;
  /** `false` disables the HUD (embed the workspace with the `threeLens` action instead). */
  hud?: boolean | HudOptions;
  /** Called once the lens is ready. Register your hosts/contexts here when the store owns the lens. */
  onInit?: (lens: Lens) => void;
}

export interface ThreeLensStore extends ThreeLensContext {
  /** Embed the full workspace in a container you own. Returns an unmount function. */
  mountWorkspace: (container: HTMLElement, options?: { readonly?: boolean }) => () => void;
  /** Dispose the HUD, any embedded workspaces and, if owned, the lens. */
  destroy: () => void;
}

/** The most recently created store (cleared on destroy), for `$threeLensStore` access in markup. */
export const threeLensStore: Writable<ThreeLensStore | null> = writable(null);

/**
 * @example
 * ```svelte
 * <script>
 *   import { createThreeLensStore } from '@3lens/mount-svelte';
 *   const store = createThreeLensStore({ lens });
 *   const { selection } = store;
 * </script>
 * {$selection?.entity_ids[0]}
 * ```
 */
export function createThreeLensStore(options: ThreeLensStoreOptions = {}): ThreeLensStore {
  const owned = !options.lens;
  const lens = options.lens ?? createLens({ enabled: true, ...options.config });
  // The HUD needs a DOM; during SSR only the stores exist.
  const controller = createLensController(lens, { hud: typeof document === 'undefined' ? false : (options.hud ?? true) });

  const derive = <T>(pick: () => T): Readable<T> =>
    readable(pick(), (set) => {
      set(pick());
      return controller.subscribe(() => set(pick()));
    });

  const previous = getThreeLensContext();
  const store: ThreeLensStore = {
    lens,
    controller,
    hud: readable(controller.hud, (set) => {
      set(controller.hud);
      return controller.subscribe(() => set(controller.hud));
    }),
    initialized: readable(true),
    selection: derive(() => controller.getState().selection),
    visible: derive(() => controller.getState().visible),
    select: (ids) => controller.select(ids),
    clearSelection: () => controller.clearSelection(),
    show: () => controller.show(),
    hide: () => controller.hide(),
    toggle: () => controller.toggle(),
    openAnalysis: () => controller.openAnalysis(),
    openPalette: () => controller.openPalette(),
    mountWorkspace: (container, workspace) => controller.mountWorkspace(container, workspace),
    destroy() {
      controller.dispose();
      if (owned) lens.dispose();
      if (getThreeLensContext() === store) setThreeLensContext(previous);
      if (get(threeLensStore) === store) threeLensStore.set(null);
    },
  };
  setThreeLensContext(store);
  threeLensStore.set(store);
  options.onInit?.(lens);
  return store;
}
