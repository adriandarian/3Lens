/**
 * Vue Plugin for 3Lens
 *
 * @packageDocumentation
 */

import { ref, shallowRef, type App, type Plugin } from 'vue';
import type { LensClient, LensConfig, Selection, EntityId } from '@3lens/runtime';
import { createLens } from '@3lens/runtime';
import { uiOverlay, uiDock, type UIAdapter, type UIOverlayConfig, type UIDockConfig, type Panel } from '@3lens/ui-core';
import { THREELENS_INJECTION_KEY, type ThreeLensContext } from './types';

/**
 * Options for the ThreeLens Vue plugin
 */
export interface ThreeLensPluginOptions {
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
}

/**
 * Vue plugin for 3Lens
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue';
 * import { threeLensPlugin } from '@3lens/mount-vue';
 *
 * const app = createApp(App);
 * app.use(threeLensPlugin, {
 *   ui: 'overlay',
 *   autoInit: true,
 * });
 * app.mount('#app');
 * ```
 */
export const threeLensPlugin: Plugin<ThreeLensPluginOptions[]> = {
  install(app: App, options: ThreeLensPluginOptions = {}) {
    // Reactive state
    const client = shallowRef<LensClient | null>(null);
    const ui = shallowRef<UIAdapter | null>(null);
    const initialized = ref(false);
    const selection = ref<Selection | null>(null);
    const visible = ref(true);

    let mounted = false;
    let unsubscribeSelection: (() => void) | null = null;

    // Initialize lens
    const initLens = async () => {
      try {
        const result = await createLens(options.config as LensConfig);
        client.value = result.client;
        initialized.value = true;

        // Subscribe to selection changes
        unsubscribeSelection = result.client.onSelectionChange((sel) => {
          selection.value = sel;
        });
      } catch (error) {
        console.error('[3Lens] Failed to initialize:', error);
      }
    };

    // Create UI adapter
    const createUI = (target?: HTMLElement): UIAdapter => {
      const uiMode = options.ui ?? 'overlay';

      if (uiMode === 'overlay') {
        return uiOverlay(options.overlayConfig);
      } else if (target) {
        return uiDock({
          target,
          ...options.dockConfig,
        });
      }

      return uiOverlay(options.overlayConfig);
    };

    // Actions
    const select = (entityIds: EntityId | EntityId[]) => {
      client.value?.select(entityIds);
    };

    const show = () => {
      ui.value?.show();
      visible.value = true;
    };

    const hide = () => {
      ui.value?.hide();
      visible.value = false;
    };

    const toggle = () => {
      ui.value?.toggle();
      visible.value = ui.value?.isVisible() ?? false;
    };

    const registerPanel = (panel: Panel) => {
      ui.value?.registerPanel(panel);
    };

    const unregisterPanel = (panelId: string) => {
      ui.value?.unregisterPanel(panelId);
    };

    const mount = (container: HTMLElement) => {
      if (mounted) {
        console.warn('[3Lens] Already mounted');
        return;
      }

      const adapter = createUI(container);
      ui.value = adapter;
      adapter.mount(container);
      mounted = true;
    };

    const unmount = () => {
      if (ui.value && mounted) {
        ui.value.unmount();
        mounted = false;
      }
    };

    // Create context
    const context: ThreeLensContext = {
      client,
      ui,
      initialized,
      selection,
      visible,
      select,
      show,
      hide,
      toggle,
      registerPanel,
      unregisterPanel,
      mount,
      unmount,
    };

    // Provide context
    app.provide(THREELENS_INJECTION_KEY, context);

    // Auto-initialize if requested
    if (options.autoInit !== false) {
      initLens();
    }

    // Cleanup on app unmount
    app.config.globalProperties.$threeLens = context;

    // Register unmount hook
    const originalUnmount = app.unmount.bind(app);
    app.unmount = () => {
      unsubscribeSelection?.();
      unmount();
      originalUnmount();
    };
  },
};
