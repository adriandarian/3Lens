# 3Lens Documentation Plan

> **Created:** January 2, 2026  
> **Purpose:** Comprehensive documentation roadmap for deploying a world-class documentation site  
> **Total Items:** 180+ documentation tasks

---

## Quick Status

| Section | Total | Completed | In Progress | Remaining |
|---------|-------|-----------|-------------|-----------|
| 1. Documentation Structure | 8 | 8 | 0 | 0 |
| 2. Core Package Docs | 49 | 49 | 0 | 0 |
| 3. Overlay Package Docs | 18 | 18 | 0 | 0 |
| 4. UI Package Docs | 12 | 12 | 0 | 0 |
| 5. Framework Bridges | 24 | 24 | 0 | 0 |
| 6. Guides & Tutorials | 28 | 4 | 0 | 24 |
| 7. API Reference | 16 | 16 | 0 | 0 |
| 8. Examples Documentation | 22 | 11 | 0 | 11 |
| 9. Deployment & Infrastructure | 10 | 0 | 0 | 10 |
| **Total** | **187** | **142** | **0** | **45** |

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
| 1.1 | Choose documentation framework (VitePress/Docusaurus/Starlight) | ✅ | 🔴 | **VitePress** selected. See [ADR-001](decisions/001-documentation-framework.md) |
| 1.2 | Set up documentation site scaffolding | ✅ | 🔴 | Config, theme, landing page created |
| 1.3 | Configure sidebar navigation structure | ✅ | 🔴 | Guide, API, Examples sidebars configured |
| 1.4 | Set up search functionality (Algolia/local) | ✅ | | Local search configured. See [search-config.md](.vitepress/search-config.md) |
| 1.5 | Configure dark/light theme toggle | ✅ | | 3Lens branded colors for both themes |
| 1.6 | Add logo and branding assets | ✅ | | Logo SVGs, favicons, OG image, brand guide |
| 1.7 | Set up versioning system | ✅ | | Version switcher, CLI tool, archive workflow |
| 1.8 | Configure deployment (Vercel/Netlify/GitHub Pages) | ✅ | | GitHub Actions, Vercel, Netlify configs |

---

# 2. Core Package (`@3lens/core`) Documentation

**Goal:** Document every module, class, function, and type in the core package.

## 2.1 Probe System

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.1.1 | Document `createProbe()` factory function | ✅ | 🔴 | Main entry point - [create-probe.md](/api/core/create-probe) |
| 2.1.2 | Document `DevtoolProbe` class | ✅ | 🔴 | Full API reference - [devtool-probe.md](/api/core/devtool-probe) |
| 2.1.3 | Document probe lifecycle methods | ✅ | 🔴 | init, dispose, connect - [probe-lifecycle.md](/api/core/probe-lifecycle) |
| 2.1.4 | Document `observeRenderer()` method | ✅ | 🔴 | WebGL/WebGPU support - [observe-renderer.md](/api/core/observe-renderer) |
| 2.1.5 | Document `observeScene()` method | ✅ | 🔴 | Scene tracking - [observe-scene.md](/api/core/observe-scene) |
| 2.1.6 | Document inspect mode API | ✅ | | setInspectModeEnabled - [inspect-mode-api.md](/api/core/inspect-mode-api) |
| 2.1.7 | Document selection API | ✅ | | selectObject, clearSelection - [selection-api.md](/api/core/selection-api) | |

## 2.2 Configuration System

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.2.1 | Document `ProbeConfig` interface | ✅ | 🔴 | All config options - [probe-config.md](/api/core/probe-config) |
| 2.2.2 | Document performance thresholds | ✅ | | DEFAULT_THRESHOLDS - [performance-thresholds.md](/api/core/performance-thresholds) |
| 2.2.3 | Document sampling options | ✅ | | DEFAULT_SAMPLING - [sampling-config.md](/api/core/sampling-config) |
| 2.2.4 | Document custom rules system | ✅ | | CustomRule interface - [custom-rules.md](/api/core/custom-rules) |
| 2.2.5 | Document config file loading | ✅ | | 3lens.config.js - [config-file-loading.md](/api/core/config-file-loading) |
| 2.2.6 | Document rule violations API | ✅ | | Violation callbacks - [rule-violations.md](/api/core/rule-violations) |

