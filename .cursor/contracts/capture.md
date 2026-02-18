# Contract: Capture

## Purpose

Capture is the authoritative event stream describing what the rendering system did.
Capture must support live sessions and offline traces with consistent semantics.

## Invariants (MUST ALWAYS HOLD)

1. **Render events are the source of truth:**
   - Any call that results in a render must be represented as a `render_event`.
   - Frame boundaries are derived from render events, not assumed.

2. **Capture is multi-context:**
   - Every event MUST include a `context_id`.
   - Events from different contexts are interleaved but independently ordered.

3. **Ordering is deterministic within a context:**
   - Events MUST be monotonically ordered by `seq` per `context_id`.
   - Sequence numbers never reset during a session.

4. **Capture is versioned:**
   - Traces MUST include `trace_version`, and consumers MUST validate compatibility.
   - Breaking schema changes require major version bump.

5. **Contexts are lifecycle-managed:**
   - A `context_register` event MUST precede any render/resource events for that context.
   - A `context_unregister` event MUST close a context (no further events allowed).

## Degradation Rules (ALLOWED BUT MUST BE EXPLICIT)

- If precise frame boundaries are unavailable:
  - Capture MUST still emit render events; frame grouping may be marked as ESTIMATED.
- If pass boundaries are unknown:
  - Emit render events without pass segmentation; label pass data as UNAVAILABLE.
- If late attach occurs:
  - Emit `attach_point` marker with timestamp; pre-existing entities marked as `origin: "preexisting"`.

## Required Event Classes (MINIMUM SET)

### Context Events
- `context_register` - New context created with metadata
- `context_update` - Context metadata changed
- `context_unregister` - Context destroyed

### Rendering Events
- `render_event` - A render call occurred (renderer, scene, camera identifiers; optional pass/pipeline info)
- `frame_begin` - Frame boundary start (if detectable)
- `frame_end` - Frame boundary end (if detectable)

### Resource Events (best-effort where possible)
- `resource_create` - Resource allocated (geometry, material, texture, render target)
- `resource_update` - Resource modified
- `resource_dispose` - Resource released

### Diagnostic Events (optional but recommended)
- `warning_event` - Non-fatal issue (hook disabled, CSP blocked, degraded mode)
- `error_event` - Fatal issue requiring user attention

## Acceptance Tests (Definition of Done)

- **Multi-context ordering:**
  - Register two contexts, emit interleaved render events, verify seq ordering per context.
- **Offline parity:**
  - Save trace, reload trace, reconstruct identical context list and render-event counts.
- **Context lifecycle:**
  - Attempt emit event before `context_register` -> MUST fail validation.
- **Determinism:**
  - Same deterministic scene renders -> stable event shapes and IDs across runs.
- **Late attach:**
  - Attach after app running -> `attach_point` marker present, entities marked preexisting.

## Anti-goals (MUST NOT DO)

- Treating "frame start/end" as truth while missing render events
- Emitting events without `context_id`
- Silent schema changes without bumping `trace_version`
- Relying on framework-specific lifecycles inside capture
- Assuming single renderer/scene/camera
