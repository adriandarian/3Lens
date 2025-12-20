# 3Lens Development Progress

> **Last Updated:** December 20, 2025  
> **Current Phase:** Phase 1 - Foundation (MVP)  
> **Overall Progress:** █████░░░░░░░░░░░░░░░ 27%

---

## Quick Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundation (MVP) | 🔵 In Progress | ██████████ 99% |
| Phase 2: Core Features | 🔵 In Progress | █░░░░░░░░░ 5% |
| Phase 3: Enterprise Features | ⚪ Not Started | ░░░░░░░░░░ 0% |
| Phase 4: Ecosystem & Polish | ⚪ Not Started | ░░░░░░░░░░ 0% |

---

## Legend

- ⬜ Not Started
- 🔄 In Progress
- ✅ Complete
- ⏸️ Blocked
- ❌ Cancelled

---

# Phase 1: Foundation (MVP)

**Goal:** Prove the concept with a working scene inspector and basic stats.  
**Target Duration:** 2-3 months  
**Status:** 🔵 In Progress

## 1.1 Project Setup

| Task | Status | Notes |
|------|--------|-------|
| Initialize monorepo with pnpm workspaces | ✅ | `pnpm-workspace.yaml` created |
| Set up TypeScript configuration | ✅ | `tsconfig.json` with strict mode |
| Configure Vite/Rollup for builds | ✅ | Vite configured for ES modules |
| Set up ESLint + Prettier | ✅ | `.eslintrc.cjs` + `.prettierrc` |
| Set up Vitest for testing | ✅ | `vitest.config.ts` + workspace config |
| Create package structure | ✅ | `@3lens/core` ready |

## 1.2 Core Package (`@3lens/core`)

### Probe SDK Foundation

| Task | Status | Notes |
|------|--------|-------|
| Create `ProbeConfig` interface | ✅ | `types/config.ts` |
| Implement `createProbe()` factory | ✅ | `probe/createProbe.ts` |
| Implement `observeRenderer()` - WebGL | ✅ | WebGL adapter done |
| Implement `observeScene()` | ✅ | SceneObserver created |
| Basic configuration parsing | ✅ | Config merged with defaults |
| Probe lifecycle (dispose) | ✅ | Full cleanup implemented |

### Scene Graph Observer

| Task | Status | Notes |
|------|--------|-------|
| Hook into `Object3D.add()` | ✅ | Scene.add patched |
| Hook into `Object3D.remove()` | ✅ | Scene.remove patched |
| Build scene tree structure | ✅ | SceneObserver.createSceneNode() |
| Generate `TrackedObjectRef` for objects | ✅ | Stable debug IDs |
| Track object name/uuid/type | ✅ | Stored in refs |
| Compute scene paths | ✅ | `/Scene/Object/Child` format |

### Frame Stats Collector

| Task | Status | Notes |
|------|--------|-------|
| Hook into `renderer.render()` | ✅ | render() wrapped |
| Capture `renderer.info` data | ✅ | triangles, calls, etc |
| Calculate CPU frame time | ✅ | performance.now() delta |
| Calculate FPS | ✅ | Computed in PerformanceTracker.getMetrics() |
| Create `FrameStats` structure | ✅ | Full interface defined |
| Frame stats history buffer | ✅ | 300 frame history |

### Transport Layer

| Task | Status | Notes |
|------|--------|-------|
| Define `Transport` interface | ✅ | `types/transport.ts` |
| Implement `postMessage` transport | ✅ | For extension mode |
| Implement direct-call transport | ✅ | For overlay mode |
| Message serialization | ✅ | JSON wrapper |
| Connection state management | ✅ | isConnected() + callbacks |

## 1.3 Browser Extension (Chrome)

### Extension Shell

| Task | Status | Notes |
|------|--------|-------|
| Create manifest.json (v3) | ✅ | Chrome MV3 format |
| DevTools panel registration | ✅ | `devtools.ts` |
| Content script injection | ✅ | Auto-injects on all pages |
| Background service worker | ✅ | Port-based messaging |
| Extension ↔ content script bridge | ✅ | postMessage relay |
| Connection status indicator | ✅ | In panel header |

### Scene Explorer Panel

