/**
 * ThreeLens Vue Panel Component
 *
 * Embeds the full workspace (inspect, performance, memory, changes, shaders) in a
 * container you own. Requires `threeLensPlugin`.
 *
 * @packageDocumentation
 */

import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';
import { useThreeLens } from './composables/useThreeLens';

export const ThreeLensPanel = defineComponent({
  name: 'ThreeLensPanel',
  props: { readonly: { type: Boolean, default: false } },
  setup(props) {
    const { controller } = useThreeLens();
    const container = ref<HTMLElement | null>(null);
    let unmount: (() => void) | undefined;
    onMounted(() => {
      if (container.value) unmount = controller.mountWorkspace(container.value, { readonly: props.readonly });
    });
    onBeforeUnmount(() => unmount?.());
    return () => h('div', { ref: container, style: 'width:100%;height:100%;position:relative' });
  },
});
