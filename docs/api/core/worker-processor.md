# WorkerProcessor

The WorkerProcessor offloads computationally expensive operations to a Web Worker, keeping the main rendering thread responsive.

## Overview

```typescript
import { WorkerProcessor } from '@3lens/core';

const processor = new WorkerProcessor({
  maxConcurrentTasks: 4,
  taskTimeout: 5000,
  enableLogging: true,
});

// Offload benchmark calculation
const score = await processor.calculateBenchmark(frameStats, config);

// Analyze memory leaks in worker
const leakReport = await processor.analyzeLeaks(
  events, activeResources, memoryHistory, startTime, options
);
```

## Constructor

```typescript
new WorkerProcessor(options?: WorkerProcessorOptions)
```

### WorkerProcessorOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `workerUrl` | `string` | undefined | Custom worker script URL |
| `maxConcurrentTasks` | `number` | 8 | Maximum parallel tasks |
| `taskTimeout` | `number` | 10000 | Task timeout in ms |
| `enableLogging` | `boolean` | false | Enable debug logging |

## Task Methods

### calculateBenchmark()

Calculate performance benchmark score in a worker thread.

```typescript
async calculateBenchmark(
  stats: FrameStats,
  config?: BenchmarkConfig
): Promise<BenchmarkScore>
```

**Example:**

```typescript
const score = await processor.calculateBenchmark(frameStats, {
  targetFps: 60,
  maxDrawCalls: 1000,
  maxTriangles: 2_000_000,
  weights: {
    timing: 0.35,
    drawCalls: 0.25,
    geometry: 0.20,
    memory: 0.12,
    stateChanges: 0.08,
  },
});

console.log(`Score: ${score.overall} (${score.grade})`);
console.log('Issues:', score.topIssues);
```

### analyzeLeaks()

Analyze resource lifecycle data for potential memory leaks.

```typescript
async analyzeLeaks(
  events: SerializedLifecycleEvent[],
  activeResources: SerializedActiveResource[],
  memoryHistory: Array<{ timestamp: number; estimatedBytes: number }>,
  sessionStartTime: number,
  options: {
    leakThresholdMs: number;
    memoryGrowthThresholdBytes: number;
  }
): Promise<LeakReport>
```

**Example:**

```typescript
const leakReport = await processor.analyzeLeaks(
  lifecycleEvents,
  currentResources,
  memorySnapshots,
  Date.now() - 60000, // 1 minute session
  {
    leakThresholdMs: 30000,           // 30 seconds without disposal
    memoryGrowthThresholdBytes: 10 * 1024 * 1024, // 10MB growth
  }
);

if (leakReport.potentialLeaks.length > 0) {
  console.warn('Potential leaks:', leakReport.potentialLeaks);
}
```

### aggregateStats()

Aggregate multiple frame statistics for summary metrics.

```typescript
async aggregateStats(
  stats: FrameStats[],
  windowSize?: number
): Promise<StatsAggregationResult>
```

**Returns `StatsAggregationResult`:**

```typescript
interface StatsAggregationResult {
  /** Average values across all stats */
  averages: {
    fps: number;
    frameTimeMs: number;
    drawCalls: number;
    triangles: number;
    points: number;
    lines: number;
    memoryGeometry: number;
    memoryTexture: number;
  };
  /** Minimum values */
  minimums: { /* same fields */ };
  /** Maximum values */
  maximums: { /* same fields */ };
  /** Standard deviations */
  standardDeviations: { /* same fields */ };
  /** Frame count analyzed */
  sampleCount: number;
}
```

**Example:**

```typescript
const aggregated = await processor.aggregateStats(frameHistory, 100);

console.log(`Average FPS: ${aggregated.averages.fps.toFixed(1)}`);
console.log(`FPS range: ${aggregated.minimums.fps} - ${aggregated.maximums.fps}`);
console.log(`Frame time σ: ${aggregated.standardDeviations.frameTimeMs.toFixed(2)}ms`);
```

### calculatePercentiles()

Calculate percentile values for performance analysis.

