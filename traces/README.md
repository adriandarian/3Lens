# Baseline Traces

This directory contains baseline trace files for regression testing.

## Purpose

Baseline traces are used to:
- Validate trace format compatibility
- Test trace replay functionality
- Detect regressions in trace capture/export
- Provide examples for trace analysis

## Structure

```
traces/
├── README.md (this file)
├── minimal/          # Minimal traces (MINIMAL export profile)
├── standard/        # Standard traces (STANDARD export profile)
└── full/            # Full traces (FULL export profile)
```

## Adding Baseline Traces

When adding a new baseline trace:

1. Record the trace using `3lens trace:record`
2. Place it in the appropriate subdirectory based on export profile
3. Name it descriptively: `{feature}-{scenario}-{date}.json`
4. Document what it tests in this README

## Usage in Tests

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const tracePath = join(__dirname, '../traces/standard/basic-scene.json');
const trace = JSON.parse(readFileSync(tracePath, 'utf-8'));
```

## Maintenance

- Keep traces small and focused
- Remove outdated traces when contracts change
- Update this README when adding new traces
