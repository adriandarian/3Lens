# 3Lens Performance Debugging Example

This example demonstrates how to use 3Lens to identify and diagnose common Three.js performance issues. It provides an interactive "lab" where you can toggle various performance problems on and off while observing their impact in real-time.

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-performance-debugging dev
```

Then open http://localhost:3006 in your browser.

## Performance Issues Demonstrated

### 1. Too Many Draw Calls (HIGH Impact)

**The Problem:** Creates 500 individual mesh objects instead of using instanced rendering.

**Symptoms:**
- Draw calls spike to 500+
- FPS drops significantly
- CPU-bound rendering

**How 3Lens Helps:**
- Performance Panel → Overview shows draw call count
- Scene Panel shows the large number of child objects
- Cost Analysis highlights expensive objects

**Solution:** Use `THREE.InstancedMesh` for repeated geometry.

---

### 2. High Poly Meshes (HIGH Impact)

**The Problem:** Creates spheres with 512 segments (~500K triangles each), when 32 would suffice.

**Symptoms:**
- Triangle count explodes to millions
- GPU-bound rendering
- Slow scene updates

**How 3Lens Helps:**
- Performance Panel → Overview shows triangle count
- Scene Panel → Object inspector shows geometry details
- Memory Panel shows geometry memory usage

**Solution:** Use appropriate LOD levels. 32-64 segments is usually enough for most spheres.

---

### 3. Large Textures (MEDIUM Impact)

**The Problem:** Uses 4096x4096 textures for small cubes where 256x256 would be sufficient.

**Symptoms:**
- GPU memory usage spikes
- Texture loading stalls
- Mobile devices struggle

**How 3Lens Helps:**
- Memory Panel → Textures tab shows texture dimensions and memory
- Resources Panel shows texture creation events
- Configuration rules can warn about oversized textures

**Solution:** Size textures appropriately for their screen space coverage. Use mipmaps.

---

### 4. Excessive Shadows (MEDIUM Impact)

**The Problem:** 8 point lights all casting 2048x2048 shadow maps.

**Symptoms:**
- Shadow map memory explodes (8 × 6 faces × 2048² per light)
- Render time increases with each shadow pass
- Frame rate drops, especially on mobile

**How 3Lens Helps:**
- Memory Panel shows shadow map memory
- Performance Panel → Rendering shows shadow pass timing
- Scene Panel → Lights shows shadow configuration

**Solution:** Limit shadow-casting lights. Use lower resolution for distant lights. Bake static shadows.

---

### 5. Disabled Frustum Culling (LOW Impact)

**The Problem:** Creates 100 spheres spread across a large area with `frustumCulled = false`.

**Symptoms:**
- Objects outside view still consume draw calls
- GPU processes invisible geometry

**How 3Lens Helps:**
- Scene Panel shows objects marked with culling disabled
- Performance Panel shows unexpectedly high draw calls for visible objects

**Solution:** Keep `frustumCulled = true` (default). Only disable for objects that must always render (like skyboxes).

---

### 6. Memory Leak (HIGH Impact)

**The Problem:** Creates new geometries/materials every 100ms without calling `.dispose()`.

**Symptoms:**
- Geometry count continuously increases
- GPU memory grows unbounded
- Eventually crashes or severe slowdown

**How 3Lens Helps:**
- Memory Panel shows growing geometry/material count
- Resources Panel → Lifecycle shows creation without disposal
- Leak Detection alerts for orphaned resources
- Memory trend chart shows growth pattern

**Solution:** Always call `.dispose()` on geometries, materials, and textures when removing objects.

---

## Using 3Lens to Debug

### Step 1: Open the Overlay

Click the 3Lens button in the bottom-right corner of the viewport, or use the keyboard shortcut.

### Step 2: Monitor the Performance Panel

- **Overview Tab:** Watch FPS, draw calls, and triangles
- **Memory Tab:** Track GPU memory, textures, geometries
- **Frames Tab:** See frame-by-frame timing and spikes

### Step 3: Analyze the Scene

- **Scene Panel:** Inspect object hierarchy and properties
- **Cost Analysis:** See which objects are most expensive
- **Bounding Boxes:** Visualize object extents

### Step 4: Check Resources

- **Resources Panel:** See resource lifecycle events
- **Leak Alerts:** Identify orphaned or undisposed resources
- **Memory Trends:** Spot growing memory usage

### Step 5: Use Configuration Rules

Create a `3lens.config.json` to set thresholds:

```json
{
  "rules": [
    {
      "id": "max-triangles",
      "type": "triangles",
      "threshold": 100000,
      "severity": "warning"
    },
    {
      "id": "max-draw-calls",
      "type": "drawCalls", 
      "threshold": 100,
      "severity": "error"
    }
  ]
}
```

---

## Quick Reference

| Issue | Key Metric | 3Lens Location |
|-------|-----------|----------------|
| Too many objects | Draw Calls | Performance → Overview |
| High poly | Triangles | Performance → Overview |
| Large textures | GPU Memory | Memory → Textures |
| Excessive shadows | Shadow Maps | Memory → Render Targets |
| No frustum culling | Wasted draws | Scene → Object Inspector |
| Memory leaks | Geometry count | Memory → Resources |

---

## Dependencies

- `@3lens/core` - Core devtool probe
- `@3lens/overlay` - Floating overlay UI
- `three` - Three.js library

