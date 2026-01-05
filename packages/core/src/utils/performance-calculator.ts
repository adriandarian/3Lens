import type {
  FrameStats,
  PerformanceMetrics,
  MemoryStats,
  RenderingStats,
  BenchmarkScore,
  BenchmarkConfig,
} from '../types/stats';
import { DEFAULT_BENCHMARK_CONFIG } from '../types/stats';

/**
 * Tracks frame history for percentile calculations
 */
export class PerformanceTracker {
  private frameTimes: number[] = [];
  private fpsHistory: number[] = [];
  private maxSamples: number;
  private droppedFrames = 0;
  private lastTimestamp = 0;
  private targetFrameTimeMs: number;

  constructor(maxSamples = 300, targetFps = 60) {
    this.maxSamples = maxSamples;
    this.targetFrameTimeMs = 1000 / targetFps;
  }

  /**
   * Record a frame
   */
  recordFrame(cpuTimeMs: number, timestamp: number): void {
    this.frameTimes.push(cpuTimeMs);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    const fps = cpuTimeMs > 0 ? 1000 / cpuTimeMs : 0;
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.maxSamples) {
      this.fpsHistory.shift();
    }

    // Track dropped frames
    if (cpuTimeMs > this.targetFrameTimeMs * 1.5) {
      this.droppedFrames++;
    } else {
      this.droppedFrames = 0;
    }

    this.lastTimestamp = timestamp;
  }

  /**
   * Get delta time since last frame
   */
  getDeltaTime(timestamp: number): number {
    if (this.lastTimestamp === 0) {
      return 16.67; // Assume 60fps for first frame
    }
    return timestamp - this.lastTimestamp;
  }

  /**
   * Get performance metrics
   */
  getMetrics(cpuTimeMs: number): PerformanceMetrics {
    const fps = cpuTimeMs > 0 ? 1000 / cpuTimeMs : 0;
    const fpsSmoothed = this.getAverageFps();
    const _sorted = [...this.frameTimes].sort((a, b) => a - b);

    return {
      fps: Math.round(fps),
      fpsSmoothed: Math.round(fpsSmoothed),
      fpsMin: Math.round(this.getMinFps()),
      fpsMax: Math.round(this.getMaxFps()),
      fps1PercentLow: Math.round(this.get1PercentLowFps()),
      frameBudgetUsed: Math.min(100, (cpuTimeMs / this.targetFrameTimeMs) * 100),
      targetFrameTimeMs: this.targetFrameTimeMs,
      frameTimeVariance: this.getVariance(),
      trianglesPerDrawCall: 0, // Set by caller
      trianglesPerObject: 0, // Set by caller
      drawCallEfficiency: 0, // Set by caller
      isSmooth: cpuTimeMs <= this.targetFrameTimeMs * 1.1,
      droppedFrames: this.droppedFrames,
    };
  }

  /**
   * Get percentile frame time
   */
  getPercentile(percentile: number): number {
    if (this.frameTimes.length === 0) return 0;
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get average frame time
   */
  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
  }

  /**
   * Get average FPS
   */
  getAverageFps(): number {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  /**
   * Get minimum FPS in history
   */
  getMinFps(): number {
    if (this.fpsHistory.length === 0) return 0;
    return Math.min(...this.fpsHistory);
  }

  /**
   * Get maximum FPS in history
   */
  getMaxFps(): number {
    if (this.fpsHistory.length === 0) return 0;
    return Math.max(...this.fpsHistory);
  }

  /**
   * Get 1% low FPS (99th percentile frame time converted to FPS)
   */
  get1PercentLowFps(): number {
    const p99FrameTime = this.getPercentile(99);
    return p99FrameTime > 0 ? 1000 / p99FrameTime : 0;
  }

  /**
   * Get variance of frame times
   */
  getVariance(): number {
    if (this.frameTimes.length < 2) return 0;
    const avg = this.getAverageFrameTime();
    const squaredDiffs = this.frameTimes.map((t) => Math.pow(t - avg, 2));
    return Math.sqrt(
      squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length
    );
  }

  /**
   * Reset history
   */
  reset(): void {
    this.frameTimes = [];
    this.fpsHistory = [];
    this.droppedFrames = 0;
    this.lastTimestamp = 0;
  }
}

/**
 * Calculate benchmark score from frame stats
 */
