# TypeScript API

Programmatic theme management utilities.

## Installation

```typescript
import {
  resolveTheme,
  applyTheme,
  getCSSVariableValue,
  setCSSVariable,
  getCurrentTheme,
  watchSystemTheme,
  type ThemeMode,
  type ResolvedTheme,
} from '@3lens/themes';
```

## Types

### ThemeMode

```typescript
type ThemeMode = 'dark' | 'light' | 'high-contrast' | 'auto';
```

### ResolvedTheme

```typescript
type ResolvedTheme = 'dark' | 'light' | 'high-contrast';
```

## Functions

### resolveTheme()

Resolve theme mode to actual theme. 'auto' resolves based on system preference.

```typescript
function resolveTheme(mode: ThemeMode): ResolvedTheme;
```

**Example:**

```typescript
import { resolveTheme } from '@3lens/themes';

const theme = resolveTheme('auto'); // Returns 'dark' or 'light'
const darkTheme = resolveTheme('dark'); // Returns 'dark'
```

### applyTheme()

Apply a theme by loading the appropriate CSS.

```typescript
function applyTheme(theme: ResolvedTheme): void;
```

**Example:**

```typescript
import { applyTheme } from '@3lens/themes';

applyTheme('dark');
applyTheme('light');
applyTheme('high-contrast');
```

### getCSSVariableValue()

Get the computed value of a CSS variable.

```typescript
function getCSSVariableValue(token: string, element?: HTMLElement): string;
```

**Example:**

```typescript
import { getCSSVariableValue } from '@3lens/themes';

const primaryColor = getCSSVariableValue('bg-primary');
// Returns: '#0a0e14' (in dark theme)

const accentColor = getCSSVariableValue('accent-blue');
// Returns: '#60a5fa' (in dark theme)

// Get from specific element
const element = document.querySelector('.my-element');
const color = getCSSVariableValue('bg-primary', element);
```

### setCSSVariable()

Set a CSS variable value.

```typescript
function setCSSVariable(token: string, value: string, element?: HTMLElement): void;
```

**Example:**

```typescript
import { setCSSVariable } from '@3lens/themes';

// Set global variable
setCSSVariable('bg-primary', '#000000');

// Set on specific element
const element = document.querySelector('.my-element');
setCSSVariable('bg-primary', '#ff0000', element);
```

### getCurrentTheme()

Get the currently applied theme.

```typescript
function getCurrentTheme(): ResolvedTheme | null;
```

**Example:**

```typescript
import { getCurrentTheme } from '@3lens/themes';

const currentTheme = getCurrentTheme();
// Returns: 'dark' | 'light' | 'high-contrast' | null
```

### watchSystemTheme()

Watch for system theme preference changes.

```typescript
function watchSystemTheme(callback: (theme: ResolvedTheme) => void): () => void;
```

**Example:**

```typescript
import { watchSystemTheme, applyTheme } from '@3lens/themes';

// Watch for system theme changes
const unwatch = watchSystemTheme((theme) => {
  console.log('System theme changed to:', theme);
  applyTheme(theme);
});

// Cleanup when done
unwatch();
```

## Complete Example

```typescript
import {
  resolveTheme,
  applyTheme,
  watchSystemTheme,
  getCSSVariableValue,
  type ThemeMode,
} from '@3lens/themes';

// Initialize theme
function initTheme(preference: ThemeMode = 'auto') {
  const theme = resolveTheme(preference);
  applyTheme(theme);
  return theme;
}

// Watch for system changes
function setupThemeWatcher() {
  return watchSystemTheme((theme) => {
    applyTheme(theme);
    console.log('Theme changed to:', theme);
  });
}

// Get theme color
function getThemeColor(token: string): string {
  return getCSSVariableValue(token);
}

// Usage
const initialTheme = initTheme('auto');
const unwatch = setupThemeWatcher();

// Later, cleanup
// unwatch();
```

## React Example

```tsx
import { useEffect, useState } from 'react';
import { resolveTheme, applyTheme, watchSystemTheme, type ResolvedTheme } from '@3lens/themes';

function useTheme(preference: 'dark' | 'light' | 'auto' = 'auto') {
  const [theme, setTheme] = useState<ResolvedTheme>(() => resolveTheme(preference));

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (preference === 'auto') {
      const unwatch = watchSystemTheme((newTheme) => {
        setTheme(newTheme);
      });
      return unwatch;
    }
  }, [preference]);

  return [theme, setTheme] as const;
}

function App() {
  const [theme, setTheme] = useTheme('auto');
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

## Vue Example

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { resolveTheme, applyTheme, watchSystemTheme, type ResolvedTheme } from '@3lens/themes';

const theme = ref<ResolvedTheme>(resolveTheme('auto'));

onMounted(() => {
  applyTheme(theme.value);
  
  const unwatch = watchSystemTheme((newTheme) => {
    theme.value = newTheme;
    applyTheme(newTheme);
  });
  
  onUnmounted(() => {
    unwatch();
  });
});
</script>

<template>
  <div>
    <p>Current theme: {{ theme }}</p>
    <button @click="theme = theme === 'dark' ? 'light' : 'dark'">
      Toggle Theme
    </button>
  </div>
</template>
```
