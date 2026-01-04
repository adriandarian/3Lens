# Real-World Scenarios Examples

This guide provides comprehensive walkthroughs for using 3Lens in production-style applications. Each example represents a realistic use case with professional debugging workflows.

[[toc]]

## Overview

These examples demonstrate 3Lens integration in applications similar to real-world production scenarios:

| Example | Application Type | Key Debugging Focus |
|---------|------------------|---------------------|
| [3D Model Viewer](#3d-model-viewer) | Product visualization | Asset loading, materials, LOD |
| [Particle System](#particle-system) | Visual effects | Particle pooling, GPU sprites |
| [Physics Inspector](#physics-inspector) | Simulations | Collision detection, forces |
| [VR/XR Debugging](#vr-xr-debugging) | Immersive apps | XR controllers, play space |

---

## 3D Model Viewer

A professional 3D model viewer application demonstrating GLTF loading, material inspection, and asset optimization debugging.

### Features Demonstrated

- **GLTF/GLB Loading**: Draco compression, progressive loading
- **Material Inspection**: PBR properties, texture channels
- **Environment Lighting**: HDRI backgrounds, light presets
- **Animation Playback**: Animation mixer debugging
- **Model Statistics**: Mesh count, triangle count, memory usage
- **Export Analysis**: Texture sizes, geometry optimization
- **Drag-and-Drop**: Load custom models

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/real-world-scenarios/3d-model-viewer
pnpm dev
```

Open http://localhost:3000 in your browser.

### Project Structure

```
3d-model-viewer/
├── src/
│   └── main.ts          # Model viewer application
├── index.html           # HTML entry with drop zone
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Set Up Loaders

```typescript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Configure DRACO decoder for compressed models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
```

#### Step 2: Integrate 3Lens

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe({
  appName: '3D Model Viewer',
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

const overlay = createOverlay(probe, {
  initialPosition: { x: window.innerWidth - 420, y: 20 },
});
```

#### Step 3: Track Model Loading

```typescript
interface ModelStats {
  meshes: number;
  triangles: number;
  materials: number;
  textures: number;
  animations: number;
  memory: number;
}

async function loadModel(url: string): Promise<ModelStats> {
  const startTime = performance.now();
  
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        const loadTime = performance.now() - startTime;
        const stats = analyzeModel(gltf);
        
        // Log to 3Lens
        probe.log('info', `Model loaded in ${loadTime.toFixed(0)}ms`, {
          url,
          stats,
        });
        
        // Add to scene
        scene.add(gltf.scene);
        
        resolve(stats);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        updateLoadingUI(percent);
      },
      (error) => {
        probe.log('error', `Failed to load model: ${url}`, { error });
        reject(error);
      }
    );
  });
}

function analyzeModel(gltf: GLTF): ModelStats {
  let meshes = 0;
  let triangles = 0;
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  
  gltf.scene.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      meshes++;
      
      const geo = node.geometry;
      triangles += geo.index 
        ? geo.index.count / 3 
        : geo.attributes.position.count / 3;
      
      const mats = Array.isArray(node.material) 
        ? node.material 
        : [node.material];
      
      mats.forEach(mat => {
        materials.add(mat);
        // Collect textures from material
        if (mat.map) textures.add(mat.map);
        if (mat.normalMap) textures.add(mat.normalMap);
        if (mat.roughnessMap) textures.add(mat.roughnessMap);
        // ... other texture types
      });
    }
  });
  
  return {
    meshes,
    triangles,
    materials: materials.size,
    textures: textures.size,
    animations: gltf.animations.length,
    memory: estimateMemory(gltf),
  };
}
```

#### Step 4: Environment Presets

```typescript
interface Environment {
  name: string;
  background: THREE.Color;
  ambientIntensity: number;
  directionalIntensity: number;
  groundColor: number;
}

