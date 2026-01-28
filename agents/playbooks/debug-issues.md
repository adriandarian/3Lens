# Playbook: Debug Issues

This playbook describes how to debug issues in 3Lens using diagnostic tools, traces, and validation.

## Prerequisites

- [ ] Understand the issue (symptoms, when it occurs, steps to reproduce)
- [ ] Have access to diagnostic tools
- [ ] Know how to record traces (if needed)

## Steps

### 1. Run Diagnostics

Start with the doctor command:

```bash
3lens doctor
```

This checks:
- Environment setup
- Capability detection
- Hooks status
- Storage health
- CSP compliance

Review the output for:
- Missing capabilities
- Hook failures
- Storage issues
- CSP blocking

### 2. Check Specific Categories

If doctor shows issues, check specific categories:

```bash
# Check discovery
3lens doctor discovery

# Check host
3lens doctor host

# Check storage
3lens doctor storage

# Check CSP
3lens doctor csp
```

### 3. Validate Contracts

Check if the issue is a contract violation:

```bash
# Validate all contracts
3lens validate contracts

# Validate specific contract
3lens validate inspector
3lens validate capture
3lens validate entity-graph
```

### 4. Record a Trace

If the issue is reproducible, record a trace:

```bash
# Record trace
3lens trace:record --duration 10s --out debug-trace.json

# Or record until idle
3lens trace:record --until-idle --out debug-trace.json
```

### 5. Analyze the Trace

Open and analyze the trace:

```bash
# Open trace
3lens trace:open debug-trace.json

# Find hotspots
3lens query top_hotspots --trace debug-trace.json --metric gpu_time

# Check for leaks
3lens query leaks --trace debug-trace.json

# Inspect specific entities
3lens inspect mesh:main:myMesh --trace debug-trace.json --include cost,dependencies
```

### 6. Compare with Baseline

If you have a baseline trace, compare:

```bash
# Compare traces
3lens diff baseline.json debug-trace.json --report comparison.json

# Check for regressions
3lens diff baseline.json debug-trace.json --fail-on-regression
```

### 7. Check Entity Graph

Inspect the entity graph:

```bash
# Inspect entity
3lens inspect <entityId> --include all

# Check dependencies
3lens inspect <entityId> --include dependencies

# Check cost attribution
3lens inspect <entityId> --include cost
```

### 8. Review Code

If the issue is in code:

1. Use code-reviewer agent to check for:
   - Contract violations
   - Dependency rule violations
   - Missing fidelity/attribution

2. Check relevant contracts:
   - Read applicable contract files
   - Verify compliance

3. Check PR checklist:
   - Review `agents/checklists/pr.md`
   - Ensure all items are addressed

### 9. Check Logs

Review console logs and error messages:

- Look for CSP warnings
- Check for hook failures
- Review fidelity degradation messages
- Check for contract violations

### 10. Isolate the Issue

Narrow down the issue:

1. **Reproduce consistently**
   - Create minimal reproduction
   - Isolate to specific feature/component

2. **Check dependencies**
   - Verify all dependencies are installed
   - Check version compatibility

3. **Test in isolation**
   - Test component/feature independently
   - Check if issue occurs in all environments

## Common Issues and Solutions

### Issue: 3Lens not capturing events

**Diagnosis:**
```bash
3lens doctor host
```

**Solutions:**
- Check if host is properly attached
- Verify context registration
- Check hook implementation
- Review capture mode settings

### Issue: Missing fidelity/attribution

**Diagnosis:**
```bash
3lens validate fidelity
3lens validate attribution
```

**Solutions:**
- Ensure all metrics include fidelity
- Add attribution paths to metrics
- Check query implementations

### Issue: Performance regression

**Diagnosis:**
```bash
3lens trace:record --out current.json
3lens diff baseline.json current.json
```

**Solutions:**
- Identify hotspots: `3lens query top_hotspots`
- Check attribution paths
- Review optimization opportunities

### Issue: CSP blocking

**Diagnosis:**
```bash
3lens doctor csp
```

**Solutions:**
- Review CSP settings
- Use CSP-safe mode
- Check security-csp contract

### Issue: Trace won't load

**Diagnosis:**
```bash
3lens trace:open trace.json --verbose
```

**Solutions:**
- Check trace version compatibility
- Verify trace format
- Check for corruption

## Checklist

When debugging:

- [ ] Ran doctor diagnostics
- [ ] Validated contracts
- [ ] Recorded trace (if reproducible)
- [ ] Analyzed trace data
- [ ] Compared with baseline (if available)
- [ ] Inspected relevant entities
- [ ] Reviewed code for violations
- [ ] Checked logs and errors
- [ ] Isolated the issue
- [ ] Documented the solution

## See Also

- Skill: doctor-operations
- Skill: trace-operations
- Skill: inspector-operations
- Skill: query-operations
- Command: doctor
- Command: validate-contracts
- Contract: agents/contracts/overhead.md