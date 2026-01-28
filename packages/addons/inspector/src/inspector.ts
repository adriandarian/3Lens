/**
 * Inspector Core
 *
 * Entity inspection and navigation.
 *
 * @packageDocumentation
 */

import type { EntityId, Node, Edge, EntityGraph, Fidelity } from '@3lens/kernel';

/**
 * Inspector selection
 */
export interface InspectorSelection {
  /** Selected entity IDs */
  entity_ids: EntityId[];
  /** Context ID (or 'all') */
  context_id: string;
  /** Selection source */
  source: SelectionSource;
  /** Selection timestamp */
  timestamp: number;
}

export type SelectionSource =
  | 'user_click'
  | 'query_result'
  | 'hotspot_navigation'
  | 'diff_highlight'
  | 'timeline_event'
  | 'external';

/**
 * Entity info for display
 */
export interface EntityInfo {
  /** Entity ID */
  id: EntityId;
  /** Entity type */
  type: string;
  /** Display name */
  name: string;
  /** Context ID */
  context_id: string;
  /** Whether active */
  active: boolean;
  /** Origin */
  origin: 'created' | 'preexisting';
  /** Properties */
  properties: Record<string, unknown>;
}

/**
 * Relationship info
 */
export interface RelationshipInfo {
  /** Incoming edges (what depends on this) */
  incoming: EdgeInfo[];
  /** Outgoing edges (what this depends on) */
  outgoing: EdgeInfo[];
  /** Usage summary */
  usage_summary: UsageSummary;
}

/**
 * Edge info for display
 */
export interface EdgeInfo {
  /** Edge type */
  type: string;
  /** Other entity ID */
  entity_id: EntityId;
  /** Other entity type */
  entity_type: string;
  /** Other entity name */
  entity_name?: string;
  /** Active status */
  active: boolean;
}

/**
 * Usage summary
 */
export interface UsageSummary {
  /** Total incoming */
  incoming_count: number;
  /** Total outgoing */
  outgoing_count: number;
  /** Breakdown by type */
  by_type: Record<string, number>;
}

/**
 * Cost info for an entity
 */
export interface CostInfo {
  /** GPU time (if available) */
  gpu_time?: MetricValue;
  /** CPU time (if available) */
  cpu_time?: MetricValue;
  /** Memory footprint */
  memory_bytes?: MetricValue;
  /** Draw call count */
  draw_calls?: MetricValue;
  /** Triangle count */
  triangles?: MetricValue;
  /** Variant count (for shaders/materials) */
  variant_count?: MetricValue;
  /** Attribution chain */
  attribution_chain?: AttributionLink[];
}

/**
 * Metric value with fidelity
 */
export interface MetricValue {
  /** Value */
  value: number;
  /** Unit */
  unit: string;
  /** Fidelity */
  fidelity: Fidelity;
  /** Fidelity reason (if not EXACT) */
  reason?: string;
}

/**
 * Attribution link in blame chain
 */
export interface AttributionLink {
  /** From entity */
  from_entity: EntityId;
  /** To entity */
  to_entity: EntityId;
  /** Edge type */
  edge_type: string;
  /** Weight (0-1) */
  weight: number;
}

/**
 * Change info for an entity
 */
export interface ChangeInfo {
  /** Recent changes */
  recent_changes: ChangeEvent[];
  /** Frame of last change */
  last_change_frame?: number;
  /** Diff summary */
  diff_summary?: DiffSummary;
}

/**
 * Change event
 */
export interface ChangeEvent {
  /** Change type */
  type: 'created' | 'updated' | 'removed';
  /** Frame number */
  frame: number;
  /** Timestamp */
  timestamp: number;
  /** What changed */
  changes?: string[];
}

/**
 * Diff summary
 */
export interface DiffSummary {
  /** Added properties */
  added: string[];
  /** Removed properties */
  removed: string[];
  /** Changed properties */
  changed: string[];
}

/**
 * Action info for an entity
 */
export interface ActionInfo {
  /** Available actions */
  actions: EntityAction[];
}

/**
 * Entity action
 */
export interface EntityAction {
  /** Action ID */
  id: string;
  /** Action name */
  name: string;
  /** Action description */
  description: string;
  /** Action category */
  category: 'navigate' | 'highlight' | 'optimize' | 'debug';
  /** Whether action is available */
  available: boolean;
  /** Execute the action */
  execute: () => void;
}

/**
 * Get entity info from graph
 */
export function getEntityInfo(graph: EntityGraph, entityId: EntityId): EntityInfo | undefined {
  const node = graph.getNode(entityId);
  if (!node) return undefined;

  return {
    id: node.id,
    type: node.type,
    name: node.name ?? node.id,
    context_id: node.context_id,
    active: node.active,
    origin: node.origin,
    properties: extractProperties(node),
  };
}

/**
 * Get relationship info from graph
 */
export function getRelationshipInfo(graph: EntityGraph, entityId: EntityId): RelationshipInfo {
  const incoming = graph.getIncomingEdges(entityId);
  const outgoing = graph.getOutgoingEdges(entityId);

  const byType: Record<string, number> = {};

  const incomingInfo = incoming.map((edge) => {
    byType[edge.type] = (byType[edge.type] || 0) + 1;
    const node = graph.getNode(edge.from);
    return {
      type: edge.type,
      entity_id: edge.from,
      entity_type: node?.type ?? 'unknown',
      entity_name: node?.name,
      active: edge.active,
    };
  });

  const outgoingInfo = outgoing.map((edge) => {
    byType[edge.type] = (byType[edge.type] || 0) + 1;
    const node = graph.getNode(edge.to);
    return {
      type: edge.type,
      entity_id: edge.to,
      entity_type: node?.type ?? 'unknown',
      entity_name: node?.name,
      active: edge.active,
    };
  });

  return {
    incoming: incomingInfo,
    outgoing: outgoingInfo,
    usage_summary: {
      incoming_count: incoming.length,
      outgoing_count: outgoing.length,
      by_type: byType,
    },
  };
}

/**
 * Extract display properties from a node
 */
function extractProperties(node: Node): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  // Copy non-system properties
  for (const [key, value] of Object.entries(node)) {
    if (!['id', 'type', 'context_id', 'created_at', 'modified_at', 'origin', 'active'].includes(key)) {
      props[key] = value;
    }
  }

  return props;
}
