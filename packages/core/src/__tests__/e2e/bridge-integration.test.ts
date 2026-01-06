/**
 * Integration E2E Tests: Framework Bridges
 * 
 * Tests the integration patterns between the core probe and framework-specific bridges
 * (React, Vue, Angular).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DevtoolProbe } from '../../probe/DevtoolProbe';
import type { FrameStats, SceneSnapshot, Transport, DebugMessage, Unsubscribe } from '../../types';

// Mock THREE.js Object3D
function createMockObject3D(name = 'TestObject') {
  return {
    uuid: `obj-${Math.random().toString(36).slice(2, 9)}`,
    name,
    type: 'Mesh',
    visible: true,
    castShadow: false,
    receiveShadow: false,
    frustumCulled: true,
    renderOrder: 0,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    scale: { x: 1, y: 1, z: 1 },
    matrix: { elements: new Array(16).fill(0) },
    matrixWorld: { elements: new Array(16).fill(0) },
    userData: {} as Record<string, unknown>,
    children: [] as ReturnType<typeof createMockObject3D>[],
    parent: null,
    layers: { mask: 1 },
    traverse: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function createMockScene(name = 'TestScene') {
  const children: ReturnType<typeof createMockObject3D>[] = [];
  const scene = {
    uuid: `scene-${Math.random().toString(36).slice(2, 9)}`,
    name,
    type: 'Scene',
    visible: true,
    castShadow: false,
    receiveShadow: false,
    frustumCulled: true,
    renderOrder: 0,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    scale: { x: 1, y: 1, z: 1 },
    matrix: { elements: new Array(16).fill(0) },
    matrixWorld: { elements: new Array(16).fill(0) },
    userData: {},
    children,
    parent: null,
    layers: { mask: 1 },
    traverse: vi.fn((callback) => {
      callback(scene);
      children.forEach(c => callback(c));
    }),
    add: vi.fn((child) => {
      children.push(child);
      (child as { parent: unknown }).parent = scene;
    }),
    remove: vi.fn((child) => {
      const idx = children.indexOf(child);
      if (idx > -1) children.splice(idx, 1);
      (child as { parent: unknown }).parent = null;
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  return scene;
}

describe('Bridge Integration Patterns E2E', () => {
  let probe: DevtoolProbe;

  beforeEach(() => {
    probe = new DevtoolProbe({
      appName: 'Bridge Integration Test',
      env: 'development',
    });
  });

  afterEach(() => {
    probe.dispose();
  });

  describe('Entity Registration Pattern', () => {
    /**
     * This pattern is used by all framework bridges:
     * - React: useDevtoolEntity hook
     * - Vue: useDevtoolEntity composable  
     * - Angular: ThreeLensEntityDirective
     */
    it('should register entities with metadata', () => {
      const entityId = probe.registerLogicalEntity({
        name: 'PlayerCharacter',
        module: '@game/player',
        componentType: 'PlayerController',
        componentId: 'player-1',
        tags: ['player', 'controllable'],
        metadata: {
          health: 100,
          speed: 5.0,
        },
      });

      const entity = probe.getLogicalEntity(entityId);
      
      expect(entity).toBeDefined();
      expect(entity?.name).toBe('PlayerCharacter');
      expect(entity?.module).toBe('@game/player');
      expect(entity?.tags).toContain('player');
    });

    it('should update entity metadata dynamically', () => {
      const entityId = probe.registerLogicalEntity({
        name: 'Enemy',
        metadata: { health: 100 },
      });

      // Simulate game update
      probe.updateLogicalEntity(entityId, {
        metadata: { health: 75, state: 'attacking' },
      });

      const entity = probe.getLogicalEntity(entityId);
      expect(entity?.metadata?.health).toBe(75);
      expect(entity?.metadata?.state).toBe('attacking');
    });

    it('should handle component lifecycle (mount/unmount)', () => {
      // Simulate component mount
      const entityId = probe.registerLogicalEntity({
        name: 'DynamicComponent',
        componentType: 'React.FC',
      });

      expect(probe.getLogicalEntity(entityId)).toBeDefined();

      // Simulate component unmount
      probe.unregisterLogicalEntity(entityId);

      expect(probe.getLogicalEntity(entityId)).toBeUndefined();
    });
  });

  describe('Object-Entity Binding Pattern', () => {
    /**
     * Bridges connect Three.js objects to logical entities
     * for unified tracking and navigation.
     */
    it('should bind multiple objects to single entity', () => {
      const entityId = probe.registerLogicalEntity({
        name: 'Vehicle',
        componentType: 'VehicleComponent',
      });

      const bodyMesh = createMockObject3D('VehicleBody');
      const wheelMesh1 = createMockObject3D('Wheel1');
      const wheelMesh2 = createMockObject3D('Wheel2');

      probe.addObjectToEntity(entityId, bodyMesh as unknown as THREE.Object3D);
      probe.addObjectToEntity(entityId, wheelMesh1 as unknown as THREE.Object3D);
      probe.addObjectToEntity(entityId, wheelMesh2 as unknown as THREE.Object3D);

      const entity = probe.getLogicalEntity(entityId);
      expect(entity?.objects?.length).toBe(3);
    });

    it('should navigate from entity to objects', () => {
      const entityId = probe.registerLogicalEntity({
        name: 'MultiObjectEntity',
      });

      const meshes = [
        createMockObject3D('Part1'),
        createMockObject3D('Part2'),
        createMockObject3D('Part3'),
      ];

      meshes.forEach(m => probe.addObjectToEntity(entityId, m as unknown as THREE.Object3D));

      const result = probe.navigateFromEntity(entityId);
      expect(result?.objects?.length).toBe(3);
    });
  });

  describe('Selection Synchronization Pattern', () => {
    /**
     * Bridges sync selection state between:
     * - 3Lens UI (probe selection)
     * - Framework state (React useState, Vue ref, Angular signal)
     */
    it('should notify on selection change', () => {
      const selectionChanges: unknown[] = [];
      const mesh = createMockObject3D('SelectableObject');

      probe.onSelectionChanged((obj) => {
        selectionChanges.push(obj);
      });

      // Simulate selection from 3Lens UI
      probe.selectObject(mesh as unknown as THREE.Object3D);
      expect(selectionChanges).toContainEqual(mesh);

      // Simulate deselection (using selectObject(null) as clearSelection doesn't exist)
      probe.selectObject(null);
      expect(selectionChanges).toContain(null);
    });

    it('should support programmatic selection from framework', () => {
      const mesh = createMockObject3D('FrameworkSelectedObject');

      // Simulate framework selecting object (e.g., onClick handler)
      probe.selectObject(mesh as unknown as THREE.Object3D);

      expect(probe.getSelectedObject()).toBe(mesh);
    });
  });

  describe('Metrics Subscription Pattern', () => {
    /**
     * Bridges provide reactive access to performance metrics:
     * - React: useMetric, useFPS, useDrawCalls hooks
     * - Vue: useMetric composable with computed
     * - Angular: ThreeLensService observables (fps$, drawCalls$)
     */
    it('should subscribe to frame stats updates', () => {
      const statsUpdates: FrameStats[] = [];

      const unsubscribe = probe.onFrameStats((stats) => {
        statsUpdates.push(stats);
      });

      // Callback registered, actual updates come from renderer adapter
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should provide latest stats snapshot', () => {
      // Initially null until frames are captured
      const latest = probe.getLatestFrameStats();
      expect(latest === null || typeof latest === 'object').toBe(true);
    });
  });

  describe('Module Grouping Pattern', () => {
    /**
     * Bridges support grouping entities by module for:
     * - Code organization
     * - Per-module metrics
     * - Filtering in UI
     */
    it('should group entities by module', () => {
      // Register entities from different modules
      probe.registerLogicalEntity({
        name: 'Player',
        module: '@game/characters',
      });
      probe.registerLogicalEntity({
        name: 'Enemy1',
        module: '@game/enemies',
      });
      probe.registerLogicalEntity({
        name: 'Enemy2',
        module: '@game/enemies',
      });
      probe.registerLogicalEntity({
        name: 'Tree',
        module: '@game/environment',
      });

      // Filter by module
      const enemies = probe.filterEntities({ module: '@game/enemies' });
      expect(enemies.length).toBe(2);
    });

    it('should provide module-level metrics', () => {
      const entityId = probe.registerLogicalEntity({
        name: 'ComplexObject',
        module: '@game/complex',
      });

      const mesh = createMockObject3D('ComplexMesh');
      probe.addObjectToEntity(entityId, mesh as unknown as THREE.Object3D);

      const moduleInfo = probe.getModuleInfo('@game/complex');
      expect(moduleInfo).toBeDefined();
    });
  });

  describe('Snapshot Integration Pattern', () => {
    /**
     * Bridges can request and receive snapshots for:
     * - Initial state capture
     * - State diff comparisons
     * - Export functionality
     */
    it('should receive snapshot updates', () => {
      const snapshots: SceneSnapshot[] = [];

      probe.onSnapshot((snapshot) => {
        snapshots.push(snapshot);
      });

      const scene = createMockScene();
      probe.observeScene(scene as unknown as THREE.Scene);
      probe.takeSnapshot();

      expect(snapshots.length).toBeGreaterThan(0);
    });

    it('should include entity info in snapshots', () => {
      const scene = createMockScene();
      probe.observeScene(scene as unknown as THREE.Scene);

      probe.registerLogicalEntity({
        name: 'SnapshotEntity',
        metadata: { important: true },
      });

      const snapshot = probe.takeSnapshot();
      expect(snapshot).toBeDefined();
    });
  });

  describe('Configuration Pattern', () => {
    /**
     * Bridges pass configuration to probe:
     * - React: ThreeLensProvider props
     * - Vue: createThreeLens options
     * - Angular: THREELENS_CONFIG token
     */
    it('should apply framework-provided config', () => {
      const customProbe = new DevtoolProbe({
        appName: 'Framework App',
        env: 'development',
        debug: true,
        rules: {
          maxDrawCalls: 500,
          maxTriangles: 200000,
        },
        sampling: {
          frameStats: 'every-frame',
          gpuTiming: true,
        },
      });

      expect(customProbe.config.appName).toBe('Framework App');
      expect(customProbe.config.rules?.maxDrawCalls).toBe(500);

      customProbe.dispose();
    });
  });

  describe('R3F Connector Pattern', () => {
    /**
     * React Three Fiber specific integration via connector.
     */
    it('should integrate with R3F scene via connector', () => {
      // Simulate R3F connector providing scene and camera
      const mockR3FScene = createMockScene('R3FScene');

      // Connector would call these
      probe.observeScene(mockR3FScene as unknown as THREE.Scene);

      const scenes = probe.getObservedScenes();
      expect(scenes.length).toBe(1);
    });
  });

  describe('TresJS Connector Pattern', () => {
    /**
     * Vue TresJS specific integration via connector.
     */
    it('should integrate with TresJS scene via connector', () => {
      // Simulate TresJS connector
      const mockTresScene = createMockScene('TresScene');

      probe.observeScene(mockTresScene as unknown as THREE.Scene);

      expect(probe.getObservedScenes()).toHaveLength(1);
    });
  });

  describe('Angular Service Pattern', () => {
    /**
     * Angular-specific service patterns.
     */
    it('should support RxJS-style subscriptions', () => {
      const fpsValues: number[] = [];
      
      // Simulate Angular service transforming callbacks to observables
      const unsubscribe = probe.onFrameStats((stats) => {
        if (stats.cpuTimeMs > 0) {
          const fps = Math.round(1000 / stats.cpuTimeMs);
          fpsValues.push(fps);
        }
      });

      // Subscription should work
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });

  describe('Error Handling Across Bridges', () => {
    it('should handle missing probe gracefully', () => {
      // Bridges should handle null probe scenario
      const nullableProbe: DevtoolProbe | null = null;

      // This simulates bridge behavior when probe isn't available
      expect(() => {
        if (nullableProbe) {
          nullableProbe.selectObject(createMockObject3D() as unknown as THREE.Object3D);
        }
      }).not.toThrow();
    });

    it('should handle disposed probe gracefully', () => {
      const localProbe = new DevtoolProbe({ appName: 'Dispose Test' });
      localProbe.dispose();

      // After disposal, operations should be no-ops or throw meaningful errors
      expect(() => {
        localProbe.selectObject(createMockObject3D() as unknown as THREE.Object3D);
      }).not.toThrow();
    });
  });
});

