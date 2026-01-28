/**
 * @3lens/addon-perf
 *
 * Performance analysis with attribution addon for 3Lens.
 *
 * @packageDocumentation
 */

import type { Addon, AddonCapabilities, AddonRequirements, Lens, LensClient } from '@3lens/runtime';
import type {
  EntityGraph,
  EntityId,
  Node,
  NodeType,
  Fidelity,
  DrawCallNode,
  MeshNode,
  MaterialNode,
  GeometryNode,
} from '@3lens/kernel';
import type { Panel, PanelConfig } from '@3lens/ui-core';

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
 * Performance hotspot entry
 */
export interface Hotspot {
  entity_id: EntityId;
  entity_type: NodeType;
  entity_name: string;
  metric: MetricValue;
  percentage: number;
  attribution_chain: AttributionLink[];
  context_id: string;
}

/**
 * Attribution link in blame chain
 */
export interface AttributionLink {
  from_entity: EntityId;
  to_entity: EntityId;
  edge_type: string;
  weight: number;
  contribution: MetricValue;
}

/**
 * Hotspot query parameters
 */
export interface HotspotQueryParams {
  /** Sort metric */
  sort_by: 'gpu_time' | 'cpu_time' | 'draw_count' | 'triangle_count';
  /** Context filter (or 'all') */
  context_id?: string;
  /** Time window in frames (default: current frame) */
  time_window?: number;
  /** Maximum results */
  limit?: number;
  /** Minimum fidelity filter */
  min_fidelity?: Fidelity;
}

/**
 * Hotspot query result
 */
export interface HotspotQueryResult {
  hotspots: Hotspot[];
  total_metric: MetricValue;
  fidelity: Fidelity;
  time_range: { start_frame: number; end_frame: number };
  metadata: {
    execution_time_ms: number;
    truncated: boolean;
    total_count: number;
  };
}

/**
 * Attribution chain parameters
 */
export interface AttributionParams {
  /** Entity to trace attribution for */
  entity_id: EntityId;
  /** Attribution direction */
  direction: 'upstream' | 'downstream';
  /** Maximum depth */
  max_depth?: number;
}

/**
 * Attribution result
 */
export interface AttributionResult {
  root_entity: EntityId;
  chains: AttributionChain[];
  total_weight: number;
  fidelity: Fidelity;
}

/**
 * A single attribution chain
 */
