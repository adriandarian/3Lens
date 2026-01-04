# Accessibility Features

The 3Lens UI implements comprehensive accessibility features to ensure the devtools are usable by all developers, including those using assistive technologies, reduced motion preferences, or high contrast modes.

## Import

```typescript
import { PANEL_STYLES, THEME_VARIABLES } from '@3lens/ui';
```

The accessibility styles are automatically included when using `PANEL_STYLES`.

## Focus Management

### Focus Visible

All interactive elements have visible focus indicators using the `:focus-visible` pseudo-class:

```css
.three-lens-panel *:focus-visible {
  outline: 2px solid var(--3lens-accent-blue);
  outline-offset: 2px;
}

/* Buttons and interactive elements */
.three-lens-btn:focus-visible,
.three-lens-tab:focus-visible,
.tree-node:focus-visible {
  outline: 2px solid var(--3lens-accent-blue);
  outline-offset: 2px;
}
```

**Why `:focus-visible`:**
- Shows focus ring only for keyboard navigation
- Hides focus ring for mouse clicks
- Better UX while maintaining accessibility

### Skip Links

For keyboard users to bypass repetitive content:

```css
.three-lens-skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  padding: 8px 16px;
  background: var(--3lens-bg-secondary);
  color: var(--3lens-text-primary);
  z-index: 10000;
  text-decoration: none;
}

.three-lens-skip-link:focus {
  left: 0;
}
```

**Usage:**

```html
<div class="three-lens-panel">
  <a href="#main-content" class="three-lens-skip-link">
    Skip to main content
  </a>
  <!-- Navigation/header content -->
  <main id="main-content">
    <!-- Main panel content -->
  </main>
</div>
```

## Screen Reader Support

### Screen Reader Only Text

Provides context for screen readers without visual display:

```css
.three-lens-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Usage Examples:**

```html
<!-- Icon with screen reader label -->
<button class="icon-btn" aria-label="Close panel">
  <span aria-hidden="true">×</span>
</button>

<!-- Decorative content hidden from screen readers -->
<span class="node-icon" aria-hidden="true">M</span>
<span class="three-lens-sr-only">Mesh object</span>

<!-- Status indicator -->
<div class="status-dot success">
  <span class="three-lens-sr-only">Status: Connected</span>
</div>

<!-- Value with label -->
<div class="property-row">
  <span class="three-lens-sr-only">Position X:</span>
  <input type="number" value="0" aria-label="Position X">
</div>
```

### ARIA Attributes

Use appropriate ARIA attributes throughout:

```html
<!-- Tree view -->
<div role="tree" aria-label="Scene hierarchy">
  <div role="treeitem" aria-expanded="true" aria-level="1">
    <span>Scene</span>
    <div role="group">
      <div role="treeitem" aria-level="2">
        <span>Mesh</span>
      </div>
    </div>
  </div>
</div>

<!-- Tabs -->
<div role="tablist" aria-label="Panel sections">
  <button role="tab" aria-selected="true" aria-controls="panel-materials">
    Materials
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-textures">
    Textures
  </button>
</div>
<div role="tabpanel" id="panel-materials" aria-labelledby="tab-materials">
  <!-- Panel content -->
</div>

<!-- Live regions -->
<div aria-live="polite" aria-atomic="true" class="three-lens-sr-only">
  <!-- Announcements for dynamic content changes -->
</div>

<!-- Expandable sections -->
<button aria-expanded="false" aria-controls="section-content">
  Section Title
</button>
<div id="section-content" hidden>
  <!-- Section content -->
