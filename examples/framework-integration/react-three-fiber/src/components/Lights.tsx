import { useRef } from 'react';
import { useDevtoolEntity } from '@3lens/react-bridge';
import * as THREE from 'three';

/**
 * Lights Component
 * 
 * Sets up scene lighting with ambient, directional, and point lights.
 */
export function Lights() {
  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const directionalRef = useRef<THREE.DirectionalLight>(null!);
  const pointRef = useRef<THREE.PointLight>(null!);
  
  useDevtoolEntity(ambientRef, {
    name: 'AmbientLight',
    module: 'scene/lights',
    tags: ['lighting'],
  });
  
  useDevtoolEntity(directionalRef, {
    name: 'MainDirectionalLight',
    module: 'scene/lights',
    tags: ['lighting', 'shadows'],
    metadata: {
      purpose: 'Main scene illumination with shadows',
    },
  });
  
  useDevtoolEntity(pointRef, {
    name: 'AccentPointLight',
    module: 'scene/lights',
    tags: ['lighting', 'accent'],
  });
  
  return (
    <>
      {/* Ambient fill light */}
      <ambientLight ref={ambientRef} intensity={0.3} />
      
      {/* Main directional light with shadows */}
      <directionalLight
        ref={directionalRef}
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Accent point light */}
      <pointLight
        ref={pointRef}
        position={[-3, 3, 2]}
        intensity={0.5}
        color="#ff7f50"
      />
    </>
  );
}

