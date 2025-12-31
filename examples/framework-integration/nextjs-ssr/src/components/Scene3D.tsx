'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { RotatingBox } from './RotatingBox';
import { AnimatedSphere } from './AnimatedSphere';
import { TorusGroup } from './TorusGroup';
import { Ground } from './Ground';
import { Lights } from './Lights';
import { InfoPanel } from './InfoPanel';

/**
 * Scene3D Component
 * 
 * This component is loaded dynamically with SSR disabled.
 * It contains all Three.js/R3F code that cannot run on the server.
 */
export default function Scene3D() {
  const [isClient, setIsClient] = useState(false);
  const [fps, setFps] = useState(0);
  const [drawCalls, setDrawCalls] = useState(0);
  const [triangles, setTriangles] = useState(0);

  // Ensure we're on the client
  useEffect(() => {
    setIsClient(true);
    
    // Start metrics collection
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateMetrics = () => {
      frameCount++;
      const now = performance.now();
      const elapsed = now - lastTime;
      
      if (elapsed >= 1000) {
        setFps(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        lastTime = now;
        
        // Simulated values - in production, get from renderer.info
        setDrawCalls(Math.floor(10 + Math.random() * 5));
        setTriangles(Math.floor(5400 + Math.random() * 200));
      }
      
      requestAnimationFrame(updateMetrics);
    };
    
    const animId = requestAnimationFrame(updateMetrics);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [5, 5, 8], fov: 60 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Suspense fallback={null}>
          <Lights />
          <Environment preset="city" />
          <Ground />
          <ContactShadows
            position={[0, -0.49, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />
          <RotatingBox position={[-2, 1, 0]} />
          <AnimatedSphere position={[2, 1, 0]} />
          <TorusGroup position={[0, 2, -2]} />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
      
      <InfoPanel 
        fps={fps} 
        drawCalls={drawCalls} 
        triangles={triangles} 
      />
    </>
  );
}

