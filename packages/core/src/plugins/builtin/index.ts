/**
 * Built-in plugins for 3Lens
 *
 * These plugins are included with the core package and can be activated
 * to provide additional debugging and analysis capabilities.
 */

// Re-export plugin classes and types for direct usage
export { LODCheckerPlugin } from './lod-checker';
export type { LODAnalysis, LODCheckerSettings } from './lod-checker';

export { ShadowDebuggerPlugin } from './shadow-debugger';
export type { ShadowLightAnalysis, ShadowIssue, ShadowStats, ShadowDebuggerSettings } from './shadow-debugger';

// Re-export for lazy loading convenience
import { LODCheckerPlugin as _LODCheckerPlugin } from './lod-checker';
import { ShadowDebuggerPlugin as _ShadowDebuggerPlugin } from './shadow-debugger';

/**
 * All built-in plugins - factory functions for lazy instantiation
 * Note: These use the statically imported plugins to avoid dynamic/static import mixing
 */
export const BUILTIN_PLUGINS = {
  lodChecker: () => Promise.resolve(_LODCheckerPlugin),
  shadowDebugger: () => Promise.resolve(_ShadowDebuggerPlugin),
};

/**
 * Get all built-in plugins (pre-imported)
 */
export function getBuiltinPlugins() {
  return Promise.resolve([_LODCheckerPlugin, _ShadowDebuggerPlugin]);
}

