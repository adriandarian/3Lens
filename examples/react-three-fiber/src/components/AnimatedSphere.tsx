import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDevtoolEntity, useFPS, useDrawCalls } from '@3lens/react-bridge';
import * as THREE from 'three';

interface AnimatedSphereProps {
  position?: [number, number, number];
}

/**
 * Animated Sphere Component
 * 
 * Demonstrates:
 * - useDevtoolEntity hook for registration
 * - useFPS and useDrawCalls hooks for metrics
 * - Bouncing animation
 */
export function AnimatedSphere({ position = [0, 0, 0] }: AnimatedSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // Get real-time metrics from 3Lens
  const fps = useFPS();
  const drawCalls = useDrawCalls();
  
  // Register with 3Lens
  useDevtoolEntity(meshRef, {
    name: 'AnimatedSphere',
    module: 'scene/objects',
    tags: ['animated', 'physics-like'],
    metadata: {
      description: 'A sphere with bouncing animation',
      currentFPS: fps,
      currentDrawCalls: drawCalls,
    },
  });
  
  // Bouncing animation
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.abs(Math.sin(t * 2)) * 0.5;
      meshRef.current.rotation.z = Math.sin(t) * 0.2;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} castShadow>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshPhysicalMaterial
        color="#9b59b6"
        roughness={0.1}
        metalness={0.8}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

