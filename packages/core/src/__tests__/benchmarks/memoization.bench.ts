/**
 * Performance Benchmarks: Memoization
 *
 * Tests the performance of LRUCache, memoize, and related caching utilities
 * which are critical for avoiding redundant computations.
 */

import { describe, it, expect } from 'vitest';
import {
  LRUCache,
  memoize,
  memoizeOne,
  weakMemoize,
  FrameMemoizer,
} from '../../utils/Memoization';
import {
  benchmark,
  benchmarkBatched,
  formatBenchmarkResults,
  assertPerformance,
  type BenchmarkResult,
} from './benchmark-utils';

describe('Memoization Benchmarks', () => {
  const results: BenchmarkResult[] = [];

  describe('LRUCache - Core Operations', () => {
    it('cache set/get with string keys', () => {
      const cache = new LRUCache<string, number>({ maxSize: 1000 });

      // Pre-populate
      for (let i = 0; i < 500; i++) {
        cache.set(`key-${i}`, i);
      }

      let keyIndex = 0;
      const result = benchmarkBatched(
        'LRUCache: get existing key',
        () => {
          cache.get(`key-${keyIndex % 500}`);
          keyIndex++;
        },
        1000
      );

      results.push(result);

      // Should be very fast - at least 1M ops/sec
      assertPerformance(result, 1000000, 'LRU get must be O(1)');
    });

    it('cache set with eviction', () => {
      const cache = new LRUCache<string, number>({ maxSize: 100 });

      let keyIndex = 0;
      const result = benchmarkBatched(
        'LRUCache: set with eviction',
        () => {
          cache.set(`key-${keyIndex}`, keyIndex);
          keyIndex++;
        },
        1000
      );

      results.push(result);

      assertPerformance(result, 500000);
    });

    it('cache with TTL expiration', () => {
      const cache = new LRUCache<string, number>({ maxSize: 1000, ttl: 10000 });

      for (let i = 0; i < 500; i++) {
        cache.set(`key-${i}`, i);
      }

      let keyIndex = 0;
      const result = benchmarkBatched(
        'LRUCache: get with TTL check',
        () => {
          cache.get(`key-${keyIndex % 500}`);
          keyIndex++;
        },
        1000
      );

      results.push(result);

      // TTL check adds overhead but should still be fast
      assertPerformance(result, 800000);
    });
  });

  describe('Memoize Function', () => {
    it('memoize with primitive argument', () => {
      const expensiveFn = (n: number) => {
        let sum = 0;
        for (let i = 0; i < 10; i++) sum += i * n;
        return sum;
      };

      const memoizedFn = memoize(expensiveFn, { maxSize: 100 });

      // Warm up cache
      for (let i = 0; i < 50; i++) {
        memoizedFn(i);
      }

      let argIndex = 0;
      const cachedResult = benchmarkBatched(
        'memoize: cached call (primitive)',
        () => {
          memoizedFn(argIndex % 50);
          argIndex++;
        },
        1000
      );

      results.push(cachedResult);

      // Cached calls should be extremely fast
      assertPerformance(cachedResult, 1000000);

      // Check hit rate
      const stats = memoizedFn.getStats();
      expect(stats.hitRate).toBeGreaterThan(0.9);
    });

    it('memoize with object argument', () => {
      interface Point {
        x: number;
        y: number;
      }

      const distance = (p: Point) => Math.sqrt(p.x * p.x + p.y * p.y);

      const memoizedDistance = memoize(distance, {
        maxSize: 100,
        keyResolver: (p) => `${p.x},${p.y}`,
      });

      // Pre-populate cache
      const points: Point[] = [];
      for (let i = 0; i < 50; i++) {
        const p = { x: i, y: i * 2 };
        points.push(p);
        memoizedDistance(p);
      }

      let idx = 0;
      const result = benchmarkBatched(
        'memoize: cached call (object + keyResolver)',
        () => {
          memoizedDistance(points[idx % 50]);
          idx++;
        },
        1000
      );

      results.push(result);

      assertPerformance(result, 500000);
    });

    it('memoize cache miss vs direct call', () => {
      const compute = (n: number) => Math.sin(n) * Math.cos(n);
      const memoizedCompute = memoize(compute, { maxSize: 100 });

      // Force cache misses with unique values
      let uniqueVal = 0;
      const missResult = benchmark('memoize: cache miss', () => {
        memoizedCompute(uniqueVal++);
      });

      results.push(missResult);

      // Direct call for comparison
      let directVal = 0;
      const directResult = benchmark('direct call: no memoization', () => {
        compute(directVal++);
      });

      results.push(directResult);

      // Memoization miss should not be more than 5x slower than direct
      expect(missResult.opsPerSecond).toBeGreaterThan(directResult.opsPerSecond * 0.2);
    });
  });

  describe('MemoizeOne', () => {
    it('memoizeOne same args', () => {
      const expensive = (a: number, b: number) => {
        let result = 0;
        for (let i = 0; i < 10; i++) result += a * b + i;
        return result;
      };

      const memoized = memoizeOne(expensive);

      // Same args - should hit cache
      const result = benchmarkBatched(
        'memoizeOne: same args (cache hit)',
        () => {
          memoized(10, 20);
        },
        1000
      );

      results.push(result);

      // memoizeOne is very simple, should be extremely fast
      assertPerformance(result, 2000000);
    });

    it('memoizeOne alternating args', () => {
      const expensive = (a: number, b: number) => a * b;
      const memoized = memoizeOne(expensive);

      let toggle = 0;
      const result = benchmarkBatched(
        'memoizeOne: alternating args (cache miss)',
        () => {
          memoized(toggle % 2, toggle % 3);
          toggle++;
        },
        1000
      );

      results.push(result);

      // Even with misses, should be reasonably fast
      assertPerformance(result, 500000);
    });
  });

  describe('WeakMemoize', () => {
    it('weakMemoize with object keys', () => {
      const processObject = (obj: { id: number }) => obj.id * 2 + Math.random();
      const memoized = weakMemoize(processObject);

      // Create objects to memoize
      const objects = Array.from({ length: 50 }, (_, i) => ({ id: i }));

      // Pre-populate cache
      for (const obj of objects) {
        memoized(obj);
      }

      let idx = 0;
      const result = benchmarkBatched(
        'weakMemoize: cached object lookup',
        () => {
          memoized(objects[idx % 50]);
          idx++;
        },
        1000
      );

      results.push(result);

      // WeakMap lookup should be fast
      assertPerformance(result, 1000000);
    });
  });

  describe('FrameMemoizer', () => {
    it('FrameMemoizer within same frame', () => {
      const frameMemo = new FrameMemoizer();

      const expensive = memoize((key: string) => {
        let sum = 0;
        for (let i = 0; i < 100; i++) sum += i;
        return sum;
      });

      // Register with frame memoizer
      const memoized = frameMemo.memoize((key: string) => expensive(key));

      // Simulate multiple calls in same frame
      const result = benchmark('FrameMemoizer: same frame access', () => {
        memoized('test-key');
        memoized('test-key');
        memoized('test-key');
      });

      results.push(result);

      assertPerformance(result, 200000);
    });

    it('FrameMemoizer with frame tick', () => {
      const frameMemo = new FrameMemoizer();
      let frameCount = 0;

      const memoized = frameMemo.memoize((n: number) => n * 2);

      const result = benchmark('FrameMemoizer: with frame tick', () => {
        memoized(frameCount);
        frameCount++;
        frameMemo.tick();
      });

      results.push(result);

      assertPerformance(result, 100000);
    });
  });

  describe('Built-in Formatters', () => {
    it('number formatting with memoize', () => {
      const formatNumber = memoize((n: number) => {
        if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
        return n.toFixed(2);
      }, { maxSize: 100 });

      const values = [0, 1, 10, 100, 1000, 10000, 100000, 1000000];
      
      // Warm up cache
      for (const v of values) formatNumber(v);

      let idx = 0;
      const result = benchmarkBatched(
        'NumberFormatter: format (cached)',
        () => {
          formatNumber(values[idx % values.length]);
          idx++;
        },
        1000
      );

      results.push(result);

      assertPerformance(result, 500000);
    });

    it('byte formatting with memoize', () => {
      const formatBytes = memoize((bytes: number) => {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return bytes + ' B';
      }, { maxSize: 100 });

      const values = [0, 100, 1024, 1048576, 1073741824];
      
      // Warm up cache
      for (const v of values) formatBytes(v);

      let idx = 0;
      const result = benchmarkBatched(
        'ByteFormatter: format (cached)',
        () => {
          formatBytes(values[idx % values.length]);
          idx++;
        },
        1000
      );

      results.push(result);

      assertPerformance(result, 500000);
    });
  });

  describe('Cache Hit Rate Verification', () => {
    it('verify cache effectiveness', () => {
      const expensiveOp = (n: number) => {
        // Simulate expensive computation
        let result = 0;
        for (let i = 0; i < 50; i++) {
          result += Math.sin(n + i) * Math.cos(n - i);
        }
        return result;
      };

      const memoizedOp = memoize(expensiveOp, { maxSize: 100, name: 'hitRateTest' });

      // Simulate realistic access pattern (80% repeat, 20% new)
      const iterations = 10000;
      const knownValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      let newValueCounter = 100;

      for (let i = 0; i < iterations; i++) {
        if (Math.random() < 0.8) {
          // 80% - access known value
          memoizedOp(knownValues[i % knownValues.length]);
        } else {
          // 20% - new value
          memoizedOp(newValueCounter++);
        }
      }

      const stats = memoizedOp.getStats();

      // With 80% repeat access and warm cache, expect >70% hit rate
      expect(stats.hitRate).toBeGreaterThan(0.7);

      console.log(`Cache hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
      console.log(`Hits: ${stats.hits}, Misses: ${stats.misses}`);
    });
  });

  // Print results at the end
  it('print benchmark results', () => {
    console.log('\n' + formatBenchmarkResults(results) + '\n');
  });
});
