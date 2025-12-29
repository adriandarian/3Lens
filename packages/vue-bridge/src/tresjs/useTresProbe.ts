import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { useThreeLensOptional } from '../composables/useThreeLens';
import type * as THREE from 'three';

/**
 * Options for TresJS probe connection
 */
export interface TresProbeOptions {
  /**
   * Whether to auto-connect when TresJS context is available
   * @default true
   */
  autoConnect?: boolean;
}

/**
 * Return type for useTresProbe
 */
export interface UseTresProbeReturn {
  /**
   * Whether the probe is connected to TresJS
   */
  isConnected: Ref<boolean>;

  /**
   * Connect to TresJS renderer and scene
   */
  connect: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => void;

  /**
   * Disconnect from TresJS
   */
  disconnect: () => void;
}

/**
 * Composable to connect 3Lens to TresJS
 *
 * This composable integrates with TresJS's context to automatically
 * observe the renderer and scene.
 *
 * @example
 * ```vue
 * <script setup>
 * import { TresCanvas } from '@tresjs/core';
 * import { useTresProbe } from '@3lens/vue-bridge';
 *
 * const { isConnected } = useTresProbe();
 * </script>
 *
 * <template>
 *   <TresCanvas>
 *     <TresProbeConnector />
 *     <TresMesh>
 *       <TresBoxGeometry />
 *       <TresMeshStandardMaterial />
 *     </TresMesh>
 *   </TresCanvas>
 * </template>
 * ```
 */
export function useTresProbe(options: TresProbeOptions = {}): UseTresProbeReturn {
  const { autoConnect = true } = options;
  const context = useThreeLensOptional();
  const isConnected = ref(false);

  let connectedRenderer: THREE.WebGLRenderer | null = null;

  const connect = (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) => {
    if (!context?.probe.value || isConnected.value) return;

    const probe = context.probe.value;

    // Observe renderer and scene
    probe.observeRenderer(renderer);
    probe.observeScene(scene);

    // Initialize helpers if available
    try {
      if (camera && renderer.domElement) {
        probe.initializeTransformGizmo?.(scene, camera, renderer.domElement, {
          // Minimal THREE namespace for transform controls
          Object3D: scene.constructor,
        } as any);
        probe.initializeCameraController?.(camera, {} as any);
      }
    } catch {
      // Helpers not critical
    }

    connectedRenderer = renderer;
    isConnected.value = true;

    if (context.probe.value && (context.probe.value as any).config?.debug) {
      console.log('[3Lens] Connected to TresJS');
    }
  };

  const disconnect = () => {
    connectedRenderer = null;
    isConnected.value = false;
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    connect,
    disconnect,
  };
}

/**
 * Creates a TresJS connector composable factory
 *
 * Use this when you have access to TresJS's useTres hook.
 *
 * @example
 * ```typescript
 * import { useTres } from '@tresjs/core';
 * import { createTresConnector } from '@3lens/vue-bridge';
 *
 * const useTresConnect = createTresConnector(useTres);
 *
 * // In a component inside TresCanvas:
 * useTresConnect();
 * ```
 */
export function createTresConnector(
  useTres: () => {
    renderer: { value: THREE.WebGLRenderer };
    scene: THREE.Scene;
    camera: { value: THREE.Camera };
  }
): () => UseTresProbeReturn {
  return function useTresConnect(): UseTresProbeReturn {
    const tresProbe = useTresProbe();
    const context = useThreeLensOptional();

    onMounted(() => {
      if (!context?.probe.value) return;

      try {
        const tres = useTres();
        if (tres.renderer?.value && tres.scene && tres.camera?.value) {
          tresProbe.connect(tres.renderer.value, tres.scene, tres.camera.value);
        }
      } catch (e) {
        // useTres not available or not inside TresCanvas
        if (context.probe.value && (context.probe.value as any).config?.debug) {
          console.log('[3Lens] TresJS context not available:', e);
        }
      }
    });

    return tresProbe;
  };
}

