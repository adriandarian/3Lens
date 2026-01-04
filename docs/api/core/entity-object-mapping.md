# Entity-Object Mapping

3Lens provides two-way navigation between logical entities and Three.js objects. This enables you to seamlessly move between your application's semantic concepts (players, enemies, UI elements) and the underlying 3D scene graph.

## Overview

```typescript
import { LogicalEntityManager } from '@3lens/core';
import * as THREE from 'three';

const manager = new LogicalEntityManager();

// Create entity
const playerId = manager.registerLogicalEntity({
  name: 'Player',
  module: '@game/player',
});

// Map Three.js objects to entity
const playerMesh = new THREE.Mesh(geometry, material);
manager.addObjectToEntity(playerId, playerMesh);

// Navigate from object → entity
const entity = manager.getEntityByObject(playerMesh);
console.log(entity?.name); // "Player"

// Navigate from entity → objects
const result = manager.navigateFromEntity(playerId);
console.log(result.objects); // [playerMesh]
```

## Adding Objects to Entities

### addObjectToEntity

Associates a Three.js object with a logical entity.

```typescript
addObjectToEntity(entityId: EntityId, object: THREE.Object3D): void
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `entityId` | `EntityId` | The entity to add the object to |
| `object` | `THREE.Object3D` | Any Three.js object |

**Behavior:**

1. Adds the object to the entity's `objects` array
2. Stores the object's UUID in `objectUuids` for serialization
3. Sets entity metadata in `object.userData.__3lens_entity`
4. Emits an `'object-added'` event

**Example:**

```typescript
const entityId = manager.registerLogicalEntity({
  name: 'Vehicle',
  module: '@game/vehicles',
});

// Add multiple objects to one entity
const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);

manager.addObjectToEntity(entityId, carBody);
manager.addObjectToEntity(entityId, wheel1);
manager.addObjectToEntity(entityId, wheel2);
manager.addObjectToEntity(entityId, wheel3);
manager.addObjectToEntity(entityId, wheel4);

const entity = manager.getEntity(entityId);
console.log(entity?.objects.length); // 5
```

### Object UserData

When an object is added to an entity, 3Lens stores metadata in the object's `userData`:

```typescript
manager.addObjectToEntity(entityId, mesh);

console.log(mesh.userData.__3lens_entity);
// {
//   entityId: "entity-1234...",
//   entityName: "Player",
//   module: "@game/player"
// }
```

This allows 3Lens to quickly look up entity information when inspecting objects in the scene.

::: tip
The `__3lens_entity` property is automatically removed when calling `removeObjectFromEntity()`.
:::

### removeObjectFromEntity

Removes a Three.js object from an entity.

```typescript
removeObjectFromEntity(entityId: EntityId, object: THREE.Object3D): void
```

**Example:**

```typescript
// Remove single object
manager.removeObjectFromEntity(entityId, oldMesh);

// Replace mesh
manager.removeObjectFromEntity(entityId, lowPolyMesh);
manager.addObjectToEntity(entityId, highPolyMesh);
```

## Navigating from Objects to Entities

### getEntityByObject

Gets the entity associated with a Three.js object.

```typescript
getEntityByObject(object: THREE.Object3D): LogicalEntity | undefined
```

**Example:**

```typescript
// In a raycasting scenario
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(scene.children, true);

if (intersects.length > 0) {
  const hitObject = intersects[0].object;
  const entity = manager.getEntityByObject(hitObject);
  
  if (entity) {
    console.log(`Clicked on: ${entity.name}`);
    console.log(`Module: ${entity.module}`);
    console.log(`Tags: ${entity.tags.join(', ')}`);
  }
}
```

### navigateFromObject

Gets comprehensive navigation information starting from a Three.js object.

```typescript
navigateFromObject(object: THREE.Object3D): NavigationResult
```

**Returns:**

```typescript
interface NavigationResult {
  /** The logical entity (null if object has no entity) */
  entity: LogicalEntity | null;
  
  /** All objects belonging to this entity */
  objects: THREE.Object3D[];
  
  /** Module information (null if no module) */
  module: ModuleInfo | null;
  
  /** Ancestor entities from root to parent */
  ancestors: LogicalEntity[];
  
  /** Direct child entities */
  children: LogicalEntity[];
}
```

**Example:**

```typescript
const result = manager.navigateFromObject(playerMesh);

if (result.entity) {
  console.log(`Entity: ${result.entity.name}`);
  console.log(`Total objects: ${result.objects.length}`);
  
  if (result.module) {
    console.log(`Module: ${result.module.id}`);
    console.log(`Module triangles: ${result.module.metrics.triangles}`);
  }
  
  if (result.ancestors.length > 0) {
    const path = result.ancestors.map(e => e.name).join(' > ');
    console.log(`Path: ${path} > ${result.entity.name}`);
  }
}
```

## Navigating from Entities to Objects

### navigateFromEntity

Gets navigation information for an entity by ID.

```typescript
navigateFromEntity(entityId: EntityId): NavigationResult
```

**Example:**

```typescript
const result = manager.navigateFromEntity(playerId);

// Access all Three.js objects
for (const obj of result.objects) {
  // Highlight all player meshes
  if ((obj as THREE.Mesh).material) {
    (obj as THREE.Mesh).material.emissive?.setHex(0x333333);
  }
}

// Access child entities
for (const child of result.children) {
  console.log(`Child entity: ${child.name}`);
}
```

### Direct Object Access

You can also access objects directly from the entity:

```typescript
const entity = manager.getEntity(playerId);

