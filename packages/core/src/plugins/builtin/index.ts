/**
 * Built-in plugins for 3Lens
 *
 * These plugins are included with the core package and can be activated
 * to provide additional debugging and analysis capabilities.
 */

export { LODCheckerPlugin } from './lod-checker';
export type { LODAnalysis, LODCheckerSettings } from './lod-checker';

export { ShadowDebuggerPlugin } from './shadow-debugger';
export type { ShadowLightAnalysis, ShadowIssue, ShadowStats, ShadowDebuggerSettings } from './shadow-debugger';

/**
 * All built-in plugins
 */
export const BUILTIN_PLUGINS = {
  lodChecker: () => import('./lod-checker').then((m) => m.LODCheckerPlugin),
  shadowDebugger: () => import('./shadow-debugger').then((m) => m.ShadowDebuggerPlugin),
};

/**
 * Get all built-in plugins (pre-imported)
 */
export function getBuiltinPlugins() {
  return Promise.all([
    import('./lod-checker').then((m) => m.LODCheckerPlugin),
    import('./shadow-debugger').then((m) => m.ShadowDebuggerPlugin),
  ]);
}

