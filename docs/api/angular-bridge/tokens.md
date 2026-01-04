# Injection Tokens

The Angular bridge provides injection tokens for dependency injection of the probe instance and configuration.

## THREELENS_PROBE

Injection token for accessing the `DevtoolProbe` instance directly.

### Import

```typescript
import { THREELENS_PROBE } from '@3lens/angular-bridge';
```

### Usage

```typescript
import { Component, Inject } from '@angular/core';
import { THREELENS_PROBE, DevtoolProbe } from '@3lens/angular-bridge';

@Component({
  selector: 'app-debug-panel',
  template: `<button (click)="takeSnapshot()">Snapshot</button>`
})
export class DebugPanelComponent {
  constructor(@Inject(THREELENS_PROBE) private probe: DevtoolProbe) {}

  takeSnapshot() {
    const snapshot = this.probe.takeSnapshot();
    console.log('Scene objects:', snapshot?.root.children.length);
  }
}
```

### Type

```typescript
const THREELENS_PROBE: InjectionToken<DevtoolProbe>;
```

### When to Use

Use `THREELENS_PROBE` when you need:
- Direct access to the probe API without going through `ThreeLensService`
- Low-level probe operations
- Custom integrations that bypass the service layer

For most use cases, prefer using `ThreeLensService` which provides a more Angular-friendly API with RxJS observables.

---

## THREELENS_CONFIG

Injection token for the 3Lens configuration.

### Import

```typescript
import { THREELENS_CONFIG, ThreeLensModuleConfig } from '@3lens/angular-bridge';
```

### Usage

#### Providing Configuration

```typescript
import { NgModule } from '@angular/core';
import { THREELENS_CONFIG, ThreeLensModuleConfig } from '@3lens/angular-bridge';

const config: ThreeLensModuleConfig = {
  appName: 'My Angular App',
  showOverlay: true,
  toggleShortcut: 'ctrl+shift+d',
  debug: false,
};

@NgModule({
  providers: [
    { provide: THREELENS_CONFIG, useValue: config }
  ]
})
export class AppModule {}
```

#### Reading Configuration

```typescript
import { Component, Inject, Optional } from '@angular/core';
import { THREELENS_CONFIG, ThreeLensModuleConfig } from '@3lens/angular-bridge';

@Component({
  selector: 'app-config-display',
  template: `<pre>{{ config | json }}</pre>`
})
export class ConfigDisplayComponent {
  constructor(
    @Optional() @Inject(THREELENS_CONFIG) public config: ThreeLensModuleConfig
  ) {}
}
```

### ThreeLensModuleConfig

```typescript
interface ThreeLensModuleConfig extends Partial<ProbeConfig> {
  /**
   * Whether to show the overlay UI
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Keyboard shortcut to toggle the overlay (e.g., 'ctrl+shift+d')
   * @default 'ctrl+shift+d'
   */
  toggleShortcut?: string;

  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Whether to automatically create the overlay
   * @default true
   */
  autoCreateOverlay?: boolean;
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appName` | `string` | `'Angular Three.js App'` | Application name in devtools |
| `showOverlay` | `boolean` | `true` | Show overlay on initialization |
| `toggleShortcut` | `string` | `'ctrl+shift+d'` | Keyboard shortcut for toggle |
| `debug` | `boolean` | `false` | Enable debug logging |
| `autoCreateOverlay` | `boolean` | `true` | Auto-create overlay UI |
| `thresholds` | `object` | — | Performance thresholds |
| `sampling` | `object` | — | Sampling configuration |

### Default Configuration

```typescript
import { DEFAULT_THREELENS_CONFIG } from '@3lens/angular-bridge';

// DEFAULT_THREELENS_CONFIG = {
//   appName: 'Angular Three.js App',
//   showOverlay: true,
//   toggleShortcut: 'ctrl+shift+d',
//   debug: false,
//   autoCreateOverlay: true,
// }
```

---

## Examples

### Environment-Based Configuration

```typescript
import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';
import { THREELENS_CONFIG, ThreeLensModule } from '@3lens/angular-bridge';

@NgModule({
  imports: [
    ThreeLensModule.forRoot({
      appName: 'My App',
      debug: !environment.production,
      showOverlay: !environment.production,
    })
  ]
})
export class AppModule {}
```

### Factory Provider

```typescript
import { NgModule, isDevMode } from '@angular/core';
import { THREELENS_CONFIG, ThreeLensModuleConfig } from '@3lens/angular-bridge';

export function threeLensConfigFactory(): ThreeLensModuleConfig {
  return {
    appName: 'My App',
    debug: isDevMode(),
    showOverlay: isDevMode(),
    thresholds: {
      maxFPS: 60,
      maxDrawCalls: 500,
    },
  };
}

@NgModule({
  providers: [
    { provide: THREELENS_CONFIG, useFactory: threeLensConfigFactory }
  ]
})
export class AppModule {}
```

### Using Both Tokens

```typescript
import { Component, Inject, Optional } from '@angular/core';
import {
  THREELENS_PROBE,
  THREELENS_CONFIG,
  DevtoolProbe,
  ThreeLensModuleConfig,
} from '@3lens/angular-bridge';

@Component({
  selector: 'app-devtools',
  template: `
    <div *ngIf="config?.debug">
      <button (click)="logSnapshot()">Log Snapshot</button>
    </div>
  `
})
export class DevtoolsComponent {
  constructor(
    @Inject(THREELENS_PROBE) private probe: DevtoolProbe,
    @Optional() @Inject(THREELENS_CONFIG) public config: ThreeLensModuleConfig
  ) {}

  logSnapshot() {
    console.log(this.probe.takeSnapshot());
  }
}
```

## Related

- [ThreeLensService](./three-lens-service.md) - Recommended service API
- [ThreeLensModule](./module.md) - Module setup
- [ProbeConfig](/api/core/probe-config) - Core configuration options
