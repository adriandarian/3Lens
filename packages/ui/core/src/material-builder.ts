/**
 * Material Builder Panel
 *
 * Lightweight graph-building scaffold for composing material nodes.
 *
 * @packageDocumentation
 */

import type { Panel } from './types';

export type MaterialBuilderNodeType = 'texture' | 'value' | 'math';

export interface MaterialBuilderPort {
  id: string;
  name: string;
  direction: 'input' | 'output';
  dataType: 'vector2' | 'color' | 'float';
}

export interface MaterialBuilderNode {
  id: string;
  type: MaterialBuilderNodeType;
  title: string;
  position: { x: number; y: number };
  ports: MaterialBuilderPort[];
}

export interface MaterialBuilderPanelOptions {
  initialLibraryOpen?: boolean;
  initialNodes?: MaterialBuilderNode[];
}

function createNode(type: MaterialBuilderNodeType, index: number): MaterialBuilderNode {
  const position = { x: 48 + (index % 4) * 180, y: 72 + Math.floor(index / 4) * 150 };

  if (type === 'texture') {
    return {
      id: 'material-texture-' + index,
      type,
      title: 'Texture2D ' + index,
      position,
      ports: [
        { id: 'uv', name: 'UV', direction: 'input', dataType: 'vector2' },
        { id: 'rgba', name: 'RGBA', direction: 'output', dataType: 'color' },
      ],
    };
  }

  if (type === 'value') {
    return {
      id: 'material-value-' + index,
      type,
      title: 'Float ' + index,
      position,
      ports: [{ id: 'value', name: 'Value', direction: 'output', dataType: 'float' }],
    };
  }

  return {
    id: 'material-math-' + index,
    type,
    title: 'Add ' + index,
    position,
    ports: [
      { id: 'a', name: 'A', direction: 'input', dataType: 'float' },
      { id: 'b', name: 'B', direction: 'input', dataType: 'float' },
      { id: 'out', name: 'Out', direction: 'output', dataType: 'float' },
    ],
  };
}

function isNodeType(value: string | undefined): value is MaterialBuilderNodeType {
  return value === 'texture' || value === 'value' || value === 'math';
}

function renderNode(node: MaterialBuilderNode): string {
  const inputs = node.ports
    .filter((port) => port.direction === 'input')
    .map((port) => '<span class="material-builder-port input">' + port.name + '</span>')
    .join('');
  const outputs = node.ports
    .filter((port) => port.direction === 'output')
    .map((port) => '<span class="material-builder-port output">' + port.name + '</span>')
    .join('');

  return [
    '<div class="material-builder-node" style="left:' + node.position.x + 'px;top:' + node.position.y + 'px">',
    '<div class="material-builder-node-title">' + node.title + '</div>',
    '<div class="material-builder-node-ports"><div>' + inputs + '</div><div>' + outputs + '</div></div>',
    '</div>',
  ].join('');
}

