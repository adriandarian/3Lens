# registerLogicalEntity()

The `registerLogicalEntity()` method creates a new logical entity that maps semantic concepts from your application to Three.js objects in the scene.

## Overview

```typescript
import { LogicalEntityManager } from '@3lens/core';

const manager = new LogicalEntityManager();

const entityId = manager.registerLogicalEntity({
  name: 'Player Character',
  module: '@game/feature-player',
  componentType: 'PlayerComponent',
  componentId: 'player-123',
  tags: ['controllable', 'saveable', 'physics'],
  metadata: {
    health: 100,
    level: 5,
    team: 'blue',
  },
  parentEntityId: 'game-world-entity',
});
```

## Signature

```typescript
registerLogicalEntity(options: LogicalEntityOptions): EntityId
```

**Returns:** `EntityId` - A unique string identifier for the registered entity.

**Throws:** `Error` if an entity with the specified `id` already exists.

## LogicalEntityOptions

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Human-readable name for the entity |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `EntityId` | Auto-generated | Unique identifier |
| `module` | `ModuleId` | `null` | Module for grouping/filtering |
| `componentType` | `string` | `null` | Component type name |
| `componentId` | `string` | `null` | Component instance ID |
| `tags` | `string[]` | `[]` | Tags for filtering |
| `metadata` | `Record<string, unknown>` | `{}` | Custom data |
| `parentEntityId` | `EntityId` | `null` | Parent entity for hierarchy |

## Property Details

### name

A human-readable display name for the entity. This appears in the 3Lens inspector UI.

```typescript
manager.registerLogicalEntity({
  name: 'Enemy Tank #42',
  // ...
});
```

### id

An optional unique identifier. If not provided, one is auto-generated.

```typescript
// Auto-generated ID
const id1 = manager.registerLogicalEntity({ name: 'Auto ID' });
// Returns: "entity-1735123456789-a1b2c3d4e"

// Custom ID
const id2 = manager.registerLogicalEntity({
  id: 'player-main',
  name: 'Main Player',
});
// Returns: "player-main"
```

::: warning
Using a duplicate ID throws an error. Check with `manager.getEntity(id)` before using custom IDs.
:::

### module

A module identifier for grouping entities. Recommended format: `@scope/feature-name` or `category/name`.

```typescript
// Scoped module format (recommended)
manager.registerLogicalEntity({
  name: 'Player',
  module: '@game/feature-player',
});

// Category format
manager.registerLogicalEntity({
  name: 'Health Bar',
  module: 'ui/hud',
});

// Hierarchical modules
manager.registerLogicalEntity({ name: 'Main Character', module: '@game/characters/player' });
manager.registerLogicalEntity({ name: 'Enemy 1', module: '@game/characters/enemies' });
manager.registerLogicalEntity({ name: 'NPC 1', module: '@game/characters/npcs' });
```

Module benefits:
- Filter entities by module: `filterEntities({ module: '@game/feature-player' })`
- Filter by prefix: `filterEntities({ modulePrefix: '@game/' })`
- Aggregate metrics: `getModuleInfo('@game/feature-player')`

### componentType

The component type or class name. Useful for framework integration and filtering.

```typescript
// React component
manager.registerLogicalEntity({
  name: 'Player',
  componentType: 'PlayerController',
});

// Angular component
manager.registerLogicalEntity({
  name: 'Enemy',
  componentType: 'EnemyComponent',
});

// Filter by component type
const enemies = manager.filterEntities({
  componentType: 'EnemyComponent',
});
```

### componentId

A unique identifier for a specific component instance. Essential for framework bridges.

```typescript
// React: Use hook-generated ID
const componentId = useId();
manager.registerLogicalEntity({
  name: 'Player',
  componentId,
});

// Later: Find entity by component
const entity = manager.getEntityByComponentId(componentId);
```

::: tip Framework Bridges
When using `@3lens/react-bridge`, `@3lens/vue-bridge`, or `@3lens/angular-bridge`, component IDs are managed automatically.
:::

### tags

An array of string tags for flexible categorization and filtering.

```typescript
manager.registerLogicalEntity({
  name: 'Player',
  tags: ['controllable', 'saveable', 'physics', 'collidable'],
});

manager.registerLogicalEntity({
  name: 'Decoration',
  tags: ['static', 'non-interactive'],
});

// Filter by ALL tags (AND logic)
const saveable = manager.filterEntities({
  tags: ['controllable', 'saveable'],
});

// Filter by ANY tag (OR logic)
const interactive = manager.filterEntities({
  anyTag: ['controllable', 'clickable'],
});
```

