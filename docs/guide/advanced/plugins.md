# Plugin Development Guide

This guide covers creating custom plugins for 3Lens to extend its functionality with custom panels, toolbar actions, and analysis tools.

## Quick Start

Get a plugin running in under 5 minutes:

```typescript
import { createProbe, type DevtoolPlugin } from '@3lens/core';

// 1. Define your plugin
const MyPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.mycompany.hello-world',
    name: 'Hello World',
    version: '1.0.0',
    icon: '👋',
  },

  activate(context) {
    context.showToast('Hello from my plugin!', 'success');
  },

  panels: [{
    id: 'hello-panel',
    name: 'Hello',
    icon: '👋',
    render: (ctx) => `
      <div style="padding: 16px;">
        <h2>Hello, 3Lens!</h2>
        <p>FPS: ${ctx.frameStats?.fps?.toFixed(1) ?? 'N/A'}</p>
        <p>Draw Calls: ${ctx.frameStats?.drawCalls ?? 'N/A'}</p>
      </div>
    `,
  }],
};

// 2. Register with 3Lens
const probe = createProbe({ appName: 'My App' });
probe.registerAndActivatePlugin(MyPlugin);
```

That's it! Your plugin now has a custom panel in the 3Lens overlay.

## Table of Contents

- [Overview](#overview)
- [Plugin Structure](#plugin-structure)
- [Creating Your First Plugin](#creating-your-first-plugin)
- [Panel Development](#panel-development)
- [Toolbar Actions](#toolbar-actions)
- [Context Menus](#context-menus)
- [Plugin Settings](#plugin-settings)
- [Inter-Plugin Communication](#inter-plugin-communication)
- [State Management](#state-management)
- [Best Practices](#best-practices)
- [Publishing Plugins](#publishing-plugins)
- [Examples](#examples)

---

## Overview

3Lens plugins allow you to:

- Add custom panels to the overlay UI
- Add toolbar buttons and actions
- Add context menu items
- React to frame stats, snapshots, and selection changes
- Store and manage plugin state
- Communicate with other plugins
- Add custom analysis and visualization tools

### Plugin Lifecycle

```
registered → activated → (running) → deactivated
                ↑                         ↓
                └─────────────────────────┘
```

1. **Registered**: Plugin is known to 3Lens but not running
2. **Activated**: Plugin's `activate()` is called, panels mounted
3. **Running**: Plugin receives events and can interact with 3Lens
4. **Deactivated**: Plugin's `deactivate()` is called, cleanup performed

---

## Plugin Structure

### DevtoolPlugin Interface

```typescript
interface DevtoolPlugin {
  /**
   * Plugin metadata (required)
   */
  metadata: PluginMetadata;

  /**
   * Called when the plugin is activated
   */
  activate(context: DevtoolContext): void | Promise<void>;

  /**
   * Called when the plugin is deactivated
   */
  deactivate?(context: DevtoolContext): void | Promise<void>;

  /**
   * Panel definitions
   */
  panels?: PanelDefinition[];

  /**
   * Toolbar action definitions
   */
  toolbarActions?: ToolbarActionDefinition[];

  /**
   * Context menu item definitions
   */
  contextMenuItems?: ContextMenuItemDefinition[];

  /**
   * Settings schema (for plugin settings UI)
   */
  settings?: PluginSettingsSchema;

  /**
   * Called when plugin settings change
   */
  onSettingsChange?: (settings: Record<string, unknown>, context: DevtoolContext) => void;
}
```

### Plugin Metadata

```typescript
interface PluginMetadata {
  /**
   * Unique plugin identifier (e.g., 'com.example.my-plugin')
   * Use reverse domain notation for uniqueness
   */
  id: string;

  /**
   * Display name
   */
  name: string;

  /**
   * Plugin version (semver)
   */
  version: string;

  /**
   * Plugin description
   */
  description?: string;

  /**
   * Plugin author
   */
  author?: string;

  /**
   * Plugin homepage or repository URL
   */
  homepage?: string;

  /**
   * Minimum 3Lens version required
   */
  minVersion?: string;

  /**
   * Plugin icon (emoji or URL)
   */
  icon?: string;

  /**
   * Tags for categorization
   */
  tags?: string[];
}
```

---

## Creating Your First Plugin

### Basic Plugin

```typescript
import type { DevtoolPlugin, DevtoolContext } from '@3lens/core';

export const MyFirstPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.my-first-plugin',
    name: 'My First Plugin',
    version: '1.0.0',
    description: 'A simple 3Lens plugin',
    author: 'Your Name',
    icon: '🔌',
    tags: ['example', 'starter'],
  },

  activate(context: DevtoolContext) {
    context.log('My First Plugin activated!');
    context.showToast('Plugin loaded!', 'success');
  },

  deactivate(context: DevtoolContext) {
    context.log('My First Plugin deactivated');
  },
};
```

### Registering Your Plugin

```typescript
import { createProbe } from '@3lens/core';
import { MyFirstPlugin } from './my-plugin';

const probe = createProbe({ appName: 'My App' });

// Register and activate the plugin
probe.registerPlugin(MyFirstPlugin);
probe.activatePlugin('com.example.my-first-plugin');

// Or use the combined method
probe.registerAndActivatePlugin(MyFirstPlugin);
```

---

## Panel Development

Panels are custom UI sections that appear in the 3Lens overlay.

### Panel Definition

```typescript
interface PanelDefinition {
  /**
   * Unique panel ID within the plugin
   */
  id: string;

  /**
   * Panel display name
   */
  name: string;

  /**
   * Panel icon (emoji or URL)
   */
  icon?: string;

  /**
   * Panel order in the tab bar (lower = left)
   */
  order?: number;

  /**
   * Render function that returns HTML content
   */
  render: (context: PanelRenderContext) => string;

  /**
   * Called after the panel is mounted to the DOM
   */
  onMount?: (container: HTMLElement, context: DevtoolContext) => void;

  /**
   * Called before the panel is unmounted
   */
  onUnmount?: (container: HTMLElement) => void;

  /**
   * Called when frame stats are updated (for live updates)
   */
  onFrameStats?: (stats: FrameStats, container: HTMLElement) => void;

  /**
   * Called when the scene snapshot is updated
   */
  onSnapshot?: (snapshot: SceneSnapshot, container: HTMLElement) => void;

  /**
   * Called when selection changes
   */
  onSelectionChange?: (node: SceneNode | null, container: HTMLElement) => void;
}
```

### Example: Custom Stats Panel

```typescript
import type { DevtoolPlugin, PanelRenderContext, FrameStats } from '@3lens/core';

export const CustomStatsPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.custom-stats',
    name: 'Custom Stats',
    version: '1.0.0',
    icon: '📊',
  },

  activate(context) {
    context.log('Custom Stats plugin activated');
  },

  panels: [
    {
      id: 'custom-stats-panel',
      name: 'Custom Stats',
      icon: '📊',
      order: 100,

      render(ctx: PanelRenderContext): string {
        const stats = ctx.frameStats;
        
        if (!stats) {
          return `
            <div class="custom-stats-panel">
              <p>Waiting for frame stats...</p>
            </div>
          `;
        }

        const fpsClass = stats.fps >= 55 ? 'good' : stats.fps >= 30 ? 'warn' : 'bad';

        return `
          <div class="custom-stats-panel">
            <h3>Performance Overview</h3>
            
            <div class="stat-grid">
              <div class="stat">
                <span class="label">FPS</span>
                <span class="value ${fpsClass}">${stats.fps.toFixed(1)}</span>
              </div>
              
              <div class="stat">
                <span class="label">Frame Time</span>
                <span class="value">${stats.frameTimeMs.toFixed(2)}ms</span>
              </div>
              
              <div class="stat">
                <span class="label">Draw Calls</span>
                <span class="value">${stats.drawCalls}</span>
              </div>
              
              <div class="stat">
                <span class="label">Triangles</span>
                <span class="value">${stats.triangles.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="custom-analysis">
              <h4>Custom Analysis</h4>
              <p>Draw call efficiency: ${(stats.triangles / (stats.drawCalls || 1)).toFixed(0)} tris/call</p>
              <p>Budget used: ${((stats.frameTimeMs / 16.67) * 100).toFixed(1)}%</p>
            </div>
          </div>
        `;
      },

      onMount(container: HTMLElement, context) {
        // Add event listeners, initialize state
        console.log('Panel mounted');
        
        // Inject styles
        const style = document.createElement('style');
        style.textContent = `
          .custom-stats-panel {
            padding: 16px;
          }
          .stat-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 16px;
          }
          .stat {
            background: var(--3lens-bg-secondary);
            padding: 12px;
            border-radius: 8px;
          }
          .stat .label {
            display: block;
            font-size: 12px;
            color: var(--3lens-text-secondary);
          }
          .stat .value {
            font-size: 24px;
            font-weight: bold;
          }
          .stat .value.good { color: #4caf50; }
          .stat .value.warn { color: #ff9800; }
          .stat .value.bad { color: #f44336; }
          .custom-analysis {
            background: var(--3lens-bg-tertiary);
            padding: 12px;
            border-radius: 8px;
          }
        `;
        container.appendChild(style);
      },

      onFrameStats(stats: FrameStats, container: HTMLElement) {
        // Update specific values without full re-render
        const fpsEl = container.querySelector('.stat .value');
        if (fpsEl) {
          fpsEl.textContent = stats.fps.toFixed(1);
          fpsEl.className = `value ${stats.fps >= 55 ? 'good' : stats.fps >= 30 ? 'warn' : 'bad'}`;
        }
      },

      onUnmount(container: HTMLElement) {
        // Cleanup
        console.log('Panel unmounted');
      },
    },
  ],
};
```

### Panel Render Context

The `render` function receives a context with current state:

```typescript
interface PanelRenderContext {
  /**
   * Current frame stats
   */
  frameStats: FrameStats | null;

  /**
   * Current scene snapshot
   */
  snapshot: SceneSnapshot | null;

  /**
   * Currently selected node
   */
  selectedNode: SceneNode | null;

  /**
   * Plugin's stored state
   */
  state: Record<string, unknown>;

  /**
   * Probe instance
   */
  probe: DevtoolProbe;
}
```

---

## Toolbar Actions

Add buttons to the 3Lens toolbar:

```typescript
interface ToolbarActionDefinition {
  id: string;
  name: string;
  icon: string;
  order?: number;
  isToggle?: boolean;
  isActive?: () => boolean;
  onClick: (context: DevtoolContext) => void | Promise<void>;
  isEnabled?: (context: DevtoolContext) => boolean;
  shortcut?: string;
}
```

### Example: Screenshot Button

```typescript
export const ScreenshotPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.screenshot',
    name: 'Screenshot Tool',
    version: '1.0.0',
    icon: '📷',
  },

  activate(context) {
    context.log('Screenshot plugin ready');
  },

  toolbarActions: [
    {
      id: 'take-screenshot',
      name: 'Take Screenshot',
      icon: '📷',
      order: 50,
      shortcut: 'ctrl+shift+s',

      async onClick(context) {
        const probe = context.probe;
        const renderer = probe.getRenderer();

        if (!renderer) {
          context.showToast('No renderer available', 'error');
          return;
        }

        // Capture the canvas
        const canvas = renderer.domElement;
        const dataUrl = canvas.toDataURL('image/png');

        // Download the screenshot
        const link = document.createElement('a');
        link.download = `screenshot-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

        context.showToast('Screenshot saved!', 'success');
      },
    },
  ],
};
```

### Toggle Actions

```typescript
toolbarActions: [
  {
    id: 'wireframe-toggle',
    name: 'Toggle Wireframe',
    icon: '🔲',
    isToggle: true,

    isActive() {
      // Return current toggle state
      return this.wireframeEnabled ?? false;
    },

    onClick(context) {
      this.wireframeEnabled = !this.wireframeEnabled;
      
      // Apply wireframe to all meshes
      const snapshot = context.getSnapshot();
      snapshot?.nodes.forEach((node) => {
        if (node.type === 'Mesh') {
          const obj = context.probe.getObjectByUuid(node.uuid);
          if (obj && 'material' in obj) {
            (obj.material as THREE.Material).wireframe = this.wireframeEnabled;
          }
        }
      });

      context.showToast(
        `Wireframe ${this.wireframeEnabled ? 'enabled' : 'disabled'}`,
        'info'
      );
    },
  },
],
```

---

## Context Menus

Add items to right-click context menus:

```typescript
interface ContextMenuItemDefinition {
  id: string;
  label: string;
  icon?: string;
  order?: number;
  target: 'scene-tree' | 'inspector' | 'viewport' | 'all';
  onClick: (context: ContextMenuContext) => void | Promise<void>;
  isVisible?: (context: ContextMenuContext) => boolean;
  isEnabled?: (context: ContextMenuContext) => boolean;
  submenu?: ContextMenuItemDefinition[];
}
```

### Example: Export Object

```typescript
export const ExportPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.export',
    name: 'Export Tools',
    version: '1.0.0',
    icon: '📤',
  },

  activate(context) {},

  contextMenuItems: [
    {
      id: 'export-object',
      label: 'Export to JSON',
      icon: '📄',
      target: 'scene-tree',
      order: 100,

      isVisible(context) {
        // Only show when an object is selected
        return context.targetNode !== null;
      },

      onClick(context) {
        const node = context.targetNode;
        if (!node) return;

        const object = context.probe.getObjectByUuid(node.uuid);
        if (!object) return;

        // Export to JSON
        const json = object.toJSON();
        const blob = new Blob([JSON.stringify(json, null, 2)], {
          type: 'application/json',
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${node.name || 'object'}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        context.showToast('Object exported!', 'success');
      },
    },

    {
      id: 'export-menu',
      label: 'Export As...',
      icon: '📤',
      target: 'scene-tree',
      order: 101,

      submenu: [
        {
          id: 'export-gltf',
          label: 'GLTF/GLB',
          onClick(context) {
            // Export as GLTF
          },
        },
        {
          id: 'export-obj',
          label: 'OBJ',
          onClick(context) {
            // Export as OBJ
          },
        },
      ],
    },
  ],
};
```

---

## Plugin Settings

Allow users to configure your plugin:

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
  options?: Array<{ value: unknown; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}
```

### Example: Configurable Plugin

```typescript
export const ConfigurablePlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.configurable',
    name: 'Configurable Plugin',
    version: '1.0.0',
    icon: '⚙️',
  },

  settings: {
    fields: [
      {
        key: 'threshold',
        label: 'Warning Threshold',
        type: 'number',
        defaultValue: 500,
        description: 'Draw call count that triggers a warning',
        min: 100,
        max: 2000,
        step: 50,
      },
      {
        key: 'showNotifications',
        label: 'Show Notifications',
        type: 'boolean',
        defaultValue: true,
        description: 'Display toast notifications for warnings',
      },
      {
        key: 'warningColor',
        label: 'Warning Color',
        type: 'color',
        defaultValue: '#ff9800',
        description: 'Color used for warning indicators',
      },
      {
        key: 'displayMode',
        label: 'Display Mode',
        type: 'select',
        defaultValue: 'compact',
        options: [
          { value: 'compact', label: 'Compact' },
          { value: 'detailed', label: 'Detailed' },
          { value: 'minimal', label: 'Minimal' },
        ],
      },
    ],
  },

  activate(context) {
    // Access settings via state
    const threshold = context.getState<number>('settings.threshold') ?? 500;
    context.log(`Threshold set to: ${threshold}`);
  },

  onSettingsChange(settings, context) {
    context.log('Settings changed:', settings);
    
    if (settings.showNotifications) {
      context.showToast('Notifications enabled', 'info');
    }
  },

  panels: [
    {
      id: 'config-panel',
      name: 'Config Demo',
      icon: '⚙️',

      render(ctx) {
        const threshold = ctx.state['settings.threshold'] ?? 500;
        const color = ctx.state['settings.warningColor'] ?? '#ff9800';

        return `
          <div class="config-demo">
            <p>Current threshold: ${threshold}</p>
            <p>Warning color: <span style="color: ${color}">${color}</span></p>
          </div>
        `;
      },
    },
  ],
};
```

---

## Inter-Plugin Communication

Plugins can communicate with each other:

### Sending Messages

```typescript
// Send to a specific plugin
context.sendMessage('com.example.other-plugin', 'my-event', {
  data: 'Hello from my plugin!',
});

// Broadcast to all plugins
context.sendMessage('*', 'global-event', {
  timestamp: Date.now(),
});
```

### Receiving Messages

```typescript
activate(context: DevtoolContext) {
  // Subscribe to messages
  const unsubscribe = context.onMessage((message) => {
    if (message.type === 'my-event') {
      console.log('Received:', message.payload);
    }
  });

  // Store unsubscribe for cleanup
  context.setState('messageUnsubscribe', unsubscribe);
},

deactivate(context: DevtoolContext) {
  // Clean up subscription
  const unsubscribe = context.getState<() => void>('messageUnsubscribe');
  unsubscribe?.();
}
```

### Message Interface

```typescript
interface PluginMessage {
  source: string;       // Source plugin ID
  target: string;       // Target plugin ID or '*'
  type: string;         // Message type
  payload: unknown;     // Message data
  timestamp: number;    // When the message was sent
}
```

---

## State Management

Plugins have access to persistent state storage:

```typescript
activate(context: DevtoolContext) {
  // Store state
  context.setState('counter', 0);
  context.setState('history', []);

  // Retrieve state
  const counter = context.getState<number>('counter') ?? 0;
  
  // Get all state
  const allState = context.getAllState();
  
  // Clear all state
  context.clearState();
}
```

### Using State in Panels

```typescript
panels: [
  {
    id: 'stateful-panel',
    name: 'Stateful',
    icon: '💾',

    render(ctx) {
      const counter = ctx.state['counter'] ?? 0;
      const history = ctx.state['history'] ?? [];

      return `
        <div class="stateful-panel">
          <p>Counter: ${counter}</p>
          <p>History: ${history.length} items</p>
          <button data-action="increment">Increment</button>
        </div>
      `;
    },

    onMount(container, context) {
      container.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.dataset.action === 'increment') {
          const counter = context.getState<number>('counter') ?? 0;
          context.setState('counter', counter + 1);
          
          const history = context.getState<number[]>('history') ?? [];
          context.setState('history', [...history, counter + 1]);
          
          context.requestRender();
        }
      });
    },
  },
],
```

---

## Best Practices

### 1. Use Unique Plugin IDs

Use reverse domain notation to avoid conflicts:

```typescript
// ✅ Good
id: 'com.mycompany.my-plugin'
id: 'io.github.username.plugin-name'

// ❌ Bad
id: 'my-plugin'
id: 'stats'
```

### 2. Handle Missing Data Gracefully

```typescript
render(ctx) {
  const stats = ctx.frameStats;
  
  if (!stats) {
    return '<p>Loading...</p>';
  }

  // Safe to use stats
}
```

### 3. Clean Up Resources

```typescript
deactivate(context) {
  // Remove event listeners
  const handler = context.getState<() => void>('clickHandler');
  document.removeEventListener('click', handler);

  // Cancel animations
  const animId = context.getState<number>('animationId');
  cancelAnimationFrame(animId);

  // Clear subscriptions
  const unsubscribe = context.getState<() => void>('unsubscribe');
  unsubscribe?.();
}
```

### 4. Use CSS Variables for Theming

```css
.my-plugin {
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-primary);
  border: 1px solid var(--3lens-border);
}

.my-plugin .highlight {
  color: var(--3lens-accent);
}
```

### 5. Provide Helpful Error Messages

```typescript
onClick(context) {
  const selection = context.getSelectedNode();
  
  if (!selection) {
    context.showToast('Please select an object first', 'warning');
    return;
  }

  // Proceed with selection
}
```

### 6. Document Your Plugin

```typescript
export const WellDocumentedPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.documented',
    name: 'Well Documented Plugin',
    version: '1.0.0',
    description: `
      This plugin provides advanced mesh analysis including:
      - Triangle count per object
      - Material complexity scoring
      - Memory usage breakdown
      
      See https://github.com/example/plugin for documentation.
    `,
    author: 'Your Name <email@example.com>',
    homepage: 'https://github.com/example/plugin',
    tags: ['analysis', 'performance', 'mesh'],
  },
  // ...
};
```

---

## Publishing Plugins

### NPM Package Structure

```
my-3lens-plugin/
├── package.json
├── README.md
├── LICENSE
├── src/
│   ├── index.ts
│   └── styles.css
└── dist/
    ├── index.js
    ├── index.d.ts
    └── styles.css
```

### package.json

```json
{
  "name": "@mycompany/3lens-plugin-name",
  "version": "1.0.0",
  "description": "A 3Lens plugin for ...",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": [
    "3lens",
    "3lens-plugin",
    "three.js",
    "devtools"
  ],
  "peerDependencies": {
    "@3lens/core": "^1.0.0"
  }
}
```

### Loading Published Plugins

```typescript
import { MyPlugin } from '@mycompany/3lens-plugin-name';

probe.registerAndActivatePlugin(MyPlugin);
```

### Loading from URL

```typescript
// Load from CDN
await probe.loadPluginFromUrl(
  'https://unpkg.com/@mycompany/3lens-plugin-name@1.0.0/dist/index.js'
);
```

---

## Examples

### Complete Analysis Plugin

```typescript
import type { 
  DevtoolPlugin, 
  DevtoolContext, 
  PanelRenderContext,
  FrameStats,
  SceneSnapshot,
} from '@3lens/core';

interface MeshAnalysis {
  uuid: string;
  name: string;
  triangles: number;
  drawCalls: number;
  materialComplexity: number;
  totalCost: number;
}

export const MeshAnalyzerPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.mesh-analyzer',
    name: 'Mesh Analyzer',
    version: '1.0.0',
    description: 'Analyzes mesh complexity and rendering cost',
    author: 'Example Author',
    icon: '🔍',
    tags: ['analysis', 'performance', 'mesh'],
  },

  settings: {
    fields: [
      {
        key: 'costThreshold',
        label: 'Cost Threshold',
        type: 'number',
        defaultValue: 100,
        description: 'Meshes above this cost are highlighted',
        min: 10,
        max: 1000,
      },
      {
        key: 'sortBy',
        label: 'Sort By',
        type: 'select',
        defaultValue: 'totalCost',
        options: [
          { value: 'totalCost', label: 'Total Cost' },
          { value: 'triangles', label: 'Triangle Count' },
          { value: 'materialComplexity', label: 'Material Complexity' },
        ],
      },
    ],
  },

  activate(context: DevtoolContext) {
    context.log('Mesh Analyzer activated');
    context.setState('analyses', []);
  },

  panels: [
    {
      id: 'mesh-analysis',
      name: 'Mesh Analysis',
      icon: '🔍',
      order: 50,

      render(ctx: PanelRenderContext): string {
        const analyses = ctx.state['analyses'] as MeshAnalysis[] ?? [];
        const threshold = ctx.state['settings.costThreshold'] ?? 100;
        const sortBy = ctx.state['settings.sortBy'] ?? 'totalCost';

        const sorted = [...analyses].sort((a, b) => b[sortBy] - a[sortBy]);

        if (sorted.length === 0) {
          return `
            <div class="mesh-analyzer">
              <p>Click "Analyze" to scan the scene.</p>
              <button data-action="analyze" class="analyze-btn">Analyze Scene</button>
            </div>
          `;
        }

        const rows = sorted.map((m) => `
          <tr class="${m.totalCost > threshold ? 'high-cost' : ''}">
            <td>${m.name}</td>
            <td>${m.triangles.toLocaleString()}</td>
            <td>${m.materialComplexity}</td>
            <td>${m.totalCost.toFixed(1)}</td>
          </tr>
        `).join('');

        return `
          <div class="mesh-analyzer">
            <div class="header">
              <h3>Mesh Analysis (${sorted.length} meshes)</h3>
              <button data-action="analyze" class="analyze-btn">Re-analyze</button>
            </div>
            
            <table class="analysis-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Triangles</th>
                  <th>Material</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            
            <div class="summary">
              <p>High-cost meshes: ${sorted.filter(m => m.totalCost > threshold).length}</p>
              <p>Total triangles: ${sorted.reduce((sum, m) => sum + m.triangles, 0).toLocaleString()}</p>
            </div>
          </div>
        `;
      },

      onMount(container: HTMLElement, context: DevtoolContext) {
        // Inject styles
        const style = document.createElement('style');
        style.textContent = `
          .mesh-analyzer { padding: 16px; }
          .mesh-analyzer .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
          .mesh-analyzer .analyze-btn { background: var(--3lens-accent); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; color: white; }
          .mesh-analyzer .analysis-table { width: 100%; border-collapse: collapse; }
          .mesh-analyzer .analysis-table th, .mesh-analyzer .analysis-table td { padding: 8px; text-align: left; border-bottom: 1px solid var(--3lens-border); }
          .mesh-analyzer .analysis-table .high-cost { background: rgba(244, 67, 54, 0.2); }
          .mesh-analyzer .summary { margin-top: 16px; padding: 12px; background: var(--3lens-bg-secondary); border-radius: 8px; }
        `;
        container.appendChild(style);

        // Handle analyze button
        container.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (target.dataset.action === 'analyze') {
            analyzeScene(context);
          }
        });
      },
    },
  ],

  toolbarActions: [
    {
      id: 'quick-analyze',
      name: 'Analyze Scene',
      icon: '🔍',
      order: 100,
      
      onClick(context) {
        analyzeScene(context);
      },
    },
  ],
};

function analyzeScene(context: DevtoolContext) {
  const snapshot = context.getSnapshot();
  if (!snapshot) {
    context.showToast('No scene data available', 'warning');
    return;
  }

  const analyses: MeshAnalysis[] = [];

  snapshot.nodes.forEach((node) => {
    if (node.type === 'Mesh' && node.geometry) {
      const triangles = node.geometry.faceCount ?? 0;
      const materialComplexity = estimateMaterialComplexity(node);
      const totalCost = (triangles / 1000) + (materialComplexity * 10);

      analyses.push({
        uuid: node.uuid,
        name: node.name || 'Unnamed',
        triangles,
        drawCalls: 1,
        materialComplexity,
        totalCost,
      });
    }
  });

  context.setState('analyses', analyses);
  context.requestRender();
  context.showToast(`Analyzed ${analyses.length} meshes`, 'success');
}

function estimateMaterialComplexity(node: any): number {
  // Simplified complexity estimation
  let complexity = 1;
  
  if (node.material?.type?.includes('Physical')) complexity += 3;
  if (node.material?.type?.includes('Standard')) complexity += 2;
  if (node.material?.map) complexity += 1;
  if (node.material?.normalMap) complexity += 2;
  if (node.material?.roughnessMap) complexity += 1;
  
  return Math.min(complexity, 10);
}
```

---

## Common Pitfalls

### 1. Plugin ID Conflicts

```typescript
// ❌ Bad - Generic ID may conflict
metadata: { id: 'stats-plugin' }

// ✅ Good - Unique reverse-domain ID
metadata: { id: 'com.mycompany.stats-plugin' }
```

### 2. Memory Leaks in Event Handlers

```typescript
// ❌ Bad - Event listener not cleaned up
activate(context) {
  window.addEventListener('resize', this.handleResize);
}

// ✅ Good - Clean up in deactivate
activate(context) {
  this.handleResize = () => { /* ... */ };
  window.addEventListener('resize', this.handleResize);
  context.setState('resizeHandler', this.handleResize);
}

deactivate(context) {
  const handler = context.getState('resizeHandler');
  window.removeEventListener('resize', handler);
}
```

### 3. Rendering Without Data

```typescript
// ❌ Bad - Crashes if frameStats is null
render(ctx) {
  return `<p>FPS: ${ctx.frameStats.fps}</p>`;
}

// ✅ Good - Handle missing data
render(ctx) {
  if (!ctx.frameStats) {
    return '<p>Loading...</p>';
  }
  return `<p>FPS: ${ctx.frameStats.fps.toFixed(1)}</p>`;
}
```

### 4. Blocking the Main Thread

```typescript
// ❌ Bad - Heavy computation blocks rendering
onClick(context) {
  const result = heavyAnalysis(); // Blocks for 500ms
}

// ✅ Good - Use async/Web Workers
async onClick(context) {
  context.showToast('Analyzing...', 'info');
  const result = await runInWorker(heavyAnalysis);
  context.setState('result', result);
  context.requestRender();
}
```

### 5. Not Using CSS Variables

```typescript
// ❌ Bad - Hardcoded colors don't match theme
render() {
  return '<div style="background: #1e1e1e; color: white;">...</div>';
}

// ✅ Good - Use 3Lens CSS variables
render() {
  return '<div style="background: var(--3lens-bg-primary); color: var(--3lens-text-primary);">...</div>';
}
```

### 6. Missing Version Constraints

```typescript
// ❌ Bad - May break with 3Lens updates
metadata: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' }

// ✅ Good - Specify minimum version
metadata: {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  minVersion: '1.0.0', // Minimum 3Lens version required
}
```

---

## Debugging Plugins

### Enable Debug Logging

```typescript
activate(context) {
  context.setLogLevel('debug');
  context.log('Plugin activated with debug logging');
}
```

### Inspect Plugin State

```typescript
// In browser console
const probe = window.__3LENS_PROBE__;
const pluginState = probe.getPluginState('com.mycompany.my-plugin');
console.log(pluginState);
```

### Hot Reloading During Development

```typescript
// Re-register plugin without page reload
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    probe.deactivatePlugin('com.mycompany.my-plugin');
    probe.unregisterPlugin('com.mycompany.my-plugin');
    probe.registerAndActivatePlugin(MyPlugin);
  });
}
```

---

## Related Guides

- [Getting Started](./GETTING-STARTED.md)
- [Custom Rules Guide](./CUSTOM-RULES-GUIDE.md)
- [React/R3F Guide](./REACT-R3F-GUIDE.md)
- [Angular Guide](./ANGULAR-GUIDE.md)
- [Vue/TresJS Guide](./VUE-TRESJS-GUIDE.md)
- [CI Integration](./CI-INTEGRATION.md)

## Built-in Plugins

Check out the built-in plugins for reference implementations:

- `LODCheckerPlugin` - Analyzes mesh LOD configurations
- `ShadowDebuggerPlugin` - Shadow map analysis and debugging

## API Reference

- [DevtoolPlugin Interface](/api/core/devtool-plugin)
- [DevtoolContext Interface](/api/core/devtool-context)
- [PluginManager](/api/core/plugin-manager)
