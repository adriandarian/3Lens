/**
 * ThreeLens Angular Service
 *
 * Manages the 3Lens runtime and UI within Angular's zone.
 *
 * @packageDocumentation
 */

import {
  Injectable,
  NgZone,
  OnDestroy,
  Optional,
  Inject,
} from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { LensClient, Selection, LensConfig, EntityId } from '@3lens/runtime';
import { createLens } from '@3lens/runtime';
import { uiOverlay, uiDock, type UIAdapter, type Panel } from '@3lens/ui-core';
import { THREELENS_CONFIG, type ThreeLensConfig } from './tokens';

/**
 * Angular service for managing 3Lens
 *
 * @example
 * ```typescript
 * @Component({...})
 * export class MyComponent {
 *   constructor(private threeLens: ThreeLensService) {}
 *
 *   ngAfterViewInit() {
 *     this.threeLens.mount(this.container.nativeElement);
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ThreeLensService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private client: LensClient | null = null;
  private ui: UIAdapter | null = null;
  private mounted = false;

  /** Selection state as an Observable */
  private readonly _selection$ = new BehaviorSubject<Selection | null>(null);
  public readonly selection$: Observable<Selection | null> = this._selection$.asObservable();

  /** Visibility state */
  private readonly _visible$ = new BehaviorSubject<boolean>(true);
  public readonly visible$: Observable<boolean> = this._visible$.asObservable();

  /** Connection state */
  private readonly _connected$ = new BehaviorSubject<boolean>(false);
  public readonly connected$: Observable<boolean> = this._connected$.asObservable();

  constructor(
    private readonly ngZone: NgZone,
    @Optional() @Inject(THREELENS_CONFIG) private readonly config?: ThreeLensConfig
  ) {
    if (this.config?.autoInit) {
      // Auto-init will be triggered when mount is called
    }
  }

  /**
   * Initialize the 3Lens runtime
   */
  async init(config?: Partial<LensConfig>): Promise<LensClient> {
    const mergedConfig = { ...this.config?.lens, ...config };

    // Run lens creation outside Angular zone for performance
    if (this.config?.runOutsideZone !== false) {
      return this.ngZone.runOutsideAngular(async () => {
        const result = await createLens(mergedConfig as LensConfig);
        this.client = result.client;
        this.setupSubscriptions();
        return result.client;
      });
    }

    const result = await createLens(mergedConfig as LensConfig);
    this.client = result.client;
    this.setupSubscriptions();
    return result.client;
  }

  /**
   * Mount the UI to a container element
   */
  mount(container: HTMLElement): void {
    if (this.mounted) {
      console.warn('[3Lens] Already mounted');
      return;
    }

    const uiMode = this.config?.ui ?? 'overlay';

    if (uiMode === 'overlay') {
      this.ui = uiOverlay(this.config?.overlayConfig);
    } else {
      this.ui = uiDock({
        target: container,
        ...this.config?.dockConfig,
      });
    }

    // Mount outside zone for better performance
    if (this.config?.runOutsideZone !== false) {
      this.ngZone.runOutsideAngular(() => {
        this.ui!.mount(container);
      });
    } else {
      this.ui.mount(container);
    }

    this.mounted = true;
    this._visible$.next(true);
  }

  /**
   * Unmount the UI
   */
  unmount(): void {
    if (this.ui && this.mounted) {
      this.ui.unmount();
      this.mounted = false;
    }
  }

  /**
   * Show the UI
   */
  show(): void {
    if (this.ui) {
      this.ngZone.runOutsideAngular(() => {
        this.ui!.show();
      });
      this._visible$.next(true);
    }
  }

  /**
   * Hide the UI
   */
  hide(): void {
    if (this.ui) {
      this.ngZone.runOutsideAngular(() => {
        this.ui!.hide();
      });
      this._visible$.next(false);
    }
  }

  /**
   * Toggle UI visibility
   */
  toggle(): void {
    if (this.ui) {
      this.ngZone.runOutsideAngular(() => {
        this.ui!.toggle();
      });
      this._visible$.next(this.ui.isVisible());
    }
  }

  /**
   * Select entities
   */
  select(entityIds: EntityId | EntityId[]): void {
    if (this.client) {
      // Run outside zone to avoid unnecessary change detection
      this.ngZone.runOutsideAngular(() => {
        this.client!.select(entityIds);
      });
    }
  }

  /**
   * Get the current selection
   */
  getSelection(): Selection | null {
    return this._selection$.getValue();
  }

  /**
   * Register a panel
   */
  registerPanel(panel: Panel): void {
    if (this.ui) {
      this.ui.registerPanel(panel);
    }
  }

  /**
   * Unregister a panel
   */
  unregisterPanel(panelId: string): void {
    if (this.ui) {
      this.ui.unregisterPanel(panelId);
    }
  }

  /**
   * Get the lens client
   */
  getClient(): LensClient | null {
    return this.client;
  }

  /**
   * Check if visible
   */
  isVisible(): boolean {
    return this.ui?.isVisible() ?? false;
  }

  /**
   * Execute a command (runs inside Angular zone for change detection)
   */
  async executeCommand(command: string, args?: Record<string, unknown>): Promise<void> {
    if (!this.client) {
      throw new Error('[3Lens] Not initialized');
    }

    await this.client.executeCommand(command, args);

    // Trigger change detection after command execution
    this.ngZone.run(() => {
      // Zone run triggers change detection
    });
  }

  private setupSubscriptions(): void {
    if (!this.client) return;

    // Subscribe to selection changes
    const unsubscribe = this.client.onSelectionChange((selection) => {
      // Re-enter Angular zone for change detection
      this.ngZone.run(() => {
        this._selection$.next(selection);
      });
    });

    // Store unsubscribe for cleanup
    this.destroy$.subscribe(() => unsubscribe());

    this._connected$.next(this.client.connected);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.unmount();
    this._selection$.complete();
    this._visible$.complete();
    this._connected$.complete();
  }
}
