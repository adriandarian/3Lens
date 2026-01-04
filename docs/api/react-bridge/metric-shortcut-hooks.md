# Metric Shortcut Hooks

The React bridge provides several shortcut hooks for commonly used metrics. These are convenience wrappers around `useMetric` with pre-configured extractors.

## Import

```tsx
import {
  useFPS,
  useFrameTime,
  useDrawCalls,
  useTriangles,
  useGPUMemory,
  useTextureCount,
  useGeometryCount,
} from '@3lens/react-bridge';
```

---

## useFPS

Get the current frames per second with optional smoothing.

### Signature

```tsx
function useFPS(smoothed?: boolean): MetricValue<number>
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `smoothed` | `boolean` | `true` | Whether to smooth the value over 30 samples |

### Example

```tsx
function FPSCounter() {
  const fps = useFPS();
  
  return (
    <div className={fps.current < 30 ? 'warning' : ''}>
      FPS: {fps.current.toFixed(0)}
    </div>
  );
}
```

### Raw vs Smoothed

```tsx
function FPSComparison() {
  const smoothedFPS = useFPS(true);   // Stable, less jumpy
  const rawFPS = useFPS(false);       // Real-time, more reactive

  return (
    <div>
      <p>Smoothed: {smoothedFPS.current.toFixed(0)}</p>
      <p>Raw: {rawFPS.current.toFixed(0)}</p>
    </div>
  );
}
```

---

## useFrameTime

Get the frame time in milliseconds.

### Signature

```tsx
function useFrameTime(smoothed?: boolean): MetricValue<number>
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `smoothed` | `boolean` | `false` | Whether to smooth the value |

### Example

```tsx
function FrameTimeDisplay() {
  const frameTime = useFrameTime();
  
  return (
    <div>
      <p>Frame Time: {frameTime.current.toFixed(2)}ms</p>
      <p>Target: {(1000/60).toFixed(2)}ms (60fps)</p>
    </div>
  );
}
```

---

## useDrawCalls

Get the number of draw calls per frame.

### Signature

```tsx
function useDrawCalls(): MetricValue<number>
```

### Example

```tsx
function DrawCallsDisplay() {
  const drawCalls = useDrawCalls();
  
  const status = drawCalls.current > 500 ? 'high' : 
                 drawCalls.current > 200 ? 'medium' : 'good';
  
  return (
    <div className={`draw-calls ${status}`}>
      Draw Calls: {drawCalls.current}
    </div>
  );
}
```

---

## useTriangles

Get the number of triangles rendered per frame.

### Signature

```tsx
function useTriangles(): MetricValue<number>
```

### Example

```tsx
function TriangleCounter() {
  const triangles = useTriangles();
  
  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };
  
  return (
    <div>
      Triangles: {formatNumber(triangles.current)}
    </div>
  );
}
```

---

## useGPUMemory

Get estimated GPU memory usage in bytes.

### Signature

```tsx
function useGPUMemory(): MetricValue<number>
```

### Example

```tsx
function MemoryDisplay() {
  const gpuMemory = useGPUMemory();
  
  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes} B`;
  };
  
  return (
    <div>
      GPU Memory: {formatBytes(gpuMemory.current)}
    </div>
  );
}
```

---

## useTextureCount

Get the number of textures in use.

### Signature

```tsx
function useTextureCount(): MetricValue<number>
```

### Example

```tsx
function TextureInfo() {
  const textureCount = useTextureCount();
  
  return (
    <div>
      <p>Textures: {textureCount.current}</p>
      <p>Peak: {textureCount.max}</p>
    </div>
  );
}
```

---

## useGeometryCount

Get the number of geometries in use.

### Signature

```tsx
function useGeometryCount(): MetricValue<number>
```

### Example

```tsx
function GeometryInfo() {
  const geometryCount = useGeometryCount();
  
  return (
    <div>
      Geometries: {geometryCount.current}
    </div>
  );
}
```

---

## Combined Dashboard Example

```tsx
function PerformanceDashboard() {
  const fps = useFPS();
  const frameTime = useFrameTime();
  const drawCalls = useDrawCalls();
  const triangles = useTriangles();
  const gpuMemory = useGPUMemory();
  const textureCount = useTextureCount();
  const geometryCount = useGeometryCount();

  return (
    <div className="performance-dashboard">
      <div className="metric">
        <label>FPS</label>
        <value className={fps.current < 30 ? 'bad' : fps.current < 55 ? 'warn' : 'good'}>
          {fps.current.toFixed(0)}
        </value>
      </div>

      <div className="metric">
        <label>Frame Time</label>
        <value>{frameTime.current.toFixed(2)}ms</value>
      </div>

      <div className="metric">
        <label>Draw Calls</label>
        <value className={drawCalls.current > 500 ? 'warn' : 'good'}>
          {drawCalls.current}
        </value>
      </div>

      <div className="metric">
        <label>Triangles</label>
        <value>{(triangles.current / 1000).toFixed(1)}K</value>
      </div>

      <div className="metric">
        <label>GPU Memory</label>
        <value>{(gpuMemory.current / (1024 * 1024)).toFixed(1)} MB</value>
      </div>

      <div className="metric">
        <label>Textures</label>
        <value>{textureCount.current}</value>
      </div>

      <div className="metric">
        <label>Geometries</label>
        <value>{geometryCount.current}</value>
      </div>
    </div>
  );
}
```

## Return Value

All hooks return a `MetricValue<number>` object:

| Property | Type | Description |
|----------|------|-------------|
| `current` | `number` | The current (or smoothed) value |
| `min` | `number` | Minimum value observed |
| `max` | `number` | Maximum value observed |
| `avg` | `number` | Average value over the history |
| `history` | `number[]` | Array of historical values |

## Related

- [useMetric](./use-metric.md) - Generic metric extraction hook
- [FrameStats](/api/core/frame-stats) - Full FrameStats interface
- [Performance Thresholds](/api/core/performance-thresholds) - Default threshold values
