# 3Lens Development Progress

> **Last Updated:** December 28, 2025  
> **Current Phase:** Phase 3 - Enterprise Features  
> **Overall Progress:** ██████████░░░░░░░░░░ 50%

---

## Quick Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundation (MVP) | ✅ Complete | ██████████ 100% |
| Phase 2: Core Features | ✅ Complete | ██████████ 100% |
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
**Status:** ✅ Complete

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
| Implement `postMessage` transport | ✅ | For iframe/cross-context mode |
| Implement direct-call transport | ✅ | For overlay mode |
| Message serialization | ✅ | JSON wrapper |
| Connection state management | ✅ | isConnected() + callbacks |

## 1.3 In-App Overlay (`@3lens/overlay`)

### Overlay Shell

| Task | Status | Notes |
|------|--------|-------|
| Create overlay container | ✅ | Fixed position, styled |
| Dockable panel (right side) | ✅ | Left/right position option |
| Toggle button | ✅ | Chevron icon w/ animation |
| Collapse/expand animation | ✅ | CSS transforms |
| Resize handle | ✅ | Corner resize handle with drag support, min size constraints |
| Keyboard shortcut (Ctrl+Shift+D) | ✅ | In example app |

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

## 1.4 Documentation & Examples

| Task | Status | Notes |
|------|--------|-------|
| Basic README with installation | ✅ | Enhanced with quickstart, config, examples |
| Simple vanilla three.js example | ✅ | `examples/basic` created |
| API documentation (partial) | ✅ | `docs/API.md` with full usage guide |
| Package READMEs | ✅ | Added to `@3lens/core` and `@3lens/overlay` |

## 1.5 Phase 1 Validation

| Criteria | Status | Notes |
|----------|--------|-------|
| Can inspect scene graph of any three.js app | ✅ | Auto-injected probe streams full snapshots |
| Shows real-time performance stats | ✅ | Frame metrics displayed in overlay |
| Works as npm package | ✅ | One-call overlay bootstrap helper |
| Performance overhead < 5% | ✅ | Validated via benchmark page at `/benchmark.html` |

---

# Phase 2: Core Features

**Goal:** Complete inspection capabilities and add interactive debugging.  
**Target Duration:** 3-4 months  
**Status:** ✅ Complete

## 2.1 Enhanced Inspection

### Materials Inspector

| Task | Status | Notes |
|------|--------|-------|
| List all materials with types | ✅ | Full material list with type icons, color swatches, and usage counts |
| Property editor (color, opacity, roughness) | ✅ | Read-only display of all material properties including PBR values |
| Shader source viewer | ✅ | Vertex/fragment shader display with truncation for long shaders |
| Syntax highlighting for GLSL | ✅ | Custom tokenizer with keyword/builtin/comment highlighting |
| Live property editing | ✅ | Color pickers, sliders, toggles, dropdowns with real-time updates |
| Uniforms display | ✅ | Full uniform list with types and values |
| Defines display | ✅ | Shader defines shown as labeled chips |

### Geometry Inspector

| Task | Status | Notes |
|------|--------|-------|
| Vertex count display | ✅ | Shown in geometry list and inspector |
| Index count display | ✅ | Shows indexed status and count |
| Attribute list | ✅ | Full table with name, size, type, and memory |
| Memory estimate | ✅ | Per-attribute and total GPU memory estimate |
| Bounding box visualization | ✅ | Toggle button creates BoxHelper |
| Wireframe toggle | ✅ | Toggle button enables wireframe on materials |
| Normals visualization | ✅ | Toggle button shows vertex normals as lines |

### Textures Panel

| Task | Status | Notes |
|------|--------|-------|
| Texture list with thumbnails | ✅ | Thumbnails auto-generated for 2D textures (64px max) |
| Size/format/mipmap info | ✅ | Full details: format, data type, mipmaps, filtering, wrapping |
| Memory usage display | ✅ | Per-texture GPU memory estimate with summary totals |
| Usage tracking (which materials) | ✅ | Shows slot name + material name/UUID for each usage |
| Texture preview modal | ✅ | Inline preview with checkerboard background |
| Channel toggle (RGB/A) | ✅ | RGB, R, G, B, A channel buttons with CSS filters |

### Render Targets Panel

| Task | Status | Notes |
|------|--------|-------|
| Render target thumbnail grid | ✅ | Grid layout with 16:9 aspect thumbnails, icons for empty RT |
| Click to inspect | ✅ | Selection with full inspector panel |
| Pixel value display | ✅ | Coordinate tracking on hover (value readback pending) |
| Channel toggles (RGB/A/Depth) | ✅ | RGB, R, G, B, A, Depth, Heatmap mode buttons |
| Heatmap visualization | ✅ | CSS filter-based depth heatmap |
| Save as image | ✅ | Download color and depth as PNG |
| Zoom controls | ✅ | In/out/fit zoom for preview |
| Buffer info display | ✅ | Depth, stencil, depth texture, MSAA indicators |
| MRT support | ✅ | Multiple Render Target attachment display |

