# 3Lens Documentation Plan

> **Created:** January 2, 2026  
> **Purpose:** Comprehensive documentation roadmap for deploying a world-class documentation site  
> **Total Items:** 180+ documentation tasks

---

## Quick Status

| Section | Total | Completed | In Progress | Remaining |
|---------|-------|-----------|-------------|-----------|
| 1. Documentation Structure | 8 | 0 | 0 | 8 |
| 2. Core Package Docs | 42 | 0 | 0 | 42 |
| 3. Overlay Package Docs | 18 | 0 | 0 | 18 |
| 4. UI Package Docs | 12 | 0 | 0 | 12 |
| 5. Framework Bridges | 24 | 0 | 0 | 24 |
| 6. Guides & Tutorials | 28 | 0 | 0 | 28 |
| 7. API Reference | 16 | 0 | 0 | 16 |
| 8. Examples Documentation | 22 | 0 | 0 | 22 |
| 9. Deployment & Infrastructure | 10 | 0 | 0 | 10 |
| **Total** | **180** | **0** | **0** | **180** |

---

## Legend

- ⬜ Not Started
- 🔄 In Progress  
- ✅ Complete
- ⏸️ Blocked
- 🔴 Priority (Do First)

---

# 1. Documentation Structure & Setup

**Goal:** Establish the documentation site infrastructure and navigation.

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 1.1 | Choose documentation framework (VitePress/Docusaurus/Starlight) | ⬜ | 🔴 | Recommend VitePress for Vue ecosystem alignment |
| 1.2 | Set up documentation site scaffolding | ⬜ | 🔴 | Base config, theme, navigation |
| 1.3 | Configure sidebar navigation structure | ⬜ | 🔴 | Hierarchical menu |
| 1.4 | Set up search functionality (Algolia/local) | ⬜ | | Full-text search |
| 1.5 | Configure dark/light theme toggle | ⬜ | | Match 3Lens branding |
| 1.6 | Add logo and branding assets | ⬜ | | Favicon, OG images |
| 1.7 | Set up versioning system | ⬜ | | For v1.x, v2.x docs |
| 1.8 | Configure deployment (Vercel/Netlify/GitHub Pages) | ⬜ | | CI/CD pipeline |

---

# 2. Core Package (`@3lens/core`) Documentation

**Goal:** Document every module, class, function, and type in the core package.

## 2.1 Probe System

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.1.1 | Document `createProbe()` factory function | ⬜ | 🔴 | Main entry point |
| 2.1.2 | Document `DevtoolProbe` class | ⬜ | 🔴 | Full API reference |
| 2.1.3 | Document probe lifecycle methods | ⬜ | 🔴 | init, dispose, connect |
| 2.1.4 | Document `observeRenderer()` method | ⬜ | 🔴 | WebGL/WebGPU support |
| 2.1.5 | Document `observeScene()` method | ⬜ | 🔴 | Scene tracking |
| 2.1.6 | Document inspect mode API | ⬜ | | setInspectModeEnabled |
| 2.1.7 | Document selection API | ⬜ | | selectObject, clearSelection |

## 2.2 Configuration System

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.2.1 | Document `ProbeConfig` interface | ⬜ | 🔴 | All config options |
| 2.2.2 | Document performance thresholds | ⬜ | | DEFAULT_THRESHOLDS |
| 2.2.3 | Document sampling options | ⬜ | | DEFAULT_SAMPLING |
| 2.2.4 | Document custom rules system | ⬜ | | CustomRule interface |
| 2.2.5 | Document config file loading | ⬜ | | 3lens.config.js |
| 2.2.6 | Document rule violations API | ⬜ | | Violation callbacks |

## 2.3 Adapters

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.3.1 | Document WebGL adapter | ⬜ | 🔴 | webgl-adapter.ts |
| 2.3.2 | Document WebGPU adapter | ⬜ | 🔴 | webgpu-adapter.ts |
| 2.3.3 | Document GPU timing system | ⬜ | | EXT_disjoint_timer_query |
| 2.3.4 | Document WebGPU timing manager | ⬜ | | webgpu-timing.ts |
| 2.3.5 | Document renderer auto-detection | ⬜ | | isWebGPURenderer |

## 2.4 Observers

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.4.1 | Document SceneObserver class | ⬜ | | Scene graph tracking |
| 2.4.2 | Document scene tree structure | ⬜ | | SceneNode interface |
| 2.4.3 | Document object tracking | ⬜ | | TrackedObjectRef |
| 2.4.4 | Document scene path computation | ⬜ | | /Scene/Object/Child |

