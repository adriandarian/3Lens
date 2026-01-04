# LogicalEntityManager Class

The `LogicalEntityManager` class manages logical entities in a Three.js scene. It allows you to group Three.js objects by their semantic meaning (e.g., "Player", "Enemy", "Terrain") rather than just their scene hierarchy.

## Overview

```typescript
import { LogicalEntityManager } from '@3lens/core';

const manager = new LogicalEntityManager();

// Register a player entity
const playerId = manager.registerLogicalEntity({
  name: 'Player',
  module: '@game/feature-player',
  componentType: 'PlayerComponent',
  tags: ['controllable', 'saveable'],
  metadata: { health: 100 },
});

// Add objects to the entity
manager.addObjectToEntity(playerId, playerMesh);
manager.addObjectToEntity(playerId, weaponMesh);

// Query entities
const gameEntities = manager.filterEntities({ modulePrefix: '@game/' });
const controllables = manager.filterEntities({ tags: ['controllable'] });

// Get module metrics
const playerModuleInfo = manager.getModuleInfo('@game/feature-player');
console.log('Player module triangles:', playerModuleInfo?.metrics.triangles);
```

::: tip Framework Integration
`LogicalEntityManager` is the foundation for framework bridges (`@3lens/react-bridge`, `@3lens/vue-bridge`, `@3lens/angular-bridge`). When using these bridges, entity management is handled automatically through hooks and directives.
:::

## Key Features

- **Semantic Grouping**: Group Three.js objects by their meaning, not hierarchy
- **Framework Integration**: Map React/Vue/Angular components to Three.js objects
- **Module-Level Metrics**: Aggregate performance data by module
- **Two-Way Navigation**: Navigate from objects to entities and vice versa
- **Event System**: Subscribe to entity lifecycle events
- **Filtering**: Query entities by module, tags, component type, and more

## API Reference

### Constructor

```typescript
new LogicalEntityManager()
```

Creates a new `LogicalEntityManager` instance with no initial entities.

### Properties

#### entityCount

```typescript
get entityCount(): number
```

Returns the total number of registered entities.

#### moduleCount

```typescript
get moduleCount(): number
```

Returns the total number of unique modules.

### Entity Registration Methods

#### registerLogicalEntity

Registers a new logical entity.

```typescript
registerLogicalEntity(options: LogicalEntityOptions): EntityId
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `LogicalEntityOptions` | Entity configuration |

**Returns:** `EntityId` - The unique identifier for the registered entity.

**Throws:** Error if an entity with the specified ID already exists.

See [registerLogicalEntity()](./register-logical-entity.md) for detailed documentation.

#### updateLogicalEntity

Updates an existing logical entity.

```typescript
updateLogicalEntity(
  entityId: EntityId,
  updates: Partial<Omit<LogicalEntityOptions, 'id'>>
): void
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `entityId` | `EntityId` | The entity to update |
| `updates` | `Partial<LogicalEntityOptions>` | Partial updates to apply |

**Throws:** Error if the entity is not found.

**Example:**

```typescript
// Update entity name and tags
manager.updateLogicalEntity(playerId, {
  name: 'Player (Admin)',
  tags: ['controllable', 'saveable', 'admin'],
});

// Move to a different module
manager.updateLogicalEntity(entityId, {
  module: '@game/feature-npcs',
});

// Add/update metadata
manager.updateLogicalEntity(entityId, {
  metadata: { level: 10, experience: 5000 },
});
```

#### unregisterLogicalEntity

Removes a logical entity.

```typescript
unregisterLogicalEntity(entityId: EntityId, recursive?: boolean): void
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `entityId` | `EntityId` | - | The entity to remove |
| `recursive` | `boolean` | `false` | Whether to also remove child entities |

**Behavior:**

- If `recursive` is `false`, child entities are moved to the parent
- If `recursive` is `true`, all descendants are also removed
- Object mappings are cleaned up automatically
- Does nothing if the entity doesn't exist

**Example:**

```typescript
// Remove single entity (children move to parent)
manager.unregisterLogicalEntity(entityId);

// Remove entity and all descendants
manager.unregisterLogicalEntity(entityId, true);
```

### Object Management Methods

#### addObjectToEntity

Associates a Three.js object with an entity.

```typescript
addObjectToEntity(entityId: EntityId, object: THREE.Object3D): void
```

See [Entity-Object Mapping](./entity-object-mapping.md) for detailed documentation.

#### removeObjectFromEntity

Removes a Three.js object from an entity.

```typescript
removeObjectFromEntity(entityId: EntityId, object: THREE.Object3D): void
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `entityId` | `EntityId` | The entity ID |
| `object` | `THREE.Object3D` | The object to remove |

**Behavior:**

