# useDevtoolEntity

The `useDevtoolEntity` hook registers a Three.js object as a named entity in the 3Lens devtools. This allows you to give meaningful names and metadata to objects that would otherwise appear as generic `Object3D` or `Mesh` in the scene tree.

## Import

```tsx
import { useDevtoolEntity } from '@3lens/react-bridge';
```

## Usage

```tsx
import { useRef } from 'react';
import { useDevtoolEntity } from '@3lens/react-bridge';

function Player({ position }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useDevtoolEntity(meshRef.current, {
    name: 'Player',
    module: 'game/entities',
    metadata: {
      health: 100,
      level: 5,
    },
    tags: ['player', 'controllable'],
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}
```

## Signature

```tsx
function useDevtoolEntity(
  object: THREE.Object3D | null | undefined,
  options?: EntityOptions
): void
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `object` | `THREE.Object3D \| null \| undefined` | The Three.js object to register. Can be `null` during initialization (e.g., when using refs) |
| `options` | `EntityOptions` | Configuration options for the entity |

### EntityOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | `undefined` | Custom name for the entity displayed in devtools |
| `module` | `string` | `undefined` | Module/category the entity belongs to (e.g., `'game/enemies'`) |
| `metadata` | `Record<string, unknown>` | `undefined` | Custom metadata to display in the inspector panel |
| `tags` | `string[]` | `undefined` | Tags for filtering and grouping entities |

## Examples

### Basic Entity Registration

```tsx
function Enemy({ id, type }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useDevtoolEntity(meshRef.current, {
    name: `Enemy_${id}`,
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}
```

### With Rich Metadata

```tsx
function Vehicle({ vehicleData }) {
  const groupRef = useRef<THREE.Group>(null);

  useDevtoolEntity(groupRef.current, {
    name: vehicleData.name,
    module: 'vehicles',
    metadata: {
      speed: vehicleData.maxSpeed,
      fuelCapacity: vehicleData.fuel,
      passengers: vehicleData.passengerCount,
      modelYear: vehicleData.year,
    },
    tags: ['vehicle', vehicleData.type, vehicleData.isElectric ? 'electric' : 'combustion'],
  });

  return (
    <group ref={groupRef}>
      {/* Vehicle meshes */}
    </group>
  );
}
```

### Dynamic Metadata Updates

The hook automatically updates metadata when the options change:

```tsx
function Character({ health, mana, level }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useDevtoolEntity(meshRef.current, {
    name: 'Player Character',
    module: 'characters',
    metadata: {
      health,  // Updates when health changes
      mana,    // Updates when mana changes
      level,   // Updates when level changes
    },
  });

  return <mesh ref={meshRef}>{/* ... */}</mesh>;
}
```

### With React Three Fiber Components

```tsx
import { useRef } from 'react';
import { useDevtoolEntity } from '@3lens/react-bridge';
import { Box } from '@react-three/drei';

function Collectible({ type, value }) {
  const ref = useRef<THREE.Mesh>(null);

  useDevtoolEntity(ref.current, {
    name: `Collectible_${type}`,
    module: 'items/collectibles',
    metadata: { type, value },
    tags: ['collectible', type],
  });

  return (
    <Box ref={ref}>
      <meshStandardMaterial color="gold" />
    </Box>
  );
}
```

## How It Works

1. **Object Registration**: When the hook receives a valid object, it:
   - Sets the `name` property on the Three.js object
   - Stores metadata in `object.userData.__3lens`
   - Requests a snapshot refresh to update the devtools UI

2. **Automatic Cleanup**: On unmount, the hook removes the `__3lens` metadata from `userData`

3. **Safe Outside Provider**: The hook uses `useThreeLensContextOptional`, so it gracefully handles cases where no provider exists

## Related Hooks

### useDevtoolEntityGroup

For registering multiple related objects as a single logical entity:

```tsx
import { useDevtoolEntityGroup } from '@3lens/react-bridge';

function Tank() {
  const bodyRef = useRef<THREE.Mesh>(null);
  const turretRef = useRef<THREE.Mesh>(null);
  const barrelRef = useRef<THREE.Mesh>(null);

  useDevtoolEntityGroup(
    [bodyRef.current, turretRef.current, barrelRef.current].filter(Boolean),
    {
      name: 'PlayerTank',
      module: 'game/vehicles',
      metadata: {
        health: 100,
        ammo: 50,
      },
    }
  );

  return (
    <group>
      <mesh ref={bodyRef}>{/* Tank body */}</mesh>
      <mesh ref={turretRef}>{/* Turret */}</mesh>
      <mesh ref={barrelRef}>{/* Barrel */}</mesh>
    </group>
  );
}
```

## Best Practices

1. **Use Meaningful Names**: Choose names that help identify objects in large scenes
2. **Organize with Modules**: Use hierarchical module names like `'game/enemies/bosses'`
3. **Include Relevant Metadata**: Add data that's useful for debugging (state, IDs, configuration)
4. **Tag Consistently**: Use consistent tag names across your application for filtering

## Related

- [useDevtoolEntityGroup](./use-devtool-entity-group.md) - Register multiple objects as a group
- [ThreeLensProvider](./three-lens-provider.md) - Required context provider
- [LogicalEntityManager](/api/core/logical-entity-manager) - Core entity management API
