import { createLens, type Lens } from '@3lens/runtime';
import type {
  EntityChange,
  Fidelity,
  Node,
  PlatformFrame,
  PlatformSnapshot,
  Trace,
} from '@3lens/kernel';
import type { PlatformViewContext } from './types';

type Side = 'baseline' | 'candidate';
type CapturedFrame = PlatformFrame;
type Snapshot = Pick<PlatformSnapshot, 'frames' | 'events' | 'dropped_events'>;
type Result<T> = { data: T; fidelity: Fidelity };
type LoadedSide = {
  lens: Lens;
  trace: Trace;
  blob: Blob;
  name: string;
  start?: number;
  end?: number;
};
type Bookmark = { name: string; entityId: string; frame?: number };
export type TraceComparisonSelection = {
  entityId: string;
  before: Node | null;
  after: Node | null;
  changes: string[];
};

/** Saved traces use the same public Lens queries as live investigations. */
export function createTraceViewController(context: PlatformViewContext) {
  const doc = context.document;
  const sides: Partial<Record<Side, LoadedSide>> = {};
  const bookmarks: Bookmark[] = [];
  let search = '';
  let changeFilter = 'all';
  let alignment = 'frame';
  let selectedMarker = '';
  let disposed = false;
  let selected: TraceComparisonSelection | undefined;
  let serial = 0;
  const loadVersions = { baseline: 0, candidate: 0 };

  function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    text?: string,
    cls?: string
  ): HTMLElementTagNameMap[K] {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  }
  function button(text: string, action: () => void, cls = 'tlp-btn') {
    const node = el('button', text, cls);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }
  function badge(level: Fidelity, reason?: string) {
    const node = el('span', level, 'tlp-badge');
    node.dataset.fidelity = level;
    node.title =
      reason || 'Observed captured property, not an inferred rendering cost.';
    return node;
  }
  function refresh() {
    if (!disposed) context.refresh();
  }
  function execute(action: () => Promise<void>) {
    void action().catch((error) =>
      context.notify(error instanceof Error ? error.message : String(error))
    );
  }
  async function read(file: Blob): Promise<string> {
    if (typeof file.text === 'function') return file.text();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
  async function loadTrace(side: Side, file: Blob, name = `${side}.json`) {
    const version = ++loadVersions[side];
    const text = await read(file);
    const lens = createLens({ enabled: true });
    try {
      await lens.loadTrace({ text: async () => text } as Blob);
      if (disposed || version !== loadVersions[side]) {
        lens.dispose();
        return;
      }
      const trace = JSON.parse(text) as Trace;
      const current = sides[side];
      const frameRange = trace.header.frame_range;
      sides[side] = {
        lens,
        trace,
        blob: new Blob([text], { type: 'application/json' }),
        name,
        start: frameRange.start,
        end: frameRange.end,
      };
      current?.lens.dispose();
      selected = undefined;
      const change = diff().find(
        (item) => item.entity_id === context.selectedId
      );
      if (change)
        selected = {
          entityId: change.entity_id,
          before: change.before,
          after: change.after,
          changes: [...change.changes],
        };
      context.onInspect?.(
        selected ?? { entityId: '', before: null, after: null, changes: [] }
      );
      context.notify(
        `${name} loaded as ${side}. Comparison uses captured data only.`
      );
      refresh();
    } catch (error) {
      lens.dispose();
      throw error;
    }
  }
  async function capture(side: Side) {
    await loadTrace(
      side,
      await context.lens.exportTrace({ profile: 'STANDARD' }),
      `${side}-${++serial}.json`
    );
  }
  function platform(lens: Lens): Snapshot {
    return (
      lens.query<Result<Snapshot>>('platform_snapshot')?.data ?? {
        frames: [],
        events: [],
        dropped_events: 0,
      }
    );
  }
  function diff(): EntityChange[] {
    const candidate = sides.candidate?.lens ?? context.lens;
    const baseline = sides.baseline?.lens.getGraph().snapshot();
    return (
      candidate.query<Result<EntityChange[]>>(
        'entity_changes',
        baseline ? { baseline } : {}
      )?.data ?? []
    );
  }
  function choose(change: EntityChange) {
    selected = {
      entityId: change.entity_id,
      before: change.before,
      after: change.after,
      changes: [...change.changes],
    };
    context.onInspect?.(selected);
    context.select(change.entity_id);
    refresh();
  }
  function currentSelection(): TraceComparisonSelection | undefined {
    if (selected && selected.entityId === context.selectedId) return selected;
    const change = diff().find((item) => item.entity_id === context.selectedId);
    return change
      ? {
          entityId: change.entity_id,
          before: change.before,
          after: change.after,
          changes: change.changes,
        }
      : undefined;
  }
  function field(node: Node | null, key: string): unknown {
    return node ? (node as unknown as Record<string, unknown>)[key] : undefined;
  }
  function fidelity(change: EntityChange, key: string): Fidelity {
    if (key === 'memory_bytes') {
      const levels = [
        field(change.before, 'memory_fidelity'),
        field(change.after, 'memory_fidelity'),
      ].filter(Boolean) as Fidelity[];
      return !levels.length || levels.includes('UNAVAILABLE')
        ? 'UNAVAILABLE'
        : levels.includes('ESTIMATED')
          ? 'ESTIMATED'
          : 'EXACT';
    }
    return 'EXACT';
  }
  function display(value: unknown, key: string): string {
    if (value === undefined) return 'absent';
    if (key === 'memory_bytes' && typeof value === 'number')
      return bytes(value);
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  }
  function bytes(value: number) {
    return value >= 1048576
      ? `${(value / 1048576).toFixed(value % 1048576 ? 1 : 0)} MB`
      : value >= 1024
        ? `${(value / 1024).toFixed(value % 1024 ? 1 : 0)} KB`
        : `${value} B`;
  }
  function markerNames(lens: Lens) {
    const events = platform(lens).events ?? [];
    return events.flatMap((event) => {
      const metadata =
        event.type === 'context_update' ? event.changes.metadata : undefined;
      const name = metadata?.marker;
      return typeof name === 'string'
        ? [
            {
              name,
              frame:
                typeof metadata.frame === 'number' ? metadata.frame : undefined,
              timestamp: Number(event.timestamp),
            },
          ]
        : [];
    });
  }
  function markers() {
    const baseline = markerNames(sides.baseline?.lens ?? context.lens);
    const candidate = markerNames(sides.candidate?.lens ?? context.lens);
    return baseline.filter((marker) =>
      candidate.some((other) => other.name === marker.name)
    );
  }
  function frames(side: Side): CapturedFrame[] {
    const item = sides[side];
    const lens = item?.lens ?? context.lens;
    const active = context.lens.getActiveContext()?.id;
    return platform(lens).frames.filter(
      (frame) =>
        (!active || frame.context_id === active) &&
        (item?.start === undefined || frame.frame >= item.start) &&
        (item?.end === undefined || frame.frame <= item.end)
    );
  }
  function fileControl(side: Side) {
    const group = el('div', undefined, 'tlp-trace-file');
    const label = el(
      'span',
      side === 'baseline' ? 'Baseline trace' : 'Candidate trace',
      'tlp-muted'
    );
    const input = el('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.hidden = true;
    input.setAttribute(
      'aria-label',
      side === 'baseline' ? 'Load baseline trace' : 'Load candidate trace'
    );
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (file) execute(() => loadTrace(side, file, file.name));
    });
    const chooseFile = button(
      sides[side]?.name ??
        (side === 'baseline' ? 'Open baseline.json' : 'Open candidate.json'),
      () => input.click()
    );
    chooseFile.title = 'Choose a saved 3Lens JSON trace';
    const more = button('•••', () => execute(() => capture(side)));
    more.title = `Capture current session as ${side}`;
    more.setAttribute('aria-label', `Capture current as ${side}`);
    const row = el('div', undefined, 'tlp-trace-file-row');
    row.append(label, chooseFile, more, input);
    const range = el('div', undefined, 'tlp-trace-range');
    range.append(el('span', 'Frames', 'tlp-muted'));
    const observed = frames(side);
    for (const edge of ['start', 'end'] as const) {
      const field = el('input');
      field.type = 'number';
      field.min = '0';
      field.value = String(
        sides[side]?.[edge] ??
          (edge === 'start'
            ? (observed[0]?.frame ?? 0)
            : (observed.at(-1)?.frame ?? 0))
      );
      field.setAttribute('aria-label', `${side} ${edge} frame`);
      field.disabled = !sides[side];
      field.addEventListener('change', () => {
        const value = Number(field.value);
        if (sides[side] && Number.isInteger(value) && value >= 0) {
          sides[side]![edge] = value;
          refresh();
        }
      });
      range.append(field);
      if (edge === 'start') range.append(el('span', '—', 'tlp-muted'));
    }
    range.append(el('span', `(${observed.length})`, 'tlp-muted'));
    group.append(row, range);
    return group;
  }
  function renderTimelines() {
    const area = el('section', undefined, 'tlp-trace-timelines');
    area.setAttribute('aria-label', 'Aligned trace timelines');
    const commonMarkers = markers();
    const marker = commonMarkers.find((item) => item.name === selectedMarker);
    if (alignment === 'marker' && marker)
      area.append(el('div', marker.name, 'tlp-trace-marker'));
    const coordinates = (side: Side, frame: CapturedFrame) => {
      const origin = markerNames(sides[side]?.lens ?? context.lens).find(
        (item) => item.name === selectedMarker
      );
      return alignment === 'marker' && origin
        ? frame.timestamp - origin.timestamp
        : frame.frame;
    };
    const samples = {
      baseline: frames('baseline').slice(-180),
      candidate: frames('candidate').slice(-180),
    };
    const positions = (['baseline', 'candidate'] as Side[]).flatMap((side) =>
      samples[side].map((frame) => coordinates(side, frame))
    );
    const minimum = positions.length
      ? Math.min(...positions, ...(alignment === 'marker' ? [0] : []))
      : 0;
    const maximumPosition = Math.max(minimum + 1, ...positions);
    const spread = maximumPosition - minimum;
    for (const side of ['baseline', 'candidate'] as Side[]) {
      const row = el('div', undefined, 'tlp-trace-timeline-row');
      row.append(el('span', side === 'baseline' ? 'Baseline' : 'Candidate'));
      const strip = el('div', undefined, 'tlp-trace-bars');
      const list = samples[side];
      const maximum = Math.max(1, ...list.map((frame) => frame.cpu_ms ?? 0));
      for (const frame of list) {
        const bar = button(
          '',
          () => {
            context.setFrame?.(frame.frame);
            if (frame.entity_ids?.length) context.select(frame.entity_ids[0]);
            context.notify(
              `Selected ${side} frame ${frame.frame}. CPU submission is distinct from GPU timing.`
            );
            refresh();
          },
          'tlp-trace-bar'
        );
        if (!context.cspSafe) {
          bar.style.height = `${frame.cpu_ms == null ? 18 : Math.max(16, (frame.cpu_ms / maximum) * 100)}%`;
          bar.style.left = `${((coordinates(side, frame) - minimum) / spread) * 99}%`;
          bar.style.width = `${Math.max(0.3, 99 / Math.max(1, list.length))}%`;
        }
        bar.dataset.fidelity =
          frame.cpu_ms == null ? 'UNAVAILABLE' : frame.cpu_fidelity;
        bar.classList.toggle('is-selected', context.frame === frame.frame);
        bar.title = `Frame ${frame.frame} · ${frame.cpu_ms == null ? 'CPU submission unavailable' : `${frame.cpu_ms.toFixed(2)} ms CPU submission (${frame.cpu_fidelity})`}`;
        bar.setAttribute('aria-label', `${side} frame ${frame.frame}`);
        strip.append(bar);
      }
      if (!list.length)
        strip.append(el('span', 'No recorded frame timing', 'tlp-muted'));
      const value = list.at(-1)?.cpu_ms;
      const cost = el(
        'span',
        value == null ? '—' : `${value.toFixed(2)} ms`,
        'tlp-trace-time'
      );
      cost.title = 'Last recorded CPU submission duration; not GPU time';
      row.append(strip, cost);
      area.append(row);
    }
    const legend = el('div', undefined, 'tlp-trace-axis');
    const measured = [...samples.baseline, ...samples.candidate].filter(
      (frame) => frame.cpu_ms != null
    );
    const levels = measured.map((frame) => frame.cpu_fidelity);
    const level =
      !levels.length || levels.includes('UNAVAILABLE')
        ? 'UNAVAILABLE'
        : levels.includes('ESTIMATED')
          ? 'ESTIMATED'
          : 'EXACT';
    legend.append(
      el(
        'span',
        alignment === 'marker'
          ? `Shared marker offset · ${minimum.toFixed(0)}–${maximumPosition.toFixed(0)} ms`
          : `Frame ${minimum}–${maximumPosition}`
      ),
      badge(
        level,
        measured.length
          ? 'CPU submission durations retain recorded fidelity; frame grouping is independent.'
          : 'No CPU submission durations were captured.'
      ),
      el('span', 'CPU submission · GPU time unavailable', 'tlp-muted')
    );
    area.append(legend);
    return area;
  }
  function renderChanges() {
    const section = el('section', undefined, 'tlp-trace-changes');
    const heading = el('div', undefined, 'tlp-trace-section-head');
    const changes = diff().sort((a, b) => {
      const chosen = selected?.entityId ?? context.selectedId;
      if (a.entity_id === chosen) return -1;
      if (b.entity_id === chosen) return 1;
      return (a.after?.name ?? a.before?.name ?? a.entity_id).localeCompare(
        b.after?.name ?? b.before?.name ?? b.entity_id
      );
    });
    heading.append(
      el('h2', 'What changed?'),
      el('span', `${changes.length} changed entities`, 'tlp-muted')
    );
    const input = el('input');
    input.type = 'search';
    input.placeholder = 'Filter changes…';
    input.value = search;
    input.setAttribute('aria-label', 'Filter trace changes');
    input.addEventListener('input', () => {
      search = input.value;
      refresh();
    });
    const filter = el('select');
    filter.setAttribute('aria-label', 'Trace change type');
    for (const [value, text] of [
      ['all', 'All changes'],
      ['added', 'Added entities'],
      ['removed', 'Removed entities'],
      ['memory', 'Memory changes'],
    ]) {
      const option = el('option', text);
      option.value = value;
      filter.append(option);
    }
    filter.value = changeFilter;
    filter.addEventListener('change', () => {
      changeFilter = filter.value;
      refresh();
    });
    heading.append(input, filter);
    section.append(heading);
    const table = el('table', undefined, 'tlp-table tlp-trace-table');
    const head = el('thead');
    const headings = el('tr');
    for (const text of [
      'Entity',
      'Property',
      'Before (baseline)',
      'After (candidate)',
      'Δ',
      'Fidelity',
      'Notes',
    ])
      headings.append(el('th', text));
    head.append(headings);
    table.append(head);
    const body = el('tbody');
    let count = 0;
    for (const change of changes) {
      const name =
        change.after?.name || change.before?.name || change.entity_id;
      if (
        search &&
        !`${name} ${change.entity_id} ${change.changes.join(' ')}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        continue;
      if (
        (changeFilter === 'added' && change.before) ||
        (changeFilter === 'removed' && change.after)
      )
        continue;
      // Presence changes are one meaningful row. Repeating every identity/property
      // for a newly captured entity would bury the investigation beneath bookkeeping.
      const keys =
        !change.before || !change.after
          ? ['$entity']
          : change.changes.filter(
              (key) => !['created_at', 'modified_at', 'origin'].includes(key)
            );
      for (const key of keys) {
        if (changeFilter === 'memory' && !key.startsWith('memory_')) continue;
        const level = fidelity(change, key);
        const before =
          key === '$entity'
            ? change.before
              ? 'Present'
              : undefined
            : field(change.before, key);
        const after =
          key === '$entity'
            ? change.after
              ? 'Present'
              : undefined
            : field(change.after, key);
        const row = el('tr');
        row.tabIndex = 0;
        row.classList.toggle(
          'is-selected',
          (selected?.entityId ?? context.selectedId) === change.entity_id
        );
        const select = () => choose(change);
        row.addEventListener('click', select);
        row.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') select();
        });
        row.dataset.entityId = change.entity_id;
        const entity = el('td');
        const entityButton = button(name, select, 'tlp-trace-entity');
        entityButton.addEventListener('click', (event) =>
          event.stopPropagation()
        );
        entity.append(entityButton);
        const beforeCell = el(
          'td',
          level === 'UNAVAILABLE' && key === 'memory_bytes'
            ? '—'
            : display(before, key)
        );
        const afterCell = el(
          'td',
          level === 'UNAVAILABLE' && key === 'memory_bytes'
            ? '—'
            : display(after, key)
        );
        beforeCell.title = display(before, key);
        afterCell.title = display(after, key);
        const delta =
          typeof before === 'number' &&
          typeof after === 'number' &&
          level !== 'UNAVAILABLE'
            ? after - before
            : undefined;
        const deltaCell = el(
          'td',
          delta === undefined
            ? '—'
            : `${delta > 0 ? '+' : ''}${key === 'memory_bytes' ? bytes(delta) : delta.toLocaleString()}`
        );
        if (delta !== undefined)
          deltaCell.className =
            delta > 0 ? 'tlp-trace-increase' : 'tlp-trace-decrease';
        const evidence =
          key === 'memory_bytes'
            ? 'Memory fidelity is inherited from both captures. Storage estimates are not measured GPU allocation.'
            : 'Captured property changed; identity matched by stable entity ID.';
        const fidelityCell = el('td');
        fidelityCell.append(badge(level, evidence));
        row.append(
          entity,
          el('td', key === '$entity' ? 'Entity' : key.replaceAll('_', ' ')),
          beforeCell,
          afterCell,
          deltaCell,
          fidelityCell,
          el(
            'td',
            !change.before
              ? 'Added in candidate'
              : !change.after
                ? 'Absent from candidate'
                : key === 'memory_bytes'
                  ? 'Inspect storage source'
                  : 'Captured value changed',
            'tlp-muted'
          )
        );
        body.append(row);
        count++;
      }
    }
    table.append(body);
    const scroll = el('div', undefined, 'tlp-trace-table-scroll');
    scroll.append(table);
    section.append(scroll);
    if (!count)
      section.append(
        el(
          'p',
          sides.baseline || sides.candidate
            ? 'No matching captured property changes. Entity identity is matched by stable IDs; unrelated sessions are not guessed to be the same object.'
            : 'Set a baseline before changing your application, or open a baseline and candidate trace to compare saved captures.',
          'tlp-trace-empty'
        )
      );
    return section;
  }
  function renderPath() {
    const section = el('section', undefined, 'tlp-trace-path');
    const heading = el('div', undefined, 'tlp-trace-section-head');
    heading.append(
      el('h2', 'Change path'),
      el('span', 'Captured relationships, not inferred causality', 'tlp-muted')
    );
    section.append(heading);
    const pick = currentSelection();
    const id = pick?.entityId ?? context.selectedId;
    let lens = sides.candidate?.lens ?? context.lens;
    if (id && !lens.getNode(id) && sides.baseline?.lens.getNode(id))
      lens = sides.baseline.lens;
    const links = id
      ? [
          ...lens.getGraph().getIncomingEdges(id),
          ...lens.getGraph().getOutgoingEdges(id),
        ].filter((edge) =>
          [
            'contains',
            'uses',
            'references',
            'variant_of',
            'renders_with',
          ].includes(edge.type)
        )
      : [];
    const unique = links
      .filter(
        (edge, index, all) =>
          all.findIndex(
            (other) =>
              other.from === edge.from &&
              other.to === edge.to &&
              other.type === edge.type
          ) === index
      )
      .slice(0, 4);
    const path = el('div', undefined, 'tlp-trace-path-cards');
    const makeCard = (node: Node) => {
      const card = button(
        '',
        () => {
          context.select(node.id);
          refresh();
        },
        'tlp-trace-path-card'
      );
      card.append(
        el('strong', node.name || node.type),
        el('span', node.type, 'tlp-muted')
      );
      return card;
    };
    for (const edge of unique) {
      const from = lens.getNode(edge.from);
      const to = lens.getNode(edge.to);
      if (!from || !to) continue;
      const relation = el('div', undefined, 'tlp-trace-path-group');
      const arrow = el('span', `${edge.type} →`, 'tlp-trace-arrow');
      relation.append(makeCard(from), arrow, makeCard(to));
      path.append(relation);
    }
    if (!unique.length)
      path.append(
        el(
          'p',
          id
            ? 'No captured relationships resolve for this entity. Causal responsibility is unavailable.'
            : 'Select a changed entity to follow its captured dependencies.',
          'tlp-muted'
        )
      );
    section.append(path);
    const actions = el('div', undefined, 'tlp-trace-path-actions');
    for (const side of ['baseline', 'candidate'] as Side[]) {
      const inspect = button(`Inspect ${side}`, () =>
        execute(async () => {
          const item = sides[side];
          if (!item) return;
          await context.lens.loadTrace(item.blob);
          if (id && context.lens.getNode(id)) context.select(id);
          context.notify(`Inspecting ${item.name}. Live capture is detached.`);
          refresh();
        })
      );
      inspect.disabled = !sides[side];
      actions.append(inspect);
    }
    const users = button('Find affected users', () => {
      if (!id) return;
      const list = lens.getGraph().getIncomingEdges(id, 'uses');
      if (list.length) {
        context.select(list[0].from);
        context.lens.select([...new Set(list.map((edge) => edge.from))], {
          source: 'query_result',
        });
        refresh();
      }
      context.notify(
        list.length
          ? `${list.length} captured users selected through usage relationships.`
          : 'No captured usage edges are available for this entity.'
      );
    });
    users.disabled = !id;
    actions.append(users);
    section.append(actions);
    return section;
  }
  function renderBookmarks() {
    const section = el('section', undefined, 'tlp-trace-bookmarks');
    const heading = el('div', undefined, 'tlp-trace-section-head');
    heading.append(el('h2', 'Saved selections & bookmarks'));
    const save = button('+ Save selection', () => {
      const id = context.selectedId ?? selected?.entityId;
      if (!id) {
        context.notify('Select an entity before saving a bookmark.');
        return;
      }
      const lens = sides.candidate?.lens ?? context.lens;
      const bookmark = {
        name: lens.getNode(id)?.name || id,
        entityId: id,
        frame: context.frame,
      };
      if (bookmarks.length === 12) bookmarks.shift();
      bookmarks.push(bookmark);
      context.notify('Selection bookmarked for this comparison session.');
      refresh();
    });
    heading.append(save);
    section.append(heading);
    const row = el('div', undefined, 'tlp-trace-bookmark-row');
    for (const item of bookmarks) {
      const card = button(
        '',
        () => {
          context.select(item.entityId);
          if (item.frame !== undefined) context.setFrame?.(item.frame);
          refresh();
        },
        'tlp-trace-bookmark'
      );
      card.append(
        el('span', '⚑', 'tlp-trace-flag'),
        el('strong', item.name),
        el(
          'small',
          item.frame === undefined
            ? 'Saved entity selection'
            : `Frame ${item.frame}`,
          'tlp-muted'
        )
      );
      row.append(card);
    }
    if (!bookmarks.length)
      row.append(
        el(
          'p',
          'Save an entity and frame here to return to the same investigation.',
          'tlp-muted'
        )
      );
    section.append(row);
    return section;
  }
  function render() {
    const root = el('div', undefined, 'tlp-trace-view');
    root.dataset.view = 'changes';
    const controls = el('section', undefined, 'tlp-trace-controls');
    const align = el('div', undefined, 'tlp-trace-align');
    const contextLabel = el('span', 'Main renderer', 'tlp-muted');
    contextLabel.textContent =
      context.lens.getActiveContext()?.displayName ||
      context.lens.getActiveContext()?.id ||
      'All captured contexts';
    align.append(contextLabel);
    const mode = el('select');
    mode.setAttribute('aria-label', 'Trace alignment');
    const frameOption = el('option', 'Align by frame');
    frameOption.value = 'frame';
    const markerOption = el('option', 'Align by captured marker');
    markerOption.value = 'marker';
    markerOption.disabled = !markers().length;
    mode.append(frameOption, markerOption);
    mode.value = alignment;
    mode.addEventListener('change', () => {
      alignment = mode.value;
      refresh();
    });
    align.append(mode);
    if (markers().length) {
      const marker = el('select');
      marker.setAttribute('aria-label', 'Shared trace marker');
      for (const item of markers()) {
        const option = el('option', item.name);
        option.value = item.name;
        marker.append(option);
      }
      selectedMarker ||= markers()[0].name;
      marker.value = selectedMarker;
      marker.addEventListener('change', () => {
        selectedMarker = marker.value;
        refresh();
      });
      align.append(marker);
    } else align.append(el('small', 'No shared markers captured', 'tlp-muted'));
    controls.append(fileControl('baseline'), align, fileControl('candidate'));
    root.append(
      controls,
      renderTimelines(),
      renderChanges(),
      renderPath(),
      renderBookmarks()
    );
    const footer = el('footer', undefined, 'tlp-trace-footer');
    footer.append(
      el(
        'span',
        context.lens.getMode() === 'offline'
          ? '✓ Saved capture · selection and baseline preserved'
          : 'Live comparison · capture either side or open saved traces'
      )
    );
    footer.title =
      'Property comparison uses each trace’s final captured entity state; frame-range controls filter the synchronized timelines.';
    const dropped =
      (sides.baseline?.trace.header.dropped_events ?? 0) +
      (sides.candidate?.trace.header.dropped_events ?? 0);
    if (dropped)
      footer.append(
        el(
          'span',
          `⚠ ${dropped.toLocaleString()} earlier events dropped; final state retained`,
          'tlp-trace-warning'
        )
      );
    root.append(footer);
    return root;
  }
  return {
    render,
    loadTrace,
    captureBaseline: () => capture('baseline'),
    captureCandidate: () => capture('candidate'),
    getSelectedComparison: currentSelection,
    dispose() {
      if (disposed) return;
      disposed = true;
      sides.baseline?.lens.dispose();
      sides.candidate?.lens.dispose();
      bookmarks.length = 0;
    },
  };
}

export const traceStyles = `
.tlp-trace-view{display:flex;flex-direction:column;min-height:100%;color:var(--tlp-text,var(--tlp-text));font:12px/1.45 'Segoe UI',sans-serif}
.tlp-trace-view input,.tlp-trace-view select{font:inherit;color:inherit;background:var(--tlp-panel);border:1px solid var(--tlp-border);border-radius:4px;padding:6px 9px;min-width:0}
.tlp-trace-controls{display:grid;grid-template-columns:minmax(220px,1fr) minmax(180px,.78fr) minmax(220px,1fr);gap:18px;padding:14px 20px;border-bottom:1px solid var(--tlp-border);background:var(--tlp-panel)}
.tlp-trace-file{min-width:0}.tlp-trace-file-row,.tlp-trace-range{display:flex;align-items:center;gap:8px}.tlp-trace-file-row>.tlp-btn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tlp-trace-file-row>.tlp-btn:first-of-type{flex:1}.tlp-trace-file-row>.tlp-muted{white-space:nowrap}.tlp-trace-range{margin-top:12px}.tlp-trace-range input{width:64px;text-align:center}.tlp-trace-align{display:flex;flex-direction:column;justify-content:center;gap:7px;padding:0 16px;border-left:1px solid var(--tlp-border);border-right:1px solid var(--tlp-border)}
.tlp-trace-timelines{padding:19px 20px 12px;position:relative;border-bottom:1px solid var(--tlp-border)}.tlp-trace-timeline-row{display:grid;grid-template-columns:70px minmax(0,1fr) 72px;align-items:center;gap:12px;margin:9px 0}.tlp-trace-bars{position:relative;display:flex;align-items:flex-end;gap:2px;height:31px;background:repeating-linear-gradient(90deg,var(--tlp-raised) 0,var(--tlp-raised) 39px,var(--tlp-raised) 40px);overflow:hidden}.tlp-trace-bar{position:absolute;bottom:0;padding:0;border:0!important;border-radius:0!important;background:var(--tlp-raised)!important;min-width:2px;flex:1;cursor:pointer;opacity:.85}.tlp-trace-bar:nth-child(5n){background:var(--tlp-raised)!important}.tlp-trace-bar:hover,.tlp-trace-bar.is-selected{background:#20b0b7!important;outline:1px solid var(--tlp-teal)}.tlp-trace-bar[data-fidelity=UNAVAILABLE]{background:var(--tlp-raised)!important}.tlp-trace-axis{display:flex;justify-content:space-between;gap:14px;font:10px Consolas,monospace;color:var(--tlp-muted);margin-left:82px;margin-top:13px}.tlp-trace-time{font:11px Consolas,monospace;text-align:right}.tlp-trace-marker{position:absolute;left:50%;top:3px;color:#197980;font:11px Consolas,monospace}
.tlp-trace-changes,.tlp-trace-path,.tlp-trace-bookmarks{padding:17px 20px;border-bottom:1px solid var(--tlp-border)}.tlp-trace-section-head{display:flex;align-items:center;gap:12px;margin-bottom:13px}.tlp-trace-section-head h2{font-size:16px;font-weight:600;margin:0;letter-spacing:-.25px}.tlp-trace-section-head input{margin-left:auto;width:200px}.tlp-trace-table-scroll{max-height:181px;overflow:auto;border:1px solid var(--tlp-border);border-radius:4px}.tlp-trace-table{width:100%;border-collapse:separate;border-spacing:0}.tlp-trace-table thead{position:sticky;top:0;z-index:1}.tlp-trace-table th,.tlp-trace-table td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--tlp-border);border-right:1px solid var(--tlp-border);max-width:230px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tlp-trace-table th{font-weight:400;color:var(--tlp-text);background:var(--tlp-raised)}.tlp-trace-table td{font:11px Consolas,monospace}.tlp-trace-table tr{cursor:pointer}.tlp-trace-table tr:hover td{background:var(--tlp-raised)}.tlp-trace-table tr.is-selected td{background:var(--tlp-accent);border-top:1px solid var(--tlp-teal);border-bottom:1px solid var(--tlp-teal)}.tlp-trace-table .tlp-muted{font:10px/1.4 'Segoe UI',sans-serif}.tlp-trace-entity{background:none;border:0;color:inherit;font:12px 'Segoe UI',sans-serif;text-align:left;cursor:pointer;padding:0}.tlp-trace-increase{color:#8a5c0f}.tlp-trace-decrease{color:#1f7a65}.tlp-trace-empty{color:var(--tlp-muted);padding:18px 3px;max-width:700px;font-size:12px}
.tlp-trace-path-cards{display:flex;align-items:stretch;gap:14px;overflow:auto;padding:3px 0 10px}.tlp-trace-path-group{display:flex;gap:10px;align-items:stretch;flex:0 0 auto;min-width:390px;width:max-content;padding-right:14px;border-right:1px solid var(--tlp-border)}.tlp-trace-path-card{display:flex;flex-direction:column;justify-content:center;gap:7px;background:linear-gradient(145deg,var(--tlp-raised),var(--tlp-panel));border:1px solid var(--tlp-border);border-radius:5px;color:var(--tlp-text);padding:13px 15px;text-align:left;min-height:82px;min-width:150px;flex:1;cursor:pointer}.tlp-trace-path-card strong{font:600 13px 'Segoe UI',sans-serif}.tlp-trace-path-card span{font-size:11px}.tlp-trace-arrow{align-self:center;color:var(--tlp-muted);font-size:21px}.tlp-trace-path-actions{display:flex;gap:8px}.tlp-trace-bookmarks .tlp-trace-section-head>.tlp-btn{margin-left:auto}.tlp-trace-bookmark-row{display:flex;gap:12px;flex-wrap:wrap}.tlp-trace-bookmark{display:grid;grid-template-columns:23px 1fr;gap:4px 8px;text-align:left;border:1px solid var(--tlp-border);border-radius:5px;background:var(--tlp-raised);color:var(--tlp-text);padding:12px;min-width:210px;cursor:pointer}.tlp-trace-bookmark small{grid-column:2}.tlp-trace-flag{grid-row:span 2;color:#167d83;font-size:20px}.tlp-trace-footer{display:flex;gap:16px;justify-content:space-between;padding:12px 20px;color:#1c7d6e;font-size:11px;margin-top:auto}.tlp-trace-warning{color:#875b12}
@media(max-width:1100px){.tlp-trace-controls{grid-template-columns:1fr 1fr}.tlp-trace-align{grid-column:span 2;grid-row:2;flex-direction:row;align-items:center;justify-content:flex-start;border:0;padding:0}.tlp-trace-table th,.tlp-trace-table td{padding:9px 7px;max-width:130px}.tlp-trace-section-head{flex-wrap:wrap}.tlp-trace-section-head input{width:160px}.tlp-trace-table th:last-child,.tlp-trace-table td:last-child{display:none}}
@media(max-width:650px){.tlp-trace-controls{grid-template-columns:1fr;padding:12px}.tlp-trace-align{grid-column:auto;grid-row:auto;flex-wrap:wrap}.tlp-trace-changes,.tlp-trace-path,.tlp-trace-bookmarks{padding:12px;overflow:auto}.tlp-trace-axis{margin-left:0;flex-wrap:wrap}.tlp-trace-timeline-row{grid-template-columns:55px minmax(0,1fr) 60px;gap:7px}.tlp-trace-footer{flex-direction:column}.tlp-trace-table{min-width:620px}}
`;
