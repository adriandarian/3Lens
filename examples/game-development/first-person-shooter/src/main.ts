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
  pathHelper?: THREE.Line;
  hitboxHelper?: THREE.Box3Helper;
  healthBar?: THREE.Sprite;
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
  godMode: boolean;
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
const HEADSHOT_MULTIPLIER = 2;
const RELOAD_TIME = 1500;
const FIRE_RATE = 100; // ms between shots

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
    const geometry = new THREE.BoxGeometry(cover.w, cover.h, cover.d);
    const mesh = new THREE.Mesh(geometry, coverMaterial);
    mesh.position.set(cover.x, cover.h / 2, cover.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = `Cover_${i}`;
    mesh.userData.isObstacle = true;
    arenaGroup.add(mesh);
  });

  // Decorative pillars
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.5,
  });

  const pillarPositions = [
    { x: -35, z: -35 },
    { x: 35, z: -35 },
    { x: -35, z: 35 },
    { x: 35, z: 35 },
  ];

  pillarPositions.forEach((pos, i) => {
    const geometry = new THREE.CylinderGeometry(1.5, 1.5, 8, 16);
    const pillar = new THREE.Mesh(geometry, pillarMaterial);
    pillar.position.set(pos.x, 4, pos.z);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    pillar.name = `Pillar_${i}`;
    pillar.userData.isObstacle = true;
    arenaGroup.add(pillar);
  });

  scene.add(arenaGroup);

  // Register with 3Lens
  probe.registerLogicalEntity({
    name: 'Arena',
    module: 'game/environment',
    componentType: 'Arena',
    tags: ['environment', 'static'],
  });

  return arenaGroup;
}

const arena = createArena();

// ───────────────────────────────────────────────────────────────
// Player State
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
  godMode: false,
};

const playerVelocity = new THREE.Vector3();
let isOnGround = true;
let canJump = true;
let lastFireTime = 0;
let isReloading = false;

// Input state
const keys: Record<string, boolean> = {};

// ───────────────────────────────────────────────────────────────
// Enemies
// ───────────────────────────────────────────────────────────────

const enemies: Enemy[] = [];
let nextEnemyId = 0;
let enemySpeedMultiplier = 1;
let baseEnemyCount = 5;

function createEnemy(position: THREE.Vector3): Enemy {
  const group = new THREE.Group();
  group.name = `Enemy_${nextEnemyId}`;

  // Body
  const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.6,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 1;
  body.castShadow = true;
  body.name = 'Body';
  group.add(body);

  // Head (for headshots)
  const headGeometry = new THREE.SphereGeometry(0.3, 16, 12);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xfca5a5,
    roughness: 0.5,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 2;
  head.castShadow = true;
  head.name = 'Head';
  head.userData.isHead = true;
  group.add(head);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.12, 2.05, 0.25);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.12, 2.05, 0.25);
  group.add(rightEye);

  group.position.copy(position);
  scene.add(group);

  const enemy: Enemy = {
    id: nextEnemyId++,
    mesh: group,
    health: 100,
    maxHealth: 100,
    speed: 3 + Math.random() * 2,
    state: 'idle',
    lastAttackTime: 0,
    attackCooldown: 1000,
  };

  // Register with 3Lens
  probe.registerLogicalEntity({
    name: group.name,
    module: 'game/enemies',
    componentType: 'Enemy',
    componentId: `enemy_${enemy.id}`,
    tags: ['enemy', 'ai', 'damageable'],
    metadata: {
      health: enemy.health,
      speed: enemy.speed,
      state: enemy.state,
    },
  });

  enemies.push(enemy);
  updateEnemyCount();
  return enemy;
}

function removeEnemy(enemy: Enemy) {
  const index = enemies.indexOf(enemy);
  if (index !== -1) {
    enemies.splice(index, 1);
    scene.remove(enemy.mesh);
    if (enemy.pathHelper) scene.remove(enemy.pathHelper);
    if (enemy.hitboxHelper) scene.remove(enemy.hitboxHelper);
    if (enemy.healthBar) scene.remove(enemy.healthBar);
    
    probe.unregisterLogicalEntity(`enemy_${enemy.id}`);
    updateEnemyCount();
  }
}

