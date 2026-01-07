import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ───────────────────────────────────────────────────────────────
// Types & Interfaces
// ───────────────────────────────────────────────────────────────

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

// ───────────────────────────────────────────────────────────────
// Simple Physics Engine
// ───────────────────────────────────────────────────────────────

class PhysicsWorld {
  bodies: RigidBody[] = [];
  gravity = new THREE.Vector3(0, -9.8, 0);
  contacts: Contact[] = [];
  
  private nextId = 0;
  private tempVec = new THREE.Vector3();
  
  // World settings
  restitution = 0.6;
  friction = 0.3;
  
  createBody(
    mesh: THREE.Mesh,
    shape: ColliderShape,
    mass: number,
    options: Partial<RigidBody> = {}
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
      restitution: this.restitution,
      friction: this.friction,
      ...options,
    };
    
    // Calculate collider dimensions from geometry
    if (shape === 'sphere') {
      const geo = mesh.geometry as THREE.SphereGeometry;
      body.radius = geo.parameters.radius;
    } else if (shape === 'box') {
      const geo = mesh.geometry as THREE.BoxGeometry;
      body.halfExtents = new THREE.Vector3(
        geo.parameters.width / 2,
        geo.parameters.height / 2,
        geo.parameters.depth / 2
      );
    } else if (shape === 'cylinder') {
      const geo = mesh.geometry as THREE.CylinderGeometry;
      body.radius = geo.parameters.radiusTop;
      body.height = geo.parameters.height;
    }
    
