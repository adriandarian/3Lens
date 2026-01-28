# 3Lens Examples

> **Status: Coming Soon**
>
> Examples are being rebuilt to showcase the new 3Lens architecture.

## Example Categories

### 🚀 Getting Started

Quick start guides for different setups.

| Example | Description | Host | Status |
|---------|-------------|------|--------|
| `getting-started/minimal` | Absolute minimal setup - one file | manual | 🔜 |
| `getting-started/vanilla-threejs` | Standard three.js app with 3Lens | manual | 🔜 |
| `getting-started/vite-plugin` | Zero-config with `@3lens/vite-plugin` | manual | 🔜 |
| `getting-started/web-components` | Using `<three-lens-overlay>` custom element | manual | 🔜 |
| `getting-started/bootstrap-api` | `bootstrap3Lens()` one-liner | manual | 🔜 |

### 🔌 Framework Integration

Framework-specific setups with mount kits.

| Example | Description | Host | Mount | Status |
|---------|-------------|------|-------|--------|
| `frameworks/react-basic` | React with `@3lens/mount-react` | manual | react | 🔜 |
| `frameworks/react-three-fiber` | R3F with `@3lens/host-r3f` | r3f | react | 🔜 |
| `frameworks/vue-basic` | Vue 3 with `@3lens/mount-vue` | manual | vue | 🔜 |
| `frameworks/vue-tresjs` | TresJS with `@3lens/host-tres` | tres | vue | 🔜 |
| `frameworks/angular` | Angular with `@3lens/mount-angular` | manual | angular | 🔜 |
| `frameworks/svelte-basic` | Svelte with `@3lens/mount-svelte` | manual | svelte | 🔜 |
| `frameworks/svelte-threlte` | Threlte with manual host | manual | svelte | 🔜 |
| `frameworks/nextjs-app-router` | Next.js 14+ App Router | r3f | react | 🔜 |
| `frameworks/nuxt` | Nuxt 3 with TresJS | tres | vue | 🔜 |

### 🔍 Inspector Addon

Entity graph browser and blame navigator demos.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `inspector/scene-browser` | Browse scene graph hierarchy | Entity Graph | 🔜 |
| `inspector/entity-search` | Search entities by type/name | Query Engine | 🔜 |
| `inspector/blame-navigator` | Navigate blame chains | Attribution | 🔜 |
| `inspector/five-questions` | The 5 inspector questions in action | Inspector Contract | 🔜 |
| `inspector/selection-sync` | Selection synced across panels | Global Selection | 🔜 |
| `inspector/relationships` | View entity relationships/edges | Entity Graph | 🔜 |

### ⚡ Performance Addon

GPU/CPU attribution and profiling demos.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `perf/frame-timing` | Per-frame CPU/GPU timing | Capture | 🔜 |
| `perf/draw-call-attribution` | Draw calls attributed to objects | Attribution | 🔜 |
| `perf/hotspot-detection` | Find performance hotspots | Query Engine | 🔜 |
| `perf/cost-heatmap` | Visual heatmap overlay | Visualization | 🔜 |
| `perf/capture-modes` | MINIMAL vs STANDARD vs DEEP | Overhead Contract | 🔜 |
| `perf/fidelity-labels` | EXACT/ESTIMATED/UNAVAILABLE display | Fidelity Contract | 🔜 |

### 🧠 Memory Addon

Resource lifecycle and leak detection demos.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `memory/resource-lifecycle` | Track create/dispose cycles | Capture | 🔜 |
| `memory/leak-detection` | Detect undisposed resources | Query Engine | 🔜 |
| `memory/texture-analysis` | Texture memory breakdown | Resource Tracking | 🔜 |
| `memory/geometry-analysis` | Geometry memory breakdown | Resource Tracking | 🔜 |
| `memory/material-sharing` | Shared vs duplicated materials | Entity Graph | 🔜 |
| `memory/gc-pressure` | Monitor allocation patterns | Capture | 🔜 |

### 🔄 Diff Addon

Frame/trace comparison demos.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `diff/frame-diff` | Compare two frames | Diff Engine | 🔜 |
| `diff/trace-diff` | Compare two recorded traces | Diff Engine | 🔜 |
| `diff/entity-changes` | Track entity changes over time | Entity Graph | 🔜 |
| `diff/cost-regression` | Detect performance regressions | Attribution | 🔜 |
| `diff/visual-diff` | Side-by-side visual comparison | Visualization | 🔜 |

### 🎨 Shader Addon

Shader introspection and analysis demos.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `shader/variant-browser` | Browse compiled shader variants | Shader Graph Contract | 🔜 |
| `shader/uniform-inspector` | Inspect uniform values | Capture | 🔜 |
| `shader/define-analysis` | Analyze #define combinations | Shader Graph Contract | 🔜 |
| `shader/cost-attribution` | Shader compile/render cost | Attribution | 🔜 |
| `shader/webgpu-pipelines` | WebGPU pipeline inspection | Pipelines Contract | 🔜 |

### 📼 Trace & Replay

Recording, saving, and replaying sessions.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `trace/record-session` | Record a trace with CLI | Trace Format | 🔜 |
| `trace/replay-offline` | Replay trace in offline viewer | Trace Replay | 🔜 |
| `trace/export-profiles` | MINIMAL/STANDARD/FULL exports | Storage Contract | 🔜 |
| `trace/share-redacted` | Export with sensitive data redacted | Storage Contract | 🔜 |
| `trace/ring-buffer` | Understand ring buffer behavior | Storage Contract | 🔜 |

### 🌐 Multi-Context

