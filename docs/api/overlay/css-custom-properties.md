# CSS Custom Properties

The 3Lens overlay uses CSS custom properties (variables) extensively for theming and customization. All properties use the `--3lens-` prefix for namespacing.

## Overview

CSS custom properties provide:

- **Consistent Theming** - Single source of truth for colors
- **Runtime Customization** - Change appearance without rebuilding
- **Component Isolation** - Scoped to the overlay root element
- **Dark/Light Mode** - Theme-aware property values

## Property Categories

### Background Colors

| Property | Description | Dark Default | Light Default |
|----------|-------------|--------------|---------------|
| `--3lens-bg-primary` | Main background | `#0a0e14` | `#ffffff` |
| `--3lens-bg-secondary` | Secondary surfaces | `#0f1419` | `#f8fafc` |
| `--3lens-bg-tertiary` | Tertiary surfaces | `#151b23` | `#f1f5f9` |
| `--3lens-bg-elevated` | Elevated panels | `#1a222c` | `#ffffff` |
| `--3lens-bg-hover` | Hover states | `#1f2937` | `#e2e8f0` |
| `--3lens-bg-active` | Active states | `#2d3a4d` | `#cbd5e1` |

```css
/* Example usage */
.custom-panel {
  background: var(--3lens-bg-primary);
}

.custom-panel:hover {
  background: var(--3lens-bg-hover);
}
```

### Border Colors

| Property | Description | Dark Default | Light Default |
|----------|-------------|--------------|---------------|
| `--3lens-border` | Primary borders | `#2d3748` | `#e2e8f0` |
| `--3lens-border-subtle` | Subtle dividers | `#1e2738` | `#f1f5f9` |
| `--3lens-border-focus` | Focus rings | `#3b82f6` | `#3b82f6` |

```css
/* Example usage */
.custom-element {
  border: 1px solid var(--3lens-border);
}

.custom-element:focus {
  border-color: var(--3lens-border-focus);
}
```

### Text Colors

| Property | Description | Dark Default | Light Default |
|----------|-------------|--------------|---------------|
| `--3lens-text-primary` | Primary text | `#e4e7eb` | `#0f172a` |
| `--3lens-text-secondary` | Secondary text | `#9ca3af` | `#475569` |
| `--3lens-text-tertiary` | Muted text | `#6b7280` | `#94a3b8` |
| `--3lens-text-disabled` | Disabled text | `#4b5563` | `#cbd5e1` |
| `--3lens-text-inverse` | Text on accent bg | `#0a0e14` | `#ffffff` |

```css
/* Example usage */
.label {
  color: var(--3lens-text-secondary);
}

.title {
  color: var(--3lens-text-primary);
}
```

### Accent Colors

| Property | Description | Dark Default | Light Default |
|----------|-------------|--------------|---------------|
| `--3lens-accent` | Primary accent | `#22d3ee` | `#0891b2` |
| `--3lens-accent-hover` | Accent hover | `#06b6d4` | `#0e7490` |
| `--3lens-accent-blue` | Blue accent | `#60a5fa` | `#3b82f6` |
| `--3lens-accent-cyan` | Cyan accent | `#22d3ee` | `#0891b2` |
| `--3lens-accent-emerald` | Green accent | `#34d399` | `#059669` |
| `--3lens-accent-amber` | Yellow accent | `#fbbf24` | `#d97706` |
| `--3lens-accent-rose` | Pink accent | `#fb7185` | `#e11d48` |
| `--3lens-accent-violet` | Purple accent | `#a78bfa` | `#7c3aed` |

```css
/* Example usage */
.link {
  color: var(--3lens-accent-blue);
}

.highlight {
  background: var(--3lens-accent);
  color: var(--3lens-text-inverse);
}
```

### Semantic Colors

| Property | Description | Dark Default | Light Default |
|----------|-------------|--------------|---------------|
| `--3lens-success` | Success state | `#10b981` | `#059669` |
| `--3lens-success-bg` | Success background | `rgba(16, 185, 129, 0.15)` | `rgba(5, 150, 105, 0.1)` |
| `--3lens-warning` | Warning state | `#f59e0b` | `#d97706` |
| `--3lens-warning-bg` | Warning background | `rgba(245, 158, 11, 0.15)` | `rgba(217, 119, 6, 0.1)` |
| `--3lens-error` | Error state | `#ef4444` | `#dc2626` |
| `--3lens-error-bg` | Error background | `rgba(239, 68, 68, 0.15)` | `rgba(220, 38, 38, 0.1)` |
| `--3lens-info` | Info state | `#3b82f6` | `#2563eb` |
| `--3lens-info-bg` | Info background | `rgba(59, 130, 246, 0.15)` | `rgba(37, 99, 235, 0.1)` |

```css
/* Example usage */
.alert-success {
  background: var(--3lens-success-bg);
  border-color: var(--3lens-success);
  color: var(--3lens-success);
}

.alert-error {
  background: var(--3lens-error-bg);
  border-color: var(--3lens-error);
  color: var(--3lens-error);
}
```

### Object Type Colors

Consistent colors for Three.js object types:

