// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Blob as NodeBlob } from 'node:buffer';
import { createLens, type Lens } from '@3lens/runtime';
import { createLensHud } from '@3lens/ui-core';
import type { Node } from '@3lens/kernel';
import { worthLookingAt, describeEntity } from '../../packages/ui/core/src/hud/data';

const lenses: Lens[] = [];
afterEach(() => {
  for (const lens of lenses.splice(0)) lens.dispose();
  document.body.replaceChildren();
  document.head.replaceChildren();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const base = { context_id: 'main', created_at: 1, modified_at: 1, origin: 'preexisting', active: true };
const object = (id: string, name: string) =>
  ({ ...base, id: `main:object3d:${id}`, type: 'object3d', name, object_type: 'Mesh', visible: true, child_count: 0, frustum_culled: true, render_order: 0, layer_mask: 1 }) as Node;

function fixture(options: { setBaseline?: boolean } = {}) {
  const host = document.createElement('div');
  host.id = 'app';
  host.innerHTML = '<canvas id="c"></canvas>';
  document.body.append(host);
  const hostMarkup = host.outerHTML;
  const insets: unknown[] = [];
  const lens = createLens({
    enabled: true,
    ui: 'overlay',
    uiAdapter: createLensHud({ analysis: 'panel', onInsets: (value) => insets.push(value) }),
  });
  lenses.push(lens);
  const graph = lens.getGraph();
  graph.addNode(object('cube', 'MainCube'));
  graph.addNode(object('other', 'SharedCube'));
  graph.addNode(object('third', 'ThirdCube'));
  graph.addNode({ ...base, id: 'main:geometry:box', type: 'geometry', name: 'Box geometry', is_indexed: false, vertex_count: 3, attributes: [], memory_bytes: 4096, memory_fidelity: 'ESTIMATED', memory_reason: 'CPU buffers are only a proxy.' } as Node);
  graph.addNode({ ...base, id: 'main:texture:albedo', type: 'texture', name: 'albedo.png', width: 2048, height: 2048, memory_bytes: 0, memory_fidelity: 'UNAVAILABLE', memory_reason: 'GPU texture allocation size is not observable through this host.' } as unknown as Node);
  for (const user of ['cube', 'other', 'third'])
    graph.addEdge({ from: `main:object3d:${user}`, to: 'main:geometry:box', type: 'uses', slot: 'geometry', created_at: 1, active: true });
  graph.addEdge({ from: 'main:object3d:cube', to: 'main:texture:albedo', type: 'uses', slot: 'map', created_at: 1, active: true });
  if (options.setBaseline) lens.captureBaseline();
  lens.showUI();
  return { lens, host, hostMarkup, insets };
}

const hudRoot = () => document.querySelector<HTMLElement>('[data-three-lens="hud"]')!;
const card = () => document.querySelector<HTMLElement>('.tlh-card')!;
function click(text: string, scope: ParentNode = document) {
  const button = [...scope.querySelectorAll('button')].find(
    (b) => b.textContent?.trim() === text || (b.hasAttribute('data-row') && b.querySelector('.t')?.textContent === text) || b.getAttribute('aria-label') === text || b.getAttribute('title') === text
  );
  expect(button, `button ${text}`).toBeTruthy();
  button!.click();
}

describe('HUD surface contract', () => {
  it('lives above the application without touching its DOM and reports a LIVE status, not a toggle', () => {
    const { host, hostMarkup } = fixture();
    expect(host.outerHTML).toBe(hostMarkup);
    expect(hudRoot().parentElement).toBe(document.body);
    expect(hudRoot().querySelector('[data-kind="status"]')!.textContent).toBe('LIVE');
    expect(hudRoot().querySelector('select[aria-label="Capture mode"]')).toBeTruthy();
    expect(hudRoot().textContent).toContain('overhead');
  });

  it('answers What / Uses / Cost / Changed on a card with explicit fidelity and no fabricated per-object timing', () => {
    const { lens } = fixture();
    lens.select('main:object3d:cube');
    expect(card().hidden).toBe(false);
    const text = card().textContent!;
    expect(text).toContain('MainCube');
    expect(text).toContain('main:object3d:cube');
    expect(text).toContain('Box geometry');
    expect(text).toContain('shared ×3');
    expect(card().querySelector('[data-fidelity="ESTIMATED"]')).toBeTruthy();
    const timing = [...card().querySelectorAll('[data-fidelity="UNAVAILABLE"]')].filter((node) =>
      node.getAttribute('title')?.includes('renderer-level')
    );
    expect(timing).toHaveLength(1);
    expect(text).not.toMatch(/\d+(\.\d+)? ?ms/);
    expect(text).toContain('No baseline yet');
  });

  it('shows observed changes after a baseline, ranks them first, and navigates through shared selection', () => {
    const { lens } = fixture();
    click('Set baseline', hudRoot());
    lens.getGraph().updateNode('main:object3d:cube', { visible: false } as Partial<Node>);
    lens.select('main:object3d:cube');
    expect(card().textContent).toContain('visible: true → false');
    expect(card().querySelector('[data-fidelity="EXACT"]')).toBeTruthy();
    click('Worth looking at', hudRoot());
    const drawer = hudRoot().querySelector('.tlh-drawer')!;
    const titles = [...drawer.querySelectorAll('.tlh-group-title')].map((node) => node.textContent);
    expect(titles[0]).toBe('Changed since baseline');
    lens.select([]);
    (drawer.querySelector('[data-row]') as HTMLElement).click();
    expect(lens.getSelection().entity_ids).toEqual(['main:object3d:cube']);
  });

  it('publishes covered edges only while the drawer is open', () => {
    const { insets } = fixture();
    click('Worth looking at', hudRoot());
    expect((insets.at(-1) as { right: number }).right).toBeGreaterThan(300);
    click('Close drawer', hudRoot());
    expect((insets.at(-1) as { right: number }).right).toBe(0);
  });

  it('opens a command palette with investigative questions that return attributed, fidelity-labelled results', () => {
    const { lens } = fixture();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    const backdrop = hudRoot().querySelector<HTMLElement>('.tlh-backdrop')!;
    expect(backdrop.hidden).toBe(false);
    expect(backdrop.textContent).toContain('What uses the most memory?');
    click('What uses the most memory?', backdrop);
    expect(backdrop.textContent).toContain('Box geometry');
    expect(backdrop.querySelector('[data-fidelity="ESTIMATED"]')).toBeTruthy();
    (backdrop.querySelector('[data-row]') as HTMLElement).click();
    expect(lens.getSelection().entity_ids).toEqual(['main:geometry:box']);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    expect(backdrop.hidden).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(backdrop.hidden).toBe(true);
  });

  it('does not bind bare keys that would collide with the host application', () => {
    const { lens } = fixture();
    const spy = vi.spyOn(lens, 'pick');
    const focus = vi.spyOn(lens, 'focus');
    for (const key of ['p', 'f', 'P', 'F']) document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    expect(spy).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
    expect(hudRoot().querySelector<HTMLElement>('.tlh-backdrop')!.hidden).toBe(true);
  });

  it('renders captured names as text, never markup', () => {
    const { lens } = fixture();
    lens.getGraph().updateNode('main:object3d:cube', { name: '<img src=x onerror=alert(1)>' });
    lens.select('main:object3d:cube');
    expect(card().querySelector('img')).toBeNull();
    expect(card().textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('never ranks anything as changed without a baseline, and never ranks by per-object time', () => {
    const { lens } = fixture();
    const insights = worthLookingAt(lens, false);
    expect(insights.some((insight) => insight.kind === 'changed')).toBe(false);
    expect(insights.some((insight) => insight.kind === 'memory')).toBe(true);
    expect(insights.find((insight) => insight.kind === 'shared')).toMatchObject({ entityId: 'main:geometry:box', fidelity: 'EXACT' });
    // An UNAVAILABLE texture is shown as unavailable, not as zero bytes.
    const texture = describeEntity(lens, 'main:object3d:cube', false)!.resources.find((resource) => resource.node.id === 'main:texture:albedo');
    expect(texture).toMatchObject({ fidelity: 'UNAVAILABLE', bytes: null });
    expect(texture!.value).toContain('2048×2048');
  });

  it('keeps working on a saved trace with the same card, and says so', async () => {
    vi.stubGlobal('Blob', NodeBlob);
    const { lens } = fixture({ setBaseline: true });
    lens.getGraph().updateNode('main:object3d:cube', { visible: false } as Partial<Node>);
    lens.select('main:object3d:cube');
    const trace = await lens.exportTrace();
    await lens.loadTrace(trace);
    lens.showUI();
    expect(lens.getMode()).toBe('offline');
    expect(hudRoot().querySelector('[data-kind="status"]')!.textContent).toBe('SAVED TRACE');
    expect(hudRoot().querySelector<HTMLButtonElement>('button.tlh-pill[data-active]')!.disabled).toBe(true);
    expect(card().textContent).toContain('MainCube');
    // The baseline comes from the loaded investigation, not from this HUD's own Set baseline.
    expect(card().textContent).not.toContain('No baseline yet');
    expect(card().textContent).toContain('visible: true → false');
    click('Worth looking at', hudRoot());
    const titles = [...hudRoot().querySelectorAll('.tlh-drawer .tlh-group-title')].map((node) => node.textContent);
    expect(titles[0]).toBe('Changed since baseline');
  });

  it('opens a single-investigation analysis page from the card without claiming causality', () => {
    const { lens } = fixture();
    click('Set baseline', hudRoot());
    lens.getGraph().updateNode('main:geometry:box', { memory_bytes: 16384 } as Partial<Node>);
    lens.select('main:geometry:box');
    click('Open in analysis window', card());
    const page = document.querySelector<HTMLElement>('[data-three-lens="analysis"]')!;
    expect(page).toBeTruthy();
    const text = page.textContent!;
    expect(text).toContain('What changed since the baseline');
    expect(text).toContain('Where storage sits');
    expect(text).toContain('usage path');
    expect(text).toContain('4.0 KiB to 16.0 KiB');
    expect(text).toContain('not proven causal');
    expect(text).toContain('UNAVAILABLE');
    click('Close', page);
    expect(document.querySelector('[data-three-lens="analysis"]')).toBeNull();
  });
});
