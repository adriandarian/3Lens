import { createContext } from 'react';
import type { Lens } from '@3lens/runtime';
import type { LensController, LensHud } from '@3lens/ui-core';

type Selection = ReturnType<Lens['getSelection']>;

/** Value provided by `ThreeLensProvider`. */
export interface ThreeLensContextValue {
  /** The lens being inspected (provided or created by the provider); null until mounted. */
  lens: Lens | null;
  /** Framework-agnostic controller; null until mounted. */
  controller: LensController | null;
  /** The live HUD handle, or null when the HUD is disabled. */
  hud: LensHud | null;
  initialized: boolean;
  selection: Selection | null;
  /** HUD visibility. */
  visible: boolean;
  select: (entityIds: string | string[]) => void;
  clearSelection: () => void;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  openAnalysis: () => void;
  openPalette: () => void;
}

export const ThreeLensContext = createContext<ThreeLensContextValue | null>(null);
ThreeLensContext.displayName = 'ThreeLensContext';