## 2.2 Interactive Debugging

### Object Selection via Raycasting

| Task | Status | Notes |
|------|--------|-------|
| "Inspect" mode toggle | ✅ | `setInspectModeEnabled()` method added to DevtoolProbe |
| Raycasting implementation | ✅ | `InspectMode` class with THREE.Raycaster integration |
| Click to select objects | ✅ | Pointer events trigger `selectObject()` via raycasting |
| Hover highlighting | ✅ | Uses `SelectionHelper.highlightHover()` for visual feedback |
| Cursor change in inspect mode | ✅ | Canvas cursor changes to 'crosshair' when enabled |

### Visual Overlays

| Task | Status | Notes |
|------|--------|-------|
| Bounding box display (BoxHelper) | ✅ | SelectionHelper shows box on selection; per-object toggle in inspector |
| Selection outline | ✅ | BoxHelper with cyan color on selected, blue on hover |
| Wireframe toggle per object | ✅ | Toggle in Visual Overlays section of inspector |
| Global wireframe toggle | ✅ | Applies wireframe to all meshes in all scenes |

### Transform Gizmos

| Task | Status | Notes |
|------|--------|-------|
| Translate gizmo | ✅ | TransformControls with W key shortcut |
| Rotate gizmo | ✅ | E key shortcut |
| Scale gizmo | ✅ | R key shortcut |
| Local vs world space toggle | ✅ | Button to switch between world/local |
| Snap to grid option | ✅ | Toggle with configurable snap values |
| Undo/redo for changes | ✅ | Full history with Ctrl+Z/Ctrl+Shift+Z support |

### Camera Controls

| Task | Status | Notes |
|------|--------|-------|
| "Focus on object" command | ✅ | Instant focus with automatic framing |
| Fly-to animation | ✅ | Smooth eased animation (800ms default) |
| Camera info display | ✅ | Shows type, FOV, near/far, position |
| Camera switching | ✅ | List all scene cameras and switch between them |

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
| Frame time chart | ✅ | Implemented with CPU and GPU visualization |
| CPU vs GPU breakdown | ✅ | Dual-layer chart showing both metrics |
| Spike detection | ✅ | Highlights frames exceeding 33.33ms threshold |
| Zoom/pan through history | ✅ | Mouse wheel zoom, drag to pan, zoom controls |
| Frame selection | ✅ | Click frames to view detailed stats |

### Object Cost Analysis

| Task | Status | Notes |
|------|--------|-------|
| Triangle count per object | ✅ | Shows in Cost Analysis section (faceCount), normalized to 1 point per 1000 triangles |
| Material complexity estimate | ✅ | Scores materials 1-10 based on type (Basic→Physical), textures, features (normal/env/displacement maps) |
| Cost heatmap overlay | ✅ | Color-coded tree nodes (green=low, yellow=medium, orange=high, red=critical) with cost indicator |
| Sort objects by cost | ✅ | Global Tools shows Cost Ranking with top 5 meshes sorted by total cost, clickable to select |

## 2.4 Resource Tracking

### Resource Lifecycle Events

| Task | Status | Notes |
|------|--------|-------|
| Track geometry creation/disposal | ✅ | ResourceLifecycleTracker records created/disposed events with memory estimates |
| Track material creation/disposal | ✅ | Tracks material type, attached meshes, textures |
| Track texture creation/disposal | ✅ | Tracks texture slot (map, normalMap, etc.), memory estimate |
| Stack traces (optional) | ✅ | Toggle in Resources tab - captures stack traces for debugging (performance impact) |
| Timeline view of events | ✅ | Resources tab with summary, potential leaks, bar chart timeline (60s), event list |

### Leak Detection

| Task | Status | Notes |
|------|--------|-------|
| Orphaned resources warning | ✅ | Detects resources not attached to any mesh, shown in Resources tab |
| Undisposed resources after N frames | ✅ | Configurable threshold (default 60s), generates alerts |
| Memory growth alerts | ✅ | Tracks memory history, alerts on consistent growth >50MB |
| Leak report generation | ✅ | Full report with stats, alerts, recommendations - outputs to console |

### Memory Panel

| Task | Status | Notes |
|------|--------|-------|
| Total GPU memory estimate | ✅ | Shows in header with rising/falling/stable trend indicator |
| Breakdown by resource type | ✅ | Visual bar chart showing textures, geometry, render targets with percentages |
| Memory trend chart | ✅ | SVG line chart showing memory over 60 seconds with gradient fill |

## 2.5 Configuration System

