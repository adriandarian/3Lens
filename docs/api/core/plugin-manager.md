# PluginManager Class

The `PluginManager` class handles the lifecycle of 3Lens plugins, including registration, activation, deactivation, and inter-plugin communication.

## Overview

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({ /* config */ });
const pluginManager = probe.getPluginManager();

// Register a plugin
pluginManager.registerPlugin(myPlugin);

// Activate the plugin
await pluginManager.activatePlugin('com.example.my-plugin');

// Get all plugins
const plugins = pluginManager.getPlugins();

// Deactivate and unregister
await pluginManager.deactivatePlugin('com.example.my-plugin');
await pluginManager.unregisterPlugin('com.example.my-plugin');
```

## Constructor

```typescript
new PluginManager(probe: DevtoolProbe)
```

::: info
`PluginManager` is created internally by `DevtoolProbe`. Access it via `probe.getPluginManager()`.
:::

## Plugin Lifecycle Methods

### registerPlugin

Registers a plugin without activating it.

```typescript
registerPlugin(plugin: DevtoolPlugin): void
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `plugin` | `DevtoolPlugin` | The plugin to register |

**Throws:** Error if a plugin with the same ID is already registered.

**Example:**

```typescript
import { LODCheckerPlugin } from '@3lens/core/plugins/builtin';

pluginManager.registerPlugin(LODCheckerPlugin);
pluginManager.registerPlugin(myCustomPlugin);
```

**Behavior:**

1. Validates the plugin structure
2. Creates a `RegisteredPlugin` entry with state `'registered'`
3. Registers panels, toolbar actions, and context menu items
4. Does NOT call `activate()` - use `activatePlugin()` for that

### unregisterPlugin

Unregisters a plugin, removing all its panels, actions, and menu items.

```typescript
async unregisterPlugin(pluginId: PluginId): Promise<void>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `pluginId` | `PluginId` | The plugin ID to unregister |

**Example:**

```typescript
await pluginManager.unregisterPlugin('com.example.my-plugin');
```

**Behavior:**

1. If the plugin is active, deactivates it first
2. Removes all registered panels
3. Removes all toolbar actions
4. Removes all context menu items
5. Removes the plugin from the registry

### activatePlugin

Activates a registered plugin.

```typescript
async activatePlugin(pluginId: PluginId): Promise<void>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `pluginId` | `PluginId` | The plugin ID to activate |

**Throws:** Error if plugin is not found or activation fails.

**Example:**

```typescript
try {
  await pluginManager.activatePlugin('com.example.my-plugin');
  console.log('Plugin activated successfully');
} catch (error) {
  console.error('Activation failed:', error);
}
```

**Behavior:**

1. Creates a `DevtoolContext` for the plugin
2. Calls the plugin's `activate()` method
3. Updates state to `'activated'`
4. Records activation timestamp
5. On error, sets state to `'error'` and stores the error

### deactivatePlugin

Deactivates an active plugin.

```typescript
async deactivatePlugin(pluginId: PluginId): Promise<void>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `pluginId` | `PluginId` | The plugin ID to deactivate |

**Example:**

```typescript
await pluginManager.deactivatePlugin('com.example.my-plugin');
```

**Behavior:**

1. Calls `onUnmount()` for all mounted panels
2. Clears panel container references
3. Calls the plugin's `deactivate()` method (if defined)
4. Updates state to `'deactivated'`
5. Clears message handlers

## Query Methods

### getPlugins

Gets all registered plugins with their state.

```typescript
getPlugins(): Array<{
  id: PluginId;
  metadata: PluginMetadata;
  state: PluginState;
}>
```

**Example:**

```typescript
const plugins = pluginManager.getPlugins();

plugins.forEach(plugin => {
  console.log(`${plugin.metadata.name} (${plugin.id}): ${plugin.state}`);
});

// Filter active plugins
const activePlugins = plugins.filter(p => p.state === 'activated');
```

### getPlugin

Gets detailed information about a specific plugin.

```typescript
getPlugin(pluginId: PluginId): RegisteredPlugin | undefined
```

**Returns:** `RegisteredPlugin` or `undefined` if not found.

**Example:**

```typescript
const registered = pluginManager.getPlugin('com.example.my-plugin');

