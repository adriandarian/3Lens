# VirtualScroller

The `VirtualScroller` class provides efficient rendering for large hierarchical lists by only rendering visible items in the viewport. This is essential for scene trees with thousands of objects.

## Import

```typescript
import { 
  VirtualScroller, 
  type FlattenedNode,
  type VirtualScrollerOptions,
  type VirtualScrollState,
  VIRTUAL_SCROLL_STYLES,
  shouldUseVirtualScrolling,
  countTreeNodes
} from '@3lens/overlay/utils/virtual-scroll';
```

## Overview

Virtual scrolling dramatically improves performance when displaying large lists by:

- **Rendering only visible items** - Instead of creating DOM elements for thousands of items, only items visible in the viewport are rendered
- **Recycling DOM elements** - As the user scrolls, DOM elements are repositioned rather than created/destroyed
- **GPU acceleration** - Uses CSS `transform` for smooth scrolling with hardware acceleration
- **Overscan buffering** - Renders extra items above/below the viewport for seamless scrolling

## VirtualScroller Class

### Constructor

```typescript
const scroller = new VirtualScroller<SceneNode>(options);
```

### Options

```typescript
interface VirtualScrollerOptions<T> {
  /** Fixed height of each row in pixels */
  rowHeight: number;
  
  /** Number of rows to render above/below viewport for smooth scrolling */
  overscan?: number;  // Default: 5
  
  /** Container element for the virtual scroller */
  container: HTMLElement;
  
  /** Function to get unique ID from a node */
  getId: (node: T) => string;
  
  /** Function to get children from a node */
  getChildren: (node: T) => T[];
  
  /** Function to check if a node is expanded */
  isExpanded: (id: string) => boolean;
  
  /** Function to render a single row */
  renderRow: (node: FlattenedNode<T>, index: number) => string;
  
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number) => void;
  
  /** Initial expanded node IDs */
  expandedIds?: Set<string>;
}
```

## Basic Usage

```typescript
import { VirtualScroller, type FlattenedNode } from '@3lens/overlay/utils/virtual-scroll';

// Track expanded nodes
const expandedNodes = new Set<string>();

// Create virtual scroller
const scroller = new VirtualScroller<SceneNode>({
  rowHeight: 28,
  container: document.getElementById('scene-tree')!,
  
  getId: (node) => node.ref.debugId,
  
  getChildren: (node) => node.children,
  
  isExpanded: (id) => expandedNodes.has(id),
  
  renderRow: (node, index) => `
    <div class="tree-node" 
         data-id="${node.id}" 
         data-depth="${node.depth}"
         style="padding-left: ${node.depth * 16 + 8}px">
      ${node.hasChildren 
        ? `<span class="toggle">${node.isExpanded ? '▼' : '▶'}</span>` 
        : ''}
      <span class="name">${node.data.name}</span>
    </div>
  `,
});

// Set data and render
scroller.setData(sceneNodes);
```

## FlattenedNode Interface

Each node in the virtual scroller is wrapped in a `FlattenedNode` structure:

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

## Methods

### setData(nodes)

Set the root data nodes and trigger a render.

```typescript
scroller.setData(sceneSnapshot.scenes);
```

### rebuildFlattenedList()

Rebuild the flattened node list. Call after expand/collapse changes.

```typescript
expandedNodes.add(nodeId);
scroller.rebuildFlattenedList();
scroller.render();
```

### render()

Render the visible rows. Called automatically on scroll/resize.

```typescript
scroller.render();
```

### update()

Rebuild and re-render in one call.

```typescript
// After toggling node expansion
scroller.update();
```

### forceRender()

Force a full re-render, ignoring cached range.

```typescript
scroller.forceRender();
```

### scrollToIndex(index, align?)

Scroll to a specific row by index.

```typescript
// Scroll to row 50, centered in view
scroller.scrollToIndex(50, 'center');

// Alignment options: 'start' | 'center' | 'end'
scroller.scrollToIndex(0, 'start');  // Scroll to top
```

### scrollToId(id, align?)

Scroll to a specific node by ID.

```typescript
// Scroll to selected object
scroller.scrollToId(selectedObjectId, 'center');
```

### getNodeById(id)

Get a flattened node by ID.

```typescript
const node = scroller.getNodeById('mesh-123');
if (node) {
  console.log(`Found at depth ${node.depth}, index ${node.flatIndex}`);
}
```

### getNodes()

Get all flattened nodes as a readonly array.

```typescript
const allNodes = scroller.getNodes();
console.log(`Total visible nodes: ${allNodes.length}`);
```

### getState()

Get the current scroll state.

```typescript
interface VirtualScrollState {
  scrollTop: number;
  containerHeight: number;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  totalRows: number;
}

const state = scroller.getState();
console.log(`Showing rows ${state.startIndex}-${state.endIndex} of ${state.totalRows}`);
```

### dispose()

Clean up event listeners and DOM elements.

