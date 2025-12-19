# 3Lens Development Plan

This document outlines the phased development roadmap for 3Lens, from MVP to full enterprise-ready release.

## Table of Contents

1. [Development Philosophy](#development-philosophy)
2. [Phase Overview](#phase-overview)
3. [Phase 1: Foundation (MVP)](#phase-1-foundation-mvp)
4. [Phase 2: Core Features](#phase-2-core-features)
5. [Phase 3: Enterprise Features](#phase-3-enterprise-features)
6. [Phase 4: Ecosystem & Polish](#phase-4-ecosystem--polish)
7. [Technology Stack](#technology-stack)
8. [Release Strategy](#release-strategy)
9. [Success Metrics](#success-metrics)

---

## Development Philosophy

### Principles

1. **Ship Early, Iterate Often**
   - Release MVP quickly to gather feedback
   - Prioritize user value over feature completeness

2. **Core First, Extensions Later**
   - Build a solid foundation before adding bells and whistles
   - Plugin system enables community contributions

3. **Real-World Validation**
   - Test with actual three.js projects throughout development
   - Performance matters — the devtool shouldn't slow down the app

4. **Documentation-Driven Development**
   - APIs designed before implementation
   - Documentation updated alongside code

---

## Phase Overview

```
Phase 1: Foundation (MVP)     ██████░░░░░░░░░░░░░░  ~2-3 months
Phase 2: Core Features        ░░░░░░██████░░░░░░░░  ~3-4 months
Phase 3: Enterprise Features  ░░░░░░░░░░░░██████░░  ~3-4 months
Phase 4: Ecosystem & Polish   ░░░░░░░░░░░░░░░░████  ~2-3 months
                              ─────────────────────
                              Total: ~10-14 months
```

---

## Phase 1: Foundation (MVP)

**Goal:** Prove the concept with a working scene inspector and basic stats.

**Duration:** 2-3 months

### Deliverables

#### 1.1 Core Package (`@3lens/core`)

- [ ] **Probe SDK Foundation**
  - `createProbe(config)` factory function
  - `observeRenderer(renderer)` - WebGL only for MVP
  - `observeScene(scene)` - single scene support
  - Basic configuration options

- [ ] **Scene Graph Observer**
  - Detect `Object3D.add()` and `Object3D.remove()`
  - Build and maintain scene tree structure
  - Generate `TrackedObjectRef` for each object

- [ ] **Frame Stats Collector**
  - Hook into `renderer.render()`
  - Capture `renderer.info` (draw calls, triangles, etc.)
  - Calculate frame time (CPU)
  - Simple FPS calculation

- [ ] **Basic Transport Layer**
  - `postMessage` transport for extension mode
  - Direct call transport for in-app mode
  - Simple message serialization

#### 1.2 Browser Extension (Chrome)

- [ ] **DevTools Panel**
  - Register as Chrome DevTools extension
  - Inject content script to load probe
  - Basic connection status indicator

- [ ] **Scene Explorer Panel**
  - Tree view of scene hierarchy
  - Expand/collapse nodes
  - Show object type icons
  - Basic object info on hover

- [ ] **Object Inspector**
  - Display selected object properties
  - Transform (position, rotation, scale)
  - Visibility, layers, frustumCulled
  - Material reference (name only)

- [ ] **Stats Panel**
  - Real-time FPS display
  - Draw calls count
  - Triangle count
  - Simple line charts

#### 1.3 In-App Overlay (`@3lens/overlay`)

- [ ] **Overlay Shell**
  - Dockable panel (right side)
  - Toggle button
  - Collapse/expand

- [ ] **Same panels as extension**
  - Scene Explorer
  - Object Inspector
  - Stats Panel

#### 1.4 Documentation & Examples

- [ ] Basic README with installation
- [ ] Simple example project (vanilla three.js)
- [ ] API documentation (partial)

### MVP Success Criteria

- [ ] Can inspect scene graph of any three.js app
- [ ] Shows real-time performance stats
- [ ] Works in both extension and npm modes
- [ ] < 5% performance overhead

---

## Phase 2: Core Features

**Goal:** Complete the inspection capabilities and add interactive debugging.

**Duration:** 3-4 months

### Deliverables

#### 2.1 Enhanced Inspection

- [ ] **Materials Inspector**
  - List all materials with types
  - Property editor (color, opacity, roughness, etc.)
  - Shader source viewer (syntax highlighted)
  - Live property editing

- [ ] **Geometry Inspector**
  - Vertex/index counts
  - Attribute list
  - Memory estimates
  - Bounding box visualization

- [ ] **Textures Panel**
  - Texture list with thumbnails
  - Size, format, mipmap info
  - Memory usage
  - Usage tracking (which materials use each texture)

- [ ] **Render Targets Panel**
  - Grid of render target thumbnails
  - Click to inspect pixel values
  - Channel toggles (RGB/A/Depth)
  - Save as image

#### 2.2 Interactive Debugging

- [ ] **Object Selection via Raycasting**
  - "Inspect" mode toggle
  - Click to select objects in scene
  - Hover highlighting

- [ ] **Visual Overlays**
  - Bounding box display
  - Selection outline
  - Wireframe toggle

- [ ] **Transform Gizmos**
  - Translate/Rotate/Scale gizmos
  - Local vs world space toggle
  - Undo/redo for changes

- [ ] **Camera Controls**
  - "Focus on object" command
  - Fly-to animation
  - Camera info display

#### 2.3 Performance Enhancements

- [ ] **GPU Timing (WebGL)**
  - `EXT_disjoint_timer_query` support
  - Per-frame GPU time
  - Handle query unavailability gracefully

- [ ] **Performance Timeline**
  - Frame time chart
  - Spike detection
  - Zoom/pan through history

- [ ] **Object Cost Analysis**
  - Triangle count per object
  - Material complexity estimate
  - Cost heatmap overlay (optional)

#### 2.4 Resource Tracking

- [ ] **Resource Lifecycle Events**
  - Track creation/disposal
  - Stack traces (optional)
  - Timeline view

- [ ] **Leak Detection**
  - Orphaned resources warning
  - Undisposed resources after N frames
  - Memory growth alerts

- [ ] **Memory Panel**
  - Total GPU memory estimate
  - Breakdown by resource type
  - Trend chart

#### 2.5 Configuration System

- [ ] **Config File Support**
  - `3lens.config.json` or `threelens.config.js`
  - Performance thresholds
  - Sampling options

- [ ] **Performance Rules**
  - Max draw calls warning
  - Max triangles warning
  - Custom rule definitions

#### 2.6 Firefox Extension

- [ ] Port Chrome extension to Firefox
- [ ] Firefox DevTools integration

---

## Phase 3: Enterprise Features

**Goal:** Add features for teams and production debugging workflows.

**Duration:** 3-4 months

### Deliverables

#### 3.1 Framework Bridges

- [ ] **React Bridge (`@3lens/react-bridge`)**
  - `ThreeLensProvider` context
  - `useDevtoolEntity` hook
  - React Three Fiber auto-detection

- [ ] **Angular Bridge (`@3lens/angular-bridge`)**
  - `THREELENS_PROBE` injection token
  - `ThreeLensEntityDirective`
  - Nx workspace support

- [ ] **Vue Bridge (`@3lens/vue-bridge`)**
  - `provide/inject` integration
  - `useDevtoolEntity` composable
  - TresJS compatibility

#### 3.2 Logical Entities

- [ ] **Entity Registration API**
  - `registerLogicalEntity()`
  - `updateLogicalEntity()`
  - `unregisterLogicalEntity()`

- [ ] **Module ID Support**
  - Group by library/module
  - Filter by module
  - Module-level metrics

- [ ] **Component → Object Mapping**
  - Two-way navigation
  - Component tree view (optional)

#### 3.3 Plugin System

- [ ] **Plugin API**
  - `DevtoolPlugin` interface
  - `DevtoolContext` for plugin access
  - `registerPanel()`, `registerToolbarAction()`

- [ ] **Plugin Loading**
  - Load from npm packages
  - Dynamic registration

- [ ] **Built-in Plugins**
  - LOD Checker plugin
  - Shadow Map Debugger plugin

#### 3.4 Standalone Application

- [ ] **Electron App Shell**
  - WebSocket server for connections
  - Multi-app support (tabs)
  - Session persistence

- [ ] **Session Recording**
  - Record frame stats
  - Record snapshots
  - Record events

- [ ] **Session Playback**
  - Load recorded sessions
  - Scrub through timeline
  - Compare two sessions

- [ ] **Export Capabilities**
  - Export to JSON
  - Export to CSV (metrics)
  - PDF report generation

#### 3.5 CI Integration

- [ ] **Headless Mode**
  - Run without UI
  - Scripted interactions
  - Metric collection

- [ ] **CI Reporter**
  - JSON output for CI
  - JUnit XML format
  - GitHub Actions integration

- [ ] **Performance Regression Detection**
  - Compare against baseline
  - Configurable thresholds
  - Pass/fail exit codes

#### 3.6 WebGPU Support

- [ ] **WebGPU Adapter**
  - Detect `WebGPURenderer`
  - Frame stats collection
  - Resource tracking

- [ ] **WebGPU-Specific UI**
  - Pipelines panel (vs Programs)
  - Bind groups view
  - WGSL shader viewer

- [ ] **GPU Timing (WebGPU)**
  - Timestamp queries
  - Per-pass breakdown

---

## Phase 4: Ecosystem & Polish

**Goal:** Polish UX, build community, and prepare for stable release.

**Duration:** 2-3 months

### Deliverables

#### 4.1 UX Polish

- [ ] **Theme Support**
  - Light/Dark/Auto themes
  - Custom theme API

- [ ] **Responsive Design**
  - Panel resizing
  - Mobile-friendly overlay

- [ ] **Keyboard Shortcuts**
  - Navigation shortcuts
  - Command palette

- [ ] **Accessibility**
  - Screen reader support
  - Keyboard navigation

#### 4.2 Documentation

- [ ] **Complete API Reference**
  - All public APIs documented
  - TypeDoc generation

- [ ] **Guides & Tutorials**
  - Getting Started guide
  - Framework-specific guides
  - Plugin development guide

- [ ] **Example Projects**
  - Vanilla three.js
  - React Three Fiber
  - Angular + three.js
  - Vue + TresJS

- [ ] **Video Tutorials**
  - Introduction video
  - Feature walkthroughs

#### 4.3 Community

- [ ] **Plugin Showcase**
  - Community plugins directory
  - Plugin template repository

- [ ] **Discord/Community Channel**
  - Support channel
  - Showcase channel

- [ ] **Contributing Guide**
  - Code style guide
  - PR process
  - Issue templates

#### 4.4 Performance Optimization

- [ ] **Probe Overhead Minimization**
  - Lazy initialization
  - Sampling optimization
  - Memory pooling

- [ ] **UI Performance**
  - Virtual scrolling for large trees
  - Memoization
  - Web Worker for processing

#### 4.5 Testing & Quality

- [ ] **Unit Tests**
  - Core package coverage > 80%
  - Bridge packages coverage > 70%

- [ ] **Integration Tests**
  - Extension E2E tests
  - Overlay E2E tests

- [ ] **Performance Tests**
  - Overhead benchmarks
  - Memory leak tests

---

## Technology Stack

### Core Packages

| Component | Technology |
|-----------|------------|
| Core SDK | TypeScript |
| Build | Vite / Rollup |
| Package Manager | pnpm (monorepo) |

### UI Components

| Component | Technology |
|-----------|------------|
| Overlay UI | Solid.js or React |
| Extension UI | Same as overlay |
| Standalone App | Electron + same UI |
| Charts | uPlot or Chart.js |
| Syntax Highlighting | Prism.js / Shiki |

### Testing

| Purpose | Tool |
|---------|------|
| Unit Tests | Vitest |
| E2E Tests | Playwright |
| Visual Regression | Chromatic (optional) |

### Documentation

| Purpose | Tool |
|---------|------|
| API Docs | TypeDoc |
| Guides | VitePress |

---

## Release Strategy

### Versioning

Following semver with clear pre-release tags:

```
0.1.0-alpha.1  → MVP (Phase 1)
0.2.0-beta.1   → Core Features (Phase 2)
0.3.0-beta.1   → Enterprise Features (Phase 3)
1.0.0          → Stable Release (Phase 4)
```

### Release Channels

| Channel | Stability | Use Case |
|---------|-----------|----------|
| `alpha` | Unstable | Early adopters, testing |
| `beta` | Mostly stable | Production testing |
| `latest` | Stable | Production use |

### npm Packages

```
@3lens/core           # Core probe SDK
@3lens/overlay        # In-app overlay UI
@3lens/react-bridge   # React integration
@3lens/angular-bridge # Angular integration
@3lens/vue-bridge     # Vue integration
```

### Distribution

- **npm**: All packages published to npm
- **Chrome Web Store**: Browser extension
- **Firefox Add-ons**: Firefox extension
- **GitHub Releases**: Standalone app binaries

---

## Success Metrics

### Technical Metrics

| Metric | Target |
|--------|--------|
| Probe overhead (FPS impact) | < 5% |
| Probe memory overhead | < 10 MB |
| UI frame time | < 16ms (60 FPS) |
| Test coverage (core) | > 80% |

### Adoption Metrics (Post-Launch)

| Metric | 6-Month Target |
|--------|----------------|
| npm weekly downloads | 1,000+ |
| GitHub stars | 500+ |
| Extension installs | 500+ |
| Active Discord members | 100+ |

### Quality Metrics

| Metric | Target |
|--------|--------|
| Open bug count | < 20 |
| Average issue response time | < 48 hours |
| Documentation coverage | 100% of public APIs |

---

## Team & Resources

### Recommended Team Structure

| Role | Responsibility |
|------|----------------|
| **Core Developer (1-2)** | Probe SDK, adapters, protocol |
| **UI Developer (1-2)** | Overlay, extension, standalone app |
| **Bridge Developer (1)** | Framework integrations |
| **DevRel (part-time)** | Documentation, community |

### Development Environment

- **IDE**: VS Code / WebStorm
- **Node.js**: v18+
- **pnpm**: v8+
- **Browsers**: Chrome, Firefox, Safari (for testing)

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|------------|
| three.js internal changes | Version-specific adapters, integration tests |
| WebGPU API instability | Feature-flag WebGPU, focus on WebGL first |
| Browser extension API changes | Manifest v3 compliance, abstraction layer |

### Adoption Risks

| Risk | Mitigation |
|------|------------|
| Competition from official tools | Differentiate with depth, enterprise features |
| Slow community adoption | Early partnerships, example projects |

---

## Next Steps

To begin development:

1. **Set up monorepo** with pnpm workspaces
2. **Create packages** for `core`, `overlay`, `extension`
3. **Implement MVP probe** with basic scene observation
4. **Build basic extension** with scene tree panel
5. **Test with real projects** and gather feedback

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup instructions.

