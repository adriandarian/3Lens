/**
 * WebGPU GPU Timing Manager
 * 
 * Implements GPU timing using WebGPU timestamp queries for accurate
 * per-pass breakdown of GPU execution time.
 * 
 * @module @3lens/core/adapters/webgpu-timing
 */

/**
 * GPU pass timing result
 */
export interface GpuPassTiming {
  name: string;
  startNs: bigint;
  endNs: bigint;
  durationMs: number;
}

/**
 * GPU timing result for a frame
 */
export interface GpuFrameTiming {
  totalMs: number;
  passes: GpuPassTiming[];
  breakdown: Record<string, number>;
  frameNumber: number;
  timestamp: number;
}

/**
 * Pass type for categorization
 */
export type GpuPassType = 
  | 'render'
  | 'compute'
  | 'shadow'
  | 'post-process'
  | 'copy'
  | 'unknown';

/**
 * Configuration for the GPU timing manager
 */
export interface GpuTimingConfig {
  /**
   * Maximum number of frames to keep in history
   */
  maxHistorySize: number;
  
  /**
   * Whether to automatically read results
   */
  autoReadback: boolean;
  
  /**
   * Number of query pairs (start/end) per frame
   */
  maxPassesPerFrame: number;
}

const DEFAULT_CONFIG: GpuTimingConfig = {
  maxHistorySize: 120,
  autoReadback: true,
  maxPassesPerFrame: 16,
};

/**
 * WebGPU GPU Timing Manager
 * 
 * Manages timestamp queries for accurate GPU timing measurement.
 * Uses a double-buffered approach to avoid GPU stalls.
 */
export class WebGpuTimingManager {
  private device: GPUDevice | null = null;
  private querySet: GPUQuerySet | null = null;
  private resolveBuffer: GPUBuffer | null = null;
  private readBuffer: GPUBuffer | null = null;
  
  private config: GpuTimingConfig;
  private enabled = false;
  private disposed = false;
  
  // Current frame tracking
  private currentFrame = 0;
  private currentPassIndex = 0;
  private pendingReadback = false;
  
  // Pass tracking
  private passNames: string[] = [];
  private passTypes: GpuPassType[] = [];
  
  // History
  private history: GpuFrameTiming[] = [];
  private latestTiming: GpuFrameTiming | null = null;
  
  // Double buffering for query results
  private frameBuffers: Array<{
    frameNumber: number;
    passCount: number;
    passNames: string[];
    passTypes: GpuPassType[];
    readbackPending: boolean;
  }> = [];
  private currentBufferIndex = 0;
  private readonly BUFFER_COUNT = 3; // Triple buffering for async readback

