# 3Lens Raycasting Debugger Example

This example demonstrates how to use 3Lens to visualize and debug Three.js raycasting operations. It provides tools to understand ray-object intersections, visualize hit points and normals, and profile raycasting performance.

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-raycasting-debugger dev
```

Then open the URL shown in the terminal (Vite's default port).

## Features

### Ray Modes

1. **Mouse Ray**: Click anywhere in the scene to cast a ray from the camera through that point
2. **Camera Center**: Continuously cast a ray from the camera center (crosshair)
3. **Custom Origin**: Ray from an animated point in space with fixed direction
4. **Multi-Ray Grid**: Cast a 5×5 grid of rays for coverage testing

### Visualization Options

- **Show Ray Line**: Yellow line before hit, red (dimmed) after
- **Show Hit Points**: Green sphere at first hit, orange for subsequent
- **Show Normals**: Cyan arrows showing surface normals at hit points
- **All Intersections**: Show every object the ray passes through
- **Persistent Rays**: Keep previous rays visible for comparison

### Raycast Options

- **Max Distance**: Limit how far rays travel
- **Recursive**: Include children in intersection tests
- **Include Backfaces**: Detect hits on back-facing triangles

## Debugging Scenarios

### 1. Basic Intersection Testing

Click on objects to verify raycasting is working correctly:
- Check if the correct object is reported
- Verify hit distance is accurate
- Confirm normal direction

### 2. Complex Scene Performance

Use the "Scene Complexity" buttons to add objects:

| Button | What it adds | Purpose |
|--------|--------------|---------|
| +100 Cubes | 100 random cubes | Test many small objects |
| +50 Spheres | 50 random spheres | Test curved surfaces |
| Nested Groups | 4-level hierarchy | Test recursive traversal |
| BVH Mesh | High-poly torus knot | Test dense geometry |

Watch the "Raycast Time" stat increase as scene complexity grows.

### 3. Multi-Ray Analysis

Switch to "Multi-Ray Grid" mode to:
- Test hit coverage across the view
- Profile parallel raycasting performance
- Identify gaps in collision detection

### 4. Through-Object Detection

Enable "All Intersections" to see:
- Objects behind the first hit
- Transparent object handling
- Overlapping geometry

## Performance Tips

### Raycast Time Thresholds

| Time | Status | Action |
|------|--------|--------|
| < 1ms | ✅ Good | Normal performance |
| 1-5ms | ⚠️ Warning | Consider optimization |
| > 5ms | ❌ Critical | Needs immediate attention |

### Optimization Strategies

1. **Reduce object count**
   ```typescript
   // Instead of testing all scene objects
   raycaster.intersectObjects(scene.children, true);
   
   // Test only relevant objects
   raycaster.intersectObjects(interactiveObjects, false);
   ```

2. **Use layers for filtering**
   ```typescript
   // Set up layers
   interactiveObject.layers.set(1);
   raycaster.layers.set(1);
   ```

3. **Spatial partitioning**
   - Use Octree for large static scenes
   - BVH (Bounding Volume Hierarchy) for complex meshes
   - three-mesh-bvh library for automatic optimization

4. **Limit ray distance**
   ```typescript
   raycaster.far = 100; // Don't test distant objects
   ```

5. **Throttle raycasts**
   ```typescript
   // Don't raycast every frame
   let lastRaycast = 0;
   function onMouseMove(event) {
     if (performance.now() - lastRaycast < 16) return; // ~60fps max
     lastRaycast = performance.now();
     performRaycast(event);
   }
   ```

## Using with 3Lens

Open the 3Lens overlay (Ctrl+Shift+D) to:

1. **Scene Panel**: Inspect ray visualization objects
2. **Performance Panel**: Monitor frame time impact
3. **Cost Analysis**: See which objects are expensive to raycast

### Debugging Hit Issues

If raycasts aren't hitting expected objects:

1. Check object visibility (`visible` property)
2. Verify object has geometry with proper bounding box
3. Ensure object isn't in a different layer
4. Check if `frustumCulled` is interfering
5. Verify transforms are applied correctly

## Code Examples

### Basic Raycasting

```typescript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  
  if (hits.length > 0) {
    console.log('Hit:', hits[0].object.name, 'at', hits[0].point);
  }
}
```

### Visualizing Ray

```typescript
function visualizeRay(origin, direction, distance) {
  const end = origin.clone().add(direction.clone().multiplyScalar(distance));
  const geometry = new THREE.BufferGeometry().setFromPoints([origin, end]);
  const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
  const line = new THREE.Line(geometry, material);
  scene.add(line);
}
```

### Custom Ray Origin

```typescript
// Ray from arbitrary point in specific direction
const origin = new THREE.Vector3(5, 5, 5);
const direction = new THREE.Vector3(-1, -0.5, -1).normalize();

raycaster.set(origin, direction);
raycaster.far = 100;

const hits = raycaster.intersectObjects(scene.children, true);
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| C | Clear all ray visualizations |
| Ctrl+Shift+D | Toggle 3Lens overlay |

## Further Reading

- [Three.js Raycaster Documentation](https://threejs.org/docs/#api/en/core/Raycaster)
- [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) - BVH acceleration
- [Raycasting Performance Tips](https://threejs.org/docs/#manual/en/introduction/How-to-optimize-raycast-performance)
