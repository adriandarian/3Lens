import { InjectionToken } from '@angular/core';
import type { DevtoolProbe } from '@3lens/core';

/**
 * Injection token for the 3Lens probe instance
 *
 * @example
 * ```typescript
 * @Component({...})
 * export class MyComponent {
 *   constructor(@Inject(THREELENS_PROBE) private probe: DevtoolProbe) {
 *     const snapshot = probe.takeSnapshot();
 *   }
 * }
 * ```
 */
export const THREELENS_PROBE = new InjectionToken<DevtoolProbe>('THREELENS_PROBE');

/**
 * Injection token for 3Lens configuration
 *
 * @example
 * ```typescript
 * @NgModule({
 *   providers: [
 *     { provide: THREELENS_CONFIG, useValue: { appName: 'My App' } }
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
export const THREELENS_CONFIG = new InjectionToken<ThreeLensModuleConfig>('THREELENS_CONFIG');

/**
 * Configuration for the 3Lens Angular module
 */
export interface ThreeLensModuleConfig {
  /**
   * Application name for identification
   */
  appName?: string;

  /**
   * Whether to show the overlay UI
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Keyboard shortcut to toggle the overlay (e.g., 'ctrl+shift+d')
   * @default 'ctrl+shift+d'
   */
  toggleShortcut?: string;

  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Whether to automatically create the overlay
   * @default true
   */
  autoCreateOverlay?: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_THREELENS_CONFIG: ThreeLensModuleConfig = {
  appName: 'Angular Three.js App',
  showOverlay: true,
  toggleShortcut: 'ctrl+shift+d',
  debug: false,
  autoCreateOverlay: true,
};

