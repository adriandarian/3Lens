# ThreeLensService

The `ThreeLensService` is the main Angular service for 3Lens integration. It provides reactive access to frame statistics, scene snapshots, and selection state via RxJS observables.

## Import

```typescript
import { ThreeLensService } from '@3lens/angular-bridge';
```

## Usage

```typescript
import { Component, OnInit } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';
import * as THREE from 'three';

@Component({
  selector: 'app-scene',
  template: `
    <div>FPS: {{ fps$ | async | number:'1.0-0' }}</div>
    <div>Draw Calls: {{ drawCalls$ | async }}</div>
  `
})
export class SceneComponent implements OnInit {
  fps$ = this.threeLens.fps$;
  drawCalls$ = this.threeLens.drawCalls$;

  constructor(private threeLens: ThreeLensService) {}

  ngOnInit() {
    this.threeLens.observeRenderer(this.renderer);
    this.threeLens.observeScene(this.scene);
  }
}
```

## Class Definition

```typescript
@Injectable({ providedIn: 'root' })
class ThreeLensService implements OnDestroy {
  // Properties
  readonly probe: DevtoolProbe;
  readonly config: ThreeLensModuleConfig;
  readonly isReady: boolean;
  readonly currentFrameStats: FrameStats | null;
  readonly currentSnapshot: SceneSnapshot | null;
  readonly currentSelectedNode: SceneNode | null;

  // Observables
  readonly frameStats$: Observable<FrameStats | null>;
  readonly snapshot$: Observable<SceneSnapshot | null>;
  readonly selectedNode$: Observable<SceneNode | null>;
  readonly isReady$: Observable<boolean>;
  readonly isOverlayVisible$: Observable<boolean>;
  readonly fps$: Observable<number>;
  readonly drawCalls$: Observable<number>;
  readonly triangles$: Observable<number>;
  readonly frameTime$: Observable<number>;
  readonly gpuMemory$: Observable<number>;

  // Methods
  observeRenderer(renderer: THREE.WebGLRenderer): void;
  observeScene(scene: THREE.Scene): void;
  takeSnapshot(): SceneSnapshot | null;
  selectObject(uuid: string): void;
  clearSelection(): void;
  registerEntity(object: THREE.Object3D, options?: EntityOptions): void;
  unregisterEntity(object: THREE.Object3D): void;
  showOverlay(): void;
  hideOverlay(): void;
  toggleOverlay(): void;
  // ... more methods
}
```

## Observables

### frameStats$

Observable of the latest frame statistics.

```typescript
readonly frameStats$: Observable<FrameStats | null>;
```

**Example:**

```typescript
this.threeLens.frameStats$.subscribe(stats => {
  if (stats) {
    console.log('FPS:', stats.fps);
    console.log('Draw Calls:', stats.drawCalls);
  }
});
```

### snapshot$

Observable of the current scene snapshot.

```typescript
readonly snapshot$: Observable<SceneSnapshot | null>;
```

**Example:**

```typescript
this.threeLens.snapshot$.subscribe(snapshot => {
  if (snapshot) {
    console.log('Scene objects:', snapshot.root.children.length);
  }
});
```

### selectedNode$

Observable of the currently selected scene node.

```typescript
readonly selectedNode$: Observable<SceneNode | null>;
```

**Example:**

```typescript
this.threeLens.selectedNode$.subscribe(node => {
  if (node) {
    console.log('Selected:', node.ref.name, node.ref.type);
  }
});
```

### Shortcut Observables

Pre-configured observables for common metrics:

| Observable | Type | Description |
|------------|------|-------------|
| `fps$` | `Observable<number>` | Current FPS |
| `drawCalls$` | `Observable<number>` | Current draw calls |
| `triangles$` | `Observable<number>` | Current triangle count |
| `frameTime$` | `Observable<number>` | Frame time in ms |
| `gpuMemory$` | `Observable<number>` | GPU memory estimate |
| `isReady$` | `Observable<boolean>` | Whether probe is ready |
| `isOverlayVisible$` | `Observable<boolean>` | Overlay visibility |

All shortcut observables use `distinctUntilChanged()` to prevent unnecessary emissions.

## Methods

### observeRenderer

Start observing a WebGL renderer.

```typescript
observeRenderer(renderer: THREE.WebGLRenderer): void;
```

**Example:**

```typescript
const renderer = new THREE.WebGLRenderer();
this.threeLens.observeRenderer(renderer);
```

### observeScene

Start observing a Three.js scene.

```typescript
observeScene(scene: THREE.Scene): void;
```

**Example:**

```typescript
const scene = new THREE.Scene();
this.threeLens.observeScene(scene);
```

### takeSnapshot

Take a snapshot of the current scene state.

```typescript
takeSnapshot(): SceneSnapshot | null;
```

**Example:**

```typescript
const snapshot = this.threeLens.takeSnapshot();
if (snapshot) {
  console.log('Objects:', snapshot.root.children.length);
}
```

### selectObject / clearSelection

Select an object by UUID or clear the selection.

```typescript
selectObject(uuid: string): void;
clearSelection(): void;
```

**Example:**

```typescript
// Select
this.threeLens.selectObject(mesh.uuid);

// Clear
this.threeLens.clearSelection();
```

