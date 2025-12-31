'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RotatingBoxProps {
  position?: [number, number, number];
}

export function RotatingBox({ position = [0, 0, 0] }: RotatingBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((_, delta) => {
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

