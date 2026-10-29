/** One model-backed workspace, shared by overlay, dock, and trace window surfaces. */
import type { Lens } from '@3lens/runtime';
import type { Node, PlatformSnapshot, CaptureMode } from '@3lens/kernel';
import { uiDom } from './platform/dom';
import { platformStyles } from './platform/styles';
import { componentTheme } from './platform/component-theme';
import { renderInspector } from './platform/inspector';
import { renderAnalysisView, analysisStyles } from './platform/analysis-views';
import { createTraceViewController, traceStyles } from './platform/trace-view';
import { renderSurfaces } from './platform/surfaces';
import type { PlatformTool, PlatformViewContext } from './platform/types';

export interface InvestigationUIOptions {
  surface?: 'overlay' | 'dock' | 'window';
  target?: HTMLElement;
  /** Optional application-owned canvas/viewport slot, supplied explicitly by the host app. */
  viewport?: HTMLElement;
  layout?: 'workspace' | 'overlay' | 'dock';
  document?: Document;
  readonly?: boolean;
  csp?: { styleNonce?: string; cssUrl?: string; safeMode?: boolean };
}

const emptySnapshot = (): PlatformSnapshot => ({
  frames: [],
  events: [],
  resources: [],
  assets: [],
  shaders: [],
  passes: [],
  pipeline_edges: [],
  dropped_events: 0,
  reasons: [],
});
const tools: { id: PlatformTool; label: string; icon: string }[] = [
  { id: 'inspect', label: 'Inspect', icon: 'cube' },
  { id: 'performance', label: 'Performance', icon: 'performance' },
  { id: 'memory', label: 'Memory', icon: 'memory' },
  { id: 'changes', label: 'Changes', icon: 'changes' },
  { id: 'shaders', label: 'Shaders', icon: 'shaders' },
  { id: 'surfaces', label: 'Surfaces', icon: 'surfaces' },
];

