import type * as THREE from 'three';

import type {
  RendererAdapter,
  FrameStats,
  RenderTargetInfo,
  TextureInfo,
  GeometryInfo,
  MaterialInfo,
  PipelineInfo,
  GpuTimingInfo,
  Unsubscribe,
  MemoryStats,
  RenderingStats,
} from '../types';

import { WebGpuTimingManager, type GpuFrameTiming } from './webgpu-timing';

/**
 * WebGPU Renderer type from Three.js
 * 
 * Three.js exposes WebGPURenderer with specific properties:
 * - isWebGPURenderer: boolean (always true for WebGPURenderer)
 * - backend: WebGPUBackend
 * - info: similar to WebGLRenderer.info but adapted for WebGPU
 * 
 * @see https://threejs.org/docs/?q=renderer#WebGPURenderer
 */
interface WebGPURenderer extends THREE.Renderer {
  readonly isWebGPURenderer: true;
  
  // Info object similar to WebGLRenderer
  readonly info: WebGPURendererInfo;
  
  // Backend access
  readonly backend?: WebGPUBackend;
  
  // Compute capabilities
  compute?(computeNodes: unknown): Promise<void>;
  computeAsync?(computeNodes: unknown): Promise<void>;
  
  // Async rendering
  renderAsync?(scene: THREE.Scene, camera: THREE.Camera): Promise<void>;
  
  // Standard renderer methods
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  setSize(width: number, height: number, updateStyle?: boolean): void;
  dispose(): void;
  
  // Node material support
  readonly coordinateSystem: number;
}

/**
 * WebGPU Backend interface
 */
interface WebGPUBackend {
  device?: GPUDevice;
  context?: GPUCanvasContext;
  adapter?: GPUAdapter;
  
  // Timestamp query support
  timestampQuerySet?: GPUQuerySet;
  hasTimestampQuery?: boolean;
  
  // Pipeline cache
  pipelines?: Map<string, GPURenderPipeline | GPUComputePipeline>;
  
  // Buffer management
  buffers?: Map<unknown, GPUBuffer>;
  textures?: Map<unknown, GPUTexture>;
}

/**
 * WebGPU Renderer info structure
 */
interface WebGPURendererInfo {
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
  autoReset?: boolean;
}

/**
 * Scene analysis data
 */
interface SceneAnalysis {
  lights: LightInfo[];
  shadowLights: number;
  animations: number;
}

interface LightInfo {
  type: string;
  castShadow: boolean;
  color?: { r: number; g: number; b: number };
  intensity?: number;
}

/**
 * Check if a renderer is a WebGPURenderer
 * 
 * @see https://threejs.org/docs/?q=renderer#WebGPURenderer.isWebGPURenderer
 */
export function isWebGPURenderer(renderer: unknown): renderer is WebGPURenderer {
  return (
    renderer !== null &&
    typeof renderer === 'object' &&
    'isWebGPURenderer' in renderer &&
    (renderer as WebGPURenderer).isWebGPURenderer === true
  );
}

/**
 * Create a WebGPU renderer adapter for Three.js WebGPURenderer
 * 
 * This adapter provides performance metrics and resource tracking
 * specifically optimized for WebGPU's architecture.
 * 
 * @param renderer - Three.js WebGPURenderer instance
 * @returns RendererAdapter for WebGPU
 * 
 * @example
 * ```typescript
 * import { WebGPURenderer } from 'three/webgpu';
 * import { createWebGPUAdapter, isWebGPURenderer } from '@3lens/core';
 * 
 * const renderer = new WebGPURenderer();
 * await renderer.init();
 * 
 * if (isWebGPURenderer(renderer)) {
 *   const adapter = createWebGPUAdapter(renderer);
 *   probe.setRendererAdapter(adapter);
 * }
 * ```
 */
