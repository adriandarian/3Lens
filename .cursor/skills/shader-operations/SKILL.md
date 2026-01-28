---
name: shader-operations
description: Introspect shaders and render pipelines in 3Lens. Use when analyzing shader variants, attributing shader costs, or performing controlled shader mutations for A/B testing.
---

# Shader Operations

Shader operations provide deep introspection into shaders and render pipelines, including variant analysis, cost attribution, and controlled mutation.

## When to Use

- Analyzing shader variant explosion
- Attributing GPU cost to specific shaders
- A/B testing shader changes
- Understanding pipeline composition

## Commands

### List Shader Variants

```bash
# Get variants for a specific shader
3lens shader:variants <shaderId>

# List all variants sorted by compile count
3lens shader:variants --all --sort compile_count
```

### Attribute Shader Cost

```bash
# Get cost for a specific shader
3lens shader:cost <shaderId>

# Get detailed breakdown
3lens shader:cost <shaderId> --breakdown
```

**Cost breakdown includes:**

- Compile time
- Execution time per frame
- Memory footprint
- Variant count

### Mutate Shader (Controlled)

Perform controlled shader mutations for A/B testing:

```bash
# Toggle a feature and compare against baseline
3lens shader:mutate <shaderId> --toggle FEATURE_X --baseline runA

# Disable a shader node and measure impact
3lens shader:mutate <shaderId> --disable-node nodeId --measure
```

**Mutation output:**

- Before/after trace
- Delta report
- Revert command

## Shader Graph Integration

For TSL (Three.js Shading Language) shaders, additional introspection is available:

```bash
# Inspect shader node graph
3lens shader:graph <shaderId>

# Find all nodes contributing to a specific output
3lens shader:graph <shaderId> --trace-output color
```

## Agent Use Cases

1. **Variant analysis**: "List all shader variants and identify which has the most compilations"
2. **Cost attribution**: "Break down the GPU cost for this PBR shader"
3. **A/B testing**: "Toggle FEATURE_REFLECTION off and measure the performance delta"
4. **Optimization**: "Find which shader node is most expensive"

## Safety Notes

- Mutations are isolated and don't affect production code
- Always capture a baseline trace before mutating
- Use the provided revert command to undo changes
- Mutations work on both live sessions and saved traces

## Additional Resources

- For detailed command syntax, see [skills.md](../../../skills.md)
- For shader graph contract, see [agents/contracts/shader-graph.md](../../../agents/contracts/shader-graph.md)
