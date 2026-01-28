/**
 * Built-in Graph Queries
 *
 * @packageDocumentation
 */

import type { EntityGraph, EntityId, Node, NodeType } from '../schema/entity-graph';
import type { Fidelity } from '../schema/events';

/**
 * Query result with attribution
 */
export interface AttributedQueryResult<T = Node> {
  results: T[];
  fidelity: Fidelity;
  total_count: number;
}

/**
 * Get all resources used by an entity (textures, materials, geometries)
 */
export function getResourcesUsedBy(
  graph: EntityGraph,
  entityId: EntityId
): AttributedQueryResult<Node> {
  const resourceTypes: NodeType[] = ['texture', 'material', 'geometry', 'shader', 'render_target'];

  const neighbors = graph.traverse(entityId, 'out', ['uses'], 3);
  const resources = neighbors.filter((n) => resourceTypes.includes(n.type));

  return {
    results: resources,
    fidelity: 'EXACT',
    total_count: resources.length,
  };
}

/**
 * Get all entities that use a resource
 */
export function getResourceUsers(
  graph: EntityGraph,
  resourceId: EntityId
): AttributedQueryResult<Node> {
  const edges = graph.getIncomingEdges(resourceId, 'uses');
  const users = edges
    .map((e) => graph.getNode(e.from))
    .filter((n): n is Node => n !== undefined);

  return {
    results: users,
    fidelity: 'EXACT',
    total_count: users.length,
  };
}

/**
 * Get scene graph hierarchy
 */
export function getSceneHierarchy(
  graph: EntityGraph,
  sceneId: EntityId,
  maxDepth: number = 100
): AttributedQueryResult<Node> {
  const descendants = graph.traverse(sceneId, 'out', ['contains'], maxDepth);

  return {
    results: descendants,
    fidelity: 'EXACT',
    total_count: descendants.length,
  };
}

/**
 * Get parent chain for an entity
 */
export function getParentChain(graph: EntityGraph, entityId: EntityId): AttributedQueryResult<Node> {
  const chain: Node[] = [];
  let currentId = entityId;

  while (chain.length < 100) {
    // Prevent infinite loops
    const parentEdges = graph.getIncomingEdges(currentId, 'contains');
    if (parentEdges.length === 0) break;

    const parentNode = graph.getNode(parentEdges[0].from);
    if (!parentNode) break;

    chain.push(parentNode);
    currentId = parentNode.id;
  }

  return {
    results: chain,
    fidelity: 'EXACT',
    total_count: chain.length,
  };
}

/**
 * Get shader variants for a shader
 */
export function getShaderVariants(
  graph: EntityGraph,
  shaderId: EntityId
): AttributedQueryResult<Node> {
  const edges = graph.getOutgoingEdges(shaderId);
  const variants = edges
    .filter((e) => e.type === 'variant_of' || graph.getNode(e.to)?.type === 'shader_variant')
    .map((e) => graph.getNode(e.to))
    .filter((n): n is Node => n !== undefined && n.type === 'shader_variant');

  // Also check incoming edges (variants pointing to shader)
  const incomingVariants = graph
    .getIncomingEdges(shaderId, 'variant_of')
    .map((e) => graph.getNode(e.from))
    .filter((n): n is Node => n !== undefined && n.type === 'shader_variant');

  const allVariants = [...variants, ...incomingVariants];
  const uniqueVariants = Array.from(new Map(allVariants.map((v) => [v.id, v])).values());

  return {
    results: uniqueVariants,
    fidelity: 'EXACT',
    total_count: uniqueVariants.length,
  };
}

/**
 * Find orphaned resources (not used by anything)
 */
export function findOrphanedResources(graph: EntityGraph): AttributedQueryResult<Node> {
  const resourceTypes: NodeType[] = ['texture', 'material', 'geometry'];
  const resources = graph.getNodes({ types: resourceTypes, active: true });

  const orphans = resources.nodes.filter((resource) => {
    const users = graph.getIncomingEdges(resource.id, 'uses');
    return users.length === 0;
  });

  return {
    results: orphans,
    fidelity: 'EXACT',
    total_count: orphans.length,
  };
}

/**
 * Get materials using a texture
 */
export function getMaterialsUsingTexture(
  graph: EntityGraph,
  textureId: EntityId
): AttributedQueryResult<Node> {
  const edges = graph.getIncomingEdges(textureId, 'uses');
  const materials = edges
    .map((e) => graph.getNode(e.from))
    .filter((n): n is Node => n !== undefined && n.type === 'material');

  return {
    results: materials,
    fidelity: 'EXACT',
    total_count: materials.length,
  };
}

/**
 * Get meshes using a material
 */
export function getMeshesUsingMaterial(
  graph: EntityGraph,
  materialId: EntityId
): AttributedQueryResult<Node> {
  const edges = graph.getIncomingEdges(materialId, 'uses');
  const meshes = edges
    .map((e) => graph.getNode(e.from))
    .filter((n): n is Node => n !== undefined && n.type === 'object3d');

  return {
    results: meshes,
    fidelity: 'EXACT',
    total_count: meshes.length,
  };
}
