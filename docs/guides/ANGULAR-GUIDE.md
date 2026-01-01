# Angular Integration Guide

This guide covers integrating 3Lens with Angular applications using the `@3lens/angular-bridge` package.

## Table of Contents

- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [ThreeLensService](#threelensservice)
- [Entity Directive](#entity-directive)
- [Reactive Patterns](#reactive-patterns)
- [Nx Monorepo Support](#nx-monorepo-support)
- [Advanced Patterns](#advanced-patterns)
- [TypeScript Support](#typescript-support)

---

## Installation

```bash
npm install @3lens/core @3lens/overlay @3lens/angular-bridge three
npm install --save-dev @types/three
```

---

## Basic Setup

### Module Configuration

Configure 3Lens in your Angular module or as a standalone provider:

```typescript
// app.config.ts (Standalone)
import { ApplicationConfig } from '@angular/core';
import { provideThreeLens } from '@3lens/angular-bridge';

export const appConfig: ApplicationConfig = {
  providers: [
    provideThreeLens({
      appName: 'My Angular App',
      debug: false,
      showOverlay: true,
      toggleShortcut: 'ctrl+shift+d',
    }),
  ],
};
```

Or with NgModule:

```typescript
// app.module.ts
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
      debug: false,
      showOverlay: true,
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Configuration Options

```typescript
interface ThreeLensModuleConfig {
  /**
   * Application name displayed in devtools
   */
  appName: string;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Show overlay on init
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Keyboard shortcut to toggle overlay
   * @default 'ctrl+shift+d'
   */
  toggleShortcut?: string;

  /**
   * Performance rules
   */
  rules?: {
    maxDrawCalls?: number;
    maxTriangles?: number;
    maxFrameTimeMs?: number;
    maxTextures?: number;
    maxTextureMemory?: number;
  };

  /**
   * Sampling configuration
   */
  sampling?: {
    frameStatsInterval?: number;
    snapshotInterval?: number;
    enableGpuTiming?: boolean;
    enableResourceTracking?: boolean;
  };
}
```

---

## ThreeLensService

The `ThreeLensService` is the primary way to interact with 3Lens in Angular.

### Basic Usage

```typescript
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';
import * as THREE from 'three';

@Component({
  selector: 'app-scene',
  template: `
    <canvas #canvas></canvas>
    <div class="stats">
      <span>FPS: {{ fps$ | async | number:'1.0-1' }}</span>
      <span>Draw Calls: {{ drawCalls$ | async }}</span>
      <span>Triangles: {{ triangles$ | async | number }}</span>
    </div>
  `,
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Reactive observables from ThreeLensService
  fps$ = this.threeLens.fps$;
  drawCalls$ = this.threeLens.drawCalls$;
  triangles$ = this.threeLens.triangles$;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationId!: number;

  constructor(
    private threeLens: ThreeLensService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.initThreeJS();
    this.connectThreeLens();
    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  private initThreeJS() {
    const canvas = this.canvasRef.nativeElement;
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Add objects
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    // Add lights
    this.scene.add(new THREE.AmbientLight(0x404040));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);
  }

  private connectThreeLens() {
    // Connect probe to renderer and scene
    this.threeLens.observeRenderer(this.renderer);
    this.threeLens.observeScene(this.scene);
    
    // Set THREE reference for selection features
    this.threeLens.setThreeReference(THREE);
  }

  private animate() {
    // Run outside Angular zone for performance
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        this.animationId = requestAnimationFrame(loop);
        this.renderer.render(this.scene, this.camera);
      };
      loop();
    });
  }
}
```

### Service API Reference

```typescript
@Injectable()
class ThreeLensService {
  // ===== Observables =====
  
  /** Latest frame stats */
  readonly frameStats$: Observable<FrameStats | null>;
  
  /** Current scene snapshot */
  readonly snapshot$: Observable<SceneSnapshot | null>;
  
  /** Currently selected scene node */
  readonly selectedNode$: Observable<SceneNode | null>;
  
  /** Whether the probe is ready */
  readonly isReady$: Observable<boolean>;
  
  /** Overlay visibility state */
  readonly isOverlayVisible$: Observable<boolean>;
  
  // Convenience metric observables
  readonly fps$: Observable<number>;
  readonly drawCalls$: Observable<number>;
  readonly triangles$: Observable<number>;
  readonly frameTime$: Observable<number>;
  readonly gpuMemory$: Observable<number>;

  // ===== Synchronous Getters =====
  
  /** Get probe instance directly */
  get probe(): DevtoolProbe;
  
  /** Get current config */
  get config(): ThreeLensModuleConfig;
  
  /** Check if probe is ready */
  get isReady(): boolean;
  
  /** Get current frame stats synchronously */
  get frameStats(): FrameStats | null;
  
  /** Get current snapshot synchronously */
  get snapshot(): SceneSnapshot | null;

  // ===== Methods =====
  
  /** Observe a WebGL/WebGPU renderer */
  observeRenderer(renderer: THREE.WebGLRenderer | THREE.WebGPURenderer): void;
  
  /** Observe a scene */
  observeScene(scene: THREE.Scene, options?: { name?: string }): void;
  
  /** Set THREE.js reference for selection features */
  setThreeReference(THREE: typeof import('three')): void;
  
  /** Select an object by UUID */
  selectObject(uuid: string): void;
  
  /** Clear current selection */
  clearSelection(): void;
  
  /** Show the overlay */
  showOverlay(): void;
  
  /** Hide the overlay */
  hideOverlay(): void;
  
  /** Toggle overlay visibility */
  toggleOverlay(): void;
  
  /** Register a logical entity */
  registerEntity(object: THREE.Object3D, options: EntityOptions): string;
  
  /** Update a registered entity */
  updateEntity(entityId: string, options: Partial<EntityOptions>): void;
  
  /** Unregister an entity */
  unregisterEntity(entityId: string): void;
}
```

---

## Entity Directive

Use the `threeLensEntity` directive to register objects declaratively:

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ThreeLensEntityDirective } from '@3lens/angular-bridge';
import * as THREE from 'three';

@Component({
  selector: 'app-game-object',
  standalone: true,
  imports: [ThreeLensEntityDirective],
  template: `
    <canvas #canvas></canvas>
  `,
})
export class GameObjectComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef;

  private mesh!: THREE.Mesh;

  constructor(private threeLens: ThreeLensService) {}

  ngAfterViewInit() {
    // Create your Three.js object
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );

    // Register with 3Lens using the service
    this.threeLens.registerEntity(this.mesh, {
      name: 'Player Character',
      module: '@game/characters',
      tags: ['player', 'controllable'],
      metadata: {
        health: 100,
        level: 5,
      },
    });
  }
}
```

### Directive Options

```typescript
interface EntityOptions {
  /**
   * Display name in devtools
   */
  name?: string;

  /**
   * Module identifier
   */
  module?: string;

  /**
   * Custom metadata
   */
  metadata?: Record<string, unknown>;

  /**
   * Tags for filtering
   */
  tags?: string[];

  /**
   * Component type identifier
   */
  componentType?: string;

  /**
   * Unique component instance ID
   */
  componentId?: string;

  /**
   * Parent entity ID for hierarchy
   */
  parentEntityId?: string;
}
```

---

## Reactive Patterns

### Using AsyncPipe

The recommended pattern for displaying metrics:

```typescript
@Component({
  selector: 'app-performance-display',
  template: `
    <div class="perf-panel">
      <div class="metric">
        <span class="label">FPS:</span>
        <span class="value" [class.warning]="(fps$ | async) < 30">
          {{ fps$ | async | number:'1.0-1' }}
        </span>
      </div>
      
      <div class="metric">
        <span class="label">Frame Time:</span>
        <span class="value">{{ frameTime$ | async | number:'1.2-2' }}ms</span>
      </div>
      
      <div class="metric">
        <span class="label">Draw Calls:</span>
        <span class="value">{{ drawCalls$ | async }}</span>
      </div>
      
      <div class="metric">
        <span class="label">Triangles:</span>
        <span class="value">{{ triangles$ | async | number }}</span>
      </div>
      
      <div class="metric">
        <span class="label">GPU Memory:</span>
        <span class="value">{{ gpuMemoryMB$ | async | number:'1.1-1' }}MB</span>
      </div>
    </div>
  `,
})
export class PerformanceDisplayComponent {
  fps$ = this.threeLens.fps$;
  frameTime$ = this.threeLens.frameTime$;
  drawCalls$ = this.threeLens.drawCalls$;
  triangles$ = this.threeLens.triangles$;
  
  // Computed observable
  gpuMemoryMB$ = this.threeLens.gpuMemory$.pipe(
    map(bytes => bytes / 1024 / 1024)
  );

  constructor(private threeLens: ThreeLensService) {}
}
```

### Selection Handling

```typescript
@Component({
  selector: 'app-inspector',
  template: `
    <div *ngIf="selectedNode$ | async as node; else noSelection">
      <h3>{{ node.name || 'Unnamed Object' }}</h3>
      <p>Type: {{ node.type }}</p>
      <p>UUID: {{ node.uuid }}</p>
      
      <div *ngIf="node.transform as t">
        <h4>Transform</h4>
        <p>Position: {{ t.position | json }}</p>
        <p>Rotation: {{ t.rotation | json }}</p>
        <p>Scale: {{ t.scale | json }}</p>
      </div>
      
      <button (click)="clearSelection()">Clear Selection</button>
    </div>
    
    <ng-template #noSelection>
      <p>No object selected. Click an object in the scene or use Inspect mode.</p>
    </ng-template>
  `,
})
export class InspectorComponent {
  selectedNode$ = this.threeLens.selectedNode$;

  constructor(private threeLens: ThreeLensService) {}

  clearSelection() {
    this.threeLens.clearSelection();
  }
}
```

### Subscribing with takeUntilDestroyed

```typescript
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThreeLensService } from '@3lens/angular-bridge';

@Component({
  selector: 'app-scene-monitor',
  template: `...`,
})
export class SceneMonitorComponent implements OnInit {
  private threeLens = inject(ThreeLensService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    // Subscribe to frame stats
    this.threeLens.frameStats$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(stats => {
        if (stats && stats.frameTimeMs > 33.33) {
          console.warn('Frame time exceeded 30 FPS target');
        }
      });

    // Subscribe to selection changes
    this.threeLens.selectedNode$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(node => {
        if (node) {
          console.log('Selected:', node.name, node.uuid);
        }
      });
  }
}
```

---

## Nx Monorepo Support

The `@3lens/angular-bridge` includes helpers for Nx workspaces with library-based architectures.

### NxLibraryHelper

```typescript
import { Injectable } from '@angular/core';
import { createNxLibraryHelper, NxLibraryHelper } from '@3lens/angular-bridge';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class CharactersModule {
  private helper: NxLibraryHelper;

  constructor(threeLens: ThreeLensService) {
    this.helper = createNxLibraryHelper(threeLens.probe, {
      module: '@myapp/characters',
      defaultTags: ['character', 'game-entity'],
    });
  }

  registerCharacter(mesh: THREE.Mesh, name: string, metadata: Record<string, unknown>) {
    return this.helper.registerEntity(mesh, {
      name,
      componentType: 'Character',
      metadata,
    });
  }

  registerNPC(mesh: THREE.Mesh, npcId: string) {
    return this.helper.registerEntity(mesh, {
      name: `NPC-${npcId}`,
      componentType: 'NPC',
      tags: ['npc', 'ai-controlled'],
      metadata: { npcId },
    });
  }
}
```

### Library-Scoped Registration

```typescript
// libs/weapons/src/lib/weapons.service.ts
import { Injectable } from '@angular/core';
import { createNxLibraryHelper } from '@3lens/angular-bridge';
import { ThreeLensService } from '@3lens/angular-bridge';

@Injectable({
  providedIn: 'root',
})
export class WeaponsService {
  private helper = createNxLibraryHelper(this.threeLens.probe, {
    module: '@myapp/weapons',
    defaultTags: ['weapon', 'equipment'],
  });

  constructor(private threeLens: ThreeLensService) {}

  createSword(): THREE.Group {
    const sword = new THREE.Group();
    // ... create sword mesh
    
    this.helper.registerEntity(sword, {
      name: 'Sword',
      componentType: 'MeleeWeapon',
      metadata: {
        damage: 50,
        speed: 1.2,
        range: 2,
      },
    });
    
    return sword;
  }
}
```

---

## Advanced Patterns

### Custom Injection Token

For testing or custom configurations:

```typescript
import { InjectionToken, Provider } from '@angular/core';
import { DevtoolProbe, createProbe } from '@3lens/core';

export const CUSTOM_PROBE = new InjectionToken<DevtoolProbe>('CustomProbe');

export function provideCustomProbe(): Provider {
  return {
    provide: CUSTOM_PROBE,
    useFactory: () => createProbe({
      appName: 'Custom App',
      rules: {
        maxDrawCalls: 100,
        maxTriangles: 50_000,
      },
    }),
  };
}

// Usage in component
@Component({...})
export class MyComponent {
  constructor(@Inject(CUSTOM_PROBE) private probe: DevtoolProbe) {}
}
```

### Performance Zone Optimization

Keep the render loop outside Angular's change detection:

```typescript
@Component({
  selector: 'app-optimized-scene',
  template: `<canvas #canvas></canvas>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptimizedSceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationId!: number;

  constructor(
    private ngZone: NgZone,
    private threeLens: ThreeLensService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initThreeJS();
    
    // Run rendering outside Angular zone
    this.ngZone.runOutsideAngular(() => {
      this.threeLens.observeRenderer(this.renderer);
      this.threeLens.observeScene(this.scene);
      this.animate();
    });

    // Only trigger change detection for selection changes
    this.threeLens.selectedNode$
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.ngZone.run(() => this.cdr.markForCheck());
      });
  }

  private animate() {
    const loop = () => {
      this.animationId = requestAnimationFrame(loop);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
  }
}
```

### Multiple Scenes

```typescript
@Component({
  selector: 'app-multi-scene',
  template: `
    <div class="scenes">
      <canvas #mainCanvas></canvas>
      <canvas #uiCanvas></canvas>
    </div>
  `,
})
export class MultiSceneComponent implements OnInit {
  @ViewChild('mainCanvas', { static: true }) mainCanvasRef!: ElementRef;
  @ViewChild('uiCanvas', { static: true }) uiCanvasRef!: ElementRef;

  private mainRenderer!: THREE.WebGLRenderer;
  private mainScene!: THREE.Scene;
  private uiRenderer!: THREE.WebGLRenderer;
  private uiScene!: THREE.Scene;

  constructor(private threeLens: ThreeLensService) {}

  ngOnInit() {
    // Set up main scene
    this.mainScene = new THREE.Scene();
    this.mainRenderer = new THREE.WebGLRenderer({ 
      canvas: this.mainCanvasRef.nativeElement 
    });
    
    // Set up UI scene
    this.uiScene = new THREE.Scene();
    this.uiRenderer = new THREE.WebGLRenderer({ 
      canvas: this.uiCanvasRef.nativeElement,
      alpha: true,
    });

    // Register both with 3Lens
    this.threeLens.observeRenderer(this.mainRenderer);
    this.threeLens.observeScene(this.mainScene, { name: 'Main Scene' });
    this.threeLens.observeScene(this.uiScene, { name: 'UI Scene' });
  }
}
```

### Conditional Debugging

```typescript
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    // Only import ThreeLensModule in development
    ...(environment.production ? [] : [
      ThreeLensModule.forRoot({
        appName: 'My App',
        debug: false,
      }),
    ]),
  ],
})
export class AppModule {}
```

---

## TypeScript Support

### Type-Safe Observables

```typescript
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThreeLensService } from '@3lens/angular-bridge';
import type { FrameStats, SceneNode } from '@3lens/core';

