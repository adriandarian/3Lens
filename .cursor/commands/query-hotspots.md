---
name: query-hotspots
description: Find top performance hotspots in 3Lens capture
---

# /query-hotspots

Query the top performance hotspots by GPU time, CPU time, or other metrics.

## Usage

```
/query-hotspots [metric] [limit]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| metric | gpu_time | Metric to sort by |
| limit | 10 | Number of results |

## Available Metrics

- `gpu_time` - GPU execution time
- `cpu_time` - CPU processing time
- `memory_delta` - Memory change
- `draw_count` - Draw calls
- `triangle_count` - Triangles rendered

## Examples

```bash
# Top 10 GPU hotspots
3lens query top_hotspots --metric gpu_time --limit 10

# Top CPU consumers over 120 frames
3lens query top_hotspots --window 120f --metric cpu_time

# Query specific context
3lens query top_hotspots --context main
```

## See Also

- Skill: query-operations
- Contract: agents/contracts/attribution.md
- Contract: agents/contracts/fidelity.md
- Command: inspect (for entity details)
- Agent: performance-optimizer
