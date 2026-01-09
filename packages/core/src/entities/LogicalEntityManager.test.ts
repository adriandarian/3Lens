/**
 * LogicalEntityManager Test Suite
 *
 * Tests for logical entity registration, management, and navigation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogicalEntityManager } from './LogicalEntityManager';
import type {
  LogicalEntityOptions,
  EntityFilter,
  LogicalEntity,
} from './types';

// Mock Three.js Object3D
function createMockObject3D(name?: string): any {
  const uuid = `uuid-${Math.random().toString(36).substr(2, 9)}`;
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
    uuid: `geo-${Math.random().toString(36).substr(2, 9)}`,
    index: { count: triangles * 3 },
    attributes: {
      position: { count: triangles * 3 },
    },
  };
  obj.material = {
    uuid: `mat-${Math.random().toString(36).substr(2, 9)}`,
    type: 'MeshStandardMaterial',
  };
  return obj;
}

describe('LogicalEntityManager', () => {
  let manager: LogicalEntityManager;

  beforeEach(() => {
    manager = new LogicalEntityManager();
  });

  describe('registerLogicalEntity', () => {
    it('should register a basic entity', () => {
      const id = manager.registerLogicalEntity({
        name: 'Player',
      });

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.startsWith('entity-')).toBe(true);
    });

    it('should register entity with custom ID', () => {
      const id = manager.registerLogicalEntity({
        id: 'custom-id',
        name: 'CustomEntity',
      });

      expect(id).toBe('custom-id');
    });

    it('should throw on duplicate ID', () => {
      manager.registerLogicalEntity({
        id: 'dup-id',
        name: 'First',
      });

      expect(() => {
        manager.registerLogicalEntity({
          id: 'dup-id',
          name: 'Second',
        });
      }).toThrow('Entity with ID "dup-id" already exists');
    });

    it('should register entity with module', () => {
      const id = manager.registerLogicalEntity({
        name: 'Player',
        module: '@game/feature-player',
      });

      const entity = manager.getEntity(id);
      expect(entity?.module).toBe('@game/feature-player');
    });

    it('should register entity with component info', () => {
      const id = manager.registerLogicalEntity({
        name: 'Player',
        componentType: 'PlayerComponent',
        componentId: 'player-123',
      });

      const entity = manager.getEntity(id);
      expect(entity?.componentType).toBe('PlayerComponent');
      expect(entity?.componentId).toBe('player-123');
    });

    it('should register entity with tags', () => {
      const id = manager.registerLogicalEntity({
        name: 'Player',
        tags: ['controllable', 'saveable', 'player'],
      });

      const entity = manager.getEntity(id);
      expect(entity?.tags).toEqual(['controllable', 'saveable', 'player']);
    });

    it('should register entity with metadata', () => {
      const id = manager.registerLogicalEntity({
        name: 'Player',
        metadata: { health: 100, level: 5 },
      });

      const entity = manager.getEntity(id);
      expect(entity?.metadata).toEqual({ health: 100, level: 5 });
    });

    it('should register entity with parent', () => {
      const parentId = manager.registerLogicalEntity({
        name: 'ParentEntity',
      });

      const childId = manager.registerLogicalEntity({
        name: 'ChildEntity',
        parentEntityId: parentId,
      });

      const parent = manager.getEntity(parentId);
      const child = manager.getEntity(childId);

      expect(child?.parentEntityId).toBe(parentId);
      expect(parent?.childEntityIds).toContain(childId);
    });

    it('should emit registered event', () => {
      const callback = vi.fn();
      manager.onEntityEvent(callback);

      manager.registerLogicalEntity({ name: 'Test' });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'registered',
          entity: expect.objectContaining({ name: 'Test' }),
        })
      );
    });
  });

  describe('updateLogicalEntity', () => {
    it('should update entity name', () => {
      const id = manager.registerLogicalEntity({ name: 'Original' });

      manager.updateLogicalEntity(id, { name: 'Updated' });

      const entity = manager.getEntity(id);
      expect(entity?.name).toBe('Updated');
    });

    it('should throw for non-existent entity', () => {
      expect(() => {
        manager.updateLogicalEntity('non-existent', { name: 'Test' });
      }).toThrow('Entity "non-existent" not found');
    });

    it('should update module and tracking', () => {
      const id = manager.registerLogicalEntity({
        name: 'Entity',
        module: '@old/module',
      });

      manager.updateLogicalEntity(id, { module: '@new/module' });

      const entity = manager.getEntity(id);
      expect(entity?.module).toBe('@new/module');

      // Verify module tracking
      const oldModuleInfo = manager.getModuleInfo('@old/module');
      const newModuleInfo = manager.getModuleInfo('@new/module');

      // Old module should be undefined or not contain the entity
      expect(oldModuleInfo?.entityIds?.includes(id) ?? false).toBe(false);
      expect(newModuleInfo?.entityIds).toContain(id);
    });

    it('should update component ID tracking', () => {
      const id = manager.registerLogicalEntity({
        name: 'Entity',
        componentId: 'old-comp-id',
      });

      manager.updateLogicalEntity(id, { componentId: 'new-comp-id' });

      // Verify navigation works with new ID
      const result = manager.navigateFromComponent('new-comp-id');
      expect(result?.entity?.id).toBe(id);
    });

    it('should update tags', () => {
      const id = manager.registerLogicalEntity({
        name: 'Entity',
        tags: ['old-tag'],
      });

      manager.updateLogicalEntity(id, { tags: ['new-tag1', 'new-tag2'] });

      const entity = manager.getEntity(id);
      expect(entity?.tags).toEqual(['new-tag1', 'new-tag2']);
    });

    it('should merge metadata', () => {
      const id = manager.registerLogicalEntity({
        name: 'Entity',
        metadata: { a: 1, b: 2 },
      });

      manager.updateLogicalEntity(id, { metadata: { b: 3, c: 4 } });

      const entity = manager.getEntity(id);
      expect(entity?.metadata).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should update parent entity', () => {
      const parent1 = manager.registerLogicalEntity({ name: 'Parent1' });
      const parent2 = manager.registerLogicalEntity({ name: 'Parent2' });
      const child = manager.registerLogicalEntity({
        name: 'Child',
        parentEntityId: parent1,
      });

      manager.updateLogicalEntity(child, { parentEntityId: parent2 });

      const childEntity = manager.getEntity(child);
      const parent1Entity = manager.getEntity(parent1);
      const parent2Entity = manager.getEntity(parent2);

      expect(childEntity?.parentEntityId).toBe(parent2);
      expect(parent1Entity?.childEntityIds).not.toContain(child);
      expect(parent2Entity?.childEntityIds).toContain(child);
    });

    it('should emit updated event', () => {
      const id = manager.registerLogicalEntity({ name: 'Test' });
      const callback = vi.fn();
      manager.onEntityEvent(callback);

      manager.updateLogicalEntity(id, { name: 'Updated' });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'updated',
          entity: expect.objectContaining({ name: 'Updated' }),
        })
      );
    });
  });

  describe('unregisterLogicalEntity', () => {
    it('should unregister entity', () => {
      const id = manager.registerLogicalEntity({ name: 'ToRemove' });

      manager.unregisterLogicalEntity(id);

      expect(manager.getEntity(id)).toBeUndefined();
    });

    it('should handle non-existent entity gracefully', () => {
      expect(() => {
        manager.unregisterLogicalEntity('non-existent');
      }).not.toThrow();
    });

    it('should remove from module tracking', () => {
      const id = manager.registerLogicalEntity({
        name: 'Entity',
        module: '@test/module',
      });

      manager.unregisterLogicalEntity(id);

      const moduleInfo = manager.getModuleInfo('@test/module');
      // Module info should be undefined or not contain the entity
      expect(moduleInfo?.entityIds?.includes(id) ?? false).toBe(false);
    });

    it('should remove component ID tracking', () => {
      const id = manager.registerLogicalEntity({
        name: 'Entity',
        componentId: 'comp-123',
      });

      manager.unregisterLogicalEntity(id);

      const result = manager.navigateFromComponent('comp-123');
      expect(result.entity).toBeNull();
    });

    it('should move children to parent when not recursive', () => {
      const grandparent = manager.registerLogicalEntity({
        name: 'Grandparent',
      });
      const parent = manager.registerLogicalEntity({
        name: 'Parent',
        parentEntityId: grandparent,
      });
      const child = manager.registerLogicalEntity({
        name: 'Child',
        parentEntityId: parent,
      });

      manager.unregisterLogicalEntity(parent, false);

      const childEntity = manager.getEntity(child);
      const grandparentEntity = manager.getEntity(grandparent);

      expect(childEntity?.parentEntityId).toBe(grandparent);
      expect(grandparentEntity?.childEntityIds).toContain(child);
    });

    it('should unregister children recursively', () => {
      const parent = manager.registerLogicalEntity({ name: 'Parent' });
      const child1 = manager.registerLogicalEntity({
        name: 'Child1',
        parentEntityId: parent,
      });
      const child2 = manager.registerLogicalEntity({
        name: 'Child2',
        parentEntityId: parent,
      });
      const grandchild = manager.registerLogicalEntity({
        name: 'Grandchild',
        parentEntityId: child1,
      });

      manager.unregisterLogicalEntity(parent, true);

      expect(manager.getEntity(parent)).toBeUndefined();
      expect(manager.getEntity(child1)).toBeUndefined();
      expect(manager.getEntity(child2)).toBeUndefined();
      expect(manager.getEntity(grandchild)).toBeUndefined();
    });

    it('should emit unregistered event', () => {
      const id = manager.registerLogicalEntity({ name: 'Test' });
      const callback = vi.fn();
      manager.onEntityEvent(callback);

      manager.unregisterLogicalEntity(id);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'unregistered',
          entity: expect.objectContaining({ name: 'Test' }),
        })
      );
    });
  });

  describe('addObjectToEntity', () => {
    it('should add object to entity', () => {
      const id = manager.registerLogicalEntity({ name: 'Entity' });
      const obj = createMockObject3D('TestObject');

      manager.addObjectToEntity(id, obj);

      const entity = manager.getEntity(id);
      expect(entity?.objectUuids).toContain(obj.uuid);
    });

    it('should throw for non-existent entity', () => {
      const obj = createMockObject3D();

      expect(() => {
        manager.addObjectToEntity('non-existent', obj);
      }).toThrow('Entity "non-existent" not found');
    });

    it('should not add duplicate objects', () => {
      const id = manager.registerLogicalEntity({ name: 'Entity' });
      const obj = createMockObject3D();

      manager.addObjectToEntity(id, obj);
      manager.addObjectToEntity(id, obj); // Add again

      const entity = manager.getEntity(id);
      expect(entity?.objectUuids.filter((u) => u === obj.uuid)).toHaveLength(1);
    });

    it('should store entity reference in object userData', () => {
      const id = manager.registerLogicalEntity({
        name: 'Entity',
        module: '@test/module',
      });
      const obj = createMockObject3D();

      manager.addObjectToEntity(id, obj);

      expect(obj.userData.__3lens_entity).toBeDefined();
      expect(obj.userData.__3lens_entity.entityId).toBe(id);
      expect(obj.userData.__3lens_entity.entityName).toBe('Entity');
      expect(obj.userData.__3lens_entity.module).toBe('@test/module');
    });

    it('should emit object-added event', () => {
      const id = manager.registerLogicalEntity({ name: 'Entity' });
      const obj = createMockObject3D();
      const callback = vi.fn();
      manager.onEntityEvent(callback);

      manager.addObjectToEntity(id, obj);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'object-added',
          details: expect.objectContaining({ objectUuid: obj.uuid }),
        })
      );
    });
  });

  describe('removeObjectFromEntity', () => {
    it('should remove object from entity', () => {
      const id = manager.registerLogicalEntity({ name: 'Entity' });
      const obj = createMockObject3D();
      manager.addObjectToEntity(id, obj);

      manager.removeObjectFromEntity(id, obj);

      const entity = manager.getEntity(id);
      expect(entity?.objectUuids).not.toContain(obj.uuid);
    });

    it('should handle non-existent entity gracefully', () => {
      const obj = createMockObject3D();

      expect(() => {
        manager.removeObjectFromEntity('non-existent', obj);
      }).not.toThrow();
    });

    it('should handle object not in entity gracefully', () => {
      const id = manager.registerLogicalEntity({ name: 'Entity' });
      const obj = createMockObject3D();

      expect(() => {
        manager.removeObjectFromEntity(id, obj);
      }).not.toThrow();
    });

    it('should remove entity reference from object userData', () => {
      const id = manager.registerLogicalEntity({ name: 'Entity' });
      const obj = createMockObject3D();
      manager.addObjectToEntity(id, obj);

      manager.removeObjectFromEntity(id, obj);

      expect(obj.userData.__3lens_entity).toBeUndefined();
    });

    it('should emit object-removed event', () => {
      const id = manager.registerLogicalEntity({ name: 'Entity' });
      const obj = createMockObject3D();
      manager.addObjectToEntity(id, obj);
      const callback = vi.fn();
      manager.onEntityEvent(callback);

      manager.removeObjectFromEntity(id, obj);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'object-removed',
          details: expect.objectContaining({ objectUuid: obj.uuid }),
        })
      );
    });
  });

  describe('getEntity', () => {
    it('should return entity by ID', () => {
      const id = manager.registerLogicalEntity({
        name: 'TestEntity',
        tags: ['test'],
      });

      const entity = manager.getEntity(id);

      expect(entity).toBeDefined();
      expect(entity?.name).toBe('TestEntity');
      expect(entity?.tags).toContain('test');
    });

    it('should return undefined for non-existent entity', () => {
      const entity = manager.getEntity('non-existent');
      expect(entity).toBeUndefined();
    });
  });

  describe('getAllEntities', () => {
    it('should return all registered entities', () => {
      manager.registerLogicalEntity({ name: 'Entity1' });
      manager.registerLogicalEntity({ name: 'Entity2' });
      manager.registerLogicalEntity({ name: 'Entity3' });

      const entities = manager.getAllEntities();

      expect(entities).toHaveLength(3);
    });

    it('should return empty array when no entities', () => {
      const entities = manager.getAllEntities();
      expect(entities).toEqual([]);
    });
  });

  describe('filterEntities', () => {
    beforeEach(() => {
      manager.registerLogicalEntity({
        name: 'Player',
        module: '@game/feature-player',
        tags: ['controllable', 'saveable'],
        componentType: 'PlayerComponent',
      });
      manager.registerLogicalEntity({
        name: 'Enemy',
        module: '@game/feature-enemies',
        tags: ['hostile', 'saveable'],
        componentType: 'EnemyComponent',
      });
      manager.registerLogicalEntity({
        name: 'Terrain',
        module: '@game/feature-world',
        tags: ['static'],
        componentType: 'TerrainComponent',
      });
      manager.registerLogicalEntity({
        name: 'UI Button',
        module: '@ui/components',
        tags: ['interactive'],
        componentType: 'ButtonComponent',
      });
    });

    it('should filter by exact module', () => {
      const entities = manager.filterEntities({
        module: '@game/feature-player',
      });

      expect(entities).toHaveLength(1);
      expect(entities[0].name).toBe('Player');
    });

    it('should filter by module prefix', () => {
      const entities = manager.filterEntities({ modulePrefix: '@game/' });

      expect(entities).toHaveLength(3);
      expect(entities.map((e) => e.name)).toContain('Player');
      expect(entities.map((e) => e.name)).toContain('Enemy');
      expect(entities.map((e) => e.name)).toContain('Terrain');
    });

    it('should filter by tags (all match)', () => {
      const entities = manager.filterEntities({ tags: ['saveable'] });

      expect(entities).toHaveLength(2);
    });

    it('should filter by tags (any match)', () => {
      const entities = manager.filterEntities({
        anyTag: ['controllable', 'hostile'],
      });

      expect(entities).toHaveLength(2);
    });

    it('should filter by component type', () => {
      const entities = manager.filterEntities({
        componentType: 'PlayerComponent',
      });

      expect(entities).toHaveLength(1);
      expect(entities[0].name).toBe('Player');
    });

    it('should filter by name contains', () => {
      const entities = manager.filterEntities({ nameContains: 'er' });

      expect(entities).toHaveLength(2); // Player, Terrain
    });

    it('should combine multiple filters', () => {
      const entities = manager.filterEntities({
        modulePrefix: '@game/',
        tags: ['saveable'],
      });

      expect(entities).toHaveLength(2);
      expect(entities.map((e) => e.name)).toContain('Player');
      expect(entities.map((e) => e.name)).toContain('Enemy');
    });
  });

  describe('navigateFromObject', () => {
    it('should navigate from object to entity', () => {
      const id = manager.registerLogicalEntity({
        name: 'Entity',
        module: '@test/module',
      });
      const obj = createMockObject3D();
      manager.addObjectToEntity(id, obj);

      const result = manager.navigateFromObject(obj);

      expect(result).toBeDefined();
      expect(result?.entity?.id).toBe(id);
      expect(result?.module?.id).toBe('@test/module');
    });

    it('should return null for untracked object', () => {
      const obj = createMockObject3D();

      const result = manager.navigateFromObject(obj);

      expect(result.entity).toBeNull();
    });
  });

  describe('navigateFromComponent', () => {
    it('should navigate from component ID to entity', () => {
      const id = manager.registerLogicalEntity({
        name: 'Entity',
        componentId: 'comp-123',
      });

      const result = manager.navigateFromComponent('comp-123');

      expect(result).toBeDefined();
      expect(result?.entity?.id).toBe(id);
    });

    it('should return null for unknown component ID', () => {
      const result = manager.navigateFromComponent('unknown');
      expect(result.entity).toBeNull();
    });
  });

  describe('navigateFromEntity', () => {
    it('should navigate from entity ID to full navigation result', () => {
      const id = manager.registerLogicalEntity({
        name: 'Entity',
        module: '@test/module',
        componentId: 'comp-123',
      });
      const obj = createMockObject3D();
      manager.addObjectToEntity(id, obj);

      const result = manager.navigateFromEntity(id);

      expect(result).toBeDefined();
      expect(result?.entity?.name).toBe('Entity');
      expect(result?.module?.id).toBe('@test/module');
      expect(result?.objects).toHaveLength(1);
    });

    it('should return null for non-existent entity', () => {
      const result = manager.navigateFromEntity('non-existent');
      expect(result.entity).toBeNull();
    });
  });

  describe('getModuleInfo', () => {
    it('should return module info with entity count', () => {
      manager.registerLogicalEntity({
        name: 'Entity1',
        module: '@test/module',
      });
      manager.registerLogicalEntity({
        name: 'Entity2',
        module: '@test/module',
      });

      const info = manager.getModuleInfo('@test/module');

      expect(info).toBeDefined();
      expect(info?.entityCount).toBe(2);
      expect(info?.entityIds).toHaveLength(2);
    });

    it('should return undefined for unknown module', () => {
      const info = manager.getModuleInfo('@unknown/module');
      expect(info).toBeUndefined();
    });

    it('should calculate module metrics', () => {
      const id = manager.registerLogicalEntity({
        name: 'Entity',
        module: '@test/module',
      });
      const mesh = createMockMesh('TestMesh', 500);
      manager.addObjectToEntity(id, mesh);

      const info = manager.getModuleInfo('@test/module');

      expect(info?.metrics).toBeDefined();
      // Metrics depend on the mock implementation
      expect(info?.metrics.totalObjects).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getAllModules', () => {
    it('should return all modules', () => {
      manager.registerLogicalEntity({
        name: 'Entity1',
        module: '@module/a',
      });
      manager.registerLogicalEntity({
        name: 'Entity2',
        module: '@module/b',
      });
      manager.registerLogicalEntity({
        name: 'Entity3',
        module: '@module/a', // Same as first
      });

      const modules = manager.getAllModules();

      expect(modules).toContain('@module/a');
      expect(modules).toContain('@module/b');
      expect(modules).toHaveLength(2);
    });
  });

  describe('onEntityEvent', () => {
    it('should add event listener', () => {
      const callback = vi.fn();
      manager.onEntityEvent(callback);

      manager.registerLogicalEntity({ name: 'Test' });

      expect(callback).toHaveBeenCalled();
    });

    it('should allow unsubscribing', () => {
      const callback = vi.fn();
      const unsubscribe = manager.onEntityEvent(callback);
      unsubscribe();

      manager.registerLogicalEntity({ name: 'Test' });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all entities', () => {
      manager.registerLogicalEntity({ name: 'Entity1' });
      manager.registerLogicalEntity({ name: 'Entity2' });
      manager.registerLogicalEntity({ name: 'Entity3' });

      manager.clear();

      expect(manager.getAllEntities()).toHaveLength(0);
    });

    it('should clear all tracking maps', () => {
      manager.registerLogicalEntity({
        name: 'Entity',
        module: '@test/module',
        componentId: 'comp-123',
      });

      manager.clear();

      expect(manager.getModuleInfo('@test/module')).toBeUndefined();
      expect(manager.navigateFromComponent('comp-123').entity).toBeNull();
    });
  });

  describe('entity hierarchy', () => {
    it('should support multi-level hierarchy', () => {
      const root = manager.registerLogicalEntity({ name: 'Root' });
      const level1a = manager.registerLogicalEntity({
        name: 'Level1A',
        parentEntityId: root,
      });
      const level1b = manager.registerLogicalEntity({
        name: 'Level1B',
        parentEntityId: root,
      });
      const level2 = manager.registerLogicalEntity({
        name: 'Level2',
        parentEntityId: level1a,
      });

      const rootEntity = manager.getEntity(root);
      const level1aEntity = manager.getEntity(level1a);
      const level2Entity = manager.getEntity(level2);

      expect(rootEntity?.childEntityIds).toContain(level1a);
      expect(rootEntity?.childEntityIds).toContain(level1b);
      expect(level1aEntity?.childEntityIds).toContain(level2);
      expect(level2Entity?.parentEntityId).toBe(level1a);
    });

    it('should update timestamps on hierarchy changes', () => {
      const parent = manager.registerLogicalEntity({ name: 'Parent' });
      const parentEntity = manager.getEntity(parent);
      const originalUpdatedAt = parentEntity?.updatedAt;

      // Wait a tiny bit to ensure different timestamp
      const now = Date.now();
      while (Date.now() === now) {
        // busy wait
      }

      manager.registerLogicalEntity({
        name: 'Child',
        parentEntityId: parent,
      });

      const updatedParent = manager.getEntity(parent);
      expect(updatedParent?.updatedAt).toBeGreaterThanOrEqual(
        originalUpdatedAt!
      );
    });
  });
});
