# Memory Leak Detection Example

This example demonstrates common memory leak patterns in Three.js applications and shows how to use **3Lens** to detect, diagnose, and fix them.

## 🚀 Running the Example

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-memory-leak-detection dev

# Or from this directory
pnpm install
pnpm dev
```

Then open http://localhost:3010

## 🔴 Memory Leak Patterns Demonstrated

### 1. Geometry Leaks

**Problem:** Creating `BufferGeometry` objects without calling `.dispose()` when they're no longer needed.

```javascript
// ❌ BAD - geometry stays in GPU memory
const geometry = new THREE.BoxGeometry(1, 1, 1);
scene.remove(mesh);
// geometry is never disposed!

// ✅ GOOD - properly dispose geometry
scene.remove(mesh);
mesh.geometry.dispose();
```

### 2. Material Leaks

**Problem:** Materials contain shader programs and uniform data that must be explicitly freed.

```javascript
// ❌ BAD - material stays in memory
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
scene.remove(mesh);
// material is never disposed!

// ✅ GOOD - properly dispose material
scene.remove(mesh);
mesh.material.dispose();
```

### 3. Texture Leaks

**Problem:** Textures are the most memory-intensive resources. A single 4K texture can use 64MB+ of GPU memory.

```javascript
// ❌ BAD - texture stays in GPU memory
const texture = new THREE.CanvasTexture(canvas);
material.map = newTexture;
// old texture is never disposed!

// ✅ GOOD - dispose old texture before replacing
const oldTexture = material.map;
material.map = newTexture;
oldTexture?.dispose();
```

### 4. Event Listener Leaks

**Problem:** Event listeners create closures that can hold references to large objects.

```javascript
// ❌ BAD - listener keeps references alive
const bigData = new Array(100000).fill(1);
window.addEventListener('mousemove', (e) => {
  // bigData stays in memory even if not needed
  console.log(bigData.length);
});

// ✅ GOOD - remove listeners when done
const handler = (e) => { ... };
window.addEventListener('mousemove', handler);
// Later:
window.removeEventListener('mousemove', handler);
```

## 📊 How 3Lens Detects Leaks

3Lens monitors your Three.js application for several leak patterns:

| Detection Type | Description |
|---------------|-------------|
| **Orphaned Resources** | Resources that exist but aren't attached to any scene object |
| **Undisposed Resources** | Resources removed from scene but not `.dispose()`d within N frames |
| **Memory Growth** | Rapid increase in memory usage over time |
| **Resource Accumulation** | Too many resources of the same type being created without cleanup |

### Viewing Leak Alerts

1. Press `~` to open the 3Lens panel
2. Navigate to the **Resources** tab
3. View the **Leak Alerts** section for active warnings
4. Check **Orphaned Resources** for resources not attached to the scene

## 🛠️ Best Practices

### Always Dispose Resources

```javascript
function cleanup(mesh) {
  // Remove from scene
  scene.remove(mesh);
  
  // Dispose geometry
  if (mesh.geometry) {
    mesh.geometry.dispose();
  }
  
  // Dispose material(s)
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => {
        disposeMaterial(m);
      });
    } else {
      disposeMaterial(mesh.material);
    }
  }
}

function disposeMaterial(material) {
  // Dispose all texture maps
  const textureKeys = [
    'map', 'normalMap', 'roughnessMap', 'metalnessMap',
    'aoMap', 'emissiveMap', 'alphaMap', 'envMap',
    'lightMap', 'bumpMap', 'displacementMap'
  ];
  
  for (const key of textureKeys) {
    if (material[key]) {
      material[key].dispose();
    }
  }
  
  material.dispose();
}
```

### Use Resource Pools

```javascript
// Reuse geometries instead of creating new ones
const geometryPool = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(0.5, 32, 32),
  // ...
};

// Reuse the same geometry for multiple meshes
const mesh = new THREE.Mesh(geometryPool.box, material);
```

### Track Resource Creation

```javascript
// Use 3Lens to monitor resource creation
probe.onResourceCreated((event) => {
  console.log(`Created ${event.resourceType}: ${event.resourceId}`);
});

probe.onResourceDisposed((event) => {
  console.log(`Disposed ${event.resourceType}: ${event.resourceId}`);
});
```

## 🧹 Cleanup Checklist

When removing objects from your scene:

- [ ] Remove object from scene/parent
- [ ] Dispose all geometries
- [ ] Dispose all materials
- [ ] Dispose all textures (maps)
- [ ] Remove event listeners
- [ ] Clear any intervals/timeouts
- [ ] Remove from any arrays/maps holding references

## 📈 Monitoring Memory

The example includes a real-time stats display showing:

- Current counts of leaked resources
- Orphaned resource count (from 3Lens)
- Active leak alerts (from 3Lens)
- JS Heap size (Chrome only)

Use the "Chaos Mode" button to rapidly create leaks and observe how quickly memory grows!

## 🔗 Related

- [Three.js Memory Management](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects)
- [3Lens Leak Detection API](../../packages/core/README.md)

