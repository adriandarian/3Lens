// Tokens
export {
  THREELENS_PROBE,
  THREELENS_CONFIG,
  type ThreeLensModuleConfig,
  DEFAULT_THREELENS_CONFIG,
} from './tokens';

// Service
export { ThreeLensService, type EntityOptions } from './threelens.service';

// Directive
export {
  ThreeLensEntityDirective,
  createEntityOptions,
} from './threelens-entity.directive';

// Module
export { ThreeLensModule, provideThreeLens } from './threelens.module';

// Nx Helpers
export {
  NxLibraryHelper,
  createNxLibraryHelper,
  NxThreeLensLibrary,
  type NxLibraryOptions,
} from './nx-helpers';

// Re-export commonly used types from core
export type {
  DevtoolProbe,
  FrameStats,
  SceneSnapshot,
  SceneNode,
  ProbeConfig,
} from '@3lens/core';

