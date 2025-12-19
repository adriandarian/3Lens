/**
 * Injected Script
 * 
 * Runs in the page context to detect three.js and set up automatic instrumentation.
 * This enables "no-setup mode" where the extension works without any SDK integration.
 */

const SOURCE_PROBE = '3lens-probe';
const SOURCE_DEVTOOL = '3lens-devtool';

// Check if three.js is present
function detectThreeJS(): boolean {
  // Check for THREE global
  if (typeof (window as any).THREE !== 'undefined') {
    return true;
  }

  // Check for WebGL contexts that might be three.js
  const canvases = document.querySelectorAll('canvas');
  for (const canvas of canvases) {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      // Has WebGL - might be three.js
      return true;
    }
  }

  return false;
}

// Monkey-patch THREE.WebGLRenderer to intercept creation
function patchThreeJS(): void {
  const THREE = (window as any).THREE;
  if (!THREE?.WebGLRenderer) return;

  const OriginalRenderer = THREE.WebGLRenderer;

  THREE.WebGLRenderer = function (parameters?: any) {
    const renderer = new OriginalRenderer(parameters);
    
    // Notify extension that we found a renderer
    notifyRendererFound(renderer);
    
    return renderer;
  };

  // Copy prototype
  THREE.WebGLRenderer.prototype = OriginalRenderer.prototype;

  console.log('[3Lens] three.js patched for auto-detection');
}

// Notify the extension about a detected renderer
function notifyRendererFound(renderer: any): void {
  // Create a minimal probe for auto-detection mode
  const frameStats = {
    frame: 0,
    timestamp: 0,
    cpuTimeMs: 0,
    triangles: 0,
    drawCalls: 0,
    points: 0,
    lines: 0,
    objectsVisible: 0,
    objectsTotal: 0,
    materialsUsed: 0,
    backend: 'webgl' as const,
  };

  // Hook into render
  const originalRender = renderer.render.bind(renderer);
  let lastTime = performance.now();

  renderer.render = function (scene: any, camera: any) {
    const startTime = performance.now();
    const result = originalRender(scene, camera);
    const endTime = performance.now();

    frameStats.frame++;
    frameStats.timestamp = endTime;
    frameStats.cpuTimeMs = endTime - startTime;

    if (renderer.info) {
      frameStats.triangles = renderer.info.render?.triangles ?? 0;
      frameStats.drawCalls = renderer.info.render?.calls ?? 0;
      frameStats.points = renderer.info.render?.points ?? 0;
      frameStats.lines = renderer.info.render?.lines ?? 0;
    }

    // Send stats periodically (every ~100ms)
    if (endTime - lastTime > 100) {
      lastTime = endTime;
      sendMessage({
        type: 'frame-stats',
        timestamp: endTime,
        stats: { ...frameStats },
      });
    }

    return result;
  };

  // Send initial handshake response
  sendMessage({
    type: 'handshake-response',
    timestamp: performance.now(),
    requestId: '',
    appId: 'auto-detect',
    appName: document.title || 'Unknown',
    threeVersion: (window as any).THREE?.REVISION || 'unknown',
    probeVersion: 'injected-0.1.0',
    backend: 'webgl',
    capabilities: ['frame-stats'],
  });
}

// Send message to content script
function sendMessage(payload: unknown): void {
  window.postMessage(
    {
      source: SOURCE_PROBE,
      version: '1.0.0',
      payload,
    },
    '*'
  );
}

// Listen for messages from DevTools
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data || event.data.source !== SOURCE_DEVTOOL) return;

  const { payload } = event.data;

  if (payload.type === 'handshake-request') {
    // DevTools is asking for connection - try to detect three.js
    if (detectThreeJS()) {
      const THREE = (window as any).THREE;
      sendMessage({
        type: 'handshake-response',
        timestamp: performance.now(),
        requestId: payload.id || '',
        appId: 'auto-detect',
        appName: document.title || 'Unknown',
        threeVersion: THREE?.REVISION || 'unknown',
        probeVersion: 'injected-0.1.0',
        backend: 'webgl',
        capabilities: ['frame-stats'],
      });
    }
  }
});

// Try to patch immediately if THREE is already loaded
if ((window as any).THREE) {
  patchThreeJS();
} else {
  // Otherwise, watch for it
  Object.defineProperty(window, 'THREE', {
    configurable: true,
    set(value) {
      Object.defineProperty(window, 'THREE', {
        value,
        writable: true,
        configurable: true,
      });
      setTimeout(patchThreeJS, 0);
    },
    get() {
      return undefined;
    },
  });
}

console.log('[3Lens] Injected script loaded, detecting three.js...');

