import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ───────────────────────────────────────────────────────────────
// Types & Interfaces
// ───────────────────────────────────────────────────────────────

interface Enemy {
  id: number;
  mesh: THREE.Group;
  health: number;
  maxHealth: number;
  speed: number;
  state: 'idle' | 'chasing' | 'attacking' | 'dead';
  lastAttackTime: number;
  attackCooldown: number;
}

interface Bullet {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  trail?: THREE.Line;
  lifetime: number;
}

interface GameState {
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  reserveAmmo: number;
  score: number;
  wave: number;
  kills: number;
  shots: number;
  hits: number;
  isPlaying: boolean;
  isPaused: boolean;
}

// ───────────────────────────────────────────────────────────────
// Game Constants
// ───────────────────────────────────────────────────────────────

const PLAYER_HEIGHT = 1.8;
const PLAYER_SPEED = 8;
const PLAYER_SPRINT_MULTIPLIER = 1.5;
const PLAYER_JUMP_FORCE = 8;
const GRAVITY = 20;
const BULLET_SPEED = 80;
const BULLET_DAMAGE = 25;
const ENEMY_DAMAGE = 10;
const RELOAD_TIME = 1500;
const FIRE_RATE = 100;

// ───────────────────────────────────────────────────────────────
// Scene Setup
// ───────────────────────────────────────────────────────────────

const container = document.getElementById('canvas-container')!;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, PLAYER_HEIGHT, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Pointer Lock Controls
const controls = new PointerLockControls(camera, renderer.domElement);

// ───────────────────────────────────────────────────────────────
// 3Lens Integration
// ───────────────────────────────────────────────────────────────

const probe = createProbe({
  appName: 'FPS Arena',
});
probe.observeScene(scene);
probe.observeRenderer(renderer);

const overlay = createOverlay(probe);

probe.registerLogicalEntity({
  name: 'Player',
  module: 'game/player',
  componentType: 'PlayerController',
  tags: ['player', 'controllable'],
  metadata: {
    health: 100,
    ammo: 30,
  },
});

probe.registerLogicalEntity({
  name: 'Arena',
  module: 'game/world',
  componentType: 'Environment',
  tags: ['arena', 'static'],
  metadata: {
    size: '100x100',
    coverObjects: 9,
  },
});

// ───────────────────────────────────────────────────────────────
// Lighting
// ───────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 200;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

// ───────────────────────────────────────────────────────────────
// Arena Setup
// ───────────────────────────────────────────────────────────────

function createArena() {
  const arenaGroup = new THREE.Group();
  arenaGroup.name = 'Arena';

  // Floor
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a5568,
    roughness: 0.8,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'Floor';
  arenaGroup.add(floor);

  // Grid overlay
  const gridHelper = new THREE.GridHelper(100, 50, 0x666666, 0x444444);
  gridHelper.position.y = 0.01;
  gridHelper.name = 'GridHelper';
  arenaGroup.add(gridHelper);

  // Walls
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x374151,
    roughness: 0.7,
  });

  const wallHeight = 6;
  const wallPositions = [
    { x: 0, z: -50, rotY: 0 },
    { x: 0, z: 50, rotY: Math.PI },
    { x: -50, z: 0, rotY: Math.PI / 2 },
    { x: 50, z: 0, rotY: -Math.PI / 2 },
  ];

  wallPositions.forEach((pos, i) => {
    const wallGeometry = new THREE.BoxGeometry(100, wallHeight, 1);
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(pos.x, wallHeight / 2, pos.z);
    wall.rotation.y = pos.rotY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.name = `Wall_${i}`;
    arenaGroup.add(wall);
  });

  // Cover obstacles
  const coverMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b7280,
    roughness: 0.6,
  });

  const coverPositions = [
    { x: -15, z: -15, w: 4, h: 2, d: 1 },
    { x: 15, z: -15, w: 4, h: 2, d: 1 },
    { x: -15, z: 15, w: 4, h: 2, d: 1 },
    { x: 15, z: 15, w: 4, h: 2, d: 1 },
    { x: 0, z: 0, w: 2, h: 3, d: 2 },
    { x: -25, z: 0, w: 1, h: 2.5, d: 6 },
    { x: 25, z: 0, w: 1, h: 2.5, d: 6 },
    { x: 0, z: -30, w: 8, h: 1.5, d: 1 },
    { x: 0, z: 30, w: 8, h: 1.5, d: 1 },
  ];

  coverPositions.forEach((cover, i) => {
    const coverGeometry = new THREE.BoxGeometry(cover.w, cover.h, cover.d);
    const coverMesh = new THREE.Mesh(coverGeometry, coverMaterial);
    coverMesh.position.set(cover.x, cover.h / 2, cover.z);
    coverMesh.castShadow = true;
    coverMesh.receiveShadow = true;
    coverMesh.name = `Cover_${i}`;
    arenaGroup.add(coverMesh);
  });

  scene.add(arenaGroup);
  return arenaGroup;
}

