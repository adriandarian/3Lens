import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ───────────────────────────────────────────────────────────────
// Types & Interfaces
// ───────────────────────────────────────────────────────────────

interface PlayerStats {
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  exp: number;
  expToLevel: number;
  attack: number;
  defense: number;
  critChance: number;
  gold: number;
}

interface Enemy {
  id: number;
  mesh: THREE.Group;
  type: 'slime' | 'goblin';
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  expReward: number;
  goldReward: number;
  state: 'idle' | 'wander' | 'chase' | 'attack' | 'dead';
  aggroRange: number;
  attackRange: number;
  lastAttackTime: number;
  wanderTarget: THREE.Vector3 | null;
}

interface Collectible {
  id: number;
  mesh: THREE.Group;
  type: 'herb' | 'coin' | 'chest';
  collected: boolean;
}

type Direction = 'north' | 'south' | 'east' | 'west';

// ───────────────────────────────────────────────────────────────
// Game Constants
// ───────────────────────────────────────────────────────────────

const TILE_SIZE = 2;
const PLAYER_SPEED = 6;
const MAP_SIZE = 20;

// ───────────────────────────────────────────────────────────────
// Scene Setup
// ───────────────────────────────────────────────────────────────

const container = document.getElementById('canvas-container')!;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2d3a4f);

// Orthographic camera for top-down view
const aspect = window.innerWidth / window.innerHeight;
const viewSize = 20;
const camera = new THREE.OrthographicCamera(
  -viewSize * aspect / 2,
  viewSize * aspect / 2,
  viewSize / 2,
  -viewSize / 2,
  0.1,
  1000
);
camera.position.set(0, 30, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// ───────────────────────────────────────────────────────────────
// 3Lens Integration
// ───────────────────────────────────────────────────────────────

const probe = createProbe({
  appName: 'RPG World',
});
probe.observeScene(scene);
probe.observeRenderer(renderer);

const overlay = createOverlay(probe);

// Register player entity
probe.registerLogicalEntity({
  name: 'Player',
  module: 'game/player',
  componentType: 'PlayerCharacter',
  componentId: 'player',
  tags: ['player', 'controllable'],
  metadata: {
    level: 1,
    health: '100/100',
    mana: '50/50',
    exp: '0/100',
  },
});

// Register world entity
probe.registerLogicalEntity({
  name: 'World',
  module: 'game/world',
  componentType: 'WorldMap',
  tags: ['world', 'static'],
  metadata: {
    mapSize: `${MAP_SIZE * 2}x${MAP_SIZE * 2}`,
    tileSize: TILE_SIZE,
  },
});

// ───────────────────────────────────────────────────────────────
// Lighting
// ───────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -25;
directionalLight.shadow.camera.right = 25;
directionalLight.shadow.camera.top = 25;
directionalLight.shadow.camera.bottom = -25;
scene.add(directionalLight);

// ───────────────────────────────────────────────────────────────
// World Creation
// ───────────────────────────────────────────────────────────────

function createWorld() {
  const worldGroup = new THREE.Group();
  worldGroup.name = 'World';

  // Ground tiles
  const groundGroup = new THREE.Group();
  groundGroup.name = 'Ground';
  
  const grassMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4ade80,
    roughness: 0.8,
  });
  const pathMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xd4a574,
    roughness: 0.9,
  });
  const waterMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x60a5fa,
    roughness: 0.3,
    metalness: 0.2,
  });

  // Create tile map
  const tileGeometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
  
  for (let x = -MAP_SIZE; x <= MAP_SIZE; x++) {
    for (let z = -MAP_SIZE; z <= MAP_SIZE; z++) {
      let material = grassMaterial;
      
      // Path
      if (Math.abs(x) <= 1 || Math.abs(z) <= 1) {
        material = pathMaterial;
      }
      
      // Water (pond)
      if (x >= 8 && x <= 12 && z >= -5 && z <= -1) {
        material = waterMaterial;
      }
      
      const tile = new THREE.Mesh(tileGeometry, material);
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(x * TILE_SIZE, 0, z * TILE_SIZE);
      tile.receiveShadow = true;
      groundGroup.add(tile);
    }
  }
  
  worldGroup.add(groundGroup);

  // Trees
  const treesGroup = new THREE.Group();
  treesGroup.name = 'Trees';
  
  const treePositions = [
    { x: -10, z: -10 }, { x: -8, z: -12 }, { x: -12, z: -8 },
    { x: 10, z: 10 }, { x: 12, z: 8 }, { x: 8, z: 12 },
    { x: -15, z: 5 }, { x: -14, z: 7 }, { x: 15, z: -5 },
    { x: 5, z: -15 }, { x: -5, z: 15 },
  ];

  treePositions.forEach((pos, i) => {
    const tree = createTree();
    tree.position.set(pos.x * TILE_SIZE, 0, pos.z * TILE_SIZE);
    tree.name = `Tree_${i}`;
    treesGroup.add(tree);
  });
  
  worldGroup.add(treesGroup);
  scene.add(worldGroup);
  return worldGroup;
}