export function calculateBenchmarkScore(
  stats: FrameStats,
  config: BenchmarkConfig = DEFAULT_BENCHMARK_CONFIG
): BenchmarkScore {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Timing score (0-100)
  const targetFrameTime = 1000 / config.targetFps;
  const timingRatio = stats.cpuTimeMs / targetFrameTime;
  let timingScore: number;
  if (timingRatio <= 1) {
    timingScore = 100;
  } else if (timingRatio <= 1.5) {
    timingScore = 100 - (timingRatio - 1) * 100;
  } else if (timingRatio <= 2) {
    timingScore = 50 - (timingRatio - 1.5) * 60;
  } else {
    timingScore = Math.max(0, 20 - (timingRatio - 2) * 10);
  }

  if (timingScore < 80) {
    issues.push(`Frame time ${stats.cpuTimeMs.toFixed(1)}ms exceeds budget`);
    suggestions.push('Reduce geometry complexity or draw calls');
  }

  // Draw calls score (0-100)
  const drawCallRatio = stats.drawCalls / config.maxDrawCalls;
  let drawCallScore: number;
  if (drawCallRatio <= 0.5) {
    drawCallScore = 100;
  } else if (drawCallRatio <= 1) {
    drawCallScore = 100 - (drawCallRatio - 0.5) * 40;
  } else {
    drawCallScore = Math.max(0, 80 - (drawCallRatio - 1) * 40);
  }

  if (drawCallScore < 80) {
    issues.push(`${stats.drawCalls} draw calls is high`);
    suggestions.push('Enable instancing or merge static geometries');
  }

  // Geometry score (0-100)
  const triangleRatio = stats.triangles / config.maxTriangles;
  let geometryScore: number;
  if (triangleRatio <= 0.5) {
    geometryScore = 100;
  } else if (triangleRatio <= 1) {
    geometryScore = 100 - (triangleRatio - 0.5) * 40;
  } else {
    geometryScore = Math.max(0, 80 - (triangleRatio - 1) * 40);
  }

  if (geometryScore < 80) {
    issues.push(`${formatNumber(stats.triangles)} triangles is high`);
    suggestions.push('Use LOD or reduce polygon count');
  }

  // Memory score (0-100)
  let memoryScore = 100;
  if (stats.memory) {
    const textureMemRatio = stats.memory.textureMemory / config.maxTextureMemory;
    const geoMemRatio = stats.memory.geometryMemory / config.maxGeometryMemory;
    const memoryRatio = Math.max(textureMemRatio, geoMemRatio);
    if (memoryRatio <= 0.5) {
      memoryScore = 100;
    } else if (memoryRatio <= 1) {
      memoryScore = 100 - (memoryRatio - 0.5) * 40;
    } else {
      memoryScore = Math.max(0, 80 - (memoryRatio - 1) * 40);
    }

    if (memoryScore < 80) {
      issues.push('High GPU memory usage');
      suggestions.push('Compress textures or reduce resolution');
    }
  }

  // State changes score (0-100)
  const stateChangesPerDraw =
    stats.drawCalls > 0 && stats.rendering
      ? (stats.rendering.programSwitches + stats.rendering.textureBinds) /
        stats.drawCalls
      : 0;
  let stateChangesScore: number;
  if (stateChangesPerDraw <= 1) {
    stateChangesScore = 100;
  } else if (stateChangesPerDraw <= 2) {
    stateChangesScore = 100 - (stateChangesPerDraw - 1) * 30;
  } else {
    stateChangesScore = Math.max(0, 70 - (stateChangesPerDraw - 2) * 20);
  }

  if (stateChangesScore < 80) {
    issues.push('Excessive state changes');
    suggestions.push('Sort objects by material to reduce shader switches');
  }

  // Calculate overall score with weights
  const overall =
    timingScore * config.weights.timing +
    drawCallScore * config.weights.drawCalls +
    geometryScore * config.weights.geometry +
    memoryScore * config.weights.memory +
    stateChangesScore * config.weights.stateChanges;

  // Calculate grade
  let grade: BenchmarkScore['grade'];
  if (overall >= 90) grade = 'A';
  else if (overall >= 75) grade = 'B';
  else if (overall >= 60) grade = 'C';
  else if (overall >= 40) grade = 'D';
  else grade = 'F';

  return {
    overall: Math.round(overall),
    breakdown: {
      timing: Math.round(timingScore),
      drawCalls: Math.round(drawCallScore),
      geometry: Math.round(geometryScore),
      memory: Math.round(memoryScore),
      stateChanges: Math.round(stateChangesScore),
    },
    grade,
    topIssues: issues.slice(0, 3),
    suggestions: suggestions.slice(0, 3),
  };
}

