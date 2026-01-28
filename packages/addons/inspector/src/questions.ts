/**
 * The 5 Questions
 *
 * Inspector answers these 5 questions for any selected entity.
 *
 * @packageDocumentation
 */

import type { EntityGraph, EntityId, Fidelity } from '@3lens/kernel';
import type {
  EntityInfo,
  RelationshipInfo,
  CostInfo,
  ChangeInfo,
  ActionInfo,
  MetricValue,
  AttributionLink,
  EntityAction,
} from './inspector';
import { getEntityInfo, getRelationshipInfo } from './inspector';

/**
 * Complete inspection result for an entity
 */
export interface InspectionResult {
  /** Q1: What is this? */
  identity: EntityInfo;
  /** Q2: Where is it used? */
  relationships: RelationshipInfo;
  /** Q3: What does it cost? */
  cost: CostInfo;
  /** Q4: How did it change? */
  changes: ChangeInfo;
  /** Q5: What can I do? */
  actions: ActionInfo;
  /** Data fidelity */
  fidelity: Fidelity;
}

/**
 * Inspector context for answering questions
 */
export interface InspectorContext {
  /** Entity graph */
  graph: EntityGraph;
  /** Get cost metrics for an entity */
  getCostMetrics?: (entityId: EntityId) => CostInfo;
  /** Get change history for an entity */
  getChangeHistory?: (entityId: EntityId) => ChangeInfo;
  /** Available action handlers */
  actionHandlers?: Record<string, (entityId: EntityId) => void>;
}

/**
 * Inspect an entity - answer all 5 questions
 */
export function inspectEntity(
  entityId: EntityId,
  context: InspectorContext
): InspectionResult | undefined {
  const { graph } = context;

  // Q1: What is this?
  const identity = getEntityInfo(graph, entityId);
  if (!identity) return undefined;

  // Q2: Where is it used?
  const relationships = getRelationshipInfo(graph, entityId);

  // Q3: What does it cost?
  const cost = context.getCostMetrics?.(entityId) ?? getDefaultCostInfo(graph, entityId);

  // Q4: How did it change?
  const changes = context.getChangeHistory?.(entityId) ?? getDefaultChangeInfo();

  // Q5: What can I do?
  const actions = getActionsForEntity(entityId, identity.type, context);

  // Determine overall fidelity
  const fidelity = calculateOverallFidelity(cost);

  return {
    identity,
    relationships,
    cost,
    changes,
    actions,
    fidelity,
  };
}

/**
 * Q1: What is this?
 * - Entity type
 * - Stable ID
 * - Origin (created by whom/where/when)
 * - Basic properties
 */
export function answerWhatIsThis(graph: EntityGraph, entityId: EntityId): EntityInfo | undefined {
  return getEntityInfo(graph, entityId);
}

/**
 * Q2: Where is it used?
 * - Incoming edges (what depends on this)
 * - Outgoing edges (what this depends on)
 * - Count + frequency
 */
export function answerWhereUsed(graph: EntityGraph, entityId: EntityId): RelationshipInfo {
  return getRelationshipInfo(graph, entityId);
}

/**
 * Q3: What does it cost?
 * - GPU time
 * - CPU overhead
 * - Memory footprint
 * - Variant count
 */
export function answerWhatCost(
  graph: EntityGraph,
  entityId: EntityId,
  getCostMetrics?: (id: EntityId) => CostInfo
): CostInfo {
  return getCostMetrics?.(entityId) ?? getDefaultCostInfo(graph, entityId);
}

/**
 * Q4: How did it change?
 * - Appeared/mutated/disappeared events
 * - Diff vs previous frame/session
 */
export function answerHowChanged(
  entityId: EntityId,
  getChangeHistory?: (id: EntityId) => ChangeInfo
): ChangeInfo {
  return getChangeHistory?.(entityId) ?? getDefaultChangeInfo();
}

