# Platformer Physics Debug - 3Lens Example

A 2D platformer example demonstrating 3Lens devtool integration for debugging jump mechanics, collision detection, movement physics, and player states in a Three.js game.

## Features

### Physics Debugging
- **Velocity Tracking**: Real-time X/Y velocity with visual bars
- **Jump Mechanics**: Jump force, double jump count, air time, peak height
- **Gravity & Friction**: Configurable physics constants display
- **Coyote Time**: Visual indicator for jump grace period
- **Jump Buffer**: Input buffering for responsive controls

### Collision Detection
- **AABB Collision**: Axis-aligned bounding box detection
- **Multi-directional**: Ground, ceiling, left wall, right wall indicators
- **Platform Types**: Solid, one-way, moving, and hazard platforms
- **Visual Raycasts**: Optional raycast visualization for debugging

### Player States
- **Idle**: Standing still on ground
- **Running**: Moving horizontally on ground
- **Jumping**: Ascending after jump
- **Falling**: Descending without ground contact
- **Wall-Sliding**: Sliding down walls with reduced fall speed
- **Dashing**: Quick horizontal burst movement
- **Dead**: After losing all lives

### Visual Debug Overlays
- **Hitboxes**: Toggle collision box visualization
- **Trajectory**: Jump arc prediction preview
- **Velocity Vectors**: Arrow showing movement direction/speed
- **Raycasts**: Ground/wall detection rays

### 3Lens Integration
- Player entity with comprehensive physics metadata
- Level entity tracking platform counts
- Real-time state updates
- Scene graph inspection

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
cd examples/game-development/platformer-physics
pnpm dev
```

Open http://localhost:3023 in your browser.

## Controls

| Key | Action |
|-----|--------|
| `A` / `←` | Move Left |
| `D` / `→` | Move Right |
| `Space` / `W` | Jump (Double Jump available) |
| `Shift` | Dash |
| `R` | Reset Game |
| `~` | Toggle 3Lens Overlay |

### Debug Toggles (Bottom Left)
- **Hitboxes**: Show/hide collision boxes
- **Trajectory**: Show/hide jump prediction arc
- **Vectors**: Show/hide velocity arrow
- **Raycasts**: Show/hide collision detection rays

## Game HUD

### Lives (Top Center)
- 3 hearts indicating remaining lives
- Empty hearts show lost lives

### Player Stats (Top Left)
- Position X/Y coordinates
- Current speed

### Collectibles (Top Right)
- Coin counter
- 8 coins total to collect

### Physics Debug Panel (Left Side)
- **Velocity Section**: X/Y velocity with visual bars
- **Jump Mechanics**: Force, count, air time, peak height
- **Physics Constants**: Gravity, friction, air control

### Collision Debug Panel (Right Side)
- Ground/ceiling/wall collision indicators
- Current platform type
- Last collision event

### Player State (Bottom Left)
- Current state with color coding

### Trajectory Info (Bottom Right)
- Predicted max jump height
- Predicted horizontal distance

## Physics System

### Constants
```typescript
const PHYSICS = {
  gravity: -30,           // Downward acceleration
  jumpForce: 14,          // Initial jump velocity
  moveSpeed: 8,           // Max horizontal speed
  maxFallSpeed: -20,      // Terminal velocity
  friction: 0.85,         // Ground friction
  airControl: 0.6,        // Air movement multiplier
  coyoteTime: 0.15,       // Jump grace period (seconds)
  jumpBuffer: 0.1,        // Input buffer (seconds)
  wallSlideSpeed: -3,     // Wall slide fall speed
  wallJumpForce: {x: 10, y: 12},
  dashSpeed: 20,
  dashDuration: 0.15,
  dashCooldown: 0.5,
};
```

### Jump Mechanics

1. **Coyote Time**: Player can jump for 0.15s after leaving a platform
2. **Jump Buffer**: Jump input is remembered for 0.1s
3. **Double Jump**: One additional jump available in air
4. **Variable Height**: (Future) Hold jump for higher jumps
5. **Wall Jump**: Jump off walls with directional boost

### Collision Response

- **Ground**: Stop vertical velocity, enable grounded state
- **Ceiling**: Stop upward velocity
- **Walls**: Stop horizontal velocity, enable wall slide
- **One-way Platforms**: Only collide when falling from above

## Platform Types

| Type | Color | Behavior |
|------|-------|----------|
| Solid | Dark Blue | Full collision on all sides |
| One-way | Yellow-ish | Pass through from below, land from above |
| Moving | Green | Oscillates on X or Y axis |
| Hazard | Red | Damages player on contact |

## Level Layout

```
                    [Coin]
              [Moving Platform]
                    
   [Wall]                           [Wall]
     |                                |
     |     [Solid]                   |
     |          [Solid]              |
     |   [One-way]                   |
     |        [Solid]                |
     |                               |
  [===]  [Hazard]   [Hazard]  [====]
  
         [Ground - Full Width]
