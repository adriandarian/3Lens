/**
 * React Context for 3Lens
 *
 * @packageDocumentation
 */

import { createContext } from 'react';
import type { LensClient, Selection, EntityId } from '@3lens/runtime';
import type { UIAdapter, Panel } from '@3lens/ui-core';

/**
 * ThreeLens context value
 */
export interface ThreeLensContextValue {
  /** The lens client */
  client: LensClient | null;
  /** The UI adapter */
  ui: UIAdapter | null;
  /** Whether initialized */
  initialized: boolean;
  /** Current selection */
  selection: Selection | null;
  /** Whether UI is visible */
  visible: boolean;
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
}

/**
 * React context for 3Lens
 */
export const ThreeLensContext = createContext<ThreeLensContextValue | null>(null);

ThreeLensContext.displayName = 'ThreeLensContext';
