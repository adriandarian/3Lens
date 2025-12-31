import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

import { RotatingBox } from './RotatingBox';
import { AnimatedSphere } from './AnimatedSphere';
import { Ground } from './Ground';
import { Lights } from './Lights';
import { TorusGroup } from './TorusGroup';

/**
 * Main Scene Component
 * 
 * Contains all 3D objects and demonstrates various Three.js features
 * that 3Lens can inspect and monitor.
 */
export function Scene() {
  return (
    <>
      {/* Lighting */}
      <Lights />
      
      {/* Environment for reflections */}
      <Environment preset="city" />
      
      {/* Ground plane with contact shadows */}
      <Ground />
      <ContactShadows
        position={[0, -0.49, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />
      
      {/* Animated objects */}
      <RotatingBox position={[-2, 1, 0]} />
      <AnimatedSphere position={[2, 1, 0]} />
      <TorusGroup position={[0, 2, -2]} />
      
      {/* Camera controls */}
      <OrbitControls 
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={20}
      />
    </>
  );
}

