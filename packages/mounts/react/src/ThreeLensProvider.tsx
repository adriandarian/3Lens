/**
 * ThreeLens React Provider
 *
 * @packageDocumentation
 */

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import type { LensClient, LensConfig, Selection, EntityId } from '@3lens/runtime';
import { createLens } from '@3lens/runtime';
import { uiOverlay, uiDock, type UIAdapter, type UIOverlayConfig, type UIDockConfig, type Panel } from '@3lens/ui-core';
import { ThreeLensContext, type ThreeLensContextValue } from './context';

/**
 * Props for ThreeLensProvider
 */
export interface ThreeLensProviderProps {
  /** Children to render */
  children: ReactNode;
  /** Lens configuration */
  config?: Partial<LensConfig>;
  /** UI mode */
  ui?: 'overlay' | 'dock';
  /** Overlay configuration */
  overlayConfig?: UIOverlayConfig;
  /** Dock configuration (requires target) */
  dockConfig?: UIDockConfig;
  /** Auto-initialize */
  autoInit?: boolean;
  /** Called when initialized */
  onInit?: (client: LensClient) => void;
  /** Called on selection change */
  onSelectionChange?: (selection: Selection) => void;
}

/**
 * React provider for 3Lens context
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ThreeLensProvider config={{ debug: true }}>
 *       <Canvas>
 *         <Scene />
 *       </Canvas>
 *       <ThreeLensPanel />
 *     </ThreeLensProvider>
 *   );
 * }
 * ```
 */
export function ThreeLensProvider({
  children,
  config,
  ui = 'overlay',
  overlayConfig,
  dockConfig,
  autoInit = true,
  onInit,
  onSelectionChange,
}: ThreeLensProviderProps) {
  const [client, setClient] = useState<LensClient | null>(null);
  const [uiAdapter, setUiAdapter] = useState<UIAdapter | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [visible, setVisible] = useState(true);
  
  const initRef = useRef(false);

  // Initialize lens
  useEffect(() => {
    if (!autoInit || initRef.current) return;
    initRef.current = true;

    const initLens = async () => {
      try {
        const result = await createLens(config as LensConfig);
        setClient(result.client);
        setInitialized(true);
        onInit?.(result.client);

        // Subscribe to selection changes
        const unsubscribe = result.client.onSelectionChange((sel) => {
          setSelection(sel);
          onSelectionChange?.(sel);
        });

        return unsubscribe;
      } catch (error) {
        console.error('[3Lens] Failed to initialize:', error);
      }
    };

    let unsubscribe: (() => void) | undefined;
    initLens().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      unsubscribe?.();
    };
  }, [autoInit, config, onInit, onSelectionChange]);

  // Create UI adapter
  useEffect(() => {
    let adapter: UIAdapter;

    if (ui === 'overlay') {
      adapter = uiOverlay(overlayConfig);
    } else if (dockConfig) {
      adapter = uiDock(dockConfig);
    } else {
      // Default overlay if dock config not provided
      adapter = uiOverlay(overlayConfig);
    }

    setUiAdapter(adapter);

    return () => {
      adapter.unmount();
    };
  }, [ui, overlayConfig, dockConfig]);

  // Actions
  const select = useCallback((entityIds: EntityId | EntityId[]) => {
    client?.select(entityIds);
  }, [client]);

  const show = useCallback(() => {
    uiAdapter?.show();
    setVisible(true);
  }, [uiAdapter]);

  const hide = useCallback(() => {
    uiAdapter?.hide();
    setVisible(false);
  }, [uiAdapter]);

  const toggle = useCallback(() => {
    uiAdapter?.toggle();
    setVisible(uiAdapter?.isVisible() ?? false);
  }, [uiAdapter]);

  const registerPanel = useCallback((panel: Panel) => {
    uiAdapter?.registerPanel(panel);
  }, [uiAdapter]);

  const unregisterPanel = useCallback((panelId: string) => {
    uiAdapter?.unregisterPanel(panelId);
  }, [uiAdapter]);

  // Context value
  const value = useMemo<ThreeLensContextValue>(() => ({
    client,
    ui: uiAdapter,
    initialized,
    selection,
    visible,
    select,
    show,
    hide,
    toggle,
    registerPanel,
    unregisterPanel,
  }), [
    client,
    uiAdapter,
    initialized,
    selection,
    visible,
    select,
    show,
    hide,
    toggle,
    registerPanel,
    unregisterPanel,
  ]);

  return (
    <ThreeLensContext.Provider value={value}>
      {children}
    </ThreeLensContext.Provider>
  );
}
