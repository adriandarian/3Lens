/**
 * @3lens/vite-plugin
 *
 * Vite plugin for automatic 3Lens injection and configuration.
 *
 * @packageDocumentation
 */

import type { Plugin, ResolvedConfig, HmrContext } from 'vite';

/**
 * UI mode for 3Lens overlay
 */
export type UIMode = 'overlay' | 'dock' | 'window' | 'none';

/**
 * Capture mode for 3Lens
 */
export type CaptureMode = 'MINIMAL' | 'STANDARD' | 'DEEP';

/**
 * Configuration options for the 3Lens Vite plugin
 */
export interface ThreeLensPluginOptions {
  /**
   * Enable/disable 3Lens injection
   * @default true in dev mode, false in production
   */
  enabled?: boolean;

  /**
   * UI mode for the 3Lens overlay
   * @default 'overlay'
   */
  ui?: UIMode;

  /**
   * Initial capture mode
   * @default 'STANDARD'
   */
  captureMode?: CaptureMode;

  /**
   * Auto-attach to discovered three.js contexts
   * @default true
   */
  autoAttach?: boolean;

  /**
   * CSS selector for dock target (when ui='dock')
   */
  dockTarget?: string;

  /**
   * Enable lazy loading via virtual module
   * @default false
   */
  lazyLoad?: boolean;

  /**
   * Custom import path for 3Lens runtime
   * @default '@3lens/runtime'
   */
  runtimeImport?: string;

  /**
   * Log level for 3Lens
   * @default 'warn'
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent';

  /**
   * Include source maps for injected code
   * @default true
   */
  sourcemap?: boolean;

  /**
   * Custom initialization code to run after 3Lens is loaded
   */
  onInit?: string;

  /**
   * Environment variable overrides
   */
  env?: {
    THREELENS_ENABLED?: string;
    THREELENS_MODE?: string;
    THREELENS_UI?: string;
    THREELENS_LOG_LEVEL?: string;
  };
}

/**
 * Virtual module ID for lazy loading
 */
const VIRTUAL_MODULE_ID = 'virtual:3lens';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

/**
 * Default plugin options
 */
const DEFAULT_OPTIONS: Required<
  Omit<ThreeLensPluginOptions, 'dockTarget' | 'onInit' | 'env'>
> = {
  enabled: true,
  ui: 'overlay',
  captureMode: 'STANDARD',
  autoAttach: true,
  lazyLoad: false,
  runtimeImport: '@3lens/runtime',
  logLevel: 'warn',
  sourcemap: true,
};

/**
 * Generate the bootstrap code for 3Lens injection
 */
function generateBootstrapCode(options: ThreeLensPluginOptions): string {
  const config = {
    ui: options.ui ?? DEFAULT_OPTIONS.ui,
    captureMode: options.captureMode ?? DEFAULT_OPTIONS.captureMode,
    autoAttach: options.autoAttach ?? DEFAULT_OPTIONS.autoAttach,
    logLevel: options.logLevel ?? DEFAULT_OPTIONS.logLevel,
    dockTarget: options.dockTarget,
  };

  const runtimeImport = options.runtimeImport ?? DEFAULT_OPTIONS.runtimeImport;

  return `
// 3Lens Bootstrap (injected by @3lens/vite-plugin)
(async () => {
  try {
    const { createLens } = await import('${runtimeImport}');
    
    const config = ${JSON.stringify(config, null, 2)};
    
    // Check environment variable overrides
    const envEnabled = import.meta.env.THREELENS_ENABLED;
    if (envEnabled === 'false' || envEnabled === '0') {
      console.debug('[3Lens] Disabled via THREELENS_ENABLED');
      return;
    }
    
    const envMode = import.meta.env.THREELENS_MODE;
    if (envMode) {
      config.captureMode = envMode;
    }
    
    const envUI = import.meta.env.THREELENS_UI;
    if (envUI) {
      config.ui = envUI;
    }
    
    const envLogLevel = import.meta.env.THREELENS_LOG_LEVEL;
    if (envLogLevel) {
      config.logLevel = envLogLevel;
    }
    
    // Create the lens instance
    const lens = createLens({
      mode: config.captureMode,
      autoAttach: config.autoAttach,
    });
    
    // Store globally for debugging
    if (typeof window !== 'undefined') {
      (window as any).__3LENS__ = lens;
      (window as any).__3LENS_CONFIG__ = config;
    }
    
    console.debug('[3Lens] Initialized', config);
    ${options.onInit ? `\n    // Custom initialization\n    ${options.onInit}` : ''}
  } catch (error) {
    console.warn('[3Lens] Failed to initialize:', error);
  }
})();
`;
}

/**
 * Generate the virtual module code for lazy loading
 */
function generateVirtualModuleCode(options: ThreeLensPluginOptions): string {
  const runtimeImport = options.runtimeImport ?? DEFAULT_OPTIONS.runtimeImport;

  return `
// 3Lens Virtual Module (lazy loading)
import { createLens } from '${runtimeImport}';

