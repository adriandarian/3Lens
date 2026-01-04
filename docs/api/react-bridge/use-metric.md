# useMetric

The `useMetric` hook extracts and tracks specific metrics from frame statistics, providing current values along with historical data and statistics.

## Import

```tsx
import { useMetric } from '@3lens/react-bridge';
```

## Usage

```tsx
import { useMetric } from '@3lens/react-bridge';

function FPSDisplay() {
  const fps = useMetric((stats) => stats.fps, { smoothed: true });

  return (
    <div>
      <span>FPS: {fps.current.toFixed(0)}</span>
      <span>Min: {fps.min.toFixed(0)}</span>
      <span>Max: {fps.max.toFixed(0)}</span>
    </div>
  );
}
```

## Signature

```tsx
function useMetric(
  extractor: (stats: FrameStats) => number,
  options?: UseMetricOptions
): MetricValue<number>
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `extractor` | `(stats: FrameStats) => number` | Function to extract the metric value from `FrameStats` |
| `options` | `UseMetricOptions` | Configuration options |

### UseMetricOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sampleRate` | `number` | `1` | How often to sample the metric (in frames). Use higher values to reduce updates |
| `smoothed` | `boolean` | `false` | Whether to smooth the value over time using a moving average |
| `smoothingSamples` | `number` | `10` | Number of samples to use for smoothing |

### Return Value: MetricValue

| Property | Type | Description |
|----------|------|-------------|
| `current` | `number` | The current (or smoothed) value |
| `min` | `number` | Minimum value observed |
| `max` | `number` | Maximum value observed |
| `avg` | `number` | Average value over the history |
| `history` | `number[]` | Array of historical values (up to 300 samples) |

## Examples

### Custom Metric Extraction

```tsx
function MemoryDisplay() {
  // Extract GPU memory in MB
  const gpuMemory = useMetric(
    (stats) => (stats.memory?.gpuMemoryEstimate ?? 0) / (1024 * 1024),
    { smoothed: true }
  );

  return (
    <div>
      <span>GPU Memory: {gpuMemory.current.toFixed(1)} MB</span>
    </div>
  );
}
```

### Performance Graph

```tsx
function FPSGraph() {
  const fps = useMetric((stats) => stats.fps, { smoothed: false });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw graph
    ctx.beginPath();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;

    fps.history.forEach((value, i) => {
      const x = (i / fps.history.length) * width;
      const y = height - (value / 120) * height; // Assuming max 120 FPS
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [fps.history]);

  return <canvas ref={canvasRef} width={200} height={50} />;
}
```

### Sample Rate for Heavy Metrics

```tsx
function DetailedStats() {
  // Sample expensive metrics less frequently
  const triangles = useMetric(
    (stats) => stats.triangles,
    { sampleRate: 10 } // Every 10th frame
  );

  const textures = useMetric(
    (stats) => stats.memory?.textureCount ?? 0,
    { sampleRate: 30 } // Every 30th frame
  );

  return (
    <div>
      <p>Triangles: {triangles.current.toLocaleString()}</p>
      <p>Textures: {textures.current}</p>
    </div>
  );
}
```

### Smoothing Comparison

```tsx
function SmoothingDemo() {
  const rawFPS = useMetric((stats) => stats.fps);
  const smoothedFPS = useMetric((stats) => stats.fps, {
    smoothed: true,
    smoothingSamples: 30,
  });

  return (
    <div>
      <p>Raw FPS: {rawFPS.current.toFixed(0)} (jumpy)</p>
      <p>Smoothed FPS: {smoothedFPS.current.toFixed(0)} (stable)</p>
    </div>
  );
}
```

### Statistics Display

```tsx
function PerformanceStats() {
  const fps = useMetric((stats) => stats.fps, { smoothed: true });
  const frameTime = useMetric((stats) => stats.frameTimeMs);

  return (
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Current</th>
          <th>Min</th>
          <th>Max</th>
          <th>Avg</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>FPS</td>
          <td>{fps.current.toFixed(0)}</td>
          <td>{fps.min.toFixed(0)}</td>
          <td>{fps.max.toFixed(0)}</td>
          <td>{fps.avg.toFixed(0)}</td>
        </tr>
        <tr>
          <td>Frame Time (ms)</td>
          <td>{frameTime.current.toFixed(2)}</td>
          <td>{frameTime.min.toFixed(2)}</td>
          <td>{frameTime.max.toFixed(2)}</td>
          <td>{frameTime.avg.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  );
}
```

### Performance Warnings

```tsx
function PerformanceMonitor() {
  const fps = useMetric((stats) => stats.fps, { smoothed: true, smoothingSamples: 30 });
  const drawCalls = useMetric((stats) => stats.drawCalls);

  const warnings = [];
  
  if (fps.current < 30) {
    warnings.push(`Low FPS: ${fps.current.toFixed(0)}`);
  }
  
  if (drawCalls.current > 500) {
    warnings.push(`High draw calls: ${drawCalls.current}`);
  }

  if (warnings.length === 0) return null;

  return (
    <div className="performance-warnings">
      {warnings.map((warning, i) => (
        <div key={i} className="warning">{warning}</div>
      ))}
    </div>
  );
}
```

## Available FrameStats Properties

Common properties available in `FrameStats`:

| Property | Type | Description |
|----------|------|-------------|
| `fps` | `number` | Frames per second |
| `frameTimeMs` | `number` | Frame time in milliseconds |
| `drawCalls` | `number` | Number of draw calls |
| `triangles` | `number` | Number of triangles rendered |
| `points` | `number` | Number of points rendered |
| `lines` | `number` | Number of lines rendered |
| `memory.gpuMemoryEstimate` | `number` | Estimated GPU memory in bytes |
| `memory.textureCount` | `number` | Number of textures |
| `memory.geometryCount` | `number` | Number of geometries |

## Related

- [useFPS](./use-fps.md) - Shortcut hook for FPS
- [useDrawCalls](./use-draw-calls.md) - Shortcut hook for draw calls
- [FrameStats](/api/core/frame-stats) - Full FrameStats interface
