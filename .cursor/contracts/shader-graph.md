# Contract: Shader Graph

## Purpose

Shader Graph is a developer-facing lens over runtime shader entities.
It exists to explain, attribute cost, diff, and safely mutate shader structure.

## What Shader Graph IS

- Runtime introspection tool
- Variant analyzer
- Cost attribution surface
- Controlled mutation interface
- Diff viewer for shader changes

## What Shader Graph is NOT

- A general-purpose shader authoring tool
- A replacement for TSL Graph or Unity Shader Graph
- An artist-facing visual programming environment
- An asset pipeline tool

## Invariants (MUST ALWAYS HOLD)

1. **Graph is generated from runtime shader entities:**
   - Reflects what actually exists, not what was authored.
   - Shows compiled variants, not source-only.

2. **Graph exposes variant causes:**
   - Which defines/features caused variant compilation.
   - Variant count per shader.
   - What triggered compilation.

3. **Graph nodes can be attributed with cost signals:**
   - GPU time (when available)
   - Compile time
   - Memory footprint
   - Fidelity labeled (EXACT/ESTIMATED/UNAVAILABLE)

4. **Any mutation must be reversible and measurable:**
   - Toggle produces a before/after diff.
   - Changes can be reverted.
   - Performance delta is shown.

## In Scope

### Runtime Introspection
- View compiled shader modules
- View pipeline layouts
- View bind groups (WebGPU)
- View uniform/attribute bindings

### Variant Analysis
- Which variants compiled
- Why they compiled (defines, features, material flags)
- Variant count trends over time
- Compile storm detection

### Node Cost Attribution (best-effort)
- Per-node GPU time estimate (when measurable)
- Per-feature cost breakdown
- Comparison across variants

### Controlled Mutation + Validation
- Toggle feature flag -> measure impact
- Disable node -> measure impact
- Simplify shader -> measure impact
- All mutations produce delta report

### Diffs
- Shader changes across frames
- Shader changes across sessions
- Before/after mutation comparison

## Out of Scope

- General-purpose shader authoring from scratch
- Competing with TSL Graph for artist workflows
- Visual programming playground
- Asset pipeline replacement
- Material editor UI

## Shader Graph Rule

If a shader graph feature does NOT connect to:
- cost attribution
- diffs
- variants
- or validation

...then it does NOT belong in 3Lens.

## Acceptance Tests (Definition of Done)

- **Perf spike navigation:**
  - From a perf spike -> can navigate to responsible shader graph.
- **Variant view:**
  - From a shader -> can view variants + why they exist.
- **Mutation validation:**
  - Mutation produces a measurable delta report (before/after).
- **Offline parity:**
  - Shader graph can be viewed from saved trace (static, no mutation).
- **Cost attribution:**
  - Shader nodes show cost with fidelity labels.

## Anti-goals

- Building "a shader editor"
- Authoring workflows
- Node editing without measurement
- Pretending to show GPU cost without data
- Competing with dedicated shader tools
