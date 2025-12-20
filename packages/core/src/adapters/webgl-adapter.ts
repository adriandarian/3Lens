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

  // Wrap render method - optimized for minimal overhead
  renderer.render = function (
    scene: THREE.Scene,
    camera: THREE.Camera
  ): void {
    if (disposed) {
      originalRender(scene, camera);
      return;
    }

    // Skip all instrumentation if no callbacks registered
    if (frameCallbacks.length === 0) {
      originalRender(scene, camera);
      frameCount++;
      return;
    }

    const startTime = performance.now();

    // Call original render FIRST (minimize overhead before render)
    originalRender(scene, camera);

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

    // Only do scene analysis once on first frame (not every N frames)
    // This dramatically reduces overhead while still providing useful data
    if (!cachedSceneAnalysis) {
      cachedSceneAnalysis = analyzeSceneLight(scene);
    }

    // Calculate FPS from running average
    const avgFrameTime = frameTimeCount > 0 ? totalFrameTime / frameTimeCount : cpuTime;
    const fps = avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 60;

    // Build minimal frame stats - only essential fields
    const stats: FrameStats = {
      frame: frameCount++,
      timestamp: endTime,
      deltaTimeMs: deltaTime,
      cpuTimeMs: cpuTime,

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

      // Minimal performance metrics
      performance: {
        fps,
        avgFrameTimeMs: avgFrameTime,
        minFrameTimeMs: minFrameTime,
        maxFrameTimeMs: maxFrameTime,
        frameTimeVariance: 0,
        fps1PercentLow: fps,
        trianglesPerSecond: 0,
        drawCallsPerSecond: 0,
        trianglesPerDrawCall: 0,
        trianglesPerObject: 0,
        drawCallEfficiency: 100,
      },

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
      return [];
    },

    getTextures(): TextureInfo[] {
      return [];
    },

    getGeometries(): GeometryInfo[] {
      return [];
    },

    getMaterials(): MaterialInfo[] {
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
        totalMs: 0, // GPU timing disabled for minimal overhead
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
 * Lightweight scene analysis - only counts objects, skips expensive memory calculations
 */
function analyzeSceneLight(scene: THREE.Scene): SceneAnalysis {
  let totalObjects = 0;
  let visibleObjects = 0;
  let totalVertices = 0;

  scene.traverse((object) => {
    totalObjects++;
    if (object.visible) {
      visibleObjects++;
    }

    // Only count vertices for meshes (skip memory estimation)
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      const positionAttr = mesh.geometry.attributes?.position;
      if (positionAttr) {
        totalVertices += positionAttr.count;
      }
    }
  });

  return {
    totalObjects,
    visibleObjects,
    totalVertices,
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

