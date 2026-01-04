# Camera Controls Guide

This guide covers 3Lens's camera control features including focus, fly-to, orbit, and viewport manipulation for efficient scene navigation.

## Table of Contents

- [Overview](#overview)
- [Focus on Selection](#focus-on-selection)
- [Fly-To Animation](#fly-to-animation)
- [Orbit Controls](#orbit-controls)
- [Camera Bookmarks](#camera-bookmarks)
- [Multiple Cameras](#multiple-cameras)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Programmatic Control](#programmatic-control)

---

## Overview

3Lens provides camera controls that help you navigate complex scenes:

- **Focus** - Instantly center view on selected objects
- **Fly-To** - Smoothly animate camera to a target
- **Orbit** - Rotate view around a pivot point
- **Pan** - Move the camera parallel to the view plane
- **Zoom** - Move closer or further from the scene
- **Bookmarks** - Save and restore camera positions

---

## Focus on Selection

### Quick Focus

Press `F` to focus on the currently selected object:

1. Select an object (click in tree or 3D view)
2. Press `F`
3. Camera moves to frame the object

### Focus Behavior

The focus operation:
- Centers the object in the viewport
- Adjusts distance based on object size
- Preserves the current viewing angle
- Animates smoothly (configurable)

```typescript
// Focus on selected object
probe.focusSelected();

// Focus on specific object
probe.focusObject(mesh);

// Focus without animation
probe.focusObject(mesh, { animate: false });
```

### Focus Options

```typescript
probe.focusObject(mesh, {
  // Animation
  animate: true,
  duration: 500, // milliseconds
  easing: 'easeOutCubic',
  
  // Framing
  padding: 1.2, // 20% padding around object
  
  // Distance
  minDistance: 1,
  maxDistance: 100,
});
```

### Focus All

Focus to see the entire scene:

```typescript
// Focus on all visible objects
probe.focusAll();

// Focus on specific group
probe.focusObject(worldGroup, { includeChildren: true });
```

---

## Fly-To Animation

### Smooth Camera Transitions

Fly-to provides cinematic camera movements:

```typescript
// Fly to a position looking at a target
probe.flyTo({
  position: new THREE.Vector3(10, 5, 10),
  target: new THREE.Vector3(0, 0, 0),
  duration: 1000,
});
```

### Fly-To Options

```typescript
interface FlyToOptions {
  // Target position for camera
  position?: THREE.Vector3;
  
  // Point the camera looks at
  target?: THREE.Vector3;
  
  // Animation duration in ms
  duration?: number;
  
  // Easing function
  easing?: 'linear' | 'easeInOut' | 'easeOutCubic' | 'easeInOutQuad';
  
  // Callback when complete
  onComplete?: () => void;
  
  // Keep current distance but change angle
  keepDistance?: boolean;
}
```

### Fly-To Examples

```typescript
// Fly to view from above
probe.flyTo({
  position: new THREE.Vector3(0, 50, 0),
  target: new THREE.Vector3(0, 0, 0),
  duration: 2000,
});

// Orbit to a new angle
probe.flyTo({
  position: new THREE.Vector3(20, 10, 20),
  keepDistance: true,
  duration: 1000,
});

// Fly to selected object
const selected = probe.getSelectedObject();
if (selected) {
  const bounds = new THREE.Box3().setFromObject(selected);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const distance = Math.max(size.x, size.y, size.z) * 2;
  
  probe.flyTo({
    position: center.clone().add(new THREE.Vector3(distance, distance, distance)),
    target: center,
  });
}
```

---

## Orbit Controls

### Basic Orbit

3Lens enhances Three.js orbit controls:

- **Left Mouse** - Orbit around target
- **Right Mouse** - Pan camera
- **Scroll Wheel** - Zoom in/out
- **Middle Mouse** - Pan camera

### Orbit Settings

```typescript
probe.setOrbitControls({
  // Enable/disable
  enabled: true,
  
  // Rotation limits (radians)
  minPolarAngle: 0,              // Straight up
  maxPolarAngle: Math.PI,        // Straight down
  minAzimuthAngle: -Infinity,    // No limit
  maxAzimuthAngle: Infinity,     // No limit
  
  // Zoom limits
  minDistance: 1,
  maxDistance: 1000,
  
  // Speeds
  rotateSpeed: 1.0,
  panSpeed: 1.0,
  zoomSpeed: 1.0,
  
  // Damping (smoothing)
  enableDamping: true,
  dampingFactor: 0.05,
  
  // Auto-rotate
  autoRotate: false,
  autoRotateSpeed: 2.0,
});
```

### Change Orbit Target

```typescript
// Set orbit pivot to selected object
const selected = probe.getSelectedObject();
if (selected) {
  const center = new THREE.Box3()
    .setFromObject(selected)
    .getCenter(new THREE.Vector3());
    
  probe.setOrbitTarget(center);
}

// Reset to origin
probe.setOrbitTarget(new THREE.Vector3(0, 0, 0));
```

### Lock Orbit Axis

```typescript
// Lock to horizontal orbit only
probe.setOrbitControls({
  minPolarAngle: Math.PI / 2,
  maxPolarAngle: Math.PI / 2,
});

// Lock to specific vertical angle
const angle = Math.PI / 4; // 45 degrees
probe.setOrbitControls({
  minPolarAngle: angle,
  maxPolarAngle: angle,
});
```

---

## Camera Bookmarks

### Saving Bookmarks

Save camera positions for quick recall:

```typescript
// Save current camera position
probe.saveBookmark('Overview');
probe.saveBookmark('Close-up');
probe.saveBookmark('Top View');

// Save with custom data
probe.saveBookmark('Player Start', {
  position: camera.position.clone(),
  target: new THREE.Vector3(0, 0, 0),
  fov: camera.fov,
  metadata: { levelArea: 'spawn' },
});
```

### Restoring Bookmarks

```typescript
// Restore a bookmark
probe.restoreBookmark('Overview');

// Restore with animation
probe.restoreBookmark('Close-up', { animate: true, duration: 1000 });

// List all bookmarks
const bookmarks = probe.getBookmarks();
bookmarks.forEach(b => console.log(b.name));
```

### Bookmark UI

In the overlay, bookmarks appear in the Camera section:

```
┌─────────────────────┐
│ 📷 Camera           │
├─────────────────────┤
│ Bookmarks:          │
│   [Overview]        │
│   [Close-up]        │
│   [Top View]        │
│                     │
│ [+ Save Current]    │
└─────────────────────┘
```

### Managing Bookmarks

```typescript
// Rename a bookmark
probe.renameBookmark('Overview', 'Main View');

// Delete a bookmark
probe.deleteBookmark('Top View');

// Update a bookmark with current camera
probe.updateBookmark('Overview');

// Export/import bookmarks
const data = probe.exportBookmarks();
localStorage.setItem('camera-bookmarks', JSON.stringify(data));

const saved = JSON.parse(localStorage.getItem('camera-bookmarks'));
probe.importBookmarks(saved);
```

---

## Multiple Cameras

### Switching Cameras

View your scene from different cameras:

```typescript
// List available cameras
const cameras = probe.getCameras();
cameras.forEach(cam => console.log(cam.name));

// Switch to a different camera
probe.setActiveCamera(cameras[1]);

// Switch by name
probe.setActiveCamera('SecurityCamera1');

// Switch by UUID
probe.setActiveCameraByUuid(camera.uuid);
```

### Camera Properties Panel

Select a camera to see its properties:

```
┌─────────────────────────┐
│ 📷 MainCamera           │
├─────────────────────────┤
│ Type: PerspectiveCamera │
│ FOV: 75°                │
│ Near: 0.1               │
│ Far: 1000               │
│ Aspect: 1.78            │
├─────────────────────────┤
│ Position:               │
│ X: 0.00  Y: 5.00  Z: 10 │
│ Target:                 │
│ X: 0.00  Y: 0.00  Z: 0  │
└─────────────────────────┘
```

### Edit Camera Properties

```typescript
// Modify FOV
probe.setCameraProperty('fov', 60);

// Modify clipping planes
probe.setCameraProperty('near', 0.01);
probe.setCameraProperty('far', 5000);

// These trigger camera.updateProjectionMatrix() automatically
```

---

## Keyboard Shortcuts

### Navigation

| Key | Action |
|-----|--------|
| `F` | Focus on selected |
| `Home` | Focus on all |
| `Numpad .` | Focus on selected |
| `Numpad 0` | Toggle active camera view |

### View Angles

| Key | Action |
|-----|--------|
| `Numpad 1` | Front view |
| `Ctrl+Numpad 1` | Back view |
| `Numpad 3` | Right view |
| `Ctrl+Numpad 3` | Left view |
| `Numpad 7` | Top view |
| `Ctrl+Numpad 7` | Bottom view |
| `Numpad 5` | Toggle ortho/perspective |

### Movement

| Key | Action |
|-----|--------|
| `W` / `↑` | Move forward |
| `S` / `↓` | Move backward |
| `A` / `←` | Move left |
| `D` / `→` | Move right |
| `Q` | Move down |
| `E` | Move up |
| `Shift` (hold) | Faster movement |

### Bookmarks

| Key | Action |
|-----|--------|
| `Ctrl+1-9` | Restore bookmark 1-9 |
| `Ctrl+Shift+1-9` | Save to bookmark 1-9 |

---

## Programmatic Control

### Direct Camera Manipulation

```typescript
// Get the current camera
const camera = probe.getActiveCamera();

// Set position
camera.position.set(10, 5, 10);

// Look at a point
camera.lookAt(0, 0, 0);

// Update projection matrix if needed
camera.updateProjectionMatrix();

// Notify 3Lens of changes
probe.notifyCameraChanged();
```

### Camera Animation

```typescript
import { gsap } from 'gsap';

// Animate with GSAP
gsap.to(camera.position, {
  x: 20,
  y: 10,
  z: 20,
  duration: 2,
  ease: 'power2.inOut',
  onUpdate: () => {
    camera.lookAt(0, 0, 0);
    probe.notifyCameraChanged();
  },
});
```

### Camera Path Animation

```typescript
// Create a path
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 10, 20),
  new THREE.Vector3(20, 10, 0),
  new THREE.Vector3(0, 10, -20),
  new THREE.Vector3(-20, 10, 0),
]);

// Animate along path
let t = 0;
function animateCamera() {
  t += 0.001;
  if (t > 1) t = 0;
  
  const point = curve.getPoint(t);
  camera.position.copy(point);
  camera.lookAt(0, 0, 0);
  
  probe.notifyCameraChanged();
  requestAnimationFrame(animateCamera);
}
animateCamera();
```

### Event Listeners

```typescript
// Camera changed (position, rotation, or properties)
probe.onCameraChange((camera) => {
  console.log('Camera moved to:', camera.position);
  updateMinimap(camera);
});

// Active camera switched
probe.onActiveCameraChange((newCamera, oldCamera) => {
  console.log(`Switched from ${oldCamera?.name} to ${newCamera.name}`);
});
```

---

## Framework Integration

### React

```tsx
import { useThreeLensProbe, useSelectedObject } from '@3lens/react-bridge';

function CameraControls() {
  const probe = useThreeLensProbe();
  const { selectedNode } = useSelectedObject();
  
  const handleFocus = () => {
    if (selectedNode) {
      probe.focusSelected();
    } else {
      probe.focusAll();
    }
  };
  
  return (
    <div className="camera-controls">
      <button onClick={handleFocus}>
        {selectedNode ? 'Focus Selected' : 'Focus All'}
      </button>
      
      <button onClick={() => probe.flyTo({
        position: new THREE.Vector3(0, 50, 0),
        target: new THREE.Vector3(0, 0, 0),
      })}>
        Top View
      </button>
      
      <button onClick={() => probe.saveBookmark('Quick Save')}>
        Save Position
      </button>
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { useThreeLens, useSelectedObject } from '@3lens/vue-bridge';
import * as THREE from 'three';

const { probe } = useThreeLens();
const { selectedNode } = useSelectedObject();

function handleFocus() {
  if (selectedNode.value) {
    probe.value?.focusSelected();
  } else {
    probe.value?.focusAll();
  }
}

function topView() {
  probe.value?.flyTo({
    position: new THREE.Vector3(0, 50, 0),
    target: new THREE.Vector3(0, 0, 0),
  });
}
</script>

<template>
  <div class="camera-controls">
    <button @click="handleFocus">
      {{ selectedNode ? 'Focus Selected' : 'Focus All' }}
    </button>
    <button @click="topView">Top View</button>
  </div>
</template>
```

---

## Tips & Tricks

### 1. Quick Examination

Double-click an object in the Scene Explorer to focus on it immediately.

### 2. Preserve Angle

Hold `Shift` while pressing `F` to focus while keeping your viewing angle.

### 3. Frame Selection Tightly

Press `Numpad .` for a tighter frame than `F`.

### 4. Return to Previous View

After focusing, press `Backspace` to return to your previous camera position.

### 5. Save Development Views

Create bookmarks for commonly-used viewpoints:
- "Debug Spawn" - Where players start
- "Problem Area" - That corner with rendering issues
- "Performance Test" - The heavy area of the scene

---

## Related Guides

- [Scene Inspection Guide](./SCENE-INSPECTION-GUIDE.md)
- [Transform Gizmos Guide](./TRANSFORM-GIZMOS-GUIDE.md)

## API Reference

- [Selection API](/api/core/selection-api)
- [Object Inspector Panel](/api/overlay/object-inspector-panel)