```

## 3Lens Debugging Features

### Registered Entities

1. **Player Character** (`game/player`)
   - Tags: `player`, `controllable`, `physics`
   - Metadata: state, grounded, velocity, jumpCount, position, airTime, coyoteTime, wallSliding, peakHeight

2. **Level Geometry** (`game/level`)
   - Tags: `level`, `platforms`, `static`
   - Metadata: platformCount, hazardCount, movingCount

### Debugging Scenarios

#### Jump Issues
1. Enable Trajectory overlay to see predicted jump arc
2. Watch Jump Mechanics panel for jump count and air time
3. Check coyote time indicator for grace period
4. Monitor peak height to verify jump consistency

#### Collision Problems
1. Enable Hitboxes to see all collision boxes
2. Watch collision indicators for unexpected triggers
3. Enable Raycasts to see detection rays
4. Check "Last Collision" for event logging

#### Movement Tuning
1. Enable Vectors to see velocity direction
2. Monitor velocity bars for acceleration curves
3. Adjust friction/air control values
4. Test wall sliding behavior

## Architecture

```
src/
└── main.ts          # Complete game implementation
    ├── Types & Interfaces
    ├── Physics Constants
    ├── Scene Setup (Three.js)
    ├── 3Lens Initialization
    ├── Debug Visualization Groups
    ├── Player Setup
    ├── Platform Generation
    ├── Coin System
    ├── Trajectory Visualization
    ├── Velocity Vector Visualization
    ├── Raycast Visualization
    ├── Input Handling
    ├── Physics Update
    ├── Collision Detection
    ├── UI Updates
    └── Game Loop
```

## Customization

### Modify Physics
Edit the `PHYSICS` constant in `main.ts`:

```typescript
const PHYSICS = {
  gravity: -30,      // Increase for floatier feel
  jumpForce: 14,     // Higher = bigger jumps
  moveSpeed: 8,      // Horizontal speed cap
  // ... etc
};
```

### Add Platforms
Use the `createPlatform` function:

```typescript
createPlatform(
  x,        // X position
  y,        // Y position
  width,    // Platform width
  height,   // Platform height
  'solid',  // Type: 'solid' | 'one-way' | 'moving' | 'hazard'
  speed,    // For moving platforms
  'x',      // Move axis: 'x' | 'y'
  range     // Movement range
);
```

### Add Coins
```typescript
createCoin(x, y);
```

## Technical Details

### Dependencies
- Three.js 0.160.0
- @3lens/core (workspace)
- @3lens/overlay (workspace)

### Camera
- Orthographic camera for 2D gameplay
- Smooth follow with clamping
- 18 unit view height

### Build
```bash
pnpm build
```

### Preview Production Build
```bash
pnpm preview
```

## License

Part of the 3Lens devtool examples. MIT License.
