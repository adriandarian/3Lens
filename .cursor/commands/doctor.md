---
name: doctor
description: Run 3Lens diagnostics to check environment and tooling
---

# /doctor

Run diagnostics to check environment, capabilities, and tooling health.

## Usage

```
/doctor [category]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| category | (all) | Specific diagnostic category |

## Categories

- `discovery` - Context auto-detection
- `host` - Host attachment status
- `storage` - Buffer/trace storage health
- `csp` - CSP constraint detection

## Examples

```bash
# Full diagnostic
3lens doctor

# Specific category
3lens doctor discovery
3lens doctor csp

# Export report
3lens doctor --json > report.json
```

## Report Contents

- **Environment**: three.js version, backend, CSP
- **Capabilities**: Feature availability
- **Hooks**: Instrumentation status
- **Storage**: Buffer and trace health
- **Recommendations**: Actionable suggestions

## Common Issues

### Context not found
```bash
3lens doctor discovery
```
- Ensure three.js loads before 3Lens
- Check renderer is attached to DOM

### CSP blocking
```bash
3lens doctor csp
```
- Enable CSP-safe mode
- See agents/contracts/security-csp.md

## See Also

- Skill: doctor-operations
- Contract: agents/contracts/compatibility.md