```typescript
async calculatePercentiles(
  values: number[],
  percentiles?: number[]
): Promise<PercentileResult>
```

**Returns `PercentileResult`:**

```typescript
interface PercentileResult {
  /** Map of percentile to value */
  percentiles: Record<number, number>;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Median (50th percentile) */
  median: number;
  /** Number of samples */
  count: number;
}
```

**Example:**

```typescript
const frameTimes = frameHistory.map(f => f.frameTimeMs);
const result = await processor.calculatePercentiles(frameTimes, [50, 90, 95, 99]);

console.log(`Median: ${result.percentiles[50].toFixed(2)}ms`);
console.log(`P99: ${result.percentiles[99].toFixed(2)}ms`);
console.log(`Range: ${result.min.toFixed(2)} - ${result.max.toFixed(2)}ms`);
```

### analyzeTrend()

Analyze performance trends over time with regression.

```typescript
async analyzeTrend(
  history: Array<{ timestamp: number; value: number }>,
  windowSize?: number,
  thresholds?: {
    improving: number;
    degrading: number;
  }
): Promise<TrendAnalysisResult>
```

**Returns `TrendAnalysisResult`:**

```typescript
interface TrendAnalysisResult {
  /** Overall trend direction */
  trend: 'improving' | 'stable' | 'degrading';
  /** Slope of linear regression */
  slope: number;
  /** Percentage change per second */
  changePerSecond: number;
  /** R-squared correlation coefficient */
  correlation: number;
  /** Moving average values */
  movingAverage: number[];
  /** Confidence in the trend analysis */
  confidence: 'high' | 'medium' | 'low';
}
```

**Example:**

```typescript
const fpsHistory = frames.map(f => ({
  timestamp: f.timestamp,
  value: f.fps,
}));

const trend = await processor.analyzeTrend(fpsHistory, 60);

if (trend.trend === 'degrading' && trend.confidence === 'high') {
  console.warn(`FPS degrading at ${trend.changePerSecond.toFixed(1)}/sec`);
}
```

### executeCustom()

Execute a custom task in the worker thread.

```typescript
async executeCustom<T>(taskName: string, data: unknown): Promise<T>
```

**Example:**

```typescript
const result = await processor.executeCustom<number[]>('customSort', {
  values: largeArray,
  algorithm: 'quicksort',
});
```

## Management Methods

### getStats()

Get worker performance statistics.

```typescript
getStats(): WorkerStats
```

**WorkerStats Interface:**

```typescript
interface WorkerStats {
  /** Whether worker is available */
  isAvailable: boolean;
  /** Total tasks submitted */
  totalTasks: number;
  /** Successfully completed tasks */
  completedTasks: number;
  /** Failed tasks */
  failedTasks: number;
  /** Tasks that timed out */
  timedOutTasks: number;
  /** Currently pending tasks */
  pendingTasks: number;
  /** Average processing time in ms */
  avgProcessingTimeMs: number;
}
```

### isAvailable()

Check if the worker is available.

```typescript
isAvailable(): boolean
```

### getPendingTaskCount()

Get number of pending tasks.

```typescript
getPendingTaskCount(): number
```

### cancelAllTasks()

Cancel all pending tasks with an error.

```typescript
cancelAllTasks(): void
```

### dispose()

Terminate the worker and clean up resources.

```typescript
dispose(): void
```

## Task Types

The WorkerProcessor supports these built-in task types:

| Task Type | Method | Description |
|-----------|--------|-------------|
| `benchmark` | `calculateBenchmark()` | Calculate performance score |
| `leakAnalysis` | `analyzeLeaks()` | Detect memory leaks |
| `statsAggregation` | `aggregateStats()` | Aggregate frame statistics |
| `percentileCalc` | `calculatePercentiles()` | Calculate percentiles |
| `trendAnalysis` | `analyzeTrend()` | Analyze performance trends |
| `custom` | `executeCustom()` | Run custom task |

## Usage Examples

### Real-time Performance Analysis

