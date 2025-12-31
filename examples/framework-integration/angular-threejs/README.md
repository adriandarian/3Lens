# 3Lens Angular + Three.js Example

This example demonstrates how to integrate 3Lens devtools with an Angular application using Three.js directly.

## Features Demonstrated

- **ThreeLensModule**: Angular module for 3Lens integration
- **ThreeSceneService**: Injectable service managing the Three.js scene
- **DevtoolProbe**: Direct probe creation and attachment
- **RxJS Integration**: Reactive metrics via BehaviorSubject/Observable
- **NgZone Optimization**: Animation loop runs outside Angular zone

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-angular-threejs dev
```

Or run all examples:

```bash
pnpm dev
```

## Code Structure

```
src/
├── main.ts                    # Angular bootstrap
├── index.html                 # HTML entry
├── styles.css                 # Global styles
└── app/
    ├── app.component.ts       # Root component with metrics display
    ├── components/
    │   └── scene-canvas.component.ts  # Canvas rendering component
    └── services/
        └── three-scene.service.ts     # Three.js scene management
```

## Key Integration Points

### 1. Create a Scene Service

```typescript
import { createProbe, DevtoolProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

@Injectable({ providedIn: 'root' })
export class ThreeSceneService {
  private probe!: DevtoolProbe;

  initialize(canvas: HTMLCanvasElement): void {
    // ... create scene, camera, renderer ...
    
    this.probe = createProbe({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera
    });
    
    bootstrapOverlay(this.probe);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
    this.probe.onFrame();
  }
}
```

### 2. Run Animation Outside NgZone

```typescript
@Component({ ... })
export class SceneCanvasComponent {
  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Run outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.sceneService.render();
  };
}
```

### 3. Expose Reactive Metrics

```typescript
@Injectable({ providedIn: 'root' })
export class ThreeSceneService {
  private fpsSubject = new BehaviorSubject<number>(0);
  fps$ = this.fpsSubject.asObservable();

  // Update in render loop
  private updateMetrics(): void {
    this.fpsSubject.next(currentFps);
  }
}
```

## Scene Contents

The example scene includes:

- **Ground**: Plane with receive shadows
- **RotatingBox**: Animated rotating cube
- **BouncingSphere**: Bouncing sphere with physical material
- **TorusGroup**: Group of 3 orbital toruses
- **Lights**: Ambient, directional (with shadows), and point lights

## 3Lens Features Available

Once running, use the 3Lens overlay to:

- **Scene Panel**: Inspect the scene graph hierarchy
- **Performance Panel**: Monitor FPS, draw calls, triangles
- **Memory Panel**: Track texture and geometry memory
- **Resources Panel**: View resource lifecycle events
- **Transform Gizmo**: Manipulate object transforms
- **Camera Controls**: Focus on objects, switch cameras

## Dependencies

- `@3lens/core` - Core devtool probe
- `@3lens/overlay` - Floating overlay UI
- `@angular/core` - Angular framework
- `three` - Three.js library
- `rxjs` - Reactive extensions

## Using @3lens/angular-bridge

For a more integrated approach using Angular-specific features like the `ThreeLensEntityDirective` and `ThreeLensService`, you can import `@3lens/angular-bridge`:

```typescript
import { ThreeLensService, ThreeLensEntityDirective } from '@3lens/angular-bridge';

@Component({
  selector: 'app-mesh',
  template: `<canvas threeLensEntity [entityName]="'MyMesh'"></canvas>`
})
export class MeshComponent {
  constructor(private threeLensService: ThreeLensService) {}
}
```

