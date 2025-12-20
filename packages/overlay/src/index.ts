/**
 * @3lens/overlay
 *
 * In-app overlay UI for 3Lens devtool
 */

export { ThreeLensOverlay } from './components/Overlay';
export type {
  OverlayOptions,
  OverlayPanelContext,
  OverlayPanelDefinition,
  OverlayPanelState,
} from './components/Overlay';

// Convenience function
import type { DevtoolProbe } from '@3lens/core';
import { ThreeLensOverlay } from './components/Overlay';

/**
 * Create and attach the 3Lens overlay to your app
 *
 * @example
 * ```typescript
 * import { createProbe } from '@3lens/core';
 * import { createOverlay } from '@3lens/overlay';
 *
 * const probe = createProbe({ appName: 'My App' });
 * probe.observeRenderer(renderer);
 * probe.observeScene(scene);
 *
 * const overlay = createOverlay(probe);
 * ```
 */
export function createOverlay(
  probe: DevtoolProbe,
  options: Partial<Omit<import('./components/Overlay').OverlayOptions, 'probe'>> = {}
): ThreeLensOverlay {
  return new ThreeLensOverlay({ probe, ...options });
}
