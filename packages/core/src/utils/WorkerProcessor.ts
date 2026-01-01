/**
 * Web Worker Processor
 * 
 * Offloads heavy processing tasks to a Web Worker to keep the main thread responsive.
 * Supports benchmark calculation, leak analysis, scene statistics aggregation,
 * and custom processing tasks.
 */

import type { FrameStats, BenchmarkScore, BenchmarkConfig } from '../types/stats';
import type { LeakReport, ResourceLifecycleSummary, LeakAlert } from '../tracking/ResourceLifecycleTracker';

// ─────────────────────────────────────────────────────────────────
// WORKER MESSAGE TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Task types that can be processed by the worker
 */
export type WorkerTaskType = 
  | 'benchmark'           // Calculate benchmark score
  | 'leakAnalysis'        // Analyze resource lifecycle for leaks
  | 'statsAggregation'    // Aggregate multiple frame stats
  | 'percentileCalc'      // Calculate percentiles from frame history
  | 'trendAnalysis'       // Analyze performance trends
  | 'custom';             // Custom processing task

/**
 * Message sent to the worker
 */
export interface WorkerRequest<T = unknown> {
  id: string;
  type: WorkerTaskType;
  payload: T;
}

/**
 * Message received from the worker
 */
export interface WorkerResponse<T = unknown> {
  id: string;
  type: WorkerTaskType;
  success: boolean;
  result?: T;
  error?: string;
  processingTimeMs: number;
}

// ─────────────────────────────────────────────────────────────────
// TASK PAYLOADS
// ─────────────────────────────────────────────────────────────────

/**
 * Payload for benchmark calculation
 */
export interface BenchmarkPayload {
  stats: FrameStats;
  config?: BenchmarkConfig;
}

/**
 * Payload for leak analysis
 */
export interface LeakAnalysisPayload {
  events: SerializedLifecycleEvent[];
  activeResources: SerializedActiveResource[];
  memoryHistory: Array<{ timestamp: number; estimatedBytes: number }>;
  sessionStartTime: number;
  options: {
    leakThresholdMs: number;
    memoryGrowthThresholdBytes: number;
  };
}

/**
 * Serialized lifecycle event (transferable to worker)
 */
export interface SerializedLifecycleEvent {
  id: string;
  resourceType: 'geometry' | 'material' | 'texture';
  resourceUuid: string;
  resourceName?: string;
  resourceSubtype?: string;
  eventType: 'created' | 'disposed' | 'attached' | 'detached';
  timestamp: number;
  stackTrace?: string;
  metadata?: {
    meshUuid?: string;
    meshName?: string;
    textureSlot?: string;
    estimatedMemory?: number;
    vertexCount?: number;
    faceCount?: number;
  };
}

/**
 * Serialized active resource (transferable to worker)
 */
export interface SerializedActiveResource {
  uuid: string;
  type: 'geometry' | 'material' | 'texture';
  createdAt: number;
  name?: string;
  subtype?: string;
  estimatedMemory?: number;
  attachedMeshUuids: string[];
  lastAttachmentTime?: number;
  detachedAt?: number;
}

/**
 * Payload for stats aggregation
 */
export interface StatsAggregationPayload {
  stats: FrameStats[];
  windowSize?: number;
}

/**
 * Result of stats aggregation
 */
export interface StatsAggregationResult {
  avgCpuTimeMs: number;
  avgGpuTimeMs: number | null;
  avgFps: number;
  minFps: number;
  maxFps: number;
  avgDrawCalls: number;
  avgTriangles: number;
  totalFrames: number;
  droppedFrames: number;
  variance: number;
}

/**
 * Payload for percentile calculation
 */
export interface PercentilePayload {
  values: number[];
  percentiles: number[];
}

/**
 * Result of percentile calculation
 */
export interface PercentileResult {
  percentiles: Record<number, number>;
  min: number;
  max: number;
  mean: number;
  median: number;
}

/**
 * Payload for trend analysis
 */
export interface TrendAnalysisPayload {
  history: Array<{ timestamp: number; value: number }>;
  windowSize?: number;
  thresholds?: {
    improving: number;   // Threshold for improvement (negative slope)
    degrading: number;   // Threshold for degradation (positive slope)
  };
}

