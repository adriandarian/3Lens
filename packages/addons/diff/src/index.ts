/**
 * @3lens/addon-diff
 *
 * Frame/session comparison addon for 3Lens.
 * Provides diff functions for comparing entity graph states between frames and traces.
 *
 * @packageDocumentation
 */

import type { Addon, Lens, LensClient, Selection } from '@3lens/runtime';
import type {
  EntityId,
  Node,
  Edge,
  EntityGraph,
  GraphSnapshot,
  NodeType,
  EdgeType,
  Fidelity,
} from '@3lens/kernel';
import type { Trace, TraceSnapshot } from '@3lens/kernel';
import type { Panel } from '@3lens/ui-core';

// =============================================================================
// Types
// =============================================================================

/**
 * Fidelity info for diff results
 */
export interface DiffFidelityInfo {
  level: Fidelity;
  reason?: string;
  source?: string;
  proxies_used?: string[];
}

/**
 * Entity change type
 */
export type ChangeType = 'added' | 'removed' | 'changed';

/**
 * Property change details
 */
export interface PropertyChange {
  /** Property key */
  key: string;
  /** Old value (undefined if added) */
  oldValue?: unknown;
  /** New value (undefined if removed) */
  newValue?: unknown;
  /** Change type */
  type: 'added' | 'removed' | 'changed';
}

/**
 * Entity diff result
 */
export interface EntityDiff {
  /** Entity ID */
  entityId: EntityId;
  /** Entity type */
  entityType: NodeType;
  /** Entity name (if available) */
  entityName?: string;
  /** Change type */
  changeType: ChangeType;
  /** Property changes (for 'changed' type) */
  propertyChanges?: PropertyChange[];
  /** Full before state (for 'removed' and 'changed') */
  before?: Node;
  /** Full after state (for 'added' and 'changed') */
  after?: Node;
}

/**
 * Edge diff result
 */
export interface EdgeDiff {
  /** Source entity ID */
  from: EntityId;
  /** Target entity ID */
  to: EntityId;
  /** Edge type */
  edgeType: EdgeType;
  /** Change type */
  changeType: ChangeType;
  /** Before state */
  before?: Edge;
  /** After state */
  after?: Edge;
}

/**
 * Frame diff result
 */
export interface FrameDiffResult {
  /** Baseline frame number */
  baselineFrame: number;
  /** Current frame number */
  currentFrame: number;
  /** Entity diffs */
  entities: EntityDiff[];
  /** Edge diffs */
  edges: EdgeDiff[];
  /** Summary statistics */
  summary: DiffSummary;
  /** Data fidelity */
  fidelity: DiffFidelityInfo;
}

/**
 * Trace diff result
 */
export interface TraceDiffResult {
  /** Baseline trace session ID */
  baselineSessionId: string;
  /** Current trace session ID */
  currentSessionId: string;
  /** Entity diffs */
  entities: EntityDiff[];
  /** Edge diffs */
  edges: EdgeDiff[];
  /** Summary statistics */
  summary: DiffSummary;
  /** Data fidelity */
  fidelity: DiffFidelityInfo;
}

/**
 * Diff summary statistics
 */
export interface DiffSummary {
  /** Total entities added */
  entitiesAdded: number;
  /** Total entities removed */
  entitiesRemoved: number;
  /** Total entities changed */
  entitiesChanged: number;
  /** Breakdown by entity type */
  byType: Record<NodeType, { added: number; removed: number; changed: number }>;
  /** Total edges added */
  edgesAdded: number;
  /** Total edges removed */
  edgesRemoved: number;
  /** Total property changes */
  propertyChanges: number;
}

/**
 * Diff options
 */
export interface DiffOptions {
  /** Filter by entity types */
  entityTypes?: NodeType[];
  /** Filter by context ID */
  contextId?: string;
  /** Ignore specific properties */
  ignoreProperties?: string[];
  /** Only include active entities */
  activeOnly?: boolean;
  /** Maximum entities to include in result */
  limit?: number;
}

// =============================================================================
// Diff Functions
// =============================================================================

