# TextureData Interface

The `TextureData` interface represents serialized texture information for display in the devtools UI. It includes dimensions, format, memory usage, filtering settings, and material usage references.

## Overview

```typescript
import type { TextureData, TexturesSummary } from '@3lens/core';

// Access textures from a snapshot
const snapshot = probe.getSceneSnapshot();

snapshot.textures?.forEach((texture: TextureData) => {
  console.log(`${texture.name}: ${texture.type}`);
  console.log(`  Size: ${texture.dimensions.width}x${texture.dimensions.height}`);
  console.log(`  Format: ${texture.formatName}`);
  console.log(`  Memory: ${(texture.memoryBytes / 1024 / 1024).toFixed(2)} MB`);
});
```

## Interface Definition

```typescript
interface TextureData {
  // Identity
  uuid: string;
  name: string;
  type: string;
  
  // Source
  source: TextureSourceInfo;
  
  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };
  
  // Format
  format: number;
  formatName: string;
  dataType: number;
  dataTypeName: string;
  
  // Mipmaps
  mipmaps: {
    enabled: boolean;
    count: number;
    generateMipmaps: boolean;
  };
  
  // Wrapping
  wrap: {
    s: number;
    t: number;
    sName: string;
    tName: string;
  };
  
  // Filtering
  filtering: {
    mag: number;
    min: number;
    magName: string;
    minName: string;
  };
  
  // Settings
  anisotropy: number;
  colorSpace: string;
  flipY: boolean;
  premultiplyAlpha: boolean;
  encoding?: number;
  
  // Memory
  memoryBytes: number;
  
  // Compression
  isCompressed: boolean;
  compressionFormat?: string;
  
  // Type flags
  isRenderTarget: boolean;
  isCubeTexture: boolean;
  isDataTexture: boolean;
  isVideoTexture: boolean;
  isCanvasTexture: boolean;
  
  // Preview
  thumbnail?: string;
  
  // Usage
  usedByMaterials: TextureMaterialUsage[];
  usageCount: number;
}
```

## Properties

### Identity

| Property | Type | Description |
|----------|------|-------------|
| `uuid` | `string` | Texture UUID from Three.js |
| `name` | `string` | Texture name |
| `type` | `string` | Texture type (e.g., `'Texture'`, `'CubeTexture'`) |

### Source Information

```typescript
interface TextureSourceInfo {
  type: 'image' | 'canvas' | 'video' | 'data' | 'compressed' | 'unknown';
  url?: string;      // Source URL (if loaded from URL)
  isLoaded: boolean; // Whether texture has loaded
  isReady: boolean;  // Whether source is ready
}
```

### Dimensions

| Property | Type | Description |
|----------|------|-------------|
| `dimensions.width` | `number` | Texture width in pixels |
| `dimensions.height` | `number` | Texture height in pixels |

### Format

| Property | Type | Description |
|----------|------|-------------|
| `format` | `number` | Three.js format constant |
| `formatName` | `string` | Human-readable format (e.g., `'RGBA'`) |
| `dataType` | `number` | Three.js data type constant |
| `dataTypeName` | `string` | Human-readable type (e.g., `'UnsignedByte'`) |

### Mipmaps

| Property | Type | Description |
|----------|------|-------------|
| `mipmaps.enabled` | `boolean` | Whether mipmaps are used |
| `mipmaps.count` | `number` | Number of mipmap levels |
| `mipmaps.generateMipmaps` | `boolean` | Auto-generate mipmaps |

### Wrapping

| Property | Type | Description |
|----------|------|-------------|
| `wrap.s` | `number` | S (horizontal) wrap mode constant |
| `wrap.sName` | `string` | e.g., `'RepeatWrapping'`, `'ClampToEdgeWrapping'` |
| `wrap.t` | `number` | T (vertical) wrap mode constant |
| `wrap.tName` | `string` | e.g., `'RepeatWrapping'`, `'MirroredRepeatWrapping'` |

### Filtering

| Property | Type | Description |
|----------|------|-------------|
| `filtering.mag` | `number` | Magnification filter constant |
| `filtering.magName` | `string` | e.g., `'LinearFilter'`, `'NearestFilter'` |
| `filtering.min` | `number` | Minification filter constant |
| `filtering.minName` | `string` | e.g., `'LinearMipmapLinearFilter'` |

### Settings

| Property | Type | Description |
|----------|------|-------------|
| `anisotropy` | `number` | Anisotropic filtering level |
| `colorSpace` | `string` | Color space (e.g., `'srgb'`, `'srgb-linear'`) |
| `flipY` | `boolean` | Flip Y on upload |
| `premultiplyAlpha` | `boolean` | Premultiply alpha values |

