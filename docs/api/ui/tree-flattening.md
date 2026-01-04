# Tree Flattening Utilities

The tree flattening utilities convert hierarchical scene tree data into flat arrays for efficient rendering and traversal. This is used by the `VirtualScroller` and scene navigation components.

## Import

```typescript
import { 
  VirtualScroller,
  type FlattenedNode,
  countTreeNodes
} from '@3lens/overlay/utils/virtual-scroll';
```

## Overview

Scene trees in Three.js can be deeply nested with thousands of objects. Flattening converts this hierarchy into a sequential list while preserving:

- **Depth information** - Nesting level for indentation
- **Parent relationships** - Track ancestry for expand/collapse
- **Expansion state** - Only include visible nodes
- **Original data** - Reference to source node

## How Flattening Works

Given a tree structure:

```
Scene
├── Group
│   ├── Mesh A
│   └── Mesh B
└── Light
```

When fully expanded, flattening produces:

```typescript
[
  { data: Scene, depth: 0, id: 's1', hasChildren: true, isExpanded: true },
  { data: Group, depth: 1, id: 'g1', hasChildren: true, isExpanded: true, parentId: 's1' },
  { data: MeshA, depth: 2, id: 'm1', hasChildren: false, parentId: 'g1' },
  { data: MeshB, depth: 2, id: 'm2', hasChildren: false, parentId: 'g1' },
  { data: Light, depth: 1, id: 'l1', hasChildren: false, parentId: 's1' },
]
```

When Group is collapsed:

```typescript
[
  { data: Scene, depth: 0, id: 's1', hasChildren: true, isExpanded: true },
  { data: Group, depth: 1, id: 'g1', hasChildren: true, isExpanded: false, parentId: 's1' },
  { data: Light, depth: 1, id: 'l1', hasChildren: false, parentId: 's1' },
]
```

## FlattenedNode Structure

```typescript
interface FlattenedNode<T> {
  /** The original node data */
  data: T;
  
  /** Unique identifier for this node */
  id: string;
  
  /** Nesting depth level (0 = root) */
  depth: number;
  
  /** Whether this node has children */
  hasChildren: boolean;
  
  /** Whether this node is expanded (children visible) */
  isExpanded: boolean;
  
  /** Parent node ID (null for root nodes) */
  parentId: string | null;
  
  /** Index in the flattened list */
  flatIndex: number;
}
```

## Manual Tree Flattening

If you need to flatten trees without `VirtualScroller`:

```typescript
interface SceneNode {
  name: string;
  id: string;
  children: SceneNode[];
}

interface FlatNode {
  node: SceneNode;
  depth: number;
  parentId: string | null;
}

function flattenTree(
  nodes: SceneNode[],
  expandedIds: Set<string>,
  depth = 0,
  parentId: string | null = null
): FlatNode[] {
  const result: FlatNode[] = [];
  
  for (const node of nodes) {
    result.push({ node, depth, parentId });
    
    if (node.children.length > 0 && expandedIds.has(node.id)) {
      result.push(...flattenTree(
        node.children, 
        expandedIds, 
        depth + 1, 
        node.id
      ));
    }
  }
  
  return result;
}
```

## Usage Example

```typescript
// Scene tree data
const sceneTree: SceneNode[] = [
  {
    id: 'scene',
    name: 'Scene',
    children: [
      {
        id: 'group',
        name: 'Player',
        children: [
          { id: 'mesh1', name: 'Body', children: [] },
          { id: 'mesh2', name: 'Head', children: [] },
        ],
      },
      { id: 'light', name: 'Sun', children: [] },
    ],
  },
];

// Track which nodes are expanded
const expandedIds = new Set(['scene', 'group']);

// Flatten the tree
const flatNodes = flattenTree(sceneTree, expandedIds);

// Render as flat list with indentation
flatNodes.forEach((item, index) => {
  const indent = '  '.repeat(item.depth);
  console.log(`${index}: ${indent}${item.node.name}`);
});

// Output:
// 0: Scene
// 1:   Player
// 2:     Body
// 3:     Head
// 4:   Sun
```

## Counting Tree Nodes

The `countTreeNodes` helper counts all nodes in a tree:

```typescript
import { countTreeNodes } from '@3lens/overlay/utils/virtual-scroll';

interface TreeNode {
  children: TreeNode[];
}

// Count all nodes including nested children
const totalNodes = countTreeNodes(rootNode);

// Count across multiple root nodes
const totalInScene = sceneRoots.reduce(
  (sum, root) => sum + countTreeNodes(root), 
  0
);
```

### Implementation

```typescript
function countTreeNodes<T extends { children: T[] }>(node: T): number {
  let count = 1; // Count the node itself
  
  for (const child of node.children) {
    count += countTreeNodes(child);
  }
  
  return count;
}
```

## Finding Nodes

### Find by ID

```typescript
function findNodeById(
  nodes: SceneNode[],
  targetId: string
): SceneNode | null {
  for (const node of nodes) {
    if (node.id === targetId) return node;
    
    const found = findNodeById(node.children, targetId);
    if (found) return found;
  }
  return null;
}
```

### Find Path to Node

