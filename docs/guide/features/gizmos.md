---
title: Transform Gizmos Guide
description: Use 3Lens transform gizmos to manipulate objects through translate, rotate, and scale operations
---

# Transform Gizmos Guide

This guide covers how to use 3Lens's transform gizmos to manipulate objects in your Three.js scene through translate, rotate, and scale operations.

## Table of Contents

- [Overview](#overview)
- [Enabling Gizmos](#enabling-gizmos)
- [Transform Modes](#transform-modes)
- [Using the Gizmos](#using-the-gizmos)
- [Coordinate Spaces](#coordinate-spaces)
- [Snapping](#snapping)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Programmatic Control](#programmatic-control)
- [Customization](#customization)

---

## Overview

Transform gizmos provide visual handles for manipulating object transforms directly in the 3D viewport. 3Lens includes:

- **Translate Gizmo** - Move objects along axes
- **Rotate Gizmo** - Rotate objects around axes
- **Scale Gizmo** - Resize objects along axes
- **Combined Gizmo** - All operations in one widget

---

## Enabling Gizmos

### Automatic with Selection

When you select an object, gizmos appear automatically:

1. Click an object in the Scene Explorer or 3D view
2. The current gizmo mode appears on the selected object
3. Drag the handles to transform

### Toggle Gizmo Visibility

```typescript
// Show gizmos
probe.setGizmoEnabled(true);

// Hide gizmos (selection still works)
probe.setGizmoEnabled(false);

// Check current state
const enabled = probe.isGizmoEnabled();
```

### In the Overlay

Click the gizmo toggle button in the toolbar:

```
[T] [R] [S] | [📐] [🔒] | [W] [L]
 ↑   ↑   ↑     ↑     ↑     ↑   ↑
 │   │   │     │     │     │   └── Local space
 │   │   │     │     │     └────── World space
 │   │   │     │     └──────────── Snap toggle
 │   │   │     └────────────────── Gizmo on/off
 │   │   └──────────────────────── Scale mode
 │   └──────────────────────────── Rotate mode
 └──────────────────────────────── Translate mode
```

---

## Transform Modes

### Translate Mode (T)

Move objects along one or more axes:

```
        Y ↑
          │
          │
    Z ←───┼───→ X
          │
          │
```

- **Axis arrows**: Drag to move along single axis
- **Plane squares**: Drag to move in a plane (XY, XZ, YZ)
- **Center cube**: Drag to move freely

### Rotate Mode (R)

Rotate objects around axes:

```
        ╭───────╮
       ╱    Y    ╲
      │     │     │
   Z ─│─────┼─────│─ X
      │     │     │
       ╲         ╱
        ╰───────╯
```

- **Colored rings**: Drag to rotate around that axis
- **Outer ring**: Rotate in screen space
- **Inner sphere**: Free rotation (trackball)

### Scale Mode (S)

Resize objects along axes:

```
     ■───────Y───────■
     │       │       │
     │       │       │
   Z─┼───────┼───────┼─X
     │       │       │
     │       │       │
     ■───────────────■
```

- **Axis handles**: Scale along single axis
- **Corner cubes**: Uniform scale
- **Edge handles**: Scale in two axes

### Switching Modes

```typescript
// Set transform mode
probe.setGizmoMode('translate'); // or 'rotate', 'scale'

// Get current mode
const mode = probe.getGizmoMode();
```

Or use keyboard shortcuts:
- `T` - Translate
- `R` - Rotate
- `S` - Scale

---

## Using the Gizmos

### Basic Manipulation

1. **Select** an object in the scene
2. **Hover** over a gizmo handle (it highlights)
3. **Drag** to transform
4. **Release** to confirm

### Axis Colors

- **Red (X)**: X-axis operations
- **Green (Y)**: Y-axis operations
- **Blue (Z)**: Z-axis operations
- **Yellow**: Plane or multi-axis operations
- **White/Gray**: Screen-space or uniform operations

### Transform Feedback

While dragging, you'll see:

```
┌─────────────────────┐
│ Position            │
│ X: 12.50  (Δ +2.50) │
│ Y:  0.00            │
│ Z:  5.00            │
└─────────────────────┘
```

### Undo/Redo

- `Ctrl+Z` - Undo last transform
- `Ctrl+Shift+Z` - Redo

```typescript
// Programmatic undo/redo
probe.undo();
probe.redo();

// Check history
const canUndo = probe.canUndo();
const canRedo = probe.canRedo();
```

---

## Coordinate Spaces

### World Space (W)

Transforms relative to world axes:

```typescript
probe.setGizmoSpace('world');
```

- Axes always aligned to world
- Useful for absolute positioning
- Rotation gizmo shows world orientation

### Local Space (L)

Transforms relative to object's orientation:

```typescript
probe.setGizmoSpace('local');
```

- Axes follow object rotation
- Useful for moving "forward" relative to object
- More intuitive for rotated objects

### Visual Difference

```
World Space:              Local Space:
                          (object rotated 45°)
    Y ↑                       Y ↗
      │                        ╲
      │                         ╲
──────┼────── X           ──────╲────── X
      │                          ╲
                                  ↘
```

### Toggle in UI

Click `[W]` for World or `[L]` for Local in the toolbar.

---

## Snapping

### Grid Snapping

Snap transforms to grid increments:

```typescript
// Enable snapping
probe.setSnapEnabled(true);

// Set snap increments
probe.setSnapSettings({
  translate: 0.5,      // 0.5 unit increments
  rotate: 15,          // 15 degree increments
  scale: 0.1,          // 0.1 (10%) increments
});

// Disable snapping
probe.setSnapEnabled(false);
```

### Hold to Snap

Hold `Ctrl` while dragging to temporarily enable snapping:

```typescript
// Configure hold-to-snap behavior
probe.setSnapSettings({
  holdToSnap: true,  // Ctrl toggles snap
  // or
  holdToSnap: false, // Ctrl disables snap when enabled
});
```

### Visual Grid

Show a reference grid:

```typescript
probe.setGridVisible(true);
probe.setGridSize(10);      // 10x10 grid
probe.setGridDivisions(10); // 10 subdivisions
```

---

## Keyboard Shortcuts

### Mode Switching

| Key | Action |
|-----|--------|
| `T` | Translate mode |
| `R` | Rotate mode |
| `S` | Scale mode |

### Space & Snapping

| Key | Action |
|-----|--------|
| `W` | World space |
| `L` | Local space |
| `Ctrl` (hold) | Toggle snap |
| `Shift` (hold) | Precision mode (slower) |

### Axis Constraints

| Key | Action |
|-----|--------|
| `X` | Constrain to X axis |
| `Y` | Constrain to Y axis |
| `Z` | Constrain to Z axis |
| `Shift+X` | Constrain to YZ plane |
| `Shift+Y` | Constrain to XZ plane |
| `Shift+Z` | Constrain to XY plane |

### Transform Actions

| Key | Action |
|-----|--------|
| `G` | Grab (start translate) |
| `R` then drag | Start rotate |
| `S` then drag | Start scale |
| `Enter` | Confirm transform |
| `Escape` | Cancel transform |

### History

| Key | Action |
|-----|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |

---

## Programmatic Control

### Transform Objects

```typescript
// Move selected object
probe.translateSelected(new THREE.Vector3(1, 0, 0));

// Rotate selected object (Euler angles in radians)
probe.rotateSelected(new THREE.Euler(0, Math.PI / 4, 0));

// Scale selected object
probe.scaleSelected(new THREE.Vector3(2, 2, 2));

// Set absolute transform
probe.setSelectedPosition(new THREE.Vector3(0, 5, 0));
probe.setSelectedRotation(new THREE.Euler(0, 0, 0));
probe.setSelectedScale(new THREE.Vector3(1, 1, 1));
```

### Listen for Transform Changes

```typescript
probe.onTransformStart((object, mode) => {
  console.log(`Started ${mode} on ${object.name}`);
});

probe.onTransformChange((object, mode, delta) => {
  console.log(`${mode}: ${JSON.stringify(delta)}`);
});

probe.onTransformEnd((object, mode) => {
  console.log(`Finished ${mode} on ${object.name}`);
  
  // Save to your state
  saveObjectTransform(object);
});
```

### Constrained Transforms

```typescript
// Translate only on X axis
probe.translateSelected(
  new THREE.Vector3(5, 0, 0),
  { axis: 'x' }
);

// Rotate only around Y axis
probe.rotateSelected(
  new THREE.Euler(0, Math.PI / 2, 0),
  { axis: 'y' }
);

// Scale uniformly
probe.scaleSelected(
  new THREE.Vector3(2, 2, 2),
  { uniform: true }
);
```

---

## Customization

### Gizmo Size

```typescript
// Set gizmo size (default: 1)
probe.setGizmoSize(1.5); // 50% larger

// Auto-size based on camera distance
probe.setGizmoAutoSize(true);
```

### Gizmo Colors

```typescript
probe.setGizmoColors({
  x: 0xff4444,        // Red
  y: 0x44ff44,        // Green
  z: 0x4444ff,        // Blue
  hover: 0xffff00,    // Yellow on hover
  active: 0xffffff,   // White when dragging
});
```

### Custom Pivot Point

By default, transforms use the object's origin. Override:

```typescript
// Set custom pivot
probe.setPivotMode('center');    // Bounding box center
probe.setPivotMode('origin');    // Object origin (default)
probe.setPivotMode('cursor');    // 3D cursor position
probe.setPivotMode('selection'); // Selection center (multi-select)

// Set 3D cursor position
probe.set3DCursor(new THREE.Vector3(0, 0, 0));
```

### Disable for Specific Objects

```typescript
// Prevent transforms on certain objects
probe.setTransformable(groundPlane, false);
probe.setTransformable(skybox, false);

// Re-enable
probe.setTransformable(groundPlane, true);
```

### Transform Constraints

```typescript
// Limit transform ranges
probe.setTransformConstraints({
  position: {
    min: new THREE.Vector3(-100, 0, -100),
    max: new THREE.Vector3(100, 50, 100),
  },
  scale: {
    min: new THREE.Vector3(0.1, 0.1, 0.1),
    max: new THREE.Vector3(10, 10, 10),
  },
});
```

---

## Framework Integration

### React

```tsx
import { useSelectedObject, useThreeLensProbe } from '@3lens/react-bridge';

function TransformControls() {
  const probe = useThreeLensProbe();
  const { selectedNode } = useSelectedObject();
  
  if (!selectedNode) return null;
  
  return (
    <div className="transform-panel">
      <h3>{selectedNode.name}</h3>
      
      <div className="mode-buttons">
        <button onClick={() => probe.setGizmoMode('translate')}>Move</button>
        <button onClick={() => probe.setGizmoMode('rotate')}>Rotate</button>
        <button onClick={() => probe.setGizmoMode('scale')}>Scale</button>
      </div>
      
      <div className="space-buttons">
        <button onClick={() => probe.setGizmoSpace('world')}>World</button>
        <button onClick={() => probe.setGizmoSpace('local')}>Local</button>
      </div>
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { useThreeLens, useSelectedObject } from '@3lens/vue-bridge';

const { probe } = useThreeLens();
const { selectedNode } = useSelectedObject();

function setMode(mode) {
  probe.value?.setGizmoMode(mode);
}
</script>

<template>
  <div v-if="selectedNode" class="transform-panel">
    <h3>{{ selectedNode.name }}</h3>
    
    <div class="buttons">
      <button @click="setMode('translate')">Move</button>
      <button @click="setMode('rotate')">Rotate</button>
      <button @click="setMode('scale')">Scale</button>
    </div>
  </div>
</template>
```

---

## Tips & Tricks

### 1. Quick Transform Workflow

1. Select object (`Click` or `I` mode)
2. Press `G` to grab and move
3. Press `X`, `Y`, or `Z` to constrain
4. Type a number for exact value
5. Press `Enter` to confirm

### 2. Precision Transforms

Hold `Shift` while dragging for slower, more precise movement.

### 3. Duplicate and Move

`Ctrl+D` duplicates selected object, then immediately enters translate mode.

### 4. Reset Transform

- `Alt+G` - Reset position to (0,0,0)
- `Alt+R` - Reset rotation to (0,0,0)
- `Alt+S` - Reset scale to (1,1,1)

### 5. Copy/Paste Transforms

```typescript
// Copy transform from one object to another
const source = probe.getSelectedObject();
const target = scene.getObjectByName('target');

target.position.copy(source.position);
target.rotation.copy(source.rotation);
target.scale.copy(source.scale);
```

---

## Related Guides

- [Scene Inspection Guide](./SCENE-INSPECTION-GUIDE.md)
- [Camera Controls Guide](./CAMERA-CONTROLS-GUIDE.md)

## API Reference

- [Selection API](/api/core/selection-api)
- [Object Inspector Panel](/api/overlay/object-inspector-panel)
