# Framework Integration Examples

This guide provides comprehensive walkthroughs for integrating 3Lens with various JavaScript frameworks and build tools. Each example is a complete, runnable project demonstrating best practices.

[[toc]]

## Overview

3Lens provides framework-agnostic core packages that work with any Three.js application, plus dedicated bridge packages for popular frameworks:

| Framework | Bridge Package | Example |
|-----------|---------------|---------|
| Vanilla Three.js | `@3lens/core` + `@3lens/overlay` | [vanilla-threejs](#vanilla-three-js) |
| React Three Fiber | `@3lens/react-bridge` | [react-three-fiber](#react-three-fiber) |
| Angular | `@3lens/angular-bridge` | [angular-threejs](#angular-three-js) |
| Vue + TresJS | `@3lens/vue-bridge` | [vue-tresjs](#vue-tresjs) |
| Svelte + Threlte | `@3lens/core` | [svelte-threlte](#svelte-threlte) |
| Next.js (SSR) | `@3lens/react-bridge` | [nextjs-ssr](#next-js-ssr) |
| Electron | `@3lens/core` | [electron-desktop](#electron-desktop) |

---

## Vanilla Three.js

The vanilla example demonstrates 3Lens integration without any UI framework—just pure Three.js.

### Features Demonstrated

- **Scene Setup**: Complete Three.js scene with camera, renderer, lights, and objects
- **3Lens Integration**: Full probe and overlay setup
- **Shadow Mapping**: DirectionalLight, PointLight, and SpotLight with shadow maps
- **Materials**: Various material types (Standard, Physical, Lambert)
- **Textures**: Canvas-generated textures
- **Animation**: Animated objects with rotation and orbit movements
- **OrbitControls**: Camera controls for scene exploration
- **Transform Gizmo**: Interactive object manipulation
- **Performance Monitoring**: Real-time FPS, draw calls, and memory tracking

### Quick Start

```bash
# From the 3Lens root directory
pnpm install

# Run this example
cd examples/framework-integration/vanilla-threejs
pnpm dev
```

Open http://localhost:3000 in your browser.

### Project Structure

```
vanilla-threejs/
├── src/
│   ├── main.ts          # Main application entry point
│   └── benchmark.ts     # Performance benchmark page
├── index.html           # Main HTML file
├── benchmark.html       # Benchmark HTML file
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Import 3Lens Packages

::: code-group
```typescript [TypeScript]
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
```

```javascript [JavaScript]
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
```
:::

#### Step 2: Create Your Three.js Scene

```typescript
// Standard Three.js setup
const scene = new THREE.Scene();
scene.name = 'MainScene'; // Naming helps in the devtool

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.name = 'MainCamera';
camera.position.set(5, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
```

#### Step 3: Create the Probe

```typescript
const probe = createProbe({
  appName: 'Vanilla Three.js Example',
});

// Connect renderer and scene
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Set THREE reference for advanced features
probe.setThreeReference(THREE);
```

#### Step 4: Initialize Transform Controls (Optional)

```typescript
// Enable transform gizmo for interactive object manipulation
await probe.initializeTransformGizmo(camera, renderer.domElement);

// Enable camera controller for viewport navigation
await probe.initializeCameraController(camera, renderer.domElement);
```

#### Step 5: Create the Overlay

```typescript
const overlay = createOverlay(probe);
```

#### Step 6: Add Objects to Scene

```typescript
// Create geometry and material
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
  name: 'CubeMaterial', // Name materials for easy identification
  color: 0x60a5fa,
  roughness: 0.3,
  metalness: 0.7,
});

const cube = new THREE.Mesh(geometry, material);
cube.name = 'AnimatedCube'; // Name objects for the scene tree
cube.castShadow = true;
scene.add(cube);
```

#### Step 7: Render Loop

```typescript
function animate() {
  requestAnimationFrame(animate);
  
  // Your animation logic
  cube.rotation.y += 0.01;
  
  // Render the scene
  renderer.render(scene, camera);
}
animate();
```

### Best Practices

1. **Name your objects**: Setting `object.name` makes the scene tree much more readable
2. **Name materials and geometries**: Helps identify resources in the devtool panels
3. **Share geometries**: Multiple meshes can share the same geometry instance
4. **Use development-only imports**: Tree-shake 3Lens in production builds

### Development-Only Setup

::: code-group
```typescript [TypeScript]
let probe: DevtoolProbe | null = null;

if (import.meta.env.DEV) {
  const { createProbe } = await import('@3lens/core');
  const { createOverlay } = await import('@3lens/overlay');
  
  probe = createProbe({ appName: 'My App' });
  probe.observeRenderer(renderer);
  probe.observeScene(scene);
  createOverlay(probe);
}
```

```javascript [JavaScript]
let probe = null;

if (import.meta.env.DEV) {
  const { createProbe } = await import('@3lens/core');
  const { createOverlay } = await import('@3lens/overlay');
  
  probe = createProbe({ appName: 'My App' });
  probe.observeRenderer(renderer);
  probe.observeScene(scene);
  createOverlay(probe);
}
```
:::

---

## React Three Fiber

The React Three Fiber (R3F) example demonstrates declarative 3D scene creation with React and full 3Lens integration.

### Features Demonstrated

- **ThreeLensProvider**: Context provider for 3Lens probe
- **ThreeLensCanvas**: R3F Canvas wrapper with automatic 3Lens setup
- **useDevtoolEntity**: Hook for registering entities with the devtool
- **useFPS / useDrawCalls**: Real-time performance metric hooks
- **Animated components**: Rotating box, bouncing sphere, orbital torus group
- **Lighting setup**: Ambient, directional (with shadows), and point lights
- **Interactive meshes**: Hover and click states

### Quick Start

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-react-three-fiber dev
```

Open http://localhost:3001 in your browser.

### Project Structure

```
react-three-fiber/
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Main app with ThreeLensProvider
│   └── components/
│       ├── Scene.tsx      # Main scene composition
│       ├── RotatingBox.tsx    # Animated box with useDevtoolEntity
│       ├── AnimatedSphere.tsx # Bouncing sphere with metrics hooks
│       ├── TorusGroup.tsx     # Group of orbital toruses
│       ├── Ground.tsx         # Ground plane
│       ├── Lights.tsx         # Scene lighting
│       └── LoadingFallback.tsx # Suspense fallback
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Wrap App with ThreeLensProvider

::: code-group
```tsx [TypeScript (TSX)]
import { ThreeLensProvider } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider appName="My R3F App">
      {/* Your app content */}
    </ThreeLensProvider>
  );
}
```

```jsx [JavaScript (JSX)]
import { ThreeLensProvider } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider appName="My R3F App">
      {/* Your app content */}
    </ThreeLensProvider>
  );
}
```
:::

#### Step 2: Use ThreeLensCanvas

Replace the standard R3F `Canvas` with `ThreeLensCanvas`:

::: code-group
```tsx [TypeScript (TSX)]
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider appName="My R3F App">
      <ThreeLensCanvas 
        shadows 
        camera={{ position: [5, 5, 8], fov: 60 }}
      >
        <Scene />
      </ThreeLensCanvas>
    </ThreeLensProvider>
  );
}
```

```jsx [JavaScript (JSX)]
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider appName="My R3F App">
      <ThreeLensCanvas 
        shadows 
        camera={{ position: [5, 5, 8], fov: 60 }}
      >
        <Scene />
      </ThreeLensCanvas>
    </ThreeLensProvider>
  );
}
```
:::

#### Step 3: Register Entities with useDevtoolEntity

::: code-group
```tsx [TypeScript (TSX)]
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDevtoolEntity } from '@3lens/react-bridge';
import type { Mesh } from 'three';

