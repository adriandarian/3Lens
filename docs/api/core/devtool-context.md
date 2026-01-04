# DevtoolContext Interface

The `DevtoolContext` interface provides plugins with access to 3Lens functionality. It's passed to plugin lifecycle methods (`activate`, `deactivate`) and various callbacks.

## Overview

```typescript
activate(context: DevtoolContext) {
  // Access frame stats
  const stats = context.getFrameStats();
  
  // Access scene snapshot
  const snapshot = context.getSnapshot();
  
  // Manage plugin state
  context.setState('counter', 0);
  const counter = context.getState<number>('counter');
  
  // Show notifications
  context.showToast('Plugin ready!', 'success');
  
  // Inter-plugin communication
  context.sendMessage('other-plugin', 'event-type', { data: 123 });
  
  // Request UI update
  context.requestRender();
}
```

## Interface Definition

```typescript
interface DevtoolContext {
  /** The probe instance */
  probe: DevtoolProbe;

  /** Get current frame stats */
  getFrameStats(): FrameStats | null;

  /** Get current scene snapshot */
  getSnapshot(): SceneSnapshot | null;

  /** Get currently selected node */
  getSelectedNode(): SceneNode | null;

  /** Select an object by UUID */
  selectObject(uuid: string): void;

  /** Clear selection */
  clearSelection(): void;

  /** Get all logical entities */
  getEntities(): LogicalEntity[];

  /** Get module info */
  getModuleInfo(moduleId: string): ModuleInfo | undefined;

  /** Log a message */
  log(message: string, data?: Record<string, unknown>): void;

  /** Show a toast notification */
  showToast(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void;

  /** Get plugin state */
  getState<T = unknown>(key: string): T | undefined;

  /** Set plugin state */
  setState<T = unknown>(key: string, value: T): void;

  /** Get all plugin state */
  getAllState(): Record<string, unknown>;

  /** Clear plugin state */
  clearState(): void;

  /** Send a message to another plugin */
  sendMessage(target: PluginId | '*', type: string, payload: unknown): void;

  /** Subscribe to messages */
  onMessage(handler: PluginMessageHandler): () => void;

  /** Request a panel re-render */
  requestRender(): void;

  /** Get the plugin's container element */
  getContainer(): HTMLElement | null;
}
```

## Data Access Methods

### getFrameStats

Returns the current frame statistics, or `null` if not yet available.

```typescript
getFrameStats(): FrameStats | null
```

**Example:**

```typescript
const stats = context.getFrameStats();
if (stats) {
  console.log(`FPS: ${stats.fps}`);
  console.log(`Draw Calls: ${stats.drawCalls}`);
  console.log(`Triangles: ${stats.triangles}`);
  console.log(`Frame Time: ${stats.frameTime}ms`);
}
```

### getSnapshot

Returns the current scene snapshot, or `null` if not yet available.

```typescript
getSnapshot(): SceneSnapshot | null
```

**Example:**

```typescript
const snapshot = context.getSnapshot();
if (snapshot) {
  console.log(`Objects: ${snapshot.objectCount}`);
  console.log(`Materials: ${snapshot.materialCount}`);
  console.log(`Textures: ${snapshot.textureCount}`);
}
```

### getSelectedNode

Returns the currently selected scene node, or `null` if nothing is selected.

```typescript
getSelectedNode(): SceneNode | null
```

**Example:**

```typescript
const node = context.getSelectedNode();
if (node) {
  console.log(`Selected: ${node.name}`);
  console.log(`Type: ${node.type}`);
  console.log(`UUID: ${node.uuid}`);
  console.log(`Position: ${node.position.join(', ')}`);
}
```

### getEntities

Returns all registered logical entities.

```typescript
getEntities(): LogicalEntity[]
```

**Example:**

```typescript
const entities = context.getEntities();
const enemies = entities.filter(e => e.tags.includes('enemy'));
console.log(`Enemy count: ${enemies.length}`);
```

### getModuleInfo

Returns module information by module ID.

```typescript
getModuleInfo(moduleId: string): ModuleInfo | undefined
```

**Example:**

```typescript
const playerModule = context.getModuleInfo('@game/player');
if (playerModule) {
  console.log(`Player triangles: ${playerModule.metrics.triangles}`);
  console.log(`Player draw calls: ${playerModule.metrics.drawCalls}`);
}
```

