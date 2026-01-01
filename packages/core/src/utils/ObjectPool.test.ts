import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ObjectPool,
  ArrayPool,
  PoolManager,
  getPoolManager,
  acquireFrameStats,
  releaseFrameStats,
  acquireVector3,
  releaseVector3,
  acquireArray,
  releaseArray,
} from './ObjectPool';

describe('ObjectPool', () => {
  describe('basic operations', () => {
    it('should create objects using factory', () => {
      const pool = new ObjectPool({
        factory: () => ({ value: 0 }),
        name: 'TestPool',
      });

      const obj = pool.acquire();
      expect(obj).toBeDefined();
      expect(obj.value).toBe(0);
    });

    it('should reuse released objects', () => {
      const pool = new ObjectPool({
        factory: () => ({ value: 0 }),
        name: 'TestPool',
      });

      const obj1 = pool.acquire();
      obj1.value = 42;
      pool.release(obj1);

      const obj2 = pool.acquire();
      expect(obj2).toBe(obj1); // Same object reused
      expect(obj2.value).toBe(42); // Value preserved (no reset function)
    });

    it('should reset objects when reset function provided', () => {
      const pool = new ObjectPool({
        factory: () => ({ value: 0 }),
        reset: (obj) => { obj.value = 0; },
        name: 'TestPool',
      });

      const obj1 = pool.acquire();
      obj1.value = 42;
      pool.release(obj1);

      const obj2 = pool.acquire();
      expect(obj2).toBe(obj1);
      expect(obj2.value).toBe(0); // Value reset
    });

    it('should pre-allocate initial objects', () => {
      const pool = new ObjectPool({
        factory: () => ({ value: 0 }),
        initialSize: 5,
        name: 'TestPool',
      });

      expect(pool.size).toBe(5);
      const stats = pool.getStats();
      expect(stats.totalCreated).toBe(5);
    });

    it('should respect max size', () => {
      const pool = new ObjectPool({
        factory: () => ({ value: 0 }),
        maxSize: 2,
        name: 'TestPool',
      });

      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      const obj3 = pool.acquire();

      pool.release(obj1);
      pool.release(obj2);
      pool.release(obj3); // Should be discarded

      expect(pool.size).toBe(2);
      const stats = pool.getStats();
      expect(stats.discardedCount).toBe(1);
    });

    it('should track statistics correctly', () => {
      const pool = new ObjectPool({
        factory: () => ({ value: 0 }),
        name: 'TestPool',
      });

      pool.acquire();
      pool.acquire();
      const obj = pool.acquire();
      pool.release(obj);
      pool.acquire(); // Reuse

      const stats = pool.getStats();
      expect(stats.acquireCount).toBe(4);
      expect(stats.releaseCount).toBe(1);
      expect(stats.totalCreated).toBe(3); // First 3 were new
    });

    it('should clear the pool', () => {
      const pool = new ObjectPool({
        factory: () => ({ value: 0 }),
        initialSize: 5,
        name: 'TestPool',
      });

      expect(pool.size).toBe(5);
      pool.clear();
      expect(pool.size).toBe(0);
    });

    it('should release multiple objects', () => {
      const pool = new ObjectPool({
        factory: () => ({ value: 0 }),
        name: 'TestPool',
      });

      const objects = [pool.acquire(), pool.acquire(), pool.acquire()];
      pool.releaseAll(objects);

      expect(pool.size).toBe(3);
    });
  });
});

