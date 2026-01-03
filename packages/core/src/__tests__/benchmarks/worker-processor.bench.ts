/**
 * Performance Benchmarks: Worker Processor
 *
 * Tests the performance of heavy processing tasks that could be
 * offloaded to a Web Worker. Since Web Workers aren't available
 * in Node.js test environment, we benchmark the computation logic directly.
 */

import { describe, it, expect } from 'vitest';
import type { FrameStats } from '../../types/stats';
import {
  benchmark,
  benchmarkBatched,
  formatBenchmarkResults,
  assertPerformance,
  type BenchmarkResult,
} from './benchmark-utils';

// Create mock frame stats
function createMockFrameStats(frame: number): FrameStats {
  const fps = 55 + Math.random() * 10;
  return {
    frame,
    timestamp: performance.now(),
    deltaTimeMs: 1000 / fps,
    cpuTimeMs: 8 + Math.random() * 4,
    gpuTimeMs: 5 + Math.random() * 3,
    triangles: 50000 + Math.floor(Math.random() * 20000),
    drawCalls: 100 + Math.floor(Math.random() * 50),
    points: 0,
    lines: 0,
    vertices: 150000 + Math.floor(Math.random() * 50000),
    objectsVisible: 200 + Math.floor(Math.random() * 100),
    objectsTotal: 500,
    objectsCulled: 100 + Math.floor(Math.random() * 100),
    materialsUsed: 30 + Math.floor(Math.random() * 20),
    memory: {
      geometries: 50,
      textures: 30,
      totalEstimatedBytes: 100000000 + Math.floor(Math.random() * 50000000),
      textureBytes: 60000000 + Math.floor(Math.random() * 20000000),
      geometryBytes: 30000000 + Math.floor(Math.random() * 10000000),
      renderTargetBytes: 10000000,
    },
    performance: {
      fps,
      frameTimeMs: 1000 / fps,
      frameBudgetUsed: ((1000 / fps) / 16.67) * 100,
      gpuBound: Math.random() > 0.7,
      cpuBound: Math.random() > 0.8,
    },
    programs: 20,
    pipelines: 0,
    bindGroups: 0,
    shaderModules: 0,
    samplers: 10,
    renderTargets: 3,
  };
}

// Stats aggregation logic (mimics worker task)
function aggregateStats(stats: FrameStats[], windowSize: number = 60) {
  const window = stats.slice(-windowSize);
  if (window.length === 0) {
    return null;
  }

  let sumCpu = 0;
  let sumGpu = 0;
  let gpuCount = 0;
  let sumFps = 0;
  let minFps = Infinity;
  let maxFps = 0;
  let sumDrawCalls = 0;
  let sumTriangles = 0;
  let droppedFrames = 0;

  for (const s of window) {
    sumCpu += s.cpuTimeMs;
    if (s.gpuTimeMs !== undefined) {
      sumGpu += s.gpuTimeMs;
      gpuCount++;
    }
    const fps = s.performance?.fps ?? (1000 / s.deltaTimeMs);
    sumFps += fps;
    minFps = Math.min(minFps, fps);
    maxFps = Math.max(maxFps, fps);
    sumDrawCalls += s.drawCalls;
    sumTriangles += s.triangles;
    if (s.deltaTimeMs > 33.33) droppedFrames++;
  }

  const avgFps = sumFps / window.length;
  const avgCpuTimeMs = sumCpu / window.length;

  // Calculate variance
  let sumSquaredDiff = 0;
  for (const s of window) {
    const fps = s.performance?.fps ?? (1000 / s.deltaTimeMs);
    sumSquaredDiff += Math.pow(fps - avgFps, 2);
  }

  return {
    avgCpuTimeMs,
    avgGpuTimeMs: gpuCount > 0 ? sumGpu / gpuCount : null,
    avgFps,
    minFps,
    maxFps,
    avgDrawCalls: sumDrawCalls / window.length,
    avgTriangles: sumTriangles / window.length,
    totalFrames: window.length,
    droppedFrames,
    variance: sumSquaredDiff / window.length,
  };
}

// Percentile calculation logic
function calculatePercentiles(values: number[], percentiles: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const result: Record<number, number> = {};

  for (const p of percentiles) {
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    result[p] = sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
  }

  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const midIdx = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[midIdx - 1] + sorted[midIdx]) / 2
    : sorted[midIdx];

  return {
    percentiles: result,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean,
    median,
  };
}

// Trend analysis logic
function analyzeTrend(
  history: Array<{ timestamp: number; value: number }>,
  windowSize: number = 30
) {
  const window = history.slice(-windowSize);
  if (window.length < 2) {
    return { trend: 'stable' as const, slope: 0, rSquared: 0 };
  }

  // Linear regression
  const n = window.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = window[i].value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const meanY = sumY / n;

  // R-squared
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    const y = window[i].value;
    const yPred = slope * i + intercept;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += Math.pow(y - yPred, 2);
  }
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  const trend = slope > 0.1 ? 'degrading' : slope < -0.1 ? 'improving' : 'stable';

  return { trend, slope, rSquared };
}

