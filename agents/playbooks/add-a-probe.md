# Playbook: Add a Probe

This playbook describes how to add new instrumentation/capture capability to 3Lens.

## Prerequisites

- [ ] Understand the capture contract
- [ ] Define what events the probe will emit
- [ ] Define what entities the probe will create
- [ ] Consider version compatibility

## Steps

### 1. Define the Probe's Purpose

Answer these questions:
- What aspect of the runtime does this probe observe?
- What events will it emit?
- What entities will it create in the graph?
- What three.js versions/backends is it compatible with?

### 2. Create the Probe Module

```typescript
// packages/kernel/src/probes/my-probe.ts
import { Probe, ProbeConfig, CaptureContext } from '../types';

export interface MyProbeConfig extends ProbeConfig {
  // Probe-specific config
}

export function createMyProbe(config: MyProbeConfig): Probe {
  return {
    id: 'my-probe',
    name: 'My Probe',
    
    // Compatibility
    compatibleBackends: ['webgl2', 'webgpu'],
    compatibleVersions: '>=0.150.0',
    
    // Lifecycle
    attach(context: CaptureContext) {
      // Hook into runtime
    },
    
    detach(context: CaptureContext) {
      // Remove hooks
    },
    
    // Capture modes
    supportedModes: ['STANDARD', 'DEEP'],
  };
}
```

### 3. Define Events

Add event types to the capture schema:

```typescript
// packages/kernel/src/events/my-events.ts
import { EventType } from '../types';

export const myEventCreated: EventType = {
  name: 'my_thing_created',
  schema: {
    entity_id: 'string',
    context_id: 'string',
    timestamp: 'number',
    // ... other fields
  },
  captureMode: 'STANDARD', // Minimum mode required
};
```

### 4. Emit Events

```typescript
// In your probe's attach method
attach(context: CaptureContext) {
  const originalMethod = renderer.someMethod;
  
  renderer.someMethod = (...args) => {
    const result = originalMethod.apply(renderer, args);
    
    context.emit({
      type: 'my_thing_created',
      context_id: context.id,
      timestamp: performance.now(),
      entity_id: generateEntityId(context.id, 'my_thing', localId),
      // ... other data
    });
    
    return result;
  };
}
```

### 5. Create Entities

Update the entity graph:

```typescript
context.graph.addNode({
  id: entityId,
  type: 'my_thing',
  context_id: context.id,
  properties: {
    // Entity properties
  }
});

context.graph.addEdge({
  from: parentId,
  to: entityId,
  type: 'contains',
});
```

### 6. Handle Capture Modes

Respect the capture mode:

```typescript
attach(context: CaptureContext) {
  if (context.mode === 'MINIMAL') {
    // Only counters, no detailed events
    return;
  }
  
  if (context.mode === 'DEEP') {
    // Full instrumentation
  } else {
    // Standard instrumentation
  }
}
```

### 7. Version Compatibility

Use feature detection:

```typescript
attach(context: CaptureContext) {
  // Feature detection first
  if (!renderer.someMethod) {
    context.emit({
      type: 'warning_event',
      message: 'someMethod not available, probe degraded',
    });
    return;
  }
  
  // Version check as fallback
  if (!semver.satisfies(threeVersion, this.compatibleVersions)) {
    context.emit({
      type: 'warning_event',
      message: `Probe may not work with three.js ${threeVersion}`,
    });
  }
}
```

### 8. Add Tests

```typescript
// tests/probes/my-probe.test.ts
describe('My Probe', () => {
  it('emits events with correct schema', () => {
    // Test implementation
  });
  
  it('creates valid entity IDs', () => {
    // Test implementation
  });
  
  it('respects capture mode', () => {
    // Test implementation
  });
  
  it('handles missing API gracefully', () => {
    // Test implementation
  });
});
```

## Checklist

Before submitting:

- [ ] Probe has defined compatibility (backends, versions)
- [ ] Events follow capture schema
- [ ] Entity IDs are stable and namespaced
- [ ] Respects capture modes
- [ ] Graceful degradation on hook failure
- [ ] Has unit tests
- [ ] Documented in README

## Anti-patterns to Avoid

- ❌ Assuming specific three.js version
- ❌ Crashing on hook failure
- ❌ Ignoring capture mode
- ❌ Unstable entity IDs
- ❌ Events without context_id
