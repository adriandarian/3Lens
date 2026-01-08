---
title: Transform Gizmo Demo
description: Interactive transform gizmo for object manipulation with translate, rotate, scale modes and undo/redo support
---

# Transform Gizmo

Interactive object manipulation with full transform controls and undo/redo history.

<ExampleViewer
  src="/examples/feature-showcase/transform-gizmo/"
  title="Transform Gizmo Demo"
  description="Click on objects to select them, then use the transform controls to manipulate them. Try keyboard shortcuts: G (translate), R (rotate), S (scale), Ctrl+Z (undo), Ctrl+Y (redo)"
  difficulty="beginner"
  github-url="https://github.com/adriandarian/3Lens/tree/main/examples/feature-showcase/transform-gizmo"
  aspect-ratio="16/9"
/>

## Features Demonstrated

- **Transform Modes**: Translate, rotate, and scale operations
- **Coordinate Spaces**: World vs local coordinate systems
- **Snap to Grid**: Configurable snapping for precise positioning
- **Undo/Redo History**: Full transform history with keyboard shortcuts
- **Transform Controls Integration**: Three.js TransformControls with 3Lens
- **Real-time Updates**: Live object inspector updates during transforms

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G` | Translate mode |
| `R` | Rotate mode |
| `S` | Scale mode |
| `X` / `Y` / `Z` | Constrain to axis |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Space` | Toggle coordinate space (World/Local) |
| `Escape` | Deselect |

## Code Highlights

### Setting Up Transform Controls

```typescript
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

const transformControls = new TransformControls(camera, renderer.domElement);
scene.add(transformControls);

// Connect to 3Lens for inspection
probe.observeScene(scene);

// Handle selection changes
probe.on('selectionChanged', (object) => {
  if (object) {
    transformControls.attach(object);
  } else {
    transformControls.detach();
  }
});
```

### Listening for Transform Events

```typescript
transformControls.addEventListener('change', () => {
  // Update occurs during drag
  renderer.render(scene, camera);
});

transformControls.addEventListener('objectChange', () => {
  // Object's transform was modified
  probe.emit('objectTransformed', transformControls.object);
});
```

## Source Code

View the complete source code on [GitHub](https://github.com/adriandarian/3Lens/tree/main/examples/feature-showcase/transform-gizmo).

## Related Examples

- [Camera Controls](./camera-controls) - Learn about camera manipulation
- [Custom Plugin](./custom-plugin) - Build your own devtools panel
- [Configuration Rules](./configuration-rules) - Set up performance budgets
