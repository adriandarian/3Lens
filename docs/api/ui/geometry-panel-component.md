# Geometry Panel Component

The Geometry Panel component (`geometry.ts`) is a reusable UI renderer for displaying and visualizing Three.js geometries. It provides detailed attribute inspection, memory analysis, and visualization toggles.

## Overview

```typescript
import { 
  renderGeometryPanel, 
  attachGeometryEvents 
} from '@3lens/ui';
```

The component renders:
- **Summary stats** - Vertices, triangles, memory, indexed/morphed counts
- **Searchable list** - Filter by geometry name or mesh usage
- **Detail inspector** - Attributes, bounds, groups, morph targets
- **Visualization controls** - Bounding box, wireframe, normals display

## API

### `renderGeometryPanel()`

Renders the geometry panel HTML content.

```typescript
function renderGeometryPanel(
  context: PanelContext,
  state: UIState
): string
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `context` | `PanelContext` | Panel context with probe, snapshot, and commands |
| `state` | `UIState` | Current UI state including selection and visualization |

#### Returns

HTML string containing the complete panel markup.

#### Example

```typescript
import { renderGeometryPanel, createDefaultUIState } from '@3lens/ui';

const html = renderGeometryPanel(
  {
    probe: devtoolProbe,
    snapshot: currentSnapshot,
    stats: frameStats,
    benchmark: null,
    sendCommand: (cmd) => probe.send(cmd),
    requestSnapshot: () => probe.requestSnapshot()
  },
  createDefaultUIState()
);

container.innerHTML = html;
```

### `attachGeometryEvents()`

Attaches interactive event handlers to the rendered panel.

```typescript
function attachGeometryEvents(
  container: HTMLElement,
  context: PanelContext,
  state: UIState,
  updateState: (updates: Partial<UIState>) => void,
  rerender: () => void
): void
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` | `HTMLElement` | DOM element containing the rendered panel |
| `context` | `PanelContext` | Panel context for sending commands |
| `state` | `UIState` | Current UI state |
| `updateState` | `Function` | Callback to update state |
| `rerender` | `Function` | Callback to trigger re-render |

#### Example

```typescript
import { renderGeometryPanel, attachGeometryEvents } from '@3lens/ui';

function render() {
  container.innerHTML = renderGeometryPanel(context, state);
  attachGeometryEvents(container, context, state, updateState, render);
}

