# 3D Model Viewer Example

A full-featured 3D model viewer demonstrating 3Lens devtool integration for inspecting GLTF/GLB models.

## Features Demonstrated

- **GLTF/GLB Loading**: Load models via file picker or drag & drop
- **Sample Models**: Built-in procedural models for testing
- **3Lens Integration**: Full probe and overlay for debugging
- **Model Statistics**: Real-time mesh, triangle, material, and texture counts
- **Environment Presets**: Studio, outdoor, and dark environments
- **Display Modes**: Shaded, wireframe, and normals visualization
- **Animation Support**: Play animations with speed control
- **Transform Controls**: Scale, rotate, and position models
- **Shadow Mapping**: PBR rendering with soft shadows

## Quick Start

```bash
# From the 3Lens root directory
pnpm install

# Run this example
cd examples/real-world-scenarios/3d-model-viewer
pnpm dev
```

Then open http://localhost:3008 in your browser.

## Project Structure

```
3d-model-viewer/
├── src/
│   └── main.ts          # Main application entry point
├── index.html           # Main HTML file with UI
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Usage

### Loading Models

1. **File Picker**: Click "Choose GLTF/GLB File" to browse for a model
2. **Drag & Drop**: Drag a `.gltf` or `.glb` file onto the viewport
3. **Sample Models**: Select from the dropdown to load procedural models

### Sample Models

| Model | Description |
|-------|-------------|
| Box | Simple cube with PBR material |
| Sphere | High-poly sphere with metallic material |
| Torus Knot | Complex geometry for testing |
| Animated Cubes | Multiple animated objects |
| Vehicle | Multi-mesh model with different materials |

### Controls

| Control | Description |
|---------|-------------|
| Environment | Switch between Studio, Outdoor, Dark lighting |
| Display Mode | Toggle Shaded, Wireframe, Normals views |
| Animation Speed | Adjust playback speed (0x - 2x) |
| Model Scale | Scale model (10% - 300%) |
| Center Model | Auto-frame model in view |
| Reset View | Reset camera to default position |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `I` | Toggle inspect mode |
| `Ctrl+Shift+D` | Toggle devtool overlay |
| `W` / `E` / `R` | Transform tools (translate/rotate/scale) |
| `F` | Focus on model |

## 3Lens Integration

### Probe Setup

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe({
  appName: '3D Model Viewer',
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setThreeReference(THREE);

await probe.initializeTransformGizmo(camera, renderer.domElement);
await probe.initializeCameraController(camera, renderer.domElement);

const overlay = createOverlay(probe);
```

### Inspecting Loaded Models

When you load a model, 3Lens automatically tracks:

- **Scene Hierarchy**: Navigate the full model tree
- **Geometry Details**: Vertex/index counts, attributes, memory usage
- **Materials**: PBR properties, textures, shader code
- **Textures**: Preview, resolution, format, filtering settings
- **Animations**: Clip names, duration, playing state
- **Performance**: Draw calls, triangles, GPU memory

### Use Cases

1. **Model Validation**: Verify geometry counts and material setup
2. **Performance Analysis**: Check triangle counts and texture memory
3. **Debug Materials**: Inspect PBR properties and textures
4. **Animation Debugging**: View animation clips and playback
5. **Memory Profiling**: Track GPU memory usage

## Supported Formats

- **GLTF** (`.gltf`) - JSON-based with external assets
- **GLB** (`.glb`) - Binary GLTF with embedded assets
- **Draco Compression** - Automatic decompression support

## Tips

- Use **Wireframe** mode to visualize mesh topology
- Use **Normals** mode to debug normal mapping issues
- Check the **Model Statistics** panel for quick overview
- Open 3Lens with `Ctrl+Shift+D` for deep inspection
- Use **Inspect Mode** (`I`) to click and select objects

## Extending

You can extend this example to support:

- Additional formats (FBX, OBJ via loaders)
- Environment maps (HDR/EXR)
- Animation blending
- Morph targets
- Skinned meshes

## Troubleshooting

### Model Not Loading

- Check browser console for errors
- Verify file is valid GLTF/GLB
- Large models may take time to parse

### Missing Textures

- Ensure textures are embedded (GLB) or accessible (GLTF)
- Check network tab for 404 errors

### Performance Issues

- Enable display culling for large scenes
- Reduce shadow map resolution
- Use LOD for complex models
