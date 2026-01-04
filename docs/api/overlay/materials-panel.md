# Materials Panel

The Materials panel provides a comprehensive view of all materials in your scene, with search, inspection, and live editing capabilities.

## Overview

```typescript
// Open the Materials panel
overlay.showPanel('materials');
```

The Materials panel displays every material used in observed scenes, showing:

- **Material list** with search and filtering
- **Color swatches** and type icons
- **Usage count** per material
- **Shader preview** for custom materials
- **Live property editing**

## Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🎨 Materials                           [Search...    ] ─ □ ✕   │
├─────────────────────────────────────────────────────────────────┤
│  Summary: 45 Materials | 12 Shaders | 8 Transparent             │
├─────────────────────────────────────────────────────────────────┤
│                                │                                │
│  ■ PlayerSkin                  │  MeshStandardMaterial          │
│    StandardMaterial • 3 uses   │  ─────────────────────         │
│                                │                                │
│  ■ GroundTexture          ◀   │  Color: ■ #8B4513              │
│    StandardMaterial • 1 use    │  Metalness: 0.1                │
│    GLSL α                      │  Roughness: 0.8                │
│                                │                                │
│  ■ GlassWindow                 │  Textures:                     │
│    PhysicalMaterial • 2 uses   │  • map: ground_diffuse.png     │
│    α                           │  • normalMap: ground_norm.png  │
│                                │                                │
│  ■ CustomShader                │  Used by:                      │
│    ShaderMaterial • 1 use      │  • Ground                      │
│    GLSL                        │                                │
│                                │  [Edit] [Log] [Copy]           │
│                                │                                │
└─────────────────────────────────────────────────────────────────┘
```

## Material List

### Summary Bar

Quick statistics at a glance:

```
45 Materials | 12 Shaders | 8 Transparent
     ↑              ↑            ↑
   Total      ShaderMaterial   transparent=true
```

### List Items

Each material shows:

```
┌─────────────────────────────────────────────┐
│ ■ MaterialName                         3×   │
│   MeshStandardMaterial • Player, Enemy      │
│   [GLSL] [α] [2 tex]                        │
└─────────────────────────────────────────────┘
  ↑                                        ↑
Color swatch                          Usage count
```

**Badges:**
- `GLSL` - Custom shader material
- `α` - Transparent material
- `2 tex` - Number of textures

### Search & Filter

Type in the search box to filter by:

- Material name
- Material type
- Mesh names using the material

```typescript
// Search examples
"Player"     // Find materials named "Player*"
"Standard"   // Find MeshStandardMaterial
"Enemy"      // Find materials used by objects named "Enemy*"
```

## Material Inspector

### Basic Properties

```typescript
interface MaterialInfo {
  uuid: string;
  name: string;
  type: string;           // MeshStandardMaterial, ShaderMaterial, etc.
  visible: boolean;
  transparent: boolean;
  opacity: number;
  side: 'front' | 'back' | 'double';
  depthTest: boolean;
  depthWrite: boolean;
  blending: BlendingMode;
}
```

### Standard Material Properties

For MeshStandardMaterial and MeshPhysicalMaterial:

| Property | Type | Description |
|----------|------|-------------|
| color | Color | Base color |
| emissive | Color | Emissive color |
| metalness | number | Metalness (0-1) |
| roughness | number | Roughness (0-1) |
| envMapIntensity | number | Environment map intensity |
| clearcoat | number | Clearcoat (Physical only) |
| transmission | number | Transmission (Physical only) |

### Basic Material Properties

For MeshBasicMaterial:

| Property | Type | Description |
|----------|------|-------------|
| color | Color | Base color |
| wireframe | boolean | Wireframe mode |
| fog | boolean | Affected by fog |

### Shader Material Properties

For ShaderMaterial and RawShaderMaterial:

```
┌─────────────────────────────────────────────┐
│ ShaderMaterial                              │
├─────────────────────────────────────────────┤
│ Uniforms:                                   │
│ ├─ time: 12.45 (float)                     │
│ ├─ color: [1, 0.5, 0] (vec3)               │
│ └─ texture: [Texture] (sampler2D)          │
│                                             │
│ Vertex Shader:    [View]                    │
│ Fragment Shader:  [View]                    │
└─────────────────────────────────────────────┘
```

**Shader Preview:**

```glsl
// Click [View] to see shader code with syntax highlighting
precision highp float;