function updateEnemy(enemy: Enemy, delta: number) {
  if (enemy.state === 'dead') return;

  const playerPos = camera.position;
  const enemyPos = enemy.mesh.position;
  const direction = new THREE.Vector3()
    .subVectors(playerPos, enemyPos)
    .setY(0)
    .normalize();
  const distance = playerPos.distanceTo(enemyPos);

  // Face the player
  enemy.mesh.lookAt(playerPos.x, enemy.mesh.position.y, playerPos.z);

  // State machine
  if (distance < 2.5) {
    enemy.state = 'attacking';
    const now = Date.now();
    if (now - enemy.lastAttackTime > enemy.attackCooldown) {
      attackPlayer(enemy);
      enemy.lastAttackTime = now;
    }
  } else {
    enemy.state = 'chasing';
    const moveSpeed = enemy.speed * enemySpeedMultiplier * delta;
    enemy.mesh.position.add(direction.multiplyScalar(moveSpeed));
  }

  // Update path helper
  if (enemy.pathHelper) {
    const points = [enemyPos.clone(), playerPos.clone()];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    enemy.pathHelper.geometry.dispose();
    enemy.pathHelper.geometry = geometry;
  }

  // Update hitbox helper
  if (enemy.hitboxHelper) {
    enemy.hitboxHelper.update();
  }

  // Update 3Lens entity
  probe.updateLogicalEntity(`enemy_${enemy.id}`, {
    metadata: {
      health: enemy.health,
      state: enemy.state,
      distanceToPlayer: distance.toFixed(1),
    },
  });
}

function attackPlayer(enemy: Enemy) {
  if (gameState.godMode) return;
  
  gameState.health -= ENEMY_DAMAGE;
  showDamageOverlay();
  
  if (gameState.health <= 0) {
    gameState.health = 0;
    gameOver();
  }
  
  updateHealthUI();
}

// ───────────────────────────────────────────────────────────────
// Bullets
// ───────────────────────────────────────────────────────────────

const bullets: Bullet[] = [];
let showBulletTrails = true;

function shoot() {
  if (isReloading || gameState.ammo <= 0) return;
  
  const now = Date.now();
  if (now - lastFireTime < FIRE_RATE) return;
  lastFireTime = now;

  gameState.ammo--;
  gameState.shots++;
  updateAmmoUI();

  // Create bullet
  const bulletGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
  
  // Position at camera
  bulletMesh.position.copy(camera.position);
  
  // Get direction from camera
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  
  const bullet: Bullet = {
    mesh: bulletMesh,
    velocity: direction.multiplyScalar(BULLET_SPEED),
    lifetime: 3,
  };

  // Add trail
  if (showBulletTrails) {
    const trailGeometry = new THREE.BufferGeometry().setFromPoints([
      bulletMesh.position.clone(),
      bulletMesh.position.clone(),
    ]);
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.5,
    });
    bullet.trail = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(bullet.trail);
  }

  scene.add(bulletMesh);
  bullets.push(bullet);

  // Muzzle flash effect (camera shake)
  const originalRot = camera.rotation.x;
  camera.rotation.x -= 0.02;
  setTimeout(() => {
    camera.rotation.x = originalRot;
  }, 50);

  // Auto reload if empty
  if (gameState.ammo === 0 && gameState.reserveAmmo > 0) {
    reload();
  }
}

