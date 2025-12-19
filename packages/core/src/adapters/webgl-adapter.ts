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
 * Create a WebGL renderer adapter
 */
export function createWebGLAdapter(
  renderer: THREE.WebGLRenderer
): RendererAdapter {
  const frameCallbacks: Array<(stats: FrameStats) => void> = [];
  let frameCount = 0;
  let disposed = false;

  // GPU timing support
  const gl = renderer.getContext();
  const timerExt = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  let pendingGpuTime: number | null = null;

  // Store original render method
  const originalRender = renderer.render.bind(renderer);

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

    // Call original render
    originalRender(scene, camera);

    const endTime = performance.now();
    const cpuTime = endTime - startTime;

    // Collect stats from renderer.info
    const info = renderer.info;
    const stats: FrameStats = {
      frame: frameCount++,
      timestamp: endTime,
      cpuTimeMs: cpuTime,
      gpuTimeMs: pendingGpuTime ?? undefined,
      triangles: info.render.triangles,
      drawCalls: info.render.calls,
      points: info.render.points,
      lines: info.render.lines,
      objectsVisible: info.render.calls, // Approximation
      objectsTotal: info.memory.geometries,
      materialsUsed: info.programs?.length ?? 0,
      backend: 'webgl',
      webglExtras: {
        programSwitches: info.programs?.length ?? 0,
        textureBindings: info.memory.textures,
        geometryCount: info.memory.geometries,
        textureCount: info.memory.textures,
        programs: info.programs?.length ?? 0,
      },
    };

    // Reset renderer info for next frame
    info.reset();

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
    },
  };
}