Multiple renderers, scenes, and cameras.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `multi-context/dual-renderer` | Two WebGL renderers side-by-side | Context Registration | 🔜 |
| `multi-context/minimap` | Main scene + minimap context | Context Registration | 🔜 |
| `multi-context/webgl-webgpu` | WebGL + WebGPU mixed | Compatibility Contract | 🔜 |
| `multi-context/context-switching` | Switch between contexts in UI | UI Surfaces | 🔜 |
| `multi-context/aggregated-stats` | Combined stats across contexts | Query Engine | 🔜 |

### 👷 Worker & OffscreenCanvas

Background rendering scenarios.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `worker/offscreen-basic` | OffscreenCanvas with worker host | host-worker | 🔜 |
| `worker/transport-channel` | PostMessage transport setup | Transport Contract | 🔜 |
| `worker/remote-ui` | UI in main thread, render in worker | Transport Contract | 🔜 |
| `worker/shared-worker` | SharedWorker rendering | host-worker | 🔜 |

### 🖥️ UI Surfaces

Different UI modes and layouts.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `ui/overlay-mode` | Floating overlay panel | UI Surfaces Contract | 🔜 |
| `ui/dock-left` | Docked panel on left | UI Surfaces Contract | 🔜 |
| `ui/dock-right` | Docked panel on right | UI Surfaces Contract | 🔜 |
| `ui/dock-bottom` | Docked panel on bottom | UI Surfaces Contract | 🔜 |
| `ui/separate-window` | DevTools in separate window | UI Surfaces Contract | 🔜 |
| `ui/minimal-hud` | Tiny FPS/context HUD | UI Surfaces Contract | 🔜 |
| `ui/keyboard-toggle` | Toggle with keyboard shortcut | UI Core | 🔜 |
| `ui/theming` | Custom CSS variables | UI Core | 🔜 |

### 🔧 CLI & Tooling

Command-line workflows.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `cli/trace-record` | `3lens trace:record` usage | CLI | 🔜 |
| `cli/trace-diff` | `3lens diff` usage | CLI | 🔜 |
| `cli/query-hotspots` | `3lens query top_hotspots` | CLI | 🔜 |
| `cli/validate-contracts` | `3lens validate` in CI | CLI | 🔜 |
| `cli/doctor-diagnostics` | `3lens doctor` output | CLI | 🔜 |
| `cli/scaffold-addon` | `3lens scaffold addon` | CLI | 🔜 |

### 🔌 Addon Development

Building custom addons.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `addons/minimal-addon` | Smallest possible addon | Addons Contract | 🔜 |
| `addons/custom-panel` | Addon with custom UI panel | Addons Contract | 🔜 |
| `addons/custom-query` | Addon registering queries | Query Engine | 🔜 |
| `addons/custom-events` | Addon emitting custom events | Capture | 🔜 |
| `addons/capability-check` | Addon capability handshake | Addons Contract | 🔜 |
| `addons/version-compat` | Addon version compatibility | Addons Contract | 🔜 |

### 🔐 Security & Enterprise

CSP, enterprise constraints, and production scenarios.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `security/csp-safe` | CSP-safe mode (no inline styles) | Security Contract | 🔜 |
| `security/style-nonce` | Using nonce for styles | Security Contract | 🔜 |
| `security/external-css` | External CSS file mode | Security Contract | 🔜 |
| `enterprise/dev-only-loading` | Load only in development | Loading Contract | 🔜 |
| `enterprise/url-toggle` | `?3lens=1` activation | Loading Contract | 🔜 |
| `enterprise/localstorage-persist` | Persist settings | Loading Contract | 🔜 |

### 🎮 Real-World Scenarios

Complete application examples.

| Example | Description | Features | Status |
|---------|-------------|----------|--------|
| `apps/model-viewer` | GLTF model viewer with inspection | Inspector, Memory | 🔜 |
| `apps/particle-system` | Particle effects with profiling | Perf, Memory | 🔜 |
| `apps/procedural-terrain` | Procedural world with debugging | Inspector, Perf | 🔜 |
| `apps/physics-game` | Physics-based game debugging | Multi-Context, Perf | 🔜 |
| `apps/vr-experience` | WebXR debugging | Inspector, Perf | 🔜 |
| `apps/data-visualization` | 3D charts with profiling | Perf, Memory | 🔜 |

### 🧪 CI/CD Integration

Automated testing and regression detection.

| Example | Description | Feature | Status |
|---------|-------------|---------|--------|
| `ci/github-actions` | GitHub Actions workflow | CLI, Validation | 🔜 |
| `ci/performance-budget` | Fail on perf regression | Diff, CLI | 🔜 |
| `ci/contract-validation` | Validate contracts in CI | Validation | 🔜 |
| `ci/visual-regression` | Screenshot comparison | Trace, Diff | 🔜 |
| `ci/headless-profiling` | Headless trace recording | CLI, Trace | 🔜 |

---

## Example Structure

Each example follows this structure:

```
examples/
├── <category>/
│   └── <example-name>/
│       ├── README.md         # Description, setup, walkthrough
│       ├── package.json      # Dependencies
│       ├── vite.config.ts    # Build config
│       ├── index.html        # Entry HTML
│       ├── src/
│       │   └── main.ts       # Main code
│       └── tsconfig.json     # TypeScript config
```

## Running Examples

Once examples are available:

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

## Contributing Examples

Contributions welcome! See [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for guidelines.

When adding an example:

1. Follow the structure above
2. Include clear README with setup instructions
3. Add comments explaining key concepts
4. Demonstrate at least one contract/feature
5. Test with `pnpm build && pnpm preview`