/**
 * Properties to ignore in diff by default (timestamps, etc.)
 */
const DEFAULT_IGNORE_PROPERTIES = ['created_at', 'modified_at'];

/**
 * Compare two graph snapshots and return entity differences
 */
export function diffSnapshots(
  baseline: GraphSnapshot,
  current: GraphSnapshot,
  options: DiffOptions = {}
): { entities: EntityDiff[]; edges: EdgeDiff[]; fidelity: DiffFidelityInfo } {
  const ignoreProps = new Set([
    ...DEFAULT_IGNORE_PROPERTIES,
    ...(options.ignoreProperties ?? []),
  ]);

  // Build maps for efficient lookup
  const baselineNodes = new Map<EntityId, Node>();
  const currentNodes = new Map<EntityId, Node>();

  for (const node of baseline.nodes) {
    if (options.entityTypes && !options.entityTypes.includes(node.type)) continue;
    if (options.contextId && node.context_id !== options.contextId) continue;
    if (options.activeOnly && !node.active) continue;
    baselineNodes.set(node.id, node);
  }

  for (const node of current.nodes) {
    if (options.entityTypes && !options.entityTypes.includes(node.type)) continue;
    if (options.contextId && node.context_id !== options.contextId) continue;
    if (options.activeOnly && !node.active) continue;
    currentNodes.set(node.id, node);
  }

  const entityDiffs: EntityDiff[] = [];

  // Find added entities
  for (const [id, node] of currentNodes) {
    if (!baselineNodes.has(id)) {
      entityDiffs.push({
        entityId: id,
        entityType: node.type,
        entityName: node.name,
        changeType: 'added',
        after: node,
      });
    }
  }

  // Find removed entities
  for (const [id, node] of baselineNodes) {
    if (!currentNodes.has(id)) {
      entityDiffs.push({
        entityId: id,
        entityType: node.type,
        entityName: node.name,
        changeType: 'removed',
        before: node,
      });
    }
  }

  // Find changed entities
  for (const [id, currentNode] of currentNodes) {
    const baselineNode = baselineNodes.get(id);
    if (!baselineNode) continue;

    const propertyChanges = diffNodeProperties(baselineNode, currentNode, ignoreProps);
    if (propertyChanges.length > 0) {
      entityDiffs.push({
        entityId: id,
        entityType: currentNode.type,
        entityName: currentNode.name ?? baselineNode.name,
        changeType: 'changed',
        propertyChanges,
        before: baselineNode,
        after: currentNode,
      });
    }
  }

  // Diff edges
  const baselineEdges = new Map<string, Edge>();
  const currentEdges = new Map<string, Edge>();

  const edgeKey = (e: Edge) => `${e.from}|${e.to}|${e.type}`;

  for (const edge of baseline.edges) {
    baselineEdges.set(edgeKey(edge), edge);
  }

  for (const edge of current.edges) {
    currentEdges.set(edgeKey(edge), edge);
  }

  const edgeDiffs: EdgeDiff[] = [];

  // Added edges
  for (const [key, edge] of currentEdges) {
    if (!baselineEdges.has(key)) {
      edgeDiffs.push({
        from: edge.from,
        to: edge.to,
        edgeType: edge.type,
        changeType: 'added',
        after: edge,
      });
    }
  }

  // Removed edges
  for (const [key, edge] of baselineEdges) {
    if (!currentEdges.has(key)) {
      edgeDiffs.push({
        from: edge.from,
        to: edge.to,
        edgeType: edge.type,
        changeType: 'removed',
        before: edge,
      });
    }
  }

  // Apply limit if specified
  let resultEntities = entityDiffs;
  if (options.limit && entityDiffs.length > options.limit) {
    resultEntities = entityDiffs.slice(0, options.limit);
  }

  return {
    entities: resultEntities,
    edges: edgeDiffs,
    fidelity: {
      level: 'EXACT',
      source: 'snapshot_comparison',
    },
  };
}

/**
 * Compare two nodes and return property changes
 */
