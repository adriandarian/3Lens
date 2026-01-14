# CSS Variables Reference

Complete reference of all CSS custom properties available in `@3lens/themes`.

## Background Colors

| Variable | Description | Dark Default | Light Default |
|----------|-------------|-------------|--------------|
| `--3lens-bg-primary` | Main background | `#0a0e14` | `#ffffff` |
| `--3lens-bg-secondary` | Secondary surfaces | `#0f1419` | `#f8fafc` |
| `--3lens-bg-tertiary` | Tertiary surfaces | `#151b23` | `#f1f5f9` |
| `--3lens-bg-elevated` | Elevated panels | `#1a222c` | `#ffffff` |
| `--3lens-bg-hover` | Hover states | `#1f2937` | `#e2e8f0` |
| `--3lens-bg-active` | Active states | `#2d3a4d` | `#cbd5e1` |

```css
.panel {
  background: var(--3lens-bg-primary);
}

.panel:hover {
  background: var(--3lens-bg-hover);
}
```

## Text Colors

| Variable | Description | Dark Default | Light Default |
|----------|-------------|-------------|--------------|
| `--3lens-text-primary` | Primary text | `#e4e7eb` | `#0f172a` |
| `--3lens-text-secondary` | Secondary text | `#9ca3af` | `#475569` |
| `--3lens-text-tertiary` | Muted text | `#6b7280` | `#94a3b8` |
| `--3lens-text-disabled` | Disabled text | `#4b5563` | `#cbd5e1` |
| `--3lens-text-inverse` | Text on accent bg | `#0a0e14` | `#ffffff` |

```css
.heading {
  color: var(--3lens-text-primary);
}

.caption {
  color: var(--3lens-text-secondary);
}
```

## Border Colors

| Variable | Description | Dark Default | Light Default |
|----------|-------------|-------------|--------------|
| `--3lens-border` | Primary borders | `#2d3748` | `#e2e8f0` |
| `--3lens-border-subtle` | Subtle dividers | `#1e2738` | `#f1f5f9` |
| `--3lens-border-focus` | Focus rings | `#3b82f6` | `#3b82f6` |

```css
.card {
  border: 1px solid var(--3lens-border);
}

.input:focus {
  border-color: var(--3lens-border-focus);
}
```

## Accent Colors

| Variable | Description | Dark Default | Light Default |
|----------|-------------|-------------|--------------|
| `--3lens-accent-blue` | Blue accent | `#60a5fa` | `#3b82f6` |
| `--3lens-accent-cyan` | Cyan accent | `#22d3ee` | `#0891b2` |
| `--3lens-accent-emerald` | Green accent | `#34d399` | `#10b981` |
| `--3lens-accent-amber` | Yellow accent | `#fbbf24` | `#f59e0b` |
| `--3lens-accent-rose` | Pink accent | `#fb7185` | `#f43f5e` |
| `--3lens-accent-violet` | Purple accent | `#a78bfa` | `#8b5cf6` |
| `--3lens-accent-pink` | Pink accent | `#f472b6` | `#ec4899` |

```css
.primary-button {
  background: var(--3lens-accent-blue);
  color: var(--3lens-text-inverse);
}

.success-indicator {
  color: var(--3lens-accent-emerald);
}
```

## Semantic Colors

| Variable | Description | Dark Default | Light Default |
|----------|-------------|-------------|--------------|
| `--3lens-success` | Success color | `#10b981` | `#10b981` |
| `--3lens-success-bg` | Success background | `rgba(16, 185, 129, 0.1)` | `rgba(16, 185, 129, 0.1)` |
| `--3lens-warning` | Warning color | `#f59e0b` | `#f59e0b` |
| `--3lens-warning-bg` | Warning background | `rgba(245, 158, 11, 0.1)` | `rgba(245, 158, 11, 0.1)` |
| `--3lens-error` | Error color | `#ef4444` | `#ef4444` |
| `--3lens-error-bg` | Error background | `rgba(239, 68, 68, 0.1)` | `rgba(239, 68, 68, 0.1)` |
| `--3lens-info` | Info color | `#3b82f6` | `#3b82f6` |
| `--3lens-info-bg` | Info background | `rgba(59, 130, 246, 0.1)` | `rgba(59, 130, 246, 0.1)` |

