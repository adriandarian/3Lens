import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDevtoolEntity } from '@3lens/react-bridge';
import * as THREE from 'three';

interface RotatingBoxProps {
  position?: [number, number, number];
}

/**
 * Rotating Box Component
 * 
 * Demonstrates:
 * - useDevtoolEntity hook for entity registration
 * - Animation with useFrame
 * - Interactive hover/click states
 */
export function RotatingBox({ position = [0, 0, 0] }: RotatingBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Register this mesh with 3Lens devtool
  useDevtoolEntity(meshRef, {
    name: 'RotatingBox',
    module: 'scene/objects',
    tags: ['animated', 'interactive'],
    metadata: {
      description: 'A box that rotates and responds to hover/click',
      animationSpeed: 0.01,
    },
  });
  
  // Animate rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={clicked ? 1.2 : 1}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial
        color={hovered ? '#ff6b6b' : '#4ecdc4'}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  );
}