function RotatingBox() {
  const meshRef = useRef<Mesh>(null!);
  
  // Register with 3Lens devtool
  useDevtoolEntity(meshRef, {
    name: 'RotatingBox',
    module: 'scene/objects',
    tags: ['animated', 'interactive'],
    metadata: { description: 'A colorful rotating cube' },
  });
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta;
  });
  
  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4ecdc4" />
    </mesh>
  );
}
```

```jsx [JavaScript (JSX)]
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDevtoolEntity } from '@3lens/react-bridge';

function RotatingBox() {
  const meshRef = useRef(null);
  
  // Register with 3Lens devtool
  useDevtoolEntity(meshRef, {
    name: 'RotatingBox',
    module: 'scene/objects',
    tags: ['animated', 'interactive'],
    metadata: { description: 'A colorful rotating cube' },
  });
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta;
  });
  
  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4ecdc4" />
    </mesh>
  );
}
```
:::

#### Step 4: Access Real-time Metrics

::: code-group
```tsx [TypeScript (TSX)]
import { useFPS, useDrawCalls, useTriangles } from '@3lens/react-bridge';

function PerformanceDisplay() {
  const fps = useFPS();
  const drawCalls = useDrawCalls();
  const triangles = useTriangles();
  
  return (
    <div className="stats-panel">
      <div>FPS: {fps.toFixed(0)}</div>
      <div>Draw Calls: {drawCalls}</div>
      <div>Triangles: {triangles.toLocaleString()}</div>
    </div>
  );
}
```

```jsx [JavaScript (JSX)]
import { useFPS, useDrawCalls, useTriangles } from '@3lens/react-bridge';

