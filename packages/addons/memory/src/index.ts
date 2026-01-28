/**
 * @3lens/addon-memory
 *
 * Resource lifecycle and leak detection addon for 3Lens.
 *
 * @packageDocumentation
 */

import type { Addon, AddonCapabilities, AddonRequirements, Lens, LensClient, Selection } from '@3lens/runtime';
import type {
  EntityGraph,
  EntityId,
  Node,
  NodeType,
  Fidelity,
  GeometryNode,
  MaterialNode,
  TextureNode,
  RenderTargetNode,
  ResourceCreateEvent,
  ResourceDisposeEvent,
} from '@3lens/kernel';
import type { Panel } from '@3lens/ui-core';

// =============================================================================
// Types
// =============================================================================

/**
 * Fidelity information for a value
 */
export interface FidelityInfo {
  level: Fidelity;
  reason?: string;
  source?: string;
  proxies_used?: string[];
}

/**
 * Metric value with fidelity tracking
 */
export interface MetricValue {
  value: number;
  unit: string;
  fidelity: Fidelity;
  reason?: string;
}

/**
 * Resource types tracked by memory addon
 */
export type ResourceType = 'geometry' | 'material' | 'texture' | 'render_target' | 'shader' | 'buffer';

/**
 * Resource lifecycle event type
 */
export type LifecycleEventType = 'create' | 'update' | 'dispose';

/**
 * Resource lifecycle event
 */
export interface LifecycleEvent {
  entity_id: EntityId;
  event_type: LifecycleEventType;
  timestamp: number;
  frame: number;
  memory_delta_bytes: number;
  fidelity: Fidelity;
  reason?: string;
}

/**
 * Resource lifecycle info
 */
export interface ResourceLifecycle {
  entity_id: EntityId;
  resource_type: ResourceType;
  created_at: number;
  disposed_at?: number;
  lifetime_frames?: number;
  events: LifecycleEvent[];
  current_memory_bytes: MetricValue;
  peak_memory_bytes: MetricValue;
  update_count: number;
  is_orphaned: boolean;
  users: EntityId[];
}

/**
 * Potential memory leak
 */
export interface ResourceLeak {
  entity_id: EntityId;
  resource_type: ResourceType;
  entity_name: string;
  memory_bytes: MetricValue;
  lifetime_frames: number;
  leak_type: LeakType;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  fidelity: Fidelity;
  reason: string;
  suggestion: string;
}

/**
 * Leak detection type
 */
export type LeakType =
  | 'long_lived_unused'      // Resource exists for many frames without use
  | 'orphaned'               // Resource has no references
  | 'growing_allocation'     // Resource memory keeps increasing
  | 'undisposed'             // Resource created but never disposed
  | 'duplicate';             // Multiple identical resources

/**
 * Leak query parameters
 */
export interface LeakQueryParams {
  /** Context filter (or 'all') */
  context_id?: string;
  /** Minimum frames without use to consider a leak */
  unused_threshold_frames?: number;
  /** Resource types to check */
  resource_types?: ResourceType[];
  /** Minimum memory size to report */
  min_memory_bytes?: number;
  /** Maximum results */
  limit?: number;
}

/**
 * Leak query result
 */
export interface LeakQueryResult {
  leaks: ResourceLeak[];
  total_leaked_bytes: MetricValue;
  fidelity: Fidelity;
  metadata: {
    execution_time_ms: number;
    resources_scanned: number;
    leaks_found: number;
  };
}

/**
 * Memory usage by resource type
 */
export interface MemoryByType {
  resource_type: ResourceType;
  count: number;
  total_bytes: MetricValue;
  average_bytes: MetricValue;
  largest_entity: {
    id: EntityId;
    name: string;
    bytes: MetricValue;
  } | null;
  trend: TrendIndicator;
}

/**
 * Trend indicator for memory usage
 */
export interface TrendIndicator {
  direction: 'up' | 'down' | 'stable';
  change_percent: number;
  sample_frames: number;
  fidelity: Fidelity;
}

/**
 * Memory summary result
 */
