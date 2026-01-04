# Formatting Utilities

The `@3lens/ui` package provides formatting utilities for displaying numbers, memory sizes, vectors, and other values in a human-readable format.

## Import

```typescript
import {
  formatNumber,
  formatBytes,
  formatVector,
  formatEuler,
  formatLayers,
  escapeHtml,
  truncateUrl,
  getObjectIcon,
  getObjectClass,
  getMaterialTypeIcon,
  getGeometryIcon,
  getTextureIcon,
  getShortTypeName,
  getSideName,
} from '@3lens/ui';
```

## Number Formatting

### formatNumber()

Format large numbers with K/M suffix for compact display.

```typescript
function formatNumber(num: number): string
```

**Examples:**

```typescript
formatNumber(500);        // "500"
formatNumber(1234);       // "1.2K"
formatNumber(15000);      // "15.0K"
formatNumber(1500000);    // "1.5M"
formatNumber(12345678);   // "12.3M"
```

**Use cases:**
- Draw call counts
- Triangle counts
- Point counts

### formatBytes()

Format byte values to human-readable sizes (B, KB, MB, GB).

```typescript
function formatBytes(bytes: number): string
```

**Examples:**

```typescript
formatBytes(0);              // "0 B"
formatBytes(512);            // "512 B"
formatBytes(1024);           // "1.0 KB"
formatBytes(1536);           // "1.5 KB"
formatBytes(1048576);        // "1.0 MB"
formatBytes(1073741824);     // "1.00 GB"
formatBytes(NaN);            // "0 B"
```

**Use cases:**
- Texture memory usage
- Geometry buffer sizes
- Total GPU memory

## Vector Formatting

### formatVector()

Format a 3D vector to a readable string with 2 decimal places.

```typescript
function formatVector(v: { x: number; y: number; z: number }): string
```

**Examples:**

```typescript
formatVector({ x: 1, y: 2, z: 3 });           // "(1.00, 2.00, 3.00)"
formatVector({ x: 0.123, y: 4.567, z: 8.9 }); // "(0.12, 4.57, 8.90)"
formatVector({ x: -100, y: 0, z: 50.5 });     // "(-100.00, 0.00, 50.50)"
```

**Use cases:**
- Position display
- Scale values
- Bounding box dimensions

### formatEuler()

Format Euler rotation from radians to degrees.

```typescript
function formatEuler(e: { x: number; y: number; z: number; order?: string }): string
```

**Examples:**

```typescript
formatEuler({ x: 0, y: Math.PI, z: 0 });              // "(0.0°, 180.0°, 0.0°)"
formatEuler({ x: Math.PI / 4, y: 0, z: Math.PI / 2 }); // "(45.0°, 0.0°, 90.0°)"
formatEuler({ x: 0.5, y: 1.0, z: 1.5 });               // "(28.6°, 57.3°, 85.9°)"
```

**Use cases:**
- Object rotation display
- Camera orientation

## Layer Formatting

### formatLayers()

Format a layer mask to a human-readable string.

```typescript
function formatLayers(layerMask: number): string
```

**Examples:**

```typescript
formatLayers(0);    // "None"
formatLayers(1);    // "0 (default)"
formatLayers(2);    // "1"
formatLayers(3);    // "0, 1"
formatLayers(7);    // "0, 1, 2"
formatLayers(256);  // "8"
```

**Use cases:**
- Object layer display
- Camera culling mask
- Light layer filtering

## String Utilities

### escapeHtml()

Escape HTML entities for safe insertion into HTML.

```typescript
function escapeHtml(str: string): string
```

**Examples:**

```typescript
escapeHtml('<script>alert("xss")</script>');
// "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"

escapeHtml("Tom & Jerry's \"Show\"");
// "Tom &amp; Jerry&#039;s &quot;Show&quot;"
```

**Use cases:**
- Displaying object names in HTML
- Safe rendering of user-provided strings
- GLSL code display

### truncateUrl()

Truncate long URLs for display, preserving the filename.

```typescript
function truncateUrl(url: string, maxLen?: number): string  // default maxLen: 40
```

**Examples:**

```typescript
truncateUrl('texture.png');
// "texture.png"

truncateUrl('https://example.com/assets/textures/diffuse.png');
// "...diffuse.png"

truncateUrl('https://cdn.example.com/v1/assets/textures/normal_map.png', 30);
// "...normal_map.png"
```

**Use cases:**
- Texture source URLs
- Asset paths in inspector

## Object Type Icons

### getObjectIcon()

Get a single-character icon for a Three.js object type.

```typescript
function getObjectIcon(type: string): string
```

**Icon Mapping:**

| Type | Icon |
|------|------|
| Scene | S |
| Mesh | M |
| Group | G |
| Light | L |
| Camera | C |
| Bone | B |
| Skeleton | K |
| Sprite | P |
| Line | — |
| Points | • |
| Other | O |

**Example:**

```typescript
getObjectIcon('Mesh');           // "M"
getObjectIcon('DirectionalLight'); // "L"
getObjectIcon('PerspectiveCamera'); // "C"
getObjectIcon('SkinnedMesh');    // "M"
getObjectIcon('UnknownType');    // "O"
```

### getObjectClass()

Get a CSS class name for object type styling.

```typescript
function getObjectClass(type: string): string
```

**Classes:**

| Type | Class |
|------|-------|
| Scene | scene |
| Mesh | mesh |
| Group | group |
| Light | light |
| Camera | camera |
| Other | object |

**Example:**

```typescript
getObjectClass('Mesh');           // "mesh"
getObjectClass('PointLight');     // "light"
getObjectClass('Group');          // "group"
getObjectClass('SkinnedMesh');    // "mesh"
```

## Material Type Icons

### getMaterialTypeIcon()

