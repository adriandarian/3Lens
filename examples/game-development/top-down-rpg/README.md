# Top-Down RPG Demo

A classic top-down RPG showcasing 3Lens integration for debugging game systems including player stats, enemy AI, quests, and combat mechanics.

## Features

### RPG Systems
- **Player stats**: Health, mana, experience, level progression
- **Combat**: Melee attacks with damage calculation, critical hits
- **Inventory**: Hotbar with potions and items
- **Quests**: Active quest tracking with progress bars
- **NPCs**: Interactive dialogue system with choices
- **Collectibles**: Herbs and items scattered in the world

### Enemy AI
- **State machine**: Idle, wander, chase, attack states
- **Aggro system**: Enemies detect player within range
- **Combat AI**: Attack when in range, chase when spotted
- **Death & rewards**: Experience and gold on defeat

### Debug Visualization
- **Collision boxes**: See hitboxes around enemies
- **AI paths**: Lines showing enemy-to-player paths
- **Aggro ranges**: Circular indicators for detection radius
- **Combat log**: Real-time combat event feed

### 3Lens Integration
- **World hierarchy**: Full scene graph with terrain, buildings, objects
- **Entity tracking**: Player, enemies, NPCs with metadata
- **Real-time updates**: Stats sync to entity metadata
- **Performance monitoring**: Frame times, draw calls

## Getting Started

### Installation

```bash
cd examples/game-development/top-down-rpg
pnpm install
```

### Development

```bash
pnpm dev
```

Open http://localhost:3021 to play the game.

## Controls

### Movement

| Key | Action |
|-----|--------|
| **W** / **↑** | Move north |
| **S** / **↓** | Move south |
| **A** / **←** | Move west |
| **D** / **→** | Move east |

### Combat & Interaction

| Key | Action |
|-----|--------|
| **Space** | Attack |
| **E** | Interact with NPC |
| **3** | Use health potion |
| **4** | Use mana potion |

### Inventory

| Key | Action |
|-----|--------|
| **1-8** | Select hotbar slot |

### Debug

| Key | Action |
|-----|--------|
| **~** (Backtick) | Toggle 3Lens overlay |

## HUD Elements

### Player Stats (Top-Left)
- **Health bar**: Red, decreases when damaged
- **Mana bar**: Blue, used for abilities
- **Experience bar**: Green, fills toward next level
- **Level indicator**: Current player level

### Quest Log (Top-Right)
- Active quests with objectives
- Progress bars showing completion

### Minimap (Bottom-Right)
- Yellow dot: Player position (center)
- Red dots: Enemy positions
- Blue dots: NPC positions

### Inventory Bar (Bottom-Center)
- 8 hotbar slots
- Hotkey numbers displayed
- Item counts for stackables

### Combat Log (Bottom-Left)
- Real-time combat events
- Color-coded by type:
  - **Red border**: Damage
  - **Green border**: Healing
  - **Yellow border**: Experience/rewards

## Debug Panel

### Player State
- **Position**: Current world coordinates
- **Facing**: Cardinal direction
- **State**: Idle, Walking, Attacking
- **Gold**: Currency collected

### Combat Stats
- **Attack Power**: Base damage
- **Defense**: Damage reduction
- **Crit Chance**: Critical hit percentage

### Visualization Toggles
| Toggle | Description |
|--------|-------------|
| **Collision Boxes** | Green wireframes around enemies |
| **AI Paths** | Yellow lines to player target |
| **Aggro Ranges** | Red circles showing detection radius |

### Debug Actions
| Button | Description |
|--------|-------------|
| **+ Slime** | Spawn a slime near player |
| **+ Herb** | Spawn a collectible herb |
| **Full Heal** | Restore health and mana |
| **+50 EXP** | Grant experience points |

## Game Systems

### Combat Mechanics
- **Base damage**: `attack - enemy.defense`
- **Critical hits**: 2x damage, 10% base chance
- **Attack range**: ~2 units forward arc
- **Attack cooldown**: 0.5 seconds

### Level Progression
| Level | EXP Required | Bonuses |
|-------|--------------|---------|
| 1 → 2 | 100 | +20 HP, +10 MP, +3 ATK, +2 DEF |
| 2 → 3 | 150 | +20 HP, +10 MP, +3 ATK, +2 DEF |
| N → N+1 | N × 1.5 | Same bonuses |

### Enemy Stats (Slime)
- Health: 30 HP
- Attack: 5
- Defense: 2
- EXP reward: 25
- Gold reward: 5
- Aggro range: 8 units
- Attack range: 1.5 units

### Items
| Item | Effect |
|------|--------|
| Health Potion | Restore 30 HP |
| Mana Potion | Restore 25 MP |
| Herb | Quest item (collectible) |

## 3Lens Integration Details

### Registered Entities

1. **Player** (`game/player`)
   - Component type: `PlayerController`
   - Tags: `player`, `controllable`, `combat`
   - Metadata: Full stats object (level, health, mana, attack, defense, etc.)

2. **World** (`game/world`)
   - Component type: `WorldMap`
   - Tags: `environment`, `static`
   - Contains: Ground tiles, trees, rocks, buildings

3. **Enemies** (`game/enemies`)
   - Component type: `Enemy`
   - Tags: `enemy`, `ai`, `slime`
   - Metadata: type, health, state, distanceToPlayer

4. **NPCs** (`game/npcs`)
   - Component type: `NPC`
   - Tags: `npc`, `interactive`
   - Metadata: name

### Scene Hierarchy
```
RPG World
├── World
│   ├── Ground (tiles)
│   ├── Trees
│   ├── Rocks
│   └── Buildings
├── Player
│   ├── Body
│   ├── Head
│   ├── Hair
│   └── Sword
├── Slime_0..N
│   ├── Body
│   └── Eyes
├── NPC_Village Elder
│   ├── Body
│   └── Head
├── Herb_0..N
└── Lights
```

### Performance Monitoring
- Frame time tracking via `probe.captureFrame()`
- Entity count monitoring
- Memory usage estimation

## Quest System

### The Slime Menace
- **Objective**: Defeat 5 slimes
- **Progress**: Tracked automatically
- **Reward**: (Complete via NPC dialogue)

### Collect Herbs
- **Objective**: Gather 3 herbs
- **Progress**: Auto-pickup when near
- **Reward**: Herb items in inventory

## Tips for Debugging

1. **Enable AI paths** to understand enemy behavior
2. **Show aggro ranges** to test detection distances
3. **Use collision boxes** to verify hitbox sizes
4. **Watch combat log** for damage calculations
5. **Spawn enemies** to stress-test combat system
6. **Grant EXP** to test level-up flow
7. **Open 3Lens** to inspect entity metadata in real-time

## Architecture Notes

### State Machine Pattern
Enemies use a simple state machine:
```
idle → wander (random movement)
     ↓
chase (player in aggro range)
     ↓
attack (player in attack range)
     ↓
dead (health <= 0)
```

### Camera System
- Orthographic camera for true top-down view
- Camera follows player position
- Fixed view size for consistent scale

### Collision Detection
- Distance-based checks (no physics engine)
- Forward arc check for melee attacks
- Pickup radius for collectibles

## Known Limitations

- No pathfinding (enemies move directly toward player)
- Simple distance-based collision
- No save/load system
- Single map area
- Limited enemy variety

These are intentional to keep the example focused on 3Lens debugging patterns.
