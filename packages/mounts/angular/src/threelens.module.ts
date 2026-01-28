/**
 * ThreeLens Angular Module
 *
 * @packageDocumentation
 */

import { NgModule, ModuleWithProviders } from '@angular/core';
import { ThreeLensService } from './threelens.service';
import { ThreeLensComponent } from './threelens.component';
import { THREELENS_CONFIG, type ThreeLensConfig } from './tokens';

/**
 * Angular module for 3Lens
 *
 * @example
 * ```typescript
 * @NgModule({
 *   imports: [
 *     ThreeLensModule.forRoot({
 *       ui: 'overlay',
 *       runOutsideZone: true,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({
  declarations: [ThreeLensComponent],
  exports: [ThreeLensComponent],
  providers: [ThreeLensService],
})
export class ThreeLensModule {
  /**
   * Configure the module with options
   */
  static forRoot(config: ThreeLensConfig = {}): ModuleWithProviders<ThreeLensModule> {
    return {
      ngModule: ThreeLensModule,
      providers: [
        ThreeLensService,
        {
          provide: THREELENS_CONFIG,
          useValue: config,
        },
      ],
    };
  }

  /**
   * Import in feature modules (uses root config)
   */
  static forChild(): ModuleWithProviders<ThreeLensModule> {
    return {
      ngModule: ThreeLensModule,
      providers: [],
    };
  }
}
