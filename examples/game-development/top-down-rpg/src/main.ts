import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

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
  healthBar?: THREE.Sprite;
  collisionHelper?: THREE.Mesh;
  aggroHelper?: THREE.Mesh;
  pathHelper?: THREE.Line;
}

interface NPC {
  id: number;
  mesh: THREE.Group;
  name: string;
  dialogue: DialogueNode[];
  interactionRange: number;
}

interface DialogueNode {
  text: string;
  options?: { label: string; action: string; next?: number }[];
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
    tree.userData.isObstacle = true;
    treesGroup.add(tree);
  });
  
  worldGroup.add(treesGroup);

  // Rocks
  const rocksGroup = new THREE.Group();
  rocksGroup.name = 'Rocks';
  
  const rockPositions = [
    { x: -6, z: 8 }, { x: 7, z: -8 }, { x: -3, z: -10 },
    { x: 12, z: 3 }, { x: -12, z: -3 },
  ];

  rockPositions.forEach((pos, i) => {
    const rock = createRock();
    rock.position.set(pos.x * TILE_SIZE, 0, pos.z * TILE_SIZE);
    rock.name = `Rock_${i}`;
    rock.userData.isObstacle = true;
    rocksGroup.add(rock);
  });
  
  worldGroup.add(rocksGroup);

  // Village buildings
  const buildingsGroup = new THREE.Group();
  buildingsGroup.name = 'Buildings';

  const buildingPositions = [
    { x: -5, z: 3, type: 'house' },
    { x: -8, z: 3, type: 'shop' },
    { x: -5, z: 6, type: 'house' },
  ];

  buildingPositions.forEach((pos, i) => {
    const building = createBuilding(pos.type);
    building.position.set(pos.x * TILE_SIZE, 0, pos.z * TILE_SIZE);
    building.name = `Building_${pos.type}_${i}`;
    building.userData.isObstacle = true;
    buildingsGroup.add(building);
  });

  worldGroup.add(buildingsGroup);

  scene.add(worldGroup);

  probe.registerLogicalEntity({
    name: 'World',
    module: 'game/world',
    componentType: 'WorldMap',
    tags: ['environment', 'static'],
    metadata: {
      tileSize: TILE_SIZE,
      mapSize: MAP_SIZE,
    },
  });

  return worldGroup;
}

function createTree(): THREE.Group {
  const group = new THREE.Group();
  
  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 1;
  trunk.castShadow = true;
  group.add(trunk);
  
  // Foliage
  const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 8);
  const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.y = 3.5;
  foliage.castShadow = true;
  group.add(foliage);
  
  return group;
}

function createRock(): THREE.Group {
  const group = new THREE.Group();
  
  const rockGeometry = new THREE.DodecahedronGeometry(0.8, 0);
  const rockMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x6b7280,
    roughness: 0.9,
  });
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);
  rock.position.y = 0.4;
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.scale.set(1, 0.6, 1);
  rock.castShadow = true;
  group.add(rock);
  
  return group;
}

function createBuilding(type: string): THREE.Group {
  const group = new THREE.Group();
  
  const wallColor = type === 'shop' ? 0xfbbf24 : 0xf5f5dc;
  const roofColor = type === 'shop' ? 0x7c3aed : 0x8b4513;
  
  // Walls
  const wallGeometry = new THREE.BoxGeometry(3, 2.5, 3);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor });
  const walls = new THREE.Mesh(wallGeometry, wallMaterial);
  walls.position.y = 1.25;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);
  
  // Roof
  const roofGeometry = new THREE.ConeGeometry(2.5, 1.5, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({ color: roofColor });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 3.25;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);
  
  // Door
  const doorGeometry = new THREE.PlaneGeometry(0.8, 1.5);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 0.75, 1.51);
  group.add(door);
  
  return group;
}

const world = createWorld();

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
  attack: 10,
  defense: 5,
  critChance: 0.1,
  gold: 0,
};

let playerState: 'idle' | 'walking' | 'attacking' = 'idle';
let playerDirection: Direction = 'south';
let playerPosition = new THREE.Vector3(0, 0, 0);