function createTree(): THREE.Group {
  const tree = new THREE.Group();
  
  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 1;
  trunk.castShadow = true;
  tree.add(trunk);
  
  // Foliage
  const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 8);
  const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.y = 3.5;
  foliage.castShadow = true;
  tree.add(foliage);
  
  return tree;
}

createWorld();

// ───────────────────────────────────────────────────────────────
// Player
// ───────────────────────────────────────────────────────────────

const playerStats: PlayerStats = {
  level: 1,
  health: 100,
  maxHealth: 100,
  mana: 50,
  maxMana: 50,
  exp: 0,
  expToLevel: 100,
  attack: 15,
  defense: 5,
  critChance: 0.1,
  gold: 0,
};

const player = new THREE.Group();
player.name = 'Player';

// Body
const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 1;
body.castShadow = true;
player.add(body);

// Sword
const swordGroup = new THREE.Group();
swordGroup.name = 'Sword';
const bladeGeometry = new THREE.BoxGeometry(0.1, 1.2, 0.05);
const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8 });
const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
blade.position.y = 0.6;
swordGroup.add(blade);
const hiltGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.1);
const hiltMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
const hilt = new THREE.Mesh(hiltGeometry, hiltMaterial);
swordGroup.add(hilt);
swordGroup.position.set(0.6, 0.8, 0);
swordGroup.rotation.z = Math.PI / 4;
player.add(swordGroup);

player.position.set(0, 0, 0);
scene.add(player);

let playerDirection: Direction = 'south';
let playerState: 'idle' | 'walking' | 'attacking' = 'idle';
const playerPosition = new THREE.Vector3();

// ───────────────────────────────────────────────────────────────
// Enemies
// ───────────────────────────────────────────────────────────────

const enemies: Enemy[] = [];
let enemyIdCounter = 0;

function createSlime(position: THREE.Vector3): Enemy {
  const group = new THREE.Group();
  group.name = `Slime_${enemyIdCounter}`;
  
  // Slime body
  const slimeGeometry = new THREE.SphereGeometry(0.6, 16, 12);
  const slimeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x22c55e,
    transparent: true,
    opacity: 0.8,
  });
  const slimeMesh = new THREE.Mesh(slimeGeometry, slimeMaterial);
  slimeMesh.position.y = 0.4;
  slimeMesh.scale.y = 0.7;
  slimeMesh.castShadow = true;
  group.add(slimeMesh);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.2, 0.5, 0.4);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.2, 0.5, 0.4);
  group.add(rightEye);
  
  group.position.copy(position);
  scene.add(group);
  
  const enemy: Enemy = {
    id: enemyIdCounter++,
    mesh: group,
    type: 'slime',
    health: 30,
    maxHealth: 30,
    attack: 5,
    defense: 2,
    expReward: 20,
    goldReward: 5,
    state: 'idle',
    aggroRange: 8,
    attackRange: 1.5,
    lastAttackTime: 0,
    wanderTarget: null,
  };
  
  enemies.push(enemy);
  
  probe.registerLogicalEntity({
    name: group.name,
    module: 'game/enemies',
    componentType: 'Enemy',
    componentId: `enemy_${enemy.id}`,
    tags: ['enemy', 'slime'],
    metadata: {
      type: enemy.type,
      health: `${enemy.health}/${enemy.maxHealth}`,
      state: enemy.state,
    },
  });
  
  return enemy;
}

// Spawn initial enemies
const enemySpawnPositions = [
  new THREE.Vector3(-15, 0, -15),
  new THREE.Vector3(15, 0, -15),
  new THREE.Vector3(-15, 0, 15),
  new THREE.Vector3(15, 0, 15),
  new THREE.Vector3(-20, 0, 0),
  new THREE.Vector3(20, 0, 0),
];
enemySpawnPositions.forEach(pos => createSlime(pos));

