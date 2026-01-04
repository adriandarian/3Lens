# Scene Path Computation

Scene paths provide human-readable hierarchical locations for Three.js objects. They're used for navigation, filtering, and debugging in the 3Lens devtools.

## Overview

```typescript
// Scene structure:
// Scene
//   └── World
//       └── Characters
//           └── Player
//               └── WeaponMount
//                   └── Sword

const swordRef = probe.getObjectRef(sword);
console.log(swordRef.path);
// "/Scene/World/Characters/Player/WeaponMount/Sword"
```

## Path Format

```
┌─────────────────────────────────────────────────────────────┐
│ Path Format                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   /Scene/World/Characters/Player                            │
│   │ │     │     │          │                                │
│   │ │     │     │          └── Object name: "Player"        │
│   │ │     │     └── Object name: "Characters"               │
│   │ │     └── Object name: "World"                          │
│   │ └── Object name: "Scene" (or type if unnamed)           │
│   └── Root separator                                        │
│                                                             │
│ Format: "/" + segments.join("/")                            │
│ Segment: object.name || "<" + object.type + ">"             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Path Algorithm

The path computation walks up the object hierarchy:

```typescript
function computePath(obj: THREE.Object3D): string {
  const parts: string[] = [];
  let current: THREE.Object3D | null = obj;

  while (current) {
    // Use name if available, otherwise type in angle brackets
    parts.unshift(current.name || `<${current.type}>`);
    current = current.parent;
  }

  return '/' + parts.join('/');
}
```

### Examples

| Scene Structure | Path |
|-----------------|------|
| Named object | `/Scene/World/Player` |
| Unnamed object | `/Scene/World/<Mesh>` |
| Mixed | `/Scene/<Group>/Player` |
| Root scene | `/MyScene` |
| Deeply nested | `/Scene/Level1/Area2/Room3/Object` |

## Naming Conventions

### Named Objects

When objects have names, paths are human-readable:

```typescript
const scene = new THREE.Scene();
scene.name = 'GameScene';

const world = new THREE.Group();
world.name = 'World';
scene.add(world);

const player = new THREE.Mesh(geo, mat);
player.name = 'Player';
world.add(player);

// Path: "/GameScene/World/Player"
```

### Unnamed Objects

Unnamed objects use their type in angle brackets:

```typescript
const scene = new THREE.Scene();
// scene.name not set

const group = new THREE.Group();
// group.name not set
scene.add(group);

const mesh = new THREE.Mesh(geo, mat);
// mesh.name not set
group.add(mesh);

// Path: "/<Scene>/<Group>/<Mesh>"
```

### Mixed Naming

```typescript
scene.name = 'MyScene';
// group unnamed
group.add(player);
player.name = 'Player';

// Path: "/MyScene/<Group>/Player"
```

## Usage Examples

### Path-Based Filtering

```typescript
// Find all objects under "World/Characters"
function findByPathPrefix(
  snapshot: SceneSnapshot, 
  prefix: string
): SceneNode[] {
  const results: SceneNode[] = [];
  
  function traverse(node: SceneNode) {
    if (node.ref.path?.startsWith(prefix)) {
      results.push(node);
    }
    node.children.forEach(traverse);
  }
  
  snapshot.scenes.forEach(traverse);
  return results;
}

