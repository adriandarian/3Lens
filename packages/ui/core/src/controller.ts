/**
 * Framework-agnostic controller shared by every mount kit.
 *
 * It owns the HUD handle and the reactive state a framework needs (selection,
 * visibility) on top of the public `Lens` API. Each kit only adapts `getState` /
 * `subscribe` to its own reactivity primitive, so behavior cannot drift between
 * React, Vue, Angular and Svelte.
 */
import type { Lens } from '@3lens/runtime';
import { createInvestigationUI, type InvestigationUIOptions } from './investigation';
import { mountLensHud, type HudOptions, type LensHud } from './hud/hud';

type Selection = ReturnType<Lens['getSelection']>;

export interface LensControllerOptions {
  /** `false` skips the HUD (use `mountWorkspace` or your own UI). Default: HUD on. */
  hud?: boolean | HudOptions;
}

export interface LensControllerState {
  selection: Selection | null;
  /** HUD visibility; false when the HUD is disabled. */
  visible: boolean;
}

export interface LensController {
  readonly lens: Lens;
  /** The live HUD handle, or null when disabled / disposed. */
  readonly hud: LensHud | null;
  /** Immutable snapshot; a new object is produced on every change (safe for useSyncExternalStore). */
  getState(): LensControllerState;
  subscribe(listener: () => void): () => void;
  select(entityIds: string | string[]): void;
  clearSelection(): void;
  show(): void;
  hide(): void;
  toggle(): void;
  openAnalysis(): void;
  openPalette(): void;
  /** Embed the full workspace in a host-owned container. Returns an unmount function. */
  mountWorkspace(container: HTMLElement, options?: Pick<InvestigationUIOptions, 'readonly' | 'csp'>): () => void;
  dispose(): void;
}

export function createLensController(lens: Lens, options: LensControllerOptions = {}): LensController {
  const listeners = new Set<() => void>();
  let state: LensControllerState = { selection: lens.getSelection?.() ?? null, visible: false };
  let hud: LensHud | null = null;
  let unmountHud: (() => void) | undefined;
  let disposed = false;
  const workspaces = new Set<() => void>();

  const set = (patch: Partial<LensControllerState>) => {
    const next = { ...state, ...patch };
    if (next.selection === state.selection && next.visible === state.visible) return;
    state = next;
    for (const listener of [...listeners]) listener();
  };

  const offSelection = lens.onSelectionChange((selection) => set({ selection }));

  const hudOptions = options.hud === false ? undefined : typeof options.hud === 'object' ? options.hud : {};
  const controller: LensController = {
    lens,
    get hud() {
      return hud;
    },
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    select: (ids) => lens.select(ids),
    clearSelection: () => lens.select([]),
    show() {
      if (!hud || disposed) return;
      hud.show(lens);
      set({ visible: true });
    },
    hide() {
      if (!hud || disposed) return;
      hud.hide();
      set({ visible: false });
    },
    toggle() {
      if (hud?.isVisible()) controller.hide();
      else controller.show();
    },
    openAnalysis: () => hud?.openAnalysis(),
    openPalette: () => hud?.openPalette(),
    mountWorkspace(container, workspaceOptions = {}) {
      const ui = createInvestigationUI({ surface: 'dock', layout: 'dock', target: container, ...workspaceOptions });
      ui.show(lens);
      let done = false;
      const unmount = () => {
        if (done) return;
        done = true;
        workspaces.delete(unmount);
        ui.dispose();
      };
      workspaces.add(unmount);
      return unmount;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      offSelection();
      for (const unmount of [...workspaces]) unmount();
      unmountHud?.();
      hud = null;
      listeners.clear();
    },
  };

  if (hudOptions) {
    const mounted = mountLensHud(lens, { ...hudOptions, onToggle: hudOptions.onToggle ?? controller.toggle });
    hud = mounted.hud;
    unmountHud = mounted.unmount;
    state = { ...state, visible: true };
  }
  return controller;
}
