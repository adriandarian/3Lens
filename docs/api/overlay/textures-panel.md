# Textures Panel

The Textures panel provides a visual gallery of all textures in your scene, with thumbnail previews, detailed properties, and memory analysis.

## Overview

```typescript
// Open the Textures panel
overlay.showPanel('textures');
```

The Textures panel helps you manage and optimize texture assets:

- **Thumbnail gallery** with search
- **Format and dimension info**
- **Memory usage tracking**
- **Compression status**
- **Mipmap visualization**
- **Usage references**

## Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🖼️ Textures                            [Search...    ] ─ □ ✕   │
├─────────────────────────────────────────────────────────────────┤
│  Summary: 28 Textures | 156 MB | 12 Compressed                  │
├─────────────────────────────────────────────────────────────────┤
│                                │                                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │  player_diffuse.png           │
│  │    │ │    │ │    │ │    │   │  ─────────────────────         │
│  │ 🖼️ │ │ 🖼️ │ │ 🖼️ │ │ 🖼️ │   │                                │
│  └────┘ └────┘ └────┘ └────┘   │  [Thumbnail Preview]           │
│  player  ground normal  ao     │                                │
│                                │  Dimensions: 2048 × 2048       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │  Format: RGBA                  │
│  │    │ │    │ │    │ │    │   │  Memory: 16 MB                 │
│  │ 🖼️ │ │ 🖼️ │ │ 🖼️ │ │ 🖼️ │   │  Mipmaps: Yes (11 levels)     │
│  └────┘ └────┘ └────┘ └────┘   │  Filtering: Linear             │
│  env    rough  metal  emit     │  Wrapping: Repeat              │
│                         ◀      │                                │
│  ┌────┐ ┌────┐                 │  Used by:                      │
│  │    │ │    │                 │  • PlayerSkin (map)            │
│  │ 🖼️ │ │ 🖼️ │                 │  • PlayerSkin (emissive)       │
│  └────┘ └────┘                 │                                │
│  cube   hdri                   │  [View Full] [Log] [Download]  │
│                                │                                │
└─────────────────────────────────────────────────────────────────┘
```

## Texture Gallery

### Summary Bar

Quick statistics:

```
28 Textures | 156 MB | 12 Compressed
     ↑          ↑           ↑
   Total    Total size   KTX2/Basis
