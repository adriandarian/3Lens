# Playbook: Optimize Performance

This playbook describes how to optimize performance in 3Lens, including capture overhead, query performance, and rendering performance.

## Prerequisites

- [ ] Understand performance budgets (overhead contract)
- [ ] Know how to record and analyze traces
- [ ] Familiar with attribution paths
- [ ] Understand fidelity trade-offs

## Steps

### 1. Identify Performance Issues

Start by identifying bottlenecks:

```bash
# Record baseline trace
3lens trace:record --duration 10s --out baseline.json

# Find hotspots
3lens query top_hotspots --trace baseline.json --metric gpu_time

# Check overhead
3lens doctor overhead
```

### 2. Analyze Attribution Paths

Trace attribution to find root causes:

```bash
# Inspect top hotspot
3lens inspect <entityId> --include cost

# Check attribution chain
3lens inspect <entityId> --include dependencies,cost
```

### 3. Measure Overhead

Check capture overhead:

```bash
# Check overhead by mode
3lens doctor overhead --mode MINIMAL
3lens doctor overhead --mode STANDARD
3lens doctor overhead --mode DEEP
```

Reference overhead budgets:
- MINIMAL: < 1% CPU, < 5% memory
- STANDARD: < 5% CPU, < 10% memory
- DEEP: < 15% CPU, < 20% memory

### 4. Optimize Capture Overhead

Reduce capture overhead:

```typescript
// Reduce capture frequency
const lens = createLens({
  capture: {
    mode: 'MINIMAL', // Instead of STANDARD
    sampleRate: 0.1  // Sample 10% of frames
  }
});

// Use ring buffer for traces
const traceManager = new TraceManager({
  maxFrames: 1000, // Limit trace size
  compression: 'gzip'
});
```

### 5. Optimize Queries

Optimize query performance:

```typescript
// Use windowed queries instead of full trace
const hotspots = await client.query('top_hotspots', {
  window: 60, // Last 60 frames only
  metric: 'gpu_time'
});

// Cache query results
const cache = new Map();
function cachedQuery(name, params) {
  const key = `${name}:${JSON.stringify(params)}`;
  if (cache.has(key)) return cache.get(key);
  const result = await client.query(name, params);
  cache.set(key, result);
  return result;
}
```

### 6. Optimize Shader Compilation

Pre-compile shader variants:

```typescript
// Find compilation storms
const variants = await client.query('shader_variants', {
  shader: 'shader:main:myShader'
});

// Pre-compile variants
if (variants.compilationStorm) {
  await client.shader.precompileVariants(
    'shader:main:myShader',
    variants.variants.map(v => v.defines)
  );
}
```

### 7. Optimize Memory Usage

Reduce memory consumption:

```typescript
// Use ring buffer for traces
const traceManager = new TraceManager({
  maxFrames: 1000,
  compression: 'gzip',
  cleanupInterval: 5000 // Clean up every 5 seconds
});

// Limit entity graph size
const graph = new EntityGraph({
  maxNodes: 10000,
  maxEdges: 50000
});
```

### 8. Compare Before/After

Measure improvements:

```bash
# Record optimized trace
3lens trace:record --duration 10s --out optimized.json

# Compare
3lens diff baseline.json optimized.json --report comparison.json

# Check improvements
cat comparison.json
```

### 9. Validate Overhead Compliance

Ensure overhead stays within budget:

```bash
# Measure overhead
3lens doctor overhead --mode STANDARD

# Should report:
# - CPU overhead: X% (Budget: 5%) ✅
# - Memory overhead: Y% (Budget: 10%) ✅
```

### 10. Document Optimizations

Document what was optimized and why:

```markdown
# Performance Optimizations

## Changes Made

1. Reduced capture sample rate from 100% to 10%
   - Impact: 90% reduction in capture overhead
   - Trade-off: Some frame data may be missed

2. Pre-compile shader variants
   - Impact: Eliminated compilation storms
   - Trade-off: Slightly higher initial load time

## Results

- CPU overhead: 8% → 3% (within 5% budget) ✅
- Memory overhead: 12% → 7% (within 10% budget) ✅
- Average frame time: 18ms → 16ms
```

## Optimization Strategies

### Reduce Capture Overhead

1. **Lower capture mode**
   - MINIMAL instead of STANDARD
   - STANDARD instead of DEEP

2. **Sample frames**
   - Sample 10% of frames instead of all
   - Sample every Nth frame

3. **Limit trace size**
   - Use ring buffer
   - Compress traces
   - Limit frame count

### Optimize Queries

1. **Window queries**
   - Query last N frames instead of all
   - Use sliding windows

2. **Cache results**
   - Cache query results
   - Invalidate on changes

3. **Lazy evaluation**
   - Only compute when needed
   - Defer expensive operations

### Optimize Memory

1. **Ring buffers**
   - Limit trace size
   - Overwrite old data

2. **Compression**
   - Compress traces
   - Compress entity graph

3. **Cleanup**
   - Dispose unused resources
   - Clean up old data

## Checklist

When optimizing:

- [ ] Identified performance bottlenecks
- [ ] Traced attribution paths
- [ ] Measured overhead
- [ ] Applied optimizations
- [ ] Compared before/after
- [ ] Validated overhead compliance
- [ ] Documented optimizations
- [ ] Considered fidelity trade-offs

## Anti-patterns to Avoid

- ❌ Optimizing without measuring
- ❌ Breaking fidelity without documenting
- [ ] Exceeding overhead budgets
- ❌ Optimizing prematurely
- ❌ Not validating improvements
- ❌ Not documenting trade-offs

## See Also

- Skill: performance-optimizer
- Skill: query-operations
- Skill: trace-operations
- Contract: agents/contracts/overhead.md
- Contract: agents/contracts/attribution.md
- Agent: performance-optimizer