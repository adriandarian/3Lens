# Debugging & Profiling Examples

This guide provides comprehensive walkthroughs for using 3Lens to debug and optimize Three.js applications. Each example demonstrates specific debugging techniques with interactive scenarios.

[[toc]]

## Overview

3Lens provides powerful debugging capabilities for Three.js applications. These examples cover the most common performance and memory issues:

| Example | Focus Area | Key Skills |
|---------|------------|------------|
| [Performance Debugging](#performance-debugging) | FPS, draw calls, triangles | Identifying bottlenecks |
| [Memory Leak Detection](#memory-leak-detection) | Resource lifecycle | Proper disposal patterns |
| [Shader Debugging](#shader-debugging) | GLSL errors, uniforms | Live shader editing |
| [Large Scene Optimization](#large-scene-optimization) | Instancing, LOD, culling | Scaling techniques |

---

## Performance Debugging

This example provides an interactive "performance lab" where you can toggle various performance problems on and off while observing their impact in real-time through 3Lens.

### Features Demonstrated

- **Real-time metrics**: FPS, draw calls, triangle count monitoring
- **Cost analysis**: Identifying expensive objects in the scene
- **Frame timing**: Per-frame performance breakdown
- **Configuration rules**: Automatic threshold warnings

### Quick Start

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-performance-debugging dev
```

Open http://localhost:3006 in your browser.

### Project Structure

```
performance-debugging/
├── src/
│   └── main.ts          # Interactive performance issues
├── index.html           # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Performance Issues Demonstrated

#### Issue 1: Too Many Draw Calls (HIGH Impact)

**The Problem:** Creating 500 individual mesh objects instead of using instanced rendering.

```typescript
// ❌ BAD - Creates 500 draw calls
for (let i = 0; i < 500; i++) {
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(Math.random() * 30, 0, Math.random() * 30);
  scene.add(cube);
}
```

```typescript
// ✅ GOOD - Single draw call with instancing
const instancedMesh = new THREE.InstancedMesh(geometry, material, 500);
const dummy = new THREE.Object3D();

for (let i = 0; i < 500; i++) {
  dummy.position.set(Math.random() * 30, 0, Math.random() * 30);
  dummy.updateMatrix();
  instancedMesh.setMatrixAt(i, dummy.matrix);
}
scene.add(instancedMesh);
```

**Symptoms:**
- Draw calls spike to 500+
- FPS drops significantly
- CPU-bound rendering

**How 3Lens Helps:**
1. **Performance Panel → Overview** shows draw call count
2. **Scene Panel** shows the large number of child objects
3. **Cost Analysis** highlights expensive objects

---

#### Issue 2: High Poly Meshes (HIGH Impact)

**The Problem:** Using spheres with 512 segments (~500K triangles each) when 32 would suffice.

```typescript
// ❌ BAD - Way too many segments
const geometry = new THREE.SphereGeometry(1, 512, 512);
// Creates ~500,000 triangles per sphere!
```

```typescript
// ✅ GOOD - Appropriate detail level
const geometry = new THREE.SphereGeometry(1, 32, 32);
// Creates ~1,800 triangles - usually sufficient
```

**Symptoms:**
- Triangle count explodes to millions
- GPU-bound rendering
- Slow scene updates

**How 3Lens Helps:**
1. **Performance Panel → Overview** shows triangle count
2. **Scene Panel → Object Inspector** shows geometry details
3. **Memory Panel** shows geometry memory usage

---

#### Issue 3: Large Textures (MEDIUM Impact)

**The Problem:** Using 4096×4096 textures for small cubes where 256×256 would be sufficient.

**Symptoms:**
- GPU memory usage spikes
- Texture loading stalls
- Mobile devices struggle

**How 3Lens Helps:**
1. **Memory Panel → Textures** shows texture dimensions and memory
2. **Resources Panel** shows texture creation events
3. **Configuration rules** can warn about oversized textures

**Solution:** Size textures appropriately for their screen space coverage. Use mipmaps.

---

#### Issue 4: Excessive Shadows (MEDIUM Impact)

**The Problem:** 8 point lights all casting 2048×2048 shadow maps.

**Memory Impact:**
- 8 lights × 6 faces × 2048² × 4 bytes ≈ **800 MB** of shadow maps!

**How 3Lens Helps:**
1. **Memory Panel** shows shadow map memory
2. **Performance Panel → Rendering** shows shadow pass timing
3. **Scene Panel → Lights** shows shadow configuration

**Solutions:**
- Limit shadow-casting lights (2-3 max)
- Use lower resolution for distant lights
- Bake static shadows into textures

---

#### Issue 5: Disabled Frustum Culling (LOW Impact)

**The Problem:** Creating 100 spheres spread across a large area with `frustumCulled = false`.

```typescript
// ❌ BAD - Objects outside view still render
mesh.frustumCulled = false;
```

```typescript
// ✅ GOOD - Default behavior, objects outside view are skipped
mesh.frustumCulled = true; // Default
```

**How 3Lens Helps:**
1. **Scene Panel** shows objects with culling disabled
2. **Performance Panel** shows unexpectedly high draw calls

---

#### Issue 6: Memory Leak (HIGH Impact)

**The Problem:** Creating new geometries/materials every 100ms without calling `.dispose()`.

**Symptoms:**
- Geometry count continuously increases
- GPU memory grows unbounded
- Eventually crashes or severe slowdown

**How 3Lens Helps:**
1. **Memory Panel** shows growing geometry/material count
2. **Resources Panel → Lifecycle** shows creation without disposal
3. **Leak Detection** alerts for orphaned resources
4. **Memory trend chart** shows growth pattern

---

### Step-by-Step Debugging Workflow

#### Step 1: Open the Overlay

Press `~` or click the 3Lens button in the bottom-right corner.

#### Step 2: Monitor Performance Panel

```
┌─────────────────────────────────────┐
│ Performance Overview                │
├─────────────────────────────────────┤
│ FPS:        60 → 23 ⚠️              │
│ Draw Calls: 12 → 512 ⚠️             │
│ Triangles:  50K → 2.3M ⚠️           │
│ Frame Time: 2ms → 43ms ⚠️           │
└─────────────────────────────────────┘
```

#### Step 3: Identify Expensive Objects

Navigate to **Scene Panel → Cost Analysis** to see which objects contribute most to render time.

#### Step 4: Check Resources

Open **Resources Panel** to see resource lifecycle events and identify orphaned or undisposed resources.

#### Step 5: Use Configuration Rules

Create a `3lens.config.json` to set thresholds:

```json
{
  "rules": {
    "maxDrawCalls": {
      "threshold": 100,
      "severity": "warning"
    },
    "maxTriangles": {
      "threshold": 500000,
      "severity": "warning"
    },
    "maxTextureSize": {
      "threshold": 2048,
      "severity": "info"
    }
  }
}
```

---

## Memory Leak Detection

This example demonstrates common memory leak patterns in Three.js applications and shows how to detect, diagnose, and fix them using 3Lens.

### Features Demonstrated

- **Resource lifecycle tracking**: Creation, attachment, disposal events
- **Orphaned resource detection**: Resources not attached to scene
- **Memory trend analysis**: Visualize memory growth over time
- **Leak alerts**: Real-time warnings for detected leaks

### Quick Start

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-memory-leak-detection dev
```

Open http://localhost:3010 in your browser.

### Project Structure

```
memory-leak-detection/
├── src/
│   └── main.ts          # Interactive leak scenarios
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Memory Leak Patterns

#### Pattern 1: Geometry Leaks

**Problem:** Creating `BufferGeometry` objects without calling `.dispose()`.

::: code-group
```typescript [❌ BAD]
// Geometry stays in GPU memory forever
const geometry = new THREE.BoxGeometry(1, 1, 1);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Later, removing from scene but NOT disposing
scene.remove(mesh);
// geometry is never disposed!
```

```typescript [✅ GOOD]
// Properly dispose geometry when done
scene.remove(mesh);
mesh.geometry.dispose();
```
:::

---

#### Pattern 2: Material Leaks

**Problem:** Materials contain shader programs and uniform data that must be explicitly freed.

::: code-group
```typescript [❌ BAD]
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
scene.remove(mesh);
// material is never disposed!
```

```typescript [✅ GOOD]
scene.remove(mesh);
mesh.material.dispose();
```
:::

---

#### Pattern 3: Texture Leaks

**Problem:** Textures are the most memory-intensive resources. A single 4K texture can use **64MB+** of GPU memory.

::: code-group
```typescript [❌ BAD]
// Old texture stays in GPU memory
const texture = new THREE.CanvasTexture(canvas);
material.map = newTexture;
// Old texture is never disposed!
```

```typescript [✅ GOOD]
const oldTexture = material.map;
material.map = newTexture;
oldTexture?.dispose();
```
:::

---

#### Pattern 4: Event Listener Leaks

**Problem:** Event listeners create closures that can hold references to large objects.

::: code-group
```typescript [❌ BAD]
const bigData = new Array(100000).fill(1);
window.addEventListener('mousemove', (e) => {
  // bigData stays in memory even if not needed
  console.log(bigData.length);
});
```

```typescript [✅ GOOD]
const handler = (e: MouseEvent) => { /* ... */ };
window.addEventListener('mousemove', handler);

// Later, when component unmounts:
window.removeEventListener('mousemove', handler);
```
:::

---

### How 3Lens Detects Leaks

| Detection Type | Description |
|---------------|-------------|
| **Orphaned Resources** | Resources that exist but aren't attached to any scene object |
| **Undisposed Resources** | Resources removed from scene but not `.dispose()`d within N frames |
| **Memory Growth** | Rapid increase in memory usage over time |
| **Resource Accumulation** | Too many resources of the same type being created without cleanup |

---

### Complete Cleanup Pattern

```typescript
/**
 * Properly dispose of a mesh and all its resources
 */
function disposeMesh(mesh: THREE.Mesh): void {
  // 1. Remove from scene
  mesh.parent?.remove(mesh);
  
  // 2. Dispose geometry
  mesh.geometry?.dispose();
  
  // 3. Dispose material(s)
  if (Array.isArray(mesh.material)) {
    mesh.material.forEach(disposeMaterial);
  } else if (mesh.material) {
    disposeMaterial(mesh.material);
  }
}

/**
 * Dispose a material and all its textures
 */
function disposeMaterial(material: THREE.Material): void {
  // Dispose all possible texture maps
  const textureKeys = [
    'map', 'normalMap', 'roughnessMap', 'metalnessMap',
    'aoMap', 'emissiveMap', 'alphaMap', 'envMap',
    'lightMap', 'bumpMap', 'displacementMap', 'specularMap',
    'gradientMap', 'transmissionMap', 'thicknessMap'
  ] as const;
  
  for (const key of textureKeys) {
    const texture = (material as any)[key];
    if (texture instanceof THREE.Texture) {
      texture.dispose();
    }
  }
  
  material.dispose();
}

/**
 * Recursively dispose an entire object tree
 */
function disposeObject(object: THREE.Object3D): void {
  // Dispose children first (bottom-up)
  while (object.children.length > 0) {
    disposeObject(object.children[0]);
  }
  
  // Dispose this object
  if (object instanceof THREE.Mesh) {
    disposeMesh(object);
  }
  
  object.parent?.remove(object);
}
```

---

### Using Resource Pools

For frequently created/destroyed objects, use a pool:

```typescript
class GeometryPool {
  private available: THREE.BufferGeometry[] = [];
  private inUse = new Set<THREE.BufferGeometry>();
  
  constructor(private factory: () => THREE.BufferGeometry) {}
  
  acquire(): THREE.BufferGeometry {
    const geometry = this.available.pop() ?? this.factory();
    this.inUse.add(geometry);
    return geometry;
  }
  
  release(geometry: THREE.BufferGeometry): void {
    if (this.inUse.delete(geometry)) {
      this.available.push(geometry);
    }
  }
  
  dispose(): void {
    [...this.available, ...this.inUse].forEach(g => g.dispose());
    this.available = [];
    this.inUse.clear();
  }
}

// Usage
const spherePool = new GeometryPool(
  () => new THREE.SphereGeometry(1, 32, 32)
);

const geometry = spherePool.acquire();
// ... use geometry ...
spherePool.release(geometry);
```

---

## Shader Debugging

This example demonstrates how to debug custom GLSL shaders in Three.js, including live editing, error detection, and uniform inspection.

### Features Demonstrated

- **Live shader editing**: Modify GLSL code and see changes instantly
- **Error detection**: Parse and display GLSL compilation errors
- **Uniform inspection**: View and modify uniform values in real-time
- **Shader gallery**: Multiple shader examples demonstrating different techniques

### Quick Start

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-shader-debugging dev
```

Open http://localhost:3013 in your browser.

### Project Structure

```
shader-debugging/
├── src/
│   └── main.ts          # Shader gallery with live editing
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Shader Gallery

| Shader | Type | Description |
|--------|------|-------------|
| **Simple Gradient** | Fragment | UV-based color interpolation |
| **Animated Wave** | Vertex | Sine wave displacement animation |
| **Fresnel Effect** | Both | View-dependent edge glow |
| **Procedural Noise** | Fragment | FBM noise generation |
| **Hologram Effect** | Both | Sci-fi scanlines and glitch |
| **Toon Shading** | Fragment | Cel-shaded lighting |

---

### Common Shader Errors

#### Vertex Shader Errors

```glsl
// ❌ Missing semicolon
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)

// ❌ Undefined variable
gl_Position = projectionMatrix * modelViewMatrix * vec4(undefinedVar, 1.0);

// ❌ Type mismatch (vec3 instead of vec4)
gl_Position = projectionMatrix * modelViewMatrix * position;
```

#### Fragment Shader Errors

```glsl
// ❌ Missing semicolon
gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0)

// ❌ Undefined varying
gl_FragColor = vec4(vUndefined, 1.0);

// ❌ Wrong component count
gl_FragColor = vec3(1.0, 0.0, 0.0);  // Should be vec4
```

---

### Debugging Tips

#### 1. Check Variable Types

GLSL is strictly typed. Common mismatches:

```glsl
// Position needs to be vec4 for matrix multiplication
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//                                                 ^^^^^^^^^^^^^^^^^^^^
// NOT: gl_Position = projectionMatrix * modelViewMatrix * position;
```

#### 2. Validate Varying Names

Varyings must be declared identically in both shaders:

```glsl
// Vertex shader
varying vec2 vUv;

// Fragment shader - must match exactly!
varying vec2 vUv;  // ✅ Correct
varying vec2 vUV;  // ❌ Case mismatch - won't work!
```

#### 3. Check Uniform Declarations

Uniforms must match the JavaScript values:

```typescript
// JavaScript
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0.0 },
    uColor: { value: new THREE.Color(0xff0000) },
    uResolution: { value: new THREE.Vector2(800, 600) }
  },
  // ...
});
```

```glsl
// GLSL - types must match
uniform float uTime;      // ✅ matches number
uniform vec3 uColor;      // ✅ matches Color (RGB)
uniform vec2 uResolution; // ✅ matches Vector2
```

#### 4. Use Fallback Values

Prevent NaN/Infinity with safe math:

```glsl
// ✅ Avoid division by zero
float result = numerator / max(denominator, 0.001);

// ✅ Clamp to valid range
color = clamp(color, 0.0, 1.0);

// ✅ Normalize vectors
vec3 dir = normalize(direction + vec3(0.0001)); // Prevent zero vector
```

---

### Example: Fresnel Effect Shader

A complete shader demonstrating view-dependent edge glow:

::: code-group
```glsl [Vertex Shader]
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
```

```glsl [Fragment Shader]
uniform vec3 uColor;
uniform float uFresnelPower;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  
  // Fresnel effect - brighter at edges
  float fresnel = pow(1.0 - abs(dot(viewDir, normal)), uFresnelPower);
  
  vec3 color = mix(uColor * 0.3, uColor, fresnel);
  gl_FragColor = vec4(color, 1.0);
}
```

```typescript [JavaScript Setup]
const material = new THREE.ShaderMaterial({
  uniforms: {
    uColor: { value: new THREE.Color(0x00ffff) },
    uFresnelPower: { value: 2.0 }
  },
  vertexShader: vertexShaderCode,
  fragmentShader: fragmentShaderCode,
});
```
:::

---

### Using 3Lens for Shader Analysis

1. Press `~` to open the 3Lens panel
2. Navigate to **Scene** tab
3. Select the shader mesh object
4. View material properties including:
   - Shader type (`ShaderMaterial`)
   - Uniform values (editable!)
   - Texture bindings

---

## Large Scene Optimization

This example demonstrates various optimization techniques for rendering large Three.js scenes with thousands of objects.

### Features Demonstrated

- **GPU Instancing**: Render thousands of objects with minimal draw calls
- **Frustum Culling**: Skip rendering off-screen objects
- **Level of Detail (LOD)**: Reduce geometry complexity for distant objects
- **Static Batching**: Merge multiple geometries into single draw calls

### Quick Start

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-large-scene-optimization dev
```

Open http://localhost:3012 in your browser.

### Project Structure

```
large-scene-optimization/
├── src/
│   └── main.ts          # Optimization comparison demo
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Optimization Techniques

#### Technique 1: GPU Instancing

Renders multiple copies of the same geometry with a single draw call.

| Without Instancing | With Instancing |
|-------------------|-----------------|
| 1000 draw calls for 1000 objects | 1 draw call for 1000 objects |
| High CPU overhead | Minimal CPU overhead |
| Each object fully independent | Objects share geometry |

```typescript
// Create instanced mesh for 1000 objects
const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000);
instancedMesh.name = 'InstancedForest';

const dummy = new THREE.Object3D();
const color = new THREE.Color();

for (let i = 0; i < 1000; i++) {
  // Set transform per instance
  dummy.position.set(
    (Math.random() - 0.5) * 100,
    0,
    (Math.random() - 0.5) * 100
  );
  dummy.rotation.y = Math.random() * Math.PI * 2;
  dummy.scale.setScalar(0.5 + Math.random() * 0.5);
  dummy.updateMatrix();
  instancedMesh.setMatrixAt(i, dummy.matrix);
  
  // Set color per instance (optional)
  color.setHSL(0.3 + Math.random() * 0.1, 0.7, 0.5);
  instancedMesh.setColorAt(i, color);
}

instancedMesh.instanceMatrix.needsUpdate = true;
instancedMesh.instanceColor!.needsUpdate = true;

scene.add(instancedMesh);
```

**Trade-offs:**
- ✅ Dramatically reduces draw calls
- ✅ Excellent for forests, crowds, particles
- ❌ All instances must share the same geometry
- ❌ Per-instance animation requires matrix updates

---

#### Technique 2: Frustum Culling

Skips rendering objects that are outside the camera's view.

```typescript
// Enabled by default in Three.js
mesh.frustumCulled = true;

// Only disable for special cases (skyboxes, screen-space effects)
skybox.frustumCulled = false;
```

**Trade-offs:**
- ✅ Zero render cost for off-screen objects
- ✅ Automatic in Three.js
- ❌ Small CPU cost to check each object
- ❌ Less effective for densely packed scenes

---

#### Technique 3: Level of Detail (LOD)

Uses simpler geometry for distant objects.

```typescript
const lod = new THREE.LOD();
lod.name = 'TreeLOD';

// High detail: < 30 units from camera
const highDetail = createTree(64, 64); // High-poly
lod.addLevel(highDetail, 0);

// Medium detail: 30-60 units
const mediumDetail = createTree(16, 16); // Medium-poly
lod.addLevel(mediumDetail, 30);

// Low detail: > 60 units
const lowDetail = createTree(6, 6); // Low-poly
lod.addLevel(lowDetail, 60);

scene.add(lod);

// Update in render loop
function animate() {
  lod.update(camera); // Switches LOD level based on distance
  renderer.render(scene, camera);
}
```

**Trade-offs:**
- ✅ Fewer triangles for distant objects
- ✅ Maintains visual quality up close
- ❌ Requires creating multiple geometry versions
- ❌ Memory overhead for storing LOD levels
- ❌ Potential "popping" during transitions

---

#### Technique 4: Static Batching

Merges multiple static geometries into a single draw call.

```typescript
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Collect geometries to merge
const geometries: THREE.BufferGeometry[] = [];

for (let i = 0; i < 100; i++) {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  
  // Apply transform to geometry (not mesh!)
  geo.translate(
    (Math.random() - 0.5) * 50,
    0.5,
    (Math.random() - 0.5) * 50
  );
  
  geometries.push(geo);
}

// Merge into single geometry
const mergedGeometry = mergeGeometries(geometries, false);

// Dispose individual geometries
geometries.forEach(g => g.dispose());

// Single mesh, single draw call
const batchedMesh = new THREE.Mesh(mergedGeometry, sharedMaterial);
batchedMesh.name = 'BatchedBuildings';
scene.add(batchedMesh);
```

**Trade-offs:**
- ✅ Single draw call for many objects
- ✅ Works with different geometry shapes
- ❌ Objects must share the same material
- ❌ Cannot animate individual objects
- ❌ No per-object frustum culling
- ❌ Higher memory usage (merged geometry)

---

### Performance Metrics to Watch

| Metric | Description | Target |
|--------|-------------|--------|
| **FPS** | Frames per second | 60+ for smooth animation |
| **Draw Calls** | Number of GPU draw operations | < 100 for most scenes |
| **Triangles** | Total rendered triangles | < 1M for mid-range GPUs |
| **Frame Time** | Time to render one frame | < 16.6ms for 60 FPS |

---

### Preset Configurations

#### 🐌 Worst Case
- 2000 individual objects
- All optimizations disabled
- High geometry detail (512 segments)
- Shadows enabled on all objects
- **Expected: Poor performance (< 30 FPS)**

#### 🚀 Best Case
- 2000 objects with GPU instancing
- Frustum culling enabled
- Medium geometry detail (32 segments)
- Shadows disabled
- **Expected: Excellent performance (60 FPS)**

#### ⚖️ Balanced
- 1000 objects with LOD
- Frustum culling enabled
- Mixed geometry detail
- Limited shadow casters
- **Expected: Good performance (60 FPS)**

#### 🔥 Stress Test
- 10000 objects with instancing
- Frustum culling enabled
- Low geometry detail
- **Expected: Tests GPU limits**

---

### Decision Tree: Which Optimization to Use?

```
Are all objects the same geometry?
├─ YES → Use GPU Instancing
│        (Best for forests, particles, crowds)
│
└─ NO → Are objects static (don't move)?
         ├─ YES → Use Static Batching
         │        (Best for buildings, terrain features)
         │
         └─ NO → Do objects vary by distance?
                  ├─ YES → Use LOD
                  │        (Best for large detailed objects)
                  │
                  └─ NO → Ensure Frustum Culling is enabled
                          (Default behavior)
```

---

## Running All Examples

To run all debugging examples:

```bash
# From the monorepo root
pnpm install
pnpm dev
```

| Example | Port | URL |
|---------|------|-----|
| Performance Debugging | 3006 | http://localhost:3006 |
| Memory Leak Detection | 3010 | http://localhost:3010 |
| Large Scene Optimization | 3012 | http://localhost:3012 |
| Shader Debugging | 3013 | http://localhost:3013 |

---

## See Also

- [Performance Debugging Guide](/guides/PERFORMANCE-DEBUGGING-GUIDE) - Deep dive into performance analysis
- [Memory Profiling Guide](/guides/MEMORY-PROFILING-GUIDE) - Comprehensive memory management
- [Shader Debugging Guide](/guides/SHADER-DEBUGGING-GUIDE) - Advanced GLSL debugging
- [Large Scene Optimization Guide](/guides/LARGE-SCENE-OPTIMIZATION-GUIDE) - Scaling techniques
- [Framework Integration Examples](/examples/framework-integration) - Framework-specific setup
- [Code Examples](/examples/code-examples) - Copy-paste code snippets
