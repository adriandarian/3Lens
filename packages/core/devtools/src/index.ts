/**
 * @3lens/devtools
 *
 * Batteries-included package for most users.
 * This is the recommended entry point for using 3Lens.
 *
 * @packageDocumentation
 */

// Re-export runtime
export * from '@3lens/runtime';

// Re-export host
export { manualHost, type ManualHostConfig } from '@3lens/host-manual';

// Re-export UI
export { uiOverlay, uiDock, type UIOverlayConfig, type UIDockConfig } from '@3lens/ui-core';

// Bootstrap
export { bootstrap3Lens, type BootstrapOptions } from './bootstrap';

// Convenience re-exports
export { KERNEL_VERSION } from '@3lens/kernel';
