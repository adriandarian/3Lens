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
  PerformanceMetrics,
} from '../types';
import {
  PerformanceTracker,
  createEmptyMemoryStats,
  createEmptyRenderingStats,
  estimateTextureMemory,
} from '../utils/performance-calculator';

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
 */
export function createWebGLAdapter(
  renderer: THREE.WebGLRenderer
): RendererAdapter {
  const frameCallbacks: Array<(stats: FrameStats) => void> = [];
  let frameCount = 0;
  let disposed = false;

  // Performance tracking
  const performanceTracker = new PerformanceTracker(300, 60);
  let lastTimestamp = performance.now();

  // GPU timing support
  const gl = renderer.getContext();
  const timerExt = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  let pendingGpuTime: number | null = null;
  let gpuQuery: WebGLQuery | null = null;

  // Collect WebGL context info once
  const contextInfo = collectContextInfo(gl);

  // Store original render method
  const originalRender = renderer.render.bind(renderer);

  // Scene analysis cache (to avoid traversing every frame)
  let cachedSceneAnalysis: SceneAnalysis | null = null;
  let analysisFrameCount = 0;
  const ANALYSIS_INTERVAL = 10; // Re-analyze every 10 frames

  // Wrap render method
  renderer.render = function (
    scene: THREE.Scene,
    camera: THREE.Camera
  ): void {
    if (disposed) {
      originalRender(scene, camera);
      return;
    }

    const startTime = performance.now();
    const deltaTime = performanceTracker.getDeltaTime(startTime);

    // Start GPU timing query
    if (timerExt && !gpuQuery) {
      try {
        gpuQuery = gl.createQuery();
        if (gpuQuery) {
          gl.beginQuery(timerExt.TIME_ELAPSED_EXT, gpuQuery);
        }
      } catch {
        // GPU timing not available
      }
    }

    // Call original render
    originalRender(scene, camera);

    // End GPU timing query
    if (timerExt && gpuQuery) {
      try {
        gl.endQuery(timerExt.TIME_ELAPSED_EXT);

        // Check if query is ready (from previous frame)
        const available = gl.getQueryParameter(
          gpuQuery,
          gl.QUERY_RESULT_AVAILABLE
        );
        const disjoint = gl.getParameter(timerExt.GPU_DISJOINT_EXT);

        if (available && !disjoint) {
          const nanoseconds = gl.getQueryParameter(gpuQuery, gl.QUERY_RESULT);
          pendingGpuTime = nanoseconds / 1e6; // Convert to ms
        }

        gl.deleteQuery(gpuQuery);
        gpuQuery = null;
      } catch {
        gpuQuery = null;
      }
    }

    const endTime = performance.now();
    const cpuTime = endTime - startTime;

    // Record frame for performance metrics
    performanceTracker.recordFrame(cpuTime, endTime);

    // Analyze scene periodically
    if (analysisFrameCount % ANALYSIS_INTERVAL === 0 || !cachedSceneAnalysis) {
      cachedSceneAnalysis = analyzeScene(scene);
    }
    analysisFrameCount++;

    // Collect stats from renderer.info
    const info = renderer.info as ExtendedRendererInfo;

    // Calculate memory stats
    const memoryStats = collectMemoryStats(renderer, info, cachedSceneAnalysis);

    // Get performance metrics
    const perfMetrics = performanceTracker.getMetrics(cpuTime);

    // Calculate derived metrics
    perfMetrics.trianglesPerDrawCall =
      info.render.calls > 0
        ? Math.round(info.render.triangles / info.render.calls)
        : 0;
    perfMetrics.trianglesPerObject =
      cachedSceneAnalysis.visibleObjects > 0
        ? Math.round(info.render.triangles / cachedSceneAnalysis.visibleObjects)
        : 0;
    perfMetrics.drawCallEfficiency = calculateDrawCallEfficiency(
      info.render.calls,
      info.render.triangles,
      cachedSceneAnalysis.totalObjects
    );

    // Collect rendering stats
    const renderingStats = collectRenderingStats(
      info,
      cachedSceneAnalysis,
      renderer
    );

    // Build frame stats
    const stats: FrameStats = {
      frame: frameCount++,
      timestamp: endTime,
      deltaTimeMs: deltaTime,
      cpuTimeMs: cpuTime,
      gpuTimeMs: pendingGpuTime ?? undefined,

      // Geometry metrics
      triangles: info.render.triangles,
      drawCalls: info.render.calls,
      points: info.render.points,
      lines: info.render.lines,
      vertices: cachedSceneAnalysis.totalVertices,

      // Object metrics
      objectsVisible: cachedSceneAnalysis.visibleObjects,
      objectsTotal: cachedSceneAnalysis.totalObjects,
      objectsCulled:
        cachedSceneAnalysis.totalObjects - cachedSceneAnalysis.visibleObjects,
      materialsUsed: info.programs?.length ?? 0,

      // Memory metrics
      memory: memoryStats,

      // Performance metrics
      performance: perfMetrics,

      // Rendering stats
      rendering: renderingStats,

      backend: 'webgl',
      webglExtras: {
        programSwitches: info.programs?.length ?? 0,
        textureBindings: info.memory.textures,
        geometryCount: info.memory.geometries,
        textureCount: info.memory.textures,
        programs: info.programs?.length ?? 0,
        contextAttributes: contextInfo.attributes,
        activeExtensions: contextInfo.extensions,
        maxTextureSize: contextInfo.maxTextureSize,
        maxVertexUniforms: contextInfo.maxVertexUniforms,
        maxFragmentUniforms: contextInfo.maxFragmentUniforms,
        maxVaryings: contextInfo.maxVaryings,
        maxTextureUnits: contextInfo.maxTextureUnits,
      },
    };

    // Reset renderer info for next frame
    info.render.calls = 0;
    info.render.triangles = 0;
    info.render.points = 0;
    info.render.lines = 0;

    lastTimestamp = endTime;

    // Notify callbacks
    for (const callback of frameCallbacks) {
      try {
        callback(stats);
      } catch (e) {
        console.error('[3Lens] Error in frame callback:', e);
      }
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
      // Would need to track render targets as they're created
      // For now, return empty array
      return [];
    },

    getTextures(): TextureInfo[] {
      // Would need access to texture cache
      return [];
    },

    getGeometries(): GeometryInfo[] {
      // Would need access to geometry cache
      return [];
    },

    getMaterials(): MaterialInfo[] {
      // Would need access to material cache
      return [];
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
        totalMs: pendingGpuTime ?? 0,
      };
    },

    dispose(): void {
      disposed = true;
      renderer.render = originalRender;
      frameCallbacks.length = 0;
      if (gpuQuery) {
        gl.deleteQuery(gpuQuery);
        gpuQuery = null;
      }
    },
  };
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
 * Analyze scene for detailed statistics
 */