/**
 * Result of trend analysis
 */
export interface TrendAnalysisResult {
  trend: 'improving' | 'stable' | 'degrading';
  slope: number;
  rSquared: number;
  prediction: number;
  changePercent: number;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Custom task payload
 */
export interface CustomTaskPayload {
  taskName: string;
  data: unknown;
  code?: string;  // Optional serialized function code for dynamic tasks
}

// ─────────────────────────────────────────────────────────────────
// WORKER PROCESSOR CLASS
// ─────────────────────────────────────────────────────────────────

/**
 * Options for WorkerProcessor
 */
export interface WorkerProcessorOptions {
  /** Worker script URL (if not using inline worker) */
  workerUrl?: string;
  /** Maximum concurrent tasks (default: 10) */
  maxConcurrentTasks?: number;
  /** Task timeout in milliseconds (default: 30000) */
  taskTimeout?: number;
  /** Enable performance logging (default: false) */
  enableLogging?: boolean;
}

/**
 * Task status tracking
 */
interface PendingTask<T = unknown> {
  resolve: (result: T) => void;
  reject: (error: Error) => void;
  startTime: number;
  timeoutId?: ReturnType<typeof setTimeout>;
}

/**
 * Statistics for worker performance monitoring
 */
export interface WorkerStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  timedOutTasks: number;
  avgProcessingTimeMs: number;
  pendingTasks: number;
  isAvailable: boolean;
}

/**
 * WorkerProcessor - Manages Web Worker for offloading heavy processing
 * 
 * @example
 * ```typescript
 * const processor = new WorkerProcessor();
 * await processor.initialize();
 * 
 * // Calculate benchmark in worker
 * const score = await processor.calculateBenchmark(frameStats);
 * 
 * // Analyze leaks in worker
 * const report = await processor.analyzeLeaks(events, activeResources, memoryHistory);
 * 
 * processor.dispose();
 * ```
 */
export class WorkerProcessor {
  private worker: Worker | null = null;
  private pendingTasks: Map<string, PendingTask> = new Map();
  private taskIdCounter = 0;
  private disposed = false;
  private options: Required<WorkerProcessorOptions>;
  private stats: WorkerStats;
  private totalProcessingTime = 0;
  private initPromise: Promise<void> | null = null;

