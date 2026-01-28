# Playbook: Add a Query

This playbook describes how to add a new query to the 3Lens kernel query engine.

## Prerequisites

- [ ] Understand what entities the query will operate on
- [ ] Define query parameters and result structure
- [ ] Ensure the query can work with both live and offline traces
- [ ] Plan attribution paths for any metrics returned

## Steps

### 1. Define the Query Purpose

Answer these questions:
- What question does this query answer?
- What entities does it operate on?
- What parameters does it accept?
- What results does it return?
- What metrics does it produce (if any)?

### 2. Scaffold the Query

Use the scaffold command:

```bash
3lens scaffold query my_query
```

This generates:
- Query source file
- Type definitions
- Test file template
- README

### 3. Implement Query Parameters

Define query-specific parameters:

```typescript
// packages/kernel/src/queries/my-query/my-query.ts
import { Query, QueryParams, QueryResult } from '../../types';
import { EntityGraph } from '../../graph';

export interface MyQueryParams extends QueryParams {
  // Add query-specific parameters
  type?: string;
  threshold?: number;
}

export interface MyQueryResult extends QueryResult {
  items: Array<{
    entityId: string;
    // Add result fields
    value: number;
  }>;
  fidelity: 'EXACT' | 'ESTIMATED' | 'UNAVAILABLE';
}
```

### 4. Implement Query Logic

Implement the query execution:

```typescript
export const myQuery: Query = {
  name: 'my_query',
  
  execute(graph: EntityGraph, params: MyQueryParams): MyQueryResult {
    // Query implementation
    const items: MyQueryResult['items'] = [];
    
    // Traverse entity graph
    graph.forEachNode((node) => {
      // Query logic
      if (matchesCriteria(node, params)) {
        items.push({
          entityId: node.id,
          value: calculateValue(node)
        });
      }
    });
    
    return {
      items,
      fidelity: 'EXACT'
    };
  }
};
```

### 5. Add Attribution Paths

If the query returns metrics, include attribution:

```typescript
return {
  items: items.map(item => ({
    ...item,
    attribution: [
      { entityId: item.entityId, weight: 1.0 }
    ]
  })),
  fidelity: 'EXACT'
};
```

### 6. Handle Fidelity

Determine fidelity based on available data:

```typescript
// EXACT: All data available
if (hasAllData) {
  return { items, fidelity: 'EXACT' };
}

// ESTIMATED: Partial data available
if (hasPartialData) {
  return { items, fidelity: 'ESTIMATED' };
}

// UNAVAILABLE: No data available
return { items: [], fidelity: 'UNAVAILABLE' };
```

### 7. Register the Query

Register in the query registry:

```typescript
// packages/kernel/src/queries/index.ts
import { myQuery } from './my-query';

export const queries = {
  // ... existing queries
  my_query: myQuery
};
```

### 8. Add Tests

Create contract tests:

```typescript
// packages/kernel/src/queries/my-query/my-query.test.ts
import { describe, it, expect } from 'vitest';
import { myQuery } from './my-query';
import { createMockEntityGraph } from '../../testing';

describe('My Query', () => {
  it('returns results with fidelity', () => {
    const graph = createMockEntityGraph();
    const result = myQuery.execute(graph, {});
    
    expect(result).toHaveProperty('fidelity');
    expect(['EXACT', 'ESTIMATED', 'UNAVAILABLE']).toContain(result.fidelity);
  });
  
  it('includes attribution for metrics', () => {
    const graph = createMockEntityGraph();
    const result = myQuery.execute(graph, {});
    
    result.items.forEach(item => {
      if (item.value !== undefined) {
        expect(item).toHaveProperty('attribution');
      }
    });
  });
});
```

### 9. Document the Query

Add command documentation:

```markdown
# /query-my-query

Query description.

## Usage
3lens query my_query [options]

## Parameters
- --type: Filter by type
- --threshold: Minimum threshold

## Examples
3lens query my_query --type texture
```

### 10. Support Live and Offline Modes

Ensure the query works in both modes:

```typescript
// Runtime handles mode switching
// Query implementation should work with both:
// - Live entity graph (from capture)
// - Offline entity graph (from trace)
```

## Checklist

Before submitting:

- [ ] Query answers a clear question
- [ ] Parameters are well-defined
- [ ] Results include fidelity labeling
- [ ] Metrics include attribution paths
- [ ] Works with both live and offline traces
- [ ] Has contract tests
- [ ] Documented in command docs
- [ ] Registered in query registry

## Anti-patterns to Avoid

- ❌ Queries that only work in live mode
- ❌ Metrics without attribution paths
- ❌ Results without fidelity labeling
- ❌ Queries that break when entities are missing
- ❌ Hardcoded entity types instead of parameters

## See Also

- Skill: query-operations
- Command: scaffold-query
- Contract: agents/contracts/fidelity.md
- Contract: agents/contracts/attribution.md