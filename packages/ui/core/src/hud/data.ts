/**
 * Data layer for the HUD surfaces (pick card, drawer, palette, analysis window).
 *
 * Everything here is a projection over the shared query engine: no value is
 * computed that the capture/query layers did not already provide, and every
 * row carries the fidelity it was captured with. Per-object CPU/GPU timing is
 * never produced because it is not observable (see examples/README.md).
 */
import type { Lens } from '@3lens/runtime';
import type { Fidelity, Node, PlatformSnapshot } from '@3lens/kernel';

type Props = Record<string, any>;
const props = (node: Node | undefined) => (node ?? {}) as unknown as Props;

export interface EntityChange {
  entity_id: string;
  before: Node | null;
  after: Node | null;
  changes: string[];
}
export interface ResourceCost {
  entity_id: string;
  bytes: number | null;
  fidelity: 'ESTIMATED' | 'UNAVAILABLE';
  reason: string;
  primary_entities: { entity_id: string; weight: number; contribution: number }[];
  chain: { from_entity: string; to_entity: string; edge_type: 'uses'; weight: number }[];
}
interface Result<T> {
  data: T;
  fidelity: Fidelity;
}

export const RESOURCE_TYPES = ['geometry', 'material', 'texture', 'render_target'];
export const STORAGE_TYPES = ['geometry', 'texture', 'render_target'];