function updateBullet(bullet: Bullet, delta: number) {
  bullet.lifetime -= delta;
  
  const movement = bullet.velocity.clone().multiplyScalar(delta);
  bullet.mesh.position.add(movement);

  // Update trail
  if (bullet.trail) {
    const positions = bullet.trail.geometry.attributes.position;
    const trailStart = new THREE.Vector3(
      positions.getX(0),
      positions.getY(0),
      positions.getZ(0)
    );
    const newStart = trailStart.lerp(bullet.mesh.position, 0.3);
    positions.setXYZ(0, newStart.x, newStart.y, newStart.z);
    positions.setXYZ(1, bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
    positions.needsUpdate = true;
  }

  // Check collisions with enemies
  for (const enemy of enemies) {
    if (enemy.state === 'dead') continue;
    
    const distance = bullet.mesh.position.distanceTo(enemy.mesh.position);
    if (distance < 0.8) {
      hitEnemy(enemy, bullet);
      removeBullet(bullet);
      return true;
    }
    
    // Headshot check
    const headPos = enemy.mesh.position.clone().add(new THREE.Vector3(0, 2, 0));
    const headDist = bullet.mesh.position.distanceTo(headPos);
    if (headDist < 0.4) {
      hitEnemy(enemy, bullet, true);
      removeBullet(bullet);
      return true;
    }
  }

  // Check wall collisions
  if (
    Math.abs(bullet.mesh.position.x) > 49 ||
    Math.abs(bullet.mesh.position.z) > 49 ||
    bullet.mesh.position.y < 0 ||
    bullet.mesh.position.y > 10
  ) {
    removeBullet(bullet);
    return true;
  }

  if (bullet.lifetime <= 0) {
    removeBullet(bullet);
    return true;
  }

  return false;
}

function removeBullet(bullet: Bullet) {
  const index = bullets.indexOf(bullet);
  if (index !== -1) {
    bullets.splice(index, 1);
    scene.remove(bullet.mesh);
    if (bullet.trail) {
      scene.remove(bullet.trail);
      bullet.trail.geometry.dispose();
    }
    bullet.mesh.geometry.dispose();
    (bullet.mesh.material as THREE.Material).dispose();
  }
}

function hitEnemy(enemy: Enemy, bullet: Bullet, isHeadshot = false) {
  gameState.hits++;
  
  const damage = isHeadshot ? BULLET_DAMAGE * HEADSHOT_MULTIPLIER : BULLET_DAMAGE;
  enemy.health -= damage;

  showHitMarker();
  
  if (enemy.health <= 0) {
    enemy.state = 'dead';
    gameState.score += isHeadshot ? 150 : 100;
    gameState.kills++;
    
    addKillFeedEntry(enemy.mesh.name, isHeadshot);
    
    // Death animation
    const fallTween = { progress: 0 };
    const startRotX = enemy.mesh.rotation.x;
    const animate = () => {
      fallTween.progress += 0.05;
      enemy.mesh.rotation.x = startRotX + (Math.PI / 2) * fallTween.progress;
      enemy.mesh.position.y -= 0.05;
      if (fallTween.progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => removeEnemy(enemy), 500);
      }
    };
    animate();
    
    updateScoreUI();
    checkWaveComplete();
  }
}

// ───────────────────────────────────────────────────────────────
// Player Movement
// ───────────────────────────────────────────────────────────────

function updatePlayer(delta: number) {
  if (!controls.isLocked) return;

  const speed = PLAYER_SPEED * (keys['ShiftLeft'] || keys['ShiftRight'] ? PLAYER_SPRINT_MULTIPLIER : 1);
  const moveForward = Number(keys['KeyW'] || keys['ArrowUp']) - Number(keys['KeyS'] || keys['ArrowDown']);
  const moveRight = Number(keys['KeyD'] || keys['ArrowRight']) - Number(keys['KeyA'] || keys['ArrowLeft']);

  // Horizontal movement
  const direction = new THREE.Vector3();
  direction.z = -moveForward;
  direction.x = moveRight;
  direction.normalize();

  if (moveForward || moveRight) {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(forward);
    right.crossVectors(camera.up, forward).normalize();
    forward.y = 0;
    forward.normalize();

    playerVelocity.x = (forward.x * -direction.z + right.x * direction.x) * speed;
    playerVelocity.z = (forward.z * -direction.z + right.z * direction.x) * speed;
  } else {
    playerVelocity.x *= 0.9;
    playerVelocity.z *= 0.9;
  }

  // Jump
  if ((keys['Space'] || keys['KeySpace']) && isOnGround && canJump) {
    playerVelocity.y = PLAYER_JUMP_FORCE;
    isOnGround = false;
    canJump = false;
  }

  // Gravity
  if (!isOnGround) {
    playerVelocity.y -= GRAVITY * delta;
  }

  // Apply movement
  camera.position.x += playerVelocity.x * delta;
  camera.position.y += playerVelocity.y * delta;
  camera.position.z += playerVelocity.z * delta;

  // Ground check
  if (camera.position.y < PLAYER_HEIGHT) {
    camera.position.y = PLAYER_HEIGHT;
    playerVelocity.y = 0;
    isOnGround = true;
  }

  // Arena bounds
  camera.position.x = Math.max(-48, Math.min(48, camera.position.x));
  camera.position.z = Math.max(-48, Math.min(48, camera.position.z));

  // Update debug stats
  updatePlayerStats();
}

function reload() {
  if (isReloading || gameState.ammo === gameState.maxAmmo || gameState.reserveAmmo === 0) return;
  
  isReloading = true;
  const ammoNeeded = gameState.maxAmmo - gameState.ammo;
  const ammoToReload = Math.min(ammoNeeded, gameState.reserveAmmo);
  
  setTimeout(() => {
    gameState.ammo += ammoToReload;
    gameState.reserveAmmo -= ammoToReload;
    isReloading = false;
    updateAmmoUI();
  }, RELOAD_TIME);
}

