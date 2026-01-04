# Theme System

The 3Lens overlay includes a comprehensive theme system with built-in themes, system preference detection, and support for custom themes.

## Overview

The theme system provides:

- **Built-in Themes** - Dark (default), Light, and High Contrast
- **Auto Detection** - Automatically follows system color scheme preferences
- **Custom Themes** - Define your own color schemes
- **Preset Themes** - Popular editor themes (Monokai, Dracula, Nord, GitHub)
- **Persistence** - Theme preference saved to localStorage

## Theme Modes

### Dark Theme (Default)

The default dark theme uses a deep ocean color palette optimized for extended viewing:

```typescript
// Dark theme is the default
const overlay = new ThreeLensOverlay(scene, {
  theme: 'dark'
});
```

Color characteristics:
- Primary background: `#0a0e14` (deep navy)
- Secondary background: `#0f1419`
- Elevated surfaces: `#1a222c`
- Accent color: Cyan `#22d3ee`

### Light Theme

A bright theme suitable for well-lit environments:

```typescript
const overlay = new ThreeLensOverlay(scene, {
  theme: 'light'
});
```

Color characteristics:
- Primary background: `#ffffff`
- Secondary background: `#f8fafc`
- Elevated surfaces: `#ffffff`
- Accent color: Teal `#0891b2`

### High Contrast Theme

Designed for accessibility with maximum contrast:

```typescript
const overlay = new ThreeLensOverlay(scene, {
  theme: 'high-contrast'
});
```

Color characteristics:
- Background: Pure black `#000000`
- Text: Pure white `#ffffff`
- Borders: White for visibility
- Focus indicator: Yellow `#ffff00`

### Auto Theme

Automatically follows system preferences:

```typescript
const overlay = new ThreeLensOverlay(scene, {
  theme: 'auto'
});
```

The auto mode:
- Detects `prefers-color-scheme` media query
- Updates when system preference changes
- Resolves to either dark or light

## ThemeManager API

The `ThemeManager` class provides programmatic control:

```typescript
import { ThemeManager } from '@3lens/overlay';

const themeManager = new ThemeManager();
themeManager.initialize(overlayElement);
```

### Methods

#### `setTheme(mode: ThemeMode)`

Set the active theme mode:

```typescript
themeManager.setTheme('dark');
themeManager.setTheme('light');
themeManager.setTheme('high-contrast');
themeManager.setTheme('auto');
```

#### `toggleTheme()`

Toggle between dark and light themes:

```typescript
// Switches between dark ↔ light
themeManager.toggleTheme();
```

If in `auto` mode, toggles to the opposite of the current resolved theme.

#### `cycleTheme()`

Cycle through all theme modes:

```typescript
// Cycles: dark → light → auto → dark
themeManager.cycleTheme();
```

#### `getMode(): ThemeMode`

Get the current theme mode setting:

```typescript
const mode = themeManager.getMode();
console.log(mode); // 'dark', 'light', 'high-contrast', or 'auto'
```

#### `getResolvedTheme(): ResolvedTheme`

Get the actual theme being displayed:

```typescript
const resolved = themeManager.getResolvedTheme();
console.log(resolved); // 'dark', 'light', or 'high-contrast'
```

This is useful when mode is `auto` to know which theme is active.

#### `onChange(callback): () => void`

Subscribe to theme changes:

```typescript
const unsubscribe = themeManager.onChange((event) => {
  console.log('Theme changed:', event.resolved);
  console.log('Is auto mode:', event.isAuto);
});

// Later: unsubscribe
unsubscribe();
```

### Theme Change Event

```typescript
interface ThemeChangeEvent {
  mode: ThemeMode;        // 'dark' | 'light' | 'high-contrast' | 'auto'
  resolved: ResolvedTheme; // 'dark' | 'light' | 'high-contrast'
  isAuto: boolean;        // true if mode is 'auto'
}
```

## Custom Themes

### Defining a Custom Theme

Create a custom theme by defining all required color properties:

```typescript
import { CustomTheme } from '@3lens/overlay';

const myTheme: CustomTheme = {
  name: 'My Custom Theme',
  
  // Background colors
  bgPrimary: '#1a1a2e',
  bgSecondary: '#16213e',
  bgTertiary: '#0f3460',
  bgElevated: '#1f4068',
  bgHover: '#2a5298',
  bgActive: '#3a6cc6',
  
  // Border colors
  border: '#4a6fa5',
  borderSubtle: '#2a4a7a',
  borderFocus: '#00d4ff',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#a0c4ff',
  textTertiary: '#7090b0',
  textDisabled: '#405060',
  textInverse: '#1a1a2e',
  
  // Accent colors
  accent: '#00d4ff',
  accentHover: '#00b4e6',
  
  // Optional accent variants
  accentBlue: '#0096ff',
  accentCyan: '#00d4ff',
  accentEmerald: '#00ff9f',
  accentAmber: '#ffaa00',
  accentRose: '#ff6b9d',
  accentViolet: '#b388ff',
  
  // Semantic colors
  success: '#00ff9f',
  successBg: 'rgba(0, 255, 159, 0.15)',
  warning: '#ffaa00',
  warningBg: 'rgba(255, 170, 0, 0.15)',
  error: '#ff4d6d',
  errorBg: 'rgba(255, 77, 109, 0.15)',
  
  // Shadows
  shadowSm: '0 2px 4px rgba(0, 0, 0, 0.3)',
  shadowMd: '0 4px 12px rgba(0, 0, 0, 0.4)',
  shadowLg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  
  // Color scheme for browser
  colorScheme: 'dark'
};
```

