/**
 * Platformer Physics Debug - 3Lens Example
 *
 * Demonstrates 3Lens devtool integration for debugging:
 * - Jump mechanics (force, double jump, coyote time)
 * - Collision detection (AABB)
 * - Movement physics (velocity, acceleration, friction)
 * - Player states (idle, running, jumping, falling, wall-sliding)
 */

import * as THREE from 'three';
import { DevtoolProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// Types
// ============================================================================

type PlayerState = 'idle' | 'running' | 'jumping' | 'falling' | 'wall-sliding' | 'dashing' | 'dead';

interface PlayerPhysics {
  position: THREE.Vector2;
  velocity: THREE.Vector2;
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

const overlay = createOverlay(probe);

// Register player entity
probe.registerLogicalEntity({
  name: 'Player',
  module: 'game/player',
  componentType: 'PlayerController',
  componentId: 'player',
  tags: ['player', 'physics'],
  metadata: {
    state: 'idle',
    grounded: false,
    velocity: '0, 0',
    jumpCount: '0/2',
  },
});

// Register physics system
probe.registerLogicalEntity({
  name: 'Physics System',
  module: 'game/physics',
  componentType: 'PhysicsEngine',
  tags: ['physics', 'system'],
  metadata: {
    gravity: PHYSICS.gravity,
    friction: PHYSICS.friction,
    coyoteTime: PHYSICS.coyoteTime,
    jumpBuffer: PHYSICS.jumpBuffer,
  },
});

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

// Player physics state
const player: PlayerPhysics = {
  position: new THREE.Vector2(0, 2),
  velocity: new THREE.Vector2(0, 0),
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
  touchingWallLeft: false,
  touchingWallRight: false,
  touchingCeiling: false,
};

// ============================================================================
// Platforms
// ============================================================================

const platforms: Platform[] = [];
const coins: Coin[] = [];
let coinCount = 0;
let lives = 3;
let gameOver = false;

function createPlatform(
  x: number, y: number,
  width: number, height: number,
  type: Platform['type'] = 'solid',
  moveConfig?: { axis: 'x' | 'y'; speed: number; range: number }
): Platform {
  const geometry = new THREE.BoxGeometry(width, height, 0.5);
  
  let color = 0x4a5568;
  if (type === 'one-way') color = 0x9333ea;
  if (type === 'moving') color = 0x22c55e;
  if (type === 'hazard') color = 0xef4444;
  
  const material = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, 0);
  mesh.name = `Platform_${platforms.length}_${type}`;
  scene.add(mesh);

  const platform: Platform = {
    mesh,
    bounds: new THREE.Box2(
      new THREE.Vector2(x - width / 2, y - height / 2),
      new THREE.Vector2(x + width / 2, y + height / 2)
    ),
    type,
  };

  if (moveConfig) {
    platform.moveAxis = moveConfig.axis;
    platform.moveSpeed = moveConfig.speed;
    platform.moveRange = moveConfig.range;
    platform.startPos = new THREE.Vector2(x, y);
  }

  platforms.push(platform);
  return platform;
}

function createCoin(x: number, y: number): Coin {
  const geometry = new THREE.CircleGeometry(0.3, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, 0.1);
  mesh.name = `Coin_${coins.length}`;
  scene.add(mesh);

  const coin: Coin = {
    mesh,
    collected: false,
    position: new THREE.Vector2(x, y),
  };
  coins.push(coin);
  return coin;
}

// Create level
function createLevel() {
  // Ground
  createPlatform(0, -5, 30, 1);
  
  // Platforms
  createPlatform(-8, -2, 4, 0.5);
  createPlatform(0, 0, 4, 0.5);
  createPlatform(8, -2, 4, 0.5);
  
  // One-way platforms
  createPlatform(-4, 2, 3, 0.3, 'one-way');
  createPlatform(4, 2, 3, 0.3, 'one-way');
  
  // Moving platform
  createPlatform(0, 4, 3, 0.5, 'moving', { axis: 'x', speed: 2, range: 5 });
  
  // High platforms
  createPlatform(-10, 5, 3, 0.5);
  createPlatform(10, 5, 3, 0.5);
  
  // Hazard
  createPlatform(0, -4.5, 4, 0.3, 'hazard');
  
  // Walls
  createPlatform(-14, 0, 1, 10);
  createPlatform(14, 0, 1, 10);
  
  // Coins
  createCoin(-8, 0);
  createCoin(0, 2);
  createCoin(8, 0);
  createCoin(-10, 7);
  createCoin(10, 7);
  createCoin(0, 6);
}

createLevel();

// ============================================================================
// Input
// ============================================================================

const keys: Record<string, boolean> = {};

document.addEventListener('keydown', (e) => {
  keys[e.code.toLowerCase()] = true;
  
  // Jump
  if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
    player.jumpBufferTime = player.jumpBufferMax;
  }
  
  // Dash
  if (e.code === 'ShiftLeft' && player.dashCooldown <= 0 && player.state !== 'dashing') {
    player.state = 'dashing';
    player.dashDuration = PHYSICS.dashDuration;
    player.dashCooldown = PHYSICS.dashCooldown;
    player.velocity.x = player.facingRight ? PHYSICS.dashSpeed : -PHYSICS.dashSpeed;
    player.velocity.y = 0;
  }
  
  // Toggle overlay
  if (e.code === 'Backquote') {
    overlay.toggle();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code.toLowerCase()] = false;
});

// ============================================================================
// Physics Update
// ============================================================================

