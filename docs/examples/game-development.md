# Game Development Examples

This guide provides comprehensive walkthroughs for using 3Lens in game development scenarios. Each example demonstrates game-specific debugging techniques with interactive gameplay.

[[toc]]

## Overview

These examples demonstrate 3Lens integration for common game development patterns:

| Example | Game Type | Key Debugging Focus |
|---------|-----------|---------------------|
| [First-Person Shooter](#first-person-shooter) | FPS Arena | Player physics, AI, projectiles |
| [Top-Down RPG](#top-down-rpg) | 2.5D RPG | Entity systems, pathfinding, UI |
| [Racing Game](#racing-game) | Arcade racing | Vehicle physics, track systems |
| [Platformer Physics](#platformer-physics) | 2D platformer | Jump mechanics, collision |

---

## First-Person Shooter

A complete FPS arena shooter demonstrating player controls, enemy AI, and projectile systems with 3Lens debugging.

### Features Demonstrated

- **FPS Controls**: Pointer lock, WASD movement, jumping
- **Weapon Systems**: Shooting, reloading, ammo tracking
- **Enemy AI**: Chase behavior, attack patterns, pathfinding
- **Projectile Physics**: Bullet trajectories, hit detection
- **Game State**: Health, score, waves
- **Debug Overlays**: Hitboxes, AI paths, projectile trails

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/game-development/first-person-shooter
pnpm dev
```

Open http://localhost:3000 in your browser. Click to start and capture pointer lock.

### Project Structure

```
first-person-shooter/
├── src/
│   └── main.ts          # FPS game implementation
├── index.html           # HTML entry with HUD
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Define Game Types

```typescript
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
  hitboxHelper?: THREE.BoxHelper;
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
```

#### Step 2: Player Controller Setup

```typescript
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const PLAYER_HEIGHT = 1.8;
const PLAYER_SPEED = 8;
const PLAYER_SPRINT_MULTIPLIER = 1.5;
const PLAYER_JUMP_FORCE = 8;
const GRAVITY = 20;

// Pointer Lock Controls
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.object);

// Player state
let playerVelocity = new THREE.Vector3();
let isGrounded = true;
let isSprinting = false;

// Movement keys
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
};

function updatePlayer(dt: number) {
  // Calculate movement direction
  const direction = new THREE.Vector3();
  
  if (keys.forward) direction.z -= 1;
  if (keys.backward) direction.z += 1;
  if (keys.left) direction.x -= 1;
  if (keys.right) direction.x += 1;
  
  direction.normalize();
  
  // Apply rotation from controls
  direction.applyQuaternion(camera.quaternion);
  direction.y = 0;
  direction.normalize();
  
  // Apply speed
  const speed = PLAYER_SPEED * (isSprinting ? PLAYER_SPRINT_MULTIPLIER : 1);
  playerVelocity.x = direction.x * speed;
  playerVelocity.z = direction.z * speed;
  
  // Gravity
  if (!isGrounded) {
    playerVelocity.y -= GRAVITY * dt;
  }
  
  // Jump
  if (keys.jump && isGrounded) {
    playerVelocity.y = PLAYER_JUMP_FORCE;
    isGrounded = false;
  }
  
  // Apply velocity
  controls.object.position.add(
    playerVelocity.clone().multiplyScalar(dt)
  );
  
  // Ground check
  if (controls.object.position.y < PLAYER_HEIGHT) {
    controls.object.position.y = PLAYER_HEIGHT;
    playerVelocity.y = 0;
    isGrounded = true;
  }
}
```

#### Step 3: 3Lens Integration

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe();
probe.observeScene(scene, { name: 'FPS Arena' });
probe.observeRenderer(renderer);

// Register player as logical entity
probe.registerLogicalEntity({
  name: 'Player',
  module: 'game/player',
  componentType: 'PlayerController',
  tags: ['player', 'controllable'],
  metadata: {
    health: gameState.health,
    ammo: gameState.ammo,
    position: camera.position.toArray(),
  },
});

const overlay = createOverlay(probe, {
  initialPosition: { x: window.innerWidth - 420, y: 20 },
  collapsed: true, // Start collapsed during gameplay
});
```

#### Step 4: Enemy AI System

```typescript
class EnemyAI {
  private enemies: Enemy[] = [];
  
  spawnEnemy(position: THREE.Vector3): Enemy {
    const enemy: Enemy = {
      id: this.nextId++,
      mesh: this.createEnemyMesh(),
      health: 100,
      maxHealth: 100,
      speed: 3,
      state: 'idle',
      lastAttackTime: 0,
      attackCooldown: 1000,
    };
    
    enemy.mesh.position.copy(position);
    scene.add(enemy.mesh);
    
    // Register with 3Lens
    probe.registerLogicalEntity({
      name: `Enemy_${enemy.id}`,
      module: 'game/enemies',
      componentType: 'Enemy',
      linkedObject: enemy.mesh,
      tags: ['enemy', 'ai'],
      metadata: {
        health: enemy.health,
        state: enemy.state,
      },
    });
    
    // Create debug helpers
    enemy.hitboxHelper = new THREE.BoxHelper(enemy.mesh, 0xff0000);
    enemy.hitboxHelper.visible = showHitboxes;
    scene.add(enemy.hitboxHelper);
    
    this.enemies.push(enemy);
    return enemy;
  }
  
  update(dt: number, playerPosition: THREE.Vector3) {
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;
      
      const distanceToPlayer = enemy.mesh.position.distanceTo(playerPosition);
      
      // State machine
      switch (enemy.state) {
        case 'idle':
          if (distanceToPlayer < 20) {
            enemy.state = 'chasing';
          }
          break;
          
        case 'chasing':
          this.moveTowardsPlayer(enemy, playerPosition, dt);
          if (distanceToPlayer < 2) {
            enemy.state = 'attacking';
          }
          break;
          
        case 'attacking':
          this.attackPlayer(enemy);
          if (distanceToPlayer > 3) {
            enemy.state = 'chasing';
          }
          break;
      }
      
      // Update debug helpers
      if (enemy.hitboxHelper) {
        enemy.hitboxHelper.update();
      }
      
      // Update 3Lens entity
      probe.updateLogicalEntity(`Enemy_${enemy.id}`, {
        metadata: {
          health: enemy.health,
          state: enemy.state,
          distanceToPlayer,
        },
      });
    }
  }
}
```

#### Step 5: Weapon and Projectile System

```typescript
const BULLET_SPEED = 80;
const BULLET_DAMAGE = 25;
const FIRE_RATE = 100;

const bullets: Bullet[] = [];
let lastFireTime = 0;

function fireBullet() {
  if (gameState.ammo <= 0) return;
  
  const now = performance.now();
  if (now - lastFireTime < FIRE_RATE) return;
  
  lastFireTime = now;
  gameState.ammo--;
  gameState.shots++;
  
  // Create bullet
  const bullet: Bullet = {
    mesh: new THREE.Mesh(
      new THREE.SphereGeometry(0.05),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    ),
    velocity: new THREE.Vector3(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .multiplyScalar(BULLET_SPEED),
    lifetime: 2,
  };
  
  bullet.mesh.position.copy(camera.position);
  scene.add(bullet.mesh);
  
  // Create trail
  if (showBulletTrails) {
    bullet.trail = createBulletTrail(bullet.mesh.position);
    scene.add(bullet.trail);
  }
  
  bullets.push(bullet);
  
  probe.log('debug', 'Bullet fired', {
    ammo: gameState.ammo,
    direction: bullet.velocity.toArray(),
  });
}

function updateBullets(dt: number) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    
    // Move bullet
    bullet.mesh.position.add(
      bullet.velocity.clone().multiplyScalar(dt)
    );
    
    // Update trail
    if (bullet.trail) {
      updateTrailGeometry(bullet.trail, bullet.mesh.position);
    }
    
    // Check lifetime
    bullet.lifetime -= dt;
    if (bullet.lifetime <= 0) {
      removeBullet(i);
      continue;
    }
    
    // Check enemy hits
    for (const enemy of enemies) {
      if (enemy.state === 'dead') continue;
      
      const hitbox = new THREE.Box3().setFromObject(enemy.mesh);
      if (hitbox.containsPoint(bullet.mesh.position)) {
        damageEnemy(enemy, BULLET_DAMAGE);
        gameState.hits++;
        removeBullet(i);
        break;
      }
    }
  }
}
```

### Debug Controls

| Key | Action |
|-----|--------|
| `F1` | Toggle 3Lens overlay |
| `F2` | Toggle hitbox visualization |
| `F3` | Toggle AI path visualization |
| `F4` | Toggle bullet trails |
| `F5` | Toggle god mode |
| `Tab` | Show scoreboard |
| `P` | Pause game |

### 3Lens Debugging Features

1. **Scene Explorer**: View enemy hierarchy and states
2. **Object Inspector**: Check enemy health, position, AI state
3. **Stats Panel**: Monitor FPS during combat
4. **Logical Entities**: Filter by module (game/enemies, game/player)
5. **Console**: View combat logs (damage, kills, spawns)

### Performance Monitoring

| Metric | Target | 3Lens Location |
|--------|--------|----------------|
| FPS | 60+ | Stats Panel |
| Draw Calls | <100 | Stats Panel |
| Enemy Count | <50 | Logical Entities |
| Bullet Count | <20 | Scene Explorer |

---

## Top-Down RPG

A 2.5D RPG demonstrating entity systems, dialogue, and combat with 3Lens inspection.

### Features Demonstrated

- **Tile-Based World**: Orthographic camera, tile map
- **Player Stats**: Level, HP, MP, experience, gold
- **Enemy AI**: Wander, chase, attack patterns
- **NPC Dialogue**: Interactive dialogue trees
- **Collectibles**: Items, coins, chests
- **Debug Overlays**: Aggro ranges, collision, paths

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/game-development/top-down-rpg
pnpm dev
```

Open http://localhost:3000 in your browser. Use WASD or arrow keys to move.

### Project Structure

```
top-down-rpg/
├── src/
│   └── main.ts          # RPG game implementation
├── index.html           # HTML entry with UI
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Define RPG Types

```typescript
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
```

#### Step 2: Orthographic Camera Setup

```typescript
const TILE_SIZE = 2;
const MAP_SIZE = 20;

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
```

#### Step 3: 3Lens Integration

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe();
probe.observeScene(scene, { name: 'RPG World' });
probe.observeRenderer(renderer);

// Register player
probe.registerLogicalEntity({
  name: 'Player',
  module: 'game/player',
  componentType: 'PlayerCharacter',
  linkedObject: playerMesh,
  tags: ['player', 'character'],
  metadata: {
    ...playerStats,
    position: playerMesh.position.toArray(),
  },
});

// Register enemies
enemies.forEach(enemy => {
  probe.registerLogicalEntity({
    name: `${enemy.type}_${enemy.id}`,
    module: 'game/enemies',
    componentType: 'Enemy',
    linkedObject: enemy.mesh,
    tags: ['enemy', enemy.type],
    metadata: {
      health: enemy.health,
      state: enemy.state,
      type: enemy.type,
    },
  });
});

// Register NPCs
npcs.forEach(npc => {
  probe.registerLogicalEntity({
    name: npc.name,
    module: 'game/npcs',
    componentType: 'NPC',
    linkedObject: npc.mesh,
    tags: ['npc', 'interactable'],
    metadata: {
      dialogueLength: npc.dialogue.length,
    },
  });
});

const overlay = createOverlay(probe, {
  initialPosition: { x: window.innerWidth - 420, y: 20 },
  collapsed: true,
});
```

#### Step 4: Enemy AI with Debug Visualization

```typescript
class RPGEnemy {
  private enemy: Enemy;
  
  // Debug helpers
  private aggroHelper?: THREE.Mesh;
  private attackRangeHelper?: THREE.Mesh;
  private pathHelper?: THREE.Line;
  
  constructor(enemy: Enemy) {
    this.enemy = enemy;
    this.createDebugHelpers();
  }
  
  createDebugHelpers() {
    // Aggro range circle
    this.aggroHelper = new THREE.Mesh(
      new THREE.CircleGeometry(this.enemy.aggroRange, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.2,
      })
    );
    this.aggroHelper.rotation.x = -Math.PI / 2;
    this.aggroHelper.visible = showAggroRanges;
    
    // Attack range circle
    this.attackRangeHelper = new THREE.Mesh(
      new THREE.CircleGeometry(this.enemy.attackRange, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.2,
      })
    );
    this.attackRangeHelper.rotation.x = -Math.PI / 2;
    this.attackRangeHelper.visible = showAttackRanges;
  }
  
  update(dt: number, playerPosition: THREE.Vector3) {
    const distanceToPlayer = this.enemy.mesh.position.distanceTo(playerPosition);
    
    switch (this.enemy.state) {
      case 'idle':
        // Random chance to start wandering
        if (Math.random() < 0.01) {
          this.enemy.state = 'wander';
          this.enemy.wanderTarget = this.getRandomWanderTarget();
        }
        
        // Check for player in aggro range
        if (distanceToPlayer < this.enemy.aggroRange) {
          this.enemy.state = 'chase';
          probe.log('debug', `${this.enemy.type} aggroed player`, {
            enemyId: this.enemy.id,
            distance: distanceToPlayer,
          });
        }
        break;
        
      case 'wander':
        if (this.enemy.wanderTarget) {
          this.moveTowards(this.enemy.wanderTarget, dt * 0.5);
          
          if (this.enemy.mesh.position.distanceTo(this.enemy.wanderTarget) < 0.5) {
            this.enemy.state = 'idle';
            this.enemy.wanderTarget = null;
          }
        }
        
        if (distanceToPlayer < this.enemy.aggroRange) {
          this.enemy.state = 'chase';
        }
        break;
        
      case 'chase':
        this.moveTowards(playerPosition, dt);
        this.updatePathVisualization(playerPosition);
        
        if (distanceToPlayer < this.enemy.attackRange) {
          this.enemy.state = 'attack';
        } else if (distanceToPlayer > this.enemy.aggroRange * 1.5) {
          this.enemy.state = 'idle';
        }
        break;
        
      case 'attack':
        this.performAttack();
        if (distanceToPlayer > this.enemy.attackRange) {
          this.enemy.state = 'chase';
        }
        break;
    }
    
    // Update debug helpers position
    this.aggroHelper?.position.copy(this.enemy.mesh.position);
    this.attackRangeHelper?.position.copy(this.enemy.mesh.position);
    
    // Update 3Lens entity
    probe.updateLogicalEntity(`${this.enemy.type}_${this.enemy.id}`, {
      metadata: {
        health: this.enemy.health,
        state: this.enemy.state,
        distanceToPlayer,
      },
    });
  }
}
```

#### Step 5: Combat System

```typescript
function calculateDamage(attacker: { attack: number }, defender: { defense: number }): number {
  const baseDamage = attacker.attack;
  const damageReduction = defender.defense / (defender.defense + 50);
  const finalDamage = Math.floor(baseDamage * (1 - damageReduction));
  
  return Math.max(1, finalDamage);
}

function playerAttack() {
  const attackRange = 1.5;
  
  for (const enemy of enemies) {
    if (enemy.state === 'dead') continue;
    
    const distance = playerMesh.position.distanceTo(enemy.mesh.position);
    if (distance < attackRange) {
      const damage = calculateDamage(playerStats, enemy);
      enemy.health -= damage;
      
      probe.log('info', `Player attacked ${enemy.type}`, {
        damage,
        remainingHealth: enemy.health,
      });
      
      // Show damage number
      showDamageNumber(enemy.mesh.position, damage);
      
      if (enemy.health <= 0) {
        killEnemy(enemy);
      }
    }
  }
}

function killEnemy(enemy: Enemy) {
  enemy.state = 'dead';
  
  // Award exp and gold
  playerStats.exp += enemy.expReward;
  playerStats.gold += enemy.goldReward;
  
  // Check level up
  if (playerStats.exp >= playerStats.expToLevel) {
    levelUp();
  }
  
  probe.log('info', `Defeated ${enemy.type}!`, {
    expGained: enemy.expReward,
    goldGained: enemy.goldReward,
    totalExp: playerStats.exp,
    totalGold: playerStats.gold,
  });
  
  // Update entity
  probe.updateLogicalEntity(`${enemy.type}_${enemy.id}`, {
    metadata: { state: 'dead', health: 0 },
  });
}
```

### Debug Controls

| Key | Action |
|-----|--------|
| `F1` | Toggle 3Lens overlay |
| `F2` | Toggle aggro range circles |
| `F3` | Toggle attack range circles |
| `F4` | Toggle collision boxes |
| `F5` | Toggle AI path lines |
| `I` | Open inventory |
| `C` | Open character stats |

### 3Lens Debugging Features

1. **Logical Entities**: Group by module (game/player, game/enemies, game/npcs)
2. **Object Inspector**: View enemy stats, player stats
3. **Scene Explorer**: Navigate world hierarchy
4. **Console**: Combat logs, level ups, item pickups

---

## Racing Game

An arcade racing game demonstrating vehicle physics and lap timing with 3Lens profiling.

### Features Demonstrated

- **Vehicle Physics**: Acceleration, steering, drifting
- **Track System**: Checkpoints, lap timing
- **AI Opponents**: Pathfinding, difficulty levels
- **Surface Types**: Grip variations (asphalt, grass, sand)
- **Debug Overlays**: Velocity vectors, steering angles
- **Performance Profiling**: Frame timing during races

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/game-development/racing-game
pnpm dev
```

Open http://localhost:3000 in your browser. Use arrow keys or WASD to drive.

### Project Structure

```
racing-game/
├── src/
│   └── main.ts          # Racing game implementation
├── index.html           # HTML entry with HUD
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Define Racing Types

```typescript
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

type SurfaceType = 'asphalt' | 'grass' | 'sand' | 'gravel';

const SURFACE_GRIP: Record<SurfaceType, number> = {
  asphalt: 1.0,
  grass: 0.6,
  sand: 0.4,
  gravel: 0.7,
};

interface Checkpoint {
  position: THREE.Vector3;
  width: number;
  mesh: THREE.Mesh;
  index: number;
}
```

#### Step 2: Vehicle Physics

```typescript
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

function updateVehicle(dt: number) {
  const state = playerVehicle.state;
  
  // Get current surface grip
  state.grip = SURFACE_GRIP[state.currentSurface];
  
  // Acceleration
  if (keys.accelerate) {
    state.acceleration = VEHICLE_CONFIG.acceleration;
    if (state.nitroActive && state.nitro > 0) {
      state.acceleration *= VEHICLE_CONFIG.nitroBoost;
      state.nitro -= VEHICLE_CONFIG.nitroConsumption * dt;
    }
  } else if (keys.brake) {
    state.acceleration = -VEHICLE_CONFIG.braking;
  } else {
    state.acceleration = 0;
  }
  
  // Apply acceleration
  state.speed += state.acceleration * dt;
  state.speed *= VEHICLE_CONFIG.friction;
  state.speed = THREE.MathUtils.clamp(state.speed, -20, VEHICLE_CONFIG.maxSpeed);
  
  // Steering
  if (keys.left) {
    state.steering = VEHICLE_CONFIG.turnSpeed;
  } else if (keys.right) {
    state.steering = -VEHICLE_CONFIG.turnSpeed;
  } else {
    state.steering = 0;
  }
  
  // Apply steering (reduced at high speed)
  const steerFactor = 1 - (state.speed / VEHICLE_CONFIG.maxSpeed) * 0.5;
  state.rotation += state.steering * steerFactor * state.grip * dt;
  
  // Calculate drift
  const lateralVelocity = Math.abs(state.steering * state.speed);
  state.driftAngle = lateralVelocity > VEHICLE_CONFIG.driftThreshold 
    ? lateralVelocity * 0.1 
    : 0;
  
  // Update velocity
  state.velocity.set(
    Math.sin(state.rotation) * state.speed,
    0,
    Math.cos(state.rotation) * state.speed
  );
  
  // Apply velocity
  state.position.add(state.velocity.clone().multiplyScalar(dt));
  
  // Update mesh
  playerVehicle.mesh.position.copy(state.position);
  playerVehicle.mesh.rotation.y = state.rotation;
  
  // Recharge nitro when not using
  if (!state.nitroActive) {
    state.nitro = Math.min(
      state.maxNitro,
      state.nitro + VEHICLE_CONFIG.nitroRecharge * dt
    );
  }
}
```

#### Step 3: 3Lens Integration

```typescript
import { DevtoolProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = new DevtoolProbe();
probe.observeScene(scene);
probe.observeRenderer(renderer);

// Register player vehicle
probe.registerLogicalEntity({
  name: 'PlayerVehicle',
  module: 'racing/vehicles',
  componentType: 'Vehicle',
  linkedObject: playerVehicle.mesh,
  tags: ['vehicle', 'player'],
  metadata: {
    speed: playerVehicle.state.speed,
    lap: playerVehicle.state.currentLap,
    bestLap: playerVehicle.state.bestLapTime,
  },
});

// Register AI vehicles
aiVehicles.forEach((ai, i) => {
  probe.registerLogicalEntity({
    name: `AI_${i + 1}`,
    module: 'racing/vehicles',
    componentType: 'AIVehicle',
    linkedObject: ai.mesh,
    tags: ['vehicle', 'ai'],
    metadata: {
      skill: ai.skill,
      aggression: ai.aggression,
    },
  });
});

// Register checkpoints
checkpoints.forEach(cp => {
  probe.registerLogicalEntity({
    name: `Checkpoint_${cp.index}`,
    module: 'racing/track',
    componentType: 'Checkpoint',
    linkedObject: cp.mesh,
    tags: ['checkpoint', 'track'],
    metadata: { index: cp.index },
  });
});

const overlay = createOverlay(probe);
overlay.mount(document.getElementById('app')!);
```

#### Step 4: Lap Timing System

```typescript
function checkCheckpoint() {
  const playerPos = playerVehicle.state.position;
  const expectedCheckpoint = (playerVehicle.state.lastCheckpoint + 1) % TOTAL_CHECKPOINTS;
  
  const checkpoint = checkpoints[expectedCheckpoint];
  const distance = playerPos.distanceTo(checkpoint.position);
  
  if (distance < checkpoint.width) {
    playerVehicle.state.lastCheckpoint = expectedCheckpoint;
    
    probe.log('info', `Checkpoint ${expectedCheckpoint + 1}/${TOTAL_CHECKPOINTS}`, {
      lapTime: getCurrentLapTime(),
    });
    
    // Check for lap completion
    if (expectedCheckpoint === 0 && playerVehicle.state.currentLap > 0) {
      completeLap();
    }
  }
}

function completeLap() {
  const lapTime = Date.now() - playerVehicle.state.lapStartTime;
  
  // Update best lap
  if (playerVehicle.state.bestLapTime === 0 || lapTime < playerVehicle.state.bestLapTime) {
    playerVehicle.state.bestLapTime = lapTime;
    probe.log('info', `New best lap: ${formatTime(lapTime)}!`);
  }
  
  playerVehicle.state.currentLap++;
  playerVehicle.state.lapStartTime = Date.now();
  
  probe.log('info', `Lap ${playerVehicle.state.currentLap}/${TOTAL_LAPS}`, {
    lapTime: formatTime(lapTime),
    bestLap: formatTime(playerVehicle.state.bestLapTime),
  });
  
  // Update entity
  probe.updateLogicalEntity('PlayerVehicle', {
    metadata: {
      lap: playerVehicle.state.currentLap,
      bestLap: playerVehicle.state.bestLapTime,
    },
  });
  
  // Check for race finish
  if (playerVehicle.state.currentLap > TOTAL_LAPS) {
    finishRace();
  }
}
```

#### Step 5: Debug Visualization

```typescript
class RacingDebugger {
  private velocityHelper: THREE.ArrowHelper;
  private steeringHelper: THREE.ArrowHelper;
  private waypointHelpers: THREE.Mesh[] = [];
  
  constructor() {
    this.velocityHelper = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(),
      1,
      0x00ff00
    );
    
    this.steeringHelper = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(),
      1,
      0xff0000
    );
  }
  
  update(vehicle: Vehicle) {
    const state = vehicle.state;
    
    // Velocity vector
    this.velocityHelper.position.copy(state.position);
    this.velocityHelper.position.y += 1;
    this.velocityHelper.setDirection(state.velocity.clone().normalize());
    this.velocityHelper.setLength(state.speed * 0.1);
    
    // Steering indicator
    this.steeringHelper.position.copy(state.position);
    this.steeringHelper.position.y += 1.5;
    this.steeringHelper.setDirection(
      new THREE.Vector3(Math.sin(state.rotation + Math.PI/2), 0, Math.cos(state.rotation + Math.PI/2))
    );
    this.steeringHelper.setLength(Math.abs(state.steering));
  }
  
  toggleVisibility(show: boolean) {
    this.velocityHelper.visible = show;
    this.steeringHelper.visible = show;
  }
}
```

### Debug Controls

| Key | Action |
|-----|--------|
| `F1` | Toggle 3Lens overlay |
| `F2` | Toggle velocity vectors |
| `F3` | Toggle AI waypoints |
| `F4` | Toggle track boundaries |
| `F5` | Toggle surface type display |
| `R` | Reset vehicle position |
| `P` | Pause race |

### Performance Targets

| Metric | Target | 3Lens Monitoring |
|--------|--------|------------------|
| FPS | 60+ | Stats Panel |
| Physics Step | <2ms | Performance Panel |
| AI Updates | <1ms | Frame Timeline |

---

## Platformer Physics

A 2D platformer demonstrating jump mechanics and collision debugging with 3Lens.

### Features Demonstrated

- **Jump Mechanics**: Variable jump height, double jump, coyote time
- **Collision Detection**: AABB, raycasting
- **Player States**: Idle, running, jumping, falling, wall-sliding
- **Debug Overlays**: Hitboxes, trajectory prediction, velocity vectors
- **Physics Tuning**: Real-time parameter adjustment

### Quick Start

```bash
# From the monorepo root
pnpm install
cd examples/game-development/platformer-physics
pnpm dev
```

Open http://localhost:3000 in your browser. Use A/D or arrows to move, Space to jump.

### Project Structure

```
platformer-physics/
├── src/
│   └── main.ts          # Platformer implementation
├── index.html           # HTML entry with debug UI
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Step-by-Step Walkthrough

#### Step 1: Define Physics Types

```typescript
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
```

#### Step 2: Jump System with Coyote Time

```typescript
function handleJump() {
  // Jump buffer - remember jump input for a short time
  if (keys.jump) {
    physics.jumpBufferTime = PHYSICS.jumpBuffer;
  }
  
  // Can jump if:
  // 1. Grounded or within coyote time
  // 2. Have jumps remaining (double jump)
  // 3. Jump buffer is active
  const canJump = 
    (physics.grounded || physics.coyoteTime > 0) ||
    physics.jumpCount < physics.maxJumps;
  
  if (physics.jumpBufferTime > 0 && canJump) {
    // Perform jump
    physics.velocity.y = PHYSICS.jumpForce;
    physics.jumpCount++;
    physics.grounded = false;
    physics.coyoteTime = 0;
    physics.jumpBufferTime = 0;
    physics.jumpStartY = physics.position.y;
    
    probe.log('debug', 'Jump executed', {
      jumpCount: physics.jumpCount,
      wasGrounded: physics.grounded,
      coyoteTimeUsed: physics.coyoteTime > 0,
    });
  }
  
  // Variable jump height - cut jump short if released early
  if (!keys.jump && physics.velocity.y > 0) {
    physics.velocity.y *= 0.5;
  }
}

function updateCoyoteTime(dt: number) {
  // Coyote time - grace period after leaving ground
  if (physics.grounded) {
    physics.coyoteTime = PHYSICS.coyoteTime;
  } else {
    physics.coyoteTime -= dt;
  }
  
  // Jump buffer countdown
  if (physics.jumpBufferTime > 0) {
    physics.jumpBufferTime -= dt;
  }
}
```

#### Step 3: 3Lens Integration

```typescript
import { DevtoolProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = new DevtoolProbe();
probe.observeScene(scene);
probe.observeRenderer(renderer);

// Register player
probe.registerLogicalEntity({
  name: 'Player',
  module: 'platformer/player',
  componentType: 'PlayerController',
  linkedObject: playerGroup,
  tags: ['player', 'physics'],
  metadata: {
    state: physics.state,
    grounded: physics.grounded,
    velocity: physics.velocity.toArray(),
  },
});

const overlay = createOverlay(probe);
overlay.mount(document.getElementById('app')!);

// Update physics data each frame
function updatePhysicsEntity() {
  probe.updateLogicalEntity('Player', {
    metadata: {
      state: physics.state,
      grounded: physics.grounded,
      velocity: [physics.velocity.x.toFixed(2), physics.velocity.y.toFixed(2)],
      coyoteTime: physics.coyoteTime.toFixed(3),
      jumpCount: physics.jumpCount,
      airTime: physics.airTime.toFixed(2),
    },
  });
}
```

#### Step 4: Collision Detection with Debug

```typescript
interface Platform {
  mesh: THREE.Mesh;
  bounds: THREE.Box2;
  type: 'solid' | 'one-way' | 'moving' | 'hazard';
}

function checkCollisions() {
  const playerBounds = getPlayerBounds();
  physics.lastCollision = 'none';
  physics.touchingWallLeft = false;
  physics.touchingWallRight = false;
  physics.touchingCeiling = false;
  
  for (const platform of platforms) {
    if (!playerBounds.intersectsBox(platform.bounds)) continue;
    
    // Calculate overlap
    const overlap = getOverlap(playerBounds, platform.bounds);
    
    // Resolve collision based on smallest overlap
    if (Math.abs(overlap.x) < Math.abs(overlap.y)) {
      // Horizontal collision
      physics.position.x += overlap.x;
      physics.velocity.x = 0;
      
      if (overlap.x > 0) {
        physics.touchingWallLeft = true;
        physics.lastCollision = 'wall-left';
      } else {
        physics.touchingWallRight = true;
        physics.lastCollision = 'wall-right';
      }
    } else {
      // Vertical collision
      if (overlap.y > 0 && physics.velocity.y < 0) {
        // Landing
        physics.position.y += overlap.y;
        physics.velocity.y = 0;
        physics.grounded = true;
        physics.jumpCount = 0;
        physics.lastCollision = 'ground';
        
        // Track air time for debugging
        if (physics.airTime > 0) {
          probe.log('debug', 'Landed', {
            airTime: physics.airTime.toFixed(2),
            peakHeight: (physics.peakHeight - physics.jumpStartY).toFixed(2),
          });
        }
        physics.airTime = 0;
      } else if (overlap.y < 0 && physics.velocity.y > 0) {
        // Hit ceiling
        physics.position.y += overlap.y;
        physics.velocity.y = 0;
        physics.touchingCeiling = true;
        physics.lastCollision = 'ceiling';
      }
    }
    
    // Update hitbox visualization
    updateCollisionHelper(platform, overlap);
  }
}
```

#### Step 5: Debug Visualization

```typescript
// Debug groups
const hitboxGroup = new THREE.Group();
hitboxGroup.name = 'Hitboxes';
scene.add(hitboxGroup);

const trajectoryGroup = new THREE.Group();
trajectoryGroup.name = 'Trajectory';
scene.add(trajectoryGroup);

const vectorGroup = new THREE.Group();
vectorGroup.name = 'Vectors';
scene.add(vectorGroup);

function updateDebugVisualization() {
  // Player hitbox
  if (showHitboxes) {
    playerHitbox.position.set(physics.position.x, physics.position.y, 0);
    playerHitbox.visible = true;
  }
  
  // Velocity vector
  if (showVelocity) {
    velocityArrow.position.set(physics.position.x, physics.position.y, 0);
    velocityArrow.setDirection(
      new THREE.Vector3(physics.velocity.x, physics.velocity.y, 0).normalize()
    );
    velocityArrow.setLength(
      Math.sqrt(physics.velocity.x ** 2 + physics.velocity.y ** 2) * 0.2
    );
    velocityArrow.visible = true;
  }
  
  // Trajectory prediction
  if (showTrajectory && !physics.grounded) {
    updateTrajectoryPrediction();
  }
}

function updateTrajectoryPrediction() {
  const points: THREE.Vector3[] = [];
  let simPos = physics.position.clone();
  let simVel = physics.velocity.clone();
  
  for (let i = 0; i < 30; i++) {
    points.push(new THREE.Vector3(simPos.x, simPos.y, 0));
    
    simVel.y += PHYSICS.gravity * 0.016;
    simPos.x += simVel.x * 0.016;
    simPos.y += simVel.y * 0.016;
    
    // Stop at ground
    if (simPos.y < 0) break;
  }
  
  trajectoryLine.geometry.setFromPoints(points);
}
```

### Debug Controls

| Key | Action |
|-----|--------|
| `F1` | Toggle 3Lens overlay |
| `F2` | Toggle hitbox visualization |
| `F3` | Toggle trajectory prediction |
| `F4` | Toggle velocity vectors |
| `F5` | Toggle raycast visualization |
| `R` | Reset player position |
| `P` | Pause physics |
| `N` | Step one frame (when paused) |

### Physics Debug Panel

The example includes a real-time physics debug panel showing:

- **Position**: X, Y coordinates
- **Velocity**: X, Y components
- **State**: Current player state
- **Grounded**: Ground contact status
- **Coyote Time**: Remaining coyote time
- **Jump Buffer**: Remaining buffer time
- **Air Time**: Time since leaving ground
- **Last Collision**: Most recent collision type

### Tuning with 3Lens

Use the Object Inspector to tune physics parameters:

1. Select the Player entity
2. Expand metadata
3. Monitor values in real-time
4. Adjust PHYSICS constants and observe changes

---

## See Also

- [Framework Integration Examples](./framework-integration.md) - Framework-specific setups
- [Debugging Examples](./debugging-examples.md) - Performance and memory debugging
- [Feature Showcase Examples](./feature-showcase.md) - 3Lens feature demonstrations
- [Real-World Scenarios](./real-world-scenarios.md) - Production application patterns
- [Performance Debugging Guide](/guides/PERFORMANCE-DEBUGGING-GUIDE.md) - Optimization techniques
- [Logical Entities Guide](/guides/LOGICAL-ENTITIES-GUIDE.md) - Entity registration patterns
