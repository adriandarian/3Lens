# Svelte & Threlte Integration Guide

This guide covers integrating 3Lens with Svelte applications, including projects using Threlte for declarative Three.js.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Threlte Integration](#threlte-integration)
- [Svelte Stores](#svelte-stores)
- [Entity Registration](#entity-registration)
- [Advanced Patterns](#advanced-patterns)
- [TypeScript Support](#typescript-support)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

Get up and running in under 2 minutes:

```svelte
<!-- App.svelte -->
<script>
  import { Canvas } from '@threlte/core';
  import { useThreeLens } from '@3lens/core';
  
  const { probe, fps, drawCalls } = useThreeLens();
</script>

<Canvas>
  <perspectiveCamera position={[0, 0, 5]} />
  <ambientLight intensity={0.5} />
  <mesh>
    <boxGeometry />
    <meshStandardMaterial color="hotpink" />
  </mesh>
</Canvas>

<div class="stats">
  FPS: {fps}
  Draw Calls: {drawCalls}
</div>
```

Press **Ctrl+Shift+D** to toggle the devtools overlay!

---

## Installation

```bash
npm install @3lens/core @3lens/overlay
```

For Threlte projects:

```bash
npm install @3lens/core @3lens/overlay @threlte/core three
```

---

## Basic Setup

### Initialize 3Lens

```svelte
<!-- Scene.svelte -->
<script>
  import { onMount } from 'svelte';
  import { createProbe, bootstrapOverlay } from '@3lens/core';
  import { useThrelte } from '@threlte/core';
  import * as THREE from 'three';
  
  const { renderer, scene, camera } = useThrelte();
  let probe;
  
  onMount(() => {
    // Create probe
    probe = createProbe({ appName: 'My Svelte App' });
    
    // Connect to Threlte's renderer and scene
    probe.observeRenderer(renderer);
    probe.observeScene(scene);
    probe.setThreeReference(THREE);
    
    // Bootstrap overlay
    bootstrapOverlay(probe);
    
    return () => {
      // Cleanup on unmount
      probe?.dispose();
    };
  });
</script>
```

---

## Threlte Integration

### Using Threlte Context

Threlte provides a context system for accessing the renderer and scene:

```svelte
<script>
  import { getContext } from 'svelte';
  import { threlteContext } from '@threlte/core';
  import { createProbe, bootstrapOverlay } from '@3lens/core';
  import * as THREE from 'three';
  
  const { renderer, scene, camera } = getContext(threlteContext);
  let probe;
  
  onMount(() => {
    probe = createProbe({ appName: 'My App' });
    probe.observeRenderer(renderer);
    probe.observeScene(scene);
    probe.setThreeReference(THREE);
    bootstrapOverlay(probe);
  });
</script>
```

### Threlte Component Integration

Create a reusable component for 3Lens integration:

```svelte
<!-- ThreeLensConnector.svelte -->
<script>
  import { getContext } from 'svelte';
  import { onMount, onDestroy } from 'svelte';
  import { threlteContext } from '@threlte/core';
  import { createProbe, bootstrapOverlay } from '@3lens/core';
  import * as THREE from 'three';
  
  export let config = { appName: 'Svelte App' };
  
  const { renderer, scene } = getContext(threlteContext);
  let probe;
  
  onMount(() => {
    probe = createProbe(config);
    probe.observeRenderer(renderer);
    probe.observeScene(scene);
    probe.setThreeReference(THREE);
    bootstrapOverlay(probe);
  });
  
  onDestroy(() => {
    probe?.dispose();
  });
</script>
```

Usage:

```svelte
<Canvas>
  <ThreeLensConnector config={{ appName: 'My App' }} />
  <!-- Your scene content -->
</Canvas>
```

---

## Svelte Stores

### Creating Reactive Stores

Create Svelte stores for 3Lens metrics:

```svelte
<!-- stores/threelens.js -->
import { writable, derived } from 'svelte/store';
import { createProbe } from '@3lens/core';

let probe;

export const fps = writable(0);
export const drawCalls = writable(0);
export const triangles = writable(0);
export const frameTime = writable(0);

export function initThreeLens(config) {
  probe = createProbe(config);
  
  // Subscribe to frame stats
  probe.onFrameStats((stats) => {
    fps.set(stats.fps);
    drawCalls.set(stats.drawCalls);
    triangles.set(stats.triangles);
    frameTime.set(stats.frameTimeMs);
  });
  
  return probe;
}

export function getProbe() {
  return probe;
}
```

### Using Stores in Components

```svelte
<script>
  import { fps, drawCalls, triangles } from './stores/threelens';
</script>

<div class="stats">
  <div>FPS: {$fps.toFixed(1)}</div>
  <div>Draw Calls: {$drawCalls}</div>
  <div>Triangles: {$triangles.toLocaleString()}</div>
</div>
```

### Derived Stores

```svelte
<!-- stores/threelens.js -->
import { derived } from 'svelte/store';

export const isLowFPS = derived(fps, ($fps) => $fps < 30);
export const gpuMemoryMB = derived(gpuMemory, ($mem) => $mem / 1024 / 1024);
```

---

## Entity Registration

### Registering Objects

```svelte
<script>
  import { onMount } from 'svelte';
  import { getProbe } from './stores/threelens';
  import * as THREE from 'three';
  
  let meshRef;
  
  onMount(() => {
    const probe = getProbe();
    if (probe && meshRef) {
      probe.registerEntity(meshRef, {
        name: 'Player Character',
        module: '@game/characters',
        tags: ['player', 'controllable'],
        metadata: {
          health: 100,
          level: 5,
        },
      });
    }
  });
</script>

<mesh bind:this={meshRef}>
  <boxGeometry />
  <meshStandardMaterial />
</mesh>
```

---

## Advanced Patterns

### Conditional Debugging

```svelte
<script>
  import { dev } from '$app/environment';
</script>

{#if dev}
  <ThreeLensConnector config={{ appName: 'My App' }} />
{/if}
```

### Multiple Scenes

```svelte
<script>
  import { getProbe } from './stores/threelens';
  
  let mainScene;
  let uiScene;
  
  onMount(() => {
    const probe = getProbe();
    if (probe) {
      probe.observeScene(mainScene, { name: 'Main Scene' });
      probe.observeScene(uiScene, { name: 'UI Scene' });
    }
  });
</script>
```

---

## TypeScript Support

### Typed Stores

```typescript
// stores/threelens.ts
import { writable, type Writable } from 'svelte/store';
import type { DevtoolProbe, FrameStats } from '@3lens/core';

export const fps: Writable<number> = writable(0);
export const drawCalls: Writable<number> = writable(0);
export const probe: Writable<DevtoolProbe | null> = writable(null);
```

---

## Best Practices

### 1. Use Stores for Reactive State

Prefer Svelte stores over direct probe access for reactive UI updates.

### 2. Clean Up on Unmount

Always dispose of the probe when components unmount:

```svelte
onDestroy(() => {
  probe?.dispose();
});
```

### 3. Initialize Once

Create the probe once at the app level, not in every component.

---

## Troubleshooting

### Probe Not Available

Ensure the probe is initialized before accessing it:

```svelte
<script>
  import { getProbe } from './stores/threelens';
  
  $: probe = getProbe();
  $: if (probe) {
    // Use probe
  }
</script>
```

### Threlte Context Not Found

Ensure components are inside a `<Canvas>` component:

```svelte
<Canvas>
  <!-- Threlte context available here -->
  <MyComponent />
</Canvas>
```

---

## Related Guides

- [Vanilla Three.js Guide](/guide/vanilla-threejs)
- [Getting Started](/guide/getting-started)
- [Scene Inspection](/guide/features/scene-inspection)
