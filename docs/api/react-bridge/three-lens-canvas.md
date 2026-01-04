# ThreeLensCanvas

`ThreeLensCanvas` is a drop-in replacement for React Three Fiber's `Canvas` component that automatically integrates 3Lens devtools.

## Import

```tsx
import { ThreeLensCanvas } from '@3lens/react-bridge';
```

## Usage

Simply replace your R3F `Canvas` with `ThreeLensCanvas`:

```tsx
// Before
import { Canvas } from '@react-three/fiber';

function App() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Scene />
    </Canvas>
  );
}

// After
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensCanvas
      threeLensConfig={{ appName: 'My App' }}
      camera={{ position: [0, 0, 5] }}
    >
      <Scene />
    </ThreeLensCanvas>
  );
}
```

## Props

### ThreeLensCanvasProps

`ThreeLensCanvas` accepts all props from R3F's `Canvas` plus an additional `threeLensConfig` prop:

| Prop | Type | Description |
|------|------|-------------|
| `threeLensConfig` | `ThreeLensProviderConfig` | Configuration for 3Lens |
| `...canvasProps` | `CanvasProps` | All standard R3F Canvas props |

### ThreeLensProviderConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appName` | `string` | `'React Three.js App'` | Name shown in devtools |
| `showOverlay` | `boolean` | `true` | Show overlay on init |
| `toggleShortcut` | `string` | `'ctrl+shift+d'` | Keyboard shortcut |
| `debug` | `boolean` | `false` | Enable debug logging |
| `thresholds` | `object` | — | Performance thresholds |
| `sampling` | `object` | — | Sampling configuration |

## Examples

### Basic Usage

```tsx
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensCanvas>
      <ambientLight />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
    </ThreeLensCanvas>
  );
}
```

### With Configuration

```tsx
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensCanvas
      threeLensConfig={{
        appName: 'My Game',
        showOverlay: true,
        toggleShortcut: 'ctrl+shift+i',
        debug: process.env.NODE_ENV === 'development',
      }}
      camera={{ position: [0, 2, 5], fov: 75 }}
      shadows
      dpr={[1, 2]}
    >
      <Scene />
    </ThreeLensCanvas>
  );
}
```

### With Canvas Ref

```tsx
import { useRef } from 'react';
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <ThreeLensCanvas
      ref={canvasRef}
      threeLensConfig={{ appName: 'With Ref' }}
    >
      <Scene />
    </ThreeLensCanvas>
  );
}
```

### With Post-Processing

```tsx
import { ThreeLensCanvas } from '@3lens/react-bridge';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function App() {
  return (
    <ThreeLensCanvas
      threeLensConfig={{ appName: 'Post-Processing Demo' }}
      gl={{ antialias: true }}
    >
      <Scene />
      <EffectComposer>
        <Bloom intensity={1.5} />
      </EffectComposer>
    </ThreeLensCanvas>
  );
}
```

### Full-Screen Setup

```tsx
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ThreeLensCanvas
        threeLensConfig={{
          appName: 'Full Screen App',
          showOverlay: true,
        }}
        style={{ background: '#000' }}
      >
        <Scene />
      </ThreeLensCanvas>
    </div>
  );
}
```

### Using Hooks Inside

All 3Lens hooks work inside `ThreeLensCanvas`:

```tsx
import { useRef } from 'react';
import { ThreeLensCanvas, useDevtoolEntity, useFPS } from '@3lens/react-bridge';

function Player() {
  const ref = useRef<THREE.Mesh>(null);
  
  useDevtoolEntity(ref.current, {
    name: 'Player',
    module: 'game/entities',
  });

  return (
    <mesh ref={ref}>
      <boxGeometry />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

function StatsOverlay() {
  const fps = useFPS();
  return (
    <Html position={[0, 2, 0]}>
      FPS: {fps.current.toFixed(0)}
    </Html>
  );
}

function App() {
  return (
    <ThreeLensCanvas threeLensConfig={{ appName: 'Game' }}>
      <Player />
      <StatsOverlay />
    </ThreeLensCanvas>
  );
}
```

## How It Works

`ThreeLensCanvas` combines:

1. **ThreeLensProvider** - Wraps everything to provide context
2. **R3F Canvas** - The standard React Three Fiber canvas
3. **R3FSceneConnector** - Auto-connects probe to R3F's renderer and scene

This is equivalent to:

```tsx
<ThreeLensProvider config={threeLensConfig}>
  <Canvas {...canvasProps}>
    <R3FSceneConnector />
    {children}
  </Canvas>
</ThreeLensProvider>
```

## Requirements

`ThreeLensCanvas` requires `@react-three/fiber` to be installed:

```bash
npm install @react-three/fiber three
```

If R3F is not available, the component will show an error message.

## Migrating from Manual Setup

If you're currently using the manual setup:

```tsx
// Before (manual)
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { ThreeLensProvider, createR3FConnector } from '@3lens/react-bridge';

const ThreeLensR3F = createR3FConnector(useThree, useFrame);

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'App' }}>
      <Canvas>
        <ThreeLensR3F />
        <Scene />
      </Canvas>
    </ThreeLensProvider>
  );
}

// After (ThreeLensCanvas)
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensCanvas threeLensConfig={{ appName: 'App' }}>
      <Scene />
    </ThreeLensCanvas>
  );
}
```

## When to Use Manual Setup Instead

Use `createR3FConnector` instead of `ThreeLensCanvas` when:

- You need multiple canvases with shared 3Lens context
- You have a complex component hierarchy
- You need fine-grained control over when connection happens
- You're integrating with an existing project structure

## Related

- [R3F Integration](./r3f-integration.md) - Manual integration options
- [ThreeLensProvider](./three-lens-provider.md) - Context provider
- [createR3FConnector](./r3f-integration.md#creater3fconnector) - Manual connector
