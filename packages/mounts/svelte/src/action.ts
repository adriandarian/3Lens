/**
 * Svelte Action for 3Lens
 *
 * Embeds the full workspace (inspect, performance, memory, changes, shaders) in the
 * element it is attached to. For the quiet HUD above the app use `lensHud`.
 * Compatible with Svelte 4 and 5.
 *
 * @packageDocumentation
 */

import type { ActionReturn } from 'svelte/action';
import type { Lens } from '@3lens/runtime';
import { createThreeLensStore, type ThreeLensStore } from './store';

export interface ThreeLensActionOptions {
  /** Use an existing store (it is not destroyed by the action). */
  store?: ThreeLensStore;
  /** Or inspect this lens; the action creates (and destroys) a HUD-less store for it. */
  lens?: Lens;
  readonly?: boolean;
  /** Receives the store in use. */
  onStore?: (store: ThreeLensStore) => void;
}

/**
 * @example
 * ```svelte
 * <div style="height: 480px" use:threeLens={{ lens }} />
 * ```
 */
export function threeLens(node: HTMLElement, options: ThreeLensActionOptions = {}): ActionReturn<ThreeLensActionOptions> {
  let unmount: (() => void) | undefined;
  let ownedStore: ThreeLensStore | undefined;
  let key: unknown;

  const teardown = () => {
    unmount?.();
    unmount = undefined;
    ownedStore?.destroy();
    ownedStore = undefined;
  };
  const apply = (next: ThreeLensActionOptions) => {
    const identity = [next.store, next.lens, next.readonly];
    if (key && identity.every((value, index) => value === (key as unknown[])[index])) return;
    teardown();
    key = identity;
    let store = next.store;
    if (!store) {
      if (!next.lens) return;
      // The lens is the caller's; destroy() never disposes a lens it was given.
      store = ownedStore = createThreeLensStore({ lens: next.lens, hud: false });
    }
    unmount = store.mountWorkspace(node, { readonly: next.readonly });
    next.onStore?.(store);
  };

  apply(options);
  return {
    update: apply,
    destroy: teardown,
  };
}
