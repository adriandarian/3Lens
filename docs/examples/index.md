---
title: Examples
description: Example projects demonstrating 3Lens features and integration patterns
---

# Examples

> **Status: Coming Soon**
>
> Examples are being rebuilt to showcase the new 3Lens architecture.

## Overview

3Lens examples are organized by category, each demonstrating specific features and contracts of the new architecture. All examples will follow the same structure and can be run locally with `pnpm dev`.

## Example Categories

### 🚀 Getting Started

Quick start guides for different setups - from minimal one-file examples to full Vite plugin integration.

| Example | Description | Status |
|---------|-------------|--------|
| Minimal Setup | Absolute minimal - one file | 🔜 Coming Soon |
| Vanilla Three.js | Standard three.js with 3Lens | 🔜 Coming Soon |
| Vite Plugin | Zero-config with `@3lens/vite-plugin` | 🔜 Coming Soon |
| Web Components | Using `<three-lens-overlay>` | 🔜 Coming Soon |
| Bootstrap API | `bootstrap3Lens()` one-liner | 🔜 Coming Soon |

### 🔌 Framework Integration

Framework-specific setups with mount kits and host integrations.

| Example | Framework | Host | Status |
|---------|-----------|------|--------|
| React Basic | React | manual | 🔜 Coming Soon |
| React Three Fiber | React + R3F | r3f | 🔜 Coming Soon |
| Vue Basic | Vue 3 | manual | 🔜 Coming Soon |
| Vue TresJS | Vue + TresJS | tres | 🔜 Coming Soon |
| Angular | Angular | manual | 🔜 Coming Soon |
| Svelte Basic | Svelte | manual | 🔜 Coming Soon |
| Svelte Threlte | Svelte + Threlte | manual | 🔜 Coming Soon |
| Next.js | Next.js 14+ | r3f | 🔜 Coming Soon |
| Nuxt | Nuxt 3 | tres | 🔜 Coming Soon |

### 🔍 Inspector Addon

Entity graph browser and blame navigator demos.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| Scene Browser | Entity graph hierarchy | 🔜 Coming Soon |
| Entity Search | Query engine | 🔜 Coming Soon |
| Blame Navigator | Attribution chains | 🔜 Coming Soon |
| Five Questions | Inspector contract | 🔜 Coming Soon |
| Selection Sync | Global selection | 🔜 Coming Soon |
| Relationships | Entity edges | 🔜 Coming Soon |

### ⚡ Performance Addon

GPU/CPU attribution and profiling.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| Frame Timing | Per-frame capture | 🔜 Coming Soon |
| Draw Call Attribution | Attribution to objects | 🔜 Coming Soon |
| Hotspot Detection | Query engine | 🔜 Coming Soon |
| Cost Heatmap | Visual overlay | 🔜 Coming Soon |
| Capture Modes | MINIMAL/STANDARD/DEEP | 🔜 Coming Soon |
| Fidelity Labels | EXACT/ESTIMATED/UNAVAILABLE | 🔜 Coming Soon |

### 🧠 Memory Addon

Resource lifecycle and leak detection.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| Resource Lifecycle | Create/dispose tracking | 🔜 Coming Soon |
| Leak Detection | Undisposed resources | 🔜 Coming Soon |
| Texture Analysis | Texture memory | 🔜 Coming Soon |
| Geometry Analysis | Geometry memory | 🔜 Coming Soon |
| Material Sharing | Shared vs duplicated | 🔜 Coming Soon |

### 🔄 Diff Addon

Frame/trace comparison.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| Frame Diff | Compare two frames | 🔜 Coming Soon |
| Trace Diff | Compare traces | 🔜 Coming Soon |
| Entity Changes | Changes over time | 🔜 Coming Soon |
| Cost Regression | Performance regression | 🔜 Coming Soon |

### 🎨 Shader Addon

Shader introspection and analysis.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| Variant Browser | Compiled variants | 🔜 Coming Soon |
| Uniform Inspector | Uniform values | 🔜 Coming Soon |
| Define Analysis | #define combinations | 🔜 Coming Soon |
| WebGPU Pipelines | Pipeline inspection | 🔜 Coming Soon |

### 📼 Trace & Replay

Recording and replaying sessions.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| Record Session | CLI recording | 🔜 Coming Soon |
| Replay Offline | Offline viewer | 🔜 Coming Soon |
| Export Profiles | MINIMAL/STANDARD/FULL | 🔜 Coming Soon |
| Share Redacted | Data redaction | 🔜 Coming Soon |

### 🌐 Multi-Context

