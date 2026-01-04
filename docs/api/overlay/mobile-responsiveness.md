# Mobile Responsiveness

The 3Lens overlay is designed to work seamlessly on touch devices, tablets, and phones with responsive layouts, touch-optimized interactions, and WCAG-compliant touch targets.

## Overview

Mobile support includes:

- **Touch-Friendly Targets** - Minimum 44px touch areas (WCAG 2.5.5)
- **Responsive Breakpoints** - Adaptive layouts for different screen sizes
- **Touch Gestures** - Swipe, pan, and tap optimizations
- **Safe Area Support** - Notched phone compatibility
- **Reduced Motion** - Respects `prefers-reduced-motion`
- **High Contrast** - Accessibility support for `prefers-contrast`

## Touch Target Sizing

### WCAG Requirements

All interactive elements meet WCAG 2.5.5 guidelines:

- **Minimum**: 44×44px touch target
- **Comfortable**: 48×48px recommended

### CSS Variables

```css
:root {
  --3lens-touch-target-min: 44px;
  --3lens-touch-target-comfortable: 48px;
}
```

### Automatic Touch Detection

Touch-specific styles activate via the `pointer: coarse` media query:

```css
@media (pointer: coarse) {
  .three-lens-tab {
    min-height: var(--3lens-touch-target-min);
  }
  
  .three-lens-btn {
    min-width: var(--3lens-touch-target-min);
    min-height: var(--3lens-touch-target-min);
  }
}
```

### Elements with Touch Optimization

| Element | Desktop Size | Touch Size |
|---------|--------------|------------|
| Toggle button | 40×80px | 48×96px |
| Tab bar tabs | 32px height | 44px height |
| Tree nodes | 32px height | 44px height |
| Buttons | Variable | Min 44×44px |
| Icon buttons | 28×28px | 44×44px |
| Inputs | 32px height | 44px height |
| Scrollbars | 8px width | 12px width |

## Responsive Breakpoints

### Tablet Landscape (≤1024px)

```css
@media (max-width: 1024px) {
  .three-lens-overlay {
    --3lens-panel-width: 320px;
  }
  
  .three-lens-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

Changes:
- Narrower default panel width
- 2-column stats grid

### Tablet Portrait (≤768px)

The overlay transforms into a bottom sheet:

```css
@media (max-width: 768px) {
  .three-lens-overlay {
    --3lens-panel-width: 100%;
    width: 100%;
    left: 0;
    right: 0;
    bottom: 0;
    top: auto;
    height: 50vh;
    max-height: 50vh;
    border-radius: 12px 12px 0 0;
  }
}
```

Changes:
- Full-width bottom sheet
- 50% viewport height
- Rounded top corners
- Vertical swipe to collapse

### Phone Portrait (≤480px)

```css
@media (max-width: 480px) {
  .three-lens-overlay {
    height: 60vh;
    max-height: 60vh;
  }
  
  .three-lens-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .three-lens-property-row {
    flex-wrap: wrap;
  }
}
```

Changes:
- 60% viewport height (more real estate)
- Single column stats grid
- Stacked property layouts
- Hidden logo text

## Bottom Sheet Behavior

On narrow screens, the overlay becomes a bottom sheet:

### Toggle Position

```css
@media (max-width: 768px) {
  .three-lens-toggle {
    left: 50%;
    top: -24px;
    transform: translateX(-50%);
    width: 64px;
    height: 28px;
    border-radius: 8px 8px 0 0;
  }
  
  /* Drag handle indicator */
  .three-lens-toggle::before {
    content: '';
    width: 32px;
    height: 4px;
    background: var(--3lens-border);
    border-radius: 2px;
  }
}
```

### Collapse Animation

```css
.three-lens-overlay.collapsed {
  transform: translateY(calc(100% - 48px));
}

