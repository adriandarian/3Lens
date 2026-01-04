# Code Examples

This page provides ready-to-use code examples for common 3Lens patterns. All examples are available in TypeScript and JavaScript, with ESM and CommonJS module formats.

## Table of Contents

- [Quick Start Examples](#quick-start-examples)
- [Common Patterns](#common-patterns)
- [Framework Examples](#framework-examples)
- [Advanced Patterns](#advanced-patterns)
- [Runnable Examples](#runnable-examples)

---

## Quick Start Examples

### Basic Setup

The simplest way to get started with 3Lens.

::: code-group

```typescript [TypeScript (ESM)]
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

// Create the probe
const probe = createProbe({
  appName: 'My Three.js App',
});

// Create renderer and scene
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Connect 3Lens
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Add the overlay UI
bootstrapOverlay(probe, renderer.domElement);

// Your render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

```javascript [JavaScript (ESM)]
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

// Create the probe
const probe = createProbe({
  appName: 'My Three.js App',
});

// Create renderer and scene
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Connect 3Lens
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Add the overlay UI
bootstrapOverlay(probe, renderer.domElement);

// Your render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

```typescript [TypeScript (CJS)]
import * as THREE from 'three';
const { createProbe } = require('@3lens/core');
const { bootstrapOverlay } = require('@3lens/overlay');

// Create the probe
const probe = createProbe({
  appName: 'My Three.js App',
});

// Create renderer and scene
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Connect 3Lens
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Add the overlay UI
bootstrapOverlay(probe, renderer.domElement);
```

```javascript [JavaScript (CJS)]
const THREE = require('three');
const { createProbe } = require('@3lens/core');
const { bootstrapOverlay } = require('@3lens/overlay');

// Create the probe
const probe = createProbe({
  appName: 'My Three.js App',
});

// Create renderer and scene
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Connect 3Lens
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Add the overlay UI
bootstrapOverlay(probe, renderer.domElement);
```

:::

### Development-Only Setup

Only load 3Lens in development mode to avoid production overhead.

::: code-group

```typescript [TypeScript (ESM)]
import * as THREE from 'three';
import type { DevtoolProbe } from '@3lens/core';

let probe: DevtoolProbe | null = null;

async function initDevtools(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  // Only load in development
  if (import.meta.env.DEV) {
    const { createProbe } = await import('@3lens/core');
    const { bootstrapOverlay } = await import('@3lens/overlay');
    
    probe = createProbe({
      appName: 'My App',
      env: 'development',
      debug: true,
    });
    
    probe.observeRenderer(renderer);
    probe.observeScene(scene);
    bootstrapOverlay(probe, renderer.domElement);
  }
}

// Usage
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
await initDevtools(renderer, scene);
```

```javascript [JavaScript (ESM)]
import * as THREE from 'three';

let probe = null;

async function initDevtools(renderer, scene) {
  // Only load in development
  if (import.meta.env.DEV) {
    const { createProbe } = await import('@3lens/core');
    const { bootstrapOverlay } = await import('@3lens/overlay');
    
    probe = createProbe({
      appName: 'My App',
      env: 'development',
      debug: true,
    });
    
    probe.observeRenderer(renderer);
    probe.observeScene(scene);
    bootstrapOverlay(probe, renderer.domElement);
  }
}

// Usage
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
await initDevtools(renderer, scene);
```

```typescript [TypeScript (CJS)]
import * as THREE from 'three';
import type { DevtoolProbe } from '@3lens/core';

let probe: DevtoolProbe | null = null;

async function initDevtools(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  // Only load in development
  if (process.env.NODE_ENV === 'development') {
    const { createProbe } = require('@3lens/core');
    const { bootstrapOverlay } = require('@3lens/overlay');
    
    probe = createProbe({
      appName: 'My App',
      env: 'development',
      debug: true,
    });
    
    probe.observeRenderer(renderer);
    probe.observeScene(scene);
    bootstrapOverlay(probe, renderer.domElement);
  }
}
```

```javascript [JavaScript (CJS)]
const THREE = require('three');

let probe = null;

async function initDevtools(renderer, scene) {
  // Only load in development
  if (process.env.NODE_ENV === 'development') {
    const { createProbe } = require('@3lens/core');
    const { bootstrapOverlay } = require('@3lens/overlay');
    
    probe = createProbe({
      appName: 'My App',
      env: 'development',
      debug: true,
    });
    
    probe.observeRenderer(renderer);
    probe.observeScene(scene);
    bootstrapOverlay(probe, renderer.domElement);
  }
}
```

:::

---

## Common Patterns

### Monitoring Frame Stats

Subscribe to real-time performance metrics.

::: code-group

```typescript [TypeScript]
import { createProbe, type FrameStats } from '@3lens/core';

const probe = createProbe({ appName: 'Stats Monitor' });

// Subscribe to frame stats
const unsubscribe = probe.onFrameStats((stats: FrameStats) => {
  const fps = stats.performance?.fps ?? 0;
  const drawCalls = stats.drawCalls;
  const triangles = stats.triangles;
  const memory = stats.memory?.totalGpuMemory ?? 0;
  
  console.log(`FPS: ${fps.toFixed(1)} | Draw Calls: ${drawCalls} | Triangles: ${triangles}`);
  
  // Warn on low FPS
  if (fps < 30) {
    console.warn('Low FPS detected!');
  }
});

// Cleanup when done
// unsubscribe();
```

```javascript [JavaScript]
import { createProbe } from '@3lens/core';

const probe = createProbe({ appName: 'Stats Monitor' });

// Subscribe to frame stats
const unsubscribe = probe.onFrameStats((stats) => {
  const fps = stats.performance?.fps ?? 0;
  const drawCalls = stats.drawCalls;
  const triangles = stats.triangles;
  const memory = stats.memory?.totalGpuMemory ?? 0;
  
  console.log(`FPS: ${fps.toFixed(1)} | Draw Calls: ${drawCalls} | Triangles: ${triangles}`);
  
  // Warn on low FPS
  if (fps < 30) {
    console.warn('Low FPS detected!');
  }
});

// Cleanup when done
// unsubscribe();
```

:::

### Object Selection Handling

Respond to object selection changes.

::: code-group

```typescript [TypeScript]
import { createProbe, type ObjectMeta } from '@3lens/core';
import * as THREE from 'three';

const probe = createProbe({ appName: 'Selection Demo' });

// Subscribe to selection changes
probe.onSelectionChanged((object: THREE.Object3D | null, meta: ObjectMeta | null) => {
  if (object && meta) {
    console.log('Selected:', meta.name);
    console.log('Type:', meta.type);
    console.log('UUID:', meta.uuid);
    
    // Highlight selected object
    if (object instanceof THREE.Mesh) {
      const material = object.material as THREE.MeshStandardMaterial;
      material.emissive.setHex(0x333333);
    }
  } else {
    console.log('Selection cleared');
  }
});

// Programmatically select an object
function selectMesh(mesh: THREE.Mesh) {
  probe.selectObject(mesh);
}

// Clear selection
function clearSelection() {
  probe.selectObject(null);
}
```

```javascript [JavaScript]
import { createProbe } from '@3lens/core';
import * as THREE from 'three';

const probe = createProbe({ appName: 'Selection Demo' });

// Subscribe to selection changes
probe.onSelectionChanged((object, meta) => {
  if (object && meta) {
    console.log('Selected:', meta.name);
    console.log('Type:', meta.type);
    console.log('UUID:', meta.uuid);
    
    // Highlight selected object
    if (object instanceof THREE.Mesh) {
      object.material.emissive.setHex(0x333333);
    }
  } else {
    console.log('Selection cleared');
  }
});

// Programmatically select an object
function selectMesh(mesh) {
  probe.selectObject(mesh);
}

// Clear selection
function clearSelection() {
  probe.selectObject(null);
}
```

:::

### Custom Performance Rules

Define custom rules to catch performance issues.

::: code-group

```typescript [TypeScript]
import { createProbe, type CustomRule, type RuleContext, type RuleResult } from '@3lens/core';

// Define custom rules
const customRules: CustomRule[] = [
  {
    id: 'min-fps',
    name: 'Minimum FPS',
    description: 'Warn when FPS drops below 30',
    evaluate: (ctx: RuleContext): RuleResult => {
      const fps = ctx.frameStats.performance?.fps ?? 60;
      return {
        passed: fps >= 30,
        value: fps,
        threshold: 30,
        message: fps < 30 ? `FPS dropped to ${fps.toFixed(1)}` : undefined,
        severity: fps < 20 ? 'critical' : 'warning',
      };
    },
  },
  {
    id: 'max-draw-calls-per-object',
    name: 'Draw Calls per Object',
    description: 'Check average draw calls per visible object',
    evaluate: (ctx: RuleContext): RuleResult => {
      const { drawCalls } = ctx.frameStats;
      const objectCount = ctx.sceneStats.visibleObjects;
      const ratio = objectCount > 0 ? drawCalls / objectCount : 0;
      return {
        passed: ratio <= 2,
        value: ratio,
        threshold: 2,
        message: ratio > 2 ? `High draw call ratio: ${ratio.toFixed(2)} per object` : undefined,
      };
    },
  },
];

// Create probe with custom rules
const probe = createProbe({
  appName: 'Custom Rules Demo',
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 200000,
    customRules,
  },
});

// Listen for violations
probe.onRuleViolation((violation) => {
  console.warn(`Rule violated: ${violation.ruleId}`);
  console.warn(`Message: ${violation.message}`);
  console.warn(`Severity: ${violation.severity}`);
});
```

```javascript [JavaScript]
import { createProbe } from '@3lens/core';

// Define custom rules
const customRules = [
  {
    id: 'min-fps',
    name: 'Minimum FPS',
    description: 'Warn when FPS drops below 30',
    evaluate: (ctx) => {
      const fps = ctx.frameStats.performance?.fps ?? 60;
      return {
        passed: fps >= 30,
        value: fps,
        threshold: 30,
        message: fps < 30 ? `FPS dropped to ${fps.toFixed(1)}` : undefined,
        severity: fps < 20 ? 'critical' : 'warning',
      };
    },
  },
  {
    id: 'max-draw-calls-per-object',
    name: 'Draw Calls per Object',
    description: 'Check average draw calls per visible object',
    evaluate: (ctx) => {
      const { drawCalls } = ctx.frameStats;
      const objectCount = ctx.sceneStats.visibleObjects;
      const ratio = objectCount > 0 ? drawCalls / objectCount : 0;
      return {
        passed: ratio <= 2,
        value: ratio,
        threshold: 2,
        message: ratio > 2 ? `High draw call ratio: ${ratio.toFixed(2)} per object` : undefined,
      };
    },
  },
];

// Create probe with custom rules
const probe = createProbe({
  appName: 'Custom Rules Demo',
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 200000,
    customRules,
  },
});

// Listen for violations
probe.onRuleViolation((violation) => {
  console.warn(`Rule violated: ${violation.ruleId}`);
  console.warn(`Message: ${violation.message}`);
  console.warn(`Severity: ${violation.severity}`);
});
```

:::

### Transform Gizmo Setup

Enable object manipulation with transform gizmo.

::: code-group

```typescript [TypeScript]
import * as THREE from 'three';
import { createProbe } from '@3lens/core';

const probe = createProbe({ appName: 'Transform Demo' });

// Setup scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

probe.observeRenderer(renderer);
probe.observeScene(scene);

// Initialize transform gizmo
probe.initializeTransformGizmo(scene, camera, renderer.domElement, THREE);

// Enable transform gizmo
await probe.enableTransformGizmo();

// Set transform mode
probe.setTransformMode('translate'); // 'translate' | 'rotate' | 'scale'

// Set coordinate space
probe.setTransformSpace('world'); // 'world' | 'local'

// Enable snapping
probe.setTransformSnapEnabled(true);
probe.setTransformSnapValues(1, 15, 0.1); // translation, rotation (degrees), scale

// Listen for transform changes
probe.onTransformChange((event) => {
  console.log('Transform changed:', event.mode);
  console.log('Before:', event.before);
  console.log('After:', event.after);
});

// Undo/Redo
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'z') {
    if (e.shiftKey) {
      probe.redoTransform();
    } else {
      probe.undoTransform();
    }
  }
});
```

```javascript [JavaScript]
import * as THREE from 'three';
import { createProbe } from '@3lens/core';

const probe = createProbe({ appName: 'Transform Demo' });

// Setup scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

probe.observeRenderer(renderer);
probe.observeScene(scene);

// Initialize transform gizmo
probe.initializeTransformGizmo(scene, camera, renderer.domElement, THREE);

// Enable transform gizmo
await probe.enableTransformGizmo();

// Set transform mode
probe.setTransformMode('translate'); // 'translate' | 'rotate' | 'scale'

// Set coordinate space
probe.setTransformSpace('world'); // 'world' | 'local'

// Enable snapping
probe.setTransformSnapEnabled(true);
probe.setTransformSnapValues(1, 15, 0.1); // translation, rotation (degrees), scale

// Listen for transform changes
probe.onTransformChange((event) => {
  console.log('Transform changed:', event.mode);
  console.log('Before:', event.before);
  console.log('After:', event.after);
});
```

:::

### Camera Controls

Focus and fly-to camera animations.

::: code-group

```typescript [TypeScript]
import * as THREE from 'three';
import { createProbe } from '@3lens/core';

const probe = createProbe({ appName: 'Camera Demo' });

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Initialize camera controller
probe.initializeCameraController(camera, THREE, { x: 0, y: 0, z: 0 });

// Focus on an object instantly
function focusOn(object: THREE.Object3D) {
  probe.focusOnObject(object, 1.5); // padding multiplier
}

// Fly to an object with animation
function flyTo(object: THREE.Object3D) {
  probe.flyToObject(object, {
    duration: 1000,
    easing: 'easeInOutCubic',
    padding: 1.5,
    onComplete: () => console.log('Camera animation complete'),
  });
}

// Focus on selected object
function focusOnSelected() {
  probe.focusOnSelected(1.5);
}

// Save current camera position as home
probe.saveCurrentCameraAsHome();

// Return to home position
function goHome() {
  probe.flyHome({ duration: 800 });
}
```

```javascript [JavaScript]
import * as THREE from 'three';
import { createProbe } from '@3lens/core';

const probe = createProbe({ appName: 'Camera Demo' });

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Initialize camera controller
probe.initializeCameraController(camera, THREE, { x: 0, y: 0, z: 0 });

// Focus on an object instantly
function focusOn(object) {
  probe.focusOnObject(object, 1.5); // padding multiplier
}

// Fly to an object with animation
function flyTo(object) {
  probe.flyToObject(object, {
    duration: 1000,
    easing: 'easeInOutCubic',
    padding: 1.5,
    onComplete: () => console.log('Camera animation complete'),
  });
}

// Focus on selected object
function focusOnSelected() {
  probe.focusOnSelected(1.5);
}

// Save current camera position as home
probe.saveCurrentCameraAsHome();

// Return to home position
function goHome() {
  probe.flyHome({ duration: 800 });
}
```

:::

### Logical Entities

Group related objects under logical entities.

::: code-group

```typescript [TypeScript]
import * as THREE from 'three';
import { createProbe, type EntityId } from '@3lens/core';

const probe = createProbe({ appName: 'Entity Demo' });

// Register a logical entity
const playerId: EntityId = probe.registerLogicalEntity({
  name: 'Player',
  module: '@game/player',
  componentType: 'PlayerComponent',
  tags: ['controllable', 'saveable'],
  metadata: {
    health: 100,
    level: 5,
  },
});

// Create player meshes
const playerBody = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.5, 1.5),
  new THREE.MeshStandardMaterial({ color: 0x4488ff })
);
playerBody.name = 'PlayerBody';

const playerHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.3),
  new THREE.MeshStandardMaterial({ color: 0xffcc88 })
);
playerHead.name = 'PlayerHead';
playerHead.position.y = 1.2;

// Add objects to entity
probe.addObjectToEntity(playerId, playerBody);
probe.addObjectToEntity(playerId, playerHead);

// Query entities
const controllables = probe.filterEntities({ tags: ['controllable'] });
console.log('Controllable entities:', controllables.length);

const gameEntities = probe.filterEntities({ modulePrefix: '@game/' });
console.log('Game entities:', gameEntities.length);

// Listen for entity events
probe.onEntityEvent((event) => {
  switch (event.type) {
    case 'entity-registered':
      console.log('New entity:', event.entity?.name);
      break;
    case 'object-added':
      console.log('Object added to:', event.entityId);
      break;
  }
});
```

```javascript [JavaScript]
import * as THREE from 'three';
import { createProbe } from '@3lens/core';

const probe = createProbe({ appName: 'Entity Demo' });

// Register a logical entity
const playerId = probe.registerLogicalEntity({
  name: 'Player',
  module: '@game/player',
  componentType: 'PlayerComponent',
  tags: ['controllable', 'saveable'],
  metadata: {
    health: 100,
    level: 5,
  },
});

// Create player meshes
const playerBody = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.5, 1.5),
  new THREE.MeshStandardMaterial({ color: 0x4488ff })
);
playerBody.name = 'PlayerBody';

const playerHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.3),
  new THREE.MeshStandardMaterial({ color: 0xffcc88 })
);
playerHead.name = 'PlayerHead';
playerHead.position.y = 1.2;

// Add objects to entity
probe.addObjectToEntity(playerId, playerBody);
probe.addObjectToEntity(playerId, playerHead);

// Query entities
const controllables = probe.filterEntities({ tags: ['controllable'] });
console.log('Controllable entities:', controllables.length);

const gameEntities = probe.filterEntities({ modulePrefix: '@game/' });
console.log('Game entities:', gameEntities.length);
```

:::

### Resource Tracking & Leak Detection

Monitor resource lifecycle and detect memory leaks.

::: code-group

```typescript [TypeScript]
import { createProbe, type ResourceLifecycleEvent } from '@3lens/core';

const probe = createProbe({
  appName: 'Resource Tracker',
  sampling: {
    resourceTracking: true,
  },
});

// Subscribe to resource events
probe.onResourceEvent((event: ResourceLifecycleEvent) => {
  const emoji = {
    created: '✨',
    disposed: '🗑️',
    updated: '🔄',
    orphaned: '⚠️',
  }[event.eventType];
  
  console.log(`${emoji} ${event.eventType}: ${event.resourceType} (${event.uuid})`);
  
  if (event.eventType === 'orphaned') {
    console.warn(`Potential leak: ${event.name ?? event.uuid} is ${event.ageMs}ms old`);
  }
});

// Get lifecycle summary
function printResourceSummary() {
  const summary = probe.getResourceLifecycleSummary();
  
  console.log('=== Resource Summary ===');
  console.log(`Geometries: ${summary.geometries.active} active, ${summary.geometries.leaked} potential leaks`);
  console.log(`Materials: ${summary.materials.active} active, ${summary.materials.leaked} potential leaks`);
  console.log(`Textures: ${summary.textures.active} active, ${summary.textures.leaked} potential leaks`);
  console.log(`Total events: ${summary.totalEvents}`);
}

// Check for potential leaks
function checkForLeaks() {
  const leaks = probe.getPotentialResourceLeaks();
  
  if (leaks.length > 0) {
    console.warn(`Found ${leaks.length} potential leaks:`);
    for (const leak of leaks) {
      console.warn(`  - ${leak.type}: ${leak.name ?? leak.uuid} (${(leak.ageMs / 1000).toFixed(1)}s old)`);
    }
  }
}

// Run leak check periodically
setInterval(checkForLeaks, 30000);
```

```javascript [JavaScript]
import { createProbe } from '@3lens/core';

const probe = createProbe({
  appName: 'Resource Tracker',
  sampling: {
    resourceTracking: true,
  },
});

// Subscribe to resource events
probe.onResourceEvent((event) => {
  const emoji = {
    created: '✨',
    disposed: '🗑️',
    updated: '🔄',
    orphaned: '⚠️',
  }[event.eventType];
  
  console.log(`${emoji} ${event.eventType}: ${event.resourceType} (${event.uuid})`);
  
  if (event.eventType === 'orphaned') {
    console.warn(`Potential leak: ${event.name ?? event.uuid} is ${event.ageMs}ms old`);
  }
});

// Get lifecycle summary
function printResourceSummary() {
  const summary = probe.getResourceLifecycleSummary();
  
  console.log('=== Resource Summary ===');
  console.log(`Geometries: ${summary.geometries.active} active, ${summary.geometries.leaked} potential leaks`);
  console.log(`Materials: ${summary.materials.active} active, ${summary.materials.leaked} potential leaks`);
  console.log(`Textures: ${summary.textures.active} active, ${summary.textures.leaked} potential leaks`);
  console.log(`Total events: ${summary.totalEvents}`);
}

// Check for potential leaks
function checkForLeaks() {
  const leaks = probe.getPotentialResourceLeaks();
  
  if (leaks.length > 0) {
    console.warn(`Found ${leaks.length} potential leaks:`);
    for (const leak of leaks) {
      console.warn(`  - ${leak.type}: ${leak.name ?? leak.uuid} (${(leak.ageMs / 1000).toFixed(1)}s old)`);
    }
  }
}
```

:::

---

## Framework Examples

### React / React Three Fiber

::: code-group

```tsx [TypeScript]
import { Canvas } from '@react-three/fiber';
import { ThreeLensProvider, useDevtoolEntity, useFPS, useDrawCalls } from '@3lens/react-bridge';
import type { ProbeConfig } from '@3lens/core';

const config: ProbeConfig = {
  appName: 'R3F App',
  rules: {
    maxDrawCalls: 500,
  },
};

function App() {
  return (
    <ThreeLensProvider config={config} overlay>
      <Canvas>
        <Scene />
      </Canvas>
      <StatsOverlay />
    </ThreeLensProvider>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <Player />
      <Environment />
    </>
  );
}

function Player() {
  const ref = useDevtoolEntity<THREE.Group>({
    name: 'Player',
    tags: ['controllable'],
  });
  
  return (
    <group ref={ref}>
      <mesh position={[0, 1, 0]}>
        <capsuleGeometry args={[0.5, 1.5]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
}

function StatsOverlay() {
  const fps = useFPS();
  const drawCalls = useDrawCalls();
  
  return (
    <div style={{ position: 'absolute', top: 10, left: 10, color: 'white' }}>
      <div>FPS: {fps.toFixed(1)}</div>
      <div>Draw Calls: {drawCalls}</div>
    </div>
  );
}

export default App;
```

```jsx [JavaScript]
import { Canvas } from '@react-three/fiber';
import { ThreeLensProvider, useDevtoolEntity, useFPS, useDrawCalls } from '@3lens/react-bridge';

const config = {
  appName: 'R3F App',
  rules: {
    maxDrawCalls: 500,
  },
};

function App() {
  return (
    <ThreeLensProvider config={config} overlay>
      <Canvas>
        <Scene />
      </Canvas>
      <StatsOverlay />
    </ThreeLensProvider>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <Player />
      <Environment />
    </>
  );
}

function Player() {
  const ref = useDevtoolEntity({
    name: 'Player',
    tags: ['controllable'],
  });
  
  return (
    <group ref={ref}>
      <mesh position={[0, 1, 0]}>
        <capsuleGeometry args={[0.5, 1.5]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
}

function StatsOverlay() {
  const fps = useFPS();
  const drawCalls = useDrawCalls();
  
  return (
    <div style={{ position: 'absolute', top: 10, left: 10, color: 'white' }}>
      <div>FPS: {fps.toFixed(1)}</div>
      <div>Draw Calls: {drawCalls}</div>
    </div>
  );
}

export default App;
```

:::

### Vue / TresJS

::: code-group

```vue [TypeScript]
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import { useDevtoolEntity, useThreeLens } from '@3lens/vue-bridge';
import type { ProbeConfig } from '@3lens/core';
import { ref } from 'vue';

const config: ProbeConfig = {
  appName: 'TresJS App',
  rules: {
    maxDrawCalls: 500,
  },
};

const { probe, fps, drawCalls } = useThreeLens(config);

// Player entity
const playerRef = ref<THREE.Group | null>(null);
useDevtoolEntity(playerRef, {
  name: 'Player',
  tags: ['controllable'],
});
</script>

<template>
  <div class="container">
    <TresCanvas>
      <TresAmbientLight :intensity="0.5" />
      <TresGroup ref="playerRef">
        <TresMesh :position="[0, 1, 0]">
          <TresCapsuleGeometry :args="[0.5, 1.5]" />
          <TresMeshStandardMaterial color="blue" />
        </TresMesh>
      </TresGroup>
    </TresCanvas>
    
    <div class="stats">
      <div>FPS: {{ fps.toFixed(1) }}</div>
      <div>Draw Calls: {{ drawCalls }}</div>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100vh;
}
.stats {
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
}
</style>
```

```vue [JavaScript]
<script setup>
import { TresCanvas } from '@tresjs/core';
import { useDevtoolEntity, useThreeLens } from '@3lens/vue-bridge';
import { ref } from 'vue';

const config = {
  appName: 'TresJS App',
  rules: {
    maxDrawCalls: 500,
  },
};

const { probe, fps, drawCalls } = useThreeLens(config);

// Player entity
const playerRef = ref(null);
useDevtoolEntity(playerRef, {
  name: 'Player',
  tags: ['controllable'],
});
</script>

<template>
  <div class="container">
    <TresCanvas>
      <TresAmbientLight :intensity="0.5" />
      <TresGroup ref="playerRef">
        <TresMesh :position="[0, 1, 0]">
          <TresCapsuleGeometry :args="[0.5, 1.5]" />
          <TresMeshStandardMaterial color="blue" />
        </TresMesh>
      </TresGroup>
    </TresCanvas>
    
    <div class="stats">
      <div>FPS: {{ fps.toFixed(1) }}</div>
      <div>Draw Calls: {{ drawCalls }}</div>
    </div>
  </div>
</template>
```

:::

### Angular

::: code-group

```typescript [TypeScript]
// app.module.ts
import { NgModule } from '@angular/core';
import { ThreeLensModule, THREELENS_CONFIG } from '@3lens/angular-bridge';
import type { ProbeConfig } from '@3lens/core';

const config: ProbeConfig = {
  appName: 'Angular Three.js App',
  rules: {
    maxDrawCalls: 500,
  },
};

@NgModule({
  imports: [
    ThreeLensModule,
  ],
  providers: [
    { provide: THREELENS_CONFIG, useValue: config },
  ],
})
export class AppModule {}

// scene.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';
import * as THREE from 'three';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-scene',
  template: `
    <canvas #canvas></canvas>
    <div class="stats">
      <div>FPS: {{ fps | number:'1.1-1' }}</div>
      <div>Draw Calls: {{ drawCalls }}</div>
    </div>
  `,
})
export class SceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  fps = 0;
  drawCalls = 0;
  
  private subscription = new Subscription();
  
  constructor(private threeLens: ThreeLensService) {}
  
  ngOnInit() {
    // Setup Three.js
    const canvas = this.canvasRef.nativeElement;
    const renderer = new THREE.WebGLRenderer({ canvas });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    
    // Connect 3Lens
    this.threeLens.observeRenderer(renderer);
    this.threeLens.observeScene(scene);
    
    // Subscribe to stats
    this.subscription.add(
      this.threeLens.frameStats$.subscribe(stats => {
        this.fps = stats.performance?.fps ?? 0;
        this.drawCalls = stats.drawCalls;
      })
    );
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
```

:::

---

## Advanced Patterns

### Plugin Development

Create a custom devtool plugin.

::: code-group

```typescript [TypeScript]
import type { DevtoolPlugin, DevtoolContext, PanelRenderContext } from '@3lens/core';

const statsHistoryPlugin: DevtoolPlugin = {
  metadata: {
    id: 'com.example.stats-history',
    name: 'Stats History',
    version: '1.0.0',
    description: 'Track FPS history with a chart',
  },

  activate(context: DevtoolContext) {
    context.log('Stats History plugin activated');
    
    // Initialize storage
    context.setStorage('fpsHistory', []);
    
    // Subscribe to frame stats
    context.onFrameStats((stats) => {
      const history = context.getStorage<number[]>('fpsHistory') ?? [];
      history.push(stats.performance?.fps ?? 0);
      
      // Keep last 100 samples
      if (history.length > 100) {
        history.shift();
      }
      
      context.setStorage('fpsHistory', history);
    });
  },

  deactivate(context: DevtoolContext) {
    context.log('Stats History plugin deactivated');
  },

  panels: [{
    id: 'fps-history',
    name: 'FPS History',
    icon: '📈',
    
    render(ctx: PanelRenderContext): string {
      const history = ctx.context.getStorage<number[]>('fpsHistory') ?? [];
      const max = Math.max(...history, 60);
      const min = Math.min(...history, 0);
      const avg = history.length > 0 
        ? history.reduce((a, b) => a + b, 0) / history.length 
        : 0;
      
      return `
        <div style="padding: 8px;">
          <h3>FPS History</h3>
          <div>Max: ${max.toFixed(0)} | Avg: ${avg.toFixed(1)} | Min: ${min.toFixed(0)}</div>
          <div style="display: flex; align-items: flex-end; height: 60px; gap: 1px;">
            ${history.map(fps => {
              const height = (fps / max) * 100;
              const color = fps >= 55 ? '#22c55e' : fps >= 30 ? '#eab308' : '#ef4444';
              return `<div style="flex: 1; height: ${height}%; background: ${color};"></div>`;
            }).join('')}
          </div>
        </div>
      `;
    },
    
    onMount(container, ctx) {
      // Request updates every 100ms
      const intervalId = setInterval(() => ctx.requestUpdate(), 100);
      (container as any).__intervalId = intervalId;
    },
    
    onUnmount(container) {
      clearInterval((container as any).__intervalId);
    },
  }],

  settings: {
    fields: [
      {
        key: 'maxSamples',
        label: 'Max Samples',
        type: 'number',
        defaultValue: 100,
        min: 10,
        max: 500,
      },
    ],
  },
};

export default statsHistoryPlugin;

// Usage
import { createProbe } from '@3lens/core';
import statsHistoryPlugin from './stats-history-plugin';

const probe = createProbe({ appName: 'Plugin Demo' });
probe.registerPlugin(statsHistoryPlugin);
await probe.activatePlugin('com.example.stats-history');
```

```javascript [JavaScript]
const statsHistoryPlugin = {
  metadata: {
    id: 'com.example.stats-history',
    name: 'Stats History',
    version: '1.0.0',
    description: 'Track FPS history with a chart',
  },

  activate(context) {
    context.log('Stats History plugin activated');
    
    // Initialize storage
    context.setStorage('fpsHistory', []);
    
    // Subscribe to frame stats
    context.onFrameStats((stats) => {
      const history = context.getStorage('fpsHistory') ?? [];
      history.push(stats.performance?.fps ?? 0);
      
      // Keep last 100 samples
      if (history.length > 100) {
        history.shift();
      }
      
      context.setStorage('fpsHistory', history);
    });
  },

  deactivate(context) {
    context.log('Stats History plugin deactivated');
  },

  panels: [{
    id: 'fps-history',
    name: 'FPS History',
    icon: '📈',
    
    render(ctx) {
      const history = ctx.context.getStorage('fpsHistory') ?? [];
      const max = Math.max(...history, 60);
      const avg = history.length > 0 
        ? history.reduce((a, b) => a + b, 0) / history.length 
        : 0;
      
      return `
        <div style="padding: 8px;">
          <h3>FPS History</h3>
          <div>Max: ${max.toFixed(0)} | Avg: ${avg.toFixed(1)}</div>
        </div>
      `;
    },
  }],
};

export default statsHistoryPlugin;
```

:::

### WebGPU Support

Using 3Lens with WebGPU renderer.

::: code-group

```typescript [TypeScript]
import * as THREE from 'three/webgpu';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

async function initWebGPU() {
  // Check WebGPU support
  if (!navigator.gpu) {
    console.error('WebGPU not supported');
    return;
  }

  // Create WebGPU renderer
  const renderer = new THREE.WebGPURenderer({ antialias: true });
  await renderer.init();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Create probe with WebGPU-optimized settings
  const probe = createProbe({
    appName: 'WebGPU App',
    sampling: {
      gpuTiming: true, // WebGPU has better timing support
      resourceTracking: true,
    },
    rules: {
      maxDrawCalls: 2000,
      maxTriangles: 1000000,
    },
  });

  // Connect 3Lens - auto-detects WebGPU
  probe.observeRenderer(renderer);
  probe.observeScene(scene);

  // Verify WebGPU detection
  console.log('Renderer kind:', probe.getRendererKind()); // 'webgpu'
  console.log('Is WebGPU:', probe.isWebGPU()); // true

  // Add overlay
  bootstrapOverlay(probe, renderer.domElement);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

initWebGPU();
```

```javascript [JavaScript]
import * as THREE from 'three/webgpu';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

async function initWebGPU() {
  // Check WebGPU support
  if (!navigator.gpu) {
    console.error('WebGPU not supported');
    return;
  }

  // Create WebGPU renderer
  const renderer = new THREE.WebGPURenderer({ antialias: true });
  await renderer.init();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Create probe with WebGPU-optimized settings
  const probe = createProbe({
    appName: 'WebGPU App',
    sampling: {
      gpuTiming: true,
      resourceTracking: true,
    },
  });

  // Connect 3Lens
  probe.observeRenderer(renderer);
  probe.observeScene(scene);

  console.log('Is WebGPU:', probe.isWebGPU()); // true

  // Add overlay
  bootstrapOverlay(probe, renderer.domElement);
}

initWebGPU();
```

:::

---

## Runnable Examples

Try these examples directly in your browser:

### StackBlitz Examples

| Example | Description | Link |
|---------|-------------|------|
| Basic Setup | Simple three.js + 3Lens setup | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/3lens-basic-setup) |
| React Three Fiber | R3F integration example | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/3lens-r3f-example) |
| Vue TresJS | TresJS integration example | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/3lens-tresjs-example) |
| Custom Plugin | Plugin development example | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/3lens-custom-plugin) |
| Performance Rules | Custom rules example | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/3lens-performance-rules) |