function createPlayer(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Player';
  
  // Body
  const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.8;
  body.castShadow = true;
  group.add(body);
  
  // Head
  const headGeometry = new THREE.SphereGeometry(0.35, 16, 12);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xfed7aa });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.55;
  head.castShadow = true;
  group.add(head);
  
  // Hair
  const hairGeometry = new THREE.SphereGeometry(0.38, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
  const hair = new THREE.Mesh(hairGeometry, hairMaterial);
  hair.position.y = 1.6;
  group.add(hair);
  
  // Sword (right side)
  const swordGroup = new THREE.Group();
  swordGroup.name = 'Sword';
  
  const bladeGeometry = new THREE.BoxGeometry(0.08, 0.8, 0.02);
  const bladeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xc0c0c0,
    metalness: 0.8,
    roughness: 0.2,
  });
  const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
  blade.position.y = 0.4;
  swordGroup.add(blade);
  
  const hiltGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.08);
  const hiltMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const hilt = new THREE.Mesh(hiltGeometry, hiltMaterial);
  swordGroup.add(hilt);
  
  swordGroup.position.set(0.6, 0.8, 0);
  swordGroup.rotation.z = -Math.PI / 6;
  group.add(swordGroup);
  
  scene.add(group);
  
  probe.registerLogicalEntity({
    name: 'Player',
    module: 'game/player',
    componentType: 'PlayerController',
    tags: ['player', 'controllable', 'combat'],
    metadata: { ...playerStats },
  });
  
  return group;
}

const player = createPlayer();

// ───────────────────────────────────────────────────────────────
// Enemies
// ───────────────────────────────────────────────────────────────

const enemies: Enemy[] = [];
let nextEnemyId = 0;
let slimesDefeated = 0;

function createSlime(position: THREE.Vector3): Enemy {
  const group = new THREE.Group();
  group.name = `Slime_${nextEnemyId}`;
  
  // Body (bouncy sphere)
  const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 12);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x22c55e,
    transparent: true,
    opacity: 0.8,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.4;
  body.scale.set(1, 0.8, 1);
  body.castShadow = true;
  group.add(body);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.15, 0.5, 0.35);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.15, 0.5, 0.35);
  group.add(rightEye);
  
  group.position.copy(position);
  scene.add(group);
  
  const enemy: Enemy = {
    id: nextEnemyId++,
    mesh: group,
    type: 'slime',
    health: 30,
    maxHealth: 30,
    attack: 5,
    defense: 2,
    expReward: 25,
    goldReward: 5,
    state: 'idle',
    aggroRange: 8,
    attackRange: 1.5,
    lastAttackTime: 0,
    wanderTarget: null,
  };
  
  probe.registerLogicalEntity({
    name: group.name,
    module: 'game/enemies',
    componentType: 'Enemy',
    componentId: `slime_${enemy.id}`,
    tags: ['enemy', 'ai', 'slime'],
    metadata: {
      type: enemy.type,
      health: enemy.health,
      state: enemy.state,
    },
  });
  
  enemies.push(enemy);
  return enemy;
}

