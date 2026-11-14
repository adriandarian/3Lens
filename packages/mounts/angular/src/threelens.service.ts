/**
 * ThreeLens Angular Service
 *
 * Owns (or receives) a `Lens`, mounts the HUD above the application, and exposes
 * selection and visibility as observables that re-enter the Angular zone so
 * templates update, while 3Lens itself runs outside it.
 *
 * @packageDocumentation
 */

import { Inject, Injectable, NgZone, OnDestroy, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { createLens, type Lens } from '@3lens/runtime';
import { createLensController, type HudOptions, type LensController } from '@3lens/ui-core';
import { THREELENS_CONFIG, type ThreeLensConfig } from './tokens';

type Selection = ReturnType<Lens['getSelection']>;

@Injectable({ providedIn: 'root' })
export class ThreeLensService implements OnDestroy {
  private controller: LensController | null = null;
  private owned = false;
  private off: (() => void) | undefined;

  private readonly _selection$ = new BehaviorSubject<Selection | null>(null);
  readonly selection$: Observable<Selection | null> = this._selection$.asObservable();
  private readonly _visible$ = new BehaviorSubject<boolean>(false);
  /** HUD visibility. */
  readonly visible$: Observable<boolean> = this._visible$.asObservable();
  private readonly _connected$ = new BehaviorSubject<boolean>(false);
  readonly connected$: Observable<boolean> = this._connected$.asObservable();

  constructor(
    private readonly zone: NgZone,
    @Optional() @Inject(THREELENS_CONFIG) private readonly config?: ThreeLensConfig
  ) {
    if (this.config?.autoInit) this.init();
  }

  /**
   * Start inspecting a lens. With no argument, uses `config.lens` or creates one from
   * `config.lensConfig` (the service then disposes it). Idempotent.
   */
  init(lens?: Lens, hud?: boolean | HudOptions): Lens {
    if (this.controller) return this.controller.lens;
    const run = <T>(fn: () => T) => (this.config?.runOutsideZone === false ? fn() : this.zone.runOutsideAngular(fn));
    const target = lens ?? this.config?.lens;
    this.owned = !target;
    return run(() => {
      const resolved = target ?? createLens({ enabled: true, ...this.config?.lensConfig });
      const controller = createLensController(resolved, { hud: hud ?? this.config?.hud });
      this.controller = controller;
      const publish = () => {
        const state = controller.getState();
        // Re-enter the zone only to notify subscribers.
        this.zone.run(() => {
          this._selection$.next(state.selection);
          this._visible$.next(state.visible);
        });
      };
      this.off = controller.subscribe(publish);
      publish();
      this._connected$.next(true);
      return resolved;
    });
  }

  getLens(): Lens | null {
    return this.controller?.lens ?? null;
  }
  getController(): LensController | null {
    return this.controller;
  }
  getSelection(): Selection | null {
    return this._selection$.getValue();
  }
  isVisible(): boolean {
    return this._visible$.getValue();
  }

  select(entityIds: string | string[]): void {
    this.controller?.select(entityIds);
  }
  clearSelection(): void {
    this.controller?.clearSelection();
  }
  show(): void {
    this.controller?.show();
  }
  hide(): void {
    this.controller?.hide();
  }
  toggle(): void {
    this.controller?.toggle();
  }
  openAnalysis(): void {
    this.controller?.openAnalysis();
  }
  openPalette(): void {
    this.controller?.openPalette();
  }

  /** Embed the full workspace in a container you own. Returns an unmount function. */
  mountWorkspace(container: HTMLElement, options?: { readonly?: boolean }): () => void {
    const controller = this.controller ?? (this.init(undefined, false), this.controller!);
    return this.zone.runOutsideAngular(() => controller.mountWorkspace(container, options));
  }

  ngOnDestroy(): void {
    this.off?.();
    this.off = undefined;
    const lens = this.controller?.lens;
    this.controller?.dispose();
    this.controller = null;
    if (this.owned) lens?.dispose();
    this._connected$.next(false);
    this._visible$.next(false);
  }
}
