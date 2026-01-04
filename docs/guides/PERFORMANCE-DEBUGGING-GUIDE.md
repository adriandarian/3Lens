# Performance Debugging Guide

This guide covers how to identify, analyze, and fix performance issues in your Three.js applications using 3Lens's performance monitoring and profiling tools.

## Table of Contents

- [Overview](#overview)
- [Stats Panel](#stats-panel)
- [Frame Timeline](#frame-timeline)
- [Performance Metrics](#performance-metrics)
- [Draw Call Analysis](#draw-call-analysis)
- [GPU Timing](#gpu-timing)
- [Performance Rules](#performance-rules)
- [Identifying Bottlenecks](#identifying-bottlenecks)
- [Optimization Techniques](#optimization-techniques)

---

## Overview

3Lens provides comprehensive performance monitoring to help you:

- Track frame rate and frame times in real-time
- Monitor draw calls, triangles, and GPU memory
- Identify expensive objects in your scene
- Set performance budgets and receive violation alerts
- Profile specific frames for detailed analysis

---

## Stats Panel

### Opening the Stats Panel

1. Press `Ctrl+Shift+D` to open the overlay
2. Click the **Stats** tab
3. View real-time performance metrics

### Key Metrics Display

```
┌─────────────────────────────────┐
│ FPS: 58.2        Frame: 17.1ms  │
│ Draw Calls: 145  Triangles: 45K │
│ GPU Memory: 128MB               │
│ Textures: 24     Geometries: 18 │
└─────────────────────────────────┘
```

### Metric Definitions

| Metric | Description | Target |
|--------|-------------|--------|
| **FPS** | Frames per second | 60 (or display refresh rate) |
| **Frame Time** | Milliseconds per frame | < 16.67ms for 60 FPS |
| **Draw Calls** | Render calls per frame | < 200 for mobile, < 500 desktop |
| **Triangles** | Total triangles rendered | < 500K for mobile, < 2M desktop |
| **GPU Memory** | Estimated VRAM usage | Depends on device |
| **Textures** | Active texture count | Monitor for leaks |
| **Geometries** | Active geometry count | Monitor for leaks |

---

## Frame Timeline

### Viewing the Timeline

The timeline shows frame time history as a graph:

```
60fps ─────────────────────────────
      ╭─╮   ╭╮
      │ │   ││    ╭╮
30fps │ ╰───╯╰────╯╰───────────────
      │
 0fps ─────────────────────────────
      └─────────────────────────────►
                Time
```

- **Green zone**: 60+ FPS (< 16.67ms)
- **Yellow zone**: 30-60 FPS (16.67-33.33ms)
- **Red zone**: Below 30 FPS (> 33.33ms)

### Timeline Interactions

- **Hover** over a point to see exact values
- **Click** to pause and inspect that frame
- **Scroll** to zoom in/out on the timeline
- **Drag** to pan through history

### Frame Details

Click a frame to see breakdown:

```
Frame #1234 - 18.4ms
├── JavaScript: 4.2ms
├── Scene Update: 2.1ms
├── Render: 11.8ms
│   ├── Shadow Map: 3.2ms
│   ├── Opaque Pass: 6.1ms
│   └── Transparent Pass: 2.5ms
└── Idle: 0.3ms
```

---

## Performance Metrics

### Accessing Metrics Programmatically

```typescript
// Get current frame stats
const stats = probe.getFrameStats();
console.log(`FPS: ${stats.fps.toFixed(1)}`);
console.log(`Frame Time: ${stats.frameTimeMs.toFixed(2)}ms`);
console.log(`Draw Calls: ${stats.drawCalls}`);
console.log(`Triangles: ${stats.triangles}`);

// Subscribe to frame stats
probe.onFrameStats((stats) => {
  if (stats.fps < 30) {
    console.warn('Low FPS detected!');
  }
});
```

### React Integration

```tsx
import { useFPS, useDrawCalls, useFrameTime } from '@3lens/react-bridge';

function PerformanceHUD() {
  const fps = useFPS();
  const drawCalls = useDrawCalls();
  const frameTime = useFrameTime();
  
  return (
    <div className="perf-hud">
      <div style={{ color: fps < 30 ? 'red' : 'green' }}>
        FPS: {fps.toFixed(0)}
      </div>
      <div>Frame: {frameTime.toFixed(1)}ms</div>
      <div>Draws: {drawCalls}</div>
    </div>
  );
}
```

### Vue Integration

```vue
<script setup>
import { useThreeLens } from '@3lens/vue-bridge';

const { fps, drawCalls, frameTime } = useThreeLens();
</script>

<template>
  <div class="perf-hud">
    <span :class="{ warning: fps < 30 }">FPS: {{ fps.toFixed(0) }}</span>
    <span>Frame: {{ frameTime.toFixed(1) }}ms</span>
    <span>Draws: {{ drawCalls }}</span>
  </div>
</template>
```

---

## Draw Call Analysis

### What Are Draw Calls?

Each draw call is a command sent to the GPU. More draw calls = more CPU overhead.

Common causes of high draw calls:
- Many individual meshes
- Multiple materials on one object
- Unbatched transparent objects
- Shadow-casting lights

### Viewing Draw Call Breakdown

The Stats panel shows draw call sources:

```
Draw Calls: 145
├── Opaque Objects: 82
├── Transparent Objects: 28
├── Shadow Maps: 35
│   ├── DirectionalLight: 15
│   └── SpotLight (x2): 20
└── Post-Processing: 0
```

### Identifying Expensive Objects

Objects with high draw costs are highlighted in the Scene Explorer:

```
🔷 ComplexModel    🔴 (52 draw calls)
🔷 SimpleBox       🟢 (1 draw call)
🔷 ParticleSystem  🟡 (15 draw calls)
```

### Reducing Draw Calls

```typescript
// 1. Use instancing for repeated objects
const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000);

// 2. Merge static geometries
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const merged = mergeGeometries([geo1, geo2, geo3]);

// 3. Use texture atlases
// Combine multiple textures into one to share materials

// 4. Reduce shadow-casting objects
mesh.castShadow = false; // Only enable where needed
```

---

## GPU Timing

### Enabling GPU Timing

GPU timing provides accurate render pass measurements:

```typescript
const probe = createProbe({
  sampling: {
    enableGpuTiming: true,
  },
});
```

> ⚠️ GPU timing has a small performance overhead. Disable in production.

### WebGL GPU Timing

Uses the `EXT_disjoint_timer_query_webgl2` extension:

```typescript
const stats = probe.getFrameStats();

if (stats.gpuTiming) {
  console.log(`GPU Time: ${stats.gpuTiming.totalMs.toFixed(2)}ms`);
  console.log(`Shadow Pass: ${stats.gpuTiming.shadowPassMs.toFixed(2)}ms`);
  console.log(`Main Pass: ${stats.gpuTiming.mainPassMs.toFixed(2)}ms`);
}
```

### WebGPU GPU Timing

For WebGPU renderers, uses timestamp queries:

```typescript
// WebGPU provides more detailed timing
const stats = probe.getFrameStats();

if (stats.gpuTiming?.passes) {
  for (const [passName, timeMs] of Object.entries(stats.gpuTiming.passes)) {
    console.log(`${passName}: ${timeMs.toFixed(2)}ms`);
  }
}
```

---

## Performance Rules

### Setting Performance Budgets

```typescript
const probe = createProbe({
  rules: {
    maxDrawCalls: 200,
    maxTriangles: 500_000,
    maxFrameTimeMs: 16.67,
    maxTextures: 50,
    maxTextureMemory: 256 * 1024 * 1024, // 256MB
    maxGeometries: 100,
  },
});
```

### Receiving Violation Alerts

```typescript
probe.onRuleViolation((violation) => {
  console.warn(`Performance violation: ${violation.rule}`);
  console.warn(`Value: ${violation.value}, Max: ${violation.threshold}`);
  console.warn(`Message: ${violation.message}`);
  
  // Optionally report to analytics
  analytics.track('perf_violation', violation);
});
```

### Custom Rules

```typescript
const probe = createProbe({
  customRules: [
    {
      name: 'max-shadow-casters',
      check: (stats, snapshot) => {
        const shadowCasters = countShadowCasters(snapshot);
        return shadowCasters <= 10;
      },
      message: 'Too many shadow-casting objects',
    },
    {
      name: 'texture-resolution',
      check: (stats, snapshot) => {
        const maxSize = Math.max(...snapshot.textures.map(t => t.width * t.height));
        return maxSize <= 2048 * 2048;
      },
      message: 'Texture resolution exceeds 2048x2048',
    },
  ],
});
```

---

## Identifying Bottlenecks

### CPU vs GPU Bound

**CPU Bound** (JavaScript/scene updates taking too long):
- Frame time high, but GPU time low
- Many objects being updated each frame
- Complex physics/animation calculations

**GPU Bound** (Rendering taking too long):
- GPU time nearly equals frame time
- High triangle counts
- Complex shaders
- Many texture samples

### Common Bottlenecks

#### 1. Too Many Objects

```typescript
// Check object count
const snapshot = probe.takeSnapshot();
let objectCount = 0;
function countObjects(node) {
  objectCount++;
  node.children.forEach(countObjects);
}
snapshot.scenes.forEach(countObjects);

if (objectCount > 10000) {
  console.warn('Consider using instancing or LOD');
}
```

#### 2. Overdraw (Transparent Objects)

Transparent objects are rendered back-to-front, causing overdraw:

```
Stats shows:
- Opaque draw calls: 50
- Transparent draw calls: 200  ← Problem!
```

Solutions:
- Sort transparent objects by distance
- Use alpha testing instead of blending where possible
- Reduce transparent object count

#### 3. Shadow Map Rendering

Each shadow-casting light renders the scene again:

```
Shadow map costs:
- DirectionalLight: Full scene render
- SpotLight: Cone-limited render
- PointLight: 6 renders (cube map)!
```

Solutions:
- Limit shadow-casting lights
- Use lower shadow map resolution
- Cull objects from shadow passes

#### 4. Post-Processing

Each post-processing pass is a full-screen render:

```typescript
// Combine passes where possible
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Combine bloom + tonemapping into one pass
composer.addPass(new CombinedEffectsPass()); 
```

---

## Optimization Techniques

### Level of Detail (LOD)

```typescript
import * as THREE from 'three';

const lod = new THREE.LOD();
lod.addLevel(highDetailMesh, 0);    // < 10 units
lod.addLevel(mediumDetailMesh, 10); // 10-50 units
lod.addLevel(lowDetailMesh, 50);    // > 50 units

scene.add(lod);
```

### Frustum Culling

Three.js does this automatically, but verify it's working:

```typescript
// Ensure bounding spheres are computed
mesh.geometry.computeBoundingSphere();

// Check if objects are being culled
const stats = probe.getFrameStats();
console.log(`Culled: ${stats.culledObjects} / ${stats.totalObjects}`);
```

### Occlusion Culling

For complex scenes, implement occlusion culling:

```typescript
// Use three-mesh-bvh for GPU occlusion
import { MeshBVH } from 'three-mesh-bvh';

const bvh = new MeshBVH(occluderGeometry);
// Query visibility before rendering
```

### Instancing

```typescript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial();

const instancedMesh = new THREE.InstancedMesh(geometry, material, 10000);

const matrix = new THREE.Matrix4();
for (let i = 0; i < 10000; i++) {
  matrix.setPosition(Math.random() * 100, 0, Math.random() * 100);
  instancedMesh.setMatrixAt(i, matrix);
}

scene.add(instancedMesh);
// Result: 10,000 objects in 1 draw call!
```

### Texture Optimization

```typescript
// Use compressed textures
const loader = new THREE.KTX2Loader();
loader.setTranscoderPath('/basis/');
loader.detectSupport(renderer);

// Limit texture resolution
const texture = await loader.loadAsync('texture.ktx2');
if (texture.image.width > 1024) {
  console.warn('Consider downscaling large textures');
}

// Use mipmaps
texture.generateMipmaps = true;
texture.minFilter = THREE.LinearMipmapLinearFilter;
```

---

## CI Integration

### Performance Testing in CI

```typescript
// performance.test.ts
import { createProbe } from '@3lens/core';

describe('Performance Budgets', () => {
  let probe;
  
  beforeAll(() => {
    probe = createProbe({ appName: 'Test' });
    // ... setup scene
  });
  
  it('should stay under draw call budget', () => {
    const stats = probe.getFrameStats();
    expect(stats.drawCalls).toBeLessThan(200);
  });
  
  it('should maintain 60 FPS', () => {
    const stats = probe.getFrameStats();
    expect(stats.frameTimeMs).toBeLessThan(16.67);
  });
  
  it('should stay under memory budget', () => {
    const stats = probe.getFrameStats();
    expect(stats.memory.gpuMemoryEstimate).toBeLessThan(256 * 1024 * 1024);
  });
});
```

### Performance Regression Detection

```typescript
// Compare against baseline
const baseline = JSON.parse(fs.readFileSync('perf-baseline.json'));
const current = probe.getFrameStats();

const regression = current.frameTimeMs > baseline.frameTimeMs * 1.1;
if (regression) {
  throw new Error(`Performance regression: ${current.frameTimeMs}ms vs ${baseline.frameTimeMs}ms`);
}
```

---

## Related Guides

- [Memory Profiling Guide](./MEMORY-PROFILING-GUIDE.md)
- [Scene Inspection Guide](./SCENE-INSPECTION-GUIDE.md)
- [CI Integration Guide](./CI-INTEGRATION.md)

## API Reference

- [FrameStats Interface](/api/core/frame-stats)
- [Performance Tracker](/api/core/performance-tracker)
- [Stats Panel](/api/overlay/stats-panel)
- [Performance Thresholds](/api/core/performance-thresholds)
