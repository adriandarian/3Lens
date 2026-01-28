---
name: query-resource-usage
description: Query resource usage by type, size, and attribution
---

# /query-resource-usage

Query resource usage statistics including memory consumption, counts, and attribution paths.

## Usage

```
/query-resource-usage [options]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| --type | all | Resource type (texture, geometry, material, shader, render_target, all) |
| --sort | size | Sort order (size, count, name) |
| --trace | (none) | Trace file to analyze (if offline) |
| --include-attribution | false | Include attribution paths |

## Examples

```bash
# All resources
3lens query resource_usage

# Textures only
3lens query resource_usage --type texture

# Sort by count
3lens query resource_usage --sort count

# With attribution
3lens query resource_usage --include-attribution

# Analyze trace
3lens query resource_usage --trace saved.json --type geometry
```

## Output Format

```json
{
  "resources": [
    {
      "entityId": "texture:main:myTexture",
      "type": "texture",
      "size": 4194304,
      "sizeFormatted": "4 MB",
      "width": 1024,
      "height": 1024,
      "format": "RGBA8",
      "attribution": [
        { "entityId": "material:main:myMat", "weight": 1.0 }
      ],
      "fidelity": "EXACT"
    }
  ],
  "summary": {
    "by_type": {
      "texture": {
        "count": 45,
        "totalSize": 67108864,
        "totalSizeFormatted": "64 MB"
      },
      "geometry": {
        "count": 23,
        "totalSize": 15728640,
        "totalSizeFormatted": "15 MB"
      }
    },
    "total": {
      "count": 68,
      "totalSize": 82837504,
      "totalSizeFormatted": "79 MB"
    }
  }
}
```

## See Also

- Skill: query-operations
- Contract: agents/contracts/attribution.md
- Addon: @3lens/addon-memory