const arena = createArena();

// ───────────────────────────────────────────────────────────────
// Game State
// ───────────────────────────────────────────────────────────────

const gameState: GameState = {
  health: 100,
  maxHealth: 100,
  ammo: 30,
  maxAmmo: 30,
  reserveAmmo: 90,
  score: 0,
  wave: 1,
  kills: 0,
  shots: 0,
  hits: 0,
  isPlaying: false,
  isPaused: false,
};

const enemies: Enemy[] = [];
const bullets: Bullet[] = [];
const playerVelocity = new THREE.Vector3();
let isOnGround = true;
let isSprinting = false;
let isReloading = false;
let lastFireTime = 0;
let enemyIdCounter = 0;

// ───────────────────────────────────────────────────────────────
// Enemy System
// ───────────────────────────────────────────────────────────────

function createEnemy(position: THREE.Vector3): Enemy {
  const group = new THREE.Group();
  group.name = `Enemy_${enemyIdCounter}`;

  // Body
  const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xef4444 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 1;
  body.castShadow = true;
  group.add(body);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.15, 1.4, 0.3);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.15, 1.4, 0.3);
  group.add(rightEye);

  group.position.copy(position);
  scene.add(group);

  const enemy: Enemy = {
    id: enemyIdCounter++,
    mesh: group,
    health: 100,
    maxHealth: 100,
    speed: 3 + Math.random() * 2,
    state: 'idle',
    lastAttackTime: 0,
    attackCooldown: 1000,
  };

  enemies.push(enemy);

  probe.registerLogicalEntity({
    name: group.name,
    module: 'game/enemies',
    componentType: 'Enemy',
    componentId: `enemy_${enemy.id}`,
    tags: ['enemy', 'ai'],
    metadata: {
      health: enemy.health,
      state: enemy.state,
      speed: enemy.speed.toFixed(1),
    },
  });

  return enemy;
}

function updateEnemy(enemy: Enemy, delta: number) {
  if (enemy.state === 'dead') return;

  const distanceToPlayer = enemy.mesh.position.distanceTo(camera.position);

  // State machine
  if (distanceToPlayer < 2) {
    enemy.state = 'attacking';
    const now = Date.now();
    if (now - enemy.lastAttackTime > enemy.attackCooldown) {
      gameState.health -= ENEMY_DAMAGE;
      enemy.lastAttackTime = now;
      
      if (gameState.health <= 0) {
        gameOver();
      }
    }
  } else if (distanceToPlayer < 30) {
    enemy.state = 'chasing';
    const direction = new THREE.Vector3()
      .subVectors(camera.position, enemy.mesh.position)
      .normalize();
    direction.y = 0;
    enemy.mesh.position.add(direction.multiplyScalar(enemy.speed * delta));
    enemy.mesh.lookAt(camera.position.x, enemy.mesh.position.y, camera.position.z);
  } else {
    enemy.state = 'idle';
  }

  // Update 3Lens metadata
  probe.updateLogicalEntity(`enemy_${enemy.id}`, {
    metadata: {
      health: enemy.health,
      state: enemy.state,
      distance: distanceToPlayer.toFixed(1),
    },
  });
}