/**
 * Q5: What can I do?
 * - Highlight in scene
 * - Jump to shader graph
 * - Jump to timeline spike
 * - Optimization hints
 */
export function answerWhatToDo(
  entityId: EntityId,
  entityType: string,
  context: InspectorContext
): ActionInfo {
  return getActionsForEntity(entityId, entityType, context);
}

/**
 * Get default cost info (when no metrics available)
 */
function getDefaultCostInfo(graph: EntityGraph, entityId: EntityId): CostInfo {
  const node = graph.getNode(entityId);
  const cost: CostInfo = {};

  // Try to extract memory from node if available
  if (node && 'memory_bytes' in node) {
    cost.memory_bytes = {
      value: (node as { memory_bytes: number }).memory_bytes,
      unit: 'bytes',
      fidelity: ('memory_fidelity' in node
        ? (node as { memory_fidelity: Fidelity }).memory_fidelity
        : 'ESTIMATED') as Fidelity,
    };
  }

  // Try to get variant count for materials
  if (node?.type === 'material' && 'variant_count' in node) {
    cost.variant_count = {
      value: (node as { variant_count: number }).variant_count,
      unit: 'variants',
      fidelity: 'EXACT',
    };
  }

  return cost;
}

/**
 * Get default change info
 */
function getDefaultChangeInfo(): ChangeInfo {
  return {
    recent_changes: [],
  };
}

/**
 * Get available actions for an entity
 */
function getActionsForEntity(
  entityId: EntityId,
  entityType: string,
  context: InspectorContext
): ActionInfo {
  const actions: EntityAction[] = [];

  // Universal actions
  actions.push({
    id: 'highlight',
    name: 'Highlight in Scene',
    description: 'Visually highlight this entity in the 3D scene',
    category: 'highlight',
    available: true,
    execute: () => context.actionHandlers?.highlight?.(entityId),
  });

  // Type-specific actions
  if (entityType === 'material' || entityType === 'shader') {
    actions.push({
      id: 'jump_to_shader',
      name: 'View in Shader Graph',
      description: 'Open this shader in the shader graph viewer',
      category: 'navigate',
      available: true,
      execute: () => context.actionHandlers?.jumpToShader?.(entityId),
    });
  }

  if (['geometry', 'texture', 'material'].includes(entityType)) {
    actions.push({
      id: 'find_users',
      name: 'Find All Users',
      description: 'Show all entities that use this resource',
      category: 'navigate',
      available: true,
      execute: () => context.actionHandlers?.findUsers?.(entityId),
    });
  }

  // Performance-related actions
  actions.push({
    id: 'jump_to_timeline',
    name: 'Show in Timeline',
    description: 'Jump to this entity in the timeline view',
    category: 'navigate',
    available: true,
    execute: () => context.actionHandlers?.jumpToTimeline?.(entityId),
  });

  actions.push({
    id: 'show_attribution',
    name: 'Show Cost Attribution',
    description: 'View the full attribution chain for this entity',
    category: 'debug',
    available: true,
    execute: () => context.actionHandlers?.showAttribution?.(entityId),
  });

  return { actions };
}

/**
 * Calculate overall fidelity from cost metrics
 */
function calculateOverallFidelity(cost: CostInfo): Fidelity {
  const fidelities: Fidelity[] = [];

  if (cost.gpu_time) fidelities.push(cost.gpu_time.fidelity);
  if (cost.cpu_time) fidelities.push(cost.cpu_time.fidelity);
  if (cost.memory_bytes) fidelities.push(cost.memory_bytes.fidelity);
  if (cost.draw_calls) fidelities.push(cost.draw_calls.fidelity);
  if (cost.triangles) fidelities.push(cost.triangles.fidelity);

  if (fidelities.length === 0) return 'UNAVAILABLE';
  if (fidelities.includes('UNAVAILABLE')) return 'UNAVAILABLE';
  if (fidelities.includes('ESTIMATED')) return 'ESTIMATED';
  return 'EXACT';
}