Common tag patterns:
- **Behavior**: `controllable`, `physics`, `animated`, `ai-controlled`
- **Persistence**: `saveable`, `networked`, `serializable`
- **Interaction**: `selectable`, `draggable`, `clickable`
- **Categories**: `enemy`, `friendly`, `neutral`, `environment`

### metadata

Custom key-value data that appears in the inspector and can be updated later.

```typescript
manager.registerLogicalEntity({
  name: 'Player',
  metadata: {
    health: 100,
    maxHealth: 100,
    level: 5,
    inventory: ['sword', 'shield'],
    position: { x: 0, y: 0, z: 0 },
    debugInfo: {
      lastDamageSource: 'enemy-42',
      stateHistory: [],
    },
  },
});

// Update metadata later
manager.updateLogicalEntity(entityId, {
  metadata: { health: 50 },
});
```

::: info
Metadata is merged when updating. Existing keys not in the update are preserved.
:::

### parentEntityId

Links this entity to a parent entity, creating a hierarchy.

```typescript
// Create parent entity
const worldId = manager.registerLogicalEntity({
  name: 'Game World',
  module: '@game/world',
});

// Create child entities
const playerId = manager.registerLogicalEntity({
  name: 'Player',
  parentEntityId: worldId,
});

const inventoryId = manager.registerLogicalEntity({
  name: 'Player Inventory',
  parentEntityId: playerId,
});

// Navigate hierarchy
const result = manager.navigateFromEntity(inventoryId);
console.log(result.ancestors); // [Game World, Player]
console.log(result.children);  // []
```

## Complete Example

```typescript
import { LogicalEntityManager } from '@3lens/core';
import * as THREE from 'three';

const manager = new LogicalEntityManager();

// Create game world entity
const worldId = manager.registerLogicalEntity({
  id: 'game-world',
  name: 'Game World',
  module: '@game/world',
  tags: ['root', 'container'],
  metadata: {
    levelName: 'Forest Stage',
    difficulty: 'normal',
  },
});

// Create player entity
const playerId = manager.registerLogicalEntity({
  name: 'Player Character',
  module: '@game/feature-player',
  componentType: 'PlayerController',
  componentId: 'player-main-123',
  tags: ['controllable', 'saveable', 'physics'],
  metadata: {
    health: 100,
    stamina: 50,
    equipment: {
      weapon: 'sword',
      armor: 'leather',
    },
  },
  parentEntityId: worldId,
});

// Add Three.js objects to the entity
const playerMesh = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.5, 1.5),
  new THREE.MeshStandardMaterial({ color: 0x0077ff })
);
const weaponMesh = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 1, 0.1),
  new THREE.MeshStandardMaterial({ color: 0x888888 })
);

manager.addObjectToEntity(playerId, playerMesh);
manager.addObjectToEntity(playerId, weaponMesh);

// Create enemy entities
for (let i = 0; i < 5; i++) {
  const enemyId = manager.registerLogicalEntity({
    name: `Enemy ${i + 1}`,
    module: '@game/feature-enemies',
    componentType: 'EnemyAI',
    tags: ['hostile', 'physics', 'ai-controlled'],
    metadata: {
      health: 50,
      damage: 10,
      patrolRoute: [`point-${i}-a`, `point-${i}-b`],
    },
    parentEntityId: worldId,
  });

  const enemyMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  manager.addObjectToEntity(enemyId, enemyMesh);
}

// Query entities
const allEnemies = manager.filterEntities({ module: '@game/feature-enemies' });
console.log(`Total enemies: ${allEnemies.length}`);

const aiEntities = manager.filterEntities({ tags: ['ai-controlled'] });
console.log(`AI-controlled entities: ${aiEntities.length}`);
```

## Event on Registration

When an entity is registered, a `'registered'` event is emitted:

```typescript
manager.onEntityEvent((event) => {
  if (event.type === 'registered') {
    console.log(`Entity registered: ${event.entity.name}`);
    console.log(`ID: ${event.entityId}`);
    console.log(`Module: ${event.entity.module}`);
  }
});
```

## See Also

- [LogicalEntityManager](./logical-entity-manager.md) - Full manager API
- [Entity-Object Mapping](./entity-object-mapping.md) - Adding objects to entities
- [Entity Filtering](./entity-filtering.md) - Querying entities
- [Module Metrics](./module-metrics.md) - Module-level aggregation
