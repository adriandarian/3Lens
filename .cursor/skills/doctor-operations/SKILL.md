---
name: doctor-operations
description: Diagnose 3Lens project and tooling issues including environment checks, capability detection, and health reports. Use when troubleshooting setup problems, checking compatibility, or generating diagnostic reports.
---

# Doctor Operations

Doctor operations diagnose project and tooling issues, providing actionable recommendations.

## When to Use

- Troubleshooting setup problems
- Checking three.js/WebGL/WebGPU compatibility
- Verifying hook and storage health
- Generating diagnostic reports for support

## Commands

### Full Diagnostic

```bash
3lens doctor
```

**Reports:**

- **Environment**: three.js version, backend (WebGL/WebGPU), CSP status
- **Capability matrix**: Available features and their status
- **Hook status**: Instrumentation hook health
- **Storage health**: Buffer and trace storage status
- **Recommendations**: Actionable suggestions

### Specific Diagnostics

```bash
# Context discovery status
3lens doctor discovery

# Host attachment status
3lens doctor host

# Buffer/trace storage health
3lens doctor storage

# CSP constraint detection
3lens doctor csp
```

### Export Doctor Report

```bash
# Export as JSON to stdout
3lens doctor --json > doctor-report.json

# Export to a specific file
3lens doctor --export ./diagnostics.json
```

## Diagnostic Categories

| Category | Checks |
|----------|--------|
| `discovery` | Context auto-detection, renderer discovery |
| `host` | Host attachment, lifecycle hooks |
| `storage` | Ring buffer, compression, export |
| `csp` | Content Security Policy constraints |

## Report Format

```typescript
{
  timestamp: string,
  environment: {
    threejs_version: string,
    backend: 'webgl' | 'webgl2' | 'webgpu',
    csp_enabled: boolean
  },
  capabilities: {
    [capability: string]: {
      available: boolean,
      reason?: string
    }
  },
  hooks: {
    [hook: string]: {
      status: 'ok' | 'warn' | 'error',
      message?: string
    }
  },
  storage: {
    ring_buffer: { status: string, size: number },
    compression: { enabled: boolean },
    traces: { count: number, total_size: number }
  },
  recommendations: string[]
}
```

## Agent Use Cases

1. **Setup troubleshooting**: "Run doctor to see why 3Lens isn't attaching"
2. **Compatibility check**: "Check if WebGPU features are available"
3. **Support ticket**: "Export a diagnostic report for the support team"
4. **CI health check**: "Verify storage and hooks are healthy in CI"

## Common Issues and Solutions

### Context Discovery Failed

```bash
3lens doctor discovery
```

- Check if three.js is loaded before 3Lens
- Verify renderer is created and attached to DOM

### CSP Blocking Features

```bash
3lens doctor csp
```

- Enable CSP-safe mode: `createLens({ cspSafe: true })`
- See [agents/contracts/security-csp.md](../../../agents/contracts/security-csp.md)

### Storage Issues

```bash
3lens doctor storage
```

- Check browser storage quota
- Clear old traces if storage is full

## Additional Resources

- For detailed command syntax, see [skills.md](../../../skills.md)
- For compatibility contract, see [agents/contracts/compatibility.md](../../../agents/contracts/compatibility.md)
- For CSP handling, see [agents/contracts/security-csp.md](../../../agents/contracts/security-csp.md)