    this.bodies.push(body);
    return body;
  }
  
  removeBody(body: RigidBody) {
    const index = this.bodies.indexOf(body);
    if (index !== -1) {
      this.bodies.splice(index, 1);
    }
  }
  
  step(dt: number) {
    this.contacts = [];
    
    // Integrate forces
    for (const body of this.bodies) {
      if (body.isStatic) continue;
      
      // Apply gravity
      this.tempVec.copy(this.gravity).multiplyScalar(body.mass);
      body.force.add(this.tempVec);
      
      // Integrate velocity
      this.tempVec.copy(body.force).divideScalar(body.mass).multiplyScalar(dt);
      body.velocity.add(this.tempVec);
      
      // Integrate position
      this.tempVec.copy(body.velocity).multiplyScalar(dt);
      body.position.add(this.tempVec);
      
      // Integrate angular velocity (simplified)
      this.tempVec.copy(body.angularVelocity).multiplyScalar(dt);
      body.mesh.rotation.x += this.tempVec.x;
      body.mesh.rotation.y += this.tempVec.y;
      body.mesh.rotation.z += this.tempVec.z;
      
      // Apply damping
      body.velocity.multiplyScalar(0.999);
      body.angularVelocity.multiplyScalar(0.99);
      
      // Reset forces
      body.force.set(0, 0, 0);
      body.torque.set(0, 0, 0);
    }
    
    // Collision detection & response
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        this.checkCollision(this.bodies[i], this.bodies[j]);
      }
    }
    
    // Sync meshes
    for (const body of this.bodies) {
      body.mesh.position.copy(body.position);
    }
  }
  
  private checkCollision(a: RigidBody, b: RigidBody) {
    // Skip if both are static
    if (a.isStatic && b.isStatic) return;
    
    let contact: Contact | null = null;
    
    // Sphere vs Sphere
    if (a.shape === 'sphere' && b.shape === 'sphere') {
      contact = this.sphereVsSphere(a, b);
    }
    // Sphere vs Plane
    else if (a.shape === 'sphere' && b.shape === 'plane') {
      contact = this.sphereVsPlane(a, b);
    } else if (a.shape === 'plane' && b.shape === 'sphere') {
      contact = this.sphereVsPlane(b, a);
      if (contact) {
        // Swap bodies
        [contact.bodyA, contact.bodyB] = [contact.bodyB, contact.bodyA];
        contact.normal.negate();
      }
    }
    // Box vs Plane
    else if (a.shape === 'box' && b.shape === 'plane') {
      contact = this.boxVsPlane(a, b);
    } else if (a.shape === 'plane' && b.shape === 'box') {
      contact = this.boxVsPlane(b, a);
      if (contact) {
        [contact.bodyA, contact.bodyB] = [contact.bodyB, contact.bodyA];
        contact.normal.negate();
      }
    }
    // Cylinder vs Plane
    else if (a.shape === 'cylinder' && b.shape === 'plane') {
      contact = this.cylinderVsPlane(a, b);
    } else if (a.shape === 'plane' && b.shape === 'cylinder') {
      contact = this.cylinderVsPlane(b, a);
      if (contact) {
        [contact.bodyA, contact.bodyB] = [contact.bodyB, contact.bodyA];
        contact.normal.negate();
      }
    }
    // Sphere vs Box (simplified)
    else if (a.shape === 'sphere' && b.shape === 'box') {
      contact = this.sphereVsBox(a, b);
    } else if (a.shape === 'box' && b.shape === 'sphere') {
      contact = this.sphereVsBox(b, a);
      if (contact) {
        [contact.bodyA, contact.bodyB] = [contact.bodyB, contact.bodyA];
        contact.normal.negate();
      }
    }
    
    if (contact) {
      this.contacts.push(contact);
      this.resolveCollision(contact);
    }
  }
  
  private sphereVsSphere(a: RigidBody, b: RigidBody): Contact | null {
    const diff = new THREE.Vector3().subVectors(b.position, a.position);
    const dist = diff.length();
    const minDist = (a.radius || 0) + (b.radius || 0);
    
    if (dist < minDist) {
      const normal = diff.normalize();
      const depth = minDist - dist;
      const point = new THREE.Vector3()
        .copy(a.position)
        .add(normal.clone().multiplyScalar(a.radius || 0));
      
      return { bodyA: a, bodyB: b, point, normal, depth };
    }
    return null;
  }
  
  private sphereVsPlane(sphere: RigidBody, plane: RigidBody): Contact | null {
    const planeY = plane.position.y;
    const sphereBottom = sphere.position.y - (sphere.radius || 0);
    
    if (sphereBottom < planeY) {
      const depth = planeY - sphereBottom;
      const normal = new THREE.Vector3(0, 1, 0);
      const point = new THREE.Vector3(
        sphere.position.x,
        planeY,
        sphere.position.z
      );
      
      return { bodyA: sphere, bodyB: plane, point, normal, depth };
    }
    return null;
  }
  
  private boxVsPlane(box: RigidBody, plane: RigidBody): Contact | null {
    const planeY = plane.position.y;
    const halfY = box.halfExtents?.y || 0;
    const boxBottom = box.position.y - halfY;
    
    if (boxBottom < planeY) {
      const depth = planeY - boxBottom;
      const normal = new THREE.Vector3(0, 1, 0);
      const point = new THREE.Vector3(box.position.x, planeY, box.position.z);
      
      return { bodyA: box, bodyB: plane, point, normal, depth };
    }
    return null;
  }
  
  private cylinderVsPlane(cyl: RigidBody, plane: RigidBody): Contact | null {
    const planeY = plane.position.y;
    const halfH = (cyl.height || 0) / 2;
    const cylBottom = cyl.position.y - halfH;
    
    if (cylBottom < planeY) {
      const depth = planeY - cylBottom;
      const normal = new THREE.Vector3(0, 1, 0);
      const point = new THREE.Vector3(cyl.position.x, planeY, cyl.position.z);
      
      return { bodyA: cyl, bodyB: plane, point, normal, depth };
    }
    return null;
  }
  
  private sphereVsBox(sphere: RigidBody, box: RigidBody): Contact | null {
    // Simplified: treat box as sphere for collision
    const halfExt = box.halfExtents || new THREE.Vector3(0.5, 0.5, 0.5);
    const boxRadius = Math.min(halfExt.x, halfExt.y, halfExt.z);
    
    const diff = new THREE.Vector3().subVectors(box.position, sphere.position);
    const dist = diff.length();
    const minDist = (sphere.radius || 0) + boxRadius;
    
    if (dist < minDist) {
      const normal = diff.normalize();
      const depth = minDist - dist;
      const point = new THREE.Vector3()
        .copy(sphere.position)
        .add(normal.clone().multiplyScalar(sphere.radius || 0));
      
      return { bodyA: sphere, bodyB: box, point, normal, depth };
    }
    return null;
  }
  
  private resolveCollision(contact: Contact) {
    const { bodyA, bodyB, normal, depth } = contact;
    
    // Separate bodies
    const totalMass = (bodyA.isStatic ? 0 : bodyA.mass) + (bodyB.isStatic ? 0 : bodyB.mass);
    if (totalMass === 0) return;
    
    const ratioA = bodyA.isStatic ? 0 : bodyA.mass / totalMass;
    const ratioB = bodyB.isStatic ? 0 : bodyB.mass / totalMass;
    
    if (!bodyA.isStatic) {
      bodyA.position.sub(normal.clone().multiplyScalar(depth * (1 - ratioA)));
    }
    if (!bodyB.isStatic) {
      bodyB.position.add(normal.clone().multiplyScalar(depth * ratioB));
    }
    
    // Calculate relative velocity
    const relVel = new THREE.Vector3().subVectors(bodyA.velocity, bodyB.velocity);
    const velAlongNormal = relVel.dot(normal);
    
    // Don't resolve if velocities are separating
    if (velAlongNormal > 0) return;
    
    // Restitution
    const e = Math.min(bodyA.restitution, bodyB.restitution);
    
    // Impulse scalar
    let j = -(1 + e) * velAlongNormal;
    j /= (bodyA.isStatic ? 0 : 1 / bodyA.mass) + (bodyB.isStatic ? 0 : 1 / bodyB.mass);
    
    // Apply impulse
    const impulse = normal.clone().multiplyScalar(j);
    
    if (!bodyA.isStatic) {
      bodyA.velocity.add(impulse.clone().divideScalar(bodyA.mass));
      // Add some angular velocity based on contact point
      const r = new THREE.Vector3().subVectors(contact.point, bodyA.position);
      bodyA.angularVelocity.add(
        new THREE.Vector3().crossVectors(r, impulse).multiplyScalar(0.1)
      );
    }
    if (!bodyB.isStatic) {
      bodyB.velocity.sub(impulse.clone().divideScalar(bodyB.mass));
      const r = new THREE.Vector3().subVectors(contact.point, bodyB.position);
      bodyB.angularVelocity.sub(
        new THREE.Vector3().crossVectors(r, impulse).multiplyScalar(0.1)
      );
    }
    
    // Friction
    const tangent = new THREE.Vector3()
      .copy(relVel)
      .sub(normal.clone().multiplyScalar(velAlongNormal))
      .normalize();
    
    if (tangent.length() > 0.001) {
      const friction = Math.sqrt(bodyA.friction * bodyB.friction);
      const frictionImpulse = tangent.multiplyScalar(-relVel.dot(tangent) * friction * 0.5);
      
      if (!bodyA.isStatic) {
        bodyA.velocity.add(frictionImpulse.clone().divideScalar(bodyA.mass));
      }
      if (!bodyB.isStatic) {
        bodyB.velocity.sub(frictionImpulse.clone().divideScalar(bodyB.mass));
      }
    }
  }
  
  getStats() {
    return {
      totalBodies: this.bodies.length,
      dynamicBodies: this.bodies.filter(b => !b.isStatic).length,
      staticBodies: this.bodies.filter(b => b.isStatic).length,
      contacts: this.contacts.length,
    };
  }
}

