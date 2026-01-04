# Memoization Utilities

The Memoization module provides high-performance caching for expensive computations commonly used in devtools operations like scene traversal, metrics calculation, and property formatting.

## Overview

```typescript
import { memoize, memoizeOne, LRUCache, FrameMemoizer } from '@3lens/core';

// Memoize an expensive function
const computeBoundingBox = memoize(
  (mesh: THREE.Mesh) => new THREE.Box3().setFromObject(mesh),
  { maxSize: 50, ttl: 5000, name: 'boundingBoxCache' }
);

// First call - computes and caches
const box1 = computeBoundingBox(mesh);

// Second call with same mesh - returns cached value
const box2 = computeBoundingBox(mesh);
```

## memoize()

Create a memoized version of a function with LRU caching.

```typescript
function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options?: MemoizeOptions
): MemoizedFunction<T>
```

### MemoizeOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxSize` | `number` | 100 | Maximum cached entries |
| `ttl` | `number` | Infinity | Time-to-live in milliseconds |
| `keyResolver` | `(...args) => string` | defaultKeyResolver | Custom key generation |
| `name` | `string` | function name | Name for debugging |

### MemoizedFunction Methods

The returned memoized function has additional methods:

```typescript
interface MemoizedFunction<T> {
  (...args: Parameters<T>): ReturnType<T>;
  
  /** Clear the cache */
  clear(): void;
  
  /** Get cache statistics */
  getStats(): MemoStats;
  
  /** Check if arguments are cached */
  has(...args: Parameters<T>): boolean;
  
  /** Manually set a cache entry */
  set(args: Parameters<T>, value: ReturnType<T>): void;
  
  /** Delete a specific entry */
  delete(...args: Parameters<T>): boolean;
  
  /** Cache name */
  readonly name: string;
}
```

### Example

```typescript
const getObjectMetrics = memoize(
  (obj: THREE.Object3D) => ({
    triangles: countTriangles(obj),
    materials: collectMaterials(obj),
    boundingBox: new THREE.Box3().setFromObject(obj),
  }),
  {
    maxSize: 200,
    ttl: 10000, // 10 second cache
    name: 'objectMetrics',
  }
);

// Use the memoized function
const metrics = getObjectMetrics(scene);

// Check cache stats
const stats = getObjectMetrics.getStats();
console.log(`Hit rate: ${stats.hitRate.toFixed(1)}%`);

// Manually invalidate
getObjectMetrics.delete(scene);

// Clear all
getObjectMetrics.clear();
```

## memoizeOne()

Memoize only the most recent call. Useful for functions called repeatedly with the same arguments.

```typescript
function memoizeOne<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options?: { keyResolver?: (...args) => string; name?: string }
): MemoizedFunction<T>
```

### Example

```typescript
const getSceneStats = memoizeOne(
  (scene: THREE.Scene) => computeSceneStats(scene),
  { name: 'sceneStats' }
);

// Same scene - cached
const stats1 = getSceneStats(scene); // Computes
const stats2 = getSceneStats(scene); // Returns cached

// Different scene - recomputes
const stats3 = getSceneStats(otherScene); // Computes, evicts previous
```

## LRUCache Class

Low-level LRU (Least Recently Used) cache implementation.

```typescript
import { LRUCache } from '@3lens/core';

const cache = new LRUCache<string, number>({
  maxSize: 100,
  ttl: 5000,
  name: 'myCache',
});
```

### Constructor Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxSize` | `number` | 100 | Maximum entries |
| `ttl` | `number` | Infinity | Time-to-live (ms) |
| `name` | `string` | 'LRUCache' | Debug name |

### Methods

#### get()

Get a value, updating LRU order.

```typescript
get(key: K): V | undefined
```

#### set()

Set a value, evicting oldest if at capacity.

```typescript
set(key: K, value: V): void
```

#### has()

Check if key exists and is not expired.

```typescript
has(key: K): boolean
```

#### peek()

Check existence without updating LRU order or stats.

```typescript
peek(key: K): { exists: boolean; value: V | undefined }
```

#### delete()

Remove a specific entry.

```typescript
delete(key: K): boolean
```

#### clear()

Remove all entries.

```typescript
clear(): void
```

#### prune()

Remove all expired entries.

```typescript
prune(): number // Returns count of pruned entries
```

#### getStats()

Get cache statistics.

```typescript
getStats(): MemoStats
```

### MemoStats Interface

```typescript
interface MemoStats {
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Current cached entries */
  size: number;
  /** Maximum cache size */
  maxSize: number;
  /** Hit rate percentage (0-100) */
  hitRate: number;
  /** Evictions due to size limit */
  evictions: number;
  /** Expirations due to TTL */
  expirations: number;
}
```

