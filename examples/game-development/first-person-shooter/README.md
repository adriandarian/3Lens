# First-Person Shooter Demo

A wave-based FPS arena game showcasing 3Lens integration for debugging player mechanics, enemy AI, bullet physics, and game performance.

## Features

### Gameplay
- **Wave-based survival**: Defeat waves of enemies with increasing difficulty
- **FPS controls**: Standard WASD movement, mouse look, jumping, and sprinting
- **Weapon system**: Magazine-based ammo with reloading
- **Scoring**: Points for kills, bonus for headshots
- **Health system**: Take damage from enemy attacks

### Enemy AI
- **Chase behavior**: Enemies track and pursue the player
- **Attack state**: Enemies deal damage when in close range
- **Wave spawning**: Enemies spawn in circular patterns around the arena
- **Difficulty scaling**: More enemies per wave as you progress

### Debug Visualization
- **Enemy paths**: Show lines from enemies to player
- **Hitboxes**: Display collision boxes around enemies
- **Bullet trails**: Visual tracers for projectiles
- **Player stats**: Real-time position, velocity, and accuracy

### 3Lens Integration
- **Scene graph inspection**: Full hierarchy of arena, enemies, and effects
- **Entity tracking**: Player, Arena, and Enemy entities with metadata
- **Performance monitoring**: Frame times, draw calls, memory usage
- **Transform gizmo**: Manipulate objects directly in the scene

## Getting Started

### Installation

```bash
cd examples/game-development/first-person-shooter
pnpm install
```

### Development

```bash
pnpm dev
```

Open http://localhost:3020 to play the game.

## Controls

### Movement

| Key | Action |
|-----|--------|
| **W** / **↑** | Move forward |
| **S** / **↓** | Move backward |
| **A** / **←** | Strafe left |
| **D** / **→** | Strafe right |
| **Space** | Jump |
| **Shift** | Sprint |

### Combat

| Input | Action |
|-------|--------|
| **Left Click** | Shoot |
| **R** | Reload |
| **Mouse Move** | Look around |

### Debug

| Key | Action |
|-----|--------|
| **~** (Backtick) | Toggle 3Lens overlay |

## HUD Elements

### Health Bar
- Located bottom-left
- Color changes based on health level:
  - **Green**: > 50% health
  - **Yellow**: 25-50% health
  - **Red**: < 25% health

### Ammo Display
- Located bottom-right
- Shows current magazine / reserve ammo
- Auto-reloads when magazine is empty

### Score & Wave
- Score in top-right corner
- Wave number and enemy count in top-left

### Kill Feed
- Shows recent eliminations
- Gold border indicates headshots

## Debug Panel

### Player Stats
- **Position**: Current world coordinates
- **Velocity**: Movement speed in m/s
- **Accuracy**: Hit percentage

### Visualization Toggles
| Toggle | Description |
|--------|-------------|
| **Enemy Paths** | Green lines showing AI navigation |
| **Hitboxes** | Red boxes around enemy collision areas |
| **Bullet Trails** | Yellow tracer lines behind projectiles |

### Game Settings
| Setting | Range | Description |
|---------|-------|-------------|
| **Enemy Speed** | 0.5x - 2.0x | AI movement speed multiplier |
| **Enemy Count** | 1 - 15 | Base enemies per wave |

### Actions
| Button | Description |
|--------|-------------|
| **Spawn Enemy** | Add a single enemy at random position |
| **Refill Ammo** | Restore ammo to maximum |
| **God Mode** | Toggle invincibility |
| **Restart** | Reset game state |

## 3Lens Integration Details

### Registered Entities

1. **Player** (`game/player`)
   - Component type: `PlayerController`
   - Tags: `player`, `controllable`
   - Metadata: health, ammo

2. **Arena** (`game/environment`)
   - Component type: `Arena`
   - Tags: `environment`, `static`
   - Contains: floor, walls, cover, pillars

3. **Enemies** (`game/enemies`)
   - Component type: `Enemy`
   - Tags: `enemy`, `ai`, `damageable`
   - Metadata: health, speed, state, distance to player

### Performance Metrics
- Frame time monitoring
- Draw call tracking
- Memory usage estimation
- GPU timing (when available)

### Scene Hierarchy
```
FPS Arena
├── Arena
│   ├── Floor
│   ├── GridHelper
│   ├── Wall_0..3
│   ├── Cover_0..8
│   └── Pillar_0..3
├── Enemy_0..N
│   ├── Body (Capsule)
│   ├── Head (Sphere)
│   └── Eyes
├── Bullets
│   └── Bullet meshes + trails
└── Lights
    ├── AmbientLight
    └── DirectionalLight
```

## Game Mechanics

### Shooting
- Fire rate: 100ms between shots
- Bullet speed: 80 units/second
- Base damage: 25 HP
- Headshot multiplier: 2x

### Enemy Stats
- Health: 100 HP
- Speed: 3-5 units/second (varies)
- Attack damage: 10 HP
- Attack cooldown: 1 second

### Scoring
- Normal kill: 100 points
- Headshot kill: 150 points

### Wave Progression
- Wave 1: 5 enemies
- Each wave adds 2 more enemies
- 2-second delay between waves

## Technical Details

### Physics
- Simple ground-based movement
- Gravity: 20 units/second²
- Jump force: 8 units
- Arena bounds: 100x100 units

### Rendering
- Shadow mapping with PCF soft shadows
- Fog for depth perception
- Dynamic lighting

### Architecture
- Pointer lock controls for FPS camera
- State machine for enemy AI
- Object pooling recommended for bullets (not implemented in demo)

## Tips for Debugging

1. **Enable hitboxes** to verify collision detection is working correctly
2. **Watch enemy paths** to understand AI behavior
3. **Monitor accuracy stat** to tune weapon feel
4. **Use god mode** when testing specific mechanics
5. **Adjust enemy count/speed** to stress-test performance
6. **Open 3Lens overlay** to inspect scene hierarchy and performance

## Known Limitations

- Simple collision detection (sphere-based)
- No obstacle avoidance for enemies
- Basic bullet physics (no penetration)
- No audio system
- No weapon variety

These limitations are intentional to keep the example focused on 3Lens integration patterns.
