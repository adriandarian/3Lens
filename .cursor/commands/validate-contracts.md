---
name: validate-contracts
description: Validate code against 3Lens contracts
---

# /validate-contracts

Run contract validation to ensure code compliance.

## Usage

```
/validate-contracts [contract]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| contract | all | Contract to validate (or "all") |

## Available Contracts

- `inspector` - The 5 Inspector questions
- `capture` - Event schema, render events
- `entity-graph` - Stable IDs, typed nodes
- `attribution` - Blame chains
- `fidelity` - EXACT/ESTIMATED/UNAVAILABLE
- `overhead` - Performance budget
- `all` - Run all contract validations

## Examples

```bash
# Validate all contracts
3lens validate all

# Validate specific contract
3lens validate inspector

# Verbose output
3lens validate all --verbose
```

## CI Integration

```yaml
- name: Validate Contracts
  run: pnpm 3lens validate all
```

## See Also

- Skill: validation-operations
- Subagent: contract-validator
- Contracts: agents/contracts/