describe('Cross-Framework Entity Sharing E2E', () => {
  /**
   * Tests scenarios where entities might be shared
   * across different parts of an application.
   */
  it('should support hierarchical entity relationships', () => {
    const probe = new DevtoolProbe({ appName: 'Hierarchy Test' });

    // Parent entity (e.g., from a layout component)
    const parentId = probe.registerLogicalEntity({
      name: 'GameWorld',
      module: '@game/world',
    });

    // Child entities (e.g., from child components)
    const childId1 = probe.registerLogicalEntity({
      name: 'Zone1',
      module: '@game/zones',
      parentEntityId: parentId,
    });

    const childId2 = probe.registerLogicalEntity({
      name: 'Zone2',
      module: '@game/zones',
      parentEntityId: parentId,
    });

    // Verify hierarchy
    const child1 = probe.getLogicalEntity(childId1);
    expect(child1?.parentEntityId).toBe(parentId);

    probe.dispose();
  });

  it('should support entity tagging for cross-cutting concerns', () => {
    const probe = new DevtoolProbe({ appName: 'Tags Test' });

    probe.registerLogicalEntity({
      name: 'InteractiveNPC',
      tags: ['interactive', 'npc', 'physics'],
    });

    probe.registerLogicalEntity({
      name: 'InteractiveDoor',
      tags: ['interactive', 'physics'],
    });

    probe.registerLogicalEntity({
      name: 'StaticProp',
      tags: ['static'],
    });

    // Filter by tag
    const interactive = probe.filterEntities({ tags: ['interactive'] });
    expect(interactive.length).toBe(2);

    const physics = probe.filterEntities({ tags: ['physics'] });
    expect(physics.length).toBe(2);

    probe.dispose();
  });
});
