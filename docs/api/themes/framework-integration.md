# Framework Integration

Examples of using `@3lens/themes` with popular frameworks.

## React

### Basic Setup

```tsx
// App.tsx
import '@3lens/themes/styles.css';
import { useState, useEffect } from 'react';
import { resolveTheme, applyTheme, watchSystemTheme, type ResolvedTheme } from '@3lens/themes';

function App() {
  const [theme, setTheme] = useState<ResolvedTheme>(() => resolveTheme('auto'));

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const unwatch = watchSystemTheme((newTheme) => {
      setTheme(newTheme);
    });
    return unwatch;
  }, []);

  return (
    <div className="lens-bg-primary lens-text-primary">
      <h1 className="lens-text-primary">My App</h1>
      <button 
        className="lens-button lens-button-primary"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        Toggle Theme
      </button>
    </div>
  );
}
```

### Custom Hook

```tsx
// useTheme.ts
import { useState, useEffect } from 'react';
import { resolveTheme, applyTheme, watchSystemTheme, type ResolvedTheme, type ThemeMode } from '@3lens/themes';

export function useTheme(preference: ThemeMode = 'auto') {
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme };
}

// Usage
function App() {
  const { theme, toggleTheme } = useTheme('auto');
  
  return (
    <div className="lens-bg-primary">
      <button className="lens-button" onClick={toggleTheme}>
        Current: {theme}
      </button>
    </div>
  );
}
```

### Styled Components

```tsx
import styled from 'styled-components';
import '@3lens/themes/styles.css';

const Card = styled.div`
  background: var(--3lens-bg-elevated);
  color: var(--3lens-text-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-md);
  padding: var(--3lens-spacing-md);
  box-shadow: var(--3lens-shadow-sm);
`;

const Button = styled.button`
  background: var(--3lens-accent-blue);
  color: white;
  border: none;
  border-radius: var(--3lens-radius-md);
  padding: var(--3lens-spacing-sm) var(--3lens-spacing-md);
  cursor: pointer;
  transition: var(--3lens-transition-normal);

  &:hover {
    background: var(--3lens-accent-cyan);
  }
`;

function App() {
  return (
    <Card>
      <h1>Styled with CSS Variables</h1>
      <Button>Click me</Button>
    </Card>
  );
}
```

## Vue

### Composition API

```vue
<template>
  <div class="lens-bg-primary lens-text-primary">
    <h1>My Vue App</h1>
    <button class="lens-button lens-button-primary" @click="toggleTheme">
      Toggle Theme
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import '@3lens/themes/styles.css';
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

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  applyTheme(theme.value);
}
</script>
```

### Composable

```typescript
// useTheme.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { resolveTheme, applyTheme, watchSystemTheme, type ResolvedTheme, type ThemeMode } from '@3lens/themes';

export function useTheme(preference: ThemeMode = 'auto') {
  const theme = ref<ResolvedTheme>(resolveTheme(preference));

  onMounted(() => {
    applyTheme(theme.value);
    
    if (preference === 'auto') {
      const unwatch = watchSystemTheme((newTheme) => {
        theme.value = newTheme;
        applyTheme(newTheme);
      });
      
      onUnmounted(() => {
        unwatch();
      });
    }
  });

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    applyTheme(theme.value);
  }

  return { theme, toggleTheme };
}

// Usage
<script setup lang="ts">
import { useTheme } from './useTheme';

const { theme, toggleTheme } = useTheme('auto');
</script>
```

## Angular

### Service

```typescript
// theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { resolveTheme, applyTheme, watchSystemTheme, type ResolvedTheme, type ThemeMode } from '@3lens/themes';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ResolvedTheme>(resolveTheme('auto'));
  public theme$: Observable<ResolvedTheme> = this.themeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    const initialTheme = resolveTheme('auto');
    applyTheme(initialTheme);
    this.themeSubject.next(initialTheme);

    watchSystemTheme((theme) => {
      applyTheme(theme);
      this.themeSubject.next(theme);
    });
  }

  setTheme(theme: ResolvedTheme) {
    applyTheme(theme);
    this.themeSubject.next(theme);
  }

  toggleTheme() {
    const current = this.themeSubject.value;
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}
```

### Component

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { ThemeService } from './theme.service';
import { ResolvedTheme } from '@3lens/themes';

@Component({
  selector: 'app-root',
  template: `
    <div class="lens-bg-primary lens-text-primary">
      <h1>My Angular App</h1>
      <p>Current theme: {{ theme }}</p>
      <button class="lens-button lens-button-primary" (click)="toggleTheme()">
        Toggle Theme
      </button>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  theme: ResolvedTheme = 'dark';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.theme$.subscribe(theme => {
      this.theme = theme;
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
```

### Styles Import

```typescript
// styles.ts or angular.json
import '@3lens/themes/styles.css';
```

## Svelte

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import '@3lens/themes/styles.css';
  import { resolveTheme, applyTheme, watchSystemTheme, type ResolvedTheme } from '@3lens/themes';

  let theme: ResolvedTheme = resolveTheme('auto');
  let unwatch: (() => void) | null = null;

  onMount(() => {
    applyTheme(theme);
    unwatch = watchSystemTheme((newTheme) => {
      theme = newTheme;
      applyTheme(newTheme);
    });
  });

  onDestroy(() => {
    if (unwatch) unwatch();
  });

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
  }
</script>

<div class="lens-bg-primary lens-text-primary">
  <h1>My Svelte App</h1>
  <button class="lens-button lens-button-primary" on:click={toggleTheme}>
    Toggle Theme
  </button>
</div>
```

## Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="@3lens/themes/styles.css">
</head>
<body>
  <div class="lens-bg-primary lens-text-primary">
    <h1>My App</h1>
    <button class="lens-button lens-button-primary" id="theme-toggle">
      Toggle Theme
    </button>
  </div>

  <script type="module">
    import { resolveTheme, applyTheme, watchSystemTheme } from '@3lens/themes';

    let currentTheme = resolveTheme('auto');
    applyTheme(currentTheme);

    const unwatch = watchSystemTheme((theme) => {
      currentTheme = theme;
      applyTheme(theme);
    });

    document.getElementById('theme-toggle').addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
    });
  </script>
</body>
</html>
```
