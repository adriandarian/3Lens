# Contract: Testing

## Purpose

Testing contract defines patterns for contract compliance tests, regression tests, and test framework integration for 3Lens.

## Invariants (MUST ALWAYS HOLD)

1. **Contract tests validate invariants:**
   - Every contract MUST have corresponding tests
   - Tests validate all contract invariants
   - Tests include degradation scenarios

2. **Tests include fidelity checks:**
   - All tests that produce metrics MUST verify fidelity
   - Fidelity propagation is tested
   - Fidelity degradation is tested

3. **Tests include attribution checks:**
   - All tests that produce metrics MUST verify attribution
   - Attribution paths are tested
   - Attribution weights are validated

4. **Tests support live and offline modes:**
   - Features MUST be tested in both modes
   - Test results are consistent across modes
   - Trace-based testing is supported

## Degradation Rules (ALLOWED BUT MUST BE EXPLICIT)

- If test environment lacks capabilities:
  - Mark test as skipped with reason
  - Document missing capabilities
  - Provide alternative test if possible

- If test data is incomplete:
  - Mark test as ESTIMATED
  - Include available test data
  - Document missing data

- If trace-based testing unavailable:
  - Mark trace tests as UNAVAILABLE
  - Provide live-only tests
  - Document limitation

## Test Types

### Contract Compliance Tests

```typescript
// tests/contracts/[contract-name].test.ts
describe('[Contract Name] Contract', () => {
  describe('Invariant: [Invariant Name]', () => {
    it('[test description]', () => {
      // Test invariant
    });
  });
  
  describe('Degradation: [Scenario]', () => {
    it('[test description]', () => {
      // Test degradation
    });
  });
});
```

### Regression Tests

```typescript
// tests/regression/[baseline-name].test.ts
describe('Regression: [Baseline Name]', () => {
  it('maintains [metric] budget', async () => {
    const trace = await loadTrace('./traces/baseline.json');
    // Test metric
  });
});
```

### Snapshot Tests

```typescript
// tests/snapshots/[component-name].test.ts
describe('[Component] Snapshots', () => {
  it('generates consistent output', () => {
    const output = generateOutput();
    expect(output).toMatchSnapshot();
  });
});
```

## Test Patterns

### Fidelity Testing

```typescript
it('labels fidelity for all metrics', async () => {
  const result = await client.query('top_hotspots');
  result.items.forEach(item => {
    expect(item).toHaveProperty('fidelity');
    expect(['EXACT', 'ESTIMATED', 'UNAVAILABLE']).toContain(item.fidelity);
  });
});
```

### Attribution Testing

```typescript
it('provides attribution path for metrics', async () => {
  const metric = await client.query('top_hotspots');
  expect(metric.attribution).toBeArray();
  expect(metric.attribution.length).toBeGreaterThan(0);
  expect(metric.attribution[0]).toHaveProperty('entityId');
  expect(metric.attribution[0]).toHaveProperty('weight');
});
```

### Live/Offline Parity Testing

```typescript
describe('Live and Offline Parity', () => {
  it('works in live mode', async () => {
    const lens = createLens();
    const result = await lens.queryLive('top_hotspots', { window: 60 });
    expect(result).toBeDefined();
  });
  
  it('works with offline traces', async () => {
    const trace = await loadTrace('./traces/test.json');
    const result = await trace.query('top_hotspots', { window: 60 });
    expect(result).toBeDefined();
  });
});
```

## Test Utilities

### Mock Entity Graph

```typescript
import { createMockEntityGraph } from '@3lens/kernel/testing';

const graph = createMockEntityGraph({
  entities: [
    { id: 'mesh:main:myMesh', type: 'mesh' }
  ],
  edges: [
    { from: 'mesh:main:myMesh', to: 'material:main:myMat', type: 'uses' }
  ]
});
```

### Mock Trace

```typescript
import { createMockTrace } from '@3lens/kernel/testing';

const trace = createMockTrace({
  frames: 120,
  contexts: ['main'],
  events: [/* event list */]
});
```

## CI/CD Integration

### Contract Validation

```yaml
# .github/workflows/ci.yml
- name: Test contracts
  run: 3lens test contracts

- name: Validate contracts
  run: 3lens validate contracts
```

### Regression Detection

```yaml
- name: Check for regressions
  run: |
    3lens trace:record --duration 10s --out current.json
    3lens diff baseline.json current.json --fail-on-regression
```

## Acceptance Tests (Definition of Done)

- **Contract coverage:**
  - All contracts have tests
  - Tests validate invariants
  - Tests include degradation scenarios

- **Fidelity coverage:**
  - All metrics tested for fidelity
  - Fidelity propagation tested
  - Fidelity degradation tested

- **Attribution coverage:**
  - All metrics tested for attribution
  - Attribution paths tested
  - Attribution weights validated

- **Mode coverage:**
  - Features tested in live mode
  - Features tested with offline traces
  - Results consistent across modes

## Anti-goals (MUST NOT DO)

- Tests without fidelity checks
- Tests without attribution checks
- Tests that only work in live mode
- Missing degradation scenario tests
- Not testing contract invariants
- Breaking tests when capabilities unavailable

## See Also

- Contract: agents/contracts/fidelity.md
- Contract: agents/contracts/attribution.md
- Skill: testing-operations
- Playbook: agents/playbooks/write-tests.md
- Rule: .cursor/rules/test-standards.mdc