function PerformanceDisplay() {
  const fps = useFPS();
  const drawCalls = useDrawCalls();
  const triangles = useTriangles();
  
  return (
    <div className="stats-panel">
      <div>FPS: {fps.toFixed(0)}</div>
      <div>Draw Calls: {drawCalls}</div>
      <div>Triangles: {triangles.toLocaleString()}</div>
    </div>
  );
}
```
:::

### Best Practices

1. **Use ThreeLensCanvas**: It automatically sets up the probe with R3F's internal state
2. **Register logical entities**: Use `useDevtoolEntity` to track React components in the devtool
3. **Place provider at root**: ThreeLensProvider should wrap your entire 3D app section
4. **Metrics hooks are reactive**: They update every frame, use React.memo for expensive UI

---

## Angular Three.js

The Angular example demonstrates 3Lens integration with Angular's dependency injection and RxJS observables.

### Features Demonstrated

- **ThreeLensModule**: Angular module for 3Lens integration
- **ThreeSceneService**: Injectable service managing the Three.js scene
- **DevtoolProbe**: Direct probe creation and attachment
- **RxJS Integration**: Reactive metrics via BehaviorSubject/Observable
- **NgZone Optimization**: Animation loop runs outside Angular zone

### Quick Start

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-angular-threejs dev
```

Open http://localhost:3002 in your browser.

### Project Structure

```
angular-threejs/
├── src/
│   ├── main.ts                    # Angular bootstrap
│   ├── index.html                 # HTML entry
│   ├── styles.css                 # Global styles
│   └── app/
│       ├── app.component.ts       # Root component with metrics display
│       ├── components/
│       │   └── scene-canvas.component.ts  # Canvas rendering component
│       └── services/
│           └── three-scene.service.ts     # Three.js scene management
├── angular.json
├── package.json
└── tsconfig.json
```

### Step-by-Step Walkthrough

#### Step 1: Create a Scene Service

```typescript
// services/three-scene.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as THREE from 'three';
import { createProbe, DevtoolProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

@Injectable({ providedIn: 'root' })
export class ThreeSceneService {
  private probe!: DevtoolProbe;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;

  // Expose metrics as observables
  private fpsSubject = new BehaviorSubject<number>(0);
  private drawCallsSubject = new BehaviorSubject<number>(0);
  
  fps$ = this.fpsSubject.asObservable();
  drawCalls$ = this.drawCallsSubject.asObservable();

  initialize(canvas: HTMLCanvasElement): void {
    // Create Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    
    // Create 3Lens probe
    this.probe = createProbe({
      appName: 'Angular Three.js App'
    });
    
    this.probe.observeRenderer(this.renderer);
    this.probe.observeScene(this.scene);
    
    // Subscribe to metrics
    this.probe.on('frame', (stats) => {
      this.fpsSubject.next(stats.fps);
      this.drawCallsSubject.next(stats.drawCalls);
    });
    
    // Create overlay
    bootstrapOverlay(this.probe);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
```

#### Step 2: Create Canvas Component

```typescript
// components/scene-canvas.component.ts
import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ThreeSceneService } from '../services/three-scene.service';

@Component({
  selector: 'app-scene-canvas',
  template: '<canvas #canvas></canvas>',
  styles: ['canvas { width: 100%; height: 100%; display: block; }']
})
export class SceneCanvasComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private animationId = 0;

  constructor(
    private sceneService: ThreeSceneService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.sceneService.initialize(this.canvasRef.nativeElement);
    
    // Run animation outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.sceneService.render();
  };
}
```