```

### Thumbnail Grid

Visual preview of all textures:

```
┌────────────────┐
│                │
│   [Preview]    │
│                │
├────────────────┤
│ texture_name   │
│ 1024×1024 2MB  │
└────────────────┘
```

**Thumbnail Indicators:**
- 📦 Compressed format (KTX2/Basis)
- 🎯 Render target texture
- 📹 Video texture
- 🧊 3D/Volume texture
- 🔲 Cubemap face

### Search & Filter

Filter textures by:

- Name or filename
- Format type
- Minimum dimensions
- Material usage

```typescript
// Search examples
"diffuse"     // Find *diffuse* textures
"normal"      // Find normal maps
"2048"        // Find 2048px textures
"PlayerSkin"  // Find textures used by material
```

### Sorting Options

Sort by:
- **Name** (alphabetical)
- **Size** (dimensions)
- **Memory** (high to low)
- **Format** (grouped)
- **Usage** (reference count)

## Texture Inspector

### Basic Properties

```typescript
interface TextureInfo {
  uuid: string;
  name: string;
  type: string;           // Texture, DataTexture, etc.
  width: number;
  height: number;
  format: PixelFormat;
  encoding: TextureEncoding;
  estimatedMemoryBytes: number;
  source: string | null;  // URL if loaded from file
}
```

### Full-Size Preview

Click "View Full" to see the texture at actual size:

```
┌─────────────────────────────────────────────────────┐
│  player_diffuse.png                          [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│             [Full Resolution Preview]               │
│                  2048 × 2048                        │
│                                                     │
│  Zoom: [−] ════●════ [+]  Fit | 100% | 200%        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Format Details

```
Format Information:
├─ Type: Texture
├─ Format: RGBA (4 channels)
├─ Internal Format: RGBA8
├─ Data Type: UnsignedByte
├─ Encoding: sRGB
├─ Compressed: No
└─ Premultiplied Alpha: No
```

### Sampling Settings

```
Sampling:
├─ Mag Filter: Linear
├─ Min Filter: LinearMipmapLinear
├─ Anisotropy: 16
├─ Generate Mipmaps: Yes
├─ Mipmap Levels: 11
└─ Flip Y: Yes
```

### Wrapping Mode

```
Wrapping:
├─ Wrap S: Repeat
├─ Wrap T: Repeat
└─ Wrap R: ClampToEdge (3D only)

Transform:
├─ Offset: (0, 0)
├─ Repeat: (1, 1)
├─ Center: (0, 0)
└─ Rotation: 0°
```

## Texture Types

### Standard Textures

| Type | Icon | Description |
|------|------|-------------|
| Texture | 🖼️ | Standard 2D texture |
| DataTexture | 📊 | Programmatic data texture |
| CompressedTexture | 📦 | GPU-compressed (DXT/BC/ETC/ASTC) |
| CanvasTexture | 🎨 | From HTML canvas |
| VideoTexture | 📹 | Video source |
| CubeTexture | 🧊 | Cubemap (6 faces) |
| Data3DTexture | 📐 | 3D volume texture |
| DepthTexture | 🌑 | Depth buffer texture |

### Cubemap Display

For cubemap textures, shows all 6 faces:

```
┌─────────────────────────────────────────────┐
│ Cubemap: environment_hdr                    │
├─────────────────────────────────────────────┤
│           ┌────┐                            │
│           │ +Y │                            │
│     ┌────┬┴────┴┬────┬────┐                │
│     │ −X │  +Z  │ +X │ −Z │                │
│     └────┴┬────┬┴────┴────┘                │
│           │ −Y │                            │
│           └────┘                            │
│                                             │
│ Face Size: 1024 × 1024                      │
│ Total Memory: 24 MB                         │
└─────────────────────────────────────────────┘
```

### Mipmap Preview

View individual mipmap levels:

```
Mipmap Levels: 11
┌──────┬──────┬──────┬──────┬──────┐
│ L0   │ L1   │ L2   │ L3   │ L4   │
│2048² │1024² │ 512² │ 256² │ 128² │
└──────┴──────┴──────┴──────┴──────┘
  ↓      ↓      ↓      ↓      ↓
[Full] [Half] [Quarter] ...
```

## Memory Analysis

### Per-Texture Memory

```
Memory: 16 MB (16,777,216 bytes)
├─ Base Level: 16 MB (2048×2048×4)
├─ Mipmaps: 5.3 MB (levels 1-10)
└─ Total: 21.3 MB
```

### Format Efficiency

```
Format Comparison:
┌────────────────────────────────────────────┐
│ Current (RGBA8):          16 MB            │
│ With BC7 compression:     ~4 MB (−75%)     │
│ With JPEG (lossy):        ~0.5 MB (−97%)   │
└────────────────────────────────────────────┘

💡 Consider using KTX2/Basis compression
```

### Memory Warnings

```
⚠️ Large Texture Alert
├─ Dimension: 4096 × 4096
├─ Memory: 64 MB
│
│ Suggestions:
│ • Reduce to 2048×2048 (−75% memory)
│ • Use GPU compression (−75% memory)
│ • Check if full resolution is needed
└─────────────────────────────────────
```

## Usage References

### Material Usage

```
Used by Materials (2):
├─ PlayerSkin
│  ├─ map (diffuse)
│  └─ emissiveMap
│
└─ PlayerEyes
   └─ map (diffuse)
```

### Direct References

```
Referenced by Objects (3):
├─ Scene.background
├─ EnvironmentMap (probe)
└─ DecalProjector
```

Click any reference to navigate to that material or object.

## Actions

### View Full

Opens full-resolution preview with zoom controls.

### Log

Output texture to console:

```typescript
console.log('3Lens Texture:', texture);
// Full THREE.Texture with all properties
```

### Download

Export texture as:
- **PNG** - Lossless with alpha
- **JPEG** - Compressed (quality adjustable)
- **WebP** - Modern compressed format

### Replace

Upload a new texture to replace the current one (development mode).

## API Integration

```typescript
// Get all textures
const textures = probe.getTextures();

// Find specific texture
const diffuse = textures.find(t => t.name.includes('diffuse'));

// Get texture stats
console.log('Size:', diffuse.width, '×', diffuse.height);
console.log('Memory:', diffuse.estimatedMemoryBytes);

// Subscribe to texture changes
probe.on('textureUpdate', (texture) => {
  console.log('Texture updated:', texture.name);
});
```

## Best Practices

1. **Name your textures** - Easier identification
   ```typescript
   texture.name = 'player_diffuse';
   ```

2. **Use power-of-two dimensions** - Required for mipmaps
   ```typescript
   // Good: 256, 512, 1024, 2048, 4096
   // Bad: 300, 1000, 1920
   ```

3. **Enable compression** - Use KTX2/Basis for production
   ```typescript
   const loader = new KTX2Loader();
   loader.setTranscoderPath('/basis/');
   ```

4. **Right-size textures** - Don't use 4K for small objects
   ```typescript
   // A 10-pixel button doesn't need 2048×2048
   ```

5. **Monitor memory** - Textures are often the largest assets

6. **Use texture atlases** - Combine small textures
   ```typescript
   // One 2048 atlas vs many 256 textures
   ```

7. **Check encoding** - Use sRGB for color, Linear for data
   ```typescript
   colorTexture.encoding = THREE.sRGBEncoding;
   normalTexture.encoding = THREE.LinearEncoding;
   ```

## Related

- [Materials Panel](./materials-panel.md)
- [Render Targets Panel](./render-targets-panel.md)
- [Memory Panel](./memory-panel.md)
- [Texture Info Type](../core/texture-info.md)
