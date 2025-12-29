# @3lens/react-bridge

React and React Three Fiber integration for 3Lens - the three.js devtool.

## Installation

```bash
npm install @3lens/react-bridge @3lens/core @3lens/overlay
# or
pnpm add @3lens/react-bridge @3lens/core @3lens/overlay
```

## Quick Start

### With React Three Fiber

```tsx
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { ThreeLensProvider, createR3FConnector } from '@3lens/react-bridge';
import { createOverlay } from '@3lens/overlay';

// Create the R3F connector with R3F's hooks
const ThreeLensR3F = createR3FConnector(useThree, useFrame);

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'My R3F App' }}>
      <Canvas>
        <ThreeLensR3F />
        <ambientLight />
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </ThreeLensProvider>
  );
}
```

### With Vanilla Three.js + React

```tsx
import { ThreeLensProvider, useThreeLensProbe } from '@3lens/react-bridge';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const probe = useThreeLensProbe();

  useEffect(() => {
    const renderer = new THREE.WebGLRenderer();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

    // Connect 3Lens
    probe.observeRenderer(renderer);
    probe.observeScene(scene);

    // Your scene setup...
    containerRef.current?.appendChild(renderer.domElement);

    return () => {
      renderer.dispose();
    };
  }, [probe]);

  return <div ref={containerRef} />;
}

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'My App' }}>
      <ThreeScene />
    </ThreeLensProvider>
  );
}
```

## Hooks

### `useThreeLensProbe()`

Access the probe instance directly.

```tsx
function MyComponent() {
  const probe = useThreeLensProbe();

  const handleSnapshot = () => {
    const snapshot = probe.takeSnapshot();
    console.log('Scene has', snapshot.root.children.length, 'objects');
  };

  return <button onClick={handleSnapshot}>Take Snapshot</button>;
}
```

### `useSelectedObject()`

Access and manage the currently selected object.

```tsx
function SelectionPanel() {
  const { selectedNode, hasSelection, clear } = useSelectedObject();

  if (!hasSelection) {
    return <div>Select an object in the scene</div>;
  }

  return (
    <div>
      <h3>{selectedNode?.ref.name || 'Unnamed'}</h3>
      <p>Type: {selectedNode?.ref.type}</p>
      <button onClick={clear}>Deselect</button>
    </div>
  );
}
```

### `useMetric(extractor, options?)`

Extract and track specific metrics from frame stats.

```tsx
function CustomMetric() {
  const gpuTime = useMetric(
    (stats) => stats.gpuTimeMs ?? 0,
    { smoothed: true, smoothingSamples: 30 }
  );

  return <div>GPU Time: {gpuTime.current.toFixed(2)}ms</div>;
}
```

### Convenience Metric Hooks

```tsx
function PerformanceHUD() {
  const fps = useFPS(true);           // Smoothed FPS
  const frameTime = useFrameTime();   // Frame time in ms
  const drawCalls = useDrawCalls();   // Draw call count
  const triangles = useTriangles();   // Triangle count
  const gpuMem = useGPUMemory();      // GPU memory estimate

  return (
    <div className="hud">
      <div>FPS: {fps.current.toFixed(0)} (min: {fps.min.toFixed(0)})</div>
      <div>Frame: {frameTime.current.toFixed(1)}ms</div>
      <div>Draws: {drawCalls.current}</div>
      <div>Tris: {(triangles.current / 1000).toFixed(1)}K</div>
      <div>GPU: {(gpuMem.current / 1024 / 1024).toFixed(1)}MB</div>
    </div>
  );
}
```

### `useDevtoolEntity(object, options)`

Register objects with meaningful names and metadata.

```tsx
function Player({ position }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useDevtoolEntity(meshRef.current, {
    name: 'Player',
    module: 'game/entities',
    metadata: { health: 100, level: 5 },
    tags: ['player', 'controllable'],
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}
```

## API Reference

### `<ThreeLensProvider>`

Main provider component that initializes the probe.

```tsx
<ThreeLensProvider
  config={{
    appName: 'My App',
    debug: false,
    showOverlay: true,
    toggleShortcut: 'ctrl+shift+d',
  }}
>
  {children}
</ThreeLensProvider>
```

### `createR3FConnector(useThree, useFrame)`

Creates a connector component for React Three Fiber. Pass R3F's hooks to enable integration.

```tsx
import { useThree, useFrame } from '@react-three/fiber';
import { createR3FConnector } from '@3lens/react-bridge';

const ThreeLensR3F = createR3FConnector(useThree, useFrame);
```

## TypeScript

All hooks and components are fully typed. Import types as needed:

```tsx
import type {
  ThreeLensContextValue,
  MetricValue,
  EntityOptions,
  FrameStats,
  SceneNode,
} from '@3lens/react-bridge';
```

## License

MIT

