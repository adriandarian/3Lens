# useDevtoolEntityGroup

Composable to register a group of related Three.js objects as a logical entity in 3Lens devtools. Useful for complex objects composed of multiple meshes that should be treated as a single unit.

## Import

```typescript
import { useDevtoolEntityGroup } from '@3lens/vue-bridge';
```

## Signature

```typescript
function useDevtoolEntityGroup(
  objects: MaybeRef<(THREE.Object3D | null | undefined)[]>,
  options?: EntityOptions
): void
```

## Parameters

### objects

An array of Three.js Object3D instances (or a ref to an array). Can contain null/undefined values which will be filtered out.

```typescript
// Direct array
useDevtoolEntityGroup([mesh1, mesh2, mesh3], { name: 'Vehicle' });

// Ref to array
const parts = ref<THREE.Mesh[]>([]);
useDevtoolEntityGroup(parts, { name: 'Vehicle' });
```

### options

Configuration for the entity group.

```typescript
interface EntityOptions {
  /**
   * Name for the entire group
   */
  name?: string;

  /**
   * Module/category path
   */
  module?: string;

  /**
   * Tags shared by all objects in the group
   */
  tags?: string[];
}
```

## Usage

### Basic Group Registration

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { useDevtoolEntityGroup } from '@3lens/vue-bridge';
import * as THREE from 'three';

const vehicleParts = ref<THREE.Mesh[]>([]);

useDevtoolEntityGroup(vehicleParts, {
  name: 'PlayerVehicle',
  module: 'game/vehicles',
});

onMounted(() => {
  const chassis = new THREE.Mesh(/* ... */);
  const wheel1 = new THREE.Mesh(/* ... */);
  const wheel2 = new THREE.Mesh(/* ... */);
  const wheel3 = new THREE.Mesh(/* ... */);
  const wheel4 = new THREE.Mesh(/* ... */);
  
  vehicleParts.value = [chassis, wheel1, wheel2, wheel3, wheel4];
});
</script>
```

### Character with Equipment

```vue
<script setup>
import { ref, computed } from 'vue';
import { useDevtoolEntityGroup } from '@3lens/vue-bridge';

const body = ref<THREE.Mesh | null>(null);
const weapon = ref<THREE.Mesh | null>(null);
const armor = ref<THREE.Mesh | null>(null);
const helmet = ref<THREE.Mesh | null>(null);

// Computed array that updates when equipment changes
const characterParts = computed(() => [
  body.value,
  weapon.value,
  armor.value,
  helmet.value,
].filter(Boolean));

useDevtoolEntityGroup(characterParts, {
  name: 'PlayerCharacter',
  module: 'game/player',
  tags: ['player', 'character'],
});
</script>
```

### Building with Floors

```vue
<script setup>
import { ref } from 'vue';
import { useDevtoolEntityGroup } from '@3lens/vue-bridge';

const floors = ref<THREE.Group[]>([]);

useDevtoolEntityGroup(floors, {
  name: 'OfficeBuilding',
  module: 'world/buildings',
  tags: ['building', 'static'],
});

// Dynamically add floors
function addFloor(floorMesh: THREE.Group) {
  floors.value = [...floors.value, floorMesh];
}

function removeFloor(index: number) {
  floors.value = floors.value.filter((_, i) => i !== index);
}
</script>
```

### Particle System

```vue
<script setup>
import { ref, watch } from 'vue';
import { useDevtoolEntityGroup } from '@3lens/vue-bridge';

const particles = ref<THREE.Points[]>([]);

useDevtoolEntityGroup(particles, {
  name: 'ExplosionParticles',
  module: 'effects/particles',
  tags: ['effect', 'temporary'],
});

