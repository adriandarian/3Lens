# Render Targets Panel Component

The Render Targets Panel component (`renderTargets.ts`) is a reusable UI renderer for displaying and inspecting WebGL render targets (framebuffer objects). It provides live previews, memory analysis, and detailed configuration inspection.

## Overview

```typescript
import { 
  renderRenderTargetsPanel, 
  attachRenderTargetsEvents 
} from '@3lens/ui';
```

The component renders:
- **Summary stats** - Total count, memory, shadows, post-fx, MSAA
- **Thumbnail grid** - Visual preview gallery with usage badges
- **Detail inspector** - Format, attachments, depth buffer info
- **Preview modes** - Color, depth, individual channels, heatmap

## API

### `renderRenderTargetsPanel()`

Renders the render targets panel HTML content.

```typescript
function renderRenderTargetsPanel(
  context: PanelContext,
  state: UIState
): string
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `context` | `PanelContext` | Panel context with probe, snapshot, and commands |
| `state` | `UIState` | Current UI state including selection and preview mode |

#### Returns

HTML string containing the complete panel markup.

#### Example

```typescript
import { renderRenderTargetsPanel, createDefaultUIState } from '@3lens/ui';

const html = renderRenderTargetsPanel(
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

### `attachRenderTargetsEvents()`

Attaches interactive event handlers to the rendered panel.

```typescript
function attachRenderTargetsEvents(
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

## Panel Layout

### Split View Structure

```
┌───────────────────────────────────────────────────────┐
│ Render Targets Summary                                 │
│ ┌──────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │  12  │ │ 64 MB  │ │  4   │ │  3   │ │  2   │      │
│ │Total │ │ Memory │ │Shadow│ │PostFX│ │ MSAA │      │
│ └──────┘ └────────┘ └──────┘ └──────┘ └──────┘      │
├──────────────────────┬────────────────────────────────┤
│ Render Targets Grid  │ Render Target Inspector        │
│                      │                                │
│ ┌─────────┐ ┌─────┐ │ ┌───────────────────────────┐ │
│ │ ░░░░░░░ │ │░░░░░│ │ │                           │ │
│ │ Shadow  │ │Bloom│ │ │    [Large Preview]        │ │
│ │ 2048×   │ │1920×│ │ │                           │ │
│ │ 16 MB   │ │8 MB │ │ └───────────────────────────┘ │
│ └─────────┘ └─────┘ │                                │
│  D  4x        MRT×2 │ [Color][Depth][R][G][B][A][🔥] │
│                      │                                │
│ ┌─────────┐ ┌─────┐ │ Overview                       │
│ │ ▓▓▓▓▓▓▓ │ │▓▓▓▓▓│ │ Dimensions: 2048 × 2048       │
│ │ Reflect │ │ AO  │ │ Usage: Shadow Map              │
│ │ 1024×   │ │960× │ │ Format: RGBA                   │
│ │ 4 MB    │ │2 MB │ │ Data Type: UnsignedByte        │
│ └─────────┘ └─────┘ │ Memory: 16.0 MB                │
│                      │                                │
│                      │ Depth Buffer                   │
│                      │ Has Depth: Yes                 │
│                      │ Format: Depth24Stencil8        │
│                      │                                │
│                      │ Multisampling                  │
│                      │ Samples: 4                     │
│                      │                                │
│                      │ Color Attachments (1)          │
│                      │ └─ attachment0: RGBA8          │
└──────────────────────┴────────────────────────────────┘
```

### Summary Stats

Displays aggregated render target information:

| Stat | Description |
|------|-------------|
| Total | Number of render targets |
| GPU Memory | Combined memory usage |
| Shadows | Shadow map render targets |
| Post FX | Post-processing targets |
| MSAA | Multisampled targets |

### Grid Item Display

Each render target item shows:

- **Thumbnail** - Live color buffer preview
- **Name** - Target name or type fallback
- **Dimensions** - Width × Height
- **Memory** - Estimated GPU memory
- **Usage badge** - Shadow, PostProcess, Reflection, etc.
- **Indicators**:
  - `D` - Has depth texture
  - `4x` - MSAA sample count
  - `MRT×N` - Multiple render targets

### Usage Types

| Usage | Description | Icon |
|-------|-------------|------|
| `shadow-map` | Shadow mapping | 🌑 |
| `post-process` | Post-processing | ✨ |
| `reflection` | Reflection probe | 🪞 |
| `refraction` | Refraction rendering | 💎 |
| `environment` | Environment capture | 🌍 |
| `picker` | GPU picking buffer | 🎯 |
| `custom` | User-defined | 🔧 |

### Inspector Sections

#### Preview Section

Large render target preview with multiple view modes:

```
[Color] [Depth] [R] [G] [B] [A] [🔥 Heat]
```

| Mode | Description |
|------|-------------|
| Color | Full RGB color preview |
| Depth | Depth buffer visualization |
| R/G/B/A | Individual channel isolation |
| Heat | Value heatmap for analysis |

#### Overview Section

| Property | Description |
|----------|-------------|
| Dimensions | Width × Height in pixels |
| Usage | Shadow Map, Post Process, etc. |
| Format | Texture format (RGBA, RGB, etc.) |
| Data Type | Float, HalfFloat, UnsignedByte |
| Memory | Estimated GPU memory |

#### Depth Buffer Section

| Property | Description |
|----------|-------------|
| Has Depth | Depth buffer attached |
| Has Depth Texture | Readable depth texture |
| Depth Format | Depth24Stencil8, Depth32F, etc. |
| Has Stencil | Stencil buffer attached |

#### Multisampling Section

| Property | Description |
|----------|-------------|
| Samples | MSAA sample count (0, 2, 4, 8) |
| Resolved | Whether MSAA is resolved |

#### Color Attachments Section

For MRT (Multiple Render Targets):

```
Color Attachments (3)
├─ attachment0: RGBA8
├─ attachment1: RGBA16F
└─ attachment2: RG32F
```

#### Filtering Section

| Property | Description |
|----------|-------------|
| Mag Filter | Magnification filter |
| Min Filter | Minification filter |
| Generate Mipmaps | Auto-generate mipmaps |

#### Associated Objects Section

Lists objects using this render target:

```
Associated Objects (2)
├─ DirectionalLight (shadow map)
└─ EffectComposer (post-process)
```

## State Integration

### UIState Properties

```typescript
interface UIState {
  // Render target-specific state
  selectedRenderTargetId: string | null;
  renderTargetsSearch: string;
  
  // Preview controls
  renderTargetPreviewMode: 'color' | 'depth' | 'r' | 'g' | 'b' | 'a' | 'heatmap';
  renderTargetZoom: number;
}
```

### Preview Modes

```typescript
// View depth buffer
state.renderTargetPreviewMode = 'depth';

// View as heatmap
state.renderTargetPreviewMode = 'heatmap';

// Zoom preview
state.renderTargetZoom = 2.0; // 200%
```

## Data Types

### RenderTargetData

```typescript
interface RenderTargetData {
  uuid: string;
  name: string;
  type: string;
  
  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };
  
  // Usage classification
  usage: 'shadow-map' | 'post-process' | 'reflection' | 
         'refraction' | 'environment' | 'picker' | 'custom';
  
  // Format info
  textureFormatName: string;
  textureDataTypeName: string;
  
  // Memory
  memoryBytes: number;
  
  // Thumbnail (base64 data URL)
  thumbnail?: string;
  depthThumbnail?: string;
  
  // Depth buffer
  hasDepthBuffer: boolean;
  hasDepthTexture: boolean;
  depthFormat?: string;
  hasStencilBuffer: boolean;
  
  // Multisampling
  samples: number;
  
  // MRT (Multiple Render Targets)
  colorAttachmentCount: number;
  colorAttachments?: Array<{
    index: number;
    format: string;
    dataType: string;
  }>;
  
  // Filtering
  magFilter: number;
  minFilter: number;
  generateMipmaps: boolean;
  
  // Associated objects
  associatedObjects?: Array<{
    debugId: string;
    name: string;
    role: string;
  }>;
}
```

## Styling

The component uses CSS classes with the `three-lens-` prefix:

```css
/* Grid layout */
.render-targets-grid { }
.rt-grid-item { }
.rt-grid-item.selected { }

