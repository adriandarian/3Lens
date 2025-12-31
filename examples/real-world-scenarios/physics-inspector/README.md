# Physics Scene Inspector

A real-time physics simulation debugger showcasing 3Lens integration for inspecting rigid body dynamics, collision detection, and physics properties.

## Features

### Physics Simulation
- **Simple rigid body physics engine** with gravity, collision detection, and impulse-based resolution
- **Three collider shapes**: Spheres, boxes, and cylinders
- **Collision detection** between all shape combinations
- **Material properties**: Configurable restitution (bounciness) and friction
- **Angular dynamics**: Rotation and angular velocity simulation

### Debug Visualization
- **Collider wireframes**: See the exact collision shapes
- **Velocity vectors**: Yellow arrows showing object velocities
- **Contact points**: Red spheres at collision points with green normal arrows
- **AABB helpers**: Axis-aligned bounding boxes for broad-phase debugging

### Interactive Controls
- **Play/Pause/Step**: Full simulation control
- **Time scale**: Speed up or slow down physics
- **Object spawning**: Create spheres, boxes, cylinders, or random objects
- **Selection**: Click objects to inspect their physics properties

### 3Lens Integration
- **Scene graph inspection**: Full hierarchy with physics bodies and debug helpers
- **Object properties**: View mesh, material, and geometry data
- **Transform gizmo**: Manipulate objects directly
- **Performance monitoring**: Track physics step time

## Getting Started

### Installation

```bash
cd examples/real-world-scenarios/physics-inspector
pnpm install
```

### Development

```bash
pnpm dev
```

Open http://localhost:3010 to view the example.

## Usage

### Simulation Controls

| Control | Action |
|---------|--------|
| **Play/Pause** | Toggle physics simulation |
| **Step** | Advance one physics frame (when paused) |
| **Reset** | Clear all dynamic bodies and respawn |

### World Settings

| Setting | Range | Description |
|---------|-------|-------------|
| **Gravity** | -20 to 0 | Vertical gravity force (m/s²) |
| **Time Scale** | 0.1 to 2.0 | Simulation speed multiplier |
| **Restitution** | 0 to 1.0 | Bounciness (0 = no bounce, 1 = full bounce) |
| **Friction** | 0 to 1.0 | Surface friction coefficient |

### Spawning Objects

| Button | Description |
|--------|-------------|
| **🔵 Sphere** | Spawn a random-sized sphere |
| **🟦 Box** | Spawn a random-sized box |
| **🟡 Cylinder** | Spawn a random-sized cylinder |
| **🎲 Random** | Spawn a random shape |

Adjust **Spawn Height** to control where new objects appear.

### Debug Visualization

| Toggle | Description |
|--------|-------------|
| **Colliders** | Show wireframe collision shapes |
| **Velocity** | Show velocity vectors as arrows |
| **Contacts** | Show collision contact points and normals |
| **AABB** | Show axis-aligned bounding boxes |

### Object Selection

Click on any physics body to select it and view:
- **Name**: Object identifier
- **Type**: Static or Dynamic
- **Shape**: Collider type
- **Mass**: Object mass in kg
- **Position**: World coordinates (x, y, z)
- **Velocity**: Linear velocity vector
- **Speed**: Velocity magnitude in m/s
- **Angular**: Angular velocity vector

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause simulation |
| `S` | Step one frame (when paused) |
| `R` | Reset scene |
| `1` | Spawn sphere |
| `2` | Spawn box |
| `3` | Spawn cylinder |
| `4` | Spawn random object |
| `Ctrl+Shift+D` | Toggle 3Lens devtools |

## Physics Engine Details

### Collision Detection

The physics engine implements several collision detection algorithms:

- **Sphere vs Sphere**: Distance-based detection
- **Sphere vs Plane**: Point-plane distance
- **Box vs Plane**: Lowest vertex check
- **Cylinder vs Plane**: Bottom edge check
- **Sphere vs Box**: Simplified sphere-sphere approximation

### Collision Response

Uses impulse-based collision resolution:

1. **Penetration separation**: Bodies are pushed apart based on mass ratio
2. **Velocity response**: Impulses applied based on restitution
3. **Angular response**: Contact points induce rotation
4. **Friction**: Tangential velocity reduction

### Integration

Semi-implicit Euler integration with:
- Fixed timestep (60 Hz)
- Accumulator for frame-rate independence
- Linear and angular damping

## Scene Structure

```
PhysicsScene
├── MainCamera
├── AmbientLight
├── DirectionalLight
├── Ground (static plane)
├── GridHelper
├── DebugHelpers
│   ├── ColliderHelpers
│   ├── VelocityHelpers
│   ├── ContactHelpers
│   └── AABBHelpers
├── Sphere_0
├── Box_1
├── Cylinder_2
└── ...
```

## Code Architecture

### PhysicsWorld Class

The core physics simulation:

```typescript
class PhysicsWorld {
  bodies: RigidBody[] = [];
  gravity: THREE.Vector3;
  contacts: Contact[] = [];
  
  createBody(mesh, shape, mass, options): RigidBody;
  removeBody(body): void;
  step(dt): void;
  getStats(): PhysicsStats;
}
```

### RigidBody Interface

```typescript
interface RigidBody {
  id: number;
  mesh: THREE.Mesh;
  shape: ColliderShape;
  mass: number;
  isStatic: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  restitution: number;
  friction: number;
}
```

## Tips & Tricks

### Debugging Collisions
1. Enable **Contacts** visualization
2. Pause the simulation
3. Step frame-by-frame to see contact points
4. Green arrows show collision normals

### Performance Tuning
- Reduce spawn height for faster settling
- Lower restitution for less bouncing
- Increase friction for faster energy dissipation

### Visual Debugging
- Use collider wireframes to verify physics shapes match meshes
- Velocity arrows help diagnose unexpected movement
- AABB visualization useful for broad-phase debugging

## Integration Example

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// Create physics world
const physics = new PhysicsWorld();
physics.gravity.y = -9.8;

// Add a sphere
const mesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.5),
  new THREE.MeshStandardMaterial()
);
const body = physics.createBody(mesh, 'sphere', 1.0);

// 3Lens integration
const probe = createProbe({ appName: 'Physics Demo' });
probe.observeScene(scene);

// In animation loop
physics.step(1/60);
```

## Limitations

This is a simplified physics engine for demonstration purposes:

- No continuous collision detection
- Simplified box collision (uses bounding sphere)
- No constraints/joints
- No sleeping/deactivation
- Limited to convex shapes

For production physics, consider:
- [cannon-es](https://github.com/pmndrs/cannon-es)
- [rapier](https://rapier.rs/)
- [ammo.js](https://github.com/kripken/ammo.js/)

## Dependencies

- Three.js ^0.160.0
- @3lens/core (workspace)
- @3lens/overlay (workspace)
