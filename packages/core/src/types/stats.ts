import type { RendererKind } from './adapter';

/**
 * Per-frame statistics with comprehensive performance metrics
 */
export interface FrameStats {
  /**
   * Frame number (monotonically increasing)
   */
  frame: number;

  /**
   * Timestamp (performance.now())
   */
  timestamp: number;

  /**
   * Time since last frame in milliseconds
   */
  deltaTimeMs: number;

  /**
   * CPU frame time in milliseconds (time spent in JS/render call)
   */
  cpuTimeMs: number;

  /**
   * GPU frame time in milliseconds (if available via timer queries)
   */
  gpuTimeMs?: number;

  // ─────────────────────────────────────────────────────────────────
  // GEOMETRY METRICS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Total triangles rendered this frame
   */
  triangles: number;

  /**
   * Total draw calls this frame
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
   * Total vertices processed
   */
  vertices: number;

  // ─────────────────────────────────────────────────────────────────
  // OBJECT METRICS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Number of visible objects rendered
   */
  objectsVisible: number;

  /**
   * Total number of objects in scene
   */
  objectsTotal: number;

  /**
   * Objects culled by frustum culling
   */
  objectsCulled: number;

  /**
   * Number of materials used this frame
   */
  materialsUsed: number;

  // ─────────────────────────────────────────────────────────────────
  // MEMORY METRICS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Memory usage estimates and tracking
   */
  memory: MemoryStats;

  // ─────────────────────────────────────────────────────────────────
  // PERFORMANCE METRICS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Derived performance metrics
   */
  performance: PerformanceMetrics;

  // ─────────────────────────────────────────────────────────────────
  // RENDERING DETAILS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Detailed rendering statistics
   */
  rendering: RenderingStats;

  // ─────────────────────────────────────────────────────────────────
  // BACKEND INFO
  // ─────────────────────────────────────────────────────────────────

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

  /**
   * Performance benchmark score (0-100)
   */
  benchmarkScore?: BenchmarkScore;
}

/**
 * Memory usage statistics
 */
export interface MemoryStats {
  /**
   * Number of geometries in memory
   */
  geometries: number;

  /**
   * Number of textures in memory
   */
  textures: number;

  /**
   * Estimated geometry memory in bytes (vertex + index buffers)
   */
  geometryMemory: number;

  /**
   * Estimated texture memory in bytes
   */
  textureMemory: number;

  /**
   * Total estimated GPU memory in bytes
   */
  totalGpuMemory: number;

  /**
   * Number of render targets
   */
  renderTargets: number;

  /**
   * Estimated render target memory in bytes
   */
  renderTargetMemory: number;

  /**
   * Number of active WebGL programs/shaders
   */
  programs: number;

  /**
   * JS heap size (if available)
   */
  jsHeapSize?: number;

  /**
   * JS heap size limit (if available)
   */
  jsHeapLimit?: number;
}

/**
 * Derived performance metrics
 */
export interface PerformanceMetrics {
  /**
   * Current frames per second (instantaneous)
   */
  fps: number;

  /**
   * Smoothed FPS (rolling average)
   */
  fpsSmoothed: number;

  /**
   * Minimum FPS in recent history
   */
  fpsMin: number;

  /**
   * Maximum FPS in recent history
   */
  fpsMax: number;

  /**
   * 1% low FPS (99th percentile frame time converted to FPS)
   */
  fps1PercentLow: number;

  /**
   * Frame time budget usage (0-100%, based on target FPS)
   */
  frameBudgetUsed: number;

  /**
   * Target frame time in ms (default 16.67 for 60fps)
   */
  targetFrameTimeMs: number;

  /**
   * Frame time variance (jitter) in ms
   */
  frameTimeVariance: number;

  /**
   * Average triangles per draw call (batching efficiency)
   */
  trianglesPerDrawCall: number;

  /**
   * Average cost per visible object in triangles
   */
  trianglesPerObject: number;

  /**
   * Draw call efficiency score (0-100)
   */
  drawCallEfficiency: number;

  /**
   * Whether frame is above target (smooth)
   */
  isSmooth: boolean;

  /**
   * Consecutive dropped frames count
   */
  droppedFrames: number;
}

/**
 * Detailed rendering statistics
 */
export interface RenderingStats {
  /**
   * Number of shadow map updates this frame
   */
  shadowMapUpdates: number;

  /**
   * Number of shadow-casting lights
   */
  shadowCastingLights: number;

  /**
   * Total lights in scene
   */
  totalLights: number;

  /**
   * Active lights affecting visible objects
   */
  activeLights: number;

  /**
   * Number of skinned/animated meshes
   */
  skinnedMeshes: number;

  /**
   * Total bones across all skinned meshes
   */
  totalBones: number;

  /**
   * Number of instanced mesh draw calls
   */
  instancedDrawCalls: number;

  /**
   * Total instances rendered
   */
  totalInstances: number;

  /**
   * Number of transparent objects
   */
  transparentObjects: number;

  /**
   * Transparent draw calls (separate pass)
   */
  transparentDrawCalls: number;

  /**
   * Number of render target switches
   */
  renderTargetSwitches: number;

  /**
   * Number of shader/program switches
   */
  programSwitches: number;

  /**
   * Number of texture bind operations
   */
  textureBinds: number;

  /**
   * Number of buffer uploads this frame
   */
  bufferUploads: number;

