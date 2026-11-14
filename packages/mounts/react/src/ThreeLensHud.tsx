/**
 * ThreeLens HUD for React.
 *
 * Mounts the quiet HUD (status pills, pick card, drawer, palette, analysis window)
 * above the application for a `Lens` you already hold. The HUD is a fixed-position
 * layer appended to `document.body`: it never reparents, resizes, or re-renders
 * your React tree, so it is safe next to r3f `<Canvas>` and StrictMode.
 *
 * @packageDocumentation
 */

import { useEffect, useRef } from 'react';
import type { Lens } from '@3lens/runtime';
import { mountLensHud, type HudOptions, type LensHud } from '@3lens/ui-core';

export interface ThreeLensHudProps extends HudOptions {
  /** The lens to inspect. The HUD remounts if this identity changes. */
  lens: Lens | null | undefined;
}

/**
 * Hook form: returns a ref to the live HUD handle (palette, drawer, analysis window).
 * Options are read at mount; change `lens` to remount.
 */
export function useThreeLensHud(lens: Lens | null | undefined, options: HudOptions = {}) {
  const handle = useRef<LensHud | null>(null);
  const latest = useRef(options);
  latest.current = options;
  useEffect(() => {
    if (!lens) return;
    const mounted = mountLensHud(lens, latest.current);
    handle.current = mounted.hud;
    return () => {
      mounted.unmount();
      handle.current = null;
    };
  }, [lens]);
  return handle;
}

/**
 * Component form. Renders nothing into your tree.
 *
 * @example
 * ```tsx
 * const lens = useMemo(() => createLens({ enabled: true }), []);
 * return <><Canvas>…</Canvas><ThreeLensHud lens={lens} /></>;
 * ```
 */
export function ThreeLensHud({ lens, ...options }: ThreeLensHudProps) {
  useThreeLensHud(lens, options);
  return null;
}