render();
```

## Panel Layout

### Split View Structure

```
┌───────────────────────────────────────────────────────┐
│ Geometry Summary                                       │
│ ┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────┐ ┌──┐│
│ │  42  │ │ 125.6K │ │  41.8K │ │ 4.2 MB │ │ 38 │ │ 2││
│ │Geoms │ │Vertices│ │Triangs │ │ Memory │ │Idx │ │Mf││
│ └──────┘ └────────┘ └────────┘ └────────┘ └────┘ └──┘│
├──────────────────────┬────────────────────────────────┤
│ Geometry List        │ Geometry Inspector             │
│                      │                                │
│ ◆ BoxGeometry        │ ◆ Selected Geometry            │
│   [2.4K v] [800 △]   │   BufferGeometry               │
│   [32 KB] [3×]       │                                │
│   Player, Enemy      │ Used By (3)                    │
│                      │ ├─ Player                      │
│ ◆ SphereGeometry     │ ├─ Enemy                       │
│   [4.8K v] [1.6K △]  │ └─ Prop                        │
│   [64 KB] [1×]       │                                │
│   Planet             │ Overview                       │
│                      │ Vertices: 2,400                │
│ ◆ BufferGeometry     │ Triangles: 800                 │
│   [12K v] [4K △]     │ Indices: 2,400                 │
│   [156 KB] [2×]      │ Memory: 32.0 KB                │
│   Terrain            │                                │
│                      │ Attributes (4)                 │
│                      │ ┌──────────────────────────┐   │
│                      │ │Name │Size  │Type │Memory│   │
│                      │ ├─────┼──────┼─────┼──────│   │
│                      │ │pos  │2.4K×3│F32  │28.8KB│   │
│                      │ │norm │2.4K×3│F32  │28.8KB│   │
│                      │ │uv   │2.4K×2│F32  │19.2KB│   │
│                      │ └──────────────────────────┘   │
│                      │                                │
│                      │ [📦 Bounds] [🔲 Wire] [↗️ Norm] │
└──────────────────────┴────────────────────────────────┘
```

### Summary Stats

Displays aggregated geometry information:

| Stat | Description |
|------|-------------|
| Geometries | Total unique geometry count |
| Vertices | Combined vertex count |
| Triangles | Combined triangle/face count |
| GPU Memory | Estimated memory usage |
| Indexed | Geometries using index buffers |
| Morphed | Geometries with morph targets |

### List Item Display

Each geometry item shows:

- **Icon** - Geometry type indicator (◆, ●, ◇)
- **Name** - Geometry name or type fallback
- **Vertex count** - Number of vertices
- **Triangle count** - Number of triangles/faces
- **Memory** - Estimated GPU memory
- **Usage count** - Number of mesh instances
- **Mesh names** - Objects using this geometry

### Inspector Sections

#### Overview Section

| Property | Description |
|----------|-------------|
| Vertices | Total vertex count |
| Triangles | Face/triangle count |
| Indices | Index count (or "Non-indexed") |
| Memory | Estimated GPU memory |
| Used by | Mesh instance count |
| Draw Range | Start index and count |

#### Attributes Section

Table of buffer attributes:

| Column | Description |
|--------|-------------|
| Name | Attribute name (position, normal, uv, etc.) |
| Size | Count × itemSize |
| Type | Array type (F32, U16, etc.) with normalized flag |
| Memory | Attribute memory footprint |

Badges indicate special attributes:
- `instanced` - InstancedBufferAttribute

#### Bounding Box Section

```
Bounding Box
Min: (-1.00, 0.00, -1.00)
Max: (1.00, 2.00, 1.00)
Dimensions: 2.00 × 2.00 × 2.00
```

#### Bounding Sphere Section

```
Bounding Sphere
Center: (0.00, 1.00, 0.00)
Radius: 1.732
```

#### Groups Section

For multi-material geometries:

```
Groups (3)
#0: 0 → 1200, Mat[0]
#1: 1200 → 2400, Mat[1]
#2: 2400 → 3600, Mat[2]
```

#### Morph Targets Section

Lists morph target attributes:

```
Morph Targets
├─ position ×12
└─ normal ×12
```

## Visualization Controls

Action buttons at the bottom of the inspector:

| Button | Action | Description |
|--------|--------|-------------|
| 📦 Bounds | `toggle-bbox` | Show/hide bounding box helper |
| 🔲 Wireframe | `toggle-wireframe` | Show/hide wireframe overlay |
| ↗️ Normals | `toggle-normals` | Show/hide vertex normals |

## State Integration

### UIState Properties

```typescript
interface UIState {
  // Geometry-specific state
  selectedGeometryId: string | null;
  geometrySearch: string;
  
  // Visualization toggles
  geometryVisualization: {
    wireframe: Set<string>;    // UUIDs with wireframe enabled
    boundingBox: Set<string>;  // UUIDs with bbox enabled
    normals: Set<string>;      // UUIDs with normals enabled
  };
}
```

### Search Filtering

Geometries can be filtered by:
- Geometry name
- Geometry type
- Mesh names using the geometry

```typescript
// Filter matches "box" or "sphere"
state.geometrySearch = 'box';
```

## Commands

The panel sends commands through `PanelContext.sendCommand`:

### Geometry Visualization

```typescript
{
  type: 'geometry-visualization',
  geometryUuid: 'uuid-here',
  visualization: 'boundingBox' | 'wireframe' | 'normals',
  enabled: true
}
```

## Data Types

### GeometryData

```typescript
interface GeometryData {
  uuid: string;
  name: string;
  type: string;
  
  // Counts
  vertexCount: number;
  faceCount: number;
  indexCount: number;
  isIndexed: boolean;
  
  // Memory
  memoryBytes: number;
  
  // Draw range
  drawRange: {
    start: number;
    count: number;
  };
  
  // Attributes
  attributes: Array<{
    name: string;
    itemSize: number;
    count: number;
    arrayType: string;
    normalized: boolean;
    memoryBytes: number;
    isInstancedAttribute: boolean;
  }>;
  
