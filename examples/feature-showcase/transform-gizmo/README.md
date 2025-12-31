# Transform Gizmo Demo

Interactive transform controls demonstration for 3Lens DevTools.

## Overview

This example showcases transform gizmo integration with Three.js TransformControls:

- **Translate Mode (W)**: Move objects along axes
- **Rotate Mode (E)**: Rotate objects around axes  
- **Scale Mode (R)**: Scale objects uniformly or per-axis
- **Space Toggle (Q)**: Switch between world and local coordinate space
- **Snap to Grid**: Configurable snapping for precise positioning
- **Undo/Redo**: Full history system with keyboard shortcuts

## Features

### Transform Modes
- Click an object to select it
- Use gizmo handles to transform
- Switch modes with keyboard or buttons

### Coordinate Spaces
- **World**: Transform aligned to global axes
- **Local**: Transform aligned to object's local axes

### Snap Settings
- Enable/disable snapping
- Configure position snap increment (default: 0.5 units)
- Configure rotation snap (default: 15°)
- Configure scale snap (default: 0.1)

### History System
- Records all transform operations
- Undo (Ctrl+Z) and Redo (Ctrl+Shift+Z)
- Visual history display
- Delete key resets selected object

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| W | Translate mode |
| E | Rotate mode |
| R | Scale mode |
| Q | Toggle world/local |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Escape | Deselect |
| Delete | Reset transform |

## Running the Demo

```bash
# From repository root
pnpm install
pnpm --filter transform-gizmo dev
```

## Implementation Notes

### TransformControls Integration
The demo uses Three.js TransformControls with:
- Automatic OrbitControls disabling during transforms
- Change tracking for undo/redo
- Real-time transform display updates

### History Architecture
```typescript
interface HistoryEntry {
  objectName: string;
  objectUuid: string;
  action: 'translate' | 'rotate' | 'scale';
  before: TransformState;
  after: TransformState;
  timestamp: number;
}
```

### Object Selection
- Raycaster-based click selection
- Visual feedback in object list
- Gizmo attaches to selected object

## Code Structure

```
transform-gizmo/
├── src/
│   └── main.ts          # Main application with:
│                        # - Scene setup
│                        # - TransformControls config
│                        # - History system
│                        # - UI bindings
│                        # - 3Lens integration
├── index.html           # UI with controls panel
├── package.json
└── README.md
```

## 3Lens Integration

The demo integrates with 3Lens DevTools:
- Scene hierarchy inspection
- Object property viewing
- Performance monitoring
- Transform value tracking

Open the overlay with **Ctrl+Shift+D** for additional debugging tools.

## Use Cases

- Learning TransformControls patterns
- Testing transform precision
- Debugging coordinate space issues
- Understanding undo/redo implementation
- 3D editor prototyping

## Related Examples

- [Camera Controls](../camera-controls/) - Different camera interaction modes
- [Custom Plugin](../custom-plugin/) - Extend 3Lens functionality
- [Visual Overlays](../visual-overlays/) - Scene visualization helpers