// ───────────────────────────────────────────────────────────────
// Scene Setup
// ───────────────────────────────────────────────────────────────

const container = document.getElementById('canvas-container')!;

// Scene
const scene = new THREE.Scene();
scene.name = 'PhysicsScene';
scene.background = new THREE.Color(0x0a0e14);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.name = 'MainCamera';
camera.position.set(10, 8, 15);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 2, 0);

// ───────────────────────────────────────────────────────────────
// Lighting
// ───────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.name = 'DirectionalLight';
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

// ───────────────────────────────────────────────────────────────
// Physics World
// ───────────────────────────────────────────────────────────────

const physics = new PhysicsWorld();

// Debug helpers group
const debugGroup = new THREE.Group();
debugGroup.name = 'DebugHelpers';
scene.add(debugGroup);

const colliderHelpers = new THREE.Group();
colliderHelpers.name = 'ColliderHelpers';
debugGroup.add(colliderHelpers);

const velocityHelpers = new THREE.Group();
velocityHelpers.name = 'VelocityHelpers';
debugGroup.add(velocityHelpers);

const contactHelpers = new THREE.Group();
contactHelpers.name = 'ContactHelpers';
debugGroup.add(contactHelpers);

const aabbHelpers = new THREE.Group();
aabbHelpers.name = 'AABBHelpers';
debugGroup.add(aabbHelpers);