// ───────────────────────────────────────────────────────────────
// Wave System
// ───────────────────────────────────────────────────────────────

function spawnWave() {
  const enemyCount = baseEnemyCount + (gameState.wave - 1) * 2;
  
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
    updateWaveUI();
    
    setTimeout(() => {
      spawnWave();
    }, 2000);
  }
}

// ───────────────────────────────────────────────────────────────
// UI Updates
// ───────────────────────────────────────────────────────────────

function updateHealthUI() {
  const healthFill = document.getElementById('health-fill')!;
  const healthText = document.getElementById('health-text')!;
  const percent = (gameState.health / gameState.maxHealth) * 100;
  
  healthFill.style.width = `${percent}%`;
  healthText.textContent = Math.ceil(gameState.health).toString();
  
  healthFill.classList.remove('low', 'medium');
  if (percent <= 25) {
    healthFill.classList.add('low');
  } else if (percent <= 50) {
    healthFill.classList.add('medium');
  }
}

function updateAmmoUI() {
  document.getElementById('ammo-current')!.textContent = gameState.ammo.toString();
  document.getElementById('ammo-reserve')!.textContent = gameState.reserveAmmo.toString();
}

function updateScoreUI() {
  document.getElementById('score-value')!.textContent = gameState.score.toString();
}

function updateWaveUI() {
  document.getElementById('wave-value')!.textContent = gameState.wave.toString();
}

function updateEnemyCount() {
  document.getElementById('enemies-remaining')!.textContent = `Enemies: ${enemies.length}`;
}

