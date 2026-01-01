# Environment Mapping Debug Example

Interactive demonstration of environment mapping and Image-Based Lighting (IBL) debugging with 3Lens integration.

![Environment Mapping](https://img.shields.io/badge/3Lens-Environment_Mapping-8b5cf6)
![Three.js](https://img.shields.io/badge/Three.js-0.160.0-black)
![IBL](https://img.shields.io/badge/IBL-PMREM-blue)

## Overview

This example demonstrates environment mapping techniques used for realistic reflections and lighting in Three.js applications.

| Feature | Description |
|---------|-------------|
| **HDR/EXR** | High Dynamic Range environment maps |
| **Cubemap** | Six-face cube texture mapping |
| **Equirectangular** | 360° panoramic environment |
| **Procedural** | Runtime-generated sky |

## Features

### Environment Types

- **HDR Environment** - Procedural HDR sky with sun, gradient, and ground
- **Cubemap** - Six-face cubemap with per-face color coding
- **Equirectangular** - Spherical projection environment
- **Procedural Sky** - Simple gradient sky generator

### Debug Visualization Modes

| Mode | Purpose |
|------|---------|
| **Normal** | Standard PBR rendering |
| **Diffuse** | Isolate diffuse IBL contribution |
| **Specular** | Isolate specular reflections |
| **Fresnel** | Visualize Fresnel effect |
| **Mip Level** | Explore roughness-based mip selection |
| **UV Debug** | Wireframe UV visualization |

### Material Presets

- **Chrome** - Perfect mirror reflection (roughness: 0, metalness: 1)
- **Gold** - Metallic with slight roughness (roughness: 0.2, metalness: 1)
- **Plastic** - Dielectric with diffuse color (roughness: 0.4, metalness: 0)
- **Glass** - Transmissive material (transmission: 1, IOR: 1.5)

### Interactive Controls

- Environment intensity adjustment
- Environment rotation
- Background blur control
- Auto-rotation toggle
- Background visibility toggle

## Running the Example

```bash
# From the repository root
pnpm install
pnpm --filter environment-mapping dev
```

Open [http://localhost:3031](http://localhost:3031) in your browser.

## Scene Setup

The example scene includes:

- **Main Sphere** - Large reflective sphere with switchable materials
- **Roughness Ring** - 5 spheres with roughness values 0.0 to 1.0
- **Torus Knot** - Complex geometry for reflection testing
- **Reflective Box** - Edge cases for cube reflections
- **Ground Plane** - Shadow and reflection receiver

## Technical Implementation

### PMREM Generation

Three.js uses Prefiltered Mipmap Radiance Environment Maps (PMREM) for IBL:

```typescript
// Create PMREM generator
pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Process environment map
const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

// Apply to scene
scene.environment = envMap;
scene.background = envMap;
```

### Material Setup

```typescript
const material = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.0,      // Sharp reflections
  metalness: 1.0,      // Full metallic
  envMapIntensity: 1.0,
  ior: 1.5,            // Index of refraction
  transmission: 0,     // Transparency
});
```

### Environment Map Types

| Type | Mapping | Use Case |
|------|---------|----------|
| HDR | EquirectangularReflectionMapping | Photo-realistic lighting |
| Cubemap | CubeReflectionMapping | Traditional skybox |
| PMREM | PMREMTexture | Pre-filtered for PBR |

## IBL Concepts

### Diffuse Irradiance

Pre-computed diffuse lighting from all directions. Stored in low-resolution irradiance map.

### Specular Reflections

Mip-mapped environment for varying roughness. Lower mips = blurrier reflections.

### Fresnel Effect

Increased reflectivity at grazing angles:
- **Direct view** - See through/diffuse color
- **Grazing angle** - Strong reflection

## Memory Considerations

| Component | Size | Notes |
|-----------|------|-------|
| Cubemap | ~24 MB | 6 × 1024² × RGBA16F |
| Irradiance | ~0.1 MB | 6 × 32² × RGBA16F |
| Prefiltered | ~8 MB | Full mip chain |
| **Total** | **~32 MB** | Per environment |

### Optimization Tips

1. Use compressed formats (KTX2/Basis)
2. Reduce resolution for mobile (512px)
3. Share environment maps between scenes
4. Dispose unused textures

## 3Lens Integration

```typescript
probe.registerLogicalEntity({
  id: 'env-mapping-system',
  name: 'Environment Mapping System',
  type: 'environment',
  metadata: {
    envType: 'hdr',
    resolution: 1024,
    format: 'RGBA16F',
  }
});

// Register reflective objects
probe.registerLogicalEntity({
  id: 'reflective-sphere',
  name: 'Chrome Sphere',
  type: 'reflective-surface',
  object3D: sphere,
  metadata: {
    roughness: 0,
    metalness: 1,
    envMapIntensity: 1.0,
  }
});
```

## Files

```
environment-mapping/
├── src/
│   └── main.ts          # Main implementation
├── index.html           # UI layout
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config (port 3031)
└── README.md            # This file
```

## Related Examples

- [Shadow Comparison](../shadow-comparison/) - Shadow mapping techniques
- [Custom Render Pipeline](../custom-render-pipeline/) - Multi-pass rendering
- [Post Processing](../../real-world-scenarios/post-processing/) - Effects pipeline

## Resources

- [Three.js PMREMGenerator](https://threejs.org/docs/#api/en/extras/PMREMGenerator)
- [Learn OpenGL - IBL](https://learnopengl.com/PBR/IBL/Diffuse-irradiance)
- [GPU Gems - Environment Mapping](https://developer.nvidia.com/gpugems/gpugems/part-ii-lighting-and-shadows)
- [Filament PBR Documentation](https://google.github.io/filament/Filament.html)
