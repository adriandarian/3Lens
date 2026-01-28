---
name: trace-operations
description: Capture and replay 3Lens traces for debugging, performance analysis, and regression testing. Use when recording traces, opening/replaying saved traces, or exporting trace data for sharing.
---

# Trace Operations

Trace operations are the foundation of 3Lens analysis. Use these commands to capture, replay, and export render traces.

## When to Use

- Recording a baseline before making changes
- Capturing a performance spike reproduction
- Sharing traces for debugging or collaboration
- Comparing before/after states

## Commands

### Record a Trace

```bash
# Record for a specific duration
3lens trace:record --duration 10s --out ./traces/runA.json

# Record a specific number of frames
3lens trace:record --frames 300 --out ./traces/runA.json

# Record until frame time stabilizes
3lens trace:record --until-idle --out ./traces/runA.json
```

**Options:**

| Option | Description |
|--------|-------------|
| `--duration <seconds>` | Record for specified time |
| `--frames <count>` | Record specified number of frames |
| `--until-idle` | Record until frame time stabilizes |
| `--mode <MINIMAL\|STANDARD\|DEEP>` | Capture mode |
| `--contexts <ids>` | Specific contexts to record |

### Open/Replay a Trace

```bash
# Open in trace viewer UI
3lens trace:open ./traces/runA.json

# Open for headless analysis
3lens trace:open ./traces/runA.json --headless
```

### Export Trace

```bash
# Export with minimal profile
3lens trace:export ./traces/runA.json --profile MINIMAL --out ./report.json

# Export with full redacted profile (safe for sharing)
3lens trace:export ./traces/runA.json --profile FULL_REDACTED --out ./share.json
```

**Export Profiles:** MINIMAL, STANDARD, FULL, FULL_REDACTED

## Agent Use Cases

1. **Before refactoring**: "Record a baseline trace before the shader refactor"
2. **Bug reproduction**: "Capture a trace when the memory spike occurs"
3. **CI regression**: "Record traces for baseline comparison"

## Additional Resources

- For detailed command syntax, see [skills.md](../../../skills.md)
- For trace format details, see [agents/contracts/capture.md](../../../agents/contracts/capture.md)
- Commands: [trace-record](../../../commands/trace-record.md), [trace-open](../../../commands/trace-open.md)
- Skill: [diff-operations](../diff-operations/SKILL.md)
- Skill: [query-operations](../query-operations/SKILL.md)
- Agent: [trace-analyzer](../../../agents/trace-analyzer.md)
- Contract: [storage.md](../../../agents/contracts/storage.md)
