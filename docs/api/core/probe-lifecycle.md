# Probe Lifecycle

Understanding the probe lifecycle is essential for proper resource management and avoiding memory leaks. This guide covers initialization, connection states, and disposal.

## Lifecycle Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROBE LIFECYCLE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌─────────┐  │
│  │  Create  │───▶│  Observe  │───▶│  Active  │───▶│ Dispose │  │
│  │          │    │           │    │          │    │         │  │
│  └──────────┘    └───────────┘    └──────────┘    └─────────┘  │
│       │               │               │               │        │
│       ▼               ▼               ▼               ▼        │
│   createProbe()   observeRenderer()  (running)    dispose()    │
│                   observeScene()                               │
│                                                                 │
│  ◄─────────────── connect() / disconnect() ──────────────────▶ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Phase 1: Creation

### `createProbe()` / `new DevtoolProbe()`

When a probe is created, it:

1. **Stores configuration** - Merges provided config with defaults
2. **Initializes internal state** - Sets up callbacks, maps, and trackers
3. **Auto-connects transport** - In browser environments, sets up postMessage transport for extension communication

```typescript
import { createProbe } from '@3lens/core';

// Probe is created but not yet observing anything
const probe = createProbe({
  appName: 'My App',
  env: 'development',
});
```

### What Happens Internally

```typescript
// Simplified internal flow
constructor(config: ProbeConfig) {
  // 1. Merge config with defaults
  this.config = {
    env: 'development',
    debug: false,
    ...config,
    sampling: {
      frameStats: 'every-frame',
      snapshots: 'on-change',
      gpuTiming: true,
      resourceTracking: true,
      ...config.sampling,
    },
  };

  // 2. Initialize subsystems
  this._configLoader = new ConfigLoader(this.config);
  this._sceneObservers = new Map();
  this._selectionCallbacks = [];
  this._frameStatsCallbacks = [];
  // ... more initialization
}
```

### Auto-Connection (createProbe only)

The `createProbe()` factory automatically establishes a connection (except in production unless explicitly enabled):

```typescript
// In createProbe():
const env = config.env ?? 'development';
if (
  typeof window !== 'undefined' &&
  typeof window.postMessage === 'function' &&
  (env !== 'production' || config.allowPostMessageTransport === true)
) {
  const transport = createPostMessageTransport();
  probe.connect(transport);
}
```

This enables automatic discovery by the 3Lens browser extension.

## Phase 2: Observation

After creation, you must tell the probe what to observe.

### `observeRenderer()`

Attaches the probe to a three.js renderer.

```typescript
const renderer = new THREE.WebGLRenderer();
probe.observeRenderer(renderer);
```

**What happens:**

1. **Detects renderer type** - WebGL vs WebGPU
2. **Creates adapter** - Platform-specific stats collection
3. **Subscribes to frames** - Hooks into render loop

```typescript
// Simplified internal flow
observeRenderer(renderer) {
  // Detect three.js version
  this._threeVersion = renderer.version ?? null;
  
  // Create appropriate adapter
  if (isWebGPURenderer(renderer)) {
    adapter = createWebGPUAdapter(renderer);
  } else {
    adapter = createWebGLAdapter(renderer, { gpuTiming: true });
  }
  
  // Subscribe to frame stats
  adapter.observeFrame((stats) => {
    this.handleFrameStats(stats);
  });
}
```

### `observeScene()`

Attaches the probe to a three.js scene.

```typescript
const scene = new THREE.Scene();
probe.observeScene(scene);
```

**What happens:**

1. **Creates SceneObserver** - Tracks scene graph structure
2. **Subscribes to changes** - Detects object add/remove/modify
3. **Enables resource tracking** - Materials, geometries, textures

```typescript
// Simplified internal flow
observeScene(scene) {
  if (this._sceneObservers.has(scene)) return;
  
  const observer = new SceneObserver(scene, {
    onSceneChange: () => this.handleSceneChange(),
    onResourceEvent: (event) => this.handleResourceEvent(event),
  });
  
  this._sceneObservers.set(scene, observer);
}
```

