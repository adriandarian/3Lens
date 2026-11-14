// @vitest-environment jsdom
import { get } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLens, type Lens } from '@3lens/runtime';
import type { Node } from '@3lens/kernel';
import { createThreeLensStore, getThreeLensContext, threeLens, threeLensStore, type ThreeLensStore } from './index';

const hud = () => document.querySelectorAll('[data-three-lens="hud"]');
const lenses: Lens[] = [];
afterEach(() => {
  for (const lens of lenses.splice(0)) lens.dispose();
  document.body.replaceChildren();
});
function seeded() {
  const lens = createLens({ enabled: true });
  lenses.push(lens);
  lens.getGraph().addNode({ context_id: 'main', created_at: 1, modified_at: 1, origin: 'preexisting', active: true, id: 'main:object3d:cube', type: 'object3d', name: 'MainCube', object_type: 'Mesh', visible: true, child_count: 0, frustum_culled: true, render_order: 0, layer_mask: 1 } as Node);
  return lens;
}

describe('Svelte mount kit: store', () => {
  it('mounts one HUD and exposes selection and visibility as stores', () => {
    const lens = seeded();
    const store = createThreeLensStore({ lens });
    expect(hud()).toHaveLength(1);
    expect(getThreeLensContext()).toBe(store);
    expect(get(threeLensStore)).toBe(store);
    const seen: unknown[] = [];
    const off = store.selection.subscribe((value) => seen.push(value?.entity_ids));
    store.select('main:object3d:cube');
    expect(get(store.selection)?.entity_ids).toEqual(['main:object3d:cube']);
    expect(seen.at(-1)).toEqual(['main:object3d:cube']);
    off();
    expect(get(store.visible)).toBe(true);
    store.hide();
    expect(get(store.visible)).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true }));
    expect(get(store.visible)).toBe(true);
    store.destroy();
    expect(hud()).toHaveLength(0);
    expect(getThreeLensContext()).toBeNull();
    expect(get(threeLensStore)).toBeNull();
  });

  it('owns a lens it created and never disposes one it was given', () => {
    let created: Lens | undefined;
    const owned = createThreeLensStore({ onInit: (lens) => { created = lens; } });
    const spy = vi.spyOn(created!, 'dispose');
    owned.destroy();
    expect(spy).toHaveBeenCalledTimes(1);
    const given = seeded();
    const keep = vi.spyOn(given, 'dispose');
    createThreeLensStore({ lens: given }).destroy();
    expect(keep).not.toHaveBeenCalled();
  });
});

describe('Svelte mount kit: threeLens action', () => {
  it('docks the workspace into the node, keeps it across no-op updates, and cleans up', () => {
    const lens = seeded();
    const node = document.createElement('div');
    document.body.append(node);
    let used: ThreeLensStore | undefined;
    const action = threeLens(node, { lens, onStore: (store) => { used = store; } });
    expect(hud()).toHaveLength(0);
    const workspace = node.querySelector('.tlp-workspace');
    expect(workspace).toBeTruthy();
    action.update!({ lens, onStore: () => undefined });
    expect(node.querySelector('.tlp-workspace')).toBe(workspace);
    expect(used).toBeTruthy();
    action.destroy!();
    expect(node.querySelector('.tlp-workspace')).toBeNull();
  });
});
