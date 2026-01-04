---
layout: home

hero:
  name: 3Lens
  text: Three.js Developer Tools
  tagline: Debug, inspect, and optimize your WebGL/WebGPU applications with the definitive toolkit for three.js
  image:
    src: /logo.svg
    alt: 3Lens
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/adriandarian/3Lens
    - theme: alt
      text: API Reference
      link: /api/

features:
  - icon: 🔍
    title: Scene Inspection
    details: Navigate your entire scene graph with a hierarchical tree view. Click to select objects, view their properties, and understand your scene structure.
    link: /guide/features/scene-inspection
    linkText: Learn more

  - icon: 📊
    title: Performance Monitoring
    details: Real-time FPS, draw calls, triangles, and GPU timing. Identify bottlenecks with visual heatmaps and cost analysis per object.
    link: /guide/features/performance
    linkText: Learn more

  - icon: 💾
    title: Memory Profiling
    details: Track GPU memory usage, detect leaks, and monitor resource lifecycle. Get alerts for orphaned textures and geometries.
    link: /guide/features/memory
    linkText: Learn more

  - icon: 🎮
    title: Transform Gizmos
    details: Translate, rotate, and scale objects directly in your scene. Fine-tune positions with snapping and precise input controls.
    link: /guide/features/gizmos
    linkText: Learn more

  - icon: 🎨
    title: Material Editing
    details: Live-edit materials, colors, and uniforms. Preview changes instantly without reloading your application.
    link: /guide/features/materials
    linkText: Learn more

  - icon: ⚡
    title: WebGL & WebGPU
    details: Full support for both WebGL and WebGPU renderers. Automatic detection with renderer-specific profiling capabilities.
    link: /guide/advanced/webgpu
    linkText: Learn more

  - icon: ⚛️
    title: React Three Fiber
    details: First-class integration with R3F. Hooks for metrics, entity registration, and automatic scene connection.
    link: /guide/react-r3f
    linkText: Learn more

  - icon: 💚
    title: Vue + TresJS
    details: Native Vue composables and TresJS integration. Reactive metrics with Vue's composition API.
    link: /guide/vue-tresjs
    linkText: Learn more

  - icon: 🅰️
    title: Angular Support
    details: Injectable services, RxJS observables, and Angular-style decorators for seamless integration.
    link: /guide/angular
    linkText: Learn more

  - icon: 🔌
    title: Plugin System
    details: Extend 3Lens with custom plugins. Add new panels, rules, and functionality tailored to your workflow.
    link: /guide/advanced/plugins
    linkText: Learn more

  - icon: 🤖
    title: CI Integration
    details: Run performance tests in CI pipelines. Set thresholds and fail builds when performance degrades.
    link: /guide/advanced/ci
    linkText: Learn more

  - icon: 📐
    title: Custom Rules
    details: Define performance budgets and best practices. Get warnings when your scene violates configured thresholds.
    link: /guide/advanced/custom-rules
    linkText: Learn more
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #646cff 30%, #42d392);
}

.dark {
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #747bff 30%, #42d392);
}
</style>

## Quick Start

Get up and running in under a minute:

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

```ts
import { createProbe } from '@3lens/core'
import { bootstrapOverlay } from '@3lens/overlay'

// Create the probe and connect it to your renderer/scene
const probe = createProbe()
probe.observeRenderer(renderer)
probe.observeScene(scene)

// Bootstrap the visual overlay
bootstrapOverlay(probe)
```

That's it! Press `Ctrl+Shift+D` to toggle the devtools panel.

## Framework Integration

3Lens provides dedicated bridges for popular frameworks:

| Package | Framework | Install |
|---------|-----------|---------|
| `@3lens/react-bridge` | React / React Three Fiber | `npm i @3lens/react-bridge` |
| `@3lens/vue-bridge` | Vue / TresJS | `npm i @3lens/vue-bridge` |
| `@3lens/angular-bridge` | Angular | `npm i @3lens/angular-bridge` |

[View Framework Guides →](/guide/react-r3f)

## Sponsors

<p style="text-align: center; color: var(--vp-c-text-2); margin: 2rem 0;">
  Interested in sponsoring 3Lens? <a href="https://github.com/sponsors/adriandarian">Become a sponsor</a>
</p>
