/**
 * Memoization Utilities
 *
 * Provides high-performance caching for expensive computations commonly
 * used in devtools operations like scene traversal, metrics calculation,
 * and property formatting.
 *
 * @module utils/Memoization
 */

/**
 * Options for configuring memoization behavior
 */
export interface MemoizeOptions<K = unknown> {
  /** Maximum number of cached entries (default: 100) */
  maxSize?: number;
  /** Time-to-live in milliseconds (default: Infinity - no expiration) */
  ttl?: number;
  /** Custom key resolver for complex arguments */
  keyResolver?: (...args: unknown[]) => K;
  /** Name for debugging purposes */
  name?: string;
}

/**
 * Statistics for memoization cache performance
 */
export interface MemoStats {
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Current number of cached entries */
  size: number;
  /** Maximum cache size */
  maxSize: number;
  /** Hit rate as a percentage */
  hitRate: number;
  /** Number of evictions due to size limit */
  evictions: number;
  /** Number of expirations due to TTL */
  expirations: number;
}

/**
 * Cache entry with metadata
 */
interface CacheEntry<V> {
  value: V;
  timestamp: number;
  lastAccessed: number;
}

/**
 * A memoized function with cache control methods
 */
export interface MemoizedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T>;
  /** Clear the cache */
  clear(): void;
  /** Get cache statistics */
  getStats(): MemoStats;
  /** Check if a key is cached */
  has(...args: Parameters<T>): boolean;
  /** Manually set a cache entry */
  set(args: Parameters<T>, value: ReturnType<T>): void;
  /** Delete a specific cache entry */
  delete(...args: Parameters<T>): boolean;
  /** Get the cache name */
  readonly name: string;
}

/**
 * LRU (Least Recently Used) cache implementation
 */
export class LRUCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private readonly maxSize: number;
  private readonly ttl: number;
  private readonly name: string;

  // Statistics
  private _hits = 0;
  private _misses = 0;
  private _evictions = 0;
  private _expirations = 0;

  constructor(options: {
    maxSize?: number;
    ttl?: number;
    name?: string;
  } = {}) {
    this.maxSize = options.maxSize ?? 100;
    this.ttl = options.ttl ?? Infinity;
    this.name = options.name ?? 'LRUCache';
  }

  /**
   * Get a value from the cache
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this._misses++;
      return undefined;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this._expirations++;
      this._misses++;
      return undefined;
    }

    // Update last accessed time and move to end for LRU
    entry.lastAccessed = Date.now();
    this.cache.delete(key);
    this.cache.set(key, entry);

    this._hits++;
    return entry.value;
  }

  /**
   * Set a value in the cache
   */
  set(key: K, value: V): void {
    // Delete existing entry to update order
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
        this._evictions++;
      }
    }

    const now = Date.now();
    this.cache.set(key, {
      value,
      timestamp: now,
      lastAccessed: now,
    });
  }

  /**
   * Check if a key exists and is not expired
   * Note: Does not update access time or statistics
   */
  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this._expirations++;
      return false;
    }

    return true;
  }

  /**
   * Check if a key exists without updating statistics
   * Used internally by memoize to handle undefined values correctly
   */
  peek(key: K): { exists: boolean; value: V | undefined } {
    const entry = this.cache.get(key);
    if (!entry) return { exists: false, value: undefined };

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this._expirations++;
      return { exists: false, value: undefined };
    }

    return { exists: true, value: entry.value };
  }

  /**
   * Delete a specific entry
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): MemoStats {
    const total = this._hits + this._misses;
    return {
      hits: this._hits,
      misses: this._misses,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? (this._hits / total) * 100 : 0,
      evictions: this._evictions,
      expirations: this._expirations,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
    this._expirations = 0;
  }

  /**
   * Manually track a cache miss
   * Used when peek() is used instead of get() for cache lookups
   */
  trackMiss(): void {
    this._misses++;
  }

  /**
   * Clean up expired entries
   */
  prune(): number {
    let pruned = 0;
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this._expirations++;
        pruned++;
      }
    }
    return pruned;
  }

  private isExpired(entry: CacheEntry<V>): boolean {
    if (this.ttl === Infinity) return false;
    return Date.now() - entry.timestamp > this.ttl;
  }
}

/**
 * Default key resolver that handles primitives and objects
 */