export interface MemorySummaryResult {
  by_type: MemoryByType[];
  total_bytes: MetricValue;
  total_resources: number;
  orphaned_count: number;
  trend: TrendIndicator;
  fidelity: Fidelity;
  metadata: {
    execution_time_ms: number;
    context_id?: string;
  };
}

// =============================================================================
// Fidelity Utilities
// =============================================================================

/**
 * Combine fidelity levels (lowest wins)
 */
function combineFidelity(...fidelities: Fidelity[]): Fidelity {
  if (fidelities.includes('UNAVAILABLE')) return 'UNAVAILABLE';
  if (fidelities.includes('ESTIMATED')) return 'ESTIMATED';
  return 'EXACT';
}

/**
 * Get fidelity badge color
 */
function getFidelityColor(fidelity: Fidelity): string {
  switch (fidelity) {
    case 'EXACT':
      return '#4caf50';
    case 'ESTIMATED':
      return '#ff9800';
    case 'UNAVAILABLE':
      return '#9e9e9e';
  }
}

/**
 * Get trend indicator color
 */
function getTrendColor(direction: TrendIndicator['direction']): string {
  switch (direction) {
    case 'up':
      return '#f44336'; // Red - memory increasing
    case 'down':
      return '#4caf50'; // Green - memory decreasing
    case 'stable':
      return '#9e9e9e'; // Grey - stable
  }
}

// =============================================================================
// Resource Lifecycle Tracking
// =============================================================================

/**
 * In-memory lifecycle tracker
 */
class LifecycleTracker {
  private lifecycles = new Map<EntityId, ResourceLifecycle>();
  private historicalSnapshots: MemorySnapshot[] = [];
  private maxSnapshots = 60; // Keep 60 frames of history

  /**
   * Record a create event
   */
  recordCreate(
    entityId: EntityId,
    resourceType: ResourceType,
    memoryBytes: number,
    fidelity: Fidelity,
    frame: number,
    timestamp: number
  ): void {
    const lifecycle: ResourceLifecycle = {
      entity_id: entityId,
      resource_type: resourceType,
      created_at: frame,
      events: [
        {
          entity_id: entityId,
          event_type: 'create',
          timestamp,
          frame,
          memory_delta_bytes: memoryBytes,
          fidelity,
        },
      ],
      current_memory_bytes: { value: memoryBytes, unit: 'bytes', fidelity },
      peak_memory_bytes: { value: memoryBytes, unit: 'bytes', fidelity },
      update_count: 0,
      is_orphaned: false,
      users: [],
    };

    this.lifecycles.set(entityId, lifecycle);
  }

  /**
   * Record an update event
   */
  recordUpdate(
    entityId: EntityId,
    memoryDelta: number,
    fidelity: Fidelity,
    frame: number,
    timestamp: number
  ): void {
    const lifecycle = this.lifecycles.get(entityId);
    if (!lifecycle) return;

    lifecycle.events.push({
      entity_id: entityId,
      event_type: 'update',
      timestamp,
      frame,
      memory_delta_bytes: memoryDelta,
      fidelity,
    });

    lifecycle.current_memory_bytes.value += memoryDelta;
    lifecycle.current_memory_bytes.fidelity = combineFidelity(
      lifecycle.current_memory_bytes.fidelity,
      fidelity
    );

    if (lifecycle.current_memory_bytes.value > lifecycle.peak_memory_bytes.value) {
      lifecycle.peak_memory_bytes = { ...lifecycle.current_memory_bytes };
    }

    lifecycle.update_count++;
  }

  /**
   * Record a dispose event
   */
  recordDispose(entityId: EntityId, frame: number, timestamp: number): void {
    const lifecycle = this.lifecycles.get(entityId);
    if (!lifecycle) return;

    lifecycle.disposed_at = frame;
    lifecycle.lifetime_frames = frame - lifecycle.created_at;
    lifecycle.events.push({
      entity_id: entityId,
      event_type: 'dispose',
      timestamp,
      frame,
      memory_delta_bytes: -lifecycle.current_memory_bytes.value,
      fidelity: 'EXACT',
    });
  }

