import type * as THREE from 'three';

import type {
  RendererAdapter,
  FrameStats,
  RenderTargetInfo,
  TextureInfo,
  GeometryInfo,
  MaterialInfo,
  ProgramInfo,
  GpuTimingInfo,
  Unsubscribe,
  MemoryStats,
  RenderingStats,
} from '../types';

/**
 * Extended WebGL renderer info with additional properties
 */
interface ExtendedRendererInfo {
  render: {
    calls: number;
    triangles: number;
    points: number;
    lines: number;
    frame?: number;
  };
  memory: {
    geometries: number;
    textures: number;
  };
  programs?: THREE.WebGLProgram[];
  autoReset?: boolean;
}

/**
 * Create a WebGL renderer adapter with comprehensive metrics
 * Optimized for minimal overhead when not actively being queried
 */
export function createWebGLAdapter(
  renderer: THREE.WebGLRenderer
): RendererAdapter {
  const frameCallbacks: Array<(stats: FrameStats) => void> = [];
  let frameCount = 0;
  let disposed = false;

  // Minimal performance tracking
  let lastFrameTime = performance.now();
  let minFrameTime = Infinity;
  let maxFrameTime = 0;
  let totalFrameTime = 0;
  let frameTimeCount = 0;

  // Store original render method
  const originalRender = renderer.render.bind(renderer);

  // Scene analysis - cached, only computed once
  let cachedSceneAnalysis: SceneAnalysis | null = null;
  
  // Cached resource lists (updated periodically)
  let cachedTextures: TextureInfo[] = [];
  let cachedGeometries: GeometryInfo[] = [];
  let cachedMaterials: MaterialInfo[] = [];
  let lastResourceScan = 0;
  const resourceScanInterval = 2000; // Scan resources every 2 seconds
  
  // GPU timing support
  const gl = renderer.getContext();
  const timerQueryExt = gl.getExtension('EXT_disjoint_timer_query_webgl2') 
    || gl.getExtension('EXT_disjoint_timer_query');
  let pendingQuery: WebGLQuery | null = null;
  let lastGpuTime = 0;

  // Store current scene reference for resource enumeration
  let currentScene: THREE.Scene | null = null;

  // Wrap render method - optimized for minimal overhead
  renderer.render = function (
    scene: THREE.Scene,
    camera: THREE.Camera
  ): void {
    if (disposed) {
      originalRender(scene, camera);
      return;
    }

    // Store scene reference for resource queries
    currentScene = scene;

    // Skip all instrumentation if no callbacks registered
    if (frameCallbacks.length === 0) {
      originalRender(scene, camera);
      frameCount++;
      return;
    }

    const startTime = performance.now();

    // Start GPU timer query if available
    let query: WebGLQuery | null = null;
    if (timerQueryExt && gl instanceof WebGL2RenderingContext) {
      // Check if previous query is ready
      if (pendingQuery) {
        const available = gl.getQueryParameter(pendingQuery, gl.QUERY_RESULT_AVAILABLE);
        const disjoint = gl.getParameter((timerQueryExt as { GPU_DISJOINT_EXT: number }).GPU_DISJOINT_EXT);
        if (available && !disjoint) {
          const nanoseconds = gl.getQueryParameter(pendingQuery, gl.QUERY_RESULT);
          lastGpuTime = nanoseconds / 1000000; // Convert to milliseconds
        }
        gl.deleteQuery(pendingQuery);
        pendingQuery = null;
      }
      
      // Start new query
      query = gl.createQuery();
      if (query) {
        gl.beginQuery((timerQueryExt as { TIME_ELAPSED_EXT: number }).TIME_ELAPSED_EXT, query);
      }
    }

    // Call original render
    originalRender(scene, camera);

    // End GPU timer query
    if (query && timerQueryExt && gl instanceof WebGL2RenderingContext) {
      gl.endQuery((timerQueryExt as { TIME_ELAPSED_EXT: number }).TIME_ELAPSED_EXT);
      pendingQuery = query;
    }

    const endTime = performance.now();
    const cpuTime = endTime - startTime;
    const deltaTime = startTime - lastFrameTime;
    lastFrameTime = startTime;

    // Track frame times with simple running stats (no array operations)
    if (cpuTime < minFrameTime) minFrameTime = cpuTime;
    if (cpuTime > maxFrameTime) maxFrameTime = cpuTime;
    totalFrameTime += cpuTime;
    frameTimeCount++;

    // Collect stats from renderer.info (cheap - just reading existing values)
    const info = renderer.info as ExtendedRendererInfo;

    // Periodic resource scanning (not every frame)
    const now = performance.now();
    if (now - lastResourceScan > resourceScanInterval) {
      lastResourceScan = now;
      const resources = scanSceneResources(scene);
      cachedTextures = resources.textures;
      cachedGeometries = resources.geometries;
      cachedMaterials = resources.materials;
      // Refresh scene analysis too
      cachedSceneAnalysis = analyzeSceneLight(scene);
    }

    // Only do scene analysis once on first frame (not every N frames)
    // This dramatically reduces overhead while still providing useful data
    if (!cachedSceneAnalysis) {
      cachedSceneAnalysis = analyzeSceneLight(scene);
    }

    // Calculate FPS from running average
    const avgFrameTime = frameTimeCount > 0 ? totalFrameTime / frameTimeCount : cpuTime;
    const fps = avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 60;

    // Compute triangles per draw call
    const trianglesPerDrawCall = info.render.calls > 0 
      ? Math.round(info.render.triangles / info.render.calls) 
      : 0;
    const trianglesPerObject = (cachedSceneAnalysis?.visibleObjects ?? 0) > 0
      ? Math.round(info.render.triangles / (cachedSceneAnalysis?.visibleObjects ?? 1))
      : 0;

    // Build memory stats from renderer.info and scene analysis
    const memory: MemoryStats = {
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      geometryMemory: cachedSceneAnalysis?.estimatedGeometryMemory ?? 0,
      textureMemory: cachedSceneAnalysis?.estimatedTextureMemory ?? 0,
      totalGpuMemory: (cachedSceneAnalysis?.estimatedGeometryMemory ?? 0) + (cachedSceneAnalysis?.estimatedTextureMemory ?? 0),
      renderTargets: 0,
      renderTargetMemory: 0,
      programs: info.programs?.length ?? 0,
      jsHeapSize: (performance as unknown as { memory?: { usedJSHeapSize?: number } }).memory?.usedJSHeapSize,
      jsHeapLimit: (performance as unknown as { memory?: { jsHeapSizeLimit?: number } }).memory?.jsHeapSizeLimit,
    };

    // Build rendering stats
    const rendering: RenderingStats = {
      shadowMapUpdates: 0,
      shadowCastingLights: cachedSceneAnalysis?.shadowCastingLights ?? 0,
      totalLights: cachedSceneAnalysis?.lights ?? 0,
      activeLights: cachedSceneAnalysis?.lights ?? 0,
      skinnedMeshes: cachedSceneAnalysis?.skinnedMeshes ?? 0,
      totalBones: cachedSceneAnalysis?.totalBones ?? 0,
      instancedDrawCalls: cachedSceneAnalysis?.instancedMeshes ?? 0,
      totalInstances: cachedSceneAnalysis?.totalInstances ?? 0,
      transparentObjects: cachedSceneAnalysis?.transparentObjects ?? 0,
      transparentDrawCalls: 0,
      renderTargetSwitches: 0,
      programSwitches: 0,
      textureBinds: 0,
      bufferUploads: 0,
      bytesUploaded: 0,
      postProcessingPasses: 0,
      xrActive: renderer.xr?.isPresenting ?? false,
      viewports: renderer.xr?.isPresenting ? 2 : 1,
    };

    // Build frame stats with all required fields
    const stats: FrameStats = {
      frame: frameCount++,
      timestamp: endTime,
      deltaTimeMs: deltaTime,
      cpuTimeMs: cpuTime,
      gpuTimeMs: lastGpuTime > 0 ? lastGpuTime : undefined,

      // Geometry metrics (from renderer.info - already computed by three.js)
      triangles: info.render.triangles,
      drawCalls: info.render.calls,
      points: info.render.points,
      lines: info.render.lines,
      vertices: cachedSceneAnalysis?.totalVertices ?? 0,

      // Object metrics
      objectsVisible: cachedSceneAnalysis?.visibleObjects ?? 0,
      objectsTotal: cachedSceneAnalysis?.totalObjects ?? 0,
      objectsCulled: 0,
      materialsUsed: info.programs?.length ?? 0,

      // Memory stats
      memory,

      // Performance metrics
      performance: {
        fps,
        fpsSmoothed: fps,
        fpsMin: minFrameTime > 0 ? Math.round(1000 / maxFrameTime) : fps,
        fpsMax: maxFrameTime > 0 ? Math.round(1000 / minFrameTime) : fps,
        fps1PercentLow: fps,
        frameBudgetUsed: (cpuTime / 16.67) * 100,
        targetFrameTimeMs: 16.67,
        frameTimeVariance: 0,
        trianglesPerDrawCall,
        trianglesPerObject,
        drawCallEfficiency: Math.min(100, trianglesPerDrawCall / 100),
        isSmooth: cpuTime < 16.67,
        droppedFrames: 0,
      },

      // Rendering stats
      rendering,

      backend: 'webgl',
    };

    // Reset renderer info for next frame
    info.render.calls = 0;
    info.render.triangles = 0;
    info.render.points = 0;
    info.render.lines = 0;

    // Notify callbacks
    for (const callback of frameCallbacks) {
      callback(stats);
    }
  };

  return {
    kind: 'webgl',

    observeFrame(callback: (stats: FrameStats) => void): Unsubscribe {
      frameCallbacks.push(callback);
      return () => {
        const index = frameCallbacks.indexOf(callback);
        if (index > -1) {
          frameCallbacks.splice(index, 1);
        }
      };
    },

    getRenderTargets(): RenderTargetInfo[] {
      // TODO: Track render targets registered with the probe
      return [];
    },

    getTextures(): TextureInfo[] {
      return cachedTextures;
    },

    getGeometries(): GeometryInfo[] {
      return cachedGeometries;
    },

    getMaterials(): MaterialInfo[] {
      return cachedMaterials;
    },

    getPrograms(): ProgramInfo[] {
      const programs = renderer.info.programs ?? [];
      return programs.map((program: THREE.WebGLProgram) => ({
        id: program.id?.toString() ?? 'unknown',
        vertexShader: '',
        fragmentShader: '',
        uniforms: {},
        attributes: [],
        usedByMaterials: [],
      }));
    },

    async getGpuTimings(): Promise<GpuTimingInfo> {
      return {
        totalMs: lastGpuTime,
      };
    },

    dispose(): void {
      disposed = true;
      renderer.render = originalRender;
      frameCallbacks.length = 0;
      cachedSceneAnalysis = null;
      minFrameTime = Infinity;
      maxFrameTime = 0;
      totalFrameTime = 0;
      frameTimeCount = 0;
    },
  };
}

