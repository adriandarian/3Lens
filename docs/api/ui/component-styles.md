# Component Styles

The `@3lens/ui` package provides a comprehensive CSS architecture for building consistent, professional UI components. The styles are designed to work across both the floating overlay and Chrome DevTools extension.

## Import

```typescript
import { 
  PANEL_STYLES, 
  THEME_VARIABLES,
  getSharedStyles 
} from '@3lens/ui';
```

## Architecture Overview

The styling system is organized into layers:

```
┌─────────────────────────────────────────────────┐
│  Theme Variables (CSS Custom Properties)         │
│  └─ Colors, fonts, spacing, shadows             │
├─────────────────────────────────────────────────┤
│  Base Components                                 │
│  └─ Empty states, split views, search bars      │
├─────────────────────────────────────────────────┤
│  Panel Components                                │
│  └─ List items, inspectors, property grids      │
├─────────────────────────────────────────────────┤
│  Panel-Specific Styles                           │
│  └─ Materials, Geometry, Textures, RenderTargets│
├─────────────────────────────────────────────────┤
│  Interactive Controls                            │
│  └─ Sliders, toggles, color pickers, selects    │
└─────────────────────────────────────────────────┘
```

## Theme Variables

The theme layer defines CSS custom properties used throughout:

```css
:root {
  /* Typography */
  --3lens-font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
  --3lens-font-sans: 'Geist', 'SF Pro Display', -apple-system, sans-serif;

  /* Background Colors */
  --3lens-bg-primary: #0a0e14;
  --3lens-bg-secondary: #0f1419;
  --3lens-bg-tertiary: #151b23;
  --3lens-bg-elevated: #1a222c;
  --3lens-bg-hover: #1f2937;

  /* Border Colors */
  --3lens-border: #2d3748;
  --3lens-border-subtle: #1e2738;
  --3lens-border-focus: #3b82f6;

  /* Text Colors */
  --3lens-text-primary: #e4e7eb;
  --3lens-text-secondary: #9ca3af;
  --3lens-text-tertiary: #6b7280;
  --3lens-text-disabled: #4b5563;

  /* Accent Colors */
  --3lens-accent-blue: #60a5fa;
  --3lens-accent-cyan: #22d3ee;
  --3lens-accent-emerald: #34d399;
  --3lens-accent-amber: #fbbf24;
  --3lens-accent-rose: #fb7185;
  --3lens-accent-violet: #a78bfa;
  --3lens-accent-pink: #f472b6;

  /* Semantic Colors */
  --3lens-success: #10b981;
  --3lens-warning: #f59e0b;
  --3lens-error: #ef4444;

  /* Border Radius */
  --3lens-radius-sm: 4px;
  --3lens-radius-md: 6px;
  --3lens-radius-lg: 8px;
  --3lens-radius-xl: 12px;

  /* Shadows */
  --3lens-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --3lens-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --3lens-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
}
```

## Base Components

### Empty State

Displayed when a panel has no content:

```html
<div class="panel-empty-state">
  <div class="empty-icon">📦</div>
  <h2>No Materials</h2>
  <p>No materials found in the scene</p>
  <div class="hint">Materials will appear here when loaded</div>
</div>
```

```css
.panel-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  text-align: center;
  padding: 32px;
}
```

### Split View Layout

Standard two-column layout for list + inspector:

```html
<div class="panel-split-view">
  <div class="panel-list">
    <!-- List items -->
  </div>
  <div class="panel-inspector">
    <!-- Inspector content -->
  </div>
</div>
```

```css
.panel-split-view {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.panel-list {
  flex: 1;
  min-width: 280px;
  overflow: auto;
  border-right: 1px solid var(--3lens-border);
}

.panel-inspector {
  width: 320px;
  min-width: 260px;
  max-width: 440px;
  overflow: auto;
  background: var(--3lens-bg-secondary);
}
```

### Summary Bar

Statistics display at the top of panels:

```html
<div class="panel-summary">
  <div class="summary-stat">
    <span class="summary-value">24</span>
    <span class="summary-label">Materials</span>
  </div>
  <div class="summary-stat">
    <span class="summary-value">12.4 MB</span>
    <span class="summary-label">Memory</span>
  </div>
</div>
```

### Search Bar

Filter input with clear button:

```html
<div class="panel-search">
  <input type="text" class="search-input" placeholder="Search...">
  <button class="search-clear">×</button>
</div>
```

### List Items

Selectable rows in panel lists:

```html
<div class="list-item selected">
  <div class="item-icon">M</div>
  <div class="item-info">
    <div class="item-name">MeshStandardMaterial</div>
    <div class="item-meta">Used by 3 meshes</div>
  </div>
</div>
```

