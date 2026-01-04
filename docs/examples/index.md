# Examples

Learn 3Lens through practical examples. Each example includes complete source code, setup instructions, and a detailed walkthrough.

## Framework Integration

Get started with 3Lens in your preferred framework:

| Example | Description | Difficulty |
|---------|-------------|------------|
| [Vanilla Three.js](/examples/vanilla-threejs) | Basic setup without any framework | ⭐ Beginner |
| [React Three Fiber](/examples/react-r3f) | Integration with R3F and hooks | ⭐ Beginner |
| [Vue + TresJS](/examples/vue-tresjs) | Using composables with TresJS | ⭐ Beginner |
| [Next.js SSR](/examples/nextjs-ssr) | Server-side rendering considerations | ⭐⭐ Intermediate |
| [Angular](/examples/angular) | Service injection and RxJS | ⭐⭐ Intermediate |

## Debugging Scenarios

Learn to diagnose and fix common issues:

| Example | Description | Difficulty |
|---------|-------------|------------|
| [Performance Debugging](/examples/performance-debugging) | Finding and fixing bottlenecks | ⭐⭐ Intermediate |
| [Memory Leak Detection](/examples/memory-leaks) | Tracking down resource leaks | ⭐⭐ Intermediate |
| [Shader Debugging](/examples/shader-debugging) | Inspecting GLSL/WGSL shaders | ⭐⭐⭐ Advanced |
| [Draw Call Optimization](/examples/draw-calls) | Reducing GPU overhead | ⭐⭐ Intermediate |

## Advanced Usage

Extend and customize 3Lens:

| Example | Description | Difficulty |
|---------|-------------|------------|
| [Custom Plugins](/examples/custom-plugin) | Building your own devtools panel | ⭐⭐⭐ Advanced |
| [WebGPU Features](/examples/webgpu) | WebGPU-specific capabilities | ⭐⭐⭐ Advanced |
| [CI Integration](/examples/ci-testing) | Automated performance testing | ⭐⭐ Intermediate |
| [Custom Rules](/examples/custom-rules) | Defining performance budgets | ⭐⭐ Intermediate |

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
