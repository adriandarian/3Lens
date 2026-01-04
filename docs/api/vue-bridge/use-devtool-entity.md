# useDevtoolEntity

Composable to register a Three.js object as a named entity in 3Lens devtools. Entities appear with custom names in the scene tree and can include metadata visible in the inspector.

## Import

```typescript
import { useDevtoolEntity } from '@3lens/vue-bridge';
```

## Signature

```typescript
function useDevtoolEntity(
  object: MaybeRef<THREE.Object3D | null | undefined>,
  options?: EntityOptions
): void
```

## Parameters

### object

A Three.js Object3D or a ref to one. The composable watches for changes and automatically registers/unregisters as the value changes.

```typescript
// Direct object
useDevtoolEntity(mesh, { name: 'Player' });

// Ref (reactive)
const meshRef = ref<THREE.Mesh | null>(null);
useDevtoolEntity(meshRef, { name: 'Player' });

// Computed
const activeMesh = computed(() => isAlive.value ? playerMesh : null);
useDevtoolEntity(activeMesh, { name: 'Player' });
```

### options

Optional configuration for the entity.

```typescript
interface EntityOptions {
  /**
   * Display name in the devtools scene tree
   */
  name?: string;

  /**
   * Module/category path for organization
   * Use '/' for hierarchy: 'game/entities/enemies'
   */
  module?: string;

  /**
   * Custom metadata displayed in the inspector
   */
  metadata?: Record<string, unknown>;

  /**
   * Tags for filtering and grouping
   */
  tags?: string[];
}
```

## Usage

### Basic Registration

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { useDevtoolEntity } from '@3lens/vue-bridge';
import * as THREE from 'three';

const meshRef = ref<THREE.Mesh | null>(null);

useDevtoolEntity(meshRef, {
  name: 'Player',
});

onMounted(() => {
  meshRef.value = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1),
    new THREE.MeshStandardMaterial({ color: 'blue' })
  );
});
</script>
```

### With Module Organization

```vue
<script setup>
import { useDevtoolEntity } from '@3lens/vue-bridge';

const enemy = ref<THREE.Object3D | null>(null);

useDevtoolEntity(enemy, {
  name: 'Goblin',
  module: 'game/entities/enemies',
  tags: ['enemy', 'hostile'],
});
</script>
```

### With Metadata

```vue
<script setup>
import { ref, reactive } from 'vue';
import { useDevtoolEntity } from '@3lens/vue-bridge';

const player = ref<THREE.Object3D | null>(null);

const stats = reactive({
  health: 100,
  armor: 25,
  level: 5,
});

useDevtoolEntity(player, {
  name: 'Player',
  module: 'game/player',
  metadata: stats,  // Reactive - updates automatically
  tags: ['player', 'controllable'],
});
</script>
```

### Dynamic Entity Switching

```vue
<script setup>
import { ref, computed } from 'vue';
import { useDevtoolEntity } from '@3lens/vue-bridge';

const normalMesh = new THREE.Mesh(/* ... */);
const damagedMesh = new THREE.Mesh(/* ... */);

const isDamaged = ref(false);

// Automatically switches registration when computed changes
const currentMesh = computed(() => isDamaged.value ? damagedMesh : normalMesh);

useDevtoolEntity(currentMesh, {
  name: 'Player',
  metadata: { isDamaged },
});
</script>
```

### Template Ref Integration

```vue
<script setup>
import { ref, watchEffect } from 'vue';
import { useDevtoolEntity } from '@3lens/vue-bridge';

const containerRef = ref<THREE.Group | null>(null);

useDevtoolEntity(containerRef, {
  name: 'UI Container',
  module: 'ui/hud',
});
</script>

<template>
  <!-- TresJS example -->
  <TresGroup ref="containerRef">
    <HealthBar />
    <MiniMap />
  </TresGroup>
</template>
```

### Conditional Registration

```vue
<script setup>
import { ref, computed } from 'vue';
import { useDevtoolEntity } from '@3lens/vue-bridge';

const mesh = ref<THREE.Mesh | null>(null);
const isDebugMode = ref(import.meta.env.DEV);

// Only register in debug mode
const debugMesh = computed(() => isDebugMode.value ? mesh.value : null);
useDevtoolEntity(debugMesh, { name: 'DebugHelper' });
</script>
```

## How It Works

1. **Watches the object ref** - When the ref changes, old objects are unregistered
2. **Sets object name** - Applies `options.name` to `object.name`
3. **Stores metadata** - Adds `__3lens` to `object.userData`
4. **Triggers snapshot** - Requests a scene refresh so changes appear immediately
5. **Auto-cleanup** - Unregisters when component unmounts

### Stored Data Structure

```typescript
object.userData.__3lens = {
  module: 'game/entities',
  metadata: { health: 100 },
  tags: ['player'],
  registeredAt: 1704307200000,
};
```

## Reactivity

The composable is fully reactive:

```vue
<script setup>
import { ref, reactive } from 'vue';
import { useDevtoolEntity } from '@3lens/vue-bridge';

const mesh = ref<THREE.Mesh | null>(null);

// These are reactive and will update in devtools
const meta = reactive({
  health: 100,
  position: { x: 0, y: 0, z: 0 },
});

const tags = ref(['player']);

useDevtoolEntity(mesh, {
  name: 'Player',
  metadata: meta,
  tags: tags.value,
});

// Later: changing meta.health will update the inspector
function takeDamage(amount: number) {
  meta.health -= amount;
}
</script>
```

## Without Context (Safe Mode)

The composable uses `useThreeLensOptional` internally, so it's safe to use even without the plugin installed:

```vue
<script setup>
// This won't throw even if ThreeLensPlugin isn't installed
const mesh = ref<THREE.Mesh | null>(null);
useDevtoolEntity(mesh, { name: 'Safe Entity' });
// Simply does nothing if devtools aren't available
</script>
```

## Best Practices

### Do

```typescript
// ✅ Use descriptive names
useDevtoolEntity(mesh, { name: 'PlayerCharacter' });

// ✅ Organize with modules
useDevtoolEntity(mesh, { 
  name: 'Enemy',
  module: 'game/enemies/goblins',
});

// ✅ Include useful metadata
useDevtoolEntity(mesh, {
  name: 'Projectile',
  metadata: { damage: 10, speed: 50, type: 'fireball' },
});
```

### Don't

```typescript
// ❌ Avoid generic names
useDevtoolEntity(mesh, { name: 'Mesh1' });

// ❌ Don't register temporary objects
const tempMesh = new THREE.Mesh();
useDevtoolEntity(tempMesh); // Will be orphaned

// ❌ Avoid very large metadata
useDevtoolEntity(mesh, {
  metadata: { entireGameState: hugeObject }, // Bad
});
```

## Related

- [useDevtoolEntityGroup](./use-devtool-entity-group.md) - Register groups of objects
- [Entity Registration](/api/core/register-logical-entity) - Core entity system
- [useThreeLens](./composables.md#usethreelens) - Access full context
