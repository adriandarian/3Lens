import type { Fidelity, Node, PlatformSnapshot } from '@3lens/kernel';
import type { PlatformViewContext } from './types';

type AnalysisKind = 'performance' | 'memory' | 'shaders';
type ResourceCost = {
  fidelity: Fidelity;
  reason: string;
  chain: {
    from_entity: string;
    to_entity: string;
    weight: number;
    edge_type: string;
  }[];
};
type ViewState = {
  resourceSearch: string;
  resourceKind: string;
  resourceFidelity: string;
  shaderSearch: string;
  sourceStage: 'fragment' | 'vertex';
  baselineCpu: number | null;
  baselineFrame: number | null;
};
const states = new WeakMap<object, ViewState>();

function stateFor(context: PlatformViewContext): ViewState {
  let state = states.get(context.lens);
  if (!state) {
    state = {
      resourceSearch: '',
      resourceKind: 'all',
      resourceFidelity: 'all',
      shaderSearch: '',
      sourceStage: 'fragment',
      baselineCpu: null,
      baselineFrame: null,
    };
    states.set(context.lens, state);
  }
  return state;
}

/** Analysis is a projection of kernel data. The UI never reads renderer objects. */
export function renderAnalysisView(
  kind: AnalysisKind,
  context: PlatformViewContext
): HTMLElement {
  const state = stateFor(context);
  const document = context.document;
  const el = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    text?: string,
    className?: string
  ) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const button = (text: string, action: () => void, className = 'tlp-btn') => {
    const node = el('button', text, className);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  };
  const badge = (fidelity: Fidelity, reason?: string) => {
    const node = el('span', fidelity, 'tlp-badge');
    node.dataset.fidelity = fidelity;
    node.title =
      reason ??
      (fidelity === 'EXACT'
        ? 'Directly observed capture data'
        : 'The capture does not contain an authoritative measurement.');
    return node;
  };
  const entity = (id: string, label?: string) => {
    const node = context.lens.getNode(id);
    const control = button(
      label ?? node?.name ?? id,
      () => context.select(id),
      'tlp-entity-link'
    );
    control.dataset.entityId = id;
    control.title = id;
    return control;
  };
  const section = (title: string, subtitle?: string) => {
    const card = el('section', undefined, 'tlp-card tlpa-card');
    const head = el('div', undefined, 'tlpa-card-head');
    head.append(el('h2', title, 'tlp-section-title'));
    if (subtitle) head.append(el('span', subtitle, 'tlp-muted'));
    card.append(head);
    return card;
  };
  const table = (headers: string[]) => {
    const wrapper = el('div', undefined, 'tlpa-table-scroll');
    const value = el('table', undefined, 'tlp-table');
    const head = el('thead');
    const row = el('tr');
    headers.forEach((header) => row.append(el('th', header)));
    head.append(row);
    const body = el('tbody');
    value.append(head, body);
    wrapper.append(value);
    return { wrapper, body };
  };
  const cell = (row: HTMLTableRowElement, value: string | HTMLElement) => {
    const column = el('td');
    column.append(
      typeof value === 'string' ? document.createTextNode(value) : value
    );
    row.append(column);
    return column;
  };
  const rowSelected = (row: HTMLTableRowElement, id: string) => {
    row.dataset.entityId = id;
    row.classList.toggle('is-selected', id === context.selectedId);
  };
  const metric = (
    value: number | null | undefined,
    suffix: string,
    fidelity: Fidelity,
    reason?: string
  ) => {
    const wrap = el('span', undefined, 'tlpa-measurement');
    wrap.append(
      el(
        'span',
        value === null || value === undefined || fidelity === 'UNAVAILABLE'
          ? '—'
          : `${formatNumber(value)}${suffix}`,
        'tlpa-number'
      ),
      badge(
        value === null || value === undefined ? 'UNAVAILABLE' : fidelity,
        reason
      )
    );
    return wrap;
  };
  const input = (
    placeholder: string,
    value: string,
    onInput: (value: string) => void
  ) => {
    const control = el('input', undefined, 'tlpa-search');
    control.type = 'search';
    control.placeholder = placeholder;
    control.value = value;
    control.setAttribute('aria-label', placeholder);
    control.addEventListener('input', () => onInput(control.value));
    return control;
  };
  const select = (
    label: string,
    values: [string, string][],
    current: string,
    onChange: (value: string) => void
  ) => {
    const control = el('select');
    control.setAttribute('aria-label', label);
    values.forEach(([value, text]) => {
      const option = el('option', text);
      option.value = value;
      control.append(option);
    });
    control.value = current;
    control.addEventListener('change', () => onChange(control.value));
    return control;
  };

  const active = context.lens.getActiveContext()?.id;
  const data = context.lens.query<{ data: PlatformSnapshot }>(
    'platform_snapshot',
    { context_id: active, limit: 180 }
  )?.data;
  const empty = {
    frames: [],
    events: [],
    resources: [],
    assets: [],
    shaders: [],
    passes: [],
    pipeline_edges: [],
    dropped_events: 0,
    reasons: [],
  };
  const snapshot = data ?? (empty as unknown as PlatformSnapshot);
  const root = el('div', undefined, `tlpa-analysis tlpa-${kind}`);
  root.dataset.analysis = kind;
  if (kind === 'performance') renderPerformance();
  if (kind === 'memory') renderMemory();
  if (kind === 'shaders') renderShaders();
  return root;

  function renderPerformance() {
    const frames = snapshot.frames;
    const selectedFrame =
      frames.find((frame) => frame.frame === context.frame) ?? frames.at(-1);
    const timeline = section(
      'Frame time timeline',
      frames.length
        ? `Frames ${frames[0].frame}–${frames.at(-1)!.frame}`
        : 'Awaiting captured rendering work'
    );
    const legend = el('div', undefined, 'tlpa-legend');
    legend.append(
      el('span', '● CPU submit (main thread)', 'tlpa-teal'),
      badge(
        frames.some((frame) => frame.cpu_ms !== null) ? 'EXACT' : 'UNAVAILABLE',
        'Wall-clock duration observed around renderer.render when present. Frame grouping can be estimated; individual bars carry their source fidelity.'
      ),
      el('span', '○ GPU unavailable (no timer data)', 'tlp-muted')
    );
    timeline.append(legend);
    const chart = el('div', undefined, 'tlpa-frame-chart');
    chart.setAttribute(
      'aria-label',
      'CPU submission timing by captured render frame'
    );
    const maximum = Math.max(16.7, ...frames.map((frame) => frame.cpu_ms ?? 0));
    const axis = el('div', undefined, 'tlpa-y-axis');
    [1, 0.75, 0.5, 0.25, 0].forEach((ratio) =>
      axis.append(el('span', `${(maximum * ratio).toFixed(1)}`))
    );
    const plot = el('div', undefined, 'tlpa-frame-plot');
    for (let index = 0; index < 4; index++)
      plot.append(el('i', undefined, 'tlpa-gridline'));
    const bars = el('div', undefined, 'tlpa-frame-bars');
    frames.slice(-140).forEach((frame) => {
      const bar = button(
        '',
        () => {
          context.setFrame?.(frame.frame);
          if (frame.entity_ids[0]) context.select(frame.entity_ids[0]);
          context.refresh();
        },
        'tlpa-frame-bar'
      );
      bar.dataset.frame = String(frame.frame);
      bar.dataset.fidelity =
        frame.cpu_ms === null ? 'UNAVAILABLE' : frame.cpu_fidelity;
      if (!context.cspSafe)
        bar.style.height = `${frame.cpu_ms === null ? 2 : Math.max(1.2, Math.min(100, (frame.cpu_ms / maximum) * 100))}%`;
      bar.classList.toggle('is-selected', frame.frame === selectedFrame?.frame);
      bar.title = `Frame ${frame.frame}: ${frame.cpu_ms === null ? 'CPU time unavailable' : `${frame.cpu_ms.toFixed(3)} ms CPU submit · ${frame.cpu_fidelity}`} · frame grouping ${frame.fidelity}`;
      bar.setAttribute('aria-label', bar.title);
      bars.append(bar);
    });
    if (!frames.length)
      bars.append(
        el(
          'p',
          'No render timing events in this capture.',
          'tlpa-chart-empty tlp-muted'
        )
      );
    plot.append(bars);
    chart.append(axis, plot);
    timeline.append(chart);
    const xAxis = el('div', undefined, 'tlpa-x-axis');
    if (frames.length)
      [
        frames[0],
        frames[Math.floor(frames.length / 2)],
        frames.at(-1)!,
      ].forEach((frame) => xAxis.append(el('span', String(frame.frame))));
    timeline.append(
      xAxis,
      el(
        'p',
        'ms · CPU wall time is observed; application frame boundaries are inferred from render calls.',
        'tlpa-footnote tlp-muted'
      )
    );
    root.append(timeline);

    const work = section(
      'Rendering work',
      selectedFrame
        ? `Frame ${selectedFrame.frame} · click an entity to inspect its capture`
        : 'No frame selected'
    );
    const grid = table([
      'Entity',
      'CPU submit',
      'Draw calls',
      'Triangles',
      'Fidelity',
    ]);
    const passes = snapshot.passes;
    if (passes.length)
      for (const pass of passes) {
        const row = el('tr');
        rowSelected(row, pass.entity_id);
        cell(row, entity(pass.entity_id, pass.name));
        cell(
          row,
          metric(
            pass.cpu_ms,
            ' ms',
            pass.cpu_ms === null ? 'UNAVAILABLE' : pass.cpu_fidelity,
            pass.reason
          )
        );
        cell(
          row,
          metric(pass.draw_calls, '', pass.metrics_fidelity, pass.reason)
        );
        cell(
          row,
          metric(pass.triangles, '', pass.metrics_fidelity, pass.reason)
        );
        cell(row, badge(pass.fidelity, pass.reason));
        grid.body.append(row);
      }
    else if (selectedFrame) {
      const row = el('tr');
      const id = selectedFrame.entity_ids[0];
      cell(
        row,
        id
          ? entity(id, context.lens.getNode(id)?.name ?? 'Captured render')
          : 'Captured render'
      );
      cell(
        row,
        metric(selectedFrame.cpu_ms, ' ms', selectedFrame.cpu_fidelity)
      );
      cell(
        row,
        metric(selectedFrame.draw_calls, '', selectedFrame.metrics_fidelity)
      );
      cell(
        row,
        metric(selectedFrame.triangles, '', selectedFrame.metrics_fidelity)
      );
      cell(
        row,
        badge(
          selectedFrame.fidelity,
          'Frame grouping inferred from the render call. Pass-level segmentation is unavailable.'
        )
      );
      grid.body.append(row);
    } else {
      const row = el('tr');
      cell(row, 'Render / pass attribution');
      cell(row, metric(null, ' ms', 'UNAVAILABLE'));
      cell(row, '—');
      cell(row, '—');
      cell(row, badge('UNAVAILABLE', 'No rendering events were captured.'));
      grid.body.append(row);
    }
    work.append(grid.wrapper);
    root.append(work);

    const causal = section(
      'Causal path',
      'Observed rendering relationships · no inferred per-object GPU costs'
    );
    const path = el('div', undefined, 'tlpa-path');
    const origin = selectedFrame?.entity_ids[0] ?? context.selectedId;
    const pathNode = (id: string, description: string) => {
      const block = el('div', undefined, 'tlpa-path-node');
      block.append(entity(id), el('small', description, 'tlp-muted'));
      return block;
    };
    if (selectedFrame) {
      const frame = el('div', undefined, 'tlpa-path-node');
      frame.append(
        el('strong', `Frame ${selectedFrame.frame}`),
        metric(selectedFrame.cpu_ms, ' ms', selectedFrame.cpu_fidelity)
      );
      path.append(frame);
    }
    if (origin) {
      path.append(
        el('span', '→', 'tlpa-path-arrow'),
        pathNode(origin, 'Captured render source')
      );
      const graph = context.lens.getGraph();
      let cursor = origin;
      for (let step = 0; step < 2; step++) {
        const relations = graph
          .getOutgoingEdges(cursor)
          .filter((edge) =>
            ['uses', 'references', 'contains', 'renders_with'].includes(
              edge.type
            )
          );
        const relation =
          relations.find((edge) => edge.type === 'uses') ??
          relations.find(
            (edge) =>
              (graph.getNode(edge.to) as unknown as { object_type?: string })
                ?.object_type === 'Mesh'
          ) ??
          relations[0];
        if (!relation) break;
        path.append(
          el('span', '→', 'tlpa-path-arrow'),
          pathNode(relation.to, `Observed ${relation.type} relationship`)
        );
        cursor = relation.to;
      }
    }
    if (!origin)
      path.append(
        el(
          'p',
          'Select captured rendering work to follow its responsible entities.',
          'tlp-muted'
        )
      );
    causal.append(
      path,
      badge(
        'UNAVAILABLE',
        'This capture does not contain per-object CPU/GPU timing attribution.'
      ),
      el(
        'p',
        'Per-object timing attribution is unavailable. Entity relationships show usage, not a fabricated share of GPU time.',
        'tlpa-footnote tlp-muted'
      )
    );
    root.append(causal);

    const comparison = section('Before / After comparison');
    const comparisonGrid = el('div', undefined, 'tlpa-comparison-grid');
    const controls = el('div', undefined, 'tlpa-comparison-controls');
    controls.append(
      el(
        'span',
        state.baselineFrame === null
          ? 'No timing baseline saved'
          : `Baseline · Frame ${state.baselineFrame}`,
        'tlp-muted'
      ),
      button('Set timing baseline', () => {
        state.baselineCpu = selectedFrame?.cpu_ms ?? null;
        state.baselineFrame = selectedFrame?.frame ?? null;
        context.lens.captureBaseline();
        context.notify(
          selectedFrame
            ? `Timing baseline saved at frame ${selectedFrame.frame}.`
            : 'No captured frame is available for a timing baseline.'
        );
        context.refresh();
      })
    );
    const comparisons = el('div', undefined, 'tlpa-compare-bars');
    const ceiling = Math.max(
      1,
      state.baselineCpu ?? 0,
      selectedFrame?.cpu_ms ?? 0
    );
    for (const [label, value, className] of [
      ['Before', state.baselineCpu, ''],
      ['After', selectedFrame?.cpu_ms ?? null, 'is-after'],
    ] as const) {
      const line = el('div', undefined, 'tlpa-compare-line');
      const track = el('span', undefined, 'tlpa-compare-track');
      const fill = el('i', undefined, className);
      if (!context.cspSafe)
        fill.style.width = `${value === null ? 0 : (value / ceiling) * 100}%`;
      track.append(fill);
      line.append(
        el('span', label),
        track,
        metric(value, ' ms', value === null ? 'UNAVAILABLE' : 'EXACT')
      );
      comparisons.append(line);
    }
    const caveat = el('div', undefined, 'tlpa-caution');
    caveat.append(
      el('strong', 'CPU timing is not GPU timing'),
      el(
        'p',
        'These observations measure CPU submission wall time. GPU timer data is unavailable in this capture.'
      )
    );
    comparisonGrid.append(controls, comparisons, caveat);
    comparison.append(comparisonGrid);
    root.append(comparison);
  }

  function renderMemory() {
    const resources = snapshot.resources;
    const timeline = section(
      'Resource lifecycle',
      'Observed creation, reuse, and explicit disposal'
    );
    const timelineTop = el('div', undefined, 'tlpa-memory-total');
    const measured = resources.filter(
      (resource) =>
        resource.state !== 'disposed' &&
        resource.memory_bytes !== null &&
        resource.memory_fidelity !== 'UNAVAILABLE'
    );
    const total = measured.reduce(
      (sum, resource) => sum + (resource.memory_bytes ?? 0),
      0
    );
    timelineTop.append(
      el('span', 'Captured resource storage', 'tlp-muted'),
      el('strong', measured.length ? bytes(total) : '—'),
      badge(
        measured.length ? 'ESTIMATED' : 'UNAVAILABLE',
        'CPU buffer / image storage estimates exclude driver allocation. Only captured resources are included.'
      )
    );
    timeline.append(timelineTop);
    const retention = el('div', undefined, 'tlpa-storage-history');
    const historyLabel = el('div', undefined, 'tlpa-storage-history-label');
    historyLabel.append(
      el('strong', 'Estimated storage'),
      el('span', 'Captured checkpoints', 'tlp-muted')
    );
    retention.append(historyLabel);
    const history = memoryHistory();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 92');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute(
      'aria-label',
      'Estimated storage at captured graph checkpoints'
    );
    for (const y of [14, 44, 74]) {
      const line = document.createElementNS(svg.namespaceURI, 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('x2', '800');
      line.setAttribute('y1', String(y));
      line.setAttribute('y2', String(y));
      line.setAttribute('class', 'tlpa-svg-grid');
      svg.append(line);
    }
    if (history.length > 1) {
      const maximum = Math.max(...history.map((item) => item.bytes), 1);
      const path = document.createElementNS(svg.namespaceURI, 'polyline');
      path.setAttribute(
        'points',
        history
          .map(
            (item, index) =>
              `${(index / (history.length - 1)) * 800},${82 - (item.bytes / maximum) * 64}`
          )
          .join(' ')
      );
      path.setAttribute('class', 'tlpa-svg-storage');
      svg.append(path);
    } else {
      const text = document.createElementNS(svg.namespaceURI, 'text');
      text.setAttribute('x', '12');
      text.setAttribute('y', '52');
      text.setAttribute('class', 'tlpa-svg-empty');
      text.textContent =
        'Storage history unavailable until multiple graph checkpoints are captured.';
      svg.append(text);
    }
    retention.append(svg);
    timeline.append(retention);
    const lanes = el('div', undefined, 'tlpa-lifecycle-lanes');
    const allTimes = resources.flatMap((resource) =>
      [resource.created_at, resource.disposed_at].filter(
        (value): value is number => value !== null
      )
    );
    const start = Math.min(...allTimes, snapshot.frames[0]?.timestamp ?? 0);
    const end = Math.max(
      ...allTimes,
      snapshot.frames.at(-1)?.timestamp ?? start + 1
    );
    const span = Math.max(1, end - start);
    for (const resource of resources.slice(0, 4)) {
      const lane = el('div', undefined, 'tlpa-lifecycle-lane');
      lane.append(entity(resource.entity_id, resource.name));
      const track = el('div', undefined, 'tlpa-lifecycle-track');
      if (resource.created_at !== null) {
        const begin = Math.max(
          0,
          Math.min(98, ((resource.created_at - start) / span) * 100)
        );
        const finish =
          resource.disposed_at === null
            ? 100
            : Math.max(
                begin + 1,
                Math.min(100, ((resource.disposed_at - start) / span) * 100)
              );
        const bar = button(
          '',
          () => context.select(resource.entity_id),
          'tlpa-lifecycle-bar'
        );
        if (!context.cspSafe) {
          bar.style.left = `${begin}%`;
          bar.style.width = `${finish - begin}%`;
        }
        bar.title = `${resource.name}: first observed ${resource.created_at.toFixed(1)} ms${resource.disposed_at === null ? ', no explicit disposal observed' : `, disposed ${resource.disposed_at.toFixed(1)} ms`}`;
        bar.setAttribute('aria-label', bar.title);
        if (resource.disposed_at !== null) bar.classList.add('is-disposed');
        track.append(bar);
      } else
        track.append(
          el('span', 'Lifetime unavailable in retained events', 'tlp-muted')
        );
      lane.append(track);
      lanes.append(lane);
    }
    if (!resources.length)
      lanes.append(
        el(
          'p',
          'No resource entities were captured. Resource lifetimes are unavailable.',
          'tlp-muted'
        )
      );
    timeline.append(lanes);
    const legend = el('div', undefined, 'tlpa-legend');
    legend.append(
      el('span', '● First observed', 'tlpa-green'),
      el('span', '━ Referenced', 'tlpa-blue'),
      el('span', '● Explicit disposal', 'tlpa-red'),
      badge(
        'ESTIMATED',
        'A preexisting resource starts at first observation, not necessarily allocation time.'
      )
    );
    timeline.append(legend);
    root.append(timeline);

    const resourcesCard = section('Resources');
    const tools = el('div', undefined, 'tlpa-table-tools');
    tools.append(
      input('Search resources…', state.resourceSearch, (value) => {
        state.resourceSearch = value;
        renderResourceRows();
      }),
      select(
        'Resource kind',
        [
          ['all', 'All kinds'],
          ['geometry', 'Geometry'],
          ['texture', 'Textures'],
          ['material', 'Materials'],
          ['render_target', 'Render targets'],
        ],
        state.resourceKind,
        (value) => {
          state.resourceKind = value;
          renderResourceRows();
        }
      ),
      select(
        'Resource measurement fidelity',
        [
          ['all', 'All fidelity'],
          ['EXACT', 'EXACT only'],
          ['ESTIMATED', 'ESTIMATED'],
          ['UNAVAILABLE', 'UNAVAILABLE'],
        ],
        state.resourceFidelity,
        (value) => {
          state.resourceFidelity = value;
          renderResourceRows();
        }
      )
    );
    resourcesCard.querySelector('.tlpa-card-head')!.append(tools);
    const grid = table([
      'Name',
      'Kind',
      'Estimated bytes',
      'Users',
      'State',
      'Fidelity',
    ]);
    resourcesCard.append(grid.wrapper);
    root.append(resourcesCard);
    function renderResourceRows() {
      grid.body.replaceChildren();
      const filtered = resources.filter(
        (resource) =>
          resource.name
            .toLowerCase()
            .includes(state.resourceSearch.toLowerCase()) &&
          (state.resourceKind === 'all' ||
            resource.kind === state.resourceKind) &&
          (state.resourceFidelity === 'all' ||
            resource.memory_fidelity === state.resourceFidelity)
      );
      for (const resource of filtered) {
        const row = el('tr');
        rowSelected(row, resource.entity_id);
        cell(row, entity(resource.entity_id, resource.name));
        cell(row, el('span', resource.kind, 'tlp-muted'));
        cell(
          row,
          resource.memory_bytes === null ||
            resource.memory_fidelity === 'UNAVAILABLE'
            ? '—'
            : bytes(resource.memory_bytes)
        );
        const users = el('span', undefined, 'tlpa-user-links');
        if (resource.users.length)
          resource.users.slice(0, 3).forEach((id) => users.append(entity(id)));
        else users.append(document.createTextNode('No observed users'));
        cell(row, users);
        cell(
          row,
          el('span', resource.state, `tlpa-resource-state is-${resource.state}`)
        );
        cell(row, badge(resource.memory_fidelity, resource.reason));
        grid.body.append(row);
      }
      if (!filtered.length) {
        const row = el('tr');
        const value = cell(row, 'No resources match these filters.');
        value.colSpan = 6;
        grid.body.append(row);
      }
    }
    renderResourceRows();

    const bottom = el('div', undefined, 'tlpa-memory-bottom');
    const dependency = section('Dependency / ownership graph');
    const selected =
      resources.find((resource) => resource.entity_id === context.selectedId) ??
      resources.find((resource) => resource.kind === 'texture') ??
      resources[0];
    const graph = el('div', undefined, 'tlpa-dependency-graph');
    if (selected) {
      const source = selected.node as Node & { source_url?: string };
      if (source.source_url) {
        const sourceCard = el('div', undefined, 'tlpa-path-node');
        sourceCard.append(
          el('small', 'Asset source', 'tlp-muted'),
          el('code', source.source_url)
        );
        graph.append(sourceCard, el('span', '→', 'tlpa-path-arrow'));
      }
      const center = el('div', undefined, 'tlpa-path-node is-selected');
      center.append(
        entity(selected.entity_id, selected.name),
        el('small', selected.kind, 'tlp-muted'),
        badge(selected.memory_fidelity, selected.reason)
      );
      graph.append(center);
      const users = el('div', undefined, 'tlpa-dependency-users');
      for (const userId of selected.users.slice(0, 4)) {
        const line = el('div', undefined, 'tlpa-dependency-user');
        line.append(el('span', '→', 'tlpa-path-arrow'), entity(userId));
        const downstream = context.lens
          .getGraph()
          .getIncomingEdges(userId, 'uses')
          .slice(0, 2);
        downstream.forEach((edge) =>
          line.append(el('span', '→', 'tlpa-path-arrow'), entity(edge.from))
        );
        users.append(line);
      }
      graph.append(users);
      const attribution = context.lens.query<{ data: ResourceCost }>(
        'resource_cost',
        { entity_id: selected.entity_id }
      )?.data;
      dependency.append(graph);
      if (attribution) {
        dependency.append(badge(attribution.fidelity, attribution.reason));
        for (const link of attribution.chain.slice(0, 4)) {
          const line = el('div', undefined, 'tlpa-attribution-line');
          line.append(
            entity(link.from_entity),
            el('span', 'uses', 'tlp-muted'),
            entity(link.to_entity),
            el(
              'span',
              `${(link.weight * 100).toFixed(1)}% share`,
              'tlpa-number'
            )
          );
          dependency.append(line);
        }
        dependency.append(
          el('p', attribution.reason, 'tlpa-footnote tlp-muted')
        );
      }
    } else
      dependency.append(
        el(
          'p',
          'Select a resource to inspect its captured dependency chain.',
          'tlp-muted'
        )
      );
    bottom.append(dependency);
    const assets = section('Asset loading activity');
    const assetTable = table([
      'URL / asset',
      'Stage',
      'Observed time',
      'Fidelity',
    ]);
    for (const asset of snapshot.assets.slice(0, 4)) {
      const row = el('tr');
      cell(row, entity(asset.entity_id, asset.url || 'Source URL unavailable'));
      cell(row, asset.state);
      cell(
        row,
        asset.started_at === null ? '—' : `${asset.started_at.toFixed(2)} ms`
      );
      cell(row, badge(asset.fidelity, asset.reason));
      assetTable.body.append(row);
    }
    if (!snapshot.assets.length) {
      for (const stage of ['Started', 'Decoded', 'Uploaded to GPU']) {
        const row = el('tr');
        cell(row, '—');
        cell(row, stage);
        cell(row, '—');
        cell(
          row,
          badge(
            'UNAVAILABLE',
            'The manual host did not observe loader timing for these resources.'
          )
        );
        assetTable.body.append(row);
      }
    }
    assets.append(
      assetTable.wrapper,
      el(
        'p',
        'Loader timing is shown only when captured. Resource presence alone does not prove an upload time.',
        'tlpa-footnote tlp-muted'
      )
    );
    bottom.append(assets);
    root.append(bottom);
  }

  function memoryHistory(): { bytes: number }[] {
    const history: { bytes: number }[] = [];
    for (const event of snapshot.events) {
      if (event.type !== 'context_update') continue;
      const checkpoint = event.changes.metadata?.graph_snapshot as
        | {
            nodes?: (Node & {
              memory_bytes?: number;
              memory_fidelity?: Fidelity;
            })[];
          }
        | undefined;
      if (!checkpoint?.nodes) continue;
      history.push({
        bytes: checkpoint.nodes.reduce(
          (sum, node) =>
            sum +
            (node.active && node.memory_fidelity !== 'UNAVAILABLE'
              ? (node.memory_bytes ?? 0)
              : 0),
          0
        ),
      });
    }
    return history;
  }

  function renderShaders() {
    const passes = snapshot.passes;
    const pipeline = section(
      'Render pipeline',
      `${context.lens.getActiveContext()?.displayName ?? active ?? 'No context'} · observed pass relationships`
    );
    const passMap = el('div', undefined, 'tlpa-pass-map');
    if (passes.length)
      passes.forEach((pass, index) => {
        if (
          index &&
          snapshot.pipeline_edges.some(
            (edge) =>
              edge.from === passes[index - 1].entity_id &&
              edge.to === pass.entity_id
          )
        )
          passMap.append(el('span', '→', 'tlpa-path-arrow'));
        const card = el('div', undefined, 'tlpa-pass-card');
        card.classList.toggle(
          'is-selected',
          pass.entity_id === context.selectedId
        );
        card.append(
          entity(pass.entity_id, pass.name),
          metric(
            pass.cpu_ms,
            ' ms CPU submit',
            pass.cpu_ms === null ? 'UNAVAILABLE' : pass.cpu_fidelity,
            pass.reason
          )
        );
        card.append(
          el(
            'small',
            pass.tags.length ? pass.tags.join(' · ') : 'Pass tags unavailable',
            'tlp-muted'
          )
        );
        if (pass.target_ids.length)
          pass.target_ids.forEach((id) => card.append(entity(id)));
        else card.append(el('small', 'Attachments unavailable', 'tlp-muted'));
        passMap.append(card);
      });
    else {
      const card = el('div', undefined, 'tlpa-pass-card');
      card.append(
        el('strong', 'Pass boundaries'),
        badge(
          'UNAVAILABLE',
          'No explicit pass instrumentation exists in this capture.'
        ),
        el(
          'small',
          'No inferred Shadow / Bloom / Composite passes',
          'tlp-muted'
        )
      );
      passMap.append(card);
    }
    pipeline.append(passMap);
    root.append(pipeline);

    // A source/program node and its variants may both be captured. The variant
    // table lists variants when present; source-only captures still remain usable.
    const variantEntities = snapshot.shaders.filter(
      (shader) =>
        context.lens.getNode(shader.entity_id)?.type === 'shader_variant'
    );
    const shaders = variantEntities.length ? variantEntities : snapshot.shaders;
    const variants = section(
      'Compiled shader variants',
      'Captured shader entities and their defining features'
    );
    variants.querySelector('.tlpa-card-head')!.append(
      input('Search shader variants…', state.shaderSearch, (value) => {
        state.shaderSearch = value;
        renderVariantRows();
      })
    );
    const grid = table([
      'Variant / material',
      'Defines',
      'Users',
      'Compile time',
      'Status',
    ]);
    variants.append(grid.wrapper);
    root.append(variants);
    function renderVariantRows() {
      grid.body.replaceChildren();
      const filtered = shaders.filter((shader) =>
        shader.name.toLowerCase().includes(state.shaderSearch.toLowerCase())
      );
      for (const shader of filtered) {
        const row = el('tr');
        rowSelected(row, shader.entity_id);
        cell(row, entity(shader.entity_id, shader.name));
        const defineEntries = Object.entries(shader.defines);
        const defines = el('details', undefined, 'tlpa-defines');
        const names = defineEntries.map(([key, value]) =>
          value === true || value === '' || String(value).length > 18
            ? key
            : `${key}=${value}`
        );
        defines.append(
          el(
            'summary',
            names.slice(0, 5).join(' + ') +
              (names.length > 5 ? ` + ${names.length - 5} more` : '') ||
              'No captured defines'
          )
        );
        if (defineEntries.length)
          defines.append(el('pre', JSON.stringify(shader.defines, null, 2)));
        cell(row, defines);
        const users = el('span', undefined, 'tlpa-user-links');
        shader.material_ids
          .slice(0, 3)
          .forEach((id) => users.append(entity(id)));
        if (!shader.material_ids.length)
          users.append(document.createTextNode('No observed users'));
        cell(row, users);
        cell(
          row,
          metric(
            shader.compile_ms,
            ' ms',
            shader.compile_ms === null
              ? 'UNAVAILABLE'
              : shader.compile_fidelity,
            shader.reason
          )
        );
        cell(row, badge(shader.fidelity, shader.reason));
        grid.body.append(row);
      }
      if (!filtered.length) {
        const row = el('tr');
        cell(row, 'No compiled variants captured');
        cell(row, '—');
        cell(row, '—');
        cell(row, metric(null, ' ms', 'UNAVAILABLE'));
        cell(
          row,
          badge(
            'UNAVAILABLE',
            'Material definitions do not prove compiled shader variants. Enable supported shader introspection.'
          )
        );
        grid.body.append(row);
      }
    }
    renderVariantRows();

    const chosen =
      shaders.find(
        (shader) =>
          shader.entity_id === context.selectedId ||
          shader.material_ids.includes(context.selectedId ?? '')
      ) ?? shaders[0];
    const lower = el('div', undefined, 'tlpa-shader-bottom');
    const source = section(
      'Shader source',
      chosen?.name ?? 'No captured shader selected'
    );
    source
      .querySelector('.tlpa-card-head')!
      .append(el('span', 'Read only', 'tlpa-readonly'));
    const sourceTools = el('div', undefined, 'tlpa-source-tabs');
    const sourceText =
      state.sourceStage === 'fragment'
        ? chosen?.fragment_source
        : chosen?.vertex_source;
    for (const stage of ['fragment', 'vertex'] as const) {
      const tab = button(
        stage === 'fragment' ? 'Fragment shader (captured)' : 'Vertex shader',
        () => {
          state.sourceStage = stage;
          context.refresh();
        },
        'tlpa-source-tab'
      );
      tab.classList.toggle('is-selected', stage === state.sourceStage);
      sourceTools.append(tab);
    }
    const copy = button('Copy source', () => {
      if (!sourceText) {
        context.notify('No captured shader source is available to copy.');
        return;
      }
      const clipboard = document.defaultView?.navigator.clipboard;
      if (!clipboard) {
        context.notify('Clipboard access unavailable in this environment.');
        return;
      }
      void clipboard
        .writeText(sourceText)
        .then(() => context.notify('Captured shader source copied.'))
        .catch(() =>
          context.notify(
            'Clipboard permission denied. Source remains available in the read-only viewer.'
          )
        );
    });
    copy.disabled = !sourceText;
    sourceTools.append(copy);
    source.append(sourceTools);
    const sourceBody = el('div', undefined, 'tlpa-source-body');
    if (sourceText) {
      const lines = sourceText.split('\n');
      lines.forEach((text, index) => {
        const line = el('div', undefined, 'tlpa-source-line');
        const code = el('code');
        // Token styling is text-only; captured GLSL is never treated as markup.
        const tokens =
          /(\/\/.*|^\s*#\s*\w+|\b(?:uniform|attribute|varying|precision|highp|mediump|lowp|void|float|int|bool|vec[234]|mat[234]|sampler2D|samplerCube|in|out|return|if|else|for)\b|\b\d+(?:\.\d+)?\b)/g;
        let cursor = 0;
        for (const match of text.matchAll(tokens)) {
          const start = match.index!;
          if (start > cursor)
            code.append(document.createTextNode(text.slice(cursor, start)));
          const token = el(
            'span',
            match[0],
            match[0].trimStart().startsWith('//')
              ? 'tlpa-token-comment'
              : /^\d/.test(match[0])
                ? 'tlpa-token-number'
                : 'tlpa-token-keyword'
          );
          code.append(token);
          cursor = start + match[0].length;
        }
        code.append(
          document.createTextNode(text.slice(cursor) || (text ? '' : ' '))
        );
        line.append(el('span', String(index + 1), 'tlpa-line-number'), code);
        sourceBody.append(line);
      });
    } else {
      sourceBody.append(
        el('p', 'Shader source unavailable', 'tlpa-source-empty'),
        badge(
          'UNAVAILABLE',
          chosen?.reason ?? 'No compiled shader source was captured.'
        ),
        el(
          'p',
          'The viewer never substitutes authored material code for an observed compiled shader.',
          'tlp-muted'
        )
      );
    }
    source.append(sourceBody);
    lower.append(source);
    const pipelineSide = el('div', undefined, 'tlpa-pipeline-side');
    const attachments = section('Pipeline state', 'Selected render pass');
    const targetTable = table(['Attachment', 'Format', 'Resolution']);
    const selectedPass =
      passes.find((pass) => pass.entity_id === context.selectedId) ?? passes[0];
    const targets =
      selectedPass?.target_ids
        .map((id) => context.lens.getNode(id))
        .filter((node): node is Node => !!node) ?? [];
    if (targets.length)
      for (const target of targets) {
        const values = target as Node & {
          width?: number;
          height?: number;
          format?: string;
        };
        const row = el('tr');
        cell(row, entity(target.id));
        cell(row, values.format ?? 'Unavailable');
        cell(
          row,
          values.width !== undefined && values.height !== undefined
            ? `${values.width} × ${values.height}`
            : 'Unavailable'
        );
        targetTable.body.append(row);
      }
    else
      for (const label of [
        'Color attachment',
        'Depth attachment',
        'Resolve target',
        'Load / Store',
        'Multisampling',
      ]) {
        const row = el('tr');
        cell(row, label);
        cell(
          row,
          badge(
            'UNAVAILABLE',
            'Attachment and backend pipeline state were not captured.'
          )
        );
        cell(row, '—');
        targetTable.body.append(row);
      }
    attachments.append(targetTable.wrapper);
    pipelineSide.append(attachments);
    const compilation = section('Compilation events');
    const compilationTable = table(['Time', 'Event', 'Entity']);
    const events = snapshot.events.filter((event) =>
      /shader|compile|pipeline/.test(event.type)
    );
    for (const event of events.slice(-8)) {
      const row = el('tr');
      cell(row, `${event.timestamp.toFixed(2)} ms`);
      cell(row, event.type);
      const id = (event as unknown as { entity_id?: string }).entity_id;
      cell(row, id ? entity(id) : '—');
      compilationTable.body.append(row);
    }
    if (!events.length) {
      const row = el('tr');
      cell(row, '—');
      cell(row, 'Compilation events unavailable');
      cell(
        row,
        badge(
          'UNAVAILABLE',
          'No shader compilation timing events were captured.'
        )
      );
      compilationTable.body.append(row);
    }
    compilation.append(
      compilationTable.wrapper,
      el(
        'p',
        'Compile timing unavailable unless an authoritative compilation event was captured. GPU timing is not inferred from shader source.',
        'tlpa-footnote tlp-muted'
      )
    );
    pipelineSide.append(compilation);
    lower.append(pipelineSide);
    root.append(lower);
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toFixed(value < 1 ? 3 : 2);
}
function bytes(value: number): string {
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${value.toLocaleString()} B`;
}

export { analysisStyles } from './analysis-styles';
