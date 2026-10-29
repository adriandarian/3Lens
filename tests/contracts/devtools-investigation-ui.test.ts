// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Blob as NodeBlob } from 'node:buffer';
import { createLens, type Lens } from '@3lens/runtime';
import { createInvestigationUI } from '@3lens/ui-core';
import { bootstrap3Lens, get3Lens } from '../../packages/core/devtools/src/bootstrap';
import type { Node } from '@3lens/kernel';

const lenses: Lens[] = [];
afterEach(() => { for (const lens of lenses.splice(0)) lens.dispose(); get3Lens()?.dispose(); document.body.replaceChildren(); vi.useRealTimers(); vi.unstubAllGlobals(); });
function createFixture() {
  const lens = createLens({ enabled: true, ui: 'overlay', uiAdapter: createInvestigationUI() });
  lenses.push(lens);
  const graph = lens.getGraph();
  const base = { context_id: 'main', created_at: 1, modified_at: 1, origin: 'preexisting', active: true };
  graph.addNode({ ...base, id: 'main:object3d:cube', type: 'object3d', name: 'MainCube', object_type: 'Mesh', visible: true, child_count: 0, frustum_culled: true, render_order: 0, layer_mask: 1 } as Node);
  graph.addNode({ ...base, id: 'main:geometry:box', type: 'geometry', name: 'Box geometry', is_indexed: false, vertex_count: 3, attributes: [], memory_bytes: 36, memory_fidelity: 'EXACT' } as Node);
  graph.addEdge({ from: 'main:object3d:cube', to: 'main:geometry:box', type: 'uses', slot: 'geometry', created_at: 1, active: true });
  lens.captureBaseline();
  lens.showUI();
  return lens;
}
function click(text: string) {
  const button = [...document.querySelectorAll('button')].find(b => b.textContent === text);
  expect(button, `button ${text}`).toBeTruthy();
  button!.click();
}

describe('Devtools investigation UI contract', () => {
  it('routes entity and resource navigation through shared selection and shows explicit measurement fidelity', () => {
    const lens = createFixture();
    document.querySelector<HTMLButtonElement>('[data-entity-id="main:object3d:cube"]')!.click();
    expect(lens.getSelection().entity_ids).toEqual(['main:object3d:cube']);
    expect(document.querySelector('.tl-detail')!.textContent).toContain('Identity');
    expect(document.querySelector('.tl-detail')!.textContent).toContain('main:object3d:cube');
    expect(document.querySelector('.tl-detail')!.textContent).toContain('36 bytes');
    expect(document.querySelector('[data-fidelity="EXACT"]')).toBeTruthy();
    expect(document.querySelector('.tl-detail')!.textContent).toContain('100.0% share');
    expect(document.querySelector('[data-fidelity="UNAVAILABLE"]')!.getAttribute('title')).toContain('No authoritative');
    document.querySelector<HTMLButtonElement>('.tl-detail [data-entity-id="main:geometry:box"]')!.click();
    expect(lens.getSelection().entity_ids).toEqual(['main:geometry:box']);
    expect(document.querySelector('.tl-detail')!.textContent).toContain('Used by / incoming');
    expect(document.querySelector('.tl-detail')!.textContent).toContain('MainCube');
  });

  it('shows captured before/after changes and preserves the investigation when loaded offline', async () => {
    vi.stubGlobal('Blob', NodeBlob);
    const lens = createFixture();
    lens.select('main:object3d:cube');
    lens.getGraph().updateNode('main:object3d:cube', { visible: false } as Partial<Node>);
    lens.showUI();
    expect(document.querySelector('.tl-detail')!.textContent).toContain('visible: true -> false');
    const trace = await lens.exportTrace();
    await lens.loadTrace(trace);
    lens.showUI();
    expect(lens.getMode()).toBe('offline');
    expect(document.querySelector('[data-mode="offline"]')).toBeTruthy();
    expect(document.querySelector('.tl-detail')!.textContent).toContain('visible: true -> false');
    expect(lens.getSelection().entity_ids).toEqual(['main:object3d:cube']);
    expect(document.querySelector<HTMLButtonElement>('[data-action="record"]')!.disabled).toBe(true);
    vi.unstubAllGlobals();
  });

  it('shows no invented metric when exact-only filtering is selected and safely renders captured text', () => {
    const lens = createFixture();
    lens.getGraph().updateNode('main:object3d:cube', { name: '<img src=x onerror=alert(1)>' });
    lens.select('main:object3d:cube');
    expect(document.querySelector('.tl-detail img')).toBeNull();
    expect(document.querySelector('.tl-detail')!.textContent).toContain('<img src=x onerror=alert(1)>');
    const filter = document.querySelector<HTMLSelectElement>('[aria-label="Measurement fidelity"]')!;
    filter.value = 'exact'; filter.dispatchEvent(new Event('change'));
    expect(document.querySelector('[data-fidelity="UNAVAILABLE"]')).toBeNull();
    expect(document.querySelector('.tl-detail')!.textContent).toContain('36 bytes');
  });

  it('explains estimated storage and the empty exact-only measurement view', () => {
    const lens = createFixture();
    lens.getGraph().updateNode('main:geometry:box', { memory_fidelity: 'ESTIMATED', memory_reason: 'CPU buffers are only a proxy for driver storage.' } as Partial<Node>);
    lens.select('main:geometry:box');
    expect(document.querySelector('[data-fidelity=ESTIMATED]')!.getAttribute('title')).toContain('CPU buffers');
    const filter = document.querySelector<HTMLSelectElement>('[aria-label="Measurement fidelity"]')!;
    filter.value = 'exact'; filter.dispatchEvent(new Event('change'));
    expect(document.querySelector('.tl-detail')!.textContent).toContain('No EXACT resource measurements');
  });

  it('does not display an unavailable storage measurement as zero bytes', () => {
    const lens = createFixture();
    lens.getGraph().updateNode('main:geometry:box', { memory_bytes: 0, memory_fidelity: 'UNAVAILABLE' } as Partial<Node>);
    lens.select('main:geometry:box');
    expect(document.querySelector('.tl-detail')!.textContent).toContain('Storage unavailable');
    expect(document.querySelector('.tl-metric')!.textContent).not.toContain('0 bytes');
  });

  it('keeps one surface and one F2 handler through repeated show/hide, then cleans up on disposal', () => {
    const lens = createFixture();
    lens.showUI(); lens.hideUI(); lens.showUI();
    expect(document.querySelectorAll('[data-three-lens="investigation"]')).toHaveLength(1);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2' }));
    expect(document.querySelector<HTMLElement>('[data-three-lens]')!.hidden).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2' }));
    expect(document.querySelector<HTMLElement>('[data-three-lens]')!.hidden).toBe(false);
    lens.dispose();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2' }));
    expect(document.querySelector('[data-three-lens]')).toBeNull();
  });

  it('bootstraps a usable surface and permits a fresh bootstrap after disposal', () => {
    const first = bootstrap3Lens({ enabled: true, autoDiscover: false });
    expect(document.querySelector('[data-three-lens]')).toBeTruthy();
    expect(bootstrap3Lens({ enabled: true })).toBe(first);
    first.dispose();
    expect(get3Lens()).toBeNull();
    const next = bootstrap3Lens({ enabled: true, autoDiscover: false });
    expect(next).not.toBe(first);
    expect(document.querySelectorAll('[data-three-lens]')).toHaveLength(1);
  });
});
