import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  LRUCache,
  memoize,
  memoizeOne,
  FrameMemoizer,
  getFrameMemoizer,
  resetFrameMemoizer,
  formatPropertyPath,
  formatNumber,
  formatBytes,
  getTypeName,
  getObjectId,
  weakMemoize,
  MemoizationManager,
  getMemoizationManager,
  resetMemoizationManager,
} from './Memoization';

describe('LRUCache', () => {
  describe('basic operations', () => {
    it('should store and retrieve values', () => {
      const cache = new LRUCache<string, number>();
      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);
    });

    it('should return undefined for missing keys', () => {
      const cache = new LRUCache<string, number>();
      expect(cache.get('missing')).toBeUndefined();
    });

    it('should report correct size', () => {
      const cache = new LRUCache<string, number>();
      expect(cache.size).toBe(0);
      cache.set('a', 1);
      expect(cache.size).toBe(1);
      cache.set('b', 2);
      expect(cache.size).toBe(2);
    });

    it('should check existence with has()', () => {
      const cache = new LRUCache<string, number>();
      cache.set('a', 1);
      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    it('should delete entries', () => {
      const cache = new LRUCache<string, number>();
      cache.set('a', 1);
      expect(cache.delete('a')).toBe(true);
      expect(cache.has('a')).toBe(false);
      expect(cache.delete('missing')).toBe(false);
    });

    it('should clear all entries', () => {
      const cache = new LRUCache<string, number>();
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      expect(cache.size).toBe(0);
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entry when at capacity', () => {
      const cache = new LRUCache<string, number>({ maxSize: 2 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(true);
      expect(cache.has('c')).toBe(true);
    });

    it('should update access order on get', () => {
      const cache = new LRUCache<string, number>({ maxSize: 2 });
      cache.set('a', 1);
      cache.set('b', 2);

      // Access 'a' to make it more recent
      cache.get('a');

      // Add new entry, should evict 'b' not 'a'
      cache.set('c', 3);

      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
      expect(cache.has('c')).toBe(true);
    });

    it('should track eviction count', () => {
      const cache = new LRUCache<string, number>({ maxSize: 2 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4);

      const stats = cache.getStats();
      expect(stats.evictions).toBe(2);
    });
  });

  describe('TTL expiration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should expire entries after TTL', () => {
      const cache = new LRUCache<string, number>({ ttl: 1000 });
      cache.set('a', 1);

      expect(cache.get('a')).toBe(1);

      vi.advanceTimersByTime(1001);

      expect(cache.get('a')).toBeUndefined();
    });

    it('should track expiration count', () => {
      const cache = new LRUCache<string, number>({ ttl: 1000 });
      cache.set('a', 1);

      vi.advanceTimersByTime(1001);
      cache.get('a'); // Triggers expiration

      const stats = cache.getStats();
      expect(stats.expirations).toBe(1);
    });

    it('should prune expired entries', () => {
      const cache = new LRUCache<string, number>({ ttl: 1000 });
      cache.set('a', 1);
      cache.set('b', 2);

      vi.advanceTimersByTime(1001);

      const pruned = cache.prune();
      expect(pruned).toBe(2);
      expect(cache.size).toBe(0);
    });
  });

  describe('statistics', () => {
    it('should track hits and misses', () => {
      const cache = new LRUCache<string, number>();
      cache.set('a', 1);

      cache.get('a'); // Hit
      cache.get('a'); // Hit
      cache.get('b'); // Miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(66.67, 1);
    });

    it('should reset statistics', () => {
      const cache = new LRUCache<string, number>();
      cache.set('a', 1);
      cache.get('a');
      cache.get('b');

      cache.resetStats();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });
});

describe('memoize', () => {
  it('should cache function results', () => {
    let callCount = 0;
    const fn = memoize((x: number) => {
      callCount++;
      return x * 2;
    });

    expect(fn(5)).toBe(10);
    expect(fn(5)).toBe(10);
    expect(callCount).toBe(1);
  });

  it('should differentiate between arguments', () => {
    let callCount = 0;
    const fn = memoize((x: number) => {
      callCount++;
      return x * 2;
    });

    expect(fn(5)).toBe(10);
    expect(fn(10)).toBe(20);
    expect(fn(5)).toBe(10);
    expect(callCount).toBe(2);
  });

  it('should handle multiple arguments', () => {
    let callCount = 0;
    const fn = memoize((a: number, b: number) => {
      callCount++;
      return a + b;
    });

    expect(fn(1, 2)).toBe(3);
    expect(fn(1, 2)).toBe(3);
    expect(fn(2, 1)).toBe(3);
    expect(callCount).toBe(2);
  });

  it('should handle objects with uuid', () => {
    let callCount = 0;
    const fn = memoize((obj: { uuid: string; value: number }) => {
      callCount++;
      return obj.value * 2;
    });

    const obj = { uuid: 'abc-123', value: 5 };

    expect(fn(obj)).toBe(10);
    expect(fn(obj)).toBe(10);
    expect(callCount).toBe(1);
  });

  it('should handle objects with id', () => {
    let callCount = 0;
    const fn = memoize((obj: { id: number; value: number }) => {
      callCount++;
      return obj.value * 2;
    });

    const obj = { id: 42, value: 5 };

    expect(fn(obj)).toBe(10);
    expect(fn(obj)).toBe(10);
    expect(callCount).toBe(1);
  });

  it('should use custom key resolver', () => {
    let callCount = 0;
    const fn = memoize(
      (obj: { x: number; y: number }) => {
        callCount++;
        return obj.x + obj.y;
      },
      {
        keyResolver: (obj: unknown) => {
          const o = obj as { x: number; y: number };
          return `${o.x},${o.y}`;
        },
      }
    );

    expect(fn({ x: 1, y: 2 })).toBe(3);
    expect(fn({ x: 1, y: 2 })).toBe(3);
    expect(callCount).toBe(1);
  });

  it('should provide clear() method', () => {
    let callCount = 0;
    const fn = memoize((x: number) => {
      callCount++;
      return x * 2;
    });

    fn(5);
    fn.clear();
    fn(5);

    expect(callCount).toBe(2);
  });

  it('should provide getStats() method', () => {
    const fn = memoize((x: number) => x * 2, { maxSize: 50 });

    fn(1);
    fn(1);
    fn(2);

    const stats = fn.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(2);
    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBe(50);
  });

  it('should provide has() method', () => {
    const fn = memoize((x: number) => x * 2);

    expect(fn.has(5)).toBe(false);
    fn(5);
    expect(fn.has(5)).toBe(true);
  });

  it('should provide set() method', () => {
    const fn = memoize((x: number) => x * 2);

    fn.set([5], 100);
    expect(fn(5)).toBe(100);
  });

  it('should provide delete() method', () => {
    const fn = memoize((x: number) => x * 2);

    fn(5);
    expect(fn.has(5)).toBe(true);
    fn.delete(5);
    expect(fn.has(5)).toBe(false);
  });

  it('should expose name property', () => {
    const fn = memoize((x: number) => x, { name: 'myMemoizedFn' });
    expect(fn.name).toBe('myMemoizedFn');
  });

  it('should handle null and undefined', () => {
    let callCount = 0;
    const fn = memoize((x: unknown) => {
      callCount++;
      return x;
    });

    expect(fn(null)).toBe(null);
    expect(fn(null)).toBe(null);
    expect(fn(undefined)).toBe(undefined);
    expect(fn(undefined)).toBe(undefined);
    expect(callCount).toBe(2);
  });
});

describe('memoizeOne', () => {
  it('should cache only the most recent call', () => {
    let callCount = 0;
    const fn = memoizeOne((x: number) => {
      callCount++;
      return x * 2;
    });

    expect(fn(5)).toBe(10);
    expect(fn(5)).toBe(10);
    expect(callCount).toBe(1);

    expect(fn(10)).toBe(20);
    expect(callCount).toBe(2);

    expect(fn(5)).toBe(10);
    expect(callCount).toBe(3);
  });

  it('should provide stats with maxSize 1', () => {
    const fn = memoizeOne((x: number) => x * 2);

    fn(1);
    fn(1);

    const stats = fn.getStats();
    expect(stats.maxSize).toBe(1);
    expect(stats.size).toBe(1);
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
  });

  it('should clear cache', () => {
    const fn = memoizeOne((x: number) => x * 2);

    fn(5);
    expect(fn.has(5)).toBe(true);
    fn.clear();
    expect(fn.has(5)).toBe(false);
  });
});

describe('FrameMemoizer', () => {
  it('should create frame-bound memoized functions', () => {
    const frameMemoizer = new FrameMemoizer();
    let callCount = 0;

    const fn = frameMemoizer.memoize((x: number) => {
      callCount++;
      return x * 2;
    });

    expect(fn(5)).toBe(10);
    expect(fn(5)).toBe(10);
    expect(callCount).toBe(1);
  });

  it('should clear all caches on tick', () => {
    const frameMemoizer = new FrameMemoizer();
    let callCount = 0;

    const fn = frameMemoizer.memoize((x: number) => {
      callCount++;
      return x * 2;
    });

    fn(5);
    expect(callCount).toBe(1);

    frameMemoizer.tick();

    fn(5);
    expect(callCount).toBe(2);
  });

  it('should track frame number', () => {
    const frameMemoizer = new FrameMemoizer();

    expect(frameMemoizer.frame).toBe(0);
    frameMemoizer.tick();
    expect(frameMemoizer.frame).toBe(1);
    frameMemoizer.tick();
    expect(frameMemoizer.frame).toBe(2);
  });

  it('should support memoizeOne', () => {
    const frameMemoizer = new FrameMemoizer();
    let callCount = 0;

    const fn = frameMemoizer.memoizeOne((x: number) => {
      callCount++;
      return x * 2;
    });

    fn(5);
    fn(5);
    expect(callCount).toBe(1);

    frameMemoizer.tick();
    fn(5);
    expect(callCount).toBe(2);
  });

  it('should track function count', () => {
    const frameMemoizer = new FrameMemoizer();

    frameMemoizer.memoize((x: number) => x);
    frameMemoizer.memoize((x: number) => x * 2);
    frameMemoizer.memoizeOne((x: number) => x * 3);

    expect(frameMemoizer.functionCount).toBe(3);
  });
});

describe('getFrameMemoizer', () => {
  afterEach(() => {
    resetFrameMemoizer();
  });

  it('should return singleton instance', () => {
    const a = getFrameMemoizer();
    const b = getFrameMemoizer();
    expect(a).toBe(b);
  });

  it('should reset with resetFrameMemoizer', () => {
    const a = getFrameMemoizer();
    a.tick();
    expect(a.frame).toBe(1);

    resetFrameMemoizer();

    const b = getFrameMemoizer();
    expect(b).not.toBe(a);
    expect(b.frame).toBe(0);
  });
});

describe('formatPropertyPath', () => {
  it('should format path arrays', () => {
    expect(formatPropertyPath(['material', 'color', 'r'])).toBe('material.color.r');
    expect(formatPropertyPath(['position', 'x'])).toBe('position.x');
  });

  it('should cache results', () => {
    const path = ['a', 'b', 'c'];
    formatPropertyPath.clear();

    formatPropertyPath(path);
    formatPropertyPath(path);

    const stats = formatPropertyPath.getStats();
    expect(stats.hits).toBe(1);
  });
});

describe('formatNumber', () => {
  it('should format numbers with precision', () => {
    expect(formatNumber(3.14159, 2)).toBe('3.14');
    expect(formatNumber(3.14159, 4)).toBe('3.1416');
    expect(formatNumber(42, 2)).toBe('42');
  });

  it('should handle special values', () => {
    expect(formatNumber(Infinity, 2)).toBe('Infinity');
    expect(formatNumber(-Infinity, 2)).toBe('-Infinity');
    expect(formatNumber(NaN, 2)).toBe('NaN');
  });
});

describe('formatBytes', () => {
  it('should format bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1048576)).toBe('1.0 MB');
    expect(formatBytes(1073741824)).toBe('1.0 GB');
  });
});

describe('getTypeName', () => {
  it('should return constructor name', () => {
    expect(getTypeName({})).toBe('Object');
    expect(getTypeName([])).toBe('Array');
    expect(getTypeName(new Date())).toBe('Date');
  });

  it('should handle null and undefined', () => {
    expect(getTypeName(null)).toBe('null');
    expect(getTypeName(undefined)).toBe('undefined');
  });
});

describe('getObjectId', () => {
  it('should return uuid if present', () => {
    expect(getObjectId({ uuid: 'abc-123' })).toBe('abc-123');
  });

  it('should return id if present', () => {
    expect(getObjectId({ id: 42 })).toBe('id:42');
  });

  it('should generate id if neither present', () => {
    const id = getObjectId({});
    expect(id).toMatch(/^ref:[a-z0-9]+$/);
  });
});

describe('weakMemoize', () => {
  it('should memoize using object as key', () => {
    let callCount = 0;
    const fn = weakMemoize((obj: { value: number }) => {
      callCount++;
      return obj.value * 2;
    });

    const obj = { value: 5 };

    expect(fn(obj)).toBe(10);
    expect(fn(obj)).toBe(10);
    expect(callCount).toBe(1);
  });

  it('should differentiate between objects', () => {
    let callCount = 0;
    const fn = weakMemoize((obj: { value: number }) => {
      callCount++;
      return obj.value * 2;
    });

    expect(fn({ value: 5 })).toBe(10);
    expect(fn({ value: 5 })).toBe(10);
    expect(callCount).toBe(2);
  });

  it('should provide has() method', () => {
    const fn = weakMemoize((obj: { value: number }) => obj.value * 2);
    const obj = { value: 5 };

    expect(fn.has(obj)).toBe(false);
    fn(obj);
    expect(fn.has(obj)).toBe(true);
  });

  it('should provide delete() method', () => {
    const fn = weakMemoize((obj: { value: number }) => obj.value * 2);
    const obj = { value: 5 };

    fn(obj);
    expect(fn.has(obj)).toBe(true);
    fn.delete(obj);
    expect(fn.has(obj)).toBe(false);
  });
});

describe('MemoizationManager', () => {
  let manager: MemoizationManager;

  beforeEach(() => {
    manager = new MemoizationManager();
  });

  it('should register and manage caches', () => {
    const fn = memoize((x: number) => x * 2, { name: 'testFn' });
    manager.register('testFn', fn);

    fn(5);
    fn(5);

    const allStats = manager.getAllStats();
    expect(allStats.testFn).toBeDefined();
    expect(allStats.testFn.hits).toBe(1);
  });

  it('should clear specific cache', () => {
    const fn = memoize((x: number) => x * 2, { name: 'testFn' });
    manager.register('testFn', fn);

    fn(5);
    expect(fn.has(5)).toBe(true);

    manager.clear('testFn');
    expect(fn.has(5)).toBe(false);
  });

  it('should clear all caches', () => {
    const fn1 = memoize((x: number) => x * 2, { name: 'fn1' });
    const fn2 = memoize((x: number) => x * 3, { name: 'fn2' });

    manager.register('fn1', fn1);
    manager.register('fn2', fn2);

    fn1(5);
    fn2(5);

    manager.clearAll();

    expect(fn1.has(5)).toBe(false);
    expect(fn2.has(5)).toBe(false);
  });

  it('should provide aggregated stats', () => {
    const fn1 = memoize((x: number) => x * 2, { name: 'fn1' });
    const fn2 = memoize((x: number) => x * 3, { name: 'fn2' });

    manager.register('fn1', fn1);
    manager.register('fn2', fn2);

    fn1(1);
    fn1(1);
    fn2(1);

    const stats = manager.getAggregatedStats();
    expect(stats.totalCaches).toBe(2);
    expect(stats.totalEntries).toBe(2);
    expect(stats.totalHits).toBe(1);
    expect(stats.totalMisses).toBe(2);
  });

  it('should provide frame memoizer', () => {
    const frameMemoizer = manager.getFrameMemoizer();
    expect(frameMemoizer).toBeDefined();
    expect(frameMemoizer.frame).toBe(0);
  });

  it('should tick frame memoizer', () => {
    manager.tick();
    expect(manager.frame).toBe(1);
  });
});

describe('getMemoizationManager', () => {
  afterEach(() => {
    resetMemoizationManager();
  });

  it('should return singleton instance', () => {
    const a = getMemoizationManager();
    const b = getMemoizationManager();
    expect(a).toBe(b);
  });

  it('should have built-in formatters registered', () => {
    const manager = getMemoizationManager();
    const stats = manager.getAllStats();

    expect(stats.propertyPathFormatter).toBeDefined();
    expect(stats.numberFormatter).toBeDefined();
    expect(stats.bytesFormatter).toBeDefined();
  });

  it('should reset with resetMemoizationManager', () => {
    const a = getMemoizationManager();
    a.tick();
    expect(a.frame).toBe(1);

    resetMemoizationManager();

    const b = getMemoizationManager();
    expect(b).not.toBe(a);
    expect(b.frame).toBe(0);
  });
});
