# Large Scene Optimization Example

This example demonstrates various optimization techniques for rendering large Three.js scenes with thousands of objects, and how to use **3Lens** to measure their performance impact.

## 🚀 Running the Example

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-large-scene-optimization dev

# Or from this directory
pnpm install
pnpm dev
```

Then open http://localhost:3012

## ⚡ Optimization Techniques Demonstrated

### 1. GPU Instancing

Renders multiple copies of the same geometry with a single draw call.

| Without Instancing | With Instancing |
|-------------------|-----------------|
| 1000 draw calls for 1000 objects | 6 draw calls for 1000 objects |
| High CPU overhead | Minimal CPU overhead |
| Each object can be unique | Objects share geometry |

```javascript
// Instead of 1000 separate meshes:
const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000);

// Set position/rotation/scale per instance:
const dummy = new THREE.Object3D();
for (let i = 0; i < 1000; i++) {
  dummy.position.set(x, y, z);
  dummy.updateMatrix();
  instancedMesh.setMatrixAt(i, dummy.matrix);
}
```

**Trade-offs:**
- ✅ Dramatically reduces draw calls
- ✅ Excellent for forests, crowds, particles
- ❌ All instances must share the same geometry
- ❌ Per-instance animation is more complex

### 2. Frustum Culling

Skips rendering objects that are outside the camera's view.

```javascript
// Enabled by default in Three.js
mesh.frustumCulled = true;

// Disable for objects that should always render
skybox.frustumCulled = false;
```

**Trade-offs:**
- ✅ Zero cost for off-screen objects
- ✅ Automatic in Three.js
- ❌ CPU cost to check each object
- ❌ Less effective for densely packed scenes

### 3. Level of Detail (LOD)

Uses simpler geometry for distant objects.

```javascript
const lod = new THREE.LOD();

// High detail for close range (< 30 units)
lod.addLevel(highDetailMesh, 0);

// Medium detail for mid range (30-60 units)
lod.addLevel(mediumDetailMesh, 30);

// Low detail for far range (> 60 units)
lod.addLevel(lowDetailMesh, 60);

// Update in render loop
lod.update(camera);
```

**Trade-offs:**
- ✅ Fewer triangles for distant objects
- ✅ Smooth visual quality preservation
- ❌ Requires creating multiple geometry versions
- ❌ Memory overhead for storing LOD levels
- ❌ Potential "popping" during transitions

### 4. Static Batching

Merges multiple static geometries into a single draw call.

```javascript
// Merge multiple geometries
const mergedGeometry = BufferGeometryUtils.mergeGeometries([
  geometry1,
  geometry2,
  geometry3
]);

const batchedMesh = new THREE.Mesh(mergedGeometry, sharedMaterial);
```

**Trade-offs:**
- ✅ Single draw call for many objects
- ✅ Works with different geometry types
- ❌ Objects must share the same material
- ❌ Cannot animate individual objects
- ❌ No per-object frustum culling
- ❌ Higher memory usage

## 📊 Performance Metrics to Watch

| Metric | Description | Target |
|--------|-------------|--------|
| **FPS** | Frames per second | 60+ for smooth animation |
| **Draw Calls** | Number of GPU draw operations | Lower is better |
| **Triangles** | Total rendered triangles | Depends on GPU capability |
| **Frame Time** | Time to render one frame | < 16.6ms for 60 FPS |

## 🎮 Preset Configurations

### 🐌 Worst Case
- 2000 individual objects
- All optimizations disabled
- High geometry detail
- Shadows enabled
- **Expected: Poor performance (< 30 FPS)**

### 🚀 Best Case
- 2000 objects with instancing
- Frustum culling enabled
- Medium geometry detail
- Shadows disabled
- **Expected: Excellent performance (60 FPS)**

### ⚖️ Balanced
- 1000 objects with LOD
- Frustum culling enabled
- Medium geometry detail
- **Expected: Good performance (60 FPS)**

### 🔥 Stress Test
- 10000 objects with instancing
- Low geometry detail
- **Expected: Tests your GPU limits**

## 🛠️ Optimization Checklist

When optimizing a large scene:

1. **Measure first** - Use 3Lens to identify bottlenecks
2. **Reduce draw calls** - Use instancing or batching for similar objects
3. **Implement LOD** - Especially for complex models
4. **Enable frustum culling** - Default in Three.js, ensure it's not disabled
5. **Optimize geometry** - Reduce polygon count where possible
6. **Limit shadows** - Only essential objects should cast shadows
7. **Use texture atlases** - Reduce material/texture count
8. **Consider occlusion culling** - For indoor/architectural scenes

## 🔍 Using 3Lens for Analysis

1. Press `~` to open the 3Lens panel
2. Check the **Performance** tab for:
   - Frame time breakdown (CPU vs GPU)
   - Draw call count over time
   - Triangle count
3. Use the **Scene** tab to inspect:
   - Object hierarchy
   - Per-object cost analysis
   - Material complexity
4. Check the **Memory** tab for:
   - Geometry memory usage
   - Texture memory usage

## 📈 Expected Results

With 1000 objects on a typical GPU:

| Configuration | Draw Calls | FPS |
|--------------|------------|-----|
| Individual meshes | ~1000 | 30-45 |
| + Frustum culling | ~500-800 | 40-55 |
| With instancing | ~6 | 60 |
| With LOD | ~1000 | 45-55 |
| With batching | ~1 | 60 |

## 🔗 Related Resources

- [Three.js Performance Tips](https://discoverthreejs.com/tips-and-tricks/)
- [GPU Instancing in Three.js](https://threejs.org/docs/#api/en/objects/InstancedMesh)
- [LOD in Three.js](https://threejs.org/docs/#api/en/objects/LOD)

