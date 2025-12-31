'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TorusGroupProps {
  position?: [number, number, number];
}

export function TorusGroup({ position = [0, 0, 0] }: TorusGroupProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const torus1Ref = useRef<THREE.Mesh>(null!);
  const torus2Ref = useRef<THREE.Mesh>(null!);
  const torus3Ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3;
    }

    if (torus1Ref.current) torus1Ref.current.rotation.x = t * 2;
    if (torus2Ref.current) torus2Ref.current.rotation.x = t * 2 + Math.PI * 0.66;
    if (torus3Ref.current) torus3Ref.current.rotation.x = t * 2 + Math.PI * 1.33;
  });

  const torusArgs: [number, number, number, number] = [0.5, 0.15, 16, 32];

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={torus1Ref} position={[1.5, 0, 0]} castShadow>
        <torusGeometry args={torusArgs} />
        <meshStandardMaterial color="#e74c3c" roughness={0.4} />
      </mesh>

      <mesh ref={torus2Ref} position={[-0.75, 1.3, 0]} castShadow>
        <torusGeometry args={torusArgs} />
        <meshStandardMaterial color="#2ecc71" roughness={0.4} />
      </mesh>

      <mesh ref={torus3Ref} position={[-0.75, -1.3, 0]} castShadow>
        <torusGeometry args={torusArgs} />
        <meshStandardMaterial color="#3498db" roughness={0.4} />
      </mesh>
    </group>
  );
}

