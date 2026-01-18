# Performance Debugging Example

A hands-on lab for diagnosing common Three.js performance issues using 3Lens.

## What This Example Shows

This example creates a test environment where you can toggle various performance anti-patterns:

- **Too Many Draw Calls**: 500 individual meshes vs. instancing
- **High Poly Meshes**: 512-segment spheres (~500K triangles each)
- **Large Textures**: 4K textures on small objects
- **Excessive Shadows**: 8 point lights with 2K shadow maps
- **Disabled Frustum Culling**: Objects rendered even when off-screen
- **Memory Leak**: Geometries created without disposal

Enable each issue and use 3Lens to observe and diagnose the impact.

## Using 3Lens to Debug This

### Opening 3Lens

The 3Lens overlay is automatically initialized. Click the floating button or use the keyboard shortcut to open it.

### Recommended Workflow

1. **Start with baseline**: Open 3Lens and note the Performance stats (FPS, draw calls, triangles)
2. **Enable an issue**: Toggle one of the checkboxes on the left panel
3. **Observe impact**: Watch the Performance panel in 3Lens update
4. **Explore details**: Use Scene Explorer to find the problematic objects
5. **Disable and compare**: Turn off the issue to confirm it was the cause

### Key Panels to Use

**Performance Stats**
- FPS counter shows frame rate impact
- Draw calls increase with "Too Many Objects"
- Triangle count spikes with "High Poly Meshes"
- Memory usage grows with "Large Textures" and "Memory Leak"

**Scene Explorer**
- Find the issue groups (e.g., `TooManyObjects_Group`, `HighPoly_Group`)
- See child count for object explosion issues
- Check `frustumCulled` property on objects

**Entities Panel**
Each issue is registered as a logical entity:
- `issue-too-many-objects`: Draw call problem
- `issue-high-poly`: Triangle count problem
- `issue-large-textures`: VRAM problem
- `issue-shadow-quality`: Shadow map problem
- `issue-no-frustum-culling`: Culling problem
- `issue-memory-leak`: Resource disposal problem

### What to Look For

| Issue | What Changes in 3Lens |
|-------|----------------------|
| Too Many Objects | Draw calls: 10 → 510+ |
| High Poly | Triangles: 5K → 5M+ |
| Large Textures | Texture memory spikes |
| Excessive Shadows | Shadow map count & memory |
| No Frustum Culling | Draw calls stay high when looking away |
| Memory Leak | Geometry count continuously grows |

## Performance Issue Details

### Issue 1: Too Many Draw Calls

Creates 500 individual cubes. Each mesh = 1 draw call.

**3Lens diagnosis**: Performance → Draw Calls jumps from ~10 to 510+

**Fix**: Use `THREE.InstancedMesh` for repeated geometry

### Issue 2: High Poly Meshes

Creates 10 spheres with 512×512 segments (~500K triangles each = 5M total).

**3Lens diagnosis**: Performance → Triangles jumps from ~5K to 5M+

**Fix**: Use 32-64 segments for spheres. Implement LOD for detail at distance.

### Issue 3: Large Textures

Creates 5 cubes with 4096×4096 canvas textures (~80MB VRAM total).

**3Lens diagnosis**: Memory panel shows texture VRAM spike

**Fix**: Size textures appropriately. Use compressed formats. Generate mipmaps.

### Issue 4: Excessive Shadows

Adds 8 point lights, each casting shadows with 2048×2048 shadow maps.

**3Lens diagnosis**: Memory shows shadow map allocations. Each point light = 6 shadow maps (cube faces).

**Fix**: Limit shadow-casting lights. Use lower resolution for distant lights. Bake static shadows.

### Issue 5: No Frustum Culling

Creates 100 spheres spread across 200 units with `frustumCulled = false`.

**3Lens diagnosis**: Draw calls stay high even when objects aren't visible

**Fix**: Keep `frustumCulled = true` (default). Only disable for always-visible objects like skyboxes.

### Issue 6: Memory Leak

Creates new geometry/material every 100ms, removes from scene but doesn't `.dispose()`.

**3Lens diagnosis**: Watch geometry count grow continuously over time

**Fix**: Always call `.dispose()` on geometries, materials, and textures when done.

## Running the Example

```bash
cd examples/debugging-profiling/performance-debugging
pnpm install
pnpm dev
```

Open http://localhost:3006 in your browser.

## Related Examples

- [Memory Leak Detection](../memory-leak-detection/) - Deep dive into leak detection
- [Draw Call Batching](../draw-call-batching/) - Optimizing draw calls
- [Large Scene Optimization](../large-scene-optimization/) - Handling big scenes
