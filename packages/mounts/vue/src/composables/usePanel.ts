/**
 * usePanel Composable
 *
 * @packageDocumentation
 */

import { onMounted, onUnmounted, type Ref, watch } from 'vue';
import type { Panel } from '@3lens/ui-core';
import { useThreeLens } from './useThreeLens';

/**
 * Composable for registering custom panels
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePanel } from '@3lens/mount-vue';
 *
 * const panel = {
 *   id: 'my-panel',
 *   name: 'My Panel',
 *   render(container, client) {
 *     container.innerHTML = '<div>Custom Panel Content</div>';
 *   },
 * };
 *
 * usePanel(panel);
 * </script>
 * ```
 */
export function usePanel(panel: Panel | Ref<Panel>): void {
  const { registerPanel, unregisterPanel, initialized } = useThreeLens();

  let registered = false;

  const register = () => {
    if (registered) return;

    const panelValue = 'value' in panel ? panel.value : panel;
    registerPanel(panelValue);
    registered = true;
  };

  const unregister = () => {
    if (!registered) return;

    const panelValue = 'value' in panel ? panel.value : panel;
    unregisterPanel(panelValue.id);
    registered = false;
  };

  // Register when initialized
  watch(
    initialized,
    (isInit) => {
      if (isInit) {
        register();
      }
    },
    { immediate: true }
  );

  // If panel is reactive, re-register on change
  if ('value' in panel) {
    watch(panel, (newPanel, oldPanel) => {
      if (oldPanel) {
        unregisterPanel(oldPanel.id);
      }
      if (newPanel) {
        registerPanel(newPanel);
      }
    });
  }

  onMounted(() => {
    if (initialized.value) {
      register();
    }
  });

  onUnmounted(() => {
    unregister();
  });
}
