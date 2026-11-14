// @vitest-environment jsdom
import { createApp, defineComponent, h, nextTick, type App } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLens, type Lens } from '@3lens/runtime';
import type { Node } from '@3lens/kernel';
import { ThreeLensPanel, threeLensPlugin, useSelection, useThreeLens, type ThreeLensContext } from './index';

const hud = () => document.querySelectorAll('[data-three-lens="hud"]');
let app: App | undefined;
const lenses: Lens[] = [];
afterEach(() => {
  app?.unmount();
  app = undefined;
  for (const lens of lenses.splice(0)) lens.dispose();
  document.body.replaceChildren();
});

function seeded() {
  const lens = createLens({ enabled: true });
  lenses.push(lens);
  lens.getGraph().addNode({ context_id: 'main', created_at: 1, modified_at: 1, origin: 'preexisting', active: true, id: 'main:object3d:cube', type: 'object3d', name: 'MainCube', object_type: 'Mesh', visible: true, child_count: 0, frustum_culled: true, render_order: 0, layer_mask: 1 } as Node);
  return lens;
}
function mount(root: ReturnType<typeof defineComponent>, options: Parameters<typeof threeLensPlugin.install>[1]) {
  const el = document.createElement('div');
  document.body.append(el);
  app = createApp(root);
  app.use(threeLensPlugin as never, options);
  app.mount(el);
  return el;
}

describe('Vue mount kit: threeLensPlugin', () => {
  it('mounts one HUD and shares selection and visibility with composables', async () => {
    const lens = seeded();
    let ctx: ThreeLensContext | undefined;
    let sel: ReturnType<typeof useSelection> | undefined;
    mount(defineComponent({ setup() { ctx = useThreeLens(); sel = useSelection(); return () => h('main'); } }), { lens });
    expect(hud()).toHaveLength(1);
    expect(ctx!.lens).toBe(lens);
    expect(ctx!.visible.value).toBe(true);
    sel!.select('main:object3d:cube');
    await nextTick();
    expect(sel!.selectedIds.value).toEqual(['main:object3d:cube']);
    expect(sel!.isSelected('main:object3d:cube')).toBe(true);
    ctx!.hide();
    await nextTick();
    expect(ctx!.visible.value).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true }));
    await nextTick();
    expect(ctx!.visible.value).toBe(true);
    sel!.clearSelection();
    await nextTick();
    expect(sel!.hasSelection.value).toBe(false);
  });

  it('creates and disposes its own lens, but never disposes a lens it was given', () => {
    let created: Lens | undefined;
    mount(defineComponent({ render: () => h('main') }), { onInit: (lens: Lens) => { created = lens; } });
    expect(hud()).toHaveLength(1);
    const dispose = vi.spyOn(created!, 'dispose');
    app!.unmount();
    app = undefined;
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(hud()).toHaveLength(0);

    const given = seeded();
    const spy = vi.spyOn(given, 'dispose');
    mount(defineComponent({ render: () => h('main') }), { lens: given });
    app!.unmount();
    app = undefined;
    expect(spy).not.toHaveBeenCalled();
  });

  it('supports a docked workspace panel with the HUD disabled', async () => {
    const lens = seeded();
    const el = mount(defineComponent({ render: () => h(ThreeLensPanel) }), { lens, hud: false });
    await nextTick();
    expect(hud()).toHaveLength(0);
    expect(el.querySelector('.tlp-workspace')).toBeTruthy();
    app!.unmount();
    app = undefined;
    expect(document.querySelector('.tlp-workspace')).toBeNull();
  });

  it('throws a clear error when a composable is used without the plugin', () => {
    const el = document.createElement('div');
    app = createApp(defineComponent({ setup() { useThreeLens(); return () => h('main'); } }));
    app.config.warnHandler = () => undefined;
    expect(() => app!.mount(el)).toThrow(/threeLensPlugin/);
    app = undefined;
  });
});
