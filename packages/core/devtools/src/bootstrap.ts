/**
 * Bootstrap 3Lens
 *
 * Simple one-line initialization for 3Lens.
 *
 * @packageDocumentation
 */

import { createLens, type Lens, type LensConfig } from '@3lens/runtime';
import { createInvestigationUI } from '@3lens/ui-core';

/**
 * Bootstrap options
 */
export interface BootstrapOptions {
  /** Enable 3Lens (default: auto-detect dev environment) */
  enabled?: boolean;
  /** UI mode */
  ui?: 'overlay' | 'dock' | 'window';
  /** Host-owned container for dock mode */
  target?: HTMLElement;
  /** Optional application-owned viewport element to place inside the workspace. */
  viewport?: HTMLElement;
  /** Start with the full workspace or a compact floating inspector. */
  layout?: 'workspace' | 'overlay' | 'dock';
  /** Disable live scene mutations while retaining captured-data navigation. */
  readonly?: boolean;
  /** Auto-discover contexts */
  autoDiscover?: boolean;
  /** Persist enabled state to localStorage */
  persist?: boolean;
  /** Context naming strategy */
  contextNameStrategy?: 'canvasId' | 'containerSelector' | 'manual';
  /** Log level */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** CSP options */
  csp?: {
    styleNonce?: string;
    cssUrl?: string;
    safeMode?: boolean;
  };
}

// Singleton instance
let instance: Lens | null = null;

/**
 * Bootstrap 3Lens with sensible defaults
 *
 * @example
 * ```typescript
 * // Simple usage
 * import { bootstrap3Lens } from '@3lens/devtools/bootstrap';
 * bootstrap3Lens();
 *
 * // With options
 * bootstrap3Lens({
 *   ui: 'overlay',
 *   autoDiscover: true,
 * });
 * ```
 */
export function bootstrap3Lens(options: BootstrapOptions = {}): Lens {
  // Return existing instance (idempotent)
  if (instance) {
    return instance;
  }

  // Check enabled state
  const enabled = resolveEnabled(options);
  if (!enabled) {
    // Return no-op lens
    instance = createLens({ enabled: false });
    return instance;
  }

  // Create lens config
  const config: LensConfig = {
    enabled: true,
    ui: options.ui ?? 'overlay',
    autoDiscover: options.autoDiscover ?? true,
    discoveryMode: (options.autoDiscover ?? true) ? 'observe' : 'off',
    persist: options.persist ?? true,
    contextNameStrategy: options.contextNameStrategy ?? 'canvasId',
    logLevel: options.logLevel ?? 'warn',
    csp: options.csp,
    uiAdapter: createInvestigationUI({
      surface: options.ui ?? 'overlay',
      target: options.target,
      viewport: options.viewport,
      layout: options.layout,
      readonly: options.readonly,
      csp: options.csp,
    }),
  };

  // Create lens
  instance = createLens(config);
  const created = instance;
  const dispose = created.dispose.bind(created);
  created.dispose = () => {
    dispose();
    if (instance === created) instance = null;
  };

  // Auto-attach
  instance.attach();

  // Show UI
  if (config.ui) {
    instance.showUI();
  }

  // Log
  if (config.logLevel === 'debug' || config.logLevel === 'info') {
    console.log('[3Lens] Bootstrapped', { config });
  }

  return instance;
}

/**
 * Get the current 3Lens instance
 */
export function get3Lens(): Lens | null {
  return instance;
}

/**
 * Resolve whether 3Lens should be enabled
 */
function resolveEnabled(options: BootstrapOptions): boolean {
  // Explicit option takes precedence
  if (typeof options.enabled === 'boolean') {
    return options.enabled;
  }

  // Check URL parameter
  if (typeof location !== 'undefined') {
    const params = new URLSearchParams(location.search);
    if (params.has('3lens')) {
      const value = params.get('3lens');
      if (value === '0' || value === 'false') {
        return false;
      }
      if (value === 'persist') {
        // Save to localStorage
        try {
          localStorage.setItem('3lens', '1');
        } catch {
          // Ignore
        }
      }
      return true;
    }
  }

  // Check localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      if (localStorage.getItem('3lens') === '1') {
        return true;
      }
    } catch {
      // Ignore
    }
  }

  // Check dev environment
  return isDevEnvironment();
}

/**
 * Check if running in a dev environment
 */
function isDevEnvironment(): boolean {
  // Check Vite
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV === true) {
    return true;
  }

  // Check hostname
  if (typeof location !== 'undefined') {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  }

  return false;
}