Multiple renderers, scenes, and cameras.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| Dual Renderer | Two renderers | 🔜 Coming Soon |
| Minimap | Main + minimap | 🔜 Coming Soon |
| WebGL + WebGPU | Mixed backends | 🔜 Coming Soon |
| Context Switching | UI context selector | 🔜 Coming Soon |

### 👷 Worker & OffscreenCanvas

Background rendering scenarios.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| Offscreen Basic | Worker host | 🔜 Coming Soon |
| Transport Channel | PostMessage | 🔜 Coming Soon |
| Remote UI | Split render/UI | 🔜 Coming Soon |

### 🖥️ UI Surfaces

Different UI modes and layouts.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| Overlay Mode | Floating panel | 🔜 Coming Soon |
| Dock Left/Right/Bottom | Docked panels | 🔜 Coming Soon |
| Separate Window | DevTools window | 🔜 Coming Soon |
| Minimal HUD | Tiny overlay | 🔜 Coming Soon |
| Theming | CSS variables | 🔜 Coming Soon |

### 🔧 CLI & Tooling

Command-line workflows.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| Trace Record | `3lens trace:record` | 🔜 Coming Soon |
| Trace Diff | `3lens diff` | 🔜 Coming Soon |
| Query Hotspots | `3lens query` | 🔜 Coming Soon |
| Doctor | `3lens doctor` | 🔜 Coming Soon |

### 🔌 Addon Development

Building custom addons.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| Minimal Addon | Basic structure | 🔜 Coming Soon |
| Custom Panel | UI panel | 🔜 Coming Soon |
| Custom Query | Query registration | 🔜 Coming Soon |
| Custom Events | Event emission | 🔜 Coming Soon |

### 🔐 Security & Enterprise

CSP, enterprise constraints.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| CSP Safe Mode | No inline styles | 🔜 Coming Soon |
| Style Nonce | Nonce support | 🔜 Coming Soon |
| Dev-Only Loading | Conditional load | 🔜 Coming Soon |
| URL Toggle | `?3lens=1` | 🔜 Coming Soon |

### 🎮 Real-World Apps

Complete application examples.

| Example | Features Used | Status |
|---------|--------------|--------|
| Model Viewer | Inspector, Memory | 🔜 Coming Soon |
| Particle System | Perf, Memory | 🔜 Coming Soon |
| Physics Game | Multi-Context, Perf | 🔜 Coming Soon |
| VR Experience | Inspector, Perf | 🔜 Coming Soon |

### 🧪 CI/CD Integration

Automated testing.

| Example | Feature Demonstrated | Status |
|---------|---------------------|--------|
| GitHub Actions | CI workflow | 🔜 Coming Soon |
| Performance Budget | Regression detection | 🔜 Coming Soon |
| Contract Validation | `3lens validate` | 🔜 Coming Soon |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Your App                             │
├─────────────────────────────────────────────────────────────┤
│  Mount Kit (optional)     │  Host Integration               │
│  @3lens/mount-react       │  @3lens/host-manual             │
│  @3lens/mount-vue         │  @3lens/host-r3f                │
│  @3lens/mount-angular     │  @3lens/host-tres               │
│  @3lens/mount-svelte      │  @3lens/host-worker             │
├─────────────────────────────────────────────────────────────┤
│                     @3lens/runtime                          │
│            createLens() • registerContext()                 │
├─────────────────────────────────────────────────────────────┤
│  Addons                   │  UI                             │
│  @3lens/addon-inspector   │  @3lens/ui-core                 │
│  @3lens/addon-perf        │  @3lens/ui-web                  │
│  @3lens/addon-memory      │                                 │
│  @3lens/addon-diff        │                                 │
│  @3lens/addon-shader      │                                 │
├─────────────────────────────────────────────────────────────┤
│                      @3lens/kernel                          │
│         Capture • Entity Graph • Query • Trace              │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start Preview

Install 3Lens:

```bash
npm install @3lens/devtools
```

Then set up your lens:

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

That's it! The 3Lens overlay will appear in your application. Press the toggle key (default: `Ctrl+Shift+D`) to show/hide the devtools panel.

## Running Examples Locally

```bash
# Clone the repository
git clone https://github.com/adriandarian/3Lens.git
cd 3Lens

# Install dependencies
pnpm install

# Run a specific example
cd examples/getting-started/minimal
pnpm dev
```

## Stay Updated

- Watch the [GitHub repository](https://github.com/adriandarian/3Lens) for updates
- Check the [Changelog](/changelog) for release notes
- Join [Discussions](https://github.com/adriandarian/3Lens/discussions) for Q&A

## Contributing

Once core packages are stable, example contributions will be welcome!

See [Contributing](/contributing) for guidelines.
