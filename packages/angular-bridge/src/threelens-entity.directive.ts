import {
  Directive,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ThreeLensService, EntityOptions } from './threelens.service';
import type * as THREE from 'three';

/**
 * Directive to register a Three.js object as a named entity in 3Lens
 *
 * Apply this directive to a component that holds a Three.js object reference
 * to give it a meaningful name and metadata in the devtools.
 *
 * @example
 * ```typescript
 * @Component({
 *   selector: 'app-player',
 *   template: `<ng-content></ng-content>`
 * })
 * export class PlayerComponent implements AfterViewInit {
 *   @ViewChild('mesh') meshRef: ElementRef;
 *   mesh: THREE.Mesh;
 *
 *   // Use the directive programmatically
 *   constructor(private threeLens: ThreeLensService) {}
 *
 *   ngAfterViewInit() {
 *     this.threeLens.registerEntity(this.mesh, {
 *       name: 'Player',
 *       module: 'game/entities',
 *       metadata: { health: 100 }
 *     });
 *   }
 * }
 * ```
 *
 * Or use declaratively with a wrapper component:
 *
 * @example
 * ```html
 * <three-object
 *   threeLensEntity
 *   [threeLensName]="'Player'"
 *   [threeLensModule]="'game/entities'"
 *   [threeLensMetadata]="{ health: playerHealth }"
 *   [threeLensTags]="['controllable']"
 * >
 * </three-object>
 * ```
 */
@Directive({
  selector: '[threeLensEntity]',
  standalone: true,
})
export class ThreeLensEntityDirective implements OnInit, OnDestroy, OnChanges {
  /**
   * The Three.js object to register
   * Must be set programmatically since Angular doesn't have direct three.js bindings
   */
  @Input() threeLensObject?: THREE.Object3D;

  /**
   * Name to display in the devtools
   */
  @Input() threeLensName?: string;

  /**
   * Module/category for grouping
   */
  @Input() threeLensModule?: string;

  /**
   * Custom metadata to display in inspector
   */
  @Input() threeLensMetadata?: Record<string, unknown>;

  /**
   * Tags for filtering
   */
  @Input() threeLensTags?: string[];

  private _registered = false;

  constructor(private readonly threeLens: ThreeLensService) {}

  ngOnInit(): void {
    this.registerIfReady();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-register if the object or options change
    if (changes['threeLensObject'] && !changes['threeLensObject'].firstChange) {
      this.unregister();
      this.registerIfReady();
    } else if (
      this._registered &&
      (changes['threeLensName'] ||
        changes['threeLensModule'] ||
        changes['threeLensMetadata'] ||
        changes['threeLensTags'])
    ) {
      // Update metadata without re-registering
      this.updateMetadata();
    }
  }

  ngOnDestroy(): void {
    this.unregister();
  }

  private registerIfReady(): void {
    if (!this.threeLensObject || this._registered) {
      return;
    }

    const options: EntityOptions = {
      name: this.threeLensName,
      module: this.threeLensModule,
      metadata: this.threeLensMetadata,
      tags: this.threeLensTags,
    };

    this.threeLens.registerEntity(this.threeLensObject, options);
    this._registered = true;
  }

  private updateMetadata(): void {
    if (!this.threeLensObject || !this._registered) {
      return;
    }

    // Update the userData directly
    if (this.threeLensObject.userData?.__3lens) {
      this.threeLensObject.userData.__3lens = {
        ...this.threeLensObject.userData.__3lens,
        metadata: this.threeLensMetadata,
        tags: this.threeLensTags,
      };
    }

    // Update name if changed
    if (this.threeLensName && this.threeLensObject.name !== this.threeLensName) {
      this.threeLensObject.name = this.threeLensName;
    }
  }

  private unregister(): void {
    if (!this.threeLensObject || !this._registered) {
      return;
    }

    this.threeLens.unregisterEntity(this.threeLensObject);
    this._registered = false;
  }
}

/**
 * Helper function to create entity options
 */
export function createEntityOptions(
  name: string,
  options: Omit<EntityOptions, 'name'> = {}
): EntityOptions {
  return { name, ...options };
}

