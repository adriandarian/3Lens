/**
 * Racing Game Profiler - 3Lens Example
 *
 * Demonstrates 3Lens devtool integration for debugging:
 * - Vehicle physics (velocity, acceleration, steering, grip)
 * - Lap timing and checkpoint systems
 * - AI opponent behavior
 * - Track surface effects
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

// ============================================================================
// Constants
// ============================================================================

const TOTAL_LAPS = 3;
const TOTAL_CHECKPOINTS = 8;
const AI_COUNT = 3;

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

const overlay = createOverlay(probe);

// Register player vehicle entity
probe.registerLogicalEntity({
  name: 'Player Vehicle',
  module: 'game/vehicles',
  componentType: 'Vehicle',
  componentId: 'player-vehicle',
  tags: ['player', 'vehicle', 'physics'],
  metadata: {
    speed: 0,
    gear: 'N',
    rpm: 0,
    lap: 0,
  },
});

// Register race system
probe.registerLogicalEntity({
  name: 'Race System',
  module: 'game/race',
  componentType: 'RaceManager',
  tags: ['race', 'system'],
  metadata: {
    totalLaps: TOTAL_LAPS,
    checkpoints: TOTAL_CHECKPOINTS,
    aiCount: AI_COUNT,
  },
});

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

const trackGroup = new THREE.Group();
trackGroup.name = 'Track';

// Create track surface
function createTrack(): void {
  const trackWidth = 20;

  // Create track segments
  for (let i = 0; i < trackWaypoints.length; i++) {
    const start = trackWaypoints[i];
    const end = trackWaypoints[(i + 1) % trackWaypoints.length];

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
    
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    segment.position.copy(midpoint);
    segment.position.y = 0.01;
    segment.rotation.x = -Math.PI / 2;
    segment.rotation.z = Math.atan2(direction.x, direction.z);
    segment.receiveShadow = true;
    segment.name = `TrackSegment_${i}`;
    
    trackGroup.add(segment);
  }

  scene.add(trackGroup);
}

// Create ground
function createGround(): void {
  const groundGeometry = new THREE.PlaneGeometry(500, 500);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: SURFACE_COLORS.grass,
    roughness: 0.9,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'Ground';
  scene.add(ground);
}

// ============================================================================
// Checkpoints
// ============================================================================

const checkpoints: Checkpoint[] = [];

function createCheckpoints(): void {
  for (let i = 0; i < trackWaypoints.length; i++) {
    const position = trackWaypoints[i].clone();
    const geometry = new THREE.BoxGeometry(25, 5, 2);
    const material = new THREE.MeshBasicMaterial({
      color: i === 0 ? 0xffffff : 0x00ff00,
      transparent: true,
      opacity: 0.3,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.position.y = 2.5;
    
    // Rotate to face track direction
    const next = trackWaypoints[(i + 1) % trackWaypoints.length];
    const dir = new THREE.Vector3().subVectors(next, position);
    mesh.rotation.y = Math.atan2(dir.x, dir.z);
    mesh.name = `Checkpoint_${i}`;
    mesh.visible = false; // Hidden by default
    
    scene.add(mesh);
    
    checkpoints.push({
      position,
      width: 25,
      mesh,
      index: i,
    });
  }
}

// ============================================================================
// Vehicles
// ============================================================================

function createVehicle(color: number): THREE.Group {
  const group = new THREE.Group();
  
  // Body
  const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.5;
  body.castShadow = true;
  group.add(body);
  
  // Roof
  const roofGeometry = new THREE.BoxGeometry(1.5, 0.5, 2);
  const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
  roof.position.set(0, 1.25, -0.3);
  roof.castShadow = true;
  group.add(roof);
  
  // Wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  
  const wheelPositions = [
    { x: -1, z: 1.2 },
    { x: 1, z: 1.2 },
    { x: -1, z: -1.2 },
    { x: 1, z: -1.2 },
  ];
  
  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos.x, 0.4, pos.z);
    wheel.castShadow = true;
    group.add(wheel);
  });
  
  return group;
}

function createVehicleState(): VehicleState {
  return {
    position: new THREE.Vector3(0, 0, -80),
    rotation: 0,
    velocity: new THREE.Vector3(),
    speed: 0,
    acceleration: 0,
    steering: 0,
    rpm: 800,
    gear: 1,
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
  };
}

// Player vehicle
const playerVehicle = createVehicle(0x3b82f6);
playerVehicle.name = 'PlayerVehicle';
playerVehicle.position.set(0, 0, -80);
scene.add(playerVehicle);

const playerState = createVehicleState();

// AI vehicles
const aiVehicles: AIVehicle[] = [];

function createAIVehicles(): void {
  const colors = [0xef4444, 0x22c55e, 0xf59e0b];
  
  for (let i = 0; i < AI_COUNT; i++) {
    const vehicle = createVehicle(colors[i % colors.length]);
    vehicle.name = `AIVehicle_${i}`;
    
    const row = Math.floor((i + 1) / 2) + 1;
    const side = (i + 1) % 2 === 0 ? 1 : -1;
    vehicle.position.set(side * 4, 0, -80 + row * 8);
    
    scene.add(vehicle);
    
    const ai: AIVehicle = {
      mesh: vehicle,
      state: createVehicleState(),
      targetWaypoint: 1,
      aggression: 0.5 + Math.random() * 0.5,
      skill: 0.6 + Math.random() * 0.4,
      color: colors[i % colors.length],
    };
    
    ai.state.position.copy(vehicle.position);
    aiVehicles.push(ai);
    
    // Register AI vehicle entity
    probe.registerLogicalEntity({
      name: `AI Vehicle ${i + 1}`,
      module: 'game/vehicles',
      componentType: 'AIVehicle',
      componentId: `ai-vehicle-${i}`,
      tags: ['ai', 'vehicle', 'physics'],
      metadata: {
        aggression: ai.aggression.toFixed(2),
        skill: ai.skill.toFixed(2),
        speed: 0,
      },
    });
  }
}

// ============================================================================
// Vehicle Physics
// ============================================================================

function updateVehiclePhysics(
  state: VehicleState,
  mesh: THREE.Group,
  input: { accelerate: boolean; brake: boolean; left: boolean; right: boolean; nitro: boolean },
  deltaTime: number
): void {
  // Steering
  if (input.left) state.steering = Math.min(state.steering + 3 * deltaTime, 1);
  else if (input.right) state.steering = Math.max(state.steering - 3 * deltaTime, -1);
  else state.steering *= 0.9;

  // Acceleration/Braking
  if (input.accelerate) {
    const boost = state.nitroActive ? VEHICLE_CONFIG.nitroBoost : 1;
    state.acceleration = VEHICLE_CONFIG.acceleration * boost;
  } else if (input.brake) {
    state.acceleration = -VEHICLE_CONFIG.braking;
  } else {
    state.acceleration = 0;
  }

  // Nitro
  if (input.nitro && state.nitro > 0) {
    state.nitroActive = true;
    state.nitro -= VEHICLE_CONFIG.nitroConsumption * deltaTime;
  } else {
    state.nitroActive = false;
    state.nitro = Math.min(state.nitro + VEHICLE_CONFIG.nitroRecharge * deltaTime, state.maxNitro);
  }

  // Apply acceleration
  state.speed += state.acceleration * deltaTime;
  state.speed *= VEHICLE_CONFIG.friction;
  state.speed = Math.max(0, Math.min(state.speed, VEHICLE_CONFIG.maxSpeed));

  // Turn rate based on speed
  const turnRate = VEHICLE_CONFIG.turnSpeed * (state.speed / VEHICLE_CONFIG.maxSpeed) * state.grip;
  state.rotation += state.steering * turnRate * deltaTime;

  // Update velocity
  state.velocity.x = Math.sin(state.rotation) * state.speed;
  state.velocity.z = Math.cos(state.rotation) * state.speed;

  // Update position
  state.position.add(state.velocity.clone().multiplyScalar(deltaTime));

  // Update mesh
  mesh.position.copy(state.position);
  mesh.rotation.y = state.rotation;

  // Update RPM and gear
  const speedRatio = state.speed / VEHICLE_CONFIG.maxSpeed;
  state.rpm = 800 + speedRatio * 7200;
  state.gear = Math.min(6, Math.floor(speedRatio * 6) + 1);
}

// ============================================================================
// AI Logic
// ============================================================================

function updateAI(ai: AIVehicle, deltaTime: number): void {
  const target = trackWaypoints[ai.targetWaypoint];
  const toTarget = new THREE.Vector3().subVectors(target, ai.state.position);
  const distToTarget = toTarget.length();

  // Check if reached waypoint
  if (distToTarget < 15) {
    ai.targetWaypoint = (ai.targetWaypoint + 1) % trackWaypoints.length;
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
// Race State
// ============================================================================

let raceStarted = false;
let raceTime = 0;
let countdownTimer = 3;

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

function resetRace(): void {
  // Reset player
  playerState.position.set(0, 0, -80);
  playerState.rotation = 0;
  playerState.velocity.set(0, 0, 0);
  playerState.speed = 0;
  playerState.currentLap = 0;
  playerState.lastCheckpoint = 0;
  playerState.finished = false;
  playerState.bestLapTime = Infinity;
  playerVehicle.position.copy(playerState.position);
  playerVehicle.rotation.y = 0;

  // Reset AI
  aiVehicles.forEach((ai, i) => {
    const row = Math.floor((i + 1) / 2) + 1;
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
  countdownTimer = 3;
}

// ============================================================================
// Input
// ============================================================================

const keys: Record<string, boolean> = {};

document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  
  if (e.code === 'Backquote') {
    overlay.toggle();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ============================================================================
// Main Game Loop
// ============================================================================

const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);

  const deltaTime = Math.min(clock.getDelta(), 0.1);

  // Countdown
  if (!raceStarted) {
    countdownTimer -= deltaTime;
    if (countdownTimer <= 0) {
      raceStarted = true;
    }
  }

  if (raceStarted && !playerState.finished) {
    raceTime += deltaTime * 1000;
    playerState.currentLapTime = raceTime - playerState.lapStartTime;

    // Player input
    const input = {
      accelerate: keys['w'] || keys['arrowup'],
      brake: keys['s'] || keys['arrowdown'],
      left: keys['a'] || keys['arrowleft'],
      right: keys['d'] || keys['arrowright'],
      nitro: keys[' '],
    };

    // Update player
    updateVehiclePhysics(playerState, playerVehicle, input, deltaTime);

    // Check checkpoints
    checkCheckpoints(playerState);

    // Update AI
    aiVehicles.forEach((ai) => updateAI(ai, deltaTime));

    // Update 3Lens metadata
    probe.updateLogicalEntity('player-vehicle', {
      metadata: {
        speed: Math.round(playerState.speed * 3.6),
        gear: ['N', '1', '2', '3', '4', '5', '6'][playerState.gear],
        rpm: Math.round(playerState.rpm),
        nitro: Math.round(playerState.nitro),
        lap: `${Math.min(playerState.currentLap, TOTAL_LAPS)}/${TOTAL_LAPS}`,
        checkpoint: `${playerState.lastCheckpoint}/${TOTAL_CHECKPOINTS}`,
        lapTime: formatTime(playerState.currentLapTime),
        bestLap: playerState.bestLapTime === Infinity ? 'N/A' : formatTime(playerState.bestLapTime),
      },
    });

    // Check race finish
    if (playerState.finished) {
      console.log(`Race finished! Best lap: ${formatTime(playerState.bestLapTime)}`);
    }
  }

  // Reset
  if (keys['r']) {
    resetRace();
  }

  // Update camera
  updateCamera();

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

console.log(`
🏎️ Racing Game Profiler - 3Lens Example

Controls:
  WASD/Arrow Keys - Drive
  Space - Nitro boost
  R - Reset race
  ~ - Toggle 3Lens Overlay

Use 3Lens to inspect:
  - Vehicle physics (speed, gear, RPM, nitro)
  - Race progress (lap, checkpoint, lap times)
  - AI vehicle behavior and stats
  - Track and scene hierarchy
  - Performance metrics
`);

animate();