## 2.3 Adapters

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.3.1 | Document WebGL adapter | ✅ | 🔴 | [webgl-adapter.md](/api/core/webgl-adapter) |
| 2.3.2 | Document WebGPU adapter | ✅ | 🔴 | [webgpu-adapter.md](/api/core/webgpu-adapter) |
| 2.3.3 | Document GPU timing system | ✅ | | [gpu-timing.md](/api/core/gpu-timing) |
| 2.3.4 | Document WebGPU timing manager | ✅ | | [webgpu-timing.md](/api/core/webgpu-timing) |
| 2.3.5 | Document renderer auto-detection | ✅ | | [renderer-detection.md](/api/core/renderer-detection) |

## 2.4 Observers

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.4.1 | Document SceneObserver class | ✅ | | [scene-observer.md](/api/core/scene-observer) |
| 2.4.2 | Document scene tree structure | ✅ | | [scene-node.md](/api/core/scene-node) |
| 2.4.3 | Document object tracking | ✅ | | [tracked-object-ref.md](/api/core/tracked-object-ref) |
| 2.4.4 | Document scene path computation | ✅ | | [scene-path.md](/api/core/scene-path) |

## 2.5 Tracking System

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.5.1 | Document PerformanceTracker | ✅ | | [performance-tracker.md](/api/core/performance-tracker) |
| 2.5.2 | Document ResourceLifecycleTracker | ✅ | | [resource-lifecycle-tracker.md](/api/core/resource-lifecycle-tracker) |
| 2.5.3 | Document memory tracking | ✅ | | [memory-tracking.md](/api/core/memory-tracking) |
| 2.5.4 | Document leak detection system | ✅ | | [leak-detection.md](/api/core/leak-detection) |

## 2.6 Entities System

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.6.1 | Document LogicalEntityManager | ✅ | | [logical-entity-manager.md](/api/core/logical-entity-manager) |
| 2.6.2 | Document `registerLogicalEntity()` | ✅ | | [register-logical-entity.md](/api/core/register-logical-entity) |
| 2.6.3 | Document entity-object mapping | ✅ | | [entity-object-mapping.md](/api/core/entity-object-mapping) |
| 2.6.4 | Document module metrics | ✅ | | [module-metrics.md](/api/core/module-metrics) |
| 2.6.5 | Document entity filtering | ✅ | | [entity-filtering.md](/api/core/entity-filtering) |

## 2.7 Plugin System

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.7.1 | Document `DevtoolPlugin` interface | ✅ | 🔴 | [devtool-plugin.md](/api/core/devtool-plugin) |
| 2.7.2 | Document `DevtoolContext` interface | ✅ | | [devtool-context.md](/api/core/devtool-context) |
| 2.7.3 | Document PluginManager | ✅ | | [plugin-manager.md](/api/core/plugin-manager) |
| 2.7.4 | Document PluginLoader | ✅ | | [plugin-loader.md](/api/core/plugin-loader) |
| 2.7.5 | Document built-in LOD Checker | ✅ | | [lod-checker-plugin.md](/api/core/lod-checker-plugin) |
| 2.7.6 | Document built-in Shadow Debugger | ✅ | | [shadow-debugger-plugin.md](/api/core/shadow-debugger-plugin) |
| 2.7.7 | Document plugin settings schema | ✅ | | [plugin-settings-schema.md](/api/core/plugin-settings-schema) |

## 2.8 Transport Layer

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.8.1 | Document Transport interface | ✅ | | [transport-interface.md](/api/core/transport-interface) |
| 2.8.2 | Document postMessage transport | ✅ | | [postmessage-transport.md](/api/core/postmessage-transport) |
| 2.8.3 | Document direct-call transport | ✅ | | [direct-transport.md](/api/core/direct-transport) |
| 2.8.4 | Document message serialization | ✅ | | [message-serialization.md](/api/core/message-serialization) |

## 2.9 Utilities

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.9.1 | Document ObjectPool | ✅ | | [object-pool.md](/api/core/object-pool) |
| 2.9.2 | Document Memoization utilities | ✅ | | [memoization.md](/api/core/memoization) |
| 2.9.3 | Document WorkerProcessor | ✅ | | [worker-processor.md](/api/core/worker-processor) |
| 2.9.4 | Document performance calculator | ✅ | | [performance-calculator.md](/api/core/performance-calculator) |