export function createWebGPUAdapter(
  renderer: WebGPURenderer
): RendererAdapter {
  const frameCallbacks: Array<(stats: FrameStats) => void> = [];
  let frameCount = 0;
  let disposed = false;

  // Performance tracking
  let lastFrameTime = performance.now();
  let minFrameTime = Infinity;
  let maxFrameTime = 0;
  let totalFrameTime = 0;
  let frameTimeCount = 0;

  // Store original render methods
  const originalRender = renderer.render.bind(renderer);
  const originalRenderAsync = renderer.renderAsync?.bind(renderer);

  // Scene analysis - cached
  let cachedSceneAnalysis: SceneAnalysis | null = null;

  // Cached resource lists
  let cachedTextures: TextureInfo[] = [];
  let cachedGeometries: GeometryInfo[] = [];
  let cachedMaterials: MaterialInfo[] = [];
  let cachedPipelines: PipelineInfo[] = [];
  let lastResourceScan = 0;
  const resourceScanInterval = 2000;

  // Current scene reference
  let currentScene: THREE.Scene | null = null;

  // GPU timing with timestamp queries
  let lastGpuTime = 0;
  let gpuTimingEnabled = false;
  let gpuTimingManager: WebGpuTimingManager | null = null;
  let gpuTimingInitialized = false;
  let lastGpuTiming: GpuFrameTiming | null = null;

  // Try to detect if timestamp queries are available and initialize timing
  const backend = renderer.backend;
  const device = backend?.device;
  
  if (device?.features.has('timestamp-query')) {
    gpuTimingEnabled = true;
    gpuTimingManager = new WebGpuTimingManager({
      maxHistorySize: 120,
      maxPassesPerFrame: 16,
    });
    
    // Initialize async
    gpuTimingManager.initialize(device).then((success) => {
      gpuTimingInitialized = success;
      if (success) {
        console.log('[3Lens WebGPU] GPU timing initialized with timestamp queries');
      }
    }).catch(() => {
      gpuTimingInitialized = false;
    });
  } else if (backend?.hasTimestampQuery) {
    gpuTimingEnabled = true;
  }

  /**
   * Collect frame statistics
   */
  function collectFrameStats(
    scene: THREE.Scene,
    camera: THREE.Camera,
    cpuTimeMs: number
  ): FrameStats {
    const now = performance.now();
    const info = renderer.info as WebGPURendererInfo;

    // Update timing stats
    if (cpuTimeMs < minFrameTime) minFrameTime = cpuTimeMs;
    if (cpuTimeMs > maxFrameTime) maxFrameTime = cpuTimeMs;
    totalFrameTime += cpuTimeMs;
    frameTimeCount++;

    // Calculate averages
    const avgFrameTime = frameTimeCount > 0 ? totalFrameTime / frameTimeCount : cpuTimeMs;

    // Analyze scene if needed
    if (!cachedSceneAnalysis) {
      cachedSceneAnalysis = analyzeScene(scene);
    }

    // Scan resources periodically
    if (now - lastResourceScan > resourceScanInterval) {
      lastResourceScan = now;
      scanSceneResources(scene);
      scanPipelines();
    }

    // Build memory stats
    const memory: MemoryStats = buildMemoryStats(info);

    // Build rendering stats
    const rendering: RenderingStats = buildRenderingStats(scene, info, cachedSceneAnalysis);

    // Camera info
    const cameraInfo = extractCameraInfo(camera);

    // Get GPU timing from timestamp queries
    const gpuTiming = lastGpuTiming;
    const gpuTimeMs = gpuTiming?.totalMs ?? (lastGpuTime > 0 ? lastGpuTime : undefined);

    const stats: FrameStats = {
      timestamp: now,
      frameNumber: frameCount,
      cpuTimeMs,
      gpuTimeMs,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
      geometryCount: info.memory.geometries,
      textureCount: info.memory.textures,
      memory,
      rendering,
      performance: {
        fpsSmoothed: cpuTimeMs > 0 ? 1000 / cpuTimeMs : 0,
        fpsMin: maxFrameTime > 0 ? 1000 / maxFrameTime : 0,
        fpsMax: minFrameTime > 0 && minFrameTime < Infinity ? 1000 / minFrameTime : 0,
      },
      camera: cameraInfo,
      backend: 'webgpu' as const,
      webgpuExtras: {
        pipelinesUsed: cachedPipelines.length,
        bindGroupsUsed: 0, // Would need deeper instrumentation
        buffersUsed: 0, // Would need deeper instrumentation
        computePasses: 0, // Would need deeper instrumentation
        renderPasses: 1, // At minimum, the main render pass
        gpuTiming: gpuTiming ? {
          totalMs: gpuTiming.totalMs,
          passes: gpuTiming.passes.map(p => ({
            name: p.name,
            durationMs: p.durationMs,
          })),
          breakdown: gpuTiming.breakdown,
        } : undefined,
      },
    };

    return stats;
  }

  /**
   * Wrap synchronous render
   */
  renderer.render = function (scene: THREE.Scene, camera: THREE.Camera): void {
    if (disposed) {
      originalRender(scene, camera);
      return;
    }

    currentScene = scene;

    if (frameCallbacks.length === 0) {
      originalRender(scene, camera);
      frameCount++;
      return;
    }

    const startTime = performance.now();

    // Reset info before render
    if (renderer.info.autoReset === false) {
      renderer.info.render.calls = 0;
      renderer.info.render.triangles = 0;
      renderer.info.render.points = 0;
      renderer.info.render.lines = 0;
    }

    originalRender(scene, camera);

    const cpuTimeMs = performance.now() - startTime;
    frameCount++;
    lastFrameTime = performance.now();

    const stats = collectFrameStats(scene, camera, cpuTimeMs);

    // Notify callbacks
    for (const callback of frameCallbacks) {
      try {
        callback(stats);
      } catch (e) {
        console.warn('[3Lens WebGPU] Frame callback error:', e);
      }
    }
  };

  /**
   * Wrap async render (WebGPU specific)
   */
  if (originalRenderAsync) {
    renderer.renderAsync = async function (
      scene: THREE.Scene,
      camera: THREE.Camera
    ): Promise<void> {
      if (disposed) {
        await originalRenderAsync(scene, camera);
        return;
      }

      currentScene = scene;

      if (frameCallbacks.length === 0) {
        await originalRenderAsync(scene, camera);
        frameCount++;
        return;
      }

      const startTime = performance.now();

      // Reset info before render
      if (renderer.info.autoReset === false) {
        renderer.info.render.calls = 0;
        renderer.info.render.triangles = 0;
        renderer.info.render.points = 0;
        renderer.info.render.lines = 0;
      }

      await originalRenderAsync(scene, camera);

      const cpuTimeMs = performance.now() - startTime;
      frameCount++;
      lastFrameTime = performance.now();

      const stats = collectFrameStats(scene, camera, cpuTimeMs);

      // Notify callbacks
      for (const callback of frameCallbacks) {
        try {
          callback(stats);
        } catch (e) {
          console.warn('[3Lens WebGPU] Frame callback error:', e);
        }
      }
    };
  }

  /**
   * Analyze scene for lights and animations
   */
  function analyzeScene(scene: THREE.Scene): SceneAnalysis {
    const lights: LightInfo[] = [];
    let shadowLights = 0;
    let animations = 0;

    scene.traverse((obj: THREE.Object3D) => {
      // Check for lights
      if ('isLight' in obj && obj.isLight) {
        const light = obj as THREE.Light;
        const lightInfo: LightInfo = {
          type: obj.type,
          castShadow: light.castShadow ?? false,
        };

        if ('color' in light && light.color) {
          lightInfo.color = {
            r: (light.color as THREE.Color).r,
            g: (light.color as THREE.Color).g,
            b: (light.color as THREE.Color).b,
          };
        }
        if ('intensity' in light) {
          lightInfo.intensity = light.intensity as number;
        }

        lights.push(lightInfo);
        if (light.castShadow) shadowLights++;
      }

      // Check for animations
      if ('animations' in obj && Array.isArray((obj as { animations?: unknown[] }).animations)) {
        animations += (obj as { animations: unknown[] }).animations.length;
      }
    });

    return { lights, shadowLights, animations };
  }

  /**
   * Scan scene for resources
   */
  function scanSceneResources(scene: THREE.Scene): void {
    const textures = new Map<string, TextureInfo>();
    const geometries = new Map<string, GeometryInfo>();
    const materials = new Map<string, MaterialInfo>();

    scene.traverse((obj: THREE.Object3D) => {
      // Collect geometries
      if ('geometry' in obj && obj.geometry) {
        const geom = obj.geometry as THREE.BufferGeometry;
        if (!geometries.has(geom.uuid)) {
          geometries.set(geom.uuid, extractGeometryInfo(geom));
        }
      }

      // Collect materials
      if ('material' in obj && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of mats) {
          if (mat && !materials.has(mat.uuid)) {
            materials.set(mat.uuid, extractMaterialInfo(mat));

            // Collect textures from material
            collectTexturesFromMaterial(mat, textures);
          }
        }
      }
    });

    cachedTextures = Array.from(textures.values());
    cachedGeometries = Array.from(geometries.values());
    cachedMaterials = Array.from(materials.values());
  }

  /**
   * Scan for WebGPU pipelines
   */
  function scanPipelines(): void {
    const pipelines: PipelineInfo[] = [];

    // Access backend's pipeline cache if available
    const pipelineCache = renderer.backend?.pipelines;
    if (pipelineCache) {
      let idx = 0;
      for (const [key] of pipelineCache) {
        pipelines.push({
          id: `pipeline-${idx++}`,
          type: 'render', // Would need deeper inspection to determine
          usedByMaterials: [],
        });
      }
    }

    cachedPipelines = pipelines;
  }

  /**
   * Extract geometry info
   */
  function extractGeometryInfo(geom: THREE.BufferGeometry): GeometryInfo {
    const position = geom.attributes.position;
    const index = geom.index;
    const vertexCount = position?.count ?? 0;
    const indexCount = index?.count ?? 0;
    const faceCount = index ? Math.floor(indexCount / 3) : Math.floor(vertexCount / 3);

    // Estimate memory
    let memoryBytes = 0;
    for (const name in geom.attributes) {
      const attr = geom.attributes[name] as THREE.BufferAttribute;
      if (attr.array) {
        memoryBytes += attr.array.byteLength;
      }
    }
    if (index?.array) {
      memoryBytes += index.array.byteLength;
    }

    return {
      ref: geom.uuid,
      type: geom.type,
      name: geom.name || undefined,
      vertexCount,
      indexCount: indexCount || undefined,
      faceCount,
      estimatedMemoryBytes: memoryBytes,
    };
  }

  /**
   * Extract material info
   */
  function extractMaterialInfo(mat: THREE.Material): MaterialInfo {
    return {
      ref: mat.uuid,
      type: mat.type,
      name: mat.name || undefined,
      color: 'color' in mat && mat.color ? (mat.color as THREE.Color).getHex() : undefined,
      opacity: mat.opacity,
      transparent: mat.transparent,
      visible: mat.visible,
    };
  }

  /**
   * Collect textures from a material
   */
  function collectTexturesFromMaterial(
    mat: THREE.Material,
    textures: Map<string, TextureInfo>
  ): void {
    const textureProps = [
      'map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap',
      'emissiveMap', 'displacementMap', 'alphaMap', 'envMap',
      'lightMap', 'bumpMap', 'specularMap', 'gradientMap',
    ];

    for (const prop of textureProps) {
      const tex = (mat as unknown as Record<string, THREE.Texture | null>)[prop];
      if (tex && !textures.has(tex.uuid)) {
        textures.set(tex.uuid, extractTextureInfo(tex, mat.uuid));
      }
    }
  }

  /**
   * Extract texture info
   */
  function extractTextureInfo(tex: THREE.Texture, materialUuid: string): TextureInfo {
    const width = tex.image?.width ?? 0;
    const height = tex.image?.height ?? 0;

    // Estimate memory (assume RGBA8 format)
    const bytesPerPixel = 4;
    const mipmapLevels = tex.generateMipmaps ? Math.floor(Math.log2(Math.max(width, height))) + 1 : 1;
    let memoryBytes = 0;
    let mipWidth = width;
    let mipHeight = height;
    for (let i = 0; i < mipmapLevels; i++) {
      memoryBytes += mipWidth * mipHeight * bytesPerPixel;
      mipWidth = Math.max(1, Math.floor(mipWidth / 2));
      mipHeight = Math.max(1, Math.floor(mipHeight / 2));
    }

    return {
      ref: tex.uuid,
      type: tex.type?.toString() ?? 'Texture',
      name: tex.name || undefined,
      width,
      height,
      format: tex.format,
      estimatedMemoryBytes: memoryBytes,
      usedByMaterials: [materialUuid],
    };
  }

  /**
   * Build memory stats
   */
  function buildMemoryStats(info: WebGPURendererInfo): MemoryStats {
    const textureMemory = cachedTextures.reduce((sum, t) => sum + t.estimatedMemoryBytes, 0);
    const geometryMemory = cachedGeometries.reduce((sum, g) => sum + g.estimatedMemoryBytes, 0);

    return {
      totalGpuMemory: textureMemory + geometryMemory,
      textureMemory,
      geometryMemory,
      renderTargetMemory: 0, // Would need deeper tracking
      textureCount: info.memory.textures,
      geometryCount: info.memory.geometries,
      renderTargetCount: 0,
      jsHeapSize: (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize,
    };
  }

  /**
   * Build rendering stats
   */
  function buildRenderingStats(
    _scene: THREE.Scene,
    info: WebGPURendererInfo,
    analysis: SceneAnalysis
  ): RenderingStats {
    return {
      lightCount: analysis.lights.length,
      shadowMapCount: analysis.shadowLights,
      animationsPlaying: analysis.animations,
      stateChanges: info.render.calls, // Approximate
    };
  }

  /**
   * Extract camera info
   */
  function extractCameraInfo(camera: THREE.Camera): FrameStats['camera'] {
    return {
      type: camera.type,
      fov: 'fov' in camera ? (camera as THREE.PerspectiveCamera).fov : undefined,
      aspect: 'aspect' in camera ? (camera as THREE.PerspectiveCamera).aspect : undefined,
      near: 'near' in camera ? (camera as THREE.PerspectiveCamera).near : undefined,
      far: 'far' in camera ? (camera as THREE.PerspectiveCamera).far : undefined,
      position: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      },
    };
  }

  // Return the adapter
  const adapter: RendererAdapter = {
    kind: 'webgpu',

    observeFrame(callback: (stats: FrameStats) => void): Unsubscribe {
      frameCallbacks.push(callback);
      return () => {
        const index = frameCallbacks.indexOf(callback);
        if (index !== -1) {
          frameCallbacks.splice(index, 1);
        }
      };
    },

    getRenderTargets(): RenderTargetInfo[] {
      // WebGPU render targets would need specific tracking
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

    getPipelines(): PipelineInfo[] {
      return cachedPipelines;
    },

    async getGpuTimings(): Promise<GpuTimingInfo> {
      // WebGPU timestamp queries would need deeper integration
      // For now, return an estimate based on frame time
      return {
        totalMs: lastGpuTime,
        breakdown: gpuTimingEnabled
          ? {
              render: lastGpuTime,
            }
          : undefined,
      };
    },

    dispose(): void {
      disposed = true;
      frameCallbacks.length = 0;
      cachedSceneAnalysis = null;
      cachedTextures = [];
      cachedGeometries = [];
      cachedMaterials = [];
      cachedPipelines = [];

      // Restore original render methods
      renderer.render = originalRender;
      if (originalRenderAsync) {
        renderer.renderAsync = originalRenderAsync;
      }
    },
  };

  return adapter;
}

