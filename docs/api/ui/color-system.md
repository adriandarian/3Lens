# Color System

The 3Lens color system provides consistent visual theming across all UI components. It includes semantic colors for status indicators, cost heatmap colors for performance visualization, and object type colors for scene hierarchy.

## Import

```typescript
import { THEME_VARIABLES } from '@3lens/ui';
```

## Theme Colors

### Background Colors

```css
--3lens-bg-primary: #0a0e14;    /* Main background */
--3lens-bg-secondary: #111827;  /* Panel backgrounds */
--3lens-bg-tertiary: #1f2937;   /* Hover states */
--3lens-bg-hover: #1f2937;      /* Interactive hover */
```

### Text Colors

```css
--3lens-text-primary: #f3f4f6;    /* Primary text */
--3lens-text-secondary: #9ca3af;  /* Secondary text */
--3lens-text-muted: #6b7280;      /* Muted/disabled text */
```

### Border Colors

```css
--3lens-border-primary: #374151;   /* Primary borders */
--3lens-border-secondary: #4b5563; /* Secondary borders */
```

## Accent Colors

Accent colors are used for interactive elements, highlights, and type indicators.

```css
--3lens-accent-blue: #3b82f6;    /* Primary actions */
--3lens-accent-cyan: #06b6d4;    /* Links, info */
--3lens-accent-emerald: #10b981; /* Success, scene */
--3lens-accent-amber: #f59e0b;   /* Warnings, lights */
--3lens-accent-rose: #f43f5e;    /* Errors, materials */
--3lens-accent-violet: #8b5cf6;  /* Groups, special */
--3lens-accent-pink: #ec4899;    /* Cameras */
```

### Usage

```css
.primary-button {
  background: var(--3lens-accent-blue);
}

.success-indicator {
  background: var(--3lens-accent-emerald);
}

.warning-badge {
  background: var(--3lens-accent-amber);
}

.error-message {
  color: var(--3lens-accent-rose);
}
```

## Semantic Colors

### Status Indicators

```css
/* Success - Green */
--3lens-success: #10b981;
--3lens-success-bg: rgba(16, 185, 129, 0.1);

/* Warning - Amber */
--3lens-warning: #f59e0b;
--3lens-warning-bg: rgba(245, 158, 11, 0.1);

/* Error - Red */
--3lens-error: #ef4444;
--3lens-error-bg: rgba(239, 68, 68, 0.1);

/* Info - Cyan */
--3lens-info: #06b6d4;
--3lens-info-bg: rgba(6, 182, 212, 0.1);
```

**Example Usage:**

```html
<div class="status-badge success">
  ✓ Compiled successfully
</div>

<div class="status-badge warning">
  ⚠ Performance warning
</div>

<div class="status-badge error">
  ✕ Shader compilation failed
</div>
```

```css
.status-badge.success {
  background: var(--3lens-success-bg);
  color: var(--3lens-success);
  border: 1px solid var(--3lens-success);
}

.status-badge.warning {
  background: var(--3lens-warning-bg);
  color: var(--3lens-warning);
  border: 1px solid var(--3lens-warning);
}

.status-badge.error {
  background: var(--3lens-error-bg);
  color: var(--3lens-error);
  border: 1px solid var(--3lens-error);
}
```

## Cost Heatmap Colors

The heatmap color system visualizes performance costs. Used in materials, textures, and render targets panels.

### Color Scale