#### Step 3: Display Metrics in Component

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ThreeSceneService } from './services/three-scene.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, SceneCanvasComponent],
  template: `
    <app-scene-canvas></app-scene-canvas>
    <div class="stats-overlay">
      <div>FPS: {{ sceneService.fps$ | async | number:'1.0-0' }}</div>
      <div>Draw Calls: {{ sceneService.drawCalls$ | async }}</div>
    </div>
  `
})
export class AppComponent {
  constructor(public sceneService: ThreeSceneService) {}
}
```

### Best Practices

1. **Run outside NgZone**: The animation loop should run outside Angular's zone to avoid unnecessary change detection
2. **Use RxJS**: Expose metrics as observables for seamless Angular integration
3. **Inject services**: Use Angular's DI for the scene service
4. **Use signals (Angular 16+)**: Consider using signals for simpler reactive state

### Angular Signals Integration (Angular 16+)

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThreeSceneService {
  // Use signals for reactive state
  readonly fps = signal<number>(0);
  readonly drawCalls = signal<number>(0);
  readonly triangles = signal<number>(0);
  
  // Computed values
  readonly isPerformant = computed(() => this.fps() >= 55);
  
  // ... rest of service
}
```

---

## Vue TresJS

The Vue + TresJS example demonstrates declarative 3D scene creation with Vue 3's composition API.

### Features Demonstrated

- **TresCanvas**: TresJS canvas component with shadows and camera config
- **Declarative 3D**: Vue-style declarative Three.js scene graph
- **useRenderLoop**: TresJS animation loop hook
- **Composables**: Vue 3 composition API for 3Lens integration
- **Animated Components**: Rotating box, bouncing sphere, orbital toruses

### Quick Start

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-vue-tresjs dev
```

Open http://localhost:3003 in your browser.

### Project Structure

```
vue-tresjs/
├── src/
│   ├── main.ts                  # Vue app entry
│   ├── App.vue                  # Root component with TresCanvas
│   ├── composables/
│   │   └── useThreeLensSetup.ts # 3Lens metrics composable
│   └── components/
│       ├── Scene.vue            # Main scene composition
│       ├── RotatingBox.vue      # Animated rotating cube
│       ├── AnimatedSphere.vue   # Bouncing sphere
│       ├── TorusGroup.vue       # Group of orbital toruses
│       ├── Ground.vue           # Ground plane
│       ├── Lights.vue           # Scene lighting
│       └── InfoPanel.vue        # Metrics display
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Create a 3Lens Composable

::: code-group
```typescript [TypeScript]
// composables/useThreeLensSetup.ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { useTres } from '@tresjs/core';
import { createProbe, type DevtoolProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

export function useThreeLensSetup() {
  const fps: Ref<number> = ref(0);
  const drawCalls: Ref<number> = ref(0);
  const triangles: Ref<number> = ref(0);
  
  let probe: DevtoolProbe | null = null;
  
  onMounted(() => {
    const { renderer, scene } = useTres();
    
    if (renderer.value && scene.value) {
      probe = createProbe({ appName: 'Vue TresJS App' });
      probe.observeRenderer(renderer.value);
      probe.observeScene(scene.value);
      
      probe.on('frame', (stats) => {
        fps.value = stats.fps;
        drawCalls.value = stats.drawCalls;
        triangles.value = stats.triangles;
      });
      
      bootstrapOverlay(probe);
    }
  });
  
  onUnmounted(() => {
    probe?.dispose();
  });
  
  return { fps, drawCalls, triangles };
}
```

```javascript [JavaScript]
// composables/useThreeLensSetup.js
import { ref, onMounted, onUnmounted } from 'vue';
import { useTres } from '@tresjs/core';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

export function useThreeLensSetup() {
  const fps = ref(0);
  const drawCalls = ref(0);
  const triangles = ref(0);
  
  let probe = null;
  
  onMounted(() => {
    const { renderer, scene } = useTres();
    
    if (renderer.value && scene.value) {
      probe = createProbe({ appName: 'Vue TresJS App' });
      probe.observeRenderer(renderer.value);
      probe.observeScene(scene.value);
      
      probe.on('frame', (stats) => {
        fps.value = stats.fps;
        drawCalls.value = stats.drawCalls;
        triangles.value = stats.triangles;
      });
      
      bootstrapOverlay(probe);
    }
  });
  
  onUnmounted(() => {
    probe?.dispose();
  });
  
  return { fps, drawCalls, triangles };
}
```
:::

