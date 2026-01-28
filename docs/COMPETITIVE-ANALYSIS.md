---
title: Competitive Analysis
description: Analysis of the three.js developer tools ecosystem, identifying gaps and opportunities
---

# Competitive Analysis: three.js DevTools Ecosystem

This document analyzes the current state of three.js developer tools, identifying gaps and opportunities that 3Lens aims to address.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Existing Tools Overview](#existing-tools-overview)
3. [Detailed Analysis](#detailed-analysis)
4. [Gap Analysis](#gap-analysis)
5. [3Lens Differentiation](#3lens-differentiation)
6. [Market Positioning](#market-positioning)

---

## Executive Summary

The three.js devtools ecosystem is **fragmented and incomplete**. While several tools exist, none provides a comprehensive, unified debugging experience comparable to what React DevTools or Vue DevTools offer for their respective frameworks.

### Key Findings

| Finding | Implication |
|---------|-------------|
| No unified solution | Developers juggle multiple tools |
| Most tools are experimental/abandoned | Unreliable for production use |
| WebGPU support is nonexistent | Future-proofing gap |
| Enterprise features missing | No CI integration, no team workflows |
| Framework integration is shallow | Manual wiring required |

### Opportunity

There is a clear opportunity for a **comprehensive, actively maintained, enterprise-ready** three.js devtool that consolidates best-of-breed features and fills existing gaps.

---

## Existing Tools Overview

### Quick Comparison Matrix

| Tool | Type | Status | Scene Graph | Performance | Materials | Textures | WebGPU | Enterprise |
|------|------|--------|-------------|-------------|-----------|----------|--------|------------|
| three-devtools | Extension | Alpha | ✅ | Partial | Partial | ❌ | ❌ | ❌ |
| three-tools | Extension | Active | ✅ | ❌ | Partial | ❌ | ❌ | ❌ |
| Spector.js | Extension | Stable | ❌ | ✅ | N/A | ✅ | ❌ | ❌ |
| stats-gl | In-app | Stable | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| RenderTargetInspector | In-app | Stable | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| DrawCallInspector | In-app | Stable | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **3Lens (planned)** | **All** | **Planned** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Detailed Analysis

### 1. three-devtools (Official)

**Repository:** [github.com/threejs/three-devtools](https://github.com/threejs/three-devtools)

**Type:** Chrome/Firefox Extension

**Status:** Experimental/Alpha (linked from threejs.org)

#### Features
- Scene graph explorer
- Object property inspection
- Basic renderer stats
- Material/texture viewing

#### Strengths
- Official association with three.js project
- Integrated into browser DevTools
- Active development

#### Weaknesses
- **Requires manual wiring** (`__THREE_DEVTOOLS__` API)
- Limited performance profiling
- No GPU timing
- No render target inspection
- Experimental stability issues
- No framework integration
- No WebGPU support

#### Code to Enable
```javascript
if (typeof __THREE_DEVTOOLS__ !== 'undefined') {
  __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: scene }));
  __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: renderer }));
}
```

---

### 2. three-tools

**Website:** [three-tools.vercel.app](https://three-tools.vercel.app)

**Type:** Chrome Extension

**Status:** Community-maintained, Active

#### Features
- Scene/camera/mesh listing
- Object selection by name/type/UUID
- Transform property editing
- Modern UI

#### Strengths
- Clean, modern interface
- Works with latest three.js
- Easy to use

#### Weaknesses
- No performance profiling
- No shader inspection
- Limited material editing
- No resource tracking
- No WebGPU support

---

### 3. Three.js Developer Tools (jsantell)

**Firefox Add-on:** [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/three-js-developer-tools/)

**Type:** Firefox Extension

**Status:** Alpha, Last updated 2019-2020

#### Features
- Scene graph inspector
- Object property editing
- Renderer stats panel

#### Strengths
- Firefox support
- Runtime property tweaking

#### Weaknesses
- **Outdated** (last update 2019-2020)
- May not work with modern three.js
- No longer actively maintained
- Limited features compared to newer tools

---

### 4. Spector.js

**Website:** [spector.babylonjs.com](https://spector.babylonjs.com)

**Type:** Browser Extension + JavaScript API

**Status:** Stable, Actively maintained

#### Features
- WebGL frame capture
- Draw call inspection
- Shader source viewing
- State diff between calls
- Texture inspection

#### Strengths
- **Excellent for low-level WebGL debugging**
- Engine-agnostic
- Detailed GPU state inspection
- Stable and reliable

#### Weaknesses
- **No three.js awareness** (doesn't know about Scene, Mesh, Material)
- Requires mental mapping from GL calls to three.js objects
- No scene graph view
- No object-level cost analysis
- No WebGPU support (WebGL only)

---

### 5. stats-gl

**Repository:** [github.com/RenaudRohlinger/stats-gl](https://github.com/RenaudRohlinger/stats-gl)

**Type:** In-app JavaScript library

**Status:** Stable, Actively maintained

#### Features
- FPS panel
- CPU time panel
- GPU time panel (WebGL2 + WebGPU)
- Memory panel

#### Strengths
- Modern replacement for stats.js
- **Supports WebGPU** timestamp queries
- Accurate GPU timing
- Lightweight

#### Weaknesses
- **Stats only** - no inspection capabilities
- No scene graph
- No material/texture inspection
- No interactive debugging

---

### 6. THREE.RenderTargetInspector

**Repository:** [github.com/Fyrestar/THREE.RenderTargetInspector](https://github.com/Fyrestar/THREE.RenderTargetInspector)

**Type:** In-app JavaScript library

**Status:** Stable

#### Features
- Render target thumbnail grid
- Pixel value inspection
- Channel toggle (RGB/A/Depth)
- PNG snapshot export

#### Strengths
- **Excellent for postprocessing debugging**
- Real-time thumbnail updates
- Pixel-level inspection

#### Weaknesses
- **Render targets only** - no other features
- Separate tool to integrate
- No scene awareness

---

### 7. THREE.DrawCallInspector

**Repository:** [github.com/Fyrestar/THREE.DrawCallInspector](https://github.com/Fyrestar/THREE.DrawCallInspector)

**Type:** In-app JavaScript library

**Status:** Stable

#### Features
- Per-object draw call cost visualization
- Heatmap overlay on objects
- WebGL1 and WebGL2 support

#### Strengths
- **Visual cost analysis**
- Identifies expensive objects
- Useful for optimization

#### Weaknesses
- **Draw call timing only**
- No scene graph
- Separate integration required

---

### 8. Three.js Editor

**Website:** [threejs.org/editor](https://threejs.org/editor/)

**Type:** Web Application

**Status:** Official, Stable

#### Features
- Full 3D scene editor
- Material/geometry editing
- Animation tools
- Import/export

#### Strengths
- Official three.js tool
- Comprehensive editing

#### Weaknesses
- **Not a runtime devtool** - requires export/import
- Cannot inspect a running application
- Different use case (authoring vs. debugging)

---

## Gap Analysis

### Feature Gaps

| Feature | Currently Available | Gap |
|---------|---------------------|-----|
| Unified scene inspector | Partial (multiple tools) | No single solution |
| GPU timing | stats-gl only | Not integrated with inspector |
| Render target inspection | RenderTargetInspector only | Separate tool |
| Draw call analysis | DrawCallInspector only | Separate tool |
| Material/shader editing | Partial | No live GLSL/WGSL editing |
| Resource lifecycle | None | Memory leaks hard to detect |
| Framework integration | None | Manual wiring always required |
| WebGPU support | stats-gl only | No inspector support |
| CI integration | None | No automated testing tools |
| Recording/replay | None | No session capture |

### Workflow Gaps

| Workflow | Current State | Gap |
|----------|---------------|-----|
| "Why is this slow?" | Use 3+ tools | Need single performance workflow |
| "What's rendering this pixel?" | Not possible | Need click-to-inspect |
| "Is this texture leaking?" | Manual tracking | Need automatic detection |
| "Did this build regress?" | Manual comparison | Need CI integration |
| "What's this object's component?" | Not possible | Need framework bridge |

### Deployment Gaps

| Deployment Mode | Current State | Gap |
|-----------------|---------------|-----|
| Browser extension | Exists (limited) | Not comprehensive |
| npm package | stats-gl, helpers | No full inspector |
| Standalone app | None | Recording/comparison needed |
| CI/Headless | None | Automation needed |

---

## 3Lens Differentiation

### Core Value Proposition

> "3Lens is the first **unified, comprehensive, enterprise-ready** devtool for three.js that works across all deployment modes and supports both WebGL and WebGPU."

### Unique Capabilities

#### 1. Unified Experience
- **One tool instead of many** - Scene graph + performance + materials + textures + render targets
- **Consistent UI** across extension, npm, and standalone modes
- **Same protocol** enables tool interoperability

#### 2. Deep Integration
- **Framework bridges** for React, Angular, Vue
- **Component ↔ Object mapping** - See which React component owns each mesh
- **Module-level metrics** for Nx/monorepo architectures

#### 3. Interactive Debugging
- **Click-to-inspect** objects in the scene
- **Transform gizmos** for runtime manipulation
- **Live property editing** with undo/redo

#### 4. Performance Intelligence
- **Integrated GPU timing** (not a separate tool)
- **Object-level cost analysis** with heatmap
- **Rule-based warnings** for common issues
- **Leak detection** with stack traces

#### 5. Enterprise Features
- **Session recording** for bug reproduction
- **Build comparison** for regression detection
- **CI mode** for automated performance testing
- **Plugin API** for custom panels

#### 6. Future-Proof
- **WebGPU support** from day one
- **Renderer-agnostic architecture** for future backends
- **Active maintenance** commitment

### Comparison: Today vs. 3Lens

| Task | Today | With 3Lens |
|------|-------|------------|
| Inspect scene graph | three-devtools (alpha) | Built-in, stable |
| Profile GPU time | stats-gl (separate) | Integrated panel |
| Debug render targets | RenderTargetInspector (separate) | Integrated panel |
| Find expensive objects | DrawCallInspector (separate) | Heatmap overlay |
| Inspect shaders | Spector.js (no three.js context) | Material panel with three.js context |
| Debug memory leaks | Manual tracking | Automatic detection + alerts |
| Map component to mesh | Not possible | Framework bridge |
| Automate perf testing | Not possible | CI mode |

---

## Market Positioning

### Target Users

#### 1. Individual Developers
- Building three.js applications
- Need better debugging tools
- **Value:** Faster debugging, fewer hours hunting bugs

#### 2. Teams / Companies
- Multiple developers working on three.js projects
- Need consistent tooling across projects
- **Value:** Standardized debugging, team conventions

#### 3. Enterprises
- Large-scale three.js applications
- Performance is critical
- **Value:** CI integration, performance regression detection

### Adoption Strategy

#### Phase 1: Developer Adoption
- Free, open-source core
- Easy installation (extension + npm)
- Great documentation and examples

#### Phase 2: Team Adoption
- Framework bridges for popular stacks
- Configuration standardization
- Plugin ecosystem

#### Phase 3: Enterprise Adoption
- CI integration
- Session recording/comparison
- Enterprise support options (if applicable)

### Competitive Moat

1. **Comprehensiveness** - No other tool covers all features
2. **Active maintenance** - Commitment to keep up with three.js
3. **WebGPU support** - First-mover advantage
4. **Enterprise features** - CI integration is unique
5. **Community** - Plugin ecosystem, documentation, support

---

## Conclusion

The three.js devtools market is ripe for disruption. Developers currently struggle with:
- Fragmented tooling
- Abandoned projects
- Missing features
- No enterprise support

3Lens can capture this market by delivering:
- A unified, comprehensive solution
- Active, committed maintenance
- Enterprise-grade features
- Forward-looking WebGPU support

The opportunity is significant: three.js is one of the most popular WebGL libraries, with thousands of projects that would benefit from better tooling.

