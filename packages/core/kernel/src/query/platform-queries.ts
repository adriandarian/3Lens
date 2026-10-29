/** Shared investigation projections. All inputs are serialized capture data. */
import type { Event, Fidelity } from '../schema/events';
import type {
  Edge,
  EntityGraph,
  GraphSnapshot,
  Node,
} from '../schema/entity-graph';
import { defineQuery, type QueryRegistry } from './query-engine';

export interface PlatformFrame {
  frame: number;
  context_id: string;
  timestamp: number;
  cpu_ms: number | null;
  cpu_fidelity: Fidelity;
  draw_calls: number | null;
  triangles: number | null;
  metrics_fidelity: Fidelity;
  entity_ids: string[];
  pass_ids: string[];
  fidelity: Fidelity;
}
export interface PlatformResource {
  entity_id: string;
  name: string;
  kind: string;
  node: Node;
  memory_bytes: number | null;
  memory_fidelity: Fidelity;
  users: string[];
  state: 'referenced' | 'disposed' | 'unreferenced';
  created_at: number | null;
  disposed_at: number | null;
  lifecycle: { type: string; timestamp: number; seq: number }[];
  reason: string;
}
export interface PlatformAsset {
  entity_id: string;
  url: string;
  state: string;
  started_at: number | null;
  decoded_at: number | null;
  uploaded_at: number | null;
  fidelity: Fidelity;
  reason: string;
}
export interface PlatformShader {
  entity_id: string;
  name: string;
  context_id: string;
  material_ids: string[];
  defines: Record<string, string | number | boolean>;
  vertex_source: string | null;
  fragment_source: string | null;
  compile_ms: number | null;
  compile_fidelity: Fidelity;
  fidelity: Fidelity;
  reason: string;
}
export interface PlatformPass {
  entity_id: string;
  name: string;
  context_id: string;
  tags: string[];
  target_ids: string[];
  cpu_ms: number | null;
  cpu_fidelity: Fidelity;
  draw_calls: number | null;
  triangles: number | null;
  fidelity: Fidelity;
  reason: string;
  metrics_fidelity: Fidelity;
}
export interface PlatformSnapshot {
  frames: PlatformFrame[];
  events: Event[];
  resources: PlatformResource[];
  assets: PlatformAsset[];
  shaders: PlatformShader[];
  passes: PlatformPass[];
  pipeline_edges: Edge[];
  dropped_events: number;
  reasons: string[];
}
export interface PlatformSnapshotParams {
  events?: Event[];
  context_id?: string;
  limit?: number;
  dropped_events?: number;
}

const finite = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;
const properties = (node: Node) => node as unknown as Record<string, any>;

export const platformSnapshotQuery = defineQuery<
  PlatformSnapshotParams,
  PlatformSnapshot
