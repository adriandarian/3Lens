import { Injectable, Inject, Optional, OnDestroy, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, map } from 'rxjs/operators';
import {
  createProbe,
  DevtoolProbe,
  FrameStats,
  SceneSnapshot,
  SceneNode,
} from '@3lens/core';
import {
  THREELENS_CONFIG,
  ThreeLensModuleConfig,
  DEFAULT_THREELENS_CONFIG,
} from './tokens';
import type * as THREE from 'three';

/**
 * Entity registration options
 */
export interface EntityOptions {
  name?: string;
  module?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

/**
 * Angular service for 3Lens integration
 *
 * Provides reactive access to the probe, frame stats, snapshots, and selection.
 *
 * @example
 * ```typescript
 * @Component({
 *   selector: 'app-scene',
 *   template: `
 *     <div>FPS: {{ fps$ | async }}</div>
 *     <div>Draw Calls: {{ drawCalls$ | async }}</div>
 *   `
 * })
 * export class SceneComponent implements OnInit {
 *   fps$ = this.threeLens.frameStats$.pipe(map(s => s?.fps ?? 0));
 *   drawCalls$ = this.threeLens.frameStats$.pipe(map(s => s?.drawCalls ?? 0));
 *
 *   constructor(private threeLens: ThreeLensService) {}
 *
 *   ngOnInit() {
 *     this.threeLens.observeRenderer(this.renderer);
 *     this.threeLens.observeScene(this.scene);
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ThreeLensService implements OnDestroy {
  private readonly _probe: DevtoolProbe;
  private readonly _destroy$ = new Subject<void>();
  private readonly _config: ThreeLensModuleConfig;

  // Reactive state
  private readonly _frameStats$ = new BehaviorSubject<FrameStats | null>(null);
  private readonly _snapshot$ = new BehaviorSubject<SceneSnapshot | null>(null);
  private readonly _selectedNode$ = new BehaviorSubject<SceneNode | null>(null);
  private readonly _isReady$ = new BehaviorSubject<boolean>(false);
  private readonly _isOverlayVisible$ = new BehaviorSubject<boolean>(true);

  // Registered entities
  private readonly _registeredEntities = new Map<string, EntityOptions>();

  // Overlay reference
  private _overlay: { show: () => void; hide: () => void; toggle: () => void } | null = null;

  /**
   * Observable of the latest frame stats
   */
  readonly frameStats$: Observable<FrameStats | null> = this._frameStats$.asObservable();

  /**
   * Observable of the current scene snapshot
   */
  readonly snapshot$: Observable<SceneSnapshot | null> = this._snapshot$.asObservable();

  /**
   * Observable of the currently selected scene node
   */
  readonly selectedNode$: Observable<SceneNode | null> = this._selectedNode$.asObservable();

  /**
   * Observable indicating whether the probe is ready
   */
  readonly isReady$: Observable<boolean> = this._isReady$.asObservable();

  /**
   * Observable of overlay visibility state
   */
  readonly isOverlayVisible$: Observable<boolean> = this._isOverlayVisible$.asObservable();

  /**
   * Observable of current FPS
   */
  readonly fps$: Observable<number> = this._frameStats$.pipe(
    map((stats) => stats?.fps ?? 0),
    distinctUntilChanged()
  );

  /**
   * Observable of current draw calls
   */
  readonly drawCalls$: Observable<number> = this._frameStats$.pipe(
    map((stats) => stats?.drawCalls ?? 0),
    distinctUntilChanged()
  );

  /**
   * Observable of current triangle count
   */
  readonly triangles$: Observable<number> = this._frameStats$.pipe(
    map((stats) => stats?.triangles ?? 0),
    distinctUntilChanged()
  );

  /**
   * Observable of current frame time in ms
   */
  readonly frameTime$: Observable<number> = this._frameStats$.pipe(
    map((stats) => stats?.frameTimeMs ?? 0),
    distinctUntilChanged()
  );

  /**
   * Observable of GPU memory estimate
   */
  readonly gpuMemory$: Observable<number> = this._frameStats$.pipe(
    map((stats) => stats?.memory?.gpuMemoryEstimate ?? 0),
    distinctUntilChanged()
  );

  constructor(
    private readonly ngZone: NgZone,
    @Optional() @Inject(THREELENS_CONFIG) config?: ThreeLensModuleConfig
  ) {
    this._config = { ...DEFAULT_THREELENS_CONFIG, ...config };

    // Create probe
    this._probe = createProbe({
      appName: this._config.appName,
      debug: this._config.debug,
    });

    // Subscribe to probe events (run outside Angular zone for performance)
    this.ngZone.runOutsideAngular(() => {
      this._probe.onFrameStats((stats) => {
        this._frameStats$.next(stats);
      });

      this._probe.onSnapshot((snapshot) => {
        this._snapshot$.next(snapshot);
        this._isReady$.next(true);
      });

      this._probe.onSelectionChanged((node) => {
        this.ngZone.run(() => {
          this._selectedNode$.next(node);
        });
      });
    });

    // Set up keyboard shortcut
    this.setupKeyboardShortcut();

    // Initialize overlay visibility
    this._isOverlayVisible$.next(this._config.showOverlay ?? true);
  }

