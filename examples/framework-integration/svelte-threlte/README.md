# 3Lens Svelte + Threlte Example

This example demonstrates how to integrate 3Lens devtools with a Svelte application using Threlte (declarative Three.js for Svelte).

## Features Demonstrated

- **Threlte Canvas**: Svelte-native Three.js rendering
- **Declarative 3D**: `<T.Mesh>`, `<T.Group>`, and other Threlte components
- **useTask**: Threlte's animation loop hook
- **Svelte Stores**: Reactive metrics with writable stores
- **Interactive Components**: Hover and click events on meshes

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-svelte-threlte dev
```

Then open http://localhost:3007 in your browser.

## Code Structure

```
src/
├── main.ts                    # Svelte app entry
├── App.svelte                 # Root component with Canvas
├── app.d.ts                   # TypeScript declarations
└── lib/
    ├── useThreeLens.ts        # 3Lens metrics store
    └── components/
        ├── Scene.svelte       # Main scene composition
        ├── RotatingBox.svelte # Animated rotating cube
        ├── AnimatedSphere.svelte # Bouncing sphere
        ├── TorusGroup.svelte  # Group of orbital toruses
        ├── Ground.svelte      # Ground plane
        ├── Lights.svelte      # Scene lighting
        └── InfoPanel.svelte   # Metrics display
```

## Key Integration Points

### 1. Create a 3Lens Store

```typescript
// lib/useThreeLens.ts
import { writable } from 'svelte/store';
import { onMount, onDestroy } from 'svelte';

export function useThreeLens() {
  const fps = writable(0);
  const drawCalls = writable(0);
  
  onMount(() => {
    // Start metrics collection
  });
  
  return { fps, drawCalls };
}
```

### 2. Use Threlte Canvas

```svelte
<script>
  import { Canvas } from '@threlte/core';
  import Scene from './Scene.svelte';
</script>

<Canvas>
  <Scene />
</Canvas>
```

### 3. Animate with useTask

```svelte
<script>
  import { T, useTask } from '@threlte/core';
  
  let mesh;
  
  useTask((delta) => {
    if (mesh) {
      mesh.rotation.y += delta;
    }
  });
</script>

<T.Mesh bind:ref={mesh}>
  <T.BoxGeometry />
  <T.MeshStandardMaterial color="#4ecdc4" />
</T.Mesh>
```

### 4. Declarative Three.js Components

```svelte
<script>
  import { T } from '@threlte/core';
</script>

<!-- Lights -->
<T.AmbientLight intensity={0.3} />
<T.DirectionalLight position={[5, 10, 5]} castShadow />

<!-- Meshes -->
<T.Mesh position={[0, 1, 0]} castShadow>
  <T.SphereGeometry args={[1, 32, 32]} />
  <T.MeshPhysicalMaterial color="#9b59b6" />
</T.Mesh>

<!-- Groups -->
<T.Group position={[0, 2, -2]}>
  <T.Mesh>...</T.Mesh>
</T.Group>
```

### 5. Reactive Props with Svelte Stores

```svelte
<script>
  import type { Writable } from 'svelte/store';
  export let fps: Writable<number>;
</script>

<p>FPS: {$fps}</p>
```

## Scene Contents

The example scene includes:

- **Ground**: Plane mesh with receive shadows
- **RotatingBox**: Interactive box with hover/click states
- **AnimatedSphere**: Bouncing sphere with physical material
- **TorusGroup**: 3 toruses in orbital animation
- **Lights**: Ambient, directional (shadows), and point lights
- **OrbitControls**: Camera orbit controls from @threlte/extras

## Threlte vs Other Frameworks

| Feature | Threlte | R3F | TresJS |
|---------|---------|-----|--------|
| Framework | Svelte | React | Vue |
| Animation | useTask | useFrame | useRenderLoop |
| Components | `<T.Mesh>` | `<mesh>` | `<TresMesh>` |
| Ref binding | bind:ref | useRef | ref() |

## Dependencies

- `@3lens/core` - Core devtool probe
- `@3lens/overlay` - Floating overlay UI
- `@threlte/core` - Threlte core (Svelte Three.js renderer)
- `@threlte/extras` - Threlte helpers (OrbitControls, etc.)
- `svelte` - Svelte framework
- `three` - Three.js library

