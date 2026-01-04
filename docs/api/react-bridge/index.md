# React Bridge (`@3lens/react-bridge`)

The React bridge provides seamless integration between 3Lens devtools and React applications, with first-class support for React Three Fiber (R3F).

## Installation

```bash
npm install @3lens/react-bridge @3lens/core
# or
pnpm add @3lens/react-bridge @3lens/core
```

For R3F support:

```bash
npm install @react-three/fiber three
```

## Quick Start

### With React Three Fiber

```tsx
import { ThreeLensCanvas, useDevtoolEntity } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensCanvas threeLensConfig={{ appName: 'My App' }}>
      <Scene />
    </ThreeLensCanvas>
  );
}
```

### With Vanilla Three.js

```tsx
import { ThreeLensProvider, useThreeLensProbe } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'My App' }}>
      <ThreeCanvas />
    </ThreeLensProvider>
  );
}
```

## API Reference

### Provider & Context

| Export | Description |
|--------|-------------|
| [ThreeLensProvider](./three-lens-provider.md) | Main context provider |
| [ThreeLensContext](./three-lens-provider.md#context-value) | React context object |

### Hooks

| Hook | Description |
|------|-------------|
| [useThreeLensProbe](./use-three-lens-probe.md) | Access the probe instance |
| [useThreeLensProbeOptional](./use-three-lens-probe.md#usethreelensprobeoptional) | Safe probe access |
| [useSelectedObject](./use-selected-object.md) | Selection state and controls |
| [useDevtoolEntity](./use-devtool-entity.md) | Register named entities |
| [useDevtoolEntityGroup](./use-devtool-entity.md#usedevtoolentitygroup) | Register entity groups |
| [useMetric](./use-metric.md) | Extract custom metrics |
| [useFPS](./metric-shortcut-hooks.md#usefps) | FPS metric shortcut |
| [useFrameTime](./metric-shortcut-hooks.md#useframetime) | Frame time metric |
| [useDrawCalls](./metric-shortcut-hooks.md#usedrawcalls) | Draw calls metric |
| [useTriangles](./metric-shortcut-hooks.md#usetriangles) | Triangle count metric |
| [useGPUMemory](./metric-shortcut-hooks.md#usegpumemory) | GPU memory metric |
| [useTextureCount](./metric-shortcut-hooks.md#usetexturecount) | Texture count metric |
| [useGeometryCount](./metric-shortcut-hooks.md#usegeometrycount) | Geometry count metric |

### React Three Fiber Integration

| Export | Description |
|--------|-------------|
| [ThreeLensCanvas](./three-lens-canvas.md) | Drop-in Canvas replacement |
| [createR3FConnector](./r3f-integration.md#creater3fconnector) | Manual R3F connection |
| [R3FProbe](./r3f-integration.md#r3fprobe) | R3F probe component |
| [useR3FConnection](./r3f-integration.md#user3fconnection) | Manual connection hook |

### Types

| Type | Description |
|------|-------------|
| `ThreeLensProviderConfig` | Provider configuration |
| `ThreeLensContextValue` | Context value interface |
| `UseMetricOptions` | Metric hook options |
| `MetricValue<T>` | Metric return value |
| `EntityOptions` | Entity registration options |
| `RegisteredEntity` | Registered entity info |

## Usage Patterns

### Basic Performance Monitoring

```tsx
import { ThreeLensProvider, useFPS, useDrawCalls } from '@3lens/react-bridge';

function Stats() {
  const fps = useFPS();
  const drawCalls = useDrawCalls();
  
  return (
    <div>
      <span>FPS: {fps.current.toFixed(0)}</span>
      <span>Draw Calls: {drawCalls.current}</span>
    </div>
  );
}

function App() {
  return (
    <ThreeLensProvider>
      <Canvas />
      <Stats />
    </ThreeLensProvider>
  );
}
```

### Named Entity Registration

```tsx
import { useDevtoolEntity } from '@3lens/react-bridge';

function Enemy({ id, health }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useDevtoolEntity(ref.current, {
    name: `Enemy_${id}`,
    module: 'game/enemies',
    metadata: { health },
    tags: ['enemy', 'ai-controlled'],
  });
  
  return <mesh ref={ref}>...</mesh>;
}
```

### Selection Handling

```tsx
import { useSelectedObject } from '@3lens/react-bridge';

function Inspector() {
  const { selectedNode, hasSelection, clear } = useSelectedObject();
  
  if (!hasSelection) return <p>Select an object</p>;
  
  return (
    <div>
      <h3>{selectedNode?.ref.name}</h3>
      <button onClick={clear}>Deselect</button>
    </div>
  );
}
```

## Related Documentation

- [Getting Started Guide](/guide/getting-started)
- [React/R3F Guide](/guides/REACT-R3F-GUIDE)
- [Core Package Documentation](/api/core/)
- [Overlay Package Documentation](/api/overlay/)