uniform float time;
uniform vec3 color;

varying vec2 vUv;

void main() {
  float wave = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
  gl_FragColor = vec4(color * wave, 1.0);
}
```

## Texture Display

Materials list their attached textures:

```
Textures:
├─ map: diffuse.png (2048×2048)
├─ normalMap: normal.png (2048×2048)
├─ roughnessMap: rough.png (1024×1024)
└─ aoMap: ao.png (1024×1024)
```

Click a texture to open it in the [Textures Panel](./textures-panel.md).

## Live Editing

### Editable Properties

Some properties can be modified in real-time:

```typescript
// Color editing
material.color = new THREE.Color(0xff0000);

// Numeric sliders
material.metalness = 0.5;
material.roughness = 0.3;
material.opacity = 0.8;

// Boolean toggles
material.wireframe = true;
material.transparent = true;
```

### Edit Mode

```
┌─────────────────────────────────────────────┐
│ Color:     [■ ═══════════════════════ ▼]   │
│ Metalness: [════════●══════════════] 0.45  │
│ Roughness: [══════════════●════════] 0.72  │
│ Wireframe: [✓]                              │
└─────────────────────────────────────────────┘
```

Changes are applied immediately to the scene.

## Usage Information

### Mesh References

See which objects use each material:

```
Used by (3 meshes):
├─ Player → Body
├─ Player → Head  
└─ Enemy01 → Body
```

Click a mesh name to select it in the Scene Explorer.

### Usage Count

Materials show their usage count:

```
12×    ← Used by 12 meshes (shared efficiently)
1×     ← Used by 1 mesh (unique material)
```

::: tip Optimization
Materials used only once may be candidates for merging or instancing.
:::

## Material Actions

### Edit

Opens full property editor with all available options.

### Log

Outputs material to browser console:

```typescript
console.log('3Lens Material:', material);
// Full THREE.Material object with all properties
```

### Copy

Copies material creation code:

```typescript
const material = new THREE.MeshStandardMaterial({
  color: 0x8b4513,
  metalness: 0.1,
  roughness: 0.8,
  map: textureLoader.load('ground_diffuse.png'),
  normalMap: textureLoader.load('ground_norm.png'),
});
```

### Select Users

Selects all meshes using this material in the scene.

## API Integration

```typescript
// Get all materials
const materials = probe.getMaterials();

// Find specific material
const playerMat = materials.find(m => m.name === 'PlayerSkin');

// Update material property via probe
probe.updateMaterialProperty(
  materialUuid,
  'roughness',
  0.5
);

// Subscribe to material changes
probe.on('materialUpdate', (material) => {
  console.log('Material updated:', material.name);
});
```

## Material Types Reference

| Type | Icon | Description |
|------|------|-------------|
| MeshBasicMaterial | 🔵 | Unlit, solid color |
| MeshLambertMaterial | 🟢 | Diffuse lighting |
| MeshPhongMaterial | 🟡 | Specular highlights |
| MeshStandardMaterial | ⭐ | PBR standard |
| MeshPhysicalMaterial | 💎 | PBR physical |
| MeshToonMaterial | 🎨 | Cel-shading |
| ShaderMaterial | 🔷 | Custom GLSL |
| RawShaderMaterial | 📝 | Raw GLSL |
| PointsMaterial | ⚪ | Point clouds |
| LineBasicMaterial | ➖ | Basic lines |
| SpriteMaterial | 🏷️ | Sprites/billboards |

## Best Practices

1. **Name your materials** - Makes identification easier
   ```typescript
   material.name = 'PlayerSkin';
   ```

2. **Share materials** - Reuse materials across meshes
   ```typescript
   const sharedMat = new THREE.MeshStandardMaterial({...});
   mesh1.material = sharedMat;
   mesh2.material = sharedMat;
   ```

3. **Use search** - Quickly find materials by name or usage

4. **Check transparency** - Transparent materials are more expensive

5. **Review shader code** - Understand custom shader complexity

## Related

- [Textures Panel](./textures-panel.md)
- [Geometry Panel](./geometries-panel.md)
- [Material Info Type](../core/material-info.md)
