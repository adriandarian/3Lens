# Playbook: Add a Mount Kit

This playbook describes how to add a new framework mount kit for integrating 3Lens into different frameworks.

## Prerequisites

- [ ] Understand the target framework's patterns (hooks, composables, services, stores)
- [ ] Familiar with UI Core components
- [ ] Understand runtime-boundaries contract
- [ ] Know how the framework handles context/providers

## Steps

### 1. Scaffold the Mount Kit

Use the scaffold command:

```bash
3lens scaffold mount [framework]
```

This generates:
- Package structure
- Framework-specific provider/context
- Hooks/composables/components
- Type definitions
- README

### 2. Implement Framework-Specific Provider

Create the provider/context pattern for your framework:

#### React Example

```typescript
// packages/mounts/react/src/provider.tsx
import React, { createContext, useContext } from 'react';
import { createLens, LensClient } from '@3lens/runtime';

export const LensContext = createContext<LensClient | null>(null);

export function LensProvider({ children }: React.PropsWithChildren) {
  const lens = createLens();
  return (
    <LensContext.Provider value={lens}>
      {children}
    </LensContext.Provider>
  );
}

export function useLens(): LensClient {
  const context = useContext(LensContext);
  if (!context) {
    throw new Error('useLens must be used within LensProvider');
  }
  return context;
}
```

#### Vue Example

```typescript
// packages/mounts/vue/src/composables/useThreeLens.ts
import { provide, inject } from 'vue';
import { createLens, LensClient } from '@3lens/runtime';

export const LENS_KEY = Symbol('3lens');

export function useThreeLens(): LensClient {
  const lens = inject<LensClient>(LENS_KEY);
  if (!lens) {
    throw new Error('useThreeLens must be used within ThreeLensProvider');
  }
  return lens;
}

export function provideThreeLens() {
  const lens = createLens();
  provide(LENS_KEY, lens);
  return lens;
}
```

### 3. Integrate with UI Core

Use UI Core Web Components:

```typescript
// React example
import { ThreeLensDock, ThreeLensPanel } from '@3lens/ui-web';

function App() {
  return (
    <LensProvider>
      <ThreeLensDock>
        <ThreeLensPanel id="inspector" />
        <ThreeLensPanel id="perf" />
      </ThreeLensDock>
      {/* Your app */}
    </LensProvider>
  );
}
```

### 4. Support Live and Offline Modes

Ensure mount kit works in both modes:

```typescript
// Framework-specific hook/composable should handle both modes
function useQuery(queryName: string, params: any) {
  const lens = useLens();
  
  return lens.isLive
    ? lens.queryLive(queryName, params)
    : lens.queryTrace(queryName, params);
}
```

### 5. Handle Errors Gracefully

Handle CSP and other errors:

```typescript
function LensProvider({ children }) {
  try {
    const lens = createLens();
    return <LensContext.Provider value={lens}>{children}</LensContext.Provider>;
  } catch (error) {
    if (error.code === 'CSP_BLOCKED') {
      console.warn('3Lens blocked by CSP, running in degraded mode');
      // Provide degraded lens or null
    }
    throw error;
  }
}
```

### 6. Add Type Definitions

Export TypeScript types:

```typescript
// packages/mounts/react/src/index.ts
export type { LensContextValue } from './provider';
export { LensProvider, useLens } from './provider';
```

### 7. Create Examples

Add example usage:

```typescript
// examples/framework-integration/react-basic/src/main.tsx
import { LensProvider, useLens } from '@3lens/mount-react';
import { ThreeLensDock } from '@3lens/ui-web';

function App() {
  return (
    <LensProvider>
      <ThreeLensDock />
      <MyScene />
    </LensProvider>
  );
}
```

### 8. Add Tests

Create integration tests:

```typescript
// packages/mounts/react/src/provider.test.tsx
import { render, screen } from '@testing-library/react';
import { LensProvider, useLens } from './provider';

describe('LensProvider', () => {
  it('provides lens context', () => {
    function TestComponent() {
      const lens = useLens();
      return <div>{lens ? 'Lens available' : 'No lens'}</div>;
    }
    
    render(
      <LensProvider>
        <TestComponent />
      </LensProvider>
    );
    
    expect(screen.getByText('Lens available')).toBeInTheDocument();
  });
});
```

### 9. Document Usage

Update README with:
- Installation instructions
- Basic usage examples
- Framework-specific patterns
- Integration with UI Core
- Error handling

## Checklist

Before submitting:

- [ ] Mount kit follows framework patterns
- [ ] Only depends on UI Core and Runtime (not kernel)
- [ ] Integrates with UI Core components
- [ ] Supports live and offline modes
- [ ] Handles errors gracefully
- [ ] Has TypeScript types
- [ ] Includes examples
- [ ] Has tests
- [ ] Documented in README

## Anti-patterns to Avoid

- ❌ Importing from kernel directly
- ❌ Framework-specific code in UI Core
- ❌ Only supporting live mode
- ❌ Not handling CSP errors
- ❌ Missing TypeScript types
- ❌ No examples or documentation

## See Also

- Skill: mount-operations
- Command: scaffold-mount
- Contract: agents/contracts/runtime-boundaries.md
- Contract: agents/contracts/ui-surfaces.md
- Rule: .cursor/rules/mount-standards.mdc