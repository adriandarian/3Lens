/**
 * ThreeLens HUD for Angular.
 *
 * `<threelens-hud [lens]="lens" />` mounts the quiet HUD above the application for a
 * `Lens` you already hold. It runs outside the Angular zone so its timers and
 * animation frames never trigger change detection, and it renders nothing in the
 * component template.
 *
 * @packageDocumentation
 */

import { ChangeDetectionStrategy, Component, Input, NgZone, OnChanges, OnDestroy } from '@angular/core';
import type { Lens } from '@3lens/runtime';
import { mountLensHud, type HudOptions, type LensHud } from '@3lens/ui-core';

@Component({
  selector: 'threelens-hud',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeLensHudComponent implements OnChanges, OnDestroy {
  /** The lens to inspect. The HUD remounts when this identity changes. */
  @Input() lens: Lens | null | undefined;
  /** HUD options, read at mount. */
  @Input() options: HudOptions = {};

  /** The live HUD handle (palette, drawer, analysis window), or null. */
  hud: LensHud | null = null;
  private unmount: (() => void) | undefined;

  constructor(private readonly zone: NgZone) {}

  ngOnChanges(): void {
    this.teardown();
    const lens = this.lens;
    if (!lens) return;
    this.zone.runOutsideAngular(() => {
      const mounted = mountLensHud(lens, this.options);
      this.hud = mounted.hud;
      this.unmount = mounted.unmount;
    });
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  private teardown(): void {
    this.unmount?.();
    this.unmount = undefined;
    this.hud = null;
  }
}
