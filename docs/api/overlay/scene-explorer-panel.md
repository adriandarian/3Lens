# Scene Explorer Panel

The Scene Explorer panel provides a hierarchical tree view of all objects in your three.js scenes, enabling interactive navigation, selection, and visibility control.

## Overview

```typescript
// Open the Scene Explorer panel
overlay.showPanel('scene');
```

The Scene Explorer is the primary navigation tool in 3Lens, displaying your scene graph as an interactive tree with:

- **Expandable nodes** for drilling into object hierarchies
- **Object type icons** for quick identification
- **Visibility toggles** for hiding/showing objects
- **Cost indicators** for performance-heavy meshes
- **Selection highlighting** with inspector integration

## Panel Layout

The Scene Explorer uses a split-view layout:

```
┌─────────────────────────────────────────────────────┐
│  Scene Explorer                           ─ □ ✕    │
├────────────────────────┬────────────────────────────┤
│  🎬 Scene              │  Object Inspector          │
│  ├─ 💡 DirectionalLight│  ──────────────────────    │
│  ├─ 📷 PerspectiveCamera│  Name: Player             │
│  └─ 📦 World           │  Type: Group               │
│     ├─ 🔲 Ground       │  Position: 0, 0, 0         │
│     ├─ 📦 Player ◀     │  Rotation: 0, 0, 0         │
│     │  ├─ 🔺 Body      │  Scale: 1, 1, 1            │
│     │  └─ 🔺 Head      │  Visible: ✓                │
│     └─ 📦 Enemies      │  Children: 2               │
│        ├─ 🔺 Enemy1    │                            │
│        └─ 🔺 Enemy2    │                            │
│                        │                            │
└────────────────────────┴────────────────────────────┘
```

## Tree View Features

### Node Expansion

Click the arrow toggle to expand/collapse nodes:

```
▶ 📦 Collapsed Node        ← Click to expand
▼ 📦 Expanded Node         ← Click to collapse
  ├─ 🔺 Child 1
  └─ 🔺 Child 2
```

By default, root scenes and their first few children are auto-expanded for immediate visibility.

### Object Type Icons

Each object type has a distinctive icon for quick identification:

| Icon | Object Type |
|------|-------------|
| 🎬 | Scene |
| 📦 | Group / Object3D |
| 🔺 | Mesh |
| 💡 | Light (all types) |
| 📷 | Camera |
| 🦴 | Bone / SkinnedMesh |
| 📍 | Sprite |
| 〰️ | Line |
| ☁️ | Points |
| 🔊 | Audio |
| 🌐 | LOD |
| 🔗 | InstancedMesh |

### Selection

Click any node to select it:

```typescript
// Selection is synced with the probe
probe.on('selectionChange', (selected) => {
  console.log('Selected:', selected?.name);
});
```

Selected objects:
- Show a highlighted background in the tree
- Display their properties in the Inspector pane
- Can be manipulated via transform gizmos (if enabled)

### Visibility Control

Toggle object visibility with the eye icon:

```
👁️ Visible      → Click to hide
👁️‍🗨️ Hidden     → Click to show
```

Visibility changes are applied immediately to the scene and propagate to children.

### Cost Indicators

Meshes with high rendering cost show colored indicators:

| Indicator | Cost Level | Description |
|-----------|------------|-------------|
| 🟢 | Low | < 1000 triangles, simple material |
| 🟡 | Medium | 1K-10K triangles |
| 🟠 | High | 10K-100K triangles |
| 🔴 | Very High | > 100K triangles or expensive shaders |

## Virtual Scrolling

For scenes with more than 100 nodes, virtual scrolling is automatically enabled to maintain smooth performance:

```typescript
// Configure virtual scroll threshold
const overlay = createOverlay(probe, {
  virtualScrollThreshold: 100, // Default: 100 nodes
});
```

Virtual scrolling only renders visible nodes, allowing trees with thousands of objects to remain responsive.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate between nodes |
| `←` | Collapse current node |
| `→` | Expand current node |
| `Enter` | Select focused node |
| `H` | Toggle selected object visibility |
| `F` | Focus camera on selected object |
| `Delete` | Remove selected object (if enabled) |

## Integration with Inspector

When an object is selected, the right pane shows:

- **Transform properties** (position, rotation, scale)
- **Material information** for meshes
- **Light parameters** for lights
- **Camera settings** for cameras
- **Custom properties** from user data

See [Object Inspector Panel](./object-inspector-panel.md) for details.

## Programmatic Control

### Expand/Collapse Nodes

```typescript
// The overlay manages expansion state internally
// Selection automatically expands parent nodes
probe.selectObject(deepNestedObject);
```

### Find and Select Objects

```typescript
// Select by reference
probe.selectObject(myMesh);

// Select by debug ID
probe.selectByDebugId('mesh_12345');

// Clear selection
probe.selectObject(null);
```

### Observe Multiple Scenes

```typescript
// All observed scenes appear in the tree
probe.observeScene(mainScene);
probe.observeScene(uiScene);
probe.observeScene(backgroundScene);
```

## Customization

### Panel Size

The Scene Explorer panel has a default width of 560px and uses auto-height with a maximum of 450px before scrolling.

### Custom Panel Position

```typescript
// Panels can be dragged to any position
// Position is preserved during the session
```

## Best Practices

1. **Name your objects** - Named objects are easier to find in the tree
   ```typescript
   mesh.name = 'PlayerCharacter';
   group.name = 'EnemySpawner';
   ```

2. **Use Groups for organization** - Logical grouping makes navigation easier
   ```typescript
   const enemies = new THREE.Group();
   enemies.name = 'Enemies';
   scene.add(enemies);
   ```

3. **Hide debug objects** - Use visibility toggles to hide helpers during inspection

4. **Monitor cost indicators** - Red indicators suggest optimization opportunities

## Related

- [Object Inspector Panel](./object-inspector-panel.md)
- [Selection API](../core/selection-api.md)
- [Scene Observer](../core/scene-observer.md)
