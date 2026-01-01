# Compute Shader Debugging Example

A comprehensive demonstration of WebGPU compute shader debugging with 3Lens integration, featuring GPU-accelerated particle simulations and real-time buffer inspection.

## Features

### Compute Shader Types

1. **Particle Simulation** (Default)
   - GPU-based particle physics
   - Gravity and attractor forces
   - Collision detection with boundaries
   - 16K+ particles at 60 FPS

2. **Boids Flocking**
   - Emergent swarm behavior
   - Separation, alignment, cohesion rules
   - Wrap-around boundaries
   - Real-time parameter tuning

3. **Cloth Simulation**
   - Mass-spring constraint system
   - Position-based dynamics
   - Verlet integration
   - Pin constraints support

4. **N-Body Gravity**
   - All-pairs gravitational simulation
   - Barnes-Hut optimization
   - Softening parameter
   - Mass visualization

### Debugging Features

- **Buffer Inspector**: View GPU buffer contents in real-time
- **Dispatch Statistics**: Workgroups, invocations, throughput
- **Pass Timing**: Per-pass GPU timing breakdown
- **WGSL Code Preview**: Syntax-highlighted shader source
- **Debug Info**: Device limits, pipeline state, validation

### 3Lens Integration

- Compute system entity registration
- Per-pass entity tracking
- Buffer memory tracking
- Frame timing metrics

## Running the Example

```bash
cd examples/advanced-techniques/compute-shaders
pnpm install
pnpm dev
```

Open http://localhost:3029 in your browser.

> **Note**: This example requires WebGPU support. Use Chrome 113+ or Edge 113+. A CPU fallback is provided for unsupported browsers.

## Controls

### Mouse
- **Left Click + Drag**: Orbit camera
- **Right Click + Drag**: Move attractor point
- **Scroll**: Zoom in/out

### UI Controls

#### Shader Selection
Select from 4 different compute shader demos, each demonstrating different GPU computation patterns.

#### Dispatch Configuration
- **Workgroup Size**: Fixed at 256 threads
- **Dispatch Size**: Calculated from particle count
- **Total Threads**: Number of GPU invocations

#### Simulation Controls
- **Particle Count**: 1K to 64K (powers of 2)
- **Time Step**: Simulation delta time
- **Force Strength**: Attractor force multiplier

#### Buffer Inspector
- Click buffers to inspect their contents
- View first 32 elements in grid format
- Real-time updates during simulation

## Architecture

### Compute Pipeline

```
┌─────────────────┐
│  Force Compute  │  Calculate forces (gravity, attractor)
│   Pass          │  @workgroup_size(256)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Integration   │  Update positions from velocities
│   Pass          │  Verlet/Euler integration
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Collision     │  Boundary detection and response
│   Pass          │  Box collision with bounce
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Readback      │  Copy GPU → CPU for rendering
│   (async)       │  Uses staging buffer
└─────────────────┘
```

### Buffer Layout

| Buffer | Size | Usage | Format |
|--------|------|-------|--------|
| Positions | 256 KB | Storage R/W | vec4<f32> |
| Velocities | 256 KB | Storage R/W | vec4<f32> |
| Uniforms | 32 B | Uniform | struct |
| Readback | 512 B | Map Read | vec4<f32> |

### WGSL Shader Structure

```wgsl
struct SimParams {
  deltaTime: f32,
  gravity: f32,
  damping: f32,
  particleCount: u32,
  forceStrength: f32,
  attractorX: f32,
  attractorY: f32,
  attractorZ: f32,
}

@group(0) @binding(0) var<storage, read_write> positions: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read_write> velocities: array<vec4<f32>>;
@group(0) @binding(2) var<uniform> params: SimParams;

@compute @workgroup_size(256)
fn computeForces(@builtin(global_invocation_id) id: vec3<u32>) {
  // Force calculation...
}
```

## Technical Details

### WebGPU Requirements

- Chrome 113+ or Edge 113+
- WebGPU feature flags enabled
- Minimum storage buffer size: 128 MB

### Performance Characteristics

| Particle Count | Workgroups | Expected FPS |
|---------------|------------|--------------|
| 1,024 | 4 | 60+ |
| 4,096 | 16 | 60+ |
| 16,384 | 64 | 60 |
| 65,536 | 256 | 45-60 |

### CPU Fallback

When WebGPU is unavailable, the simulation runs on CPU with:
- JavaScript typed arrays
- Sequential processing
- Reduced particle count recommended
- Same visual output

### 3Lens Entity Registration

```typescript
// Compute system entity
probe.registerLogicalEntity({
  id: 'compute-simulation',
  name: 'GPU Compute Simulation',
  type: 'compute-system',
  object3D: particleSystem,
  metadata: {
    particleCount,
    shaderType: currentShader,
    workgroupSize: 256,
    bufferCount: 3,
  }
});

// Per-pass entities
computePasses.forEach((pass, i) => {
  probe.registerLogicalEntity({
    id: `compute-pass-${i}`,
    name: pass.name,
    type: 'compute-pass',
    metadata: { index: i }
  });
});
```

## Files

```
compute-shaders/
├── src/
│   └── main.ts        # Full WebGPU compute implementation
├── index.html         # UI with buffer inspector
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── vite.config.ts     # Vite configuration
└── README.md          # This file
```

## Dependencies

- **three**: ^0.160.0 - 3D rendering (for visualization)
- **@3lens/core**: workspace:* - Devtool probe
- **@3lens/overlay**: workspace:* - Debug overlay

## Debugging Tips

1. **Check WebGPU Support**: Look at bottom status bar for "WebGPU Active"
2. **Buffer Inspection**: Click buffers to see real-time data
3. **Pass Timing**: Watch timing bars for performance bottlenecks
4. **Shader Errors**: Check browser console for WGSL compilation errors
5. **Device Limits**: Debug tab shows max workgroup size and buffer limits

## Common Issues

### "WebGPU Not Supported"
- Enable WebGPU in browser flags
- Update to latest Chrome/Edge
- Simulation will use CPU fallback

### Low FPS
- Reduce particle count
- Check GPU driver updates
- Close other GPU-intensive applications

### Buffer Data Shows NaN
- Reset simulation
- Check force strength isn't too high
- Verify uniform buffer updates

## Related Examples

- [WebGPU Features](../../feature-showcase/webgpu-features/) - WebGPU renderer basics
- [Particle System](../../real-world-scenarios/particle-system/) - CPU particle debugging
- [Performance Debugging](../../debugging-profiling/performance-debugging/) - General profiling
