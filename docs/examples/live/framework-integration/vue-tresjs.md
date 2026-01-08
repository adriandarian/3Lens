---
title: Vue + TresJS Integration
description: 3Lens integration with Vue.js and TresJS using composables
---

# Vue + TresJS

Integrate 3Lens with Vue.js applications using TresJS and Vue composables.

<ExampleViewer
  src="/examples/framework-integration/vue-tresjs/"
  title="Vue + TresJS Demo"
  description="A TresJS scene with 3Lens integration via Vue composables. The composable provides reactive access to the probe."
  difficulty="beginner"
  github-url="https://github.com/adriandarian/3Lens/tree/main/examples/framework-integration/vue-tresjs"
  aspect-ratio="16/9"
/>

## Features Demonstrated

- **Vue Composables**: `use3Lens` composable for Vue 3
- **Reactive State**: Vue reactivity for probe state
- **TresJS Integration**: Works seamlessly with TresJS
- **Component Inspection**: Inspect Vue components in scene

## Using the Vue Composable

```vue
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import { use3Lens } from '@3lens/vue-bridge';

// The composable handles all setup automatically
const { probe, isReady } = use3Lens();
</script>

<template>
  <TresCanvas>
    <TresPerspectiveCamera :position="[0, 2, 5]" />
    <TresAmbientLight :intensity="0.5" />
    
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshStandardMaterial color="hotpink" />
    </TresMesh>
  </TresCanvas>
</template>
```

## With Configuration

```vue
<script setup lang="ts">
import { use3Lens } from '@3lens/vue-bridge';

const { probe } = use3Lens({
  performance: {
    targetFPS: 60,
    warningThreshold: 45
  }
});

// Access reactive state
watch(() => probe.value?.frameStats, (stats) => {
  if (stats?.fps < 30) {
    console.warn('Performance warning!');
  }
});
</script>
```

## Related Examples

- [Vanilla Three.js](./vanilla-threejs) - Basic setup without frameworks
- [React Three Fiber](./react-three-fiber) - React integration
- [Svelte + Threlte](./svelte-threlte) - Svelte integration
