# Contract: Inspector

## Purpose

The Inspector is the primary navigation and blame surface of 3Lens.
It is not a standalone panel. All other tools route through Inspector selection.

## The Inspector is the SPINE

Every other tool routes through Inspector:
- Performance hotspot -> selects entity in Inspector
- Memory spike -> selects resources in Inspector
- Timeline event -> selects associated entities in Inspector
- Diff change -> highlights changed entities in Inspector

## The 5 Questions (MUST ANSWER FOR ANY SELECTED ENTITY)

### 1. What is this?
- Entity type (Mesh, Material, Texture, Shader Variant, Pass, Resource, Frame)
- Stable ID (namespaced: `context:type:localId`)
- Origin (created by whom / where / when)
- Basic properties (name, visible, layer, etc.)

### 2. Where is it used?
- Incoming edges (what depends on this entity)
- Outgoing edges (what this entity depends on)
- Count + frequency (used once vs used everywhere)
- Examples:
  - "This texture is used by 7 materials"
  - "This material is referenced by 42 meshes across 3 passes"

### 3. What does it cost?
Cost is **contextual**, not a static number:
- GPU time (aggregated + per-frame when available)
- CPU overhead (setup, uploads, sync)
- Memory footprint
- Variant count (for shaders/materials)
- Cost MUST be clickable -> jump to timeline, diff, or culprit view

### 4. How did it change over time?
- Appeared / mutated / disappeared events
- Diff vs previous frame
- Diff vs previous session/trace
- Examples:
  - "This material gained 2 defines between frames 120-121"
  - "This texture doubled in size after resize event"

### 5. What can I do about it?
- Highlight in scene (visual selection)
- Jump to shader graph (if applicable)
- Jump to timeline spike
- Show optimization hints/suggestions
- Validate fix after change (before/after comparison)

## Invariants (MUST ALWAYS HOLD)

1. **Selection is a query result:**
   - Selection is represented by stable Entity IDs, not JS object references.
   - Selection can be serialized, saved, and restored.

2. **Every Inspector view is backed by the unified Entity Graph + Timeline:**
   - No isolated object views.
   - All data comes from kernel queries.

3. **Every metric displayed MUST provide a clickable route to a culprit entity:**
   - No dead-end numbers.

4. **Inspector must function with live sessions AND offline traces:**
   - Same UI, same queries, same answers.

5. **Inspector must expose relationships (incoming/outgoing edges) for every entity:**
   - No entity exists in isolation.

## Selection Model

```typescript
interface InspectorSelection {
  entity_ids: string[];        // One or more selected entities
  context_id: string;          // Which context (or 'all')
  source: SelectionSource;     // How selection was made
  timestamp: number;           // When selected
}

type SelectionSource = 
  | 'user_click'
  | 'query_result'
  | 'hotspot_navigation'
  | 'diff_highlight'
  | 'timeline_event'
  | 'external';
```

## Acceptance Tests (Definition of Done)

- **5 Questions:**
  - Given an entity selection, Inspector can render identity, relationships, cost, diffs, and actions.
- **Hotspot navigation:**
  - Clicking a perf hotspot selects the culprit entity and opens Inspector on it.
- **Memory navigation:**
  - Clicking a memory spike selects responsible resources and opens Inspector.
- **Trace parity:**
  - Loading a saved trace reproduces the same Inspector selections and views.
- **Multi-select:**
  - Selecting multiple entities shows aggregated/compared view.

## Anti-goals (MUST NOT DO)

- "Property grid only" with no context, cost, or relationships
- Panels that show metrics without attribution paths
- Tooling that only works in live mode
- Selection that breaks across page refreshes
- Inspector that doesn't know about time/diffs