### Registering and Applying Custom Themes

```typescript
// Register the custom theme
themeManager.registerCustomTheme('my-theme', myTheme);

// Apply the custom theme
themeManager.applyCustomTheme('my-theme');

// List all registered custom themes
const themes = themeManager.getCustomThemes();
console.log(themes); // ['my-theme']
```

## Preset Themes

3Lens includes popular editor themes:

```typescript
import { PRESET_THEMES } from '@3lens/overlay';
```

### Available Presets

| Theme | Description | Color Scheme |
|-------|-------------|--------------|
| `monokai` | Classic Monokai colors | Dark |
| `dracula` | Popular Dracula palette | Dark |
| `github-light` | GitHub's light theme | Light |
| `nord` | Arctic, bluish colors | Dark |

### Using Preset Themes

```typescript
import { ThemeManager, PRESET_THEMES } from '@3lens/overlay';

const themeManager = new ThemeManager();
themeManager.initialize(overlayElement);

// Register a preset
themeManager.registerCustomTheme('dracula', PRESET_THEMES['dracula']);

// Apply it
themeManager.applyCustomTheme('dracula');
```

## Theme Application

### HTML Data Attribute

Themes are applied via the `data-theme` attribute:

```html
<!-- Dark theme -->
<div class="three-lens-root" data-theme="dark">...</div>

<!-- Light theme -->
<div class="three-lens-root" data-theme="light">...</div>

<!-- High contrast -->
<div class="three-lens-root" data-theme="high-contrast">...</div>

<!-- Custom theme -->
<div class="three-lens-root" data-theme="custom">...</div>
```

### CSS Variables

Each theme defines CSS custom properties that cascade to all components:

```css
/* Theme-aware component styling */
.my-extension {
  background: var(--3lens-bg-elevated);
  color: var(--3lens-text-primary);
  border: 1px solid var(--3lens-border);
}

/* Adapts automatically when theme changes */
```

## Persistence

Theme preferences are saved to localStorage:

```typescript
// Preference stored under key: '3lens-theme'
localStorage.getItem('3lens-theme'); // 'dark', 'light', etc.
```

To clear saved preference:

```typescript
localStorage.removeItem('3lens-theme');
```

## System Integration

### Prefers Color Scheme

The auto mode respects system preferences:

```css
/* CSS media query for system preference */
@media (prefers-color-scheme: dark) {
  /* Dark mode system preference */
}

@media (prefers-color-scheme: light) {
  /* Light mode system preference */
}
```

### Prefers Contrast

High contrast mode is also available for accessibility:

```css
@media (prefers-contrast: high) {
  .three-lens-overlay {
    --3lens-border: #fff;
    --3lens-border-subtle: #888;
  }
}
```

## TypeScript Types

```typescript
// Theme mode options
type ThemeMode = 'dark' | 'light' | 'high-contrast' | 'auto';

// Resolved theme (actual displayed theme)
type ResolvedTheme = 'dark' | 'light' | 'high-contrast';

// Custom theme interface
interface CustomTheme {
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  bgHover: string;
  bgActive: string;
  border: string;
  borderSubtle: string;
  borderFocus: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;
  accent: string;
  accentHover: string;
  success: string;
  warning: string;
  error: string;
  colorScheme: 'dark' | 'light';
  // ... optional properties
}

// Theme change event
interface ThemeChangeEvent {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  isAuto: boolean;
}
```

## Best Practices

### 1. Use CSS Variables for Extensions

```typescript
// Always use theme variables for consistency
const panelStyle = `
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-primary);
`;
```

### 2. Test All Themes

```typescript
// Iterate through themes during development
for (const theme of ['dark', 'light', 'high-contrast']) {
  themeManager.setTheme(theme as ThemeMode);
  // Verify appearance
}
```

### 3. Respect User Preferences

```typescript
// Default to 'auto' to respect system settings
const overlay = new ThreeLensOverlay(scene, {
  theme: 'auto'
});
```

### 4. Provide Theme Toggle UI

```typescript
// Add theme cycling to your toolbar
overlay.toolbar.addButton({
  icon: '🌗',
  label: 'Toggle Theme',
  onClick: () => themeManager.cycleTheme()
});
```

## See Also

- [CSS Custom Properties](./css-custom-properties.md) - Full list of CSS variables
- [Mobile Responsiveness](./mobile-responsiveness.md) - Touch and responsive design
- [Plugin Development](/guides/PLUGIN-DEVELOPMENT.md) - Building themed plugins
