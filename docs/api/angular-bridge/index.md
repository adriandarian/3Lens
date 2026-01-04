# Angular Bridge (`@3lens/angular-bridge`)

The Angular bridge provides full integration between 3Lens devtools and Angular applications, with RxJS-based reactive state management and support for Nx workspaces.

## Installation

```bash
npm install @3lens/angular-bridge @3lens/core
# or
pnpm add @3lens/angular-bridge @3lens/core
```

## Quick Start

### NgModule Setup

```typescript
import { NgModule } from '@angular/core';
import { ThreeLensModule } from '@3lens/angular-bridge';

@NgModule({
  imports: [
    ThreeLensModule.forRoot({
      appName: 'My Angular App',
      showOverlay: true,
    })
  ]
})
export class AppModule {}
```

### Standalone Setup

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideThreeLens } from '@3lens/angular-bridge';

bootstrapApplication(AppComponent, {
  providers: [
    provideThreeLens({ appName: 'My App' })
  ]
});
```

## API Reference

### Tokens

| Export | Description |
|--------|-------------|
| [THREELENS_PROBE](./tokens.md#threelens_probe) | Injection token for the probe instance |
| [THREELENS_CONFIG](./tokens.md#threelens_config) | Injection token for configuration |

### Service

| Export | Description |
|--------|-------------|
| [ThreeLensService](./three-lens-service.md) | Main service with RxJS observables |

### Directives

| Export | Description |
|--------|-------------|
| [ThreeLensEntityDirective](./entity-directive.md) | Directive for entity registration |

### Module

| Export | Description |
|--------|-------------|
| [ThreeLensModule](./module.md) | Angular module with `forRoot`/`forChild` |
| [provideThreeLens](./module.md#providethreelens) | Standalone providers function |

### Nx Helpers

| Export | Description |
|--------|-------------|
| [NxLibraryHelper](./nx-helpers.md) | Helper for Nx workspace integration |
| [createNxLibraryHelper](./nx-helpers.md#createnlxlibraryhelper) | Factory function |
| [NxThreeLensLibrary](./nx-helpers.md#nxthreelenslibrary) | Decorator for Nx libraries |

### Types

| Type | Description |
|------|-------------|
| `ThreeLensModuleConfig` | Module configuration interface |
| `EntityOptions` | Entity registration options |
| `NxLibraryOptions` | Nx library options |

## Usage Patterns

### Basic Scene Setup

```typescript
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';
import * as THREE from 'three';

@Component({
  selector: 'app-scene',
  template: `<canvas #canvas></canvas>`
})
export class SceneComponent implements OnInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  constructor(private threeLens: ThreeLensService) {}

  ngOnInit() {
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvasRef.nativeElement 
    });
    this.scene = new THREE.Scene();

    // Connect to 3Lens
    this.threeLens.observeRenderer(this.renderer);
    this.threeLens.observeScene(this.scene);
  }
}
```

### Reactive Stats Display

```typescript
import { Component } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="stats">
      <span>FPS: {{ fps$ | async | number:'1.0-0' }}</span>
      <span>Draw Calls: {{ drawCalls$ | async }}</span>
      <span>Triangles: {{ triangles$ | async | number }}</span>
    </div>
  `
})
export class StatsComponent {
  fps$ = this.threeLens.fps$;
  drawCalls$ = this.threeLens.drawCalls$;
  triangles$ = this.threeLens.triangles$;

  constructor(private threeLens: ThreeLensService) {}
}
```

### Entity Registration

```typescript
import { Component, AfterViewInit } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';

@Component({
  selector: 'app-player',
  template: `<ng-content></ng-content>`
})
export class PlayerComponent implements AfterViewInit {
  private playerMesh!: THREE.Mesh;

  constructor(private threeLens: ThreeLensService) {}

  ngAfterViewInit() {
    this.threeLens.registerEntity(this.playerMesh, {
      name: 'Player',
      module: 'game/entities',
      metadata: { health: 100 },
      tags: ['player', 'controllable']
    });
  }

  ngOnDestroy() {
    this.threeLens.unregisterEntity(this.playerMesh);
  }
}
```

## Related Documentation

- [Getting Started Guide](/guide/getting-started)
- [Angular Guide](/guides/ANGULAR-GUIDE)
- [Core Package Documentation](/api/core/)
- [Overlay Package Documentation](/api/overlay/)
