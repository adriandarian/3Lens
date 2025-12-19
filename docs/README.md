# 3Lens Documentation

> The definitive developer toolkit for three.js — one tool to rule all three.js projects.

## Overview

3Lens is a comprehensive, browser-based inspector and utility toolkit for working with [three.js](https://threejs.org/) scenes. Unlike existing fragmented solutions, 3Lens aims to be **the** standard devtool that works with any three.js application — vanilla, React Three Fiber, Vue, Angular, or any custom setup.

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture](./ARCHITECTURE.md) | System design, components, and data flow |
| [API Specification](./API-SPECIFICATION.md) | TypeScript interfaces and SDK reference |
| [Debug Protocol](./PROTOCOL.md) | Message protocol between probe and UI |
| [Implementation Notes](./IMPLEMENTATION-NOTES.md) | Code snippets and implementation guidance |
| [Development Plan](./DEVELOPMENT-PLAN.md) | Phased roadmap with milestones |
| [Competitive Analysis](./COMPETITIVE-ANALYSIS.md) | Analysis of existing tools and gaps |
| [Contributing](./CONTRIBUTING.md) | Contribution guidelines |

## Quick Links

- **Vision**: Universal devtool for all three.js projects
- **Core Principles**: Framework-agnostic, renderer-agnostic (WebGL + WebGPU), deeply introspective
- **Deployment Modes**: Browser extension, standalone app, npm/in-app integration

## Key Features

### 🔍 Deep Introspection
- Full scene graph exploration with object hierarchy
- Material and shader inspection with live editing
- Geometry analysis with vertex/index counts and memory estimates
- Render target and texture inspection

### ⚡ Performance Analysis
- Per-frame CPU and GPU timing
- Draw call and triangle count tracking
- Object-level performance cost heatmaps
- Memory and resource lifecycle tracking with leak detection

### 🔧 Interactive Debugging
- In-scene object picker (like Chrome DevTools element picker)
- Transform gizmos and bounding box overlays
- Real-time property editing
- Object isolation and camera focus

### 🏢 Enterprise Features
- npm package for deep integration with company apps
- Framework bridges (React, Angular, Vue, R3F)
- Module-level metrics for Nx/ngLib architectures
- CI mode for automated performance regression testing
- Custom metrics and domain-specific panels via plugin API

## Project Status

🚧 **Early Development** — Architecture and planning phase

## Getting Started

Documentation for getting started will be added as the project progresses. See the [Development Plan](./DEVELOPMENT-PLAN.md) for the roadmap.

## License

MIT License — See [LICENSE](../LICENSE) for details.

