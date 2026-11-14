/**
 * ThreeLens React Provider
 *
 * Owns (or receives) a `Lens`, mounts the HUD above the application, and exposes
 * selection and visibility to hooks. The HUD is a fixed-position layer on
 * `document.body`; the provider never wraps or re-renders your scene.
 *
 * @packageDocumentation
 */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createLens, type Lens, type LensConfig } from '@3lens/runtime';
import { createLensController, type HudOptions, type LensController, type LensControllerState } from '@3lens/ui-core';
import { ThreeLensContext, type ThreeLensContextValue } from './context';

export interface ThreeLensProviderProps {
  children?: ReactNode;
  /** Inspect this lens. If omitted, the provider creates (and disposes) one from `config`. */
  lens?: Lens;
  /** Used only when `lens` is omitted. */
  config?: Partial<LensConfig>;
  /** `false` disables the HUD (use `ThreeLensPanel` or your own UI). Read at mount. */
  hud?: boolean | HudOptions;
  /** Called once the lens is ready. Register your hosts/contexts here when the provider owns the lens. */
  onInit?: (lens: Lens) => void;
  onSelectionChange?: (selection: NonNullable<LensControllerState['selection']>) => void;
}

const idle: LensControllerState = { selection: null, visible: false };
const noopSubscribe = () => () => undefined;
const idleState = () => idle;

/**
 * @example
 * ```tsx
 * <ThreeLensProvider lens={lens}>
 *   <Canvas>…</Canvas>
 * </ThreeLensProvider>
 * ```
 */
export function ThreeLensProvider({ children, lens, config, hud = true, onInit, onSelectionChange }: ThreeLensProviderProps) {
  const [controller, setController] = useState<LensController | null>(null);
  const latest = useRef({ config, hud, onInit });
  latest.current = { config, hud, onInit };

  // Effects (not render) own creation so StrictMode's mount/unmount/mount is clean.
  useEffect(() => {
    const owned = !lens;
    const target = lens ?? createLens({ enabled: true, ...latest.current.config });
    const next = createLensController(target, { hud: latest.current.hud });
    setController(next);
    latest.current.onInit?.(target);
    return () => {
      next.dispose();
      if (owned) target.dispose();
      setController(null);
    };
  }, [lens]);

  const state = useSyncExternalStore(controller?.subscribe ?? noopSubscribe, controller?.getState ?? idleState, idleState);

  const notified = useRef(state.selection);
  useEffect(() => {
    if (state.selection && state.selection !== notified.current) onSelectionChange?.(state.selection);
    notified.current = state.selection;
  }, [state.selection, onSelectionChange]);

  const select = useCallback((ids: string | string[]) => controller?.select(ids), [controller]);
  const clearSelection = useCallback(() => controller?.clearSelection(), [controller]);
  const show = useCallback(() => controller?.show(), [controller]);
  const hide = useCallback(() => controller?.hide(), [controller]);
  const toggle = useCallback(() => controller?.toggle(), [controller]);
  const openAnalysis = useCallback(() => controller?.openAnalysis(), [controller]);
  const openPalette = useCallback(() => controller?.openPalette(), [controller]);

  const value = useMemo<ThreeLensContextValue>(
    () => ({
      lens: controller?.lens ?? null,
      controller,
      hud: controller?.hud ?? null,
      initialized: !!controller,
      selection: state.selection,
      visible: state.visible,
      select,
      clearSelection,
      show,
      hide,
      toggle,
      openAnalysis,
      openPalette,
    }),
    [controller, state, select, clearSelection, show, hide, toggle, openAnalysis, openPalette]
  );

  return <ThreeLensContext.Provider value={value}>{children}</ThreeLensContext.Provider>;
}
