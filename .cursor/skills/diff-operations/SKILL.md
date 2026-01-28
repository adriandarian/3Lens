---
name: diff-operations
description: Compare 3Lens traces and frames to detect changes, regressions, and performance deltas. Use when comparing before/after states, detecting regressions in CI, or analyzing changes over time.
---

# Diff Operations

Diff operations compare traces or frame ranges to identify changes in the entity graph, costs, and resources.

## When to Use

- Comparing before/after a code change
- Detecting performance regressions
- Analyzing resource delta between states
- Finding new/removed entities

## Commands

### Diff Traces

Compare two saved traces:

```bash
# Basic trace comparison
3lens diff traces/runA.json traces/runB.json

# Generate a diff report file
3lens diff traces/runA.json traces/runB.json --report ./diff-report.json
```

**Diff report includes:**

- Entity graph diff (added/removed/modified entities)
- Cost delta (GPU time, CPU time, memory)
- Resource delta (textures, geometries, shaders)
- New/removed entities list

### Diff Frames

Compare state between frame ranges within a trace:

```bash
# Compare frames 120 to 240 in current session
3lens diff frames --from 120 --to 240

# Compare frames in a saved trace
3lens diff frames --trace ./traces/runA.json --from 100 --to 200
```

## Diff Output Format

```typescript
{
  summary: {
    entities_added: number,
    entities_removed: number,
    entities_modified: number,
    cost_delta: {
      gpu_time: number,
      cpu_time: number,
      memory: number
    }
  },
  entities: {
    added: Entity[],
    removed: Entity[],
    modified: EntityDiff[]
  },
  resources: {
    textures: ResourceDiff,
    geometries: ResourceDiff,
    shaders: ResourceDiff
  }
}
```

## CI Integration

Use diff operations for regression detection:

```bash
# Record baseline
3lens trace:record --duration 10s --out ./baseline.json

# ... make changes ...

# Record new trace
3lens trace:record --duration 10s --out ./current.json

# Compare and fail on regression
3lens diff ./baseline.json ./current.json --fail-on-regression
```

## Agent Use Cases

1. **Before/after comparison**: "Compare traces before and after the shader refactor"
2. **Regression detection**: "Check if this PR introduces a performance regression"
3. **Change analysis**: "What entities were added between frame 100 and 200?"
4. **Resource audit**: "Show resource delta between these two captures"

## Additional Resources

- For detailed command syntax, see [skills.md](../../../skills.md)
- For fidelity rules on diff metrics, see [agents/contracts/fidelity.md](../../../agents/contracts/fidelity.md)
