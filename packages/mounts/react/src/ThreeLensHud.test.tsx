// @vitest-environment jsdom
import { StrictMode, act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { createLens, type Lens } from '@3lens/runtime';
import { ThreeLensHud } from './ThreeLensHud';

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

function setup() {
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  const lens = createLens({ enabled: true });
  lenses.push(lens);
  return { container, lens };
}

describe('React mount kit: ThreeLensHud', () => {
  it('mounts one HUD per lens under StrictMode, leaves the React tree untouched, and removes it on unmount', () => {
    const { container, lens } = setup();
    act(() => root!.render(createElement(StrictMode, null, createElement('main', { id: 'app' }, 'app'), createElement(ThreeLensHud, { lens }))));
    expect(hud()).toHaveLength(1);
    expect(container.innerHTML).toBe('<main id="app">app</main>');
    expect(hud()[0].parentElement).toBe(document.body);
    act(() => root!.unmount());
    root = undefined;
    expect(hud()).toHaveLength(0);
  });

  it('renders nothing until a lens exists, then remounts when the lens changes', () => {
    const { lens } = setup();
    act(() => root!.render(createElement(ThreeLensHud, { lens: null })));
    expect(hud()).toHaveLength(0);
    act(() => root!.render(createElement(ThreeLensHud, { lens })));
    expect(hud()).toHaveLength(1);
    const other = createLens({ enabled: true });
    lenses.push(other);
    act(() => root!.render(createElement(ThreeLensHud, { lens: other })));
    expect(hud()).toHaveLength(1);
  });

  it('F2 toggles visibility through the mounted handle without requiring a lens UI adapter', () => {
    const { lens } = setup();
    act(() => root!.render(createElement(ThreeLensHud, { lens })));
    const element = () => hud()[0] as HTMLElement;
    expect(element().hidden).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true }));
    expect(element().hidden).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true }));
    expect(element().hidden).toBe(false);
  });
});
