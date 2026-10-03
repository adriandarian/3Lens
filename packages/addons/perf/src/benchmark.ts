/**
 * Benchmark scoring utilities for the performance addon.
 *
 * The scorer is deliberately independent of a renderer so callers can use it
 * with live capture, trace data, workers, or tests.
 */

export interface BenchmarkWeights {
  timing: number;
  drawCalls: number;
  geometry: number;
  memory: number;
  stateChanges: number;
  objects: number;
  materials: number;
  renderTargets: number;
}

export interface BenchmarkConfig {
  targetFps: number;
  maxDrawCalls: number;
  maxTriangles: number;
  maxStateChanges: number;
  maxObjects: number;
  maxMaterials: number;
  maxTextures: number;
  maxGeometries: number;
  maxRenderTargets: number;
  maxTextureMemory: number;
  maxGeometryMemory: number;
  weights: BenchmarkWeights;
}

export type PartialBenchmarkConfig =
  Partial<Omit<BenchmarkConfig, 'weights'>> & {
    weights?: Partial<BenchmarkWeights>;
  };

export interface BenchmarkStats {
  fps?: number;
  frameTimeMs?: number;
  drawCalls?: number;
  triangles?: number;
  stateChanges?: number;
  objects?: number;
  materials?: number;
  textures?: number;
  geometries?: number;
  renderTargets?: number;
  textureMemory?: number;
  geometryMemory?: number;
}

export interface BenchmarkScore {
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: BenchmarkWeights;
}

export const DEFAULT_BENCHMARK_CONFIG: BenchmarkConfig = {
  targetFps: 60,
  maxDrawCalls: 1000,
  maxTriangles: 2_000_000,
  maxStateChanges: 1000,
  maxObjects: 10_000,
  maxMaterials: 500,
  maxTextures: 200,
  maxGeometries: 1000,
  maxRenderTargets: 12,
  maxTextureMemory: 256 * 1024 * 1024,
  maxGeometryMemory: 128 * 1024 * 1024,
  weights: {
    timing: 0.3,
    drawCalls: 0.17,
    geometry: 0.17,
    memory: 0.12,
    stateChanges: 0.1,
    objects: 0.06,
    materials: 0.04,
    renderTargets: 0.04,
  },
};