## FrameMemoizer Class

Manages memoized functions that invalidate each frame. Useful for per-frame computations that should only run once per render.

```typescript
import { FrameMemoizer } from '@3lens/core';

const frameMemo = new FrameMemoizer();

const getVisibleMeshes = frameMemo.memoize(
  (scene: THREE.Scene, camera: THREE.Camera) => frustumCull(scene, camera),
  { name: 'visibleMeshes' }
);

// In render loop
function render() {
  frameMemo.tick(); // Invalidates all frame caches
  
  const visible = getVisibleMeshes(scene, camera); // Computes
  const visible2 = getVisibleMeshes(scene, camera); // Returns cached
  
  requestAnimationFrame(render);
}
```

### Methods

#### tick()

Signal new frame, invalidating all registered caches.

```typescript
tick(): void
```

#### frame

Get current frame number.

```typescript
get frame(): number
```

#### memoize()

Create a memoized function bound to this frame counter.

```typescript
memoize<T>(fn: T, options?: MemoizeOptions): MemoizedFunction<T>
```

#### memoizeOne()

Create a single-value memoized function bound to this frame counter.

```typescript
memoizeOne<T>(fn: T, options?): MemoizedFunction<T>
```

#### clearAll()

Clear all registered memoized functions.

```typescript
clearAll(): void
```

## Key Resolution

The default key resolver handles common cases:

| Argument Type | Key Generation |
|--------------|----------------|
| `null` | `'__null__'` |
| `undefined` | `'__undefined__'` |
| Object with `uuid` | `obj.uuid` |
| Object with `id` | `'id:' + obj.id` |
| Other objects | `JSON.stringify(obj)` |
| Primitives | `String(arg)` |
| Multiple args | `'arg1::arg2::arg3'` |

### Custom Key Resolver

```typescript
const memoized = memoize(
  (mesh: THREE.Mesh, options: Options) => process(mesh, options),
  {
    keyResolver: (mesh, options) => 
      `${mesh.uuid}:${options.detail}:${options.quality}`,
  }
);
```

## Usage Examples

### Caching Material Analysis

```typescript
const analyzeMaterial = memoize(
  (material: THREE.Material) => ({
    type: material.type,
    uniforms: extractUniforms(material),
    defines: material.defines,
    shaderChunks: analyzeShader(material),
  }),
  {
    maxSize: 100,
    ttl: 30000, // 30 seconds
    name: 'materialAnalysis',
  }
);
```

### Caching Geometry Stats

```typescript
const getGeometryStats = memoize(
  (geometry: THREE.BufferGeometry) => ({
    vertexCount: geometry.attributes.position?.count ?? 0,
    faceCount: geometry.index 
      ? geometry.index.count / 3 
      : (geometry.attributes.position?.count ?? 0) / 3,
    boundingBox: geometry.boundingBox?.clone() ?? new THREE.Box3(),
    hasNormals: !!geometry.attributes.normal,
    hasUVs: !!geometry.attributes.uv,
  }),
  {
    maxSize: 500,
    name: 'geometryStats',
  }
);
```

### Per-Frame Frustum Culling

```typescript
const frameMemo = new FrameMemoizer();

const getVisibleObjects = frameMemo.memoize(
  (scene: THREE.Scene, camera: THREE.Camera) => {
    const visible: THREE.Object3D[] = [];
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );
    
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const box = new THREE.Box3().setFromObject(obj);
        if (frustum.intersectsBox(box)) {
          visible.push(obj);
        }
      }
    });
    
    return visible;
  },
  { name: 'frustumCull' }
);

// In render loop
frameMemo.tick();
const visible = getVisibleObjects(scene, camera);
```

## Performance Monitoring

```typescript
const memoized = memoize(fn, { name: 'myFunction' });

// After some usage
const stats = memoized.getStats();

console.log(`Cache performance for ${memoized.name}:`);
console.log(`  Size: ${stats.size}/${stats.maxSize}`);
console.log(`  Hit rate: ${stats.hitRate.toFixed(1)}%`);
console.log(`  Hits: ${stats.hits}, Misses: ${stats.misses}`);
console.log(`  Evictions: ${stats.evictions}`);
console.log(`  Expirations: ${stats.expirations}`);

// Optimize based on stats
if (stats.hitRate < 50 && stats.evictions > 100) {
  console.warn('Consider increasing maxSize');
}
```

## See Also

- [ObjectPool](./object-pool.md) - Object reuse for GC reduction
- [WorkerProcessor](./worker-processor.md) - Offload heavy computations
- [PerformanceTracker](./performance-tracker.md) - Frame time tracking
