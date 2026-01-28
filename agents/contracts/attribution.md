# Contract: Attribution

## Purpose

Attribution answers: "What is responsible for this cost/change?"
It must be auditable, weighted, and compatible with shared resources and batching.

## Invariants (MUST ALWAYS HOLD)

1. **Attribution is a chain, not a claim:**
   - Any "culprit" output MUST include an attribution chain explaining why.
   - Single-entity blame without context is forbidden.

2. **Attribution is weighted:**
   - Outputs MUST include weights or contribution scores (0..1 or percentage).
   - Weights must sum to <= 1.0 for a given cost source.

3. **Shared responsibility is first-class:**
   - A result may have multiple responsible entities; do not force a single owner.
   - Shared textures/materials attribute cost proportionally to usage.

4. **Attribution is queryable and inspectable:**
   - Users MUST be able to click from metric/hotspot -> entity -> see full chain.
   - Chain must be serializable and storable in traces.

5. **Ephemeral vs persistent entities:**
   - Ephemeral entities (e.g., draw calls) MUST link to persistent entities (materials, textures, objects).
   - Attribution chains end at persistent entities when possible.

## Attribution Output (MINIMUM SHAPE)

```typescript
interface AttributionResult {
  primary_entities: AttributedEntity[];  // Ranked list with weights
  chain: AttributionLink[];              // Ordered path explaining contribution
  signal: AttributionSignal;             // What metric drove this attribution
  fidelity: Fidelity;                    // EXACT | ESTIMATED | UNAVAILABLE
  context_id: string;                    // Which context
}

interface AttributedEntity {
  entity_id: string;
  weight: number;        // 0..1
  contribution: number;  // Absolute value (ms, bytes, count)
}

interface AttributionLink {
  from_entity: string;
  to_entity: string;
  edge_type: string;
  weight: number;
}

type AttributionSignal = 
  | 'cpu_time' 
  | 'gpu_time' 
  | 'memory_delta' 
  | 'compile_count'
  | 'draw_count'
  | 'triangle_count'
  | 'texture_memory'
  | 'custom';
```

## Degradation Rules

- If only proxies exist (no GPU timers):
  - Attribution MAY be ESTIMATED but MUST explain proxies used.
- If batching/instancing obscures object-level attribution:
  - Attribution MUST surface the batch/instance entity and distribute weights across members if possible.
  - If not possible, mark as ESTIMATED with reason.

## Acceptance Tests

- **Auditable hotspot:**
  - Top offender query result MUST include a chain that resolves in Inspector.
- **Shared resource:**
  - A texture used by multiple materials MUST attribute cost across those materials with weights.
- **Pass pipeline:**
  - A render target memory spike MUST attribute to pass/pipeline entities and upstream sources.
- **No silent collapse:**
  - If attribution cannot be determined, MUST return UNAVAILABLE rather than a guess.
- **Weight validation:**
  - Sum of weights for a single cost source MUST NOT exceed 1.0.

## Anti-goals

- "This mesh is the culprit" with no chain
- Single-entity blame when shared responsibility is obvious
- Attribution that changes randomly between runs without underlying changes
- Guessing attribution when data is unavailable
- Hardcoded blame logic without chain