function createExplosion(position: THREE.Vector3) {
  const newParticles = [];
  for (let i = 0; i < 50; i++) {
    const particle = new THREE.Points(/* ... */);
    particle.position.copy(position);
    newParticles.push(particle);
  }
  particles.value = newParticles;
  
  // Clean up after animation
  setTimeout(() => {
    particles.value = [];
  }, 2000);
}
</script>
```

## How It Works

1. **Creates a unique group ID** - Based on name and timestamp
2. **Marks all objects** - Adds group metadata to each object's `userData`
3. **Tracks indices** - Each object knows its position in the group
4. **Watches for changes** - Updates when the array changes
5. **Auto-cleanup** - Removes group metadata on unmount

### Stored Data Structure

Each object in the group gets:

```typescript
object.userData.__3lens = {
  groupId: 'group-PlayerVehicle-1704307200000',
  groupName: 'PlayerVehicle',
  groupIndex: 0,  // Position in the group
  module: 'game/vehicles',
  tags: ['vehicle'],
};
```

## Filtering with Groups

Groups can be filtered in the devtools by:

- **Group Name** - Search for `groupName:PlayerVehicle`
- **Module** - Filter by `game/vehicles`
- **Tags** - Filter by shared tags

## Reactivity

The group registration is fully reactive:

```vue
<script setup>
const parts = ref<THREE.Object3D[]>([]);

useDevtoolEntityGroup(parts, { name: 'DynamicGroup' });

// Adding objects
function addPart(mesh: THREE.Mesh) {
  parts.value = [...parts.value, mesh];
}

// Removing objects
function removePart(mesh: THREE.Mesh) {
  parts.value = parts.value.filter(p => p !== mesh);
}

// Replacing entire array
function setParts(newParts: THREE.Mesh[]) {
  parts.value = newParts;
}
</script>
```

## Combining with useDevtoolEntity

You can use both composables together for hierarchical organization:

```vue
<script setup>
import { ref } from 'vue';
import { useDevtoolEntity, useDevtoolEntityGroup } from '@3lens/vue-bridge';

// Register the parent group
const vehicle = ref<THREE.Group | null>(null);
useDevtoolEntity(vehicle, {
  name: 'PlayerVehicle',
  module: 'game/vehicles',
});

// Also register individual parts for detailed inspection
const wheels = ref<THREE.Mesh[]>([]);
useDevtoolEntityGroup(wheels, {
  name: 'VehicleWheels',
  module: 'game/vehicles/parts',
  tags: ['wheel', 'rotating'],
});
</script>
```

## Best Practices

### Do

```typescript
// ✅ Group related objects
useDevtoolEntityGroup(vehicleParts, { name: 'Car' });

// ✅ Use descriptive module paths
useDevtoolEntityGroup(meshes, {
  name: 'EnemySquad',
  module: 'game/ai/squads',
});

// ✅ Use reactive arrays for dynamic groups
const dynamicParts = ref<THREE.Mesh[]>([]);
useDevtoolEntityGroup(dynamicParts, { name: 'Dynamic' });
```

### Don't

```typescript
// ❌ Don't group unrelated objects
useDevtoolEntityGroup([player, enemy, tree], { name: 'Misc' });

// ❌ Don't use for single objects (use useDevtoolEntity)
useDevtoolEntityGroup([singleMesh], { name: 'Single' });

// ❌ Don't forget to update refs
const parts = ref([mesh1]);
parts.value.push(mesh2);  // ❌ Won't trigger reactivity
parts.value = [...parts.value, mesh2];  // ✅ Correct
```

## Comparison with useDevtoolEntity

| Feature | useDevtoolEntity | useDevtoolEntityGroup |
|---------|-----------------|----------------------|
| Input | Single object | Array of objects |
| Use case | Individual entities | Composite entities |
| Group metadata | No | Yes (groupId, groupIndex) |
| Typical usage | Characters, items | Vehicles, buildings |

## Related

- [useDevtoolEntity](./use-devtool-entity.md) - Register single objects
- [Entity Registration](/api/core/register-logical-entity) - Core entity system
- [useThreeLens](./composables.md#usethreelens) - Access full context
