/**
 * Built-in Queries
 *
 * Standard queries that ship with 3Lens.
 *
 * @packageDocumentation
 */

import { defineQuery, type QueryRegistry } from './query-engine';
import type { EntityGraph, Node, NodeType } from '../schema/entity-graph';
import {
  getResourcesUsedBy,
  getResourceUsers,
  getSceneHierarchy,
  getParentChain,
  getShaderVariants,
  findOrphanedResources,
} from '../graph/queries';

/**
 * Register all built-in queries
 */
export function registerBuiltInQueries(registry: QueryRegistry): void {
  // Entity queries
  registry.register(getNodeByIdQuery);
  registry.register(getNodesByTypeQuery);
  registry.register(searchNodesQuery);

  // Relationship queries
  registry.register(resourcesUsedByQuery);
  registry.register(resourceUsersQuery);
  registry.register(sceneHierarchyQuery);
  registry.register(parentChainQuery);

  // Resource queries
  registry.register(orphanedResourcesQuery);
  registry.register(shaderVariantsQuery);

  // Statistics queries
  registry.register(nodeCountsQuery);
  registry.register(contextSummaryQuery);
}

// =============================================================================
// Entity Queries
// =============================================================================

const getNodeByIdQuery = defineQuery<{ id: string }, Node | undefined>(
  'get_node_by_id',
  'Get a single node by its entity ID',
  (graph, params) => ({
    data: graph.getNode(params.id),
    fidelity: 'EXACT',
  })
);

const getNodesByTypeQuery = defineQuery<
  { types: NodeType[]; context_id?: string; limit?: number },
  Node[]
>(
  'get_nodes_by_type',
  'Get all nodes of specified types',
  (graph, params) => {
    const result = graph.getNodes({
      types: params.types,
      context_id: params.context_id,
      limit: params.limit,
      active: true,
    });
    return {
      data: result.nodes,
      fidelity: result.fidelity,
      metadata: {
        truncated: result.truncated,
        totalCount: result.total_count,
      },
    };
  }
);

const searchNodesQuery = defineQuery<
  { search: string; types?: NodeType[]; limit?: number },
  Node[]
>(
  'search_nodes',
  'Search nodes by name',
  (graph, params) => {
    const result = graph.getNodes({
      name_contains: params.search,
      types: params.types,
      limit: params.limit,
      active: true,
    });
    return {
      data: result.nodes,
      fidelity: result.fidelity,
      metadata: {
        truncated: result.truncated,
        totalCount: result.total_count,
      },
    };
  }
);

// =============================================================================
// Relationship Queries
// =============================================================================

const resourcesUsedByQuery = defineQuery<{ entity_id: string }, Node[]>(
  'resources_used_by',
  'Get all resources used by an entity',
  (graph, params) => {
    const result = getResourcesUsedBy(graph, params.entity_id);
    return {
      data: result.results,
      fidelity: result.fidelity,
      metadata: { totalCount: result.total_count },
    };
  }
);

const resourceUsersQuery = defineQuery<{ resource_id: string }, Node[]>(
  'resource_users',
  'Get all entities that use a resource',
  (graph, params) => {
    const result = getResourceUsers(graph, params.resource_id);
    return {
      data: result.results,
      fidelity: result.fidelity,
      metadata: { totalCount: result.total_count },
    };
  }
);

const sceneHierarchyQuery = defineQuery<{ scene_id: string; max_depth?: number }, Node[]>(
  'scene_hierarchy',
  'Get the full scene graph hierarchy',
  (graph, params) => {
    const result = getSceneHierarchy(graph, params.scene_id, params.max_depth);
    return {
      data: result.results,
      fidelity: result.fidelity,
      metadata: { totalCount: result.total_count },
    };
  }
);

const parentChainQuery = defineQuery<{ entity_id: string }, Node[]>(
  'parent_chain',
  'Get the parent chain for an entity',
  (graph, params) => {
    const result = getParentChain(graph, params.entity_id);
    return {
      data: result.results,
      fidelity: result.fidelity,
      metadata: { totalCount: result.total_count },
    };
  }
);

// =============================================================================
// Resource Queries
// =============================================================================

const orphanedResourcesQuery = defineQuery<Record<string, never>, Node[]>(
  'orphaned_resources',
  'Find resources not used by any entity',
  (graph) => {
    const result = findOrphanedResources(graph);
    return {
      data: result.results,
      fidelity: result.fidelity,
      metadata: { totalCount: result.total_count },
    };
  }
);

const shaderVariantsQuery = defineQuery<{ shader_id: string }, Node[]>(
  'shader_variants',
  'Get all variants of a shader',
  (graph, params) => {
    const result = getShaderVariants(graph, params.shader_id);
    return {
      data: result.results,
      fidelity: result.fidelity,
      metadata: { totalCount: result.total_count },
    };
  }
);

// =============================================================================
// Statistics Queries
// =============================================================================

const nodeCountsQuery = defineQuery<{ context_id?: string }, Record<NodeType, number>>(
  'node_counts',
  'Get node counts by type',
  (graph, params) => {
    if (params.context_id) {
      const nodes = graph.getNodes({ context_id: params.context_id });
      const counts: Partial<Record<NodeType, number>> = {};
      for (const node of nodes.nodes) {
        counts[node.type] = (counts[node.type] || 0) + 1;
      }
      return { data: counts as Record<NodeType, number>, fidelity: 'EXACT' };
    }
    return { data: graph.nodeCountByType(), fidelity: 'EXACT' };
  }
);

interface ContextSummary {
  context_id: string;
  node_count: number;
  edge_count: number;
  nodes_by_type: Record<string, number>;
}

const contextSummaryQuery = defineQuery<{ context_id: string }, ContextSummary>(
  'context_summary',
  'Get a summary of a context',
  (graph, params) => {
    const nodes = graph.getNodes({ context_id: params.context_id });
    const edges = graph.getEdges({ from: params.context_id });

    const nodesByType: Record<string, number> = {};
    for (const node of nodes.nodes) {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    }

    return {
      data: {
        context_id: params.context_id,
        node_count: nodes.total_count,
        edge_count: edges.length,
        nodes_by_type: nodesByType,
      },
      fidelity: 'EXACT',
    };
  }
);
