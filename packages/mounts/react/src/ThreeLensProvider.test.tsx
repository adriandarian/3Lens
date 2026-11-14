// @vitest-environment jsdom
import { StrictMode, act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLens, type Lens } from '@3lens/runtime';
import type { Node } from '@3lens/kernel';
import { ThreeLensProvider, ThreeLensPanel, useSelection, useThreeLens, type ThreeLensContextValue } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const hud = () => document.querySelectorAll('[data-three-lens="hud"]');
let root: Root | undefined;
const lenses: Lens[] = [];
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  for (const lens of lenses.splice(0)) lens.dispose();
  document.body.replaceChildren();
});

function seeded() {
  const lens = createLens({ enabled: true });
  lenses.push(lens);
  lens.getGraph().addNode({ context_id: 'main', created_at: 1, modified_at: 1, origin: 'preexisting', active: true, id: 'main:object3d:cube', type: 'object3d', name: 'MainCube', object_type: 'Mesh', visible: true, child_count: 0, frustum_culled: true, render_order: 0, layer_mask: 1 } as Node);
  return lens;
}
function render(node: ReactNode) {
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root!.render(node));
  return container;
}
function Probe({ onValue }: { onValue: (value: ThreeLensContextValue, selection: ReturnType<typeof useSelection>) => void }) {
  const value = useThreeLens();
  const selection = useSelection();
  onValue(value, selection);
  return null;
}

describe('React mount kit: ThreeLensProvider', () => {
  it('mounts one HUD for a provided lens under StrictMode and shares selection and visibility through hooks', () => {
    const lens = seeded();
    let latest: ThreeLensContextValue | undefined;
    let selection: ReturnType<typeof useSelection> | undefined;
    render(createElement(StrictMode, null, createElement(ThreeLensProvider, { lens }, createElement(Probe, { onValue: (v, s) => { latest = v; selection = s; } }))));
    expect(hud()).toHaveLength(1);
    expect(latest!.initialized).toBe(true);
    expect(latest!.lens).toBe(lens);
    expect(latest!.visible).toBe(true);
    act(() => selection!.select('main:object3d:cube'));
    expect(selection!.selectedIds).toEqual(['main:object3d:cube']);
    expect(selection!.isSelected('main:object3d:cube')).toBe(true);
    expect((document.querySelector('.tlh-card') as HTMLElement).hidden).toBe(false);
    act(() => latest!.hide());
    expect(latest!.visible).toBe(false);
    expect((hud()[0] as HTMLElement).hidden).toBe(true);
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true })); });
    expect(latest!.visible).toBe(true);
    act(() => selection!.clearSelection());
    expect(selection!.hasSelection).toBe(false);
  });

  it('creates and disposes its own lens when none is provided, and never disposes a lens it was given', () => {
    let created: Lens | undefined;
    render(createElement(ThreeLensProvider, { onInit: (lens: Lens) => { created = lens; } }));
    expect(created).toBeTruthy();
    expect(hud()).toHaveLength(1);
    const dispose = vi.spyOn(created!, 'dispose');
    act(() => root!.unmount());
    root = undefined;
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(hud()).toHaveLength(0);

    const given = seeded();
    const spy = vi.spyOn(given, 'dispose');
    render(createElement(ThreeLensProvider, { lens: given }));
    act(() => root!.unmount());
    root = undefined;
    expect(spy).not.toHaveBeenCalled();
  });

  it('supports a docked workspace panel with the HUD disabled', () => {
    const lens = seeded();
    const container = render(createElement(ThreeLensProvider, { lens, hud: false }, createElement(ThreeLensPanel, { className: 'dock' })));
    expect(hud()).toHaveLength(0);
    const host = container.querySelector('.dock') as HTMLElement;
    expect(host.querySelector('.tlp-workspace')).toBeTruthy();
    act(() => root!.unmount());
    root = undefined;
    expect(document.querySelector('.tlp-workspace')).toBeNull();
  });

  it('reports selection changes made outside React through onSelectionChange', () => {
    const lens = seeded();
    const seen: string[][] = [];
    render(createElement(ThreeLensProvider, { lens, onSelectionChange: (s: { entity_ids: string[] }) => seen.push(s.entity_ids) }));
    act(() => lens.select('main:object3d:cube'));
    expect(seen.at(-1)).toEqual(['main:object3d:cube']);
  });
});
