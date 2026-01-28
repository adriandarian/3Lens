---
name: scaffold-mount
description: Generate boilerplate for a framework mount kit
---

# /scaffold-mount

Generate boilerplate code for a new framework mount kit (React, Vue, Angular, Svelte, etc.).

## Usage

```
/scaffold-mount [framework]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| framework | (required) | Framework name (react, vue, angular, svelte) |

## Examples

```bash
# Create React mount kit
3lens scaffold mount react

# Create Vue mount kit
3lens scaffold mount vue

# Create Angular mount kit
3lens scaffold mount angular
```

## Generated Files

```
packages/mounts/
└── [framework]/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── src/
    │   ├── index.ts
    │   ├── provider.ts
    │   └── hooks.ts
    └── README.md
```

## Generated Structure

### React Mount Kit

```typescript
// packages/mounts/react/src/index.ts
import { createLensContext } from './provider';

export { createLensContext, useLens } from './provider';
export type { LensContextValue } from './provider';

// packages/mounts/react/src/provider.tsx
import React, { createContext, useContext } from 'react';
import { createLens, LensClient } from '@3lens/runtime';

export const LensContext = createContext<LensContextValue | null>(null);

export function LensProvider({ children }: { children: React.ReactNode }) {
  const lens = createLens();
  return (
    <LensContext.Provider value={{ client: lens }}>
      {children}
    </LensContext.Provider>
  );
}

export function useLens(): LensClient {
  const context = useContext(LensContext);
  if (!context) throw new Error('useLens must be used within LensProvider');
  return context.client;
}
```

## Requirements

Every mount kit must:
- Provide framework-specific hooks/composables/components
- Integrate with UI Core (no direct kernel access)
- Support both live and offline trace modes
- Follow runtime-boundaries contract
- Have examples and documentation

## Next Steps

After scaffolding, follow the playbook:
- `agents/playbooks/add-a-mount-kit.md`

## See Also

- Skill: scaffold-operations
- Playbook: agents/playbooks/add-a-mount-kit.md
- Contract: agents/contracts/runtime-boundaries.md
- Existing mounts: packages/mounts/