# 3Lens Examples

This directory contains example projects demonstrating 3Lens devtool integration with various Three.js setups and frameworks.

## ⚠️ Example Refactoring In Progress

Many examples in this directory are being refactored. The issue: examples were built to showcase their scenarios (render pipelines, particle systems, games, etc.) with their own custom debugging UIs, rather than demonstrating how to use **3Lens** as the debugging tool.

### What's Changing

**Before**: Examples included custom stats panels, property inspectors, timeline UIs, etc.
**After**: Examples should use 3Lens overlay and helpers for all debugging/inspection needs.

### Guidelines

See `EXAMPLE_GUIDELINES.md` for the new pattern all examples should follow.

### Missing Features

Some examples need 3Lens features that don't exist yet. These are tracked in `MISSING_FEATURES.md`.

---

## Available Examples

| Category | Example | Description | Status |
|----------|---------|-------------|--------|
| **Advanced Techniques** | [custom-render-pipeline](./advanced-techniques/custom-render-pipeline) | Deferred rendering pipeline | ✅ Complete |
| | [shadow-comparison](./advanced-techniques/shadow-comparison) | Shadow techniques | ✅ Complete |
| | [environment-mapping](./advanced-techniques/environment-mapping) | Environment/IBL debugging | ✅ Complete |
| | [compute-shaders](./advanced-techniques/compute-shaders) | WebGPU compute | ✅ Complete |
| | [skinned-mesh-inspector](./advanced-techniques/skinned-mesh-inspector) | Skeletal animation | ✅ Complete |
| | [morph-target-analyzer](./advanced-techniques/morph-target-analyzer) | Blend shapes | ✅ Complete |
| **Debugging & Profiling** | [performance-debugging](./debugging-profiling/performance-debugging) | Performance issues lab | ✅ Complete |
| | [memory-leak-detection](./debugging-profiling/memory-leak-detection) | Leak detection | ✅ Complete |
| | [shader-debugging](./debugging-profiling/shader-debugging) | Shader inspection | ✅ Complete |
| | [animation-profiling](./debugging-profiling/animation-profiling) | Animation debugging | ✅ Complete |
| | [draw-call-batching](./debugging-profiling/draw-call-batching) | Batching analysis | ✅ Complete |
| | [large-scene-optimization](./debugging-profiling/large-scene-optimization) | Scene optimization | ✅ Complete |
| | [raycasting-debugger](./debugging-profiling/raycasting-debugger) | Raycasting visualization | ✅ Complete |
| | [texture-optimization](./debugging-profiling/texture-optimization) | Texture analysis | ✅ Complete |
| **Feature Showcase** | [transform-gizmo](./feature-showcase/transform-gizmo) | Transform controls | ✅ Complete |
| | [camera-controls](./feature-showcase/camera-controls) | Camera navigation | ✅ Complete |
| | [visual-overlays](./feature-showcase/visual-overlays) | Debug visualization | ✅ Complete |
| | [custom-plugin](./feature-showcase/custom-plugin) | Plugin system | ✅ Complete |
| | [timeline-recording](./feature-showcase/timeline-recording) | Performance timeline | ✅ Complete |
| | [webgpu-features](./feature-showcase/webgpu-features) | WebGPU-specific features | ✅ Complete |
| | [configuration-rules](./feature-showcase/configuration-rules) | Rules and thresholds | ✅ Complete |
| | [cost-analysis](./feature-showcase/cost-analysis) | Rendering cost analysis | ✅ Complete |
| **Framework Integration** | [vanilla-threejs](./framework-integration/vanilla-threejs) | Basic Three.js + 3Lens | 🔄 In Progress |
| | [react-three-fiber](./framework-integration/react-three-fiber) | React Three Fiber integration | 🔄 In Progress |
| | [vue-tresjs](./framework-integration/vue-tresjs) | Vue 3 + TresJS | 🔄 In Progress |
| | [angular-threejs](./framework-integration/angular-threejs) | Angular + Three.js | 🔄 In Progress |
| | [svelte-threlte](./framework-integration/svelte-threlte) | Svelte + Threlte | 🔄 In Progress |
| | [electron-desktop](./framework-integration/electron-desktop) | Desktop app with Electron | 🔄 In Progress |
| | [nextjs-ssr](./framework-integration/nextjs-ssr) | Next.js SSR | 🔄 In Progress |
| **Real-World Scenarios** | [particle-system](./real-world-scenarios/particle-system) | Particle debugging | 🔄 HTML Done |
| | [physics-inspector](./real-world-scenarios/physics-inspector) | Physics debugging | 🔄 HTML Done |
| | [3d-model-viewer](./real-world-scenarios/3d-model-viewer) | Model inspection | 🔄 HTML Done |
| | [audio-visualization](./real-world-scenarios/audio-visualization) | Audio reactive | 🔄 HTML Done |
| | [multi-scene-management](./real-world-scenarios/multi-scene-management) | Multiple scenes | 🔄 HTML Done |
| | [post-processing](./real-world-scenarios/post-processing) | Post-processing effects | 🔄 HTML Done |
| | [procedural-generation](./real-world-scenarios/procedural-generation) | Procedural content | 🔄 HTML Done |
| | [vr-xr-debugging](./real-world-scenarios/vr-xr-debugging) | VR/XR debugging | 🔄 HTML Done |
| **Game Development** | [platformer-physics](./game-development/platformer-physics) | 2D platformer | ✅ Complete |
| | [racing-game](./game-development/racing-game) | Vehicle physics | ✅ Complete |
| | [first-person-shooter](./game-development/first-person-shooter) | FPS mechanics | ✅ Complete |
| | [top-down-rpg](./game-development/top-down-rpg) | RPG mechanics | ✅ Complete |
| **Data Visualization** | [3d-charts](./data-visualization/3d-charts) | Chart debugging | ✅ Complete |
| | [geographic-data](./data-visualization/geographic-data) | Map visualization | ✅ Complete |
| | [realtime-streaming](./data-visualization/realtime-streaming) | Streaming data | ✅ Complete |
| | [scientific-viz](./data-visualization/scientific-viz) | Scientific visualization | ✅ Complete |