/**
 * Lightweight scene analysis - counts objects and estimates memory
 */
function analyzeSceneLight(scene: THREE.Scene): SceneAnalysis {
  let totalObjects = 0;
  let visibleObjects = 0;
  let totalVertices = 0;
  let totalTriangles = 0;
  let skinnedMeshes = 0;
  let totalBones = 0;
  let transparentObjects = 0;
  let lights = 0;
  let shadowCastingLights = 0;
  let instancedMeshes = 0;
  let totalInstances = 0;
  let estimatedGeometryMemory = 0;
  let estimatedTextureMemory = 0;

  // Track unique geometries and textures to avoid double counting
  const countedGeometries = new Set<string>();
  const countedTextures = new Set<string>();

  scene.traverse((object) => {
    totalObjects++;
    if (object.visible) {
      visibleObjects++;
    }

    // Count lights
    const light = object as THREE.Light;
    if (light.isLight) {
      lights++;
      if (light.castShadow) {
        shadowCastingLights++;
      }
    }

    // Process meshes
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      const geometry = mesh.geometry;
      const positionAttr = geometry.attributes?.position;
      
      if (positionAttr) {
        totalVertices += positionAttr.count;
        
        // Estimate triangles
        if (geometry.index) {
          totalTriangles += geometry.index.count / 3;
        } else {
          totalTriangles += positionAttr.count / 3;
        }
      }

      // Estimate geometry memory (only count unique geometries)
      if (!countedGeometries.has(geometry.uuid)) {
        countedGeometries.add(geometry.uuid);
        estimatedGeometryMemory += estimateGeometryMemory(geometry);
      }

      // Check for skinned mesh
      const skinnedMesh = mesh as THREE.SkinnedMesh;
      if (skinnedMesh.isSkinnedMesh && skinnedMesh.skeleton) {
        skinnedMeshes++;
        totalBones += skinnedMesh.skeleton.bones.length;
      }

      // Check for instanced mesh
      const instancedMesh = mesh as THREE.InstancedMesh;
      if (instancedMesh.isInstancedMesh) {
        instancedMeshes++;
        totalInstances += instancedMesh.count;
      }

      // Check for transparent material
      const material = mesh.material as THREE.Material | THREE.Material[];
      if (Array.isArray(material)) {
        if (material.some(m => m.transparent)) {
          transparentObjects++;
        }
        // Estimate texture memory from materials
        for (const mat of material) {
          estimatedTextureMemory += estimateMaterialTextureMemory(mat, countedTextures);
        }
      } else if (material?.transparent) {
        transparentObjects++;
        estimatedTextureMemory += estimateMaterialTextureMemory(material, countedTextures);
      } else if (material) {
        estimatedTextureMemory += estimateMaterialTextureMemory(material, countedTextures);
      }
    }
  });

  return {
    totalObjects,
    visibleObjects,
    totalVertices,
    totalTriangles: Math.round(totalTriangles),
    skinnedMeshes,
    totalBones,
    transparentObjects,
    lights,
    shadowCastingLights,
    instancedMeshes,
    totalInstances,
    estimatedGeometryMemory,
    estimatedTextureMemory,
  };
}

