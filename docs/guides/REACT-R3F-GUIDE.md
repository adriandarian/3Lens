# React & React Three Fiber Integration Guide

This guide covers integrating 3Lens with React applications, including React Three Fiber (R3F) projects.

## Table of Contents

- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [React Three Fiber Integration](#react-three-fiber-integration)
- [Hooks Reference](#hooks-reference)
- [Entity Registration](#entity-registration)
- [Advanced Patterns](#advanced-patterns)
- [TypeScript Support](#typescript-support)

---

## Installation

```bash
npm install @3lens/core @3lens/overlay @3lens/react-bridge
```

For React Three Fiber projects:

```bash
npm install @3lens/core @3lens/overlay @3lens/react-bridge @react-three/fiber
```

---

## Basic Setup

### ThreeLensProvider

Wrap your application with `ThreeLensProvider`:

```tsx
import React from 'react';
import { ThreeLensProvider } from '@3lens/react-bridge';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';

function App() {
  return (
    <ThreeLensProvider
      config={{
        appName: 'My R3F App',
        debug: false,
        showOverlay: true,
        toggleShortcut: 'ctrl+shift+d',
      }}
    >
      <Canvas>
        <Scene />
      </Canvas>
    </ThreeLensProvider>
  );
}

export default App;
```

### Provider Configuration

```tsx
interface ThreeLensProviderConfig {
  /**
   * Application name displayed in the devtools
   */
  appName?: string;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Show overlay on mount
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Keyboard shortcut to toggle overlay
   * @default 'ctrl+shift+d'
   */
  toggleShortcut?: string;

  /**
   * Performance rules and thresholds
   */
  rules?: {
    maxDrawCalls?: number;
    maxTriangles?: number;
    maxFrameTimeMs?: number;
    maxTextures?: number;
    maxTextureMemory?: number;
  };

  /**
   * Sampling configuration
   */
  sampling?: {
    frameStatsInterval?: number;
    snapshotInterval?: number;
    enableGpuTiming?: boolean;
    enableResourceTracking?: boolean;
  };
}
```

---

## React Three Fiber Integration

### Using ThreeLensCanvas

For the easiest R3F integration, use the pre-configured `ThreeLensCanvas`:

```tsx
import React from 'react';
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensCanvas
      config={{
        appName: 'My R3F Game',
      }}
      // Regular R3F Canvas props
      camera={{ position: [0, 0, 5] }}
      shadows
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </ThreeLensCanvas>
  );
}
```

### Manual R3F Connection

For more control, use the `useR3FConnection` hook:

```tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ThreeLensProvider, useR3FConnection } from '@3lens/react-bridge';

function SceneContent() {
  // Automatically connects probe to R3F's renderer and scene
  useR3FConnection();

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
}

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'My App' }}>
      <Canvas>
        <SceneContent />
      </Canvas>
    </ThreeLensProvider>
  );
}
```

### R3F Connector Factory

For advanced setups, create a custom connector:

```tsx
import { createR3FConnector } from '@3lens/react-bridge';
import { useThree, useFrame } from '@react-three/fiber';

// Create the connector with R3F hooks
const { R3FProbe, useR3FProbe } = createR3FConnector({
  useThree,
  useFrame,
});

function Scene() {
  // Use inside your R3F canvas
  useR3FProbe();
  
  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}
```

---

## Hooks Reference

### useThreeLensProbe

Access the probe instance directly:

```tsx
import { useThreeLensProbe } from '@3lens/react-bridge';

function MyComponent() {
  const probe = useThreeLensProbe();

  const handleExport = () => {
    const snapshot = probe.getSnapshot();
    console.log('Scene snapshot:', snapshot);
  };

  return <button onClick={handleExport}>Export Scene</button>;
}
```

### useSelectedObject

Track and control selection state:

```tsx
import { useSelectedObject } from '@3lens/react-bridge';

function SelectionInfo() {
  const { 
    selectedNode,    // Currently selected SceneNode
    selectObject,    // Function to select by UUID
    clearSelection,  // Function to clear selection
    isSelected,      // Check if a specific UUID is selected
  } = useSelectedObject();

  if (!selectedNode) {
    return <div>No object selected</div>;
  }

  return (
    <div>
      <h3>Selected: {selectedNode.name || selectedNode.uuid}</h3>
      <p>Type: {selectedNode.type}</p>
      <button onClick={clearSelection}>Clear Selection</button>
    </div>
  );
}
```

### useMetric

Subscribe to specific metrics:

```tsx
import { useMetric } from '@3lens/react-bridge';

function PerformanceDisplay() {
  const fps = useMetric('fps');
  const drawCalls = useMetric('drawCalls');
  const triangles = useMetric('triangles');

  return (
    <div className="perf-overlay">
      <span>FPS: {fps.toFixed(1)}</span>
      <span>Draws: {drawCalls}</span>
      <span>Tris: {triangles.toLocaleString()}</span>
    </div>
  );
}
```

### Convenience Metric Hooks

Pre-built hooks for common metrics:

```tsx
import {
  useFPS,
  useFrameTime,
  useDrawCalls,
  useTriangles,
  useGPUMemory,
  useTextureCount,
  useGeometryCount,
} from '@3lens/react-bridge';

function Metrics() {
  const fps = useFPS();
  const frameTime = useFrameTime();
  const drawCalls = useDrawCalls();
  const triangles = useTriangles();
  const gpuMemory = useGPUMemory();
  const textureCount = useTextureCount();
  const geometryCount = useGeometryCount();

  return (
    <div>
      <p>FPS: {fps.toFixed(1)} ({frameTime.toFixed(2)}ms)</p>
      <p>Draw Calls: {drawCalls}</p>
      <p>Triangles: {triangles.toLocaleString()}</p>
      <p>GPU Memory: {(gpuMemory / 1024 / 1024).toFixed(1)}MB</p>
      <p>Textures: {textureCount}</p>
      <p>Geometries: {geometryCount}</p>
    </div>
  );
}
```

---

## Entity Registration

### useDevtoolEntity

Register Three.js objects with logical names and metadata:

```tsx
import { useRef, useEffect } from 'react';
import { useDevtoolEntity } from '@3lens/react-bridge';
import * as THREE from 'three';

function PlayerCharacter({ health, level }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Register this mesh as a logical entity
  const { entityId } = useDevtoolEntity(meshRef, {
    name: 'Player Character',
    module: '@game/characters',
    tags: ['player', 'controllable'],
    metadata: {
      health,
      level,
      class: 'warrior',
    },
  });

  return (
    <mesh ref={meshRef}>
      <capsuleGeometry args={[0.5, 1, 16, 32]} />
      <meshStandardMaterial color="#4488ff" />
    </mesh>
  );
}
```

### useDevtoolEntityGroup

Register groups of objects under one entity:

```tsx
import { useRef } from 'react';
import { useDevtoolEntityGroup } from '@3lens/react-bridge';
import * as THREE from 'three';

function EnemySquad({ squadId, enemies }) {
  const groupRef = useRef<THREE.Group>(null);

  // Register all children as part of this entity
  useDevtoolEntityGroup(groupRef, {
    name: `Enemy Squad ${squadId}`,
    module: '@game/enemies',
    tags: ['enemy', 'ai-controlled'],
    metadata: {
      squadId,
      memberCount: enemies.length,
    },
  });

  return (
    <group ref={groupRef}>
      {enemies.map((enemy, i) => (
        <Enemy key={i} {...enemy} />
      ))}
    </group>
  );
}
```

### Entity Options

```tsx
interface EntityOptions {
  /**
   * Display name in the devtools
   */
  name?: string;

  /**
   * Module identifier (e.g., '@scope/library' or 'category/name')
   */
  module?: string;

  /**
   * Custom metadata attached to the entity
   */
  metadata?: Record<string, unknown>;

  /**
   * Tags for filtering and organization
   */
  tags?: string[];

  /**
   * Component type identifier
   */
  componentType?: string;

  /**
   * Unique component instance ID
   */
  componentId?: string;

  /**
   * Parent entity ID for hierarchical organization
   */
  parentEntityId?: string;
}
```

---

## Advanced Patterns

### Conditional Debugging

Only enable 3Lens in development:

```tsx
import React from 'react';
import { ThreeLensProvider } from '@3lens/react-bridge';
import { Canvas } from '@react-three/fiber';

function App() {
  const isDev = process.env.NODE_ENV !== 'production';

  const content = (
    <Canvas>
      <Scene />
    </Canvas>
  );

  if (!isDev) {
    return content;
  }

  return (
    <ThreeLensProvider config={{ appName: 'My App' }}>
      {content}
    </ThreeLensProvider>
  );
}
```

### Multiple Scenes

Handle multiple canvases:

```tsx
import React, { useRef } from 'react';
import { ThreeLensProvider, useThreeLensProbe } from '@3lens/react-bridge';
import { Canvas, useThree } from '@react-three/fiber';

function SceneConnector({ name }) {
  const probe = useThreeLensProbe();
  const { gl, scene, camera } = useThree();

  React.useEffect(() => {
    probe.observeRenderer(gl);
    probe.observeScene(scene, { name });
  }, [gl, scene, name]);

  return null;
}

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'Multi-Scene App' }}>
      <div style={{ display: 'flex' }}>
        <Canvas style={{ flex: 1 }}>
          <SceneConnector name="Main Scene" />
          <MainScene />
        </Canvas>
        <Canvas style={{ flex: 1 }}>
          <SceneConnector name="UI Scene" />
          <UIScene />
        </Canvas>
      </div>
    </ThreeLensProvider>
  );
}
```

### Performance Monitoring Component

Create a performance HUD:

```tsx
import React, { useState, useEffect } from 'react';
import { useFPS, useDrawCalls, useTriangles, useThreeLensProbe } from '@3lens/react-bridge';
import { Html } from '@react-three/drei';

function PerformanceHUD() {
  const fps = useFPS();
  const drawCalls = useDrawCalls();
  const triangles = useTriangles();
  const probe = useThreeLensProbe();
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = probe.onRuleViolation((violation) => {
      setWarnings((prev) => [...prev.slice(-4), violation.message]);
      
      // Auto-clear after 5 seconds
      setTimeout(() => {
        setWarnings((prev) => prev.slice(1));
      }, 5000);
    });

    return unsubscribe;
  }, [probe]);

  const fpsColor = fps >= 55 ? '#4caf50' : fps >= 30 ? '#ff9800' : '#f44336';

  return (
    <Html position={[-5, 3, 0]} style={{ pointerEvents: 'none' }}>
      <div style={{
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        minWidth: '150px',
      }}>
        <div style={{ color: fpsColor }}>
          FPS: {fps.toFixed(1)}
        </div>
        <div>Draw Calls: {drawCalls}</div>
        <div>Triangles: {triangles.toLocaleString()}</div>
        
        {warnings.length > 0 && (
          <div style={{ 
            marginTop: '10px', 
            borderTop: '1px solid #666', 
            paddingTop: '10px',
            color: '#ff9800',
          }}>
            {warnings.map((w, i) => (
              <div key={i}>⚠️ {w}</div>
            ))}
          </div>
        )}
      </div>
    </Html>
  );
}
```

### Selection Handler Component

React to selection changes:

```tsx
import React, { useEffect } from 'react';
import { useSelectedObject, useThreeLensProbe } from '@3lens/react-bridge';

function SelectionHandler({ onSelect }) {
  const { selectedNode } = useSelectedObject();
  const probe = useThreeLensProbe();

  useEffect(() => {
    if (selectedNode) {
      // Get the actual Three.js object
      const object = probe.getObjectByUuid(selectedNode.uuid);
      onSelect?.(object, selectedNode);
    } else {
      onSelect?.(null, null);
    }
  }, [selectedNode, probe, onSelect]);

  return null;
}

// Usage
function App() {
  const handleSelect = (object, node) => {
    if (object) {
      console.log('Selected:', node.name, object);
    }
  };

  return (
    <ThreeLensProvider config={{ appName: 'My App' }}>
      <Canvas>
        <SelectionHandler onSelect={handleSelect} />
        <Scene />
      </Canvas>
    </ThreeLensProvider>
  );
}
```

---

## TypeScript Support

### Full Type Definitions

The package includes complete TypeScript definitions:

```tsx
import type {
  ThreeLensProviderConfig,
  ThreeLensContextValue,
  UseMetricOptions,
  MetricValue,
  EntityOptions,
  RegisteredEntity,
  DevtoolProbe,
  FrameStats,
  SceneSnapshot,
  SceneNode,
} from '@3lens/react-bridge';
```

### Generic Metric Hook

The `useMetric` hook is fully typed:

```tsx
import { useMetric } from '@3lens/react-bridge';

// Type-safe metric access
const fps = useMetric<number>('fps');
const memory = useMetric<number>('gpuMemory');

// Custom metrics
interface CustomMetrics {
  customValue: number;
}

const custom = useMetric<CustomMetrics['customValue']>('customValue');
```

### Entity Registration Types

```tsx
import { useDevtoolEntity } from '@3lens/react-bridge';
import { useRef } from 'react';
import * as THREE from 'three';

interface PlayerMetadata {
  health: number;
  mana: number;
  inventory: string[];
}

function Player() {
  const ref = useRef<THREE.Mesh>(null);

  const { entityId, update, unregister } = useDevtoolEntity(ref, {
    name: 'Player',
    module: '@game/player',
    metadata: {
      health: 100,
      mana: 50,
      inventory: ['sword', 'shield'],
    } satisfies PlayerMetadata,
  });

  // Update metadata when it changes
  const takeDamage = (amount: number) => {
    update({
      metadata: { health: 100 - amount },
    });
  };

  return (
    <mesh ref={ref}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}
```

---

## Troubleshooting

### Probe Not Available

If `useThreeLensProbe()` throws an error:

```tsx
// Use the optional version that returns null instead of throwing
import { useThreeLensProbeOptional } from '@3lens/react-bridge';

function MyComponent() {
  const probe = useThreeLensProbeOptional();
  
  if (!probe) {
    return <div>3Lens not available</div>;
  }

  // Use probe safely
}
```

### Context Outside Provider

Ensure all hooks are used within `ThreeLensProvider`:

```tsx
// ❌ Wrong - outside provider
function App() {
  const probe = useThreeLensProbe(); // Error!
  return <ThreeLensProvider>...</ThreeLensProvider>;
}

// ✅ Correct - inside provider
function App() {
  return (
    <ThreeLensProvider config={{ appName: 'My App' }}>
      <MyComponent />
    </ThreeLensProvider>
  );
}

function MyComponent() {
  const probe = useThreeLensProbe(); // Works!
  return <div>...</div>;
}
```

### Hot Reload Issues

If the probe disconnects after hot reload:

```tsx
import { useEffect } from 'react';
import { useThreeLensProbe } from '@3lens/react-bridge';
import { useThree } from '@react-three/fiber';

function ReconnectOnHMR() {
  const probe = useThreeLensProbe();
  const { gl, scene } = useThree();

  useEffect(() => {
    // Re-observe on mount (handles HMR)
    probe.observeRenderer(gl);
    probe.observeScene(scene);
  }, [probe, gl, scene]);

  return null;
}
```

---

## Examples

See the example projects for complete implementations:

- [examples/framework-integration/react-three-fiber](../examples/framework-integration/react-three-fiber)
- [examples/feature-showcase/transform-gizmo](../examples/feature-showcase/transform-gizmo)
- [examples/debugging-profiling/performance-debugging](../examples/debugging-profiling/performance-debugging)

---

## Related Guides

- [Getting Started](./GETTING-STARTED.md)
- [Plugin Development](./PLUGIN-DEVELOPMENT.md)
- [CI Integration](./CI-INTEGRATION.md)
