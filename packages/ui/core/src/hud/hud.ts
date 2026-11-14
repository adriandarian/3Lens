/**
 * Quiet HUD: the default way 3Lens lives on top of someone else's application.
 *
 * It never moves or resizes host DOM. Surfaces:
 *  - status pills (top): live state, capture mode, frame cost, overhead, pick / palette
 *  - pick card: anchored to the selected entity, answers What / Uses / Cost / Changed
 *  - rail + drawer: search-first, ranked "worth looking at"
 *  - command palette (Ctrl/Cmd+K): investigative questions + commands + entities
 *  - analysis window: heavy investigation tools in a separate window (see analysis.ts)
 *
 * Only Ctrl/Cmd+K, F2, Esc and Alt+click are bound, so the tool does not steal
 * the host application's own shortcuts.
 */
import type { Lens } from '@3lens/runtime';
import type { CaptureMode, Node } from '@3lens/kernel';
import { uiDom } from '../platform/dom';
import { createAnalysis, type AnalysisController } from './analysis';
import {
  QUESTIONS,
  describeChange,
  describeEntity,
  formatBytes,
  searchEntities,
  worthLookingAt,
  type EntityBrief,
  type Fact,
  type Insight,
} from './data';
import { hudStyles } from './styles';

/** Screen edges covered by the HUD (same shape as the workspace insets). */
export interface HudInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface HudOptions {
  document?: Document;
  readonly?: boolean;
  /** `window` opens a separate browser window (falls back to an in-page panel if blocked). */
  analysis?: 'window' | 'panel';
  onInsets?: (insets: HudInsets) => void;
  /** Called for F2. Defaults to `lens.toggleUI()`; framework mounts that own the HUD handle override it. */
  onToggle?: () => void;
  csp?: { styleNonce?: string; cssUrl?: string; safeMode?: boolean };
}

/** Structurally a `LensUIAdapter` (show/hide/dispose) plus programmatic entry points. */
export interface LensHud {
  show(lens: Lens): void;
  hide(): void;
  dispose(): void;
  openPalette(): void;
  openDrawer(mode?: 'worth' | 'search'): void;
  closeDrawer(): void;
  openAnalysis(): void;
  isVisible(): boolean;
}

const RAIL_WIDTH = 56;
const DRAWER_WIDTH = 360;

interface Row {
  title: string;
  detail?: string;
  why?: string;
  hint?: string;
  fidelity?: Fact['fidelity'];
  reason?: string;
  run(): void;
}

