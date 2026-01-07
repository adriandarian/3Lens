/**
 * Platformer Physics Debug - 3Lens Example
 *
 * Demonstrates 3Lens devtool integration for debugging:
 * - Jump mechanics (force, double jump, coyote time)
 * - Collision detection (AABB, raycasting)
 * - Movement physics (velocity, acceleration, friction)
 * - Player states (idle, running, jumping, falling, wall-sliding)
 * - Visual debug overlays (hitboxes, trajectories, velocity vectors)
 */

import * as THREE from 'three';
import { DevtoolProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ============================================================================
// Types
// ============================================================================

type PlayerState = 'idle' | 'running' | 'jumping' | 'falling' | 'wall-sliding' | 'dashing' | 'dead';

interface PlayerPhysics {
  position: THREE.Vector2;
  velocity: THREE.Vector2;
  acceleration: THREE.Vector2;
  grounded: boolean;
  jumpCount: number;
  maxJumps: number;
  coyoteTime: number;
  coyoteTimeMax: number;
  jumpBufferTime: number;
  jumpBufferMax: number;
  airTime: number;
  peakHeight: number;
  jumpStartY: number;
  state: PlayerState;
  facingRight: boolean;
  dashCooldown: number;
  dashDuration: number;
  wallSlideTime: number;
  lastCollision: string;
  touchingWallLeft: boolean;
  touchingWallRight: boolean;
  touchingCeiling: boolean;
}

interface Platform {
  mesh: THREE.Mesh;
  bounds: THREE.Box2;
  type: 'solid' | 'one-way' | 'moving' | 'hazard';
  moveSpeed?: number;
  moveAxis?: 'x' | 'y';
  moveRange?: number;
  startPos?: THREE.Vector2;
}

interface Coin {
  mesh: THREE.Mesh;
  collected: boolean;
  position: THREE.Vector2;
}

// ============================================================================
// Constants
// ============================================================================

const PHYSICS = {
  gravity: -30,
  jumpForce: 14,
  moveSpeed: 8,
  maxFallSpeed: -20,
  friction: 0.85,
  airControl: 0.6,
  coyoteTime: 0.15,
  jumpBuffer: 0.1,
  wallSlideSpeed: -3,
  wallJumpForce: { x: 10, y: 12 },
  dashSpeed: 20,
  dashDuration: 0.15,
  dashCooldown: 0.5,
};

const PLAYER_SIZE = { width: 0.8, height: 1.2 };

// ============================================================================
// Initialize Scene
// ============================================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.OrthographicCamera(
  -16, 16, 9, -9, 0.1, 100
);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('app')!.prepend(renderer.domElement);

// ============================================================================
// Initialize 3Lens DevTool
// ============================================================================

const probe = new DevtoolProbe({
  appName: 'Platformer Physics Debug',
});
probe.observeScene(scene);
probe.observeRenderer(renderer);

createOverlay(probe);

// ============================================================================
// Debug Visualization Groups
// ============================================================================

const debugGroup = new THREE.Group();
debugGroup.name = 'DebugVisualization';
scene.add(debugGroup);

const hitboxGroup = new THREE.Group();
hitboxGroup.name = 'Hitboxes';
debugGroup.add(hitboxGroup);

const trajectoryGroup = new THREE.Group();
trajectoryGroup.name = 'Trajectory';
debugGroup.add(trajectoryGroup);

const vectorGroup = new THREE.Group();
vectorGroup.name = 'Vectors';
vectorGroup.visible = false;
debugGroup.add(vectorGroup);

const raycastGroup = new THREE.Group();
raycastGroup.name = 'Raycasts';
raycastGroup.visible = false;
debugGroup.add(raycastGroup);

// ============================================================================
// Player
// ============================================================================

const playerGroup = new THREE.Group();
playerGroup.name = 'Player';

// Player body
const playerGeometry = new THREE.BoxGeometry(PLAYER_SIZE.width, PLAYER_SIZE.height, 0.5);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x44aaff });
const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
playerMesh.name = 'PlayerBody';
playerGroup.add(playerMesh);

// Player eyes
const eyeGeometry = new THREE.CircleGeometry(0.1, 8);
const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
leftEye.position.set(-0.15, 0.3, 0.26);
const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
rightEye.position.set(0.15, 0.3, 0.26);
playerGroup.add(leftEye, rightEye);

playerGroup.position.set(0, 2, 0);
scene.add(playerGroup);