## 2.10 Types Reference

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.10.1 | Document FrameStats interface | ✅ | 🔴 | [frame-stats.md](/api/core/frame-stats) |
| 2.10.2 | Document SceneSnapshot interface | ✅ | | [scene-snapshot.md](/api/core/scene-snapshot) |
| 2.10.3 | Document MaterialInfo interface | ✅ | | [material-info.md](/api/core/material-info) |
| 2.10.4 | Document GeometryInfo interface | ✅ | | [geometry-info.md](/api/core/geometry-info) |
| 2.10.5 | Document TextureInfo interface | ✅ | | [texture-info.md](/api/core/texture-info) |
| 2.10.6 | Document RenderTargetInfo interface | ✅ | | [render-target-info.md](/api/core/render-target-info) |
| 2.10.7 | Document all common types | ✅ | | [common-types.md](/api/core/common-types) |

---

# 3. Overlay Package (`@3lens/overlay`) Documentation

**Goal:** Document the visual overlay system and all its components.

## 3.1 Core Overlay

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 3.1.1 | Document `createOverlay()` function | ✅ | 🔴 | [create-overlay.md](/api/overlay/create-overlay) |
| 3.1.2 | Document `bootstrapOverlay()` helper | ✅ | 🔴 | [bootstrap-overlay.md](/api/overlay/bootstrap-overlay) |
| 3.1.3 | Document Overlay class | ✅ | | [overlay-class.md](/api/overlay/overlay-class) |
| 3.1.4 | Document overlay positioning | ✅ | | [overlay-positioning.md](/api/overlay/overlay-positioning) |
| 3.1.5 | Document resize behavior | ✅ | | [resize-behavior.md](/api/overlay/resize-behavior) |
| 3.1.6 | Document keyboard shortcuts | ✅ | | [keyboard-shortcuts.md](/api/overlay/keyboard-shortcuts) |

## 3.2 Components

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 3.2.1 | Document Scene Explorer panel | ✅ | | [scene-explorer-panel.md](/api/overlay/scene-explorer-panel) |
| 3.2.2 | Document Object Inspector panel | ✅ | | [object-inspector-panel.md](/api/overlay/object-inspector-panel) |
| 3.2.3 | Document Stats panel | ✅ | | [stats-panel.md](/api/overlay/stats-panel) |
| 3.2.4 | Document Materials panel | ✅ | | [materials-panel.md](/api/overlay/materials-panel) |
| 3.2.5 | Document Geometries panel | ✅ | | [geometries-panel.md](/api/overlay/geometries-panel) |
| 3.2.6 | Document Textures panel | ✅ | | [textures-panel.md](/api/overlay/textures-panel) |
| 3.2.7 | Document Render Targets panel | ✅ | | [render-targets-panel.md](/api/overlay/render-targets-panel) |
| 3.2.8 | Document Resources panel | ✅ | | [resources-panel.md](/api/overlay/resources-panel) |
| 3.2.9 | Document Memory panel | ✅ | | [memory-panel.md](/api/overlay/memory-panel) |

## 3.3 Styling

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 3.3.1 | Document theme system | ✅ | | [theme-system.md](/api/overlay/theme-system) |
| 3.3.2 | Document CSS custom properties | ✅ | | [css-custom-properties.md](/api/overlay/css-custom-properties) |
| 3.3.3 | Document mobile responsiveness | ✅ | | [mobile-responsiveness.md](/api/overlay/mobile-responsiveness) |

---

# 4. UI Package (`@3lens/ui`) Documentation

**Goal:** Document reusable UI components for building custom interfaces.

## 4.1 Panels

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 4.1.1 | Document Materials panel component | ✅ | | [materials-panel-component.md](/api/ui/materials-panel-component) |
| 4.1.2 | Document Geometry panel component | ✅ | | [geometry-panel-component.md](/api/ui/geometry-panel-component) |
| 4.1.3 | Document Textures panel component | ✅ | | [textures-panel-component.md](/api/ui/textures-panel-component) |
| 4.1.4 | Document RenderTargets panel component | ✅ | | [render-targets-panel-component.md](/api/ui/render-targets-panel-component) |

## 4.2 Utilities

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 4.2.1 | Document VirtualScroller | ✅ | | [virtual-scroller.md](/api/ui/virtual-scroller) |
| 4.2.2 | Document tree flattening | ✅ | | [tree-flattening.md](/api/ui/tree-flattening) |
| 4.2.3 | Document formatters | ✅ | | [formatters.md](/api/ui/formatters) |
| 4.2.4 | Document chart components | ✅ | | [chart-components.md](/api/ui/chart-components) |

