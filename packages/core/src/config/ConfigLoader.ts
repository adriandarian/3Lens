/**
 * Configuration Loader
 *
 * Loads and validates 3Lens configuration from various sources:
 * - 3lens.config.js
 * - 3lens.config.ts
 * - Inline config object
 * - URL parameters
 */

import type {
  ProbeConfig,
  RulesConfig,
  SamplingConfig,
  CustomRule,
} from '../types/config';
import type { FrameStats } from '../types/stats';

/**
 * Default performance thresholds
 */
export const DEFAULT_THRESHOLDS: Required<Omit<RulesConfig, 'custom'>> = {
  maxDrawCalls: 1000,
  maxTriangles: 500000,
  maxFrameTimeMs: 16.67, // 60 FPS target
  maxTextures: 100,
  maxTextureMemory: 256 * 1024 * 1024, // 256 MB
  maxGeometryMemory: 128 * 1024 * 1024, // 128 MB
  maxGpuMemory: 512 * 1024 * 1024, // 512 MB
  maxVertices: 1000000,
  maxSkinnedMeshes: 20,
  maxBones: 500,
  maxLights: 10,
  maxShadowLights: 4,
  maxTransparentObjects: 50,
  maxProgramSwitches: 100,
  minFps: 30,
  min1PercentLowFps: 20,
  maxFrameTimeVariance: 10,
};

/**
 * Default sampling configuration
 */
export const DEFAULT_SAMPLING: Required<SamplingConfig> = {
  frameStats: 'every-frame',
  snapshots: 'on-change',
  gpuTiming: true,
  resourceTracking: true,
};

/**
 * Rule violation severity levels
 */
export type ViolationSeverity = 'info' | 'warning' | 'error';

/**
 * A rule violation
 */
export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  severity: ViolationSeverity;
  message: string;
  currentValue: number | string;
  threshold: number | string;
  timestamp: number;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Rule check result with metadata
 */
export interface RuleCheckResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: ViolationSeverity;
  message: string;
  currentValue?: number | string;
  threshold?: number | string;
}

/**
 * Callback for rule violations
 */
export type RuleViolationCallback = (violation: RuleViolation) => void;

/**
 * Configuration loader and manager
 */
export class ConfigLoader {
  private config: ProbeConfig;
  private thresholds: Required<Omit<RulesConfig, 'custom'>>;
  private customRules: CustomRule[] = [];
  private violationCallbacks: RuleViolationCallback[] = [];
  private recentViolations: RuleViolation[] = [];
  private maxViolationHistory = 100;
  private violationCooldowns: Map<string, number> = new Map(); // Prevent spam
  private cooldownMs = 1000; // 1 second cooldown per rule

  constructor(config: ProbeConfig) {
    this.config = config;
    this.thresholds = this.mergeThresholds(config.rules);
    this.customRules = config.rules?.custom || [];
  }

