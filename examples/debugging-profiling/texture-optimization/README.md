# 3Lens Texture Optimization Example

This example demonstrates various texture optimization strategies and how to use 3Lens to analyze GPU memory usage. Textures are often the largest contributor to GPU memory consumption, making optimization crucial for performance.

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-texture-optimization dev
```

Then open http://localhost:3014 in your browser.

## Scenarios Compared

### 1. Oversized Textures (Worst - 128 MB)

**The Problem:** Using 4096×4096 textures for objects that only cover a small portion of the screen.

```typescript
// Bad: 4096² texture for a small cube
const texture = new THREE.TextureLoader().load('huge_4k_texture.png');
const material = new THREE.MeshStandardMaterial({ map: texture });
const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
```

**Memory Impact:**
- 4096 × 4096 × 4 bytes (RGBA) = 64 MB per texture
- With mipmaps: ~85 MB per texture
- 8 textures = **128+ MB GPU memory**

**When This Happens:**
- Using asset library textures without resizing
- Not considering screen-space coverage
- "Future-proofing" that wastes resources now

---

### 2. Appropriate Sizing (Better - 8 MB)

**The Solution:** Size textures based on actual screen coverage.

```typescript
// Calculate needed texture size based on object size and view distance
const screenCoverage = objectSize / viewDistance;
const neededTexels = screenCoverage * screenHeight;
const textureSize = nextPowerOfTwo(neededTexels); // 512 for typical cases
```

**Memory Impact:**
- 512 × 512 × 4 bytes = 1 MB per texture
- 8 textures = **8 MB GPU memory**
- **16× reduction** from oversized!

**Sizing Guidelines:**
| Object Type | Typical Size | Texture Size |
|-------------|--------------|--------------|
| Background prop | Small on screen | 128-256 |
| Standard object | Medium | 256-512 |
| Hero/focus object | Large on screen | 512-1024 |
| Ground/terrain | Full screen | 1024-2048 |

---

### 3. Compressed Formats (Great - 2 MB)

**The Solution:** Use GPU-native compressed formats (BC/DXT, ETC, ASTC).

```typescript
// Load compressed texture (KTX2 format)
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

const loader = new KTX2Loader()
  .setTranscoderPath('basis/')
  .detectSupport(renderer);

loader.load('texture.ktx2', (texture) => {
  material.map = texture;
});
```

**Memory Impact:**
- BC1/DXT1: 4:1 compression (0.5 bytes per pixel)
- BC3/DXT5: 4:1 compression with alpha
- 512² BC1 = ~128 KB per texture
- 8 textures = **~2 MB GPU memory**

**Compression Format Guide:**
| Format | Ratio | Alpha | Best For |
|--------|-------|-------|----------|
| BC1/DXT1 | 6:1 | 1-bit | Opaque textures |
| BC3/DXT5 | 4:1 | 8-bit | Transparent textures |
| BC7 | 3:1 | 8-bit | High quality |
| ETC2 | 6:1 | Yes | Mobile (Android) |
| ASTC | Variable | Yes | Mobile (modern) |

---

### 4. Texture Atlas (Best - 1 MB)

**The Solution:** Combine multiple textures into a single atlas.

```typescript
// Create atlas texture
const atlas = new THREE.TextureLoader().load('combined_atlas.png');

// Modify UVs to sample correct region
const uvOffset = new THREE.Vector2(0.25, 0.5); // Atlas cell position
const uvScale = new THREE.Vector2(0.25, 0.25); // 4x4 grid = 0.25