- Removes the `__3lens_entity` metadata from the object's `userData`
- Does nothing if the entity or object mapping doesn't exist
- Emits an `'object-removed'` event

### Query Methods

#### getEntity

Gets an entity by its ID.

```typescript
getEntity(entityId: EntityId): LogicalEntity | undefined
```

#### getAllEntities

Gets all registered entities.

```typescript
getAllEntities(): LogicalEntity[]
```

#### getEntityByObject

Gets the entity associated with a Three.js object.

```typescript
getEntityByObject(object: THREE.Object3D): LogicalEntity | undefined
```

#### getEntityByComponentId

Gets the entity associated with a component instance ID.

```typescript
getEntityByComponentId(componentId: string): LogicalEntity | undefined
```

**Example:**

```typescript
// Find entity by React component instance
const entity = manager.getEntityByComponentId('player-component-123');
```

#### filterEntities

Filters entities by various criteria.

```typescript
filterEntities(filter: EntityFilter): LogicalEntity[]
```

See [Entity Filtering](./entity-filtering.md) for detailed documentation.

### Navigation Methods

#### navigateFromObject

Navigates from a Three.js object to its entity and related information.

```typescript
navigateFromObject(object: THREE.Object3D): NavigationResult
```

See [Entity-Object Mapping](./entity-object-mapping.md) for detailed documentation.

#### navigateFromComponent

Navigates from a component ID to its entity and related information.

```typescript
navigateFromComponent(componentId: string): NavigationResult
```

**Returns:** `NavigationResult` with entity info, objects, module, ancestors, and children.

#### navigateFromEntity

Navigates from an entity ID to full navigation information.

```typescript
navigateFromEntity(entityId: EntityId): NavigationResult
```

### Module Methods

#### getAllModules

Gets all unique module IDs.

```typescript
getAllModules(): ModuleId[]
```

#### getModuleInfo

Gets module information with aggregated metrics.

```typescript
getModuleInfo(moduleId: ModuleId): ModuleInfo | undefined
```

See [Module Metrics](./module-metrics.md) for detailed documentation.

#### getAllModuleInfo

Gets information for all modules.

```typescript
getAllModuleInfo(): ModuleInfo[]
```

### Event Methods

#### onEntityEvent

Subscribes to entity lifecycle events.

```typescript
onEntityEvent(callback: EntityEventCallback): () => void
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | `EntityEventCallback` | Function called on events |

**Returns:** Unsubscribe function.

**Event Types:**

| Event | Description |
|-------|-------------|
| `'registered'` | Entity was created |
| `'updated'` | Entity properties changed |
| `'unregistered'` | Entity was removed |
| `'object-added'` | Object added to entity |
| `'object-removed'` | Object removed from entity |

**Example:**

```typescript
const unsubscribe = manager.onEntityEvent((event) => {
  console.log(`Entity ${event.entityId} - ${event.type}`);
  
  if (event.type === 'object-added') {
    console.log('Object UUID:', event.details?.objectUuid);
  }
});

// Later: stop listening
unsubscribe();
```

### Utility Methods

#### clear

Removes all entities.

```typescript
clear(): void
```

## Types

### LogicalEntity

```typescript
interface LogicalEntity {
  id: EntityId;
  name: string;
  module: ModuleId | null;
  componentType: string | null;
  componentId: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  objects: THREE.Object3D[];
  objectUuids: string[];
  parentEntityId: EntityId | null;
  childEntityIds: EntityId[];
  registeredAt: number;
  updatedAt: number;
}
```

### NavigationResult

```typescript
interface NavigationResult {
  entity: LogicalEntity | null;
  objects: THREE.Object3D[];
  module: ModuleInfo | null;
  ancestors: LogicalEntity[];
  children: LogicalEntity[];
}
```

### EntityEvent

```typescript
interface EntityEvent {
  type: EntityEventType;
  entityId: EntityId;
  entity: LogicalEntity;
  timestamp: number;
  details?: Record<string, unknown>;
}
```

## Usage with DevtoolProbe

When using `DevtoolProbe`, the entity manager is available via the probe:

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({ /* config */ });

// Access entity manager methods through probe
probe.registerLogicalEntity({ name: 'Player', module: '@game/player' });
const entities = probe.filterEntities({ module: '@game/player' });
```

## See Also

- [registerLogicalEntity()](./register-logical-entity.md) - Full registration options
- [Entity-Object Mapping](./entity-object-mapping.md) - Two-way navigation
- [Module Metrics](./module-metrics.md) - Module-level performance data
- [Entity Filtering](./entity-filtering.md) - Querying entities
- [React Bridge](/guides/REACT-R3F-GUIDE.md) - React integration
- [Vue Bridge](/guides/VUE-TRESJS-GUIDE.md) - Vue integration
- [Angular Bridge](/guides/ANGULAR-GUIDE.md) - Angular integration
