# Skill: Analytics Operations

Interpret, validate, and act on 3Lens query and diff output. Use this skill when you have raw JSON or markdown output from `3lens query` or `3lens diff` and need help understanding it, validating attribution chains, or deciding what to do next.

## When to Use This Skill

- You ran `3lens query top_hotspots` and want the output interpreted
- You ran `3lens diff` and need help reading the regression report
- You want to validate that attribution chains in query output are complete and weighted correctly
- You are doing ad-hoc performance exploration and want Cursor to suggest follow-up queries
- You want to correlate query output to specific contracts (e.g. overhead budget)

## Prerequisites

- `3lens` CLI installed and in PATH (`pnpm install` from repo root)
- A running scene or a saved trace file

## Workflow

### Step 1: Run the Query or Diff

Choose the right command for your goal:

```bash
# Top GPU/CPU hotspots (live or trace)
3lens query top_hotspots --window 120f --metric gpu_time

# Memory leaks
3lens query leaks --threshold 300f

# Shader variants contributing to cost
3lens query shader_variants --threshold 0.05

# Resource usage breakdown
3lens query resource_usage --include textures,geometries

# Compare two traces
3lens diff traces/baseline.json traces/current.json --report diff.json
```

### Step 2: Paste the Output

Paste the JSON or markdown output into the chat. Tell Cursor:

> "Interpret this query output for me."
> "Validate the attribution chains in this output."
> "What follow-up queries should I run based on this?"

### Step 3: Interpret the Output

Cursor will:

1. **Summarize the findings** — top entities, cost breakdown, anomalies
2. **Validate attribution** — check that each metric has `fidelity` + `attribution` with entity IDs and weights summing to ~1.0
3. **Flag issues** — missing fidelity labels, entities with no attribution, outliers
4. **Suggest follow-up queries** — based on what the output reveals

### Step 4: Act on Findings

Based on interpretation:

```bash
# Drill into a specific entity
3lens query top_hotspots --filter entity:material:main:myMat

# Inspect an entity directly
3lens inspect mesh:main:myMesh --include cost,dependencies

# Record a new trace after fixing
3lens trace:record --duration 10s --out traces/after-fix.json

# Diff before/after
3lens diff traces/before-fix.json traces/after-fix.json
```

## Examples

### Example: Interpreting top_hotspots output

```bash
3lens query top_hotspots --window 120f --metric gpu_time --out hotspots.json
```

Paste `hotspots.json` into chat:

> "The top hotspot is `material:main:glass` at 8.2ms (52% of frame). Attribution shows geometry `mesh:main:sphere` at weight 0.7 and shader `shader:main:refraction` at weight 0.3. Fidelity: ESTIMATED. Follow-up: query shader variants on the refraction shader."

### Example: Validating a diff report

```bash
3lens diff traces/before.json traces/after.json --report diff.json
```

Paste `diff.json`:

> "GPU time regressed by 3.1ms (+19%). Regression attributed to `material:main:glass` — weight increased from 0.2 to 0.52 after the PR. Attribution chain is complete. Fidelity: EXACT. Recommendation: revert or optimize the glass material shader."

### Example: Attribution validation

When attribution is incomplete, Cursor will flag:

> "Entity `mesh:main:cube` has a metric with `fidelity: ESTIMATED` but `attribution` is empty. This violates the attribution contract (`.cursor/contracts/attribution.md`). The metric cannot be trusted without a blame chain."

## Key Rules

- Fidelity must be declared for every metric (`EXACT`, `ESTIMATED`, or `UNAVAILABLE`)
- Attribution weights should sum to approximately 1.0 for a metric
- `UNAVAILABLE` fidelity means the metric cannot be used for decisions — flag it prominently
- Always cross-reference findings against the overhead budget in `.cursor/contracts/overhead.md`
- Regressions in diff output require an entity-level attribution — never accept "global" regressions

## Related Resources

- Commands: `.cursor/commands/query-hotspots.md`, `.cursor/commands/query-leaks.md`, `.cursor/commands/diff.md`
- Contracts: `.cursor/contracts/attribution.md`, `.cursor/contracts/fidelity.md`, `.cursor/contracts/overhead.md`
- Skills: `diff-operations`, `trace-operations`, `query-operations`
- Agent: `.cursor/agents/trace-analyzer.md`
