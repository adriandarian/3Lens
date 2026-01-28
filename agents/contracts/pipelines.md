# Contract: Pipelines

## Purpose

Define how 3Lens captures and represents render pipelines, including:
- EffectComposer pass chains
- Custom postprocessing
- MRT (Multiple Render Targets)
- Shadow maps and probes
- WebGPU render passes

## The Pipeline Model

```typescript
interface Pipeline {
  id: string;
  displayName: string;
  context_id: string;
  passes: Pass[];
  edges: PipelineEdge[];      // Pass ordering/dependencies
  render_targets: RenderTargetInfo[];
}

interface Pass {
  id: string;
  name: string;
  tags: PassTag[];            // 'main', 'shadow', 'probe', 'post', 'ui'
  render_target?: string;     // Output target ID
  inputs?: string[];          // Input target IDs
}

interface PipelineEdge {
  from: string;               // Pass ID
  to: string;                 // Pass ID
  type: 'sequence' | 'dependency';
}

type PassTag = 'main' | 'shadow' | 'probe' | 'post' | 'ui' | 'mrt' | 'custom';
```

## Invariants (MUST ALWAYS HOLD)

1. **Pass boundaries are explicit or unavailable:**
   - If pass boundaries detectable, emit `pass_begin` / `pass_end` events.
   - If not detectable, label pass data as UNAVAILABLE, never guess.

2. **Pipeline descriptor is optional but stable:**
   - User can describe pipeline via `registerPipeline()`.
   - Descriptor enables better attribution.
   - Without descriptor, fallback to render event inference.

3. **Render targets are first-class entities:**
   - Every render target appears in entity graph.
   - Memory attribution links to render targets.

4. **Shadow maps and probes are explicit pass categories:**
   - Tagged as `shadow` or `probe`.
   - Counted separately from main render.

5. **Pipeline can be registered dynamically:**
   - Pipelines can change at runtime (quality settings, feature toggles).
   - Changes emit `pipeline_update` event.

## Pipeline Adapter API

### Level 1: Describe-only (static)
User provides pipeline metadata for UI grouping and diff stability.

```typescript
lens.registerPipeline("main", {
  id: "composer",
  displayName: "Post Stack",
  passes: [
    { id: "gbuffer", name: "GBuffer", tags: ["mrt"] },
    { id: "lighting", name: "Lighting" },
    { id: "ssao", name: "SSAO", tags: ["post"] },
    { id: "bloom", name: "Bloom", tags: ["post"] },
    { id: "tonemap", name: "Tonemap", tags: ["post"] },
  ],
  edges: [
    ["gbuffer", "lighting"],
    ["lighting", "ssao"],
    ["ssao", "bloom"],
    ["bloom", "tonemap"],
  ],
});
```

### Level 2: Instrumented (runtime)
User/adapter emits pass boundary events for real attribution.

```typescript
const p = lens.pipeline("main", "composer");

// In render loop:
p.passBegin("ssao");
ssaoPass.render(renderer, writeBuffer, readBuffer);
p.passEnd("ssao");
```

## MRT (Multiple Render Targets)

- Track render target attachments explicitly
- Attribute memory and bandwidth to pass/pipeline
- Avoid double-counting shared attachments
- Support transient vs persistent targets

## Shadow Maps / Probes

- Treat as first-class pass categories
- Tag: `shadow`, `probe`
- Query: "renders per camera per frame"
- Attribute cost separately from main render

## Degradation Rules

- If EffectComposer detected but passes unknown:
  - Emit render events, mark pass attribution as ESTIMATED.
- If custom FBO chain with no registration:
  - Emit render events only, no pass segmentation.
- If pass boundaries unavailable:
  - Never fake per-pass timings, mark UNAVAILABLE.

## Acceptance Tests

- **Registered pipeline:**
  - Pipeline appears in UI with correct pass order and names.
- **Instrumented passes:**
  - Pass events captured with timing attribution.
- **Shadow detection:**
  - Shadow passes detected and tagged correctly.
- **MRT memory:**
  - MRT attachments attributed to correct pass without duplication.
- **Dynamic pipeline:**
  - Quality setting change triggers `pipeline_update` event.

## Anti-goals

- Pretending to know pass boundaries without data
- Per-pass timings without instrumentation
- Hardcoding EffectComposer assumptions
- Ignoring custom pipeline patterns
- Double-counting shared render targets
