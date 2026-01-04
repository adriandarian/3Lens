# Getting Started

Get up and running with 3Lens in your three.js project in just a few minutes. This guide covers installation, basic setup, and your first steps with the devtools.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **A three.js application** (v0.150.0 or higher recommended)
- **A package manager** (npm, pnpm, or yarn)

::: tip New to three.js?
3Lens works with any three.js project. If you're just getting started with three.js, check out the [official three.js documentation](https://threejs.org/docs/) first.
:::

## Installation

Install the core package and the overlay UI:

::: code-group

```bash [npm]
npm install @3lens/core @3lens/overlay
```

```bash [pnpm]
pnpm add @3lens/core @3lens/overlay
```

```bash [yarn]
yarn add @3lens/core @3lens/overlay
```

:::

::: tip Framework-Specific Packages
If you're using React Three Fiber, Vue/TresJS, or Angular, install the corresponding bridge package for the best experience:

```bash
# React / React Three Fiber
npm install @3lens/react-bridge

# Vue / TresJS
npm install @3lens/vue-bridge

# Angular
npm install @3lens/angular-bridge
```

See [Framework Integration](#framework-integration) below for setup instructions.
:::

## Basic Setup

### 1. Import 3Lens

```ts
import { createProbe } from '@3lens/core'
import { bootstrapOverlay } from '@3lens/overlay'
```

### 2. Create and Configure the Probe

```ts
// Create a probe instance
const probe = createProbe({
  // Optional configuration
  enabled: true,
  sampling: {
    frameInterval: 1,        // Sample every frame
    historyLength: 120,      // Keep 2 seconds of history at 60fps
  },
  thresholds: {
    maxDrawCalls: 200,       // Warn if draw calls exceed this
    maxTriangles: 1_000_000, // Warn if triangle count exceeds this
    minFPS: 30,              // Warn if FPS drops below this
  }
})
```

### 3. Connect to Your Renderer and Scene

```ts
// Connect to your WebGL or WebGPU renderer
probe.observeRenderer(renderer)

// Connect to your scene(s)
probe.observeScene(scene)

// If you have multiple scenes, you can observe them all
probe.observeScene(uiScene)
probe.observeScene(backgroundScene)
```

### 4. Bootstrap the Overlay

```ts
// Create the visual devtools panel
bootstrapOverlay(probe)
```

### 5. Toggle the Panel

Press **`Ctrl+Shift+D`** (or **`Cmd+Shift+D`** on macOS) to toggle the devtools panel.

::: info What You'll See
The 3Lens overlay provides:
- **Real-time FPS** and frame time monitoring
- **Draw calls and triangle counts** per frame
- **Full scene hierarchy** with expandable tree
- **Object inspector** with transform controls
- **Material, texture, and geometry panels**
- **GPU memory tracking**
- **Performance warnings** when thresholds are exceeded
:::

## Complete Example

Here's a complete vanilla three.js setup:

```ts
import * as THREE from 'three'
import { createProbe } from '@3lens/core'
import { bootstrapOverlay } from '@3lens/overlay'

// Create your three.js scene
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Add some objects
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

// Add lighting
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(5, 5, 5)
scene.add(light)
scene.add(new THREE.AmbientLight(0x404040))

camera.position.z = 5

// 🔧 Set up 3Lens
const probe = createProbe()
probe.observeRenderer(renderer)
probe.observeScene(scene)
bootstrapOverlay(probe)

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
}

animate()
```

## Framework Integration

3Lens provides dedicated integration packages for popular frameworks:

### React Three Fiber

```bash
npm install @3lens/core @3lens/overlay @3lens/react-bridge
```

```tsx
import { Canvas } from '@react-three/fiber'
import { ThreeLensProvider, ThreeLensCanvas } from '@3lens/react-bridge'

function App() {
  return (
    <ThreeLensProvider>
      <ThreeLensCanvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
      </ThreeLensCanvas>
    </ThreeLensProvider>
  )
}
```

[Full React/R3F Guide →](/guide/react-r3f)

### Vue + TresJS

```bash
npm install @3lens/core @3lens/overlay @3lens/vue-bridge
```

```vue
<script setup>
import { TresCanvas } from '@tresjs/core'
import { useThreeLens } from '@3lens/vue-bridge'

const { probe } = useThreeLens()
</script>

<template>
  <TresCanvas>
    <TresPerspectiveCamera :position="[3, 3, 3]" />
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshStandardMaterial color="hotpink" />
    </TresMesh>
    <TresAmbientLight :intensity="0.5" />
  </TresCanvas>
</template>
```

[Full Vue/TresJS Guide →](/guide/vue-tresjs)

### Angular

```bash
npm install @3lens/core @3lens/overlay @3lens/angular-bridge
```

```typescript
import { Component, inject } from '@angular/core'
import { ThreeLensService } from '@3lens/angular-bridge'

@Component({
  selector: 'app-scene',
  template: `<canvas #canvas></canvas>`
})
export class SceneComponent {
  private threeLens = inject(ThreeLensService)
  
