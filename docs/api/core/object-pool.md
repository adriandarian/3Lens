# ObjectPool

The ObjectPool utility provides memory-efficient object reuse to reduce garbage collection pressure in hot paths like per-frame statistics collection and scene traversal.

## Overview

```typescript
import { ObjectPool, ArrayPool } from '@3lens/core';

// Create a pool for vector objects
const vectorPool = new ObjectPool({
  factory: () => ({ x: 0, y: 0, z: 0 }),
  reset: (v) => { v.x = 0; v.y = 0; v.z = 0; },
  initialSize: 10,
  maxSize: 100,
});

// Acquire and use
const vec = vectorPool.acquire();
vec.x = 10;
// ... use vec ...
vectorPool.release(vec);
```

## ObjectPool Class

Generic object pool for reusing objects and reducing GC pressure.

### Constructor

```typescript
new ObjectPool<T>(options: ObjectPoolOptions<T>)
```

### ObjectPoolOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `factory` | `() => T` | (required) | Factory function to create new objects |
| `reset` | `(obj: T) => void` | - | Optional function to clean objects before reuse |
| `initialSize` | `number` | 0 | Pre-allocate this many objects |
| `maxSize` | `number` | 100 | Maximum pool size (prevents unbounded growth) |
| `name` | `string` | 'ObjectPool' | Name for debugging purposes |

### Methods

#### acquire()

Get an object from the pool or create a new one.

```typescript
acquire(): T
```

**Returns:** An object from the pool, or a newly created one if pool is empty

#### release()

Return an object to the pool for reuse.

```typescript
release(obj: T): void
```

The object is reset (if reset function provided) and added back to the pool. If pool is at `maxSize`, the object is discarded.

#### releaseAll()

Release multiple objects back to the pool.

```typescript
releaseAll(objects: T[]): void
```

#### clear()

Remove all objects from the pool.

```typescript
clear(): void
```

#### getStats()

Get pool statistics for monitoring.

```typescript
getStats(): PoolStats
```

### PoolStats Interface

```typescript
interface PoolStats {
  /** Current number of objects in the pool */
  available: number;
  /** Total objects created by this pool */
  totalCreated: number;
  /** Number of times acquire() was called */
  acquireCount: number;
  /** Number of times release() was called */
  releaseCount: number;
  /** Number of objects discarded (pool was full) */
  discardedCount: number;
  /** Hit rate (reused vs created) */
  hitRate: number;
}
```

## ArrayPool Class

Specialized pool for reusing arrays with different lengths.

```typescript
import { ArrayPool } from '@3lens/core';

const arrayPool = new ArrayPool<number>({
  maxSize: 50,
  name: 'NumberArrayPool',
});

// Acquire array of specific length
const arr = arrayPool.acquire(100);
// ... use arr ...
arrayPool.release(arr);
```

### Constructor

```typescript
new ArrayPool<T>(options?: { maxSize?: number; name?: string })
```

### Methods

#### acquire()

Get an array of the specified length.

```typescript
acquire(length?: number): T[]
```

Arrays are bucketed by powers of 2 (8, 16, 32, 64, 128, 256, 512, 1024) for efficient reuse.

#### release()

Return an array to the pool.

```typescript
release(arr: T[]): void
```

The array is cleared (`length = 0`) before storage.

## Built-in Typed Pools

3Lens provides pre-configured pools for common objects:

### PooledFrameStats

```typescript
interface PooledFrameStats {
  frame: number;
  timestamp: number;
  deltaTimeMs: number;
  cpuTimeMs: number;
  gpuTimeMs: number | undefined;
  triangles: number;
  drawCalls: number;
  // ... all FrameStats fields
}
```

### PooledVector3

```typescript
interface PooledVector3 {
  x: number;
  y: number;
  z: number;
}
```

## Usage Examples

### Per-Frame Statistics

```typescript
const statsPool = new ObjectPool({
  factory: () => ({
    fps: 0,
    drawCalls: 0,
    triangles: 0,
  }),
  reset: (s) => {
    s.fps = 0;
    s.drawCalls = 0;
    s.triangles = 0;
  },
  maxSize: 60, // ~1 second of history at 60fps
});

function collectFrameStats() {
  const stats = statsPool.acquire();
  stats.fps = currentFps;
  stats.drawCalls = renderer.info.render.calls;
  stats.triangles = renderer.info.render.triangles;
  return stats;
}

// After processing
statsPool.release(stats);
```

### Scene Traversal

```typescript
const nodePool = new ObjectPool({
  factory: () => ({
    uuid: '',
    name: '',
    children: [] as string[],
  }),
  reset: (node) => {
    node.uuid = '';
    node.name = '';
    node.children.length = 0;
  },
  initialSize: 50,
  maxSize: 1000,
});

const childrenPool = new ArrayPool<string>({ maxSize: 100 });

function traverseScene(object: THREE.Object3D) {
  const node = nodePool.acquire();
  node.uuid = object.uuid;
  node.name = object.name;
  
  const children = childrenPool.acquire(object.children.length);
  for (let i = 0; i < object.children.length; i++) {
    children[i] = object.children[i].uuid;
  }
  node.children = children;
  
  return node;
}
```

### Monitoring Pool Health

```typescript
const pool = new ObjectPool({ /* ... */ });

// Periodically check pool stats
setInterval(() => {
  const stats = pool.getStats();
  
  console.log(`Pool ${pool.getName()}:`);
  console.log(`  Available: ${stats.available}`);
  console.log(`  Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
  console.log(`  Discarded: ${stats.discardedCount}`);
  
  // Warn if hit rate is low
  if (stats.hitRate < 0.5 && stats.acquireCount > 100) {
    console.warn('Low pool hit rate - consider increasing maxSize');
  }
}, 10000);
```

## Best Practices

1. **Always release objects** - Unreleased objects cause memory leaks and reduce pool effectiveness

2. **Provide reset functions** - Ensure objects are clean before reuse to avoid bugs

3. **Size pools appropriately** - Too small = frequent allocations, too large = wasted memory

4. **Pre-allocate for hot paths** - Use `initialSize` for pools used in render loops

5. **Monitor hit rates** - Low hit rates indicate pool is undersized or objects aren't being released

## Performance Considerations

| Pool Size | Memory Usage | GC Pressure | Hit Rate |
|-----------|-------------|-------------|----------|
| Too small | Low | High | Low |
| Optimal | Moderate | Low | High |
| Too large | High | Low | High |

## See Also

- [Memoization](./memoization.md) - Caching for expensive computations
- [WorkerProcessor](./worker-processor.md) - Offload processing to workers
- [PerformanceTracker](./performance-tracker.md) - Frame statistics tracking
