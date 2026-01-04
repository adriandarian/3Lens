# Overlay Positioning

The 3Lens overlay uses a floating panel system where each panel can be positioned anywhere on the screen, dragged to new locations, and stacked with proper z-ordering.

## Panel Positioning System

### Initial Placement

When a panel opens, it's positioned using a cascading algorithm:

```typescript
// Panels open at (100, 100) plus an offset based on 
// how many panels are already open
const offset = openPanels.size * 30;
const initialPosition = {
  x: 100 + offset,
  y: 100 + offset,
};
```

This creates a "cascade" effect where each new panel appears slightly offset from the previous one, making all panels visible.

### Panel State

Each panel maintains its own position state:

```typescript
interface OverlayPanelState {
  id: string;
  x: number;       // Left position in pixels
  y: number;       // Top position in pixels
  width: number;   // Panel width
  height: number;  // Panel height
  minimized: boolean;
  zIndex: number;  // Stacking order
}
```

## Dragging Panels

### Drag Handle

Panels can be dragged by clicking and holding the panel header:

```
┌─────────────────────────────────────┐
│ 🔧 Panel Title              [_][×] │  ← Drag handle (header)
├─────────────────────────────────────┤
│                                     │
│        Panel Content                │
│                                     │
└─────────────────────────────────────┘
```

### Drag Behavior

- **Drag Start**: Click and hold on the panel header
- **During Drag**: Panel follows mouse cursor smoothly
- **Constraints**: Panel cannot be dragged above `y = 0` or to the left of `x = 0`
- **Drag End**: Panel stays at release position

### Implementation Details

The drag system tracks:

```typescript
interface DragState {
  panelId: string;
  startX: number;      // Initial mouse X
  startY: number;      // Initial mouse Y
  startPanelX: number; // Panel's initial X
  startPanelY: number; // Panel's initial Y
}
```

Movement is calculated as:

```typescript
const dx = currentMouseX - dragState.startX;
const dy = currentMouseY - dragState.startY;

newX = Math.max(0, dragState.startPanelX + dx);
newY = Math.max(0, dragState.startPanelY + dy);
```

## Z-Ordering (Stacking)

### Focus Behavior

When a panel is clicked or opened, it moves to the top of the stack:

```typescript
// Each panel interaction increases the top z-index
private topZIndex = 999997;

private focusPanel(panelId: string): void {
  state.zIndex = ++this.topZIndex;
}
```

### Z-Index Values

| Element | Z-Index | Purpose |
|---------|---------|---------|
| Base | 999997 | Starting z-index for panels |
| Panels | 999997+ | Incrementing with each focus |
| FAB | 999999 | Floating action button stays on top |
| Menu | 999998 | Panel menu stays above panels |
| Toasts | 1000000 | Notifications always visible |

## Panel Menu (FAB)

### Floating Action Button

The FAB (Floating Action Button) provides access to all panels:

```
        ┌─────────────────┐
        │ Panels          │
        ├─────────────────┤
        │ ● Scene         │  ← Active (panel open)
        │ ○ Performance   │  ← Inactive
        │ ○ Materials     │
        │ ○ Textures      │
        │ ○ Plugins       │
        └─────────────────┘
                ▲
         ┌──────┴──────┐
         │    3Lens    │  ← FAB (bottom-right)
         │     ▲       │
         └─────────────┘
```

### FAB Position

The FAB is fixed to the bottom-right corner:

```css
.three-lens-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999999;
}
```

### Menu Toggle

- **Click FAB**: Toggles menu visibility
- **Click Outside**: Closes menu
- **Keyboard**: `Ctrl+Shift+D` toggles menu

## Panel Types and Sizing

### Default Panel Sizes

| Panel | Default Width | Default Height |
|-------|---------------|----------------|
| Scene | 560px | Auto (max 450px) |
| Performance | 320px | 400px |
| Materials | 700px | 500px |
| Geometry | 750px | 500px |
| Textures | 800px | 520px |
| Render Targets | 850px | 550px |
| WebGPU | 700px | 500px |
| Plugins | 420px | 480px |

### Auto-Height Panels

The Scene panel uses auto-height with a maximum constraint:

```css
.three-lens-panel-scene {
  height: auto;
  max-height: 450px;
  overflow: hidden;
}
```

This allows the panel to grow based on content but not exceed the screen.

## CSS Classes

### Panel Structure

```html
<div class="three-lens-panel" style="left: 100px; top: 100px; ...">
  <div class="three-lens-panel-header" data-panel="scene">
    <span class="three-lens-panel-icon scene">S</span>
    <span class="three-lens-panel-title">Scene</span>
    <div class="three-lens-panel-controls">
      <button class="three-lens-panel-btn minimize">_</button>
      <button class="three-lens-panel-btn close">×</button>
    </div>
  </div>
  <div class="three-lens-panel-content">
    <!-- Panel content -->
  </div>
  <div class="three-lens-panel-resize"></div>
</div>
```

### Panel States

| State | Class | Description |
|-------|-------|-------------|
| Normal | `.three-lens-panel` | Default visible state |
| Minimized | `.three-lens-panel.minimized` | Collapsed to header only |
| Resizing | `.three-lens-panel.resizing` | During resize operation |
| Focused | `.three-lens-panel.focused` | Currently focused panel |

## Programmatic Positioning

### Opening at Specific Position

While there's no direct API for setting position, you can modify the panel state after opening:

```typescript
// Open the panel
overlay.showPanel('scene');

// The panel state is tracked internally
// Custom panels can use their context to access state:
onMount: (context) => {
  console.log('Panel position:', context.state.x, context.state.y);
  console.log('Panel size:', context.state.width, context.state.height);
}
```

### Panel Arrangement Patterns

```typescript
// Open multiple panels in a layout
overlay.showPanel('scene');
overlay.showPanel('stats');
overlay.showPanel('materials');

// Panels will cascade automatically:
// Scene:    (100, 100)
// Stats:    (130, 130)
// Materials:(160, 160)
```

## Best Practices

### Responsive Design

1. **Minimum Sizes**: Panels have minimum width (280px) and height (100px)
2. **Viewport Bounds**: Panels stay within viewport boundaries
3. **Mobile**: Consider touch targets for mobile devices

### Multiple Panels

1. **Cascade**: New panels offset from existing ones
2. **Focus**: Click brings panel to top
3. **Minimize**: Collapse panels to reduce clutter

### Custom Panels

When creating custom panels, consider:

```typescript
{
  // Appropriate default size for content
  defaultWidth: 400,   // Wide enough for content
  defaultHeight: 300,  // Tall enough without scroll
  
  // Use auto-height (0) for variable content
  defaultHeight: 0,
}
```

## See Also

- [Resize Behavior](./resize-behavior.md) - Panel resizing
- [Keyboard Shortcuts](./keyboard-shortcuts.md) - Navigation shortcuts
- [ThreeLensOverlay](./overlay-class.md) - Full class API
