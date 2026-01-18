# Environment Mapping Debug

This example demonstrates environment mapping and Image-Based Lighting (IBL) in Three.js, with **3Lens** integration for inspecting environment textures and material properties.

## Environment Types

- **HDR** - Procedural HDR environment with sun and sky gradient
- **Cubemap** - Six-face cubemap with distinct colors per face
- **Procedural** - Simple gradient sky

## Using 3Lens for Environment Debugging

### Open the 3Lens Overlay

Press the 3Lens hotkey to access the devtools panel.

### Inspect Environment System

Look for the **Environment Mapping System** entity which shows:
- Current environment type (HDR, cubemap, procedural)
- Environment map resolution
- PMREM (prefiltered) status
- Texture format

### Inspect Reflective Materials

Each reflective object is registered with its material properties:
- **Roughness** - Controls blur in reflections (0 = mirror, 1 = diffuse)
- **Metalness** - Controls Fresnel and reflection behavior
- **envMapIntensity** - Environment map contribution strength

### Test Objects

The scene includes spheres with varying roughness (0.0 to 1.0) arranged in a circle:
- `RoughnessSphere_0.00` - Perfect mirror reflection
- `RoughnessSphere_0.25` - Slight blur
- `RoughnessSphere_0.50` - Medium blur
- `RoughnessSphere_0.75` - Heavy blur
- `RoughnessSphere_1.00` - Fully diffuse

### What to Look For

1. **PMREM Quality** - Compare mip levels at different roughness values
2. **IBL Contribution** - How environment lighting affects material appearance
3. **Fresnel Effect** - Edge reflections on non-metallic surfaces
4. **Tone Mapping** - ACES Filmic tone mapping applied to HDR

## Scene Objects

| Object | Material Type | Purpose |
|--------|---------------|---------|
| MainSphere_Chrome | Metal, roughness=0 | Perfect reflection test |
| RoughnessSphere_* | Metal, varying roughness | PMREM mip level comparison |
| TorusKnot | Metal, low roughness | Complex reflection geometry |
| ReflectiveBox | Metal, medium roughness | Edge reflection test |
| Ground | Non-metal, high roughness | Diffuse IBL test |

## Key Files

- `src/main.ts` - Environment loading and 3Lens integration
- `index.html` - Minimal UI for environment switching

## Running the Example

```bash
cd examples/advanced-techniques/environment-mapping
npm install
npm run dev
```
