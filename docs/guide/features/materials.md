---
title: Material Editing Guide
description: Live material editing capabilities including property inspection, texture management, and shader parameter adjustment
---

# Material Editing Guide

This guide covers 3Lens's live material editing capabilities, including property inspection, texture management, and real-time shader parameter adjustment.

## Table of Contents

- [Overview](#overview)
- [Material Inspector Panel](#material-inspector-panel)
- [Editing Material Properties](#editing-material-properties)
- [Texture Management](#texture-management)
- [Shader Uniforms](#shader-uniforms)
- [Material Comparison](#material-comparison)
- [Copy & Paste Materials](#copy--paste-materials)
- [Material Templates](#material-templates)
- [Performance Considerations](#performance-considerations)

---

## Overview

3Lens provides comprehensive material editing tools:

- **Live editing** - See changes instantly in the scene
- **All material types** - Standard, Physical, Toon, Shader, and custom materials
- **Texture preview** - View and swap textures easily
- **Uniform editing** - Adjust shader uniforms in real-time
- **Comparison mode** - Compare different material settings
- **History** - Undo/redo material changes

---

## Material Inspector Panel

### Accessing the Panel

1. Select an object with a material
2. Open the **Material** tab in the inspector
3. Or right-click an object and choose "Inspect Material"

### Panel Layout

```
┌────────────────────────────────────┐
│ 🎨 Material: PhysicalMaterial      │
├────────────────────────────────────┤
│ Type: MeshStandardMaterial         │
│ UUID: abc123...                    │
├────────────────────────────────────┤
│ ▼ Base Properties                  │
│   Color: [■] #ff6b6b               │
│   Opacity: ━━━━━━━● 1.0            │
│   Transparent: [ ]                 │
│   Side: FrontSide ▼                │
├────────────────────────────────────┤
│ ▼ PBR Properties                   │
│   Metalness: ━━━━●━━━ 0.5          │
│   Roughness: ━━●━━━━━ 0.3          │
│   Reflectivity: ━━━━━●━━ 0.7       │
├────────────────────────────────────┤
│ ▼ Maps                             │
│   Diffuse: [texture.jpg] 🔍        │
│   Normal: [normal.png] 🔍          │
│   Roughness: [none] +              │
│   Metalness: [none] +              │
│   AO: [ao.png] 🔍                  │
├────────────────────────────────────┤
│ ▼ Advanced                         │
│   [Edit Shader] [Export] [Reset]   │
└────────────────────────────────────┘
```

---

## Editing Material Properties

### Basic Properties

All materials share these common properties:

```typescript
// Available in inspector or programmatically
material.visible = true;
material.opacity = 1.0;
material.transparent = false;
material.side = THREE.FrontSide; // FrontSide, BackSide, DoubleSide
material.depthTest = true;
material.depthWrite = true;
material.blending = THREE.NormalBlending;
```

### Color Properties

Click any color swatch to open the color picker:

- **Color** - Base diffuse color
- **Emissive** - Self-illumination color
- **Specular** - Highlight color (Phong materials)

```typescript
// Programmatic color editing
probe.setMaterialProperty(material, 'color', new THREE.Color('#ff6b6b'));
probe.setMaterialProperty(material, 'emissive', new THREE.Color(0x222222));
```

### PBR Properties (StandardMaterial/PhysicalMaterial)

Physical materials expose these additional properties:

| Property | Range | Description |
|----------|-------|-------------|
| Metalness | 0-1 | How metallic the surface is |
| Roughness | 0-1 | Surface micro-roughness |
| Reflectivity | 0-1 | Fresnel reflectance at normal incidence |
| Clearcoat | 0-1 | Clear coat layer intensity |
| Clearcoat Roughness | 0-1 | Clear coat roughness |
| Sheen | 0-1 | Sheen layer intensity |
| Transmission | 0-1 | Transparency for glass-like materials |
| IOR | 1.0-2.5 | Index of refraction |

### Real-Time Editing

All changes apply immediately to the scene:

```typescript
// Edit through 3Lens
probe.editMaterial(mesh.material, {
  metalness: 0.8,
  roughness: 0.2,
  color: new THREE.Color('gold'),
});

// Or directly on the material
mesh.material.metalness = 0.8;
mesh.material.needsUpdate = true;

// Notify 3Lens
probe.notifyMaterialChanged(mesh.material);
```

---

## Texture Management

### Viewing Textures

Click the 🔍 icon next to any texture slot:

```
┌─────────────────────────────────┐
│ Texture Preview                 │
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │                           │   │
│ │      [texture image]      │   │
│ │                           │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ Size: 2048x2048                 │
│ Format: RGBA                    │
│ Filtering: LinearMipMapLinear   │
│ Wrap: RepeatWrapping            │
│ Anisotropy: 16                  │
│                                 │
│ Memory: 16.0 MB                 │
└─────────────────────────────────┘
```

### Texture Slots

Common texture slots for PBR materials:

| Slot | Purpose |
|------|---------|
| map | Diffuse/albedo color |
| normalMap | Surface normal details |
| roughnessMap | Per-pixel roughness |
| metalnessMap | Per-pixel metalness |
| aoMap | Ambient occlusion |
| emissiveMap | Emission areas |
| displacementMap | Vertex displacement |
| alphaMap | Transparency |
| envMap | Environment reflections |

### Swapping Textures

```typescript
// Load and assign a new texture
const loader = new THREE.TextureLoader();
const newTexture = await loader.loadAsync('/path/to/texture.jpg');

probe.setMaterialTexture(material, 'map', newTexture);
```

### Texture Properties

Edit texture settings in the expanded view:

```typescript
// Wrapping
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

// Repeat/offset
texture.repeat.set(2, 2);
texture.offset.set(0.5, 0);

// Filtering
texture.minFilter = THREE.LinearMipMapLinearFilter;
texture.magFilter = THREE.LinearFilter;

// Anisotropic filtering
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Notify update
texture.needsUpdate = true;
probe.notifyTextureChanged(texture);
```

---

## Shader Uniforms

### ShaderMaterial Editing

For custom ShaderMaterial, 3Lens exposes uniforms:

```
┌────────────────────────────────────┐
│ 🎨 Material: CustomShader          │
├────────────────────────────────────┤
│ Type: ShaderMaterial               │
├────────────────────────────────────┤
│ ▼ Uniforms                         │
│   uTime: ━━━━●━━━━ 2.5             │
│   uColor: [■] #4ecdc4              │
│   uIntensity: ━━━━━●━━ 0.8         │
│   uTexture: [noise.png] 🔍         │
│   uResolution: [1920, 1080]        │
├────────────────────────────────────┤
│ ▼ Vertex Shader                    │
│   [View] [Edit]                    │
│ ▼ Fragment Shader                  │
│   [View] [Edit]                    │
└────────────────────────────────────┘
```

### Editing Uniforms

```typescript
// Edit uniform through 3Lens
probe.setUniform(material, 'uIntensity', 0.8);
probe.setUniform(material, 'uColor', new THREE.Color('#4ecdc4'));

// Edit uniform directly
material.uniforms.uIntensity.value = 0.8;
material.uniforms.uColor.value = new THREE.Color('#4ecdc4');

// No needsUpdate required for uniforms
```

### Supported Uniform Types

3Lens auto-detects and provides appropriate editors:

| Type | Editor |
|------|--------|
| `float` | Slider or number input |
| `int` | Number input |
| `bool` | Checkbox |
| `vec2` | X, Y inputs |
| `vec3` | X, Y, Z inputs or color picker |
| `vec4` | X, Y, Z, W inputs or color+alpha |
| `mat3/mat4` | Matrix editor |
| `sampler2D` | Texture picker |

---

## Material Comparison

### Side-by-Side Mode

Compare two materials to see differences:

1. Right-click a material → "Compare Material"
2. Select another object with a material
3. View differences highlighted

```
┌──────────────────┬──────────────────┐
│ Material A       │ Material B       │
├──────────────────┼──────────────────┤
│ Color: #ff6b6b   │ Color: #4ecdc4   │ ← Different
│ Metalness: 0.5   │ Metalness: 0.5   │
│ Roughness: 0.3   │ Roughness: 0.8   │ ← Different
│ Map: brick.jpg   │ Map: stone.jpg   │ ← Different
└──────────────────┴──────────────────┘
```

### A/B Toggle

Toggle between two material states:

```typescript
// Save current state as A
probe.saveMaterialState(material, 'A');

// Make changes...
material.roughness = 0.9;
material.metalness = 0.1;

// Save as B
probe.saveMaterialState(material, 'B');

// Toggle between states
probe.toggleMaterialState(material); // A → B → A → ...
```

---

## Copy & Paste Materials

### Copy Material

Right-click a material → "Copy Material" or `Ctrl+C` when material is selected:

```typescript
// Programmatically copy material settings
const settings = probe.copyMaterialSettings(material);
// Returns JSON-serializable object
```

### Paste Material

Apply copied settings to another material:

1. Select target object(s)
2. Right-click → "Paste Material" or `Ctrl+V`

```typescript
// Paste to single material
probe.pasteMaterialSettings(targetMaterial, settings);

// Paste to multiple materials
const meshes = [mesh1, mesh2, mesh3];
meshes.forEach(mesh => {
  probe.pasteMaterialSettings(mesh.material, settings);
});
```

### Selective Paste

Paste only specific properties:

```typescript
probe.pasteMaterialSettings(targetMaterial, settings, {
  include: ['color', 'metalness', 'roughness'],
  // or
  exclude: ['map', 'normalMap'], // Keep existing textures
});
```

---

## Material Templates

### Built-in Templates

Quick-start with common material presets:

```
┌────────────────────────────────────┐
│ Material Templates                  │
├────────────────────────────────────┤
│ 🪨 Stone                           │
│ 🪵 Wood                            │
│ 🔩 Metal (Polished)                │
│ 🔩 Metal (Brushed)                 │
│ 🧊 Glass                           │
│ 🌊 Water                           │
│ 🧱 Brick                           │
│ 💎 Crystal                         │
│ 🎨 Plastic                         │
│ 📦 Cardboard                       │
└────────────────────────────────────┘
```

### Apply Template

```typescript
// Apply built-in template
probe.applyMaterialTemplate(material, 'polished-metal');

// Template applies:
// - metalness: 1.0
// - roughness: 0.1
// - color: #c0c0c0
// - envMapIntensity: 1.0
```

### Create Custom Template

```typescript
// Save current material as template
probe.saveMaterialTemplate('my-custom-metal', material, {
  description: 'Weathered bronze appearance',
  category: 'Metal',
});

// List custom templates
const templates = probe.getMaterialTemplates({ includeCustom: true });
```

---

## Performance Considerations

### Material Optimization Tips

The inspector shows performance hints:

```
┌────────────────────────────────────┐
│ ⚠️ Performance Hints               │
├────────────────────────────────────┤
│ • 4K textures detected - consider  │
│   using 2K for mobile              │
│ • Transparency enabled - may       │
│   affect draw order                │
│ • No normal map - consider adding  │
│   for detail without geometry      │
└────────────────────────────────────┘
```

### Batch Material Editing

Edit multiple materials at once:

```typescript
// Select multiple meshes
const meshes = [mesh1, mesh2, mesh3];
meshes.forEach(m => probe.addToSelection(m));

// Edit all selected materials
probe.batchEditMaterials({
  roughness: 0.5,
  metalness: 0.3,
});
```

### Material Sharing

Identify and merge duplicate materials:

```typescript
// Find duplicate materials
const duplicates = probe.findDuplicateMaterials();
// Returns groups of materials with identical settings

// Merge duplicates (share single material)
probe.mergeDuplicateMaterials(duplicates[0]);
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `M` | Open material editor for selection |
| `Ctrl+C` | Copy material settings |
| `Ctrl+V` | Paste material settings |
| `Ctrl+Z` | Undo material change |
| `Ctrl+Shift+Z` | Redo material change |
| `R` | Reset material to defaults |

---

## Framework Integration

### React

```tsx
import { useThreeLensProbe, useSelectedObject } from '@3lens/react-bridge';
import { useMemo } from 'react';

function MaterialEditor() {
  const probe = useThreeLensProbe();
  const { selectedNode } = useSelectedObject();
  
  const material = useMemo(() => {
    return selectedNode?.object?.material;
  }, [selectedNode]);
  
  if (!material) return null;
  
  return (
    <div className="material-editor">
      <h3>Material: {material.name || 'Unnamed'}</h3>
      
      <label>
        Metalness
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={material.metalness ?? 0}
          onChange={(e) => {
            probe.setMaterialProperty(material, 'metalness', parseFloat(e.target.value));
          }}
        />
      </label>
      
      <label>
        Roughness
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={material.roughness ?? 0.5}
          onChange={(e) => {
            probe.setMaterialProperty(material, 'roughness', parseFloat(e.target.value));
          }}
        />
      </label>
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { useThreeLens, useSelectedObject } from '@3lens/vue-bridge';
import { computed, ref } from 'vue';

const { probe } = useThreeLens();
const { selectedNode } = useSelectedObject();

const material = computed(() => selectedNode.value?.object?.material);

function updateProperty(prop, value) {
  if (material.value && probe.value) {
    probe.value.setMaterialProperty(material.value, prop, value);
  }
}
</script>

<template>
  <div v-if="material" class="material-editor">
    <h3>Material: {{ material.name || 'Unnamed' }}</h3>
    
    <label>
      Metalness
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="material.metalness ?? 0"
        @input="updateProperty('metalness', parseFloat($event.target.value))"
      />
    </label>
    
    <label>
      Roughness
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="material.roughness ?? 0.5"
        @input="updateProperty('roughness', parseFloat($event.target.value))"
      />
    </label>
  </div>
</template>
```

---

## Troubleshooting

### Changes Not Visible

1. Ensure `material.needsUpdate = true` after direct edits
2. Check if material is being overwritten in render loop
3. Verify the correct mesh is selected

### Texture Not Loading

1. Check texture path (relative vs absolute)
2. Verify CORS settings for cross-origin textures
3. Check console for loading errors

### Performance After Editing

1. Large textures affect memory and rendering
2. Transparent materials require special sorting
3. Too many unique materials prevent batching

---

## Related Guides

- [Scene Inspection Guide](./SCENE-INSPECTION-GUIDE.md)
- [Shader Debugging Guide](./SHADER-DEBUGGING-GUIDE.md)
- [Performance Debugging Guide](./PERFORMANCE-DEBUGGING-GUIDE.md)

## API Reference

- [Material API](/api/core/material-api)
- [Texture Management](/api/core/texture-management)
