# Core Composables

The Vue bridge provides composables for accessing the 3Lens context and probe. These form the foundation for all other Vue bridge functionality.

## useThreeLens

Access the full 3Lens context. Throws an error if used outside of a provider.

### Import

```typescript
import { useThreeLens } from '@3lens/vue-bridge';
```

### Signature

```typescript
function useThreeLens(): ThreeLensContext
```

### Returns

Returns the full [ThreeLensContext](./provide-inject.md#threelenscontext).

### Usage

```vue
<script setup>
import { useThreeLens } from '@3lens/vue-bridge';

const {
  // State
  probe,
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
  toggleOverlay,
  showOverlay,
  hideOverlay,
} = useThreeLens();
</script>

<template>
  <div v-if="isReady">
    <p>{{ fps }} FPS | {{ drawCalls }} draw calls</p>
    <button @click="toggleOverlay">Toggle Devtools</button>
  </div>
  <div v-else>Loading devtools...</div>
</template>
```

### Error Handling

```typescript
// This will throw if plugin not installed
try {
  const context = useThreeLens();
} catch (error) {
  console.error('ThreeLens not available:', error.message);
}
```

---

## useThreeLensOptional

Access the 3Lens context without throwing. Returns `undefined` if not available.

### Import

```typescript
import { useThreeLensOptional } from '@3lens/vue-bridge';
```

### Signature

```typescript
function useThreeLensOptional(): ThreeLensContext | undefined
```

### Usage

```vue
<script setup>
import { useThreeLensOptional } from '@3lens/vue-bridge';

const context = useThreeLensOptional();

function logStats() {
  if (context) {
    console.log('FPS:', context.fps.value);
  } else {
    console.log('Devtools not available');
  }
}
</script>

<template>
  <div v-if="context">
    {{ context.fps.value }} FPS
  </div>
</template>
```

### Use Cases

- Components that should work with or without devtools
- Optional debug overlays
- Shared component libraries

---

## useProbe

Access the probe instance directly. Throws if probe is not initialized.

### Import

```typescript
import { useProbe } from '@3lens/vue-bridge';
```

### Signature

```typescript
function useProbe(): ComputedRef<DevtoolProbe>
```

### Usage

```vue
<script setup>
import { useProbe } from '@3lens/vue-bridge';

const probe = useProbe();

function takeSnapshot() {
  const snapshot = probe.value.takeSnapshot();
  console.log('Objects in scene:', snapshot.root.children.length);
}

function observeRenderer(renderer: THREE.WebGLRenderer) {
  probe.value.observeRenderer(renderer);
}
</script>
```

### Advanced Operations

```vue
<script setup>
import { useProbe } from '@3lens/vue-bridge';
import { watch } from 'vue';

const probe = useProbe();

// Set up custom callbacks
watch(probe, (p) => {
  if (!p) return;
  
  p.onFrameStats((stats) => {
    if (stats.fps < 30) {
      console.warn('Performance degradation detected');
    }
  });
  
  p.onSelectionChanged((node) => {
    if (node) {
      console.log('Selected:', node.ref.name);
    }
  });
}, { immediate: true });
</script>
```

---

## useProbeOptional

Access the probe instance without throwing. Returns `null` if not available.

### Import

```typescript
import { useProbeOptional } from '@3lens/vue-bridge';
```

### Signature

```typescript
function useProbeOptional(): ComputedRef<DevtoolProbe | null>
```

### Usage

```vue
<script setup>
import { useProbeOptional } from '@3lens/vue-bridge';

const probe = useProbeOptional();

function maybeObserve(renderer: THREE.WebGLRenderer) {
  probe.value?.observeRenderer(renderer);
}
</script>
```

---

## useSelectedObject

Access and manage the currently selected object.

### Import

```typescript
import { useSelectedObject } from '@3lens/vue-bridge';
```

### Signature

```typescript
function useSelectedObject(): UseSelectedObjectReturn
```

### Return Value

```typescript
interface UseSelectedObjectReturn {
  /**
   * The currently selected scene node
   */
  selectedNode: Ref<SceneNode | null>;

  /**
   * UUID of the selected object
   */
  selectedUuid: ComputedRef<string | null>;

  /**
   * Name of the selected object
   */
  selectedName: ComputedRef<string | null>;

  /**
   * Type of the selected object (Mesh, Group, etc.)
   */
  selectedType: ComputedRef<string | null>;

  /**
   * Whether anything is selected
   */
  hasSelection: ComputedRef<boolean>;

  /**
   * Select an object by UUID
   */
  select: (uuid: string) => void;

  /**
   * Clear the current selection
   */
  clear: () => void;

  /**
   * Check if a specific object is selected
   */
  isSelected: (uuid: string) => boolean;
}
```

### Usage

```vue
<script setup>
import { useSelectedObject } from '@3lens/vue-bridge';

const {
  selectedNode,
  selectedName,
  selectedType,
  hasSelection,
  select,
  clear,
  isSelected,
} = useSelectedObject();
</script>

<template>
  <div class="inspector">
    <template v-if="hasSelection">
      <h3>{{ selectedName || 'Unnamed Object' }}</h3>
      <p>Type: {{ selectedType }}</p>
      
      <div v-if="selectedNode">
        <h4>Position</h4>
        <p>X: {{ selectedNode.ref.position.x.toFixed(2) }}</p>
        <p>Y: {{ selectedNode.ref.position.y.toFixed(2) }}</p>
        <p>Z: {{ selectedNode.ref.position.z.toFixed(2) }}</p>
      </div>
      
      <button @click="clear">Deselect</button>
    </template>
    
    <template v-else>
      <p>Click an object to inspect</p>
    </template>
  </div>
</template>
```

### Selection Highlighting

```vue
<script setup>
import { useSelectedObject } from '@3lens/vue-bridge';
import { watch } from 'vue';
import * as THREE from 'three';

const { selectedNode } = useSelectedObject();

// Highlight selected object
let originalMaterial: THREE.Material | null = null;
const highlightMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x00ff00, 
  wireframe: true 
});

watch(selectedNode, (newNode, oldNode) => {
  // Restore previous
  if (oldNode?.ref instanceof THREE.Mesh && originalMaterial) {
    oldNode.ref.material = originalMaterial;
  }
  
  // Highlight new
  if (newNode?.ref instanceof THREE.Mesh) {
    originalMaterial = newNode.ref.material as THREE.Material;
    newNode.ref.material = highlightMaterial;
  }
});
</script>
```

---

## Composable Comparison

| Composable | Throws | Returns | Use Case |
|------------|--------|---------|----------|
| `useThreeLens` | Yes | `ThreeLensContext` | Standard usage |
| `useThreeLensOptional` | No | `ThreeLensContext \| undefined` | Optional integration |
| `useProbe` | Yes | `ComputedRef<DevtoolProbe>` | Direct probe access |
| `useProbeOptional` | No | `ComputedRef<DevtoolProbe \| null>` | Safe probe access |
| `useSelectedObject` | Yes | `UseSelectedObjectReturn` | Selection management |

---

## Related

- [ThreeLensPlugin](./plugin.md) - Plugin installation
- [Provide/Inject Pattern](./provide-inject.md) - Context distribution
- [Metric Composables](./metric-composables.md) - Performance tracking
