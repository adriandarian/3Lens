---
name: scaffold-query
description: Generate boilerplate for a new query
---

# /scaffold-query

Generate boilerplate code for a new query in the kernel query engine.

## Usage

```
/scaffold-query [name]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| name | (required) | Query name (snake_case) |

## Examples

```bash
# Create a new query
3lens scaffold query top_memory_consumers

# Create query with parameters
3lens scaffold query resource_by_size
```

## Generated Files

```
packages/kernel/src/queries/
└── [name]/
    ├── index.ts
    ├── [name].ts
    ├── [name].test.ts
    └── README.md
```

## Generated Structure

```typescript
// packages/kernel/src/queries/[name]/[name].ts
import { Query, QueryParams, QueryResult } from '../../types';
import { EntityGraph } from '../../graph';

export interface [Name]QueryParams extends QueryParams {
  // Add query-specific parameters
}

export interface [Name]QueryResult extends QueryResult {
  // Add query-specific result structure
  items: Array<{
    entityId: string;
    // Add result fields
  }>;
  fidelity: 'EXACT' | 'ESTIMATED' | 'UNAVAILABLE';
}

export const [name]Query: Query = {
  name: '[name]',
  
  execute(graph: EntityGraph, params: [Name]QueryParams): [Name]QueryResult {
    // Query implementation
    return {
      items: [],
      fidelity: 'EXACT'
    };
  }
};
```

## Requirements

Every query must:
- Accept `QueryParams` with window/fidelity options
- Return `QueryResult` with fidelity labeling
- Include attribution paths for metrics
- Support both live and offline trace modes
- Have contract tests

## Next Steps

After scaffolding, follow the playbook:
- `agents/playbooks/add-a-query.md`

## See Also

- Skill: scaffold-operations
- Playbook: agents/playbooks/add-a-query.md
- Contract: agents/contracts/fidelity.md