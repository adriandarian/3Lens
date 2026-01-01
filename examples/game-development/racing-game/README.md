# Racing Game Profiler - 3Lens Example

A racing game example demonstrating 3Lens devtool integration for debugging vehicle physics, lap timing, AI opponents, and performance profiling in a Three.js racing game.

## Features

### Vehicle Physics Debugging
- **Speed & Velocity**: Real-time tracking of vehicle speed, velocity vectors
- **Steering & Drift**: Monitor steering input and drift angle calculations
- **Grip Levels**: Track tire grip based on surface type
- **RPM & Gears**: Automatic transmission simulation with RPM visualization
- **Nitro System**: Boost system with consumption and recharge tracking

### Track Systems
- **Checkpoint System**: Track progress through checkpoints
- **Lap Timing**: Current lap, best lap, and race timing
- **Surface Types**: Different grip levels for asphalt, grass, sand
- **Position Tracking**: Real-time race position calculation

### AI System
- **7 AI Opponents**: Each with unique aggression and skill levels
- **Waypoint Navigation**: AI follows track waypoints
- **Per-vehicle Debugging**: Individual AI state tracking in 3Lens

### 3Lens Integration
- Logical entities for player vehicle, AI vehicles, and track
- Real-time metadata updates (speed, gear, lap, position, grip)
- Scene graph inspection for all 3D objects
- Performance profiling during gameplay

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm

### Installation

From the monorepo root:

```bash
pnpm install
```

### Running the Example

```bash
cd examples/game-development/racing-game
pnpm dev
```

Open http://localhost:3022 in your browser.

## Controls

| Key | Action |
|-----|--------|
| `W` / `↑` | Accelerate |
| `S` / `↓` | Brake/Reverse |
| `A` / `←` | Steer Left |
| `D` / `→` | Steer Right |
| `Space` | Nitro Boost |
| `R` | Reset Race |
| `~` | Toggle 3Lens Overlay |

## Game HUD

### Speedometer (Bottom Right)
- Current speed in KM/H
- Current gear (N, 1-6)

### RPM Bar
- Engine RPM visualization
- Color gradient from green (low) to red (high)

### Nitro Bar
- Nitro fuel level
- Depletes when boosting, recharges automatically

### Lap Info (Top Right)
- Current lap time
- Best lap time
- Current lap / Total laps

### Position (Top Left)
- Current race position (1st - 8th)

### Minimap (Bottom Left)
- Track overview
- Player position (red dot)
- AI positions (colored dots)

### Debug Panel (Left Side)
- Velocity value
- Acceleration value
- Steering input
- Drift angle
- Grip percentage
- Current surface type
- Checkpoint progress

## 3Lens Debugging Features

### Registered Entities

1. **Player Vehicle** (`game/vehicles`)
   - Tags: `player`, `vehicle`, `controllable`
   - Metadata: speed, gear, rpm, nitro, lap, position, grip, surface

2. **AI Vehicles** (`game/ai`)
   - Tags: `ai`, `vehicle`, `opponent`
   - Metadata: aggression, skill, targetWaypoint, speed, lap

3. **Race Track** (`game/track`)
   - Tags: `environment`, `track`
   - Metadata: laps, checkpoints, length, surfaces

### Debugging Scenarios

#### Vehicle Physics Issues
1. Open 3Lens overlay (`~`)
2. Select "Player Vehicle" entity
3. Monitor real-time physics values
4. Check grip changes when driving off-track

#### AI Behavior Analysis
1. Select an AI vehicle in 3Lens
2. Watch targetWaypoint updates
3. Compare skill/aggression to racing behavior
4. Track AI lap progress

#### Performance Profiling
1. Open Performance panel in 3Lens
2. Monitor frame times during races
3. Identify GPU/CPU bottlenecks
4. Check draw call counts

## Track Layout

The track is an oval circuit with:
- 8 checkpoints
- Asphalt racing surface (100% grip)
- Grass runoff areas (60% grip)
- Sand traps at corners (40% grip)
- Red/white curbs marking track edges

## Architecture

```
src/
└── main.ts          # Complete game implementation
    ├── Types & Interfaces
    ├── Scene Setup (Three.js)
    ├── 3Lens Initialization
    ├── Track Generation
    ├── Checkpoint System
    ├── Vehicle Creation
    ├── Physics Engine
    ├── AI System
    ├── UI Updates
    └── Game Loop
```

## Surface Physics

| Surface | Grip | Effect |
|---------|------|--------|
| Asphalt | 100% | Normal handling |
| Grass | 60% | Reduced grip, slower turning |
| Sand | 40% | Poor grip, significant slowdown |
| Gravel | 70% | Moderate grip loss |

## Nitro System

- **Capacity**: 100 units
- **Consumption**: 30 units/second when active
- **Recharge**: 5 units/second when not active
- **Boost**: 1.5x acceleration and top speed

## Race Settings

- **Laps**: 3
- **Opponents**: 7 AI vehicles
- **Checkpoints**: 8 per lap
- **Start**: Rolling start after countdown

## Technical Details

### Dependencies
- Three.js 0.160.0
- @3lens/core (workspace)
- @3lens/overlay (workspace)

### Build
```bash
pnpm build
```

### Preview Production Build
```bash
pnpm preview
```

## Customization

### Modify Vehicle Performance
Edit `VEHICLE_CONFIG` in `main.ts`:
```typescript
const VEHICLE_CONFIG = {
  maxSpeed: 120,        // Top speed
  acceleration: 40,     // Acceleration rate
  braking: 60,          // Braking force
  friction: 0.98,       // Velocity decay
  turnSpeed: 2.5,       // Steering sensitivity
  driftThreshold: 0.7,  // Drift activation
  nitroBoost: 1.5,      // Nitro multiplier
  nitroConsumption: 30, // Nitro usage rate
  nitroRecharge: 5,     // Nitro recovery rate
};
```

### Adjust AI Difficulty
AI vehicles have randomized `aggression` (0.3-0.8) and `skill` (0.6-0.9) values. Modify these ranges in `createAIVehicles()` for easier/harder opponents.

### Change Track Layout
Modify `trackWaypoints` array to create different track shapes. Checkpoints are automatically placed at waypoint positions.

## License

Part of the 3Lens devtool examples. MIT License.