#### Step 2: Use TresCanvas

```vue
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import Scene from './components/Scene.vue';
</script>

<template>
  <TresCanvas 
    shadows 
    :camera="{ position: [5, 5, 8], fov: 60 }"
    :renderer="{ antialias: true }"
  >
    <Scene />
  </TresCanvas>
</template>
```

#### Step 3: Animate with useRenderLoop

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { useRenderLoop } from '@tresjs/core';
import type { Mesh } from 'three';

const meshRef = shallowRef<Mesh | null>(null);

const { onLoop } = useRenderLoop();

onLoop(({ delta }) => {
  if (meshRef.value) {
    meshRef.value.rotation.y += delta;
  }
});
</script>

<template>
  <TresMesh ref="meshRef" cast-shadow>
    <TresBoxGeometry :args="[1, 1, 1]" />
    <TresMeshStandardMaterial color="#4ecdc4" />
  </TresMesh>
</template>
```

#### Step 4: Display Metrics

```vue
<script setup lang="ts">
import { useThreeLensSetup } from '../composables/useThreeLensSetup';

const { fps, drawCalls, triangles } = useThreeLensSetup();
</script>

<template>
  <div class="info-panel">
    <div>FPS: {{ fps.toFixed(0) }}</div>
    <div>Draw Calls: {{ drawCalls }}</div>
    <div>Triangles: {{ triangles.toLocaleString() }}</div>
  </div>
</template>
```

### Best Practices

1. **Use shallowRef for Three.js objects**: Prevents Vue from making them deeply reactive
2. **Access renderer from useTres**: TresJS provides the renderer through its composable
3. **Use onLoop for animations**: Integrates with TresJS's render loop
4. **Dispose probe on unmount**: Clean up resources when component is destroyed

---

## Svelte Threlte

The Svelte + Threlte example demonstrates 3Lens integration with Svelte's reactive stores.

### Features Demonstrated

- **Threlte Canvas**: Svelte-native Three.js rendering
- **Declarative 3D**: `<T.Mesh>`, `<T.Group>`, and other Threlte components
- **useTask**: Threlte's animation loop hook
- **Svelte Stores**: Reactive metrics with writable stores
- **Interactive Components**: Hover and click events on meshes

### Quick Start

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-svelte-threlte dev
```

Open http://localhost:3007 in your browser.

### Project Structure

