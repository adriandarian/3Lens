# Utility Classes

Pre-built utility classes for common UI patterns.

## Text Utilities

### Text Colors

```html
<p class="lens-text-primary">Primary text</p>
<p class="lens-text-secondary">Secondary text</p>
<p class="lens-text-tertiary">Tertiary/muted text</p>
<p class="lens-text-disabled">Disabled text</p>
```

### Background Utilities

```html
<div class="lens-bg-primary">Primary background</div>
<div class="lens-bg-secondary">Secondary background</div>
<div class="lens-bg-tertiary">Tertiary background</div>
<div class="lens-bg-elevated">Elevated surface</div>
<div class="lens-bg-hover">Hover state</div>
```

## Border Utilities

```html
<div class="lens-border">Primary border</div>
<div class="lens-border-subtle">Subtle border</div>
<div class="lens-border-focus">Focus border</div>
```

## Spacing Utilities

```html
<div class="lens-spacing-xs">Extra small padding</div>
<div class="lens-spacing-sm">Small padding</div>
<div class="lens-spacing-md">Medium padding</div>
<div class="lens-spacing-lg">Large padding</div>
<div class="lens-spacing-xl">Extra large padding</div>
```

## Border Radius Utilities

```html
<div class="lens-radius-sm">Small radius</div>
<div class="lens-radius-md">Medium radius</div>
<div class="lens-radius-lg">Large radius</div>
<div class="lens-radius-xl">Extra large radius</div>
```

## Shadow Utilities

```html
<div class="lens-shadow-sm">Small shadow</div>
<div class="lens-shadow-md">Medium shadow</div>
<div class="lens-shadow-lg">Large shadow</div>
<div class="lens-shadow-glow">Glow effect</div>
```

## Transition Utilities

```html
<div class="lens-transition-fast">Fast transition</div>
<div class="lens-transition-normal">Normal transition</div>
<div class="lens-transition-slow">Slow transition</div>
```

## Component Classes

### Card

```html
<div class="lens-card">
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</div>
```

**Styles Applied:**
- Background: `var(--3lens-bg-elevated)`
- Border: `1px solid var(--3lens-border)`
- Border radius: `var(--3lens-radius-md)`
- Padding: `var(--3lens-spacing-md)`
- Box shadow: `var(--3lens-shadow-sm)`

### Button

```html
<!-- Default button -->
<button class="lens-button">Click me</button>

<!-- Primary button -->
<button class="lens-button lens-button-primary">Primary Action</button>
```

**Styles Applied:**
- Background: `var(--3lens-bg-secondary)`
- Color: `var(--3lens-text-primary)`
- Border: `1px solid var(--3lens-border)`
- Border radius: `var(--3lens-radius-md)`
- Padding: `var(--3lens-spacing-sm) var(--3lens-spacing-md)`
- Font: `var(--3lens-font-sans)`
- Transition: `var(--3lens-transition-normal)`

**Primary Button:**
- Background: `var(--3lens-accent-blue)`
- Color: `white`
- Border color: `var(--3lens-accent-blue)`

**Hover States:**
- Default: `background: var(--3lens-bg-hover)`
- Primary: `background: var(--3lens-accent-cyan)`

### Input

```html
<input type="text" class="lens-input" placeholder="Enter text...">
```

**Styles Applied:**
- Background: `var(--3lens-bg-secondary)`
- Color: `var(--3lens-text-primary)`
- Border: `1px solid var(--3lens-border)`
- Border radius: `var(--3lens-radius-sm)`
- Padding: `var(--3lens-spacing-sm) var(--3lens-spacing-md)`
- Font: `var(--3lens-font-sans)`
- Transition: `var(--3lens-transition-normal)`

**Focus State:**
- Border color: `var(--3lens-border-focus)`
- Box shadow: `0 0 0 3px rgba(59, 130, 246, 0.1)`

## Combining Utilities

You can combine multiple utility classes:

```html
<div class="lens-card lens-shadow-md">
  <h1 class="lens-text-primary">Title</h1>
  <p class="lens-text-secondary">Description</p>
  <button class="lens-button lens-button-primary">Action</button>
</div>
```

## Customization

Utility classes use CSS variables, so you can customize them globally:

```css
:root {
  --3lens-radius-md: 12px; /* All .lens-radius-md will use 12px */
  --3lens-spacing-md: 16px; /* All .lens-spacing-md will use 16px */
}
```

Or override specific instances:

```css
.my-custom-card {
  /* Extend card styles */
  composes: lens-card;
  /* Add custom styles */
  border-width: 2px;
  max-width: 500px;
}
```
