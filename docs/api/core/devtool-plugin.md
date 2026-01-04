# DevtoolPlugin Interface

The `DevtoolPlugin` interface defines the structure for creating 3Lens plugins. Plugins extend 3Lens functionality by adding custom panels, toolbar actions, context menu items, and more.

## Overview

```typescript
import type { DevtoolPlugin, DevtoolContext } from '@3lens/core';

const myPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'A custom 3Lens plugin',
    author: 'Your Name',
    icon: '🔧',
    tags: ['utility', 'debugging'],
  },

  activate(context: DevtoolContext) {
    context.log('Plugin activated!');
  },

  deactivate(context: DevtoolContext) {
    context.log('Plugin deactivated!');
  },

  panels: [
    {
      id: 'my-panel',
      name: 'My Panel',
      icon: '📊',
      render: (ctx) => '<div>Hello from my plugin!</div>',
    },
  ],
};
```

## Interface Definition

```typescript
interface DevtoolPlugin {
  /** Plugin metadata (required) */
  metadata: PluginMetadata;

  /** Called when the plugin is activated (required) */
  activate(context: DevtoolContext): void | Promise<void>;

  /** Called when the plugin is deactivated (optional) */
  deactivate?(context: DevtoolContext): void | Promise<void>;

  /** Panel definitions (optional) */
  panels?: PanelDefinition[];

  /** Toolbar action definitions (optional) */
  toolbarActions?: ToolbarActionDefinition[];

  /** Context menu item definitions (optional) */
  contextMenuItems?: ContextMenuItemDefinition[];

  /** Settings schema for plugin configuration (optional) */
  settings?: PluginSettingsSchema;

  /** Called when plugin settings change (optional) */
  onSettingsChange?: (settings: Record<string, unknown>, context: DevtoolContext) => void;
}
```

## PluginMetadata

Required metadata that identifies and describes your plugin.

```typescript
interface PluginMetadata {
  /** Unique plugin identifier (e.g., 'com.example.my-plugin') */
  id: PluginId;

  /** Display name */
  name: string;

  /** Plugin version (semver format) */
  version: string;

  /** Plugin description (optional) */
  description?: string;

  /** Plugin author (optional) */
  author?: string;

  /** Plugin homepage or repository URL (optional) */
  homepage?: string;

  /** Minimum 3Lens version required (optional) */
  minVersion?: string;

  /** Plugin icon - emoji or URL (optional) */
  icon?: string;

  /** Tags for categorization (optional) */
  tags?: string[];
}
```

**Example:**

```typescript
metadata: {
  id: '3lens.shadow-debugger',
  name: 'Shadow Debugger',
  version: '1.0.0',
  description: 'Analyzes shadow maps to find performance issues',
  author: '3Lens Team',
  homepage: 'https://github.com/3lens/3lens',
  minVersion: '1.0.0',
  icon: '🌑',
  tags: ['performance', 'shadows', 'debugging'],
}
```

::: tip Plugin ID Convention
Use reverse domain notation for plugin IDs: `com.yourcompany.plugin-name`. Built-in plugins use the `3lens.` prefix.
:::

## Lifecycle Methods

### activate

Called when the plugin is activated. Use this to initialize your plugin state and set up any listeners.

```typescript
activate(context: DevtoolContext): void | Promise<void>
```

**Example:**

```typescript
activate(context: DevtoolContext) {
  context.log('Plugin activated');
  
  // Initialize state
  context.setState('counter', 0);
  
  // Subscribe to messages from other plugins
  context.onMessage((message) => {
    if (message.type === 'highlight-object') {
      // Handle the message
    }
  });
}
```

### deactivate

Called when the plugin is deactivated. Use this to clean up resources, stop timers, and remove any visual elements.

```typescript
deactivate?(context: DevtoolContext): void | Promise<void>
```

**Example:**

```typescript
deactivate(context: DevtoolContext) {
  context.log('Plugin deactivated');
  
  // Clean up interval
  const intervalId = context.getState<number>('intervalId');
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  // Clear state
  context.clearState();
}
```

## Panel Definitions

Panels appear as tabs in the 3Lens overlay.

