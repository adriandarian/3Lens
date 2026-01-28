/**
 * @3lens/addon-shader
 *
 * Shader introspection and mutation addon for 3Lens.
 * Runtime introspection tool for variant analysis, cost attribution, and controlled mutation.
 *
 * Per the shader-graph contract, this is NOT:
 * - A general-purpose shader authoring tool
 * - A replacement for TSL Graph or Unity Shader Graph
 * - An artist-facing visual programming environment
 *
 * @packageDocumentation
 */

import type { Addon, Lens, LensClient, Selection } from '@3lens/runtime';
import type {
  EntityId,
  Node,
  EntityGraph,
  NodeType,
  Fidelity,
  ShaderNode,
  ShaderVariantNode,
  MaterialNode,
  ShaderCompileEvent,
  Event,
} from '@3lens/kernel';
import type { Panel } from '@3lens/ui-core';

// =============================================================================
// Types
// =============================================================================

/**
 * Fidelity info for shader metrics
 */
export interface ShaderFidelityInfo {
  level: Fidelity;
  reason?: string;
  source?: string;
  proxies_used?: string[];
}

/**
 * Shader variant information
 */
export interface ShaderVariant {
  /** Variant entity ID */
  id: EntityId;
  /** Parent shader ID */
  shaderId: EntityId;
  /** Defines that created this variant */
  defines: Record<string, string | number | boolean>;
  /** Define hash for deduplication */
  defineHash: string;
  /** Whether the variant has been compiled */
  compiled: boolean;
  /** Compilation time in milliseconds */
  compileTimeMs?: number;
  /** Compilation time fidelity */
  compileTimeFidelity?: Fidelity;
  /** Material that triggered this variant */
  triggerMaterialId?: EntityId;
  /** Frame when compiled */
  compileFrame?: number;
  /** Timestamp when compiled */
  compileTimestamp?: number;
}

/**
 * Shader compilation event tracking
 */
export interface CompilationEvent {
  /** Shader ID */
  shaderId: EntityId;
  /** Variant ID */
  variantId: EntityId;
  /** Material that triggered compilation */
  materialId?: EntityId;
  /** Defines that caused the variant */
  defines: string[];
  /** Compilation time in milliseconds */
  compileTimeMs?: number;
  /** Timing fidelity */
  timingFidelity?: Fidelity;
  /** Frame number */
  frame: number;
  /** Timestamp */
  timestamp: number;
}

/**
 * Compilation storm detection result
 */
