# Inspect Mode API

Inspect Mode enables interactive object selection in the 3D viewport. When enabled, users can **click to select** and **hover to highlight** objects directly in the three.js canvas.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      INSPECT MODE                               │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    3D Viewport                            │  │
│  │                                                           │  │
│  │     [Cube] ←── Hover highlight (cyan outline)            │  │
│  │                                                           │  │
│  │           [Sphere] ←── Click to select (yellow outline)  │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ✓ Inspect Mode: ON                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Setup

### 1. Initialize Inspect Mode

```typescript
import { createProbe } from '@3lens/core';
import * as THREE from 'three';

const probe = createProbe({ appName: 'My App' });

// Observe scene and renderer first
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Initialize inspect mode
probe.initializeInspectMode(
  renderer.domElement,  // Canvas element
  camera,               // Active camera
  THREE                 // THREE.js reference
);
```

### 2. Enable/Disable

```typescript
// Enable inspect mode
probe.setInspectModeEnabled(true);

// Disable inspect mode
probe.setInspectModeEnabled(false);

// Check current state
const isEnabled = probe.isInspectModeEnabled();
```

## API Reference

### `initializeInspectMode()`

```typescript
initializeInspectMode(
  canvas: HTMLCanvasElement,
  camera: THREE.Camera,
  three: typeof import('three')
): void
```

Initialize the inspect mode system.

| Parameter | Type | Description |
|-----------|------|-------------|
| `canvas` | `HTMLCanvasElement` | The renderer's DOM element |
| `camera` | `THREE.Camera` | Camera used for raycasting |
| `three` | `typeof THREE` | THREE.js library reference |

::: warning Required
Must be called before enabling inspect mode. Requires THREE.js reference for raycasting.
:::

### `setInspectModeEnabled()`

```typescript
setInspectModeEnabled(enabled: boolean): void
```

Enable or disable inspect mode.

| Parameter | Type | Description |
|-----------|------|-------------|
| `enabled` | `boolean` | `true` to enable, `false` to disable |

When **enabled**:
- Mouse move triggers hover highlighting
- Mouse click triggers object selection
- Cursor changes to indicate pickable objects

When **disabled**:
- Normal mouse interaction resumes
- No highlighting or selection from clicks
- Existing selection remains

### `isInspectModeEnabled()`

```typescript
isInspectModeEnabled(): boolean
```

Check if inspect mode is currently active.

### `setInspectModeCamera()`

```typescript
setInspectModeCamera(camera: THREE.Camera): void
```

Update the camera used for raycasting.

**Use when:**
- Switching between cameras
- Camera reference changes at runtime

```typescript
// Switch to a different camera
const newCamera = new THREE.PerspectiveCamera(/* ... */);
probe.setInspectModeCamera(newCamera);
```

### `setInspectModePickableObjects()`

```typescript
setInspectModePickableObjects(objects: THREE.Object3D[]): void
```

Limit which objects can be picked.

| Parameter | Type | Description |
|-----------|------|-------------|
| `objects` | `THREE.Object3D[]` | Array of pickable objects |

**Default behavior:** All meshes in observed scenes are pickable.

```typescript
// Only allow picking specific objects
const selectableObjects = [player, enemy1, enemy2, treasure];
probe.setInspectModePickableObjects(selectableObjects);

// Reset to allow all objects
probe.setInspectModePickableObjects([]);
```

## How It Works

### Raycasting

Inspect mode uses THREE.js `Raycaster` to detect objects under the mouse:

```
Mouse Position → NDC Coordinates → Raycaster → Intersection Test → Object
```

1. **Mouse position** is captured on `mousemove` and `click`
2. **Normalized Device Coordinates (NDC)** are computed
3. **Raycaster** projects a ray from camera through mouse position
4. **Intersection test** against all pickable objects
5. **First hit** (closest to camera) is selected/highlighted

### Event Flow

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   Mouse Move   │────▶│    Raycast     │────▶│ Hover Highlight│
└────────────────┘     └────────────────┘     └────────────────┘

┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   Mouse Click  │────▶│    Raycast     │────▶│ Select Object  │
└────────────────┘     └────────────────┘     └────────────────┘
```

## Visual Feedback

### Hover Highlight

When hovering over an object:
- **Cyan** bounding box appears around the object
- Updates in real-time as mouse moves
- Disappears when mouse leaves object

### Selection Highlight

When an object is selected:
- **Yellow** bounding box appears around the object
- Remains until another object is selected or selection is cleared
- Works with both inspect mode clicks and programmatic selection

### Setting THREE Reference

Visual highlights require the THREE.js reference:

```typescript
import * as THREE from 'three';

probe.setThreeReference(THREE);

// Now highlights will appear
probe.initializeInspectMode(canvas, camera, THREE);
probe.setInspectModeEnabled(true);
```

## Keyboard Shortcut

The default keyboard shortcut to toggle inspect mode is:

```
Ctrl + Shift + I  (Windows/Linux)
Cmd + Shift + I   (macOS)
```

::: info Customization
Keyboard shortcuts can be customized via the overlay configuration.
:::

## Integration with Selection

Inspect mode integrates seamlessly with the selection system:

```typescript
// Selection callback fires for both:
// - Inspect mode clicks
// - Programmatic selectObject() calls
probe.onSelectionChanged((obj, meta) => {
  if (obj) {
    console.log(`Selected: ${meta?.name} at ${meta?.path}`);
    showInspector(obj);
  } else {
    hideInspector();
  }
});
```

## Complete Example

```typescript
import { createProbe } from '@3lens/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Add objects
const geometry = new THREE.BoxGeometry();
const materials = [
  new THREE.MeshStandardMaterial({ color: 0xff0000, name: 'Red' }),
  new THREE.MeshStandardMaterial({ color: 0x00ff00, name: 'Green' }),
  new THREE.MeshStandardMaterial({ color: 0x0000ff, name: 'Blue' }),
];

