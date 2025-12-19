import type { FrameStats } from './stats';

/**
 * Main configuration for creating a DevtoolProbe
 */
export interface ProbeConfig {
  /**
   * Application name for identification
   */
  appName: string;

  /**
   * Environment identifier
   * @default 'development'
   */
  env?: 'development' | 'staging' | 'production' | string;

  /**
   * Sampling configuration
   */
  sampling?: SamplingConfig;

  /**
   * Performance rules and thresholds
   */
  rules?: RulesConfig;

  /**
   * Custom tags for organization
   */
  tags?: Record<string, string>;

  /**
   * Enable verbose logging
   * @default false
   */
  debug?: boolean;
}

/**
 * Configuration for data sampling rates
 */
export interface SamplingConfig {
  /**
   * How often to collect frame stats
   * - 'every-frame': collect every frame
   * - 'on-demand': only when requested
   * - number: collect every N frames
   * @default 'every-frame'
   */
  frameStats?: 'every-frame' | 'on-demand' | number;

  /**
   * When to take scene snapshots
   * @default 'on-change'
   */
  snapshots?: 'manual' | 'on-change' | 'every-frame';

  /**
   * Enable GPU timing collection
   * @default true
   */
  gpuTiming?: boolean;

  /**
   * Enable resource lifecycle tracking
   * @default true
   */
  resourceTracking?: boolean;
}

/**
 * Performance rules and thresholds
 */
export interface RulesConfig {
  /**
   * Maximum draw calls before warning
   */
  maxDrawCalls?: number;

  /**
   * Maximum triangles before warning
   */
  maxTriangles?: number;

  /**
   * Maximum frame time (ms) before warning
   */
  maxFrameTimeMs?: number;

  /**
   * Maximum textures before warning
   */
  maxTextures?: number;

  /**
   * Maximum total texture memory (bytes)
   */
  maxTextureMemory?: number;

  /**
   * Maximum geometry memory (bytes)
   */
  maxGeometryMemory?: number;

  /**
   * Maximum total GPU memory (bytes)
   */
  maxGpuMemory?: number;

  /**
   * Maximum vertices before warning
   */
  maxVertices?: number;

  /**
   * Maximum skinned meshes before warning
   */
  maxSkinnedMeshes?: number;

  /**
   * Maximum bones before warning
   */
  maxBones?: number;

  /**
   * Maximum lights before warning
   */
  maxLights?: number;

  /**
   * Maximum shadow-casting lights before warning
   */
  maxShadowLights?: number;

  /**
   * Maximum transparent objects before warning
   */
  maxTransparentObjects?: number;

  /**
   * Maximum shader/program switches per frame
   */
  maxProgramSwitches?: number;

  /**
   * Minimum acceptable FPS
   */
  minFps?: number;

  /**
   * Minimum 1% low FPS
   */
  min1PercentLowFps?: number;

  /**
   * Maximum frame time variance (jitter) in ms
   */
  maxFrameTimeVariance?: number;

  /**
   * Custom rules
   */
  custom?: CustomRule[];
}

/**
 * Custom rule definition
 */
export interface CustomRule {
  id: string;
  name: string;
  check: (stats: FrameStats) => RuleResult;
}

/**
 * Result of a rule check
 */
export interface RuleResult {
  passed: boolean;
  message?: string;
  severity?: 'info' | 'warning' | 'error';
}