/* Thumbnail */
.rt-grid-thumbnail { }
.rt-thumb-img { }
.rt-thumb-placeholder { }
.rt-depth-indicator { }
.rt-msaa-indicator { }

/* Info display */
.rt-grid-info { }
.rt-grid-name { }
.rt-grid-meta { }
.rt-dimensions { }
.rt-usage-badge { }
.rt-usage-badge.shadow { }
.rt-usage-badge.postprocess { }
.rt-usage-badge.reflection { }
.rt-grid-stats { }
.rt-memory { }
.rt-mrt-badge { }

/* Inspector */
.rt-header { }
.rt-header-thumb { }
.rt-header-img { }
.rt-inspector-panel { }

/* Preview section */
.rt-preview-section { }
.rt-preview-container { }
.rt-preview-img { }
.rt-preview-mode-toggles { }
.preview-mode-btn { }
.preview-mode-btn.active { }

/* Depth preview */
.rt-depth-preview { }
.depth-viz-gradient { }

/* Heatmap */
.rt-heatmap { }
.heatmap-legend { }
```

### Usage Badge Colors

```css
.rt-usage-badge.shadow {
  background: var(--3lens-accent-violet);
}

.rt-usage-badge.postprocess {
  background: var(--3lens-accent-cyan);
}

.rt-usage-badge.reflection {
  background: var(--3lens-accent-blue);
}