const cubes: THREE.Mesh[] = [];
for (let i = 0; i < 3; i++) {
  const cube = new THREE.Mesh(geometry, materials[i]);
  cube.name = `Cube_${i}`;
  cube.position.x = (i - 1) * 2;
  scene.add(cube);
  cubes.push(cube);
}

// Lighting
scene.add(new THREE.AmbientLight(0x404040));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Create probe
const probe = createProbe({ appName: 'Inspect Mode Demo' });

// Setup probe
probe.setThreeReference(THREE);
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Initialize inspect mode
probe.initializeInspectMode(renderer.domElement, camera, THREE);

// UI for toggling
const toggleBtn = document.createElement('button');
toggleBtn.textContent = 'Toggle Inspect Mode';
toggleBtn.style.cssText = 'position: fixed; top: 10px; left: 10px; z-index: 1000;';
document.body.appendChild(toggleBtn);

const statusDiv = document.createElement('div');
statusDiv.style.cssText = 'position: fixed; top: 50px; left: 10px; z-index: 1000; background: #333; color: #fff; padding: 10px;';
document.body.appendChild(statusDiv);

function updateStatus() {
  const enabled = probe.isInspectModeEnabled();
  statusDiv.innerHTML = `
    Inspect Mode: <strong>${enabled ? 'ON' : 'OFF'}</strong><br>
    Selected: <strong>${probe.getSelectedObject()?.name || 'None'}</strong>
  `;
}

toggleBtn.addEventListener('click', () => {
  const newState = !probe.isInspectModeEnabled();
  probe.setInspectModeEnabled(newState);
  
  // Disable orbit controls while inspecting
  controls.enabled = !newState;
  
  updateStatus();
});

// Selection callback
probe.onSelectionChanged((obj, meta) => {
  updateStatus();
  
  if (obj) {
    console.log('Selected:', {
      name: meta?.name,
      type: meta?.type,
      path: meta?.path,
      uuid: obj.uuid,
    });
  }
});

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'I') {
    e.preventDefault();
    toggleBtn.click();
  }
});

// Initial state
updateStatus();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate cubes
  for (const cube of cubes) {
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;
  }
  
  // Update selection highlight for moving objects
  probe.updateSelectionHighlight();
  
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Cleanup
window.addEventListener('beforeunload', () => {
  probe.dispose();
});
```

## Interaction with Controls

Inspect mode may conflict with camera controls. Disable controls while inspecting:

```typescript
// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

probe.setInspectModeEnabled(true);
controls.enabled = false; // Disable during inspection

probe.setInspectModeEnabled(false);
controls.enabled = true;  // Re-enable
```

For smoother UX, use event listeners:

```typescript
// Add a callback for when inspect mode changes
let isInspecting = false;

function toggleInspect() {
  isInspecting = !isInspecting;
  probe.setInspectModeEnabled(isInspecting);
  controls.enabled = !isInspecting;
  renderer.domElement.style.cursor = isInspecting ? 'crosshair' : 'grab';
}
```

## Filtering Pickable Objects

### By Type

```typescript
// Only allow meshes to be picked (exclude helpers, lights, cameras)
const meshes: THREE.Object3D[] = [];
scene.traverse((obj) => {
  if (obj instanceof THREE.Mesh && !obj.name.startsWith('helper_')) {
    meshes.push(obj);
  }
});
probe.setInspectModePickableObjects(meshes);
```

### By Layer

```typescript
// Objects on layer 1 are pickable
const layer1Objects: THREE.Object3D[] = [];
scene.traverse((obj) => {
  if (obj.layers.test(new THREE.Layers().set(1))) {
    layer1Objects.push(obj);
  }
});
probe.setInspectModePickableObjects(layer1Objects);
```

### Dynamic Filtering

```typescript
// Update pickable objects when scene changes
function updatePickables() {
  const pickables = getSelectableObjects(); // Your logic
  probe.setInspectModePickableObjects(pickables);
}

scene.addEventListener('change', updatePickables);
```

## Troubleshooting

### Objects Not Highlighting/Selecting

1. **Inspect mode not initialized:**
   ```typescript
   probe.initializeInspectMode(canvas, camera, THREE);
   ```

2. **THREE reference not set:**
   ```typescript
   probe.setThreeReference(THREE);
   ```

3. **Scene not observed:**
   ```typescript
   probe.observeScene(scene);
   ```

4. **Wrong camera:**
   ```typescript
   probe.setInspectModeCamera(activeCamera);
   ```

### Clicking Selects Wrong Object

- Objects may be overlapping—the closest to camera is selected
- Use `setInspectModePickableObjects()` to filter
- Check object visibility and layers

### Performance Issues

- Raycasting is performed on every mouse move
- For large scenes, limit pickable objects
- Consider disabling when not needed

## Related

- [Selection API](./selection-api.md) - Programmatic selection
- [DevtoolProbe](./devtool-probe.md) - Full probe API
- [Getting Started](/guide/getting-started) - Setup tutorial
