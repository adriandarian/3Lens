/**
 * Svelte context for the 3Lens mount kit.
 *
 * @packageDocumentation
 */

import type { Lens } from '@3lens/runtime';
import type { LensController, LensHud } from '@3lens/ui-core';
import type { Readable } from 'svelte/store';

type Selection = ReturnType<Lens['getSelection']>;

/** Stable key if you prefer Svelte's own `setContext` over the module-level context. */
export const THREELENS_CONTEXT_KEY = Symbol('3lens');

export interface ThreeLensContext {
  lens: Lens;
  controller: LensController;
  /** The live HUD handle, or null when the HUD is disabled. */
  hud: Readable<LensHud | null>;
  initialized: Readable<boolean>;
  selection: Readable<Selection | null>;
  /** HUD visibility. */
  visible: Readable<boolean>;
  select: (entityIds: string | string[]) => void;
  clearSelection: () => void;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  openAnalysis: () => void;
  openPalette: () => void;
}

// Module-level context (works for Svelte 4 and 5 without component initialisation order rules).
let globalContext: ThreeLensContext | null = null;

export function getThreeLensContext(): ThreeLensContext | null {
  return globalContext;
}

export function setThreeLensContext(context: ThreeLensContext | null): void {
  globalContext = context;
}
