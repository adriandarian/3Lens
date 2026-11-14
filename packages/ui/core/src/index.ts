/**
 * @3lens/ui-core
 *
 * Framework-agnostic UI shell for 3Lens.
 * This package contains the core UI components that work without any framework.
 *
 * @packageDocumentation
 */

export * from './types';
export * from './overlay';
export * from './dock';
export * from './material-builder';

export * from './investigation';
export { createLensHud, mountLensHud, type LensHud, type HudOptions, type HudInsets } from './hud/hud';
export {
  createLensController,
  type LensController,
  type LensControllerOptions,
  type LensControllerState,
} from './controller';
