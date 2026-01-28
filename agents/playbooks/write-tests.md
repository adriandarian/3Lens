# Playbook: Write Tests

This playbook describes how to write contract compliance tests, regression tests, and other tests for 3Lens.

## Prerequisites

- [ ] Understand the contract/feature being tested
- [ ] Know test patterns and conventions
- [ ] Familiar with test file structure
- [ ] Understand fidelity and attribution requirements

## Steps

### 1. Determine Test Type

Choose the appropriate test type:

- **Contract Tests**: Validate contract invariants
- **Regression Tests**: Detect regressions from traces
- **Unit Tests**: Test individual functions/components
- **Integration Tests**: Test component interactions
- **Snapshot Tests**: Test stable outputs

### 2. Use Test Generator

For contract tests, use the test-generator agent:

```bash
# Generate contract tests
# Use test-generator agent to create test structure
```

### 3. Create Test File

Create test file in appropriate location:

```typescript
// Contract test
// tests/contracts/inspector.test.ts

// Regression test
// tests/regression/baseline.test.ts

// Unit test
// packages/kernel/src/queries/my-query/my-query.test.ts
```

### 4. Write Contract Tests

Test contract invariants:

```typescript
// tests/contracts/inspector.test.ts
import { describe, it, expect } from 'vitest';
import { createLens } from '@3lens/runtime';

describe('Inspector Contract', () => {
  describe('Invariant: Answers 5 questions', () => {
    it('answers "What is this?" for any entity', async () => {
      const lens = createLens();
      const entityId = 'mesh:main:myMesh';
      
      const info = await lens.inspect(entityId, { include: ['info'] });
      expect(info).toBeDefined();
      expect(info.type).toBe('mesh');
    });
    
    it('answers "Dependencies?" for any entity', async () => {
      const lens = createLens();
      const entityId = 'mesh:main:myMesh';
      
      const deps = await lens.inspect(entityId, { include: ['dependencies'] });
      expect(deps.dependencies).toBeArray();
    });
    
    // ... test other questions
  });
  
  describe('Degradation: Missing data', () => {
    it('handles missing entity gracefully', async () => {
      const lens = createLens();
      const entityId = 'mesh:main:nonexistent';
      
      const result = await lens.inspect(entityId, { include: ['info'] });
      expect(result.fidelity).toBe('UNAVAILABLE');
    });
  });
});
```

### 5. Write Fidelity Tests

Test fidelity labeling:

```typescript
it('labels fidelity for all metrics', async () => {
  const result = await client.query('top_hotspots');
  
  result.items.forEach(item => {
    expect(item).toHaveProperty('fidelity');
    expect(['EXACT', 'ESTIMATED', 'UNAVAILABLE']).toContain(item.fidelity);
  });
});
```

### 6. Write Attribution Tests

Test attribution paths:

```typescript
it('provides attribution path for metrics', async () => {
  const metric = await client.query('top_hotspots');
  
  expect(metric.attribution).toBeArray();
  expect(metric.attribution.length).toBeGreaterThan(0);
  expect(metric.attribution[0]).toHaveProperty('entityId');
  expect(metric.attribution[0]).toHaveProperty('weight');
  expect(metric.attribution[0].weight).toBeGreaterThan(0);
  expect(metric.attribution[0].weight).toBeLessThanOrEqual(1);
});
```

### 7. Write Live/Offline Parity Tests

Test both modes:

```typescript
describe('Live and Offline Parity', () => {
  it('works in live mode', async () => {
    const lens = createLens();
    const result = await lens.queryLive('top_hotspots', { window: 60 });
    
    expect(result).toBeDefined();
    expect(result.items).toBeArray();
  });
  
  it('works with offline traces', async () => {
    const trace = await loadTrace('./traces/test.json');
    const result = await trace.query('top_hotspots', { window: 60 });
    
    expect(result).toBeDefined();
    expect(result.items).toBeArray();
  });
  
  it('produces consistent results', async () => {
    // Record trace from live
    const liveResult = await lens.queryLive('top_hotspots', { window: 60 });
    const trace = await lens.recordTrace();
    
    // Query trace
    const traceResult = await trace.query('top_hotspots', { window: 60 });
    
    // Compare results
    expect(traceResult.items.length).toBe(liveResult.items.length);
  });
});
```

### 8. Write Regression Tests

Test for regressions:

```typescript
// tests/regression/baseline.test.ts
import { describe, it, expect } from 'vitest';
import { loadTrace } from '@3lens/kernel';

describe('Regression: Baseline Performance', () => {
  it('maintains frame time budget', async () => {
    const trace = await loadTrace('./traces/baseline.json');
    const frames = trace.getFrames();
    
    const avgFrameTime = frames.reduce((sum, f) => sum + f.duration, 0) / frames.length;
    expect(avgFrameTime).toBeLessThan(16.67); // 60fps budget
  });
  
  it('maintains memory budget', async () => {
    const trace = await loadTrace('./traces/baseline.json');
    const peakMemory = trace.getPeakMemory();
    
    expect(peakMemory).toBeLessThan(100 * 1024 * 1024); // 100MB budget
  });
});
```

### 9. Use Test Utilities

Use test utilities for mocking:

```typescript
import { createMockEntityGraph } from '@3lens/kernel/testing';
import { createMockTrace } from '@3lens/kernel/testing';

const graph = createMockEntityGraph({
  entities: [
    { id: 'mesh:main:myMesh', type: 'mesh' }
  ],
  edges: [
    { from: 'mesh:main:myMesh', to: 'material:main:myMat', type: 'uses' }
  ]
});

const trace = createMockTrace({
  frames: 120,
  contexts: ['main'],
  events: [/* event list */]
});
```

### 10. Run Tests

Run tests and check coverage:

```bash
# Run all tests
pnpm test

# Run contract tests
3lens test contracts

# Check coverage
3lens test contracts --coverage
```

## Test Requirements

Every test MUST:

1. **Validate Contract Invariants**
   - Test all contract requirements
   - Include degradation scenarios

2. **Include Fidelity Checks**
   - Verify fidelity labeling
   - Test fidelity propagation

3. **Include Attribution Checks**
   - Verify attribution paths
   - Test attribution weights

4. **Test Live/Offline Parity**
   - Test both modes
   - Verify consistent results

## Checklist

Before submitting tests:

- [ ] Tests validate contract invariants
- [ ] Fidelity checks included
- [ ] Attribution checks included
- [ ] Live/offline parity tested
- [ ] Degradation scenarios tested
- [ ] Test names are descriptive
- [ ] Tests use proper mocking
- [ ] Coverage meets requirements
- [ ] Tests pass consistently

## Anti-patterns to Avoid

- ❌ Tests without fidelity checks
- ❌ Tests without attribution checks
- ❌ Tests that only work in live mode
- ❌ Vague test names
- ❌ Tests that depend on external state
- ❌ Missing degradation scenario tests

## See Also

- Skill: testing-operations
- Rule: .cursor/rules/test-standards.mdc
- Command: test-contracts
- Agent: test-generator
- Contract: agents/contracts/testing.md (if exists)