@keyframes slideIn {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

## Landscape Mode Handling

On mobile devices in landscape, the overlay stays as a side panel:

```css
@media (max-width: 768px) and (orientation: landscape) {
  .three-lens-overlay {
    width: 50%;
    height: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    border-left: 1px solid var(--3lens-border);
    border-radius: 0;
  }
}
```

## Touch Interactions

### Hover vs Active States

Touch devices use `:active` instead of `:hover`:

```css
@media (pointer: coarse) {
  /* Remove hover effects on touch */
  .three-lens-node-header:hover {
    background: transparent;
  }
  
  /* Use active for touch feedback */
  .three-lens-node-header:active {
    background: var(--3lens-bg-hover);
    transform: scale(0.98);
  }
}
```

### Touch Ripple Effect

Interactive elements include ripple feedback:

```css
.three-lens-touch-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.three-lens-touch-ripple:active::after {
  width: 200%;
  height: 200%;
}
```

### Text Selection Control

```css
@media (pointer: coarse) {
  /* Prevent accidental text selection */
  .three-lens-overlay {
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    touch-action: manipulation;
  }
  
  /* Allow selection only where needed */
  .three-lens-property-value,
  .three-lens-code-block {
    -webkit-user-select: text;
    user-select: text;
  }
}
```

### Scroll Behavior

```css
/* Prevent pull-to-refresh interference */
.three-lens-content {
  overscroll-behavior: contain;
}

/* Horizontal tabs scroll */
.three-lens-tabs {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Hide scrollbar */
}
```

## Gesture Support

### Swipe Indicator

Visual hint for swipeable panels:

```css
.three-lens-swipe-hint {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: var(--3lens-border);
  border-radius: 2px;
  opacity: 0.6;
}
```

### Touch Actions

```css
/* Pan vertically in overlay */
.three-lens-pan-area {
  touch-action: pan-y;
}

/* Disable pinch zoom in overlay */
.three-lens-overlay {
  touch-action: pan-x pan-y;
}

/* Enable pinch zoom for charts */
.three-lens-chart-canvas {
  touch-action: pinch-zoom pan-x pan-y;
}
```

## Safe Area Insets

Support for notched phones (iPhone X+):

```css
@supports (padding: env(safe-area-inset-bottom)) {
  @media (max-width: 768px) {
    .three-lens-overlay {
      padding-bottom: env(safe-area-inset-bottom);
    }
    
    .three-lens-toggle {
      margin-top: calc(-24px - env(safe-area-inset-top));
    }
  }
  
  /* Landscape safe areas */
  @media (orientation: landscape) and (max-width: 1024px) {
    .three-lens-overlay {
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }
  }
}
```

## Accessibility Features

### Reduced Motion

Respects user preference for reduced animation:

```css
@media (prefers-reduced-motion: reduce) {
  .three-lens-overlay,
  .three-lens-overlay * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .three-lens-toggle svg {
    transition: none;
  }
}
```

### High Contrast Mode

Enhanced visibility for accessibility:

```css
@media (prefers-contrast: high) {
  .three-lens-overlay {
    --3lens-border: #fff;
    --3lens-border-subtle: #888;
  }
  
  .three-lens-node-header:focus,
  .three-lens-tab:focus,
  button:focus {
    outline: 3px solid var(--3lens-accent-cyan);
    outline-offset: 2px;
  }
}
```

## Mobile CSS Variables

Additional variables for mobile layouts:

```css
:root {
  /* Touch target sizing */
  --3lens-touch-target-min: 44px;
  --3lens-touch-target-comfortable: 48px;
  
  /* Mobile spacing */
  --3lens-mobile-spacing-xs: 8px;
  --3lens-mobile-spacing-sm: 12px;
  --3lens-mobile-spacing-md: 16px;
  --3lens-mobile-spacing-lg: 20px;
  
  /* Mobile font sizes */
  --3lens-mobile-font-sm: 14px;
  --3lens-mobile-font-md: 16px;
  --3lens-mobile-font-lg: 18px;
}
```

## Testing Mobile Support

### Device Emulation

Use browser DevTools to test:

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl/Cmd + Shift + M)
3. Select device or set custom dimensions
4. Test touch interactions

### Media Query Testing

Test specific queries in DevTools:

```javascript
// Check touch device detection
window.matchMedia('(pointer: coarse)').matches

// Check screen size
window.matchMedia('(max-width: 768px)').matches

// Check reduced motion preference
window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

### Breakpoint Testing

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Desktop | >1024px | Side panel |
| Tablet Landscape | ≤1024px | Narrower panel |
| Tablet Portrait | ≤768px | Bottom sheet |
| Phone | ≤480px | Expanded bottom sheet |

## Custom Mobile Styles

### Overriding Touch Targets

```css
/* Increase touch targets further */
@media (pointer: coarse) {
  .three-lens-tab {
    min-height: var(--3lens-touch-target-comfortable);
    padding: 16px 20px;
  }
}
```

### Custom Breakpoint Behavior

```css
/* Custom tablet behavior */
@media (min-width: 481px) and (max-width: 900px) {
  .three-lens-overlay {
    --3lens-panel-width: 280px;
  }
}
```

### Disabling Bottom Sheet

```css
/* Keep side panel on all screen sizes */
@media (max-width: 768px) {
  .three-lens-overlay {
    /* Override bottom sheet styles */
    width: 280px !important;
    height: 100% !important;
    bottom: 0;
    top: 0;
    border-radius: 0;
  }
}
```

## Best Practices

### 1. Test on Real Devices

Emulators don't capture all touch behaviors. Test on actual phones and tablets.

### 2. Use Touch-Appropriate Spacing

```css
@media (pointer: coarse) {
  .custom-list-item {
    padding: var(--3lens-mobile-spacing-md);
    margin-bottom: var(--3lens-mobile-spacing-sm);
  }
}
```

### 3. Provide Visual Feedback

```css
@media (pointer: coarse) {
  .custom-button:active {
    transform: scale(0.95);
    background: var(--3lens-bg-active);
  }
}
```

### 4. Handle Orientation Changes

```javascript
window.addEventListener('orientationchange', () => {
  // Adjust layout after orientation change
  setTimeout(() => {
    overlay.recalculateLayout();
  }, 100);
});
```

### 5. Consider Thumb Zones

Place frequently-used controls within easy thumb reach:
- Bottom of screen for bottom sheet
- Near edges for side panels

## See Also

- [Theme System](./theme-system.md) - Dark/light theme support
- [CSS Custom Properties](./css-custom-properties.md) - Available style variables
- [ThreeLensOverlay](./ThreeLensOverlay.md) - Main overlay configuration
