# Selection API

The Selection API provides programmatic control over object selection in 3Lens. Use it to select objects, respond to selection changes, and manage selection state.

## Overview

Selection in 3Lens serves multiple purposes:

1. **Visual feedback** - Highlighted bounding box in 3D view
2. **Inspector display** - Shows properties in Object Inspector panel
3. **Tool context** - Transform gizmo attaches to selected object
4. **Navigation** - Scene Explorer syncs with selection

## API Reference

### `selectObject()`

```typescript
selectObject(obj: THREE.Object3D | null): void
```

Select an object or clear the selection.

| Parameter | Type | Description |
|-----------|------|-------------|
| `obj` | `THREE.Object3D \| null` | Object to select, or `null` to clear |

```typescript
// Select an object
probe.selectObject(playerMesh);

// Clear selection
probe.selectObject(null);
```

### `selectByDebugId()`

```typescript
selectByDebugId(debugId: string | null): boolean
```

Select an object using its debug ID.

| Parameter | Type | Description |
|-----------|------|-------------|
| `debugId` | `string \| null` | Debug ID, or `null` to clear |

**Returns:** `true` if object was found and selected, `false` otherwise.

```typescript
// From UI component or extension
const found = probe.selectByDebugId('3lens_abc123');
if (!found) {
  console.warn('Object not found');
}
```

::: info Debug IDs
Debug IDs are stable identifiers assigned by 3Lens, different from three.js UUIDs. They're used for communication between the probe and UI components.
:::

### `getSelectedObject()`

```typescript
getSelectedObject(): THREE.Object3D | null
```

Get the currently selected object.

```typescript
const selected = probe.getSelectedObject();
if (selected) {
  console.log(`Selected: ${selected.name} (${selected.type})`);
  console.log(`Position: ${selected.position.toArray()}`);
}
```

### `onSelectionChanged()`

```typescript
onSelectionChanged(
  callback: (obj: THREE.Object3D | null, meta?: ObjectMeta) => void
): Unsubscribe
```

Subscribe to selection changes.

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | `function` | Called when selection changes |

**Returns:** Unsubscribe function.

```typescript
const unsubscribe = probe.onSelectionChanged((obj, meta) => {
  if (obj) {
    console.log('Selected:', meta?.name);
    console.log('Path:', meta?.path);
    console.log('Type:', meta?.type);
    updateInspector(obj);
  } else {
    console.log('Selection cleared');
    clearInspector();
  }
});

// Later: stop receiving updates
unsubscribe();
```

### ObjectMeta

Selection callbacks provide metadata about the selected object:

```typescript
interface ObjectMeta {
  debugId: string;    // 3Lens debug ID
  uuid: string;       // three.js UUID
  name: string;       // Object name
  type: string;       // Object type (Mesh, Group, Light, etc.)
  visible: boolean;   // Visibility state
  path: string;       // Scene graph path (/Scene/World/Player)
}
```

## Visual Highlighting

### Selection Highlight

Selected objects display a **yellow** bounding box:

```typescript
// Enable visual highlighting
import * as THREE from 'three';
probe.setThreeReference(THREE);

// Now selections show yellow box
probe.selectObject(mesh);
```

### Hover Highlight

Hovered objects (in inspect mode) display a **cyan** bounding box:

```typescript
// Requires inspect mode
probe.initializeInspectMode(canvas, camera, THREE);
probe.setInspectModeEnabled(true);
// Hover highlighting is automatic
```

### Update Highlights

For moving objects, update highlights in animation loop:

```typescript
function animate() {
  requestAnimationFrame(animate);
  
  // Update highlight box for moving selected object
  probe.updateSelectionHighlight();
  
  renderer.render(scene, camera);
}
```

### Hover State (Internal)

```typescript
// Set hovered object (used internally by InspectMode)
probe.setHoveredObject(object);

// Get hovered object
const hovered = probe.getHoveredObject();
```

## Programmatic Selection Patterns

### Select by Name

```typescript
function selectByName(scene: THREE.Scene, name: string) {
  let found: THREE.Object3D | null = null;
  
  scene.traverse((obj) => {
    if (obj.name === name) {
      found = obj;
    }
  });
  
  if (found) {
    probe.selectObject(found);
    return true;
  }
  return false;
}

selectByName(scene, 'Player');
```

### Select by Type

