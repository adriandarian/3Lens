import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BENCHMARK_CONFIG,
  calculateBenchmarkScore,
  resolveBenchmarkConfig,
} from './benchmark';

describe('benchmark scoring', () => {
  it('merges partial weights with defaults and normalizes them', () => {
    const config = resolveBenchmarkConfig({
      weights: { timing: 0.5 },
    });

    expect(config.weights.drawCalls).toBeGreaterThan(0);
    const total = Object.values(config.weights).reduce((sum, value) => sum + value, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it('falls back from invalid thresholds and weights', () => {
    const config = resolveBenchmarkConfig({
      targetFps: 0,
      maxDrawCalls: -1,
      weights: { timing: Number.NaN, objects: -2 },
    });

    expect(config.targetFps).toBe(DEFAULT_BENCHMARK_CONFIG.targetFps);
    expect(config.maxDrawCalls).toBe(DEFAULT_BENCHMARK_CONFIG.maxDrawCalls);
    expect(config.weights.timing).toBeGreaterThan(0);
    expect(config.weights.objects).toBeGreaterThanOrEqual(0);
  });

  it('returns a finite bounded score for partial stats', () => {
    const score = calculateBenchmarkScore({
      fps: 58,
      drawCalls: 320,
    });

    expect(Number.isFinite(score.overall)).toBe(true);
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
  });

  it('adds object, material, and render-target categories', () => {
    const score = calculateBenchmarkScore({
      objects: 5000,
      materials: 250,
      renderTargets: 6,
    });

    expect(score.breakdown.objects).toBeCloseTo(50);
    expect(score.breakdown.materials).toBeCloseTo(50);
    expect(score.breakdown.renderTargets).toBeCloseTo(50);
  });

  it('clamps extreme input instead of producing NaN or out-of-range output', () => {
    const score = calculateBenchmarkScore(
      {
        fps: Number.POSITIVE_INFINITY,
        drawCalls: Number.MAX_VALUE,
        triangles: Number.MAX_VALUE,
        stateChanges: Number.MAX_VALUE,
        objects: Number.MAX_VALUE,
        materials: Number.MAX_VALUE,
        renderTargets: Number.MAX_VALUE,
        textureMemory: Number.MAX_VALUE,
        geometryMemory: Number.MAX_VALUE,
      },
      {
        weights: {
          timing: 10,
          drawCalls: 10,
          geometry: 10,
          memory: 10,
          stateChanges: 10,
          objects: 10,
          materials: 10,
          renderTargets: 10,
        },
      }
    );

    expect(Number.isFinite(score.overall)).toBe(true);
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
  });
});
