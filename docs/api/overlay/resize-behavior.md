# Panel Resize Behavior

The 3Lens overlay panels support interactive resizing, allowing users to adjust panel dimensions to fit their workflow.

## Resize Handle

Each panel has a resize handle in the bottom-right corner:

```
┌─────────────────────────────────────┐
│ 🔧 Panel Title              [_][×] │
├─────────────────────────────────────┤
│                                     │
│        Panel Content                │
│                                     │
│                                   ╱ │  ← Resize handle
└─────────────────────────────────────┘
```

## Resize Interaction

### Starting a Resize

1. Position cursor over the resize handle (bottom-right corner)
2. Cursor changes to indicate resize mode
3. Click and drag to resize

### During Resize

- **Horizontal**: Drag left/right to change width
- **Vertical**: Drag up/down to change height
- **Diagonal**: Drag diagonally to change both

### Resize Constraints

| Constraint | Value | Purpose |
|------------|-------|---------|
| Minimum Width | 280px | Ensures content remains usable |
| Minimum Height | 100px | Prevents collapse beyond header |
| Maximum | None | Panels can grow to viewport size |

```typescript
// Resize calculation with constraints
state.width = Math.max(280, startWidth + dx);
state.height = Math.max(100, startHeight + dy);
```

## Auto-Height Panels

The Scene panel uses auto-height mode:

### Normal State

```css
.three-lens-panel-scene {
  height: auto;           /* Content determines height */
  max-height: 450px;      /* Maximum before scrolling */
  overflow: hidden;
}
```

### During Resize

When resizing an auto-height panel:

1. Current computed height is captured
2. Panel switches to explicit height mode
3. `max-height` is removed
4. User can resize freely

```typescript
private startResize(panelId: string, e: MouseEvent): void {
  const el = document.getElementById(`three-lens-panel-${panelId}`);
  const rect = el.getBoundingClientRect();
  
  // Disable transitions during resize
  el.classList.add('resizing');
  
  // Switch from auto to explicit height
  el.style.height = `${rect.height}px`;
  el.style.maxHeight = 'none';
  state.height = rect.height;
}
```

## CSS Styling

### Resize Handle Styles

```css
.three-lens-panel-resize {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: se-resize;        /* Diagonal resize cursor */
  opacity: 0;               /* Hidden by default */
  transition: opacity 0.2s;
}

.three-lens-panel:hover .three-lens-panel-resize {
  opacity: 0.5;             /* Visible on panel hover */
}

.three-lens-panel-resize:hover {
  opacity: 1;               /* Full opacity on direct hover */
}
```

### Resizing State

```css
/* Disable transitions during active resize */
.three-lens-panel.resizing {
  transition: none !important;
}

.three-lens-panel.resizing * {
  transition: none !important;
}
```

## Panel-Specific Sizing

### Default Sizes

| Panel | Width | Height | Notes |
|-------|-------|--------|-------|
| Scene | 560px | Auto (max 450px) | Tree + inspector |
| Performance | 320px | 400px | Charts need height |
| Materials | 700px | 500px | Wide for properties |
| Geometry | 750px | 500px | Detailed stats |
| Textures | 800px | 520px | Thumbnails grid |
| Render Targets | 850px | 550px | Preview images |
| WebGPU | 700px | 500px | Detailed info |
| Plugins | 420px | 480px | List + settings |

### Custom Panel Sizing

When creating custom panels, consider content needs:

```typescript
const analyticsPanel: OverlayPanelDefinition = {
  id: 'analytics',
  title: 'Analytics',
  icon: '📈',
  iconClass: 'analytics',
  
  // For charts and graphs - need more space
  defaultWidth: 600,
  defaultHeight: 400,
  
  render: (context) => {
    // Wide content benefits from larger default
    return renderAnalyticsCharts(context);
  },
};
```

```typescript
const quickInfoPanel: OverlayPanelDefinition = {
  id: 'quick-info',
  title: 'Quick Info',
  icon: 'ℹ️',
  iconClass: 'info',
  
  // Compact info display - smaller default
  defaultWidth: 280,
  defaultHeight: 200,
  
  render: (context) => {
    return `<div>${context.probe.getFrameStats()?.fps ?? 0} FPS</div>`;
  },
};
```

## Resize State Tracking

### Internal State

```typescript
interface ResizeState {
  panelId: string;
  startX: number;       // Mouse X at start
  startY: number;       // Mouse Y at start
  startWidth: number;   // Panel width at start
  startHeight: number;  // Panel height at start
}
```

### Mouse Events

```typescript
// Start resize
resize.addEventListener('mousedown', (e) => {
  e.preventDefault();
  this.startResize(panelId, e);
});

// Handle movement (document level)
document.addEventListener('mousemove', (e) => {
  if (this.resizeState) {
    const dx = e.clientX - this.resizeState.startX;
    const dy = e.clientY - this.resizeState.startY;
    
    state.width = Math.max(280, this.resizeState.startWidth + dx);
    state.height = Math.max(100, this.resizeState.startHeight + dy);
    
    el.style.width = `${state.width}px`;
    el.style.height = `${state.height}px`;
  }
});

// End resize
document.addEventListener('mouseup', () => {
  if (this.resizeState) {
    el.classList.remove('resizing');
  }
  this.resizeState = null;
});
```

## Content Adaptation

### Responsive Content

Panel content should adapt to available space:

```typescript
render: (context) => {
  const { width, height } = context.state;
  
  // Compact layout for small panels
  if (width < 400) {
    return renderCompactView();
  }
  
  // Full layout for larger panels
  return renderFullView();
}
```

### Scrolling Content

For content that may exceed panel size:

```css
.three-lens-panel-content {
  overflow: auto;           /* Enable scrolling */
  max-height: calc(100% - 40px);  /* Account for header */
}
```

### Virtual Scrolling

For very large content (e.g., scene trees with 100+ nodes), the overlay uses virtual scrolling:

```typescript
// Virtual scroll kicks in for large trees
private virtualScrollThreshold = 100;

// Only visible items are rendered
if (nodeCount > this.virtualScrollThreshold) {
  return this.renderVirtualTree();
}
```

## Persisting Panel State

Currently, panel positions and sizes are not persisted across page reloads. Future versions may add:

```typescript
// Potential future API
interface OverlayOptions {
  // Persist panel layout to localStorage
  persistLayout?: boolean;
  
  // Custom storage key
  storageKey?: string;
}
```

## Best Practices

### Minimum Viable Size

Always ensure your panel content is usable at minimum size:

```typescript
{
  defaultWidth: 400,
  defaultHeight: 300,
  render: (context) => {
    // Content should work at 280x100 minimum
    return `
      <div style="min-width: 250px; min-height: 80px;">
        ${renderContent()}
      </div>
    `;
  },
}
```

### Responsive Breakpoints

```typescript
render: (context) => {
  const w = context.state.width;
  
  if (w < 350) return renderMini(context);
  if (w < 500) return renderCompact(context);
  return renderFull(context);
}
```

### Handle Content Overflow

```typescript
render: (context) => {
  return `
    <div class="panel-content" style="
      overflow-x: hidden;
      overflow-y: auto;
      max-height: ${context.state.height - 48}px;
    ">
      ${generateContent()}
    </div>
  `;
}
```

## See Also

- [Overlay Positioning](./overlay-positioning.md) - Panel positioning
- [Keyboard Shortcuts](./keyboard-shortcuts.md) - Navigation shortcuts
- [ThreeLensOverlay](./overlay-class.md) - Full class API
