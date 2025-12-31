# Visual Overlays Demo

This example demonstrates 3Lens visual overlay features for debugging and inspecting Three.js scenes.

## Features Demonstrated

### Selection Highlighting
- **Cyan BoxHelper** appears when an object is selected
- Click objects in the list or use inspect mode to select
- Selection state persists until cleared

### Hover Highlighting
- **Blue BoxHelper** appears when hovering over objects in inspect mode
- Lighter opacity than selection highlight
- Helps identify objects before clicking

### Per-Object Overlays
- **Wireframe Toggle**: Show triangle edges for selected mesh
- **Bounding Box Toggle**: Display AABB for selected mesh
- State is tracked per-object

### Global Wireframe
- Apply wireframe to ALL meshes in the scene
- Useful for understanding scene geometry structure
- Excludes 3Lens helper objects

### Inspect Mode
- Click-to-select functionality
- Cursor changes to crosshair when enabled
- Integrates with 3Lens raycasting system

## Installation

```bash
cd examples/feature-showcase/visual-overlays
pnpm install
pnpm dev
```

## Usage

### UI Controls

| Control | Action |
|---------|--------|
| Object List | Click to select objects |
| Wireframe Toggle | Toggle per-object wireframe |
| Bounding Box Toggle | Toggle per-object bounding box |
| Global Wireframe | Apply wireframe to all meshes |
| Inspect Mode | Enable click-to-select in viewport |
| Clear Selection | Deselect current object |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `I` | Toggle inspect mode |
| `W` | Toggle wireframe (selected) |
| `B` | Toggle bounding box (selected) |
| `G` | Toggle global wireframe |
| `Esc` | Clear selection |

## API Reference

### Selection Methods

```typescript
// Select an object programmatically
probe.selectObject(mesh);

// Clear selection
probe.selectObject(null);

// Get currently selected object
const selected = probe.getSelectedObject();
```

### Visual Overlay Methods

```typescript
// Per-object wireframe
probe.toggleWireframe(object, true);
probe.toggleWireframe(object, false);
const isWireframe = probe.isWireframeEnabled(object);

// Per-object bounding box
probe.toggleBoundingBox(object, true);
probe.toggleBoundingBox(object, false);
const hasBBox = probe.isBoundingBoxEnabled(object);

// Toggle for selected object
probe.toggleSelectedWireframe(true);
probe.toggleSelectedBoundingBox(true);
```

### Global Wireframe

```typescript
// Enable/disable global wireframe
probe.toggleGlobalWireframe(true);
probe.toggleGlobalWireframe(false);

// Check state
const isGlobal = probe.isGlobalWireframeEnabled();
```

### Inspect Mode

```typescript
// Enable inspect mode (click-to-select)
probe.setInspectModeEnabled(true);

// Listen for selection changes
probe.onSelectionChanged((object, metadata) => {
  console.log('Selected:', object?.name);
});
```

## Visual Legend

| Color | Meaning |
|-------|---------|
| Cyan (#22d3ee) | Selection highlight |
| Blue (#60a5fa) | Hover highlight |
| Cyan dashed | Bounding box overlay |

## Implementation Details

### SelectionHelper Class

The `SelectionHelper` class manages visual highlights:

```typescript
class SelectionHelper {
  // Selection highlight (cyan)
  highlight(object: THREE.Object3D | null): void;
  clearHighlight(): void;
  
  // Hover highlight (blue)
  highlightHover(object: THREE.Object3D | null): void;
  clearHoverHighlight(): void;
  
  // Update helpers (call in animation loop)
  update(): void;
}
```

### Visualization Storage

Visual overlays are tracked using a Map with keys like:
- `{uuid}_wireframe` - Wireframe state
- `{uuid}_boundingBox` - Bounding box helper

### Inspect Mode Integration

When inspect mode is enabled:
1. Pointer events are captured on the canvas
2. Raycasting determines intersected objects
3. Hover triggers `highlightHover()`
4. Click triggers `selectObject()`
5. Selection triggers `highlight()`

## Best Practices

1. **Performance**: Disable overlays when not debugging
2. **Selection Cleanup**: Call `clearSelection()` when switching scenes
3. **Helper Disposal**: The probe automatically cleans up helpers
4. **Cursor Feedback**: Inspect mode changes cursor to crosshair

## Troubleshooting

### Overlays Not Appearing
- Ensure `probe.setThreeReference(THREE)` is called
- Check that the object is a Mesh (not Group or Light)
- Verify the scene is being observed

### Selection Not Working
- Enable inspect mode first (`I` key)
- Check that OrbitControls aren't blocking events
- Ensure objects are in the raycast list

### Global Wireframe Missing Objects
- Only affects MeshBasicMaterial, MeshStandardMaterial, etc.
- Line-based geometries don't support wireframe
- 3Lens helpers are intentionally excluded

## Related Examples

- [Transform Gizmo](../transform-gizmo) - Object manipulation
- [Camera Controls](../camera-controls) - Focus on selection
- [Cost Analysis](../cost-analysis) - Visual cost indicators
