/**
 * Entity Graph Implementation
 *
 * @packageDocumentation
 */

import type {
  EntityGraph,
  EntityId,
  Node,
  Edge,
  NodeType,
  EdgeType,
  NodeFilter,
  EdgeFilter,
  QueryResult,
  GraphSnapshot,
} from '../schema/entity-graph';

/**
 * Create an entity graph
 */
export function createEntityGraph(): EntityGraph {
  const nodes = new Map<EntityId, Node>();
  const edges = new Map<string, Edge>();

  // Index for fast edge lookup
  const outgoingEdges = new Map<EntityId, Set<string>>();
  const incomingEdges = new Map<EntityId, Set<string>>();

  function edgeKey(from: EntityId, to: EntityId, type: EdgeType): string {
    return `${from}|${to}|${type}`;
  }

  const graph: EntityGraph = {
    // Node operations
    getNode(id: EntityId): Node | undefined {
      return nodes.get(id);
    },

    addNode(node: Node): void {
      nodes.set(node.id, node);
    },

    updateNode(id: EntityId, updates: Partial<Node>): void {
      const existing = nodes.get(id);
      if (existing) {
        nodes.set(id, { ...existing, ...updates } as Node);
      }
    },

    removeNode(id: EntityId): void {
      nodes.delete(id);

      // Remove associated edges
      const outgoing = outgoingEdges.get(id);
      if (outgoing) {
        for (const key of outgoing) {
          edges.delete(key);
        }
        outgoingEdges.delete(id);
      }

      const incoming = incomingEdges.get(id);
      if (incoming) {
        for (const key of incoming) {
          edges.delete(key);
        }
        incomingEdges.delete(id);
      }
    },

    hasNode(id: EntityId): boolean {
      return nodes.has(id);
    },

    // Edge operations
    getEdge(from: EntityId, to: EntityId, type: EdgeType): Edge | undefined {
      return edges.get(edgeKey(from, to, type));
    },

    addEdge(edge: Edge): void {
      const key = edgeKey(edge.from, edge.to, edge.type);
      edges.set(key, edge);

      // Update indices
      if (!outgoingEdges.has(edge.from)) {
        outgoingEdges.set(edge.from, new Set());
      }
      outgoingEdges.get(edge.from)!.add(key);

      if (!incomingEdges.has(edge.to)) {
        incomingEdges.set(edge.to, new Set());
      }
      incomingEdges.get(edge.to)!.add(key);
    },

    removeEdge(from: EntityId, to: EntityId, type: EdgeType): void {
      const key = edgeKey(from, to, type);
      edges.delete(key);

      outgoingEdges.get(from)?.delete(key);
      incomingEdges.get(to)?.delete(key);
    },

    hasEdge(from: EntityId, to: EntityId, type: EdgeType): boolean {
      return edges.has(edgeKey(from, to, type));
    },

    // Queries
    getNodes(filter?: NodeFilter): QueryResult {
      let result = Array.from(nodes.values());

      if (filter) {
        if (filter.types) {
          result = result.filter((n) => filter.types!.includes(n.type));
        }
        if (filter.context_id) {
          result = result.filter((n) => n.context_id === filter.context_id);
        }
        if (filter.active !== undefined) {
          result = result.filter((n) => n.active === filter.active);
        }
        if (filter.name_contains) {
          const search = filter.name_contains.toLowerCase();
          result = result.filter((n) => n.name?.toLowerCase().includes(search));
        }
        if (filter.created_after !== undefined) {
          result = result.filter((n) => n.created_at > filter.created_after!);
        }
        if (filter.created_before !== undefined) {
          result = result.filter((n) => n.created_at < filter.created_before!);
        }
      }

      const totalCount = result.length;

      if (filter?.offset) {
        result = result.slice(filter.offset);
      }
      if (filter?.limit) {
        result = result.slice(0, filter.limit);
      }

      return {
        nodes: result,
        fidelity: 'EXACT',
        truncated: filter?.limit ? totalCount > filter.limit : false,
        total_count: totalCount,
      };
    },

    getEdges(filter?: EdgeFilter): Edge[] {
      let result = Array.from(edges.values());

      if (filter) {
        if (filter.types) {
          result = result.filter((e) => filter.types!.includes(e.type));
        }
        if (filter.from) {
          result = result.filter((e) => e.from === filter.from);
        }
        if (filter.to) {
          result = result.filter((e) => e.to === filter.to);
        }
        if (filter.active !== undefined) {
          result = result.filter((e) => e.active === filter.active);
        }
      }

      return result;
    },

    getIncomingEdges(id: EntityId, type?: EdgeType): Edge[] {
      const keys = incomingEdges.get(id);
      if (!keys) return [];

      let result: Edge[] = [];
      for (const key of keys) {
        const edge = edges.get(key);
        if (edge) {
          result.push(edge);
        }
      }

      if (type) {
        result = result.filter((e) => e.type === type);
      }

      return result;
    },

    getOutgoingEdges(id: EntityId, type?: EdgeType): Edge[] {
      const keys = outgoingEdges.get(id);
      if (!keys) return [];

      let result: Edge[] = [];
      for (const key of keys) {
        const edge = edges.get(key);
        if (edge) {
          result.push(edge);
        }
      }

      if (type) {
        result = result.filter((e) => e.type === type);
      }

      return result;
    },

    getNeighbors(id: EntityId, direction: 'in' | 'out' | 'both' = 'both', type?: EdgeType): Node[] {
      const neighborIds = new Set<EntityId>();

      if (direction === 'in' || direction === 'both') {
        for (const edge of graph.getIncomingEdges(id, type)) {
          neighborIds.add(edge.from);
        }
      }

      if (direction === 'out' || direction === 'both') {
        for (const edge of graph.getOutgoingEdges(id, type)) {
          neighborIds.add(edge.to);
        }
      }

      return Array.from(neighborIds)
        .map((nid) => nodes.get(nid))
        .filter((n): n is Node => n !== undefined);
    },

    // Traversal
    traverse(
      startId: EntityId,
      direction: 'in' | 'out' | 'both',
      edgeTypes?: EdgeType[],
      maxDepth: number = 10
    ): Node[] {
      const visited = new Set<EntityId>();
      const result: Node[] = [];

      function visit(id: EntityId, depth: number) {
        if (depth > maxDepth || visited.has(id)) return;
        visited.add(id);

        const node = nodes.get(id);
        if (node) {
          result.push(node);
        }

        const edges =
          direction === 'in'
            ? graph.getIncomingEdges(id)
            : direction === 'out'
              ? graph.getOutgoingEdges(id)
              : [...graph.getIncomingEdges(id), ...graph.getOutgoingEdges(id)];

        for (const edge of edges) {
          if (edgeTypes && !edgeTypes.includes(edge.type)) continue;

          const nextId = edge.from === id ? edge.to : edge.from;
          visit(nextId, depth + 1);
        }
      }

      visit(startId, 0);
      return result;
    },

    // Snapshot
    snapshot(): GraphSnapshot {
      return {
        version: '1.0.0',
        timestamp: Date.now(),
        nodes: Array.from(nodes.values()),
        edges: Array.from(edges.values()),
        context_ids: [...new Set(Array.from(nodes.values()).map((n) => n.context_id))],
      };
    },

    restore(snapshot: GraphSnapshot): void {
      nodes.clear();
      edges.clear();
      outgoingEdges.clear();
      incomingEdges.clear();

      for (const node of snapshot.nodes) {
        graph.addNode(node);
      }

      for (const edge of snapshot.edges) {
        graph.addEdge(edge);
      }
    },

    // Stats
    nodeCount(): number {
      return nodes.size;
    },

    edgeCount(): number {
      return edges.size;
    },

    nodeCountByType(): Record<NodeType, number> {
      const counts: Partial<Record<NodeType, number>> = {};
      for (const node of nodes.values()) {
        counts[node.type] = (counts[node.type] || 0) + 1;
      }
      return counts as Record<NodeType, number>;
    },
  };

  return graph;
}