export interface AttributionChain {
  path: AttributionLink[];
  terminal_entity: EntityId;
  total_weight: number;
  fidelity: Fidelity;
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

// =============================================================================
// Hotspot Queries
// =============================================================================

/**
 * Query top hotspots by a given metric
 */
export function queryTopHotspots(
  graph: EntityGraph,
  params: HotspotQueryParams
): HotspotQueryResult {
  const startTime = performance.now();
  const limit = params.limit ?? 20;

  // Get frame nodes for time window
  const frames = getFramesInWindow(graph, params.context_id, params.time_window ?? 1);
  if (frames.length === 0) {
    return {
      hotspots: [],
      total_metric: { value: 0, unit: getUnitForMetric(params.sort_by), fidelity: 'UNAVAILABLE', reason: 'No frames found' },
      fidelity: 'UNAVAILABLE',
      time_range: { start_frame: 0, end_frame: 0 },
      metadata: {
        execution_time_ms: performance.now() - startTime,
        truncated: false,
        total_count: 0,
      },
    };
  }

  // Aggregate metrics by entity
  const metricsByEntity = aggregateMetrics(graph, frames, params.sort_by, params.context_id);

  // Sort and limit
  const sortedEntities = Array.from(metricsByEntity.entries())
    .sort((a, b) => b[1].value - a[1].value);

  const totalValue = sortedEntities.reduce((sum, [, m]) => sum + m.value, 0);

  // Apply fidelity filter if specified
  let filtered = sortedEntities;
  if (params.min_fidelity) {
    filtered = sortedEntities.filter(([, m]) => {
      if (params.min_fidelity === 'EXACT') return m.fidelity === 'EXACT';
      if (params.min_fidelity === 'ESTIMATED') return m.fidelity !== 'UNAVAILABLE';
      return true;
    });
  }

  const truncated = filtered.length > limit;
  const topEntities = filtered.slice(0, limit);

  // Build hotspot results with attribution chains
  const hotspots: Hotspot[] = topEntities.map(([entityId, metric]) => {
    const node = graph.getNode(entityId);
    const chain = buildAttributionChain(graph, entityId, 'upstream', 3);

    return {
      entity_id: entityId,
      entity_type: node?.type ?? 'object3d',
      entity_name: node?.name ?? entityId,
      metric,
      percentage: totalValue > 0 ? (metric.value / totalValue) * 100 : 0,
      attribution_chain: chain,
      context_id: node?.context_id ?? params.context_id ?? 'unknown',
    };
  });

  // Calculate combined fidelity
  const fidelity = combineFidelity(...hotspots.map((h) => h.metric.fidelity));

  return {
    hotspots,
    total_metric: {
      value: totalValue,
      unit: getUnitForMetric(params.sort_by),
      fidelity,
    },
    fidelity,
    time_range: {
      start_frame: frames[frames.length - 1]?.frame_number ?? 0,
      end_frame: frames[0]?.frame_number ?? 0,
    },
    metadata: {
      execution_time_ms: performance.now() - startTime,
      truncated,
      total_count: filtered.length,
    },
  };
}

/**
 * Get unit string for a metric type
 */
function getUnitForMetric(metric: HotspotQueryParams['sort_by']): string {
  switch (metric) {
    case 'gpu_time':
    case 'cpu_time':
      return 'ms';
    case 'draw_count':
      return 'calls';
    case 'triangle_count':
      return 'triangles';
  }
}

/**
 * Get frame nodes within the time window
 */
function getFramesInWindow(
  graph: EntityGraph,
  contextId?: string,
  windowSize: number = 1
): FrameData[] {
  const frameNodes = graph.getNodes({
    types: ['frame'],
    context_id: contextId,
    active: true,
    limit: windowSize,
  });

  return frameNodes.nodes.map((node) => {
    const frame = node as Node & {
      frame_number: number;
      duration_ms?: number;
      duration_fidelity?: Fidelity;
      draw_call_count: number;
      triangle_count: number;
    };

    return {
      id: frame.id,
      frame_number: frame.frame_number,
      duration_ms: frame.duration_ms,
      duration_fidelity: frame.duration_fidelity,
      draw_call_count: frame.draw_call_count,
      triangle_count: frame.triangle_count,
    };
  });
}

interface FrameData {
  id: EntityId;
  frame_number: number;
  duration_ms?: number;
  duration_fidelity?: Fidelity;
  draw_call_count: number;
  triangle_count: number;
}

/**
 * Aggregate metrics by entity across frames
 */
function aggregateMetrics(
  graph: EntityGraph,
  frames: FrameData[],
  metric: HotspotQueryParams['sort_by'],
  contextId?: string
): Map<EntityId, MetricValue> {
  const metrics = new Map<EntityId, MetricValue>();

  for (const frame of frames) {
    // Get draw calls for this frame
    const drawCalls = graph.getNodes({
      types: ['draw_call'],
      context_id: contextId,
      active: true,
    });

    for (const drawCallNode of drawCalls.nodes) {
      const dc = drawCallNode as unknown as DrawCallNode;

      // Get the mesh associated with this draw call
      const meshId = dc.mesh_id;
      if (!meshId) continue;

      // Get current metric value for this mesh
      const current = metrics.get(meshId) ?? {
        value: 0,
        unit: getUnitForMetric(metric),
        fidelity: 'EXACT' as Fidelity,
      };

      // Add metric value based on type
      switch (metric) {
        case 'gpu_time':
          // GPU time often not available, estimate from triangles
          if (frame.duration_ms && frame.triangle_count > 0) {
            const estimatedTime = (dc.vertex_count / frame.triangle_count) * (frame.duration_ms ?? 0);
            current.value += estimatedTime;
            current.fidelity = combineFidelity(current.fidelity, frame.duration_fidelity ?? 'ESTIMATED');
            if (current.fidelity !== 'EXACT') {
              current.reason = 'GPU time estimated from frame duration and vertex proportion';
            }
          } else {
            current.fidelity = 'UNAVAILABLE';
            current.reason = 'GPU timing not available';
          }
          break;

        case 'cpu_time':
          // CPU time typically unavailable, mark as estimated
          current.fidelity = 'ESTIMATED';
          current.reason = 'CPU time estimated from draw call overhead';
          current.value += 0.01; // Rough estimate per draw call
          break;

        case 'draw_count':
          current.value += dc.instance_count ?? 1;
          break;

        case 'triangle_count':
          const triangles = dc.index_count
            ? dc.index_count / 3
            : dc.vertex_count / 3;
          current.value += triangles * (dc.instance_count ?? 1);
          break;
      }

      metrics.set(meshId, current);
    }
  }

  return metrics;
}

/**
 * Build attribution chain for weighted blame
 */
function buildAttributionChain(
  graph: EntityGraph,
  entityId: EntityId,
  direction: 'upstream' | 'downstream',
  maxDepth: number
): AttributionLink[] {
  const chain: AttributionLink[] = [];
  const visited = new Set<EntityId>();
  let currentId = entityId;

  for (let depth = 0; depth < maxDepth; depth++) {
    if (visited.has(currentId)) break;
    visited.add(currentId);

    // Get edges based on direction
    const edges = direction === 'upstream'
      ? graph.getOutgoingEdges(currentId, 'uses')
      : graph.getIncomingEdges(currentId, 'uses');

    if (edges.length === 0) {
      // Also check parent relationships for scene graph attribution
      const parentEdges = graph.getIncomingEdges(currentId, 'contains');
      if (parentEdges.length === 0) break;

      const parentEdge = parentEdges[0];
      chain.push({
        from_entity: parentEdge.from,
        to_entity: currentId,
        edge_type: 'contains',
        weight: 1.0,
        contribution: { value: 0, unit: '', fidelity: 'EXACT' },
      });
      currentId = parentEdge.from;
      continue;
    }

    // Calculate weighted contributions
    const totalWeight = edges.length;
    for (const edge of edges) {
      const targetId = direction === 'upstream' ? edge.to : edge.from;
      const weight = 1.0 / totalWeight; // Equal weight distribution

      chain.push({
        from_entity: direction === 'upstream' ? currentId : targetId,
        to_entity: direction === 'upstream' ? targetId : currentId,
        edge_type: edge.type,
        weight,
        contribution: { value: 0, unit: '', fidelity: 'EXACT' },
      });

      // Continue along first edge for linear chain
      if (chain.length === depth + 1) {
        currentId = targetId;
      }
    }
  }

  return chain;
}

/**
 * Compute full attribution chains with weighted blame
 */
export function computeAttribution(
  graph: EntityGraph,
  params: AttributionParams
): AttributionResult {
  const maxDepth = params.max_depth ?? 5;
  const chains: AttributionChain[] = [];

  // BFS to find all attribution paths
  interface PathNode {
    entityId: EntityId;
    path: AttributionLink[];
    totalWeight: number;
  }

  const queue: PathNode[] = [{ entityId: params.entity_id, path: [], totalWeight: 1.0 }];
  const visited = new Set<EntityId>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.path.length >= maxDepth) {
      chains.push({
        path: current.path,
        terminal_entity: current.entityId,
        total_weight: current.totalWeight,
        fidelity: 'EXACT',
      });
      continue;
    }