## 2.5 Tracking System

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.5.1 | Document PerformanceTracker | ⬜ | | Frame stats collection |
| 2.5.2 | Document ResourceLifecycleTracker | ⬜ | | Creation/disposal events |
| 2.5.3 | Document memory tracking | ⬜ | | GPU memory estimates |
| 2.5.4 | Document leak detection system | ⬜ | | Orphaned resources |

## 2.6 Entities System

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.6.1 | Document LogicalEntityManager | ⬜ | | Entity registration |
| 2.6.2 | Document `registerLogicalEntity()` | ⬜ | | Full options |
| 2.6.3 | Document entity-object mapping | ⬜ | | Two-way navigation |
| 2.6.4 | Document module metrics | ⬜ | | getModuleInfo |
| 2.6.5 | Document entity filtering | ⬜ | | filterEntities |

## 2.7 Plugin System

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.7.1 | Document `DevtoolPlugin` interface | ⬜ | 🔴 | Plugin definition |
| 2.7.2 | Document `DevtoolContext` interface | ⬜ | | Context API |
| 2.7.3 | Document PluginManager | ⬜ | | Lifecycle management |
| 2.7.4 | Document PluginLoader | ⬜ | | npm/URL loading |
| 2.7.5 | Document built-in LOD Checker | ⬜ | | lod-checker.ts |
| 2.7.6 | Document built-in Shadow Debugger | ⬜ | | shadow-debugger.ts |
| 2.7.7 | Document plugin settings schema | ⬜ | | Field definitions |

## 2.8 Transport Layer

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.8.1 | Document Transport interface | ⬜ | | transport.ts |
| 2.8.2 | Document postMessage transport | ⬜ | | Cross-context mode |
| 2.8.3 | Document direct-call transport | ⬜ | | Overlay mode |
| 2.8.4 | Document message serialization | ⬜ | | JSON wrapper |

## 2.9 Utilities

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.9.1 | Document ObjectPool | ⬜ | | Memory pooling |
| 2.9.2 | Document Memoization utilities | ⬜ | | LRUCache, memoize |
| 2.9.3 | Document WorkerProcessor | ⬜ | | Web Worker tasks |
| 2.9.4 | Document performance calculator | ⬜ | | Cost analysis |

## 2.10 Types Reference

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.10.1 | Document FrameStats interface | ⬜ | 🔴 | Core stats type |
| 2.10.2 | Document SceneSnapshot interface | ⬜ | | Full scene state |
| 2.10.3 | Document MaterialInfo interface | ⬜ | | Material data |
| 2.10.4 | Document GeometryInfo interface | ⬜ | | Geometry data |
| 2.10.5 | Document TextureInfo interface | ⬜ | | Texture data |
| 2.10.6 | Document RenderTargetInfo interface | ⬜ | | RT data |
| 2.10.7 | Document all common types | ⬜ | | common.ts |

---

# 3. Overlay Package (`@3lens/overlay`) Documentation

**Goal:** Document the visual overlay system and all its components.

## 3.1 Core Overlay

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 3.1.1 | Document `createOverlay()` function | ⬜ | 🔴 | Main entry |
| 3.1.2 | Document `bootstrapOverlay()` helper | ⬜ | 🔴 | One-line setup |
| 3.1.3 | Document Overlay class | ⬜ | | Full API |
| 3.1.4 | Document overlay positioning | ⬜ | | Left/right docking |
| 3.1.5 | Document resize behavior | ⬜ | | Min size, constraints |
| 3.1.6 | Document keyboard shortcuts | ⬜ | | Ctrl+Shift+D |

## 3.2 Components

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 3.2.1 | Document Scene Explorer panel | ⬜ | | Tree view |
| 3.2.2 | Document Object Inspector panel | ⬜ | | Property display |
| 3.2.3 | Document Stats panel | ⬜ | | FPS, draw calls |
| 3.2.4 | Document Materials panel | ⬜ | | Material list |
| 3.2.5 | Document Geometries panel | ⬜ | | Geometry list |
| 3.2.6 | Document Textures panel | ⬜ | | Texture thumbnails |
| 3.2.7 | Document Render Targets panel | ⬜ | | RT inspector |
| 3.2.8 | Document Resources panel | ⬜ | | Lifecycle events |
| 3.2.9 | Document Memory panel | ⬜ | | Memory breakdown |

## 3.3 Styling

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 3.3.1 | Document theme system | ⬜ | | Light/dark themes |
| 3.3.2 | Document CSS custom properties | ⬜ | | Customization |
| 3.3.3 | Document mobile responsiveness | ⬜ | | Touch targets |

---

