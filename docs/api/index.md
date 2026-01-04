# API Reference

Welcome to the 3Lens API reference documentation. This section provides detailed information about all public APIs, types, and interfaces.

## Packages

3Lens is organized into several packages:

| Package | Description | Documentation |
|---------|-------------|---------------|
| `@3lens/core` | Core probe engine and metrics collection | [View →](/api/core/create-probe) |
| `@3lens/overlay` | Visual devtools panel UI | [View →](/api/overlay/create-overlay) |
| `@3lens/react-bridge` | React/R3F integration hooks | [View →](/api/react/) |
| `@3lens/vue-bridge` | Vue/TresJS composables | [View →](/api/vue/) |
| `@3lens/angular-bridge` | Angular services and directives | [View →](/api/angular/) |
| `@3lens/ui` | Reusable UI components | [View →](/packages/ui/) |

## Quick Reference

### Core APIs

```ts
import { createProbe } from '@3lens/core'

// Create a probe instance
const probe = createProbe(config?)

// Connect to renderer and scene
probe.observeRenderer(renderer)
probe.observeScene(scene)

// Access metrics
probe.on('frame', (stats: FrameStats) => { })
probe.getLatestStats()

// Selection
probe.selectObject(object)
probe.clearSelection()
probe.on('select', (object) => { })

// Inspect mode
probe.setInspectModeEnabled(true)

// Lifecycle
probe.dispose()
```

### Overlay APIs

```ts
import { createOverlay, bootstrapOverlay } from '@3lens/overlay'

// Quick setup
bootstrapOverlay(probe)

// Or manual control
const overlay = createOverlay(probe, options?)
overlay.show()
overlay.hide()
overlay.toggle()
overlay.dispose()
```

### React Hooks

```ts
import {
  ThreeLensProvider,
  useThreeLensProbe,
  useDevtoolEntity,
  useFPS,
  useDrawCalls,
  useSelectedObject,
} from '@3lens/react-bridge'
```

### Vue Composables

```ts
import {
  createThreeLens,
  useThreeLens,
  useDevtoolEntity,
  useFPS,
  useDrawCalls,
} from '@3lens/vue-bridge'
```

### Angular Service

```ts
import {
  ThreeLensService,
  ThreeLensModule,
  THREELENS_PROBE,
  THREELENS_CONFIG,
} from '@3lens/angular-bridge'
```

## Type Definitions

All packages include TypeScript definitions. Key types:

- [`ProbeConfig`](/api/core/probe-config) - Configuration options
- [`FrameStats`](/api/types/frame-stats) - Per-frame metrics
- [`SceneSnapshot`](/api/types/scene-snapshot) - Full scene state
- [`DevtoolPlugin`](/api/core/devtool-probe#plugins) - Plugin interface

## Generated API Docs

For auto-generated API documentation from TypeDoc, see:

- [TypeDoc Reference](/api/reference/) - Full generated documentation

::: info
The TypeDoc reference is generated directly from source code JSDoc comments and provides complete type information for all exports.
:::

## See Also

- [Getting Started](/guide/getting-started) - Installation and basic setup
- [Architecture](/architecture) - Technical design overview
- [Plugin Development](/guide/advanced/plugins) - Building custom plugins
