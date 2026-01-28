/**
 * Angular Injection Tokens
 *
 * @packageDocumentation
 */

import { InjectionToken } from '@angular/core';
import type { UIOverlayConfig, UIDockConfig } from '@3lens/ui-core';
import type { LensConfig } from '@3lens/runtime';

/**
 * Configuration for the ThreeLens Angular module
 */
export interface ThreeLensConfig {
  /** Lens configuration */
  lens?: Partial<LensConfig>;
  /** UI mode */
  ui?: 'overlay' | 'dock';
  /** Overlay configuration (when ui is 'overlay') */
  overlayConfig?: UIOverlayConfig;
  /** Dock configuration (when ui is 'dock') */
  dockConfig?: Omit<UIDockConfig, 'target'>;
  /** Auto-initialize on module load */
  autoInit?: boolean;
  /** Run outside NgZone for performance */
  runOutsideZone?: boolean;
}

/**
 * Injection token for ThreeLens configuration
 */
export const THREELENS_CONFIG = new InjectionToken<ThreeLensConfig>('THREELENS_CONFIG');