### Observation Order

You can observe renderer and scene(s) in any order:

```typescript
// Order doesn't matter
probe.observeScene(scene);      // Works
probe.observeRenderer(renderer); // Works

// Or
probe.observeRenderer(renderer); // Works
probe.observeScene(scene);      // Works
```

### Multiple Scenes

Observe multiple scenes simultaneously:

```typescript
probe.observeScene(mainScene);
probe.observeScene(uiScene);
probe.observeScene(debugScene);

// Check what's observed
const scenes = probe.getObservedScenes();
console.log(`Observing ${scenes.length} scenes`);
```

## Phase 3: Active State

Once observing, the probe is "active" and:

- Collects frame statistics on each render
- Monitors scene graph changes
- Tracks resource lifecycle events
- Responds to devtool commands
- Broadcasts data to connected UIs

### Subscription Callbacks

Subscribe to various events during the active phase:

```typescript
// Frame stats (every frame or as configured)
const unsub1 = probe.onFrameStats((stats) => {
  updateFpsDisplay(stats.performance?.fps);
});

// Scene snapshots
const unsub2 = probe.onSnapshot((snapshot) => {
  console.log('Scene changed:', snapshot.scenes.length);
});

// Selection changes
const unsub3 = probe.onSelectionChanged((obj, meta) => {
  updateInspector(obj, meta);
});

// Commands from devtool
const unsub4 = probe.onCommand((command) => {
  handleDevtoolCommand(command);
});
```

### Stopping Observation

You can stop observing specific resources:

```typescript
// Stop observing a scene
probe.unobserveScene(temporaryScene);

// Stop observing a render target
probe.unobserveRenderTarget(tempRT);
```

## Phase 4: Disposal

**Always dispose the probe when done** to prevent memory leaks.

### `dispose()`

```typescript
probe.dispose();
```

**What happens:**

1. **Disposes selection helper** - Removes highlight meshes
2. **Disposes inspect mode** - Removes event listeners
3. **Removes visualization helpers** - Cleans up wireframes, bounding boxes
4. **Disposes renderer adapter** - Stops frame observation
5. **Disposes scene observers** - Removes scene tracking
6. **Closes transport** - Disconnects from devtools
7. **Clears callbacks** - Removes all subscriptions

```typescript
// Simplified internal flow
dispose() {
  // Clean up helpers
  this._selectionHelper?.dispose();
  this._inspectMode?.dispose();
  
  // Clean up visualization helpers
  for (const helper of this._visualizationHelpers.values()) {
    helper.parent?.remove(helper);
    // Dispose geometry and material
  }
  this._visualizationHelpers.clear();
  
  // Clean up renderer adapter
  this._rendererAdapter?.dispose();
  this._rendererAdapter = null;
  
  // Clean up scene observers
  for (const observer of this._sceneObservers.values()) {
    observer.dispose();
  }
  this._sceneObservers.clear();
  
  // Close transport
  this._transport?.close();
  this._transport = null;
  
  // Clear callbacks
  this._selectionCallbacks = [];
  this._frameStatsCallbacks = [];
  this._commandCallbacks = [];
}
```

### Framework Integration

#### React

```typescript
import { useEffect, useRef } from 'react';
import { createProbe, DevtoolProbe } from '@3lens/core';

function useProbe(appName: string): DevtoolProbe | null {
  const probeRef = useRef<DevtoolProbe | null>(null);
  
  useEffect(() => {
    const probe = createProbe({ appName });
    probeRef.current = probe;
    
    // Cleanup on unmount
    return () => {
      probe.dispose();
      probeRef.current = null;
    };
  }, [appName]);
  
  return probeRef.current;
}
```

#### Vue