.rt-usage-badge.refraction {
  background: var(--3lens-accent-emerald);
}

.rt-usage-badge.environment {
  background: var(--3lens-accent-amber);
}
```

## Integration Example

```typescript
import {
  renderRenderTargetsPanel,
  attachRenderTargetsEvents,
  createDefaultUIState,
  PanelContext,
  UIState
} from '@3lens/ui';

class RenderTargetsView {
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
    this.container.innerHTML = renderRenderTargetsPanel(
      this.context,
      this.state
    );
    
    attachRenderTargetsEvents(
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
    // Handle render target-specific commands
  }
}
```

## Utility Functions

### `getUsageDisplayName()`

Returns a human-readable usage name:

```typescript
getUsageDisplayName('shadow-map');   // 'Shadow Map'
getUsageDisplayName('post-process'); // 'Post Process'
getUsageDisplayName('reflection');   // 'Reflection'
```

### `getRenderTargetIcon()`

Returns an icon based on render target usage:

```typescript
getRenderTargetIcon(rtData);  // '🌑', '✨', '🪞', etc.
```

### `getUsageBadgeClass()`

Returns CSS class for usage badge:

```typescript
getUsageBadgeClass('shadow-map');   // 'shadow'
getUsageBadgeClass('post-process'); // 'postprocess'
```

## Depth Visualization

The component provides depth buffer visualization with configurable range:

```typescript
// Depth buffer preview options
interface DepthPreviewOptions {
  near: number;      // Near plane for normalization
  far: number;       // Far plane for normalization  
  logarithmic: boolean; // Use log scale for depth
}
```

Depth is visualized as grayscale where:
- **White** = Near plane
- **Black** = Far plane

## Heatmap Mode

Heatmap visualization helps identify:
- High-memory render targets
- Overdraw areas
- Shadow map coverage

Color scale:
- **Blue** = Low values
- **Green** = Medium values
- **Yellow** = High values
- **Red** = Maximum values

## See Also

- [Textures Panel Component](./textures-panel-component.md)
- [Materials Panel Component](./materials-panel-component.md)
- [Render Targets Panel (Overlay)](../overlay/render-targets-panel.md) - Overlay integration
- [RenderTargetData Interface](/api/core/render-target-info.md)
