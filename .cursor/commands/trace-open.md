---
name: trace-open
description: Open a saved 3Lens trace for analysis
---

# /trace-open

Open a saved trace file for viewing or analysis.

## Usage

```
/trace-open [file]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| file | (required) | Path to trace file |

## Examples

```bash
# Open in viewer UI
3lens trace:open ./traces/capture.json

# Open for headless analysis
3lens trace:open ./traces/capture.json --headless
```

## Options

- `--headless` - Open for programmatic analysis without UI

## See Also

- Skill: trace-operations
- Command: /trace-record
