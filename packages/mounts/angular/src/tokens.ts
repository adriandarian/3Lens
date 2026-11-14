/**
 * ThreeLens Angular injection tokens and configuration.
 *
 * @packageDocumentation
 */

import { InjectionToken } from '@angular/core';
import type { Lens, LensConfig } from '@3lens/runtime';
import type { HudOptions } from '@3lens/ui-core';

export interface ThreeLensConfig {
  /** Inspect this lens. If omitted, the service creates (and disposes) one from `lensConfig`. */
  lens?: Lens;
  /** Used only when `lens` is omitted. */
  lensConfig?: Partial<LensConfig>;
  /** `false` disables the HUD (use `<threelens-panel>` or your own UI). */
  hud?: boolean | HudOptions;
  /** Initialise when the service is first injected instead of on the first `init()` call. */
  autoInit?: boolean;
  /** Run 3Lens outside the Angular zone so its timers do not trigger change detection (default true). */
  runOutsideZone?: boolean;
}

export const THREELENS_CONFIG = new InjectionToken<ThreeLensConfig>('THREELENS_CONFIG');
