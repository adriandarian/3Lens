// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NgZone } from '@angular/core';
import { createLens, type Lens } from '@3lens/runtime';
import type { Node } from '@3lens/kernel';
import { ThreeLensService } from './threelens.service';
import { ThreeLensComponent } from './threelens.component';

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
function zone() {
  const counts = { inside: 0, outside: 0 };
  const fake = {
    run: <T>(fn: () => T) => { counts.inside++; return fn(); },
    runOutsideAngular: <T>(fn: () => T) => { counts.outside++; return fn(); },
  } as unknown as NgZone;
  return { fake, counts };
}

describe('Angular mount kit: ThreeLensService', () => {
  it('mounts the HUD outside the zone, publishes selection and visibility back inside it, and is idempotent', () => {
    const { fake, counts } = zone();
    const service = new ThreeLensService(fake);
    const lens = seeded();
    const selections: (string[] | undefined)[] = [];
    const visible: boolean[] = [];
    service.selection$.subscribe((s) => selections.push(s?.entity_ids));
    service.visible$.subscribe((v) => visible.push(v));
    expect(service.init(lens)).toBe(lens);
    expect(service.init(lens)).toBe(lens);
    expect(hud()).toHaveLength(1);
    expect(counts.outside).toBe(1);
    expect(visible.at(-1)).toBe(true);
    const before = counts.inside;
    service.select('main:object3d:cube');
    expect(selections.at(-1)).toEqual(['main:object3d:cube']);
    expect(counts.inside).toBeGreaterThan(before);
    service.hide();
    expect(visible.at(-1)).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true }));
    expect(visible.at(-1)).toBe(true);
    service.ngOnDestroy();
    expect(hud()).toHaveLength(0);
  });

  it('creates and disposes its own lens, but never disposes one it was given', () => {
    const own = new ThreeLensService(zone().fake, { autoInit: true });
    const created = own.getLens()!;
    expect(created).toBeTruthy();
    const dispose = vi.spyOn(created, 'dispose');
    own.ngOnDestroy();
    expect(dispose).toHaveBeenCalledTimes(1);

    const given = seeded();
    const spy = vi.spyOn(given, 'dispose');
    const service = new ThreeLensService(zone().fake, { lens: given });
    service.init();
    service.ngOnDestroy();
    expect(spy).not.toHaveBeenCalled();
  });

  it('docks the workspace through the panel component without a HUD, and unmounts on destroy', () => {
    const lens = seeded();
    const service = new ThreeLensService(zone().fake, { lens, hud: false });
    const component = new ThreeLensComponent(service);
    const container = document.createElement('div');
    document.body.append(container);
    component.containerRef = { nativeElement: container } as never;
    const emitted: string[][] = [];
    component.selectionChange.subscribe((ids: string[]) => emitted.push(ids));
    component.ngAfterViewInit();
    expect(hud()).toHaveLength(0);
    expect(container.querySelector('.tlp-workspace')).toBeTruthy();
    lens.select('main:object3d:cube');
    expect(emitted.at(-1)).toEqual(['main:object3d:cube']);
    component.ngOnDestroy();
    expect(container.querySelector('.tlp-workspace')).toBeNull();
    service.ngOnDestroy();
  });
});
