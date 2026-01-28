---
title: Plugin API Reference
description: Stable API surface for creating third-party addons and plugins
---

# Plugin API Reference

This document describes the stable API surface for third-party addons.

## Overview

3Lens addons (plugins) are the extension mechanism for adding custom functionality.
Addons have access to a constrained API surface to ensure stability and forward compatibility.

## Addon Interface

```typescript
interface Addon {
  // Identity
  id: string;          // Unique ID (reverse-DNS style)
  version: string;     // Semver
  displayName: string;
  description: string;

  // Compatibility
  requires: {
    kernel: string;    // Kernel version range (e.g., "^1.0.0")
    trace?: string;    // Trace schema version range
  };

  // Capabilities
  capabilities: {
    required: string[];  // Must have to function
    optional: string[];  // Nice to have
  };

  // Lifecycle
  register(lens: Lens): void | Promise<void>;
  unregister?(lens: Lens): void;
}
```

## Creating an Addon

### Basic Structure

```typescript
import { defineAddon, type Lens } from '@3lens/runtime';

export const myAddon = defineAddon({
  id: 'com.mycompany.my-addon',
  version: '1.0.0',
  displayName: 'My Addon',
  description: 'Adds custom analysis to 3Lens',

  requires: {
    kernel: '^1.0.0',
  },

  capabilities: {
    required: ['capture.renderEvents'],
    optional: ['timing.gpu'],
  },

  register(lens: Lens) {
    // Register queries, panels, commands
  },

  unregister(lens: Lens) {
    // Cleanup
  },
});
```

### Registering Components

```typescript
register(lens: Lens) {
  // Register a custom query
  lens.registerQuery({
    name: 'com.mycompany.my-addon:my_analysis',
    description: 'Run custom analysis',
    execute(graph, params) {
      // Implementation
      return { data: result, fidelity: 'EXACT' };
    },
  });

  // Register a custom panel (via UI)
  // This requires the UI to be mounted
}
```

## Available APIs

### Lens API (Public)

Addons have access to the following `Lens` methods:

```typescript
// Context
lens.getContexts(): ContextRegistration[];
lens.getActiveContext(): ContextRegistration | undefined;

// Selection
lens.select(entityIds, options): void;
lens.getSelection(): Selection;
lens.onSelectionChange(handler): () => void;

// Query
lens.query<T>(name, params): T | undefined;
lens.getGraph(): EntityGraph;
lens.getNode(id): Node | undefined;

// Capabilities
lens.hasCapability(capability): boolean;
lens.getCapabilityStatus(capability): CapabilityStatus;

// Events
lens.onEvent(handler): () => void;
lens.on<T>(type, handler): () => void;
```

### EntityGraph API

```typescript
// Node operations
graph.getNode(id): Node | undefined;
graph.hasNode(id): boolean;
graph.getNodes(filter): QueryResult;

// Edge operations
graph.getEdge(from, to, type): Edge | undefined;
graph.hasEdge(from, to, type): boolean;
graph.getIncomingEdges(id, type?): Edge[];
graph.getOutgoingEdges(id, type?): Edge[];
graph.getNeighbors(id, direction?, type?): Node[];

// Traversal
graph.traverse(startId, direction, edgeTypes?, maxDepth?): Node[];

// Stats
graph.nodeCount(): number;
graph.edgeCount(): number;
graph.nodeCountByType(): Record<NodeType, number>;
```

### Query API

```typescript
// Define a query
const myQuery = defineQuery<TParams, TResult>(
  'query_name',
  'Query description',
  (graph, params) => {
    // Implementation
    return {
      data: result,
      fidelity: 'EXACT',
      metadata: { executionTimeMs: 1.5 },
    };
  }
);
```

## Capabilities

### Available Capabilities

```typescript
// Capture capabilities
'capture.renderEvents'      // Render event stream
'capture.resourceLifecycle' // Resource create/update/dispose
'capture.passBoundaries'    // Pass begin/end events

// Timing capabilities
'timing.cpu'                // CPU timing
'timing.gpu'                // GPU timing (timer queries)

// Introspection capabilities
'introspection.shaderSource'  // Shader source access
'introspection.pipeline'      // Pipeline state access

// Transport capabilities
'transport.remote'          // Remote UI support

// Worker capabilities
'worker.support'            // Worker/OffscreenCanvas
```