if (registered) {
  console.log('State:', registered.state);
  console.log('Registered at:', new Date(registered.registeredAt));
  console.log('Activated at:', registered.activatedAt ? new Date(registered.activatedAt) : 'never');
  console.log('Error:', registered.error?.message ?? 'none');
  console.log('Settings:', registered.settings);
}
```

### getPanels

Gets all registered panels sorted by order.

```typescript
getPanels(): Array<{
  key: string;
  pluginId: PluginId;
  panel: PanelDefinition;
}>
```

**Example:**

```typescript
const panels = pluginManager.getPanels();

panels.forEach(({ key, pluginId, panel }) => {
  console.log(`Panel: ${panel.name} (${key}) from ${pluginId}`);
});
```

### getToolbarActions

Gets all registered toolbar actions sorted by order.

```typescript
getToolbarActions(): Array<{
  key: string;
  pluginId: PluginId;
  action: ToolbarActionDefinition;
}>
```

**Example:**

```typescript
const actions = pluginManager.getToolbarActions();

actions.forEach(({ key, action }) => {
  console.log(`Action: ${action.name} [${action.shortcut ?? 'no shortcut'}]`);
});
```

### getContextMenuItems

Gets context menu items for a specific target.

```typescript
getContextMenuItems(
  target: 'scene-tree' | 'inspector' | 'viewport'
): Array<{
  key: string;
  pluginId: PluginId;
  item: ContextMenuItemDefinition;
}>
```

**Example:**

```typescript
const sceneTreeItems = pluginManager.getContextMenuItems('scene-tree');
const viewportItems = pluginManager.getContextMenuItems('viewport');
```

## Panel Methods

### renderPanel

Renders a panel and returns its HTML content.

```typescript
renderPanel(panelKey: string): string
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `panelKey` | `string` | Panel key in format `pluginId:panelId` |

**Returns:** HTML string for the panel content.

**Example:**

```typescript
const html = pluginManager.renderPanel('3lens.lod-checker:main');
container.innerHTML = html;
```

### mountPanel

Mounts a panel to a DOM container, calling the panel's `onMount` callback.

```typescript
mountPanel(panelKey: string, container: HTMLElement): void
```

**Example:**

```typescript
const container = document.getElementById('panel-container');
pluginManager.mountPanel('3lens.lod-checker:main', container);
```

### unmountPanel

Unmounts a panel, calling its `onUnmount` callback.

```typescript
unmountPanel(panelKey: string): void
```

**Example:**

```typescript
pluginManager.unmountPanel('3lens.lod-checker:main');
```

## Action Execution

### executeToolbarAction

Executes a toolbar action.

```typescript
async executeToolbarAction(actionKey: string): Promise<void>
```

**Example:**

```typescript
await pluginManager.executeToolbarAction('3lens.lod-checker:refresh');
```

### executeContextMenuItem

Executes a context menu item with the given context.

```typescript
async executeContextMenuItem(
  itemKey: string,
  menuContext: {
    targetElement: HTMLElement | null;
    targetObject: THREE.Object3D | null;
    targetNode: SceneNode | null;
    position: { x: number; y: number };
  }
): Promise<void>
```

**Example:**

```typescript
await pluginManager.executeContextMenuItem('my-plugin:copy-transform', {
  targetElement: event.target as HTMLElement,
  targetObject: selectedMesh,
  targetNode: selectedNode,
  position: { x: event.clientX, y: event.clientY },
});
```

## Inter-Plugin Communication

### sendMessage

Sends a message between plugins.

```typescript
sendMessage(
  source: PluginId,
  target: PluginId | '*',
  type: string,
  payload: unknown
): void
```

**Example:**

```typescript
// Typically called via DevtoolContext, but can be used directly
pluginManager.sendMessage(
  'plugin-a',
  'plugin-b',
  'data-ready',
  { items: results }
);

// Broadcast to all plugins
pluginManager.sendMessage(
  'plugin-a',
  '*',
  'analysis-complete',
  { duration: 500 }
);
```

### onMessage

