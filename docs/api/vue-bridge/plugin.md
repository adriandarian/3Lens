# ThreeLensPlugin

Vue plugin that integrates 3Lens devtools into your application. The plugin automatically creates a context, sets up keyboard shortcuts, and provides the devtools to all components.

## Import

```typescript
import { ThreeLensPlugin } from '@3lens/vue-bridge';
```

## Installation

```typescript
// main.ts
import { createApp } from 'vue';
import { ThreeLensPlugin } from '@3lens/vue-bridge';
import App from './App.vue';

const app = createApp(App);

app.use(ThreeLensPlugin, {
  appName: 'My Three.js App',
  showOverlay: true,
  toggleShortcut: 'ctrl+shift+d',
});

app.mount('#app');
```

## Configuration

```typescript
interface ThreeLensPluginConfig {
  /**
   * Application name displayed in the devtools
   * @default 'Vue Three.js App'
   */
  appName?: string;

  /**
   * Whether to show the overlay UI on startup
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Keyboard shortcut to toggle the overlay
   * Supports combinations like 'ctrl+shift+d', 'alt+d', 'F12'
   * @default 'ctrl+shift+d'
   */
  toggleShortcut?: string;

  /**
   * Enable debug logging to console
   * @default false
   */
  debug?: boolean;

  // All ProbeConfig options from @3lens/core are also supported
}
```

### Configuration Examples

**Minimal:**
```typescript
app.use(ThreeLensPlugin);
```

**Custom Shortcut:**
```typescript
app.use(ThreeLensPlugin, {
  toggleShortcut: 'F12',
});
```

**Development Only:**
```typescript
if (import.meta.env.DEV) {
  app.use(ThreeLensPlugin, {
    appName: 'Dev Mode',
    debug: true,
  });
}
```

**Hidden by Default:**
```typescript
app.use(ThreeLensPlugin, {
  showOverlay: false,  // Press shortcut to show
});
```

## What the Plugin Does

1. **Creates a probe** - Initializes the 3Lens devtools probe
2. **Sets up subscriptions** - Subscribes to frame stats, snapshots, and selection events
3. **Provides context** - Makes the context available via Vue's provide/inject
4. **Adds global property** - Exposes `$threeLens` on all component instances
5. **Registers keyboard shortcut** - Sets up overlay toggle hotkey
6. **Handles cleanup** - Disposes probe when app unmounts

## Using the Plugin

### Via Composables (Recommended)

```vue
<script setup>
import { useThreeLens } from '@3lens/vue-bridge';

const { fps, drawCalls, selectObject } = useThreeLens();
</script>

<template>
  <div>FPS: {{ fps }}</div>
</template>
```

### Via Global Property

```vue
<script>
export default {
  methods: {
    logStats() {
      console.log('FPS:', this.$threeLens.fps.value);
    }
  }
}
</script>
```

### Via Template (Options API)

```vue
<template>
  <div>{{ $threeLens.fps.value }} FPS</div>
</template>
```

## Available Context Properties

The plugin provides a `ThreeLensContext` with these reactive properties:

### State

| Property | Type | Description |
|----------|------|-------------|
| `probe` | `Ref<DevtoolProbe \| null>` | The probe instance |
| `isReady` | `Ref<boolean>` | True when probe is ready |
| `frameStats` | `Ref<FrameStats \| null>` | Latest frame statistics |
| `snapshot` | `Ref<SceneSnapshot \| null>` | Current scene snapshot |
| `selectedNode` | `Ref<SceneNode \| null>` | Currently selected node |
| `isOverlayVisible` | `Ref<boolean>` | Overlay visibility state |

### Computed Metrics

| Property | Type | Description |
|----------|------|-------------|
| `fps` | `ComputedRef<number>` | Current frames per second |
| `drawCalls` | `ComputedRef<number>` | WebGL draw calls |
| `triangles` | `ComputedRef<number>` | Triangle count |
| `frameTime` | `ComputedRef<number>` | Frame time in milliseconds |
| `gpuMemory` | `ComputedRef<number>` | Estimated GPU memory |

### Actions

| Method | Signature | Description |
|--------|-----------|-------------|
| `selectObject` | `(uuid: string) => void` | Select object by UUID |
| `clearSelection` | `() => void` | Clear current selection |
| `toggleOverlay` | `() => void` | Toggle overlay visibility |
| `showOverlay` | `() => void` | Show the overlay |
| `hideOverlay` | `() => void` | Hide the overlay |

## Examples

### Connecting Your Renderer

```vue
<script setup>
import { onMounted, ref } from 'vue';
import { useThreeLens } from '@3lens/vue-bridge';
import * as THREE from 'three';

const { probe, isReady } = useThreeLens();
const canvasRef = ref<HTMLCanvasElement>();

onMounted(() => {
  const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value });
  const scene = new THREE.Scene();
  
  // Connect to devtools
  if (probe.value) {
    probe.value.observeRenderer(renderer);
    probe.value.observeScene(scene);
  }
});
</script>
```

### Performance Display

```vue
<script setup>
import { useThreeLens } from '@3lens/vue-bridge';
import { computed } from 'vue';

const { fps, frameTime, drawCalls, triangles } = useThreeLens();

const performanceGrade = computed(() => {
  if (fps.value >= 60) return 'A';
  if (fps.value >= 30) return 'B';
  return 'C';
});
</script>

<template>
  <div class="perf-overlay">
    <span :class="['grade', `grade-${performanceGrade}`]">
      {{ performanceGrade }}
    </span>
    <div class="stats">
      <div>{{ fps.toFixed(0) }} FPS</div>
      <div>{{ frameTime.toFixed(1) }}ms</div>
      <div>{{ drawCalls }} draws</div>
      <div>{{ (triangles / 1000).toFixed(1) }}k tris</div>
    </div>
  </div>
</template>
```

### Conditional Overlay Toggle

```vue
<script setup>
import { useThreeLens } from '@3lens/vue-bridge';

const { isOverlayVisible, toggleOverlay, showOverlay, hideOverlay } = useThreeLens();
</script>

<template>
  <button @click="toggleOverlay">
    {{ isOverlayVisible ? 'Hide' : 'Show' }} Devtools
  </button>
</template>
```

## Nuxt.js Integration

Create a plugin file for Nuxt:

```typescript
// plugins/threelens.client.ts
import { ThreeLensPlugin } from '@3lens/vue-bridge';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ThreeLensPlugin, {
    appName: 'Nuxt Three.js App',
  });
});
```

Note the `.client.ts` suffix to ensure it only runs on the client.

## TypeScript Support

The plugin is fully typed. For global property typing:

```typescript
// types/vue.d.ts
import type { ThreeLensContext } from '@3lens/vue-bridge';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $threeLens: ThreeLensContext;
  }
}
```

## Related

- [createThreeLens](./create-three-lens.md) - Factory function for manual context creation
- [useThreeLens](./composables.md#usethreelens) - Composable to access context
- [Provide/Inject Pattern](./provide-inject.md) - How context is distributed
