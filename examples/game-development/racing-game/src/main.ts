/**
 * Racing Game Profiler - 3Lens Example
 *
 * Demonstrates 3Lens devtool integration for debugging:
 * - Vehicle physics (velocity, acceleration, steering, grip)
 * - Lap timing and checkpoint systems
 * - AI opponent behavior and pathfinding
 * - Performance profiling for racing games
 * - Collision detection visualization
 * - Track surface types and their effects
 */

import * as THREE from 'three';
import { DevtoolProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// Types
// ============================================================================

interface VehicleState {
  position: THREE.Vector3;
  rotation: number;
  velocity: THREE.Vector3;
  speed: number;
  acceleration: number;
  steering: number;
  rpm: number;
  gear: number;
  driftAngle: number;
  grip: number;
  nitro: number;
  maxNitro: number;
  nitroActive: boolean;
  onGround: boolean;
  currentSurface: SurfaceType;
  lastCheckpoint: number;
  currentLap: number;
  lapStartTime: number;
  bestLapTime: number;
  currentLapTime: number;
  finished: boolean;
  damage: number;
}

interface AIVehicle {
  mesh: THREE.Group;
  state: VehicleState;
  targetWaypoint: number;
  aggression: number;
  skill: number;
  color: number;
}

interface Checkpoint {
  position: THREE.Vector3;
  width: number;
  mesh: THREE.Mesh;
  index: number;
}

type SurfaceType = 'asphalt' | 'grass' | 'sand' | 'gravel';

interface TrackSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  width: number;
  surface: SurfaceType;
}

// ============================================================================
// Constants
// ============================================================================

const TOTAL_LAPS = 3;
const TOTAL_CHECKPOINTS = 8;
const AI_COUNT = 7;

const VEHICLE_CONFIG = {
  maxSpeed: 120,
  acceleration: 40,
  braking: 60,
  friction: 0.98,
  turnSpeed: 2.5,
  driftThreshold: 0.7,
  nitroBoost: 1.5,
  nitroConsumption: 30,
  nitroRecharge: 5,
};

const SURFACE_GRIP: Record<SurfaceType, number> = {
  asphalt: 1.0,
  grass: 0.6,
  sand: 0.4,
  gravel: 0.7,
};

const SURFACE_COLORS: Record<SurfaceType, number> = {
  asphalt: 0x333333,
  grass: 0x228b22,
  sand: 0xc2b280,
  gravel: 0x808080,
};

// ============================================================================
// Initialize Scene
// ============================================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 500);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app')!.prepend(renderer.domElement);

// ============================================================================
// Initialize 3Lens DevTool
// ============================================================================

const probe = new DevtoolProbe({
  appName: 'Racing Game Profiler',
});
probe.observeScene(scene);
probe.observeRenderer(renderer);

createOverlay(probe);

// ============================================================================
// Lighting
// ============================================================================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
sunLight.position.set(100, 150, 50);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 400;
sunLight.shadow.camera.left = -150;
sunLight.shadow.camera.right = 150;
sunLight.shadow.camera.top = 150;
sunLight.shadow.camera.bottom = -150;
scene.add(sunLight);

// ============================================================================
// Track Generation
// ============================================================================

// Define track waypoints (oval-ish circuit)
const trackWaypoints: THREE.Vector3[] = [
  new THREE.Vector3(0, 0, -80),
  new THREE.Vector3(60, 0, -60),
  new THREE.Vector3(80, 0, 0),
  new THREE.Vector3(60, 0, 60),
  new THREE.Vector3(0, 0, 80),
  new THREE.Vector3(-60, 0, 60),
  new THREE.Vector3(-80, 0, 0),
  new THREE.Vector3(-60, 0, -60),
];

const trackSegments: TrackSegment[] = [];
const trackGroup = new THREE.Group();
trackGroup.name = 'Track';

