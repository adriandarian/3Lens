/**
 * Virtual Scrolling Utility
 *
 * Provides efficient rendering for large lists by only rendering
 * visible items in the viewport. Essential for scene trees with
 * thousands of objects.
 *
 * @module utils/virtual-scroll
 */

/**
 * Flattened tree node for virtual scrolling
 */
export interface FlattenedNode<T> {
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

/**
 * Configuration options for VirtualScroller
 */
export interface VirtualScrollerOptions<T> {
  /** Fixed height of each row in pixels */
  rowHeight: number;
  /** Number of rows to render above/below viewport for smooth scrolling */
  overscan?: number;
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

/**
 * Virtual scroll state
 */
export interface VirtualScrollState {
  /** Current scroll position */
  scrollTop: number;
  /** Container height */
  containerHeight: number;
  /** Total content height */
  totalHeight: number;
  /** First visible row index */
  startIndex: number;
  /** Last visible row index */
  endIndex: number;
  /** Total row count */
  totalRows: number;
}

/**
 * VirtualScroller - Efficient rendering for large hierarchical lists
 *
 * @example
 * ```typescript
 * const scroller = new VirtualScroller({
 *   rowHeight: 28,
 *   container: treeContainer,
 *   getId: (node) => node.ref.debugId,
 *   getChildren: (node) => node.children,
 *   isExpanded: (id) => expandedNodes.has(id),
 *   renderRow: (node, index) => renderTreeNode(node),
 * });
 *
 * scroller.setData(sceneNodes);
 * scroller.render();
 * ```
 */
export class VirtualScroller<T> {
  private readonly rowHeight: number;
  private readonly overscan: number;
  private readonly container: HTMLElement;
  private readonly getId: (node: T) => string;
  private readonly getChildren: (node: T) => T[];
  private readonly isExpanded: (id: string) => boolean;
  private readonly renderRow: (node: FlattenedNode<T>, index: number) => string;
  private readonly onScrollCallback?: (scrollTop: number) => void;

  private rootNodes: T[] = [];
  private flattenedNodes: FlattenedNode<T>[] = [];
  private scrollTop = 0;
  private containerHeight = 0;
  private scrollContainer: HTMLElement | null = null;
  private contentContainer: HTMLElement | null = null;
  private rowsContainer: HTMLElement | null = null;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private lastRenderRange: { start: number; end: number } | null = null;

  constructor(options: VirtualScrollerOptions<T>) {
    this.rowHeight = options.rowHeight;
    this.overscan = options.overscan ?? 5;
    this.container = options.container;
    this.getId = options.getId;
    this.getChildren = options.getChildren;
    this.isExpanded = options.isExpanded;
    this.renderRow = options.renderRow;
    this.onScrollCallback = options.onScroll;

    this.setupDOM();
    this.setupEventListeners();
  }

  /**
   * Set the root data nodes
   */
  setData(nodes: T[]): void {
    this.rootNodes = nodes;
    this.rebuildFlattenedList();
    this.render();
  }

  /**
   * Rebuild the flattened node list (call after expand/collapse changes)
   */
  rebuildFlattenedList(): void {
    this.flattenedNodes = [];
    this.flattenNodes(this.rootNodes, 0, null);
  }

  /**
   * Recursively flatten tree nodes
   */
  private flattenNodes(
    nodes: T[],
    depth: number,
    parentId: string | null
  ): void {
    for (const node of nodes) {
      const id = this.getId(node);
      const children = this.getChildren(node);
      const hasChildren = children.length > 0;
      const isExpanded = hasChildren && this.isExpanded(id);

      const flatNode: FlattenedNode<T> = {
        data: node,
        id,
        depth,
        hasChildren,
        isExpanded,
        parentId,
        flatIndex: this.flattenedNodes.length,
      };

      this.flattenedNodes.push(flatNode);

      if (isExpanded) {
        this.flattenNodes(children, depth + 1, id);
      }
    }
  }

