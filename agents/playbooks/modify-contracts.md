# Playbook: Modify Contracts

This playbook describes how to modify contracts while maintaining compatibility and versioning.

## Prerequisites

- [ ] Understand the contract you're modifying
- [ ] Know the difference between breaking and non-breaking changes
- [ ] Understand versioning strategy
- [ ] Have reviewed all contract consumers

## Steps

### 1. Determine Change Type

Classify your change:

- **Non-breaking (Patch/Minor)**:
  - Adding optional fields
  - Clarifying documentation
  - Adding new optional capabilities
  - Extending enums (backward compatible)

- **Breaking (Major)**:
  - Removing fields
  - Changing field types
  - Making optional fields required
  - Changing behavior semantics
  - Removing capabilities

### 2. Review Contract Consumers

Identify all consumers of the contract:

```bash
# Search for contract references
grep -r "contracts/[contract-name]" packages/
grep -r "contracts/[contract-name]" tests/
```

Check:
- Kernel implementations
- Runtime implementations
- Host implementations
- Addon implementations
- Tests
- Documentation

### 3. Plan Migration Path

For breaking changes, plan migration:

1. **Deprecation Period**
   - Mark old fields/methods as deprecated
   - Add new fields/methods
   - Support both during transition

2. **Migration Guide**
   - Document breaking changes
   - Provide migration steps
   - Include code examples

3. **Version Bump**
   - Update contract version
   - Update trace version (if applicable)
   - Update API version (if applicable)

### 4. Update Contract File

Modify the contract file:

```markdown
# Contract: [Name]

## Version History

### v2.0.0 (Breaking)
- Changed: [description]
- Migration: [steps]

### v1.1.0 (Non-breaking)
- Added: [description]

## Current Version: v2.0.0

## Invariants (MUST ALWAYS HOLD)
...
```

### 5. Update Implementation

Update implementations:

```typescript
// Support both old and new during transition
interface Metric {
  // Old (deprecated)
  value?: number;
  
  // New (required)
  value: number;
  fidelity: Fidelity;
}
```

### 6. Update Tests

Update contract tests:

```typescript
describe('Contract v2.0.0', () => {
  it('requires fidelity field', () => {
    // Test new requirement
  });
  
  it('maintains backward compatibility during transition', () => {
    // Test backward compatibility
  });
});
```

### 7. Update Documentation

Update all documentation:
- Contract file itself
- Related playbooks
- API documentation
- Migration guides

### 8. Update Version Numbers

Update version references:

```typescript
// packages/kernel/src/version.ts
export const CONTRACT_VERSION = '2.0.0';
export const TRACE_VERSION = '2.0.0';
```

### 9. Create Migration Guide

Document migration:

```markdown
# Migration Guide: Contract v1.0.0 → v2.0.0

## Breaking Changes

### Fidelity Now Required

**Before:**
```typescript
interface Metric {
  value: number;
  fidelity?: Fidelity; // Optional
}
```

**After:**
```typescript
interface Metric {
  value: number;
  fidelity: Fidelity; // Required
}
```

## Migration Steps

1. Update all metric definitions to include fidelity
2. Run validation: `3lens validate fidelity`
3. Update tests
4. Verify backward compatibility

## See Also
- Contract: agents/contracts/fidelity.md
```

### 10. Validate Changes

Run validation:

```bash
# Validate contract compliance
3lens validate contracts

# Run contract tests
3lens test contracts

# Check for regressions
3lens diff baseline.json current.json
```

## Versioning Strategy

### Semantic Versioning

- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: Non-breaking additions
- **Patch (0.0.X)**: Bug fixes, clarifications

### Trace Version Compatibility

Traces include version:

```json
{
  "metadata": {
    "trace_version": "2.0.0"
  }
}
```

Consumers must check compatibility:

```typescript
if (!isCompatible(traceVersion, '^2.0.0')) {
  throw new Error(`Trace version ${traceVersion} not compatible`);
}
```

## Checklist

Before submitting contract changes:

- [ ] Change type determined (breaking/non-breaking)
- [ ] All consumers reviewed
- [ ] Migration path planned (if breaking)
- [ ] Contract file updated with version history
- [ ] Implementations updated
- [ ] Tests updated
- [ ] Documentation updated
- [ ] Version numbers updated
- [ ] Migration guide created (if breaking)
- [ ] Validation passed
- [ ] Backward compatibility maintained (during transition)

## Anti-patterns to Avoid

- ❌ Making breaking changes without migration path
- ❌ Not updating version numbers
- ❌ Not documenting breaking changes
- ❌ Removing backward compatibility too quickly
- ❌ Not updating all consumers
- ❌ Not creating migration guide

## See Also

- Contract: agents/contracts/compatibility.md
- Skill: validation-operations
- Command: validate-contracts
- Agent: migration-assistant