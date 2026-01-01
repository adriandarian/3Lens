/**
 * Object Pool Implementation
 * 
 * Provides memory-efficient object reuse to reduce garbage collection pressure
 * in hot paths like per-frame statistics collection and scene traversal.
 * 
 * @module utils/ObjectPool
 */

/**
 * Factory function type for creating new pool objects
 */
export type PoolFactory<T> = () => T;

/**
 * Reset function type for cleaning objects before reuse
 */
export type PoolReset<T> = (obj: T) => void;

/**
 * Configuration options for ObjectPool
 */
export interface ObjectPoolOptions<T> {
  /** Factory function to create new objects */
  factory: PoolFactory<T>;
  /** Optional reset function to clean objects before reuse */
  reset?: PoolReset<T>;
  /** Initial pool size (pre-allocate objects) */
  initialSize?: number;
  /** Maximum pool size (prevents unbounded growth) */
  maxSize?: number;
  /** Name for debugging purposes */
  name?: string;
}

/**
 * Pool statistics for monitoring
 */
export interface PoolStats {
  /** Current number of objects in the pool */
  available: number;
  /** Total objects created by this pool */
  totalCreated: number;
  /** Number of times acquire() was called */
  acquireCount: number;
  /** Number of times release() was called */
  releaseCount: number;
  /** Number of objects that were discarded (pool was full) */
  discardedCount: number;
  /** Hit rate (reused vs created) */
  hitRate: number;
}

/**
 * Generic object pool for reusing objects and reducing GC pressure.
 * 
 * @example
 * ```typescript
 * const vectorPool = new ObjectPool({
 *   factory: () => ({ x: 0, y: 0, z: 0 }),
 *   reset: (v) => { v.x = 0; v.y = 0; v.z = 0; },
 *   initialSize: 10,
 *   maxSize: 100,
 * });
 * 
 * const vec = vectorPool.acquire();
 * vec.x = 10;
 * // ... use vec ...
 * vectorPool.release(vec);
 * ```
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private readonly factory: PoolFactory<T>;
  private readonly reset?: PoolReset<T>;
  private readonly maxSize: number;
  private readonly name: string;

  // Statistics
  private _totalCreated = 0;
  private _acquireCount = 0;
  private _releaseCount = 0;
  private _discardedCount = 0;

  constructor(options: ObjectPoolOptions<T>) {
    this.factory = options.factory;
    this.reset = options.reset;
    this.maxSize = options.maxSize ?? 100;
    this.name = options.name ?? 'ObjectPool';

    // Pre-allocate initial objects
    const initialSize = options.initialSize ?? 0;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
      this._totalCreated++;
    }
  }

  /**
   * Acquire an object from the pool or create a new one
   */
  acquire(): T {
    this._acquireCount++;

    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }

    // Pool empty, create new object
    this._totalCreated++;
    return this.factory();
  }

  /**
   * Release an object back to the pool for reuse
   */
  release(obj: T): void {
    this._releaseCount++;

    // Reset the object if a reset function is provided
    if (this.reset) {
      this.reset(obj);
    }

    // Only add to pool if under max size
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    } else {
      this._discardedCount++;
    }
  }

  /**
   * Release multiple objects back to the pool
   */
  releaseAll(objects: T[]): void {
    for (const obj of objects) {
      this.release(obj);
    }
  }

  /**
   * Clear all objects from the pool
   */
  clear(): void {
    this.pool.length = 0;
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    const totalAcquires = this._acquireCount;
    const poolHits = this._releaseCount - this._discardedCount;
    const hitRate = totalAcquires > 0 ? Math.min(poolHits / totalAcquires, 1) : 0;

    return {
      available: this.pool.length,
      totalCreated: this._totalCreated,
      acquireCount: this._acquireCount,
      releaseCount: this._releaseCount,
      discardedCount: this._discardedCount,
      hitRate,
    };
  }

  /**
   * Get the pool name (for debugging)
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get current pool size
   */
  get size(): number {
    return this.pool.length;
  }
}