```css
.alert-success {
  background: var(--3lens-success-bg);
  color: var(--3lens-success);
  border: 1px solid var(--3lens-success);
}
```

## Object Type Colors

| Variable | Description | Dark Default | Light Default |
|----------|-------------|-------------|--------------|
| `--3lens-color-scene` | Scene objects | `#34d399` | `#10b981` |
| `--3lens-color-mesh` | Mesh objects | `#60a5fa` | `#3b82f6` |
| `--3lens-color-group` | Group objects | `#a78bfa` | `#8b5cf6` |
| `--3lens-color-light` | Light objects | `#fbbf24` | `#f59e0b` |
| `--3lens-color-camera` | Camera objects | `#f472b6` | `#ec4899` |
| `--3lens-color-bone` | Bone objects | `#fb923c` | `#f97316` |
| `--3lens-color-helper` | Helper objects | `#9ca3af` | `#64748b` |

```css
.scene-node {
  color: var(--3lens-color-scene);
}

.mesh-node {
  color: var(--3lens-color-mesh);
}
```

## Spacing

| Variable | Value | Description |
|----------|-------|-------------|
| `--3lens-spacing-xs` | `4px` | Extra small spacing |
| `--3lens-spacing-sm` | `8px` | Small spacing |
| `--3lens-spacing-md` | `12px` | Medium spacing |
| `--3lens-spacing-lg` | `16px` | Large spacing |
| `--3lens-spacing-xl` | `24px` | Extra large spacing |

```css
.container {
  padding: var(--3lens-spacing-md);
  gap: var(--3lens-spacing-lg);
}
```

## Border Radius

| Variable | Value | Description |
|----------|-------|-------------|
| `--3lens-radius-sm` | `4px` | Small radius |
| `--3lens-radius-md` | `6px` | Medium radius |
| `--3lens-radius-lg` | `8px` | Large radius |
| `--3lens-radius-xl` | `12px` | Extra large radius |

```css
.card {
  border-radius: var(--3lens-radius-md);
}

.button {
  border-radius: var(--3lens-radius-sm);
}
```

## Shadows

| Variable | Value | Description |
|----------|-------|-------------|
| `--3lens-shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.3)` | Small shadow |
| `--3lens-shadow-md` | `0 4px 6px rgba(0, 0, 0, 0.4)` | Medium shadow |
| `--3lens-shadow-lg` | `0 10px 15px rgba(0, 0, 0, 0.5)` | Large shadow |
| `--3lens-shadow-glow` | `0 0 20px rgba(96, 165, 250, 0.15)` | Glow effect |

```css
.elevated {
  box-shadow: var(--3lens-shadow-md);
}

.glow {
  box-shadow: var(--3lens-shadow-glow);
}
```

## Transitions

| Variable | Value | Description |
|----------|-------|-------------|
| `--3lens-transition-fast` | `100ms ease` | Fast transition |
| `--3lens-transition-normal` | `200ms ease` | Normal transition |
| `--3lens-transition-slow` | `300ms ease` | Slow transition |

```css
.button {
  transition: var(--3lens-transition-normal);
}
```

## Typography

| Variable | Value | Description |
|----------|-------|-------------|
| `--3lens-font-mono` | `'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace` | Monospace font stack |
| `--3lens-font-sans` | `'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif` | Sans-serif font stack |

```css
.code {
  font-family: var(--3lens-font-mono);
}

.body {
  font-family: var(--3lens-font-sans);
}
```

## Customization

You can override any CSS variable to customize the theme:

```css
:root {
  --3lens-bg-primary: #000000; /* Custom background */
  --3lens-accent-blue: #00ff00; /* Custom accent */
  --3lens-radius-md: 8px; /* Custom radius */
}
```
