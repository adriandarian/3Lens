# TresJS Integration

The Vue bridge provides first-class integration with [TresJS](https://tresjs.org/), the Vue 3 renderer for Three.js. This document covers the `useTresProbe` composable and `createTresConnector` factory.

## Overview

TresJS integration allows 3Lens to automatically connect to TresJS's renderer, scene, and camera. The integration observes the Three.js context managed by TresJS and enables full devtools functionality.

---

## useTresProbe

Composable to connect 3Lens to a TresJS canvas context.

### Import

```typescript
import { useTresProbe } from '@3lens/vue-bridge';
```

### Signature

```typescript
function useTresProbe(options?: TresProbeOptions): UseTresProbeReturn
```

### Options

```typescript
interface TresProbeOptions {
  /**
   * Whether to auto-connect when TresJS context is available
   * @default true
   */
  autoConnect?: boolean;
}
```

### Return Value

```typescript
interface UseTresProbeReturn {
  /**
   * Whether the probe is connected to TresJS
   */
  isConnected: Ref<boolean>;

  /**
   * Manually connect to TresJS renderer and scene
   */
  connect: (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) => void;

  /**
   * Disconnect from TresJS
   */
  disconnect: () => void;
}
```

### Basic Usage

```vue
<script setup>
import { TresCanvas } from '@tresjs/core';
import { ThreeLensPlugin, useTresProbe } from '@3lens/vue-bridge';

const { isConnected } = useTresProbe();
</script>

<template>
  <div>
    <span v-if="isConnected">🟢 Devtools Connected</span>
    <span v-else>🔴 Connecting...</span>
  </div>
  
  <TresCanvas>
    <TresPerspectiveCamera :position="[3, 3, 3]" />
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshStandardMaterial color="orange" />
    </TresMesh>
    <TresDirectionalLight :position="[1, 2, 3]" />
  </TresCanvas>
</template>
```

### Manual Connection

```vue
<script setup>
import { TresCanvas, useTres } from '@tresjs/core';
import { useTresProbe } from '@3lens/vue-bridge';
import { onMounted } from 'vue';

const { connect, isConnected } = useTresProbe({ autoConnect: false });

// Manual connection inside TresCanvas
function TresConnector() {
  const { renderer, scene, camera } = useTres();
  
  onMounted(() => {
    if (renderer.value && scene && camera.value) {
      connect(renderer.value, scene, camera.value);
    }
  });
  
  return null;
}
</script>
```

---

## createTresConnector

Factory function to create a TresJS connector composable. Use this when you have access to TresJS's `useTres` hook.

### Import

```typescript
import { createTresConnector } from '@3lens/vue-bridge';
```

### Signature

```typescript
function createTresConnector(
  useTres: () => {
    renderer: { value: THREE.WebGLRenderer };
    scene: THREE.Scene;
    camera: { value: THREE.Camera };
  }
): () => UseTresProbeReturn
```

### Usage

```typescript
// In your app setup
import { useTres } from '@tresjs/core';
import { createTresConnector } from '@3lens/vue-bridge';

// Create a custom connector using TresJS's useTres
const useTresConnect = createTresConnector(useTres);

export { useTresConnect };
```

```vue
<!-- Inside TresCanvas -->
<script setup>
import { useTresConnect } from './threelens-setup';

// Automatically connects when mounted inside TresCanvas
const { isConnected } = useTresConnect();
</script>
```

### Complete Example

```vue
<!-- App.vue -->
<script setup>
import { TresCanvas, useTres } from '@tresjs/core';
import { ThreeLensPlugin, createTresConnector } from '@3lens/vue-bridge';

// Create the connector
const useTresConnect = createTresConnector(useTres);
</script>

<template>
  <TresCanvas>
    <TresConnector />
    <Scene />
  </TresCanvas>
</template>
```

```vue
<!-- TresConnector.vue -->
<script setup>
import { useTres } from '@tresjs/core';
import { createTresConnector } from '@3lens/vue-bridge';

const useTresConnect = createTresConnector(useTres);
const { isConnected } = useTresConnect();

// Connection happens automatically on mount
</script>

<template>
  <!-- Render nothing, just connects -->
</template>
```

---

## Full Integration Example

Here's a complete example showing TresJS with 3Lens devtools:

```vue
<!-- main.ts -->
<script>
import { createApp } from 'vue';
import { ThreeLensPlugin } from '@3lens/vue-bridge';
import App from './App.vue';

const app = createApp(App);
app.use(ThreeLensPlugin, {
  appName: 'TresJS Demo',
  showOverlay: true,
});
app.mount('#app');
</script>
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { TresCanvas, useTres } from '@tresjs/core';
import { OrbitControls } from '@tresjs/cientos';
import { 
  useThreeLens, 
  useTresProbe, 
  useDevtoolEntity,
  createTresConnector,
} from '@3lens/vue-bridge';

// Access devtools context
const { fps, drawCalls, toggleOverlay } = useThreeLens();

// TresJS probe connection
const { isConnected } = useTresProbe();

// Entity registration
const boxRef = ref(null);
useDevtoolEntity(boxRef, {
  name: 'InteractiveBox',
  module: 'scene/objects',
  metadata: { interactive: true },
});
</script>

<template>
  <div class="app">
    <div class="stats-bar">
      <span>{{ fps.toFixed(0) }} FPS</span>
      <span>{{ drawCalls }} draws</span>
      <span :class="{ connected: isConnected }">
        {{ isConnected ? '🟢 Connected' : '🔴 Disconnecting' }}
      </span>
      <button @click="toggleOverlay">Toggle Devtools</button>
    </div>
    
    <TresCanvas>
      <TresPerspectiveCamera :position="[5, 5, 5]" />
      <OrbitControls />
      
      <!-- Register this mesh as an entity -->
      <TresMesh ref="boxRef" :position="[0, 1, 0]">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#4080ff" />
      </TresMesh>
      
      <TresMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
        <TresPlaneGeometry :args="[10, 10]" />
        <TresMeshStandardMaterial color="#808080" />
      </TresMesh>
      
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />
    </TresCanvas>
  </div>
</template>

<style>
.app {
  width: 100vw;
  height: 100vh;
}

.stats-bar {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  display: flex;
  gap: 16px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 4px;
  color: white;
}

.connected {
  color: #4caf50;
}
</style>
```

---

## TresJS + Cientos Integration

Works seamlessly with [@tresjs/cientos](https://cientos.tresjs.org/) abstractions:

```vue
<script setup>
import { TresCanvas } from '@tresjs/core';
import { OrbitControls, Sky, Stars, useGLTF } from '@tresjs/cientos';
import { useTresProbe, useDevtoolEntity } from '@3lens/vue-bridge';
import { ref, watchEffect } from 'vue';

const { isConnected } = useTresProbe();

// Load and register a GLTF model
const { scene: model } = await useGLTF('/models/robot.glb');
const modelRef = ref(model);

useDevtoolEntity(modelRef, {
  name: 'Robot',
  module: 'models',
  metadata: { 
    source: '/models/robot.glb',
    animated: true,
  },
});
</script>

<template>
  <TresCanvas shadows>
    <TresPerspectiveCamera :position="[10, 10, 10]" />
    <OrbitControls />
    
    <primitive :object="model" />
    
    <Sky />
    <Stars />
    
    <TresAmbientLight :intensity="0.3" />
    <TresDirectionalLight 
      :position="[10, 10, 5]" 
      cast-shadow 
    />
  </TresCanvas>
</template>
```

---

## Debugging TresJS Scenes

The integration enables:

- **Scene Tree Inspection** - View all TresJS-managed objects
- **Transform Manipulation** - Move, rotate, scale objects in real-time
- **Performance Monitoring** - Track FPS, draw calls, triangles
- **Material Editing** - Modify materials live
- **Camera Controls** - Focus on objects, fly-to animations

---

## Troubleshooting

### Probe Not Connecting

Ensure you've installed the plugin:

```typescript
// main.ts
app.use(ThreeLensPlugin);
```

### Connection Inside TresCanvas

The TresJS context is only available inside `<TresCanvas>`. Use the connector component pattern:

```vue
<TresCanvas>
  <TresProbeConnector />  <!-- Must be inside TresCanvas -->
  <YourScene />
</TresCanvas>
```

### SSR/Nuxt Issues

Use client-only rendering for TresJS and 3Lens:

```vue
<ClientOnly>
  <TresCanvas>
    <!-- ... -->
  </TresCanvas>
</ClientOnly>
```

---

## Related

- [TresJS Documentation](https://tresjs.org/)
- [Vue/TresJS Guide](/guides/VUE-TRESJS-GUIDE.md)
- [ThreeLensPlugin](./plugin.md)
- [useDevtoolEntity](./use-devtool-entity.md)