```typescript
scroller.dispose();
```

## Expand/Collapse Pattern

Handle tree node expansion with the virtual scroller:

```typescript
const expandedNodes = new Set<string>();

// Toggle expansion
function toggleNode(nodeId: string) {
  if (expandedNodes.has(nodeId)) {
    expandedNodes.delete(nodeId);
  } else {
    expandedNodes.add(nodeId);
  }
  scroller.update(); // Rebuilds and re-renders
}

// Expand all ancestors to reveal a node
function revealNode(nodeId: string) {
  let node = scroller.getNodeById(nodeId);
  while (node && node.parentId) {
    expandedNodes.add(node.parentId);
    node = scroller.getNodeById(node.parentId);
  }
  scroller.update();
  scroller.scrollToId(nodeId, 'center');
}
```

## CSS Styles

The virtual scroller includes CSS styles that can be injected:

```typescript
import { VIRTUAL_SCROLL_STYLES } from '@3lens/overlay/utils/virtual-scroll';

// Inject styles into document
const style = document.createElement('style');
style.textContent = VIRTUAL_SCROLL_STYLES;
document.head.appendChild(style);
```

### Included Styles

```css
/* Virtual scroll container */
.virtual-scroll-container {
  contain: strict;
}

/* GPU-accelerated rows */
.virtual-scroll-rows {
  will-change: transform;
}

/* Fixed height tree nodes */
.virtual-tree-node {
  height: var(--virtual-row-height, 28px);
  display: flex;
  align-items: center;
}

/* Depth-based indentation (0-10 levels) */
.virtual-tree-node[data-depth="0"] { padding-left: 8px; }
.virtual-tree-node[data-depth="1"] { padding-left: 24px; }
/* ... up to depth 10 */
```

## Helper Functions

### shouldUseVirtualScrolling()

Determine if virtual scrolling should be used based on node count.

```typescript
import { shouldUseVirtualScrolling, countTreeNodes } from '@3lens/overlay/utils/virtual-scroll';

const totalNodes = sceneNodes.reduce((sum, scene) => sum + countTreeNodes(scene), 0);

if (shouldUseVirtualScrolling(totalNodes, 100)) {
  // Use VirtualScroller
} else {
  // Render all nodes directly
}
```

### countTreeNodes()

Count total nodes in a tree including all nested children.

```typescript
import { countTreeNodes } from '@3lens/overlay/utils/virtual-scroll';

const nodeCount = countTreeNodes(rootNode);
console.log(`Scene has ${nodeCount} total objects`);
```

## Performance Tips

### 1. Use Fixed Row Heights

Virtual scrolling requires fixed row heights for accurate calculations:

```typescript
// Good - consistent height
rowHeight: 28,

// Avoid - variable heights break scrolling
```

### 2. Memoize Render Functions

Cache expensive computations in the render function:

```typescript
const iconCache = new Map<string, string>();

const scroller = new VirtualScroller({
  renderRow: (node) => {
    let icon = iconCache.get(node.data.type);
    if (!icon) {
      icon = computeIcon(node.data.type);
      iconCache.set(node.data.type, icon);
    }
    return `<div>${icon} ${node.data.name}</div>`;
  },
});
```

### 3. Use Appropriate Overscan

Balance smoothness vs. DOM element count:

```typescript
// Smoother scrolling, more DOM elements
overscan: 10,

// Fewer DOM elements, may see flicker on fast scroll
overscan: 3,

// Good default balance
overscan: 5,
```

### 4. Batch Updates

Group multiple changes before updating:

```typescript
// Inefficient - multiple updates
expandedNodes.add(id1);
scroller.update();
expandedNodes.add(id2);
scroller.update();

// Better - single update
expandedNodes.add(id1);
expandedNodes.add(id2);
scroller.update();
```

## Integration with Scene Explorer

The 3Lens overlay uses VirtualScroller for the scene tree:

```typescript
// From Overlay.ts
private initVirtualScroller(): void {
  if (!this.virtualScroller) {
    this.virtualScroller = new VirtualScroller<SceneNode>({
      rowHeight: 28,
      container: treeContainer,
      getId: (node) => node.ref.debugId,
      getChildren: (node) => node.children,
      isExpanded: (id) => this.expandedNodes.has(id),
      renderRow: (node, index) => this.renderTreeNode(node),
    });
  }
  
  if (snapshot) {
    this.virtualScroller.setData(snapshot.scenes);
  }
}
```

## Browser Support

- Uses `ResizeObserver` for container size tracking
- Uses `requestAnimationFrame` for scroll throttling
- Supports all modern browsers (Chrome, Firefox, Safari, Edge)

## See Also

- [Scene Explorer Panel](../overlay/scene-explorer-panel) - Uses VirtualScroller for tree rendering
- [Performance Tracker](../core/performance-tracker) - Measure rendering performance
- [Scene Observer](../core/scene-observer) - Provides scene tree data
