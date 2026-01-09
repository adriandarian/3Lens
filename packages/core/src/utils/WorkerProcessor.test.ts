import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  WorkerProcessor,
  getWorkerProcessor,
  resetWorkerProcessor,
  type BenchmarkPayload,
  type StatsAggregationPayload,
  type PercentilePayload,
  type TrendAnalysisPayload,
  type WorkerStats,
} from './WorkerProcessor';
import type { FrameStats, BenchmarkScore } from '../types/stats';

// Mock Worker for testing (since workers don't work in Node.js)
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;
  private messageHandler: ((data: unknown) => unknown) | null = null;

  constructor() {
    // Simulate worker initialization
  }

  postMessage(data: unknown): void {
    // Simulate async processing
    setTimeout(() => {
      if (this.onmessage && this.messageHandler) {
        try {
          const result = this.messageHandler(data);
          this.onmessage(
            new MessageEvent('message', {
              data: result,
            })
          );
        } catch (error) {
          this.onmessage(
            new MessageEvent('message', {
              data: {
                id: (data as { id: string }).id,
                type: (data as { type: string }).type,
                success: false,
                error: (error as Error).message,
                processingTimeMs: 1,
              },
            })
          );
        }
      }
    }, 10);
  }

  terminate(): void {
    this.onmessage = null;
    this.onerror = null;
  }

  setHandler(handler: (data: unknown) => unknown): void {
    this.messageHandler = handler;
  }
}

// Store original Worker
const originalWorker = globalThis.Worker;

describe('WorkerProcessor', () => {
  let processor: WorkerProcessor;

  beforeEach(() => {
    // Mock Worker globally
    globalThis.Worker = undefined as unknown as typeof Worker;
    processor = new WorkerProcessor({ enableLogging: false });
  });

  afterEach(() => {
    processor.dispose();
    resetWorkerProcessor();
    globalThis.Worker = originalWorker;
  });

  describe('initialization', () => {
    it('should create processor with default options', () => {
      const p = new WorkerProcessor();
      expect(p).toBeDefined();
      expect(p.isAvailable()).toBe(false); // No worker before init
      p.dispose();
    });

    it('should create processor with custom options', () => {
      const p = new WorkerProcessor({
        maxConcurrentTasks: 5,
        taskTimeout: 10000,
        enableLogging: true,
      });
      expect(p).toBeDefined();
      p.dispose();
    });

    it('should handle initialization when Worker is not available', async () => {
      await processor.initialize();
      expect(processor.isAvailable()).toBe(false);
    });

    it('should dedupe concurrent initialize calls', async () => {
      const p1 = processor.initialize();
      const p2 = processor.initialize();
      // Both should resolve
      await Promise.all([p1, p2]);
      expect(processor.isAvailable()).toBe(false); // Still false since Worker not available
    });
  });

  describe('getStats', () => {
    it('should return initial stats', () => {
      const stats = processor.getStats();
      expect(stats.totalTasks).toBe(0);
      expect(stats.completedTasks).toBe(0);
      expect(stats.failedTasks).toBe(0);
      expect(stats.timedOutTasks).toBe(0);
      expect(stats.avgProcessingTimeMs).toBe(0);
      expect(stats.pendingTasks).toBe(0);
      expect(stats.isAvailable).toBe(false);
    });

    it('should return copy of stats', () => {
      const stats1 = processor.getStats();
      const stats2 = processor.getStats();
      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });
  });

  describe('dispose', () => {
    it('should dispose cleanly', () => {
      processor.dispose();
      expect(processor.isAvailable()).toBe(false);
    });

    it('should handle multiple dispose calls', () => {
      processor.dispose();
      processor.dispose();
      expect(processor.isAvailable()).toBe(false);
    });

    it('should reject initialization after dispose', async () => {
      processor.dispose();
      await expect(processor.initialize()).rejects.toThrow('disposed');
    });
  });

  describe('cancelAllTasks', () => {
    it('should cancel pending tasks', () => {
      expect(processor.getPendingTaskCount()).toBe(0);
      processor.cancelAllTasks();
      expect(processor.getPendingTaskCount()).toBe(0);
    });
  });
});