export interface CompilationStorm {
  /** Whether a storm was detected */
  detected: boolean;
  /** Number of variants compiled in the detection window */
  variantCount: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Threshold that was exceeded */
  threshold: number;
  /** Affected shaders */
  affectedShaders: EntityId[];
  /** Affected materials */
  affectedMaterials: EntityId[];
  /** Start timestamp of storm */
  startTimestamp?: number;
  /** End timestamp of storm */
  endTimestamp?: number;
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Shader cost metrics
 */
export interface ShaderCostMetrics {
  /** GPU time per frame (if available) */
  gpuTimeMs?: number;
  /** GPU time fidelity */
  gpuTimeFidelity?: Fidelity;
  /** Total compile time across all variants */
  totalCompileTimeMs: number;
  /** Compile time fidelity */
  compileTimeFidelity: Fidelity;
  /** Memory footprint estimate */
  memoryBytes?: number;
  /** Memory fidelity */
  memoryFidelity?: Fidelity;
  /** Variant count */
  variantCount: number;
  /** Materials using this shader */
  materialCount: number;
}

/**
 * Mutation operation for controlled shader changes
 */
export interface ShaderMutation {
  /** Mutation ID */
  id: string;
  /** Target shader ID */
  shaderId: EntityId;
  /** Mutation type */
  type: 'toggle_define' | 'set_define' | 'remove_define' | 'toggle_feature';
  /** Define/feature key */
  key: string;
  /** Value (for set_define) */
  value?: string | number | boolean;
  /** Description of the mutation */
  description: string;
}

/**
 * Mutation result with before/after metrics
 */
export interface MutationResult {
  /** Mutation that was applied */
  mutation: ShaderMutation;
  /** Whether mutation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Metrics before mutation */
  before: ShaderCostMetrics;
  /** Metrics after mutation */
  after: ShaderCostMetrics;
  /** Delta report */
  delta: MutationDelta;
  /** Can this mutation be reverted? */
  canRevert: boolean;
}

/**
 * Delta report for mutation comparison
 */
export interface MutationDelta {
  /** GPU time change */
  gpuTimeDeltaMs?: number;
  /** Compile time change */
  compileTimeDeltaMs?: number;
  /** Memory change */
  memoryDeltaBytes?: number;
  /** Variant count change */
  variantCountDelta: number;
  /** Overall impact assessment */
  impact: 'positive' | 'neutral' | 'negative';
  /** Fidelity of the delta metrics */
  fidelity: Fidelity;
}

/**
 * Query options for shader variants
 */
export interface ShaderVariantQueryOptions {
  /** Filter by shader ID */
  shaderId?: EntityId;
  /** Filter by material ID */
  materialId?: EntityId;
  /** Filter by compiled status */
  compiled?: boolean;
  /** Include define details */
  includeDefines?: boolean;
  /** Sort by */
  sortBy?: 'compileTime' | 'timestamp' | 'defineCount';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Limit results */
  limit?: number;
}

/**
 * Compilation storm detection options
 */
export interface StormDetectionOptions {
  /** Time window in milliseconds */
  windowMs?: number;
  /** Threshold for storm detection (variants per window) */
  threshold?: number;
  /** Look back in history (milliseconds) */
  lookbackMs?: number;
}

// =============================================================================
// Shader Variant Queries
// =============================================================================

/**
 * Get all shader variants for a shader
 */
export function queryShaderVariants(
  graph: EntityGraph,
  options: ShaderVariantQueryOptions = {}
): { variants: ShaderVariant[]; fidelity: ShaderFidelityInfo } {
  const variantNodes = graph.getNodes({ types: ['shader_variant'] }).nodes as ShaderVariantNode[];

  let variants: ShaderVariant[] = variantNodes.map((node) => ({
    id: node.id,
    shaderId: node.parent_shader_id,
    defines: node.defines,
    defineHash: node.define_hash,
    compiled: node.compiled,
    compileTimeMs: node.compile_time_ms,
    compileTimeFidelity: node.compile_time_fidelity,
  }));

  // Apply filters
  if (options.shaderId) {
    variants = variants.filter((v) => v.shaderId === options.shaderId);
  }

  if (options.compiled !== undefined) {
    variants = variants.filter((v) => v.compiled === options.compiled);
  }

  // Apply sorting
  if (options.sortBy) {
    variants.sort((a, b) => {
      let comparison = 0;
      switch (options.sortBy) {
        case 'compileTime':
          comparison = (a.compileTimeMs ?? 0) - (b.compileTimeMs ?? 0);
          break;
        case 'timestamp':
          comparison = (a.compileTimestamp ?? 0) - (b.compileTimestamp ?? 0);
          break;
        case 'defineCount':
          comparison = Object.keys(a.defines).length - Object.keys(b.defines).length;
          break;
      }
      return options.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Apply limit
  if (options.limit && variants.length > options.limit) {
    variants = variants.slice(0, options.limit);
  }

  return {
    variants,
    fidelity: {
      level: 'EXACT',
      source: 'entity_graph',
    },
  };
}

/**
 * Get shader info with variant summary
 */
export function getShaderInfo(
  graph: EntityGraph,
  shaderId: EntityId
): { shader: ShaderNode | null; variants: ShaderVariant[]; cost: ShaderCostMetrics; fidelity: ShaderFidelityInfo } | null {
  const shaderNode = graph.getNode(shaderId) as ShaderNode | undefined;
  if (!shaderNode || shaderNode.type !== 'shader') {
    return null;
  }

  const { variants } = queryShaderVariants(graph, { shaderId });

  // Calculate cost metrics
  const totalCompileTime = variants.reduce((sum, v) => sum + (v.compileTimeMs ?? 0), 0);
  const hasExactTiming = variants.every((v) => v.compileTimeFidelity === 'EXACT' || v.compileTimeMs === undefined);

  // Count materials using this shader
  const materials = graph.getNodes({ types: ['material'] }).nodes as MaterialNode[];
  const materialCount = materials.filter((m) => m.shader_id === shaderId).length;

  const cost: ShaderCostMetrics = {
    totalCompileTimeMs: totalCompileTime,
    compileTimeFidelity: hasExactTiming ? 'EXACT' : 'ESTIMATED',
    variantCount: variants.length,
    materialCount,
  };

  return {
    shader: shaderNode,
    variants,
    cost,
    fidelity: {
      level: hasExactTiming ? 'EXACT' : 'ESTIMATED',
      source: 'entity_graph',
    },
  };
}

/**
 * Get variants for a specific material
 */
export function getMaterialVariants(
  graph: EntityGraph,
  materialId: EntityId
): { variants: ShaderVariant[]; fidelity: ShaderFidelityInfo } {
  const materialNode = graph.getNode(materialId) as MaterialNode | undefined;
  if (!materialNode || materialNode.type !== 'material') {
    return { variants: [], fidelity: { level: 'UNAVAILABLE', reason: 'Material not found' } };
  }

  if (!materialNode.shader_id) {
    return { variants: [], fidelity: { level: 'EXACT', source: 'entity_graph' } };
  }

  // Get variants that match this material's defines
  const { variants } = queryShaderVariants(graph, { shaderId: materialNode.shader_id });

  // Filter variants that match material defines
  const materialDefines = JSON.stringify(materialNode.defines);
  const matchingVariants = variants.filter((v) => {
    // Check if variant defines match material defines
    const variantDefines = JSON.stringify(v.defines);
    return variantDefines === materialDefines;
  });

  return {
    variants: matchingVariants.length > 0 ? matchingVariants : variants,
    fidelity: { level: 'EXACT', source: 'entity_graph' },
  };
}

// =============================================================================
// Compilation Event Tracking
// =============================================================================

/**
 * Compilation event tracker
 */
export class CompilationTracker {
  private events: CompilationEvent[] = [];
  private maxEvents: number;

  constructor(maxEvents: number = 10000) {
    this.maxEvents = maxEvents;
  }

  /**
   * Track a compilation event
   */
  track(event: ShaderCompileEvent, frame: number): void {
    const compilationEvent: CompilationEvent = {
      shaderId: event.shader_id,
      variantId: event.variant_id,
      materialId: event.material_id,
      defines: event.defines,
      compileTimeMs: event.compile_time_ms,
      timingFidelity: event.timing_fidelity,
      frame,
      timestamp: event.timestamp,
    };

    this.events.push(compilationEvent);

    // Trim old events if exceeding limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Get all tracked events
   */
  getEvents(): CompilationEvent[] {
    return [...this.events];
  }

  /**
   * Get events within a time range
   */
  getEventsInRange(startTime: number, endTime: number): CompilationEvent[] {
    return this.events.filter(
      (e) => e.timestamp >= startTime && e.timestamp <= endTime
    );
  }

  /**
   * Get events for a specific shader
   */
  getEventsForShader(shaderId: EntityId): CompilationEvent[] {
    return this.events.filter((e) => e.shaderId === shaderId);
  }

  /**
   * Get compilation statistics
   */
  getStats(): {
    totalEvents: number;
    totalCompileTime: number;
    avgCompileTime: number;
    uniqueShaders: number;
    uniqueVariants: number;
    fidelity: ShaderFidelityInfo;
  } {
    const eventsWithTime = this.events.filter((e) => e.compileTimeMs !== undefined);
    const totalTime = eventsWithTime.reduce((sum, e) => sum + (e.compileTimeMs ?? 0), 0);
    const hasExactTiming = eventsWithTime.every((e) => e.timingFidelity === 'EXACT');

    return {
      totalEvents: this.events.length,
      totalCompileTime: totalTime,
      avgCompileTime: eventsWithTime.length > 0 ? totalTime / eventsWithTime.length : 0,
      uniqueShaders: new Set(this.events.map((e) => e.shaderId)).size,
      uniqueVariants: new Set(this.events.map((e) => e.variantId)).size,
      fidelity: {
        level: hasExactTiming ? 'EXACT' : 'ESTIMATED',
        source: 'compilation_tracker',
      },
    };
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }
}

// =============================================================================
// Compilation Storm Detection
// =============================================================================

/**
 * Default storm detection options
 */
const DEFAULT_STORM_OPTIONS: Required<StormDetectionOptions> = {
  windowMs: 1000, // 1 second window
  threshold: 10, // 10 variants in 1 second = storm
  lookbackMs: 5000, // Look back 5 seconds
};

/**
 * Detect compilation storms (many variants compiled quickly)
 */
export function detectCompilationStorm(
  tracker: CompilationTracker,
  options: StormDetectionOptions = {}
): CompilationStorm {
  const opts = { ...DEFAULT_STORM_OPTIONS, ...options };

  const now = performance.now();
  const lookbackStart = now - opts.lookbackMs;

  // Get events in lookback window
  const recentEvents = tracker.getEvents().filter(
    (e) => e.timestamp >= lookbackStart
  );

  if (recentEvents.length === 0) {
    return {
      detected: false,
      variantCount: 0,
      windowMs: opts.windowMs,
      threshold: opts.threshold,
      affectedShaders: [],
      affectedMaterials: [],
      severity: 'low',
    };
  }

  // Sliding window detection
  let maxCount = 0;
  let stormStart: number | undefined;
  let stormEnd: number | undefined;
  let stormShaders = new Set<EntityId>();
  let stormMaterials = new Set<EntityId>();

  for (let i = 0; i < recentEvents.length; i++) {
    const windowStart = recentEvents[i].timestamp;
    const windowEnd = windowStart + opts.windowMs;

    // Count events in this window
    const windowEvents = recentEvents.filter(
      (e) => e.timestamp >= windowStart && e.timestamp < windowEnd
    );

    if (windowEvents.length > maxCount) {
      maxCount = windowEvents.length;
      stormStart = windowStart;
      stormEnd = windowEvents[windowEvents.length - 1].timestamp;
      stormShaders = new Set(windowEvents.map((e) => e.shaderId));
      stormMaterials = new Set(
        windowEvents.map((e) => e.materialId).filter((id): id is EntityId => id !== undefined)
      );
    }
  }

  const detected = maxCount >= opts.threshold;

  // Determine severity
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (detected) {
    const ratio = maxCount / opts.threshold;
    if (ratio >= 5) severity = 'critical';
    else if (ratio >= 3) severity = 'high';
    else if (ratio >= 1.5) severity = 'medium';
  }

  return {
    detected,
    variantCount: maxCount,
    windowMs: opts.windowMs,
    threshold: opts.threshold,
    affectedShaders: Array.from(stormShaders),
    affectedMaterials: Array.from(stormMaterials),
    startTimestamp: stormStart,
    endTimestamp: stormEnd,
    severity,
  };
}

// =============================================================================
// Controlled Mutation Interface
// =============================================================================

/**
 * Shader mutation controller
 * Provides controlled mutation interface per shader-graph contract:
 * - Toggle produces a before/after diff
 * - Changes can be reverted
 * - Performance delta is shown
 */
export class ShaderMutationController {
  private graph: EntityGraph;
  private tracker: CompilationTracker;
  private pendingMutations: Map<string, { mutation: ShaderMutation; originalValue?: unknown }> =
    new Map();
  private measurementCallback?: (shaderId: EntityId) => Promise<ShaderCostMetrics>;

  constructor(
    graph: EntityGraph,
    tracker: CompilationTracker,
    measurementCallback?: (shaderId: EntityId) => Promise<ShaderCostMetrics>
  ) {
    this.graph = graph;
    this.tracker = tracker;
    this.measurementCallback = measurementCallback;
  }

  /**
   * Create a mutation for toggling a define
   */
  createToggleDefine(shaderId: EntityId, defineKey: string): ShaderMutation {
    return {
      id: `toggle_${shaderId}_${defineKey}_${Date.now()}`,
      shaderId,
      type: 'toggle_define',
      key: defineKey,
      description: `Toggle define '${defineKey}' on shader ${shaderId}`,
    };
  }

  /**
   * Create a mutation for setting a define value
   */
  createSetDefine(
    shaderId: EntityId,
    defineKey: string,
    value: string | number | boolean
  ): ShaderMutation {
    return {
      id: `set_${shaderId}_${defineKey}_${Date.now()}`,
      shaderId,
      type: 'set_define',
      key: defineKey,
      value,
      description: `Set define '${defineKey}' to '${value}' on shader ${shaderId}`,
    };
  }

  /**
   * Create a mutation for removing a define
   */
  createRemoveDefine(shaderId: EntityId, defineKey: string): ShaderMutation {
    return {
      id: `remove_${shaderId}_${defineKey}_${Date.now()}`,
      shaderId,
      type: 'remove_define',
      key: defineKey,
      description: `Remove define '${defineKey}' from shader ${shaderId}`,
    };
  }

  /**
   * Apply a mutation and measure the impact
   */
  async applyMutation(mutation: ShaderMutation): Promise<MutationResult> {
    // Get before metrics
    const shaderInfo = getShaderInfo(this.graph, mutation.shaderId);
    if (!shaderInfo) {
      return {
        mutation,
        success: false,
        error: 'Shader not found',
        before: this.getEmptyCostMetrics(),
        after: this.getEmptyCostMetrics(),
        delta: this.getEmptyDelta(),
        canRevert: false,
      };
    }

    const before = shaderInfo.cost;

    // In a real implementation, this would:
    // 1. Modify the shader's defines
    // 2. Trigger recompilation
    // 3. Wait for compilation to complete
    // 4. Measure the new metrics

    // For now, we simulate the mutation
    console.log(`[addon-shader] Applying mutation: ${mutation.description}`);

    // Store for reversion
    this.pendingMutations.set(mutation.id, { mutation });

    // Get after metrics (in real impl, would wait for recompilation)
    const after = this.measurementCallback
      ? await this.measurementCallback(mutation.shaderId)
      : before;

    // Calculate delta
    const delta = this.calculateDelta(before, after);

    return {
      mutation,
      success: true,
      before,
      after,
      delta,
      canRevert: true,
    };
  }

  /**
   * Revert a mutation
   */
  async revertMutation(mutationId: string): Promise<boolean> {
    const pending = this.pendingMutations.get(mutationId);
    if (!pending) {
      console.warn(`[addon-shader] Mutation ${mutationId} not found for reversion`);
      return false;
    }

    console.log(`[addon-shader] Reverting mutation: ${pending.mutation.description}`);
    this.pendingMutations.delete(mutationId);

    // In a real implementation, this would restore the original shader state
    return true;
  }

  /**
   * Get pending mutations
   */
  getPendingMutations(): ShaderMutation[] {
    return Array.from(this.pendingMutations.values()).map((p) => p.mutation);
  }

  /**
   * Calculate delta between before and after metrics
   */
  private calculateDelta(before: ShaderCostMetrics, after: ShaderCostMetrics): MutationDelta {
    const compileTimeDelta = after.totalCompileTimeMs - before.totalCompileTimeMs;
    const variantCountDelta = after.variantCount - before.variantCount;

    // Determine impact
    let impact: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (compileTimeDelta < -10 || variantCountDelta < 0) {
      impact = 'positive';
    } else if (compileTimeDelta > 10 || variantCountDelta > 0) {
      impact = 'negative';
    }

    // Determine fidelity (lowest common fidelity)
    let fidelity: Fidelity = 'EXACT';
    if (before.compileTimeFidelity === 'ESTIMATED' || after.compileTimeFidelity === 'ESTIMATED') {
      fidelity = 'ESTIMATED';
    }
    if (before.compileTimeFidelity === 'UNAVAILABLE' || after.compileTimeFidelity === 'UNAVAILABLE') {
      fidelity = 'UNAVAILABLE';
    }

    return {
      gpuTimeDeltaMs:
        before.gpuTimeMs !== undefined && after.gpuTimeMs !== undefined
          ? after.gpuTimeMs - before.gpuTimeMs
          : undefined,
      compileTimeDeltaMs: compileTimeDelta,
      memoryDeltaBytes:
        before.memoryBytes !== undefined && after.memoryBytes !== undefined
          ? after.memoryBytes - before.memoryBytes
          : undefined,
      variantCountDelta,
      impact,
      fidelity,
    };
  }

  /**
   * Get empty cost metrics
   */
  private getEmptyCostMetrics(): ShaderCostMetrics {
    return {
      totalCompileTimeMs: 0,
      compileTimeFidelity: 'UNAVAILABLE',
      variantCount: 0,
      materialCount: 0,
    };
  }

  /**
   * Get empty delta
   */
  private getEmptyDelta(): MutationDelta {
    return {
      compileTimeDeltaMs: 0,
      variantCountDelta: 0,
      impact: 'neutral',
      fidelity: 'UNAVAILABLE',
    };
  }
}

// =============================================================================
// Shader Panel
// =============================================================================

/**
 * Create the shader panel
 */
export function createShaderPanel(client: LensClient, tracker: CompilationTracker): Panel {
  let container: HTMLElement | null = null;
  let selectedShaderId: EntityId | null = null;
  let mutationController: ShaderMutationController | null = null;

  function render(): void {
    if (!container) return;

    const graph = client.getGraph();
    if (!graph) {
      container.innerHTML = '<div class="shader-panel-empty">No graph available</div>';
      return;
    }

    // Initialize mutation controller if needed
    if (!mutationController) {
      mutationController = new ShaderMutationController(graph, tracker);
    }

    // Get all shaders
    const shaders = graph.getNodes({ types: ['shader'] }).nodes as ShaderNode[];

    // Check for compilation storms
    const storm = detectCompilationStorm(tracker);

    container.innerHTML = `
      <div class="shader-panel">
        <div class="shader-panel-header">
          <h3>Shader Graph</h3>
          ${renderStormWarning(storm)}
        </div>

        <div class="shader-list">
          <h4>Shaders (${shaders.length})</h4>
          ${renderShaderList(shaders, graph)}
        </div>

        ${selectedShaderId ? renderShaderDetail(graph, selectedShaderId) : ''}
      </div>
    `;

    attachEventListeners();
  }

  function renderStormWarning(storm: CompilationStorm): string {
    if (!storm.detected) return '';

    const colors: Record<string, string> = {
      low: '#ff9800',
      medium: '#f57c00',
      high: '#e65100',
      critical: '#d32f2f',
    };

    return `
      <div class="storm-warning" style="background: ${colors[storm.severity]}">
        <span class="storm-icon">⚠️</span>
        <span class="storm-text">
          Compilation Storm: ${storm.variantCount} variants in ${storm.windowMs}ms
        </span>
      </div>
    `;
  }

  function renderShaderList(shaders: ShaderNode[], graph: EntityGraph): string {
    if (shaders.length === 0) {
      return '<div class="shader-list-empty">No shaders found</div>';
    }

    return shaders
      .map((shader) => {
        const info = getShaderInfo(graph, shader.id);
        return `
        <div 
          class="shader-item ${selectedShaderId === shader.id ? 'selected' : ''}"
          data-shader-id="${shader.id}"
        >
          <div class="shader-item-header">
            <span class="shader-type-badge">${shader.shader_type}</span>
            <span class="shader-name">${shader.name ?? shader.id}</span>
          </div>
          <div class="shader-item-stats">
            <span class="stat">${info?.cost.variantCount ?? 0} variants</span>
            <span class="stat">${info?.cost.materialCount ?? 0} materials</span>
            ${renderFidelityBadge(info?.fidelity)}
          </div>
        </div>
      `;
      })
      .join('');
  }

  function renderShaderDetail(graph: EntityGraph, shaderId: EntityId): string {
    const info = getShaderInfo(graph, shaderId);
    if (!info) {
      return '<div class="shader-detail-empty">Shader not found</div>';
    }

    const { shader, variants, cost, fidelity } = info;

    return `
      <div class="shader-detail">
        <div class="shader-detail-header">
          <h4>${shader.name ?? shader.id}</h4>
          ${renderFidelityBadge(fidelity)}
        </div>

        <div class="shader-cost-metrics">
          <h5>Cost Metrics</h5>
          <div class="metric">
            <span class="metric-label">Total Compile Time:</span>
            <span class="metric-value">${cost.totalCompileTimeMs.toFixed(2)} ms</span>
            ${renderFidelityBadge({ level: cost.compileTimeFidelity })}
          </div>
          <div class="metric">
            <span class="metric-label">Variants:</span>
            <span class="metric-value">${cost.variantCount}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Materials:</span>
            <span class="metric-value">${cost.materialCount}</span>
          </div>
        </div>

        <div class="shader-variants">
          <h5>Variants (${variants.length})</h5>
          ${renderVariantList(variants)}
        </div>

        <div class="shader-mutations">
          <h5>Controlled Mutations</h5>
          ${renderMutationControls(shaderId)}
        </div>
      </div>
    `;
  }

  function renderVariantList(variants: ShaderVariant[]): string {
    if (variants.length === 0) {
      return '<div class="variant-list-empty">No variants</div>';
    }

    return `
      <div class="variant-list">
        ${variants
          .slice(0, 20)
          .map(
            (variant) => `
          <div class="variant-item ${variant.compiled ? 'compiled' : 'pending'}">
            <span class="variant-hash">${variant.defineHash.slice(0, 8)}</span>
            <span class="variant-defines">${Object.keys(variant.defines).length} defines</span>
            ${variant.compileTimeMs !== undefined ? `<span class="variant-time">${variant.compileTimeMs.toFixed(2)} ms</span>` : ''}
            <span class="variant-status">${variant.compiled ? '✓' : '○'}</span>
          </div>
        `
          )
          .join('')}
        ${variants.length > 20 ? `<div class="variant-more">+${variants.length - 20} more</div>` : ''}
      </div>
    `;
  }

  function renderMutationControls(shaderId: EntityId): string {
    return `
      <div class="mutation-controls">
        <p class="mutation-hint">
          Mutations allow controlled shader changes with before/after measurement.
          All mutations are reversible.
        </p>
        <div class="mutation-actions">
          <button class="mutation-btn" data-action="toggle" data-shader="${shaderId}">
            Toggle Feature
          </button>
          <button class="mutation-btn" data-action="simplify" data-shader="${shaderId}">
            Simplify
          </button>
        </div>
      </div>
    `;
  }

  function renderFidelityBadge(fidelity?: ShaderFidelityInfo): string {
    if (!fidelity) return '';

    const colors: Record<Fidelity, string> = {
      EXACT: '#4caf50',
      ESTIMATED: '#ff9800',
      UNAVAILABLE: '#9e9e9e',
    };

    return `
      <span class="fidelity-badge" style="background: ${colors[fidelity.level]}" title="${fidelity.reason ?? ''}">
        ${fidelity.level}
      </span>
    `;
  }

  function attachEventListeners(): void {
    if (!container) return;

    // Shader item clicks
    const shaderItems = container.querySelectorAll('.shader-item');
    shaderItems.forEach((item) => {
      item.addEventListener('click', () => {
        selectedShaderId = item.getAttribute('data-shader-id');
        render();
      });
    });

    // Mutation button clicks
    const mutationBtns = container.querySelectorAll('.mutation-btn');
    mutationBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const action = btn.getAttribute('data-action');
        const shaderId = btn.getAttribute('data-shader');
        if (!action || !shaderId || !mutationController) return;

        console.log(`[addon-shader] Mutation action: ${action} on ${shaderId}`);

        // Create and apply mutation
        if (action === 'toggle') {
          const mutation = mutationController.createToggleDefine(shaderId, 'USE_FEATURE');
          const result = await mutationController.applyMutation(mutation);
          console.log('[addon-shader] Mutation result:', result);
        }
      });
    });
  }

  return {
    id: 'shader',
    name: 'Shader Graph',

    render(target: HTMLElement, lensClient: LensClient) {
      container = target;
      render();
    },

    onSelectionChange(selection: Selection) {
      // Check if a shader or material is selected
      const graph = client.getGraph();
      if (!graph) return;

      for (const entityId of selection.entity_ids) {
        const node = graph.getNode(entityId);
        if (node?.type === 'shader') {
          selectedShaderId = entityId;
          render();
          break;
        } else if (node?.type === 'material') {
          // Find the shader for this material
          const material = node as MaterialNode;
          if (material.shader_id) {
            selectedShaderId = material.shader_id;
            render();
            break;
          }
        }
      }
    },

    dispose() {
      container = null;
      selectedShaderId = null;
      mutationController = null;
    },
  };
}

// =============================================================================
// Addon Definition
// =============================================================================

// Global tracker instance for the addon
let globalTracker: CompilationTracker | null = null;

/**
 * Get the global compilation tracker
 */
export function getCompilationTracker(): CompilationTracker {
  if (!globalTracker) {
    globalTracker = new CompilationTracker();
  }
  return globalTracker;
}

/**
 * Event handler for shader compilation events
 */
function handleShaderCompileEvent(event: Event, frame: number): void {
  if (event.type === 'shader_compile') {
    const tracker = getCompilationTracker();
    tracker.track(event as ShaderCompileEvent, frame);
  }
}

/**
 * Register shader-specific queries
 */
function registerShaderQueries(lens: Lens): void {
  console.log('[addon-shader] Registering shader queries');
  // Queries will be registered once the query system is fully wired
}

/**
 * Shader addon for GLSL introspection and live mutation
 */
export const shaderAddon: Addon = {
  // Identity
  id: 'com.3lens.addon-shader',
  version: '1.0.0',
  displayName: 'Shader',
  description: 'Shader introspection, variant analysis, and controlled mutation per shader-graph contract',

  // Compatibility
  requires: {
    kernel: '>=1.0.0',
    trace: '>=1.0.0',
  },

  // Capabilities
  capabilities: {
    required: ['capture.shaders'],
    optional: ['introspection.shaderSource', 'timing.gpu', 'mutation.shaders'],
  },

  // Lifecycle
  register(lens: Lens) {
    console.log('[addon-shader] Addon registered');
    registerShaderQueries(lens);

    // Initialize compilation tracker
    globalTracker = new CompilationTracker();

    // TODO: Subscribe to shader compilation events
    // lens.events.subscribe('shader_compile', handleShaderCompileEvent);
  },

  unregister(lens: Lens) {
    console.log('[addon-shader] Addon unregistered');
    globalTracker?.clear();
    globalTracker = null;
  },
};

export default shaderAddon;

// =============================================================================
// Re-exports
// =============================================================================

export { type Fidelity } from '@3lens/kernel';
