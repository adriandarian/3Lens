# @3lens/angular-bridge

Angular integration for 3Lens - the three.js devtool.

## Installation

```bash
npm install @3lens/angular-bridge @3lens/core @3lens/overlay
# or
pnpm add @3lens/angular-bridge @3lens/core @3lens/overlay
# or
yarn add @3lens/angular-bridge @3lens/core @3lens/overlay
# or
bun add @3lens/angular-bridge @3lens/core @3lens/overlay
```

## Quick Start

### Module-based Setup

```typescript
import { NgModule } from '@angular/core';
import { ThreeLensModule } from '@3lens/angular-bridge';

@NgModule({
  imports: [
    ThreeLensModule.forRoot({
      appName: 'My Angular Three.js App',
      debug: false,
      showOverlay: true,
    }),
  ],
})
export class AppModule {}
```

### Standalone Components Setup

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideThreeLens } from '@3lens/angular-bridge';

bootstrapApplication(AppComponent, {
  providers: [
    provideThreeLens({ appName: 'My App' }),
  ],
});
```

### Using the Service

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';
import * as THREE from 'three';

@Component({
  selector: 'app-scene',
  template: `
    <div class="stats">
      <div>FPS: {{ fps$ | async | number:'1.0-0' }}</div>
      <div>Draw Calls: {{ drawCalls$ | async }}</div>
      <div>Triangles: {{ triangles$ | async | number }}</div>
    </div>
    <canvas #canvas></canvas>
  `,
})
export class SceneComponent implements OnInit, OnDestroy {
  fps$ = this.threeLens.fps$;
  drawCalls$ = this.threeLens.drawCalls$;
  triangles$ = this.threeLens.triangles$;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;

  constructor(private threeLens: ThreeLensService) {}

  ngOnInit(): void {
    // Set up Three.js
    this.renderer = new THREE.WebGLRenderer();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

    // Connect 3Lens
    this.threeLens.observeRenderer(this.renderer);
    this.threeLens.observeScene(this.scene);

    // Optional: Initialize helpers
    this.threeLens.initializeTransformGizmo(
      this.scene,
      this.camera,
      this.renderer.domElement,
      THREE
    );
  }

  ngOnDestroy(): void {
    this.renderer.dispose();
  }
}
```

## Service API

### Observables

```typescript
// Frame stats (updates every frame)
frameStats$: Observable<FrameStats | null>

// Convenience observables
fps$: Observable<number>
drawCalls$: Observable<number>
triangles$: Observable<number>
frameTime$: Observable<number>
gpuMemory$: Observable<number>

// Scene state
snapshot$: Observable<SceneSnapshot | null>
selectedNode$: Observable<SceneNode | null>
isReady$: Observable<boolean>
isOverlayVisible$: Observable<boolean>
```

### Methods

```typescript
// Scene observation
observeRenderer(renderer: THREE.WebGLRenderer): void
observeScene(scene: THREE.Scene): void

// Snapshots
takeSnapshot(): SceneSnapshot | null

// Selection
selectObject(uuid: string): void
clearSelection(): void
focusOnSelected(): void
flyToSelected(): void

// Entity registration
registerEntity(object: THREE.Object3D, options?: EntityOptions): void
unregisterEntity(object: THREE.Object3D): void

// Overlay control
showOverlay(): void
hideOverlay(): void
toggleOverlay(): void
```

## Entity Registration

Register Three.js objects with meaningful names and metadata:

```typescript
@Component({...})
export class PlayerComponent implements AfterViewInit {
  private playerMesh!: THREE.Mesh;

  constructor(private threeLens: ThreeLensService) {}

  ngAfterViewInit(): void {
    this.playerMesh = this.createPlayerMesh();

    this.threeLens.registerEntity(this.playerMesh, {
      name: 'Player',
      module: 'game/entities',
      metadata: {
        health: 100,
        level: 5,
        class: 'Warrior',
      },
      tags: ['player', 'controllable', 'saveable'],
    });
  }

  ngOnDestroy(): void {
    this.threeLens.unregisterEntity(this.playerMesh);
  }
}
```

## Directive Usage

For declarative entity registration:

```typescript
import { ThreeLensEntityDirective } from '@3lens/angular-bridge';

@Component({
  selector: 'app-enemy',
  standalone: true,
  imports: [ThreeLensEntityDirective],
  template: `<ng-content></ng-content>`,
})
export class EnemyComponent implements AfterViewInit {
  @Input() enemyData: any;

  mesh!: THREE.Mesh;

  // Use programmatically with the directive's inputs
  entityName = 'Enemy';
  entityModule = 'game/enemies';
  entityMetadata = { type: 'goblin' };
}
```

## Nx Workspace Integration

For Nx monorepos, use the `NxLibraryHelper` to maintain consistent naming:

```typescript
import { Injectable } from '@angular/core';
import { ThreeLensService, NxLibraryHelper } from '@3lens/angular-bridge';

@Injectable({ providedIn: 'root' })
export class TerrainService {
  private nxHelper: NxLibraryHelper;

  constructor(private threeLens: ThreeLensService) {
    this.nxHelper = new NxLibraryHelper(threeLens, {
      name: 'feature-terrain',
      scope: 'world',
      type: 'feature',
    });
  }

  createTerrain(): THREE.Mesh {
    const terrain = new THREE.Mesh(/* ... */);

    // Registers as @world/feature-terrain/MainTerrain
    this.nxHelper.registerEntity(terrain, 'MainTerrain', {
      metadata: { size: 1000, resolution: 256 },
    });

    return terrain;
  }
}
```

### Scoped Registration

For components with multiple parts:

```typescript
const registerPart = this.nxHelper.createScopedRegistrar('Vehicle');

// Registers as @game/feature-vehicles/Vehicle/Body
registerPart(bodyMesh, 'Body');

// Registers as @game/feature-vehicles/Vehicle/Wheel_FL
registerPart(wheelFLMesh, 'Wheel_FL');
```

## Injection Tokens

For advanced use cases, inject the probe directly:

```typescript
import { Inject } from '@angular/core';
import { THREELENS_PROBE, DevtoolProbe } from '@3lens/angular-bridge';

@Component({...})
export class AdvancedComponent {
  constructor(@Inject(THREELENS_PROBE) private probe: DevtoolProbe) {
    // Direct probe access
    const stats = probe.getLatestFrameStats();
  }
}
```

## TypeScript

All exports are fully typed:

```typescript
import type {
  ThreeLensModuleConfig,
  EntityOptions,
  NxLibraryOptions,
  FrameStats,
  SceneSnapshot,
  SceneNode,
} from '@3lens/angular-bridge';
```

## License

MIT

