# @3lens/ui

Shared UI components for 3Lens — reusable panel renderers and styles for three.js devtools.

## Installation

```bash
npm install @3lens/ui
```

## Overview

This package provides the shared UI layer used by both `@3lens/overlay` (in-app floating panel) and the Chrome DevTools extension. It includes panel renderers for inspecting geometries, materials, textures, and render targets.

## Usage

```typescript
import { 
  renderGeometryPanel,
  renderMaterialsPanel,
  renderTexturesPanel,
  renderRenderTargetsPanel 
} from '@3lens/ui';

// Render a geometry inspection panel
const geometryHtml = renderGeometryPanel(geometryData, {
  showWireframe: true,
  showBoundingBox: true,
});

// Render a materials panel
const materialsHtml = renderMaterialsPanel(materialsList);

// Render textures panel
const texturesHtml = renderTexturesPanel(texturesList);

// Render render targets panel
const renderTargetsHtml = renderRenderTargetsPanel(renderTargets);
```

## API

### Panel Renderers

| Function | Description |
|----------|-------------|
| `renderGeometryPanel(data, options?)` | Renders geometry inspection panel |
| `renderMaterialsPanel(materials)` | Renders materials list panel |
| `renderTexturesPanel(textures)` | Renders textures inspection panel |
| `renderRenderTargetsPanel(targets)` | Renders render targets panel |

### Utilities

```typescript
import { formatBytes, formatNumber, truncate } from '@3lens/ui';

formatBytes(1024);      // "1.00 KB"
formatNumber(1234567);  // "1,234,567"
truncate('long text', 10); // "long te..."
```

### Styles

```typescript
import { baseStyles, panelStyles, themeVariables } from '@3lens/ui/styles';

// Apply base styles
document.adoptedStyleSheets = [baseStyles, panelStyles];

// Theme variables available:
// --3lens-bg-primary
// --3lens-bg-secondary
// --3lens-text-primary
// --3lens-text-secondary
// --3lens-accent
// --3lens-border
```

## Panel Types

### Geometry Panel
Displays geometry attributes, vertex count, face count, bounding box information, and memory usage.

### Materials Panel
Shows material properties including type, color, opacity, side, blending mode, and shader information for custom materials.

### Textures Panel
Lists all textures with preview thumbnails, dimensions, format, filtering settings, and memory estimates.

### Render Targets Panel
Displays framebuffer objects (FBOs), their dimensions, format, and attachment configuration.

## Styling

The UI components use CSS custom properties for theming. Override these variables to customize the appearance:

```css
:root {
  --3lens-bg-primary: #1e1e1e;
  --3lens-bg-secondary: #252526;
  --3lens-text-primary: #cccccc;
  --3lens-text-secondary: #858585;
  --3lens-accent: #007acc;
  --3lens-border: #3c3c3c;
}
```

## Related Packages

- [`@3lens/core`](https://www.npmjs.com/package/@3lens/core) — Core probe SDK
- [`@3lens/overlay`](https://www.npmjs.com/package/@3lens/overlay) — In-app overlay panel
- [`@3lens/react-bridge`](https://www.npmjs.com/package/@3lens/react-bridge) — React/R3F integration
- [`@3lens/vue-bridge`](https://www.npmjs.com/package/@3lens/vue-bridge) — Vue/TresJS integration
- [`@3lens/angular-bridge`](https://www.npmjs.com/package/@3lens/angular-bridge) — Angular integration

## License

MIT
