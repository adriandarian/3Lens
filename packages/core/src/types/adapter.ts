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
}

/**
 * GPU timing information
 */
export interface GpuTimingInfo {
  totalMs: number;
  breakdown?: Record<string, number>;
}