// Player hitbox visualization
const hitboxGeometry = new THREE.EdgesGeometry(
  new THREE.BoxGeometry(PLAYER_SIZE.width, PLAYER_SIZE.height, 0.1)
);
const hitboxMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const playerHitbox = new THREE.LineSegments(hitboxGeometry, hitboxMaterial);
playerHitbox.name = 'PlayerHitbox';
hitboxGroup.add(playerHitbox);

// Player physics state
const player: PlayerPhysics = {
  position: new THREE.Vector2(0, 2),
  velocity: new THREE.Vector2(0, 0),
  acceleration: new THREE.Vector2(0, 0),
  grounded: false,
  jumpCount: 0,
  maxJumps: 2,
  coyoteTime: 0,
  coyoteTimeMax: PHYSICS.coyoteTime,
  jumpBufferTime: 0,
  jumpBufferMax: PHYSICS.jumpBuffer,
  airTime: 0,
  peakHeight: 0,
  jumpStartY: 0,
  state: 'idle',
  facingRight: true,
  dashCooldown: 0,
  dashDuration: 0,
  wallSlideTime: 0,
  lastCollision: 'None',
  touchingWallLeft: false,
  touchingWallRight: false,
  touchingCeiling: false,
};

// Register player with 3Lens
probe.registerLogicalEntity({
  id: 'player',
  name: 'Player Character',
  module: 'game/player',
  componentType: 'Player',
  tags: ['player', 'controllable', 'physics'],
  metadata: {
    state: 'idle',
    grounded: true,
    velocity: '0, 0',
    jumpCount: '0/2',
    position: '0, 2',
  },
});
probe.addObjectToEntity('player', playerGroup);

// ============================================================================
// Platforms
// ============================================================================

const platforms: Platform[] = [];
const platformGroup = new THREE.Group();
platformGroup.name = 'Platforms';
scene.add(platformGroup);

function createPlatform(
  x: number,
  y: number,
  width: number,
  height: number,
  type: Platform['type'] = 'solid',
  moveSpeed?: number,
  moveAxis?: 'x' | 'y',
  moveRange?: number
): Platform {
  const colors: Record<Platform['type'], number> = {
    solid: 0x444466,
    'one-way': 0x666644,
    moving: 0x446644,
    hazard: 0xff4444,
  };

  const geometry = new THREE.BoxGeometry(width, height, 0.5);
  const material = new THREE.MeshBasicMaterial({ color: colors[type] });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, 0);
  mesh.name = `Platform_${type}_${platforms.length}`;
  platformGroup.add(mesh);

  // Platform hitbox
  const hitboxGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, 0.1));
  const hitboxMat = new THREE.LineBasicMaterial({
    color: type === 'hazard' ? 0xff0000 : type === 'one-way' ? 0xffff00 : 0x00ff00,
  });
  const hitbox = new THREE.LineSegments(hitboxGeo, hitboxMat);
  hitbox.position.set(x, y, 0);
  hitbox.name = `Hitbox_${platforms.length}`;
  hitboxGroup.add(hitbox);

  const platform: Platform = {
    mesh,
    bounds: new THREE.Box2(
      new THREE.Vector2(x - width / 2, y - height / 2),
      new THREE.Vector2(x + width / 2, y + height / 2)
    ),
    type,
    moveSpeed,
    moveAxis,
    moveRange,
    startPos: moveSpeed ? new THREE.Vector2(x, y) : undefined,
  };

  platforms.push(platform);
  return platform;
}

// Create level platforms
// Ground
createPlatform(0, -7, 30, 1, 'solid');

// Platforms
createPlatform(-8, -4, 4, 0.5, 'solid');
createPlatform(-3, -2, 3, 0.5, 'one-way');
createPlatform(3, 0, 3, 0.5, 'solid');
createPlatform(8, 2, 4, 0.5, 'solid');
createPlatform(0, 4, 5, 0.5, 'moving', 3, 'x', 6);
createPlatform(-10, 0, 3, 0.5, 'solid');
createPlatform(-12, 3, 2, 0.5, 'solid');

// Walls for wall jumping
createPlatform(12, -2, 1, 8, 'solid');
createPlatform(-14, 0, 1, 6, 'solid');

// Hazards
createPlatform(5, -6, 3, 0.3, 'hazard');
createPlatform(-5, -6, 2, 0.3, 'hazard');