function diffNodeProperties(
  baseline: Node,
  current: Node,
  ignoreProps: Set<string>
): PropertyChange[] {
  const changes: PropertyChange[] = [];
  const allKeys = new Set([...Object.keys(baseline), ...Object.keys(current)]);

  for (const key of allKeys) {
    if (ignoreProps.has(key)) continue;

    const oldValue = (baseline as Record<string, unknown>)[key];
    const newValue = (current as Record<string, unknown>)[key];

    if (!(key in baseline)) {
      changes.push({ key, newValue, type: 'added' });
    } else if (!(key in current)) {
      changes.push({ key, oldValue, type: 'removed' });
    } else if (!deepEqual(oldValue, newValue)) {
      changes.push({ key, oldValue, newValue, type: 'changed' });
    }
  }

  return changes;
}

/**
 * Deep equality check for property values
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) =>
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    );
  }

  return false;
}

/**
 * Compute diff summary from entity and edge diffs
 */
function computeSummary(entities: EntityDiff[], edges: EdgeDiff[]): DiffSummary {
  const summary: DiffSummary = {
    entitiesAdded: 0,
    entitiesRemoved: 0,
    entitiesChanged: 0,
    byType: {} as Record<NodeType, { added: number; removed: number; changed: number }>,
    edgesAdded: 0,
    edgesRemoved: 0,
    propertyChanges: 0,
  };

  for (const diff of entities) {
    if (!summary.byType[diff.entityType]) {
      summary.byType[diff.entityType] = { added: 0, removed: 0, changed: 0 };
    }

    switch (diff.changeType) {
      case 'added':
        summary.entitiesAdded++;
        summary.byType[diff.entityType].added++;
        break;
      case 'removed':
        summary.entitiesRemoved++;
        summary.byType[diff.entityType].removed++;
        break;
      case 'changed':
        summary.entitiesChanged++;
        summary.byType[diff.entityType].changed++;
        summary.propertyChanges += diff.propertyChanges?.length ?? 0;
        break;
    }
  }

  for (const diff of edges) {
    if (diff.changeType === 'added') summary.edgesAdded++;
    if (diff.changeType === 'removed') summary.edgesRemoved++;
  }

  return summary;
}

/**
 * Compare entity graph state between two frames
 *
 * @param graph - Current entity graph
 * @param baselineSnapshot - Snapshot at baseline frame
 * @param currentSnapshot - Snapshot at current frame
 * @param options - Diff options
 * @returns Frame diff result with added/removed/changed entities
 */
export function diffFrames(
  baselineSnapshot: GraphSnapshot,
  currentSnapshot: GraphSnapshot,
  baselineFrame: number,
  currentFrame: number,
  options: DiffOptions = {}
): FrameDiffResult {
  const { entities, edges, fidelity } = diffSnapshots(
    baselineSnapshot,
    currentSnapshot,
    options
  );

  return {
    baselineFrame,
    currentFrame,
    entities,
    edges,
    summary: computeSummary(entities, edges),
    fidelity,
  };
}

/**
 * Compare two traces
 *
 * @param baselineTrace - Baseline trace
 * @param currentTrace - Current trace
 * @param options - Diff options
 * @returns Trace diff result with added/removed/changed entities
 */
export function diffTraces(
  baselineTrace: Trace,
  currentTrace: Trace,
  options: DiffOptions = {}
): TraceDiffResult {
  // Get the latest snapshot from each trace
  const baselineSnapshot =
    baselineTrace.snapshots.length > 0
      ? baselineTrace.snapshots[baselineTrace.snapshots.length - 1].graph
      : { version: '1.0.0', timestamp: 0, nodes: [], edges: [], context_ids: [] };

  const currentSnapshot =
    currentTrace.snapshots.length > 0
      ? currentTrace.snapshots[currentTrace.snapshots.length - 1].graph
      : { version: '1.0.0', timestamp: 0, nodes: [], edges: [], context_ids: [] };

  const { entities, edges, fidelity } = diffSnapshots(
    baselineSnapshot,
    currentSnapshot,
    options
  );

  // Adjust fidelity if traces are from different environments
  let adjustedFidelity = fidelity;
  if (
    baselineTrace.header.environment.backend !==
    currentTrace.header.environment.backend
  ) {
    adjustedFidelity = {
      level: 'ESTIMATED',
      reason: 'Traces from different backends may have different entity representations',
      source: 'trace_comparison',
    };
  }

  return {
    baselineSessionId: baselineTrace.header.session_id,
    currentSessionId: currentTrace.header.session_id,
    entities,
    edges,
    summary: computeSummary(entities, edges),
    fidelity: adjustedFidelity,
  };
}