function defaultKeyResolver(...args: unknown[]): string {
  if (args.length === 0) return '__empty__';
  if (args.length === 1) {
    const arg = args[0];
    if (arg === null) return '__null__';
    if (arg === undefined) return '__undefined__';
    if (typeof arg === 'object') {
      // For THREE.js objects, use uuid if available
      if ('uuid' in arg && typeof (arg as { uuid: unknown }).uuid === 'string') {
        return (arg as { uuid: string }).uuid;
      }
      // For objects with id
      if ('id' in arg && typeof (arg as { id: unknown }).id === 'number') {
        return `id:${(arg as { id: number }).id}`;
      }
      // Fallback to JSON stringify for simple objects
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }
  return args.map((arg) => defaultKeyResolver(arg)).join('::');
}

/**
 * Create a memoized version of a function
 *
 * @example
 * ```typescript
 * const expensiveCalculation = memoize(
 *   (mesh: THREE.Mesh) => calculateBoundingBox(mesh),
 *   { maxSize: 50, ttl: 5000, name: 'boundingBoxCache' }
 * );
 *
 * // First call - computes and caches
 * const box1 = expensiveCalculation(mesh);
 *
 * // Second call with same mesh - returns cached value
 * const box2 = expensiveCalculation(mesh);
 * ```
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: MemoizeOptions<string> = {}
): MemoizedFunction<T> {
  const {
    maxSize = 100,
    ttl = Infinity,
    keyResolver = defaultKeyResolver,
    name = fn.name || 'memoized',
  } = options;

  const cache = new LRUCache<string, ReturnType<T>>({
    maxSize,
    ttl,
    name,
  });

  const memoized = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = keyResolver(...args);

    // Use peek() to check existence and get value without affecting LRU order
    // This handles the case where cached value is undefined
    const peeked = cache.peek(key);
    if (peeked.exists) {
      // Update LRU order and stats by calling get()
      cache.get(key);
      return peeked.value as ReturnType<T>;
    }

    // Cache miss - compute and store result
    // Note: get() was not called, so we need to manually track the miss
    cache.trackMiss();
    const result = fn.apply(this, args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  } as MemoizedFunction<T>;

  // Attach control methods
  memoized.clear = () => cache.clear();
  memoized.getStats = () => cache.getStats();
  memoized.has = (...args: Parameters<T>) => cache.has(keyResolver(...args));
  memoized.set = (args: Parameters<T>, value: ReturnType<T>) => {
    cache.set(keyResolver(...args), value);
  };
  memoized.delete = (...args: Parameters<T>) => cache.delete(keyResolver(...args));
  Object.defineProperty(memoized, 'name', { value: name, writable: false });

  return memoized;
}

/**
 * Create a memoized function that only caches the most recent call
 * Useful for functions called repeatedly with the same arguments
 *
 * @example
 * ```typescript
 * const getSceneStats = memoizeOne(
 *   (scene: THREE.Scene) => computeSceneStats(scene)
 * );
 * ```
 */
export function memoizeOne<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: {
    keyResolver?: (...args: unknown[]) => string;
    name?: string;
  } = {}
): MemoizedFunction<T> {
  const { keyResolver = defaultKeyResolver, name = fn.name || 'memoizedOne' } = options;

  let lastKey: string | undefined;
  let lastValue: ReturnType<T> | undefined;
  let hits = 0;
  let misses = 0;

  const memoized = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = keyResolver(...args);

    if (key === lastKey && lastValue !== undefined) {
      hits++;
      return lastValue;
    }

    misses++;
    lastKey = key;
    lastValue = fn.apply(this, args) as ReturnType<T>;
    return lastValue;
  } as MemoizedFunction<T>;

  memoized.clear = () => {
    lastKey = undefined;
    lastValue = undefined;
  };

  memoized.getStats = () => {
    const total = hits + misses;
    return {
      hits,
      misses,
      size: lastKey !== undefined ? 1 : 0,
      maxSize: 1,
      hitRate: total > 0 ? (hits / total) * 100 : 0,
      evictions: 0,
      expirations: 0,
    };
  };

  memoized.has = (...args: Parameters<T>) => keyResolver(...args) === lastKey;
  memoized.set = (args: Parameters<T>, value: ReturnType<T>) => {
    lastKey = keyResolver(...args);
    lastValue = value;
  };
  memoized.delete = (...args: Parameters<T>) => {
    if (keyResolver(...args) === lastKey) {
      lastKey = undefined;
      lastValue = undefined;
      return true;
    }
    return false;
  };

  Object.defineProperty(memoized, 'name', { value: name, writable: false });

  return memoized;
}

/**
 * Create a memoized function with frame-based invalidation
 * Cache is invalidated each frame, useful for per-frame computations
 *
 * @example
 * ```typescript
 * const getVisibleMeshes = memoizePerFrame(
 *   (scene: THREE.Scene, camera: THREE.Camera) => frustumCull(scene, camera)
 * );
 *
 * // In render loop
 * frameCounter.tick(); // Invalidates all frame-memoized caches
 * const visible = getVisibleMeshes(scene, camera); // Computes fresh
 * const visible2 = getVisibleMeshes(scene, camera); // Returns cached
 * ```
 */