/**
 * ArrayPool - Specialized pool for reusing arrays
 * 
 * More efficient than ObjectPool for arrays since it can
 * handle different array lengths and properly clear them.
 */
export class ArrayPool<T> {
  private pools: Map<number, T[][]> = new Map();
  private readonly maxSize: number;
  private readonly name: string;

  // Statistics
  private _acquireCount = 0;
  private _releaseCount = 0;
  private _totalCreated = 0;

  constructor(options?: { maxSize?: number; name?: string }) {
    this.maxSize = options?.maxSize ?? 50;
    this.name = options?.name ?? 'ArrayPool';
  }

  /**
   * Acquire an array of the specified length
   * Returns an empty array of the requested length
   */
  acquire(length: number = 0): T[] {
    this._acquireCount++;

    // Get or create pool for this length bucket
    const bucket = this.getLengthBucket(length);
    let pool = this.pools.get(bucket);

    if (pool && pool.length > 0) {
      const arr = pool.pop()!;
      arr.length = length; // Adjust to requested length
      return arr;
    }

    // Create new array
    this._totalCreated++;
    return new Array<T>(length);
  }

  /**
   * Release an array back to the pool
   */
  release(arr: T[]): void {
    this._releaseCount++;

    // Clear the array
    arr.length = 0;

    // Get bucket for this array's original capacity
    const bucket = this.getLengthBucket(arr.length);
    let pool = this.pools.get(bucket);

    if (!pool) {
      pool = [];
      this.pools.set(bucket, pool);
    }

    if (pool.length < this.maxSize) {
      pool.push(arr);
    }
  }

  /**
   * Get bucket index for array length (powers of 2 for efficiency)
   */
  private getLengthBucket(length: number): number {
    if (length <= 8) return 8;
    if (length <= 16) return 16;
    if (length <= 32) return 32;
    if (length <= 64) return 64;
    if (length <= 128) return 128;
    if (length <= 256) return 256;
    if (length <= 512) return 512;
    return 1024; // Max bucket
  }

  /**
   * Clear all pools
   */
  clear(): void {
    this.pools.clear();
  }