material.map = atlas;
material.map.offset = uvOffset;
material.map.repeat = uvScale;
```

**Benefits:**
- **Single draw call** for all objects using atlas
- Reduced texture state changes
- Better GPU cache utilization
- Combined with compression = maximum savings

**Atlas Tools:**
- TexturePacker (commercial)
- Free Texture Packer (free)
- Spritesmith (Node.js)
- Custom scripts with Sharp/Canvas

---

## Using 3Lens to Analyze Textures

### Step 1: Open Memory Panel

Click the 3Lens overlay → **Memory** tab to see:
- Total GPU memory estimate
- Memory breakdown by type (textures, geometry, etc.)
- Memory trend over time

### Step 2: Inspect Textures Tab

In the Memory panel, click **Textures** to see:
- List of all loaded textures
- Dimensions and format
- Memory usage per texture
- Which materials use each texture

### Step 3: Identify Optimization Opportunities

**Red Flags to Look For:**
- Textures > 2048² for non-hero objects
- Multiple textures that could be atlased
- Uncompressed textures (RGBA8 format)
- Unused textures still in memory

### Step 4: Track Memory Over Time

Use the Memory trend chart to detect:
- Texture memory leaks
- Loading spikes during scene transitions
- Cumulative texture loading patterns

---

## Optimization Techniques

### 1. Automatic LOD for Textures

```typescript
// Load multiple resolutions
const textureHigh = loadTexture('texture_2k.jpg');
const textureMed = loadTexture('texture_1k.jpg');
const textureLow = loadTexture('texture_512.jpg');

// Switch based on camera distance
function updateTextureLOD(object, camera) {
  const distance = object.position.distanceTo(camera.position);
  if (distance > 50) {
    object.material.map = textureLow;
  } else if (distance > 20) {
    object.material.map = textureMed;
  } else {
    object.material.map = textureHigh;
  }
}
```

### 2. Texture Streaming

```typescript
// Load textures on demand
class TextureStreamer {
  private cache = new Map<string, THREE.Texture>();
  private loader = new THREE.TextureLoader();
  
  async getTexture(url: string): Promise<THREE.Texture> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }
    
    const texture = await this.loader.loadAsync(url);
    this.cache.set(url, texture);
    return texture;
  }
  
  releaseUnused(activeUrls: Set<string>) {
    for (const [url, texture] of this.cache) {
      if (!activeUrls.has(url)) {
        texture.dispose();
        this.cache.delete(url);
      }
    }
  }
}
```

### 3. Mipmap Considerations

```typescript
// Disable mipmaps for UI/2D elements
texture.generateMipmaps = false;
texture.minFilter = THREE.LinearFilter;

// This saves ~33% memory but may cause aliasing
```

### 4. Power-of-Two Sizing

```typescript
// Three.js works best with power-of-two textures
function nextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

// Resize non-POT textures
const canvas = document.createElement('canvas');
canvas.width = nextPowerOfTwo(image.width);
canvas.height = nextPowerOfTwo(image.height);
const ctx = canvas.getContext('2d');
ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
```

---

## Memory Calculation Reference

### Uncompressed Formats

| Format | Bytes/Pixel | 512² | 1024² | 2048² | 4096² |
|--------|-------------|------|-------|-------|-------|
| RGB8 | 3 | 768 KB | 3 MB | 12 MB | 48 MB |
| RGBA8 | 4 | 1 MB | 4 MB | 16 MB | 64 MB |
| RGBA16F | 8 | 2 MB | 8 MB | 32 MB | 128 MB |
| RGBA32F | 16 | 4 MB | 16 MB | 64 MB | 256 MB |

### With Mipmaps (add ~33%)

| Format | 512² | 1024² | 2048² | 4096² |
|--------|------|-------|-------|-------|
| RGBA8 | 1.33 MB | 5.33 MB | 21.33 MB | 85.33 MB |

### Compressed Formats

| Format | Bytes/Pixel | 512² | 1024² | 2048² |
|--------|-------------|------|-------|-------|
| BC1/DXT1 | 0.5 | 128 KB | 512 KB | 2 MB |
| BC3/DXT5 | 1 | 256 KB | 1 MB | 4 MB |
| BC7 | 1 | 256 KB | 1 MB | 4 MB |

---

## Quick Checklist

- [ ] Audit texture sizes vs screen coverage
- [ ] Use compressed formats (KTX2/Basis Universal)
- [ ] Combine textures into atlases where possible
- [ ] Dispose textures when no longer needed
- [ ] Set appropriate filtering modes
- [ ] Use mipmaps for 3D textures
- [ ] Implement texture LOD for large scenes
- [ ] Monitor GPU memory with 3Lens

---

## Dependencies

- `@3lens/core` - Core devtool probe
- `@3lens/overlay` - Floating overlay UI
- `three` - Three.js library