```typescript
import { onMounted, onUnmounted, ref } from 'vue';
import { createProbe, DevtoolProbe } from '@3lens/core';

export function useProbe(appName: string) {
  const probe = ref<DevtoolProbe | null>(null);
  
  onMounted(() => {
    probe.value = createProbe({ appName });
  });
  
  onUnmounted(() => {
    probe.value?.dispose();
    probe.value = null;
  });
  
  return probe;
}
```

#### Angular

```typescript
import { Injectable, OnDestroy } from '@angular/core';
import { createProbe, DevtoolProbe } from '@3lens/core';

@Injectable()
export class ProbeService implements OnDestroy {
  private probe: DevtoolProbe;
  
  constructor() {
    this.probe = createProbe({ appName: 'Angular App' });
  }
  
  ngOnDestroy(): void {
    this.probe.dispose();
  }
}
```

#### Vanilla JavaScript

```typescript
const probe = createProbe({ appName: 'My App' });

// Dispose on page unload
window.addEventListener('beforeunload', () => {
  probe.dispose();
});

// Or when switching views/routes
function cleanup() {
  probe.dispose();
}
```

## Connection Management

### `connect()`

Manually connect to a transport:

```typescript
import { createPostMessageTransport } from '@3lens/core';

const transport = createPostMessageTransport();
probe.connect(transport);
```

### `disconnect()`

Disconnect from the current transport:

```typescript
probe.disconnect();
```

### `isConnected()`

Check connection status:

```typescript
if (probe.isConnected()) {
  console.log('Connected to devtools');
}
```

### Connection States

```
┌─────────────┐     connect()     ┌─────────────┐
│ Disconnected│ ─────────────────▶│  Connected  │
│             │◀───────────────── │             │
└─────────────┘    disconnect()   └─────────────┘
                   or dispose()
```

## Lazy Initialization

Some subsystems are lazily initialized for performance:

```typescript
// These are created on first use, not at probe creation:
// - SelectionHelper
// - InspectMode
// - TransformGizmo
// - CameraController
// - LogicalEntityManager
// - PluginManager, PluginLoader, PluginRegistry
```

This means an unused probe has minimal memory footprint.

## Error Handling

The probe catches and logs errors in callbacks to prevent breaking the render loop:

```typescript
// Your callback error won't crash the app
probe.onFrameStats((stats) => {
  throw new Error('Oops!'); // Caught internally, logged if debug: true
});
```

## Best Practices

### 1. Create Early, Dispose Late

```typescript
// ✅ Good - create before assets load
const probe = createProbe({ appName: 'My App' });

loadAssets().then(() => {
  probe.observeScene(scene);
  startGame();
});

// Dispose only when truly done
function onGameExit() {
  probe.dispose();
}
```

### 2. One Probe Per Application

```typescript
// ✅ Good - single probe
const probe = createProbe({ appName: 'My App' });
probe.observeScene(scene1);
probe.observeScene(scene2);

// ❌ Avoid - multiple probes
const probe1 = createProbe({ appName: 'Scene 1' });
const probe2 = createProbe({ appName: 'Scene 2' });
```

### 3. Unsubscribe When Done

```typescript
const unsubscribe = probe.onFrameStats(callback);

// When no longer needed
unsubscribe();
```

### 4. Handle Hot Module Replacement (HMR)

```typescript
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    probe.dispose();
  });
}
```

## Lifecycle Events

Monitor probe state with debug mode:

```typescript
const probe = createProbe({
  appName: 'My App',
  debug: true, // Logs lifecycle events
});
```

Console output:
```
[3Lens] Probe initialized { appName: "My App" }
[3Lens] Detected WebGL renderer { gpuTiming: true }
[3Lens] Observing renderer { type: "webgl" }
[3Lens] Observing scene { name: "Main" }
[3Lens] Connected to transport
[3Lens] Inspect mode initialized
[3Lens] Probe disposed
```

## Related

- [createProbe()](./create-probe.md) - Factory function
- [DevtoolProbe](./devtool-probe.md) - Full API reference
- [Transport Layer](./transport.md) - Communication system
- [Getting Started](/guide/getting-started) - Tutorial
