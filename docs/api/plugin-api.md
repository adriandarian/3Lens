# Plugin API Reference

The 3Lens plugin system allows you to extend the devtool with custom panels, toolbar actions, context menu items, and integrate with the probe's data streams.

## Table of Contents

- [Plugin Structure](#plugin-structure)
- [Plugin Metadata](#plugin-metadata)
- [DevtoolContext](#devtoolcontext)
- [Panels](#panels)
- [Toolbar Actions](#toolbar-actions)
- [Context Menu Items](#context-menu-items)
- [Plugin Settings](#plugin-settings)
- [Plugin Loading](#plugin-loading)
- [Plugin Lifecycle](#plugin-lifecycle)
- [Complete Example](#complete-example)

---

## Plugin Structure

A plugin is an object implementing the `DevtoolPlugin` interface:

```typescript
import type { DevtoolPlugin, DevtoolContext } from '@3lens/core';

const myPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'A custom devtool plugin',
    author: 'Your Name',
  },

  activate(context: DevtoolContext) {
    context.log('Plugin activated!');
  },

  deactivate(context: DevtoolContext) {
    context.log('Plugin deactivated');
  },

  panels: [/* ... */],
  toolbarActions: [/* ... */],
  contextMenuItems: [/* ... */],
  settings: {/* ... */},
};

export default myPlugin;
```

---

## Plugin Metadata

Every plugin must provide metadata identifying it:

```typescript
interface PluginMetadata {
  id: string;           // Unique identifier (reverse domain notation recommended)
  name: string;         // Display name
  version: string;      // Semantic version (x.y.z)
  description?: string; // Short description
  author?: string;      // Author name or organization
  homepage?: string;    // Documentation URL
  license?: string;     // License identifier
  repository?: string;  // Source repository URL
  keywords?: string[];  // Search keywords
  dependencies?: Record<string, string>; // Other plugin dependencies
  
  // Compatibility
  minProbeVersion?: string; // Minimum 3Lens version
  maxProbeVersion?: string; // Maximum 3Lens version
}
```

**Example:**

```typescript
metadata: {
  id: 'com.acme.shadow-debugger',
  name: 'Shadow Debugger',
  version: '2.1.0',
  description: 'Visualize and debug shadow maps',
  author: 'Acme Corp',
  homepage: 'https://github.com/acme/3lens-shadow-debugger',
  license: 'MIT',
  keywords: ['shadows', 'debugging', 'visualization'],
  minProbeVersion: '1.0.0',
}
```

---

## DevtoolContext

The `DevtoolContext` is passed to your plugin's `activate` function and provides access to probe features:

```typescript
interface DevtoolContext {
  // Logging
  log(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;

  // Probe access
  getProbe(): DevtoolProbe;
  
  // Selection
  getSelectedObject(): THREE.Object3D | null;
  selectObject(object: THREE.Object3D | null): void;
  onSelectionChanged(callback: SelectionCallback): Unsubscribe;

  // Data streams
  onFrameStats(callback: (stats: FrameStats) => void): Unsubscribe;
  onSnapshot(callback: (snapshot: SceneSnapshot) => void): Unsubscribe;

  // Messaging
  sendMessage(message: DebugMessage): void;
  onMessage(type: string, handler: MessageHandler): Unsubscribe;

  // Storage (persistent across sessions)
  getStorage<T>(key: string): T | undefined;
  setStorage<T>(key: string, value: T): void;

  // Settings
  getSetting<T>(key: string): T;
  
  // UI utilities
  showNotification(message: string, type?: 'info' | 'warning' | 'error'): void;
  showModal(options: ModalOptions): Promise<ModalResult>;

  // Panel management
  getContainer(): HTMLElement | null;
}
```

### Logging

```typescript
activate(context) {
  context.log('Plugin initialized');
  context.warn('Using fallback configuration');
  context.error('Failed to load resource', { error: err });
}
```

### Accessing the Probe

```typescript
activate(context) {
  const probe = context.getProbe();
  
  // Get renderer info
  const kind = probe.getRendererKind(); // 'webgl' | 'webgpu'
  
  // Get frame stats
  const stats = probe.getLatestFrameStats();
  
  // Get all textures
  const textures = probe.getTextures();
}
```

### Selection

```typescript
activate(context) {
  // Get current selection
  const selected = context.getSelectedObject();
  
  // Select an object programmatically
  context.selectObject(someMesh);
  
  // Listen for selection changes
  const unsub = context.onSelectionChanged((obj, meta) => {
    if (obj) {
      console.log('Selected:', meta?.name);
    }
  });
}
```

### Data Streams

```typescript
activate(context) {
  // Subscribe to frame stats
  context.onFrameStats((stats) => {
    updateChart(stats.performance?.fps);
  });
  
  // Subscribe to scene snapshots
  context.onSnapshot((snapshot) => {
    updateSceneTree(snapshot.scenes);
  });
}
```

### Persistent Storage

```typescript
activate(context) {
  // Load saved state
  const savedLayout = context.getStorage<Layout>('panelLayout');
  if (savedLayout) {
    restoreLayout(savedLayout);
  }
}

deactivate(context) {
  // Save state for next session
  context.setStorage('panelLayout', getCurrentLayout());
}
```

### Notifications

```typescript
activate(context) {
  context.showNotification('Plugin loaded successfully', 'info');
}

onError(context, error) {
  context.showNotification(`Error: ${error.message}`, 'error');
}
```

---

## Panels

Panels are the primary UI extension point. They appear in the devtool's panel area.

```typescript
interface PanelDefinition {
  id: string;           // Unique panel ID within plugin
  name: string;         // Display name
  icon?: string;        // Icon (emoji, URL, or icon name)
  render: PanelRenderFunction;
  priority?: number;    // Sort order (lower = first)
  
  // Optional lifecycle hooks
  onMount?(container: HTMLElement, context: PanelRenderContext): void;
  onUnmount?(container: HTMLElement, context: PanelRenderContext): void;
  onUpdate?(context: PanelRenderContext): void;
}

type PanelRenderFunction = (context: PanelRenderContext) => string | HTMLElement;
```

### PanelRenderContext

```typescript
interface PanelRenderContext {
  // Current state
  selectedObject: THREE.Object3D | null;
  frameStats: FrameStats | null;
  snapshot: SceneSnapshot | null;
  
  // Plugin context
  context: DevtoolContext;
  settings: Record<string, unknown>;
  
  // Container element
  container: HTMLElement;
  
  // Utilities
  requestUpdate(): void;  // Request a re-render
}
```

### Simple HTML Panel

```typescript
panels: [{
  id: 'stats-panel',
  name: 'Stats',
  icon: '📊',
  render: (ctx) => {
    const fps = ctx.frameStats?.performance?.fps ?? 0;
    return `
      <div class="stats-panel">
        <h3>Performance</h3>
        <p>FPS: ${fps.toFixed(1)}</p>
        <p>Draw Calls: ${ctx.frameStats?.drawCalls ?? 0}</p>
      </div>
    `;
  },
}]
```

### DOM Element Panel

```typescript
panels: [{
  id: 'canvas-panel',
  name: 'Canvas',
  icon: '🎨',
  render: (ctx) => {
    const container = document.createElement('div');
    container.className = 'canvas-panel';
    
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    container.appendChild(canvas);
    
    // Draw something
    const ctx2d = canvas.getContext('2d');
    // ...
    
    return container;
  },
}]
```

### Panel with Lifecycle Hooks

```typescript
panels: [{
  id: 'chart-panel',
  name: 'FPS Chart',
  icon: '📈',
  
  render: (ctx) => '<canvas id="fps-chart"></canvas>',
  
  onMount(container, ctx) {
    const canvas = container.querySelector('#fps-chart');
    this.chart = new Chart(canvas, {/* ... */});
    
    // Subscribe to updates
    this.unsub = ctx.context.onFrameStats((stats) => {
      this.chart.addDataPoint(stats.performance?.fps);
    });
  },
  
  onUnmount(container, ctx) {
    this.unsub?.();
    this.chart?.destroy();
  },
}]
```

---

## Toolbar Actions

Add buttons to the devtool toolbar:

```typescript
interface ToolbarActionDefinition {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  onClick: (context: DevtoolContext) => void | Promise<void>;
  
  // Dynamic state
  isEnabled?: (context: DevtoolContext) => boolean;
  isActive?: (context: DevtoolContext) => boolean;
}
```

**Example:**

```typescript
toolbarActions: [
  {
    id: 'take-snapshot',
    label: 'Snapshot',
    icon: '📷',
    tooltip: 'Take a scene snapshot',
    onClick: (ctx) => {
      const snapshot = ctx.getProbe().takeSnapshot();
      ctx.showNotification(`Snapshot taken: ${snapshot.snapshotId}`);
    },
  },
  {
    id: 'toggle-wireframe',
    label: 'Wireframe',
    icon: '🔲',
    tooltip: 'Toggle global wireframe',
    isActive: (ctx) => ctx.getStorage('wireframeEnabled') ?? false,
    onClick: (ctx) => {
      const enabled = !(ctx.getStorage('wireframeEnabled') ?? false);
      ctx.setStorage('wireframeEnabled', enabled);
      ctx.getProbe().toggleGlobalWireframe(enabled);
    },
  },
]
```

---

## Context Menu Items

Add items to the scene tree context menu:

```typescript
interface ContextMenuItemDefinition {
  id: string;
  label: string;
  icon?: string;
  
  // When to show this item
  shouldShow?: (target: ContextMenuTarget) => boolean;
  
  // Action
  onClick: (target: ContextMenuTarget, context: DevtoolContext) => void;
  
  // Submenu items
  children?: ContextMenuItemDefinition[];
}

interface ContextMenuTarget {
  object: THREE.Object3D;
  meta: ObjectMeta;
}
```

**Example:**

```typescript
contextMenuItems: [
  {
    id: 'copy-position',
    label: 'Copy Position',
    icon: '📋',
    onClick: (target, ctx) => {
      const pos = target.object.position;
      navigator.clipboard.writeText(`${pos.x}, ${pos.y}, ${pos.z}`);
      ctx.showNotification('Position copied to clipboard');
    },
  },
  {
    id: 'mesh-actions',
    label: 'Mesh Actions',
    icon: '🔷',
    shouldShow: (target) => target.object.type === 'Mesh',
    children: [
      {
        id: 'show-wireframe',
        label: 'Show Wireframe',
        onClick: (target, ctx) => {
          ctx.getProbe().toggleWireframe(target.object, true);
        },
      },
      {
        id: 'show-bbox',
        label: 'Show Bounding Box',
        onClick: (target, ctx) => {
          ctx.getProbe().toggleBoundingBox(target.object, true);
        },
      },
    ],
  },
]
```

---

## Plugin Settings

Define configurable settings for your plugin:

```typescript
interface PluginSettingsSchema {
  fields: PluginSettingField[];
}

interface PluginSettingField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color';
  defaultValue: unknown;
  description?: string;
  options?: Array<{ value: unknown; label: string }>; // For 'select'
  min?: number;     // For 'number'
  max?: number;     // For 'number'
  step?: number;    // For 'number'
}
```

**Example:**

```typescript
settings: {
  fields: [
    {
      key: 'refreshRate',
      label: 'Refresh Rate',
      type: 'number',
      defaultValue: 60,
      description: 'How often to update the display (FPS)',
      min: 1,
      max: 120,
      step: 1,
    },
    {
      key: 'showWarnings',
      label: 'Show Warnings',
      type: 'boolean',
      defaultValue: true,
      description: 'Display warning notifications',
    },
    {
      key: 'theme',
      label: 'Theme',
      type: 'select',
      defaultValue: 'dark',
      options: [
        { value: 'dark', label: 'Dark' },
        { value: 'light', label: 'Light' },
        { value: 'auto', label: 'Auto' },
      ],
    },
    {
      key: 'accentColor',
      label: 'Accent Color',
      type: 'color',
      defaultValue: '#22d3ee',
    },
  ],
},

onSettingsChange(settings, context) {
  // Called when user changes settings
  if (settings.theme !== this.currentTheme) {
    this.applyTheme(settings.theme);
  }
}
```

Access settings in your plugin:

```typescript
activate(context) {
  const refreshRate = context.getSetting<number>('refreshRate');
  const showWarnings = context.getSetting<boolean>('showWarnings');
}
```

---

## Plugin Loading

### Register Directly

```typescript
import { createProbe } from '@3lens/core';
import myPlugin from './my-plugin';

const probe = createProbe({ appName: 'My App' });
probe.registerPlugin(myPlugin);
await probe.activatePlugin('com.example.my-plugin');
```

### Load from NPM

```typescript
const result = await probe.loadPlugin('@3lens/plugin-shadows', 'latest');
if (result.success) {
  console.log('Plugin loaded:', result.plugin?.metadata.name);
} else {
  console.error('Failed to load:', result.error);
}
```

### Load from URL

```typescript
const result = await probe.loadPluginFromUrl(
  'https://cdn.example.com/my-plugin.js'
);
```

### Load Multiple Plugins

```typescript
const results = await probe.loadPlugins([
  { type: 'npm', packageName: '@3lens/plugin-shadows' },
  { type: 'npm', packageName: '@3lens/plugin-performance' },
  { type: 'url', url: 'https://example.com/custom-plugin.js' },
]);

for (const result of results) {
  if (!result.success) {
    console.error(`Failed: ${result.source.packageName ?? result.source.url}`);
  }
}
```

---

## Plugin Lifecycle

```
┌─────────────────┐
│   Registered    │  probe.registerPlugin(plugin)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Inactive     │  Plugin is known but not running
└────────┬────────┘
         │ probe.activatePlugin(id)
         ▼
┌─────────────────┐
│  Activating...  │  activate() is called
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Active      │  Plugin is running, panels visible
└────────┬────────┘
         │ probe.deactivatePlugin(id)
         ▼
┌─────────────────┐
│ Deactivating... │  deactivate() is called
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Inactive     │  Plugin stopped, can reactivate
└────────┬────────┘
         │ probe.unregisterPlugin(id)
         ▼
┌─────────────────┐
│   Unregistered  │  Plugin completely removed
└─────────────────┘
```

### State Management

```typescript
// Check plugin states
const plugins = probe.getPlugins();
for (const { plugin, state } of plugins) {
  console.log(`${plugin.metadata.name}: ${state}`);
  // state: 'inactive' | 'activating' | 'active' | 'deactivating' | 'error'
}

// Get counts
console.log('Total plugins:', probe.pluginCount);
console.log('Active plugins:', probe.activePluginCount);
```

---

## Complete Example

A full-featured plugin example:

```typescript
import type { DevtoolPlugin, DevtoolContext, PanelRenderContext } from '@3lens/core';

let chartData: number[] = [];
let unsub: (() => void) | null = null;

const fpsChartPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.fps-chart',
    name: 'FPS Chart',
    version: '1.0.0',
    description: 'Real-time FPS visualization',
    author: 'Example Author',
    keywords: ['fps', 'chart', 'performance'],
  },

  activate(context: DevtoolContext) {
    context.log('FPS Chart plugin activated');
    
    // Reset chart data
    chartData = [];
    
    // Subscribe to frame stats
    unsub = context.onFrameStats((stats) => {
      const fps = stats.performance?.fps ?? 0;
      chartData.push(fps);
      
      // Keep last 100 samples
      const maxSamples = context.getSetting<number>('maxSamples');
      if (chartData.length > maxSamples) {
        chartData.shift();
      }
    });
  },

  deactivate(context: DevtoolContext) {
    context.log('FPS Chart plugin deactivated');
    unsub?.();
    unsub = null;
    chartData = [];
  },

  panels: [{
    id: 'fps-chart',
    name: 'FPS Chart',
    icon: '📈',
    priority: 10,
    
    render(ctx: PanelRenderContext): string {
      const maxFps = Math.max(...chartData, 60);
      const minFps = Math.min(...chartData, 0);
      const avgFps = chartData.length > 0 
        ? chartData.reduce((a, b) => a + b, 0) / chartData.length 
        : 0;
      
      const barWidth = Math.floor(200 / Math.max(chartData.length, 1));
      const bars = chartData.map((fps, i) => {
        const height = Math.floor((fps / maxFps) * 100);
        const color = fps >= 55 ? '#22c55e' : fps >= 30 ? '#eab308' : '#ef4444';
        return `<div style="width:${barWidth}px;height:${height}px;background:${color};display:inline-block;"></div>`;
      }).join('');
      
      return `
        <div class="fps-chart-panel" style="padding:8px;">
          <h3 style="margin:0 0 8px;">FPS Chart</h3>
          <div style="display:flex;gap:16px;margin-bottom:8px;">
            <span>Max: ${maxFps.toFixed(0)}</span>
            <span>Avg: ${avgFps.toFixed(1)}</span>
            <span>Min: ${minFps.toFixed(0)}</span>
          </div>
          <div style="height:100px;display:flex;align-items:flex-end;background:#1f2937;border-radius:4px;padding:4px;">
            ${bars}
          </div>
        </div>
      `;
    },
    
    onMount(container, ctx) {
      // Request updates at configured rate
      const refreshRate = ctx.settings.refreshRate as number;
      const intervalId = setInterval(() => ctx.requestUpdate(), 1000 / refreshRate);
      (container as any).__intervalId = intervalId;
    },
    
    onUnmount(container, ctx) {
      const intervalId = (container as any).__intervalId;
      if (intervalId) clearInterval(intervalId);
    },
  }],

  toolbarActions: [{
    id: 'clear-chart',
    label: 'Clear',
    icon: '🗑️',
    tooltip: 'Clear chart data',
    onClick: (ctx) => {
      chartData = [];
      ctx.showNotification('Chart cleared');
    },
  }],

  settings: {
    fields: [
      {
        key: 'maxSamples',
        label: 'Max Samples',
        type: 'number',
        defaultValue: 100,
        description: 'Maximum data points to display',
        min: 10,
        max: 500,
      },
      {
        key: 'refreshRate',
        label: 'Refresh Rate',
        type: 'number',
        defaultValue: 30,
        description: 'Chart update frequency (FPS)',
        min: 1,
        max: 60,
      },
    ],
  },

  onSettingsChange(settings, context) {
    context.log('Settings changed', settings);
  },
};

export default fpsChartPlugin;
```

---

## See Also

- [Probe API](./probe-api.md) - Main probe reference
- [Events API](./events-api.md) - Event subscriptions
- [Plugin Development Guide](../guides/PLUGIN-DEVELOPMENT.md) - In-depth guide
- [Plugin Examples](../../examples/feature-showcase/) - Example plugins