  /**
   * Update user references for a resource
   */
  updateUsers(entityId: EntityId, users: EntityId[]): void {
    const lifecycle = this.lifecycles.get(entityId);
    if (lifecycle) {
      lifecycle.users = users;
      lifecycle.is_orphaned = users.length === 0 && !lifecycle.disposed_at;
    }
  }

  /**
   * Get lifecycle for an entity
   */
  getLifecycle(entityId: EntityId): ResourceLifecycle | undefined {
    return this.lifecycles.get(entityId);
  }

  /**
   * Get all active lifecycles
   */
  getActiveLifecycles(): ResourceLifecycle[] {
    return Array.from(this.lifecycles.values()).filter((l) => !l.disposed_at);
  }

  /**
   * Record a memory snapshot for trend analysis
   */
  recordSnapshot(snapshot: MemorySnapshot): void {
    this.historicalSnapshots.push(snapshot);
    if (this.historicalSnapshots.length > this.maxSnapshots) {
      this.historicalSnapshots.shift();
    }
  }

  /**
   * Get historical snapshots for trend calculation
   */
  getSnapshots(): MemorySnapshot[] {
    return this.historicalSnapshots;
  }
}

interface MemorySnapshot {
  frame: number;
  timestamp: number;
  total_bytes: number;
  by_type: Record<ResourceType, number>;
}

// Global tracker instance
const lifecycleTracker = new LifecycleTracker();

// =============================================================================
// Leak Detection Queries
// =============================================================================

/**
 * Query for potential resource leaks
 */
export function queryResourceLeaks(
  graph: EntityGraph,
  params: LeakQueryParams
): LeakQueryResult {
  const startTime = performance.now();

  const resourceTypes = params.resource_types ?? [
    'geometry',
    'material',
    'texture',
    'render_target',
  ];
  const unusedThreshold = params.unused_threshold_frames ?? 300; // ~5 seconds at 60fps
  const minMemory = params.min_memory_bytes ?? 1024; // 1KB minimum
  const limit = params.limit ?? 50;

  const leaks: ResourceLeak[] = [];
  let resourcesScanned = 0;

  for (const resourceType of resourceTypes) {
    const resources = graph.getNodes({
      types: [resourceType as NodeType],
      context_id: params.context_id,
      active: true,
    });

    resourcesScanned += resources.nodes.length;

    for (const node of resources.nodes) {
      const leak = detectLeak(graph, node, resourceType as ResourceType, unusedThreshold);
      if (leak && leak.memory_bytes.value >= minMemory) {
        leaks.push(leak);
      }
    }
  }

  // Sort by memory size descending
  leaks.sort((a, b) => b.memory_bytes.value - a.memory_bytes.value);

  const limitedLeaks = leaks.slice(0, limit);
  const totalLeaked = limitedLeaks.reduce((sum, l) => sum + l.memory_bytes.value, 0);
  const fidelity = combineFidelity(...limitedLeaks.map((l) => l.fidelity));

  return {
    leaks: limitedLeaks,
    total_leaked_bytes: {
      value: totalLeaked,
      unit: 'bytes',
      fidelity,
    },
    fidelity,
    metadata: {
      execution_time_ms: performance.now() - startTime,
      resources_scanned: resourcesScanned,
      leaks_found: leaks.length,
    },
  };
}

/**
 * Detect if a resource is a potential leak
 */