```
svelte-threlte/
├── src/
│   ├── main.ts                    # Svelte app entry
│   ├── App.svelte                 # Root component with Canvas
│   ├── app.d.ts                   # TypeScript declarations
│   └── lib/
│       ├── useThreeLens.ts        # 3Lens metrics store
│       └── components/
│           ├── Scene.svelte       # Main scene composition
│           ├── RotatingBox.svelte # Animated rotating cube
│           ├── AnimatedSphere.svelte # Bouncing sphere
│           ├── TorusGroup.svelte  # Group of orbital toruses
│           ├── Ground.svelte      # Ground plane
│           ├── Lights.svelte      # Scene lighting
│           └── InfoPanel.svelte   # Metrics display
├── index.html
├── package.json
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Create a 3Lens Store

::: code-group
```typescript [TypeScript]
// lib/useThreeLens.ts
import { writable, type Writable } from 'svelte/store';
import { useThrelte } from '@threlte/core';
import { onMount, onDestroy } from 'svelte';
import { createProbe, type DevtoolProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

export function useThreeLens() {
  const fps: Writable<number> = writable(0);
  const drawCalls: Writable<number> = writable(0);
  const triangles: Writable<number> = writable(0);
  
  let probe: DevtoolProbe | null = null;
  
  onMount(() => {
    const { renderer, scene } = useThrelte();
    
    probe = createProbe({ appName: 'Svelte Threlte App' });
    probe.observeRenderer(renderer);
    probe.observeScene(scene);
    
    probe.on('frame', (stats) => {
      fps.set(stats.fps);
      drawCalls.set(stats.drawCalls);
      triangles.set(stats.triangles);
    });
    
    bootstrapOverlay(probe);
  });
  
  onDestroy(() => {
    probe?.dispose();
  });
  
  return { fps, drawCalls, triangles };
}
```

```javascript [JavaScript]
// lib/useThreeLens.js
import { writable } from 'svelte/store';
import { useThrelte } from '@threlte/core';
import { onMount, onDestroy } from 'svelte';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

export function useThreeLens() {
  const fps = writable(0);
  const drawCalls = writable(0);
  const triangles = writable(0);
  
  let probe = null;
  
  onMount(() => {
    const { renderer, scene } = useThrelte();
    
    probe = createProbe({ appName: 'Svelte Threlte App' });
    probe.observeRenderer(renderer);
    probe.observeScene(scene);
    
    probe.on('frame', (stats) => {
      fps.set(stats.fps);
      drawCalls.set(stats.drawCalls);
      triangles.set(stats.triangles);
    });
    
    bootstrapOverlay(probe);
  });
  
  onDestroy(() => {
    probe?.dispose();
  });
  
  return { fps, drawCalls, triangles };
}
```
:::

#### Step 2: Use Threlte Canvas

```svelte
<script>
  import { Canvas } from '@threlte/core';
  import Scene from './lib/components/Scene.svelte';
</script>

<Canvas>
  <Scene />
</Canvas>
```

#### Step 3: Animate with useTask

```svelte
<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import type { Mesh } from 'three';
  
  let mesh: Mesh;
  
  useTask((delta) => {
    if (mesh) {
      mesh.rotation.y += delta;
    }
  });
</script>

<T.Mesh bind:ref={mesh} castShadow>
  <T.BoxGeometry args={[1, 1, 1]} />
  <T.MeshStandardMaterial color="#4ecdc4" />
</T.Mesh>
```

#### Step 4: Display Metrics

```svelte
<script lang="ts">
  import { useThreeLens } from '../useThreeLens';
  
  const { fps, drawCalls, triangles } = useThreeLens();
</script>

<div class="info-panel">
  <div>FPS: {$fps.toFixed(0)}</div>
  <div>Draw Calls: {$drawCalls}</div>
  <div>Triangles: {$triangles.toLocaleString()}</div>
</div>
```

### Best Practices

1. **Use Svelte stores**: Writable stores integrate naturally with Svelte's reactivity
2. **Access from useThrelte**: Get renderer/scene from Threlte's context
3. **Use `$` syntax**: Auto-subscribe to stores in templates
4. **Dispose on destroy**: Clean up the probe when component unmounts

---

## Next.js SSR

The Next.js example demonstrates proper handling of server-side rendering (SSR) constraints with Three.js.

### The SSR Challenge

Three.js and WebGL cannot run on the server because they require access to the DOM and browser APIs. This example shows patterns for:

- **Dynamic imports** with `ssr: false` to load 3D components client-only
- **`'use client'` directive** for React Server Components compatibility
- **Loading states** while the 3D scene initializes
- **Hydration** without errors

### Quick Start

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-nextjs-ssr dev
```

Open http://localhost:3008 in your browser.

### Project Structure

```
nextjs-ssr/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with metadata
│   │   ├── page.tsx        # Home page with dynamic import
│   │   └── globals.css     # Global styles
│   └── components/
│       ├── Scene3D.tsx     # Main 3D scene (client-only)
│       ├── RotatingBox.tsx # Animated box
│       ├── AnimatedSphere.tsx # Bouncing sphere
│       ├── TorusGroup.tsx  # Orbital toruses
│       ├── Ground.tsx      # Ground plane
│       ├── Lights.tsx      # Scene lighting
│       ├── InfoPanel.tsx   # Metrics display
│       └── index.ts        # Component exports
├── next.config.js
├── package.json
└── tsconfig.json
```

### Step-by-Step Walkthrough

#### Step 1: Dynamic Import with SSR Disabled

::: code-group
```tsx [TypeScript (TSX)]
// app/page.tsx
import dynamic from 'next/dynamic';

// Dynamically import the 3D scene with SSR disabled
const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,  // ⚠️ Critical: Disable server-side rendering
  loading: () => (
    <div className="loading-container">
      <div className="spinner" />
      <p>Loading 3D Scene...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main>
      <Scene3D />
    </main>
  );
}
```

```jsx [JavaScript (JSX)]
// app/page.jsx
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,
  loading: () => (
    <div className="loading-container">
      <div className="spinner" />
      <p>Loading 3D Scene...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main>
      <Scene3D />
    </main>
  );
}
```
:::

#### Step 2: Mark Components as Client-Only

All components using Three.js must have the `'use client'` directive:

::: code-group
```tsx [TypeScript (TSX)]
// components/Scene3D.tsx
'use client';

import { Suspense } from 'react';
import { ThreeLensProvider, ThreeLensCanvas } from '@3lens/react-bridge';
import { RotatingBox } from './RotatingBox';
import { Lights } from './Lights';

export default function Scene3D() {
  return (
    <ThreeLensProvider appName="Next.js SSR Example">
      <ThreeLensCanvas 
        shadows 
        camera={{ position: [5, 5, 8], fov: 60 }}
      >
        <Suspense fallback={null}>
          <Lights />
          <RotatingBox />
        </Suspense>
      </ThreeLensCanvas>
    </ThreeLensProvider>
  );
}
```

```jsx [JavaScript (JSX)]
// components/Scene3D.jsx
'use client';

import { Suspense } from 'react';
import { ThreeLensProvider, ThreeLensCanvas } from '@3lens/react-bridge';
import { RotatingBox } from './RotatingBox';
import { Lights } from './Lights';

export default function Scene3D() {
  return (
    <ThreeLensProvider appName="Next.js SSR Example">
      <ThreeLensCanvas 
        shadows 
        camera={{ position: [5, 5, 8], fov: 60 }}
      >
        <Suspense fallback={null}>
          <Lights />
          <RotatingBox />
        </Suspense>
      </ThreeLensCanvas>
    </ThreeLensProvider>
  );
}
```
:::

#### Step 3: Client-Side Only Check (Optional Safety)

For extra safety, you can add a client-side check:

```tsx
'use client';

import { useState, useEffect } from 'react';

export default function Scene3D() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything server-side
  if (!isClient) return null;

  return (
    <ThreeLensProvider>
      <ThreeLensCanvas>
        {/* ... */}
      </ThreeLensCanvas>
    </ThreeLensProvider>
  );
}
```

#### Step 4: Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile 3Lens packages if needed
  transpilePackages: ['@3lens/core', '@3lens/overlay', '@3lens/react-bridge'],
  
  // Webpack configuration for Three.js
  webpack: (config) => {
    // Handle Three.js imports
    config.resolve.alias = {
      ...config.resolve.alias,
      three: require.resolve('three'),
    };
    return config;
  },
};