@Component({...})
export class TypedComponent {
  // Strongly typed observables
  frameStats$: Observable<FrameStats | null>;
  selectedNode$: Observable<SceneNode | null>;
  
  // Derived typed observables
  memoryMB$: Observable<number>;
  isLowFPS$: Observable<boolean>;

  constructor(private threeLens: ThreeLensService) {
    this.frameStats$ = this.threeLens.frameStats$;
    this.selectedNode$ = this.threeLens.selectedNode$;
    
    this.memoryMB$ = this.threeLens.gpuMemory$.pipe(
      map((bytes: number) => bytes / 1024 / 1024)
    );
    
    this.isLowFPS$ = this.threeLens.fps$.pipe(
      map((fps: number) => fps < 30)
    );
  }
}
```

### Entity Metadata Types

```typescript
interface CharacterMetadata {
  health: number;
  mana: number;
  level: number;
  class: 'warrior' | 'mage' | 'rogue';
  equipment: string[];
}

@Component({...})
export class CharacterComponent {
  registerCharacter(mesh: THREE.Mesh, data: CharacterMetadata) {
    this.threeLens.registerEntity(mesh, {
      name: `${data.class} (Level ${data.level})`,
      module: '@game/characters',
      metadata: data satisfies CharacterMetadata,
      tags: ['character', data.class],
    });
  }
}
```

---

## Troubleshooting

### Service Not Provided

If you get "No provider for ThreeLensService":

```typescript
// Ensure module is imported or providers are configured
@NgModule({
  imports: [
    ThreeLensModule.forRoot({ appName: 'My App' }),
  ],
})
export class AppModule {}

// Or for standalone:
bootstrapApplication(AppComponent, {
  providers: [
    provideThreeLens({ appName: 'My App' }),
  ],
});
```

### Zone.js Performance

If frame rates drop when using 3Lens:

```typescript
// Run render loop outside Angular zone
this.ngZone.runOutsideAngular(() => {
  this.animate();
});
```

### Memory Leaks

Always clean up subscriptions:

```typescript
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({...})
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.threeLens.frameStats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {...});
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## Examples

See complete implementations:

- [examples/framework-integration/angular-threejs](../examples/framework-integration/angular-threejs)

---

## Related Guides

- [Getting Started](./GETTING-STARTED.md)
- [Plugin Development](./PLUGIN-DEVELOPMENT.md)
- [CI Integration](./CI-INTEGRATION.md)