function detectLeak(
  graph: EntityGraph,
  node: Node,
  resourceType: ResourceType,
  unusedThreshold: number
): ResourceLeak | null {
  // Get memory info from node
  const memoryBytes = getResourceMemory(node);

  // Check for orphaned resources (no users)
  const users = graph.getIncomingEdges(node.id, 'uses');
  const isOrphaned = users.length === 0;

  // Get lifecycle info
  const lifecycle = lifecycleTracker.getLifecycle(node.id);
  const lifetimeFrames = lifecycle?.lifetime_frames ?? estimateLifetimeFrames(node);

  // Determine leak type and confidence
  let leakType: LeakType | null = null;
  let confidence: ResourceLeak['confidence'] = 'LOW';
  let reason = '';
  let suggestion = '';

  if (isOrphaned) {
    leakType = 'orphaned';
    confidence = 'HIGH';
    reason = 'Resource has no references from any mesh, material, or scene';
    suggestion = 'Call .dispose() to free GPU memory';
  } else if (lifetimeFrames > unusedThreshold) {
    // Check if resource was used recently
    const recentUses = users.filter((e) => e.active);
    if (recentUses.length === 0) {
      leakType = 'long_lived_unused';
      confidence = 'MEDIUM';
      reason = `Resource has existed for ${lifetimeFrames} frames without recent use`;
      suggestion = 'Consider disposing if no longer needed';
    }
  }

  // Check for growing allocation pattern
  if (lifecycle && lifecycle.update_count > 10) {
    const growthRate = lifecycle.current_memory_bytes.value / lifecycle.peak_memory_bytes.value;
    if (growthRate > 0.8 && lifecycle.current_memory_bytes.value > memoryBytes.value * 0.5) {
      leakType = 'growing_allocation';
      confidence = 'MEDIUM';
      reason = `Resource memory has grown through ${lifecycle.update_count} updates`;
      suggestion = 'Check for unnecessary buffer resizing';
    }
  }

  if (!leakType) return null;

  return {
    entity_id: node.id,
    resource_type: resourceType,
    entity_name: node.name ?? node.id,
    memory_bytes: memoryBytes,
    lifetime_frames: lifetimeFrames,
    leak_type: leakType,
    confidence,
    fidelity: memoryBytes.fidelity,
    reason,
    suggestion,
  };
}

/**
 * Get memory usage from a resource node
 */
function getResourceMemory(node: Node): MetricValue {
  // Type-specific memory extraction
  if (node.type === 'geometry') {
    const geo = node as unknown as GeometryNode;
    return {
      value: geo.memory_bytes ?? 0,
      unit: 'bytes',
      fidelity: geo.memory_fidelity ?? 'ESTIMATED',
      reason: geo.memory_fidelity !== 'EXACT' ? 'Estimated from attribute sizes' : undefined,
    };
  }

  if (node.type === 'texture') {
    const tex = node as unknown as TextureNode;
    return {
      value: tex.memory_bytes ?? 0,
      unit: 'bytes',
      fidelity: tex.memory_fidelity ?? 'ESTIMATED',
      reason: tex.memory_fidelity !== 'EXACT' ? 'Estimated from dimensions and format' : undefined,
    };
  }

  if (node.type === 'render_target') {
    const rt = node as unknown as RenderTargetNode;
    return {
      value: rt.memory_bytes ?? 0,
      unit: 'bytes',
      fidelity: rt.memory_fidelity ?? 'ESTIMATED',
    };
  }

  // Default estimation for materials and other resources
  return {
    value: 1024, // Minimal placeholder
    unit: 'bytes',
    fidelity: 'ESTIMATED',
    reason: 'Memory usage estimated',
  };
}

/**
 * Estimate lifetime frames for a node without lifecycle tracking
 */
function estimateLifetimeFrames(node: Node): number {
  // Use created_at as a proxy (assuming seq ~ frame)
  const now = Date.now();
  // Rough estimate: assume 60fps
  return Math.floor((now - node.created_at) / 16.67);
}

/**
 * Find orphaned resources (not referenced by anything active)
 */