const ENVIRONMENTS: Record<string, Environment> = {
  studio: {
    name: 'Studio',
    background: new THREE.Color(0x1a1a2e),
    ambientIntensity: 0.6,
    directionalIntensity: 0.8,
    groundColor: 0x16213e,
  },
  outdoor: {
    name: 'Outdoor',
    background: new THREE.Color(0x87ceeb),
    ambientIntensity: 0.5,
    directionalIntensity: 1.2,
    groundColor: 0x3d5a3d,
  },
  dark: {
    name: 'Dark',
    background: new THREE.Color(0x0a0e14),
    ambientIntensity: 0.2,
    directionalIntensity: 0.4,
    groundColor: 0x1f2937,
  },
};

function applyEnvironment(envName: string) {
  const env = ENVIRONMENTS[envName];
  scene.background = env.background;
  ambientLight.intensity = env.ambientIntensity;
  directionalLight.intensity = env.directionalIntensity;
  ground.material.color.setHex(env.groundColor);
  
  probe.log('info', `Environment changed to ${env.name}`);
}
```

#### Step 5: Animation Debugging

```typescript
let mixer: THREE.AnimationMixer | null = null;
let currentAction: THREE.AnimationAction | null = null;

function setupAnimations(gltf: GLTF) {
  if (gltf.animations.length === 0) return;
  
  mixer = new THREE.AnimationMixer(gltf.scene);
  
  // Register animations as logical entities
  gltf.animations.forEach((clip, index) => {
    probe.registerLogicalEntity({
      name: clip.name || `Animation_${index}`,
      module: 'animations',
      componentType: 'AnimationClip',
      metadata: {
        duration: clip.duration,
        tracks: clip.tracks.length,
      },
    });
  });
}

function playAnimation(index: number) {
  if (!mixer) return;
  
  const clip = gltf.animations[index];
  
  if (currentAction) {
    currentAction.fadeOut(0.3);
  }
  
  currentAction = mixer.clipAction(clip);
  currentAction.reset().fadeIn(0.3).play();
  
  probe.log('info', `Playing animation: ${clip.name}`, {
    duration: clip.duration,
  });
}
```

### Debugging with 3Lens

Use these 3Lens features for model viewer debugging:

1. **Materials Panel**: Inspect PBR properties of all materials
2. **Textures Panel**: Check texture dimensions and memory usage
3. **Geometries Panel**: Analyze vertex/triangle counts
4. **Scene Explorer**: Navigate model hierarchy
5. **Object Inspector**: View mesh bounding boxes

### Common Issues Detected

| Issue | 3Lens Detection |
|-------|-----------------|
| Large textures | Textures Panel shows sizes > 2048px |
| Unoptimized geometry | Geometries Panel shows high vertex count |
| Too many materials | Materials Panel shows material proliferation |
| Missing mipmaps | Textures Panel shows minFilter settings |

---

## Particle System

An advanced particle system demonstrating GPU particle management with 3Lens performance profiling.

### Features Demonstrated

- **Particle Pooling**: Object pool for particle recycling
- **Emitter Presets**: Fire, smoke, snow, sparks, etc.
- **GPU Sprites**: Billboard particles with instancing
- **Performance Tuning**: Real-time particle count adjustment
- **Memory Management**: Proper disposal patterns
- **Visual Effects**: Blend modes, color gradients

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/real-world-scenarios/particle-system
pnpm dev
```

Open http://localhost:3000 in your browser.

### Project Structure

```
particle-system/
├── src/
│   └── main.ts          # Particle system implementation
├── index.html           # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Define Particle Structure

```typescript
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
  lifetime: number;
  size: number;
  startSize: number;
  endSize: number;
  color: THREE.Color;
  startColor: THREE.Color;
  endColor: THREE.Color;
  active: boolean;
  index: number;
}

