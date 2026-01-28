# 3Lens Skills & Commands

Skills are repeatable, contract-aware operations that operate on 3Lens primitives (trace, graph, query, diff, validate).

**Agents and humans MUST prefer skills over ad-hoc scripts.**

---

## Command Categories

| Category | Purpose |
|----------|---------|
| `trace:*` | Capture & replay |
| `graph:*` | Entity graph inspection |
| `query:*` | Analytical queries |
| `inspect:*` | Inspector navigation |
| `diff:*` | Change analysis |
| `shader:*` | Shader/pipeline introspection |
| `validate:*` | Contract & regression validation |
| `scaffold:*` | Generate boilerplate |
| `doctor` | Diagnose project/tooling issues |

---

## Trace & Capture Skills

### Record a Trace

```bash
3lens trace:record --duration 10s --out ./traces/runA.json
3lens trace:record --frames 300 --out ./traces/runA.json
3lens trace:record --until-idle --out ./traces/runA.json
```

**Options:**
- `--duration <seconds>` - Record for specified time
- `--frames <count>` - Record specified number of frames
- `--until-idle` - Record until frame time stabilizes
- `--mode <MINIMAL|STANDARD|DEEP>` - Capture mode
- `--contexts <ids>` - Specific contexts to record

**Agent use:** "Record a baseline before refactor"

### Replay/Open a Trace

```bash
3lens trace:open ./traces/runA.json
3lens trace:open ./traces/runA.json --headless
```

Opens trace viewer UI or loads trace for headless analysis.

### Export Trace

```bash
3lens trace:export ./traces/runA.json --profile MINIMAL --out ./report.json
3lens trace:export ./traces/runA.json --profile FULL_REDACTED --out ./share.json
```

**Profiles:** MINIMAL, STANDARD, FULL, FULL_REDACTED

---

## Inspector Skills

### Inspect an Entity

```bash
3lens inspect <entityId>
3lens inspect <entityId> --include edges,cost,diffs
3lens inspect <entityId> --format json
```

**Output:**
- Identity (type, id, origin)
- Dependencies (incoming/outgoing edges)
- Cost attribution
- Lifecycle + diffs

### Select by Query

```bash
3lens inspect --query "top_gpu_cost" --limit 5
3lens inspect --query "materials_using_texture:tex123"
```

Selection is a query result.

---

## Query Skills

### Top Offenders

```bash
3lens query top_hotspots --window 120f --metric gpu_time
3lens query top_hotspots --metric cpu_time --limit 10
3lens query top_hotspots --context main
```

**Metrics:** gpu_time, cpu_time, memory_delta, draw_count, triangle_count

### Resource Leaks

```bash
3lens query leaks --threshold 300f
3lens query leaks --context main --verbose
```

Returns resources created but not disposed within threshold frames.

### Shader Variants

```bash
3lens query shader_variants --limit 10
3lens query shader_variants --shader <shaderId>
```

### Resource Usage

```bash
3lens query resource_usage --type texture
3lens query resource_usage --type geometry --sort size
```

---

## Diff Skills

### Diff Traces

```bash
3lens diff traces/runA.json traces/runB.json
3lens diff traces/runA.json traces/runB.json --report ./diff-report.json
```

**Produces:**
- Entity graph diff
- Cost delta
- Resource delta
- New/removed entities

### Diff Frames

```bash
3lens diff frames --from 120 --to 240
3lens diff frames --trace ./traces/runA.json --from 100 --to 200
```

Compare state between frame ranges.

---

## Shader & Pipeline Skills

### List Shader Variants

```bash
3lens shader:variants <shaderId>
3lens shader:variants --all --sort compile_count
```

### Attribute Shader Cost

```bash
3lens shader:cost <shaderId>
3lens shader:cost <shaderId> --breakdown
```

### Mutate Shader (Controlled)

```bash
3lens shader:mutate <shaderId> --toggle FEATURE_X --baseline runA
3lens shader:mutate <shaderId> --disable-node nodeId --measure
```

**Produces:**
- Before/after trace
- Delta report
- Revert command

---

## Validation Skills

### Validate Contract

```bash
3lens validate inspector
3lens validate capture
3lens validate entity-graph
3lens validate attribution
3lens validate fidelity
3lens validate overhead
```

Runs contract acceptance tests.

### Validate All

```bash
3lens validate all
3lens validate all --verbose
```

### Validate Attribution Coverage

```bash
3lens validate attribution
```

Fails if metrics exist with no culprit path.

---

## Scaffold Skills

### Scaffold a Panel

```bash
3lens scaffold panel perf-timeline
3lens scaffold panel my-custom-panel --addon my-addon
```

**Generates:**
- Boilerplate files
- Query hooks
- Contract checklist

### Scaffold a Probe

```bash
3lens scaffold probe texture-upload
3lens scaffold probe custom-event
```

### Scaffold a Host

```bash
3lens scaffold host my-framework
```

### Scaffold an Addon

```bash
3lens scaffold addon my-company-addon
```

---

## Doctor Skills

### Full Diagnostic

```bash
3lens doctor
```

**Reports:**
- Environment (three.js version, backend, CSP)
- Capability matrix
- Hook status
- Storage health
- Recommendations

### Specific Diagnostics

```bash
3lens doctor discovery   # Context discovery status
3lens doctor host        # Host attachment status
3lens doctor storage     # Buffer/trace storage health
3lens doctor csp         # CSP constraint detection
```

### Export Doctor Report

```bash
3lens doctor --json > doctor-report.json
3lens doctor --export ./diagnostics.json
```

---

## UI Skills (Browser-based)

### Open UI

```bash
3lens ui:open
3lens ui:open --mode overlay
3lens ui:open --mode dock --target "#devtools-container"
3lens ui:open --mode window
```

### Take Screenshot

```bash
3lens ui:screenshot --out ./screenshot.png
```

### Smoke Test

```bash
3lens ui:smoke --url http://localhost:3000
```

---

## CI Integration

### Regression Check

```bash
# Record baseline
3lens trace:record --duration 10s --out ./baseline.json

# ... make changes ...

# Record new
3lens trace:record --duration 10s --out ./current.json

# Compare
3lens diff ./baseline.json ./current.json --fail-on-regression
```

### Contract Validation in CI

```yaml
# .github/workflows/ci.yml
- name: Validate Contracts
  run: pnpm 3lens validate all
```

---

## Programmatic API

All skills are also available programmatically:

```typescript
import { createLens } from '@3lens/runtime';
import { query, diff, validate } from '@3lens/cli';

const lens = createLens({ /* config */ });

// Query
const hotspots = await query.topHotspots(lens, { 
  window: 120, 
  metric: 'gpu_time' 
});

// Diff
const delta = await diff.traces(traceA, traceB);

// Validate
const result = await validate.contract('inspector');
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `THREELENS_ENABLED` | Enable/disable 3Lens |
| `THREELENS_MODE` | Capture mode (MINIMAL/STANDARD/DEEP) |
| `THREELENS_UI` | UI mode (overlay/dock/window) |
| `THREELENS_LOG_LEVEL` | Logging verbosity |

---

## See Also

- [agents.md](agents.md) - Project guide and contracts
- [agents/contracts/](agents/contracts/) - Contract definitions
- [agents/playbooks/](agents/playbooks/) - How-to guides
