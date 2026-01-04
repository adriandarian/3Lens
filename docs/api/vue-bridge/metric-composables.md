# Metric Composables

The Vue bridge provides several composables for tracking performance metrics. These return reactive `MetricValue` objects with current values, statistics, and history.

## MetricValue Interface

All metric composables return a ref containing:

```typescript
interface MetricValue<T = number> {
  /**
   * Current value (may be smoothed)
   */
  current: T;

  /**
   * Minimum observed value
   */
  min: T;

  /**
   * Maximum observed value
   */
  max: T;

  /**
   * Average of all observed values
   */
  avg: T;

  /**
   * History of recent values (up to 300 samples)
   */
  history: T[];
}
```

---

## useFPS

Track frames per second.

```typescript
import { useFPS } from '@3lens/vue-bridge';

const fps = useFPS(smoothed?: boolean);
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `smoothed` | `boolean` | `true` | Whether to smooth the value |

### Example

```vue
<script setup>
import { useFPS } from '@3lens/vue-bridge';

const fps = useFPS(true);
</script>

<template>
  <div class="fps-display">
    <span class="current">{{ fps.current.toFixed(0) }} FPS</span>
    <span class="range">
      Min: {{ fps.min.toFixed(0) }} / Max: {{ fps.max.toFixed(0) }}
    </span>
  </div>
</template>
```

---

## useFrameTime

Track frame render time in milliseconds.

```typescript
import { useFrameTime } from '@3lens/vue-bridge';

const frameTime = useFrameTime(smoothed?: boolean);
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `smoothed` | `boolean` | `false` | Whether to smooth the value |

### Example

```vue
<script setup>
import { useFrameTime } from '@3lens/vue-bridge';
import { computed } from 'vue';

const frameTime = useFrameTime();

const frameTimeColor = computed(() => {
  if (frameTime.value.current < 16.67) return 'green';
  if (frameTime.value.current < 33.33) return 'yellow';
  return 'red';
});
</script>

<template>
  <div :style="{ color: frameTimeColor }">
    {{ frameTime.current.toFixed(2) }}ms
  </div>
</template>
```

---

## useDrawCalls

Track WebGL draw calls per frame.

```typescript
import { useDrawCalls } from '@3lens/vue-bridge';

const drawCalls = useDrawCalls();
```

### Example

```vue
<script setup>
import { useDrawCalls } from '@3lens/vue-bridge';

const drawCalls = useDrawCalls();
</script>

<template>
  <div>
    Draw Calls: {{ drawCalls.current }}
    <small>(avg: {{ drawCalls.avg.toFixed(0) }})</small>
  </div>
</template>
```

---

## useTriangles

Track triangle count per frame.

```typescript
import { useTriangles } from '@3lens/vue-bridge';

const triangles = useTriangles();
```

### Example

```vue
<script setup>
import { useTriangles } from '@3lens/vue-bridge';
import { computed } from 'vue';

const triangles = useTriangles();

const formattedTris = computed(() => {
  const count = triangles.value.current;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
});
</script>

<template>
  <div>{{ formattedTris }} triangles</div>
</template>
```

---

## useGPUMemory

Track estimated GPU memory usage in bytes.

```typescript
import { useGPUMemory } from '@3lens/vue-bridge';

const gpuMemory = useGPUMemory();
```

### Example

```vue
<script setup>
import { useGPUMemory } from '@3lens/vue-bridge';
import { computed } from 'vue';

const gpuMemory = useGPUMemory();

const formattedMemory = computed(() => {
  const bytes = gpuMemory.value.current;
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
});
</script>

<template>
  <div>GPU Memory: {{ formattedMemory }}</div>
</template>
```

---

## useTextureCount

Track the number of textures in use.

```typescript
import { useTextureCount } from '@3lens/vue-bridge';

const textureCount = useTextureCount();
```

### Example

```vue
<script setup>
import { useTextureCount } from '@3lens/vue-bridge';

const textureCount = useTextureCount();
</script>

<template>
  <div>Textures: {{ textureCount.current }}</div>
</template>
```

---

## useGeometryCount

Track the number of geometries in use.

```typescript
import { useGeometryCount } from '@3lens/vue-bridge';

const geometryCount = useGeometryCount();
```

### Example

