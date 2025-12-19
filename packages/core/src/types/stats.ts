import type { RendererKind } from './adapter';

/**
 * Per-frame statistics
 */
export interface FrameStats {
  /**
   * Frame number
   */
  frame: number;

  /**
   * Timestamp (performance.now())
   */
  timestamp: number;

  /**
   * CPU frame time in milliseconds
   */
  cpuTimeMs: number;

  /**
   * GPU frame time in milliseconds (if available)
   */
  gpuTimeMs?: number;

  /**
   * Total triangles rendered
   */
  triangles: number;

  /**
   * Total draw calls
   */
  drawCalls: number;

  /**
   * Total points rendered
   */
  points: number;

  /**
   * Total lines rendered
   */
  lines: number;

  /**
   * Number of visible objects
   */
  objectsVisible: number;

  /**
   * Total number of objects
   */
  objectsTotal: number;

  /**
   * Number of materials used
   */
  materialsUsed: number;

  /**
   * Renderer backend type
   */
  backend: RendererKind;

  /**
   * WebGL-specific extras
   */
  webglExtras?: WebGLFrameExtras;

  /**
   * WebGPU-specific extras
   */
  webgpuExtras?: WebGPUFrameExtras;

  /**
   * Rule violations (if any)
   */
  violations?: RuleViolation[];
}

/**
 * WebGL-specific frame statistics
 */
export interface WebGLFrameExtras {
  programSwitches: number;
  textureBindings: number;
  geometryCount: number;
  textureCount: number;
  programs: number;
}

/**
 * WebGPU-specific frame statistics
 */
export interface WebGPUFrameExtras {
  pipelinesUsed: number;
  bindGroupsUsed: number;
  buffersUsed: number;
  timestampBreakdown?: Record<string, number>;
}

/**
 * Rule violation information
 */
export interface RuleViolation {
  ruleId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  value?: number;
  threshold?: number;
}