```typescript
interface PanelDefinition {
  /** Unique panel ID within the plugin */
  id: string;

  /** Panel display name */
  name: string;

  /** Panel icon (emoji or URL) */
  icon?: string;

  /** Panel order in the tab bar (lower = left) */
  order?: number;

  /** Render function that returns HTML content */
  render: (context: PanelRenderContext) => string;

  /** Called after the panel is mounted to the DOM */
  onMount?: (container: HTMLElement, context: DevtoolContext) => void;

  /** Called before the panel is unmounted */
  onUnmount?: (container: HTMLElement) => void;

  /** Called when frame stats are updated */
  onFrameStats?: (stats: FrameStats, container: HTMLElement) => void;

  /** Called when the scene snapshot is updated */
  onSnapshot?: (snapshot: SceneSnapshot, container: HTMLElement) => void;

  /** Called when selection changes */
  onSelectionChange?: (node: SceneNode | null, container: HTMLElement) => void;
}
```

**Example:**

```typescript
panels: [
  {
    id: 'stats',
    name: 'Statistics',
    icon: '📈',
    order: 10,

    render(ctx) {
      const stats = ctx.frameStats;
      if (!stats) return '<div>Waiting for data...</div>';

      return `
        <div class="stats-panel">
          <h3>Frame Stats</h3>
          <p>FPS: ${stats.fps.toFixed(1)}</p>
          <p>Draw Calls: ${stats.drawCalls}</p>
          <p>Triangles: ${stats.triangles.toLocaleString()}</p>
        </div>
      `;
    },

    onMount(container, context) {
      // Add event listeners, initialize charts, etc.
      container.addEventListener('click', handleClick);
    },

    onUnmount(container) {
      // Clean up event listeners
      container.removeEventListener('click', handleClick);
    },

    onFrameStats(stats, container) {
      // Update specific elements without full re-render
      const fpsEl = container.querySelector('.fps-value');
      if (fpsEl) fpsEl.textContent = stats.fps.toFixed(1);
    },
  },
],
```

### PanelRenderContext

Context provided to the panel `render` function:

```typescript
interface PanelRenderContext {
  /** Current frame stats */
  frameStats: FrameStats | null;

  /** Current scene snapshot */
  snapshot: SceneSnapshot | null;

  /** Currently selected node */
  selectedNode: SceneNode | null;

  /** Plugin's stored state */
  state: Record<string, unknown>;

  /** Probe instance */
  probe: DevtoolProbe;
}
```

## Toolbar Actions

Toolbar actions appear in the 3Lens toolbar.

```typescript
interface ToolbarActionDefinition {
  /** Unique action ID within the plugin */
  id: string;

  /** Action display name (shown on hover) */
  name: string;

  /** Action icon (emoji or URL) */
  icon: string;

  /** Action order in toolbar (lower = left) */
  order?: number;

  /** Whether the action is a toggle */
  isToggle?: boolean;

  /** Current toggle state (for toggle actions) */
  isActive?: () => boolean;

  /** Called when the action is triggered */
  onClick: (context: DevtoolContext) => void | Promise<void>;

  /** Whether the action is enabled */
  isEnabled?: (context: DevtoolContext) => boolean;

  /** Keyboard shortcut (e.g., 'ctrl+shift+w') */
  shortcut?: string;
}
```

**Example:**

```typescript
toolbarActions: [
  {
    id: 'toggle-wireframe',
    name: 'Toggle Wireframe',
    icon: '🔲',
    isToggle: true,
    shortcut: 'ctrl+shift+w',

    isActive() {
      return wireframeEnabled;
    },

    onClick(context) {
      wireframeEnabled = !wireframeEnabled;
      applyWireframeToScene(context.probe);
      context.requestRender();
    },
  },
  {
    id: 'export-stats',
    name: 'Export Statistics',
    icon: '📤',

    async onClick(context) {
      const stats = context.getFrameStats();
      await downloadAsJson(stats, 'stats.json');
      context.showToast('Statistics exported!', 'success');
    },

    isEnabled(context) {
      return context.getFrameStats() !== null;
    },
  },
],
```

## Context Menu Items

Add items to context menus in the scene tree, inspector, or viewport.

```typescript
interface ContextMenuItemDefinition {
  /** Unique item ID within the plugin */
  id: string;

  /** Menu item label */
  label: string;

  /** Menu item icon (emoji or URL) */
  icon?: string;

  /** Item order in menu (lower = top) */
  order?: number;

  /** Where this menu item appears */
  target: 'scene-tree' | 'inspector' | 'viewport' | 'all';

  /** Called when the item is clicked */
  onClick: (context: ContextMenuContext) => void | Promise<void>;

  /** Whether the item is visible */
  isVisible?: (context: ContextMenuContext) => boolean;

  /** Whether the item is enabled */
  isEnabled?: (context: ContextMenuContext) => boolean;

  /** Submenu items */
  submenu?: ContextMenuItemDefinition[];
}
```

**Example:**

