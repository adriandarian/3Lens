# What is 3Lens?

3Lens is a comprehensive developer toolkit designed specifically for three.js applications. It provides real-time debugging, performance monitoring, and scene inspection capabilities that help you build better WebGL and WebGPU experiences.

## The Problem

Building three.js applications is challenging. You're dealing with:

- **Complex scene graphs** with hundreds or thousands of objects
- **Performance mysteries** where frame rates drop without obvious cause  
- **Memory leaks** from textures and geometries that aren't properly disposed
- **Invisible state** locked inside WebGL/WebGPU contexts
- **Framework abstractions** that add layers between you and three.js

Traditional browser devtools weren't built for 3D graphics. You need specialized tools.

## The Solution

3Lens gives you visibility into everything happening in your three.js application:

### 🔍 Scene Inspection

Navigate your entire scene graph as an interactive tree. Click any object to see its:
- Transform (position, rotation, scale)
- Material properties
- Geometry statistics
- Custom user data
- Parent/child relationships

### 📊 Performance Monitoring

Real-time metrics updated every frame:
- **FPS** - Current, average, and minimum frame rates
- **Frame time** - How long each frame takes to render
- **Draw calls** - Number of WebGL/WebGPU draw commands
- **Triangles** - Total polygon count being rendered
- **GPU time** - Actual time spent on the GPU (when available)

### 💾 Memory Tracking

Monitor GPU memory usage and catch leaks:
- Texture memory breakdown
- Geometry buffer sizes
- Render target allocations
- Resource lifecycle events
- Orphaned resource detection

### 🎮 Interactive Tools

Manipulate your scene directly:
- Transform gizmos for translate/rotate/scale
- Material property editors
- Camera controls with focus-on-object
- Shader source viewer

### 🔌 Extensibility

Build on top of 3Lens:
- Plugin API for custom panels
- Custom performance rules
- CI/CD integration for automated testing
- Event hooks for integration with other tools

## How It Works

3Lens consists of several packages that work together:

```
┌─────────────────────────────────────────────────┐
│                  Your Application                │
├─────────────────────────────────────────────────┤
│    @3lens/react-bridge   @3lens/vue-bridge      │
│              @3lens/angular-bridge               │  ← Framework Bridges
├─────────────────────────────────────────────────┤
│                  @3lens/overlay                  │  ← Visual UI
├─────────────────────────────────────────────────┤
│                   @3lens/core                    │  ← Core Engine
├─────────────────────────────────────────────────┤
│              three.js (WebGL/WebGPU)             │
└─────────────────────────────────────────────────┘
```

### @3lens/core

The core engine that:
- Intercepts three.js render calls
- Collects performance metrics
- Tracks scene graph changes
- Monitors resource lifecycle
- Provides the plugin API

### @3lens/overlay

The visual interface that:
- Renders the devtools panel
- Displays scene tree navigator
- Shows real-time charts
- Provides interactive inspectors

### Framework Bridges

Integration packages that:
- Provide idiomatic APIs (hooks, composables, services)
- Handle automatic setup and cleanup
- Support framework-specific features
- Enable component-level entity tracking

## Design Principles

### Zero Configuration

3Lens works out of the box. Just import, create a probe, and connect it to your renderer. No build configuration, no complex setup.

### Minimal Overhead

Performance tools shouldn't hurt performance. 3Lens is carefully optimized:
- Metrics collection is O(1) per frame
- UI updates are throttled and batched
- Memory allocations are pooled and reused
- Heavy analysis runs off the main thread

### Non-Invasive

3Lens observes your application without modifying it:
- No monkey-patching of three.js classes
- No prototype modifications
- No global state pollution
- Clean removal when disabled

### Framework Agnostic

While we provide framework bridges for convenience, the core works anywhere:
- Vanilla JavaScript/TypeScript
- Any bundler (Vite, webpack, Rollup, etc.)
- Any three.js wrapper library
- Node.js for headless testing

## Comparison

| Feature | 3Lens | lil-gui | dat.GUI | Spector.js |
|---------|-------|---------|---------|------------|
| Scene tree inspector | ✅ | ❌ | ❌ | ❌ |
| Real-time metrics | ✅ | ❌ | ❌ | ✅ |
| Memory profiling | ✅ | ❌ | ❌ | ✅ |
| Transform gizmos | ✅ | ❌ | ❌ | ❌ |
| Custom rules/budgets | ✅ | ❌ | ❌ | ❌ |
| CI integration | ✅ | ❌ | ❌ | ❌ |
| Plugin system | ✅ | ❌ | ❌ | ❌ |
| Framework bridges | ✅ | ❌ | ❌ | ❌ |
| WebGPU support | ✅ | N/A | N/A | ❌ |
| three.js specific | ✅ | ❌ | ❌ | ❌ |

## When to Use 3Lens

3Lens is ideal for:

- **Development** - Debug issues and optimize performance during development
- **Code Review** - Understand scene structure and performance implications
- **QA Testing** - Verify performance budgets are met
- **CI/CD** - Automated performance regression testing
- **Learning** - Understand how three.js works under the hood

## Getting Started

Ready to try 3Lens? Head to the [Getting Started](/guide/getting-started) guide for installation instructions.
