# Entity Filtering

The `filterEntities()` method provides powerful querying capabilities to find entities based on various criteria including module, tags, component type, and custom metadata.

## Overview

```typescript
import { LogicalEntityManager } from '@3lens/core';

const manager = new LogicalEntityManager();

// Filter by module
const playerEntities = manager.filterEntities({ 
  module: '@game/feature-player' 
});

// Filter by module prefix
const allGameEntities = manager.filterEntities({ 
  modulePrefix: '@game/' 
});

// Filter by tags (AND logic - must have ALL tags)
const saveablePhysics = manager.filterEntities({ 
  tags: ['saveable', 'physics'] 
});

// Filter by any tag (OR logic - must have at least ONE tag)
const interactive = manager.filterEntities({ 
  anyTag: ['clickable', 'draggable', 'selectable'] 
});

// Combine filters
const result = manager.filterEntities({
  modulePrefix: '@game/',
  tags: ['physics'],
  hasObjects: true,
});
```

## Signature

```typescript
filterEntities(filter: EntityFilter): LogicalEntity[]
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `filter` | `EntityFilter` | Filter criteria |

**Returns:** `LogicalEntity[]` - Array of matching entities (may be empty).

## EntityFilter Interface

```typescript
interface EntityFilter {
  /** Exact module match */
  module?: ModuleId;
  
  /** Module prefix match (e.g., '@game/' matches '@game/player') */
  modulePrefix?: string;
  
  /** Must have ALL specified tags (AND logic) */
  tags?: string[];
  
  /** Must have at least ONE specified tag (OR logic) */
  anyTag?: string[];
  
  /** Must have this component type */
  componentType?: string;
  
  /** Name must contain this string (case-insensitive) */
  nameContains?: string;
  
  /** Must have all these metadata keys */
  hasMetadata?: string[];
  
  /** Must have at least one Three.js object */
  hasObjects?: boolean;
}
```

## Filter Types

### Module Filtering

#### Exact Module Match

```typescript
// Only entities with exactly this module
const players = manager.filterEntities({ 
  module: '@game/feature-player' 
});
```

#### Module Prefix Match

```typescript
// All entities in any @game/* module
const gameEntities = manager.filterEntities({ 
  modulePrefix: '@game/' 
});

// All character entities
const characters = manager.filterEntities({ 
  modulePrefix: '@game/characters/' 
});
```

### Tag Filtering

#### All Tags (AND Logic)

Use `tags` when entities must have **ALL** specified tags:

```typescript
// Must have BOTH 'physics' AND 'saveable'
const entities = manager.filterEntities({ 
  tags: ['physics', 'saveable'] 
});
```

#### Any Tag (OR Logic)

Use `anyTag` when entities must have **at least one** of the specified tags:

```typescript
// Must have 'enemy' OR 'hostile' OR 'dangerous'
const threats = manager.filterEntities({ 
  anyTag: ['enemy', 'hostile', 'dangerous'] 
});
```

#### Combining Both

```typescript
// Must have 'physics' AND either 'enemy' OR 'projectile'
const physicsThreats = manager.filterEntities({
  tags: ['physics'],
  anyTag: ['enemy', 'projectile'],
});
```

### Component Type Filtering

Filter by the framework component type:

```typescript
// All entities created by PlayerController components
const playerControllers = manager.filterEntities({ 
  componentType: 'PlayerController' 
});

// All enemy AI entities
const enemyAIs = manager.filterEntities({ 
  componentType: 'EnemyAI' 
});
```

### Name Filtering

Search by entity name (case-insensitive partial match):

```typescript
// Find all entities with "enemy" in the name
const enemies = manager.filterEntities({ 
  nameContains: 'enemy' 
});
// Matches: "Enemy 1", "Flying Enemy", "enemy_goblin"

// Find all "Boss" entities
const bosses = manager.filterEntities({ 
  nameContains: 'boss' 
});
```

### Metadata Filtering

Filter by presence of metadata keys:

```typescript
// Entities that have 'health' metadata
const withHealth = manager.filterEntities({ 
  hasMetadata: ['health'] 
});

// Entities with both 'health' AND 'inventory' metadata
const players = manager.filterEntities({ 
  hasMetadata: ['health', 'inventory'] 
});
```

### Object Filtering

Filter to only entities that have Three.js objects:

```typescript
// Only entities with at least one object
const rendered = manager.filterEntities({ 
  hasObjects: true 
});
```

## Combining Filters

All filter criteria are combined with AND logic:

```typescript
// Complex query: All rendered enemies in game modules with physics
const result = manager.filterEntities({
  modulePrefix: '@game/',           // AND in game module
  tags: ['physics'],                // AND has physics tag
  anyTag: ['enemy', 'hostile'],     // AND has enemy OR hostile tag
  componentType: 'EnemyAI',         // AND created by EnemyAI component
  hasObjects: true,                 // AND has rendered objects
});
```

## Common Patterns

### Finding Entities by Category

```typescript
// Define entity categories
const ENTITY_CATEGORIES = {
  controllable: { tags: ['controllable'] },
  saveable: { tags: ['saveable'] },
  enemies: { modulePrefix: '@game/enemies/' },
  ui: { modulePrefix: '@ui/' },
  physics: { tags: ['physics', 'collidable'] },
};

function getEntitiesByCategory(category: keyof typeof ENTITY_CATEGORIES) {
  return manager.filterEntities(ENTITY_CATEGORIES[category]);
}