  /**
   * Get the probe instance directly
   */
  get probe(): DevtoolProbe {
    return this._probe;
  }

  /**
   * Get current config
   */
  get config(): ThreeLensModuleConfig {
    return this._config;
  }

  /**
   * Check if probe is ready
   */
  get isReady(): boolean {
    return this._isReady$.value;
  }

  /**
   * Get current frame stats synchronously
   */
  get currentFrameStats(): FrameStats | null {
    return this._frameStats$.value;
  }

  /**
   * Get current snapshot synchronously
   */
  get currentSnapshot(): SceneSnapshot | null {
    return this._snapshot$.value;
  }

  /**
   * Get current selected node synchronously
   */
  get currentSelectedNode(): SceneNode | null {
    return this._selectedNode$.value;
  }

  /**
   * Observe a WebGL renderer
   */
  observeRenderer(renderer: THREE.WebGLRenderer): void {
    this._probe.observeRenderer(renderer);
  }

  /**
   * Observe a three.js scene
   */
  observeScene(scene: THREE.Scene): void {
    this._probe.observeScene(scene);
  }

  /**
   * Initialize transform gizmo
   */
  initializeTransformGizmo(
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    THREE: typeof import('three')
  ): void {
    this._probe.initializeTransformGizmo?.(scene, camera, domElement, THREE);
  }

  /**
   * Initialize camera controller
   */
  initializeCameraController(
    camera: THREE.Camera,
    THREE: typeof import('three'),
    orbitTarget?: THREE.Vector3
  ): void {
    this._probe.initializeCameraController?.(camera, THREE, orbitTarget);
  }

  /**
   * Take a scene snapshot
   */
  takeSnapshot(): SceneSnapshot | null {
    return this._probe.takeSnapshot();
  }

  /**
   * Select an object by UUID
   */
  selectObject(uuid: string): void {
    this._probe.selectObjectByUuid(uuid);
  }

  /**
   * Clear current selection
   */
  clearSelection(): void {
    this._probe.clearSelection();
  }

  /**
   * Focus camera on selected object
   */
  focusOnSelected(): void {
    this._probe.focusOnSelected?.();
  }

  /**
   * Fly camera to selected object
   */
  flyToSelected(): void {
    this._probe.flyToSelected?.();
  }

  /**
   * Register an entity with the devtools
   */
  registerEntity(object: THREE.Object3D, options: EntityOptions = {}): void {
    if (options.name) {
      object.name = options.name;
    }

    object.userData = {
      ...object.userData,
      __3lens: {
        module: options.module,
        metadata: options.metadata,
        tags: options.tags,
        registeredAt: Date.now(),
      },
    };

    this._registeredEntities.set(object.uuid, options);
  }

  /**
   * Unregister an entity
   */
  unregisterEntity(object: THREE.Object3D): void {
    if (object.userData?.__3lens) {
      delete object.userData.__3lens;
    }
    this._registeredEntities.delete(object.uuid);
  }

  /**
   * Set the overlay instance
   */
  setOverlay(overlay: { show: () => void; hide: () => void; toggle: () => void }): void {
    this._overlay = overlay;
  }

  /**
   * Show the overlay
   */
  showOverlay(): void {
    this._overlay?.show();
    this._isOverlayVisible$.next(true);
  }

  /**
   * Hide the overlay
   */
  hideOverlay(): void {
    this._overlay?.hide();
    this._isOverlayVisible$.next(false);
  }

  /**
   * Toggle overlay visibility
   */
  toggleOverlay(): void {
    if (this._isOverlayVisible$.value) {
      this.hideOverlay();
    } else {
      this.showOverlay();
    }
  }

  private setupKeyboardShortcut(): void {
    const shortcut = this._config.toggleShortcut ?? 'ctrl+shift+d';

    this.ngZone.runOutsideAngular(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const keys = shortcut.toLowerCase().split('+');
        const needsCtrl = keys.includes('ctrl');
        const needsShift = keys.includes('shift');
        const needsAlt = keys.includes('alt');
        const key = keys.find((k) => !['ctrl', 'shift', 'alt'].includes(k));

        if (
          e.ctrlKey === needsCtrl &&
          e.shiftKey === needsShift &&
          e.altKey === needsAlt &&
          e.key.toLowerCase() === key
        ) {
          e.preventDefault();
          this.ngZone.run(() => this.toggleOverlay());
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      this._destroy$.subscribe(() => {
        window.removeEventListener('keydown', handleKeyDown);
      });
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._probe.dispose();
  }
}

