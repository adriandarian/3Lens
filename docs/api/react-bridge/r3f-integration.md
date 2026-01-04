# React Three Fiber Integration

3Lens provides first-class integration with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) (R3F), the popular React renderer for Three.js.

## Overview

There are two approaches to integrate 3Lens with R3F:

1. **`ThreeLensCanvas`** - Drop-in replacement for R3F's `Canvas` with automatic 3Lens setup
2. **`createR3FConnector`** - Manual integration for existing R3F setups

## Quick Start

### Option 1: ThreeLensCanvas (Recommended)

The easiest way to use 3Lens with R3F:

```tsx
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensCanvas
      threeLensConfig={{ appName: 'My R3F App' }}
      camera={{ position: [0, 0, 5] }}
    >
      <ambientLight />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
    </ThreeLensCanvas>
  );
}
```

### Option 2: createR3FConnector (Manual)

For existing projects or more control:

```tsx
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { ThreeLensProvider, createR3FConnector } from '@3lens/react-bridge';

// Create the connector with R3F hooks
const ThreeLensR3F = createR3FConnector(useThree, useFrame);

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'My App' }}>
      <Canvas>
        <ThreeLensR3F />
        <Scene />
      </Canvas>
    </ThreeLensProvider>
  );
}
```

---

## createR3FConnector

Creates a component that connects 3Lens to R3F's renderer and scene.

### Import

```tsx
import { createR3FConnector } from '@3lens/react-bridge';
```

### Signature

```tsx
function createR3FConnector(
  useThree: () => { gl: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.Camera },
  useFrame: (callback: (state: any, delta: number) => void) => void
): React.FC
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `useThree` | `() => R3FState` | R3F's `useThree` hook |
| `useFrame` | `(callback) => void` | R3F's `useFrame` hook |

### Example

```tsx
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { ThreeLensProvider, createR3FConnector } from '@3lens/react-bridge';

// Create the connector once, outside your component
const ThreeLensR3F = createR3FConnector(useThree, useFrame);

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'Game' }}>
      <Canvas>
        <ThreeLensR3F />
        <GameScene />
      </Canvas>
    </ThreeLensProvider>
  );
}
```

### What It Does

When rendered inside a Canvas, the connector:

1. Calls `probe.observeRenderer(gl)` to start monitoring WebGL calls
2. Calls `probe.observeScene(scene)` to track the scene graph
3. Initializes transform gizmos for object manipulation
4. Initializes camera controllers for navigation
5. Sets up the render loop integration

---

## R3FProbe

An alternative component-based approach for connecting to R3F.

### Import

```tsx
import { R3FProbe } from '@3lens/react-bridge';
```

### Usage

```tsx
import { Canvas } from '@react-three/fiber';
import { ThreeLensProvider, R3FProbe } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'My App' }}>
      <Canvas>
        <R3FProbe showOverlay={true} />
        <ambientLight />
        <mesh>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </Canvas>
    </ThreeLensProvider>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showOverlay` | `boolean` | `true` | Whether to show the overlay UI |

---

## useR3FConnection

A hook for manually connecting 3Lens to R3F from within a component.

### Import

```tsx
import { useR3FConnection } from '@3lens/react-bridge';
```

### Usage

```tsx
import { Canvas } from '@react-three/fiber';
import { ThreeLensProvider, useR3FConnection } from '@3lens/react-bridge';

function Scene() {
  useR3FConnection();
  
  return (
    <>
      <ambientLight />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
    </>
  );
}

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'My App' }}>
      <Canvas>
        <Scene />
      </Canvas>
    </ThreeLensProvider>
  );
}
```

---

## Using Hooks with R3F

All 3Lens hooks work seamlessly with R3F components:

### Entity Registration

```tsx
import { useRef } from 'react';
import { useDevtoolEntity } from '@3lens/react-bridge';

