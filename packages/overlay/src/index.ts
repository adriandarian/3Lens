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

// Theme system
export {
  ThemeManager,
  PRESET_THEMES,
} from './utils/theme';
export type {
  ThemeMode,
  ResolvedTheme,
  CustomTheme,
  ThemeChangeEvent,
} from './utils/theme';

// Keyboard shortcuts
export {
  KeyboardManager,
  getDefaultShortcuts,
} from './utils/keyboard';
export type {
  KeyModifiers,
  KeyboardShortcut,
  ShortcutGroup,
} from './utils/keyboard';

// Command palette
export {
  CommandPalette,
  getDefaultCommands,
} from './utils/command-palette';
export type {
  Command,
  CommandGroup,
} from './utils/command-palette';


// Convenience function
import type { DevtoolProbe, ProbeConfig } from '@3lens/core';
import { createProbe } from '@3lens/core';
import type { Scene, WebGLRenderer } from 'three';

import type { OverlayOptions } from './components/Overlay';
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
  options: Partial<Omit<OverlayOptions, 'probe'>> = {}
): ThreeLensOverlay {
  return new ThreeLensOverlay({ probe, ...options });
}

export interface OverlayBootstrapOptions {
  renderer: WebGLRenderer;
  scene: Scene;
  appName?: string;
  probeConfig?: Partial<ProbeConfig>;
  overlay?: Partial<Omit<OverlayOptions, 'probe'>>;
  three?: typeof import('three');
}

/**
 * One-call bootstrap for npm/overlay mode.
 * Creates a probe, wires it to the renderer + scene, and mounts the overlay UI.
 */
export function bootstrapOverlay(options: OverlayBootstrapOptions): {
  probe: DevtoolProbe;
  overlay: ThreeLensOverlay;
} {
  const probe = createProbe({
    appName: options.appName ?? document.title ?? '3Lens App',
    ...options.probeConfig,
  });

  if (options.three) {
    probe.setThreeReference(options.three);
  }

  probe.observeRenderer(options.renderer);
  probe.observeScene(options.scene);

  const overlay = new ThreeLensOverlay({
    probe,
    ...(options.overlay ?? {}),
  });

  return { probe, overlay };
}