function damageEnemy(enemy: Enemy, damage: number) {
  enemy.health -= damage;
  gameState.hits++;

  if (enemy.health <= 0) {
    enemy.state = 'dead';
    gameState.kills++;
    gameState.score += 100;
    removeEnemy(enemy);
    checkWaveComplete();
  }
}

function removeEnemy(enemy: Enemy) {
  const index = enemies.indexOf(enemy);
  if (index > -1) {
    enemies.splice(index, 1);
    scene.remove(enemy.mesh);
    probe.unregisterLogicalEntity(`enemy_${enemy.id}`);
  }
}

// ───────────────────────────────────────────────────────────────
// Bullet System
// ───────────────────────────────────────────────────────────────

function shoot() {
  if (isReloading || gameState.ammo <= 0) return;
  
  const now = Date.now();
  if (now - lastFireTime < FIRE_RATE) return;
  lastFireTime = now;

  gameState.ammo--;
  gameState.shots++;

  const bulletGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bulletMesh.position.copy(camera.position);
  scene.add(bulletMesh);

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  const bullet: Bullet = {
    mesh: bulletMesh,
    velocity: direction.multiplyScalar(BULLET_SPEED),
    lifetime: 2,
  };

  bullets.push(bullet);
}

function updateBullet(bullet: Bullet, delta: number) {
  bullet.mesh.position.add(bullet.velocity.clone().multiplyScalar(delta));
  bullet.lifetime -= delta;

  if (bullet.lifetime <= 0) {
    removeBullet(bullet);
    return;
  }

  // Check enemy collisions
  for (const enemy of enemies) {
    if (enemy.state === 'dead') continue;
    
    const distance = bullet.mesh.position.distanceTo(enemy.mesh.position);
    if (distance < 1) {
      damageEnemy(enemy, BULLET_DAMAGE);
      removeBullet(bullet);
      return;
    }
  }
}

function removeBullet(bullet: Bullet) {
  const index = bullets.indexOf(bullet);
  if (index > -1) {
    bullets.splice(index, 1);
    scene.remove(bullet.mesh);
  }
}

function reload() {
  if (isReloading || gameState.ammo === gameState.maxAmmo || gameState.reserveAmmo <= 0) return;

  isReloading = true;
  setTimeout(() => {
    const needed = gameState.maxAmmo - gameState.ammo;
    const available = Math.min(needed, gameState.reserveAmmo);
    gameState.ammo += available;
    gameState.reserveAmmo -= available;
    isReloading = false;
  }, RELOAD_TIME);
}

// ───────────────────────────────────────────────────────────────
// Player Movement
// ───────────────────────────────────────────────────────────────

const keys: Record<string, boolean> = {};

function updatePlayer(delta: number) {
  const speed = isSprinting ? PLAYER_SPEED * PLAYER_SPRINT_MULTIPLIER : PLAYER_SPEED;

  // Movement
  const moveForward = Number(keys['KeyW']) - Number(keys['KeyS']);
  const moveRight = Number(keys['KeyD']) - Number(keys['KeyA']);

  const direction = new THREE.Vector3();
  direction.z = -moveForward;
  direction.x = moveRight;
  direction.normalize();

  if (moveForward !== 0 || moveRight !== 0) {
    controls.moveRight(direction.x * speed * delta);
    controls.moveForward(-direction.z * speed * delta);
  }

  // Gravity
  if (!isOnGround) {
    playerVelocity.y -= GRAVITY * delta;
  }
  camera.position.y += playerVelocity.y * delta;

  // Ground check
  if (camera.position.y < PLAYER_HEIGHT) {
    camera.position.y = PLAYER_HEIGHT;
    playerVelocity.y = 0;
    isOnGround = true;
  }

  // Update 3Lens metadata
  probe.updateLogicalEntity('Player', {
    metadata: {
      health: gameState.health,
      ammo: `${gameState.ammo}/${gameState.reserveAmmo}`,
      score: gameState.score,
      wave: gameState.wave,
      position: `${camera.position.x.toFixed(1)}, ${camera.position.z.toFixed(1)}`,
      kills: gameState.kills,
      accuracy: gameState.shots > 0 ? `${((gameState.hits / gameState.shots) * 100).toFixed(1)}%` : 'N/A',
    },
  });
}

