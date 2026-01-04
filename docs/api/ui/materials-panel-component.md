# Materials Panel Component

The Materials Panel component (`materials.ts`) is a reusable UI renderer for displaying and editing Three.js materials. It provides a split-view interface with a searchable list and detailed inspector.

## Overview

```typescript
import { 
  renderMaterialsPanel, 
  attachMaterialsEvents 
} from '@3lens/ui';
```

The component renders:
- **Summary stats** - Total count, shader materials, transparent materials
- **Searchable list** - Filter by material name or mesh usage
- **Detail inspector** - Properties, textures, shader uniforms
- **Live editing** - Real-time property modification

## API

### `renderMaterialsPanel()`

Renders the materials panel HTML content.

```typescript
function renderMaterialsPanel(
  context: PanelContext,
  state: UIState
): string
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `context` | `PanelContext` | Panel context with probe, snapshot, and commands |
| `state` | `UIState` | Current UI state including selection and search |

#### Returns

HTML string containing the complete panel markup.

#### Example

```typescript
import { renderMaterialsPanel, createDefaultUIState } from '@3lens/ui';

const html = renderMaterialsPanel(
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

### `attachMaterialsEvents()`

Attaches interactive event handlers to the rendered panel.

```typescript
function attachMaterialsEvents(
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
import { renderMaterialsPanel, attachMaterialsEvents } from '@3lens/ui';

function render() {
  container.innerHTML = renderMaterialsPanel(context, state);
  attachMaterialsEvents(container, context, state, updateState, render);
}

render();
```

## Panel Layout

### Split View Structure

```
┌────────────────────────────────────────────────┐
│ Materials Summary                               │
│ ┌──────┐ ┌──────┐ ┌──────┐                    │
│ │ 24   │ │  3   │ │  8   │                    │
│ │Total │ │Shader│ │Trans │                    │
│ └──────┘ └──────┘ └──────┘                    │
├────────────────────┬───────────────────────────┤
│ Materials List     │ Material Inspector        │
│                    │                           │
│ ■ MeshStandard...  │ ■ Selected Material       │
│   Player Model     │   MeshStandardMaterial    │
│                    │                           │
│ ■ MeshBasic...     │ Used By (3)               │
│   Ground, Wall     │ ├─ Player                 │
│                    │ ├─ Enemy                  │
│ ■ ShaderMaterial   │ └─ Weapon                 │
│   Custom Effect    │                           │
│                    │ Properties                │
│                    │ Color: [#3366ff]          │
│                    │ Opacity: [====●===] 0.80  │
│                    │ Transparent: [✓]          │
│                    │                           │
│                    │ PBR Properties            │
│                    │ Roughness: [==●=====]     │
│                    │ Metalness: [========●]    │
│                    │                           │
│                    │ Textures (2)              │
│                    │ ├─ map: tex_diffuse       │
│                    │ └─ normalMap: tex_normal  │
└────────────────────┴───────────────────────────┘
```

### Summary Stats

Displays aggregated material information:

| Stat | Description |
|------|-------------|
| Total | Number of unique materials |
| Shaders | Count of `ShaderMaterial` / `RawShaderMaterial` |
| Transparent | Materials with `transparent: true` |

### List Item Display

Each material item shows:

- **Color swatch** - Visual preview of material color
- **Name** - Material name or type fallback
- **Type icon** - Material type indicator
- **Mesh names** - Objects using this material
- **Badges** - GLSL, transparent, texture count
- **Usage count** - Number of mesh instances

### Inspector Sections

#### Properties Section

Editable core material properties:

| Property | Control | Description |
|----------|---------|-------------|
| Color | Color picker | Material base color |
| Emissive | Color picker | Emission color |
| Opacity | Range slider | Transparency level (0-1) |
| Transparent | Toggle | Enable transparency |
| Visible | Toggle | Material visibility |
| Side | Dropdown | FrontSide, BackSide, DoubleSide |
| Wireframe | Toggle | Wireframe rendering |
| Depth Test | Toggle | Depth buffer testing |
| Depth Write | Toggle | Depth buffer writing |

#### PBR Properties Section

For `MeshStandardMaterial` and `MeshPhysicalMaterial`:

| Property | Range | Description |
|----------|-------|-------------|
| Roughness | 0-1 | Surface roughness |
| Metalness | 0-1 | Metallic appearance |
| Reflectivity | 0-1 | Reflection intensity |
| Clearcoat | 0-1 | Clear coat layer |
| Transmission | 0-1 | Glass-like transmission |
| IOR | 1-2.5 | Index of refraction |

#### Textures Section

Lists all textures assigned to the material:

```
Textures (3)
├─ map: diffuse_8a3f2b1c
├─ normalMap: normal_9c4e3d2f
└─ roughnessMap: rough_7b2a1c4e
```

#### Shader Section

For `ShaderMaterial` and `RawShaderMaterial`:

- **Uniforms list** - Name, type, and value
- **Defines** - Preprocessor definitions
- **Vertex shader** - Syntax-highlighted GLSL preview
- **Fragment shader** - Syntax-highlighted GLSL preview

## State Integration

### UIState Properties

```typescript
interface UIState {
  // Material-specific state
  selectedMaterialId: string | null;
  materialsSearch: string;
}
```

### Search Filtering

Materials can be filtered by:
- Material name
- Material type
- Mesh names using the material

```typescript
// Filter matches "standard" in name or mesh names
state.materialsSearch = 'standard';
```

## Commands

The panel sends commands through `PanelContext.sendCommand`:

### Select Material

```typescript
// Handled internally by list item clicks
{ type: 'select-material', uuid: 'material-uuid' }
```

### Update Property

```typescript
// Sent when editing material properties
{
  type: 'update-material-property',
  materialUuid: 'uuid-here',
  property: 'roughness',
  value: 0.5
}
```

## Data Types

### MaterialData

```typescript
interface MaterialData {
  uuid: string;
  name: string;
  type: string;
  
  // Appearance
  color?: number;
  emissive?: number;
  opacity: number;
  transparent: boolean;
  visible: boolean;
  wireframe: boolean;
  side: 0 | 1 | 2;
  
  // Rendering
  depthTest: boolean;
  depthWrite: boolean;
  
  // Flags
  isShaderMaterial: boolean;
  
  // PBR (optional)
  pbr?: {
    roughness: number;
    metalness: number;
    reflectivity?: number;
    clearcoat?: number;
    transmission?: number;
    ior?: number;
  };
  
  // Textures
  textures: Array<{
    slot: string;
    uuid: string;
    name?: string;
  }>;
  
  // Shader (for ShaderMaterial)
  shader?: {
    uniforms: Array<{ type: string; name: string; value: unknown }>;
    defines: Record<string, string | number | boolean>;
    vertexShader?: string;
    fragmentShader?: string;
  };
  
  // Usage
  usedByMeshes: string[];
  usageCount: number;
}
```

## Styling

The component uses CSS classes with the `three-lens-` prefix and integrates with the theme system:

```css
/* Material list item */
.material-item { }
.material-item.selected { }
.material-item-color { }
.material-item-info { }
.material-item-badges { }

/* Inspector */
.material-header { }
.material-inspector-panel { }

/* Property controls */
.prop-color-input { }
.prop-range-input { }
.prop-checkbox-input { }
.prop-select-input { }

/* Shader section */
.shader-section { }
.uniforms-list { }
.uniform-item { }
```

## Integration Example

```typescript
import {
  renderMaterialsPanel,
  attachMaterialsEvents,
  createDefaultUIState,
  PanelContext,
  UIState
} from '@3lens/ui';

class MaterialsView {
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
    
    // Listen for snapshot updates
    probe.on('snapshot', (snapshot) => {
      this.context.snapshot = snapshot;
      this.render();
    });
  }
  
  private render() {
    this.container.innerHTML = renderMaterialsPanel(
      this.context,
      this.state
    );
    
    attachMaterialsEvents(
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
    if (cmd.type === 'update-material-property') {
      // Send property update to probe
      this.context.probe.setMaterialProperty(
        cmd.materialUuid,
        cmd.property,
        cmd.value
      );
    }
  }
}
```

## See Also

- [Geometry Panel Component](./geometry-panel-component.md)
- [Textures Panel Component](./textures-panel-component.md)
- [Materials Panel (Overlay)](../overlay/materials-panel.md) - Overlay integration
- [MaterialData Interface](/api/core/material-info.md)