/**
 * Get WebGPU device limits and capabilities
 */
export function getWebGPUCapabilities(renderer: WebGPURenderer): WebGPUCapabilities | null {
  const backend = renderer.backend;
  const device = backend?.device;
  const adapter = backend?.adapter;

  if (!device) {
    return null;
  }

  const limits = device.limits;

  return {
    // Device info
    deviceLabel: device.label ?? 'Unknown',

    // Adapter features
    features: Array.from(device.features),

    // Limits
    maxTextureDimension2D: limits.maxTextureDimension2D,
    maxTextureArrayLayers: limits.maxTextureArrayLayers,
    maxBindGroups: limits.maxBindGroups,
    maxBindingsPerBindGroup: limits.maxBindingsPerBindGroup,
    maxDynamicUniformBuffersPerPipelineLayout: limits.maxDynamicUniformBuffersPerPipelineLayout,
    maxDynamicStorageBuffersPerPipelineLayout: limits.maxDynamicStorageBuffersPerPipelineLayout,
    maxSampledTexturesPerShaderStage: limits.maxSampledTexturesPerShaderStage,
    maxSamplersPerShaderStage: limits.maxSamplersPerShaderStage,
    maxStorageBuffersPerShaderStage: limits.maxStorageBuffersPerShaderStage,
    maxStorageTexturesPerShaderStage: limits.maxStorageTexturesPerShaderStage,
    maxUniformBuffersPerShaderStage: limits.maxUniformBuffersPerShaderStage,
    maxUniformBufferBindingSize: limits.maxUniformBufferBindingSize,
    maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
    maxVertexBuffers: limits.maxVertexBuffers,
    maxVertexAttributes: limits.maxVertexAttributes,
    maxVertexBufferArrayStride: limits.maxVertexBufferArrayStride,
    maxComputeWorkgroupStorageSize: limits.maxComputeWorkgroupStorageSize,
    maxComputeInvocationsPerWorkgroup: limits.maxComputeInvocationsPerWorkgroup,
    maxComputeWorkgroupSizeX: limits.maxComputeWorkgroupSizeX,
    maxComputeWorkgroupSizeY: limits.maxComputeWorkgroupSizeY,
    maxComputeWorkgroupSizeZ: limits.maxComputeWorkgroupSizeZ,
    maxComputeWorkgroupsPerDimension: limits.maxComputeWorkgroupsPerDimension,

    // Timestamp query support
    hasTimestampQuery: device.features.has('timestamp-query'),
  };
}