  ngAfterViewInit() {
    this.threeLens.observeRenderer(this.renderer)
    this.threeLens.observeScene(this.scene)
  }
}
```

[Full Angular Guide →](/guide/angular)

## Configuration Options

3Lens is highly configurable. Here are the most common options:

```ts
const probe = createProbe({
  // Enable/disable the probe
  enabled: true,
  
  // Sampling configuration
  sampling: {
    frameInterval: 1,      // Sample every N frames
    historyLength: 120,    // Frames to keep in history
  },
  
  // Performance thresholds (triggers warnings)
  thresholds: {
    maxDrawCalls: 200,
    maxTriangles: 1_000_000,
    maxTextureMemory: 512 * 1024 * 1024, // 512MB
    minFPS: 30,
  },
  
  // Custom rules
  rules: [
    {
      name: 'no-unoptimized-textures',
      check: (snapshot) => {
        // Return violations array
      }
    }
  ],
  
  // Plugins
  plugins: [
    // Your custom plugins
  ]
})
```

[Full Configuration Reference →](/guide/advanced/configuration)

## What's Next?

Now that you have 3Lens set up, explore these topics:

- [Scene Inspection](/guide/features/scene-inspection) - Navigate and understand your scene
- [Performance Debugging](/guide/features/performance) - Find and fix bottlenecks
- [Memory Profiling](/guide/features/memory) - Track and prevent memory leaks
- [Plugin Development](/guide/advanced/plugins) - Extend 3Lens for your needs

## Troubleshooting

### Panel doesn't appear

1. Make sure you called `bootstrapOverlay(probe)` after creating the probe
2. Check the browser console for errors
3. Try pressing `Ctrl+Shift+D` to toggle visibility
4. Ensure your renderer is initialized before calling `observeRenderer()`

### Performance impact

3Lens is designed to have minimal performance impact, but you can reduce it further:

```ts
const probe = createProbe({
  sampling: {
    frameInterval: 2,    // Sample every other frame
    historyLength: 60,   // Reduce history buffer
  }
})
```

### Production builds

By default, you should exclude 3Lens from production builds:

```ts
// Only include in development
if (import.meta.env.DEV) {
  const { createProbe } = await import('@3lens/core')
  const { bootstrapOverlay } = await import('@3lens/overlay')
  
  const probe = createProbe()
  probe.observeRenderer(renderer)
  probe.observeScene(scene)
  bootstrapOverlay(probe)
}
```

[More Troubleshooting →](/guide/troubleshooting)

## Next Steps

Now that you have 3Lens running, explore these guides:

<div class="next-steps">

- [**Your First Debugging Session**](/guide/first-debugging-session) - Hands-on walkthrough of debugging a real scene
- [**Configuration Deep Dive**](/guide/configuration) - All configuration options explained
- [**Installation Troubleshooting**](/guide/installation-troubleshooting) - Common issues and solutions

</div>

### Feature Guides

- [Scene Inspection](/guide/features/scene-inspection) - Navigate and understand your scene
- [Performance Debugging](/guide/features/performance) - Find and fix bottlenecks
- [Memory Profiling](/guide/features/memory) - Track and prevent memory leaks
- [Plugin Development](/guide/advanced/plugins) - Extend 3Lens for your needs
