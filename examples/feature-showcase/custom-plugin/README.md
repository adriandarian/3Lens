# Custom Plugin Example

Learn how to create custom 3Lens plugins with this comprehensive example.

## Overview

This example demonstrates all major plugin system features:

- **Custom Panels**: Live data rendering with HTML templates
- **Plugin Settings**: Configurable options with type-safe schema
- **Toolbar Actions**: Quick-access buttons in the overlay
- **Context Menu Items**: Right-click integrations
- **Inter-Plugin Messaging**: Communication between plugins
- **Plugin State**: Persistent storage during plugin lifecycle
- **Toast Notifications**: User feedback system

## Running the Demo

```bash
# From repository root
pnpm install
pnpm --filter custom-plugin dev
```

## Plugin Structure

### Basic Plugin Definition

```typescript
import type { DevtoolPlugin, DevtoolContext } from '@3lens/core';

const MyPlugin: DevtoolPlugin = {
  // Required: Plugin metadata
  metadata: {
    id: 'com.example.my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'A custom plugin',
    author: 'Your Name',
    icon: '🔌',
    tags: ['example'],
  },

  // Required: Called when plugin is activated
  activate(context: DevtoolContext) {
    context.log('Plugin activated!');
    context.showToast('Hello!', 'success');
  },

  // Optional: Called when plugin is deactivated
  deactivate(context: DevtoolContext) {
    context.log('Plugin deactivated');
  },

  // Optional: Panel definitions
  panels: [...],

  // Optional: Toolbar actions
  toolbarActions: [...],

  // Optional: Context menu items
  contextMenuItems: [...],

  // Optional: Settings schema
  settings: {...},

  // Optional: Settings change handler
  onSettingsChange(settings, context) {...},
};
```

### Custom Panel

```typescript
panels: [
  {
    id: 'my-panel',
    name: 'My Panel',
    icon: '📊',
    order: 10,
    
    // Returns HTML string
    render(ctx: PanelRenderContext): string {
      const stats = ctx.frameStats;
      return `
        <div class="my-panel">
          <h3>FPS: ${stats?.fps.toFixed(1) ?? '-'}</h3>
        </div>
      `;
    },
    
    // Setup event listeners, inject CSS
    onMount(container: HTMLElement, context: DevtoolContext) {
      container.addEventListener('click', (e) => {
        // Handle clicks
      });
    },
    
    // Live updates (called each frame)
    onFrameStats(stats, container) {
      // Update DOM directly for performance
    },
    
    // Cleanup
    onUnmount(container: HTMLElement) {
      // Remove listeners, etc.
    },
  },
],
```

### Plugin Settings

```typescript
settings: {
  fields: [
    {
      key: 'refreshRate',
      label: 'Refresh Rate (ms)',
      type: 'number',
      defaultValue: 100,
      min: 16,
      max: 1000,
      step: 10,
    },
    {
      key: 'showTriangles',
      label: 'Show Triangles',
      type: 'boolean',
      defaultValue: true,
    },
    {
      key: 'highlightColor',
      label: 'Highlight Color',
      type: 'color',
      defaultValue: '#61dafb',
    },
    {
      key: 'mode',
      label: 'Display Mode',
      type: 'select',
      defaultValue: 'detailed',
      options: [
        { value: 'simple', label: 'Simple' },
        { value: 'detailed', label: 'Detailed' },
      ],
    },
  ],
},
```

### Toolbar Actions

```typescript
toolbarActions: [
  {
    id: 'my-action',
    name: 'Toggle Feature',
    icon: '⚡',
    order: 50,
    isToggle: true,
    isActive: () => isEnabled,
    onClick(context: DevtoolContext) {
      isEnabled = !isEnabled;
      context.requestRender();
    },
  },
],
```

### Context Menu Items

```typescript
contextMenuItems: [
  {
    id: 'inspect-object',
    label: 'Inspect with My Plugin',
    icon: '🔍',
    target: 'scene-tree', // or 'inspector', 'viewport', 'all'
    order: 100,
    onClick(context: ContextMenuContext) {
      const node = context.targetNode;
      if (node) {
        context.log(`Inspecting: ${node.name}`);
      }
    },
    isVisible(context) {
      return context.targetNode !== null;
    },
  },
],
```

### Inter-Plugin Messaging

```typescript
// Send a message
context.sendMessage('other-plugin-id', 'MY_EVENT', { data: 'hello' });

// Broadcast to all plugins
context.sendMessage('*', 'BROADCAST_EVENT', { data: 'everyone' });

// Receive messages
const unsubscribe = context.onMessage((message) => {
  if (message.type === 'SOME_EVENT') {
    console.log('Received:', message.payload);
  }
});

// Cleanup in deactivate
deactivate(context) {
  unsubscribe();
}
```

### Plugin State

```typescript
// Store state
context.setState('myKey', { count: 0 });

// Retrieve state
const data = context.getState<{ count: number }>('myKey');

// Get all state
const allState = context.getAllState();

// Clear state
context.clearState();
```

## DevtoolContext API

The context object provides access to:

| Method | Description |
|--------|-------------|
| `probe` | Direct probe instance access |
| `getFrameStats()` | Current frame statistics |
| `getSnapshot()` | Current scene snapshot |
| `getSelectedNode()` | Currently selected node |
| `selectObject(uuid)` | Select an object |
| `clearSelection()` | Clear selection |
| `getEntities()` | All logical entities |
| `getModuleInfo(id)` | Module information |
| `log(msg, data?)` | Log to console |
| `showToast(msg, type?)` | Show notification |
| `getState<T>(key)` | Get plugin state |
| `setState(key, value)` | Set plugin state |
| `getAllState()` | Get all state |
| `clearState()` | Clear all state |
| `sendMessage(target, type, payload)` | Send message |
| `onMessage(handler)` | Subscribe to messages |
| `requestRender()` | Re-render panels |

## Registering Plugins

```typescript
import { bootstrapOverlay } from '@3lens/overlay';

const overlay = bootstrapOverlay({ probe });

// Register and activate
await overlay.registerAndActivatePlugin(MyPlugin);

// Or manually
probe.registerPlugin(MyPlugin);
await probe.activatePlugin('com.example.my-plugin');
```

## Files Structure

```
custom-plugin/
├── src/
│   └── main.ts          # Full plugin implementation
│                        # - StatsMonitorPlugin (comprehensive)
│                        # - MessageReceiverPlugin (messaging demo)
│                        # - Scene setup
│                        # - UI bindings
├── index.html           # Demo UI with controls
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Plugins in This Example

### Stats Monitor Plugin
Full-featured plugin demonstrating:
- Live statistics panel
- Settings with all field types
- Toolbar actions
- Context menu items
- Message handling
- State persistence

### Message Receiver Plugin
Simple plugin showing:
- Inter-plugin communication
- Message logging

## Related Documentation

- [Plugin API Reference](../../docs/API.md#plugins)
- [Built-in Plugins](../../packages/core/src/plugins/builtin/)
- [LOD Checker Source](../../packages/core/src/plugins/builtin/lod-checker.ts)
- [Shadow Debugger Source](../../packages/core/src/plugins/builtin/shadow-debugger.ts)

## Related Examples

- [Configuration Rules](../configuration-rules/) - Config-based rules
- [Visual Overlays](../visual-overlays/) - Visual debugging
- [Timeline Recording](../timeline-recording/) - Recording & playback