| Task | Status | Notes |
|------|--------|-------|
| Tree view component | ✅ | Recursive tree rendering |
| Expand/collapse nodes | ✅ | Toggle with arrow |
| Object type icons | ✅ | Color-coded by type |
| Object name display | ✅ | Name or type fallback |
| Hover highlighting | ✅ | Blue box helper + CSS highlight |
| Click to select | ✅ | Updates selection state |

### Object Inspector Panel

| Task | Status | Notes |
|------|--------|-------|
| Selected object display | ✅ | Basic info shown |
| Transform properties (position/rotation/scale) | ✅ | Position, rotation (degrees), scale displayed |
| Visibility property | ✅ | Displayed |
| Layers property | ✅ | Shows layer mask with friendly names |
| frustumCulled property | ✅ | Displayed in Rendering section |
| Material reference display | ✅ | Shows UUID(s) with multi-material support |

### Stats Panel

| Task | Status | Notes |
|------|--------|-------|
| FPS display | ✅ | Computed from frame time |
| Draw calls display | ✅ | With warning colors |
| Triangle count display | ✅ | With warning colors |
| Frame time chart | ✅ | Line + bar hybrid chart with gridlines, hover tooltips, min/max/avg/jitter stats |
| Chart zoom/pan | ✅ | Mouse wheel zoom, drag to pan, zoom controls with reset button |

## 1.4 In-App Overlay (`@3lens/overlay`)

### Overlay Shell

| Task | Status | Notes |
|------|--------|-------|
| Create overlay container | ✅ | Fixed position, styled |
| Dockable panel (right side) | ✅ | Left/right position option |
| Toggle button | ✅ | Chevron icon w/ animation |
| Collapse/expand animation | ✅ | CSS transforms |
| Resize handle | ✅ | Corner resize handle with drag support, min size constraints |
| Keyboard shortcut (Ctrl+Shift+D) | ✅ | In example app |

### Panels (Same as Extension)

| Task | Status | Notes |
|------|--------|-------|
| Scene panel | ✅ | Tree view with expand/collapse + inspector |
| Stats panel | ✅ | Grid + chart |

## 1.5 Documentation & Examples

| Task | Status | Notes |
|------|--------|-------|
| Basic README with installation | ✅ | Enhanced with quickstart, config, examples |
| Simple vanilla three.js example | ✅ | `examples/basic` created |
| API documentation (partial) | ✅ | `docs/API.md` with full usage guide |
| Package READMEs | ✅ | Added to `@3lens/core` and `@3lens/overlay` |

## 1.6 Phase 1 Validation

| Criteria | Status | Notes |
|----------|--------|-------|
| Can inspect scene graph of any three.js app | ✅ | Auto-injected probe streams full snapshots |
| Shows real-time performance stats | ✅ | Frame metrics mirrored in extension + overlay |
| Works in extension mode | ✅ | MV3 build ships injected probe + devtools panel |
| Works in npm/overlay mode | ✅ | One-call overlay bootstrap helper |
| Performance overhead < 5% | 🔄 | Benchmark helper added; needs validation run |

---

# Phase 2: Core Features

**Goal:** Complete inspection capabilities and add interactive debugging.  
**Target Duration:** 3-4 months  
**Status:** ⚪ Not Started

## 2.1 Enhanced Inspection

### Materials Inspector

| Task | Status | Notes |
|------|--------|-------|
| List all materials with types | ⬜ | |
| Property editor (color, opacity, roughness) | ⬜ | |
| Shader source viewer | ⬜ | |
| Syntax highlighting for GLSL | ⬜ | |
| Live property editing | ⬜ | |
| Uniforms display | ⬜ | |
| Defines display | ⬜ | |

### Geometry Inspector

| Task | Status | Notes |
|------|--------|-------|
| Vertex count display | ⬜ | |
| Index count display | ⬜ | |
| Attribute list | ⬜ | |
| Memory estimate | ⬜ | |
| Bounding box visualization | ⬜ | |
| Wireframe toggle | ⬜ | |
| Normals visualization | ⬜ | |

### Textures Panel

| Task | Status | Notes |
|------|--------|-------|
| Texture list with thumbnails | ⬜ | |
| Size/format/mipmap info | ⬜ | |
| Memory usage display | ⬜ | |
| Usage tracking (which materials) | ⬜ | |
| Texture preview modal | ⬜ | |
| Channel toggle (RGB/A) | ⬜ | |

### Render Targets Panel

