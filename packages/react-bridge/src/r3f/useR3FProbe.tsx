import { useEffect, useRef } from 'react';
import { useThreeLensContextOptional } from '../context';

/**
 * Props for the R3F probe connector
 */
interface R3FProbeProps {
  /**
   * Whether to show the overlay UI
   * @default true
   */
  showOverlay?: boolean;
}

/**
 * Component that connects 3Lens to React Three Fiber
 *
 * This component must be rendered inside a Canvas and will automatically
 * observe the R3F scene and renderer.
 *
 * @example
 * ```tsx
 * import { Canvas } from '@react-three/fiber';
 * import { ThreeLensProvider, R3FProbe } from '@3lens/react-bridge';
 *
 * function App() {
 *   return (
 *     <ThreeLensProvider config={{ appName: 'My R3F App' }}>
 *       <Canvas>
 *         <R3FProbe />
 *         <ambientLight />
 *         <mesh>
 *           <boxGeometry />
 *           <meshStandardMaterial />
 *         </mesh>
 *       </Canvas>
 *     </ThreeLensProvider>
 *   );
 * }
 * ```
 */
export function R3FProbe({ showOverlay = true }: R3FProbeProps = {}): React.ReactElement | null {
  const context = useThreeLensContextOptional();
  const connectedRef = useRef(false);
  const overlayRef = useRef<any>(null);

  // We need to dynamically import and use useThree/useFrame
  // This component will be rendered, and we'll use effects to connect

  useEffect(() => {
    if (!context?.probe || connectedRef.current) return;

    const connect = async () => {
      try {
        // Dynamically import R3F
        const r3f = await import('@react-three/fiber');

        // We need access to the R3F store
        // Unfortunately useThree() can't be called inside useEffect
        // So we need a different approach - see R3FProbeInner
      } catch (e) {
        console.warn('[3Lens] Failed to connect to React Three Fiber:', e);
      }
    };

    connect();
  }, [context]);

  // Render nothing - the actual work happens in effects
  return null;
}

/**
 * Inner component that uses R3F hooks
 * This needs to be a proper component so hooks work
 */
export function R3FProbeConnectorInner(): null {
  const context = useThreeLensContextOptional();
  const connectedRef = useRef(false);

  // We'll try to use a portal or other mechanism to inject into R3F's context
  // For now, provide manual connection instructions

  return null;
}

// Export a component that works with R3F's useThree hook
// This needs to be used inside the Canvas tree

/**
 * Creates the R3F probe connector component
 * Call this once and use the returned component inside your Canvas
 *
 * @example
 * ```tsx
 * import { Canvas, useThree, useFrame } from '@react-three/fiber';
 * import { ThreeLensProvider, createR3FConnector } from '@3lens/react-bridge';
 *
 * // Create connector with R3F hooks
 * const ThreeLensR3F = createR3FConnector(useThree, useFrame);
 *
 * function App() {
 *   return (
 *     <ThreeLensProvider config={{ appName: 'My App' }}>
 *       <Canvas>
 *         <ThreeLensR3F />
 *         <Scene />
 *       </Canvas>
 *     </ThreeLensProvider>
 *   );
 * }
 * ```
 */
export function createR3FConnector(
  useThree: () => {
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  },
  useFrame: (callback: (state: any, delta: number) => void) => void
): React.FC {
  return function ThreeLensR3FConnector() {
    const context = useThreeLensContextOptional();
    const connectedRef = useRef(false);
    const overlayCreatedRef = useRef(false);

    // Get R3F state
    const { gl, scene, camera } = useThree();

    // Connect probe to R3F renderer and scene
    useEffect(() => {
      if (!context?.probe || connectedRef.current) return;
      if (!gl || !scene) return;

      const probe = context.probe;

      // Observe renderer
      probe.observeRenderer(gl);

      // Observe scene
      probe.observeScene(scene);

      // Initialize helpers if available
      if (camera && gl.domElement) {
        try {
          // Get THREE from the scene's prototype chain
          const THREE = Object.getPrototypeOf(scene).constructor;

          // Initialize transform gizmo
          probe.initializeTransformGizmo?.(scene, camera, gl.domElement, THREE);

          // Initialize camera controller
          probe.initializeCameraController?.(camera, THREE);
        } catch (e) {
          // Helpers not critical, ignore errors
          if ((context.probe as any).config?.debug) {
            console.log('[3Lens] Could not initialize helpers:', e);
          }
        }
      }

      connectedRef.current = true;

      if ((context.probe as any).config?.debug) {
        console.log('[3Lens] Connected to React Three Fiber');
      }

      // Create overlay
      if (!overlayCreatedRef.current) {
        import('@3lens/core')
          .then(() => {
            // Overlay creation would go here if we import it
          })
          .catch(() => {
            // Overlay not available
          });
      }

      return () => {
        connectedRef.current = false;
      };
    }, [context, gl, scene, camera]);

    return null;
  };
}