# 4. UI Package (`@3lens/ui`) Documentation

**Goal:** Document reusable UI components for building custom interfaces.

## 4.1 Panels

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 4.1.1 | Document Materials panel component | ⬜ | | materials.ts |
| 4.1.2 | Document Geometry panel component | ⬜ | | geometry.ts |
| 4.1.3 | Document Textures panel component | ⬜ | | textures.ts |
| 4.1.4 | Document RenderTargets panel component | ⬜ | | renderTargets.ts |

## 4.2 Utilities

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 4.2.1 | Document VirtualScroller | ⬜ | | Large list rendering |
| 4.2.2 | Document tree flattening | ⬜ | | Scene tree |
| 4.2.3 | Document formatters | ⬜ | | Number, memory |
| 4.2.4 | Document chart components | ⬜ | | Frame time chart |

## 4.3 Styling

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 4.3.1 | Document component styles | ⬜ | | CSS architecture |
| 4.3.2 | Document icon system | ⬜ | | Object type icons |
| 4.3.3 | Document color system | ⬜ | | Cost heatmap colors |
| 4.3.4 | Document accessibility features | ⬜ | | ARIA, focus |

---

# 5. Framework Bridge Documentation

**Goal:** Document each framework integration package thoroughly.

## 5.1 React Bridge (`@3lens/react-bridge`)

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 5.1.1 | Document `ThreeLensProvider` | ⬜ | 🔴 | Context provider |
| 5.1.2 | Document `useDevtoolEntity` hook | ⬜ | 🔴 | Entity registration |
| 5.1.3 | Document `useThreeLensProbe` hook | ⬜ | | Probe access |
| 5.1.4 | Document `useSelectedObject` hook | ⬜ | | Selection state |
| 5.1.5 | Document `useMetric` hook | ⬜ | | Generic metrics |
| 5.1.6 | Document `useFPS` hook | ⬜ | | FPS shortcut |
| 5.1.7 | Document `useDrawCalls` hook | ⬜ | | Draw calls shortcut |
| 5.1.8 | Document R3F integration | ⬜ | 🔴 | createR3FConnector |
| 5.1.9 | Document `ThreeLensCanvas` | ⬜ | | R3F Canvas wrapper |

## 5.2 Angular Bridge (`@3lens/angular-bridge`)

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 5.2.1 | Document `THREELENS_PROBE` token | ⬜ | 🔴 | Injection token |
| 5.2.2 | Document `THREELENS_CONFIG` token | ⬜ | | Config token |
| 5.2.3 | Document `ThreeLensService` | ⬜ | 🔴 | Full service |
| 5.2.4 | Document RxJS observables | ⬜ | | fps$, drawCalls$ |
| 5.2.5 | Document `ThreeLensEntityDirective` | ⬜ | | Entity directive |
| 5.2.6 | Document `ThreeLensModule` | ⬜ | | Module setup |
| 5.2.7 | Document NxLibraryHelper | ⬜ | | Nx workspace support |

## 5.3 Vue Bridge (`@3lens/vue-bridge`)

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 5.3.1 | Document `createThreeLens` | ⬜ | 🔴 | Factory function |
| 5.3.2 | Document `ThreeLensPlugin` | ⬜ | 🔴 | Vue plugin |
| 5.3.3 | Document `useDevtoolEntity` composable | ⬜ | | Entity registration |
| 5.3.4 | Document `useDevtoolEntityGroup` | ⬜ | | Group registration |
| 5.3.5 | Document provide/inject pattern | ⬜ | | ThreeLensKey |
| 5.3.6 | Document TresJS integration | ⬜ | 🔴 | useTresProbe |
| 5.3.7 | Document `createTresConnector` | ⬜ | | TresJS connector |
| 5.3.8 | Document reactive watchers | ⬜ | | Auto-cleanup |

---

# 6. Guides & Tutorials

**Goal:** Create comprehensive guides for different use cases and skill levels.

## 6.1 Getting Started Series

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 6.1.1 | Review/enhance Getting Started guide | ⬜ | 🔴 | Existing file |
| 6.1.2 | Add installation troubleshooting | ⬜ | | Common issues |
| 6.1.3 | Add first debugging session walkthrough | ⬜ | | Step-by-step |
| 6.1.4 | Add configuration deep dive | ⬜ | | All options |

## 6.2 Framework Guides

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 6.2.1 | Review/enhance React/R3F guide | ⬜ | 🔴 | Existing file |
| 6.2.2 | Review/enhance Angular guide | ⬜ | 🔴 | Existing file |
| 6.2.3 | Review/enhance Vue/TresJS guide | ⬜ | 🔴 | Existing file |
| 6.2.4 | Add Svelte/Threlte guide | ⬜ | | New guide |
| 6.2.5 | Add vanilla three.js guide | ⬜ | | Detailed vanilla |