// Create track surface
function createTrack(): void {
  const trackWidth = 20;

  // Create track segments
  for (let i = 0; i < trackWaypoints.length; i++) {
    const start = trackWaypoints[i];
    const end = trackWaypoints[(i + 1) % trackWaypoints.length];

    trackSegments.push({
      start: start.clone(),
      end: end.clone(),
      width: trackWidth,
      surface: 'asphalt',
    });

    // Create track segment mesh
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    direction.normalize();

    const geometry = new THREE.PlaneGeometry(trackWidth, length);
    const material = new THREE.MeshStandardMaterial({
      color: SURFACE_COLORS.asphalt,
      roughness: 0.8,
    });

    const segment = new THREE.Mesh(geometry, material);
    segment.rotation.x = -Math.PI / 2;

    // Position at midpoint
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    segment.position.copy(midpoint);

    // Rotate to align with direction
    const angle = Math.atan2(direction.x, direction.z);
    segment.rotation.z = angle;

    segment.receiveShadow = true;
    segment.name = `TrackSegment_${i}`;
    trackGroup.add(segment);

    // Add track borders (curbs)
    const curbGeometry = new THREE.BoxGeometry(1, 0.2, length);
    const curbMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
    });

    const leftCurb = new THREE.Mesh(curbGeometry, curbMaterial);
    leftCurb.position.copy(midpoint);
    leftCurb.position.y = 0.1;
    leftCurb.position.x += Math.cos(angle) * (trackWidth / 2 + 0.5);
    leftCurb.position.z -= Math.sin(angle) * (trackWidth / 2 + 0.5);
    leftCurb.rotation.y = angle;
    leftCurb.castShadow = true;
    leftCurb.name = `Curb_L_${i}`;
    trackGroup.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeometry, curbMaterial.clone());
    (rightCurb.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
    rightCurb.position.copy(midpoint);
    rightCurb.position.y = 0.1;
    rightCurb.position.x -= Math.cos(angle) * (trackWidth / 2 + 0.5);
    rightCurb.position.z += Math.sin(angle) * (trackWidth / 2 + 0.5);
    rightCurb.rotation.y = angle;
    rightCurb.castShadow = true;
    rightCurb.name = `Curb_R_${i}`;
    trackGroup.add(rightCurb);
  }

  scene.add(trackGroup);
}

// Create ground (grass)
function createGround(): void {
  const groundGeometry = new THREE.PlaneGeometry(400, 400);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: SURFACE_COLORS.grass,
    roughness: 1,
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  ground.name = 'Ground';
  scene.add(ground);

  // Add sand traps
  const sandPositions = [
    { x: 85, z: 0, r: 15 },
    { x: -85, z: 0, r: 15 },
    { x: 0, z: 85, r: 12 },
    { x: 0, z: -85, r: 12 },
  ];

  sandPositions.forEach((pos, i) => {
    const sandGeometry = new THREE.CircleGeometry(pos.r, 32);
    const sandMaterial = new THREE.MeshStandardMaterial({
      color: SURFACE_COLORS.sand,
      roughness: 1,
    });
    const sand = new THREE.Mesh(sandGeometry, sandMaterial);
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(pos.x, 0.01, pos.z);
    sand.receiveShadow = true;
    sand.name = `SandTrap_${i}`;
    scene.add(sand);
  });
}

// ============================================================================
// Checkpoints
// ============================================================================

const checkpoints: Checkpoint[] = [];