function analyzeScene(scene: THREE.Scene): SceneAnalysis {
  const analysis: SceneAnalysis = {
    totalObjects: 0,
    visibleObjects: 0,
    totalVertices: 0,
    totalTriangles: 0,
    skinnedMeshes: 0,
    totalBones: 0,
    transparentObjects: 0,
    lights: 0,
    shadowCastingLights: 0,
    instancedMeshes: 0,
    totalInstances: 0,
    estimatedGeometryMemory: 0,
    estimatedTextureMemory: 0,
  };

  scene.traverse((object) => {
    analysis.totalObjects++;

    if (object.visible) {
      analysis.visibleObjects++;
    }

    // Check if it's a mesh
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      const geo = mesh.geometry;

      // Count vertices
      const positionAttr = geo.attributes?.position;
      if (positionAttr) {
        const vertCount = positionAttr.count;
        analysis.totalVertices += vertCount;

        // Estimate triangles
        if (geo.index) {
          analysis.totalTriangles += geo.index.count / 3;
        } else {
          analysis.totalTriangles += vertCount / 3;
        }

        // Estimate geometry memory
        let bytesPerVertex = 12; // position
        if (geo.attributes?.normal) bytesPerVertex += 12;
        if (geo.attributes?.uv) bytesPerVertex += 8;
        if (geo.attributes?.tangent) bytesPerVertex += 16;
        if (geo.attributes?.color) bytesPerVertex += 16;

        const indexBytes = geo.index
          ? geo.index.count * (geo.index.count > 65535 ? 4 : 2)
          : 0;
        analysis.estimatedGeometryMemory +=
          vertCount * bytesPerVertex + indexBytes;
      }

      // Check for transparency
      const material = mesh.material as THREE.Material;
      if (material && (material.transparent || material.opacity < 1)) {
        analysis.transparentObjects++;
      }

      // Check for instanced mesh
      const instancedMesh = mesh as THREE.InstancedMesh;
      if (instancedMesh.isInstancedMesh) {
        analysis.instancedMeshes++;
        analysis.totalInstances += instancedMesh.count || 0;
      }

      // Check for skinned mesh
      const skinnedMesh = mesh as THREE.SkinnedMesh;
      if (skinnedMesh.isSkinnedMesh && skinnedMesh.skeleton) {
        analysis.skinnedMeshes++;
        analysis.totalBones += skinnedMesh.skeleton.bones.length;
      }
    }

    // Check if it's a light
    const light = object as THREE.Light;
    if (light.isLight) {
      analysis.lights++;
      if (light.castShadow) {
        analysis.shadowCastingLights++;
      }
    }
  });

  return analysis;
}