## 6.3 Feature Guides

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 6.3.1 | Scene inspection guide | ⬜ | | Tree navigation |
| 6.3.2 | Performance debugging guide | ⬜ | | Stats, timeline |
| 6.3.3 | Memory profiling guide | ⬜ | | Leak detection |
| 6.3.4 | Transform gizmos guide | ⬜ | | Manipulation |
| 6.3.5 | Camera controls guide | ⬜ | | Focus, fly-to |
| 6.3.6 | Material editing guide | ⬜ | | Live editing |
| 6.3.7 | Shader debugging guide | ⬜ | | GLSL/WGSL viewer |

## 6.4 Advanced Guides

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 6.4.1 | Review/enhance Plugin Development guide | ⬜ | | Existing file |
| 6.4.2 | Review/enhance CI Integration guide | ⬜ | | Existing file |
| 6.4.3 | Custom rules guide | ⬜ | | Rule definitions |
| 6.4.4 | WebGPU debugging guide | ⬜ | | WebGPU-specific |
| 6.4.5 | Large scene optimization guide | ⬜ | | Best practices |
| 6.4.6 | Logical entities guide | ⬜ | | Module-level tracking |

## 6.5 Migration & Upgrade

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 6.5.1 | Migration from lil-gui | ⬜ | | Competitive |
| 6.5.2 | Migration from three-inspect | ⬜ | | Competitive |
| 6.5.3 | Version upgrade guide | ⬜ | | Breaking changes |

---

# 7. API Reference Documentation

**Goal:** Generate and enhance comprehensive API documentation.

## 7.1 TypeDoc Enhancement

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 7.1.1 | Review TypeDoc configuration | ⬜ | | typedoc.json |
| 7.1.2 | Add JSDoc comments to all exports | ⬜ | 🔴 | @3lens/core |
| 7.1.3 | Add JSDoc comments to overlay | ⬜ | | @3lens/overlay |
| 7.1.4 | Add JSDoc comments to react-bridge | ⬜ | | All hooks |
| 7.1.5 | Add JSDoc comments to angular-bridge | ⬜ | | Service, directive |
| 7.1.6 | Add JSDoc comments to vue-bridge | ⬜ | | Composables |

## 7.2 API Pages

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 7.2.1 | Create probe API page | ⬜ | | Human-readable |
| 7.2.2 | Create config API page | ⬜ | | All options table |
| 7.2.3 | Create events API page | ⬜ | | All probe events |
| 7.2.4 | Create plugin API page | ⬜ | | Plugin interfaces |
| 7.2.5 | Create types glossary | ⬜ | | Common types |

## 7.3 Code Examples

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 7.3.1 | Add runnable code examples | ⬜ | | StackBlitz links |
| 7.3.2 | Add copy-paste snippets | ⬜ | | Common patterns |
| 7.3.3 | Add TypeScript examples | ⬜ | | Typed examples |
| 7.3.4 | Add JavaScript examples | ⬜ | | Non-TS users |
| 7.3.5 | Add ESM/CJS examples | ⬜ | | Module formats |

---

# 8. Examples Documentation

**Goal:** Document each example project with setup instructions and explanations.

## 8.1 Framework Integration Examples

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 8.1.1 | Document vanilla-threejs example | ⬜ | 🔴 | README + walkthrough |
| 8.1.2 | Document react-three-fiber example | ⬜ | 🔴 | README + walkthrough |
| 8.1.3 | Document angular-threejs example | ⬜ | | README + walkthrough |
| 8.1.4 | Document vue-tresjs example | ⬜ | | README + walkthrough |
| 8.1.5 | Document svelte-threlte example | ⬜ | | README + walkthrough |
| 8.1.6 | Document nextjs-ssr example | ⬜ | | README + walkthrough |
| 8.1.7 | Document electron-desktop example | ⬜ | | README + walkthrough |

## 8.2 Debugging Examples

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 8.2.1 | Document performance-debugging example | ⬜ | 🔴 | README + walkthrough |
| 8.2.2 | Document memory-leak-detection example | ⬜ | | README + walkthrough |
| 8.2.3 | Document shader-debugging example | ⬜ | | README + walkthrough |
| 8.2.4 | Document large-scene-optimization | ⬜ | | README + walkthrough |