// Register platforms with 3Lens
probe.registerLogicalEntity({
  id: 'level',
  name: 'Level Geometry',
  module: 'game/level',
  componentType: 'Level',
  tags: ['level', 'platforms', 'static'],
  metadata: {
    platformCount: platforms.length,
    hazardCount: platforms.filter((p) => p.type === 'hazard').length,
    movingCount: platforms.filter((p) => p.type === 'moving').length,
  },
});
probe.addObjectToEntity('level', platformGroup);

// ============================================================================
// Coins
// ============================================================================

const coins: Coin[] = [];
const coinGroup = new THREE.Group();
coinGroup.name = 'Coins';
scene.add(coinGroup);

function createCoin(x: number, y: number): Coin {
  const geometry = new THREE.CircleGeometry(0.3, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xffd700 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, 0);
  mesh.name = `Coin_${coins.length}`;
  coinGroup.add(mesh);

  const coin: Coin = {
    mesh,
    collected: false,
    position: new THREE.Vector2(x, y),
  };
  coins.push(coin);
  return coin;
}

// Place coins
createCoin(-8, -3);
createCoin(-3, -1);
createCoin(3, 1);
createCoin(8, 3);
createCoin(0, 5);
createCoin(-10, 1);
createCoin(-12, 4);
createCoin(11, 2);

// ============================================================================
// Trajectory Visualization
// ============================================================================

const trajectoryPoints: THREE.Vector3[] = [];
const trajectoryGeometry = new THREE.BufferGeometry();
const trajectoryMaterial = new THREE.LineBasicMaterial({
  color: 0x44aaff,
  transparent: true,
  opacity: 0.5,
});
const trajectoryLine = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
trajectoryLine.name = 'JumpTrajectory';
trajectoryGroup.add(trajectoryLine);

function updateTrajectory(): void {
  trajectoryPoints.length = 0;

  if (player.grounded || player.state === 'wall-sliding') {
    const startX = player.position.x;
    const startY = player.position.y + PLAYER_SIZE.height / 2;
    const vx = player.velocity.x || (player.facingRight ? PHYSICS.moveSpeed : -PHYSICS.moveSpeed);
    let vy = PHYSICS.jumpForce;

    const dt = 0.05;
    let x = startX;
    let y = startY;

    for (let t = 0; t < 1.5; t += dt) {
      trajectoryPoints.push(new THREE.Vector3(x, y, 0));
      x += vx * dt;
      vy += PHYSICS.gravity * dt;
      y += vy * dt;

      if (y < startY - 5) break;
    }
  }

  trajectoryGeometry.setFromPoints(trajectoryPoints);
}

// ============================================================================
// Velocity Vector Visualization
// ============================================================================

const velocityArrow = new THREE.ArrowHelper(
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 0, 0),
  1,
  0xff4444
);
velocityArrow.name = 'VelocityVector';
vectorGroup.add(velocityArrow);

function updateVelocityVector(): void {
  const vel = new THREE.Vector3(player.velocity.x, player.velocity.y, 0);
  const length = vel.length();

  if (length > 0.1) {
    velocityArrow.visible = true;
    velocityArrow.position.set(player.position.x, player.position.y, 0);
    velocityArrow.setDirection(vel.normalize());
    velocityArrow.setLength(Math.min(length * 0.3, 3));
  } else {
    velocityArrow.visible = false;
  }
}

// ============================================================================
// Raycast Visualization
// ============================================================================

const raycastLines: THREE.Line[] = [];

function createRaycastLine(): THREE.Line {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({ color: 0xff00ff });
  const line = new THREE.Line(geometry, material);
  raycastGroup.add(line);
  raycastLines.push(line);
  return line;
}

// Create raycast lines for ground/wall detection
for (let i = 0; i < 6; i++) {
  createRaycastLine();
}