```vue
<script setup>
import { useGeometryCount } from '@3lens/vue-bridge';

const geometryCount = useGeometryCount();
</script>

<template>
  <div>Geometries: {{ geometryCount.current }}</div>
</template>
```

---

## useMetric (Custom Metrics)

Create custom metric extractors for any value in FrameStats.

```typescript
import { useMetric } from '@3lens/vue-bridge';

const metric = useMetric(
  extractor: (stats: FrameStats) => number,
  options?: UseMetricOptions
);
```

### Options

```typescript
interface UseMetricOptions {
  /**
   * How often to sample the metric (in frames)
   * @default 1
   */
  sampleRate?: number;

  /**
   * Whether to smooth the value over time
   * @default false
   */
  smoothed?: boolean;

  /**
   * Number of samples to use for smoothing
   * @default 10
   */
  smoothingSamples?: number;
}
```

### Example: GPU Time

```vue
<script setup>
import { useMetric } from '@3lens/vue-bridge';

const gpuTime = useMetric(
  (stats) => stats.gpuTimeMs ?? 0,
  { smoothed: true, smoothingSamples: 30 }
);
</script>

<template>
  <div>GPU Time: {{ gpuTime.current.toFixed(2) }}ms</div>
</template>
```

### Example: Custom Ratio

```vue
<script setup>
import { useMetric } from '@3lens/vue-bridge';

// Track triangles per draw call
const trisPerDraw = useMetric(
  (stats) => stats.drawCalls > 0 
    ? stats.triangles / stats.drawCalls 
    : 0,
  { smoothed: true }
);
</script>

<template>
  <div>Avg Tris/Draw: {{ trisPerDraw.current.toFixed(0) }}</div>
</template>
```

### Example: Sample Rate

```vue
<script setup>
import { useMetric } from '@3lens/vue-bridge';

// Only sample every 10 frames to reduce overhead
const memory = useMetric(
  (stats) => stats.memory?.jsHeapSize ?? 0,
  { sampleRate: 10 }
);
</script>
```

---

## Complete Stats Panel Example

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
import { computed } from 'vue';

const fps = useFPS(true);
const frameTime = useFrameTime();
const drawCalls = useDrawCalls();
const triangles = useTriangles();
const gpuMemory = useGPUMemory();
const textures = useTextureCount();
const geometries = useGeometryCount();

const performanceLevel = computed(() => {
  if (fps.value.current >= 55) return 'excellent';
  if (fps.value.current >= 30) return 'good';
  if (fps.value.current >= 20) return 'poor';
  return 'critical';
});

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}
</script>

<template>
  <div :class="['stats-panel', performanceLevel]">
    <div class="stat">
      <label>FPS</label>
      <value>{{ fps.current.toFixed(0) }}</value>
      <range>{{ fps.min.toFixed(0) }} - {{ fps.max.toFixed(0) }}</range>
    </div>
    
    <div class="stat">
      <label>Frame Time</label>
      <value>{{ frameTime.current.toFixed(2) }}ms</value>
    </div>
    
    <div class="stat">
      <label>Draw Calls</label>
      <value>{{ drawCalls.current }}</value>
    </div>
    
    <div class="stat">
      <label>Triangles</label>
      <value>{{ (triangles.current / 1000).toFixed(1) }}K</value>
    </div>
    
    <div class="stat">
      <label>GPU Memory</label>
      <value>{{ formatBytes(gpuMemory.current) }}</value>
    </div>
    
    <div class="stat">
      <label>Resources</label>
      <value>{{ textures.current }} tex / {{ geometries.current }} geo</value>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  font-family: monospace;
}

.stats-panel.excellent { border-left: 3px solid #4caf50; }
.stats-panel.good { border-left: 3px solid #8bc34a; }
.stats-panel.poor { border-left: 3px solid #ff9800; }
.stats-panel.critical { border-left: 3px solid #f44336; }

.stat {
  display: flex;
  flex-direction: column;
}

.stat label {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
}

.stat value {
  font-size: 18px;
  color: white;
}

.stat range {
  font-size: 10px;
  color: #666;
}
</style>
```

---

## Related

- [useThreeLens](./composables.md#usethreelens) - Access full context
- [FrameStats](/api/core/frame-stats) - Frame statistics interface
- [Performance Tracker](/api/core/performance-tracker) - Core tracking system