  /**
   * Bytes uploaded to GPU this frame
   */
  bytesUploaded: number;

  /**
   * Post-processing passes count
   */
  postProcessingPasses: number;

  /**
   * Whether XR/VR rendering is active
   */
  xrActive: boolean;

  /**
   * Number of viewports/eyes being rendered
   */
  viewports: number;
}

/**
 * WebGL-specific frame statistics
 */
export interface WebGLFrameExtras {
  /**
   * Number of shader program switches
   */
  programSwitches: number;

  /**
   * Number of texture binding operations
   */
  textureBindings: number;

  /**
   * Total geometries in memory
   */
  geometryCount: number;

  /**
   * Total textures in memory
   */
  textureCount: number;

  /**
   * Active shader programs
   */
  programs: number;

  /**
   * WebGL context attributes
   */
  contextAttributes?: {
    antialias: boolean;
    alpha: boolean;
    depth: boolean;
    stencil: boolean;
    preserveDrawingBuffer: boolean;
    powerPreference: string;
  };

  /**
   * Active WebGL extensions
   */
  activeExtensions?: string[];

  /**
   * Maximum texture size supported
   */
  maxTextureSize?: number;

  /**
   * Maximum vertex uniforms
   */
  maxVertexUniforms?: number;

  /**
   * Maximum fragment uniforms
   */
  maxFragmentUniforms?: number;

  /**
   * Maximum varying vectors
   */
  maxVaryings?: number;

  /**
   * Maximum texture units
   */
  maxTextureUnits?: number;
}

/**
 * WebGPU-specific frame statistics
 */
export interface WebGPUFrameExtras {
  /**
   * Number of render pipelines used
   */
  pipelinesUsed: number;

  /**
   * Number of bind groups used
   */
  bindGroupsUsed: number;

  /**
   * Number of buffers used
   */
  buffersUsed: number;

  /**
   * GPU timestamp breakdown by pass
   */
  timestampBreakdown?: Record<string, number>;

  /**
   * Compute passes count
   */
  computePasses?: number;

  /**
   * Render passes count
   */
  renderPasses?: number;

  /**
   * GPU adapter info
   */
  adapterInfo?: {
    vendor: string;
    architecture: string;
    device: string;
    description: string;
  };
}

/**
 * Rule violation information
 */
export interface RuleViolation {
  /**
   * Rule identifier
   */
  ruleId: string;

  /**
   * Human-readable message
   */
  message: string;

  /**
   * Severity level
   */
  severity: 'info' | 'warning' | 'error';

  /**
   * Actual value that triggered the violation
   */
  value?: number;

  /**
   * Threshold that was exceeded
   */
  threshold?: number;

  /**
   * Suggestion for fixing the issue
   */
  suggestion?: string;
}

/**
 * Performance benchmark score with breakdown
 */
export interface BenchmarkScore {
  /**
   * Overall score (0-100)
   */
  overall: number;

  /**
   * Score breakdown by category
   */
  breakdown: {
    /**
     * Frame timing score (0-100)
     */
    timing: number;

    /**
     * Draw call efficiency score (0-100)
     */
    drawCalls: number;

    /**
     * Geometry complexity score (0-100)
     */
    geometry: number;

    /**
     * Memory usage score (0-100)
     */
    memory: number;

    /**
     * State changes efficiency score (0-100)
     */
    stateChanges: number;
  };

  /**
   * Performance grade (A, B, C, D, F)
   */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';

  /**
   * Top issues affecting performance
   */
  topIssues: string[];

  /**
   * Optimization suggestions
   */
  suggestions: string[];
}

/**
 * Performance history for tracking over time
 */
export interface PerformanceHistory {
  /**
   * Circular buffer of frame times
   */
  frameTimes: number[];

  /**
   * Circular buffer of FPS values
   */
  fpsHistory: number[];

  /**
   * Maximum samples to keep
   */
  maxSamples: number;

  /**
   * Get percentile frame time
   */
  getPercentile(percentile: number): number;

  /**
   * Get average frame time
   */
  getAverage(): number;

  /**
   * Get standard deviation
   */
  getStdDev(): number;
}

/**
 * Benchmark configuration
 */
export interface BenchmarkConfig {
  /**
   * Target FPS (default 60)
   */
  targetFps: number;

  /**
   * Maximum acceptable draw calls
   */
  maxDrawCalls: number;

  /**
   * Maximum acceptable triangles
   */
  maxTriangles: number;

  /**
   * Maximum acceptable texture memory (bytes)
   */
  maxTextureMemory: number;

  /**
   * Maximum acceptable geometry memory (bytes)
   */
  maxGeometryMemory: number;

  /**
   * Weights for each category (should sum to 1)
   */
  weights: {
    timing: number;
    drawCalls: number;
    geometry: number;
    memory: number;
    stateChanges: number;
  };
}

/**
 * Default benchmark configuration
 */
export const DEFAULT_BENCHMARK_CONFIG: BenchmarkConfig = {
  targetFps: 60,
  maxDrawCalls: 1000,
  maxTriangles: 2_000_000,
  maxTextureMemory: 256 * 1024 * 1024, // 256 MB
  maxGeometryMemory: 128 * 1024 * 1024, // 128 MB
  weights: {
    timing: 0.35,
    drawCalls: 0.20,
    geometry: 0.20,
    memory: 0.15,
    stateChanges: 0.10,
  },
};