/**
 * Estimate memory usage of a geometry in bytes
 */
function estimateGeometryMemory(geometry: THREE.BufferGeometry): number {
  let bytes = 0;

  // Count all buffer attributes
  for (const name in geometry.attributes) {
    const attr = geometry.attributes[name] as THREE.BufferAttribute;
    if (attr?.array) {
      bytes += attr.array.byteLength;
    }
  }

  // Count index buffer
  if (geometry.index?.array) {
    bytes += geometry.index.array.byteLength;
  }

  return bytes;
}

/**
 * Estimate texture memory from a material
 */
function estimateMaterialTextureMemory(material: THREE.Material, countedTextures: Set<string>): number {
  let bytes = 0;
  const mat = material as THREE.MeshStandardMaterial;

  const textureProps = [
    'map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap',
    'emissiveMap', 'alphaMap', 'envMap', 'lightMap', 'bumpMap',
    'displacementMap', 'specularMap', 'gradientMap'
  ];

  for (const prop of textureProps) {
    const texture = (mat as unknown as Record<string, THREE.Texture | undefined>)[prop];
    if (texture?.uuid && !countedTextures.has(texture.uuid)) {
      countedTextures.add(texture.uuid);
      bytes += estimateTextureMemory(texture);
    }
  }

  return bytes;
}

