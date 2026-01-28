---
title: Scene Inspection Guide
description: Navigate and inspect your Three.js scene graph using 3Lens Scene Explorer and object inspection
---

# Scene Inspection Guide

This guide covers how to navigate and inspect your Three.js scene graph using 3Lens's Scene Explorer and object inspection features.

## Table of Contents

- [Overview](#overview)
- [Scene Explorer Panel](#scene-explorer-panel)
- [Tree Navigation](#tree-navigation)
- [Object Selection](#object-selection)
- [Object Inspector](#object-inspector)
- [Search and Filter](#search-and-filter)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Performance Tips](#performance-tips)

---

## Overview

The Scene Explorer provides a hierarchical view of your entire Three.js scene graph. It displays:

- All scenes being observed
- Every object in the hierarchy (meshes, lights, cameras, groups, etc.)
- Object names, types, and visibility states
- Performance cost indicators for meshes
- Selection and hover highlighting

```typescript
// The probe automatically tracks all observed scenes
probe.observeScene(scene, { name: 'Main Scene' });
probe.observeScene(uiScene, { name: 'UI Layer' });
```

---

## Scene Explorer Panel

### Opening the Scene Explorer

1. Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac) to toggle the overlay
2. Click the **Scene** tab in the panel header
3. The tree view displays all observed scenes

### Tree Structure

The scene tree mirrors your Three.js hierarchy:

```
🎬 Main Scene
├── 📁 World
│   ├── 🔷 Ground (Mesh)
│   ├── 💡 Sun (DirectionalLight)
│   └── 📁 Buildings
│       ├── 🔷 Tower (Mesh)
│       └── 🔷 House (Mesh)
├── 📁 Characters
│   ├── 🔷 Player (Mesh)
│   └── 🔷 Enemy (Mesh)
└── 📷 MainCamera (PerspectiveCamera)
```

### Object Type Icons

| Icon | Type |
|------|------|
| 🎬 | Scene |
| 📁 | Group / Object3D |
| 🔷 | Mesh |
| 💡 | Light (any type) |
| 📷 | Camera |
| 🦴 | Bone / SkinnedMesh |
| 🔊 | Audio |
| 📦 | Other Object3D |

### Cost Indicators

Meshes display performance cost indicators based on complexity:

- 🟢 **Low** - Under 1,000 triangles
- 🟡 **Medium** - 1,000 - 10,000 triangles  
- 🟠 **High** - 10,000 - 100,000 triangles
- 🔴 **Critical** - Over 100,000 triangles

---

## Tree Navigation

### Expand/Collapse Nodes

- Click the **▶** arrow to expand a node and show children
- Click **▼** to collapse and hide children
- Double-click a node name to toggle expansion

### Expand/Collapse All

```typescript
// Programmatically expand all nodes
probe.expandAllNodes();

// Collapse all nodes
probe.collapseAllNodes();

// Expand to reveal a specific object
probe.revealObject(myMesh.uuid);
```

### Virtual Scrolling

For scenes with thousands of objects, 3Lens uses virtual scrolling to maintain 60 FPS:

- Only visible nodes are rendered to the DOM
- Smooth scrolling through massive hierarchies
- Automatic activation for trees > 100 nodes

---

## Object Selection

### Selecting Objects

**In the Scene Explorer:**
- Click any node to select it
- The object is highlighted in the 3D view with a bounding box

**In the 3D View (Inspect Mode):**
- Enable Inspect Mode with `I` key or the toolbar button
- Hover over objects to see highlights
- Click to select

**Programmatically:**
```typescript
// Select by UUID
probe.selectObject(mesh.uuid);

// Clear selection
probe.clearSelection();

// Listen for selection changes
probe.onSelectionChange((node) => {
  if (node) {
    console.log('Selected:', node.name, node.uuid);
  }
});
```

### Multi-Selection

Hold `Ctrl` (or `Cmd` on Mac) to select multiple objects:

```typescript
// Get all selected objects
const selected = probe.getSelectedObjects();
console.log(`${selected.length} objects selected`);
```

### Selection Highlighting

When an object is selected:
- A blue wireframe box shows the bounding box
- The tree node is highlighted
- The Inspector panel shows object details

---

## Object Inspector

When an object is selected, the Inspector panel shows:

### Transform Section

```
Position: X: 0.00  Y: 1.50  Z: 0.00
Rotation: X: 0°    Y: 45°   Z: 0°
Scale:    X: 1.00  Y: 1.00  Z: 1.00
```

Edit values directly by clicking and typing, or drag to scrub.

### Object Info

```
Name:     PlayerCharacter
Type:     Mesh
UUID:     abc123-def456...
Visible:  ✓
Frustum:  In View
```

### Mesh Data (for Meshes)

```
Geometry:  BufferGeometry
Vertices:  1,234
Triangles: 2,048
Material:  MeshStandardMaterial
Draw Cost: Medium 🟡
```

### Material Preview

For meshes, see a preview of the applied material with:
- Color / map thumbnails
- Key properties (roughness, metalness, etc.)
- Click to open Material Editor

### Hierarchy Info

```
Parent:   World
Children: 3
Path:     Scene > World > Characters > Player
```

---

## Search and Filter

### Quick Search

Press `/` or click the search icon to filter the tree:

```
Search: "player"
```

Results show matching nodes with their parents expanded.

### Filter by Type

Filter to show only specific object types:

```typescript
// Show only meshes
probe.setTreeFilter({ types: ['Mesh'] });

// Show meshes and lights
probe.setTreeFilter({ types: ['Mesh', 'Light'] });

// Clear filter
probe.clearTreeFilter();
```

### Filter by Visibility

```typescript
// Show only visible objects
probe.setTreeFilter({ visibleOnly: true });

// Show only hidden objects
probe.setTreeFilter({ visibleOnly: false });
```

### Filter by Module/Tag

If using logical entities:

```typescript
// Show only objects from a specific module
probe.setTreeFilter({ module: '@game/characters' });

// Show objects with specific tags
probe.setTreeFilter({ tags: ['enemy', 'ai-controlled'] });
```

---

## Keyboard Shortcuts

### Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move selection up/down |
| `←` | Collapse node or go to parent |
| `→` | Expand node or go to first child |
| `Home` | Go to first node |
| `End` | Go to last visible node |
| `Enter` | Toggle expand/collapse |

### Selection

| Key | Action |
|-----|--------|
| `I` | Toggle Inspect Mode |
| `Escape` | Clear selection |
| `F` | Focus camera on selected object |
| `H` | Toggle visibility of selected |
| `Delete` | Remove selected (if enabled) |

### Tree Actions

| Key | Action |
|-----|--------|
| `/` | Open search |
| `Ctrl+E` | Expand all |
| `Ctrl+Shift+E` | Collapse all |
| `Ctrl+F` | Find in tree |

---

## Performance Tips

### Large Scenes

For scenes with 10,000+ objects:

1. **Use logical entities** to group related objects:
   ```typescript
   probe.registerLogicalEntity(enemyGroup, {
     name: 'Enemy Squad',
     module: '@game/enemies',
   });
   ```

2. **Filter aggressively** to focus on relevant objects

3. **Collapse unnecessary branches** to reduce rendered nodes

### Snapshot Frequency

Control how often the tree updates:

```typescript
// Update tree every 500ms instead of every frame
probe.setConfig({
  sampling: {
    snapshotInterval: 500,
  },
});
```

### Disable During Production

```typescript
if (process.env.NODE_ENV === 'production') {
  // Don't initialize 3Lens
  return;
}
```

---

## Code Examples

### Custom Tree Renderer

```typescript
// Get the current scene snapshot
const snapshot = probe.takeSnapshot();

// Traverse the tree
function renderTree(node: SceneNode, depth = 0) {
  const indent = '  '.repeat(depth);
  const icon = getIcon(node.type);
  
  console.log(`${indent}${icon} ${node.name || node.type}`);
  
  for (const child of node.children) {
    renderTree(child, depth + 1);
  }
}

for (const scene of snapshot.scenes) {
  renderTree(scene);
}
```

### Find Object by Path

```typescript
function findByPath(path: string): SceneNode | null {
  const parts = path.split(' > ');
  const snapshot = probe.takeSnapshot();
  
  let current: SceneNode | null = null;
  
  for (const scene of snapshot.scenes) {
    if (scene.name === parts[0]) {
      current = scene;
      break;
    }
  }
  
  for (let i = 1; i < parts.length && current; i++) {
    current = current.children.find(c => c.name === parts[i]) || null;
  }
  
  return current;
}

const player = findByPath('Main Scene > Characters > Player');
```

### Export Scene Structure

```typescript
function exportStructure(node: SceneNode): object {
  return {
    name: node.name,
    type: node.type,
    visible: node.visible,
    children: node.children.map(exportStructure),
  };
}

const structure = exportStructure(snapshot.scenes[0]);
console.log(JSON.stringify(structure, null, 2));
```

---

## Related Guides

- [Performance Debugging Guide](./PERFORMANCE-DEBUGGING-GUIDE.md)
- [Transform Gizmos Guide](./TRANSFORM-GIZMOS-GUIDE.md)
- [Camera Controls Guide](./CAMERA-CONTROLS-GUIDE.md)

## API Reference

- [SceneNode Interface](/api/core/scene-node)
- [SceneObserver](/api/core/scene-observer)
- [Scene Explorer Panel](/api/overlay/scene-explorer-panel)
- [VirtualScroller](/api/ui/virtual-scroller)