/**
 * WebGPU capabilities interface
 */
export interface WebGPUCapabilities {
  deviceLabel: string;
  features: string[];
  maxTextureDimension2D: number;
  maxTextureArrayLayers: number;
  maxBindGroups: number;
  maxBindingsPerBindGroup: number;
  maxDynamicUniformBuffersPerPipelineLayout: number;
  maxDynamicStorageBuffersPerPipelineLayout: number;
  maxSampledTexturesPerShaderStage: number;
  maxSamplersPerShaderStage: number;
  maxStorageBuffersPerShaderStage: number;
  maxStorageTexturesPerShaderStage: number;
  maxUniformBuffersPerShaderStage: number;
  maxUniformBufferBindingSize: number;
  maxStorageBufferBindingSize: number;
  maxVertexBuffers: number;
  maxVertexAttributes: number;
  maxVertexBufferArrayStride: number;
  maxComputeWorkgroupStorageSize: number;
  maxComputeInvocationsPerWorkgroup: number;
  maxComputeWorkgroupSizeX: number;
  maxComputeWorkgroupSizeY: number;
  maxComputeWorkgroupSizeZ: number;
  maxComputeWorkgroupsPerDimension: number;
  hasTimestampQuery: boolean;
}

/**
 * Extended WebGPU adapter interface with additional WebGPU-specific methods
 */
