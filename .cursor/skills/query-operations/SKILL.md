---
name: query-operations
description: Run analytical queries on 3Lens data to find performance hotspots, resource leaks, shader variants, and resource usage. Use when analyzing performance issues, finding memory leaks, or understanding resource consumption.
---

# Query Operations

Query operations allow you to analyze captured data to find performance issues, resource leaks, and usage patterns.

## When to Use

- Finding performance bottlenecks (GPU/CPU time)
- Detecting resource leaks
- Analyzing shader variant explosion
- Understanding resource usage patterns

## Commands

### Top Hotspots

Find the most expensive operations:

```bash
# Find top GPU time consumers over 120 frames
3lens query top_hotspots --window 120f --metric gpu_time

# Find top CPU time consumers
3lens query top_hotspots --metric cpu_time --limit 10

# Query specific context
3lens query top_hotspots --context main
```

**Metrics:** `gpu_time`, `cpu_time`, `memory_delta`, `draw_count`, `triangle_count`

### Resource Leaks

Detect resources that aren't being disposed:

```bash
# Find resources not disposed within 300 frames
3lens query leaks --threshold 300f

# Verbose output with context
3lens query leaks --context main --verbose
```

### Shader Variants

Analyze shader variant usage:

```bash
# List top shader variants by count
3lens query shader_variants --limit 10

# Get variants for a specific shader
3lens query shader_variants --shader <shaderId>
```

### Resource Usage

Analyze resource consumption:

```bash
# Query texture usage
3lens query resource_usage --type texture

# Query geometry sorted by size
3lens query resource_usage --type geometry --sort size
```

## Agent Use Cases

1. **Performance investigation**: "Find the top 5 GPU hotspots in the last 120 frames"
2. **Memory debugging**: "Check for resources that haven't been disposed"
3. **Shader optimization**: "List all shader variants to identify bloat"
4. **Resource audit**: "Show texture usage sorted by memory size"

## Query Result Format

All queries return results with fidelity indicators:

```typescript
{
  results: [...],
  fidelity: 'EXACT' | 'ESTIMATED' | 'UNAVAILABLE',
  window: { start: number, end: number }
}
```

## Additional Resources

- For detailed command syntax, see [skills.md](../../../skills.md)
- For attribution rules, see [agents/contracts/attribution.md](../../../agents/contracts/attribution.md)
- Commands: [query-hotspots](../../../commands/query-hotspots.md), [query-leaks](../../../commands/query-leaks.md), [query-shader-variants](../../../commands/query-shader-variants.md), [query-resource-usage](../../../commands/query-resource-usage.md)
- Contract: [fidelity.md](../../../agents/contracts/fidelity.md)
- Agent: [performance-optimizer](../../../agents/performance-optimizer.md)
