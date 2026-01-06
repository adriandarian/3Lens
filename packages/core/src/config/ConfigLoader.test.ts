/**
 * ConfigLoader Test Suite
 * 
 * Tests for the configuration loading, validation, and rule checking system.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ConfigLoader,
  DEFAULT_THRESHOLDS,
  DEFAULT_SAMPLING,
  type RuleViolation,
  type ViolationSeverity,
} from './ConfigLoader';
import type { ProbeConfig, CustomRule } from '../types/config';
import type { FrameStats, MemoryStats, RenderingStats, PerformanceMetrics } from '../types/stats';

// Helper to create mock frame stats
function createMockFrameStats(overrides: Partial<FrameStats> = {}): FrameStats {
  const baseMemory: MemoryStats = {
    geometries: 10,
    textures: 20,
    programs: 5,
    geometryMemory: 1000000,
    textureMemory: 5000000,
    totalGpuMemory: 10000000,
    renderTargets: 2,
    renderTargetMemory: 2000000,
    ...overrides.memory,
  };

  const basePerformance: PerformanceMetrics = {
    fps: 60,
    fpsMin: 55,
    fpsMax: 65,
    fps1PercentLow: 50,
    frameTimeVariance: 2,
    ...overrides.performance,
  };

  const baseRendering: RenderingStats = {
    totalLights: 3,
    activeLights: 1,
    skinnedMeshes: 2,
    totalBones: 50,
    transparentObjects: 5,
    programSwitches: 15,
    textureBinds: 30,
    shadowMapUpdates: 0,
    shadowCastingLights: 0,
    instancedDrawCalls: 0,
    totalInstances: 0,
    transparentDrawCalls: 0,
    renderTargetSwitches: 0,
    bufferUploads: 0,
    bytesUploaded: 0,
    postProcessingPasses: 0,
    xrActive: false,
    viewports: 1,
    ...overrides.rendering,
  };

  return {
    frame: 1,
    timestamp: performance.now(),
    deltaTimeMs: 16.67,
    cpuTimeMs: 10,
    triangles: 50000,
    drawCalls: 100,
    points: 0,
    lines: 0,
    vertices: 150000,
    objectsVisible: 50,
    objectsTotal: 100,
    objectsCulled: 50,
    materialsUsed: 20,
    memory: baseMemory,
    performance: basePerformance,
    rendering: baseRendering,
    backend: 'webgl',
    ...overrides,
  };
}

describe('ConfigLoader', () => {
  describe('DEFAULT_THRESHOLDS', () => {
    it('should have all expected threshold properties', () => {
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxDrawCalls');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxTriangles');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxFrameTimeMs');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxTextures');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxTextureMemory');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxGeometryMemory');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxGpuMemory');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxVertices');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxSkinnedMeshes');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxBones');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxLights');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxShadowLights');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxTransparentObjects');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxProgramSwitches');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('minFps');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('min1PercentLowFps');
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxFrameTimeVariance');
    });

    it('should have sensible default values', () => {
      expect(DEFAULT_THRESHOLDS.maxDrawCalls).toBe(1000);
      expect(DEFAULT_THRESHOLDS.maxTriangles).toBe(500000);
      expect(DEFAULT_THRESHOLDS.maxFrameTimeMs).toBeCloseTo(16.67, 1);
      expect(DEFAULT_THRESHOLDS.minFps).toBe(30);
    });
  });

  describe('DEFAULT_SAMPLING', () => {
    it('should have all expected sampling properties', () => {
      expect(DEFAULT_SAMPLING).toHaveProperty('frameStats');
      expect(DEFAULT_SAMPLING).toHaveProperty('snapshots');
      expect(DEFAULT_SAMPLING).toHaveProperty('gpuTiming');
      expect(DEFAULT_SAMPLING).toHaveProperty('resourceTracking');
    });

    it('should have sensible defaults', () => {
      expect(DEFAULT_SAMPLING.frameStats).toBe('every-frame');
      expect(DEFAULT_SAMPLING.snapshots).toBe('on-change');
      expect(DEFAULT_SAMPLING.gpuTiming).toBe(true);
      expect(DEFAULT_SAMPLING.resourceTracking).toBe(true);
    });
  });

  describe('validateConfig', () => {
    it('should accept valid config with appName', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'TestApp',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object config', () => {
      const result = ConfigLoader.validateConfig(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Config must be an object');
    });

    it('should reject config without appName', () => {
      const result = ConfigLoader.validateConfig({});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('appName is required and must be a string');
    });

    it('should reject config with non-string appName', () => {
      const result = ConfigLoader.validateConfig({ appName: 123 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('appName is required and must be a string');
    });

    it('should warn about invalid env type', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        env: 123,
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('env should be a string');
    });

    it('should warn about invalid debug type', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        debug: 'true',
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('debug should be a boolean');
    });

    it('should reject non-object rules', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        rules: 'invalid',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('rules must be an object');
    });

    it('should warn about non-numeric rule values', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        rules: { maxDrawCalls: '100' },
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('rules.maxDrawCalls should be a number');
    });

    it('should warn about negative rule values', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        rules: { maxTriangles: -100 },
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('rules.maxTriangles should be positive');
    });

    it('should reject non-array custom rules', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        rules: { custom: 'invalid' },
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('rules.custom must be an array');
    });

    it('should validate custom rule structure', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        rules: {
          custom: [
            { name: 'test' }, // missing id and check
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('rules.custom[0].id'))).toBe(true);
      expect(result.errors.some(e => e.includes('rules.custom[0].check'))).toBe(true);
    });

    it('should accept valid custom rules', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        rules: {
          custom: [
            { id: 'test', name: 'Test Rule', check: () => ({ passed: true }) },
          ],
        },
      });
      expect(result.valid).toBe(true);
    });

    it('should reject non-object sampling', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        sampling: 'invalid',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('sampling must be an object');
    });

    it('should warn about invalid frameStats value', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        sampling: { frameStats: 'invalid' },
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('sampling.frameStats'))).toBe(true);
    });

    it('should accept numeric frameStats', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        sampling: { frameStats: 5 },
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.filter(w => w.includes('sampling.frameStats'))).toHaveLength(0);
    });

    it('should warn about invalid snapshots value', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        sampling: { snapshots: 'invalid' },
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('sampling.snapshots'))).toBe(true);
    });

    it('should warn about non-boolean gpuTiming', () => {
      const result = ConfigLoader.validateConfig({
        appName: 'Test',
        sampling: { gpuTiming: 'true' },
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('sampling.gpuTiming should be a boolean');
    });
  });

  describe('constructor', () => {
    it('should create instance with default thresholds', () => {
      const config: ProbeConfig = { appName: 'Test' };
      const loader = new ConfigLoader(config);
      const thresholds = loader.getThresholds();
      
      expect(thresholds.maxDrawCalls).toBe(DEFAULT_THRESHOLDS.maxDrawCalls);
    });

    it('should merge custom thresholds with defaults', () => {
      const config: ProbeConfig = {
        appName: 'Test',
        rules: { maxDrawCalls: 500 },
      };
      const loader = new ConfigLoader(config);
      const thresholds = loader.getThresholds();
      
      expect(thresholds.maxDrawCalls).toBe(500);
      expect(thresholds.maxTriangles).toBe(DEFAULT_THRESHOLDS.maxTriangles);
    });

    it('should load custom rules from config', () => {
      const customRule: CustomRule = {
        id: 'custom1',
        name: 'Custom Rule',
        check: () => ({ passed: true }),
      };
      const config: ProbeConfig = {
        appName: 'Test',
        rules: { custom: [customRule] },
      };
      const loader = new ConfigLoader(config);
      
      // Custom rules are used in checkRules
      const stats = createMockFrameStats();
      const results = loader.checkRules(stats);
      const customResult = results.find(r => r.ruleId === 'custom1');
      expect(customResult).toBeDefined();
    });
  });

  describe('getThresholds', () => {
    it('should return a copy of thresholds', () => {
      const loader = new ConfigLoader({ appName: 'Test' });
      const thresholds1 = loader.getThresholds();
      const thresholds2 = loader.getThresholds();
      
      expect(thresholds1).not.toBe(thresholds2);
      expect(thresholds1).toEqual(thresholds2);
    });
  });

  describe('updateThresholds', () => {
    it('should update specific thresholds', () => {
      const loader = new ConfigLoader({ appName: 'Test' });
      loader.updateThresholds({ maxDrawCalls: 200 });
      
      expect(loader.getThresholds().maxDrawCalls).toBe(200);
    });

    it('should preserve other thresholds when updating', () => {
      const loader = new ConfigLoader({ appName: 'Test' });
      const originalTriangles = loader.getThresholds().maxTriangles;
      
      loader.updateThresholds({ maxDrawCalls: 200 });
      
      expect(loader.getThresholds().maxTriangles).toBe(originalTriangles);
    });
  });

  describe('addCustomRule', () => {
    it('should add a custom rule', () => {
      const loader = new ConfigLoader({ appName: 'Test' });
      const rule: CustomRule = {
        id: 'newRule',
        name: 'New Rule',
        check: () => ({ passed: true }),
      };
      
      loader.addCustomRule(rule);
      
      const stats = createMockFrameStats();
      const results = loader.checkRules(stats);
      expect(results.some(r => r.ruleId === 'newRule')).toBe(true);
    });
  });

  describe('removeCustomRule', () => {
    it('should remove an existing custom rule', () => {
      const rule: CustomRule = {
        id: 'toRemove',
        name: 'To Remove',
        check: () => ({ passed: true }),
      };
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { custom: [rule] },
      });
      
      const removed = loader.removeCustomRule('toRemove');
      
      expect(removed).toBe(true);
    });

    it('should return false for non-existent rule', () => {
      const loader = new ConfigLoader({ appName: 'Test' });
      
      const removed = loader.removeCustomRule('nonExistent');
      
      expect(removed).toBe(false);
    });
  });

  describe('onViolation', () => {
    it('should call callback on violation', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxDrawCalls: 50 }, // Low threshold to trigger
      });
      const callback = vi.fn();
      
      loader.onViolation(callback);
      const stats = createMockFrameStats({ drawCalls: 100 });
      loader.checkRules(stats);
      
      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0].ruleId).toBe('maxDrawCalls');
    });

    it('should return unsubscribe function', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxDrawCalls: 50 },
      });
      const callback = vi.fn();
      
      const unsubscribe = loader.onViolation(callback);
      unsubscribe();
      
      const stats = createMockFrameStats({ drawCalls: 100 });
      loader.checkRules(stats);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should respect violation cooldown', async () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxDrawCalls: 50 },
      });
      const callback = vi.fn();
      loader.onViolation(callback);
      
      // Create stats that only violate maxDrawCalls, not other rules
      const stats = createMockFrameStats({ 
        drawCalls: 100, // > 50 (violates)
        triangles: 1000, // well under 500000 default
        cpuTimeMs: 5, // well under 16.67 default
      });
      loader.checkRules(stats);
      loader.checkRules(stats); // Should be blocked by cooldown
      
      // Only count calls for the draw calls rule specifically
      const drawCallViolations = callback.mock.calls.filter(
        (call: any) => call[0].ruleId === 'maxDrawCalls'
      );
      expect(drawCallViolations.length).toBe(1);
    });
  });

  describe('checkRules', () => {
    it('should check draw calls threshold', () => {
      const loader = new ConfigLoader({ appName: 'Test' });
      const stats = createMockFrameStats({ drawCalls: 100 });
      
      const results = loader.checkRules(stats);
      const drawCallResult = results.find(r => r.ruleId === 'maxDrawCalls');
      
      expect(drawCallResult).toBeDefined();
      expect(drawCallResult!.passed).toBe(true);
    });

    it('should fail draw calls check when exceeded', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxDrawCalls: 50 },
      });
      const stats = createMockFrameStats({ drawCalls: 100 });
      
      const results = loader.checkRules(stats);
      const drawCallResult = results.find(r => r.ruleId === 'maxDrawCalls');
      
      expect(drawCallResult!.passed).toBe(false);
    });

    it('should set error severity when significantly exceeded', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxDrawCalls: 50 },
      });
      const stats = createMockFrameStats({ drawCalls: 100 }); // > 50 * 1.5
      
      const results = loader.checkRules(stats);
      const drawCallResult = results.find(r => r.ruleId === 'maxDrawCalls');
      
      expect(drawCallResult!.severity).toBe('error');
    });

    it('should check triangles threshold', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxTriangles: 10000 },
      });
      const stats = createMockFrameStats({ triangles: 50000 });
      
      const results = loader.checkRules(stats);
      const result = results.find(r => r.ruleId === 'maxTriangles');
      
      expect(result!.passed).toBe(false);
    });

    it('should check frame time threshold', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxFrameTimeMs: 10 },
      });
      const stats = createMockFrameStats({ cpuTimeMs: 20 });
      
      const results = loader.checkRules(stats);
      const result = results.find(r => r.ruleId === 'maxFrameTimeMs');
      
      expect(result!.passed).toBe(false);
    });

    it('should check min FPS threshold', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { minFps: 60 },
      });
      const stats = createMockFrameStats({
        cpuTimeMs: 33.33, // ~30 FPS
        performance: { 
          fps: 30, 
          fpsMin: 25, 
          fpsMax: 35, 
          fps1PercentLow: 20, 
          frameTimeVariance: 5,
          fpsSmoothed: 30,
          frameBudgetUsed: 200,
          targetFrameTimeMs: 16.67,
          trianglesPerDrawCall: 500,
          trianglesPerObject: 1000,
          drawCallEfficiency: 0.8,
          isSmooth: false,
          droppedFrames: 5,
        },
      });
      
      const results = loader.checkRules(stats);
      const result = results.find(r => r.ruleId === 'minFps');
      
      expect(result!.passed).toBe(false);
    });

    it('should check memory thresholds when memory stats available', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxTextures: 10 },
      });
      const stats = createMockFrameStats({
        memory: {
          geometries: 5,
          textures: 50, // Exceeds threshold
          programs: 3,
          geometryMemory: 1000000,
          textureMemory: 5000000,
          totalGpuMemory: 10000000,
          renderTargets: 2,
          renderTargetMemory: 2000000,
        },
      });
      
      const results = loader.checkRules(stats);
      const result = results.find(r => r.ruleId === 'maxTextures');
      
      expect(result!.passed).toBe(false);
    });

    it('should check lights threshold', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxLights: 5 },
      });
      const stats = createMockFrameStats({
        rendering: {
          totalLights: 10, // Exceeds threshold
          activeLights: 8,
          skinnedMeshes: 1,
          totalBones: 20,
          transparentObjects: 3,
          programSwitches: 10,
          textureBinds: 20,
          shadowMapUpdates: 0,
          shadowCastingLights: 0,
          instancedDrawCalls: 0,
          totalInstances: 0,
          transparentDrawCalls: 0,
          renderTargetSwitches: 0,
          bufferUploads: 0,
          bytesUploaded: 0,
          postProcessingPasses: 0,
          xrActive: false,
          viewports: 1,
        },
      });
      
      const results = loader.checkRules(stats);
      const result = results.find(r => r.ruleId === 'maxLights');
      
      expect(result!.passed).toBe(false);
    });

    it('should execute custom rules', () => {
      const customRule: CustomRule = {
        id: 'customCheck',
        name: 'Custom Check',
        check: (stats) => ({
          passed: stats.triangles < 100000,
          message: 'Custom message',
          severity: 'warning',
        }),
      };
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { custom: [customRule] },
      });
      const stats = createMockFrameStats({ triangles: 150000 });
      
      const results = loader.checkRules(stats);
      const result = results.find(r => r.ruleId === 'customCheck');
      
      expect(result!.passed).toBe(false);
      expect(result!.message).toBe('Custom message');
    });

    it('should handle custom rule errors gracefully', () => {
      const customRule: CustomRule = {
        id: 'errorRule',
        name: 'Error Rule',
        check: () => {
          throw new Error('Test error');
        },
      };
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { custom: [customRule] },
      });
      const stats = createMockFrameStats();
      
      const results = loader.checkRules(stats);
      const result = results.find(r => r.ruleId === 'errorRule');
      
      expect(result!.passed).toBe(false);
      expect(result!.severity).toBe('error');
      expect(result!.message).toContain('Test error');
    });
  });

  describe('getRecentViolations', () => {
    it('should return copy of violations', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxDrawCalls: 50 },
      });
      const stats = createMockFrameStats({ drawCalls: 100 });
      loader.checkRules(stats);
      
      const violations1 = loader.getRecentViolations();
      const violations2 = loader.getRecentViolations();
      
      expect(violations1).not.toBe(violations2);
      expect(violations1.length).toBeGreaterThan(0);
    });
  });

  describe('getViolationsBySeverity', () => {
    it('should filter violations by severity', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: {
          maxDrawCalls: 10,   // Will be error (100 > 10 * 1.5)
          maxTriangles: 40000, // Will be warning (50000 < 40000 * 1.5)
        },
      });
      const stats = createMockFrameStats({
        drawCalls: 100,
        triangles: 50000,
      });
      loader.checkRules(stats);
      
      const errors = loader.getViolationsBySeverity('error');
      const warnings = loader.getViolationsBySeverity('warning');
      
      expect(errors.every(v => v.severity === 'error')).toBe(true);
      expect(warnings.every(v => v.severity === 'warning')).toBe(true);
    });
  });

  describe('clearViolations', () => {
    it('should clear all violations', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxDrawCalls: 50 },
      });
      const stats = createMockFrameStats({ drawCalls: 100 });
      loader.checkRules(stats);
      
      expect(loader.getRecentViolations().length).toBeGreaterThan(0);
      
      loader.clearViolations();
      
      expect(loader.getRecentViolations()).toHaveLength(0);
    });
  });

  describe('getViolationSummary', () => {
    it('should return correct violation counts', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: { maxDrawCalls: 10 },
      });
      const stats = createMockFrameStats({ drawCalls: 100 });
      loader.checkRules(stats);
      
      const summary = loader.getViolationSummary();
      
      expect(summary.total).toBeGreaterThan(0);
      expect(typeof summary.errors).toBe('number');
      expect(typeof summary.warnings).toBe('number');
      expect(typeof summary.info).toBe('number');
    });
  });

  describe('exportConfig', () => {
    it('should export current configuration', () => {
      const loader = new ConfigLoader({
        appName: 'TestApp',
        env: 'development',
        rules: { maxDrawCalls: 500 },
      });
      
      const exported = loader.exportConfig();
      
      expect(exported.appName).toBe('TestApp');
      expect(exported.rules).toBeDefined();
    });
  });

  describe('generateConfigFileContent', () => {
    it('should generate valid config file content', () => {
      const loader = new ConfigLoader({
        appName: 'TestApp',
        rules: { maxDrawCalls: 500 },
      });
      
      const content = loader.generateConfigFileContent();
      
      expect(content).toContain('3Lens Configuration');
      expect(content).toContain('TestApp');
      expect(content).toContain('export default');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly in rule messages', () => {
      const loader = new ConfigLoader({
        appName: 'Test',
        rules: {
          maxTextureMemory: 100 * 1024 * 1024, // 100MB threshold
        },
      });
      const stats = createMockFrameStats({
        memory: {
          geometries: 5,
          textures: 10,
          programs: 3,
          geometryMemory: 1000000,
          textureMemory: 200 * 1024 * 1024, // 200MB - exceeds threshold
          totalGpuMemory: 300 * 1024 * 1024,
          renderTargets: 2,
          renderTargetMemory: 2000000,
        },
      });
      
      const results = loader.checkRules(stats);
      const result = results.find(r => r.ruleId === 'maxTextureMemory');
      
      expect(result!.message).toContain('MB');
    });
  });

  describe('autoLoadConfig', () => {
    it('should return null when no config file found', async () => {
      const config = await ConfigLoader.autoLoadConfig();
      // In test environment, no config file should be found
      expect(config).toBeNull();
    });
  });
});