export interface WebGPURendererAdapter extends RendererAdapter {
  kind: 'webgpu';
  
  /**
   * Get detailed pipeline information
   */
  getDetailedPipelines(): DetailedPipelineInfo[];
  
  /**
   * Get bind group information
   */
  getBindGroups(): WebGPUBindGroupInfo[];
  
  /**
   * Get shader source for a pipeline
   */
  getShaderSource(pipelineId: string): string | null;
  
  /**
   * Get the WebGPU device
   */
  getDevice(): GPUDevice | null;
  
  /**
   * Get WebGPU capabilities
   */
  getCapabilities(): WebGPUCapabilities | null;
}

/**
 * Detailed pipeline info with WGSL source
 */
export interface DetailedPipelineInfo {
  id: string;
  label: string;
  type: 'render' | 'compute';
  
  // Shader info
  vertexShader?: ShaderStageInfo;
  fragmentShader?: ShaderStageInfo;
  computeShader?: ShaderStageInfo;
  
  // Render state
  primitive?: {
    topology: string;
    cullMode: string;
    frontFace: string;
  };
  
  depthStencil?: {
    format: string;
    depthWriteEnabled: boolean;
    depthCompare: string;
  };
  
  colorTargets?: Array<{
    format: string;
    blend?: {
      color: string;
      alpha: string;
    };
  }>;
  
