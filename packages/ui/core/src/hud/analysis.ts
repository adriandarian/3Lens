/**
 * Analysis window: one investigation, told from captured evidence.
 *
 *  What is this → What changed (baseline diff) → Where the cost sits (storage
 *  hotspots) → When (frame timeline) → Why it is here (weighted usage path).
 *
 * It renders into a separate browser window by default so heavy views never
 * compete with the application's main thread or screen space. If popups are
 * blocked it falls back to an in-page panel. "All tools" swaps in the full
 * workspace (Performance / Memory / Changes / Shaders) in the same window.
 *
 * Nothing here claims causality the data cannot support: per-object CPU/GPU
 * time is UNAVAILABLE, and usage shares are labelled equal-share ESTIMATES.
 */
import type { Lens } from '@3lens/runtime';
import type { Fidelity, Node, PlatformSnapshot } from '@3lens/kernel';
import { createInvestigationUI } from '../investigation';
import { uiDom } from '../platform/dom';
import {
  STORAGE_TYPES,
  describeChange,
  describeEntity,
  describeResource,
  formatBytes,
  storageDelta,
  type EntityChange,
  type ResourceCost,
} from './data';
import { hudStyles } from './styles';

export interface AnalysisOptions {
  lens: Lens;
  document: Document;
  mode: 'window' | 'panel';
  readonly?: boolean;
  csp?: { styleNonce?: string; cssUrl?: string; safeMode?: boolean };
  baselineSet(): boolean;
  setBaseline(): void;
  notify(message: string): void;
  onClose(): void;
}

export interface AnalysisController {
  open(): void;
  close(): void;
  isOpen(): boolean;
  dispose(): void;
}

interface Result<T> {
  data: T;
  fidelity: Fidelity;
}

