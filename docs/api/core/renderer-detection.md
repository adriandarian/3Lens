# Renderer Auto-Detection

3Lens automatically detects whether you're using a WebGL or WebGPU renderer and creates the appropriate adapter. This guide explains how detection works and how to handle different renderer types.

## Overview

When you call `probe.observeRenderer(renderer)`, 3Lens automatically:

1. Detects the renderer type (WebGL or WebGPU)
2. Creates the appropriate adapter
3. Configures GPU timing based on availability
4. Starts collecting metrics

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({ appName: 'My App' });

// Automatic detection - works for both renderer types
probe.observeRenderer(renderer);
```

## Detection Mechanism

### WebGPU Detection

WebGPU renderers are identified by the `isWebGPURenderer` property:

```typescript
function isWebGPURenderer(renderer: unknown): renderer is WebGPURenderer {
  return (
    typeof renderer === 'object' &&
    renderer !== null &&
    'isWebGPURenderer' in renderer &&
    (renderer as WebGPURenderer).isWebGPURenderer === true
  );
}
```

This follows the Three.js convention where `WebGPURenderer` has:

```typescript
interface WebGPURenderer {
  readonly isWebGPURenderer: true;
  // ... other properties
}
```

### WebGL Detection

If the renderer is not a WebGPU renderer, it's assumed to be a WebGL renderer. WebGL renderers include:

- `THREE.WebGLRenderer`
- `THREE.WebGL1Renderer` (legacy)
- Custom renderers extending `WebGLRenderer`

```typescript
function isWebGLRenderer(renderer: unknown): renderer is THREE.WebGLRenderer {
  return (
    typeof renderer === 'object' &&
    renderer !== null &&
    !isWebGPURenderer(renderer) &&
    'render' in renderer &&
    'getContext' in renderer
  );
}
```

## API Reference

### isWebGPURenderer

Type guard for WebGPU renderer detection.

```typescript
function isWebGPURenderer(renderer: unknown): renderer is WebGPURenderer
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `renderer` | `unknown` | Any renderer object to check |

**Returns:** `boolean` - `true` if renderer is a WebGPURenderer

**Example:**

```typescript
import { isWebGPURenderer, createWebGLAdapter, createWebGPUAdapter } from '@3lens/core';

function createAdapter(renderer: THREE.Renderer) {
  if (isWebGPURenderer(renderer)) {
    return createWebGPUAdapter(renderer);
  } else {
    return createWebGLAdapter(renderer as THREE.WebGLRenderer);
  }
}
```

### observeRenderer

The main method that performs automatic detection.

```typescript
probe.observeRenderer(renderer: THREE.Renderer): void
```

**Detection Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ observeRenderer(renderer)                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   renderer ──────┬──────────────────────────────────────>   │
│                  │                                          │
│                  ▼                                          │
│         isWebGPURenderer?                                   │
│                  │                                          │
│         ┌───────┴───────┐                                   │
│         ▼               ▼                                   │
│        Yes              No                                  │
│         │               │                                   │
│         ▼               ▼                                   │
│  createWebGPUAdapter  createWebGLAdapter                    │
│         │               │                                   │
│         └───────┬───────┘                                   │
│                 ▼                                           │
│         setRendererAdapter(adapter)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Automatic Detection (Recommended)

```typescript
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { createProbe } from '@3lens/core';

const probe = createProbe({ appName: 'My App' });

// Works with WebGL
const webglRenderer = new THREE.WebGLRenderer();
probe.observeRenderer(webglRenderer);

// Also works with WebGPU
const webgpuRenderer = new WebGPURenderer();
await webgpuRenderer.init();
probe.observeRenderer(webgpuRenderer);
```

### Manual Detection and Adapter Creation

For advanced use cases where you need explicit control:

```typescript
import { 
  isWebGPURenderer, 
  createWebGLAdapter, 
  createWebGPUAdapter 
} from '@3lens/core';

function setupProbe(renderer: THREE.Renderer) {
  const probe = createProbe({ appName: 'My App' });
  
  if (isWebGPURenderer(renderer)) {
    // Custom WebGPU adapter options
    const adapter = createWebGPUAdapter(renderer);
    probe.setRendererAdapter(adapter);
    
    console.log('Using WebGPU adapter');
  } else {
    // Custom WebGL adapter options  
    const adapter = createWebGLAdapter(renderer as THREE.WebGLRenderer, {
      gpuTiming: true,
      resourceScanInterval: 1000,
    });
    probe.setRendererAdapter(adapter);
    
    console.log('Using WebGL adapter');
  }
  
  return probe;
}
```

### Runtime Renderer Switching

Handle dynamic renderer changes:

```typescript
class AdaptiveRenderer {
  private probe: DevtoolProbe;
  private currentRenderer: THREE.Renderer | null = null;
  
  constructor() {
    this.probe = createProbe({ appName: 'Adaptive App' });
  }
  
  setRenderer(renderer: THREE.Renderer) {
    // Clean up previous renderer observation
    if (this.currentRenderer) {
      // Note: observeRenderer handles cleanup internally
    }
    
    this.currentRenderer = renderer;
    this.probe.observeRenderer(renderer);
    
    // Log renderer type for debugging
    if (isWebGPURenderer(renderer)) {
      console.log('Switched to WebGPU renderer');
    } else {
      console.log('Switched to WebGL renderer');
    }
  }
}
```

### Fallback Pattern

WebGPU with WebGL fallback:

