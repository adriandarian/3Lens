---
name: trace-record
description: Record a 3Lens trace for debugging or baseline comparison
---

# /trace-record

Record a trace capture for debugging, performance analysis, or baseline comparison.

## Usage

```
/trace-record [duration] [output]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| duration | 10s | Recording duration (e.g., 5s, 30s, 1m) |
| output | ./traces/capture.json | Output file path |

## Examples

```bash
# Record 10 second trace
3lens trace:record --duration 10s --out ./traces/baseline.json

# Record 300 frames
3lens trace:record --frames 300 --out ./traces/capture.json

# Record until idle
3lens trace:record --until-idle --out ./traces/stable.json
```

## Options

- `--mode MINIMAL|STANDARD|DEEP` - Capture detail level
- `--contexts <ids>` - Specific contexts to record

## See Also

- Skill: trace-operations
- Contract: agents/contracts/capture.md
