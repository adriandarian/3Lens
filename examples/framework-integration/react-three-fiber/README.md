# 3Lens React Three Fiber Example

This example demonstrates how to integrate 3Lens devtools with a React Three Fiber (R3F) application.

## Features Demonstrated

- **ThreeLensProvider**: Context provider for 3Lens probe
- **ThreeLensCanvas**: R3F Canvas wrapper with automatic 3Lens setup
- **useDevtoolEntity**: Hook for registering entities with the devtool
- **useFPS / useDrawCalls**: Real-time performance metric hooks
- **Animated components**: Rotating box, bouncing sphere, orbital torus group
- **Lighting setup**: Ambient, directional (with shadows), and point lights
- **Interactive meshes**: Hover and click states

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-react-three-fiber dev
```

Or run all examples:

```bash
pnpm dev
```

## Code Structure

```
src/
├── main.tsx           # React entry point
├── App.tsx            # Main app with ThreeLensProvider
└── components/
    ├── Scene.tsx      # Main scene composition
    ├── RotatingBox.tsx    # Animated box with useDevtoolEntity
    ├── AnimatedSphere.tsx # Bouncing sphere with metrics hooks
    ├── TorusGroup.tsx     # Group of orbital toruses
    ├── Ground.tsx         # Ground plane
    ├── Lights.tsx         # Scene lighting
    └── LoadingFallback.tsx # Suspense fallback
```

## Key Integration Points

### 1. Wrap Your App with ThreeLensProvider

```tsx
import { ThreeLensProvider } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider appName="My App">
      {/* Your app content */}
    </ThreeLensProvider>
  );
}
```

### 2. Use ThreeLensCanvas Instead of Canvas

```tsx
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider>
      <ThreeLensCanvas shadows camera={{ position: [5, 5, 8] }}>
        <Scene />
      </ThreeLensCanvas>
    </ThreeLensProvider>
  );
}
```

### 3. Register Entities with useDevtoolEntity

```tsx
import { useDevtoolEntity } from '@3lens/react-bridge';

function MyMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useDevtoolEntity(meshRef, {
    name: 'MyMesh',
    module: 'scene/objects',
    tags: ['animated'],
    metadata: { description: 'My custom mesh' },
  });
  
  return <mesh ref={meshRef}>...</mesh>;
}
```

### 4. Access Real-time Metrics

```tsx
import { useFPS, useDrawCalls, useTriangles } from '@3lens/react-bridge';

function PerformanceDisplay() {
  const fps = useFPS();
  const drawCalls = useDrawCalls();
  const triangles = useTriangles();
  
  return (
    <Html>
      <div>FPS: {fps}</div>
      <div>Draw Calls: {drawCalls}</div>
      <div>Triangles: {triangles}</div>
    </Html>
  );
}
```

## 3Lens Features Available

Once running, use the 3Lens overlay to:

- **Scene Panel**: Inspect the scene graph hierarchy
- **Performance Panel**: Monitor FPS, draw calls, triangles
- **Memory Panel**: Track texture and geometry memory
- **Resources Panel**: View resource lifecycle events
- **Transform Gizmo**: Manipulate object transforms
- **Camera Controls**: Focus on objects, switch cameras

## Dependencies

- `@3lens/core` - Core devtool probe
- `@3lens/overlay` - Floating overlay UI
- `@3lens/react-bridge` - React/R3F integration hooks
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful R3F helpers

