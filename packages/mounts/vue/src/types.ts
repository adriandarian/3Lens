/**
 * Vue types for the 3Lens mount kit.
 *
 * @packageDocumentation
 */

import type { InjectionKey, Ref, ShallowRef } from 'vue';
import type { Lens } from '@3lens/runtime';
import type { LensController, LensHud } from '@3lens/ui-core';

type Selection = ReturnType<Lens['getSelection']>;

/** Value provided by `threeLensPlugin`. */
export interface ThreeLensContext {
  lens: Lens;
  controller: LensController;
  /** The live HUD handle, or null when the HUD is disabled. */
  hud: ShallowRef<LensHud | null>;
  initialized: Ref<boolean>;
  selection: ShallowRef<Selection | null>;
  /** HUD visibility. */
  visible: Ref<boolean>;
  select: (entityIds: string | string[]) => void;
  clearSelection: () => void;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  openAnalysis: () => void;
  openPalette: () => void;
}

export const THREELENS_INJECTION_KEY: InjectionKey<ThreeLensContext> = Symbol('3lens');
