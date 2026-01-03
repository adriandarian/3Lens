/**
 * Performance Benchmarks: Logical Entity Manager
 *
 * Tests the performance of entity registration, querying, and navigation
 * operations which are critical for framework integration.
 */

import { describe, it, expect } from 'vitest';
import { LogicalEntityManager } from '../../entities/LogicalEntityManager';
import {
  benchmark,
  benchmarkBatched,
  formatBenchmarkResults,
  assertPerformance,
  type BenchmarkResult,
} from './benchmark-utils';

// Mock Three.js Object3D for benchmarks
class MockObject3D {
  uuid: string;
  name: string;
  userData: Record<string, unknown> = {};
  visible = true;
  children: MockObject3D[] = [];

  constructor(name: string) {
    this.uuid = `uuid-${name}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
  }

  traverse(callback: (obj: MockObject3D) => void): void {
    callback(this);
    for (const child of this.children) {
      child.traverse(callback);
    }
  }
}

describe('LogicalEntityManager Benchmarks', () => {
  const results: BenchmarkResult[] = [];

  describe('Entity Registration', () => {
    it('register single entity', () => {
      const manager = new LogicalEntityManager();
      let counter = 0;

      const result = benchmark('Entity: register single', () => {
        manager.registerLogicalEntity({
          name: `Entity-${counter++}`,
          module: '@app/feature',
          tags: ['test'],
        });
      });

      results.push(result);

      // Registration should be fast
      assertPerformance(result, 50000);
    });

    it('register entity with full options', () => {
      const manager = new LogicalEntityManager();
      let counter = 0;

      const result = benchmark('Entity: register with full options', () => {
        manager.registerLogicalEntity({
          name: `ComplexEntity-${counter}`,
          module: `@app/module-${counter % 10}`,
          componentType: 'PlayerComponent',
          componentId: `comp-${counter++}`,
          tags: ['tag1', 'tag2', 'tag3'],
          metadata: { health: 100, level: 5, inventory: [] },
        });
      });

      results.push(result);

      assertPerformance(result, 30000);
    });

    it('register hierarchy (parent-child)', () => {
      const manager = new LogicalEntityManager();

      // Create parent entities
      const parentIds: string[] = [];
      for (let i = 0; i < 100; i++) {
        parentIds.push(
          manager.registerLogicalEntity({
            name: `Parent-${i}`,
            module: '@app/parents',
          })
        );
      }

      let idx = 0;
      const result = benchmark('Entity: register with parent', () => {
        manager.registerLogicalEntity({
          name: `Child-${idx}`,
          module: '@app/children',
          parentEntityId: parentIds[idx % 100],
        });
        idx++;
      });

      results.push(result);

      assertPerformance(result, 40000);
    });
  });

  describe('Entity Updates', () => {
    it('update entity metadata', () => {
      const manager = new LogicalEntityManager();

      // Pre-register entities
      const entityIds: string[] = [];
      for (let i = 0; i < 1000; i++) {
        entityIds.push(
          manager.registerLogicalEntity({
            name: `Entity-${i}`,
            module: '@app/test',
            metadata: { counter: 0 },
          })
        );
      }

      let idx = 0;
      const result = benchmarkBatched(
        'Entity: update metadata',
        () => {
          manager.updateLogicalEntity(entityIds[idx % 1000], {
            metadata: { counter: idx, timestamp: Date.now() },
          });
          idx++;
        },
        1000
      );

      results.push(result);

      assertPerformance(result, 100000);
    });

    it('update entity module (triggers re-indexing)', () => {
      const manager = new LogicalEntityManager();

      // Pre-register entities in different modules
      const entityIds: string[] = [];
      for (let i = 0; i < 500; i++) {
        entityIds.push(
          manager.registerLogicalEntity({
            name: `Entity-${i}`,
            module: `@app/module-${i % 5}`,
          })
        );
      }

      let idx = 0;
      const result = benchmark('Entity: update module (re-index)', () => {
        manager.updateLogicalEntity(entityIds[idx % 500], {
          module: `@app/newmodule-${idx % 10}`,
        });
        idx++;
      });

      results.push(result);

      assertPerformance(result, 50000);
    });
  });

  describe('Object Association', () => {
    it('add object to entity', () => {
      const manager = new LogicalEntityManager();

      const entityId = manager.registerLogicalEntity({
        name: 'ObjectContainer',
        module: '@app/objects',
      });

      const objects: MockObject3D[] = [];
      for (let i = 0; i < 1000; i++) {
        objects.push(new MockObject3D(`Object-${i}`));
      }

      let idx = 0;
      const result = benchmarkBatched(
        'Entity: add object',
        () => {
          manager.addObjectToEntity(entityId, objects[idx % 1000] as unknown as THREE.Object3D);
          idx++;
        },
        500
      );

      results.push(result);

      assertPerformance(result, 100000);
    });

    it('remove object from entity', () => {
      const manager = new LogicalEntityManager();

      // Create entity with many objects
      const entityId = manager.registerLogicalEntity({
        name: 'ObjectContainer',
        module: '@app/objects',
      });

      const objects: MockObject3D[] = [];
      for (let i = 0; i < 1000; i++) {
        const obj = new MockObject3D(`Object-${i}`);
        objects.push(obj);
        manager.addObjectToEntity(entityId, obj as unknown as THREE.Object3D);
      }

      let idx = 0;
      const result = benchmark('Entity: remove object', () => {
        if (idx < 1000) {
          manager.removeObjectFromEntity(entityId, objects[idx] as unknown as THREE.Object3D);
        }
        idx++;
      });

      results.push(result);

      assertPerformance(result, 50000);
    });
  });

  describe('Entity Queries', () => {
    let queryManager: LogicalEntityManager;

    // Setup large dataset
    beforeAll(() => {
      queryManager = new LogicalEntityManager();

      // Create diverse entity set
      for (let i = 0; i < 1000; i++) {
        const tags = [];
        if (i % 2 === 0) tags.push('even');
        if (i % 3 === 0) tags.push('divisible-by-3');
        if (i % 5 === 0) tags.push('divisible-by-5');
        tags.push(`batch-${Math.floor(i / 100)}`);

        queryManager.registerLogicalEntity({
          name: `Entity-${i}`,
          module: `@app/module-${i % 20}`,
          componentType: `Component${i % 10}`,
          tags,
          metadata: { index: i },
        });
      }
    });

    it('filter by module', () => {
      const result = benchmark('Entity: filter by module', () => {
        queryManager.filterEntities({ module: '@app/module-5' });
      });

      results.push(result);

      assertPerformance(result, 10000);
    });

    it('filter by module prefix', () => {
      const result = benchmark('Entity: filter by module prefix', () => {
        queryManager.filterEntities({ modulePrefix: '@app/' });
      });

      results.push(result);

      // This scans all entities
      assertPerformance(result, 5000);
    });

    it('filter by tags (all must match)', () => {
      const result = benchmark('Entity: filter by tags (AND)', () => {
        queryManager.filterEntities({ tags: ['even', 'divisible-by-3'] });
      });

      results.push(result);

      assertPerformance(result, 5000);
    });

    it('filter by any tag (OR)', () => {
      const result = benchmark('Entity: filter by any tag (OR)', () => {
        queryManager.filterEntities({ anyTag: ['divisible-by-3', 'divisible-by-5'] });
      });

      results.push(result);

      assertPerformance(result, 5000);
    });

    it('filter by component type', () => {
      const result = benchmark('Entity: filter by component type', () => {
        queryManager.filterEntities({ componentType: 'Component5' });
      });

      results.push(result);

      assertPerformance(result, 5000);
    });

    it('filter by name substring', () => {
      const result = benchmark('Entity: filter by name contains', () => {
        queryManager.filterEntities({ nameContains: '99' });
      });

      results.push(result);

      assertPerformance(result, 5000);
    });

    it('complex multi-field filter', () => {
      const result = benchmark('Entity: complex filter', () => {
        queryManager.filterEntities({
          modulePrefix: '@app/',
          anyTag: ['even'],
          componentType: 'Component0',
        });
      });

      results.push(result);

      assertPerformance(result, 3000);
    });
  });

  describe('Navigation', () => {
    let navManager: LogicalEntityManager;
    let testObjects: MockObject3D[];
    let entityIds: string[];

    beforeAll(() => {
      navManager = new LogicalEntityManager();
      testObjects = [];
      entityIds = [];

      // Create entities with objects
      for (let i = 0; i < 100; i++) {
        const entityId = navManager.registerLogicalEntity({
          name: `NavEntity-${i}`,
          module: '@app/nav',
          componentId: `nav-comp-${i}`,
        });
        entityIds.push(entityId);

        // Add multiple objects to each entity
        for (let j = 0; j < 5; j++) {
          const obj = new MockObject3D(`NavObj-${i}-${j}`);
          testObjects.push(obj);
          navManager.addObjectToEntity(entityId, obj as unknown as THREE.Object3D);
        }
      }
    });

    it('navigate from object', () => {
      let idx = 0;
      const result = benchmarkBatched(
        'Entity: navigate from object',
        () => {
          navManager.navigateFromObject(testObjects[idx % testObjects.length] as unknown as THREE.Object3D);
          idx++;
        },
        500
      );

      results.push(result);

      // Navigation should be reasonably fast (100K+ ops/sec)
      assertPerformance(result, 100000);
    });

    it('navigate from component', () => {
      let idx = 0;
      const result = benchmarkBatched(
        'Entity: navigate from component',
        () => {
          navManager.navigateFromComponent(`nav-comp-${idx % 100}`);
          idx++;
        },
        500
      );

      results.push(result);

      assertPerformance(result, 150000);
    });

    it('navigate from entity', () => {
      let idx = 0;
      const result = benchmarkBatched(
        'Entity: navigate from entity',
        () => {
          navManager.navigateFromEntity(entityIds[idx % entityIds.length]);
          idx++;
        },
        500
      );

      results.push(result);

      assertPerformance(result, 150000);
    });
  });

  describe('Module Info', () => {
    let moduleManager: LogicalEntityManager;

    beforeAll(() => {
      moduleManager = new LogicalEntityManager();

      // Create entities across modules with objects
      for (let i = 0; i < 500; i++) {
        const entityId = moduleManager.registerLogicalEntity({
          name: `ModEntity-${i}`,
          module: `@app/mod-${i % 10}`,
        });

        // Add objects
        for (let j = 0; j < 3; j++) {
          const obj = new MockObject3D(`Obj-${i}-${j}`);
          moduleManager.addObjectToEntity(entityId, obj as unknown as THREE.Object3D);
        }
      }
    });

    it('get module info', () => {
      let idx = 0;
      const result = benchmark('Entity: get module info', () => {
        moduleManager.getModuleInfo(`@app/mod-${idx % 10}`);
        idx++;
      });

      results.push(result);

      assertPerformance(result, 5000);
    });

    it('get all modules', () => {
      const result = benchmark('Entity: get all modules', () => {
        moduleManager.getAllModules();
      });

      results.push(result);

      assertPerformance(result, 50000);
    });
  });

  describe('Unregistration', () => {
    it('unregister single entity', () => {
      const manager = new LogicalEntityManager();

      // Pre-register entities
      const entityIds: string[] = [];
      for (let i = 0; i < 1000; i++) {
        entityIds.push(
          manager.registerLogicalEntity({
            name: `Entity-${i}`,
            module: '@app/test',
          })
        );
      }

      let idx = 0;
      const result = benchmark('Entity: unregister', () => {
        if (idx < 1000) {
          manager.unregisterLogicalEntity(entityIds[idx++]);
        }
      });

      results.push(result);

      assertPerformance(result, 50000);
    });

    it('unregister with recursive children', () => {
      const manager = new LogicalEntityManager();

      // Create hierarchies
      const rootIds: string[] = [];
      for (let i = 0; i < 100; i++) {
        const rootId = manager.registerLogicalEntity({
          name: `Root-${i}`,
          module: '@app/roots',
        });
        rootIds.push(rootId);

        // Add children
        for (let j = 0; j < 5; j++) {
          const childId = manager.registerLogicalEntity({
            name: `Child-${i}-${j}`,
            module: '@app/children',
            parentEntityId: rootId,
          });

          // Add grandchildren
          for (let k = 0; k < 3; k++) {
            manager.registerLogicalEntity({
              name: `GrandChild-${i}-${j}-${k}`,
              module: '@app/grandchildren',
              parentEntityId: childId,
            });
          }
        }
      }

      let idx = 0;
      const result = benchmark('Entity: unregister recursive', () => {
        if (idx < 100) {
          manager.unregisterLogicalEntity(rootIds[idx++], true);
        }
      });

      results.push(result);

      // Recursive unregistration is more expensive
      assertPerformance(result, 5000);
    });
  });

  // Print results at the end
  it('print benchmark results', () => {
    console.log('\n' + formatBenchmarkResults(results) + '\n');
  });
});

// Type declaration for mock
declare global {
  namespace THREE {
    interface Object3D {
      uuid: string;
      name: string;
      userData: Record<string, unknown>;
      visible: boolean;
      children: Object3D[];
      traverse(callback: (obj: Object3D) => void): void;
    }
  }
}
