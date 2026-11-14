// @vitest-environment jsdom
import { createApp, defineComponent, h, nextTick, shallowRef, type App } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { createLens, type Lens } from '@3lens/runtime';
import { ThreeLensHud, useThreeLensHud } from './hud';

const hud = () => document.querySelectorAll('[data-three-lens="hud"]');
let app: App | undefined;
const lenses: Lens[] = [];
const make = () => {
  const lens = createLens({ enabled: true });
  lenses.push(lens);
  return lens;
};
afterEach(() => {
  app?.unmount();
  app = undefined;
  for (const lens of lenses.splice(0)) lens.dispose();
  document.body.replaceChildren();
});

describe('Vue mount kit: ThreeLensHud', () => {
  it('mounts one HUD from the component, leaves the app DOM alone, and removes it on unmount', async () => {
    const lens = make();
    const el = document.createElement('div');
    document.body.append(el);
    app = createApp({ render: () => h('main', { id: 'app' }, [h(ThreeLensHud, { lens })]) });
    app.mount(el);
    await nextTick();
    expect(hud()).toHaveLength(1);
    expect(hud()[0].parentElement).toBe(document.body);
    expect(el.innerHTML).toContain('<main id="app">');
    expect(el.querySelector('[data-three-lens]')).toBeNull();
    app.unmount();
    app = undefined;
    expect(hud()).toHaveLength(0);
  });

  it('composable follows a lens ref: mounts, remounts on change, unmounts when cleared', async () => {
    const first = make();
    const second = make();
    const lens = shallowRef<Lens | null>(null);
    let handle: ReturnType<typeof useThreeLensHud> | undefined;
    const Host = defineComponent({
      setup() {
        handle = useThreeLensHud(lens);
        return () => null;
      },
    });
    const el = document.createElement('div');
    document.body.append(el);
    app = createApp(Host);
    app.mount(el);
    await nextTick();
    expect(hud()).toHaveLength(0);
    lens.value = first;
    await nextTick();
    expect(hud()).toHaveLength(1);
    expect(handle!.value?.isVisible()).toBe(true);
    lens.value = second;
    await nextTick();
    expect(hud()).toHaveLength(1);
    lens.value = null;
    await nextTick();
    expect(hud()).toHaveLength(0);
  });

  it('F2 toggles visibility through the mounted handle', async () => {
    const lens = make();
    const el = document.createElement('div');
    document.body.append(el);
    app = createApp({ render: () => h(ThreeLensHud, { lens }) });
    app.mount(el);
    await nextTick();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true }));
    expect((hud()[0] as HTMLElement).hidden).toBe(true);
  });
});
