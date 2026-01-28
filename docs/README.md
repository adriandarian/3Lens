# 3Lens Documentation

> The render introspection OS for three.js — deep causal analysis, not just metrics.

## Overview

3Lens is a comprehensive debugging and introspection toolkit for [three.js](https://threejs.org/) applications. Unlike simple metrics panels, 3Lens is built on 5 foundational primitives that enable deep causal analysis:

1. **Capture** — Authoritative event stream (render events, resource lifecycle)
2. **Model** — Unified typed dependency graph (entities + relationships)
3. **Query** — Tools query the model, not the renderer directly
4. **Visualize** — Views are projections of queries
5. **Act + Verify** — Actions produce events, verification shows diffs

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture](../agents.md) | System design, philosophy, and contracts |
| [Contracts](../agents/contracts/) | System invariants and guarantees |
| [Plugin API](./guide/plugin-api.md) | Building third-party addons |
| [Skills & Commands](../skills.md) | CLI commands and programmatic APIs |

## Project Status

🚧 **Major Redesign In Progress**

| Component | Status |
|-----------|--------|
| Kernel (capture, graph, query, trace) | ✅ Implemented |
| Runtime (createLens, hosts, addons) | ✅ Implemented |
| Hosts (manual, r3f, tres, worker) | 🟡 Manual implemented, others stub |
| Addons (inspector, perf, memory, diff, shader) | 🟡 Inspector implemented, others stub |
| UI (core, web components) | ✅ Implemented |
| Mount Kits (react, vue, angular, svelte) | 🔜 Stub |
| CLI & Vite Plugin | ✅ Implemented |
| Examples | 🔜 Not Started |
| Documentation | 🔜 In Progress |

## Key Features

### 🔍 Deep Introspection
- Entity graph browser with namespaced IDs
- Blame navigator for attribution chains
- Resource lifecycle tracking

### ⚡ Performance Analysis
- GPU/CPU attribution with weighted blame chains
- Per-entity cost breakdown
- Data fidelity labels (EXACT/ESTIMATED/UNAVAILABLE)

### 🔧 Trace-Based Debugging
- Capture and replay sessions
- Offline diff/regression analysis
- CI integration for automated testing

### 🏢 Multi-Context Support
- Multiple renderers, scenes, cameras
- Per-context and aggregated queries
- Dynamic context registration

## Quick Links

- **[Examples](/examples/)** — Coming soon
- **[API Reference](/api/)** — Package APIs
- **[Guides](/guide/)** — How-to guides

## Getting Started

Once packages are published, the basic setup will look like:

```typescript
import { createLens, manualHost, uiOverlay } from "@3lens/devtools";

const lens = createLens({
  ui: uiOverlay(),
  addons: ["inspector", "perf", "memory"],
});

lens.registerContext({
  id: "main",
  host: manualHost({ renderer, scene, camera }),
});

lens.attach();
```

## License

MIT License — See [LICENSE](../LICENSE) for details.
