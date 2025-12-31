# 3Lens Vue + TresJS Example

This example demonstrates how to integrate 3Lens devtools with a Vue 3 application using TresJS (declarative Three.js for Vue).

## Features Demonstrated

- **TresCanvas**: TresJS canvas component with shadows and camera config
- **Declarative 3D**: Vue-style declarative Three.js scene graph
- **useRenderLoop**: TresJS animation loop hook
- **Composables**: Vue 3 composition API for 3Lens integration
- **Animated Components**: Rotating box, bouncing sphere, orbital toruses

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-vue-tresjs dev
```

Or run all examples:

```bash
pnpm dev
```

## Code Structure

```
src/
├── main.ts                  # Vue app entry
├── App.vue                  # Root component with TresCanvas
├── composables/
│   └── useThreeLensSetup.ts # 3Lens metrics composable
└── components/
    ├── Scene.vue            # Main scene composition
    ├── RotatingBox.vue      # Animated rotating cube
    ├── AnimatedSphere.vue   # Bouncing sphere
    ├── TorusGroup.vue       # Group of orbital toruses
    ├── Ground.vue           # Ground plane
    ├── Lights.vue           # Scene lighting
    └── InfoPanel.vue        # Metrics display
```

## Key Integration Points

### 1. Create a 3Lens Composable

```typescript
// composables/useThreeLensSetup.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

export function useThreeLensSetup() {
  const fps = ref(0);
  const drawCalls = ref(0);
  
  onMounted(() => {
    // Initialize probe with TresJS renderer
    // Access via useTres() in production
  });
  
  return { fps, drawCalls };
}
```

### 2. Use TresCanvas with Configuration

```vue
<template>
  <TresCanvas 
    shadows 
    :camera="{ position: [5, 5, 8], fov: 60 }"
    :renderer="{ antialias: true }"
  >
    <Scene />
  </TresCanvas>
</template>
```

### 3. Animate with useRenderLoop

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useRenderLoop } from '@tresjs/core';

const meshRef = ref();

const { onLoop } = useRenderLoop();

onLoop(({ delta, elapsed }) => {
  if (meshRef.value) {
    meshRef.value.rotation.y += delta;
  }
});
</script>

<template>
  <TresMesh ref="meshRef">
    <TresBoxGeometry />
    <TresMeshStandardMaterial color="#4ecdc4" />
  </TresMesh>
</template>
```

### 4. Declarative Three.js Components

```vue
<template>
  <!-- Lights -->
  <TresAmbientLight :intensity="0.3" />
  <TresDirectionalLight :position="[5, 10, 5]" cast-shadow />
  
  <!-- Meshes -->
  <TresMesh :position="[0, 1, 0]" cast-shadow>
    <TresSphereGeometry :args="[1, 32, 32]" />
    <TresMeshPhysicalMaterial color="#9b59b6" />
  </TresMesh>
  
  <!-- Groups -->
  <TresGroup :position="[0, 2, -2]">
    <TresMesh>...</TresMesh>
  </TresGroup>
</template>
```

## Scene Contents

The example scene includes:

- **Ground**: Plane mesh with receive shadows
- **RotatingBox**: Interactive box with hover/click states
- **AnimatedSphere**: Bouncing sphere with physical material
- **TorusGroup**: 3 toruses in orbital animation
- **Lights**: Ambient, directional (shadows), and point lights
- **OrbitControls**: Camera orbit controls from @tresjs/cientos

## Using @3lens/vue-bridge

For deeper integration, you can use the Vue bridge package:

```typescript
import { useDevtoolEntity, useFPS } from '@3lens/vue-bridge';

// In a component
const meshRef = ref();
useDevtoolEntity(meshRef, {
  name: 'MyMesh',
  tags: ['animated'],
});

const fps = useFPS();
```

## Dependencies

- `@3lens/core` - Core devtool probe
- `@3lens/overlay` - Floating overlay UI
- `@3lens/vue-bridge` - Vue integration composables
- `@tresjs/core` - TresJS core (Vue Three.js renderer)
- `@tresjs/cientos` - TresJS helpers (OrbitControls, etc.)
- `vue` - Vue 3 framework
- `three` - Three.js library