// ───────────────────────────────────────────────────────────────
// Create Scene Objects
// ───────────────────────────────────────────────────────────────

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(30, 30);
groundGeometry.name = 'GroundGeometry';
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x2d3748,
  roughness: 0.8,
  metalness: 0.2,
  name: 'GroundMaterial',
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.name = 'Ground';
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Physics ground (static)
const groundBody = physics.createBody(ground, 'plane', 0);
groundBody.position.y = 0;

// Grid helper
const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x333333);
gridHelper.name = 'GridHelper';
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// ───────────────────────────────────────────────────────────────
// Object Spawning
// ───────────────────────────────────────────────────────────────

const colors = [0xef4444, 0x22c55e, 0x3b82f6, 0xf59e0b, 0x8b5cf6, 0xec4899];
let colorIndex = 0;
let spawnHeight = 8;

function getNextColor(): number {
  const color = colors[colorIndex % colors.length];
  colorIndex++;
  return color;
}

function createColliderHelper(body: RigidBody): THREE.Object3D {
  let helper: THREE.Object3D;
  
  if (body.shape === 'sphere') {
    const geo = new THREE.SphereGeometry(body.radius, 16, 12);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    helper = new THREE.Mesh(geo, mat);
  } else if (body.shape === 'box') {
    const ext = body.halfExtents!;
    const geo = new THREE.BoxGeometry(ext.x * 2, ext.y * 2, ext.z * 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    helper = new THREE.Mesh(geo, mat);
  } else if (body.shape === 'cylinder') {
    const geo = new THREE.CylinderGeometry(body.radius, body.radius, body.height, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    helper = new THREE.Mesh(geo, mat);
  } else {
    helper = new THREE.Object3D();
  }
  
  helper.name = `Collider_${body.id}`;
  return helper;
}

function spawnSphere(x?: number, y?: number, z?: number) {
  const radius = 0.3 + Math.random() * 0.4;
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  geometry.name = `SphereGeometry_${physics.bodies.length}`;
  
  const material = new THREE.MeshStandardMaterial({
    color: getNextColor(),
    roughness: 0.3,
    metalness: 0.7,
    name: `SphereMaterial_${physics.bodies.length}`,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `Sphere_${physics.bodies.length}`;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(
    x ?? (Math.random() - 0.5) * 6,
    y ?? spawnHeight,
    z ?? (Math.random() - 0.5) * 6
  );
  scene.add(mesh);
  
  const body = physics.createBody(mesh, 'sphere', 1);
  
  // Create debug helpers
  body.colliderHelper = createColliderHelper(body);
  colliderHelpers.add(body.colliderHelper);
  
  body.velocityHelper = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    mesh.position,
    1,
    0xffff00
  );
  body.velocityHelper.name = `Velocity_${body.id}`;
  velocityHelpers.add(body.velocityHelper);
  
  return body;
}

function spawnBox(x?: number, y?: number, z?: number) {
  const size = 0.4 + Math.random() * 0.4;
  const geometry = new THREE.BoxGeometry(size, size, size);
  geometry.name = `BoxGeometry_${physics.bodies.length}`;
  
  const material = new THREE.MeshStandardMaterial({
    color: getNextColor(),
    roughness: 0.4,
    metalness: 0.6,
    name: `BoxMaterial_${physics.bodies.length}`,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `Box_${physics.bodies.length}`;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(
    x ?? (Math.random() - 0.5) * 6,
    y ?? spawnHeight,
    z ?? (Math.random() - 0.5) * 6
  );
  scene.add(mesh);
  
  const body = physics.createBody(mesh, 'box', 1);
  
  body.colliderHelper = createColliderHelper(body);
  colliderHelpers.add(body.colliderHelper);
  
  body.velocityHelper = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    mesh.position,
    1,
    0xffff00
  );
  body.velocityHelper.name = `Velocity_${body.id}`;
  velocityHelpers.add(body.velocityHelper);
  
  return body;
}

function spawnCylinder(x?: number, y?: number, z?: number) {
  const radius = 0.2 + Math.random() * 0.3;
  const height = 0.5 + Math.random() * 0.5;
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 24);
  geometry.name = `CylinderGeometry_${physics.bodies.length}`;
  
  const material = new THREE.MeshStandardMaterial({
    color: getNextColor(),
    roughness: 0.35,
    metalness: 0.65,
    name: `CylinderMaterial_${physics.bodies.length}`,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `Cylinder_${physics.bodies.length}`;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(
    x ?? (Math.random() - 0.5) * 6,
    y ?? spawnHeight,
    z ?? (Math.random() - 0.5) * 6
  );
  scene.add(mesh);
  
  const body = physics.createBody(mesh, 'cylinder', 1);
  
  body.colliderHelper = createColliderHelper(body);
  colliderHelpers.add(body.colliderHelper);
  
  body.velocityHelper = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    mesh.position,
    1,
    0xffff00
  );
  body.velocityHelper.name = `Velocity_${body.id}`;
  velocityHelpers.add(body.velocityHelper);
  
  return body;
}

function spawnRandom() {
  const type = Math.floor(Math.random() * 3);
  if (type === 0) return spawnSphere();
  if (type === 1) return spawnBox();
  return spawnCylinder();
}

function clearDynamicBodies() {
  const toRemove = physics.bodies.filter(b => !b.isStatic);
  for (const body of toRemove) {
    scene.remove(body.mesh);
    body.mesh.geometry.dispose();
    (body.mesh.material as THREE.Material).dispose();
    
    if (body.colliderHelper) colliderHelpers.remove(body.colliderHelper);
    if (body.velocityHelper) velocityHelpers.remove(body.velocityHelper);
    if (body.aabbHelper) aabbHelpers.remove(body.aabbHelper);
    
    physics.removeBody(body);
  }
}

function resetScene() {
  clearDynamicBodies();
  simulationTime = 0;
  
  // Spawn initial objects
  for (let i = 0; i < 5; i++) {
    spawnRandom();
  }
}

// ───────────────────────────────────────────────────────────────
// 3Lens Integration
// ───────────────────────────────────────────────────────────────

const probe = createProbe({
  appName: 'Physics Scene Inspector',
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setThreeReference(THREE);

probe.initializeTransformGizmo(scene, camera, renderer.domElement, THREE);
probe.initializeCameraController(camera, THREE);

createOverlay(probe);

// ───────────────────────────────────────────────────────────────
// Simulation State
// ───────────────────────────────────────────────────────────────

let isPlaying = true;
let timeScale = 1.0;
let simulationTime = 0;
let physicsTime = 0;
let selectedBody: RigidBody | null = null;

// Debug visualization flags
let showColliders = true;
let showVelocity = true;
let showContacts = false;
let showAABB = false;

// ───────────────────────────────────────────────────────────────
// UI Controls
// ───────────────────────────────────────────────────────────────

function updateSlider(id: string, value: string | number) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

// Simulation controls
const playBtn = document.getElementById('btn-play')!;
playBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  playBtn.textContent = isPlaying ? '⏸️ Pause' : '▶️ Play';
  playBtn.classList.toggle('active', isPlaying);
});

document.getElementById('btn-step')!.addEventListener('click', () => {
  if (!isPlaying) {
    const start = performance.now();
    physics.step(1 / 60);
    physicsTime = performance.now() - start;
    simulationTime += 1 / 60;
    updateDebugHelpers();
  }
});

document.getElementById('btn-reset')!.addEventListener('click', resetScene);

// World settings
document.getElementById('gravity')!.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  updateSlider('gravity-value', value.toFixed(1));
  physics.gravity.y = value;
});

document.getElementById('timescale')!.addEventListener('input', (e) => {
  timeScale = parseFloat((e.target as HTMLInputElement).value);
  updateSlider('timescale-value', timeScale.toFixed(1));
});

document.getElementById('restitution')!.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  updateSlider('restitution-value', value.toFixed(2));
  physics.restitution = value;
  for (const body of physics.bodies) {
    body.restitution = value;
  }
});

