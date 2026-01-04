import { NgModule, type ModuleWithProviders } from '@angular/core';
import { ThreeLensService } from './threelens.service';
import { ThreeLensEntityDirective } from './threelens-entity.directive';
import {
  THREELENS_CONFIG,
  type ThreeLensModuleConfig,
  DEFAULT_THREELENS_CONFIG,
} from './tokens';

/**
 * Angular module for 3Lens integration
 *
 * @example
 * Basic usage:
 * ```typescript
 * @NgModule({
 *   imports: [ThreeLensModule.forRoot({ appName: 'My App' })]
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * Feature module usage:
 * ```typescript
 * @NgModule({
 *   imports: [ThreeLensModule]
 * })
 * export class FeatureModule {}
 * ```
 */
@NgModule({
  imports: [ThreeLensEntityDirective],
  exports: [ThreeLensEntityDirective],
})
export class ThreeLensModule {
  /**
   * Configure 3Lens for the root module
   *
   * @param config Configuration options
   * @returns Module with providers
   *
   * @example
   * ```typescript
   * @NgModule({
   *   imports: [
   *     ThreeLensModule.forRoot({
   *       appName: 'My Three.js App',
   *       debug: true,
   *       showOverlay: true,
   *       toggleShortcut: 'ctrl+shift+d'
   *     })
   *   ]
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot(config?: ThreeLensModuleConfig): ModuleWithProviders<ThreeLensModule> {
    return {
      ngModule: ThreeLensModule,
      providers: [
        ThreeLensService,
        {
          provide: THREELENS_CONFIG,
          useValue: { ...DEFAULT_THREELENS_CONFIG, ...config },
        },
      ],
    };
  }

  /**
   * Import 3Lens in a feature module (uses existing service instance)
   *
   * @returns Module without providers
   *
   * @example
   * ```typescript
   * @NgModule({
   *   imports: [ThreeLensModule.forChild()]
   * })
   * export class FeatureModule {}
   * ```
   */
  static forChild(): ModuleWithProviders<ThreeLensModule> {
    return {
      ngModule: ThreeLensModule,
      providers: [],
    };
  }
}

/**
 * Standalone providers for use with standalone components
 *
 * @example
 * ```typescript
 * import { provideThreeLens } from '@3lens/angular-bridge';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideThreeLens({ appName: 'My App' })
 *   ]
 * });
 * ```
 */
export function provideThreeLens(config?: ThreeLensModuleConfig) {
  return [
    ThreeLensService,
    {
      provide: THREELENS_CONFIG,
      useValue: { ...DEFAULT_THREELENS_CONFIG, ...config },
    },
  ];
}