function updatePhysics(deltaTime: number): void {
  if (gameOver || player.state === 'dead') return;

  // Dash state
  if (player.state === 'dashing') {
    player.dashDuration -= deltaTime;
    if (player.dashDuration <= 0) {
      player.state = player.grounded ? 'idle' : 'falling';
      player.velocity.x *= 0.5;
    }
    player.position.x += player.velocity.x * deltaTime;
    playerGroup.position.set(player.position.x, player.position.y, 0);
    checkCollisions();
    return;
  }

  // Cooldowns
  player.dashCooldown = Math.max(0, player.dashCooldown - deltaTime);

  // Input
  let inputX = 0;
  if (keys['keya'] || keys['arrowleft']) inputX -= 1;
  if (keys['keyd'] || keys['arrowright']) inputX += 1;

  // Facing direction
  if (inputX !== 0) {
    player.facingRight = inputX > 0;
    playerGroup.scale.x = player.facingRight ? 1 : -1;
  }

  // Horizontal movement
  const control = player.grounded ? 1 : PHYSICS.airControl;
  player.velocity.x += inputX * PHYSICS.moveSpeed * control * deltaTime * 10;
  player.velocity.x *= PHYSICS.friction;

  // Coyote time
  if (player.grounded) {
    player.coyoteTime = player.coyoteTimeMax;
    player.jumpCount = 0;
    player.airTime = 0;
  } else {
    player.coyoteTime = Math.max(0, player.coyoteTime - deltaTime);
    player.airTime += deltaTime;
  }

  // Jump buffer
  player.jumpBufferTime = Math.max(0, player.jumpBufferTime - deltaTime);

  // Jump
  const canJump = player.coyoteTime > 0 || player.jumpCount < player.maxJumps;
  if (player.jumpBufferTime > 0 && canJump) {
    player.velocity.y = PHYSICS.jumpForce;
    player.jumpCount++;
    player.jumpBufferTime = 0;
    player.coyoteTime = 0;
    player.jumpStartY = player.position.y;
    player.peakHeight = player.position.y;
    player.grounded = false;
  }

  // Wall slide
  player.touchingWallLeft = false;
  player.touchingWallRight = false;
  
  // Gravity
  if (!player.grounded) {
    player.velocity.y += PHYSICS.gravity * deltaTime;
    player.velocity.y = Math.max(player.velocity.y, PHYSICS.maxFallSpeed);
    
    // Track peak height
    if (player.position.y > player.peakHeight) {
      player.peakHeight = player.position.y;
    }
  }

  // Apply velocity
  player.position.x += player.velocity.x * deltaTime;
  player.position.y += player.velocity.y * deltaTime;

  // Update mesh
  playerGroup.position.set(player.position.x, player.position.y, 0);

  // Collision detection
  checkCollisions();

  // Update state
  updatePlayerState();

  // Collect coins
  checkCoinCollection();

  // Check hazards
  checkHazards();
}

function checkCollisions(): void {
  const halfW = PLAYER_SIZE.width / 2;
  const halfH = PLAYER_SIZE.height / 2;

  player.grounded = false;
  player.touchingCeiling = false;

  for (const platform of platforms) {
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
        }
        continue;
      }

      // Resolve collision
      if (minOverlapX < minOverlapY) {
        // Horizontal collision
        if (overlapLeft < overlapRight) {
          player.position.x = b.min.x - halfW;
          player.touchingWallRight = true;
        } else {
          player.position.x = b.max.x + halfW;
          player.touchingWallLeft = true;
        }
        player.velocity.x = 0;
      } else {
        // Vertical collision
        if (overlapBottom < overlapTop) {
          // Landing on top
          player.position.y = b.max.y + halfH;
          player.velocity.y = 0;
          player.grounded = true;
        } else {
          // Hitting ceiling
          player.position.y = b.min.y - halfH;
          player.velocity.y = 0;
          player.touchingCeiling = true;
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

  if (player.grounded) {
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

  if (lives <= 0) {
    player.state = 'dead';
    gameOver = true;
    console.log('Game Over! Press R to restart.');
  } else {
    // Respawn
    player.position.set(0, 2);
    player.velocity.set(0, 0);
    player.grounded = false;
    player.jumpCount = 0;
  }
}

function resetGame(): void {
  player.position.set(0, 2);
  player.velocity.set(0, 0);
  player.grounded = false;
  player.jumpCount = 0;
  player.state = 'idle';
  lives = 3;
  coinCount = 0;
  gameOver = false;
  
  for (const coin of coins) {
    coin.collected = false;
    coin.mesh.visible = true;
  }
  
  playerGroup.position.set(0, 2, 0);
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
  }
}

// ============================================================================
// Camera
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
      lives,
      coins: coinCount,
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
  if (keys['keyr']) {
    resetGame();
    keys['keyr'] = false;
  }

  // Update physics
  updatePhysics(deltaTime);

  // Update moving platforms
  updateMovingPlatforms(time);

  // Update camera
  updateCamera();

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

console.log(`
🎮 Platformer Physics Debug - 3Lens Example

Controls:
  A/D or Arrow Keys - Move
  Space/W - Jump (double jump available)
  Shift - Dash
  R - Reset
  ~ - Toggle 3Lens Overlay

Use 3Lens to inspect:
  - Player physics state (velocity, position, grounded)
  - Jump mechanics (coyote time, jump buffer, air time)
  - Platform collisions and types
  - Performance metrics
`);

animate();