| Property | Description | Value |
|----------|-------------|-------|
| `--3lens-color-scene` | Scene objects | `#34d399` |
| `--3lens-color-mesh` | Mesh objects | `#60a5fa` |
| `--3lens-color-group` | Groups | `#a78bfa` |
| `--3lens-color-light` | Light objects | `#fbbf24` |
| `--3lens-color-camera` | Cameras | `#f472b6` |
| `--3lens-color-bone` | Bones (skeleton) | `#fb923c` |
| `--3lens-color-object` | Generic objects | `#9ca3af` |

```css
/* Example usage */
.scene-icon { color: var(--3lens-color-scene); }
.mesh-icon { color: var(--3lens-color-mesh); }
.light-icon { color: var(--3lens-color-light); }
```

### Typography

| Property | Description | Default |
|----------|-------------|---------|
| `--3lens-font-mono` | Monospace font | `'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace` |
| `--3lens-font-sans` | Sans-serif font | `'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif` |

```css
/* Example usage */
.code {
  font-family: var(--3lens-font-mono);
}

.label {
  font-family: var(--3lens-font-sans);
}
```

### Spacing

| Property | Description | Default |
|----------|-------------|---------|
| `--3lens-spacing-xs` | Extra small | `4px` |
| `--3lens-spacing-sm` | Small | `8px` |
| `--3lens-spacing-md` | Medium | `12px` |
| `--3lens-spacing-lg` | Large | `16px` |
| `--3lens-spacing-xl` | Extra large | `24px` |

```css
/* Example usage */
.compact {
  padding: var(--3lens-spacing-sm);
  gap: var(--3lens-spacing-xs);
}

.spacious {
  padding: var(--3lens-spacing-lg);
  gap: var(--3lens-spacing-md);
}
```

### Border Radius

| Property | Description | Default |
|----------|-------------|---------|
| `--3lens-radius-sm` | Small radius | `4px` |
| `--3lens-radius-md` | Medium radius | `6px` |
| `--3lens-radius-lg` | Large radius | `8px` |
| `--3lens-radius-xl` | Extra large | `12px` |

```css
/* Example usage */
.button {
  border-radius: var(--3lens-radius-md);
}

.panel {
  border-radius: var(--3lens-radius-lg);
}
```

### Shadows

| Property | Description | Dark Default |
|----------|-------------|--------------|
| `--3lens-shadow-sm` | Small shadow | `0 2px 8px rgba(0, 0, 0, 0.3)` |
| `--3lens-shadow-md` | Medium shadow | `0 4px 16px rgba(0, 0, 0, 0.4)` |
| `--3lens-shadow-lg` | Large shadow | `0 8px 32px rgba(0, 0, 0, 0.5)` |

```css
/* Example usage */
.tooltip {
  box-shadow: var(--3lens-shadow-sm);
}

.modal {
  box-shadow: var(--3lens-shadow-lg);
}
```

### Transitions

| Property | Description | Default |
|----------|-------------|---------|
| `--3lens-transition-fast` | Fast transition | `100ms ease` |
| `--3lens-transition-normal` | Normal transition | `200ms ease` |
| `--3lens-transition-slow` | Slow transition | `300ms ease` |

```css
/* Example usage */
.button {
  transition: background var(--3lens-transition-fast);
}

.panel {
  transition: transform var(--3lens-transition-slow);
}
```

### Layout

| Property | Description | Default |
|----------|-------------|---------|
| `--3lens-panel-width` | Default panel width | `360px` |
| `--3lens-header-height` | Panel header height | `40px` |

## Overlay & Backdrop

| Property | Description | Dark Default |
|----------|-------------|--------------|
| `--3lens-overlay-bg` | Modal overlay | `rgba(0, 0, 0, 0.5)` |
| `--3lens-backdrop-blur` | Backdrop blur | `blur(8px)` |

```css
/* Example usage */
.modal-overlay {
  background: var(--3lens-overlay-bg);
  backdrop-filter: var(--3lens-backdrop-blur);
}
```

## Customizing Properties

### Method 1: CSS Override

Override properties in your stylesheet:

```css
/* Custom color scheme */
.three-lens-root {
  --3lens-accent: #ff6b6b;
  --3lens-accent-hover: #ee5a5a;
  --3lens-border-focus: #ff6b6b;
}
```

### Method 2: JavaScript

Override at runtime:

```typescript
const overlay = document.querySelector('.three-lens-root');
overlay.style.setProperty('--3lens-accent', '#ff6b6b');
```

### Method 3: Custom Theme

Use the theme system for complete customization:

```typescript
import { ThemeManager, CustomTheme } from '@3lens/overlay';

const customTheme: CustomTheme = {
  name: 'Custom',
  // ... all required properties
};

const themeManager = new ThemeManager();
themeManager.registerCustomTheme('custom', customTheme);
themeManager.applyCustomTheme('custom');
```

## Mobile-Specific Properties

Additional properties for touch devices:

| Property | Description | Default |
|----------|-------------|---------|
| `--3lens-touch-target-min` | Minimum touch target | `44px` |
| `--3lens-touch-target-comfortable` | Comfortable target | `48px` |
| `--3lens-mobile-spacing-xs` | Mobile extra small | `8px` |
| `--3lens-mobile-spacing-sm` | Mobile small | `12px` |
| `--3lens-mobile-spacing-md` | Mobile medium | `16px` |
| `--3lens-mobile-spacing-lg` | Mobile large | `20px` |
| `--3lens-mobile-font-sm` | Mobile small font | `14px` |
| `--3lens-mobile-font-md` | Mobile medium font | `16px` |
| `--3lens-mobile-font-lg` | Mobile large font | `18px` |

See [Mobile Responsiveness](./mobile-responsiveness.md) for details.

## Creating Theme-Aware Components

### Basic Pattern

```css
.my-component {
  /* Use theme variables */
  background: var(--3lens-bg-elevated);
  color: var(--3lens-text-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-md);
  
  /* Use transition variables */
  transition: all var(--3lens-transition-normal);
}

.my-component:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent);
}

.my-component:focus {
  outline: 2px solid var(--3lens-border-focus);
  outline-offset: 2px;
}
```

### Status Indicators

```css
.status-good {
  color: var(--3lens-success);
  background: var(--3lens-success-bg);
}

.status-warning {
  color: var(--3lens-warning);
  background: var(--3lens-warning-bg);
}

.status-error {
  color: var(--3lens-error);
  background: var(--3lens-error-bg);
}
```

### Object Type Styling

```css
.object-badge {
  padding: 2px 6px;
  border-radius: var(--3lens-radius-sm);
  font-size: 11px;
  font-weight: 600;
}

.object-badge.mesh {
  background: rgba(96, 165, 250, 0.15);
  color: var(--3lens-color-mesh);
}

.object-badge.light {
  background: rgba(251, 191, 36, 0.15);
  color: var(--3lens-color-light);
}
```

## Complete Variable Reference

```css
:root {
  /* Fonts */
  --3lens-font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
  --3lens-font-sans: 'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Border radius */
  --3lens-radius-sm: 4px;
  --3lens-radius-md: 6px;
  --3lens-radius-lg: 8px;
  --3lens-radius-xl: 12px;
  
  /* Spacing */
  --3lens-spacing-xs: 4px;
  --3lens-spacing-sm: 8px;
  --3lens-spacing-md: 12px;
  --3lens-spacing-lg: 16px;
  --3lens-spacing-xl: 24px;
  
  /* Layout */
  --3lens-panel-width: 360px;
  --3lens-header-height: 40px;
  
  /* Transitions */
  --3lens-transition-fast: 100ms ease;
  --3lens-transition-normal: 200ms ease;
  --3lens-transition-slow: 300ms ease;
  
  /* Object type colors (theme-independent) */
  --3lens-color-scene: #34d399;
  --3lens-color-mesh: #60a5fa;
  --3lens-color-group: #a78bfa;
  --3lens-color-light: #fbbf24;
  --3lens-color-camera: #f472b6;
  --3lens-color-bone: #fb923c;
  --3lens-color-object: #9ca3af;
}

/* Theme-dependent (set by theme system) */
.three-lens-root[data-theme="dark"] {
  --3lens-bg-primary: #0a0e14;
  --3lens-bg-secondary: #0f1419;
  --3lens-bg-tertiary: #151b23;
  --3lens-bg-elevated: #1a222c;
  --3lens-bg-hover: #1f2937;
  --3lens-bg-active: #2d3a4d;
  
  --3lens-border: #2d3748;
  --3lens-border-subtle: #1e2738;
  --3lens-border-focus: #3b82f6;
  
  --3lens-text-primary: #e4e7eb;
  --3lens-text-secondary: #9ca3af;
  --3lens-text-tertiary: #6b7280;
  --3lens-text-disabled: #4b5563;
  --3lens-text-inverse: #0a0e14;
  
  --3lens-accent: #22d3ee;
  --3lens-accent-hover: #06b6d4;
  --3lens-accent-blue: #60a5fa;
  --3lens-accent-cyan: #22d3ee;
  --3lens-accent-emerald: #34d399;
  --3lens-accent-amber: #fbbf24;
  --3lens-accent-rose: #fb7185;
  --3lens-accent-violet: #a78bfa;
  
  --3lens-success: #10b981;
  --3lens-success-bg: rgba(16, 185, 129, 0.15);
  --3lens-warning: #f59e0b;
  --3lens-warning-bg: rgba(245, 158, 11, 0.15);
  --3lens-error: #ef4444;
  --3lens-error-bg: rgba(239, 68, 68, 0.15);
  --3lens-info: #3b82f6;
  --3lens-info-bg: rgba(59, 130, 246, 0.15);
  
  --3lens-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --3lens-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --3lens-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  
  --3lens-overlay-bg: rgba(0, 0, 0, 0.5);
  --3lens-backdrop-blur: blur(8px);
}
```

## See Also

- [Theme System](./theme-system.md) - Built-in and custom themes
- [Mobile Responsiveness](./mobile-responsiveness.md) - Touch device styling
- [Plugin Development](/guides/PLUGIN-DEVELOPMENT.md) - Using variables in plugins
