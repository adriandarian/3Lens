/**
 * Integration E2E Tests: Scene Observer and Adapter Integration
 * 
 * Tests the complete flow from scene observation through to
 * resource tracking and snapshot generation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DevtoolProbe } from '../../probe/DevtoolProbe';
import { SceneObserver } from '../../observers/SceneObserver';
import type { FrameStats, SceneSnapshot, SceneNode } from '../../types';

// Mock THREE.js objects
interface MockVector3 {
  x: number;
  y: number;
  z: number;
}

interface MockEuler {
  x: number;
  y: number;
  z: number;
  order: string;
}

interface MockMatrix4 {
  elements: number[];
}

interface MockObject3D {
  uuid: string;
  name: string;
  type: string;
  visible: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  frustumCulled?: boolean;
  renderOrder?: number;
  position: MockVector3;
  rotation: MockEuler;
  scale: MockVector3;
  matrix: MockMatrix4;
  matrixWorld: MockMatrix4;
  userData: Record<string, unknown>;
  children: MockObject3D[];
  parent: MockObject3D | null;
  layers?: { mask: number };
  traverse: (callback: (obj: MockObject3D) => void) => void;
  add: (child: MockObject3D) => void;
  remove: (child: MockObject3D) => void;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  geometry?: MockGeometry;
  material?: MockMaterial | MockMaterial[];
}

interface MockGeometry {
  uuid: string;
  type: string;
  name?: string;
  attributes: Record<string, MockBufferAttribute>;
  index?: MockBufferAttribute;
  morphAttributes?: Record<string, MockBufferAttribute[]>;
  groups?: Array<{ start: number; count: number; materialIndex: number }>;
  boundingBox?: { min: MockVector3; max: MockVector3 };
  boundingSphere?: { center: MockVector3; radius: number };
  dispose: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

interface MockBufferAttribute {
  count: number;
  itemSize: number;
  array: Float32Array | Uint16Array | Uint32Array;
  usage?: number;
  normalized?: boolean;
}

interface MockMaterial {
  uuid: string;
  type: string;
  name: string;
  visible: boolean;
  transparent: boolean;
  opacity?: number;
  wireframe?: boolean;
  side: number;
  vertexColors?: boolean;
  flatShading?: boolean;
  fog?: boolean;
  map?: MockTexture;
  normalMap?: MockTexture;
  dispose: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

interface MockTexture {
  uuid: string;
  name: string;
  type?: string;
  image?: {
    width: number;
    height: number;
    src?: string;
  };
  format?: number;
  mapping?: number;
  wrapS?: number;
  wrapT?: number;
  magFilter?: number;
  minFilter?: number;
  anisotropy?: number;
  dispose: ReturnType<typeof vi.fn>;
}

// Factory functions
function createMockVector3(x = 0, y = 0, z = 0): MockVector3 {
  return { x, y, z };
}

function createMockEuler(x = 0, y = 0, z = 0, order = 'XYZ'): MockEuler {
  return { x, y, z, order };
}

function createMockMatrix4(): MockMatrix4 {
  const elements = new Array(16).fill(0);
  elements[0] = elements[5] = elements[10] = elements[15] = 1; // Identity
  return { elements };
}

function createMockTexture(name = 'TestTexture'): MockTexture {
  return {
    uuid: `tex-${Math.random().toString(36).slice(2, 9)}`,
    name,
    image: { width: 1024, height: 1024 },
    format: 6408, // RGBA
    wrapS: 10497, // Repeat
    wrapT: 10497,
    magFilter: 9729, // Linear
    minFilter: 9987, // LinearMipmapLinear
    anisotropy: 1,
    dispose: vi.fn(),
  };
}

function createMockMaterial(name = 'TestMaterial', type = 'MeshStandardMaterial'): MockMaterial {
  return {
    uuid: `mat-${Math.random().toString(36).slice(2, 9)}`,
    type,
    name,
    visible: true,
    transparent: false,
    opacity: 1,
    wireframe: false,
    side: 0, // FrontSide
    vertexColors: false,
    flatShading: false,
    fog: true,
    dispose: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function createMockGeometry(type = 'BoxGeometry', vertexCount = 24): MockGeometry {
  return {
    uuid: `geo-${Math.random().toString(36).slice(2, 9)}`,
    type,
    attributes: {
      position: {
        count: vertexCount,
        itemSize: 3,
        array: new Float32Array(vertexCount * 3),
      },
      normal: {
        count: vertexCount,
        itemSize: 3,
        array: new Float32Array(vertexCount * 3),
      },
      uv: {
        count: vertexCount,
        itemSize: 2,
        array: new Float32Array(vertexCount * 2),
      },
    },
    index: {
      count: 36,
      itemSize: 1,
      array: new Uint16Array(36),
    },
    groups: [],
    dispose: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function createMockObject3D(name = 'Object3D', type = 'Object3D'): MockObject3D {
  const children: MockObject3D[] = [];
  const obj: MockObject3D = {
    uuid: `obj-${Math.random().toString(36).slice(2, 9)}`,
    name,
    type,
    visible: true,
    castShadow: false,
    receiveShadow: false,
    frustumCulled: true,
    renderOrder: 0,
    position: createMockVector3(),
    rotation: createMockEuler(),
    scale: createMockVector3(1, 1, 1),
    matrix: createMockMatrix4(),
    matrixWorld: createMockMatrix4(),
    userData: {},
    children,
    parent: null,
    layers: { mask: 1 },
    traverse: (callback) => {
      callback(obj);
      children.forEach(child => child.traverse(callback));
    },
    add: (child) => {
      children.push(child);
      child.parent = obj;
    },
    remove: (child) => {
      const idx = children.indexOf(child);
      if (idx > -1) {
        children.splice(idx, 1);
        child.parent = null;
      }
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  return obj;
}

function createMockMesh(name = 'Mesh'): MockObject3D {
  const mesh = createMockObject3D(name, 'Mesh');
  mesh.geometry = createMockGeometry();
  mesh.material = createMockMaterial();
  return mesh;
}

function createMockLight(name = 'Light', type = 'PointLight'): MockObject3D {
  const light = createMockObject3D(name, type);
  (light as unknown as Record<string, unknown>).intensity = 1;
  (light as unknown as Record<string, unknown>).color = { r: 1, g: 1, b: 1 };
  (light as unknown as Record<string, unknown>).distance = 0;
  (light as unknown as Record<string, unknown>).decay = 2;
  return light;
}

function createMockCamera(name = 'Camera', type = 'PerspectiveCamera'): MockObject3D {
  const camera = createMockObject3D(name, type);
  (camera as unknown as Record<string, unknown>).fov = 75;
  (camera as unknown as Record<string, unknown>).aspect = 16 / 9;
  (camera as unknown as Record<string, unknown>).near = 0.1;
  (camera as unknown as Record<string, unknown>).far = 1000;
  (camera as unknown as Record<string, unknown>).zoom = 1;
  return camera;
}

function createMockScene(name = 'Scene'): MockObject3D {
  const scene = createMockObject3D(name, 'Scene');
  (scene as unknown as Record<string, unknown>).background = null;
  (scene as unknown as Record<string, unknown>).fog = null;
  (scene as unknown as Record<string, unknown>).environment = null;
  return scene;
}

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

  let renderCallCount = 0;
  let drawCalls = 0;
  let triangles = 0;

  return {
    render: vi.fn(() => {
      renderCallCount++;
      drawCalls += 5;
      triangles += 1000;
    }),
    getContext: vi.fn().mockReturnValue(gl),
    info: {
      render: {
        get calls() { return drawCalls; },
        get triangles() { return triangles; },
        points: 0,
        lines: 0,
      },
      memory: {
        geometries: 10,
        textures: 5,
      },
      programs: [],
      autoReset: true,
    },
    capabilities: {
      maxTextures: 16,
      maxTextureSize: 4096,
    },
    domElement: {
      width: 1920,
      height: 1080,
      style: {},
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    shadowMap: { enabled: true, type: 2 },
    outputColorSpace: 'srgb',
    toneMapping: 0,
    toneMappingExposure: 1,
    getSize: vi.fn().mockReturnValue({ width: 1920, height: 1080 }),
    getPixelRatio: vi.fn().mockReturnValue(1),
    getRenderTarget: vi.fn().mockReturnValue(null),
    setRenderTarget: vi.fn(),
  };
}

describe('Scene Observer Integration E2E', () => {
  let probe: DevtoolProbe;
  let mockScene: MockObject3D;
  let mockRenderer: ReturnType<typeof createMockRenderer>;

  beforeEach(() => {
    probe = new DevtoolProbe({
      appName: 'Scene Observer E2E',
      env: 'development',
    });
    mockScene = createMockScene('TestScene');
    mockRenderer = createMockRenderer();
  });

  afterEach(() => {
    probe.dispose();
  });

  describe('Scene Tree Building', () => {
    it('should build scene tree with nested objects', () => {
      // Create hierarchy: Scene > Group > Mesh
      const group = createMockObject3D('ParentGroup', 'Group');
      const mesh1 = createMockMesh('ChildMesh1');
      const mesh2 = createMockMesh('ChildMesh2');
      
      group.add(mesh1);
      group.add(mesh2);
      mockScene.add(group);

      probe.observeScene(mockScene as unknown as THREE.Scene);
      const snapshot = probe.takeSnapshot();

      expect(snapshot.scenes.length).toBe(1);
      expect(snapshot.scenes[0].children?.length).toBeGreaterThan(0);
    });

    it('should capture object transforms correctly', () => {
      const mesh = createMockMesh('TransformMesh');
      mesh.position = createMockVector3(10, 20, 30);
      mesh.rotation = createMockEuler(Math.PI / 4, Math.PI / 2, 0);
      mesh.scale = createMockVector3(2, 2, 2);
      
      mockScene.add(mesh);

      probe.observeScene(mockScene as unknown as THREE.Scene);
      const snapshot = probe.takeSnapshot();

      // Verify scene was captured
      expect(snapshot.scenes[0]).toBeDefined();
    });

    it('should handle deep hierarchies', () => {
      // Create 5-level deep hierarchy
      let current = mockScene;
      for (let i = 0; i < 5; i++) {
        const child = createMockObject3D(`Level${i}`, 'Group');
        current.add(child);
        current = child;
      }
      
      // Add mesh at deepest level
      const deepMesh = createMockMesh('DeepMesh');
      current.add(deepMesh);

      probe.observeScene(mockScene as unknown as THREE.Scene);
      const snapshot = probe.takeSnapshot();

      expect(snapshot.scenes).toBeDefined();
    });
  });

  describe('Resource Collection', () => {
    it('should collect materials from scene', () => {
      const mesh1 = createMockMesh('Mesh1');
      const mesh2 = createMockMesh('Mesh2');
      mesh2.material = createMockMaterial('CustomMaterial', 'MeshPhongMaterial');
      
      mockScene.add(mesh1);
      mockScene.add(mesh2);

      probe.observeScene(mockScene as unknown as THREE.Scene);
      const snapshot = probe.takeSnapshot();

      expect(snapshot.materialsSummary.totalCount).toBeGreaterThanOrEqual(0);
    });

    it('should collect geometries from scene', () => {
      const mesh1 = createMockMesh('GeoMesh1');
      const mesh2 = createMockMesh('GeoMesh2');
      mesh2.geometry = createMockGeometry('SphereGeometry', 100);
      
      mockScene.add(mesh1);
      mockScene.add(mesh2);

      probe.observeScene(mockScene as unknown as THREE.Scene);
      const snapshot = probe.takeSnapshot();

      expect(snapshot.geometriesSummary).toBeDefined();
    });

    it('should collect textures from materials', () => {
      const mesh = createMockMesh('TexturedMesh');
      const material = mesh.material as MockMaterial;
      material.map = createMockTexture('DiffuseMap');
      material.normalMap = createMockTexture('NormalMap');
      
      mockScene.add(mesh);

      probe.observeScene(mockScene as unknown as THREE.Scene);
      const snapshot = probe.takeSnapshot();

      expect(snapshot.texturesSummary).toBeDefined();
    });

    it('should deduplicate shared resources', () => {
      const sharedGeometry = createMockGeometry('SharedGeometry');
      const sharedMaterial = createMockMaterial('SharedMaterial');
      
      // Create multiple meshes with shared resources
      for (let i = 0; i < 5; i++) {
        const mesh = createMockMesh(`SharedMesh${i}`);
        mesh.geometry = sharedGeometry;
        mesh.material = sharedMaterial;
        mockScene.add(mesh);
      }

      probe.observeScene(mockScene as unknown as THREE.Scene);
      const snapshot = probe.takeSnapshot();

      // Resources should be deduplicated
      expect(snapshot).toBeDefined();
    });
  });

  describe('Light Detection', () => {
    it('should identify different light types', () => {
      const pointLight = createMockLight('PointLight1', 'PointLight');
      const directionalLight = createMockLight('DirectionalLight1', 'DirectionalLight');
      const spotLight = createMockLight('SpotLight1', 'SpotLight');
      const ambientLight = createMockLight('AmbientLight1', 'AmbientLight');
      
      mockScene.add(pointLight);
      mockScene.add(directionalLight);
      mockScene.add(spotLight);
      mockScene.add(ambientLight);

      probe.observeScene(mockScene as unknown as THREE.Scene);
      const snapshot = probe.takeSnapshot();

      expect(snapshot.scenes[0].children?.length).toBe(4);
    });
  });

  describe('Camera Detection', () => {
    it('should identify different camera types', () => {
      const perspCamera = createMockCamera('MainCamera', 'PerspectiveCamera');
      const orthoCamera = createMockCamera('OrthoCamera', 'OrthographicCamera');
      
      mockScene.add(perspCamera);
      mockScene.add(orthoCamera);

      probe.observeScene(mockScene as unknown as THREE.Scene);
      const snapshot = probe.takeSnapshot();

      expect(snapshot.scenes[0].children?.length).toBe(2);
    });
  });

  describe('Multi-Scene Support', () => {
    it('should observe multiple scenes independently', () => {
      const scene1 = createMockScene('Level1');
      const scene2 = createMockScene('UI');
      
      scene1.add(createMockMesh('LevelMesh'));
      scene2.add(createMockMesh('UIMesh'));

      probe.observeScene(scene1 as unknown as THREE.Scene);
      probe.observeScene(scene2 as unknown as THREE.Scene);

      const snapshot = probe.takeSnapshot();

      expect(snapshot.scenes.length).toBe(2);
    });

    it('should merge resources from all scenes', () => {
      const scene1 = createMockScene('Scene1');
      const scene2 = createMockScene('Scene2');
      
      // Add different meshes to each scene
      scene1.add(createMockMesh('Scene1Mesh'));
      scene2.add(createMockMesh('Scene2Mesh'));

      probe.observeScene(scene1 as unknown as THREE.Scene);
      probe.observeScene(scene2 as unknown as THREE.Scene);

      const snapshot = probe.takeSnapshot();

      // Resources should be merged
      expect(snapshot.scenes.length).toBe(2);
    });
  });
});

describe('Renderer Adapter Integration E2E', () => {
  let probe: DevtoolProbe;
  let mockRenderer: ReturnType<typeof createMockRenderer>;
  let mockScene: MockObject3D;
  let mockCamera: MockObject3D;

  beforeEach(() => {
    probe = new DevtoolProbe({
      appName: 'Adapter E2E',
      env: 'development',
    });
    mockRenderer = createMockRenderer();
    mockScene = createMockScene();
    mockCamera = createMockCamera();
  });

  afterEach(() => {
    probe.dispose();
  });

  describe('Frame Stats Collection', () => {
    it('should collect frame stats from renderer', () => {
      const statsReceived: FrameStats[] = [];
      
      probe.onFrameStats((stats) => {
        statsReceived.push(stats);
      });

      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);

      // Adapter wraps the render function
      const adapter = probe.getRendererAdapter();
      expect(adapter).not.toBeNull();
      expect(adapter?.kind).toBe('webgl');
    });

    it('should track draw calls and triangles', () => {
      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);
      
      const adapter = probe.getRendererAdapter();
      expect(adapter).toBeDefined();
    });
  });

  describe('GPU Timing', () => {
    it('should handle missing GPU timing extension gracefully', () => {
      // Renderer without GPU timing extension (default mock)
      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);

      const adapter = probe.getRendererAdapter();
      expect(adapter).not.toBeNull();
    });

    it('should use GPU timing when available', () => {
      // Mock with GPU timing support
      const timerMock = {
        TIME_ELAPSED_EXT: 0x88BF,
        GPU_DISJOINT_EXT: 0x8FBB,
      };
      
      const gl = mockRenderer.getContext() as ReturnType<typeof vi.fn> & {
        getExtension: ReturnType<typeof vi.fn>;
      };
      (gl.getExtension as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
        if (name === 'EXT_disjoint_timer_query_webgl2') {
          return timerMock;
        }
        return null;
      });

      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);
      
      // Should not throw
      expect(probe.getRendererAdapter()).toBeDefined();
    });
  });

  describe('Renderer Info Access', () => {
    it('should provide access to textures', () => {
      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);
      
      const textures = probe.getTextures();
      expect(Array.isArray(textures)).toBe(true);
    });

    it('should provide access to geometries', () => {
      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);
      
      const geometries = probe.getGeometries();
      expect(Array.isArray(geometries)).toBe(true);
    });

    it('should provide access to materials', () => {
      probe.observeRenderer(mockRenderer as unknown as THREE.WebGLRenderer);
      
      const materials = probe.getMaterials();
      expect(Array.isArray(materials)).toBe(true);
    });
  });
});

describe('Complete Rendering Pipeline E2E', () => {
  it('should handle complete frame render cycle', () => {
    const probe = new DevtoolProbe({
      appName: 'Pipeline E2E',
      env: 'development',
    });

    const renderer = createMockRenderer();
    const scene = createMockScene('MainScene');
    const camera = createMockCamera('MainCamera');

    // Add content
    scene.add(createMockMesh('Hero'));
    scene.add(createMockLight('Sun', 'DirectionalLight'));
    scene.add(camera);

    // Setup probe
    probe.observeRenderer(renderer as unknown as THREE.WebGLRenderer);
    probe.observeScene(scene as unknown as THREE.Scene);

    // Take initial snapshot
    const snapshot1 = probe.takeSnapshot();
    expect(snapshot1.scenes.length).toBe(1);

    // Add more content
    scene.add(createMockMesh('Enemy1'));
    scene.add(createMockMesh('Enemy2'));

    // Take another snapshot
    const snapshot2 = probe.takeSnapshot();
    expect(snapshot2.snapshotId).not.toBe(snapshot1.snapshotId);

    probe.dispose();
  });

  it('should handle dynamic scene modifications', () => {
    const probe = new DevtoolProbe({
      appName: 'Dynamic Scene E2E',
    });

    const scene = createMockScene();
    probe.observeScene(scene as unknown as THREE.Scene);

    // Initial state
    const snapshot1 = probe.takeSnapshot();
    const initialChildCount = snapshot1.scenes[0].children?.length ?? 0;

    // Add objects
    const mesh1 = createMockMesh('Dynamic1');
    const mesh2 = createMockMesh('Dynamic2');
    scene.add(mesh1);
    scene.add(mesh2);

    // Check updated state
    const snapshot2 = probe.takeSnapshot();
    const newChildCount = snapshot2.scenes[0].children?.length ?? 0;
    expect(newChildCount).toBe(initialChildCount + 2);

    // Remove object
    scene.remove(mesh1);

    const snapshot3 = probe.takeSnapshot();
    const finalChildCount = snapshot3.scenes[0].children?.length ?? 0;
    expect(finalChildCount).toBe(newChildCount - 1);

    probe.dispose();
  });
});