describe('WorkerProcessor - Main Thread Fallback', () => {
  let processor: WorkerProcessor;

  beforeEach(() => {
    globalThis.Worker = undefined as unknown as typeof Worker;
    processor = new WorkerProcessor({ enableLogging: false });
  });

  afterEach(() => {
    processor.dispose();
    globalThis.Worker = originalWorker;
  });

  describe('calculateBenchmark (fallback)', () => {
    it('should calculate benchmark on main thread', async () => {
      const stats: FrameStats = createMockFrameStats({
        cpuTimeMs: 16.67,
        drawCalls: 100,
        triangles: 500000,
      });

      const result = await processor.calculateBenchmark(stats);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
      expect(result.grade).toMatch(/^[A-F]$/);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.timing).toBeDefined();
      expect(result.breakdown.drawCalls).toBeDefined();
      expect(result.breakdown.geometry).toBeDefined();
      expect(result.breakdown.memory).toBeDefined();
      expect(result.breakdown.stateChanges).toBeDefined();
    });

    it('should handle excellent performance', async () => {
      const stats: FrameStats = createMockFrameStats({
        cpuTimeMs: 5,
        drawCalls: 50,
        triangles: 100000,
      });

      const result = await processor.calculateBenchmark(stats);

      expect(result.grade).toBe('A');
      expect(result.overall).toBeGreaterThanOrEqual(90);
    });

    it('should handle poor performance', async () => {
      const stats: FrameStats = createMockFrameStats({
        cpuTimeMs: 50,
        drawCalls: 1000,
        triangles: 5000000,
      });

      const result = await processor.calculateBenchmark(stats);

      expect(result.grade).toMatch(/^[D-F]$/);
      expect(result.topIssues.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should use custom config', async () => {
      const stats: FrameStats = createMockFrameStats({
        cpuTimeMs: 20,
        drawCalls: 200,
        triangles: 500000,
      });

      const result = await processor.calculateBenchmark(stats, {
        targetFps: 30, // Lower target makes it easier to pass
        maxDrawCalls: 1000,
        maxTriangles: 2000000,
        maxTextureMemory: 1024 * 1024 * 1024,
        maxGeometryMemory: 512 * 1024 * 1024,
        weights: {
          timing: 0.4,
          drawCalls: 0.15,
          geometry: 0.15,
          memory: 0.15,
          stateChanges: 0.15,
        },
      });

      expect(result.grade).toMatch(/^[A-C]$/);
    });
  });

  describe('aggregateStats (fallback)', () => {
    it('should aggregate frame stats', async () => {
      const stats: FrameStats[] = [
        createMockFrameStats({
          cpuTimeMs: 15,
          drawCalls: 100,
          triangles: 50000,
        }),
        createMockFrameStats({
          cpuTimeMs: 17,
          drawCalls: 120,
          triangles: 60000,
        }),
        createMockFrameStats({
          cpuTimeMs: 16,
          drawCalls: 110,
          triangles: 55000,
        }),
      ];

      const result = await processor.aggregateStats(stats);

      expect(result.totalFrames).toBe(3);
      expect(result.avgCpuTimeMs).toBe(16);
      expect(result.avgDrawCalls).toBe(110);
      expect(result.avgTriangles).toBe(55000);
      expect(result.minFps).toBeLessThan(result.maxFps);
    });

    it('should handle empty stats', async () => {
      const result = await processor.aggregateStats([]);

      expect(result.totalFrames).toBe(0);
      expect(result.avgCpuTimeMs).toBe(0);
      expect(result.avgFps).toBe(0);
    });

    it('should use window size', async () => {
      const stats: FrameStats[] = Array.from({ length: 10 }, (_, i) =>
        createMockFrameStats({
          cpuTimeMs: 10 + i,
          drawCalls: 100 + i * 10,
          triangles: 50000,
        })
      );

      const result = await processor.aggregateStats(stats, 5);

      expect(result.totalFrames).toBe(5);
    });

    it('should count dropped frames', async () => {
      const stats: FrameStats[] = [
        createMockFrameStats({ cpuTimeMs: 16 }),
        createMockFrameStats({ cpuTimeMs: 50 }), // Dropped
        createMockFrameStats({ cpuTimeMs: 100 }), // Dropped
        createMockFrameStats({ cpuTimeMs: 16 }),
      ];

      const result = await processor.aggregateStats(stats);

      expect(result.droppedFrames).toBe(2);
    });

    it('should handle GPU time', async () => {
      const stats: FrameStats[] = [
        createMockFrameStats({ cpuTimeMs: 16, gpuTimeMs: 10 }),
        createMockFrameStats({ cpuTimeMs: 16, gpuTimeMs: 12 }),
        createMockFrameStats({ cpuTimeMs: 16 }), // No GPU time
      ];

      const result = await processor.aggregateStats(stats);

      expect(result.avgGpuTimeMs).toBe(11);
    });
  });

  describe('calculatePercentiles (fallback)', () => {
    it('should calculate percentiles', async () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const result = await processor.calculatePercentiles(
        values,
        [50, 90, 95, 99]
      );

      expect(result.min).toBe(1);
      expect(result.max).toBe(10);
      expect(result.mean).toBe(5.5);
      expect(result.median).toBe(5.5);
      expect(result.percentiles[50]).toBe(5);
      expect(result.percentiles[90]).toBe(9);
    });

    it('should handle empty values', async () => {
      const result = await processor.calculatePercentiles([], [50]);

      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
      expect(result.mean).toBe(0);
      expect(result.median).toBe(0);
      expect(result.percentiles[50]).toBe(0);
    });

    it('should handle single value', async () => {
      const result = await processor.calculatePercentiles([42], [50, 90]);

      expect(result.min).toBe(42);
      expect(result.max).toBe(42);
      expect(result.mean).toBe(42);
      expect(result.median).toBe(42);
    });

    it('should use default percentiles', async () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1);

      const result = await processor.calculatePercentiles(values);

      expect(result.percentiles[50]).toBeDefined();
      expect(result.percentiles[90]).toBeDefined();
      expect(result.percentiles[95]).toBeDefined();
      expect(result.percentiles[99]).toBeDefined();
    });
  });

  describe('analyzeTrend (fallback)', () => {
    it('should detect improving trend', async () => {
      const history = Array.from({ length: 20 }, (_, i) => ({
        timestamp: i * 1000,
        value: 50 - i * 2, // Decreasing values (improving for frame time)
      }));

      const result = await processor.analyzeTrend(history);

      expect(result.trend).toBe('improving');
      expect(result.slope).toBeLessThan(0);
      expect(result.confidence).toBeDefined();
    });

    it('should detect degrading trend', async () => {
      const history = Array.from({ length: 20 }, (_, i) => ({
        timestamp: i * 1000,
        value: 10 + i * 2, // Increasing values (degrading for frame time)
      }));

      const result = await processor.analyzeTrend(history);

      expect(result.trend).toBe('degrading');
      expect(result.slope).toBeGreaterThan(0);
    });

    it('should detect stable trend', async () => {
      const history = Array.from({ length: 20 }, (_, i) => ({
        timestamp: i * 1000,
        value: 16.67 + Math.random() * 0.01, // Small variations
      }));

      const result = await processor.analyzeTrend(history);

      expect(result.trend).toBe('stable');
    });

    it('should handle insufficient data', async () => {
      const result = await processor.analyzeTrend([
        { timestamp: 0, value: 10 },
      ]);

      expect(result.trend).toBe('stable');
      expect(result.confidence).toBe('low');
    });

    it('should use custom thresholds', async () => {
      const history = Array.from({ length: 20 }, (_, i) => ({
        timestamp: i * 1000,
        value: 50 - i * 0.5, // Slight decrease
      }));

      const result = await processor.analyzeTrend(history, undefined, {
        improving: -2, // Higher threshold for improvement
        degrading: 2,
      });

      expect(result.trend).toBe('stable'); // Slope not steep enough
    });

    it('should use window size', async () => {
      const history = Array.from({ length: 30 }, (_, i) => ({
        timestamp: i * 1000,
        value: i < 15 ? 50 : 10 + i, // First half decreasing, second half stable/increasing
      }));

      const result = await processor.analyzeTrend(history, 10);

      // Should only analyze last 10 points
      expect(result).toBeDefined();
    });

    it('should calculate R-squared', async () => {
      // Perfect linear trend
      const history = Array.from({ length: 10 }, (_, i) => ({
        timestamp: i * 1000,
        value: i * 10,
      }));

      const result = await processor.analyzeTrend(history);

      expect(result.rSquared).toBeCloseTo(1, 1);
      expect(result.confidence).toBe('high');
    });
  });

  describe('analyzeLeaks (fallback)', () => {
    it('should analyze empty events', async () => {
      const result = await processor.analyzeLeaks([], [], [], 0, {
        leakThresholdMs: 60000,
        memoryGrowthThresholdBytes: 50 * 1024 * 1024,
      });

      expect(result.summary.totalAlerts).toBe(0);
      expect(result.resourceStats.geometries.created).toBe(0);
    });

    it('should count created and disposed resources', async () => {
      const events = [
        createMockLifecycleEvent({
          resourceType: 'geometry',
          eventType: 'created',
        }),
        createMockLifecycleEvent({
          resourceType: 'geometry',
          eventType: 'created',
        }),
        createMockLifecycleEvent({
          resourceType: 'geometry',
          eventType: 'disposed',
        }),
        createMockLifecycleEvent({
          resourceType: 'material',
          eventType: 'created',
        }),
        createMockLifecycleEvent({
          resourceType: 'texture',
          eventType: 'created',
        }),
        createMockLifecycleEvent({
          resourceType: 'texture',
          eventType: 'disposed',
        }),
      ];

      const result = await processor.analyzeLeaks(events, [], [], 0, {
        leakThresholdMs: 60000,
        memoryGrowthThresholdBytes: 50 * 1024 * 1024,
      });

      expect(result.resourceStats.geometries.created).toBe(2);
      expect(result.resourceStats.geometries.disposed).toBe(1);
      expect(result.resourceStats.materials.created).toBe(1);
      expect(result.resourceStats.textures.created).toBe(1);
      expect(result.resourceStats.textures.disposed).toBe(1);
    });

    it('should detect orphaned resources', async () => {
      const now = performance.now();
      const activeResources = [
        {
          uuid: 'geo-1',
          type: 'geometry' as const,
          createdAt: now - 120000, // 2 minutes old
          attachedMeshUuids: [], // Orphaned
          estimatedMemory: 1024 * 1024,
        },
      ];

      const result = await processor.analyzeLeaks(
        [],
        activeResources,
        [],
        now - 180000,
        { leakThresholdMs: 60000, memoryGrowthThresholdBytes: 50 * 1024 * 1024 }
      );

      expect(result.summary.totalAlerts).toBeGreaterThan(0);
      expect(result.alerts.some((a) => a.type === 'orphaned_resource')).toBe(
        true
      );
      expect(result.resourceStats.geometries.orphaned).toBe(1);
    });

    it('should detect memory growth', async () => {
      const memoryHistory = Array.from({ length: 20 }, (_, i) => ({
        timestamp: i * 1000,
        estimatedBytes: 100 * 1024 * 1024 + i * 10 * 1024 * 1024, // Growing by 10MB each
      }));

      const result = await processor.analyzeLeaks([], [], memoryHistory, 0, {
        leakThresholdMs: 60000,
        memoryGrowthThresholdBytes: 50 * 1024 * 1024,
      });

      expect(result.alerts.some((a) => a.type === 'memory_growth')).toBe(true);
    });

    it('should generate recommendations', async () => {
      const now = performance.now();
      const activeResources = [
        {
          uuid: 'geo-1',
          type: 'geometry' as const,
          createdAt: now - 120000,
          attachedMeshUuids: [],
          estimatedMemory: 1024 * 1024,
        },
        {
          uuid: 'mat-1',
          type: 'material' as const,
          createdAt: now - 120000,
          attachedMeshUuids: [],
          detachedAt: now - 90000,
        },
      ];

      const result = await processor.analyzeLeaks(
        [],
        activeResources,
        [],
        now - 180000,
        { leakThresholdMs: 60000, memoryGrowthThresholdBytes: 50 * 1024 * 1024 }
      );

      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});

describe('Global WorkerProcessor', () => {
  afterEach(() => {
    resetWorkerProcessor();
  });

  it('should return singleton instance', () => {
    const p1 = getWorkerProcessor();
    const p2 = getWorkerProcessor();
    expect(p1).toBe(p2);
  });

  it('should reset global instance', () => {
    const p1 = getWorkerProcessor();
    resetWorkerProcessor();
    const p2 = getWorkerProcessor();
    expect(p1).not.toBe(p2);
  });
});

// Helper functions

function createMockFrameStats(overrides: Partial<FrameStats> = {}): FrameStats {
  return {
    frame: 0,
    timestamp: performance.now(),
    deltaTimeMs: 16.67,
    cpuTimeMs: 16.67,
    gpuTimeMs: undefined,
    triangles: 100000,
    drawCalls: 100,
    points: 0,
    lines: 0,
    vertices: 300000,
    objectsVisible: 50,
    objectsTotal: 100,
    objectsCulled: 50,
    materialsUsed: 10,
    backend: 'webgl',
    memory: {
      geometries: 10,
      textures: 5,
      programs: 3,
      textureMemory: 50 * 1024 * 1024,
      geometryMemory: 20 * 1024 * 1024,
      totalGpuMemory: 70 * 1024 * 1024,
      renderTargets: 2,
      renderTargetMemory: 10 * 1024 * 1024,
    },
    performance: {
      fps: 60,
      fpsSmoothed: 60,
      fpsMin: 55,
      fpsMax: 62,
      fps1PercentLow: 50,
      frameBudgetUsed: 80,
      targetFrameTimeMs: 16.67,
      frameTimeVariance: 1.5,
      trianglesPerDrawCall: 1000,
      trianglesPerObject: 500,
      drawCallEfficiency: 85,
      isSmooth: true,
      droppedFrames: 0,
    },
    rendering: {
      shadowMapUpdates: 1,
      shadowCastingLights: 2,
      totalLights: 4,
      activeLights: 3,
      skinnedMeshes: 2,
      totalBones: 50,
      instancedDrawCalls: 5,
      totalInstances: 100,
      transparentObjects: 10,
      transparentDrawCalls: 8,
      renderTargetSwitches: 2,
      programSwitches: 5,
      textureBinds: 20,
      bufferUploads: 10,
      bytesUploaded: 1024 * 1024,
      postProcessingPasses: 2,
      xrActive: false,
      viewports: 1,
    },
    ...overrides,
  };
}

function createMockLifecycleEvent(overrides: {
  resourceType: 'geometry' | 'material' | 'texture';
  eventType: 'created' | 'disposed' | 'attached' | 'detached';
}) {
  return {
    id: `event_${Math.random().toString(36).substr(2, 9)}`,
    resourceType: overrides.resourceType,
    resourceUuid: `uuid_${Math.random().toString(36).substr(2, 9)}`,
    eventType: overrides.eventType,
    timestamp: performance.now(),
  };
}
