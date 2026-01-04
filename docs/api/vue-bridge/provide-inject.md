# Provide/Inject Pattern

The Vue bridge uses Vue's provide/inject system to distribute the 3Lens context throughout your component tree. This document covers the injection key, context interface, and usage patterns.

## ThreeLensKey

The injection key used to provide and inject the 3Lens context.

### Import

```typescript
import { ThreeLensKey } from '@3lens/vue-bridge';
```

### Type

```typescript
const ThreeLensKey: InjectionKey<ThreeLensContext> = Symbol('ThreeLens');
```

### Usage

**Providing (usually done by the plugin):**

```typescript
import { provide } from 'vue';
import { createThreeLens, ThreeLensKey } from '@3lens/vue-bridge';

const context = createThreeLens({ appName: 'My App' });
provide(ThreeLensKey, context);
```

**Injecting:**

```typescript
import { inject } from 'vue';
import { ThreeLensKey } from '@3lens/vue-bridge';

const context = inject(ThreeLensKey);
if (!context) {
  throw new Error('ThreeLens not provided');
}
```

---

## ThreeLensContext

The full context interface provided to all components.

### Interface

```typescript
interface ThreeLensContext {
  // === Reactive State ===
  
  /**
   * The probe instance (null until initialized)
   */
  probe: Ref<DevtoolProbe | null>;

  /**
   * Whether the probe is ready and observing
   */
  isReady: Ref<boolean>;

  /**
   * Latest frame statistics from the renderer
   */
  frameStats: Ref<FrameStats | null>;

  /**
   * Current scene snapshot (tree structure)
   */
  snapshot: Ref<SceneSnapshot | null>;

  /**
   * Currently selected scene node
   */
  selectedNode: Ref<SceneNode | null>;

  /**
   * Whether the overlay UI is visible
   */
  isOverlayVisible: Ref<boolean>;

  // === Computed Metrics ===
  
  /**
   * Current frames per second
   */
  fps: ComputedRef<number>;

  /**
   * Number of WebGL draw calls
   */
  drawCalls: ComputedRef<number>;

  /**
   * Total triangle count
   */
  triangles: ComputedRef<number>;

  /**
   * Frame render time in milliseconds
   */
  frameTime: ComputedRef<number>;

  /**
   * Estimated GPU memory usage in bytes
   */
  gpuMemory: ComputedRef<number>;

  // === Actions ===
  
  /**
   * Select an object by its UUID
   */
  selectObject: (uuid: string) => void;

  /**
   * Clear the current selection
   */
  clearSelection: () => void;

  /**
   * Toggle overlay visibility
   */
  toggleOverlay: () => void;

  /**
   * Show the overlay UI
   */
  showOverlay: () => void;

  /**
   * Hide the overlay UI
   */
  hideOverlay: () => void;
}
```

---

## Composables for Injection

The Vue bridge provides composables that wrap the inject pattern:

### useThreeLens

Injects the context and throws if not available.

```typescript
import { useThreeLens } from '@3lens/vue-bridge';

// Throws if not within provider
const { fps, probe, selectObject } = useThreeLens();
```

### useThreeLensOptional

Injects the context or returns undefined.

```typescript
import { useThreeLensOptional } from '@3lens/vue-bridge';

const context = useThreeLensOptional();

// Safe to check
if (context) {
  console.log('FPS:', context.fps.value);
}
```

---

## Usage Patterns

### Standard Pattern (with Plugin)

```vue
<!-- App.vue -->
<script setup>
// Plugin installed in main.ts handles provide
</script>

<!-- ChildComponent.vue -->
<script setup>
import { useThreeLens } from '@3lens/vue-bridge';

const { fps, drawCalls } = useThreeLens();
</script>

<template>
  <div>{{ fps }} FPS | {{ drawCalls }} draw calls</div>
</template>
```

### Manual Provide Pattern