## 4.3 Styling

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 4.3.1 | Document component styles | ✅ | | CSS architecture - [component-styles.md](/api/ui/component-styles) |
| 4.3.2 | Document icon system | ✅ | | Object type icons - [icon-system.md](/api/ui/icon-system) |
| 4.3.3 | Document color system | ✅ | | Cost heatmap colors - [color-system.md](/api/ui/color-system) |
| 4.3.4 | Document accessibility features | ✅ | | ARIA, focus - [accessibility-features.md](/api/ui/accessibility-features) |

---

# 5. Framework Bridge Documentation

**Goal:** Document each framework integration package thoroughly.

## 5.1 React Bridge (`@3lens/react-bridge`)

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 5.1.1 | Document `ThreeLensProvider` | ✅ | 🔴 | [three-lens-provider.md](/api/react-bridge/three-lens-provider) |
| 5.1.2 | Document `useDevtoolEntity` hook | ✅ | 🔴 | [use-devtool-entity.md](/api/react-bridge/use-devtool-entity) |
| 5.1.3 | Document `useThreeLensProbe` hook | ✅ | | [use-three-lens-probe.md](/api/react-bridge/use-three-lens-probe) |
| 5.1.4 | Document `useSelectedObject` hook | ✅ | | [use-selected-object.md](/api/react-bridge/use-selected-object) |
| 5.1.5 | Document `useMetric` hook | ✅ | | [use-metric.md](/api/react-bridge/use-metric) |
| 5.1.6 | Document `useFPS` hook | ✅ | | [metric-shortcut-hooks.md](/api/react-bridge/metric-shortcut-hooks) |
| 5.1.7 | Document `useDrawCalls` hook | ✅ | | [metric-shortcut-hooks.md](/api/react-bridge/metric-shortcut-hooks) |
| 5.1.8 | Document R3F integration | ✅ | 🔴 | [r3f-integration.md](/api/react-bridge/r3f-integration) |
| 5.1.9 | Document `ThreeLensCanvas` | ✅ | | [three-lens-canvas.md](/api/react-bridge/three-lens-canvas) |

## 5.2 Angular Bridge (`@3lens/angular-bridge`)

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 5.2.1 | Document `THREELENS_PROBE` token | ✅ | 🔴 | [tokens.md](/api/angular-bridge/tokens) |
| 5.2.2 | Document `THREELENS_CONFIG` token | ✅ | | [tokens.md](/api/angular-bridge/tokens) |
| 5.2.3 | Document `ThreeLensService` | ✅ | 🔴 | [three-lens-service.md](/api/angular-bridge/three-lens-service) |
| 5.2.4 | Document RxJS observables | ✅ | | [three-lens-service.md](/api/angular-bridge/three-lens-service) |
| 5.2.5 | Document `ThreeLensEntityDirective` | ✅ | | [entity-directive.md](/api/angular-bridge/entity-directive) |
| 5.2.6 | Document `ThreeLensModule` | ✅ | | [module.md](/api/angular-bridge/module) |
| 5.2.7 | Document NxLibraryHelper | ✅ | | [nx-helpers.md](/api/angular-bridge/nx-helpers) |

## 5.3 Vue Bridge (`@3lens/vue-bridge`)

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 5.3.1 | Document `createThreeLens` | ✅ | 🔴 | [create-three-lens.md](/api/vue-bridge/create-three-lens) |
| 5.3.2 | Document `ThreeLensPlugin` | ✅ | 🔴 | [plugin.md](/api/vue-bridge/plugin) |
| 5.3.3 | Document `useDevtoolEntity` composable | ✅ | | [use-devtool-entity.md](/api/vue-bridge/use-devtool-entity) |
| 5.3.4 | Document `useDevtoolEntityGroup` | ✅ | | [use-devtool-entity-group.md](/api/vue-bridge/use-devtool-entity-group) |
| 5.3.5 | Document provide/inject pattern | ✅ | | [provide-inject.md](/api/vue-bridge/provide-inject) |
| 5.3.6 | Document TresJS integration | ✅ | 🔴 | [tresjs-integration.md](/api/vue-bridge/tresjs-integration) |
| 5.3.7 | Document `createTresConnector` | ✅ | | [tresjs-integration.md](/api/vue-bridge/tresjs-integration) |
| 5.3.8 | Document reactive watchers | ✅ | | [composables.md](/api/vue-bridge/composables) |

---