/**
 * Collect memory statistics
 */
function collectMemoryStats(
  renderer: THREE.WebGLRenderer,
  info: ExtendedRendererInfo,
  sceneAnalysis: SceneAnalysis
): MemoryStats {
  const stats = createEmptyMemoryStats();

  stats.geometries = info.memory.geometries;
  stats.textures = info.memory.textures;
  stats.programs = info.programs?.length ?? 0;

  // Estimate texture memory (rough estimate based on typical usage)
  // Real implementation would need to track actual textures
  stats.textureMemory = stats.textures * estimateTextureMemory(1024, 1024);
  stats.geometryMemory = sceneAnalysis.estimatedGeometryMemory;
  stats.totalGpuMemory = stats.textureMemory + stats.geometryMemory;

  // Try to get JS heap info
  const perfMemory = (performance as unknown as { memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  } }).memory;
  if (perfMemory) {
    stats.jsHeapSize = perfMemory.usedJSHeapSize;
    stats.jsHeapLimit = perfMemory.jsHeapSizeLimit;
  }

  return stats;
}

/**
 * Collect rendering statistics
 */
function collectRenderingStats(
  info: ExtendedRendererInfo,
  sceneAnalysis: SceneAnalysis,
  renderer: THREE.WebGLRenderer
): RenderingStats {
  const stats = createEmptyRenderingStats();

  stats.totalLights = sceneAnalysis.lights;
  stats.activeLights = sceneAnalysis.lights;
  stats.shadowCastingLights = sceneAnalysis.shadowCastingLights;
  stats.shadowMapUpdates = sceneAnalysis.shadowCastingLights; // Approximation

  stats.skinnedMeshes = sceneAnalysis.skinnedMeshes;
  stats.totalBones = sceneAnalysis.totalBones;

  stats.instancedDrawCalls = sceneAnalysis.instancedMeshes;
  stats.totalInstances = sceneAnalysis.totalInstances;

  stats.transparentObjects = sceneAnalysis.transparentObjects;
  stats.transparentDrawCalls = sceneAnalysis.transparentObjects; // Approximation

  stats.programSwitches = info.programs?.length ?? 0;
  stats.textureBinds = info.memory.textures;

  // Check if XR is active
  const xr = renderer.xr;
  if (xr && xr.isPresenting) {
    stats.xrActive = true;
    stats.viewports = 2; // Stereo rendering
  }

  return stats;
}

/**
 * Calculate draw call efficiency score
 */
function calculateDrawCallEfficiency(
  drawCalls: number,
  triangles: number,
  totalObjects: number
): number {
  if (drawCalls === 0 || triangles === 0) return 100;

  // Ideal: high triangles per draw call, low draw calls per object
  const trianglesPerCall = triangles / drawCalls;
  const drawCallsPerObject = totalObjects > 0 ? drawCalls / totalObjects : 1;

  // Score based on triangles per draw call (higher is better, up to ~10000)
  const triScore = Math.min(100, (trianglesPerCall / 5000) * 100);

  // Penalty for excessive draw calls per object
  const callPenalty = Math.max(0, (drawCallsPerObject - 1) * 10);

  return Math.max(0, Math.round(triScore - callPenalty));
}

/**
 * WebGL context info
 */
interface ContextInfo {
  attributes: {
    antialias: boolean;
    alpha: boolean;
    depth: boolean;
    stencil: boolean;
    preserveDrawingBuffer: boolean;
    powerPreference: string;
  };
  extensions: string[];
  maxTextureSize: number;
  maxVertexUniforms: number;
  maxFragmentUniforms: number;
  maxVaryings: number;
  maxTextureUnits: number;
}

/**
 * Collect WebGL context information
 */
function collectContextInfo(gl: WebGLRenderingContext): ContextInfo {
  const attrs = gl.getContextAttributes() || {};

  // Get supported extensions
  const extensions = gl.getSupportedExtensions() || [];

  return {
    attributes: {
      antialias: attrs.antialias ?? false,
      alpha: attrs.alpha ?? false,
      depth: attrs.depth ?? false,
      stencil: attrs.stencil ?? false,
      preserveDrawingBuffer: attrs.preserveDrawingBuffer ?? false,
      powerPreference: (attrs as { powerPreference?: string }).powerPreference ?? 'default',
    },
    extensions: extensions.slice(0, 20), // Limit to avoid too much data
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
    maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
    maxVaryings: gl.getParameter(gl.MAX_VARYING_VECTORS),
    maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
  };
}