describe('Processing Task Benchmarks', () => {
  const results: BenchmarkResult[] = [];

  describe('Stats Aggregation', () => {
    it('aggregate small dataset (100 frames)', () => {
      const stats = Array.from({ length: 100 }, (_, i) => createMockFrameStats(i));

      const result = benchmark(
        'Stats aggregation (100 frames)',
        () => {
          aggregateStats(stats, 60);
        }
      );

      results.push(result);

      // Should be very fast - at least 50K ops/sec
      assertPerformance(result, 50000);
    });

    it('aggregate medium dataset (500 frames)', () => {
      const stats = Array.from({ length: 500 }, (_, i) => createMockFrameStats(i));

      const result = benchmark(
        'Stats aggregation (500 frames)',
        () => {
          aggregateStats(stats, 60);
        }
      );

      results.push(result);

      assertPerformance(result, 30000);
    });

    it('aggregate large dataset (1000 frames)', () => {
      const stats = Array.from({ length: 1000 }, (_, i) => createMockFrameStats(i));

      const result = benchmark(
        'Stats aggregation (1000 frames)',
        () => {
          aggregateStats(stats, 300);
        }
      );

      results.push(result);

      assertPerformance(result, 10000);
    });
  });

  describe('Percentile Calculation', () => {
    it('percentiles small dataset (100 values)', () => {
      const values = Array.from({ length: 100 }, () => Math.random() * 100);

      const result = benchmark(
        'Percentile calc (100 values)',
        () => {
          calculatePercentiles(values, [50, 90, 95, 99]);
        }
      );

      results.push(result);

      assertPerformance(result, 50000);
    });

    it('percentiles large dataset (10000 values)', () => {
      const values = Array.from({ length: 10000 }, () => Math.random() * 100);

      const result = benchmark(
        'Percentile calc (10000 values)',
        () => {
          calculatePercentiles(values, [50, 90, 95, 99]);
        }
      );

      results.push(result);

      // Sorting 10K values is slower - expect at least 300 ops/sec
      assertPerformance(result, 300);
    });

    it('many percentiles (100 values, 20 percentiles)', () => {
      const values = Array.from({ length: 100 }, () => Math.random() * 100);
      const percentiles = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

      const result = benchmark(
        'Percentile calc (20 percentiles)',
        () => {
          calculatePercentiles(values, percentiles);
        }
      );

      results.push(result);

      assertPerformance(result, 40000);
    });
  });

  describe('Trend Analysis', () => {
    it('trend analysis short history (50 points)', () => {
      const history = Array.from({ length: 50 }, (_, i) => ({
        timestamp: Date.now() - (50 - i) * 1000,
        value: 16 + Math.sin(i / 10) * 2 + Math.random() * 0.5,
      }));

      const result = benchmark(
        'Trend analysis (50 points)',
        () => {
          analyzeTrend(history, 30);
        }
      );

      results.push(result);

      assertPerformance(result, 100000);
    });

    it('trend analysis long history (500 points)', () => {
      const history = Array.from({ length: 500 }, (_, i) => ({
        timestamp: Date.now() - (500 - i) * 1000,
        value: 16 + (i / 500) * 2 + Math.random() * 0.5,
      }));

      const result = benchmark(
        'Trend analysis (500 points)',
        () => {
          analyzeTrend(history, 100);
        }
      );

      results.push(result);

      assertPerformance(result, 50000);
    });
  });

  describe('Combined Processing', () => {
    it('full frame analysis pipeline', () => {
      const stats = Array.from({ length: 120 }, (_, i) => createMockFrameStats(i));
      const cpuHistory = stats.map(s => ({ timestamp: s.timestamp, value: s.cpuTimeMs }));
      const fpsValues = stats.map(s => s.performance?.fps ?? 60);

      const result = benchmark(
        'Full analysis pipeline',
        () => {
          // Aggregate stats
          aggregateStats(stats, 60);
          // Calculate FPS percentiles
          calculatePercentiles(fpsValues, [50, 95, 99]);
          // Analyze CPU trend
          analyzeTrend(cpuHistory, 60);
        }
      );

      results.push(result);

      assertPerformance(result, 10000);
    });
  });

  describe('Batched Processing Comparison', () => {
    it('single item vs batched processing', () => {
      const allStats = Array.from({ length: 1000 }, (_, i) => createMockFrameStats(i));

      // Single item processing
      const singleResult = benchmarkBatched(
        'Single frame stats access',
        () => {
          const stats = allStats[Math.floor(Math.random() * 1000)];
          const fps = stats.performance?.fps ?? 60;
          const _ = fps > 30;
        },
        1000
      );
      results.push(singleResult);

      // Batched processing
      const batchResult = benchmark(
        'Batch 100 frames aggregate',
        () => {
          const batch = allStats.slice(0, 100);
          aggregateStats(batch, 100);
        }
      );
      results.push(batchResult);

      // Batched should be more efficient per-frame
      console.log(`Single item: ${singleResult.avgTimeMs.toFixed(6)}ms`);
      console.log(`Batch (100): ${batchResult.avgTimeMs.toFixed(6)}ms (${(batchResult.avgTimeMs / 100).toFixed(6)}ms per frame)`);
    });
  });

  // Print results at the end
  it('print benchmark results', () => {
    console.log('\n' + formatBenchmarkResults(results) + '\n');
  });
});