>(
  'platform_snapshot',
  'Query recorded frames, resource lifecycle, shader and pipeline evidence',
  (graph, params = {}) => {
    const events = (params.events ?? []).filter(
      (event) => !params.context_id || event.context_id === params.context_id
    );
    const nodes = graph.getNodes(
      params.context_id ? { context_id: params.context_id } : {}
    ).nodes;
    const frameMap = new Map<string, PlatformFrame>();
    const frameKey = (context: string, frame: number) => `${context}:${frame}`;
    for (const event of events) {
      if (!('frame' in event) || typeof event.frame !== 'number') continue;
      const key = frameKey(event.context_id, event.frame);
      if (!frameMap.has(key))
        frameMap.set(key, {
          frame: event.frame,
          context_id: event.context_id,
          timestamp: event.timestamp,
          cpu_ms: null,
          cpu_fidelity: 'UNAVAILABLE',
          draw_calls: null,
          triangles: null,
          metrics_fidelity: 'UNAVAILABLE',
          fidelity: 'ESTIMATED',
          entity_ids: [],
          pass_ids: [],
        });
      const frame = frameMap.get(key)!;
      if (event.type === 'frame_begin') frame.fidelity = event.fidelity;
      if (event.type === 'frame_end') {
        frame.cpu_ms = finite(event.duration_ms);
        frame.cpu_fidelity =
          frame.cpu_ms === null
            ? 'UNAVAILABLE'
            : (event.duration_fidelity ?? 'UNAVAILABLE');
      }
      if (event.type === 'render_event') {
        const draws = finite(event.draw_calls),
          triangles = finite(event.triangles);
        if (draws !== null) frame.draw_calls = (frame.draw_calls ?? 0) + draws;
        if (triangles !== null)
          frame.triangles = (frame.triangles ?? 0) + triangles;
        frame.metrics_fidelity = event.metrics_fidelity ?? 'UNAVAILABLE';
        frame.entity_ids.push(event.scene_id, event.camera_id);
        if (event.pass_id) frame.pass_ids.push(event.pass_id);
      }
    }
    const limit = Math.max(1, Math.min(2000, params.limit ?? 300));
    const frames = [...frameMap.values()]
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);
    frames.forEach((frame) => {
      frame.entity_ids = [...new Set(frame.entity_ids)];
      frame.pass_ids = [...new Set(frame.pass_ids)];
    });
    const lifecycle = new Map<string, PlatformResource['lifecycle']>();
    const previousActive = new Map<string, boolean>();
    for (const event of events) {
      if (
        event.type === 'resource_create' ||
        event.type === 'resource_dispose' ||
        event.type === 'resource_update'
      ) {
        const history = lifecycle.get(event.entity_id) ?? [];
        history.push({
          type: event.type,
          timestamp: event.timestamp,
          seq: event.seq,
        });
        lifecycle.set(event.entity_id, history);
      }
      if (event.type === 'context_update') {
        const snapshot = event.changes.metadata?.graph_snapshot as
          | GraphSnapshot
          | undefined;
        for (const node of snapshot?.nodes ?? []) {
          if (
            !['geometry', 'material', 'texture', 'render_target'].includes(
              node.type
            )
          )
            continue;
          const previous = previousActive.get(node.id);
          const history = lifecycle.get(node.id) ?? [];
          if (previous === undefined)
            history.push({
              type:
                node.origin === 'preexisting' ? 'observed' : 'resource_create',
              timestamp: event.timestamp,
              seq: event.seq,
            });
          else if (
            previous &&
            !node.active &&
            !history.some(
              (item) =>
                item.seq === event.seq - 1 && item.type === 'resource_dispose'
            )
          )
            history.push({
              type: 'resource_dispose',
              timestamp: event.timestamp,
              seq: event.seq,
            });
          previousActive.set(node.id, node.active);
          lifecycle.set(node.id, history);
        }
      }
    }
    const resources = nodes
      .filter((node) =>
        ['geometry', 'material', 'texture', 'render_target'].includes(node.type)
      )
      .map((node) => {
        const prop = properties(node);
        const history = lifecycle.get(node.id) ?? [];
        const users = [
          ...new Set(
            graph
              .getIncomingEdges(node.id, 'uses')
              .filter(
                (edge) =>
                  edge.active !== false && graph.getNode(edge.from)?.active
              )
              .map((edge) => edge.from)
          ),
        ];
        const fidelity: Fidelity = prop.memory_fidelity ?? 'UNAVAILABLE';
        return {
          entity_id: node.id,
          name: node.name || node.type,
          kind: node.type,
          node,
          memory_bytes:
            fidelity === 'UNAVAILABLE' ? null : finite(prop.memory_bytes),
          memory_fidelity: fidelity,
          users,
          state: !node.active
            ? ('disposed' as const)
            : users.length
              ? ('referenced' as const)
              : ('unreferenced' as const),
          created_at:
            history.find((item) =>
              ['observed', 'resource_create'].includes(item.type)
            )?.timestamp ?? null,
          disposed_at:
            [...history]
              .reverse()
              .find((item) => item.type === 'resource_dispose')?.timestamp ??
            null,
          lifecycle: history,
          reason:
            prop.memory_reason ??
            'No supported storage measurement was captured for this resource.',
        };
      });
    const assets: PlatformAsset[] = nodes
      .filter((node) => node.type === 'texture' && properties(node).source_url)
      .map((node) => ({
        entity_id: node.id,
        url: String(properties(node).source_url),
        state: node.active ? 'referenced' : 'disposed',
        started_at: null,
        decoded_at: null,
        uploaded_at: null,
        fidelity: 'UNAVAILABLE',
        reason:
          'Source URL was observed on the texture; loader lifecycle, decode and upload timing were not instrumented.',
      }));
    const shaders: PlatformShader[] = nodes
      .filter((node) => ['shader', 'shader_variant'].includes(node.type))
      .map((node) => {
        const prop = properties(node);
        const parent = prop.parent_shader_id
          ? graph.getNode(prop.parent_shader_id)
          : undefined;
        const parentProp = parent ? properties(parent) : {};
        const usageTargets = [
          node.id,
          ...graph
            .getIncomingEdges(node.id, 'variant_of')
            .map((edge) => edge.from),
        ];
        const materialIds = [
          ...new Set(
            usageTargets.flatMap((id) =>
              graph
                .getIncomingEdges(id)
                .filter(
                  (edge) =>
                    edge.active !== false &&
                    ['uses', 'renders_with'].includes(edge.type)
                )
                .map((edge) => edge.from)
                .filter((id) => graph.getNode(id)?.type === 'material')
            )
          ),
        ];
        const source =
          prop.vertex_source ||
          prop.fragment_source ||
          parentProp.vertex_source ||
          parentProp.fragment_source;
        return {
          entity_id: node.id,
          name: node.name || node.type,
          context_id: node.context_id,
          material_ids: materialIds,
          defines: prop.defines ?? {},
          vertex_source: prop.vertex_source ?? parentProp.vertex_source ?? null,
          fragment_source:
            prop.fragment_source ?? parentProp.fragment_source ?? null,
          compile_ms: finite(prop.compile_time_ms),
          compile_fidelity: prop.compile_time_fidelity ?? 'UNAVAILABLE',
          fidelity: source ? ('EXACT' as const) : ('UNAVAILABLE' as const),
          reason: source
            ? `Shader source was captured from a runtime WebGL program. Compilation timing is unavailable unless explicitly instrumented.${prop.defines_truncated ? ' Feature defines are limited to 64 entries with values up to 64 characters; inspect full source for omitted definitions.' : ''}`
            : 'Compiled shader source was not captured.',
        };
      });
    const passes: PlatformPass[] = nodes
      .filter((node) => node.type === 'pass')
      .map((node) => {
        const prop = properties(node);
        const ending = events
          .filter(
            (event) => event.type === 'pass_end' && event.pass_id === node.id
          )
          .at(-1);
        const render = events
          .filter(
            (event) =>
              event.type === 'render_event' && event.pass_id === node.id
          )
          .at(-1);
        const end = ending?.type === 'pass_end' ? ending : undefined;
        const draw = render?.type === 'render_event' ? render : undefined;
        return {
          entity_id: node.id,
          name: node.name || prop.pass_name || 'Render pass',
          context_id: node.context_id,
          tags: prop.tags ?? [],
          target_ids: prop.output_target_id ? [prop.output_target_id] : [],
          cpu_ms: finite(end?.duration_ms),
          cpu_fidelity: end?.duration_fidelity ?? 'UNAVAILABLE',
          draw_calls: finite(draw?.draw_calls),
          triangles: finite(draw?.triangles),
          metrics_fidelity: draw?.metrics_fidelity ?? 'UNAVAILABLE',
          fidelity: prop.descriptor_fidelity ?? 'EXACT',
          reason: end
            ? 'Explicit pass boundaries were recorded; CPU wall time is not GPU time.'
            : 'Pass descriptor captured; pass boundaries and timings were not instrumented.',
        };
      });
    const reasons = [
      'GPU timing is unavailable: no authoritative GPU timer was captured.',
    ];
    if (!frames.length)
      reasons.push(
        'No rendering events exist in this selected capture/context.'
      );
    if (!passes.length)
      reasons.push(
        'Pass segmentation is unavailable; only renderer-level submissions were observed.'
      );
    if (!shaders.length)
      reasons.push(
        'No compiled shader source or runtime variants were captured.'
      );
    if (!assets.length)
      reasons.push(
        'Asset loading lifecycle is unavailable; no loader instrumentation was captured.'
      );
    if (params.dropped_events)
      reasons.push(
        `${params.dropped_events} earlier events were dropped from the bounded recording.`
      );
    const pipelineIds = new Set(
      nodes
        .filter((node) =>
          ['pipeline', 'pass', 'render_target'].includes(node.type)
        )
        .map((node) => node.id)
    );
    return {
      data: {
        frames,
        events,
        resources,
        assets,
        shaders,
        passes,
        pipeline_edges: graph
          .getEdges()
          .filter(
            (edge) => pipelineIds.has(edge.from) && pipelineIds.has(edge.to)
          ),
        dropped_events: params.dropped_events ?? 0,
        reasons,
      },
      fidelity: 'UNAVAILABLE',
    };
  }
);

export function registerPlatformQueries(registry: QueryRegistry): void {
  registry.register(platformSnapshotQuery);
}