export function createLensHud(options: HudOptions = {}): LensHud {
  const doc = options.document ?? (typeof document !== 'undefined' ? document : undefined);
  const win = doc?.defaultView;
  const dom = doc ? uiDom(doc) : undefined;
  let lens: Lens;
  let root: HTMLElement | undefined;
  let style: HTMLElement | undefined;
  let pills: HTMLElement;
  let card: HTMLElement;
  let outline: HTMLElement;
  let drawer: HTMLElement;
  let drawerList: HTMLElement;
  let drawerInput: HTMLInputElement;
  let rail: HTMLElement;
  let backdrop: HTMLElement;
  let paletteInput: HTMLInputElement;
  let paletteList: HTMLElement;
  let fileInput: HTMLInputElement;
  let analysis: AnalysisController | undefined;
  let shown = false;
  let disposed = false;
  let picking = false;
  let highlighted = false;
  // Baselines saved from this HUD. A loaded trace always carries its own investigation baseline.
  let localBaseline = false;
  const hasBaseline = () => localBaseline || lens?.getMode() === 'offline';
  let drawerOpen = false;
  let paletteOpen = false;
  let cardDismissed: string | undefined;
  let cardKey = '';
  let lastInsets = '';
  let paletteState: { question?: (typeof QUESTIONS)[number]; marker?: boolean } = {};
  let message = '';
  let messageTimer: ReturnType<typeof setTimeout> | undefined;
  const cleanups: (() => void)[] = [];
  const stats = { frameMs: 0, fps: 0, calls: 0, triangles: 0, lastBegin: 0, frames: 0 };

  const canMutate = () =>
    !options.readonly && !!lens && lens.getMode() === 'live' && lens.getSelectedFrame() === null;
  const selected = () => lens.getSelection().entity_ids[0] as string | undefined;

  /* ------------------------------------------------------------------ helpers */
  function notify(text: string) {
    message = text;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      message = '';
      renderPills();
    }, 4000);
    renderPills();
  }
  function icon(name: string) {
    const svg = dom!.icon(name);
    svg.classList.add('tlh-icon');
    return svg;
  }
  function btn(label: string, action: () => void, symbol?: string, primary = false) {
    const node = dom!.el('button', undefined, 'tlh-btn');
    node.type = 'button';
    if (primary) node.dataset.primary = 'true';
    if (symbol) node.append(icon(symbol));
    node.append(dom!.el('span', label));
    node.addEventListener('click', action);
    return node;
  }
  function badge(fidelity: Fact['fidelity'], reason?: string) {
    const node = dom!.el('span', fidelity, 'tlh-badge');
    node.dataset.fidelity = fidelity;
    node.title =
      reason ??
      (fidelity === 'EXACT'
        ? 'Observed in captured data'
        : fidelity === 'ESTIMATED'
          ? 'Derived from a proxy; see the reason'
          : 'Not observable with the current host');
    return node;
  }
  function chooseEntity(id: string) {
    cardDismissed = undefined;
    const node = lens.getNode(id);
    if (node && lens.getActiveContext()?.id !== node.context_id) lens.setActiveContext(node.context_id);
    lens.select(id, { source: 'user_click' });
    if (highlighted) lens.highlight(id);
  }
  function emitInsets() {
    if (!win || !doc) return;
    const insets: HudInsets = {
      top: 0,
      left: 0,
      bottom: 0,
      right: shown && drawerOpen ? RAIL_WIDTH + DRAWER_WIDTH + 8 : 0,
    };
    const key = JSON.stringify(insets);
    if (key === lastInsets) return;
    lastInsets = key;
    doc.documentElement.style.setProperty('--3lens-inset-right', `${insets.right}px`);
    options.onInsets?.(insets);
    win.dispatchEvent(new CustomEvent('3lens:insets', { detail: insets }));
  }

  /* ------------------------------------------------------------------ pills */
  function renderPills() {
    if (!pills || !dom) return;
    const { el } = dom;
    const offline = lens.getMode() === 'offline';
    const metrics = lens.getOverheadMetrics();
    const next: HTMLElement[] = [];
    const status = el('span', offline ? 'SAVED TRACE' : 'LIVE', 'tlh-pill');
    status.dataset.kind = 'status';
    status.dataset.state = offline ? 'trace' : 'live';
    status.title = offline
      ? 'Inspecting a saved trace; live capture is detached.'
      : 'Capturing the running application.';
    next.push(status);
    const mode = el('span', undefined, 'tlh-pill');
    const select = el('select');
    select.setAttribute('aria-label', 'Capture mode');
    for (const value of ['MINIMAL', 'STANDARD', 'DEEP'] as CaptureMode[]) {
      const option = el('option', value);
      option.value = value;
      select.append(option);
    }
    select.value = metrics.currentMode;
    select.disabled = offline || !!options.readonly;
    select.title =
      metrics.currentMode === 'DEEP'
        ? 'DEEP capture is active; expect higher overhead.'
        : 'Capture mode. DEEP requires an explicit choice.';
    select.addEventListener('change', () => {
      lens.setCaptureMode(select.value as CaptureMode);
      notify(`Capture mode: ${select.value}`);
    });
    mode.append(select);
    next.push(mode);
    if (!offline) {
      const metric = (label: string, value: string) => {
        const pill = el('span', undefined, 'tlh-pill');
        pill.append(el('span', label, 'k'), el('b', value));
        return pill;
      };
      next.push(
        metric('frame', stats.frames ? `${stats.frameMs.toFixed(2)} ms` : '—'),
        metric('fps', stats.fps ? String(Math.round(stats.fps)) : '—'),
        metric('calls', stats.frames ? String(stats.calls) : '—')
      );
      const overhead = metric('overhead', `${metrics.captureTimeMs.toFixed(2)} ms`);
      overhead.title =
        'Measured time 3Lens spends capturing per frame (events plus scene scans).';
      if (metrics.captureTimeMs > 2) overhead.dataset.kind = 'warn';
      if (metrics.dropCount) overhead.append(el('span', `${metrics.dropCount} dropped`, 'k'));
      next.push(overhead);
    }
    const pick = el('button', undefined, 'tlh-pill');
    pick.type = 'button';
    pick.dataset.active = String(picking);
    pick.append(icon('pick'), el('span', picking ? 'Click an object…' : 'Pick'));
    pick.disabled = !canMutate();
    pick.title = 'Pick an object in the application (or Alt+click it).';
    pick.addEventListener('click', () => setPicking(!picking));
    next.push(pick);
    const search = el('button', undefined, 'tlh-pill');
    search.type = 'button';
    search.append(icon('search'), el('span', 'Search'), el('kbd', 'Ctrl K'));
    search.addEventListener('click', openPalette);
    next.push(search);
    if (message) {
      const note = el('span', message, 'tlh-pill');
      note.setAttribute('role', 'status');
      next.push(note);
    }
    pills.replaceChildren(...next);
  }

  function setPicking(value: boolean) {
    if (value && !canMutate()) {
      notify('Picking needs a live capture at the latest frame.');
      return;
    }
    picking = value;
    doc?.documentElement.classList.toggle('tlh-picking', picking);
    renderPills();
  }

  /* ------------------------------------------------------------------ pick card */
  function cardModel(brief: EntityBrief) {
    const node = lens.getNode(brief.id)!;
    const p = node as unknown as Record<string, any>;
    const whatBits = [p.object_type ?? node.type];
    if (typeof p.child_count === 'number' && p.child_count) whatBits.push(`${p.child_count} children`);
    if (p.visible === false) whatBits.push('hidden');
    if (p.vertex_count) whatBits.push(`${p.vertex_count} vertices`);
    if (p.width && p.height) whatBits.push(`${p.width}×${p.height}`);
    const relations = brief.usedBy.length
      ? { label: 'Used by', items: brief.usedBy.map((user) => ({ id: user.id, text: user.name || user.type })) }
      : brief.resources.length
        ? { label: 'Uses', items: brief.resources.map((resource) => ({ id: resource.node.id, text: `${resource.node.name || resource.node.type}` })) }
        : { label: 'Uses', items: [] };
    const cost = brief.resources
      .filter((resource) => 'memory_bytes' in (resource.node as object))
      .map((resource) => ({
        id: resource.node.id,
        text: resource.label,
        value: resource.value,
        fidelity: resource.fidelity,
        reason: resource.reason,
        shared: resource.share && resource.share.users > 1 ? resource.share.users : 0,
      }));
    const own = 'memory_bytes' in (node as object)
      ? {
          id: node.id,
          text: node.name || node.type,
          value:
            p.memory_fidelity === 'UNAVAILABLE'
              ? `${p.width && p.height ? `${p.width}×${p.height} · ` : ''}storage unavailable`
              : formatBytes(p.memory_bytes),
          fidelity: p.memory_fidelity ?? 'UNAVAILABLE',
          reason: p.memory_reason as string | undefined,
          shared: brief.usedBy.length > 1 ? brief.usedBy.length : 0,
        }
      : undefined;
    return {
      id: brief.id,
      name: brief.name,
      type: brief.type,
      what: whatBits.join(' · '),
      relations,
      cost: own ? [own, ...cost] : cost,
      changed: !hasBaseline()
        ? 'no-baseline'
        : brief.changes
          ? describeChange(brief.changes)
          : 'unchanged',
      mutate: canMutate(),
      highlighted,
    };
  }

  function renderCard(force = false) {
    if (!card || !dom) return;
    const id = selected();
    if (!id || cardDismissed === id || !shown) {
      card.hidden = true;
      outline.hidden = true;
      cardKey = '';
      return;
    }
    const brief = describeEntity(lens, id, hasBaseline());
    if (!brief || !lens.getNode(id)) {
      card.hidden = true;
      outline.hidden = true;
      return;
    }
    const model = cardModel(brief);
    const key = JSON.stringify(model);
    card.hidden = false;
    if (key !== cardKey || force) {
      cardKey = key;
      paintCard(model);
    }
    positionCard();
  }

  function paintCard(model: ReturnType<typeof cardModel>) {
    const { el } = dom!;
    const header = el('header');
    const title = el('div');
    title.append(el('div', model.name, 'name'));
    const meta = el('div', undefined, 'meta');
    const code = el('code', model.id);
    code.title = model.id;
    const copy = el('button', 'copy', 'tlh-x');
    copy.type = 'button';
    copy.textContent = '';
    copy.append(icon('copy'));
    copy.title = 'Copy entity ID';
    copy.addEventListener('click', () => {
      void win?.navigator?.clipboard?.writeText(model.id).catch(() => undefined);
      notify('Entity ID copied');
    });
    meta.append(code, copy);
    title.append(meta);
    const close = el('button', undefined, 'tlh-x');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close card');
    close.append(icon('close'));
    close.addEventListener('click', () => {
      cardDismissed = model.id;
      if (highlighted) {
        lens.highlight(null);
        highlighted = false;
      }
      renderCard();
    });
    header.append(title, close);

    const facts = el('dl', undefined, 'tlh-facts');
    const row = (label: string, ...content: HTMLElement[]) => {
      facts.append(el('dt', label), (() => {
        const dd = el('dd');
        dd.append(...content);
        return dd;
      })());
    };
    row('What', el('span', `${model.type} · ${model.what}`));
    const linkLine = (id: string, text: string, value?: string, fidelity?: Fact['fidelity'], reason?: string) => {
      const line = el('div', undefined, 'tlh-line');
      const link = el('button', text, 'link');
      link.type = 'button';
      link.title = `Select ${text}`;
      link.addEventListener('click', () => chooseEntity(id));
      line.append(link);
      if (value) line.append(el('span', value, 'v'));
      if (fidelity) line.append(badge(fidelity, reason));
      return line;
    };
    if (model.relations.items.length) {
      const items: HTMLElement[] = model.relations.items.slice(0, 4).map((item) => linkLine(item.id, item.text));
      if (model.relations.items.length > 4)
        items.push(el('span', `+${model.relations.items.length - 4} more`, 'tlh-note'));
      row(model.relations.label, ...items);
    }
    if (model.cost.length) {
      const lines: HTMLElement[] = model.cost.slice(0, 4).map((item) =>
        linkLine(item.id, item.text, item.value + (item.shared ? ` · shared ×${item.shared}` : ''), item.fidelity, item.reason)
      );
      const unavailable = model.cost.find((item) => item.fidelity === 'UNAVAILABLE' && item.reason);
      if (unavailable) lines.push(el('span', unavailable.reason!, 'tlh-note'));
      row('Cost', ...lines);
    }
    const timing = el('div', undefined, 'tlh-line');
    timing.append(el('span', 'CPU / GPU per object', 'v'), badge('UNAVAILABLE', 'Only renderer-level CPU time is observed; it is not attributed to individual objects.'));
    row('Timing', timing);
    if (model.changed === 'no-baseline') {
      const set = btn('Set baseline', () => setBaseline(), 'flag');
      set.disabled = !canMutate();
      row('Changed', el('span', 'No baseline yet — set one, change something, then look here.', 'tlh-note'), set);
    } else if (model.changed === 'unchanged') {
      const line = el('div', undefined, 'tlh-line');
      line.append(el('span', 'No change since baseline', 'v'), badge('EXACT'));
      row('Changed', line);
    } else {
      const lines = (model.changed as string[]).map((text) => el('span', text));
      lines.push(badge('EXACT', 'Compared property-by-property against the saved baseline'));
      row('Changed', ...lines);
    }

    const actions = el('div', undefined, 'tlh-actions');
    const highlight = btn(model.highlighted ? 'Unhighlight' : 'Highlight', () => {
      highlighted = !highlighted && lens.highlight(model.id);
      if (!highlighted) lens.highlight(null);
      renderCard(true);
    });
    highlight.disabled = !model.mutate;
    const focus = btn('Focus', () => notify(lens.focus(model.id) ? 'Camera focused' : 'Focus unavailable'), 'focus');
    focus.disabled = !model.mutate;
    actions.append(highlight, focus, btn('Open in analysis window', openAnalysis, 'surfaces', true));
    card.replaceChildren(header, facts, actions);
  }

  let positionCost = 0;
  let lastPosition = 0;
  function positionCard() {
    if (!card || card.hidden || !win) return;
    const id = selected();
    const now = performance.now();
    // Adapt: never spend more than ~0.4 ms per frame on anchoring; fall back to 10 Hz.
    if (positionCost > 0.4 && now - lastPosition < 100) return;
    lastPosition = now;
    const start = performance.now();
    const viewport = lens.getViewportBounds();
    const bounds = id && canMutate() ? lens.getSelectionBounds(id) : null;
    const width = card.offsetWidth || 320;
    const height = card.offsetHeight || 260;
    const rightLimit = win.innerWidth - (drawerOpen ? RAIL_WIDTH + DRAWER_WIDTH + 12 : RAIL_WIDTH + 4);
    let x = 16;
    let y = 56;
    if (viewport && bounds) {
      const box = {
        x: viewport.x + bounds.x * viewport.width,
        y: viewport.y + bounds.y * viewport.height,
        width: bounds.width * viewport.width,
        height: bounds.height * viewport.height,
      };
      outline.hidden = false;
      outline.style.cssText = `left:${box.x}px;top:${box.y}px;width:${box.width}px;height:${box.height}px`;
      x = box.x + box.width + 14;
      if (x + width > rightLimit) x = box.x - width - 14;
      if (x < 12) x = Math.min(Math.max(12, box.x), Math.max(12, rightLimit - width));
      y = box.y;
    } else outline.hidden = true;
    x = Math.min(Math.max(12, x), Math.max(12, rightLimit - width));
    y = Math.min(Math.max(52, y), Math.max(52, win.innerHeight - height - 12));
    card.style.left = `${Math.round(x)}px`;
    card.style.top = `${Math.round(y)}px`;
    positionCost = positionCost * 0.8 + (performance.now() - start) * 0.2;
  }

  /* ------------------------------------------------------------------ baseline / actions */
  function setBaseline() {
    if (!canMutate()) return;
    lens.captureBaseline();
    localBaseline = true;
    notify('Baseline saved. Change something, then check What changed.');
    renderCard(true);
    refreshDrawer();
  }
  async function exportTrace() {
    const blob = await lens.exportTrace({ profile: 'STANDARD' });
    const api = win?.URL ?? URL;
    const url = api.createObjectURL(blob);
    const link = doc!.createElement('a');
    link.href = url;
    link.download = '3lens-investigation.json';
    link.click();
    setTimeout(() => api.revokeObjectURL(url), 1000);
    notify('Trace exported with entities, selection and baseline.');
  }
  function openAnalysis() {
    analysis ??= createAnalysis({
      lens,
      document: doc!,
      mode: options.analysis ?? 'window',
      readonly: options.readonly,
      csp: options.csp,
      baselineSet: hasBaseline,
      setBaseline,
      notify,
      onClose: () => undefined,
    });
    analysis.open();
  }

  /* ------------------------------------------------------------------ lists (drawer + palette) */
  function renderRows(container: HTMLElement, rows: Row[], groupTitle?: string) {
    const { el } = dom!;
    if (groupTitle) container.append(el('h3', groupTitle, 'tlh-group-title'));
    for (const item of rows) {
      const rowEl = el('button', undefined, 'tlh-row');
      rowEl.type = 'button';
      rowEl.dataset.row = 'true';
      rowEl.append(el('span', item.title, 't'));
      const right = el('span');
      if (item.fidelity) right.append(badge(item.fidelity, item.reason));
      else if (item.hint) right.append(el('kbd', item.hint));
      rowEl.append(right);
      if (item.detail) rowEl.append(el('span', item.detail, 'd'));
      if (item.why) rowEl.append(el('span', item.why, 'w'));
      rowEl.addEventListener('click', item.run);
      container.append(rowEl);
    }
  }
  function moveActive(container: HTMLElement, delta: number) {
    const rows = [...container.querySelectorAll<HTMLElement>('[data-row]')];
    if (!rows.length) return;
    const current = rows.findIndex((row) => row.dataset.active === 'true');
    rows.forEach((row) => delete row.dataset.active);
    // delta 0 (re-render) resets to the first row; otherwise wrap around.
    const index = delta === 0 || current < 0 && delta > 0 ? 0 : (current + delta + rows.length) % rows.length;
    const next = rows[index] ?? rows[0];
    next.dataset.active = 'true';
    next.scrollIntoView?.({ block: 'nearest' });
  }
  function activate(container: HTMLElement) {
    (container.querySelector<HTMLElement>('[data-active=true]') ?? container.querySelector<HTMLElement>('[data-row]'))?.click();
  }
  const insightRow = (insight: Insight, after?: () => void): Row => ({
    title: insight.title,
    detail: insight.detail,
    why: insight.why,
    fidelity: insight.fidelity,
    reason: insight.reason,
    run() {
      after?.();
      if (insight.kind === 'frame') {
        const frame = Number(insight.id.split(':')[1]);
        if (Number.isFinite(frame)) lens.setFrame(frame);
      }
      chooseEntity(insight.entityId);
    },
  });

  /* ------------------------------------------------------------------ drawer */
  function refreshDrawer() {
    if (!drawerOpen || !dom) return;
    const { el } = dom;
    const query = drawerInput.value.trim();
    const rows = el('div');
    if (query) {
      const found = searchEntities(lens, query, 12);
      if (found.length)
        renderRows(
          rows,
          found.map((node) => entityRow(node, () => undefined)),
          'Entities'
        );
      else rows.append(el('div', `No captured entity matches “${query}”.`, 'tlh-empty'));
    } else {
      const insights = worthLookingAt(lens, hasBaseline());
      if (!hasBaseline()) {
        const hint = el('div', undefined, 'tlh-empty');
        hint.append(
          el('span', 'Set a baseline to rank what changed after your next edit.'),
          el('br'),
          btn('Set baseline', setBaseline, 'flag')
        );
        rows.append(hint);
      }
      if (insights.length) {
        const kinds: [Insight['kind'], string][] = [
          ['changed', 'Changed since baseline'],
          ['unreferenced', 'Lifecycle'],
          ['frame', 'Slow frames'],
          ['memory', 'Largest storage'],
          ['shared', 'Shared resources'],
        ];
        for (const [kind, title] of kinds) {
          const group = insights.filter((insight) => insight.kind === kind);
          if (group.length) renderRows(rows, group.map((insight) => insightRow(insight)), title);
        }
      } else if (hasBaseline())
        rows.append(el('div', 'Nothing stands out. Captured data shows no changes, leaks, or outliers.', 'tlh-empty'));
      if (hasBaseline() && !insights.some((insight) => insight.kind === 'changed'))
        rows.prepend(el('div', 'Baseline set: no entity has changed since. Edit the scene and this list updates.', 'tlh-empty'));
    }
    drawerList.replaceChildren(rows);
  }
  function entityRow(node: Node, after: () => void): Row {
    return {
      title: node.name || node.type,
      detail: node.id,
      hint: node.type,
      run() {
        after();
        chooseEntity(node.id);
      },
    };
  }
  function openDrawer(mode: 'worth' | 'search' = 'worth') {
    if (!root) return;
    drawerOpen = true;
    root.dataset.drawer = 'true';
    drawer.hidden = false;
    rail.querySelector('[data-rail=drawer]')?.setAttribute('data-active', 'true');
    refreshDrawer();
    emitInsets();
    if (mode === 'search') drawerInput.focus();
    renderCard(true);
  }
  function closeDrawer() {
    drawerOpen = false;
    if (root) root.dataset.drawer = 'false';
    if (drawer) drawer.hidden = true;
    rail?.querySelector('[data-rail=drawer]')?.removeAttribute('data-active');
    emitInsets();
    renderCard(true);
  }

  /* ------------------------------------------------------------------ palette */
  function paletteCommands(): Row[] {
    const live = canMutate();
    const commands: (Row & { enabled?: boolean })[] = [
      { title: 'Pick an object in the application', hint: 'Alt+click', run: () => setPicking(true), enabled: live },
      { title: 'Focus the camera on the selection', hint: 'Action', run: () => notify(lens.focus() ? 'Camera focused' : 'Focus unavailable'), enabled: live && !!selected() },
      { title: 'Set baseline', hint: 'Capture', run: setBaseline, enabled: live },
      { title: 'Add timeline marker…', hint: 'Capture', run: () => { paletteState = { marker: true }; paletteInput.value = ''; paletteInput.placeholder = 'Marker name, e.g. After texture resize'; renderPalette(); }, enabled: live },
      { title: 'Open analysis window', hint: 'Window', run: openAnalysis },
      { title: 'Toggle “worth looking at” drawer', hint: 'View', run: () => (drawerOpen ? closeDrawer() : openDrawer('worth')) },
      { title: 'Export trace', hint: 'Save', run: () => void exportTrace().catch((error) => notify(String(error))) },
      { title: 'Open saved trace…', hint: 'Load', run: () => fileInput.click() },
      { title: 'Capture mode: STANDARD', hint: 'Mode', run: () => { lens.setCaptureMode('STANDARD'); notify('Capture mode: STANDARD'); }, enabled: live },
      { title: 'Capture mode: DEEP (higher overhead)', hint: 'Mode', run: () => { lens.setCaptureMode('DEEP'); notify('Capture mode: DEEP'); }, enabled: live },
      { title: 'Hide 3Lens', hint: 'F2', run: () => lens.hideUI() },
    ];
    return commands.filter((command) => command.enabled !== false);
  }
  function renderPalette() {
    if (!paletteOpen || !dom) return;
    const { el } = dom;
    const close = () => closePalette();
    const query = paletteInput.value.trim().toLowerCase();
    const content = el('div');
    if (paletteState.marker) {
      content.append(el('div', 'Press Enter to record a marker at the current frame.', 'tlh-empty'));
    } else if (paletteState.question) {
      const question = paletteState.question;
      const back = btn('All questions', () => { paletteState = {}; paletteInput.value = ''; paletteInput.placeholder = 'Ask a question, run a command, or find an entity…'; renderPalette(); });
      const head = el('div', undefined, 'tlh-group-title');
      head.append(el('span', question.label), back);
      content.append(head);
      const results = question.run(lens, hasBaseline());
      if (results.length) renderRows(content, results.map((insight) => insightRow(insight, close)));
      else
        content.append(
          el(
            'div',
            question.id === 'changed' && !hasBaseline()
              ? 'No baseline yet. Run “Set baseline”, make a change, then ask again.'
              : 'No captured evidence answers this right now.',
            'tlh-empty'
          )
        );
    } else {
      const questions = QUESTIONS.filter((candidate) => !query || candidate.label.toLowerCase().includes(query));
      if (questions.length)
        renderRows(
          content,
          questions.map((question) => ({
            title: question.label,
            hint: question.hint,
            run: () => {
              paletteState = { question };
              paletteInput.value = '';
              renderPalette();
              paletteInput.focus();
            },
          })),
          'Investigate'
        );
      const commands = paletteCommands().filter((command) => !query || command.title.toLowerCase().includes(query));
      if (commands.length)
        renderRows(content, commands.map((command) => ({ ...command, run: () => { const wasMarker = command.title.startsWith('Add timeline'); if (!wasMarker) close(); command.run(); } })), 'Commands');
      if (query) {
        const found = searchEntities(lens, query, 8);
        if (found.length) renderRows(content, found.map((node) => entityRow(node, close)), 'Entities');
      }
    }
    paletteList.replaceChildren(content);
    moveActive(paletteList, 0);
  }
  function openPalette() {
    if (!root || paletteOpen) return;
    paletteOpen = true;
    paletteState = {};
    backdrop.hidden = false;
    paletteInput.value = '';
    paletteInput.placeholder = 'Ask a question, run a command, or find an entity…';
    renderPalette();
    paletteInput.focus();
  }
  function closePalette() {
    paletteOpen = false;
    if (backdrop) backdrop.hidden = true;
  }

  /* ------------------------------------------------------------------ mount */
  function mount() {
    if (!doc || !dom || root) return;
    const { el } = dom;
    const css = hudStyles;
    if (options.csp?.cssUrl) {
      const link = el('link');
      link.rel = 'stylesheet';
      link.href = options.csp.cssUrl;
      style = link;
    } else if (!options.csp?.safeMode || options.csp.styleNonce) {
      const node = el('style', css);
      if (options.csp?.styleNonce) node.nonce = options.csp.styleNonce;
      style = node;
    }
    if (style) doc.head.append(style);
    const picker = el('style', 'html.tlh-picking,html.tlh-picking *{cursor:crosshair!important}');
    if (options.csp?.styleNonce) picker.nonce = options.csp.styleNonce;
    doc.head.append(picker);
    cleanups.push(() => picker.remove());

    root = el('div', undefined, 'tlh tlh-root');
    root.dataset.threeLens = 'hud';
    root.setAttribute('aria-label', '3Lens');
    pills = el('div', undefined, 'tlh-pills');
    pills.setAttribute('role', 'toolbar');
    pills.setAttribute('aria-label', '3Lens status');
    outline = el('div', undefined, 'tlh-outline');
    outline.hidden = true;
    card = el('aside', undefined, 'tlh-card');
    card.setAttribute('aria-label', 'Selected entity');
    card.hidden = true;

    rail = el('nav', undefined, 'tlh-rail');
    rail.setAttribute('aria-label', '3Lens tools');
    const railButton = (key: string, label: string, symbol: string, action: () => void) => {
      const button = el('button');
      button.type = 'button';
      button.dataset.rail = key;
      button.title = label;
      button.setAttribute('aria-label', label);
      button.append(icon(symbol));
      button.addEventListener('click', action);
      return button;
    };
    rail.append(
      railButton('search', 'Search (Ctrl K)', 'search', openPalette),
      railButton('drawer', 'Worth looking at', 'light', () => (drawerOpen ? closeDrawer() : openDrawer('worth'))),
      railButton('analysis', 'Analysis window', 'surfaces', openAnalysis),
      railButton('baseline', 'Set baseline', 'flag', setBaseline)
    );

    drawer = el('section', undefined, 'tlh-drawer');
    drawer.hidden = true;
    drawer.setAttribute('aria-label', 'Worth looking at');
    const searchBar = el('div', undefined, 'tlh-search');
    searchBar.append(icon('search'));
    drawerInput = el('input');
    drawerInput.placeholder = 'Search entities…';
    drawerInput.setAttribute('aria-label', 'Search entities');
    searchBar.append(drawerInput);
    const closeBtn = el('button', undefined, 'tlh-x');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close drawer');
    closeBtn.append(icon('close'));
    closeBtn.addEventListener('click', closeDrawer);
    searchBar.append(closeBtn);
    drawerList = el('div', undefined, 'tlh-scroll');
    const foot = el('div', 'Ranked from captured data only. Hover a badge for the measurement reason.', 'tlh-foot');
    drawer.append(searchBar, drawerList, foot);
    drawerInput.addEventListener('input', refreshDrawer);
    drawerInput.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') { event.preventDefault(); moveActive(drawerList, 1); }
      if (event.key === 'ArrowUp') { event.preventDefault(); moveActive(drawerList, -1); }
      if (event.key === 'Enter') activate(drawerList);
    });

    backdrop = el('div', undefined, 'tlh-backdrop');
    backdrop.hidden = true;
    const palette = el('div', undefined, 'tlh-palette');
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-label', 'Command palette');
    const paletteSearch = el('div', undefined, 'tlh-search');
    paletteSearch.append(icon('search'));
    paletteInput = el('input');
    paletteInput.setAttribute('aria-label', 'Search commands, questions and entities');
    paletteSearch.append(paletteInput);
    paletteList = el('div', undefined, 'tlh-scroll');
    palette.append(paletteSearch, paletteList);
    backdrop.append(palette);
    paletteInput.addEventListener('input', renderPalette);
    paletteInput.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') { event.preventDefault(); moveActive(paletteList, 1); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); moveActive(paletteList, -1); }
      else if (event.key === 'Enter') {
        if (paletteState.marker) {
          const label = paletteInput.value.trim();
          if (label) notify(lens.addMarker(label) ? `Marker recorded: ${label}` : 'Markers need a live capture.');
          closePalette();
        } else activate(paletteList);
      } else if (event.key === 'Backspace' && !paletteInput.value && (paletteState.question || paletteState.marker)) {
        paletteState = {};
        renderPalette();
      }
    });
    backdrop.addEventListener('mousedown', (event) => {
      if (event.target === backdrop) closePalette();
    });

    fileInput = el('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json,.json';
    fileInput.hidden = true;
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      void lens
        .loadTrace(file)
        .then(() => {
          notify('Trace loaded. Live capture is detached.');
          refreshAll();
        })
        .catch((error) => notify(String(error)));
      fileInput.value = '';
    });

    root.append(pills, outline, card, rail, drawer, backdrop, fileInput);
    doc.body.append(root);

    // events
    const onKey = (event: KeyboardEvent) => {
      if (!shown) {
        if (event.key === 'F2') { event.preventDefault(); toggle(); }
        return;
      }
      if (event.key === 'F2') { event.preventDefault(); toggle(); return; }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        paletteOpen ? closePalette() : openPalette();
        return;
      }
      if (event.key === 'Escape') {
        if (paletteOpen) { closePalette(); return; }
        if (picking) { setPicking(false); return; }
        if (drawerOpen && root?.contains(doc.activeElement)) { closeDrawer(); return; }
        if (selected() && cardDismissed !== selected()) {
          cardDismissed = selected();
          if (highlighted) { lens.highlight(null); highlighted = false; }
          renderCard();
        }
      }
    };
    const onClick = (event: MouseEvent) => {
      if (!shown || (!picking && !event.altKey)) return;
      if (root?.contains(event.target as globalThis.Node)) return;
      if (!canMutate()) return;
      const bounds = lens.getViewportBounds();
      if (!bounds || !bounds.width || !bounds.height) return;
      const x = (event.clientX - bounds.x) / bounds.width;
      const y = (event.clientY - bounds.y) / bounds.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      event.preventDefault();
      event.stopPropagation();
      const hit = lens.pick(x, y);
      setPicking(false);
      if (hit) chooseEntity(hit);
      else notify('No visible entity at that position.');
    };
    const onResize = () => renderCard();
    doc.addEventListener('keydown', onKey, true);
    doc.addEventListener('click', onClick, true);
    win?.addEventListener('resize', onResize);
    cleanups.push(
      () => doc.removeEventListener('keydown', onKey, true),
      () => doc.removeEventListener('click', onClick, true),
      () => win?.removeEventListener('resize', onResize)
    );
  }

  function toggle() {
    if (options.onToggle) options.onToggle();
    else lens.toggleUI();
  }

  function refreshAll() {
    renderPills();
    renderCard();
    if (drawerOpen && doc?.activeElement !== drawerInput) refreshDrawer();
  }

  function subscribe() {
    const off: (() => void)[] = [];
    off.push(
      lens.onSelectionChange(() => {
        cardDismissed = undefined;
        renderCard();
        const hit = selected();
        rail?.querySelector('[data-rail=search]')?.toggleAttribute('data-selected', !!hit);
      }),
      lens.on('frame_begin', (event) => {
        const begin = event.timestamp;
        if (stats.lastBegin) {
          const delta = begin - stats.lastBegin;
          if (delta > 0 && delta < 1000) stats.fps = stats.fps ? stats.fps * 0.9 + (1000 / delta) * 0.1 : 1000 / delta;
        }
        stats.lastBegin = begin;
      }),
      lens.on('frame_end', (event) => {
        const ms = (event as { duration_ms?: number }).duration_ms ?? 0;
        stats.frameMs = stats.frames ? stats.frameMs * 0.9 + ms * 0.1 : ms;
        stats.frames++;
      }),
      lens.on('render_event', (event) => {
        const e = event as { draw_calls?: number; triangles?: number };
        stats.calls = e.draw_calls ?? stats.calls;
        stats.triangles = e.triangles ?? stats.triangles;
      })
    );
    return () => off.forEach((fn) => fn());
  }

  let unsubscribe: (() => void) | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let raf = 0;
  function loop() {
    if (!shown || disposed || !win) return;
    positionCard();
    raf = win.requestAnimationFrame?.(loop) ?? 0;
  }

  return {
    show(value: Lens) {
      if (disposed || !doc) return;
      lens = value;
      mount();
      shown = true;
      root!.hidden = false;
      unsubscribe ??= subscribe();
      timer ??= setInterval(refreshAll, 600);
      if (win?.requestAnimationFrame && !raf) raf = win.requestAnimationFrame(loop);
      refreshAll();
      emitInsets();
    },
    hide() {
      shown = false;
      if (root) root.hidden = true;
      if (win && raf) win.cancelAnimationFrame?.(raf);
      raf = 0;
      emitInsets();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      shown = false;
      unsubscribe?.();
      clearInterval(timer);
      clearTimeout(messageTimer);
      if (win && raf) win.cancelAnimationFrame?.(raf);
      analysis?.dispose();
      cleanups.forEach((fn) => fn());
      if (highlighted) lens?.highlight(null);
      root?.remove();
      style?.remove();
      doc?.documentElement.style.removeProperty('--3lens-inset-right');
      doc?.documentElement.classList.remove('tlh-picking');
    },
    openPalette,
    openDrawer,
    closeDrawer,
    openAnalysis,
    isVisible: () => shown,
  };
}


/**
 * Mount the HUD on an existing Lens without a bootstrap. This is the entry point the
 * framework mount kits use: they hold the lens, the HUD only needs the public Lens API.
 */
export function mountLensHud(lens: Lens, options: HudOptions = {}): { hud: LensHud; unmount(): void } {
  const hud: LensHud = createLensHud({
    ...options,
    onToggle: options.onToggle ?? (() => (hud.isVisible() ? hud.hide() : hud.show(lens))),
  });
  hud.show(lens);
  return { hud, unmount: () => hud.dispose() };
}
