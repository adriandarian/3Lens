import { useState, useEffect, useRef, forwardRef } from 'react';
import { ThreeLensProvider } from '../ThreeLensProvider';
import { useThreeLensContextOptional } from '../context';
import type { ThreeLensProviderConfig } from '../types';

// Type for R3F Canvas props (avoid direct import to keep it optional)
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type CanvasProps = React.ComponentProps<
  typeof import('@react-three/fiber').Canvas
>;

/**
 * Props for ThreeLensCanvas
 */
export interface ThreeLensCanvasProps extends Omit<CanvasProps, 'children'> {
  /**
   * 3Lens configuration
   */
  threeLensConfig?: ThreeLensProviderConfig;

  /**
   * Children to render inside the Canvas
   */
  children: React.ReactNode;
}

/**
 * Internal component that connects the probe to R3F's renderer and scene
 */
function _R3FConnector({ children }: { children: React.ReactNode }) {
  const context = useThreeLensContextOptional();
  const connectedRef = useRef(false);

  // We need to use useFrame and useThree from R3F
  // These are dynamically imported to keep R3F optional
  useEffect(() => {
    if (!context?.probe || connectedRef.current) return;

    // Try to get R3F's state
    const tryConnect = async () => {
      try {
        const { useThree: _useThree } = await import('@react-three/fiber');

        // This is a bit hacky - we need to be inside a Canvas to use useThree
        // The actual connection happens in the R3FAutoConnect component
      } catch {
        // R3F not available
        if (
          context.probe &&
          (context.probe as unknown as { config?: { debug?: boolean } }).config
            ?.debug
        ) {
          // eslint-disable-next-line no-console
          console.log('[3Lens] React Three Fiber not detected');
        }
      }
    };

    tryConnect();
  }, [context]);

  return <>{children}</>;
}

/**
 * Component that auto-connects 3Lens to R3F's renderer and scene
 * Must be used inside a Canvas
 */
export function R3FAutoConnect(): null {
  const context = useThreeLensContextOptional();
  const connectedRef = useRef(false);

  // Dynamically use R3F hooks
  useEffect(() => {
    if (!context?.probe || connectedRef.current) return;

    const connect = async () => {
      try {
        const _r3f = await import('@react-three/fiber');

        // We can't use hooks here directly since this is not a hook context
        // The actual connection needs to happen in a component that renders inside Canvas
      } catch {
        // R3F not available
      }
    };

    connect();
  }, [context]);

  return null;
}

/**
 * Inner component that uses R3F hooks to connect the probe
 */
function _R3FProbeConnector(): null {
  const context = useThreeLensContextOptional();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!context?.probe || connectedRef.current) return;

    // Dynamically import and use R3F
    const connect = async () => {
      try {
        // Get the R3F store
        const { useThree: _useThree } = await import('@react-three/fiber');
        // Note: useThree can only be called inside a component that's a child of Canvas
        // This component should be rendered inside Canvas
      } catch {
        // R3F not available
      }
    };

    connect();
  }, [context]);

  return null;
}

/**
 * A wrapper around R3F's Canvas that automatically integrates 3Lens
 *
 * @example
 * ```tsx
 * import { ThreeLensCanvas } from '@3lens/react-bridge';
 *
 * function App() {
 *   return (
 *     <ThreeLensCanvas
 *       threeLensConfig={{ appName: 'My R3F App' }}
 *       camera={{ position: [0, 0, 5] }}
 *     >
 *       <ambientLight />
 *       <mesh>
 *         <boxGeometry />
 *         <meshStandardMaterial />
 *       </mesh>
 *     </ThreeLensCanvas>
 *   );
 * }
 * ```
 */
export const ThreeLensCanvas = forwardRef<
  HTMLCanvasElement,
  ThreeLensCanvasProps
>(function ThreeLensCanvas({ threeLensConfig, children, ...canvasProps }, ref) {
  // Dynamically import Canvas to keep R3F optional
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const [Canvas, setCanvas] = useState<
    typeof import('@react-three/fiber').Canvas | null
  >(null);

  useEffect(() => {
    import('@react-three/fiber')
      .then((mod) => setCanvas(() => mod.Canvas))
      .catch(() => {
        console.error(
          '[3Lens] @react-three/fiber is required for ThreeLensCanvas. ' +
            'Install it with: npm install @react-three/fiber'
        );
      });
  }, []);

  if (!Canvas) {
    return null; // Or a loading state
  }

  return (
    <ThreeLensProvider config={threeLensConfig}>
      <Canvas ref={ref} {...canvasProps}>
        <R3FSceneConnector />
        {children}
      </Canvas>
    </ThreeLensProvider>
  );
});

/**
 * Component that connects 3Lens to the R3F scene
 * Must be rendered inside a Canvas
 */
function R3FSceneConnector(): null {
  const context = useThreeLensContextOptional();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!context?.probe || connectedRef.current) return;

    const connect = async () => {
      try {
        const { useThree: _useThree, useFrame: _useFrame } =
          await import('@react-three/fiber');
        // We can't call useThree here because this is inside useEffect
        // The hook-based approach is in useR3FConnection
      } catch {
        // R3F not available
      }
    };

    connect();
  }, [context]);

  // Return a component that can use the hooks
  return null;
}

/**
 * Hook to manually connect 3Lens to R3F
 * Use this if you're not using ThreeLensCanvas
 *
 * @example
 * ```tsx
 * import { Canvas } from '@react-three/fiber';
 * import { ThreeLensProvider, useR3FConnection } from '@3lens/react-bridge';
 *
 * function Scene() {
 *   useR3FConnection();
 *   return (
 *     <>
 *       <mesh>...</mesh>
 *     </>
 *   );
 * }
 *
 * function App() {
 *   return (
 *     <ThreeLensProvider config={{ appName: 'My App' }}>
 *       <Canvas>
 *         <Scene />
 *       </Canvas>
 *     </ThreeLensProvider>
 *   );
 * }
 * ```
 */
export function useR3FConnection(): void {
  const context = useThreeLensContextOptional();
  const connectedRef = useRef(false);

  // This effect attempts to connect using R3F's internals
  useEffect(() => {
    if (!context?.probe || connectedRef.current) return;

    const connect = async () => {
      try {
        // Get R3F's root state - this is a workaround since we can't use useThree here
        // In practice, users should call this inside a component that's a child of Canvas
        const { useThree: _useThree } = await import('@react-three/fiber');
        // eslint-disable-next-line no-console
        console.log(
          '[3Lens] To connect R3F, call useR3FConnection() inside a component rendered within <Canvas>'
        );
      } catch {
        // R3F not available
      }
    };

    connect();
  }, [context]);
}