| Level | Color | CSS Class | Usage |
|-------|-------|-----------|-------|
| Low | Green (#22c55e) | `.cost-low` | Efficient, optimized |
| Medium | Yellow (#facc15) | `.cost-medium` | Acceptable |
| High | Orange (#f97316) | `.cost-high` | Needs attention |
| Critical | Red (#ef4444) | `.cost-critical` | Performance issue |

### CSS Classes

```css
/* Cost indicator colors */
.cost-low {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.cost-medium {
  color: #facc15;
  background: rgba(250, 204, 21, 0.1);
}

.cost-high {
  color: #f97316;
  background: rgba(249, 115, 22, 0.1);
}

.cost-critical {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
```

### Heatmap Gradient

For continuous visualization (progress bars, backgrounds):

```css
.cost-gradient {
  background: linear-gradient(
    90deg,
    #22c55e 0%,      /* Low */
    #facc15 33%,     /* Medium */
    #f97316 66%,     /* High */
    #ef4444 100%     /* Critical */
  );
}
```

### Cost Analysis Usage

```typescript
function getCostClass(cost: number): string {
  if (cost < 25) return 'cost-low';
  if (cost < 50) return 'cost-medium';
  if (cost < 75) return 'cost-high';
  return 'cost-critical';
}

function getCostColor(cost: number): string {
  if (cost < 25) return '#22c55e';
  if (cost < 50) return '#facc15';
  if (cost < 75) return '#f97316';
  return '#ef4444';
}
```

**Example:**

```html
<div class="cost-analysis">
  <div class="cost-bar">
    <div class="cost-fill ${getCostClass(material.cost)}" 
         style="width: ${material.cost}%"></div>
  </div>
  <span class="cost-value ${getCostClass(material.cost)}">
    ${material.cost}%
  </span>
</div>
```

```css
.cost-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.cost-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.cost-fill.cost-low { background: #22c55e; }
.cost-fill.cost-medium { background: #facc15; }
.cost-fill.cost-high { background: #f97316; }
.cost-fill.cost-critical { background: #ef4444; }
```

### Texture Memory Heatmap

```css
.texture-heatmap-overlay {
  position: absolute;
  inset: 0;
  background: rgba(239, 68, 68, var(--heatmap-intensity, 0));
  pointer-events: none;
  mix-blend-mode: multiply;
}
```

```typescript
function getMemoryHeatmapIntensity(bytes: number): number {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return 0;      // < 1MB: no overlay
  if (mb < 4) return 0.2;    // 1-4MB: light
  if (mb < 16) return 0.4;   // 4-16MB: medium
  if (mb < 64) return 0.6;   // 16-64MB: high
  return 0.8;                 // 64MB+: critical
}
```

## Object Type Colors

Consistent colors for Three.js object types across the UI.

```css
/* Scene tree object colors */
--3lens-color-scene: #34d399;   /* Emerald - Scene root */
--3lens-color-mesh: #60a5fa;    /* Blue - Mesh objects */
--3lens-color-group: #a78bfa;   /* Violet - Groups */
--3lens-color-light: #fbbf24;   /* Amber - Lights */
--3lens-color-camera: #f472b6;  /* Pink - Cameras */
--3lens-color-bone: #9ca3af;    /* Gray - Bones */
--3lens-color-default: #9ca3af; /* Gray - Other */
```

**Example Usage:**

```css
.node-icon.scene { background: var(--3lens-color-scene); }
.node-icon.mesh { background: var(--3lens-color-mesh); }
.node-icon.group { background: var(--3lens-color-group); }
.node-icon.light { background: var(--3lens-color-light); }
.node-icon.camera { background: var(--3lens-color-camera); }
```

## Panel Selection Colors

Each panel type has a distinct accent color for selected items.

| Panel | Color | CSS Variable |
|-------|-------|--------------|
| Materials | Rose | `--3lens-accent-rose` |
| Geometry | Emerald | `--3lens-accent-emerald` |
| Textures | Pink | `--3lens-accent-pink` |
| Render Targets | Cyan | `--3lens-accent-cyan` |
| Scene Explorer | Blue | `--3lens-accent-blue` |

**Example:**

```css
/* Materials panel - Rose selection */
.materials-panel .list-item.selected {
  background: rgba(244, 63, 94, 0.15);
  border-left: 2px solid var(--3lens-accent-rose);
}

/* Geometry panel - Emerald selection */
.geometry-panel .grid-item.selected {
  border-color: var(--3lens-accent-emerald);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

/* Textures panel - Pink selection */
.textures-panel .texture-item.selected {
  border-color: var(--3lens-accent-pink);
  box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.3);
}
```

## Color Utility Functions

### CSS Variable Access

```typescript
function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--3lens-${name}`).trim();
}

// Usage
const accentBlue = getCSSVariable('accent-blue');
const bgPrimary = getCSSVariable('bg-primary');
```

### Color with Alpha

```typescript
function colorWithAlpha(cssVar: string, alpha: number): string {
  // For use in inline styles where CSS variables aren't available
  const colors: Record<string, string> = {
    'accent-blue': '59, 130, 246',
    'accent-emerald': '16, 185, 129',
    'accent-rose': '244, 63, 94',
    'success': '16, 185, 129',
    'warning': '245, 158, 11',
    'error': '239, 68, 68',
  };
  
  return `rgba(${colors[cssVar]}, ${alpha})`;
}

// Usage
const hoverBg = colorWithAlpha('accent-blue', 0.1);
// "rgba(59, 130, 246, 0.1)"
```

## Complete Theme Reference

```css
:host {
  /* Backgrounds */
  --3lens-bg-primary: #0a0e14;
  --3lens-bg-secondary: #111827;
  --3lens-bg-tertiary: #1f2937;
  --3lens-bg-hover: #1f2937;
  
  /* Text */
  --3lens-text-primary: #f3f4f6;
  --3lens-text-secondary: #9ca3af;
  --3lens-text-muted: #6b7280;
  
  /* Borders */
  --3lens-border-primary: #374151;
  --3lens-border-secondary: #4b5563;
  
  /* Accents */
  --3lens-accent-blue: #3b82f6;
  --3lens-accent-cyan: #06b6d4;
  --3lens-accent-emerald: #10b981;
  --3lens-accent-amber: #f59e0b;
  --3lens-accent-rose: #f43f5e;
  --3lens-accent-violet: #8b5cf6;
  --3lens-accent-pink: #ec4899;
  
  /* Semantic */
  --3lens-success: #10b981;
  --3lens-warning: #f59e0b;
  --3lens-error: #ef4444;
  --3lens-info: #06b6d4;
  
  /* Object types */
  --3lens-color-scene: #34d399;
  --3lens-color-mesh: #60a5fa;
  --3lens-color-group: #a78bfa;
  --3lens-color-light: #fbbf24;
  --3lens-color-camera: #f472b6;
  
  /* Typography */
  --3lens-font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
  --3lens-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  
  /* Spacing */
  --3lens-spacing-xs: 4px;
  --3lens-spacing-sm: 8px;
  --3lens-spacing-md: 12px;
  --3lens-spacing-lg: 16px;
  --3lens-spacing-xl: 24px;
  
  /* Radius */
  --3lens-radius-sm: 4px;
  --3lens-radius-md: 6px;
  --3lens-radius-lg: 8px;
  
  /* Shadows */
  --3lens-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --3lens-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --3lens-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
}
```

## See Also

- [Component Styles](./component-styles) - CSS architecture
- [Icon System](./icon-system) - Visual type indicators
- [Accessibility Features](./accessibility-features) - Color contrast support
- [Materials Panel](../overlay/materials-panel) - Uses cost heatmap
