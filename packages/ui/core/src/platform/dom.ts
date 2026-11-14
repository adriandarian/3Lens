import type { Fidelity } from '@3lens/kernel';

const paths: Record<string, string[]> = {
  cube: ['M12 2 3 7v10l9 5 9-5V7Z', 'm3 7 9 5 9-5', 'M12 12v10'],
  performance: ['M4 20V12h3v8M10 20V4h3v16M16 20V8h3v12'],
  memory: [
    'M7 7h10v10H7Z',
    'M9 3v4m6-4v4M9 17v4m6-4v4M3 9h4m-4 6h4m10-6h4m-4 6h4',
  ],
  changes: ['M4 7h15m-3-3 3 3-3 3M20 17H5m3-3-3 3 3 3'],
  shaders: ['m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18'],
  surfaces: ['M3 4h18v14H3Z', 'M8 22h8m-4-4v4M15 4v14'],
  search: ['M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6'],
  pick: ['m4 2 5 17 3-7 7-3Z'],
  focus: [
    'M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5',
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  ],
  close: ['m6 6 12 12M6 18 18 6'],
  record: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16'],
  export: ['M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6'],
  folder: ['M3 5h7l2 3h9v12H3Z'],
  link: [
    'm10 14 4-4m-7 7-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 0 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  ],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v6l4 2'],
  light: [
    'M12 7a5 5 0 0 0-3 9v3h6v-3a5 5 0 0 0-3-9M10 22h4M12 1v2M2 12h2m16 0h2M4 4l2 2m12 0 2-2',
  ],
  camera: ['M3 7h5l2-3h4l2 3h5v13H3Z', 'M12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8'],
  flag: ['M5 22V3m0 0c5-4 9 4 14 0v10c-5 4-9-4-14 0'],
  settings: [
    'M12 3v3m0 12v3M3 12h3m12 0h3M6 6l2 2m8 8 2 2M6 18l2-2M16 8l2-2',
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  ],
  chevron: ['m9 5 7 7-7 7'],
  chevronDown: ['m6 9 6 6 6-6'],
  more: ['M12 5.5v.01M12 12v.01M12 18.5v.01'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18', 'M12 11v5M12 8v.01'],
  help: [
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
    'M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 17v.01',
  ],
  copy: ['M9 9h11v11H9Z', 'M5 15V4h11'],
  identity: ['M4 6h16M4 12h16M4 18h10'],
  relations: [
    'M6 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4M18 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4M12 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4',
    'm7.5 8 3.5 8m5.5-8L13 16M8 6h8',
  ],
  cost: ['M12 3a9 9 0 1 0 9 9h-9Z', 'M15 3.4A9 9 0 0 1 20.6 9H15Z'],
  bookmark: ['M6 3h12v18l-6-4-6 4Z'],
};

export function uiDom(doc: Document) {
  function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    text?: string,
    className?: string
  ) {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function icon(name: string) {
    const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('tlp-icon', `tlp-icon-${name}`);
    for (const d of paths[name] ?? paths.cube) {
      const p = doc.createElementNS(svg.namespaceURI, 'path');
      p.setAttribute('d', d);
      svg.append(p);
    }
    return svg;
  }
  function button(
    label: string,
    action: () => void,
    symbol?: string,
    className = 'tlp-btn'
  ) {
    const node = el('button', undefined, className);
    node.type = 'button';
    if (symbol) node.append(icon(symbol));
    node.append(el('span', label));
    node.addEventListener('click', action);
    return node;
  }
  function badge(level: Fidelity, reason?: string) {
    const node = el('span', level, 'tlp-badge tl-badge');
    node.dataset.fidelity = level;
    node.title =
      reason ??
      (level === 'EXACT'
        ? 'Observed in captured data'
        : 'See capture details for measurement provenance');
    return node;
  }
  function heading(title: string, trailing?: HTMLElement) {
    const node = el('div', undefined, 'tlp-section-head');
    node.append(el('h3', title));
    if (trailing) node.append(trailing);
    return node;
  }
  return { el, icon, button, badge, heading };
}

export function formatBytes(value: number): string {
  if (value < 1024) return `${value.toLocaleString()} bytes`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}
