---
name: validation-operations
description: Validate 3Lens contracts and run regression tests. Use when checking contract compliance, validating attribution coverage, or running CI validation checks.
---

# Validation Operations

Validation operations ensure code changes comply with 3Lens contracts and don't introduce regressions.

## When to Use

- Before submitting a PR
- Running CI checks
- Validating attribution coverage
- Ensuring contract compliance

## Commands

### Validate Specific Contract

```bash
# Validate Inspector contract
3lens validate inspector

# Validate Capture contract
3lens validate capture

# Validate Entity Graph contract
3lens validate entity-graph

# Validate Attribution contract
3lens validate attribution

# Validate Fidelity contract
3lens validate fidelity

# Validate Overhead contract
3lens validate overhead
```

### Validate All Contracts

```bash
# Run all contract validations
3lens validate all

# Verbose output
3lens validate all --verbose
```

### Validate Attribution Coverage

```bash
# Ensure all metrics have culprit paths
3lens validate attribution
```

Fails if any metrics exist without a clickable path to culprit entities.

## Available Contracts

| Contract | Purpose |
|----------|---------|
| `inspector` | The 5 Inspector questions |
| `capture` | Event schema, render events |
| `entity-graph` | Stable namespaced IDs, typed nodes/edges |
| `attribution` | Weighted blame chains |
| `fidelity` | EXACT/ESTIMATED/UNAVAILABLE |
| `overhead` | Capture modes, performance budget |
| `shader-graph` | Runtime introspection |

## CI Integration

Add validation to your CI workflow:

```yaml
# .github/workflows/ci.yml
- name: Validate Contracts
  run: pnpm 3lens validate all
```

## Validation Output

```typescript
{
  contract: string,
  passed: boolean,
  checks: {
    name: string,
    passed: boolean,
    message?: string
  }[],
  summary: {
    total: number,
    passed: number,
    failed: number
  }
}
```

## Agent Use Cases

1. **Pre-PR check**: "Validate all contracts before I submit this PR"
2. **Specific contract**: "Check if my changes comply with the attribution contract"
3. **CI setup**: "Add contract validation to the CI workflow"
4. **Coverage check**: "Ensure all metrics have attribution paths"

## Contract Locations

Contracts are defined in `agents/contracts/`:

- `inspector.md` - Inspector contract
- `capture.md` - Capture contract
- `entity-graph.md` - Entity graph contract
- `attribution.md` - Attribution contract
- `fidelity.md` - Fidelity contract
- `overhead.md` - Overhead contract
- `shader-graph.md` - Shader graph contract

## Additional Resources

- For detailed command syntax, see [skills.md](../../../skills.md)
- For PR checklist, see [agents/checklists/pr.md](../../../agents/checklists/pr.md)
- Command: [validate-contracts](../../../commands/validate-contracts.md)
- Command: [test-contracts](../../../commands/test-contracts.md)
- Agent: [contract-validator](../../../agents/contract-validator.md)
- Agent: [test-generator](../../../agents/test-generator.md)
- Playbook: [write-tests](../../../agents/playbooks/write-tests.md)
- Skill: [testing-operations](../testing-operations/SKILL.md)