  multisample?: {
    count: number;
    mask: number;
    alphaToCoverageEnabled: boolean;
  };
  
  // Bind groups
  bindGroupLayouts: Array<{
    index: number;
    entries: BindGroupLayoutEntryDetail[];
  }>;
  
  // Stats
  usageCount: number;
  lastUsedFrame: number;
  createdAt: number;
}

/**
 * Shader stage info
 */
export interface ShaderStageInfo {
  entryPoint: string;
  source?: string;
  constants?: Record<string, number>;
}

/**
 * Bind group layout entry detail
 */
export interface BindGroupLayoutEntryDetail {
  binding: number;
  visibility: ('VERTEX' | 'FRAGMENT' | 'COMPUTE')[];
  resourceType: 'buffer' | 'sampler' | 'texture' | 'storageTexture' | 'externalTexture';
  
  // Buffer specifics
  bufferType?: 'uniform' | 'storage' | 'read-only-storage';
  bufferHasDynamicOffset?: boolean;
  bufferMinBindingSize?: number;
  
  // Sampler specifics
  samplerType?: 'filtering' | 'non-filtering' | 'comparison';
  
  // Texture specifics
  textureSampleType?: 'float' | 'unfilterable-float' | 'depth' | 'sint' | 'uint';
  textureViewDimension?: string;
  textureMultisampled?: boolean;
  