# 6. Guides & Tutorials

**Goal:** Create comprehensive guides for different use cases and skill levels.

## 6.1 Getting Started Series

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 6.1.1 | Review/enhance Getting Started guide | ✅ | 🔴 | Enhanced [getting-started.md](/guide/getting-started) |
| 6.1.2 | Add installation troubleshooting | ✅ | | [installation-troubleshooting.md](/guide/installation-troubleshooting) |
| 6.1.3 | Add first debugging session walkthrough | ✅ | | [first-debugging-session.md](/guide/first-debugging-session) |
| 6.1.4 | Add configuration deep dive | ✅ | | [configuration.md](/guide/configuration) |

## 6.2 Framework Guides

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 6.2.1 | Review/enhance React/R3F guide | ✅ | 🔴 | Enhanced [REACT-R3F-GUIDE.md](/guides/REACT-R3F-GUIDE) - Quick Start, Next.js/SSR, Best Practices, Common Pitfalls |
| 6.2.2 | Review/enhance Angular guide | ✅ | 🔴 | Enhanced [ANGULAR-GUIDE.md](/guides/ANGULAR-GUIDE) - Quick Start, Signals support, Best Practices, Common Pitfalls |
| 6.2.3 | Review/enhance Vue/TresJS guide | ✅ | 🔴 | Enhanced [VUE-TRESJS-GUIDE.md](/guides/VUE-TRESJS-GUIDE) - Quick Start, Nuxt.js, Pinia, Best Practices, Common Pitfalls |
| 6.2.4 | Add Svelte/Threlte guide | ⬜ | | New guide |
| 6.2.5 | Add vanilla three.js guide | ⬜ | | Detailed vanilla |

## 6.3 Feature Guides

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 6.3.1 | Scene inspection guide | ✅ | 🔴 | Created [SCENE-INSPECTION-GUIDE.md](/guides/SCENE-INSPECTION-GUIDE) - Tree navigation, object selection, search/filter |
| 6.3.2 | Performance debugging guide | ✅ | 🔴 | Created [PERFORMANCE-DEBUGGING-GUIDE.md](/guides/PERFORMANCE-DEBUGGING-GUIDE) - Stats panel, frame timeline, GPU timing |
| 6.3.3 | Memory profiling guide | ✅ | 🔴 | Created [MEMORY-PROFILING-GUIDE.md](/guides/MEMORY-PROFILING-GUIDE) - Resource tracking, leak detection, disposal patterns |
| 6.3.4 | Transform gizmos guide | ✅ | 🔴 | Created [TRANSFORM-GIZMOS-GUIDE.md](/guides/TRANSFORM-GIZMOS-GUIDE) - Translate/rotate/scale, coordinate spaces |
| 6.3.5 | Camera controls guide | ✅ | 🔴 | Created [CAMERA-CONTROLS-GUIDE.md](/guides/CAMERA-CONTROLS-GUIDE) - Focus, fly-to, orbit, bookmarks |
| 6.3.6 | Material editing guide | ✅ | 🔴 | Created [MATERIAL-EDITING-GUIDE.md](/guides/MATERIAL-EDITING-GUIDE) - Live property editing, textures, PBR |
| 6.3.7 | Shader debugging guide | ✅ | 🔴 | Created [SHADER-DEBUGGING-GUIDE.md](/guides/SHADER-DEBUGGING-GUIDE) - GLSL/WGSL viewer, uniforms, debug modes |

## 6.4 Advanced Guides

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 6.4.1 | Review/enhance Plugin Development guide | ✅ | 🔴 | Enhanced [PLUGIN-DEVELOPMENT.md](/guides/PLUGIN-DEVELOPMENT) - Quick Start, Common Pitfalls, Debugging |
| 6.4.2 | Review/enhance CI Integration guide | ✅ | 🔴 | Enhanced [CI-INTEGRATION.md](/guides/CI-INTEGRATION) - Quick Start, Common Pitfalls, Troubleshooting |
| 6.4.3 | Custom rules guide | ✅ | 🔴 | Created [CUSTOM-RULES-GUIDE.md](/guides/CUSTOM-RULES-GUIDE) - Rule definitions, conditions, framework integration |
| 6.4.4 | WebGPU debugging guide | ✅ | 🔴 | Created [WEBGPU-DEBUGGING-GUIDE.md](/guides/WEBGPU-DEBUGGING-GUIDE) - Compute shaders, buffers, GPU timing |
| 6.4.5 | Large scene optimization guide | ✅ | 🔴 | Created [LARGE-SCENE-OPTIMIZATION-GUIDE.md](/guides/LARGE-SCENE-OPTIMIZATION-GUIDE) - LOD, culling, instancing |
| 6.4.6 | Logical entities guide | ✅ | 🔴 | Created [LOGICAL-ENTITIES-GUIDE.md](/guides/LOGICAL-ENTITIES-GUIDE) - Module-level tracking, entity groups |

