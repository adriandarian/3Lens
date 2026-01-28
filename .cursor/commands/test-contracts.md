---
name: test-contracts
description: Run contract compliance tests
---

# /test-contracts

Run contract compliance tests to validate that implementations satisfy contract requirements.

## Usage

```
/test-contracts [options]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| --contract | all | Specific contract to test (capture, entity-graph, inspector, all) |
| --coverage | false | Show test coverage report |
| --verbose | false | Show detailed test output |
| --watch | false | Watch mode for development |

## Examples

```bash
# Run all contract tests
3lens test contracts

# Test specific contract
3lens test contracts --contract inspector

# Show coverage
3lens test contracts --coverage

# Verbose output
3lens test contracts --verbose

# Watch mode
3lens test contracts --watch
```

## Test Structure

Contract tests are located in `tests/contracts/`:

```
tests/contracts/
├── capture.test.ts
├── entity-graph.test.ts
├── inspector.test.ts
├── fidelity.test.ts
├── attribution.test.ts
└── ...
```

## Output Format

```json
{
  "summary": {
    "total": 45,
    "passed": 42,
    "failed": 2,
    "skipped": 1
  },
  "contracts": [
    {
      "name": "capture",
      "status": "PASS",
      "tests": 12,
      "passed": 12,
      "failed": 0
    },
    {
      "name": "inspector",
      "status": "FAIL",
      "tests": 8,
      "passed": 6,
      "failed": 2,
      "failures": [
        {
          "test": "answers all 5 questions",
          "error": "Missing cost attribution"
        }
      ]
    }
  ],
  "coverage": {
    "capture": "100%",
    "entity-graph": "95%",
    "inspector": "75%"
  }
}
```

## CI Integration

Use in CI workflows:

```yaml
# .github/workflows/ci.yml
- name: Test contracts
  run: 3lens test contracts
```

## See Also

- Skill: validation-operations
- Subagent: contract-validator
- Playbook: agents/playbooks/write-tests.md
- Contracts: agents/contracts/