module.exports = nextConfig;
```

### Best Practices

1. **Always use `ssr: false`**: Three.js cannot run on the server
2. **Add `'use client'`**: Required for all WebGL-using components
3. **Provide loading states**: Show feedback while the 3D scene loads
4. **Transpile packages**: Some dependencies may need transpilation
5. **Handle hydration**: Ensure client render matches server expectations

### Common Pitfalls

| Issue | Solution |
|-------|----------|
| "window is not defined" | Use dynamic import with `ssr: false` |
| "document is not defined" | Add `'use client'` directive |
| Hydration mismatch | Return `null` on server, render on client |
| Module not found | Add to `transpilePackages` in config |

---

## Electron Desktop

The Electron example demonstrates 3Lens integration in a native desktop application.

### Features Demonstrated

- **Electron Main Process**: App window creation and IPC communication
- **Preload Script**: Secure API bridge between main and renderer
- **Context Isolation**: Secure renderer with contextBridge
- **GPU Info Access**: Electron-specific GPU information
- **Native Title Bar**: Custom draggable title bar
- **3Lens Integration**: Full devtool overlay in desktop app

### Quick Start

```bash
# From the monorepo root
pnpm install

# Development mode (Vite + Electron)
pnpm --filter @3lens/example-electron-desktop dev

# Build for production
pnpm --filter @3lens/example-electron-desktop build