/**
 * Estimate memory usage of a texture in bytes
 */
function estimateTextureMemory(texture: THREE.Texture): number {
  const image = texture.image;
  if (!image) return 0;

  let width = 0;
  let height = 0;

  if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
    width = image.width || 0;
    height = image.height || 0;
  } else if (image instanceof ImageBitmap) {
    width = image.width;
    height = image.height;
  } else if (typeof image === 'object' && 'width' in image && 'height' in image) {
    width = (image as { width: number; height: number }).width;
    height = (image as { width: number; height: number }).height;
  }

  if (width === 0 || height === 0) return 0;

  // Assume RGBA (4 bytes per pixel)
  let bytesPerPixel = 4;

  // Adjust for format if available
  const format = texture.format;
  if (format === 1020 || format === 1021) { // RedFormat or RGFormat
    bytesPerPixel = format === 1020 ? 1 : 2;
  }

  // Calculate base memory
  let memory = width * height * bytesPerPixel;

  // Add mipmaps (approximately 33% more memory)
  if (texture.generateMipmaps) {
    memory = Math.round(memory * 1.33);
  }

  return memory;
}

/**
 * Scene analysis result
 */
interface SceneAnalysis {
  totalObjects: number;
  visibleObjects: number;
  totalVertices: number;
  totalTriangles: number;
  skinnedMeshes: number;
  totalBones: number;
  transparentObjects: number;
  lights: number;
  shadowCastingLights: number;
  instancedMeshes: number;
  totalInstances: number;
  estimatedGeometryMemory: number;
  estimatedTextureMemory: number;
}