| Task | Status | Notes |
|------|--------|-------|
| Config file loading (`3lens.config.js`) | ✅ | ConfigLoader with static loadFromFile() and autoLoadConfig() |
| Performance thresholds | ✅ | DEFAULT_THRESHOLDS for all metrics, configurable at runtime |
| Sampling options | ✅ | DEFAULT_SAMPLING for frame stats, snapshots, GPU timing, resource tracking |
| Rule definitions | ✅ | Built-in rules + custom rules via CustomRule interface |
| Rule violation warnings | ✅ | Violations shown in Overview tab with severity badges, dismissable |

---

# Phase 3: Enterprise Features

**Goal:** Add features for teams and production debugging workflows.  
**Target Duration:** 3-4 months  
**Status:** ⚪ Not Started

## 3.1 Framework Bridges

### React Bridge (`@3lens/react-bridge`)

| Task | Status | Notes |
|------|--------|-------|
| `ThreeLensProvider` context | ✅ | Provider with probe init, keyboard shortcuts, overlay control |
| `useDevtoolEntity` hook | ✅ | Register objects with names, modules, metadata, tags |
| `useThreeLensProbe` hook | ✅ | Access probe instance directly |
| `useSelectedObject` hook | ✅ | Selection state, select/clear functions, isSelected check |
| `useMetric` hook | ✅ | Generic + convenience hooks (useFPS, useDrawCalls, etc.) |
| React Three Fiber auto-detection | ✅ | createR3FConnector() factory with useThree/useFrame |
| R3F Canvas wrapper | ✅ | ThreeLensCanvas component with auto-integration |

### Angular Bridge (`@3lens/angular-bridge`)

| Task | Status | Notes |
|------|--------|-------|
| `THREELENS_PROBE` injection token | ✅ | Plus THREELENS_CONFIG token for configuration |
| `ThreeLensEntityDirective` | ✅ | Standalone directive with Input bindings for name, module, metadata, tags |
| `ThreeLensService` | ✅ | Full service with RxJS observables (fps$, drawCalls$, etc.), lifecycle methods |
| Module helper for Nx libs | ✅ | NxLibraryHelper class with scoped registration, createNxLibraryHelper factory |

### Vue Bridge (`@3lens/vue-bridge`)

| Task | Status | Notes |
|------|--------|-------|
| `provide/inject` integration | ✅ | ThreeLensPlugin, createThreeLens, ThreeLensKey injection key |
| `useDevtoolEntity` composable | ✅ | Plus useDevtoolEntityGroup for groups, reactive with watch |
| TresJS compatibility | ✅ | useTresProbe, createTresConnector factory for useTres hook |

## 3.2 Logical Entities

| Task | Status | Notes |
|------|--------|-------|
| `registerLogicalEntity()` API | ✅ | Full options: name, module, componentType, componentId, tags, metadata, parentEntityId |
| `updateLogicalEntity()` API | ✅ | Partial updates, handles module/component tracking changes |
| `unregisterLogicalEntity()` API | ✅ | With recursive option for child entities |
| Module ID support | ✅ | Format: '@scope/library' or 'category/name', auto-tracked in moduleEntities Map |
| Component → Object mapping | ✅ | addObjectToEntity/removeObjectFromEntity, stores __3lens_entity in userData |
| Two-way navigation (component ↔ object) | ✅ | navigateFromObject/navigateFromComponent/navigateFromEntity with full NavigationResult |
| Filter by module | ✅ | filterEntities() with module, modulePrefix, tags, anyTag, componentType, nameContains |
| Module-level metrics | ✅ | getModuleInfo() with triangles, drawCalls, gpuMemory, texture/geometry/material counts |

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
| Integration E2E tests | ⬜ | |
| Performance benchmarks | ⬜ | |
| Memory leak tests | ⬜ | |

## 4.7 Release Preparation

| Task | Status | Notes |
|------|--------|-------|
| Changelog generation | ⬜ | |
| npm publish workflow | ⬜ | |
| GitHub Releases automation | ⬜ | |
| Version 1.0.0 release | ⬜ | |

---

# Statistics

## Task Counts

| Phase | Total Tasks | Completed | In Progress | Remaining |
|-------|-------------|-----------|-------------|-----------|
| Phase 1 | 49 | 49 | 0 | 0 |
| Phase 2 | 73 | 73 | 0 | 0 |
| Phase 3 | 72 | 22 | 0 | 50 |
| Phase 4 | 44 | 0 | 0 | 44 |
| **Total** | **238** | **144** | **0** | **94** |

## Timeline

```
Phase 1  [                              ] Dec 2025 - Feb 2026
Phase 2  [                              ] Mar 2026 - Jun 2026
Phase 3  [                              ] Jul 2026 - Oct 2026
Phase 4  [                              ] Nov 2026 - Jan 2027
```

---

*This document is updated as development progresses. Check the commit history for changes.*