### CodeSandbox Examples

| Example | Description | Link |
|---------|-------------|------|
| Getting Started | Step-by-step tutorial | [![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/3lens-getting-started) |
| Transform Gizmo | Object manipulation | [![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/3lens-transform-gizmo) |
| Memory Profiling | Leak detection example | [![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/3lens-memory-profiling) |

---

## Copy-Paste Snippets

### Quick Initialization

```typescript
// Minimal setup - copy and paste
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

const probe = createProbe({ appName: 'My App' });
probe.observeRenderer(renderer);
probe.observeScene(scene);
bootstrapOverlay(probe, renderer.domElement);
```

### Development-Only Import

```typescript
// Development-only - copy and paste
if (import.meta.env.DEV) {
  const { createProbe } = await import('@3lens/core');
  const { bootstrapOverlay } = await import('@3lens/overlay');
  const probe = createProbe({ appName: 'My App' });
  probe.observeRenderer(renderer);
  probe.observeScene(scene);
  bootstrapOverlay(probe, renderer.domElement);
}
```

### FPS Monitor

```typescript
// FPS monitoring - copy and paste
const unsubscribe = probe.onFrameStats((stats) => {
  const fps = stats.performance?.fps ?? 0;
  if (fps < 30) console.warn('Low FPS:', fps.toFixed(1));
});
```

### Selection Sync

```typescript
// Selection sync - copy and paste
probe.onSelectionChanged((obj, meta) => {
  if (obj) {
    myUI.showInspector(obj, meta);
  } else {
    myUI.hideInspector();
  }
});
```

### Cleanup

```typescript
// Proper cleanup - copy and paste
function cleanup() {
  probe.dispose();
}

// Or in React
useEffect(() => {
  return () => probe.dispose();
}, [probe]);
```

---

## See Also

- [Probe API](../api/probe-api.md) - Complete probe reference
- [Configuration API](../api/config-api.md) - All configuration options
- [Events API](../api/events-api.md) - Event subscriptions
- [Plugin API](../api/plugin-api.md) - Plugin development
- [Getting Started Guide](../guide/getting-started.md) - Step-by-step tutorial