function renderPanel(nodes: MaterialBuilderNode[], libraryOpen: boolean): string {
  return [
    '<style>',
    '.material-builder{display:grid;grid-template-columns:' + (libraryOpen ? '180px 1fr 210px' : '52px 1fr 210px') + ';height:100%;min-height:420px;background:#111827;color:#e5e7eb;font:12px/1.4 ui-sans-serif,system-ui,sans-serif}',
    '.material-builder-library,.material-builder-inspector{border-right:1px solid #273244;background:#0f172a;overflow:auto}',
    '.material-builder-inspector{border-right:0;border-left:1px solid #273244;padding:12px}',
    '.material-builder-library-header{display:flex;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid #273244;font-weight:600}',
    '.material-builder-library-body{display:flex;flex-direction:column;gap:8px;padding:10px}',
    '.material-builder-library.collapsed .material-builder-library-body,.material-builder-library.collapsed .library-label{display:none}',
    '.material-builder button{border:1px solid #334155;border-radius:6px;background:#1e293b;color:#e5e7eb;padding:7px 9px;cursor:pointer}',
    '.material-builder button:hover{background:#26364d}',
    '.material-builder-canvas{position:relative;overflow:auto;background-color:#111827;background-image:linear-gradient(#1f2937 1px,transparent 1px),linear-gradient(90deg,#1f2937 1px,transparent 1px);background-size:24px 24px}',
    '.material-builder-node{position:absolute;width:150px;border:1px solid #475569;border-radius:8px;background:#182235;box-shadow:0 6px 18px rgba(0,0,0,.25)}',
    '.material-builder-node-title{padding:8px 10px;border-bottom:1px solid #334155;font-weight:600}',
    '.material-builder-node-ports{display:flex;justify-content:space-between;gap:10px;padding:10px}.material-builder-node-ports>div{display:flex;flex-direction:column;gap:6px}',
    '.material-builder-port{color:#94a3b8}.material-builder-port.output{text-align:right;color:#7dd3fc}',
    '.material-builder-output{position:absolute;left:72%;top:120px;width:170px;border:1px solid #16a34a;border-radius:8px;background:#13251a}',
    '.material-builder-output .material-builder-node-title{border-color:#166534}',
    '.material-builder-section{margin-bottom:16px}.material-builder-section h3{font-size:12px;margin:0 0 8px;color:#f8fafc}.material-builder-section p{margin:0;color:#94a3b8}',
    '</style>',
    '<div class="material-builder">',
    '<aside class="material-builder-library ' + (libraryOpen ? 'open' : 'collapsed') + '">',
    '<div class="material-builder-library-header"><span class="library-label">Node Library</span><button type="button" data-action="material-builder-toggle-library" aria-label="Toggle node library">' + (libraryOpen ? 'Hide' : '☰') + '</button></div>',
    '<div class="material-builder-library-body">',
    '<button type="button" data-action="material-builder-add-node" data-node-type="texture">Texture2D</button>',
    '<button type="button" data-action="material-builder-add-node" data-node-type="value">Float Value</button>',
    '<button type="button" data-action="material-builder-add-node" data-node-type="math">Math Add</button>',
    '</div></aside>',
    '<main class="material-builder-canvas">' + nodes.map(renderNode).join(''),
    '<div class="material-builder-output"><div class="material-builder-node-title">PBR Output</div><div class="material-builder-node-ports"><div><span class="material-builder-port input">Base Color</span><span class="material-builder-port input">Metalness</span><span class="material-builder-port input">Roughness</span></div></div></div>',
    '</main>',
    '<aside class="material-builder-inspector">',
    '<div class="material-builder-section"><h3>Material Builder</h3><p>Architecture scaffold for node composition and live material editing.</p></div>',
    '<div class="material-builder-section"><h3>MVP status</h3><p>Node library and local graph scaffold are interactive. Wiring and material command execution remain follow-up work.</p></div>',
    '</aside>',
    '</div>',
  ].join('');
}

/**
 * Create an interactive Material Builder panel.
 */
export function createMaterialBuilderPanel(options: MaterialBuilderPanelOptions = {}): Panel {
  let container: HTMLElement | null = null;
  let libraryOpen = options.initialLibraryOpen ?? true;
  let nodes = options.initialNodes ? options.initialNodes.map((node) => ({ ...node })) : [];
  let nextNodeIndex = nodes.length + 1;

  const render = () => {
    if (!container) return;

    container.innerHTML = renderPanel(nodes, libraryOpen);

    container
      .querySelector<HTMLButtonElement>('[data-action="material-builder-toggle-library"]')
      ?.addEventListener('click', () => {
        libraryOpen = !libraryOpen;
        render();
      });

    container
      .querySelectorAll<HTMLButtonElement>('[data-action="material-builder-add-node"]')
      .forEach((button) => {
        button.addEventListener('click', () => {
          if (!isNodeType(button.dataset.nodeType)) return;
          nodes = [...nodes, createNode(button.dataset.nodeType, nextNodeIndex++)];
          render();
        });
      });
  };

  return {
    id: 'material-builder',
    name: 'Material Builder',

    render(target: HTMLElement) {
      container = target;
      render();
    },

    dispose() {
      container = null;
    },
  };
}
