# Custom Render Pipeline Example

A comprehensive demonstration of building a deferred rendering pipeline with multiple render passes and full 3Lens integration.

## Features

### Deferred Rendering Pipeline
- **G-Buffer Pass**: Multiple Render Targets (MRT) capturing albedo, normals, positions, and depth
- **SSAO Pass**: Screen-space ambient occlusion for realistic soft shadows
- **Lighting Pass**: Deferred PBR lighting with multiple dynamic lights
- **Bloom Pass**: HDR bright extraction and Gaussian blur
- **Composite Pass**: Tone mapping (ACES), vignette, and gamma correction

### Post-Processing Effects
- **Bloom**: Configurable intensity and brightness threshold
- **SSAO**: Adjustable radius for ambient occlusion
- **Vignette**: Screen-edge darkening effect
- **ACES Tone Mapping**: Film-like color response

### Debug Visualization
- **Final Output**: Fully composited render
- **G-Buffer View**: Raw albedo and material properties
- **Depth View**: Linearized depth buffer
- **Normal View**: World-space normals

### 3Lens Integration
- Individual render pass entities
- Real-time GPU timing per pass
- Draw call tracking
- Pipeline configuration inspection

## Running the Example

```bash
cd examples/advanced-techniques/custom-render-pipeline
pnpm install
pnpm dev
```

Open http://localhost:3028 in your browser.

## Controls

### Mouse
- **Left Click + Drag**: Orbit camera
- **Right Click + Drag**: Pan camera
- **Scroll**: Zoom in/out

### Keyboard
- **Tab**: Cycle through debug views

### UI Controls

#### Render Passes Panel
- Toggle individual passes on/off
- View per-pass timing and draw calls
- Click pass to inspect details

#### Pipeline Flow Diagram
- Visual representation of render pipeline
- Shows data flow between passes
- Highlights disabled passes

#### Post-Processing Sliders
- **Bloom Intensity**: 0.0 - 1.0
- **Bloom Threshold**: 0.0 - 1.0
- **SSAO Radius**: 0.0 - 1.0
- **Vignette Amount**: 0.0 - 1.0

#### Debug Views
- **Final**: Complete rendered output
- **G-Buffer**: Albedo/material view
- **Depth**: Depth buffer visualization
- **Normals**: Normal buffer visualization

## Architecture

### Render Pipeline Stages

```
┌─────────────┐   ┌──────────┐   ┌──────────────┐
│  Geometry   │──▶│   SSAO   │──▶│   Lighting   │
│   Pass      │   │   Pass   │   │    Pass      │
└─────────────┘   └──────────┘   └──────────────┘
      │                               │
      │ G-Buffer (MRT)                │ HDR Scene
      │ - Albedo                      │
      │ - Normals                     ▼
      │ - Position            ┌──────────────┐
      │ - Depth               │    Bloom     │
      │                       │   Extract    │
      ▼                       └──────────────┘
┌─────────────┐                      │
│   Debug     │                      ▼
│   Views     │               ┌──────────────┐
└─────────────┘               │    Bloom     │
                              │    Blur      │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  Composite   │──▶ Screen
                              │    Pass      │
                              └──────────────┘
```

### G-Buffer Layout

| Attachment | Content | Format |
|------------|---------|--------|
| RT0 | Albedo (RGB) + Metalness (A) | RGBA16F |
| RT1 | Normal (RGB) + Roughness (A) | RGBA16F |
| RT2 | World Position (RGB) | RGBA16F |
| Depth | Depth Buffer | D32 |

### Lighting Model

The lighting pass implements physically-based rendering (PBR):
- **GGX Distribution** for specular highlights
- **Smith Geometry** function for shadowing
- **Schlick Fresnel** approximation
- **Multiple point lights** with attenuation

## Technical Details

### Shaders

All shaders are embedded in the TypeScript source:

1. **G-Buffer Shaders**: Output material properties to MRT
2. **SSAO Shader**: 16-sample kernel with randomized rotation
3. **Lighting Shader**: Full PBR with 4 lights
4. **Bloom Shaders**: Threshold extraction + separable Gaussian blur
5. **Composite Shader**: ACES tone mapping + vignette
6. **Debug Shader**: Multi-mode visualization

### Performance Considerations

- Half-precision (16-bit float) render targets where applicable
- Downsampled SSAO (half resolution)
- Downsampled bloom (quarter resolution)
- Separable blur passes for efficiency

### 3Lens Entity Registration

```typescript
// Pipeline entity
probe.registerLogicalEntity({
  id: 'render-pipeline',
  name: 'Deferred Render Pipeline',
  type: 'pipeline',
  metadata: {
    passes: 6,
    renderTargets: 6
  }
});

// Per-pass entities
passes.forEach(pass => {
  probe.registerLogicalEntity({
    id: `pass-${pass.id}`,
    name: pass.name,
    type: 'render-pass',
    metadata: { ... }
  });
});
```

## Customization

### Adding New Passes

1. Create render target in `initRenderTargets()`
2. Create material with shaders in `createMaterials()`
3. Add pass entry to `passes` array in `initPasses()`
4. Add rendering logic in `renderPipeline()`
5. Register with 3Lens

### Modifying Materials

G-Buffer materials support:
- `uColor`: Base color (RGB)
- `uRoughness`: Surface roughness (0-1)
- `uMetalness`: Metallic property (0-1)

### Adding Lights

```typescript
lights.push({
  position: new THREE.Vector3(x, y, z),
  color: new THREE.Color(r, g, b)
});
```

## Files

```
custom-render-pipeline/
├── src/
│   └── main.ts        # Complete pipeline implementation
├── index.html         # UI with pass inspector
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── vite.config.ts     # Vite configuration
└── README.md          # This file
```

## Dependencies

- **three**: ^0.160.0 - 3D rendering
- **@3lens/core**: workspace:* - Devtool probe
- **@3lens/overlay**: workspace:* - Debug overlay

## Related Examples

- [Shadow Comparison](../shadow-comparison/) - Shadow mapping techniques
- [Post-Processing](../../real-world-scenarios/post-processing/) - Additional effects
- [Shader Debugging](../../debugging-profiling/shader-debugging/) - Shader inspection