document.getElementById('friction')!.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  updateSlider('friction-value', value.toFixed(2));
  physics.friction = value;
  for (const body of physics.bodies) {
    body.friction = value;
  }
});

// Spawn controls
document.getElementById('spawn-sphere')!.addEventListener('click', () => spawnSphere());
document.getElementById('spawn-box')!.addEventListener('click', () => spawnBox());
document.getElementById('spawn-cylinder')!.addEventListener('click', () => spawnCylinder());
document.getElementById('spawn-random')!.addEventListener('click', () => spawnRandom());

document.getElementById('spawn-height')!.addEventListener('input', (e) => {
  spawnHeight = parseInt((e.target as HTMLInputElement).value);
  updateSlider('spawn-height-value', spawnHeight);
});

// Debug toggles
document.getElementById('show-colliders')!.addEventListener('change', (e) => {
  showColliders = (e.target as HTMLInputElement).checked;
  colliderHelpers.visible = showColliders;
  (e.target as HTMLInputElement).parentElement!.classList.toggle('active', showColliders);
});

document.getElementById('show-velocity')!.addEventListener('change', (e) => {
  showVelocity = (e.target as HTMLInputElement).checked;
  velocityHelpers.visible = showVelocity;
  (e.target as HTMLInputElement).parentElement!.classList.toggle('active', showVelocity);
});