export function createInvestigationUI(options: InvestigationUIOptions = {}) {
  let lens: Lens;
  const doc =
    options.document ??
    (typeof document !== 'undefined' ? document : undefined);
  const win = doc?.defaultView;
  const dom = doc ? uiDom(doc) : undefined;
  let root: HTMLElement | undefined;
  let launcher: HTMLButtonElement | undefined;
  let hud: HTMLElement | undefined;
  let dynamicStyle: HTMLStyleElement | undefined;
  let stylesheet: HTMLElement | undefined;
  let header: HTMLElement;
  let nav: HTMLElement;
  let tree: HTMLElement;
  let main: HTMLElement;
  let inspector: HTMLElement;
  let timeline: HTMLElement;
  let status: HTMLElement;
  let connection: HTMLElement;
  let contextPicker: HTMLSelectElement;
  let fidelityPicker: HTMLSelectElement;
  let surfacePicker: HTMLSelectElement;
  let modePicker: HTMLSelectElement;
  let record: HTMLButtonElement;
  let modeBadge: HTMLElement;
  let file: HTMLInputElement;
  let collapsed = false;
  let disposed = false;
  let shown = false;
  let activeTool: PlatformTool = 'inspect';
  let layout =
    options.layout ?? (options.surface === 'dock' ? 'dock' : 'workspace');
  let inspectorTab = 'Overview';
  let fidelity: 'all' | 'exact' = 'all';
  let search = '';
  let picking = false;
  let highlighted = false;
  let doctorOpen = false;
  let lastIdentity = '';
  let interaction = false;
  let frameNumber: number | undefined;
  let pendingComparison:
    | Parameters<NonNullable<PlatformViewContext['onInspect']>>[0]
    | undefined;
  let unsubscribe: (() => void) | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let popup: Window | null = null;
  let popupUI: ReturnType<typeof createInvestigationUI> | undefined;
  let trace: ReturnType<typeof createTraceViewController> | undefined;
  let originalParent: globalThis.Node | null = null;
  let originalNext: ChildNode | null = null;
  let viewportHost: HTMLElement | undefined;
  let selectionBox: HTMLElement | undefined;
  let overlayTools: HTMLElement | undefined;
  let split: HTMLElement;
  const unmountHandlers: (() => void)[] = [];

  function notify(message: string, error = false) {
    if (status) {
      status.textContent = message;
      status.setAttribute('role', error ? 'alert' : 'status');
    }
  }
  async function perform(action: () => Promise<void>) {
    try {
      await action();
    } catch (error) {
      notify(error instanceof Error ? error.message : String(error), true);
    }
  }
  function choose(id: string) {
    const node = lens.getNode(id);
    if (node && lens.getActiveContext()?.id !== node.context_id)
      lens.setActiveContext(node.context_id);
    lens.select(id, { source: 'user_click' });
    if (highlighted) lens.highlight(id);
    refresh(true);
  }
  function setTool(tool: PlatformTool) {
    activeTool = tool;
    doctorOpen = false;
    picking = false;
    pendingComparison = undefined;
    restoreViewport();
    const snapshot = currentSnapshot();
    const current = context.selectedId
      ? lens.getNode(context.selectedId)
      : undefined;
    let next: string | undefined;
    if (
      tool === 'memory' &&
      !snapshot.resources.some((resource) => resource.entity_id === current?.id)
    ) {
      next = current?.id
        ? lens
            .query<{ data: Node[] }>('resources_used_by', {
              entity_id: current.id,
            })
            ?.data.find((node) => ['geometry', 'texture'].includes(node.type))
            ?.id
        : undefined;
      next ??= snapshot.resources[0]?.entity_id;
    }
    if (
      tool === 'shaders' &&
      !snapshot.shaders.some((shader) => shader.entity_id === current?.id)
    )
      next = snapshot.shaders[0]?.entity_id;
    if (
      tool === 'performance' &&
      !['scene', 'pass', 'renderer'].includes(current?.type ?? '')
    )
      next =
        snapshot.passes[0]?.entity_id ?? snapshot.frames.at(-1)?.entity_ids[0];
    if (next) lens.select(next, { source: 'query_result' });
    lastIdentity = '';
    refresh(true);
  }
  const context: PlatformViewContext = {
    get lens() {
      return lens;
    },
    get document() {
      return doc!;
    },
    get selectedId() {
      return lens.getSelection().entity_ids[0];
    },
    get frame() {
      return lens.getSelectedFrame() ?? frameNumber;
    },
    get readonly() {
      return !canMutate();
    },
    get cspSafe() {
      return !!options.csp?.safeMode;
    },
    select: choose,
    notify,
    refresh: () => refresh(true),
    setFrame(frame) {
      lens.setFrame(frame);
      frameNumber = frame;
      refresh(true);
    },
    onInspect(comparison) {
      pendingComparison = comparison;
      refresh(true);
    },
  };

  function currentSnapshot() {
    return (
      lens.query<{ data: PlatformSnapshot }>('platform_snapshot', {
        context_id: lens.getActiveContext()?.id,
        limit: 120,
      })?.data ?? emptySnapshot()
    );
  }
  function restoreViewport() {
    if (
      options.viewport &&
      originalParent &&
      options.viewport.parentNode !== originalParent
    )
      originalParent.insertBefore(
        options.viewport,
        originalNext?.parentNode === originalParent ? originalNext : null
      );
    viewportHost = undefined;
  }
  function placeViewport(host: HTMLElement) {
    viewportHost = host;
    if (
      options.viewport &&
      layout !== 'overlay' &&
      lens.getMode() !== 'offline'
    ) {
      if (!originalParent) {
        originalParent = options.viewport.parentNode;
        originalNext = options.viewport.nextSibling;
      }
      host.prepend(options.viewport);
    }
  }
  function setLayout(value: typeof layout) {
    if (!root) return;
    restoreViewport();
    layout = value;
    root.dataset.layout = value;
    surfacePicker.value = value;
    root.style.removeProperty('left');
    root.style.removeProperty('top');
    root.style.removeProperty('right');
    root.style.removeProperty('width');
    root.style.removeProperty('height');
    (value === 'dock' && options.target ? options.target : doc!.body).append(
      root
    );
    notify(
      value === 'dock' && !options.target
        ? 'Docked workspace uses the full application host. Supply target to embed in a host-owned container.'
        : `Surface: ${value}`
    );
    lastIdentity = '';
    refresh(true);
  }
  async function exportTrace() {
    const blob = await lens.exportTrace({ profile: 'STANDARD' });
    const urlAPI = win?.URL ?? URL;
    const url = urlAPI.createObjectURL(blob);
    const link = doc!.createElement('a');
    link.href = url;
    link.download = '3lens-investigation.json';
    link.click();
    setTimeout(() => urlAPI.revokeObjectURL(url), 1000);
    notify('Trace exported with captured entities, selection, and baseline.');
  }
  function baseline() {
    lens.captureBaseline();
    notify('Baseline saved. Make a scene change, then inspect What changed.');
    refresh(true);
  }
  function canMutate() {
    return (
      !options.readonly &&
      lens.getMode() === 'live' &&
      lens.getSelectedFrame() === null
    );
  }
  function beginPick() {
    if (!canMutate()) {
      notify(
        'Scene picking is unavailable in read-only or offline mode. Select captured entities in the tree.'
      );
      return;
    }
    picking = !picking;
    if (activeTool !== 'inspect') activeTool = 'inspect';
    if (layout === 'overlay')
      notify('Pick mode: click an object in the application behind the tools.');
    else
      notify(
        picking
          ? 'Pick mode: click an object in the application viewport.'
          : 'Pick mode ended.'
      );
    refresh(true);
  }
  function openWindow() {
    if (!win) return;
    if (popup && !popup.closed) {
      popup.focus();
      return;
    }
    popup = win.open('', '3lens-trace-workspace', 'width=1450,height=950');
    if (!popup) {
      notify(
        'The trace window was blocked. Allow popups for this application and try again.',
        true
      );
      return;
    }
    popup.document.title = '3Lens — Trace workspace';
    popup.document.body.replaceChildren();
    popupUI = createInvestigationUI({
      document: popup.document,
      layout: 'workspace',
      surface: 'window',
      csp: options.csp,
      readonly: options.readonly,
    });
    popupUI.show(lens);
    popup.addEventListener(
      'beforeunload',
      () => {
        popupUI?.dispose();
        popupUI = undefined;
        popup = null;
      },
      { once: true }
    );
    notify(
      'Trace window connected. Both surfaces share selection and captured data.'
    );
  }
  function commandPalette() {
    if (!root || !dom || root.querySelector('.tlp-command-backdrop')) return;
    const { el, button } = dom;
    const backdrop = el('div', undefined, 'tlp-command-backdrop');
    const panel = el('div', undefined, 'tlp-command');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Command palette');
    const input = el('input');
    input.placeholder = 'Type a command or entity name…';
    input.setAttribute('aria-label', 'Search commands');
    const results = el('div');
    panel.append(input, results);
    backdrop.append(panel);
    root.append(backdrop);
    const close = () => backdrop.remove();
    const commands: [string, () => void, string][] = [
      [
        'Select entity',
        () => {
          activeTool = 'inspect';
          refresh(true);
          tree.querySelector<HTMLInputElement>('input')?.focus();
        },
        'Inspect',
      ],
      ['Pick entity in application', beginPick, 'P'],
      [
        'Focus selected entity',
        () => notify(lens.focus() ? 'Camera focused.' : 'Focus unavailable.'),
        'F',
      ],
      [
        'Follow material',
        () => {
          const id = context.selectedId;
          const resources = id
            ? lens.query<{ data: Node[] }>('resources_used_by', {
                entity_id: id,
              })?.data
            : [];
          const material = resources?.find((node) => node.type === 'material');
          if (material) choose(material.id);
          else notify('No captured material relationship.');
        },
        'Selection',
      ],
      ['Set baseline', baseline, 'Capture'],
      ['Add timeline marker', addMarker, 'Capture'],
      ['Export trace', () => void perform(exportTrace), 'Save'],
      ['Open trace', () => file.click(), 'Load'],
      ['Compare traces', () => setTool('changes'), 'Changes'],
      ['Open trace window', openWindow, 'Window'],
      [
        'Show Doctor',
        () => {
          doctorOpen = true;
          refresh(true);
        },
        'Diagnostics',
      ],
    ];
    function filterCommands() {
      results.replaceChildren();
      const query = input.value.toLowerCase();
      for (const [label, action, hint] of commands.filter(([label]) =>
        label.toLowerCase().includes(query)
      )) {
        const b = button(label, () => {
          close();
          action();
        });
        b.append(el('kbd', hint));
        results.append(b);
      }
      if (query)
        for (const entity of lens.query<{ data: Node[] }>('search_nodes', {
          search: query,
          limit: 8,
        })?.data ?? []) {
          const b = button(entity.name || entity.type, () => {
            close();
            choose(entity.id);
          });
          b.append(el('kbd', entity.type));
          results.append(b);
        }
    }
    input.addEventListener('input', filterCommands);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Enter')
        results.querySelector<HTMLButtonElement>('button')?.click();
    });
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) close();
    });
    filterCommands();
    input.focus();
  }
  function addMarker() {
    if (!canMutate() || !root || !dom) {
      notify('Markers require a live capture at the latest frame.');
      return;
    }
    const { el, button } = dom;
    const backdrop = el('div', undefined, 'tlp-command-backdrop');
    const panel = el('div', undefined, 'tlp-command');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Add timeline marker');
    const input = el('input');
    input.placeholder = 'Marker name, e.g. After resize';
    input.setAttribute('aria-label', 'Marker name');
    const save = () => {
      if (!input.value.trim()) return;
      if (lens.addMarker(input.value.trim()))
        notify(`Marker recorded: ${input.value.trim()}`);
      backdrop.remove();
    };
    panel.append(
      el('h3', 'Add timeline marker'),
      input,
      button('Save marker', save),
      button('Cancel', () => backdrop.remove())
    );
    backdrop.append(panel);
    root.append(backdrop);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') save();
      if (event.key === 'Escape') backdrop.remove();
    });
    input.focus();
  }
  function keydown(event: KeyboardEvent) {
    if (event.key === 'F2') {
      event.preventDefault();
      if (options.document) {
        shown ? hide() : show(lens);
      } else lens.toggleUI();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      commandPalette();
    }
    if (event.key === 'Alt') root?.classList.add('tlp-pass-input');
    if (
      /^(INPUT|TEXTAREA|SELECT)$/.test((event.target as HTMLElement)?.tagName)
    )
      return;
    if (event.key === 'Escape') {
      picking = false;
      lens.highlight(null);
      highlighted = false;
      selectionBox?.remove();
      root?.querySelector('.tlp-command-backdrop')?.remove();
      refresh(true);
    }
    if (event.key.toLowerCase() === 'f' && canMutate()) lens.focus();
    if (event.key.toLowerCase() === 'p') beginPick();
  }
  function keyup(event: KeyboardEvent) {
    if (event.key === 'Alt') root?.classList.remove('tlp-pass-input');
  }
  function clickApplication(event: MouseEvent) {
    if (
      !picking ||
      !canMutate() ||
      (root?.contains(event.target as globalThis.Node) &&
        !(event.target as HTMLElement).closest('.tlp-viewport'))
    )
      return;
    if ((event.target as HTMLElement).closest('button,input,select')) return;
    const bounds = lens.getViewportBounds();
    if (!bounds || !bounds.width || !bounds.height) {
      notify('No live viewport is available.');
      return;
    }
    const x = (event.clientX - bounds.x) / bounds.width,
      y = (event.clientY - bounds.y) / bounds.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    event.preventDefault();
    event.stopPropagation();
    const selected = lens.pick(x, y);
    picking = false;
    if (selected) {
      highlighted = lens.highlight(selected);
      notify('Picked entity. Inspector selection updated.');
    } else notify('No visible entity at this position.');
    refresh(true);
  }

  function mount() {
    if (!doc || !dom) return;
    const { el, button, icon } = dom;
    root = el('aside', undefined, 'tlp-workspace tl-investigation');
    root.dataset.threeLens = 'investigation';
    root.setAttribute('aria-label', '3Lens developer tools');
    root.dataset.layout = layout;
    root.dataset.surface = options.surface ?? 'overlay';
    root.dataset.embedded = String(!!options.target);
    root.dataset.cspSafe = String(!!options.csp?.safeMode);
    if (options.csp?.cssUrl) {
      const link = el('link');
      link.rel = 'stylesheet';
      link.href = options.csp.cssUrl;
      stylesheet = link;
    } else if (!options.csp?.safeMode || options.csp.styleNonce) {
      const style = el('style', platformStyles + analysisStyles + traceStyles + componentTheme);
      if (options.csp?.styleNonce) style.nonce = options.csp.styleNonce;
      stylesheet = style;
    }
    if (stylesheet) doc.head.append(stylesheet);
    if (!options.csp?.safeMode || options.csp.styleNonce) {
      dynamicStyle = el('style');
      if (options.csp?.styleNonce) dynamicStyle.nonce = options.csp.styleNonce;
      doc.head.append(dynamicStyle);
    }
    header = el('header', undefined, 'tlp-topbar tl-header');
    const wordmark = el('div', undefined, 'tlp-wordmark');
    wordmark.append(el('b', '3'), el('span', 'Lens'));
    header.append(wordmark, el('div', undefined, 'tlp-divider'));
    const session = el('div', undefined, 'tlp-session');
    session.append(
      el('span', undefined, 'tlp-dot'),
      el('span', 'Local session', 'tlp-session-label')
    );
    header.append(session);
    modeBadge = el('span', 'LIVE', 'tlp-mode');
    header.append(modeBadge, el('div', undefined, 'tlp-divider'));
    contextPicker = el('select');
    contextPicker.setAttribute('aria-label', 'Active rendering context');
    contextPicker.addEventListener('change', () => {
      lens.setActiveContext(contextPicker.value);
      lens.setFrame(null);
      frameNumber = undefined;
      refresh(true);
    });
    header.append(contextPicker);
    modePicker = el('select');
    modePicker.setAttribute('aria-label', 'Capture mode');
    modePicker.className = 'tlp-mode-label';
    for (const value of ['MINIMAL', 'STANDARD', 'DEEP']) {
      const option = el('option', value);
      option.value = value;
      modePicker.append(option);
    }
    modePicker.addEventListener('change', () => {
      lens.setCaptureMode(modePicker.value as CaptureMode);
      notify(`Capture mode: ${modePicker.value}`);
    });
    header.append(modePicker);
    const topActions = el('div', undefined, 'tlp-top-actions');
    record = button(
      'Record',
      () => {
        if (!canMutate()) return;
        if (lens.isRecording()) lens.stopRecording();
        else lens.startRecording();
        refreshHeader();
      },
      'record'
    );
    record.dataset.action = 'record';
    // The explicit action starts a fresh recording after the automatic live buffer.
    const exportButton = button(
      'Export trace',
      () => void perform(exportTrace),
      'export'
    );
    const openButton = button('Open trace', () => file.click(), 'folder');
    file = el('input');
    file.type = 'file';
    file.accept = '.json,.3lens,application/json';
    file.hidden = true;
    file.setAttribute('aria-label', 'Load trace file');
    file.addEventListener('change', () => {
      const selected = file.files?.[0];
      if (!selected) return;
      void perform(async () => {
        restoreViewport();
        await lens.loadTrace(selected);
        pendingComparison = undefined;
        lastIdentity = '';
        notify(
          'Trace loaded. Live capture is detached; inspection uses saved data.'
        );
        file.value = '';
        refresh(true);
      });
    });
    topActions.append(
      record,
      exportButton,
      openButton,
      button('Commands', commandPalette, 'search'),
      button(
        'Minimize',
        () => {
          collapsed = true;
          root!.hidden = true;
          restoreViewport();
          hud!.hidden = false;
        },
        'clock'
      ),
      button(
        'Close (F2)',
        () => (options.document ? hide() : lens.hideUI()),
        'close'
      ),
      file
    );
    header.append(topActions);
    nav = el('nav', undefined, 'tlp-nav');
    nav.setAttribute('aria-label', 'Developer tools');
    for (const tool of tools) {
      const b = button(tool.label, () => setTool(tool.id), tool.icon);
      b.setAttribute('role', 'tab');
      b.dataset.tool = tool.id;
      nav.append(b);
    }
    const surface = el('div', undefined, 'tlp-surface-control');
    surface.append(el('span', 'Surface', 'tlp-muted'));
    surfacePicker = el('select');
    surfacePicker.setAttribute('aria-label', 'UI surface');
    for (const [value, label] of [
      ['workspace', 'Workspace'],
      ['overlay', 'Overlay'],
      ['dock', 'Dock right'],
      ['window', 'Trace window'],
    ]) {
      const o = el('option', label);
      o.value = value;
      surfacePicker.append(o);
    }
    surfacePicker.addEventListener('change', () => {
      if (surfacePicker.value === 'window') {
        openWindow();
        surfacePicker.value = layout;
      } else setLayout(surfacePicker.value as typeof layout);
    });
    surface.append(surfacePicker);
    nav.append(surface);
    const content = el('div', undefined, 'tlp-content');
    tree = el('div', undefined, 'tlp-tree');
    main = el('main', undefined, 'tlp-main');
    main.dataset.scrollKey = 'main';
    inspector = el('aside', undefined, 'tlp-inspector');
    split = el('div', undefined, 'tlp-resizer');
    split.setAttribute('role', 'separator');
    split.setAttribute('aria-label', 'Resize inspector');
    split.setAttribute('aria-orientation', 'vertical');
    split.tabIndex = 0;
    split.addEventListener('pointerdown', (event) => {
      if (options.csp?.safeMode) return;
      interaction = true;
      split.setPointerCapture(event.pointerId);
    });
    split.addEventListener('pointermove', (event) => {
      if (!interaction || !root || !split.hasPointerCapture(event.pointerId))
        return;
      const width = Math.max(
        260,
        Math.min(
          root.clientWidth * 0.5,
          root.getBoundingClientRect().right - event.clientX
        )
      );
      root.style.setProperty('--tlp-inspector', `${width}px`);
    });
    split.addEventListener('pointerup', () => {
      interaction = false;
    });
    split.addEventListener('keydown', (event) => {
      if (!root || options.csp?.safeMode) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const width =
          inspector.getBoundingClientRect().width +
          (event.key === 'ArrowLeft' ? 20 : -20);
        root.style.setProperty('--tlp-inspector', `${Math.max(260, width)}px`);
      }
    });
    content.append(tree, main, split, inspector);
    timeline = el('div', undefined, 'tlp-timeline');
    const footer = el('footer', undefined, 'tlp-statusbar');
    connection = el('span', 'Connected', 'tlp-connection');
    status = el(
      'span',
      'Select an entity to begin. Set a baseline before changing the scene.',
      'tlp-status'
    );
    status.setAttribute('role', 'status');
    fidelityPicker = el('select');
    fidelityPicker.setAttribute('aria-label', 'Measurement fidelity');
    for (const [value, label] of [
      ['all', 'All fidelity'],
      ['exact', 'EXACT only'],
    ]) {
      const o = el('option', label);
      o.value = value;
      fidelityPicker.append(o);
    }
    fidelityPicker.addEventListener('change', () => {
      fidelity = fidelityPicker.value as typeof fidelity;
      refresh(true);
    });
    footer.append(
      connection,
      status,
      fidelityPicker,
      button(
        'Doctor',
        () => {
          doctorOpen = !doctorOpen;
          refresh(true);
        },
        'settings'
      )
    );
    root.append(header, nav, content, timeline, footer);
    (layout === 'dock' && options.target ? options.target : doc.body).append(
      root
    );
    launcher = button(
      'Open devtools',
      () => {
        collapsed = false;
        if (options.document) show(lens);
        else lens.showUI();
      },
      'cube',
      'tlp-launcher'
    );
    launcher.hidden = true;
    doc.body.append(launcher);
    hud = el('div', undefined, 'tlp-hud');
    hud.hidden = true;
    hud.append(
      el('strong', '3Lens'),
      el('span', 'Capture active'),
      button('Restore tools', () => {
        collapsed = false;
        show(lens);
      })
    );
    doc.body.append(hud);
    trace = createTraceViewController(context);
    unsubscribe = lens.onSelectionChange(() => {
      pendingComparison = undefined;
      refresh(true);
    });
    doc.addEventListener('keydown', keydown);
    doc.addEventListener('keyup', keyup);
    doc.addEventListener('click', clickApplication, true);
    const onResize = () =>
      win?.requestAnimationFrame(() => updateSelectionBounds());
    const onBlur = () => root?.classList.remove('tlp-pass-input');
    win?.addEventListener('resize', onResize);
    win?.addEventListener('blur', onBlur);
    unmountHandlers.push(() => {
      doc.removeEventListener('keydown', keydown);
      doc.removeEventListener('keyup', keyup);
      doc.removeEventListener('click', clickApplication, true);
      win?.removeEventListener('resize', onResize);
      win?.removeEventListener('blur', onBlur);
    });
    let drag: { x: number; y: number; left: number; top: number } | undefined;
    header.addEventListener('pointerdown', (event) => {
      if (
        layout !== 'overlay' ||
        event.button !== 0 ||
        (event.target as HTMLElement).closest('button,select,input') ||
        options.csp?.safeMode
      )
        return;
      const b = root!.getBoundingClientRect();
      drag = { x: event.clientX, y: event.clientY, left: b.left, top: b.top };
      interaction = true;
      header.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    header.addEventListener('pointermove', (event) => {
      if (!drag || !root || !win) return;
      root.style.right = 'auto';
      root.style.left = `${Math.max(0, Math.min(win.innerWidth - root.offsetWidth, drag.left + event.clientX - drag.x))}px`;
      root.style.top = `${Math.max(0, Math.min(win.innerHeight - root.offsetHeight, drag.top + event.clientY - drag.y))}px`;
    });
    const endDrag = () => {
      drag = undefined;
      interaction = false;
    };
    header.addEventListener('pointerup', endDrag);
    header.addEventListener('lostpointercapture', endDrag);
    timer = setInterval(() => {
      if (
        shown &&
        !collapsed &&
        !interaction &&
        !doc.querySelector('.tlp-command-backdrop') &&
        !/^(INPUT|SELECT|TEXTAREA)$/.test(doc.activeElement?.tagName ?? '')
      )
        refresh();
    }, 750);
    if (!stylesheet && options.csp?.safeMode)
      notify(
        'CSP-safe mode: supply cssUrl for the platform stylesheet. Visual enhancements are disabled.',
        true
      );
  }

  function refreshHeader() {
    if (!root || !dom) return;
    const { el } = dom;
    const mode = lens.getMode();
    root.dataset.mode = mode;
    root.dataset.tool = activeTool;
    modeBadge.textContent = mode === 'offline' ? 'OFFLINE TRACE' : 'LIVE';
    modeBadge.dataset.mode = mode;
    const chosen = lens.getActiveContext()?.id;
    const current = contextPicker.value;
    const ids = lens
      .getContexts()
      .map((value) => `${value.id}:${value.displayName}`)
      .join('|');
    if (contextPicker.dataset.contexts !== ids) {
      contextPicker.replaceChildren();
      for (const c of lens.getContexts()) {
        const o = el('option', c.displayName ?? c.id);
        o.value = c.id;
        contextPicker.append(o);
      }
      if (!contextPicker.options.length)
        contextPicker.append(el('option', 'No rendering context'));
      contextPicker.dataset.contexts = ids;
    }
    const surface = surfacePicker.parentElement!;
    const parent =
      activeTool === 'inspect'
        ? nav
        : header.querySelector('.tlp-top-actions')!;
    if (surface.parentElement !== parent) {
      if (activeTool === 'inspect') parent.append(surface);
      else parent.prepend(surface);
    }
    contextPicker.value = chosen ?? current;
    record.disabled = !canMutate();
    record.querySelector('span')!.textContent = lens.isRecording()
      ? 'Stop recording'
      : 'Record';
    modePicker.value = lens.getOverheadMetrics().currentMode;
    modePicker.disabled = !canMutate();
    connection.textContent =
      mode === 'offline'
        ? 'Saved capture · no live renderer required'
        : lens.isAttached()
          ? 'Connected · live capture'
          : 'Detached';
    for (const b of nav.querySelectorAll<HTMLElement>('[data-tool]'))
      b.setAttribute('aria-selected', String(b.dataset.tool === activeTool));
  }
  function renderTree() {
    if (!dom) return;
    const { el, button, icon } = dom;
    tree.replaceChildren();
    if (activeTool !== 'inspect') {
      const rail = el('nav', undefined, 'tlp-tool-rail');
      rail.setAttribute('aria-label', 'Investigation navigation');
      const entries: [string, string, PlatformTool, string?][] =
        activeTool === 'changes'
          ? [
              ['Session', 'folder', 'inspect'],
              ['Compare', 'changes', 'changes'],
              ['Timeline', 'clock', 'performance'],
              ['Resources', 'memory', 'memory'],
              ['Passes', 'surfaces', 'shaders'],
              ['Entities', 'cube', 'inspect', 'object3d'],
              ['Surfaces', 'surfaces', 'surfaces'],
            ]
          : [
              ['Scene', 'cube', 'inspect'],
              ['Performance', 'performance', 'performance'],
              ['Rendering', 'surfaces', 'shaders'],
              ['Resources', 'memory', 'memory'],
              ['Materials', 'cube', 'memory', 'material'],
              ['Textures', 'folder', 'memory', 'texture'],
              ['Geometries', 'cube', 'memory', 'geometry'],
              ['Lights', 'light', 'inspect', 'light'],
              ['Cameras', 'camera', 'inspect', 'camera'],
              ['Changes', 'changes', 'changes'],
              ['Surfaces', 'surfaces', 'surfaces'],
            ];
      for (const [label, symbol, tool, type] of entries) {
        const b = button(
          label,
          () => {
            setTool(tool);
            if (type) {
              const node = lens
                .getGraph()
                .getNodes()
                .nodes.find((n) =>
                  type === 'light'
                    ? String(
                        (n as unknown as Record<string, unknown>).object_type
                      ).includes('Light')
                    : n.type === type
                );
              if (node) choose(node.id);
            }
          },
          symbol,
          'tlp-tree-node'
        );
        b.setAttribute('aria-current', String(tool === activeTool && !type));
        if (!type) {
          b.setAttribute('role', 'tab');
          b.setAttribute('aria-label', tools.find((t) => t.id === tool)!.label);
          b.setAttribute('aria-selected', String(tool === activeTool));
        }
        rail.append(b);
      }
      const bottom = el('div', undefined, 'tlp-rail-bottom');
      bottom.append(
        button(
          'Record trace',
          () => {
            if (canMutate()) {
              lens.startRecording();
              refreshHeader();
            }
          },
          'record',
          'tlp-tree-node'
        ),
        button('Load trace', () => file.click(), 'folder', 'tlp-tree-node')
      );
      rail.append(bottom);
      tree.append(rail);
      if (activeTool === 'shaders') {
        const list = el('div', undefined, 'tlp-shader-tree');
        list.append(el('h3', 'Scene graph'));
        const input = el('input');
        input.placeholder = 'Search entities…';
        input.setAttribute('aria-label', 'Search shader entities');
        list.append(input);
        const rows = el('div');
        list.append(rows);
        const fill = () => {
          rows.replaceChildren();
          const nodes = lens
            .getGraph()
            .getNodes()
            .nodes.filter(
              (n) =>
                [
                  'scene',
                  'camera',
                  'object3d',
                  'material',
                  'shader_variant',
                ].includes(n.type) &&
                (n.name ?? n.type)
                  .toLowerCase()
                  .includes(input.value.toLowerCase())
            );
          for (const node of nodes) {
            const b = button(
              node.name ?? node.type,
              () => choose(node.id),
              node.type === 'shader_variant' ? 'shaders' : 'cube',
              'tlp-tree-node'
            );
            b.dataset.entityId = node.id;
            b.setAttribute(
              'aria-current',
              String(context.selectedId === node.id)
            );
            rows.append(b);
          }
        };
        input.addEventListener('input', fill);
        fill();
        tree.append(list);
      }
      return;
    }
    const heading = el('div', undefined, 'tlp-tree-head');
    heading.append(el('h3', 'Scene graph'), button('⋮', commandPalette));
    tree.append(heading);
    const input = el('input');
    input.type = 'search';
    input.className = 'tlp-search';
    input.placeholder = 'Search entities…';
    input.value = search;
    input.setAttribute('aria-label', 'Search captured entities');
    input.addEventListener('input', () => {
      search = input.value;
      renderTreeRows();
    });
    tree.append(input);
    const list = el('nav');
    list.setAttribute('aria-label', 'Captured entities');
    list.dataset.treeRows = '';
    tree.append(list);
    renderTreeRows();
    function renderTreeRows() {
      list.replaceChildren();
      const nodes =
        lens.query<{ data: Node[] }>('search_nodes', { search })?.data ?? [];
      const active = lens.getActiveContext()?.id;
      const visible = nodes.filter(
        (node) => !active || node.context_id === active
      );
      const graph = lens.getGraph();
      const ordered: Node[] = [];
      const seen = new Set<string>();
      function visit(node: Node, depth: number) {
        if (seen.has(node.id)) return;
        seen.add(node.id);
        ordered.push(node);
        const symbol =
          node.type === 'camera'
            ? 'camera'
            : String(
                  (node as unknown as Record<string, unknown>).object_type
                ).includes('Light')
              ? 'light'
              : node.type === 'material'
                ? 'shaders'
                : node.type === 'texture'
                  ? 'folder'
                  : 'cube';
        const b = button(
          node.name || node.type,
          () => choose(node.id),
          symbol,
          'tlp-tree-node'
        );
        b.dataset.entityId = node.id;
        b.title = node.id;
        b.setAttribute('aria-current', String(context.selectedId === node.id));
        if (!options.csp?.safeMode)
          b.style.paddingLeft = `${7 + Math.min(depth, 4) * 15}px`;
        list.append(b);
        if (!search)
          for (const edge of graph.getOutgoingEdges(node.id, 'contains')) {
            const child = visible.find((n) => n.id === edge.to);
            if (child) visit(child, depth + 1);
          }
      }
      for (const node of visible.filter((n) => n.type === 'scene'))
        visit(node, 0);
      for (const node of visible.filter(
        (n) => n.type === 'camera' || n.type === 'renderer'
      ))
        visit(node, 0);
      for (const node of visible.filter((n) => n.type === 'object3d'))
        visit(node, 1);
      const resources = visible.filter((node) => !seen.has(node.id));
      if (resources.length) list.append(el('p', 'RESOURCES', 'tlp-tree-count'));
      for (const node of resources) visit(node, 0);
      if (!visible.length)
        list.append(
          el(
            'p',
            'No matching captured entities. Register a renderer, scene, and camera to begin.',
            'tlp-empty'
          )
        );
    }
  }

  function renderViewport(snapshot: PlatformSnapshot) {
    if (!dom) return;
    const { el, button, icon } = dom;
    main.dataset.tool = 'inspect';
    const viewport = el('div', undefined, 'tlp-viewport');
    const placeholder = el('div', undefined, 'tlp-viewport-placeholder');
    placeholder.append(
      el(
        'span',
        lens.getMode() === 'offline'
          ? 'Saved capture / application detached'
          : 'Existing application viewport'
      ),
      el(
        'small',
        lens.getMode() === 'offline'
          ? 'Inspect recorded entities and relationships'
          : 'No scene content is created by the devtools'
      )
    );
    if (
      !options.viewport ||
      lens.getMode() === 'offline' ||
      layout === 'overlay'
    )
      viewport.append(placeholder);
    const toolbar = el('div', undefined, 'tlp-viewport-toolbar');
    const pick = button(
      picking ? 'Picking…' : 'Pick entity',
      beginPick,
      'pick'
    );
    pick.dataset.active = String(picking);
    pick.disabled = !canMutate();
    const focus = button(
      'Focus',
      () =>
        notify(
          lens.focus()
            ? 'Camera focused on selection.'
            : 'Focus unavailable for this selection.'
        ),
      'focus'
    );
    focus.disabled = !canMutate() || !context.selectedId;
    const mark = button(
      'Highlight',
      () => {
        highlighted = !highlighted;
        if (!lens.highlight(highlighted ? (context.selectedId ?? null) : null))
          highlighted = false;
        updateSelectionBounds();
      },
      'cube'
    );
    mark.disabled = !canMutate() || !context.selectedId;
    mark.dataset.active = String(highlighted);
    toolbar.append(
      pick,
      focus,
      mark,
      button(
        'Clear',
        () => {
          lens.select([]);
          lens.highlight(null);
          highlighted = false;
          selectionBox?.remove();
        },
        'close'
      ),
      el(
        'span',
        picking
          ? 'Click an object in the application'
          : 'Select, inspect, follow resources',
        'tlp-toolbar-hint'
      )
    );
    viewport.append(toolbar);
    const breadcrumb = el('div', undefined, 'tlp-breadcrumb');
    breadcrumb.append(icon('cube'));
    const id = context.selectedId;
    const selected = id ? lens.getNode(id) : undefined;
    const parents = id ? lens.getGraph().getIncomingEdges(id, 'contains') : [];
    for (const edge of parents.slice(0, 2)) {
      const parent = lens.getNode(edge.from);
      breadcrumb.append(
        button(
          parent?.name ?? parent?.type ?? edge.from,
          () => choose(edge.from),
          undefined,
          'tlp-link'
        ),
        icon('chevron')
      );
    }
    breadcrumb.append(
      el('span', selected?.name ?? 'Select an entity', 'tlp-link')
    );
    viewport.append(breadcrumb);
    main.append(viewport);
    placeViewport(viewport);
    if (snapshot.frames.length === 0)
      notify(
        lens.getMode() === 'offline'
          ? 'Offline trace has no recorded frame timings. Entity inspection remains available.'
          : 'Waiting for the first captured render call.'
      );
  }
  function renderTimeline(snapshot: PlatformSnapshot) {
    if (!dom) return;
    const { el, button, badge } = dom;
    timeline.replaceChildren();
    const toolbar = el('div', undefined, 'tlp-timeline-toolbar');
    toolbar.append(el('strong', 'Frame timeline'));
    const current =
      snapshot.frames.find((frame) => frame.frame === context.frame) ??
      snapshot.frames.at(-1);
    const index = current ? snapshot.frames.indexOf(current) : -1;
    const chooseFrame = (position: number) => {
      const frame = snapshot.frames[position];
      if (frame) {
        lens.setFrame(frame.frame, frame.context_id);
        frameNumber = frame.frame;
        refresh(true);
      }
    };
    toolbar.append(button('‹', () => chooseFrame(Math.max(0, index - 1))));
    const input = el('input');
    input.type = 'number';
    input.value = current ? String(current.frame) : '0';
    input.setAttribute('aria-label', 'Selected frame');
    input.addEventListener('change', () => {
      if (lens.setFrame(Number(input.value))) frameNumber = Number(input.value);
      else
        notify(
          'That frame is not retained in this capture. Choose a visible frame or Latest.',
          true
        );
      refresh(true);
    });
    toolbar.append(
      input,
      button('›', () =>
        chooseFrame(Math.min(snapshot.frames.length - 1, index + 1))
      )
    );
    if (current) {
      toolbar.append(
        el(
          'span',
          `CPU submit ${current.cpu_ms === null ? 'unavailable' : current.cpu_ms.toFixed(2) + ' ms'}`
        ),
        badge(
          current.cpu_fidelity,
          'Observed render-call wall time, not GPU time'
        )
      );
    }
    const marker = button('Add marker', addMarker, 'flag');
    marker.disabled = !canMutate();
    toolbar.append(
      el('span', undefined, 'tlp-grow'),
      button('Latest', () => {
        lens.setFrame(null);
        frameNumber = undefined;
        refresh(true);
      }),
      marker,
      button('Set baseline', baseline, 'flag')
    );
    timeline.append(toolbar);
    const bars = el('div', undefined, 'tlp-timeline-bars');
    const max = Math.max(
      1,
      ...snapshot.frames.map((frame) => frame.cpu_ms ?? 0)
    );
    snapshot.frames.slice(-100).forEach((frame) => {
      const bar = button(
        '',
        () => {
          lens.setFrame(frame.frame, frame.context_id);
          frameNumber = frame.frame;
          refresh(true);
        },
        undefined,
        'tlp-frame-bar'
      );
      bar.title = `Frame ${frame.frame} · CPU ${frame.cpu_ms?.toFixed(2) ?? 'unavailable'} ms · ${frame.cpu_fidelity}`;
      bar.setAttribute('aria-label', `Inspect frame ${frame.frame}`);
      bar.dataset.selected = String(current?.frame === frame.frame);
      if (!options.csp?.safeMode)
        bar.style.height = `${Math.max(5, ((frame.cpu_ms ?? 0) / max) * 36)}px`;
      bars.append(bar);
    });
    timeline.append(bars);
    const lanes = el('div', undefined, 'tlp-timeline-lanes');
    if (current) {
      for (const [id, label] of [
        [current.entity_ids[0], 'Scene / renderer'],
        [current.entity_ids[1], 'Camera'],
      ] as const) {
        if (!id) continue;
        lanes.append(
          button(
            lens.getNode(id)?.name ?? label,
            () => choose(id),
            undefined,
            'tlp-link'
          )
        );
        const lane = el('div', undefined, 'tlp-lane');
        lane.append(
          el(
            'span',
            label === 'Scene / renderer'
              ? 'Observed render submission'
              : 'Camera used by render call'
          )
        );
        lanes.append(lane);
      }
    } else lanes.append(el('span', 'No frame events recorded', 'tlp-muted'));
    timeline.append(lanes);
  }
  function renderDoctor() {
    if (!dom) return;
    const { el, heading, badge } = dom;
    const box = el('div', undefined, 'tlp-doctor');
    box.append(heading('Doctor / Capture diagnostics'));
    const report = lens.doctor();
    box.append(el('pre', JSON.stringify(report.environment, null, 2)));
    for (const [name, value] of Object.entries(report.capability_matrix)) {
      const row = el('div', undefined, 'tlp-metric');
      row.append(el('span', name), badge(value.fidelity, value.reason));
      box.append(row);
    }
    for (const warning of report.warnings)
      box.append(el('p', String(warning), 'tlp-surface-note'));
    main.append(box);
  }
  function updateSelectionBounds() {
    selectionBox?.remove();
    selectionBox = undefined;
    if (!highlighted || !shown || !context.selectedId || !dom || !dynamicStyle)
      return;
    const viewport = lens.getViewportBounds(),
      bounds = lens.getSelectionBounds(context.selectedId);
    if (!viewport || !bounds) return;
    const box = dom.el('div', undefined, 'tlp-selection-box');
    box.append(
      dom.el(
        'span',
        lens.getNode(context.selectedId)?.name ?? 'Selected bounds',
        'tlp-selection-tag'
      )
    );
    box.setAttribute('aria-label', 'Selected entity bounds');
    const embedded = layout !== 'overlay' && !!viewportHost;
    dynamicStyle.textContent = `.tlp-selection-box{position:${embedded ? 'absolute' : 'fixed'};z-index:${embedded ? 3 : 9999};left:${(embedded ? 0 : viewport.x) + bounds.x * viewport.width}px;top:${(embedded ? 0 : viewport.y) + bounds.y * viewport.height}px;width:${bounds.width * viewport.width}px;height:${bounds.height * viewport.height}px}`;
    (embedded ? viewportHost! : doc!.body).append(box);
    selectionBox = box;
  }
  function updateOverlayTools() {
    overlayTools?.remove();
    overlayTools = undefined;
    if (!dom || !shown || layout !== 'overlay' || activeTool !== 'inspect')
      return;
    const bar = dom.el('div', undefined, 'tlp-floating-pickbar');
    const pick = dom.button(picking ? 'Picking…' : 'Pick', beginPick, 'pick');
    pick.disabled = !canMutate();
    const focus = dom.button(
      'Focus',
      () => notify(lens.focus() ? 'Camera focused.' : 'Focus unavailable.'),
      'focus'
    );
    focus.disabled = !canMutate();
    bar.append(
      pick,
      focus,
      dom.button(
        'Clear',
        () => {
          lens.select([]);
          lens.highlight(null);
          highlighted = false;
          selectionBox?.remove();
        },
        'close'
      )
    );
    doc!.body.append(bar);
    overlayTools = bar;
  }
  function refresh(force = false) {
    if (!root || disposed || !dom) return;
    refreshHeader();
    const snapshot = currentSnapshot();
    const selected = context.selectedId;
    const key = JSON.stringify([
      activeTool,
      selected,
      lens.getNode(selected ?? ''),
      lens.getMode(),
      context.frame,
      snapshot.frames.at(-1)?.frame,
      snapshot.resources.map((r) => [r.entity_id, r.state, r.memory_bytes]),
      fidelity,
      doctorOpen,
    ]);
    if (!force && key === lastIdentity) {
      updateSelectionBounds();
      return;
    }
    lastIdentity = key;
    const mainScroll = main.scrollTop,
      inspectorScroll = inspector.scrollTop,
      treeScroll = tree.scrollTop;
    const active = doc!.activeElement as
      | HTMLInputElement
      | HTMLSelectElement
      | null;
    const focusLabel = active?.getAttribute('aria-label');
    const selectionStart =
      active instanceof (win?.HTMLInputElement ?? HTMLInputElement)
        ? active.selectionStart
        : null;
    const scrollStates = [
      ...root.querySelectorAll<HTMLElement>('div,aside,nav,pre'),
    ]
      .filter((element) => element.scrollTop > 0)
      .map((element) => ({
        className: element.className,
        top: element.scrollTop,
        index: [...root!.querySelectorAll<HTMLElement>('div,aside,nav,pre')]
          .filter((candidate) => candidate.className === element.className)
          .indexOf(element),
      }));
    restoreViewport();
    renderTree();
    main.replaceChildren();
    main.dataset.tool = activeTool;
    if (doctorOpen) renderDoctor();
    else if (activeTool === 'inspect') renderViewport(snapshot);
    else if (activeTool === 'changes') main.append(trace!.render());
    else if (activeTool === 'surfaces')
      main.append(
        renderSurfaces(context, {
          pick: beginPick,
          workspace: () => {
            setLayout('workspace');
            setTool('inspect');
          },
          overlay: () => {
            setLayout('overlay');
            setTool('inspect');
          },
          dock: () => {
            setLayout('dock');
            setTool('inspect');
          },
          window: openWindow,
          commands: commandPalette,
          openTrace: () => file.click(),
          exportTrace: () => void perform(exportTrace),
          compare: () => setTool('changes'),
        })
      );
    else main.append(renderAnalysisView(activeTool, context));
    const next = renderInspector(context, snapshot, {
      tool: activeTool,
      fidelity,
      tab: inspectorTab,
      setTab(tab) {
        inspectorTab = tab;
        refresh(true);
      },
      baseline,
      exportTrace: () => void perform(exportTrace),
      compare: () => setTool('changes'),
      memory: () => setTool('memory'),
      readonly: options.readonly,
      comparison: pendingComparison,
    });
    inspector.replaceWith(next);
    inspector = next;
    renderTimeline(snapshot);
    main.scrollTop = mainScroll;
    inspector.scrollTop = inspectorScroll;
    tree.scrollTop = treeScroll;
    for (const state of scrollStates) {
      const target = [
        ...root.querySelectorAll<HTMLElement>('div,aside,nav,pre'),
      ].filter((candidate) => candidate.className === state.className)[
        state.index
      ];
      if (target) target.scrollTop = state.top;
    }
    if (focusLabel) {
      const target = [
        ...root.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
          'input,select'
        ),
      ].find(
        (candidate) => candidate.getAttribute('aria-label') === focusLabel
      );
      if (target) {
        target.focus({ preventScroll: true });
        if (
          selectionStart !== null &&
          target.tagName === 'INPUT' &&
          ['text', 'search'].includes((target as HTMLInputElement).type)
        )
          (target as HTMLInputElement).setSelectionRange(
            selectionStart,
            selectionStart
          );
      }
    }
    const dropped = snapshot.dropped_events;
    if (dropped)
      notify(
        `${dropped.toLocaleString()} earlier events dropped; final state retained.`
      );
    else if (
      snapshot.frames.length &&
      status.textContent === 'Waiting for the first captured render call.'
    )
      notify(
        'Select an entity, follow its resources, and verify changes against a baseline.'
      );
    updateSelectionBounds();
    updateOverlayTools();
  }
  function show(value: Lens) {
    if (disposed || !doc) return;
    lens = value;
    if (!root) mount();
    if (!root) return;
    shown = true;
    collapsed = false;
    root.hidden = false;
    if (launcher) launcher.hidden = true;
    if (hud) hud.hidden = true;
    refresh(true);
  }
  function hide() {
    shown = false;
    restoreViewport();
    selectionBox?.remove();
    overlayTools?.remove();
    if (root) root.hidden = true;
    if (hud) hud.hidden = true;
    if (launcher) launcher.hidden = false;
  }
  return {
    show,
    hide,
    dispose() {
      if (disposed) return;
      disposed = true;
      shown = false;
      restoreViewport();
      if (timer) clearInterval(timer);
      unsubscribe?.();
      for (const cleanup of unmountHandlers) cleanup();
      trace?.dispose();
      popupUI?.dispose();
      if (popup && !popup.closed) popup.close();
      selectionBox?.remove();
      overlayTools?.remove();
      root?.remove();
      launcher?.remove();
      hud?.remove();
      stylesheet?.remove();
      dynamicStyle?.remove();
    },
  };
}