## Selection Methods

### selectObject

Selects a Three.js object by its UUID.

```typescript
selectObject(uuid: string): void
```

**Example:**

```typescript
// Select an object from entity
const entity = context.getEntities().find(e => e.name === 'Player');
if (entity && entity.objectUuids.length > 0) {
  context.selectObject(entity.objectUuids[0]);
}
```

### clearSelection

Clears the current selection.

```typescript
clearSelection(): void
```

**Example:**

```typescript
context.clearSelection();
context.showToast('Selection cleared', 'info');
```

## State Management

Plugins can store persistent state that survives panel re-renders.

### setState

Sets a state value.

```typescript
setState<T = unknown>(key: string, value: T): void
```

**Example:**

```typescript
context.setState('analysisResults', results);
context.setState('lastRunTime', Date.now());
context.setState('settings', { threshold: 100, enabled: true });
```

### getState

Gets a state value.

```typescript
getState<T = unknown>(key: string): T | undefined
```

**Example:**

```typescript
const results = context.getState<AnalysisResult[]>('analysisResults');
const lastRun = context.getState<number>('lastRunTime');
const settings = context.getState<Settings>('settings');

if (results && lastRun) {
  const age = Date.now() - lastRun;
  console.log(`Results from ${age}ms ago`);
}
```

### getAllState

Gets all state as an object.

```typescript
getAllState(): Record<string, unknown>
```

**Example:**

```typescript
const allState = context.getAllState();
console.log('Plugin state:', allState);
```

### clearState

Clears all plugin state.

```typescript
clearState(): void
```

**Example:**

```typescript
deactivate(context) {
  // Clean up all state on deactivation
  context.clearState();
}
```

## Logging & Notifications

### log

Logs a message to the 3Lens console.

```typescript
log(message: string, data?: Record<string, unknown>): void
```

**Example:**

```typescript
context.log('Analysis started');
context.log('Found issues', { count: 5, severity: 'warning' });
context.log('Object analyzed', { 
  name: 'Player',
  triangles: 50000,
  recommendation: 'Consider LOD'
});
```

### showToast

Shows a toast notification to the user.

```typescript
showToast(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void
```

**Example:**

```typescript
context.showToast('Analysis complete!', 'success');
context.showToast('No objects selected', 'warning');
context.showToast('Failed to export', 'error');
context.showToast('Processing...', 'info');
```

## Inter-Plugin Communication

### sendMessage

Sends a message to another plugin or broadcasts to all plugins.

```typescript
sendMessage(target: PluginId | '*', type: string, payload: unknown): void
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | `PluginId \| '*'` | Target plugin ID, or `'*'` to broadcast |
| `type` | `string` | Message type identifier |
| `payload` | `unknown` | Message data |

**Example:**

```typescript
// Send to specific plugin
context.sendMessage('3lens.shadow-debugger', 'highlight-light', {
  uuid: light.uuid,
});

// Broadcast to all plugins
context.sendMessage('*', 'selection-changed', {
  uuid: selectedObject.uuid,
  name: selectedObject.name,
});
```

### onMessage

Subscribes to messages from other plugins.

```typescript
onMessage(handler: PluginMessageHandler): () => void
```

**Returns:** Unsubscribe function.

**Example:**

```typescript
activate(context) {
  const unsubscribe = context.onMessage((message) => {
    console.log(`Message from ${message.source}: ${message.type}`);
    
    if (message.type === 'highlight-request') {
      const { uuid } = message.payload as { uuid: string };
      highlightObject(uuid);
    }
  });

  // Store unsubscribe function for cleanup
  context.setState('messageUnsubscribe', unsubscribe);
}

deactivate(context) {
  const unsubscribe = context.getState<() => void>('messageUnsubscribe');
  if (unsubscribe) unsubscribe();
}
```

### PluginMessage

Message structure:

```typescript
interface PluginMessage {
  /** Source plugin ID */
  source: PluginId;

  /** Target plugin ID (or '*' for broadcast) */
  target: PluginId | '*';

  /** Message type */
  type: string;

  /** Message payload */
  payload: unknown;

