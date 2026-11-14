/**
 * ThreeLens HUD for Vue.
 *
 * Mounts the quiet HUD above the application for a `Lens` you already hold. It is a
 * fixed-position layer on `document.body`; it never touches your component tree.
 *
 * @packageDocumentation
 */

import { defineComponent, isRef, onBeforeUnmount, onMounted, shallowRef, watch, type PropType, type Ref, type ShallowRef } from 'vue';
import type { Lens } from '@3lens/runtime';
import { mountLensHud, type HudOptions, type LensHud } from '@3lens/ui-core';

/** Composable form: returns a ref to the live HUD handle. Accepts a lens or a ref of one. */
export function useThreeLensHud(
  lens: Ref<Lens | null | undefined> | Lens | null | undefined,
  options: HudOptions = {}
): ShallowRef<LensHud | null> {
  const handle = shallowRef<LensHud | null>(null);
  let unmount: (() => void) | undefined;
  const read = () => (isRef(lens) ? lens.value : lens);
  const apply = () => {
    unmount?.();
    unmount = undefined;
    handle.value = null;
    const current = read();
    if (!current) return;
    const mounted = mountLensHud(current, options);
    handle.value = mounted.hud;
    unmount = mounted.unmount;
  };
  onMounted(apply);
  if (isRef(lens)) watch(lens, apply);
  onBeforeUnmount(() => {
    unmount?.();
    unmount = undefined;
    handle.value = null;
  });
  return handle;
}

/**
 * Component form. Renders nothing.
 *
 * @example
 * ```vue
 * <ThreeLensHud :lens="lens" />
 * ```
 */
export const ThreeLensHud = defineComponent({
  name: 'ThreeLensHud',
  props: {
    lens: { type: Object as PropType<Lens | null>, default: null },
    options: { type: Object as PropType<HudOptions>, default: () => ({}) },
  },
  setup(props, { expose }) {
    const handle = shallowRef<LensHud | null>(null);
    let unmount: (() => void) | undefined;
    const apply = () => {
      unmount?.();
      unmount = undefined;
      handle.value = null;
      if (!props.lens) return;
      const mounted = mountLensHud(props.lens, props.options);
      handle.value = mounted.hud;
      unmount = mounted.unmount;
    };
    onMounted(apply);
    watch(() => props.lens, apply);
    onBeforeUnmount(() => unmount?.());
    expose({
      get hud() {
        return handle.value;
      },
    });
    return () => null;
  },
});
