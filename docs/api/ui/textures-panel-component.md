# Textures Panel Component

The Textures Panel component (`textures.ts`) is a reusable UI renderer for displaying and inspecting Three.js textures. It provides thumbnail previews, memory analysis, and detailed texture property inspection.

## Overview

```typescript
import { 
  renderTexturesPanel, 
  attachTexturesEvents 
} from '@3lens/ui';
```

The component renders:
- **Summary stats** - Total count, memory usage, cube maps, compressed
- **Thumbnail gallery** - Visual preview grid with badges
- **Detail inspector** - Format, filtering, wrapping, source info
- **Channel preview** - RGB/R/G/B/A channel isolation

## API

### `renderTexturesPanel()`

Renders the textures panel HTML content.

```typescript
function renderTexturesPanel(
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
import { renderTexturesPanel, createDefaultUIState } from '@3lens/ui';

const html = renderTexturesPanel(
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

### `attachTexturesEvents()`

Attaches interactive event handlers to the rendered panel.

```typescript
function attachTexturesEvents(
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
│ Textures Summary                                       │
│ ┌──────┐ ┌────────┐ ┌──────┐ ┌──────────┐            │
│ │  24  │ │ 48 MB  │ │  2   │ │    8     │            │
│ │Total │ │ Memory │ │Cubes │ │Compressed│            │
│ └──────┘ └────────┘ └──────┘ └──────────┘            │
├──────────────────────┬────────────────────────────────┤
│ Textures List        │ Texture Inspector              │
│                      │                                │
│ ┌─────┐ diffuse.png  │ ┌───────────────────────────┐ │
│ │░░░░░│ Texture      │ │                           │ │
│ │░░░░░│ 1024×1024    │ │    [Large Preview]        │ │
│ └─────┘ 4.0 MB  2×   │ │                           │ │
│                      │ └───────────────────────────┘ │
│ ┌─────┐ normal.png   │ [RGB] [R] [G] [B] [A]         │
│ │▓▓▓▓▓│ Texture      │                                │
│ │▓▓▓▓▓│ 1024×1024    │ Overview                       │
│ └─────┘ 4.0 MB  1×   │ Dimensions: 1024 × 1024        │
│                      │ Format: RGBA                   │
│ ┌─────┐ env.hdr      │ Data Type: UnsignedByte        │
│ │▒▒▒▒▒│ CubeTexture  │ Memory: 4.0 MB                 │
│ │▒▒▒▒▒│ 512×512 ×6   │ Color Space: sRGB              │
│ └─────┘ 6.0 MB  1×   │                                │
│   [Cube]             │ Source                         │
│                      │ Type: Image                    │
│                      │ URL: /textures/diffuse.png     │
│                      │                                │
│                      │ Mipmaps                        │
│                      │ Enabled: Yes                   │
│                      │ Auto Generate: Yes             │
│                      │                                │
│                      │ Filtering                      │
│                      │ Mag Filter: Linear             │
│                      │ Min Filter: LinearMipmap       │
│                      │ Anisotropy: 16                 │
└──────────────────────┴────────────────────────────────┘
```

### Summary Stats

Displays aggregated texture information:

| Stat | Description |
|------|-------------|
| Total | Number of unique textures |
| GPU Memory | Total estimated memory |
| Cube Maps | CubeTexture count |
| Compressed | Compressed texture count (DXT, etc.) |

### List Item Display

Each texture item shows:

- **Thumbnail** - Visual preview or placeholder icon
- **Name** - Texture name or type fallback
- **Type** - Texture class name
- **Dimensions** - Width × Height (×6 for cubes)
- **Memory** - Estimated GPU memory
- **Usage count** - Material references
- **Badges** - Cube, DXT, Video, RT, MIP indicators

### Badge Types

| Badge | Meaning |
|-------|---------|
| `Cube` | CubeTexture (environment map) |
| `DXT` | Compressed texture format |
| `Video` | VideoTexture source |
| `RT` | WebGLRenderTarget texture |
| `MIP` | Mipmaps enabled |

### Inspector Sections

#### Preview Section

Large texture preview with channel isolation:

```
[RGB] [R] [G] [B] [A]
```

Buttons toggle between:
- **RGB** - Full color preview
- **R** - Red channel only
- **G** - Green channel only
- **B** - Blue channel only
- **A** - Alpha channel only

#### Overview Section

| Property | Description |
|----------|-------------|
| Dimensions | Width × Height in pixels |
| Format | Texture format (RGBA, RGB, etc.) |
| Data Type | Array type (UnsignedByte, Float, etc.) |
| Memory | Estimated GPU memory footprint |
| Color Space | sRGB, Linear, etc. |

#### Source Section

| Property | Description |
|----------|-------------|
| Type | Image, Video, Canvas, Data, etc. |
| URL | Source URL (if applicable) |
| Size | Original image dimensions |

#### Mipmaps Section

| Property | Description |
|----------|-------------|
| Enabled | Whether mipmaps are active |
| Auto Generate | generateMipmaps flag |
| Levels | Number of mip levels |

#### Filtering Section

| Property | Description |
|----------|-------------|
| Mag Filter | Magnification filter |
| Min Filter | Minification filter |
| Anisotropy | Anisotropic filtering level |

#### Wrapping Section

| Property | Description |
|----------|-------------|
| Wrap S | Horizontal wrapping mode |
| Wrap T | Vertical wrapping mode |

#### Flags Section

Boolean texture properties:

| Flag | Description |
|------|-------------|
| Flip Y | flipY texture property |
| Premultiply Alpha | premultiplyAlpha property |
| Needs Update | needsUpdate flag state |

#### Usage Section

Lists materials using this texture:

```
Used By (3)
├─ PlayerMaterial (map)
├─ GroundMaterial (map)
└─ WallMaterial (normalMap)
```

## State Integration

### UIState Properties

```typescript
interface UIState {
  // Texture-specific state
  selectedTextureId: string | null;
  texturesSearch: string;
  
  // Preview controls
  texturePreviewChannel: 'rgb' | 'r' | 'g' | 'b' | 'a';
}
```

### Channel Preview

```typescript
// Switch to alpha channel view
state.texturePreviewChannel = 'a';
```

## Data Types

### TextureData

```typescript
interface TextureData {
  uuid: string;
  name: string;
  type: string;
  
  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };
  
  // Format info
  formatName: string;
  dataTypeName: string;
  colorSpace: string;
  
  // Memory
  memoryBytes: number;
  
  // Thumbnail (base64 data URL)
  thumbnail?: string;
  
  // Flags
  isCubeTexture: boolean;
  isCompressed: boolean;
  isVideoTexture: boolean;
  isRenderTarget: boolean;
  
  // Mipmaps
  mipmaps: {
    enabled: boolean;
    autoGenerate: boolean;
    levels?: number;
  };
  
  // Filtering
  magFilter: number;
  minFilter: number;
  anisotropy: number;
  
  // Wrapping
  wrapS: number;
  wrapT: number;
  
  // Transform
  repeat: { x: number; y: number };
  offset: { x: number; y: number };
  center: { x: number; y: number };
  rotation: number;
  
  // Flags
  flipY: boolean;
  premultiplyAlpha: boolean;
  needsUpdate: boolean;
  
  // Source info
  source: {
    type: 'image' | 'video' | 'canvas' | 'data' | 'unknown';
    url?: string;
    naturalWidth?: number;
    naturalHeight?: number;
  };
  
  // Usage
  usedByMaterials: Array<{
    uuid: string;
    name: string;
    slot: string;
  }>;
  usageCount: number;
}
```

## Styling

The component uses CSS classes with the `three-lens-` prefix:

```css
/* Texture list item */
.texture-item { }
.texture-item.selected { }
.texture-item-thumbnail { }
.texture-thumb-img { }
.texture-thumb-placeholder { }
.texture-item-info { }
.texture-item-name { }
.texture-item-meta { }
.texture-item-badges { }
.texture-item-stats { }

