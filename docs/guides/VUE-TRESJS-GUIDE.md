# Vue & TresJS Integration Guide

This guide covers integrating 3Lens with Vue 3 applications, including projects using TresJS for declarative Three.js.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Vue Plugin](#vue-plugin)
- [Composables Reference](#composables-reference)
- [TresJS Integration](#tresjs-integration)
- [Entity Registration](#entity-registration)
- [Nuxt.js Integration](#nuxtjs-integration)
- [Pinia Integration](#pinia-integration)
- [Advanced Patterns](#advanced-patterns)
- [TypeScript Support](#typescript-support)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

Get up and running in under 2 minutes:

```typescript
// 1. Install dependencies
// npm install @3lens/core @3lens/overlay @3lens/vue-bridge @tresjs/core three

// 2. Add plugin to your app
// main.ts
import { createApp } from 'vue';
import { ThreeLensPlugin } from '@3lens/vue-bridge';
import App from './App.vue';

createApp(App)
  .use(ThreeLensPlugin, { appName: 'My Vue App' })
  .mount('#app');
```

```vue
<!-- 3. Use in your component -->
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import { useTresProbe, useThreeLens } from '@3lens/vue-bridge';

const { fps, drawCalls } = useThreeLens();
</script>

<template>
  <TresCanvas>
    <TresPerspectiveCamera :position="[0, 0, 5]" />
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshStandardMaterial color="hotpink" />
    </TresMesh>
    
    <!-- Connect 3Lens to TresJS -->
    <TresProbeConnector />
  </TresCanvas>
  
  <div class="stats">FPS: {{ fps.toFixed(0) }}</div>
</template>

<!-- TresProbeConnector.vue -->
<script setup lang="ts">
import { useTresProbe } from '@3lens/vue-bridge';
useTresProbe();
</script>
<template><slot /></template>
```

Press **Ctrl+Shift+D** to toggle the devtools overlay!

---

## Installation

```bash
npm install @3lens/core @3lens/overlay @3lens/vue-bridge
```

For TresJS projects:

```bash
npm install @3lens/core @3lens/overlay @3lens/vue-bridge @tresjs/core
```

---

## Basic Setup

### Vue Plugin Installation

Install the 3Lens plugin in your Vue application:

```typescript
// main.ts
import { createApp } from 'vue';
import { ThreeLensPlugin } from '@3lens/vue-bridge';
import App from './App.vue';

const app = createApp(App);

app.use(ThreeLensPlugin, {
  appName: 'My Vue App',
  debug: false,
  showOverlay: true,
  toggleShortcut: 'ctrl+shift+d',
});

app.mount('#app');
```

### Plugin Configuration

```typescript
interface ThreeLensPluginConfig {
  /**
   * Application name displayed in devtools
   */
  appName?: string;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Show overlay on mount
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Keyboard shortcut to toggle overlay
   * @default 'ctrl+shift+d'
   */
  toggleShortcut?: string;

  /**
   * Performance rules and thresholds
   */
  rules?: {
    maxDrawCalls?: number;
    maxTriangles?: number;
    maxFrameTimeMs?: number;
    maxTextures?: number;
    maxTextureMemory?: number;
  };

  /**
   * Sampling configuration
   */
  sampling?: {
    frameStatsInterval?: number;
    snapshotInterval?: number;
    enableGpuTiming?: boolean;
    enableResourceTracking?: boolean;
  };
}
```

---

## Vue Plugin

### Using createThreeLens

For more control, use the factory function:

```typescript
// plugins/threelens.ts
import { createThreeLens } from '@3lens/vue-bridge';

export const threeLens = createThreeLens({
  appName: 'My Vue App',
  debug: false,
});

// main.ts
import { createApp } from 'vue';
import { threeLens } from './plugins/threelens';

const app = createApp(App);
app.use(threeLens);
app.mount('#app');
```

### Basic Component Usage

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useThreeLens } from '@3lens/vue-bridge';
import * as THREE from 'three';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const { probe, fps, drawCalls, triangles, isReady } = useThreeLens();

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let animationId: number;

onMounted(() => {
  if (!canvasRef.value) return;

  // Initialize Three.js
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Add a cube
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Add lights
  scene.add(new THREE.AmbientLight(0x404040));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  // Connect 3Lens
  probe.value?.observeRenderer(renderer);
  probe.value?.observeScene(scene);
  probe.value?.setThreeReference(THREE);

  // Animation loop
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  };
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  renderer?.dispose();
});
</script>

<template>
  <div class="scene-container">
    <canvas ref="canvasRef"></canvas>
    
    <div v-if="isReady" class="stats-overlay">
      <span>FPS: {{ fps.toFixed(1) }}</span>
      <span>Draw Calls: {{ drawCalls }}</span>
      <span>Triangles: {{ triangles.toLocaleString() }}</span>
    </div>
  </div>
</template>

<style scoped>
.scene-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.stats-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
```

---

## Composables Reference

### useThreeLens

The primary composable for accessing 3Lens functionality:

```typescript
import { useThreeLens } from '@3lens/vue-bridge';

const {
  // Probe instance (Ref)
  probe,
  
  // State (Refs)
  isReady,
  frameStats,
  snapshot,
  selectedNode,
  isOverlayVisible,
  
  // Computed metrics
  fps,
  drawCalls,
  triangles,
  frameTime,
  gpuMemory,
  
  // Actions
  selectObject,
  clearSelection,
  showOverlay,
  hideOverlay,
  toggleOverlay,
} = useThreeLens();
```

### useProbe

Direct access to the probe instance:

```typescript
import { useProbe } from '@3lens/vue-bridge';

const probe = useProbe();

// Use probe methods directly
probe.value?.observeRenderer(renderer);
probe.value?.observeScene(scene);
probe.value?.setThreeReference(THREE);
```

### useSelectedObject

Track and control selection:

```vue
<script setup lang="ts">
import { useSelectedObject } from '@3lens/vue-bridge';

const { 
  selectedNode,
  selectObject,
  clearSelection,
  isSelected,
} = useSelectedObject();
</script>

<template>
  <div v-if="selectedNode" class="inspector">
    <h3>{{ selectedNode.name || 'Unnamed Object' }}</h3>
    <p>Type: {{ selectedNode.type }}</p>
    <p>UUID: {{ selectedNode.uuid }}</p>
    
    <div v-if="selectedNode.transform">
      <h4>Transform</h4>
      <p>Position: {{ selectedNode.transform.position }}</p>
      <p>Rotation: {{ selectedNode.transform.rotation }}</p>
      <p>Scale: {{ selectedNode.transform.scale }}</p>
    </div>
    
    <button @click="clearSelection">Clear Selection</button>
  </div>
  
  <div v-else class="no-selection">
    No object selected
  </div>
</template>
```

### useMetric

Subscribe to specific metrics:

```vue
<script setup lang="ts">
import { useMetric, useFPS, useDrawCalls, useTriangles, useGPUMemory } from '@3lens/vue-bridge';

// Generic metric access
const customMetric = useMetric('fps');

// Convenience composables
const fps = useFPS();
const drawCalls = useDrawCalls();
const triangles = useTriangles();
const gpuMemory = useGPUMemory();

// Computed values
const gpuMemoryMB = computed(() => gpuMemory.value / 1024 / 1024);
const isLowFPS = computed(() => fps.value < 30);
</script>

<template>
  <div class="metrics">
    <div :class="{ warning: isLowFPS }">
      FPS: {{ fps.toFixed(1) }}
    </div>
    <div>Draw Calls: {{ drawCalls }}</div>
    <div>Triangles: {{ triangles.toLocaleString() }}</div>
    <div>GPU Memory: {{ gpuMemoryMB.toFixed(1) }}MB</div>
  </div>
</template>
```

---

## TresJS Integration

### Using useTresProbe

For TresJS projects, use the TresJS-specific composable:

```vue
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import { useTresProbe } from '@3lens/vue-bridge';

// Inside TresCanvas children, useTresProbe auto-connects
</script>

<template>
  <TresCanvas>
    <TresPerspectiveCamera :position="[0, 0, 5]" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[10, 10, 5]" />
    
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshStandardMaterial color="orange" />
    </TresMesh>
    
    <!-- This component uses useTresProbe -->
    <ProbeConnector />
  </TresCanvas>
</template>
```

```vue
<!-- ProbeConnector.vue -->
<script setup lang="ts">
import { useTresProbe } from '@3lens/vue-bridge';

// Automatically connects probe to TresJS context
useTresProbe();
</script>

<template>
  <slot />
</template>
```

### TresJS Connector Factory

For advanced setups:

```typescript
import { createTresConnector } from '@3lens/vue-bridge';
import { useTres } from '@tresjs/core';

const { TresProbe, useTresProbe } = createTresConnector({
  useTres,
});
```

### Full TresJS Example

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { TresCanvas } from '@tresjs/core';
import { OrbitControls } from '@tresjs/cientos';
import { useThreeLens, useTresProbe } from '@3lens/vue-bridge';

const { fps, drawCalls, triangles, isReady } = useThreeLens();

const cubeRef = ref();
const rotation = ref({ x: 0, y: 0 });

// Animation
const { onLoop } = useRenderLoop();
onLoop(({ delta }) => {
  if (cubeRef.value) {
    rotation.value.x += delta;
    rotation.value.y += delta * 0.5;
  }
});
</script>

<template>
  <div class="app">
    <TresCanvas shadows>
      <!-- Camera -->
      <TresPerspectiveCamera :position="[3, 3, 3]" />
      <OrbitControls />
      
      <!-- Lights -->
      <TresAmbientLight :intensity="0.4" />
      <TresDirectionalLight 
        :position="[5, 5, 5]" 
        :intensity="1" 
        cast-shadow 
      />
      
      <!-- Scene Objects -->
      <TresMesh 
        ref="cubeRef"
        :rotation="[rotation.x, rotation.y, 0]"
        cast-shadow
      >
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#4488ff" />
      </TresMesh>
      
      <TresMesh :position="[0, -1, 0]" :rotation="[-Math.PI / 2, 0, 0]" receive-shadow>
        <TresPlaneGeometry :args="[10, 10]" />
        <TresMeshStandardMaterial color="#888888" />
      </TresMesh>
      
      <!-- Connect 3Lens -->
      <TresProbeConnector />
    </TresCanvas>
    
    <!-- Stats Overlay -->
    <div v-if="isReady" class="stats">
      <span>FPS: {{ fps.toFixed(1) }}</span>
      <span>Draws: {{ drawCalls }}</span>
      <span>Tris: {{ triangles.toLocaleString() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// TresProbeConnector.vue - separate component
import { useTresProbe } from '@3lens/vue-bridge';

const TresProbeConnector = defineComponent({
  setup() {
    useTresProbe();
    return () => null;
  },
});
</script>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
  position: relative;
}

.stats {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  display: flex;
  gap: 15px;
}
</style>
```

---

## Entity Registration

### useDevtoolEntity

Register Three.js objects with logical names:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDevtoolEntity } from '@3lens/vue-bridge';
import * as THREE from 'three';

const meshRef = ref<THREE.Mesh | null>(null);

// Register entity when mesh is available
const { entityId, update, unregister } = useDevtoolEntity(meshRef, {
  name: 'Player Character',
  module: '@game/characters',
  tags: ['player', 'controllable'],
  metadata: {
    health: 100,
    level: 5,
  },
});

// Update metadata when it changes
function takeDamage(amount: number) {
  update({
    metadata: { health: 100 - amount },
  });
}
</script>

<template>
  <TresMesh ref="meshRef">
    <TresCapsuleGeometry :args="[0.5, 1, 16, 32]" />
    <TresMeshStandardMaterial color="#4488ff" />
  </TresMesh>
</template>
```

### useDevtoolEntityGroup

Register groups of objects:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useDevtoolEntityGroup } from '@3lens/vue-bridge';

const groupRef = ref<THREE.Group | null>(null);

useDevtoolEntityGroup(groupRef, {
  name: 'Enemy Squad',
  module: '@game/enemies',
  tags: ['enemy', 'ai'],
  metadata: {
    squadId: 'alpha',
    memberCount: 5,
  },
});
</script>

<template>
  <TresGroup ref="groupRef">
    <Enemy v-for="i in 5" :key="i" :position="[i * 2, 0, 0]" />
  </TresGroup>
</template>
```

### Entity Options

```typescript
interface EntityOptions {
  /**
   * Display name in devtools
   */
  name?: string;

  /**
   * Module identifier
   */
  module?: string;

  /**
   * Custom metadata
   */
  metadata?: Record<string, unknown>;

  /**
   * Tags for filtering
   */
  tags?: string[];

  /**
   * Component type identifier
   */
  componentType?: string;

  /**
   * Unique component instance ID
   */
  componentId?: string;

  /**
   * Parent entity ID
   */
  parentEntityId?: string;
}
```

---

## Nuxt.js Integration

### Plugin Setup

Create a client-only plugin for Nuxt 3:

```typescript
// plugins/threelens.client.ts
import { ThreeLensPlugin } from '@3lens/vue-bridge';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ThreeLensPlugin, {
    appName: 'My Nuxt App',
    debug: import.meta.dev,
    showOverlay: import.meta.dev,
  });
});
```

### Client-Only Components

Wrap Three.js components in `<ClientOnly>`:

```vue
<!-- pages/scene.vue -->
<template>
  <ClientOnly>
    <ThreeScene />
    <template #fallback>
      <div class="loading">Loading 3D scene...</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const ThreeScene = defineAsyncComponent(() => 
  import('~/components/ThreeScene.vue')
);
</script>
```

### Composables in Nuxt

```vue
<!-- components/ThreeScene.vue -->
<script setup lang="ts">
// Only runs on client due to ClientOnly wrapper
const { probe, fps, drawCalls, isReady } = useThreeLens();

// Safe to use Three.js
import * as THREE from 'three';
</script>
```

### Environment-Based Loading

```typescript
// plugins/threelens.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Only load in development
  if (!import.meta.dev) return;
  
  nuxtApp.vueApp.use(ThreeLensPlugin, {
    appName: 'My Nuxt App',
  });
});
```

### Nuxt Module (Advanced)

For reusable configuration, create a local module:

```typescript
// modules/threelens.ts
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit';

export default defineNuxtModule({
  meta: {
    name: 'threelens',
    configKey: 'threelens',
  },
  defaults: {
    appName: 'Nuxt App',
    enabled: true,
  },
  setup(options, nuxt) {
    if (!options.enabled) return;
    
    const resolver = createResolver(import.meta.url);
    addPlugin(resolver.resolve('./runtime/threelens.client'));
  },
});
```

---

## Pinia Integration

### Performance Store

Create a Pinia store for 3Lens metrics:

```typescript
// stores/performance.ts
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useThreeLens } from '@3lens/vue-bridge';

export const usePerformanceStore = defineStore('performance', () => {
  const { fps, drawCalls, triangles, frameStats, selectedNode } = useThreeLens();
  
  // Track history for graphs
  const fpsHistory = ref<number[]>([]);
  const maxHistory = 60;
  
  // Computed state
  const averageFps = computed(() => {
    if (fpsHistory.value.length === 0) return 0;
    return fpsHistory.value.reduce((a, b) => a + b, 0) / fpsHistory.value.length;
  });
  
  const isPerformanceGood = computed(() => averageFps.value >= 55);
  
  // Watch and record FPS
  watch(fps, (newFps) => {
    fpsHistory.value.push(newFps);
    if (fpsHistory.value.length > maxHistory) {
      fpsHistory.value.shift();
    }
  });
  
  // Actions
  function clearHistory() {
    fpsHistory.value = [];
  }
  
  return {
    fps,
    drawCalls,
    triangles,
    frameStats,
    selectedNode,
    fpsHistory,
    averageFps,
    isPerformanceGood,
    clearHistory,
  };
});
```

### Using the Store

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePerformanceStore } from '@/stores/performance';

const performanceStore = usePerformanceStore();
const { fps, averageFps, isPerformanceGood, fpsHistory } = storeToRefs(performanceStore);
</script>

<template>
  <div class="performance-panel">
    <div :class="{ warning: !isPerformanceGood }">
      Current FPS: {{ fps.toFixed(0) }}
    </div>
    <div>Average FPS: {{ averageFps.toFixed(0) }}</div>
    
    <FpsGraph :data="fpsHistory" />
    
    <button @click="performanceStore.clearHistory()">
      Clear History
    </button>
  </div>
</template>
```

### Selection Store

```typescript
// stores/selection.ts
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useSelectedObject, useThreeLens } from '@3lens/vue-bridge';

export const useSelectionStore = defineStore('selection', () => {
  const { selectedNode, selectObject, clearSelection } = useSelectedObject();
  const { probe } = useThreeLens();
  
  const selectionHistory = ref<string[]>([]);
  
  // Track selection history
  watch(selectedNode, (node) => {
    if (node) {
      selectionHistory.value.push(node.uuid);
      // Keep last 10
      if (selectionHistory.value.length > 10) {
        selectionHistory.value.shift();
      }
    }
  });
  
  function selectPrevious() {
    if (selectionHistory.value.length >= 2) {
      const prevUuid = selectionHistory.value[selectionHistory.value.length - 2];
      selectObject(prevUuid);
    }
  }
  
  return {
    selectedNode,
    selectObject,
    clearSelection,
    selectionHistory,
    selectPrevious,
  };
});
```

---

## Advanced Patterns

### Conditional Debugging

```vue
<script setup lang="ts">
import { ThreeLensPlugin } from '@3lens/vue-bridge';

const isDev = import.meta.env.DEV;
</script>

<template>
  <!-- Only show debug overlay in development -->
  <DebugOverlay v-if="isDev" />
</template>
```

Or at the app level:

```typescript
// main.ts
import { createApp } from 'vue';
import { ThreeLensPlugin } from '@3lens/vue-bridge';

const app = createApp(App);

if (import.meta.env.DEV) {
  app.use(ThreeLensPlugin, {
    appName: 'My App',
  });
}

app.mount('#app');
```

### Provide/Inject Pattern

```typescript
// Custom provide/inject for specific features
import { provide, inject, type InjectionKey } from 'vue';
import type { DevtoolProbe } from '@3lens/core';

const ProbeKey: InjectionKey<DevtoolProbe | null> = Symbol('3LensProbe');

// In parent component
const { probe } = useThreeLens();
provide(ProbeKey, probe.value);

// In child component
const probe = inject(ProbeKey);
```

### Composable Watchers

```vue
<script setup lang="ts">
import { watch } from 'vue';
import { useThreeLens } from '@3lens/vue-bridge';

const { fps, frameStats, selectedNode } = useThreeLens();

// Watch for low FPS
watch(fps, (newFps) => {
  if (newFps < 30) {
    console.warn('Low FPS detected:', newFps);
  }
});

// Watch for selection changes
watch(selectedNode, (node) => {
  if (node) {
    console.log('Selected:', node.name, node.uuid);
  }
});

// Watch frame stats for custom metrics
watch(frameStats, (stats) => {
  if (stats && stats.drawCalls > 500) {
    console.warn('High draw call count:', stats.drawCalls);
  }
});
</script>
```

### Performance HUD Component

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useThreeLens } from '@3lens/vue-bridge';

const { fps, frameTime, drawCalls, triangles, gpuMemory } = useThreeLens();

const fpsColor = computed(() => {
  if (fps.value >= 55) return '#4caf50';
  if (fps.value >= 30) return '#ff9800';
  return '#f44336';
});

const gpuMemoryMB = computed(() => (gpuMemory.value / 1024 / 1024).toFixed(1));
</script>

<template>
  <div class="performance-hud">
    <div class="metric">
      <span class="label">FPS</span>
      <span class="value" :style="{ color: fpsColor }">
        {{ fps.toFixed(1) }}
      </span>
    </div>
    
    <div class="metric">
      <span class="label">Frame Time</span>
      <span class="value">{{ frameTime.toFixed(2) }}ms</span>
    </div>
    
    <div class="metric">
      <span class="label">Draw Calls</span>
      <span class="value">{{ drawCalls }}</span>
    </div>
    
    <div class="metric">
      <span class="label">Triangles</span>
      <span class="value">{{ triangles.toLocaleString() }}</span>
    </div>
    
    <div class="metric">
      <span class="label">GPU Memory</span>
      <span class="value">{{ gpuMemoryMB }}MB</span>
    </div>
  </div>
</template>

<style scoped>
.performance-hud {
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  z-index: 1000;
}

.metric {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.label {
  color: #888;
  margin-right: 20px;
}

.value {
  font-weight: bold;
}
</style>
```

### Multiple Scenes

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useThreeLens } from '@3lens/vue-bridge';

const { probe } = useThreeLens();

const mainScene = ref<THREE.Scene>();
const uiScene = ref<THREE.Scene>();

function registerScenes() {
  if (probe.value && mainScene.value) {
    probe.value.observeScene(mainScene.value, { name: 'Main Scene' });
  }
  if (probe.value && uiScene.value) {
    probe.value.observeScene(uiScene.value, { name: 'UI Scene' });
  }
}
</script>
```

---

## TypeScript Support

### Full Type Definitions

```typescript
import type {
  ThreeLensPluginConfig,
  ThreeLensContext,
  UseMetricOptions,
  EntityOptions,
} from '@3lens/vue-bridge';

import type {
  DevtoolProbe,
  FrameStats,
  SceneSnapshot,
  SceneNode,
} from '@3lens/core';
```

### Typed Composables

```vue
<script setup lang="ts">
import { useThreeLens } from '@3lens/vue-bridge';
import type { FrameStats, SceneNode } from '@3lens/core';

const { 
  probe,        // Ref<DevtoolProbe | null>
  frameStats,   // Ref<FrameStats | null>
  selectedNode, // Ref<SceneNode | null>
  fps,          // ComputedRef<number>
  drawCalls,    // ComputedRef<number>
} = useThreeLens();

// Type-safe access
const handleStats = (stats: FrameStats) => {
  console.log('FPS:', stats.fps);
  console.log('Memory:', stats.memory?.gpuMemoryEstimate);
};

watch(frameStats, (stats) => {
  if (stats) handleStats(stats);
});
</script>
```

### Typed Entity Metadata

```typescript
interface PlayerMetadata {
  health: number;
  mana: number;
  level: number;
  class: 'warrior' | 'mage' | 'rogue';
}

const { update } = useDevtoolEntity(meshRef, {
  name: 'Player',
  metadata: {
    health: 100,
    mana: 50,
    level: 1,
    class: 'warrior',
  } satisfies PlayerMetadata,
});

// Type-safe updates
function levelUp() {
  update({
    metadata: {
      level: 2,
    } satisfies Partial<PlayerMetadata>,
  });
}
```

---

## Best Practices

### 1. Use TresJS for Declarative 3D

Prefer TresJS components over imperative Three.js:

```vue
<!-- ✅ Recommended - Declarative -->
<template>
  <TresCanvas>
    <TresMesh :position="[0, 1, 0]">
      <TresBoxGeometry />
      <TresMeshStandardMaterial color="#4488ff" />
    </TresMesh>
  </TresCanvas>
</template>

<!-- ❌ Harder to maintain - Imperative -->
<script setup>
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial({ color: '#4488ff' })
);
scene.add(mesh);
</script>
```

### 2. Register Entities with Meaningful Names

```vue
<script setup>
import { useDevtoolEntity } from '@3lens/vue-bridge';

const playerRef = ref();
useDevtoolEntity(playerRef, {
  name: 'Player Character',
  module: '@game/player',
  tags: ['controllable', 'physics'],
  metadata: { health: 100 },
});
</script>
```

### 3. Create Dedicated Probe Connector

```vue
<!-- components/ProbeConnector.vue -->
<script setup lang="ts">
import { useTresProbe } from '@3lens/vue-bridge';
useTresProbe();
</script>

<template>
  <slot />
</template>

<!-- Usage in scene -->
<template>
  <TresCanvas>
    <ProbeConnector />
    <!-- scene content -->
  </TresCanvas>
</template>
```

### 4. Use Composables for Reusable Logic

```typescript
// composables/usePerformanceWarning.ts
export function usePerformanceWarning(threshold = 30) {
  const { fps } = useThreeLens();
  const isLowFPS = computed(() => fps.value < threshold);
  
  watch(isLowFPS, (low) => {
    if (low) {
      console.warn('Low FPS detected');
    }
  });
  
  return { isLowFPS };
}
```

### 5. Production Stripping

Only load 3Lens in development:

```typescript
// main.ts
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

if (import.meta.env.DEV) {
  const { ThreeLensPlugin } = await import('@3lens/vue-bridge');
  app.use(ThreeLensPlugin, { appName: 'My App' });
}

app.mount('#app');
```

---

## Common Pitfalls

### ❌ Using Composables Before Plugin

```typescript
// ❌ Wrong - composable before plugin registration
const { probe } = useThreeLens();
app.use(ThreeLensPlugin);

// ✅ Correct - use in components after app.mount()
// main.ts
app.use(ThreeLensPlugin, { appName: 'My App' });
app.mount('#app');

// MyComponent.vue
const { probe } = useThreeLens(); // Works!
```

### ❌ Server-Side Three.js

```vue
<!-- ❌ Wrong - crashes on SSR -->
<script setup>
import * as THREE from 'three';
const scene = new THREE.Scene(); // No window on server!
</script>

<!-- ✅ Correct - client only -->
<script setup>
import { onMounted } from 'vue';

let scene;
onMounted(() => {
  const THREE = await import('three');
  scene = new THREE.Scene();
});
</script>
```

### ❌ Not Cleaning Up Resources

```vue
<!-- ❌ Wrong - memory leak -->
<script setup>
const renderer = new THREE.WebGLRenderer();
// Component unmounts, renderer not disposed
</script>

<!-- ✅ Correct - cleanup -->
<script setup>
import { onUnmounted } from 'vue';

let renderer;
onMounted(() => {
  renderer = new THREE.WebGLRenderer();
});

onUnmounted(() => {
  renderer?.dispose();
});
</script>
```

### ❌ Missing Ref for Entity Registration

```vue
<!-- ❌ Wrong - no ref attached -->
<script setup>
const meshRef = ref();
useDevtoolEntity(meshRef, { name: 'My Mesh' });
</script>
<template>
  <TresMesh> <!-- Missing ref="meshRef" -->
    ...
  </TresMesh>
</template>

<!-- ✅ Correct -->
<template>
  <TresMesh ref="meshRef">
    ...
  </TresMesh>
</template>
```

---

## Troubleshooting

### Plugin Not Available

If `useThreeLens()` throws an error:

```typescript
import { useThreeLensOptional } from '@3lens/vue-bridge';

// Returns null instead of throwing if plugin not installed
const context = useThreeLensOptional();

if (!context) {
  console.warn('3Lens not available');
}
```

### Context Outside Plugin

Ensure composables are used in components that are children of a plugin-enabled app:

```typescript
// ❌ Won't work - before app.use()
const { probe } = useThreeLens();
app.use(ThreeLensPlugin);

// ✅ Works - in component setup
// App.vue
setup() {
  const { probe } = useThreeLens();
}
```

### SSR/Nuxt Issues

For SSR frameworks like Nuxt, use client-only components:

```vue
<template>
  <ClientOnly>
    <ThreeScene />
  </ClientOnly>
</template>
```

Or check for client-side:

```typescript
import { onMounted } from 'vue';

onMounted(() => {
  // Only run on client
  if (typeof window !== 'undefined') {
    // Initialize 3Lens
  }
});
```

---

## Examples

See complete implementations:

- [examples/framework-integration/vue-tresjs](../examples/framework-integration/vue-tresjs)

---

## Related Guides

- [Getting Started](./GETTING-STARTED.md)
- [Plugin Development](./PLUGIN-DEVELOPMENT.md)
- [CI Integration](./CI-INTEGRATION.md)