export function findOrphanedResources(
  graph: EntityGraph,
  contextId?: string
): ResourceLeak[] {
  const resourceTypes: NodeType[] = ['geometry', 'material', 'texture', 'render_target'];
  const orphans: ResourceLeak[] = [];

  for (const resourceType of resourceTypes) {
    const resources = graph.getNodes({
      types: [resourceType],
      context_id: contextId,
      active: true,
    });

    for (const node of resources.nodes) {
      const users = graph.getIncomingEdges(node.id, 'uses');
      const activeUsers = users.filter((e) => e.active);

      if (activeUsers.length === 0) {
        const memoryBytes = getResourceMemory(node);
        orphans.push({
          entity_id: node.id,
          resource_type: resourceType as ResourceType,
          entity_name: node.name ?? node.id,
          memory_bytes: memoryBytes,
          lifetime_frames: estimateLifetimeFrames(node),
          leak_type: 'orphaned',
          confidence: 'HIGH',
          fidelity: memoryBytes.fidelity,
          reason: 'No active references to this resource',
          suggestion: 'Call .dispose() to free GPU memory',
        });
      }
    }
  }

  return orphans;
}

// =============================================================================
// Memory Summary
// =============================================================================

/**
 * Get memory usage summary by resource type
 */
export function getMemorySummary(
  graph: EntityGraph,
  contextId?: string
): MemorySummaryResult {
  const startTime = performance.now();
  const resourceTypes: ResourceType[] = [
    'geometry',
    'material',
    'texture',
    'render_target',
    'shader',
  ];

  const byType: MemoryByType[] = [];
  let totalBytes = 0;
  let totalResources = 0;
  let orphanedCount = 0;
  const fidelities: Fidelity[] = [];

  for (const resourceType of resourceTypes) {
    const resources = graph.getNodes({
      types: [resourceType as NodeType],
      context_id: contextId,
      active: true,
    });

    if (resources.nodes.length === 0) continue;

    let typeTotal = 0;
    let largest: { id: EntityId; name: string; bytes: MetricValue } | null = null;

    for (const node of resources.nodes) {
      const memory = getResourceMemory(node);
      typeTotal += memory.value;
      fidelities.push(memory.fidelity);

      // Check for orphaned
      const users = graph.getIncomingEdges(node.id, 'uses');
      if (users.filter((e) => e.active).length === 0) {
        orphanedCount++;
      }

      // Track largest
      if (!largest || memory.value > largest.bytes.value) {
        largest = {
          id: node.id,
          name: node.name ?? node.id,
          bytes: memory,
        };
      }
    }

    const count = resources.nodes.length;
    const avgBytes = count > 0 ? typeTotal / count : 0;
    const typeFidelity = combineFidelity(...resources.nodes.map((n) => getResourceMemory(n).fidelity));

    byType.push({
      resource_type: resourceType,
      count,
      total_bytes: { value: typeTotal, unit: 'bytes', fidelity: typeFidelity },
      average_bytes: { value: avgBytes, unit: 'bytes', fidelity: typeFidelity },
      largest_entity: largest,
      trend: calculateTrend(resourceType),
    });

    totalBytes += typeTotal;
    totalResources += count;
  }

  // Sort by total bytes descending
  byType.sort((a, b) => b.total_bytes.value - a.total_bytes.value);

  // Record snapshot for trend tracking
  const snapshot: MemorySnapshot = {
    frame: Date.now(), // Use timestamp as proxy for frame
    timestamp: Date.now(),
    total_bytes: totalBytes,
    by_type: Object.fromEntries(byType.map((t) => [t.resource_type, t.total_bytes.value])) as Record<ResourceType, number>,
  };
  lifecycleTracker.recordSnapshot(snapshot);

  const overallFidelity = combineFidelity(...fidelities);

  return {
    by_type: byType,
    total_bytes: { value: totalBytes, unit: 'bytes', fidelity: overallFidelity },
    total_resources: totalResources,
    orphaned_count: orphanedCount,
    trend: calculateOverallTrend(),
    fidelity: overallFidelity,
    metadata: {
      execution_time_ms: performance.now() - startTime,
      context_id: contextId,
    },
  };
}

/**
 * Calculate trend for a specific resource type
 */