```typescript
function findPathToNode(
  nodes: SceneNode[],
  targetId: string,
  path: string[] = []
): string[] | null {
  for (const node of nodes) {
    const newPath = [...path, node.id];
    
    if (node.id === targetId) {
      return newPath;
    }
    
    const found = findPathToNode(node.children, targetId, newPath);
    if (found) return found;
  }
  return null;
}

// Expand all ancestors to reveal a node
function revealNode(targetId: string, expandedIds: Set<string>) {
  const path = findPathToNode(sceneTree, targetId);
  if (path) {
    // Add all ancestors (excluding target) to expanded set
    path.slice(0, -1).forEach(id => expandedIds.add(id));
  }
}
```

### Get Ancestors

```typescript
function getAncestorIds(
  flatNodes: FlatNode[],
  nodeId: string
): string[] {
  const ancestors: string[] = [];
  let current = flatNodes.find(n => n.node.id === nodeId);
  
  while (current?.parentId) {
    ancestors.push(current.parentId);
    current = flatNodes.find(n => n.node.id === current!.parentId);
  }
  
  return ancestors;
}
```

## Filtering Flattened Lists

### Search Filter

```typescript
function filterFlatNodes(
  flatNodes: FlatNode[],
  searchTerm: string
): FlatNode[] {
  if (!searchTerm) return flatNodes;
  
  const term = searchTerm.toLowerCase();
  const matchingIds = new Set<string>();
  
  // Find all matching nodes
  for (const item of flatNodes) {
    if (item.node.name.toLowerCase().includes(term)) {
      matchingIds.add(item.node.id);
      
      // Include all ancestors to show hierarchy
      let parent = item.parentId;
      while (parent) {
        matchingIds.add(parent);
        const parentItem = flatNodes.find(n => n.node.id === parent);
        parent = parentItem?.parentId ?? null;
      }
    }
  }
  
  return flatNodes.filter(item => matchingIds.has(item.node.id));
}
```

### Type Filter

```typescript
function filterByType(
  flatNodes: FlatNode[],
  types: string[]
): FlatNode[] {
  const typeSet = new Set(types.map(t => t.toLowerCase()));
  
  return flatNodes.filter(item => 
    typeSet.has(item.node.type?.toLowerCase() ?? '')
  );
}

// Filter to show only meshes and lights
const filtered = filterByType(flatNodes, ['Mesh', 'Light']);
```

## Keyboard Navigation

Use flat index for keyboard navigation:

```typescript
let selectedIndex = 0;

function handleKeyDown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      selectedIndex = Math.min(selectedIndex + 1, flatNodes.length - 1);
      break;
      
    case 'ArrowUp':
      selectedIndex = Math.max(selectedIndex - 1, 0);
      break;
      
    case 'ArrowRight':
      // Expand current node
      const current = flatNodes[selectedIndex];
      if (current.node.children.length > 0) {
        expandedIds.add(current.node.id);
        flatNodes = flattenTree(sceneTree, expandedIds);
      }
      break;
      
    case 'ArrowLeft':
      // Collapse current or go to parent
      const node = flatNodes[selectedIndex];
      if (expandedIds.has(node.node.id)) {
        expandedIds.delete(node.node.id);
        flatNodes = flattenTree(sceneTree, expandedIds);
      } else if (node.parentId) {
        selectedIndex = flatNodes.findIndex(n => n.node.id === node.parentId);
      }
      break;
  }
  
  scrollToSelected();
}
```

## Performance Considerations

### Incremental Updates

For large trees, consider incremental updates instead of full re-flattening:

```typescript
// Track changes since last flatten
interface TreeChange {
  type: 'expand' | 'collapse' | 'add' | 'remove';
  nodeId: string;
}

function applyChange(flatNodes: FlatNode[], change: TreeChange): FlatNode[] {
  switch (change.type) {
    case 'expand':
      // Insert children after the node
      return insertChildren(flatNodes, change.nodeId);
      
    case 'collapse':
      // Remove all descendants
      return removeDescendants(flatNodes, change.nodeId);
      
    default:
      // Fall back to full re-flatten
      return flattenTree(sceneTree, expandedIds);
  }
}
```

### Lazy Flattening

For very deep trees, flatten on-demand:

```typescript
function flattenVisible(
  nodes: SceneNode[],
  expandedIds: Set<string>,
  visibleRange: { start: number; end: number }
): FlatNode[] {
  // Only flatten nodes that will be visible
  // Skip branches that are entirely outside the viewport
}
```

## Integration with VirtualScroller

The `VirtualScroller` handles flattening internally:

```typescript
// VirtualScroller automatically flattens the tree
const scroller = new VirtualScroller({
  container: element,
  rowHeight: 28,
  getId: (node) => node.id,
  getChildren: (node) => node.children,
  isExpanded: (id) => expandedIds.has(id),
  renderRow: (flatNode) => `
    <div style="padding-left: ${flatNode.depth * 16}px">
      ${flatNode.data.name}
    </div>
  `,
});

// Set data triggers initial flatten
scroller.setData(sceneTree);

// update() re-flattens after expansion changes
expandedIds.add('some-id');
scroller.update();
```

## See Also

- [VirtualScroller](./virtual-scroller) - Uses tree flattening for efficient rendering
- [Scene Explorer Panel](../overlay/scene-explorer-panel) - Uses flattened tree for scene navigation
- [Scene Node](../core/scene-node) - The data structure for scene tree nodes
