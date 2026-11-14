// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createLens, type Lens } from '@3lens/runtime';
import type { LensHud } from '@3lens/ui-core';
import { lensHud } from './hud';

const hud = () => document.querySelectorAll('[data-three-lens="hud"]');
const lenses: Lens[] = [];
const make = () => {
  const lens = createLens({ enabled: true });
  lenses.push(lens);
  return lens;
};
afterEach(() => {
  for (const lens of lenses.splice(0)) lens.dispose();
  document.body.replaceChildren();
});

describe('Svelte mount kit: lensHud action', () => {
  it('mounts on use, reports the handle, ignores no-op updates, remounts on a new lens, and destroys cleanly', () => {
    const node = document.createElement('div');
    document.body.append(node);
    const seen: (LensHud | null)[] = [];
    const first = make();
    const action = lensHud(node, { lens: first, onHud: (value) => seen.push(value) });
    expect(hud()).toHaveLength(1);
    expect(node.children).toHaveLength(0);
    const mounted = seen.at(-1);
    expect(mounted?.isVisible()).toBe(true);
    action.update({ lens: first, onHud: (value) => seen.push(value) });
    expect(hud()).toHaveLength(1);
    expect(seen.at(-1)).toBe(mounted);
    const second = make();
    action.update({ lens: second, onHud: (value) => seen.push(value) });
    expect(hud()).toHaveLength(1);
    expect(seen.at(-1)).not.toBe(mounted);
    action.update({ lens: null });
    expect(hud()).toHaveLength(0);
    action.update({ lens: second });
    expect(hud()).toHaveLength(1);
    action.destroy();
    expect(hud()).toHaveLength(0);
  });
});