// ───────────────────────────────────────────────────────────────
// Wave System
// ───────────────────────────────────────────────────────────────

function spawnWave() {
  const enemyCount = 3 + (gameState.wave - 1) * 2;
  
  for (let i = 0; i < enemyCount; i++) {
    const angle = (i / enemyCount) * Math.PI * 2;
    const radius = 30 + Math.random() * 15;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    createEnemy(new THREE.Vector3(x, 0, z));
  }
}

function checkWaveComplete() {
  if (enemies.length === 0) {
    gameState.wave++;
    setTimeout(() => {
      spawnWave();
    }, 2000);
  }
}

// ───────────────────────────────────────────────────────────────
// Game Flow
// ───────────────────────────────────────────────────────────────

function startGame() {
  controls.lock();
  gameState.isPlaying = true;
  resetGame();
  spawnWave();
}

function resetGame() {
  // Clear enemies
  while (enemies.length > 0) {
    removeEnemy(enemies[0]);
  }
  
  // Clear bullets
  while (bullets.length > 0) {
    removeBullet(bullets[0]);
  }
  
  // Reset state
  gameState.health = gameState.maxHealth;
  gameState.ammo = gameState.maxAmmo;
  gameState.reserveAmmo = 90;
  gameState.score = 0;
  gameState.wave = 1;
  gameState.kills = 0;
  gameState.shots = 0;
  gameState.hits = 0;
  
  // Reset player position
  camera.position.set(0, PLAYER_HEIGHT, 5);
  playerVelocity.set(0, 0, 0);
}

function gameOver() {
  gameState.isPlaying = false;
  controls.unlock();
  console.log(`Game Over! Score: ${gameState.score}, Wave: ${gameState.wave}`);
}

// ───────────────────────────────────────────────────────────────
// Event Listeners
// ───────────────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  
  if (e.code === 'Space' && isOnGround) {
    playerVelocity.y = PLAYER_JUMP_FORCE;
    isOnGround = false;
  }
  
  if (e.code === 'ShiftLeft') {
    isSprinting = true;
  }
  
  if (e.code === 'KeyR') {
    reload();
  }
  
  if (e.code === 'Backquote') {
    overlay.toggle();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  
  if (e.code === 'ShiftLeft') {
    isSprinting = false;
  }
});

document.addEventListener('mousedown', (e) => {
  if (e.button === 0 && controls.isLocked) {
    shoot();
  }
});

renderer.domElement.addEventListener('click', () => {
  if (!gameState.isPlaying) {
    startGame();
  }
});

controls.addEventListener('unlock', () => {
  if (gameState.isPlaying && gameState.health > 0) {
    gameState.isPaused = true;
  }
});

controls.addEventListener('lock', () => {
  gameState.isPaused = false;
});

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ───────────────────────────────────────────────────────────────
// Animation Loop
// ───────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const delta = Math.min(clock.getDelta(), 0.1);
  
  if (gameState.isPlaying && controls.isLocked) {
    updatePlayer(delta);
    
    // Update enemies
    for (const enemy of [...enemies]) {
      updateEnemy(enemy, delta);
    }
    
    // Update bullets
    for (const bullet of [...bullets]) {
      updateBullet(bullet, delta);
    }
  }
  
  renderer.render(scene, camera);
}

animate();

// ───────────────────────────────────────────────────────────────
// Console Info
// ───────────────────────────────────────────────────────────────

console.log(`
🎯 FPS Demo - 3Lens Integration

Click to start the game.

Controls:
  WASD - Move
  Space - Jump
  Shift - Sprint
  Mouse - Look
  Left Click - Shoot
  R - Reload
  ~ - Toggle 3Lens Overlay

Use 3Lens to inspect:
  - Player stats (health, ammo, score, position)
  - Enemy entities (health, state, AI behavior)
  - Arena structure and scene hierarchy
  - Performance metrics and draw calls
`);