  /**
   * Setup the DOM structure for virtual scrolling
   */
  private setupDOM(): void {
    // Clear container
    this.container.innerHTML = '';

    // Create scroll container (handles scroll events)
    this.scrollContainer = document.createElement('div');
    this.scrollContainer.className = 'virtual-scroll-container';
    this.scrollContainer.style.cssText = `
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    `;

    // Create content container (provides total height for scrollbar)
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'virtual-scroll-content';
    this.contentContainer.style.cssText = `
      position: relative;
      width: 100%;
    `;

    // Create rows container (positioned absolutely for visible rows)
    this.rowsContainer = document.createElement('div');
    this.rowsContainer.className = 'virtual-scroll-rows';
    this.rowsContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    `;

    this.contentContainer.appendChild(this.rowsContainer);
    this.scrollContainer.appendChild(this.contentContainer);
    this.container.appendChild(this.scrollContainer);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.scrollContainer) return;

    // Scroll handler with throttling via requestAnimationFrame
    this.scrollContainer.addEventListener('scroll', this.handleScroll, {
      passive: true,
    });

    // Resize observer for container size changes
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.containerHeight = entry.contentRect.height;
        this.scheduleRender();
      }
    });
    this.resizeObserver.observe(this.scrollContainer);

    // Initial container height
    this.containerHeight = this.scrollContainer.clientHeight;
  }

  /**
   * Handle scroll events
   */
  private handleScroll = (): void => {
    if (!this.scrollContainer) return;
    this.scrollTop = this.scrollContainer.scrollTop;
    this.scheduleRender();
    this.onScrollCallback?.(this.scrollTop);
  };

  /**
   * Schedule a render on the next animation frame
   */
  private scheduleRender(): void {
    if (this.animationFrameId !== null) return;
    this.animationFrameId = requestAnimationFrame(() => {
      this.animationFrameId = null;
      this.render();
    });
  }

  /**
   * Calculate visible range
   */
  private getVisibleRange(): { start: number; end: number } {
    const totalRows = this.flattenedNodes.length;
    if (totalRows === 0) {
      return { start: 0, end: 0 };
    }

    const visibleRowCount = Math.ceil(this.containerHeight / this.rowHeight);
    const startIndex = Math.floor(this.scrollTop / this.rowHeight);

    // Apply overscan for smooth scrolling
    const start = Math.max(0, startIndex - this.overscan);
    const end = Math.min(
      totalRows,
      startIndex + visibleRowCount + this.overscan
    );

    return { start, end };
  }

  /**
   * Render the visible rows
   */
  render(): void {
    if (!this.contentContainer || !this.rowsContainer) return;

    const totalRows = this.flattenedNodes.length;
    const totalHeight = totalRows * this.rowHeight;

    // Update content height for scrollbar
    this.contentContainer.style.height = `${totalHeight}px`;

    // Calculate visible range
    const { start, end } = this.getVisibleRange();

    // Skip render if range hasn't changed
    if (
      this.lastRenderRange &&
      this.lastRenderRange.start === start &&
      this.lastRenderRange.end === end
    ) {
      return;
    }
    this.lastRenderRange = { start, end };

    // Position rows container at the start offset
    const offsetY = start * this.rowHeight;
    this.rowsContainer.style.transform = `translateY(${offsetY}px)`;

    // Render visible rows
    const visibleNodes = this.flattenedNodes.slice(start, end);
    const html = visibleNodes
      .map((node, i) => this.renderRow(node, start + i))
      .join('');

    this.rowsContainer.innerHTML = html;
  }

  /**
   * Get the current scroll state
   */
  getState(): VirtualScrollState {
    const { start, end } = this.getVisibleRange();
    return {
      scrollTop: this.scrollTop,
      containerHeight: this.containerHeight,
      totalHeight: this.flattenedNodes.length * this.rowHeight,
      startIndex: start,
      endIndex: end,
      totalRows: this.flattenedNodes.length,
    };
  }

  /**
   * Scroll to a specific row by index
   */
  scrollToIndex(
    index: number,
    align: 'start' | 'center' | 'end' = 'start'
  ): void {
    if (!this.scrollContainer) return;

    const targetRow = Math.max(
      0,
      Math.min(index, this.flattenedNodes.length - 1)
    );
    let scrollTop: number;

    switch (align) {
      case 'start':
        scrollTop = targetRow * this.rowHeight;
        break;
      case 'center':
        scrollTop =
          targetRow * this.rowHeight -
          this.containerHeight / 2 +
          this.rowHeight / 2;
        break;
      case 'end':
        scrollTop = (targetRow + 1) * this.rowHeight - this.containerHeight;
        break;
    }

    this.scrollContainer.scrollTop = Math.max(0, scrollTop);
  }

  /**
   * Scroll to a specific node by ID
   */
  scrollToId(id: string, align: 'start' | 'center' | 'end' = 'center'): void {
    const index = this.flattenedNodes.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.scrollToIndex(index, align);
    }
  }

  /**
   * Get a flattened node by ID
   */
  getNodeById(id: string): FlattenedNode<T> | undefined {
    return this.flattenedNodes.find((n) => n.id === id);
  }

  /**
   * Get all flattened nodes
   */
  getNodes(): ReadonlyArray<FlattenedNode<T>> {
    return this.flattenedNodes;
  }

  /**
   * Update and re-render (call after expand/collapse)
   */
  update(): void {
    this.rebuildFlattenedList();
    this.render();
  }

  /**
   * Force a full re-render
   */
  forceRender(): void {
    this.lastRenderRange = null;
    this.render();
  }

  /**
   * Dispose of the virtual scroller
   */
  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.container.innerHTML = '';
  }
}

/**
 * CSS styles for virtual scrolling (to be injected)
 */
export const VIRTUAL_SCROLL_STYLES = `
/* Virtual scroll container */
.virtual-scroll-container {
  contain: strict;
}

/* Virtual scroll rows - use will-change for GPU acceleration */
.virtual-scroll-rows {
  will-change: transform;
}

/* Virtual tree node - fixed height for calculations */
.virtual-tree-node {
  height: var(--virtual-row-height, 28px);
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

/* Indentation based on depth */
.virtual-tree-node[data-depth="0"] { padding-left: 8px; }
.virtual-tree-node[data-depth="1"] { padding-left: 24px; }
.virtual-tree-node[data-depth="2"] { padding-left: 40px; }
.virtual-tree-node[data-depth="3"] { padding-left: 56px; }
.virtual-tree-node[data-depth="4"] { padding-left: 72px; }
.virtual-tree-node[data-depth="5"] { padding-left: 88px; }
.virtual-tree-node[data-depth="6"] { padding-left: 104px; }
.virtual-tree-node[data-depth="7"] { padding-left: 120px; }
.virtual-tree-node[data-depth="8"] { padding-left: 136px; }
.virtual-tree-node[data-depth="9"] { padding-left: 152px; }
.virtual-tree-node[data-depth="10"] { padding-left: 168px; }

/* Deep nesting fallback - calculate padding dynamically */
.virtual-tree-node {
  padding-left: calc(8px + var(--depth, 0) * 16px);
}
`;

/**
 * Helper to determine if virtual scrolling should be used
 * based on node count threshold
 */
export function shouldUseVirtualScrolling(
  nodeCount: number,
  threshold: number = 100
): boolean {
  return nodeCount >= threshold;
}

/**
 * Count total nodes in a tree (including all nested children)
 * Works with any node that has a 'children' array property
 */
export function countTreeNodes<T extends { children: T[] }>(node: T): number {
  let count = 1; // Count the node itself

  for (const child of node.children) {
    count += countTreeNodes(child);
  }

  return count;
}