  /**
   * Get pool statistics
   */
  getStats(): { available: number; totalCreated: number; acquireCount: number; releaseCount: number } {
    let available = 0;
    for (const pool of this.pools.values()) {
      available += pool.length;
    }
    return {
      available,
      totalCreated: this._totalCreated,
      acquireCount: this._acquireCount,
      releaseCount: this._releaseCount,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// TYPED POOLS FOR COMMON 3LENS OBJECTS
// ─────────────────────────────────────────────────────────────────

/**
 * Frame stats object structure for pooling
 */
export interface PooledFrameStats {
  frame: number;
  timestamp: number;
  deltaTimeMs: number;
  cpuTimeMs: number;
  gpuTimeMs: number | undefined;
  triangles: number;
  drawCalls: number;
  points: number;
  lines: number;
  vertices: number;
  objectsVisible: number;
  objectsInFrustum: number;
  objectsCulled: number;
  lightCount: number;
  shadowMapCount: number;
  texturesInUse: number;
  textureMemoryBytes: number;
  geometriesInUse: number;
  geometryMemoryBytes: number;
  programsInUse: number;
  fps: number;
  avgFrameTime: number;
  memoryEstimateBytes: number;
  renderTargetsActive: number;
  rendererBackend: 'webgl' | 'webgpu';
  instancedDrawCalls: number;
  computeDispatches: number;
  pipelineSwitches: number;
  bindGroupChanges: number;
}

/**
 * Reset function for FrameStats
 */
function resetFrameStats(stats: PooledFrameStats): void {
  stats.frame = 0;
  stats.timestamp = 0;
  stats.deltaTimeMs = 0;
  stats.cpuTimeMs = 0;
  stats.gpuTimeMs = undefined;
  stats.triangles = 0;
  stats.drawCalls = 0;
  stats.points = 0;
  stats.lines = 0;
  stats.vertices = 0;
  stats.objectsVisible = 0;
  stats.objectsInFrustum = 0;
  stats.objectsCulled = 0;
  stats.lightCount = 0;
  stats.shadowMapCount = 0;
  stats.texturesInUse = 0;
  stats.textureMemoryBytes = 0;
  stats.geometriesInUse = 0;
  stats.geometryMemoryBytes = 0;
  stats.programsInUse = 0;
  stats.fps = 0;
  stats.avgFrameTime = 0;
  stats.memoryEstimateBytes = 0;
  stats.renderTargetsActive = 0;
  stats.rendererBackend = 'webgl';
  stats.instancedDrawCalls = 0;
  stats.computeDispatches = 0;
  stats.pipelineSwitches = 0;
  stats.bindGroupChanges = 0;
}

/**
 * Factory function for FrameStats
 */
function createFrameStats(): PooledFrameStats {
  return {
    frame: 0,
    timestamp: 0,
    deltaTimeMs: 0,
    cpuTimeMs: 0,
    gpuTimeMs: undefined,
    triangles: 0,
    drawCalls: 0,
    points: 0,
    lines: 0,
    vertices: 0,
    objectsVisible: 0,
    objectsInFrustum: 0,
    objectsCulled: 0,
    lightCount: 0,
    shadowMapCount: 0,
    texturesInUse: 0,
    textureMemoryBytes: 0,
    geometriesInUse: 0,
    geometryMemoryBytes: 0,
    programsInUse: 0,
    fps: 0,
    avgFrameTime: 0,
    memoryEstimateBytes: 0,
    renderTargetsActive: 0,
    rendererBackend: 'webgl',
    instancedDrawCalls: 0,
    computeDispatches: 0,
    pipelineSwitches: 0,
    bindGroupChanges: 0,
  };
}

/**
 * Vector3-like object for pooling
 */
export interface PooledVector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Transform data object for pooling
 */
export interface PooledTransformData {
  position: PooledVector3;
  rotation: { x: number; y: number; z: number; order: string };
  scale: PooledVector3;
}

// ─────────────────────────────────────────────────────────────────
// GLOBAL POOLS SINGLETON
// ─────────────────────────────────────────────────────────────────

/**
 * PoolManager - Central manager for all object pools
 * 
 * Provides pre-configured pools for common 3Lens objects and
 * utilities for monitoring pool health.
 */
export class PoolManager {
  /** Pool for FrameStats objects */
  readonly frameStats: ObjectPool<PooledFrameStats>;

  /** Pool for Vector3-like objects */
  readonly vector3: ObjectPool<PooledVector3>;

  /** Pool for generic arrays */
  readonly arrays: ArrayPool<unknown>;

  /** Pool for string arrays (common in scene traversal) */
  readonly stringArrays: ArrayPool<string>;

  /** Pool for number arrays */
  readonly numberArrays: ArrayPool<number>;

  /** Pool for transform data */
  readonly transformData: ObjectPool<PooledTransformData>;

  /** Pool for generic plain objects */
  readonly plainObjects: ObjectPool<Record<string, unknown>>;

  private static _instance: PoolManager | null = null;

  constructor() {
    // Frame stats pool - heavily used in hot path
    this.frameStats = new ObjectPool<PooledFrameStats>({
      factory: createFrameStats,
      reset: resetFrameStats,
      initialSize: 5,
      maxSize: 20,
      name: 'FrameStatsPool',
    });

    // Vector3 pool
    this.vector3 = new ObjectPool<PooledVector3>({
      factory: () => ({ x: 0, y: 0, z: 0 }),
      reset: (v) => { v.x = 0; v.y = 0; v.z = 0; },
      initialSize: 20,
      maxSize: 100,
      name: 'Vector3Pool',
    });

    // Generic array pool
    this.arrays = new ArrayPool<unknown>({
      maxSize: 50,
      name: 'GenericArrayPool',
    });

    // String array pool
    this.stringArrays = new ArrayPool<string>({
      maxSize: 30,
      name: 'StringArrayPool',
    });

    // Number array pool
    this.numberArrays = new ArrayPool<number>({
      maxSize: 30,
      name: 'NumberArrayPool',
    });

    // Transform data pool
    this.transformData = new ObjectPool<PooledTransformData>({
      factory: () => ({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
        scale: { x: 1, y: 1, z: 1 },
      }),
      reset: (t) => {
        t.position.x = 0; t.position.y = 0; t.position.z = 0;
        t.rotation.x = 0; t.rotation.y = 0; t.rotation.z = 0; t.rotation.order = 'XYZ';
        t.scale.x = 1; t.scale.y = 1; t.scale.z = 1;
      },
      initialSize: 10,
      maxSize: 50,
      name: 'TransformDataPool',
    });

    // Plain object pool for temporary objects
    this.plainObjects = new ObjectPool<Record<string, unknown>>({
      factory: () => ({}),
      reset: (obj) => {
        for (const key of Object.keys(obj)) {
          delete obj[key];
        }
      },
      initialSize: 10,
      maxSize: 50,
      name: 'PlainObjectPool',
    });
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): PoolManager {
    if (!PoolManager._instance) {
      PoolManager._instance = new PoolManager();
    }
    return PoolManager._instance;
  }

  /**
   * Reset the singleton (useful for testing)
   */
  static reset(): void {
    if (PoolManager._instance) {
      PoolManager._instance.clearAll();
      PoolManager._instance = null;
    }
  }

  /**
   * Get statistics for all pools
   */
  getAllStats(): Record<string, PoolStats | ReturnType<ArrayPool<unknown>['getStats']>> {
    return {
      frameStats: this.frameStats.getStats(),
      vector3: this.vector3.getStats(),
      arrays: this.arrays.getStats(),
      stringArrays: this.stringArrays.getStats(),
      numberArrays: this.numberArrays.getStats(),
      transformData: this.transformData.getStats(),
      plainObjects: this.plainObjects.getStats(),
    };
  }

  /**
   * Clear all pools
   */
  clearAll(): void {
    this.frameStats.clear();
    this.vector3.clear();
    this.arrays.clear();
    this.stringArrays.clear();
    this.numberArrays.clear();
    this.transformData.clear();
    this.plainObjects.clear();
  }

  /**
   * Log pool statistics to console (for debugging)
   */
  logStats(): void {
    console.group('[3Lens] Pool Statistics');
    const stats = this.getAllStats();
    for (const [name, poolStats] of Object.entries(stats)) {
      console.log(`${name}:`, poolStats);
    }
    console.groupEnd();
  }
}

/**
 * Get the global pool manager instance
 */
export function getPoolManager(): PoolManager {
  return PoolManager.getInstance();
}

/**
 * Convenience function to acquire a frame stats object from the pool
 */
export function acquireFrameStats(): PooledFrameStats {
  return getPoolManager().frameStats.acquire();
}

/**
 * Convenience function to release a frame stats object back to the pool
 */
export function releaseFrameStats(stats: PooledFrameStats): void {
  getPoolManager().frameStats.release(stats);
}

/**
 * Convenience function to acquire a vector3 from the pool
 */
export function acquireVector3(): PooledVector3 {
  return getPoolManager().vector3.acquire();
}

/**
 * Convenience function to release a vector3 back to the pool
 */
export function releaseVector3(vec: PooledVector3): void {
  getPoolManager().vector3.release(vec);
}

/**
 * Convenience function to acquire an array from the pool
 */
export function acquireArray<T>(length?: number): T[] {
  return getPoolManager().arrays.acquire(length) as T[];
}

/**
 * Convenience function to release an array back to the pool
 */
export function releaseArray<T>(arr: T[]): void {
  getPoolManager().arrays.release(arr as unknown[]);
}