| Task | Status | Notes |
|------|--------|-------|
| Render target thumbnail grid | ⬜ | |
| Click to inspect | ⬜ | |
| Pixel value display | ⬜ | |
| Channel toggles (RGB/A/Depth) | ⬜ | |
| Heatmap visualization | ⬜ | |
| Save as image | ⬜ | |

## 2.2 Interactive Debugging

### Object Selection via Raycasting

| Task | Status | Notes |
|------|--------|-------|
| "Inspect" mode toggle | ⬜ | |
| Raycasting implementation | ⬜ | |
| Click to select objects | ⬜ | |
| Hover highlighting | ⬜ | |
| Cursor change in inspect mode | ⬜ | |

### Visual Overlays

| Task | Status | Notes |
|------|--------|-------|
| Bounding box display (BoxHelper) | ⬜ | |
| Selection outline | ⬜ | |
| Wireframe toggle per object | ⬜ | |
| Global wireframe toggle | ⬜ | |

### Transform Gizmos

| Task | Status | Notes |
|------|--------|-------|
| Translate gizmo | ⬜ | |
| Rotate gizmo | ⬜ | |
| Scale gizmo | ⬜ | |
| Local vs world space toggle | ⬜ | |
| Snap to grid option | ⬜ | |
| Undo/redo for changes | ⬜ | |

### Camera Controls

| Task | Status | Notes |
|------|--------|-------|
| "Focus on object" command | ⬜ | |
| Fly-to animation | ⬜ | |
| Camera info display | ⬜ | |
| Camera switching | ⬜ | |

## 2.3 Performance Enhancements

### GPU Timing (WebGL)

| Task | Status | Notes |
|------|--------|-------|
| `EXT_disjoint_timer_query` detection | ✅ | webgl-adapter.ts detects EXT_disjoint_timer_query_webgl2 |
| Query creation/management | ✅ | gl.createQuery/beginQuery/endQuery/deleteQuery |
| Per-frame GPU time | ✅ | Stored in FrameStats.gpuTimeMs |
| Graceful fallback when unavailable | ✅ | try/catch blocks, returns undefined when unavailable |

### Performance Timeline

| Task | Status | Notes |
|------|--------|-------|
| Frame time chart | ⬜ | |
| CPU vs GPU breakdown | ⬜ | |
| Spike detection | ⬜ | |
| Zoom/pan through history | ⬜ | |
| Frame selection | ⬜ | |

### Object Cost Analysis

| Task | Status | Notes |
|------|--------|-------|
| Triangle count per object | ⬜ | |
| Material complexity estimate | ⬜ | |
| Cost heatmap overlay | ⬜ | |
| Sort objects by cost | ⬜ | |

## 2.4 Resource Tracking

### Resource Lifecycle Events

| Task | Status | Notes |
|------|--------|-------|
| Track geometry creation/disposal | ⬜ | |
| Track material creation/disposal | ⬜ | |
| Track texture creation/disposal | ⬜ | |
| Stack traces (optional) | ⬜ | |
| Timeline view of events | ⬜ | |

### Leak Detection

| Task | Status | Notes |
|------|--------|-------|
| Orphaned resources warning | ⬜ | |
| Undisposed resources after N frames | ⬜ | |
| Memory growth alerts | ⬜ | |
| Leak report generation | ⬜ | |

### Memory Panel

| Task | Status | Notes |
|------|--------|-------|
| Total GPU memory estimate | ⬜ | |
| Breakdown by resource type | ⬜ | |
| Memory trend chart | ⬜ | |

## 2.5 Configuration System

| Task | Status | Notes |
|------|--------|-------|
| Config file loading (`3lens.config.js`) | ⬜ | |
| Performance thresholds | ⬜ | |
| Sampling options | ⬜ | |
| Rule definitions | ⬜ | |
| Rule violation warnings | ⬜ | |

## 2.6 Firefox Extension

| Task | Status | Notes |
|------|--------|-------|
| Port Chrome extension to Firefox | ⬜ | |
| Firefox DevTools integration | ⬜ | |
| Firefox Add-ons submission | ⬜ | |

---

# Phase 3: Enterprise Features

**Goal:** Add features for teams and production debugging workflows.  
**Target Duration:** 3-4 months  
**Status:** ⚪ Not Started

## 3.1 Framework Bridges

### React Bridge (`@3lens/react-bridge`)