    if (visited.has(current.entityId)) continue;
    visited.add(current.entityId);

    const edges = params.direction === 'upstream'
      ? graph.getOutgoingEdges(current.entityId, 'uses')
      : graph.getIncomingEdges(current.entityId, 'uses');

    if (edges.length === 0) {
      if (current.path.length > 0) {
        chains.push({
          path: current.path,
          terminal_entity: current.entityId,
          total_weight: current.totalWeight,
          fidelity: 'EXACT',
        });
      }
      continue;
    }

    const weightPerEdge = 1.0 / edges.length;

    for (const edge of edges) {
      const targetId = params.direction === 'upstream' ? edge.to : edge.from;
      const link: AttributionLink = {
        from_entity: params.direction === 'upstream' ? current.entityId : targetId,
        to_entity: params.direction === 'upstream' ? targetId : current.entityId,
        edge_type: edge.type,
        weight: weightPerEdge,
        contribution: { value: 0, unit: '', fidelity: 'EXACT' },
      };

      queue.push({
        entityId: targetId,
        path: [...current.path, link],
        totalWeight: current.totalWeight * weightPerEdge,
      });
    }
  }

  return {
    root_entity: params.entity_id,
    chains,
    total_weight: chains.reduce((sum, c) => sum + c.total_weight, 0),
    fidelity: 'EXACT',
  };
}

