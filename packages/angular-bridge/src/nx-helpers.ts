import { type ThreeLensService } from './threelens.service';

/**
 * Options for registering an Nx library with 3Lens
 */
export interface NxLibraryOptions {
  /**
   * The library name (e.g., 'feature-player', 'ui-hud')
   */
  name: string;

  /**
   * Optional parent scope (e.g., 'game', 'editor')
   */
  scope?: string;

  /**
   * Library type for categorization
   */
  type?: 'feature' | 'ui' | 'data-access' | 'util' | 'shell';

  /**
   * Additional tags for filtering
   */
  tags?: string[];
}

/**
 * Helper class for integrating Nx libraries with 3Lens
 *
 * Use this to register objects from Nx libraries with proper module paths
 * and consistent naming conventions.
 *
 * @example
 * ```typescript
 * // In your Nx library's module or service
 * import { NxLibraryHelper } from '@3lens/angular-bridge';
 *
 * @Injectable({ providedIn: 'root' })
 * export class PlayerService {
 *   private nxHelper: NxLibraryHelper;
 *
 *   constructor(private threeLens: ThreeLensService) {
 *     this.nxHelper = new NxLibraryHelper(threeLens, {
 *       name: 'feature-player',
 *       scope: 'game',
 *       type: 'feature'
 *     });
 *   }
 *
 *   createPlayer(): THREE.Object3D {
 *     const player = new THREE.Mesh(...);
 *
 *     // Register with proper Nx module path: @game/feature-player/Player
 *     this.nxHelper.registerEntity(player, 'Player', {
 *       metadata: { health: 100 }
 *     });
 *
 *     return player;
 *   }
 * }
 * ```
 */
export class NxLibraryHelper {
  private readonly modulePath: string;

  constructor(
    private readonly threeLens: ThreeLensService,
    private readonly options: NxLibraryOptions
  ) {
    // Build module path like @scope/library-name
    this.modulePath = options.scope ? `@${options.scope}/${options.name}` : options.name;
  }

  /**
   * Get the full module path
   */
  get fullModulePath(): string {
    return this.modulePath;
  }

  /**
   * Register an entity with the Nx library's module path
   *
   * @param object The Three.js object to register
   * @param name Entity name (will be prefixed with module path)
   * @param options Additional entity options
   */
  registerEntity(
    object: THREE.Object3D,
    name: string,
    options: {
      metadata?: Record<string, unknown>;
      tags?: string[];
    } = {}
  ): void {
    const allTags = [
      ...(this.options.tags ?? []),
      ...(options.tags ?? []),
      this.options.type ?? 'unknown',
      `nx:${this.options.name}`,
    ];

    if (this.options.scope) {
      allTags.push(`scope:${this.options.scope}`);
    }

    this.threeLens.registerEntity(object, {
      name,
      module: this.modulePath,
      metadata: {
        ...options.metadata,
        __nx: {
          library: this.options.name,
          scope: this.options.scope,
          type: this.options.type,
        },
      },
      tags: allTags,
    });
  }

  /**
   * Unregister an entity
   */
  unregisterEntity(object: THREE.Object3D): void {
    this.threeLens.unregisterEntity(object);
  }

  /**
   * Create a scoped entity registrar for a specific component/feature
   *
   * @param componentName Name of the component or feature
   * @returns A registrar function that automatically includes the component name
   *
   * @example
   * ```typescript
   * const registerPlayerPart = nxHelper.createScopedRegistrar('PlayerCharacter');
   *
   * registerPlayerPart(headMesh, 'Head');    // @game/feature-player/PlayerCharacter/Head
   * registerPlayerPart(bodyMesh, 'Body');    // @game/feature-player/PlayerCharacter/Body
   * ```
   */
  createScopedRegistrar(
    componentName: string
  ): (
    object: THREE.Object3D,
    name: string,
    options?: { metadata?: Record<string, unknown>; tags?: string[] }
  ) => void {
    return (object, name, options = {}) => {
      this.registerEntity(object, `${componentName}/${name}`, {
        ...options,
        tags: [...(options.tags ?? []), `component:${componentName}`],
      });
    };
  }
}

/**
 * Factory function to create an NxLibraryHelper
 *
 * @example
 * ```typescript
 * const helper = createNxLibraryHelper(threeLensService, {
 *   name: 'feature-editor',
 *   scope: 'tools',
 *   type: 'feature'
 * });
 * ```
 */
export function createNxLibraryHelper(
  threeLens: ThreeLensService,
  options: NxLibraryOptions
): NxLibraryHelper {
  return new NxLibraryHelper(threeLens, options);
}

/**
 * Decorator to mark a class as an Nx library 3Lens integration
 *
 * Note: This is a documentation/typing helper and doesn't modify the class.
 * Use with ThreeLensService for actual integration.
 *
 * @example
 * ```typescript
 * @NxThreeLensLibrary({
 *   name: 'feature-terrain',
 *   scope: 'world',
 *   type: 'feature'
 * })
 * @Injectable()
 * export class TerrainService {
 *   // ...
 * }
 * ```
 */
export function NxThreeLensLibrary(options: NxLibraryOptions): ClassDecorator {
  return (target: object) => {
    // Store options as static metadata
    (target as Record<string, unknown>).__3lens_nx_options = options;
    // Return undefined - ClassDecorator expects void return type
    return undefined as unknown as void;
  };
}

