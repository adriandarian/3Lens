# Transform Gizmo Demo

Demonstrates 3Lens's built-in `TransformGizmo` helper for manipulating scene objects.

## What This Example Shows

This example showcases the 3Lens `TransformGizmo` helper:

- Click-to-select objects in the scene
- Transform gizmo with translate/rotate/scale modes
- World vs local coordinate space
- Snap to grid functionality
- Full undo/redo history

**Key Point**: All transform controls come from 3Lens - no custom UI is built in this example.

## Using 3Lens

### Selection

Click any colored object to select it. The 3Lens SelectionHelper handles click detection and calls `probe.selectObject()`.

### Transform Gizmo

When an object is selected, the `TransformGizmo` automatically attaches to it. The gizmo provides:

- **Translate**: Move the object along axes
- **Rotate**: Rotate around axes
- **Scale**: Scale along axes

### Transform History

3Lens automatically tracks all transform changes. Use undo/redo to step through history:

- `Ctrl+Z`: Undo last transform
- `Ctrl+Shift+Z`: Redo undone transform

### 3Lens Overlay

Open the 3Lens overlay to see:

- **Scene Explorer**: View all objects, click to select
- **Properties Panel**: See selected object's transform values
- **Performance Stats**: Monitor frame rate during transforms

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `W` | Translate mode |
| `E` | Rotate mode |
| `R` | Scale mode |
| `Q` | Toggle world/local space |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Esc` | Deselect |

## Code Highlights

### Initializing TransformGizmo

```typescript
import { createProbe, TransformGizmo, SelectionHelper } from '@3lens/core';

const probe = createProbe({ appName: 'My App' });
probe.setThreeReference(THREE);
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Create and initialize the transform gizmo
const transformGizmo = new TransformGizmo(probe);
transformGizmo.initialize(scene, camera, renderer.domElement, THREE);
transformGizmo.enable();

// Create selection helper for click-to-select
const selectionHelper = new SelectionHelper(probe, camera, renderer.domElement);
```

### Responding to Transform Changes

```typescript
// Disable orbit controls while transforming
transformGizmo.onDraggingChanged((isDragging) => {
  orbitControls.enabled = !isDragging;
});

// React to transform changes
transformGizmo.onTransformChanged((entry) => {
  console.log(`Transformed: ${entry.objectName}`);
  console.log(`  Before: ${JSON.stringify(entry.before.position)}`);
  console.log(`  After: ${JSON.stringify(entry.after.position)}`);
});
```

### Changing Transform Mode

```typescript
transformGizmo.setMode('translate'); // or 'rotate' or 'scale'
transformGizmo.setSpace('world');    // or 'local'
transformGizmo.toggleSpace();        // toggle between world/local

// Enable snapping
transformGizmo.setSnapEnabled(true);
transformGizmo.setSnapValues(1, Math.PI / 12, 0.1); // translation, rotation, scale
```

### Undo/Redo

```typescript
if (transformGizmo.canUndo()) {
  transformGizmo.undo();
}

if (transformGizmo.canRedo()) {
  transformGizmo.redo();
}

// Get transform history
const history = transformGizmo.getHistory();
```

## Running the Example

```bash
cd examples/feature-showcase/transform-gizmo
pnpm install
pnpm dev
```

## Related Examples

- [Camera Controls](../camera-controls/) - 3Lens CameraController helper
- [Visual Overlays](../visual-overlays/) - Bounding boxes and debug visualization
- [Custom Plugin](../custom-plugin/) - Extend 3Lens with custom functionality