function calculateTrend(resourceType: ResourceType): TrendIndicator {
  const snapshots = lifecycleTracker.getSnapshots();

  if (snapshots.length < 2) {
    return {
      direction: 'stable',
      change_percent: 0,
      sample_frames: snapshots.length,
      fidelity: 'ESTIMATED',
    };
  }

  const recent = snapshots.slice(-10);
  const first = recent[0].by_type[resourceType] ?? 0;
  const last = recent[recent.length - 1].by_type[resourceType] ?? 0;

  if (first === 0) {
    return {
      direction: last > 0 ? 'up' : 'stable',
      change_percent: last > 0 ? 100 : 0,
      sample_frames: recent.length,
      fidelity: 'ESTIMATED',
    };
  }

  const changePercent = ((last - first) / first) * 100;
  const threshold = 5; // 5% threshold for "stable"

  return {
    direction: changePercent > threshold ? 'up' : changePercent < -threshold ? 'down' : 'stable',
    change_percent: Math.abs(changePercent),
    sample_frames: recent.length,
    fidelity: 'ESTIMATED',
  };
}

/**
 * Calculate overall memory trend
 */
function calculateOverallTrend(): TrendIndicator {
  const snapshots = lifecycleTracker.getSnapshots();

  if (snapshots.length < 2) {
    return {
      direction: 'stable',
      change_percent: 0,
      sample_frames: snapshots.length,
      fidelity: 'ESTIMATED',
    };
  }

  const recent = snapshots.slice(-10);
  const first = recent[0].total_bytes;
  const last = recent[recent.length - 1].total_bytes;

  if (first === 0) {
    return {
      direction: last > 0 ? 'up' : 'stable',
      change_percent: last > 0 ? 100 : 0,
      sample_frames: recent.length,
      fidelity: 'ESTIMATED',
    };
  }

  const changePercent = ((last - first) / first) * 100;
  const threshold = 5;

  return {
    direction: changePercent > threshold ? 'up' : changePercent < -threshold ? 'down' : 'stable',
    change_percent: Math.abs(changePercent),
    sample_frames: recent.length,
    fidelity: 'ESTIMATED',
  };
}

// =============================================================================
// Memory Panel
// =============================================================================

/**
 * Create the memory panel
 */
export function createMemoryPanel(client: LensClient): Panel {
  let container: HTMLElement | null = null;
  let currentContextId: string | undefined;
  let showLeaks = false;

  const render = () => {
    if (!container) return;

    const graph = client.getGraph();
    if (!graph) {
      container.innerHTML = renderNoGraphState();
      return;
    }

    const summary = getMemorySummary(graph, currentContextId);
    const leaks = showLeaks ? queryResourceLeaks(graph, { context_id: currentContextId }) : null;

    container.innerHTML = renderMemoryPanel(summary, leaks, showLeaks, (show) => {
      showLeaks = show;
      render();
    });
  };

  return {
    id: 'memory',
    name: 'Memory',

    render(target: HTMLElement, lensClient: LensClient) {
      container = target;
      render();
    },

    onSelectionChange(selection: Selection) {
      if (selection.context_id !== 'all') {
        currentContextId = selection.context_id;
        render();
      }
    },

    dispose() {
      container = null;
    },
  };
}

/**
 * Render no graph state
 */
function renderNoGraphState(): string {
  return `
    <div class="memory-empty">
      <div class="memory-empty-icon">📊</div>
      <div class="memory-empty-title">No Data Available</div>
      <div class="memory-empty-hint">
        Attach to a scene to view memory usage.
      </div>
    </div>
  `;
}

/**
 * Render the memory panel content
 */
