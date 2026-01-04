# ThreeLensModule

The `ThreeLensModule` is the Angular module for 3Lens integration. It provides the standard Angular module pattern with `forRoot()` and `forChild()` static methods.

## Import

```typescript
import { ThreeLensModule } from '@3lens/angular-bridge';
```

## NgModule Setup

### Root Module

Use `forRoot()` in your root `AppModule` to configure 3Lens:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ThreeLensModule } from '@3lens/angular-bridge';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ThreeLensModule.forRoot({
      appName: 'My Angular App',
      showOverlay: true,
      toggleShortcut: 'ctrl+shift+d',
      debug: false
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Feature Modules

Use `forChild()` in feature modules to access 3Lens without re-providing:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeLensModule } from '@3lens/angular-bridge';
import { SceneComponent } from './scene.component';

@NgModule({
  declarations: [SceneComponent],
  imports: [
    CommonModule,
    ThreeLensModule.forChild()
  ],
  exports: [SceneComponent]
})
export class SceneModule {}
```

Or simply import the module without `forChild()`:

```typescript
@NgModule({
  imports: [ThreeLensModule]
})
export class FeatureModule {}
```

## Static Methods

### forRoot

Configure 3Lens for the root module.

```typescript
static forRoot(config?: ThreeLensModuleConfig): ModuleWithProviders<ThreeLensModule>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `ThreeLensModuleConfig` | Optional configuration |

**Returns:** `ModuleWithProviders<ThreeLensModule>`

**Provides:**
- `ThreeLensService` - The main service
- `THREELENS_CONFIG` - The configuration token

### forChild

Import 3Lens in a feature module without providers.

```typescript
static forChild(): ModuleWithProviders<ThreeLensModule>
```

**Returns:** `ModuleWithProviders<ThreeLensModule>` with empty providers array

## Configuration Options

```typescript
interface ThreeLensModuleConfig extends Partial<ProbeConfig> {
  appName?: string;          // Default: 'Angular Three.js App'
  showOverlay?: boolean;     // Default: true
  toggleShortcut?: string;   // Default: 'ctrl+shift+d'
  debug?: boolean;           // Default: false
  autoCreateOverlay?: boolean; // Default: true
  
  // Inherited from ProbeConfig
  thresholds?: PerformanceThresholds;
  sampling?: SamplingConfig;
  // ...
}
```

## Module Exports

The module exports:
- `ThreeLensEntityDirective` - For entity registration

---

# provideThreeLens

For standalone component applications, use the `provideThreeLens` function instead of the module.

## Import

```typescript
import { provideThreeLens } from '@3lens/angular-bridge';
```

## Usage

### Application Bootstrap

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideThreeLens } from '@3lens/angular-bridge';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideThreeLens({
      appName: 'My Standalone App',
      showOverlay: true,
      debug: false
    })
  ]
});
```

### Route Providers

```typescript
import { Routes } from '@angular/router';
import { provideThreeLens } from '@3lens/angular-bridge';

export const routes: Routes = [
  {
    path: 'scene',
    loadComponent: () => import('./scene/scene.component'),
    providers: [
      provideThreeLens({ appName: 'Scene Viewer' })
    ]
  }
];
```

## Signature

```typescript
function provideThreeLens(config?: ThreeLensModuleConfig): Provider[]
```

**Returns:** Array of providers including:
- `ThreeLensService`
- `THREELENS_CONFIG` value provider

## Examples

### Environment-Based Configuration

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideThreeLens } from '@3lens/angular-bridge';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideThreeLens({
      appName: environment.appName,
      debug: !environment.production,
      showOverlay: !environment.production
    })
  ]
});
```

### With Other Providers

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideThreeLens } from '@3lens/angular-bridge';
import { routes } from './app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideThreeLens({ appName: 'My App' })
  ]
});
```

### Standalone Component

```typescript
import { Component } from '@angular/core';
import { ThreeLensEntityDirective, ThreeLensService } from '@3lens/angular-bridge';

@Component({
  selector: 'app-scene',
  standalone: true,
  imports: [ThreeLensEntityDirective],
  template: `
    <canvas #canvas></canvas>
    <div
      threeLensEntity
      [threeLensObject]="mainMesh"
      [threeLensName]="'MainMesh'"
    ></div>
  `
})
export class SceneComponent {
  mainMesh!: THREE.Mesh;

  constructor(private threeLens: ThreeLensService) {}
}
```

## Migration from NgModule

If migrating from NgModule to standalone:

**Before (NgModule):**

```typescript
@NgModule({
  imports: [ThreeLensModule.forRoot({ appName: 'App' })]
})
export class AppModule {}
```

**After (Standalone):**

```typescript
bootstrapApplication(AppComponent, {
  providers: [provideThreeLens({ appName: 'App' })]
});
```

## Related

- [ThreeLensService](./three-lens-service.md) - Main service
- [ThreeLensEntityDirective](./entity-directive.md) - Entity registration
- [Tokens](./tokens.md) - Injection tokens
