import { ref, shallowRef, computed, type App } from 'vue';
import type * as THREE from 'three';
import {
  createProbe,
  type DevtoolProbe,
  type FrameStats,
  type SceneSnapshot,
} from '@3lens/core';
import { ThreeLensKey, type ThreeLensPluginConfig, type ThreeLensContext } from './types';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ThreeLensPluginConfig = {
  showOverlay: true,
  toggleShortcut: 'ctrl+shift+d',
  debug: false,
};

/**
 * Create the 3Lens context
 */
function createThreeLensContext(config: ThreeLensPluginConfig): ThreeLensContext {
  const probe = shallowRef<DevtoolProbe | null>(null);
  const isReady = ref(false);
  const frameStats = shallowRef<FrameStats | null>(null);
  const snapshot = shallowRef<SceneSnapshot | null>(null);
  const selectedNode = shallowRef<THREE.Object3D | null>(null);
  const isOverlayVisible = ref(config.showOverlay ?? true);

  const overlay: { show: () => void; hide: () => void; toggle: () => void } | null = null;
  const unsubscribes: (() => void)[] = [];

  // Create probe
  const probeInstance = createProbe({
    appName: config.appName ?? 'Vue Three.js App',
    debug: config.debug,
  });
  probe.value = probeInstance;

  // Subscribe to probe events
  unsubscribes.push(
    probeInstance.onFrameStats((stats) => {
      frameStats.value = stats;
    })
  );

  unsubscribes.push(
    probeInstance.onSnapshot((snap) => {
      snapshot.value = snap;
      isReady.value = true;
    })
  );

  unsubscribes.push(
    probeInstance.onSelectionChanged((node) => {
      selectedNode.value = node;
    })
  );

  // Computed metrics
  const fps = computed(() => frameStats.value?.performance?.fps ?? 0);
  const drawCalls = computed(() => frameStats.value?.drawCalls ?? 0);
  const triangles = computed(() => frameStats.value?.triangles ?? 0);
  const frameTime = computed(() => frameStats.value?.cpuTimeMs ?? 0);
  const gpuMemory = computed(() => frameStats.value?.memory?.totalGpuMemory ?? 0);

  // Actions
  const selectObject = (uuid: string) => {
    const obj = probeInstance.findObjectByDebugIdOrUuid(uuid);
    if (obj) {
      probeInstance.selectObject(obj);
    }
  };

  const clearSelection = () => {
    probeInstance.selectObject(null);
  };

  const showOverlay = () => {
    overlay?.show();
    isOverlayVisible.value = true;
  };

  const hideOverlay = () => {
    overlay?.hide();
    isOverlayVisible.value = false;
  };

  const toggleOverlay = () => {
    if (isOverlayVisible.value) {
      hideOverlay();
    } else {
      showOverlay();
    }
  };

  // Set up keyboard shortcut
  const shortcut = config.toggleShortcut ?? 'ctrl+shift+d';
  const handleKeyDown = (e: KeyboardEvent) => {
    const keys = shortcut.toLowerCase().split('+');
    const needsCtrl = keys.includes('ctrl');
    const needsShift = keys.includes('shift');
    const needsAlt = keys.includes('alt');
    const key = keys.find((k) => !['ctrl', 'shift', 'alt'].includes(k));

    if (
      e.ctrlKey === needsCtrl &&
      e.shiftKey === needsShift &&
      e.altKey === needsAlt &&
      e.key.toLowerCase() === key
    ) {
      e.preventDefault();
      toggleOverlay();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }

  return {
    probe,
    isReady,
    frameStats,
    snapshot,
    selectedNode,
    fps,
    drawCalls,
    triangles,
    frameTime,
    gpuMemory,
    isOverlayVisible,
    selectObject,
    clearSelection,
    toggleOverlay,
    showOverlay,
    hideOverlay,
  };
}

/**
 * Vue plugin for 3Lens
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue';
 * import { ThreeLensPlugin } from '@3lens/vue-bridge';
 *
 * const app = createApp(App);
 * app.use(ThreeLensPlugin, { appName: 'My Vue App' });
 * app.mount('#app');
 * ```
 */
export const ThreeLensPlugin = {
  install(app: App, config: ThreeLensPluginConfig = {}) {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const context = createThreeLensContext(mergedConfig);

    // Provide the context to all components
    app.provide(ThreeLensKey, context);

    // Make probe available globally (optional)
    app.config.globalProperties.$threeLens = context;

    // Clean up on app unmount
    if (typeof window !== 'undefined') {
      const originalUnmount = app.unmount.bind(app);
      app.unmount = () => {
        context.probe.value?.dispose();
        originalUnmount();
      };
    }
  },
};

/**
 * Create a standalone 3Lens context (for use without plugin)
 *
 * @example
 * ```typescript
 * import { provide } from 'vue';
 * import { createThreeLens, ThreeLensKey } from '@3lens/vue-bridge';
 *
 * // In a parent component
 * const threeLens = createThreeLens({ appName: 'My App' });
 * provide(ThreeLensKey, threeLens);
 * ```
 */
export function createThreeLens(config: ThreeLensPluginConfig = {}): ThreeLensContext {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  return createThreeLensContext(mergedConfig);
}