function updateRaycasts(): void {
  const halfW = PLAYER_SIZE.width / 2 - 0.1;
  const halfH = PLAYER_SIZE.height / 2;

  // Ground rays
  const groundRayLength = 0.2;
  const groundRays = [
    { start: new THREE.Vector3(player.position.x - halfW, player.position.y - halfH, 0), dir: new THREE.Vector3(0, -1, 0) },
    { start: new THREE.Vector3(player.position.x + halfW, player.position.y - halfH, 0), dir: new THREE.Vector3(0, -1, 0) },
  ];

  // Wall rays
  const wallRayLength = 0.2;
  const wallRays = [
    { start: new THREE.Vector3(player.position.x - halfW, player.position.y, 0), dir: new THREE.Vector3(-1, 0, 0) },
    { start: new THREE.Vector3(player.position.x + halfW, player.position.y, 0), dir: new THREE.Vector3(1, 0, 0) },
  ];

  // Ceiling rays
  const ceilingRays = [
    { start: new THREE.Vector3(player.position.x, player.position.y + halfH, 0), dir: new THREE.Vector3(0, 1, 0) },
  ];

  const allRays = [...groundRays, ...wallRays, ...ceilingRays];

  allRays.forEach((ray, i) => {
    if (raycastLines[i]) {
      const end = ray.start.clone().add(ray.dir.clone().multiplyScalar(0.3));
      raycastLines[i].geometry.setFromPoints([ray.start, end]);
    }
  });
}

// ============================================================================
// Input Handling
// ============================================================================

const keys: Record<string, boolean> = {};
let jumpPressed = false;
let dashPressed = false;

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  keys[e.code] = true;

  if ((e.key === ' ' || e.key.toLowerCase() === 'w') && !jumpPressed) {
    jumpPressed = true;
    player.jumpBufferTime = player.jumpBufferMax;
  }

  if (e.key === 'Shift' && !dashPressed) {
    dashPressed = true;
    tryDash();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
  keys[e.code] = false;

  if (e.key === ' ' || e.key.toLowerCase() === 'w') {
    jumpPressed = false;
  }

  if (e.key === 'Shift') {
    dashPressed = false;
  }
});

// ============================================================================
// Game State
// ============================================================================

let lives = 3;
let coinCount = 0;
let gameOver = false;

// ============================================================================
// Physics Update
// ============================================================================

function updatePhysics(deltaTime: number): void {
  if (gameOver || player.state === 'dead') return;

  // Handle dashing
  if (player.dashDuration > 0) {
    player.dashDuration -= deltaTime;
    if (player.dashDuration <= 0) {
      player.velocity.x *= 0.3;
    }
    return;
  }

  player.dashCooldown = Math.max(0, player.dashCooldown - deltaTime);

  // Horizontal input
  let inputX = 0;
  if (keys['a'] || keys['arrowleft']) inputX -= 1;
  if (keys['d'] || keys['arrowright']) inputX += 1;

  // Update facing direction
  if (inputX !== 0) {
    player.facingRight = inputX > 0;
  }

  // Apply horizontal movement
  const control = player.grounded ? 1 : PHYSICS.airControl;
  player.velocity.x += inputX * PHYSICS.moveSpeed * control * deltaTime * 10;

  // Apply friction
  if (player.grounded) {
    player.velocity.x *= PHYSICS.friction;
  } else {
    player.velocity.x *= 0.98;
  }

  // Clamp horizontal velocity
  player.velocity.x = THREE.MathUtils.clamp(player.velocity.x, -PHYSICS.moveSpeed, PHYSICS.moveSpeed);

  // Wall sliding
  player.touchingWallLeft = checkWallCollision('left');
  player.touchingWallRight = checkWallCollision('right');

  const touchingWall = player.touchingWallLeft || player.touchingWallRight;
  const holdingTowardsWall =
    (player.touchingWallLeft && inputX < 0) || (player.touchingWallRight && inputX > 0);

  if (!player.grounded && touchingWall && holdingTowardsWall && player.velocity.y < 0) {
    player.state = 'wall-sliding';
    player.velocity.y = Math.max(player.velocity.y, PHYSICS.wallSlideSpeed);
    player.wallSlideTime += deltaTime;
    player.jumpCount = 1; // Allow wall jump
  } else {
    player.wallSlideTime = 0;
  }

  // Apply gravity
  if (!player.grounded) {
    player.velocity.y += PHYSICS.gravity * deltaTime;
    player.velocity.y = Math.max(player.velocity.y, PHYSICS.maxFallSpeed);
    player.airTime += deltaTime;

    // Track peak height
    if (player.position.y > player.peakHeight) {
      player.peakHeight = player.position.y;
    }
  }

  // Coyote time
  if (player.grounded) {
    player.coyoteTime = player.coyoteTimeMax;
    player.jumpCount = 0;
    player.airTime = 0;
    player.peakHeight = player.position.y;
    player.jumpStartY = player.position.y;
  } else {
    player.coyoteTime = Math.max(0, player.coyoteTime - deltaTime);
  }

  // Jump buffer
  player.jumpBufferTime = Math.max(0, player.jumpBufferTime - deltaTime);

  // Handle jump
  if (player.jumpBufferTime > 0) {
    if (player.state === 'wall-sliding') {
      // Wall jump
      const wallDir = player.touchingWallLeft ? 1 : -1;
      player.velocity.x = PHYSICS.wallJumpForce.x * wallDir;
      player.velocity.y = PHYSICS.wallJumpForce.y;
      player.jumpCount = 1;
      player.jumpBufferTime = 0;
      player.coyoteTime = 0;
      player.grounded = false;
      player.jumpStartY = player.position.y;
      player.peakHeight = player.position.y;
    } else if (player.coyoteTime > 0 || player.jumpCount < player.maxJumps) {
      // Normal jump or double jump
      player.velocity.y = PHYSICS.jumpForce;
      player.jumpCount++;
      player.jumpBufferTime = 0;
      player.coyoteTime = 0;
      player.grounded = false;

      if (player.jumpCount === 1) {
        player.jumpStartY = player.position.y;
        player.peakHeight = player.position.y;
      }
    }
  }

  // Apply velocity
  player.position.x += player.velocity.x * deltaTime;
  player.position.y += player.velocity.y * deltaTime;

  // Collision detection
  handleCollisions();

  // Update state
  updatePlayerState();

  // Check coin collection
  checkCoinCollection();

  // Check hazards
  checkHazards();

  // Update visuals
  playerGroup.position.set(player.position.x, player.position.y, 0);
  playerHitbox.position.set(player.position.x, player.position.y, 0);

  // Flip player based on direction
  playerGroup.scale.x = player.facingRight ? 1 : -1;
}