interface EmitterConfig {
  emissionRate: number;
  maxParticles: number;
  lifetime: number;
  lifetimeVariance: number;
  initialSpeed: number;
  speedVariance: number;
  spreadAngle: number;
  gravity: THREE.Vector3;
  startSize: number;
  endSize: number;
  startColor: THREE.Color;
  endColor: THREE.Color;
  opacity: number;
  blending: THREE.Blending;
}
```

#### Step 2: Emitter Presets

```typescript
const PRESETS: Record<string, Partial<EmitterConfig>> = {
  fountain: {
    emissionRate: 500,
    lifetime: 2,
    initialSpeed: 8,
    spreadAngle: 15,
    gravity: new THREE.Vector3(0, -9.8, 0),
    startSize: 0.08,
    endSize: 0.02,
    startColor: new THREE.Color(0x60a5fa),
    endColor: new THREE.Color(0x22d3ee),
    blending: THREE.AdditiveBlending,
  },
  fire: {
    emissionRate: 800,
    lifetime: 1.5,
    initialSpeed: 3,
    spreadAngle: 20,
    gravity: new THREE.Vector3(0, 2, 0),
    startColor: new THREE.Color(0xfbbf24),
    endColor: new THREE.Color(0xef4444),
    blending: THREE.AdditiveBlending,
  },
  snow: {
    emissionRate: 200,
    lifetime: 8,
    initialSpeed: 0.5,
    spreadAngle: 180,
    gravity: new THREE.Vector3(0, -1, 0),
    startColor: new THREE.Color(0xffffff),
    endColor: new THREE.Color(0xe0e7ff),
    blending: THREE.NormalBlending,
  },
  sparks: {
    emissionRate: 300,
    lifetime: 0.8,
    initialSpeed: 12,
    spreadAngle: 60,
    gravity: new THREE.Vector3(0, -15, 0),
    startColor: new THREE.Color(0xfef3c7),
    endColor: new THREE.Color(0xf97316),
    blending: THREE.AdditiveBlending,
  },
};
```

#### Step 3: Particle Pool with Instancing

```typescript
class ParticleEmitter {
  private particles: Particle[] = [];
  private instancedMesh: THREE.InstancedMesh;
  private dummy = new THREE.Object3D();
  private colorArray: Float32Array;
  
  constructor(maxParticles: number) {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    this.instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      maxParticles
    );
    this.instancedMesh.name = 'ParticleSystem';
    this.instancedMesh.frustumCulled = false;
    
    // Instance colors
    this.colorArray = new Float32Array(maxParticles * 3);
    this.instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
      this.colorArray,
      3
    );
    
    // Initialize particle pool
    for (let i = 0; i < maxParticles; i++) {
      this.particles.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        age: 0,
        lifetime: 0,
        size: 0,
        startSize: 0,
        endSize: 0,
        color: new THREE.Color(),
        startColor: new THREE.Color(),
        endColor: new THREE.Color(),
        active: false,
        index: i,
      });
    }
  }
  
  update(dt: number) {
    let activeCount = 0;
    
    for (const particle of this.particles) {
      if (!particle.active) continue;
      
      particle.age += dt;
      
      if (particle.age >= particle.lifetime) {
        particle.active = false;
        continue;
      }
      
      // Update physics
      particle.velocity.add(
        this.config.gravity.clone().multiplyScalar(dt)
      );
      particle.position.add(
        particle.velocity.clone().multiplyScalar(dt)
      );
      
      // Interpolate size and color
      const t = particle.age / particle.lifetime;
      particle.size = THREE.MathUtils.lerp(
        particle.startSize,
        particle.endSize,
        t
      );
      particle.color.lerpColors(
        particle.startColor,
        particle.endColor,
        t
      );
      
      // Update instance
      this.dummy.position.copy(particle.position);
      this.dummy.scale.setScalar(particle.size);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(particle.index, this.dummy.matrix);
      
      this.colorArray[particle.index * 3] = particle.color.r;
      this.colorArray[particle.index * 3 + 1] = particle.color.g;
      this.colorArray[particle.index * 3 + 2] = particle.color.b;
      
      activeCount++;
    }
    
    this.instancedMesh.count = activeCount;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.instancedMesh.instanceColor!.needsUpdate = true;
  }
}
```

#### Step 4: 3Lens Integration

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe();
probe.observeScene(scene);
probe.observeRenderer(renderer);

// Register emitter as logical entity
probe.registerLogicalEntity({
  name: 'ParticleEmitter',
  module: 'effects/particles',
  componentType: 'ParticleEmitter',
  tags: ['particles', 'effects'],
  metadata: {
    maxParticles: emitter.maxParticles,
    emissionRate: emitter.config.emissionRate,
  },
});

// Track particle stats
function updateParticleStats() {
  probe.updateLogicalEntity('ParticleEmitter', {
    metadata: {
      activeParticles: emitter.activeCount,
      particlesPerSecond: emitter.emissionRate,
    },
  });
}
```

