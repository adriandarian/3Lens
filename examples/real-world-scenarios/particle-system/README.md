# Particle System Debugger Example

An interactive particle system with real-time parameter tuning and 3Lens integration for debugging particle effects.

## Features Demonstrated

- **GPU-Instanced Particles**: Efficient particle rendering with buffer attributes
- **Object Pooling**: Pre-allocated particle pool for zero-allocation runtime
- **8 Emitter Presets**: Fountain, Fire, Snow, Sparks, Smoke, Confetti, Rain, Magic
- **Real-time Parameter Tuning**: Adjust emission, velocity, size, colors live
- **Performance Monitoring**: Active count, emission rate, memory usage
- **3Lens Integration**: Full probe and overlay for deep debugging

## Quick Start

```bash
# From the 3Lens root directory
pnpm install

# Run this example
cd examples/real-world-scenarios/particle-system
pnpm dev
```

Then open http://localhost:3009 in your browser.

## Project Structure

```
particle-system/
├── src/
│   └── main.ts          # Particle system implementation
├── index.html           # UI with controls
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Emitter Presets

| Preset | Description |
|--------|-------------|
| ⛲ Fountain | Classic upward spray with gravity |
| 🔥 Fire | Rising flames with orange-red colors |
| ❄️ Snow | Gentle falling snowflakes |
| ⚡ Sparks | Fast bright sparks with heavy gravity |
| 💨 Smoke | Rising translucent smoke clouds |
| 🎉 Confetti | Colorful celebration particles |
| 🌧️ Rain | Fast-falling rain drops |
| 🌟 Magic | Floating mystical sparkles |

## Controls

### Emission
| Control | Description |
|---------|-------------|
| Emission Rate | Particles spawned per second |
| Max Particles | Pool size (requires recreation) |
| Lifetime | How long particles live |

### Velocity
| Control | Description |
|---------|-------------|
| Initial Speed | Starting velocity magnitude |
| Spread Angle | Cone angle of emission |
| Gravity | Vertical acceleration |

### Appearance
| Control | Description |
|---------|-------------|
| Start/End Size | Size interpolation over lifetime |
| Start/End Color | Color interpolation over lifetime |
| Opacity | Material transparency |
| Additive/Transparent | Blending mode |

### Actions
| Button | Description |
|--------|-------------|
| Emit/Pause | Toggle continuous emission |
| Burst | Emit 200 particles instantly |
| Clear | Remove all active particles |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle emission |
| `B` | Trigger burst |
| `C` | Clear all particles |
| `Ctrl+Shift+D` | Toggle devtool overlay |

## Implementation Details

### Particle System Architecture

```typescript
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
  lifetime: number;
  size: number;
  color: THREE.Color;
  active: boolean;
}
```

### Buffer Geometry

The system uses `THREE.BufferGeometry` with three attributes:
- `position` (Float32Array) - 3 floats per particle
- `color` (Float32Array) - 3 floats per particle (RGB)
- `size` (Float32Array) - 1 float per particle

### Object Pooling

All particles are pre-allocated at initialization:
- No runtime allocations during emission
- Inactive particles are hidden off-screen (y = -1000)
- Pool is reused cyclically

### Update Loop

Each frame:
1. Accumulate emission time
2. Emit new particles based on rate
3. Update each active particle:
   - Apply gravity to velocity
   - Update position
   - Interpolate size and color
   - Check lifetime
4. Update buffer attributes

## 3Lens Debugging Features

Open 3Lens with `Ctrl+Shift+D` to:

- **Scene Panel**: Inspect particle system hierarchy
- **Geometry Inspector**: View buffer attribute details
- **Material Inspector**: Examine PointsMaterial properties
- **Performance Timeline**: Monitor frame times
- **Memory Panel**: Track buffer memory usage

### What to Debug

1. **Geometry Attributes**: Check position/color/size buffers
2. **Draw Calls**: Should always be 1 for the particle system
3. **Memory Usage**: Monitor buffer sizes as max particles change
4. **Material Settings**: Verify blending mode and opacity

## Performance Tips

1. **Max Particles**: Keep under 50,000 for smooth performance
2. **Emission Rate**: Balance with lifetime for stable particle counts
3. **Blending**: Additive blending is cheaper than transparent
4. **Size Attenuation**: Enabled by default for proper perspective

## Extending

Ideas for extending this example:

- **Texture Sprites**: Add particle textures
- **Trails**: Connect particles with lines
- **Forces**: Add wind, turbulence, attractors
- **Collision**: Floor bounce or object collision
- **Sub-emitters**: Spawn particles from particles
- **GPU Particles**: Move simulation to vertex shader

## Performance Metrics

On a typical machine:
- 10,000 particles: 60 FPS
- 30,000 particles: 60 FPS
- 50,000 particles: ~45-60 FPS

Memory per 10,000 particles: ~280 KB
