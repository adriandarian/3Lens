# Contract Tests

This directory contains contract validation tests.

## Purpose

Contract tests validate that implementations satisfy the contracts defined in `agents/contracts/`. These tests ensure:

- System invariants are maintained
- Degradation rules are followed
- Acceptance criteria are met
- Anti-goals are avoided

## Structure

```
tests/contracts/
├── README.md (this file)
├── capture.test.ts          # Capture contract tests
├── entity-graph.test.ts     # Entity graph contract tests
├── attribution.test.ts     # Attribution contract tests
├── fidelity.test.ts        # Fidelity contract tests
├── inspector.test.ts        # Inspector contract tests
├── addons.test.ts          # Addons contract tests
├── transport.test.ts       # Transport contract tests
└── ...                     # Other contract tests
```

## Writing Contract Tests

Each contract test file should:

1. Import the contract definition
2. Test all invariants
3. Test degradation rules
4. Test acceptance criteria
5. Verify anti-goals are avoided

### Example

```typescript
import { describe, it, expect } from 'vitest';
import { createLens } from '@3lens/runtime';

describe('Inspector Contract', () => {
  it('should answer the five questions', () => {
    const lens = createLens();
    // Test implementation
  });

  it('should maintain global selection', () => {
    // Test selection invariants
  });
});
```

## Running Tests

```bash
# Run all contract tests
pnpm test contracts

# Run specific contract test
pnpm test contracts/inspector
```

## See Also

- [Contract Definitions](../../agents/contracts/)
- [Testing Playbook](../../agents/playbooks/write-tests.md)
- [Contract Validation Guide](../../docs/guides/TESTING.md)
