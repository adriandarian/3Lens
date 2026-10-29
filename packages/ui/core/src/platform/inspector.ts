import type { Node, Fidelity, PlatformSnapshot } from '@3lens/kernel';
import type { PlatformViewContext, PlatformTool } from './types';
import { formatBytes, uiDom } from './dom';

type Result<T> = { data: T; fidelity: Fidelity };
type Change = {
  entity_id: string;
  before: Node | null;
  after: Node | null;
  changes: string[];
};
type Cost = {
  fidelity: Fidelity;
  reason: string;
  chain: {
    from_entity: string;
    to_entity: string;
    edge_type: string;
    weight: number;
  }[];
};
export interface InspectorOptions {
  tool: PlatformTool;
  fidelity: 'all' | 'exact';
  tab: string;
  setTab(tab: string): void;
  baseline(): void;
  exportTrace(): void;
  compare(): void;
  memory(): void;
  readonly?: boolean;
  comparison?: {
    entityId: string;
    before: unknown;
    after: unknown;
    changes: string[];
  };
}

export function renderInspector(
  context: PlatformViewContext,
  snapshot: PlatformSnapshot,
  options: InspectorOptions
) {
  const { lens } = context;
  const { el, icon, button, badge } = uiDom(context.document);
  const root = el('aside', undefined, 'tlp-inspector tl-detail');
  root.dataset.scrollKey = 'inspector';
  root.setAttribute('aria-label', 'Entity inspector');
  const head = el('div', undefined, 'tlp-inspector-header');
  head.append(
    el('strong', 'Inspector'),
    el('span', 'Shared selection', 'tlp-muted')
  );
  root.append(head);
  const selected = lens.getSelection().entity_ids;
  const node =
    (context.selectedId ? lens.getNode(context.selectedId) : undefined) ??
    (options.comparison && options.comparison.entityId === context.selectedId
      ? ((options.comparison.after ?? options.comparison.before) as Node)
      : undefined);
  if (!node) {
    const empty = el('div', undefined, 'tlp-empty');
    empty.append(
      icon('pick'),
      el('h2', 'What would you like to investigate?'),
      el(
        'p',
        'Choose a captured entity or pick an object in the application. The same selection follows you across tools.'
      )
    );
    root.append(empty);
    return root;
  }
  const values = node as unknown as Record<string, unknown>;
  function link(id: string, label?: string) {
    const target = lens.getNode(id);
    const value = button(
      label ?? target?.name ?? target?.type ?? id,
      () => context.select(id),
      undefined,
      'tlp-link tl-entity-link'
    );
    value.dataset.entityId = id;
    value.title = id;
    return value;
  }
  function section(title: string, symbol?: string) {
    const box = el('section', undefined, 'tlp-inspector-section');
    const heading = el('h3');
    if (symbol) heading.append(icon(symbol));
    heading.append(el('span', title));
    box.append(heading);
    root.append(box);
    return box;
  }
  const title = section('Identity', 'cube');
  const name = el('div', undefined, 'tlp-identity-name');
  name.append(icon('cube'), el('span', node.name || node.type));
  title.append(name);
  const identity = el('dl', undefined, 'tlp-key-value');
  for (const [key, value] of [
    ['ID', node.id],
    ['Type', String(values.object_type ?? values.material_type ?? node.type)],
    ['Context', node.context_id],
    ['Origin', node.origin],
  ]) {
    identity.append(el('dt', key));
    const dd = el('dd');
    dd.append(key === 'ID' ? el('code', value) : el('span', value));
    identity.append(dd);
  }
  title.append(identity);
  if (selected.length > 1)
    title.append(
      el(
        'p',
        `${selected.length} entities selected; showing ${node.name || node.type}.`,
        'tlp-caption'
      )
    );
  const compared =
    options.comparison?.entityId === node.id ? options.comparison : undefined;
  const observedChanges = lens.query<Result<Change[]>>('entity_changes', {
    entity_id: node.id,
  })?.data[0];
  if (options.tool === 'changes' && (compared || observedChanges)) {
    const change = compared ?? observedChanges!;
    const before = change.before as unknown as Record<string, unknown> | null;
    const after = change.after as unknown as Record<string, unknown> | null;
    const sectionNode = section('Before → After', 'changes');
    const table = el('dl', undefined, 'tlp-key-value');
    for (const key of change.changes.slice(0, 6)) {
      table.append(
        el('dt', key),
        el(
          'dd',
          `${JSON.stringify(before?.[key]) ?? 'absent'} → ${JSON.stringify(after?.[key]) ?? 'absent'}`
        )
      );
    }
    sectionNode.append(table);
  }
  const tabs = el('div', undefined, 'tlp-inspector-tabs');
  for (const tab of ['Overview', 'Resources', 'Where used']) {
    const b = button(tab, () => options.setTab(tab));
    b.dataset.active = String(options.tab === tab);
    tabs.append(b);
  }
  root.append(tabs);
  if (options.tab === 'Overview') {
    const detail = el('details');
    detail.append(
      el('summary', 'Captured properties'),
      el('pre', JSON.stringify(node, null, 2))
    );
    title.append(detail);
  }
  const graph = lens.getGraph();
  const relations = section('Relationships', 'link');
  for (const [label, edges] of [
    ['Uses / outgoing', graph.getOutgoingEdges(node.id)],
    ['Used by / incoming', graph.getIncomingEdges(node.id)],
  ] as const) {
    if (options.tab === 'Resources' && label.startsWith('Used')) continue;
    const expanded = options.tab === 'Where used';
    const details = el('details');
    details.open = expanded;
    if (label.startsWith('Used')) {
      details.append(el('summary', `${label} (${edges.length})`));
      relations.append(details);
    } else relations.append(el('h4', label));
    const container = label.startsWith('Used')
      ? details
      : el('div', undefined, 'tlp-relation-group');
    if (!label.startsWith('Used')) relations.append(container);
    const filtered =
      options.tab === 'Resources'
        ? edges.filter((edge) => edge.type === 'uses')
        : edges;
    for (const edge of filtered.slice(0, expanded ? 12 : 4)) {
      const row = el('div', undefined, 'tlp-relation');
      row.append(
        el('span', edge.type),
        link(edge.from === node.id ? edge.to : edge.from)
      );
      container.append(row);
    }
    if (!filtered.length)
      container.append(
        el('p', 'No captured relationships in this direction.', 'tlp-muted')
      );
    if (filtered.length > (expanded ? 12 : 4)) {
      const show = button(`Show all ${filtered.length} relationships`, () => {
        rowList.hidden = !rowList.hidden;
      });
      const rowList = el('div');
      rowList.hidden = true;
      for (const edge of filtered.slice(expanded ? 12 : 4))
        rowList.append(link(edge.from === node.id ? edge.to : edge.from));
      container.append(show, rowList);
    }
  }
  const shader = snapshot.shaders.find((value) => value.entity_id === node.id);
  if (shader) {
    const source = section('Shader variant', 'shaders');
    const list = el('dl', undefined, 'tlp-key-value');
    list.append(
      el('dt', 'Source'),
      el(
        'dd',
        shader.fragment_source || shader.vertex_source
          ? 'Captured at runtime'
          : 'Not captured'
      ),
      el('dt', 'Compile time')
    );
    const compile = el('dd');
    compile.append(
      badge(shader.compile_fidelity, 'No compilation timer was recorded')
    );
    list.append(compile);
    source.append(list);
    source.append(el('p', 'Defines', 'tlp-caption'));
    const defines = el(
      'pre',
      Object.keys(shader.defines).slice(0, 10).join('\n') ||
        'No captured feature defines'
    );
    source.append(defines);
    const users = el('div', undefined, 'tlp-actions');
    for (const id of shader.material_ids.slice(0, 6)) users.append(link(id));
    source.append(users);
    if (shader.material_ids.length > 6) {
      const details = el('details');
      details.append(
        el('summary', `Show all ${shader.material_ids.length} material users`)
      );
      for (const id of shader.material_ids.slice(6)) details.append(link(id));
      source.append(details);
    }
  }
  const costs = section('What does it cost?', 'performance');
  const resources =
    lens.query<Result<Node[]>>('resources_used_by', { entity_id: node.id })
      ?.data ?? [];
  const allocations = [node, ...resources].filter(
    (value, index, all) =>
      'memory_bytes' in value &&
      all.findIndex((candidate) => candidate.id === value.id) === index
  );
  let shown = 0;
  for (const resource of allocations) {
    if (!('memory_bytes' in resource)) continue;
    const fidelity = resource.memory_fidelity;
    if (options.fidelity === 'exact' && fidelity !== 'EXACT') continue;
    shown++;
    const row = el('div', undefined, 'tlp-metric tl-metric');
    const reason = (resource as unknown as { memory_reason?: string })
      .memory_reason;
    row.append(
      link(
        resource.id,
        fidelity === 'UNAVAILABLE'
          ? `Storage unavailable | ${resource.name || resource.type}`
          : `${formatBytes(resource.memory_bytes)} | ${resource.name || resource.type}`
      ),
      badge(fidelity, reason)
    );
    costs.append(
      row,
      el(
        'p',
        'Resource total, shared across captured users; not an exclusive per-object allocation.',
        'tlp-cost-reason'
      )
    );
    const cost = lens.query<Result<Cost>>('resource_cost', {
      entity_id: resource.id,
    })?.data;
    if (cost && options.fidelity !== 'exact') {
      costs.append(badge(cost.fidelity, cost.reason));
      for (const edge of cost.chain.slice(0, 5)) {
        const path = el('div', undefined, 'tlp-relation');
        path.append(
          link(edge.from_entity),
          el('span', `${edge.edge_type} →`),
          link(edge.to_entity),
          el('span', `${(edge.weight * 100).toFixed(1)}% share`)
        );
        costs.append(path);
      }
    }
  }
  if (!allocations.length)
    costs.append(
      el(
        'p',
        'No resource storage measurement was captured for this entity.',
        'tlp-muted'
      )
    );
  if (allocations.length && !shown)
    costs.append(
      el(
        'p',
        'No EXACT resource measurements were captured. Choose All fidelity to inspect estimates.',
        'tlp-muted'
      )
    );
  const frame =
    snapshot.frames.find((value) => value.frame === context.frame) ??
    snapshot.frames.at(-1);
  if (
    frame &&
    (node.type === 'renderer' || node.type === 'scene' || node.type === 'pass')
  ) {
    const metric = el('div', undefined, 'tlp-metric');
    metric.append(
      link(
        node.id,
        `CPU submit ${frame.cpu_ms === null ? 'unavailable' : `${frame.cpu_ms.toFixed(2)} ms`}`
      ),
      badge(
        frame.cpu_fidelity,
        'Wall time around the observed render call, not GPU execution time'
      )
    );
    costs.append(metric);
    if (frame.draw_calls !== null) {
      const row = el('div', undefined, 'tlp-metric');
      row.append(
        link(
          frame.entity_ids[0] ?? node.id,
          `Draw calls ${frame.draw_calls.toLocaleString()}`
        ),
        badge(frame.metrics_fidelity)
      );
      costs.append(row);
    }
  }
  if (options.fidelity !== 'exact') {
    for (const label of ['Per-entity GPU time', 'Per-entity CPU time']) {
      const row = el('div', undefined, 'tlp-metric');
      row.append(
        el('span', label),
        badge('UNAVAILABLE', 'No authoritative per-entity timer was captured.')
      );
      costs.append(row);
    }
    costs.append(
      el(
        'p',
        'No per-entity timer captured. CPU submission timing is not GPU timing.',
        'tlp-cost-reason'
      )
    );
  }
  const history = section('What changed?', 'changes');
  const changes =
    lens.query<Result<Change[]>>('entity_changes', { entity_id: node.id })
      ?.data ?? [];
  if (options.comparison?.entityId === node.id) {
    const comp = options.comparison;
    const before = comp.before as Record<string, unknown> | null;
    const after = comp.after as Record<string, unknown> | null;
    changes.splice(0, changes.length, {
      entity_id: node.id,
      before: before as unknown as Node,
      after: after as unknown as Node,
      changes: comp.changes,
    });
  }
  if (!changes.length)
    history.append(
      el('p', 'No captured changes against the baseline.', 'tlp-muted')
    );
  for (const change of changes) {
    const block = el('div', undefined, 'tlp-change');
    block.append(link(change.entity_id), badge('EXACT'));
    for (const key of change.changes)
      block.append(
        el(
          'p',
          `${key}: ${JSON.stringify((change.before as unknown as Record<string, unknown>)?.[key]) ?? 'absent'} -> ${JSON.stringify((change.after as unknown as Record<string, unknown>)?.[key]) ?? 'absent'}`
        )
      );
    history.append(block);
  }
  const actions = section('What can I do?', 'focus');
  const buttons = el('div', undefined, 'tlp-actions');
  const focus = button(
    'Focus entity',
    () =>
      context.notify(
        lens.focus(node.id)
          ? 'Camera focused on selected entity.'
          : 'Focus unavailable for this entity or offline trace.'
      ),
    'focus'
  );
  const highlight = button(
    'Highlight',
    () =>
      context.notify(
        lens.highlight(node.id)
          ? 'Selection bounds enabled.'
          : 'Highlight unavailable for this entity or offline trace.'
      ),
    'cube'
  );
  focus.disabled = highlight.disabled =
    lens.getMode() === 'offline' || !!options.readonly;
  buttons.append(focus, highlight);
  const material =
    resources.find((resource) => resource.type === 'material') ??
    (shader?.material_ids[0]
      ? lens.getNode(shader.material_ids[0])
      : undefined);
  const follow = button(
    'Follow material',
    () => material && context.select(material.id),
    'link'
  );
  follow.disabled = !material;
  buttons.append(follow);
  buttons.append(
    button('Set baseline', options.baseline, 'flag'),
    button('Compare selection', options.compare, 'changes'),
    button('Export trace', options.exportTrace, 'export')
  );
  if (
    ['geometry', 'material', 'texture', 'render_target'].includes(node.type)
  ) {
    const users = graph
      .getIncomingEdges(node.id, 'uses')
      .map((edge) => edge.from);
    const find = button(
      'Find users',
      () => {
        lens.select([...new Set(users)], { source: 'query_result' });
        context.notify(
          `${new Set(users).size} captured resource users selected.`
        );
        context.refresh();
      },
      'search'
    );
    find.disabled = !users.length;
    buttons.append(find, button('Compare lifetime', options.memory, 'clock'));
    const raw =
      snapshot.assets.find((asset) => asset.entity_id === node.id)?.url ??
      values.url ??
      values.source_url;
    let safeUrl: string | undefined;
    try {
      if (typeof raw === 'string') {
        const parsed = new URL(raw, context.document.baseURI);
        if (['http:', 'https:', 'blob:'].includes(parsed.protocol))
          safeUrl = parsed.href;
      }
    } catch {}
    if (safeUrl) {
      const open = el('a', 'Open source URL', 'tlp-btn');
      open.href = safeUrl;
      open.target = '_blank';
      open.rel = 'noopener noreferrer';
      buttons.append(open);
    }
  }
  actions.append(buttons);
  return root;
}
