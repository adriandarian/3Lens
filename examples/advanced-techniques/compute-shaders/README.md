# Compute Shader Debugging

This example demonstrates WebGPU compute shaders for particle simulation with **3Lens** integration for inspecting compute pipelines and GPU buffers.

## Compute Shaders

Two simulation modes are available:

- **Particles** - Gravity-based particle physics with attractor force
- **Boids** - Flocking behavior with separation, alignment, and cohesion

## Using 3Lens for Compute Debugging

### Open the 3Lens Overlay

Press the 3Lens hotkey to access the devtools panel.

### Inspect Compute System

The **GPU Compute Simulation** entity shows:
- Particle count
- Current shader type (particles/boids)
- Workgroup size (256)
- GPU memory usage
- Compute time per frame

### Inspect Compute Passes

Each compute pass is registered as a logical entity:
- **Force Compute** - Calculates forces (gravity, attraction, flocking)
- **Integration** - Updates positions from velocities
- **Collision** - Handles boundary collisions

### What to Look For

1. **Compute Time** - Total GPU compute time per frame
2. **Memory Usage** - Buffer sizes for positions and velocities
3. **Workgroup Count** - Number of dispatched workgroups
4. **Particle Distribution** - Visualize through Three.js scene

## Controls

- **Right-click drag** - Move attractor point
- **Pause/Run** - Toggle simulation
- **Reset** - Reinitialize particles

## WebGPU Fallback

If WebGPU is not available, the simulation runs on CPU with reduced performance. The status indicator shows the current mode.

## Technical Details

| Property | Particles | Boids |
|----------|-----------|-------|
| Particle Count | 16,384 | 16,384 |
| Workgroup Size | 256 | 256 |
| Buffer Format | vec4<f32> | vec4<f32> |
| Position Buffer | 256 KB | 256 KB |
| Velocity Buffer | 256 KB | 256 KB |

## Key Files

- `src/main.ts` - WebGPU setup and 3Lens integration
- `index.html` - Minimal UI

## Running the Example

```bash
cd examples/advanced-techniques/compute-shaders
npm install
npm run dev
```

**Note:** Requires a browser with WebGPU support (Chrome 113+, Edge 113+).
