# Playbook: Add a Panel

This playbook describes how to add a new UI panel to 3Lens.

## Prerequisites

- [ ] Understand which contracts this panel touches
- [ ] Define what entities the panel displays
- [ ] Define what queries the panel uses
- [ ] Ensure the underlying data exists in the kernel

## Steps

### 1. Define the Panel's Purpose

Answer these questions:
- What question does this panel answer?
- What entities does it display?
- How does it connect to Inspector selection?
- What actions can users take from this panel?

### 2. Create the Panel in UI Core

```typescript
// packages/ui-core/src/panels/my-panel.ts
import { Panel, PanelConfig } from '../types';
import { LensClient } from '@3lens/runtime';

export interface MyPanelConfig extends PanelConfig {
  // Panel-specific config
}

export function createMyPanel(client: LensClient, config: MyPanelConfig): Panel {
  return {
    id: 'my-panel',
    name: 'My Panel',
    
    render(container: HTMLElement) {
      // Render panel UI
    },
    
    onSelectionChange(selection: Selection) {
      // React to selection changes
    },
    
    dispose() {
      // Cleanup
    }
  };
}
```

### 3. Register Queries

If the panel needs new queries, add them to the kernel:

```typescript
// packages/kernel/src/queries/my-query.ts
import { Query, QueryResult } from '../types';

export const myQuery: Query = {
  name: 'my_query',
  
  execute(graph: EntityGraph, params: QueryParams): QueryResult {
    // Query implementation
  }
};
```

### 4. Connect to Inspector

The panel MUST route through Inspector selection:

```typescript
// When user clicks something in your panel
client.select(entityId, { source: 'my-panel' });

// When selection changes from elsewhere
onSelectionChange(selection) {
  this.highlightEntities(selection.entity_ids);
}
```

### 5. Add Fidelity Indicators

Every metric displayed MUST show fidelity:

```typescript
function renderMetric(value: number, fidelity: Fidelity) {
  return `
    <span class="metric">
      ${value}
      <span class="fidelity-badge fidelity-${fidelity.level}">
        ${fidelity.level}
      </span>
    </span>
  `;
}
```

### 6. Support Offline Traces

The panel MUST work with saved traces:

```typescript
// Don't assume live data
const data = client.isLive 
  ? await client.queryLive(myQuery, params)
  : await client.queryTrace(myQuery, params);
```

### 7. Add Tests

Create contract tests:

```typescript
// tests/contracts/my-panel.test.ts
describe('My Panel Contract', () => {
  it('displays fidelity for all metrics', () => {
    // Test implementation
  });
  
  it('routes selection through Inspector', () => {
    // Test implementation
  });
  
  it('works with offline traces', () => {
    // Test implementation
  });
});
```

## Checklist

Before submitting:

- [ ] Panel answers a clear question
- [ ] All metrics show fidelity badges
- [ ] Selection routes through Inspector
- [ ] Works with offline traces
- [ ] Has contract tests
- [ ] No framework-specific code in panel
- [ ] Documented in README

## Anti-patterns to Avoid

- ❌ Panels that show metrics without attribution paths
- ❌ Panels that only work in live mode
- ❌ Hardcoded queries without kernel registration
- ❌ Direct JS object access instead of entity IDs
- ❌ Missing fidelity indicators
