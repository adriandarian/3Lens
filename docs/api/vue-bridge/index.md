# @3lens/vue-bridge

Vue.js integration for 3Lens devtools. Provides a Vue plugin, composables, and TresJS integration for seamless debugging of Three.js applications built with Vue.

## Installation

```bash
npm install @3lens/vue-bridge @3lens/core
# or
pnpm add @3lens/vue-bridge @3lens/core
```

## Quick Start

### Using the Plugin

```typescript
// main.ts
import { createApp } from 'vue';
import { ThreeLensPlugin } from '@3lens/vue-bridge';
import App from './App.vue';

const app = createApp(App);

app.use(ThreeLensPlugin, {
  appName: 'My Vue Three.js App',
  showOverlay: true,
  toggleShortcut: 'ctrl+shift+d',
});

app.mount('#app');
```

### Using Composables

```vue
<script setup>
import { useThreeLens, useDevtoolEntity } from '@3lens/vue-bridge';
import { ref, onMounted } from 'vue';
import * as THREE from 'three';

// Access devtools context
const { fps, drawCalls, isReady } = useThreeLens();

// Register entities
const meshRef = ref<THREE.Mesh | null>(null);
useDevtoolEntity(meshRef, { name: 'Player', module: 'game' });

onMounted(() => {
  meshRef.value = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial()
  );
});
</script>

<template>
  <div class="stats">
    <span>FPS: {{ fps }}</span>
    <span>Draw Calls: {{ drawCalls }}</span>
  </div>
</template>
```

### With TresJS

```vue
<script setup>
import { TresCanvas } from '@tresjs/core';
import { ThreeLensPlugin, useTresProbe } from '@3lens/vue-bridge';

const { isConnected } = useTresProbe();
</script>

<template>
  <TresCanvas>
    <TresProbeConnector />
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshStandardMaterial color="orange" />
    </TresMesh>
  </TresCanvas>
</template>
```

## API Overview

### Plugin & Factory

| Export | Description |
|--------|-------------|
| [ThreeLensPlugin](./plugin.md) | Vue plugin for app-wide integration |
| [createThreeLens](./create-three-lens.md) | Factory for manual context creation |

### Core Composables

| Composable | Description |
|------------|-------------|
| [useThreeLens](./composables.md#usethreelens) | Access full devtools context |
| [useProbe](./composables.md#useprobe) | Access the probe instance |
| [useSelectedObject](./use-selected-object.md) | Manage object selection |

### Entity Registration

| Composable | Description |
|------------|-------------|
| [useDevtoolEntity](./use-devtool-entity.md) | Register single objects |
| [useDevtoolEntityGroup](./use-devtool-entity-group.md) | Register object groups |

### Metrics Composables

| Composable | Description |
|------------|-------------|
| [useMetric](./use-metric.md) | Custom metric extraction |
| [useFPS](./metric-composables.md) | FPS tracking |
| [useDrawCalls](./metric-composables.md) | Draw call tracking |
| [useTriangles](./metric-composables.md) | Triangle count |
| [useGPUMemory](./metric-composables.md) | GPU memory estimate |

### TresJS Integration

| Export | Description |
|--------|-------------|
| [useTresProbe](./tresjs-integration.md#ustresprobeprobe) | TresJS probe connection |
| [createTresConnector](./tresjs-integration.md#createtresconnector) | TresJS connector factory |

### Types

| Type | Description |
|------|-------------|
| [ThreeLensKey](./provide-inject.md) | Injection key for provide/inject |
| [ThreeLensPluginConfig](./plugin.md#configuration) | Plugin configuration |
| [ThreeLensContext](./provide-inject.md#threelenscontext) | Full context interface |
| [EntityOptions](./use-devtool-entity.md#entityoptions) | Entity registration options |

## Features

- ✅ **Vue Plugin** - App-wide integration with global properties
- ✅ **Composition API** - Full composables support
- ✅ **Reactive Metrics** - Computed refs for all performance data
- ✅ **Entity Registration** - Name and categorize Three.js objects
- ✅ **TresJS Integration** - First-class TresJS support
- ✅ **Auto-cleanup** - Automatic cleanup on component unmount
- ✅ **TypeScript** - Full type safety
- ✅ **SSR Safe** - Works with Nuxt and SSR environments

## Related

- [Vue/TresJS Guide](/guides/VUE-TRESJS-GUIDE.md) - Comprehensive integration guide
- [@3lens/core](/api/core/) - Core devtools package
- [@3lens/overlay](/api/overlay/) - Visual overlay UI