  /** Timestamp */
  timestamp: number;
}
```

## UI Methods

### requestRender

Requests the plugin's panel to re-render. Use this after state changes that should update the UI.

```typescript
requestRender(): void
```

**Example:**

```typescript
toolbarActions: [{
  id: 'refresh-analysis',
  name: 'Refresh',
  icon: '🔄',
  onClick(context) {
    const results = runAnalysis(context.probe);
    context.setState('results', results);
    context.requestRender(); // Trigger panel update
    context.showToast('Analysis refreshed', 'success');
  },
}],
```

### getContainer

Gets the plugin's panel container element, if the panel is currently mounted.

```typescript
getContainer(): HTMLElement | null
```

**Example:**

```typescript
const container = context.getContainer();
if (container) {
  // Direct DOM manipulation
  const chart = container.querySelector('.chart');
  if (chart) {
    updateChart(chart, newData);
  }
}
```

## Probe Access

### probe

Direct access to the `DevtoolProbe` instance for advanced operations.

```typescript
probe: DevtoolProbe
```

**Example:**

```typescript
// Access probe directly for advanced operations
const probe = context.probe;

// Get renderer info
const renderer = probe.getObservedRenderer();

// Get scene
const scene = probe.getObservedScene();

// Filter entities
const enemies = probe.filterEntities({ tags: ['enemy'] });

// Get performance tracker
const perfStats = probe.getPerformanceStats();
```

## Complete Example

```typescript
const AnalyzerPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.analyzer',
    name: 'Scene Analyzer',
    version: '1.0.0',
  },

  activate(context) {
    context.log('Analyzer plugin activated');

    // Initialize state
    context.setState('analysisResults', []);
    context.setState('isAnalyzing', false);

    // Subscribe to messages
    const unsubscribe = context.onMessage((msg) => {
      if (msg.type === 'request-analysis') {
        runAnalysis(context);
      }
    });
    context.setState('unsubscribe', unsubscribe);

    // Run initial analysis
    runAnalysis(context);
  },

  deactivate(context) {
    // Clean up
    const unsubscribe = context.getState<() => void>('unsubscribe');
    if (unsubscribe) unsubscribe();
    context.clearState();
    context.log('Analyzer plugin deactivated');
  },

  panels: [{
    id: 'results',
    name: 'Analysis Results',
    render(ctx) {
      const results = ctx.state.analysisResults as AnalysisResult[];
      const isAnalyzing = ctx.state.isAnalyzing as boolean;

      if (isAnalyzing) {
        return '<div class="loading">Analyzing...</div>';
      }

      if (!results.length) {
        return '<div class="empty">No results yet</div>';
      }

      return `
        <div class="results">
          <h3>Found ${results.length} issues</h3>
          <ul>
            ${results.map(r => `
              <li class="${r.severity}">
                <strong>${r.object}</strong>: ${r.message}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    },
  }],

  toolbarActions: [{
    id: 'run-analysis',
    name: 'Run Analysis',
    icon: '🔍',
    onClick(context) {
      runAnalysis(context);
    },
    isEnabled(context) {
      return !context.getState<boolean>('isAnalyzing');
    },
  }],
};

async function runAnalysis(context: DevtoolContext) {
  context.setState('isAnalyzing', true);
  context.requestRender();

  const snapshot = context.getSnapshot();
  if (!snapshot) {
    context.showToast('No scene data available', 'warning');
    context.setState('isAnalyzing', false);
    context.requestRender();
    return;
  }

  // Perform analysis...
  const results = analyzeScene(snapshot);

  context.setState('analysisResults', results);
  context.setState('isAnalyzing', false);
  context.requestRender();

  context.log('Analysis complete', { issueCount: results.length });
  context.showToast(`Found ${results.length} issues`, 'success');

  // Notify other plugins
  context.sendMessage('*', 'analysis-complete', { results });
}
```

## See Also

- [DevtoolPlugin](./devtool-plugin.md) - Plugin interface
- [PluginManager](./plugin-manager.md) - Plugin lifecycle management
- [DevtoolProbe](./devtool-probe.md) - Probe API
- [FrameStats](./frame-stats.md) - Frame statistics type
- [SceneSnapshot](./scene-snapshot.md) - Scene snapshot type