```typescript
import * as THREE from 'three';
import { createProbe, isWebGPURenderer } from '@3lens/core';

async function createRendererWithFallback() {
  const probe = createProbe({ appName: 'My App' });
  let renderer: THREE.Renderer;
  
  // Try WebGPU first
  if (navigator.gpu) {
    try {
      const { WebGPURenderer } = await import('three/webgpu');
      renderer = new WebGPURenderer();
      await (renderer as any).init();
      
      console.log('Using WebGPU');
    } catch (e) {
      console.warn('WebGPU initialization failed, falling back to WebGL');
      renderer = new THREE.WebGLRenderer();
    }
  } else {
    console.log('WebGPU not available, using WebGL');
    renderer = new THREE.WebGLRenderer();
  }
  
  // Automatic detection handles both cases
  probe.observeRenderer(renderer);
  
  return { renderer, probe };
}
```

### Conditional Feature Usage

Use renderer-specific features conditionally:

```typescript
import { isWebGPURenderer, getWebGPUCapabilities } from '@3lens/core';

function setupAdvancedFeatures(renderer: THREE.Renderer, probe: DevtoolProbe) {
  if (isWebGPURenderer(renderer)) {
    // WebGPU-specific setup
    const caps = getWebGPUCapabilities(renderer);
    
    if (caps.hasTimestampQuery) {
      console.log('Per-pass GPU timing available');
    }
    
    if (caps.hasShaderF16) {
      console.log('Half-precision shaders available');
    }
    
    // Enable compute shader monitoring
    probe.onFrameStats((stats) => {
      if (stats.webgpuExtras?.computePasses) {
        console.log(`Compute passes: ${stats.webgpuExtras.computePasses}`);
      }
    });
  } else {
    // WebGL-specific setup
    const gl = (renderer as THREE.WebGLRenderer).getContext();
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    
    if (ext) {
      console.log('GPU timing via timer query extension');
    } else {
      console.log('GPU timing not available');
    }
  }
}
```

## Type Definitions

### Renderer Types

```typescript
// Three.js base renderer interface
interface Renderer {
  render(scene: Scene, camera: Camera): void;
  setSize(width: number, height: number, updateStyle?: boolean): void;
  dispose(): void;
}

// WebGL renderer (Three.js standard)
interface WebGLRenderer extends Renderer {
  readonly capabilities: WebGLCapabilities;
  readonly info: WebGLInfo;
  getContext(): WebGLRenderingContext | WebGL2RenderingContext;
}

// WebGPU renderer (Three.js r153+)
interface WebGPURenderer extends Renderer {
  readonly isWebGPURenderer: true;
  readonly backend?: WebGPUBackend;
  readonly info: WebGPURendererInfo;
  renderAsync?(scene: Scene, camera: Camera): Promise<void>;
  compute?(computeNodes: unknown): Promise<void>;
}
```

### Detection Results

```typescript
type DetectedRendererType = 'webgl' | 'webgpu';

interface DetectionResult {
  type: DetectedRendererType;
  capabilities: {
    gpuTiming: boolean;
    computeShaders: boolean;
    asyncRender: boolean;
    timestampQueries: boolean;
  };
}
```

## Best Practices

### 1. Use Automatic Detection

```typescript
// ✅ Recommended - simple and handles all cases
probe.observeRenderer(renderer);

// ⚠️ Only use manual creation when you need custom options
const adapter = createWebGLAdapter(renderer, { gpuTiming: false });
probe.setRendererAdapter(adapter);
```

### 2. Check Capabilities, Not Renderer Type

```typescript
// ❌ Avoid - assumes WebGL can't do certain things
if (isWebGPURenderer(renderer)) {
  enableAdvancedFeatures();
}

// ✅ Better - check actual capabilities
probe.onFrameStats((stats) => {
  if (stats.gpuTimeMs !== undefined) {
    showGpuTiming(stats.gpuTimeMs);
  }
  
  if (stats.webgpuExtras?.computePasses !== undefined) {
    showComputeStats(stats.webgpuExtras.computePasses);
  }
});
```

### 3. Handle Both Renderers in UI

```typescript
// ✅ Graceful capability-based UI
function updatePerformanceUI(stats: FrameStats) {
  // Always available
  ui.setCpuTime(stats.cpuTimeMs);
  ui.setDrawCalls(stats.drawCalls);
  
  // Conditionally available
  ui.setGpuTime(stats.gpuTimeMs ?? 'N/A');
  
  // WebGPU-specific panel
  if (stats.webgpuExtras) {
    ui.showWebGPUPanel(true);
    ui.setComputePasses(stats.webgpuExtras.computePasses);
    ui.setPipelines(stats.webgpuExtras.pipelinesUsed);
  } else {
    ui.showWebGPUPanel(false);
  }
}
```

## Troubleshooting

### Detection Not Working

**Symptom:** `observeRenderer` doesn't create the expected adapter type.

**Causes:**
1. Custom renderer without `isWebGPURenderer` property
2. Minified code stripping properties
3. Renderer not fully initialized

**Solution:**
```typescript
// Force adapter type manually
if (myRenderer.backend?.device) {
  // It's WebGPU, create adapter directly
  probe.setRendererAdapter(createWebGPUAdapter(myRenderer as any));
} else {
  probe.setRendererAdapter(createWebGLAdapter(myRenderer as THREE.WebGLRenderer));
}
```

### WebGPU Renderer Detected as WebGL

**Symptom:** WebGPU renderer creates WebGL adapter.

**Cause:** Checking renderer before initialization completes.

**Solution:**
```typescript
const renderer = new WebGPURenderer();
await renderer.init(); // Wait for init!
probe.observeRenderer(renderer);
```

## Related

- [WebGL Adapter](./webgl-adapter) - WebGL adapter details
- [WebGPU Adapter](./webgpu-adapter) - WebGPU adapter details
- [observeRenderer()](./observe-renderer) - Main observation method
- [DevtoolProbe](./devtool-probe) - Core probe class
