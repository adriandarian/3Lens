---
name: cli-operations
description: Extended CLI usage patterns and advanced command workflows. Use when automating tasks, integrating CLI into workflows, or using advanced CLI features.
---

# CLI Operations

CLI operations cover advanced command-line usage patterns, automation, and integration workflows for 3Lens CLI.

## When to Use

- Automating trace analysis
- Integrating CLI into CI/CD
- Batch processing traces
- Advanced query workflows
- Scripting common tasks

## CLI Commands Overview

### Trace Operations

```bash
# Record trace
3lens trace:record --duration 10s --out trace.json

# Open trace
3lens trace:open trace.json

# Compare traces
3lens diff baseline.json current.json --report comparison.json
```

### Query Operations

```bash
# Find hotspots
3lens query top_hotspots --window 120f --metric gpu_time

# Detect leaks
3lens query leaks --threshold 300f

# Shader variants
3lens query shader_variants --shader shader:main:myShader

# Resource usage
3lens query resource_usage --type texture --sort size
```

### Validation Operations

```bash
# Validate contracts
3lens validate contracts

# Test contracts
3lens test contracts --coverage

# Run diagnostics
3lens doctor
```

### Scaffold Operations

```bash
# Scaffold components
3lens scaffold panel my-panel
3lens scaffold probe my-probe
3lens scaffold host my-framework
3lens scaffold addon my-addon
3lens scaffold query my_query
3lens scaffold mount react
```

## Automation Patterns

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run contract tests
        run: 3lens test contracts
      
      - name: Validate contracts
        run: 3lens validate contracts
      
      - name: Check for regressions
        run: |
          3lens trace:record --duration 10s --out current.json
          3lens diff baseline.json current.json --fail-on-regression
```

### Batch Processing

```bash
# Process multiple traces
for trace in traces/*.json; do
  echo "Processing $trace"
  3lens query top_hotspots --trace "$trace" --out "results/$(basename $trace).json"
done
```

### Performance Monitoring

```bash
# Continuous monitoring script
#!/bin/bash
while true; do
  timestamp=$(date +%Y%m%d_%H%M%S)
  3lens trace:record --duration 60s --out "monitoring/trace_$timestamp.json"
  3lens query top_hotspots --trace "monitoring/trace_$timestamp.json" >> "monitoring/hotspots_$timestamp.log"
  sleep 300  # Wait 5 minutes
done
```

## Advanced Usage

### Programmatic CLI Usage

```typescript
// Using CLI programmatically
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function analyzeTrace(tracePath: string) {
  const { stdout } = await execAsync(
    `3lens query top_hotspots --trace ${tracePath} --format json`
  );
  return JSON.parse(stdout);
}
```

### Custom Scripts

```bash
#!/bin/bash
# analyze-performance.sh

TRACE=$1
OUTPUT=$2

echo "Analyzing trace: $TRACE"

# Get hotspots
3lens query top_hotspots --trace "$TRACE" --metric gpu_time > "$OUTPUT/hotspots.json"

# Check for leaks
3lens query leaks --trace "$TRACE" > "$OUTPUT/leaks.json"

# Resource usage
3lens query resource_usage --trace "$TRACE" > "$OUTPUT/resources.json"

# Generate report
cat > "$OUTPUT/report.md" << EOF
# Performance Analysis Report

## Hotspots
\$(cat $OUTPUT/hotspots.json)

## Leaks
\$(cat $OUTPUT/leaks.json)

## Resources
\$(cat $OUTPUT/resources.json)
EOF
```

## Agent Use Cases

1. **CI/CD**: "Set up CI workflow with contract validation"
2. **Automation**: "Create script to analyze traces daily"
3. **Batch processing**: "Process all traces in a directory"
4. **Monitoring**: "Set up continuous performance monitoring"

## CLI Configuration

### Environment Variables

```bash
# Set default capture mode
export THREELENS_CAPTURE_MODE=STANDARD

# Set trace directory
export THREELENS_TRACE_DIR=./traces

# Enable verbose output
export THREELENS_VERBOSE=true
```

### Config File

```json
// .3lensrc.json
{
  "capture": {
    "mode": "STANDARD",
    "sampleRate": 1.0
  },
  "trace": {
    "directory": "./traces",
    "compression": "gzip"
  },
  "query": {
    "defaultWindow": 120,
    "defaultMetric": "gpu_time"
  }
}
```

## Additional Resources

- Commands: [.cursor/commands/](../../../commands/)
- Skills: [.cursor/skills/](../../../skills/)
- Project Guide: [agents.md](../../../agents.md)