### Performance Monitoring

Use 3Lens to monitor particle system performance:

1. **Stats Panel**: Track draw calls (should be 1 with instancing)
2. **Performance Panel**: Monitor frame time impact
3. **Memory Panel**: Watch GPU memory for particle textures
4. **Object Inspector**: Check instancedMesh.count

### Optimization Tips

| Issue | Solution | 3Lens Detection |
|-------|----------|-----------------|
| High draw calls | Use InstancedMesh | Stats Panel shows draw call count |
| Memory leaks | Proper object pooling | Memory Panel shows growth |
| GPU overdraw | Reduce particle count | Performance Panel shows GPU time |
| Low FPS | Reduce emission rate | Stats Panel shows FPS |

---

## Physics Inspector

A physics simulation debugger demonstrating collision detection visualization and force debugging with 3Lens.

### Features Demonstrated

- **Rigid Body Simulation**: Custom physics engine integration
- **Collision Visualization**: AABB helpers, contact points
- **Force Arrows**: Velocity and force vector display
- **Material Properties**: Friction, restitution editing
- **Debug Overlays**: Wireframe colliders, normals
- **Step Debugging**: Pause and step physics

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/real-world-scenarios/physics-inspector
pnpm dev
```

Open http://localhost:3000 in your browser.

### Project Structure

```
physics-inspector/
├── src/
│   └── main.ts          # Physics debugger implementation
├── index.html           # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Define Physics Types

```typescript
type ColliderShape = 'sphere' | 'box' | 'cylinder' | 'plane';

interface RigidBody {
  id: number;
  mesh: THREE.Mesh;
  shape: ColliderShape;
  mass: number;
  isStatic: boolean;
  
  // Physics state
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  force: THREE.Vector3;
  torque: THREE.Vector3;
  
  // Collider dimensions
  radius?: number;
  halfExtents?: THREE.Vector3;
  height?: number;
  
  // Material properties
  restitution: number;
  friction: number;
  
  // Debug helpers
  colliderHelper?: THREE.Object3D;
  velocityHelper?: THREE.ArrowHelper;
  aabbHelper?: THREE.Box3Helper;
}

interface Contact {
  bodyA: RigidBody;
  bodyB: RigidBody;
  point: THREE.Vector3;
  normal: THREE.Vector3;
  depth: number;
}
```

#### Step 2: Physics World with Debug Helpers

