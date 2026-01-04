# Icon System

The 3Lens icon system provides visual indicators for different Three.js object types, materials, geometries, and textures. Icons help users quickly identify and distinguish between different resource types.

## Import

```typescript
import {
  getObjectIcon,
  getObjectClass,
  getMaterialTypeIcon,
  getGeometryIcon,
  getTextureIcon,
} from '@3lens/ui';
```

## Object Type Icons

### getObjectIcon()

Returns a single-character icon representing the Three.js object type.

```typescript
function getObjectIcon(type: string): string
```

**Icon Mapping:**

| Object Type | Icon | Description |
|-------------|------|-------------|
| Scene | `S` | Scene root container |
| Mesh | `M` | Mesh objects |
| Group | `G` | Object3D groups |
| Light | `L` | All light types |
| Camera | `C` | Camera objects |
| Bone | `B` | Skeleton bones |
| Skeleton | `K` | Skeleton containers |
| Sprite | `P` | Billboard sprites |
| Line | `—` | Line objects |
| Points | `•` | Point clouds |
| Other | `O` | Unknown/other types |

**Example:**

```typescript
import { getObjectIcon } from '@3lens/ui';

getObjectIcon('Mesh');              // "M"
getObjectIcon('DirectionalLight');  // "L"
getObjectIcon('PerspectiveCamera'); // "C"
getObjectIcon('SkinnedMesh');       // "M"
getObjectIcon('PointLight');        // "L"
getObjectIcon('Group');             // "G"
getObjectIcon('Scene');             // "S"
```

### Object Type CSS Classes

Each object type has a corresponding CSS variable for consistent coloring:

```css
--3lens-color-scene: #34d399;   /* Emerald */
--3lens-color-mesh: #60a5fa;    /* Blue */
--3lens-color-group: #a78bfa;   /* Violet */
--3lens-color-light: #fbbf24;   /* Amber */
--3lens-color-camera: #f472b6;  /* Pink */
```

### getObjectClass()

Returns a CSS class name for styling based on object type.

```typescript
function getObjectClass(type: string): string
```

**Class Mapping:**

| Object Type | CSS Class |
|-------------|-----------|
| Scene | `scene` |
| Mesh | `mesh` |
| Group | `group` |
| Light | `light` |
| Camera | `camera` |
| Other | `object` |

**Example:**

```typescript
import { getObjectClass } from '@3lens/ui';

getObjectClass('Mesh');           // "mesh"
getObjectClass('PointLight');     // "light"
getObjectClass('OrthographicCamera'); // "camera"
```

**CSS Usage:**

```css
.node-icon.scene { color: var(--3lens-color-scene); }
.node-icon.mesh { color: var(--3lens-color-mesh); }
.node-icon.group { color: var(--3lens-color-group); }
.node-icon.light { color: var(--3lens-color-light); }
.node-icon.camera { color: var(--3lens-color-camera); }
```

## Material Type Icons

### getMaterialTypeIcon()

Returns a Unicode symbol representing the material type.

```typescript
function getMaterialTypeIcon(type: string): string
```

**Icon Mapping:**

| Material Type | Icon | Description |
|--------------|------|-------------|
| Physical | `◆` | MeshPhysicalMaterial - Filled diamond |
| Standard | `◇` | MeshStandardMaterial - Empty diamond |
| Basic | `○` | MeshBasicMaterial - Circle |
| Lambert | `◐` | MeshLambertMaterial - Half circle |
| Phong | `◑` | MeshPhongMaterial - Half circle variant |
| Toon | `◕` | MeshToonMaterial - Mostly filled circle |
| Shader/Raw | `⬡` | ShaderMaterial/RawShaderMaterial - Hexagon |
| Sprite | `◎` | SpriteMaterial - Bullseye |
| Points | `•` | PointsMaterial - Dot |
| Line | `―` | LineMaterial - Dash |
| Other | `●` | Default - Filled circle |

**Example:**

```typescript
import { getMaterialTypeIcon } from '@3lens/ui';

getMaterialTypeIcon('MeshPhysicalMaterial');  // "◆"
getMaterialTypeIcon('MeshStandardMaterial');  // "◇"
getMaterialTypeIcon('MeshBasicMaterial');     // "○"
getMaterialTypeIcon('ShaderMaterial');        // "⬡"
getMaterialTypeIcon('MeshToonMaterial');      // "◕"
getMaterialTypeIcon('SpriteMaterial');        // "◎"
```

**Visual Hierarchy:**

The icons are designed to convey material complexity:
- `◆` Physical - Most complex PBR
- `◇` Standard - Standard PBR
- `◐◑` Lambert/Phong - Legacy lighting
- `○` Basic - No lighting
- `⬡` Shader - Custom code

## Geometry Icons

### getGeometryIcon()

Returns an emoji icon representing the geometry type.

```typescript
function getGeometryIcon(type: string): string
```

**Icon Mapping:**

| Geometry Type | Icon | Description |
|--------------|------|-------------|
| Box/Cube | 📦 | BoxGeometry, BoxBufferGeometry |
| Sphere | 🔮 | SphereGeometry |
| Plane | ⬛ | PlaneGeometry |
| Cylinder | 🧴 | CylinderGeometry |
| Cone | 🔺 | ConeGeometry |
| Torus | 🍩 | TorusGeometry, TorusKnotGeometry |
| Ring | 💍 | RingGeometry |
| Circle | ⭕ | CircleGeometry |
| Tube | 🧪 | TubeGeometry |
| Extrude | 📊 | ExtrudeGeometry |
| Lathe | 🏺 | LatheGeometry |
| Text/Shape | ✒️ | TextGeometry, ShapeGeometry |
| Instanced | 🔄 | InstancedBufferGeometry |
| Other | 📐 | Default/BufferGeometry |

