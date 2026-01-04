# observeRenderer()

The `observeRenderer()` method connects 3Lens to your three.js renderer, enabling automatic performance monitoring, frame statistics collection, and GPU timing.

## Signature

```typescript
observeRenderer(renderer: THREE.WebGLRenderer | THREE.Renderer): void
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `renderer` | `WebGLRenderer \| Renderer` | Any three.js renderer (WebGL or WebGPU) |

## Basic Usage

```typescript
import { createProbe } from '@3lens/core';
import * as THREE from 'three';

const probe = createProbe({ appName: 'My App' });
const renderer = new THREE.WebGLRenderer();

// Connect probe to renderer
probe.observeRenderer(renderer);
```

## Automatic Backend Detection

3Lens automatically detects whether you're using WebGL or WebGPU:

### WebGL Renderer

```typescript
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

probe.observeRenderer(renderer);

// Check the detected backend
console.log(probe.getRendererKind()); // 'webgl'
console.log(probe.isWebGL());         // true
console.log(probe.isWebGPU());        // false
```

### WebGPU Renderer

```typescript
const renderer = new THREE.WebGPURenderer();
await renderer.init();

probe.observeRenderer(renderer);

// Check the detected backend
console.log(probe.getRendererKind()); // 'webgpu'
console.log(probe.isWebGL());         // false
console.log(probe.isWebGPU());        // true
```

::: info Detection Method
WebGPU renderers are identified by the `isWebGPURenderer` property on the renderer object, following three.js conventions.
:::

## What Gets Tracked

Once `observeRenderer()` is called, the probe automatically collects:

### Frame Statistics

| Metric | Description |
|--------|-------------|
| `drawCalls` | Number of draw calls per frame |
| `triangles` | Total triangles rendered |
| `points` | Point primitives rendered |
| `lines` | Line primitives rendered |
| `geometryCount` | Active geometries |
| `textureCount` | Active textures |
| `programCount` | Active shader programs |

### Memory Statistics

| Metric | Description |
|--------|-------------|
| `textureMemory` | Estimated texture GPU memory |
| `geometryMemory` | Estimated geometry GPU memory |
| `totalGpuMemory` | Combined GPU memory estimate |

### Performance Metrics

| Metric | Description |
|--------|-------------|
| `fps` | Frames per second |
| `frameTime` | Time per frame (ms) |
| `cpuTime` | JavaScript/CPU time (ms) |
| `gpuTime` | GPU execution time (ms) * |

\* GPU timing requires browser support and may not be available in all environments.

## GPU Timing

### WebGL GPU Timing

Uses `EXT_disjoint_timer_query` extension when available:

```typescript
const probe = createProbe({
  appName: 'My App',
  sampling: {
    gpuTiming: true, // Enable GPU timing (default)
  },
});

probe.observeRenderer(renderer);

// Check GPU timing availability
probe.onFrameStats((stats) => {
  if (stats.performance?.gpuTime !== undefined) {
    console.log(`GPU time: ${stats.performance.gpuTime.toFixed(2)}ms`);
  }
});
```

::: warning Browser Support
GPU timing may be:
- Disabled by browser privacy settings
- Unavailable in certain contexts (cross-origin iframes)
- Deliberately throttled or randomized for fingerprint prevention
:::

### WebGPU Timestamps

For WebGPU renderers, uses native timestamp queries:

```typescript
const renderer = new THREE.WebGPURenderer();
await renderer.init();

probe.observeRenderer(renderer);

// WebGPU timing is more reliable than WebGL
probe.onFrameStats((stats) => {
  console.log(`GPU time: ${stats.performance?.gpuTime}ms`);
});
```

## Accessing Renderer Resources

After observation, query renderer-tracked resources:

### Textures

```typescript
const textures = probe.getTextures();

for (const tex of textures) {
  console.log(`${tex.name}: ${tex.width}x${tex.height}, ${tex.format}`);
  console.log(`  Memory: ${(tex.memoryBytes / 1024 / 1024).toFixed(2)} MB`);
}
```

### Geometries

```typescript
const geometries = probe.getGeometries();

for (const geo of geometries) {
  console.log(`${geo.name}: ${geo.vertexCount} vertices, ${geo.triangleCount} triangles`);
}
```

### Materials

```typescript
const materials = probe.getMaterials();

for (const mat of materials) {
  console.log(`${mat.name}: ${mat.type}`);
}
```

## Three.js Version Detection

The renderer observation also captures the three.js version:

```typescript
probe.observeRenderer(renderer);

console.log(`three.js version: ${probe.threeVersion}`);
// Output: "three.js version: 0.160.0"
```

## Custom Renderer Adapters

For advanced use cases, you can create custom adapters:

```typescript
import { createProbe, RendererAdapter } from '@3lens/core';

