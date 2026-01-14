# @3lens/themes

3Lens design system themes and styles for consistent UI across applications.

## Overview

The `@3lens/themes` package provides:

- **Complete Theme System** - Dark, light, and high-contrast themes
- **CSS Custom Properties** - All design tokens as CSS variables
- **Utility Classes** - Pre-built component styles
- **TypeScript Utilities** - Programmatic theme management
- **Framework Agnostic** - Works with any framework or vanilla JavaScript

## Installation

::: code-group

```bash [npm]
npm install @3lens/themes
```

```bash [pnpm]
pnpm add @3lens/themes
```

```bash [yarn]
yarn add @3lens/themes
```

```bash [bun]
bun add @3lens/themes
```

:::

## Quick Start

### Import CSS

Import the complete styles (includes dark theme + base utilities):

```typescript
import '@3lens/themes/styles.css';
```

Or import specific theme files:

```typescript
// Dark theme (default)
import '@3lens/themes/theme-dark.css';
import '@3lens/themes/base.css';

// Light theme
import '@3lens/themes/theme-light.css';
import '@3lens/themes/base.css';

// High contrast theme
import '@3lens/themes/theme-high-contrast.css';
import '@3lens/themes/base.css';
```

### Use CSS Variables

```css
.my-component {
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-primary);
  border-radius: var(--3lens-radius-md);
  padding: var(--3lens-spacing-md);
}
```

### Use Utility Classes

```html
<div class="lens-card">
  <h1 class="lens-text-primary">Title</h1>
  <p class="lens-text-secondary">Description</p>
  <button class="lens-button lens-button-primary">Action</button>
</div>
```

## What's Included

- [CSS Custom Properties](./css-variables.md) - Complete reference of all CSS variables
- [Themes](./themes.md) - Dark, light, and high-contrast themes
- [Utility Classes](./utility-classes.md) - Pre-built component styles
- [TypeScript API](./typescript-api.md) - Programmatic theme management
- [Framework Integration](./framework-integration.md) - React, Vue, Angular examples

## Next Steps

- Learn about [CSS Variables](./css-variables.md)
- Explore [available themes](./themes.md)
- Check out [utility classes](./utility-classes.md)
- See [framework integration examples](./framework-integration.md)