/* Badges */
.badge.cube { }
.badge.compressed { }
.badge.video { }
.badge.rt { }
.badge.mip { }

/* Inspector */
.texture-header { }
.texture-inspector-panel { }
.texture-header-thumb { }
.texture-header-img { }

/* Preview */
.texture-preview-section { }
.texture-preview-container { }
.texture-preview-img { }
.texture-preview-img.channel-r { }
.texture-preview-img.channel-g { }
.texture-preview-img.channel-b { }
.texture-preview-img.channel-a { }
.texture-channel-toggles { }
.channel-btn { }
.channel-btn.active { }
```

### Channel Filter CSS

```css
/* RGB - normal display */
.texture-preview-img.channel-rgb {
  filter: none;
}

/* Red channel only */
.texture-preview-img.channel-r {
  filter: grayscale(100%);
  mix-blend-mode: multiply;
  /* Show only red via CSS matrix */
}

/* Green channel only */
.texture-preview-img.channel-g {
  filter: grayscale(100%);
}

/* Blue channel only */
.texture-preview-img.channel-b {
  filter: grayscale(100%);
}

/* Alpha channel */
.texture-preview-img.channel-a {
  filter: grayscale(100%);
  /* Alpha displayed as grayscale */
}
```

## Integration Example

```typescript
import {
  renderTexturesPanel,
  attachTexturesEvents,
  createDefaultUIState,
  PanelContext,
  UIState
} from '@3lens/ui';

class TexturesView {
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
    this.container.innerHTML = renderTexturesPanel(
      this.context,
      this.state
    );
    
    attachTexturesEvents(
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
    // Handle texture-specific commands
  }
}
```

## Utility Functions

### `getTextureIcon()`

Returns an icon based on texture type:

```typescript
import { getTextureIcon } from '@3lens/ui';

getTextureIcon(textureData);  // '🖼️', '🎬', '📦', etc.
```

| Type | Icon |
|------|------|
| Regular texture | 🖼️ |
| Video texture | 🎬 |
| Cube texture | 🌍 |
| Data texture | 📊 |
| Compressed | 📦 |

### `truncateUrl()`

Truncates long URLs for display:

```typescript
import { truncateUrl } from '@3lens/ui';

truncateUrl('/assets/textures/diffuse.png', 30);
// '/assets/.../diffuse.png'
```

## Filter Name Mapping

The component maps Three.js filter constants to readable names:

| Constant | Display Name |
|----------|--------------|
| `NearestFilter` | Nearest |
| `LinearFilter` | Linear |
| `NearestMipmapNearestFilter` | NearestMipNearest |
| `NearestMipmapLinearFilter` | NearestMipLinear |
| `LinearMipmapNearestFilter` | LinearMipNearest |
| `LinearMipmapLinearFilter` | LinearMipLinear |

## Wrapping Mode Mapping

| Constant | Display Name |
|----------|--------------|
| `RepeatWrapping` | Repeat |
| `ClampToEdgeWrapping` | Clamp |
| `MirroredRepeatWrapping` | Mirror |

## See Also

- [Materials Panel Component](./materials-panel-component.md)
- [Render Targets Panel Component](./render-targets-panel-component.md)
- [Textures Panel (Overlay)](../overlay/textures-panel.md) - Overlay integration
- [TextureData Interface](/api/core/texture-info.md)