```typescript
class PhysicsWorld {
  bodies: RigidBody[] = [];
  gravity = new THREE.Vector3(0, -9.8, 0);
  contacts: Contact[] = [];
  
  createBody(
    mesh: THREE.Mesh,
    shape: ColliderShape,
    mass: number
  ): RigidBody {
    const body: RigidBody = {
      id: this.nextId++,
      mesh,
      shape,
      mass,
      isStatic: mass === 0,
      position: mesh.position.clone(),
      velocity: new THREE.Vector3(),
      angularVelocity: new THREE.Vector3(),
      force: new THREE.Vector3(),
      torque: new THREE.Vector3(),
      restitution: 0.6,
      friction: 0.3,
    };
    
    // Calculate collider dimensions from geometry
    this.calculateColliderDimensions(body);
    
    // Create debug helpers
    body.colliderHelper = this.createColliderHelper(body);
    body.velocityHelper = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      body.position,
      1,
      0x00ff00
    );
    body.aabbHelper = new THREE.Box3Helper(
      new THREE.Box3(),
      0xffff00
    );
    
    this.bodies.push(body);
    return body;
  }
  
  step(dt: number) {
    this.contacts = [];
    
    // Integrate forces
    for (const body of this.bodies) {
      if (body.isStatic) continue;
      
      // Apply gravity
      body.force.add(
        this.gravity.clone().multiplyScalar(body.mass)
      );
      
      // Integrate velocity
      body.velocity.add(
        body.force.clone().divideScalar(body.mass).multiplyScalar(dt)
      );
      
      // Integrate position
      body.position.add(
        body.velocity.clone().multiplyScalar(dt)
      );
      
      // Apply damping
      body.velocity.multiplyScalar(0.999);
      
      // Reset forces
      body.force.set(0, 0, 0);
    }
    
    // Collision detection & response
    this.detectCollisions();
    this.resolveContacts();
    
    // Sync to Three.js meshes
    this.syncMeshes();
  }
}
```

#### Step 3: Debug Visualization

```typescript
class PhysicsDebugger {
  private showColliders = true;
  private showVelocities = true;
  private showAABBs = false;
  private showContacts = true;
  private contactMarkers: THREE.Mesh[] = [];
  
  update(world: PhysicsWorld) {
    // Update collider helpers
    for (const body of world.bodies) {
      if (body.colliderHelper) {
        body.colliderHelper.visible = this.showColliders;
        body.colliderHelper.position.copy(body.position);
      }
      
      // Update velocity arrows
      if (body.velocityHelper && this.showVelocities) {
        body.velocityHelper.visible = true;
        body.velocityHelper.position.copy(body.position);
        body.velocityHelper.setDirection(
          body.velocity.clone().normalize()
        );
        body.velocityHelper.setLength(body.velocity.length() * 0.2);
      }
      
      // Update AABB helpers
      if (body.aabbHelper && this.showAABBs) {
        const aabb = this.calculateAABB(body);
        body.aabbHelper.box.copy(aabb);
        body.aabbHelper.visible = true;
      }
    }
    
    // Show contact points
    this.updateContactMarkers(world.contacts);
  }
  
  private updateContactMarkers(contacts: Contact[]) {
    // Clear old markers
    this.contactMarkers.forEach(m => m.parent?.remove(m));
    this.contactMarkers = [];
    
    if (!this.showContacts) return;
    
    for (const contact of contacts) {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.05),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      marker.position.copy(contact.point);
      scene.add(marker);
      this.contactMarkers.push(marker);
      
      // Normal arrow
      const arrow = new THREE.ArrowHelper(
        contact.normal,
        contact.point,
        contact.depth * 5,
        0xff00ff
      );
      scene.add(arrow);
    }
  }
}
```

#### Step 4: 3Lens Integration

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe();
probe.observeScene(scene);
probe.observeRenderer(renderer);

// Register physics world as logical entity
probe.registerLogicalEntity({
  name: 'PhysicsWorld',
  module: 'physics',
  componentType: 'PhysicsWorld',
  tags: ['physics', 'simulation'],
  metadata: {
    gravity: world.gravity.toArray(),
    bodyCount: world.bodies.length,
  },
});

// Register each rigid body
world.bodies.forEach(body => {
  probe.registerLogicalEntity({
    name: `RigidBody_${body.id}`,
    module: 'physics/bodies',
    componentType: 'RigidBody',
    linkedObject: body.mesh,
    metadata: {
      mass: body.mass,
      shape: body.shape,
      restitution: body.restitution,
      friction: body.friction,
    },
  });
});