/**
 * Scan scene for all resources (textures, geometries, materials)
 */
function scanSceneResources(scene: THREE.Scene): {
  textures: TextureInfo[];
  geometries: GeometryInfo[];
  materials: MaterialInfo[];
} {
  const textureMap = new Map<string, TextureInfo>();
  const geometryMap = new Map<string, GeometryInfo>();
  const materialMap = new Map<string, MaterialInfo>();

  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;

    // Collect geometry
    if (mesh.geometry) {
      const geo = mesh.geometry;
      if (!geometryMap.has(geo.uuid)) {
        const posAttr = geo.attributes?.position as THREE.BufferAttribute;
        const vertexCount = posAttr?.count ?? 0;
        const indexCount = geo.index?.count;
        const faceCount = indexCount ? indexCount / 3 : vertexCount / 3;
        
        geometryMap.set(geo.uuid, {
          ref: geo.uuid,
          type: geo.type || 'BufferGeometry',
          name: geo.name || undefined,
          vertexCount,
          indexCount: indexCount ?? undefined,
          faceCount: Math.round(faceCount),
          estimatedMemoryBytes: estimateGeometryMemory(geo),
        });
      }
    }

    // Collect materials and their textures
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      if (!mat) continue;
      
      // Collect material
      if (!materialMap.has(mat.uuid)) {
        const stdMat = mat as THREE.MeshStandardMaterial;
        materialMap.set(mat.uuid, {
          ref: mat.uuid,
          type: mat.type || 'Material',
          name: mat.name || undefined,
          color: stdMat.color?.getHex?.(),
          opacity: mat.opacity ?? 1,
          transparent: mat.transparent ?? false,
          visible: mat.visible ?? true,
        });
      }

      // Collect textures from material
      const textureProps = [
        'map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap',
        'emissiveMap', 'alphaMap', 'envMap', 'lightMap', 'bumpMap',
        'displacementMap', 'specularMap', 'gradientMap'
      ];

      for (const prop of textureProps) {
        const texture = (mat as unknown as Record<string, THREE.Texture | undefined>)[prop];
        if (texture && !textureMap.has(texture.uuid)) {
          const image = texture.image;
          let width = 0;
          let height = 0;

          if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
            width = image.width || 0;
            height = image.height || 0;
          } else if (image instanceof ImageBitmap) {
            width = image.width;
            height = image.height;
          } else if (typeof image === 'object' && image && 'width' in image && 'height' in image) {
            width = (image as { width: number; height: number }).width;
            height = (image as { width: number; height: number }).height;
          }

          const info = textureMap.get(texture.uuid);
          const usedByMaterials = info?.usedByMaterials ?? [];
          if (!usedByMaterials.includes(mat.uuid)) {
            usedByMaterials.push(mat.uuid);
          }

          textureMap.set(texture.uuid, {
            ref: texture.uuid,
            type: texture.type || 'Texture',
            name: texture.name || prop,
            width,
            height,
            format: texture.format ?? 0,
            estimatedMemoryBytes: estimateTextureMemory(texture),
            usedByMaterials,
          });
        }
      }
    }
  });

  return {
    textures: Array.from(textureMap.values()),
    geometries: Array.from(geometryMap.values()),
    materials: Array.from(materialMap.values()),
  };
}

