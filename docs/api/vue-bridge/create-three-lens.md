# createThreeLens

Factory function to create a standalone 3Lens context without using the Vue plugin. Useful for advanced scenarios where you need manual control over context creation and provision.

## Import

```typescript
import { createThreeLens } from '@3lens/vue-bridge';
```

## Signature

```typescript
function createThreeLens(config?: ThreeLensPluginConfig): ThreeLensContext
```

## Parameters

### config

Optional configuration object.

```typescript
interface ThreeLensPluginConfig {
  /**
   * Name displayed in the devtools
   * @default 'Vue Three.js App'
   */
  appName?: string;

  /**
   * Whether to show the overlay UI
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Keyboard shortcut to toggle the overlay
   * @default 'ctrl+shift+d'
   */
  toggleShortcut?: string;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  // Also accepts all ProbeConfig options from @3lens/core
}
```

## Returns

Returns a `ThreeLensContext` object containing:

| Property | Type | Description |
|----------|------|-------------|
| `probe` | `Ref<DevtoolProbe \| null>` | The probe instance |
| `isReady` | `Ref<boolean>` | Whether probe is ready |
| `frameStats` | `Ref<FrameStats \| null>` | Latest frame stats |
| `snapshot` | `Ref<SceneSnapshot \| null>` | Current scene snapshot |
| `selectedNode` | `Ref<SceneNode \| null>` | Selected scene node |
| `fps` | `ComputedRef<number>` | Current FPS |
| `drawCalls` | `ComputedRef<number>` | Current draw calls |
| `triangles` | `ComputedRef<number>` | Current triangle count |
| `frameTime` | `ComputedRef<number>` | Frame time in ms |
| `gpuMemory` | `ComputedRef<number>` | GPU memory estimate |
| `isOverlayVisible` | `Ref<boolean>` | Overlay visibility |
| `selectObject` | `(uuid: string) => void` | Select by UUID |
| `clearSelection` | `() => void` | Clear selection |
| `toggleOverlay` | `() => void` | Toggle overlay |
| `showOverlay` | `() => void` | Show overlay |
| `hideOverlay` | `() => void` | Hide overlay |

## Usage

### Basic Usage with Provide

```vue
<script setup>
import { provide } from 'vue';
import { createThreeLens, ThreeLensKey } from '@3lens/vue-bridge';

// Create context manually
const threeLens = createThreeLens({
  appName: 'My Custom App',
  debug: true,
});

// Provide to child components
provide(ThreeLensKey, threeLens);
</script>

<template>
  <ThreeScene />
</template>
```

### Conditional Creation

```vue
<script setup>
import { provide, computed } from 'vue';
import { createThreeLens, ThreeLensKey } from '@3lens/vue-bridge';

const props = defineProps<{
  enableDevtools: boolean;
}>();

// Only create in development
const threeLens = props.enableDevtools
  ? createThreeLens({ appName: 'Debug App' })
  : null;

if (threeLens) {
  provide(ThreeLensKey, threeLens);
}
</script>
```

### Multiple Canvases

```vue
<script setup>
import { provide, reactive } from 'vue';
import { createThreeLens, ThreeLensKey } from '@3lens/vue-bridge';

// Create separate contexts for each canvas
const mainContext = createThreeLens({ appName: 'Main Scene' });
const minimapContext = createThreeLens({ appName: 'Minimap' });
</script>

<template>
  <div class="main-canvas">
    <!-- Main scene uses mainContext -->
  </div>
  <div class="minimap">
    <!-- Minimap uses minimapContext -->
  </div>
</template>
```

### With Pinia Store

```typescript
// stores/devtools.ts
import { defineStore } from 'pinia';
import { createThreeLens } from '@3lens/vue-bridge';

export const useDevtoolsStore = defineStore('devtools', () => {
  const context = createThreeLens({
    appName: 'Store-Managed App',
  });

  return {
    ...context,
    // Add custom store methods
    logStats() {
      console.log('FPS:', context.fps.value);
      console.log('Draw Calls:', context.drawCalls.value);
    },
  };
});
```

### Accessing the Probe

```vue
<script setup>
import { watch } from 'vue';
import { createThreeLens } from '@3lens/vue-bridge';
import * as THREE from 'three';

const threeLens = createThreeLens();

// Access probe for advanced operations
watch(threeLens.isReady, (ready) => {
  if (ready && threeLens.probe.value) {
    const probe = threeLens.probe.value;
    
    // Connect your Three.js scene
    probe.observeRenderer(renderer);
    probe.observeScene(scene);
  }
});
</script>
```

## When to Use

| Use Case | Recommended Approach |
|----------|---------------------|
| Standard Vue app | Use `ThreeLensPlugin` |
| Multiple isolated contexts | Use `createThreeLens` |
| Conditional devtools | Use `createThreeLens` |
| Custom state management | Use `createThreeLens` |
| Nuxt/SSR with manual control | Use `createThreeLens` |
| Testing | Use `createThreeLens` |

## Comparison with Plugin

```typescript
// Plugin approach (recommended for most apps)
app.use(ThreeLensPlugin, { appName: 'My App' });

// Factory approach (for advanced scenarios)
const context = createThreeLens({ appName: 'My App' });
provide(ThreeLensKey, context);
```

Both approaches create the same context - the plugin just automates the provide/inject setup.

## Cleanup

The context automatically cleans up when the Vue app unmounts. For manual cleanup:

```typescript
import { onUnmounted } from 'vue';

const threeLens = createThreeLens();

onUnmounted(() => {
  threeLens.probe.value?.dispose();
});
```

## Related

- [ThreeLensPlugin](./plugin.md) - Vue plugin approach
- [Provide/Inject Pattern](./provide-inject.md) - How context is provided
- [ThreeLensContext](./provide-inject.md#threelenscontext) - Full context interface
