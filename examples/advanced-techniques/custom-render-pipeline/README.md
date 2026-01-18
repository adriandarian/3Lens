# Custom Render Pipeline Example

A multi-pass deferred rendering pipeline demonstrating how 3Lens can inspect complex rendering setups.

## What This Example Shows

This example implements a complete deferred rendering pipeline:

- **G-Buffer Pass**: Multiple Render Targets capturing albedo, normals, positions
- **SSAO Pass**: Screen-space ambient occlusion for soft shadows  
- **Lighting Pass**: Deferred PBR lighting with 4 dynamic point lights
- **Bloom Pass**: HDR bright extraction and Gaussian blur
- **Composite Pass**: ACES tone mapping, vignette, and gamma correction

The scene contains various PBR materials (metallic, rough, dielectric) to showcase the lighting model.

## Using 3Lens to Debug This

### Opening 3Lens

The 3Lens overlay is automatically initialized. Click the floating button or use the keyboard shortcut to open it.

### Recommended Panels

**Scene Explorer**
- Navigate to `GBufferScene` to see all renderable objects
- Each object shows its G-Buffer material properties
- Inspect the custom `RawShaderMaterial` uniforms (uColor, uRoughness, uMetalness)

**Performance Stats**
- Monitor draw calls per frame (should be ~10 for geometry + 5 fullscreen passes)
- Watch GPU memory usage from render targets
- Track frame time breakdown

**Entities Panel**
- `deferred-pipeline`: The overall pipeline entity with technique info
- `pass-geometry`: G-Buffer pass details (MRT resolution, format)
- `pass-ssao`: SSAO pass at half resolution
- `pass-lighting`: Deferred lighting pass
- `pass-bloom-extract`: Bloom threshold extraction
- `pass-bloom-blur`: Two-pass Gaussian blur
- `pass-composite`: Final composition to screen

### What to Explore

1. **Render Pass Entities**: Each pass is registered as a logical entity. In the Entities panel, you can see:
   - Pass order in the pipeline
   - Render target resolution and format
   - Pass descriptions

2. **Material Inspection**: Select objects in Scene Explorer to see their G-Buffer material properties:
   - Color, roughness, metalness uniforms
   - The GLSL3 shader code

3. **Performance Impact**: Use the Performance panel while adjusting post-processing sliders to see how bloom/SSAO affect frame time.

> **Note**: 3Lens doesn't yet have a dedicated render pass inspector panel or render target preview. These are tracked in `MISSING_FEATURES.md` for future development.

## Controls

### Scenario Controls (left panel)

- **Bloom**: Intensity of the bloom effect (0-1)
- **Threshold**: Brightness threshold for bloom extraction (0-1)  
- **SSAO**: Radius of ambient occlusion sampling (0-1)
- **Vignette**: Screen-edge darkening amount (0-1)

### Debug Views

- **Final**: Complete rendered output
- **G-Buffer**: Raw albedo/material colors
- **Normals**: World-space normal buffer
- **Position**: Distance-based heatmap (blue=near, red=far)
- **Depth**: Linearized depth buffer

### Keyboard

- **Tab**: Cycle through debug views
- **Mouse**: Orbit (left), Pan (right), Zoom (scroll)

## Running the Example

```bash
cd examples/advanced-techniques/custom-render-pipeline
pnpm install
pnpm dev
```

Open http://localhost:3028 in your browser.

## Technical Notes

### G-Buffer Layout

| Attachment | Content | Format |
|------------|---------|--------|
| RT0 | Albedo (RGB) + Metalness (A) | RGBA16F |
| RT1 | Normal (RGB) + Roughness (A) | RGBA16F |
| RT2 | World Position (RGB) | RGBA16F |
| Depth | Depth Buffer | D32 |

### Lighting Model

The deferred lighting pass implements PBR with:
- GGX distribution for specular highlights
- Smith geometry function for shadowing
- Schlick Fresnel approximation
- Point lights with inverse-square attenuation

## Related Examples

- [Shadow Comparison](../shadow-comparison/) - Shadow mapping techniques
- [Post-Processing](../../real-world-scenarios/post-processing/) - Additional post effects
- [Shader Debugging](../../debugging-profiling/shader-debugging/) - Shader inspection
