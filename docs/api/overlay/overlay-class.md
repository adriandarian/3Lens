# ThreeLensOverlay Class

The `ThreeLensOverlay` class provides the floating panel overlay UI for 3Lens devtools. It manages multiple draggable panels, plugin integration, and keyboard shortcuts.

## Overview

```typescript
import { createOverlay, ThreeLensOverlay } from '@3lens/overlay';

const overlay: ThreeLensOverlay = createOverlay(probe);

// Show/hide panels
overlay.showPanel('scene');
overlay.hidePanel('stats');

// Toggle menu visibility
overlay.toggle();

// Show toast notifications
overlay.showToast('Material updated', 'success');
```

## Creating an Overlay

The overlay is typically created using factory functions:

```typescript
// Using createOverlay
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe({ appName: 'My App' });
probe.observeRenderer(renderer);
probe.observeScene(scene);

const overlay = createOverlay(probe);
```

```typescript
// Using bootstrapOverlay
import { bootstrapOverlay } from '@3lens/overlay';

const { probe, overlay } = bootstrapOverlay({
  renderer,
  scene,
  appName: 'My App',
});
```

## Constructor

```typescript
constructor(options: OverlayOptions)
```

### OverlayOptions

```typescript
interface OverlayOptions {
  probe: DevtoolProbe;
  panels?: OverlayPanelDefinition[];
}
```

## Public Methods

### Panel Management

#### showPanel(panelId)

Opens a panel if not already open.

```typescript
overlay.showPanel('scene');
overlay.showPanel('stats');
overlay.showPanel('materials');
```

#### hidePanel(panelId)

Closes an open panel.

```typescript
overlay.hidePanel('scene');
```

#### registerPanel(panel)

Registers a custom panel at runtime. Returns an unregister function.

```typescript
const unregister = overlay.registerPanel({
  id: 'my-panel',
  title: 'My Panel',
  icon: '🔧',
  iconClass: 'custom',
  defaultWidth: 400,
  defaultHeight: 300,
  render: (context) => '<div>Panel content</div>',
  onMount: (context) => console.log('Mounted'),
  onDestroy: (context) => console.log('Destroyed'),
});

// Later: remove the panel
unregister();
```

#### unregisterPanel(panelId)

Removes a registered panel. Closes it first if open.

```typescript
overlay.unregisterPanel('my-panel');
```

### Menu Control

#### toggle()

Toggles the panel menu visibility.

```typescript
overlay.toggle();
```

### Notifications

#### showToast(message, type?)

Displays a toast notification.

```typescript
overlay.showToast('Operation complete', 'success');
overlay.showToast('Warning: High memory usage', 'warning');
overlay.showToast('Failed to load texture', 'error');
overlay.showToast('Info message', 'info');
```

| Type | Icon | Use Case |
|------|------|----------|
| `'info'` | ℹ | General information |
| `'success'` | ✓ | Successful operations |
| `'warning'` | ⚠ | Warnings, non-critical issues |
| `'error'` | ✕ | Errors, failures |

### Plugin Integration

#### registerAndActivatePlugin(plugin)

Registers and activates a plugin, creating overlay panels for any panels defined by the plugin.

```typescript
await overlay.registerAndActivatePlugin({
  metadata: {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
  },
  panels: [
    { id: 'custom', name: 'Custom View', render: () => '<div>Content</div>' },
  ],
  activate: (context) => console.log('Activated'),
  deactivate: () => console.log('Deactivated'),
});
```

#### unregisterAndDeactivatePlugin(pluginId)

Deactivates and unregisters a plugin, removing its panels.

```typescript
await overlay.unregisterAndDeactivatePlugin('my-plugin');
```

#### getPluginManager()

Returns the plugin manager instance for direct plugin management.

```typescript
const pluginManager = overlay.getPluginManager();
const plugins = pluginManager.getPlugins();
```

### Lifecycle

#### destroy()

Removes the overlay from the DOM and cleans up resources.

```typescript
// Clean up when done
overlay.destroy();
```

## Panel Definition

Custom panels are defined with the `OverlayPanelDefinition` interface:

```typescript
interface OverlayPanelDefinition {
  /** Unique panel identifier */
  id: string;
  
  /** Display title in menu and panel header */
  title: string;
  
  /** Icon character (emoji or single char) */
  icon: string;
  
  /** CSS class for icon styling */
  iconClass: string;
  
  /** Default width in pixels */
  defaultWidth: number;
  
  /** Default height in pixels (0 = auto) */
  defaultHeight: number;
  
  /** Render function returning panel content */
  render?: (context: OverlayPanelContext) => string | HTMLElement | void;
  
  /** Called when panel is mounted */
  onMount?: (context: OverlayPanelContext) => void;
  
  /** Called when panel is destroyed */
  onDestroy?: (context: OverlayPanelContext) => void;
}
```