export function createAnalysis(options: AnalysisOptions): AnalysisController {
  const { lens } = options;
  let popup: Window | null = null;
  let doc: Document = options.document;
  let page: HTMLElement | undefined;
  let body: HTMLElement | undefined;
  let tools: ReturnType<typeof createInvestigationUI> | undefined;
  let toolsButton: HTMLElement | undefined;
  let style: HTMLElement | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let unsubscribe: (() => void) | undefined;
  let allTools = false;
  let opened = false;
  let lastKey = '';

  const dom = () => uiDom(doc);

  /* ---------------------------------------------------------------- DOM helpers */
  function badge(level: Fidelity, reason?: string) {
    const node = dom().el('span', level, 'tlh-badge');
    node.dataset.fidelity = level;
    if (reason) node.title = reason;
    return node;
  }
  function link(id: string, text?: string) {
    const node = dom().el('button', text ?? lens.getNode(id)?.name ?? id, 'tla-link');
    node.type = 'button';
    node.title = id;
    node.addEventListener('click', () => {
      lens.select(id, { source: 'user_click' });
    });
    return node;
  }
  function button(label: string, action: () => void, primary = false) {
    const node = dom().el('button', label, 'tlh-btn');
    node.type = 'button';
    if (primary) node.dataset.primary = 'true';
    node.addEventListener('click', action);
    return node;
  }
  function card(title: string, extra?: HTMLElement, wide = false) {
    const { el } = dom();
    const section = el('section', undefined, `tla-card${wide ? ' wide' : ''}`);
    const head = el('h2');
    head.append(el('span', title));
    if (extra) head.append(extra);
    section.append(head);
    return section;
  }

  /* ---------------------------------------------------------------- sections */
  function subjectCard(id: string | undefined): HTMLElement {
    const { el } = dom();
    const section = el('section', undefined, 'tla-card wide');
    if (!id || !lens.getNode(id)) {
      const empty = el('div', undefined, 'tla-empty');
      empty.append(
        el('strong', 'Pick something to investigate.'),
        el('br'),
        el('span', 'Alt+click an object in the application, or use search (Ctrl K) in the main window. Global findings are shown below.')
      );
      section.append(empty);
      return section;
    }
    const node = lens.getNode(id)!;
    const baselineSet = options.baselineSet();
    const brief = describeEntity(lens, id, baselineSet)!;
    const head = el('div', undefined, 'tla-subject');
    const title = el('div');
    title.append(el('div', node.name || node.type, 'name'));
    const meta = el('div', undefined, 'id');
    meta.append(el('span', `${node.type} · `), el('code', id));
    title.append(meta);
    head.append(title);
    const actions = el('div', undefined, 'tlh-line');
    actions.append(
      button('Focus in app', () => options.notify(lens.focus(id) ? 'Camera focused' : 'Focus unavailable')),
      button('Highlight', () => lens.highlight(id))
    );
    for (const child of actions.querySelectorAll('button'))
      (child as HTMLButtonElement).disabled = lens.getMode() !== 'live' || !!options.readonly;
    head.append(actions);
    section.append(head);

    const change = brief.changes;
    const summary = el('p', undefined, 'tla-summary');
    const delta = change ? storageDelta(change) : undefined;
    if (!baselineSet) {
      summary.textContent = 'No baseline yet. Set one, change something in the scene, and this page will show what moved.';
    } else if (delta) {
      const diff = delta.after - delta.before;
      summary.append(
        el('span', `Storage for “${node.name || node.type}” changed from ${formatBytes(delta.before)} to ${formatBytes(delta.after)} (${diff > 0 ? '+' : '−'}${formatBytes(Math.abs(diff))}) since the baseline. `),
        badge(delta.fidelity),
        el('small', 'Observed together, not proven causal: 3Lens has no per-object timing, so it cannot say this change affected any frame time.')
      );
    } else if (change) {
      const lines = describeChange(change);
      summary.append(
        el('span', `Changed since the baseline: ${lines.join(' · ')} `),
        badge('EXACT')
      );
    } else {
      summary.append(el('span', 'No observed change to this entity since the baseline. '), badge('EXACT'));
    }
    section.append(summary);
    return section;
  }

  function changesCard(id: string | undefined): HTMLElement {
    const { el } = dom();
    const section = card('What changed since the baseline', badge('EXACT', 'Property-by-property comparison of captured entities'));
    if (!options.baselineSet() && lens.getMode() === 'live') {
      const empty = el('div', undefined, 'tla-empty');
      empty.append(el('span', 'Nothing to compare yet.'), el('br'), button('Set baseline', options.setBaseline, true));
      section.append(empty);
      return section;
    }
    const all = lens.query<Result<EntityChange[]>>('entity_changes', {})?.data ?? [];
    const interesting = all.filter((change) => {
      const node = change.after ?? change.before;
      return node && !['renderer', 'camera'].includes(node.type);
    });
    const ordered = [...interesting].sort((a, b) => {
      const pin = (change: EntityChange) => (change.entity_id === id ? 0 : 1);
      return pin(a) - pin(b) || b.changes.length - a.changes.length;
    });
    if (!ordered.length) {
      section.append(el('div', 'No captured entity differs from the baseline.', 'tla-empty'));
      return section;
    }
    const table = el('table', undefined, 'tla-table');
    const head = el('tr');
    for (const label of ['Entity', 'Change']) head.append(el('th', label));
    table.append(head);
    for (const change of ordered.slice(0, 12)) {
      const node = (change.after ?? change.before)!;
      const row = el('tr');
      const first = el('td');
      first.append(link(change.entity_id, node.name || node.type), el('div', node.type, 'tla-muted'));
      const second = el('td');
      for (const line of describeChange(change)) second.append(el('div', line));
      row.append(first, second);
      table.append(row);
    }
    section.append(table);
    if (ordered.length > 12) section.append(el('p', `+${ordered.length - 12} more changed entities`, 'tla-fine'));
    return section;
  }

  function hotspotsCard(id: string | undefined): HTMLElement {
    const { el } = dom();
    const section = card('Where storage sits', badge('ESTIMATED', 'Captured CPU-side sizes; GPU allocation is not observable'));
    const scoped = id ? (describeEntity(lens, id, false)?.resources ?? []) : [];
    const facts = (scoped.length
      ? scoped.filter((fact) => STORAGE_TYPES.includes(fact.node.type))
      : lens
          .getGraph()
          .getNodes({ types: STORAGE_TYPES as never, active: true } as never)
          .nodes.map((node) => describeResource(lens, node))
    ).sort((a, b) => (b.bytes ?? -1) - (a.bytes ?? -1));
    if (!facts.length) {
      section.append(el('div', 'No storage-bearing resources were captured.', 'tla-empty'));
      return section;
    }
    const max = Math.max(1, ...facts.map((fact) => fact.bytes ?? 0));
    const table = el('table', undefined, 'tla-table');
    const head = el('tr');
    for (const label of ['Resource', 'Storage', '']) head.append(el('th', label));
    table.append(head);
    for (const fact of facts.slice(0, 10)) {
      const row = el('tr');
      const name = el('td');
      name.append(link(fact.node.id, fact.label), el('div', `${fact.node.type}${fact.share && fact.share.users > 1 ? ` · shared by ${fact.share.users}` : ''}`, 'tla-muted'));
      const size = el('td');
      const cell = el('div', undefined, 'tla-bar-cell');
      const meter = el('div', undefined, 'tla-meter');
      meter.dataset.fidelity = fact.fidelity;
      const fill = el('i');
      fill.style.width = `${fact.bytes ? Math.max(2, (fact.bytes / max) * 100) : 0}%`;
      meter.append(fill);
      cell.append(meter, el('span', fact.value));
      size.append(cell);
      const bdg = el('td');
      bdg.append(badge(fact.fidelity, fact.reason));
      row.append(name, size, bdg);
      table.append(row);
    }
    section.append(table);
    section.append(
      el('p', 'Per-object CPU and GPU time is UNAVAILABLE: only renderer-level CPU time is observed, so no mesh is ranked by cost here.', 'tla-fine')
    );
    return section;
  }

  function timelineCard(snapshot: PlatformSnapshot | undefined): HTMLElement {
    const { el } = dom();
    const frames = (snapshot?.frames ?? []).filter((frame) => frame.cpu_ms !== null);
    const live = lens.getSelectedFrame();
    const reset = button('Latest', () => { lens.setFrame(null); refresh(true); });
    reset.disabled = live === null;
    const section = card('Renderer frame time', reset, true);
    if (frames.length < 2) {
      section.append(el('div', 'Not enough frames captured yet.', 'tla-empty'));
      return section;
    }
    const values = frames.map((frame) => frame.cpu_ms!);
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const max = Math.max(...values, 0.001);
    const bars = el('div', undefined, 'tla-timeline');
    for (const frame of frames) {
      const bar = el('button');
      bar.type = 'button';
      bar.style.height = `${Math.max(2, (frame.cpu_ms! / max) * 100)}%`;
      bar.title = `Frame ${frame.frame}: ${frame.cpu_ms!.toFixed(2)} ms (${frame.cpu_fidelity})`;
      bar.setAttribute('aria-label', bar.title);
      if (frame.cpu_ms! > Math.max(median * 2, median + 0.5)) bar.dataset.spike = 'true';
      if (live === frame.frame) bar.dataset.selected = 'true';
      bar.addEventListener('click', () => { lens.setFrame(frame.frame); refresh(true); });
      bars.append(bar);
    }
    section.append(bars);
    const axis = el('div', undefined, 'tla-axis');
    axis.append(
      el('span', `frame ${frames[0].frame}`),
      el('span', `median ${median.toFixed(2)} ms · max ${max.toFixed(2)} ms`),
      el('span', `frame ${frames[frames.length - 1].frame}`)
    );
    section.append(axis);
    const level = frames.every((frame) => frame.cpu_fidelity === 'EXACT') ? 'EXACT' : 'ESTIMATED';
    const note = el('p', 'Renderer-level CPU time per render call. ', 'tla-fine');
    note.append(badge(level), el('span', ' Amber bars exceed twice the median. Selecting a frame pins the whole workspace to it.'));
    section.append(note);
    return section;
  }

  function pathCard(id: string | undefined): HTMLElement {
    const { el } = dom();
    const section = card('Why it is here: usage path', undefined, true);
    if (!id || !lens.getNode(id)) {
      section.append(el('div', 'Select an entity to see how it is reached and what it uses.', 'tla-empty'));
      return section;
    }
    const brief = describeEntity(lens, id, false)!;
    const chain = el('div', undefined, 'tla-chain');
    const chip = (node: Node, current = false, note?: string) => {
      const span = el('span', undefined, 'tla-chip');
      if (current) span.dataset.current = 'true';
      span.append(link(node.id, node.name || node.type), el('small', note ?? node.type));
      return span;
    };
    brief.path.forEach((node, index) => {
      if (index) chain.append(el('span', '→', 'tla-arrow'));
      chain.append(chip(node, node.id === id));
    });
    const outgoing = brief.usedBy.length ? [] : brief.resources;
    if (outgoing.length) {
      chain.append(el('span', 'uses →', 'tla-arrow'));
      for (const resource of outgoing.slice(0, 6)) {
        const share = resource.share && resource.share.users > 1 ? `${Math.round(resource.share.weight * 100)}% share` : resource.node.type;
        chain.append(chip(resource.node, false, share));
      }
    }
    section.append(chain);
    if (brief.usedBy.length) {
      const cost = lens.query<Result<ResourceCost>>('resource_cost', { entity_id: id })?.data;
      section.append(el('div', `Used by ${brief.usedBy.length} ${brief.usedBy.length === 1 ? 'entity' : 'entities'}:`, 'tla-fine'));
      const users = el('div', undefined, 'tla-chain');
      const weights = new Map<string, number>((cost?.primary_entities ?? []).map((entry): [string, number] => [entry.entity_id, entry.weight]));
      for (const user of brief.usedBy.slice(0, 12)) {
        const weight = weights.get(user.id);
        users.append(chip(user, false, weight !== undefined ? `${(weight * 100).toFixed(0)}% share` : user.type));
      }
      section.append(users);
      if (cost) {
        const note = el('p', undefined, 'tla-fine');
        note.append(badge(cost.fidelity, cost.reason), el('span', ` ${cost.reason}`));
        section.append(note);
      }
    } else if (outgoing.length) {
      const note = el('p', undefined, 'tla-fine');
      note.append(badge('ESTIMATED'), el('span', ' Shares divide a resource’s captured storage equally across its observed users; they are not measured per-object allocation.'));
      section.append(note);
    }
    return section;
  }

  /* ---------------------------------------------------------------- page */
  function snapshotNow(): PlatformSnapshot | undefined {
    return lens.query<Result<PlatformSnapshot>>('platform_snapshot', {
      context_id: lens.getActiveContext()?.id,
      limit: 120,
    })?.data;
  }

  function refresh(force = false) {
    if (!page || !body || !opened || allTools) return;
    const { el } = dom();
    const id = lens.getSelection().entity_ids[0] as string | undefined;
    const snapshot = snapshotNow();
    const key = JSON.stringify([
      id,
      options.baselineSet(),
      lens.getMode(),
      lens.getSelectedFrame(),
      snapshot?.frames.at(-1)?.frame,
      lens.getGraph().getNodes().nodes.length,
    ]);
    if (!force && key === lastKey) return;
    lastKey = key;
    const scroll = body.scrollTop;
    body.replaceChildren(
      subjectCard(id),
      changesCard(id),
      hotspotsCard(id),
      timelineCard(snapshot),
      pathCard(id)
    );
    body.scrollTop = scroll;
    const status = page.querySelector<HTMLElement>('.tla-status');
    if (status) {
      const offline = lens.getMode() === 'offline';
      status.textContent = offline ? 'SAVED TRACE' : 'LIVE';
      status.dataset.state = offline ? 'trace' : 'live';
    }
    void el;
  }

  function build() {
    const { el } = dom();
    page = el('div', undefined, 'tlh tla');
    page.dataset.embedded = String(!popup);
    page.dataset.threeLens = 'analysis';
    const bar = el('header', undefined, 'tla-bar');
    bar.append(el('h1', '3Lens · Investigation'));
    const status = el('span', 'LIVE', 'tla-status');
    bar.append(status, el('span', undefined, 'grow'));
    bar.append(
      button('Set baseline', options.setBaseline),
      button('Export trace', () => {
        void lens.exportTrace({ profile: 'STANDARD' }).then((blob) => {
          const api = doc.defaultView?.URL ?? URL;
          const url = api.createObjectURL(blob);
          const a = doc.createElement('a');
          a.href = url;
          a.download = '3lens-investigation.json';
          a.click();
          setTimeout(() => api.revokeObjectURL(url), 1000);
        });
      }),
      button('All tools', showTools),
      ...(!popup ? [button('Close', close)] : [])
    );
    body = el('main', undefined, 'tla-body');
    page.append(bar, body);
    toolsButton = button('← Investigation', hideTools);
    toolsButton.classList.add('tla-tools');
    toolsButton.hidden = true;
    page.append(toolsButton);
  }

  function showTools() {
    if (!page) return;
    allTools = true;
    if (!tools) {
      tools = createInvestigationUI({ document: doc, layout: 'workspace', surface: 'window', csp: options.csp, readonly: options.readonly });
    }
    tools.show(lens);
    page.querySelector<HTMLElement>('.tla-bar')!.hidden = true;
    body!.hidden = true;
    page.style.background = 'transparent';
    page.style.pointerEvents = 'none';
    toolsButton!.hidden = false;
    toolsButton!.style.pointerEvents = 'auto';
  }
  function hideTools() {
    if (!page) return;
    allTools = false;
    tools?.hide();
    page.querySelector<HTMLElement>('.tla-bar')!.hidden = false;
    body!.hidden = false;
    page.style.background = '';
    page.style.pointerEvents = '';
    toolsButton!.hidden = true;
    refresh(true);
  }

  function open() {
    if (opened && page) {
      popup?.focus?.();
      refresh(true);
      return;
    }
    const win = options.document.defaultView;
    if (options.mode === 'window' && win) {
      popup = win.open('', '3lens-analysis', 'width=1280,height=860');
      if (!popup) options.notify('The analysis window was blocked by the browser; showing it in the page instead.');
    }
    doc = popup?.document ?? options.document;
    if (popup) {
      popup.document.title = '3Lens — Investigation';
      popup.document.body.replaceChildren();
      popup.document.body.style.margin = '0';
      popup.addEventListener('pagehide', teardown, { once: true });
    }
    const css = hudStyles;
    if (options.csp?.cssUrl) {
      const l = doc.createElement('link');
      l.rel = 'stylesheet';
      l.href = options.csp.cssUrl;
      style = l;
    } else {
      const s = doc.createElement('style');
      s.textContent = css;
      if (options.csp?.styleNonce) s.nonce = options.csp.styleNonce;
      style = s;
    }
    doc.head.append(style);
    build();
    doc.body.append(page!);
    opened = true;
    unsubscribe = lens.onSelectionChange(() => refresh());
    timer = setInterval(() => refresh(), 1500);
    refresh(true);
  }

  function teardown() {
    opened = false;
    allTools = false;
    clearInterval(timer);
    unsubscribe?.();
    unsubscribe = undefined;
    tools?.dispose();
    tools = undefined;
    page?.remove();
    style?.remove();
    page = body = undefined;
    popup = null;
    doc = options.document;
    lastKey = '';
    options.onClose();
  }
  function close() {
    const closing = popup;
    teardown();
    if (closing && !closing.closed) closing.close();
  }

  return {
    open,
    close,
    isOpen: () => opened,
    dispose() {
      if (opened) close();
    },
  };
}
