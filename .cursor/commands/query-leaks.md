---
name: query-leaks
description: Detect memory leaks by identifying resources that grow over time
---

# /query-leaks

Detect memory leaks by identifying resources that grow continuously over time without being disposed.

## Usage

```
/query-leaks [options]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| --threshold | 300f | Minimum frames to consider a leak (default: 300 frames) |
| --type | all | Resource type to check (texture, geometry, material, shader, all) |
| --trace | (none) | Trace file to analyze (if offline) |
| --verbose | false | Show detailed leak information |

## Examples

```bash
# Find all leaks
3lens query leaks

# Check specific resource type
3lens query leaks --type texture

# Use custom threshold
3lens query leaks --threshold 600f

# Analyze saved trace
3lens query leaks --trace saved.json --verbose

# Verbose output
3lens query leaks --verbose
```

## Output Format

```json
{
  "leaks": [
    {
      "entityId": "texture:main:leakedTexture",
      "type": "texture",
      "growth": {
        "start": 1024,
        "end": 2048,
        "frames": 450,
        "rate": 2.27
      },
      "attribution": [
        { "entityId": "material:main:myMat", "weight": 1.0 }
      ],
      "fidelity": "EXACT"
    }
  ],
  "summary": {
    "total_leaks": 3,
    "total_memory": 15728640,
    "by_type": {
      "texture": 2,
      "geometry": 1
    }
  }
}
```

## Leak Detection Logic

A resource is considered a leak if:
1. Memory usage increases continuously over threshold frames
2. No corresponding `resource_dispose` event is found
3. Growth rate exceeds baseline noise

## See Also

- Skill: query-operations
- Contract: agents/contracts/attribution.md
- Addon: @3lens/addon-memory