  // Bounds
  boundingBox?: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
  boundingSphere?: {
    center: { x: number; y: number; z: number };
    radius: number;
  };
  
  // Groups (multi-material)
  groups: Array<{
    start: number;
    count: number;
    materialIndex: number;
  }>;
  
  // Morph targets
  morphAttributes?: Array<{
    name: string;
    count: number;
  }>;
  
  // Usage
  usedByMeshes: string[];
  usageCount: number;
}
```

## Styling

The component uses CSS classes with the `three-lens-` prefix:

```css
/* Geometry list item */
.geometry-item { }
.geometry-item.selected { }
.geometry-item-icon { }
.geometry-item-info { }
.geometry-item-stats { }
.geo-stat-pill { }
.geo-stat-pill.vertices { }
.geo-stat-pill.triangles { }
.geo-stat-pill.memory { }

/* Inspector */
.geometry-header { }
.geometry-inspector-panel { }

/* Attributes table */
.attributes-table { }
.attr-name { }
.attr-count { }
.attr-type { }
.attr-size { }

/* Bounds display */
.bounding-box-viz { }
.coord-row { }
.coord-label { }
.coord-values { }
.box-dimensions { }

/* Groups */
.groups-list { }
.group-item { }
.group-index { }
.group-range { }
.group-material { }

/* Morph targets */
.morph-list { }
.morph-item { }
.morph-name { }
.morph-count { }

/* Action buttons */
.inspector-actions { }
.action-btn { }
.action-btn.active { }
```

## Integration Example

```typescript
import {
  renderGeometryPanel,
  attachGeometryEvents,
  createDefaultUIState,
  PanelContext,
  UIState
} from '@3lens/ui';

class GeometryView {
  private container: HTMLElement;
  private context: PanelContext;
  private state: UIState;
  
  constructor(container: HTMLElement, probe: DevtoolProbe) {
    this.container = container;
    this.state = createDefaultUIState();
    
    this.context = {
      probe,
      snapshot: null,
      stats: null,
      benchmark: null,
      sendCommand: (cmd) => this.handleCommand(cmd),
      requestSnapshot: () => probe.requestSnapshot()
    };
    
    probe.on('snapshot', (snapshot) => {
      this.context.snapshot = snapshot;
      this.render();
    });
  }
  
  private render() {
    this.container.innerHTML = renderGeometryPanel(
      this.context,
      this.state
    );
    
    attachGeometryEvents(
      this.container,
      this.context,
      this.state,
      (updates) => {
        this.state = { ...this.state, ...updates };
      },
      () => this.render()
    );
  }
  
  private handleCommand(cmd: PanelCommand) {
    if (cmd.type === 'geometry-visualization') {
      // Toggle visualization helper
      this.context.probe.toggleGeometryVisualization(
        cmd.geometryUuid,
        cmd.visualization,
        cmd.enabled
      );
    }
  }
}
```

## Utility Functions

### `getGeometryIcon()`

Returns an icon based on geometry type:

```typescript
import { getGeometryIcon } from '@3lens/ui';

getGeometryIcon('BoxGeometry');      // '◆'
getGeometryIcon('SphereGeometry');   // '●'
getGeometryIcon('BufferGeometry');   // '◇'
```

### `formatNumber()`

Formats large numbers with K/M suffixes:

```typescript
import { formatNumber } from '@3lens/ui';

formatNumber(1234);      // '1,234'
formatNumber(125600);    // '125.6K'
formatNumber(1234567);   // '1.23M'
```

### `formatBytes()`

Formats byte sizes:

```typescript
import { formatBytes } from '@3lens/ui';

formatBytes(1024);       // '1.0 KB'
formatBytes(1048576);    // '1.0 MB'
formatBytes(32768);      // '32.0 KB'
```

## See Also

- [Materials Panel Component](./materials-panel-component.md)
- [Textures Panel Component](./textures-panel-component.md)
- [Geometries Panel (Overlay)](../overlay/geometries-panel.md) - Overlay integration
- [GeometryData Interface](/api/core/geometry-info.md)