function positiveOr(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function nonNegativeOr(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}

function finiteNonNegative(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function scoreBelowLimit(value: number | undefined, limit: number): number {
  const safeValue = finiteNonNegative(value);
  return clampScore(100 - (safeValue / limit) * 100);
}

function normalizeWeights(weights: BenchmarkWeights): BenchmarkWeights {
  const total =
    weights.timing +
    weights.drawCalls +
    weights.geometry +
    weights.memory +
    weights.stateChanges +
    weights.objects +
    weights.materials +
    weights.renderTargets;

  if (!Number.isFinite(total) || total <= 0) {
    return { ...DEFAULT_BENCHMARK_CONFIG.weights };
  }

  return {
    timing: weights.timing / total,
    drawCalls: weights.drawCalls / total,
    geometry: weights.geometry / total,
    memory: weights.memory / total,
    stateChanges: weights.stateChanges / total,
    objects: weights.objects / total,
    materials: weights.materials / total,
    renderTargets: weights.renderTargets / total,
  };
}

/**
 * Resolve a partial benchmark config into a safe complete config.
 *
 * Partial weights are merged with defaults, invalid thresholds fall back to
 * defaults, and weights are normalized so the final score stays bounded.
 */
export function resolveBenchmarkConfig(
  config: PartialBenchmarkConfig = {}
): BenchmarkConfig {
  const defaultWeights = DEFAULT_BENCHMARK_CONFIG.weights;
  const suppliedWeights = config.weights ?? {};

  const weights = normalizeWeights({
    timing: nonNegativeOr(suppliedWeights.timing, defaultWeights.timing),
    drawCalls: nonNegativeOr(suppliedWeights.drawCalls, defaultWeights.drawCalls),
    geometry: nonNegativeOr(suppliedWeights.geometry, defaultWeights.geometry),
    memory: nonNegativeOr(suppliedWeights.memory, defaultWeights.memory),
    stateChanges: nonNegativeOr(
      suppliedWeights.stateChanges,
      defaultWeights.stateChanges
    ),
    objects: nonNegativeOr(suppliedWeights.objects, defaultWeights.objects),
    materials: nonNegativeOr(suppliedWeights.materials, defaultWeights.materials),
    renderTargets: nonNegativeOr(
      suppliedWeights.renderTargets,
      defaultWeights.renderTargets
    ),
  });

  return {
    targetFps: positiveOr(config.targetFps, DEFAULT_BENCHMARK_CONFIG.targetFps),
    maxDrawCalls: positiveOr(
      config.maxDrawCalls,
      DEFAULT_BENCHMARK_CONFIG.maxDrawCalls
    ),
    maxTriangles: positiveOr(
      config.maxTriangles,
      DEFAULT_BENCHMARK_CONFIG.maxTriangles
    ),
    maxStateChanges: positiveOr(
      config.maxStateChanges,
      DEFAULT_BENCHMARK_CONFIG.maxStateChanges
    ),
    maxObjects: positiveOr(config.maxObjects, DEFAULT_BENCHMARK_CONFIG.maxObjects),
    maxMaterials: positiveOr(
      config.maxMaterials,
      DEFAULT_BENCHMARK_CONFIG.maxMaterials
    ),
    maxTextures: positiveOr(
      config.maxTextures,
      DEFAULT_BENCHMARK_CONFIG.maxTextures
    ),
    maxGeometries: positiveOr(
      config.maxGeometries,
      DEFAULT_BENCHMARK_CONFIG.maxGeometries
    ),
    maxRenderTargets: positiveOr(
      config.maxRenderTargets,
      DEFAULT_BENCHMARK_CONFIG.maxRenderTargets
    ),
    maxTextureMemory: positiveOr(
      config.maxTextureMemory,
      DEFAULT_BENCHMARK_CONFIG.maxTextureMemory
    ),
    maxGeometryMemory: positiveOr(
      config.maxGeometryMemory,
      DEFAULT_BENCHMARK_CONFIG.maxGeometryMemory
    ),
    weights,
  };
}

function getGrade(overall: number): BenchmarkScore['grade'] {
  if (overall >= 90) return 'A';
  if (overall >= 80) return 'B';
  if (overall >= 70) return 'C';
  if (overall >= 60) return 'D';
  return 'F';
}

/**
 * Calculate a bounded performance benchmark score.
 *
 * Missing optional metrics are treated as zero cost. This makes the scorer safe
 * for partially populated frames and avoids runtime failures while collectors
 * are still warming up.
 */
export function calculateBenchmarkScore(
  stats: BenchmarkStats,
  config: PartialBenchmarkConfig = {}
): BenchmarkScore {
  const resolved = resolveBenchmarkConfig(config);

  const fps =
    typeof stats.fps === 'number' && Number.isFinite(stats.fps) && stats.fps >= 0
      ? stats.fps
      : typeof stats.frameTimeMs === 'number' &&
          Number.isFinite(stats.frameTimeMs) &&
          stats.frameTimeMs > 0
        ? 1000 / stats.frameTimeMs
        : resolved.targetFps;

  const textureScore = scoreBelowLimit(stats.textures, resolved.maxTextures);
  const geometryMemoryScore = scoreBelowLimit(
    stats.geometryMemory,
    resolved.maxGeometryMemory
  );
  const textureMemoryScore = scoreBelowLimit(
    stats.textureMemory,
    resolved.maxTextureMemory
  );
  const memoryScore = clampScore(
    (textureScore + geometryMemoryScore + textureMemoryScore) / 3
  );

  const breakdown: BenchmarkWeights = {
    timing: clampScore((fps / resolved.targetFps) * 100),
    drawCalls: scoreBelowLimit(stats.drawCalls, resolved.maxDrawCalls),
    geometry: scoreBelowLimit(stats.triangles, resolved.maxTriangles),
    memory: memoryScore,
    stateChanges: scoreBelowLimit(stats.stateChanges, resolved.maxStateChanges),
    objects: scoreBelowLimit(stats.objects, resolved.maxObjects),
    materials: scoreBelowLimit(stats.materials, resolved.maxMaterials),
    renderTargets: scoreBelowLimit(stats.renderTargets, resolved.maxRenderTargets),
  };

  const weights = resolved.weights;
  const overall = clampScore(
    breakdown.timing * weights.timing +
      breakdown.drawCalls * weights.drawCalls +
      breakdown.geometry * weights.geometry +
      breakdown.memory * weights.memory +
      breakdown.stateChanges * weights.stateChanges +
      breakdown.objects * weights.objects +
      breakdown.materials * weights.materials +
      breakdown.renderTargets * weights.renderTargets
  );

  return {
    overall,
    grade: getGrade(overall),
    breakdown,
  };
}