## 6.5 Migration & Upgrade

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 6.5.1 | Migration from lil-gui | ✅ | | Created [MIGRATION-FROM-LIL-GUI.md](/guides/MIGRATION-FROM-LIL-GUI) - Feature mapping, patterns, coexistence |
| 6.5.2 | Migration from three-inspect | ✅ | | Created [MIGRATION-FROM-THREE-INSPECT.md](/guides/MIGRATION-FROM-THREE-INSPECT) - API comparison, framework migration |
| 6.5.3 | Version upgrade guide | ✅ | | Created [VERSION-UPGRADE-GUIDE.md](/guides/VERSION-UPGRADE-GUIDE) - Breaking changes, compatibility matrix |

---

# 7. API Reference Documentation

**Goal:** Generate and enhance comprehensive API documentation.

## 7.1 TypeDoc Enhancement

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 7.1.1 | Review TypeDoc configuration | ✅ | | Enhanced typedoc.json - added all packages, categories, validation |
| 7.1.2 | Add JSDoc comments to all exports | ✅ | 🔴 | @3lens/core - comprehensive module docs, categories, examples |
| 7.1.3 | Add JSDoc comments to overlay | ✅ | | @3lens/overlay - module docs, createOverlay, bootstrapOverlay |
| 7.1.4 | Add JSDoc comments to react-bridge | ✅ | | All hooks documented with examples |
| 7.1.5 | Add JSDoc comments to angular-bridge | ✅ | | Service, directive, tokens documented |
| 7.1.6 | Add JSDoc comments to vue-bridge | ✅ | | Composables, plugin documented |

## 7.2 API Pages

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 7.2.1 | Create probe API page | ✅ | | [probe-api.md](/api/probe-api) - Human-readable DevtoolProbe reference |
| 7.2.2 | Create config API page | ✅ | | [config-api.md](/api/config-api) - ProbeConfig, SamplingConfig, RulesConfig |
| 7.2.3 | Create events API page | ✅ | | [events-api.md](/api/events-api) - All probe event subscriptions |
| 7.2.4 | Create plugin API page | ✅ | | [plugin-api.md](/api/plugin-api) - DevtoolPlugin, DevtoolContext interfaces |
| 7.2.5 | Create types glossary | ✅ | | [types-glossary.md](/api/types-glossary) - Common types reference |

## 7.3 Code Examples

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 7.3.1 | Add runnable code examples | ✅ | | [code-examples.md](/examples/code-examples) - StackBlitz & CodeSandbox links |
| 7.3.2 | Add copy-paste snippets | ✅ | | [code-examples.md](/examples/code-examples) - Quick initialization, FPS monitor, cleanup |
| 7.3.3 | Add TypeScript examples | ✅ | | [code-examples.md](/examples/code-examples) - All examples with full type annotations |
| 7.3.4 | Add JavaScript examples | ✅ | | [code-examples.md](/examples/code-examples) - All patterns in JS |
| 7.3.5 | Add ESM/CJS examples | ✅ | | [code-examples.md](/examples/code-examples) - ESM and CommonJS variants |

---

# 8. Examples Documentation

**Goal:** Document each example project with setup instructions and explanations.