describe('ArrayPool', () => {
  it('should acquire empty arrays', () => {
    const pool = new ArrayPool<number>({ name: 'NumberArrayPool' });
    const arr = pool.acquire(5);
    expect(arr.length).toBe(5);
  });

  it('should reuse released arrays', () => {
    const pool = new ArrayPool<number>({ name: 'NumberArrayPool' });
    
    const arr1 = pool.acquire(8);
    arr1[0] = 42;
    pool.release(arr1);

    const arr2 = pool.acquire(5);
    expect(arr2.length).toBe(5);
    // Array is cleared on release
  });

  it('should bucket arrays by size', () => {
    const pool = new ArrayPool<number>({ name: 'NumberArrayPool' });
    
    // Acquire arrays of different sizes
    const small = pool.acquire(5);
    const medium = pool.acquire(20);
    const large = pool.acquire(100);

    pool.release(small);
    pool.release(medium);
    pool.release(large);

    const stats = pool.getStats();
    expect(stats.available).toBe(3);
  });

  it('should clear all pools', () => {
    const pool = new ArrayPool<number>({ name: 'NumberArrayPool' });
    
    pool.release(pool.acquire(5));
    pool.release(pool.acquire(20));
    
    pool.clear();
    expect(pool.getStats().available).toBe(0);
  });
});

describe('PoolManager', () => {
  beforeEach(() => {
    PoolManager.reset();
  });

  afterEach(() => {
    PoolManager.reset();
  });

  it('should provide singleton instance', () => {
    const manager1 = PoolManager.getInstance();
    const manager2 = PoolManager.getInstance();
    expect(manager1).toBe(manager2);
  });

  it('should provide all pool types', () => {
    const manager = getPoolManager();
    
    expect(manager.frameStats).toBeDefined();
    expect(manager.vector3).toBeDefined();
    expect(manager.arrays).toBeDefined();
    expect(manager.stringArrays).toBeDefined();
    expect(manager.numberArrays).toBeDefined();
    expect(manager.transformData).toBeDefined();
    expect(manager.plainObjects).toBeDefined();
  });

  it('should clear all pools', () => {
    const manager = getPoolManager();
    
    // Acquire and release some objects
    releaseFrameStats(acquireFrameStats());
    releaseVector3(acquireVector3());
    releaseArray(acquireArray<string>());

    manager.clearAll();

    const stats = manager.getAllStats();
    expect(stats.frameStats.available).toBe(0);
    expect(stats.vector3.available).toBe(0);
  });

  it('should get stats for all pools', () => {
    const manager = getPoolManager();
    const stats = manager.getAllStats();

    expect(stats.frameStats).toBeDefined();
    expect(stats.vector3).toBeDefined();
    expect(stats.arrays).toBeDefined();
  });
});

describe('Convenience functions', () => {
  beforeEach(() => {
    PoolManager.reset();
  });

  afterEach(() => {
    PoolManager.reset();
  });

  it('should acquire and release frame stats', () => {
    const stats = acquireFrameStats();
    expect(stats).toBeDefined();
    expect(stats.frame).toBe(0);
    expect(stats.triangles).toBe(0);

    stats.frame = 100;
    stats.triangles = 5000;
    releaseFrameStats(stats);

    const stats2 = acquireFrameStats();
    expect(stats2).toBe(stats); // Reused
    expect(stats2.frame).toBe(0); // Reset
    expect(stats2.triangles).toBe(0); // Reset
  });

  it('should acquire and release vector3', () => {
    const vec = acquireVector3();
    expect(vec).toBeDefined();
    expect(vec.x).toBe(0);
    expect(vec.y).toBe(0);
    expect(vec.z).toBe(0);

    vec.x = 10;
    vec.y = 20;
    vec.z = 30;
    releaseVector3(vec);

    const vec2 = acquireVector3();
    expect(vec2).toBe(vec); // Reused
    expect(vec2.x).toBe(0); // Reset
    expect(vec2.y).toBe(0); // Reset
    expect(vec2.z).toBe(0); // Reset
  });

  it('should acquire and release arrays', () => {
    const arr = acquireArray<string>(5);
    expect(arr.length).toBe(5);

    arr[0] = 'test';
    releaseArray(arr);

    const arr2 = acquireArray<string>(3);
    expect(arr2.length).toBe(3);
  });
});

