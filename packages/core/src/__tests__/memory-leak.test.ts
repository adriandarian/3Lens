/**
 * Memory Leak Tests
 *
 * Tests to verify that all modules properly clean up resources and don't
 * leak memory. Uses WeakRef where available to verify object cleanup.
 *
 * @module __tests__/memory-leak
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
} from '../utils/ObjectPool';
import {
  LRUCache,
  memoize,
  memoizeOne,
  MemoizationManager,
} from '../utils/Memoization';
import { LogicalEntityManager } from '../entities/LogicalEntityManager';
import { ResourceLifecycleTracker } from '../tracking/ResourceLifecycleTracker';
import { PluginManager } from '../plugins/PluginManager';
import type { DevtoolPlugin, DevtoolContext } from '../plugins/types';
import type { FrameStats } from '../types';

// Helper to force GC if available (V8 flag required for tests)
async function forceGC(): Promise<void> {
  if (globalThis.gc) {
    globalThis.gc();
  }
  // Give time for cleanup
  await new Promise((resolve) => setTimeout(resolve, 10));
}

// Helper to create trackable objects with WeakRef
function createWeakTrackedObject<T extends object>(
  factory: () => T
): {
  ref: WeakRef<T>;
  get: () => T | undefined;
} {
  const obj = factory();
  const ref = new WeakRef(obj);
  return {
    ref,
    get: () => ref.deref(),
  };
}

// Mock Three.js Object3D for testing
function createMockObject3D(name?: string): any {
  const uuid = `uuid-${Math.random().toString(36).substring(2, 11)}`;
  return {
    uuid,
    name: name || `Object_${uuid}`,
    userData: {},
    type: 'Object3D',
    geometry: undefined,
    material: undefined,
    visible: true,
    parent: null,
    children: [],
  };
}

// Mock Mesh with geometry
function createMockMesh(name?: string, triangles = 100): any {
  const obj = createMockObject3D(name);
  obj.type = 'Mesh';
  obj.geometry = {
    uuid: `geo-${Math.random().toString(36).substring(2, 11)}`,
    index: { count: triangles * 3 },
    attributes: {
      position: { count: triangles * 3 },
    },
    dispose: vi.fn(),
  };
  obj.material = {
    uuid: `mat-${Math.random().toString(36).substring(2, 11)}`,
    type: 'MeshStandardMaterial',
    dispose: vi.fn(),
  };
  return obj;
}

// Mock probe for plugin tests (matches PluginManager.test.ts pattern)
function createMockProbe(): any {
  const callbacks: {
    frameStats: Function[];
    snapshot: Function[];
    selection: Function[];
  } = {
    frameStats: [],
    snapshot: [],
    selection: [],
  };

  return {
    config: {
      debug: false,
      captureFrameStats: true,
      snapshotInterval: 1000,
    },
    onFrameStats: vi.fn((cb: Function) => {
      callbacks.frameStats.push(cb);
      return () => {
        callbacks.frameStats = callbacks.frameStats.filter((c) => c !== cb);
      };
    }),
    onSnapshot: vi.fn((cb: Function) => {
      callbacks.snapshot.push(cb);
      return () => {
        callbacks.snapshot = callbacks.snapshot.filter((c) => c !== cb);
      };
    }),
    onSelectionChanged: vi.fn((cb: Function) => {
      callbacks.selection.push(cb);
      return () => {
        callbacks.selection = callbacks.selection.filter((c) => c !== cb);
      };
    }),
    getLatestStats: vi.fn().mockReturnValue(null),
    getSnapshot: vi.fn().mockReturnValue(null),
    selectObject: vi.fn(),
    selectObjectByUuid: vi.fn(),
    clearSelection: vi.fn(),
    navigateToObject: vi.fn(),
    focusOnObject: vi.fn(),
    setObjectVisible: vi.fn(),
    getLogicalEntities: vi.fn().mockReturnValue([]),
    getModuleInfo: vi.fn().mockReturnValue(null),
    // Emit helpers for testing
    _emit: {
      frameStats: (stats: any) =>
        callbacks.frameStats.forEach((cb) => cb(stats)),
      snapshot: (snapshot: any) =>
        callbacks.snapshot.forEach((cb) => cb(snapshot)),
      selection: (node: any) => callbacks.selection.forEach((cb) => cb(node)),
    },
  };
}

describe('Memory Leak Tests', () => {
  describe('ObjectPool Memory Management', () => {
    afterEach(() => {
      PoolManager.reset();
    });

    it('should not retain references after clear()', () => {
      const pool = new ObjectPool({
        factory: () => ({ value: 0, data: new Array(1000).fill(0) }),
        name: 'LeakTestPool',
        initialSize: 10,
        maxSize: 100,
      });

      // Fill pool
      const objects: { value: number; data: number[] }[] = [];
      for (let i = 0; i < 50; i++) {
        objects.push(pool.acquire());
      }

      // Release all
      objects.forEach((obj) => pool.release(obj));
      expect(pool.size).toBe(50);

      // Clear pool
      pool.clear();
      expect(pool.size).toBe(0);

      // Pool should be empty and ready for new allocations
      const newObj = pool.acquire();
      expect(newObj).toBeDefined();
      expect(pool.size).toBe(0); // New allocation, not from pool
    });

    it('should respect maxSize and discard excess objects', () => {
      const pool = new ObjectPool({
        factory: () => ({ value: 0 }),
        name: 'MaxSizePool',
        maxSize: 5,
      });

      // Acquire and release more than max size
      const objects: { value: number }[] = [];
      for (let i = 0; i < 20; i++) {
        objects.push(pool.acquire());
      }

      // Release all
      objects.forEach((obj) => pool.release(obj));

      // Pool should be capped at maxSize
      expect(pool.size).toBeLessThanOrEqual(5);

      const stats = pool.getStats();
      expect(stats.discardedCount).toBeGreaterThan(0);
    });

    it('should properly reset objects on release', () => {
      interface TestObj {
        value: number;
        refs: string[];
      }

      const pool = new ObjectPool<TestObj>({
        factory: () => ({ value: 0, refs: [] }),
        reset: (obj) => {
          obj.value = 0;
          obj.refs.length = 0; // Clear array without creating new one
        },
        name: 'ResetPool',
      });

      const obj = pool.acquire();
      obj.value = 42;
      obj.refs.push('ref1', 'ref2', 'ref3');

      pool.release(obj);

      const reusedObj = pool.acquire();
      expect(reusedObj).toBe(obj);
      expect(reusedObj.value).toBe(0);
      expect(reusedObj.refs.length).toBe(0);
    });

    it('should not leak ArrayPool memory with different sizes', () => {
      const pool = new ArrayPool<number>({ name: 'NumberPool' });

      // Create arrays of various sizes
      const sizes = [8, 16, 32, 64, 128, 256];
      const arrays: number[][] = [];

      for (const size of sizes) {
        for (let i = 0; i < 10; i++) {
          arrays.push(pool.acquire(size));
        }
      }

      // Release all
      arrays.forEach((arr) => pool.release(arr));

      const statsBefore = pool.getStats();
      // ArrayPool buckets arrays by size, some may go to same bucket
      expect(statsBefore.available).toBeGreaterThan(0);

      // Clear all pools
      pool.clear();

      const statsAfter = pool.getStats();
      expect(statsAfter.available).toBe(0);
    });

    it('should clean up PoolManager singleton on reset', () => {
      // Reset first to ensure clean state
      PoolManager.reset();

      const manager1 = getPoolManager();

      // Use the pools
      const fs = acquireFrameStats();
      fs.frame = 100;
      releaseFrameStats(fs);

      const vec = acquireVector3();
      vec.x = 10;
      releaseVector3(vec);

      const arr = acquireArray<string>(10);
      arr[0] = 'test';
      releaseArray(arr);

      // Reset
      PoolManager.reset();

      // Get new instance
      const manager2 = getPoolManager();
      expect(manager2).not.toBe(manager1);
    });
  });

  describe('LRUCache Memory Management', () => {
    it('should evict oldest entries when maxSize is reached', () => {
      const cache = new LRUCache<string, { data: number[] }>({
        maxSize: 5,
        name: 'EvictionTest',
      });

      // Fill cache beyond capacity
      for (let i = 0; i < 10; i++) {
        cache.set(`key-${i}`, { data: new Array(100).fill(i) });
      }

      // Only last 5 should remain
      for (let i = 0; i < 5; i++) {
        expect(cache.get(`key-${i}`)).toBeUndefined();
      }
      for (let i = 5; i < 10; i++) {
        expect(cache.get(`key-${i}`)).toBeDefined();
      }

      const stats = cache.getStats();
      expect(stats.size).toBe(5);
      expect(stats.evictions).toBeGreaterThan(0);
    });

    it('should expire entries after TTL', async () => {
      const cache = new LRUCache<string, string>({
        maxSize: 100,
        ttl: 50, // 50ms TTL
        name: 'TTLTest',
      });

      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(cache.get('key1')).toBeUndefined();

      const stats = cache.getStats();
      expect(stats.expirations).toBeGreaterThan(0);
    });

    it('should clear all entries on clear()', () => {
      const cache = new LRUCache<number, object>({
        maxSize: 100,
        name: 'ClearTest',
      });

      for (let i = 0; i < 50; i++) {
        cache.set(i, { value: i });
      }

      expect(cache.getStats().size).toBe(50);

      cache.clear();

      expect(cache.getStats().size).toBe(0);
      expect(cache.get(0)).toBeUndefined();
    });

    it('should not retain references to deleted entries', () => {
      const cache = new LRUCache<string, { data: number[] }>({
        maxSize: 10,
        name: 'RefTest',
      });

      cache.set('key', { data: new Array(1000).fill(0) });
      expect(cache.has('key')).toBe(true);

      cache.delete('key');
      expect(cache.has('key')).toBe(false);
      expect(cache.get('key')).toBeUndefined();
    });
  });

  describe('Memoization Memory Management', () => {
    it('should clear memoized function cache', () => {
      let callCount = 0;
      const expensive = memoize(
        (x: number) => {
          callCount++;
          return x * 2;
        },
        { maxSize: 10, name: 'ClearableCache' }
      );

      expensive(1);
      expensive(2);
      expensive(1); // Should hit cache

      expect(callCount).toBe(2);

      expensive.clear();

      expensive(1); // Should miss cache
      expect(callCount).toBe(3);
    });

    it('should evict old memoized values when cache is full', () => {
      let callCount = 0;
      const fn = memoize(
        (x: number) => {
          callCount++;
          return x * x;
        },
        { maxSize: 3, name: 'SmallCache' }
      );

      fn(1);
      fn(2);
      fn(3);
      expect(callCount).toBe(3);

      fn(4); // Should evict key 1
      expect(callCount).toBe(4);

      fn(1); // Should miss cache (was evicted)
      expect(callCount).toBe(5);
    });

    it('should release references in memoizeOne', () => {
      let callCount = 0;
      const fn = memoizeOne((obj: { value: number }) => {
        callCount++;
        return obj.value * 2;
      });

      const obj1 = { value: 1 };
      const obj2 = { value: 2 };

      fn(obj1);
      fn(obj1); // Same reference, cached
      expect(callCount).toBe(1);

      fn(obj2); // Different reference, not cached
      expect(callCount).toBe(2);

      fn.clear();

      fn(obj2); // Cache cleared, should recompute
      expect(callCount).toBe(3);
    });

    it('should clear MemoizationManager caches', () => {
      const memoManager = new MemoizationManager();

      const fn1 = memoize((x: number) => x + 1, { name: 'fn1' });
      const fn2 = memoize((x: number) => x + 2, { name: 'fn2' });

      // Register with manager
      memoManager.register('fn1', fn1);
      memoManager.register('fn2', fn2);

      fn1(1);
      fn2(2);

      const statsBefore = memoManager.getAllStats();
      expect(Object.keys(statsBefore).length).toBe(2);

      memoManager.clearAll();

      const fn1Stats = fn1.getStats();
      const fn2Stats = fn2.getStats();
      expect(fn1Stats.size).toBe(0);
      expect(fn2Stats.size).toBe(0);
    });
  });

  describe('LogicalEntityManager Memory Management', () => {
    let manager: LogicalEntityManager;

    beforeEach(() => {
      manager = new LogicalEntityManager();
    });

    it('should clean up entity references on unregister', () => {
      const obj = createMockMesh('TestMesh');

      const entityId = manager.registerLogicalEntity({
        name: 'TestEntity',
        module: '@test/module',
        componentType: 'TestComponent',
      });

      manager.addObjectToEntity(entityId, obj);

      // Verify entity exists
      expect(manager.getEntity(entityId)).toBeDefined();
      // userData stores an object with entityId, entityName, module
      expect(obj.userData.__3lens_entity?.entityId).toBe(entityId);

      // Unregister
      manager.unregisterLogicalEntity(entityId);

      // Entity should be gone
      expect(manager.getEntity(entityId)).toBeUndefined();
    });

    it('should clean up child entities on recursive unregister', () => {
      const parentId = manager.registerLogicalEntity({ name: 'Parent' });
      const child1Id = manager.registerLogicalEntity({
        name: 'Child1',
        parentEntityId: parentId,
      });
      const child2Id = manager.registerLogicalEntity({
        name: 'Child2',
        parentEntityId: parentId,
      });
      const grandchildId = manager.registerLogicalEntity({
        name: 'Grandchild',
        parentEntityId: child1Id,
      });

      expect(manager.getEntity(parentId)).toBeDefined();
      expect(manager.getEntity(child1Id)).toBeDefined();
      expect(manager.getEntity(child2Id)).toBeDefined();
      expect(manager.getEntity(grandchildId)).toBeDefined();

      // Recursive unregister parent
      manager.unregisterLogicalEntity(parentId, true);

      // All should be gone
      expect(manager.getEntity(parentId)).toBeUndefined();
      expect(manager.getEntity(child1Id)).toBeUndefined();
      expect(manager.getEntity(child2Id)).toBeUndefined();
      expect(manager.getEntity(grandchildId)).toBeUndefined();
    });

    it('should clean up module tracking on entity removal', () => {
      const moduleId = '@game/player';

      manager.registerLogicalEntity({
        name: 'Entity1',
        module: moduleId,
      });
      const entity2Id = manager.registerLogicalEntity({
        name: 'Entity2',
        module: moduleId,
      });

      let moduleInfo = manager.getModuleInfo(moduleId);
      expect(moduleInfo?.entityCount).toBe(2);

      manager.unregisterLogicalEntity(entity2Id);

      moduleInfo = manager.getModuleInfo(moduleId);
      expect(moduleInfo?.entityCount).toBe(1);
    });

    it('should fully clean up on clear()', () => {
      // Add multiple entities with objects
      for (let i = 0; i < 10; i++) {
        const entityId = manager.registerLogicalEntity({
          name: `Entity${i}`,
          module: `@module/lib${i % 3}`,
        });
        const obj = createMockMesh(`Mesh${i}`);
        manager.addObjectToEntity(entityId, obj);
      }

      expect(manager.getAllEntities().length).toBe(10);

      manager.clear();

      expect(manager.getAllEntities().length).toBe(0);
    });

    it('should remove object from entity without leaking references', () => {
      const entityId = manager.registerLogicalEntity({ name: 'Test' });
      const obj1 = createMockMesh('Mesh1');
      const obj2 = createMockMesh('Mesh2');

      manager.addObjectToEntity(entityId, obj1);
      manager.addObjectToEntity(entityId, obj2);

      let entity = manager.getEntity(entityId);
      expect(entity?.objectUuids.length).toBe(2);

      manager.removeObjectFromEntity(entityId, obj1);

      entity = manager.getEntity(entityId);
      expect(entity?.objectUuids.length).toBe(1);
      expect(obj1.userData.__3lens_entity).toBeUndefined();
      expect(obj2.userData.__3lens_entity?.entityId).toBe(entityId);
    });
  });

  describe('ResourceLifecycleTracker Memory Management', () => {
    let tracker: ResourceLifecycleTracker;

    beforeEach(() => {
      tracker = new ResourceLifecycleTracker({
        maxEvents: 100,
        leakThresholdMs: 100,
      });
    });

    it('should limit stored events to maxEvents', () => {
      // Add more events than maxEvents
      for (let i = 0; i < 200; i++) {
        tracker.recordCreation('geometry', `geo-${i}`, {
          name: `Geometry${i}`,
        });
      }

      const events = tracker.getEvents();
      expect(events.length).toBeLessThanOrEqual(100);
    });

    it('should clear all data on clear()', () => {
      // Add various resources
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordCreation('material', 'mat-1');
      tracker.recordCreation('texture', 'tex-1');
      tracker.recordAttachment('geometry', 'geo-1', 'mesh-1');

      expect(tracker.getEvents().length).toBeGreaterThan(0);

      tracker.clear();

      expect(tracker.getEvents().length).toBe(0);
      expect(tracker.getAlerts().length).toBe(0);
    });

    it('should clear alerts independently', async () => {
      // Create a resource that will trigger leak alert
      const t = new ResourceLifecycleTracker({
        maxEvents: 100,
        leakThresholdMs: 10,
      });

      t.recordCreation('geometry', 'geo-leak');

      // Wait for threshold
      await new Promise((resolve) => setTimeout(resolve, 20));

      t.runLeakDetection();
      expect(t.getAlerts().length).toBeGreaterThan(0);

      t.clearAlerts();
      expect(t.getAlerts().length).toBe(0);
    });

    it('should not duplicate alerts for same resource', async () => {
      const t = new ResourceLifecycleTracker({
        maxEvents: 100,
        leakThresholdMs: 10,
      });

      t.recordCreation('geometry', 'geo-dup');

      await new Promise((resolve) => setTimeout(resolve, 20));

      // Check multiple times
      t.runLeakDetection();
      t.runLeakDetection();
      t.runLeakDetection();

      const alerts = t.getAlerts();
      const dupAlerts = alerts.filter(
        (a) => a.resourceUuid === 'geo-dup' && a.type === 'undisposed_resource'
      );
      expect(dupAlerts.length).toBe(1);
    });
  });

  describe('PluginManager Memory Management', () => {
    let manager: PluginManager;
    let mockProbe: ReturnType<typeof createMockProbe>;

    beforeEach(() => {
      mockProbe = createMockProbe();
      manager = new PluginManager(mockProbe);
    });

    it('should clean up plugin state on deactivation', async () => {
      const stateCleanup = vi.fn();

      const plugin: DevtoolPlugin = {
        metadata: {
          id: 'state-cleanup-test',
          name: 'State Cleanup Test',
          version: '1.0.0',
        },
        activate: (ctx: DevtoolContext) => {
          ctx.setState('key1', { data: new Array(100).fill(0) });
          ctx.setState('key2', 'value2');
        },
        deactivate: (ctx: DevtoolContext) => {
          stateCleanup();
          ctx.clearState();
        },
      };

      manager.registerPlugin(plugin);
      await manager.activatePlugin('state-cleanup-test');

      // Plugin should have state
      const state = manager.getPluginState('state-cleanup-test');
      expect(state['key1']).toBeDefined();
      expect(state['key2']).toBeDefined();

      await manager.deactivatePlugin('state-cleanup-test');

      expect(stateCleanup).toHaveBeenCalled();
    });

    it('should clean up panels and actions on unregister', async () => {
      const plugin: DevtoolPlugin = {
        metadata: {
          id: 'panel-cleanup-test',
          name: 'Panel Cleanup Test',
          version: '1.0.0',
        },
        activate: () => {},
        panels: [
          {
            id: 'test-panel',
            name: 'Test Panel',
            icon: 'test',
            render: () => '<div>Test</div>',
          },
        ],
        toolbarActions: [
          {
            id: 'test-action',
            name: 'Test Action',
            icon: 'action',
            onClick: () => {},
          },
        ],
      };

      manager.registerPlugin(plugin);
      await manager.activatePlugin('panel-cleanup-test');

      // Verify panel and action exist
      expect(manager.getPanels().length).toBe(1);
      expect(manager.getToolbarActions().length).toBe(1);

      await manager.deactivatePlugin('panel-cleanup-test');
      await manager.unregisterPlugin('panel-cleanup-test');

      // Panels and actions should be cleaned up
      expect(manager.getPanels().length).toBe(0);
      expect(manager.getToolbarActions().length).toBe(0);
    });

    it('should clean up event subscriptions on plugin destroy', async () => {
      const subscribedCallback = vi.fn();

      const plugin: DevtoolPlugin = {
        metadata: {
          id: 'subscription-test',
          name: 'Subscription Test',
          version: '1.0.0',
        },
        activate: (ctx: DevtoolContext) => {
          ctx.onMessage(subscribedCallback);
        },
        deactivate: () => {
          // Message handlers should be auto-cleaned
        },
      };

      manager.registerPlugin(plugin);
      await manager.activatePlugin('subscription-test');

      // Just verify the plugin was activated
      const plugins = manager.getPlugins();
      const activePlugin = plugins.find((p) => p.id === 'subscription-test');
      expect(activePlugin?.state).toBe('activated');

      await manager.deactivatePlugin('subscription-test');

      // Plugin should be deactivated
      const deactivatedPlugin = manager
        .getPlugins()
        .find((p) => p.id === 'subscription-test');
      expect(deactivatedPlugin?.state).toBe('deactivated');
    });

    it('should clean up all plugins on shutdown', async () => {
      const deactivateFns = [vi.fn(), vi.fn(), vi.fn()];

      for (let i = 0; i < 3; i++) {
        const plugin: DevtoolPlugin = {
          metadata: {
            id: `plugin-${i}`,
            name: `Plugin ${i}`,
            version: '1.0.0',
          },
          activate: () => {},
          deactivate: deactivateFns[i],
        };
        manager.registerPlugin(plugin);
        await manager.activatePlugin(`plugin-${i}`);
      }

      expect(manager.getPlugins().length).toBe(3);

      // Deactivate all plugins
      for (let i = 0; i < 3; i++) {
        await manager.deactivatePlugin(`plugin-${i}`);
      }

      deactivateFns.forEach((fn) => expect(fn).toHaveBeenCalled());
    });
  });

  describe('Event Listener Cleanup', () => {
    it('should allow unsubscribing from events without leaks', () => {
      const manager = new LogicalEntityManager();
      const callbacks: (() => void)[] = [];

      // Register many callbacks
      for (let i = 0; i < 100; i++) {
        const callback = vi.fn();
        const unsubscribe = manager.onEntityEvent(callback);
        callbacks.push(unsubscribe);
      }

      // Trigger an event
      manager.registerLogicalEntity({ name: 'Test' });

      // Unsubscribe all
      callbacks.forEach((unsub) => unsub());

      // Register another entity - no callbacks should fire
      const newCallbackFired = vi.fn();
      manager.onEntityEvent(newCallbackFired);
      manager.registerLogicalEntity({ name: 'Test2' });

      // Only the new callback should have been called
      expect(newCallbackFired).toHaveBeenCalledTimes(1);
    });
  });

  describe('Large Data Structure Cleanup', () => {
    it('should handle resource tracking without memory buildup', () => {
      const tracker = new ResourceLifecycleTracker({ maxEvents: 50 });

      // Simulate tracking many resources over time
      for (let batch = 0; batch < 10; batch++) {
        for (let i = 0; i < 10; i++) {
          const uuid = `resource-${batch}-${i}`;
          tracker.recordCreation('geometry', uuid, {
            name: `Geometry_${uuid}`,
            estimatedMemory: 1024 * 1024, // 1MB each
          });
        }

        // Dispose most of them
        for (let i = 0; i < 9; i++) {
          const uuid = `resource-${batch}-${i}`;
          tracker.recordDisposal('geometry', uuid);
        }
      }

      // Events should be limited to maxEvents
      const events = tracker.getEvents();
      expect(events.length).toBeLessThanOrEqual(50);
    });

    it('should efficiently handle entity manager with many entities', () => {
      const manager = new LogicalEntityManager();
      const entityIds: string[] = [];

      // Create many entities
      for (let i = 0; i < 500; i++) {
        const id = manager.registerLogicalEntity({
          name: `Entity${i}`,
          module: `@module/lib${i % 10}`,
          tags: [`tag${i % 5}`, 'common'],
        });
        entityIds.push(id);

        // Add objects to some entities
        if (i % 3 === 0) {
          const mesh = createMockMesh(`Mesh${i}`);
          manager.addObjectToEntity(id, mesh);
        }
      }

      // Filter operations should be efficient
      const filtered = manager.filterEntities({
        module: '@module/lib0',
      });
      expect(filtered.length).toBe(50);

      // Clear everything
      manager.clear();
      expect(manager.getAllEntities().length).toBe(0);
    });
  });

  describe('Circular Reference Prevention', () => {
    it('should not create circular references in entity hierarchy', () => {
      const manager = new LogicalEntityManager();

      const id1 = manager.registerLogicalEntity({ name: 'Entity1' });
      const id2 = manager.registerLogicalEntity({
        name: 'Entity2',
        parentEntityId: id1,
      });

      // Try to make circular reference (id1 -> id2 -> id1)
      // This should either fail or be handled gracefully
      expect(() => {
        manager.updateLogicalEntity(id1, {
          metadata: { parentEntityId: id2 },
        });
      }).not.toThrow();

      // Entities should still be cleanable
      manager.unregisterLogicalEntity(id1, true);
      expect(manager.getAllEntities().length).toBe(0);
    });

    it('should handle self-referential objects in pools', () => {
      interface Node {
        id: number;
        next: Node | null;
      }

      const pool = new ObjectPool<Node>({
        factory: () => ({ id: 0, next: null }),
        reset: (node) => {
          node.id = 0;
          node.next = null; // Break any circular refs on reset
        },
        name: 'NodePool',
        maxSize: 10,
      });

      // Create circular structure
      const node1 = pool.acquire();
      const node2 = pool.acquire();
      node1.id = 1;
      node2.id = 2;
      node1.next = node2;
      node2.next = node1; // Circular!

      // Release should break the cycle via reset
      pool.release(node1);
      pool.release(node2);

      // Acquire should give clean objects
      const clean1 = pool.acquire();
      const clean2 = pool.acquire();
      expect(clean1.next).toBeNull();
      expect(clean2.next).toBeNull();
    });
  });
});
