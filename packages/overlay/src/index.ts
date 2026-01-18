/**
 * @packageDocumentation
 * @module @3lens/overlay
 *
 * # @3lens/overlay
 *
 * In-app overlay UI for 3Lens devtools.
 *
 * This package provides a floating panel overlay system that renders directly
 * in your three.js application. It includes:
 *
 * - **Scene Explorer**: Navigate and select objects in the scene tree
 * - **Performance Stats**: Real-time FPS, draw calls, and memory monitoring
 * - **Material Inspector**: Edit materials and view shader code
 * - **Texture Viewer**: Preview and analyze textures
 * - **Theme System**: Dark/light/high-contrast themes with customization
 * - **Keyboard Shortcuts**: Navigate efficiently with configurable hotkeys
 *
 * ## Quick Start
 *
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
 *
 * Or use the all-in-one bootstrap:
 *
 * ```typescript
 * import { bootstrapOverlay } from '@3lens/overlay';
 *
 * const { probe, overlay } = bootstrapOverlay({
 *   renderer,
 *   scene,
 *   appName: 'My App',
 * });
 * ```
 *
 * @see {@link createOverlay} - Create overlay with existing probe
 * @see {@link bootstrapOverlay} - One-call setup for probe + overlay
 * @see {@link ThreeLensOverlay} - Main overlay class
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE OVERLAY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main overlay component class.
 * @category Overlay
 */
export { ThreeLensOverlay } from './components/Overlay';

/**
 * Overlay configuration and panel types.
 * @category Overlay
 */
export type {
  OverlayOptions,
  OverlayPanelContext,
  OverlayPanelDefinition,
  OverlayPanelState,
} from './components/Overlay';

// ═══════════════════════════════════════════════════════════════════════════
// THEME SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Theme management with dark/light/high-contrast modes.
 * @category Overlay
 */
export { ThemeManager, PRESET_THEMES } from './utils/theme';

/**
 * Theme types for customization.
 * @category Overlay
 */
export type {
  ThemeMode,
  ResolvedTheme,
  CustomTheme,
  ThemeChangeEvent,
} from './utils/theme';

// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Keyboard shortcut management.
 * @category Overlay
 */
export { KeyboardManager, getDefaultShortcuts } from './utils/keyboard';

/**
 * Keyboard shortcut types.
 * @category Overlay
 */
export type {
  KeyModifiers,
  KeyboardShortcut,
  ShortcutGroup,
} from './utils/keyboard';

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND PALETTE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Command palette for quick actions.
 * @category Overlay
 */
export { CommandPalette, getDefaultCommands } from './utils/command-palette';

/**
 * Command palette types.
 * @category Overlay
 */
export type { Command, CommandGroup } from './utils/command-palette';

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

import type { DevtoolProbe, ProbeConfig, ThreeNamespace } from '@3lens/core';
import { createProbe } from '@3lens/core';
import type { Scene, WebGLRenderer } from 'three';

import type { OverlayOptions } from './components/Overlay';
import { ThreeLensOverlay } from './components/Overlay';

/**
 * Create and attach the 3Lens overlay to your app.
 *
 * This function creates a floating overlay UI that provides visual devtools
 * for inspecting and debugging your three.js scene.
 *
 * @param probe - An initialized DevtoolProbe instance, or an options object containing probe
 * @param options - Optional overlay configuration (ignored if first arg is an object)
 * @returns A ThreeLensOverlay instance
 *
 * @example
 * Basic usage:
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
 *
 * @example
 * With options object:
 * ```typescript
 * const overlay = createOverlay({ probe, theme: 'dark' });
 * ```
 *
 * @example
 * With custom panels:
 * ```typescript
 * const overlay = createOverlay(probe, {
 *   panels: [
 *     {
 *       id: 'my-panel',
 *       title: 'My Panel',
 *       icon: '🔧',
 *       iconClass: 'custom',
 *       defaultWidth: 400,
 *       defaultHeight: 300,
 *       render: (ctx) => '<div>Custom content</div>',
 *     }
 *   ]
 * });
 * ```
 *
 * @category Overlay
 */
export function createOverlay(
  probeOrOptions: DevtoolProbe | OverlayOptions,
  options?: Partial<Omit<OverlayOptions, 'probe'>>
): ThreeLensOverlay {
  // Handle object-based calling convention: createOverlay({ probe, ...options })
  // Check if first arg is an options object (has 'probe' property)
  // A DevtoolProbe instance would have onFrameStats directly, not nested in a 'probe' property
  if (
    probeOrOptions &&
    typeof probeOrOptions === 'object' &&
    'probe' in probeOrOptions &&
    probeOrOptions.probe &&
    typeof (probeOrOptions.probe as any).onFrameStats === 'function'
  ) {
    // This is an options object: { probe: DevtoolProbe, ...otherOptions }
    return new ThreeLensOverlay(probeOrOptions as OverlayOptions);
  }

  // Handle function-based calling convention: createOverlay(probe, options)
  // First arg is the probe itself
  return new ThreeLensOverlay({
    probe: probeOrOptions as DevtoolProbe,
    ...(options ?? {}),
  });
}

/**
 * Options for the bootstrapOverlay convenience function.
 */
export interface OverlayBootstrapOptions {
  /** The WebGLRenderer to observe */
  renderer: WebGLRenderer;
  /** The Scene to observe */
  scene: Scene;
  /** Application name for identification */
  appName?: string;
  /** Additional probe configuration */
  probeConfig?: Partial<ProbeConfig>;
  /** Additional overlay configuration */
  overlay?: Partial<Omit<OverlayOptions, 'probe'>>;
  /** Optional THREE namespace reference for enhanced type detection */
  three?: ThreeNamespace;
}

/**
 * One-call bootstrap for npm/overlay mode.
 *
 * Creates a probe, wires it to the renderer + scene, and mounts the overlay UI
 * in a single function call. This is the easiest way to get started.
 *
 * @param options - Bootstrap configuration
 * @returns Object containing both the probe and overlay instances
 *
 * @example
 * ```typescript
 * import { bootstrapOverlay } from '@3lens/overlay';
 * import * as THREE from 'three';
 *
 * const renderer = new THREE.WebGLRenderer();
 * const scene = new THREE.Scene();
 *
 * const { probe, overlay } = bootstrapOverlay({
 *   renderer,
 *   scene,
 *   appName: 'My Three.js App',
 *   three: THREE, // Optional: enables enhanced type detection
 * });
 *
 * // Later: toggle overlay visibility
 * overlay.toggle();
 * ```
 *
 * @category Overlay
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