function tryDash(): void {
  if (player.dashCooldown <= 0 && player.state !== 'dashing') {
    player.state = 'dashing';
    player.dashDuration = PHYSICS.dashDuration;
    player.dashCooldown = PHYSICS.dashCooldown;

    const dir = player.facingRight ? 1 : -1;
    player.velocity.x = PHYSICS.dashSpeed * dir;
    player.velocity.y = 0;
  }
}

function checkWallCollision(side: 'left' | 'right'): boolean {
  const halfW = PLAYER_SIZE.width / 2;
  const halfH = PLAYER_SIZE.height / 2;

  const checkX = side === 'left' ? player.position.x - halfW - 0.1 : player.position.x + halfW + 0.1;

  for (const platform of platforms) {
    if (platform.type === 'one-way' || platform.type === 'hazard') continue;

    const b = platform.bounds;
    if (
      checkX >= b.min.x &&
      checkX <= b.max.x &&
      player.position.y - halfH < b.max.y &&
      player.position.y + halfH > b.min.y
    ) {
      return true;
    }
  }
  return false;
}

function handleCollisions(): void {
  const halfW = PLAYER_SIZE.width / 2;
  const halfH = PLAYER_SIZE.height / 2;

  player.grounded = false;
  player.touchingCeiling = false;
  player.lastCollision = 'None';

  for (const platform of platforms) {
    if (platform.type === 'hazard') continue;

    const b = platform.bounds;

    // Player bounds
    const pLeft = player.position.x - halfW;
    const pRight = player.position.x + halfW;
    const pBottom = player.position.y - halfH;
    const pTop = player.position.y + halfH;

    // Check overlap
    if (pRight > b.min.x && pLeft < b.max.x && pTop > b.min.y && pBottom < b.max.y) {
      // Calculate overlap on each axis
      const overlapLeft = pRight - b.min.x;
      const overlapRight = b.max.x - pLeft;
      const overlapBottom = pTop - b.min.y;
      const overlapTop = b.max.y - pBottom;

      const minOverlapX = Math.min(overlapLeft, overlapRight);
      const minOverlapY = Math.min(overlapBottom, overlapTop);

      // One-way platforms only collide from above
      if (platform.type === 'one-way') {
        if (player.velocity.y < 0 && overlapBottom < 0.3 && pBottom > b.max.y - 0.3) {
          player.position.y = b.max.y + halfH;
          player.velocity.y = 0;
          player.grounded = true;
          player.lastCollision = 'One-way Platform';
        }
        continue;
      }

      // Resolve collision
      if (minOverlapX < minOverlapY) {
        // Horizontal collision
        if (overlapLeft < overlapRight) {
          player.position.x = b.min.x - halfW;
          player.lastCollision = 'Wall (Right)';
        } else {
          player.position.x = b.max.x + halfW;
          player.lastCollision = 'Wall (Left)';
        }
        player.velocity.x = 0;
      } else {
        // Vertical collision
        if (overlapBottom < overlapTop) {
          // Landing on top
          player.position.y = b.max.y + halfH;
          player.velocity.y = 0;
          player.grounded = true;
          player.lastCollision = 'Ground';
        } else {
          // Hitting ceiling
          player.position.y = b.min.y - halfH;
          player.velocity.y = 0;
          player.touchingCeiling = true;
          player.lastCollision = 'Ceiling';
        }
      }
    }
  }

  // World bounds
  if (player.position.x < -15) {
    player.position.x = -15;
    player.velocity.x = 0;
  }
  if (player.position.x > 15) {
    player.position.x = 15;
    player.velocity.x = 0;
  }

  // Fall death
  if (player.position.y < -10) {
    takeDamage();
  }
}