```typescript
function selectFirstOfType<T extends THREE.Object3D>(
  scene: THREE.Scene,
  type: new (...args: any[]) => T
): T | null {
  let found: T | null = null;
  
  scene.traverse((obj) => {
    if (obj instanceof type && !found) {
      found = obj;
    }
  });
  
  if (found) {
    probe.selectObject(found);
  }
  return found;
}

// Select first camera
selectFirstOfType(scene, THREE.PerspectiveCamera);

// Select first light
selectFirstOfType(scene, THREE.DirectionalLight);
```

### Select by User Data

```typescript
function selectByUserData(scene: THREE.Scene, key: string, value: unknown) {
  scene.traverse((obj) => {
    if (obj.userData[key] === value) {
      probe.selectObject(obj);
    }
  });
}

// Select the player entity
selectByUserData(scene, 'entityType', 'player');
```

### Cycle Through Objects

```typescript
class SelectionCycler {
  private objects: THREE.Object3D[] = [];
  private index = -1;
  
  constructor(private probe: DevtoolProbe, objects: THREE.Object3D[]) {
    this.objects = objects;
  }
  
  next(): THREE.Object3D | null {
    if (this.objects.length === 0) return null;
    this.index = (this.index + 1) % this.objects.length;
    const obj = this.objects[this.index];
    this.probe.selectObject(obj);
    return obj;
  }
  
  previous(): THREE.Object3D | null {
    if (this.objects.length === 0) return null;
    this.index = (this.index - 1 + this.objects.length) % this.objects.length;
    const obj = this.objects[this.index];
    this.probe.selectObject(obj);
    return obj;
  }
}

// Usage
const cycler = new SelectionCycler(probe, enemies);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    cycler.next();
  }
});
```

## Selection with Logical Entities

Link selection to your application's entity system:

```typescript
// Register entity with objects
const playerId = probe.registerLogicalEntity({
  name: 'Player',
  module: '@game/entities',
  componentType: 'PlayerComponent',
});
probe.addObjectToEntity(playerId, playerMesh);
probe.addObjectToEntity(playerId, playerShadow);

// Selection callback with entity awareness
probe.onSelectionChanged((obj, meta) => {
  if (obj) {
    const entity = probe.findEntityByObject(obj);
    if (entity) {
      console.log(`Selected entity: ${entity.name}`);
      console.log(`Module: ${entity.module}`);
      // Show entity inspector instead of raw object
    }
  }
});
```

## Selection History

Implement undo/redo for selection:

```typescript
class SelectionHistory {
  private history: (THREE.Object3D | null)[] = [];
  private index = -1;
  
  constructor(private probe: DevtoolProbe) {
    probe.onSelectionChanged((obj) => {
      // Don't record if navigating history
      if (this.navigating) return;
      
      // Remove forward history
      this.history = this.history.slice(0, this.index + 1);
      this.history.push(obj);
      this.index = this.history.length - 1;
    });
  }
  
  private navigating = false;
  
  back(): boolean {
    if (this.index <= 0) return false;
    this.index--;
    this.navigating = true;
    this.probe.selectObject(this.history[this.index]);
    this.navigating = false;
    return true;
  }
  
  forward(): boolean {
    if (this.index >= this.history.length - 1) return false;
    this.index++;
    this.navigating = true;
    this.probe.selectObject(this.history[this.index]);
    this.navigating = false;
    return true;
  }
}
```

## Focus on Selection

Combine selection with camera focus:

```typescript
// Select and focus
function selectAndFocus(obj: THREE.Object3D) {
  probe.selectObject(obj);
  probe.focusOnObject(obj, 1.5); // 1.5x padding
}

// Select and fly to
function selectAndFlyTo(obj: THREE.Object3D) {
  probe.selectObject(obj);
  probe.flyToObject(obj, {
    duration: 1000,
    padding: 2.0,
    onComplete: () => console.log('Camera arrived'),
  });
}

// UI integration
document.getElementById('focus-selected')?.addEventListener('click', () => {
  const selected = probe.getSelectedObject();
  if (selected) {
    probe.flyToObject(selected);
  }
});
```

## Complete Example

```typescript
import { createProbe, DevtoolProbe } from '@3lens/core';
import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const renderer = new THREE.WebGLRenderer();

// Create objects
const objects: THREE.Mesh[] = [];
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];

for (let i = 0; i < 5; i++) {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: colors[i] });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `Box_${i}`;
  mesh.position.x = (i - 2) * 2;
  mesh.userData.index = i;
  scene.add(mesh);
  objects.push(mesh);
}

scene.add(new THREE.AmbientLight(0x404040));
scene.add(new THREE.DirectionalLight(0xffffff, 1));

// Create probe
const probe = createProbe({ appName: 'Selection Demo' });
probe.setThreeReference(THREE);
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Initialize inspect mode
probe.initializeInspectMode(renderer.domElement, camera, THREE);

// Selection UI
const infoPanel = document.createElement('div');
infoPanel.id = 'selection-info';
infoPanel.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  width: 250px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 15px;
  font-family: monospace;
  font-size: 12px;
  border-radius: 8px;
`;
document.body.appendChild(infoPanel);