function renderMemoryPanel(
  summary: MemorySummaryResult,
  leaks: LeakQueryResult | null,
  showLeaks: boolean,
  onToggleLeaks: (show: boolean) => void
): string {
  return `
    <div class="memory-panel">
      <!-- Header -->
      <div class="memory-header">
        <div class="memory-title">
          Memory Usage
          <span class="memory-fidelity-badge" style="background: ${getFidelityColor(summary.fidelity)}">
            ${summary.fidelity}
          </span>
        </div>
        <div class="memory-controls">
          <button class="memory-toggle-leaks ${showLeaks ? 'active' : ''}" data-action="toggle-leaks">
            ${showLeaks ? 'Hide Leaks' : 'Show Leaks'}
          </button>
        </div>
      </div>

      <!-- Total summary -->
      <div class="memory-summary">
        <div class="memory-total">
          <span class="total-label">Total:</span>
          <span class="total-value">${formatBytes(summary.total_bytes.value)}</span>
          ${renderTrendBadge(summary.trend)}
        </div>
        <div class="memory-stats">
          <span class="stat-item">${summary.total_resources} resources</span>
          <span class="stat-item ${summary.orphaned_count > 0 ? 'warning' : ''}">${summary.orphaned_count} orphaned</span>
        </div>
      </div>

      <!-- By type breakdown -->
      <div class="memory-by-type">
        <div class="section-title">By Resource Type</div>
        ${summary.by_type.map((type) => renderResourceTypeRow(type, summary.total_bytes.value)).join('')}
      </div>

      <!-- Leak detection results -->
      ${showLeaks && leaks ? renderLeakSection(leaks) : ''}
    </div>
  `;
}

/**
 * Render a resource type row
 */
function renderResourceTypeRow(type: MemoryByType, totalBytes: number): string {
  const percentage = totalBytes > 0 ? (type.total_bytes.value / totalBytes) * 100 : 0;
  const typeLabels: Record<ResourceType, string> = {
    geometry: 'Geometry',
    material: 'Materials',
    texture: 'Textures',
    render_target: 'Render Targets',
    shader: 'Shaders',
    buffer: 'Buffers',
  };

  const typeIcons: Record<ResourceType, string> = {
    geometry: '📐',
    material: '🎨',
    texture: '🖼️',
    render_target: '🎬',
    shader: '✨',
    buffer: '📦',
  };

  return `
    <div class="memory-type-row">
      <div class="type-header">
        <span class="type-icon">${typeIcons[type.resource_type]}</span>
        <span class="type-name">${typeLabels[type.resource_type]}</span>
        <span class="type-count">(${type.count})</span>
        ${renderTrendBadge(type.trend)}
        <span class="type-fidelity" style="background: ${getFidelityColor(type.total_bytes.fidelity)}">
          ${type.total_bytes.fidelity}
        </span>
      </div>
      <div class="type-bar-container">
        <div class="type-bar" style="width: ${percentage}%"></div>
        <span class="type-percentage">${percentage.toFixed(1)}%</span>
      </div>
      <div class="type-details">
        <span class="type-total">${formatBytes(type.total_bytes.value)}</span>
        <span class="type-avg">avg: ${formatBytes(type.average_bytes.value)}</span>
        ${type.largest_entity
          ? `<span class="type-largest" title="${type.largest_entity.id}">largest: ${formatBytes(type.largest_entity.bytes.value)}</span>`
          : ''
        }
      </div>
    </div>
  `;
}

/**
 * Render trend badge
 */
function renderTrendBadge(trend: TrendIndicator): string {
  const arrows: Record<TrendIndicator['direction'], string> = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return `
    <span class="trend-badge" style="color: ${getTrendColor(trend.direction)}" title="Based on ${trend.sample_frames} samples">
      ${arrows[trend.direction]} ${trend.change_percent > 0 ? trend.change_percent.toFixed(1) + '%' : ''}
    </span>
  `;
}

/**
 * Render leak detection section
 */
function renderLeakSection(leaks: LeakQueryResult): string {
  return `
    <div class="memory-leaks">
      <div class="section-title">
        Potential Leaks
        <span class="leak-count ${leaks.leaks.length > 0 ? 'warning' : ''}">${leaks.leaks.length} found</span>
      </div>
      ${leaks.leaks.length === 0
        ? '<div class="no-leaks">No potential leaks detected</div>'
        : `
          <div class="leak-summary">
            Total leaked: ${formatBytes(leaks.total_leaked_bytes.value)}
          </div>
          <div class="leak-list">
            ${leaks.leaks.map(renderLeakRow).join('')}
          </div>
        `
      }
    </div>
  `;
}

/**
 * Render a single leak row
 */