function createCheckpoints(): void {
  trackWaypoints.forEach((waypoint, index) => {
    const checkpointGeometry = new THREE.BoxGeometry(25, 5, 1);
    const checkpointMaterial = new THREE.MeshBasicMaterial({
      color: index === 0 ? 0xffff00 : 0x00ff00,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    const checkpoint = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
    checkpoint.position.copy(waypoint);
    checkpoint.position.y = 2.5;

    // Orient checkpoint perpendicular to track direction
    const nextWaypoint = trackWaypoints[(index + 1) % trackWaypoints.length];
    const direction = new THREE.Vector3().subVectors(nextWaypoint, waypoint);
    const angle = Math.atan2(direction.x, direction.z);
    checkpoint.rotation.y = angle;

    checkpoint.name = `Checkpoint_${index}`;
    checkpoint.visible = false; // Hidden by default, shown in debug mode
    scene.add(checkpoint);

    checkpoints.push({
      position: waypoint.clone(),
      width: 25,
      mesh: checkpoint,
      index,
    });
  });
}

// ============================================================================
// Vehicle Creation
// ============================================================================

function createVehicle(color: number = 0xff0000): THREE.Group {
  const vehicle = new THREE.Group();

  // Body
  const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.6,
    roughness: 0.4,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.6;
  body.castShadow = true;
  body.name = 'Body';
  vehicle.add(body);

  // Cabin
  const cabinGeometry = new THREE.BoxGeometry(1.6, 0.6, 2);
  const cabinMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.2,
  });
  const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
  cabin.position.y = 1.2;
  cabin.position.z = -0.3;
  cabin.castShadow = true;
  cabin.name = 'Cabin';
  vehicle.add(cabin);

  // Wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.9,
  });

  const wheelPositions = [
    { x: -1, y: 0.4, z: 1.2 },
    { x: 1, y: 0.4, z: 1.2 },
    { x: -1, y: 0.4, z: -1.2 },
    { x: 1, y: 0.4, z: -1.2 },
  ];

  wheelPositions.forEach((pos, i) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos.x, pos.y, pos.z);
    wheel.castShadow = true;
    wheel.name = `Wheel_${i}`;
    vehicle.add(wheel);
  });

  // Headlights
  const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
  const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });

  [-0.6, 0.6].forEach((x, i) => {
    const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight.position.set(x, 0.6, 2);
    headlight.name = `Headlight_${i}`;
    vehicle.add(headlight);
  });

  // Tail lights
  const taillightMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  [-0.6, 0.6].forEach((x, i) => {
    const taillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
    taillight.position.set(x, 0.6, -2);
    taillight.name = `Taillight_${i}`;
    vehicle.add(taillight);
  });

  return vehicle;
}

function createInitialVehicleState(): VehicleState {
  return {
    position: new THREE.Vector3(0, 0, -80),
    rotation: 0,
    velocity: new THREE.Vector3(),
    speed: 0,
    acceleration: 0,
    steering: 0,
    rpm: 0,
    gear: 0, // Neutral
    driftAngle: 0,
    grip: 1,
    nitro: 100,
    maxNitro: 100,
    nitroActive: false,
    onGround: true,
    currentSurface: 'asphalt',
    lastCheckpoint: 0,
    currentLap: 0,
    lapStartTime: 0,
    bestLapTime: Infinity,
    currentLapTime: 0,
    finished: false,
    damage: 0,
  };
}

// ============================================================================
// Player Vehicle
// ============================================================================

const playerVehicle = createVehicle(0xff0000);
playerVehicle.name = 'PlayerVehicle';
playerVehicle.position.set(0, 0, -80);
scene.add(playerVehicle);

const playerState = createInitialVehicleState();

// Register player vehicle with 3Lens
probe.registerLogicalEntity({
  id: 'player-vehicle',
  name: 'Player Vehicle',
  module: 'game/vehicles',
  componentType: 'Vehicle',
  tags: ['player', 'vehicle', 'controllable'],
  metadata: {
    speed: 0,
    gear: 'N',
    rpm: 0,
    nitro: 100,
    lap: 0,
    position: 1,
    grip: 100,
    surface: 'asphalt',
  },
});
probe.addObjectToEntity('player-vehicle', playerVehicle);

// ============================================================================
// AI Vehicles
// ============================================================================

const aiVehicles: AIVehicle[] = [];

function createAIVehicles(): void {
  const colors = [0x0066ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800, 0x8800ff];

  for (let i = 0; i < AI_COUNT; i++) {
    const mesh = createVehicle(colors[i % colors.length]);
    mesh.name = `AIVehicle_${i}`;

    // Stagger starting positions
    const row = Math.floor((i + 1) / 2);
    const side = (i + 1) % 2 === 0 ? 1 : -1;
    mesh.position.set(side * 4, 0, -80 + row * 8);
    mesh.rotation.y = 0;

    scene.add(mesh);

    const state = createInitialVehicleState();
    state.position.copy(mesh.position);

    const ai: AIVehicle = {
      mesh,
      state,
      targetWaypoint: 1,
      aggression: 0.3 + Math.random() * 0.5,
      skill: 0.6 + Math.random() * 0.3,
      color: colors[i % colors.length],
    };

    aiVehicles.push(ai);

    // Register AI vehicle with 3Lens
    probe.registerLogicalEntity({
      id: `ai-vehicle-${i}`,
      name: `AI Vehicle ${i + 1}`,
      module: 'game/ai',
      componentType: 'AIVehicle',
      tags: ['ai', 'vehicle', 'opponent'],
      metadata: {
        aggression: ai.aggression.toFixed(2),
        skill: ai.skill.toFixed(2),
        targetWaypoint: ai.targetWaypoint,
        speed: 0,
      },
    });
    probe.addObjectToEntity(`ai-vehicle-${i}`, mesh);
  }
}

