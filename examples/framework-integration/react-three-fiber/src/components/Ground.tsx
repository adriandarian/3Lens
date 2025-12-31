import { useDevtoolEntity } from '@3lens/react-bridge';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Ground Plane Component
 * 
 * Simple ground mesh for the scene.
 */
export function Ground() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useDevtoolEntity(meshRef, {
    name: 'Ground',
    module: 'scene/environment',
    tags: ['static'],
  });
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial 
        color="#1a1a2e" 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