### Checking Capabilities

```typescript
register(lens: Lens) {
  const hasGpuTiming = lens.hasCapability('timing.gpu');

  if (!hasGpuTiming) {
    console.warn('[MyAddon] GPU timing unavailable, using estimates');
  }
}
```

## Fidelity Contract

All addon metrics MUST carry fidelity:

```typescript
interface MetricValue {
  value: number;
  unit: string;
  fidelity: 'EXACT' | 'ESTIMATED' | 'UNAVAILABLE';
  reason?: string;  // Required if not EXACT
}
```

### Propagation Rules

```typescript
// When combining fidelities:
// EXACT + EXACT = EXACT
// EXACT + ESTIMATED = ESTIMATED
// ANY + UNAVAILABLE = UNAVAILABLE

function combineFidelity(...fidelities: Fidelity[]): Fidelity {
  if (fidelities.includes('UNAVAILABLE')) return 'UNAVAILABLE';
  if (fidelities.includes('ESTIMATED')) return 'ESTIMATED';
  return 'EXACT';
}
```

## Best Practices

### Namespace Everything

```typescript
// Good: Namespaced
'com.mycompany.addon:query/my_analysis'
'com.mycompany.addon:panel/overview'

// Bad: Not namespaced
'my_analysis'
'overview'
```

### Handle Missing Capabilities

```typescript
register(lens: Lens) {
  if (!lens.hasCapability('timing.gpu')) {
    // Degrade gracefully
    this.useEstimates = true;
  }
}
```

### Don't Break Traces

Traces should remain valid without your addon installed:

```typescript
// Good: Addon enhances but isn't required
// Bad: Custom events that break replay
```

### Declare Requirements

```typescript
requires: {
  kernel: '^1.0.0',  // Be specific about versions
},
capabilities: {
  required: ['capture.renderEvents'],  // Required to function
  optional: ['timing.gpu'],            // Nice to have
},
```

## Testing

### Unit Testing

```typescript
import { createTestLens } from '@3lens/testing';
import myAddon from '../src';

describe('My Addon', () => {
  it('registers successfully', async () => {
    const lens = createTestLens();
    await lens.registerAddon(myAddon);
    expect(lens.hasAddon('com.mycompany.my-addon')).toBe(true);
  });

  it('handles missing capability', async () => {
    const lens = createTestLens({
      capabilities: { 'timing.gpu': false },
    });
    const result = await lens.registerAddon(myAddon);
    expect(result.warnings).toContain('timing.gpu unavailable');
  });
});
```

## Version Compatibility

### Three Version Axes

1. **Kernel API version** - Public Lens API
2. **Trace schema version** - Event/entity format
3. **Contracts version** - Behavioral invariants

### Specifying Compatibility

```typescript
requires: {
  kernel: '^1.0.0',     // Major version compatibility
  trace: '^1.0.0',      // Trace format compatibility
},
```

## Security

### Permission Levels

```typescript
// read: Read-only queries and views
// mutate: Can modify scene/settings
// dangerous: Can export data, open windows
```

Addons should request minimal permissions.

## Publishing

### Package Structure

```
my-3lens-addon/
├── package.json
├── src/
│   └── index.ts
├── 3lens-addon.json    # Addon manifest
└── README.md
```

### Manifest

```json
{
  "id": "com.mycompany.my-addon",
  "version": "1.0.0",
  "displayName": "My Addon",
  "requires": { "kernel": "^1.0.0" },
  "capabilities": {
    "required": ["capture.renderEvents"],
    "optional": ["timing.gpu"]
  }
}
```

## See Also

- [agents/contracts/addons.md](../agents/contracts/addons.md) - Addon contract
- [agents/playbooks/add-a-plugin.md](../agents/playbooks/add-a-plugin.md) - Step-by-step guide
