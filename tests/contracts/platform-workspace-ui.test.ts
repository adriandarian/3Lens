// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLens, type Lens } from '@3lens/runtime';
import { createInvestigationUI } from '@3lens/ui-core';
import type { Node } from '@3lens/kernel';

const lenses: Lens[] = [];
afterEach(() => {
  for (const lens of lenses.splice(0)) lens.dispose();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
function setup(options: Parameters<typeof createInvestigationUI>[0] = {}) {
  const lens = createLens({
    enabled: true,
    ui: 'overlay',
    uiAdapter: createInvestigationUI(options),
  });
  lenses.push(lens);
  const base = {
    context_id: 'main',
    created_at: 0,
    modified_at: 0,
    origin: 'preexisting',
    active: true,
  };
  lens
    .getGraph()
    .addNode({
      ...base,
      id: 'main:object3d:cube',
      type: 'object3d',
      name: 'MainCube',
      object_type: 'Mesh',
      visible: true,
    } as Node);
  lens
    .getGraph()
    .addNode({
      ...base,
      id: 'main:geometry:box',
      type: 'geometry',
      name: 'BoxGeometry',
      memory_bytes: 840,
      memory_fidelity: 'ESTIMATED',
    } as Node);
  lens
    .getGraph()
    .addEdge({
      from: 'main:object3d:cube',
      to: 'main:geometry:box',
      type: 'uses',
      created_at: 0,
      active: true,
    });
  lens.captureBaseline();
  lens.select('main:object3d:cube');
  lens.showUI();
  return lens;
}
function clickTab(tool: string) {
  document
    .querySelector<HTMLButtonElement>(`.tlp-nav [data-tool="${tool}"]`)!
    .click();
}
function click(label: string) {
  const control = [...document.querySelectorAll('button')].find(
    (button) =>
      button.textContent?.trim() === label ||
      button.querySelector('span')?.textContent === label
  );
  expect(control, label).toBeTruthy();
  control!.click();
}

describe('Benchmark shell structure', () => {
  it('keeps the header and tab bar on every tool so navigation never depends on the rail', () => {
    setup();
    for (const tool of [
      'inspect',
      'performance',
      'memory',
      'changes',
      'shaders',
      'surfaces',
    ]) {
      clickTab(tool);
      expect(document.querySelector('.tlp-topbar'), tool).toBeTruthy();
      const tab = document.querySelector(`.tlp-nav [data-tool="${tool}"]`)!;
      expect(tab.getAttribute('aria-selected'), tool).toBe('true');
    }
  });
  it('limits the rail to entity jumps and routes them through shared selection', () => {
    const lens = setup();
    clickTab('memory');
    const labels = [...document.querySelectorAll('.tlp-tool-rail button')].map(
      (button) => button.textContent
    );
    expect(labels).toEqual([
      'Materials',
      'Textures',
      'Geometries',
      'Lights',
      'Cameras',
    ]);
    click('Geometries');
    expect(lens.getSelection().entity_ids[0]).toBe('main:geometry:box');
  });
  it('keeps window controls accessible when rendered as icons', () => {
    setup();
    for (const label of ['Commands', 'Minimize', 'Close (F2)']) {
      const control = [...document.querySelectorAll('.tlp-top-actions button')].find(
        (button) => button.textContent === label
      );
      expect(control, label).toBeTruthy();
      expect(control!.classList.contains('tlp-icon-only')).toBe(true);
      expect(control!.getAttribute('title')).toBe(label);
    }
    expect(document.querySelector('[aria-label="UI surface"]')!.closest('.tlp-statusbar')).toBeTruthy();
  });
  it('names the inspector contract question behind each short section title', () => {
    setup();
    const sections = Object.fromEntries(
      [...document.querySelectorAll('.tlp-inspector-section')].map((section) => [
        section.querySelector('h3')!.textContent,
        section.getAttribute('aria-label'),
      ])
    );
    expect(sections).toMatchObject({
      Identity: 'What is this?',
      Relationships: 'Where is it used?',
      Cost: 'What does it cost?',
      Changes: 'How did it change over time?',
      Actions: 'What can I do about it?',
    });
  });
  it('collapses and expands the scene tree without losing the selection', () => {
    const lens = setup();
    lens.getGraph().addNode({
      context_id: 'main',
      created_at: 0,
      modified_at: 0,
      origin: 'preexisting',
      active: true,
      id: 'main:scene:root',
      type: 'scene',
      name: 'Scene',
    } as Node);
    lens.getGraph().addEdge({
      from: 'main:scene:root',
      to: 'main:object3d:cube',
      type: 'contains',
      created_at: 0,
      active: true,
    });
    lens.select('main:geometry:box');
    lens.select('main:object3d:cube');
    const rows = () =>
      document.querySelectorAll('.tlp-tree [data-entity-id]').length;
    const before = rows();
    const caret = document.querySelector<HTMLElement>('.tlp-caret');
    expect(caret, 'scene root exposes a caret').toBeTruthy();
    caret!.click();
    expect(rows()).toBe(before - 1);
    document.querySelector<HTMLElement>('.tlp-caret')!.click();
    expect(rows()).toBe(before);
    expect(lens.getSelection().entity_ids[0]).toBe('main:object3d:cube');
  });
});

describe('Six-concept workspace integration', () => {
  it('renders every concept area through one shared model and keeps supported entities selected', () => {
    const lens = setup();
    const sections: [string, string][] = [
      ['inspect', 'Pick entity'],
      ['performance', 'Rendering work'],
      ['memory', 'Resource lifecycle'],
      ['changes', 'Saved selections & bookmarks'],
      ['shaders', 'Shader source'],
      ['surfaces', '04 / Trace window and commands'],
    ];
    for (const [tool, text] of sections) {
      clickTab(tool);
      expect(document.querySelector('.tlp-main')!.textContent).toContain(text);
      expect(
        document.querySelector('[data-three-lens]')!.getAttribute('data-tool')
      ).toBe(tool);
    }
    expect(
      document.querySelectorAll('[data-three-lens=investigation]')
    ).toHaveLength(1);
    click('Back to workspace');
    expect(document.querySelector('.tlp-main')!.getAttribute('data-tool')).toBe(
      'inspect'
    );
    expect(lens.getSelection().entity_ids[0]).toBe('main:geometry:box');
  });
  it('moves only an explicitly supplied viewport and restores its original position on hide/dispose', () => {
    const host = document.createElement('section'),
      viewport = document.createElement('div'),
      next = document.createElement('p');
    host.append(viewport, next);
    document.body.append(host);
    const lens = setup({ viewport });
    expect(viewport.parentElement?.classList.contains('tlp-viewport')).toBe(
      true
    );
    lens.hideUI();
    expect(host.firstChild).toBe(viewport);
    expect(viewport.nextSibling).toBe(next);
    lens.showUI();
    expect(viewport.parentElement?.classList.contains('tlp-viewport')).toBe(
      true
    );
    lens.dispose();
    expect(host.firstChild).toBe(viewport);
    expect(host.children).toHaveLength(2);
  });
  it('supports surface switching, command navigation, minimize, and Alt input passthrough', () => {
    setup();
    const surface = document.querySelector<HTMLSelectElement>(
      '[aria-label="UI surface"]'
    )!;
    surface.value = 'overlay';
    surface.dispatchEvent(new Event('change'));
    expect(document.querySelector('[data-layout=overlay]')).toBeTruthy();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
    expect(document.querySelector('.tlp-pass-input')).toBeTruthy();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }));
    expect(document.querySelector('.tlp-pass-input')).toBeNull();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
    );
    expect(document.querySelector('[role=dialog]')).toBeTruthy();
    click('Compare traces');
    expect(
      document.querySelector('[data-tool=changes][data-three-lens]')
    ).toBeTruthy();
    click('Minimize');
    expect(document.querySelector<HTMLElement>('.tlp-hud')!.hidden).toBe(false);
    click('Restore tools');
    expect(
      document.querySelector<HTMLElement>('[data-three-lens]')!.hidden
    ).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2' }));
    document.querySelector<HTMLButtonElement>('.tlp-launcher')!.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2' }));
    expect(
      document.querySelector<HTMLElement>('[data-three-lens]')!.hidden
    ).toBe(true);
  });
  it('mounts the same UI in a user-initiated trace window and tears it down with the owner', () => {
    const other = document.implementation.createHTMLDocument('Trace');
    const popup = {
      document: other,
      closed: false,
      focus: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
    };
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
    const lens = setup();
    clickTab('surfaces');
    click('Open trace window');
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(other.querySelector('[data-three-lens]')).toBeTruthy();
    lens.select('main:geometry:box');
    expect(other.querySelector('.tl-detail')!.textContent).toContain(
      'BoxGeometry'
    );
    lens.dispose();
    expect(popup.close).toHaveBeenCalledTimes(1);
    expect(other.querySelector('[data-three-lens]')).toBeNull();
  });
  it('disables application mutations in read-only surfaces without disabling inspection', () => {
    const lens = setup({ readonly: true });
    expect(
      [...document.querySelectorAll<HTMLButtonElement>('button')].find(
        (button) => button.textContent === 'Pick entity'
      )!.disabled
    ).toBe(true);
    const focus = [
      ...document.querySelectorAll<HTMLButtonElement>('button'),
    ].find((button) => button.textContent === 'Focus entity')!;
    expect(focus.disabled).toBe(true);
    document
      .querySelector<HTMLButtonElement>(
        '.tl-detail [data-entity-id="main:geometry:box"]'
      )!
      .click();
    expect(lens.getSelection().entity_ids).toEqual(['main:geometry:box']);
  });
  it('keeps CSP-safe rendering free of inline style attributes across every tool', () => {
    setup({ csp: { safeMode: true, cssUrl: '/3lens.css' } });
    for (const tool of [
      'inspect',
      'performance',
      'memory',
      'changes',
      'shaders',
      'surfaces',
    ]) {
      clickTab(tool);
      expect(document.querySelector('[data-three-lens] [style]')).toBeNull();
    }
    expect(document.querySelector('link[href="/3lens.css"]')).toBeTruthy();
  });
});