function updateEnemy(enemy: Enemy, delta: number) {
  if (enemy.state === 'dead') return;
  
  const distanceToPlayer = enemy.mesh.position.distanceTo(player.position);
  
  // State machine
  if (distanceToPlayer < enemy.attackRange) {
    enemy.state = 'attack';
    const now = Date.now();
    if (now - enemy.lastAttackTime > 1000) {
      const damage = Math.max(1, enemy.attack - playerStats.defense);
      playerStats.health -= damage;
      enemy.lastAttackTime = now;
      
      if (playerStats.health <= 0) {
        playerStats.health = 0;
        console.log('Game Over! Press R to restart.');
      }
    }
  } else if (distanceToPlayer < enemy.aggroRange) {
    enemy.state = 'chase';
    const direction = new THREE.Vector3()
      .subVectors(player.position, enemy.mesh.position)
      .normalize();
    direction.y = 0;
    enemy.mesh.position.add(direction.multiplyScalar(2 * delta));
    enemy.mesh.lookAt(player.position.x, enemy.mesh.position.y, player.position.z);
  } else {
    enemy.state = 'wander';
    // Simple wander behavior
    if (!enemy.wanderTarget || enemy.mesh.position.distanceTo(enemy.wanderTarget) < 1) {
      enemy.wanderTarget = new THREE.Vector3(
        enemy.mesh.position.x + (Math.random() - 0.5) * 10,
        0,
        enemy.mesh.position.z + (Math.random() - 0.5) * 10
      );
    }
    const direction = new THREE.Vector3()
      .subVectors(enemy.wanderTarget, enemy.mesh.position)
      .normalize();
    direction.y = 0;
    enemy.mesh.position.add(direction.multiplyScalar(1 * delta));
  }
  
  // Update 3Lens metadata
  probe.updateLogicalEntity(`enemy_${enemy.id}`, {
    metadata: {
      type: enemy.type,
      health: `${enemy.health}/${enemy.maxHealth}`,
      state: enemy.state,
      distance: distanceToPlayer.toFixed(1),
    },
  });
}

function damageEnemy(enemy: Enemy, damage: number, isCrit: boolean) {
  const actualDamage = Math.max(1, damage - enemy.defense);
  enemy.health -= actualDamage;
  
  console.log(`${isCrit ? 'CRIT! ' : ''}Dealt ${actualDamage} damage to ${enemy.type}`);
  
  if (enemy.health <= 0) {
    enemy.state = 'dead';
    playerStats.exp += enemy.expReward;
    playerStats.gold += enemy.goldReward;
    
    // Check level up
    if (playerStats.exp >= playerStats.expToLevel) {
      playerStats.level++;
      playerStats.exp -= playerStats.expToLevel;
      playerStats.expToLevel = Math.floor(playerStats.expToLevel * 1.5);
      playerStats.maxHealth += 20;
      playerStats.health = playerStats.maxHealth;
      playerStats.maxMana += 10;
      playerStats.mana = playerStats.maxMana;
      playerStats.attack += 5;
      playerStats.defense += 2;
      console.log(`Level Up! Now level ${playerStats.level}`);
    }
    
    scene.remove(enemy.mesh);
    const index = enemies.indexOf(enemy);
    if (index > -1) {
      enemies.splice(index, 1);
      probe.unregisterLogicalEntity(`enemy_${enemy.id}`);
    }
  }
}

// ───────────────────────────────────────────────────────────────
// Collectibles
// ───────────────────────────────────────────────────────────────

const collectibles: Collectible[] = [];
let herbsCollected = 0;

function createHerb(position: THREE.Vector3): Collectible {
  const group = new THREE.Group();
  group.name = `Herb_${collectibles.length}`;
  
  // Stem
  const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x22c55e });
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.position.y = 0.15;
  group.add(stem);
  
  // Leaves
  const leafGeometry = new THREE.SphereGeometry(0.15, 8, 6);
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x4ade80 });
  const leaf1 = new THREE.Mesh(leafGeometry, leafMaterial);
  leaf1.position.set(0.1, 0.25, 0);
  leaf1.scale.set(1, 0.5, 0.5);
  group.add(leaf1);
  const leaf2 = new THREE.Mesh(leafGeometry, leafMaterial);
  leaf2.position.set(-0.1, 0.3, 0);
  leaf2.scale.set(1, 0.5, 0.5);
  group.add(leaf2);
  
  group.position.copy(position);
  scene.add(group);
  
  const collectible: Collectible = {
    id: collectibles.length,
    mesh: group,
    type: 'herb',
    collected: false,
  };
  
  collectibles.push(collectible);
  return collectible;
}

// Spawn herbs
const herbPositions = [
  new THREE.Vector3(12, 0, 10),
  new THREE.Vector3(-15, 0, -8),
  new THREE.Vector3(8, 0, -12),
  new THREE.Vector3(-10, 0, 12),
  new THREE.Vector3(18, 0, 0),
];
herbPositions.forEach(pos => createHerb(pos));

function checkCollectibles() {
  for (const item of collectibles) {
    if (item.collected) continue;
    
    const distance = player.position.distanceTo(item.mesh.position);
    if (distance < 1.5) {
      collectItem(item);
    }
  }
}

function collectItem(item: Collectible) {
  item.collected = true;
  scene.remove(item.mesh);
  
  if (item.type === 'herb') {
    herbsCollected++;
    console.log(`Collected herb! (${herbsCollected} total)`);
  }
}

