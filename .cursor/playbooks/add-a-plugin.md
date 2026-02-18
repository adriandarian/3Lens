# Playbook: Add an Addon/Plugin

This playbook describes how to create a third-party addon for 3Lens.

## Prerequisites

- [ ] Read the addons contract
- [ ] Understand capability requirements
- [ ] Know what kernel/trace versions you target

## Steps

### 1. Create the Addon Package

```bash
mkdir my-3lens-addon
cd my-3lens-addon
npm init
```

```json
// package.json
{
  "name": "@mycompany/3lens-addon-example",
  "version": "1.0.0",
  "peerDependencies": {
    "@3lens/runtime": "^1.0.0"
  }
}
```

### 2. Define the Addon

```typescript
// src/index.ts
import { Addon, Lens } from '@3lens/runtime';

export const myAddon: Addon = {
  // Identity
  id: 'com.mycompany.example',
  version: '1.0.0',
  displayName: 'My Example Addon',
  description: 'Adds custom analysis to 3Lens',
  
  // Compatibility
  requires: {
    kernel: '^1.0.0',
    trace: '^1.0.0',
  },
  
  // Capabilities
  capabilities: {
    required: ['capture.renderEvents'],
    optional: ['timing.gpu'],
  },
  
  // Registration
  register(lens: Lens) {
    // Register queries
    lens.registerQuery(myCustomQuery);
    
    // Register panels
    lens.registerPanel(myCustomPanel);
    
    // Register commands
    lens.registerCommand(myCustomCommand);
  },
  
  unregister(lens: Lens) {
    // Cleanup
  }
};

export default myAddon;
```

### 3. Declare Capabilities

Be explicit about what your addon needs:

```typescript
capabilities: {
  // These MUST be available or addon won't load
  required: [
    'capture.renderEvents',      // Need render event stream
    'introspection.pipeline',    // Need pipeline introspection
  ],
  
  // These are nice to have, addon degrades without them
  optional: [
    'timing.gpu',                // GPU timing for better analysis
  ],
},
```

### 4. Add Custom Queries

```typescript
// src/queries/my-query.ts
import { Query } from '@3lens/runtime';

export const myCustomQuery: Query = {
  name: 'com.mycompany.example:my_analysis',  // Namespaced!
  
  execute(graph, params) {
    // Query implementation
    return {
      results: [...],
      fidelity: 'EXACT',  // Always include fidelity
    };
  }
};
```

### 5. Add Custom Panel

```typescript
// src/panels/my-panel.ts
import { Panel } from '@3lens/runtime';

export const myCustomPanel: Panel = {
  id: 'com.mycompany.example:panel/analysis',  // Namespaced!
  name: 'My Analysis',
  
  render(container, client) {
    // Render panel
  },
  
  onSelectionChange(selection) {
    // React to selection
  }
};
```

### 6. Handle Degraded Mode

Check capability availability:

```typescript
register(lens: Lens) {
  const hasGpuTiming = lens.hasCapability('timing.gpu');
  
  lens.registerPanel({
    ...myPanel,
    render(container, client) {
      if (!hasGpuTiming) {
        // Show degraded UI
        container.innerHTML = `
          <div class="degraded-notice">
            GPU timing unavailable. Showing estimated data.
          </div>
        `;
      }
      // ... rest of render
    }
  });
}
```

### 7. Ensure Trace Compatibility

Your addon should not break traces:

```typescript
// Good: Traces work without addon
register(lens: Lens) {
  // Register as enhancement, not requirement
  lens.registerQuery(myQuery);
}

// Bad: Addon-specific events that break replay
// Don't do this unless necessary
```

### 8. Test the Addon

```typescript
// tests/addon.test.ts
import { createTestLens } from '@3lens/testing';
import myAddon from '../src';

describe('My Addon', () => {
  it('registers successfully with compatible kernel', async () => {
    const lens = createTestLens({ kernelVersion: '1.0.0' });
    await lens.registerAddon(myAddon);
    expect(lens.hasAddon('com.mycompany.example')).toBe(true);
  });
  
  it('fails gracefully with missing capabilities', async () => {
    const lens = createTestLens({ 
      capabilities: { 'capture.renderEvents': false }
    });
    const result = await lens.registerAddon(myAddon);
    expect(result.success).toBe(false);
    expect(result.reason).toContain('Missing required capability');
  });
});
```

## Addon Manifest

For discoverability, include a manifest:

```json
// 3lens-addon.json
{
  "id": "com.mycompany.example",
  "version": "1.0.0",
  "displayName": "My Example Addon",
  "description": "Adds custom analysis to 3Lens",
  "requires": {
    "kernel": "^1.0.0"
  },
  "capabilities": {
    "required": ["capture.renderEvents"],
    "optional": ["timing.gpu"]
  },
  "panels": ["analysis"],
  "queries": ["my_analysis"],
  "commands": ["analyze"]
}
```

## Checklist

Before publishing:

- [ ] Addon has unique, namespaced ID
- [ ] Version compatibility declared
- [ ] Capabilities declared (required + optional)
- [ ] Handles missing capabilities gracefully
- [ ] All names are namespaced (queries, panels, commands)
- [ ] Doesn't break traces
- [ ] Has tests
- [ ] Has README with installation instructions

## Anti-patterns to Avoid

- ❌ Non-namespaced IDs (use `com.company.addon:item`)
- ❌ Assuming capabilities exist without checking
- ❌ Breaking traces when addon not installed
- ❌ Using kernel internals instead of public API
- ❌ Conflicting names with core 3Lens features