/**
 * Find entities that changed in a specific frame range
 */
export function findChangesInRange(
  snapshots: TraceSnapshot[],
  startFrame: number,
  endFrame: number,
  options: DiffOptions = {}
): EntityDiff[] {
  const startSnapshot = snapshots.find((s) => s.frame >= startFrame);
  const endSnapshot = snapshots.find((s) => s.frame >= endFrame) ?? snapshots[snapshots.length - 1];

  if (!startSnapshot || !endSnapshot) {
    return [];
  }

  const { entities } = diffSnapshots(startSnapshot.graph, endSnapshot.graph, options);
  return entities;
}

// =============================================================================
// Diff Panel
// =============================================================================

/**
 * Comparison mode for the diff panel
 */
export type ComparisonMode = 'baseline_current' | 'frame_to_frame' | 'trace_to_trace';

/**
 * Diff panel state
 */
export interface DiffPanelState {
  /** Comparison mode */
  mode: ComparisonMode;
  /** Baseline data (snapshot or trace) */
  baseline: GraphSnapshot | Trace | null;
  /** Baseline frame number (for frame mode) */
  baselineFrame?: number;
  /** Current diff result */
  result: FrameDiffResult | TraceDiffResult | null;
  /** Filter options */
  filter: DiffOptions;
  /** Selected entity for detail view */
  selectedEntity: EntityId | null;
  /** Whether to highlight changes in scene */
  highlightChanges: boolean;
}

/**
 * Create the diff panel
 */
