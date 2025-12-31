# Vanilla Three.js Example

A comprehensive example demonstrating 3Lens devtool integration with vanilla Three.js (no framework).

## Features Demonstrated

- **Scene Setup**: Complete Three.js scene with camera, renderer, lights, and objects
- **3Lens Integration**: Full probe and overlay setup
- **Shadow Mapping**: DirectionalLight, PointLight, and SpotLight with shadow maps
- **Materials**: Various material types (Standard, Physical, Lambert)
- **Textures**: Canvas-generated textures
- **Animation**: Animated objects with rotation and orbit movements
- **OrbitControls**: Camera controls for scene exploration
- **Transform Gizmo**: Interactive object manipulation
- **Performance Monitoring**: Real-time FPS, draw calls, and memory tracking

## Quick Start

```bash
# From the 3Lens root directory
pnpm install
pnpm dev

# Or run just this example
cd examples/vanilla-threejs
pnpm dev
```

Then open http://localhost:3000 in your browser.

## Project Structure

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

## Code Walkthrough

### 1. Import 3Lens

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
```

### 2. Create the Probe

```typescript
const probe = createProbe({
  appName: 'My Three.js App',
});
```

### 3. Connect Renderer and Scene

```typescript
probe.observeRenderer(renderer);
probe.observeScene(scene);
```

### 4. (Optional) Set Three.js Reference for Advanced Features

```typescript
import * as THREE from 'three';
probe.setThreeReference(THREE);
```

### 5. Initialize Transform Controls

```typescript
await probe.initializeTransformGizmo(camera, renderer.domElement);
await probe.initializeCameraController(camera, renderer.domElement);
```

### 6. Create the Overlay

```typescript
const overlay = createOverlay(probe);
```

### 7. Render Loop

```typescript
function animate() {
  requestAnimationFrame(animate);
  
  // Your animation code here
  
  renderer.render(scene, camera);
}
animate();
```

## Keyboard Shortcuts

- **Click FAB** (bottom-right) - Open 3Lens menu
- **Ctrl+`** - Toggle overlay visibility
- **Ctrl+K** - Open command palette
- **W** - Toggle wireframe mode
- **G** - Toggle transform gizmo
- **H** - Reset camera to home position
- **F** - Focus on selected object

## Benchmark

Open `/benchmark.html` to run the performance benchmark that tests:

- Scene complexity scaling
- Draw call overhead
- Texture memory impact
- Shadow map performance

## License

MIT

