/**
 * Performance Benchmarks: Object Pool
 *
 * Tests the performance characteristics of the ObjectPool implementation
 * which is critical for reducing GC pressure in hot paths.
 */

import { describe, it, expect } from 'vitest';
import { ObjectPool, ArrayPool, getPoolManager } from '../../utils/ObjectPool';
import {
  benchmark,
  benchmarkBatched,
  formatBenchmarkResults,
  assertPerformance,
  type BenchmarkResult,
} from './benchmark-utils';

describe('ObjectPool Benchmarks', () => {
  const results: BenchmarkResult[] = [];

  describe('ObjectPool - Basic Operations', () => {
    it('acquire/release single object', () => {
      const pool = new ObjectPool({
        factory: () => ({ x: 0, y: 0, z: 0 }),
        reset: (v) => {
          v.x = 0;
          v.y = 0;
          v.z = 0;
        },
        initialSize: 10,
        maxSize: 100,
      });

      const result = benchmarkBatched(
        'ObjectPool: acquire/release single',
        () => {
          const obj = pool.acquire();
          obj.x = 1;
          pool.release(obj);
        },
        1000
      );

      results.push(result);

      // Should achieve at least 500K ops/sec
      assertPerformance(result, 500000, 'acquire/release must be fast');
    });

    it('acquire/release burst (10 objects)', () => {
      const pool = new ObjectPool({
        factory: () => ({ x: 0, y: 0, z: 0 }),
        reset: (v) => {
          v.x = 0;
          v.y = 0;
          v.z = 0;
        },
        initialSize: 20,
        maxSize: 100,
      });

      const result = benchmark('ObjectPool: acquire/release burst (10)', () => {
        const objects: Array<{ x: number; y: number; z: number }> = [];
        for (let i = 0; i < 10; i++) {
          objects.push(pool.acquire());
        }
        for (const obj of objects) {
          pool.release(obj);
        }
      });

      results.push(result);

      // Should achieve at least 50K ops/sec for burst of 10
      assertPerformance(result, 50000, 'burst operations should be efficient');
    });

    it('pool hit rate under typical usage', () => {
      const pool = new ObjectPool({
        factory: () => ({ data: new Array(100).fill(0) }),
        reset: (obj) => obj.data.fill(0),
        initialSize: 50,
        maxSize: 100,
      });

      // Simulate typical usage: acquire, use, release
      const result = benchmark('ObjectPool: typical usage pattern', () => {
        const objects: Array<{ data: number[] }> = [];
        // Acquire some objects
        for (let i = 0; i < 5; i++) {
          const obj = pool.acquire();
          obj.data[0] = i;
          objects.push(obj);
        }
        // Release them
        for (const obj of objects) {
          pool.release(obj);
        }
      });

      results.push(result);

      // Check pool stats
      const stats = pool.getStats();
      expect(stats.hitRate).toBeGreaterThan(0.8); // 80%+ hit rate
    });
  });

  describe('ObjectPool vs Direct Allocation', () => {
    it('compare pooled vs direct allocation', () => {
      const pool = new ObjectPool({
        factory: () => ({ x: 0, y: 0, z: 0, w: 0 }),
        reset: (v) => {
          v.x = 0;
          v.y = 0;
          v.z = 0;
          v.w = 0;
        },
        initialSize: 100,
        maxSize: 200,
      });

      // Pooled allocation
      const pooledResult = benchmarkBatched(
        'Pooled allocation',
        () => {
          const obj = pool.acquire();
          obj.x = Math.random();
          pool.release(obj);
        },
        1000
      );
      results.push(pooledResult);

      // Direct allocation
      const directResult = benchmarkBatched(
        'Direct allocation (new object)',
        () => {
          const obj = { x: 0, y: 0, z: 0, w: 0 };
          obj.x = Math.random();
          // No release - GC will collect
        },
        1000
      );
      results.push(directResult);

      // Pooled should be competitive with direct (within 3x)
      // The real benefit is reduced GC pressure, not raw speed
      expect(pooledResult.opsPerSecond).toBeGreaterThan(directResult.opsPerSecond * 0.3);
    });
  });

  describe('ArrayPool Operations', () => {
    it('array acquire/release', () => {
      const pool = new ArrayPool<number>({ maxSize: 100 });

      const result = benchmarkBatched(
        'ArrayPool: acquire/release (size 100)',
        () => {
          const arr = pool.acquire();
          arr.push(1, 2, 3);
          pool.release(arr);
        },
        1000
      );

      results.push(result);

      // Should achieve at least 200K ops/sec
      assertPerformance(result, 200000, 'array pool should be fast');
    });

    it('array pool vs Array.from', () => {
      const pool = new ArrayPool<number>({ maxSize: 100 });

      const pooledResult = benchmarkBatched(
        'ArrayPool: pooled array',
        () => {
          const arr = pool.acquire();
          for (let i = 0; i < 10; i++) arr.push(i);
          pool.release(arr);
        },
        500
      );
      results.push(pooledResult);

      const newArrayResult = benchmarkBatched(
        'Array: new Array()',
        () => {
          const arr: number[] = [];
          for (let i = 0; i < 10; i++) arr.push(i);
        },
        500
      );
      results.push(newArrayResult);
    });
  });

  describe('PoolManager', () => {
    it('typed pool usage via global manager', () => {
      const manager = getPoolManager();

      const result = benchmark('PoolManager: typed pool acquire/release', () => {
        const obj = manager.vector3.acquire();
        obj.x = 42;
        obj.y = 100;
        manager.vector3.release(obj);
      });

      results.push(result);

      // Pool manager lookup should be fast
      assertPerformance(result, 500000);
    });

    it('multiple pool types via manager', () => {
      const manager = getPoolManager();

      const result = benchmark('PoolManager: multi-pool usage', () => {
        const v3 = manager.vector3.acquire();
        const arr = manager.numberArrays.acquire();

        v3.x = 1;
        v3.z = 3;
        arr.push(1);

        manager.vector3.release(v3);
        manager.numberArrays.release(arr);
      });

      results.push(result);

      assertPerformance(result, 200000);
    });
  });

  // Print results at the end
  it('print benchmark results', () => {
    console.log('\n' + formatBenchmarkResults(results) + '\n');
  });
});