### Memory & Compression

| Property | Type | Description |
|----------|------|-------------|
| `memoryBytes` | `number` | Estimated GPU memory usage |
| `isCompressed` | `boolean` | Whether using GPU compression |
| `compressionFormat` | `string?` | Compression format name |

### Type Flags

| Property | Type | Description |
|----------|------|-------------|
| `isRenderTarget` | `boolean` | Is a render target texture |
| `isCubeTexture` | `boolean` | Is a cube texture |
| `isDataTexture` | `boolean` | Is a data texture |
| `isVideoTexture` | `boolean` | Is a video texture |
| `isCanvasTexture` | `boolean` | Is a canvas texture |

### Preview

| Property | Type | Description |
|----------|------|-------------|
| `thumbnail` | `string?` | Base64 data URL preview (small) |

### Usage

```typescript
interface TextureMaterialUsage {
  materialUuid: string;   // Material UUID
  materialName: string;   // Material name
  slot: string;           // e.g., 'map', 'normalMap'
}
```

| Property | Type | Description |
|----------|------|-------------|
| `usedByMaterials` | `TextureMaterialUsage[]` | Materials using this texture |
| `usageCount` | `number` | Total usage count |

## TexturesSummary

Summary statistics for all textures:

```typescript
interface TexturesSummary {
  totalCount: number;          // Total unique textures
  totalMemoryBytes: number;    // Total memory usage
  byType: Record<string, number>; // Count by texture type
  cubeTextureCount: number;    // Cube textures
  compressedCount: number;     // Compressed textures
  videoTextureCount: number;   // Video textures
  renderTargetCount: number;   // Render target textures
}
```

## Usage Examples

### List All Textures