### Panel Context

The context passed to panel lifecycle methods:

```typescript
interface OverlayPanelContext {
  /** Unique panel identifier */
  panelId: string;
  
  /** Panel content container element */
  container: HTMLElement;
  
  /** Full panel element (including header) */
  panelElement: HTMLElement;
  
  /** The probe instance */
  probe: DevtoolProbe;
  
  /** The overlay instance */
  overlay: ThreeLensOverlay;
  
  /** Current panel state (position, size, etc.) */
  state: Readonly<OverlayPanelState>;
}
```

### Panel State

```typescript
interface OverlayPanelState {
  id: string;
  x: number;          // Left position
  y: number;          // Top position
  width: number;      // Panel width
  height: number;     // Panel height
  minimized: boolean; // Whether minimized
  zIndex: number;     // Stacking order
}
```

## Built-in Panels

| ID | Title | Description |
|----|-------|-------------|
| `scene` | Scene | Scene tree explorer with object inspector |
| `stats` | Performance | FPS, frame time, draw calls, memory charts |
| `materials` | Materials | Material browser with live editing |
| `geometry` | Geometry | Geometry statistics and analysis |
| `textures` | Textures | Texture browser with thumbnails |
| `render-targets` | Render Targets | Render target inspector |
| `webgpu` | WebGPU | WebGPU-specific debugging info |
| `plugins` | Plugins | Plugin management interface |

## Examples

### Creating a Stats Dashboard Panel

```typescript
overlay.registerPanel({
  id: 'dashboard',
  title: 'Dashboard',
  icon: '📊',
  iconClass: 'dashboard',
  defaultWidth: 500,
  defaultHeight: 400,
  render: (context) => {
    const stats = context.probe.getFrameStats();
    return `
      <div class="dashboard">
        <div class="stat">
          <span class="label">FPS</span>
          <span class="value">${stats ? Math.round(1000 / stats.cpuTimeMs) : '--'}</span>
        </div>
        <div class="stat">
          <span class="label">Draw Calls</span>
          <span class="value">${stats?.drawCalls ?? '--'}</span>
        </div>
        <div class="stat">
          <span class="label">Triangles</span>
          <span class="value">${stats ? (stats.triangles / 1000).toFixed(1) + 'K' : '--'}</span>
        </div>
      </div>
    `;
  },
  onMount: (context) => {
    // Set up refresh interval
    const interval = setInterval(() => {
      context.container.innerHTML = context.overlay.renderPanelContent('dashboard') as string;
    }, 500);
    
    // Store for cleanup
    (context as any)._interval = interval;
  },
  onDestroy: (context) => {
    clearInterval((context as any)._interval);
  },
});
```

### Interactive Panel with Events

```typescript
overlay.registerPanel({
  id: 'controls',
  title: 'Scene Controls',
  icon: '🎮',
  iconClass: 'controls',
  defaultWidth: 300,
  defaultHeight: 200,
  render: () => `
    <div class="controls">
      <button id="btn-wireframe">Toggle Wireframe</button>
      <button id="btn-screenshot">Take Screenshot</button>
      <button id="btn-reset">Reset Camera</button>
    </div>
  `,
  onMount: (context) => {
    const container = context.container;
    
    container.querySelector('#btn-wireframe')?.addEventListener('click', () => {
      // Toggle wireframe mode
      context.probe.toggleWireframe();
      context.overlay.showToast('Wireframe toggled', 'info');
    });
    
    container.querySelector('#btn-screenshot')?.addEventListener('click', () => {
      // Capture screenshot
      context.probe.captureScreenshot();
      context.overlay.showToast('Screenshot saved', 'success');
    });
    
    container.querySelector('#btn-reset')?.addEventListener('click', () => {
      // Reset camera
      context.probe.resetCamera();
    });
  },
});
```

## See Also

- [createOverlay()](./create-overlay.md) - Factory function
- [bootstrapOverlay()](./bootstrap-overlay.md) - One-line setup
- [Overlay Positioning](./overlay-positioning.md) - Panel positioning
- [Keyboard Shortcuts](./keyboard-shortcuts.md) - Shortcut reference