```css
.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--3lens-radius-md);
  cursor: pointer;
  transition: all 120ms ease;
  margin: 4px 8px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid transparent;
}

.list-item:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border);
}

.list-item.selected {
  background: rgba(96, 165, 250, 0.15);
  border-color: var(--3lens-accent-blue);
  box-shadow: inset 3px 0 0 var(--3lens-accent-cyan);
}
```

## Inspector Components

### Inspector Header

Sticky header with item details:

```html
<div class="inspector-header">
  <div class="inspector-header-text">
    <div class="inspector-title">MeshStandardMaterial</div>
    <div class="inspector-subtitle">PBR Material</div>
  </div>
  <span class="inspector-uuid">abc123</span>
</div>
```

### Inspector Sections

Collapsible content sections:

```html
<div class="inspector-section">
  <div class="section-title">Properties</div>
  <div class="property-grid">
    <!-- Property rows -->
  </div>
</div>
```

### Property Grid

Key-value property display:

```html
<div class="property-grid">
  <div class="property-row">
    <span class="property-label">Color</span>
    <span class="property-value">
      <span class="color-swatch" style="background: #ff6b6b"></span>
      #ff6b6b
    </span>
  </div>
  <div class="property-row">
    <span class="property-label">Roughness</span>
    <span class="property-value">0.5</span>
  </div>
</div>
```

## Interactive Controls

### Color Picker

```html
<div class="property-value editable">
  <input type="color" class="prop-color-input" value="#ff6b6b">
  <span class="color-hex">#ff6b6b</span>
</div>
```

### Range Slider

```html
<div class="property-value editable">
  <input type="range" class="prop-range-input" min="0" max="1" step="0.01" value="0.5">
  <span class="range-value">0.50</span>
</div>
```

### Toggle Switch

```html
<label class="toggle-switch">
  <input type="checkbox" checked>
  <span class="toggle-slider"></span>
</label>
```

### Select Dropdown

```html
<select class="prop-select-input">
  <option value="0">FrontSide</option>
  <option value="1">BackSide</option>
  <option value="2">DoubleSide</option>
</select>
```

## Badges

Visual indicators for item properties:

```html
<span class="badge shader">SHADER</span>
<span class="badge transparent">TRANSPARENT</span>
<span class="badge textures">4 TEX</span>
<span class="badge cube">CUBE</span>
<span class="badge compressed">COMPRESSED</span>
<span class="badge video">VIDEO</span>
```

```css
.badge {
  font-size: 9px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge.shader {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
}

.badge.transparent {
  background: rgba(34, 211, 238, 0.2);
  color: var(--3lens-accent-cyan);
  border: 1px solid rgba(34, 211, 238, 0.3);
}
```

## Panel-Specific Styles

### Materials Panel

```css
.material-item.selected {
  background: rgba(251, 113, 133, 0.15);
  border-color: var(--3lens-accent-rose);
  box-shadow: inset 3px 0 0 var(--3lens-accent-rose);
}
```

### Geometry Panel

```css
.geometry-item.selected {
  background: rgba(52, 211, 153, 0.15);
  border-color: var(--3lens-accent-emerald);
  box-shadow: inset 3px 0 0 var(--3lens-accent-emerald);
}
```

### Textures Panel

```css
.texture-item.selected {
  background: rgba(244, 114, 182, 0.15);
  border-color: var(--3lens-accent-pink);
  box-shadow: inset 3px 0 0 var(--3lens-accent-pink);
}
```

### Render Targets Panel

```css
.rt-grid-item.selected {
  background: rgba(34, 211, 238, 0.12);
  border-color: var(--3lens-accent-cyan);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.2);
}
```

## Scrollbar Styling

Custom scrollbars matching the theme:

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--3lens-text-tertiary);
}
```

## Usage

### Injecting Styles

```typescript
import { getSharedStyles } from '@3lens/ui';

// Create and inject style element
const style = document.createElement('style');
style.textContent = getSharedStyles();
document.head.appendChild(style);
```

### Using Individual Style Modules

```typescript
import { THEME_VARIABLES, PANEL_STYLES } from '@3lens/ui';

// Combine as needed
const customStyles = `
  ${THEME_VARIABLES}
  ${PANEL_STYLES}
  
  /* Custom overrides */
  .my-component {
    color: var(--3lens-accent-cyan);
  }
`;
```

### Shadow DOM Usage

```typescript
const shadowRoot = element.attachShadow({ mode: 'open' });

const style = document.createElement('style');
style.textContent = getSharedStyles();
shadowRoot.appendChild(style);
```

## See Also

- [Theme System](../overlay/theme-system) - Dark/light theme configuration
- [CSS Custom Properties](../overlay/css-custom-properties) - Full variable reference
- [Icon System](./icon-system) - Object type icons
- [Color System](./color-system) - Cost heatmap and semantic colors