// ───────────────────────────────────────────────────────────────
// Player Movement & Combat
// ───────────────────────────────────────────────────────────────

const keys: Record<string, boolean> = {};
let isAttacking = false;
let attackCooldown = 0;

function updatePlayer(delta: number) {
  const moveX = Number(keys['KeyD'] || keys['ArrowRight']) - Number(keys['KeyA'] || keys['ArrowLeft']);
  const moveZ = Number(keys['KeyS'] || keys['ArrowDown']) - Number(keys['KeyW'] || keys['ArrowUp']);
  
  if (moveX !== 0 || moveZ !== 0) {
    playerState = 'walking';
    
    const direction = new THREE.Vector3(moveX, 0, moveZ).normalize();
    player.position.add(direction.multiplyScalar(PLAYER_SPEED * delta));
    
    // Update facing direction
    if (Math.abs(moveX) > Math.abs(moveZ)) {
      playerDirection = moveX > 0 ? 'east' : 'west';
    } else {
      playerDirection = moveZ > 0 ? 'south' : 'north';
    }
    
    // Rotate player
    const angle = Math.atan2(moveX, moveZ);
    player.rotation.y = angle;
    
    playerPosition.copy(player.position);
  } else {
    playerState = 'idle';
  }
  
  // Attack cooldown
  if (attackCooldown > 0) {
    attackCooldown -= delta;
  }
  
  // Check collectibles
  checkCollectibles();
  
  // Camera follow
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 10;
  
  // Update 3Lens metadata
  probe.updateLogicalEntity('player', {
    metadata: {
      level: playerStats.level,
      health: `${playerStats.health}/${playerStats.maxHealth}`,
      mana: `${playerStats.mana}/${playerStats.maxMana}`,
      exp: `${playerStats.exp}/${playerStats.expToLevel}`,
      gold: playerStats.gold,
      position: `${player.position.x.toFixed(1)}, ${player.position.z.toFixed(1)}`,
      state: playerState,
      direction: playerDirection,
    },
  });
}

function playerAttack() {
  if (attackCooldown > 0 || isAttacking) return;
  
  isAttacking = true;
  attackCooldown = 0.5;
  playerState = 'attacking';
  
  // Swing animation
  const sword = player.getObjectByName('Sword');
  if (sword) {
    const originalRotation = sword.rotation.z;
    sword.rotation.z = -Math.PI / 2;
    setTimeout(() => {
      sword.rotation.z = originalRotation;
      isAttacking = false;
    }, 200);
  }
  
  // Check for enemies in range
  const attackRange = 2;
  const isCrit = Math.random() < playerStats.critChance;
  const damage = isCrit ? playerStats.attack * 2 : playerStats.attack;
  
  for (const enemy of enemies) {
    if (enemy.state === 'dead') continue;
    
    const distance = player.position.distanceTo(enemy.mesh.position);
    if (distance < attackRange) {
      // Check if facing enemy
      const toEnemy = new THREE.Vector3()
        .subVectors(enemy.mesh.position, player.position)
        .normalize();
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
      
      if (toEnemy.dot(forward) > 0.5) {
        damageEnemy(enemy, damage, isCrit);
      }
    }
  }
}

function resetGame() {
  playerStats.health = playerStats.maxHealth;
  playerStats.mana = playerStats.maxMana;
  player.position.set(0, 0, 0);
  console.log('Game reset!');
}

// ───────────────────────────────────────────────────────────────
// Event Listeners
// ───────────────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  
  // Attack
  if (e.code === 'Space') {
    playerAttack();
  }
  
  // Reset
  if (e.code === 'KeyR') {
    resetGame();
  }
  
  // Toggle 3Lens
  if (e.code === 'Backquote') {
    overlay.toggle();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Window resize
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = -viewSize * aspect / 2;
  camera.right = viewSize * aspect / 2;
  camera.top = viewSize / 2;
  camera.bottom = -viewSize / 2;
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
  
  updatePlayer(delta);
  
  for (const enemy of [...enemies]) {
    updateEnemy(enemy, delta);
  }
  
  renderer.render(scene, camera);
}

animate();

// ───────────────────────────────────────────────────────────────
// Console Info
// ───────────────────────────────────────────────────────────────

console.log(`
⚔️ Top-Down RPG Demo - 3Lens Integration

Controls:
  WASD/Arrows - Move
  Space - Attack
  R - Reset game
  ~ - Toggle 3Lens Overlay

Use 3Lens to inspect:
  - Player stats (level, health, mana, exp, gold)
  - Enemy entities (health, state, AI behavior)
  - World structure and scene hierarchy
  - Performance metrics and draw calls
`);