```typescript
const processor = new WorkerProcessor({ maxConcurrentTasks: 4 });
const frameBuffer: FrameStats[] = [];

function onFrame(stats: FrameStats) {
  frameBuffer.push(stats);
  
  // Analyze every 60 frames
  if (frameBuffer.length >= 60) {
    analyzePerformance([...frameBuffer]);
    frameBuffer.length = 0;
  }
}

async function analyzePerformance(frames: FrameStats[]) {
  // Run analyses in parallel
  const [aggregated, percentiles, benchmark] = await Promise.all([
    processor.aggregateStats(frames),
    processor.calculatePercentiles(frames.map(f => f.frameTimeMs)),
    processor.calculateBenchmark(frames[frames.length - 1]),
  ]);
  
  updateUI({
    avgFps: aggregated.averages.fps,
    p99FrameTime: percentiles.percentiles[99],
    score: benchmark.overall,
    grade: benchmark.grade,
  });
}
```

### Continuous Leak Detection

```typescript
const processor = new WorkerProcessor();

async function checkForLeaks(tracker: ResourceTracker) {
  const events = tracker.getLifecycleEvents();
  const active = tracker.getActiveResources();
  const memory = tracker.getMemoryHistory();
  
  const report = await processor.analyzeLeaks(
    events,
    active,
    memory,
    tracker.sessionStart,
    {
      leakThresholdMs: 60000,              // 1 minute
      memoryGrowthThresholdBytes: 50 * 1024 * 1024, // 50MB
    }
  );
  
  if (report.hasLeaks) {
    notifyLeakDetected(report);
  }
  
  return report;
}

// Check every 30 seconds
setInterval(() => checkForLeaks(resourceTracker), 30000);
```

### Monitoring Worker Health

```typescript
const processor = new WorkerProcessor({ enableLogging: true });

function monitorWorkerHealth() {
  const stats = processor.getStats();
  
  const successRate = stats.totalTasks > 0
    ? (stats.completedTasks / stats.totalTasks) * 100
    : 100;
  
  console.log(`Worker Status: ${stats.isAvailable ? 'OK' : 'UNAVAILABLE'}`);
  console.log(`Tasks: ${stats.completedTasks}/${stats.totalTasks} (${successRate.toFixed(1)}%)`);
  console.log(`Pending: ${stats.pendingTasks}`);
  console.log(`Avg Time: ${stats.avgProcessingTimeMs.toFixed(2)}ms`);
  console.log(`Timeouts: ${stats.timedOutTasks}`);
  
  if (stats.failedTasks > stats.totalTasks * 0.1) {
    console.warn('High failure rate detected');
  }
}
```

### Graceful Shutdown

```typescript
async function shutdown() {
  const processor = getWorkerProcessor();
  
  // Wait for pending tasks or cancel
  if (processor.getPendingTaskCount() > 0) {
    console.log(`Waiting for ${processor.getPendingTaskCount()} pending tasks...`);
    
    // Give tasks time to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Cancel remaining if any
    if (processor.getPendingTaskCount() > 0) {
      console.warn('Cancelling remaining tasks');
      processor.cancelAllTasks();
    }
  }
  
  processor.dispose();
  console.log('Worker disposed');
}
```

## Fallback Behavior

If Web Workers are unavailable (e.g., in certain environments), WorkerProcessor automatically falls back to main thread execution:

```typescript
const processor = new WorkerProcessor();

// This will run on main thread if workers unavailable
const result = await processor.calculateBenchmark(stats);

// Check if using fallback
if (!processor.isAvailable()) {
  console.warn('Running on main thread - may impact performance');
}
```

## Best Practices

1. **Batch operations** - Send larger datasets less frequently rather than many small tasks
2. **Monitor pending tasks** - Avoid overwhelming the worker with `maxConcurrentTasks`
3. **Handle timeouts** - Set appropriate `taskTimeout` for your workload
4. **Dispose properly** - Call `dispose()` when done to free resources
5. **Use parallel execution** - Multiple independent tasks can run concurrently

## See Also

- [PerformanceTracker](./performance-tracker.md) - Frame time tracking
- [Memoization](./memoization.md) - Cache expensive computations
- [ObjectPool](./object-pool.md) - Object pooling utilities