  // Storage texture specifics
  storageTextureAccess?: 'write-only' | 'read-only' | 'read-write';
  storageTextureFormat?: string;
}

/**
 * WebGPU bind group info
 */
export interface WebGPUBindGroupInfo {
  id: string;
  label: string;
  layoutIndex: number;
  entries: WebGPUBindGroupEntryInfo[];
  usedByPipelines: string[];
}

/**
 * WebGPU bind group entry info
 */
export interface WebGPUBindGroupEntryInfo {
  binding: number;
  resourceType: 'buffer' | 'sampler' | 'texture';
  
  // Buffer info
  buffer?: {
    label: string;
    size: number;
    usage: string[];
    offset: number;
    bindingSize: number;
  };
  
  // Sampler info
  sampler?: {
    label: string;
    addressModeU: string;
    addressModeV: string;
    addressModeW: string;
    magFilter: string;
    minFilter: string;
    mipmapFilter: string;
    compare?: string;
    maxAnisotropy: number;
  };
  
  // Texture info
  textureView?: {
    label: string;
    format: string;
    dimension: string;
    baseMipLevel: number;
    mipLevelCount: number;
    baseArrayLayer: number;
    arrayLayerCount: number;
  };
}

/**
 * Create an extended WebGPU adapter with detailed pipeline/bind group tracking
 */
export function createExtendedWebGPUAdapter(
  renderer: { isWebGPURenderer: true; backend?: WebGPUBackend; info: WebGPURendererInfo } & THREE.Renderer
): WebGPURendererAdapter {
  // Get the base adapter
  const baseAdapter = createWebGPUAdapter(renderer as unknown as Parameters<typeof createWebGPUAdapter>[0]);
  
  // Track detailed pipeline info
  const detailedPipelines = new Map<string, DetailedPipelineInfo>();
  const bindGroups = new Map<string, WebGPUBindGroupInfo>();
  const shaderSources = new Map<string, string>();
  
  // Extended adapter
  const extendedAdapter: WebGPURendererAdapter = {
    ...baseAdapter,
    kind: 'webgpu',
    
    getDetailedPipelines(): DetailedPipelineInfo[] {
      // Collect from backend if available
      const backend = renderer.backend;
      if (!backend?.pipelines) {
        // Return basic info from base adapter
        return baseAdapter.getPipelines?.()?.map(p => ({
          id: p.id,
          label: p.label ?? p.id,
          type: p.type,
          bindGroupLayouts: [],
          usageCount: p.usageCount ?? 0,
          lastUsedFrame: 0,
          createdAt: p.createdAt ?? Date.now(),
        })) ?? [];
      }
      
      return Array.from(detailedPipelines.values());
    },
    
    getBindGroups(): WebGPUBindGroupInfo[] {
      return Array.from(bindGroups.values());
    },
    
    getShaderSource(pipelineId: string): string | null {
      return shaderSources.get(pipelineId) ?? null;
    },
    
    getDevice(): GPUDevice | null {
      return renderer.backend?.device ?? null;
    },
    
    getCapabilities(): WebGPUCapabilities | null {
      return getWebGPUCapabilities(renderer as unknown as Parameters<typeof getWebGPUCapabilities>[0]);
    },
  };
  
  return extendedAdapter;
}
