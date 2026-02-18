# Contract: Runtime Boundaries

## Purpose

Maintain strict separation between Kernel, Hosts, UI Core, and Mount Kits.
This prevents framework/version drift and keeps the system maintainable.

## Layers

```
┌─────────────────────────────────────────────┐
│ Mount Kits (Angular / React / Vue / Svelte) │  <- Framework-specific
├─────────────────────────────────────────────┤
│ UI Core (DOM island / Web Component)        │  <- Framework-agnostic
├─────────────────────────────────────────────┤
│ Runtime Client API (Lens, queries, commands)│  <- Public API
├─────────────────────────────────────────────┤
│ Hosts (manual / r3f / tres / worker)        │  <- Runtime attachment
├─────────────────────────────────────────────┤
│ Kernel (capture / graph / query / trace)    │  <- Core engine
└─────────────────────────────────────────────┘
```

### Kernel
- Capture schema, entity graph, query engine, trace format
- Zero UI dependencies
- Zero framework dependencies
- Pure TypeScript/JavaScript

### Host
- Attaches to runtime (three.js / framework render loop ownership)
- Emits events to kernel
- Discovers renderer/scene/camera
- No UI rendering code

### UI Core
- Renders devtools UI from client state/queries
- Framework-agnostic (DOM manipulation or Web Components)
- No Angular/React/Vue/Svelte dependencies
- Communicates via LensClient interface

### Mount Kits
- Framework-specific lifecycle + DOM mounting glue
- Thin wrappers around UI Core
- Handle framework-specific concerns (zones, reactivity, etc.)
- Use public client APIs only

## Invariants (MUST ALWAYS HOLD)

1. **No framework-specific code in Kernel or UI Core.**
   - No React hooks, no Angular decorators, no Vue refs in these layers.

2. **No UI rendering code in Hosts.**
   - Hosts emit data, they don't display it.

3. **Hosts MUST NOT depend on UI packages.**
   - Host can run without any UI mounted.

4. **Mount Kits MUST NOT reach into Kernel internals.**
   - Use public client APIs only.

5. **Version-specific three.js hooking MUST be isolated.**
   - Feature-detected and must not leak into Kernel.

## Dependency Rules

```
Allowed:
  Mount Kit -> UI Core -> Runtime Client -> Kernel
  Host -> Kernel

Forbidden:
  Kernel -> UI Core
  Kernel -> Mount Kit
  Kernel -> Host (kernel doesn't know about hosts)
  UI Core -> Mount Kit
  UI Core -> Host
  Host -> UI Core
  Host -> Mount Kit
```

## Degradation Rules

- If a Host cannot safely hook a runtime:
  - It MUST degrade features and emit warnings describing what is unavailable.
- If CSP prevents injection:
  - Mount Kits must provide a CSP-safe mounting mode and emit warnings when blocked.

## Acceptance Tests

- **Dependency graph:**
  - Kernel has zero imports from UI/Mount packages.
  - UI Core has zero imports from framework-specific packages.
  - Hosts have zero imports from UI Core/Mount packages.
- **Behavior:**
  - Same trace replay works regardless of which mount kit was used to view it.
- **Isolation:**
  - Host can run and capture without any UI mounted.
  - UI can display trace without host running.

## Anti-goals

- "Just import React here" inside Kernel/UI Core
- Host packages bundling UI to "make it easier"
- Mount kits calling private Kernel functions
- Mixing capture logic with display logic
- Framework-specific types in public interfaces
