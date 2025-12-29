# @3lens/vue-bridge

Vue and TresJS integration for 3Lens - the three.js devtool.

## Installation

```bash
npm install @3lens/vue-bridge @3lens/core @3lens/overlay
# or
pnpm add @3lens/vue-bridge @3lens/core @3lens/overlay
```

## Quick Start

### Plugin Setup

```typescript
import { createApp } from 'vue';
import { ThreeLensPlugin } from '@3lens/vue-bridge';
import App from './App.vue';

const app = createApp(App);

app.use(ThreeLensPlugin, {
  appName: 'My Vue Three.js App',
  debug: false,
  showOverlay: true,
});

app.mount('#app');
```

### Basic Usage

```vue
<script setup>
import { useThreeLens, useFPS, useDrawCalls } from '@3lens/vue-bridge';
import { onMounted, ref } from 'vue';
import * as THREE from 'three';

const { probe, isReady } = useThreeLens();
const fps = useFPS(true);
const drawCalls = useDrawCalls();

const canvasRef = ref<HTMLCanvasElement>();

onMounted(() => {
  const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

  // Connect 3Lens
  if (probe.value) {
    probe.value.observeRenderer(renderer);
    probe.value.observeScene(scene);
  }

  // Animation loop...
});
</script>

<template>
  <div class="stats">
    <div>FPS: {{ fps.current.toFixed(0) }}</div>
    <div>Draw Calls: {{ drawCalls.current }}</div>
  </div>
  <canvas ref="canvasRef" />
</template>
```

## With TresJS

```vue
<script setup>
import { TresCanvas } from '@tresjs/core';
import { useTres } from '@tresjs/core';
import { ThreeLensPlugin, createTresConnector, useFPS } from '@3lens/vue-bridge';

// Create connector with TresJS's useTres hook
const useTresConnect = createTresConnector(useTres);

const fps = useFPS(true);
</script>

<template>
  <div>FPS: {{ fps.current.toFixed(0) }}</div>
  
  <TresCanvas>
    <!-- This component connects 3Lens to TresJS -->
    <TresConnector />
    
    <TresPerspectiveCamera :position="[0, 0, 5]" />
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshStandardMaterial color="orange" />
    </TresMesh>
  </TresCanvas>
</template>

<script>
// TresConnector component (must be inside TresCanvas)
const TresConnector = defineComponent({
  setup() {
    useTresConnect();
    return () => null;
  },
});
</script>
```

## Composables

### `useThreeLens()`

Access the full 3Lens context.

```vue
<script setup>
import { useThreeLens } from '@3lens/vue-bridge';

const {
  probe,           // Ref<DevtoolProbe | null>
  isReady,         // Ref<boolean>
  frameStats,      // Ref<FrameStats | null>
  snapshot,        // Ref<SceneSnapshot | null>
  selectedNode,    // Ref<SceneNode | null>
  fps,             // ComputedRef<number>
  drawCalls,       // ComputedRef<number>
  triangles,       // ComputedRef<number>
  frameTime,       // ComputedRef<number>
  gpuMemory,       // ComputedRef<number>
  isOverlayVisible,// Ref<boolean>
  selectObject,    // (uuid: string) => void
  clearSelection,  // () => void
  toggleOverlay,   // () => void
  showOverlay,     // () => void
  hideOverlay,     // () => void
} = useThreeLens();
</script>
```

### `useProbe()`

Access the probe instance directly.

```vue
<script setup>
import { useProbe } from '@3lens/vue-bridge';

const probe = useProbe();

function takeSnapshot() {
  const snapshot = probe.value.takeSnapshot();
  console.log('Objects:', snapshot.root.children.length);
}
</script>
```

### `useSelectedObject()`

Access and manage selection.

```vue
<script setup>
import { useSelectedObject } from '@3lens/vue-bridge';

const {
  selectedNode,  // Ref<SceneNode | null>
  selectedUuid,  // ComputedRef<string | null>
  selectedName,  // ComputedRef<string | null>
  selectedType,  // ComputedRef<string | null>
  hasSelection,  // ComputedRef<boolean>
  select,        // (uuid: string) => void
  clear,         // () => void
  isSelected,    // (uuid: string) => boolean
} = useSelectedObject();
</script>

<template>
  <div v-if="hasSelection">
    <h3>{{ selectedName || 'Unnamed' }}</h3>
    <p>Type: {{ selectedType }}</p>
    <button @click="clear">Deselect</button>
  </div>
</template>
```

### `useMetric(extractor, options?)`

Extract custom metrics from frame stats.

```vue
<script setup>
import { useMetric } from '@3lens/vue-bridge';

const gpuTime = useMetric(
  (stats) => stats.gpuTimeMs ?? 0,
  { smoothed: true, smoothingSamples: 30 }
);
</script>

<template>
  <div>GPU: {{ gpuTime.current.toFixed(2) }}ms</div>
  <div>Min: {{ gpuTime.min.toFixed(2) }}ms</div>
  <div>Max: {{ gpuTime.max.toFixed(2) }}ms</div>
</template>
```

### Convenience Metric Composables

```vue
<script setup>
import {
  useFPS,
  useFrameTime,
  useDrawCalls,
  useTriangles,
  useGPUMemory,
  useTextureCount,
  useGeometryCount,
} from '@3lens/vue-bridge';

const fps = useFPS(true);
const frameTime = useFrameTime();
const drawCalls = useDrawCalls();
const triangles = useTriangles();
const gpuMemory = useGPUMemory();
</script>
```

### `useDevtoolEntity(object, options)`

Register objects with names and metadata.

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { useDevtoolEntity } from '@3lens/vue-bridge';
import * as THREE from 'three';

const playerMesh = ref<THREE.Mesh | null>(null);

useDevtoolEntity(playerMesh, {
  name: 'Player',
  module: 'game/entities',
  metadata: { health: 100, level: 5 },
  tags: ['player', 'controllable'],
});

onMounted(() => {
  playerMesh.value = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ color: 'blue' })
  );
});
</script>
```

## Provide/Inject

For more control, use `createThreeLens` with Vue's provide/inject:

```vue
<script setup>
import { provide } from 'vue';
import { createThreeLens, ThreeLensKey } from '@3lens/vue-bridge';

const threeLens = createThreeLens({ appName: 'My App' });
provide(ThreeLensKey, threeLens);
</script>
```

Child components can then use any of the composables.

## TypeScript

All exports are fully typed:

```typescript
import type {
  ThreeLensContext,
  ThreeLensPluginConfig,
  EntityOptions,
  MetricValue,
  UseMetricOptions,
  FrameStats,
  SceneSnapshot,
  SceneNode,
} from '@3lens/vue-bridge';
```

## License

MIT