### registerEntity / unregisterEntity

Register or unregister entities for enhanced display in devtools.

```typescript
registerEntity(object: THREE.Object3D, options?: EntityOptions): void;
unregisterEntity(object: THREE.Object3D): void;
```

**EntityOptions:**

```typescript
interface EntityOptions {
  name?: string;
  module?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}
```

**Example:**

```typescript
this.threeLens.registerEntity(playerMesh, {
  name: 'Player',
  module: 'game/entities',
  metadata: { health: 100 },
  tags: ['player', 'controllable']
});
```

### Overlay Methods

Control overlay visibility.

```typescript
showOverlay(): void;
hideOverlay(): void;
toggleOverlay(): void;
```

### Camera Methods

Focus and fly-to camera operations.

```typescript
focusOnSelected(): void;
flyToSelected(): void;
```

### Initialization Methods

Set up transform gizmos and camera controls.

```typescript
initializeTransformGizmo(
  scene: THREE.Scene,
  camera: THREE.Camera,
  domElement: HTMLElement,
  THREE: typeof import('three')
): void;

initializeCameraController(
  camera: THREE.Camera,
  THREE: typeof import('three'),
  orbitTarget?: THREE.Vector3
): void;
```

## Properties

### probe

Direct access to the underlying `DevtoolProbe` instance.

```typescript
get probe(): DevtoolProbe;
```

### Synchronous Getters

Access current values without subscribing:

```typescript
get isReady(): boolean;
get currentFrameStats(): FrameStats | null;
get currentSnapshot(): SceneSnapshot | null;
get currentSelectedNode(): SceneNode | null;
```

## Examples

### Complete Scene Setup

```typescript
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';
import * as THREE from 'three';

@Component({
  selector: 'app-three-scene',
  template: `
    <canvas #canvas></canvas>
    <div class="overlay">
      <span>FPS: {{ fps$ | async | number:'1.0-0' }}</span>
      <span>Objects: {{ objectCount$ | async }}</span>
    </div>
  `
})
export class ThreeSceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  fps$ = this.threeLens.fps$;
  objectCount$ = this.threeLens.snapshot$.pipe(
    map(s => s?.root.children.length ?? 0)
  );

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;

  constructor(private threeLens: ThreeLensService) {}

  ngOnInit() {
    // Setup Three.js
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 16/9, 0.1, 1000);

    // Connect to 3Lens
    this.threeLens.observeRenderer(this.renderer);
    this.threeLens.observeScene(this.scene);

    // Initialize helpers
    this.threeLens.initializeTransformGizmo(
      this.scene,
      this.camera,
      this.renderer.domElement,
      THREE
    );
  }

  ngOnDestroy() {
    this.renderer.dispose();
  }
}
```

### Performance Monitoring Component

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';
import { map, combineLatest } from 'rxjs';
import { AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [AsyncPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="monitor" *ngIf="stats$ | async as stats">
      <div [class.warning]="stats.fpsLow">
        FPS: {{ stats.fps | number:'1.0-0' }}
      </div>
      <div [class.warning]="stats.drawCallsHigh">
        Draw Calls: {{ stats.drawCalls }}
      </div>
      <div>Triangles: {{ stats.triangles | number }}</div>
      <div>GPU Memory: {{ stats.gpuMemory | number:'1.1-1' }} MB</div>
    </div>
  `
})
export class PerformanceMonitorComponent {
  stats$ = combineLatest([
    this.threeLens.fps$,
    this.threeLens.drawCalls$,
    this.threeLens.triangles$,
    this.threeLens.gpuMemory$
  ]).pipe(
    map(([fps, drawCalls, triangles, gpuMemory]) => ({
      fps,
      drawCalls,
      triangles,
      gpuMemory: gpuMemory / (1024 * 1024),
      fpsLow: fps < 30,
      drawCallsHigh: drawCalls > 500
    }))
  );

  constructor(private threeLens: ThreeLensService) {}
}
```

### Selection Panel

```typescript
import { Component } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';
import { map } from 'rxjs';

@Component({
  selector: 'app-selection-panel',
  template: `
    <div *ngIf="selectedNode$ | async as node; else noSelection">
      <h3>{{ node.ref.name || 'Unnamed' }}</h3>
      <p>Type: {{ node.ref.type }}</p>
      <p>UUID: {{ node.ref.uuid }}</p>
      <button (click)="clearSelection()">Deselect</button>
      <button (click)="focusOnSelected()">Focus</button>
    </div>
    <ng-template #noSelection>
      <p>No object selected</p>
    </ng-template>
  `
})
export class SelectionPanelComponent {
  selectedNode$ = this.threeLens.selectedNode$;

  constructor(private threeLens: ThreeLensService) {}

  clearSelection() {
    this.threeLens.clearSelection();
  }

  focusOnSelected() {
    this.threeLens.focusOnSelected();
  }
}
```

## Zone Optimization

The service runs event subscriptions outside Angular's zone for performance, then re-enters the zone only when necessary (e.g., for selection changes that affect the UI).

## Related

- [THREELENS_PROBE](./tokens.md#threelens_probe) - Direct probe access
- [ThreeLensEntityDirective](./entity-directive.md) - Entity registration directive
- [ThreeLensModule](./module.md) - Module setup