  constructor(options: WorkerProcessorOptions = {}) {
    this.options = {
      workerUrl: options.workerUrl ?? '',
      maxConcurrentTasks: options.maxConcurrentTasks ?? 10,
      taskTimeout: options.taskTimeout ?? 30000,
      enableLogging: options.enableLogging ?? false,
    };

    this.stats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      timedOutTasks: 0,
      avgProcessingTimeMs: 0,
      pendingTasks: 0,
      isAvailable: false,
    };
  }

  /**
   * Initialize the worker
   */
  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    if (this.disposed) {
      throw new Error('WorkerProcessor has been disposed');
    }

    if (this.worker) {
      return;
    }

    // Check for Web Worker support
    if (typeof Worker === 'undefined') {
      this.log('Web Workers not supported, using fallback mode');
      return;
    }

    try {
      if (this.options.workerUrl) {
        this.worker = new Worker(this.options.workerUrl);
      } else {
        // Create inline worker using blob URL
        this.worker = this.createInlineWorker();
      }

      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = this.handleError.bind(this);
      
      this.stats.isAvailable = true;
      this.log('Worker initialized successfully');
    } catch (error) {
      this.log(`Failed to create worker: ${error}`, 'error');
      this.stats.isAvailable = false;
    }
  }

  /**
   * Create an inline worker using a blob URL
   */
  private createInlineWorker(): Worker {
    const workerCode = getWorkerCode();
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    const worker = new Worker(url);
    
    // Clean up blob URL after worker loads
    worker.addEventListener('message', function cleanup() {
      URL.revokeObjectURL(url);
      worker.removeEventListener('message', cleanup);
    }, { once: true });

    return worker;
  }

  /**
   * Handle message from worker
   */
  private handleMessage(event: MessageEvent<WorkerResponse>): void {
    const response = event.data;
    const pending = this.pendingTasks.get(response.id);

    if (!pending) {
      this.log(`Received response for unknown task: ${response.id}`, 'warn');
      return;
    }

    // Clear timeout
    if (pending.timeoutId) {
      clearTimeout(pending.timeoutId);
    }

    // Update stats
    const processingTime = performance.now() - pending.startTime;
    this.totalProcessingTime += processingTime;
    this.stats.pendingTasks = this.pendingTasks.size - 1;

    if (response.success) {
      this.stats.completedTasks++;
      pending.resolve(response.result);
      this.log(`Task ${response.id} completed in ${response.processingTimeMs.toFixed(2)}ms`);
    } else {
      this.stats.failedTasks++;
      pending.reject(new Error(response.error ?? 'Unknown worker error'));
      this.log(`Task ${response.id} failed: ${response.error}`, 'error');
    }

    this.pendingTasks.delete(response.id);
    this.updateAvgProcessingTime();
  }

  /**
   * Handle worker error
   */
  private handleError(error: ErrorEvent): void {
    this.log(`Worker error: ${error.message}`, 'error');
    
    // Reject all pending tasks
    for (const [id, pending] of this.pendingTasks) {
      if (pending.timeoutId) {
        clearTimeout(pending.timeoutId);
      }
      pending.reject(new Error(`Worker error: ${error.message}`));
      this.stats.failedTasks++;
    }
    this.pendingTasks.clear();
    this.stats.pendingTasks = 0;
  }

  /**
   * Send a task to the worker
   */
  private async sendTask<TPayload, TResult>(
    type: WorkerTaskType,
    payload: TPayload
  ): Promise<TResult> {
    // Ensure worker is initialized
    await this.initialize();

    // Fallback to main thread if worker not available
    if (!this.worker) {
      return this.executeOnMainThread<TPayload, TResult>(type, payload);
    }

    // Check concurrent task limit
    if (this.pendingTasks.size >= this.options.maxConcurrentTasks) {
      throw new Error(`Maximum concurrent tasks (${this.options.maxConcurrentTasks}) reached`);
    }

    return new Promise<TResult>((resolve, reject) => {
      const id = `task_${++this.taskIdCounter}`;
      
      const request: WorkerRequest<TPayload> = {
        id,
        type,
        payload,
      };

      const timeoutId = setTimeout(() => {
        const pending = this.pendingTasks.get(id);
        if (pending) {
          this.pendingTasks.delete(id);
          this.stats.timedOutTasks++;
          this.stats.pendingTasks = this.pendingTasks.size;
          reject(new Error(`Task ${id} timed out after ${this.options.taskTimeout}ms`));
        }
      }, this.options.taskTimeout);

      this.pendingTasks.set(id, {
        resolve: resolve as (result: unknown) => void,
        reject,
        startTime: performance.now(),
        timeoutId,
      });

      this.stats.totalTasks++;
      this.stats.pendingTasks = this.pendingTasks.size;

      this.worker!.postMessage(request);
      this.log(`Task ${id} (${type}) sent to worker`);
    });
  }

  /**
   * Execute task on main thread (fallback when worker unavailable)
   */
  private async executeOnMainThread<TPayload, TResult>(
    type: WorkerTaskType,
    payload: TPayload
  ): Promise<TResult> {
    this.log(`Executing ${type} on main thread (fallback)`);
    const startTime = performance.now();
    
    try {
      const result = processTask(type, payload);
      const processingTime = performance.now() - startTime;
      this.totalProcessingTime += processingTime;
      this.stats.totalTasks++;
      this.stats.completedTasks++;
      this.updateAvgProcessingTime();
      return result as TResult;
    } catch (error) {
      this.stats.totalTasks++;
      this.stats.failedTasks++;
      throw error;
    }
  }

  /**
   * Update average processing time
   */
  private updateAvgProcessingTime(): void {
    const completed = this.stats.completedTasks + this.stats.failedTasks;
    if (completed > 0) {
      this.stats.avgProcessingTimeMs = this.totalProcessingTime / completed;
    }
  }

  /**
   * Log message if logging is enabled
   */
  private log(message: string, level: 'log' | 'warn' | 'error' = 'log'): void {
    if (this.options.enableLogging) {
      console[level](`[WorkerProcessor] ${message}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────

  /**
   * Calculate benchmark score in worker
   */
  async calculateBenchmark(
    stats: FrameStats,
    config?: BenchmarkConfig
  ): Promise<BenchmarkScore> {
    return this.sendTask<BenchmarkPayload, BenchmarkScore>('benchmark', {
      stats,
      config,
    });
  }

  /**
   * Analyze resource lifecycle for leaks in worker
   */
  async analyzeLeaks(
    events: SerializedLifecycleEvent[],
    activeResources: SerializedActiveResource[],
    memoryHistory: Array<{ timestamp: number; estimatedBytes: number }>,
    sessionStartTime: number,
    options: {
      leakThresholdMs: number;
      memoryGrowthThresholdBytes: number;
    }
  ): Promise<LeakReport> {
    return this.sendTask<LeakAnalysisPayload, LeakReport>('leakAnalysis', {
      events,
      activeResources,
      memoryHistory,
      sessionStartTime,
      options,
    });
  }

  /**
   * Aggregate multiple frame stats in worker
   */
  async aggregateStats(
    stats: FrameStats[],
    windowSize?: number
  ): Promise<StatsAggregationResult> {
    return this.sendTask<StatsAggregationPayload, StatsAggregationResult>('statsAggregation', {
      stats,
      windowSize,
    });
  }

  /**
   * Calculate percentiles in worker
   */
  async calculatePercentiles(
    values: number[],
    percentiles: number[] = [50, 90, 95, 99]
  ): Promise<PercentileResult> {
    return this.sendTask<PercentilePayload, PercentileResult>('percentileCalc', {
      values,
      percentiles,
    });
  }

  /**
   * Analyze performance trends in worker
   */
  async analyzeTrend(
    history: Array<{ timestamp: number; value: number }>,
    windowSize?: number,
    thresholds?: TrendAnalysisPayload['thresholds']
  ): Promise<TrendAnalysisResult> {
    return this.sendTask<TrendAnalysisPayload, TrendAnalysisResult>('trendAnalysis', {
      history,
      windowSize,
      thresholds,
    });
  }

  /**
   * Execute a custom task in worker
   */
  async executeCustom<T>(taskName: string, data: unknown): Promise<T> {
    return this.sendTask<CustomTaskPayload, T>('custom', {
      taskName,
      data,
    });
  }

  /**
   * Get worker statistics
   */
  getStats(): WorkerStats {
    return { ...this.stats };
  }

  /**
   * Check if worker is available
   */
  isAvailable(): boolean {
    return this.stats.isAvailable;
  }

  /**
   * Get number of pending tasks
   */
  getPendingTaskCount(): number {
    return this.pendingTasks.size;
  }

  /**
   * Cancel all pending tasks
   */
  cancelAllTasks(): void {
    for (const [id, pending] of this.pendingTasks) {
      if (pending.timeoutId) {
        clearTimeout(pending.timeoutId);
      }
      pending.reject(new Error('Task cancelled'));
    }
    this.pendingTasks.clear();
    this.stats.pendingTasks = 0;
  }

  /**
   * Dispose of the worker
   */
  dispose(): void {
    if (this.disposed) return;

    this.disposed = true;
    this.cancelAllTasks();

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.stats.isAvailable = false;
    this.log('Worker disposed');
  }
}

// ─────────────────────────────────────────────────────────────────
// WORKER CODE GENERATION
// ─────────────────────────────────────────────────────────────────

/**
 * Get the worker code as a string
 * This is injected into a Blob to create an inline worker
 */
function getWorkerCode(): string {
  return `
// Web Worker for 3Lens processing tasks
'use strict';

// Message handler
self.onmessage = function(event) {
  const request = event.data;
  const startTime = performance.now();
  
  try {
    const result = processTask(request.type, request.payload);
    const processingTime = performance.now() - startTime;
    
    self.postMessage({
      id: request.id,
      type: request.type,
      success: true,
      result: result,
      processingTimeMs: processingTime
    });
  } catch (error) {
    const processingTime = performance.now() - startTime;
    
    self.postMessage({
      id: request.id,
      type: request.type,
      success: false,
      error: error.message || 'Unknown error',
      processingTimeMs: processingTime
    });
  }
};

${processTask.toString()}

${calculateBenchmarkInWorker.toString()}

${analyzeLeaksInWorker.toString()}

${aggregateStatsInWorker.toString()}

${calculatePercentilesInWorker.toString()}

${analyzeTrendInWorker.toString()}

${linearRegression.toString()}
`;
}

// ─────────────────────────────────────────────────────────────────
// PROCESSING FUNCTIONS (used both in worker and main thread fallback)
// ─────────────────────────────────────────────────────────────────

/**
 * Process a task based on its type
 */
function processTask(type: WorkerTaskType, payload: unknown): unknown {
  switch (type) {
    case 'benchmark':
      return calculateBenchmarkInWorker(payload as BenchmarkPayload);
    case 'leakAnalysis':
      return analyzeLeaksInWorker(payload as LeakAnalysisPayload);
    case 'statsAggregation':
      return aggregateStatsInWorker(payload as StatsAggregationPayload);
    case 'percentileCalc':
      return calculatePercentilesInWorker(payload as PercentilePayload);
    case 'trendAnalysis':
      return analyzeTrendInWorker(payload as TrendAnalysisPayload);
    case 'custom':
      throw new Error('Custom tasks require task registration');
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

/**
 * Calculate benchmark score
 */
function calculateBenchmarkInWorker(payload: BenchmarkPayload): BenchmarkScore {
  const { stats, config } = payload;
  
  // Default config values
  const targetFps = config?.targetFps ?? 60;
  const maxDrawCalls = config?.maxDrawCalls ?? 500;
  const maxTriangles = config?.maxTriangles ?? 1000000;
  const maxTextureMemory = config?.maxTextureMemory ?? 512 * 1024 * 1024;
  const maxGeometryMemory = config?.maxGeometryMemory ?? 256 * 1024 * 1024;
  const weights = config?.weights ?? {
    timing: 0.35,
    drawCalls: 0.2,
    geometry: 0.2,
    memory: 0.15,
    stateChanges: 0.1,
  };

  const issues: string[] = [];
  const suggestions: string[] = [];

  // Timing score (0-100)
  const targetFrameTime = 1000 / targetFps;
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
  const drawCallRatio = stats.drawCalls / maxDrawCalls;
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
  const triangleRatio = stats.triangles / maxTriangles;
  let geometryScore: number;
  if (triangleRatio <= 0.5) {
    geometryScore = 100;
  } else if (triangleRatio <= 1) {
    geometryScore = 100 - (triangleRatio - 0.5) * 40;
  } else {
    geometryScore = Math.max(0, 80 - (triangleRatio - 1) * 40);
  }

  if (geometryScore < 80) {
    issues.push(`${formatLargeNumber(stats.triangles)} triangles is high`);
    suggestions.push('Use LOD or reduce polygon count');
  }

  // Memory score (0-100)
  let memoryScore = 100;
  if (stats.memory) {
    const textureMemRatio = (stats.memory.textureMemory ?? 0) / maxTextureMemory;
    const geoMemRatio = (stats.memory.geometryMemory ?? 0) / maxGeometryMemory;
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
      ? ((stats.rendering.programSwitches ?? 0) + (stats.rendering.textureBinds ?? 0)) /
        stats.drawCalls
      : 0;
  let stateChangesScore: number;
  if (stateChangesPerDraw <= 1) {
    stateChangesScore = 100;
  } else if (stateChangesPerDraw <= 2) {
    stateChangesScore = 100 - (stateChangesPerDraw - 1) * 40;
  } else {
    stateChangesScore = Math.max(0, 60 - (stateChangesPerDraw - 2) * 30);
  }

  if (stateChangesScore < 80 && stats.drawCalls > 50) {
    issues.push('High state changes per draw call');
    suggestions.push('Sort objects by material to reduce state changes');
  }

  // Calculate overall score with weights
  const overall =
    timingScore * weights.timing +
    drawCallScore * weights.drawCalls +
    geometryScore * weights.geometry +
    memoryScore * weights.memory +
    stateChangesScore * weights.stateChanges;

  // Calculate grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
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
    issues,
    suggestions,
  };
}

/**
 * Format large numbers for display
 */
function formatLargeNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Analyze resource lifecycle for leaks
 */
function analyzeLeaksInWorker(payload: LeakAnalysisPayload): LeakReport {
  const { events, activeResources, memoryHistory, sessionStartTime, options } = payload;
  const now = performance.now();
  const sessionDurationMs = now - sessionStartTime;

  const alerts: LeakAlert[] = [];
  let alertIdCounter = 0;

  // Count events by type
  const stats: {
    geometries: { created: number; disposed: number; orphaned: number; leaked: number };
    materials: { created: number; disposed: number; orphaned: number; leaked: number };
    textures: { created: number; disposed: number; orphaned: number; leaked: number };
  } = {
    geometries: { created: 0, disposed: 0, orphaned: 0, leaked: 0 },
    materials: { created: 0, disposed: 0, orphaned: 0, leaked: 0 },
    textures: { created: 0, disposed: 0, orphaned: 0, leaked: 0 },
  };

  // Helper to get stats key safely (handles pluralization)
  const getStatsKey = (resourceType: string): keyof typeof stats | null => {
    // Map singular resource types to plural stat keys
    const typeMap: Record<string, keyof typeof stats> = {
      geometry: 'geometries',
      material: 'materials',
      texture: 'textures',
    };
    return typeMap[resourceType] ?? null;
  };

  for (const event of events) {
    const typeKey = getStatsKey(event.resourceType);
    if (!typeKey) continue;
    if (event.eventType === 'created') {
      stats[typeKey].created++;
    } else if (event.eventType === 'disposed') {
      stats[typeKey].disposed++;
    }
  }

  // Check active resources for leaks
  for (const resource of activeResources) {
    const typeKey = getStatsKey(resource.type);
    if (!typeKey) continue;
    const age = now - resource.createdAt;

    // Check for orphaned resources (not attached to any mesh)
    if (resource.attachedMeshUuids.length === 0) {
      stats[typeKey].orphaned++;

      // If old and orphaned, it's likely a leak
      if (age > options.leakThresholdMs) {
        stats[typeKey].leaked++;
        alerts.push({
          id: `alert_${++alertIdCounter}`,
          type: 'orphaned_resource',
          severity: age > options.leakThresholdMs * 2 ? 'critical' : 'warning',
          resourceType: resource.type,
          resourceUuid: resource.uuid,
          resourceName: resource.name,
          message: `Orphaned ${resource.type} not disposed`,
          details: `${resource.name || resource.uuid} has been active for ${(age / 1000).toFixed(1)}s without being attached to any mesh`,
          timestamp: now,
          suggestion: `Call .dispose() on unused ${resource.type}s to free GPU memory`,
        });
      }
    }

    // Check for undisposed old resources that were detached
    if (resource.detachedAt && now - resource.detachedAt > options.leakThresholdMs) {
      // Detached but not disposed
      stats[typeKey].leaked++;
      alerts.push({
        id: `alert_${++alertIdCounter}`,
        type: 'detached_not_disposed',
        severity: 'warning',
        resourceType: resource.type,
        resourceUuid: resource.uuid,
        resourceName: resource.name,
        message: `Detached ${resource.type} not disposed`,
        details: `${resource.name || resource.uuid} was detached ${((now - resource.detachedAt) / 1000).toFixed(1)}s ago but not disposed`,
        timestamp: now,
        suggestion: `Dispose ${resource.type}s after detaching from meshes`,
      });
    }
  }

  // Analyze memory growth
  let estimatedLeakedMemory = 0;
  if (memoryHistory.length >= 10) {
    const recentHistory = memoryHistory.slice(-20);
    const firstHalf = recentHistory.slice(0, Math.floor(recentHistory.length / 2));
    const secondHalf = recentHistory.slice(Math.floor(recentHistory.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b.estimatedBytes, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b.estimatedBytes, 0) / secondHalf.length;
    const growth = secondAvg - firstAvg;

    if (growth > options.memoryGrowthThresholdBytes) {
      alerts.push({
        id: `alert_${++alertIdCounter}`,
        type: 'memory_growth',
        severity: growth > options.memoryGrowthThresholdBytes * 2 ? 'critical' : 'warning',
        message: 'Memory usage growing consistently',
        details: `Memory increased by ${formatBytes(growth)} over recent frames`,
        timestamp: now,
        suggestion: 'Check for undisposed resources or excessive object creation',
      });
      estimatedLeakedMemory = growth;
    }
  }

  // Estimate leaked memory from orphaned resources
  for (const resource of activeResources) {
    if (resource.attachedMeshUuids.length === 0 && resource.estimatedMemory) {
      estimatedLeakedMemory += resource.estimatedMemory;
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (stats.geometries.leaked > 0) {
    recommendations.push(`Dispose ${stats.geometries.leaked} leaked geometries`);
  }
  if (stats.materials.leaked > 0) {
    recommendations.push(`Dispose ${stats.materials.leaked} leaked materials`);
  }
  if (stats.textures.leaked > 0) {
    recommendations.push(`Dispose ${stats.textures.leaked} leaked textures`);
  }
  if (estimatedLeakedMemory > 0) {
    recommendations.push(`Estimated ${formatBytes(estimatedLeakedMemory)} of GPU memory may be leaked`);
  }
  if (recommendations.length === 0) {
    recommendations.push('No significant memory leaks detected');
  }

  return {
    generatedAt: now,
    sessionDurationMs,
    summary: {
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      warningAlerts: alerts.filter(a => a.severity === 'warning').length,
      infoAlerts: alerts.filter(a => a.severity === 'info').length,
      estimatedLeakedMemoryBytes: estimatedLeakedMemory,
    },
    alerts,
    resourceStats: stats,
    memoryHistory,
    recommendations,
  };
}

/**
 * Format bytes for display
 */
function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

/**
 * Aggregate multiple frame stats
 */
function aggregateStatsInWorker(payload: StatsAggregationPayload): StatsAggregationResult {
  const { stats, windowSize } = payload;
  const data = windowSize ? stats.slice(-windowSize) : stats;

  if (data.length === 0) {
    return {
      avgCpuTimeMs: 0,
      avgGpuTimeMs: null,
      avgFps: 0,
      minFps: 0,
      maxFps: 0,
      avgDrawCalls: 0,
      avgTriangles: 0,
      totalFrames: 0,
      droppedFrames: 0,
      variance: 0,
    };
  }

  let totalCpuTime = 0;
  let totalGpuTime = 0;
  let gpuTimeCount = 0;
  let totalDrawCalls = 0;
  let totalTriangles = 0;
  let droppedFrames = 0;
  const targetFrameTime = 1000 / 60; // 60 FPS target

  const fpsValues: number[] = [];

  for (const stat of data) {
    totalCpuTime += stat.cpuTimeMs;
    if (stat.gpuTimeMs !== undefined) {
      totalGpuTime += stat.gpuTimeMs;
      gpuTimeCount++;
    }
    totalDrawCalls += stat.drawCalls;
    totalTriangles += stat.triangles;

    const fps = stat.cpuTimeMs > 0 ? 1000 / stat.cpuTimeMs : 0;
    fpsValues.push(fps);

    if (stat.cpuTimeMs > targetFrameTime * 1.5) {
      droppedFrames++;
    }
  }

  const avgCpuTimeMs = totalCpuTime / data.length;
  const avgFps = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;

  // Calculate variance
  const squaredDiffs = fpsValues.map(fps => Math.pow(fps - avgFps, 2));
  const variance = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / fpsValues.length);

  return {
    avgCpuTimeMs,
    avgGpuTimeMs: gpuTimeCount > 0 ? totalGpuTime / gpuTimeCount : null,
    avgFps,
    minFps: Math.min(...fpsValues),
    maxFps: Math.max(...fpsValues),
    avgDrawCalls: totalDrawCalls / data.length,
    avgTriangles: totalTriangles / data.length,
    totalFrames: data.length,
    droppedFrames,
    variance,
  };
}

/**
 * Calculate percentiles from values
 */
function calculatePercentilesInWorker(payload: PercentilePayload): PercentileResult {
  const { values, percentiles } = payload;

  if (values.length === 0) {
    const result: PercentileResult = {
      percentiles: {},
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
    };
    for (const p of percentiles) {
      result.percentiles[p] = 0;
    }
    return result;
  }

  // Sort values
  const sorted = [...values].sort((a, b) => a - b);

  // Calculate percentiles
  const result: PercentileResult = {
    percentiles: {},
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    median: 0,
  };

  for (const p of percentiles) {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    result.percentiles[p] = sorted[Math.max(0, index)];
  }

  // Median
  const midIndex = Math.floor(sorted.length / 2);
  result.median = sorted.length % 2 === 0
    ? (sorted[midIndex - 1] + sorted[midIndex]) / 2
    : sorted[midIndex];

  return result;
}

/**
 * Analyze performance trends using linear regression
 */
function analyzeTrendInWorker(payload: TrendAnalysisPayload): TrendAnalysisResult {
  const { history, windowSize, thresholds } = payload;
  const data = windowSize ? history.slice(-windowSize) : history;

  const improvingThreshold = thresholds?.improving ?? -0.1;
  const degradingThreshold = thresholds?.degrading ?? 0.1;

  if (data.length < 3) {
    return {
      trend: 'stable',
      slope: 0,
      rSquared: 0,
      prediction: data.length > 0 ? data[data.length - 1].value : 0,
      changePercent: 0,
      confidence: 'low',
    };
  }

  // Normalize timestamps to start from 0
  const startTime = data[0].timestamp;
  const normalizedData = data.map(d => ({
    x: (d.timestamp - startTime) / 1000, // Convert to seconds
    y: d.value,
  }));

  const regression = linearRegression(normalizedData);

  // Determine trend
  let trend: 'improving' | 'stable' | 'degrading';
  if (regression.slope < improvingThreshold) {
    trend = 'improving';
  } else if (regression.slope > degradingThreshold) {
    trend = 'degrading';
  } else {
    trend = 'stable';
  }

  // Calculate change percent
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const changePercent = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

  // Determine confidence based on R² value
  let confidence: 'high' | 'medium' | 'low';
  if (regression.rSquared >= 0.7) {
    confidence = 'high';
  } else if (regression.rSquared >= 0.4) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Predict next value (1 second in the future)
  const lastX = normalizedData[normalizedData.length - 1].x;
  const prediction = regression.intercept + regression.slope * (lastX + 1);

  return {
    trend,
    slope: regression.slope,
    rSquared: regression.rSquared,
    prediction: Math.max(0, prediction),
    changePercent,
    confidence,
  };
}

/**
 * Simple linear regression
 */
function linearRegression(data: Array<{ x: number; y: number }>): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumX2 += point.x * point.x;
    sumY2 += point.y * point.y;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² (coefficient of determination)
  const meanY = sumY / n;
  let ssTotal = 0;
  let ssResidual = 0;

  for (const point of data) {
    const predicted = intercept + slope * point.x;
    ssTotal += Math.pow(point.y - meanY, 2);
    ssResidual += Math.pow(point.y - predicted, 2);
  }

  const rSquared = ssTotal !== 0 ? 1 - ssResidual / ssTotal : 0;

  return {
    slope: isFinite(slope) ? slope : 0,
    intercept: isFinite(intercept) ? intercept : 0,
    rSquared: isFinite(rSquared) ? Math.max(0, Math.min(1, rSquared)) : 0,
  };
}

// ─────────────────────────────────────────────────────────────────
// SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────

let globalWorkerProcessor: WorkerProcessor | null = null;

/**
 * Get the global WorkerProcessor instance
 */
export function getWorkerProcessor(): WorkerProcessor {
  if (!globalWorkerProcessor) {
    globalWorkerProcessor = new WorkerProcessor();
  }
  return globalWorkerProcessor;
}

/**
 * Reset the global WorkerProcessor (mainly for testing)
 */
export function resetWorkerProcessor(): void {
  if (globalWorkerProcessor) {
    globalWorkerProcessor.dispose();
    globalWorkerProcessor = null;
  }
}