const characters = findByPathPrefix(snapshot, '/Scene/World/Characters');
```

### Path Pattern Matching

```typescript
// Find objects matching a glob pattern
function matchPath(path: string, pattern: string): boolean {
  // Convert glob to regex
  const regex = new RegExp(
    '^' + pattern
      .replace(/\*/g, '[^/]*')      // * matches segment
      .replace(/\*\*/g, '.*')        // ** matches any depth
      .replace(/\//g, '\\/')
    + '$'
  );
  return regex.test(path);
}

// Find all "Player" objects at any depth
const players = allNodes.filter((node) => 
  matchPath(node.ref.path || '', '**/Player')
);

// Find direct children of World
const worldChildren = allNodes.filter((node) =>
  matchPath(node.ref.path || '', '/Scene/World/*')
);
```

### Breadcrumb Navigation

```typescript
interface Breadcrumb {
  label: string;
  path: string;
}

function pathToBreadcrumbs(path: string): Breadcrumb[] {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [];
  
  let currentPath = '';
  for (const segment of segments) {
    currentPath += '/' + segment;
    breadcrumbs.push({
      label: segment.replace(/<(.+)>/, '$1'), // Strip angle brackets
      path: currentPath,
    });
  }
  
  return breadcrumbs;
}

// Path: "/Scene/World/Characters/Player"
// Result: [
//   { label: "Scene", path: "/Scene" },
//   { label: "World", path: "/Scene/World" },
//   { label: "Characters", path: "/Scene/World/Characters" },
//   { label: "Player", path: "/Scene/World/Characters/Player" }
// ]
```

### Search by Path Segment

```typescript
function searchByName(
  nodes: SceneNode[], 
  query: string
): SceneNode[] {
  const lowerQuery = query.toLowerCase();
  
  return nodes.filter((node) => {
    const path = node.ref.path || '';
    const segments = path.split('/');
    
    return segments.some((segment) => 
      segment.toLowerCase().includes(lowerQuery)
    );
  });
}

// Search for "player" - matches:
// "/Scene/World/Player"
// "/Scene/World/PlayerController"
// "/Scene/World/NPCs/EnemyPlayer"
```

## Path Updates

Paths can change when:

1. **Object renamed**: Name property changed
2. **Reparented**: Object moved to different parent
3. **Parent renamed**: Ancestor name changed

```typescript
// Initial: "/Scene/World/Player"

// After renaming
player.name = 'Hero';
// Now: "/Scene/World/Hero"

// After reparenting
world.remove(player);
enemies.add(player);
// Now: "/Scene/Enemies/Hero"
```

::: warning Path Stability
Don't use paths as unique identifiers. Use `debugId` instead, which remains stable regardless of naming or hierarchy changes.
:::

## Performance Considerations

Path computation walks up the hierarchy:

| Depth | Cost |
|-------|------|
| 1 | ~0.001ms |
| 5 | ~0.005ms |
| 10 | ~0.01ms |
| 50 | ~0.05ms |

Paths are computed once when objects are first tracked and cached in the `TrackedObjectRef`.

## Best Practices

### 1. Name Important Objects

```typescript
// ✅ Good - clear paths
player.name = 'Player';
weapon.name = 'Sword';
// Path: "/Scene/World/Player/Sword"

// ❌ Unclear - generic paths
// Path: "/<Scene>/<Group>/<Mesh>/<Mesh>"
```

### 2. Use Consistent Naming Conventions

```typescript
// ✅ Consistent naming
scene.name = 'MainScene';
world.name = 'World';
player.name = 'Player';
enemy.name = 'Enemy_001';

// ❌ Inconsistent
scene.name = 'my-scene';
world.name = 'WORLD';
player.name = 'player_mesh';
```

### 3. Group Related Objects

```typescript
// ✅ Organized hierarchy
// /Scene/World/Characters/Player
// /Scene/World/Characters/NPC_001
// /Scene/World/Environment/Trees
// /Scene/World/Environment/Rocks

// ❌ Flat structure
// /Scene/Player
// /Scene/NPC_001
// /Scene/Tree_001
// /Scene/Rock_001
```

### 4. Use Paths for Debug Logging

```typescript
function logObjectInfo(ref: TrackedObjectRef) {
  console.log(`[${ref.path}] Type: ${ref.type}, ID: ${ref.debugId}`);
}

// Output: "[/Scene/World/Player] Type: Mesh, ID: obj_abc123"
```

## Type Definition

```typescript
// Path is included in TrackedObjectRef
interface TrackedObjectRef {
  debugId: string;
  threeUuid: string;
  type: string;
  name?: string;
  path?: string;  // Scene path
}
```

## Related

- [TrackedObjectRef](./tracked-object-ref) - Contains the `path` property
- [SceneObserver](./scene-observer) - Computes paths during tracking
- [SceneNode](./scene-node) - Tree structure with path references
- [observeScene()](./observe-scene) - High-level scene observation
