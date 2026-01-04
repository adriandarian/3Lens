# Memory Profiling Guide

This guide covers how to identify, track, and fix memory leaks in your Three.js applications using 3Lens's memory profiling and leak detection tools.

## Table of Contents

- [Overview](#overview)
- [Memory Panel](#memory-panel)
- [Resource Tracking](#resource-tracking)
- [Leak Detection](#leak-detection)
- [Common Memory Leaks](#common-memory-leaks)
- [Disposal Patterns](#disposal-patterns)
- [Memory Snapshots](#memory-snapshots)
- [Debugging Workflow](#debugging-workflow)

---

## Overview

Memory management in Three.js requires manual disposal of GPU resources. 3Lens helps you:

- Track all geometries, materials, textures, and render targets
- Detect resources that aren't properly disposed
- Identify orphaned resources no longer in the scene
- Monitor GPU memory usage trends over time
- Get alerts when memory exceeds thresholds

---

## Memory Panel

### Opening the Memory Panel

1. Press `Ctrl+Shift+D` to open the overlay
2. Click the **Memory** tab
3. View current memory usage and resource counts

### Memory Overview

```
┌────────────────────────────────────────┐
│ GPU Memory Estimate: 156.4 MB          │
│                                        │
│ Geometries:    45 (12.3 MB)           │
│ Materials:     23                      │
│ Textures:      18 (128.0 MB)          │
│ Render Targets: 4 (16.1 MB)           │
│                                        │
│ ⚠️ 3 potential leaks detected         │
└────────────────────────────────────────┘
```

### Memory Timeline

The timeline shows memory usage over time:

```
256MB ─────────────────────────────────
      
128MB ─────────────────╱───────────────  ← Steady increase = leak!
              ╱────────
 64MB ────────
      
  0MB ─────────────────────────────────
      └─────────────────────────────────►
                    Time
```

- **Flat line**: Good - stable memory usage
- **Sawtooth**: Normal - allocations + GC
- **Steady increase**: Potential memory leak!

---

## Resource Tracking

### Automatic Tracking

3Lens automatically tracks all Three.js resources:

```typescript
const probe = createProbe({
  sampling: {
    enableResourceTracking: true,
  },
});
```

### Resource Categories

#### Geometries

```typescript
const snapshot = probe.takeSnapshot();

for (const geo of snapshot.geometries) {
  console.log(`${geo.name}: ${geo.vertexCount} vertices`);
  console.log(`  Memory: ${(geo.memoryBytes / 1024).toFixed(1)} KB`);
  console.log(`  Attributes: ${geo.attributes.join(', ')}`);
  console.log(`  In scene: ${geo.inScene}`);
  console.log(`  Users: ${geo.useCount}`);
}
```

#### Materials

```typescript
for (const mat of snapshot.materials) {
  console.log(`${mat.name}: ${mat.type}`);
  console.log(`  Textures: ${mat.textureCount}`);
  console.log(`  In scene: ${mat.inScene}`);
  console.log(`  Users: ${mat.useCount}`);
}
```

#### Textures

```typescript
for (const tex of snapshot.textures) {
  console.log(`${tex.name}: ${tex.width}x${tex.height}`);
  console.log(`  Format: ${tex.format}`);
  console.log(`  Memory: ${(tex.memoryBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Mipmaps: ${tex.mipmapCount}`);
  console.log(`  In scene: ${tex.inScene}`);
}
```

#### Render Targets

```typescript
for (const rt of snapshot.renderTargets) {
  console.log(`${rt.name}: ${rt.width}x${rt.height}`);
  console.log(`  Depth: ${rt.hasDepthBuffer}`);
  console.log(`  Memory: ${(rt.memoryBytes / 1024 / 1024).toFixed(1)} MB`);
}
```

### Resource Lifecycle Events

```typescript
probe.onResourceCreated((resource) => {
  console.log(`Created: ${resource.type} - ${resource.id}`);
});

probe.onResourceDisposed((resource) => {
  console.log(`Disposed: ${resource.type} - ${resource.id}`);
});

probe.onResourceLeaked((resource) => {
  console.warn(`Potential leak: ${resource.type} - ${resource.id}`);
  console.warn(`  Created at:`, resource.creationStack);
});
```

---

## Leak Detection

### How Leak Detection Works

3Lens tracks resources through their lifecycle:

1. **Creation**: Resource allocated, tracked with stack trace
2. **Scene Reference**: Resource used by objects in scene
3. **Orphaned**: No longer referenced in scene, but not disposed
4. **Disposed**: Properly cleaned up

**Leak** = Resource orphaned for too long without disposal

### Leak Detection Settings

```typescript
const probe = createProbe({
  leakDetection: {
    enabled: true,
    orphanThresholdMs: 5000, // Report after 5 seconds orphaned
    trackCreationStacks: true, // Capture stack traces (dev only)
  },
});
```

### Viewing Potential Leaks

The Memory panel highlights potential leaks:

```
⚠️ Potential Leaks (3)

🔶 BufferGeometry (unnamed)
   Created: 45s ago
   Last used: 42s ago
   Stack: createEnemy() at enemies.js:123

🔶 MeshStandardMaterial (unnamed)
   Created: 45s ago
   Last used: 42s ago
   Stack: createEnemy() at enemies.js:125

🔶 Texture (enemy-skin.png)
   Created: 45s ago
   Last used: 42s ago
   Stack: loadTexture() at loader.js:67
```

### Programmatic Leak Queries

```typescript
// Get all potential leaks
const leaks = probe.getPotentialLeaks();

for (const leak of leaks) {
  console.warn(`Leaked ${leak.type}: ${leak.id}`);
  console.warn(`  Age: ${leak.ageMs}ms`);
  console.warn(`  Creation stack:`, leak.creationStack);
}

// Get leaks by type
const textureLeaks = probe.getPotentialLeaks({ type: 'Texture' });
const geometryLeaks = probe.getPotentialLeaks({ type: 'Geometry' });
```

---

## Common Memory Leaks

### 1. Not Disposing Removed Objects

```typescript
// ❌ LEAK: Geometry and material not disposed
scene.remove(mesh);

// ✅ CORRECT: Dispose before removing
mesh.geometry.dispose();
mesh.material.dispose();
scene.remove(mesh);
```

### 2. Orphaned Textures

```typescript
// ❌ LEAK: Old texture not disposed
material.map = newTexture;

// ✅ CORRECT: Dispose old texture first
if (material.map) {
  material.map.dispose();
}
material.map = newTexture;
```

### 3. Cloned Materials

```typescript
// ❌ LEAK: Cloned material never disposed
const uniqueMaterial = baseMaterial.clone();
mesh.material = uniqueMaterial;

// ✅ CORRECT: Track and dispose clones
const clonedMaterials = new Set();
const uniqueMaterial = baseMaterial.clone();
clonedMaterials.add(uniqueMaterial);
mesh.material = uniqueMaterial;

// Later, when cleaning up:
clonedMaterials.forEach(mat => mat.dispose());
```

### 4. Event Listeners

```typescript
// ❌ LEAK: Event listener keeps reference
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ✅ CORRECT: Store reference for removal
const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener('resize', onResize);

// Cleanup
window.removeEventListener('resize', onResize);
```

### 5. Animation Mixers

```typescript
// ❌ LEAK: Mixer not stopped/disposed
const mixer = new THREE.AnimationMixer(model);
const action = mixer.clipAction(clip);
action.play();

// ✅ CORRECT: Stop and uncache
action.stop();
mixer.uncacheRoot(model);
mixer.uncacheClip(clip);
```

### 6. Render Targets

```typescript
// ❌ LEAK: Old render target not disposed
effectComposer.renderTarget1 = new THREE.WebGLRenderTarget(w, h);

// ✅ CORRECT: Dispose old target
if (effectComposer.renderTarget1) {
  effectComposer.renderTarget1.dispose();
}
effectComposer.renderTarget1 = new THREE.WebGLRenderTarget(w, h);
```

---

## Disposal Patterns

### Comprehensive Object Disposal

```typescript
function disposeObject(object) {
  // Dispose geometry
  if (object.geometry) {
    object.geometry.dispose();
  }
  
  // Dispose material(s)
  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach(disposeMaterial);
    } else {
      disposeMaterial(object.material);
    }
  }
  
  // Recurse to children
  while (object.children.length > 0) {
    disposeObject(object.children[0]);
    object.remove(object.children[0]);
  }
}

function disposeMaterial(material) {
  // Dispose all texture maps
  const textureProperties = [
    'map', 'lightMap', 'bumpMap', 'normalMap',
    'specularMap', 'envMap', 'alphaMap', 'aoMap',
    'displacementMap', 'emissiveMap', 'gradientMap',
    'metalnessMap', 'roughnessMap'
  ];
  
  for (const prop of textureProperties) {
    if (material[prop]) {
      material[prop].dispose();
    }
  }
  
  material.dispose();
}
```

### Scene Cleanup

```typescript
function disposeScene(scene) {
  scene.traverse((object) => {
    if (object.geometry) {
      object.geometry.dispose();
    }
    
    if (object.material) {
      const materials = Array.isArray(object.material) 
        ? object.material 
        : [object.material];
      
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) {
            value.dispose();
          }
        });
        material.dispose();
      });
    }
  });
  
  scene.clear();
}
```

### React Cleanup Hook

```tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function useDisposable<T extends THREE.Object3D>(factory: () => T): T {
  const ref = useRef<T>();
  
  if (!ref.current) {
    ref.current = factory();
  }
  
  useEffect(() => {
    return () => {
      if (ref.current) {
        disposeObject(ref.current);
      }
    };
  }, []);
  
  return ref.current;
}

// Usage
function MyComponent() {
  const mesh = useDisposable(() => {
    const geo = new THREE.BoxGeometry();
    const mat = new THREE.MeshStandardMaterial();
    return new THREE.Mesh(geo, mat);
  });
  
  return <primitive object={mesh} />;
}
```

### Vue Cleanup Composable

```typescript
import { onUnmounted, shallowRef } from 'vue';
import * as THREE from 'three';

function useDisposable<T extends THREE.Object3D>(factory: () => T) {
  const object = shallowRef(factory());
  
  onUnmounted(() => {
    disposeObject(object.value);
  });
  
  return object;
}
```

---

## Memory Snapshots

### Taking Snapshots

```typescript
// Take a snapshot
const snapshot1 = probe.takeMemorySnapshot();

// ... do some operations ...

// Take another snapshot
const snapshot2 = probe.takeMemorySnapshot();

// Compare snapshots
const diff = probe.compareSnapshots(snapshot1, snapshot2);

console.log('New resources:', diff.created);
console.log('Disposed resources:', diff.disposed);
console.log('Memory change:', diff.memoryDelta);
```

### Snapshot Contents

```typescript
interface MemorySnapshot {
  timestamp: number;
  totalMemory: number;
  
  geometries: {
    count: number;
    memory: number;
    items: GeometryInfo[];
  };
  
  materials: {
    count: number;
    items: MaterialInfo[];
  };
  
  textures: {
    count: number;
    memory: number;
    items: TextureInfo[];
  };
  
  renderTargets: {
    count: number;
    memory: number;
    items: RenderTargetInfo[];
  };
}
```

### Exporting Snapshots

```typescript
// Export for analysis
const snapshot = probe.takeMemorySnapshot();
const json = JSON.stringify(snapshot, null, 2);
downloadFile('memory-snapshot.json', json);

// Compare with baseline
const baseline = await fetch('/baseline-snapshot.json').then(r => r.json());
const current = probe.takeMemorySnapshot();

if (current.totalMemory > baseline.totalMemory * 1.5) {
  console.error('Memory increased by 50%!');
}
```

---

## Debugging Workflow

### Step 1: Establish Baseline

```typescript
// After initial load
await scene.loadComplete();
const baseline = probe.takeMemorySnapshot();
console.log(`Baseline memory: ${baseline.totalMemory / 1024 / 1024} MB`);
```

### Step 2: Reproduce Issue

```typescript
// Perform actions that might leak
for (let i = 0; i < 100; i++) {
  createEnemy();
  destroyEnemy();
}
```

### Step 3: Check for Growth

```typescript
const after = probe.takeMemorySnapshot();
const diff = probe.compareSnapshots(baseline, after);

if (diff.memoryDelta > 0) {
  console.warn(`Memory grew by ${diff.memoryDelta / 1024} KB`);
  console.warn('Leaked resources:', diff.created.filter(r => !diff.disposed.includes(r)));
}
```

### Step 4: Find Leak Source

```typescript
// Get detailed leak info
const leaks = probe.getPotentialLeaks();

for (const leak of leaks) {
  console.group(`Leak: ${leak.type}`);
  console.log('ID:', leak.id);
  console.log('Created:', new Date(leak.createdAt));
  console.log('Stack trace:');
  console.log(leak.creationStack);
  console.groupEnd();
}
```

### Step 5: Fix and Verify

```typescript
// After fixing
for (let i = 0; i < 100; i++) {
  createEnemy();
  destroyEnemy(); // Now properly disposes
}

const afterFix = probe.takeMemorySnapshot();
const fixDiff = probe.compareSnapshots(baseline, afterFix);

console.assert(fixDiff.memoryDelta < 1024, 'Memory should be stable');
```

---

## Memory Rules

### Setting Memory Budgets

```typescript
const probe = createProbe({
  rules: {
    maxTextureMemory: 256 * 1024 * 1024, // 256 MB
    maxGeometryMemory: 64 * 1024 * 1024,  // 64 MB
    maxTextures: 100,
    maxGeometries: 200,
  },
});

probe.onRuleViolation((violation) => {
  if (violation.rule.startsWith('max')) {
    console.error(`Memory budget exceeded: ${violation.message}`);
  }
});
```

---

## Related Guides

- [Performance Debugging Guide](./PERFORMANCE-DEBUGGING-GUIDE.md)
- [Scene Inspection Guide](./SCENE-INSPECTION-GUIDE.md)
- [CI Integration Guide](./CI-INTEGRATION.md)

## API Reference

- [Memory Tracking](/api/core/memory-tracking)
- [Leak Detection](/api/core/leak-detection)
- [Resource Lifecycle Tracker](/api/core/resource-lifecycle-tracker)
- [Memory Panel](/api/overlay/memory-panel)