// ============================================================================
// Track Entity Registration
// ============================================================================

probe.registerLogicalEntity({
  id: 'track',
  name: 'Race Track',
  module: 'game/track',
  componentType: 'Track',
  tags: ['environment', 'track'],
  metadata: {
    laps: TOTAL_LAPS,
    checkpoints: TOTAL_CHECKPOINTS,
    length: '~500m',
    surfaces: 'asphalt, grass, sand',
  },
});
probe.addObjectToEntity('track', trackGroup);

// ============================================================================
// Input Handling
// ============================================================================

const keys: Record<string, boolean> = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
  keys[e.code] = false;
});

// ============================================================================
// Game State
// ============================================================================

let raceStarted = false;
let raceTime = 0;
let countdownValue = 3;
let countdownTimer = 0;

// ============================================================================
// Physics Update
// ============================================================================

function updateVehiclePhysics(
  state: VehicleState,
  mesh: THREE.Group,
  input: { accelerate: boolean; brake: boolean; left: boolean; right: boolean; nitro: boolean },
  deltaTime: number
): void {
  // Determine current surface
  state.currentSurface = getSurfaceAtPosition(state.position);
  state.grip = SURFACE_GRIP[state.currentSurface];

  // Calculate acceleration
  let accel = 0;
  if (input.accelerate) {
    accel = VEHICLE_CONFIG.acceleration * state.grip;
  }
  if (input.brake) {
    accel = -VEHICLE_CONFIG.braking;
  }

  // Nitro boost
  if (input.nitro && state.nitro > 0 && input.accelerate) {
    accel *= VEHICLE_CONFIG.nitroBoost;
    state.nitro -= VEHICLE_CONFIG.nitroConsumption * deltaTime;
    state.nitroActive = true;
  } else {
    state.nitroActive = false;
    // Recharge nitro
    state.nitro = Math.min(state.maxNitro, state.nitro + VEHICLE_CONFIG.nitroRecharge * deltaTime);
  }

  state.acceleration = accel;

  // Apply acceleration
  const forward = new THREE.Vector3(
    Math.sin(state.rotation),
    0,
    Math.cos(state.rotation)
  );

  state.velocity.add(forward.multiplyScalar(accel * deltaTime));

  // Apply friction
  state.velocity.multiplyScalar(VEHICLE_CONFIG.friction);

  // Limit speed
  const maxSpeed = state.nitroActive
    ? VEHICLE_CONFIG.maxSpeed * VEHICLE_CONFIG.nitroBoost
    : VEHICLE_CONFIG.maxSpeed;

  state.speed = state.velocity.length();
  if (state.speed > maxSpeed) {
    state.velocity.normalize().multiplyScalar(maxSpeed);
    state.speed = maxSpeed;
  }

  // Steering
  if (state.speed > 0.5) {
    const turnAmount = VEHICLE_CONFIG.turnSpeed * state.grip * deltaTime;
    if (input.left) {
      state.steering = Math.min(1, state.steering + deltaTime * 3);
      state.rotation += turnAmount * state.steering;
    } else if (input.right) {
      state.steering = Math.max(-1, state.steering - deltaTime * 3);
      state.rotation -= turnAmount * Math.abs(state.steering);
    } else {
      state.steering *= 0.9; // Return to center
    }

    // Calculate drift angle
    const velocityAngle = Math.atan2(state.velocity.x, state.velocity.z);
    state.driftAngle = ((state.rotation - velocityAngle) * 180) / Math.PI;
    while (state.driftAngle > 180) state.driftAngle -= 360;
    while (state.driftAngle < -180) state.driftAngle += 360;
  } else {
    state.steering = 0;
    state.driftAngle = 0;
  }

  // Update position
  state.position.add(state.velocity.clone().multiplyScalar(deltaTime));

  // Keep on ground
  state.position.y = 0;

  // Update mesh
  mesh.position.copy(state.position);
  mesh.rotation.y = state.rotation;

  // Calculate RPM and gear
  const speedRatio = state.speed / VEHICLE_CONFIG.maxSpeed;
  state.gear = Math.min(6, Math.floor(speedRatio * 6) + 1);
  state.rpm = ((speedRatio * 6) % 1) * 8000 + 1000;
  if (state.speed < 1) {
    state.gear = 0;
    state.rpm = 800;
  }
}