if (entity) {
  // Objects array
  for (const obj of entity.objects) {
    obj.visible = false;
  }
  
  // Object UUIDs (for serialization)
  console.log(entity.objectUuids);
}
```

## Navigating from Components

### getEntityByComponentId

Finds an entity by its component instance ID.

```typescript
getEntityByComponentId(componentId: string): LogicalEntity | undefined
```

**Example:**

```typescript
// React component
function PlayerController() {
  const componentId = useId();
  
  useEffect(() => {
    manager.registerLogicalEntity({
      name: 'Player',
      componentId,
    });
  }, []);
  
  // Later, from anywhere
  const entity = manager.getEntityByComponentId(componentId);
}
```

### navigateFromComponent

Gets full navigation information from a component ID.

```typescript
navigateFromComponent(componentId: string): NavigationResult
```

## Navigation Patterns

### Scene Inspector Integration

```typescript
// When user clicks object in 3D view
function onSceneClick(object: THREE.Object3D) {
  const result = manager.navigateFromObject(object);
  
  if (result.entity) {
    // Show in inspector
    showEntityDetails(result.entity);
    showModuleMetrics(result.module);
    showEntityHierarchy(result.ancestors, result.children);
  }
}
```

### Framework Bridge Pattern

```typescript
// React component that tracks itself
function Enemy({ id, position }: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    const entityId = manager.registerLogicalEntity({
      name: `Enemy ${id}`,
      module: '@game/enemies',
      componentId: id,
      componentType: 'Enemy',
    });
    
    if (meshRef.current) {
      manager.addObjectToEntity(entityId, meshRef.current);
    }
    
    return () => {
      manager.unregisterLogicalEntity(entityId);
    };
  }, [id]);
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}
```

### Hierarchical Navigation

```typescript
// Create hierarchy
const worldId = manager.registerLogicalEntity({ name: 'World' });
const areaId = manager.registerLogicalEntity({ 
  name: 'Forest Area',
  parentEntityId: worldId,
});
const enemyId = manager.registerLogicalEntity({ 
  name: 'Goblin',
  parentEntityId: areaId,
});

// Navigate up the hierarchy
const result = manager.navigateFromEntity(enemyId);
console.log(result.ancestors.map(e => e.name));
// ["World", "Forest Area"]

// Navigate down from parent
const worldResult = manager.navigateFromEntity(worldId);
console.log(worldResult.children.map(e => e.name));
// ["Forest Area"]
```

### Batch Operations

```typescript
// Hide all objects for an entity
function hideEntity(entityId: EntityId) {
  const result = manager.navigateFromEntity(entityId);
  for (const obj of result.objects) {
    obj.visible = false;
  }
  
  // Also hide children
  for (const child of result.children) {
    hideEntity(child.id);
  }
}

// Highlight entity and siblings
function highlightSiblings(entityId: EntityId) {
  const entity = manager.getEntity(entityId);
  if (!entity?.parentEntityId) return;
  
  const parent = manager.navigateFromEntity(entity.parentEntityId);
  for (const sibling of parent.children) {
    const siblingNav = manager.navigateFromEntity(sibling.id);
    for (const obj of siblingNav.objects) {
      if ((obj as THREE.Mesh).material) {
        (obj as THREE.Mesh).material.wireframe = true;
      }
    }
  }
}
```

## Events

Object mapping changes emit events:

```typescript
manager.onEntityEvent((event) => {
  switch (event.type) {
    case 'object-added':
      console.log(`Object ${event.details?.objectUuid} added to ${event.entity.name}`);
      break;
    case 'object-removed':
      console.log(`Object ${event.details?.objectUuid} removed from ${event.entity.name}`);
      break;
  }
});
```

## Best Practices

### 1. Map Related Objects Together

```typescript
// Good: All parts of a character in one entity
manager.addObjectToEntity(playerId, body);
manager.addObjectToEntity(playerId, head);
manager.addObjectToEntity(playerId, leftArm);
manager.addObjectToEntity(playerId, rightArm);

// Avoid: Separate entities for each mesh
// (unless they need independent tracking)
```

### 2. Clean Up on Destruction

```typescript
function destroyEnemy(entityId: EntityId) {
  const result = manager.navigateFromEntity(entityId);
  
  // Dispose Three.js resources
  for (const obj of result.objects) {
    if ((obj as THREE.Mesh).geometry) {
      (obj as THREE.Mesh).geometry.dispose();
    }
    if ((obj as THREE.Mesh).material) {
      const mat = (obj as THREE.Mesh).material;
      if (Array.isArray(mat)) {
        mat.forEach(m => m.dispose());
      } else {
        mat.dispose();
      }
    }
    obj.parent?.remove(obj);
  }
  
  // Clean up entity
  manager.unregisterLogicalEntity(entityId);
}
```

### 3. Use Navigation for Selection

```typescript
function selectEntity(entityId: EntityId) {
  const result = manager.navigateFromEntity(entityId);
  
  // Highlight all related objects
  for (const obj of result.objects) {
    addOutline(obj);
  }
  
  // Show breadcrumb path
  const path = [
    ...result.ancestors.map(e => e.name),
    result.entity?.name,
  ].filter(Boolean);
  showBreadcrumb(path);
}
```

## See Also

- [LogicalEntityManager](./logical-entity-manager.md) - Full manager API
- [registerLogicalEntity()](./register-logical-entity.md) - Creating entities
- [Module Metrics](./module-metrics.md) - Module-level aggregation
- [Entity Filtering](./entity-filtering.md) - Querying entities
