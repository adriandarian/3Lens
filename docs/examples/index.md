# Examples

Learn 3Lens through practical examples. Each example includes complete source code, setup instructions, and a detailed walkthrough.

## Framework Integration

Get started with 3Lens in your preferred framework:

| Example | Description | Difficulty |
|---------|-------------|------------|
| [Vanilla Three.js](./framework-integration#vanilla-three-js) | Basic setup without any framework | ⭐ Beginner |
| [React Three Fiber](./framework-integration#react-three-fiber) | Integration with R3F and hooks | ⭐ Beginner |
| [Vue + TresJS](./framework-integration#vue-tresjs) | Using composables with TresJS | ⭐ Beginner |
| [Next.js SSR](./framework-integration#next-js-ssr) | Server-side rendering considerations | ⭐⭐ Intermediate |
| [Angular](./framework-integration#angular-three-js) | Service injection and RxJS | ⭐⭐ Intermediate |
| [Svelte + Threlte](./framework-integration#svelte-threlte) | Component-based 3D with Svelte | ⭐⭐ Intermediate |
| [Electron Desktop](./framework-integration#electron-desktop) | Desktop app integration | ⭐⭐ Intermediate |

## Debugging & Profiling

Learn to diagnose and fix common issues:

| Example | Description | Difficulty |
|---------|-------------|------------|
| [Performance Debugging](./debugging-examples#performance-debugging) | Finding and fixing bottlenecks | ⭐⭐ Intermediate |
| [Memory Leak Detection](./debugging-examples#memory-leak-detection) | Tracking down resource leaks | ⭐⭐ Intermediate |
| [Shader Debugging](./debugging-examples#shader-debugging) | Inspecting GLSL/WGSL shaders | ⭐⭐⭐ Advanced |
| [Large Scene Optimization](./debugging-examples#large-scene-optimization) | Scaling techniques for complex scenes | ⭐⭐ Intermediate |

## Feature Showcase

Explore 3Lens capabilities:

| Example | Description | Difficulty |
|---------|-------------|------------|
| [Transform Gizmo](./feature-showcase#transform-gizmo) | Interactive object manipulation | ⭐ Beginner |
| [Custom Plugin](./feature-showcase#custom-plugin) | Building your own devtools panel | ⭐⭐⭐ Advanced |
| [WebGPU Features](./feature-showcase#webgpu-features) | WebGPU-specific capabilities | ⭐⭐⭐ Advanced |
| [Configuration Rules](./feature-showcase#configuration-rules) | Defining performance budgets | ⭐⭐ Intermediate |

## Game Development

Build games with 3Lens debugging:

| Example | Description | Difficulty |
|---------|-------------|------------|
| [First-Person Shooter](./game-development#first-person-shooter) | FPS game debugging setup | ⭐⭐ Intermediate |
| [Top-Down RPG](./game-development#top-down-rpg) | RPG game inspection | ⭐⭐ Intermediate |
| [Racing Game](./game-development#racing-game) | Vehicle physics debugging | ⭐⭐⭐ Advanced |
| [Platformer Physics](./game-development#platformer-physics) | Platform game mechanics | ⭐⭐ Intermediate |

## Real-World Scenarios

Production-ready patterns:

| Example | Description | Difficulty |
|---------|-------------|------------|
| [3D Model Viewer](./real-world-scenarios#_3d-model-viewer) | Model loading and inspection | ⭐ Beginner |
| [Particle System](./real-world-scenarios#particle-system) | Particle effects debugging | ⭐⭐ Intermediate |
| [Physics Inspector](./real-world-scenarios#physics-inspector) | Physics engine integration | ⭐⭐⭐ Advanced |
| [VR/XR Debugging](./real-world-scenarios#vr-xr-debugging) | WebXR development tools | ⭐⭐⭐ Advanced |

## Code Snippets

Ready-to-use code patterns:

| Example | Description | Difficulty |
|---------|-------------|------------|
| [Basic Setup](./code-examples#basic-setup) | Simplest 3Lens integration | ⭐ Beginner |
| [Development-Only Setup](./code-examples#development-only-setup) | Conditional loading for production | ⭐ Beginner |
| [Monitoring Frame Stats](./code-examples#monitoring-frame-stats) | Real-time performance metrics | ⭐⭐ Intermediate |
| [Object Selection Handling](./code-examples#object-selection-handling) | Responding to user selections | ⭐⭐ Intermediate |
| [Custom Performance Rules](./code-examples#custom-performance-rules) | Setting performance budgets | ⭐⭐ Intermediate |
| [Transform Gizmo Setup](./code-examples#transform-gizmo-setup) | Interactive object controls | ⭐⭐ Intermediate |
| [Camera Controls](./code-examples#camera-controls) | Viewport navigation | ⭐⭐ Intermediate |
| [Logical Entities](./code-examples#logical-entities) | Grouping related objects | ⭐⭐ Intermediate |
| [Resource Tracking](./code-examples#resource-tracking-leak-detection) | Memory leak detection | ⭐⭐⭐ Advanced |
| [Plugin Development](./code-examples#plugin-development) | Extending 3Lens | ⭐⭐⭐ Advanced |
| [WebGPU Support](./code-examples#webgpu-support) | WebGPU renderer integration | ⭐⭐⭐ Advanced |

## Running Examples Locally

All examples are available in the repository under `/examples`:

```bash
# Clone the repository
git clone https://github.com/adriandarian/3Lens.git
cd 3Lens

# Install dependencies
pnpm install

# Run a specific example
cd examples/framework-integration/react-three-fiber
pnpm dev
```

## Live Demos

Try 3Lens directly in your browser:

::: info Coming Soon
StackBlitz and CodeSandbox examples are being prepared. Check back soon!
:::

## Contributing Examples

Have an interesting use case? We welcome example contributions!

1. Create a new directory in `/examples`
2. Include a README with setup instructions
3. Add clear comments explaining key concepts
4. Submit a pull request

See [Contributing](/contributing) for guidelines.