function getSurfaceAtPosition(position: THREE.Vector3): SurfaceType {
  // Check if on track
  const distFromCenter = Math.sqrt(position.x * position.x + position.z * position.z);

  // Simplified track bounds check
  if (distFromCenter > 70 && distFromCenter < 90) {
    return 'asphalt';
  }

  // Check sand traps
  const sandPositions = [
    { x: 85, z: 0, r: 15 },
    { x: -85, z: 0, r: 15 },
    { x: 0, z: 85, r: 12 },
    { x: 0, z: -85, r: 12 },
  ];

  for (const sand of sandPositions) {
    const dist = Math.sqrt(
      Math.pow(position.x - sand.x, 2) + Math.pow(position.z - sand.z, 2)
    );
    if (dist < sand.r) {
      return 'sand';
    }
  }

  return 'grass';
}

// ============================================================================
// AI Update
// ============================================================================

function updateAI(ai: AIVehicle, deltaTime: number): void {
  const target = trackWaypoints[ai.targetWaypoint];
  const toTarget = new THREE.Vector3().subVectors(target, ai.state.position);
  const distToTarget = toTarget.length();

  // Check if reached waypoint
  if (distToTarget < 15) {
    ai.targetWaypoint = (ai.targetWaypoint + 1) % trackWaypoints.length;

    // Update checkpoint
    ai.state.lastCheckpoint = ai.targetWaypoint;
    if (ai.targetWaypoint === 0) {
      ai.state.currentLap++;
    }
  }

  // Calculate desired direction
  const targetAngle = Math.atan2(toTarget.x, toTarget.z);
  let angleDiff = targetAngle - ai.state.rotation;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  // AI input
  const input = {
    accelerate: true,
    brake: Math.abs(angleDiff) > 1 && ai.state.speed > 30,
    left: angleDiff > 0.1,
    right: angleDiff < -0.1,
    nitro: ai.state.currentLap >= 1 && Math.random() > 0.95,
  };

  // Skill affects speed
  const skillMultiplier = 0.7 + ai.skill * 0.3;

  // Temporarily modify max speed based on skill
  const originalMaxSpeed = VEHICLE_CONFIG.maxSpeed;
  VEHICLE_CONFIG.maxSpeed = originalMaxSpeed * skillMultiplier;

  updateVehiclePhysics(ai.state, ai.mesh, input, deltaTime);

  VEHICLE_CONFIG.maxSpeed = originalMaxSpeed;

  // Update 3Lens metadata
  const aiIndex = aiVehicles.indexOf(ai);
  probe.updateLogicalEntity(`ai-vehicle-${aiIndex}`, {
    metadata: {
      aggression: ai.aggression.toFixed(2),
      skill: ai.skill.toFixed(2),
      targetWaypoint: ai.targetWaypoint,
      speed: Math.round(ai.state.speed),
      lap: ai.state.currentLap,
      surface: ai.state.currentSurface,
    },
  });
}

// ============================================================================
// Checkpoint Detection
// ============================================================================