</div>
```

## Motion Preferences

### Reduced Motion

Respects user's motion preferences for accessibility and comfort:

```css
@media (prefers-reduced-motion: reduce) {
  .three-lens-panel * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Specific element overrides */
  .three-lens-panel,
  .three-lens-panel * {
    animation: none !important;
    transition: none !important;
  }
}
```

**Effects Disabled:**
- Panel slide animations
- Expand/collapse transitions
- Hover animations
- Loading spinners (replaced with static indicators)
- Value change animations

**Implementation Pattern:**

```typescript
function animateValue(element: HTMLElement, from: number, to: number) {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  
  if (prefersReducedMotion) {
    // Instant update
    element.textContent = to.toString();
    return;
  }
  
  // Animated update
  // ... animation code
}
```

## High Contrast Mode

### Contrast Detection

```css
@media (prefers-contrast: more) {
  .three-lens-panel {
    --3lens-border-primary: #ffffff;
    --3lens-text-secondary: #e5e7eb;
  }
  
  .three-lens-btn {
    border: 2px solid currentColor;
  }
  
  .tree-node:focus-visible {
    outline-width: 3px;
  }
}
```

### High Contrast Styles

```css
@media (prefers-contrast: more) {
  /* Increase border visibility */
  .three-lens-panel .list-item,
  .three-lens-panel .grid-item,
  .three-lens-panel .section-header {
    border-width: 2px;
  }
  
  /* Enhance text contrast */
  .three-lens-panel .text-muted {
    color: var(--3lens-text-secondary);
  }
  
  /* Stronger selection indicators */
  .three-lens-panel .selected {
    outline: 3px solid var(--3lens-accent-blue);
  }
  
  /* Better button contrast */
  .three-lens-btn {
    border: 2px solid currentColor;
    font-weight: 600;
  }
}
```

## Touch Accessibility

### Touch-Friendly Targets

For devices with coarse pointers (touch screens):

```css
@media (pointer: coarse) {
  /* Larger touch targets */
  .three-lens-btn,
  .three-lens-tab,
  .tree-node,
  .list-item {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Increased spacing */
  .three-lens-panel .list-item {
    padding: 12px 16px;
  }
  
  /* Larger checkbox/radio inputs */
  .three-lens-panel input[type="checkbox"],
  .three-lens-panel input[type="radio"] {
    width: 24px;
    height: 24px;
  }
  
  /* Larger toggle switches */
  .toggle-switch {
    width: 52px;
    height: 28px;
  }
}
```

**Minimum Touch Target Size:** 44×44 pixels (WCAG 2.5.5)

## Keyboard Navigation

### Keyboard Patterns

**Tree Navigation:**
```
↑/↓     Navigate between nodes
←       Collapse node / Move to parent
→       Expand node / Move to first child
Enter   Select node
Home    First node
End     Last node
```

**Tab Navigation:**
```
←/→     Switch tabs
Tab     Move to tab content
```

**Panel Navigation:**
```
Tab     Move between interactive elements
Escape  Close modal/dropdown
Enter   Activate button/link
Space   Toggle checkbox/expand section
```

### Implementation Example

```typescript
function handleTreeKeyDown(event: KeyboardEvent, node: TreeNode) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      focusNextNode(node);
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusPreviousNode(node);
      break;
    case 'ArrowRight':
      event.preventDefault();
      if (node.hasChildren && !node.expanded) {
        expandNode(node);
      } else if (node.hasChildren) {
        focusFirstChild(node);
      }
      break;
    case 'ArrowLeft':
      event.preventDefault();
      if (node.expanded) {
        collapseNode(node);
      } else if (node.parent) {
        focusNode(node.parent);
      }
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      selectNode(node);
      break;
    case 'Home':
      event.preventDefault();
      focusFirstNode();
      break;
    case 'End':
      event.preventDefault();
      focusLastNode();
      break;
  }
}
```

## Color Accessibility

### Color Contrast

All text meets WCAG 2.1 AA contrast requirements:

| Element | Foreground | Background | Ratio |
|---------|------------|------------|-------|
| Primary text | #f3f4f6 | #0a0e14 | 15.4:1 |
| Secondary text | #9ca3af | #0a0e14 | 7.5:1 |
| Muted text | #6b7280 | #0a0e14 | 4.6:1 |
| Links | #3b82f6 | #0a0e14 | 5.3:1 |

### Don't Rely on Color Alone

Always provide additional indicators:

```html
<!-- Icon + color + text -->
<div class="status error">
  <span class="icon">✕</span>
  <span class="text">Error: Shader compilation failed</span>
