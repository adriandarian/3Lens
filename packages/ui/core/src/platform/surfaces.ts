import type { PlatformViewContext } from './types';
import { uiDom } from './dom';

export function renderSurfaces(
  context: PlatformViewContext,
  actions: {
    pick(): void;
    workspace(): void;
    overlay(): void;
    dock(): void;
    window(): void;
    commands(): void;
    openTrace(): void;
    exportTrace(): void;
    compare(): void;
  }
) {
  const { el, button, icon, heading, badge } = uiDom(context.document);
  const root = el('div', undefined, 'tlp-surfaces');
  const title = el('div', undefined, 'tlp-section-head');
  title.append(
    el('h2', '3Lens / Interaction surfaces'),
    button('Back to workspace', actions.workspace, 'cube')
  );
  root.append(title);
  const grid = el('div', undefined, 'tlp-surface-grid');
  root.append(grid);
  const selected = context.selectedId
    ? (context.lens.getNode(context.selectedId)?.name ?? context.selectedId)
    : 'Selected entity';
  const entries = [
    [
      '01 / Pick and inspect',
      'Click an entity in the application. The shared inspector follows your selection.',
      'Pick entity',
      actions.pick,
      'pick',
    ],
    [
      '02 / Docked workspace',
      'Persistent entity tree, inspector, and timeline. Resize panels using their dividers.',
      'Dock tools',
      actions.dock,
      'surfaces',
    ],
    [
      '03 / Overlay mode',
      'A draggable, resizable inspector. Hold Alt to pass input through to the application.',
      'Open overlay',
      actions.overlay,
      'cube',
    ],
    [
      '04 / Trace window and commands',
      'Inspect saved captures in a separate window, or navigate from the command palette.',
      'Open trace window',
      actions.window,
      'folder',
    ],
  ] as const;
  for (const [name, description, label, action, symbol] of entries) {
    const card = el('section', undefined, 'tlp-card tlp-surface-card');
    card.append(heading(name), el('p', description));
    const illustration = el('div', undefined, 'tlp-surface-illustration');
    const viewport = el(
      'div',
      'Existing application viewport',
      'tlp-mini-viewport'
    );
    const toolbar = el('div', undefined, 'tlp-mini-toolbar');
    toolbar.append(
      button('Select', actions.pick, 'pick'),
      button('Pick', actions.pick, 'focus'),
      button(
        'Focus',
        () => {
          context.lens.focus();
        },
        'focus'
      ),
      button('Clear', () => context.lens.select([]), 'close')
    );
    viewport.append(toolbar);
    if (context.readonly)
      for (const b of toolbar.querySelectorAll<HTMLButtonElement>('button'))
        if (b.textContent !== 'Clear') b.disabled = true;
    if (name.startsWith('01')) {
      const bounds = el('div', undefined, 'tlp-mini-selection');
      bounds.append(el('span', selected));
      viewport.append(bounds);
    }
    const inspector = el('div', undefined, 'tlp-mini-inspector');
    inspector.append(
      el('strong', 'Inspector'),
      el('strong', selected),
      el('small', 'Overview     Rendering     Material'),
      el('small', 'Cost (captured state)')
    );
    const metrics = el('div', undefined, 'tlp-mini-metrics');
    metrics.append(
      el('span', 'GPU time'),
      badge('UNAVAILABLE', 'No per-object GPU timer captured'),
      el('span', 'CPU attribution'),
      badge('UNAVAILABLE', 'Only renderer-level CPU time is observed'),
      el('span', 'Stable identity'),
      badge('EXACT'),
      el('span', 'Resources'),
      el('span', 'Follow captured usage')
    );
    inspector.append(
      metrics,
      el('small', 'Hierarchy'),
      el('code', context.selectedId ?? 'No selected entity'),
      el('small', 'Materials / captured relationships')
    );
    illustration.append(viewport, inspector);
    if (name.startsWith('02')) {
      const tree = el('div', undefined, 'tlp-mini-tree');
      tree.append(el('strong', 'Entity tree'), el('small', 'Search entities…'));
      for (const node of context.lens
        .getGraph()
        .getNodes()
        .nodes.filter((node) =>
          ['scene', 'object3d', 'camera'].includes(node.type)
        )
        .slice(0, 5)) {
        tree.append(
          button(node.name ?? node.type, () => context.select(node.id), 'cube')
        );
      }
      illustration.insertBefore(tree, inspector);
      const timeline = el('div', undefined, 'tlp-mini-timeline');
      timeline.append(el('span', 'Frame timeline'), el('i'));
      illustration.append(timeline);
    }
    if (name.startsWith('03')) {
      illustration.classList.add('tlp-mini-overlay');
      inspector.prepend(
        el('span', 'Inspector                        F2  ×', 'tlp-muted')
      );
      const pass = el('small', 'Pass input to app: hold Alt', 'tlp-mini-pass');
      illustration.append(pass);
    }
    if (name.startsWith('04')) {
      illustration.replaceChildren();
      const drop = el('div', undefined, 'tlp-mini-drop');
      drop.append(
        icon('folder'),
        el('strong', 'Open trace'),
        el('small', 'Drop a .json trace file to inspect offline'),
        button('Open trace…', actions.openTrace)
      );
      drop.addEventListener('dragover', (event) => event.preventDefault());
      drop.addEventListener('drop', (event) => {
        event.preventDefault();
        const file = event.dataTransfer?.files[0];
        if (file)
          void context.lens
            .loadTrace(file)
            .then(() => {
              context.notify('Trace loaded from drop. Live capture detached.');
              context.refresh();
            })
            .catch((error) => context.notify(String(error)));
      });
      const palette = el('div', undefined, 'tlp-mini-palette');
      palette.append(el('strong', 'Command palette                    Ctrl K'));
      for (const [label, action] of [
        ['Select entity', actions.workspace],
        [
          'Follow material',
          () => {
            const resources = context.selectedId
              ? context.lens.query<{ data: { id: string; type: string }[] }>(
                  'resources_used_by',
                  { entity_id: context.selectedId }
                )?.data
              : [];
            const material = resources?.find(
              (node) => node.type === 'material'
            );
            if (material) context.select(material.id);
          },
        ],
        [
          'Set baseline',
          () => {
            context.lens.captureBaseline();
            context.notify('Baseline saved.');
          },
        ],
        ['Export trace', actions.exportTrace],
        ['Compare traces', actions.compare],
      ] as const)
        palette.append(button(label, action));
      illustration.append(drop, palette);
    }
    card.append(illustration);
    const controls = el('div', undefined, 'tlp-actions');
    controls.append(button(label, action, symbol));
    if (name.startsWith('02'))
      controls.append(button('Full workspace', actions.workspace));
    if (name.startsWith('04'))
      controls.append(button('Command palette', actions.commands, 'search'));
    card.append(controls);
    grid.append(card);
  }
  const strip = el('div', undefined, 'tlp-path');
  strip.append(
    el('span', 'Shared primitives', 'tlp-muted'),
    badge('EXACT'),
    badge('ESTIMATED', 'Proxy-based data; reasons remain visible'),
    badge('UNAVAILABLE', 'Unsupported capture data is never fabricated'),
    el('code', context.selectedId ?? 'No selection')
  );
  root.append(strip);
  return root;
}
