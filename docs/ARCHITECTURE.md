# 3Lens Architecture

This document describes the high-level architecture of 3Lens, including its core components, data flow, and design principles.

## Table of Contents

1. [Design Principles](#design-principles)
2. [System Overview](#system-overview)
3. [Core Components](#core-components)
4. [Deployment Modes](#deployment-modes)
5. [Data Model](#data-model)
6. [Renderer Adapters](#renderer-adapters)
7. [Framework Bridges](#framework-bridges)
8. [Plugin System](#plugin-system)

---

## Design Principles

### 1. Universal Compatibility
- Works with **any** three.js application: vanilla, R3F, Vue, Angular, legacy code
- No hard coupling to specific frameworks or build systems
- Graceful degradation when features are unavailable

### 2. Deep Introspection
- Not just scene graph — full renderer, GPU timings, memory, and resource lifecycles
- Every detail accessible: from high-level scene structure to individual shader uniforms

### 3. Renderer Agnostic
- First-class support for both WebGL and WebGPU
- Pluggable adapter architecture for future rendering backends
- Backend-neutral data model with backend-specific extensions

### 4. Extensibility First
- Stable debug protocol for tool interoperability
- Plugin API for custom panels, metrics, and visualizations
- Configuration-driven behavior for team-wide conventions

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER APPLICATION                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        three.js Scene                            │    │
│  │   • WebGLRenderer / WebGPURenderer                              │    │
│  │   • Scene, Camera, Meshes, Materials, Textures                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        PROBE SDK (@3lens/core)                   │    │
│  │   • Renderer Adapter (WebGL/WebGPU)                             │    │
│  │   • Scene Observer                                               │    │
│  │   • Frame Stats Collector                                        │    │
│  │   • Resource Tracker                                             │    │
│  │   • Selection Bus                                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                          TRANSPORT LAYER
                    (postMessage / WebSocket)
                                     │
┌────────────────────────────────────┼─────────────────────────────────────┐
│                           DEVTOOL UI HOST                                │
│                                    │                                     │
│  ┌─────────────┐  ┌─────────────┐  │  ┌─────────────┐  ┌─────────────┐  │
│  │   Browser   │  │  Standalone │  │  │   In-App    │  │   CI Mode   │  │
│  │  Extension  │  │     App     │  │  │   Overlay   │  │  (Headless) │  │
│  └─────────────┘  └─────────────┘  │  └─────────────┘  └─────────────┘  │
│                                    │                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         UI PANELS                                │    │
│  │   • Scene Explorer    • Performance    • Resources              │    │
│  │   • Materials         • Pipeline       • Textures               │    │
│  │   • Timeline          • Plugin Panels                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        PLUGIN SYSTEM                             │    │
│  │   • Custom panels    • Custom metrics    • Custom rules         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### A. Probe SDK (`@3lens/core`)

The in-page library that instruments three.js and exposes a debug API.

**Responsibilities:**
- Attach to renderers (WebGLRenderer, WebGPURenderer)
- Observe scene graph changes
- Collect per-frame statistics
- Track resource lifecycles (created/updated/disposed)
- Gather GPU/CPU timings
- Manage object selection state

**Key Classes:**

```typescript
// Main entry point
class DevtoolProbe {
  constructor(config: ProbeConfig);
  
  // Renderer attachment
  observeRenderer(renderer: THREE.Renderer): void;
  attachRendererAdapter(adapter: RendererAdapter): void;
  
  // Scene observation
  observeScene(scene: THREE.Scene): void;
  
  // Object selection
  selectObject(obj: THREE.Object3D | null): void;
  onSelectionChanged(callback: SelectionCallback): Unsubscribe;
  
  // Logical entities (component mapping)
  registerLogicalEntity(entity: LogicalEntity): void;
  unregisterLogicalEntity(id: string): void;
  
  // Custom metrics
  metric(name: string, value: number, tags?: Record<string, string>): void;
  
  // Commands from devtool
  onCommand(handler: CommandHandler): Unsubscribe;
}
```

### B. Transport Layer

Abstract communication channel between the probe and devtool UI.

**Implementations:**

| Mode | Transport | Description |
|------|-----------|-------------|
| Browser Extension | `window.postMessage` | DevTools extension bridge |
| Standalone App | WebSocket / WebRTC | Remote debugging |
| In-App Overlay | Direct function calls | Same runtime |
| CI Mode | JSON export | File-based metrics |

**Protocol:**
- JSON-based message format
- Bidirectional: probe → UI (data) and UI → probe (commands)
- Throttling and batching for performance
- See [PROTOCOL.md](./PROTOCOL.md) for full specification

### C. Devtool UI Host

The user interface that displays debugging information.

**Shells:**

1. **Browser Extension Shell**
   - Chrome/Firefox DevTools panel
   - Injects content script to load probe
   - Zero configuration for basic use

2. **Standalone Application**
   - Electron or web app
   - Connects via WebSocket
   - Session recording and replay
   - Offline analysis and comparison

3. **In-App Overlay** (`@3lens/overlay`)
   - npm package for dev builds
   - Dockable panel over canvas
   - Full framework access
   - Tree-shakeable for production

4. **CI Mode**
   - Headless operation
   - Metric export after scripted interactions
   - Threshold-based pass/fail

### D. UI Panels

| Panel | Description |
|-------|-------------|
| **Scene Explorer** | Tree view of scene graph, object selection, hierarchy navigation |
| **Materials** | Material inspector with property editing, shader source view |
| **Geometry** | Vertex/index counts, attributes, memory estimates |
| **Pipeline** | Render passes visualization, postprocessing chain |
| **Render Targets** | Thumbnail grid of render targets, pixel inspection |
| **Textures** | Texture list with size/format info, leak detection |
| **Performance** | Frame time charts, draw call breakdown, object cost heatmap |
| **Resources** | Live counts, lifecycle events, leak detection |
| **Timeline** | High-level events, custom app events |

---

## Deployment Modes

### Mode 1: Browser Extension

```
┌──────────────────┐     postMessage     ┌──────────────────┐
│   Web Page       │◄───────────────────►│  DevTools Panel  │
│   + Probe SDK    │                     │  (Extension)     │
└──────────────────┘                     └──────────────────┘
```

**Characteristics:**
- Zero changes to app code (probe injected by extension)
- Works on any three.js page
- Limited metadata (no component linkage)

**Instrumentation Strategy:**
1. Extension injects content script
2. Wait for global `THREE` object
3. Wrap `WebGLRenderer` constructor and `render()` method
4. Monkeypatch `Object3D.prototype.add/remove`

### Mode 2: Standalone App

```
┌──────────────────┐     WebSocket       ┌──────────────────┐
│   Web Page       │◄───────────────────►│  Standalone App  │
│   + Probe SDK    │                     │  (Electron/Web)  │
└──────────────────┘                     └──────────────────┘
```

**Characteristics:**
- Remote debugging
- Session recording/replay
- Build comparison (A/B testing)
- CI integration

### Mode 3: In-App npm Integration

```
┌──────────────────────────────────────────────────────────┐
│   Web Page (Dev Build)                                   │
│   ┌────────────────┐         ┌────────────────────────┐  │
│   │   App Code     │────────►│   @3lens/overlay       │  │
│   │   + Probe SDK  │         │   (Dockable Panel)     │  │
│   └────────────────┘         └────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Full framework access
- Component ↔ three.js object linkage
- Custom metrics from business logic
- Dev-only (tree-shaken in prod)

**Usage:**

```typescript
// main.dev.ts
import { createProbe } from '@3lens/core';
import { mountOverlay } from '@3lens/overlay';

const probe = createProbe({ appName: 'MyApp' });
probe.observeRenderer(renderer);
probe.observeScene(scene);
mountOverlay({ probe });
```

---

## Data Model

### Entity IDs

Every tracked three.js object gets a stable debug ID:

```typescript
interface TrackedObjectRef {
  debugId: string;        // Stable ID for devtool
  threeUuid: string;      // three.js uuid
  type: string;           // 'Mesh', 'Scene', 'PerspectiveCamera', etc.
  name?: string;          // object.name
  path?: string;          // Scene path: "/Root/World/Terrain/Mesh_001"
}
```

### Snapshots

Full view of scene state at a point in time:

```typescript
interface SceneSnapshot {
  snapshotId: string;
  timestamp: number;
  scenes: SceneNode[];
}

interface SceneNode {
  ref: TrackedObjectRef;
  transform: TransformData;
  visible: boolean;
  frustumCulled: boolean;
  layers: number;
  boundingBox?: Box3Data;
  boundingSphere?: SphereData;
  children: SceneNode[];
  
  // Type-specific data
  meshData?: MeshNodeData;
  lightData?: LightNodeData;
  cameraData?: CameraNodeData;
}
```

### Frame Statistics

Per-frame performance data:

```typescript
interface FrameStats {
  frame: number;
  timestamp: number;
  cpuTimeMs: number;
  gpuTimeMs?: number;
  
  triangles: number;
  drawCalls: number;
  points: number;
  lines: number;
  
  objectsVisible: number;
  objectsTotal: number;
  materialsUsed: number;
  
  backend: 'webgl' | 'webgpu';
  
  webglExtras?: {
    programSwitches: number;
    textureBindings: number;
  };
  
  webgpuExtras?: {
    pipelinesUsed: number;
    timestampBreakdown?: Record<string, number>;
  };
}
```

### Logical Entities

Mapping between framework components and three.js objects:

```typescript
interface LogicalEntity {
  id: string;
  label: string;
  moduleId?: string;       // e.g., 'libs/viewer' for Nx
  componentId?: string;    // e.g., 'React:HealthBar#123'
  objects: THREE.Object3D[];
}
```

---

## Renderer Adapters

Backend-agnostic architecture for supporting multiple renderers.

```typescript
interface RendererAdapter {
  kind: 'webgl' | 'webgpu';
  
  // Frame observation
  observeFrame(callback: (stats: FrameStats) => void): void;
  
  // Resource access
  getRenderTargets(): RenderTargetInfo[];
  getTextures(): TextureInfo[];
  getPrograms?(): ProgramInfo[];     // WebGL
  getPipelines?(): PipelineInfo[];   // WebGPU
  
  // Timing
  getGpuTimings?(): Promise<GpuTimingInfo>;
  
  // Cleanup
  dispose(): void;
}
```

### WebGL Adapter

```typescript
function createWebGLAdapter(renderer: THREE.WebGLRenderer): RendererAdapter {
  return {
    kind: 'webgl',
    
    observeFrame(callback) {
      // Hook into render loop
      // Read renderer.info for stats
    },
    
    getRenderTargets() {
      // Enumerate WebGLRenderTargets
    },
    
    getPrograms() {
      // Access WebGLProgram cache
    },
    
    getGpuTimings() {
      // Use EXT_disjoint_timer_query if available
    }
  };
}
```

### WebGPU Adapter

```typescript
function createWebGPUAdapter(renderer: THREE.WebGPURenderer): RendererAdapter {
  return {
    kind: 'webgpu',
    
    observeFrame(callback) {
      // Hook into render loop
    },
    
    getPipelines() {
      // Access GPURenderPipeline cache
    },
    
    getGpuTimings() {
      // Use GPUQuerySet with type: 'timestamp'
    }
  };
}
```

---

## Framework Bridges

Optional packages that connect framework components to three.js objects.

### React Bridge (`@3lens/react-bridge`)

```typescript
import { useDevtoolEntity } from '@3lens/react-bridge';

function Enemy({ id, mesh }) {
  useDevtoolEntity({
    logicalId: `Enemy:${id}`,
    label: `Enemy #${id}`,
    objects: [mesh],
  });
  
  return <primitive object={mesh} />;
}
```

### Angular Bridge (`@3lens/angular-bridge`)

```typescript
@Directive({ selector: '[threelensEntity]' })
export class ThreeLensEntityDirective {
  @Input() threelensEntity!: string;
  @Input() threelensObjects!: THREE.Object3D[];
  
  constructor(private probe: DevtoolProbe) {}
  
  ngOnInit() {
    this.probe.registerLogicalEntity({
      id: this.threelensEntity,
      objects: this.threelensObjects,
    });
  }
}
```

### Nx/Module Support

For monorepo architectures, each library can define its `moduleId`:

```typescript
// libs/viewer/src/devtool.module-id.ts
export const MODULE_ID = 'libs/viewer';

// In components
probe.registerLogicalEntity({
  id: 'ViewerMesh:123',
  moduleId: MODULE_ID,
  objects: [mesh],
});
```

---

## Plugin System

Extensible architecture for custom panels and behaviors.

```typescript
interface DevtoolPlugin {
  id: string;
  title: string;
  activate(ctx: DevtoolContext): void;
  deactivate?(): void;
}

interface DevtoolContext {
  // Message handling
  onMessage(type: string, handler: MessageHandler): Unsubscribe;
  
  // Commands to probe
  sendCommand(command: DevtoolCommand): void;
  
  // UI registration
  registerPanel(panel: PanelConfig): PanelHandle;
  
  // Access to core state
  getSelectedObject(): ObjectState | null;
  getFrameStats(): FrameStats[];
}
```

**Example Plugin: LOD Checker**

```typescript
const lodCheckerPlugin: DevtoolPlugin = {
  id: 'lod-checker',
  title: 'LOD Checker',
  
  activate(ctx) {
    ctx.registerPanel({
      id: 'lod-panel',
      title: 'LOD Issues',
      render: () => <LODPanel context={ctx} />,
    });
    
    ctx.onMessage('frame-stats', (stats) => {
      // Analyze objects for LOD issues
    });
  },
};
```

---

## Directory Structure

```
packages/
├── core/                    # @3lens/core - Probe SDK
│   ├── src/
│   │   ├── probe/          # DevtoolProbe class
│   │   ├── adapters/       # Renderer adapters
│   │   ├── observers/      # Scene, resource observers
│   │   ├── transport/      # Message transport layer
│   │   └── types/          # TypeScript definitions
│   └── package.json
│
├── overlay/                 # @3lens/overlay - In-app UI
│   ├── src/
│   │   ├── components/     # UI panels
│   │   ├── stores/         # State management
│   │   └── mount.ts        # Entry point
│   └── package.json
│
├── extension/              # Browser extension
│   ├── src/
│   │   ├── devtools/      # DevTools panel
│   │   ├── content/       # Content script
│   │   └── background/    # Service worker
│   └── manifest.json
│
├── standalone/             # Standalone app
│   ├── src/
│   │   ├── main/          # Electron main process
│   │   └── renderer/      # UI (shared with overlay)
│   └── package.json
│
├── react-bridge/           # @3lens/react-bridge
├── angular-bridge/         # @3lens/angular-bridge
├── vue-bridge/             # @3lens/vue-bridge
│
└── shared/                 # Shared utilities and types
    ├── protocol/          # Debug protocol definitions
    └── ui-components/     # Shared UI components
```

---

## Next Steps

See [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md) for the phased implementation roadmap.

