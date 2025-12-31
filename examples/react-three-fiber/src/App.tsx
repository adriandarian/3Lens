import { Suspense } from 'react';
import { ThreeLensProvider, ThreeLensCanvas } from '@3lens/react-bridge';
import { Scene } from './components/Scene';
import { LoadingFallback } from './components/LoadingFallback';

/**
 * Main App Component
 * 
 * Demonstrates 3Lens integration with React Three Fiber using:
 * - ThreeLensProvider: Provides probe context to all children
 * - ThreeLensCanvas: R3F Canvas wrapper with automatic 3Lens setup
 */
export default function App() {
  return (
    <ThreeLensProvider 
      appName="R3F Example"
      debug={true}
    >
      <ThreeLensCanvas
        shadows
        camera={{ position: [5, 5, 8], fov: 60 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene />
        </Suspense>
      </ThreeLensCanvas>
    </ThreeLensProvider>
  );
}