function checkCheckpoints(state: VehicleState): boolean {
  const expectedCheckpoint = (state.lastCheckpoint + 1) % TOTAL_CHECKPOINTS;
  const checkpoint = checkpoints[expectedCheckpoint];

  const distToCheckpoint = state.position.distanceTo(checkpoint.position);

  if (distToCheckpoint < checkpoint.width) {
    state.lastCheckpoint = expectedCheckpoint;

    // Crossed start/finish line
    if (expectedCheckpoint === 0 && state.currentLap > 0) {
      // Completed a lap
      const lapTime = state.currentLapTime;
      if (lapTime < state.bestLapTime) {
        state.bestLapTime = lapTime;
      }
      state.currentLap++;
      state.lapStartTime = raceTime;
      state.currentLapTime = 0;

      if (state.currentLap > TOTAL_LAPS) {
        state.finished = true;
        return true;
      }
    } else if (expectedCheckpoint === 0 && state.currentLap === 0) {
      state.currentLap = 1;
      state.lapStartTime = raceTime;
    }

    return true;
  }

  return false;
}

// ============================================================================
// Position Calculation
// ============================================================================

function calculatePositions(): number[] {
  const allVehicles = [
    { state: playerState, index: -1 },
    ...aiVehicles.map((ai, i) => ({ state: ai.state, index: i })),
  ];

  // Sort by lap, then checkpoint, then distance to next checkpoint
  allVehicles.sort((a, b) => {
    if (a.state.currentLap !== b.state.currentLap) {
      return b.state.currentLap - a.state.currentLap;
    }
    if (a.state.lastCheckpoint !== b.state.lastCheckpoint) {
      return b.state.lastCheckpoint - a.state.lastCheckpoint;
    }

    const nextCheckpointA = (a.state.lastCheckpoint + 1) % TOTAL_CHECKPOINTS;
    const nextCheckpointB = (b.state.lastCheckpoint + 1) % TOTAL_CHECKPOINTS;

    const distA = a.state.position.distanceTo(checkpoints[nextCheckpointA].position);
    const distB = b.state.position.distanceTo(checkpoints[nextCheckpointB].position);

    return distA - distB;
  });

  const positions: number[] = [];
  allVehicles.forEach((v, i) => {
    if (v.index === -1) {
      positions[-1] = i + 1;
    } else {
      positions[v.index] = i + 1;
    }
  });

  return positions;
}

// ============================================================================
// Camera Update
// ============================================================================

function updateCamera(): void {
  const offset = new THREE.Vector3(0, 8, -15);
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerState.rotation);

  const targetCameraPos = playerState.position.clone().add(offset);
  camera.position.lerp(targetCameraPos, 0.1);

  const lookTarget = playerState.position.clone();
  lookTarget.y += 1;
  camera.lookAt(lookTarget);
}

// ============================================================================
// UI Update
// ============================================================================