```typescript
function listTextures(snapshot: SceneSnapshot) {
  const summary = snapshot.texturesSummary;
  
  console.log(`=== Textures (${summary?.totalCount ?? 0}) ===`);
  console.log(`Total Memory: ${((summary?.totalMemoryBytes ?? 0) / 1024 / 1024).toFixed(2)} MB`);
  
  snapshot.textures?.forEach(tex => {
    console.log(`\n${tex.name || tex.source.url || '(unnamed)'}`);
    console.log(`  Type: ${tex.type}`);
    console.log(`  Size: ${tex.dimensions.width}x${tex.dimensions.height}`);
    console.log(`  Format: ${tex.formatName} (${tex.dataTypeName})`);
    console.log(`  Memory: ${(tex.memoryBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Mipmaps: ${tex.mipmaps.enabled ? tex.mipmaps.count + ' levels' : 'disabled'}`);
    console.log(`  Used by: ${tex.usageCount} material(s)`);
  });
}
```

### Find Large Textures

```typescript
function findLargeTextures(snapshot: SceneSnapshot, thresholdMB = 4) {
  const thresholdBytes = thresholdMB * 1024 * 1024;
  
  const large = snapshot.textures?.filter(tex => 
    tex.memoryBytes > thresholdBytes
  ) ?? [];
  
  if (large.length > 0) {
    console.log(`Found ${large.length} textures over ${thresholdMB}MB:`);
    large
      .sort((a, b) => b.memoryBytes - a.memoryBytes)
      .forEach(tex => {
        const size = `${tex.dimensions.width}x${tex.dimensions.height}`;
        const mb = (tex.memoryBytes / 1024 / 1024).toFixed(2);
        console.log(`  ${tex.name || tex.uuid}: ${size} = ${mb} MB`);
      });
  }
}
```

### Analyze Compression Opportunities

```typescript
function analyzeCompressionOpportunities(snapshot: SceneSnapshot) {
  const uncompressed = snapshot.textures?.filter(tex => 
    !tex.isCompressed && 
    !tex.isRenderTarget && 
    tex.memoryBytes > 100 * 1024 // > 100KB
  ) ?? [];
  
  if (uncompressed.length === 0) {
    console.log('All significant textures are compressed or render targets.');
    return;
  }
  
  let potentialSavings = 0;
  
  console.log('Textures that could benefit from compression:');
  uncompressed.forEach(tex => {
    const currentMB = tex.memoryBytes / 1024 / 1024;
    // BC7/ASTC typically 4:1 to 6:1 compression
    const compressedMB = currentMB / 4;
    const savings = currentMB - compressedMB;
    potentialSavings += savings;
    
    console.log(`  ${tex.name || tex.uuid}`);
    console.log(`    Current: ${currentMB.toFixed(2)} MB`);
    console.log(`    Compressed: ~${compressedMB.toFixed(2)} MB`);
    console.log(`    Savings: ~${savings.toFixed(2)} MB`);
  });
  
  console.log(`\nTotal potential savings: ~${potentialSavings.toFixed(2)} MB`);
}
```

### Check Non-Power-of-Two Textures

```typescript
function findNPOTTextures(snapshot: SceneSnapshot) {
  const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;
  
  const npot = snapshot.textures?.filter(tex => 
    !isPowerOfTwo(tex.dimensions.width) || 
    !isPowerOfTwo(tex.dimensions.height)
  ) ?? [];
  
  if (npot.length > 0) {
    console.log('Non-power-of-two textures (may cause issues with mipmaps/wrapping):');
    npot.forEach(tex => {
      console.log(`  ${tex.name}: ${tex.dimensions.width}x${tex.dimensions.height}`);
      
      // Suggest nearest POT size
      const suggestedW = Math.pow(2, Math.ceil(Math.log2(tex.dimensions.width)));
      const suggestedH = Math.pow(2, Math.ceil(Math.log2(tex.dimensions.height)));
      console.log(`    Suggested: ${suggestedW}x${suggestedH}`);
    });
  }
}
```

### Texture Usage Map

```typescript
function printTextureUsageMap(snapshot: SceneSnapshot) {
  const usageMap = new Map<string, string[]>();
  
  snapshot.textures?.forEach(tex => {
    tex.usedByMaterials.forEach(usage => {
      const key = `${usage.materialName}:${usage.slot}`;
      if (!usageMap.has(tex.uuid)) {
        usageMap.set(tex.uuid, []);
      }
      usageMap.get(tex.uuid)!.push(key);
    });
  });
  
  console.log('Texture Usage Map:');
  snapshot.textures?.forEach(tex => {
    const uses = usageMap.get(tex.uuid) ?? [];
    console.log(`\n${tex.name || tex.uuid}`);
    if (uses.length === 0) {
      console.log('  ⚠️ UNUSED');
    } else {
      uses.forEach(use => console.log(`  • ${use}`));
    }
  });
}
```

### Find Unused Textures

```typescript
function findUnusedTextures(snapshot: SceneSnapshot) {
  const unused = snapshot.textures?.filter(tex => 
    tex.usageCount === 0 && !tex.isRenderTarget
  ) ?? [];
  
  if (unused.length > 0) {
    let wastedBytes = 0;
    console.log(`Found ${unused.length} unused textures:`);
    
    unused.forEach(tex => {
      wastedBytes += tex.memoryBytes;
      console.log(`  ${tex.name || tex.uuid}: ${(tex.memoryBytes / 1024 / 1024).toFixed(2)} MB`);
    });
    
    console.log(`\nTotal wasted memory: ${(wastedBytes / 1024 / 1024).toFixed(2)} MB`);
  }
}
```

### Filtering Quality Check

```typescript
function checkFilteringQuality(snapshot: SceneSnapshot) {
  const issues: string[] = [];
  
  snapshot.textures?.forEach(tex => {
    // Check for linear filtering without mipmaps (blurry at distance)
    if (tex.filtering.minName.includes('Linear') && 
        !tex.filtering.minName.includes('Mipmap') &&
        tex.dimensions.width > 256) {
      issues.push(
        `${tex.name}: Linear min filter without mipmaps - will be blurry at distance`
      );
    }
    
    // Check for no anisotropic filtering on floor/wall textures
    if (tex.anisotropy === 1 && 
        tex.mipmaps.enabled &&
        (tex.name?.includes('floor') || tex.name?.includes('ground'))) {
      issues.push(
        `${tex.name}: Consider enabling anisotropic filtering for better quality`
      );
    }
    
    // Check for nearest filter on normal maps
    if (tex.filtering.magName === 'NearestFilter') {
      const isNormalMap = tex.usedByMaterials.some(u => u.slot === 'normalMap');
      if (isNormalMap) {
        issues.push(
          `${tex.name}: Nearest filter on normal map causes visual artifacts`
        );
      }
    }
  });
  
  if (issues.length > 0) {
    console.log('Filtering Issues:');
    issues.forEach(i => console.log(`  • ${i}`));
  }
}
```

## See Also

- [MaterialData](./material-info.md) - Material information
- [RenderTargetData](./render-target-info.md) - Render target information
- [estimateTextureMemory](./performance-calculator.md#estimatetexturememory) - Memory estimation
- [SceneSnapshot](./scene-snapshot.md) - Full scene snapshot