// Update physics stats each frame
function updatePhysicsStats() {
  probe.updateLogicalEntity('PhysicsWorld', {
    metadata: {
      bodyCount: world.bodies.length,
      contactCount: world.contacts.length,
      stepTime: lastStepTime,
    },
  });
}
```

### Debug Controls

| Key | Action |
|-----|--------|
| `Space` | Pause/Resume simulation |
| `N` | Step one frame (when paused) |
| `C` | Toggle collider helpers |
| `V` | Toggle velocity arrows |
| `B` | Toggle AABB boxes |
| `P` | Toggle contact points |

### Physics Debugging Workflow

1. **Pause Simulation**: Press Space to freeze
2. **Inspect Bodies**: Select in 3Lens Scene Explorer
3. **View Properties**: Check mass, velocity in Object Inspector
4. **Step Frame**: Press N to advance one physics step
5. **Watch Contacts**: Enable contact point visualization

---

## VR/XR Debugging

A VR/XR application demonstrating immersive debugging workflows with 3Lens.

### Features Demonstrated

- **WebXR Integration**: VR and AR session management
- **Controller Tracking**: XR controller visualization
- **Hand Tracking**: XR hand model debugging
- **Play Space Bounds**: Guardian/chaperone visualization
- **In-VR Debug Panel**: 3D overlay in XR
- **Performance Monitoring**: XR-specific frame timing

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/real-world-scenarios/vr-xr-debugging
pnpm dev
```

Open http://localhost:3000 in a WebXR-compatible browser with a VR headset.

### Project Structure

```
vr-xr-debugging/
├── src/
│   └── main.ts          # VR/XR debugging application
├── index.html           # HTML entry with XR buttons
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Set Up XR Support

```typescript
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';

// Enable XR on renderer
renderer.xr.enabled = true;

// Check XR support
interface XRState {
  isSupported: boolean;
  vrSupported: boolean;
  arSupported: boolean;
  isSessionActive: boolean;
  sessionType: 'vr' | 'ar' | null;
  referenceSpace: XRReferenceSpaceType;
}

async function checkXRSupport(): Promise<XRState> {
  const state: XRState = {
    isSupported: 'xr' in navigator,
    vrSupported: false,
    arSupported: false,
    isSessionActive: false,
    sessionType: null,
    referenceSpace: 'local-floor',
  };
  
  if (navigator.xr) {
    state.vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
    state.arSupported = await navigator.xr.isSessionSupported('immersive-ar');
  }
  
  return state;
}
```

#### Step 2: Controller Setup

```typescript
const controllerModelFactory = new XRControllerModelFactory();
const handModelFactory = new XRHandModelFactory();

function setupControllers() {
  for (let i = 0; i < 2; i++) {
    // Controller ray
    const controller = renderer.xr.getController(i);
    controller.name = `Controller_${i}`;
    scene.add(controller);
    
    // Controller model
    const grip = renderer.xr.getControllerGrip(i);
    grip.add(controllerModelFactory.createControllerModel(grip));
    grip.name = `ControllerGrip_${i}`;
    scene.add(grip);
    
    // Hand tracking
    const hand = renderer.xr.getHand(i);
    hand.add(handModelFactory.createHandModel(hand, 'mesh'));
    hand.name = `Hand_${i}`;
    scene.add(hand);
    
    // Controller events
    controller.addEventListener('selectstart', onSelectStart);
    controller.addEventListener('selectend', onSelectEnd);
    controller.addEventListener('squeezestart', onSqueezeStart);
    controller.addEventListener('squeezeend', onSqueezeEnd);
  }
}
```

#### Step 3: 3Lens Integration

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe({
  appName: 'XR Debugging Demo',
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

// Register XR state as logical entity
probe.registerLogicalEntity({
  name: 'XRSession',
  module: 'xr',
  componentType: 'XRSessionState',
  tags: ['xr', 'session'],
  metadata: {
    vrSupported: xrState.vrSupported,
    arSupported: xrState.arSupported,
    isActive: xrState.isSessionActive,
    type: xrState.sessionType,
  },
});

// Register controllers
probe.registerLogicalEntity({
  name: 'LeftController',
  module: 'xr/input',
  componentType: 'XRController',
  linkedObject: renderer.xr.getController(0),
  metadata: { hand: 'left' },
});

probe.registerLogicalEntity({
  name: 'RightController',
  module: 'xr/input',
  componentType: 'XRController',
  linkedObject: renderer.xr.getController(1),
  metadata: { hand: 'right' },
});

const overlay = createOverlay(probe);
```