function updateUI(): void {
  // Speed
  const speedKmh = Math.round(playerState.speed * 3.6);
  document.getElementById('speed-value')!.textContent = String(speedKmh);

  // Gear
  const gearNames = ['N', '1', '2', '3', '4', '5', '6'];
  document.getElementById('gear')!.textContent = gearNames[playerState.gear];

  // RPM
  const rpmPercent = ((playerState.rpm - 800) / 7200) * 100;
  document.getElementById('rpm-fill')!.style.width = `${rpmPercent}%`;

  // Nitro
  document.getElementById('nitro-fill')!.style.width = `${playerState.nitro}%`;

  // Lap times
  document.getElementById('current-lap')!.textContent = formatTime(playerState.currentLapTime);
  document.getElementById('best-lap')!.textContent =
    playerState.bestLapTime === Infinity ? '--:--.---' : formatTime(playerState.bestLapTime);
  document.getElementById('lap-count')!.textContent = `${Math.min(playerState.currentLap, TOTAL_LAPS)} / ${TOTAL_LAPS}`;

  // Position
  const positions = calculatePositions();
  const playerPosition = positions[-1] || 1;
  document.getElementById('position-number')!.textContent = String(playerPosition);
  document.getElementById('position-suffix')!.textContent = getOrdinalSuffix(playerPosition);

  // Debug panel
  document.getElementById('debug-velocity')!.textContent = playerState.speed.toFixed(2);
  document.getElementById('debug-acceleration')!.textContent = playerState.acceleration.toFixed(2);
  document.getElementById('debug-steering')!.textContent = playerState.steering.toFixed(2);
  document.getElementById('debug-drift')!.textContent = `${playerState.driftAngle.toFixed(1)}°`;
  document.getElementById('debug-grip')!.textContent = `${Math.round(playerState.grip * 100)}%`;
  document.getElementById('debug-surface')!.textContent = capitalize(playerState.currentSurface);
  document.getElementById('debug-checkpoint')!.textContent = `${playerState.lastCheckpoint} / ${TOTAL_CHECKPOINTS}`;
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// Minimap
// ============================================================================

function initMinimap(): void {
  const svg = document.getElementById('minimap-track')!;

  // Draw track outline
  let pathData = 'M ';
  trackWaypoints.forEach((wp, i) => {
    const x = (wp.x / 100) * 80 + 80;
    const y = (wp.z / 100) * 80 + 80;
    pathData += `${x},${y} `;
    if (i === 0) pathData += 'L ';
  });
  pathData += 'Z';

  const trackPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  trackPath.setAttribute('d', pathData);
  trackPath.setAttribute('stroke', '#666');
  trackPath.setAttribute('stroke-width', '8');
  trackPath.setAttribute('fill', 'none');
  svg.appendChild(trackPath);

  // Player marker (will be updated)
  const playerMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  playerMarker.setAttribute('id', 'minimap-player');
  playerMarker.setAttribute('r', '5');
  playerMarker.setAttribute('fill', '#ff0000');
  svg.appendChild(playerMarker);

  // AI markers
  aiVehicles.forEach((ai, i) => {
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.setAttribute('id', `minimap-ai-${i}`);
    marker.setAttribute('r', '4');
    marker.setAttribute('fill', `#${ai.color.toString(16).padStart(6, '0')}`);
    svg.appendChild(marker);
  });
}

function updateMinimap(): void {
  // Player
  const playerX = (playerState.position.x / 100) * 80 + 80;
  const playerY = (playerState.position.z / 100) * 80 + 80;
  const playerMarker = document.getElementById('minimap-player');
  if (playerMarker) {
    playerMarker.setAttribute('cx', String(playerX));
    playerMarker.setAttribute('cy', String(playerY));
  }

  // AI
  aiVehicles.forEach((ai, i) => {
    const x = (ai.state.position.x / 100) * 80 + 80;
    const y = (ai.state.position.z / 100) * 80 + 80;
    const marker = document.getElementById(`minimap-ai-${i}`);
    if (marker) {
      marker.setAttribute('cx', String(x));
      marker.setAttribute('cy', String(y));
    }
  });
}

// ============================================================================
// Countdown
// ============================================================================

function updateCountdown(deltaTime: number): boolean {
  if (raceStarted) return true;

  countdownTimer += deltaTime * 1000;

  const countdownEl = document.getElementById('countdown')!;

  if (countdownTimer < 1000) {
    countdownEl.style.display = 'block';
    countdownEl.textContent = '3';
    countdownEl.className = '';
  } else if (countdownTimer < 2000) {
    countdownEl.textContent = '2';
  } else if (countdownTimer < 3000) {
    countdownEl.textContent = '1';
  } else if (countdownTimer < 4000) {
    countdownEl.textContent = 'GO!';
    countdownEl.className = 'go';
    raceStarted = true;
  } else {
    countdownEl.style.display = 'none';
  }

  return raceStarted;
}

// ============================================================================
// Race Finish
// ============================================================================

function showRaceFinished(): void {
  const statusEl = document.getElementById('race-status')!;
  const positions = calculatePositions();
  const playerPosition = positions[-1] || 1;

  statusEl.style.display = 'block';
  statusEl.className = 'finished';
  statusEl.innerHTML = `
    🏁 RACE FINISHED! 🏁<br>
    <span style="font-size: 48px; color: ${playerPosition === 1 ? '#ffd700' : '#fff'}">
      ${playerPosition}${getOrdinalSuffix(playerPosition)} Place
    </span><br>
    <span style="font-size: 18px; color: #888">
      Best Lap: ${formatTime(playerState.bestLapTime)}
    </span><br>
    <span style="font-size: 14px; color: #666">
      Press R to restart
    </span>
  `;
}

// ============================================================================
// Reset Race
// ============================================================================

function resetRace(): void {
  // Reset player
  playerState.position.set(0, 0, -80);
  playerState.rotation = 0;
  playerState.velocity.set(0, 0, 0);
  playerState.speed = 0;
  playerState.currentLap = 0;
  playerState.lastCheckpoint = 0;
  playerState.bestLapTime = Infinity;
  playerState.currentLapTime = 0;
  playerState.finished = false;
  playerState.nitro = 100;
  playerVehicle.position.copy(playerState.position);
  playerVehicle.rotation.y = 0;

  // Reset AI
  aiVehicles.forEach((ai, i) => {
    const row = Math.floor((i + 1) / 2);
    const side = (i + 1) % 2 === 0 ? 1 : -1;
    ai.state.position.set(side * 4, 0, -80 + row * 8);
    ai.state.rotation = 0;
    ai.state.velocity.set(0, 0, 0);
    ai.state.speed = 0;
    ai.state.currentLap = 0;
    ai.state.lastCheckpoint = 0;
    ai.state.finished = false;
    ai.targetWaypoint = 1;
    ai.mesh.position.copy(ai.state.position);
    ai.mesh.rotation.y = 0;
  });

  // Reset race state
  raceStarted = false;
  raceTime = 0;
  countdownTimer = 0;

  // Hide status
  document.getElementById('race-status')!.style.display = 'none';
  document.getElementById('countdown')!.style.display = 'none';
}

// ============================================================================
// Main Game Loop
// ============================================================================

const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);

  const deltaTime = Math.min(clock.getDelta(), 0.1);

  // Countdown
  const canRace = updateCountdown(deltaTime);

  if (canRace && !playerState.finished) {
    raceTime += deltaTime * 1000;
    playerState.currentLapTime = raceTime - playerState.lapStartTime;

    // Player input
    const input = {
      accelerate: keys['w'] || keys['arrowup'],
      brake: keys['s'] || keys['arrowdown'],
      left: keys['a'] || keys['arrowleft'],
      right: keys['d'] || keys['arrowright'],
      nitro: keys[' '] || keys['Space'],
    };

    // Update player
    updateVehiclePhysics(playerState, playerVehicle, input, deltaTime);

    // Check checkpoints
    const crossedCheckpoint = checkCheckpoints(playerState);
    if (crossedCheckpoint) {
      const checkpointEl = document.getElementById('checkpoint')!;
      checkpointEl.style.opacity = '1';
      setTimeout(() => {
        checkpointEl.style.opacity = '0';
      }, 500);
    }

    // Update AI
    aiVehicles.forEach((ai) => updateAI(ai, deltaTime));

    // Check race finish
    if (playerState.finished) {
      showRaceFinished();
    }

    // Update 3Lens metadata
    probe.updateLogicalEntity('player-vehicle', {
      metadata: {
        speed: Math.round(playerState.speed * 3.6),
        gear: ['N', '1', '2', '3', '4', '5', '6'][playerState.gear],
        rpm: Math.round(playerState.rpm),
        nitro: Math.round(playerState.nitro),
        lap: playerState.currentLap,
        position: calculatePositions()[-1] || 1,
        grip: Math.round(playerState.grip * 100),
        surface: playerState.currentSurface,
        driftAngle: playerState.driftAngle.toFixed(1),
        lastCheckpoint: playerState.lastCheckpoint,
        lapTime: formatTime(playerState.currentLapTime),
        bestLap: playerState.bestLapTime === Infinity ? 'N/A' : formatTime(playerState.bestLapTime),
      },
    });
  }

  // Reset
  if (keys['r']) {
    resetRace();
  }

  // Update camera and UI
  updateCamera();
  updateUI();
  updateMinimap();

  renderer.render(scene, camera);
}

// ============================================================================
// Window Resize
// ============================================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================================
// Initialize
// ============================================================================

createTrack();
createGround();
createCheckpoints();
createAIVehicles();
initMinimap();

console.log('🏎️ Racing Game Profiler - 3Lens Example');
console.log('Press ~ to toggle 3Lens devtool overlay');
console.log('Controls: WASD/Arrow Keys to drive, Space for nitro, R to reset');

animate();