## 8.3 Feature Showcase Examples

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 8.3.1 | Document transform-gizmo example | ⬜ | | README + walkthrough |
| 8.3.2 | Document custom-plugin example | ⬜ | | README + walkthrough |
| 8.3.3 | Document webgpu-features example | ⬜ | | README + walkthrough |
| 8.3.4 | Document configuration-rules example | ⬜ | | README + walkthrough |

## 8.4 Real-World Scenarios

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 8.4.1 | Document 3d-model-viewer example | ⬜ | | README + walkthrough |
| 8.4.2 | Document particle-system example | ⬜ | | README + walkthrough |
| 8.4.3 | Document physics-inspector example | ⬜ | | README + walkthrough |
| 8.4.4 | Document vr-xr-debugging example | ⬜ | | README + walkthrough |

## 8.5 Game Development Examples

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 8.5.1 | Document first-person-shooter example | ⬜ | | README + walkthrough |
| 8.5.2 | Document top-down-rpg example | ⬜ | | README + walkthrough |
| 8.5.3 | Document racing-game example | ⬜ | | README + walkthrough |
| 8.5.4 | Document platformer-physics example | ⬜ | | README + walkthrough |

---

# 9. Deployment & Infrastructure

**Goal:** Set up documentation deployment and maintenance.

## 9.1 Build & Deploy

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 9.1.1 | Configure build pipeline | ⬜ | 🔴 | npm script |
| 9.1.2 | Set up GitHub Actions workflow | ⬜ | 🔴 | Auto-deploy on merge |
| 9.1.3 | Configure custom domain | ⬜ | | docs.3lens.dev |
| 9.1.4 | Set up SSL certificate | ⬜ | | HTTPS |

## 9.2 SEO & Analytics

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 9.2.1 | Add meta tags | ⬜ | | OG, Twitter cards |
| 9.2.2 | Configure sitemap | ⬜ | | XML sitemap |
| 9.2.3 | Add analytics | ⬜ | | Plausible/Fathom |
| 9.2.4 | Add structured data | ⬜ | | JSON-LD |

## 9.3 Maintenance

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 9.3.1 | Set up link checker | ⬜ | | Broken link CI |
| 9.3.2 | Configure spell checker | ⬜ | | cspell or similar |

---

# 10. Content Quality Checklist

Use this checklist for each documentation page:

- [ ] Clear title and introduction
- [ ] Table of contents for long pages
- [ ] Code examples with syntax highlighting
- [ ] TypeScript types shown
- [ ] Links to related pages
- [ ] "See Also" section
- [ ] Reviewed for accuracy
- [ ] Mobile-friendly formatting
- [ ] Accessible (alt text, heading hierarchy)
- [ ] Spell-checked
- [ ] Links tested

---

# Priority Order (Recommended)

## Phase 1: Foundation (Do First)
1. 1.1-1.3 - Documentation site setup
2. 2.1.1-2.1.5 - Core probe documentation
3. 3.1.1-3.1.2 - Overlay entry points
4. 6.1.1 - Getting started guide review
5. 9.1.1-9.1.2 - Build and deploy

## Phase 2: Framework Support
1. 5.1.1-5.1.9 - React bridge (most common)
2. 5.2.1-5.2.7 - Angular bridge
3. 5.3.1-5.3.8 - Vue bridge
4. 6.2.1-6.2.5 - Framework guides

## Phase 3: Core Features
1. 2.2-2.5 - Config, adapters, observers, tracking
2. 3.2.1-3.2.9 - Overlay panels
3. 6.3.1-6.3.7 - Feature guides

## Phase 4: Advanced & Polish
1. 2.6-2.9 - Entities, plugins, transport, utilities
2. 6.4.1-6.4.6 - Advanced guides
3. 7.1-7.3 - API reference enhancement
4. 8.1-8.5 - Example documentation

---

# Notes

- Existing documentation files to review and enhance:
  - `docs/API.md`
  - `docs/API-SPECIFICATION.md`
  - `docs/ARCHITECTURE.md`
  - `docs/PROTOCOL.md`
  - `docs/IMPLEMENTATION-NOTES.md`
  - `docs/CONTRIBUTING.md`
  - `docs/guides/GETTING-STARTED.md`
  - `docs/guides/REACT-R3F-GUIDE.md`
  - `docs/guides/ANGULAR-GUIDE.md`
  - `docs/guides/VUE-TRESJS-GUIDE.md`
  - `docs/guides/PLUGIN-DEVELOPMENT.md`
  - `docs/guides/CI-INTEGRATION.md`

- Generated API docs: `docs/api/` (TypeDoc output)

---

*This document tracks all documentation work. Update status as tasks are completed.*