// Usage
const controllable = getEntitiesByCategory('controllable');
const enemies = getEntitiesByCategory('enemies');
```

### Searching Entities

```typescript
function searchEntities(query: string): LogicalEntity[] {
  const byName = manager.filterEntities({ nameContains: query });
  
  // Also search by tag
  const byTag = manager.filterEntities({ anyTag: [query.toLowerCase()] });
  
  // Deduplicate
  const seen = new Set<string>();
  const results: LogicalEntity[] = [];
  
  for (const entity of [...byName, ...byTag]) {
    if (!seen.has(entity.id)) {
      seen.add(entity.id);
      results.push(entity);
    }
  }
  
  return results;
}
```

### Filtering for Game Logic

```typescript
// Find all enemies within range of player
function getEnemiesInRange(playerPosition: THREE.Vector3, range: number) {
  const enemies = manager.filterEntities({
    anyTag: ['enemy', 'hostile'],
    hasObjects: true,
  });
  
  return enemies.filter(entity => {
    for (const obj of entity.objects) {
      const distance = obj.position.distanceTo(playerPosition);
      if (distance <= range) {
        return true;
      }
    }
    return false;
  });
}

// Find all interactable objects near player
function getNearbyInteractables(playerPosition: THREE.Vector3) {
  const interactables = manager.filterEntities({
    anyTag: ['interactable', 'pickup', 'usable'],
    hasObjects: true,
  });
  
  return interactables
    .map(entity => ({
      entity,
      distance: Math.min(
        ...entity.objects.map(o => o.position.distanceTo(playerPosition))
      ),
    }))
    .filter(item => item.distance < 3)
    .sort((a, b) => a.distance - b.distance);
}
```

### Batch Operations

```typescript
// Hide all entities in a module
function hideModule(moduleId: ModuleId) {
  const entities = manager.filterEntities({ module: moduleId });
  
  for (const entity of entities) {
    for (const obj of entity.objects) {
      obj.visible = false;
    }
  }
}

// Disable physics for all static objects
function freezeStaticObjects() {
  const staticEntities = manager.filterEntities({
    tags: ['static'],
    anyTag: ['physics', 'collidable'],
  });
  
  for (const entity of staticEntities) {
    // Update metadata to disable physics
    manager.updateLogicalEntity(entity.id, {
      metadata: { physicsEnabled: false },
    });
  }
}

// Cleanup all temporary entities
function cleanupTemporary() {
  const temporary = manager.filterEntities({
    anyTag: ['temporary', 'fx', 'particle'],
  });
  
  for (const entity of temporary) {
    manager.unregisterLogicalEntity(entity.id);
  }
}
```

### Inspector Integration

```typescript
// Build filter UI
interface FilterState {
  module: string;
  tags: string[];
  search: string;
  onlyWithObjects: boolean;
}

function applyFilters(state: FilterState): LogicalEntity[] {
  const filter: EntityFilter = {};
  
  if (state.module) {
    if (state.module.endsWith('*')) {
      filter.modulePrefix = state.module.slice(0, -1);
    } else {
      filter.module = state.module;
    }
  }
  
  if (state.tags.length > 0) {
    filter.tags = state.tags;
  }
  
  if (state.search) {
    filter.nameContains = state.search;
  }
  
  if (state.onlyWithObjects) {
    filter.hasObjects = true;
  }
  
  return manager.filterEntities(filter);
}
```

### Statistics

```typescript
// Get statistics for filtered entities
function getFilterStats(filter: EntityFilter) {
  const entities = manager.filterEntities(filter);
  
  let totalTriangles = 0;
  let totalObjects = 0;
  const modules = new Set<string>();
  const tags = new Set<string>();
  
  for (const entity of entities) {
    totalObjects += entity.objects.length;
    
    if (entity.module) {
      modules.add(entity.module);
    }
    
    for (const tag of entity.tags) {
      tags.add(tag);
    }
    
    // Count triangles
    for (const obj of entity.objects) {
      if ((obj as THREE.Mesh).geometry) {
        const geo = (obj as THREE.Mesh).geometry;
        const position = geo.attributes?.position;
        if (position) {
          totalTriangles += (geo.index?.count ?? position.count) / 3;
        }
      }
    }
  }
  
  return {
    entityCount: entities.length,
    objectCount: totalObjects,
    triangleCount: Math.round(totalTriangles),
    moduleCount: modules.size,
    uniqueTags: Array.from(tags),
  };
}
```

## Performance Tips

1. **Be specific**: More specific filters are faster
2. **Use modulePrefix wisely**: Prefix matching is efficient
3. **Combine filters**: One call with multiple criteria is better than multiple calls
4. **Cache results**: If filtering frequently with same criteria, cache the results

```typescript
// Good: Single specific filter
const enemies = manager.filterEntities({
  module: '@game/enemies',
  hasObjects: true,
});

// Less efficient: Multiple filter calls
const allEnemies = manager.filterEntities({ module: '@game/enemies' });
const withObjects = allEnemies.filter(e => e.objects.length > 0);
```

## Integration with DevtoolProbe

When using `DevtoolProbe`, filtering is available directly:

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({ /* config */ });

// Filter through probe
const enemies = probe.filterEntities({ 
  modulePrefix: '@game/',
  tags: ['enemy'],
});
```

## See Also

- [LogicalEntityManager](./logical-entity-manager.md) - Full manager API
- [registerLogicalEntity()](./register-logical-entity.md) - Creating entities with tags/modules
- [Module Metrics](./module-metrics.md) - Module-level aggregation
- [Entity-Object Mapping](./entity-object-mapping.md) - Working with filtered entities