function updatePlayerStats() {
  const pos = camera.position;
  document.getElementById('player-pos')!.textContent = 
    `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
  
  const speed = Math.sqrt(playerVelocity.x ** 2 + playerVelocity.z ** 2);
  document.getElementById('player-vel')!.textContent = `${speed.toFixed(1)} m/s`;
  
  const accuracy = gameState.shots > 0 ? ((gameState.hits / gameState.shots) * 100).toFixed(1) : '0';
  document.getElementById('accuracy')!.textContent = `${accuracy}%`;
}

function showHitMarker() {
  const hitMarker = document.getElementById('hit-marker')!;
  hitMarker.classList.remove('show');
  void hitMarker.offsetWidth; // Trigger reflow
  hitMarker.classList.add('show');
}

function showDamageOverlay() {
  const overlay = document.getElementById('damage-overlay')!;
  overlay.classList.add('show');
  setTimeout(() => overlay.classList.remove('show'), 200);
}

function addKillFeedEntry(enemyName: string, isHeadshot: boolean) {
  const killFeed = document.getElementById('kill-feed')!;
  const entry = document.createElement('div');
  entry.className = `kill-entry${isHeadshot ? ' headshot' : ''}`;
  entry.textContent = isHeadshot ? `💀 ${enemyName} (Headshot!)` : `✓ ${enemyName}`;
  killFeed.appendChild(entry);
  
  setTimeout(() => entry.remove(), 3000);
}

// ───────────────────────────────────────────────────────────────
// Game Flow
// ───────────────────────────────────────────────────────────────

function startGame() {
  document.getElementById('start-screen')!.classList.add('hidden');
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
  
  // Update UI
  updateHealthUI();
  updateAmmoUI();
  updateScoreUI();
  updateWaveUI();
  updateEnemyCount();
}

function gameOver() {
  gameState.isPlaying = false;
  controls.unlock();
  
  document.getElementById('final-score')!.textContent = gameState.score.toString();
  document.getElementById('final-wave')!.textContent = gameState.wave.toString();
  document.getElementById('game-over-screen')!.classList.add('show');
}

// ───────────────────────────────────────────────────────────────
// Debug Visualization
// ───────────────────────────────────────────────────────────────

let showPaths = false;
let showHitboxes = false;

function toggleEnemyPaths() {
  showPaths = !showPaths;
  
  for (const enemy of enemies) {
    if (showPaths) {
      const points = [enemy.mesh.position.clone(), camera.position.clone()];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.5 });
      enemy.pathHelper = new THREE.Line(geometry, material);
      scene.add(enemy.pathHelper);
    } else if (enemy.pathHelper) {
      scene.remove(enemy.pathHelper);
      enemy.pathHelper.geometry.dispose();
      enemy.pathHelper = undefined;
    }
  }
  
  const btn = document.getElementById('toggle-paths')!;
  btn.textContent = showPaths ? 'Hide' : 'Show';
  btn.classList.toggle('active', showPaths);
}

function toggleHitboxes() {
  showHitboxes = !showHitboxes;
  
  for (const enemy of enemies) {
    if (showHitboxes) {
      const box = new THREE.Box3().setFromObject(enemy.mesh);
      enemy.hitboxHelper = new THREE.Box3Helper(box, new THREE.Color(0xef4444));
      scene.add(enemy.hitboxHelper);
    } else if (enemy.hitboxHelper) {
      scene.remove(enemy.hitboxHelper);
      enemy.hitboxHelper = undefined;
    }
  }
  
  const btn = document.getElementById('toggle-hitboxes')!;
  btn.textContent = showHitboxes ? 'Hide' : 'Show';
  btn.classList.toggle('active', showHitboxes);
}

function toggleBulletTrails() {
  showBulletTrails = !showBulletTrails;
  
  const btn = document.getElementById('toggle-trails')!;
  btn.textContent = showBulletTrails ? 'On' : 'Off';
  btn.classList.toggle('active', showBulletTrails);
}

// ───────────────────────────────────────────────────────────────
// Event Listeners
// ───────────────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  
  if (e.code === 'KeyR' && gameState.isPlaying) {
    reload();
  }
  
  if (e.code === 'Backquote') {
    overlay.toggle();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  
  if (e.code === 'Space') {
    canJump = true;
  }
});

document.addEventListener('mousedown', (e) => {
  if (e.button === 0 && controls.isLocked && gameState.isPlaying) {
    shoot();
  }
});

controls.addEventListener('lock', () => {
  if (!gameState.isPlaying) {
    startGame();
  }
});

controls.addEventListener('unlock', () => {
  if (gameState.isPlaying && gameState.health > 0) {
    // Allow resuming by clicking
  }
});

// UI Event Listeners
document.getElementById('start-btn')!.addEventListener('click', () => {
  controls.lock();
});

document.getElementById('retry-btn')!.addEventListener('click', () => {
  document.getElementById('game-over-screen')!.classList.remove('show');
  controls.lock();
  gameState.isPlaying = true;
  resetGame();
  spawnWave();
});

document.getElementById('toggle-paths')!.addEventListener('click', toggleEnemyPaths);
document.getElementById('toggle-hitboxes')!.addEventListener('click', toggleHitboxes);
document.getElementById('toggle-trails')!.addEventListener('click', toggleBulletTrails);

document.getElementById('enemy-speed')!.addEventListener('input', (e) => {
  enemySpeedMultiplier = parseFloat((e.target as HTMLInputElement).value);
  document.getElementById('enemy-speed-value')!.textContent = `${enemySpeedMultiplier.toFixed(1)}x`;
});

document.getElementById('enemy-count')!.addEventListener('input', (e) => {
  baseEnemyCount = parseInt((e.target as HTMLInputElement).value);
  document.getElementById('enemy-count-value')!.textContent = baseEnemyCount.toString();
});

document.getElementById('spawn-enemy')!.addEventListener('click', () => {
  const angle = Math.random() * Math.PI * 2;
  const radius = 20 + Math.random() * 20;
  createEnemy(new THREE.Vector3(
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  ));
});

document.getElementById('refill-ammo')!.addEventListener('click', () => {
  gameState.ammo = gameState.maxAmmo;
  gameState.reserveAmmo = 90;
  updateAmmoUI();
});

document.getElementById('god-mode')!.addEventListener('click', (e) => {
  gameState.godMode = !gameState.godMode;
  const btn = e.target as HTMLButtonElement;
  btn.textContent = gameState.godMode ? 'God Mode ✓' : 'God Mode';
  btn.classList.toggle('active', gameState.godMode);
  
  if (gameState.godMode) {
    gameState.health = gameState.maxHealth;
    updateHealthUI();
  }
});

document.getElementById('restart-game')!.addEventListener('click', () => {
  resetGame();
  if (!gameState.isPlaying) {
    gameState.isPlaying = true;
    document.getElementById('game-over-screen')!.classList.remove('show');
    controls.lock();
  }
  spawnWave();
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

Controls:
  WASD - Move
  Space - Jump
  Shift - Sprint
  Mouse - Look
  Left Click - Shoot
  R - Reload
  ~ - Toggle 3Lens Overlay

Debug Features:
  - Enemy path visualization
  - Hitbox display
  - Bullet trail toggle
  - Player stats monitoring
  - Enemy speed/count adjustment
  - God mode

3Lens Features:
  - Scene graph inspection
  - Performance monitoring
  - Entity tracking for Player, Arena, Enemies
  - Real-time metadata updates
`);
