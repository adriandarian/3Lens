/**
 * Svelte Store for 3Lens
 *
 * Provides reactive state management for 3Lens.
 * Compatible with both Svelte 4 stores and Svelte 5 runes.
 *
 * @packageDocumentation
 */

import { writable, derived, get, type Readable, type Writable } from 'svelte/store';
import type { LensClient, LensConfig, Selection, EntityId } from '@3lens/runtime';
import { createLens } from '@3lens/runtime';
import { uiOverlay, uiDock, type UIAdapter, type UIOverlayConfig, type UIDockConfig, type Panel } from '@3lens/ui-core';
import { setThreeLensContext, type ThreeLensContext } from './context';

/**
 * Options for creating a ThreeLens store
 */
export interface ThreeLensStoreOptions {
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
 * ThreeLens store interface
 */
export interface ThreeLensStore extends ThreeLensContext {
  /** Initialize the lens */
  init: () => Promise<LensClient>;
  /** Destroy the store */
  destroy: () => void;
}

/**
 * Create a 3Lens store
 *
 * @example
 * ```svelte
 * <script>
 *   import { createThreeLensStore } from '@3lens/mount-svelte';
 *
 *   const store = createThreeLensStore({
 *     ui: 'overlay',
 *     autoInit: true,
 *   });
 *
 *   const { selection, select, show, hide } = store;
 * </script>
 *
 * <div use:store.mount>
 *   <!-- 3Lens UI will mount here -->
 * </div>
 * ```
 */
export function createThreeLensStore(options: ThreeLensStoreOptions = {}): ThreeLensStore {
  // Internal state
  const clientStore = writable<LensClient | null>(null);
  const uiStore = writable<UIAdapter | null>(null);
  const initializedStore = writable(false);
  const selectionStore = writable<Selection | null>(null);
  const visibleStore = writable(true);

  let mounted = false;
  let unsubscribeSelection: (() => void) | null = null;

  // Initialize lens
  const init = async (): Promise<LensClient> => {
    const result = await createLens(options.config as LensConfig);
    clientStore.set(result.client);
    initializedStore.set(true);

    // Subscribe to selection changes
    unsubscribeSelection = result.client.onSelectionChange((sel) => {
      selectionStore.set(sel);
    });

    return result.client;
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
    const client = get(clientStore);
    client?.select(entityIds);
  };

  const show = () => {
    const ui = get(uiStore);
    ui?.show();
    visibleStore.set(true);
  };

  const hide = () => {
    const ui = get(uiStore);
    ui?.hide();
    visibleStore.set(false);
  };

  const toggle = () => {
    const ui = get(uiStore);
    ui?.toggle();
    visibleStore.set(ui?.isVisible() ?? false);
  };

  const registerPanel = (panel: Panel) => {
    const ui = get(uiStore);
    ui?.registerPanel(panel);
  };

  const unregisterPanel = (panelId: string) => {
    const ui = get(uiStore);
    ui?.unregisterPanel(panelId);
  };

  const mount = (container: HTMLElement) => {
    if (mounted) {
      console.warn('[3Lens] Already mounted');
      return;
    }

    const adapter = createUI(container);
    uiStore.set(adapter);
    adapter.mount(container);
    mounted = true;
  };

  const unmount = () => {
    const ui = get(uiStore);
    if (ui && mounted) {
      ui.unmount();
      mounted = false;
    }
  };

  const destroy = () => {
    unsubscribeSelection?.();
    unmount();
    clientStore.set(null);
    uiStore.set(null);
    initializedStore.set(false);
    selectionStore.set(null);
  };

  // Create store object
  const store: ThreeLensStore = {
    client: { subscribe: clientStore.subscribe } as Readable<LensClient | null>,
    ui: { subscribe: uiStore.subscribe } as Readable<UIAdapter | null>,
    initialized: { subscribe: initializedStore.subscribe } as Readable<boolean>,
    selection: { subscribe: selectionStore.subscribe } as Readable<Selection | null>,
    visible: visibleStore,
    select,
    show,
    hide,
    toggle,
    registerPanel,
    unregisterPanel,
    mount,
    unmount,
    init,
    destroy,
  };

  // Set global context
  setThreeLensContext(store);

  // Auto-initialize if requested
  if (options.autoInit !== false) {
    init().catch((error) => {
      console.error('[3Lens] Failed to initialize:', error);
    });
  }

  return store;
}

/**
 * Default global store instance
 *
 * @example
 * ```svelte
 * <script>
 *   import { threeLensStore } from '@3lens/mount-svelte';
 *
 *   // Access store values
 *   $: console.log($threeLensStore.selection);
 * </script>
 * ```
 */
export const threeLensStore: Writable<ThreeLensStore | null> = writable(null);
