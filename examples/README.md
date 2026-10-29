# Examples as Devtools Verification Fixtures

Development focuses on the devtools workflow. Scenes give the tools something to
inspect and provide evidence that an investigation works. Expanding a gallery is
not a project milestone.

## Current Assessment

The current checkout contains one example package. The previous catalog described
planned examples, not verified capabilities. Those entries are no longer an
implementation backlog; any future example must justify its verification value.

| Existing example | Decision | Purpose | Current limitation |
| --- | --- | --- | --- |
| `getting-started/vanilla-threejs` | Keep as the initial fixture | Exercise attachment, entity inspection, shared resources, and live rendering in one small scene | Live inspection, baseline changes, weighted storage attribution, and trace round-trip are integrated. Per-entity CPU/GPU timings remain explicitly UNAVAILABLE; geometry storage is an ESTIMATED CPU-buffer proxy. |

This assessment does not establish that all other packages or features work. It
identifies where to start an end-to-end investigation.

## Implemented Investigation Workflow

Use the existing scene for this acceptance flow:

1. Start from a fresh page and attach the tools through the public API. Show the
   active context or explain why attachment is unavailable.
2. Open, close, and reopen the devtools. Expose an obvious entry point and make
   the advertised F2 shortcut work without duplicating panels or listeners.
3. Select `MainCube` in the inspector. Show its stable entity ID and its geometry,
   material, scene, and context relationships from captured data and kernel queries.
4. Show supported cost measurements with EXACT / ESTIMATED / UNAVAILABLE fidelity
   and a navigable attribution path. Explain missing measurements; never substitute
   plausible numbers or invent per-object GPU timings.
5. Capture an observable entity or resource change and compare before and after.
   Preserve selection through the shared entity IDs.
6. Export the trace and load it with the live host detached. Reproduce the selected
   entity, relationships, captured measurements, and recorded change offline.
7. Run acceptance checks for the touched contracts and verify UI teardown and
   reattachment. A scene screenshot alone is not acceptance evidence.

### Scope

- **Entities:** context, scene, camera, mesh, geometry, material, captured frames,
  and any resource entities required by the supported measurements.
- **Queries:** reuse the kernel's entity, relationship, cost, and diff queries;
  inspect current implementations before proposing additions. Views must not read
  the live renderer as a separate source of truth.
- **Actions:** attach/detach, show/hide tools, select an entity, capture/export,
  load a trace, and compare recorded states.
- **Verification:** deterministic expected relationships and changes in the local
  fixture, contract acceptance checks, and the same investigation in live and
  offline modes. Control or exclude animation and random colors when comparing
  repeated runs.

Follow the capture, entity graph, inspector, attribution, fidelity, runtime boundary,
UI surface, and storage contracts. Acceptance coverage lives in
`tests/contracts/*investigation*.test.ts`. These checks cover this investigation
workflow, not every acceptance criterion in every contract.

## How to Decide Whether an Example Belongs Here

| Decision | Criterion |
| --- | --- |
| Keep | Provides a distinct, reproducible devtools investigation or contract regression check |
| Merge | Its verification question can be covered by an existing fixture |
| Replace with an upstream reference | Useful for manual compatibility testing, but does not require locally maintained scene code |
| Remove | Duplicates coverage or demonstrates rendering without a devtools verification purpose |

Before adding or removing an example, identify its developer question, relevant
contract, expected result, and replacement coverage. Check script, documentation,
and test references before removal.

Prefer a small deterministic local fixture for automated acceptance. For broader
manual coverage, use existing three.js or community scenes and record the source,
version, attachment method, and reproduction steps. Check licensing before copying
code or assets. An external scene is a test input; successfully displaying it is
not proof that 3Lens attached or captured useful data.

## Running the Current Fixture

From the repository root:

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000/`. The startup script builds workspace packages and
starts watchers with the vanilla scene. It also terminates a process already
listening on port 3000. The tools open alongside the scene. Select `MainCube`,
set a baseline, hide the cube with the fixture control, and inspect its captured
visibility change. Use
Export trace and Open trace to repeat the investigation with live capture detached.
Reload the page to return from offline inspection to a fresh live session.

Use `pnpm example:list` to list example packages found in the checkout.

Verify the integration with `pnpm test` and `pnpm typecheck:investigation`.
The latter checks the connected workspace TypeScript sources directly, including
the fixture, rather than depending on generated declaration files in `dist`.

## Platform Workspaces

The six concept areas are available from the shared tools navigation:

| Area | Implemented interaction |
| --- | --- |
| Inspect | Scene tree, picking, focus, projected selection bounds, resource relationships, baseline changes, recorded frame navigation |
| Performance | CPU submission chart, captured renderer counters, actual entity paths, timing baseline comparison |
| Memory | Resource lifetimes, storage estimates, filtering, shared usage attribution, dependency relationships, loading-evidence states |
| Changes | Baseline/candidate files, frame/marker alignment, property diffs, side inspection, bookmarks, dropped-history notices |
| Shaders | Captured runtime WebGL source and feature defines, observed variants/users, explicit pipeline descriptors, read-only source stages |
| Surfaces | Working picking controls, docked workspace, compact draggable overlay, same-origin trace window, command palette |

Use the Surface selector for Workspace, Overlay, Dock right, or Trace window.
F2 toggles the tools; Ctrl/Cmd+K opens commands; hold Alt for input passthrough.
The separate window shares the public Lens data/selection with its opener and can
load saved traces. The application can supply a host-owned dock target and viewport.
The fixture's camera controls adapt through the manual host's `onFocus` callback.

Concept references are in `output/imagegen/3lens-platform-v1/`. Browser captures,
real exported traces, the repeatable Playwright CLI verification function, and
per-concept evaluation results are in `output/design-evaluation/platform-v1/`.

## Current Limits

- The default workflow uses an explicitly registered manual host and the full
  workspace. Automatic discovery and other host integrations need their own acceptance work.
- Geometry storage and equal-share resource attribution are estimates, not measured
  per-object GPU allocations. Per-entity CPU/GPU timers are unavailable in this path.
- Captured properties cover visibility, names, resource usage, and selected material
  properties. Continuous transform/animation history is outside this milestone.
- Live capture starts a bounded recording automatically. Record starts a fresh
  event recording after stopping; Set baseline saves the comparison
  state. Both the selected entity and baseline are included in STANDARD exports.
- Event recording retains at most 20,000 events / approximately 8 MB by default.
  Dropped-history counts are reported; a final checkpoint preserves current state.
- STANDARD trace files contain captured scene data. FULL_REDACTED investigation
  export is explicitly unsupported rather than silently exporting unredacted data.

- Loader start/decode/upload timing and uninstrumented pass boundaries remain
  UNAVAILABLE. Explicit pipeline descriptors show structure, not invented timing.
- Runtime WebGL source is captured when the active renderer exposes it. GPU and
  compilation timings are not inferred from shader source or CPU submission time.
- CSP-safe mode uses an external stylesheet and captured-data tables; dynamic
  chart styling, dragging, and projected highlight enhancements are limited.