function updatePlayerState(): void {
  if (player.state === 'dead' || player.state === 'dashing') return;

  if (player.state === 'wall-sliding') {
    // Already handled
  } else if (player.grounded) {
    if (Math.abs(player.velocity.x) > 0.5) {
      player.state = 'running';
    } else {
      player.state = 'idle';
    }
  } else {
    if (player.velocity.y > 0) {
      player.state = 'jumping';
    } else {
      player.state = 'falling';
    }
  }
}

function checkCoinCollection(): void {
  const halfW = PLAYER_SIZE.width / 2;
  const halfH = PLAYER_SIZE.height / 2;

  for (const coin of coins) {
    if (coin.collected) continue;

    const dist = new THREE.Vector2(
      player.position.x - coin.position.x,
      player.position.y - coin.position.y
    ).length();

    if (dist < 0.6) {
      coin.collected = true;
      coin.mesh.visible = false;
      coinCount++;
      updateCoinUI();
    }
  }
}

function checkHazards(): void {
  const halfW = PLAYER_SIZE.width / 2;
  const halfH = PLAYER_SIZE.height / 2;

  for (const platform of platforms) {
    if (platform.type !== 'hazard') continue;

    const b = platform.bounds;
    if (
      player.position.x + halfW > b.min.x &&
      player.position.x - halfW < b.max.x &&
      player.position.y + halfH > b.min.y &&
      player.position.y - halfH < b.max.y
    ) {
      takeDamage();
      break;
    }
  }
}

function takeDamage(): void {
  lives--;
  updateLivesUI();

  if (lives <= 0) {
    player.state = 'dead';
    gameOver = true;
    showGameOver();
  } else {
    // Respawn
    player.position.set(0, 2);
    player.velocity.set(0, 0);
    player.grounded = false;
    player.jumpCount = 0;
  }
}

// ============================================================================
// Moving Platforms
// ============================================================================

function updateMovingPlatforms(time: number): void {
  for (const platform of platforms) {
    if (platform.type !== 'moving' || !platform.startPos || !platform.moveSpeed || !platform.moveRange) {
      continue;
    }

    const offset = Math.sin(time * platform.moveSpeed) * platform.moveRange;
    const newX = platform.moveAxis === 'x' ? platform.startPos.x + offset : platform.startPos.x;
    const newY = platform.moveAxis === 'y' ? platform.startPos.y + offset : platform.startPos.y;

    // Update mesh position
    platform.mesh.position.set(newX, newY, 0);

    // Update bounds
    const geometry = platform.mesh.geometry as THREE.BoxGeometry;
    const width = geometry.parameters.width;
    const height = geometry.parameters.height;
    platform.bounds.min.set(newX - width / 2, newY - height / 2);
    platform.bounds.max.set(newX + width / 2, newY + height / 2);

    // Update hitbox
    const hitboxIndex = platforms.indexOf(platform);
    const hitbox = hitboxGroup.children[hitboxIndex];
    if (hitbox) {
      hitbox.position.set(newX, newY, 0);
    }
  }
}

// ============================================================================
// UI Updates
// ============================================================================