  /**
   * Load config from a file path (for Node.js environments)
   */
  static async loadFromFile(filePath: string): Promise<ProbeConfig> {
    try {
      // Dynamic import for config file
      const module = await import(/* @vite-ignore */ filePath);
      const config = module.default || module;

      // Validate the config
      const validation = ConfigLoader.validateConfig(config);
      if (!validation.valid) {
        console.warn('[3Lens] Config validation errors:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('[3Lens] Config warnings:', validation.warnings);
      }

      return config;
    } catch (error) {
      console.error(`[3Lens] Failed to load config from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Try to auto-discover config file
   */
  static async autoLoadConfig(): Promise<ProbeConfig | null> {
    const configPaths = [
      './3lens.config.js',
      './3lens.config.ts',
      './3lens.config.mjs',
      './.3lens.config.js',
    ];

    for (const path of configPaths) {
      try {
        return await ConfigLoader.loadFromFile(path);
      } catch {
        // Continue to next path
      }
    }

    return null;
  }

  /**
   * Validate a config object
   */
  static validateConfig(config: unknown): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config || typeof config !== 'object') {
      errors.push('Config must be an object');
      return { valid: false, errors, warnings };
    }

    const c = config as Record<string, unknown>;

    // Required fields
    if (!c.appName || typeof c.appName !== 'string') {
      errors.push('appName is required and must be a string');
    }

    // Optional field validation
    if (c.env !== undefined && typeof c.env !== 'string') {
      warnings.push('env should be a string');
    }

    if (c.debug !== undefined && typeof c.debug !== 'boolean') {
      warnings.push('debug should be a boolean');
    }

    // Validate rules
    if (c.rules !== undefined) {
      if (typeof c.rules !== 'object') {
        errors.push('rules must be an object');
      } else {
        const rules = c.rules as Record<string, unknown>;
        const numericRules = [
          'maxDrawCalls',
          'maxTriangles',
          'maxFrameTimeMs',
          'maxTextures',
          'maxTextureMemory',
          'maxGeometryMemory',
          'maxGpuMemory',
          'maxVertices',
          'maxSkinnedMeshes',
          'maxBones',
          'maxLights',
          'maxShadowLights',
          'maxTransparentObjects',
          'maxProgramSwitches',
          'minFps',
          'min1PercentLowFps',
          'maxFrameTimeVariance',
        ];

        for (const rule of numericRules) {
          const value = rules[rule];
          if (value !== undefined && typeof value !== 'number') {
            warnings.push(`rules.${rule} should be a number`);
          }
          if (typeof value === 'number' && value < 0) {
            warnings.push(`rules.${rule} should be positive`);
          }
        }

        // Validate custom rules
        if (rules.custom !== undefined) {
          if (!Array.isArray(rules.custom)) {
            errors.push('rules.custom must be an array');
          } else {
            for (let i = 0; i < rules.custom.length; i++) {
              const customRule = rules.custom[i] as Record<string, unknown>;
              if (!customRule.id || typeof customRule.id !== 'string') {
                errors.push(
                  `rules.custom[${i}].id is required and must be a string`
                );
              }
              if (!customRule.name || typeof customRule.name !== 'string') {
                errors.push(
                  `rules.custom[${i}].name is required and must be a string`
                );
              }
              if (!customRule.check || typeof customRule.check !== 'function') {
                errors.push(
                  `rules.custom[${i}].check is required and must be a function`
                );
              }
            }
          }
        }
      }
    }

    // Validate sampling
    if (c.sampling !== undefined) {
      if (typeof c.sampling !== 'object') {
        errors.push('sampling must be an object');
      } else {
        const sampling = c.sampling as Record<string, unknown>;

        if (sampling.frameStats !== undefined) {
          const valid =
            sampling.frameStats === 'every-frame' ||
            sampling.frameStats === 'on-demand' ||
            typeof sampling.frameStats === 'number';
          if (!valid) {
            warnings.push(
              'sampling.frameStats should be "every-frame", "on-demand", or a number'
            );
          }
        }

        if (sampling.snapshots !== undefined) {
          const valid = ['manual', 'on-change', 'every-frame'].includes(
            sampling.snapshots as string
          );
          if (!valid) {
            warnings.push(
              'sampling.snapshots should be "manual", "on-change", or "every-frame"'
            );
          }
        }

        if (
          sampling.gpuTiming !== undefined &&
          typeof sampling.gpuTiming !== 'boolean'
        ) {
          warnings.push('sampling.gpuTiming should be a boolean');
        }

        if (
          sampling.resourceTracking !== undefined &&
          typeof sampling.resourceTracking !== 'boolean'
        ) {
          warnings.push('sampling.resourceTracking should be a boolean');
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Merge user thresholds with defaults
   */
  private mergeThresholds(
    rules?: RulesConfig
  ): Required<Omit<RulesConfig, 'custom'>> {
    return {
      ...DEFAULT_THRESHOLDS,
      ...rules,
    };
  }

  /**
   * Get current thresholds
   */
  getThresholds(): Required<Omit<RulesConfig, 'custom'>> {
    return { ...this.thresholds };
  }

  /**
   * Update thresholds at runtime
   */
  updateThresholds(updates: Partial<RulesConfig>): void {
    this.thresholds = {
      ...this.thresholds,
      ...updates,
    };
  }

  /**
   * Add a custom rule
   */
  addCustomRule(rule: CustomRule): void {
    this.customRules.push(rule);
  }

  /**
   * Remove a custom rule by ID
   */
  removeCustomRule(ruleId: string): boolean {
    const index = this.customRules.findIndex((r) => r.id === ruleId);
    if (index !== -1) {
      this.customRules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Subscribe to rule violations
   */
  onViolation(callback: RuleViolationCallback): () => void {
    this.violationCallbacks.push(callback);
    return () => {
      const index = this.violationCallbacks.indexOf(callback);
      if (index !== -1) {
        this.violationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Check all rules against current frame stats
   */
  checkRules(stats: FrameStats): RuleCheckResult[] {
    const results: RuleCheckResult[] = [];
    const now = performance.now();

    // Built-in threshold checks
    results.push(...this.checkBuiltInRules(stats));

    // Custom rule checks
    for (const rule of this.customRules) {
      try {
        const result = rule.check(stats);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          passed: result.passed,
          severity: result.severity || 'warning',
          message: result.message || (result.passed ? 'Passed' : 'Failed'),
        });
      } catch (error) {
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          passed: false,
          severity: 'error',
          message: `Rule check threw error: ${error}`,
        });
      }
    }

    // Report violations
    for (const result of results) {
      if (!result.passed) {
        // Check cooldown
        const lastViolation = this.violationCooldowns.get(result.ruleId);
        if (lastViolation && now - lastViolation < this.cooldownMs) {
          continue;
        }

        const violation: RuleViolation = {
          ruleId: result.ruleId,
          ruleName: result.ruleName,
          severity: result.severity,
          message: result.message,
          currentValue: result.currentValue ?? 'N/A',
          threshold: result.threshold ?? 'N/A',
          timestamp: now,
        };

        this.recentViolations.push(violation);
        if (this.recentViolations.length > this.maxViolationHistory) {
          this.recentViolations.shift();
        }

        this.violationCooldowns.set(result.ruleId, now);

        for (const callback of this.violationCallbacks) {
          try {
            callback(violation);
          } catch (e) {
            console.error('[3Lens] Error in violation callback:', e);
          }
        }
      }
    }

    return results;
  }

  /**
   * Check built-in threshold rules
   */
  private checkBuiltInRules(stats: FrameStats): RuleCheckResult[] {
    const results: RuleCheckResult[] = [];
    const t = this.thresholds;
    const memory = stats.memory;

    // Draw calls
    results.push({
      ruleId: 'maxDrawCalls',
      ruleName: 'Max Draw Calls',
      passed: stats.drawCalls <= t.maxDrawCalls,
      severity: stats.drawCalls > t.maxDrawCalls * 1.5 ? 'error' : 'warning',
      message: `Draw calls: ${stats.drawCalls} (max: ${t.maxDrawCalls})`,
      currentValue: stats.drawCalls,
      threshold: t.maxDrawCalls,
    });

    // Triangles
    results.push({
      ruleId: 'maxTriangles',
      ruleName: 'Max Triangles',
      passed: stats.triangles <= t.maxTriangles,
      severity: stats.triangles > t.maxTriangles * 1.5 ? 'error' : 'warning',
      message: `Triangles: ${stats.triangles.toLocaleString()} (max: ${t.maxTriangles.toLocaleString()})`,
      currentValue: stats.triangles,
      threshold: t.maxTriangles,
    });

    // Frame time
    results.push({
      ruleId: 'maxFrameTimeMs',
      ruleName: 'Max Frame Time',
      passed: stats.cpuTimeMs <= t.maxFrameTimeMs,
      severity: stats.cpuTimeMs > t.maxFrameTimeMs * 2 ? 'error' : 'warning',
      message: `Frame time: ${stats.cpuTimeMs.toFixed(2)}ms (max: ${t.maxFrameTimeMs}ms)`,
      currentValue: stats.cpuTimeMs.toFixed(2),
      threshold: t.maxFrameTimeMs,
    });

    // FPS
    const fps =
      stats.performance?.fps ??
      (stats.cpuTimeMs > 0 ? 1000 / stats.cpuTimeMs : 60);
    results.push({
      ruleId: 'minFps',
      ruleName: 'Min FPS',
      passed: fps >= t.minFps,
      severity: fps < t.minFps / 2 ? 'error' : 'warning',
      message: `FPS: ${Math.round(fps)} (min: ${t.minFps})`,
      currentValue: Math.round(fps),
      threshold: t.minFps,
    });

    // Memory checks (if available)
    if (memory) {
      // Textures count
      results.push({
        ruleId: 'maxTextures',
        ruleName: 'Max Textures',
        passed: memory.textures <= t.maxTextures,
        severity: memory.textures > t.maxTextures * 1.5 ? 'error' : 'warning',
        message: `Textures: ${memory.textures} (max: ${t.maxTextures})`,
        currentValue: memory.textures,
        threshold: t.maxTextures,
      });

      // Texture memory
      results.push({
        ruleId: 'maxTextureMemory',
        ruleName: 'Max Texture Memory',
        passed: memory.textureMemory <= t.maxTextureMemory,
        severity:
          memory.textureMemory > t.maxTextureMemory * 1.5 ? 'error' : 'warning',
        message: `Texture memory: ${this.formatBytes(memory.textureMemory)} (max: ${this.formatBytes(t.maxTextureMemory)})`,
        currentValue: this.formatBytes(memory.textureMemory),
        threshold: this.formatBytes(t.maxTextureMemory),
      });

      // Geometry memory
      results.push({
        ruleId: 'maxGeometryMemory',
        ruleName: 'Max Geometry Memory',
        passed: memory.geometryMemory <= t.maxGeometryMemory,
        severity:
          memory.geometryMemory > t.maxGeometryMemory * 1.5
            ? 'error'
            : 'warning',
        message: `Geometry memory: ${this.formatBytes(memory.geometryMemory)} (max: ${this.formatBytes(t.maxGeometryMemory)})`,
        currentValue: this.formatBytes(memory.geometryMemory),
        threshold: this.formatBytes(t.maxGeometryMemory),
      });

      // Total GPU memory
      results.push({
        ruleId: 'maxGpuMemory',
        ruleName: 'Max GPU Memory',
        passed: memory.totalGpuMemory <= t.maxGpuMemory,
        severity:
          memory.totalGpuMemory > t.maxGpuMemory * 1.5 ? 'error' : 'warning',
        message: `GPU memory: ${this.formatBytes(memory.totalGpuMemory)} (max: ${this.formatBytes(t.maxGpuMemory)})`,
        currentValue: this.formatBytes(memory.totalGpuMemory),
        threshold: this.formatBytes(t.maxGpuMemory),
      });
    }

    // Rendering checks
    if (stats.rendering) {
      // Lights
      results.push({
        ruleId: 'maxLights',
        ruleName: 'Max Lights',
        passed: stats.rendering.totalLights <= t.maxLights,
        severity:
          stats.rendering.totalLights > t.maxLights * 1.5 ? 'error' : 'warning',
        message: `Lights: ${stats.rendering.totalLights} (max: ${t.maxLights})`,
        currentValue: stats.rendering.totalLights,
        threshold: t.maxLights,
      });

      // Shadow lights
      results.push({
        ruleId: 'maxShadowLights',
        ruleName: 'Max Shadow Lights',
        passed: stats.rendering.shadowCastingLights <= t.maxShadowLights,
        severity:
          stats.rendering.shadowCastingLights > t.maxShadowLights * 1.5
            ? 'error'
            : 'warning',
        message: `Shadow lights: ${stats.rendering.shadowCastingLights} (max: ${t.maxShadowLights})`,
        currentValue: stats.rendering.shadowCastingLights,
        threshold: t.maxShadowLights,
      });
    }

    return results;
  }

  /**
   * Get recent violations
   */
  getRecentViolations(): RuleViolation[] {
    return [...this.recentViolations];
  }

  /**
   * Get violations by severity
   */
  getViolationsBySeverity(severity: ViolationSeverity): RuleViolation[] {
    return this.recentViolations.filter((v) => v.severity === severity);
  }

  /**
   * Clear violation history
   */
  clearViolations(): void {
    this.recentViolations = [];
    this.violationCooldowns.clear();
  }

  /**
   * Get violation summary
   */
  getViolationSummary(): {
    errors: number;
    warnings: number;
    info: number;
    total: number;
  } {
    return {
      errors: this.recentViolations.filter((v) => v.severity === 'error')
        .length,
      warnings: this.recentViolations.filter((v) => v.severity === 'warning')
        .length,
      info: this.recentViolations.filter((v) => v.severity === 'info').length,
      total: this.recentViolations.length,
    };
  }

  /**
   * Export current config
   */
  exportConfig(): ProbeConfig {
    return {
      ...this.config,
      rules: {
        ...this.thresholds,
        custom: this.customRules,
      },
    };
  }

  /**
   * Generate config file content
   */
  generateConfigFileContent(): string {
    const config = this.exportConfig();

    // Remove functions from custom rules for serialization
    const serializableConfig = {
      ...config,
      rules: config.rules
        ? {
            ...config.rules,
            custom: config.rules.custom?.map((r) => ({
              id: r.id,
              name: r.name,
              check: '/* Custom function - define in config file */',
            })),
          }
        : undefined,
    };

    return `/**
 * 3Lens Configuration
 * 
 * This file configures the 3Lens developer toolkit for your Three.js application.
 * See documentation at https://3lens.dev/docs/configuration
 */

/** @type {import('@3lens/core').ProbeConfig} */
export default ${JSON.stringify(serializableConfig, null, 2).replace(/"\/\* Custom function - define in config file \*\/"/g, '(stats) => ({ passed: true })')};
`;
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
}