#### Step 4: Play Space Visualization

```typescript
function updatePlayBounds() {
  const session = renderer.xr.getSession();
  if (!session) return;
  
  const referenceSpace = renderer.xr.getReferenceSpace();
  if (!referenceSpace) return;
  
  // Request bounds geometry
  const bounds = referenceSpace.boundsGeometry;
  if (bounds && bounds.length > 0) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < bounds.length; i++) {
      points.push(new THREE.Vector3(
        bounds[i].x,
        0,
        bounds[i].z
      ));
    }
    
    // Update bounds visualization
    updateBoundsHelper(points);
    
    // Log to 3Lens
    probe.log('info', 'Play bounds updated', {
      pointCount: points.length,
      area: calculateArea(points),
    });
  }
}
```

#### Step 5: In-VR Debug Panel

```typescript
class VRDebugPanel {
  private panel: THREE.Group;
  private canvas: HTMLCanvasElement;
  private texture: THREE.CanvasTexture;
  
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 256;
    
    this.texture = new THREE.CanvasTexture(this.canvas);
    
    const geometry = new THREE.PlaneGeometry(0.4, 0.2);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'VRDebugPanel';
    
    this.panel = new THREE.Group();
    this.panel.name = 'VRDebugPanelGroup';
    this.panel.add(mesh);
  }
  
  update(stats: FrameStats) {
    const ctx = this.canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, 512, 256);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.fillText(`FPS: ${stats.fps?.toFixed(0) ?? '-'}`, 20, 40);
    ctx.fillText(`Draw Calls: ${stats.drawCallCount ?? '-'}`, 20, 80);
    ctx.fillText(`Triangles: ${formatNumber(stats.triangleCount ?? 0)}`, 20, 120);
    
    this.texture.needsUpdate = true;
  }
  
  attachToController(controller: THREE.Group) {
    this.panel.position.set(0, 0.1, -0.1);
    this.panel.rotation.x = -Math.PI / 4;
    controller.add(this.panel);
  }
}
```

### XR Debugging Workflow

1. **Pre-Session Check**: Verify XR support in 3Lens console
2. **Start Session**: Enter VR/AR mode
3. **Controller Tracking**: Monitor controller positions in Scene Explorer
4. **Performance**: Watch frame timing (must maintain 72/90Hz)
5. **Debug Panel**: Use wrist-attached panel for in-VR stats

### XR Performance Requirements

| Metric | VR Requirement | 3Lens Monitoring |
|--------|---------------|------------------|
| Frame Rate | 72-90 Hz minimum | Stats Panel FPS |
| Frame Time | <11ms (90Hz) | Performance Panel |
| Latency | <20ms motion-to-photon | Frame Timeline |
| Draw Calls | Minimize for each eye | Stats Panel |

---

## See Also

- [Framework Integration Examples](./framework-integration.md) - Framework-specific setups
- [Debugging Examples](./debugging-examples.md) - Performance and memory debugging
- [Feature Showcase Examples](./feature-showcase.md) - 3Lens feature demonstrations
- [Game Development Examples](./game-development.md) - Game-specific debugging
- [Memory Profiling Guide](/guides/MEMORY-PROFILING-GUIDE.md) - Resource management
- [Performance Debugging Guide](/guides/PERFORMANCE-DEBUGGING-GUIDE.md) - Optimization techniques
