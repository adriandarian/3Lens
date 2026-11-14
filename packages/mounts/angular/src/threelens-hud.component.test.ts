// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import type { NgZone } from '@angular/core';
import { createLens, type Lens } from '@3lens/runtime';
import { ThreeLensHudComponent } from './threelens-hud.component';

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

describe('Angular mount kit: ThreeLensHudComponent', () => {
  it('mounts outside the Angular zone, remounts on lens change, and cleans up on destroy', () => {
    let outside = 0;
    const zone = { runOutsideAngular: <T>(fn: () => T) => { outside++; return fn(); } } as unknown as NgZone;
    const component = new ThreeLensHudComponent(zone);
    component.ngOnChanges();
    expect(hud()).toHaveLength(0);
    component.lens = make();
    component.ngOnChanges();
    expect(hud()).toHaveLength(1);
    expect(outside).toBe(1);
    expect(component.hud?.isVisible()).toBe(true);
    component.lens = make();
    component.ngOnChanges();
    expect(hud()).toHaveLength(1);
    expect(outside).toBe(2);
    component.lens = null;
    component.ngOnChanges();
    expect(hud()).toHaveLength(0);
    expect(component.hud).toBeNull();
    component.lens = make();
    component.ngOnChanges();
    component.ngOnDestroy();
    expect(hud()).toHaveLength(0);
  });
});
