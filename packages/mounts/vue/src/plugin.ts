/**
 * Vue Plugin for 3Lens
 *
 * Owns (or receives) a `Lens`, mounts the HUD above the application, and provides
 * selection and visibility to composables. The HUD is a fixed-position layer on
 * `document.body`; it never touches your component tree.
 *
 * @packageDocumentation
 */

import { ref, shallowRef, type App, type Plugin } from 'vue';
import { createLens, type Lens, type LensConfig } from '@3lens/runtime';
import { createLensController, type HudOptions } from '@3lens/ui-core';
import { THREELENS_INJECTION_KEY, type ThreeLensContext } from './types';

export interface ThreeLensPluginOptions {
  /** Inspect this lens. If omitted, the plugin creates (and disposes) one from `config`. */
  lens?: Lens;
  /** Used only when `lens` is omitted. */
  config?: Partial<LensConfig>;
  /** `false` disables the HUD (embed `ThreeLensPanel` or build your own UI). */
  hud?: boolean | HudOptions;
  /** Called once the lens is ready. Register your hosts/contexts here when the plugin owns the lens. */
  onInit?: (lens: Lens) => void;
}

/**
 * @example
 * ```ts
 * app.use(threeLensPlugin, { lens });
 * ```
 */
export const threeLensPlugin: Plugin<ThreeLensPluginOptions[]> = {
  install(app: App, options: ThreeLensPluginOptions = {}) {
    const owned = !options.lens;
    const lens = options.lens ?? createLens({ enabled: true, ...options.config });
    // The HUD needs a DOM; on the server only the reactive context is provided.
    const hud = typeof document === 'undefined' ? false : (options.hud ?? true);
    const controller = createLensController(lens, { hud });

    const selection = shallowRef(controller.getState().selection);
    const visible = ref(controller.getState().visible);
    const handle = shallowRef(controller.hud);
    const off = controller.subscribe(() => {
      const state = controller.getState();
      selection.value = state.selection;
      visible.value = state.visible;
    });

    const context: ThreeLensContext = {
      lens,
      controller,
      hud: handle,
      initialized: ref(true),
      selection,
      visible,
      select: (ids) => controller.select(ids),
      clearSelection: () => controller.clearSelection(),
      show: () => controller.show(),
      hide: () => controller.hide(),
      toggle: () => controller.toggle(),
      openAnalysis: () => controller.openAnalysis(),
      openPalette: () => controller.openPalette(),
    };
    app.provide(THREELENS_INJECTION_KEY, context);

    // Vue has no plugin teardown hook; piggyback on app.unmount.
    const unmount = app.unmount.bind(app);
    app.unmount = () => {
      off();
      controller.dispose();
      handle.value = null;
      if (owned) lens.dispose();
      unmount();
    };
    options.onInit?.(lens);
  },
};
