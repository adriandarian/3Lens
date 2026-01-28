/**
 * Svelte Context for 3Lens
 *
 * Works with both Svelte 4 (getContext/setContext) and Svelte 5 (context runes).
 *
 * @packageDocumentation
 */

import type { LensClient, Selection, EntityId } from '@3lens/runtime';
import type { UIAdapter, Panel } from '@3lens/ui-core';
import type { Readable, Writable } from 'svelte/store';

/**
 * Context key for 3Lens
 */
export const THREELENS_CONTEXT_KEY = Symbol('3lens');

/**
 * ThreeLens context provided to Svelte components
 */
export interface ThreeLensContext {
  /** The lens client */
  client: Readable<LensClient | null>;
  /** The UI adapter */
  ui: Readable<UIAdapter | null>;
  /** Whether initialized */
  initialized: Readable<boolean>;
  /** Current selection */
  selection: Readable<Selection | null>;
  /** Whether UI is visible */
  visible: Writable<boolean>;
  /** Select entities */
  select: (entityIds: EntityId | EntityId[]) => void;
  /** Show the UI */
  show: () => void;
  /** Hide the UI */
  hide: () => void;
  /** Toggle visibility */
  toggle: () => void;
  /** Register a panel */
  registerPanel: (panel: Panel) => void;
  /** Unregister a panel */
  unregisterPanel: (panelId: string) => void;
  /** Mount UI to container */
  mount: (container: HTMLElement) => void;
  /** Unmount UI */
  unmount: () => void;
}

// Context storage (used by both Svelte 4 and 5)
let globalContext: ThreeLensContext | null = null;

/**
 * Get the 3Lens context
 *
 * For Svelte 4, use with getContext:
 * ```svelte
 * <script>
 *   import { getContext } from 'svelte';
 *   import { THREELENS_CONTEXT_KEY } from '@3lens/mount-svelte';
 *   const context = getContext(THREELENS_CONTEXT_KEY);
 * </script>
 * ```
 *
 * Or use this helper which works with both versions:
 * ```svelte
 * <script>
 *   import { getThreeLensContext } from '@3lens/mount-svelte';
 *   const context = getThreeLensContext();
 * </script>
 * ```
 */
export function getThreeLensContext(): ThreeLensContext | null {
  return globalContext;
}

/**
 * Set the 3Lens context (called internally by the action/store)
 */
export function setThreeLensContext(context: ThreeLensContext): void {
  globalContext = context;
}