function updateUI(): void {
  // Position
  document.getElementById('pos-x')!.textContent = player.position.x.toFixed(2);
  document.getElementById('pos-y')!.textContent = player.position.y.toFixed(2);
  document.getElementById('speed')!.textContent = player.velocity.length().toFixed(2);

  // Velocity
  document.getElementById('vel-x')!.textContent = player.velocity.x.toFixed(2);
  document.getElementById('vel-y')!.textContent = player.velocity.y.toFixed(2);

  // Velocity bars
  const maxVel = PHYSICS.moveSpeed;
  const velXPercent = ((player.velocity.x / maxVel) * 50 + 50);
  const velYPercent = ((player.velocity.y / 20) * 50 + 50);
  document.getElementById('vel-x-bar')!.style.width = `${THREE.MathUtils.clamp(velXPercent, 0, 100)}%`;
  document.getElementById('vel-y-bar')!.style.width = `${THREE.MathUtils.clamp(velYPercent, 0, 100)}%`;

  // Jump mechanics
  document.getElementById('jump-force')!.textContent = PHYSICS.jumpForce.toFixed(2);
  document.getElementById('jump-count')!.textContent = `${player.jumpCount} / ${player.maxJumps}`;
  document.getElementById('air-time')!.textContent = `${player.airTime.toFixed(2)}s`;
  document.getElementById('peak-height')!.textContent = (player.peakHeight - player.jumpStartY).toFixed(2);

  // Physics constants
  document.getElementById('gravity')!.textContent = PHYSICS.gravity.toFixed(2);
  document.getElementById('friction')!.textContent = PHYSICS.friction.toFixed(2);
  document.getElementById('air-control')!.textContent = PHYSICS.airControl.toFixed(2);

  // Collision indicators
  document.getElementById('col-bottom')!.className = `collision-dot ${player.grounded ? 'active' : ''}`;
  document.getElementById('col-top')!.className = `collision-dot ${player.touchingCeiling ? 'active' : ''}`;
  document.getElementById('col-left')!.className = `collision-dot ${player.touchingWallLeft ? 'active' : ''}`;
  document.getElementById('col-right')!.className = `collision-dot ${player.touchingWallRight ? 'active' : ''}`;
  document.getElementById('last-collision')!.textContent = player.lastCollision;

  // Current platform
  let currentPlatform = 'Air';
  if (player.grounded) {
    for (const platform of platforms) {
      if (
        player.position.x >= platform.bounds.min.x &&
        player.position.x <= platform.bounds.max.x &&
        Math.abs(player.position.y - PLAYER_SIZE.height / 2 - platform.bounds.max.y) < 0.2
      ) {
        currentPlatform = platform.type.charAt(0).toUpperCase() + platform.type.slice(1);
        break;
      }
    }
  }
  document.getElementById('current-platform')!.textContent = currentPlatform;

  // Player state
  const stateEl = document.getElementById('state-value')!;
  stateEl.textContent = player.state.toUpperCase().replace('-', ' ');
  stateEl.className = player.state;

  // Coyote time indicator
  const coyoteIndicator = document.getElementById('coyote-indicator')!;
  if (player.coyoteTime > 0 && !player.grounded) {
    coyoteIndicator.classList.add('visible');
    const percent = (player.coyoteTime / player.coyoteTimeMax) * 100;
    document.getElementById('coyote-fill')!.style.width = `${percent}%`;
  } else {
    coyoteIndicator.classList.remove('visible');
  }

  // Trajectory info
  if (player.grounded || player.state === 'wall-sliding') {
    const maxHeight = (PHYSICS.jumpForce * PHYSICS.jumpForce) / (2 * Math.abs(PHYSICS.gravity));
    const airTime = (2 * PHYSICS.jumpForce) / Math.abs(PHYSICS.gravity);
    const distance = Math.abs(player.velocity.x || PHYSICS.moveSpeed) * airTime;

    document.getElementById('traj-height')!.textContent = maxHeight.toFixed(2);
    document.getElementById('traj-distance')!.textContent = distance.toFixed(2);
  }
}

function updateCoinUI(): void {
  document.getElementById('coin-count')!.textContent = String(coinCount);
}

function updateLivesUI(): void {
  for (let i = 1; i <= 3; i++) {
    const heart = document.getElementById(`heart-${i}`)!;
    heart.classList.toggle('empty', i > lives);
  }
}

function showGameOver(): void {
  const overlay = document.getElementById('game-overlay')!;
  overlay.style.display = 'flex';
  overlay.className = 'game-over';
  overlay.querySelector('h2')!.textContent = 'GAME OVER';
}

// ============================================================================
// Debug Toggle Buttons
// ============================================================================

