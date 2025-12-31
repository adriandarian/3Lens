import type { Unsubscribe } from './common';
import type { FrameStats } from './stats';

/**
 * Renderer backend type
 */
export type RendererKind = 'webgl' | 'webgpu';

/**
 * Adapter interface for different renderer backends
 */
export interface RendererAdapter {
  /**
   * Renderer backend type
   */
  readonly kind: RendererKind;

  /**
   * Subscribe to frame rendering
   */
  observeFrame(callback: (stats: FrameStats) => void): Unsubscribe;

  /**
   * Get all render targets
   */
  getRenderTargets(): RenderTargetInfo[];

  /**
   * Get all textures
   */
  getTextures(): TextureInfo[];

  /**
   * Get all geometries
   */
  getGeometries(): GeometryInfo[];

  /**
   * Get all materials
   */
  getMaterials(): MaterialInfo[];

  /**
   * WebGL: Get shader programs
   */
  getPrograms?(): ProgramInfo[];

  /**
   * WebGPU: Get render/compute pipelines
   */
  getPipelines?(): PipelineInfo[];

  /**
   * Get GPU timing information
   */
  getGpuTimings?(): Promise<GpuTimingInfo>;

  /**
   * Clean up resources
   */
  dispose(): void;
}

/**
 * Render target information
 */
export interface RenderTargetInfo {
  ref: string;
  name?: string;
  width: number;
  height: number;
  samples: number;
  estimatedMemoryBytes: number;
}

/**
 * Texture information
 */
export interface TextureInfo {
  ref: string;
  type: string;
  name?: string;
  width: number;
  height: number;
  format: number;
  estimatedMemoryBytes: number;
  usedByMaterials: string[];
}

/**
 * Geometry information
 */
export interface GeometryInfo {
  ref: string;
  type: string;
  name?: string;
  vertexCount: number;
  indexCount?: number;
  faceCount: number;
  estimatedMemoryBytes: number;
}

/**
 * Material information
 */
export interface MaterialInfo {
  ref: string;
  type: string;
  name?: string;
  color?: number;
  opacity: number;
  transparent: boolean;
  visible: boolean;
}

/**
 * WebGL shader program information
 */
export interface ProgramInfo {
  id: string;
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, unknown>;
  attributes: string[];
  usedByMaterials: string[];
}

/**
 * WebGPU pipeline information
 */
export interface PipelineInfo {
  id: string;
  type: 'render' | 'compute';
  vertexStage?: string;
  fragmentStage?: string;
  computeStage?: string;
  usedByMaterials: string[];

  /**
   * Pipeline label (if set)
   */
  label?: string;

  /**
   * Vertex buffer layouts
   */
  vertexBuffers?: VertexBufferLayoutInfo[];

  /**
   * Bind group layouts
   */
  bindGroupLayouts?: BindGroupLayoutInfo[];

  /**
   * Render pipeline specific
   */
  renderState?: {
    topology?: string;
    cullMode?: string;
    frontFace?: string;
    depthWriteEnabled?: boolean;
    depthCompare?: string;
    colorFormats?: string[];
    depthStencilFormat?: string;
    sampleCount?: number;
  };

  /**
   * Compute pipeline specific
   */
  computeState?: {
    workgroupSize?: [number, number, number];
  };

  /**
   * Shader source (WGSL)
   */
  shaderSource?: string;

  /**
   * When this pipeline was created
   */
  createdAt?: number;

  /**
   * Usage count this frame
   */
  usageCount?: number;
}

/**
 * Vertex buffer layout information
 */
export interface VertexBufferLayoutInfo {
  arrayStride: number;
  stepMode: 'vertex' | 'instance';
  attributes: VertexAttributeInfo[];
}

/**
 * Vertex attribute information
 */
export interface VertexAttributeInfo {
  format: string;
  offset: number;
  shaderLocation: number;
}

/**
 * Bind group layout information
 */
export interface BindGroupLayoutInfo {
  index: number;
  entries: BindGroupLayoutEntryInfo[];
}

/**
 * Bind group layout entry information
 */
export interface BindGroupLayoutEntryInfo {
  binding: number;
  visibility: string[];
  type: 'buffer' | 'sampler' | 'texture' | 'storageTexture' | 'externalTexture';
  bufferType?: 'uniform' | 'storage' | 'read-only-storage';
  samplerType?: 'filtering' | 'non-filtering' | 'comparison';
  textureType?: string;
  textureSampleType?: 'float' | 'unfilterable-float' | 'depth' | 'sint' | 'uint';
}

/**
 * Bind group information
 */
export interface BindGroupInfo {
  id: string;
  layoutId: string;
  label?: string;
  entries: BindGroupEntryInfo[];
  usedByPipelines: string[];
}

/**
 * Bind group entry information
 */
export interface BindGroupEntryInfo {
  binding: number;
  type: 'buffer' | 'sampler' | 'texture';
  resourceId: string;
  resourceLabel?: string;
  bufferOffset?: number;
  bufferSize?: number;
}

/**
 * GPU timing information
 */
export interface GpuTimingInfo {
  totalMs: number;
  breakdown?: Record<string, number>;
}

