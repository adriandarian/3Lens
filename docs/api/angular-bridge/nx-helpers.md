# Nx Workspace Helpers

The Angular bridge includes helpers for integrating 3Lens with Nx monorepo workspaces. These utilities provide consistent module paths and metadata for entities registered from different Nx libraries.

## Overview

When working in an Nx workspace with multiple libraries, you want entities from different libraries to be clearly identified in the devtools. The Nx helpers automatically prefix entity names with library paths like `@scope/library-name`.

## NxLibraryHelper

A helper class for registering Three.js objects with proper Nx library module paths.

### Import

```typescript
import { NxLibraryHelper } from '@3lens/angular-bridge';
```

### Constructor

```typescript
new NxLibraryHelper(threeLens: ThreeLensService, options: NxLibraryOptions)
```

### NxLibraryOptions

```typescript
interface NxLibraryOptions {
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
```

### Usage

```typescript
import { Injectable } from '@angular/core';
import { ThreeLensService, NxLibraryHelper } from '@3lens/angular-bridge';
import * as THREE from 'three';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private nxHelper: NxLibraryHelper;

  constructor(private threeLens: ThreeLensService) {
    this.nxHelper = new NxLibraryHelper(threeLens, {
      name: 'feature-player',
      scope: 'game',
      type: 'feature'
    });
  }

  createPlayer(): THREE.Object3D {
    const player = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.5, 1),
      new THREE.MeshStandardMaterial({ color: 'blue' })
    );

    // Registers with module path: @game/feature-player
    this.nxHelper.registerEntity(player, 'Player', {
      metadata: { health: 100, level: 1 }
    });

    return player;
  }
}
```

### Methods

#### registerEntity

Register an entity with the library's module path.

```typescript
registerEntity(
  object: THREE.Object3D,
  name: string,
  options?: {
    metadata?: Record<string, unknown>;
    tags?: string[];
  }
): void
```

**Example:**

```typescript
this.nxHelper.registerEntity(mesh, 'Enemy', {
  metadata: { health: 50 },
  tags: ['hostile']
});
// Module path: @game/feature-enemies/Enemy
// Tags: ['hostile', 'feature', 'nx:feature-enemies', 'scope:game']
```

#### unregisterEntity

Unregister an entity.

```typescript
unregisterEntity(object: THREE.Object3D): void
```

#### createScopedRegistrar

Create a registrar function scoped to a specific component.

```typescript
createScopedRegistrar(componentName: string): (
  object: THREE.Object3D,
  name: string,
  options?: { metadata?: Record<string, unknown>; tags?: string[] }
) => void
```

**Example:**

```typescript
const registerPart = this.nxHelper.createScopedRegistrar('PlayerCharacter');

registerPart(headMesh, 'Head');   // @game/feature-player/PlayerCharacter/Head
registerPart(bodyMesh, 'Body');   // @game/feature-player/PlayerCharacter/Body
registerPart(armsMesh, 'Arms');   // @game/feature-player/PlayerCharacter/Arms
```

#### fullModulePath

Get the computed module path.

```typescript
get fullModulePath(): string;
// Returns: '@game/feature-player' (with scope) or 'feature-player' (without)
```

---

## createNxLibraryHelper

Factory function to create an `NxLibraryHelper` instance.

### Import

```typescript
import { createNxLibraryHelper } from '@3lens/angular-bridge';
```

### Usage

```typescript
import { Injectable } from '@angular/core';
import { ThreeLensService, createNxLibraryHelper } from '@3lens/angular-bridge';

@Injectable()
export class TerrainService {
  private helper = createNxLibraryHelper(this.threeLens, {
    name: 'feature-terrain',
    scope: 'world',
    type: 'feature'
  });

  constructor(private threeLens: ThreeLensService) {}

  createTerrain() {
    const terrain = new THREE.Mesh(/* ... */);
    this.helper.registerEntity(terrain, 'MainTerrain');
    return terrain;
  }
}
```

---

## NxThreeLensLibrary

A decorator to mark a class as an Nx library 3Lens integration. This is primarily for documentation and type metadata purposes.

### Import

```typescript
import { NxThreeLensLibrary } from '@3lens/angular-bridge';
```

### Usage

```typescript
import { Injectable } from '@angular/core';
import { NxThreeLensLibrary, ThreeLensService } from '@3lens/angular-bridge';

@NxThreeLensLibrary({
  name: 'feature-weapons',
  scope: 'game',
  type: 'feature'
})
@Injectable()
export class WeaponsService {
  constructor(private threeLens: ThreeLensService) {}
  // ...
}
```