export class FrameMemoizer {
  private currentFrame = 0;
  private memoizedFunctions: Array<{ clear: () => void }> = [];

  /**
   * Signal that a new frame has started, invalidating all frame caches
   */
  tick(): void {
    this.currentFrame++;
    for (const fn of this.memoizedFunctions) {
      fn.clear();
    }
  }

  /**
   * Get current frame number
   */
  get frame(): number {
    return this.currentFrame;
  }

  /**
   * Create a memoized function bound to this frame counter
   */
  memoize<T extends (...args: unknown[]) => unknown>(
    fn: T,
    options: Omit<MemoizeOptions<string>, 'ttl'> = {}
  ): MemoizedFunction<T> {
    const memoized = memoize(fn, { ...options, ttl: Infinity });
    this.memoizedFunctions.push(memoized);
    return memoized;
  }

  /**
   * Create a single-value memoized function bound to this frame counter
   */
  memoizeOne<T extends (...args: unknown[]) => unknown>(
    fn: T,
    options: { keyResolver?: (...args: unknown[]) => string; name?: string } = {}
  ): MemoizedFunction<T> {
    const memoized = memoizeOne(fn, options);
    this.memoizedFunctions.push(memoized);
    return memoized;
  }

  /**
   * Clear all registered memoized functions
   */
  clearAll(): void {
    for (const fn of this.memoizedFunctions) {
      fn.clear();
    }
  }

  /**
   * Get count of registered functions
   */
  get functionCount(): number {
    return this.memoizedFunctions.length;
  }
}

/**
 * Global frame memoizer instance for the devtools
 */
let globalFrameMemoizer: FrameMemoizer | null = null;

/**
 * Get the global frame memoizer instance
 */
export function getFrameMemoizer(): FrameMemoizer {
  if (!globalFrameMemoizer) {
    globalFrameMemoizer = new FrameMemoizer();
  }
  return globalFrameMemoizer;
}

/**
 * Reset the global frame memoizer (mainly for testing)
 */
export function resetFrameMemoizer(): void {
  if (globalFrameMemoizer) {
    globalFrameMemoizer.clearAll();
  }
  globalFrameMemoizer = null;
}

// ============================================================================
// Pre-built memoized utility functions for common devtools operations
// ============================================================================

/**
 * Memoized property path formatter
 * Caches formatted paths like "material.color.r" for display
 */
export const formatPropertyPath = memoize(
  (path: string[]): string => path.join('.'),
  { maxSize: 500, name: 'propertyPathFormatter' }
);

/**
 * Memoized number formatter with configurable precision
 */
export const formatNumber = memoize(
  (value: number, precision: number = 2): string => {
    if (!Number.isFinite(value)) return String(value);
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(precision);
  },
  {
    maxSize: 1000,
    name: 'numberFormatter',
    keyResolver: (value: unknown, precision: unknown) => `${value}:${precision}`,
  }
);

/**
 * Memoized byte size formatter
 */
export const formatBytes = memoize(
  (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  },
  { maxSize: 200, name: 'bytesFormatter' }
);

/**
 * Memoized type name extractor
 * Gets constructor name or 'Unknown' for any object
 */
export const getTypeName = memoize(
  (obj: object | null | undefined): string => {
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    return obj.constructor?.name || 'Unknown';
  },
  { maxSize: 100, name: 'typeNameGetter' }
);

/**
 * Memoized UUID cache for frequently accessed objects
 * Avoids repeated property access in hot paths
 */
export const getObjectId = memoize(
  (obj: { uuid?: string; id?: number }): string => {
    if (obj.uuid) return obj.uuid;
    if (obj.id !== undefined) return `id:${obj.id}`;
    return `ref:${Math.random().toString(36).substr(2, 9)}`;
  },
  { maxSize: 500, name: 'objectIdGetter' }
);

/**
 * Create a weak-memoized function that uses WeakMap for object keys
 * Entries are automatically garbage collected when the key object is GC'd
 *
 * @example
 * ```typescript
 * const getObjectCost = weakMemoize(
 *   (mesh: THREE.Mesh) => computeMeshCost(mesh)
 * );
 * ```
 */
