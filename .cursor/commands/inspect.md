---
name: inspect
description: Inspect entities to answer the 5 Inspector questions
---

# /inspect

Inspect entities to answer the 5 Inspector questions: What is this? Dependencies? What depends on it? Cost? How has it changed?

## Usage

```
/inspect <entityId> [options]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| entityId | (required) | Entity ID in format `type:namespace:identifier` |
| --include | all | What to include (info, dependencies, dependents, cost, diffs, edges, lifecycle) |
| --trace | (none) | Trace file to inspect (if offline) |
| --format | table | Output format (table, json, tree) |

## Examples

```bash
# Inspect a mesh
3lens inspect mesh:main:myMesh

# Inspect with specific includes
3lens inspect material:main:myMaterial --include cost,dependencies

# Inspect from trace
3lens inspect shader:main:myShader --trace saved.json --include cost,variants

# Tree format for dependencies
3lens inspect mesh:main:myMesh --include dependencies --format tree
```

## Entity ID Format

Entity IDs follow the pattern: `<type>:<namespace>:<identifier>`

Examples:
- `mesh:main:myMesh`
- `material:main:myMaterial`
- `texture:main:myTexture`
- `shader:main:myShader`
- `geometry:main:myGeometry`

## The 5 Inspector Questions

### 1. What is this?

```bash
3lens inspect mesh:main:myMesh --include info
```

Returns entity metadata, type, properties.

### 2. Dependencies?

```bash
3lens inspect mesh:main:myMesh --include dependencies
```

Returns what this entity depends on (materials, geometries, textures).

### 3. What depends on it?

```bash
3lens inspect material:main:myMaterial --include dependents
```

Returns what entities depend on this one.

### 4. Cost?

```bash
3lens inspect mesh:main:myMesh --include cost
```

Returns performance cost with attribution path.

### 5. How has it changed?

```bash
3lens inspect mesh:main:myMesh --include diffs
```

Returns change history and diffs.

## Output Format

```json
{
  "entityId": "mesh:main:myMesh",
  "info": {
    "type": "mesh",
    "name": "myMesh",
    "properties": { ... }
  },
  "dependencies": [
    { "entityId": "geometry:main:myGeo", "type": "uses" },
    { "entityId": "material:main:myMat", "type": "uses" }
  ],
  "dependents": [
    { "entityId": "scene:main:myScene", "type": "contains" }
  ],
  "cost": {
    "gpuTime": 8.5,
    "cpuTime": 2.1,
    "attribution": [
      { "entityId": "material:main:myMat", "weight": 0.7 },
      { "entityId": "geometry:main:myGeo", "weight": 0.3 }
    ],
    "fidelity": "EXACT"
  },
  "diffs": [
    {
      "frame": 120,
      "change": "material_updated",
      "before": "material:main:oldMat",
      "after": "material:main:myMat"
    }
  ]
}
```

## See Also

- Skill: inspector-operations
- Contract: agents/contracts/inspector.md
- Subagent: trace-analyzer