function Player({ health, position }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useDevtoolEntity(meshRef.current, {
    name: 'Player',
    module: 'entities/characters',
    metadata: { health, position },
    tags: ['player', 'controllable'],
  });

  return (
    <mesh ref={meshRef} position={position}>
      <capsuleGeometry args={[0.5, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}
```

### Performance Monitoring

```tsx
import { useFPS, useDrawCalls, useTriangles } from '@3lens/react-bridge';
import { Html } from '@react-three/drei';

function PerformanceOverlay() {
  const fps = useFPS();
  const drawCalls = useDrawCalls();
  const triangles = useTriangles();

  return (
    <Html position={[-5, 3, 0]}>
      <div className="stats-overlay">
        <p>FPS: {fps.current.toFixed(0)}</p>
        <p>Draw Calls: {drawCalls.current}</p>
        <p>Triangles: {triangles.current.toLocaleString()}</p>
      </div>
    </Html>
  );
}
```

### Selection Handling

```tsx
import { useSelectedObject } from '@3lens/react-bridge';

function SelectionHighlight() {
  const { selectedUuid, hasSelection } = useSelectedObject();

  if (!hasSelection) return null;

  return (
    <mesh position={/* get from selected object */}>
      <boxGeometry />
      <meshBasicMaterial color="yellow" wireframe transparent opacity={0.5} />
    </mesh>
  );
}
```

---

## Complete R3F Example

```tsx
import { Suspense, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import {
  ThreeLensProvider,
  createR3FConnector,
  useDevtoolEntity,
  useFPS,
} from '@3lens/react-bridge';

// Create connector
const ThreeLensR3F = createR3FConnector(useThree, useFrame);

function Box({ position, name }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useDevtoolEntity(meshRef.current, {
    name,
    module: 'scene/primitives',
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function FPSCounter() {
  const fps = useFPS();
  return (
    <div style={{ position: 'absolute', top: 10, left: 10, color: 'white' }}>
      FPS: {fps.current.toFixed(0)}
    </div>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.5, 0, 0]} name="Left Box" />
      <Box position={[0, 0, 0]} name="Center Box" />
      <Box position={[1.5, 0, 0]} name="Right Box" />
      <OrbitControls />
    </>
  );
}

export default function App() {
  return (
    <ThreeLensProvider
      config={{
        appName: 'R3F Demo',
        showOverlay: true,
        toggleShortcut: 'ctrl+shift+d',
      }}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas camera={{ position: [0, 2, 5] }}>
          <ThreeLensR3F />
          <Suspense fallback={null}>
            <Scene />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        <FPSCounter />
      </div>
    </ThreeLensProvider>
  );
}
```

---

## Troubleshooting

### "useThree must be called inside Canvas"

Make sure `createR3FConnector` is called outside your component, and the resulting component is rendered inside `<Canvas>`:

```tsx
// ✅ Correct
const ThreeLensR3F = createR3FConnector(useThree, useFrame);

function App() {
  return (
    <Canvas>
      <ThreeLensR3F /> {/* Inside Canvas */}
    </Canvas>
  );
}

// ❌ Wrong
function App() {
  const ThreeLensR3F = createR3FConnector(useThree, useFrame); // Don't create inside component
  return <Canvas>...</Canvas>;
}
```

### Overlay Not Showing

Ensure the provider wraps the Canvas:

```tsx
// ✅ Correct
<ThreeLensProvider>
  <Canvas>...</Canvas>
</ThreeLensProvider>

// ❌ Wrong
<Canvas>
  <ThreeLensProvider>...</ThreeLensProvider>
</Canvas>
```

### Performance Issues

If you experience performance drops:

1. Use `sampleRate` option in `useMetric` hooks
2. Avoid creating new functions in render (use `useCallback`)
3. Consider `useFPS(false)` for raw values without smoothing overhead

## Related

- [ThreeLensCanvas](./three-lens-canvas.md) - Drop-in Canvas replacement
- [ThreeLensProvider](./three-lens-provider.md) - Context provider
- [useDevtoolEntity](./use-devtool-entity.md) - Entity registration
