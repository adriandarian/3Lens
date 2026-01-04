# Object Inspector Panel

The Object Inspector panel displays detailed properties of the currently selected object, providing both read-only information and live editing capabilities.

## Overview

The Object Inspector appears in the right pane of the Scene Explorer panel when an object is selected. It shows context-aware properties based on the object type.

```
┌────────────────────────────────────────┐
│  Object Inspector                      │
├────────────────────────────────────────┤
│  Name: PlayerMesh                      │
│  Type: Mesh                            │
│  UUID: abc123-def456...                │
│                                        │
│  ── Transform ──                       │
│  Position  X: 0.00  Y: 1.50  Z: 0.00   │
│  Rotation  X: 0°    Y: 45°   Z: 0°     │
│  Scale     X: 1.00  Y: 1.00  Z: 1.00   │
│                                        │
│  ── Rendering ──                       │
│  Visible: ✓                            │
│  Cast Shadow: ✓                        │
│  Receive Shadow: ✓                     │
│  Frustum Culled: ✓                     │
│                                        │
│  ── Material ──                        │
│  Type: MeshStandardMaterial            │
│  Color: ■ #3498db                      │
│                                        │
│  ── Geometry ──                        │
│  Type: BufferGeometry                  │
│  Vertices: 2,451                       │
│  Triangles: 4,096                      │
│                                        │
│  ── Actions ──                         │
│  [Focus] [Log] [Copy Path]             │
└────────────────────────────────────────┘
```

## Property Sections

### Identity

Basic object identification:

| Property | Description |
|----------|-------------|
| Name | Object name (editable) |
| Type | three.js object type |
| UUID | Unique identifier |
| Debug ID | 3Lens tracking ID |

### Transform

World and local transform properties:

```typescript
// Displayed values
position: Vector3 { x, y, z }
rotation: Euler { x, y, z } // in degrees
scale: Vector3 { x, y, z }
quaternion: Quaternion { x, y, z, w }
```

Transform values can be edited directly in the inspector (when editing is enabled).

### Rendering Properties

For all Object3D instances:

| Property | Type | Description |
|----------|------|-------------|
| visible | boolean | Object visibility |
| castShadow | boolean | Casts shadows |
| receiveShadow | boolean | Receives shadows |
| frustumCulled | boolean | Frustum culling enabled |
| renderOrder | number | Render priority |
| layers | Layers | Camera layer mask |

### Mesh-Specific Properties

For Mesh objects:

```typescript
// Material summary
material: {
  type: 'MeshStandardMaterial',
  name: 'PlayerSkin',
  color: 0x3498db,
  transparent: false,
  opacity: 1.0,
}

// Geometry summary  
geometry: {
  type: 'BufferGeometry',
  name: 'PlayerBody',
  vertices: 2451,
  triangles: 4096,
  boundingBox: Box3,
  attributes: ['position', 'normal', 'uv'],
}
```

### Light-Specific Properties

For Light objects:

| Property | Light Types | Description |
|----------|-------------|-------------|
| color | All | Light color |
| intensity | All | Light intensity |
| distance | Point, Spot | Maximum range |
| decay | Point, Spot | Decay factor |
| angle | Spot | Cone angle |
| penumbra | Spot | Edge softness |
| target | Directional, Spot | Target object |
| shadow | All | Shadow settings |

### Camera-Specific Properties

For Camera objects:

| Property | Camera Types | Description |
|----------|--------------|-------------|
| fov | Perspective | Field of view |
| aspect | Perspective | Aspect ratio |
| near | All | Near clip plane |
| far | All | Far clip plane |
| zoom | All | Zoom factor |
| left/right/top/bottom | Orthographic | Frustum bounds |

### Skinned Mesh Properties

For SkinnedMesh objects:

```typescript
// Skeleton info
skeleton: {
  boneCount: 65,
  rootBone: 'Hips',
  bindMode: 'attached',
}

// Bind matrix
bindMatrix: Matrix4
bindMatrixInverse: Matrix4
```

## Global Tools View

When no object is selected, the inspector shows global scene tools:

```
┌────────────────────────────────────────┐
│  Global Tools                          │
├────────────────────────────────────────┤
│  Scene Statistics                      │
│  ├─ Total Objects: 1,234               │
│  ├─ Meshes: 456                        │
│  ├─ Lights: 8                          │
│  └─ Cameras: 2                         │
│                                        │
│  Quick Actions                         │
│  [📸 Screenshot] [📊 Export Stats]     │
│  [🔍 Find Object] [⚙️ Settings]        │
│                                        │
│  Scene Hierarchy                       │
│  • MainScene (1,100 objects)           │
│  • UIScene (134 objects)               │
└────────────────────────────────────────┘
```

## Property Editing

### Editable Properties

Some properties can be edited live:

```typescript
// Transform editing
position.x = 10;  // Drag or type value
rotation.y = 45;  // Values in degrees
scale.x = 2;      // Uniform or non-uniform

// Boolean toggles
visible = true;
castShadow = false;

// Material properties
material.color = 0xff0000;
material.opacity = 0.5;
```

### Edit Modes

| Mode | Description |
|------|-------------|
| Drag | Click and drag number values |
| Type | Double-click to enter value |
| Toggle | Click checkboxes |
| Color | Click color swatch for picker |

## Inspector Actions

### Focus

Centers the camera on the selected object:

```typescript
// Equivalent probe method
probe.focusOnObject(selectedObject);
```

### Log to Console

Outputs the object to browser console for debugging:

```typescript
console.log('3Lens Object:', selectedObject);
// Includes full three.js object with all properties
```

### Copy Path

Copies the scene path to clipboard:

```
Scene > World > Characters > Player > Mesh
```

### Copy Transform

Copies transform as code:

```typescript
object.position.set(10, 0, 5);
object.rotation.set(0, Math.PI / 4, 0);
object.scale.set(1, 1, 1);
```

## Cost Analysis

For meshes, the inspector shows performance cost breakdown:

```
┌────────────────────────────────────────┐
│  Cost Analysis                    🟡   │
├────────────────────────────────────────┤
│  Triangle Cost      ████████░░   8,192 │
│  Material Cost      ████░░░░░░   PBR   │
│  Texture Cost       ██████░░░░   4 tex │
│  Shader Complexity  ███░░░░░░░   Med   │
│                                        │
│  Estimated GPU Time: ~0.3ms            │
│  Recommendations:                      │
│  • Consider LOD for distant views      │
│  • 2 textures could be atlased         │
└────────────────────────────────────────┘
```

## Mesh Data Display

Detailed mesh information:

```typescript
interface MeshData {
  // Geometry
  vertexCount: number;
  faceCount: number;
  indexCount: number;
  
  // Attributes
  attributes: {
    position: { itemSize: 3, count: number };
    normal: { itemSize: 3, count: number };
    uv: { itemSize: 2, count: number };
    // ... other attributes
  };
  
  // Bounds
  boundingBox: Box3;
  boundingSphere: Sphere;
  
  // Cost data
  costData: {
    costLevel: 'low' | 'medium' | 'high' | 'very-high';
    triangles: number;
    estimatedGpuTime: number;
  };
}
```

## User Data Section

Custom user data attached to objects:

```typescript
// Set in your code
mesh.userData = {
  entityId: 'player_001',
  health: 100,
  team: 'blue',
};

// Displayed in inspector
┌────────────────────────────────────────┐
│  User Data                             │
├────────────────────────────────────────┤
│  entityId: "player_001"                │
│  health: 100                           │
│  team: "blue"                          │
└────────────────────────────────────────┘
```

## Matrix Display

For advanced debugging, matrices can be expanded:

```
World Matrix
┌                                        ┐
│  1.00   0.00   0.00   10.00           │
│  0.00   1.00   0.00    0.00           │
│  0.00   0.00   1.00    5.00           │
│  0.00   0.00   0.00    1.00           │
└                                        ┘
```

## API Integration

```typescript
// Listen for selection changes
probe.on('selectionChange', (object) => {
  if (object) {
    console.log('Inspecting:', object.name);
  }
});

// Programmatic inspection
probe.selectObject(myMesh);
overlay.showPanel('scene');
```

## Best Practices

1. **Add meaningful names** - Makes inspection clearer
2. **Use userData** - Store game/app metadata for debugging
3. **Check cost analysis** - Identify optimization targets
4. **Use Focus action** - Quickly navigate to objects
5. **Log complex objects** - Use console for deep inspection

## Related

- [Scene Explorer Panel](./scene-explorer-panel.md)
- [Selection API](../core/selection-api.md)
- [Materials Panel](./materials-panel.md)
- [Geometry Panel](./geometries-panel.md)