| Task | Status | Notes |
|------|--------|-------|
| `ThreeLensProvider` context | ⬜ | |
| `useDevtoolEntity` hook | ⬜ | |
| `useThreeLensProbe` hook | ⬜ | |
| `useSelectedObject` hook | ⬜ | |
| `useMetric` hook | ⬜ | |
| React Three Fiber auto-detection | ⬜ | |
| R3F Canvas wrapper | ⬜ | |

### Angular Bridge (`@3lens/angular-bridge`)

| Task | Status | Notes |
|------|--------|-------|
| `THREELENS_PROBE` injection token | ⬜ | |
| `ThreeLensEntityDirective` | ⬜ | |
| `ThreeLensService` | ⬜ | |
| Module helper for Nx libs | ⬜ | |

### Vue Bridge (`@3lens/vue-bridge`)

| Task | Status | Notes |
|------|--------|-------|
| `provide/inject` integration | ⬜ | |
| `useDevtoolEntity` composable | ⬜ | |
| TresJS compatibility | ⬜ | |

## 3.2 Logical Entities

| Task | Status | Notes |
|------|--------|-------|
| `registerLogicalEntity()` API | ⬜ | |
| `updateLogicalEntity()` API | ⬜ | |
| `unregisterLogicalEntity()` API | ⬜ | |
| Module ID support | ⬜ | |
| Component → Object mapping | ⬜ | |
| Two-way navigation (component ↔ object) | ⬜ | |
| Filter by module | ⬜ | |
| Module-level metrics | ⬜ | |

## 3.3 Plugin System

### Plugin API

| Task | Status | Notes |
|------|--------|-------|
| `DevtoolPlugin` interface | ⬜ | |
| `DevtoolContext` interface | ⬜ | |
| `registerPanel()` API | ⬜ | |
| `registerToolbarAction()` API | ⬜ | |
| `registerContextMenuItem()` API | ⬜ | |
| Plugin message handling | ⬜ | |
| Plugin state storage | ⬜ | |

### Plugin Loading

| Task | Status | Notes |
|------|--------|-------|
| Load plugins from npm packages | ⬜ | |
| Dynamic plugin registration | ⬜ | |
| Plugin settings UI | ⬜ | |

### Built-in Plugins

| Task | Status | Notes |
|------|--------|-------|
| LOD Checker plugin | ⬜ | |
| Shadow Map Debugger plugin | ⬜ | |

## 3.4 Standalone Application

### Electron App Shell

| Task | Status | Notes |
|------|--------|-------|
| Electron setup | ⬜ | |
| WebSocket server | ⬜ | |
| Multi-app support (tabs) | ⬜ | |
| Session persistence | ⬜ | |
| Window management | ⬜ | |

### Session Recording

| Task | Status | Notes |
|------|--------|-------|
| Record frame stats | ⬜ | |
| Record snapshots | ⬜ | |
| Record events | ⬜ | |
| Recording controls (start/stop) | ⬜ | |
| Recording size limits | ⬜ | |

### Session Playback

| Task | Status | Notes |
|------|--------|-------|
| Load recorded sessions | ⬜ | |
| Scrub through timeline | ⬜ | |
| Compare two sessions | ⬜ | |
| Diff visualization | ⬜ | |

### Export Capabilities

| Task | Status | Notes |
|------|--------|-------|
| Export to JSON | ⬜ | |
| Export to CSV (metrics) | ⬜ | |
| PDF report generation | ⬜ | |

## 3.5 CI Integration

### Headless Mode

| Task | Status | Notes |
|------|--------|-------|
| Run without UI | ⬜ | |
| Scripted interactions | ⬜ | |
| Metric collection | ⬜ | |
| Timeout handling | ⬜ | |

### CI Reporter

| Task | Status | Notes |
|------|--------|-------|
| JSON output | ⬜ | |
| JUnit XML format | ⬜ | |
| GitHub Actions integration | ⬜ | |
| Console summary | ⬜ | |

### Performance Regression Detection

| Task | Status | Notes |
|------|--------|-------|
| Compare against baseline | ⬜ | |
| Configurable thresholds | ⬜ | |
| Pass/fail exit codes | ⬜ | |
| Regression report | ⬜ | |

## 3.6 WebGPU Support

### WebGPU Adapter

