/**
 * ThreeLens HUD for Svelte (4 and 5).
 *
 * A plain action: `<div use:lensHud={{ lens }} />`. The HUD is a fixed-position layer
 * appended to `document.body`; the node the action is attached to is not modified.
 *
 * @packageDocumentation
 */

import type { Lens } from '@3lens/runtime';
import { mountLensHud, type HudOptions, type LensHud } from '@3lens/ui-core';

export interface LensHudActionOptions extends HudOptions {
  lens: Lens | null | undefined;
  /** Receives the live handle (palette, drawer, analysis window), or null when unmounted. */
  onHud?: (hud: LensHud | null) => void;
}

export function lensHud(_node: HTMLElement, params: LensHudActionOptions) {
  let unmount: (() => void) | undefined;
  let current: Lens | null | undefined;
  let latest = params;
  const apply = (next: LensHudActionOptions) => {
    latest = next;
    if (next.lens === current && unmount) return;
    unmount?.();
    unmount = undefined;
    current = next.lens;
    next.onHud?.(null);
    if (!next.lens) return;
    const { lens, onHud, ...options } = next;
    const mounted = mountLensHud(lens as Lens, options);
    unmount = mounted.unmount;
    onHud?.(mounted.hud);
  };
  apply(params);
  return {
    update: apply,
    destroy() {
      unmount?.();
      unmount = undefined;
      latest.onHud?.(null);
    },
  };
}