function updateEnemy(enemy: Enemy, delta: number) {
  if (enemy.state === 'dead') return;
  
  const enemyPos = enemy.mesh.position;
  const playerPos = player.position;
  const distance = enemyPos.distanceTo(playerPos);
  
  // State machine
  if (distance < enemy.aggroRange) {
    if (distance < enemy.attackRange) {
      enemy.state = 'attack';
      
      const now = Date.now();
      if (now - enemy.lastAttackTime > 1500) {
        attackPlayer(enemy);
        enemy.lastAttackTime = now;
      }
    } else {
      enemy.state = 'chase';
      
      const direction = new THREE.Vector3()
        .subVectors(playerPos, enemyPos)
        .normalize();
      
      enemy.mesh.position.add(direction.multiplyScalar(2 * delta));
      enemy.mesh.lookAt(playerPos.x, enemy.mesh.position.y, playerPos.z);
    }
  } else {
    // Wander
    if (!enemy.wanderTarget || enemyPos.distanceTo(enemy.wanderTarget) < 0.5) {
      enemy.wanderTarget = new THREE.Vector3(
        enemyPos.x + (Math.random() - 0.5) * 6,
        0,
        enemyPos.z + (Math.random() - 0.5) * 6
      );
      enemy.state = 'wander';
    }
    
    if (enemy.wanderTarget) {
      const direction = new THREE.Vector3()
        .subVectors(enemy.wanderTarget, enemyPos)
        .normalize();
      enemy.mesh.position.add(direction.multiplyScalar(1 * delta));
    }
  }
  
  // Bouncy animation for slime
  if (enemy.type === 'slime') {
    const bounce = Math.sin(Date.now() * 0.005) * 0.1;
    enemy.mesh.children[0].scale.y = 0.8 + bounce;
    enemy.mesh.children[0].position.y = 0.4 + bounce * 0.5;
  }
  
  // Update path helper
  if (enemy.pathHelper) {
    const points = [enemyPos.clone(), playerPos.clone()];
    points[0].y = 0.1;
    points[1].y = 0.1;
    enemy.pathHelper.geometry.dispose();
    enemy.pathHelper.geometry = new THREE.BufferGeometry().setFromPoints(points);
  }
  
  // Update entity
  probe.updateLogicalEntity(`slime_${enemy.id}`, {
    metadata: {
      health: enemy.health,
      state: enemy.state,
      distanceToPlayer: distance.toFixed(1),
    },
  });
}

function attackPlayer(enemy: Enemy) {
  const damage = Math.max(1, enemy.attack - playerStats.defense);
  playerStats.health -= damage;
  
  addCombatLog(`Slime deals ${damage} damage!`, 'damage');
  showDamageNumber(player.position, damage, false, false);
  
  if (playerStats.health <= 0) {
    playerStats.health = 0;
    addCombatLog('You have been defeated!', 'damage');
  }
  
  updatePlayerUI();
}

function damageEnemy(enemy: Enemy, damage: number, isCrit: boolean) {
  const actualDamage = Math.max(1, damage - enemy.defense);
  enemy.health -= actualDamage;
  
  addCombatLog(
    `You deal ${actualDamage}${isCrit ? ' CRITICAL' : ''} damage to ${enemy.type}!`,
    'damage'
  );
  showDamageNumber(enemy.mesh.position, actualDamage, isCrit, false);
  
  if (enemy.health <= 0) {
    enemy.state = 'dead';
    
    // Rewards
    playerStats.exp += enemy.expReward;
    playerStats.gold += enemy.goldReward;
    
    addCombatLog(`Slime defeated! +${enemy.expReward} EXP, +${enemy.goldReward} Gold`, 'exp');
    
    if (enemy.type === 'slime') {
      slimesDefeated++;
      updateQuestUI();
    }
    
    // Death animation
    const fadeOut = () => {
      enemy.mesh.scale.multiplyScalar(0.95);
      enemy.mesh.position.y -= 0.02;
      if (enemy.mesh.scale.x > 0.1) {
        requestAnimationFrame(fadeOut);
      } else {
        removeEnemy(enemy);
      }
    };
    fadeOut();
    
    checkLevelUp();
    updatePlayerUI();
  }
}

function removeEnemy(enemy: Enemy) {
  const index = enemies.indexOf(enemy);
  if (index !== -1) {
    enemies.splice(index, 1);
    scene.remove(enemy.mesh);
    if (enemy.collisionHelper) scene.remove(enemy.collisionHelper);
    if (enemy.aggroHelper) scene.remove(enemy.aggroHelper);
    if (enemy.pathHelper) scene.remove(enemy.pathHelper);
    probe.unregisterLogicalEntity(`slime_${enemy.id}`);
  }
}

// Spawn initial enemies
function spawnInitialEnemies() {
  const positions = [
    new THREE.Vector3(10, 0, 5),
    new THREE.Vector3(-8, 0, -10),
    new THREE.Vector3(15, 0, -8),
    new THREE.Vector3(-12, 0, 8),
    new THREE.Vector3(5, 0, -15),
  ];
  
  positions.forEach(pos => createSlime(pos));
}

spawnInitialEnemies();

// ───────────────────────────────────────────────────────────────
// NPCs
// ───────────────────────────────────────────────────────────────

