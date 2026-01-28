/**
 * Vue Types for 3Lens
 *
 * @packageDocumentation
 */

import type { InjectionKey, Ref, ShallowRef } from 'vue';
import type { LensClient, Selection, EntityId } from '@3lens/runtime';
import type { UIAdapter, Panel } from '@3lens/ui-core';

/**
 * ThreeLens context provided to Vue components
 */
export interface ThreeLensContext {
  /** The lens client */
  client: ShallowRef<LensClient | null>;
  /** The UI adapter */
  ui: ShallowRef<UIAdapter | null>;
  /** Whether initialized */
  initialized: Ref<boolean>;
  /** Current selection */
  selection: Ref<Selection | null>;
  /** Whether UI is visible */
  visible: Ref<boolean>;
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
  /** Mount UI to a container */
  mount: (container: HTMLElement) => void;
  /** Unmount UI */
  unmount: () => void;
}

/**
 * Vue injection key for 3Lens
 */
export const THREELENS_INJECTION_KEY: InjectionKey<ThreeLensContext> = Symbol('3lens');