```vue
<!-- ParentComponent.vue -->
<script setup>
import { provide } from 'vue';
import { createThreeLens, ThreeLensKey } from '@3lens/vue-bridge';

const context = createThreeLens({
  appName: 'Manual Context',
});

provide(ThreeLensKey, context);
</script>

<template>
  <ChildComponent />
</template>
```

### Scoped Context Pattern

Provide different contexts to different parts of the app:

```vue
<script setup>
import { provide } from 'vue';
import { createThreeLens, ThreeLensKey } from '@3lens/vue-bridge';

// Main scene context
const mainContext = createThreeLens({ appName: 'Main Scene' });

// Editor scene context
const editorContext = createThreeLens({ appName: 'Editor' });
</script>

<template>
  <div class="main-view">
    <MainSceneProvider :context="mainContext">
      <MainCanvas />
    </MainSceneProvider>
  </div>
  
  <div class="editor-view">
    <EditorSceneProvider :context="editorContext">
      <EditorCanvas />
    </EditorSceneProvider>
  </div>
</template>
```

```vue
<!-- SceneProvider.vue -->
<script setup>
import { provide } from 'vue';
import { ThreeLensKey, type ThreeLensContext } from '@3lens/vue-bridge';

const props = defineProps<{
  context: ThreeLensContext;
}>();

provide(ThreeLensKey, props.context);
</script>

<template>
  <slot />
</template>
```

### Optional Integration Pattern

For components that should work with or without devtools:

```vue
<script setup>
import { useThreeLensOptional } from '@3lens/vue-bridge';

const context = useThreeLensOptional();

function logPerformance() {
  if (context) {
    console.log({
      fps: context.fps.value,
      drawCalls: context.drawCalls.value,
    });
  } else {
    console.log('Devtools not available');
  }
}
</script>
```

### Raw Inject Pattern

Direct use of Vue's inject (not recommended, but available):

```vue
<script setup>
import { inject } from 'vue';
import { ThreeLensKey } from '@3lens/vue-bridge';

const context = inject(ThreeLensKey);

// Must check for undefined
const fps = computed(() => context?.fps.value ?? 0);
</script>
```

---

## Testing with Mocks

Provide a mock context in tests:

```typescript
// test-utils.ts
import { provide, type App } from 'vue';
import { ThreeLensKey, type ThreeLensContext } from '@3lens/vue-bridge';
import { ref, computed } from 'vue';

export function createMockThreeLensContext(): ThreeLensContext {
  return {
    probe: ref(null),
    isReady: ref(true),
    frameStats: ref({ fps: 60, drawCalls: 100, triangles: 50000 }),
    snapshot: ref(null),
    selectedNode: ref(null),
    isOverlayVisible: ref(false),
    fps: computed(() => 60),
    drawCalls: computed(() => 100),
    triangles: computed(() => 50000),
    frameTime: computed(() => 16.67),
    gpuMemory: computed(() => 1024 * 1024 * 100),
    selectObject: vi.fn(),
    clearSelection: vi.fn(),
    toggleOverlay: vi.fn(),
    showOverlay: vi.fn(),
    hideOverlay: vi.fn(),
  };
}

// In your test
import { mount } from '@vue/test-utils';
import { ThreeLensKey } from '@3lens/vue-bridge';

const wrapper = mount(MyComponent, {
  global: {
    provide: {
      [ThreeLensKey as symbol]: createMockThreeLensContext(),
    },
  },
});
```

---

## TypeScript Support

Full TypeScript support is provided:

```typescript
import type { ThreeLensContext } from '@3lens/vue-bridge';

// Type-safe context usage
function processContext(ctx: ThreeLensContext) {
  const currentFps: number = ctx.fps.value;
  const probe: DevtoolProbe | null = ctx.probe.value;
}
```

---

## Related

- [ThreeLensPlugin](./plugin.md) - Automatic context provision
- [createThreeLens](./create-three-lens.md) - Manual context creation
- [useThreeLens](./composables.md#usethreelens) - Composable for injection
- [Vue Provide/Inject](https://vuejs.org/guide/components/provide-inject.html) - Vue documentation
