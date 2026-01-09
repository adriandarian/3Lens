import { describe, it, expect, beforeEach } from 'vitest';
import {
  PerformanceTracker,
  createEmptyMemoryStats,
  createEmptyRenderingStats,
  createEmptyPerformanceMetrics,
  estimateTextureMemory,
  estimateGeometryMemory,
} from './performance-calculator';

describe('PerformanceTracker', () => {
  let tracker: PerformanceTracker;

  beforeEach(() => {
    tracker = new PerformanceTracker(100, 60);
  });

  describe('recordFrame', () => {
    it('should record a frame and update history', () => {
      tracker.recordFrame(16.67, 1000);
      expect(tracker.getAverageFrameTime()).toBeCloseTo(16.67, 1);
    });

    it('should limit history to maxSamples', () => {
      for (let i = 0; i < 150; i++) {
        tracker.recordFrame(16, i * 16);
      }
      // History should be capped at 100 samples
      expect(tracker.getAverageFrameTime()).toBeCloseTo(16, 1);
    });

    it('should track dropped frames when frame time exceeds threshold', () => {
      // Target frame time is ~16.67ms, so > 25ms should be dropped
      tracker.recordFrame(30, 1000);
      const metrics = tracker.getMetrics(30);
      expect(metrics.droppedFrames).toBeGreaterThan(0);
    });
  });

  describe('getMetrics', () => {
    it('should return valid metrics after recording frames', () => {
      tracker.recordFrame(16.67, 1000);
      tracker.recordFrame(16.67, 2000);
      tracker.recordFrame(16.67, 3000);

      const metrics = tracker.getMetrics(16.67);

      expect(metrics.fps).toBe(60);
      expect(metrics.fpsSmoothed).toBe(60);
      expect(metrics.isSmooth).toBe(true);
    });

    it('should indicate non-smooth rendering when frame time is too high', () => {
      tracker.recordFrame(33.33, 1000);
      const metrics = tracker.getMetrics(33.33);

      expect(metrics.isSmooth).toBe(false);
    });
  });

  describe('getPercentile', () => {
    it('should return 0 for empty history', () => {
      expect(tracker.getPercentile(99)).toBe(0);
    });

    it('should calculate correct percentiles', () => {
      // Add frames with varying times
      for (let i = 1; i <= 100; i++) {
        tracker.recordFrame(i, i * 16);
      }

      const p50 = tracker.getPercentile(50);
      const p99 = tracker.getPercentile(99);

      expect(p50).toBe(50);
      expect(p99).toBe(99);
    });
  });

  describe('getDeltaTime', () => {
    it('should return default for first frame', () => {
      expect(tracker.getDeltaTime(1000)).toBeCloseTo(16.67, 1);
    });

    it('should calculate delta after recording a frame', () => {
      tracker.recordFrame(16, 1000);
      expect(tracker.getDeltaTime(1016)).toBe(16);
    });
  });

  describe('reset', () => {
    it('should clear all history', () => {
      tracker.recordFrame(16, 1000);
      tracker.recordFrame(16, 2000);
      tracker.reset();

      expect(tracker.getAverageFrameTime()).toBe(0);
      expect(tracker.getAverageFps()).toBe(0);
    });
  });
});

describe('createEmptyMemoryStats', () => {
  it('should create valid empty memory stats', () => {
    const stats = createEmptyMemoryStats();

    expect(stats.geometries).toBe(0);
    expect(stats.textures).toBe(0);
    expect(stats.geometryMemory).toBe(0);
    expect(stats.textureMemory).toBe(0);
    expect(stats.totalGpuMemory).toBe(0);
  });
});

describe('createEmptyRenderingStats', () => {
  it('should create valid empty rendering stats', () => {
    const stats = createEmptyRenderingStats();

    expect(stats.shadowMapUpdates).toBe(0);
    expect(stats.totalLights).toBe(0);
    expect(stats.transparentObjects).toBe(0);
    expect(stats.viewports).toBe(1);
    expect(stats.xrActive).toBe(false);
  });
});

describe('createEmptyPerformanceMetrics', () => {
  it('should create valid empty performance metrics', () => {
    const metrics = createEmptyPerformanceMetrics();

    expect(metrics.fps).toBe(0);
    expect(metrics.fpsSmoothed).toBe(0);
    expect(metrics.targetFrameTimeMs).toBeCloseTo(16.67, 1);
    expect(metrics.isSmooth).toBe(true);
    expect(metrics.droppedFrames).toBe(0);
  });
});

describe('estimateTextureMemory', () => {
  it('should estimate RGBA texture memory', () => {
    // 1024x1024 RGBA = 4MB + ~33% for mipmaps
    const memory = estimateTextureMemory(1024, 1024, 'RGBA', true);
    expect(memory).toBeGreaterThan(4 * 1024 * 1024);
    expect(memory).toBeLessThan(6 * 1024 * 1024);
  });

  it('should estimate RGB texture memory (smaller)', () => {
    const rgbaMemory = estimateTextureMemory(1024, 1024, 'RGBA', false);
    const rgbMemory = estimateTextureMemory(1024, 1024, 'RGB', false);

    expect(rgbMemory).toBeLessThan(rgbaMemory);
  });

  it('should handle compressed formats', () => {
    const uncompressed = estimateTextureMemory(1024, 1024, 'RGBA', false);
    const compressed = estimateTextureMemory(1024, 1024, 'DXT1', false);

    expect(compressed).toBeLessThan(uncompressed);
  });

  it('should add mipmap overhead when enabled', () => {
    const withMips = estimateTextureMemory(1024, 1024, 'RGBA', true);
    const withoutMips = estimateTextureMemory(1024, 1024, 'RGBA', false);

    expect(withMips).toBeGreaterThan(withoutMips);
  });
});

describe('estimateGeometryMemory', () => {
  it('should estimate basic geometry memory', () => {
    // 1000 vertices, 3000 indices, with normals and UVs
    const memory = estimateGeometryMemory(1000, 3000, true, true, false, false);

    // Position (12) + Normal (12) + UV (8) = 32 bytes per vertex
    // 1000 * 32 = 32000 bytes for vertices
    // 3000 * 2 = 6000 bytes for indices (16-bit)
    expect(memory).toBe(38000);
  });

  it('should increase memory with more attributes', () => {
    const basic = estimateGeometryMemory(1000, 3000, true, true, false, false);
    const full = estimateGeometryMemory(1000, 3000, true, true, true, true);

    expect(full).toBeGreaterThan(basic);
  });

  it('should use 32-bit indices for large meshes', () => {
    // More than 65535 indices should use 32-bit
    const smallMesh = estimateGeometryMemory(
      1000,
      60000,
      false,
      false,
      false,
      false
    );
    const largeMesh = estimateGeometryMemory(
      1000,
      70000,
      false,
      false,
      false,
      false
    );

    // Large mesh should have ~2x index memory (4 bytes vs 2 bytes per index)
    const smallIndexMem = 60000 * 2;
    const largeIndexMem = 70000 * 4;
    expect(largeMesh - smallMesh).toBeCloseTo(
      largeIndexMem - smallIndexMem,
      -1
    );
  });
});