const npcs: NPC[] = [];
let currentNPC: NPC | null = null;

function createNPC(position: THREE.Vector3, name: string): NPC {
  const group = new THREE.Group();
  group.name = `NPC_${name}`;
  
  // Body
  const bodyGeometry = new THREE.CapsuleGeometry(0.35, 0.7, 4, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x7c3aed });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.7;
  body.castShadow = true;
  group.add(body);
  
  // Head
  const headGeometry = new THREE.SphereGeometry(0.3, 16, 12);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xfed7aa });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.4;
  head.castShadow = true;
  group.add(head);
  
  // Name indicator
  // (In a real game, this would be a sprite or HTML overlay)
  
  group.position.copy(position);
  scene.add(group);
  
  const npc: NPC = {
    id: npcs.length,
    mesh: group,
    name,
    dialogue: [
      {
        text: `Hello, adventurer! I am ${name}. Our village has been troubled by slimes lately. Can you help us defeat them?`,
        options: [
          { label: "I'll help you!", action: 'accept' },
          { label: 'What do I get in return?', action: 'reward', next: 1 },
          { label: 'Not right now.', action: 'decline' },
        ],
      },
      {
        text: 'I can offer you gold and experience for your troubles. Defeat 5 slimes and return to me.',
        options: [
          { label: "I'll do it!", action: 'accept' },
          { label: 'I need to think about it.', action: 'decline' },
        ],
      },
    ],
    interactionRange: 3,
  };
  
  probe.registerLogicalEntity({
    name: group.name,
    module: 'game/npcs',
    componentType: 'NPC',
    componentId: `npc_${npc.id}`,
    tags: ['npc', 'interactive'],
    metadata: { name },
  });
  
  npcs.push(npc);
  return npc;
}

createNPC(new THREE.Vector3(-10, 0, 6), 'Village Elder');

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
    addCombatLog('Collected herb!', 'heal');
    document.getElementById('herb-count')!.textContent = herbsCollected.toString();
    updateQuestUI();
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
  
  // Check NPC proximity
  checkNPCInteraction();
  
  // Check collectibles
  checkCollectibles();
  
  // Camera follow
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 10;
  
  // Update debug
  updateDebugUI();
  updateMinimap();
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

function usePotion() {
  const potionCount = parseInt(document.getElementById('potion-count')!.textContent || '0');
  if (potionCount <= 0 || playerStats.health >= playerStats.maxHealth) return;
  
  document.getElementById('potion-count')!.textContent = (potionCount - 1).toString();
  
  const healAmount = 30;
  playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + healAmount);
  
  addCombatLog(`Used potion. Healed ${healAmount} HP!`, 'heal');
  showDamageNumber(player.position, healAmount, false, true);
  updatePlayerUI();
}

function useManaPotion() {
  const potionCount = parseInt(document.getElementById('mana-potion-count')!.textContent || '0');
  if (potionCount <= 0 || playerStats.mana >= playerStats.maxMana) return;
  
  document.getElementById('mana-potion-count')!.textContent = (potionCount - 1).toString();
  
  const restoreAmount = 25;
  playerStats.mana = Math.min(playerStats.maxMana, playerStats.mana + restoreAmount);
  
  addCombatLog(`Used mana potion. Restored ${restoreAmount} MP!`, 'heal');
  updatePlayerUI();
}

// ───────────────────────────────────────────────────────────────
// NPC Interaction
// ───────────────────────────────────────────────────────────────

function checkNPCInteraction() {
  const prompt = document.getElementById('interaction-prompt')!;
  let nearNPC: NPC | null = null;
  
  for (const npc of npcs) {
    const distance = player.position.distanceTo(npc.mesh.position);
    if (distance < npc.interactionRange) {
      nearNPC = npc;
      break;
    }
  }
  
  if (nearNPC) {
    prompt.classList.add('show');
    prompt.innerHTML = `<kbd>E</kbd> Talk to ${nearNPC.name}`;
    currentNPC = nearNPC;
  } else {
    prompt.classList.remove('show');
    currentNPC = null;
  }
}

function interactWithNPC() {
  if (!currentNPC) return;
  
  showDialogue(currentNPC, 0);
}