Subscribes to all plugin messages (global handler).

```typescript
onMessage(handler: PluginMessageHandler): () => void
```

**Returns:** Unsubscribe function.

**Example:**

```typescript
const unsubscribe = pluginManager.onMessage((message) => {
  console.log(`[${message.source} → ${message.target}] ${message.type}`);
  console.log('Payload:', message.payload);
});

// Later: stop listening
unsubscribe();
```

## State Management

### getPluginState

Gets a plugin's stored state.

```typescript
getPluginState(pluginId: PluginId): Record<string, unknown>
```

### setPluginState

Sets a value in a plugin's state.

```typescript
setPluginState(pluginId: PluginId, key: string, value: unknown): void
```

## UI Integration

### setToastCallback

Sets the callback for showing toast notifications (called by UI layer).

```typescript
setToastCallback(
  callback: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
): void
```

### setRenderRequestCallback

Sets the callback for panel re-render requests (called by UI layer).

```typescript
setRenderRequestCallback(callback: (pluginId: PluginId) => void): void
```

## RegisteredPlugin Interface

```typescript
interface RegisteredPlugin {
  /** Plugin definition */
  plugin: DevtoolPlugin;

  /** Current state */
  state: PluginState; // 'registered' | 'activated' | 'deactivated' | 'error'

  /** Plugin's stored data */
  storage: Record<string, unknown>;

  /** Plugin's settings values */
  settings: Record<string, unknown>;

  /** Message handlers */
  messageHandlers: PluginMessageHandler[];

  /** Panel containers */
  panelContainers: Map<string, HTMLElement>;

  /** When the plugin was registered */
  registeredAt: number;

  /** When the plugin was last activated */
  activatedAt: number | null;

  /** Error if in error state */
  error: Error | null;
}
```

## Complete Example

```typescript
import { createProbe, LODCheckerPlugin, ShadowDebuggerPlugin } from '@3lens/core';

const probe = createProbe({
  name: 'My App',
  sampleInterval: 100,
});

const pluginManager = probe.getPluginManager();

// Set up UI callbacks
pluginManager.setToastCallback((message, type) => {
  showToastNotification(message, type);
});

pluginManager.setRenderRequestCallback((pluginId) => {
  const panels = pluginManager.getPanels().filter(p => p.pluginId === pluginId);
  panels.forEach(({ key }) => {
    const container = document.querySelector(`[data-panel="${key}"]`);
    if (container) {
      container.innerHTML = pluginManager.renderPanel(key);
    }
  });
});

// Register built-in plugins
pluginManager.registerPlugin(LODCheckerPlugin);
pluginManager.registerPlugin(ShadowDebuggerPlugin);

// Register custom plugin
pluginManager.registerPlugin(myCustomPlugin);

// Activate all plugins
async function activateAllPlugins() {
  const plugins = pluginManager.getPlugins();
  
  for (const plugin of plugins) {
    try {
      await pluginManager.activatePlugin(plugin.id);
      console.log(`✓ Activated: ${plugin.metadata.name}`);
    } catch (error) {
      console.error(`✗ Failed to activate ${plugin.metadata.name}:`, error);
    }
  }
}

// Listen for plugin messages
pluginManager.onMessage((message) => {
  if (message.type === 'analysis-complete') {
    console.log(`Analysis from ${message.source}:`, message.payload);
  }
});

// Start
await activateAllPlugins();

// Render panels
const panels = pluginManager.getPanels();
panels.forEach(({ key, panel }) => {
  const tab = createTab(panel.name, panel.icon);
  const container = createPanelContainer(key);
  
  tab.onclick = () => {
    container.innerHTML = pluginManager.renderPanel(key);
    pluginManager.mountPanel(key, container);
  };
});
```

## See Also

- [DevtoolPlugin](./devtool-plugin.md) - Plugin interface
- [DevtoolContext](./devtool-context.md) - Context API
- [PluginLoader](./plugin-loader.md) - Loading plugins from npm/URL
- [LOD Checker Plugin](./lod-checker-plugin.md) - Built-in plugin
- [Shadow Debugger Plugin](./shadow-debugger-plugin.md) - Built-in plugin
