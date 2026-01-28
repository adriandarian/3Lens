# @3lens/ui-web

Web Components for 3Lens - framework-agnostic custom elements for embedding 3Lens UI anywhere.

## Installation

```bash
npm install @3lens/ui-web
# or
pnpm add @3lens/ui-web
```

## Usage

### Auto-Registration

Simply import the package to auto-register all components:

```typescript
import '@3lens/ui-web';
```

### Manual Registration

Or import and register individual components:

```typescript
import { ThreeLensOverlay, ThreeLensPanel, ThreeLensDock } from '@3lens/ui-web';

customElements.define('three-lens-overlay', ThreeLensOverlay);
customElements.define('three-lens-panel', ThreeLensPanel);
customElements.define('three-lens-dock', ThreeLensDock);
```

## Components

### `<three-lens-overlay>`

A floating overlay that appears above the canvas. Supports dragging and resizing.

```html
<three-lens-overlay x="20" y="20" width="400" height="600"></three-lens-overlay>
```

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `x` | number | 20 | Initial X position |
| `y` | number | 20 | Initial Y position |
| `width` | number | 400 | Width in pixels |
| `height` | number | 600 | Height in pixels |
| `z-index` | number | 10000 | Z-index value |

### `<three-lens-dock>`

A docked panel that integrates into your layout.

```html
<div class="app-layout">
  <main class="canvas-container">...</main>
  <three-lens-dock position="right" width="350" resizable collapsible></three-lens-dock>
</div>
```

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `position` | 'left' \| 'right' \| 'bottom' | 'right' | Dock position |
| `width` | number | 350 | Width for left/right docks |
| `height` | number | 300 | Height for bottom dock |
| `resizable` | boolean | false | Enable resize handle |
| `collapsible` | boolean | false | Enable collapse button |

### `<three-lens-panel>`

A unified panel component that can render in different modes.

```html
<!-- Inline panel -->
<three-lens-panel mode="inline" width="400" height="600"></three-lens-panel>

<!-- Overlay panel -->
<three-lens-panel mode="overlay"></three-lens-panel>

<!-- Dock panel -->
<three-lens-panel mode="dock" position="right"></three-lens-panel>
```

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | 'overlay' \| 'dock' \| 'inline' | 'inline' | Display mode |
| `position` | 'left' \| 'right' \| 'bottom' | 'right' | Dock position (dock mode only) |
| `width` | number | 400 | Width in pixels |
| `height` | number | 600 | Height in pixels |
| `minimized` | boolean | false | Start minimized |

## Connecting to 3Lens

All components have a `lens` property that accepts a Lens instance:

```typescript
import { createLens } from '@3lens/runtime';
import '@3lens/ui-web';

// Create a lens instance
const lens = createLens();

// Connect to component
const overlay = document.querySelector('three-lens-overlay');
overlay.lens = lens;

// Add panels
import { inspectorAddon } from '@3lens/addon-inspector';
const inspector = inspectorAddon.createPanel(lens);
overlay.addPanel(inspector);
```

## Styling

Components use CSS custom properties for theming. Override them with your own values:

```css
three-lens-overlay {
  --3lens-bg-primary: rgba(0, 0, 0, 0.9);
  --3lens-accent: #00ff88;
  --3lens-font-family: 'JetBrains Mono', monospace;
}
```

### Available CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--3lens-bg-primary` | `rgba(30, 30, 30, 0.95)` | Primary background |
| `--3lens-bg-secondary` | `rgba(50, 50, 50, 0.9)` | Secondary background |
| `--3lens-border` | `rgba(255, 255, 255, 0.1)` | Border color |
| `--3lens-text-primary` | `#e0e0e0` | Primary text color |
| `--3lens-text-secondary` | `#888888` | Secondary text color |
| `--3lens-accent` | `#4a9eff` | Accent color |
| `--3lens-font-family` | System fonts | Font family |
| `--3lens-font-size` | `12px` | Base font size |

## Events

Components emit events for state changes:

```typescript
overlay.addEventListener('show', () => console.log('Shown'));
overlay.addEventListener('hide', () => console.log('Hidden'));
overlay.addEventListener('minimize', () => console.log('Minimized'));
overlay.addEventListener('restore', () => console.log('Restored'));
overlay.addEventListener('panel-change', (e) => console.log('Panel:', e.detail.panelId));
```

## CSS Parts

Style internal elements using `::part()`:

```css
three-lens-overlay::part(header) {
  background: linear-gradient(90deg, #1a1a2e, #16213e);
}

three-lens-overlay::part(content) {
  padding: 16px;
}
```

Available parts: `panel`, `overlay`, `dock`, `header`, `tabs`, `content`, `resize-handle`

## TypeScript

TypeScript declarations are included. Access typed elements:

```typescript
const overlay = document.querySelector('three-lens-overlay')!;
overlay.lens = lens; // Typed!
overlay.addPanel(panel); // Typed!
```

## Browser Support

Requires browsers with Web Components support (all modern browsers).
For legacy browser support, use a polyfill like `@webcomponents/webcomponentsjs`.

## License

MIT
