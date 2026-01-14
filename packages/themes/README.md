# @3lens/themes

3Lens design system themes and styles for consistent UI across applications.

## Installation

```bash
npm install @3lens/themes
# or
pnpm add @3lens/themes
# or
yarn add @3lens/themes
```

## Quick Start

### CSS Import

Import the complete styles (includes dark theme + base utilities):

```html
<link rel="stylesheet" href="node_modules/@3lens/themes/dist/styles.css">
```

Or import specific theme files:

```html
<!-- Dark theme (default) -->
<link rel="stylesheet" href="node_modules/@3lens/themes/dist/theme-dark.css">
<link rel="stylesheet" href="node_modules/@3lens/themes/dist/base.css">

<!-- Light theme -->
<link rel="stylesheet" href="node_modules/@3lens/themes/dist/theme-light.css">
<link rel="stylesheet" href="node_modules/@3lens/themes/dist/base.css">

<!-- High contrast theme -->
<link rel="stylesheet" href="node_modules/@3lens/themes/dist/theme-high-contrast.css">
<link rel="stylesheet" href="node_modules/@3lens/themes/dist/base.css">
```

### JavaScript/TypeScript Import

```typescript
import '@3lens/themes/styles.css';
// or
import '@3lens/themes/theme-dark.css';
import '@3lens/themes/base.css';
```

### Using Theme Utilities

```typescript
import { applyTheme, resolveTheme, getCSSVariableValue } from '@3lens/themes';

// Apply a specific theme
applyTheme('dark');

// Resolve auto theme based on system preference
const theme = resolveTheme('auto'); // Returns 'dark' or 'light'
applyTheme(theme);

// Get CSS variable values
const primaryColor = getCSSVariableValue('bg-primary');
```

## Themes

### Dark Theme (Default)

The default dark theme uses a deep ocean color palette optimized for extended viewing.

```html
<link rel="stylesheet" href="@3lens/themes/theme-dark.css">
```

### Light Theme

A bright theme suitable for well-lit environments.

```html
<link rel="stylesheet" href="@3lens/themes/theme-light.css">
```

### High Contrast Theme

Designed for accessibility with maximum contrast.

```html
<link rel="stylesheet" href="@3lens/themes/theme-high-contrast.css">
```

## CSS Variables

All theme tokens are available as CSS custom properties with the `--3lens-` prefix.

### Background Colors

```css
.my-element {
  background-color: var(--3lens-bg-primary);
  /* or */
  background-color: var(--3lens-bg-secondary);
  background-color: var(--3lens-bg-elevated);
}
```

### Text Colors

```css
.my-text {
  color: var(--3lens-text-primary);
  /* or */
  color: var(--3lens-text-secondary);
  color: var(--3lens-text-tertiary);
}
```

### Accent Colors

```css
.my-button {
  background-color: var(--3lens-accent-blue);
  /* or */
  background-color: var(--3lens-accent-cyan);
  background-color: var(--3lens-accent-emerald);
}
```

### Spacing

```css
.my-container {
  padding: var(--3lens-spacing-md);
  gap: var(--3lens-spacing-lg);
}
```

### Border Radius

```css
.my-card {
  border-radius: var(--3lens-radius-md);
}
```

### Shadows

```css
.my-panel {
  box-shadow: var(--3lens-shadow-md);
}
```

## Utility Classes

The base styles include utility classes for common patterns:

```html
<!-- Text colors -->
<p class="lens-text-primary">Primary text</p>
<p class="lens-text-secondary">Secondary text</p>

<!-- Backgrounds -->
<div class="lens-bg-primary">Primary background</div>
<div class="lens-bg-elevated">Elevated surface</div>

<!-- Cards -->
<div class="lens-card">Card content</div>

<!-- Buttons -->
<button class="lens-button">Default button</button>
<button class="lens-button lens-button-primary">Primary button</button>

<!-- Inputs -->
<input type="text" class="lens-input" placeholder="Enter text...">
```

## Complete Variable Reference

See the [CSS Custom Properties documentation](https://3lens.dev/api/overlay/css-custom-properties) for a complete list of all available CSS variables.

## Framework Integration

### React

```tsx
import '@3lens/themes/styles.css';

function App() {
  return (
    <div className="lens-bg-primary">
      <h1 className="lens-text-primary">My App</h1>
    </div>
  );
}
```

### Vue

```vue
<template>
  <div class="lens-bg-primary">
    <h1 class="lens-text-primary">My App</h1>
  </div>
</template>

<script setup>
import '@3lens/themes/styles.css';
</script>
```

### Angular

```typescript
// In your component
import '@3lens/themes/styles.css';
```

```html
<div class="lens-bg-primary">
  <h1 class="lens-text-primary">My App</h1>
</div>
```

## Customization

You can override any CSS variable to customize the theme:

```css
:root {
  --3lens-bg-primary: #000000; /* Custom background */
  --3lens-accent-blue: #00ff00; /* Custom accent */
}
```

## License

MIT
