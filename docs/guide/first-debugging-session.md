# Your First Debugging Session

This guide walks you through a realistic debugging session using 3Lens. You'll learn how to identify and fix common Three.js performance and rendering issues.

## Scenario: The Slow Scene

Imagine you've built a 3D product viewer, but it's running at 15 FPS instead of 60. Let's use 3Lens to find and fix the problem.

## Setup

First, ensure 3Lens is connected to your scene:

```typescript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

// Your existing scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const renderer = new THREE.WebGLRenderer();

// Add 3Lens devtools
const probe = createProbe({ debug: true });
probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setThreeReference(THREE);
bootstrapOverlay(probe);

// Your render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

## Step 1: Check the Performance Panel

Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac) to open the overlay if it's not visible.

Look at the **Performance** section:

```
┌─────────────────────────────────────┐
│ Performance                         │
├─────────────────────────────────────┤
│ FPS: 15 ⚠️                          │
│ Frame Time: 66.7ms                  │
│ Draw Calls: 847 🔴                  │
│ Triangles: 2.4M                     │
│ Memory: 342 MB                      │
└─────────────────────────────────────┘
```

::: warning Red Flags
- **FPS below 30** indicates serious performance issues
- **847 draw calls** is very high - aim for under 100
- **2.4M triangles** is substantial but not necessarily the problem
:::

## Step 2: Identify the Draw Call Problem

Click on **"Draw Calls: 847"** to expand the breakdown:

```
Draw Calls by Type:
├── Mesh: 823 calls
├── Sprite: 24 calls
└── Line: 0 calls

Top Draw Call Sources:
├── ProductParts (group): 800 calls
├── UIElements (group): 23 calls
└── Background (mesh): 24 calls
```

**Found it!** The `ProductParts` group is making 800 individual draw calls. This usually means:
- Each small part is a separate mesh with its own material
- No geometry merging or instancing is being used

## Step 3: Inspect the Problematic Objects

1. Click the **Inspect** button (or press `I`) to enter inspect mode
2. Click on any part of your product in the 3D view
3. The Scene Hierarchy will highlight and expand to show the selected object

You'll see something like:

```
Scene
└── ProductParts
    ├── screw_001 (Mesh)
    ├── screw_002 (Mesh)
    ├── screw_003 (Mesh)
    ... (800 more items)
```

Click on one of the screws to see its properties:

```
┌─────────────────────────────────────┐
│ screw_001 (Mesh)                    │
├─────────────────────────────────────┤
│ Geometry: ScrewGeometry             │
│ - Vertices: 128                     │
│ - Same as 800 other meshes ⚠️      │
│                                     │
│ Material: MeshStandardMaterial      │
│ - Color: #888888                    │
│ - Same as 800 other meshes ⚠️      │
└─────────────────────────────────────┘
```

3Lens detected that 800 meshes share identical geometry and materials - a perfect case for **instancing**!

## Step 4: Fix with InstancedMesh

Replace the individual meshes with an InstancedMesh:

```typescript
// ❌ Before: 800 individual meshes
for (let i = 0; i < screwPositions.length; i++) {
  const screw = new THREE.Mesh(screwGeometry, screwMaterial);
  screw.position.copy(screwPositions[i]);
  scene.add(screw);
}

// ✅ After: Single instanced mesh
const screwInstanced = new THREE.InstancedMesh(
  screwGeometry, 
  screwMaterial, 
  screwPositions.length
);

const matrix = new THREE.Matrix4();
for (let i = 0; i < screwPositions.length; i++) {
  matrix.setPosition(screwPositions[i]);
  screwInstanced.setMatrixAt(i, matrix);
}
screwInstanced.instanceMatrix.needsUpdate = true;
scene.add(screwInstanced);
```

## Step 5: Verify the Fix

After implementing instancing, check the Performance panel again:

```
┌─────────────────────────────────────┐
│ Performance                         │
├─────────────────────────────────────┤
│ FPS: 58 ✅                          │
│ Frame Time: 17.2ms                  │
│ Draw Calls: 48 ✅                   │
│ Triangles: 2.4M                     │
│ Memory: 298 MB                      │
└─────────────────────────────────────┘
```

**Success!** Draw calls dropped from 847 to 48, and FPS jumped to 58.

---

## Bonus: Finding Other Issues

### Texture Memory Leak

While debugging, you notice memory keeps climbing. Check the **Textures** section:

```
Textures (247 loaded, 892 MB)
├── product_diffuse.jpg (4096x4096) - 64 MB
├── product_normal.jpg (4096x4096) - 64 MB
├── Unnamed Texture (512x512) - 1 MB [×245]
└──                                 ⚠️ 245 duplicate textures!
```

**Problem:** A texture is being created on every frame or event:

```typescript
// ❌ Bad: Creates new texture each time
function onHover(object) {
  object.material.emissiveMap = new THREE.TextureLoader().load('glow.png');
}
```

**Fix:** Cache and reuse textures:

```typescript
// ✅ Good: Load once, reuse
const glowTexture = new THREE.TextureLoader().load('glow.png');

function onHover(object) {
  object.material.emissiveMap = glowTexture;
}
```

### Overdraw Detection

Enable the **Overdraw** visualization:

1. Click **Visualize** → **Overdraw**
2. Red areas show where pixels are drawn multiple times

If you see a bright red rectangle, you might have overlapping transparent planes. Consider:
- Reducing the number of transparent layers
- Using alpha testing instead of alpha blending
- Implementing order-independent transparency for complex cases

---

## Debugging Checklist

When performance is poor, check these in order:

### 1. Draw Calls (aim for < 100)
- [ ] Merge static geometry with `BufferGeometryUtils.mergeGeometries()`
- [ ] Use InstancedMesh for repeated objects
- [ ] Batch materials where possible

### 2. Triangle Count (depends on GPU, mobile < 500K)
- [ ] Use LOD (Level of Detail) for distant objects
- [ ] Simplify geometry for non-hero objects
- [ ] Enable frustum culling (on by default)

### 3. Texture Memory (watch for leaks)
- [ ] Use appropriate texture sizes (not 4K for small objects)
- [ ] Compress textures (basis, ktx2)
- [ ] Dispose unused textures with `texture.dispose()`

### 4. JavaScript (if GPU time is fine but FPS is low)
- [ ] Profile with Chrome DevTools
- [ ] Move expensive calculations off the main thread
- [ ] Throttle raycasting and physics updates

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + D` | Toggle overlay |
| `I` | Enter/exit inspect mode |
| `F` | Focus selected object |
| `H` | Toggle visibility of selected |
| `W` | Wireframe mode |
| `Escape` | Clear selection |

---

## Next Steps

Now that you've completed your first debugging session:

- [Configuration Deep Dive](/guide/configuration) - Customize 3Lens for your workflow
- [Performance Best Practices](/guides/performance) - Comprehensive optimization guide
- [Custom Rules](/guides/PLUGIN-DEVELOPMENT) - Create project-specific checks

## Related

- [Getting Started](/guide/getting-started) - Basic setup guide
- [Installation Troubleshooting](/guide/installation-troubleshooting) - Common setup issues