/**
 * Create default empty memory stats
 */
export function createEmptyMemoryStats(): MemoryStats {
  return {
    geometries: 0,
    textures: 0,
    geometryMemory: 0,
    textureMemory: 0,
    totalGpuMemory: 0,
    renderTargets: 0,
    renderTargetMemory: 0,
    programs: 0,
    jsHeapSize: undefined,
    jsHeapLimit: undefined,
  };
}

/**
 * Create default empty rendering stats
 */
export function createEmptyRenderingStats(): RenderingStats {
  return {
    shadowMapUpdates: 0,
    shadowCastingLights: 0,
    totalLights: 0,
    activeLights: 0,
    skinnedMeshes: 0,
    totalBones: 0,
    instancedDrawCalls: 0,
    totalInstances: 0,
    transparentObjects: 0,
    transparentDrawCalls: 0,
    renderTargetSwitches: 0,
    programSwitches: 0,
    textureBinds: 0,
    bufferUploads: 0,
    bytesUploaded: 0,
    postProcessingPasses: 0,
    xrActive: false,
    viewports: 1,
  };
}

/**
 * Create default empty performance metrics
 */
export function createEmptyPerformanceMetrics(): PerformanceMetrics {
  return {
    fps: 0,
    fpsSmoothed: 0,
    fpsMin: 0,
    fpsMax: 0,
    fps1PercentLow: 0,
    frameBudgetUsed: 0,
    targetFrameTimeMs: 16.67,
    frameTimeVariance: 0,
    trianglesPerDrawCall: 0,
    trianglesPerObject: 0,
    drawCallEfficiency: 0,
    isSmooth: true,
    droppedFrames: 0,
  };
}

/**
 * Format a number for display (e.g., 1234567 -> "1.23M")
 */
function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Estimate memory for a texture based on dimensions and format
 */
export function estimateTextureMemory(
  width: number,
  height: number,
  format: string = 'RGBA',
  mipmaps = true
): number {
  let bytesPerPixel = 4; // Default RGBA

  // Adjust for common formats
  if (format.includes('RGB') && !format.includes('RGBA')) {
    bytesPerPixel = 3;
  } else if (format.includes('LUMINANCE') || format.includes('ALPHA')) {
    bytesPerPixel = 1;
  } else if (format.includes('HALF_FLOAT') || format.includes('FLOAT16')) {
    bytesPerPixel = 8;
  } else if (format.includes('FLOAT')) {
    bytesPerPixel = 16;
  } else if (format.includes('DXT1') || format.includes('BC1')) {
    bytesPerPixel = 0.5;
  } else if (
    format.includes('DXT5') ||
    format.includes('BC3') ||
    format.includes('BC7')
  ) {
    bytesPerPixel = 1;
  }

  let memory = width * height * bytesPerPixel;

  // Add mipmaps (approximately 1/3 additional)
  if (mipmaps) {
    memory = Math.ceil(memory * 1.33);
  }

  return memory;
}

/**
 * Estimate memory for geometry based on vertex count and attributes
 */
export function estimateGeometryMemory(
  vertexCount: number,
  indexCount: number,
  hasNormals = true,
  hasUVs = true,
  hasTangents = false,
  hasColors = false
): number {
  // Position: 3 floats = 12 bytes per vertex
  let bytesPerVertex = 12;

  if (hasNormals) {
    bytesPerVertex += 12; // 3 floats
  }
  if (hasUVs) {
    bytesPerVertex += 8; // 2 floats
  }
  if (hasTangents) {
    bytesPerVertex += 16; // 4 floats
  }
  if (hasColors) {
    bytesPerVertex += 16; // 4 floats or 4 bytes depending on type
  }

  const vertexMemory = vertexCount * bytesPerVertex;

  // Index buffer: typically 2 or 4 bytes per index
  const indexMemory = indexCount * (indexCount > 65535 ? 4 : 2);

  return vertexMemory + indexMemory;
}

