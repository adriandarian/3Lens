---
title: React Three Fiber Integration
description: Seamless 3Lens integration with React Three Fiber using hooks
---

# React Three Fiber

Integrate 3Lens with React Three Fiber applications using familiar React patterns.

<ExampleViewer
  src="/examples/framework-integration/react-three-fiber/"
  title="React Three Fiber Demo"
  description="A React Three Fiber scene with 3Lens integration via hooks. The probe automatically connects to the R3F canvas and scene."
  difficulty="beginner"
  github-url="https://github.com/adriandarian/3Lens/tree/main/examples/framework-integration/react-three-fiber"
  aspect-ratio="16/9"
/>

## Features Demonstrated

- **React Hooks**: `use3Lens` hook for seamless integration
- **Automatic Connection**: Hooks handle renderer/scene observation
- **Component Selection**: Click on R3F components to inspect
- **Hot Reload Support**: Works with React Fast Refresh
- **TypeScript Support**: Full type safety

## Using the React Hook

```tsx
import { Canvas } from '@react-three/fiber';
import { use3Lens } from '@3lens/react-bridge';

function Scene() {
  // The hook handles all setup automatically
  use3Lens();
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </>
  );
}

function App() {
  return (
    <Canvas>
      <Scene />
    </Canvas>
  );
}
```

## Advanced Configuration

```tsx
import { use3Lens, ThreeLensProvider } from '@3lens/react-bridge';

function Scene() {
  use3Lens({
    performance: {
      targetFPS: 60,
      warningThreshold: 45
    },
    sampling: {
      frameStatsInterval: 100
    }
  });
  
  return <>{/* Your scene */}</>;
}

// Or use the provider for app-wide configuration
function App() {
  return (
    <ThreeLensProvider config={{ enabled: true }}>
      <Canvas>
        <Scene />
      </Canvas>
    </ThreeLensProvider>
  );
}
```

## Related Examples

- [Vanilla Three.js](./vanilla-threejs) - Basic setup without frameworks
- [Vue + TresJS](./vue-tresjs) - Vue.js integration
- [Next.js SSR](./nextjs-ssr) - Server-side rendering