## Running Examples

### Quick Start

From the 3Lens root directory:

```bash
# Install all dependencies
pnpm install

# Run packages + base example (vanilla-threejs)
pnpm dev
```

### Running Specific Examples

```bash
# Interactive example selector
pnpm example

# Run by name
pnpm example vanilla-threejs
pnpm example custom-render-pipeline

# Or run directly from the example directory
cd examples/feature-showcase/transform-gizmo
pnpm dev
```

## Example Structure

Each example follows this structure:

```
example-name/
├── src/
│   └── main.ts       # Entry point with 3Lens integration
├── index.html        # Minimal HTML (canvas only, no custom UI)
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
├── vite.config.ts    # Vite configuration
└── README.md         # What to explore with 3Lens
```

## Basic Integration Pattern

```typescript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// Setup Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Initialize 3Lens
const probe = createProbe({ name: 'My App' });
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Create overlay UI
bootstrapOverlay({ probe, defaultOpen: true });

// Register logical entities for domain concepts
probe.registerLogicalEntity('player', {
  name: 'Player Character',
  type: 'character',
  object3D: playerMesh,
  metadata: { health: 100 }
});
```

## Contributing

When adding or modifying examples:

1. **Read `EXAMPLE_GUIDELINES.md`** - Follow the established pattern
2. **Use 3Lens for debugging** - Don't build custom debug UIs
3. **Focus on the scenario** - Examples should showcase realistic use cases
4. **Document 3Lens usage** - README should explain what to explore
5. **Track missing features** - Add to `MISSING_FEATURES.md` if needed