document.getElementById('toggle-hitboxes')!.addEventListener('click', (e) => {
  const btn = e.target as HTMLButtonElement;
  btn.classList.toggle('active');
  hitboxGroup.visible = btn.classList.contains('active');
});

document.getElementById('toggle-trajectory')!.addEventListener('click', (e) => {
  const btn = e.target as HTMLButtonElement;
  btn.classList.toggle('active');
  trajectoryGroup.visible = btn.classList.contains('active');
});

document.getElementById('toggle-vectors')!.addEventListener('click', (e) => {
  const btn = e.target as HTMLButtonElement;
  btn.classList.toggle('active');
  vectorGroup.visible = btn.classList.contains('active');
});

document.getElementById('toggle-rays')!.addEventListener('click', (e) => {
  const btn = e.target as HTMLButtonElement;
  btn.classList.toggle('active');
  raycastGroup.visible = btn.classList.contains('active');
});

// ============================================================================
// Reset Game
// ============================================================================

function resetGame(): void {
  player.position.set(0, 2);
  player.velocity.set(0, 0);
  player.grounded = false;
  player.jumpCount = 0;
  player.state = 'idle';
  player.airTime = 0;
  player.peakHeight = 0;
  player.jumpStartY = 0;
  player.coyoteTime = 0;
  player.dashCooldown = 0;
  player.dashDuration = 0;

  lives = 3;
  coinCount = 0;
  gameOver = false;

  // Reset coins
  for (const coin of coins) {
    coin.collected = false;
    coin.mesh.visible = true;
  }

  updateLivesUI();
  updateCoinUI();

  document.getElementById('game-overlay')!.style.display = 'none';
}

// ============================================================================
// Camera Follow
// ============================================================================

function updateCamera(): void {
  const targetX = THREE.MathUtils.clamp(player.position.x, -8, 8);
  const targetY = THREE.MathUtils.clamp(player.position.y, -2, 4);

  camera.position.x += (targetX - camera.position.x) * 0.1;
  camera.position.y += (targetY - camera.position.y) * 0.1;
}

// ============================================================================
// Update 3Lens Metadata
// ============================================================================

function update3LensMetadata(): void {
  probe.updateLogicalEntity('player', {
    metadata: {
      state: player.state,
      grounded: player.grounded,
      velocity: `${player.velocity.x.toFixed(1)}, ${player.velocity.y.toFixed(1)}`,
      jumpCount: `${player.jumpCount}/${player.maxJumps}`,
      position: `${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}`,
      airTime: player.airTime.toFixed(2),
      coyoteTime: player.coyoteTime.toFixed(3),
      wallSliding: player.state === 'wall-sliding',
      touchingWalls: `L:${player.touchingWallLeft} R:${player.touchingWallRight}`,
      peakHeight: (player.peakHeight - player.jumpStartY).toFixed(2),
    },
  });
}

// ============================================================================
// Animation Loop
// ============================================================================

const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);

  const deltaTime = Math.min(clock.getDelta(), 0.1);
  const time = clock.getElapsedTime();

  // Reset on R key
  if (keys['r']) {
    resetGame();
    keys['r'] = false;
  }

  // Update physics
  updatePhysics(deltaTime);

  // Update moving platforms
  updateMovingPlatforms(time);

  // Update debug visualizations
  updateTrajectory();
  updateVelocityVector();
  updateRaycasts();

  // Update camera
  updateCamera();

  // Update UI
  updateUI();

  // Update 3Lens
  update3LensMetadata();

  // Animate coins
  for (const coin of coins) {
    if (!coin.collected) {
      coin.mesh.rotation.z = time * 2;
      coin.mesh.position.y = coin.position.y + Math.sin(time * 3) * 0.1;
    }
  }

  renderer.render(scene, camera);
}

// ============================================================================
// Window Resize
// ============================================================================

window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  const viewSize = 18;

  camera.left = -viewSize * aspect / 2;
  camera.right = viewSize * aspect / 2;
  camera.top = viewSize / 2;
  camera.bottom = -viewSize / 2;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initial resize
window.dispatchEvent(new Event('resize'));

// ============================================================================
// Start
// ============================================================================

console.log('🎮 Platformer Physics Debug - 3Lens Example');
console.log('Press ~ to toggle 3Lens devtool overlay');
console.log('Controls: A/D or Arrow Keys to move, Space/W to jump, Shift to dash, R to reset');

animate();
