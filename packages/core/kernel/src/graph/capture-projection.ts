/** The shared capture-to-graph projection used by live capture and trace replay. */
import type { Event } from '../schema/events';
import type {
  EntityGraph,
  GraphSnapshot,
  Node,
  Edge,
} from '../schema/entity-graph';

const nodeTypes = new Set([
  'renderer',
  'scene',
  'camera',
  'object3d',
  'geometry',
  'material',
  'texture',
  'render_target',
  'shader',
  'shader_variant',
  'pipeline',
  'pass',
  'frame',
  'draw_call',
]);
const edgeTypes = new Set([
  'contains',
  'child_of',
  'uses',
  'used_by',
  'renders_with',
  'rendered_in',
  'owns',
  'references',
  'variant_of',
]);

/** Reject malformed checkpoints before replacing an active investigation. */
export function validateGraphCheckpoint(
  snapshot: Pick<GraphSnapshot, 'nodes' | 'edges'>
): void {
  if (
    !snapshot ||
    !Array.isArray(snapshot.nodes) ||
    !Array.isArray(snapshot.edges)
  ) {
    throw new Error('Invalid graph checkpoint collections');
  }
  const ids = new Set<string>();
  for (const node of snapshot.nodes) {
    if (
      !node ||
      typeof node.id !== 'string' ||
      typeof node.context_id !== 'string' ||
      !node.id.startsWith(`${node.context_id}:`) ||
      node.id.split(':').length < 3 ||
      !nodeTypes.has(node.type) ||
      ids.has(node.id) ||
      typeof node.active !== 'boolean'
    ) {
      throw new Error('Invalid or duplicate entity in graph checkpoint');
    }
    if (
      'memory_bytes' in node &&
      (!Number.isFinite(node.memory_bytes) || node.memory_bytes < 0)
    ) {
      throw new Error('Invalid resource measurement in graph checkpoint');
    }
    ids.add(node.id);
  }
  for (const edge of snapshot.edges) {
    if (
      !edge ||
      !ids.has(edge.from) ||
      !ids.has(edge.to) ||
      !edgeTypes.has(edge.type)
    ) {
      throw new Error('Invalid or unresolved relationship in graph checkpoint');
    }
  }
}