function renderLeakRow(leak: ResourceLeak): string {
  const confidenceColors: Record<ResourceLeak['confidence'], string> = {
    HIGH: '#f44336',
    MEDIUM: '#ff9800',
    LOW: '#9e9e9e',
  };

  const leakTypeLabels: Record<LeakType, string> = {
    long_lived_unused: 'Unused',
    orphaned: 'Orphaned',
    growing_allocation: 'Growing',
    undisposed: 'Undisposed',
    duplicate: 'Duplicate',
  };

  return `
    <div class="leak-row" data-entity-id="${leak.entity_id}">
      <div class="leak-header">
        <span class="leak-type-badge" style="background: ${confidenceColors[leak.confidence]}">
          ${leakTypeLabels[leak.leak_type]}
        </span>
        <span class="leak-name">${leak.entity_name}</span>
        <span class="leak-resource-type">${leak.resource_type}</span>
        <span class="leak-fidelity" style="background: ${getFidelityColor(leak.fidelity)}">
          ${leak.fidelity}
        </span>
      </div>
      <div class="leak-details">
        <span class="leak-memory">${formatBytes(leak.memory_bytes.value)}</span>
        <span class="leak-lifetime">${leak.lifetime_frames} frames</span>
        <span class="leak-confidence">${leak.confidence} confidence</span>
      </div>
      <div class="leak-reason">${leak.reason}</div>
      <div class="leak-suggestion">💡 ${leak.suggestion}</div>
    </div>
  `;
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

// =============================================================================
// Addon Definition
// =============================================================================

/**
 * Memory addon for resource lifecycle tracking and leak detection
 */
export const memoryAddon: Addon = {
  // Identity
  id: 'com.3lens.addon-memory',
  version: '1.0.0',
  displayName: 'Memory',
  description: 'Resource lifecycle tracking, leak detection, and memory analysis for textures, geometries, and materials',

  // Compatibility
  requires: {
    kernel: '^1.0.0',
    trace: '^1.0.0',
  } satisfies AddonRequirements,

  // Capabilities
  capabilities: {
    required: ['capture.renderEvents'],
    optional: ['timing.cpu', 'introspection.pipeline'],
  } satisfies AddonCapabilities,

  // Lifecycle
  register(lens: Lens) {
    console.log('[3Lens] Memory addon registered');

    // Register queries
    registerMemoryQueries(lens);

    // Subscribe to resource events for lifecycle tracking
    subscribeToResourceEvents(lens);

    // Register panel (when UI core is ready)
    // lens.registerPanel?.(createMemoryPanel(lens.getClient()));
  },

  unregister(lens: Lens) {
    console.log('[3Lens] Memory addon unregistered');
  },
};

/**
 * Register memory-specific queries
 */
function registerMemoryQueries(lens: Lens) {
  // Queries will be registered once query system is fully wired
  // For now, the exported functions can be used directly
}

/**
 * Subscribe to resource events for lifecycle tracking
 */
function subscribeToResourceEvents(lens: Lens) {
  lens.on('resource_create', (event) => {
    const e = event as unknown as ResourceCreateEvent;
    lifecycleTracker.recordCreate(
      e.entity_id,
      e.resource_type as ResourceType,
      e.memory_bytes ?? 0,
      e.memory_fidelity ?? 'ESTIMATED',
      0, // Frame number would come from event context
      e.timestamp
    );
  });

  lens.on('resource_update', (event) => {
    const e = event as unknown as {
      entity_id: string;
      memory_delta?: number;
      memory_fidelity?: Fidelity;
      timestamp: number;
    };
    lifecycleTracker.recordUpdate(
      e.entity_id,
      e.memory_delta ?? 0,
      e.memory_fidelity ?? 'ESTIMATED',
      0,
      e.timestamp
    );
  });

  lens.on('resource_dispose', (event) => {
    const e = event as unknown as ResourceDisposeEvent;
    lifecycleTracker.recordDispose(e.entity_id, 0, e.timestamp);
  });
}

// Export query functions
export {
  queryResourceLeaks,
  findOrphanedResources,
  getMemorySummary,
  createMemoryPanel,
  lifecycleTracker,
};

export default memoryAddon;