export function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MiB`;
}

export function entityName(lens: Lens, id: string): string {
  const node = lens.getNode(id);
  return node?.name || node?.type || id;
}

/** One measured, attributed fact with explicit fidelity. */
export interface Fact {
  label: string;
  value: string;
  fidelity: Fidelity;
  reason?: string;
  /** Entity to select when the row is activated. */
  entityId?: string;
}

export interface ResourceFact extends Fact {
  node: Node;
  bytes: number | null;
  share?: { weight: number; users: number };
}

export interface EntityBrief {
  id: string;
  name: string;
  type: string;
  /** Distinct active users of this entity when it is a resource; empty otherwise. */
  usedBy: Node[];
  /** Resources this entity uses (geometry / material / textures ...). */
  resources: ResourceFact[];
  changes: EntityChange | undefined;
  /** Parent chain from the scene down to the entity, nearest-last. */
  path: Node[];
}

function activeUsers(lens: Lens, id: string): Node[] {
  const seen = new Set<string>();
  const out: Node[] = [];
  for (const edge of lens.getGraph().getIncomingEdges(id, 'uses')) {
    if (!edge.active || seen.has(edge.from)) continue;
    const node = lens.getNode(edge.from);
    if (!node?.active) continue;
    seen.add(edge.from);
    out.push(node);
  }
  return out;
}

export function describeResource(lens: Lens, node: Node): ResourceFact {
  const p = props(node);
  const storage = 'memory_bytes' in p;
  const fidelity: Fidelity = storage ? (p.memory_fidelity ?? 'UNAVAILABLE') : 'EXACT';
  const bytes = storage && fidelity !== 'UNAVAILABLE' ? (p.memory_bytes as number) : null;
  const dims = node.type === 'texture' && p.width && p.height ? `${p.width}×${p.height}` : '';
  const users = activeUsers(lens, node.id).length;
  const name = node.name || node.type;
  let value: string;
  if (bytes !== null) value = `${dims ? dims + ' · ' : ''}${formatBytes(bytes)}`;
  else if (storage) value = `${dims ? dims + ' · ' : ''}storage unavailable`;
  else value = node.type;
  return {
    label: name,
    value,
    fidelity: storage ? fidelity : 'EXACT',
    reason: storage ? p.memory_reason : undefined,
    entityId: node.id,
    node,
    bytes,
    share: users ? { weight: 1 / users, users } : undefined,
  };
}

export function describeEntity(lens: Lens, id: string, baselineSet: boolean): EntityBrief | undefined {
  const node = lens.getNode(id);
  if (!node) return undefined;
  const resources =
    lens.query<Result<Node[]>>('resources_used_by', { entity_id: id })?.data ?? [];
  const changes = baselineSet
    ? lens.query<Result<EntityChange[]>>('entity_changes', { entity_id: id })?.data[0]
    : undefined;
  const path: Node[] = [];
  let cursor: Node | undefined = node;
  for (let hop = 0; cursor && hop < 12; hop++) {
    path.unshift(cursor);
    const parent: string | undefined = props(cursor).parent_id;
    cursor = parent ? lens.getNode(parent) : undefined;
  }
  return {
    id,
    name: node.name || node.type,
    type: node.type,
    usedBy: RESOURCE_TYPES.includes(node.type) ? activeUsers(lens, id) : [],
    resources: resources.map((resource) => describeResource(lens, resource)),
    changes,
    path,
  };
}

/** Describe a property change without inventing causality. */
export function describeChange(change: EntityChange): string[] {
  const before = change.before as unknown as Props | null;
  const after = change.after as unknown as Props | null;
  if (!before) return ['added since baseline'];
  if (!after) return ['removed since baseline'];
  return change.changes
    .filter((key) => !['created_at', 'unreferenced'].includes(key))
    .slice(0, 6)
    .map((key) => {
      const fmt = (value: unknown) =>
        key === 'memory_bytes' && typeof value === 'number'
          ? formatBytes(value)
          : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);
      return `${key}: ${fmt(before[key])} → ${fmt(after[key])}`;
    });
}

export interface Insight {
  id: string;
  kind: 'changed' | 'memory' | 'unreferenced' | 'shared' | 'frame';
  title: string;
  detail: string;
  fidelity: Fidelity;
  reason?: string;
  entityId: string;
  /** Human-readable reason this item surfaced (shown as the ranking rationale). */
  why: string;
}

export interface Question {
  id: string;
  label: string;
  hint: string;
  run(lens: Lens, baselineSet: boolean): Insight[];
}

function allNodes(lens: Lens, types: string[]): Node[] {
  const contextId = lens.getActiveContext()?.id;
  return lens
    .getGraph()
    .getNodes({ types: types as never, ...(contextId ? { context_id: contextId } : {}), active: true } as never)
    .nodes;
}

const changed: Question['run'] = (lens, baselineSet) => {
  if (!baselineSet) return [];
  const changes = lens.query<Result<EntityChange[]>>('entity_changes', {})?.data ?? [];
  return changes
    .filter((change) => {
      const node = change.after ?? change.before;
      return node && !['renderer', 'scene', 'camera'].includes(node.type) && change.after !== null;
    })
    .sort((a, b) => b.changes.length - a.changes.length)
    .slice(0, 12)
    .map((change) => {
      const node = (change.after ?? change.before)!;
      const lines = describeChange(change);
      return {
        id: `changed:${change.entity_id}`,
        kind: 'changed' as const,
        title: node.name || node.type,
        detail: lines.slice(0, 2).join(' · '),
        fidelity: 'EXACT' as Fidelity,
        entityId: change.entity_id,
        why: `${change.changes.length} observed propert${change.changes.length === 1 ? 'y' : 'ies'} differ from the baseline`,
      };
    });
};

const heaviest: Question['run'] = (lens) =>
  allNodes(lens, STORAGE_TYPES)
    .map((node) => describeResource(lens, node))
    .filter((fact) => fact.bytes !== null && fact.bytes > 0)
    .sort((a, b) => b.bytes! - a.bytes!)
    .slice(0, 8)
    .map((fact) => ({
      id: `memory:${fact.node.id}`,
      kind: 'memory' as const,
      title: fact.label,
      detail: `${fact.value} · ${fact.node.type} · …${fact.node.id.slice(-6)}`,
      fidelity: fact.fidelity,
      reason: fact.reason,
      entityId: fact.node.id,
      why: `Largest ${fact.node.type} storage (captured, not per-object GPU)`,
    }));

const unreferenced: Question['run'] = (lens) => {
  const out: Insight[] = [];
  for (const node of lens.getGraph().getNodes({ types: STORAGE_TYPES as never } as never).nodes) {
    const p = props(node);
    if (!p.unreferenced && node.active) continue;
    out.push({
      id: `unreferenced:${node.id}`,
      kind: 'unreferenced',
      title: node.name || node.type,
      detail: node.active ? 'No longer referenced by the scene' : 'Disposed',
      fidelity: 'EXACT',
      entityId: node.id,
      why: node.active
        ? 'Left the scene without being disposed — a possible leak'
        : 'Explicitly disposed',
    });
  }
  return out.slice(0, 10);
};

const shared: Question['run'] = (lens) =>
  allNodes(lens, ['geometry', 'material', 'texture'])
    .map((node) => ({ node, users: activeUsers(lens, node.id).length }))
    .filter((entry) => entry.users >= 3)
    .sort((a, b) => b.users - a.users)
    .slice(0, 8)
    .map(({ node, users }) => ({
      id: `shared:${node.id}`,
      kind: 'shared' as const,
      title: node.name || node.type,
      detail: `Used by ${users} entities · …${node.id.slice(-6)}`,
      fidelity: 'EXACT' as Fidelity,
      entityId: node.id,
      why: `Edits to this ${node.type} affect ${users} entities`,
    }));

const frames: Question['run'] = (lens) => {
  const snapshot = lens.query<Result<PlatformSnapshot>>('platform_snapshot', {
    context_id: lens.getActiveContext()?.id,
    limit: 120,
  })?.data;
  const timed = (snapshot?.frames ?? []).filter((frame) => frame.cpu_ms !== null);
  if (timed.length < 8) return [];
  const sorted = timed.map((frame) => frame.cpu_ms!).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return timed
    .filter((frame) => frame.cpu_ms! > Math.max(median * 2, median + 0.5))
    .sort((a, b) => b.cpu_ms! - a.cpu_ms!)
    .slice(0, 5)
    .map((frame) => ({
      id: `frame:${frame.frame}`,
      kind: 'frame' as const,
      title: `Frame ${frame.frame}`,
      detail: `${frame.cpu_ms!.toFixed(2)} ms vs ${median.toFixed(2)} ms median · renderer-level`,
      fidelity: frame.cpu_fidelity,
      reason: 'Only renderer-level CPU time is observed; it is not attributed to individual objects.',
      entityId: frame.entity_ids[0] ?? frame.pass_ids[0] ?? allNodes(lens, ['scene'])[0]?.id ?? '',
      why: `${(frame.cpu_ms! / median).toFixed(1)}× the median frame CPU time`,
    }))
    .filter((insight) => insight.entityId);
};

export const QUESTIONS: Question[] = [
  { id: 'changed', label: 'What changed since the baseline?', hint: 'Diff', run: changed },
  { id: 'heaviest', label: 'What uses the most memory?', hint: 'Memory', run: heaviest },
  { id: 'unreferenced', label: 'What leaked or was disposed?', hint: 'Lifecycle', run: unreferenced },
  { id: 'shared', label: 'What is shared by many entities?', hint: 'Relations', run: shared },
  { id: 'frames', label: 'Which frames were slow?', hint: 'Timeline', run: frames },
];

/** The ranked "worth looking at" list: most actionable questions first, bounded. */
export function worthLookingAt(lens: Lens, baselineSet: boolean): Insight[] {
  const order = ['changed', 'unreferenced', 'frames', 'heaviest', 'shared'];
  const out: Insight[] = [];
  for (const id of order) {
    const question = QUESTIONS.find((candidate) => candidate.id === id)!;
    out.push(...question.run(lens, baselineSet).slice(0, id === 'heaviest' ? 4 : 3));
  }
  return out;
}

export function searchEntities(lens: Lens, query: string, limit = 8): Node[] {
  const text = query.trim();
  if (!text) return [];
  return lens.query<Result<Node[]>>('search_nodes', { search: text, limit })?.data ?? [];
}

/** Estimated-storage delta for an entity between baseline and now (same fidelity both sides). */
export function storageDelta(change: EntityChange):
  | { before: number; after: number; fidelity: Fidelity }
  | undefined {
  const before = props(change.before ?? undefined);
  const after = props(change.after ?? undefined);
  if (typeof before.memory_bytes !== 'number' || typeof after.memory_bytes !== 'number') return undefined;
  if (before.memory_fidelity === 'UNAVAILABLE' || after.memory_fidelity === 'UNAVAILABLE') return undefined;
  if (before.memory_bytes === after.memory_bytes) return undefined;
  const fidelity: Fidelity =
    before.memory_fidelity === 'EXACT' && after.memory_fidelity === 'EXACT' ? 'EXACT' : 'ESTIMATED';
  return { before: before.memory_bytes, after: after.memory_bytes, fidelity };
}