  constructor(config: Partial<GpuTimingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the timing manager with a WebGPU device
   */
  async initialize(device: GPUDevice): Promise<boolean> {
    if (this.disposed) return false;
    
    // Check for timestamp query support
    if (!device.features.has('timestamp-query')) {
      console.warn('[3Lens GPU Timing] Timestamp queries not supported on this device');
      return false;
    }

    this.device = device;
    
    // Create query set (2 queries per pass: start + end)
    const queryCount = this.config.maxPassesPerFrame * 2 * this.BUFFER_COUNT;
    
    try {
      this.querySet = device.createQuerySet({
        type: 'timestamp',
        count: queryCount,
        label: '3Lens-Timestamp-QuerySet',
      });

      // Buffer to resolve query results (8 bytes per query for 64-bit timestamps)
      const resolveBufferSize = queryCount * 8;
      this.resolveBuffer = device.createBuffer({
        size: resolveBufferSize,
        usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
        label: '3Lens-Query-Resolve',
      });

      // Mappable buffer for CPU readback
      this.readBuffer = device.createBuffer({
        size: resolveBufferSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        label: '3Lens-Query-Read',
      });

      // Initialize frame buffers
      for (let i = 0; i < this.BUFFER_COUNT; i++) {
        this.frameBuffers.push({
          frameNumber: -1,
          passCount: 0,
          passNames: [],
          passTypes: [],
          readbackPending: false,
        });
      }

      this.enabled = true;
      return true;
    } catch (e) {
      console.error('[3Lens GPU Timing] Failed to initialize:', e);
      return false;
    }
  }

  /**
   * Check if GPU timing is enabled and available
   */
  isEnabled(): boolean {
    return this.enabled && !this.disposed;
  }

  /**
   * Begin a new frame for timing
   */
  beginFrame(frameNumber: number): void {
    if (!this.enabled || this.disposed) return;

    this.currentFrame = frameNumber;
    this.currentPassIndex = 0;
    this.passNames = [];
    this.passTypes = [];
    
    // Rotate to next buffer
    this.currentBufferIndex = (this.currentBufferIndex + 1) % this.BUFFER_COUNT;
  }

  /**
   * Get the query index for writing timestamp at pass start
   * Call this before the pass begins
   */
  getPassStartQueryIndex(passName: string, passType: GpuPassType = 'unknown'): number {
    if (!this.enabled || this.disposed) return -1;
    if (this.currentPassIndex >= this.config.maxPassesPerFrame) return -1;

    const baseIndex = this.currentBufferIndex * this.config.maxPassesPerFrame * 2;
    const queryIndex = baseIndex + this.currentPassIndex * 2;
    
    this.passNames.push(passName);
    this.passTypes.push(passType);
    
    return queryIndex;
  }

  /**
   * Get the query index for writing timestamp at pass end
   * Call this after the pass ends
   */
  getPassEndQueryIndex(): number {
    if (!this.enabled || this.disposed) return -1;
    if (this.currentPassIndex >= this.config.maxPassesPerFrame) return -1;

    const baseIndex = this.currentBufferIndex * this.config.maxPassesPerFrame * 2;
    const queryIndex = baseIndex + this.currentPassIndex * 2 + 1;
    
    this.currentPassIndex++;
    
    return queryIndex;
  }

  /**
   * Write timestamp at the start of a render/compute pass
   * Use with GPURenderPassEncoder or GPUComputePassEncoder
   */
  writeTimestamp(encoder: GPUCommandEncoder, queryIndex: number): void {
    if (!this.enabled || !this.querySet || queryIndex < 0) return;
    
    encoder.writeTimestamp(this.querySet, queryIndex);
  }

  /**
   * End the current frame and resolve queries
   */
  endFrame(encoder: GPUCommandEncoder): void {
    if (!this.enabled || this.disposed || !this.querySet || !this.resolveBuffer) return;
    if (this.currentPassIndex === 0) return; // No passes recorded

    const baseIndex = this.currentBufferIndex * this.config.maxPassesPerFrame * 2;
    const queryCount = this.currentPassIndex * 2;
    const bufferOffset = baseIndex * 8;

    // Resolve queries to buffer
    encoder.resolveQuerySet(
      this.querySet,
      baseIndex,
      queryCount,
      this.resolveBuffer,
      bufferOffset
    );

    // Update frame buffer info
    this.frameBuffers[this.currentBufferIndex] = {
      frameNumber: this.currentFrame,
      passCount: this.currentPassIndex,
      passNames: [...this.passNames],
      passTypes: [...this.passTypes],
      readbackPending: true,
    };
  }

  /**
   * Copy resolved queries to mappable buffer for readback
   * Call this after command buffer submission
   */
  copyForReadback(encoder: GPUCommandEncoder, bufferIndex?: number): void {
    if (!this.enabled || !this.resolveBuffer || !this.readBuffer) return;

    const idx = bufferIndex ?? this.currentBufferIndex;
    const baseOffset = idx * this.config.maxPassesPerFrame * 2 * 8;
    const size = this.frameBuffers[idx].passCount * 2 * 8;

    if (size > 0) {
      encoder.copyBufferToBuffer(
        this.resolveBuffer,
        baseOffset,
        this.readBuffer,
        baseOffset,
        size
      );
    }
  }

  /**
   * Read back timing results asynchronously
   * Returns the results for the oldest pending frame
   */
  async readResults(): Promise<GpuFrameTiming | null> {
    if (!this.enabled || this.disposed || !this.readBuffer || this.pendingReadback) {
      return this.latestTiming;
    }

    // Find oldest pending readback
    let oldestIndex = -1;
    let oldestFrame = Infinity;
    
    for (let i = 0; i < this.BUFFER_COUNT; i++) {
      const fb = this.frameBuffers[i];
      if (fb.readbackPending && fb.frameNumber < oldestFrame && fb.passCount > 0) {
        oldestFrame = fb.frameNumber;
        oldestIndex = i;
      }
    }

    if (oldestIndex === -1) {
      return this.latestTiming;
    }

    const frameBuffer = this.frameBuffers[oldestIndex];
    this.pendingReadback = true;

    try {
      // Map the buffer for reading
      await this.readBuffer.mapAsync(
        GPUMapMode.READ,
        oldestIndex * this.config.maxPassesPerFrame * 2 * 8,
        frameBuffer.passCount * 2 * 8
      );

      const mappedRange = this.readBuffer.getMappedRange(
        oldestIndex * this.config.maxPassesPerFrame * 2 * 8,
        frameBuffer.passCount * 2 * 8
      );

      // Read timestamps as BigInt64
      const timestamps = new BigInt64Array(mappedRange);
      
      // Calculate pass timings
      const passes: GpuPassTiming[] = [];
      let totalNs = BigInt(0);

      for (let i = 0; i < frameBuffer.passCount; i++) {
        const startNs = timestamps[i * 2];
        const endNs = timestamps[i * 2 + 1];
        const durationNs = endNs - startNs;
        
        // Convert to milliseconds (nanoseconds / 1_000_000)
        const durationMs = Number(durationNs) / 1_000_000;
        
        passes.push({
          name: frameBuffer.passNames[i],
          startNs,
          endNs,
          durationMs: Math.max(0, durationMs), // Clamp negative values
        });

        totalNs += durationNs > 0 ? durationNs : BigInt(0);
      }

      this.readBuffer.unmap();
      frameBuffer.readbackPending = false;

      // Build breakdown by pass type
      const breakdown: Record<string, number> = {};
      for (let i = 0; i < passes.length; i++) {
        const passType = frameBuffer.passTypes[i];
        breakdown[passType] = (breakdown[passType] ?? 0) + passes[i].durationMs;
      }

      // Also add by pass name
      for (const pass of passes) {
        breakdown[pass.name] = pass.durationMs;
      }

      const timing: GpuFrameTiming = {
        totalMs: Number(totalNs) / 1_000_000,
        passes,
        breakdown,
        frameNumber: frameBuffer.frameNumber,
        timestamp: performance.now(),
      };

      // Update history
      this.history.push(timing);
      if (this.history.length > this.config.maxHistorySize) {
        this.history.shift();
      }

      this.latestTiming = timing;
      this.pendingReadback = false;
      
      return timing;
    } catch (e) {
      console.warn('[3Lens GPU Timing] Readback failed:', e);
      this.pendingReadback = false;
      frameBuffer.readbackPending = false;
      return this.latestTiming;
    }
  }

  /**
   * Get the latest timing result (non-blocking)
   */
  getLatestTiming(): GpuFrameTiming | null {
    return this.latestTiming;
  }

  /**
   * Get timing history
   */
  getHistory(): GpuFrameTiming[] {
    return [...this.history];
  }

  /**
   * Get average timing over recent frames
   */
  getAverageTiming(frameCount: number = 60): GpuFrameTiming | null {
    if (this.history.length === 0) return null;

    const recentFrames = this.history.slice(-frameCount);
    const passAverages = new Map<string, { totalMs: number; count: number }>();
    let totalMs = 0;

    for (const frame of recentFrames) {
      totalMs += frame.totalMs;
      
      for (const pass of frame.passes) {
        const existing = passAverages.get(pass.name) ?? { totalMs: 0, count: 0 };
        existing.totalMs += pass.durationMs;
        existing.count++;
        passAverages.set(pass.name, existing);
      }
    }

    const avgTotalMs = totalMs / recentFrames.length;
    const breakdown: Record<string, number> = {};
    const passes: GpuPassTiming[] = [];

    for (const [name, data] of passAverages) {
      const avgMs = data.totalMs / data.count;
      breakdown[name] = avgMs;
      passes.push({
        name,
        startNs: BigInt(0),
        endNs: BigInt(0),
        durationMs: avgMs,
      });
    }

    return {
      totalMs: avgTotalMs,
      passes,
      breakdown,
      frameNumber: this.currentFrame,
      timestamp: performance.now(),
    };
  }

  /**
   * Clear timing history
   */
  clearHistory(): void {
    this.history = [];
    this.latestTiming = null;
  }

  /**
   * Get the query set for external use
   */
  getQuerySet(): GPUQuerySet | null {
    return this.querySet;
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    if (this.disposed) return;
    
    this.disposed = true;
    this.enabled = false;

    this.querySet?.destroy();
    this.resolveBuffer?.destroy();
    this.readBuffer?.destroy();

    this.querySet = null;
    this.resolveBuffer = null;
    this.readBuffer = null;
    this.device = null;

    this.history = [];
    this.latestTiming = null;
    this.frameBuffers = [];
  }
}

/**
 * Helper to create timestamp write descriptors for render/compute passes
 */
export function createTimestampWrites(
  querySet: GPUQuerySet,
  beginningOfPassWriteIndex: number,
  endOfPassWriteIndex: number
): GPURenderPassTimestampWrites | GPUComputePassTimestampWrites {
  return {
    querySet,
    beginningOfPassWriteIndex,
    endOfPassWriteIndex,
  };
}

/**
 * Categorize a pass name into a pass type
 */
export function categorizePass(passName: string): GpuPassType {
  const name = passName.toLowerCase();
  
  if (name.includes('shadow')) return 'shadow';
  if (name.includes('compute')) return 'compute';
  if (name.includes('post') || name.includes('bloom') || name.includes('blur') || name.includes('fxaa') || name.includes('ssao')) return 'post-process';
  if (name.includes('copy') || name.includes('blit')) return 'copy';
  if (name.includes('render') || name.includes('opaque') || name.includes('transparent') || name.includes('forward') || name.includes('deferred')) return 'render';
  
  return 'unknown';
}