// =============================================================================
// Performance Panel
// =============================================================================

/**
 * Create the performance panel
 */
export function createPerfPanel(client: LensClient): Panel {
  let container: HTMLElement | null = null;
  let currentParams: HotspotQueryParams = {
    sort_by: 'triangle_count',
    limit: 20,
  };

  const render = () => {
    if (!container) return;

    const graph = client.getGraph();
    if (!graph) {
      container.innerHTML = renderNoGraphState();
      return;
    }

    const result = queryTopHotspots(graph, currentParams);
    container.innerHTML = renderPerfPanel(result, currentParams, (newParams) => {
      currentParams = { ...currentParams, ...newParams };
      render();
    });
  };

  return {
    id: 'performance',
    name: 'Performance',

    render(target: HTMLElement, lensClient: LensClient) {
      container = target;
      render();
    },

    onSelectionChange(selection) {
      // Could filter to selected context
      if (selection.context_id !== 'all') {
        currentParams.context_id = selection.context_id;
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
    <div class="perf-empty">
      <div class="perf-empty-icon">⏱️</div>
      <div class="perf-empty-title">No Data Available</div>
      <div class="perf-empty-hint">
        Attach to a scene to view performance metrics.
      </div>
    </div>
  `;
}

/**
 * Render the performance panel content
 */
function renderPerfPanel(
  result: HotspotQueryResult,
  params: HotspotQueryParams,
  onParamsChange: (params: Partial<HotspotQueryParams>) => void
): string {
  const metricOptions: HotspotQueryParams['sort_by'][] = [
    'gpu_time',
    'cpu_time',
    'draw_count',
    'triangle_count',
  ];

  const metricLabels: Record<HotspotQueryParams['sort_by'], string> = {
    gpu_time: 'GPU Time',
    cpu_time: 'CPU Time',
    draw_count: 'Draw Calls',
    triangle_count: 'Triangles',
  };

  return `
    <div class="perf-panel">
      <!-- Header with controls -->
      <div class="perf-header">
        <div class="perf-title">
          Performance Hotspots
          <span class="perf-fidelity-badge" style="background: ${getFidelityColor(result.fidelity)}">
            ${result.fidelity}
          </span>
        </div>
        <div class="perf-controls">
          <select class="perf-metric-select" data-action="sort_by">
            ${metricOptions.map((opt) => `
              <option value="${opt}" ${opt === params.sort_by ? 'selected' : ''}>
                ${metricLabels[opt]}
              </option>
            `).join('')}
          </select>
          <select class="perf-fidelity-filter" data-action="min_fidelity">
            <option value="">All Fidelity</option>
            <option value="ESTIMATED" ${params.min_fidelity === 'ESTIMATED' ? 'selected' : ''}>ESTIMATED+</option>
            <option value="EXACT" ${params.min_fidelity === 'EXACT' ? 'selected' : ''}>EXACT only</option>
          </select>
        </div>
      </div>

      <!-- Summary -->
      <div class="perf-summary">
        <div class="perf-summary-item">
          <span class="summary-label">Total:</span>
          <span class="summary-value">${formatMetricValue(result.total_metric)}</span>
        </div>
        <div class="perf-summary-item">
          <span class="summary-label">Frames:</span>
          <span class="summary-value">${result.time_range.start_frame} - ${result.time_range.end_frame}</span>
        </div>
        <div class="perf-summary-item">
          <span class="summary-label">Entities:</span>
          <span class="summary-value">${result.metadata.total_count}</span>
        </div>
      </div>

      <!-- Hotspot list -->
      <div class="perf-hotspots">
        ${result.hotspots.length === 0
          ? '<div class="perf-no-hotspots">No hotspots found</div>'
          : result.hotspots.map((hotspot, index) => renderHotspot(hotspot, index)).join('')
        }
      </div>

      ${result.metadata.truncated
        ? `<div class="perf-truncated">Showing ${result.hotspots.length} of ${result.metadata.total_count} results</div>`
        : ''
      }
    </div>
  `;
}

/**
 * Render a single hotspot row
 */
function renderHotspot(hotspot: Hotspot, index: number): string {
  const barWidth = Math.min(hotspot.percentage, 100);

  return `
    <div class="perf-hotspot" data-entity-id="${hotspot.entity_id}">
      <div class="hotspot-rank">#${index + 1}</div>
      <div class="hotspot-main">
        <div class="hotspot-header">
          <span class="hotspot-name">${hotspot.entity_name}</span>
          <span class="hotspot-type">${hotspot.entity_type}</span>
          <span class="hotspot-fidelity" style="background: ${getFidelityColor(hotspot.metric.fidelity)}" title="${hotspot.metric.reason ?? ''}">
            ${hotspot.metric.fidelity}
          </span>
        </div>
        <div class="hotspot-bar-container">
          <div class="hotspot-bar" style="width: ${barWidth}%"></div>
          <span class="hotspot-percentage">${hotspot.percentage.toFixed(1)}%</span>
        </div>
        <div class="hotspot-value">
          ${formatMetricValue(hotspot.metric)}
        </div>
        ${hotspot.attribution_chain.length > 0
          ? renderAttributionChain(hotspot.attribution_chain)
          : ''
        }
      </div>
    </div>
  `;
}

/**
 * Render attribution chain
 */
function renderAttributionChain(chain: AttributionLink[]): string {
  if (chain.length === 0) return '';

  return `
    <div class="hotspot-attribution">
      <div class="attribution-label">Blame chain:</div>
      <div class="attribution-chain">
        ${chain.map((link) => `
          <span class="attribution-link">
            <span class="link-edge">${link.edge_type}</span>
            <span class="link-arrow">→</span>
            <span class="link-target">${link.to_entity.split(':').pop()}</span>
            <span class="link-weight">(${(link.weight * 100).toFixed(0)}%)</span>
          </span>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Format a metric value for display
 */
function formatMetricValue(metric: MetricValue): string {
  const { value, unit } = metric;

  if (unit === 'ms') {
    if (value < 0.001) return `${(value * 1000000).toFixed(2)} ns`;
    if (value < 1) return `${(value * 1000).toFixed(2)} μs`;
    return `${value.toFixed(2)} ms`;
  }

  if (unit === 'triangles' || unit === 'calls') {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M ${unit}`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K ${unit}`;
    return `${Math.round(value)} ${unit}`;
  }

  return `${value.toLocaleString()} ${unit}`;
}

// =============================================================================
// Addon Definition
// =============================================================================

/**
 * Performance addon for frame timing and attribution analysis
 */
export const perfAddon: Addon = {
  // Identity
  id: 'com.3lens.addon-perf',
  version: '1.0.0',
  displayName: 'Performance',
  description: 'Performance analysis with frame timing, hotspot detection, and cost attribution',

  // Compatibility
  requires: {
    kernel: '^1.0.0',
    trace: '^1.0.0',
  } satisfies AddonRequirements,

  // Capabilities
  capabilities: {
    required: ['capture.renderEvents'],
    optional: ['timing.gpu', 'timing.cpu'],
  } satisfies AddonCapabilities,

  // Lifecycle
  register(lens: Lens) {
    console.log('[3Lens] Performance addon registered');

    // Register queries
    registerPerfQueries(lens);

    // Register panel (when UI core is ready)
    // lens.registerPanel?.(createPerfPanel(lens.getClient()));
  },

  unregister(lens: Lens) {
    console.log('[3Lens] Performance addon unregistered');
  },
};

/**
 * Register performance-specific queries
 */
function registerPerfQueries(lens: Lens) {
  // Queries will be registered once query system is fully wired
  // For now, the exported functions can be used directly
}

// Export query functions
export {
  queryTopHotspots,
  computeAttribution,
  buildAttributionChain,
  createPerfPanel,
};

export default perfAddon;