document.getElementById('show-contacts')!.addEventListener('change', (e) => {
  showContacts = (e.target as HTMLInputElement).checked;
  contactHelpers.visible = showContacts;
  (e.target as HTMLInputElement).parentElement!.classList.toggle('active', showContacts);
});

document.getElementById('show-aabb')!.addEventListener('change', (e) => {
  showAABB = (e.target as HTMLInputElement).checked;
  aabbHelpers.visible = showAABB;
  (e.target as HTMLInputElement).parentElement!.classList.toggle('active', showAABB);
});

document.getElementById('clear-dynamic')!.addEventListener('click', clearDynamicBodies);

// ───────────────────────────────────────────────────────────────
// Keyboard Shortcuts
// ───────────────────────────────────────────────────────────────

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  
  switch (e.code) {
    case 'Space':
      e.preventDefault();
      playBtn.click();
      break;
    case 'KeyS':
      if (!isPlaying) document.getElementById('btn-step')!.click();
      break;
    case 'KeyR':
      if (!e.ctrlKey && !e.metaKey) resetScene();
      break;
    case 'Digit1':
      spawnSphere();
      break;
    case 'Digit2':
      spawnBox();
      break;
    case 'Digit3':
      spawnCylinder();
      break;
    case 'Digit4':
      spawnRandom();
      break;
  }
});

// ───────────────────────────────────────────────────────────────
// Raycasting for Selection
// ───────────────────────────────────────────────────────────────

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  const meshes = physics.bodies.map(b => b.mesh);
  const intersects = raycaster.intersectObjects(meshes);
  
  if (intersects.length > 0) {
    const mesh = intersects[0].object as THREE.Mesh;
    selectedBody = physics.bodies.find(b => b.mesh === mesh) || null;
    document.getElementById('selected-panel')!.classList.remove('hidden');
    updateSelectedPanel();
  } else {
    selectedBody = null;
    document.getElementById('selected-panel')!.classList.add('hidden');
  }
});

function updateSelectedPanel() {
  if (!selectedBody) return;
  
  document.getElementById('sel-name')!.textContent = selectedBody.mesh.name;
  document.getElementById('sel-type')!.textContent = selectedBody.isStatic ? 'Static' : 'Dynamic';
  document.getElementById('sel-shape')!.textContent = selectedBody.shape;
  document.getElementById('sel-mass')!.textContent = selectedBody.mass.toFixed(2) + ' kg';
  
  const pos = selectedBody.position;
  document.getElementById('sel-position')!.textContent = 
    `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`;
  
  const vel = selectedBody.velocity;
  document.getElementById('sel-velocity')!.textContent = 
    `(${vel.x.toFixed(2)}, ${vel.y.toFixed(2)}, ${vel.z.toFixed(2)})`;
  
  document.getElementById('sel-speed')!.textContent = vel.length().toFixed(2) + ' m/s';
  
  const ang = selectedBody.angularVelocity;
  document.getElementById('sel-angular')!.textContent = 
    `(${ang.x.toFixed(2)}, ${ang.y.toFixed(2)}, ${ang.z.toFixed(2)})`;
}