function showDialogue(npc: NPC, index: number) {
  const box = document.getElementById('dialogue-box')!;
  const node = npc.dialogue[index];
  
  document.getElementById('dialogue-speaker')!.textContent = npc.name;
  document.getElementById('dialogue-text')!.textContent = node.text;
  
  const optionsContainer = document.getElementById('dialogue-options')!;
  optionsContainer.innerHTML = '';
  
  if (node.options) {
    node.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-option';
      btn.textContent = opt.label;
      btn.onclick = () => {
        if (opt.next !== undefined) {
          showDialogue(npc, opt.next);
        } else {
          box.classList.remove('show');
          if (opt.action === 'accept') {
            addCombatLog('Quest accepted: The Slime Menace', 'exp');
          }
        }
      };
      optionsContainer.appendChild(btn);
    });
  }
  
  box.classList.add('show');
}

// ───────────────────────────────────────────────────────────────
// Level Up System
// ───────────────────────────────────────────────────────────────

function checkLevelUp() {
  if (playerStats.exp >= playerStats.expToLevel) {
    playerStats.level++;
    playerStats.exp -= playerStats.expToLevel;
    playerStats.expToLevel = Math.floor(playerStats.expToLevel * 1.5);
    
    // Stat increases
    playerStats.maxHealth += 20;
    playerStats.health = playerStats.maxHealth;
    playerStats.maxMana += 10;
    playerStats.mana = playerStats.maxMana;
    playerStats.attack += 3;
    playerStats.defense += 2;
    
    showLevelUpEffect();
    addCombatLog(`LEVEL UP! You are now level ${playerStats.level}!`, 'exp');
    updatePlayerUI();
    
    probe.updateLogicalEntity('Player', {
      metadata: { ...playerStats },
    });
  }
}

function showLevelUpEffect() {
  const overlay = document.getElementById('level-up-overlay')!;
  const text = document.getElementById('level-up-text')!;
  
  overlay.classList.add('show');
  text.classList.add('show');
  
  setTimeout(() => {
    overlay.classList.remove('show');
    text.classList.remove('show');
  }, 2000);
}

// ───────────────────────────────────────────────────────────────
// UI Updates
// ───────────────────────────────────────────────────────────────

function updatePlayerUI() {
  const healthPercent = (playerStats.health / playerStats.maxHealth) * 100;
  const manaPercent = (playerStats.mana / playerStats.maxMana) * 100;
  const expPercent = (playerStats.exp / playerStats.expToLevel) * 100;
  
  document.getElementById('health-bar')!.style.width = `${healthPercent}%`;
  document.getElementById('health-text')!.textContent = `${Math.ceil(playerStats.health)} / ${playerStats.maxHealth}`;
  
  document.getElementById('mana-bar')!.style.width = `${manaPercent}%`;
  document.getElementById('mana-text')!.textContent = `${Math.ceil(playerStats.mana)} / ${playerStats.maxMana}`;
  
  document.getElementById('exp-bar')!.style.width = `${expPercent}%`;
  document.getElementById('exp-text')!.textContent = `${playerStats.exp} / ${playerStats.expToLevel}`;
  
  document.getElementById('player-level')!.textContent = `Lv. ${playerStats.level}`;
}

function updateQuestUI() {
  document.getElementById('quest-slimes')!.textContent = Math.min(slimesDefeated, 5).toString();
  document.getElementById('quest-slimes-bar')!.style.width = `${Math.min(slimesDefeated / 5 * 100, 100)}%`;
  
  document.getElementById('quest-herbs')!.textContent = Math.min(herbsCollected, 3).toString();
  document.getElementById('quest-herbs-bar')!.style.width = `${Math.min(herbsCollected / 3 * 100, 100)}%`;
}

function updateDebugUI() {
  document.getElementById('debug-pos')!.textContent = 
    `${player.position.x.toFixed(1)}, ${player.position.z.toFixed(1)}`;
  document.getElementById('debug-facing')!.textContent = 
    playerDirection.charAt(0).toUpperCase() + playerDirection.slice(1);
  document.getElementById('debug-state')!.textContent = 
    playerState.charAt(0).toUpperCase() + playerState.slice(1);
  document.getElementById('debug-gold')!.textContent = playerStats.gold.toString();
  document.getElementById('debug-attack')!.textContent = playerStats.attack.toString();
  document.getElementById('debug-defense')!.textContent = playerStats.defense.toString();
  document.getElementById('debug-crit')!.textContent = `${(playerStats.critChance * 100).toFixed(0)}%`;
}

