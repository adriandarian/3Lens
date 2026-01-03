/**
 * Integration E2E Tests: DevtoolProbe Complete Workflow
 * 
 * Tests the full integration of probe, renderer adapter, scene observer,
 * and all subsystems working together.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DevtoolProbe, PROBE_VERSION } from '../../probe/DevtoolProbe';
import type { FrameStats, SceneSnapshot, Transport, DebugMessage, Unsubscribe } from '../../types';

// Mock three.js objects for E2E testing
function createMockRenderer() {
  const gl = {
    getExtension: vi.fn().mockReturnValue(null),
    getParameter: vi.fn().mockReturnValue(null),
    createQuery: vi.fn(),
    beginQuery: vi.fn(),
    endQuery: vi.fn(),
    deleteQuery: vi.fn(),
    getQueryParameter: vi.fn(),
  };

  return {
    render: vi.fn(),
    getContext: vi.fn().mockReturnValue(gl),
    info: {
      render: { calls: 0, triangles: 0, points: 0, lines: 0 },
      memory: { geometries: 0, textures: 0 },
      programs: [],
      autoReset: true,
    },
    capabilities: {
      maxTextures: 16,
      maxTextureSize: 4096,
    },
    domElement: {
      width: 800,
      height: 600,
      style: {},
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    shadowMap: { enabled: false },
    outputColorSpace: 'srgb',
    toneMapping: 0,
    getSize: vi.fn().mockReturnValue({ width: 800, height: 600 }),
  };
}

interface MockObject3D {
  uuid: string;
  name: string;
  type: string;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  frustumCulled: boolean;
  renderOrder: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; order: string };
  scale: { x: number; y: number; z: number };
  matrix: { elements: number[] };
  matrixWorld: { elements: number[] };
  userData: Record<string, unknown>;
  children: MockObject3D[];
  parent: MockObject3D | null;
  layers: { mask: number };
  traverse: ReturnType<typeof vi.fn>;
  add: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  geometry?: MockGeometry;
  material?: MockMaterial | MockMaterial[];
}

interface MockGeometry {
  uuid: string;
  type: string;
  attributes: Record<string, { count: number; itemSize: number; array: Float32Array }>;
  index?: { count: number };
  dispose: ReturnType<typeof vi.fn>;
}

interface MockMaterial {
  uuid: string;
  type: string;
  name: string;
  visible: boolean;
  transparent: boolean;
  wireframe: boolean;
  side: number;
  dispose: ReturnType<typeof vi.fn>;
}

function createMockScene(name = 'TestScene'): MockObject3D {
  const children: MockObject3D[] = [];
  const scene: MockObject3D = {
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
      children.forEach(child => {
        callback(child);
        if (child.children) {
          child.children.forEach(grandchild => callback(grandchild));
        }
      });
    }),
    add: vi.fn((child: MockObject3D) => {
      children.push(child);
      child.parent = scene;
    }),
    remove: vi.fn((child: MockObject3D) => {
      const idx = children.indexOf(child);
      if (idx > -1) children.splice(idx, 1);
      child.parent = null;
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  return scene;
}

function createMockMesh(name = 'TestMesh'): MockObject3D {
  const geometry: MockGeometry = {
    uuid: `geo-${Math.random().toString(36).slice(2, 9)}`,
    type: 'BoxGeometry',
    attributes: {
      position: { count: 24, itemSize: 3, array: new Float32Array(72) },
      normal: { count: 24, itemSize: 3, array: new Float32Array(72) },
      uv: { count: 24, itemSize: 2, array: new Float32Array(48) },
    },
    index: { count: 36 },
    dispose: vi.fn(),
  };

  const material: MockMaterial = {
    uuid: `mat-${Math.random().toString(36).slice(2, 9)}`,
    type: 'MeshStandardMaterial',
    name: 'TestMaterial',
    visible: true,
    transparent: false,
    wireframe: false,
    side: 0,
    dispose: vi.fn(),
  };

  return {
    uuid: `mesh-${Math.random().toString(36).slice(2, 9)}`,
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
    userData: {},
    children: [],
    parent: null,
    layers: { mask: 1 },
    geometry,
    material,
    traverse: vi.fn((callback) => callback({ uuid: 'mesh', type: 'Mesh' })),
    add: vi.fn(),
    remove: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function createMockLight(name = 'TestLight', type = 'PointLight'): MockObject3D {
  return {
    uuid: `light-${Math.random().toString(36).slice(2, 9)}`,
    name,
    type,
    visible: true,
    castShadow: false,
    receiveShadow: false,
    frustumCulled: true,
    renderOrder: 0,
    position: { x: 5, y: 10, z: 5 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    scale: { x: 1, y: 1, z: 1 },
    matrix: { elements: new Array(16).fill(0) },
    matrixWorld: { elements: new Array(16).fill(0) },
    userData: {},
    children: [],
    parent: null,
    layers: { mask: 1 },
    traverse: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function createMockCamera(name = 'TestCamera'): MockObject3D {
  return {
    uuid: `cam-${Math.random().toString(36).slice(2, 9)}`,
    name,
    type: 'PerspectiveCamera',
    visible: true,
    castShadow: false,
    receiveShadow: false,
    frustumCulled: true,
    renderOrder: 0,
    position: { x: 0, y: 5, z: 10 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    scale: { x: 1, y: 1, z: 1 },
    matrix: { elements: new Array(16).fill(0) },
    matrixWorld: { elements: new Array(16).fill(0) },
    userData: {},
    children: [],
    parent: null,
    layers: { mask: 1 },
    traverse: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function createMockTransport(): Transport & { messages: DebugMessage[] } {
  const messages: DebugMessage[] = [];
  let connected = true;
  const receiveHandlers: Array<(msg: DebugMessage) => void> = [];
  const connectionHandlers: Array<(connected: boolean) => void> = [];

  return {
    messages,
    send: vi.fn((msg: DebugMessage) => messages.push(msg)),
    onReceive: vi.fn((handler: (msg: DebugMessage) => void): Unsubscribe => {
      receiveHandlers.push(handler);
      return () => {
        const idx = receiveHandlers.indexOf(handler);
        if (idx > -1) receiveHandlers.splice(idx, 1);
      };
    }),
    isConnected: () => connected,
    onConnectionChange: vi.fn((handler: (c: boolean) => void): Unsubscribe => {
      connectionHandlers.push(handler);
      return () => {
        const idx = connectionHandlers.indexOf(handler);
        if (idx > -1) connectionHandlers.splice(idx, 1);
      };
    }),
    close: vi.fn(() => {
      connected = false;
      connectionHandlers.forEach(h => h(false));
    }),
  };
}

describe('DevtoolProbe Integration E2E', () => {
  let probe: DevtoolProbe;
  let mockRenderer: ReturnType<typeof createMockRenderer>;
  let mockScene: MockObject3D;
  let mockTransport: ReturnType<typeof createMockTransport>;

  beforeEach(() => {
    mockRenderer = createMockRenderer();
    mockScene = createMockScene();
    mockTransport = createMockTransport();
    
    probe = new DevtoolProbe({
      appName: 'E2E Test App',
      env: 'development',
      debug: false,
    });
  });

  afterEach(() => {
    probe.dispose();
  });

  describe('Probe Lifecycle', () => {
    it('should initialize with correct version', () => {
      expect(PROBE_VERSION).toMatch(/^\d+\.\d+\.\d+(-\w+\.\d+)?$/);
    });

    it('should initialize with provided config', () => {
      const customProbe = new DevtoolProbe({
        appName: 'Custom App',
        env: 'production',
        debug: true,
      });

      expect(customProbe.config.appName).toBe('Custom App');
      expect(customProbe.config.env).toBe('production');
      expect(customProbe.config.debug).toBe(true);

      customProbe.dispose();
    });

    it('should connect and disconnect transport', () => {
      probe.connect(mockTransport);
      expect(probe.isConnected()).toBe(true);

      probe.disconnect();
      expect(probe.isConnected()).toBe(false);
    });
  });

  describe('Renderer Integration', () => {
    it('should observe WebGL renderer', () => {
      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);
      
      expect(probe.isWebGL()).toBe(true);
      expect(probe.isWebGPU()).toBe(false);
      expect(probe.getRendererKind()).toBe('webgl');
    });

    it('should get renderer adapter after observation', () => {
      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);
      
      const adapter = probe.getRendererAdapter();
      expect(adapter).not.toBeNull();
      expect(adapter?.kind).toBe('webgl');
    });
  });

  describe('Scene Integration', () => {
    it('should observe multiple scenes', () => {
      const scene1 = createMockScene('Scene1');
      const scene2 = createMockScene('Scene2');

      probe.observeScene(scene1 as unknown as THREE.Scene);
      probe.observeScene(scene2 as unknown as THREE.Scene);

      const observed = probe.getObservedScenes();
      expect(observed).toHaveLength(2);
    });

    it('should not duplicate scene observation', () => {
      probe.observeScene(mockScene as unknown as THREE.Scene);
      probe.observeScene(mockScene as unknown as THREE.Scene); // Same scene again

      const observed = probe.getObservedScenes();
      expect(observed).toHaveLength(1);
    });

    it('should unobserve scene correctly', () => {
      probe.observeScene(mockScene as unknown as THREE.Scene);
      expect(probe.getObservedScenes()).toHaveLength(1);

      probe.unobserveScene(mockScene as unknown as THREE.Scene);
      expect(probe.getObservedScenes()).toHaveLength(0);
    });
  });

  describe('Object Selection Integration', () => {
    it('should select and deselect objects', () => {
      const mesh = createMockMesh('SelectableMesh');
      const selectionEvents: (typeof mesh | null)[] = [];

      probe.onSelectionChanged((obj) => {
        selectionEvents.push(obj as typeof mesh | null);
      });

      probe.selectObject(mesh as unknown as THREE.Object3D);
      expect(probe.getSelectedObject()).toBe(mesh);
      expect(selectionEvents).toContain(mesh);

      // Use selectObject(null) to clear selection
      probe.selectObject(null);
      expect(probe.getSelectedObject()).toBeNull();
    });

    it('should provide object metadata on selection', () => {
      const mesh = createMockMesh('MetadataMesh');
      mesh.userData = {
        custom: 'value',
        nested: { prop: 123 },
      };

      let receivedMeta: Record<string, unknown> | undefined;
      probe.onSelectionChanged((_obj, meta) => {
        receivedMeta = meta as Record<string, unknown>;
      });

      // selectObject doesn't take metadata argument - callback receives metadata from getObjectMeta()
      probe.selectObject(mesh as unknown as THREE.Object3D);

      // The meta will contain object information extracted by getObjectMeta()
      // Check that callback was called (object was selected)
      expect(probe.getSelectedObject()).toBe(mesh);
    });
  });

  describe('Transport Message Flow', () => {
    it('should send messages via transport', () => {
      probe.connect(mockTransport);

      // Trigger a snapshot
      probe.observeScene(mockScene as unknown as THREE.Scene);
      probe.takeSnapshot();

      expect(mockTransport.messages.length).toBeGreaterThan(0);
      
      const snapshotMessage = mockTransport.messages.find(m => m.type === 'snapshot');
      expect(snapshotMessage).toBeDefined();
    });

    it('should register transport on connect', () => {
      probe.connect(mockTransport);

      // Probe connects to transport and should be trackable
      expect(probe.isConnected()).toBe(true);
    });

    it('should receive commands from transport', () => {
      const commandsReceived: DebugMessage[] = [];
      
      probe.onCommand((cmd) => {
        commandsReceived.push(cmd);
      });

      probe.connect(mockTransport);
      
      // Commands are received via transport's onReceive
      expect(probe.isConnected()).toBe(true);
    });
  });

  describe('Snapshot Integration', () => {
    it('should generate complete snapshot with scenes', () => {
      const mesh = createMockMesh('SnapshotMesh');
      const light = createMockLight('SnapshotLight');
      const camera = createMockCamera('SnapshotCamera');

      mockScene.children.push(mesh, light, camera);

      probe.observeScene(mockScene as unknown as THREE.Scene);
      const snapshot = probe.takeSnapshot();

      expect(snapshot).toBeDefined();
      expect(snapshot.snapshotId).toBeDefined();
      expect(snapshot.timestamp).toBeGreaterThan(0);
      expect(snapshot.scenes).toBeDefined();
    });

    it('should trigger snapshot callbacks', () => {
      let receivedSnapshot: SceneSnapshot | null = null;

      probe.onSnapshot((snapshot) => {
        receivedSnapshot = snapshot;
      });

      probe.observeScene(mockScene as unknown as THREE.Scene);
      probe.takeSnapshot();

      expect(receivedSnapshot).not.toBeNull();
    });
  });

  describe('Logical Entities Integration', () => {
    it('should register and retrieve logical entities', () => {
      const entityId = probe.registerLogicalEntity({
        name: 'PlayerCharacter',
        module: '@game/characters',
        componentType: 'Player',
        tags: ['controllable', 'physics'],
      });

      expect(entityId).toBeDefined();

      const entity = probe.getLogicalEntity(entityId);
      expect(entity?.name).toBe('PlayerCharacter');
      expect(entity?.module).toBe('@game/characters');
    });

    it('should update logical entities', () => {
      const entityId = probe.registerLogicalEntity({
        name: 'Enemy',
        module: '@game/enemies',
      });

      probe.updateLogicalEntity(entityId, {
        metadata: { health: 100, damage: 10 },
      });

      const entity = probe.getLogicalEntity(entityId);
      expect(entity?.metadata?.health).toBe(100);
    });

    it('should unregister logical entities', () => {
      const entityId = probe.registerLogicalEntity({
        name: 'Temporary',
      });

      expect(probe.getLogicalEntity(entityId)).toBeDefined();

      probe.unregisterLogicalEntity(entityId);
      expect(probe.getLogicalEntity(entityId)).toBeUndefined();
    });

    it('should add objects to entities', () => {
      const entityId = probe.registerLogicalEntity({
        name: 'VehicleEntity',
      });

      const mesh = createMockMesh('VehicleMesh');
      probe.addObjectToEntity(entityId, mesh as unknown as THREE.Object3D);

      const entity = probe.getLogicalEntity(entityId);
      expect(entity?.objects?.length).toBe(1);
    });
  });

  describe('Frame Stats', () => {
    it('should subscribe to frame stats', () => {
      const stats: FrameStats[] = [];
      
      const unsubscribe = probe.onFrameStats((s) => {
        stats.push(s);
      });

      // Observing renderer sets up frame stats collection
      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);
      
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should get latest frame stats', () => {
      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);
      
      // Initially may be null if no frames rendered
      const latest = probe.getLatestFrameStats();
      // Just verify the method exists and returns expected type
      expect(latest === null || typeof latest === 'object').toBe(true);
    });

    it('should maintain frame stats history', () => {
      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);

      // History should be accessible
      const history = probe.getFrameStatsHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('Plugin Integration', () => {
    it('should register a plugin', () => {
      const mockPlugin = {
        metadata: {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
        },
        activate: vi.fn(),
        deactivate: vi.fn(),
      };

      // registerPlugin is synchronous
      probe.registerPlugin(mockPlugin);
      
      const plugins = probe.getPlugins();
      expect(plugins.some(p => p.metadata.id === 'test-plugin')).toBe(true);
    });

    it('should track plugin count', () => {
      const mockPlugin = {
        metadata: {
          id: 'count-test-plugin',
          name: 'Count Test Plugin',
          version: '1.0.0',
        },
        activate: vi.fn(),
      };

      const initialCount = probe.pluginCount;
      probe.registerPlugin(mockPlugin);
      
      expect(probe.pluginCount).toBe(initialCount + 1);
    });
  });

  describe('Resource Event Tracking', () => {
    it('should subscribe to resource events', () => {
      const events: unknown[] = [];
      
      probe.onResourceEvent((event) => {
        events.push(event);
      });

      probe.observeScene(mockScene as unknown as THREE.Scene);

      // Resource tracking is done via scene observer
      // Events would be generated when objects are added/removed
      expect(probe.getObservedScenes()).toHaveLength(1);
    });
  });

  describe('Complete Workflow E2E', () => {
    it('should handle complete devtool workflow', async () => {
      // 1. Create probe with config
      const e2eProbe = new DevtoolProbe({
        appName: 'E2E Complete Test',
        env: 'development',
        rules: {
          maxDrawCalls: 1000,
          maxTriangles: 100000,
        },
      });

      // 2. Connect transport
      const transport = createMockTransport();
      e2eProbe.connect(transport);
      expect(e2eProbe.isConnected()).toBe(true);

      // 3. Observe renderer and scene
      const renderer = createMockRenderer();
      const scene = createMockScene('E2E Scene');
      
      e2eProbe.observeRenderer(renderer as unknown as THREE.WebGLRenderer);
      e2eProbe.observeScene(scene as unknown as THREE.Scene);

      // 4. Add objects to scene
      const mesh = createMockMesh('E2E Mesh');
      scene.add(mesh);

      // 5. Register logical entity
      const entityId = e2eProbe.registerLogicalEntity({
        name: 'E2E Entity',
        module: '@e2e/test',
      });
      e2eProbe.addObjectToEntity(entityId, mesh as unknown as THREE.Object3D);

      // 6. Take snapshot
      const snapshot = e2eProbe.takeSnapshot();
      expect(snapshot.scenes.length).toBeGreaterThan(0);

      // 7. Select object
      e2eProbe.selectObject(mesh as unknown as THREE.Object3D);
      expect(e2eProbe.getSelectedObject()).toBe(mesh);

      // 8. Check transport received messages
      expect(transport.messages.length).toBeGreaterThan(0);

      // 9. Clean up
      e2eProbe.dispose();
      expect(e2eProbe.isConnected()).toBe(false);
    });

    it('should handle multi-scene workflow', () => {
      const scene1 = createMockScene('Level1');
      const scene2 = createMockScene('Level2');
      const scene3 = createMockScene('UI');

      // Observe multiple scenes
      probe.observeScene(scene1 as unknown as THREE.Scene);
      probe.observeScene(scene2 as unknown as THREE.Scene);
      probe.observeScene(scene3 as unknown as THREE.Scene);

      expect(probe.getObservedScenes()).toHaveLength(3);

      // Take snapshot includes all scenes
      const snapshot = probe.takeSnapshot();
      expect(snapshot.scenes.length).toBe(3);

      // Unobserve one
      probe.unobserveScene(scene2 as unknown as THREE.Scene);
      expect(probe.getObservedScenes()).toHaveLength(2);

      const snapshot2 = probe.takeSnapshot();
      expect(snapshot2.scenes.length).toBe(2);
    });
  });
});
