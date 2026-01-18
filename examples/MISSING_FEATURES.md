# Missing 3Lens Features

This document tracks 3Lens features that examples need but don't currently exist. These should be built into 3Lens proper, not implemented as custom code in examples.

## How to Use This Document

When working on an example that needs a feature 3Lens doesn't have:
1. Add it to this document with the format below
2. Reference this feature in the example's README
3. Add a TODO comment in the code
4. Keep the example simple - don't build workarounds

## Tracking Format

```markdown
### Feature Name
**Needed by:** example-name, other-example
**Priority:** High/Medium/Low
**Description:** What the feature should do
**Current workaround:** How examples handle it now (if any)
```

---

## Needed Features

### Panel Configuration / Visibility Control
**Needed by:** All examples
**Priority:** High
**Description:** Allow examples to configure which panels are shown in the 3Lens overlay:
- `createOverlay({ panels: ['scene', 'performance'] })` - show only specific panels
- `createOverlay({ hidePanels: ['webgpu', 'plugins'] })` - hide specific panels
- `probe.setPanelVisibility('materials', false)` - runtime toggle
- Context-aware defaults (e.g., hide WebGPU panel when using WebGL)
- User should still be able to manually enable hidden panels via settings
**Current workaround:** All panels are always shown, cluttering the UI for focused examples

### Render Pass Inspector Panel
**Needed by:** custom-render-pipeline, post-processing
**Priority:** High
**Description:** A dedicated panel for inspecting render passes in multi-pass pipelines:
- List all render passes with names and order
- Toggle passes on/off
- Show per-pass timing (GPU time)
- Show render target attachments for each pass
- Preview intermediate render targets
**Current workaround:** Examples register passes as logical entities, but can't toggle/preview them

### Render Target Preview
**Needed by:** custom-render-pipeline, shadow-comparison, post-processing
**Priority:** High  
**Description:** Preview contents of WebGLRenderTarget/WebGLMultipleRenderTargets:
- Thumbnail view in panel
- Full-screen preview on click
- Channel selector (RGB, R, G, B, A, Depth)
- Value inspection on hover
**Current workaround:** Examples build custom debug view modes

### GPU Timing Panel
**Needed by:** custom-render-pipeline, compute-shaders, performance-debugging
**Priority:** Medium
**Description:** Show GPU timing breakdown:
- Frame GPU time
- Per-pass GPU time (WebGL/WebGPU)
- Timeline visualization
- History graph
**Current workaround:** Examples calculate and display timing manually

### Shader Debugger
**Needed by:** shader-debugging, custom-render-pipeline
**Priority:** Medium
**Description:** Debug shader uniforms and outputs:
- View compiled shader source
- Edit uniforms live
- Visualize outputs per-stage
**Current workaround:** Examples build custom uniform editors

### Animation Timeline
**Needed by:** animation-profiling, skinned-mesh-inspector, timeline-recording
**Priority:** Medium
**Description:** Timeline view for animations:
- Scrub through animation clips
- Show keyframes
- Speed controls
- Record custom timeline data
**Current workaround:** Examples build custom timeline UIs

### Physics Debugger Integration
**Needed by:** physics-inspector, platformer-physics, racing-game
**Priority:** Medium
**Description:** Debug physics engines (Rapier, Cannon, etc.):
- Show collision shapes
- Visualize forces/velocities
- Step simulation manually
**Current workaround:** Examples draw debug shapes manually

### Memory Leak Alerts Panel
**Needed by:** memory-leak-detection
**Priority:** High
**Description:** Dedicated panel for ResourceLifecycleTracker alerts:
- Real-time leak detection alerts
- Categorized by resource type
- Stack trace integration
- Trend visualization
**Current workaround:** Examples build custom leak displays

### Draw Call Batching Analyzer
**Needed by:** draw-call-batching, large-scene-optimization
**Priority:** Medium
**Description:** Analyze draw call efficiency:
- Group by material
- Show instancing opportunities
- Batch recommendations
**Current workaround:** None - examples manually analyze

### Raycasting Visualizer
**Needed by:** raycasting-debugger
**Priority:** Low
**Description:** Visualize raycasts:
- Show ray origin and direction
- Highlight intersected objects
- Show intersection points
**Current workaround:** Examples draw debug lines manually

### LOD Inspector
**Needed by:** large-scene-optimization, 3d-model-viewer
**Priority:** Low
**Description:** Inspect LOD levels:
- Show current LOD per object
- Override LOD selection
- Distance markers
**Current workaround:** LODCheckerPlugin exists but no panel

### WebGPU Pipeline Inspector
**Needed by:** webgpu-features, compute-shaders
**Priority:** Medium
**Description:** WebGPU-specific inspection:
- List GPU pipelines
- Show bind groups
- Buffer inspection
**Current workaround:** None

### Custom Data Visualization
**Needed by:** 3d-charts, geographic-data, scientific-viz
**Priority:** Low
**Description:** Visualize custom app data in 3Lens:
- Register data sources
- Built-in chart types
- Real-time updates
**Current workaround:** Examples build own viz UIs

---

## Completed Features

(Move features here once implemented in 3Lens)

*None yet*