describe('PooledFrameStats', () => {
  beforeEach(() => {
    PoolManager.reset();
  });

  afterEach(() => {
    PoolManager.reset();
  });

  it('should have all required fields', () => {
    const stats = acquireFrameStats();
    
    // Core timing fields
    expect(stats.frame).toBeDefined();
    expect(stats.timestamp).toBeDefined();
    expect(stats.deltaTimeMs).toBeDefined();
    expect(stats.cpuTimeMs).toBeDefined();
    expect('gpuTimeMs' in stats).toBe(true);

    // Geometry metrics
    expect(stats.triangles).toBeDefined();
    expect(stats.drawCalls).toBeDefined();
    expect(stats.points).toBeDefined();
    expect(stats.lines).toBeDefined();
    expect(stats.vertices).toBeDefined();

    // Object metrics
    expect(stats.objectsVisible).toBeDefined();
    expect(stats.objectsInFrustum).toBeDefined();
    expect(stats.objectsCulled).toBeDefined();
    expect(stats.lightCount).toBeDefined();

    // Memory metrics
    expect(stats.texturesInUse).toBeDefined();
    expect(stats.textureMemoryBytes).toBeDefined();
    expect(stats.geometriesInUse).toBeDefined();
    expect(stats.geometryMemoryBytes).toBeDefined();

    // Performance
    expect(stats.fps).toBeDefined();
    expect(stats.avgFrameTime).toBeDefined();

    releaseFrameStats(stats);
  });

  it('should reset all fields on release', () => {
    const stats = acquireFrameStats();
    
    // Set various fields
    stats.frame = 999;
    stats.triangles = 10000;
    stats.drawCalls = 50;
    stats.fps = 120;
    stats.memoryEstimateBytes = 1000000;
    stats.gpuTimeMs = 5.5;
    
    releaseFrameStats(stats);
    
    // Acquire again and verify reset
    const stats2 = acquireFrameStats();
    expect(stats2.frame).toBe(0);
    expect(stats2.triangles).toBe(0);
    expect(stats2.drawCalls).toBe(0);
    expect(stats2.fps).toBe(0);
    expect(stats2.memoryEstimateBytes).toBe(0);
    expect(stats2.gpuTimeMs).toBeUndefined();
    
    releaseFrameStats(stats2);
  });
});

describe('Pool efficiency', () => {
  beforeEach(() => {
    PoolManager.reset();
  });

  afterEach(() => {
    PoolManager.reset();
  });

  it('should achieve high hit rate with proper usage', () => {
    const pool = new ObjectPool({
      factory: () => ({ value: 0 }),
      initialSize: 10,
      maxSize: 100,
      name: 'EfficiencyTest',
    });

    // Simulate typical usage: acquire, use, release in a loop
    for (let i = 0; i < 100; i++) {
      const obj = pool.acquire();
      obj.value = i;
      pool.release(obj);
    }

    const stats = pool.getStats();
    expect(stats.hitRate).toBeGreaterThan(0.9); // Should be very high
    expect(stats.totalCreated).toBe(10); // Only initial allocation
  });

  it('should handle burst allocations efficiently', () => {
    const pool = new ObjectPool({
      factory: () => ({ value: 0 }),
      initialSize: 5,
      maxSize: 50,
      name: 'BurstTest',
    });

    // Burst: acquire many at once
    const objects = [];
    for (let i = 0; i < 20; i++) {
      objects.push(pool.acquire());
    }

    // Release all
    for (const obj of objects) {
      pool.release(obj);
    }

    // Next burst should reuse
    const objects2 = [];
    for (let i = 0; i < 20; i++) {
      objects2.push(pool.acquire());
    }

    const stats = pool.getStats();
    // First 5 from initial, then 15 created on first burst
    expect(stats.totalCreated).toBe(20);
    // Second burst should all be reused
    expect(stats.acquireCount).toBe(40);
  });
});