function updateMinimap() {
  const content = document.getElementById('minimap-content')!;
  
  // Clear old markers
  content.querySelectorAll('.minimap-enemy, .minimap-npc').forEach(el => el.remove());
  
  // Add enemy markers
  for (const enemy of enemies) {
    if (enemy.state === 'dead') continue;
    
    const marker = document.createElement('div');
    marker.className = 'minimap-enemy';
    
    const relX = (enemy.mesh.position.x - player.position.x) / 40 * 150 + 75;
    const relZ = (enemy.mesh.position.z - player.position.z) / 40 * 150 + 75;
    
    if (relX >= 0 && relX <= 150 && relZ >= 0 && relZ <= 150) {
      marker.style.left = `${relX}px`;
      marker.style.top = `${relZ}px`;
      content.appendChild(marker);
    }
  }
  
  // Add NPC markers
  for (const npc of npcs) {
    const marker = document.createElement('div');
    marker.className = 'minimap-npc';
    
    const relX = (npc.mesh.position.x - player.position.x) / 40 * 150 + 75;
    const relZ = (npc.mesh.position.z - player.position.z) / 40 * 150 + 75;
    
    if (relX >= 0 && relX <= 150 && relZ >= 0 && relZ <= 150) {
      marker.style.left = `${relX}px`;
      marker.style.top = `${relZ}px`;
      content.appendChild(marker);
    }
  }
}

function addCombatLog(message: string, type: 'damage' | 'heal' | 'exp') {
  const log = document.getElementById('combat-log')!;
  const entry = document.createElement('div');
  entry.className = `combat-entry ${type}`;
  entry.textContent = message;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
  
  setTimeout(() => entry.remove(), 5000);
}

function showDamageNumber(position: THREE.Vector3, value: number, isCrit: boolean, isHeal: boolean) {
  const vector = position.clone();
  vector.project(camera);
  
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
  
  const elem = document.createElement('div');
  elem.className = `damage-number${isCrit ? ' crit' : ''}${isHeal ? ' heal' : ''}`;
  elem.textContent = (isHeal ? '+' : '-') + value.toString();
  elem.style.left = `${x}px`;
  elem.style.top = `${y}px`;
  
  document.body.appendChild(elem);
  setTimeout(() => elem.remove(), 1000);
}

// ───────────────────────────────────────────────────────────────
// Debug Visualization
// ───────────────────────────────────────────────────────────────

let showCollision = false;
let showAIPaths = false;
let showAggro = false;

function toggleCollisionBoxes() {
  showCollision = !showCollision;
  
  for (const enemy of enemies) {
    if (showCollision) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      enemy.collisionHelper = new THREE.Mesh(geometry, material);
      enemy.collisionHelper.position.copy(enemy.mesh.position);
      enemy.collisionHelper.position.y = 0.5;
      scene.add(enemy.collisionHelper);
    } else if (enemy.collisionHelper) {
      scene.remove(enemy.collisionHelper);
      enemy.collisionHelper = undefined;
    }
  }
  
  const btn = document.getElementById('toggle-collision')!;
  btn.textContent = showCollision ? 'Hide' : 'Show';
  btn.classList.toggle('active', showCollision);
}

function toggleAIPaths() {
  showAIPaths = !showAIPaths;
  
  for (const enemy of enemies) {
    if (showAIPaths) {
      const points = [
        enemy.mesh.position.clone(),
        player.position.clone(),
      ];
      points[0].y = 0.1;
      points[1].y = 0.1;
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.5,
      });
      enemy.pathHelper = new THREE.Line(geometry, material);
      scene.add(enemy.pathHelper);
    } else if (enemy.pathHelper) {
      scene.remove(enemy.pathHelper);
      enemy.pathHelper.geometry.dispose();
      enemy.pathHelper = undefined;
    }
  }
  
  const btn = document.getElementById('toggle-ai-paths')!;
  btn.textContent = showAIPaths ? 'Hide' : 'Show';
  btn.classList.toggle('active', showAIPaths);
}

