# 3Lens Draw Call Batching Example

This example demonstrates different techniques to reduce draw calls in Three.js and how to use 3Lens to analyze their effectiveness. Draw call reduction is one of the most impactful optimizations for GPU-bound applications.

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-draw-call-batching dev
```

Then open http://localhost:3012 in your browser.

## Rendering Modes Compared

### 1. Individual Meshes (Worst)

**The Problem:** Each object creates a separate draw call.

```typescript
for (let i = 0; i < 1000; i++) {
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh); // 1000 draw calls!
}
```

**Impact:**
- 1000 objects = 1000+ draw calls
- CPU-bound: driver overhead dominates
- Poor GPU utilization

**When It's Okay:**
- Very few objects (<10)
- Each object has unique materials/shaders
- Objects need individual culling

---

### 2. InstancedMesh (Best for Same Geometry)

**The Solution:** GPU renders multiple copies of the same geometry in one draw call.

```typescript
const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000);
for (let i = 0; i < 1000; i++) {
  instancedMesh.setMatrixAt(i, matrix);
}
scene.add(instancedMesh); // 1 draw call!
```

**Impact:**
- 1000 objects = 1 draw call
- 99%+ reduction in draw calls
- GPU processes all instances in parallel

**When to Use:**
- Many identical objects (trees, particles, buildings)
- Objects share the same geometry and material
- Per-instance transforms needed

**Limitations:**
- Same geometry for all instances
- Same material for all instances (use per-instance colors with BufferAttribute)
- Dynamic instance count changes are expensive

---

### 3. Merged Geometry (Best for Static Scenes)

**The Solution:** Combine all geometries into a single buffer.

```typescript
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const geometries = objects.map(obj => {
  const geo = obj.geometry.clone();
  geo.applyMatrix4(obj.matrix);
  return geo;
});

const merged = mergeGeometries(geometries);
const mesh = new THREE.Mesh(merged, material); // 1 draw call!
```

**Impact:**
- Arbitrary geometries combined
- Single draw call for entire group
- No per-instance updates possible

**When to Use:**
- Static scenes (level geometry, terrain)
- Objects that never move
- Mixed geometry types with same material

**Limitations:**
- Can't animate individual parts
- Large memory for merged buffer
- No frustum culling per-object

---

### 4. BatchedMesh (Three.js r159+)

**The Solution:** Dynamic batching with mixed geometries.

```typescript
const batchedMesh = new THREE.BatchedMesh(
  maxGeometryCount,
  maxVertexCount,
  maxIndexCount,
  material
);

const geoId = batchedMesh.addGeometry(geometry);
const instanceId = batchedMesh.addInstance(geoId);
batchedMesh.setMatrixAt(instanceId, matrix);
```

**Impact:**
- Multiple geometry types in one draw
- Dynamic add/remove of instances
- Modern batching approach

**When to Use:**
- Mixed geometry types
- Dynamic scene composition
- Need flexibility of individual + performance of batching

**Limitations:**
- Requires Three.js r159+
- More complex API
- Memory pre-allocation needed

---

## Using 3Lens to Analyze

### Step 1: Compare Draw Calls

Open the 3Lens overlay and observe the **Performance Panel → Overview**:

| Mode | Expected Draw Calls | Reduction |
|------|---------------------|-----------|
| Individual | 1000+ | Baseline |
| Instanced | 1-2 | ~99% |
| Merged | 1-2 | ~99% |
| Batched | 1-2 | ~99% |

### Step 2: Monitor Frame Time

Watch the frame time chart to see CPU overhead differences:
- **Individual:** High CPU time (driver calls)
- **Batched modes:** Low CPU time

### Step 3: Check Memory

In the **Memory Panel**, compare:
- **Individual:** More GPU objects tracked
- **Merged:** Larger single geometry
- **Instanced:** Compact instance buffer

### Step 4: Scene Inspection

Use the **Scene Panel** to understand object structure:
- **Individual:** See all 1000 children
- **Instanced:** Single InstancedMesh with instance count
- **Merged:** Single Mesh with high vertex count

---

## Optimization Decision Tree

```
Need to render many similar objects?
│
├─ YES: Same geometry?
│   │
│   ├─ YES: Need per-instance animation?
│   │   │
│   │   ├─ YES → InstancedMesh
│   │   └─ NO → Merged Geometry (if static)
│   │
│   └─ NO: Static scene?
│       │
│       ├─ YES → Merged Geometry
│       └─ NO → BatchedMesh (r159+)
│
└─ NO: Few objects with unique materials
    │
    └─ Individual Meshes (fine)
```

---

## Performance Tips

### 1. Minimize State Changes

```typescript
// Bad: Material changes between draws
objects.forEach(obj => {
  obj.material.color.setHex(randomColor); // State change!
  renderer.render(obj);
});

// Good: Group by material
materialGroups.forEach(group => {
  group.objects.forEach(obj => scene.add(obj));
});
```

### 2. Use Instance Colors

```typescript
const mesh = new THREE.InstancedMesh(geo, mat, count);
mesh.instanceColor = new THREE.InstancedBufferAttribute(
  new Float32Array(count * 3), 3
);

// Set per-instance color
const color = new THREE.Color();
color.setHSL(i / count, 0.8, 0.5);
mesh.setColorAt(i, color);
```

### 3. Pre-allocate Batches

```typescript
// Bad: Frequent resizing
instances.push(new Instance()); // May reallocate

// Good: Pre-allocate
const mesh = new THREE.InstancedMesh(geo, mat, MAX_COUNT);
mesh.count = currentCount; // Just update visible count
```

---

## Quick Reference

| Technique | Draw Calls | Dynamic | Mixed Geometry | Complexity |
|-----------|-----------|---------|----------------|------------|
| Individual | N | ✅ | ✅ | Low |
| InstancedMesh | 1 | ✅ | ❌ | Medium |
| Merged | 1 | ❌ | ✅ | Medium |
| BatchedMesh | 1 | ✅ | ✅ | High |

---

## Dependencies

- `@3lens/core` - Core devtool probe
- `@3lens/overlay` - Floating overlay UI
- `three` - Three.js library (r159+ for BatchedMesh)