export function createDiffPanel(client: LensClient): Panel {
  let container: HTMLElement | null = null;
  let state: DiffPanelState = {
    mode: 'baseline_current',
    baseline: null,
    result: null,
    filter: {},
    selectedEntity: null,
    highlightChanges: true,
  };

  /**
   * Capture current state as baseline
   */
  function captureBaseline(): void {
    const graph = client.getGraph();
    if (graph) {
      state.baseline = graph.snapshot();
      state.baselineFrame = getCurrentFrame(client);
      state.result = null;
      render();
    }
  }

  /**
   * Compute diff against baseline
   */
  function computeDiff(): void {
    if (!state.baseline) return;

    const graph = client.getGraph();
    if (!graph) return;

    const currentSnapshot = graph.snapshot();
    const currentFrame = getCurrentFrame(client);

    if ('version' in state.baseline && 'nodes' in state.baseline) {
      // Baseline is a GraphSnapshot
      state.result = diffFrames(
        state.baseline as GraphSnapshot,
        currentSnapshot,
        state.baselineFrame ?? 0,
        currentFrame,
        state.filter
      );
    }

    render();
  }

  /**
   * Get current frame number
   */
  function getCurrentFrame(client: LensClient): number {
    // TODO: Implement proper frame number retrieval
    return 0;
  }

  /**
   * Render the panel
   */
  function render(): void {
    if (!container) return;

    container.innerHTML = `
      <div class="diff-panel">
        <div class="diff-panel-header">
          <h3>Diff</h3>
          <div class="diff-panel-controls">
            <select class="diff-mode-select">
              <option value="baseline_current" ${state.mode === 'baseline_current' ? 'selected' : ''}>Baseline vs Current</option>
              <option value="frame_to_frame" ${state.mode === 'frame_to_frame' ? 'selected' : ''}>Frame to Frame</option>
              <option value="trace_to_trace" ${state.mode === 'trace_to_trace' ? 'selected' : ''}>Trace to Trace</option>
            </select>
            <button class="diff-capture-btn" title="Capture current state as baseline">
              Capture Baseline
            </button>
            <button class="diff-compute-btn" title="Compute diff against baseline" ${!state.baseline ? 'disabled' : ''}>
              Compute Diff
            </button>
          </div>
        </div>

        ${renderBaselineInfo()}
        ${renderDiffResult()}
        ${renderEntityDetail()}
      </div>
    `;

    // Attach event listeners
    attachEventListeners();
  }

  /**
   * Render baseline info
   */
  function renderBaselineInfo(): string {
    if (!state.baseline) {
      return `
        <div class="diff-baseline-empty">
          <p>No baseline captured. Click "Capture Baseline" to start.</p>
        </div>
      `;
    }

    const nodeCount = 'nodes' in state.baseline ? state.baseline.nodes.length : 0;
    return `
      <div class="diff-baseline-info">
        <span class="baseline-label">Baseline:</span>
        <span class="baseline-frame">Frame ${state.baselineFrame ?? '?'}</span>
        <span class="baseline-nodes">${nodeCount} entities</span>
      </div>
    `;
  }

  /**
   * Render diff result
   */
  function renderDiffResult(): string {
    if (!state.result) {
      return `<div class="diff-result-empty">No diff computed yet.</div>`;
    }

    const { summary, fidelity } = state.result;

    return `
      <div class="diff-result">
        <div class="diff-summary">
          <div class="diff-summary-item added">
            <span class="count">${summary.entitiesAdded}</span>
            <span class="label">Added</span>
          </div>
          <div class="diff-summary-item removed">
            <span class="count">${summary.entitiesRemoved}</span>
            <span class="label">Removed</span>
          </div>
          <div class="diff-summary-item changed">
            <span class="count">${summary.entitiesChanged}</span>
            <span class="label">Changed</span>
          </div>
          ${renderFidelityBadge(fidelity)}
        </div>

        <div class="diff-entity-list">
          ${renderEntityList(state.result.entities)}
        </div>
      </div>
    `;
  }

  /**
   * Render entity list
   */
  function renderEntityList(entities: EntityDiff[]): string {
    if (entities.length === 0) {
      return '<div class="diff-no-changes">No changes detected</div>';
    }

    return entities
      .map(
        (diff) => `
      <div 
        class="diff-entity-item ${diff.changeType} ${state.selectedEntity === diff.entityId ? 'selected' : ''}"
        data-entity-id="${diff.entityId}"
      >
        <span class="diff-change-badge ${diff.changeType}">${diff.changeType.charAt(0).toUpperCase()}</span>
        <span class="diff-entity-type">${diff.entityType}</span>
        <span class="diff-entity-name">${diff.entityName ?? diff.entityId}</span>
        ${diff.changeType === 'changed' ? `<span class="diff-prop-count">${diff.propertyChanges?.length ?? 0} props</span>` : ''}
      </div>
    `
      )
      .join('');
  }

  /**
   * Render entity detail view
   */
  function renderEntityDetail(): string {
    if (!state.selectedEntity || !state.result) {
      return '';
    }

    const diff = state.result.entities.find((e) => e.entityId === state.selectedEntity);
    if (!diff) return '';

    return `
      <div class="diff-entity-detail">
        <h4>${diff.entityName ?? diff.entityId}</h4>
        <div class="diff-entity-type-badge">${diff.entityType}</div>
        
        ${diff.changeType === 'changed' ? renderPropertyChanges(diff.propertyChanges ?? []) : ''}
        ${diff.changeType === 'added' ? renderNodeState('Added', diff.after) : ''}
        ${diff.changeType === 'removed' ? renderNodeState('Removed', diff.before) : ''}
      </div>
    `;
  }

  /**
   * Render property changes
   */
  function renderPropertyChanges(changes: PropertyChange[]): string {
    return `
      <div class="diff-property-changes">
        <h5>Property Changes</h5>
        ${changes
          .map(
            (change) => `
          <div class="diff-property-change ${change.type}">
            <span class="prop-key">${change.key}</span>
            ${change.type === 'changed' ? `
              <span class="prop-old">${formatValue(change.oldValue)}</span>
              <span class="prop-arrow">→</span>
              <span class="prop-new">${formatValue(change.newValue)}</span>
            ` : ''}
            ${change.type === 'added' ? `<span class="prop-new">${formatValue(change.newValue)}</span>` : ''}
            ${change.type === 'removed' ? `<span class="prop-old">${formatValue(change.oldValue)}</span>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  /**
   * Render node state
   */
  function renderNodeState(label: string, node?: Node): string {
    if (!node) return '';

    return `
      <div class="diff-node-state">
        <h5>${label} State</h5>
        <pre class="node-json">${JSON.stringify(node, null, 2)}</pre>
      </div>
    `;
  }

  /**
   * Render fidelity badge
   */
  function renderFidelityBadge(fidelity: DiffFidelityInfo): string {
    const colors: Record<Fidelity, string> = {
      EXACT: '#4caf50',
      ESTIMATED: '#ff9800',
      UNAVAILABLE: '#9e9e9e',
    };

    return `
      <div class="fidelity-badge" style="background: ${colors[fidelity.level]}" title="${fidelity.reason ?? ''}">
        ${fidelity.level}
      </div>
    `;
  }

  /**
   * Format value for display
   */
  function formatValue(value: unknown): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'string') return value.length > 30 ? value.slice(0, 30) + '...' : value;
    if (Array.isArray(value)) return `[${value.length}]`;
    if (typeof value === 'object') return '{...}';
    return String(value);
  }

  /**
   * Attach event listeners
   */
  function attachEventListeners(): void {
    if (!container) return;

    // Mode select
    const modeSelect = container.querySelector('.diff-mode-select');
    modeSelect?.addEventListener('change', (e) => {
      state.mode = (e.target as HTMLSelectElement).value as ComparisonMode;
      render();
    });

    // Capture baseline button
    const captureBtn = container.querySelector('.diff-capture-btn');
    captureBtn?.addEventListener('click', captureBaseline);

    // Compute diff button
    const computeBtn = container.querySelector('.diff-compute-btn');
    computeBtn?.addEventListener('click', computeDiff);

    // Entity item clicks
    const entityItems = container.querySelectorAll('.diff-entity-item');
    entityItems.forEach((item) => {
      item.addEventListener('click', () => {
        const entityId = item.getAttribute('data-entity-id');
        state.selectedEntity = entityId;
        render();
      });
    });
  }

  return {
    id: 'diff',
    name: 'Diff',

    render(target: HTMLElement, lensClient: LensClient) {
      container = target;
      render();
    },

    onSelectionChange(selection: Selection) {
      if (selection.entity_ids.length === 1) {
        state.selectedEntity = selection.entity_ids[0];
        render();
      }
    },

    dispose() {
      container = null;
      state.baseline = null;
      state.result = null;
    },
  };
}

// =============================================================================
// Addon Definition
// =============================================================================

/**
 * Register diff-specific queries
 */
function registerDiffQueries(lens: Lens): void {
  // Queries will be registered once the query system is fully wired
  console.log('[addon-diff] Registering diff queries');
}

/**
 * Diff addon for comparing frames and sessions
 */
export const diffAddon: Addon = {
  // Identity
  id: 'com.3lens.addon-diff',
  version: '1.0.0',
  displayName: 'Diff',
  description: 'Frame and session comparison for tracking scene changes over time',

  // Compatibility
  requires: {
    kernel: '>=1.0.0',
    trace: '>=1.0.0',
  },

  // Capabilities
  capabilities: {
    required: ['capture.snapshots'],
    optional: ['storage.traces', 'ui.panels'],
  },

  // Lifecycle
  register(lens: Lens) {
    console.log('[addon-diff] Addon registered');
    registerDiffQueries(lens);
  },

  unregister(lens: Lens) {
    console.log('[addon-diff] Addon unregistered');
  },
};

export default diffAddon;

// =============================================================================
// Re-exports
// =============================================================================

export { type Fidelity } from '@3lens/kernel';
