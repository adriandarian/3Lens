# Shadow Technique Comparison Example

Interactive demonstration comparing different shadow mapping techniques in Three.js with 3Lens devtool integration.

![Shadow Comparison](https://img.shields.io/badge/3Lens-Shadow_Comparison-8b5cf6)
![Three.js](https://img.shields.io/badge/Three.js-0.160.0-black)
![WebGL](https://img.shields.io/badge/WebGL-2.0-brightgreen)

## Overview

This example provides a comprehensive comparison of Four shadow mapping techniques:

| Technique | Quality | Performance | Use Case |
|-----------|---------|-------------|----------|
| **Basic** | Low | Excellent | Mobile, VR |
| **PCF** | Medium | Good | General 3D |
| **PCSS** | High | Poor | Film, AAA |
| **VSM** | Medium-High | Medium | Area lights |

## Features

### Shadow Techniques

- **Basic Shadow Maps** - Standard depth-based shadows with hard edges
- **PCF (Percentage-Closer Filtering)** - Multi-sample filtering for soft edges
- **PCSS (Percentage-Closer Soft Shadows)** - Contact-hardening realistic shadows
- **VSM (Variance Shadow Mapping)** - Hardware-filterable smooth shadows

### Interactive Controls

- **Resolution Slider** - Adjust shadow map resolution (256-2048)
- **Bias Controls** - Fine-tune depth and normal bias
- **Blur Radius** - Control softness (VSM mode)
- **Light Rotation** - Auto-rotate main light
- **Frustum Visualization** - View shadow camera frustums

### Visual Analysis

- Shadow map preview grid for all light sources
- Quality/Performance/Memory comparison bars
- Artifact detection and severity indicators
- Technique-specific recommendations

## Running the Example

```bash
# From the repository root
pnpm install
pnpm --filter shadow-comparison dev
```

Open [http://localhost:3030](http://localhost:3030) in your browser.

## Scene Setup

The example includes a carefully crafted scene for shadow testing:

- **Ground plane** - Large receiving surface
- **Central sphere** - Main shadow caster with reflective material
- **Surrounding objects** - Various geometries (box, cone, torus, etc.)
- **Thin occluders** - Test light bleeding and bias issues
- **Floating objects** - Test contact shadow accuracy

### Light Configuration

| Light | Type | Shadow Map | Purpose |
|-------|------|------------|---------|
| Main | Directional | 1024px | Primary shadows |
| Spot 1 | Spot (Red) | 512px | Secondary shadows |
| Spot 2 | Spot (Blue) | 512px | Cross shadows |
| Point | Point | 256px | Omnidirectional |

## Shadow Artifacts

### Shadow Acne
Self-shadowing artifacts from depth precision issues. Mitigate with proper bias settings.

### Aliasing
Jagged shadow edges from insufficient resolution. Increase map size or use PCF/PCSS.

### Peter Panning
Shadows detached from objects due to excessive bias. Balance bias carefully.

### Light Bleeding (VSM)
Light leaking through thin occluders. Use light bleeding reduction techniques.

## 3Lens Integration

The example registers entities with 3Lens for debugging:

```typescript
// Shadow system entity
probe.registerLogicalEntity({
  id: 'shadow-system',
  name: 'Shadow Mapping System',
  type: 'lighting',
  metadata: {
    shadowType: currentShadowType,
    mapResolution: shadowMapResolution,
    shadowLights: shadowLights.length,
  }
});

// Individual light entities
shadowLights.forEach((light, i) => {
  probe.registerLogicalEntity({
    id: `shadow-light-${i}`,
    name: `${type} Light ${i}`,
    type: 'shadow-caster',
    object3D: light,
    metadata: { ... }
  });
});
```

## Performance Guidelines

### Mobile / VR
- Use Basic shadows
- Resolution: 512px max
- Single shadow light

### Desktop / Web
- Use PCF shadows
- Resolution: 1024px
- 2-3 shadow lights

### High-End / Film
- Use PCSS shadows
- Resolution: 2048px
- Multiple lights

## Technical Implementation

### Shadow Map Types in Three.js

```typescript
// Basic - single sample, hard edges
renderer.shadowMap.type = THREE.BasicShadowMap;

// PCF - multiple samples, soft edges
renderer.shadowMap.type = THREE.PCFShadowMap;

// PCSS - contact hardening
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// VSM - variance-based
renderer.shadowMap.type = THREE.VSMShadowMap;
```

### Bias Configuration

```typescript
light.shadow.bias = 0.0005;       // Depth bias
light.shadow.normalBias = 0.02;   // Normal-based bias
light.shadow.radius = 1;          // Blur radius (VSM)
```

## Files

```
shadow-comparison/
├── src/
│   └── main.ts          # Main implementation
├── index.html           # UI layout
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
└── README.md            # This file
```

## Related Examples

- [Environment Mapping](../environment-mapping/) - IBL and reflections
- [Custom Render Pipeline](../custom-render-pipeline/) - Multi-pass rendering
- [Post Processing](../../real-world-scenarios/post-processing/) - Shadow post effects

## Resources

- [Three.js Shadow Documentation](https://threejs.org/docs/#api/en/lights/shadows/LightShadow)
- [GPU Gems: Shadow Map Antialiasing](https://developer.nvidia.com/gpugems/gpugems/part-ii-lighting-and-shadows)
- [Real-Time Rendering: Shadows](https://www.realtimerendering.com/)