export function weakMemoize<K extends object, V>(
  fn: (key: K) => V,
  options: { name?: string } = {}
): {
  (key: K): V;
  delete(key: K): boolean;
  has(key: K): boolean;
  readonly name: string;
} {
  const cache = new WeakMap<K, V>();
  const { name = fn.name || 'weakMemoized' } = options;

  const memoized = (key: K): V => {
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(key);
    cache.set(key, result);
    return result;
  };

  memoized.delete = (key: K) => cache.delete(key);
  memoized.has = (key: K) => cache.has(key);
  Object.defineProperty(memoized, 'name', { value: name, writable: false });

  return memoized;
}

/**
 * Decorator-style memoization for class methods
 *
 * @example
 * ```typescript
 * class MyClass {
 *   @MemoizeMethod({ maxSize: 50 })
 *   expensiveMethod(arg: string): number {
 *     return computeExpensiveValue(arg);
 *   }
 * }
 * ```
 */
export function MemoizeMethod(options: MemoizeOptions<string> = {}) {
  return function <T>(
    _target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value;
    if (typeof originalMethod !== 'function') {
      throw new Error('@MemoizeMethod can only be applied to methods');
    }

    const cache = new LRUCache<string, unknown>({
      maxSize: options.maxSize ?? 100,
      ttl: options.ttl ?? Infinity,
      name: options.name ?? String(propertyKey),
    });

    const keyResolver = options.keyResolver ?? defaultKeyResolver;

    descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
      const key = keyResolver(...args);
      const cached = cache.get(key);

      if (cached !== undefined) {
        return cached;
      }

      const result = (originalMethod as (...args: unknown[]) => unknown).apply(this, args);
      cache.set(key, result);
      return result;
    } as unknown as T;

    return descriptor;
  };
}

// ============================================================================
// Memoization Manager for centralized cache management
// ============================================================================

/**
 * Centralized manager for all memoization caches in the devtools
 */
export class MemoizationManager {
  private caches = new Map<string, { clear: () => void; getStats: () => MemoStats }>();
  private frameMemoizer: FrameMemoizer;

  constructor() {
    this.frameMemoizer = new FrameMemoizer();
  }

  /**
   * Register a memoized function for centralized management
   */
  register(name: string, cache: { clear: () => void; getStats: () => MemoStats }): void {
    this.caches.set(name, cache);
  }

  /**
   * Get the frame memoizer for per-frame caching
   */
  getFrameMemoizer(): FrameMemoizer {
    return this.frameMemoizer;
  }

  /**
   * Clear all registered caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
    this.frameMemoizer.clearAll();
  }

  /**
   * Clear a specific cache by name
   */
  clear(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
      return true;
    }
    return false;
  }

  /**
   * Get statistics for all caches
   */
  getAllStats(): Record<string, MemoStats> {
    const stats: Record<string, MemoStats> = {};
    for (const [name, cache] of this.caches) {
      stats[name] = cache.getStats();
    }
    return stats;
  }

  /**
   * Get aggregated statistics
   */
  getAggregatedStats(): {
    totalCaches: number;
    totalEntries: number;
    totalHits: number;
    totalMisses: number;
    overallHitRate: number;
  } {
    let totalEntries = 0;
    let totalHits = 0;
    let totalMisses = 0;

    for (const cache of this.caches.values()) {
      const stats = cache.getStats();
      totalEntries += stats.size;
      totalHits += stats.hits;
      totalMisses += stats.misses;
    }

    const total = totalHits + totalMisses;
    return {
      totalCaches: this.caches.size,
      totalEntries,
      totalHits,
      totalMisses,
      overallHitRate: total > 0 ? (totalHits / total) * 100 : 0,
    };
  }

  /**
   * Signal new frame (invalidates frame-based caches)
   */
  tick(): void {
    this.frameMemoizer.tick();
  }

  /**
   * Get current frame number
   */
  get frame(): number {
    return this.frameMemoizer.frame;
  }
}

// Global memoization manager instance
let globalMemoizationManager: MemoizationManager | null = null;

/**
 * Get the global memoization manager
 */
export function getMemoizationManager(): MemoizationManager {
  if (!globalMemoizationManager) {
    globalMemoizationManager = new MemoizationManager();

    // Register built-in formatters
    globalMemoizationManager.register('propertyPathFormatter', formatPropertyPath);
    globalMemoizationManager.register('numberFormatter', formatNumber);
    globalMemoizationManager.register('bytesFormatter', formatBytes);
    globalMemoizationManager.register('typeNameGetter', getTypeName);
    globalMemoizationManager.register('objectIdGetter', getObjectId);
  }
  return globalMemoizationManager;
}

/**
 * Reset the global memoization manager (mainly for testing)
 */
export function resetMemoizationManager(): void {
  if (globalMemoizationManager) {
    globalMemoizationManager.clearAll();
  }
  globalMemoizationManager = null;
}