// ───────────────────────────────────────────────────────────────
// Debug Helpers Update
// ───────────────────────────────────────────────────────────────

function updateDebugHelpers() {
  // Update collider helpers
  for (const body of physics.bodies) {
    if (body.colliderHelper) {
      body.colliderHelper.position.copy(body.position);
      body.colliderHelper.rotation.copy(body.mesh.rotation);
    }
    
    // Update velocity arrows
    if (body.velocityHelper && !body.isStatic) {
      body.velocityHelper.position.copy(body.position);
      const vel = body.velocity.clone();
      const len = vel.length();
      if (len > 0.01) {
        vel.normalize();
        body.velocityHelper.setDirection(vel);
        body.velocityHelper.setLength(Math.min(len * 0.3, 3), 0.2, 0.1);
        body.velocityHelper.visible = showVelocity;
      } else {
        body.velocityHelper.visible = false;
      }
    }
  }
  
  // Update contact points
  contactHelpers.clear();
  if (showContacts) {
    const contactGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const contactMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    for (const contact of physics.contacts) {
      const marker = new THREE.Mesh(contactGeo, contactMat);
      marker.position.copy(contact.point);
      contactHelpers.add(marker);
      
      // Normal arrow
      const arrow = new THREE.ArrowHelper(
        contact.normal,
        contact.point,
        0.5,
        0x00ff00
      );
      contactHelpers.add(arrow);
    }
  }
}

// ───────────────────────────────────────────────────────────────
// Stats Update
// ───────────────────────────────────────────────────────────────

function updateStats() {
  const stats = physics.getStats();
  document.getElementById('stat-bodies')!.textContent = stats.totalBodies.toString();
  document.getElementById('stat-dynamic')!.textContent = stats.dynamicBodies.toString();
  document.getElementById('stat-static')!.textContent = stats.staticBodies.toString();
  document.getElementById('stat-contacts')!.textContent = stats.contacts.toString();
  document.getElementById('stat-physics-time')!.textContent = physicsTime.toFixed(2) + ' ms';
  document.getElementById('stat-sim-time')!.textContent = simulationTime.toFixed(1) + 's';
}

// ───────────────────────────────────────────────────────────────
// Window Resize
// ───────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ───────────────────────────────────────────────────────────────
// Animation Loop
// ───────────────────────────────────────────────────────────────

const clock = new THREE.Clock();
const fixedDt = 1 / 60;
let accumulator = 0;

function animate() {
  requestAnimationFrame(animate);
  
  const dt = Math.min(clock.getDelta(), 0.1);
  
  if (isPlaying) {
    accumulator += dt * timeScale;
    
    while (accumulator >= fixedDt) {
      const start = performance.now();
      physics.step(fixedDt);
      physicsTime = performance.now() - start;
      simulationTime += fixedDt;
      accumulator -= fixedDt;
    }
    
    updateDebugHelpers();
  }
  
  // Update selected panel
  if (selectedBody) {
    updateSelectedPanel();
  }
  
  updateStats();
  controls.update();
  renderer.render(scene, camera);
}

// ───────────────────────────────────────────────────────────────
// Initialize
// ───────────────────────────────────────────────────────────────

// Initial visibility
colliderHelpers.visible = showColliders;
velocityHelpers.visible = showVelocity;
contactHelpers.visible = showContacts;
aabbHelpers.visible = showAABB;

// Spawn initial objects
resetScene();

// Start animation
animate();

console.log('⚛️ Physics Scene Inspector with 3Lens DevTools');
console.log('🎮 Use Space to toggle simulation, 1-4 to spawn objects');
console.log('⌨️ Press Ctrl+Shift+D to toggle devtools');