## 8.1 Framework Integration Examples

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 8.1.1 | Document vanilla-threejs example | ✅ | 🔴 | [framework-integration.md](/examples/framework-integration#vanilla-three-js) |
| 8.1.2 | Document react-three-fiber example | ✅ | 🔴 | [framework-integration.md](/examples/framework-integration#react-three-fiber) |
| 8.1.3 | Document angular-threejs example | ✅ | | [framework-integration.md](/examples/framework-integration#angular-three-js) |
| 8.1.4 | Document vue-tresjs example | ✅ | | [framework-integration.md](/examples/framework-integration#vue-tresjs) |
| 8.1.5 | Document svelte-threlte example | ✅ | | [framework-integration.md](/examples/framework-integration#svelte-threlte) |
| 8.1.6 | Document nextjs-ssr example | ✅ | | [framework-integration.md](/examples/framework-integration#next-js-ssr) |
| 8.1.7 | Document electron-desktop example | ✅ | | [framework-integration.md](/examples/framework-integration#electron-desktop) |

## 8.2 Debugging Examples

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 8.2.1 | Document performance-debugging example | ✅ | 🔴 | [debugging-examples.md](/examples/debugging-examples#performance-debugging) |
| 8.2.2 | Document memory-leak-detection example | ✅ | | [debugging-examples.md](/examples/debugging-examples#memory-leak-detection) |
| 8.2.3 | Document shader-debugging example | ✅ | | [debugging-examples.md](/examples/debugging-examples#shader-debugging) |
| 8.2.4 | Document large-scene-optimization | ✅ | | [debugging-examples.md](/examples/debugging-examples#large-scene-optimization) |

## 8.3 Feature Showcase Examples

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 8.3.1 | Document transform-gizmo example | ✅ | | [feature-showcase.md](/examples/feature-showcase#transform-gizmo) |
| 8.3.2 | Document custom-plugin example | ✅ | | [feature-showcase.md](/examples/feature-showcase#custom-plugin) |
| 8.3.3 | Document webgpu-features example | ✅ | | [feature-showcase.md](/examples/feature-showcase#webgpu-features) |
| 8.3.4 | Document configuration-rules example | ✅ | | [feature-showcase.md](/examples/feature-showcase#configuration-rules) |

## 8.4 Real-World Scenarios

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 8.4.1 | Document 3d-model-viewer example | ✅ | | [real-world-scenarios.md](/examples/real-world-scenarios#3d-model-viewer) |
| 8.4.2 | Document particle-system example | ✅ | | [real-world-scenarios.md](/examples/real-world-scenarios#particle-system) |
| 8.4.3 | Document physics-inspector example | ✅ | | [real-world-scenarios.md](/examples/real-world-scenarios#physics-inspector) |
| 8.4.4 | Document vr-xr-debugging example | ✅ | | [real-world-scenarios.md](/examples/real-world-scenarios#vr-xr-debugging) |

## 8.5 Game Development Examples

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 8.5.1 | Document first-person-shooter example | ✅ | | [game-development.md](/examples/game-development#first-person-shooter) |
| 8.5.2 | Document top-down-rpg example | ✅ | | [game-development.md](/examples/game-development#top-down-rpg) |
| 8.5.3 | Document racing-game example | ✅ | | [game-development.md](/examples/game-development#racing-game) |
| 8.5.4 | Document platformer-physics example | ✅ | | [game-development.md](/examples/game-development#platformer-physics) |

---

# 9. Deployment & Infrastructure

**Goal:** Set up documentation deployment and maintenance.

## 9.1 Build & Deploy

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 9.1.1 | Configure build pipeline | ✅ | 🔴 | [deployment.md](/guide/deployment) - pnpm scripts, TypeDoc + VitePress |
| 9.1.2 | Set up GitHub Actions workflow | ✅ | 🔴 | [deploy-docs.yml](/.github/workflows/deploy-docs.yml) - Auto-deploy on merge |
| 9.1.3 | Configure custom domain | ✅ | | [deployment.md](/guide/deployment#custom-domain-setup) - DNS, CNAME setup |
| 9.1.4 | Set up SSL certificate | ✅ | | [deployment.md](/guide/deployment#ssl-certificate) - Automatic via GitHub Pages |

## 9.2 SEO & Analytics

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 9.2.1 | Add meta tags | ✅ | | [seo-configuration.md](/guide/seo-configuration) - OG, Twitter cards |
| 9.2.2 | Configure sitemap | ✅ | | [seo-configuration.md](/guide/seo-configuration#sitemap) - VitePress sitemap |
| 9.2.3 | Add analytics | ✅ | | [analytics-setup.md](/guide/analytics-setup) - Plausible/Fathom/Umami |
| 9.2.4 | Add structured data | ✅ | | [seo-configuration.md](/guide/seo-configuration#structured-data-json-ld) - JSON-LD |

## 9.3 Maintenance

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 9.3.1 | Set up link checker | ✅ | | [maintenance.md](/guide/maintenance) - Lychee CI workflow |
| 9.3.2 | Configure spell checker | ✅ | | [maintenance.md](/guide/maintenance#spell-checker) - cspell config |

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