Get an icon character for a material type.

```typescript
function getMaterialTypeIcon(type: string): string
```

**Icon Mapping:**

| Material Type | Icon |
|--------------|------|
| Physical | ◆ |
| Standard | ◇ |
| Basic | ○ |
| Lambert | ◐ |
| Phong | ◑ |
| Toon | ◕ |
| Shader/Raw | ⬡ |
| Sprite | ◎ |
| Points | • |
| Line | ― |
| Other | ● |

**Example:**

```typescript
getMaterialTypeIcon('MeshPhysicalMaterial');   // "◆"
getMaterialTypeIcon('MeshStandardMaterial');   // "◇"
getMaterialTypeIcon('ShaderMaterial');         // "⬡"
getMaterialTypeIcon('MeshToonMaterial');       // "◕"
```

## Geometry Icons

### getGeometryIcon()

Get an emoji icon for a geometry type.

```typescript
function getGeometryIcon(type: string): string
```

**Icon Mapping:**

| Geometry Type | Icon |
|--------------|------|
| Box/Cube | 📦 |
| Sphere | 🔮 |
| Plane | ⬛ |
| Cylinder | 🧴 |
| Cone | 🔺 |
| Torus | 🍩 |
| Ring | 💍 |
| Circle | ⭕ |
| Tube | 🧪 |
| Extrude | 📊 |
| Lathe | 🏺 |
| Text/Shape | ✒️ |
| Instanced | 🔄 |
| Other | 📐 |

**Example:**

```typescript
getGeometryIcon('BoxGeometry');        // "📦"
getGeometryIcon('SphereGeometry');     // "🔮"
getGeometryIcon('InstancedMesh');      // "🔄"
getGeometryIcon('BufferGeometry');     // "📐"
```

## Texture Icons

### getTextureIcon()

Get an emoji icon for a texture type.

```typescript
function getTextureIcon(tex: {
  isCubeTexture?: boolean;
  isVideoTexture?: boolean;
  isCanvasTexture?: boolean;
  isDataTexture?: boolean;
  isRenderTarget?: boolean;
  isCompressed?: boolean;
}): string
```

**Icon Mapping:**

| Texture Type | Icon |
|-------------|------|
| Cube | 🎲 |
| Video | 🎬 |
| Canvas | 🎨 |
| Data | 📊 |
| RenderTarget | 🎯 |
| Compressed | 📦 |
| Standard | 🖼️ |

**Example:**

```typescript
getTextureIcon({ isCubeTexture: true });     // "🎲"
getTextureIcon({ isVideoTexture: true });    // "🎬"
getTextureIcon({ isRenderTarget: true });    // "🎯"
getTextureIcon({});                          // "🖼️"
```

## TypedArray Names

### getShortTypeName()

Get abbreviated names for TypedArray types.

```typescript
function getShortTypeName(arrayType: string): string
```

**Mapping:**

| Array Type | Short Name |
|-----------|------------|
| Float32Array | f32 |
| Float64Array | f64 |
| Int8Array | i8 |
| Int16Array | i16 |
| Int32Array | i32 |
| Uint8Array | u8 |
| Uint16Array | u16 |
| Uint32Array | u32 |
| Uint8ClampedArray | u8c |

**Example:**

```typescript
getShortTypeName('Float32Array');     // "f32"
getShortTypeName('Uint16Array');      // "u16"
getShortTypeName('Uint8ClampedArray'); // "u8c"
getShortTypeName('CustomArray');      // "CustomArray"
```

## Material Side Names

### getSideName()

Convert Three.js side constant to readable name.

```typescript
function getSideName(side: number): string
```

**Mapping:**

| Side Value | Name |
|-----------|------|
| 0 | Front |
| 1 | Back |
| 2 | Double |
| other | Unknown (n) |

**Example:**

```typescript
import { FrontSide, BackSide, DoubleSide } from 'three';

getSideName(FrontSide);  // "Front"
getSideName(BackSide);   // "Back"
getSideName(DoubleSide); // "Double"
getSideName(99);         // "Unknown (99)"
```

## Usage in Panels

### Material Inspector

```typescript
function renderMaterialInfo(material: MaterialData) {
  return `
    <div class="material-row">
      <span class="icon">${getMaterialTypeIcon(material.type)}</span>
      <span class="name">${escapeHtml(material.name)}</span>
      <span class="side">${getSideName(material.side)}</span>
    </div>
  `;
}
```

### Geometry Inspector

```typescript
function renderGeometryInfo(geometry: GeometryData) {
  return `
    <div class="geometry-header">
      <span class="icon">${getGeometryIcon(geometry.type)}</span>
      <span class="name">${escapeHtml(geometry.name)}</span>
    </div>
    <div class="geometry-stats">
      <span>Vertices: ${formatNumber(geometry.vertexCount)}</span>
      <span>Memory: ${formatBytes(geometry.memorySize)}</span>
    </div>
  `;
}
```

### Transform Display

```typescript
function renderTransform(transform: TransformData) {
  return `
    <div class="transform-panel">
      <div class="row">
        <label>Position</label>
        <span>${formatVector(transform.position)}</span>
      </div>
      <div class="row">
        <label>Rotation</label>
        <span>${formatEuler(transform.rotation)}</span>
      </div>
      <div class="row">
        <label>Scale</label>
        <span>${formatVector(transform.scale)}</span>
      </div>
    </div>
  `;
}
```

## See Also

- [Materials Panel](./materials-panel-component) - Uses material formatting
- [Geometry Panel](./geometry-panel-component) - Uses geometry/number formatting
- [Textures Panel](./textures-panel-component) - Uses texture icons and byte formatting
- [GLSL Highlighting](./glsl-highlighting) - Shader code formatting