function updateInfo() {
  const obj = probe.getSelectedObject();
  if (obj) {
    infoPanel.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">Selected Object</h3>
      <strong>Name:</strong> ${obj.name}<br>
      <strong>Type:</strong> ${obj.type}<br>
      <strong>UUID:</strong> ${obj.uuid.slice(0, 8)}...<br>
      <strong>Position:</strong><br>
      &nbsp;&nbsp;x: ${obj.position.x.toFixed(2)}<br>
      &nbsp;&nbsp;y: ${obj.position.y.toFixed(2)}<br>
      &nbsp;&nbsp;z: ${obj.position.z.toFixed(2)}<br>
      <strong>Visible:</strong> ${obj.visible}<br>
      <br>
      <button id="clear-btn">Clear Selection</button>
    `;
    document.getElementById('clear-btn')?.addEventListener('click', () => {
      probe.selectObject(null);
    });
  } else {
    infoPanel.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">No Selection</h3>
      <p>Click an object or use buttons below to select.</p>
    `;
  }
}

// Selection change callback
probe.onSelectionChanged((obj, meta) => {
  console.log('Selection changed:', meta?.name ?? 'None');
  updateInfo();
});

// Control buttons
const controls = document.createElement('div');
controls.style.cssText = `
  position: fixed;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
`;

const toggleBtn = document.createElement('button');
toggleBtn.textContent = 'Toggle Inspect Mode';
toggleBtn.addEventListener('click', () => {
  probe.setInspectModeEnabled(!probe.isInspectModeEnabled());
  toggleBtn.textContent = probe.isInspectModeEnabled() 
    ? 'Inspect: ON' 
    : 'Inspect: OFF';
});
controls.appendChild(toggleBtn);

// Quick select buttons
for (let i = 0; i < objects.length; i++) {
  const btn = document.createElement('button');
  btn.textContent = `Select ${i}`;
  btn.addEventListener('click', () => probe.selectObject(objects[i]));
  controls.appendChild(btn);
}

document.body.appendChild(controls);

// Initial state
updateInfo();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate all objects
  for (const obj of objects) {
    obj.rotation.y += 0.01;
  }
  
  // Update highlight for moving objects
  probe.updateSelectionHighlight();
  
  renderer.render(scene, camera);
}
animate();

// Cleanup
window.addEventListener('beforeunload', () => {
  probe.dispose();
});
```

## Events Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SELECTION FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐                                            │
│  │ User Click     │──┐                                          │
│  │ (Inspect Mode) │  │                                          │
│  └────────────────┘  │                                          │
│                      │                                          │
│  ┌────────────────┐  │     ┌────────────────┐                  │
│  │ selectObject() │──┼────▶│ Update State   │                  │
│  │ (Programmatic) │  │     │ _selectedObject│                  │
│  └────────────────┘  │     └───────┬────────┘                  │
│                      │             │                            │
│  ┌────────────────┐  │             ▼                            │
│  │ selectByDebugId│──┘     ┌────────────────┐                  │
│  │ (From UI/Ext)  │        │ Update Visual  │                  │
│  └────────────────┘        │ Highlight      │                  │
│                            └───────┬────────┘                  │
│                                    │                            │
│                                    ▼                            │
│                            ┌────────────────┐                  │
│                            │ Notify         │                  │
│                            │ Callbacks      │                  │
│                            └───────┬────────┘                  │
│                                    │                            │
│                  ┌─────────────────┼─────────────────┐          │
│                  ▼                 ▼                 ▼          │
│          ┌────────────┐    ┌────────────┐    ┌────────────┐    │
│          │ Inspector  │    │ Transform  │    │ Extension  │    │
│          │ UI Update  │    │ Gizmo      │    │ Message    │    │
│          └────────────┘    └────────────┘    └────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Related

- [Inspect Mode API](./inspect-mode-api.md) - Interactive selection
- [DevtoolProbe](./devtool-probe.md) - Full probe API
- [Logical Entities](./logical-entities.md) - Entity system
- [Transform Gizmo](./transform-gizmo.md) - Object manipulation