# Package as distributable
pnpm --filter @3lens/example-electron-desktop package
```

### Project Structure

```
electron-desktop/
├── src/
│   ├── main/
│   │   ├── main.ts          # Electron main process
│   │   └── preload.ts       # Preload script for IPC bridge
│   └── renderer/
│       ├── index.html       # Renderer HTML
│       └── main.ts          # Three.js scene with 3Lens
├── package.json
├── tsconfig.json
├── tsconfig.main.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Main Process Setup

```typescript
// src/main/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,      // Security: Don't allow Node.js in renderer
      contextIsolation: true,      // Security: Isolate renderer context
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load Vite dev server or built files
  if (isDev) {
    mainWindow.loadURL('http://localhost:3009');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

// Handle IPC for GPU info
ipcMain.handle('get-gpu-info', () => {
  return app.getGPUFeatureStatus();
});

ipcMain.handle('get-app-metrics', () => {
  return app.getAppMetrics();
});

app.whenReady().then(createWindow);
```

#### Step 2: Preload Script for Secure IPC

```typescript
// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // GPU information
  getGpuInfo: () => ipcRenderer.invoke('get-gpu-info'),
  
  // App performance metrics
  getAppMetrics: () => ipcRenderer.invoke('get-app-metrics'),
  
  // Platform info
  platform: process.platform,
  
  // App version
  appVersion: process.env.npm_package_version || '0.0.0',
});
```

#### Step 3: Type Definitions for Renderer

```typescript
// src/renderer/electron.d.ts
interface ElectronAPI {
  getGpuInfo: () => Promise<Electron.GPUFeatureStatus>;
  getAppMetrics: () => Promise<Electron.ProcessMetric[]>;
  platform: NodeJS.Platform;
  appVersion: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
```

#### Step 4: Renderer with 3Lens

```typescript
// src/renderer/main.ts
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

// Create Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Setup 3Lens probe
const probe = createProbe({ appName: 'My Electron App' });
probe.observeRenderer(renderer);
probe.observeScene(scene);
bootstrapOverlay(probe);

// Access Electron APIs
if (window.electronAPI) {
  // Display platform info
  console.log('Platform:', window.electronAPI.platform);
  
  // Get GPU feature status
  window.electronAPI.getGpuInfo().then((gpuInfo) => {
    console.log('GPU Features:', gpuInfo);
  });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

#### Step 5: Vite Configuration for Electron

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/renderer',
  base: './', // Important for Electron file:// protocol
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  server: {
    port: 3009,
  },
});
```

### Best Practices

1. **Use context isolation**: Never disable contextIsolation in production
2. **Expose only needed APIs**: Use contextBridge to expose minimal APIs
3. **Handle both dev and prod**: Support both Vite dev server and built files
4. **Use preload scripts**: Bridge main and renderer processes safely
5. **Type your APIs**: Create type definitions for exposed APIs

### Electron-Specific Features

```typescript
// Access GPU info in 3Lens custom panel
probe.on('frame', async () => {
  if (window.electronAPI) {
    const gpuStatus = await window.electronAPI.getGpuInfo();
    
    // Custom metrics for Electron
    probe.setCustomMetric('gpu.webgl', gpuStatus.webgl);
    probe.setCustomMetric('gpu.webgl2', gpuStatus.webgl2);
  }
});
```

---

## Running All Examples

To run all examples simultaneously:

```bash
# From the monorepo root
pnpm install
pnpm dev
```

This starts all examples on different ports:

| Example | Port | URL |
|---------|------|-----|
| Vanilla Three.js | 3000 | http://localhost:3000 |
| React Three Fiber | 3001 | http://localhost:3001 |
| Angular | 3002 | http://localhost:3002 |
| Vue TresJS | 3003 | http://localhost:3003 |
| Svelte Threlte | 3007 | http://localhost:3007 |
| Next.js SSR | 3008 | http://localhost:3008 |
| Electron | 3009 | Desktop app |

## See Also

- [Getting Started Guide](/guide/getting-started) - Basic 3Lens setup
- [React/R3F Guide](/guides/REACT-R3F-GUIDE) - Deep dive into React integration
- [Angular Guide](/guides/ANGULAR-GUIDE) - Deep dive into Angular integration
- [Vue/TresJS Guide](/guides/VUE-TRESJS-GUIDE) - Deep dive into Vue integration
- [Code Examples](/examples/code-examples) - Copy-paste code snippets
- [API Reference](/api/) - Full API documentation