### Note

The decorator stores options as static metadata (`__3lens_nx_options`) but doesn't modify runtime behavior. Use `NxLibraryHelper` for actual entity registration.

---

## Examples

### Multi-Library Game Project

```typescript
// libs/game/feature-player/src/lib/player.service.ts
@Injectable({ providedIn: 'root' })
export class PlayerService {
  private nxHelper = new NxLibraryHelper(this.threeLens, {
    name: 'feature-player',
    scope: 'game',
    type: 'feature',
    tags: ['core-gameplay']
  });

  constructor(private threeLens: ThreeLensService) {}

  createPlayer(): THREE.Group {
    const group = new THREE.Group();
    
    const body = new THREE.Mesh(/* ... */);
    const weapon = new THREE.Mesh(/* ... */);
    
    this.nxHelper.registerEntity(body, 'PlayerBody');
    this.nxHelper.registerEntity(weapon, 'PlayerWeapon');
    
    group.add(body, weapon);
    return group;
  }
}

// libs/game/feature-enemies/src/lib/enemy.service.ts
@Injectable({ providedIn: 'root' })
export class EnemyService {
  private nxHelper = new NxLibraryHelper(this.threeLens, {
    name: 'feature-enemies',
    scope: 'game',
    type: 'feature'
  });

  constructor(private threeLens: ThreeLensService) {}

  spawnEnemy(id: number, type: string): THREE.Object3D {
    const enemy = new THREE.Mesh(/* ... */);
    
    this.nxHelper.registerEntity(enemy, `Enemy_${id}`, {
      metadata: { type, health: 100 },
      tags: [type]
    });
    
    return enemy;
  }
}
```

### UI Library

```typescript
// libs/shared/ui-hud/src/lib/hud.service.ts
@Injectable({ providedIn: 'root' })
export class HudService {
  private nxHelper = new NxLibraryHelper(this.threeLens, {
    name: 'ui-hud',
    scope: 'shared',
    type: 'ui'
  });

  constructor(private threeLens: ThreeLensService) {}

  createHealthBar(): THREE.Sprite {
    const healthBar = new THREE.Sprite(/* ... */);
    
    this.nxHelper.registerEntity(healthBar, 'HealthBar', {
      tags: ['overlay', 'always-visible']
    });
    
    return healthBar;
  }
}
```

### Complex Entity with Scoped Registrar

```typescript
@Injectable()
export class VehicleService {
  private nxHelper = new NxLibraryHelper(this.threeLens, {
    name: 'feature-vehicles',
    scope: 'game',
    type: 'feature'
  });

  constructor(private threeLens: ThreeLensService) {}

  createVehicle(vehicleId: string): THREE.Group {
    const register = this.nxHelper.createScopedRegistrar(`Vehicle_${vehicleId}`);
    
    const vehicle = new THREE.Group();
    
    const chassis = new THREE.Mesh(/* ... */);
    const wheel1 = new THREE.Mesh(/* ... */);
    const wheel2 = new THREE.Mesh(/* ... */);
    const wheel3 = new THREE.Mesh(/* ... */);
    const wheel4 = new THREE.Mesh(/* ... */);
    
    // All registered under @game/feature-vehicles/Vehicle_123/...
    register(chassis, 'Chassis', { metadata: { material: 'steel' } });
    register(wheel1, 'WheelFL', { tags: ['front', 'left'] });
    register(wheel2, 'WheelFR', { tags: ['front', 'right'] });
    register(wheel3, 'WheelRL', { tags: ['rear', 'left'] });
    register(wheel4, 'WheelRR', { tags: ['rear', 'right'] });
    
    vehicle.add(chassis, wheel1, wheel2, wheel3, wheel4);
    return vehicle;
  }
}
```

## Auto-Generated Tags

When using `NxLibraryHelper`, these tags are automatically added:

| Tag Pattern | Example | Description |
|-------------|---------|-------------|
| `nx:{name}` | `nx:feature-player` | Library name |
| `scope:{scope}` | `scope:game` | Scope (if provided) |
| `{type}` | `feature` | Library type |

Plus any custom tags you provide.

## Related

- [ThreeLensService](./three-lens-service.md) - Main service
- [ThreeLensEntityDirective](./entity-directive.md) - Directive for entity registration
- [Entity Registration](/api/core/register-logical-entity) - Core entity system
