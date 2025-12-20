import type * as THREE from 'three';

import { createPostMessageTransport, createProbe } from '@3lens/core';
import type { DevtoolProbe } from '@3lens/core';

/**
 * Injected Script
 *
 * Runs in the page context to auto-attach the real @3lens/core probe to
 * any detected three.js renderer. This powers the "no-setup" extension mode
 * where users can open DevTools and immediately inspect scenes + live stats.
 */

type ThreeModule = typeof import('three');

let probe: DevtoolProbe | null = null;
let patched = false;
let threeRef: ThreeModule | null = null;

const wrappedRenderers = new WeakSet<THREE.WebGLRenderer>();
const observedScenes = new WeakSet<THREE.Scene>();

bootstrapProbe();

function bootstrapProbe(three?: ThreeModule): DevtoolProbe {
  if (!probe) {
    probe = createProbe({
      appName: document.title || 'Unknown',
      sampling: {
        snapshots: 'on-change',
        frameStats: 'every-frame',
        gpuTiming: true,
      },
    });

    const transport = createPostMessageTransport();
    probe.connect(transport);
  }

  if (three && !threeRef) {
    threeRef = three;
    probe.setThreeReference(three);
  }

  return probe;
}

function attachRenderer(renderer: THREE.WebGLRenderer, three: ThreeModule): void {
  const p = bootstrapProbe(three);

  if (!wrappedRenderers.has(renderer)) {
    const originalRender = renderer.render.bind(renderer);

    renderer.render = function (scene: THREE.Scene, camera: THREE.Camera): void {
      if (!observedScenes.has(scene)) {
        observedScenes.add(scene);
        p.observeScene(scene);
        // Send an immediate snapshot so the UI receives the hierarchy
        p.takeSnapshot();
      }

      p.updateSelectionHighlight();
      originalRender(scene, camera);
    };

    wrappedRenderers.add(renderer);
  }

  p.observeRenderer(renderer);
}

function patchThreeJS(three: ThreeModule): void {
  if (patched) return;
  if (!three.WebGLRenderer) return;

  patched = true;
  const OriginalRenderer = three.WebGLRenderer;

  three.WebGLRenderer = function WebGLRendererPatched(parameters?: unknown): THREE.WebGLRenderer {
    const renderer = new OriginalRenderer(parameters);
    attachRenderer(renderer, three);
    return renderer;
  } as typeof three.WebGLRenderer;

  three.WebGLRenderer.prototype = OriginalRenderer.prototype;

  bootstrapProbe(three);
  // eslint-disable-next-line no-console
  console.log('[3Lens] Auto-instrumenting three.js renderer');
}

// Try to patch immediately if THREE is already loaded
if ((window as unknown as { THREE?: ThreeModule }).THREE) {
  patchThreeJS((window as unknown as { THREE: ThreeModule }).THREE);
} else {
  // Otherwise, watch for it
  Object.defineProperty(window, 'THREE', {
    configurable: true,
    set(value: ThreeModule) {
      Object.defineProperty(window, 'THREE', {
        value,
        writable: true,
        configurable: true,
      });
      setTimeout(() => patchThreeJS(value), 0);
    },
    get() {
      return undefined;
    },
  });
}

// Fallback detection in case THREE loads without using the global setter
document.addEventListener('DOMContentLoaded', () => {
  if ((window as unknown as { THREE?: ThreeModule }).THREE && !patched) {
    patchThreeJS((window as unknown as { THREE: ThreeModule }).THREE);
  }
});

// Keep DevTools transport alive even before a renderer appears
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data || event.data.source !== '3lens-devtool') return;

  // Ensure the probe exists so handshake requests are answered
  bootstrapProbe(threeRef ?? (window as unknown as { THREE?: ThreeModule }).THREE ?? undefined);
});

// eslint-disable-next-line no-console
console.log('[3Lens] Injected script ready for auto-instrumentation');
