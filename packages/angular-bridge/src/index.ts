/**
 * @packageDocumentation
 * @module @3lens/angular-bridge
 *
 * # @3lens/angular-bridge
 *
 * Angular integration for 3Lens devtools.
 *
 * This package provides Angular services, directives, and dependency injection
 * tokens for integrating 3Lens with Angular applications.
 *
 * ## Features
 *
 * - **ThreeLensService**: Injectable service with RxJS observables for reactive data
 * - **ThreeLensEntityDirective**: Declarative entity registration via directives
 * - **Injection Tokens**: `THREELENS_PROBE` and `THREELENS_CONFIG` for DI
 * - **Nx Support**: Helpers for Nx monorepo library organization
 *
 * ## Quick Start
 *
 * ```typescript
 * // app.module.ts
 * import { ThreeLensModule, provideThreeLens } from '@3lens/angular-bridge';
 *
 * @NgModule({
 *   imports: [ThreeLensModule],
 *   providers: [
 *     provideThreeLens({ appName: 'My Angular App' })
 *   ]
 * })
 * export class AppModule {}
 *
 * // scene.component.ts
 * @Component({
 *   selector: 'app-scene',
 *   template: `
 *     <div>FPS: {{ fps$ | async }}</div>
 *     <div>Draw Calls: {{ drawCalls$ | async }}</div>
 *   `
 * })
 * export class SceneComponent implements OnInit {
 *   fps$ = this.threeLens.fps$;
 *   drawCalls$ = this.threeLens.drawCalls$;
 *
 *   constructor(private threeLens: ThreeLensService) {}
 *
 *   ngOnInit() {
 *     this.threeLens.observeRenderer(this.renderer);
 *     this.threeLens.observeScene(this.scene);
 *   }
 * }
 * ```
 *
 * @see {@link ThreeLensService} - Main injectable service
 * @see {@link ThreeLensModule} - Angular module for imports
 * @see {@link THREELENS_PROBE} - DI token for probe access
 */

// ═══════════════════════════════════════════════════════════════════════════
// TOKENS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Dependency injection tokens for 3Lens.
 * @category Angular
 */
export {
  THREELENS_PROBE,
  THREELENS_CONFIG,
  type ThreeLensModuleConfig,
  DEFAULT_THREELENS_CONFIG,
} from './tokens';

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main Angular service for 3Lens integration.
 * Provides RxJS observables for reactive data access.
 * @category Angular
 */
export { ThreeLensService, type EntityOptions } from './threelens.service';

// ═══════════════════════════════════════════════════════════════════════════
// DIRECTIVE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Directive for declarative entity registration.
 * @category Angular
 */
export {
  ThreeLensEntityDirective,
  createEntityOptions,
} from './threelens-entity.directive';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Angular module for 3Lens integration.
 * @category Angular
 */
export { ThreeLensModule, provideThreeLens } from './threelens.module';

// ═══════════════════════════════════════════════════════════════════════════
// NX HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Nx monorepo helpers for library organization.
 * @category Angular
 */
export {
  NxLibraryHelper,
  createNxLibraryHelper,
  NxThreeLensLibrary,
  type NxLibraryOptions,
} from './nx-helpers';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Re-exported types from core for convenience.
 * @category Types
 */
export type {
  DevtoolProbe,
  FrameStats,
  SceneSnapshot,
  SceneNode,
  ProbeConfig,
} from '@3lens/core';

