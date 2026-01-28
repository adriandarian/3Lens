---
name: query-shader-variants
description: Analyze shader variants and detect compilation storms
---

# /query-shader-variants

Analyze shader variants, detect compilation storms, and identify shader optimization opportunities.

## Usage

```
/query-shader-variants [options]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| --shader | (none) | Specific shader ID to analyze |
| --window | 120f | Time window in frames |
| --trace | (none) | Trace file to analyze (if offline) |
| --include-cost | false | Include performance cost per variant |

## Examples

```bash
# Find all shader variants
3lens query shader_variants

# Analyze specific shader
3lens query shader_variants --shader shader:main:myShader

# Check for compilation storms
3lens query shader_variants --window 60f

# Include cost analysis
3lens query shader_variants --include-cost

# Analyze trace
3lens query shader_variants --trace saved.json
```

## Output Format

```json
{
  "shaders": [
    {
      "shaderId": "shader:main:myShader",
      "variants": [
        {
          "id": "variant-1",
          "defines": { "USE_NORMAL_MAP": true },
          "compilations": 5,
          "frames": [10, 45, 120, 200, 350],
          "cost": {
            "compilationTime": 45.2,
            "gpuTime": 8.5,
            "fidelity": "EXACT"
          }
        }
      ],
      "compilationStorm": true,
      "recommendations": [
        "Pre-compile variants to avoid runtime compilation",
        "5 variants compiled at runtime"
      ]
    }
  ],
  "summary": {
    "total_shaders": 12,
    "total_variants": 45,
    "compilation_storms": 2,
    "total_compilation_time": 234.5
  }
}
```

## Compilation Storm Detection

A compilation storm is detected when:
- Multiple variants compile within a short window (default: 60 frames)
- Compilation time exceeds threshold
- Performance impact is significant

## See Also

- Skill: shader-operations
- Contract: agents/contracts/shader-graph.md
- Addon: @3lens/addon-shader