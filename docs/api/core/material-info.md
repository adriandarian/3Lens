# MaterialData Interface

The `MaterialData` interface represents serialized material information for display in the devtools UI. It contains all relevant properties, textures, and shader information for a Three.js material.

## Overview

```typescript
import type { MaterialData, MaterialsSummary } from '@3lens/core';

// Access materials from a snapshot
const snapshot = probe.getSceneSnapshot();

snapshot.materials?.forEach((material: MaterialData) => {
  console.log(`${material.name}: ${material.type}`);
  console.log(`  Textures: ${material.textures.length}`);
  console.log(`  Used by: ${material.usageCount} meshes`);
});
```

## Interface Definition

```typescript
interface MaterialData {
  // Identity
  uuid: string;
  name: string;
  type: string;
  isShaderMaterial: boolean;
  
  // Appearance
  color?: number;
  emissive?: number;
  opacity: number;
  transparent: boolean;
  visible: boolean;
  wireframe: boolean;
  
  // Rendering
  side: number;
  depthTest: boolean;
  depthWrite: boolean;
  
  // PBR properties
  pbr?: PBRProperties;
  
  // Textures
  textures: MaterialTextureRef[];
  
  // Shader info
  shader?: ShaderInfo;
  
  // Usage
  usageCount: number;
  usedByMeshes: string[];
}
```

## Properties

### Identity

| Property | Type | Description |
|----------|------|-------------|
| `uuid` | `string` | Material UUID from Three.js |
| `name` | `string` | Material name |
| `type` | `string` | Material type (e.g., `'MeshStandardMaterial'`) |
| `isShaderMaterial` | `boolean` | Whether this is a custom shader material |

### Appearance

| Property | Type | Description |
|----------|------|-------------|
| `color` | `number?` | Base color (hex value) |
| `emissive` | `number?` | Emissive color (hex value) |
| `opacity` | `number` | Opacity (0-1) |
| `transparent` | `boolean` | Whether transparency is enabled |
| `visible` | `boolean` | Whether material is visible |
| `wireframe` | `boolean` | Wireframe rendering mode |

### Rendering

| Property | Type | Description |
|----------|------|-------------|
| `side` | `number` | Face side: 0=Front, 1=Back, 2=Double |
| `depthTest` | `boolean` | Depth testing enabled |
| `depthWrite` | `boolean` | Depth writing enabled |

### PBR Properties

For `MeshStandardMaterial` and `MeshPhysicalMaterial`:

```typescript
interface PBRProperties {
  roughness: number;           // 0-1
  metalness: number;           // 0-1
  reflectivity?: number;       // 0-1
  clearcoat?: number;          // 0-1 (Physical only)
  clearcoatRoughness?: number; // 0-1 (Physical only)
  sheen?: number;              // 0-1 (Physical only)
  sheenRoughness?: number;     // 0-1 (Physical only)
  transmission?: number;       // 0-1 (Physical only)
  thickness?: number;          // (Physical only)
  ior?: number;                // Index of refraction (Physical only)
}
```

### Textures

```typescript
interface MaterialTextureRef {
  slot: string;      // e.g., 'map', 'normalMap', 'roughnessMap'
  uuid: string;      // Texture UUID
  name?: string;     // Texture name
}
```

Common texture slots:
- `map` - Diffuse/albedo map
- `normalMap` - Normal map
- `roughnessMap` - Roughness map
- `metalnessMap` - Metalness map
- `aoMap` - Ambient occlusion map
- `emissiveMap` - Emissive map
- `envMap` - Environment map
- `displacementMap` - Displacement map
- `alphaMap` - Alpha/opacity map
- `bumpMap` - Bump map
- `lightMap` - Lightmap

### Shader Info

For `ShaderMaterial` and `RawShaderMaterial`:

```typescript
interface ShaderInfo {
  vertexShader: string;
  fragmentShader: string;
  uniforms: UniformData[];
  defines: Record<string, string | number | boolean>;
}

interface UniformData {
  name: string;
  type: 'float' | 'int' | 'vec2' | 'vec3' | 'vec4' | 'mat3' | 'mat4' | 'sampler2D' | 'samplerCube' | 'struct' | 'unknown';
  value: unknown;
}
```

### Usage

| Property | Type | Description |
|----------|------|-------------|
| `usageCount` | `number` | Number of meshes using this material |
| `usedByMeshes` | `string[]` | Debug IDs of meshes using this material |

## MaterialsSummary

Summary statistics for all materials:

```typescript
interface MaterialsSummary {
  totalCount: number;                    // Total unique materials
  byType: Record<string, number>;        // Count by material type
  shaderMaterialCount: number;           // Custom shader materials
  transparentCount: number;              // Transparent materials
}
```

## Usage Examples

### List All Materials

```typescript
function listMaterials(snapshot: SceneSnapshot) {
  console.log(`=== Materials (${snapshot.materialsSummary?.totalCount ?? 0}) ===`);
  
  snapshot.materials?.forEach(mat => {
    const color = mat.color !== undefined 
      ? `#${mat.color.toString(16).padStart(6, '0')}` 
      : 'N/A';
    
    console.log(`${mat.name || '(unnamed)'}`);
    console.log(`  Type: ${mat.type}`);
    console.log(`  Color: ${color}`);
    console.log(`  Opacity: ${mat.opacity}`);
    console.log(`  Textures: ${mat.textures.length}`);
    console.log(`  Used by: ${mat.usageCount} mesh(es)`);
  });
}
```

### Find Expensive Materials

```typescript
function findExpensiveMaterials(snapshot: SceneSnapshot) {
  const expensive = snapshot.materials?.filter(mat => {
    // Materials with many textures
    if (mat.textures.length > 5) return true;
    
    // Transparent materials (require separate pass)
    if (mat.transparent) return true;
    
    // Custom shaders
    if (mat.isShaderMaterial) return true;
    
    // Double-sided materials
    if (mat.side === 2) return true;
    
    return false;
  }) ?? [];
  
  console.log(`Found ${expensive.length} expensive materials:`);
  expensive.forEach(mat => {
    const reasons: string[] = [];
    if (mat.textures.length > 5) reasons.push(`${mat.textures.length} textures`);
    if (mat.transparent) reasons.push('transparent');
    if (mat.isShaderMaterial) reasons.push('custom shader');
    if (mat.side === 2) reasons.push('double-sided');
    
    console.log(`  ${mat.name}: ${reasons.join(', ')}`);
  });
}
```

### Texture Slot Analysis

```typescript
function analyzeTextureUsage(snapshot: SceneSnapshot) {
  const slotCounts: Record<string, number> = {};
  
  snapshot.materials?.forEach(mat => {
    mat.textures.forEach(tex => {
      slotCounts[tex.slot] = (slotCounts[tex.slot] ?? 0) + 1;
    });
  });
  
  console.log('Texture slot usage:');
  Object.entries(slotCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([slot, count]) => {
      console.log(`  ${slot}: ${count}`);
    });
}
```

### Material Type Breakdown

```typescript
function printMaterialBreakdown(summary: MaterialsSummary) {
  console.log(`Total Materials: ${summary.totalCount}`);
  console.log(`Shader Materials: ${summary.shaderMaterialCount}`);
  console.log(`Transparent: ${summary.transparentCount}`);
  
  console.log('\nBy Type:');
  Object.entries(summary.byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percentage = ((count / summary.totalCount) * 100).toFixed(1);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });
}
```

### Inspect Shader Material

```typescript
function inspectShader(material: MaterialData) {
  if (!material.shader) {
    console.log('Not a shader material');
    return;
  }
  
  console.log(`=== Shader: ${material.name} ===`);
  
  // Uniforms
  console.log('\nUniforms:');
  material.shader.uniforms.forEach(u => {
    console.log(`  ${u.type} ${u.name} = ${JSON.stringify(u.value)}`);
  });
  
  // Defines
  console.log('\nDefines:');
  Object.entries(material.shader.defines).forEach(([key, value]) => {
    console.log(`  #define ${key} ${value}`);
  });
  
  // Shader preview
  console.log('\nVertex Shader (first 500 chars):');
  console.log(material.shader.vertexShader.slice(0, 500));
  
  console.log('\nFragment Shader (first 500 chars):');
  console.log(material.shader.fragmentShader.slice(0, 500));
}
```

### Find Unused Materials

```typescript
function findUnusedMaterials(snapshot: SceneSnapshot) {
  const unused = snapshot.materials?.filter(mat => mat.usageCount === 0) ?? [];
  
  if (unused.length > 0) {
    console.warn(`Found ${unused.length} unused materials:`);
    unused.forEach(mat => {
      console.log(`  ${mat.name || mat.uuid} (${mat.type})`);
    });
    console.log('Consider removing these to free memory.');
  }
}
```

## See Also

- [TextureData](./texture-info.md) - Texture information
- [SceneSnapshot](./scene-snapshot.md) - Full scene snapshot
- [ObjectCostData](./scene-snapshot.md#objectcostdata) - Material complexity scoring
