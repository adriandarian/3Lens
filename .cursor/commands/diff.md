---
name: diff
description: Compare traces and frames to detect changes, regressions, and performance deltas
---

# /diff

Compare two traces or frames to detect changes, regressions, and performance differences.

## Usage

```
/diff <traceA> <traceB> [options]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| traceA | (required) | Path to first trace file |
| traceB | (required) | Path to second trace file |
| --metric | gpu_time | Metric to compare (gpu_time, cpu_time, memory_delta, draw_count) |
| --report | (none) | Path to save comparison report |
| --fail-on-regression | false | Exit with error if regression detected |
| --threshold | 0.1 | Regression threshold (10% by default) |

## Examples

```bash
# Compare two traces
3lens diff baseline.json current.json

# Compare with specific metric
3lens diff baseline.json current.json --metric memory_delta

# Generate report
3lens diff baseline.json current.json --report comparison.json

# Fail CI on regression
3lens diff baseline.json current.json --fail-on-regression --threshold 0.15
```

## Output Format

The diff command outputs:

```json
{
  "summary": {
    "baseline": "baseline.json",
    "current": "current.json",
    "regression": false,
    "improvement": true
  },
  "metrics": {
    "gpu_time": {
      "baseline": 16.5,
      "current": 15.2,
      "delta": -1.3,
      "percent_change": -7.9,
      "regression": false
    }
  },
  "hotspots": [
    {
      "entityId": "mesh:main:myMesh",
      "baseline": 8.5,
      "current": 7.2,
      "delta": -1.3
    }
  ],
  "recommendations": [
    "Performance improved by 7.9%",
    "Top hotspot reduced by 15%"
  ]
}
```

## CI Integration

Use in CI workflows to detect regressions:

```yaml
# .github/workflows/ci.yml
- name: Check for regressions
  run: |
    3lens trace:record --duration 10s --out current.json
    3lens diff baseline.json current.json --fail-on-regression
```

## See Also

- Skill: diff-operations
- Subagent: trace-analyzer
- Contract: agents/contracts/fidelity.md