| Task | Status | Notes |
|------|--------|-------|
| Detect `WebGPURenderer` | ⬜ | |
| Frame stats collection | ⬜ | |
| Resource tracking | ⬜ | |

### WebGPU-Specific UI

| Task | Status | Notes |
|------|--------|-------|
| Pipelines panel | ⬜ | |
| Bind groups view | ⬜ | |
| WGSL shader viewer | ⬜ | |

### GPU Timing (WebGPU)

| Task | Status | Notes |
|------|--------|-------|
| Timestamp queries setup | ⬜ | |
| Per-pass breakdown | ⬜ | |
| Query result readback | ⬜ | |

---

# Phase 4: Ecosystem & Polish

**Goal:** Polish UX, build community, and prepare for stable release.  
**Target Duration:** 2-3 months  
**Status:** ⚪ Not Started

## 4.1 UX Polish

| Task | Status | Notes |
|------|--------|-------|
| Light theme | ⬜ | |
| Dark theme | ⬜ | |
| Auto theme detection | ⬜ | |
| Custom theme API | ⬜ | |
| Panel resizing improvements | ⬜ | |
| Mobile-friendly overlay | ⬜ | |
| Keyboard shortcuts | ⬜ | |
| Command palette | ⬜ | |
| Screen reader support | ⬜ | |
| Keyboard navigation | ⬜ | |

## 4.2 Documentation

| Task | Status | Notes |
|------|--------|-------|
| Complete API reference | ⬜ | |
| TypeDoc generation | ⬜ | |
| Getting Started guide | ⬜ | |
| React/R3F guide | ⬜ | |
| Angular guide | ⬜ | |
| Vue/TresJS guide | ⬜ | |
| Plugin development guide | ⬜ | |
| CI integration guide | ⬜ | |

## 4.3 Example Projects

| Task | Status | Notes |
|------|--------|-------|
| Vanilla three.js example | ⬜ | |
| React Three Fiber example | ⬜ | |
| Angular + three.js example | ⬜ | |
| Vue + TresJS example | ⬜ | |
| Performance debugging example | ⬜ | |

## 4.4 Community

| Task | Status | Notes |
|------|--------|-------|
| Plugin template repository | ⬜ | |
| Community plugins directory | ⬜ | |
| Discord server | ⬜ | |
| GitHub Discussions setup | ⬜ | |
| Issue templates | ⬜ | |
| PR templates | ⬜ | |

## 4.5 Performance Optimization

| Task | Status | Notes |
|------|--------|-------|
| Lazy initialization | ⬜ | |
| Sampling optimization | ⬜ | |
| Memory pooling | ⬜ | |
| Virtual scrolling for large trees | ⬜ | |
| Memoization | ⬜ | |
| Web Worker for processing | ⬜ | |

## 4.6 Testing & Quality

| Task | Status | Notes |
|------|--------|-------|
| Unit tests for core (>80% coverage) | ⬜ | |
| Unit tests for bridges (>70% coverage) | ⬜ | |
| Extension E2E tests | ⬜ | |
| Overlay E2E tests | ⬜ | |
| Performance benchmarks | ⬜ | |
| Memory leak tests | ⬜ | |

## 4.7 Release Preparation

| Task | Status | Notes |
|------|--------|-------|
| Changelog generation | ⬜ | |
| npm publish workflow | ⬜ | |
| Chrome Web Store submission | ⬜ | |
| Firefox Add-ons submission | ⬜ | |
| GitHub Releases automation | ⬜ | |
| Version 1.0.0 release | ⬜ | |

---

# Statistics

## Task Counts

| Phase | Total Tasks | Completed | In Progress | Remaining |
|-------|-------------|-----------|-------------|-----------|
| Phase 1 | 69 | 68 | 1 | 0 |
| Phase 2 | 78 | 4 | 0 | 74 |
| Phase 3 | 72 | 0 | 0 | 72 |
| Phase 4 | 47 | 0 | 0 | 47 |
| **Total** | **266** | **72** | **1** | **193** |

## Timeline

```
Phase 1  [                              ] Dec 2025 - Feb 2026
Phase 2  [                              ] Mar 2026 - Jun 2026
Phase 3  [                              ] Jul 2026 - Oct 2026
Phase 4  [                              ] Nov 2026 - Jan 2027
```

---

*This document is updated as development progresses. Check the commit history for changes.*