let lensInstance = null;
let initPromise = null;

export const defaultConfig = {
  ui: '${options.ui ?? DEFAULT_OPTIONS.ui}',
  captureMode: '${options.captureMode ?? DEFAULT_OPTIONS.captureMode}',
  autoAttach: ${options.autoAttach ?? DEFAULT_OPTIONS.autoAttach},
  logLevel: '${options.logLevel ?? DEFAULT_OPTIONS.logLevel}',
  ${options.dockTarget ? `dockTarget: '${options.dockTarget}',` : ''}
};

/**
 * Initialize 3Lens lazily
 */
export async function initThreeLens(config = {}) {
  if (lensInstance) {
    return lensInstance;
  }
  
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = (async () => {
    const mergedConfig = { ...defaultConfig, ...config };
    
    lensInstance = createLens({
      mode: mergedConfig.captureMode,
      autoAttach: mergedConfig.autoAttach,
    });
    
    if (typeof window !== 'undefined') {
      window.__3LENS__ = lensInstance;
      window.__3LENS_CONFIG__ = mergedConfig;
    }
    
    console.debug('[3Lens] Initialized (lazy)', mergedConfig);
    return lensInstance;
  })();
  
  return initPromise;
}

/**
 * Get the current lens instance (if initialized)
 */
export function getLens() {
  return lensInstance;
}

/**
 * Dispose the lens instance
 */
export function disposeLens() {
  if (lensInstance && typeof lensInstance.dispose === 'function') {
    lensInstance.dispose();
  }
  lensInstance = null;
  initPromise = null;
}

// Re-export runtime types for convenience
export * from '${runtimeImport}';
`;
}

/**
 * Create the 3Lens Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import { threeLens } from '@3lens/vite-plugin';
 *
 * export default defineConfig({
 *   plugins: [
 *     threeLens({
 *       ui: 'overlay',
 *       captureMode: 'STANDARD',
 *     }),
 *   ],
 * });
 * ```
 */
export function threeLens(options: ThreeLensPluginOptions = {}): Plugin {
  let config: ResolvedConfig;
  let isDevMode = false;

  const resolvedOptions: ThreeLensPluginOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  return {
    name: 'vite-plugin-3lens',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
      isDevMode = config.command === 'serve';

      // Determine if enabled (default: only in dev mode)
      if (resolvedOptions.enabled === undefined) {
        resolvedOptions.enabled = isDevMode;
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
      return null;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return generateVirtualModuleCode(resolvedOptions);
      }
      return null;
    },

    transformIndexHtml(html) {
      // Only inject if enabled and not using lazy loading
      if (!resolvedOptions.enabled || resolvedOptions.lazyLoad) {
        return html;
      }

      const bootstrapCode = generateBootstrapCode(resolvedOptions);
      const scriptTag = `<script type="module">${bootstrapCode}</script>`;

      // Inject before closing </body> tag
      if (html.includes('</body>')) {
        return html.replace('</body>', `${scriptTag}\n</body>`);
      }

      // Fallback: append to end
      return html + scriptTag;
    },

    handleHotUpdate(ctx: HmrContext) {
      // Handle HMR for 3Lens-related modules
      if (!resolvedOptions.enabled) {
        return;
      }

      const isThreeLensModule = ctx.modules.some(
        (m) =>
          m.id?.includes('@3lens/') ||
          m.id?.includes('3lens') ||
          m.id === RESOLVED_VIRTUAL_MODULE_ID
      );

      if (isThreeLensModule) {
        // Let Vite handle full reload for 3Lens modules
        // This ensures clean state
        ctx.server.ws.send({
          type: 'full-reload',
          path: '*',
        });
        return [];
      }

      return;
    },

    configureServer(server) {
      if (!resolvedOptions.enabled) {
        return;
      }

      // Log 3Lens status on server start
      server.printUrls = ((originalPrintUrls) => {
        return () => {
          originalPrintUrls();
          const mode = resolvedOptions.captureMode ?? DEFAULT_OPTIONS.captureMode;
          const ui = resolvedOptions.ui ?? DEFAULT_OPTIONS.ui;
          console.log(
            `  \x1b[32m➜\x1b[0m  \x1b[1m3Lens:\x1b[0m mode=${mode}, ui=${ui}${
              resolvedOptions.lazyLoad ? ' (lazy)' : ''
            }`
          );
        };
      })(server.printUrls);
    },
  };
}

/**
 * Alias for threeLens
 */
export const lens = threeLens;

/**
 * Default export
 */
export default threeLens;

// Type declarations for virtual module
declare module 'virtual:3lens' {
  export const defaultConfig: {
    ui: UIMode;
    captureMode: CaptureMode;
    autoAttach: boolean;
    logLevel: string;
    dockTarget?: string;
  };
  export function initThreeLens(config?: Partial<typeof defaultConfig>): Promise<any>;
  export function getLens(): any;
  export function disposeLens(): void;
}
