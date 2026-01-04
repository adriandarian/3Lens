# Large Scene Optimization Guide

This guide covers best practices and techniques for optimizing large Three.js scenes using 3Lens, including LOD systems, culling, instancing, and memory management.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Analyzing Scene Complexity](#analyzing-scene-complexity)
- [Level of Detail (LOD)](#level-of-detail-lod)
- [Frustum Culling](#frustum-culling)
- [Occlusion Culling](#occlusion-culling)
- [Instancing](#instancing)
- [Geometry Optimization](#geometry-optimization)
- [Texture Optimization](#texture-optimization)
- [Scene Graph Optimization](#scene-graph-optimization)
- [Streaming & Loading](#streaming--loading)
- [Memory Management](#memory-management)
- [Performance Budgets](#performance-budgets)

---

## Overview

Large scenes present unique challenges:

- **Draw calls** - Many objects = many draw calls
- **Triangle count** - Complex geometry taxes the GPU
- **Memory** - High-res textures and buffers consume RAM/VRAM
- **CPU overhead** - Scene graph traversal, matrix updates

3Lens helps identify bottlenecks and validate optimizations.

---

## Quick Start

Get started optimizing a large scene:

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({
  appName: 'Large Scene',
  rules: {
    // Set performance budgets
    maxDrawCalls: 500,
    maxTriangles: 500000,
    minFPS: 55,
    maxTextureMemoryMB: 512,
    maxGeometries: 500,
  },
});

// Get optimization report
const report = probe.getOptimizationReport();

console.log('Optimization Suggestions:');
report.suggestions.forEach(s => console.log(`- ${s}`));
```

---

## Analyzing Scene Complexity

### Scene Statistics

```
┌─────────────────────────────────────────────────┐
│ 📊 Scene Complexity Analysis                    │
├─────────────────────────────────────────────────┤
│ Objects:       12,450 total                     │
│   Meshes:       8,234                           │
│   Groups:       2,156                           │
│   Lights:          32                           │
│   Cameras:          4                           │
├─────────────────────────────────────────────────┤
│ Geometry:                                       │
│   Triangles:   2.4M total                       │
│   Vertices:    1.8M total                       │
│   Unique:        156 geometries                 │
│   Instanced:      78 geometries                 │
├─────────────────────────────────────────────────┤
│ Materials:                                      │
│   Total:         234                            │
│   Unique:         45                            │
│   With Maps:     189                            │
├─────────────────────────────────────────────────┤
│ Textures:                                       │
│   Count:         312                            │
│   Memory:      485 MB                           │
│   Largest:    32 MB (env_hdr.exr)              │
└─────────────────────────────────────────────────┘
```

### Using the Analyzer

```typescript
// Get detailed scene analysis
const analysis = probe.analyzeScene();

// Most expensive objects
console.log('Top 10 most expensive meshes:');
analysis.expensiveMeshes.slice(0, 10).forEach(mesh => {
  console.log(`  ${mesh.name}: ${mesh.triangles} tris, ${mesh.cost}`);
});

// Material complexity
console.log('Complex materials:');
analysis.complexMaterials.forEach(mat => {
  console.log(`  ${mat.name}: ${mat.mapCount} maps, score: ${mat.complexity}`);
});

// Memory breakdown
console.log('Memory breakdown:');
console.log(`  Textures: ${analysis.memory.textures}MB`);
console.log(`  Geometries: ${analysis.memory.geometries}MB`);
console.log(`  Buffers: ${analysis.memory.buffers}MB`);
```

---

## Level of Detail (LOD)

### Setting Up LOD

```typescript
import * as THREE from 'three';

// Create LOD object
const lod = new THREE.LOD();

// Add detail levels
lod.addLevel(highDetailMesh, 0);    // 0-50 units
lod.addLevel(mediumDetailMesh, 50); // 50-150 units
lod.addLevel(lowDetailMesh, 150);   // 150+ units

scene.add(lod);
```

### 3Lens LOD Analysis

```
┌─────────────────────────────────────────────────┐
│ 🔍 LOD Analysis                                 │
├─────────────────────────────────────────────────┤
│ LOD Objects: 156                                │
│                                                 │
│ Current Distribution:                           │
│   High Detail:    23 (15%)   ████░░░░░░         │
│   Medium Detail:  89 (57%)   ██████████░░░░░    │
│   Low Detail:     44 (28%)   ███████░░░░░░░░    │
│                                                 │
│ Triangle Savings: 1.8M → 420K (77% reduction)   │
├─────────────────────────────────────────────────┤
│ ⚠️ Issues:                                      │
│ • 12 LOD objects missing low-detail level       │
│ • 5 LOD objects with >2x ratio between levels   │
└─────────────────────────────────────────────────┘
```

### LOD Best Practices

```typescript
// Use 3Lens LOD checker plugin
probe.enablePlugin('lod-checker');

// Get LOD recommendations
const lodReport = probe.getLODReport();

lodReport.recommendations.forEach(rec => {
  console.log(`Object: ${rec.object}`);
  console.log(`  Current: ${rec.currentLevels} levels`);
  console.log(`  Recommended: ${rec.recommendedLevels} levels`);
  console.log(`  Suggested distances: ${rec.distances.join(', ')}`);
});

// Auto-generate LOD levels (requires simplification library)
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier';

function createLODFromMesh(mesh, levels = 3) {
  const lod = new THREE.LOD();
  const simplifier = new SimplifyModifier();
  
  const ratios = [1, 0.5, 0.25]; // Triangle ratios
  const distances = [0, 50, 150];
  
  for (let i = 0; i < levels; i++) {
    const simplified = simplifier.modify(
      mesh.geometry.clone(),
      Math.floor(mesh.geometry.attributes.position.count * ratios[i])
    );
    
    const lodMesh = new THREE.Mesh(simplified, mesh.material);
    lod.addLevel(lodMesh, distances[i]);
  }
  
  return lod;
}
```

---

## Frustum Culling

### Understanding Frustum Culling

Three.js performs frustum culling automatically, but 3Lens shows you what's being culled:

```
┌─────────────────────────────────────────────────┐
│ 📷 Frustum Culling Stats                        │
├─────────────────────────────────────────────────┤
│ Objects in Scene:     12,450                    │
│ Objects in Frustum:    2,340 (19%)              │
│ Objects Culled:       10,110 (81%)              │
├─────────────────────────────────────────────────┤
│ Triangles:                                      │
│   Total in Scene:    2.4M                       │
│   Visible:           380K (16%)                 │
│   Culled:            2.0M (84%)                 │
├─────────────────────────────────────────────────┤
│ Draw Calls:                                     │
│   Potential:         8,234                      │
│   Actual:            1,456 (18%)                │
└─────────────────────────────────────────────────┘
```

### Optimizing for Frustum Culling

```typescript
// Ensure bounds are correct
mesh.geometry.computeBoundingBox();
mesh.geometry.computeBoundingSphere();

// For dynamic objects, update bounds
function updateDynamicMesh(mesh) {
  mesh.geometry.computeBoundingSphere();
  mesh.updateMatrixWorld();
}

// Check frustum culling in 3Lens
const cullingStats = probe.getFrustumCullingStats();
console.log(`Culled: ${cullingStats.culledCount} objects`);
console.log(`Visible: ${cullingStats.visibleCount} objects`);
```

### Spatial Partitioning

```typescript
// Use octree for better culling
import { Octree } from 'three/examples/jsm/math/Octree';

const octree = new Octree();
octree.fromGraphNode(scene);

// Query visible objects
const frustum = new THREE.Frustum();
frustum.setFromProjectionMatrix(
  new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  )
);

const visibleObjects = octree.query(frustum);
```

---

## Occlusion Culling

### GPU Occlusion Queries

```typescript
// Enable occlusion culling (WebGPU)
probe.setWebGPUOptions({
  occlusionQueries: true,
});

// Get occlusion stats
const occlusionStats = probe.getOcclusionStats();
console.log(`Occluded objects: ${occlusionStats.occludedCount}`);
console.log(`Visible after occlusion: ${occlusionStats.visibleCount}`);
```

### Software Occlusion Culling

```typescript
// Use depth buffer for occlusion testing
import { DepthPrepass } from './depth-prepass';

const depthPrepass = new DepthPrepass(renderer, scene, camera);

function render() {
  // Render depth
  depthPrepass.render();
  
  // Test visibility
  scene.traverse(obj => {
    if (obj.isMesh) {
      obj.visible = depthPrepass.isVisible(obj);
    }
  });
  
  // Main render
  renderer.render(scene, camera);
}
```

---

## Instancing

### Using InstancedMesh

```typescript
// Instead of many meshes
// ❌ Bad - Creates many draw calls
for (let i = 0; i < 10000; i++) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(Math.random() * 100, 0, Math.random() * 100);
  scene.add(mesh);
}

// ✅ Good - Single draw call
const instancedMesh = new THREE.InstancedMesh(geometry, material, 10000);

const dummy = new THREE.Object3D();
for (let i = 0; i < 10000; i++) {
  dummy.position.set(Math.random() * 100, 0, Math.random() * 100);
  dummy.updateMatrix();
  instancedMesh.setMatrixAt(i, dummy.matrix);
}
instancedMesh.instanceMatrix.needsUpdate = true;

scene.add(instancedMesh);
```

### 3Lens Instancing Analysis

```
┌─────────────────────────────────────────────────┐
│ 📦 Instancing Opportunities                     │
├─────────────────────────────────────────────────┤
│ Current Status:                                 │
│   Instanced Meshes: 12                          │
│   Total Instances: 45,000                       │
│   Draw Calls Saved: ~44,988                     │
├─────────────────────────────────────────────────┤
│ ⚠️ Missed Opportunities:                        │
│                                                 │
│ "tree_pine" - 234 identical meshes              │
│   Potential: Instance with 234 instances        │
│   Savings: 233 draw calls                       │
│                                                 │
│ "rock_small" - 567 identical meshes             │
│   Potential: Instance with 567 instances        │
│   Savings: 566 draw calls                       │
│                                                 │
│ Total potential savings: 1,845 draw calls       │
└─────────────────────────────────────────────────┘
```

### Auto-Instancing Detection

```typescript
// Find instancing opportunities
const opportunities = probe.findInstancingOpportunities();

opportunities.forEach(opp => {
  console.log(`Geometry: ${opp.geometryName}`);
  console.log(`  Duplicate meshes: ${opp.duplicateCount}`);
  console.log(`  Triangle savings: ${opp.triangleSavings}`);
  console.log(`  Recommended: Convert to InstancedMesh`);
});

// Auto-convert duplicates to instances
probe.autoInstance({
  minDuplicates: 10,    // Only instance if 10+ duplicates
  preserveOriginals: false,
});
```

---

## Geometry Optimization

### Geometry Merging

```typescript
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

// Merge static geometries with same material
const geometries = staticMeshes.map(m => {
  const geo = m.geometry.clone();
  geo.applyMatrix4(m.matrixWorld);
  return geo;
});

const mergedGeometry = mergeGeometries(geometries);
const mergedMesh = new THREE.Mesh(mergedGeometry, sharedMaterial);
```

### Geometry Compression

```typescript
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

// Use with GLTFLoader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Compression typically achieves 90%+ reduction in file size
```

### Index Buffer Optimization

```typescript
// Ensure geometry is indexed
if (!geometry.index) {
  const indices = [];
  const positions = geometry.attributes.position;
  
  for (let i = 0; i < positions.count; i++) {
    indices.push(i);
  }
  
  geometry.setIndex(indices);
}

// Optimize index order for GPU cache
import { computeOptimalIndex } from 'meshoptimizer';

const optimizedIndices = computeOptimalIndex(geometry);
geometry.setIndex(new THREE.BufferAttribute(optimizedIndices, 1));
```

---

## Texture Optimization

### Texture Compression

```typescript
// Use compressed textures
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath('/basis/');
ktx2Loader.detectSupport(renderer);

// Load compressed texture
const texture = await ktx2Loader.loadAsync('/textures/diffuse.ktx2');
```

### Texture Atlasing

```typescript
// Combine multiple textures into atlas
// Before: 100 textures = 100 texture switches
// After: 1 atlas = 1 texture switch

// 3Lens atlas analyzer
const atlasReport = probe.analyzeTextureAtlasOpportunity();

console.log(`Current textures: ${atlasReport.textureCount}`);
console.log(`Recommended atlases: ${atlasReport.recommendedAtlases}`);
console.log(`Potential memory savings: ${atlasReport.memorySavings}MB`);
```

### Mipmap Generation

```typescript
// Ensure mipmaps for distant objects
texture.generateMipmaps = true;
texture.minFilter = THREE.LinearMipmapLinearFilter;

// For textures that don't need mipmaps (UI, sprites)
texture.generateMipmaps = false;
texture.minFilter = THREE.LinearFilter;
```

### 3Lens Texture Analysis

```
┌─────────────────────────────────────────────────┐
│ 🖼️ Texture Optimization Report                  │
├─────────────────────────────────────────────────┤
│ Total Memory: 485 MB                            │
│                                                 │
│ Optimization Opportunities:                     │
│                                                 │
│ 1. Oversized Textures (12 found)                │
│    - env_hdr.exr: 8192x4096 → 4096x2048         │
│    - ground.png: 4096x4096 → 2048x2048          │
│    Potential savings: 128 MB                    │
│                                                 │
│ 2. Missing Compression (34 textures)            │
│    - Using PNG/JPEG instead of KTX2/Basis       │
│    Potential savings: 180 MB                    │
│                                                 │
│ 3. Duplicate Textures (8 found)                 │
│    - brick_diffuse loaded 4 times               │
│    Potential savings: 24 MB                     │
│                                                 │
│ Total Potential Savings: 332 MB (68%)           │
└─────────────────────────────────────────────────┘
```

---

## Scene Graph Optimization

### Flatten Hierarchy

```typescript
// Deep hierarchies have CPU overhead
// Before: Object > Group > Group > Group > Mesh
// After: Object > Mesh

function flattenHierarchy(object, depth = 0) {
  const flatObjects = [];
  
  object.traverse(child => {
    if (child.isMesh) {
      // Apply world transform
      child.applyMatrix4(child.matrixWorld);
      child.parent = null;
      flatObjects.push(child);
    }
  });
  
  return flatObjects;
}
```

### Remove Unnecessary Groups

```typescript
// 3Lens can identify unnecessary groups
const groupAnalysis = probe.analyzeGroups();

groupAnalysis.unnecessaryGroups.forEach(group => {
  console.log(`Unnecessary group: ${group.name}`);
  console.log(`  Children: ${group.childCount}`);
  console.log(`  Recommendation: ${group.recommendation}`);
});

// Auto-cleanup
probe.removeUnnecessaryGroups({ dryRun: false });
```

### Object Pooling

```typescript
class ObjectPool {
  constructor(createFn, initialSize = 100) {
    this.createFn = createFn;
    this.pool = [];
    this.active = new Set();
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }
  
  acquire() {
    const obj = this.pool.length > 0 
      ? this.pool.pop() 
      : this.createFn();
    this.active.add(obj);
    obj.visible = true;
    return obj;
  }
  
  release(obj) {
    obj.visible = false;
    this.active.delete(obj);
    this.pool.push(obj);
  }
}

// Usage
const bulletPool = new ObjectPool(() => {
  return new THREE.Mesh(bulletGeometry, bulletMaterial);
}, 500);
```

---

## Streaming & Loading

### Progressive Loading

```typescript
// Load scene in chunks
async function loadSceneProgressively(chunks) {
  for (const chunk of chunks) {
    const objects = await loadChunk(chunk);
    scene.add(...objects);
    
    // Update loading progress
    probe.setLoadingProgress(chunk.progress);
    
    // Allow frame to render
    await new Promise(r => setTimeout(r, 0));
  }
}
```

### Distance-Based Loading

```typescript
class StreamingManager {
  constructor(camera, probe) {
    this.camera = camera;
    this.probe = probe;
    this.loaded = new Map();
    this.loading = new Set();
  }
  
  update() {
    const cameraPos = this.camera.position;
    
    // Find chunks to load/unload
    for (const chunk of this.allChunks) {
      const distance = cameraPos.distanceTo(chunk.center);
      
      if (distance < chunk.loadDistance && !this.loaded.has(chunk.id)) {
        this.loadChunk(chunk);
      } else if (distance > chunk.unloadDistance && this.loaded.has(chunk.id)) {
        this.unloadChunk(chunk);
      }
    }
  }
  
  async loadChunk(chunk) {
    if (this.loading.has(chunk.id)) return;
    this.loading.add(chunk.id);
    
    const objects = await this.loader.load(chunk.url);
    scene.add(...objects);
    
    this.loaded.set(chunk.id, objects);
    this.loading.delete(chunk.id);
    
    this.probe.notifyChunkLoaded(chunk.id);
  }
  
  unloadChunk(chunk) {
    const objects = this.loaded.get(chunk.id);
    if (!objects) return;
    
    objects.forEach(obj => {
      scene.remove(obj);
      // Dispose resources
      this.probe.disposeObject(obj);
    });
    
    this.loaded.delete(chunk.id);
    this.probe.notifyChunkUnloaded(chunk.id);
  }
}
```

---

## Memory Management

### Proper Disposal

```typescript
function disposeObject(object) {
  if (object.geometry) {
    object.geometry.dispose();
  }
  
  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach(disposeMaterial);
    } else {
      disposeMaterial(object.material);
    }
  }
}

function disposeMaterial(material) {
  Object.keys(material).forEach(key => {
    const value = material[key];
    if (value?.isTexture) {
      value.dispose();
    }
  });
  material.dispose();
}

// 3Lens tracks disposal
probe.onDispose((disposed) => {
  console.log(`Disposed: ${disposed.type} - ${disposed.name}`);
});
```

### Memory Budgets

```typescript
const probe = createProbe({
  appName: 'Large Scene',
  rules: {
    maxGpuMemoryMB: 1024,
    maxTextureMemoryMB: 512,
    maxGeometryMemoryMB: 256,
  },
});

// Monitor memory usage
probe.onMemoryWarning((warning) => {
  console.warn(`Memory warning: ${warning.type}`);
  console.warn(`Current: ${warning.current}MB, Limit: ${warning.limit}MB`);
  
  // Trigger cleanup
  cleanupUnusedResources();
});
```

---

## Performance Budgets

### Setting Budgets

```typescript
const budgets = {
  // Frame time (ms)
  targetFrameTime: 16.67, // 60 FPS
  maxFrameTime: 33.33,    // Never below 30 FPS
  
  // Draw calls
  targetDrawCalls: 300,
  maxDrawCalls: 500,
  
  // Triangles
  targetTriangles: 300000,
  maxTriangles: 500000,
  
  // Memory
  maxTextureMemory: 512,  // MB
  maxGeometryMemory: 256, // MB
};

const probe = createProbe({
  appName: 'Large Scene',
  rules: budgets,
});
```

### Budget Monitoring

```
┌─────────────────────────────────────────────────┐
│ 📊 Performance Budget Status                    │
├─────────────────────────────────────────────────┤
│                   Current   Target   Max        │
│ Frame Time:       12.4ms    16.67ms  33.33ms ✅ │
│ Draw Calls:       456       300      500     ⚠️ │
│ Triangles:        380K      300K     500K    ⚠️ │
│ Texture Mem:      445MB     -        512MB   ✅ │
│ Geometry Mem:     198MB     -        256MB   ✅ │
├─────────────────────────────────────────────────┤
│ Overall Status: ⚠️ APPROACHING LIMITS           │
│                                                 │
│ Recommendations:                                │
│ • Enable more aggressive LOD switching          │
│ • Consider instancing for repeated objects      │
│ • Review texture sizes for distant objects      │
└─────────────────────────────────────────────────┘
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `L` | Toggle LOD visualization |
| `C` | Show culling stats |
| `I` | Show instancing opportunities |
| `M` | Show memory breakdown |
| `O` | Run optimization analysis |

---

## Related Guides

- [Performance Debugging Guide](./PERFORMANCE-DEBUGGING-GUIDE.md)
- [Memory Profiling Guide](./MEMORY-PROFILING-GUIDE.md)
- [Custom Rules Guide](./CUSTOM-RULES-GUIDE.md)

## API Reference

- [Scene Analysis](/api/core/scene-analysis)
- [LOD Checker Plugin](/api/core/lod-checker-plugin)
- [Memory Tracking](/api/core/memory-tracking)
