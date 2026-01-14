# Themes

3Lens provides three built-in themes: dark (default), light, and high-contrast.

## Dark Theme (Default)

The default dark theme uses a deep ocean color palette optimized for extended viewing.

```typescript
import '@3lens/themes/theme-dark.css';
import '@3lens/themes/base.css';
```

**Color Characteristics:**
- Primary background: `#0a0e14` (deep navy)
- Secondary background: `#0f1419`
- Elevated surfaces: `#1a222c`
- Accent color: Cyan `#22d3ee`

**Best For:**
- Extended coding sessions
- Low-light environments
- Focused work
- Modern, professional applications

## Light Theme

A bright theme suitable for well-lit environments.

```typescript
import '@3lens/themes/theme-light.css';
import '@3lens/themes/base.css';
```

**Color Characteristics:**
- Primary background: `#ffffff`
- Secondary background: `#f8fafc`
- Elevated surfaces: `#ffffff`
- Accent color: Teal `#0891b2`

**Best For:**
- Well-lit workspaces
- Daytime use
- Presentations
- Public-facing applications

## High Contrast Theme

Designed for accessibility with maximum contrast.

```typescript
import '@3lens/themes/theme-high-contrast.css';
import '@3lens/themes/base.css';
```

**Color Characteristics:**
- Background: Pure black `#000000`
- Text: Pure white `#ffffff`
- Borders: White for visibility
- Focus indicator: Yellow `#ffff00`

**Best For:**
- Accessibility requirements
- Low vision users
- High contrast displays
- WCAG AAA compliance

## Switching Themes

### CSS Import Method

```typescript
// Switch themes by changing imports
import '@3lens/themes/theme-light.css'; // or theme-dark.css, theme-high-contrast.css
import '@3lens/themes/base.css';
```

### Programmatic Method

```typescript
import { applyTheme } from '@3lens/themes';

// Apply a specific theme
applyTheme('dark');
applyTheme('light');
applyTheme('high-contrast');
```

### Auto-Detection

```typescript
import { resolveTheme, applyTheme } from '@3lens/themes';

// Auto-detect system preference
const theme = resolveTheme('auto'); // Returns 'dark' or 'light'
applyTheme(theme);
```

### Watch System Changes

```typescript
import { watchSystemTheme, applyTheme } from '@3lens/themes';

// Watch for system theme changes
const unwatch = watchSystemTheme((theme) => {
  applyTheme(theme);
});

// Cleanup
unwatch();
```

## Theme Comparison

| Feature | Dark | Light | High Contrast |
|---------|------|-------|---------------|
| Background | `#0a0e14` | `#ffffff` | `#000000` |
| Text | `#e4e7eb` | `#0f172a` | `#ffffff` |
| Contrast Ratio | High | Medium | Maximum |
| Eye Strain | Low | Medium | Very Low |
| Battery Life | Better (OLED) | N/A | Better (OLED) |

## Custom Themes

You can create custom themes by overriding CSS variables:

```css
:root {
  /* Custom dark theme */
  --3lens-bg-primary: #1a1a2e;
  --3lens-bg-secondary: #16213e;
  --3lens-text-primary: #eee;
  --3lens-accent-blue: #00d4ff;
}
```

## Best Practices

1. **Default to Dark** - Dark theme is the default and matches 3Lens devtools
2. **Respect System Preference** - Use `resolveTheme('auto')` when possible
3. **Provide Theme Switcher** - Allow users to choose their preferred theme
4. **Test All Themes** - Ensure your UI works well in all three themes
5. **Customize Carefully** - Only override variables you need to change