**Example:**

```typescript
import { getGeometryIcon } from '@3lens/ui';

getGeometryIcon('BoxGeometry');       // "📦"
getGeometryIcon('SphereGeometry');    // "🔮"
getGeometryIcon('BufferGeometry');    // "📐"
getGeometryIcon('InstancedMesh');     // "🔄"
getGeometryIcon('TorusKnotGeometry'); // "🍩"
```

## Texture Icons

### getTextureIcon()

Returns an emoji icon based on texture type flags.

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

| Texture Type | Icon | Description |
|-------------|------|-------------|
| Cube | 🎲 | CubeTexture - Environment maps |
| Video | 🎬 | VideoTexture - Video source |
| Canvas | 🎨 | CanvasTexture - 2D canvas |
| Data | 📊 | DataTexture - Raw data |
| RenderTarget | 🎯 | WebGLRenderTarget |
| Compressed | 📦 | Compressed formats (DXT, etc.) |
| Standard | 🖼️ | Regular Texture |

**Example:**

```typescript
import { getTextureIcon } from '@3lens/ui';

getTextureIcon({ isCubeTexture: true });   // "🎲"
getTextureIcon({ isVideoTexture: true });  // "🎬"
getTextureIcon({ isCanvasTexture: true }); // "🎨"
getTextureIcon({ isDataTexture: true });   // "📊"
getTextureIcon({ isRenderTarget: true });  // "🎯"
getTextureIcon({ isCompressed: true });    // "📦"
getTextureIcon({});                        // "🖼️"
```

## Icon Display Components

### Scene Tree Node Icon

```html
<div class="node-icon ${getObjectClass(node.type)}">
  ${getObjectIcon(node.type)}
</div>
```

```css
.node-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.node-icon.mesh {
  background: var(--3lens-color-mesh);
  color: #000;
}

.node-icon.light {
  background: var(--3lens-color-light);
  color: #000;
}

.node-icon.camera {
  background: var(--3lens-color-camera);
  color: #000;
}

.node-icon.group {
  background: var(--3lens-color-group);
  color: #000;
}

.node-icon.scene {
  background: var(--3lens-color-scene);
  color: #000;
}
```

### Material List Item Icon

```html
<div class="material-item">
  <span class="type-icon">${getMaterialTypeIcon(material.type)}</span>
  <span class="material-name">${material.name}</span>
</div>
```

```css
.type-icon {
  font-size: 12px;
  opacity: 0.8;
  margin-right: 6px;
}
```

### Geometry Grid Item Icon

```html
<div class="geometry-item-icon">
  ${getGeometryIcon(geometry.type)}
</div>
```

```css
.geometry-item-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--3lens-accent-emerald), #059669);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
```

### Texture Thumbnail Placeholder

```html
<div class="texture-thumb-placeholder">
  ${getTextureIcon(texture)}
</div>
```

```css
.texture-thumb-placeholder {
  font-size: 18px;
  opacity: 0.7;
}
```

## Complete Usage Example

```typescript
import {
  getObjectIcon,
  getObjectClass,
  getMaterialTypeIcon,
  getGeometryIcon,
  getTextureIcon,
} from '@3lens/ui';

function renderSceneNode(node: SceneNode): string {
  const icon = getObjectIcon(node.type);
  const cssClass = getObjectClass(node.type);
  
  return `
    <div class="tree-node">
      <div class="node-icon ${cssClass}">${icon}</div>
      <span class="node-name">${node.name}</span>
    </div>
  `;
}

function renderMaterialItem(material: MaterialData): string {
  return `
    <div class="material-item">
      <span class="material-icon">${getMaterialTypeIcon(material.type)}</span>
      <span class="material-name">${material.name}</span>
    </div>
  `;
}

function renderGeometryItem(geometry: GeometryData): string {
  return `
    <div class="geometry-item">
      <div class="geometry-icon">${getGeometryIcon(geometry.type)}</div>
      <span class="geometry-name">${geometry.name}</span>
    </div>
  `;
}

function renderTextureItem(texture: TextureData): string {
  const icon = getTextureIcon({
    isCubeTexture: texture.type === 'CubeTexture',
    isVideoTexture: texture.type === 'VideoTexture',
    isCanvasTexture: texture.type === 'CanvasTexture',
    isDataTexture: texture.type === 'DataTexture',
    isCompressed: texture.isCompressed,
  });
  
  return `
    <div class="texture-item">
      <div class="texture-icon">${icon}</div>
      <span class="texture-name">${texture.name}</span>
    </div>
  `;
}
```

## Accessibility Considerations

When using icons, always provide text alternatives:

```html
<!-- With visible text -->
<div class="node-icon mesh" title="Mesh">M</div>

<!-- Screen reader support -->
<div class="node-icon mesh" aria-label="Mesh object">
  <span aria-hidden="true">M</span>
</div>

<!-- Emoji icons need aria-label -->
<span role="img" aria-label="Sphere geometry">🔮</span>
```

## See Also

- [Component Styles](./component-styles) - CSS architecture
- [Color System](./color-system) - Semantic colors and heatmap
- [Formatters](./formatters) - Number and text formatting
- [Scene Explorer Panel](../overlay/scene-explorer-panel) - Uses object icons