// Custom adapter implementation
const customAdapter: RendererAdapter = {
  kind: 'webgl',
  observeFrame(callback) {
    // Custom frame observation logic
  },
  getTextures() {
    return [/* custom texture enumeration */];
  },
  getGeometries() {
    return [/* custom geometry enumeration */];
  },
  getMaterials() {
    return [/* custom material enumeration */];
  },
  dispose() {
    // Cleanup
  },
};

probe.attachRendererAdapter(customAdapter);
```

## Multiple Renderers

While 3Lens supports observing one renderer at a time, you can switch between renderers:

```typescript
// Start with WebGL
const webglRenderer = new THREE.WebGLRenderer();
probe.observeRenderer(webglRenderer);

// Later, switch to WebGPU
const webgpuRenderer = new THREE.WebGPURenderer();
await webgpuRenderer.init();

// This automatically disposes the previous adapter
probe.observeRenderer(webgpuRenderer);
```

::: warning
Only one renderer can be observed at a time. Calling `observeRenderer()` again will replace the previous observation.
:::

## Frame Stats Subscription

Subscribe to receive stats on each frame:

```typescript
probe.observeRenderer(renderer);

const unsubscribe = probe.onFrameStats((stats) => {
  // Called every frame (or as configured by sampling)
  document.getElementById('fps').textContent = 
    `FPS: ${stats.performance?.fps?.toFixed(0) ?? '--'}`;
  
  document.getElementById('drawcalls').textContent = 
    `Draw Calls: ${stats.drawCalls}`;
  
  document.getElementById('triangles').textContent = 
    `Triangles: ${stats.triangles.toLocaleString()}`;
});

// Later: stop receiving updates
unsubscribe();
```

## Sampling Configuration

Control how often stats are collected:

```typescript
const probe = createProbe({
  appName: 'My App',
  sampling: {
    // Collect every frame (default)
    frameStats: 'every-frame',
    
    // Or: collect every N frames
    frameStats: 5, // Every 5th frame
    
    // Or: only when requested
    frameStats: 'on-demand',
    
    // GPU timing
    gpuTiming: true,
  },
});
```

### Adaptive Sampling

When using `'every-frame'`, 3Lens employs adaptive sampling that automatically reduces collection frequency when performance is stable:

```typescript
// Internally, if FPS is stable for 60+ frames,
// sampling rate is reduced (up to 4x) to lower overhead
```

## Complete Example

```typescript
import { createProbe } from '@3lens/core';
import * as THREE from 'three';

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create probe
const probe = createProbe({
  appName: 'Renderer Demo',
  sampling: {
    frameStats: 'every-frame',
    gpuTiming: true,
  },
  rules: {
    maxDrawCalls: 1000,
    maxTriangles: 500000,
  },
});

// Observe renderer
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Log renderer info
console.log('Backend:', probe.getRendererKind());
console.log('three.js:', probe.threeVersion);

// Monitor performance
probe.onFrameStats((stats) => {
  // Check for rule violations
  if (stats.violations?.length) {
    for (const v of stats.violations) {
      console.warn(`⚠️ ${v.ruleId}: ${v.message}`);
    }
  }
  
  // Log GPU timing when available
  if (stats.performance?.gpuTime !== undefined) {
    if (stats.performance.gpuTime > 16) {
      console.warn('GPU frame time exceeds 16ms target');
    }
  }
});

// Add content
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const light = new THREE.DirectionalLight(0xffffff, 1);
scene.add(light);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  probe.dispose();
  renderer.dispose();
});
```

## Troubleshooting

### No Frame Stats Received

1. Ensure `observeRenderer()` was called
2. Check that `renderer.render()` is being called in your animation loop
3. Verify sampling config isn't set to `'on-demand'`

### GPU Timing Always Undefined

1. GPU timing may be disabled by browser
2. Try a different browser or enable WebGL developer features
3. WebGPU typically has better timing support

### High Overhead

1. Reduce sampling frequency: `frameStats: 5`
2. Disable GPU timing: `gpuTiming: false`
3. Use adaptive sampling (default with `'every-frame'`)

## Related API

| Method | Description |
|--------|-------------|
| [`isWebGL()`](./devtool-probe.md#iswebgl) | Check if WebGL renderer |
| [`isWebGPU()`](./devtool-probe.md#iswebgpu) | Check if WebGPU renderer |
| [`getRendererKind()`](./devtool-probe.md#getrendererkind) | Get backend type |
| [`getRendererAdapter()`](./devtool-probe.md#getrendereradapter) | Get raw adapter |
| [`getTextures()`](./devtool-probe.md#gettextures) | List textures |
| [`getGeometries()`](./devtool-probe.md#getgeometries) | List geometries |
| [`getMaterials()`](./devtool-probe.md#getmaterials) | List materials |
| [`getGpuTimings()`](./devtool-probe.md#getgputimings) | Get GPU timing info |

## Related

- [observeScene()](./observe-scene.md) - Scene observation
- [FrameStats Reference](./frame-stats.md) - Stats structure
- [WebGL Adapter](./webgl-adapter.md) - WebGL details
- [WebGPU Adapter](./webgpu-adapter.md) - WebGPU details
