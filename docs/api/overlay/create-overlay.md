# createOverlay()

The `createOverlay()` function creates and attaches the 3Lens devtools overlay UI to your application.

## Overview

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// Create the probe first
const probe = createProbe({ appName: 'My App' });
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Create the overlay
const overlay = createOverlay(probe);
```

## Signature

```typescript
function createOverlay(
  probe: DevtoolProbe,
  options?: Partial<Omit<OverlayOptions, 'probe'>>
): ThreeLensOverlay;
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `probe` | `DevtoolProbe` | The probe instance to connect to |
| `options` | `Partial<OverlayOptions>` | Optional configuration for the overlay |

### OverlayOptions

```typescript
interface OverlayOptions {
  probe: DevtoolProbe;
  /**
   * Optional custom panel definitions to register at startup.
   * Panels registered here will appear alongside the built-in
   * Scene and Performance panels in the overlay menu.
   */
  panels?: OverlayPanelDefinition[];
}
```

## Returns

Returns a `ThreeLensOverlay` instance that provides methods to control the overlay.

## Usage Examples

### Basic Setup

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import * as THREE from 'three';

// Set up Three.js scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

// Initialize 3Lens
const probe = createProbe({ appName: 'My Three.js App' });
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Create overlay UI
const overlay = createOverlay(probe);
```

### With Custom Panels

```typescript
import { createOverlay, type OverlayPanelDefinition } from '@3lens/overlay';

const customPanel: OverlayPanelDefinition = {
  id: 'my-custom-panel',
  title: 'Custom Panel',
  icon: '🔧',
  iconClass: 'custom',
  defaultWidth: 400,
  defaultHeight: 300,
  render: (context) => {
    return `
      <div class="custom-content">
        <h3>Custom Panel Content</h3>
        <p>Scene: ${context.probe.getObservedScenes().length} scenes</p>
      </div>
    `;
  },
  onMount: (context) => {
    console.log('Custom panel mounted');
  },
  onDestroy: (context) => {
    console.log('Custom panel destroyed');
  },
};

const overlay = createOverlay(probe, {
  panels: [customPanel],
});
```

### Registering Panels at Runtime

```typescript
const overlay = createOverlay(probe);

// Register a panel later
const unregister = overlay.registerPanel({
  id: 'dynamic-panel',
  title: 'Dynamic Panel',
  icon: '📊',
  iconClass: 'dynamic',
  defaultWidth: 350,
  defaultHeight: 250,
  render: (context) => '<div>Dynamic content</div>',
});

// Remove the panel when no longer needed
unregister();
```

## Built-in Panels

The overlay comes with several built-in panels:

| Panel ID | Title | Description |
|----------|-------|-------------|
| `scene` | Scene | Scene tree explorer and object inspector |
| `stats` | Performance | FPS, frame time, draw calls, memory |
| `materials` | Materials | Material browser and editor |
| `geometry` | Geometry | Geometry analysis and statistics |
| `textures` | Textures | Texture browser with previews |
| `render-targets` | Render Targets | Render target inspector |
| `webgpu` | WebGPU | WebGPU-specific debugging info |
| `plugins` | Plugins | Plugin manager interface |

## Toast Notifications

The overlay provides a toast notification system:

```typescript
// Show toast messages
overlay.showToast('Material updated', 'success');
overlay.showToast('Warning: High triangle count', 'warning');
overlay.showToast('Error loading texture', 'error');
overlay.showToast('Scene snapshot taken', 'info');
```

## Plugin Integration

Access the plugin manager through the overlay:

```typescript
const pluginManager = overlay.getPluginManager();

// Register and activate a plugin
await overlay.registerAndActivatePlugin(myPlugin);

// Deactivate and unregister
await overlay.unregisterAndDeactivatePlugin('my-plugin-id');
```

## See Also

- [bootstrapOverlay()](./bootstrap-overlay.md) - One-line setup helper
- [ThreeLensOverlay Class](./overlay-class.md) - Full class API
- [Custom Panels](./custom-panels.md) - Creating custom panels
- [DevtoolProbe](/api/core/devtool-probe.md) - The core probe API