function toggleAggroRanges() {
  showAggro = !showAggro;
  
  for (const enemy of enemies) {
    if (showAggro) {
      const geometry = new THREE.RingGeometry(enemy.aggroRange - 0.1, enemy.aggroRange, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      enemy.aggroHelper = new THREE.Mesh(geometry, material);
      enemy.aggroHelper.rotation.x = -Math.PI / 2;
      enemy.aggroHelper.position.copy(enemy.mesh.position);
      enemy.aggroHelper.position.y = 0.05;
      scene.add(enemy.aggroHelper);
    } else if (enemy.aggroHelper) {
      scene.remove(enemy.aggroHelper);
      enemy.aggroHelper.geometry.dispose();
      enemy.aggroHelper = undefined;
    }
  }
  
  const btn = document.getElementById('toggle-aggro')!;
  btn.textContent = showAggro ? 'Hide' : 'Show';
  btn.classList.toggle('active', showAggro);
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
  
  // Interact
  if (e.code === 'KeyE') {
    interactWithNPC();
  }
  
  // Hotkeys
  if (e.code === 'Digit3') usePotion();
  if (e.code === 'Digit4') useManaPotion();
  
  // Toggle 3Lens
  if (e.code === 'Backquote') {
    overlay.toggle();
  }
  
  // Inventory selection
  const slotKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8'];
  const slotIndex = slotKeys.indexOf(e.code);
  if (slotIndex !== -1) {
    document.querySelectorAll('.inventory-slot').forEach((slot, i) => {
      slot.classList.toggle('selected', i === slotIndex);
    });
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Debug buttons
document.getElementById('toggle-collision')!.addEventListener('click', toggleCollisionBoxes);
document.getElementById('toggle-ai-paths')!.addEventListener('click', toggleAIPaths);
document.getElementById('toggle-aggro')!.addEventListener('click', toggleAggroRanges);

document.getElementById('spawn-slime')!.addEventListener('click', () => {
  const angle = Math.random() * Math.PI * 2;
  const distance = 10 + Math.random() * 10;
  createSlime(new THREE.Vector3(
    player.position.x + Math.cos(angle) * distance,
    0,
    player.position.z + Math.sin(angle) * distance
  ));
});

document.getElementById('spawn-herb')!.addEventListener('click', () => {
  const angle = Math.random() * Math.PI * 2;
  const distance = 5 + Math.random() * 10;
  createHerb(new THREE.Vector3(
    player.position.x + Math.cos(angle) * distance,
    0,
    player.position.z + Math.sin(angle) * distance
  ));
});

document.getElementById('heal-player')!.addEventListener('click', () => {
  playerStats.health = playerStats.maxHealth;
  playerStats.mana = playerStats.maxMana;
  updatePlayerUI();
  addCombatLog('Debug: Full heal applied', 'heal');
});

document.getElementById('add-exp')!.addEventListener('click', () => {
  playerStats.exp += 50;
  checkLevelUp();
  updatePlayerUI();
  addCombatLog('Debug: +50 EXP', 'exp');
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
    
    // Update collision helper position
    if (enemy.collisionHelper) {
      enemy.collisionHelper.position.copy(enemy.mesh.position);
      enemy.collisionHelper.position.y = 0.5;
    }
    
    // Update aggro helper position
    if (enemy.aggroHelper) {
      enemy.aggroHelper.position.copy(enemy.mesh.position);
      enemy.aggroHelper.position.y = 0.05;
    }
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
  E - Interact with NPCs
  1-8 - Select inventory slot
  3 - Use health potion
  4 - Use mana potion
  ~ - Toggle 3Lens Overlay

Debug Features:
  - Collision box visualization
  - AI path display
  - Aggro range indicators
  - Spawn enemies/items
  - Instant heal & EXP

3Lens Features:
  - Full scene hierarchy
  - Entity tracking (Player, Enemies, NPCs, World)
  - Real-time stat monitoring
  - Performance metrics
`);