```typescript
contextMenuItems: [
  {
    id: 'copy-transform',
    label: 'Copy Transform',
    icon: '📋',
    target: 'scene-tree',

    onClick(context) {
      if (context.targetObject) {
        const transform = {
          position: context.targetObject.position.toArray(),
          rotation: context.targetObject.rotation.toArray(),
          scale: context.targetObject.scale.toArray(),
        };
        navigator.clipboard.writeText(JSON.stringify(transform, null, 2));
        context.showToast('Transform copied!', 'success');
      }
    },

    isVisible(context) {
      return context.targetObject !== null;
    },
  },
  {
    id: 'debug-menu',
    label: 'Debug',
    icon: '🐛',
    target: 'scene-tree',
    submenu: [
      {
        id: 'log-object',
        label: 'Log to Console',
        onClick(context) {
          console.log(context.targetObject);
        },
      },
      {
        id: 'inspect-material',
        label: 'Inspect Material',
        onClick(context) {
          console.log((context.targetObject as THREE.Mesh).material);
        },
        isVisible(context) {
          return (context.targetObject as THREE.Mesh)?.material !== undefined;
        },
      },
    ],
  },
],
```

## Complete Plugin Example

```typescript
import type { DevtoolPlugin, DevtoolContext } from '@3lens/core';

let highlightMaterial: THREE.MeshBasicMaterial | null = null;

export const ObjectHighlighterPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.object-highlighter',
    name: 'Object Highlighter',
    version: '1.0.0',
    description: 'Highlights objects on hover',
    icon: '✨',
    tags: ['visual', 'utility'],
  },

  settings: {
    fields: [
      {
        key: 'highlightColor',
        label: 'Highlight Color',
        type: 'color',
        defaultValue: '#ff0000',
      },
      {
        key: 'opacity',
        label: 'Highlight Opacity',
        type: 'number',
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
      },
    ],
  },

  activate(context) {
    context.log('Object Highlighter activated');
    // Initialize highlight material
    highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
    });
  },

  deactivate(context) {
    context.log('Object Highlighter deactivated');
    if (highlightMaterial) {
      highlightMaterial.dispose();
      highlightMaterial = null;
    }
  },

  onSettingsChange(settings, context) {
    if (highlightMaterial) {
      highlightMaterial.color.set(settings.highlightColor as string);
      highlightMaterial.opacity = settings.opacity as number;
    }
  },

  toolbarActions: [
    {
      id: 'toggle-highlight',
      name: 'Toggle Highlight Mode',
      icon: '✨',
      isToggle: true,
      isActive: () => highlightMode,
      onClick(context) {
        highlightMode = !highlightMode;
        context.showToast(
          highlightMode ? 'Highlight mode ON' : 'Highlight mode OFF',
          'info'
        );
      },
    },
  ],

  panels: [
    {
      id: 'highlight-info',
      name: 'Highlight Info',
      icon: '✨',
      render(ctx) {
        const selected = ctx.selectedNode;
        if (!selected) {
          return '<div class="empty">Select an object to see info</div>';
        }

        return `
          <div class="highlight-info">
            <h3>${selected.name}</h3>
            <p>Type: ${selected.type}</p>
            <p>UUID: ${selected.uuid}</p>
            <button onclick="window.__highlight()">Highlight</button>
          </div>
        `;
      },

      onMount(container, context) {
        (window as any).__highlight = () => {
          const node = context.getSelectedNode();
          if (node) {
            // Apply highlight effect
            context.showToast(`Highlighted: ${node.name}`, 'success');
          }
        };
      },

      onUnmount() {
        delete (window as any).__highlight;
      },
    },
  ],
};

let highlightMode = false;
```

## Registering a Plugin

```typescript
import { createProbe } from '@3lens/core';
import { ObjectHighlighterPlugin } from './my-plugin';

const probe = createProbe({ /* config */ });
const pluginManager = probe.getPluginManager();

// Register the plugin
pluginManager.registerPlugin(ObjectHighlighterPlugin);

// Activate it
await pluginManager.activatePlugin('com.example.object-highlighter');
```

## See Also

- [DevtoolContext](./devtool-context.md) - Context API for plugins
- [PluginManager](./plugin-manager.md) - Managing plugin lifecycle
- [PluginLoader](./plugin-loader.md) - Loading plugins from npm/URL
- [Plugin Settings Schema](./plugin-settings-schema.md) - Configurable settings
- [LOD Checker Plugin](./lod-checker-plugin.md) - Built-in example
- [Shadow Debugger Plugin](./shadow-debugger-plugin.md) - Built-in example
- [Plugin Development Guide](/guides/PLUGIN-DEVELOPMENT.md) - Complete guide