</div>

<!-- Pattern + color for charts -->
<div class="cost-bar">
  <div class="cost-low" style="background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(255,255,255,0.1) 2px,
    rgba(255,255,255,0.1) 4px
  )"></div>
</div>

<!-- Badge with text -->
<span class="badge shader">
  <span class="badge-icon">⬡</span>
  <span class="badge-text">Custom Shader</span>
</span>
```

## Accessible Forms

### Input Labels

```html
<!-- Explicit label -->
<label for="position-x">Position X</label>
<input id="position-x" type="number" value="0">

<!-- Implicit label -->
<label>
  Position X
  <input type="number" value="0">
</label>

<!-- aria-label for icon-only inputs -->
<input type="color" aria-label="Material color" value="#ff0000">
```

### Error States

```html
<div class="form-field error">
  <label for="value-input">Value</label>
  <input 
    id="value-input" 
    type="number" 
    aria-invalid="true"
    aria-describedby="value-error"
    value="-1"
  >
  <span id="value-error" class="error-message" role="alert">
    Value must be positive
  </span>
</div>
```

### Disabled States

```css
.three-lens-btn:disabled,
.three-lens-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Provide visual indicator beyond opacity */
.three-lens-btn:disabled {
  border-style: dashed;
}
```

## Testing Accessibility

### Automated Testing

```typescript
import { axe } from 'axe-core';

async function testAccessibility(container: HTMLElement) {
  const results = await axe.run(container);
  
  if (results.violations.length > 0) {
    console.error('Accessibility violations:', results.violations);
  }
  
  return results;
}
```

### Manual Testing Checklist

- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Test with `prefers-reduced-motion: reduce`
- [ ] Test with `prefers-contrast: more`
- [ ] Test on touch device
- [ ] Verify color contrast with browser devtools
- [ ] Test keyboard shortcuts

### Browser DevTools

- Chrome: Lighthouse accessibility audit
- Firefox: Accessibility inspector
- Safari: Accessibility audit

## Complete Accessibility Example

```html
<div 
  class="three-lens-panel" 
  role="region" 
  aria-label="3Lens Developer Tools"
>
  <a href="#panel-content" class="three-lens-skip-link">
    Skip to panel content
  </a>
  
  <header role="banner">
    <h1 class="three-lens-sr-only">3Lens DevTools</h1>
    <nav role="tablist" aria-label="Panel sections">
      <button 
        role="tab" 
        aria-selected="true" 
        aria-controls="materials-panel"
        id="tab-materials"
      >
        Materials
      </button>
      <button 
        role="tab" 
        aria-selected="false" 
        aria-controls="textures-panel"
        id="tab-textures"
      >
        Textures
      </button>
    </nav>
  </header>
  
  <main id="panel-content">
    <div 
      role="tabpanel" 
      id="materials-panel" 
      aria-labelledby="tab-materials"
    >
      <div 
        role="tree" 
        aria-label="Materials list"
      >
        <div 
          role="treeitem" 
          tabindex="0"
          aria-selected="true"
        >
          <span aria-hidden="true">◆</span>
          <span>PBR Material</span>
          <span class="three-lens-sr-only">Physical material, selected</span>
        </div>
      </div>
    </div>
  </main>
  
  <div 
    aria-live="polite" 
    aria-atomic="true" 
    class="three-lens-sr-only"
    id="announcements"
  >
    <!-- Dynamic announcements -->
  </div>
</div>
```

## See Also

- [Component Styles](./component-styles) - CSS architecture
- [Color System](./color-system) - Contrast and semantic colors
- [Icon System](./icon-system) - Visual indicators
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
