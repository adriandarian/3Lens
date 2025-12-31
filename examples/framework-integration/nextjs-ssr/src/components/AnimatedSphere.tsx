'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AnimatedSphereProps {
  position?: [number, number, number];
}

export function AnimatedSphere({ position = [0, 0, 0] }: AnimatedSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const baseY = position[1];

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.position.y = baseY + Math.abs(Math.sin(t * 2)) * 0.5;
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