export function applyCaptureEvent(graph: EntityGraph, event: Event): void {
  if (event.type === 'context_update') {
    const descriptor = event.changes.metadata?.pipeline_descriptor as
      | {
          id: string;
          displayName: string;
          passes: { id: string; name: string; tags?: string[] }[];
          edges?: [string, string][];
        }
      | undefined;
    if (descriptor) {
      if (
        typeof descriptor.id !== 'string' ||
        !Array.isArray(descriptor.passes)
      )
        throw new Error('Invalid pipeline descriptor');
      const id = (type: string, local: string) =>
        local.startsWith(`${event.context_id}:`)
          ? local
          : `${event.context_id}:${type}:${local}`;
      const pipelineId = id('pipeline', descriptor.id);
      const previous = graph
        .getNodes({ context_id: event.context_id })
        .nodes.filter(
          (node) =>
            (node as unknown as { descriptor_pipeline_id?: string })
              .descriptor_pipeline_id === pipelineId
        );
      for (const node of previous) {
        for (const edge of [
          ...graph.getOutgoingEdges(node.id),
          ...graph.getIncomingEdges(node.id),
        ])
          graph.removeEdge(edge.from, edge.to, edge.type);
        graph.removeNode(node.id);
      }
      const common = {
        context_id: event.context_id,
        origin: 'preexisting' as const,
        created_at: event.seq,
        modified_at: event.seq,
        active: true,
        descriptor_pipeline_id: pipelineId,
        descriptor_fidelity: 'EXACT',
      };
      graph.addNode({
        ...common,
        id: pipelineId,
        type: 'pipeline',
        name: descriptor.displayName,
        pass_ids: descriptor.passes.map((pass) => id('pass', pass.id)),
        render_target_ids: [],
        edge_count: descriptor.edges?.length ?? 0,
      } as Node);
      descriptor.passes.forEach((pass, order) => {
        const passId = id('pass', pass.id);
        graph.addNode({
          ...common,
          id: passId,
          type: 'pass',
          name: pass.name,
          pass_name: pass.name,
          tags: pass.tags ?? ['custom'],
          input_target_ids: [],
          order,
          pipeline_id: pipelineId,
        } as Node);
        graph.addEdge({
          from: pipelineId,
          to: passId,
          type: 'contains',
          created_at: event.seq,
          active: true,
        });
        graph.addEdge({
          from: passId,
          to: pipelineId,
          type: 'rendered_in',
          created_at: event.seq,
          active: true,
        } as Edge);
      });
      for (const [from, to] of descriptor.edges ?? []) {
        const fromId = id('pass', from),
          toId = id('pass', to);
        if (graph.hasNode(fromId) && graph.hasNode(toId))
          graph.addEdge({
            from: fromId,
            to: toId,
            type: 'references',
            ref_type: 'hard',
            created_at: event.seq,
            active: true,
          });
      }
    }
    const snapshot = event.changes.metadata?.graph_snapshot as
      | GraphSnapshot
      | undefined;
    if (!snapshot) return;
    validateGraphCheckpoint(snapshot);
    if (snapshot.nodes.some((node) => node.context_id !== event.context_id)) {
      throw new Error('Cross-context capture checkpoint');
    }
    // Each host owns only its context. Preserve other contexts when replacing a checkpoint.
    const removed = new Set(
      graph
        .getNodes({ context_id: event.context_id })
        .nodes.filter(
          (node) =>
            !(node as unknown as { descriptor_pipeline_id?: string })
              .descriptor_pipeline_id
        )
        .map((n) => n.id)
    );
    for (const edge of graph.getEdges()) {
      if (removed.has(edge.from) || removed.has(edge.to))
        graph.removeEdge(edge.from, edge.to, edge.type);
    }
    for (const id of removed) graph.removeNode(id);
    for (const node of snapshot.nodes) {
      graph.addNode(structuredClone(node));
    }
    for (const edge of snapshot.edges) {
      if (graph.hasNode(edge.from) && graph.hasNode(edge.to))
        graph.addEdge(structuredClone(edge));
    }
  } else if (event.type === 'object_added') {
    graph.addNode({
      id: event.entity_id,
      type: 'object3d',
      context_id: event.context_id,
      name: event.name,
      created_at: event.seq,
      modified_at: event.seq,
      origin: 'created',
      active: true,
      object_type: event.object_type,
      visible: true,
      frustum_culled: true,
      render_order: 0,
      layer_mask: 1,
      parent_id: event.parent_id,
      child_count: 0,
    });
    if (event.parent_id && graph.hasNode(event.parent_id)) {
      graph.addEdge({
        from: event.parent_id,
        to: event.entity_id,
        type: 'contains',
        created_at: event.seq,
        active: true,
      });
    }
  } else if (
    event.type === 'object_removed' ||
    event.type === 'resource_dispose'
  ) {
    graph.updateNode(event.entity_id, {
      active: false,
      modified_at: event.seq,
    });
  } else if (event.type === 'resource_create') {
    if (!nodeTypes.has(event.resource_type)) return;
    graph.addNode({
      ...event.metadata,
      id: event.entity_id,
      type: event.resource_type,
      context_id: event.context_id,
      created_at: event.seq,
      modified_at: event.seq,
      origin: event.origin,
      active: true,
      ...(event.memory_bytes !== undefined
        ? {
            memory_bytes: event.memory_bytes,
            memory_fidelity: event.memory_fidelity ?? 'UNAVAILABLE',
          }
        : {}),
    } as Node);
  } else if (event.type === 'resource_update') {
    const node = graph.getNode(event.entity_id);
    if (node)
      graph.updateNode(node.id, {
        modified_at: event.seq,
        ...('memory_bytes' in node && event.memory_delta !== undefined
          ? {
              memory_bytes: node.memory_bytes + event.memory_delta,
              memory_fidelity: event.memory_fidelity ?? 'UNAVAILABLE',
            }
          : {}),
      } as Partial<Node>);
  }
}
