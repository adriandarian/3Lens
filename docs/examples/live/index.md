---
title: Live Examples
description: Interactive 3Lens examples you can run directly in your browser
---

# Live Examples

Explore 3Lens through interactive examples running directly in your browser. Click on any example to try it out, view the source code, and learn how it works.

::: tip Build Examples First
To run live examples locally, build them first:
```bash
pnpm build:examples
```
:::

## Categories

### [🔌 Framework Integration](./framework-integration/)

Get started with 3Lens in your preferred framework.

| Example | Description | Difficulty |
|---------|-------------|------------|
| [Vanilla Three.js](./framework-integration/vanilla-threejs) | Basic setup, no framework | ⭐ Beginner |
| [React Three Fiber](./framework-integration/react-three-fiber) | React hooks integration | ⭐ Beginner |
| [Vue + TresJS](./framework-integration/vue-tresjs) | Vue composables | ⭐ Beginner |
| [Angular](./framework-integration/angular-threejs) | Service injection | ⭐⭐ Intermediate |
| [Svelte + Threlte](./framework-integration/svelte-threlte) | Svelte stores | ⭐⭐ Intermediate |
| [Next.js SSR](./framework-integration/nextjs-ssr) | SSR handling | ⭐⭐ Intermediate |
| [Electron Desktop](./framework-integration/electron-desktop) | Desktop apps | ⭐⭐ Intermediate |

---

### [✨ Feature Showcase](./feature-showcase/)

Explore 3Lens features and capabilities.

| Example | Description | Difficulty |
|---------|-------------|------------|
| [Transform Gizmo](./feature-showcase/transform-gizmo) | Object manipulation | ⭐ Beginner |
| [Camera Controls](./feature-showcase/camera-controls) | Camera debugging | ⭐ Beginner |
| [Visual Overlays](./feature-showcase/visual-overlays) | Debug visualizations | ⭐ Beginner |
| [Configuration Rules](./feature-showcase/configuration-rules) | Performance budgets | ⭐⭐ Intermediate |
| [Cost Analysis](./feature-showcase/cost-analysis) | Rendering costs | ⭐⭐ Intermediate |
| [Timeline Recording](./feature-showcase/timeline-recording) | Scene recording | ⭐⭐ Intermediate |
| [Custom Plugin](./feature-showcase/custom-plugin) | Build your own panels | ⭐⭐⭐ Advanced |
| [WebGPU Features](./feature-showcase/webgpu-features) | WebGPU debugging | ⭐⭐⭐ Advanced |

---

### [🔍 Debugging & Profiling](./debugging-profiling/)

Debug and profile Three.js applications.

| Example | Description | Difficulty |
|---------|-------------|------------|
| [Performance Debugging](./debugging-profiling/performance-debugging) | Find bottlenecks | ⭐⭐ Intermediate |
| [Memory Leak Detection](./debugging-profiling/memory-leak-detection) | Track resource leaks | ⭐⭐ Intermediate |
| [Draw Call Batching](./debugging-profiling/draw-call-batching) | Optimize draw calls | ⭐⭐ Intermediate |
| [Large Scene Optimization](./debugging-profiling/large-scene-optimization) | Handle complex scenes | ⭐⭐ Intermediate |
| [Animation Profiling](./debugging-profiling/animation-profiling) | Animation performance | ⭐⭐ Intermediate |
| [Texture Optimization](./debugging-profiling/texture-optimization) | Texture memory | ⭐⭐ Intermediate |
| [Raycasting Debugger](./debugging-profiling/raycasting-debugger) | Picking/intersection | ⭐⭐ Intermediate |
| [Shader Debugging](./debugging-profiling/shader-debugging) | GLSL/WGSL inspection | ⭐⭐⭐ Advanced |

---

### [🚀 Advanced Techniques](./advanced-techniques/)

Advanced debugging for complex scenarios.

| Example | Description | Difficulty |
|---------|-------------|------------|
| [Environment Mapping](./advanced-techniques/environment-mapping) | HDR and cubemaps | ⭐⭐ Intermediate |
| [Morph Target Analyzer](./advanced-techniques/morph-target-analyzer) | Blend shapes | ⭐⭐ Intermediate |
| [Shadow Comparison](./advanced-techniques/shadow-comparison) | Shadow techniques | ⭐⭐ Intermediate |
| [Skinned Mesh Inspector](./advanced-techniques/skinned-mesh-inspector) | Skeletal animation | ⭐⭐ Intermediate |
| [Compute Shaders](./advanced-techniques/compute-shaders) | WebGPU compute | ⭐⭐⭐ Advanced |
| [Custom Render Pipeline](./advanced-techniques/custom-render-pipeline) | Multi-pass rendering | ⭐⭐⭐ Advanced |

---

### [📊 Data Visualization](./data-visualization/)

Debug data-driven 3D visualizations.

| Example | Description | Difficulty |
|---------|-------------|------------|
| [3D Charts](./data-visualization/3d-charts) | Charts and graphs | ⭐⭐ Intermediate |
| [Geographic Data](./data-visualization/geographic-data) | GIS and maps | ⭐⭐ Intermediate |
| [Scientific Viz](./data-visualization/scientific-viz) | Volume rendering | ⭐⭐⭐ Advanced |
| [Realtime Streaming](./data-visualization/realtime-streaming) | Live data feeds | ⭐⭐⭐ Advanced |

---

### [🎮 Game Development](./game-development/)

Debug Three.js games.

| Example | Description | Difficulty |
|---------|-------------|------------|
| [First-Person Shooter](./game-development/first-person-shooter) | FPS mechanics | ⭐⭐ Intermediate |
| [Platformer Physics](./game-development/platformer-physics) | Jump and collision | ⭐⭐ Intermediate |
| [Top-Down RPG](./game-development/top-down-rpg) | Isometric games | ⭐⭐ Intermediate |
| [Racing Game](./game-development/racing-game) | Vehicle physics | ⭐⭐⭐ Advanced |

---

### [🌍 Real-World Scenarios](./real-world-scenarios/)

Production-ready patterns.

| Example | Description | Difficulty |
|---------|-------------|------------|
| [3D Model Viewer](./real-world-scenarios/3d-model-viewer) | Model loading | ⭐ Beginner |
| [Particle System](./real-world-scenarios/particle-system) | Particle effects | ⭐⭐ Intermediate |
| [Post Processing](./real-world-scenarios/post-processing) | Effect debugging | ⭐⭐ Intermediate |
| [Audio Visualization](./real-world-scenarios/audio-visualization) | Audio-reactive | ⭐⭐ Intermediate |
| [Multi-Scene Management](./real-world-scenarios/multi-scene-management) | Scene switching | ⭐⭐ Intermediate |
| [Procedural Generation](./real-world-scenarios/procedural-generation) | Generated content | ⭐⭐ Intermediate |
| [Physics Inspector](./real-world-scenarios/physics-inspector) | Physics debugging | ⭐⭐⭐ Advanced |
| [VR/XR Debugging](./real-world-scenarios/vr-xr-debugging) | WebXR apps | ⭐⭐⭐ Advanced |

---

## Running Examples Locally

```bash
# Clone the repository
git clone https://github.com/adriandarian/3Lens.git
cd 3Lens

# Install dependencies
pnpm install

# Build examples for docs
pnpm build:examples

# Run docs locally
pnpm docs:dev

# Or run a specific example in dev mode
pnpm example feature-showcase/transform-gizmo
```

## Example Stats

- **Total Examples**: 45
- **Categories**: 7
- **Beginner**: 6
- **Intermediate**: 30
- **Advanced**: 9
